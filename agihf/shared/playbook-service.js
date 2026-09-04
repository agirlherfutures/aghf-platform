/**
 * playbook-service.js — A Girl & Her Futures™
 *
 * Reads the existing `aghf_playbook` localStorage array (written by
 * loop-engine.js's Save It step, never read back anywhere until now).
 * playbook.html is its first real reader.
 */

const KEY = 'aghf_playbook';

/** @returns {{lessonId: string, title: string, checklist: string[], remember: string, savedAt: number}[]} newest first */
export function getPlaybookCards() {
  let all = [];
  try {
    all = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { /* leave as [] */ }
  return all.slice().sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
}
