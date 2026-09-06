-- 0001_checklist_and_journal.sql — A Girl & Her Futures™
--
-- Adds the Dayli ICC Trade Checklist and AG&HF Trade Journal tables.
-- Purely additive: does not alter, rename, or drop any existing table
-- (profiles, lessons_completed, subscriptions) and does not touch any
-- existing row anywhere.
--
-- HOW TO APPLY: this repo's sandbox has no Supabase credentials, so this
-- file could not be run automatically. Paste its contents into the
-- Supabase SQL editor for this project (or run via `supabase db push`
-- with the CLI linked to the project) before the new /checklist and
-- /journal pages will work. Until it's applied, agihf/api/checklists.js
-- and agihf/api/journal-entries.js will fail with a clear
-- "relation does not exist" error surfaced in the UI rather than a silent
-- failure — see the empty/error states in checklist.html/journal.html.
--
-- Also requires a private Supabase Storage bucket named
-- "journal-screenshots" (create via Supabase dashboard → Storage → New
-- bucket → uncheck "Public bucket"). No SQL creates storage buckets.

create extension if not exists pgcrypto; -- for gen_random_uuid()

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid,
  entry_type text not null default 'trade' check (entry_type in ('trade', 'premarket_reflection', 'postmarket_reflection')),
  prompt text,        -- the rotating prompt shown for premarket_reflection/postmarket_reflection entries; null for trades
  account_id text,
  trade_number integer,
  trade_date date not null default current_date,
  session text,
  instrument text,
  direction text check (direction in ('long', 'short')),
  contracts integer,
  execution_timeframe text default '1m',
  setup_type text,
  setup_quality_score integer check (setup_quality_score between 1 and 5),
  trade_style text,
  sniper_score text,
  screenshot_notes text,
  entry_price numeric,
  entry_time timestamptz,
  stop_loss numeric,
  take_profit numeric,
  planned_risk numeric,
  actual_risk numeric,
  fees numeric,
  exits jsonb not null default '[]',
  gross_pnl numeric,
  net_pnl numeric,
  r_multiple numeric,
  outcome text check (outcome in ('win', 'loss', 'breakeven')),
  outcome_override text check (outcome_override in ('win', 'loss', 'breakeven')),
  bias_4h text,
  structure_1h text,
  pil text,
  icc_phase text,
  method_quality_tags text[] not null default '{}',
  rule_violations text[] not null default '{}',
  screenshots jsonb not null default '[]',
  entry_reasoning text,
  exit_reasoning text,
  lessons text,
  emotions jsonb not null default '{}',
  execution_rating integer check (execution_rating between 1 and 5),
  structure_insight text,
  one_sentence_takeaway text,
  final_reflection text,
  is_draft boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trade_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text,
  trading_date date not null default current_date,
  session text,
  instrument text not null default 'MNQ',
  template_version integer not null default 1,
  market_context jsonb not null default '{}',
  items jsonb not null default '[]',
  current_phase text not null default 'market_context',
  completion_pct integer not null default 0,
  readiness_status text not null default 'not_ready',
  final_decision text check (final_decision in ('clean', 'wait', 'pass')),
  linked_journal_entry_id uuid references journal_entries(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table journal_entries
  add constraint journal_entries_checklist_id_fkey
  foreign key (checklist_id) references trade_checklists(id) on delete set null;

create index if not exists idx_journal_entries_user_date on journal_entries(user_id, trade_date desc);
create index if not exists idx_journal_entries_user_type on journal_entries(user_id, entry_type);
create index if not exists idx_trade_checklists_user_date on trade_checklists(user_id, trading_date desc);

-- Row Level Security: the API endpoints already scope every query to the
-- JWT-verified user.id using the service-role key (same pattern as
-- get-profile.js/complete-lesson.js), so RLS is a defense-in-depth layer,
-- not the only enforcement. Enabling it costs nothing and matches best
-- practice for tables reachable by a service-role key.
alter table journal_entries enable row level security;
alter table trade_checklists enable row level security;

create policy "Users manage their own journal entries" on journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own checklists" on trade_checklists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
