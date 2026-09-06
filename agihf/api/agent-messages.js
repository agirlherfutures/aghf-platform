// api/agent-messages.js — read a conversation's messages + record
// feedback. Messages are only ever created server-side from
// agent-chat.js, never directly by the client (prevents spoofing
// conversation content) — this endpoint is read + feedback-update only.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toClientShape(row) {
  return {
    id: row.id, conversationId: row.conversation_id, userId: row.user_id, role: row.role, content: row.content,
    structuredComponentData: row.structured_component_data, attachedRecordRefs: row.attached_record_refs || [],
    toolCalls: row.tool_calls || [], toolResults: row.tool_results || [], sources: row.sources || [],
    feedback: row.feedback, createdAt: row.created_at,
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
      const { conversationId } = req.query;
      if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });
      const { data, error } = await supabase.from('agent_messages').select('*')
        .eq('conversation_id', conversationId).eq('user_id', userId).order('created_at', { ascending: true }).limit(200);
      if (error) throw error;
      return res.status(200).json({ messages: (data || []).map(toClientShape) });
    }

    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      const { feedback } = req.body || {};
      if (!id || !['up', 'down', null].includes(feedback)) return res.status(400).json({ error: 'Missing id or invalid feedback' });
      const { data, error } = await supabase.from('agent_messages').update({ feedback }).eq('id', id).eq('user_id', userId).select('*').single();
      if (error) throw error;
      return res.status(200).json({ message: toClientShape(data) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent messages API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp ? 'The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/0004_aghf_agent.sql.' : err.message,
      setupRequired: notSetUp,
    });
  }
}
