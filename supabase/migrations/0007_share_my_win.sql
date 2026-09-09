-- 0007_share_my_win.sql — A Girl & Her Futures™
--
-- Adds "Share My Win" — a member-submitted, admin-moderated win/testimonial
-- feature replacing the old public Leaderboard route. win_submissions holds
-- the full 7-step guided flow (category, story, what helped, media, AGHF
-- review, sharing consent) plus a closed set of moderation-lifecycle
-- statuses; win_reactions is a separate small table so "who reacted how"
-- never bloats or needs locking on the submission row itself.
--
-- profiles.is_admin gates the new moderation console — there is no
-- admin/role concept anywhere else in this codebase today. Purely
-- additive: does not alter, rename, or drop any existing table/column,
-- and does not touch any existing row anywhere.
--
-- consent is a flat, named-boolean JSONB column (mirrors
-- psychology_profiles.consent's existing convention) and defaults every
-- flag to false — marketing/publicity consent must always be an explicit,
-- separate opt-in, never pre-selected and never granted on a member's
-- behalf (including by the AGHF Agent's win-share proposal tool).
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001-0006 before Share My Win will work.
-- Until applied, agihf/api/wins-data.js will fail with a clear "relation
-- does not exist" error surfaced in the UI, exactly like every other
-- endpoint in this project does. Two manual follow-up steps after
-- applying: (1) create a private Supabase Storage bucket named
-- "win-media" in the dashboard (same one-time step as every other bucket
-- in this project); (2) flip is_admin to true for your own account (and
-- anyone else on the AGHF team) in the profiles table via the table
-- editor — there is no UI anywhere for granting this, by design.

alter table profiles add column if not exists is_admin boolean not null default false;

create table if not exists win_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Step 1: what are we celebrating.
  primary_category text not null check (primary_category in
    ('passed_evaluation', 'funded_milestone', 'clean_execution_day',
     'walked_away_discipline', 'mindset_breakthrough', 'consistency_streak',
     'lesson_applied', 'other')),
  secondary_category text check (secondary_category in
    ('passed_evaluation', 'funded_milestone', 'clean_execution_day',
     'walked_away_discipline', 'mindset_breakthrough', 'consistency_streak',
     'lesson_applied', 'other')),

  -- Step 2: headline / story.
  headline text,
  story text,

  -- Step 3: what helped (multi-select).
  what_helped text[] not null default '{}',
  favorite_feature text,

  -- Step 4: proof/personality. No video upload — a pasted link only, since
  -- this app's only upload precedent (base64-over-HTTP) is unworkable for
  -- video on Vercel's serverless body-size ceiling.
  media jsonb not null default '[]',  -- [{path, filename, mimeType, bytes, uploadedAt}]
  video_url text,
  sensitive_info_confirmed boolean not null default false,

  -- Step 5: AGHF review — becomes the testimonial only if she opts in.
  rating smallint check (rating between 1 and 5),
  testimonial_text text,
  testimonial_original_text text,           -- preserved verbatim on the FIRST admin wording edit, never overwritten again
  testimonial_edited_by_admin boolean not null default false,
  improvement_feedback text,                -- private by default, never returned by any public/admin-facing read
  exact_pnl_opt_in boolean not null default false,
  exact_pnl numeric,                        -- only ever rendered client-side when exact_pnl_opt_in = true
  outcome_summary text,                     -- non-exact description, e.g. "hit her profit target"

  -- Linked real Academy records — never a fabricated milestone.
  linked_eval_plan_id uuid references eval_plans(id) on delete set null,
  linked_journal_entry_id uuid references journal_entries(id) on delete set null,
  linked_checklist_id uuid references trade_checklists(id) on delete set null,

  -- Display identity.
  display_name_preference text not null default 'first_name_last_initial'
    check (display_name_preference in ('full_name', 'first_name_last_initial', 'username', 'anonymous')),
  display_name_snapshot text,               -- resolved once at submission so a later profile rename can't retroactively change an already-approved card
  is_anonymous boolean not null default false,

  -- Step 6: granular sharing consent — flat named booleans, every flag
  -- defaults false. Never combined into one vague checkbox, never
  -- pre-selected for marketing/publicity use.
  consent jsonb not null default '{"winWall":false,"communityFeature":false,"socialMedia":false,"websitePromo":false,"privateOnly":false}',
  consent_updated_at timestamptz,

  -- Moderation lifecycle.
  status text not null default 'draft' check (status in
    ('draft', 'submitted', 'under_review', 'approved', 'featured',
     'needs_changes', 'privately_received', 'rejected', 'archived')),
  member_visible_feedback text,             -- shown to the member (needs_changes / rejected)
  admin_notes text,                         -- internal only — never returned to a non-admin caller
  admin_id uuid references auth.users(id) on delete set null,
  is_verified boolean not null default false,  -- never implied true unless an admin actually set it

  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  featured_at timestamptz,
  published_at timestamptz,
  withdrawn_at timestamptz,
  archived_at timestamptz,
  gp_awarded_at timestamptz,                -- GP-dedupe guard, same pattern as journal_entries — awarded once, on first submit only

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists win_reactions (
  id uuid primary key default gen_random_uuid(),
  win_id uuid not null references win_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in
    ('love_this', 'proud_of_you', 'helped_me', 'inspired', 'same_breakthrough')),
  created_at timestamptz not null default now(),
  unique (win_id, user_id, reaction_type)   -- the real anti-spam mechanism: one active reaction of each type per member per win
);

create index if not exists idx_win_submissions_user_status on win_submissions(user_id, status);
create index if not exists idx_win_submissions_public on win_submissions(status, featured_at desc, approved_at desc)
  where status in ('approved', 'featured');
create index if not exists idx_win_reactions_win on win_reactions(win_id);
create index if not exists idx_win_reactions_user on win_reactions(user_id);

-- RLS as defense-in-depth, same rationale as every prior migration: every
-- API endpoint already scopes queries via the JWT-verified user.id using
-- the service-role key (and, for the public Win Wall specifically,
-- deliberately widens reads to any status in ('approved','featured')
-- regardless of owner — that widening happens in application code, not
-- here, so it stays an explicit, auditable exception rather than a
-- blanket-open policy).
alter table win_submissions enable row level security;
alter table win_reactions enable row level security;

create policy "Members manage their own win submissions" on win_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Members manage their own reactions" on win_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
