-- 0008_monthly_challenge.sql — A Girl & Her Futures™
--
-- Redesigns the (already-deleted, see below) mock Leaderboard into "AGHF
-- Monthly Challenge": a period-scoped, admin-configured participation
-- challenge with configurable entry-earning rules, a transparent
-- per-member entry ledger, server-only cryptographically-random winner
-- selection, admin verification before any winner is revealed, and a
-- persistent in-app notification center.
--
-- agihf/leaderboard.html was deleted in a prior migration/commit (it was
-- 100% hardcoded mock data, no real backing table ever existed) — there
-- is no "leaderboard point history" to preserve or migrate. This entire
-- feature is a fresh, additive build.
--
-- Nothing here touches profiles.gp/level/day_streak/journal_streak,
-- lessons_completed, journal_entries, trade_checklists,
-- psychology_sessions, psychology_scenario_attempts, or win_submissions —
-- those stay exactly as they are and are read-only inputs to
-- challenge_activities below. "Challenge points" and "giveaway entries"
-- are an entirely separate, period-scoped ledger, reset per challenge,
-- never a reuse or reset of the permanent GP system. Points and entries
-- are themselves two structurally separate numbers (challenge_rules has
-- both points_awarded and entries_awarded columns) — a member's ranking
-- on the Achievement leaderboard is never the same underlying number as
-- her odds in the random drawing, per the feature's own explicit
-- requirement never to imply the two are the same thing.
--
-- profiles.is_admin (added in 0007) is reused as the only gate for the
-- Admin Challenge Manager — no new admin/role mechanism is introduced.
--
-- Everything ships Draft by default (challenges.status default 'draft'),
-- nothing pre-activated, and every compliance-prep text field below
-- starts empty — this migration invents no real legal/official-rules
-- language. The site owner must fill in and review official_rules /
-- eligibility_rules / odds_statement / sponsor_info / privacy_terms /
-- no_purchase_necessary_text / free_entry_method_text (and create a real
-- prize) before ever setting a challenge to 'active'.
--
-- No new Storage bucket is needed — prize images reuse the existing
-- private "win-media" bucket (created for 0007) under a new "prizes/"
-- path prefix, uploaded through agihf/api/challenge-data.js's own
-- signed-URL path (same base64-data-URL pattern already proven for win
-- media / journal screenshots).
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001-0007 before the Monthly Challenge
-- will work. Until applied, agihf/api/challenge-data.js will fail with a
-- clear "relation does not exist" error surfaced in the UI, exactly like
-- every other endpoint in this project — and the new
-- creditChallengeActivity() calls added to complete-lesson.js/
-- checklists.js/journal-entries.js/psychology-data.js/wins-data.js are
-- wrapped in try/catch specifically so a missing table here can never
-- block the underlying lesson/journal/checklist/session save it's
-- piggybacking on.

/* ── challenges ───────────────────────────────────────────────────────── */

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),

  -- Identity/copy — never hard-code a specific month; name/description
  -- are freeform so the same schema serves every future challenge period.
  name text not null,
  description text,

  -- Schedule (all admin-configurable). Every date/time column is stored
  -- as timestamptz (UTC internally) — timezone is display/interpretation
  -- only, applied client-side when rendering.
  timezone text not null default 'America/Chicago',
  starts_at timestamptz not null,
  ends_at timestamptz not null,                 -- end of the entry-earning period
  drawing_at timestamptz not null,               -- when the admin is expected to run the drawing (informational — no cron exists; see status machine, drawing is always admin-button-triggered)
  claim_deadline_at timestamptz,                 -- winners must respond/claim by this time

  winner_count integer not null default 1 check (winner_count >= 1),
  alternate_count integer not null default 2 check (alternate_count >= 0),
  allow_repeat_winner boolean not null default false, -- same member winning twice in one drawing

  primary_prize_id uuid, -- fk added below once `prizes` exists

  -- Compliance-prep fields — admin-configurable, deliberately empty by
  -- default. Never auto-filled with invented legal language.
  eligibility_rules text,
  official_rules text,
  odds_statement text,
  sponsor_info text,
  privacy_terms text,
  no_purchase_necessary_text text,
  free_entry_method_text text,

  -- Schema exists for future use; NOT enforced against any real paywall
  -- this pass — confirmed no Free/Premium gating exists anywhere in this
  -- app today. Every authenticated member is eligible for every
  -- challenge by default.
  membership_eligibility text not null default 'all_authenticated',

  -- Status machine — 11 named statuses.
  status text not null default 'draft' check (status in (
    'draft', 'scheduled', 'active', 'entry_period_closed', 'drawing_ready',
    'winner_selected', 'awaiting_verification', 'winner_confirmed',
    'published', 'completed', 'cancelled'
  )),

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* ── prizes (admin-configurable, referenced by challenges + winners) ───── */

