// api/psychology-profile.js — The Inner Edge: consent + tone + current-focus
// profile, one row per member. Same JWT-verification pattern as every
// other endpoint in this project: every query is scoped to the verified
// user.id, so one member's consent settings are never reachable through
// another member's session.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DEFAULT_CONSENT = {
  tradeData: true, checklistAnswers: true, journalStructured: true, journalFreetext: true,
  emotions: true, sessionHistory: true, playbook: true, academyProgress: true,
};

function toClientShape(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    coachingTone: row.coaching_tone,
    personalizationEnabled: row.personalization_enabled,
    consent: row.consent || DEFAULT_CONSENT,
    currentFocus: row.current_focus,
    currentFocusBody: row.current_focus_body,
    currentFocusSource: row.current_focus_source,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const userId = user.id;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('psychology_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (data) return res.status(200).json({ profile: toClientShape(data) });

      // Auto-create a default profile on first visit — a member should
      // never have to explicitly "set up" consent before seeing sensible
      // defaults; she can change any of it immediately in Consent Settings.
      const { data: created, error: insertError } = await supabase
        .from('psychology_profiles')
        .insert({ user_id: userId, consent: DEFAULT_CONSENT })
        .select('*').single();
      if (insertError) throw insertError;
      return res.status(200).json({ profile: toClientShape(created) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId,
        coaching_tone: body.coachingTone || 'gentle',
        personalization_enabled: body.personalizationEnabled !== false,
        consent: body.consent || DEFAULT_CONSENT,
        current_focus: body.currentFocus ?? null,
        current_focus_body: body.currentFocusBody ?? null,
        current_focus_source: body.currentFocusSource ?? null,
        timezone: body.timezone || null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('psychology_profiles').upsert(row, { onConflict: 'user_id' }).select('*').single();
      if (error) throw error;
      return res.status(200).json({ profile: toClientShape(data) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology profile API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The Psychology Coach database tables haven’t been set up yet — see supabase/migrations/0003_psychology_coach.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
