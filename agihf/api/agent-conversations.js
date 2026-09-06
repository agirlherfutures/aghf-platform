// api/agent-conversations.js — AGHF Agent conversation list/rename/
// archive/delete. Same JWT-verification pattern as every other endpoint;
// message content itself lives in agent-messages.js.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toClientShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, title: row.title, responseMode: row.response_mode,
    saveStatus: row.save_status, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at,
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
      const { id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('agent_conversations').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ conversation: toClientShape(data) });
      }
      const { data, error } = await supabase.from('agent_conversations').select('*')
        .eq('user_id', userId).is('archived_at', null).order('updated_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json({ conversations: (data || []).map(toClientShape) });
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
      return res.status(200).json({ conversation: toClientShape(data) });
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
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp ? 'The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/0004_aghf_agent.sql.' : err.message,
      setupRequired: notSetUp,
    });
  }
}
