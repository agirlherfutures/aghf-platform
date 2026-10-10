/**
 * risk-core.js — A Girl & Her Futures™
 *
 * Phase 6 · Section 17 · Protecting Your Account. Survival math, kept honest:
 *
 *   - stop distance, contract size, dollar risk, account risk, daily risk and
 *     drawdown are SEPARATE values. Related, never interchangeable.
 *   - position size is FLOORED to whole contracts that stay within the cap. If no
 *     whole contract fits, that is a valid answer: the trade doesn't fit the plan.
 *     The stop is never shrunk to make the size fit.
 *   - every number is approximate price risk BEFORE fees and slippage.
 *   - no prop-firm rules are assumed; constraints come from the data given.
 *   - nothing here tells a student what she "should" risk.
 *
 * The RiskProfile saved here is meant to populate the AGHF Trading Plan,
 * Journal, Trade Planner, Execution Simulator and Risk Calculator later:
 * learn it → practice it → use it.
 */

import { trackP6 } from './trigger-core.js';
import { INSTRUMENTS } from './manage-core.js';

export { INSTRUMENTS };

/** Approximate price risk: stop distance × $ per point × contracts. */
export function priceRisk(stopPts, pointValue, contracts) {
  return stopPts * pointValue * contracts;
}
/** Risk of ONE contract at this stop. */
export function riskPerContract(stopPts, pointValue) {
  return stopPts * pointValue;
}
/** Whole contracts that fit under the cap. Floor, never round up. 0 = doesn't fit. */
export function maxContracts(riskCap, stopPts, pointValue) {
  const one = riskPerContract(stopPts, pointValue);
  return one > 0 ? Math.floor(riskCap / one) : 0;
}
/** R multiple of a result relative to the planned risk (1R). */
export function rOf(result, plannedRisk) {
  return plannedRisk ? +(result / plannedRisk).toFixed(2) : 0;
}
/** Theoretical expectancy per trade in R, before costs, IF the assumptions hold. */
export function expectancy(winRate, avgWinR, avgLossR) {
  return +(winRate * avgWinR - (1 - winRate) * avgLossR).toFixed(2);
}
/** Drawdown from peak. */
export function drawdown(peak, current) {
  const dollars = Math.max(0, peak - current);
  return { dollars, pct: peak ? +((dollars / peak) * 100).toFixed(1) : 0 };
}
/**
 * A streak of outcomes ('W' / 'L') with a risk model.
 * model: { type: 'fixedPct', pct } risk % of CURRENT equity
 *        { type: 'escalate', pct, step } risk grows after each loss (chasing recovery)
 * winR: R paid by a win. Returns equity after each trade (start first).
 */
export function equityPath(start, outcomes, model, winR = 2) {
  const out = [start];
  let eq = start, pct = model.pct;
  outcomes.forEach((o) => {
    const risk = eq * (pct / 100);
    eq = o === 'W' ? eq + risk * winR : eq - risk;
    out.push(+eq.toFixed(2));
    if (model.type === 'escalate') pct = o === 'L' ? pct * (model.step || 2) : model.pct;
  });
  return out;
}

/* ── DailyRiskTracker ─────────────────────────────────────────────────── */
export function dailyTracker(rules) {
  const s = { dailyLossLimitDollar: rules.dailyLossLimitDollar ?? null, dailyLossLimitR: rules.dailyLossLimitR ?? null,
    maxTradesPerDay: rules.maxTradesPerDay ?? null, maxLosses: rules.maxLosses ?? null,
    tradesTakenToday: 0, losses: 0, currentDailyPnL: 0, currentDailyR: 0 };
  return {
    state: s,
    record(pnl, r) { s.tradesTakenToday += 1; s.currentDailyPnL += pnl; s.currentDailyR = +(s.currentDailyR + r).toFixed(2); if (pnl < 0) s.losses += 1; },
    remainingDollar() { return s.dailyLossLimitDollar == null ? null : Math.max(0, s.dailyLossLimitDollar + Math.min(0, s.currentDailyPnL)); },
    remainingR() { return s.dailyLossLimitR == null ? null : Math.max(0, +(s.dailyLossLimitR + Math.min(0, s.currentDailyR)).toFixed(2)); },
    locked() {
      return (s.dailyLossLimitDollar != null && -s.currentDailyPnL >= s.dailyLossLimitDollar)
        || (s.dailyLossLimitR != null && -s.currentDailyR >= s.dailyLossLimitR)
        || (s.maxTradesPerDay != null && s.tradesTakenToday >= s.maxTradesPerDay)
        || (s.maxLosses != null && s.losses >= s.maxLosses);
    },
  };
}

