// api/billing-data.js — every payment/membership webhook AND the new
// Whop-backed Business Dashboard, consolidated into one Vercel serverless
// function, dispatched on ?resource=, purely to stay under the Vercel
// Hobby plan's 12-serverless-function-per-deployment limit (see
// wins-data.js's own header comment for the full story — this project was
// already sitting at exactly 12 files, so this feature replaces
// api/webhook.js in place rather than adding a 13th). vercel.json rewrites
// keep the original public webhook URL (/api/webhook) working unchanged —
// Stripe's dashboard never needs to be touched — and adds three new clean
// URLs (/api/whop-webhook, /api/business-dashboard, /api/business-sync)
// that all resolve here.
//
// bodyParser is OFF for the whole file (see `config` at the bottom)
// because both webhook resources must verify a signature over the exact
// raw request bytes. resource=dashboard/sync never read req.body, so this
// costs them nothing.
//
// resource=whop-webhook verifies Whop's "Standard Webhooks" signature
// (docs.whop.com/developer/guides/webhooks): headers webhook-id/
// webhook-timestamp/webhook-signature, HMAC-SHA256 of
// "<id>.<timestamp>.<rawBody>". Whop's public docs describe the signing
// secret as a `whsec_`-prefixed, base64-encoded key (the same convention
// the open "Standard Webhooks" spec uses) — but since this integration
// couldn't be hand-verified against a live Whop webhook while building it,
// verification tries BOTH the spec's "strip whsec_, base64-decode" key
// derivation and a plain-utf8-secret fallback, and accepts either. This
// never weakens security (an attacker without the real secret can't
// produce either variant) — it only hedges against this file's own
// possible misreading of exactly how WHOP_WEBHOOK_SECRET should be used.
// If your webhook keeps 401ing, use Whop's dashboard "send test event" and
// compare against docs.whop.com/developer/guides/webhooks.
//
// resource=dashboard/sync re-check profiles.is_admin on every single call
// — same real enforcement point as every other admin resource in this
// project (see wins-data.js's own comment on this).

import crypto from 'node:crypto';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { isDbNotSetUp } from './_lib/db-error.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const TZ = 'America/Chicago';

function notSetUpError(res, err) {
  const notSetUp = isDbNotSetUp(err);
  return res.status(notSetUp ? 503 : 500).json({
    error: notSetUp
      ? 'The Business Dashboard tables haven’t been set up yet — see supabase/migrations/0011_whop_business_dashboard.sql. If you just ran this migration, Supabase’s API can take a minute to notice — reloading usually fixes it, or reload the schema cache manually under Project Settings → API.'
      : err.message,
    setupRequired: notSetUp,
  });
}

