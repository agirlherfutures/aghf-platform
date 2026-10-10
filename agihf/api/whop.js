// api/whop.js
// Sign in with Whop. Plans are sold on Whop. Only people who hold one of the two Academy
// products get in (free and Discord-only Whop members don't), and only while it's active.
//
//   GET  /api/whop?action=login[&redirect=/dashboard.html]  → Whop sign-in (OAuth 2.1 + PKCE)
//   GET  /api/whop?action=callback&code&state                → checks access, signs the member in
//   POST /api/whop?action=check   (Authorization: Bearer <Supabase access token>)
//        → { active, plan } — re-checks the member with Whop (auth-guard calls this about once a day)
//
// Environment (Vercel → Settings → Environment Variables):
//   WHOP_CLIENT_ID, WHOP_CLIENT_SECRET   the Whop app's OAuth credentials
//   WHOP_API_KEY                         the app API key (used for access checks)
//   WHOP_ACADEMY_PRODUCT_ID              prod_… for The Academy ($49.99/mo)
//   WHOP_INDICATOR_PRODUCT_ID            prod_… for Academy + Dayli ICC Indicator ($64.99/mo)
//   SITE_URL                             e.g. https://agirlandherfutures.com (no trailing slash)
//   SUPABASE_URL, SUPABASE_SERVICE_KEY   already set
// The Whop app's redirect URI must be  <SITE_URL>/api/whop?action=callback
// and <SITE_URL>/dashboard.html must be an allowed redirect URL in Supabase Auth.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const WHOP = 'https://api.whop.com';
const COOKIE = 'whop_oauth';
const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const redirectUri = () => `${site()}/api/whop?action=callback`;
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// Only same-site paths may be used as the post-login destination.
const safePath = (p) => (typeof p === 'string' && /^\/[A-Za-z0-9._\-/?=&%]*$/.test(p) && !p.startsWith('//') ? p : '/dashboard.html');

function readCookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function setCookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(value)}; Path=/api/whop; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
}
function go(res, url) { res.statusCode = 302; res.setHeader('Location', url); res.end(); }
const back = (res, reason) => go(res, `${site()}/login.html?whop=${reason}`);

// Which plan the Whop user holds right now: 'indicator', 'academy' or null.
async function planFor(whopUserId) {
  const has = async (resource) => {
    if (!resource) return false;
    const r = await fetch(`${WHOP}/api/v1/users/${encodeURIComponent(whopUserId)}/access/${encodeURIComponent(resource)}`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    if (!r.ok) throw new Error(`Whop access check failed (${r.status})`);
    const j = await r.json();
    return !!j.has_access;
  };
  if (await has(process.env.WHOP_INDICATOR_PRODUCT_ID)) return 'indicator';
  if (await has(process.env.WHOP_ACADEMY_PRODUCT_ID)) return 'academy';
  return null;
}

async function login(req, res) {
  const verifier = b64url(crypto.randomBytes(32));
  const state = b64url(crypto.randomBytes(16));
  const nonce = b64url(crypto.randomBytes(16));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  setCookie(res, JSON.stringify({ verifier, state, nonce, redirect: safePath(req.query.redirect) }), 600);
  const q = new URLSearchParams({
    response_type: 'code', client_id: process.env.WHOP_CLIENT_ID, redirect_uri: redirectUri(),
    scope: 'openid profile email', state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  });
  go(res, `${WHOP}/oauth/authorize?${q}`);
}

async function callback(req, res) {
  let saved;
  try { saved = JSON.parse(readCookie(req, COOKIE) || ''); } catch { saved = null; }
  setCookie(res, '', 0);
  if (req.query.error) return back(res, 'cancelled');
  if (!saved || !req.query.code || req.query.state !== saved.state) return back(res, 'expired');

  // Code → tokens.
  const tr = await fetch(`${WHOP}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code: req.query.code, redirect_uri: redirectUri(),
      client_id: process.env.WHOP_CLIENT_ID, client_secret: process.env.WHOP_CLIENT_SECRET, code_verifier: saved.verifier,
    }),
  });
  if (!tr.ok) { console.error('Whop token exchange', tr.status, await tr.text()); return back(res, 'error'); }
  const tokens = await tr.json();

  // Who is this? The ID token comes straight from Whop over TLS; the nonce ties it to this sign-in.
  let who = {};
  try { who = JSON.parse(Buffer.from((tokens.id_token || '').split('.')[1] || '', 'base64url').toString()); } catch { who = {}; }
  if (who.nonce && who.nonce !== saved.nonce) return back(res, 'expired');
  if (!who.sub || !who.email) {
    const ur = await fetch(`${WHOP}/oauth/userinfo`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (ur.ok) who = { ...who, ...(await ur.json()) };
  }
  if (!who.sub || !who.email) return back(res, 'error');

  const plan = await planFor(who.sub);
  if (!plan) return back(res, 'no_membership');

  // Find or create the site account for this email, then sign them in with a one-time link.
  const email = String(who.email).toLowerCase();
  const { error: createErr } = await supabase.auth.admin.createUser({
    email, email_confirm: true, user_metadata: { full_name: who.name || who.preferred_username || '' },
  });
  if (createErr && !/already|registered|exists/i.test(createErr.message)) { console.error(createErr); return back(res, 'error'); }
  const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink', email, options: { redirectTo: `${site()}${saved.redirect}` },
  });
  if (linkErr || !link?.properties?.action_link) { console.error(linkErr); return back(res, 'error'); }
  const userId = link.user?.id;
  if (userId) {
    await supabase.auth.admin.updateUserById(userId, { app_metadata: { whop_user_id: who.sub, plan, whop_checked_at: new Date().toISOString() } });
    await supabase.from('subscriptions').upsert({ user_id: userId, status: 'active' }, { onConflict: 'user_id' });
  }
  go(res, link.properties.action_link);
}

async function check(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  const { data: { user } = {}, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const whopId = user.app_metadata?.whop_user_id;
  if (!whopId) return res.status(200).json({ active: false, plan: null });
  let plan;
  try { plan = await planFor(whopId); } catch (e) {
    console.error(e.message);
    // If Whop can't be reached, don't lock members out; try again next time.
    return res.status(200).json({ active: true, plan: user.app_metadata?.plan || null, unverified: true });
  }
  await supabase.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, plan, whop_checked_at: new Date().toISOString() } });
  await supabase.from('subscriptions').upsert({ user_id: user.id, status: plan ? 'active' : 'cancelled' }, { onConflict: 'user_id' });
  res.status(200).json({ active: !!plan, plan });
}

export default async function handler(req, res) {
  try {
    const action = req.query.action;
    if (action === 'login' && req.method === 'GET') return await login(req, res);
    if (action === 'callback' && req.method === 'GET') return await callback(req, res);
    if (action === 'check' && req.method === 'POST') return await check(req, res);
    res.status(404).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Whop auth error:', err);
    if (req.query.action === 'check') return res.status(200).json({ active: true, unverified: true });
    back(res, 'error');
  }
}
