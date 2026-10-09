/**
 * sd-core.js — A Girl & Her Futures™
 *
 * Strategy Lab: the rules of AGHF Supply & Demand, Powered by Higher-Timeframe
 * ICC™, as pure functions. No DOM.
 *
 * Authority: strategy-lab/SUPPLY_DEMAND_MASTER.md. strategy-lab/RULES_STATUS.md
 * says which rules are settled. Anything not settled is in PROVISIONAL and is
 * shown with the RULE REQUIRES DAYLI CONFIRMATION label. Nothing graded depends
 * on a provisional rule.
 *
 * Scenario data (oldest bar first, 5-minute bars):
 *   { id, dir: 'bullish' | 'bearish', bars: [{ o, h, l, c }],
 *     ctx:  { h4, h1, htf } higher-timeframe context text,
 *     bos1: { level, at15 }  15M level and the 15M bar that closed through it,
 *     legs: { c1: [from, to], bos2: { level, at }, c2: [from, to], bos3: { level, at } },
 *     zoneAt, retestAt, invalidAt, outcome }
 * The sequence indices are derived and checked by analyse(); see
 * strategy-lab/scenarios.js.
 */

/** Bump when a rule changes, so saved progress and journal entries record which rules they were graded against. */
export const STRATEGY_VERSION = 'sd-1.0';
export const CONFIRM_LABEL = 'RULE REQUIRES DAYLI CONFIRMATION';

/** Rules still being tested. Shown with CONFIRM_LABEL wherever students see them. */
export const PROVISIONAL = {
  zoneBounds: 'Zone boundaries use the zone-forming candle’s full high-to-low range (working model).',
  invalidation: 'Price moving past the opposite zone boundary invalidates the setup. Whether a wick is enough, or a 5M candle has to close beyond it, has not been finalized.',
  mssAsBos1: 'A 15M MSS counts as BOS #1 only when it agrees with the higher-timeframe ICC direction.',
  limitEntry: 'The limit entry sits at the near edge of the zone: the high of a demand zone, the low of a supply zone.',
  reclaim: 'A reclaim of the original 15M BOS/MSS level can add structural confirmation. It is a conditional rule still being tested, not a requirement.',
};

/** The core sequence: 3 Breaks. 2 Corrections. 1 Zone. 1 Retest. */
export const SEQUENCE = [
  { key: 'bos1', short: 'BOS #1', tf: '15M', label: 'BOS #1 · 15M directional break', need: 'a 15M candle close through the 15M level' },
  { key: 'c1', short: 'Correction #1', tf: '5M', label: 'Correction #1 · 5M', need: 'a 5M corrective move after BOS #1, preferably back toward the 15M break' },
  { key: 'bos2', short: 'BOS #2', tf: '5M', label: 'BOS #2 · 5M continuation', need: 'a 5M candle close through the high (bullish) or low (bearish) that Correction #1 pulled back from' },
  { key: 'c2', short: 'Correction #2', tf: '5M', label: 'Correction #2 · creates the zone', need: 'a second 5M correction after BOS #2' },
  { key: 'zone', short: 'Zone', tf: '5M', label: 'The zone-forming candle', need: 'the last opposite-colour candle of Correction #2 before BOS #3' },
  { key: 'bos3', short: 'BOS #3', tf: '5M', label: 'BOS #3 · activates the zone', need: 'a 5M candle close through the point Correction #2 pulled back from' },
  { key: 'retest', short: 'Retest', tf: '5M', label: 'Retest of the zone', need: 'price returning to the zone after BOS #3' },
];
export const STEP_INDEX = Object.fromEntries(SEQUENCE.map((s, i) => [s.key, i]));

const up = (b) => b.c > b.o;
const down = (b) => b.c < b.o;

/** Group 5M bars into 15M bars (three 5M bars each, aligned to index 0). */
export function to15(bars) {
  const out = [];
  for (let i = 0; i < bars.length; i += 3) {
    const g = bars.slice(i, i + 3);
    out.push({ o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map((b) => b.h)), l: Math.min(...g.map((b) => b.l)), from: i, to: i + g.length - 1 });
  }
  return out;
}
/** The 15M bar that contains 5M bar i. */
export const bar15Of = (i) => Math.floor(i / 3);

