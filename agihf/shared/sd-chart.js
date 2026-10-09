/**
 * sd-chart.js — A Girl & Her Futures™
 * Strategy Lab chart: one set of 5M candles, viewable as 5M or 15M (the 15M
 * candles are built from the same 5M data, so switching never changes price).
 *
 *   const ch = mountSdChart(container, scenario, { tf: '5M', k: 20 })
 *   ch.show(k)                 show the first k 5M bars (future bars are never in the DOM)
 *   ch.play(toK, ms)           print bars one at a time up to toK; returns a Promise
 *   ch.setTf('15M' | '5M')
 *   ch.level(key, { price, label, tone, at })   horizontal line from 5M bar `at`
 *   ch.band(key, { from, to, label, tone })      shaded 5M range (corrections)
 *   ch.zone({ at, hi, lo, state })               state: potential | active | invalid
 *   ch.tag(key, { at, text, tone, where })       pill over / under a 5M bar
 *   ch.tappable(cb, filter)    tap a candle; cb(i5) gives the 5M index (on 15M: the group's last bar)
 *   ch.mark(i5, state)         good | bad | pick | null
 *   ch.clear(kind?)            remove levels / bands / tags / zone
 */
import { to15, bar15Of } from './sd-core.js';

const NS = 'http://www.w3.org/2000/svg';
const H = 340;
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => { if (v != null) n.setAttribute(k, v); });
  if (parent) parent.appendChild(n);
  return n;
}

