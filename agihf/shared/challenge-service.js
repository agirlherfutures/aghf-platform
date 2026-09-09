/**
 * challenge-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed AGHF Monthly Challenge (agihf/api/
 * challenge-data.js, reached via the clean vercel.json-rewritten URLs).
 * Same demo-mode-fallback shape as every other *-service.js file this
 * project: window.AGHF_DEMO resolves every call against a small in-memory
 * fixture instead of the network, so every page is fully clickable in
 * preview mode with zero backend.
 */

import { authFetch as apiFetch } from './auth-fetch.js';

const now = new Date();
const inDays = (n) => new Date(now.getTime() + n * 86400000).toISOString();

const demoChallenge = {
  id: 'demo_challenge_1', name: 'September Momentum Challenge',
  description: 'Show up, build your skills, and earn entries all month long.',
  timezone: 'America/Chicago', startsAt: inDays(-10), endsAt: inDays(10), drawingAt: inDays(11),
  claimDeadlineAt: inDays(21), winnerCount: 1, alternateCount: 2, allowRepeatWinner: false,
  primaryPrizeId: 'demo_prize_1', membershipEligibility: 'all_authenticated', status: 'active',
};

const demoRules = [
  { id: 'demo_rule_lesson', challengeId: demoChallenge.id, activityType: 'lesson_completed', requiredQuantity: 1, pointsAwarded: 5, entriesAwarded: 1, label: 'Complete an Academy Lesson', sortOrder: 1, active: true },
  { id: 'demo_rule_journal', challengeId: demoChallenge.id, activityType: 'journal_entry_completed', requiredQuantity: 3, pointsAwarded: 10, entriesAwarded: 1, label: 'Log 3 Complete Journal Entries', sortOrder: 2, active: true },
  { id: 'demo_rule_checklist', challengeId: demoChallenge.id, activityType: 'checklist_completed', requiredQuantity: 1, pointsAwarded: 5, entriesAwarded: 1, label: 'Complete the Dayli ICC Checklist', sortOrder: 3, active: true },
  { id: 'demo_rule_win', challengeId: demoChallenge.id, activityType: 'win_shared', requiredQuantity: 1, pointsAwarded: 8, entriesAwarded: 2, label: 'Share a Win', sortOrder: 4, active: true },
];

const demoEntries = [
  { id: 'demo_entry_1', activityType: 'lesson_completed', ruleLabel: 'Complete an Academy Lesson', entryAmount: 1, entryStatus: 'confirmed', createdAt: inDays(-5) },
  { id: 'demo_entry_2', activityType: 'checklist_completed', ruleLabel: 'Complete the Dayli ICC Checklist', entryAmount: 1, entryStatus: 'confirmed', createdAt: inDays(-2) },
];

const demoWinners = [
  { id: 'demo_winner_1', challengeName: 'August Discipline Challenge', displayName: 'J. R.', showAvatar: true, isAlternate: false, winnerMessage: 'So grateful — I almost didn’t enter!', achievementBadge: '🏆 August Winner', publishedAt: inDays(-20) },
];

let demoPrefs = { publicOptIn: false, displayNamePreference: 'first_name_last_initial', showAvatar: true, showLevel: true };

const demoNotifications = [
  { id: 'demo_notif_1', type: 'entry_earned', title: 'You earned a new entry!', body: 'Complete the Dayli ICC Checklist — you just unlocked another giveaway entry this challenge.', linkHref: 'monthly-challenge.html#entries', readAt: null, createdAt: inDays(-2) },
];

/* ── public reads ─────────────────────────────────────────────────────── */

export async function getCurrentChallenge() {
  if (window.AGHF_DEMO) return { challenge: demoChallenge, prize: { id: 'demo_prize_1', name: 'A Free Month of Premium', estimatedValue: '$49' }, rules: demoRules };
  return apiFetch('/api/challenge-current');
}

export async function getProgress(challengeId) {
  if (window.AGHF_DEMO) {
    const activitiesCompleted = demoEntries.length;
    const points = 20;
    return {
      points, entriesEarned: demoEntries.reduce((s, e) => s + e.entryAmount, 0), activitiesCompleted,
      daysRemaining: 10, nextMilestone: { ruleId: 'demo_rule_journal', label: 'Log 3 Complete Journal Entries', remaining: 2, requiredQuantity: 3, entriesAwarded: 1 },
      qualified: true, activitiesAwayFromQualifying: 0,
      momentum: { available: true, pctChange: 25 }, challengeStatus: demoChallenge.status,
    };
  }
  return apiFetch(`/api/challenge-progress?challengeId=${encodeURIComponent(challengeId)}`);
}