/** A break of structure needs a candle CLOSE through the level. A wick through it is not a break. */
export function closesThrough(bar, level, dir) {
  return dir === 'bullish' ? bar.c > level : bar.c < level;
}
export function wicksThroughOnly(bar, level, dir) {
  return dir === 'bullish' ? bar.h > level && bar.c <= level : bar.l < level && bar.c >= level;
}
/** First bar index >= from whose close goes through level, or -1. */
export function firstCloseThrough(bars, from, level, dir, to = bars.length - 1) {
  for (let i = from; i <= to; i++) if (closesThrough(bars[i], level, dir)) return i;
  return -1;
}

/** The extreme of a leg: the highest high (bullish) or lowest low (bearish) in [from, to]. */
export function legExtreme(bars, from, to, dir) {
  let at = from;
  for (let i = from; i <= to; i++) {
    if (dir === 'bullish' ? bars[i].h > bars[at].h : bars[i].l < bars[at].l) at = i;
  }
  return { at, price: dir === 'bullish' ? bars[at].h : bars[at].l };
}
/** The corrective extreme: the lowest low (bullish) or highest high (bearish) in [from, to]. */
export function correctionExtreme(bars, from, to, dir) {
  return legExtreme(bars, from, to, dir === 'bullish' ? 'bearish' : 'bullish');
}

/**
 * The zone-forming candle: the LAST opposite-colour candle of Correction #2
 * before BOS #3 (bearish candle for demand, bullish candle for supply).
 * Searched inside Correction #2 only: [c2From, c2To].
 */
export function zoneCandle(bars, c2From, c2To, dir) {
  for (let i = c2To; i >= c2From; i--) {
    if (dir === 'bullish' ? down(bars[i]) : up(bars[i])) return i;
  }
  return -1;
}
/** Working model (provisional): the zone candle's full high-to-low range. */
export function zoneOf(bar) {
  return { hi: bar.h, lo: bar.l };
}
/** Near edge, where the provisional limit entry sits. Far edge, where invalidation is measured. */
export const nearEdge = (zone, dir) => (dir === 'bullish' ? zone.hi : zone.lo);
export const farEdge = (zone, dir) => (dir === 'bullish' ? zone.lo : zone.hi);

/** Price trades back into the zone. */
export function touchesZone(bar, zone, dir) {
  return dir === 'bullish' ? bar.l <= zone.hi : bar.h >= zone.lo;
}
/** A 5M CLOSE beyond the far edge. Invalid under either reading of the unsettled rule, so graded scenarios use only this. */
export function closesBeyondZone(bar, zone, dir) {
  return dir === 'bullish' ? bar.c < zone.lo : bar.c > zone.hi;
}
/** A wick beyond the far edge with the close back inside. The unsettled case: never graded. */
export function wicksBeyondZoneOnly(bar, zone, dir) {
  return dir === 'bullish' ? bar.l < zone.lo && bar.c >= zone.lo : bar.h > zone.hi && bar.c <= zone.hi;
}

/**
 * Walk a scenario and derive every sequence point from the bars and the leg
 * boundaries the author gave. Returns { ok, points, zone, problems }.
 * Used by the lessons (to place labels) and by the scenario tests.
 */
