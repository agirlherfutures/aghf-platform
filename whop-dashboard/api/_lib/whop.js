// whop.js — everything specific to talking to Whop: verifying webhook
// signatures, normalizing membership/payment payloads into our own
// schema, and the best-effort REST pull used by "Sync now".
//
// Webhooks (verifyWhopSignature) are the reliable, real-time path and
// follow Whop's public Standard Webhooks signing scheme (headers
// webhook-id/webhook-timestamp/webhook-signature, HMAC-SHA256 of
// "<id>.<timestamp>.<rawBody>"). The signing secret's exact key
// derivation couldn't be hand-verified against a live Whop delivery while
// building this, so verification tries both the documented `whsec_`
// base64-decode derivation and a plain-utf8-secret fallback and accepts
// either — this only hedges against a wrong guess here, it never weakens
// security (an attacker without the real secret can't produce either).
//
// The REST pull (syncAll, for "Sync now") is intentionally defensive for
// the same reason: Whop's API has gone through a few versions, so field
// names are extracted with fallbacks and the raw payload is always kept.
// If it errors, the real error from Whop is surfaced to the caller rather
// than swallowed — see api/sync.js.

import crypto from 'node:crypto';
import { supabase } from './supabase.js';

export const TZ = process.env.DASHBOARD_TIMEZONE || 'America/Chicago';

/* ── webhook signature verification ─────────────────────────────────── */

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

export function verifyWhopSignature({ webhookId, webhookTimestamp, rawBody, signatureHeader, secret }) {
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

/* ── payload normalization ──────────────────────────────────────────── */

// Whop timestamps show up as either unix seconds (number) or an ISO string
// depending on API/webhook version — normalize both to ISO or null.
export function toISO(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return new Date(value * 1000).toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Whop payment amounts are commonly expressed in cents (same convention as
// Stripe); set WHOP_AMOUNT_IN_CENTS=false if your payloads already arrive
// in whole dollars and these numbers look 100x too high.
export function toDollars(value) {
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

export async function upsertMembership(data, { lastEventType } = {}) {
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

export async function insertMemberEvent({ membershipId, eventType, occurredAt, amount, email, whopEventId, raw }) {
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
  // should ever surface as a failure (which would just trigger retries).
  if (error && !/duplicate key/i.test(error.message || '')) throw error;
}

export async function upsertPayment(data) {
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

/* ── dashboard period math (America/Chicago by default) ─────────────── */

function zonedNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), mo: get('month'), d: get('day') };
}

function zonedMidnightUTC(y, mo, d) {
  const approx = new Date(Date.UTC(y, mo - 1, d, 12));
  const tzName = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(approx).find((p) => p.type === 'timeZoneName')?.value || 'GMT-6';
  const offsetHours = Number(tzName.replace('GMT', '')) || -6;
  return new Date(Date.UTC(y, mo - 1, d, -offsetHours));
}

export function periodStarts() {
  const { y, mo, d } = zonedNow();
  const todayStart = zonedMidnightUTC(y, mo, d);
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - todayStart.getUTCDay());
  const monthStart = zonedMidnightUTC(y, mo, 1);
  const last30Start = new Date(todayStart);
  last30Start.setUTCDate(last30Start.getUTCDate() - 29);
  return { todayStart, weekStart, monthStart, last30Start };
}

export async function sumPayments(sinceISO) {
  const { data, error } = await supabase.from('whop_payments').select('amount').eq('status', 'succeeded').gte('paid_at', sinceISO);
  if (error) throw error;
  return (data || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

export async function countEvents(eventTypes, sinceISO) {
  const { count, error } = await supabase.from('whop_member_events').select('id', { count: 'exact', head: true })
    .in('event_type', eventTypes).gte('occurred_at', sinceISO);
  if (error) throw error;
  return count || 0;
}

export function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

/* ── "Sync now" — best-effort backfill/reconciliation pull ──────────── */

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

export async function syncAll() {
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
