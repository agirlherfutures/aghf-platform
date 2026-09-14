// session.js — single-password login, no user accounts. A signed,
// httpOnly, SameSite=Strict cookie is the entire session mechanism: this
// app has exactly one "user" (whoever knows DASHBOARD_PASSWORD), so there
// is nothing to look up server-side beyond "is this cookie a value we
// signed, and not expired."

import crypto from 'node:crypto';

const COOKIE_NAME = 'whop_dash_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload) {
  return crypto.createHmac('sha256', process.env.DASHBOARD_SESSION_SECRET).update(payload).digest('hex');
}

export function createSessionCookie() {
  const expiresAt = Date.now() + MAX_AGE_MS;
  const payload = String(expiresAt);
  const value = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

export function hasValidSession(req) {
  const value = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!value) return false;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return false;
  try {
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
  } catch {
    return false;
  }
  return Number(payload) > Date.now();
}

/** Call at the top of any protected handler; returns false (and already responded 401) if not logged in. */
export function requireSession(req, res) {
  if (!hasValidSession(req)) {
    res.status(401).json({ error: 'Not logged in' });
    return false;
  }
  return true;
}
