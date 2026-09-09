-- 0006_eval_calculator_and_accounts.sql — A Girl & Her Futures™
--
-- Adds the "Pass Your Eval Calculator" feature: trading_accounts (a real
-- account model — today account_id is just a free-text string on
-- journal_entries/trade_checklists, no backing table) and eval_plans (a
-- member's saved prop-firm evaluation plan with assumptions, calculated
-- once client-side and re-derivable any time, never re-invented server
-- side). Purely additive — does not alter, rename, or drop any existing
-- table or column, and does not touch any existing row anywhere.
--
-- current_balance/trading_days_elapsed on eval_plans are only ever written
-- by an explicit member "sync" action from the UI — never a silent side
-- effect of a journal/checklist save — so a plan's assumptions and its
-- real-world progress stay genuinely separate (never silently overwritten).
--
-- HOW TO APPLY: this sandbox has no Supabase credentials, so this file
-- could not be run automatically. Paste into the Supabase SQL editor (or
-- `supabase db push`) alongside 0001-0005 before the Eval Calculator will
-- work. Until applied, agihf/api/eval-data.js will fail with a clear
-- "relation does not exist" error surfaced in the UI, exactly like every
-- other endpoint in this project does.

create table if not exists trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  prop_firm text,
  account_size numeric,
  starting_balance numeric,
  is_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists eval_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trading_account_id uuid references trading_accounts(id) on delete set null,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'passed', 'failed', 'archived')),
  is_active boolean not null default false,

  -- Account setup — presets ($25K/$50K/$100K) are UI-only example values;
  -- is_custom_account marks a member-entered size, never presented as an
  -- official prop-firm rule.
  account_size numeric not null,
  is_custom_account boolean not null default false,
  starting_balance numeric not null,

  -- Evaluation rules, as the member enters/interprets them for her firm —
  -- never assumed uniform across prop firms.
  profit_target_type text check (profit_target_type in ('fixed_amount', 'percent')),
  profit_target_value numeric,
  drawdown_type text not null default 'unknown' check (drawdown_type in ('static', 'eod_trailing', 'intraday_trailing', 'other', 'unknown')),
  drawdown_value numeric, -- null exactly when drawdown_type = 'unknown' — never a fabricated fallback
  daily_loss_limit numeric,
  min_trading_days integer,
  max_trading_days integer,
  consistency_rule_pct numeric,

  -- Trading plan inputs.
  instrument text,
  manual_point_value numeric, -- override for a custom/unrecognized instrument, same fallback pattern as journal_entries
  contracts_planned integer,
  risk_mode text check (risk_mode in ('points', 'dollars')),
  risk_per_trade_value numeric,
  reward_per_trade_value numeric,
  planned_risk_reward_ratio numeric,
  assumed_win_rate_pct numeric,
  fees_per_trade numeric,
  max_trades_per_day integer,
  max_losses_per_day integer,
  stop_after_win boolean not null default false,
  reduce_size_after_loss boolean not null default false,
  reduce_size_after_loss_pct numeric,
  second_trade_contract_size integer,
  trading_days_per_week integer,

  -- Progress against the plan — only ever written by an explicit member
  -- "sync" action, never a silent side effect of a journal/checklist save.
  current_balance numeric,
  trading_days_elapsed integer not null default 0,

  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive, nullable — the existing free-text account_id columns on both
-- tables stay untouched for backward display compatibility; this just
-- gives a real account row something to link to going forward.
alter table journal_entries add column if not exists trading_account_id uuid references trading_accounts(id) on delete set null;
alter table trade_checklists add column if not exists trading_account_id uuid references trading_accounts(id) on delete set null;

create index if not exists idx_trading_accounts_user on trading_accounts(user_id);
create index if not exists idx_eval_plans_user on eval_plans(user_id);
create index if not exists idx_eval_plans_account on eval_plans(trading_account_id);

-- RLS as defense-in-depth, same rationale as every prior migration: every
-- API endpoint already scopes queries to the JWT-verified user.id via the
-- service-role key, so this is a second layer, not the only enforcement.
alter table trading_accounts enable row level security;
alter table eval_plans enable row level security;

create policy "Users manage their own trading accounts" on trading_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own eval plans" on eval_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
