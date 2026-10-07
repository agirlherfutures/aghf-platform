/**
 * trigger-core.js — A Girl & Her Futures™
 *
 * Phase 6 · Pulling the Trigger: the decision layer on top of the Dayli ICC
 * engine (icc-core.js). Phase 5 asked "what stage is ICC in?". Phase 6 asks
 * "SHOULD I ACT?", so every read here keeps two things apart:
 *
 *   MODEL STATE      what price has confirmed (PIL, I, C, C, retest)
 *   TRADER ACTION    what she should do right now (WAIT, PREPARE, ENTER, PASS, REASSESS)
 *
 * The student can read the chart correctly and still act incorrectly; this
 * module is what lets the simulator tell those apart.
 *
 * EDUCATIONAL behavior scoring only. Nothing here is a trading signal, and
 * nothing here grades a person: it counts decisions ("you acted before
 * confirmation 3 times"), never identity.
 */

import { evaluateDayliICC } from './icc-core.js';

/** Execution status: "should I act?", not just "what stage is ICC in?". */
export const XS = {
  NOT_READY: 'not-ready',   // pre-entry card incomplete (e.g. PIL undefined)
  WAITING: 'waiting',       // PIL set, nothing confirmed yet
  DEVELOPING: 'developing', // something is forming: I, or I + C
  CONFIRMED: 'confirmed',   // I · C · C closed. Not executable until the retest
  EXECUTABLE: 'executable', // the first valid retest is present, setup still active
  MISSED: 'missed',         // the opportunity came and went (or price ran without a retest)
  PASSED: 'passed',         // she chose not to participate
  INVALID: 'invalid',       // the model failed / structure broke
  REASSESS: 'reassess',     // new information changed the active sequence
};

export const XS_META = {
  [XS.NOT_READY]: { label: 'NOT READY', tone: 'off', line: 'The plan isn’t defined yet. Nothing to wait for.' },
  [XS.WAITING]: { label: 'WAITING', tone: 'off', line: 'PIL defined. Price hasn’t proven anything yet.' },
  [XS.DEVELOPING]: { label: 'DEVELOPING', tone: 'dev', line: 'Something may be forming. Not executable.' },
  [XS.CONFIRMED]: { label: 'CONFIRMED', tone: 'conf', line: 'The sequence closed. Not executable yet: no retest.' },
  [XS.EXECUTABLE]: { label: 'EXECUTABLE', tone: 'ok', line: 'First valid retest. Setup still active.' },
  [XS.MISSED]: { label: 'MISSED', tone: 'warn', line: 'The planned opportunity came and went. No chase.' },
  [XS.PASSED]: { label: 'PASSED', tone: 'ok', line: 'You chose not to participate. That’s a decision.' },
  [XS.INVALID]: { label: 'INVALID', tone: 'bad', line: 'The model didn’t complete. Nothing to execute.' },
  [XS.REASSESS]: { label: 'REASSESS', tone: 'warn', line: 'New structure changed the setup. Look again.' },
};

/** The status chips she can pick from (in this order) when a checkpoint asks for the status. */
export const STATUS_CHOICES = [XS.WAITING, XS.DEVELOPING, XS.CONFIRMED, XS.EXECUTABLE, XS.MISSED, XS.INVALID, XS.REASSESS];

/** Trader actions. WAIT comes first on purpose: it is usually the right one. */
export const XA = { WAIT: 'wait', PREPARE: 'prepare', ENTER: 'enter', PASS: 'pass', REASSESS: 'reassess', MARK_PIL: 'mark-pil' };
export const XA_META = {
  [XA.WAIT]: { label: 'WAIT', line: 'Do nothing. Price hasn’t earned the next step.' },
  [XA.PREPARE]: { label: 'PREPARE', line: 'Sequence confirmed. Plan the entry at the PIL, then wait for the retest.' },
  [XA.ENTER]: { label: 'ENTER', line: 'The first valid retest is here. Execute the plan.' },
  [XA.PASS]: { label: 'PASS', line: 'Stay out. Not every move is yours.' },
  [XA.REASSESS]: { label: 'REASSESS', line: 'New structure. Re-read before anything else.' },
  [XA.MARK_PIL]: { label: 'MARK PIL', line: 'Define the level first.' },
};

