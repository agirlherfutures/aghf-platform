/**
 * checklist-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed Dayli ICC Trade Checklist (agihf/api/
 * checklists.js). Replaces premarket-plan-service.js's localStorage-only
 * approach — a checklist now belongs to the authenticated member and
 * survives a refresh, a new device, or a cleared browser.
 *
 * In demo/preview mode (window.AGHF_DEMO, no real session token) API
 * calls would just 401, so this falls back to an in-memory store scoped
 * to the current tab — enough to let a preview visitor try the flow
 * without ever hitting the network or pretending to save real data.
 */

import { CHECKLIST_PHASES, TEMPLATE_VERSION, readinessLabel } from './checklist-template.js';

function freshItems() {
  return CHECKLIST_PHASES.flatMap((phase) =>
    phase.items.map((item) => ({ key: item.key, phase: phase.key, label: item.title, checked: false })));
}

function freshChecklist(instrument = 'MNQ') {
  const now = new Date().toISOString();
  return {
    id: null,
    userId: window.AGHF_USER?.id || 'demo',
    accountId: null,
    tradingDate: now.slice(0, 10),
    session: null,
    instrument,
    templateVersion: TEMPLATE_VERSION,
    marketContext: {},
    items: freshItems(),
    currentPhase: CHECKLIST_PHASES[0].key,
    completionPct: 0,
    readinessStatus: readinessLabel(0),
    finalDecision: null,
    linkedJournalEntryId: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

const demoStore = new Map(); // key: `${date}:${instrument}` -> checklist, only used in demo mode

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (window.AGHF_SESSION_TOKEN) headers.Authorization = `Bearer ${window.AGHF_SESSION_TOKEN}`;
  const res = await fetch(path, { ...opts, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { setupRequired: body.setupRequired });
  return body;
}

function recompute(state) {
  const checkedCount = state.items.filter((i) => i.checked).length;
  const completionPct = state.items.length ? Math.round((checkedCount / state.items.length) * 100) : 0;
  return { ...state, completionPct, readinessStatus: readinessLabel(completionPct) };
}

/** @returns {Promise<import('./dashboard-models.js').ChecklistState>} */
export async function getTodayChecklist(instrument = 'MNQ') {
  const today = new Date().toISOString().slice(0, 10);
  if (window.AGHF_DEMO) {
    return demoStore.get(`${today}:${instrument}`) || freshChecklist(instrument);
  }
  const { checklist } = await apiFetch(`/api/checklists?date=${today}&instrument=${instrument}`);
  return checklist || freshChecklist(instrument);
}

/** @returns {Promise<import('./dashboard-models.js').ChecklistState|null>} */
export async function getChecklistById(id) {
  if (window.AGHF_DEMO) return null;
  const { checklist } = await apiFetch(`/api/checklists?id=${id}`);
  return checklist;
}

/** @returns {Promise<import('./dashboard-models.js').ChecklistState[]>} */
export async function listChecklists(limit = 50) {
  if (window.AGHF_DEMO) return Array.from(demoStore.values());
  const { checklists } = await apiFetch(`/api/checklists?limit=${limit}`);
  return checklists || [];
}

/** @param {import('./dashboard-models.js').ChecklistState} state */
export async function saveChecklist(state) {
  const next = recompute(state);
  if (window.AGHF_DEMO) {
    const saved = { ...next, id: next.id || `demo_${Date.now()}`, updatedAt: new Date().toISOString() };
    demoStore.set(`${saved.tradingDate}:${saved.instrument}`, saved);
    return saved;
  }
  const { checklist } = await apiFetch('/api/checklists', { method: 'POST', body: JSON.stringify(next) });
  return checklist;
}

/** Toggles "exclude from AGHF Agent analysis" without touching any other field on the row. */
export async function setChecklistExcludedFromAgent(id, excluded) {
  if (window.AGHF_DEMO) {
    for (const c of demoStore.values()) if (c.id === id) c.excludedFromAgent = excluded;
    return { success: true };
  }
  return apiFetch('/api/checklists', { method: 'PATCH', body: JSON.stringify({ id, excludedFromAgent: excluded }) });
}

/**
 * Debounced autosave wrapper — calls `onStatus('saving'|'saved'|'error')`
 * so the UI can show a save-state indicator without every caller
 * reimplementing the debounce/status dance.
 */
export function createAutosaver(onStatus) {
  let timer = null;
  let latest = null;
  return function scheduleSave(state) {
    latest = state;
    onStatus('saving');
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const saved = await saveChecklist(latest);
        onStatus('saved', saved);
      } catch (err) {
        console.error('Checklist autosave error:', err);
        onStatus('error', err);
      }
    }, 700);
  };
}
