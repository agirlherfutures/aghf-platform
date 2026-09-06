// api/agent-actions.js — the ONLY code path that ever performs the real
// write for an agent write-tool. Every write tool in agent-tools.js only
// ever creates a `preview` row here; the model itself never has DB
// credentials and never calls this endpoint. A member's approval (POST
// here with approve:true) re-verifies ownership and preview status
// before executing anything — this is the entire enforcement mechanism
// for "the model never writes directly."

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toClientShape(row) {
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

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const userId = user.id;

  try {
    if (req.method === 'GET') {
      const { conversationId, id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('agent_actions').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ action: toClientShape(data) });
      }
      let query = supabase.from('agent_actions').select('*').eq('user_id', userId);
      if (conversationId) query = query.eq('conversation_id', conversationId);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return res.status(200).json({ actions: (data || []).map(toClientShape) });
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
        return res.status(200).json({ action: toClientShape(updated) });
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
        return res.status(200).json({ action: toClientShape(executed) });
      } catch (execErr) {
        console.error('Agent action execution error:', execErr);
        return res.status(500).json({ error: 'This was approved but couldn’t be saved — please try again.' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent actions API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp ? 'The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/0004_aghf_agent.sql.' : err.message,
      setupRequired: notSetUp,
    });
  }
}
