-- 0002_journal_streak.sql — A Girl & Her Futures™
--
-- Adds journaling-streak tracking to profiles, independent of the
-- academy's existing day_streak/last_active (lesson-completion streak).
-- Purely additive: no existing column touched, no row modified.
--
-- HOW TO APPLY: same as 0001 — this sandbox has no Supabase credentials,
-- so paste into the Supabase SQL editor (or `supabase db push`) alongside
-- 0001 before deploying the new Trade Journal.

alter table profiles
  add column if not exists journal_streak integer not null default 0,
  add column if not exists journal_last_entry_date date;
