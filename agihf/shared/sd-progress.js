/**
 * sd-progress.js — A Girl & Her Futures™
 * Strategy Lab progress. Kept completely separate from the Academy curriculum:
 * it never writes to lessons_completed, GP, level, section clears or graduation.
 *
 * Stored in this browser (localStorage), like the Trader Desk and section
 * checkpoints. Every record carries the STRATEGY_VERSION it was completed
 * under, so a later rule change can tell which work was graded on old rules.
 *
 *   { v: 1, lessons: { 'm1-3': { at, version } }, tools: { zone: {...}, exec: {...} } }
 */
import { STRATEGY_VERSION } from './sd-core.js';

const KEY = 'aghf_strategy_lab_v1';

export function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && d.v === 1) return { lessons: {}, tools: {}, ...d };
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return { v: 1, lessons: {}, tools: {} };
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode: progress lasts this visit only */ }
}

export function recordLesson(id) {
  const d = load();
  if (!d.lessons[id]) d.lessons[id] = { at: new Date().toISOString(), version: STRATEGY_VERSION };
  save(d);
}
export function recordTool(name, result) {
  const d = load();
  const prev = d.tools[name] || { runs: 0 };
  d.tools[name] = { ...prev, done: true, runs: prev.runs + 1, last: { ...result, at: new Date().toISOString() }, version: STRATEGY_VERSION };
  save(d);
}
export const lessonDone = (id) => !!load().lessons[id];
export const toolDone = (name) => !!load().tools[name]?.done;

/** Strategy Lab unlocks when every Phase 5 lesson is complete. */
export function phase5Complete(completedIds, PHASES) {
  const p5 = PHASES.find((p) => p.key === 'p5');
  if (!p5) return false;
  const ids = p5.sections.flatMap((s) => s.lessons.filter((l) => l.n).map((l) => `p5-${l.n}`));
  return ids.length > 0 && ids.every((id) => completedIds.has(id));
}
