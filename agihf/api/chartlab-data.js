// api/chartlab-data.js — AGHF Chart Lab persistence + admin drill builder.
//
// Same ?resource=-dispatch pattern as agent-data.js / psychology-data.js /
// challenge-data.js (one shared Supabase client, one JWT-auth-once
// handler, a RESOURCE_HANDLERS map) — this is the 12th and last available
// Vercel Hobby function slot, freed by folding checklists.js into
// journal-entries.js as a third resource=checklist case.
//
// Every drill-reveal boundary is enforced HERE, not just in the client:
// resource=drills/drill-detail strips correct_choice/correct_sequence/
// zones/explanation/hints/common_mistake from the response entirely — a
// member can never see the answer key by reading the network tab. Scoring
// (resource=attempt) always re-fetches the real answer key server-side and
// runs it through chartlab-scoring.js's deterministic comparisons; the
// client's own claimed score, if it sent one, is never trusted.

import { createClient } from '@supabase/supabase-js';
import { creditChallengeActivity } from './_lib/challenge-credit.js';
import { isDbNotSetUp } from './_lib/db-error.js';
import { scoreAttempt, computeMasteryUpdate, applyMasteryDecay } from './_lib/chartlab-scoring.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } }; // chart image uploads need headroom for a base64 image

const CHART_BUCKET = 'win-media'; // reused, no new bucket needed — see 0009_chart_lab.sql header
const CHART_MAX_BYTES = 5 * 1024 * 1024;
const CHART_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DAILY_GP_CAP = 100;
const MASTERY_RANK = ['new', 'practicing', 'developing', 'confident', 'mastered'];

async function isAdmin(userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  return !!data?.is_admin;
}

function drillPublicShape(row) {
  return {
    id: row.id, title: row.title, description: row.description, drillType: row.drill_type,
    skillCategory: row.skill_category, difficulty: row.difficulty, accessTier: row.access_tier,
    practiceMode: row.practice_mode, phaseKey: row.phase_key, sectionKey: row.section_key, lessonKey: row.lesson_key,
    instrument: row.instrument, timeframe: row.timeframe, historicalDate: row.historical_date,
    chartFormat: row.chart_format, chartImagePath: row.chart_image_path,
    chartImageWidth: row.chart_image_width, chartImageHeight: row.chart_image_height, chartAltText: row.chart_alt_text,
    question: row.question, estimatedSeconds: row.estimated_seconds, relatedNextDrillId: row.related_next_drill_id,
    version: row.version, isSeedPlaceholder: row.is_seed_placeholder,
  };
}

function drillAdminShape(row) {
  return { ...drillPublicShape(row), status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, publishedAt: row.published_at };
}

// Never includes correct_choice/correct_sequence/zones/explanation/
// common_mistake/related_rule — those would leak the answer before
// submission. Hints ARE included: they're deliberately vague scaffolding
// meant to be used DURING the answer phase (progressive hints), not a
// reveal — using one is tracked client-side and reported back as
// hintsUsed on submit.
function answerKeyPreShape(row) {
  if (!row) return null;
  return { answerType: row.answer_type, choices: (row.choices || []).map((c) => ({ key: c.key, label: c.label })), hints: row.hints || [] };
}

function answerKeyRevealShape(row) {
  if (!row) return null;
  return {
    answerType: row.answer_type, choices: row.choices || [], correctChoice: row.correct_choice,
    correctSequence: row.correct_sequence || [], zones: row.zones || [], explanation: row.explanation,
    commonMistake: row.common_mistake, hints: row.hints || [], relatedRule: row.related_rule,
  };
}

async function currentAnswerKey(drillId, version) {
  const { data } = await supabase.from('chart_lab_answer_keys').select('*').eq('drill_id', drillId).eq('drill_version', version).maybeSingle();
  return data;
}

/* ── resource=drills — public browse/list ──────────────────────────────── */

