// api/psychology-sessions.js — The Inner Edge coaching-session persistence
// (Talk Me Through This / Pre-Trade Check / Post-Loss Reset / Weekly
// Review). Same JWT-verification pattern as journal-entries.js: every
// query scoped to the verified user.id.
//
// A session saved with save_preference:'one_time' is written once so the
// rules engine's result can be returned, then immediately deleted server-
// side in the same request — never left resting in the table. Sessions
// the client never intends to persist at all (a true one-time session)
// should simply never call this endpoint; this path exists for a member
// who starts a normal session but only decides "don't save this" at the
// very end.

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
    mode: row.mode,
    status: row.status,
    savePreference: row.save_preference,
    triggerCategory: row.trigger_category,
    linkedTradeId: row.linked_trade_id,
    linkedChecklistId: row.linked_checklist_id,
    structuredResponses: row.structured_responses || {},
    readinessResult: row.readiness_result,
    rulesTriggered: row.rules_triggered || [],
    recommendedAction: row.recommended_action,
    memberSelectedAction: row.member_selected_action,
    memberFeedback: row.member_feedback,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
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
      const { id, mode, limit } = req.query;
      if (id) {
        const { data, error } = await supabase
          .from('psychology_sessions').select('*').eq('user_id', userId).eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ session: toClientShape(data) });
      }
      let query = supabase.from('psychology_sessions').select('*').eq('user_id', userId);
      if (mode) query = query.eq('mode', mode);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(Number(limit) || 50);
      if (error) throw error;
      return res.status(200).json({ sessions: (data || []).map(toClientShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId,
        mode: body.mode,
        status: body.status || 'completed',
        save_preference: body.savePreference || 'save',
        trigger_category: body.triggerCategory || null,
        linked_trade_id: body.linkedTradeId || null,
        linked_checklist_id: body.linkedChecklistId || null,
        structured_responses: body.structuredResponses || {},
        readiness_result: body.readinessResult || null,
        rules_triggered: Array.isArray(body.rulesTriggered) ? body.rulesTriggered : [],
        recommended_action: body.recommendedAction || null,
        member_selected_action: body.memberSelectedAction || null,
        member_feedback: body.memberFeedback || null,
        updated_at: new Date().toISOString(),
        completed_at: (body.status || 'completed') === 'completed' ? new Date().toISOString() : null,
      };

      let result;
      if (body.id) {
        const { data, error } = await supabase
          .from('psychology_sessions').update(row).eq('id', body.id).eq('user_id', userId)
          .select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('psychology_sessions').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }

      if (row.save_preference === 'one_time') {
        const shaped = toClientShape(result);
        await supabase.from('psychology_sessions').delete().eq('id', result.id).eq('user_id', userId);
        return res.status(200).json({ session: shaped });
      }
      return res.status(200).json({ session: toClientShape(result) });
    }

    if (req.method === 'DELETE') {
      if (req.query.all === 'true') {
        await supabase.from('psychology_sessions').delete().eq('user_id', userId);
        await supabase.from('psychology_patterns').delete().eq('user_id', userId);
        return res.status(200).json({ success: true });
      }
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('psychology_sessions').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology sessions API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The Psychology Coach database tables haven’t been set up yet — see supabase/migrations/0003_psychology_coach.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
