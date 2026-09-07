// api/agent-memory.js — "What the AGHF Agent remembers about me."
// Same JWT-verification pattern as every other endpoint. Memory rows are
// created either by a member-approved agent_actions write (see
// agent-actions.js) or directly here when the member edits/adds a memory
// herself from the memory panel — either way memberApproved is always
// true by the time a row exists, per the "never secretly remember
// something" requirement.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toClientShape(row) {
  return {
    id: row.id, userId: row.user_id, category: row.category, content: row.content,
    sourceConversationId: row.source_conversation_id, memberApproved: row.member_approved,
    active: row.active, createdAt: row.created_at, updatedAt: row.updated_at,
  };
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
      let query = supabase.from('agent_memory').select('*').eq('user_id', userId);
      if (req.query.includeInactive !== 'true') query = query.eq('active', true);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ memories: (data || []).map(toClientShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      let result;
      if (body.id) {
        // Partial update — only ever touches fields actually present in
        // the request, so a narrow call (e.g. just toggling `active`, or
        // just editing `content`) can never blank out an unrelated field
        // like source_conversation_id.
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
      return res.status(200).json({ memory: toClientShape(result) });
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
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp ? 'The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/0004_aghf_agent.sql.' : err.message,
      setupRequired: notSetUp,
    });
  }
}