async function handleDrills(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id, skillCategory, difficulty, drillType, accessTier } = req.query;

  if (id) {
    const { data: drill, error } = await supabase.from('chart_lab_drills').select('*').eq('id', id).eq('status', 'published').maybeSingle();
    if (error) throw error;
    if (!drill) return res.status(404).json({ error: 'Drill not found' });
    const answerKey = await currentAnswerKey(drill.id, drill.version);
    return res.status(200).json({ drill: drillPublicShape(drill), answerKeyPreview: answerKeyPreShape(answerKey) });
  }

  let query = supabase.from('chart_lab_drills').select('*').eq('status', 'published');
  if (skillCategory) query = query.eq('skill_category', skillCategory);
  if (difficulty) query = query.eq('difficulty', difficulty);
  if (drillType) query = query.eq('drill_type', drillType);
  if (accessTier) query = query.eq('access_tier', accessTier);
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return res.status(200).json({ drills: (data || []).map(drillPublicShape) });
}

/* ── resource=chart-image — signed-URL read for the private win-media
   bucket. Unlike journal screenshots (per-user, ownership-scoped to
   `${userId}/...`), a chart image is shared drill content every
   authenticated member is allowed to view — so the check here is "is this
   actually a chartlab/ path" rather than "is this path yours." ────────── */

