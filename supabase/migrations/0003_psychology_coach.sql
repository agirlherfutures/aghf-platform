-- 0003_psychology_coach.sql — A Girl & Her Futures™
--
-- Adds The Inner Edge (Psychology Coach) tables: psychology_profiles,
-- psychology_sessions, psychology_playbook_items, psychology_patterns,
-- psychology_scenario_attempts, weekly_psychology_reviews. Purely
-- additive — does not alter, rename, or drop any existing table, and
-- does not touch any existing row anywhere.
--
-- Scenario content itself (title/situation/options/feedback) is NOT a
-- table — it lives in agihf/shared/psychology-scenarios-data.js as
-- versioned static content, matching curriculum-data.js's convention.
-- psychology_scenario_attempts references a scenario by its static id
-- (text), not a foreign key, so a scenario can be edited/renumbered in
-- code without a migration.
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001/0002 before the Psychology Coach
-- pages will work. Until applied, agihf/api/psychology-*.js will fail
-- with a clear "relation does not exist" error surfaced in the UI,
-- exactly like the existing checklist/journal endpoints do.

create table if not exists psychology_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coaching_tone text not null default 'gentle' check (coaching_tone in ('gentle', 'direct', 'accountability', 'teach_me', 'reset_me')),
  personalization_enabled boolean not null default true,
  consent jsonb not null default '{"tradeData":true,"checklistAnswers":true,"journalStructured":true,"journalFreetext":true,"emotions":true,"sessionHistory":true,"playbook":true,"academyProgress":true}',
  current_focus text,
  current_focus_body text,
  current_focus_source text check (current_focus_source in ('rules', 'member')), -- never 'ai' until Phase 3
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists psychology_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('talk_me_through', 'pre_trade_check', 'post_loss_reset', 'scenario', 'weekly_review', 'ask_question')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  save_preference text not null default 'save' check (save_preference in ('save', 'one_time')),
  trigger_category text,
  linked_trade_id uuid references journal_entries(id) on delete set null,
  linked_checklist_id uuid references trade_checklists(id) on delete set null,
  structured_responses jsonb not null default '{}',
  readiness_result text,
  rules_triggered text[] not null default '{}',
  ai_summary text,             -- unused until Phase 3 (AI coaching); always null from rules-only flows
  recommended_action text,
  member_selected_action text,
  member_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists psychology_playbook_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,     -- see PLAYBOOK_CATEGORIES in dashboard-models.js
  title text not null,
  content text not null,
  source_type text not null default 'manual' check (source_type in ('manual', 'session', 'pattern_mirror')),
  source_record_id uuid,
  pinned boolean not null default false,
  ai_access_permission boolean not null default true,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists psychology_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_type text not null,
  evidence_window jsonb not null default '{}',
  supporting_record_ids uuid[] not null default '{}',
  evidence_count integer not null default 0,
  evidence_strength text not null default 'not_enough_data' check (evidence_strength in ('early_signal', 'emerging', 'repeating', 'strong', 'not_enough_data')),
  rules_findings jsonb not null default '{}',
  ai_interpretation text,      -- unused until Phase 4
  member_confirmation text check (member_confirmation in ('accurate', 'partly', 'not_accurate', 'need_more_data')),
  status text not null default 'active' check (status in ('active', 'dismissed', 'saved_to_playbook')),
  recommended_lesson_id text,
  recommended_chart_lab_id text,
  recommended_prompt text,
  generated_at timestamptz not null default now(),
  dismissed_at timestamptz
);

create table if not exists psychology_scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,   -- references PSYCHOLOGY_SCENARIOS[].id (static content)
  selected_response_id text,
  written_reasoning text,
  feedback_shown text,
  process_score integer check (process_score between 0 and 100),
  reflection text,
  completed_at timestamptz not null default now()
);

create table if not exists weekly_psychology_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  evidence_summary jsonb not null default '{}',
  strongest_behavior text,
  frequent_trigger text,
  emerging_pattern text,
  hidden_win text,
  suggested_focus text,
  accepted_focus text,
  recommended_lesson_id text,
  recommended_scenario_id text,
  journal_prompt text,
  behavioral_goal text,
  member_feedback text,
  created_at timestamptz not null default now()
);

create index if not exists idx_psychology_sessions_user_created on psychology_sessions(user_id, created_at desc);
create index if not exists idx_psychology_playbook_user on psychology_playbook_items(user_id, is_archived, sort_order);
create index if not exists idx_psychology_patterns_user_status on psychology_patterns(user_id, status);
create index if not exists idx_psychology_scenario_attempts_user on psychology_scenario_attempts(user_id, completed_at desc);
create index if not exists idx_weekly_reviews_user_week on weekly_psychology_reviews(user_id, week_start desc);

-- RLS as defense-in-depth, matching 0001's rationale: every API endpoint
-- already scopes queries to the JWT-verified user.id via the service-role
-- key, so this is a second layer, not the only enforcement.
alter table psychology_profiles enable row level security;
alter table psychology_sessions enable row level security;
alter table psychology_playbook_items enable row level security;
alter table psychology_patterns enable row level security;
alter table psychology_scenario_attempts enable row level security;
alter table weekly_psychology_reviews enable row level security;

create policy "Users manage their own psychology profile" on psychology_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own psychology sessions" on psychology_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own playbook items" on psychology_playbook_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own patterns" on psychology_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own scenario attempts" on psychology_scenario_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own weekly reviews" on weekly_psychology_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
