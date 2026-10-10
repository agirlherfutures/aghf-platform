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
// Env values with any copy-paste spaces or line breaks removed.
const env = (k) => (process.env[k] || '').trim();
// Pull the real value out of a pasted env var. Copying Whop's "local environment" block can bring
// the whole `NAME=value` block (several lines) along, so take the part that looks like the value.
function cleanEnv(k, pattern) {
  const raw = env(k);
  if (!raw) return '';
  const m = pattern && raw.match(pattern);
  if (m) return m[0];
  const line = raw.split(/\r?\n/).map((x) => x.trim()).find(Boolean) || '';
  return /^[A-Z0-9_]+=/.test(line) ? line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') : line;
}
const API_KEY_RE = /apik_[A-Za-z0-9_-]+/;
const apiKey = () => cleanEnv('WHOP_API_KEY', API_KEY_RE);
const clientId = () => cleanEnv('WHOP_CLIENT_ID', /app_[A-Za-z0-9]+/);
const clientSecret = () => cleanEnv('WHOP_CLIENT_SECRET', API_KEY_RE);
const productId = (k) => cleanEnv(k, /prod_[A-Za-z0-9]+/);
const site = () => env('SITE_URL').replace(/\/$/, '');
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
// `step` says which part failed (e.g. token-400, access-403) so a screenshot of the login page
// is enough to diagnose it. It never contains anything secret.
const back = (res, reason, step) => go(res, `${site()}/login.html?whop=${reason}${step ? `&step=${encodeURIComponent(step)}` : ''}`);

// Which plan the Whop user holds right now: 'indicator', 'academy' or null.
// Asks with the app's API key; if Whop refuses that (e.g. the app lacks permission), asks with
// the member's own sign-in token, which Whop also accepts for checking her own access.
async function planFor(whopUserId, userToken) {
  // Returns the response, or null if the request couldn't even be sent (e.g. a malformed key).
  const ask = async (resource, token) => {
    try {
      return await fetch(`${WHOP}/api/v1/users/${encodeURIComponent(whopUserId)}/access/${encodeURIComponent(resource)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Whop access check could not be sent:', e.message.replace(/apik_[A-Za-z0-9_-]+/g, 'apik_…'));
      return null;
    }
  };
  const has = async (resource) => {
    if (!resource) return false;
    let r = apiKey() ? await ask(resource, apiKey()) : null;
    if ((!r || !r.ok) && userToken) {
      if (r) console.error('Whop access check with API key failed', r.status, (await r.text()).slice(0, 300));
      r = await ask(resource, userToken);
    }
    if (!r) { const err = new Error('Whop access check could not be sent'); err.status = 'send'; throw err; }
    if (!r.ok) {
      const err = new Error(`Whop access check failed (${r.status}): ${(await r.text()).slice(0, 300)}`);
      err.status = r.status;
      throw err;
    }
    const j = await r.json();
    return !!j.has_access;
  };
  // The indicator product is optional: a problem checking it never blocks the Academy check.
  try {
    if (await has(productId('WHOP_INDICATOR_PRODUCT_ID'))) return 'indicator';
  } catch (e) {
    console.error('Indicator access check skipped:', e.message);
  }
  if (await has(productId('WHOP_ACADEMY_PRODUCT_ID'))) return 'academy';
  return null;
}

async function login(req, res) {
  const verifier = b64url(crypto.randomBytes(32));
  const state = b64url(crypto.randomBytes(16));
  const nonce = b64url(crypto.randomBytes(16));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  setCookie(res, JSON.stringify({ verifier, state, nonce, redirect: safePath(req.query.redirect) }), 600);
  const q = new URLSearchParams({
    response_type: 'code', client_id: clientId(), redirect_uri: redirectUri(),
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

  // Code → tokens. Whop's examples send JSON; a form-encoded body is the OAuth standard, so try both.
  const fields = {
    grant_type: 'authorization_code', code: req.query.code, redirect_uri: redirectUri(),
    client_id: clientId(), client_secret: clientSecret(), code_verifier: saved.verifier,
  };
  let tr = await fetch(`${WHOP}/oauth/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(fields),
  });
  if (!tr.ok) {
    console.error('Whop token exchange (JSON)', tr.status, (await tr.text()).slice(0, 500));
    tr = await fetch(`${WHOP}/oauth/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams(fields),
    });
  }
  if (!tr.ok) {
    console.error('Whop token exchange (form)', tr.status, (await tr.text()).slice(0, 500));
    // Some OAuth servers only accept the client secret in an HTTP Basic header.
    const { client_secret, ...rest } = fields;
    const basic = Buffer.from(`${encodeURIComponent(fields.client_id)}:${encodeURIComponent(client_secret || '')}`).toString('base64');
    tr = await fetch(`${WHOP}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', Authorization: `Basic ${basic}` },
      body: new URLSearchParams(rest),
    });
  }
  if (!tr.ok) {
    console.error('Whop token exchange (basic)', tr.status, (await tr.text()).slice(0, 500));
    const secret = clientSecret();
    // Safe hints only (never the secret): whether it is set, its length, and stray spaces.
    console.error('Whop client config', { clientId: clientId(), secretSet: !!secret, secretLength: secret.length, secretHasSpaces: /\s/.test(secret) });
    return back(res, 'error', `token-${tr.status}${secret ? '' : '-nosecret'}`);
  }
  const tokens = await tr.json();

  // Who is this? The ID token comes straight from Whop over TLS; the nonce ties it to this sign-in.
  let who = {};
  try { who = JSON.parse(Buffer.from((tokens.id_token || '').split('.')[1] || '', 'base64url').toString()); } catch { who = {}; }
  if (who.nonce && who.nonce !== saved.nonce) return back(res, 'expired');
  if (!who.sub || !who.email) {
    const ur = await fetch(`${WHOP}/oauth/userinfo`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (ur.ok) who = { ...who, ...(await ur.json()) };
  }
  if (!who.sub || !who.email) { console.error('Whop identity missing', { hasSub: !!who.sub, hasEmail: !!who.email }); return back(res, 'error', 'identity'); }

  let plan;
  try { plan = await planFor(who.sub, tokens.access_token); } catch (e) { console.error(e.message); return back(res, 'error', `access-${e.status || 'x'}`); }
  if (!plan) return back(res, 'no_membership');

  // Find or create the site account for this email, then sign them in with a one-time link.
  const email = String(who.email).toLowerCase();
  const { error: createErr } = await supabase.auth.admin.createUser({
    email, email_confirm: true, user_metadata: { full_name: who.name || who.preferred_username || '' },
  });
  if (createErr && !/already|registered|exists/i.test(createErr.message)) { console.error(createErr); return back(res, 'error', 'account'); }
  const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink', email, options: { redirectTo: `${site()}${saved.redirect}` },
  });
  if (linkErr || !link?.properties?.action_link) { console.error(linkErr); return back(res, 'error', 'signin-link'); }
  const userId = link.user?.id;
  // Which Whop account came back and which Academy account it was matched to (emails masked).
  const mask = (e) => (e ? String(e).replace(/^(.{2}).*(@.*)$/, '$1***$2') : null);
  console.log('Whop sign-in', {
    whopUser: who.sub, whopEmail: mask(email), idTokenEmail: mask(who.email), academyUser: userId, academyEmail: mask(link.user?.email), plan,
  });
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