export async function getEntries(challengeId) {
  if (window.AGHF_DEMO) return { entries: demoEntries, totalConfirmed: demoEntries.reduce((s, e) => s + e.entryAmount, 0) };
  return apiFetch(`/api/challenge-entries?challengeId=${encodeURIComponent(challengeId)}`);
}

export async function getLeaderboard(challengeId, category = 'overall') {
  if (window.AGHF_DEMO) {
    return {
      category,
      rows: [
        { userId: 'demo_other_1', points: 42, displayName: 'M. K.', showAvatar: true, rank: 1 },
        { userId: 'demo_other_2', points: 30, displayName: 'T. B.', showAvatar: true, rank: 2 },
      ],
      yourPosition: demoPrefs.publicOptIn ? { userId: 'demo', points: 20, displayName: 'You', rank: 3 } : null,
      optedIn: demoPrefs.publicOptIn,
    };
  }
  return apiFetch(`/api/challenge-leaderboard?challengeId=${encodeURIComponent(challengeId)}&category=${encodeURIComponent(category)}`);
}

export async function getWinners(challengeId) {
  if (window.AGHF_DEMO) return { winners: challengeId ? demoWinners.filter((w) => w.challengeId === challengeId) : demoWinners };
  const qs = challengeId ? `?challengeId=${encodeURIComponent(challengeId)}` : '';
  return apiFetch(`/api/challenge-winners${qs}`);
}

/* ── member's own prefs / notifications ──────────────────────────────── */

export async function getPrefs(challengeId) {
  if (window.AGHF_DEMO) return { prefs: demoPrefs };
  return apiFetch(`/api/challenge-prefs?challengeId=${encodeURIComponent(challengeId)}`);
}

export async function savePrefs(challengeId, prefs) {
  if (window.AGHF_DEMO) { demoPrefs = { ...demoPrefs, ...prefs }; return { success: true }; }
  return apiFetch('/api/challenge-prefs', { method: 'PATCH', body: JSON.stringify({ challengeId, ...prefs }) });
}

export async function getNotifications() {
  if (window.AGHF_DEMO) return { notifications: demoNotifications, unreadCount: demoNotifications.filter((n) => !n.readAt).length };
  return apiFetch('/api/notifications');
}

export async function markNotificationRead(id) {
  if (window.AGHF_DEMO) {
    const n = demoNotifications.find((x) => x.id === id);
    if (n) n.readAt = new Date().toISOString();
    return { success: true };
  }
  return apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
}

export async function markAllNotificationsRead() {
  if (window.AGHF_DEMO) { demoNotifications.forEach((n) => { n.readAt = n.readAt || new Date().toISOString(); }); return { success: true }; }
  return apiFetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ action: 'mark_all_read' }) });
}

/* ── admin (Challenge Manager) ────────────────────────────────────────── */

const demoAdminChallenges = [demoChallenge];
const demoAuditLog = [];

export async function adminListChallenges() {
  if (window.AGHF_DEMO) return { challenges: demoAdminChallenges };
  return apiFetch('/api/challenge-admin');
}

export async function adminCreateChallenge(fields) {
  if (window.AGHF_DEMO) {
    const created = { id: `demo_challenge_${Date.now()}`, status: 'draft', ...fields };
    demoAdminChallenges.unshift(created);
    return { challenge: created };
  }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'create_challenge', ...fields }) });
}

export async function adminUpdateChallenge(id, fields) {
  if (window.AGHF_DEMO) {
    const idx = demoAdminChallenges.findIndex((c) => c.id === id);
    if (idx >= 0) demoAdminChallenges[idx] = { ...demoAdminChallenges[idx], ...fields };
    return { challenge: demoAdminChallenges[idx] };
  }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'update_challenge', id, ...fields }) });
}

