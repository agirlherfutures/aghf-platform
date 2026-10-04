/**
 * structure-charts.js — A Girl & Her Futures™
 *
 * Animated SVG price charts for the market-structure lessons (Phase 2+).
 * A chart is described by its swing points; candles are generated along
 * the path between them, so every chart reads like a real chart while
 * staying exact about where the swings are.
 *
 * Coordinates live in a 700 × 320 viewBox (y grows downward, so a smaller
 * y is a higher price). Any element with an `id` starts hidden and is
 * shown with chart.reveal(id); everything else shows immediately.
 *
 *   spec = {
 *     swings: [[x, y], ...],          // the turning points, left to right
 *     candles: true,                  // generate candles along the path
 *     line: 'dashed' | 'solid' | null // a structure line through the swings
 *     seed: 7,                        // candle randomness (deterministic)
 *     marks:  [{ i, label, tone, id, kind: 'dot' | 'pill' }],
 *     hlines: [{ y, label, tone, id, door: true }],
 *     boxes:  [{ x1, y1, x2, y2, label, tone, id }],
 *     paths:  [{ swings, tone, id, dashed }],   // extra overlay paths
 *     notes:  [{ x, y, text, tone, id }],
 *     progress: 3,                    // start with price only up to swing 3
 *     zoom: [x, y, w, h],             // start zoomed in (chart.zoomTo(null) zooms out)
 *   }
 *
 * Built-in groups that views can show, hide or dim: '@candles', '@line'.
 * marks also take size: 'sm' (minor swings) or big: true (major swings).
 *
 * Tones: 'up' (teal), 'down' (pink), 'gold', 'purple', 'muted'.
 */

const NS = 'http://www.w3.org/2000/svg';
const W = 700, H = 320;
const TONE = {
  up: { fill: '#7ECEC4', dark: '#2F8A7F', pale: '#E8F8F6' },
  down: { fill: '#F4829A', dark: '#C2475F', pale: '#FDE8ED' },
  gold: { fill: '#F5A857', dark: '#B86E12', pale: '#FEF3E4' },
  purple: { fill: '#7F77DD', dark: '#5E56B8', pale: '#EEEDFE' },
  muted: { fill: '#C9B9AE', dark: '#7A5C50', pale: '#F6EDE6' },
};

function seeded(seed) {
  let s = (seed || 1) * 9301 + 49297;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/** Is swing i a high (above its neighbors) or a low? */
export function swingKind(swings, i) {
  const y = swings[i][1];
  const prev = swings[i - 1], next = swings[i + 1];
  const ref = prev ? prev[1] : next ? next[1] : y;
  return y <= ref ? 'high' : 'low';
}

/** Candles walking from swing to swing. Each candle: { x, o, c, h, l }. */
export function buildCandles(swings, seed = 3, density = 1) {
  const rnd = seeded(seed);
  const out = [];
  for (let s = 0; s < swings.length - 1; s++) {
    const [x0, y0] = swings[s], [x1, y1] = swings[s + 1];
    const n = Math.max(2, Math.round(((x1 - x0) / 20) * density));
    let prev = y0;
    for (let k = 0; k < n; k++) {
      const f = (k + 1) / n;
      // Ease toward the target with a little noise, so pushes have pullbacks inside.
      let c = y0 + (y1 - y0) * f + (k < n - 1 ? (rnd() - 0.5) * Math.abs(y1 - y0) * 0.35 : 0);
      if (k === n - 1) c = y1;
      const o = prev;
      const wick = 3 + rnd() * 7;
      let h = Math.min(o, c) - wick * rnd(), l = Math.max(o, c) + wick * rnd();
      // The candle that makes the swing reaches exactly the swing price.
      if (k === n - 1) { if (y1 < y0) h = y1; else l = y1; }
      out.push({ x: x0 + (x1 - x0) * ((k + 0.5) / n), o, c, h, l, w: Math.min(14, ((x1 - x0) / n) * 0.62), seg: s });
      prev = c;
    }
  }
  return out;
}

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function pill(g, x, y, text, tone, big, small) {
  const t = TONE[tone] || TONE.purple;
  const fs = big ? 15 : small ? 10.5 : 13;
  const w = Math.max(34, text.length * fs * 0.62 + 18), h = fs + 12;
  el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: t.fill }, g);
  const tx = el('text', { x, y: y + fs * 0.36, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: '#fff', 'font-family': 'DM Sans, sans-serif' }, g);
  tx.textContent = text;
  return { w, h };
}

/**
 * Draw a chart into `container`. Returns a small API for revealing parts,
 * labelling swings and listening for taps on swing points.
 */