// GET /api/whop?action=status: a safe self-check of the Whop settings. Says whether each value is
// set and has the expected shape, and whether Whop accepts the API key for the Academy product.
// Never returns any key, secret or ID.
async function status(req, res) {
  const shape = (k, value, prefix) => {
    const raw = process.env[k] || '';
    return {
      set: !!raw.trim(),
      looksRight: value.startsWith(prefix) && !/\s/.test(value),
      wasCleanedUp: !!raw.trim() && raw.trim() !== value, // the Vercel value had extra text around it
    };
  };
  const out = {
    SITE_URL: { set: !!env('SITE_URL'), value: site() },
    WHOP_CLIENT_ID: shape('WHOP_CLIENT_ID', clientId(), 'app_'),
    WHOP_CLIENT_SECRET: { set: !!clientSecret(), wasCleanedUp: !!env('WHOP_CLIENT_SECRET') && env('WHOP_CLIENT_SECRET') !== clientSecret() },
    WHOP_API_KEY: shape('WHOP_API_KEY', apiKey(), 'apik_'),
    WHOP_ACADEMY_PRODUCT_ID: shape('WHOP_ACADEMY_PRODUCT_ID', productId('WHOP_ACADEMY_PRODUCT_ID'), 'prod_'),
    WHOP_INDICATOR_PRODUCT_ID: env('WHOP_INDICATOR_PRODUCT_ID') ? shape('WHOP_INDICATOR_PRODUCT_ID', productId('WHOP_INDICATOR_PRODUCT_ID'), 'prod_') : { set: false, note: 'optional' },
  };
  // Can the API key see the Academy product? (needs access_pass:basic:read)
  if (apiKey() && productId('WHOP_ACADEMY_PRODUCT_ID')) {
    try {
      const r = await fetch(`${WHOP}/api/v1/products/${encodeURIComponent(productId('WHOP_ACADEMY_PRODUCT_ID'))}`, { headers: { Authorization: `Bearer ${apiKey()}` } });
      out.whopProductLookup = { status: r.status, ok: r.ok };
    } catch (e) {
      out.whopProductLookup = { error: 'request could not be sent' };
    }
  }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(out);
}

export default async function handler(req, res) {
  try {
    const action = req.query.action;
    if (action === 'login' && req.method === 'GET') return await login(req, res);
    if (action === 'callback' && req.method === 'GET') return await callback(req, res);
    if (action === 'check' && req.method === 'POST') return await check(req, res);
    if (action === 'status' && req.method === 'GET') return await status(req, res);
    res.status(404).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('Whop auth error:', err);
    if (req.query.action === 'check') return res.status(200).json({ active: true, unverified: true });
    back(res, 'error', 'unexpected');
  }
}
