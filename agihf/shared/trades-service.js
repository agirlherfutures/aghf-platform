/**
 * trades-service.js — A Girl & Her Futures™
 *
 * Trade Tracker data layer. Storage today is a localStorage array
 * (key `aghf_trades`), but every function here returns/accepts exactly
 * the Trade shape defined in dashboard-models.js — the shape a future
 * Supabase `trades` table would use. Swapping the storage layer later
 * (e.g. to fetch('/api/trades')) only touches this file; callers
 * (dayli-desk-engine.js, trade-tracker.html) never touch localStorage
 * directly.
 *
 * No prop-firm/platform credentials are ever collected here — "Connect
 * Trading Account" is a coming-soon affordance only (see trade-tracker.html).
 */

const KEY = 'aghf_trades';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(trades) {
  localStorage.setItem(KEY, JSON.stringify(trades));
}

/** @returns {import('./dashboard-models.js').Trade[]} newest first */
export function getTrades() {
  return readAll().slice().sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
}

/** @returns {import('./dashboard-models.js').Trade[]} */
export function getRecentTrades(n = 3) {
  return getTrades().slice(0, n);
}

/**
 * @param {Partial<import('./dashboard-models.js').Trade>} trade
 * @returns {import('./dashboard-models.js').Trade}
 */
export function addTrade(trade) {
  const trades = readAll();
  const full = {
    id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    importSource: 'manual',
    contracts: 1,
    netPnl: 0,
    ...trade,
    savedAt: new Date().toISOString(),
  };
  trades.push(full);
  writeAll(trades);
  return full;
}

/**
 * Minimal CSV import — expects a header row with at least symbol, direction,
 * entryTime, netPnl columns (case-insensitive). Unrecognized columns are
 * ignored rather than rejecting the whole file, since prop-firm/platform
 * exports vary widely — this is a starting point, not a full mapper.
 * @param {string} csvText
 * @returns {{ imported: number, skipped: number }}
 */
export function importTradesFromCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { imported: 0, skipped: 0 };
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const trades = readAll();
  let imported = 0;
  let skipped = 0;
  for (let i = 1; i < lines.length; i += 1) {
    const cells = lines[i].split(',').map((c) => c.trim());
    if (cells.length < 2 || !cells.some(Boolean)) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx]; });
    if (!row.symbol || !row.entrytime) { skipped += 1; continue; }
    trades.push({
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}`,
      symbol: row.symbol,
      direction: (row.direction || 'long').toLowerCase() === 'short' ? 'short' : 'long',
      entryTime: row.entrytime,
      exitTime: row.exittime || undefined,
      entryPrice: row.entryprice ? Number(row.entryprice) : undefined,
      exitPrice: row.exitprice ? Number(row.exitprice) : undefined,
      contracts: row.contracts ? Number(row.contracts) : 1,
      netPnl: row.netpnl ? Number(row.netpnl) : 0,
      importSource: 'csv',
      savedAt: new Date().toISOString(),
    });
    imported += 1;
  }
  writeAll(trades);
  return { imported, skipped };
}

/**
 * Today's private performance snapshot — net P&L, trade/win/loss counts,
 * win rate, average R:R, and daily trade-limit progress against a plan.
 * @param {{ maxTrades?: number }} [opts]
 */
export function getTodaysSnapshot(opts = {}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysTrades = getTrades().filter((t) => t.entryTime && t.entryTime.slice(0, 10) === todayStr);
  const wins = todaysTrades.filter((t) => t.netPnl > 0).length;
  const losses = todaysTrades.filter((t) => t.netPnl < 0).length;
  const netPnl = todaysTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const rrTrades = todaysTrades.filter((t) => t.plannedRisk && t.netPnl != null && t.plannedRisk > 0);
  const avgRR = rrTrades.length
    ? rrTrades.reduce((sum, t) => sum + Math.abs(t.netPnl) / t.plannedRisk, 0) / rrTrades.length
    : null;
  return {
    date: todayStr,
    netPnl,
    tradeCount: todaysTrades.length,
    wins, losses,
    winRate: todaysTrades.length ? Math.round((wins / todaysTrades.length) * 100) : null,
    avgRR,
    maxTrades: opts.maxTrades ?? null,
    trades: todaysTrades,
  };
}