export function mountChart(container, spec, opts = {}) {
  const swings = spec.swings || [];
  const wrap = document.createElement('div');
  wrap.className = 'sc-wrap';
  container.appendChild(wrap);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sc-svg', role: 'img', 'aria-label': opts.label || 'Price chart' }, wrap);

  // Soft grid.
  const grid = el('g', { class: 'sc-grid' }, svg);
  for (let i = 1; i < 5; i++) el('line', { x1: 0, x2: W, y1: (H / 5) * i, y2: (H / 5) * i }, grid);

  const layer = (cls) => el('g', { class: cls }, svg);
  const boxes = layer('sc-boxes'), lines = layer('sc-hlines'), candleG = layer('sc-candles');
  const overlay = layer('sc-overlay'), pointsG = layer('sc-points'), labels = layer('sc-labels');

  const reveal = {};
  const track = (id, node) => { if (!id) return; node.classList.add('sc-hide'); (reveal[id] = reveal[id] || []).push(node); };
  const group = (id, node) => { (reveal[id] = reveal[id] || []).push(node); };
  group('@candles', candleG);

  (spec.boxes || []).forEach((b) => {
    const t = TONE[b.tone] || TONE.muted;
    const g = el('g', { class: 'sc-box' }, boxes);
    el('rect', { x: b.x1, y: b.y1, width: b.x2 - b.x1, height: b.y2 - b.y1, rx: 10, fill: t.pale, stroke: t.fill, 'stroke-width': 2, 'stroke-dasharray': b.dashed === false ? null : '8 6' }, g);
    if (b.label) {
      const tx = el('text', { x: b.labelRight ? b.x2 - 4 : b.x1 + 4, y: b.labelBelow ? b.y2 + 18 : b.y1 - 8, 'text-anchor': b.labelRight ? 'end' : 'start', 'font-size': b.size || 13, 'font-weight': 800, fill: t.dark, 'font-family': 'DM Sans, sans-serif' }, g);
      tx.textContent = b.label;
    }
    track(b.id, g);
  });

  (spec.hlines || []).forEach((hl) => {
    const t = TONE[hl.tone] || TONE.purple;
    const g = el('g', { class: 'sc-hline' }, lines);
    el('line', { x1: hl.x1 ?? 8, x2: hl.x2 ?? W - 8, y1: hl.y, y2: hl.y, stroke: t.fill, 'stroke-width': hl.door ? 4 : 2.5, 'stroke-dasharray': hl.door ? null : '9 7' }, g);
    if (hl.label) {
      const lx = hl.labelX ?? (hl.x1 ?? 8) + 6;
      const tx = el('text', { x: lx, y: hl.y + (hl.below ? (hl.size || 13) + 5 : -8), 'font-size': hl.size || 13, 'font-weight': 800, fill: t.dark, 'font-family': 'DM Sans, sans-serif' }, g);
      tx.textContent = (hl.door ? '🚪 ' : '') + hl.label;
    }
    track(hl.id, g);
  });

  // Exact candles, when a chart needs specific ones: bars: [{ o, c, h, l }] spread across x1..x2.
  // Bars with an x are added after the generated candles (e.g. "then three green candles form").
  const bars = spec.bars ? spec.bars.map((b, i, arr) => {
    const x1 = spec.barsX ? spec.barsX[0] : 120, x2 = spec.barsX ? spec.barsX[1] : 580;
    const step = (x2 - x1) / Math.max(1, arr.length - 1);
    return { x: b.x ?? x1 + step * i, o: b.o, c: b.c, h: b.h ?? Math.min(b.o, b.c) - 6, l: b.l ?? Math.max(b.o, b.c) + 6, w: b.w ?? Math.min(34, step * 0.55), seg: b.seg ?? Math.max(0, swings.length - 1), id: b.id };
  }) : [];
  const generated = spec.candles !== false && swings.length > 1 ? buildCandles(swings, spec.seed, spec.density || 1) : [];
  const candleNodes = [];
  if (bars.length || generated.length) {
    [...generated, ...bars].forEach((c, i) => {
      const up = c.c < c.o, t = up ? TONE.up : TONE.down;
      const g = el('g', { class: 'sc-candle', style: `animation-delay:${Math.min(i * 28, 1400)}ms` }, candleG);
      candleNodes.push({ g, seg: c.seg });
      if (c.id) track(c.id, g);
      el('line', { x1: c.x, x2: c.x, y1: c.h, y2: c.l, stroke: t.fill, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      el('rect', { x: c.x - c.w / 2, y: Math.min(c.o, c.c), width: c.w, height: Math.max(2.5, Math.abs(c.o - c.c)), rx: 2, fill: t.fill }, g);
    });
  }

  if (spec.line && swings.length > 1) {
    const p = el('polyline', { points: swings.map((s) => s.join(',')).join(' '), class: 'sc-structure', fill: 'none', stroke: '#2C1810', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-dasharray': spec.line === 'dashed' ? '7 7' : null, opacity: 0.55 }, overlay);
    track(spec.lineId, p);
    group('@line', p);
  }

  (spec.paths || []).forEach((pa) => {
    const t = TONE[pa.tone] || TONE.purple;
    const p = el('polyline', { points: pa.swings.map((s) => s.join(',')).join(' '), fill: 'none', stroke: t.fill, 'stroke-width': pa.width || 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': pa.dashed ? '8 7' : null }, overlay);
    track(pa.id, p);
  });

  // Swing points: always present (hidden until a mark or tap mode shows them).
  const points = swings.map((s, i) => {
    const g = el('g', { class: 'sc-point', 'data-i': i }, pointsG);
    el('circle', { cx: s[0], cy: s[1], r: 22, class: 'sc-hit' }, g);
    el('circle', { cx: s[0], cy: s[1], r: 7, class: 'sc-dot' }, g);
    return g;
  });

  const markNodes = {};
  function drawMark(m) {
    const [x, y] = swings[m.i];
    const kind = m.pos || swingKind(swings, m.i);
    const g = el('g', { class: 'sc-mark' }, labels);
    const t = TONE[m.tone] || TONE.purple;
    const sm = m.size === 'sm';
    el('circle', { cx: x, cy: y, r: m.big ? 9 : sm ? 4.5 : 7, fill: t.fill, stroke: '#fff', 'stroke-width': sm ? 1.5 : 2.5 }, g);
    if (m.label) pill(g, x, kind === 'high' ? y - (m.big ? 27 : sm ? 18 : 24) : y + (m.big ? 27 : sm ? 18 : 24), m.label, m.tone, m.big, sm);
    if (m.strike) {
      const off = kind === 'high' ? -24 : 24;
      el('line', { x1: x - 22, x2: x + 22, y1: y + off, y2: y + off, stroke: TONE.down.dark, 'stroke-width': 3 }, g);
    }
    track(m.id, g);
    if (m.key) markNodes[m.key] = g;
    return g;
  }
  (spec.marks || []).forEach(drawMark);

  (spec.notes || []).forEach((n) => {
    const t = TONE[n.tone] || TONE.muted;
    const tx = el('text', { x: n.x, y: n.y, 'text-anchor': n.anchor || 'middle', 'font-size': n.size || 14, 'font-weight': 800, fill: t.dark, 'font-family': 'DM Sans, sans-serif' }, labels);
    tx.textContent = n.text;
    track(n.id, tx);
  });

  // Zoom: animate the viewBox between a close-up and the full chart.
  let box = spec.zoom ? spec.zoom.slice() : [0, 0, W, H];
  const setBox = (b) => {
    svg.setAttribute('viewBox', b.map((v) => v.toFixed(1)).join(' '));
    svg.style.overflow = b[2] < W - 0.5 ? 'hidden' : '';
  };
  if (spec.zoom) setBox(box);
  function zoomTo(target, ms = 1400) {
    const from = box.slice(), to = target || [0, 0, W, H];
    const t0 = performance.now();
    return new Promise((done) => {
      function tick(now) {
        const f = Math.min(1, (now - t0) / ms), e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
        box = from.map((v, k) => v + (to[k] - v) * e);
        setBox(box);
        if (f < 1) requestAnimationFrame(tick); else done();
      }
      requestAnimationFrame(tick);
    });
  }

  // Progress: price has only travelled up to swing k (later candles hidden).
  let reached = swings.length;
  function progress(k) {
    const prev = reached;
    reached = k;
    let d = 0;
    candleNodes.forEach(({ g, seg }) => {
      const on = seg < k;
      g.style.display = on ? '' : 'none';
      if (on && seg >= prev) { g.style.animation = 'none'; void g.getBoundingClientRect(); g.style.animation = ''; g.style.animationDelay = `${d++ * 70}ms`; }
    });
  }
  if (spec.progress != null) { reached = spec.progress; candleNodes.forEach(({ g, seg }) => { g.style.display = seg < reached ? '' : 'none'; }); }

  // Comparison overlay: a new swing measured against the previous one.
  const compareG = el('g', { class: 'sc-compare' }, svg);
  function compare(c) {
    compareG.innerHTML = '';
    const [nx, ny] = swings[c.i], [px, py] = swings[c.prev];
    const nt = TONE[c.tone] || (ny < py ? TONE.up : TONE.down);
    const far = nx + 70;
    const tw = Math.max((c.newText || 'NEW').length, (c.prevText || 'PREVIOUS').length) * 8.2;
    const right = far + 6 + tw < W;
    const left = !right && px - 10 - tw > 0;
    el('line', { x1: left ? px - 6 : px, x2: far, y1: py, y2: py, stroke: TONE.muted.dark, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, compareG);
    el('line', { x1: left ? px - 6 : nx - 30, x2: far, y1: ny, y2: ny, stroke: nt.dark, 'stroke-width': 2.5, class: 'sc-draw' }, compareG);
    const ax = nx + 46;
    el('line', { x1: ax, x2: ax, y1: py, y2: ny + (ny < py ? 6 : -6), stroke: nt.dark, 'stroke-width': 2.5, 'marker-end': 'url(#scArrow)' }, compareG);
    const lx = right ? far + 6 : left ? px - 12 : far, anchor = right ? 'start' : 'end';
    const lift = right || left ? 4 : -6;
    const gap = Math.abs(ny - py) < 22 ? (ny < py ? -8 : 8) : 0;
    const t1 = el('text', { x: lx, y: ny + lift + gap, 'text-anchor': anchor, 'font-size': 13, 'font-weight': 800, fill: nt.dark, 'font-family': 'DM Sans, sans-serif', class: 'sc-halo' }, compareG);
    t1.textContent = c.newText || 'NEW';
    const t2 = el('text', { x: lx, y: py + lift - gap + (right || left ? 0 : 20), 'text-anchor': anchor, 'font-size': 13, 'font-weight': 800, fill: TONE.muted.dark, 'font-family': 'DM Sans, sans-serif', class: 'sc-halo' }, compareG);
    t2.textContent = c.prevText || 'PREVIOUS';
    compareG.classList.remove('sc-in'); void compareG.getBoundingClientRect(); compareG.classList.add('sc-in');
  }
  const defs = el('defs', {}, svg);
  const mk = el('marker', { id: 'scArrow', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#5E56B8' }, mk);

  // Candle-by-candle playback: show the first k candles; new ones print one after another.
  let shown = candleNodes.length;
  function showCandles(k, gap = 160) {
    const prev = shown;
    shown = Math.max(0, Math.min(k, candleNodes.length));
    let d = 0;
    candleNodes.forEach(({ g }, i) => {
      const on = i < shown;
      g.style.display = on ? '' : 'none';
      if (on && i >= prev) { g.style.animation = 'none'; void g.getBoundingClientRect(); g.style.animation = ''; g.style.animationDelay = `${d++ * gap}ms`; }
    });
    return Math.max(0, (d - 1) * gap) + 350;
  }
  if (spec.showCandles != null) { shown = spec.showCandles; candleNodes.forEach(({ g }, i) => { g.style.display = i < shown ? '' : 'none'; }); }

  const api = {
    svg, wrap, points, swings, zoomTo, progress, compare, showCandles, candleCount: candleNodes.length,
    clearCompare() { compareG.innerHTML = ''; },
    dim(ids, on = true) { [].concat(ids || []).forEach((id) => (reveal[id] || []).forEach((n) => n.classList.toggle('sc-dim', on))); },
    /** The labellable swing nearest a screen point, or -1. */
    pointAt(clientX, clientY, which, radius = 46) {
      const m = svg.getScreenCTM();
      if (!m) return -1;
      const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
      let best = -1, bd = radius;
      swings.forEach(([x, y], i) => {
        if (which && !which.includes(i)) return;
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    },
    reveal(ids) { [].concat(ids || []).forEach((id) => (reveal[id] || []).forEach((n) => { n.classList.remove('sc-hide', 'sc-dim'); if (!id.startsWith('@')) n.classList.add('sc-in'); })); },
    hide(ids) { [].concat(ids || []).forEach((id) => (reveal[id] || []).forEach((n) => n.classList.add('sc-hide'))); },
    ids: () => Object.keys(reveal),
    /** Put (or replace) a label on swing i. */
    label(i, text, tone, key) {
      const k = key || `pt${i}`;
      if (markNodes[k]) markNodes[k].remove();
      const g = drawMark({ i, label: text, tone, key: k });
      g.classList.add('sc-in');
      return g;
    },
    unlabel(i, key) { const k = key || `pt${i}`; if (markNodes[k]) { markNodes[k].remove(); delete markNodes[k]; } },
    /** Make swing points tappable. cb(i, pointEl). */
    tappable(cb, which) {
      wrap.classList.add('sc-tappable');
      points.forEach((p, i) => {
        if (which && !which.includes(i)) { p.classList.add('sc-off'); return; }
        p.classList.add('sc-tap');
        p.addEventListener('click', () => cb(i, p));
      });
    },
    setPoint(i, state) { points[i].classList.remove('is-good', 'is-bad', 'is-picked', 'is-hover'); if (state) points[i].classList.add(`is-${state}`); },
    flash(cls = 'sc-shake') { wrap.classList.remove(cls); void wrap.offsetWidth; wrap.classList.add(cls); },
  };
  return api;
}
