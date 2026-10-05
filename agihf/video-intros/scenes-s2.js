/**
 * scenes-s2.js — scene types for the Phase 2 Section 2 intros (Breaks, Shifts & Fakeouts).
 *
 *   'break-chart'  price plays candle by candle through swings while levels,
 *                  labels and verdict pills appear on a beat.
 *     swings: [[u, v], …]           u 0..1 left→right, v 0..1 bottom→top
 *     per:    candles per leg (number or array, one per leg)
 *     play:   [{ to, at, dur }]     reveal the legs up to swing `to` between at and at+dur
 *     extra:  [{ u, o, c, hi, lo, at, out }]   exact candles (o/c/hi/lo in v units)
 *     levels: [{ v, from, label, tone, at, out, below }]
 *     marks:  [{ i, text, tone, at, out, below }]      pills on swing points
 *     pills:  [{ u, v, text, tone, at, out, fs }]
 *     rings:  [{ u, v, tone, at, out }]                 a pulsing circle
 *
 *   'cards'        a row of cards that pop in, each with an optional ✓ / ✗ verdict.
 *     items: [{ title, desc: [..], tone, icon, at, mark: 'yes' | 'no', markAt }]
 *
 * Both take the usual kicker + headlines text layer.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const TONE = { up: C.teal, down: C.pink, gold: C.peach, purple: C.purple, muted: '#B9A79B', dark: C.dark };
  const fade = (t, at, out) => clamp((t - at) / 0.5) * (out != null ? 1 - clamp((t - out) / 0.4) : 1);
  const pop = (t, at, out) => (out != null && t > out ? 1 - clamp((t - out) / 0.4) : back((t - at) / 0.55));

  const pill = (x, y, text, col, k, fs = 28) => {
    if (k <= 0) return '';
    const w = text.length * fs * 0.6 + 34;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${text}</text></g>`;
  };

  // Deterministic candles that walk from swing to swing; the last candle of each leg makes the swing's extreme.
  function buildCandles(s) {
    let seed = s.seed || 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const out = [];
    for (let i = 0; i < s.swings.length - 1; i++) {
      const [u0, v0] = s.swings[i], [u1, v1] = s.swings[i + 1];
      const n = Array.isArray(s.per) ? s.per[i] : (s.per || 4);
      let prev = v0;
      for (let k = 0; k < n; k++) {
        const f = (k + 1) / n, last = k === n - 1;
        let c = lerp(v0, v1, f) + (last ? 0 : (rnd() - 0.5) * Math.abs(v1 - v0) * 0.35);
        const up = v1 > v0;
        let hi = Math.max(prev, c) + 0.01 + rnd() * 0.02, lo = Math.min(prev, c) - 0.01 - rnd() * 0.02;
        if (last) { if (up) { hi = v1; c = v1 - 0.02 - rnd() * 0.015; } else { lo = v1; c = v1 + 0.02 + rnd() * 0.015; } }
        out.push({ u: lerp(u0, u1, (k + 0.6) / n), o: prev, c, hi: Math.max(hi, prev, c), lo: Math.min(lo, prev, c), leg: i });
        prev = c;
      }
    }
    return out;
  }

  function revealTime(s, cdl, idx, legStart) {
    const plays = s.play || [{ to: s.swings.length - 1, at: s.start + 0.4, dur: 3 }];
    let fromLeg = 0;
    for (const p of plays) {
      if (cdl.leg < p.to) {
        const inStage = legStart.filter((c) => c.leg >= fromLeg && c.leg < p.to);
        const j = inStage.indexOf(cdl);
        return p.at + (p.dur * j) / Math.max(1, inStage.length);
      }
      fromLeg = p.to;
    }
    return Infinity;
  }

  function candleSvg(X, Y, c, p, bw, op = 1) {
    const up = c.c >= c.o, col = up ? C.teal : C.pink, cx = X(c.u);
    const cc = lerp(c.o, c.c, p);
    return `<g opacity="${op}"><line x1="${cx}" x2="${cx}" y1="${Y(lerp(Math.max(c.o, c.c), c.hi, p))}" y2="${Y(lerp(Math.min(c.o, c.c), c.lo, p))}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
      <rect x="${cx - bw / 2}" y="${Y(Math.max(c.o, cc))}" width="${bw}" height="${Math.max(3, Math.abs(Y(c.o) - Y(cc)))}" rx="3" fill="${col}"/></g>`;
  }

  // Card icons drawn as shapes (text glyphs can render as emoji).
  function iconSvg(kind, x, y, col) {
    if (kind === 'bar') return `<line x1="${x}" x2="${x}" y1="${y - 46}" y2="${y + 46}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><rect x="${x - 16}" y="${y - 28}" width="32" height="56" rx="5" fill="${col}"/>`;
    if (kind === 'dot') return `<circle cx="${x}" cy="${y}" r="12" fill="${col}"/>`;
    if (kind === 'diamond') return `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="6" fill="${col}" transform="rotate(45 ${x} ${y})"/>`;
    if (kind === 'square') return `<rect x="${x - 38}" y="${y - 38}" width="76" height="76" rx="12" fill="none" stroke="${col}" stroke-width="9"/>`;
    return `<text x="${x}" y="${y + 28}" font-size="78" text-anchor="middle" fill="${col}" font-weight="900" font-family="DM Sans">${kind}</text>`;
  }

  const LIVE = {
    'break-chart': (s, t) => {
      const px = 280, py = 400, pw = 1360, ph = 590;
      const x = px + 60, w = 900, y = py + 40, h = ph - 80;
      const X = (u) => x + u * w, Y = (v) => y + h - v * h;
      const cs = s._cs || (s._cs = buildCandles(s));
      const bw = s.bw || Math.min(26, (w / cs.length) * 0.55);
      let out = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>`;
      (s.levels || []).forEach((l) => {
        const k = ease((t - l.at) / 0.8) * (l.out != null ? 1 - clamp((t - l.out) / 0.4) : 1);
        if (k <= 0) return;
        const col = TONE[l.tone] || C.purple, x0 = X(l.from ?? 0), x1 = lerp(x0, px + pw - 40, k), yy = Y(l.v);
        out += `<line x1="${x0}" x2="${x1}" y1="${yy}" y2="${yy}" stroke="${col}" stroke-width="5" stroke-dasharray="16 12" opacity="${k}"/>`;
        if (l.label) out += `<text x="${px + pw - 44}" y="${yy + (l.below ? 40 : -16)}" font-size="${l.fs || 30}" font-weight="800" text-anchor="end" fill="${col}" opacity="${k}" font-family="DM Sans" paint-order="stroke" stroke="#fff" stroke-width="8">${l.label}</text>`;
      });
      cs.forEach((c) => {
        const at = revealTime(s, c, 0, cs);
        const p = ease((t - at) / 0.3);
        if (p > 0) out += candleSvg(X, Y, c, p, bw);
      });
      (s.extra || []).forEach((c) => {
        const op = fade(t, c.at, c.out);
        if (op > 0) out += candleSvg(X, Y, c, ease((t - c.at) / 0.5), bw * 1.25, op);
      });
      (s.rings || []).forEach((r) => {
        const op = fade(t, r.at, r.out);
        if (op > 0) out += `<circle cx="${X(r.u)}" cy="${Y(r.v)}" r="${30 + Math.sin(t * 5) * 5}" fill="none" stroke="${TONE[r.tone] || C.purple}" stroke-width="5" opacity="${op}"/>`;
      });
      (s.marks || []).forEach((m) => {
        const [u, v] = s.swings[m.i];
        out += pill(X(u), Y(v) + (m.below ? 52 : -52), m.text, TONE[m.tone] || C.teal, pop(t, m.at, m.out), m.fs || 24);
      });
      (s.pills || []).forEach((p) => { out += pill(X(p.u), Y(p.v), p.text, TONE[p.tone] || C.purple, pop(t, p.at, p.out), p.fs || 28); });
      return out;
    },

    cards: (s, t) => {
      const n = s.items.length, gap = 40, cw = Math.min(420, (1600 - gap * (n - 1)) / n), ch = s.cardH || 420;
      const x0 = 960 - (n * cw + (n - 1) * gap) / 2, y0 = s.top || 470;
      let out = '';
      s.items.forEach((it, i) => {
        const k = pop(t, it.at);
        if (k <= 0) return;
        const cx = x0 + i * (cw + gap) + cw / 2, col = TONE[it.tone] || C.purple;
        const dim = it.mark === 'no' && t > (it.markAt ?? Infinity) ? 0.55 : 1;
        const lines = (it.desc || []).map((d, j) => `<text x="${cx}" y="${y0 + (it.icon ? 250 : 170) + j * 42}" font-size="${s.descFs || 30}" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${d}</text>`).join('');
        out += `<g opacity="${dim}" transform="translate(${cx},${y0 + ch / 2}) scale(${k}) translate(${-cx},${-(y0 + ch / 2)})">
          <rect x="${cx - cw / 2}" y="${y0}" width="${cw}" height="${ch}" rx="36" fill="#fff" stroke="${col}" stroke-width="4"/>
          <rect x="${cx - cw / 2 + 40}" y="${y0 + 22}" width="${cw - 80}" height="10" rx="5" fill="${col}"/>
          ${it.icon ? iconSvg(it.icon, cx, y0 + 110, col) : ''}
          <text x="${cx}" y="${y0 + (it.icon ? 196 : 104)}" font-size="${s.titleFs || 42}" font-weight="800" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${it.title.split('\n').map((ln, j) => `<tspan x="${cx}" dy="${j ? (s.titleFs || 42) * 1.15 : 0}">${ln}</tspan>`).join('')}</text>
          ${lines}</g>`;
        if (it.mark && t > it.markAt) {
          const q = back((t - it.markAt) / 0.5), yes = it.mark === 'yes';
          out += `<g transform="translate(${cx + cw / 2 - 30},${y0 + 24}) scale(${q})"><circle r="44" fill="${yes ? C.teal : C.pink}"/>
            <text y="18" font-size="52" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${yes ? '✓' : '✗'}</text></g>`;
        }
      });
      return out;
    },
  };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const text = (s) => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map((h) => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;

  Object.assign(window.ILLUS.BUILD, { 'break-chart': text, cards: text });
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
