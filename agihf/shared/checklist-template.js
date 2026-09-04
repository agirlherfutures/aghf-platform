/**
 * checklist-template.js — A Girl & Her Futures™
 *
 * Versioned, config-driven content for the Dayli ICC Trade Checklist.
 * Adapted from preview.html's phase structure, corrected per the method-
 * language decisions made before implementation:
 *   - TP1/TP2 + move-to-breakeven are optional management fields, not
 *     mandatory checklist gates (no item requires them).
 *   - Correction stays purely observational — no retest-candle-close item
 *     (preview.html's Golden Rule box implied one; its own Phase 3 items
 *     never required it). Only two closes exist anywhere in the flow:
 *     Indication and Continuation.
 *   - Invalidation is precisely defined as a body close beyond the PIL in
 *     the opposite direction.
 *   - "PIL" always displays as "Pre-Indication Level (PIL)" — the
 *     existing full term from curriculum-data.js's Phase 5 lesson.
 *
 * Bumping TEMPLATE_VERSION when method content changes lets old
 * trade_checklists rows keep displaying against the template version they
 * were actually completed under (see checklist-service.js) — history
 * never gets silently reinterpreted by a newer template.
 */

export const TEMPLATE_VERSION = 1;

export const CHECKLIST_PHASES = [
  {
    key: 'market_context',
    n: 1,
    title: 'HTF Bias & Setup Conditions',
    subtitle: 'First thing when you open a chart',
    colorKey: 'blue',
    hint: 'Start here',
    summary: 'Build the bigger picture first — direction, levels, and where price is likely trying to go — before dropping to lower timeframes.',
    items: [
      {
        key: 'bias_check', badges: ['1H4H'], title: 'Check your bias', desc: 'Higher highs and higher lows for bullish, lower highs and lower lows for bearish.',
        captureFields: [
          { key: 'bias4h', type: 'select', label: '4H bias', options: ['bullish', 'bearish', 'neutral'] },
          { key: 'structure1h', type: 'select', label: '1H structure', options: ['bullish', 'bearish', 'mixed', 'unconfirmed'] },
        ],
      },
      { key: 'swing_4h', badges: ['4H'], title: 'Mark the relevant 4H external swing high and low', desc: 'Your structural reference points on the 4 hour timeframe.' },
      { key: 'structure_1h', badges: ['1H'], title: 'Mark relevant 1H structure or swing levels', desc: 'Where has price reacted before on the 1 hour timeframe?' },
      {
        key: 'pil', badges: ['key'], title: 'Identify the active Pre-Indication Level (PIL)', desc: 'The swing level price has not yet broken or retested.',
        captureFields: [{ key: 'pil', type: 'text', label: 'PIL level', placeholder: 'e.g. 20,415' }],
      },
      {
        key: 'target_dol', badges: ['target'], title: 'Identify the likely target or draw on liquidity', desc: 'Previous highs/lows, equal highs/lows, or liquidity pools in the expected direction.',
        captureFields: [{ key: 'targetDol', type: 'text', label: 'Target / draw on liquidity', placeholder: 'e.g. previous high at 20,600' }],
      },
      {
        key: 'consolidation', badges: ['watch'], title: 'Check whether price is consolidating', desc: 'A ranging market changes how much this setup can be trusted.',
        captureFields: [{ key: 'consolidating', type: 'boolean', label: 'Currently consolidating' }],
      },
      {
        key: 'news', badges: ['risk'], title: 'Check for scheduled high-impact news', desc: 'News proximity can invalidate a clean setup in seconds.',
        captureFields: [{ key: 'newsReviewed', type: 'boolean', label: 'High-impact news today' }],
      },
      {
        key: 'max_risk', badges: ['risk'], title: 'Set maximum risk', desc: 'Decide this before you need it, not during the trade.',
        captureFields: [{ key: 'maxRisk', type: 'number', label: 'Max risk ($)' }],
      },
      {
        key: 'max_trades', badges: ['risk'], title: 'Set maximum number of trades', desc: 'Decide this before you need it, not during the trade.',
        captureFields: [{ key: 'maxTrades', type: 'number', label: 'Max trades' }],
      },
    ],
  },
  {
    key: 'indication',
    n: 2,
    title: 'Indication',
    subtitle: 'Phase 1 · ICC',
    colorKey: 'pink',
    hint: 'Wait for close',
    summary: 'The first true confirmation. Only a body close through the PIL counts — a wick tease does not.',
    items: [
      { key: 'indication_close', badges: ['1M'], title: 'A 1M candle body-closes through the PIL', desc: 'Body close only. A wick through does NOT count.' },
      { key: 'indication_direction', badges: ['direction'], title: 'Record the indication direction', desc: 'Which way did price close — up through a swing high, or down through a swing low?' },
      { key: 'defended_swing', badges: ['key'], title: 'Establish the defended swing', desc: 'The PIL is now the Defended Swing for this setup.' },
    ],
    note: { label: 'Important', text: 'Do not enter here. Wait for the correction — indication only confirms direction, it is not an entry trigger.' },
  },
  {
    key: 'correction',
    n: 3,
    title: 'Correction',
    subtitle: 'Phase 2 · ICC',
    colorKey: 'peach',
    hint: 'Do not touch',
    summary: 'The patience phase. Let the pullback happen and watch for the shift back into trend instead of forcing an early entry.',
    items: [
      { key: 'pullback_observed', badges: ['do_nothing'], title: 'Price corrects against the indicated direction', desc: 'This is normal. Do nothing — the market is refueling.' },
      { key: 'internal_structure', badges: ['watch'], title: 'Watch internal structure during the pullback', desc: 'Is the correction losing steam and shifting back toward the trend?' },
      { key: 'correction_valid', badges: ['risk'], title: 'Confirm the correction hasn’t invalidated', desc: 'Invalidation = a body close beyond the PIL in the opposite direction. If that happens, walk away.' },
    ],
  },
  {
    key: 'continuation',
    n: 4,
    title: 'Continuation & Entry',
    subtitle: 'Phase 3 · ICC',
    colorKey: 'teal',
    hint: 'Execute clean',
    summary: 'Where the entry gets earned. Confirmation close first, limit order second, then risk and target plan.',
    items: [
      { key: 'continuation_close', badges: ['1M'], title: 'A 1M candle body-closes back through the level', desc: 'Correction is complete — the trend wants to continue. This is your signal.' },
      { key: 'entry_level', badges: ['limit'], title: 'Record the intended entry / retest level', desc: 'Place the limit order at the defended swing level. Let price come to you.' },
      { key: 'stop_loss', badges: ['risk'], title: 'Record stop-loss / invalidation', desc: 'At the defended swing — not a random emotional number.' },
      { key: 'target_plan', badges: ['target'], title: 'Record profit target and planned risk-to-reward', desc: 'How you manage from there (partials, breakeven, trailing) is your call to make and record — not a fixed rule.' },
      { key: 'limit_filled', badges: ['do_nothing'], title: 'Record whether the limit order filled', desc: 'If it didn’t fill and price left, mark it a missed trade. Do not chase with a market order.' },
      { key: 'setup_complete', badges: ['key'], title: 'Confirm the setup is complete', desc: 'Every box above is checked, or this isn’t a trade yet.' },
    ],
  },
];

