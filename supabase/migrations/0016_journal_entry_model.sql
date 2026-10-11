-- 0016_journal_entry_model.sql — A Girl & Her Futures™
--
-- The setup a member traded and the entry rules she checked, picked in the
-- journal's "Why did you enter?" step:
--   { "setup": "icc" | "snd" | "other", "name": "My setup", "steps": { "bos1": true, ... }, "pointValue": 2 }
-- Dayli ICC entries also keep writing icc_checklist, so existing stats and
-- filters are unchanged. pointValue holds the point value for an instrument
-- the member typed in herself.

alter table public.journal_entries add column if not exists entry_model jsonb;
