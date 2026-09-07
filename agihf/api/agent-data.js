// api/agent-data.js — every AGHF Agent CRUD endpoint EXCEPT the streaming
// chat call (agent-chat.js stays its own function). Consolidated into one
// Vercel serverless function, dispatched on ?resource=, purely to stay
// under the Vercel Hobby plan's 12-serverless-function-per-deployment
// limit — agihf/api/ had grown to 18 files once the AGHF Agent's 6
// endpoints were added on top of the pre-existing 12. vercel.json rewrites
// each of the 5 old URLs (/api/agent-conversations, /api/agent-messages,
// /api/agent-memory, /api/agent-actions, /api/agent-attachment) to this
// file with a matching ?resource= appended, so no client code changes —
// agent-service.js still fetches the exact same old paths.
//
// Each resource keeps its own JWT-verification + method-branch logic
// exactly as it lived in its original file (agent-conversations.js,
// agent-messages.js, agent-memory.js, agent-actions.js,
// agent-attachment.js — all deleted, this supersedes them); only the
// dispatch and the shared Supabase client construction are new.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Screenshot uploads need headroom beyond the default JSON body limit —
// applying it to the whole file is harmless for the other resources.
export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

function notSetUpError(res, err, migrationFile, extraNoBucketCheck) {
  const noBucket = extraNoBucketCheck && /bucket not found/i.test(err.message || '');
  const notSetUp = noBucket || /relation .* does not exist/i.test(err.message || '');
  return res.status(notSetUp ? 503 : 500).json({
    error: noBucket
      ? 'The screenshot storage bucket hasn’t been created yet — see supabase/migrations/0001_checklist_and_journal.sql.'
      : notSetUp
        ? `The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/${migrationFile}.`
        : err.message,
    setupRequired: notSetUp,
  });
}

/* ── conversations ────────────────────────────────────────────────── */

function conversationShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, title: row.title, responseMode: row.response_mode,
    saveStatus: row.save_status, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at,
  };
}

async function handleConversations(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('agent_conversations').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ conversation: conversationShape(data) });
      }
      const { data, error } = await supabase.from('agent_conversations').select('*')
        .eq('user_id', userId).is('archived_at', null).order('updated_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json({ conversations: (data || []).map(conversationShape) });
    }
    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = req.body || {};
      const patch = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) patch.title = body.title;
      if (body.responseMode !== undefined) patch.response_mode = body.responseMode;
      if (body.archived !== undefined) patch.archived_at = body.archived ? new Date().toISOString() : null;
      const { data, error } = await supabase.from('agent_conversations').update(patch).eq('id', id).eq('user_id', userId).select('*').single();
      if (error) throw error;
      return res.status(200).json({ conversation: conversationShape(data) });
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('agent_conversations').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent conversations API error:', err);
    return notSetUpError(res, err, '0004_aghf_agent.sql');
  }
}

/* ── messages ─────────────────────────────────────────────────────── */

function messageShape(row) {
  return {
    id: row.id, conversationId: row.conversation_id, userId: row.user_id, role: row.role, content: row.content,
    structuredComponentData: row.structured_component_data, attachedRecordRefs: row.attached_record_refs || [],
    toolCalls: row.tool_calls || [], toolResults: row.tool_results || [], sources: row.sources || [],
    feedback: row.feedback, createdAt: row.created_at,
  };
}

async function handleMessages(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { conversationId } = req.query;
      if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });
      const { data, error } = await supabase.from('agent_messages').select('*')
        .eq('conversation_id', conversationId).eq('user_id', userId).order('created_at', { ascending: true }).limit(200);
      if (error) throw error;
      return res.status(200).json({ messages: (data || []).map(messageShape) });
    }
    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      const { feedback } = req.body || {};
      if (!id || !['up', 'down', null].includes(feedback)) return res.status(400).json({ error: 'Missing id or invalid feedback' });
      const { data, error } = await supabase.from('agent_messages').update({ feedback }).eq('id', id).eq('user_id', userId).select('*').single();
      if (error) throw error;
      return res.status(200).json({ message: messageShape(data) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent messages API error:', err);
    return notSetUpError(res, err, '0004_aghf_agent.sql');
  }
}

