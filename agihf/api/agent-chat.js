// api/agent-chat.js — the AGHF Agent's conversation endpoint.
// Same JWT-verification pattern as every other endpoint in this project.
//
// COST-REDESIGNED (see agent-intent-classifier.js): this endpoint makes
// AT MOST ONE model call per request, and only ever runs for a message
// the client's free deterministic classifier could not resolve into an
// existing guided flow — most member messages never reach this file at
// all. There is no live tool-calling loop: any data the model needs is
// pre-fetched deterministically by agent-context-builder.js BEFORE the
// single call, and any proposed write action is expressed as a trailing
// ```action {...}``` fenced block in the model's own text response,
// parsed here and turned into an agent_actions preview row — never a
// second model round trip.
//
// Streams newline-delimited JSON events; see agihf/shared/agent-service.js
// for the client-side consumer and the wire-protocol event list.

import { createClient } from '@supabase/supabase-js';
import { streamChatCompletion, generateShortCompletion } from './_lib/ai-provider.js';
import { buildTurnContext, renderContextBlocks } from './_lib/agent-context-builder.js';
import { buildSystemPrompt } from './_lib/agent-system-prompt.js';
import { TOOL_REGISTRY } from './_lib/agent-tools.js';
import { scanForSafetyConcern } from '../shared/psychology-safety.js';
import { CRISIS_RESPONSE, TRADING_HARM_RESPONSE } from '../shared/psychology-safety-copy.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const DEFAULT_CONSENT = {
  tradeData: true, checklistAnswers: true, journalStructured: true, journalFreetext: true,
  emotions: true, sessionHistory: true, playbook: true, academyProgress: true,
};

// Generous but real — coarse cost control, not a hard product limit.
const AGENT_DAILY_REQUEST_LIMIT = 60;

const ACTION_BLOCK_RE = /```action\s*([\s\S]*?)```/;
const COMPONENT_BLOCK_RE = /```component\s*([\s\S]*?)```/;
const LAUNCH_BLOCK_RE = /```launch\s*([\s\S]*?)```/;
const FOLLOWUPS_BLOCK_RE = /```followups\s*([\s\S]*?)```/;
const VALID_COMPONENTS = new Set(['belief_check', 'urge_check', 'execution_check', 'evidence_comparison', 'action_plan']);
const VALID_LAUNCH_TYPES = new Set(['scenario_lab', 'cooldown_timer', 'post_loss_reset', 'pre_trade_check']);

function write(res, event) {
  res.write(JSON.stringify(event) + '\n');
}

function safetyResponseText(copy) {
  return `${copy.heading}\n\n${copy.body}\n\n${copy.actions.map((a) => `• ${a.label}`).join('\n')}\n\n${copy.footer}`;
}

/**
 * Extracts a member-visible answer plus up to one write-action, one
 * interactive-component, one launch, and one suggested-followups block
 * from a single model response, per the fenced-block conventions
 * described in agent-system-prompt.js — no tool-use API needed for any
 * of this, since it's all parsed out of the one already-received turn.
 */
function extractResponseBlocks(fullText) {
  let visibleText = fullText;
  let action = null;
  let component = null;
  let launch = null;
  let followups = null;

  const actionMatch = ACTION_BLOCK_RE.exec(visibleText);
  if (actionMatch) {
    visibleText = visibleText.replace(ACTION_BLOCK_RE, '');
    try {
      const parsed = JSON.parse(actionMatch[1]);
      if (parsed && typeof parsed.actionType === 'string' && TOOL_REGISTRY[parsed.actionType]) {
        action = { actionType: parsed.actionType, previewPayload: parsed.payload || {} };
      }
    } catch { /* malformed block — just drop it, still show the visible text */ }
  }

  const componentMatch = COMPONENT_BLOCK_RE.exec(visibleText);
  if (componentMatch) {
    visibleText = visibleText.replace(COMPONENT_BLOCK_RE, '');
    try {
      const parsed = JSON.parse(componentMatch[1]);
      if (parsed && VALID_COMPONENTS.has(parsed.component)) component = parsed;
    } catch { /* malformed block — just drop it */ }
  }

  const launchMatch = LAUNCH_BLOCK_RE.exec(visibleText);
  if (launchMatch) {
    visibleText = visibleText.replace(LAUNCH_BLOCK_RE, '');
    try {
      const parsed = JSON.parse(launchMatch[1]);
      if (parsed && VALID_LAUNCH_TYPES.has(parsed.launchType)) launch = parsed;
    } catch { /* malformed block — just drop it */ }
  }

  const followupsMatch = FOLLOWUPS_BLOCK_RE.exec(visibleText);
  if (followupsMatch) {
    visibleText = visibleText.replace(FOLLOWUPS_BLOCK_RE, '');
    try {
      const parsed = JSON.parse(followupsMatch[1]);
      if (Array.isArray(parsed)) followups = parsed.filter((s) => typeof s === 'string' && s.trim()).slice(0, 3);
    } catch { /* malformed block — just drop it */ }
  }

  return { visibleText: visibleText.trim(), action, component, launch, followups };
}

