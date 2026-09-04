/**
 * premarket-plan-service.js — A Girl & Her Futures™
 *
 * Data layer for the Dayli ICC Pre-Market Plan checklist. One
 * PreMarketPlanState per calendar day, localStorage-keyed per day so a
 * plan resumes correctly even after midnight rolls into a new trading
 * day. Storage is local today; the returned/accepted shape is exactly
 * what a future `premarket_plans` Supabase table would hold.
 */

import { todayKey } from './dashboard-models.js';

const KEY_PREFIX = 'aghf_premarket_plan:';

const DEFAULT_ITEMS = [
  { key: 'range_4h', label: 'Mark the 4H external range' },
  { key: 'bias_4h', label: 'Determine the 4H bias' },
  { key: 'structure_1h', label: 'Confirm the 1H structure' },
  { key: 'pil', label: 'Identify the nearest PIL' },
  { key: 'checkpoint_15m', label: 'Check the 15M checkpoint' },
  { key: 'news', label: 'Review high-impact news' },
  { key: 'max_risk', label: 'Set maximum risk' },
  { key: 'max_trades', label: 'Set maximum number of trades' },
];

/** @returns {import('./dashboard-models.js').PreMarketPlanState} */
export function getTodayPlan() {
  const key = KEY_PREFIX + todayKey();
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved) return saved;
  } catch { /* fall through to a fresh plan */ }
  return {
    date: todayKey(),
    items: DEFAULT_ITEMS.map((i) => ({ ...i, checked: false })),
    entryCondition: '',
    maxRisk: null,
    maxTrades: null,
    completedAt: null,
  };
}

/** @param {import('./dashboard-models.js').PreMarketPlanState} state */
export function savePlanProgress(state) {
  const allChecked = state.items.every((i) => i.checked);
  const next = {
    ...state,
    completedAt: allChecked ? (state.completedAt || new Date().toISOString()) : null,
  };
  localStorage.setItem(KEY_PREFIX + state.date, JSON.stringify(next));
  return next;
}
