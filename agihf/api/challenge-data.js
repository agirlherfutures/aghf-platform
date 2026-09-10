// api/challenge-data.js — every "AGHF Monthly Challenge" endpoint
// (public challenge/leaderboard/winners reads, a member's own
// progress/entries/prefs/notifications, and the full Admin Challenge
// Manager), consolidated into one Vercel serverless function, dispatched
// on ?resource=, purely to stay under the Vercel Hobby plan's
// 12-serverless-function-per-deployment limit — the same reason
// agent-data.js/psychology-data.js/wins-data.js already exist as
// resource-dispatch files. This is the 12th and last available slot
// (journal-screenshot.js was folded into journal-entries.js to free it).
// vercel.json rewrites 8 clean URLs to this file with a matching
// ?resource= appended, so client code (challenge-service.js) never has
// to know about the dispatch.
//
// Two deliberate visibility rules live here, not in the DB:
// - resource=winners always forces `published_at is not null` — this is
//   the real enforcement point for "never reveal the selected winner
//   before confirmation," not a convention the client is trusted to follow.
// - resource=admin re-checks profiles.is_admin on every single call —
//   the client-side admin-page redirect is a courtesy, this is the real
//   gate. There is no other admin/role concept anywhere in this app.
//
// "Challenge points" and "giveaway entries" are two structurally separate
// numbers throughout this file (challenge_rules.points_awarded /
// challenge_activities.points_awarded vs. entries_awarded /
// giveaway_entries.entry_amount) — see 0008_monthly_challenge.sql's
// header comment. Winner selection itself lives in
// api/_lib/challenge-engine.js (server-only, uses node:crypto, never
// Math.random, never reachable from the frontend).

import { createClient } from '@supabase/supabase-js';
import { resolveDisplayName } from './_lib/display-name.js';
import { runMonthlyDrawing, buildEligibleSnapshot } from './_lib/challenge-engine.js';
import { isDbNotSetUp } from './_lib/db-error.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function notSetUpError(res, err) {
  const notSetUp = isDbNotSetUp(err);
  return res.status(notSetUp ? 503 : 500).json({
    error: notSetUp
      ? 'The Monthly Challenge database tables haven’t been set up yet — see supabase/migrations/0008_monthly_challenge.sql. If you just ran this migration, Supabase’s API can take a minute to notice — reloading the page usually fixes it, or reload the schema cache manually under Project Settings → API.'
      : err.message,
    setupRequired: notSetUp,
  });
}

async function isAdmin(userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  return !!data?.is_admin;
}

/* ── shape helpers ────────────────────────────────────────────────────── */

