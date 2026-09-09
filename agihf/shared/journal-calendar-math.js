/**
 * journal-calendar-math.js — A Girl & Her Futures™
 *
 * Pure aggregation layer for the Monthly Trade Journal Calendar — zero DOM,
 * matching the journal-insights.js-feeds-journal-engine.js split already
 * established in this codebase. Every function here takes already-fetched
 * entries/checklists and returns plain data; journal-calendar-engine.js
 * renders it.
 *
 * Dates use the exact same browser-local `tradeDate` convention as the
 * rest of the journal feature (via dashboard-models.js's todayKey()) — no
 * new timezone concept is introduced here.
 */

import { todayKey } from './dashboard-models.js';

/** Filters trades (and, separately, checklists) to one account before any
 * aggregation happens — accounts are never silently blended together. */
export function filterByAccount(rows, accountId) {
  if (!accountId) return rows;
  return rows.filter((r) => r.accountId === accountId);
}

/** @returns {Map<string, object[]>} tradeDate -> trade entries, executed trades only (entryType==='trade', not draft) */
export function groupEntriesByDay(entries) {
  const map = new Map();
  for (const e of entries) {
    if (e.entryType !== 'trade' || e.isDraft) continue;
    if (!e.tradeDate) continue;
    if (!map.has(e.tradeDate)) map.set(e.tradeDate, []);
    map.get(e.tradeDate).push(e);
  }
  return map;
}

/** @returns {Map<string, object[]>} tradingDate -> checklist rows */
export function groupChecklistsByDay(checklists) {
  const map = new Map();
  for (const c of checklists) {
    if (!c.tradingDate) continue;
    if (!map.has(c.tradingDate)) map.set(c.tradingDate, []);
    map.get(c.tradingDate).push(c);
  }
  return map;
}

/** Checklist rows where the member walked away or passed on the setup —
 * tracked separately from executed trades, never counted as a trade. */
export function computePassedSetupsForDay(checklistsForDay) {
  return (checklistsForDay || []).filter((c) => c.finalDecision === 'wait' || c.finalDecision === 'pass');
}

/**
 * P&L-blind Clean Execution classification: a losing day where every
 * trade that answered ruleCheck said 'yes' still qualifies; a winning day
 * with any 'no' cannot auto-qualify. Never a fabricated result — returns
 * null when nothing on this day actually answered ruleCheck.
 */
function computeRuleAdherence(trades) {
  const answered = trades.filter((t) => t.ruleCheck);
  if (!answered.length) return { status: 'not_enough_data', cleanExecution: null };
  const anyNo = answered.some((t) => t.ruleCheck === 'no');
  const anyMostly = answered.some((t) => t.ruleCheck === 'mostly');
  const allYes = answered.every((t) => t.ruleCheck === 'yes');
  return {
    status: anyNo ? 'violated' : anyMostly ? 'mixed' : 'clean',
    cleanExecution: allYes,
  };
}

/**
 * @param {object[]} trades executed trade entries for one day
 * @param {object[]} checklistsForDay checklist rows for the same day
 * @returns {object} day aggregate — never fabricates a number when there's
 * no underlying data (netPnl/winRate/etc. are null on a no-trade day).
 */
export function computeDayAggregate(date, trades, checklistsForDay = []) {
  const passedSetups = computePassedSetupsForDay(checklistsForDay);
  if (!trades.length) {
    return {
      date, tradeCount: 0, netPnl: null, wins: 0, losses: 0, breakeven: 0,
      cleanExecution: null, ruleAdherenceStatus: 'not_enough_data',
      journalComplete: null, hasScreenshot: false,
      passedSetupCount: passedSetups.length,
      missedSetup: passedSetups.length > 0,
      checklistCompletionPct: checklistsForDay[0]?.completionPct ?? null,
    };
  }
  const netPnl = trades.reduce((s, t) => s + (t.netPnl || 0), 0);
  const wins = trades.filter((t) => t.outcome === 'win').length;
  const losses = trades.filter((t) => t.outcome === 'loss').length;
  const breakeven = trades.filter((t) => t.outcome === 'breakeven').length;
  const { status: ruleAdherenceStatus, cleanExecution } = computeRuleAdherence(trades);
  const journalComplete = trades.every((t) => t.wentWell && t.wouldImprove && t.lessons?.length);
  const hasScreenshot = trades.some((t) => t.screenshots?.length);

  return {
    date, tradeCount: trades.length, netPnl, wins, losses, breakeven,
    cleanExecution, ruleAdherenceStatus, journalComplete, hasScreenshot,
    passedSetupCount: passedSetups.length,
    missedSetup: false, // a day with executed trades isn't a "missed setup" day, regardless of any passed checklist that day
    checklistCompletionPct: checklistsForDay[0]?.completionPct ?? null,
  };
}

