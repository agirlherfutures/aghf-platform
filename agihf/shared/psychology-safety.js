/**
 * psychology-safety.js — A Girl & Her Futures™
 *
 * Deterministic pre-flight safety scan over member-typed free text. Runs
 * BEFORE any coaching logic (rules-based or, in a future phase, AI) ever
 * sees the text — a keyword/pattern match, not a model call, per the
 * spec's explicit requirement that serious safety responses never rely
 * solely on free-form AI generation. A match short-circuits the calling
 * UI straight to the matching static copy in psychology-safety-copy.js.
 */

const CRISIS_PATTERNS = [
  /\bkill myself\b/i, /\bend my life\b/i, /\bsuicid/i, /\bwant to die\b/i,
  /\bhurt(ing)? myself\b/i, /\bself[- ]harm/i, /\bno reason to (live|go on)\b/i,
];

const TRADING_HARM_PATTERNS = [
  /\bcan'?t stop trading\b/i, /\bcant stop trading\b/i, /\bhiding (my )?losses\b/i,
  /\bborrow(ed|ing)? money to trade\b/i, /\brent money\b.*\btrad/i, /\btrad(e|ing).*\brent money\b/i,
  /\bmust win (it|this) back\b/i, /\bneed to win (it|this) back\b/i,
  /\bfamily doesn'?t know\b.*\b(trad|lost|losing)\b/i,
];

/**
 * @param {string} text
 * @returns {{category: 'crisis'|'trading_harm'}|null}
 */
export function scanForSafetyConcern(text) {
  if (!text || typeof text !== 'string') return null;
  if (CRISIS_PATTERNS.some((re) => re.test(text))) return { category: 'crisis' };
  if (TRADING_HARM_PATTERNS.some((re) => re.test(text))) return { category: 'trading_harm' };
  return null;
}