function challengeShape(row) {
  if (!row) return null;
  return {
    id: row.id, name: row.name, description: row.description, timezone: row.timezone,
    startsAt: row.starts_at, endsAt: row.ends_at, drawingAt: row.drawing_at, claimDeadlineAt: row.claim_deadline_at,
    winnerCount: row.winner_count, alternateCount: row.alternate_count, allowRepeatWinner: row.allow_repeat_winner,
    primaryPrizeId: row.primary_prize_id,
    eligibilityRules: row.eligibility_rules, officialRules: row.official_rules, oddsStatement: row.odds_statement,
    sponsorInfo: row.sponsor_info, privacyTerms: row.privacy_terms,
    noPurchaseNecessaryText: row.no_purchase_necessary_text, freeEntryMethodText: row.free_entry_method_text,
    membershipEligibility: row.membership_eligibility, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function prizeShape(row) {
  if (!row) return null;
  return {
    id: row.id, challengeId: row.challenge_id, name: row.name, description: row.description,
    imagePath: row.image_path, quantity: row.quantity, estimatedValue: row.estimated_value,
    fulfillmentMethod: row.fulfillment_method, claimDeadline: row.claim_deadline,
    eligibilityRestrictions: row.eligibility_restrictions, active: row.active,
  };
}

function ruleShape(row) {
  if (!row) return null;
  return {
    id: row.id, challengeId: row.challenge_id, activityType: row.activity_type,
    requiredQuantity: row.required_quantity, pointsAwarded: row.points_awarded, entriesAwarded: row.entries_awarded,
    maxEntriesPerChallenge: row.max_entries_per_challenge, dailyCap: row.daily_cap, weeklyCap: row.weekly_cap,
    membershipEligibility: row.membership_eligibility, verificationMethod: row.verification_method,
    active: row.active, startsAt: row.starts_at, endsAt: row.ends_at,
    label: row.label, description: row.description, sortOrder: row.sort_order,
  };
}

// Strict public whitelist — never email/legal name/member id/entry
// ids/balance/P&L/private activity, per the feature's own requirement.
function winnerPublicShape(row, challengeName) {
  return {
    id: row.id,
    challengeName,
    winnerOrder: row.winner_order,
    isAlternate: row.alternate_order != null,
    prizeId: row.prize_id,
    displayName: row.display_name_snapshot,
    showAvatar: row.show_avatar,
    winnerMessage: row.winner_message,
    achievementBadge: row.achievement_badge,
    publishedAt: row.published_at,
  };
}

function winnerAdminShape(row) {
  return {
    id: row.id, drawId: row.draw_id, challengeId: row.challenge_id, userId: row.user_id,
    winnerOrder: row.winner_order, alternateOrder: row.alternate_order,
    selectedEntryId: row.selected_entry_id, prizeId: row.prize_id,
    verificationStatus: row.verification_status, disqualificationReason: row.disqualification_reason,
    contactedAt: row.contacted_at, responseRecordedAt: row.response_recorded_at, responseNotes: row.response_notes,
    prizeClaimedAt: row.prize_claimed_at, prizeFulfilledAt: row.prize_fulfilled_at, fulfillmentNotes: row.fulfillment_notes,
    displayNamePreference: row.display_name_preference, displayNameSnapshot: row.display_name_snapshot,
    showAvatar: row.show_avatar, winnerMessage: row.winner_message, achievementBadge: row.achievement_badge,
    publishedAt: row.published_at, createdAt: row.created_at,
  };
}

const PUBLIC_CHALLENGE_STATUSES = [
  'active', 'entry_period_closed', 'drawing_ready', 'winner_selected',
  'awaiting_verification', 'winner_confirmed', 'published', 'completed',
];

/* ── resource=current ────────────────────────────────────────────────── */

async function handleCurrent(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { data: challenge, error } = await supabase
      .from('challenges').select('*').in('status', PUBLIC_CHALLENGE_STATUSES)
      .order('starts_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!challenge) return res.status(200).json({ challenge: null, prize: null, rules: [] });

    const [{ data: prize }, { data: rules }] = await Promise.all([
      challenge.primary_prize_id
        ? supabase.from('prizes').select('*').eq('id', challenge.primary_prize_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('challenge_rules').select('*').eq('challenge_id', challenge.id).eq('active', true).order('sort_order'),
    ]);

    return res.status(200).json({
      challenge: challengeShape(challenge), prize: prizeShape(prize), rules: (rules || []).map(ruleShape),
    });
  } catch (err) {
    console.error('Challenge current API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=progress ───────────────────────────────────────────────── */

async function handleProgress(req, res, userId) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { challengeId } = req.query;
    if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });

    const { data: challenge } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const [{ data: entries }, { data: activities }, { data: rules }] = await Promise.all([
      supabase.from('giveaway_entries').select('entry_amount').eq('challenge_id', challengeId).eq('user_id', userId).eq('entry_status', 'confirmed'),
      supabase.from('challenge_activities').select('id, rule_id, points_awarded, occurred_at').eq('challenge_id', challengeId).eq('user_id', userId).is('invalidated_at', null),
      supabase.from('challenge_rules').select('*').eq('challenge_id', challengeId).eq('active', true),
    ]);

    const entriesEarned = (entries || []).reduce((s, e) => s + e.entry_amount, 0);
    const activitiesCompleted = (activities || []).length;
    const points = (activities || []).reduce((s, a) => s + (a.points_awarded || 0), 0);

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - now) / oneDay));

    // Momentum: only compared when both windows have real activity.
    const weekAgo = now - 7 * oneDay;
    const twoWeeksAgo = now - 14 * oneDay;
    const thisWeekPoints = (activities || []).filter((a) => new Date(a.occurred_at).getTime() >= weekAgo).reduce((s, a) => s + (a.points_awarded || 0), 0);
    const lastWeekPoints = (activities || []).filter((a) => { const t = new Date(a.occurred_at).getTime(); return t >= twoWeeksAgo && t < weekAgo; }).reduce((s, a) => s + (a.points_awarded || 0), 0);
    const momentum = (thisWeekPoints > 0 && lastWeekPoints > 0)
      ? { available: true, pctChange: Math.round(((thisWeekPoints - lastWeekPoints) / lastWeekPoints) * 100) }
      : { available: false, pctChange: null };

    // Next milestone: the rule closest to its next threshold.
    let nextMilestone = null;
    let bestRemaining = Infinity;
    for (const rule of rules || []) {
      const countForRule = (activities || []).filter((a) => a.rule_id === rule.id).length;
      const remaining = rule.required_quantity - (countForRule % rule.required_quantity);
      if (remaining < bestRemaining && remaining > 0) {
        bestRemaining = remaining;
        nextMilestone = { ruleId: rule.id, label: rule.label, remaining, requiredQuantity: rule.required_quantity, entriesAwarded: rule.entries_awarded };
      }
    }

    const qualified = entriesEarned > 0;

    return res.status(200).json({
      points, entriesEarned, activitiesCompleted, daysRemaining, nextMilestone,
      currentStreak: null, // no single "challenge streak" concept exists; shown only "if applicable" by the frontend
      qualified,
      activitiesAwayFromQualifying: qualified ? 0 : (nextMilestone?.remaining ?? null),
      momentum,
      challengeStatus: challenge.status,
    });
  } catch (err) {
    console.error('Challenge progress API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=entries (member's own private ledger) ─────────────────── */

async function handleEntriesLedger(req, res, userId) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { challengeId } = req.query;
    if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });

    const { data: entries, error } = await supabase
      .from('giveaway_entries').select('*, challenge_activities(source_table, source_record_id)')
      .eq('challenge_id', challengeId).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;

    const ruleIds = [...new Set((entries || []).map((e) => e.rule_id).filter(Boolean))];
    const { data: rules } = ruleIds.length
      ? await supabase.from('challenge_rules').select('id, label, activity_type').in('id', ruleIds)
      : { data: [] };
    const ruleById = new Map((rules || []).map((r) => [r.id, r]));

    const shaped = (entries || []).map((e) => ({
      id: e.id,
      activityType: ruleById.get(e.rule_id)?.activity_type || null,
      ruleLabel: ruleById.get(e.rule_id)?.label || 'Entry',
      entryAmount: e.entry_amount,
      entryStatus: e.entry_status,
      sourceTable: e.challenge_activities?.source_table || null,
      sourceRecordId: e.challenge_activities?.source_record_id || null,
      adjustmentReason: e.adjustment_reason,
      createdAt: e.created_at,
      reversedAt: e.reversed_at,
    }));
    const totalConfirmed = shaped.filter((e) => e.entryStatus === 'confirmed').reduce((s, e) => s + e.entryAmount, 0);

    return res.status(200).json({ entries: shaped, totalConfirmed });
  } catch (err) {
    console.error('Challenge entries API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=leaderboard (public, category-based, always includes
   "Your Position") ──────────────────────────────────────────────────── */

const CATEGORY_ACTIVITY_TYPES = {
  overall: null, // null = every activity type counts
  academy: ['lesson_completed', 'academy_phase_completed', 'section_checkpoint_cleared'],
  consistency: ['journal_entry_completed', 'checklist_completed'],
  chart_practice: ['chart_lab_completed', 'scenario_lab_attempt'],
  mindset: ['psychology_session_completed', 'pass_this_trade'],
  community: ['community_event_attended', 'win_shared', 'challenge_task_completed'],
  rising: null, // same activity types as overall, but ranked on the last-7-days delta, not the total
};

async function handleLeaderboard(req, res, userId) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { challengeId, category = 'overall' } = req.query;
    if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });
    if (!(category in CATEGORY_ACTIVITY_TYPES)) return res.status(400).json({ error: `Unknown category: ${category}` });
    const limit = Math.min(Number(req.query.limit) || 20, 20);

    let query = supabase.from('challenge_activities').select('user_id, points_awarded, occurred_at, activity_type')
      .eq('challenge_id', challengeId).is('invalidated_at', null).limit(5000);
    const types = CATEGORY_ACTIVITY_TYPES[category];
    if (types) query = query.in('activity_type', types);
    const { data: activities, error } = await query;
    if (error) throw error;

    const isRising = category === 'rising';
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pointsByUser = new Map();
    for (const a of activities || []) {
      if (isRising && new Date(a.occurred_at).getTime() < weekAgo) continue;
      pointsByUser.set(a.user_id, (pointsByUser.get(a.user_id) || 0) + (a.points_awarded || 0));
    }

    const { data: prefs } = await supabase.from('challenge_member_prefs').select('*').eq('challenge_id', challengeId);
    const prefsByUser = new Map((prefs || []).map((p) => [p.user_id, p]));

    const optedInUserIds = [...pointsByUser.keys()].filter((uid) => prefsByUser.get(uid)?.public_opt_in);
    const { data: profiles } = optedInUserIds.length
      ? await supabase.from('profiles').select('id, full_name, level, level_name').in('id', optedInUserIds)
      : { data: [] };
    const profileById = new Map((profiles || []).map((p) => [p.id, p]));

    const ranked = [...pointsByUser.entries()]
      .filter(([uid]) => prefsByUser.get(uid)?.public_opt_in)
      .map(([uid, pts]) => {
        const pref = prefsByUser.get(uid);
        const profile = profileById.get(uid);
        return {
          userId: uid,
          points: pts,
          displayName: resolveDisplayName(pref.display_name_preference, profile, null),
          showAvatar: pref.show_avatar,
          level: pref.show_level ? profile?.level_name : null,
        };
      })
      .sort((a, b) => b.points - a.points);

    ranked.forEach((r, i) => { r.rank = i + 1; });
    const top = ranked.slice(0, limit);

    // "Your Position" — computed even if the caller opted out entirely
    // (in which case her rank isn't computable against the public set,
    // so this is null and the frontend shows "keeping your ranking
    // private" instead).
    const callerOptedIn = prefsByUser.get(userId)?.public_opt_in;
    const yourPosition = callerOptedIn
      ? (ranked.find((r) => r.userId === userId) || { userId, points: pointsByUser.get(userId) || 0, rank: null })
      : null;

    return res.status(200).json({ category, rows: top, yourPosition, optedIn: !!callerOptedIn });
  } catch (err) {
    console.error('Challenge leaderboard API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=winners (public — Previous Winners + current-challenge
   winner card; always filters published_at is not null, the real
   server-side enforcement against revealing a pre-verification winner) ── */

async function handleWinners(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { challengeId } = req.query;

    let query = supabase.from('giveaway_winners').select('*').not('published_at', 'is', null).order('published_at', { ascending: false });
    if (challengeId) query = query.eq('challenge_id', challengeId);
    const { data: winners, error } = await query.limit(100);
    if (error) throw error;

    const challengeIds = [...new Set((winners || []).map((w) => w.challenge_id))];
    const { data: challenges } = challengeIds.length
      ? await supabase.from('challenges').select('id, name, starts_at').in('id', challengeIds)
      : { data: [] };
    const challengeById = new Map((challenges || []).map((c) => [c.id, c]));

    const shaped = (winners || []).map((w) => winnerPublicShape(w, challengeById.get(w.challenge_id)?.name || null));
    return res.status(200).json({ winners: shaped });
  } catch (err) {
    console.error('Challenge winners API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=prefs ──────────────────────────────────────────────────── */

async function handlePrefs(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { challengeId } = req.query;
      if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });
      const { data, error } = await supabase.from('challenge_member_prefs').select('*').eq('challenge_id', challengeId).eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return res.status(200).json({
        prefs: data ? {
          publicOptIn: data.public_opt_in, displayNamePreference: data.display_name_preference,
          showAvatar: data.show_avatar, showLevel: data.show_level,
        } : { publicOptIn: false, displayNamePreference: 'first_name_last_initial', showAvatar: true, showLevel: true },
      });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (!body.challengeId) return res.status(400).json({ error: 'Missing challengeId' });
      const row = {
        challenge_id: body.challengeId, user_id: userId,
        public_opt_in: !!body.publicOptIn,
        display_name_preference: body.displayNamePreference || 'first_name_last_initial',
        show_avatar: body.showAvatar !== false,
        show_level: body.showLevel !== false,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('challenge_member_prefs').upsert(row, { onConflict: 'challenge_id,user_id' });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Challenge prefs API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=notifications ──────────────────────────────────────────── */

async function handleNotifications(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      const unreadCount = (data || []).filter((n) => !n.read_at).length;
      return res.status(200).json({
        notifications: (data || []).map((n) => ({
          id: n.id, type: n.type, title: n.title, body: n.body, linkHref: n.link_href, readAt: n.read_at, createdAt: n.created_at,
        })),
        unreadCount,
      });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (body.action === 'mark_all_read') {
        const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      if (body.id) {
        const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', body.id).eq('user_id', userId);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Missing id or action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Challenge notifications API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=admin (every branch re-checks is_admin server-side) ──────── */

const CHALLENGE_STATUS_TRANSITIONS = {
  draft: ['scheduled', 'cancelled'],
  scheduled: ['active', 'cancelled'],
  active: ['entry_period_closed', 'cancelled'],
  entry_period_closed: ['drawing_ready', 'cancelled'],
  drawing_ready: ['cancelled'], // drawing_ready -> awaiting_verification only via run_drawing, never a plain status set
  awaiting_verification: ['cancelled'], // -> winner_confirmed only via verify/publish actions
  winner_confirmed: ['published', 'cancelled'],
  published: ['completed'],
  completed: [],
  cancelled: [],
};

async function writeAudit({ challengeId, adminId, action, targetTable, targetId, reason, previousValue, newValue }) {
  await supabase.from('challenge_audit_log').insert({
    challenge_id: challengeId || null, admin_id: adminId, action,
    target_table: targetTable || null, target_id: targetId || null, reason: reason || null,
    previous_value: previousValue ?? null, new_value: newValue ?? null,
  });
}

async function handleAdmin(req, res, userId) {
  if (!(await isAdmin(userId))) return res.status(403).json({ error: 'Not authorized' });

  try {
    const body = req.body || {};
    const action = body.action || req.query.action;

    if (req.method === 'GET') {
      if (action === 'list_audit_log') {
        const { challengeId, limit } = req.query;
        let query = supabase.from('challenge_audit_log').select('*').order('created_at', { ascending: false }).limit(Number(limit) || 100);
        if (challengeId) query = query.eq('challenge_id', challengeId);
        const { data, error } = await query;
        if (error) throw error;
        return res.status(200).json({ log: data || [] });
      }
      if (action === 'eligible_snapshot_preview') {
        const { challengeId } = req.query;
        if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });
        const snapshot = await buildEligibleSnapshot(supabase, challengeId);
        return res.status(200).json(snapshot);
      }
      if (action === 'preview_member_experience') {
        const { targetUserId, challengeId } = req.query;
        if (!targetUserId || !challengeId) return res.status(400).json({ error: 'Missing targetUserId or challengeId' });
        return handleProgress({ method: 'GET', query: { challengeId } }, res, targetUserId);
      }
      if (action === 'get_challenge_detail') {
        const { challengeId } = req.query;
        if (!challengeId) return res.status(400).json({ error: 'Missing challengeId' });
        const [{ data: challenge }, { data: rules }, { data: winners }] = await Promise.all([
          supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle(),
          supabase.from('challenge_rules').select('*').eq('challenge_id', challengeId).order('sort_order'),
          supabase.from('giveaway_winners').select('*').eq('challenge_id', challengeId).order('created_at', { ascending: true }),
        ]);
        if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
        const { data: prize } = challenge.primary_prize_id
          ? await supabase.from('prizes').select('*').eq('id', challenge.primary_prize_id).maybeSingle()
          : { data: null };
        return res.status(200).json({
          challenge: challengeShape(challenge), rules: (rules || []).map(ruleShape), prize: prizeShape(prize),
          winners: (winners || []).map(winnerAdminShape),
        });
      }
      // Default admin GET: list all challenges (any status) for the manager's list view.
      const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ challenges: (data || []).map(challengeShape) });
    }

    if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

    switch (action) {
      case 'create_challenge': {
        const row = {
          name: body.name, description: body.description || null, timezone: body.timezone || 'America/Chicago',
          starts_at: body.startsAt, ends_at: body.endsAt, drawing_at: body.drawingAt, claim_deadline_at: body.claimDeadlineAt || null,
          winner_count: body.winnerCount || 1, alternate_count: body.alternateCount ?? 2, allow_repeat_winner: !!body.allowRepeatWinner,
          eligibility_rules: body.eligibilityRules || null, official_rules: body.officialRules || null, odds_statement: body.oddsStatement || null,
          sponsor_info: body.sponsorInfo || null, privacy_terms: body.privacyTerms || null,
          no_purchase_necessary_text: body.noPurchaseNecessaryText || null, free_entry_method_text: body.freeEntryMethodText || null,
          created_by: userId,
        };
        const { data, error } = await supabase.from('challenges').insert(row).select('*').single();
        if (error) throw error;
        await writeAudit({ challengeId: data.id, adminId: userId, action: 'create_challenge', targetTable: 'challenges', targetId: data.id, newValue: row });
        return res.status(200).json({ challenge: challengeShape(data) });
      }

      case 'update_challenge': {
        if (!body.id) return res.status(400).json({ error: 'Missing id' });
        const { data: existing } = await supabase.from('challenges').select('*').eq('id', body.id).single();
        if (!existing) return res.status(404).json({ error: 'Challenge not found' });
        const row = {
          name: body.name ?? existing.name, description: body.description ?? existing.description,
          timezone: body.timezone ?? existing.timezone, starts_at: body.startsAt ?? existing.starts_at,
          ends_at: body.endsAt ?? existing.ends_at, drawing_at: body.drawingAt ?? existing.drawing_at,
          claim_deadline_at: body.claimDeadlineAt ?? existing.claim_deadline_at,
          winner_count: body.winnerCount ?? existing.winner_count, alternate_count: body.alternateCount ?? existing.alternate_count,
          allow_repeat_winner: body.allowRepeatWinner ?? existing.allow_repeat_winner,
          primary_prize_id: body.primaryPrizeId ?? existing.primary_prize_id,
          eligibility_rules: body.eligibilityRules ?? existing.eligibility_rules, official_rules: body.officialRules ?? existing.official_rules,
          odds_statement: body.oddsStatement ?? existing.odds_statement, sponsor_info: body.sponsorInfo ?? existing.sponsor_info,
          privacy_terms: body.privacyTerms ?? existing.privacy_terms,
          no_purchase_necessary_text: body.noPurchaseNecessaryText ?? existing.no_purchase_necessary_text,
          free_entry_method_text: body.freeEntryMethodText ?? existing.free_entry_method_text,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('challenges').update(row).eq('id', body.id).select('*').single();
        if (error) throw error;
        await writeAudit({ challengeId: body.id, adminId: userId, action: 'update_challenge', targetTable: 'challenges', targetId: body.id, previousValue: existing, newValue: row });
        return res.status(200).json({ challenge: challengeShape(data) });
      }

      case 'duplicate_challenge': {
        if (!body.id) return res.status(400).json({ error: 'Missing id' });
        const { data: existing } = await supabase.from('challenges').select('*').eq('id', body.id).single();
        if (!existing) return res.status(404).json({ error: 'Challenge not found' });
        const { id, created_at, updated_at, status, ...rest } = existing;
        const { data: created, error } = await supabase.from('challenges').insert({ ...rest, name: `${existing.name} (Copy)`, status: 'draft', created_by: userId }).select('*').single();
        if (error) throw error;
        const { data: rules } = await supabase.from('challenge_rules').select('*').eq('challenge_id', body.id);
        if (rules?.length) {
          await supabase.from('challenge_rules').insert(rules.map(({ id: _rid, challenge_id: _cid, created_at: _ca, updated_at: _ua, ...r }) => ({ ...r, challenge_id: created.id })));
        }
        await writeAudit({ challengeId: created.id, adminId: userId, action: 'duplicate_challenge', targetTable: 'challenges', targetId: created.id, previousValue: { sourceChallengeId: body.id } });
        return res.status(200).json({ challenge: challengeShape(created) });
      }

      case 'delete_challenge': {
        if (!body.id) return res.status(400).json({ error: 'Missing id' });
        const { data: existing } = await supabase.from('challenges').select('*').eq('id', body.id).single();
        if (!existing) return res.status(404).json({ error: 'Challenge not found' });
        // Audit row is written before the delete so there's a permanent record even
        // though every child table (rules/entries/draws/winners/prefs) cascades away —
        // challenge_audit_log.challenge_id itself is ON DELETE SET NULL, so this row survives.
        await writeAudit({ challengeId: body.id, adminId: userId, action: 'delete_challenge', targetTable: 'challenges', targetId: body.id, previousValue: existing });
        const { error } = await supabase.from('challenges').delete().eq('id', body.id);
        if (error) throw error;
        return res.status(200).json({ success: true });
      }

      case 'archive_challenge':
        return handleSetStatus(res, { challengeId: body.id, nextStatus: 'cancelled', adminId: userId, reason: body.reason });

      case 'set_status':
        return handleSetStatus(res, { challengeId: body.id, nextStatus: body.status, adminId: userId, reason: body.reason });

      case 'upsert_rule': {
        const row = {
          challenge_id: body.challengeId, activity_type: body.activityType, required_quantity: body.requiredQuantity || 1,
          points_awarded: body.pointsAwarded ?? 0, entries_awarded: body.entriesAwarded ?? 1,
          max_entries_per_challenge: body.maxEntriesPerChallenge ?? null, daily_cap: body.dailyCap ?? null, weekly_cap: body.weeklyCap ?? null,
          membership_eligibility: body.membershipEligibility || 'all_authenticated', verification_method: body.verificationMethod || 'automatic',
          active: body.active !== false, starts_at: body.startsAt || null, ends_at: body.endsAt || null,
          label: body.label, description: body.description || null, sort_order: body.sortOrder ?? 0,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = body.id
          ? await supabase.from('challenge_rules').update(row).eq('id', body.id).select('*').single()
          : await supabase.from('challenge_rules').insert(row).select('*').single();
        if (error) throw error;
        await writeAudit({ challengeId: row.challenge_id, adminId: userId, action: body.id ? 'update_rule' : 'create_rule', targetTable: 'challenge_rules', targetId: data.id, newValue: row });
        return res.status(200).json({ rule: ruleShape(data) });
      }

      case 'delete_rule': {
        if (!body.id) return res.status(400).json({ error: 'Missing id' });
        const { error } = await supabase.from('challenge_rules').delete().eq('id', body.id);
        if (error) throw error;
        await writeAudit({ adminId: userId, action: 'delete_rule', targetTable: 'challenge_rules', targetId: body.id });
        return res.status(200).json({ success: true });
      }

      case 'upsert_prize': {
        const row = {
          challenge_id: body.challengeId, name: body.name, description: body.description || null,
          image_path: body.imagePath || null, quantity: body.quantity || 1, estimated_value: body.estimatedValue || null,
          fulfillment_method: body.fulfillmentMethod || 'manual_checklist', claim_deadline: body.claimDeadline || null,
          eligibility_restrictions: body.eligibilityRestrictions || null, active: body.active !== false,
        };
        const { data, error } = body.id
          ? await supabase.from('prizes').update(row).eq('id', body.id).select('*').single()
          : await supabase.from('prizes').insert(row).select('*').single();
        if (error) throw error;
        await writeAudit({ challengeId: row.challenge_id, adminId: userId, action: body.id ? 'update_prize' : 'create_prize', targetTable: 'prizes', targetId: data.id, newValue: row });

        // A brand-new prize with nothing else configured yet becomes the
        // challenge's primary prize automatically — every challenge needs
        // at least one to mean anything, and there's no separate "set
        // primary prize" UI action to require instead.
        if (!body.id) {
          const { data: challengeRow } = await supabase.from('challenges').select('primary_prize_id').eq('id', row.challenge_id).maybeSingle();
          if (challengeRow && !challengeRow.primary_prize_id) {
            await supabase.from('challenges').update({ primary_prize_id: data.id, updated_at: new Date().toISOString() }).eq('id', row.challenge_id);
          }
        }
        return res.status(200).json({ prize: prizeShape(data) });
      }

      case 'upload_prize_image': {
        const { dataUrl, filename, challengeId } = body;
        if (!dataUrl) return res.status(400).json({ error: 'Missing image data' });
        const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
        if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' });
        const [, mimeType, base64] = match;
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
          return res.status(400).json({ error: `Unsupported image type: ${mimeType}` });
        }
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Image is too large — max 5MB.' });
        const ext = mimeType.split('/')[1] || 'jpg';
        const path = `prizes/${challengeId || 'unfiled'}/${Date.now()}-${(filename || 'prize').replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('win-media').upload(path, buffer, { contentType: mimeType, upsert: false });
        if (uploadErr) throw uploadErr;
        return res.status(200).json({ path });
      }

      case 'run_drawing': {
        if (!body.challengeId) return res.status(400).json({ error: 'Missing challengeId' });
        const result = await runMonthlyDrawing(supabase, { challengeId: body.challengeId, adminUserId: userId });
        return res.status(200).json({
          draw: result.draw, winners: (result.winners || []).map(winnerAdminShape), alreadyRan: result.alreadyRan,
        });
      }

      case 'verify_winner':
        return handleVerifyWinner(res, { ...body, adminId: userId });

      case 'publish_winner': {
        if (!body.winnerId) return res.status(400).json({ error: 'Missing winnerId' });
        const { data: winner } = await supabase.from('giveaway_winners').select('*').eq('id', body.winnerId).single();
        if (!winner) return res.status(404).json({ error: 'Winner not found' });
        if (winner.verification_status !== 'confirmed') return res.status(409).json({ error: 'Winner must be confirmed before publishing' });

        const [{ data: profile }, { data: authUser }, { data: challenge }] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', winner.user_id).maybeSingle(),
          supabase.auth.admin.getUserById(winner.user_id),
          supabase.from('challenges').select('*').eq('id', winner.challenge_id).single(),
        ]);
        const displayNameSnapshot = resolveDisplayName(body.displayNamePreference || winner.display_name_preference, profile, authUser?.user?.email);

        const { data: updated, error } = await supabase.from('giveaway_winners').update({
          display_name_preference: body.displayNamePreference || winner.display_name_preference,
          display_name_snapshot: displayNameSnapshot,
          show_avatar: body.showAvatar ?? winner.show_avatar,
          winner_message: body.winnerMessage ?? winner.winner_message,
          achievement_badge: body.achievementBadge ?? winner.achievement_badge,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', body.winnerId).select('*').single();
        if (error) throw error;

        await writeAudit({ challengeId: winner.challenge_id, adminId: userId, action: 'publish_winner', targetTable: 'giveaway_winners', targetId: body.winnerId });
        await supabase.from('notifications').insert({
          user_id: winner.user_id, challenge_id: winner.challenge_id, type: 'winner_confirmed', batch_key: winner.id,
          title: 'Congratulations — you won!', body: `You're a confirmed winner in ${challenge?.name || 'the AGHF Monthly Challenge'}. Check your prize details.`,
          link_href: 'monthly-challenge.html',
        });

        // Flip challenge status once every non-disqualified/non-promoted-out winner slot is published.
        const { data: allWinners } = await supabase.from('giveaway_winners').select('verification_status, published_at').eq('challenge_id', winner.challenge_id).eq('alternate_order', null);
        const allDone = (allWinners || []).every((w) => w.verification_status === 'disqualified' || w.published_at);
        if (allDone) await supabase.from('challenges').update({ status: 'published', updated_at: new Date().toISOString() }).eq('id', winner.challenge_id);

        return res.status(200).json({ winner: winnerAdminShape(updated) });
      }

      case 'manual_entry_adjustment': {
        const { challengeId, targetUserId, entryAmount, reason, ruleId } = body;
        if (!challengeId || !targetUserId || !entryAmount || !reason) {
          return res.status(400).json({ error: 'Missing challengeId, targetUserId, entryAmount, or reason' });
        }
        const { data: prior } = await supabase.from('giveaway_entries').select('entry_amount').eq('challenge_id', challengeId).eq('user_id', targetUserId).eq('entry_status', 'confirmed');
        const previousValue = (prior || []).reduce((s, e) => s + e.entry_amount, 0);
        const { data: created, error } = await supabase.from('giveaway_entries').insert({
          challenge_id: challengeId, user_id: targetUserId, rule_id: ruleId || null,
          entry_amount: Math.abs(entryAmount), entry_status: entryAmount > 0 ? 'manually_added' : 'reversed',
          adjusted_by: userId, adjustment_reason: reason, previous_value: previousValue, new_value: previousValue + entryAmount,
          reversed_at: entryAmount < 0 ? new Date().toISOString() : null,
        }).select('*').single();
        if (error) throw error;
        await writeAudit({ challengeId, adminId: userId, action: 'manual_entry_adjustment', targetTable: 'giveaway_entries', targetId: created.id, reason, previousValue, newValue: previousValue + entryAmount });
        return res.status(200).json({ success: true, entry: created });
      }

      default:
        return res.status(400).json({ error: `Unknown admin action: ${action}` });
    }
  } catch (err) {
    console.error('Challenge admin API error:', err);
    return notSetUpError(res, err);
  }
}

async function handleSetStatus(res, { challengeId, nextStatus, adminId, reason }) {
  if (!challengeId || !nextStatus) return res.status(400).json({ error: 'Missing id or status' });
  const { data: existing } = await supabase.from('challenges').select('status').eq('id', challengeId).single();
  if (!existing) return res.status(404).json({ error: 'Challenge not found' });
  const allowed = CHALLENGE_STATUS_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(nextStatus)) {
    return res.status(409).json({ error: `Cannot move a challenge from "${existing.status}" to "${nextStatus}" directly.` });
  }
  const { data, error } = await supabase.from('challenges').update({ status: nextStatus, updated_at: new Date().toISOString() }).eq('id', challengeId).select('*').single();
  if (error) throw error;
  await writeAudit({ challengeId, adminId, action: 'status_change', targetTable: 'challenges', targetId: challengeId, reason, previousValue: existing.status, newValue: nextStatus });

  if (nextStatus === 'entry_period_closed') {
    await supabase.from('notifications').insert({ user_id: adminId, challenge_id: challengeId, type: 'entry_period_closed', title: 'Entry period closed', body: 'Entries are being finalized.' }).select();
  }
  return res.status(200).json({ challenge: challengeShape(data) });
}