export function analyse(sc) {
  const { bars, dir, legs } = sc;
  const problems = [];
  const p = {};
  const b15 = to15(bars);

  // BOS #1: a 15M close through the 15M level.
  const at15 = firstCloseThrough(b15, 0, sc.bos1.level, dir);
  if (at15 < 0) problems.push('No 15M close through the BOS #1 level.');
  p.bos1 = { at15, at: at15 >= 0 ? b15[at15].to : -1, level: sc.bos1.level };
  if (sc.bos1.at15 != null && sc.bos1.at15 !== at15) problems.push(`BOS #1 expected on 15M bar ${sc.bos1.at15}, found ${at15}.`);

  // Correction #1, from its start to its corrective extreme.
  if (legs.c1) {
    const [f, t] = legs.c1;
    const ext = correctionExtreme(bars, f, t, dir);
    p.c1 = { from: f, to: t, extreme: ext };
    const swing = legExtreme(bars, p.bos1.at >= 0 ? Math.max(0, p.bos1.at - 3) : 0, f, dir);
    p.c1.swing = swing; // the high (bullish) / low (bearish) Correction #1 pulled back from
  }
  // BOS #2: a 5M close through the swing Correction #1 pulled back from.
  if (p.c1) {
    const lvl = p.c1.swing.price;
    const at = firstCloseThrough(bars, p.c1.extreme.at + 1, lvl, dir);
    p.bos2 = { at, level: lvl };
    if (legs.bos2 && at !== legs.bos2.at) problems.push(`BOS #2 expected at ${legs.bos2.at}, found ${at}.`);
  }
  // Correction #2.
  if (legs.c2 && p.bos2?.at >= 0) {
    const [f, t] = legs.c2;
    p.c2 = { from: f, to: t, extreme: correctionExtreme(bars, f, t, dir), swing: legExtreme(bars, p.bos2.at, f, dir) };
  }
  // BOS #3: a 5M close through the swing Correction #2 pulled back from.
  if (p.c2) {
    const lvl = p.c2.swing.price;
    const at = firstCloseThrough(bars, p.c2.extreme.at + 1, lvl, dir);
    p.bos3 = { at, level: lvl };
    if (legs.bos3 && at !== legs.bos3.at) problems.push(`BOS #3 expected at ${legs.bos3.at}, found ${at}.`);
  }
  // The zone: Correction #2's last opposite-colour candle. It exists as a POTENTIAL
  // zone as soon as Correction #2 turns; BOS #3 is what activates it.
  let zone = null;
  if (p.c2) {
    const end = p.bos3?.at >= 0 ? Math.min(p.c2.to, p.bos3.at - 1) : p.c2.to;
    const zi = zoneCandle(bars, p.c2.from, end, dir);
    if (zi < 0) problems.push('Correction #2 has no opposite-colour candle to form the zone.');
    else {
      p.zone = { at: zi };
      if (sc.zoneAt != null && sc.zoneAt !== zi) problems.push(`Zone candle expected at ${sc.zoneAt}, found ${zi}.`);
      if (p.bos3?.at >= 0) zone = { at: zi, ...zoneOf(bars[zi]) };
    }
  }
  const potentialZone = p.zone ? { at: p.zone.at, ...zoneOf(bars[p.zone.at]) } : null;
  // After BOS #3: retest, invalidation, or neither (missed).
  if (zone) {
    let retest = -1, invalid = -1, wickOnly = -1;
    for (let i = p.bos3.at + 1; i < bars.length; i++) {
      // Only matters while the zone is still alive.
      if (wickOnly < 0 && invalid < 0 && wicksBeyondZoneOnly(bars[i], zone, dir)) wickOnly = i;
      if (invalid < 0 && closesBeyondZone(bars[i], zone, dir)) invalid = i;
      // A candle that slices through and closes beyond the zone is an invalidation, not a retest.
      if (retest < 0 && touchesZone(bars[i], zone, dir) && !closesBeyondZone(bars[i], zone, dir)) retest = i;
    }
    p.retest = { at: retest };
    p.invalid = { at: invalid };
    p.wickOnly = { at: wickOnly };
  }
  const outcome = !zone ? 'incomplete'
    : p.invalid.at >= 0 && (p.retest.at < 0 || p.invalid.at < p.retest.at) ? 'invalid'
      : p.retest.at < 0 ? 'missed' : 'valid';
  if (sc.outcome && sc.outcome !== outcome) problems.push(`Outcome expected ${sc.outcome}, found ${outcome}.`);
  // Graded scenarios must not hinge on the unsettled wick case.
  if (zone && p.wickOnly.at >= 0 && !sc.ungraded) problems.push('A wick-only violation appears in a graded scenario (invalidation is not finalized).');
  return { ok: problems.length === 0, points: p, zone: zone || potentialZone, active: !!zone, outcome, problems, b15 };
}

