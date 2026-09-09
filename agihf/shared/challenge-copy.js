/**
 * challenge-copy.js — A Girl & Her Futures™
 *
 * Centralized copy for the AGHF Monthly Challenge: hero/tagline, per-status
 * countdown/drawing-page framing, activity-type labels ("Ways to Earn"),
 * the 7 Achievement Rankings categories, entry/verification/fulfillment
 * status labels, momentum/qualification/milestone phrasing, notification
 * icons, and Admin Challenge Manager action labels. No calculation logic,
 * no member data — copy only. Every enum here matches a real CHECK
 * constraint in supabase/migrations/0008_monthly_challenge.sql or a real
 * key used by agihf/api/challenge-data.js — never invented independently.
 */

export const HERO_COPY = {
  eyebrow: '✦ This Month’s Challenge',
  title: 'AGHF Monthly Challenge',
  tagline: 'Show up. Build your skills. Earn entries. Win rewards.',
  supporting: 'Ranked on learning, preparation, reflection, and consistency — never on P&L, balance, or trade count.',
};

/**
 * Per-challenge-status framing. Covers all 11 statuses from the
 * challenges.status CHECK constraint, including the two an ordinary
 * member's own page never actually shows (draft, scheduled) so an admin
 * preview or a stray direct link never renders with no copy at all.
 */
export const CHALLENGE_STATUS_COPY = {
  draft: { heading: 'Not Yet Announced', body: 'This challenge is still being put together.' },
  scheduled: { heading: 'Coming Soon', body: 'This challenge hasn’t opened for entries yet — check back soon.' },
  active: { heading: 'Entries Open', body: 'Keep showing up — every qualifying activity earns points and entries.' },
  entry_period_closed: { heading: 'Entries Closed', body: 'This month’s entry period has ended. The drawing is next.' },
  drawing_ready: { heading: 'Drawing Coming Soon', body: 'Entries are locked in and the drawing is being prepared.' },
  winner_selected: { heading: 'Winner Selected', body: 'A winner has been selected and is being verified.' },
  awaiting_verification: { heading: 'Verifying Details', body: 'We’re confirming a few details before anything is announced.' },
  winner_confirmed: { heading: 'Winner Confirmed', body: 'A winner has been confirmed — the announcement is coming shortly.' },
  published: { heading: 'Winner Announced! ✦', body: 'Congratulations to this month’s winner!' },
  completed: { heading: 'Challenge Complete', body: 'This challenge has wrapped up. See you next month.' },
  cancelled: { heading: 'Challenge Cancelled', body: 'This challenge was cancelled.' },
};

/**
 * COUNTDOWN_STATES — the 5 distinct drawing/countdown page states a member
 * actually sees, each mapped from one or more real challenge.status values.
 * Deliberately fewer than the 11 raw statuses since several are
 * indistinguishable from the member's point of view (e.g. entry_period_closed
 * and drawing_ready both just read as "entries closed, drawing coming").
 */
export const COUNTDOWN_STATES = {
  entries_open: { statuses: ['active'], label: 'Entries Open', icon: '🎟️' },
  entries_closed: { statuses: ['entry_period_closed', 'drawing_ready'], label: 'Entries Closed — Drawing Coming Soon', icon: '⏳' },
  verifying: { statuses: ['winner_selected', 'awaiting_verification'], label: 'Winner Selected — Verifying Details', icon: '🔒' },
  announced: { statuses: ['winner_confirmed', 'published'], label: 'Winner Announced!', icon: '🎉' },
  complete: { statuses: ['completed'], label: 'Challenge Complete', icon: '✦' },
};

export function countdownStateFor(status) {
  const key = Object.keys(COUNTDOWN_STATES).find((k) => COUNTDOWN_STATES[k].statuses.includes(status));
  return key || null;
}

/** Activity types powering "Ways to Earn" — matches challenge_rules/
 * challenge_activities.activity_type's CHECK constraint exactly (14 values). */