/**
 * A screenshot attachment carries its base64 data inline for this one
 * call (never a signed URL — nothing member-scoped ever reaches the AI
 * provider's infrastructure via a link). The image itself is persisted
 * separately via agent-data.js's attachment resource; only a path
 * reference, never the bytes, is ever written into agent_messages.
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
  // Set only when a free guided flow (Talk Me Through, etc.) already ran
  // client-side with zero AI calls — its rules-based result is folded
  // into context so this one call can build on it instead of re-deriving it.
  const guidedSummary = body.guidedSummary || null;

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
        const { data: rows } = await supabase.from('agent_messages').select('role, content')
          .eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(20);
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
          { conversation_id: conversationId, user_id: userId, role: 'assistant', content: text, tool_results: [{ safetyBlock: safetyHit.category }] },
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

    // ── Per-user daily rate limit on AI-invoking turns — deterministic, ──
    // checked before the one model call this endpoint ever makes. Counted
    // optimistically (a turn that later hits "unavailable" still uses a
    // slot) since the goal is coarse cost control, not exact accounting.
    const nowTs = new Date();
    const resetAt = profile?.agent_requests_reset_at ? new Date(profile.agent_requests_reset_at) : null;
    const isFreshWindow = !resetAt || resetAt <= nowTs;
    const requestsSoFar = isFreshWindow ? 0 : (profile?.agent_requests_today || 0);
    if (requestsSoFar >= AGENT_DAILY_REQUEST_LIMIT) {
      write(res, { type: 'rate_limited' });
      write(res, { type: 'text_delta', text: "You've reached today's AGHF Agent limit — it resets tomorrow. Your saved conversations, Playbook, resets, and Scenario Labs are still available." });
      write(res, { type: 'done', conversationId, stopReason: 'rate_limited' });
      return res.end();
    }
    await supabase.from('psychology_profiles').upsert({
      user_id: userId, agent_requests_today: requestsSoFar + 1,
      agent_requests_reset_at: isFreshWindow ? new Date(nowTs.getTime() + 24 * 60 * 60 * 1000).toISOString() : profile.agent_requests_reset_at,
    }, { onConflict: 'user_id' });

    // ── Build deterministic context — this is the ONLY data-gathering step; ──
    // there is no live tool-use round trip after this point.
    const turnContext = await buildTurnContext({ supabase, userId, consent, personalizationEnabled, attachments, message });
    const { observedDataBlock, memberDataBlock, approvedSourcesBlock } = renderContextBlocks(turnContext);

    const systemPrompt = buildSystemPrompt({
      responseMode, coachingTone, observedDataBlock, memberDataBlock, approvedSourcesBlock,
      noDataAccess: turnContext.noDataAccess, memories: memoryRows || [],
    });

    if (turnContext.patterns?.length) {
      turnContext.patterns.forEach((p) => write(res, { type: 'tool_result', result: { kind: 'pattern', patterns: [p] } }));
    }

    const effectiveMessage = guidedSummary ? `${message}\n\n[Guided check-in already completed, rules-based result below — build on this, don't repeat it]\n${guidedSummary}` : message;

    // ── Persist the member's message now (assistant message persisted at the end) ──
    if (isSaving && conversationId) {
      const persistedRefs = attachments.map(({ dataUrl, ...rest }) => rest);
      await supabase.from('agent_messages').insert({ conversation_id: conversationId, user_id: userId, role: 'user', content: message, attached_record_refs: persistedRefs });
    }

    // ── Exactly ONE model call ──────────────────────────────────────
    const messages = [...priorMessages, { role: 'user', content: buildUserContent(effectiveMessage, attachments) }];
    let fullText = '';
    let sawUnavailable = false;

    for await (const event of streamChatCompletion({ systemPrompt, messages, signal: controller.signal })) {
      if (event.type === 'unavailable') { sawUnavailable = true; break; }
      if (event.type === 'text_delta') { fullText += event.text; }
      else if (event.type === 'error') { write(res, event); }
    }

    if (sawUnavailable) {
      write(res, { type: 'unavailable' });
      write(res, { type: 'done', conversationId, stopReason: 'unavailable' });
      return res.end();
    }

    const { visibleText, action, component, launch, followups } = extractResponseBlocks(fullText);
    write(res, { type: 'text_delta', text: visibleText });

    let toolResults = [];
    if (action) {
      // Reuses the exact same preview-only insert (previewWrite, inside
      // agent-tools.js) the old tool-calling loop used — the write path
      // itself is unchanged, only how the model requests it is simpler now.
      const outcome = await TOOL_REGISTRY[action.actionType].run({ supabase, userId, conversationId }, action.previewPayload);
      if (outcome.forClient) {
        write(res, { type: 'tool_result', result: outcome.forClient });
        toolResults = [outcome.forClient];
      }
    } else if (component) {
      const result = { kind: 'interactive_component', component: component.component, data: component };
      write(res, { type: 'tool_result', result });
      toolResults = [result];
    } else if (launch) {
      const result = { kind: 'launch', launchType: launch.launchType, scenarioId: launch.scenarioId || null };
      write(res, { type: 'tool_result', result });
      toolResults = [result];
    }

    if (followups && followups.length) {
      write(res, { type: 'suggested_followups', followups });
    }

    if (isSaving && conversationId) {
      await supabase.from('agent_messages').insert({
        conversation_id: conversationId, user_id: userId, role: 'assistant', content: visibleText, tool_results: toolResults,
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
