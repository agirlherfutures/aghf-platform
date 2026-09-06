// api/agent-chat.js — the AGHF Agent's streaming conversation endpoint.
// Same JWT-verification pattern as every other endpoint in this project.
// Streams newline-delimited JSON events; see agihf/shared/agent-service.js
// for the client-side consumer and the wire-protocol event list.

import { createClient } from '@supabase/supabase-js';
import { streamChatCompletion, generateShortCompletion } from './_lib/ai-provider.js';
import { TOOL_SCHEMAS, executeTool } from './_lib/agent-tools.js';
import { buildTurnContext, renderContextBlocks } from './_lib/agent-context-builder.js';
import { buildSystemPrompt } from './_lib/agent-system-prompt.js';
import { scanForSafetyConcern } from '../shared/psychology-safety.js';
import { CRISIS_RESPONSE, TRADING_HARM_RESPONSE } from '../shared/psychology-safety-copy.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const DEFAULT_CONSENT = {
  tradeData: true, checklistAnswers: true, journalStructured: true, journalFreetext: true,
  emotions: true, sessionHistory: true, playbook: true, academyProgress: true,
};

const MAX_TOOL_LOOPS = 4;

function write(res, event) {
  res.write(JSON.stringify(event) + '\n');
}

/**
 * A screenshot attachment carries its base64 data inline for this one
 * call (never a signed URL — nothing member-scoped ever reaches
 * Anthropic's infrastructure via a link). The image itself is persisted
 * separately via agent-attachment.js; only a path reference, never the
 * bytes, is ever written into agent_messages.
 */
