/**
 * eval-calculator-math.js — A Girl & Her Futures™
 *
 * Pure calculation layer for the Pass Your Eval Calculator — zero DOM, zero
 * fetch, matching this codebase's established journal-insights.js-feeds-
 * journal-engine.js split. Every function here is a plain function of its
 * inputs so it can be unit-tested and so eval-calculator-engine.js never
 * needs to duplicate a formula.
 *
 * Educational framing only — nothing here ever produces or should be
 * rendered as "guaranteed," "risk-free," or "you will pass in X days."
 * Every day-count output is a range with named confidence tiers, and every
 * simulation is clearly a projection from the member's own assumptions.
 */

import { getInstrument } from './instrument-data.js';

/* ── seeded PRNG ──────────────────────────────────────────────────────
 * mulberry32 — tiny, deterministic, zero new dependency. Used only for
 * the "What If?" scenario simulator so results are reproducible in dev
 * and tests (same seed → same trial outcomes), never for anything that
 * needs cryptographic randomness. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── inputs / validation ──────────────────────────────────────────── */

export function validatePlanInputs(plan) {
  const errors = [];
  if (!plan) return { valid: false, errors: ['No plan data.'] };
  if (!plan.accountSize || plan.accountSize <= 0) errors.push('Account size must be greater than 0.');
  if (!plan.startingBalance || plan.startingBalance <= 0) errors.push('Starting balance must be greater than 0.');
  if (plan.assumedWinRatePct != null && (plan.assumedWinRatePct < 0 || plan.assumedWinRatePct > 100)) {
    errors.push('Assumed win rate must be between 0 and 100.');
  }
  if (plan.riskMode && !['points', 'dollars'].includes(plan.riskMode)) errors.push('Unknown risk mode.');
  if (plan.drawdownType === 'other' && !plan.notes) {
    errors.push('For "Other/Custom" drawdown, add a note describing how it works so the numbers below stay honest.');
  }
  return { valid: errors.length === 0, errors };
}

/** Resolves a point value: a recognized instrument's config, else the
 * member's manual override, else null — never a silent guess. Mirrors the
 * exact fallback pattern journal-engine.js already uses. */
export function resolvePointValue(plan) {
  const known = getInstrument(plan?.instrument);
  if (known) return known.pointValue;
  return plan?.manualPointValue != null ? Number(plan.manualPointValue) : null;
}

function dollarRiskOrReward(plan, value) {
  if (value == null) return null;
  if (plan.riskMode === 'dollars') return Number(value);
  const pointValue = resolvePointValue(plan);
  const contracts = plan.contractsPlanned || 1;
  if (pointValue == null) return null;
  return Number(value) * pointValue * contracts;
}

export function computeRiskPerTrade(plan) {
  return dollarRiskOrReward(plan, plan?.riskPerTradeValue);
}

export function computeRewardPerTrade(plan) {
  return dollarRiskOrReward(plan, plan?.rewardPerTradeValue);
}

export function computePlannedRR(plan) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  if (!risk || reward == null) return null;
  return reward / risk;
}

/* ── target / drawdown ────────────────────────────────────────────── */

export function computeProfitTargetDollar(plan) {
  if (plan?.profitTargetValue == null) return null;
  if (plan.profitTargetType === 'percent') return plan.accountSize * (plan.profitTargetValue / 100);
  return Number(plan.profitTargetValue);
}

/** Clamped ≥0 — a target already reached never shows as a negative "remaining" figure. */
export function computeRemainingProfitTarget(plan) {
  const target = computeProfitTargetDollar(plan);
  if (target == null) return null;
  const progress = (plan.currentBalance ?? plan.startingBalance) - plan.startingBalance;
  return Math.max(0, target - progress);
}

/** Drawdown limit in dollars. `unknown` type deliberately returns null —
 * never fabricates a number the member never gave us. */
export function computeDrawdownLimitDollar(plan) {
  if (plan?.drawdownType === 'unknown' || plan?.drawdownValue == null) return null;
  return Number(plan.drawdownValue);
}

export function computeRemainingDrawdown(plan) {
  const limit = computeDrawdownLimitDollar(plan);
  if (limit == null) return null;
  const lossSoFar = Math.max(0, plan.startingBalance - (plan.currentBalance ?? plan.startingBalance));
  return Math.max(0, limit - lossSoFar);
}

export function computeDrawdownUsagePerLoss(plan) {
  const limit = computeDrawdownLimitDollar(plan);
  const risk = computeRiskPerTrade(plan);
  if (!limit || !risk) return null;
  return (risk / limit) * 100;
}

/** Floored — a "1.8 losses remaining" is meaningless; also flags the
 * caveat that fees/slippage aren't modeled beyond feesPerTrade. */
