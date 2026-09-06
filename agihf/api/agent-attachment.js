// api/agent-attachment.js — chart-screenshot storage for the AGHF Agent.
// Mirrors journal-screenshot.js's exact upload/signed-URL/ownership-check
// shape, reusing the SAME private "journal-screenshots" Supabase Storage
// bucket under a new path prefix ({userId}/agent/{conversationId}/...) —
// no second bucket to provision. Only ever a signed URL leaves the
// server; the bucket itself is never public.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
      const { dataUrl, filename, conversationId } = req.body || {};
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
      const path = `${userId}/agent/${conversationId || 'unfiled'}/${Date.now()}-${sanitizeFilename(filename)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: attachment, error: insertError } = await supabase.from('agent_attachments').insert({
        user_id: userId, conversation_id: conversationId || null, type: 'screenshot',
        secure_file_ref: path, metadata: { filename: sanitizeFilename(filename), mimeType, bytes: buffer.length },
      }).select('*').single();
      if (insertError) throw insertError;

      return res.status(200).json({ attachmentId: attachment.id, path, uploadedAt: attachment.created_at });
    }

    if (req.method === 'GET') {
      const { path } = req.query;
      if (!path || !path.startsWith(`${userId}/agent/`)) return res.status(403).json({ error: 'Not your screenshot' });
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (error) throw error;
      return res.status(200).json({ url: data.signedUrl });
    }

    if (req.method === 'DELETE') {
      const path = req.query.path || (req.body && req.body.path);
      if (!path || !path.startsWith(`${userId}/agent/`)) return res.status(403).json({ error: 'Not your screenshot' });
      await supabase.storage.from(BUCKET).remove([path]);
      await supabase.from('agent_attachments').delete().eq('user_id', userId).eq('secure_file_ref', path);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Agent attachment API error:', err);
    const noBucket = /bucket not found/i.test(err.message || '');
    const notSetUp = noBucket || /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: noBucket
        ? 'The screenshot storage bucket hasn’t been created yet — see supabase/migrations/0001_checklist_and_journal.sql.'
        : notSetUp
          ? 'The AGHF Agent database tables haven’t been set up yet — see supabase/migrations/0004_aghf_agent.sql.'
          : err.message,
      setupRequired: notSetUp,
    });
  }
}
