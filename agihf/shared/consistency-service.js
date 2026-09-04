/**
 * consistency-service.js — A Girl & Her Futures™
 *
 * Computes today's private Execution Consistency score from existing
 * data (pre-market plan, today's trades, today's journal entries) — never
 * from profit alone. Pure function: no storage of its own, no side
 * effects, so it's easy to later swap for a server-computed or rules-
 * engine version without touching callers.
 */

import { getTodayPlan } from './premarket-plan-service.js';
import { getTodaysSnapshot } from './trades-service.js';
import { getEntries } from './journal-service.js';
import { todayKey } from './dashboard-models.js';

function hasTodayEntry(type) {
  const today = todayKey();
  return getEntries({ type }).some((e) => {
    const savedAt = typeof e.savedAt === 'number' ? new Date(e.savedAt) : new Date(e.savedAt);
    return !Number.isNaN(savedAt.getTime()) && savedAt.toISOString().slice(0, 10) === today;
  });
}

/** @returns {import('./dashboard-models.js').ConsistencyScoreResult} */
export function computeConsistencyScore() {
  const plan = getTodayPlan();
  const snapshot = getTodaysSnapshot({ maxTrades: plan.maxTrades ?? undefined });
  const tradedToday = snapshot.tradeCount > 0;
  const violationTags = snapshot.trades.flatMap((t) => t.ruleViolations || []);

  const rules = [
    { key: 'premarket_plan', label: 'Completed pre-market plan', passed: !!plan.completedAt, applicable: true },
    {
      key: 'trade_limit', label: 'Respected max trade limit',
      passed: !plan.maxTrades || snapshot.tradeCount <= plan.maxTrades,
      applicable: !!plan.maxTrades,
    },
    {
      key: 'waited_for_confirmation', label: 'Waited for confirmation before entering',
      passed: !violationTags.includes('entered_early'), applicable: tradedToday,
    },
    {
      key: 'traded_with_bias', label: 'Traded with the identified bias',
      passed: !violationTags.includes('against_bias'), applicable: tradedToday,
    },
    {
      key: 'avoided_consolidation', label: 'Avoided trading during consolidation',
      passed: !violationTags.includes('during_consolidation'), applicable: tradedToday,
    },
    {
      key: 'avoided_news', label: 'Avoided high-impact news windows',
      passed: !violationTags.includes('news_proximity'), applicable: tradedToday,
    },
    { key: 'journal_premarket', label: 'Completed pre-market reflection', passed: hasTodayEntry('premarket'), applicable: true },
    { key: 'journal_postmarket', label: 'Completed post-market review', passed: hasTodayEntry('postmarket'), applicable: true },
  ];

  const applicableRules = rules.filter((r) => r.applicable);
  const passedCount = applicableRules.filter((r) => r.passed).length;
  const scorePct = applicableRules.length ? Math.round((passedCount / applicableRules.length) * 100) : 0;

  return {
    date: todayKey(),
    scorePct,
    rules,
    rulesPassed: passedCount,
    rulesApplicable: applicableRules.length,
  };
}
