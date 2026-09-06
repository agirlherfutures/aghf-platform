// api/journal-entries.js — AG&HF Trade Journal persistence.
// Same JWT-verification pattern as get-profile.js: every query is scoped
// to the verified user.id, so one member's journal is never reachable
// through another member's session.

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
    checklistId: row.checklist_id,
    entryType: row.entry_type,
    prompt: row.prompt,
    accountId: row.account_id,
    tradeNumber: row.trade_number,
    tradeDate: row.trade_date,
    session: row.session,
    instrument: row.instrument,
    direction: row.direction,
    contracts: row.contracts,
    executionTimeframe: row.execution_timeframe,
    setupType: row.setup_type,
    setupQualityScore: row.setup_quality_score,
    tradeStyle: row.trade_style,
    sniperScore: row.sniper_score,
    screenshotNotes: row.screenshot_notes,
    entryPrice: row.entry_price,
    entryTime: row.entry_time,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    plannedRisk: row.planned_risk,
    actualRisk: row.actual_risk,
    fees: row.fees,
    exits: row.exits || [],
    grossPnl: row.gross_pnl,
    netPnl: row.net_pnl,
    rMultiple: row.r_multiple,
    outcome: row.outcome,
    outcomeOverride: row.outcome_override,
    bias4h: row.bias_4h,
    structure1h: row.structure_1h,
    pil: row.pil,
    iccPhase: row.icc_phase,
    methodQualityTags: row.method_quality_tags || [],
    ruleViolations: row.rule_violations || [],
    screenshots: row.screenshots || [],
    entryReasoning: row.entry_reasoning,
    exitReasoning: row.exit_reasoning,
    lessons: row.lessons,
    emotions: row.emotions || {},
    executionRating: row.execution_rating,
    structureInsight: row.structure_insight,
    oneSentenceTakeaway: row.one_sentence_takeaway,
    finalReflection: row.final_reflection,
    isDraft: row.is_draft,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computeOutcome(netPnl) {
  if (netPnl == null) return null;
  if (netPnl > 0) return 'win';
  if (netPnl < 0) return 'loss';
  return 'breakeven';
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
      const { id, entryType, instrument, direction, outcome, session, setupType, methodQualityTag, from, to, limit, offset } = req.query;

      if (id) {
        const { data, error } = await supabase
          .from('journal_entries').select('*').eq('user_id', userId).eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ entry: toClientShape(data) });
      }

      let query = supabase.from('journal_entries').select('*', { count: 'exact' }).eq('user_id', userId);
      if (entryType) query = query.eq('entry_type', entryType);
      if (instrument) query = query.eq('instrument', instrument);
      if (direction) query = query.eq('direction', direction);
      if (outcome) query = query.eq('outcome', outcome);
      if (session) query = query.eq('session', session);
      if (setupType) query = query.eq('setup_type', setupType);
      if (methodQualityTag) query = query.contains('method_quality_tags', [methodQualityTag]);
      if (from) query = query.gte('trade_date', from);
      if (to) query = query.lte('trade_date', to);

      const lim = Number(limit) || 50;
      const off = Number(offset) || 0;
      const { data, error, count } = await query
        .order('trade_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(off, off + lim - 1);
      if (error) throw error;
      return res.status(200).json({ entries: (data || []).map(toClientShape), total: count || 0 });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const netPnl = body.netPnl != null ? Number(body.netPnl) : null;

      const row = {
        user_id: userId,
        checklist_id: body.checklistId || null,
        entry_type: body.entryType || 'trade',
        prompt: body.prompt || null,
        account_id: body.accountId || null,
        trade_date: body.tradeDate || new Date().toISOString().slice(0, 10),
        session: body.session || null,
        instrument: body.instrument || null,
        direction: body.direction || null,
        contracts: body.contracts ?? null,
        execution_timeframe: body.executionTimeframe || '1m',
        setup_type: body.setupType || null,
        setup_quality_score: body.setupQualityScore ?? null,
        trade_style: body.tradeStyle || null,
        sniper_score: body.sniperScore || null,
        screenshot_notes: body.screenshotNotes || null,
        entry_price: body.entryPrice ?? null,
        entry_time: body.entryTime || null,
        stop_loss: body.stopLoss ?? null,
        take_profit: body.takeProfit ?? null,
        planned_risk: body.plannedRisk ?? null,
        actual_risk: body.actualRisk ?? null,
        fees: body.fees ?? null,
        exits: Array.isArray(body.exits) ? body.exits : [],
        gross_pnl: body.grossPnl ?? null,
        net_pnl: netPnl,
        r_multiple: body.rMultiple ?? null,
        outcome: body.outcomeOverride || computeOutcome(netPnl),
        outcome_override: body.outcomeOverride || null,
        bias_4h: body.bias4h || null,
        structure_1h: body.structure1h || null,
        pil: body.pil || null,
        icc_phase: body.iccPhase || null,
        method_quality_tags: Array.isArray(body.methodQualityTags) ? body.methodQualityTags : [],
        rule_violations: Array.isArray(body.ruleViolations) ? body.ruleViolations : [],
        screenshots: Array.isArray(body.screenshots) ? body.screenshots : [],
        entry_reasoning: body.entryReasoning || null,
        exit_reasoning: body.exitReasoning || null,
        lessons: body.lessons || null,
        emotions: body.emotions || {},
        execution_rating: body.executionRating ?? null,
        structure_insight: body.structureInsight || null,
        one_sentence_takeaway: body.oneSentenceTakeaway || null,
        final_reflection: body.finalReflection || null,
        is_draft: body.isDraft !== false,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (body.id) {
        const { data, error } = await supabase
          .from('journal_entries').update(row).eq('id', body.id).eq('user_id', userId)
          .select('*').single();
        if (error) throw error;
        result = data;
      } else {
        if (row.entry_type === 'trade') {
          const { count } = await supabase
            .from('journal_entries').select('id', { count: 'exact', head: true })
            .eq('user_id', userId).eq('entry_type', 'trade');
          row.trade_number = (count || 0) + 1;
        }
        const { data, error } = await supabase
          .from('journal_entries').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ entry: toClientShape(result) });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Journal entries API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The journal database table hasn’t been set up yet — see supabase/migrations/0001_checklist_and_journal.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
