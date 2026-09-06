// api/psychology-playbook.js — Trading Psychology Playbook persistence.
// Same JWT-verification pattern as every other endpoint here.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function toClientShape(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    title: row.title,
    content: row.content,
    sourceType: row.source_type,
    sourceRecordId: row.source_record_id,
    pinned: row.pinned,
    aiAccessPermission: row.ai_access_permission,
    isArchived: row.is_archived,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      const { data, error } = await supabase
        .from('psychology_playbook_items').select('*').eq('user_id', userId)
        .order('pinned', { ascending: false }).order('sort_order', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ items: (data || []).map(toClientShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId,
        category: body.category,
        title: body.title || '',
        content: body.content || '',
        source_type: body.sourceType || 'manual',
        source_record_id: body.sourceRecordId || null,
        pinned: !!body.pinned,
        ai_access_permission: body.aiAccessPermission !== false,
        is_archived: !!body.isArchived,
        sort_order: body.sortOrder ?? 0,
        updated_at: new Date().toISOString(),
      };
      let result;
      if (body.id) {
        const { data, error } = await supabase
          .from('psychology_playbook_items').update(row).eq('id', body.id).eq('user_id', userId)
          .select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('psychology_playbook_items').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ item: toClientShape(result) });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('psychology_playbook_items').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology playbook API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The Psychology Coach database tables haven’t been set up yet — see supabase/migrations/0003_psychology_coach.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
