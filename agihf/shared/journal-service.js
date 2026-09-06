/**
 * journal-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed AG&HF Trade Journal (agihf/api/
 * journal-entries.js). Replaces the earlier localStorage-only version
 * (which wrapped `aghf_notes`) and trades-service.js (which wrapped
 * `aghf_trades`) — a trade or reflection now belongs to the authenticated
 * member and is never reachable by another member's session, since every
 * request is scoped server-side to the verified JWT's user id.
 *
 * Note: lesson-engine.js, loop-engine.js, and section-engine.js write
 * lesson-reflection/check-in entries directly to the `aghf_notes`
 * localStorage array — they never imported this module, so nothing about
 * their behavior changes here. journal-migration.js is what carries their
 * *reflection-type* siblings (premarket/postmarket) into the new table;
 * lesson/checkin entries stay in `aghf_notes` untouched, out of scope.
 *
 * In demo/preview mode, falls back to an in-memory store for the same
 * reason checklist-service.js does — no real session token to call the
 * API with, and no pretending demo data is actually saved.
 */

export const QUICK_JOURNAL_PROMPTS = {
  premarket: [
    'What must price confirm before you are allowed to enter today?',
    'What would make today’s plan invalid before you even take a trade?',
  ],
  postmarket: [
    'Did you trade what price confirmed — or what you expected?',
    'What did you execute well today?',
  ],
};

const demoEntries = [];

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (window.AGHF_SESSION_TOKEN) headers.Authorization = `Bearer ${window.AGHF_SESSION_TOKEN}`;
  const res = await fetch(path, { ...opts, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { setupRequired: body.setupRequired });
  return body;
}

/** @returns {Promise<import('./dashboard-models.js').JournalEntryRecord|null>} */
export async function getEntry(id) {
  if (window.AGHF_DEMO) return demoEntries.find((e) => e.id === id) || null;
  const { entry } = await apiFetch(`/api/journal-entries?id=${id}`);
  return entry;
}

/**
 * @param {{entryType?: string, instrument?: string, direction?: string, outcome?: string, session?: string, setupType?: string, methodQualityTag?: string, from?: string, to?: string, limit?: number, offset?: number}} filters
 * @returns {Promise<{entries: import('./dashboard-models.js').JournalEntryRecord[], total: number}>}
 */
export async function listEntries(filters = {}) {
  if (window.AGHF_DEMO) {
    let rows = demoEntries.slice();
    if (filters.entryType) rows = rows.filter((e) => e.entryType === filters.entryType);
    return { entries: rows, total: rows.length };
  }
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v != null && v !== '')).toString();
  const { entries, total } = await apiFetch(`/api/journal-entries${qs ? `?${qs}` : ''}`);
  return { entries: entries || [], total: total || 0 };
}

/** @returns {Promise<import('./dashboard-models.js').JournalEntryRecord[]>} */
export async function getRecentEntries(n = 3) {
  const { entries } = await listEntries({ entryType: 'trade', limit: n });
  return entries;
}

/**
 * @param {Partial<import('./dashboard-models.js').JournalEntryRecord>} entry
 * @returns {Promise<import('./dashboard-models.js').JournalEntryRecord>}
 */
export async function saveEntry(entry) {
  if (window.AGHF_DEMO) {
    const now = new Date().toISOString();
    let record;
    let priorGpAwardedAt = null;
    if (entry.id) {
      const idx = demoEntries.findIndex((e) => e.id === entry.id);
      priorGpAwardedAt = demoEntries[idx]?.gpAwardedAt || null;
      record = { ...demoEntries[idx], ...entry, updatedAt: now };
      demoEntries[idx] = record;
    } else {
      record = {
        id: `demo_${Date.now()}`, tradeNumber: demoEntries.filter((e) => e.entryType === 'trade').length + 1,
        createdAt: now, updatedAt: now, exits: [], methodQualityTags: [], ruleViolations: [], screenshots: [], emotions: {},
        entryTags: [], exitTags: [], lessons: [],
        ...entry,
      };
      demoEntries.unshift(record);
    }
    let gpAwarded = 0;
    let newJournalStreak = null;
    if (record.entryType === 'trade' && record.isDraft === false && !priorGpAwardedAt) {
      gpAwarded = 5 + (record.wentWell && record.wouldImprove && record.lessons?.length ? 5 : 0);
      record.gpAwardedAt = now;
      newJournalStreak = 1; // demo mode has no persisted profile streak to build on
    }
    return { ...record, gpAwarded, newJournalStreak };
  }
  const { entry: saved, gpAwarded, newJournalStreak } = await apiFetch('/api/journal-entries', { method: 'POST', body: JSON.stringify(entry) });
  return { ...saved, gpAwarded, newJournalStreak };
}

export async function deleteEntry(id) {
  if (window.AGHF_DEMO) {
    const idx = demoEntries.findIndex((e) => e.id === id);
    if (idx >= 0) demoEntries.splice(idx, 1);
    return { success: true };
  }
  return apiFetch(`/api/journal-entries?id=${id}`, { method: 'DELETE' });
}

