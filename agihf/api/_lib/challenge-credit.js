// challenge-credit.js — A Girl & Her Futures™
//
// The single entry point every existing "this record just became genuinely
// complete" write path calls into: complete-lesson.js, checklists.js,
// journal-entries.js, psychology-data.js, wins-data.js. Deterministic,
// race-safe, and designed so a missing/unmigrated challenge table can
// never break the underlying save it's piggybacking on — every caller
// wraps this in try/catch and ignores its result.
//
// The actual anti-duplicate-credit mechanism is NOT application-level
// counting — it's the `unique(rule_id, source_table, source_record_id)`
// constraint on challenge_activities itself. A resave, reopen, or
// delete-and-recreate of the same source record can insert this same
// tuple again, but Postgres silently ignores it (ON CONFLICT DO NOTHING,
// via upsert+ignoreDuplicates below) — so it is structurally impossible
// for the same qualifying record to earn a second entry, no matter how
// many times this function is called for it. Editing an already-credited
// record never re-fires for the same reason: crediting keys off the
// source record's *existence* in challenge_activities, never its current
// field values.
//
// "Challenge points" (challenge_rules.points_awarded, snapshotted onto
// challenge_activities.points_awarded) and "giveaway entries"
// (challenge_rules.entries_awarded, materialized as giveaway_entries
// rows) are two structurally separate numbers, both derived from the same
// underlying activity but never conflated — see 0008_monthly_challenge.sql's
// header comment.

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ userId: string, sourceTable: string, sourceRecordId: string, activityType: string, occurredAt?: string }} params
 * @returns {Promise<{ credited: boolean }>} always resolves, never throws — callers still wrap in try/catch as defense-in-depth against a missing table.
 */
export async function creditChallengeActivity(supabase, { userId, sourceTable, sourceRecordId, activityType, occurredAt }) {
  const nowIso = new Date().toISOString();

  const { data: challenges, error: challengeErr } = await supabase
    .from('challenges').select('id').eq('status', 'active');
  if (challengeErr || !challenges?.length) return { credited: false };

  let creditedAny = false;

  for (const challenge of challenges) {
    const { data: rules } = await supabase
      .from('challenge_rules').select('*')
      .eq('challenge_id', challenge.id).eq('activity_type', activityType).eq('active', true);
    if (!rules?.length) continue;

    for (const rule of rules) {
      if (rule.starts_at && rule.starts_at > nowIso) continue;
      if (rule.ends_at && rule.ends_at < nowIso) continue;

      // The dedupe insert. ignoreDuplicates + select() returns the row
      // only if it was genuinely new — empty array means this exact
      // (rule, source_table, source_record_id) tuple already existed,
      // i.e. this record was already credited under this rule before.
      const { data: inserted, error: insertErr } = await supabase
        .from('challenge_activities')
        .upsert({
          challenge_id: challenge.id,
          user_id: userId,
          rule_id: rule.id,
          activity_type: activityType,
          source_table: sourceTable,
          source_record_id: sourceRecordId,
          occurred_at: occurredAt || nowIso,
          points_awarded: rule.points_awarded,
        }, { onConflict: 'rule_id,source_table,source_record_id', ignoreDuplicates: true })
        .select('id')
        .maybeSingle();
      if (insertErr || !inserted) continue; // duplicate or table not migrated yet — skip this rule silently

      creditedAny = true;

      const { count: activityCount } = await supabase
        .from('challenge_activities').select('id', { count: 'exact', head: true })
        .eq('rule_id', rule.id).eq('user_id', userId).is('invalidated_at', null);
      const count = activityCount || 0;
      const remainderToNext = rule.required_quantity - (count % rule.required_quantity);

      if (count > 0 && count % rule.required_quantity === 0) {
        await awardEntryIfWithinCaps(supabase, { challenge, rule, userId, activityId: inserted.id });
        await upsertNotification(supabase, {
          userId, challengeId: challenge.id, type: 'entry_earned', batchKey: rule.id,
          title: 'You earned a new entry!',
          body: `${rule.label} — you just unlocked another giveaway entry this challenge.`,
          linkHref: 'monthly-challenge.html#entries',
        });
      } else if (remainderToNext === 1 && rule.required_quantity > 1) {
        await upsertNotification(supabase, {
          userId, challengeId: challenge.id, type: 'one_away_from_entry', batchKey: `${rule.id}:${count}`,
          title: 'One more and you’ll earn an entry',
          body: `Complete one more "${rule.label}" activity to unlock your next giveaway entry.`,
          linkHref: 'monthly-challenge.html#ways-to-earn',
        });
      }
    }
  }

  return { credited: creditedAny };
}

async function awardEntryIfWithinCaps(supabase, { challenge, rule, userId, activityId }) {
  const { data: existingEntries } = await supabase
    .from('giveaway_entries').select('entry_amount, created_at')
    .eq('challenge_id', challenge.id).eq('rule_id', rule.id).eq('user_id', userId).eq('entry_status', 'confirmed');
  const rows = existingEntries || [];
  const total = rows.reduce((s, r) => s + r.entry_amount, 0);

  if (rule.max_entries_per_challenge != null && total + rule.entries_awarded > rule.max_entries_per_challenge) return;

  if (rule.daily_cap != null) {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayTotal = rows.filter((r) => new Date(r.created_at).getTime() >= dayAgo).reduce((s, r) => s + r.entry_amount, 0);
    if (todayTotal + rule.entries_awarded > rule.daily_cap) return;
  }
  if (rule.weekly_cap != null) {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekTotal = rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).reduce((s, r) => s + r.entry_amount, 0);
    if (weekTotal + rule.entries_awarded > rule.weekly_cap) return;
  }

  await supabase.from('giveaway_entries').insert({
    challenge_id: challenge.id, user_id: userId, rule_id: rule.id, activity_id: activityId,
    entry_amount: rule.entries_awarded, entry_status: 'confirmed',
  });
}

/** Grouping: an unread notification with the same (user, type, challenge,
 * batch_key) inserted within the last 10 minutes updates in place instead
 * of inserting a new row — the literal "don't spam, group entry
 * notifications" mechanism. */
async function upsertNotification(supabase, { userId, challengeId, type, batchKey, title, body, linkHref }) {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('notifications').select('id')
    .eq('user_id', userId).eq('type', type).eq('challenge_id', challengeId).eq('batch_key', batchKey)
    .is('read_at', null).gte('created_at', tenMinAgo).maybeSingle();

  if (existing) {
    await supabase.from('notifications').update({ title, body, created_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await supabase.from('notifications').insert({ user_id: userId, challenge_id: challengeId, type, batch_key: batchKey, title, body, link_href: linkHref });
  }
}