async function isAdmin(userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  return !!data?.is_admin;
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

/* ── resource=stripe-webhook (unchanged from the original api/webhook.js) ── */

async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const session = event.data.object;
  const userId = session.metadata?.supabase_user_id;

  switch (event.type) {
    case 'checkout.session.completed': {
      if (!userId) break;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });
      break;
    }
    case 'invoice.payment_succeeded': {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const uid = sub.metadata?.supabase_user_id || userId;
      if (!uid) break;
      await supabase.from('subscriptions').update({
        status: 'active',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('stripe_subscription_id', session.subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('stripe_subscription_id', session.id);
      break;
    }
  }

  res.status(200).json({ received: true });
}

/* ── resource=whop-webhook ────────────────────────────────────────────── */

function timingSafeEqualB64(a, b) {
  try {
    const bufA = Buffer.from(a, 'base64');
    const bufB = Buffer.from(b, 'base64');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function verifyWhopSignature({ webhookId, webhookTimestamp, rawBody, signatureHeader, secret }) {
  if (!webhookId || !webhookTimestamp || !signatureHeader || !secret) return false;

  // Reject stale/future deliveries — Standard Webhooks' own 5-minute
  // tolerance, guards against replay of a captured request.
  const ts = Number(webhookTimestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 5 * 60) return false;

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  const candidateKeys = [];
  if (secret.startsWith('whsec_')) {
    try { candidateKeys.push(Buffer.from(secret.slice(7), 'base64')); } catch { /* fall through to raw below */ }
  }
  candidateKeys.push(Buffer.from(secret, 'utf8'));

  const computed = candidateKeys.map((key) => crypto.createHmac('sha256', key).update(signedContent).digest('base64'));

  // webhook-signature is space-separated "v1,<base64sig>" entries.
  const provided = signatureHeader.split(' ').map((part) => part.split(',')[1]).filter(Boolean);
  return provided.some((sig) => computed.some((c) => timingSafeEqualB64(sig, c)));
}

// Whop timestamps show up as either unix seconds (number) or an ISO string
// depending on API/webhook version — normalize both to ISO or null.
function toISO(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return new Date(value * 1000).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Whop payment amounts are commonly expressed in cents (same convention as
// Stripe); set WHOP_AMOUNT_IN_CENTS=false if your payloads already arrive
// in whole dollars and these numbers look 100x too high.
function toDollars(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return process.env.WHOP_AMOUNT_IN_CENTS === 'false' ? n : n / 100;
}

function extractMembership(data) {
  return {
    id: data.id || data.membership_id,
    whop_user_id: data.user_id || data.user?.id || null,
    email: data.email || data.user?.email || null,
    username: data.username || data.user?.username || null,
    product_id: data.product_id || data.product?.id || null,
    product_name: data.product?.title || data.product?.name || null,
    plan_id: data.plan_id || data.plan?.id || null,
    status: data.status || null,
    valid: typeof data.valid === 'boolean' ? data.valid : ['active', 'trialing', 'completed'].includes(data.status),
    renewal_period_start: toISO(data.renewal_period_start),
    renewal_period_end: toISO(data.renewal_period_end),
    joined_at: toISO(data.created_at) || toISO(data.joined_at),
    raw: data,
  };
}

async function upsertMembership(data, { lastEventType } = {}) {
  const m = extractMembership(data);
  if (!m.id) return null;
  const { data: existing } = await supabase.from('whop_members').select('id,valid').eq('id', m.id).maybeSingle();
  const { error } = await supabase.from('whop_members').upsert({
    ...m,
    last_event_type: lastEventType || null,
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
  return { existed: !!existing, wasValid: !!existing?.valid };
}

async function insertMemberEvent({ membershipId, eventType, occurredAt, amount, email, whopEventId, raw }) {
  const { error } = await supabase.from('whop_member_events').insert({
    membership_id: membershipId || null,
    event_type: eventType,
    occurred_at: occurredAt || new Date().toISOString(),
    amount: amount ?? null,
    email: email || null,
    whop_event_id: whopEventId || null,
    raw: raw || null,
  });
  // A duplicate delivery of the same webhook-id is expected and harmless —
  // the unique index on whop_event_id makes it a no-op, not an error we
  // should ever surface as a 500 to Whop (which would just trigger retries).
  if (error && !/duplicate key/i.test(error.message || '')) throw error;
}

async function upsertPayment(data) {
  const id = data.id || data.payment_id;
  if (!id) return;
  const amount = toDollars(data.final_amount ?? data.amount_after_fees ?? data.amount ?? data.subtotal);
  const { error } = await supabase.from('whop_payments').upsert({
    id,
    membership_id: data.membership_id || data.membership?.id || null,
    whop_user_id: data.user_id || data.user?.id || null,
    email: data.email || data.user?.email || null,
    amount,
    currency: data.currency || 'usd',
    status: data.status || 'succeeded',
    product_id: data.product_id || data.product?.id || null,
    plan_id: data.plan_id || data.plan?.id || null,
    paid_at: toISO(data.paid_at) || toISO(data.created_at) || new Date().toISOString(),
    raw: data,
  }, { onConflict: 'id' });
  if (error) throw error;
  return amount;
}

// 'membership.went_valid' / 'membership.activated' are handled separately
// above (joined/renewed/reactivated is resolved dynamically from prior
// state) — every other "membership no longer active" event name maps here.
const MEMBERSHIP_EVENT_MAP = {
  'membership.went_invalid': 'cancelled',
  'membership.cancelled': 'cancelled',
  'membership.canceled': 'cancelled',
  'membership.expired': 'expired',
};

async function handleWhopWebhook(req, res) {
  const rawBody = await getRawBody(req);
  const webhookId = req.headers['webhook-id'];
  const webhookTimestamp = req.headers['webhook-timestamp'];
  const signatureHeader = req.headers['webhook-signature'];

  const verified = verifyWhopSignature({
    webhookId, webhookTimestamp, rawBody, signatureHeader,
    secret: process.env.WHOP_WEBHOOK_SECRET,
  });
  if (!verified) {
    console.error('Whop webhook signature verification failed');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const eventType = body.action || body.type || body.event;
  const data = body.data || body.object || body;

  try {
    if (eventType === 'membership.went_valid' || eventType === 'membership.activated') {
      const result = await upsertMembership(data, { lastEventType: eventType });
      const kind = !result?.existed ? 'joined' : (result.wasValid ? 'renewed' : 'reactivated');
      await insertMemberEvent({
        membershipId: data.id, eventType: kind, occurredAt: toISO(data.created_at) || new Date().toISOString(),
        email: data.email || data.user?.email, whopEventId: webhookId, raw: body,
      });
    } else if (MEMBERSHIP_EVENT_MAP[eventType]) {
      const kind = MEMBERSHIP_EVENT_MAP[eventType];
      await supabase.from('whop_members').update({
        valid: false, status: data.status || kind,
        cancelled_at: kind === 'cancelled' ? new Date().toISOString() : undefined,
        expires_at: kind === 'expired' ? new Date().toISOString() : undefined,
        last_event_type: eventType, updated_at: new Date().toISOString(),
      }).eq('id', data.id || data.membership_id);
      await insertMemberEvent({
        membershipId: data.id || data.membership_id, eventType: kind, occurredAt: new Date().toISOString(),
        email: data.email || data.user?.email, whopEventId: webhookId, raw: body,
      });
    } else if (eventType === 'payment.succeeded') {
      const amount = await upsertPayment(data);
      await insertMemberEvent({
        membershipId: data.membership_id || data.membership?.id, eventType: 'payment_succeeded',
        occurredAt: toISO(data.paid_at) || toISO(data.created_at) || new Date().toISOString(),
        amount, email: data.email || data.user?.email, whopEventId: webhookId, raw: body,
      });
    } else if (eventType === 'payment.failed') {
      await insertMemberEvent({
        membershipId: data.membership_id || data.membership?.id, eventType: 'payment_failed',
        occurredAt: new Date().toISOString(), email: data.email || data.user?.email,
        whopEventId: webhookId, raw: body,
      });
    }
    // Any other event type is accepted (200) but ignored — new/unknown
    // Whop event types must never cause Whop to see a failure and disable
    // the webhook or keep retrying.
  } catch (err) {
    console.error('Whop webhook handling error:', err);
    return notSetUpError(res, err);
  }

  return res.status(200).json({ received: true });
}

/* ── resource=dashboard (admin-gated read) ───────────────────────────── */

// Boundaries computed in America/Chicago so "today"/"this week"/"this
// month" match what the site owner actually means, not a UTC day.
function zonedNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), mo: get('month'), d: get('day') };
}

function zonedMidnightUTC(y, mo, d) {
  // America/Chicago is always UTC-5 or UTC-6; asking the Intl API what
  // offset applies "around" that date and applying it keeps this correct
  // across the DST boundary without a timezone library dependency.
  const approx = new Date(Date.UTC(y, mo - 1, d, 12));
  const tzName = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(approx).find((p) => p.type === 'timeZoneName')?.value || 'GMT-6';
  const offsetHours = Number(tzName.replace('GMT', '')) || -6;
  return new Date(Date.UTC(y, mo - 1, d, -offsetHours));
}

function periodStarts() {
  const { y, mo, d } = zonedNow();
  const todayStart = zonedMidnightUTC(y, mo, d);
  const weekStart = new Date(todayStart);
  const dow = new Date(todayStart).getUTCDay(); // 0=Sun
  weekStart.setUTCDate(weekStart.getUTCDate() - dow);
  const monthStart = zonedMidnightUTC(y, mo, 1);
  const last30Start = new Date(todayStart);
  last30Start.setUTCDate(last30Start.getUTCDate() - 29);
  return { todayStart, weekStart, monthStart, last30Start };
}

async function sumPayments(sinceISO) {
  const { data, error } = await supabase.from('whop_payments').select('amount').eq('status', 'succeeded').gte('paid_at', sinceISO);
  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

async function countEvents(eventTypes, sinceISO) {
  const { count, error } = await supabase.from('whop_member_events').select('id', { count: 'exact', head: true })
    .in('event_type', eventTypes).gte('occurred_at', sinceISO);
  if (error) throw error;
  return count || 0;
}

async function handleDashboard(req, res, userId) {
  if (!(await isAdmin(userId))) return res.status(403).json({ error: 'Not authorized' });

  try {
    const { todayStart, weekStart, monthStart, last30Start } = periodStarts();

    const [activeCount, revenueToday, revenueWeek, revenueMonth, revenueLast30,
      newThisWeek, churnedThisWeek, newThisMonth, churnedThisMonth] = await Promise.all([
      supabase.from('whop_members').select('id', { count: 'exact', head: true }).eq('valid', true).then((r) => { if (r.error) throw r.error; return r.count || 0; }),
      sumPayments(todayStart.toISOString()),
      sumPayments(weekStart.toISOString()),
      sumPayments(monthStart.toISOString()),
      sumPayments(last30Start.toISOString()),
      countEvents(['joined', 'reactivated'], weekStart.toISOString()),
      countEvents(['cancelled', 'expired'], weekStart.toISOString()),
      countEvents(['joined', 'reactivated'], monthStart.toISOString()),
      countEvents(['cancelled', 'expired'], monthStart.toISOString()),
    ]);

    const { data: dailyRows, error: dailyErr } = await supabase.from('whop_payments')
      .select('amount,paid_at').eq('status', 'succeeded').gte('paid_at', last30Start.toISOString());
    if (dailyErr) throw dailyErr;
    const dailyMap = {};
    (dailyRows || []).forEach((r) => {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(r.paid_at)); // YYYY-MM-DD
      dailyMap[day] = (dailyMap[day] || 0) + (Number(r.amount) || 0);
    });
    const dailyRevenue = [];
    for (let i = 0; i < 30; i++) {
      const dt = new Date(last30Start);
      dt.setUTCDate(dt.getUTCDate() + i);
      const key = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(dt);
      dailyRevenue.push({ date: key, amount: Math.round((dailyMap[key] || 0) * 100) / 100 });
    }

    const { data: recentEvents, error: eventsErr } = await supabase.from('whop_member_events')
      .select('id,membership_id,event_type,occurred_at,amount,email').order('occurred_at', { ascending: false }).limit(40);
    if (eventsErr) throw eventsErr;

    const { data: syncState } = await supabase.from('whop_sync_state').select('*').eq('id', true).maybeSingle();

    return res.status(200).json({
      activeMembers: activeCount,
      revenue: {
        today: round2(revenueToday), thisWeek: round2(revenueWeek), thisMonth: round2(revenueMonth),
        estMonthlyRunRate: round2(revenueLast30), // trailing-30-day run rate, not a true subscription MRR (see README note)
      },
      members: {
        newThisWeek, churnedThisWeek, newThisMonth, churnedThisMonth,
        netThisWeek: newThisWeek - churnedThisWeek, netThisMonth: newThisMonth - churnedThisMonth,
      },
      dailyRevenue,
      recentEvents: recentEvents || [],
      lastSync: syncState || null,
    });
  } catch (err) {
    console.error('Business dashboard error:', err);
    return notSetUpError(res, err);
  }
}

function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

/* ── resource=sync (admin-gated, best-effort pull from the Whop REST API for
   backfill/reconciliation — see the header comment: this is intentionally
   defensive, since the exact current Whop API surface couldn't be verified
   live while building this. Webhooks, not this, are the reliable
   real-time source going forward.) ─────────────────────────────────────── */

async function whopFetch(path) {
  const res = await fetch(`https://api.whop.com/api/v2${path}`, {
    headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Whop API ${path} returned ${res.status}: ${json?.error || json?.message || res.statusText}`);
  }
  return json;
}

async function syncAll() {
  if (!process.env.WHOP_API_KEY) throw new Error('WHOP_API_KEY is not set');
  const companyId = process.env.WHOP_COMPANY_ID;
  const qs = companyId ? `company_id=${encodeURIComponent(companyId)}&` : '';

  let membersCount = 0;
  let page = 1;
  for (;;) {
    const json = await whopFetch(`/memberships?${qs}page=${page}&per=100`);
    const rows = json.data || json.memberships || (Array.isArray(json) ? json : []);
    if (!rows.length) break;
    for (const row of rows) {
      const { existed } = (await upsertMembership(row, { lastEventType: 'sync' })) || {};
      membersCount++;
      // Only synthesize a 'joined' event for a membership we're seeing for
      // the very first time via sync — never for one already tracked by a
      // real webhook event, so backfill can't fabricate duplicate history.
      if (!existed) {
        const alreadyLogged = await supabase.from('whop_member_events').select('id').eq('membership_id', row.id).limit(1);
        if (!alreadyLogged.data?.length) {
          await insertMemberEvent({
            membershipId: row.id, eventType: 'joined', occurredAt: toISO(row.created_at) || new Date().toISOString(),
            email: row.email || row.user?.email, raw: row,
          });
        }
      }
    }
    const hasNext = json.pagination?.next_page || (rows.length === 100);
    if (!hasNext) break;
    page++;
    if (page > 50) break; // hard safety cap
  }

  let paymentsCount = 0;
  page = 1;
  for (;;) {
    const json = await whopFetch(`/payments?${qs}status=succeeded&page=${page}&per=100`);
    const rows = json.data || json.payments || (Array.isArray(json) ? json : []);
    if (!rows.length) break;
    for (const row of rows) {
      await upsertPayment(row);
      paymentsCount++;
    }
    const hasNext = json.pagination?.next_page || (rows.length === 100);
    if (!hasNext) break;
    page++;
    if (page > 50) break;
  }

  return { membersCount, paymentsCount };
}

async function handleSync(req, res, userId) {
  if (!(await isAdmin(userId))) return res.status(403).json({ error: 'Not authorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { membersCount, paymentsCount } = await syncAll();
    await supabase.from('whop_sync_state').upsert({
      id: true, last_synced_at: new Date().toISOString(), last_sync_status: 'success',
      last_sync_error: null, last_sync_members_count: membersCount, last_sync_payments_count: paymentsCount,
      updated_at: new Date().toISOString(),
    });
    return res.status(200).json({ success: true, membersCount, paymentsCount });
  } catch (err) {
    console.error('Whop sync error:', err);
    await supabase.from('whop_sync_state').upsert({
      id: true, last_synced_at: new Date().toISOString(), last_sync_status: 'error',
      last_sync_error: err.message, updated_at: new Date().toISOString(),
    });
    return notSetUpError(res, err);
  }
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

async function requireAdminUser(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) { res.status(401).json({ error: 'Missing bearer token' }); return null; }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) { res.status(401).json({ error: 'Invalid or expired token' }); return null; }
  return user.id;
}

export default async function handler(req, res) {
  const resource = req.query.resource;

  if (resource === 'whop-webhook') return handleWhopWebhook(req, res);
  if (resource === 'stripe-webhook' || !resource) return handleStripeWebhook(req, res);

  if (resource === 'dashboard') {
    const userId = await requireAdminUser(req, res);
    if (!userId) return;
    return handleDashboard(req, res, userId);
  }

  if (resource === 'sync') {
    const userId = await requireAdminUser(req, res);
    if (!userId) return;
    return handleSync(req, res, userId);
  }

  return res.status(400).json({ error: `Unknown resource: ${resource}` });
}

export const config = { api: { bodyParser: false } };
