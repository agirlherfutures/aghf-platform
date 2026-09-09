// challenge-engine.js — A Girl & Her Futures™ (server-only)
//
// The winner-selection algorithm for the AGHF Monthly Challenge. Lives
// under api/_lib/ (never agihf/shared/, which is also served directly to
// the browser) specifically because it needs Node's built-in `crypto`
// module for cryptographically secure randomness — `Math.random()` is
// never used anywhere in this file, on purpose, per the feature's own
// security requirement that the frontend can never influence and no AI
// model can ever choose a winner.
//
// Called exclusively from agihf/api/challenge-data.js's `admin` resource,
// itself only reachable by an admin clicking "Run Monthly Drawing" — no
// cron exists in this project, so this always runs as a direct,
// synchronous, server-side response to that one authenticated request.

import { randomInt, createHash } from 'node:crypto';

export function deriveIdempotencyKey(challengeId) {
  return createHash('sha256').update(`${challengeId}:v1`).digest('hex');
}

/** @returns {Promise<{ snapshot: {userId:string, entryIds:string[], weight:number}[], totalEligibleEntries: number, totalEligibleMembers: number }>} */
export async function buildEligibleSnapshot(supabase, challengeId) {
  const { data, error } = await supabase
    .from('giveaway_entries')
    .select('id, user_id, entry_amount')
    .eq('challenge_id', challengeId)
    .eq('entry_status', 'confirmed');
  if (error) throw error;

  const byUser = new Map();
  for (const row of data || []) {
    const existing = byUser.get(row.user_id) || { userId: row.user_id, entryIds: [], weight: 0 };
    existing.entryIds.push(row.id);
    existing.weight += row.entry_amount;
    byUser.set(row.user_id, existing);
  }
  const snapshot = [...byUser.values()].filter((m) => m.weight > 0);
  const totalEligibleEntries = snapshot.reduce((s, m) => s + m.weight, 0);
  return { snapshot, totalEligibleEntries, totalEligibleMembers: snapshot.length };
}

/**
 * Weighted draw without replacement (by default), never Math.random.
 * @param {{userId:string, entryIds:string[], weight:number}[]} snapshot
 * @param {{winnerCount:number, alternateCount:number, allowRepeatWinner:boolean}} config
 * @returns {{userId:string, selectedEntryId:string, isAlternate:boolean, order:number}[]} winners first (order 1..winnerCount), then alternates (order 1..alternateCount)
 */
export function drawWinners(snapshot, { winnerCount, alternateCount, allowRepeatWinner }) {
  // Deep-copy so the caller's snapshot (which gets persisted verbatim to
  // giveaway_draws.eligible_entry_snapshot) is never mutated by the draw.
  const pool = snapshot.map((m) => ({ userId: m.userId, entryIds: [...m.entryIds], weight: m.weight }));
  const results = [];
  const totalSlots = winnerCount + alternateCount;

  for (let slot = 0; slot < totalSlots && pool.length > 0; slot += 1) {
    const totalWeight = pool.reduce((s, m) => s + m.weight, 0);
    if (totalWeight <= 0) break;
    const r = randomInt(0, totalWeight); // cryptographically secure, never Math.random

    let cumulative = 0;
    let idx = -1;
    for (let i = 0; i < pool.length; i += 1) {
      cumulative += pool[i].weight;
      if (r < cumulative) { idx = i; break; }
    }
    const winnerMember = pool[idx];
    const selectedEntryId = winnerMember.entryIds[0];
    const isAlternate = slot >= winnerCount;

    results.push({
      userId: winnerMember.userId,
      selectedEntryId,
      isAlternate,
      order: isAlternate ? slot - winnerCount + 1 : slot + 1,
    });

    if (allowRepeatWinner) {
      // Consume just the one entry that won; the member stays eligible
      // for further slots with reduced weight.
      winnerMember.entryIds.shift();
      winnerMember.weight -= 1;
      if (winnerMember.weight <= 0) pool.splice(idx, 1);
    } else {
      // Remove the entire member so nobody can occupy two slots in one drawing.
      pool.splice(idx, 1);
    }
  }
  return results;
}

/**
 * Full server-side drawing flow — steps 1-9 of the spec's "Automatic
 * Winner Selection" section. Idempotent: giveaway_draws.challenge_id is
 * a unique column, so a second call for the same challenge returns the
 * existing draw's winners instead of ever drawing twice.
 */
