/**
 * eval-calculator-copy.js — A Girl & Her Futures™
 *
 * Copy specific to the 3-step Eval Calculator wizard shell (step titles,
 * welcome-back strings, result-card sentence templates, "See the Math"
 * plain-language labels). Kept separate from eval-copy.js — that file's
 * exports are read directly by journal.html/performance.html/
 * journal-history.html, so wizard-only strings never risk touching that
 * external contract. Same hard rule applies here: describe a projection,
 * never a promise — see eval-copy.js's header for the approved/banned
 * language list.
 */

export const STEP_TITLES = {
  step1: { eyebrow: 'Step 1 of 3 · My Evaluation', title: 'Tell us about your evaluation.' },
  step2: { eyebrow: 'Step 2 of 3 · My Trade Plan', title: 'How do you plan to trade?' },
  step3: { eyebrow: 'Step 3 of 3 · My Plan', title: 'Here’s your plan.' },
};

export const SECTION_LABELS = {
  addMoreEvalRules: 'Add More Evaluation Rules',
  customizeMyPlan: 'Customize My Plan',
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
