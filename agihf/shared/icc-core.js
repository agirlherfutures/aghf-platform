/**
 * icc-core.js — A Girl & Her Futures™
 *
 * The data model behind Phase 5 (The Dayli ICC Method™). No DOM here:
 * the components in icc.js and icc-exec.js render it, the lessons and labs
 * read and write it, and later sections build on it.
 *
 * Two different things share the letters I · C · C:
 *
 *   1. The ICC price-behavior framework (Section 12): Indication →
 *      Correction → Continuation, a way to organize the story price is
 *      telling on ANY timeframe. Described with an iccRead.
 *
 *   2. The Dayli ICC 1-Minute Entry Model™ (Section 13): PIL → Indication →
 *      Correction → Continuation → Retest → Entry, a candle-close rule
 *      sequence. Evaluated by evaluateDayliICC().
 *
 * An iccRead keeps the ICC STAGE (where price is in the sequence) apart
 * from ICC CLARITY (how clean the story is). They are separate questions.
 */

/* ── Framework stages + clarity ─────────────────────────────────────── */

export const STAGE = {
  WAITING: 'waiting',
  INDICATION: 'indication',
  CORRECTION: 'correction',
  CONTINUATION: 'continuation',
  COMPLETE: 'complete',
  UNCLEAR: 'unclear',
};

export const STAGE_LABEL = {
  waiting: 'Waiting for indication',
  indication: 'Indication',
  correction: 'Correction in progress',
  continuation: 'Continuation developing',
  complete: 'Sequence complete',
  unclear: 'Sequence unclear',
};

export const CLARITY = { CLEAR: 'clear', DEVELOPING: 'developing', UNCLEAR: 'unclear' };

export const CLARITY_LABEL = {
  clear: 'Clear',
  developing: 'Developing',
  unclear: 'Unclear',
};

export const CLARITY_LINE = {
  clear: 'The meaningful sequence can be identified.',
  developing: 'Some pieces exist. The sequence is incomplete.',
  unclear: 'Price isn’t providing a clean enough story yet.',
};

/** The three letters, in order. Each stage's state: 'done' | 'current' | 'open' | 'unclear'. */
export const LETTERS = [
  { key: 'indication', letter: 'I', name: 'Indication' },
  { key: 'correction', letter: 'C', name: 'Correction' },
  { key: 'continuation', letter: 'C', name: 'Continuation' },
];

/**
 * Letter states for a stage. The final C is NEVER drawn as done until the
 * stage is 'complete', so the UI cannot teach anticipation.
 */
export function letterStates(stage) {
  switch (stage) {
    case 'indication': return ['done', 'open', 'open'];
    case 'correction': return ['done', 'current', 'open'];
    case 'continuation': return ['done', 'done', 'current'];
    case 'complete': return ['done', 'done', 'done'];
    case 'unclear': return ['unclear', 'unclear', 'unclear'];
    default: return ['open', 'open', 'open'];
  }
}

/** Status line under the letters: never "continuation coming next". */
export function stageLines(stage) {
  return {
    waiting: ['Waiting for indication'],
    indication: ['Indication confirmed', 'Correction not started', 'Continuation not confirmed'],
    correction: ['Indication confirmed', 'Correction developing', 'Continuation not confirmed'],
    continuation: ['Indication confirmed', 'Correction confirmed', 'Continuation developing'],
    complete: ['Indication confirmed', 'Correction confirmed', 'Continuation confirmed'],
    unclear: ['Price isn’t telling a clean story yet'],
  }[stage] || [];
}

/**
 * An ICC read on one timeframe. Every timeframe keeps its own read:
 * the 4H stage never implies the 1H stage.
 */
export function makeICCRead(o = {}) {
  return {
    timeframe: o.timeframe || '4H',
    direction: o.direction || null, // 'bullish' | 'bearish' | null
    stage: o.stage || STAGE.WAITING,
    clarity: o.clarity || CLARITY.DEVELOPING,
    indicationReference: o.indicationReference ?? null, // where price provided directional information
    correctionState: o.correctionState ?? null,
    continuationState: o.continuationState ?? null,
    notes: o.notes || '',
    at: Date.now(),
  };
}

/* ── Saved reads + learning data ────────────────────────────────────── */

const READS_KEY = 'aghf_icc_reads';
const STATS_KEY = 'aghf_icc_stats';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}
function store(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage blocked */ }
}