export const WALK_AWAY_CONDITIONS = [
  { title: 'No clear 1H or 4H bias', text: 'Do not force direction when structure is unclear.' },
  { title: 'Wick through the level', text: 'Not a candle close, so it does not count.' },
  { title: 'Structure broke the wrong way', text: 'A body close beyond the PIL, opposite direction, means invalidation — no trade.' },
  { title: 'Limit wasn’t filled', text: 'No market orders after. Missed trade — move on.' },
  { title: 'Entering during Correction', text: 'Do not enter on the pullback itself.' },
  { title: 'You feel rushed or uncertain', text: 'Pressure is not confirmation.' },
];

export const ICC_FLOW_SUMMARY = [
  { tiny: 'HTF', big: 'Bias + Pre-Indication Level' },
  { tiny: '1M close', big: 'Indication' },
  { tiny: 'Wait', big: 'Correction' },
  { tiny: '1M close', big: 'Continuation' },
  { tiny: 'Defended swing', big: 'Stop Loss' },
  { tiny: 'Your plan', big: 'Target & R:R' },
];

export const GOLDEN_RULE = {
  title: 'The Golden Rule: Candle-Closure Confirmation',
  intro: 'Both confirmations in this flow require a candle body close through the Pre-Indication Level. A wick never counts.',
  phaseRules: [
    { phase: 'Indication', text: 'A 1M candle body-closes through the PIL. This confirms direction.' },
    { phase: 'Correction', text: 'No close required here — just watch the pullback and confirm it hasn’t invalidated.' },
    { phase: 'Continuation', text: 'A 1M candle body-closes back through the level, in the direction of the trend. This is your entry trigger.' },
  ],
  bottomLine: 'No candle closure = no confirmation = no trade. Every time.',
};

export const DAYLI_INTRO_NOTE = 'You don’t enter because price is moving. You enter because the setup is complete. If any box is missing a check, there is no trade.';

export const DECISION_OPTIONS = [
  { key: 'clean', label: 'Trade Is Clean', text: 'Trade is clean. The setup is complete.' },
  { key: 'wait', label: 'Wait for More Confirmation', text: 'Wait — the setup still needs more confirmation.' },
  { key: 'pass', label: 'Pass This Trade', text: 'Pass this trade. Incomplete checklist means no trade.' },
];

export function totalItemCount() {
  return CHECKLIST_PHASES.reduce((sum, p) => sum + p.items.length, 0);
}

export function readinessLabel(pct) {
  if (pct === 100) return 'Locked in';
  if (pct >= 75) return 'Almost ready';
  if (pct >= 50) return 'Building';
  if (pct >= 25) return 'Getting there';
  return 'Not ready';
}
