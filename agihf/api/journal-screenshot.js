// api/journal-screenshot.js — chart screenshot storage for the Trade
// Journal. Uses a private Supabase Storage bucket ("journal-screenshots",
// see supabase/migrations/0001_checklist_and_journal.sql for setup) so
// screenshots are never publicly reachable — only short-lived signed URLs
// are ever handed to the client, and every path is prefixed with the
// verified user's id and checked before any read/delete, so one member
// can never reach another member's screenshots even by guessing a path.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

const BUCKET = 'journal-screenshots';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function sanitizeFilename(name) {
  return (name || 'screenshot').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const userId = user.id;

  try {
    if (req.method === 'POST') {
      const { dataUrl, filename, entryId } = req.body || {};
      if (!dataUrl || typeof dataUrl !== 'string') return res.status(400).json({ error: 'Missing image data' });

      const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
      if (!match) return res.status(400).json({ error: 'Expected a base64 data URL' });
      const [, mimeType, base64] = match;
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: `Unsupported image type: ${mimeType}. Use JPEG, PNG, WEBP, or GIF.` });
      }
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({ error: `Image is too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB) — max 5MB.` });
      }

      const ext = mimeType.split('/')[1] || 'jpg';
      const path = `${userId}/${entryId || 'unfiled'}/${Date.now()}-${sanitizeFilename(filename)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET)
        .upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;

      return res.status(200).json({ path, uploadedAt: new Date().toISOString() });
    }

    if (req.method === 'GET') {
      const { path } = req.query;
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (error) throw error;
      return res.status(200).json({ url: data.signedUrl });
    }

    if (req.method === 'DELETE') {
      const path = req.query.path || (req.body && req.body.path);
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Journal screenshot API error:', err);
    const noBucket = /bucket not found/i.test(err.message || '');
    return res.status(noBucket ? 503 : 500).json({
      error: noBucket
        ? 'The screenshot storage bucket hasn’t been created yet — see supabase/migrations/0001_checklist_and_journal.sql.'
        : err.message,
      setupRequired: noBucket,
    });
  }
}
