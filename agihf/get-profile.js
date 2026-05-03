// api/get-profile.js
// Returns full user profile including GP, level, streak, lessons completed

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: lessons } = await supabase
      .from('lessons_completed')
      .select('lesson_id, gp_earned, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .single();

    const levelNames = {
      1: "She's Brand New",
      2: 'Before the Chart',
      3: 'Reading Structure',
      4: 'Finding Direction',
      5: 'The ICC Method',
      6: 'Pulling the Trigger',
      7: 'The Mindset',
      8: "She's In Structure ✦"
    };

    res.status(200).json({
      profile: {
        ...profile,
        level_name: levelNames[profile?.level || 1],
      },
      lessons_completed: lessons || [],
      lessons_count: lessons?.length || 0,
      subscription: subscription || { status: 'inactive' },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: err.message });
  }
}