function buildUserContent(message, attachments) {
  const shot = attachments.find((a) => a.type === 'screenshot' && a.dataUrl);
  if (!shot) return message;
  const match = /^data:([^;]+);base64,(.+)$/.exec(shot.dataUrl);
  if (!match) return message;
  const [, mediaType, base64] = match;
  return [
    { type: 'text', text: message || 'What do you notice about this chart?' },
    { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
  ];
}

function safetyResponseText(copy) {
  return `${copy.heading}\n\n${copy.body}\n\n${copy.actions.map((a) => `• ${a.label}`).join('\n')}\n\n${copy.footer}`;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const userId = user.id;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const message = (body.message || '').toString();
  const responseMode = body.responseMode || 'coach_me';
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];
  const savePreference = body.savePreference || 'save';
  let conversationId = body.conversationId || null;
  const clientHistory = Array.isArray(body.clientHistory) ? body.clientHistory : [];

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  });

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    // ── Resolve conversation + prior history ──────────────────────
    let priorMessages = [];
    let isSaving = savePreference === 'save';

    if (conversationId) {
      const { data: convo, error: convoErr } = await supabase
        .from('agent_conversations').select('*').eq('id', conversationId).eq('user_id', userId).maybeSingle();
      if (convoErr || !convo) { write(res, { type: 'error', message: 'Conversation not found.' }); return res.end(); }
      isSaving = convo.save_status === 'saved';
      if (isSaving) {
        const { data: rows } = await supabase.from('agent_messages').select('role, content, tool_calls, tool_results')
          .eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(40);
        priorMessages = (rows || []).map((r) => ({ role: r.role, content: r.content }));
      }
    } else if (isSaving) {
      const { data: convo, error: createErr } = await supabase
        .from('agent_conversations').insert({ user_id: userId, response_mode: responseMode, save_status: 'saved' })
        .select('*').single();
      if (createErr) throw createErr;
      conversationId = convo.id;
    } else {
      priorMessages = clientHistory;
    }

    write(res, { type: 'message_start', conversationId });

    // ── Deterministic safety scan — before anything else, no AI call ──
    const safetyHit = scanForSafetyConcern(message);
    if (safetyHit) {
      const copy = safetyHit.category === 'crisis' ? CRISIS_RESPONSE : TRADING_HARM_RESPONSE;
      const text = safetyResponseText(copy);
      write(res, { type: 'safety_block', category: safetyHit.category });
      write(res, { type: 'text_delta', text });
      if (isSaving && conversationId) {
        await supabase.from('agent_messages').insert([
          { conversation_id: conversationId, user_id: userId, role: 'user', content: message, attached_record_refs: attachments },
          { conversation_id: conversationId, user_id: userId, role: 'assistant', content: text, tool_calls: [], tool_results: [{ safetyBlock: safetyHit.category }] },
        ]);
      }
      write(res, { type: 'done', conversationId, stopReason: 'safety_block' });
      return res.end();
    }

    // ── Load consent + memory ──────────────────────────────────────
    const { data: profile } = await supabase.from('psychology_profiles').select('*').eq('user_id', userId).maybeSingle();
    const consent = profile?.consent || DEFAULT_CONSENT;
    const personalizationEnabled = profile?.personalization_enabled !== false;
    const coachingTone = profile?.coaching_tone || 'gentle';

    const { data: memoryRows } = await supabase.from('agent_memory').select('category, content')
      .eq('user_id', userId).eq('active', true).eq('member_approved', true);

    // ── Build deterministic context ─────────────────────────────────
    const turnContext = await buildTurnContext({ supabase, userId, consent, personalizationEnabled, attachments });
    const { observedDataBlock, memberDataBlock } = renderContextBlocks(turnContext);

    const systemPrompt = buildSystemPrompt({
      responseMode, coachingTone, observedDataBlock, memberDataBlock,
      noDataAccess: turnContext.noDataAccess, memories: memoryRows || [],
    });

    if (turnContext.patterns?.length) {
      turnContext.patterns.forEach((p) => write(res, { type: 'tool_result', toolCallId: null, result: { kind: 'pattern', patterns: [p] } }));
    }

    // ── Persist the member's message now (assistant message persisted at the end) ──
    // Note: attachments are stored as reference metadata only — any
    // screenshot's base64 dataUrl is stripped before it ever reaches the DB.
    if (isSaving && conversationId) {
      const persistedRefs = attachments.map(({ dataUrl, ...rest }) => rest);
      await supabase.from('agent_messages').insert({ conversation_id: conversationId, user_id: userId, role: 'user', content: message, attached_record_refs: persistedRefs });
    }

    // ── Tool-calling loop against the model ─────────────────────────
    let messages = [...priorMessages, { role: 'user', content: buildUserContent(message, attachments) }];
    let finalText = '';
    const allToolCalls = [];
    const allToolResults = [];
    const allSources = [];
    let sawUnavailable = false;

    for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
      let finalMessage = null;
      for await (const event of streamChatCompletion({ systemPrompt, messages, tools: TOOL_SCHEMAS, signal: controller.signal })) {
        if (event.type === 'unavailable') { sawUnavailable = true; break; }
        if (event.type === 'text_delta') { finalText += event.text; write(res, event); }
        else if (event.type === 'tool_use_start') { write(res, { type: 'tool_use', toolCallId: event.toolCallId, toolName: event.toolName }); }
        else if (event.type === 'error') { write(res, event); }
        else if (event.type === 'final_message') { finalMessage = event.message; }
      }
      if (sawUnavailable) break;
      if (!finalMessage) break;

      const toolUseBlocks = (finalMessage.content || []).filter((b) => b.type === 'tool_use');
      if (finalMessage.stop_reason !== 'tool_use' || !toolUseBlocks.length) {
        break;
      }

      messages.push({ role: 'assistant', content: finalMessage.content });
      const toolResultBlocks = [];
      for (const tu of toolUseBlocks) {
        const result = await executeTool(
          { supabase, userId, conversationId, consent, personalizationEnabled },
          tu.name, tu.input || {}
        );
        allToolCalls.push({ name: tu.name, input: tu.input });
        allToolResults.push(result.forModel);
        if (result.forClient) {
          write(res, { type: 'tool_result', toolCallId: tu.id, result: result.forClient });
          if (result.forClient.kind === 'sources') allSources.push(result.forClient);
        }
        toolResultBlocks.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result.forModel) });
      }
      messages.push({ role: 'user', content: toolResultBlocks });
    }

    if (sawUnavailable) {
      write(res, { type: 'unavailable' });
      write(res, { type: 'done', conversationId, stopReason: 'unavailable' });
      return res.end();
    }

    if (isSaving && conversationId) {
      await supabase.from('agent_messages').insert({
        conversation_id: conversationId, user_id: userId, role: 'assistant', content: finalText,
        tool_calls: allToolCalls, tool_results: allToolResults, sources: allSources,
      });
      await supabase.from('agent_conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

      const { data: convoRow } = await supabase.from('agent_conversations').select('title').eq('id', conversationId).single();
      if (convoRow && !convoRow.title) {
        const generated = await generateShortCompletion({
          systemPrompt: 'Generate a plain, 3-6 word title (no quotes, no punctuation at the end) for a trading-psychology coaching conversation, based on the member\'s opening message.',
          userMessage: message,
        });
        const title = generated || message.slice(0, 48);
        await supabase.from('agent_conversations').update({ title }).eq('id', conversationId);
        write(res, { type: 'conversation_title', conversationId, title });
      }
    }

    write(res, { type: 'done', conversationId, stopReason: 'end_turn' });
    res.end();
  } catch (err) {
    console.error('Agent chat error:', err);
    try {
      write(res, { type: 'error', message: 'The AGHF Agent ran into a problem.' });
      write(res, { type: 'done', conversationId, stopReason: 'error' });
    } catch { /* response may already be closed */ }
    res.end();
  }
}
