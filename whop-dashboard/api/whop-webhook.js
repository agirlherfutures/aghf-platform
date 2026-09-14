// api/whop-webhook.js — receives every Whop membership/payment event in
// real time. This is the primary data source for the whole dashboard;
// see api/_lib/whop.js's header comment for how signature verification
// and payload field extraction work.

import { isDbNotSetUp } from './_lib/db-error.js';
import { supabase } from './_lib/supabase.js';
import {
  verifyWhopSignature, toISO, upsertMembership, insertMemberEvent, upsertPayment,
} from './_lib/whop.js';

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// 'membership.went_valid' / 'membership.activated' are handled separately
// below (joined/renewed/reactivated is resolved dynamically from prior
// state) — every other "membership no longer active" event name maps here.
const MEMBERSHIP_EVENT_MAP = {
  'membership.went_invalid': 'cancelled',
  'membership.cancelled': 'cancelled',
  'membership.canceled': 'cancelled',
  'membership.expired': 'expired',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
    const notSetUp = isDbNotSetUp(err);
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The database tables haven’t been set up yet — see supabase/migrations/0011_whop_business_dashboard.sql'
        : err.message,
    });
  }

  return res.status(200).json({ received: true });
}

export const config = { api: { bodyParser: false } };