/** Save an iccRead under a name (e.g. a lab level), newest kept per name. */
export function saveICCRead(name, read) {
  const all = load(READS_KEY, {});
  all[name] = { ...read, at: Date.now() };
  store(READS_KEY, all);
}
export function getICCReads() { return load(READS_KEY, {}); }

/**
 * Detailed learning data for adaptive support, never only pass/fail.
 *   kind: a mistake or decision tag, e.g. 'big-candle-indication',
 *         'correction-as-reversal', 'anticipated-continuation',
 *         'forced-label', 'context-as-requirement', 'chased', ...
 *   good: true for a correct/disciplined decision.
 */
export function trackICC(kind, good, extra = {}) {
  const all = load(STATS_KEY, { events: {}, discipline: 0, disciplineGP: 0 });
  const e = all.events[kind] || { good: 0, bad: 0 };
  if (good) e.good += 1; else e.bad += 1;
  e.last = Date.now();
  all.events[kind] = e;
  if (extra.discipline) { all.discipline = (all.discipline || 0) + 1; all.disciplineGP = (all.disciplineGP || 0) + (extra.gp || 0); }
  store(STATS_KEY, all);
  return e;
}
export function iccStats() { return load(STATS_KEY, { events: {}, discipline: 0, disciplineGP: 0 }); }
/** How many times she has made this mistake (for "you keep doing X" support). */
export function mistakeCount(kind) { return (iccStats().events[kind] || {}).bad || 0; }

/* ── The Dayli ICC 1-Minute Entry Model™: method configuration ──────── */

/**
 * Parameters the method may refine over time live here, not in lesson
 * copy, so they can change without rewriting the curriculum. Not shown to
 * students as settings.
 */
export const METHOD = {
  // Only a candle CLOSE beyond the PIL counts; a wick through never does.
  wickVsCloseRule: 'close',
  // A close exactly on the PIL is not "through" it.
  closeEqualsPil: 'not-through',
  // The retest: after continuation, the first candle that trades back to the PIL.
  retestTouch: 'trades-to-pil',
  activeRetestRule: 'first-retest',
  // A new relevant swing never auto-cancels a setup: it triggers a reassessment.
  setupResetRules: ['new-relevant-swing:reassess', 'pil-loses-relevance:reassess', 'newer-sequence:replace', 'htf-context-change:reassess'],
  pilRelevanceRules: 'structural',
  // Research observations are NOT rules. Shown only as a Dayli Research Note.
  correctionResearchNotes: ['Dayli continues studying how correction depth affects setup quality.'],
};

/* ── Execution states (educational state machine, not a signal) ─────── */

export const EXEC = {
  NO_PIL: 'NO_PIL',
  PIL_SELECTED: 'PIL_SELECTED',
  WAITING_FOR_INDICATION: 'WAITING_FOR_INDICATION',
  INDICATION_CONFIRMED: 'INDICATION_CONFIRMED',
  WAITING_FOR_CORRECTION: 'WAITING_FOR_CORRECTION',
  CORRECTION_CONFIRMED: 'CORRECTION_CONFIRMED',
  WAITING_FOR_CONTINUATION: 'WAITING_FOR_CONTINUATION',
  CONTINUATION_CONFIRMED: 'CONTINUATION_CONFIRMED',
  WAITING_FOR_RETEST: 'WAITING_FOR_RETEST',
  RETEST_AVAILABLE: 'RETEST_AVAILABLE',
  ENTRY_AVAILABLE: 'ENTRY_AVAILABLE',
  MISSED: 'MISSED', RESET: 'RESET', REPLACED: 'REPLACED', INVALID: 'INVALID', MESSY: 'MESSY', NO_TRADE: 'NO_TRADE',
};

/** The six steps of the execution timeline. */
export const STEPS = [
  { key: 'pil', short: 'PIL', name: 'PIL', q: 'What level matters?' },
  { key: 'indication', short: 'I', name: 'Indication', q: 'Did price close through it?' },
  { key: 'correction', short: 'C', name: 'Correction', q: 'Did price close back through?' },
  { key: 'continuation', short: 'C', name: 'Continuation', q: 'Did price close back in the original direction?' },
  { key: 'retest', short: 'RETEST', name: 'Retest', q: 'Did price return to the PIL?' },
  { key: 'entry', short: 'ENTRY', name: 'Entry', q: 'Did my execution opportunity actually arrive?' },
];

