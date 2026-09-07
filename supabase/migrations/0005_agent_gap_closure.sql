-- 0005_agent_gap_closure.sql — A Girl & Her Futures™
--
-- Purely additive, closes 3 gaps found during the AGHF Agent spec audit:
-- a real "Save an insight" category, per-user daily rate limiting, and
-- per-record exclusion from the agent's analysis. Does not alter, rename,
-- or drop any existing column, and does not touch any existing row.
--
-- HOW TO APPLY: same as 0001-0004 — this sandbox has no live Supabase
-- credentials, so paste into the Supabase SQL editor (or `supabase db
-- push`) alongside the prior 4 migrations before these features work.

-- "Save an insight" (message action in the AGHF Agent chat) persists as a
-- plain agent_memory row — reuses the existing memory panel/API as-is,
-- just needs its own category so it can be grouped separately from
-- "what the agent remembers about me."
alter table agent_memory drop constraint if exists agent_memory_category_check;
alter table agent_memory add constraint agent_memory_category_check check (category in
  ('coaching_style', 'current_focus', 'confirmed_trigger', 'walk_away_rule', 'if_then_rule',
   'reset_routine', 'playbook_reference', 'confirmed_pattern', 'goal', 'saved_insight'));

-- Per-user daily cap on AI-invoking AGHF Agent turns — deterministic,
-- checked/incremented in agihf/api/agent-chat.js before the one model
-- call, resets on a rolling day-boundary the same way journal_streak's
-- day-rollover already works elsewhere in this codebase.
alter table psychology_profiles
  add column if not exists agent_requests_today int not null default 0,
  add column if not exists agent_requests_reset_at timestamptz;

-- Per-record "exclude from AGHF Agent analysis" — a member-set flag,
-- distinct from the coarser category-level consent toggles already on
-- psychology_profiles.consent. Filtered out in
-- agihf/api/_lib/agent-context-builder.js's fetchTradesInRange /
-- fetchChecklistsFor before anything reaches the model.
alter table journal_entries add column if not exists excluded_from_agent boolean not null default false;
alter table trade_checklists add column if not exists excluded_from_agent boolean not null default false;
