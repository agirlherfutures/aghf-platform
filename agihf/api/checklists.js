// api/checklists.js — Dayli ICC Trade Checklist persistence.
// Same JWT-verification pattern as get-profile.js/complete-lesson.js:
// every query is scoped to the verified user.id, so one member's
// checklists are never reachable through another member's session.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function readinessLabel(pct) {
  if (pct === 100) return 'Locked in';
  if (pct >= 75) return 'Almost ready';
  if (pct >= 50) return 'Building';
  if (pct >= 25) return 'Getting there';
  return 'Not ready';
}

function toClientShape(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    tradingDate: row.trading_date,
    session: row.session,
    instrument: row.instrument,
    templateVersion: row.template_version,
    marketContext: row.market_context || {},
    items: row.items || [],
    currentPhase: row.current_phase,
    completionPct: row.completion_pct,
    readinessStatus: row.readiness_status,
    finalDecision: row.final_decision,
    linkedJournalEntryId: row.linked_journal_entry_id,
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
      const { id, date, instrument, limit } = req.query;

      if (id) {
        const { data, error } = await supabase
          .from('trade_checklists').select('*').eq('user_id', userId).eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ checklist: toClientShape(data) });
      }

      if (date) {
        let query = supabase.from('trade_checklists').select('*')
          .eq('user_id', userId).eq('trading_date', date);
        if (instrument) query = query.eq('instrument', instrument);
        const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ checklist: toClientShape(data) });
      }

      const { data, error } = await supabase
        .from('trade_checklists').select('*').eq('user_id', userId)
        .order('trading_date', { ascending: false })
        .limit(Number(limit) || 50);
      if (error) throw error;
      return res.status(200).json({ checklists: (data || []).map(toClientShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const items = Array.isArray(body.items) ? body.items : [];
      const checkedCount = items.filter((i) => i.checked).length;
      const completionPct = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

      const row = {
        user_id: userId,
        account_id: body.accountId || null,
        trading_date: body.tradingDate || new Date().toISOString().slice(0, 10),
        session: body.session || null,
        instrument: body.instrument || 'MNQ',
        template_version: body.templateVersion || 1,
        market_context: body.marketContext || {},
        items,
        current_phase: body.currentPhase || 'market_context',
        completion_pct: completionPct,
        readiness_status: readinessLabel(completionPct),
        final_decision: body.finalDecision || null,
        linked_journal_entry_id: body.linkedJournalEntryId || null,
        updated_at: new Date().toISOString(),
        completed_at: completionPct === 100 ? (body.completedAt || new Date().toISOString()) : null,
      };

      let result;
      if (body.id) {
        const { data, error } = await supabase
          .from('trade_checklists').update(row).eq('id', body.id).eq('user_id', userId)
          .select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('trade_checklists').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ checklist: toClientShape(result) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Checklists API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The checklist database table hasn’t been set up yet — see supabase/migrations/0001_checklist_and_journal.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
