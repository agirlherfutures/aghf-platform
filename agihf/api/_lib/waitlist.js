// api/_lib/waitlist.js
// Public handler behind waitlist.html: adds one person to the launch waitlist.
// No auth (she isn't a member yet). Writes with the service key; the table has
// RLS on with no policies (supabase/migrations/0013_waitlist.sql).
// Lives in _lib (not a deployed function) and is served through eval-data.js's
// public route, because the Vercel Hobby plan caps a deployment at 12 functions.
// vercel.json rewrites /api/join-waitlist to /api/eval-data?resource=waitlist.

import { isDbNotSetUp } from './db-error.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const JOURNEY = ['brand-new', 'curious', 'a-few-trades', 'trading'];
const HEARD = ['tiktok', 'instagram', 'youtube', 'friend', 'other'];
const clean = (v, max) => String(v ?? '').trim().slice(0, max);

export async function handleWaitlist(req, res, supabase) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  // Honeypot: real people never see or fill this field. Pretend it worked.
  if (body.website) return res.status(200).json({ ok: true });

  const email = clean(body.email, 254).toLowerCase();
  const firstName = clean(body.firstName, 60);
  if (!firstName) return res.status(400).json({ error: 'Please add your first name.' });
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'That email doesn’t look quite right.' });

  const row = {
    email,
    first_name: firstName,
    journey: JOURNEY.includes(body.journey) ? body.journey : null,
    heard_from: HEARD.includes(body.heardFrom) ? body.heardFrom : null,
    source: clean(body.source, 40).toLowerCase() || null,
  };

  const { error } = await supabase.from('waitlist').insert(row);
  if (!error) return res.status(200).json({ ok: true, already: false });
  // Unique email: she's already on the list. That's a success, not an error.
  if (error.code === '23505') return res.status(200).json({ ok: true, already: true });
  if (isDbNotSetUp(error)) {
    console.error('join-waitlist: run supabase/migrations/0013_waitlist.sql', error.message);
    return res.status(503).json({ error: 'The waitlist is almost ready. Please try again soon.' });
  }
  console.error('join-waitlist', error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
