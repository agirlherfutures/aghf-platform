// api/psychology-data.js — every Inner Edge / Psychology Coach CRUD
// endpoint not already folded elsewhere. Consolidated into one Vercel
// serverless function, dispatched on ?resource=, purely to stay under
// the Vercel Hobby plan's 12-serverless-function-per-deployment limit
// (see agent-data.js's header comment for the full story). vercel.json
// rewrites each of the 4 old URLs (/api/psychology-profile,
// /api/psychology-sessions, /api/psychology-playbook,
// /api/psychology-scenario-attempts) to this file with a matching
// ?resource= appended, so no client code changes — psychology-service.js
// still fetches the exact same old paths.
//
// Each resource keeps its own JWT-verification + method-branch logic
// exactly as it lived in its original file (psychology-profile.js,
// psychology-sessions.js, psychology-playbook.js,
// psychology-scenario-attempts.js — all deleted, this supersedes them);
// only the dispatch and the shared Supabase client construction are new.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function notSetUpError(res, err) {
  const notSetUp = /relation .* does not exist/i.test(err.message || '');
  return res.status(notSetUp ? 503 : 500).json({
    error: notSetUp
      ? 'The Psychology Coach database tables haven’t been set up yet — see supabase/migrations/0003_psychology_coach.sql.'
      : err.message,
    setupRequired: notSetUp,
  });
}

/* ── profile ──────────────────────────────────────────────────────── */

const DEFAULT_CONSENT = {
  tradeData: true, checklistAnswers: true, journalStructured: true, journalFreetext: true,
  emotions: true, sessionHistory: true, playbook: true, academyProgress: true,
};