export async function adminDuplicateChallenge(id) {
  if (window.AGHF_DEMO) {
    const src = demoAdminChallenges.find((c) => c.id === id);
    const created = { ...src, id: `demo_challenge_${Date.now()}`, name: `${src.name} (Copy)`, status: 'draft' };
    demoAdminChallenges.unshift(created);
    return { challenge: created };
  }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'duplicate_challenge', id }) });
}

export async function adminSetStatus(id, status, reason) {
  if (window.AGHF_DEMO) {
    const c = demoAdminChallenges.find((x) => x.id === id);
    if (c) c.status = status;
    return { challenge: c };
  }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'set_status', id, status, reason }) });
}

export async function adminUpsertRule(rule) {
  if (window.AGHF_DEMO) {
    if (rule.id) { const idx = demoRules.findIndex((r) => r.id === rule.id); if (idx >= 0) demoRules[idx] = { ...demoRules[idx], ...rule }; return { rule: demoRules[idx] }; }
    const created = { id: `demo_rule_${Date.now()}`, active: true, ...rule };
    demoRules.push(created);
    return { rule: created };
  }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'upsert_rule', ...rule }) });
}

export async function adminDeleteRule(id) {
  if (window.AGHF_DEMO) { const idx = demoRules.findIndex((r) => r.id === id); if (idx >= 0) demoRules.splice(idx, 1); return { success: true }; }
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'delete_rule', id }) });
}

export async function adminUpsertPrize(prize) {
  if (window.AGHF_DEMO) return { prize: { id: prize.id || `demo_prize_${Date.now()}`, ...prize } };
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'upsert_prize', ...prize }) });
}

export async function adminUploadPrizeImage(file, challengeId) {
  if (window.AGHF_DEMO) return { path: `demo/prizes/${file.name}` };
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'upload_prize_image', dataUrl, filename: file.name, challengeId }) });
}

export async function adminRunDrawing(challengeId) {
  if (window.AGHF_DEMO) return { draw: { id: 'demo_draw_1', challengeId }, winners: [{ id: 'demo_pending_winner', userId: 'demo', winnerOrder: 1, verificationStatus: 'awaiting_verification' }], alreadyRan: false };
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'run_drawing', challengeId }) });
}

export async function adminVerifyWinner(winnerId, subAction, extra = {}) {
  if (window.AGHF_DEMO) return { winner: { id: winnerId, verificationStatus: subAction === 'confirm' ? 'confirmed' : subAction === 'disqualify' ? 'disqualified' : 'awaiting_verification' } };
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'verify_winner', winnerId, subAction, ...extra }) });
}

export async function adminPublishWinner(winnerId, fields = {}) {
  if (window.AGHF_DEMO) return { winner: { id: winnerId, publishedAt: new Date().toISOString(), ...fields } };
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'publish_winner', winnerId, ...fields }) });
}

export async function adminManualEntryAdjustment(challengeId, targetUserId, entryAmount, reason, ruleId) {
  if (window.AGHF_DEMO) return { success: true, entry: { id: `demo_adj_${Date.now()}`, challengeId, targetUserId, entryAmount, reason } };
  return apiFetch('/api/challenge-admin', { method: 'POST', body: JSON.stringify({ action: 'manual_entry_adjustment', challengeId, targetUserId, entryAmount, reason, ruleId }) });
}

export async function adminListAuditLog(challengeId) {
  if (window.AGHF_DEMO) return { log: demoAuditLog };
  const qs = challengeId ? `?challengeId=${encodeURIComponent(challengeId)}` : '';
  return apiFetch(`/api/challenge-admin?action=list_audit_log${qs ? `&${qs.slice(1)}` : ''}`);
}

export async function adminGetChallengeDetail(challengeId) {
  if (window.AGHF_DEMO) {
    return { challenge: demoChallenge, rules: demoRules, prize: { id: 'demo_prize_1', name: 'A Free Month of Premium', estimatedValue: '$49' }, winners: [] };
  }
  return apiFetch(`/api/challenge-admin?action=get_challenge_detail&challengeId=${encodeURIComponent(challengeId)}`);
}

export async function adminEligibleSnapshotPreview(challengeId) {
  if (window.AGHF_DEMO) return { snapshot: [], totalEligibleEntries: 0, totalEligibleMembers: 0 };
  return apiFetch(`/api/challenge-admin?action=eligible_snapshot_preview&challengeId=${encodeURIComponent(challengeId)}`);
}
