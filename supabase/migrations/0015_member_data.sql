-- 0015_member_data.sql: A Girl & Her Futures™
--
-- Account-backed storage for a member's own saved data that used to live
-- only in her browser (starting with My AGHF Rulebook), so it follows her
-- across devices. One row per member per key; the value is the same JSON
-- the page already keeps in localStorage. Read and written only through
-- api/psychology-data.js (?resource=member-data) with the service role,
-- scoped to the signed-in member and to an allowlist of keys.
--
-- HOW TO APPLY: paste into the Supabase SQL editor (or `supabase db push`)
-- for this project. Until it is applied, saving to the account fails
-- quietly and the Rulebook keeps working in the browser exactly as before.

create table if not exists member_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table member_data enable row level security;
-- No policies: only the service role (the API) reads or writes this table.
