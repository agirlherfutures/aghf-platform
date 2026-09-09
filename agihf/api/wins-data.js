// api/wins-data.js — every "Share My Win" endpoint (submissions, media
// upload, reactions, admin moderation), consolidated into one Vercel
// serverless function, dispatched on ?resource=, purely to stay under the
// Vercel Hobby plan's 12-serverless-function-per-deployment limit (see
// agent-data.js's header comment for the full story) — this is the 12th
// and last available slot. vercel.json rewrites 4 clean URLs
// (/api/wins-submissions, /api/wins-media, /api/wins-reactions,
// /api/wins-moderation) to this file with a matching ?resource= appended,
// so client code (wins-service.js) never has to know about the dispatch.
//
// Two deliberate visibility rules live here, not in the DB:
// - The public Win Wall read (resource=submissions, scope=public) always
//   forces status IN ('approved','featured') server-side, regardless of
//   any filter the client sends — this is the actual enforcement point
//   for "never show unmoderated content publicly."
// - resource=moderation re-checks profiles.is_admin on every single call
//   — the client-side admin-page redirect is a courtesy, this is the
//   real gate. There is no other admin/role concept anywhere in this app.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const config = { api: { bodyParser: { sizeLimit: '8mb' } } };

function notSetUpError(res, err) {
  const notSetUp = /relation .* does not exist/i.test(err.message || '');
  return res.status(notSetUp ? 503 : 500).json({
    error: notSetUp
      ? 'The Share My Win database tables haven’t been set up yet — see supabase/migrations/0007_share_my_win.sql.'
      : err.message,
    setupRequired: notSetUp,
  });
}

async function isAdmin(userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  return !!data?.is_admin;
}

/* ── shared shape + consent helpers ──────────────────────────────────── */

const DEFAULT_CONSENT = { winWall: false, communityFeature: false, socialMedia: false, websitePromo: false, privateOnly: false };
const PUBLIC_STATUSES = ['approved', 'featured'];

