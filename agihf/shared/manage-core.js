/**
 * manage-core.js — A Girl & Her Futures™
 *
 * Phase 6 · Section 16 · Managing the Trade: the TradeManagementEngine core.
 *
 * One TradePlan object is used everywhere: lessons, the Trade Management
 * Simulator, and (later) the Academy journal. Learn it → practice it → use it.
 *
 * Stop distance, contract count, dollar risk, R and (future) account risk are
 * deliberately SEPARATE fields. They are related; they are not the same thing.
 *
 * MARKET EVENT (what price did) and TRADER ACTION (what she did) are kept apart:
 * price moving does not mean she has to do anything.
 *
 * Management quality is never derived from P&L.
 */

import { trackP6 } from './trigger-core.js';

export const INSTRUMENTS = {
  MNQ: { symbol: 'MNQ', name: 'Micro E-mini Nasdaq-100', pointValue: 2, tick: 0.25 },
  NQ: { symbol: 'NQ', name: 'E-mini Nasdaq-100', pointValue: 20, tick: 0.25 },
  MES: { symbol: 'MES', name: 'Micro E-mini S&P 500', pointValue: 5, tick: 0.25 },
};

export const MSTATE = { PLAN_CREATED: 'PLAN_CREATED', PLAN_LOCKED: 'PLAN_LOCKED', POSITION_OPEN: 'POSITION_OPEN', MANAGEMENT_ACTIVE: 'MANAGEMENT_ACTIVE' };
export const MEVENT = {
  NO_ACTION_REQUIRED: 'NO_ACTION_REQUIRED',
  PLANNED_PARTIAL_TRIGGERED: 'PLANNED_PARTIAL_TRIGGERED',
  PLANNED_STOP_ADJUSTMENT_TRIGGERED: 'PLANNED_STOP_ADJUSTMENT_TRIGGERED',
  STRUCTURAL_MANAGEMENT_TRIGGERED: 'STRUCTURAL_MANAGEMENT_TRIGGERED',
  TARGET_REACHED: 'TARGET_REACHED',
  STOP_REACHED: 'STOP_REACHED',
  MANUAL_EXIT_ALLOWED: 'MANUAL_EXIT_ALLOWED',
  PLAN_VIOLATION: 'PLAN_VIOLATION',
  TRADE_CLOSED: 'TRADE_CLOSED',
};

/** Trader actions while in a position. FOLLOW PLAN first: it's usually right. */
export const MA = { FOLLOW: 'follow', MOVE_STOP: 'move-stop', PARTIAL: 'partial', CLOSE: 'close', MOVE_TARGET: 'move-target', ADD: 'add' };
export const MA_META = {
  [MA.FOLLOW]: { label: 'FOLLOW PLAN', touch: null },
  [MA.MOVE_STOP]: { label: 'MOVE STOP', touch: 'stopChanges' },
  [MA.PARTIAL]: { label: 'TAKE PARTIAL', touch: 'partials' },
  [MA.CLOSE]: { label: 'CLOSE POSITION', touch: 'manualExits' },
  [MA.MOVE_TARGET]: { label: 'MOVE TARGET', touch: 'targetChanges' },
  [MA.ADD]: { label: 'ADD CONTRACT', touch: 'sizeChanges' },
};

/** "What changed?" — asked whenever she tries to touch a locked plan. */
export const WHY_CHANGED = [
  { key: 'predefined', label: 'A predefined condition occurred' },
  { key: 'structure', label: 'New structural information' },
  { key: 'emotion', label: 'Emotion / P&L' },
  { key: 'other', label: 'Other' },
];

/**
 * Build a TradePlan. Every derived number is its own field.
 * { instrument, side, entryPrice, stopPrice, targetPrice, contractCount, managementModel, partialRules,
 *   runnerRules, breakEvenRules, structuralRules, earlyInterventionRules }
 */
export function makePlan(p) {
  const inst = INSTRUMENTS[p.instrument || 'MNQ'];
  const long = (p.side || 'long') === 'long';
  const stopDistancePoints = Math.abs(p.entryPrice - p.stopPrice);
  const targetDistancePoints = Math.abs(p.targetPrice - p.entryPrice);
  const contractCount = p.contractCount ?? 1;
  const pointValue = p.pointValue ?? inst.pointValue;
  return {
    instrument: inst.symbol, side: long ? 'long' : 'short', pointValue,
    entryPrice: p.entryPrice, stopPrice: p.stopPrice, targetPrice: p.targetPrice,
    stopDistancePoints, targetDistancePoints, contractCount,
    plannedDollarRisk: stopDistancePoints * pointValue * contractCount,
    plannedDollarReward: targetDistancePoints * pointValue * contractCount,
    riskRewardRatio: stopDistancePoints ? +(targetDistancePoints / stopDistancePoints).toFixed(2) : null,
    managementModel: p.managementModel || 'fixed',
    partialRules: p.partialRules || 'None', runnerRules: p.runnerRules || 'None', breakEvenRules: p.breakEvenRules || 'None',
    structuralRules: p.structuralRules || 'None', earlyInterventionRules: p.earlyInterventionRules || 'None',
    // future Section 17 / journal fields, kept separate on purpose
    accountBalance: p.accountBalance ?? null, dailyLossLimit: p.dailyLossLimit ?? null, drawdownLimit: p.drawdownLimit ?? null,
    locked: false,
  };
}