async function handleVerifyWinner(res, { winnerId, subAction, reason, adminId, notes }) {
  if (!winnerId || !subAction) return res.status(400).json({ error: 'Missing winnerId or subAction' });
  const { data: winner } = await supabase.from('giveaway_winners').select('*').eq('id', winnerId).single();
  if (!winner) return res.status(404).json({ error: 'Winner not found' });

  const now = new Date().toISOString();
  let update = null;
  let auditAction = `verify_winner_${subAction}`;

  switch (subAction) {
    case 'confirm':
      update = { verification_status: 'confirmed', verified_by: adminId, updated_at: now };
      break;
    case 'disqualify': {
      if (!reason) return res.status(400).json({ error: 'A reason is required to disqualify a winner' });
      update = { verification_status: 'disqualified', disqualification_reason: reason, verified_by: adminId, updated_at: now };
      break;
    }
    case 'promote_alternate': {
      // Promote the next-in-line alternate for this challenge into the
      // vacated winner slot, preserving the disqualified row for audit.
      const { data: nextAlternate } = await supabase.from('giveaway_winners').select('*')
        .eq('challenge_id', winner.challenge_id).not('alternate_order', 'is', null).eq('verification_status', 'awaiting_verification')
        .order('alternate_order', { ascending: true }).limit(1).maybeSingle();
      if (!nextAlternate) return res.status(409).json({ error: 'No remaining alternates to promote' });
      await supabase.from('giveaway_winners').update({ winner_order: winner.winner_order, alternate_order: null, updated_at: now }).eq('id', nextAlternate.id);
      await supabase.from('notifications').insert({ user_id: nextAlternate.user_id, challenge_id: winner.challenge_id, type: 'alternate_promoted', title: 'You may have been promoted to a winner slot', body: 'We’re verifying a few details — check back soon.' });
      await writeAudit({ challengeId: winner.challenge_id, adminId, action: 'promote_alternate', targetTable: 'giveaway_winners', targetId: nextAlternate.id, previousValue: { promotedFromWinnerId: winnerId } });
      return res.status(200).json({ promoted: winnerAdminShape({ ...nextAlternate, winner_order: winner.winner_order, alternate_order: null }) });
    }
    case 'contact':
      update = { contacted_at: now };
      break;
    case 'record_response':
      update = { response_recorded_at: now, response_notes: notes || null };
      break;
    case 'mark_claimed':
      update = { prize_claimed_at: now };
      break;
    case 'mark_fulfilled': {
      update = { prize_fulfilled_at: now, fulfillment_notes: notes || null };
      break;
    }
    default:
      return res.status(400).json({ error: `Unknown verify sub-action: ${subAction}` });
  }

  const { data, error } = await supabase.from('giveaway_winners').update(update).eq('id', winnerId).select('*').single();
  if (error) throw error;
  await writeAudit({ challengeId: winner.challenge_id, adminId, action: auditAction, targetTable: 'giveaway_winners', targetId: winnerId, reason, previousValue: winner.verification_status, newValue: update.verification_status || winner.verification_status });

  if (subAction === 'mark_fulfilled') {
    await supabase.from('notifications').insert({ user_id: winner.user_id, challenge_id: winner.challenge_id, type: 'prize_fulfilled', title: 'Your prize is on its way!', body: notes || 'Your prize has been fulfilled.' });
  }

  return res.status(200).json({ winner: winnerAdminShape(data) });
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  current: handleCurrent,
  progress: handleProgress,
  entries: handleEntriesLedger,
  leaderboard: handleLeaderboard,
  winners: handleWinners,
  prefs: handlePrefs,
  notifications: handleNotifications,
  admin: handleAdmin,
};

export default async function handler(req, res) {
  const resourceHandler = RESOURCE_HANDLERS[req.query.resource];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });

  // `current` and `winners` are intentionally public reads (no
  // Authorization header required) — everything else needs a verified
  // member.
  if (resourceHandler === handleCurrent || resourceHandler === handleWinners) {
    return resourceHandler(req, res);
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  return resourceHandler(req, res, user.id);
}