export const ACTIVITY_TYPE_LABELS = {
  lesson_completed: { label: 'Complete an Academy Lesson', icon: '🎓' },
  section_checkpoint_cleared: { label: 'Clear a Section Checkpoint', icon: '✅' },
  checklist_completed: { label: 'Complete the Dayli ICC Checklist', icon: '📋' },
  journal_entry_completed: { label: 'Log a Complete Journal Entry', icon: '📓' },
  weekly_review_completed: { label: 'Complete a Weekly Review', icon: '🗓️' },
  chart_lab_completed: { label: 'Complete a Chart Lab Exercise', icon: '📊' },
  psychology_session_completed: { label: 'Complete an AGHF Agent Session', icon: '🧠' },
  scenario_lab_attempt: { label: 'Attempt a Scenario Lab', icon: '🎯' },
  pass_this_trade: { label: 'Pass on a Trade That Broke the Rules', icon: '🚪' },
  academy_phase_completed: { label: 'Complete an Academy Phase', icon: '🏆' },
  community_event_attended: { label: 'Attend a Community Event', icon: '🤝' },
  achievement_earned: { label: 'Earn an Achievement', icon: '⭐️' },
  win_shared: { label: 'Share a Win', icon: '✨' },
  challenge_task_completed: { label: 'Complete a Challenge Task', icon: '🎁' },
};

/** Achievement Rankings — 7 categories, matching CATEGORY_ACTIVITY_TYPES
 * in agihf/api/challenge-data.js's handleLeaderboard exactly. */
export const LEADERBOARD_CATEGORIES = [
  { key: 'overall', label: 'Overall Challenge', icon: '✦' },
  { key: 'academy', label: 'Academy Progress', icon: '🎓' },
  { key: 'consistency', label: 'Consistency', icon: '📓' },
  { key: 'chart_practice', label: 'Chart Practice', icon: '📊' },
  { key: 'mindset', label: 'Mindset & Reflection', icon: '🧠' },
  { key: 'community', label: 'Community Participation', icon: '🤝' },
  { key: 'rising', label: 'Rising This Week', icon: '📈' },
];

export function leaderboardCategoryLabel(key) {
  return LEADERBOARD_CATEGORIES.find((c) => c.key === key)?.label || 'Challenge';
}

/** giveaway_entries.entry_status CHECK constraint — 5 values, shown in the
 * member's private entry ledger. */
export const ENTRY_STATUS_LABELS = {
  pending: { label: 'Pending', help: 'Being reviewed before it counts toward the drawing.' },
  confirmed: { label: 'Confirmed', help: 'Counts toward this month’s drawing.' },
  reversed: { label: 'Reversed', help: 'Removed — the qualifying activity was invalidated or corrected.' },
  disqualified: { label: 'Disqualified', help: 'Doesn’t count toward the drawing.' },
  manually_added: { label: 'Added by AGHF', help: 'Added manually by the AGHF team, with a reason on file.' },
};

/** giveaway_winners.verification_status CHECK constraint — 4 values. */
export const WINNER_VERIFICATION_STATUS_LABELS = {
  awaiting_verification: 'Awaiting Verification',
  confirmed: 'Confirmed',
  disqualified: 'Disqualified',
  promoted_out: 'Promoted an Alternate',
};

/** prizes.fulfillment_method CHECK constraint — 4 values. */
export const PRIZE_FULFILLMENT_LABELS = {
  manual_checklist: 'Manual Checklist',
  manual_subscription_grant: 'Manual Subscription Grant',
  manual_shipping: 'Manual Shipping',
  manual_other: 'Other (Manual)',
};

/** notifications.type CHECK constraint — 11 values, each with an icon for
 * the notification bell. Bodies are composed server-side per-notification
 * (agihf/api/_lib/challenge-credit.js, challenge-data.js) since they need
 * real values (a rule's label, a challenge's name) — this only supplies
 * the icon/fallback title shown before that content loads. */
