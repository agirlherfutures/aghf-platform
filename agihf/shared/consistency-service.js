/**
 * consistency-service.js — A Girl & Her Futures™
 *
 * Computes today's private Execution Consistency score from existing
 * data (today's checklist, today's trades, today's journal reflections) —
 * never from profit alone. No storage of its own, so it's easy to later
 * swap for a server-computed or rules-engine version without touching
 * callers. Now async since its inputs are server-backed (checklist-
 * service.js, journal-service.js) rather than localStorage.
 */

import { getTodayChecklist } from './checklist-service.js';
import { getTodaysSnapshot, listEntries } from './journal-service.js';
import { todayKey } from './dashboard-models.js';

async function hasTodayEntry(entryType) {
  const today = todayKey();
  const { entries } = await listEntries({ entryType, from: today, to: today, limit: 1 });
  return entries.length > 0;
}

/** @returns {Promise<import('./dashboard-models.js').ConsistencyScoreResult>} */
export async function computeConsistencyScore() {
  const plan = await getTodayChecklist();
  const maxTrades = plan.marketContext?.maxTrades;
  const snapshot = await getTodaysSnapshot({ maxTrades: maxTrades ?? undefined });
  const tradedToday = snapshot.tradeCount > 0;
  const violationTags = snapshot.trades.flatMap((t) => t.ruleViolations || []);

  const [journalPremarket, journalPostmarket] = await Promise.all([
    hasTodayEntry('premarket_reflection'), hasTodayEntry('postmarket_reflection'),
  ]);

  const rules = [
    { key: 'premarket_plan', label: 'Completed pre-market plan', passed: !!plan.completedAt, applicable: true },
    {
      key: 'trade_limit', label: 'Respected max trade limit',
      passed: !maxTrades || snapshot.tradeCount <= maxTrades,
      applicable: !!maxTrades,
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
    { key: 'journal_premarket', label: 'Completed pre-market reflection', passed: journalPremarket, applicable: true },
    { key: 'journal_postmarket', label: 'Completed post-market review', passed: journalPostmarket, applicable: true },
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
