// db-error.js — shared "is this error just an unmigrated/not-yet-cached
// Supabase table" detector, used by every API file's own notSetUpError-style
// wrapper (each of which keeps its own migration-filename-specific message).
//
// Matches two distinct real message shapes for the same underlying
// situation: the raw Postgres error when a table/column genuinely doesn't
// exist ("relation ... does not exist"), and PostgREST's own schema-cache
// error ("Could not find the table/column '...' in the schema cache") —
// the shape you get right after a migration runs but Supabase's API layer
// hasn't reloaded its cache yet, distinct from "never ran the migration at
// all" but requiring the same fix either way.
export function isDbNotSetUp(err) {
  return /relation .* does not exist|schema cache/i.test(err?.message || '');
}