export function computeMaxLossesRemaining(plan) {
  const remaining = computeRemainingDrawdown(plan);
  const risk = computeRiskPerTrade(plan);
  if (remaining == null || !risk) return null;
  return Math.floor(remaining / risk);
}

/* ── expected value ───────────────────────────────────────────────── */

export function computeExpectedValuePerTrade(plan) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const winRate = plan?.assumedWinRatePct != null ? plan.assumedWinRatePct / 100 : null;
  if (risk == null || reward == null || winRate == null) return null;
  const fees = plan.feesPerTrade || 0;
  return winRate * reward - (1 - winRate) * risk - fees;
}

/**
 * Estimated net $ per trading day — models the member's own conditional
 * rules (stop-after-win, reduce-size-after-loss, a second-trade contract
 * size) as an actual expectation over the day's trade sequence, not a
 * naive EV-per-trade × maxTradesPerDay. Walks trade slots one at a time,
 * tracking the probability of "still trading" at each slot.
 */
export function computeEstimatedNetPerDay(plan) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const winRate = plan?.assumedWinRatePct != null ? plan.assumedWinRatePct / 100 : null;
  if (risk == null || reward == null || winRate == null) return null;
  const fees = plan.feesPerTrade || 0;
  const maxTrades = plan.maxTradesPerDay || 1;
  const maxLosses = plan.maxLossesPerDay || maxTrades;

  let expectedNet = 0;
  let pStillTrading = 1; // probability the day hasn't already stopped
  let lossesSoFar = 0;

  for (let slot = 0; slot < maxTrades; slot += 1) {
    if (pStillTrading <= 0) break;
    // Reduce-size-after-loss only ever affects the *second* trade slot in
    // this model (matches the plan's "second trade contract size" field —
    // a simple, honest approximation, not a full per-slot size schedule).
    const useReducedSize = plan.reduceSizeAfterLoss && slot === 1 && lossesSoFar > 0;
    let slotRisk = risk;
    let slotReward = reward;
    if (useReducedSize && plan.secondTradeContractSize && plan.contractsPlanned) {
      const scale = plan.secondTradeContractSize / plan.contractsPlanned;
      slotRisk = risk * scale;
      slotReward = reward * scale;
    }
    const slotEv = winRate * slotReward - (1 - winRate) * slotRisk - fees;
    expectedNet += pStillTrading * slotEv;

    // Update the probability the day continues into the next slot.
    if (plan.stopAfterWin) pStillTrading *= (1 - winRate); // a win this slot ends the day
    const wouldHitLossLimit = lossesSoFar + 1 >= maxLosses;
    if (wouldHitLossLimit) pStillTrading *= winRate; // a loss this slot ends the day at the daily loss cap
    lossesSoFar += 1 - winRate; // expected losses accrued, for the next slot's cap check
  }
  return expectedNet;
}

/** A 3-tier range (conservative/expected/strong), never a single fake-precise number. */
export function computeEstimatedTradingDaysRange(plan) {
  const remainingTarget = computeRemainingProfitTarget(plan);
  if (remainingTarget == null || remainingTarget <= 0) return { conservative: null, expected: null, strong: null };

  const baseWinRate = plan.assumedWinRatePct;
  if (baseWinRate == null) return { conservative: null, expected: null, strong: null };

  function daysAt(winRateDelta) {
    const adjusted = { ...plan, assumedWinRatePct: Math.max(0, Math.min(100, baseWinRate + winRateDelta)) };
    const perDay = computeEstimatedNetPerDay(adjusted);
    if (!perDay || perDay <= 0) return null;
    return Math.ceil(remainingTarget / perDay);
  }

  return {
    conservative: daysAt(-10),
    expected: daysAt(0),
    strong: daysAt(10),
  };
}

/* ── consistency rule ─────────────────────────────────────────────── */

/** @param {{netPnl:number}[]} dailyResults */
export function computeConsistencyRuleStatus(plan, dailyResults) {
  if (plan?.consistencyRulePct == null || !dailyResults?.length) return { applicable: false, status: 'not_enough_data' };
  const totalProfit = dailyResults.reduce((s, d) => s + Math.max(0, d.netPnl), 0);
  if (totalProfit <= 0) return { applicable: true, status: 'not_enough_data', bestDayPct: null };
  const bestDay = Math.max(...dailyResults.map((d) => Math.max(0, d.netPnl)));
  const bestDayPct = (bestDay / totalProfit) * 100;
  return {
    applicable: true,
    bestDayPct,
    status: bestDayPct > plan.consistencyRulePct ? 'violated' : 'within_limit',
  };
}

/* ── single seeded simulation ─────────────────────────────────────── */