async function handleChartImage(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { path } = req.query;
  if (!path || !path.startsWith('chartlab/')) return res.status(403).json({ error: 'Not a Chart Lab image' });
  const { data, error } = await supabase.storage.from(CHART_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return res.status(200).json({ url: data.signedUrl });
}

/* ── resource=attempt — deterministic scoring, GP award, mastery update ─── */

async function handleAttempt(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  if (!body.drillId) return res.status(400).json({ error: 'Missing drillId' });

  const { data: drill } = await supabase.from('chart_lab_drills').select('*').eq('id', body.drillId).eq('status', 'published').maybeSingle();
  if (!drill) return res.status(404).json({ error: 'Drill not found' });
  const answerKey = await currentAnswerKey(drill.id, drill.version);
  if (!answerKey) return res.status(503).json({ error: 'This drill has no answer key configured yet.' });

  const { score, result } = scoreAttempt(
    { answerType: answerKey.answer_type, correctChoice: answerKey.correct_choice, correctSequence: answerKey.correct_sequence, zones: answerKey.zones },
    body.memberAnswer || {}
  );
  const hintsUsed = Number(body.hintsUsed) || 0;

  const { count: priorCount } = await supabase.from('chart_lab_attempts')
    .select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('drill_id', drill.id).eq('drill_version', drill.version);
  const attemptNumber = (priorCount || 0) + 1;

  // GP dedupe: only the FIRST attempt at this exact (user, drill, version)
  // can ever award GP, and only when it's a genuine pass — a resave or
  // resubmit of an already-attempted drill never awards twice, and a
  // "review_needed" first try earns nothing until retried and passed.
  let gpAwarded = 0;
  if (attemptNumber === 1 && result !== 'review_needed') {
    const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
    const { data: todaysAttempts } = await supabase.from('chart_lab_attempts')
      .select('gp_awarded').eq('user_id', userId).gte('completed_at', todayStart.toISOString());
    const awardedToday = (todaysAttempts || []).reduce((s, a) => s + (a.gp_awarded || 0), 0);
    if (awardedToday < DAILY_GP_CAP) gpAwarded = result === 'correct' ? 5 : 3;
  }

  const { data: existingMastery } = await supabase.from('chart_lab_mastery').select('*').eq('user_id', userId).eq('skill_category', drill.skill_category).maybeSingle();
  const nextMastery = computeMasteryUpdate(existingMastery, { score, result, hintsUsed });
  const priorRank = MASTERY_RANK.indexOf(existingMastery?.mastery_state || 'new');
  const nextRank = MASTERY_RANK.indexOf(nextMastery.mastery_state);
  const masteryLeveledUp = nextRank > priorRank;
  if (masteryLeveledUp && attemptNumber === 1) {
    const todayStart2 = new Date(); todayStart2.setUTCHours(0, 0, 0, 0);
    const { data: todaysAttempts2 } = await supabase.from('chart_lab_attempts')
      .select('gp_awarded').eq('user_id', userId).gte('completed_at', todayStart2.toISOString());
    const awardedToday2 = (todaysAttempts2 || []).reduce((s, a) => s + (a.gp_awarded || 0), 0) + gpAwarded;
    if (awardedToday2 < DAILY_GP_CAP) gpAwarded += 10; // improved a mastery level
  }

  const { data: attempt, error: attemptErr } = await supabase.from('chart_lab_attempts').insert({
    user_id: userId, drill_id: drill.id, drill_version: drill.version, session_id: body.sessionId || null,
    member_answer: body.memberAnswer || {}, score, result, hints_used: hintsUsed, attempt_number: attemptNumber, gp_awarded: gpAwarded,
  }).select('*').single();
  if (attemptErr) throw attemptErr;

  await supabase.from('chart_lab_mastery').upsert({ user_id: userId, skill_category: drill.skill_category, ...nextMastery }, { onConflict: 'user_id,skill_category' });

  if (gpAwarded > 0) {
    const { data: profile } = await supabase.from('profiles').select('gp').eq('id', userId).single();
    await supabase.from('profiles').update({ gp: (profile?.gp || 0) + gpAwarded }).eq('id', userId);
  }

  if (attemptNumber === 1 && result !== 'review_needed') {
    try {
      await creditChallengeActivity(supabase, { userId, sourceTable: 'chart_lab_attempts', sourceRecordId: attempt.id, activityType: 'chart_lab_completed', occurredAt: attempt.completed_at });
    } catch { /* a missing/unmigrated challenge table must never block a Chart Lab attempt */ }
  }

  return res.status(200).json({
    attemptId: attempt.id, score, result, gpAwarded, attemptNumber,
    masteryState: nextMastery.mastery_state, masteryLeveledUp,
    reveal: answerKeyRevealShape(answerKey),
    relatedNextDrillId: drill.related_next_drill_id,
  });
}

/* ── resource=session — Daily Drill / Focus Practice / Mixed Review ─────── */

async function pickDrillIds({ sessionType, skillCategory, userId, count }) {
  let query = supabase.from('chart_lab_drills').select('id, skill_category, difficulty').eq('status', 'published');
  if (sessionType === 'focus' && skillCategory) query = query.eq('skill_category', skillCategory);
  const { data: pool } = await query;
  const rows = pool || [];
  if (sessionType === 'mixed_review') {
    const { data: dueSkills } = await supabase.from('chart_lab_mastery').select('skill_category').eq('user_id', userId).lte('review_due_at', new Date().toISOString());
    const dueSet = new Set((dueSkills || []).map((r) => r.skill_category));
    const prioritized = rows.filter((r) => dueSet.has(r.skill_category));
    const rest = rows.filter((r) => !dueSet.has(r.skill_category));
    return [...prioritized, ...rest].slice(0, count).map((r) => r.id);
  }
  return rows.slice(0, count).map((r) => r.id);
}

async function handleSession(req, res, userId) {
  if (req.method === 'GET') {
    const { data } = await supabase.from('chart_lab_sessions').select('*').eq('user_id', userId).eq('status', 'in_progress').order('started_at', { ascending: false }).maybeSingle();
    return res.status(200).json({ session: data || null });
  }
  if (req.method === 'POST') {
    const body = req.body || {};
    const sessionType = body.sessionType || 'daily';
    const count = sessionType === 'daily' ? 5 : sessionType === 'focus' ? 8 : sessionType === 'mixed_review' ? 8 : 6;
    const drillIds = await pickDrillIds({ sessionType, skillCategory: body.skillCategory, userId, count });
    if (!drillIds.length) return res.status(200).json({ session: null, empty: true });
    const { data, error } = await supabase.from('chart_lab_sessions').insert({
      user_id: userId, session_type: sessionType, current_focus_source: body.currentFocusSource || null,
      skill_category: body.skillCategory || null, drill_ids: drillIds,
    }).select('*').single();
    if (error) throw error;
    return res.status(200).json({ session: data });
  }
  if (req.method === 'PATCH') {
    const body = req.body || {};
    if (!body.id) return res.status(400).json({ error: 'Missing id' });
    const update = {};
    if (body.currentPosition != null) update.current_position = body.currentPosition;
    if (body.status) { update.status = body.status; if (body.status === 'completed') update.completed_at = new Date().toISOString(); }
    const { data, error } = await supabase.from('chart_lab_sessions').update(update).eq('id', body.id).eq('user_id', userId).select('*').single();
    if (error) throw error;
    return res.status(200).json({ session: data });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

/* ── resource=mastery / mistakes / report ────────────────────────────────── */

async function handleMastery(req, res, userId) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { data, error } = await supabase.from('chart_lab_mastery').select('*').eq('user_id', userId);
  if (error) throw error;
  const { data: attempts } = await supabase.from('chart_lab_attempts').select('drill_id, gp_awarded').eq('user_id', userId);
  const totalGpAwarded = (attempts || []).reduce((s, a) => s + (a.gp_awarded || 0), 0);
  const drillsCompleted = new Set((attempts || []).map((a) => a.drill_id)).size;
  return res.status(200).json({ mastery: (data || []).map(applyMasteryDecay), totalGpAwarded, drillsCompleted });
}

async function handleMistakes(req, res, userId) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { data, error } = await supabase.from('chart_lab_attempts').select('*, chart_lab_drills(title, skill_category, drill_type)')
    .eq('user_id', userId).neq('result', 'correct').order('completed_at', { ascending: false }).limit(30);
  if (error) throw error;
  return res.status(200).json({
    mistakes: (data || []).map((a) => ({
      attemptId: a.id, drillId: a.drill_id, title: a.chart_lab_drills?.title, skillCategory: a.chart_lab_drills?.skill_category,
      drillType: a.chart_lab_drills?.drill_type, score: a.score, result: a.result, completedAt: a.completed_at,
    })),
  });
}

async function handleReport(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  if (!body.drillId || !body.reason) return res.status(400).json({ error: 'Missing drillId or reason' });
  const { data, error } = await supabase.from('chart_lab_reports').insert({ user_id: userId, drill_id: body.drillId, reason: body.reason, description: body.description || null }).select('*').single();
  if (error) throw error;
  return res.status(200).json({ report: data });
}

/* ── resource=admin — drill builder, admin-only ──────────────────────────── */

function sanitizeFilename(name) {
  return (name || 'chart').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

async function handleAdmin(req, res, userId) {
  if (!(await isAdmin(userId))) return res.status(403).json({ error: 'Not authorized' });
  const body = req.body || {};
  const action = body.action || req.query.action;

  if (req.method === 'GET') {
    if (action === 'reports') {
      const { data, error } = await supabase.from('chart_lab_reports').select('*, chart_lab_drills(title)').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ reports: data || [] });
    }
    // Default admin GET: every drill regardless of status, for the builder's list view.
    const { data, error } = await supabase.from('chart_lab_drills').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ drills: (data || []).map(drillAdminShape) });
  }

  if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  switch (action) {
    case 'get_drill_detail': {
      const { data: drill } = await supabase.from('chart_lab_drills').select('*').eq('id', body.id).maybeSingle();
      if (!drill) return res.status(404).json({ error: 'Drill not found' });
      const answerKey = await currentAnswerKey(drill.id, drill.version);
      return res.status(200).json({ drill: drillAdminShape(drill), answerKey: answerKey ? answerKeyRevealShape(answerKey) : null });
    }

    case 'create_drill': {
      const row = {
        title: body.title, description: body.description || null, drill_type: body.drillType, skill_category: body.skillCategory,
        difficulty: body.difficulty || 'foundation', access_tier: body.accessTier || 'free', practice_mode: body.practiceMode || 'open_practice',
        phase_key: body.phaseKey || null, section_key: body.sectionKey || null, lesson_key: body.lessonKey || null,
        instrument: body.instrument || 'MNQ', timeframe: body.timeframe || null, historical_date: body.historicalDate || null,
        chart_format: body.chartFormat || 'static_image', chart_image_path: body.chartImagePath || null,
        chart_image_width: body.chartImageWidth || null, chart_image_height: body.chartImageHeight || null, chart_alt_text: body.chartAltText || null,
        question: body.question, estimated_seconds: body.estimatedSeconds || 60, is_seed_placeholder: !!body.isSeedPlaceholder,
        created_by: userId,
      };
      const { data, error } = await supabase.from('chart_lab_drills').insert(row).select('*').single();
      if (error) throw error;
      return res.status(200).json({ drill: drillAdminShape(data) });
    }

    case 'update_drill': {
      if (!body.id) return res.status(400).json({ error: 'Missing id' });
      const { data: existing } = await supabase.from('chart_lab_drills').select('*').eq('id', body.id).single();
      if (!existing) return res.status(404).json({ error: 'Drill not found' });
      const row = {
        title: body.title ?? existing.title, description: body.description ?? existing.description,
        drill_type: body.drillType ?? existing.drill_type, skill_category: body.skillCategory ?? existing.skill_category,
        difficulty: body.difficulty ?? existing.difficulty, access_tier: body.accessTier ?? existing.access_tier,
        practice_mode: body.practiceMode ?? existing.practice_mode, phase_key: body.phaseKey ?? existing.phase_key,
        section_key: body.sectionKey ?? existing.section_key, lesson_key: body.lessonKey ?? existing.lesson_key,
        instrument: body.instrument ?? existing.instrument, timeframe: body.timeframe ?? existing.timeframe,
        historical_date: body.historicalDate ?? existing.historical_date, chart_image_path: body.chartImagePath ?? existing.chart_image_path,
        chart_image_width: body.chartImageWidth ?? existing.chart_image_width, chart_image_height: body.chartImageHeight ?? existing.chart_image_height,
        chart_alt_text: body.chartAltText ?? existing.chart_alt_text, question: body.question ?? existing.question,
        estimated_seconds: body.estimatedSeconds ?? existing.estimated_seconds,
        related_next_drill_id: body.relatedNextDrillId ?? existing.related_next_drill_id,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('chart_lab_drills').update(row).eq('id', body.id).select('*').single();
      if (error) throw error;
      return res.status(200).json({ drill: drillAdminShape(data) });
    }

    // Answer-key edits always write a NEW (drill_id, version) row, bumping
    // chart_lab_drills.version, rather than mutating an existing answer
    // key in place — so a member's already-scored attempt (which stored
    // the version it was scored against) can never retroactively change
    // meaning, even if the admin later fixes a mistake in the answer key.
    case 'upsert_answer_key': {
      if (!body.drillId) return res.status(400).json({ error: 'Missing drillId' });
      const { data: drill } = await supabase.from('chart_lab_drills').select('id, version').eq('id', body.drillId).single();
      if (!drill) return res.status(404).json({ error: 'Drill not found' });
      const { count: attemptCount } = await supabase.from('chart_lab_attempts')
        .select('id', { count: 'exact', head: true }).eq('drill_id', body.drillId).eq('drill_version', drill.version);
      const hasAttempts = (attemptCount || 0) > 0;
      const nextVersion = hasAttempts ? drill.version + 1 : drill.version;
      if (hasAttempts) await supabase.from('chart_lab_drills').update({ version: nextVersion, updated_at: new Date().toISOString() }).eq('id', body.drillId);

      const row = {
        drill_id: body.drillId, drill_version: nextVersion, answer_type: body.answerType,
        choices: body.choices || [], correct_choice: body.correctChoice || null, correct_sequence: body.correctSequence || null,
        zones: body.zones || [], explanation: body.explanation || '', common_mistake: body.commonMistake || null,
        hints: body.hints || [], related_rule: body.relatedRule || null,
      };
      const { data, error } = hasAttempts
        ? await supabase.from('chart_lab_answer_keys').insert(row).select('*').single()
        : await supabase.from('chart_lab_answer_keys').upsert(row, { onConflict: 'drill_id,drill_version' }).select('*').single();
      if (error) throw error;
      return res.status(200).json({ answerKey: answerKeyRevealShape(data), versioned: hasAttempts, newVersion: nextVersion });
    }

    case 'upload_chart_image': {
      const { dataUrl, filename, drillId } = body;
      if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'Missing image data' });
      const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
      if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' });
      const [, mimeType, base64] = match;
      if (!CHART_ALLOWED_TYPES.includes(mimeType)) return res.status(400).json({ error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, WEBP, or GIF.` });
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > CHART_MAX_BYTES) return res.status(400).json({ error: `Image is too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB) — max 5MB.` });
      const ext = mimeType.split('/')[1] || 'jpg';
      const path = `chartlab/${drillId || 'unfiled'}/${Date.now()}-${sanitizeFilename(filename)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(CHART_BUCKET).upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;
      return res.status(200).json({ path, uploadedAt: new Date().toISOString() });
    }

    case 'publish_drill':
      return setDrillStatus(res, body.id, 'published', { published_at: new Date().toISOString() });
    case 'unpublish_drill':
      return setDrillStatus(res, body.id, 'draft', {});
    case 'archive_drill':
      return setDrillStatus(res, body.id, 'archived', {});

    case 'duplicate_drill': {
      const { data: existing } = await supabase.from('chart_lab_drills').select('*').eq('id', body.id).single();
      if (!existing) return res.status(404).json({ error: 'Drill not found' });
      const { id, created_at, updated_at, published_at, status, version, ...rest } = existing;
      const { data: created, error } = await supabase.from('chart_lab_drills').insert({ ...rest, title: `${existing.title} (Copy)`, status: 'draft', version: 1, created_by: userId }).select('*').single();
      if (error) throw error;
      const answerKey = await currentAnswerKey(existing.id, existing.version);
      if (answerKey) {
        const { id: _akId, created_at: _akCa, ...akRest } = answerKey;
        await supabase.from('chart_lab_answer_keys').insert({ ...akRest, drill_id: created.id, drill_version: 1 });
      }
      return res.status(200).json({ drill: drillAdminShape(created) });
    }

    case 'respond_report': {
      if (!body.id) return res.status(400).json({ error: 'Missing id' });
      const { data, error } = await supabase.from('chart_lab_reports').update({ status: body.status || 'reviewed', admin_response: body.adminResponse || null }).eq('id', body.id).select('*').single();
      if (error) throw error;
      return res.status(200).json({ report: data });
    }

    default:
      return res.status(400).json({ error: `Unknown admin action: ${action}` });
  }
}