export async function runMonthlyDrawing(supabase, { challengeId, adminUserId }) {
  const { data: challenge, error: challengeErr } = await supabase
    .from('challenges').select('*').eq('id', challengeId).single();
  if (challengeErr) throw challengeErr;
  if (!challenge) throw Object.assign(new Error('Challenge not found'), { status: 404 });
  if (challenge.status !== 'drawing_ready') {
    throw Object.assign(new Error(`Challenge must be in drawing_ready status to run the drawing (currently: ${challenge.status})`), { status: 409 });
  }

  const idempotencyKey = deriveIdempotencyKey(challengeId);

  const { data: existingDraw } = await supabase
    .from('giveaway_draws').select('*').eq('challenge_id', challengeId).maybeSingle();
  if (existingDraw) {
    const { data: existingWinners } = await supabase
      .from('giveaway_winners').select('*').eq('draw_id', existingDraw.id);
    return { draw: existingDraw, winners: existingWinners || [], alreadyRan: true };
  }

  const { snapshot, totalEligibleEntries, totalEligibleMembers } = await buildEligibleSnapshot(supabase, challengeId);

  const { data: draw, error: drawInsertErr } = await supabase
    .from('giveaway_draws')
    .insert({
      challenge_id: challengeId,
      idempotency_key: idempotencyKey,
      eligible_entry_snapshot: snapshot,
      total_eligible_entries: totalEligibleEntries,
      total_eligible_members: totalEligibleMembers,
      run_by: adminUserId,
    })
    .select('*').single();
  if (drawInsertErr) {
    // Unique-constraint violation means a concurrent call already won the
    // race to insert — treat exactly like the existingDraw branch above.
    if (/duplicate key/i.test(drawInsertErr.message || '')) {
      const { data: raceDraw } = await supabase.from('giveaway_draws').select('*').eq('challenge_id', challengeId).single();
      const { data: raceWinners } = await supabase.from('giveaway_winners').select('*').eq('draw_id', raceDraw.id);
      return { draw: raceDraw, winners: raceWinners || [], alreadyRan: true };
    }
    throw drawInsertErr;
  }

  const results = drawWinners(snapshot, {
    winnerCount: challenge.winner_count,
    alternateCount: challenge.alternate_count,
    allowRepeatWinner: challenge.allow_repeat_winner,
  });

  const winnerRows = results.map((r) => ({
    draw_id: draw.id,
    challenge_id: challengeId,
    user_id: r.userId,
    winner_order: r.isAlternate ? null : r.order,
    alternate_order: r.isAlternate ? r.order : null,
    selected_entry_id: r.selectedEntryId,
    prize_id: challenge.primary_prize_id,
    verification_status: 'awaiting_verification',
  }));

  const { data: insertedWinners, error: winnersErr } = await supabase
    .from('giveaway_winners').insert(winnerRows).select('*');
  if (winnersErr) throw winnersErr;

  await supabase.from('challenge_audit_log').insert({
    challenge_id: challengeId,
    admin_id: adminUserId,
    action: 'run_drawing',
    target_table: 'giveaway_draws',
    target_id: draw.id,
    new_value: { totalEligibleEntries, totalEligibleMembers, winnerCount: results.filter((r) => !r.isAlternate).length, alternateCount: results.filter((r) => r.isAlternate).length },
  });

  await supabase.from('challenges').update({ status: 'awaiting_verification', updated_at: new Date().toISOString() }).eq('id', challengeId);

  // Private-only notifications — reveal nothing, per "never publicly
  // notify someone as the winner before verification."
  const notifRows = winnerRows.map((w) => ({
    user_id: w.user_id,
    challenge_id: challengeId,
    type: 'winner_selected_private',
    batch_key: challengeId,
    title: 'You may have been selected in this month’s drawing',
    body: 'We’re verifying a few details before anything is announced — check back soon.',
    link_href: 'monthly-challenge.html',
  }));
  const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true);
  for (const admin of admins || []) {
    notifRows.push({
      user_id: admin.id,
      challenge_id: challengeId,
      type: 'winner_selected_private',
      batch_key: `${challengeId}:admin`,
      title: 'A winner has been selected and needs verification',
      body: `${challenge.name}: review the drawing results in the Challenge Manager.`,
      link_href: 'admin-challenge.html',
    });
  }
  if (notifRows.length) await supabase.from('notifications').insert(notifRows);

  return { draw, winners: insertedWinners || [], alreadyRan: false };
}
