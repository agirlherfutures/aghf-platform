// api/psychology-scenario-attempts.js — Scenario Lab completion records.
// Insert-only (an attempt is never edited after the fact); same
// JWT-verification pattern as every other endpoint here. Scenario content
// itself lives in agihf/shared/psychology-scenarios-data.js, not a table.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function toClientShape(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    scenarioId: row.scenario_id,
    selectedResponseId: row.selected_response_id,
    writtenReasoning: row.written_reasoning,
    feedbackShown: row.feedback_shown,
    processScore: row.process_score,
    reflection: row.reflection,
    completedAt: row.completed_at,
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
      const { scenarioId, limit } = req.query;
      let query = supabase.from('psychology_scenario_attempts').select('*').eq('user_id', userId);
      if (scenarioId) query = query.eq('scenario_id', scenarioId);
      const { data, error } = await query.order('completed_at', { ascending: false }).limit(Number(limit) || 100);
      if (error) throw error;
      return res.status(200).json({ attempts: (data || []).map(toClientShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId,
        scenario_id: body.scenarioId,
        selected_response_id: body.selectedResponseId || null,
        written_reasoning: body.writtenReasoning || null,
        feedback_shown: body.feedbackShown || null,
        process_score: body.processScore ?? null,
        reflection: body.reflection || null,
      };
      const { data, error } = await supabase.from('psychology_scenario_attempts').insert(row).select('*').single();
      if (error) throw error;
      return res.status(200).json({ attempt: toClientShape(data) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Psychology scenario attempts API error:', err);
    const notSetUp = /relation .* does not exist/i.test(err.message || '');
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The Psychology Coach database tables haven’t been set up yet — see supabase/migrations/0003_psychology_coach.sql.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
