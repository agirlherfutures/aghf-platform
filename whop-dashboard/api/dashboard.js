// api/dashboard.js — the numbers the page renders. Gated by the single
// password session cookie (api/_lib/session.js), not a Supabase user.

import { requireSession } from './_lib/session.js';
import { supabase } from './_lib/supabase.js';
import { isDbNotSetUp } from './_lib/db-error.js';
import { TZ, periodStarts, sumPayments, countEvents, round2 } from './_lib/whop.js';

export default async function handler(req, res) {
  if (!requireSession(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { todayStart, weekStart, monthStart, last30Start } = periodStarts();

    const [activeCount, revenueToday, revenueWeek, revenueMonth, revenueLast30,
      newThisWeek, churnedThisWeek, newThisMonth, churnedThisMonth] = await Promise.all([
      supabase.from('whop_members').select('id', { count: 'exact', head: true }).eq('valid', true).then((r) => { if (r.error) throw r.error; return r.count || 0; }),
      sumPayments(todayStart.toISOString()),
      sumPayments(weekStart.toISOString()),
      sumPayments(monthStart.toISOString()),
      sumPayments(last30Start.toISOString()),
      countEvents(['joined', 'reactivated'], weekStart.toISOString()),
      countEvents(['cancelled', 'expired'], weekStart.toISOString()),
      countEvents(['joined', 'reactivated'], monthStart.toISOString()),
      countEvents(['cancelled', 'expired'], monthStart.toISOString()),
    ]);

    const { data: dailyRows, error: dailyErr } = await supabase.from('whop_payments')
      .select('amount,paid_at').eq('status', 'succeeded').gte('paid_at', last30Start.toISOString());
    if (dailyErr) throw dailyErr;
    const dailyMap = {};
    (dailyRows || []).forEach((r) => {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(r.paid_at)); // YYYY-MM-DD
      dailyMap[day] = (dailyMap[day] || 0) + (Number(r.amount) || 0);
    });
    const dailyRevenue = [];
    for (let i = 0; i < 30; i++) {
      const dt = new Date(last30Start);
      dt.setUTCDate(dt.getUTCDate() + i);
      const key = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(dt);
      dailyRevenue.push({ date: key, amount: Math.round((dailyMap[key] || 0) * 100) / 100 });
    }

    const { data: recentEvents, error: eventsErr } = await supabase.from('whop_member_events')
      .select('id,membership_id,event_type,occurred_at,amount,email').order('occurred_at', { ascending: false }).limit(40);
    if (eventsErr) throw eventsErr;

    const { data: syncState } = await supabase.from('whop_sync_state').select('*').eq('id', true).maybeSingle();

    return res.status(200).json({
      activeMembers: activeCount,
      revenue: {
        today: round2(revenueToday), thisWeek: round2(revenueWeek), thisMonth: round2(revenueMonth),
        estMonthlyRunRate: round2(revenueLast30), // trailing-30-day run rate, not a true subscription MRR
      },
      members: {
        newThisWeek, churnedThisWeek, newThisMonth, churnedThisMonth,
        netThisWeek: newThisWeek - churnedThisWeek, netThisMonth: newThisMonth - churnedThisMonth,
      },
      dailyRevenue,
      recentEvents: recentEvents || [],
      lastSync: syncState || null,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    const notSetUp = isDbNotSetUp(err);
    return res.status(notSetUp ? 503 : 500).json({
      error: notSetUp
        ? 'The database tables haven’t been set up yet — run supabase/migrations/0011_whop_business_dashboard.sql against your Supabase project.'
        : err.message,
      setupRequired: notSetUp,
    });
  }
}