function profileShape(row) {
  if (!row) return null;
  return {
    userId: row.user_id, coachingTone: row.coaching_tone, personalizationEnabled: row.personalization_enabled,
    consent: row.consent || DEFAULT_CONSENT, currentFocus: row.current_focus, currentFocusBody: row.current_focus_body,
    currentFocusSource: row.current_focus_source, timezone: row.timezone, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function handleProfile(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('psychology_profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      if (data) return res.status(200).json({ profile: profileShape(data) });

      // Auto-create a default profile on first visit — a member should
      // never have to explicitly "set up" consent before seeing sensible
      // defaults; she can change any of it immediately in Consent Settings.
      const { data: created, error: insertError } = await supabase
        .from('psychology_profiles').insert({ user_id: userId, consent: DEFAULT_CONSENT }).select('*').single();
      if (insertError) throw insertError;
      return res.status(200).json({ profile: profileShape(created) });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId, coaching_tone: body.coachingTone || 'gentle',
        personalization_enabled: body.personalizationEnabled !== false, consent: body.consent || DEFAULT_CONSENT,
        current_focus: body.currentFocus ?? null, current_focus_body: body.currentFocusBody ?? null,
        current_focus_source: body.currentFocusSource ?? null, timezone: body.timezone || null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('psychology_profiles').upsert(row, { onConflict: 'user_id' }).select('*').single();
      if (error) throw error;
      return res.status(200).json({ profile: profileShape(data) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology profile API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── sessions ─────────────────────────────────────────────────────── */

function sessionShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, mode: row.mode, status: row.status, savePreference: row.save_preference,
    triggerCategory: row.trigger_category, linkedTradeId: row.linked_trade_id, linkedChecklistId: row.linked_checklist_id,
    structuredResponses: row.structured_responses || {}, readinessResult: row.readiness_result,
    rulesTriggered: row.rules_triggered || [], recommendedAction: row.recommended_action,
    memberSelectedAction: row.member_selected_action, memberFeedback: row.member_feedback,
    createdAt: row.created_at, updatedAt: row.updated_at, completedAt: row.completed_at,
  };
}

async function handleSessions(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { id, mode, limit } = req.query;
      if (id) {
        const { data, error } = await supabase.from('psychology_sessions').select('*').eq('user_id', userId).eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json({ session: sessionShape(data) });
      }
      let query = supabase.from('psychology_sessions').select('*').eq('user_id', userId);
      if (mode) query = query.eq('mode', mode);
      const { data, error } = await query.order('created_at', { ascending: false }).limit(Number(limit) || 50);
      if (error) throw error;
      return res.status(200).json({ sessions: (data || []).map(sessionShape) });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId, mode: body.mode, status: body.status || 'completed', save_preference: body.savePreference || 'save',
        trigger_category: body.triggerCategory || null, linked_trade_id: body.linkedTradeId || null,
        linked_checklist_id: body.linkedChecklistId || null, structured_responses: body.structuredResponses || {},
        readiness_result: body.readinessResult || null, rules_triggered: Array.isArray(body.rulesTriggered) ? body.rulesTriggered : [],
        recommended_action: body.recommendedAction || null, member_selected_action: body.memberSelectedAction || null,
        member_feedback: body.memberFeedback || null, updated_at: new Date().toISOString(),
        completed_at: (body.status || 'completed') === 'completed' ? new Date().toISOString() : null,
      };

      let result;
      if (body.id) {
        const { data, error } = await supabase.from('psychology_sessions').update(row).eq('id', body.id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('psychology_sessions').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }

      if (row.save_preference === 'one_time') {
        const shaped = sessionShape(result);
        await supabase.from('psychology_sessions').delete().eq('id', result.id).eq('user_id', userId);
        return res.status(200).json({ session: shaped });
      }
      return res.status(200).json({ session: sessionShape(result) });
    }
    if (req.method === 'DELETE') {
      if (req.query.all === 'true') {
        await supabase.from('psychology_sessions').delete().eq('user_id', userId);
        await supabase.from('psychology_patterns').delete().eq('user_id', userId);
        return res.status(200).json({ success: true });
      }
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('psychology_sessions').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology sessions API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── playbook ─────────────────────────────────────────────────────── */

function playbookShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, category: row.category, title: row.title, content: row.content,
    sourceType: row.source_type, sourceRecordId: row.source_record_id, pinned: row.pinned,
    aiAccessPermission: row.ai_access_permission, isArchived: row.is_archived, sortOrder: row.sort_order,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function handlePlaybook(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('psychology_playbook_items').select('*').eq('user_id', userId)
        .order('pinned', { ascending: false }).order('sort_order', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ items: (data || []).map(playbookShape) });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId, category: body.category, title: body.title || '', content: body.content || '',
        source_type: body.sourceType || 'manual', source_record_id: body.sourceRecordId || null, pinned: !!body.pinned,
        ai_access_permission: body.aiAccessPermission !== false, is_archived: !!body.isArchived,
        sort_order: body.sortOrder ?? 0, updated_at: new Date().toISOString(),
      };
      let result;
      if (body.id) {
        const { data, error } = await supabase.from('psychology_playbook_items').update(row).eq('id', body.id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase.from('psychology_playbook_items').insert(row).select('*').single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ item: playbookShape(result) });
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('psychology_playbook_items').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology playbook API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── scenario attempts ───────────────────────────────────────────────
 * Insert-only (an attempt is never edited after the fact). Scenario
 * content itself lives in agihf/shared/psychology-scenarios-data.js,
 * not a table.
 */

function attemptShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, scenarioId: row.scenario_id, selectedResponseId: row.selected_response_id,
    writtenReasoning: row.written_reasoning, feedbackShown: row.feedback_shown, processScore: row.process_score,
    reflection: row.reflection, completedAt: row.completed_at,
  };
}

async function handleScenarioAttempts(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { scenarioId, limit } = req.query;
      let query = supabase.from('psychology_scenario_attempts').select('*').eq('user_id', userId);
      if (scenarioId) query = query.eq('scenario_id', scenarioId);
      const { data, error } = await query.order('completed_at', { ascending: false }).limit(Number(limit) || 100);
      if (error) throw error;
      return res.status(200).json({ attempts: (data || []).map(attemptShape) });
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId, scenario_id: body.scenarioId, selected_response_id: body.selectedResponseId || null,
        written_reasoning: body.writtenReasoning || null, feedback_shown: body.feedbackShown || null,
        process_score: body.processScore ?? null, reflection: body.reflection || null,
      };
      const { data, error } = await supabase.from('psychology_scenario_attempts').insert(row).select('*').single();
      if (error) throw error;
      return res.status(200).json({ attempt: attemptShape(data) });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology scenario attempts API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── dispatch ─────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  profile: handleProfile,
  sessions: handleSessions,
  playbook: handlePlaybook,
  'scenario-attempts': handleScenarioAttempts,
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