/* ── memory ───────────────────────────────────────────────────────── */

function memoryShape(row) {
  return {
    id: row.id, userId: row.user_id, category: row.category, content: row.content,
    sourceConversationId: row.source_conversation_id, memberApproved: row.member_approved,
    active: row.active, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function handleMemory(req, res, userId) {
  try {
    if (req.method === 'GET') {
      let query = supabase.from('agent_memory').select('*').eq('user_id', userId);
      if (req.query.includeInactive !== 'true') query = query.eq('active', true);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ memories: (data || []).map(memoryShape) });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      let result;
      if (body.id) {
        // Partial update — only touches fields actually present in the
        // request, so a narrow call (toggling `active`, or editing
        // `content`) can never blank out an unrelated field.
        const patch = { updated_at: new Date().toISOString() };
        if (body.category !== undefined) patch.category = body.category;
        if (body.content !== undefined) patch.content = body.content;
        if (body.sourceConversationId !== undefined) patch.source_conversation_id = body.sourceConversationId;
        if (body.active !== undefined) patch.active = body.active;
        const { data, error } = await supabase.from('agent_memory').update(patch).eq('id', body.id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const row = {
          user_id: userId, category: body.category, content: body.content,
          source_conversation_id: body.sourceConversationId || null,
          member_approved: true, active: body.active !== false, updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('agent_memory').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ memory: memoryShape(result) });
    }
    if (req.method === 'DELETE') {
      if (req.query.all === 'true') {
        await supabase.from('agent_memory').delete().eq('user_id', userId);
        return res.status(200).json({ success: true });
      }
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('agent_memory').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent memory API error:', err);
    return notSetUpError(res, err, '0004_aghf_agent.sql');
  }
}

/* ── actions (write-tool preview/approve) ────────────────────────────
 * The ONLY code path that ever performs the real write for an agent
 * write-tool. Every write tool in agent-tools.js only ever creates a
 * `preview` row here; the model itself never has DB credentials and
 * never calls this endpoint. A member's approval (POST here with
 * approve:true) re-verifies ownership and preview status before
 * executing anything — this is the entire enforcement mechanism for
 * "the model never writes directly."
 */

function actionShape(row) {
  return {
    id: row.id, userId: row.user_id, conversationId: row.conversation_id, actionType: row.action_type,
    previewPayload: row.preview_payload, approvalStatus: row.approval_status,
    executionResult: row.execution_result, createdAt: row.created_at, executedAt: row.executed_at,
  };
}

async function executeAction(userId, actionType, payload) {
  if (actionType === 'create_if_then_rule' || actionType === 'add_playbook_insight' || actionType === 'create_practice_plan') {
    const { data, error } = await supabase.from('psychology_playbook_items').insert({
      user_id: userId, category: payload.category, title: payload.title, content: payload.content, source_type: 'session',
    }).select('id').single();
    if (error) throw error;
    return { playbookItemId: data.id };
  }
  if (actionType === 'update_current_focus') {
    const { error } = await supabase.from('psychology_profiles').upsert({
      user_id: userId, current_focus: payload.focusTitle, current_focus_body: payload.focusBody,
      current_focus_source: 'member', updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return { focusUpdated: true };
  }
  if (actionType === 'save_conversation_summary') {
    const result = {};
    if (payload.title) {
      await supabase.from('agent_conversations').update({ title: payload.title }).eq('id', payload._conversationId).eq('user_id', userId);
      result.titleSet = payload.title;
    }
    if (payload.memoryContent) {
      const { data, error } = await supabase.from('agent_memory').insert({
        user_id: userId, category: 'confirmed_pattern', content: payload.memoryContent,
        source_conversation_id: payload._conversationId || null, member_approved: true, active: true,
      }).select('id').single();
      if (error) throw error;
      result.memoryId = data.id;
    }
    return result;
  }
  throw new Error(`Unknown action type: ${actionType}`);
}

async function handleActions(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { conversationId, id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('agent_actions').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ action: actionShape(data) });
      }
      let query = supabase.from('agent_actions').select('*').eq('user_id', userId);
      if (conversationId) query = query.eq('conversation_id', conversationId);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return res.status(200).json({ actions: (data || []).map(actionShape) });
    }
    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      const { approve } = req.body || {};
      if (!id || typeof approve !== 'boolean') return res.status(400).json({ error: 'Missing id or approve boolean' });

      const { data: action, error: fetchErr } = await supabase.from('agent_actions').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!action) return res.status(404).json({ error: 'Action not found' });
      if (action.approval_status !== 'preview') return res.status(409).json({ error: `This action is already ${action.approval_status}.` });

      if (!approve) {
        const { data: updated, error } = await supabase.from('agent_actions')
          .update({ approval_status: 'declined' }).eq('id', id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        return res.status(200).json({ action: actionShape(updated) });
      }

      const { data: approved, error: approveErr } = await supabase.from('agent_actions')
        .update({ approval_status: 'approved' }).eq('id', id).eq('user_id', userId).select('*').single();
      if (approveErr) throw approveErr;

      try {
        const executionResult = await executeAction(userId, approved.action_type, { ...approved.preview_payload, _conversationId: approved.conversation_id });
        const { data: executed, error: execErr } = await supabase.from('agent_actions')
          .update({ approval_status: 'executed', execution_result: executionResult, executed_at: new Date().toISOString() })
          .eq('id', id).eq('user_id', userId).select('*').single();
        if (execErr) throw execErr;
        return res.status(200).json({ action: actionShape(executed) });
      } catch (execErr) {
        console.error('Agent action execution error:', execErr);
        return res.status(500).json({ error: 'This was approved but couldn’t be saved — please try again.' });
      }
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent actions API error:', err);
    return notSetUpError(res, err, '0004_aghf_agent.sql');
  }
}

