-- 0012_lesson_checkin_reflections.sql — A Girl & Her Futures™
--
-- Brings lesson-reflection ("Tell me what you know") and section
-- check-in entries into the server-backed journal_entries table
-- (0001_checklist_and_journal.sql) instead of leaving them stuck in the
-- browser-only `aghf_notes` localStorage array, where a member's own
-- reflections vanished the moment she switched devices or cleared site
-- data. Purely additive: widens the existing entry_type check constraint
-- and adds one nullable column; no existing row or column is touched.
--
-- HOW TO APPLY: same as 0001 — paste into the Supabase SQL editor (or
-- `supabase db push`) for this project. Until applied, saving a lesson
-- reflection to the server fails with a normal API error and the caller
-- falls back to the existing localStorage-only save, so nothing breaks
-- for members on an unmigrated database.

alter table journal_entries
  drop constraint if exists journal_entries_entry_type_check;

alter table journal_entries
  add constraint journal_entries_entry_type_check
  check (entry_type in (
    'trade', 'premarket_reflection', 'postmarket_reflection',
    'lesson_reflection', 'checkin_reflection'
  ));

-- Which lesson (e.g. "p1-4") or section (e.g. "p1-s1") the reflection
-- belongs to. Null for every other entry_type.
alter table journal_entries add column if not exists lesson_id text;

create index if not exists idx_journal_entries_lesson_id
  on journal_entries(user_id, lesson_id) where lesson_id is not null;
