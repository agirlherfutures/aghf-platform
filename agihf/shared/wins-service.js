/**
 * wins-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed "Share My Win" feature (agihf/api/
 * wins-data.js). Same demo-mode-fallback shape as journal-service.js: no
 * real session token exists in demo/preview mode, so every call resolves
 * against a small in-memory array instead of pretending to hit the
 * network. The 3 seeded demoWins rows exist ONLY inside this in-memory
 * array, gated by window.AGHF_DEMO — they are never written anywhere
 * persistent and can never appear in a real production Win Wall, which
 * always starts genuinely empty until a real member submits something.
 */

import { authFetch as apiFetch } from './auth-fetch.js';

const demoWins = [
  {
    id: 'demo_win_1', userId: 'demo', primaryCategory: 'passed_evaluation',
    headline: 'I Passed My First Evaluation', story: 'Six weeks of following my plan, and it finally clicked on attempt three.',
    whatHelped: ['Dayli ICC Checklist', 'AGHF Academy'],
    testimonialText: 'The Dayli ICC Checklist kept me from forcing trades on choppy days.',
    displayNameSnapshot: 'Demo Member', isAnonymous: false, media: [], rating: 5,
    consent: { winWall: true, communityFeature: true, socialMedia: false, websitePromo: false, privateOnly: false },
    status: 'featured', isVerified: true, featuredAt: new Date().toISOString(), approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_win_2', userId: 'demo', primaryCategory: 'walked_away_discipline',
    headline: 'I Walked Away', story: 'Setup didn’t line up. Closed the laptop instead of forcing it. That’s the whole win.',
    whatHelped: ['Trade Journal'], displayNameSnapshot: 'A. R.', isAnonymous: false, media: [],
    consent: { winWall: true, communityFeature: false, socialMedia: false, websitePromo: false, privateOnly: false },
    status: 'approved', isVerified: false, approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_win_3', userId: 'demo', primaryCategory: 'mindset_breakthrough',
    headline: 'Market Structure Finally Clicked', story: 'I stopped trying to predict and started reading what price was actually doing.',
    whatHelped: ['AGHF Academy'], displayNameSnapshot: 'Anonymous AGHF Member', isAnonymous: true, media: [],
    consent: { winWall: true, communityFeature: true, socialMedia: false, websitePromo: false, privateOnly: false },
    status: 'approved', isVerified: false, approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_win_4', userId: 'demo', primaryCategory: 'consistency_streak',
    headline: 'My First Clean Week', story: 'Five days, five plans followed. No revenge trades.',
    whatHelped: ['Trade Journal', 'AGHF Agent'], testimonialText: 'Being able to see the week laid out really changed how I plan my next session.',
    displayNameSnapshot: 'Demo Member', isAnonymous: false, media: [], rating: 4,
    consent: { winWall: true, communityFeature: false, socialMedia: false, websitePromo: false, privateOnly: false },
    status: 'submitted', isVerified: false, submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];
const demoReactions = []; // { winId, reactionType }

/** @returns {Promise<import('./dashboard-models.js').WinSubmissionRecord|null>} */
export async function getWin(id) {
  if (window.AGHF_DEMO) return demoWins.find((w) => w.id === id) || null;
  const { win } = await apiFetch(`/api/wins-submissions?id=${id}`);
  return win;
}

/** @returns {Promise<import('./dashboard-models.js').WinSubmissionRecord[]>} */
export async function listMyWins() {
  if (window.AGHF_DEMO) return demoWins.filter((w) => w.userId === 'demo').slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const { wins } = await apiFetch('/api/wins-submissions?scope=mine');
  return wins || [];
}

/** @param {{category?: string, sort?: 'newest'|'featured', limit?: number}} filters
 * @returns {Promise<import('./dashboard-models.js').WinSubmissionRecord[]>} */
export async function listPublicWins(filters = {}) {
  if (window.AGHF_DEMO) {
    let rows = demoWins.filter((w) => ['approved', 'featured'].includes(w.status));
    if (filters.category && filters.category !== 'all') {
      rows = rows.filter((w) => w.primaryCategory === filters.category || w.secondaryCategory === filters.category);
    }
    return filters.sort === 'featured' ? rows.sort((a, b) => (b.status === 'featured') - (a.status === 'featured')) : rows;
  }
  const qs = new URLSearchParams({ scope: 'public', ...filters }).toString();
  const { wins } = await apiFetch(`/api/wins-submissions?${qs}`);
  return wins || [];
}

/** Saves a draft (or an update to an editable win) without submitting it. */
export async function saveDraft(draft) {
  if (window.AGHF_DEMO) return demoSave(draft, false);
  const { win } = await apiFetch('/api/wins-submissions', { method: 'POST', body: JSON.stringify(draft) });
  return win;
}

/** Submits — becomes 'submitted' or 'privately_received', per consent. */
export async function submitWin(draft) {
  if (window.AGHF_DEMO) return demoSave(draft, true);
  const { win, gpAwarded } = await apiFetch('/api/wins-submissions', { method: 'POST', body: JSON.stringify({ ...draft, action: 'submit' }) });
  return { ...win, gpAwarded };
}

function demoSave(draft, submit) {
  const now = new Date().toISOString();
  let record;
  if (draft.id) {
    const idx = demoWins.findIndex((w) => w.id === draft.id);
    record = { ...demoWins[idx], ...draft, updatedAt: now };
    demoWins[idx] = record;
  } else {
    record = { id: `demo_win_${Date.now()}`, userId: 'demo', status: 'draft', consent: {}, media: [], createdAt: now, updatedAt: now, ...draft };
    demoWins.unshift(record);
  }
  let gpAwarded = 0;
  if (submit) {
    const onlyPrivate = record.consent?.privateOnly && !record.consent?.winWall && !record.consent?.communityFeature;
    record.status = onlyPrivate ? 'privately_received' : 'submitted';
    record.submittedAt = now;
    record.displayNameSnapshot = record.displayNameSnapshot || 'Demo Member';
    if (!record.gpAwardedAt) { gpAwarded = 15; record.gpAwardedAt = now; }
  }
  return { ...record, gpAwarded };
}

export async function withdrawWin(id) {
  if (window.AGHF_DEMO) {
    const idx = demoWins.findIndex((w) => w.id === id);
    if (idx >= 0) { demoWins[idx].status = 'archived'; demoWins[idx].withdrawnAt = new Date().toISOString(); }
    return { win: demoWins[idx] };
  }
  return apiFetch('/api/wins-submissions', { method: 'PATCH', body: JSON.stringify({ id, action: 'withdraw' }) });
}

export async function updateConsent(id, consent) {
  if (window.AGHF_DEMO) {
    const idx = demoWins.findIndex((w) => w.id === id);
    if (idx >= 0) { demoWins[idx].consent = consent; demoWins[idx].consentUpdatedAt = new Date().toISOString(); }
    return { win: demoWins[idx] };
  }
  return apiFetch('/api/wins-submissions', { method: 'PATCH', body: JSON.stringify({ id, consent }) });
}

/** @param {File} file @param {string|null} winId */
export async function uploadWinMedia(file, winId) {
  if (window.AGHF_DEMO) {
    return { path: `demo/${file.name}`, filename: file.name, mimeType: file.type, bytes: file.size, uploadedAt: new Date().toISOString() };
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return apiFetch('/api/wins-media', { method: 'POST', body: JSON.stringify({ dataUrl, filename: file.name, winId }) });
}

export async function getWinMediaUrl(path) {
  if (window.AGHF_DEMO) return null;
  const { url } = await apiFetch(`/api/wins-media?path=${encodeURIComponent(path)}`);
  return url;
}

/** @returns {Promise<{counts: Record<string,number>, mine: string[]}>} */
export async function getReactions(winId) {
  if (window.AGHF_DEMO) {
    const counts = {}; const mine = [];
    demoReactions.filter((r) => r.winId === winId).forEach((r) => {
      counts[r.reactionType] = (counts[r.reactionType] || 0) + 1;
      if (r.mine) mine.push(r.reactionType);
    });
    return { counts, mine };
  }
  const { counts, mine } = await apiFetch(`/api/wins-reactions?winId=${winId}`);
  return { counts: counts || {}, mine: mine || [] };
}

/** Toggles a reaction on/off. */
export async function toggleReaction(winId, reactionType, active) {
  if (window.AGHF_DEMO) {
    if (active) demoReactions.push({ winId, reactionType, mine: true });
    else {
      const idx = demoReactions.findIndex((r) => r.winId === winId && r.reactionType === reactionType && r.mine);
      if (idx >= 0) demoReactions.splice(idx, 1);
    }
    return { success: true };
  }
  return active
    ? apiFetch('/api/wins-reactions', { method: 'POST', body: JSON.stringify({ winId, reactionType }) })
    : apiFetch(`/api/wins-reactions?winId=${winId}&reactionType=${reactionType}`, { method: 'DELETE' });
}

/* ── Admin (moderation) ──────────────────────────────────────────────── */

export async function listModerationQueue(filters = {}) {
  if (window.AGHF_DEMO) return demoWins.filter((w) => (filters.status ? w.status === filters.status : ['submitted', 'under_review'].includes(w.status)));
  const qs = new URLSearchParams(filters).toString();
  const { wins } = await apiFetch(`/api/wins-moderation${qs ? `?${qs}` : ''}`);
  return wins || [];
}

export async function moderationAction(id, action, payload = {}) {
  if (window.AGHF_DEMO) {
    const idx = demoWins.findIndex((w) => w.id === id);
    if (idx < 0) return { win: null };
    const w = demoWins[idx];
    if (action === 'approve') { w.status = 'approved'; w.approvedAt = new Date().toISOString(); }
    if (action === 'feature') w.status = 'featured';
    if (action === 'unfeature') w.status = 'approved';
    if (action === 'reject') { w.status = 'rejected'; w.memberVisibleFeedback = payload.memberVisibleFeedback; }
    if (action === 'request_changes') { w.status = 'needs_changes'; w.memberVisibleFeedback = payload.memberVisibleFeedback; }
    if (action === 'archive') w.status = 'archived';
    if (action === 'verify') w.isVerified = true;
    if (action === 'unverify') w.isVerified = false;
    if (action === 'edit_testimonial_wording') { w.testimonialOriginalText ||= w.testimonialText; w.testimonialText = payload.newText; w.testimonialEditedByAdmin = true; }
    if (action === 'add_note') w.adminNotes = `${w.adminNotes || ''}\n${payload.text}`;
    return { win: w };
  }
  return apiFetch('/api/wins-moderation', { method: 'PATCH', body: JSON.stringify({ id, action, ...payload }) });
}

/** Debounced autosave wrapper, same shape as journal-service.js's. */
export function createAutosaver(onStatus) {
  let timer = null;
  let latest = null;
  function scheduleSave(draft) {
    latest = draft;
    onStatus('saving');
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const saved = await saveDraft(latest);
        onStatus('saved', saved);
      } catch (err) {
        console.error('Win draft autosave error:', err);
        onStatus('error', err);
      }
    }, 700);
  }
  scheduleSave.cancel = () => clearTimeout(timer);
  return scheduleSave;
}