async function setDrillStatus(res, id, status, extra) {
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const { data, error } = await supabase.from('chart_lab_drills').update({ status, updated_at: new Date().toISOString(), ...extra }).eq('id', id).select('*').single();
  if (error) throw error;
  return res.status(200).json({ drill: drillAdminShape(data) });
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  drills: (req, res) => handleDrills(req, res),
  'chart-image': (req, res) => handleChartImage(req, res),
  attempt: (req, res, userId) => handleAttempt(req, res, userId),
  session: (req, res, userId) => handleSession(req, res, userId),
  mastery: (req, res, userId) => handleMastery(req, res, userId),
  mistakes: (req, res, userId) => handleMistakes(req, res, userId),
  report: (req, res, userId) => handleReport(req, res, userId),
  admin: (req, res, userId) => handleAdmin(req, res, userId),
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const resourceHandler = RESOURCE_HANDLERS[req.query.resource || 'drills'];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });

  try {
    return await resourceHandler(req, res, user.id);
  } catch (err) {
    console.error('Chart Lab API error:', err);
    const notSetUp = isDbNotSetUp(err);
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The Chart Lab database tables haven’t been set up yet — see supabase/migrations/0009_chart_lab.sql. If you just ran this migration, Supabase’s API can take a minute to notice — reloading the page usually fixes it, or reload the schema cache manually under Project Settings → API.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