create table if not exists prizes (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  name text not null,
  description text,
  image_path text,               -- win-media bucket, "prizes/<challengeId>/..." prefix
  quantity integer not null default 1 check (quantity >= 1),
  estimated_value text,          -- free text ("$49", "1 free month") — never used in any legal odds calculation
  fulfillment_method text not null default 'manual_checklist' check (fulfillment_method in
    ('manual_checklist', 'manual_subscription_grant', 'manual_shipping', 'manual_other')),
  claim_deadline timestamptz,
  eligibility_restrictions text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table challenges add constraint challenges_primary_prize_fk
  foreign key (primary_prize_id) references prizes(id) on delete set null;

/* ── challenge_rules (admin-configurable entry-earning rules) ───────────── */

create table if not exists challenge_rules (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,

  -- Closed vocabulary challenge-engine.js/challenge-credit.js key off of.
  -- Kept wide so a future activity type doesn't need a migration; not
  -- every value here has an active rule shipped this pass (see the
  -- migration's own header + the plan's "Explicitly deferred" section —
  -- weekly_review_completed and chart_lab_completed have no real backing
  -- feature yet, section_checkpoint_cleared has no server-side record
  -- yet, achievement_earned has no pre-existing achievements table).
  activity_type text not null check (activity_type in (
    'lesson_completed', 'section_checkpoint_cleared', 'checklist_completed',
    'journal_entry_completed', 'weekly_review_completed', 'chart_lab_completed',
    'psychology_session_completed', 'scenario_lab_attempt', 'pass_this_trade',
    'academy_phase_completed', 'community_event_attended', 'achievement_earned',
    'win_shared', 'challenge_task_completed'
  )),

  required_quantity integer not null default 1 check (required_quantity >= 1),

  -- Two structurally separate reward numbers — see header comment.
  points_awarded integer not null default 0 check (points_awarded >= 0),
  entries_awarded integer not null default 1 check (entries_awarded >= 0),

  max_entries_per_challenge integer,      -- null = uncapped by this rule specifically
  daily_cap integer,
  weekly_cap integer,

  membership_eligibility text not null default 'all_authenticated',
  verification_method text not null default 'automatic' check (verification_method in ('automatic', 'admin_review')),

  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,

  -- Rendering metadata so "Ways to Earn Entries" never hardcodes labels
  -- per activity_type.
  label text not null,
  description text,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

/* ── challenge_activities (append-only qualifying-event ledger — the
   actual anti-duplicate-credit mechanism lives in the unique constraint
   below, not in application-level counting) ────────────────────────────── */

create table if not exists challenge_activities (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid not null references challenge_rules(id) on delete cascade,

  activity_type text not null,
  source_table text not null,             -- e.g. 'lessons_completed', 'journal_entries'
  source_record_id uuid not null,         -- the qualifying row's own id — every activity always references its source

  occurred_at timestamptz not null,       -- the source record's own completion timestamp, not insertion time
  points_awarded integer not null default 0, -- snapshot of rule.points_awarded at credit time, so a later rule-value edit never rewrites history
  verification_status text not null default 'automatic' check (verification_status in
    ('automatic', 'admin_review', 'verified', 'disqualified')),

  invalidated_at timestamptz,             -- set if the source record is later deleted/edited-away/admin-disqualified
  invalidated_reason text,

  created_at timestamptz not null default now(),

  -- One activity row per source record per rule, ever. Reopening/
  -- resaving/deleting+recreating the same underlying record cannot
  -- create a second row once this exists — enforced by Postgres itself
  -- via ON CONFLICT DO NOTHING at insert time, not application logic
  -- that could race.
  unique (rule_id, source_table, source_record_id)
);

create index if not exists idx_challenge_activities_user_challenge
  on challenge_activities(challenge_id, user_id) where invalidated_at is null;

/* ── giveaway_entries (the confirmed/pending entry ledger a member sees
   in "View My Entries") ────────────────────────────────────────────────── */

create table if not exists giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid references challenge_rules(id) on delete set null,
  activity_id uuid references challenge_activities(id) on delete set null, -- the qualifying source event this batch of entries was earned from

  entry_amount integer not null check (entry_amount > 0),
  entry_status text not null default 'confirmed' check (entry_status in
    ('pending', 'confirmed', 'reversed', 'disqualified', 'manually_added')),

  -- Manual add/remove audit trail — required whenever an admin touches an
  -- entry total directly. Never a silent change.
  adjusted_by uuid references auth.users(id) on delete set null,
  adjustment_reason text,
  previous_value integer,
  new_value integer,

  reversed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_giveaway_entries_user_challenge on giveaway_entries(challenge_id, user_id);
create index if not exists idx_giveaway_entries_challenge_status on giveaway_entries(challenge_id, entry_status);

/* ── giveaway_draws (one immutable record per drawing run — the
   idempotency + audit anchor; the unique constraint on challenge_id is
   the actual "never run the drawing twice" guard, enforced by Postgres,
   not just application logic) ──────────────────────────────────────────── */

create table if not exists giveaway_draws (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null unique references challenges(id) on delete cascade,

  idempotency_key text not null unique,          -- sha256(challengeId + ':v1')
  selection_method text not null default 'crypto_weighted',
  selection_version text not null default 'v1',

  eligible_entry_snapshot jsonb not null,        -- [{userId, entryIds[], weight}], frozen at draw time
  total_eligible_entries integer not null,
  total_eligible_members integer not null,

  run_by uuid not null references auth.users(id) on delete restrict, -- the admin who clicked "Run Monthly Drawing"
  run_at timestamptz not null default now(),
  random_source text not null default 'node:crypto.randomInt',       -- never Math.random, anywhere

  created_at timestamptz not null default now()
);

/* ── giveaway_winners (selected + alternates, verification lifecycle) ──── */

create table if not exists giveaway_winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references giveaway_draws(id) on delete cascade,
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Exactly one of these is set — a winner has a winner_order and no
  -- alternate_order, an alternate has the reverse. Kept as two distinct
  -- nullable columns (rather than one overloaded order + a boolean) so
  -- "2nd winner" and "2nd alternate" can never be confused.
  winner_order integer,
  alternate_order integer,
  check (
    (winner_order is not null and alternate_order is null) or
    (winner_order is null and alternate_order is not null)
  ),

  selected_entry_id uuid references giveaway_entries(id) on delete set null,
  prize_id uuid references prizes(id) on delete set null,

  verification_status text not null default 'awaiting_verification' check (verification_status in
    ('awaiting_verification', 'confirmed', 'disqualified', 'promoted_out')), -- promoted_out = an alternate that moved into an active winner slot; this row stays for audit history

  disqualification_reason text,
  contacted_at timestamptz,
  response_recorded_at timestamptz,
  response_notes text,

  prize_claimed_at timestamptz,
  prize_fulfilled_at timestamptz,
  fulfillment_notes text,

  -- Public display fields — resolved ONCE at confirm-and-publish time,
  -- same snapshot-at-action-time convention as
  -- win_submissions.display_name_snapshot.
  display_name_preference text not null default 'first_name_last_initial'
    check (display_name_preference in ('full_name', 'first_name_last_initial', 'username', 'anonymous')),
  display_name_snapshot text,
  show_avatar boolean not null default true,
  winner_message text,           -- optional short public message
  achievement_badge text,

  published_at timestamptz,      -- non-null once "Confirm and Publish Winner" has run — the single column gating public visibility everywhere

  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_giveaway_winners_challenge on giveaway_winners(challenge_id, winner_order, alternate_order);
create index if not exists idx_giveaway_winners_published on giveaway_winners(published_at desc) where published_at is not null;

/* ── challenge_audit_log (every admin action against this feature) ─────── */

create table if not exists challenge_audit_log (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete set null,
  admin_id uuid not null references auth.users(id) on delete restrict,
  action text not null,           -- e.g. 'run_drawing', 'confirm_winner', 'disqualify_winner', 'promote_alternate', 'manual_entry_adjustment', 'status_change'
  target_table text,
  target_id uuid,
  reason text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_challenge_audit_log_challenge on challenge_audit_log(challenge_id, created_at desc);

/* ── member per-challenge display preferences (opt in/out of public
   rankings, display name, avatar, level visibility) ────────────────────── */

create table if not exists challenge_member_prefs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  public_opt_in boolean not null default false,   -- never pre-checked — appear in Achievement Rankings at all; false = "Your Position" stays private-only
  display_name_preference text not null default 'first_name_last_initial'
    check (display_name_preference in ('full_name', 'first_name_last_initial', 'username', 'anonymous')),
  show_avatar boolean not null default true,
  show_level boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);

/* ── notifications (new persistent in-app notification center — generic
   enough for other features to reuse later; type vocabulary is
   Monthly-Challenge-first for now) ──────────────────────────────────────── */

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  type text not null check (type in (
    'entry_earned', 'milestone_reached', 'one_away_from_entry',
    'challenge_ending_soon', 'entry_period_closed',
    'winner_selected_private', 'winner_confirmed', 'alternate_promoted',
    'prize_claim_reminder', 'prize_fulfilled', 'new_challenge_started'
  )),
  title text not null,
  body text,
  challenge_id uuid references challenges(id) on delete cascade,
  link_href text,                 -- e.g. 'monthly-challenge.html#entries'

  -- Batching key: an unread notification with the same
  -- (user_id, type, challenge_id, batch_key) inserted within the last 10
  -- minutes updates in place instead of inserting a new row — see
  -- challenge-credit.js for the exact grouping logic. This is the literal
  -- "don't spam, group entry notifications" mechanism.
  batch_key text,

  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread on notifications(user_id, read_at) where read_at is null;
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);

/* ── deferred, not built this pass (see migration header + plan's
   "Explicitly deferred" section) — sketched here only so a future pass
   doesn't have to redesign the shape:
   Promoting section-quiz completion (today: localStorage-only,
   'aghf_section_clear:<phase>-<section>') to a real server record would
   look like:
     create table section_checkpoints_completed (
       id uuid primary key default gen_random_uuid(),
       user_id uuid not null references auth.users(id) on delete cascade,
       phase_key text not null, section_key text not null,
       completed_at timestamptz not null default now(),
       unique (user_id, phase_key, section_key)
     );
   Not created now — section_checkpoint_cleared stays in
   challenge_rules' CHECK vocabulary for forward-compatibility, but no
   rule of that type is seeded active. */

/* ── RLS — defense-in-depth, same rationale as every prior migration:
   every API endpoint already scopes queries via the JWT-verified user.id
   using the service-role key. Public-readable configuration/results
   tables allow read to any authenticated caller; every write still goes
   exclusively through agihf/api/challenge-data.js's admin-gated actions. ── */

alter table challenges enable row level security;
alter table prizes enable row level security;
alter table challenge_rules enable row level security;
alter table challenge_activities enable row level security;
alter table giveaway_entries enable row level security;
alter table giveaway_draws enable row level security;
alter table giveaway_winners enable row level security;
alter table challenge_audit_log enable row level security;
alter table challenge_member_prefs enable row level security;
alter table notifications enable row level security;

create policy "Members read challenges" on challenges for select using (true);
create policy "Members read prizes" on prizes for select using (true);
create policy "Members read challenge rules" on challenge_rules for select using (true);
create policy "Members read published winners" on giveaway_winners for select using (published_at is not null);

create policy "Members read their own challenge activities" on challenge_activities
  for select using (auth.uid() = user_id);
create policy "Members read their own giveaway entries" on giveaway_entries
  for select using (auth.uid() = user_id);
create policy "Members manage their own challenge prefs" on challenge_member_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Members manage their own notifications" on notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
