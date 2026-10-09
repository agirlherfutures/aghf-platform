/**
 * Builds shared/sd-scenarios.js: the 5M candle data for Strategy Lab.
 *   node strategy-lab/tools/build-scenarios.mjs
 *
 * Each scenario is a plan of legs (where price goes, over how many 5M bars).
 * Candles are generated from a fixed seed, then checked with analyse() from
 * shared/sd-core.js. A scenario is written only when the rules engine derives
 * exactly the sequence the plan intends; otherwise the next seed is tried.
 */
import { writeFileSync } from 'node:fs';
import { analyse, to15 } from '../../shared/sd-core.js';

const TICK = 0.25;
const q = (p) => Math.round(p / TICK) * TICK;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

/**
 * Generate bars for a list of legs. leg: { to, n, tag, counter?, lastOpp? }
 *   counter: how many candles in the leg may close against its direction
 *   lastOpp: force the leg's last candle to close against the NEXT leg's direction
 *            (used for the zone-forming candle at the end of a correction)
 */
function generate(start, legs, seed, vol = 9) {
  const r = rng(seed);
  const bars = [];
  const ranges = {};
  let p = start;
  for (const leg of legs) {
    const from = bars.length;
    const dirUp = leg.to > p;
    const n = leg.n;
    const counterAt = new Set();
    for (let k = 0; k < (leg.counter ?? 0); k++) counterAt.add(1 + Math.floor(r() * Math.max(1, n - 2)));
    for (let j = 0; j < n; j++) {
      const o = p;
      const target = p + (leg.to - p) / (n - j);
      let c;
      if (counterAt.has(j) && j < n - 1) c = o + (dirUp ? -1 : 1) * vol * (0.25 + r() * 0.4);
      else c = target + (r() - 0.5) * vol * 0.35;
      if (j === n - 1) c = leg.to;
      if (!counterAt.has(j) && j < n - 1) {
        if (dirUp && c <= o) c = o + vol * 0.3;
        if (!dirUp && c >= o) c = o - vol * 0.3;
      }
      if (j === n - 1 && leg.lastOpp != null) {
        // The leg's final candle closes in the leg's own direction, so it is the
        // opposite colour to the move that follows.
        if (dirUp && c <= o) c = o + vol * 0.4;
        if (!dirUp && c >= o) c = o - vol * 0.4;
      }
      const wu = vol * (0.08 + r() * (leg.wick ?? 0.35));
      const wd = vol * (0.08 + r() * (leg.wick ?? 0.35));
      const bar = { o: q(o), c: q(c), h: q(Math.max(o, c) + wu), l: q(Math.min(o, c) - wd) };
      bars.push(bar);
      p = bar.c;
    }
    if (leg.tag) ranges[leg.tag] = [from, bars.length - 1];
  }
  return { bars, ranges };
}

/*
 * Bullish plan (bearish plans mirror it):
 *   pre:  up to H0, pull back            (H0 = the 15M swing high BOS #1 must close above)
 *   imp1: impulse through H0             (BOS #1 on the 15M)
 *   c1:   Correction #1, back toward the 15M break
 *   imp2: impulse through imp1's high    (BOS #2 on the 5M)
 *   c2:   Correction #2, ends on a bearish candle (the zone)
 *   imp3: impulse through imp2's high    (BOS #3)
 *   after: what happens next (retest / no retest / invalidation)
 */
function plan(dir, base, { tail, scale = 1, noBos3 = false, noBos2 = false, jit = [] } = {}) {
  const s = dir === 'bullish' ? 1 : -1;
  const P = (pts) => base + s * pts * scale;
  let li = 0;
  const N = (n) => Math.max(2, n + (jit[li++ % (jit.length || 1)] || 0));
  const legs = [
    { to: P(30), n: N(6), counter: 1, tag: 'pre1' },
    { to: P(10), n: N(6), counter: 1, tag: 'pre2' },
    { to: P(58), n: N(6), counter: 0, tag: 'imp1' },
  ];
  if (noBos2) {
    legs.push({ to: P(40), n: N(5), counter: 1, tag: 'c1' });
    legs.push({ to: P(54), n: N(4), counter: 1, tag: 'imp2' }); // stalls below imp1's high
    legs.push({ to: P(36), n: N(5), counter: 1, tag: 'after' });
    return legs;
  }
  legs.push({ to: P(40), n: N(5), counter: 1, tag: 'c1' });
  legs.push({ to: P(80), n: N(5), counter: 0, tag: 'imp2' });
  legs.push({ to: P(66), n: N(4), counter: 1, tag: 'c2', lastOpp: true, wick: 0.15 });
  if (noBos3) {
    legs.push({ to: P(76), n: N(3), counter: 0, tag: 'imp3' }); // fails below imp2's high
    legs.push({ to: P(62), n: N(5), counter: 1, tag: 'after' });
    return legs;
  }
  legs.push({ to: P(104), n: N(5), counter: 0, tag: 'imp3', wick: 0.2 });
  legs.push(...tail(P));
  return legs;
}

