/**
 * journal-service.js — A Girl & Her Futures™
 *
 * Wraps the existing `aghf_notes` localStorage array — written today by
 * three places (lesson-engine.js's reflection block, loop-engine.js's Say
 * It Back step, section-engine.js's Check-In step) but never read back
 * anywhere. This is the first reader: journal.html and the dashboard's
 * Quick Journal card both go through here rather than a new data store,
 * so existing lesson/section entries show up in the journal immediately.
 *
 * Also adds two new entry types — 'premarket' and 'postmarket' — for the
 * dashboard's own Quick Journal prompts, written through the same key/
 * shape so everything lives in one place.
 */

const KEY = 'aghf_notes';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

/** Existing writers didn't stamp a `type` — infer one so old entries still group correctly. */
function normalize(entry, idx) {
  let type = entry.type;
  if (!type) {
    type = entry.sectionId ? 'checkin' : entry.lessonId ? 'lesson' : 'premarket';
  }
  return { id: entry.id || `n_${entry.savedAt || Date.now()}_${idx}`, ...entry, type };
}

/**
 * @param {{ type?: import('./dashboard-models.js').JournalEntryType }} [filter]
 * @returns {import('./dashboard-models.js').JournalEntry[]} newest first
 */
export function getEntries(filter = {}) {
  const all = readAll().map(normalize).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0) || 0);
  if (!filter.type) return all;
  return all.filter((e) => e.type === filter.type);
}

/**
 * @param {{ type: import('./dashboard-models.js').JournalEntryType, prompt: string, text: string }} entry
 * @returns {import('./dashboard-models.js').JournalEntry}
 */
export function addEntry(entry) {
  const entries = readAll();
  const full = { id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, savedAt: Date.now(), ...entry };
  entries.push(full);
  writeAll(entries);
  return full;
}

export const QUICK_JOURNAL_PROMPTS = {
  premarket: [
    'What must price confirm before you are allowed to enter today?',
    'What would make today’s plan invalid before you even take a trade?',
  ],
  postmarket: [
    'Did you trade what price confirmed — or what you expected?',
    'What did you execute well today?',
  ],
};