/** Dollar P&L of `contracts` at `price`, before fees/slippage. */
export function pnlAt(plan, price, contracts = plan.contractCount) {
  const sgn = plan.side === 'long' ? 1 : -1;
  return (price - plan.entryPrice) * sgn * plan.pointValue * contracts;
}
/** R multiple of a dollar result relative to the planned risk. */
export function rMultiple(plan, dollars) {
  return plan.plannedDollarRisk ? +(dollars / plan.plannedDollarRisk).toFixed(2) : 0;
}
export const money = (v) => `${v < 0 ? '−' : '+'}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

/**
 * A touch is PLANNED (the plan said to, now), RULE-BASED (a predefined
 * condition triggered it) or UNPLANNED. Not every touch is bad; unplanned ones are.
 */
export function classifyTouch(action, event) {
  if (action === MA.FOLLOW) return 'none';
  const ok = (event === MEVENT.PLANNED_PARTIAL_TRIGGERED && action === MA.PARTIAL)
    || ((event === MEVENT.PLANNED_STOP_ADJUSTMENT_TRIGGERED || event === MEVENT.STRUCTURAL_MANAGEMENT_TRIGGERED) && action === MA.MOVE_STOP)
    || (event === MEVENT.MANUAL_EXIT_ALLOWED && action === MA.CLOSE);
  return ok ? 'rule-based' : 'unplanned';
}

/** Record a management decision for the review (behavior, never identity). */
export function trackManagement(action, cls, why) {
  trackP6('mgmtDecisions');
  if (cls !== 'unplanned') trackP6('mgmtCorrect');
  if (cls === 'none') trackP6('disciplineDecisions');
  if (cls === 'rule-based') trackP6('ruleBasedAdjustments');
  if (cls === 'unplanned') {
    trackP6({ [MA.MOVE_STOP]: 'unplannedStopMoves', [MA.MOVE_TARGET]: 'unplannedTargetChanges', [MA.PARTIAL]: 'unplannedPartials', [MA.CLOSE]: 'emotionalExits', [MA.ADD]: 'unplannedSizeChanges' }[action] || 'unplannedTouches');
    if (why === 'emotion') trackP6('pnlDrivenDecisions');
  }
}

/** The management review: plan adherence, unplanned touches, discipline decisions. */
export function managementReview(s = {}) {
  const n = (k) => s[k] || 0;
  const adherence = n('mgmtDecisions') ? Math.round((n('mgmtCorrect') / n('mgmtDecisions')) * 100) : 100;
  const rows = [
    ['Plan adherence', `${adherence}%`], ['Unplanned stop moves', n('unplannedStopMoves')], ['Unplanned target changes', n('unplannedTargetChanges')],
    ['Unplanned partials', n('unplannedPartials')], ['Emotional exits', n('emotionalExits')], ['Rule-based adjustments', n('ruleBasedAdjustments')],
    ['P&L-driven decisions', n('pnlDrivenDecisions')], ['Discipline decisions', n('disciplineDecisions')],
  ];
  const review = [];
  if (n('unplannedStopMoves') >= 2) review.push({ line: 'You’re trying to remove uncertainty from a trade that still needs room to move.', cta: 'Review break-even →', href: 'lesson.html?phase=p6&n=13' });
  if (n('unplannedPartials') >= 1) review.push({ line: 'You aren’t necessarily protecting profit. You’re changing the management model.', cta: 'Compare partial plans →', href: 'lesson.html?phase=p6&n=12' });
  if (n('pnlDrivenDecisions') >= 1 || n('emotionalExits') >= 1) review.push({ line: 'You reacted to money. What did PRICE actually do?', cta: 'Hide P&L & replay →', href: 'lesson.html?phase=p6&n=15' });
  const touches = n('unplannedStopMoves') + n('unplannedTargetChanges') + n('unplannedPartials') + n('emotionalExits') + n('unplannedSizeChanges');
  if (touches >= 3) review.push({ line: `You made ${touches + n('ruleBasedAdjustments')} management changes. Only ${n('ruleBasedAdjustments')} ${n('ruleBasedAdjustments') === 1 ? 'was' : 'were'} triggered by your original plan.`, cta: 'Review management touches →', href: 'lesson.html?phase=p6&n=14' });
  if (n('outcomeBiasErrors') >= 1) review.push({ line: 'You followed your management rules. The outcome was a loss. Those are two different facts.', cta: 'Review process vs outcome →', href: 'lesson.html?phase=p6&n=16' });
  return { adherence, rows, review, passed: adherence >= 80 };
}

/**
 * The journal record for one trade: planned fields, actual fields, outcome and
 * reflection, all separate. processGrade is NEVER computed from profit.
 */
export function journalRecord(plan, actual = {}, outcome = {}) {
  return {
    plannedEntry: plan.entryPrice, plannedStop: plan.stopPrice, plannedTarget: plan.targetPrice, plannedContracts: plan.contractCount,
    managementModel: plan.managementModel, partialRules: plan.partialRules, runnerRules: plan.runnerRules,
    breakEvenRules: plan.breakEvenRules, earlyInterventionRules: plan.earlyInterventionRules,
    actualStopChanges: actual.stopChanges || 0, actualTargetChanges: actual.targetChanges || 0, actualPartials: actual.partials || 0,
    actualSizeChanges: actual.sizeChanges || 0, manualExit: !!actual.manualExit,
    managementViolations: actual.violations || [], managementAdherence: actual.adherence ?? null,
    tradeOutcome: outcome.result || null, realizedR: outcome.r ?? null, realizedPnL: outcome.pnl ?? null,
    reflection: actual.reflection || '',
  };
}