const TAILS = {
  // Price comes back down into the zone, holds, and continues.
  retest: (P) => [
    { to: P(84), n: 4, counter: 0, tag: 'pull', wick: 0.15 },
    { to: P(72.5), n: 2, counter: 0, tag: 'into', wick: 0.1 },
    { to: P(100), n: 5, counter: 0, tag: 'after', wick: 0.2 },
  ],
  // Price never comes back.
  missed: (P) => [
    { to: P(96), n: 3, counter: 0, tag: 'pull', wick: 0.15 },
    { to: P(124), n: 6, counter: 1, tag: 'after', wick: 0.2 },
  ],
  // Price drops straight through the zone and closes beyond it, then returns.
  invalid: (P) => [
    { to: P(84), n: 3, counter: 0, tag: 'pull', wick: 0.12 },
    { to: P(50), n: 1, counter: 0, tag: 'slice', wick: 0.05 },
    { to: P(70), n: 4, counter: 0, tag: 'after', wick: 0.12 },
  ],
};

const SPECS = [
  { id: 'bull-valid', scale: 1, jit: [0, 0, 0, 0, 0, 0], dir: 'bullish', base: 21010, tail: 'retest', outcome: 'valid',
    ctx: { h4: 'Bullish. Price is in the lower half of the 4H range and correcting.', h1: 'Bullish 1H structure. Price is reacting from a 1H higher low.', htf: 'HTF ICC: bullish Indication, Correction in progress.' } },
  { id: 'bear-valid', scale: 1.15, jit: [1, -1, 1, 0, 1, -1, 0], dir: 'bearish', base: 21280, tail: 'retest', outcome: 'valid',
    ctx: { h4: 'Bearish. Price is in the upper half of the 4H range and correcting.', h1: 'Bearish 1H structure. Price is reacting from a 1H lower high.', htf: 'HTF ICC: bearish Indication, Correction in progress.' } },
  { id: 'bull-missed', scale: 0.9, jit: [-1, 1, 0, 1, -1, 0, 1], dir: 'bullish', base: 20940, tail: 'missed', outcome: 'missed',
    ctx: { h4: 'Bullish, lower area of the 4H range.', h1: 'Bullish 1H structure.', htf: 'HTF ICC: bullish, correcting.' } },
  { id: 'bear-missed', scale: 1.25, jit: [1, 0, -1, 1, 0, 1], dir: 'bearish', base: 21330, tail: 'missed', outcome: 'missed',
    ctx: { h4: 'Bearish, upper area of the 4H range.', h1: 'Bearish 1H structure.', htf: 'HTF ICC: bearish, correcting.' } },
  { id: 'bull-invalid', scale: 1.1, jit: [0, 1, 1, -1, 0, 0, 1], dir: 'bullish', base: 21060, tail: 'invalid', outcome: 'invalid',
    ctx: { h4: 'Bullish, lower area of the 4H range.', h1: 'Bullish 1H structure.', htf: 'HTF ICC: bullish, correcting.' } },
  { id: 'bear-invalid', scale: 0.95, jit: [-1, 0, 1, 1, -1, 1], dir: 'bearish', base: 21240, tail: 'invalid', outcome: 'invalid',
    ctx: { h4: 'Bearish, upper area of the 4H range.', h1: 'Bearish 1H structure.', htf: 'HTF ICC: bearish, correcting.' } },
  { id: 'bull-no-bos3', scale: 1.2, jit: [1, 1, -1, 0, 1], dir: 'bullish', base: 20990, noBos3: true, outcome: 'incomplete',
    ctx: { h4: 'Bullish, lower area of the 4H range.', h1: 'Bullish 1H structure.', htf: 'HTF ICC: bullish, correcting.' } },
  { id: 'bear-no-bos2', scale: 1.05, jit: [0, -1, 1, 1], dir: 'bearish', base: 21300, noBos2: true, outcome: 'incomplete',
    ctx: { h4: 'Bearish, upper area of the 4H range.', h1: 'Bearish 1H structure.', htf: 'HTF ICC: bearish, correcting.' } },
];

