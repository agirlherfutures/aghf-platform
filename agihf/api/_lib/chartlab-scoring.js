// chartlab-scoring.js — A Girl & Her Futures™ (server-only, pure functions)
//
// Deterministic answer scoring + mastery-threshold logic for AGHF Chart
// Lab. No AI is ever asked whether a visual answer is correct — every
// drill type reduces to one of four comparisons against an
// administrator-authored answer key: exact choice match, sequence
// comparison, or coordinate/zone-tolerance hit-testing. Kept as pure
// functions (no Supabase import) so they're independently testable and
// reusable from a scratch verification script.

const MASTERY_THRESHOLDS = {
  practicing: { minAttempts: 1 },
  developing: { minAttempts: 3, minRecentAccuracy: 50 },
  confident: { minAttempts: 5, minRecentAccuracy: 75 },
  mastered: { minAttempts: 8, minRecentAccuracy: 90 },
};

const REVIEW_DECAY_DAYS = 21;
const RECENT_ACCURACY_WINDOW_WEIGHT = 5; // treat recent_accuracy as a rolling average over ~5 attempts

/**
 * @param {{answerType:string, correctChoice?:string, correctSequence?:string[], zones?:Array<{x:number,y:number,radius:number,credit:'full'|'partial'}>}} answerKey
 * @param {{choice?:string, sequence?:string[], point?:{x:number,y:number}}} memberAnswer
 * @returns {{score:number, result:'correct'|'partial'|'review_needed'}}
 */
export function scoreAttempt(answerKey, memberAnswer) {
  if (!answerKey || !memberAnswer) return { score: 0, result: 'review_needed' };

  if (answerKey.answerType === 'choice') {
    const correct = !!memberAnswer.choice && memberAnswer.choice === answerKey.correctChoice;
    return correct ? { score: 100, result: 'correct' } : { score: 0, result: 'review_needed' };
  }

  if (answerKey.answerType === 'sequence') {
    const correctSeq = answerKey.correctSequence || [];
    const memberSeq = Array.isArray(memberAnswer.sequence) ? memberAnswer.sequence : [];
    if (!correctSeq.length) return { score: 0, result: 'review_needed' };
    const matches = correctSeq.reduce((n, key, i) => n + (memberSeq[i] === key ? 1 : 0), 0);
    const pct = Math.round((matches / correctSeq.length) * 100);
    if (pct === 100) return { score: 100, result: 'correct' };
    if (pct >= 50) return { score: pct, result: 'partial' };
    return { score: pct, result: 'review_needed' };
  }

  if (answerKey.answerType === 'point' || answerKey.answerType === 'zone') {
    const point = memberAnswer.point;
    const zones = answerKey.zones || [];
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return { score: 0, result: 'review_needed' };
    let best = null;
    for (const zone of zones) {
      const d = Math.hypot(zone.x - point.x, zone.y - point.y);
      if (d <= (zone.radius || 0.06) && (!best || d < best.dist)) best = { dist: d, credit: zone.credit || 'full' };
    }
    if (!best) return { score: 0, result: 'review_needed' };
    return best.credit === 'partial' ? { score: 60, result: 'partial' } : { score: 100, result: 'correct' };
  }

  return { score: 0, result: 'review_needed' };
}

/**
 * @param {{mastery_state:string, accuracy:number|null, recent_accuracy:number|null, attempts:number, hint_usage:number, last_practiced_at:string|null}|null} existing
 * @param {{score:number, result:string, hintsUsed:number}} attempt
 * @returns {{mastery_state:string, accuracy:number, recent_accuracy:number, attempts:number, hint_usage:number, last_practiced_at:string, review_due_at:string|null}}
 */
export function computeMasteryUpdate(existing, attempt) {
  const prev = existing || { mastery_state: 'new', accuracy: null, recent_accuracy: null, attempts: 0, hint_usage: 0 };
  const attempts = prev.attempts + 1;
  const hintUsage = prev.hint_usage + (attempt.hintsUsed || 0);
  const accuracy = prev.accuracy == null ? attempt.score : Math.round((prev.accuracy * prev.attempts + attempt.score) / attempts);
  const recentAccuracy = prev.recent_accuracy == null
    ? attempt.score
    : Math.round((prev.recent_accuracy * (RECENT_ACCURACY_WINDOW_WEIGHT - 1) + attempt.score) / RECENT_ACCURACY_WINDOW_WEIGHT);

  // Mastery only ever climbs one rung at a time based on real thresholds —
  // never jumps straight to "Mastered" off a single lucky answer, and never
  // moves backward here (decay to "Review Recommended" is a separate,
  // time-based check in applyMasteryDecay, not a consequence of one miss).
  let state = 'practicing';
  if (attempts >= MASTERY_THRESHOLDS.mastered.minAttempts && recentAccuracy >= MASTERY_THRESHOLDS.mastered.minRecentAccuracy) state = 'mastered';
  else if (attempts >= MASTERY_THRESHOLDS.confident.minAttempts && recentAccuracy >= MASTERY_THRESHOLDS.confident.minRecentAccuracy) state = 'confident';
  else if (attempts >= MASTERY_THRESHOLDS.developing.minAttempts && recentAccuracy >= MASTERY_THRESHOLDS.developing.minRecentAccuracy) state = 'developing';

  const now = new Date();
  const reviewDue = new Date(now.getTime() + REVIEW_DECAY_DAYS * 86400000);

  return {
    mastery_state: state,
    accuracy,
    recent_accuracy: recentAccuracy,
    attempts,
    hint_usage: hintUsage,
    last_practiced_at: now.toISOString(),
    review_due_at: reviewDue.toISOString(),
  };
}

/** Gentle decay: a confident/mastered skill not practiced since review_due_at
 * drops exactly one rung to 'review_recommended' — it never resets to 'new'
 * and never silently erases the member's accuracy/attempts history. Called
 * lazily on read (GET mastery), never as a background job (none exists in
 * this project). */
export function applyMasteryDecay(row) {
  if (!row || !row.review_due_at) return row;
  const isDue = new Date(row.review_due_at).getTime() < Date.now();
  const decayable = row.mastery_state === 'confident' || row.mastery_state === 'mastered';
  if (isDue && decayable) return { ...row, mastery_state: 'review_recommended' };
  return row;
}

export { MASTERY_THRESHOLDS, REVIEW_DECAY_DAYS };
