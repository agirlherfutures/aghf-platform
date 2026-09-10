/**
 * chartlab-copy.js — A Girl & Her Futures™
 * Centralized, zero-logic copy for AGHF Chart Lab: skill/difficulty/
 * drill-type labels, mastery-state copy, empty states, feedback framing.
 * Matches the established convention (challenge-copy.js, wins-copy.js) —
 * every member-facing string lives here, engine files stay copy-free.
 */

export const PAGE_COPY = {
  eyebrow: '✦ Academy',
  title: 'AGHF Chart Lab',
  tagline: 'Train your eyes. Read the chart. Build confidence before risking money.',
  shortDescription: 'Bite-sized chart drills built around market structure and the Dayli ICC Method.',
};

export const SKILL_CATEGORIES = [
  { key: 'market_bias', label: '4H Market Bias', icon: '🧭' },
  { key: 'market_structure', label: '1H Market Structure', icon: '🏗️' },
  { key: 'swing_points', label: 'Swing High / Swing Low', icon: '📍' },
  { key: 'external_range', label: 'External Range', icon: '📐' },
  { key: 'pil_selection', label: 'PIL Selection', icon: '🎯' },
  { key: 'liquidity', label: 'Liquidity', icon: '💧' },
  { key: 'consolidation', label: 'Consolidation', icon: '📦' },
  { key: 'icc_sequence', label: 'ICC Sequence', icon: '🔁' },
  { key: 'indication', label: 'Indication', icon: '①' },
  { key: 'correction', label: 'Correction', icon: '②' },
  { key: 'continuation', label: 'Continuation', icon: '③' },
  { key: 'retest_entry', label: 'Retest & Entry', icon: '④' },
  { key: 'invalidation', label: 'Invalidation', icon: '🚫' },
  { key: 'wait_or_pass', label: 'Wait or Pass', icon: '⏸️' },
  { key: 'full_breakdown', label: 'Full Top-Down Analysis', icon: '📊' },
];

export function skillLabel(key) {
  return SKILL_CATEGORIES.find((s) => s.key === key)?.label || key;
}
export function skillIcon(key) {
  return SKILL_CATEGORIES.find((s) => s.key === key)?.icon || '✦';
}

export const DIFFICULTY_LABELS = {
  foundation: { label: 'Foundation', description: 'One concept, obvious chart context, guided choices.' },
  developing: { label: 'Developing', description: 'Several relevant chart elements with fewer hints.' },
  applied: { label: 'Applied', description: 'Combine multiple concepts on one chart.' },
  full_breakdown: { label: 'Full Breakdown', description: 'Top-down chart analysis with minimal guidance.' },
};

export const DRILL_TYPE_LABELS = {
  spot_it: { label: 'Spot It', instruction: 'Tap the chart to answer.' },
  valid_invalid: { label: 'Valid or Invalid?', instruction: 'Choose the answer that best fits.' },
  phase_id: { label: 'What Phase Is Price In?', instruction: 'Select the current Dayli ICC phase.' },
  candle_close_wick: { label: 'Candle Close or Wick?', instruction: 'Decide what the candle actually confirmed.' },
  sequence_builder: { label: 'Sequence Builder', instruction: 'Put the events in the correct order.' },
  best_decision: { label: 'Choose the Best Decision', instruction: 'Pick what the chart currently supports.' },
  mark_the_chart: { label: 'Mark the Chart', instruction: 'Annotate the chart with the requested marks.' },
  full_breakdown: { label: 'Full Chart Breakdown', instruction: 'Complete a short top-down analysis.' },
};

export const MASTERY_COPY = {
  new: { label: 'New', tone: 'neutral' },
  practicing: { label: 'Practicing', tone: 'neutral' },
  developing: { label: 'Developing', tone: 'watch' },
  confident: { label: 'Confident', tone: 'good' },
  mastered: { label: 'Mastered', tone: 'good' },
  review_recommended: { label: 'Review Recommended', tone: 'watch' },
};

export const RESULT_COPY = {
  correct: { label: 'Correct', icon: '✦' },
  partial: { label: 'Almost', icon: '◐' },
  review_needed: { label: 'Review Needed', icon: '○' },
};

