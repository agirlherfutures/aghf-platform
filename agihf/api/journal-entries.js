// api/journal-entries.js — AG&HF Trade Journal persistence, plus (as of
// the Monthly Challenge pass) chart-screenshot storage folded in as a
// second `?resource=` case to stay under Vercel Hobby's 12-function
// ceiling — this freed the one slot agihf/api/challenge-data.js needed.
// vercel.json rewrites /api/journal-screenshot -> here with
// resource=screenshot appended, so every existing client call site
// (journal-entry.html, journal-engine.js) needed zero changes; bare
// /api/journal-entries calls (journal-service.js) still hit the default
// `entries` handler, also with zero client changes.
//
// Same JWT-verification pattern as get-profile.js: every query is scoped
// to the verified user.id, so one member's journal/screenshots are never
// reachable through another member's session.

import { createClient } from '@supabase/supabase-js';
import { creditChallengeActivity } from './_lib/challenge-credit.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } }; // screenshot uploads need headroom for a base64-encoded 5MB image

export function toClientShape(row) {
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
    entryPrice: row.entry_price,
    entryTime: row.entry_time,
    stopLossPoints: row.stop_loss_points,
    takeProfitPoints: row.take_profit_points,
    plannedRisk: row.planned_risk,
    plannedReward: row.planned_reward,
    riskRewardRatio: row.risk_reward_ratio,
    targetHit: row.target_hit,
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
    entryTags: row.entry_tags || [],
    iccChecklist: row.icc_checklist,
    exitTags: row.exit_tags || [],
    agreeWithEarlyExit: row.agree_with_early_exit,
    methodQualityTags: row.method_quality_tags || [],
    ruleViolations: row.rule_violations || [],
    screenshots: row.screenshots || [],
    entryReasoning: row.entry_reasoning,
    exitReasoning: row.exit_reasoning,
    lessons: row.lessons || [],
    emotions: row.emotions || {},
    biasAccuracy: row.bias_accuracy,
    ruleCheck: row.rule_check,
    executionGrade: row.execution_grade,
    executionScore: row.execution_score,
    wentWell: row.went_well,
    wouldImprove: row.would_improve,
    isDraft: row.is_draft,
    gpAwardedAt: row.gp_awarded_at,
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

async function handleEntries(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { id, entryType, instrument, direction, outcome, session, setupType, methodQualityTag, executionGrade, ruleCheck, hasIccSetup, from, to, limit, offset } = req.query;

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
      if (executionGrade) query = query.eq('execution_grade', executionGrade);
      if (ruleCheck) query = query.eq('rule_check', ruleCheck);
      if (hasIccSetup === 'true') query = query.not('icc_checklist', 'is', null);
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
      const isDraft = body.isDraft !== false;

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
        entry_price: body.entryPrice ?? null,
        entry_time: body.entryTime || null,
        stop_loss_points: body.stopLossPoints ?? null,
        take_profit_points: body.takeProfitPoints ?? null,
        planned_risk: body.plannedRisk ?? null,
        planned_reward: body.plannedReward ?? null,
        risk_reward_ratio: body.riskRewardRatio ?? null,
        target_hit: body.targetHit || null,
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
        entry_tags: Array.isArray(body.entryTags) ? body.entryTags : [],
        icc_checklist: body.iccChecklist ?? null,
        exit_tags: Array.isArray(body.exitTags) ? body.exitTags : [],
        agree_with_early_exit: body.agreeWithEarlyExit || null,
        method_quality_tags: Array.isArray(body.methodQualityTags) ? body.methodQualityTags : [],
        rule_violations: Array.isArray(body.ruleViolations) ? body.ruleViolations : [],
        screenshots: Array.isArray(body.screenshots) ? body.screenshots : [],
        entry_reasoning: body.entryReasoning || null,
        exit_reasoning: body.exitReasoning || null,
        lessons: Array.isArray(body.lessons) ? body.lessons : [],
        emotions: body.emotions || {},
        bias_accuracy: body.biasAccuracy || null,
        rule_check: body.ruleCheck || null,
        execution_grade: body.executionGrade || null,
        execution_score: body.executionScore ?? null,
        went_well: body.wentWell || null,
        would_improve: body.wouldImprove || null,
        is_draft: isDraft,
        updated_at: new Date().toISOString(),
      };

      // GP/streak award: a one-time side effect the first time a trade entry
      // goes from draft to final. Eligibility is checked against the row's
      // *current* gp_awarded_at (fetched below for an update; always eligible
      // for a fresh insert), then stamped onto this same write — so a later
      // edit of an already-final entry, or any of the autosaves that always
      // send isDraft:true along the way, never re-award.
      let existingGpAwardedAt = null;
      if (body.id) {
        const { data: existing } = await supabase
          .from('journal_entries').select('gp_awarded_at').eq('id', body.id).eq('user_id', userId).single();
        existingGpAwardedAt = existing?.gp_awarded_at ?? null;
      }
      const shouldAward = row.entry_type === 'trade' && !isDraft && existingGpAwardedAt == null;
      let gpAwarded = 0;
      if (shouldAward) {
        gpAwarded = 5; // logging a trade
        if (row.went_well && row.would_improve && row.lessons.length) gpAwarded += 5; // complete full reflection
        row.gp_awarded_at = new Date().toISOString();
      }

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

      if (shouldAward) {
        try {
          await creditChallengeActivity(supabase, {
            userId,
            sourceTable: 'journal_entries',
            sourceRecordId: result.id,
            activityType: 'journal_entry_completed',
            occurredAt: result.trade_date ? new Date(result.trade_date).toISOString() : undefined,
          });
        } catch { /* a missing/unmigrated challenge table must never block a journal save */ }
      }

      let newJournalStreak = null;
      if (shouldAward) {
        const { data: profile } = await supabase
          .from('profiles').select('gp, journal_streak, journal_last_entry_date')
          .eq('id', userId).single();

        const today = new Date().toISOString().split('T')[0];
        const lastEntry = profile?.journal_last_entry_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newJournalStreak = lastEntry === yesterday ? (profile?.journal_streak || 0) + 1 : lastEntry === today ? (profile?.journal_streak || 0) : 1;
        if (newJournalStreak > 0 && newJournalStreak % 3 === 0) gpAwarded += 10; // "journal 3 trades in a row" bonus

        await supabase.from('profiles').update({
          gp: (profile?.gp || 0) + gpAwarded,
          journal_streak: newJournalStreak,
          journal_last_entry_date: today,
        }).eq('id', userId);
      }

      return res.status(200).json({ entry: toClientShape(result), gpAwarded, newJournalStreak });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // Narrow, single-field update — deliberately separate from the POST
    // upsert above (which rebuilds the whole row) so toggling "exclude
    // from AGHF Agent analysis" can never blank out any other field.
    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (!body.id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('journal_entries')
        .update({ excluded_from_agent: !!body.excludedFromAgent }).eq('id', body.id).eq('user_id', userId);
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

/* ── resource=screenshot — folded in verbatim from the former
   api/journal-screenshot.js, same private "journal-screenshots" bucket,
   same path-prefix ownership check on every read/delete. ──────────────── */

const SCREENSHOT_BUCKET = 'journal-screenshots';
const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
const SCREENSHOT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function sanitizeScreenshotFilename(name) {
  return (name || 'screenshot').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

async function handleScreenshot(req, res, userId) {
  try {
    if (req.method === 'POST') {
      const { dataUrl, filename, entryId } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'Missing image data' });

      const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
      if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' });
      const [, mimeType, base64] = match;
      if (!SCREENSHOT_ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, WEBP, or GIF.` });
      }
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > SCREENSHOT_MAX_BYTES) {
        return res.status(400).json({ error: `Image is too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB) — max 5MB.` });
      }

      const ext = mimeType.split('/')[1] || 'jpg';
      const path = `${userId}/${entryId || 'unfiled'}/${Date.now()}-${sanitizeScreenshotFilename(filename)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(SCREENSHOT_BUCKET)
        .upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;

      return res.status(200).json({ path, uploadedAt: new Date().toISOString() });
    }

    if (req.method === 'GET') {
      const { path } = req.query;
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { data, error } = await supabase.storage.from(SCREENSHOT_BUCKET).createSignedUrl(path, 3600);
      if (error) throw error;
      return res.status(200).json({ url: data.signedUrl });
    }

    if (req.method === 'DELETE') {
      const path = req.query.path || (req.body && req.body.path);
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { error } = await supabase.storage.from(SCREENSHOT_BUCKET).remove([path]);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Journal screenshot API error:', err);
    const noBucket = /bucket not found/i.test(err.message || '');
    return res.status(noBucket ? 503 : 500).json({
      error: noBucket
        ? 'The screenshot storage bucket hasn’t been created yet — see supabase/migrations/0001_checklist_and_journal.sql.'
        : err.message,
      setupRequired: noBucket,
    });
  }
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = { entries: handleEntries, screenshot: handleScreenshot };

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const resourceHandler = RESOURCE_HANDLERS[req.query.resource || 'entries'];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });
  return resourceHandler(req, res, user.id);
}
