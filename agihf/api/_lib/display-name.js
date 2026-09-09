// display-name.js — A Girl & Her Futures™
//
// Resolves a member's display-name preference into the actual string
// shown publicly. Originally written for Share My Win (agihf/api/
// wins-data.js), promoted here so the Monthly Challenge feature
// (agihf/api/challenge-data.js) can reuse the exact same logic instead
// of duplicating it — zero behavior change for existing Share My Win
// callers.
//
// Callers always resolve once, at the moment of the public-facing action
// (submitting a win, being confirmed as a giveaway winner), and snapshot
// the result onto the row (e.g. win_submissions.display_name_snapshot,
// giveaway_winners.display_name_snapshot) rather than re-resolving live
// on every read — so a later profile rename can never retroactively
// change an already-published card.

export function resolveDisplayName(preference, profile, userEmail) {
  if (preference === 'anonymous') return 'Anonymous AGHF Member';
  if (preference === 'username') return profile?.full_name ? profile.full_name.split(' ')[0] : (userEmail || '').split('@')[0];
  const full = (profile?.full_name || '').trim();
  if (!full) return preference === 'full_name' ? 'An AGHF Member' : 'An AGHF Member';
  if (preference === 'full_name') return full;
  const parts = full.split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full;
}