// Fields an ordinary member (owner or public reader) is never handed back —
// admin_notes and improvement_feedback are private by design regardless of
// who is asking, and admin_id is an internal bookkeeping detail.
function submissionShape(row, { includePrivate = false } = {}) {
  if (!row) return null;
  const base = {
    id: row.id, userId: row.user_id,
    primaryCategory: row.primary_category, secondaryCategory: row.secondary_category,
    headline: row.headline, story: row.story,
    whatHelped: row.what_helped || [], favoriteFeature: row.favorite_feature,
    media: row.media || [], videoUrl: row.video_url, sensitiveInfoConfirmed: row.sensitive_info_confirmed,
    rating: row.rating, testimonialText: row.testimonial_text,
    testimonialEditedByAdmin: row.testimonial_edited_by_admin,
    exactPnlOptIn: row.exact_pnl_opt_in, exactPnl: row.exact_pnl_opt_in ? row.exact_pnl : null, outcomeSummary: row.outcome_summary,
    linkedEvalPlanId: row.linked_eval_plan_id, linkedJournalEntryId: row.linked_journal_entry_id, linkedChecklistId: row.linked_checklist_id,
    displayNamePreference: row.display_name_preference, displayNameSnapshot: row.display_name_snapshot, isAnonymous: row.is_anonymous,
    consent: row.consent || DEFAULT_CONSENT, consentUpdatedAt: row.consent_updated_at,
    status: row.status, memberVisibleFeedback: row.member_visible_feedback,
    isVerified: row.is_verified,
    submittedAt: row.submitted_at, approvedAt: row.approved_at, featuredAt: row.featured_at, publishedAt: row.published_at,
    withdrawnAt: row.withdrawn_at, archivedAt: row.archived_at, gpAwardedAt: row.gp_awarded_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
  if (includePrivate) {
    base.testimonialOriginalText = row.testimonial_original_text;
    base.improvementFeedback = row.improvement_feedback;
    base.adminNotes = row.admin_notes;
    base.adminId = row.admin_id;
    base.reviewedAt = row.reviewed_at;
  }
  return base;
}

function resolveDisplayName(preference, profile, userEmail) {
  if (preference === 'anonymous') return 'Anonymous AGHF Member';
  if (preference === 'username') return profile?.full_name ? profile.full_name.split(' ')[0] : (userEmail || '').split('@')[0];
  const full = (profile?.full_name || '').trim();
  if (!full) return preference === 'full_name' ? 'An AGHF Member' : 'An AGHF Member';
  if (preference === 'full_name') return full;
  const parts = full.split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
}

/* ── resource=submissions ────────────────────────────────────────────── */

async function handleSubmissions(req, res, userId) {
  try {
    if (req.method === 'GET') {
      if (req.query.id) {
        const { data, error } = await supabase.from('win_submissions').select('*').eq('id', req.query.id).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Win not found' });
        const owns = data.user_id === userId;
        const isPublic = PUBLIC_STATUSES.includes(data.status);
        const admin = !owns && !isPublic ? await isAdmin(userId) : false;
        if (!owns && !isPublic && !admin) return res.status(404).json({ error: 'Win not found' });
        return res.status(200).json({ win: submissionShape(data, { includePrivate: owns || admin }) });
      }

      if (req.query.scope === 'mine') {
        const { data, error } = await supabase.from('win_submissions').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ wins: (data || []).map((r) => submissionShape(r, { includePrivate: true })) });
      }

      // scope=public — the server, not the client, decides what "public"
      // means: only ever status approved/featured, no exceptions.
      let query = supabase.from('win_submissions').select('*').in('status', PUBLIC_STATUSES);
      if (req.query.category) query = query.or(`primary_category.eq.${req.query.category},secondary_category.eq.${req.query.category}`);
      query = req.query.sort === 'featured'
        ? query.order('featured_at', { ascending: false, nullsFirst: false }).order('approved_at', { ascending: false })
        : query.order('approved_at', { ascending: false });
      const { data, error } = await query.limit(Number(req.query.limit) || 60);
      if (error) throw error;
      return res.status(200).json({ wins: (data || []).map((r) => submissionShape(r)) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // A member can only ever mutate her own draft/submitted/needs_changes
      // rows — anything under active admin control (under_review, approved,
      // featured, rejected, archived, privately_received) is read-only to
      // her from here; withdraw/consent changes go through PATCH instead.
      let existing = null;
      if (body.id) {
        const { data, error } = await supabase.from('win_submissions').select('*').eq('id', body.id).eq('user_id', userId).maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Win not found' });
        if (!['draft', 'submitted', 'needs_changes'].includes(data.status)) {
          return res.status(409).json({ error: 'This win is currently under AGHF review and can’t be edited right now.' });
        }
        existing = data;
      }

      const row = {
        user_id: userId,
        primary_category: body.primaryCategory, secondary_category: body.secondaryCategory || null,
        headline: body.headline || null, story: body.story || null,
        what_helped: Array.isArray(body.whatHelped) ? body.whatHelped : [], favorite_feature: body.favoriteFeature || null,
        media: Array.isArray(body.media) ? body.media : [], video_url: body.videoUrl || null,
        sensitive_info_confirmed: !!body.sensitiveInfoConfirmed,
        rating: body.rating ?? null, testimonial_text: body.testimonialText || null,
        improvement_feedback: body.improvementFeedback || null,
        exact_pnl_opt_in: !!body.exactPnlOptIn, exact_pnl: body.exactPnlOptIn ? (body.exactPnl ?? null) : null,
        outcome_summary: body.outcomeSummary || null,
        linked_eval_plan_id: body.linkedEvalPlanId || null, linked_journal_entry_id: body.linkedJournalEntryId || null,
        linked_checklist_id: body.linkedChecklistId || null,
        display_name_preference: body.displayNamePreference || 'first_name_last_initial',
        is_anonymous: body.displayNamePreference === 'anonymous',
        consent: body.consent || DEFAULT_CONSENT,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existing) {
        // If this win had already been approved/featured once before (a
        // resubmission after withdrawal is impossible — withdraw only ever
        // reaches 'archived' — so in practice this guards a future status
        // change; kept defensive rather than assumed unreachable).
        const { data, error } = await supabase.from('win_submissions').update(row).eq('id', existing.id).select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('win_submissions').insert({ ...row, status: 'draft' }).select('*').single();
        if (error) throw error;
        result = data;
      }

      let gpAwarded = 0;
      if (body.action === 'submit') {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const displayNameSnapshot = resolveDisplayName(row.display_name_preference, profile, authUser?.user?.email);
        const consent = row.consent || DEFAULT_CONSENT;
        const onlyPrivate = consent.privateOnly && !consent.winWall && !consent.communityFeature && !consent.socialMedia && !consent.websitePromo;
        const nextStatus = onlyPrivate ? 'privately_received' : 'submitted';

        const update = {
          status: nextStatus, submitted_at: new Date().toISOString(), display_name_snapshot: displayNameSnapshot,
        };
        if (!result.gp_awarded_at) {
          gpAwarded = 15;
          update.gp_awarded_at = new Date().toISOString();
        }
        const { data, error } = await supabase.from('win_submissions').update(update).eq('id', result.id).select('*').single();
        if (error) throw error;
        result = data;

        if (gpAwarded > 0) {
          const { data: p } = await supabase.from('profiles').select('gp').eq('id', userId).maybeSingle();
          await supabase.from('profiles').update({ gp: (p?.gp || 0) + gpAwarded }).eq('id', userId);
        }
      }

      return res.status(200).json({ win: submissionShape(result, { includePrivate: true }), gpAwarded });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (!body.id) return res.status(400).json({ error: 'Missing id' });
      const { data: existing, error: fetchErr } = await supabase.from('win_submissions').select('*').eq('id', body.id).eq('user_id', userId).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: 'Win not found' });

      if (body.action === 'withdraw') {
        const { data, error } = await supabase.from('win_submissions')
          .update({ status: 'archived', withdrawn_at: new Date().toISOString() }).eq('id', body.id).select('*').single();
        if (error) throw error;
        return res.status(200).json({ win: submissionShape(data, { includePrivate: true }) });
      }

      if (body.consent) {
        const { data, error } = await supabase.from('win_submissions')
          .update({ consent: body.consent, consent_updated_at: new Date().toISOString() }).eq('id', body.id).select('*').single();
        if (error) throw error;
        return res.status(200).json({ win: submissionShape(data, { includePrivate: true }) });
      }

      return res.status(400).json({ error: 'Unknown or missing action' });
    }

    if (req.method === 'DELETE') {
      // Only a true draft (never submitted, no moderation history) can ever
      // be hard-deleted — anything that was actually submitted always
      // archives instead (see the withdraw branch above), never removed.
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { data: existing, error: fetchErr } = await supabase.from('win_submissions').select('id,status').eq('id', id).eq('user_id', userId).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: 'Win not found' });
      if (existing.status !== 'draft') {
        return res.status(409).json({ error: 'Only a draft that hasn’t been submitted yet can be deleted — try Withdraw instead.' });
      }
      const { error } = await supabase.from('win_submissions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Wins submissions API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=media ──────────────────────────────────────────────────── */

const BUCKET = 'win-media';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function sanitizeFilename(name) {
  return (name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

async function handleMedia(req, res, userId) {
  try {
    if (req.method === 'POST') {
      const { dataUrl, filename, winId } = req.body || {};
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
      const path = `${userId}/${winId || 'unfiled'}/${Date.now()}-${sanitizeFilename(filename)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: mimeType, upsert: false });
      if (uploadError) throw uploadError;

      return res.status(200).json({ path, filename: sanitizeFilename(filename), mimeType, bytes: buffer.length, uploadedAt: new Date().toISOString() });
    }

    if (req.method === 'GET') {
      const { path } = req.query;
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your media' });
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (error) throw error;
      return res.status(200).json({ url: data.signedUrl });
    }

    if (req.method === 'DELETE') {
      const path = req.query.path || (req.body && req.body.path);
      if (!path || !path.startsWith(`${userId}/`)) return res.status(403).json({ error: 'Not your media' });
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Wins media API error:', err);
    const noBucket = /bucket not found/i.test(err.message || '');
    return res.status(noBucket ? 503 : 500).json({
      error: noBucket
        ? 'The win-media storage bucket hasn’t been created yet — see supabase/migrations/0007_share_my_win.sql.'
        : err.message,
      setupRequired: noBucket,
    });
  }
}

/* ── resource=reactions ──────────────────────────────────────────────── */

const REACTION_TYPES = ['love_this', 'proud_of_you', 'helped_me', 'inspired', 'same_breakthrough'];

async function assertReactableWin(winId, userId) {
  const { data } = await supabase.from('win_submissions').select('id,user_id,status').eq('id', winId).maybeSingle();
  if (!data) return false;
  if (data.user_id === userId) return true;
  if (PUBLIC_STATUSES.includes(data.status)) return true;
  return await isAdmin(userId);
}

async function handleReactions(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { winId } = req.query;
      if (!winId) return res.status(400).json({ error: 'Missing winId' });
      const { data, error } = await supabase.from('win_reactions').select('reaction_type,user_id').eq('win_id', winId);
      if (error) throw error;
      const counts = {};
      REACTION_TYPES.forEach((t) => { counts[t] = 0; });
      const mine = [];
      (data || []).forEach((r) => {
        counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        if (r.user_id === userId) mine.push(r.reaction_type);
      });
      return res.status(200).json({ counts, mine });
    }

    if (req.method === 'POST') {
      const { winId, reactionType } = req.body || {};
      if (!winId || !REACTION_TYPES.includes(reactionType)) return res.status(400).json({ error: 'Missing or invalid reactionType' });
      if (!(await assertReactableWin(winId, userId))) return res.status(404).json({ error: 'Win not found' });
      const { error } = await supabase.from('win_reactions')
        .upsert({ win_id: winId, user_id: userId, reaction_type: reactionType }, { onConflict: 'win_id,user_id,reaction_type', ignoreDuplicates: true });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const winId = req.query.winId || (req.body && req.body.winId);
      const reactionType = req.query.reactionType || (req.body && req.body.reactionType);
      if (!winId || !reactionType) return res.status(400).json({ error: 'Missing winId or reactionType' });
      const { error } = await supabase.from('win_reactions').delete().eq('win_id', winId).eq('user_id', userId).eq('reaction_type', reactionType);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Wins reactions API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── resource=moderation (admin-gated) ───────────────────────────────── */

async function handleModeration(req, res, userId) {
  if (!(await isAdmin(userId))) return res.status(403).json({ error: 'Not authorized' });

  try {
    if (req.method === 'GET') {
      const statuses = req.query.status ? [req.query.status] : ['submitted', 'under_review'];
      const { data, error } = await supabase.from('win_submissions').select('*').in('status', statuses)
        .order('submitted_at', { ascending: true }).limit(Number(req.query.limit) || 100);
      if (error) throw error;
      return res.status(200).json({ wins: (data || []).map((r) => submissionShape(r, { includePrivate: true })) });
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (!body.id || !body.action) return res.status(400).json({ error: 'Missing id or action' });
      const { data: existing, error: fetchErr } = await supabase.from('win_submissions').select('*').eq('id', body.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: 'Win not found' });

      const now = new Date().toISOString();
      let update = null;

      switch (body.action) {
        case 'start_review':
          update = { status: 'under_review', admin_id: userId, reviewed_at: now };
          break;
        case 'approve':
          update = { status: 'approved', admin_id: userId, approved_at: now };
          if (!existing.published_at) update.published_at = now;
          break;
        case 'request_changes':
          if (!body.memberVisibleFeedback) return res.status(400).json({ error: 'memberVisibleFeedback is required' });
          update = { status: 'needs_changes', admin_id: userId, member_visible_feedback: body.memberVisibleFeedback };
          break;
        case 'reject':
          if (!body.memberVisibleFeedback) return res.status(400).json({ error: 'memberVisibleFeedback is required' });
          update = { status: 'rejected', admin_id: userId, member_visible_feedback: body.memberVisibleFeedback };
          break;
        case 'feature':
          update = { status: 'featured', admin_id: userId, featured_at: now };
          break;
        case 'unfeature':
          update = { status: 'approved', admin_id: userId };
          break;
        case 'verify':
          update = { is_verified: true, admin_id: userId };
          break;
        case 'unverify':
          update = { is_verified: false, admin_id: userId };
          break;
        case 'archive':
          update = { status: 'archived', admin_id: userId, archived_at: now };
          break;
        case 'edit_testimonial_wording': {
          if (!body.newText || body.confirmed !== true) {
            return res.status(400).json({ error: 'newText and confirmed:true are required to edit testimonial wording' });
          }
          update = { testimonial_text: body.newText, testimonial_edited_by_admin: true, admin_id: userId };
          if (!existing.testimonial_original_text) update.testimonial_original_text = existing.testimonial_text;
          break;
        }
        case 'add_note': {
          if (!body.text) return res.status(400).json({ error: 'Missing note text' });
          const stamp = `[${now}] ${body.text}`;
          update = { admin_notes: existing.admin_notes ? `${existing.admin_notes}\n${stamp}` : stamp, admin_id: userId };
          break;
        }
        default:
          return res.status(400).json({ error: `Unknown moderation action: ${body.action}` });
      }

      update.updated_at = now;
      const { data, error } = await supabase.from('win_submissions').update(update).eq('id', body.id).select('*').single();
      if (error) throw error;
      return res.status(200).json({ win: submissionShape(data, { includePrivate: true }) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Wins moderation API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── dispatch ─────────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  submissions: handleSubmissions,
  media: handleMedia,
  reactions: handleReactions,
  moderation: handleModeration,
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const resourceHandler = RESOURCE_HANDLERS[req.query.resource];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });
  return resourceHandler(req, res, user.id);
}
