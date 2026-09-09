/**
 * eval-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed Eval Calculator (agihf/api/eval-data.js).
 * Same demo-mode in-memory fallback shape as journal-service.js/
 * checklist-service.js — a preview visitor can create/edit/duplicate/
 * archive plans without ever touching the network or pretending anything
 * is actually saved.
 */

import { authFetch as apiFetch } from './auth-fetch.js';

const demoAccounts = [];
const demoPlans = [];

/* ── trading accounts ─────────────────────────────────────────────── */

export async function listTradingAccounts() {
  if (window.AGHF_DEMO) return demoAccounts.slice();
  const { accounts } = await apiFetch('/api/eval-data?resource=trading-accounts');
  return accounts || [];
}

export async function saveTradingAccount(account) {
  if (window.AGHF_DEMO) {
    const now = new Date().toISOString();
    if (account.id) {
      const idx = demoAccounts.findIndex((a) => a.id === account.id);
      const saved = { ...demoAccounts[idx], ...account, updatedAt: now };
      demoAccounts[idx] = saved;
      return saved;
    }
    const saved = { id: `demo_${Date.now()}`, isDefault: false, createdAt: now, updatedAt: now, ...account };
    demoAccounts.push(saved);
    return saved;
  }
  const method = account.id ? 'PATCH' : 'POST';
  const path = account.id ? `/api/eval-data?resource=trading-accounts&id=${account.id}` : '/api/eval-data?resource=trading-accounts';
  const { account: saved } = await apiFetch(path, { method, body: JSON.stringify(account) });
  return saved;
}

export async function archiveTradingAccount(id, archived = true) {
  if (window.AGHF_DEMO) {
    const idx = demoAccounts.findIndex((a) => a.id === id);
    if (idx >= 0) demoAccounts[idx].archivedAt = archived ? new Date().toISOString() : null;
    return;
  }
  await apiFetch(`/api/eval-data?resource=trading-accounts&id=${id}`, { method: 'PATCH', body: JSON.stringify({ archived }) });
}

/* ── eval plans ───────────────────────────────────────────────────── */

export async function listEvalPlans(filters = {}) {
  if (window.AGHF_DEMO) {
    let rows = demoPlans.filter((p) => !p.archivedAt);
    if (filters.tradingAccountId) rows = rows.filter((p) => p.tradingAccountId === filters.tradingAccountId);
    if (filters.status) rows = rows.filter((p) => p.status === filters.status);
    return rows;
  }
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v != null && v !== '')).toString();
  const { plans } = await apiFetch(`/api/eval-data?resource=eval-plans${qs ? `&${qs}` : ''}`);
  return plans || [];
}

export async function getEvalPlan(id) {
  if (window.AGHF_DEMO) return demoPlans.find((p) => p.id === id) || null;
  const { plan } = await apiFetch(`/api/eval-data?resource=eval-plans&id=${id}`);
  return plan;
}

export async function saveEvalPlan(plan) {
  if (window.AGHF_DEMO) {
    const now = new Date().toISOString();
    if (plan.id) {
      const idx = demoPlans.findIndex((p) => p.id === plan.id);
      const saved = { ...demoPlans[idx], ...plan, updatedAt: now };
      demoPlans[idx] = saved;
      return saved;
    }
    const saved = {
      id: `demo_${Date.now()}`, status: 'draft', isActive: false, tradingDaysElapsed: 0,
      createdAt: now, updatedAt: now, ...plan,
    };
    demoPlans.unshift(saved);
    return saved;
  }
  const method = plan.id ? 'PATCH' : 'POST';
  const path = plan.id ? `/api/eval-data?resource=eval-plans&id=${plan.id}` : '/api/eval-data?resource=eval-plans';
  const { plan: saved } = await apiFetch(path, { method, body: JSON.stringify(plan) });
  return saved;
}

export async function duplicateEvalPlan(id) {
  if (window.AGHF_DEMO) {
    const source = demoPlans.find((p) => p.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const saved = { ...source, id: `demo_${Date.now()}`, name: `${source.name} (Copy)`, status: 'draft', isActive: false, currentBalance: null, tradingDaysElapsed: 0, createdAt: now, updatedAt: now };
    demoPlans.unshift(saved);
    return saved;
  }
  const { plan } = await apiFetch('/api/eval-data?resource=eval-plans', { method: 'POST', body: JSON.stringify({ duplicateFromId: id }) });
  return plan;
}

export async function archiveEvalPlan(id, archived = true) {
  if (window.AGHF_DEMO) {
    const idx = demoPlans.findIndex((p) => p.id === id);
    if (idx >= 0) demoPlans[idx].archivedAt = archived ? new Date().toISOString() : null;
    return;
  }
  await apiFetch(`/api/eval-data?resource=eval-plans&id=${id}`, { method: 'PATCH', body: JSON.stringify({ archived }) });
}

export async function setActiveEvalPlan(id) {
  if (window.AGHF_DEMO) {
    demoPlans.forEach((p) => { p.isActive = p.id === id; });
    return demoPlans.find((p) => p.id === id);
  }
  const { plan } = await apiFetch(`/api/eval-data?resource=eval-plans&id=${id}`, { method: 'PATCH', body: JSON.stringify({ setActive: true }) });
  return plan;
}

export async function syncEvalPlanProgress(id, { currentBalance, tradingDaysElapsed }) {
  if (window.AGHF_DEMO) {
    const idx = demoPlans.findIndex((p) => p.id === id);
    if (idx >= 0) Object.assign(demoPlans[idx], { currentBalance, tradingDaysElapsed });
    return demoPlans[idx];
  }
  const { plan } = await apiFetch(`/api/eval-data?resource=eval-plans&id=${id}`, {
    method: 'PATCH', body: JSON.stringify({ sync: true, currentBalance, tradingDaysElapsed }),
  });
  return plan;
}

export async function deleteEvalPlan(id) {
  if (window.AGHF_DEMO) {
    const idx = demoPlans.findIndex((p) => p.id === id);
    if (idx >= 0) demoPlans.splice(idx, 1);
    return;
  }
  await apiFetch(`/api/eval-data?resource=eval-plans&id=${id}`, { method: 'DELETE' });
}