/* ── attachment (chart screenshots) ──────────────────────────────────
 * Mirrors journal-screenshot.js's exact upload/signed-URL/ownership-check
 * shape, reusing the SAME private "journal-screenshots" Supabase Storage
 * bucket under a new path prefix ({userId}/agent/{conversationId}/...) —
 * no second bucket to provision. Only ever a signed URL leaves the
 * server; the bucket itself is never public.
 */

const BUCKET = 'journal-screenshots';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function sanitizeFilename(name) {
  return (name || 'screenshot').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

async function handleAttachment(req, res, userId) {
  try {
    if (req.method === 'POST') {
      const { dataUrl, filename, conversationId } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'Missing image data' });

      const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
      if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' });
      const [, mimeType, base64] = match;
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, WEBP, or GIF.` });
      }
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({ error: `Image is too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB) — max 5MB.` });
      }

      const ext = mimeType.split('/')[1] || 'jpg';
      const path = `${userId}/agent/${conversationId || 'unfiled'}/${Date.now()}-${sanitizeFilename(filename)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: attachment, error: insertError } = await supabase.from('agent_attachments').insert({
        user_id: userId, conversation_id: conversationId || null, type: 'screenshot',
        secure_file_ref: path, metadata: { filename: sanitizeFilename(filename), mimeType, bytes: buffer.length },
      }).select('*').single();
      if (insertError) throw insertError;

      return res.status(200).json({ attachmentId: attachment.id, path, uploadedAt: attachment.created_at });
    }
    if (req.method === 'GET') {
      const { path } = req.query;
      if (!path || !path.startsWith(`${userId}/agent/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (error) throw error;
      return res.status(200).json({ url: data.signedUrl });
    }
    if (req.method === 'DELETE') {
      const path = req.query.path || (req.body && req.body.path);
      if (!path || !path.startsWith(`${userId}/agent/`)) return res.status(403).json({ error: 'Not your screenshot' });
      await supabase.storage.from(BUCKET).remove([path]);
      await supabase.from('agent_attachments').delete().eq('user_id', userId).eq('secure_file_ref', path);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent attachment API error:', err);
    return notSetUpError(res, err, '0004_aghf_agent.sql', true);
  }
}

/* ── dispatch ─────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  conversations: handleConversations,
  messages: handleMessages,
  memory: handleMemory,
  actions: handleActions,
  attachment: handleAttachment,
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const resourceHandler = RESOURCE_HANDLERS[req.query.resource];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });
  return resourceHandler(req, res, user.id);
}
