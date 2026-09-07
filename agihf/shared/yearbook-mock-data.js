/**
 * yearbook-mock-data.js — A Girl & Her Futures™
 *
 * Placeholder yearbook entries (one per Phase) so the full Yearbook UI can
 * be built and demoed now. Reflections/ratings are mock data — real
 * persistence is explicitly deferred.
 */
export const ENTRY_DATA = {
  p1: { key: 'p1', title: 'Welcome to the Market', stars: 4, status: 'current',
    answer: "I thought trading was just guessing before this — now I'm reading behavior, not vibes." },
  p2: { key: 'p2', title: 'Understanding Structure', status: 'locked' },
  p3: { key: 'p3', title: 'Reading Price Like a Pro', status: 'locked' },
  p4: { key: 'p4', title: 'Finding Direction', status: 'locked' },
  p5: { key: 'p5', title: 'The Dayli ICC Method ✦', status: 'locked' },
  p6: { key: 'p6', title: 'Pulling the Trigger', status: 'locked' },
  p7: { key: 'p7', title: 'The Mindset Behind the Model', status: 'locked' },
  p8: { key: 'p8', title: "She's In Structure ✦", status: 'locked' },
};

export const PORTFOLIO_ITEMS = [
  { grade: 'Phase 1 — Chart Lab', desc: 'Marked HH→HL→HH→HL and LL→LH→LL→LH on a blank chart' },
  { grade: 'Phase 3 — Liquidity Exam', desc: 'Identified pools, sweeps, and internal vs external liquidity' },
  { grade: 'Phase 4 — Bias Card', desc: '4H story, 1H structure, key levels, location — all in one read' },
  { grade: 'Phase 5 — Dayli ICC Drills', desc: 'Identified PIL, Indication, Correction, Continuation and Retest across live sequences' },
  { grade: 'Phase 6 — Execution Log', desc: 'Entries, partials, and stop management across a week of live-chart drills' },
];
