// api/sync.js — the "Sync now" button. Best-effort backfill/reconciliation
// pull from Whop's REST API; see api/_lib/whop.js's header comment for why
// this is defensive rather than assumed-correct.

import { requireSession } from './_lib/session.js';
import { supabase } from './_lib/supabase.js';
import { isDbNotSetUp } from './_lib/db-error.js';
import { syncAll } from './_lib/whop.js';

export default async function handler(req, res) {
  if (!requireSession(req, res)) return;
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
    const notSetUp = isDbNotSetUp(err);
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The database tables haven’t been set up yet — run supabase/migrations/0011_whop_business_dashboard.sql against your Supabase project.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
