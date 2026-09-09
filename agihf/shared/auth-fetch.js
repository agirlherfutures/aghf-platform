/**
 * auth-fetch.js — A Girl & Her Futures™
 *
 * Shared authenticated-fetch helper, extracted from agent-service.js's own
 * fix for a real "Invalid or expired token" report: this app is not an
 * SPA, so a member can sit on a page for a long time, and auth-guard.js
 * only refreshes window.AGHF_SESSION_TOKEN via its own onAuthStateChange
 * listener — a backgrounded/throttled tab can miss that past actual JWT
 * expiry, leaving a stale token in memory. Every service file that talks
 * to an authenticated API endpoint should use authFetch() instead of its
 * own local apiFetch(), so this fix lives in one place, not four copies.
 */

export async function ensureFreshToken() {
  if (window.AGHF_DEMO || !window.AGHF_SUPABASE) return;
  try {
    const { data: { session } } = await window.AGHF_SUPABASE.auth.getSession();
    if (session?.access_token) window.AGHF_SESSION_TOKEN = session.access_token;
  } catch { /* let the request itself surface any real failure */ }
}

/** One silent refresh attempt after a 401 — the second line of defense if the token was already stale before ensureFreshToken() even ran. */
export async function refreshTokenOnce() {
  if (window.AGHF_DEMO || !window.AGHF_SUPABASE) return false;
  try {
    const { data: { session } } = await window.AGHF_SUPABASE.auth.refreshSession();
    if (session?.access_token) { window.AGHF_SESSION_TOKEN = session.access_token; return true; }
  } catch { /* fall through — the caller's existing error path handles it */ }
  return false;
}

export async function authFetch(path, opts = {}, _retried = false) {
  await ensureFreshToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (window.AGHF_SESSION_TOKEN) headers.Authorization = `Bearer ${window.AGHF_SESSION_TOKEN}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401 && !_retried && await refreshTokenOnce()) return authFetch(path, opts, true);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { setupRequired: body.setupRequired });
  return body;
}