/** Today's private performance snapshot, from trade-type entries only. */
export async function getTodaysSnapshot(opts = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const { entries } = await listEntries({ entryType: 'trade', from: today, to: today, limit: 200 });
  const wins = entries.filter((t) => t.netPnl > 0).length;
  const losses = entries.filter((t) => t.netPnl < 0).length;
  const netPnl = entries.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const rrTrades = entries.filter((t) => t.plannedRisk && t.netPnl != null && t.plannedRisk > 0);
  const avgRR = rrTrades.length
    ? rrTrades.reduce((sum, t) => sum + Math.abs(t.netPnl) / t.plannedRisk, 0) / rrTrades.length
    : null;
  return {
    date: today, netPnl, tradeCount: entries.length, wins, losses,
    winRate: entries.length ? Math.round((wins / entries.length) * 100) : null,
    avgRR, maxTrades: opts.maxTrades ?? null, trades: entries,
  };
}

/**
 * All-time (or filtered-range) journal stats for the Journal History page.
 * Unlike getTodaysSnapshot() (today only, used by the dashboard card), this
 * pulls the member's full trade history (bounded at 500 rows — a practical
 * cap, not a paged view, fine at this app's scale) and computes discipline
 * metrics that are meant to read as equal-or-more-prominent than raw P&L.
 * @returns {Promise<{tradesLogged:number, winRate:number|null, avgWinner:number|null, avgLoser:number|null, avgR:number|null, ruleFollowRate:number|null, biasAccuracyRate:number|null, journalingStreak:number}>}
 */
export async function getJournalStats(filters = {}) {
  const { entries } = await listEntries({ entryType: 'trade', ...filters, limit: 500 });
  const winners = entries.filter((t) => t.netPnl > 0);
  const losers = entries.filter((t) => t.netPnl < 0);
  const rrTrades = entries.filter((t) => t.plannedRisk && t.netPnl != null && t.plannedRisk > 0);
  const ruleAnswered = entries.filter((t) => t.ruleCheck);
  const biasAnswered = entries.filter((t) => t.biasAccuracy && t.biasAccuracy !== 'unsure');

  let journalingStreak = 0;
  try {
    const profile = await window.AGHF_FETCH_PROFILE?.();
    journalingStreak = profile?.profile?.journal_streak || 0;
  } catch { /* streak just shows 0 if the profile fetch fails */ }

  return {
    tradesLogged: entries.length,
    winRate: entries.length ? Math.round((winners.length / entries.length) * 100) : null,
    avgWinner: winners.length ? winners.reduce((sum, t) => sum + t.netPnl, 0) / winners.length : null,
    avgLoser: losers.length ? losers.reduce((sum, t) => sum + t.netPnl, 0) / losers.length : null,
    avgR: rrTrades.length ? rrTrades.reduce((sum, t) => sum + t.netPnl / t.plannedRisk, 0) / rrTrades.length : null,
    ruleFollowRate: ruleAnswered.length ? Math.round((ruleAnswered.filter((t) => t.ruleCheck === 'yes').length / ruleAnswered.length) * 100) : null,
    biasAccuracyRate: biasAnswered.length ? Math.round((biasAnswered.filter((t) => t.biasAccuracy === 'yes').length / biasAnswered.length) * 100) : null,
    journalingStreak,
  };
}

/**
 * Debounced autosave wrapper, same shape as checklist-service.js's
 * createAutosaver — `onStatus('saving'|'saved'|'error', savedEntryOrErr)`.
 */
export function createAutosaver(onStatus) {
  let timer = null;
  let latest = null;
  return function scheduleSave(entry) {
    latest = entry;
    onStatus('saving');
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const saved = await saveEntry(latest);
        onStatus('saved', saved);
      } catch (err) {
        console.error('Journal autosave error:', err);
        onStatus('error', err);
      }
    }, 700);
  };
}

/** Quick reflection save (Pre-Market / Post-Market Journal card actions). */
export async function saveReflection(type, prompt, text) {
  return saveEntry({
    entryType: type, prompt, entryReasoning: text,
    tradeDate: new Date().toISOString().slice(0, 10), isDraft: false,
  });
}

// --- Legacy aghf_notes readback (lesson-engine.js/loop-engine.js/section-engine.js entries) ---
// journal-history.html surfaces these alongside real trade-journal entries
// so a member's lesson reflections and check-ins are still visible in one
// place, even though they live in a different store for a different
// reason (see the module docblock above).

const LEGACY_NOTES_KEY = 'aghf_notes';

/** @returns {{id: string, type: string, lessonId?: string, sectionId?: string, prompt: string, text: string, savedAt: number}[]} */
export function getLegacyNotes() {
  let all = [];
  try { all = JSON.parse(localStorage.getItem(LEGACY_NOTES_KEY) || '[]'); } catch { /* ignore */ }
  return all
    .map((n, i) => ({ id: n.id || `legacy_${n.savedAt || i}_${i}`, type: n.type || (n.sectionId ? 'checkin' : 'lesson'), ...n }))
    .filter((n) => n.type === 'lesson' || n.type === 'checkin')
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
}