export const NOTIFICATION_TYPE_META = {
  entry_earned: { icon: '🎟️', fallbackTitle: 'You earned a new entry!' },
  milestone_reached: { icon: '🏁', fallbackTitle: 'Milestone reached' },
  one_away_from_entry: { icon: '✨', fallbackTitle: 'One more to go' },
  challenge_ending_soon: { icon: '⏳', fallbackTitle: 'This challenge is ending soon' },
  entry_period_closed: { icon: '🔒', fallbackTitle: 'Entry period closed' },
  winner_selected_private: { icon: '🔔', fallbackTitle: 'An update on this month’s drawing' },
  winner_confirmed: { icon: '🎉', fallbackTitle: 'Congratulations!' },
  alternate_promoted: { icon: '🎟️', fallbackTitle: 'An update on your entry' },
  prize_claim_reminder: { icon: '⏰', fallbackTitle: 'Don’t forget to claim your prize' },
  prize_fulfilled: { icon: '📦', fallbackTitle: 'Your prize is on its way!' },
  new_challenge_started: { icon: '✦', fallbackTitle: 'A new challenge has started' },
};

/**
 * "Your Challenge Progress" copy — must never show a discouraging
 * absolute rank, and must prefer momentum framing only when enough data
 * exists (matches handleProgress's momentum.available gate exactly).
 */
export const PROGRESS_COPY = {
  notYetQualified: (remaining) => remaining != null
    ? `${remaining} more ${remaining === 1 ? 'activity' : 'activities'} and you’ll unlock your first entry.`
    : 'Complete a qualifying activity to earn your first entry.',
  qualified: 'You’re entered in this month’s drawing.',
  momentumUp: (pct) => `You’re up ${pct}% from last week — keep going.`,
  momentumDown: (pct) => `A bit quieter than last week (${pct}%) — every activity still counts.`,
  momentumUnavailable: 'Keep showing up — your momentum will show here once there’s enough activity to compare.',
  nextMilestone: (label, remaining, requiredQuantity) => `${remaining} of ${requiredQuantity} more “${label}” ${requiredQuantity === 1 ? 'activity' : 'activities'} to your next entry.`,
};

export const ENTRY_LEDGER_EMPTY_STATE = {
  heading: 'No entries yet this month',
  body: 'Complete a qualifying activity — a lesson, a journal entry, a checklist — to earn your first entry.',
};

export const PREVIOUS_WINNERS_EMPTY_STATE = {
  heading: 'No winners announced yet',
  body: 'Once a challenge wraps up and its winner is verified, they’ll be celebrated here.',
};

export const WEEKLY_MOMENTUM_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

/** Admin Challenge Manager action labels — one per `action` value handled
 * in agihf/api/challenge-data.js's handleAdmin, plus verify_winner's
 * sub-actions. */
export const ADMIN_ACTION_LABELS = {
  create_challenge: 'Create Challenge',
  update_challenge: 'Save Changes',
  duplicate_challenge: 'Duplicate',
  archive_challenge: 'Cancel Challenge',
  set_status: 'Change Status',
  upsert_rule: 'Save Rule',
  delete_rule: 'Delete Rule',
  upsert_prize: 'Save Prize',
  upload_prize_image: 'Upload Prize Image',
  run_drawing: 'Run Monthly Drawing',
  verify_winner: 'Verify Winner',
  publish_winner: 'Publish Winner',
  manual_entry_adjustment: 'Adjust Entries',
};

export const WINNER_VERIFY_SUBACTION_LABELS = {
  confirm: 'Confirm Winner',
  disqualify: 'Disqualify',
  promote_alternate: 'Promote Next Alternate',
  contact: 'Mark as Contacted',
  record_response: 'Record Response',
  mark_claimed: 'Mark Prize Claimed',
  mark_fulfilled: 'Mark Prize Fulfilled',
};

/** challenges.status CHECK constraint, in display order — for the admin
 * status-change control. Matches CHALLENGE_STATUS_TRANSITIONS's key set
 * in agihf/api/challenge-data.js exactly. */
export const CHALLENGE_STATUS_ORDER = [
  'draft', 'scheduled', 'active', 'entry_period_closed', 'drawing_ready',
  'winner_selected', 'awaiting_verification', 'winner_confirmed',
  'published', 'completed', 'cancelled',
];
