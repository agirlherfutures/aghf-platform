// api/complete-lesson.js
// Marks a lesson complete and awards GP to the user

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });
  const userId = user.id;

  const { lessonId, gpEarned } = req.body;
  if (!lessonId) {
    return res.status(400).json({ error: 'lessonId required' });
  }

  try {
    // Check if already completed
    const { data: existing } = await supabase
      .from('lessons_completed')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (existing) {
      return res.status(200).json({ message: 'Already completed', alreadyDone: true });
    }

    // Record completion
    await supabase.from('lessons_completed').insert({
      user_id: userId,
      lesson_id: lessonId,
      gp_earned: gpEarned || 50,
    });

    // Add GP to profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('gp, day_streak, last_active, level')
      .eq('id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile?.last_active;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastActive === yesterday ? (profile.day_streak || 0) + 1 : lastActive === today ? profile.day_streak : 1;
    const newGP = (profile?.gp || 0) + (gpEarned || 50);

    // Update profile
    await supabase.from('profiles').update({
      gp: newGP,
      day_streak: newStreak,
      last_active: today,
    }).eq('id', userId);

    // Count completed lessons to determine level
    const { count } = await supabase
      .from('lessons_completed')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    let newLevel = 1;
    if (count >= 28) newLevel = 8;
    else if (count >= 22) newLevel = 7;
    else if (count >= 18) newLevel = 6;
    else if (count >= 14) newLevel = 5;
    else if (count >= 10) newLevel = 4;
    else if (count >= 7) newLevel = 3;
    else if (count >= 4) newLevel = 2;

    if (newLevel !== profile?.level) {
      await supabase.from('profiles').update({ level: newLevel }).eq('id', userId);
    }

    res.status(200).json({
      success: true,
      newGP,
      newStreak,
      lessonsCompleted: count,
      level: newLevel,
    });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: err.message });
  }
}
