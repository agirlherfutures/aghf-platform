/**
 * eval-copy.js — A Girl & Her Futures™
 *
 * Centralized labels + educational-framing copy for the Pass Your Eval
 * Calculator. Every string a member sees describing a projected outcome
 * lives here, in one place, so the "never guaranteed" framing can't drift
 * lesson-by-lesson the way scattered inline strings would.
 *
 * Hard rule for anything added to this file: describe a projection, never
 * a promise. Approved language: "Estimated path," "Projection," "Planning
 * range," "Based on your assumptions," "Your results may vary." Never:
 * "Guaranteed pass date," "Guaranteed profit," "You will pass in X days,"
 * "Risk-free," "Guaranteed winning plan," or "risk of ruin" (that term
 * implies a real statistical ruin model this tool doesn't build — use
 * "Drawdown Risk"/"Plan Risk" instead).
 */

export const DISCLAIMER = {
  short: 'Educational planning tool only — not financial advice, not a guarantee.',
  full: 'This is an estimated path based on the assumptions you enter — not a guarantee of results, a pass date, or profit. Your actual results will vary with real market conditions, execution, and discipline.',
  notSure: 'Not sure how your firm measures drawdown? Check your evaluation agreement or ask your prop firm directly — "Not Sure" leaves every drawdown-dependent number blank rather than guessing, since guessing here could give you a false sense of safety.',
};

export const ACCOUNT_SIZE_PRESETS = [
  { label: '$25K', value: 25000 },
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: 'Custom', value: null },
];

export const PRESET_NOTE = 'These are example starting points to edit, not official prop-firm rules — every firm sets its own numbers.';

export const DRAWDOWN_TYPES = [
  { key: 'static', label: 'Static', help: 'A fixed dollar drawdown from your starting balance that never moves.' },
  { key: 'eod_trailing', label: 'End-of-Day Trailing', help: 'The drawdown floor trails your highest end-of-day balance.' },
  { key: 'intraday_trailing', label: 'Intraday Trailing', help: 'The drawdown floor trails your highest balance at any point, including intraday.' },
  { key: 'other', label: 'Other/Custom', help: 'Describe how your firm measures it in Notes — the numbers below will use what you enter there.' },
  { key: 'unknown', label: 'Not Sure', help: DISCLAIMER.notSure },
];

export const PROFIT_TARGET_TYPES = [
  { key: 'fixed_amount', label: 'Fixed dollar amount' },
  { key: 'percent', label: 'Percent of account size' },
];

export const RISK_MODES = [
  { key: 'points', label: 'Points' },
  { key: 'dollars', label: 'Dollars' },
];

export const PLAN_RISK_STATUS_COPY = {
  conservative: { label: 'Conservative', tone: 'good', description: 'Your plan has real cushion against your drawdown limit.' },
  balanced: { label: 'Balanced', tone: 'good', description: 'Your plan looks reasonable against your own numbers.' },
  elevated_risk: { label: 'Elevated Risk', tone: 'watch', description: 'One loss uses a meaningful share of your drawdown — worth tightening.' },
  high_risk: { label: 'High Risk', tone: 'warn', description: 'A short losing streak could seriously threaten this evaluation as planned.' },
  plan_conflicts_with_rules: { label: 'Plan Conflicts With Rules', tone: 'warn', description: 'Some of your inputs don’t add up yet — fix these before trusting the numbers below.' },
  more_information_needed: { label: 'More Information Needed', tone: 'neutral', description: 'Add a drawdown amount and risk-per-trade to see a plan risk status.' },
};

export const ENTRY_TAGS_NOTE = 'Drawdown Risk / Plan Risk — never "risk of ruin." That term implies a statistical ruin model this tool doesn’t build.';