function build(spec) {
  const legs = plan(spec.dir, spec.base, { tail: TAILS[spec.tail], noBos3: spec.noBos3, noBos2: spec.noBos2, scale: spec.scale, jit: spec.jit });
  for (let seed = 1; seed < 4000; seed++) {
    const { bars, ranges } = generate(spec.base, legs, seed * 7919 + spec.base);
    // The 15M level BOS #1 closes through: the extreme of the pre-move.
    const preEnd = ranges.pre1[1];
    const pre = bars.slice(0, preEnd + 1);
    const level = spec.dir === 'bullish' ? Math.max(...pre.map((b) => b.h)) : Math.min(...pre.map((b) => b.l));
    const sc = {
      id: spec.id, dir: spec.dir, ctx: spec.ctx, bars,
      bos1: { level },
      legs: { c1: ranges.c1, c2: ranges.c2 },
      outcome: spec.outcome,
    };
    const a = analyse(sc);
    if (!a.ok) continue;
    const pt = a.points;
    // BOS #1 must come from the impulse, and the 15M bar must close through (not just wick).
    if (!(pt.bos1.at >= ranges.imp1[0] && pt.bos1.at <= ranges.imp1[1] + 2)) continue;
    // BOS #1 must happen before Correction #1 starts.
    if (pt.bos1.at >= ranges.c1[0]) continue;
    if (!spec.noBos2) {
      if (!(pt.bos2.at >= ranges.imp2[0] && pt.bos2.at <= ranges.imp2[1])) continue;
      // Correction #1 must not take out the 15M low it started from (keeps the story clean).
      if (spec.dir === 'bullish' ? pt.c1.extreme.price <= bars[ranges.pre2[1]].l : pt.c1.extreme.price >= bars[ranges.pre2[1]].h) continue;
    } else if (pt.bos2.at >= 0) continue;
    if (!spec.noBos2 && !spec.noBos3) {
      if (!(pt.bos3.at >= ranges.imp3[0] && pt.bos3.at <= ranges.imp3[1])) continue;
      if (pt.zone.at !== ranges.c2[1]) continue; // zone = the last candle of Correction #2
      if (spec.tail === 'retest' && !(pt.retest.at >= ranges.into[0] && pt.retest.at <= ranges.into[1])) continue;
      if (spec.tail === 'retest' && pt.invalid.at >= 0) continue;
      if (spec.tail === 'invalid' && pt.invalid.at !== ranges.slice[0]) continue;
      if (spec.tail === 'invalid' && !(pt.retest.at > pt.invalid.at)) continue; // price returns to the dead zone afterwards
      if (spec.tail === 'missed' && pt.retest.at >= 0) continue;
    }
    if (spec.noBos3 && pt.bos3?.at >= 0) continue;
    return { sc: { ...sc, legs: { ...sc.legs, bos2: pt.bos2?.at >= 0 ? { at: pt.bos2.at } : undefined, bos3: pt.bos3?.at >= 0 ? { at: pt.bos3.at } : undefined }, zoneAt: pt.zone?.at, bos1: { level, at15: pt.bos1.at15 } }, seed, a, ranges };
  }
  throw new Error(`No seed produced a valid ${spec.id}`);
}

if (process.env.DBG) { const spec = SPECS.find(s=>s.id===process.env.DBG); const legs = plan(spec.dir, spec.base, { tail: TAILS[spec.tail] }); const { bars, ranges } = generate(spec.base, legs, 7919+spec.base); const pre = bars.slice(0, ranges.pre1[1]+1); const level = Math.max(...pre.map(b=>b.h)); const a = analyse({ id: spec.id, dir: spec.dir, bars, bos1:{level}, legs:{c1:ranges.c1,c2:ranges.c2}, outcome: spec.outcome }); console.log(JSON.stringify(ranges), a.problems, JSON.stringify(a.points), a.zone); bars.slice(28).forEach((b,i)=>console.log(i+28, JSON.stringify(b))); process.exit(0); }
const out = {};
for (const spec of SPECS) {
  const { sc, seed, a, ranges } = build(spec);
  out[spec.id] = { ...sc, ranges };
  const p = a.points;
  console.log(`${spec.id.padEnd(13)} seed ${String(seed).padStart(4)}  bars ${sc.bars.length}  15M ${to15(sc.bars).length}  BOS1@15M ${p.bos1.at15}  BOS2@${p.bos2?.at ?? '-'}  BOS3@${p.bos3?.at ?? '-'}  zone@${p.zone?.at ?? '-'}  retest@${p.retest?.at ?? '-'}  invalid@${p.invalid?.at ?? '-'}  → ${a.outcome}`);
}

const header = `/* sd-scenarios.js — GENERATED by strategy-lab/tools/build-scenarios.mjs. Do not edit by hand.
 * 5M candle data for Strategy Lab. Every scenario was checked against the rules in sd-core.js.
 */\n`;
writeFileSync(new URL('../../shared/sd-scenarios.js', import.meta.url), `${header}export const SCENARIOS = ${JSON.stringify(out)};\n`);
console.log('wrote shared/sd-scenarios.js');