/** Where a CLOSE sits relative to the PIL: 'above' | 'below' | 'at'. */
export function closeSide(bar, pil) {
  if (bar.c > pil) return 'above';
  if (bar.c < pil) return 'below';
  return 'at';
}

/** Did the candle's wick reach beyond the PIL on a given side, without the close? */
export function wickOnly(bar, pil, side) {
  return side === 'above' ? bar.h > pil && bar.c <= pil : bar.l < pil && bar.c >= pil;
}

/**
 * Evaluate the Dayli ICC candle-close sequence over CLOSED bars only.
 * bars: [{ o, h, l, c }] in price, oldest first; only bars[0..upto) are
 * known (the candle at index `upto`, if forming, is ignored).
 * Returns the events found so far and the state the model is in.
 *
 * Bullish: start below → close ABOVE (indication) → close BELOW
 * (correction) → close ABOVE (continuation) → first candle trading back
 * down to the PIL (retest) → entry available at the PIL.
 * Bearish mirrors it.
 */
export function evaluateDayliICC(bars, { pil, dir, from = -1 }, upto = bars.length) {
  const out = { state: EXEC.WAITING_FOR_INDICATION, events: {}, retests: [], firstRetest: null };
  if (pil == null) return { ...out, state: EXEC.NO_PIL };
  const go = dir === 'bearish' ? 'below' : 'above';
  const back = go === 'above' ? 'below' : 'above';
  // The PIL only exists once the swing that created it has printed (bar `from`):
  // nothing before it can count. Then price has to START on the far side of the
  // PIL (bullish: a close below it) before a close through it is indication.
  let phase = 'start';
  for (let i = Math.max(0, from + 1); i < Math.min(upto, bars.length); i++) {
    const b = bars[i], side = closeSide(b, pil);
    if (phase === 'start') { if (side === back) phase = 'indication'; continue; }
    if (phase === 'indication' && side === go) { out.events.indication = i; phase = 'correction'; continue; }
    if (phase === 'correction' && side === back) { out.events.correction = i; phase = 'continuation'; continue; }
    if (phase === 'continuation' && side === go) { out.events.continuation = i; phase = 'retest'; continue; }
    if (phase === 'retest') {
      const touched = go === 'above' ? b.l <= pil : b.h >= pil;
      if (touched) {
        out.retests.push(i);
        if (out.firstRetest == null) out.firstRetest = i;
      }
    }
  }
  const e = out.events;
  if (e.continuation != null) out.state = out.firstRetest != null ? EXEC.ENTRY_AVAILABLE : EXEC.WAITING_FOR_RETEST;
  else if (e.correction != null) out.state = EXEC.WAITING_FOR_CONTINUATION;
  else if (e.indication != null) out.state = EXEC.WAITING_FOR_CORRECTION;
  return out;
}

/** Which timeline steps are confirmed by price so far (truth, not the student's marks). */
export function truthSteps(ev) {
  return {
    indication: ev.events.indication != null,
    correction: ev.events.correction != null,
    continuation: ev.events.continuation != null,
    retest: ev.firstRetest != null,
  };
}

/**
 * What the student would need before a step is allowed.
 * Returns null if allowed, else { missing, why } describing what price
 * hasn't proven yet. Steps can never be skipped.
 */
export function gate(step, marks, ev, { forming = false } = {}) {
  const order = ['pil', 'indication', 'correction', 'continuation', 'retest', 'entry'];
  const k = order.indexOf(step);
  for (let j = 0; j < k; j++) {
    if (!marks[order[j]]) {
      return { missing: order[j], why: `Price hasn’t earned that step yet. ${STEPS[j].name} comes first.` };
    }
  }
  const t = truthSteps(ev);
  if (step === 'pil') return null;
  if (step === 'entry') return t.retest ? null : { missing: 'retest', why: 'No retest yet. Your planned execution is the PIL retest.' };
  if (!t[step]) {
    const why = {
      indication: forming ? 'Candle is still open. Price visited the level. It hasn’t proven the close.' : 'No candle has CLOSED through the PIL yet.',
      correction: 'No candle has closed back through the PIL yet.',
      continuation: 'Price hasn’t closed back through the PIL in the original direction yet.',
      retest: 'Price hasn’t returned to the PIL yet.',
    }[step];
    return { missing: step, why };
  }
  return null;
}
