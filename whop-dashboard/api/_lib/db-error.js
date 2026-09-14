// Matches two distinct real message shapes for the same underlying
// situation: the raw Postgres error when a table genuinely doesn't exist
// ("relation ... does not exist"), and PostgREST's own schema-cache error
// ("Could not find the table/column '...' in the schema cache") — the
// shape you get right after a migration runs but Supabase's API layer
// hasn't reloaded its cache yet.
export function isDbNotSetUp(err) {
  return /relation .* does not exist|schema cache/i.test(err?.message || '');
}
