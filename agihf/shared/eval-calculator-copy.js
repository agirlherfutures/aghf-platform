/**
 * eval-calculator-copy.js — A Girl & Her Futures™
 *
 * Copy specific to the Eval Calculator (guided questions, presets,
 * welcome-back strings, result-card sentence templates, "See the Math"
 * plain-language labels). Kept separate from eval-copy.js — that file's
 * exports are read directly by journal.html/performance.html/
 * journal-history.html, so wizard-only strings never risk touching that
 * external contract. Same hard rule applies here: describe a projection,
 * never a promise — see eval-copy.js's header for the approved/banned
 * language list.
 */

/** Example starting points for the account-size picker. Every firm sets
 * its own numbers, so these only pre-fill fields she can change. */
export const EVAL_PRESETS = [
  { label: '$25K', size: 25000, target: 1500, drawdown: 1500 },
  { label: '$50K', size: 50000, target: 3000, drawdown: 2000 },
  { label: '$100K', size: 100000, target: 6000, drawdown: 3000 },
  { label: '$150K', size: 150000, target: 9000, drawdown: 4500 },
];

/** The guided first-visit questions, one per screen. */
export const GUIDED = {
  account: { title: 'Which account are you trying to pass?', sub: 'We’ll fill in the usual numbers for that size. You can change them next.' },
  target: { title: 'What do you need to make to pass?', sub: 'This is your profit target. You’ll find it on your prop firm’s rules page.' },
  drawdown: { title: 'How much can you lose before the eval ends?', sub: 'This is your max drawdown: the cushion you protect.' },
  risk: { title: 'How much are you okay losing on one trade?', sub: 'Pick the number that feels calm, not exciting.', rewardTitle: 'And when you win, you aim to make…' },
  days: { title: 'How many days do you want to give it?', sub: 'No rush. More days means a smaller goal each day.', tradesTitle: 'Most trades you’ll take in a day' },
};

export const PLAN_COPY = {
  writeEyebrow: 'Pass Your Eval',
  writeTitle: 'Your <em>pass plan.</em>',
  writeSub: 'Tap any colored word to change it. Your plan updates as you type.',
  cardEyebrow: 'Your pass plan',
};

export const SECTION_LABELS = {
  moreSettings: 'More Rules & Settings',
  seeTheMath: 'See the Math',
  exploreWhatIf: 'Explore What-If Scenarios',
};

export const RESULT_NOTE = 'This is an educational projection based on the numbers you entered—not a guaranteed pass date.';

export const NEED_MORE_INFO = 'We need more information to calculate this drawdown accurately.';

export const WELCOME_BACK = {
  heading: 'Welcome back.',
  sub: 'Here’s your active evaluation plan.',
};

/** "Your Plan Looks {Label}" — a 1:1 mapping over the existing 6
 * PLAN_RISK_STATUSES, never a new status. */
export function resultHeadline(statusLabel) {
  return `Your Plan Looks ${statusLabel}`;
}

/** Plain-language line items for "See the Math" — label + formula text,
 * purely descriptive of calculations that already exist in
 * eval-calculator-math.js. Formula text is hidden by default per item;
 * "Show Formula" reveals it. */
export const MATH_FORMULA_LABELS = {
  risk: { label: 'Risk per Trade', formula: 'Stop Loss (points) × Point Value × Contracts — or your entered dollar risk directly, if you entered risk in dollars.' },
  reward: { label: 'Reward per Trade', formula: 'Take Profit (points) × Point Value × Contracts — or your entered dollar reward directly, if you entered reward in dollars.' },
  expectedValue: { label: 'Expected Value per Trade', formula: '(Win Rate × Reward) − ((1 − Win Rate) × Risk) − Fees.' },
  winsNeeded: { label: 'Estimated Wins Needed', formula: 'Remaining Profit Target ÷ Reward per Trade, rounded up.' },
  drawdownExposure: { label: 'Drawdown Exposure per Loss', formula: 'Risk per Trade ÷ Drawdown Limit, as a percent.' },
  dailyLossExposure: { label: 'Daily Loss Exposure', formula: 'Daily Loss Limit ÷ Drawdown Limit, as a percent — how much of your whole cushion one bad day could use.' },
  consistencyRule: { label: 'Consistency Rule', formula: 'Your best single day’s profit ÷ total profit so far, compared against your entered consistency-rule percent.' },
  fees: { label: 'Fees', formula: 'Your entered fee per trade is subtracted from every win and every loss before any other math runs.' },
  estimatedPath: { label: 'Estimated Trading-Day Range', formula: 'Remaining Profit Target ÷ Estimated Net per Trading Day, recomputed at your win rate ± 10 points for the Conservative/Strong ends of the range.' },
};
