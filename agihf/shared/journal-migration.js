/**
 * journal-migration.js — A Girl & Her Futures™
 *
 * One-time, non-destructive migration of the earlier localStorage-only
 * checklist/trade data into the new server-backed tables. Runs at most
 * once per browser (guarded by `aghf_migrated_v1`), and never deletes the
 * original localStorage records — they're left in place as a harmless
 * backup even after a successful migration. If the new API isn't set up
 * yet (migration SQL not applied), every write fails and the flag is
 * simply not set, so it retries next load rather than losing data.
 */

import { saveEntry } from './journal-service.js';
import { saveChecklist } from './checklist-service.js';
import { showDeskToast } from './dayli-desk-engine.js';

const MIGRATION_FLAG = 'aghf_migrated_v1';

export async function migrateLegacyDataIfNeeded() {
  if (window.AGHF_DEMO) return; // nothing to migrate for a preview-only session
  if (localStorage.getItem(MIGRATION_FLAG) === '1') return;

  let imported = 0;
  try {
    imported += await migrateTrades();
    imported += await migrateChecklists();
    imported += await migrateReflections();
  } catch (err) {
    console.error('Legacy data migration error (will retry next load):', err);
    return;
  }
  localStorage.setItem(MIGRATION_FLAG, '1');
  if (imported > 0) showDeskToast(`Imported ${imported} earlier ${imported === 1 ? 'record' : 'records'} into your account ✦`);
}

async function migrateTrades() {
  let trades = [];
  try { trades = JSON.parse(localStorage.getItem('aghf_trades') || '[]'); } catch { /* none to migrate */ }
  for (const t of trades) {
    await saveEntry({
      entryType: 'trade',
      instrument: t.symbol,
      direction: t.direction,
      contracts: t.contracts,
      entryPrice: t.entryPrice,
      entryTime: t.entryTime,
      exits: t.exitPrice != null ? [{ contracts: t.contracts || 1, exitPrice: t.exitPrice, exitedAt: t.exitTime || t.entryTime }] : [],
      netPnl: t.netPnl,
      stopLoss: t.stopLoss,
      takeProfit: t.takeProfit,
      plannedRisk: t.plannedRisk,
      bias4h: t.bias4h,
      structure1h: t.structure1h,
      pil: t.pil,
      iccPhase: t.iccPhase,
      ruleViolations: t.ruleViolations || [],
      screenshots: t.screenshot ? [{ path: t.screenshot, uploadedAt: t.savedAt || new Date().toISOString() }] : [],
      entryReasoning: t.notes,
      tradeDate: (t.entryTime || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
      isDraft: false,
    });
  }
  return trades.length;
}

async function migrateChecklists() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('aghf_premarket_plan:'));
  let count = 0;
  for (const key of keys) {
    let plan;
    try { plan = JSON.parse(localStorage.getItem(key)); } catch { continue; }
    if (!plan || !plan.items) continue;
    await saveChecklist({
      tradingDate: plan.date,
      instrument: 'MNQ',
      templateVersion: 0, // marks this as a pre-phase-template legacy record
      items: plan.items.map((i) => ({ key: i.key, phase: 'market_context', label: i.label, checked: i.checked })),
      marketContext: { maxRisk: plan.maxRisk, maxTrades: plan.maxTrades },
      currentPhase: 'market_context',
      finalDecision: null,
      completedAt: plan.completedAt,
    });
    count += 1;
  }
  return count;
}

async function migrateReflections() {
  let notes = [];
  try { notes = JSON.parse(localStorage.getItem('aghf_notes') || '[]'); } catch { /* none to migrate */ }
  let count = 0;
  for (const n of notes) {
    if (n.type !== 'premarket' && n.type !== 'postmarket') continue;
    await saveEntry({
      entryType: n.type === 'premarket' ? 'premarket_reflection' : 'postmarket_reflection',
      prompt: n.prompt,
      entryReasoning: n.text,
      tradeDate: new Date(n.savedAt || Date.now()).toISOString().slice(0, 10),
      isDraft: false,
    });
    count += 1;
  }
  return count;
}
