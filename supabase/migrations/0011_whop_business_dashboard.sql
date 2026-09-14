-- 0011_whop_business_dashboard.sql — A Girl & Her Futures™
--
-- Backs "Whop Dashboard" (the whop-dashboard/ app at this repo's root — a
-- standalone site, fully separate from the AGHF academy in agihf/, with
-- its own login and its own Vercel deployment) that answers the question
-- the site owner keeps losing track of inside Whop's own UI: how many
-- members are active right now, who joined/fell off recently, and how
-- much money is actually coming in today/this week/this month. This is
-- entirely separate from the existing Stripe `subscriptions` table
-- (0001-era, used by agihf/) — Whop is a different, unrelated
-- payment/membership platform this project has never integrated with
-- before, so nothing here touches `subscriptions`, `profiles`, or any
-- other existing table. The two apps share only this one Supabase project
-- and these tables — no code, no deployment, no login.
--
-- Two ways data lands here, both server-only (via the service-role key in
-- whop-dashboard/api/ — never from the browser):
--   1. Whop webhooks (real-time, the primary source of truth going
--      forward) — every membership/payment event Whop sends is appended to
--      whop_member_events, and whop_members/whop_payments are upserted from
--      the event payload.
--   2. A manual/periodic "Sync now" pull from the Whop REST API
--      (reconciliation + one-time backfill of members who joined before
--      the webhook existed) — same upsert targets, tracked in
--      whop_sync_state so the dashboard can show "last synced at".
--
-- whop_member_events is deliberately append-only and never rewritten —
-- it's the actual source for "new members this week" / "churned this
-- week" trend queries, so a later snapshot overwrite of whop_members can
-- never erase that history.
--
-- HOW TO APPLY: paste into the Supabase SQL editor (or `supabase db push`)
-- alongside 0001-0010. Until applied, whop-dashboard/api/dashboard.js and
-- sync.js will fail with a clear "relation does not exist" error surfaced
-- in the dashboard UI, same convention as every prior migration.

/* ── whop_members (current-state snapshot, one row per Whop membership) ── */

create table if not exists whop_members (
  id text primary key,                    -- Whop membership id (e.g. "mem_...") — the natural key, never regenerated
  whop_user_id text,
  email text,
  username text,
  product_id text,
  product_name text,
  plan_id text,
  status text,                            -- Whop's own status string (active, trialing, past_due, canceled, expired, ...), stored verbatim
  valid boolean not null default false,   -- Whop's own "valid" flag — the actual "counts as an active member" signal used everywhere below
  renewal_period_start timestamptz,
  renewal_period_end timestamptz,
  joined_at timestamptz,                  -- membership created_at, from Whop
  cancelled_at timestamptz,
  expires_at timestamptz,
  last_event_type text,                   -- most recent webhook event that touched this row, for debugging
  last_synced_at timestamptz not null default now(),
  raw jsonb,                              -- full raw Whop payload, kept as-is so a field we didn't anticipate is never lost
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_whop_members_valid on whop_members(valid);
create index if not exists idx_whop_members_email on whop_members(email);

/* ── whop_payments (one row per Whop payment, the revenue ledger) ──────── */

create table if not exists whop_payments (
  id text primary key,                    -- Whop payment id
  membership_id text references whop_members(id) on delete set null,
  whop_user_id text,
  email text,
  amount numeric,                         -- dollars (Whop amounts are converted from cents at write time)
  currency text,
  status text,                            -- succeeded, refunded, failed, pending, ...
  product_id text,
  plan_id text,
  paid_at timestamptz,                    -- when the payment actually settled — the column every revenue rollup groups on
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_whop_payments_paid_at on whop_payments(paid_at);
create index if not exists idx_whop_payments_status_paid_at on whop_payments(status, paid_at);

/* ── whop_member_events (append-only event log — the join/churn trend
   source; never updated or overwritten once inserted) ──────────────────── */

create table if not exists whop_member_events (
  id uuid primary key default gen_random_uuid(),
  membership_id text,
  event_type text not null check (event_type in (
    'joined', 'renewed', 'cancelled', 'expired', 'reactivated',
    'payment_succeeded', 'payment_failed', 'payment_refunded'
  )),
  occurred_at timestamptz not null default now(),
  amount numeric,
  email text,
  whop_event_id text,                     -- Whop's own webhook-id header, for de-dup / audit trail
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_whop_member_events_occurred_at on whop_member_events(occurred_at desc);
create index if not exists idx_whop_member_events_type_occurred_at on whop_member_events(event_type, occurred_at desc);

-- A given Whop webhook delivery is never double-counted even if Whop
-- retries it (Standard Webhooks delivery can repeat) — enforced by
-- Postgres via ON CONFLICT DO NOTHING at insert time, not application logic.
create unique index if not exists idx_whop_member_events_dedup
  on whop_member_events(whop_event_id) where whop_event_id is not null;

/* ── whop_sync_state (single-row bookkeeping for the "Sync now" button) ── */

create table if not exists whop_sync_state (
  id boolean primary key default true check (id),  -- singleton row
  last_synced_at timestamptz,
  last_sync_status text,                  -- 'success' | 'error'
  last_sync_error text,
  last_sync_members_count integer,
  last_sync_payments_count integer,
  updated_at timestamptz not null default now()
);

insert into whop_sync_state (id) values (true) on conflict (id) do nothing;

/* ── RLS — same defense-in-depth rationale as every prior migration: every
   read/write to these tables goes exclusively through whop-dashboard/api/
   using the service-role key (the webhook endpoint needs no session at
   all; dashboard/sync re-check the single-password session cookie server-
   side on every call — see whop-dashboard/api/_lib/session.js). No public
   policies are created — an ordinary authenticated AGHF member has zero
   direct access to Whop member/payment data via the anon/authenticated
   Supabase roles, and neither app exposes these tables to the browser. ── */

alter table whop_members enable row level security;
alter table whop_payments enable row level security;
alter table whop_member_events enable row level security;
alter table whop_sync_state enable row level security;
