-- 0009_chart_lab.sql — A Girl & Her Futures™
--
-- Replaces the "Chart Lab is coming soon" placeholder with a real,
-- interactive chart-reading practice system built around the Dayli ICC
-- Method: static-chart drills (Spot It / Valid or Invalid / What Phase Is
-- Price In? / Candle Close or Wick? / Sequence Builder / Choose the Best
-- Decision), per-member mastery tracking by skill, practice sessions
-- (Daily Drill / Focus Practice / Mixed Review), and an admin-only drill
-- builder so new drills never require a code change.
--
-- Purely additive. Nothing here touches profiles.gp/level/streaks,
-- lessons_completed, journal_entries, trade_checklists, or any other
-- existing table — GP is awarded by chartlab-data.js the same way every
-- other feature this session awards it (an UPDATE to profiles.gp guarded
-- by a dedupe check against chart_lab_attempts, never a second system).
--
-- Scoring is 100% deterministic server-side (coordinate/zone tolerance
-- checks, exact/partial sequence comparison, exact-choice comparison) —
-- Gemini is never asked to judge whether a visual answer is correct; it
-- may only explain an already-scored attempt (see agent-context-builder.js).
--
-- No new Storage bucket is needed — admin-uploaded chart images reuse the
-- existing "win-media" bucket (created for 0007) under a new "chartlab/"
-- path prefix, same base64-data-URL upload pattern already proven for
-- prize images / win media / journal screenshots.
--
-- profiles.is_admin (added in 0007) is reused as the only admin gate here
-- too — no new admin/role mechanism.
--
-- Chart REPLAY mode (revealing one candle at a time) is intentionally NOT
-- built this pass — chart_format/ohlc columns below reserve the shape for
-- it, but only 'static_image' drills are implemented in chartlab-data.js
-- right now. Likewise 'mark_the_chart' (multi-tool annotation) and
-- 'full_breakdown' (multi-field top-down analysis) are reserved drill_type
-- values with no builder/player UI yet — flagged explicitly, not silently
-- dropped.
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001-0008 before Chart Lab will work.
-- Until applied, agihf/api/chartlab-data.js fails with the same clear
-- "hasn't been set up yet" message every other endpoint in this project
-- already surfaces.