/** Execution timing phases (ExecutionTimingTimeline). */
export const TIMING = [
  { key: 'pil', label: 'PIL identified', mode: 'WAIT' },
  { key: 'indication', label: 'Indication confirmed', mode: 'WAIT' },
  { key: 'correction', label: 'Correction confirmed', mode: 'WAIT' },
  { key: 'continuation', label: 'Continuation confirmed', mode: 'PREPARE' },
  { key: 'retest', label: 'First valid retest', mode: 'EXECUTE' },
];

/**
 * Read one setup at `k` closed bars.
 * setup: { pil, dir, pilAt, missedAt?, invalidAt?, reassessAt?, grace? }
 *   missedAt    from this closed-bar index on, price has run without her (no chase)
 *   invalidAt   from here the model failed (e.g. continuation never came, structure broke)
 *   reassessAt  from here new structure changed the active sequence
 *   grace       bars after the first retest that still count as executable (default 0)
 * ctx: { prepared, entered, passed }
 * Returns { ev, status, action, confirmed: [..], missing, model }.
 */
export function readExecution(bars, setup, k, ctx = {}) {
  const ev = evaluateDayliICC(bars, { pil: setup.pil, dir: setup.dir, from: setup.pilAt ?? -1 }, k);
  const e = ev.events;
  const last = k - 1;
  const confirmed = ['PIL'];
  if (e.indication != null) confirmed.push('Indication');
  if (e.correction != null) confirmed.push('Correction');
  if (e.continuation != null) confirmed.push('Continuation');
  if (ev.firstRetest != null) confirmed.push('Retest');
  const missing = e.indication == null ? 'Indication close'
    : e.correction == null ? 'Correction close'
      : e.continuation == null ? 'Continuation close'
        : ev.firstRetest == null ? 'First valid retest' : null;
  const model = e.continuation != null ? (ev.firstRetest != null ? 'Retest present' : 'Continuation confirmed')
    : e.correction != null ? 'Correction confirmed' : e.indication != null ? 'Indication confirmed' : 'Waiting for indication';

  let status;
  if (setup.pil == null) status = XS.NOT_READY;
  else if (ctx.passed) status = XS.PASSED;
  else if (setup.reassessAt != null && last >= setup.reassessAt) status = XS.REASSESS;
  else if (setup.invalidAt != null && last >= setup.invalidAt) status = XS.INVALID;
  else if (ev.firstRetest != null) status = last <= ev.firstRetest + (setup.grace ?? 0) ? XS.EXECUTABLE : XS.MISSED;
  else if (setup.missedAt != null && last >= setup.missedAt && e.continuation != null) status = XS.MISSED;
  else if (e.continuation != null) status = XS.CONFIRMED;
  else if (e.indication != null) status = XS.DEVELOPING;
  else status = XS.WAITING;

  const action = {
    [XS.NOT_READY]: XA.MARK_PIL,
    [XS.WAITING]: XA.WAIT,
    [XS.DEVELOPING]: XA.WAIT,
    [XS.CONFIRMED]: ctx.prepared ? XA.WAIT : XA.PREPARE,
    [XS.EXECUTABLE]: XA.ENTER,
    [XS.MISSED]: XA.PASS,
    [XS.PASSED]: XA.PASS,
    [XS.INVALID]: XA.PASS,
    [XS.REASSESS]: XA.REASSESS,
  }[status];
  return { ev, status, action, confirmed, missing, model };
}

/** Which timing phase is lit, from a read. */
export function timingIndex(read) {
  const e = read.ev.events;
  if (read.ev.firstRetest != null) return 4;
  if (e.continuation != null) return 3;
  if (e.correction != null) return 2;
  if (e.indication != null) return 1;
  return 0;
}

/* ── Pre-entry card (AGHFPreEntryCard) ───────────────────────────────
 * It prepares her to WAIT. It never approves an entry: there is no
 * "6/6 = take trade". Any undefined field = NOT READY TO EXECUTE. */