/* ── AccountRiskContext ──────────────────────────────────────────────── */
/** Only what was explicitly provided. No firm's rules are assumed. */
export function accountContext(a) {
  return {
    accountType: a.accountType, displayedBalance: a.displayedBalance ?? null, riskCapacity: a.riskCapacity ?? null,
    remainingDrawdown: a.remainingDrawdown ?? null, dailyLossLimit: a.dailyLossLimit ?? null,
    contractLimit: a.contractLimit ?? null, personalRiskRule: a.personalRiskRule ?? null,
  };
}

/* ── RiskProfile (MY AGHF RISK FRAMEWORK) ────────────────────────────── */
const PROFILE_KEY = 'aghf_risk_profile';
export const PROFILE_FIELDS = [
  { key: 'accountType', label: 'Account type', type: 'choice', options: ['Personal account', 'Prop / evaluation', 'Both'] },
  { key: 'riskPerTradeLimit', label: 'Max risk per trade ($)', type: 'number' },
  { key: 'riskPerTradeR', label: 'Max risk per trade (R)', type: 'number', placeholder: '1' },
  { key: 'dailyLossLimitDollar', label: 'Max daily loss ($)', type: 'number' },
  { key: 'dailyLossLimitR', label: 'Max daily loss (R)', type: 'number' },
  { key: 'maxTradesPerDay', label: 'Max trades per day', type: 'number' },
  { key: 'stopModelPoints', label: 'Standard stop model (points)', type: 'number' },
  { key: 'targetModelPoints', label: 'Standard target model (points)', type: 'number' },
  { key: 'stopTradingWhen', label: 'What makes me stop trading?', type: 'text' },
];
export function loadRiskProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; } catch { return null; }
}
export function saveRiskProfile(p) {
  const prof = { ...p, contractSizing: 'determined-from-risk', savedAt: Date.now(), version: 1 };
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(prof)); } catch { /* storage blocked */ }
  window.AGHF_MEMBER_SYNC?.(PROFILE_KEY); // also save to her account (auth-guard.js)
  return prof;
}

/* ── Risk review (behavior, not identity) ────────────────────────────── */
export const RISK_SKILLS = {
  dollar: 'Dollar risk accuracy', sizing: 'Position sizing accuracy', r: 'R-multiple accuracy', daily: 'Daily stop decisions',
  frequency: 'Frequency awareness', drawdown: 'Drawdown understanding', account: 'Account constraint decisions', revenge: 'Revenge-sizing errors',
};
export function trackRisk(skill, correct) {
  trackP6(`risk:${skill}:tries`);
  if (correct) trackP6(`risk:${skill}:right`);
  trackP6('riskDecisions'); if (correct) trackP6('riskCorrect');
  if (!correct && skill === 'revenge') trackP6('revengeSizingErrors');
}
export function riskReview(s = {}) {
  const n = (k) => s[k] || 0;
  const pct = (k) => (n(`risk:${k}:tries`) ? Math.round((n(`risk:${k}:right`) / n(`risk:${k}:tries`)) * 100) : null);
  const rows = Object.entries(RISK_SKILLS).filter(([k]) => k !== 'revenge').map(([k, l]) => [l, pct(k) == null ? '·' : `${pct(k)}%`]);
  rows.push(['Revenge-sizing errors', n('revengeSizingErrors')]);
  rows.push(['Risk-rule adherence', n('riskDecisions') ? `${Math.round((n('riskCorrect') / n('riskDecisions')) * 100)}%` : '·']);
  const review = [];
  if ((pct('sizing') ?? 100) < 85) review.push({ line: 'You keep choosing the contracts first. Let’s reverse that.', cta: 'Risk first →', href: 'lesson.html?phase=p6&n=19' });
  if ((pct('dollar') ?? 100) < 85) review.push({ line: 'You know where your stop goes. Now let’s learn what that stop actually costs.', cta: 'Points vs dollars →', href: 'lesson.html?phase=p6&n=18' });
  if ((pct('daily') ?? 100) < 85) review.push({ line: 'Your setup recognition is strong. Your challenge is letting the daily rule outrank the next opportunity.', cta: 'Daily stop drill →', href: 'lesson.html?phase=p6&n=23' });
  if (n('revengeSizingErrors')) review.push({ line: 'You changed the risk because of the previous outcome. Did the account’s risk capacity change?', cta: 'Replay risk sequence →', href: 'lesson.html?phase=p6&n=25' });
  if ((pct('account') ?? 100) < 85) review.push({ line: 'You’re sizing the chart. Now size the ACCOUNT.', cta: 'Account constraints →', href: 'lesson.html?phase=p6&n=26' });
  return { rows, review };
}
