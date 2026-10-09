-- 0013_waitlist.sql — A Girl & Her Futures™
--
-- Launch waitlist. One row per email address, written only by
-- api/join-waitlist.js with the service key. Row-level security is on with
-- no policies, so the public anon key can neither read nor write the list.
--
-- HOW TO APPLY: paste into the Supabase SQL editor (or `supabase db push`)
-- for this project. Until applied, the waitlist form shows a friendly
-- "try again soon" message instead of saving.

create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  first_name  text not null,
  journey     text,          -- where she is in her trading journey (optional)
  heard_from  text,          -- how she heard about AGHF (optional)
  source      text,          -- ?src= from the link she followed, e.g. tiktok
  created_at  timestamptz not null default now()
);

create unique index if not exists idx_waitlist_email on waitlist (lower(email));
create index if not exists idx_waitlist_created on waitlist (created_at desc);

alter table waitlist enable row level security;