export function mountSdChart(container, sc, opts = {}) {
  const compact = opts.compact ?? (container.clientWidth > 0 && container.clientWidth < 560);
  const W = compact ? 440 : 760;
  const PAD_L = 12, PAD_R = compact ? 74 : 96, TOP = 26, BOT = 22;
  const bars5 = sc.bars;
  const total5 = opts.total || bars5.length;
  const st = { tf: opts.tf || '5M', k: opts.k ?? 0, levels: {}, bands: {}, tags: {}, zone: null, marks: {}, tap: null };

  const wrap = document.createElement('div');
  wrap.className = 'sd-chart';
  wrap.innerHTML = `<div class="sd-chart-top"><span class="sd-tf"></span><span class="sd-sym">${opts.symbol || 'MNQ'}</span>${opts.toggle !== false ? '<div class="sd-tfsw" role="group" aria-label="Timeframe"><button type="button" data-tf="15M">15M</button><button type="button" data-tf="5M">5M</button></div>' : ''}</div>`;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sd-svg', role: 'img', 'aria-label': opts.label || 'Price chart' }, wrap);
  container.innerHTML = '';
  container.appendChild(wrap);
  const L = {};
  ['grid', 'bands', 'zone', 'levels', 'cands', 'tags', 'hit'].forEach((k) => { L[k] = el('g', { class: `sd-${k}` }, svg); });

  let X, Y, step, n, lo, hi;

  function series() {
    const shown = bars5.slice(0, st.k);
    if (st.tf === '5M') return shown.map((b, i) => ({ ...b, i5: i, from: i, to: i }));
    return to15(shown).map((b, j) => ({ ...b, i5: b.to, j, forming: b.to - b.from < 2 && b.to === st.k - 1 }));
  }
  const slotOf = (i5) => (st.tf === '5M' ? i5 : bar15Of(i5));

  function layout(list) {
    n = st.tf === '5M' ? total5 : Math.ceil(total5 / 3);
    n = Math.max(n, st.tf === '5M' ? 24 : 10);
    step = (W - PAD_L - PAD_R) / n;
    X = (slot) => PAD_L + step * (slot + 0.5);
    const ps = list.flatMap((b) => [b.h, b.l]);
    Object.values(st.levels).forEach((l) => { if (l.at == null || l.at < st.k) ps.push(l.price); });
    if (st.zone && st.zone.at < st.k) ps.push(st.zone.hi, st.zone.lo);
    if (!ps.length) ps.push(bars5[0].o);
    const a = Math.min(...ps), b = Math.max(...ps);
    const pad = Math.max((b - a) * 0.12, 3);
    lo = a - pad; hi = b + pad;
    Y = (p) => TOP + (hi - p) / (hi - lo) * (H - TOP - BOT);
  }

  function draw() {
    const list = series();
    layout(list);
    Object.values(L).forEach((g) => { g.innerHTML = ''; });
    wrap.querySelector('.sd-tf').textContent = st.tf;
    wrap.querySelectorAll('.sd-tfsw button').forEach((b) => b.classList.toggle('on', b.dataset.tf === st.tf));
    wrap.classList.toggle('is-15', st.tf === '15M');

    [0.25, 0.5, 0.75].forEach((f) => { const y = TOP + f * (H - TOP - BOT); el('line', { x1: PAD_L, x2: W - PAD_R, y1: y, y2: y, class: 'sd-gl' }, L.grid); });

    // Corrections and other ranges, as soft vertical bands.
    Object.values(st.bands).forEach((bd) => {
      if (bd.from >= st.k) return;
      const s0 = slotOf(bd.from), s1 = slotOf(Math.min(bd.to, st.k - 1));
      const x0 = X(s0) - step / 2, x1 = X(s1) + step / 2;
      const g = el('g', { class: `sd-band sd-t-${bd.tone || 'purple'}` }, L.bands);
      el('rect', { x: x0, y: TOP - 18, width: Math.max(step, x1 - x0), height: H - TOP - BOT + 18, rx: 8 }, g);
      if (bd.label) { const t = el('text', { x: (x0 + x1) / 2, y: TOP - 6, 'text-anchor': 'middle' }, g); t.textContent = bd.label; }
    });

    // The zone: from the zone-forming candle to the right edge.
    if (st.zone && st.zone.at < st.k) {
      const z = st.zone;
      const x0 = X(slotOf(z.at)) - step * 0.45;
      const g = el('g', { class: `sd-zonebox is-${z.state || 'potential'}${z.bull ? ' is-demand' : ' is-supply'}` }, L.zone);
      el('rect', { x: x0, y: Y(z.hi), width: W - PAD_R - x0, height: Math.max(3, Y(z.lo) - Y(z.hi)), rx: 4 }, g);
      // Label outside the box, on the side price comes back from (above supply, below demand).
      const text = z.label || (z.state === 'invalid' ? 'ZONE INVALID' : z.state === 'active' ? (z.bull ? 'DEMAND · ACTIVE' : 'SUPPLY · ACTIVE') : (z.bull ? 'POTENTIAL DEMAND' : 'POTENTIAL SUPPLY'));
      // Label inside the box, just right of the zone candle; outside (on the far side) if the box is too thin.
      const hgt = Y(z.lo) - Y(z.hi);
      const inside = hgt >= 15;
      const lx = x0 + step * 1.6 + 4;
      const ly = inside ? Y(z.hi) + hgt / 2 + 3.5 : z.bull ? Y(z.lo) + 13 : Y(z.hi) - 5;
      if (!inside) el('rect', { x: lx - 4, y: ly - 11, width: text.length * 6.6 + 8, height: 15, rx: 7, class: 'sd-zonelbl' }, g);
      const t = el('text', { x: lx, y: ly, 'text-anchor': 'start' }, g);
      t.textContent = text;
    }

    // Levels: BOS lines, entries, the 1H boundaries. Price pills are nudged apart so they never overlap.
    const lv = Object.values(st.levels).filter((l) => l.at == null || l.at < st.k).map((l) => ({ ...l, y: Y(l.price) })).sort((p1, p2) => p1.y - p2.y);
    lv.forEach((l, i) => { l.py = i && l.y - lv[i - 1].py < 24 ? lv[i - 1].py + 24 : l.y; });
    lv.forEach((l) => {
      const g = el('g', { class: `sd-level sd-t-${l.tone || 'ink'}` }, L.levels);
      el('line', { x1: l.at != null ? X(slotOf(l.at)) : PAD_L, x2: W - PAD_R + 4, y1: l.y, y2: l.y }, g);
      if (Math.abs(l.py - l.y) > 1) el('line', { x1: W - PAD_R + 4, x2: W - PAD_R + 8, y1: l.y, y2: l.py, class: 'sd-level-elbow' }, g);
      el('rect', { x: W - PAD_R + 6, y: l.py - 11, width: PAD_R - 8, height: 22, rx: 11 }, g);
      const t = el('text', { x: W - PAD_R / 2 + 3, y: l.py + 4, 'text-anchor': 'middle' }, g);
      t.textContent = l.label || fmt(l.price);
    });

    // Candles.
    const w = Math.max(3, Math.min(st.tf === '5M' ? 11 : 22, step * 0.62));
    list.forEach((b) => {
      const slot = st.tf === '5M' ? b.i5 : b.j;
      const upC = b.c >= b.o;
      const mk = st.marks[st.tf === '5M' ? b.i5 : `g${b.j}`] || (st.tf === '5M' ? null : st.marks[b.to]);
      const g = el('g', { class: `sd-c ${upC ? 'up' : 'dn'}${b.forming ? ' forming' : ''}${mk ? ` is-${mk}` : ''}`, 'data-i5': b.i5 }, L.cands);
      el('line', { x1: X(slot), x2: X(slot), y1: Y(b.h), y2: Y(b.l), class: 'sd-wick' }, g);
      const top = Y(Math.max(b.o, b.c)), bot = Y(Math.min(b.o, b.c));
      el('rect', { x: X(slot) - w / 2, y: top, width: w, height: Math.max(1.6, bot - top), rx: 1.5, class: 'sd-body' }, g);
      if (st.tap && (!st.tap.filter || st.tap.filter(b.i5, b))) {
        g.classList.add('sd-tap');
        const hit = el('rect', { x: X(slot) - step / 2, y: Y(b.h) - 10, width: step, height: Y(b.l) - Y(b.h) + 20, class: 'sd-hitbox', tabindex: 0, role: 'button', 'aria-label': `Candle ${slot + 1}` }, L.hit);
        const go = () => st.tap.cb(b.i5, b);
        hit.addEventListener('click', go);
        hit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      }
    });

    // Tags, stacked so neighbours don't collide.
    const used = {};
    Object.values(st.tags).forEach((t) => {
      if (t.at >= st.k) return;
      const slot = slotOf(t.at);
      const src = st.tf === '5M' ? bars5[t.at] : list.find((b) => b.j === slot);
      if (!src) return;
      const above = t.where !== 'below';
      const key = `${slot}:${above}`;
      const stack = (used[key] = (used[key] || 0) + 1) - 1;
      const y = above ? Y(src.h) - 14 - stack * 22 : Y(src.l) + 16 + stack * 22;
      const g = el('g', { class: `sd-tag sd-t-${t.tone || 'ink'}` }, L.tags);
      const tw = Math.max(20, t.text.length * 6.4 + 14);
      const x = Math.min(Math.max(X(slot), PAD_L + tw / 2), W - PAD_R - tw / 2);
      el('rect', { x: x - tw / 2, y: y - 9.5, width: tw, height: 19, rx: 9.5 }, g);
      const tx = el('text', { x, y: y + 3.6, 'text-anchor': 'middle' }, g);
      tx.textContent = t.text;
    });
  }

  wrap.querySelectorAll('.sd-tfsw button').forEach((b) => b.addEventListener('click', () => { api.setTf(b.dataset.tf); opts.onTf?.(b.dataset.tf); }));

  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const api = {
    get k() { return st.k; },
    get tf() { return st.tf; },
    el: wrap,
    show(k) { st.k = Math.max(0, Math.min(bars5.length, k)); draw(); return api; },
    play(toK, ms = 140) {
      toK = Math.min(bars5.length, toK);
      if (reduced() || toK <= st.k) { api.show(toK); return Promise.resolve(); }
      return new Promise((res) => {
        const tick = () => { st.k += 1; draw(); if (st.k >= toK) res(); else setTimeout(tick, ms); };
        tick();
      });
    },
    setTf(tf) { st.tf = tf; draw(); return api; },
    level(key, l) { if (l) st.levels[key] = l; else delete st.levels[key]; draw(); return api; },
    band(key, b) { if (b) st.bands[key] = b; else delete st.bands[key]; draw(); return api; },
    zone(z) { st.zone = z ? { bull: sc.dir === 'bullish', ...z } : null; draw(); return api; },
    tag(key, t) { if (t) st.tags[key] = t; else delete st.tags[key]; draw(); return api; },
    tappable(cb, filter) { st.tap = cb ? { cb, filter } : null; draw(); return api; },
    mark(i, state) { if (state) st.marks[i] = state; else delete st.marks[i]; draw(); return api; },
    clearMarks() { st.marks = {}; draw(); return api; },
    flash() { svg.classList.remove('sd-shake'); void svg.getBoundingClientRect(); svg.classList.add('sd-shake'); },
    clear(kind) {
      if (!kind || kind === 'levels') st.levels = {};
      if (!kind || kind === 'bands') st.bands = {};
      if (!kind || kind === 'tags') st.tags = {};
      if (!kind || kind === 'zone') st.zone = null;
      draw(); return api;
    },
  };
  draw();
  return api;
}