/**
 * Walks day-by-day, trade-by-trade against the member's own rules
 * (stop-after-win, reduce-size-after-loss, daily loss/trade caps) using a
 * seeded PRNG so a given seed always reproduces the same path — this is a
 * projection from her stated assumptions, never a promise.
 */
export function simulateEvalPath(plan, { seed = 1, maxDays = 250 } = {}) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const winRate = plan?.assumedWinRatePct != null ? plan.assumedWinRatePct / 100 : null;
  const target = computeProfitTargetDollar(plan);
  const drawdownLimit = computeDrawdownLimitDollar(plan);
  if (risk == null || reward == null || winRate == null || target == null) {
    return { passed: false, failed: false, daysUsed: 0, endingBalance: plan?.startingBalance ?? null, failReason: 'insufficient_inputs' };
  }

  const rand = mulberry32(seed);
  const fees = plan.feesPerTrade || 0;
  const maxTrades = plan.maxTradesPerDay || 1;
  const maxLosses = plan.maxLossesPerDay || maxTrades;

  let balance = plan.startingBalance;
  let peakBalance = plan.startingBalance;
  let day = 0;

  for (day = 1; day <= maxDays; day += 1) {
    let tradesToday = 0;
    let lossesToday = 0;
    let wonToday = false;
    while (tradesToday < maxTrades && lossesToday < maxLosses && !(plan.stopAfterWin && wonToday)) {
      const useReducedSize = plan.reduceSizeAfterLoss && tradesToday === 1 && lossesToday > 0;
      let tradeRisk = risk;
      let tradeReward = reward;
      if (useReducedSize && plan.secondTradeContractSize && plan.contractsPlanned) {
        const scale = plan.secondTradeContractSize / plan.contractsPlanned;
        tradeRisk = risk * scale;
        tradeReward = reward * scale;
      }
      const isWin = rand() < winRate;
      balance += (isWin ? tradeReward : -tradeRisk) - fees;
      tradesToday += 1;
      if (isWin) wonToday = true; else lossesToday += 1;

      peakBalance = Math.max(peakBalance, balance);
      const drawdownFloor = plan.drawdownType === 'eod_trailing' || plan.drawdownType === 'intraday_trailing'
        ? peakBalance - drawdownLimit
        : plan.startingBalance - drawdownLimit;
      if (drawdownLimit != null && balance <= drawdownFloor) {
        return { passed: false, failed: true, daysUsed: day, endingBalance: balance, failReason: 'drawdown_breached' };
      }
      if (balance - plan.startingBalance >= target) {
        return { passed: true, failed: false, daysUsed: day, endingBalance: balance, failReason: null };
      }
    }
  }
  return { passed: false, failed: false, daysUsed: maxDays, endingBalance: balance, failReason: 'ran_out_of_days' };
}

/**
 * Runs N reproducible-seed trials (seed, seed+1, seed+2, ...) and
 * summarizes pass rate / median days-to-pass — backs the "What If?"
 * section's headline numbers. `trials`/`seed` are always returned so the
 * UI can show its work rather than presenting a bare percentage.
 */
export function runScenarioBatch(plan, { trials = 200, seed = 42, maxDays = 250 } = {}) {
  const results = [];
  for (let i = 0; i < trials; i += 1) {
    results.push(simulateEvalPath(plan, { seed: seed + i, maxDays }));
  }
  const passed = results.filter((r) => r.passed);
  const daysToPass = passed.map((r) => r.daysUsed).sort((a, b) => a - b);
  const median = daysToPass.length ? daysToPass[Math.floor(daysToPass.length / 2)] : null;
  return {
    trials, seed,
    passRate: (passed.length / trials) * 100,
    failedByDrawdown: results.filter((r) => r.failReason === 'drawdown_breached').length,
    ranOutOfDays: results.filter((r) => r.failReason === 'ran_out_of_days').length,
    medianDaysToPass: median,
  };
}

/* ── What If? scenarios ───────────────────────────────────────────── */