export const PRE_ENTRY_FIELDS = [
  { key: 'context', label: 'Context', q: 'Do I understand the 4H story?' },
  { key: 'structure', label: 'Structure', q: 'Do I understand the 1H map?' },
  { key: 'location', label: 'Location', q: 'Am I at or near an area that matters?' },
  { key: 'direction', label: 'Direction', q: 'What side am I currently interested in?' },
  { key: 'pil', label: 'PIL', q: 'What level must price prove itself through?' },
  { key: 'invalidation', label: 'Invalidation', q: 'What would make this idea no longer relevant?' },
];
export const PE = { UNKNOWN: 'unknown', DEFINED: 'defined', REVIEW: 'review' };

/** { state: 'ready-to-wait' | 'not-ready', missing: [labels] } */
export function preEntryResult(values = {}) {
  const missing = PRE_ENTRY_FIELDS.filter((f) => (values[f.key]?.state || values[f.key]) !== PE.DEFINED).map((f) => f.label);
  return { state: missing.length ? 'not-ready' : 'ready-to-wait', missing };
}

/* ── Behavior tracking (PatienceTracker / ExecutionReview) ────────────
 * Stored per student, separately from P&L. Future journal modules read the
 * same keys. Never derive a process grade from an outcome. */
const STATS_KEY = 'aghf_p6_stats';
export const TRACK_KEYS = ['preEntryReadiness', 'confirmationVsAnticipationAccuracy', 'anticipationErrors', 'lateEntries',
  'chaseAttempts', 'validPasses', 'validEntries', 'missedTradeResponses', 'outcomeBiasErrors', 'processVsOutcomeAccuracy',
  'reassessmentDecisions', 'patienceDecisions', 'noTradeDecisions', 'decisions', 'correctDecisions'];

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage blocked */ }
}

/** Add to a lifetime counter (and to the running session, if one is open). */
export function trackP6(key, n = 1) {
  const s = readJSON(STATS_KEY, {});
  s[key] = (s[key] || 0) + n;
  writeJSON(STATS_KEY, s);
  const sess = session();
  if (sess) { sess[key] = (sess[key] || 0) + n; writeSession(sess); }
}
export function p6Stats() { return readJSON(STATS_KEY, {}); }

/* A "session" groups the decisions of one lab run, for the end-of-lab review. */
const SESSION_KEY = 'aghf_p6_session';
export function startSession(name) { writeSession({ name, at: Date.now() }); }
export function session() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } }
function writeSession(v) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch { /* ignore */ } }

/**
 * The execution review: behavior counts plus what to review next.
 * Language is about decisions, never about who she is.
 */
export function executionReview(s = session() || {}) {
  const n = (k) => s[k] || 0;
  const accuracy = n('decisions') ? Math.round((n('correctDecisions') / n('decisions')) * 100) : 100;
  const rows = [
    ['Rule accuracy', `${accuracy}%`],
    ['Anticipation errors', n('anticipationErrors')],
    ['Chases', n('chaseAttempts')],
    ['Valid passes', n('validPasses')],
    ['Correct entries', n('validEntries')],
    ['Reassessments', n('reassessmentDecisions')],
    ['Patience decisions', n('patienceDecisions')],
  ];
  const review = [];
  if (n('anticipationErrors') >= 2) review.push({ line: 'You understand the model. Your challenge isn’t recognition. It’s waiting for the candle to finish.', cta: 'Practice candle closes →', href: 'lesson.html?phase=p6&n=4' });
  if (n('chaseAttempts') >= 1) review.push({ line: 'You’re identifying direction correctly. But you’re entering after your planned opportunity.', cta: 'Replay retest timing →', href: 'lesson.html?phase=p6&n=5' });
  if (n('outcomeBiasErrors') >= 1) review.push({ line: 'You’re grading yourself by outcome. Let’s review the trade before you know whether it wins.', cta: 'Outcome-blind review →', href: 'lesson.html?phase=p6&n=7' });
  if (n('decisions') >= 6 && n('validPasses') + n('noTradeDecisions') === 0) review.push({ line: 'You’re good at finding reasons to participate. Now let’s practice finding reasons to stay out.', cta: 'No-trade drill →', href: 'lesson.html?phase=p6&n=8' });
  if (n('backwardsAnalysis') >= 1) review.push({ line: 'You’re trying to make 1M answer a question your 4H and 1H should have answered first.', cta: 'Return to top-down →', href: 'lesson.html?phase=p6&n=1' });
  return { accuracy, rows, review };
}