/**
 * Execution Lab state machine. The student marks steps in order; marking a
 * step that hasn't happened yet, or out of order, returns the missing
 * requirement instead of advancing. Decisions are judged on what has actually
 * printed, not on what the student marked.
 *   const m = execMachine(scenario);
 *   m.mark('bos2', k)          k = number of 5M bars printed so far
 *   m.decide('enter' | 'pass', k)
 *   m.decisionK                where the simulator stops and asks for a decision
 */
export function execMachine(sc) {
  const a = analyse(sc);
  const P = a.points;
  const done = [];
  const occurredBy = (key, k) => {
    const pt = P[key];
    if (!pt) return false;
    // A correction (and the zone it creates) is visible once price has turned from its extreme.
    if (key === 'c1' || key === 'c2') return pt.extreme.at < k - 1;
    if (key === 'zone') return P.c2 && P.c2.extreme.at < k - 1 && pt.at < k;
    return pt.at >= 0 && pt.at < k;
  };
  const need = (step) => step.need.replace('the high (bullish) or low (bearish)', sc.dir === 'bullish' ? 'the high' : 'the low');
  const decisionK = a.outcome === 'valid' || a.outcome === 'invalid' ? P.retest.at + 1 : sc.bars.length;

  function mark(key, k) {
    const want = SEQUENCE[done.length];
    if (!want) return { ok: false, why: 'Every step is marked. Now make your decision.' };
    if (key !== want.key) {
      const i = STEP_INDEX[key];
      if (i < done.length) return { ok: false, why: `${SEQUENCE[i].short} is already marked.` };
      return { ok: false, why: `Not yet. ${want.short} comes first: ${need(want)}.` };
    }
    if (key === 'retest' && P.invalid?.at >= 0 && P.invalid.at < k && (P.retest.at < 0 || P.invalid.at < P.retest.at)) {
      return { ok: false, why: 'That isn’t a retest. A 5M candle closed beyond the zone’s far edge first, so the zone is invalid. Price coming back to a dead zone doesn’t count.' };
    }
    if (!occurredBy(key, k)) return { ok: false, why: `${want.short} hasn’t happened yet. It needs ${need(want)}.` };
    done.push(key);
    return { ok: true, step: want };
  }

  function status(k) {
    const missing = SEQUENCE.filter((s) => s.key !== 'retest').find((s) => !occurredBy(s.key, k));
    return {
      missing,
      retested: P.retest?.at >= 0 && P.retest.at < k,
      invalidated: P.invalid?.at >= 0 && P.invalid.at < k,
      finished: k >= sc.bars.length,
    };
  }

  function decide(choice, k) {
    const st = status(k);
    if (choice === 'enter') {
      if (st.invalidated) return { ok: false, why: 'The zone is invalid. A 5M candle closed beyond its far edge, so it is no longer an entry opportunity, even though price came back to it.' };
      if (st.missing) return { ok: false, why: `No entry yet. ${st.missing.short} is missing: ${need(st.missing)}. Don’t enter simply because BOS #1 or BOS #2 occurred.` };
      if (!st.retested) return { ok: false, why: 'BOS #3 has activated the zone, but price hasn’t come back to it. Don’t chase. Wait for the retest.' };
      return { ok: true, why: 'Every requirement is in place: BOS #1, Correction #1, BOS #2, Correction #2, the zone, BOS #3 and the retest.' };
    }
    if (st.invalidated) return { ok: true, why: 'Correct. A 5M candle closed beyond the zone’s far edge, so the zone is invalid. Don’t keep treating it as an entry opportunity.' };
    if (!st.missing && st.retested) return { ok: false, why: 'This one was valid. The full sequence completed and price retested the zone.' };
    if (st.finished) return { ok: true, why: st.missing ? `Correct. ${st.missing.short} never happened, so the sequence never completed. No trade.` : 'Correct. Price never returned to the zone. A missed retest is a missed trade, not a trade. Don’t chase it.' };
    return { ok: false, early: true, why: 'It’s too early to call. The sequence is still developing, so keep watching.' };
  }

  return { analysis: a, done, mark, decide, status, decisionK, occurredBy, next: () => SEQUENCE[done.length] || null };
}
