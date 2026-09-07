/**
 * psychology-service.js — A Girl & Her Futures™
 *
 * Client for the server-backed Psychology Coach (agihf/api/psychology-*.js).
 * Same shape/fallback pattern as checklist-service.js: in demo/preview
 * mode (window.AGHF_DEMO) there's no real session token, so every call
 * falls back to an in-memory store scoped to the current tab — a preview
 * visitor can try every mode without ever touching the network or
 * pretending to save real data.
 */

import { PLAYBOOK_CATEGORIES } from './dashboard-models.js';

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (window.AGHF_SESSION_TOKEN) headers.Authorization = `Bearer ${window.AGHF_SESSION_TOKEN}`;
  const res = await fetch(path, { ...opts, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { setupRequired: body.setupRequired });
  return body;
}

/* ── Demo-mode in-memory store ───────────────────────────────────── */

const DEFAULT_CONSENT = {
  tradeData: true, checklistAnswers: true, journalStructured: true, journalFreetext: true,
  emotions: true, sessionHistory: true, playbook: true, academyProgress: true,
};

let demoProfile = null;
const demoSessions = [];
const demoPlaybook = [];
const demoScenarioAttempts = [];

function freshDemoProfile() {
  const now = new Date().toISOString();
  return {
    userId: 'demo', coachingTone: 'gentle', personalizationEnabled: true, consent: { ...DEFAULT_CONSENT },
    currentFocus: null, currentFocusBody: null, currentFocusSource: null, timezone: null,
    createdAt: now, updatedAt: now,
  };
}

/* ── Profile ──────────────────────────────────────────────────────── */

/** @returns {Promise<import('./dashboard-models.js').PsychologyProfile>} */
export async function getPsychologyProfile() {
  if (window.AGHF_DEMO) {
    if (!demoProfile) demoProfile = freshDemoProfile();
    return demoProfile;
  }
  const { profile } = await apiFetch('/api/psychology-profile');
  return profile;
}

/** @param {Partial<import('./dashboard-models.js').PsychologyProfile>} patch */
export async function savePsychologyProfile(patch) {
  if (window.AGHF_DEMO) {
    demoProfile = { ...(demoProfile || freshDemoProfile()), ...patch, updatedAt: new Date().toISOString() };
    return demoProfile;
  }
  const { profile } = await apiFetch('/api/psychology-profile', { method: 'POST', body: JSON.stringify(patch) });
  return profile;
}

/* ── Sessions ─────────────────────────────────────────────────────── */

/** @returns {Promise<import('./dashboard-models.js').PsychologySession[]>} */
export async function listPsychologySessions(filters = {}) {
  if (window.AGHF_DEMO) {
    let rows = demoSessions.slice().reverse();
    if (filters.mode) rows = rows.filter((s) => s.mode === filters.mode);
    return rows;
  }
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v != null && v !== '')).toString();
  const { sessions } = await apiFetch(`/api/psychology-sessions${qs ? `?${qs}` : ''}`);
  return sessions || [];
}

/**
 * @param {Partial<import('./dashboard-models.js').PsychologySession>} session
 * @returns {Promise<import('./dashboard-models.js').PsychologySession>}
 */
export async function savePsychologySession(session) {
  if (window.AGHF_DEMO) {
    const now = new Date().toISOString();
    const saved = { id: session.id || `demo_${Date.now()}`, userId: 'demo', createdAt: now, completedAt: now, ...session, updatedAt: now };
    if (session.savePreference === 'one_time') return saved; // never actually stored, even in demo
    const idx = demoSessions.findIndex((s) => s.id === saved.id);
    if (idx >= 0) demoSessions[idx] = saved; else demoSessions.push(saved);
    return saved;
  }
  const { session: saved } = await apiFetch('/api/psychology-sessions', { method: 'POST', body: JSON.stringify(session) });
  return saved;
}

export async function deletePsychologySession(id) {
  if (window.AGHF_DEMO) {
    const idx = demoSessions.findIndex((s) => s.id === id);
    if (idx >= 0) demoSessions.splice(idx, 1);
    return;
  }
  await apiFetch(`/api/psychology-sessions?id=${id}`, { method: 'DELETE' });
}

/** "Delete Psychology History" — removes every saved session (per the spec's consent/deletion requirement). */
export async function deleteAllPsychologyHistory() {
  if (window.AGHF_DEMO) { demoSessions.length = 0; return; }
  await apiFetch('/api/psychology-sessions?all=true', { method: 'DELETE' });
}

/* ── Playbook ─────────────────────────────────────────────────────── */

/** @returns {Promise<import('./dashboard-models.js').PsychologyPlaybookItem[]>} */
export async function listPlaybookItems() {
  if (window.AGHF_DEMO) return demoPlaybook.filter((i) => !i.isArchived).sort((a, b) => (b.pinned - a.pinned) || (a.sortOrder - b.sortOrder));
  const { items } = await apiFetch('/api/psychology-playbook');
  return items || [];
}

/** @param {Partial<import('./dashboard-models.js').PsychologyPlaybookItem>} item */
export async function savePlaybookItem(item) {
  if (window.AGHF_DEMO) {
    const now = new Date().toISOString();
    const saved = { id: item.id || `demo_${Date.now()}`, userId: 'demo', sourceType: 'manual', pinned: false, aiAccessPermission: true, isArchived: false, sortOrder: 0, createdAt: now, ...item, updatedAt: now };
    const idx = demoPlaybook.findIndex((i) => i.id === saved.id);
    if (idx >= 0) demoPlaybook[idx] = saved; else demoPlaybook.push(saved);
    return saved;
  }
  const { item: saved } = await apiFetch('/api/psychology-playbook', { method: 'POST', body: JSON.stringify(item) });
  return saved;
}

export async function deletePlaybookItem(id) {
  if (window.AGHF_DEMO) {
    const idx = demoPlaybook.findIndex((i) => i.id === id);
    if (idx >= 0) demoPlaybook.splice(idx, 1);
    return;
  }
  await apiFetch(`/api/psychology-playbook?id=${id}`, { method: 'DELETE' });
}

export { PLAYBOOK_CATEGORIES };

/* ── Scenario attempts ────────────────────────────────────────────── */

export async function listScenarioAttempts(scenarioId) {
  if (window.AGHF_DEMO) return demoScenarioAttempts.filter((a) => !scenarioId || a.scenarioId === scenarioId);
  const qs = scenarioId ? `?scenarioId=${scenarioId}` : '';
  const { attempts } = await apiFetch(`/api/psychology-scenario-attempts${qs}`);
  return attempts || [];
}

export async function saveScenarioAttempt(attempt) {
  if (window.AGHF_DEMO) {
    const saved = { id: `demo_${Date.now()}`, userId: 'demo', completedAt: new Date().toISOString(), ...attempt };
    demoScenarioAttempts.push(saved);
    return saved;
  }
  const { attempt: saved } = await apiFetch('/api/psychology-scenario-attempts', { method: 'POST', body: JSON.stringify(attempt) });
  return saved;
}