export const WHAT_IF_SCENARIOS = [
  { key: 'win_rate_minus_10', label: 'Win rate 10% lower', apply: (p) => ({ ...p, assumedWinRatePct: Math.max(0, p.assumedWinRatePct - 10) }) },
  { key: 'win_rate_plus_10', label: 'Win rate 10% higher', apply: (p) => ({ ...p, assumedWinRatePct: Math.min(100, p.assumedWinRatePct + 10) }) },
  { key: 'one_fewer_trade_day', label: 'One fewer trade per day', apply: (p) => ({ ...p, maxTradesPerDay: Math.max(1, (p.maxTradesPerDay || 1) - 1) }) },
  { key: 'one_more_trade_day', label: 'One more trade per day', apply: (p) => ({ ...p, maxTradesPerDay: (p.maxTradesPerDay || 1) + 1 }) },
  { key: 'tighter_stop', label: 'Stop 25% tighter', apply: (p) => ({ ...p, riskPerTradeValue: p.riskPerTradeValue * 0.75 }) },
  { key: 'wider_stop', label: 'Stop 25% wider', apply: (p) => ({ ...p, riskPerTradeValue: p.riskPerTradeValue * 1.25 }) },
  { key: 'bigger_target', label: 'Take-profit 25% larger', apply: (p) => ({ ...p, rewardPerTradeValue: p.rewardPerTradeValue * 1.25 }) },
  { key: 'smaller_target', label: 'Take-profit 25% smaller', apply: (p) => ({ ...p, rewardPerTradeValue: p.rewardPerTradeValue * 0.75 }) },
  { key: 'add_stop_after_win', label: 'Add a stop-after-win rule', apply: (p) => ({ ...p, stopAfterWin: true }) },
  { key: 'higher_fees', label: 'Fees 2x higher', apply: (p) => ({ ...p, feesPerTrade: (p.feesPerTrade || 0) * 2 }) },
];

/* ── plan risk status (multi-factor, never win-rate alone) ───────── */

export const PLAN_RISK_STATUSES = ['conservative', 'balanced', 'elevated_risk', 'high_risk', 'plan_conflicts_with_rules', 'more_information_needed'];

/**
 * Derives a plan-risk label from several factors together — cushion vs.
 * the drawdown limit, how much of the daily loss limit one bad day could
 * consume, and whether the plan's own numbers are internally consistent —
 * never from win rate alone. Never called "risk of ruin" (that term
 * implies a real statistical ruin model this function doesn't build).
 */
export function classifyPlanRiskStatus(plan) {
  const { valid, errors } = validatePlanInputs(plan);
  if (!valid) return { status: 'plan_conflicts_with_rules', reasons: errors };

  const risk = computeRiskPerTrade(plan);
  const drawdownLimit = computeDrawdownLimitDollar(plan);
  const maxLossesRemaining = computeMaxLossesRemaining(plan);
  const usagePerLoss = computeDrawdownUsagePerLoss(plan);
  const dailyLossVsDrawdown = plan.dailyLossLimit && drawdownLimit ? (plan.dailyLossLimit / drawdownLimit) * 100 : null;

  if (risk == null || drawdownLimit == null) {
    return { status: 'more_information_needed', reasons: ['Add a drawdown amount and risk-per-trade to see a plan risk status.'] };
  }

  const reasons = [];
  let score = 0; // higher = riskier

  if (usagePerLoss != null) {
    if (usagePerLoss > 15) { score += 2; reasons.push(`One loss uses ${usagePerLoss.toFixed(0)}% of your drawdown limit.`); }
    else if (usagePerLoss > 8) { score += 1; reasons.push(`One loss uses ${usagePerLoss.toFixed(0)}% of your drawdown limit.`); }
  }
  if (maxLossesRemaining != null) {
    if (maxLossesRemaining <= 3) { score += 2; reasons.push(`Only about ${maxLossesRemaining} full losses before hitting the drawdown limit.`); }
    else if (maxLossesRemaining <= 6) { score += 1; }
  }
  if (dailyLossVsDrawdown != null && dailyLossVsDrawdown > 40) {
    score += 1; reasons.push('Your daily loss limit alone could use a large share of your total drawdown in one day.');
  }
  if (plan.assumedWinRatePct != null && plan.assumedWinRatePct < 30) {
    score += 1; reasons.push('A win rate this low needs a strong reward-to-risk ratio to stay net positive.');
  }

  let status;
  if (score >= 4) status = 'high_risk';
  else if (score >= 2) status = 'elevated_risk';
  else if (score === 0) status = 'conservative';
  else status = 'balanced';

  return { status, reasons, score };
}

/* ── actual vs. planned (read-only, never overwrites the plan) ──────
 * Reuses each journal entry's already-computed netPnl/outcome (from
 * journal-engine.js's computeTradeTotals/computeOutcome) rather than
 * re-deriving trade math here — this only aggregates. */
export function computeActualVsPlanned(plan, entries) {
  const trades = (entries || []).filter((e) => e.entryType === 'trade' && !e.isDraft);
  if (!trades.length) return { hasData: false };
  const netPnl = trades.reduce((s, t) => s + (t.netPnl || 0), 0);
  const wins = trades.filter((t) => t.outcome === 'win').length;
  const actualWinRate = (wins / trades.length) * 100;
  return {
    hasData: true,
    actualTradeCount: trades.length,
    actualNetPnl: netPnl,
    actualWinRate,
    plannedWinRate: plan.assumedWinRatePct ?? null,
    winRateDelta: plan.assumedWinRatePct != null ? actualWinRate - plan.assumedWinRatePct : null,
  };
}