/** A calm, non-shaming badge classification — never color-only in the UI (always paired with an icon/label). */
export function classifyDayBadge(aggregate) {
  if (!aggregate || aggregate.tradeCount === 0) {
    return aggregate?.missedSetup ? 'missed_setup' : 'no_trades';
  }
  if (aggregate.netPnl > 0) return 'profit';
  if (aggregate.netPnl < 0) return 'loss';
  return 'breakeven';
}

/**
 * Month-boundary-correct 6-row (42-cell) grid. Adjacent-month filler cells
 * are flagged `isCurrentMonth:false` and excluded from month stats by the
 * caller (they're rendered muted, not counted).
 * @param {number} year @param {number} month 0-indexed (Date.getMonth() convention)
 * @param {Map<string, object>} aggregatesByDate
 */
export function computeMonthGrid(year, month, aggregatesByDate) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const gridStart = new Date(year, month, 1 - startOffset);
  const today = todayKey();

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    cells.push({
      date: key, dayOfMonth: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: key === today,
      aggregate: aggregatesByDate.get(key) || null,
    });
  }
  return cells;
}

/**
 * Monthly Performance Summary. Returns `insufficientData:true` (never a
 * misleading zero) when the month has fewer than 3 trading days.
 */
export function computeMonthSummary(dayAggregates, opts = {}) {
  const tradingDays = dayAggregates.filter((d) => d.tradeCount > 0);
  if (tradingDays.length < 3) {
    return { insufficientData: true, tradingDaysCount: tradingDays.length };
  }

  const totalTrades = tradingDays.reduce((s, d) => s + d.tradeCount, 0);
  const totalWins = tradingDays.reduce((s, d) => s + d.wins, 0);
  const totalLosses = tradingDays.reduce((s, d) => s + d.losses, 0);
  const netPnl = tradingDays.reduce((s, d) => s + (d.netPnl || 0), 0);
  const bestDay = tradingDays.reduce((best, d) => (best == null || d.netPnl > best.netPnl ? d : best), null);
  const worstDay = tradingDays.reduce((worst, d) => (worst == null || d.netPnl < worst.netPnl ? d : worst), null);
  const cleanExecutionDays = tradingDays.filter((d) => d.cleanExecution === true).length;
  const ruleViolationDays = tradingDays.filter((d) => d.ruleAdherenceStatus === 'violated').length;
  const missedSetupDays = dayAggregates.filter((d) => d.missedSetup).length;

  return {
    insufficientData: false,
    tradingDaysCount: tradingDays.length,
    totalTrades, netPnl,
    winRate: totalTrades ? Math.round((totalWins / totalTrades) * 100) : null,
    wins: totalWins, losses: totalLosses,
    bestDay, worstDay,
    cleanExecutionDays, ruleViolationDays, missedSetupDays,
    journalingStreak: opts.journalingStreak ?? null,
  };
}

/**
 * Calm, non-shaming comparison of one day's actuals against an active eval
 * plan's own daily rules — never derived for a day with zero trades (an
 * empty day is never "within plan" or "exceeded," it's just empty).
 * @returns {{riskStatus:'within_plan'|'risk_exceeded', tradeCountStatus:'within_plan'|'trade_limit_exceeded', journalStatus:'complete'|'incomplete'|'not_enough_data'}|null}
 */
export function classifyDayVsPlan(aggregate, plan) {
  if (!plan || !aggregate || !aggregate.tradeCount) return null;
  const riskStatus = plan.dailyLossLimit != null && aggregate.netPnl < 0 && Math.abs(aggregate.netPnl) > plan.dailyLossLimit
    ? 'risk_exceeded' : 'within_plan';
  const tradeCountStatus = plan.maxTradesPerDay != null && aggregate.tradeCount > plan.maxTradesPerDay
    ? 'trade_limit_exceeded' : 'within_plan';
  const journalStatus = aggregate.journalComplete == null ? 'not_enough_data' : aggregate.journalComplete ? 'complete' : 'incomplete';
  return { riskStatus, tradeCountStatus, journalStatus };
}