export const PHASE_ID_CHOICES = [
  { key: 'pre_indication', label: 'Pre-Indication' },
  { key: 'indication', label: 'Indication' },
  { key: 'correction', label: 'Correction' },
  { key: 'continuation', label: 'Continuation' },
  { key: 'retest', label: 'Retest' },
  { key: 'consolidation', label: 'Consolidation' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'invalidated', label: 'Invalidated' },
];

export const VALID_INVALID_CHOICES = [
  { key: 'valid', label: 'Valid' },
  { key: 'invalid', label: 'Invalid' },
  { key: 'not_enough_confirmation', label: 'Not Enough Confirmation' },
  { key: 'wait', label: 'Wait' },
  { key: 'pass', label: 'Pass' },
];

export const BEST_DECISION_CHOICES = [
  { key: 'enter_now', label: 'Enter now' },
  { key: 'wait_for_continuation', label: 'Wait for Continuation' },
  { key: 'chase_current_candle', label: 'Chase the current candle' },
  { key: 'move_to_lower_timeframe', label: 'Move to a lower timeframe' },
  { key: 'pass', label: 'Pass completely' },
];

export const CANDLE_CLOSE_WICK_CHOICES = [
  { key: 'valid_close', label: 'Valid candle-body close' },
  { key: 'wick_only', label: 'Wick only' },
  { key: 'unclear', label: 'Unclear' },
  { key: 'not_yet_confirmed', label: 'Not yet confirmed' },
];

export const CHOICES_BY_DRILL_TYPE = {
  valid_invalid: VALID_INVALID_CHOICES,
  phase_id: PHASE_ID_CHOICES,
  best_decision: BEST_DECISION_CHOICES,
  candle_close_wick: CANDLE_CLOSE_WICK_CHOICES,
};

// Current Focus (dashboard) key -> Chart Lab skill + why-recommended copy.
// Mirrors dayli-desk-engine.js's own FOCUS_MAP keys exactly so the
// dashboard's "Recommended Chart Lab drill" link always points at a real,
// relevant skill instead of a generic static page.
export const FOCUS_TO_SKILL = {
  trade_limit: { skillCategory: 'wait_or_pass', reason: 'Recommended because respecting your daily limit is a wait-or-pass decision, practiced here.' },
  waited_for_confirmation: { skillCategory: 'continuation', reason: 'Recommended because your Current Focus is waiting for Continuation before entering.' },
  traded_with_bias: { skillCategory: 'market_bias', reason: 'Recommended because your Current Focus is identifying 4H bias correctly.' },
  avoided_consolidation: { skillCategory: 'consolidation', reason: 'Recommended because your Current Focus is recognizing consolidation before it costs you a trade.' },
  avoided_news: { skillCategory: 'wait_or_pass', reason: 'Recommended because your Current Focus is knowing when to wait.' },
};

export function chartLabHrefForFocus(focusKey) {
  const mapping = FOCUS_TO_SKILL[focusKey];
  return mapping ? `chart-lab.html?focus=${mapping.skillCategory}` : 'chart-lab.html';
}

export const EMPTY_STATES = {
  noTodaysDrill: { heading: 'Nothing recommended yet', body: 'Complete a lesson or a drill to unlock a personalized recommendation — for now, browse by skill below.' },
  noContinue: { heading: 'No drill in progress', body: 'Start a session below whenever you’re ready.' },
  noMistakes: { heading: 'No mistakes to review', body: 'Nothing here yet — that’s a good sign.' },
  noDrillsPublished: { heading: 'Drills coming soon', body: 'This skill doesn’t have any published drills yet.' },
};

export const SESSION_TYPE_LABELS = {
  daily: { label: 'Daily Drill', description: '3–5 questions, a few minutes.' },
  focus: { label: 'Focus Practice', description: '5–10 questions on one skill.' },
  mixed_review: { label: 'Mixed Review', description: 'A spaced review of skills you’ve practiced before.' },
  full_breakdown: { label: 'Full Breakdown', description: 'One larger chart, multi-step analysis.' },
};

export const REPORT_REASONS = [
  'The chart image is unclear or missing',
  'The correct answer looks wrong',
  'The explanation is confusing',
  'Something else',
];