create table if not exists chart_lab_drills (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  drill_type text not null check (drill_type in (
    'spot_it', 'valid_invalid', 'phase_id', 'candle_close_wick',
    'sequence_builder', 'best_decision', 'mark_the_chart', 'full_breakdown'
  )),
  skill_category text not null check (skill_category in (
    'market_bias', 'market_structure', 'swing_points', 'external_range',
    'pil_selection', 'liquidity', 'consolidation', 'icc_sequence',
    'indication', 'correction', 'continuation', 'retest_entry',
    'invalidation', 'wait_or_pass', 'full_breakdown'
  )),
  difficulty text not null default 'foundation' check (difficulty in ('foundation', 'developing', 'applied', 'full_breakdown')),
  access_tier text not null default 'free' check (access_tier in ('free', 'premium')),
  practice_mode text not null default 'open_practice' check (practice_mode in (
    'open_practice', 'recommended_practice', 'required_practice', 'lesson_check', 'phase_assessment'
  )),
  phase_key text,          -- curriculum-data.js phase key, e.g. 'p1' (static JS curriculum, not an FK)
  section_key text,        -- curriculum-data.js section key, e.g. 's3'
  lesson_key text,         -- curriculum-data.js lesson id, e.g. 'p1-14'
  instrument text default 'MNQ',
  timeframe text,
  historical_date date,    -- shown only when appropriate; null is fine and common
  chart_format text not null default 'static_image' check (chart_format in ('static_image', 'ohlc_data')),
  chart_image_path text,   -- win-media storage path, "chartlab/{drillId}/{filename}"
  chart_image_width int,
  chart_image_height int,
  chart_alt_text text,     -- accessible description of the chart for screen readers
  question text not null,
  estimated_seconds int default 60,
  related_next_drill_id uuid references chart_lab_drills(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version int not null default 1,
  is_seed_placeholder boolean not null default false, -- true = clearly-labeled dev/seed content awaiting a real chart
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists idx_chart_lab_drills_status_skill on chart_lab_drills(status, skill_category);

-- One row per (drill_id, version) — editing a published drill's answer key
-- bumps chart_lab_drills.version and inserts a NEW row here rather than
-- mutating the old one, so a member's already-completed attempt (which
-- stores the drill_version it was scored against) never silently changes
-- meaning after the fact.
create table if not exists chart_lab_answer_keys (
  id uuid primary key default gen_random_uuid(),
  drill_id uuid not null references chart_lab_drills(id) on delete cascade,
  drill_version int not null,
  answer_type text not null check (answer_type in ('point', 'zone', 'choice', 'sequence')),
  choices jsonb not null default '[]',     -- [{key,label}] for choice-type drills
  correct_choice text,                     -- the correct choices[].key
  correct_sequence text[],                 -- ordered keys for sequence_builder
  zones jsonb not null default '[]',       -- [{x,y,radius,label,credit:'full'|'partial'}] — x/y/radius normalized 0-1
  explanation text not null default '',
  common_mistake text,
  hints text[] not null default '{}',
  related_rule text,                       -- plain-language reference into checklist-template.js's GOLDEN_RULE/WALK_AWAY_CONDITIONS, never a fabricated rule
  created_at timestamptz not null default now(),
  unique (drill_id, drill_version)
);

create table if not exists chart_lab_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null check (session_type in ('daily', 'focus', 'mixed_review', 'full_breakdown')),
  current_focus_source text,               -- 'current_focus' | 'journal' | 'checklist' | 'academy_progression' | 'member_selected' | null
  skill_category text,                     -- set for 'focus' sessions
  drill_ids uuid[] not null default '{}',
  current_position int not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_chart_lab_sessions_user_status on chart_lab_sessions(user_id, status);

create table if not exists chart_lab_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drill_id uuid not null references chart_lab_drills(id) on delete cascade,
  drill_version int not null,
  session_id uuid references chart_lab_sessions(id) on delete set null,
  member_answer jsonb not null default '{}',
  score int not null default 0,            -- 0-100
  result text not null check (result in ('correct', 'partial', 'review_needed')),
  hints_used int not null default 0,
  attempt_number int not null default 1,
  gp_awarded int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);

create index if not exists idx_chart_lab_attempts_user_drill on chart_lab_attempts(user_id, drill_id);
create index if not exists idx_chart_lab_attempts_user_completed on chart_lab_attempts(user_id, completed_at desc);

-- One row per (user, skill) — mastery_state only ever advances/decays via
-- configurable thresholds in _lib/chartlab-mastery.js, never after a
-- single correct answer, and gently decays to 'review_recommended' after
-- disuse rather than resetting to 'new' (an achievement is never erased).
create table if not exists chart_lab_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_category text not null,
  mastery_state text not null default 'new' check (mastery_state in (
    'new', 'practicing', 'developing', 'confident', 'mastered', 'review_recommended'
  )),
  accuracy numeric,
  recent_accuracy numeric,                 -- last N attempts only
  attempts int not null default 0,
  hint_usage int not null default 0,
  last_practiced_at timestamptz,
  review_due_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_category)
);

create table if not exists chart_lab_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drill_id uuid not null references chart_lab_drills(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved')),
  admin_response text,
  created_at timestamptz not null default now()
);

alter table chart_lab_drills enable row level security;
alter table chart_lab_answer_keys enable row level security;
alter table chart_lab_sessions enable row level security;
alter table chart_lab_attempts enable row level security;
alter table chart_lab_mastery enable row level security;
alter table chart_lab_reports enable row level security;

-- Defense-in-depth only — the real enforcement is chartlab-data.js always
-- scoping every query to the verified user.id (or, for drills/answer keys,
-- to status='published') using the service-role key server-side, matching
-- every other table in this project.
create policy "read published drills" on chart_lab_drills for select using (status = 'published');
create policy "manage own answer key reads" on chart_lab_answer_keys for select using (true);
create policy "manage own sessions" on chart_lab_sessions for all using (auth.uid() = user_id);
create policy "manage own attempts" on chart_lab_attempts for all using (auth.uid() = user_id);
create policy "manage own mastery" on chart_lab_mastery for all using (auth.uid() = user_id);
create policy "manage own reports" on chart_lab_reports for all using (auth.uid() = user_id);
