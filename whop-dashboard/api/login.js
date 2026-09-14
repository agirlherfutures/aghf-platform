import crypto from 'node:crypto';
import { createSessionCookie } from './_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expected = process.env.DASHBOARD_PASSWORD || '';
  if (!expected) return res.status(500).json({ error: 'DASHBOARD_PASSWORD is not set on the server' });

  const { password } = req.body || {};
  const a = Buffer.from(String(password || ''));
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!match) return res.status(401).json({ error: 'Incorrect password' });

  res.setHeader('Set-Cookie', createSessionCookie());
  return res.status(200).json({ success: true });
}
