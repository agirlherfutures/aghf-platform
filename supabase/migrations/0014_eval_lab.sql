-- 0014_eval_lab.sql: A Girl & Her Futures™
--
-- Adds one column to eval_plans for the Evaluation Lab (Pass Your Eval):
-- the student's commitments, personal regimen, pre-session check-ins,
-- logged sessions (P&L and whether she followed her plan) and her
-- readiness review answers, stored together as JSON on the plan they
-- belong to. Purely additive; no existing row or column changes.
--
-- HOW TO APPLY: paste into the Supabase SQL editor (or `supabase db push`)
-- for this project. Until it is applied, api/eval-data.js saves plans
-- without this column and the page keeps the Lab data in the browser, so
-- nothing breaks for members in the meantime.

alter table eval_plans add column if not exists lab jsonb;
