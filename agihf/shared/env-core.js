/**
 * env-core.js — A Girl & Her Futures™
 *
 * Phase 7 · Section 3 · Reading the Environment. NOT EVERY VALID SETUP DESERVES
 * PARTICIPATION. The setup does not exist in a vacuum.
 *
 * Descriptive states only. No environment score, no weighted checklist, nothing
 * that converts context into BUY / SELL. Clean means UNDERSTANDABLE, not flawless.
 * No profitability is inferred from subjective quality tags, and no statistical
 * claim is made without enough of her own logged data.
 *
 *   ParticipationCheck: TRADER → RULEBOOK → ENVIRONMENT → SETUP → DECISION
 *   (TAKE · WAIT · PASS · SESSION OVER · REASSESS), always with a short WHY.
 *
 * Stores: aghf_env_snapshots · aghf_valid_passes · aghf_p7e_session/_stats
 */

const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

export const MARKET_STATE = {
  TRENDING_BULLISH: { label: '📈 TRENDING BULLISH' },
  TRENDING_BEARISH: { label: '📉 TRENDING BEARISH' },
  RANGING: { label: '↔ RANGING' },
  CONSOLIDATING: { label: '▭ CONSOLIDATING' },
  UNCLEAR: { label: '❓ UNCLEAR' },
};
export const ENV_QUALITY = { SUPPORTIVE: 'SUPPORTIVE', MIXED: 'MIXED', POORLY_DEFINED: 'POORLY DEFINED' };

/** EnvironmentSnapshot fields: descriptive states, never 1–5 ratings by default. */
export const SNAPSHOT_FIELDS = [
  { key: 'htfClarity', label: '4H', options: ['CLEAR', 'MIXED', 'UNCLEAR'] },
  { key: 'oneHourStructure', label: '1H', options: ['PROGRESSING', 'RANGING', 'MESSY'] },
  { key: 'volatilityState', label: 'VOLATILITY', options: ['LOWER', 'NORMAL FOR PLAN', 'ELEVATED', 'EXTREME FOR PLAN'] },
  { key: 'newsContext', label: 'NEWS', options: ['CLEAR', 'EVENT APPROACHING', 'RESTRICTED BY RULE'] },
  { key: 'sessionContext', label: 'SESSION', options: ['IN MY WINDOW', 'OUTSIDE PLAN'] },
  { key: 'roomToObjective', label: 'ROOM', options: ['AVAILABLE', 'LIMITED', 'OBJECTIVE REACHED'] },
  { key: 'setupCleanliness', label: 'ICC', options: ['NOT FORMED', 'DEVELOPING', 'CLEAN', 'MESSY', 'INVALID'] },
];

export function saveSnapshot(snap) {
  const all = read('aghf_env_snapshots', []);
  all.push({ timestamp: Date.now(), htfClarity: null, oneHourStructure: null, marketState: null, consolidationQuality: null, volatilityState: null,
    newsContext: null, sessionContext: null, roomToObjective: null, setupCleanliness: null, personalRuleConflicts: [], studentSummary: '', ...snap });
  write('aghf_env_snapshots', all.slice(-100));
}

/** ValidPass: process followed, no trade taken. A complete result, never "0 trades 😔". */
export function recordValidPass(p) {
  const all = read('aghf_valid_passes', []);
  all.push({ reason: '', environmentSnapshot: null, rulebookContext: null, setupState: null, studentExplanation: '', ...p, at: Date.now() });
  write('aghf_valid_passes', all.slice(-100));
  trackEnv('validPasses');
}
export const validPasses = () => read('aghf_valid_passes', []);

/** Honest counts only: "7 logged trades tagged TRENDING", never a win rate she hasn't earned. */
export function environmentTally(journal = read('aghf_p7_journal', [])) {
  const t = {};
  journal.forEach((j) => { if (j.marketState) t[j.marketState] = (t[j.marketState] || 0) + 1; });
  return t;
}

/* ── Environment reasoning review (observable decisions only) ──────────── */

const SESSION_KEY = 'aghf_p7e_session';
export function startEnvSession(name) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name, at: Date.now() })); } catch { /* ignore */ } }
export function envSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; } }
export function trackEnv(key, ok = null) {
  try {
    const bump = (o) => { if (ok === null) o[key] = (o[key] || 0) + 1; else { o[`${key}:tries`] = (o[`${key}:tries`] || 0) + 1; if (ok) o[`${key}:right`] = (o[`${key}:right`] || 0) + 1; } };
    const s = envSession(); bump(s); sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    const all = read('aghf_p7e_stats', {}); bump(all); write('aghf_p7e_stats', all);
  } catch { /* ignore */ }
}
export const ENV_CATS = {
  trendRange: 'Trend / range recognition', clarity: 'Structural clarity', volatility: 'Volatility recognition', news: 'News awareness',
  session: 'Session awareness', room: 'Room-to-objective awareness', reassess: 'Mid-session reassessment', pass: 'Valid pass decisions',
};
export function envReview(s = envSession()) {
  const rows = Object.entries(ENV_CATS).map(([k, label]) => { const t = s[`${k}:tries`] || 0, r = s[`${k}:right`] || 0; return [label, t ? `${r} / ${t}` : '·']; });
  rows.push(['Forced-trade errors', s.forcedTrades || 0]);
  const miss = (k) => (s[`${k}:tries`] || 0) - (s[`${k}:right`] || 0);
  const review = [];
  if (miss('clarity') >= 2) review.push({ line: 'You’re identifying ICC correctly. The difficulty is deciding whether the surrounding structure is clear enough to participate.', cta: 'Environment drill →', href: 'lesson.html?phase=p7&n=25' });
  if ((s.manyPils || 0) >= 1) review.push({ line: 'You’ve selected multiple competing levels in unclear structure before.', cta: 'Level relevance review →', href: 'lesson.html?phase=p4&n=6' });
  if (miss('reassess') >= 1) review.push({ line: 'The morning thesis was clear. But price has already reached the objective and conditions changed.', cta: 'Reassess current market →', href: 'lesson.html?phase=p7&n=30' });
  if ((s.forcedTrades || 0) >= 1) review.push({ line: 'You completed the analysis correctly. The error happened when you assumed the session had to produce a trade.', cta: 'Valid pass practice →', href: 'lesson.html?phase=p7&n=31' });
  if ((s.volAsDirection || 0) >= 1) review.push({ line: 'Price is moving FAST. That answers speed. What answers direction?', cta: 'Structure review →', href: 'lesson.html?phase=p7&n=28' });
  return { rows, review: review.slice(0, 3) };
}
