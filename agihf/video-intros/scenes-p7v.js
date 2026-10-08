/**
 * scenes-p7v.js: Phase 7 psychology videos 2-15. Same stage and helpers as scenes-p7.js.
 * Beats are named: s.b.<name> = when that script line starts.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const f1 = v => (+v).toFixed(1);
  const txt = (x, y, s, size, col, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="${o.w || 900}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || 'DM Sans'}" ${o.op != null ? `opacity="${o.op}"` : ''} ${o.ls ? `letter-spacing="${o.ls}"` : ''} ${o.it ? 'font-style="italic"' : ''}>${s}</text>`;
  const scaleAt = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k}) translate(${f1(-x)},${f1(-y)})">${inner}</g>`;
  const fade = (k, inner) => k <= 0 ? '' : `<g opacity="${clamp(k).toFixed(3)}">${inner}</g>`;
  const between = (t, a, b, d = 0.5) => t < a || t > b + 0.5 ? 0 : t > b ? 1 - seg(t, b, b + 0.5) : pop(t, a, d);
  const bg = (fill) => `<rect width="1920" height="1080" fill="${fill}"/>`;
  const grad = (id, a, b, vert = true) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 0 : 1}" y2="${vert ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
  const YOU = { skin: '#9A6244', hair: '#22140E', hairStyle: 'puff', shirt: '#F4829A', pants: '#3D3550' };
  const you = (t, o) => A.person(t, Object.assign({ look: YOU, seed: 3 }, o));
  const host = (t, o) => {
    const w = o.w || 520, h = w * 1.4;
    const enter = o.enterAt != null ? back((t - o.enterAt) / 0.9) : 1;
    return A.aristella(t, o).replace('<svg ', `<svg x="${o.x}" y="${f1(o.y + (1 - enter) * 700)}" width="${w}" height="${h}" `);
  };
  const thought = (x, y, text, k, o = {}) => {
    if (k <= 0) return '';
    const fs = o.size || 46, w = o.w || [...text].length * fs * 0.5 + 90, h = fs * 2.1;
    return scaleAt(x, y, k, `<g><ellipse cx="${x - w * 0.28}" cy="${y + h * 0.62}" rx="16" ry="12" fill="#fff" opacity=".95"/><ellipse cx="${x - w * 0.36}" cy="${y + h * 0.9}" rx="9" ry="7" fill="#fff" opacity=".95"/>
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#fff"/>
      ${txt(x, y + fs * 0.34, text, fs, o.col || C.dark, { f: 'Playfair Display', it: true, w: 700 })}</g>`);
  };
  const pill = (x, y, text, col, k = 1, fs = 30, tc = '#fff') => {
    if (k <= 0) return '';
    const w = [...text].length * fs * 0.6 + 44;
    return scaleAt(x, y, k, `<rect x="${x - w / 2}" y="${y - fs * 0.85}" width="${w}" height="${fs * 1.7}" rx="${fs * 0.85}" fill="${col}"/>${txt(x, y + fs * 0.35, text, fs, tc)}`);
  };
  const check = (x, y, k, col = '#2AA594', r = 30) => k <= 0 ? '' : scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><path d="M${x - r * .45},${y + 1} L${x - r * .12},${y + r * .38} L${x + r * .5},${y - r * .36}" fill="none" stroke="#fff" stroke-width="${r * .24}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const cross = (x, y, k, col = '#E2556F', r = 30) => k <= 0 ? '' : scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><path d="M${x - r * .38},${y - r * .38} L${x + r * .38},${y + r * .38} M${x + r * .38},${y - r * .38} L${x - r * .38},${y + r * .38}" stroke="#fff" stroke-width="${r * .24}" stroke-linecap="round"/>`);
  // Candles in a box: closes = list of values (0..1, up = higher), drawn left to right up to n.
  const candles = (x, y, w, h, vals, n, o = {}) => {
    const cw = w / Math.max(vals.length, o.slots || 0), Y = v => y + h - v * h;
    let s = '';
    for (let i = 1; i < Math.min(n, vals.length); i++) {
      const a = vals[i - 1], b = vals[i], up = b >= a, col = up ? (o.up || C.teal) : (o.dn || C.pink);
      const cx = x + i * cw, top = Math.max(a, b) + 0.025, bot = Math.min(a, b) - 0.025;
      s += `<line x1="${f1(cx)}" x2="${f1(cx)}" y1="${f1(Y(top))}" y2="${f1(Y(bot))}" stroke="${col}" stroke-width="${Math.max(2, cw * .08)}"/><rect x="${f1(cx - cw * .3)}" y="${f1(Y(Math.max(a, b)))}" width="${f1(cw * .6)}" height="${f1(Math.max(cw * 0.35, Math.abs(Y(a) - Y(b))))}" rx="2" fill="${col}"/>`;
    }
    return s;
  };
  const vals = (seed, n, drift = 0, vol = 0.06, start = 0.5) => { vol *= 2.2;
    let s = seed, v = start; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: n }, () => (v = clamp(v + drift + (r() - 0.5) * vol * 2) * 0.9 + 0.05));
  };
  const sticky = (x, y, text, k, rot, col = '#FFF1A8') => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${k})"><rect x="-150" y="-80" width="300" height="160" rx="6" fill="${col}"/><rect x="-150" y="-80" width="300" height="22" fill="#000" opacity=".05"/>${txt(0, 10, text, 30, '#4A3A10', { w: 700 })}</g>`;
  const heart = (x, y, k, col = C.pink) => k <= 0 ? '' : scaleAt(x, y, k, `<path d="M${x},${y + 30} C${x - 70},${y - 20} ${x - 30},${y - 70} ${x},${y - 30} C${x + 30},${y - 70} ${x + 70},${y - 20} ${x},${y + 30} Z" fill="${col}"/>`);

  const LIVE = {
    /* ════ Psychology 11 · Your Relationship With Money ════════════════ */

    // A number in your head before the chart is even open. Then: nothing is happening.
    'v11-number': (s, t) => {
      const B = s.b;
      let o = grad('n1', '#1C1528', '#2E2142') + bg('url(#n1)');
      const chart = seg(t, B.open - 0.3, B.open + 0.5), endk = seg(t, B.today - 0.3, B.today + 0.5);
      // the number, glowing in her head
      const big = pop(t, B.num, 0.7) * (1 - chart * 0.55);
      const pulse = t > B.still ? 1 + 0.06 * Math.sin((t - B.still) * 7) : 1;
      o += scaleAt(1480, 300, big * pulse, `<circle cx="1480" cy="300" r="200" fill="#F9D89A" opacity=".12"/>${txt(1480, 340, '$500', 140, t > B.still ? '#FF8DA3' : '#F9D89A', { f: 'JetBrains Mono, monospace' })}${txt(1480, 410, 'today', 36, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 })}`);
      o += you(t, { x: 1480, y: 1020, scale: 1.2, flip: true, mood: t > B.still ? 'sad' : undefined, frontArm: t > B.still && t < B.today ? { a1: 100 + 25 * Math.sin(t * 9), a2: 95 } : undefined });
      // the reasons, stuck around the number
      // decided: the number stamps onto the screen
      o += fade(seg(t, B.decided - 0.4, B.decided), `<rect x="140" y="200" width="1000" height="600" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>`);
      const notes = [[B.m1, 'bill due', 1220, 560, -6], [B.m2, 'payout', 1770, 560, 5], [B.m3, 'get back to even', 1220, 800, 4], [B.m4, 'something to buy', 1770, 800, -4]];
      notes.forEach(([at, l, x, y, r]) => { o += fade(1 - chart, sticky(x, y, l, pop(t, at, 0.5) * 0.85, r)); });
      o += fade(seg(t, B.decided, B.decided + 0.4) * (1 - chart), txt(640, 470, 'the market owes me', 50, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 }) + txt(640, 580, '$500', 110, '#F9D89A', { f: 'JetBrains Mono, monospace' }));
      if (chart > 0) {
        const n = 2 + Math.floor(seg(t, B.open, B.still) * 26);
        o += fade(chart, candles(170, 300, 940, 360, vals(77, 30, 0, 0.03, 0.5), n, { slots: 30 }));
        o += fade(chart, txt(180, 260, 'MNQ · 1m', 30, '#CFC8FA', { a: 'start', f: 'JetBrains Mono, monospace' }));
        // nothing is happening: a tumbleweed rolls through
        const tw = seg(t, B.nothing, B.nothing + 3.2);
        if (tw > 0 && tw < 1) { const x = lerp(100, 1180, tw), y = 760 - Math.abs(Math.sin(tw * 14)) * 50; o += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(tw * 900)})"><circle r="38" fill="none" stroke="#B89A6A" stroke-width="5"/><path d="M-30,-10 Q0,30 30,-10 M-20,20 Q0,-30 25,15 M-35,5 Q0,-10 35,8" stroke="#B89A6A" stroke-width="4" fill="none"/></g>`; }
        ['no setup', 'choppy', 'nothing looks good'].forEach((l, j) => { o += pill(330 + j * 300 + (j === 2 ? 60 : 0), 740, l, '#3A2F55', pop(t, B.chop + j * 0.9, 0.4) * (1 - endk), 28, '#CFC8FA'); });
      }
      o += fade(seg(t, B.what, B.what + 0.4) * (1 - endk), txt(640, 920, 'so… what happens now?', 56, '#fff', { f: 'Playfair Display', it: true }));
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, txt(960, 430, 'your relationship', 96, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 560, 'with money', 96, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.today + 3, B.today + 3.6), txt(960, 720, 'when you start needing the market to pay you', 44, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Wanting profit vs needing today's number. The target changes. The math keeps moving.
    'v11-objective': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const p1 = seg(t, B.look - 0.3, B.look + 0.3), p2 = seg(t, B.good - 0.4, B.good + 0.2), p3 = seg(t, B.changed - 0.4, B.changed + 0.2), p4 = seg(t, B.mort - 0.4, B.mort + 0.2);
      // wanting vs needing
      const a = 1 - p1;
      if (a > 0) {
        o += fade(a * seg(t, B.want, B.want + 0.5), `<rect x="140" y="240" width="760" height="560" rx="40" fill="#E6F5F2"/>${txt(520, 330, 'WANTING', 44, '#2AA594', { ls: 6 })}${txt(520, 400, 'trading to become profitable', 36, C.dark, { w: 700 })}`);
        // a little plant, growing over time
        const g = seg(t, B.want, B.need + 3);
        o += fade(a * seg(t, B.want, B.want + 0.5), `<rect x="460" y="680" width="120" height="90" rx="12" fill="#C98B6B"/><path d="M520,680 L520,${f1(680 - 180 * g)}" stroke="#2AA594" stroke-width="10" stroke-linecap="round"/>${g > 0.4 ? `<ellipse cx="${f1(560)}" cy="${f1(680 - 120 * g)}" rx="${f1(40 * g)}" ry="${f1(18 * g)}" fill="#2AA594"/>` : ''}${g > 0.7 ? `<ellipse cx="480" cy="${f1(680 - 160 * g)}" rx="${f1(40 * g)}" ry="${f1(18 * g)}" fill="#2AA594"/>` : ''}`);
        o += fade(a * seg(t, B.need, B.need + 0.5), `<rect x="1020" y="240" width="760" height="560" rx="40" fill="#FDE8ED"/>${txt(1400, 330, 'NEEDING', 44, '#E2556F', { ls: 6 })}${txt(1400, 400, 'this amount, today', 36, C.dark, { w: 700 })}<circle cx="1400" cy="590" r="130" fill="#fff" stroke="#E2556F" stroke-width="10"/><line x1="1400" y1="590" x2="1400" y2="500" stroke="#2C1810" stroke-width="10" stroke-linecap="round"/><line x1="1400" y1="590" x2="${f1(1400 + 80 * Math.cos(t * 3))}" y2="${f1(590 + 80 * Math.sin(t * 3))}" stroke="#E2556F" stroke-width="8" stroke-linecap="round"/>`);
      }
      // the target changes: setup → $500
      const b = p1 * (1 - p2);
      if (b > 0) {
        const sw = seg(t, B.look500, B.look500 + 0.6);
        o += fade(b, [0, 1, 2].map(j => `<circle cx="960" cy="520" r="${260 - j * 85}" fill="${j % 2 ? '#fff' : (sw > 0.5 ? '#E2556F' : '#2AA594')}"/>`).join('') + `<circle cx="960" cy="520" r="60" fill="#fff"/>`);
        o += fade(b * (1 - sw), txt(960, 535, 'setup', 40, '#2AA594'));
        o += scaleAt(960, 520, b * pop(t, B.look500, 0.5), txt(960, 540, '$500', 54, '#E2556F', { f: 'JetBrains Mono, monospace' }));
        o += fade(b, txt(960, 900, sw > 0.5 ? 'a completely different target' : 'what are you looking for?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      // the math keeps moving
      const c = p2 * (1 - p3);
      if (c > 0) {
        const rows = [[B.good, 'no setup appears?', '“maybe this one is good enough…”', null], [B.more, 'you make $200', '“not enough. I need $300 more.”', 300], [B.n700, 'you lose $200', '“now I need $700.”', 700]];
        rows.forEach(([at, q, a2, need], j) => {
          const y = 250 + j * 210, k = seg(t, at - 0.2, at + 0.4);
          o += fade(c * k, `<rect x="160" y="${y - 70}" width="1600" height="150" rx="30" fill="#fff"/>${txt(220, y + 15, q, 40, C.dark, { a: 'start' })}${txt(760, y + 15, a2, 40, '#E2556F', { a: 'start', f: 'Playfair Display', it: true, w: 700 })}`);
        });
        // need meter
        const need = t < B.more ? 500 : t < B.n700 ? 300 : 300 + 400 * ease(seg(t, B.n700, B.n700 + 0.8));
        o += fade(c * seg(t, B.more, B.more + 0.4), `${txt(960, 930, 'still need', 34, C.muted, { w: 700 })}${txt(960, 1010, '$' + Math.round(need), 70, '#E2556F', { f: 'JetBrains Mono, monospace' })}`);
      }
      // the market hasn't changed; your desperation has
      const d = p3 * (1 - p4);
      if (d > 0) {
        o += fade(d, `<rect x="160" y="260" width="760" height="460" rx="30" fill="#120D1C"/>${candles(190, 300, 700, 380, vals(77, 18, 0, 0.012, 0.5), 18)}${txt(540, 800, 'the market', 44, C.dark, { f: 'Playfair Display', it: true })}${txt(540, 860, 'same as before', 32, C.muted, { w: 700 })}`);
        const dk = seg(t, B.desp, B.desp + 1.4), ang = lerp(-150, -20, ease(dk)) + (dk > 0.9 ? 4 * Math.sin(t * 20) : 0), rr = ang * Math.PI / 180;
        o += fade(d * seg(t, B.desp - 0.2, B.desp + 0.4), `<path d="M1160,620 A300,300 0 0 1 1760,620" fill="none" stroke="#E6F5F2" stroke-width="60"/><path d="M1560,360 A300,300 0 0 1 1760,620" fill="none" stroke="#E2556F" stroke-width="60" opacity=".85"/><line x1="1460" y1="620" x2="${f1(1460 + 260 * Math.cos(rr))}" y2="${f1(620 + 260 * Math.sin(rr))}" stroke="#2C1810" stroke-width="14" stroke-linecap="round"/><circle cx="1460" cy="620" r="24" fill="#2C1810"/>${txt(1460, 800, 'your desperation', 44, '#E2556F', { f: 'Playfair Display', it: true })}`);
      }
      // the market doesn't know, and doesn't owe you
      if (p4 > 0) {
        o += fade(p4, `<rect x="660" y="300" width="600" height="380" rx="30" fill="#120D1C"/>${candles(690, 340, 540, 300, vals(31, 16, 0.004, 0.05, 0.5), 16)}${txt(960, 760, 'THE MARKET', 40, C.dark, { ls: 6 })}`);
        [[B.mort, 'mortgage due', 330, 330], [B.pay, 'need a payout', 1590, 330], [B.goal, 'my financial goal', 380, 760]].forEach(([at, l, x, y]) => {
          const k = pop(t, at, 0.5), bo = ease(seg(t, at + 1, at + 1.6));
          o += fade(k * (1 - bo * 0.55), `<g transform="translate(${f1(x + (x < 960 ? -1 : 1) * bo * 50)},${y})"><rect x="-200" y="-80" width="400" height="160" rx="16" fill="#fff" stroke="#E6DDD3" stroke-width="4"/><path d="M-200,-80 L0,10 L200,-80" fill="none" stroke="#E6DDD3" stroke-width="4"/>${txt(0, 60, l, 32, C.dark, { w: 800 })}</g>`);
        });
        o += scaleAt(1520, 790, pop(t, B.owe + 1.2, 0.5), `<g transform="rotate(-8 1520 790)"><rect x="1270" y="720" width="500" height="140" rx="16" fill="none" stroke="#E2556F" stroke-width="8"/>${txt(1520, 812, 'OWES YOU $0', 56, '#E2556F', { ls: 3 })}</g>`);
      }
      return o;
    },

    // Every trade gets heavier. The loss pushes the goal away; the win isn't enough.
    'v11-heavy': (s, t) => {
      const B = s.b;
      let o = grad('hv', '#F3E3D6', '#FBF4EF') + bg('url(#hv)');
      const p2 = seg(t, B.heavy - 0.3, B.heavy + 0.3), p3 = seg(t, B.learn - 0.4, B.learn + 0.3);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.loss && t < B.learn ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      // the thoughts that come with money on the line
      [[B.t1, '“if I make this much today, then I can…”', 160], [B.t2, '“I need this account at this number for my payout”', 330], [B.t3, '“I’m short… if I can just make this today”', 500]].forEach(([at, l, y]) => { o += fade(1 - p2, thought(1220, y + 120, l, pop(t, at, 0.5), { size: 34 })); });
      const q = p2 * (1 - p3);
      if (q > 0) {
        // the trade card, weighed down
        const sag = ease(seg(t, B.heavy, B.heavy + 1.2)) * 40;
        o += fade(q, `<rect x="760" y="${f1(170 + sag)}" width="440" height="150" rx="24" fill="#2C1810"/>${txt(980, 262 + sag, 'NEXT TRADE', 40, '#fff', { ls: 4 })}`);
        ['$', '$', '$'].forEach((d, j) => { const k = pop(t, B.heavy + 0.3 + j * 0.3, 0.4); o += fade(q, scaleAt(1300 + j * 120, 245 + sag, k, `<circle cx="${1300 + j * 120}" cy="${f1(245 + sag)}" r="50" fill="#E2B04A"/>${txt(1300 + j * 120, 265 + sag, d, 50, '#fff')}`)); });
        o += fade(q * seg(t, B.heavy + 0.2, B.heavy + 0.8), txt(1280, 140, 'every trade feels heavier', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        // progress bar toward what you "need"
        const bar = (y, from, to, k, col, label) => { const v = lerp(from, to, ease(k)); return `<rect x="760" y="${y}" width="1000" height="56" rx="28" fill="#fff"/><rect x="760" y="${y}" width="${f1(Math.max(56, 1000 * v))}" height="56" rx="28" fill="${col}"/>${txt(1760, y - 20, label, 32, C.muted, { a: 'end', w: 700 })}`; };
        const L = seg(t, B.loss, B.loss + 0.5) * (1 - seg(t, B.win - 0.3, B.win));
        if (L > 0) {
          const k = seg(t, B.loss + 0.5, B.loss + 2);
          o += fade(q * L, `${txt(760, 500, 'after a loss', 40, '#E2556F', { a: 'start' })}${bar(560, 0.45, 0.25, k, '#E2556F', 'goal: what I need')}`);
          o += fade(q * L * seg(t, B.loss + 1.5, B.loss + 2), txt(1260, 720, '“now I’m further away”', 46, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
        }
        const W = seg(t, B.win - 0.3, B.win + 0.3);
        if (W > 0) {
          const k = seg(t, B.win + 2, B.win + 4);
          o += fade(q * W, `${txt(760, 500, 'after a winner', 40, '#2AA594', { a: 'start' })}${bar(560, 0, 0.4, k, '#2AA594', 'needed $1,000')}${txt(760 + 400 * ease(k), 690, '+$400', 40, '#2AA594', { f: 'JetBrains Mono, monospace' })}`);
          o += fade(q * seg(t, B.win + 6, B.win + 6.6), txt(1260, 800, '“okay… I still need $600”', 46, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
        }
      }
      // the market isn't responsible for what you walked in with
      if (p3 > 0) {
        o += fade(p3, `<rect x="980" y="180" width="380" height="640" rx="16" fill="#8B6A55"/><rect x="1010" y="210" width="320" height="610" rx="8" fill="#2A2142"/>${candles(1030, 300, 280, 300, vals(11, 10, 0.01, 0.04, 0.5), 10)}${txt(1170, 700, 'the market', 36, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 })}`);
        const k = pop(t, B.learn + 2, 0.6);
        o += fade(p3, scaleAt(1620, 760, k, `<rect x="1460" y="660" width="320" height="200" rx="18" fill="#C98B6B"/><rect x="1590" y="630" width="60" height="40" rx="10" fill="none" stroke="#8B5A3C" stroke-width="10"/>${txt(1620, 750, 'bills · payouts', 30, '#fff')}${txt(1620, 800, 'what I need', 30, '#fff')}`));
        o += fade(p3 * seg(t, B.learn + 4, B.learn + 4.6), txt(1380, 960, 'not the market’s job to solve', 46, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Financial goal vs execution goals. One you control. $0 can be a good day.
    'v11-goals': (s, t) => {
      const B = s.b;
      let o = grad('gl', '#EEEBFB', '#FDF8F5') + bg('url(#gl)');
      const zk = seg(t, B.zero - 0.4, B.zero + 0.3);
      o += fade(1 - zk, txt(960, 150, 'separate them', 56, C.dark, { f: 'Playfair Display', it: true }) );
      const L = seg(t, B.sep, B.sep + 0.6) * (1 - zk), dim = seg(t, B.not, B.not + 0.6);
      if (L > 0) {
        o += fade(L * (1 - dim * 0.5), `<rect x="140" y="230" width="740" height="600" rx="40" fill="#fff"/>${txt(510, 320, 'FINANCIAL GOAL', 38, '#B38A2E', { ls: 5 })}<ellipse cx="510" cy="520" rx="260" ry="130" fill="#FFF3D6"/>${txt(510, 500, '$2,000', 80, '#B38A2E', { f: 'JetBrains Mono, monospace' })}${txt(510, 570, 'this month', 36, C.muted, { w: 700 })}`);
        o += fade(L * seg(t, B.sep + 1, B.sep + 1.6), `<rect x="1040" y="230" width="740" height="600" rx="40" fill="#fff"/>${txt(1410, 320, 'EXECUTION GOALS · TODAY', 38, '#2AA594', { ls: 4 })}`);
        ['only take my setup', 'respect my risk', 'stop at my daily limit', 'no forcing a trade'].forEach((l, j) => { const y = 420 + j * 95; o += fade(L * seg(t, B.sep + 1.5 + j * 0.5, B.sep + 2 + j * 0.5), txt(1120, y + 12, l, 38, C.dark, { a: 'start', w: 700 })) + check(1700, y, L * pop(t, B.ctrl + j * 0.25, 0.4), '#2AA594', 26); });
        o += pill(1410, 900, 'in your control', '#2AA594', L * pop(t, B.ctrl + 0.4, 0.5), 34);
        o += pill(510, 900, 'not in your control', '#B8B3C9', L * pop(t, B.not + 0.2, 0.5), 34);
      }
      if (zk > 0) {
        // the calendar day: $0 and still a win
        o += fade(zk, `<rect x="660" y="190" width="600" height="560" rx="36" fill="#fff"/><rect x="660" y="190" width="600" height="120" rx="36" fill="#7F77DD"/><rect x="660" y="270" width="600" height="40" fill="#7F77DD"/>${txt(960, 270, 'TODAY', 48, '#fff', { ls: 8 })}${txt(960, 520, '$0', 170, C.dark, { f: 'JetBrains Mono, monospace' })}${txt(960, 640, 'my setup never showed up', 36, C.muted, { w: 700 })}`);
        o += check(1240, 210, pop(t, B.zero + 3, 0.5), '#2AA594', 60);
        o += fade(seg(t, B.notrade, B.notrade + 0.6), txt(960, 880, 'a no-trade day can still be a successful trading day', 50, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // The rule. Four things the number doesn't get to decide. Then the line.
    'v11-rule': (s, t) => {
      const B = s.b;
      let o = grad('ru', '#EEEBFB', '#DDF1EE') + bg('url(#ru)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      const fin = seg(t, B.line - 0.3, B.line + 0.3);
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 225, 'I don’t make the market responsible', 64, C.dark, { f: 'Playfair Display' }) + txt(960, 305, 'for my financial obligations.', 64, C.dark, { f: 'Playfair Display' }));
      const rows = [[B.r1, 'my bills', 'my position size'], [B.r2, 'my income goal', 'how many trades I take'], [B.r3, 'the payout I want', 'whether a setup is valid'], [B.r4, 'the amount I need', 'what the market gives me']];
      rows.forEach(([at, a, b], j) => {
        const y = 430 + j * 100, k = seg(t, at, at + 0.5) * (1 - fin);
        o += fade(k, `<rect x="300" y="${y - 45}" width="1320" height="80" rx="40" fill="#fff"/>${txt(360, y + 12, a, 36, '#B38A2E', { a: 'start' })}${txt(860, y + 12, 'doesn’t decide', 32, C.muted, { w: 700 })}${txt(1560, y + 12, b, 36, C.dark, { a: 'end' })}`);
      });
      if (fin > 0) {
        o += fade(fin, `<rect x="220" y="440" width="680" height="380" rx="40" fill="#fff" stroke="#2AA594" stroke-width="8"/>${candles(270, 500, 580, 220, [0.3, 0.42, 0.38, 0.55, 0.5, 0.66, 0.62, 0.78], 8)}${txt(560, 790, 'the setup in front of me', 38, '#2AA594')}`);
        o += fade(seg(t, B.line + 2, B.line + 2.6), `<rect x="1020" y="440" width="680" height="380" rx="40" fill="#fff" stroke="#E2556F" stroke-width="8" opacity=".6"/>${txt(1360, 650, '$$$', 120, '#E2556F', { f: 'JetBrains Mono, monospace', op: 0.5 })}${txt(1360, 790, 'the dollar amount in my head', 38, '#E2556F')}`);
        o += check(880, 450, pop(t, B.line + 1, 0.5), '#2AA594', 44) + cross(1680, 450, pop(t, B.line + 3, 0.5), '#E2556F', 44);
      }
      return o;
    },

    // Reflection: setup or calculator? Have you ever… The big question. Then let the money be the result.
    'v11-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const h = seg(t, B.h1 - 0.4, B.h1 + 0.2), big = seg(t, B.big - 0.4, B.big + 0.3), end = seg(t, B.income - 0.4, B.income + 0.3);
      // setup or calculator?
      const a = 1 - h;
      if (a > 0) {
        o += fade(a, you(t, { x: 960, y: 1000, scale: 1.25 }));
        o += fade(a * seg(t, B.q1, B.q1 + 0.5), `<rect x="260" y="250" width="440" height="300" rx="24" fill="#120D1C" stroke="#2AA594" stroke-width="6"/>${candles(290, 290, 380, 200, [0.3, 0.4, 0.35, 0.5, 0.45, 0.6, 0.58, 0.72], 8)}${txt(480, 620, 'looking for my setup', 34, '#7ECFC0')}`);
        o += fade(a * seg(t, B.q2, B.q2 + 0.5), `<rect x="1240" y="230" width="380" height="340" rx="30" fill="#3A2F55"/><rect x="1270" y="260" width="320" height="80" rx="10" fill="#CFE9C8"/>${txt(1570, 318, '$500', 46, '#1A1424', { a: 'end', f: 'JetBrains Mono, monospace' })}${[0, 1, 2, 3].map(i => [0, 1, 2].map(j => `<rect x="${1280 + i * 78}" y="${370 + j * 62}" width="60" height="46" rx="8" fill="#5A4C7A"/>`).join('')).join('')}${txt(1430, 640, 'already calculating', 34, '#FF8DA3')}`);
      }
      // have you ever…
      const c = h * (1 - big);
      if (c > 0) {
        o += fade(c, txt(960, 170, 'have you ever…', 56, '#fff', { f: 'Playfair Display', it: true }));
        [[B.h1, 'taken another trade because the first winner wasn’t enough?'], [B.h2, 'increased your risk to hit a payout?'], [B.h3, 'kept trading to make back money you spent?'], [B.h4, 'forced a setup because you couldn’t afford a $0 day?']].forEach(([at, l], j) => {
          const y = 320 + j * 150;
          o += fade(c * seg(t, at, at + 0.5), `<rect x="260" y="${y - 55}" width="1400" height="110" rx="24" fill="#2A2142"/><rect x="300" y="${y - 25}" width="50" height="50" rx="10" fill="none" stroke="#CFC8FA" stroke-width="5"/>${txt(390, y + 13, l, 38, '#fff', { a: 'start', w: 700 })}`);
        });
      }
      // the big question, sitting in silence
      const d = big * (1 - end);
      if (d > 0) {
        o += fade(d, txt(960, 430, 'If you knew you didn’t need', 72, '#fff', { f: 'Playfair Display', it: true }) + txt(960, 530, 'to make any money today…', 72, '#fff', { f: 'Playfair Display', it: true }));
        o += fade(d * seg(t, B.big + 3, B.big + 3.8), txt(960, 690, 'would you trade differently?', 64, '#F9D89A', { f: 'Playfair Display', it: true }));
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const fin = seg(t, B.e1 - 0.4, B.e1 + 0.2);
        o += fade(end * (1 - fin), txt(960, 170, 'income, built over time', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(end * (1 - fin) * seg(t, B.demand, B.demand + 0.5), txt(960, 240, 'not demanded from today', 40, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
        [[B.s1, '+$', '#2AA594', 'made money'], [B.s2, '−$', '#E2556F', 'lost'], [B.s3, '—', '#7F77DD', 'no trade worth taking']].forEach(([at, v, col, l], j) => {
          const x = 460 + j * 500;
          o += fade(end * (1 - fin), scaleAt(x, 500, pop(t, at, 0.5), `<rect x="${x - 200}" y="330" width="400" height="340" rx="30" fill="#fff"/><rect x="${x - 200}" y="330" width="400" height="80" rx="30" fill="${col}"/><rect x="${x - 200}" y="380" width="400" height="30" fill="${col}"/>${txt(x, 385, 'SOME DAYS', 30, '#fff', { ls: 4 })}${txt(x, 560, v, 100, col, { f: 'JetBrains Mono, monospace' })}${txt(x, 630, l, 30, C.muted, { w: 700 })}`));
        });
        o += fade(end * (1 - fin) * seg(t, B.force, B.force + 0.5), txt(960, 790, 'force the market to pay you', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="660" x2="${f1(660 + 600 * seg(t, B.force + 1.5, B.force + 2.2))}" y1="776" y2="776" stroke="#E2556F" stroke-width="6"/>`);
        o += fade(end * (1 - fin) * seg(t, B.resp, B.resp + 0.5), txt(960, 880, 'execute your process when your opportunity shows up', 46, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
        if (fin > 0) {
          [[B.e1, 'TRADE THE SETUP.', '#2AA594'], [B.e2, 'MANAGE THE RISK.', '#7F77DD']].forEach(([at, l, col], j) => { o += scaleAt(960, 300 + j * 150, pop(t, at, 0.5), `<rect x="560" y="${240 + j * 150}" width="800" height="120" rx="60" fill="${col}"/>${txt(960, 320 + j * 150, l, 50, '#fff', { ls: 4 })}`); });
          o += fade(seg(t, B.e3, B.e3 + 0.6), txt(960, 700, 'Let the money be the result,', 64, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 800, 'not the instruction.', 64, '#E2556F', { f: 'Playfair Display', it: true }));
        }
      }
      return o;
    },

    /* ════ Psychology 2 · FOMO ═════════════════════════════════════════ */

    // Waiting… you look away… you come back and it's GONE. Keep going, keep going.
    'v2-missed': (s, t) => {
      const B = s.b;
      let o = grad('fm', '#1C1528', '#2E2142') + bg('url(#fm)');
      const endk = seg(t, B.problem - 0.4, B.problem + 0.3);
      const run = [0.28, 0.3, 0.27, 0.29, 0.28, 0.3, 0.29, 0.27, 0.3, 0.29, 0.34, 0.42, 0.5, 0.56, 0.62, 0.7, 0.75, 0.82, 0.86, 0.9, 0.93, 0.95];
      // how many candles you see: slow while waiting, then the run appears while you're away
      let n = 2 + Math.floor(seg(t, s.start, B.away) * 8);
      if (t > B.moved) n = 22;
      const away = between(t, B.away + 0.2, B.moved - 0.2, 0.6);
      const mins = Math.min(45, 30 + Math.floor(seg(t, s.start, B.patient + 3) * 15));
      o += fade(1 - endk, `${txt(200, 150, `MNQ · waiting ${mins} min`, 34, '#CFC8FA', { a: 'start', f: 'JetBrains Mono, monospace' })}<rect x="160" y="190" width="1080" height="640" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>`);
      if (away > 0 && away < 1) o += fade((1 - endk) * away, `<rect x="160" y="190" width="1080" height="640" rx="28" fill="#120D1C"/>${txt(700, 520, 'you’re not watching…', 46, '#5A4C7A', { f: 'Playfair Display', it: true, w: 700 })}`);
      if (t < B.away + 0.3 || t > B.moved - 0.2) o += fade(1 - endk, candles(200, 230, 1000, 560, run, n, { slots: 24 }));
      // your setup was back there
      if (t > B.missed) o += fade((1 - endk) * seg(t, B.missed + 0.5, B.missed + 1), `<line x1="${200 + 10 * 1000 / 24}" x2="${200 + 10 * 1000 / 24}" y1="240" y2="790" stroke="#2AA594" stroke-width="4" stroke-dasharray="10 8"/>`) + pill(200 + 10 * 1000 / 24, 790, 'your entry', '#2AA594', pop(t, B.missed + 0.6, 0.4) * (1 - endk), 24);
      // keep going and going: extra candles beyond the box edge feel
      if (t > B.going) { const g = seg(t, B.going, B.going + 6); o += fade(1 - endk, `<path d="M1150,${f1(300 - 40 * g)} l40,-40 l-60,0 z" fill="#2AA594" opacity="${f1(0.5 + 0.5 * Math.sin(t * 6))}"/>`); }
      // her: present, away, back
      const walk = seg(t, B.away, B.away + 1.2), back_ = seg(t, B.moved - 1.2, B.moved);
      const x = t < B.moved - 1.2 ? lerp(1560, 2150, ease(walk)) : lerp(2150, 1560, ease(back_));
      o += fade(1 - endk, you(t, { x, y: 1020, scale: 1.2, flip: true, walking: (walk > 0 && walk < 1) || (back_ > 0 && back_ < 1), mood: t > B.missed ? 'sad' : undefined }));
      if (away > 0) o += fade(away * (1 - endk), `<g transform="translate(1560,560)"><rect x="-70" y="-120" width="140" height="240" rx="24" fill="#3A2F55"/><rect x="-58" y="-100" width="116" height="190" rx="10" fill="#7F77DD" opacity=".6"/></g>${txt(1560, 760, 'bathroom · phone · anything', 30, '#CFC8FA', { w: 700 })}`);
      o += fade((1 - endk) * seg(t, B.moved, B.moved + 0.3), scaleAt(1500, 160, pop(t, B.moved, 0.4), txt(1500, 190, 'MOVED.', 90, '#F9D89A')));
      o += thought(1500, 330, 'damn. I missed it.', between(t, B.missed + 0.4, B.going - 0.2), { size: 42 });
      const th = ['maybe I can still get in', 'maybe it’ll keep running', 'I don’t want to miss this whole move'];
      th.forEach((l, j) => { const a = B.going + 1.5 + j * 3; o += thought(1500, 330 + (j % 2) * 30, l, between(t, a, a + 2.8) * (1 - endk), { size: 36 }); });
      o += fade((1 - endk) * seg(t, B.expensive, B.expensive + 0.5), scaleAt(1500, 480, pop(t, B.expensive, 0.5), `<g transform="rotate(-8 1500 480)"><rect x="1340" y="420" width="320" height="120" rx="16" fill="#E2556F"/>${txt(1500, 500, 'FOMO: $$$', 52, '#fff', { ls: 2 })}</g>`));
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, `<rect x="200" y="300" width="680" height="400" rx="40" fill="#fff"/>${txt(540, 440, 'missing a trade', 52, C.dark, { f: 'Playfair Display', it: true })}${txt(540, 520, 'you’re going to miss trades', 34, C.muted, { w: 700 })}`) + check(540, 620, pop(t, B.problem + 2, 0.5), '#2AA594', 40);
        o += fade(seg(t, B.decide, B.decide + 0.6), `<rect x="1040" y="300" width="680" height="400" rx="40" fill="#FDE8ED" stroke="#E2556F" stroke-width="6"/>${txt(1380, 440, 'what you decide', 52, '#E2556F', { f: 'Playfair Display', it: true })}${txt(1380, 520, 'because you missed it', 34, C.dark, { w: 700 })}`);
        o += fade(seg(t, B.decide + 1, B.decide + 1.6), txt(1380, 800, 'that’s the problem', 44, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Not the setup, the money. The math. Then the question quietly changes.
    'v2-math': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const m = seg(t, B.math - 0.3, B.math + 0.3), q = seg(t, B.changes - 0.4, B.changes + 0.2);
      // what are you afraid of missing?
      const a = 1 - m;
      if (a > 0) {
        o += fade(a, txt(960, 260, 'afraid of missing…', 64, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.notsetup, B.notsetup + 0.4), `<rect x="360" y="400" width="480" height="240" rx="36" fill="#E6F5F2"/>${txt(600, 545, 'the setup', 54, '#2AA594')}`) + cross(820, 410, a * pop(t, B.notsetup + 0.8, 0.4), '#E2556F', 40);
        o += fade(a * seg(t, B.money, B.money + 0.4), scaleAt(1320, 520, pop(t, B.money, 0.6), `<rect x="1080" y="400" width="480" height="240" rx="36" fill="#FFF3D6" stroke="#E2B04A" stroke-width="6"/>${txt(1320, 545, 'the money', 54, '#B38A2E')}`));
      }
      // the math: a chalkboard over the move you never took
      const b = m * (1 - q);
      if (b > 0) {
        o += fade(b, `<rect x="120" y="160" width="1000" height="700" rx="30" fill="#120D1C"/>${candles(150, 200, 940, 620, [0.2, 0.22, 0.21, 0.24, 0.3, 0.38, 0.46, 0.55, 0.6, 0.68, 0.74, 0.8, 0.86, 0.9], 14)}`);
        const meas = seg(t, B.m3, B.m3 + 1.2);
        o += fade(b * meas, `<line x1="1080" x2="1080" y1="${f1(700 - 520 * meas)}" y2="700" stroke="#F9D89A" stroke-width="6"/><path d="M1060,${f1(720 - 520 * meas)} l20,-30 l20,30 z" fill="#F9D89A"/>`);
        o += fade(b * seg(t, B.m1, B.m1 + 0.4), `<line x1="${150 + 4 * 940 / 14}" x2="${150 + 4 * 940 / 14}" y1="200" y2="820" stroke="#7F77DD" stroke-width="4" stroke-dasharray="10 8"/>${txt(150 + 4 * 940 / 14, 850, 'right there', 28, '#CFC8FA', { w: 700 })}`);
        [[B.m1, '+$300', '#2AA594'], [B.m2, '× 4 contracts = $600', '#2AA594'], [B.m3, 'look how far it went', '#F9D89A']].forEach(([at, l, col], j) => { o += fade(b * seg(t, at, at + 0.4), txt(1480, 300 + j * 120, l, 46, col, { f: j < 2 ? 'JetBrains Mono, monospace' : 'Playfair Display', it: j === 2, w: j === 2 ? 700 : 900 })); });
        const tally = t < B.assign ? 0 : 600 + Math.floor(ease(seg(t, B.assign, B.assign + 5)) * 1400);
        o += fade(b * seg(t, B.assign, B.assign + 0.4), `<rect x="1260" y="640" width="440" height="200" rx="30" fill="#fff" stroke="#E6DDD3" stroke-width="4"/>${txt(1480, 720, '$' + tally.toLocaleString('en-US'), 64, '#B38A2E', { f: 'JetBrains Mono, monospace' })}${txt(1480, 790, 'from a trade you never took', 28, C.muted, { w: 700 })}`);
      }
      // the question changes
      if (q > 0) {
        const flip = seg(t, B.q2 - 0.2, B.q2 + 0.4), rec = seg(t, B.recog, B.recog + 0.6);
        o += fade(q * seg(t, B.q1, B.q1 + 0.4), `<rect x="200" y="260" width="660" height="300" rx="40" fill="#E6F5F2" stroke="#2AA594" stroke-width="6"/>${txt(530, 340, 'FIVE MINUTES AGO', 30, '#2AA594', { ls: 4 })}${txt(530, 440, '“Is my setup here?”', 50, C.dark, { f: 'Playfair Display', it: true })}`);
        o += fade(q * flip, `<rect x="1060" y="260" width="660" height="300" rx="40" fill="#FDE8ED" stroke="#E2556F" stroke-width="6"/>${txt(1390, 340, 'NOW', 30, '#E2556F', { ls: 4 })}${txt(1390, 440, '“How can I get in?”', 50, C.dark, { f: 'Playfair Display', it: true })}`);
        o += fade(q * seg(t, B.same, B.same + 0.4), txt(960, 440, '≠', 110, C.dark));
        o += fade(q * seg(t, B.same + 0.5, B.same + 1), txt(960, 660, 'not the same question', 54, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(q * rec, `${pill(560, 820, 'trading my system', '#B8B3C9', 1, 34)}${txt(960, 832, '→', 50, C.muted)}${pill(1360, 820, 'reacting to FOMO', '#E2556F', 1, 34)}`);
      }
      return o;
    },

    // Dayli's late entry. It worked… which made it worse. Outcome ≠ execution.
    'v2-chased': (s, t) => {
      const B = s.b;
      let o = grad('ch', '#F3E3D6', '#FBF4EF') + bg('url(#ch)');
      const g = seg(t, B.remember - 0.4, B.remember + 0.3);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.worse && t < B.one ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const a = 1 - g;
      if (a > 0) {
        const series = [0.2, 0.22, 0.21, 0.25, 0.33, 0.42, 0.5, 0.58, 0.66, 0.74, 0.8, 0.84, 0.8, 0.86, 0.9, 0.94];
        const n = t < B.works ? 13 : 13 + Math.floor(seg(t, B.works, B.works + 2) * 3);
        o += fade(a, `<rect x="760" y="150" width="1040" height="560" rx="28" fill="#120D1C"/>${candles(790, 190, 980, 480, series, n, { slots: 16 })}`);
        o += fade(a * seg(t, B.watch, B.watch + 0.4), `<line x1="${790 + 3 * 980 / 16}" x2="${790 + 3 * 980 / 16}" y1="190" y2="670" stroke="#2AA594" stroke-width="4" stroke-dasharray="10 8"/>`) + pill(790 + 3 * 980 / 16, 690, 'the setup', '#2AA594', a * pop(t, B.watch + 0.3, 0.4), 24);
        const ey = 190 + 480 - 0.84 * 480;
        o += pill(790 + 12 * 980 / 16, ey - 50, 'ME, late', '#E2556F', a * pop(t, B.never, 0.5), 26);
        o += fade(a * seg(t, B.never + 2, B.never + 2.6) * (1 - seg(t, B.works, B.works + 0.4)), txt(1280, 790, 'somewhere I would’ve NEVER entered', 42, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
        // it works… the brain files it as evidence
        const w = seg(t, B.works + 1.5, B.works + 2);
        o += fade(a * w * (1 - seg(t, B.evidence - 0.3, B.evidence)), txt(1280, 880, '+$ … it worked?!', 48, '#2AA594', { f: 'JetBrains Mono, monospace' }));
        const ev = seg(t, B.evidence, B.evidence + 0.5);
        if (ev > 0) {
          o += fade(a * ev, `<rect x="900" y="780" width="760" height="150" rx="24" fill="#fff"/><rect x="930" y="810" width="90" height="90" rx="12" fill="#F9D89A"/>${txt(975, 870, '📁', 50, C.dark)}${txt(1050, 850, 'EVIDENCE', 30, '#B38A2E', { a: 'start', ls: 4 })}${txt(1050, 900, 'chasing can pay me', 36, C.dark, { a: 'start', w: 700 })}`);
        }
        o += thought(1280, 110, '“last time I got in late and it still went”', between(t, B.next + 0.2, B.one - 0.2), { size: 34 });
        o += fade(a * seg(t, B.one, B.one + 0.5), `<rect x="760" y="760" width="1040" height="200" rx="30" fill="#2C1810"/>${txt(1280, 850, '1 winning trade', 44, '#fff')}${txt(1280, 910, '≠ a good decision', 44, '#F9D89A')}`);
      }
      if (g > 0) {
        o += fade(g, txt(1280, 170, 'outcome ≠ execution', 56, C.dark, { f: 'Playfair Display', it: true }));
        const cell = (x, y, top, bot, col, k) => fade(g * k, `<rect x="${x}" y="${y}" width="480" height="300" rx="30" fill="#fff" stroke="${col}" stroke-width="6"/>${txt(x + 240, y + 130, top, 44, col)}${txt(x + 240, y + 200, bot, 34, C.dark, { w: 700 })}`);
        o += cell(780, 300, 'made money', 'on a bad decision', '#E2556F', seg(t, B.bad, B.bad + 0.5));
        o += cell(1300, 300, 'lost money', 'on a good decision', '#2AA594', seg(t, B.good, B.good + 0.5));
        o += fade(g * seg(t, B.good + 2, B.good + 2.6), txt(1280, 760, 'the money doesn’t grade the decision', 42, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // The money was never yours. Back to the system. Hand. Off. The. Mouse.
    'v2-hands': (s, t) => {
      const B = s.b;
      let o = grad('hd', '#E6F5F2', '#FDF8F5') + bg('url(#hd)');
      const p2 = seg(t, B.system - 0.3, B.system + 0.3), p3 = seg(t, B.later - 0.4, B.later + 0.2), p4 = seg(t, B.hand - 0.4, B.hand + 0.2);
      // the money that was never yours dissolves
      const a = 1 - p2;
      if (a > 0) {
        const d = seg(t, B.never, B.never + 2);
        for (let i = 0; i < 14; i++) { const ang = i * 0.9, r = 40 + d * (200 + (i % 4) * 60); o += fade(a * (1 - d * 0.9), `<text x="${f1(960 + Math.cos(ang) * r)}" y="${f1(520 + Math.sin(ang) * r * 0.6 - d * 80)}" font-size="${60 - (i % 3) * 10}" font-weight="900" text-anchor="middle" fill="#B38A2E" font-family="JetBrains Mono, monospace">$</text>`); }
        o += fade(a * seg(t, B.stop, B.stop + 0.4) * (1 - d), txt(960, 300, 'what you could’ve made', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(a * seg(t, B.never, B.never + 0.5), txt(960, 820, 'that money was never yours.', 66, C.dark, { f: 'Playfair Display', it: true }));
      }
      // back to the system
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(960, 170, 'come back to your system', 54, '#2AA594', { f: 'Playfair Display', it: true }));
        [[B.n1, 'can I justify getting in?'], [B.n2, 'will price keep running?'], [B.n3, 'can I catch 30 more points?']].forEach(([at, l], j) => { const y = 330 + j * 110, k = seg(t, at, at + 0.4); o += fade(b * k, txt(960, y, l, 42, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="${960 - l.length * 11 - 30}" x2="${f1(960 - l.length * 11 - 30 + (l.length * 22 + 60) * seg(t, at + 0.8, at + 1.3))}" y1="${y - 14}" y2="${y - 14}" stroke="#E2556F" stroke-width="5"/>`); });
        o += scaleAt(960, 780, b * pop(t, B.exist, 0.6), `<rect x="460" y="700" width="1000" height="160" rx="80" fill="#2AA594"/>${txt(960, 800, 'Does my setup exist right now?', 50, '#fff')}`);
        o += fade(b * seg(t, B.valid, B.valid + 0.3) * (1 - seg(t, B.n1, B.n1 + 0.3)), txt(960, 450, 'is there a valid setup?', 60, C.dark, { f: 'Playfair Display', it: true }));
      }
      // missing one doesn't end the day; the next one stands on its own
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, `<line x1="200" x2="1720" y1="500" y2="500" stroke="#B8B3C9" stroke-width="8" stroke-linecap="round"/>${txt(200, 560, 'open', 30, C.muted, { a: 'start', w: 700 })}${txt(1720, 560, 'close', 30, C.muted, { a: 'end', w: 700 })}`);
        o += fade(c, `<circle cx="560" cy="500" r="50" fill="#fff" stroke="#E2556F" stroke-width="6"/>${txt(560, 420, 'missed', 34, '#E2556F')}`) + cross(560, 500, c, '#E2556F', 30);
        o += fade(c * seg(t, B.later + 2, B.later + 2.6), `<circle cx="1260" cy="500" r="50" fill="#fff" stroke="#2AA594" stroke-width="6"/>${txt(1260, 420, 'a later setup', 34, '#2AA594')}`) + check(1260, 500, c * pop(t, B.later + 2.4, 0.4), '#2AA594', 30);
        o += fade(c * seg(t, B.merit, B.merit + 0.5), txt(1260, 640, 'stands on its own', 40, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
        // the standards bar refuses to drop
        const tug = seg(t, B.lower, B.lower + 3), drop = 18 * Math.sin(tug * Math.PI * 3) * (1 - tug);
        o += fade(c * seg(t, B.lower, B.lower + 0.4), `<rect x="560" y="${f1(780 + drop)}" width="800" height="70" rx="35" fill="#2C1810"/>${txt(960, 828 + drop, 'MY STANDARDS', 34, '#fff', { ls: 6 })}${txt(960, 940, 'don’t drop because I’m mad I missed one', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      // hand off the mouse
      if (p4 > 0) {
        const lift = ease(seg(t, B.lit, B.lit + 0.8)), sit = ease(seg(t, B.sit, B.sit + 0.8));
        o += fade(p4, `<rect x="0" y="760" width="1920" height="320" fill="#E8D5C4"/><ellipse cx="960" cy="800" rx="110" ry="70" fill="#fff" stroke="#B8B3C9" stroke-width="6"/><line x1="960" y1="730" x2="960" y2="790" stroke="#B8B3C9" stroke-width="5"/><path d="M960,730 C960,640 1100,660 1120,560" stroke="#B8B3C9" stroke-width="6" fill="none"/>`);
        // the hand
        const hy = 760 - lift * 380, hx = 960 + lift * 260, hr = -lift * 25;
        o += fade(p4 * (1 - sit), `<g transform="translate(${f1(hx)},${f1(hy)}) rotate(${f1(hr)})"><rect x="-80" y="-60" width="160" height="110" rx="50" fill="#9A6244"/>${[0, 1, 2, 3].map(i => `<rect x="${-72 + i * 38}" y="-110" width="32" height="80" rx="16" fill="#9A6244"/>`).join('')}<rect x="-60" y="40" width="120" height="300" rx="40" fill="#F4829A"/></g>`);
        const chant = t > B.hand && t < B.lit ? Math.floor((t - B.hand) * 1.6) % 3 : -1;
        if (chant >= 0) ['I need to get in', 'I need to get in!', 'I NEED TO GET IN'].forEach((l, j) => { if (j <= chant) o += thought(560 + j * 400, 220 + (j % 2) * 120, l, 1, { size: 34 + j * 4 }); });
        o += fade(seg(t, B.lit, B.lit + 0.3) * (1 - sit), txt(960, 260, 'hand. off. the mouse.', 70, C.dark, { f: 'Playfair Display', it: true }));
        if (sit > 0) {
          o += fade(sit, you(t, { x: 1500, y: 740, scale: 1 }));
          o += fade(seg(t, B.ask, B.ask + 0.5), txt(800, 240, 'what exactly am I waiting to see', 50, C.dark, { f: 'Playfair Display', it: true }) + txt(800, 320, 'before I’m allowed to enter?', 50, C.dark, { f: 'Playfair Display', it: true }));
          o += fade(seg(t, B.cant, B.cant + 0.5), pill(800, 470, 'can’t answer from your written system? don’t click.', '#E2556F', 1, 32));
        }
      }
      return o;
    },

    // If the entry is gone, the trade is gone. $0 vs −$.
    'v2-rule': (s, t) => {
      const B = s.b;
      let o = grad('r2', '#EEEBFB', '#DDF1EE') + bg('url(#r2)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'If my entry is gone, the trade is gone.', 72, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3);
      [[B.r1, 'the original trade', 'I don’t chase it', '#E2556F'], [B.r2, 'a new valid setup', 'evaluated on its own', '#2AA594'], [B.r3, 'one missed opportunity', '≠ a bad trade', '#7F77DD']].forEach(([at, a, b, col], j) => {
        const y = 440 + j * 120;
        o += fade(seg(t, at, at + 0.5) * (1 - fin), `<rect x="360" y="${y - 50}" width="1200" height="96" rx="48" fill="#fff"/>${txt(420, y + 12, a, 38, C.dark, { a: 'start' })}${txt(1500, y + 12, b, 38, col, { a: 'end' })}`);
      });
      if (fin > 0) {
        const rc = (x, title, amt, col, k) => scaleAt(x, 640, k, `<g transform="rotate(${x < 960 ? -3 : 3} ${x} 640)"><rect x="${x - 260}" y="420" width="520" height="460" rx="12" fill="#fff"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<path d="M${x - 260 + i * 52},880 l26,24 l26,-24" fill="#fff"/>`).join('')}${txt(x, 500, 'RECEIPT', 28, C.muted, { ls: 6 })}${txt(x, 600, title, 44, C.dark, { f: 'Playfair Display', it: true })}<line x1="${x - 200}" x2="${x + 200}" y1="660" y2="660" stroke="#E6DDD3" stroke-width="4" stroke-dasharray="10 8"/>${txt(x, 790, amt, 110, col, { f: 'JetBrains Mono, monospace' })}</g>`);
        o += rc(620, 'missing a trade', '$0', '#2AA594', fin * pop(t, B.line + 0.2, 0.6));
        o += rc(1300, 'chasing one', '−$$$', '#E2556F', pop(t, B.line + 2.2, 0.6));
      }
      return o;
    },

    // Reflection: what made you enter? Cover the move. Always another candle.
    'v2-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const cov = seg(t, B.bigq - 0.3, B.bigq + 0.3), end = seg(t, B.g1 - 0.4, B.g1 + 0.3);
      const a = 1 - cov;
      if (a > 0) {
        o += fade(a, txt(960, 200, 'the last trade you chased', 56, '#fff', { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.what, B.what + 0.5), txt(960, 330, 'what actually made you enter?', 64, '#F9D89A', { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.q1, B.q1 + 0.4), `<rect x="260" y="470" width="620" height="260" rx="36" fill="#1E3A36" stroke="#2AA594" stroke-width="6"/>${txt(570, 620, 'my setup was there', 44, '#fff')}`);
        o += fade(a * seg(t, B.q2, B.q2 + 0.4), `<rect x="1040" y="470" width="620" height="260" rx="36" fill="#3A1420" stroke="#E2556F" stroke-width="6"/>${txt(1350, 590, 'uncomfortable', 44, '#fff')}${txt(1350, 650, 'watching it move without me', 32, '#FF8DA3', { w: 700 })}`);
      }
      const b = cov * (1 - end);
      if (b > 0) {
        const series = [0.15, 0.17, 0.16, 0.22, 0.3, 0.4, 0.5, 0.58, 0.66, 0.74, 0.8, 0.85, 0.82];
        o += fade(b, `<rect x="360" y="220" width="1200" height="560" rx="28" fill="#120D1C"/>${candles(390, 260, 1140, 480, series, 13, { slots: 13 })}`);
        const cover = ease(seg(t, B.big + 1, B.big + 2.2));
        o += fade(b, `<rect x="380" y="240" width="${f1(860 * cover)}" height="520" rx="16" fill="#3A2F55"/>`);
        o += fade(b * cover, txt(380 + 430 * cover, 520, 'the move you saw', 40, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 }));
        o += pill(390 + 11 * 1140 / 13, 230, 'your entry', '#E2556F', b * pop(t, B.big + 0.3, 0.4), 26);
        o += fade(b * seg(t, B.big + 3, B.big + 3.6), txt(960, 880, 'would you still take this exact trade?', 52, '#F9D89A', { f: 'Playfair Display', it: true }));
        o += fade(b * seg(t, B.tells, B.tells + 0.5), txt(960, 970, 'if not… that tells you something.', 40, '#FF8DA3', { f: 'Playfair Display', it: true, w: 700 }));
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const fin = seg(t, B.last - 0.3, B.last + 0.3);
        o += fade(end * (1 - fin), txt(960, 230, 'not every move', 56, C.muted, { f: 'Playfair Display', it: true }) + `<line x1="740" x2="${f1(740 + 440 * seg(t, B.g1 + 1, B.g1 + 1.5))}" y1="212" y2="212" stroke="#E2556F" stroke-width="6"/>`);
        o += fade(end * (1 - fin) * seg(t, B.g2, B.g2 + 0.5), txt(960, 340, 'your moves.', 80, '#2AA594', { f: 'Playfair Display', it: true }));
        // the conveyor: always another one
        if (t > B.always - 0.3) {
          const k = seg(t, B.always - 0.3, B.always + 0.3) * (1 - fin);
          ['another candle', 'another session', 'another opportunity', 'another candle', 'another session', 'another opportunity'].forEach((l, j) => { const x = ((t - B.always) * 170 + j * 420) % 2520 - 300; o += fade(k * seg(t, B.always + Math.min(j, 2) * 2, B.always + Math.min(j, 2) * 2 + 0.5), `<g transform="translate(${f1(x)},640)"><rect x="-180" y="-70" width="360" height="140" rx="30" fill="#fff" stroke="#E6DDD3" stroke-width="4"/>${txt(0, 12, l, 32, '#7F77DD')}</g>`); });
        }
        o += fade(fin, txt(960, 480, 'You don’t have to turn every move you see', 60, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 580, 'into a trade you take.', 60, '#E2556F', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    /* ════ Psychology 3 · Revenge Trading ══════════════════════════════ */

    // You did everything right. It lost anyway. Five minutes later: "I can make that back."
    'v3-loss': (s, t) => {
      const B = s.b;
      let o = grad('rl', '#1C1528', '#2B1A26') + bg('url(#rl)');
      const endk = seg(t, B.notauto - 0.4, B.notauto + 0.3);
      // the plan, ticked
      ['setup', 'confirmation', 'entry', 'stop respected'].forEach((l, j) => {
        const y = 260 + j * 110, at = B.plan + j * 1.6;
        o += fade((1 - endk) * seg(t, at, at + 0.4) * (1 - seg(t, B.five - 0.3, B.five)), `<rect x="180" y="${y - 45}" width="560" height="90" rx="45" fill="#2A2142"/>${txt(240, y + 12, l, 38, '#fff', { a: 'start', w: 700 })}`) + (t < B.five ? check(680, y, (1 - endk) * pop(t, at + 0.3, 0.4), '#2AA594', 28) : '');
      });
      // the red number
      const rk = pop(t, B.lost, 0.6), throb = t > B.red ? 1 + 0.03 * Math.sin((t - B.red) * 5) : 1;
      o += fade(1 - endk, scaleAt(1000, 520, rk * throb * (1 - seg(t, B.five - 0.3, B.five) * 0.4), `${txt(1000, 560, '−$200', 150, '#E2556F', { f: 'JetBrains Mono, monospace' })}${txt(1000, 640, 'STOPPED OUT', 36, '#FF8DA3', { ls: 6 })}`));
      o += fade(1 - endk, you(t, { x: 1560, y: 1020, scale: 1.2, flip: true, mood: t > B.lost ? 'sad' : undefined, frontArm: t > B.back && t < B.careful ? { a1: -60, a2: -150 } : undefined }));
      o += thought(1500, 330, 'damn.', between(t, B.red + 2, B.five - 0.2) * (1 - endk), { size: 50 });
      // price moves again
      const mv = seg(t, B.five - 0.3, B.five + 0.3) * (1 - endk);
      if (mv > 0) {
        const n = 2 + Math.floor(seg(t, B.five, B.back + 2) * 12);
        o += fade(mv, `<rect x="180" y="200" width="1000" height="560" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>${candles(210, 240, 940, 480, [0.6, 0.45, 0.32, 0.25, 0.3, 0.38, 0.46, 0.44, 0.52, 0.6, 0.58, 0.66, 0.72, 0.78], n, { slots: 14 })}${txt(210, 780, '5 minutes later', 30, '#F9D89A', { a: 'start', f: 'JetBrains Mono, monospace' })}`);
        o += thought(1480, 330, '“Okay. I can make that back.”', between(t, B.back, B.careful - 0.1), { size: 38 });
        o += scaleAt(1460, 380, pop(t, B.careful, 0.5), `<path d="M1460,240 L1590,470 L1330,470 Z" fill="#F9D89A" stroke="#2C1810" stroke-width="8" stroke-linejoin="round"/>${txt(1460, 445, '!', 120, '#2C1810')}`);
      }
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, `<rect x="200" y="260" width="680" height="300" rx="40" fill="#fff"/>${txt(540, 390, 'another trade', 50, C.dark, { f: 'Playfair Display', it: true })}${txt(540, 460, 'after a loss', 50, C.dark, { f: 'Playfair Display', it: true })}`) + check(860, 270, endk * pop(t, B.notauto + 2, 0.5), '#2AA594', 36);
        o += fade(endk * seg(t, B.notauto + 2.5, B.notauto + 3.1), txt(540, 640, 'not automatically revenge', 34, '#2AA594', { w: 700 }));
        o += fade(seg(t, B.why, B.why + 0.5), `<rect x="1040" y="260" width="680" height="300" rx="40" fill="#2C1810"/>${txt(1380, 400, 'WHY', 90, '#F9D89A', { ls: 10 })}${txt(1380, 480, 'are you taking the next one?', 36, '#fff', { w: 700 })}`);
      }
      return o;
    },

    // The loss reaches into the next decision. Erasing a feeling. The market doesn't know.
    'v3-erase': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const p2 = seg(t, B.here - 0.3, B.here + 0.3), p3 = seg(t, B.eval - 0.4, B.eval + 0.2), p4 = seg(t, B.know - 0.3, B.know + 0.3);
      // the loss reaches into what you do next
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, txt(960, 170, 'when the loss starts deciding what you do next', 48, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        const chips = [['more contracts', 360, 320], ['entering faster', 1560, 320], ['“good enough” setups', 380, 760], ['3 back-to-back', 1540, 760]];
        chips.forEach(([l, x, y], j) => {
          const k = seg(t, B.infl + j * 1, B.infl + j * 1 + 0.5);
          o += fade(a * k, `<line x1="960" y1="520" x2="${f1(lerp(960, x, k))}" y2="${f1(lerp(520, y, k))}" stroke="#E2556F" stroke-width="6" stroke-dasharray="14 10"/>`) + pill(x, y, l, '#2C1810', a * pop(t, B.infl + j + 0.3, 0.4), 34);
        });
        o += fade(a * seg(t, B.isnt, B.isnt + 0.4), `<rect x="760" y="420" width="400" height="200" rx="30" fill="#E2556F"/>${txt(960, 540, 'LAST LOSS', 46, '#fff', { ls: 4 })}`);
      }
      // erase the feeling: an eraser scrubbing the red number
      const b = p2 * (1 - p3);
      if (b > 0) {
        const ex = 960 + 220 * Math.sin((t - B.erase) * 6) * seg(t, B.erase + 0.5, B.erase + 1);
        o += fade(b * seg(t, B.erase, B.erase + 0.5), `${txt(960, 470, '−$100', 160, '#E2556F', { f: 'JetBrains Mono, monospace', op: f1(1 - 0.2 * seg(t, B.erase, B.erase + 6)) })}<g transform="translate(${f1(ex)},530) rotate(-20)"><rect x="-90" y="-50" width="180" height="100" rx="14" fill="#F4829A"/><rect x="-90" y="10" width="180" height="40" rx="8" fill="#7F77DD"/></g>${txt(960, 650, 'trying to erase the feeling of losing', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
        // the math of getting back
        o += fade(b * seg(t, B.u400, B.u400 + 0.4), `<rect x="260" y="760" width="620" height="190" rx="30" fill="#fff"/>${txt(570, 830, 'up $400 → lost $100', 36, C.dark, { f: 'JetBrains Mono, monospace' })}${txt(570, 900, '“I want my $100 back”', 36, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}`);
        o += fade(b * seg(t, B.d300, B.d300 + 0.4), `<rect x="1040" y="760" width="620" height="190" rx="30" fill="#fff"/>${txt(1350, 830, 'down $300', 36, C.dark, { f: 'JetBrains Mono, monospace' })}${txt(1350, 900, '“I just need one good trade”', 36, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      // the compass points the wrong way
      const c = p3 * (1 - p4);
      if (c > 0) {
        const sw = ease(seg(t, B.getback, B.getback + 1.2)), ang = lerp(-90, 90, sw) * Math.PI / 180;
        o += fade(c, `<circle cx="960" cy="540" r="260" fill="#fff" stroke="#2C1810" stroke-width="10"/>${txt(960, 250, 'what’s actually happening', 36, '#2AA594')}${txt(960, 860, 'back to where I was', 36, '#E2556F')}<line x1="960" y1="540" x2="${f1(960 + 210 * Math.cos(ang))}" y2="${f1(540 + 210 * Math.sin(ang))}" stroke="${sw > 0.5 ? '#E2556F' : '#2AA594'}" stroke-width="18" stroke-linecap="round"/><circle cx="960" cy="540" r="26" fill="#2C1810"/>`);
        o += fade(c, txt(260, 540, 'evaluating', 40, C.muted, { a: 'start', f: 'Playfair Display', it: true, w: 700 }));
      }
      // the market doesn't know
      if (p4 > 0) {
        o += fade(p4, `<rect x="560" y="220" width="800" height="460" rx="30" fill="#120D1C"/>${candles(590, 260, 740, 380, vals(23, 18, 0.004, 0.05, 0.5), 18)}<rect x="1020" y="700" width="340" height="80" rx="16" fill="#fff" stroke="#E6DDD3" stroke-width="4"/>${txt(1190, 752, 'your last trade: ???', 30, C.muted, { f: 'JetBrains Mono, monospace' })}`);
        o += fade(seg(t, B.know, B.know + 0.5), txt(960, 870, 'the market doesn’t know you lost', 54, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.know + 2.5, B.know + 3.1), txt(960, 950, 'your next setup isn’t more likely to win because you need it to', 34, '#E2556F', { w: 700 }));
      }
      return o;
    },

    // Not dramatic. Subtle. Three little dials turn. You can make a chart look like a setup.
    'v3-subtle': (s, t) => {
      const B = s.b;
      let o = grad('sb', '#F3E3D6', '#FBF4EF') + bg('url(#sb)');
      const p2 = seg(t, B.subtle - 0.3, B.subtle + 0.3), p3 = seg(t, B.whyt - 0.4, B.whyt + 0.2), p4 = seg(t, B.nothing - 0.3, B.nothing + 0.3);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.make && t < B.nothing ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      // dramatic: button mashing (crossed out)
      const a = seg(t, B.dramatic, B.dramatic + 0.4) * (1 - p2);
      if (a > 0) {
        for (let i = 0; i < 10; i++) { const x = 820 + (i % 5) * 190, y = 300 + Math.floor(i / 5) * 220, hit = Math.sin(t * 14 + i * 1.7) > 0.6; o += fade(a, `<rect x="${x}" y="${y + (hit ? 10 : 0)}" width="150" height="${hit ? 90 : 100}" rx="20" fill="${i % 2 ? '#2AA594' : '#E2556F'}"/>${txt(x + 75, y + 62, i % 2 ? 'BUY' : 'SELL', 30, '#fff')}`); }
        o += fade(a, txt(1280, 790, '10 trades in 5 minutes', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 })) + cross(1640, 770, a * pop(t, B.slam + 2, 0.4), '#E2556F', 36);
      }
      // subtle: three dials slide
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(1280, 190, 'sometimes it’s subtle', 54, C.dark, { f: 'Playfair Display', it: true }));
        [[B.s1, 'confirmation', 'wait', 'quicker'], [B.s2, 'standards', 'clean', 'make it work'], [B.s3, 'size', 'normal', 'bigger']].forEach(([at, l, from, to], j) => {
          const y = 360 + j * 190, k = seg(t, at, at + 0.4), sl = ease(seg(t, at + 1.2, at + 2.4));
          o += fade(b * k, `${txt(780, y - 30, l.toUpperCase(), 30, C.muted, { a: 'start', ls: 4 })}<rect x="780" y="${y}" width="960" height="24" rx="12" fill="#fff"/>${txt(780, y + 80, from, 32, '#2AA594', { a: 'start' })}${txt(1740, y + 80, to, 32, '#E2556F', { a: 'end' })}<circle cx="${f1(800 + 920 * lerp(0.1, 0.8, sl))}" cy="${y + 12}" r="30" fill="${sl > 0.5 ? '#E2556F' : '#2AA594'}" stroke="#fff" stroke-width="6"/>`);
        });
      }
      // why — and making a chart look like a setup
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, `${txt(1000, 200, 'what', 50, C.muted, { f: 'Playfair Display', it: true })}${txt(1480, 200, 'WHY', 60, '#E2556F', { ls: 6 })}<line x1="920" x2="1080" y1="182" y2="182" stroke="#B8B3C9" stroke-width="4"/>`);
        const mk = seg(t, B.make, B.make + 0.4);
        o += fade(c * mk, `<rect x="760" y="300" width="1000" height="460" rx="28" fill="#120D1C"/>${candles(790, 340, 940, 380, vals(5, 20, 0, 0.05, 0.5), 20)}`);
        const draw = seg(t, B.make + 1, B.make + 3.5);
        o += fade(c * mk, `<path d="M820,600 L1000,450 L1180,560 L1360,420 L1540,520 L1720,400" fill="none" stroke="#F9D89A" stroke-width="6" stroke-dasharray="${f1(1200 * draw)} 1400"/>`);
        o += pill(1260, 820, '“looks like a setup to me…”', '#F9D89A', c * pop(t, B.make + 3.6, 0.4), 32, '#2C1810');
      }
      // the best thing: nothing
      if (p4 > 0) {
        o += fade(p4, `<rect x="900" y="300" width="760" height="420" rx="30" fill="#fff"/><rect x="960" y="350" width="640" height="300" rx="16" fill="#E6F5F2"/>${txt(1280, 520, '…', 120, '#2AA594')}${txt(1280, 820, 'sometimes the best trade is nothing', 48, '#2AA594', { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      return o;
    },

    // A loss isn't a mistake. Space before the next decision. Calm you or damn-money-back you?
    'v3-reset': (s, t) => {
      const B = s.b;
      let o = grad('rs', '#E6F5F2', '#FDF8F5') + bg('url(#rs)');
      const p2 = seg(t, B.mistake - 0.3, B.mistake + 0.3), p3 = seg(t, B.space - 0.3, B.space + 0.3), p4 = seg(t, B.calm - 0.3, B.calm + 0.3), p5 = seg(t, B.would - 0.3, B.would + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a * seg(t, B.norm, B.norm + 0.4), txt(960, 200, 'normalize losing trades', 60, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.stop, B.stop + 0.4), `<rect x="610" y="300" width="700" height="460" rx="40" fill="#fff"/>${txt(960, 380, 'STOP LOSS HIT', 36, '#E2556F', { ls: 6 })}`);
        ['valid setup', 'correct risk', 'followed the plan'].forEach((l, j) => { const y = 480 + j * 90, at = B.stop + 1 + j * 0.6; o += fade(a * seg(t, at, at + 0.3), txt(700, y + 12, l, 38, C.dark, { a: 'start', w: 700 })) + check(1200, y, a * pop(t, at + 0.2, 0.4), '#2AA594', 28); });
      }
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, `<rect x="200" y="300" width="680" height="380" rx="40" fill="#fff"/>${txt(540, 470, 'I made a mistake', 50, C.muted, { f: 'Playfair Display', it: true })}`) + cross(540, 570, b * pop(t, B.mistake + 1, 0.4), '#E2556F', 36);
        o += fade(b * seg(t, B.tlost, B.tlost + 0.4), `<rect x="1040" y="300" width="680" height="380" rx="40" fill="#fff" stroke="#2AA594" stroke-width="6"/>${txt(1380, 470, 'my trade lost', 50, '#2AA594', { f: 'Playfair Display', it: true })}`) + check(1380, 570, b * pop(t, B.tlost + 0.5, 0.4), '#2AA594', 36);
        o += fade(b * seg(t, B.diff, B.diff + 0.4), txt(960, 820, 'two completely different things', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        const gap = ease(seg(t, B.space + 1, B.space + 4));
        o += fade(c, `<rect x="${f1(660 - gap * 400)}" y="400" width="360" height="200" rx="30" fill="#E2556F"/>${txt(840 - gap * 400, 520, 'the loss', 44, '#fff')}<rect x="${f1(900 + gap * 400)}" y="400" width="360" height="200" rx="30" fill="#2C1810"/>${txt(1080 + gap * 400, 500, 'the next', 40, '#fff')}${txt(1080 + gap * 400, 550, 'decision', 40, '#fff')}`);
        o += fade(c * gap, `<rect x="${f1(1020 - gap * 400)}" y="470" width="${f1(gap * 800 - 120)}" height="60" rx="30" fill="#F9D89A" opacity=".7"/>${txt(960, 700, 'create space', 54, '#2AA594', { f: 'Playfair Display', it: true })}`);
      }
      const d = p4 * (1 - p5);
      if (d > 0) {
        o += fade(d, txt(960, 170, 'who’s making the next decision?', 54, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(d, you(t, { x: 560, y: 940, scale: 1.25 }) + pill(560, 300, 'calm you', '#2AA594', 1, 38));
        const dk = seg(t, B.damn, B.damn + 0.5);
        if (dk > 0) {
          o += fade(d * dk, you(t, { x: 1360, y: 940, scale: 1.25, flip: true, mood: 'sad' }) + `<circle cx="1360" cy="540" r="${f1(230 + 15 * Math.sin(t * 6))}" fill="#E2556F" opacity=".15"/>`);
          for (let j = 0; j < 3; j++) { const p = ((t * 0.8 + j * 0.33) % 1); o += `<path d="M${1320 + j * 40},${f1(420 - p * 120)} q14,-20 0,-40 q-14,-20 0,-40" stroke="#E2556F" stroke-width="6" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.6 * d * dk)}"/>`; }
          o += thought(1360, 300, '“give me my damn money back”', d * pop(t, B.damn + 0.3, 0.5), { size: 34 });
        }
      }
      if (p5 > 0) {
        o += fade(p5, txt(960, 160, 'before another trade, ask:', 48, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
        [['is this actually my setup?', 0], ['would I take this trade if my last one had WON?', 1], ['am I using my normal size?', 0], ['is this risk about THIS trade, or the last one?', 0]].forEach(([l, hot], j) => {
          const y = 300 + j * 150, k = seg(t, B.would + j * 0.5, B.would + j * 0.5 + 0.4), hk = hot ? 1 + 0.06 * seg(t, B.would + 2.5, B.would + 3) : 1;
          o += fade(p5 * k, scaleAt(960, y, hk, `<rect x="300" y="${y - 55}" width="1320" height="110" rx="55" fill="${hot ? '#2C1810' : '#fff'}"/>${txt(960, y + 14, l, hot ? 42 : 38, hot ? '#F9D89A' : C.dark)}`));
        });
      }
      return o;
    },

    // Reset before re-entering. The next trade's job is not to pay for the last one.
    'v3-rule': (s, t) => {
      const B = s.b;
      let o = grad('r3', '#EEEBFB', '#DDF1EE') + bg('url(#r3)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'After a full stop loss, I reset before I re-enter.', 62, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      if (a > 0) {
        const secs = Math.max(0, 600 - Math.floor(seg(t, B.r1, B.r1 + 8) * 600));
        o += fade(a * seg(t, B.r1, B.r1 + 0.4), `<rect x="200" y="380" width="460" height="300" rx="36" fill="#fff"/>${txt(430, 560, `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, 90, '#7F77DD', { f: 'JetBrains Mono, monospace' })}${txt(430, 640, 'step away', 32, C.muted, { w: 700 })}`);
        o += fade(a * seg(t, B.r2, B.r2 + 0.4), `<rect x="730" y="380" width="460" height="300" rx="36" fill="#fff"/><path d="M890,450 L910,620 L1010,620 L1030,450 Z" fill="#BFE3F5" stroke="#7FB8D6" stroke-width="6"/>${txt(960, 660, 'water · whatever', 32, C.muted, { w: 700 })}`);
        o += fade(a * seg(t, B.r3, B.r3 + 0.4), `<rect x="1260" y="380" width="460" height="300" rx="36" fill="#fff"/><rect x="1300" y="500" width="120" height="70" rx="14" fill="#E2556F"/><rect x="1560" y="500" width="120" height="70" rx="14" fill="#2C1810"/><line x1="1430" x2="1550" y1="535" y2="535" stroke="#F9D89A" stroke-width="10" stroke-dasharray="12 10"/>${txt(1490, 640, 'a break between', 32, C.muted, { w: 700 })}`);
        o += fade(a * seg(t, B.r4, B.r4 + 0.5), `<rect x="360" y="760" width="1200" height="140" rx="70" fill="#2C1810"/>${txt(960, 845, 'same criteria as if I hadn’t lost', 44, '#fff')}`);
      }
      if (fin > 0) {
        // the next trade refuses the bill
        o += fade(fin, `<rect x="380" y="420" width="420" height="300" rx="30" fill="#E2556F"/>${txt(590, 560, 'LAST TRADE', 40, '#fff', { ls: 4 })}${txt(590, 620, '−$200', 44, '#fff', { f: 'JetBrains Mono, monospace' })}<rect x="1120" y="420" width="420" height="300" rx="30" fill="#2AA594"/>${txt(1330, 580, 'NEXT TRADE', 40, '#fff', { ls: 4 })}`);
        const slide = ease(seg(t, B.line + 0.5, B.line + 1.5)), bounce = ease(seg(t, B.line + 1.6, B.line + 2.4));
        const bx = lerp(800, 1080, slide) - bounce * 240;
        o += fade(fin, `<g transform="translate(${f1(bx)},560) rotate(${f1(-6 + bounce * 12)})"><rect x="-90" y="-60" width="180" height="120" rx="10" fill="#FFF3D6" stroke="#B38A2E" stroke-width="4"/>${txt(0, 12, 'BILL', 32, '#B38A2E', { ls: 4 })}</g>`) + cross(1330, 420, pop(t, B.line + 2, 0.4), '#E2556F', 36);
        o += fade(seg(t, B.line + 0.2, B.line + 0.8), txt(960, 850, 'My next trade’s job is not to pay for my last trade.', 50, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Reflection: what changed after the loss? Win → next vs loss → next. Take the loss. Reset. Rules.
    'v3-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const p2 = seg(t, B.bigq - 0.3, B.bigq + 0.3), end = seg(t, B.c1 - 0.4, B.c1 + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, txt(960, 180, 'after the loss, what changed?', 56, '#fff', { f: 'Playfair Display', it: true }));
        [[B.q1, 'my size'], [B.q2, 'how fast I entered'], [B.q3, 'my standards'], [B.q4, 'what I “needed” to make back']].forEach(([at, l], j) => {
          const x = 500 + (j % 2) * 920, y = 420 + Math.floor(j / 2) * 260;
          o += fade(a * seg(t, at, at + 0.4), `<rect x="${x - 380}" y="${y - 90}" width="760" height="180" rx="30" fill="#2A2142"/>${txt(x, y + 14, l, 44, '#fff')}`) + `<g opacity="${f1(a * seg(t, at + 0.6, at + 1))}">${txt(x + 330, y - 50, '?', 50, '#F9D89A')}</g>`;
        });
      }
      const b = p2 * (1 - end);
      if (b > 0) {
        const card = (x, top, col, k) => fade(b * k, `<rect x="${x - 340}" y="300" width="680" height="420" rx="36" fill="#2A2142"/>${txt(x, 380, 'FIRST TRADE', 30, '#CFC8FA', { ls: 6 })}${pill(x, 470, top, col, 1, 48)}${txt(x, 580, '↓', 60, '#CFC8FA')}<rect x="${x - 220}" y="610" width="440" height="80" rx="20" fill="#3A2F55"/>${txt(x, 663, 'the next trade', 34, '#fff', { w: 700 })}`);
        o += card(560, 'WON', '#2AA594', seg(t, B.big, B.big + 0.5));
        o += card(1360, 'LOST', '#E2556F', seg(t, B.big + 1.5, B.big + 2));
        o += fade(b * seg(t, B.big + 3.5, B.big + 4), txt(960, 530, '=?', 80, '#F9D89A'));
        o += fade(b * seg(t, B.big + 3.5, B.big + 4), txt(960, 860, 'exactly the same way?', 56, '#F9D89A', { f: 'Playfair Display', it: true }));
        o += fade(b * seg(t, B.changed, B.changed + 0.5), txt(960, 960, 'if not, figure out what changed.', 40, '#FF8DA3', { f: 'Playfair Display', it: true, w: 700 }));
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const fin = seg(t, B.owe - 0.3, B.owe + 0.3);
        o += fade(end * (1 - fin), `${txt(960, 260, 'another trade after a loss', 52, C.dark, { f: 'Playfair Display', it: true })}${txt(960, 400, 'another trade because you lost', 52, '#E2556F', { f: 'Playfair Display', it: true, op: f1(seg(t, B.c2, B.c2 + 0.5)) })}`) + check(1360, 240, end * (1 - fin) * pop(t, B.c1 + 1, 0.4), '#2AA594', 30) + cross(1440, 380, (1 - fin) * pop(t, B.c2 + 1.5, 0.4), '#E2556F', 30);
        ['TAKE THE LOSS.', 'RESET.', 'BACK TO YOUR RULES.'].forEach((l, j) => { o += fade(1 - fin, pill([520, 960, 1400][j], 640, l, ['#E2556F', '#7F77DD', '#2AA594'][j], pop(t, B.steps + j * 0.8, 0.5), 38)); });
        o += fade(fin, txt(960, 430, 'The market doesn’t owe you your money back.', 58, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 540, 'Your next trade doesn’t have to get it back.', 58, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    /* ════ Psychology 4 · Overtrading ══════════════════════════════════ */

    // Trade… trade… trade… #6, #7, #8. What am I still looking for?
    'v4-count': (s, t) => {
      const B = s.b;
      let o = grad('oc', '#1C1528', '#2E2142') + bg('url(#oc)');
      const endk = seg(t, B.diff - 0.4, B.diff + 0.3);
      // trades counter
      let n = 3;
      if (t > B.another) n = 4;
      if (t > B.closes + 1.2) n = 5;
      if (t > B.six) n = 6 + Math.min(2, Math.floor((t - B.six) / 1.1));
      const series = vals(91, 40, 0, 0.045, 0.5);
      const cn = Math.min(40, 6 + Math.floor(seg(t, s.start, B.looking) * 34));
      o += fade(1 - endk, `<rect x="160" y="200" width="1100" height="560" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>${candles(190, 240, 1040, 480, series, cn, { slots: 40 })}`);
      for (let i = 0; i < n; i++) { const x = 190 + (2 + i * 4.4) * 1040 / 40; o += fade((1 - endk) * pop(t, i < 3 ? s.start + 0.3 * i : [B.another, B.closes + 1.2, B.six, B.six + 1.1, B.six + 2.2][i - 3], 0.4), `<circle cx="${f1(x)}" cy="740" r="18" fill="${i < 3 ? '#7F77DD' : '#F9D89A'}"/>`); }
      o += fade(1 - endk, `${txt(1600, 300, 'TRADE', 40, '#CFC8FA', { ls: 8 })}`) + fade(1 - endk, scaleAt(1600, 440, 1 + 0.15 * (t > B.six ? Math.max(0, 1 - ((t - B.six) % 1.1) / 0.3) : 0), txt(1600, 480, '#' + n, 170, n >= 6 ? '#F9D89A' : '#fff', { f: 'JetBrains Mono, monospace' })));
      ['green', 'red', 'breakeven'].forEach((l, j) => { o += pill(360 + j * 280, 150, l, ['#2AA594', '#E2556F', '#7F77DD'][j], (1 - endk) * pop(t, B.states + j * 1.2, 0.4) * (1 - seg(t, B.still, B.still + 0.5)), 28); });
      o += fade((1 - endk) * seg(t, B.still, B.still + 0.4), txt(710, 150, 'still at the chart', 40, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      // the search: a magnifier sweeps the chart
      if (t > B.looking) {
        const sx = 700 + 400 * Math.sin((t - B.looking) * 1.4);
        o += fade((1 - endk) * seg(t, B.looking, B.looking + 0.4), `<circle cx="${f1(sx)}" cy="470" r="110" fill="#fff" opacity=".08" stroke="#F9D89A" stroke-width="12"/><line x1="${f1(sx + 78)}" y1="548" x2="${f1(sx + 170)}" y2="640" stroke="#F9D89A" stroke-width="22" stroke-linecap="round"/>${txt(1600, 700, 'what am I still', 44, '#fff', { f: 'Playfair Display', it: true })}${txt(1600, 770, 'looking for?', 44, '#fff', { f: 'Playfair Display', it: true })}`);
      }
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, `<rect x="200" y="280" width="680" height="380" rx="40" fill="#E6F5F2"/>${txt(540, 420, 'multiple', 50, '#2AA594', { f: 'Playfair Display', it: true })}${txt(540, 490, 'valid setups', 50, '#2AA594', { f: 'Playfair Display', it: true })}`) + check(540, 590, endk * pop(t, B.diff + 2, 0.4), '#2AA594', 34);
        o += fade(seg(t, B.diff + 3, B.diff + 3.6), `<rect x="1040" y="280" width="680" height="380" rx="40" fill="#FDE8ED"/>${txt(1380, 420, 'still sitting', 50, '#E2556F', { f: 'Playfair Display', it: true })}${txt(1380, 490, 'in front of the chart', 50, '#E2556F', { f: 'Playfair Display', it: true })}`) + cross(1380, 590, pop(t, B.diff + 4, 0.4), '#E2556F', 34);
        o += fade(seg(t, B.today, B.today + 0.6), txt(960, 820, 'overtrading', 90, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Not a number. A reason. Red, green, bored. Then the shift.
    'v4-reasons': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const p2 = seg(t, B.reason - 0.3, B.reason + 0.3), p3 = seg(t, B.red - 0.4, B.red + 0.2), p4 = seg(t, B.shift - 0.4, B.shift + 0.2);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a * seg(t, B.three, B.three + 0.4), `${txt(560, 470, '3 trades', 70, '#2AA594', { f: 'JetBrains Mono, monospace' })}${txt(560, 560, 'okay', 40, C.muted, { w: 700 })}${txt(1360, 470, '7 trades', 70, '#E2556F', { f: 'JetBrains Mono, monospace' })}${txt(1360, 560, 'overtrading', 40, C.muted, { w: 700 })}`);
        o += fade(a * seg(t, B.simple, B.simple + 0.4), `<line x1="300" x2="1620" y1="490" y2="490" stroke="#2C1810" stroke-width="10"/>${txt(960, 720, 'not that simple', 56, C.dark, { f: 'Playfair Display', it: true })}`);
      }
      const b = p2 * (1 - p3);
      if (b > 0) {
        // the scale tips toward feelings
        const tip = ease(seg(t, B.reason + 3, B.reason + 6)) * 14;
        o += fade(b, `<g transform="rotate(${f1(-tip)} 960 400)"><line x1="560" x2="1360" y1="400" y2="400" stroke="#2C1810" stroke-width="12" stroke-linecap="round"/><rect x="400" y="420" width="320" height="140" rx="20" fill="#E6F5F2"/>${txt(560, 505, 'my trading plan', 34, '#2AA594')}<rect x="1200" y="420" width="320" height="140" rx="20" fill="#FDE8ED"/>${txt(1360, 485, 'what I’m trying', 32, '#E2556F')}${txt(1360, 530, 'to feel', 32, '#E2556F')}</g><path d="M960,400 L900,760 L1020,760 Z" fill="#B8B3C9"/>${txt(960, 200, 'why are you still trading?', 52, C.dark, { f: 'Playfair Display', it: true })}`);
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        const col = (x, title, colr, k, inner) => fade(c * k, `<rect x="${x - 280}" y="180" width="560" height="720" rx="36" fill="#fff"/><rect x="${x - 280}" y="180" width="560" height="100" rx="36" fill="${colr}"/><rect x="${x - 280}" y="240" width="560" height="40" fill="${colr}"/>${txt(x, 248, title, 40, '#fff', { ls: 6 })}${inner}`);
        o += col(380, 'RED', '#E2556F', seg(t, B.red, B.red + 0.4), `${txt(380, 480, '−$', 120, '#E2556F', { f: 'JetBrains Mono, monospace' })}${txt(380, 640, '“can’t end the', 32, C.dark, { f: 'Playfair Display', it: true, w: 700 })}${txt(380, 690, 'day like this”', 32, C.dark, { f: 'Playfair Display', it: true, w: 700 })}${txt(380, 790, 'one more…', 30, C.muted, { w: 700 })}`);
        // the goalpost keeps moving
        const goal = t < B.six00 ? (t < B.green + 2 ? 400 : 500) : 600, gp = ease(seg(t, B.green + 2, B.green + 2.6)) + ease(seg(t, B.six00, B.six00 + 0.6));
        o += col(960, 'GREEN', '#2AA594', seg(t, B.green, B.green + 0.4), `<rect x="${f1(810 + gp * 50)}" y="380" width="14" height="200" fill="#2C1810"/><rect x="${f1(950 + gp * 50)}" y="380" width="14" height="200" fill="#2C1810"/><rect x="${f1(810 + gp * 50)}" y="380" width="154" height="14" fill="#2C1810"/>${txt(887 + gp * 50, 360, '$' + goal, 40, '#2AA594', { f: 'JetBrains Mono, monospace' })}${txt(960, 680, 'the finish line', 32, C.dark, { f: 'Playfair Display', it: true, w: 700 })}${txt(960, 730, 'keeps moving', 32, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
        const yawn = 1 + 0.15 * Math.max(0, Math.sin((t - B.bored) * 2));
        o += col(1540, 'BORED', '#7F77DD', seg(t, B.bored, B.bored + 0.4), `<circle cx="1540" cy="470" r="110" fill="#F9D89A"/><ellipse cx="1500" cy="440" rx="22" ry="6" fill="#2C1810"/><ellipse cx="1580" cy="440" rx="22" ry="6" fill="#2C1810"/><ellipse cx="1540" cy="510" rx="${f1(24 * yawn)}" ry="${f1(30 * yawn)}" fill="#2C1810"/>${txt(1540, 680, '“I’m already here…”', 32, C.dark, { f: 'Playfair Display', it: true, w: 700 })}${txt(1540, 730, 'catch something?', 32, C.muted, { w: 700 })}`);
      }
      if (p4 > 0) {
        const sw = ease(seg(t, B.shift + 1.5, B.shift + 3));
        o += fade(p4, `${txt(960, 300, 'stopped waiting for', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 })}${txt(960, 420, 'opportunities', 80, '#2AA594', { f: 'Playfair Display', it: true, op: f1(1 - sw * 0.7) })}<line x1="680" x2="${f1(680 + 560 * sw)}" y1="395" y2="395" stroke="#E2556F" stroke-width="8"/>`);
        o += fade(p4 * sw, `${txt(960, 600, 'started looking for', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 })}${txt(960, 720, 'reasons to trade', 80, '#E2556F', { f: 'Playfair Display', it: true })}`);
      }
      return o;
    },

    // A green day, given back. Not taken: put back on the table.
    'v4-table': (s, t) => {
      const B = s.b;
      let o = grad('tb', '#F3E3D6', '#FBF4EF') + bg('url(#tb)');
      const p2 = seg(t, B.sneaky - 0.3, B.sneaky + 0.3), p3 = seg(t, B.permission - 0.4, B.permission + 0.2), p4 = seg(t, B.gave - 0.4, B.gave + 0.2);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.ask && t < B.sneaky ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      // the equity curve: base hits… then kept trading
      const a = 1 - p2;
      if (a > 0) {
        const pts = [0, 0.15, 0.3, 0.42, 0.55, 0.6, 0.52, 0.56, 0.4, 0.44, 0.28, 0.2, 0.05];
        const n = Math.max(2, Math.floor(seg(t, B.kept, B.kept + 9) * pts.length));
        const P = pts.slice(0, n).map((v, i) => `${f1(820 + i * 75)},${f1(700 - v * 480)}`).join(' ');
        o += fade(a, `<rect x="760" y="160" width="1040" height="620" rx="28" fill="#fff"/><line x1="800" x2="1760" y1="700" y2="700" stroke="#E6DDD3" stroke-width="4"/><polyline points="${P}" fill="none" stroke="${n > 6 ? '#E2556F' : '#2AA594'}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`);
        o += pill(820 + 4 * 75, 700 - 0.55 * 480 - 60, 'could’ve been done', '#2AA594', a * pop(t, B.kept + 4, 0.4), 26);
        o += fade(a * seg(t, B.ask, B.ask + 0.5), txt(1280, 880, 'what was I trying to accomplish?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      // you don't have to be losing: confidence meter climbs
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(1280, 180, 'you don’t have to be losing to overtrade', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        const lv = seg(t, B.good, B.every + 3);
        o += fade(b * seg(t, B.winning, B.winning + 0.4), `<rect x="1080" y="300" width="120" height="520" rx="60" fill="#fff"/><rect x="1080" y="${f1(820 - 520 * lv)}" width="120" height="${f1(520 * lv)}" rx="60" fill="${lv > 0.75 ? '#E2556F' : '#F9D89A'}"/>${txt(1140, 870, 'confidence', 30, C.muted, { w: 700 })}`);
        [[B.good, 'feeling good'], [B.reading, 'reading price well'], [B.onit, '“I’m on it today”'], [B.every, 'every setup is MINE']].forEach(([at, l], j) => { o += fade(b * seg(t, at, at + 0.4), txt(1280, 760 - j * 140, l, j === 3 ? 46 : 40, j === 3 ? '#E2556F' : C.dark, { a: 'start', f: 'Playfair Display', it: true, w: 700 })); });
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, `<g transform="rotate(-4 1280 440)"><rect x="940" y="240" width="680" height="400" rx="12" fill="#FFF8E6" stroke="#E2B04A" stroke-width="6"/>${txt(1280, 320, 'PERMISSION SLIP', 34, '#B38A2E', { ls: 6 })}${txt(1280, 430, 'I’m green, so I can', 40, C.dark, { f: 'Playfair Display', it: true, w: 700 })}${txt(1280, 490, 'get careless', 40, C.dark, { f: 'Playfair Display', it: true, w: 700 })}</g>`);
        o += scaleAt(1280, 440, pop(t, B.permission + 2.5, 0.5) * c, `<g transform="rotate(-14 1280 440)"><rect x="1030" y="390" width="500" height="110" rx="14" fill="none" stroke="#E2556F" stroke-width="10"/>${txt(1280, 470, 'DENIED', 70, '#E2556F', { ls: 8 })}</g>`);
        o += fade(c * seg(t, B.deserves, B.deserves + 0.5), txt(1280, 780, 'the next trade doesn’t deserve more risk', 40, C.dark, { w: 700 }) + txt(1280, 840, 'or lower standards', 40, C.dark, { w: 700 }));
      }
      if (p4 > 0) {
        // chips pushed back on the table
        o += fade(p4, `<ellipse cx="1280" cy="700" rx="560" ry="150" fill="#2E6B4F"/><ellipse cx="1280" cy="690" rx="530" ry="130" fill="#3C8A66"/>`);
        for (let i = 0; i < 8; i++) { const at = B.gave + 1 + i * 0.6, k = ease(seg(t, at, at + 0.6)), x = lerp(780, 1100 + (i % 4) * 90, k), y = lerp(560, 660 + Math.floor(i / 4) * 30, k); o += fade(p4 * seg(t, at, at + 0.1), `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="40" ry="16" fill="#E2B04A" stroke="#fff" stroke-width="4"/>`); }
        o += fade(p4 * seg(t, B.gave + 2, B.gave + 2.6), txt(1280, 260, 'the market didn’t take my green day', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(seg(t, B.table, B.table + 0.5), txt(1280, 360, 'I kept putting it back on the table.', 52, '#E2556F', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // There's no finish line unless you build one. Then: does quality fall the longer you trade?
    'v4-finish': (s, t) => {
      const B = s.b;
      let o = grad('fn', '#E6F5F2', '#FDF8F5') + bg('url(#fn)');
      const p2 = seg(t, B.finish - 0.3, B.finish + 0.3), p3 = seg(t, B.quality - 0.4, B.quality + 0.2);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, txt(960, 170, 'decide before you start', 56, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.done, B.done + 0.4), txt(960, 260, '“I’ll stop when I feel done”… what’s done?', 40, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
        // the runner and the receding finish line
        const fx = 1100 + 200 * ease(seg(t, B.u300 + 1.5, B.u300 + 2.2)) + 200 * ease(seg(t, B.u500, B.u500 + 0.7));
        const lbl = t < B.u300 + 1.5 ? '$300' : t < B.u500 ? '$400' : '$500';
        o += fade(a, `<rect x="0" y="780" width="1920" height="40" fill="#E8D5C4"/><rect x="${f1(fx)}" y="460" width="12" height="320" fill="#2C1810"/><rect x="${f1(fx + 180)}" y="460" width="12" height="320" fill="#2C1810"/><rect x="${f1(fx)}" y="460" width="192" height="60" fill="#fff" stroke="#2C1810" stroke-width="6"/>${txt(fx + 96, 503, lbl, 38, '#2AA594', { f: 'JetBrains Mono, monospace' })}`);
        o += fade(a, you(t, { x: 600 + 120 * seg(t, B.done, B.finish), y: 780, scale: 1.1, walking: true }));
      }
      // build one: the stopping rules
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(960, 170, 'create your finish line', 56, '#2AA594', { f: 'Playfair Display', it: true }));
        ['max number of trades', 'daily loss limit', 'profit-protection rule', 'what tells me I’m mentally done', 'signs I’m starting to force it'].forEach((l, j) => {
          const y = 300 + j * 120, at = B.finish + 0.4 + j * 0.7;
          o += fade(b * seg(t, at, at + 0.4), `<rect x="460" y="${y - 48}" width="1000" height="96" rx="48" fill="#fff"/>${txt(520, y + 13, l, 38, C.dark, { a: 'start', w: 700 })}`) + check(1400, y, b * pop(t, at + 0.3, 0.4), '#2AA594', 26);
        });
      }
      // trade quality through the session
      if (p3 > 0) {
        o += fade(p3, txt(960, 170, 'your journal, in order', 52, C.dark, { f: 'Playfair Display', it: true }));
        const q = [0.92, 0.85, 0.7, 0.48, 0.3];
        q.forEach((v, i) => {
          const at = B.tr + i * 0.9, k = ease(seg(t, at, at + 0.6)), x = 520 + i * 220;
          o += fade(p3 * seg(t, at, at + 0.2), `<rect x="${x - 70}" y="${f1(820 - 480 * v * k)}" width="140" height="${f1(480 * v * k)}" rx="16" fill="${v > 0.6 ? '#2AA594' : v > 0.4 ? '#F9D89A' : '#E2556F'}"/>${txt(x, 880, 'trade ' + (i + 1), 30, C.muted, { w: 700 })}`);
        });
        o += fade(p3 * seg(t, B.worse, B.worse + 0.5), txt(960, 990, 'better or worse the longer you trade?', 48, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Decide what ends the session first. Market open ≠ I need to trade. Close the app.
    'v4-rule': (s, t) => {
      const B = s.b;
      let o = grad('r4', '#EEEBFB', '#DDF1EE') + bg('url(#r4)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'I decide my stopping conditions before the session starts.', 56, C.dark, { f: 'Playfair Display' }));
      const p2 = seg(t, B.line - 0.3, B.line + 0.3), p3 = seg(t, B.close - 0.3, B.close + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        ['emotional', 'frustrated', 'overconfident', 'chasing a number'].forEach((l, j) => { o += fade(a * seg(t, B.r1 + j * 0.9, B.r1 + j * 0.9 + 0.4), pill(j % 2 ? 1260 : 660, 400 + Math.floor(j / 2) * 80, 'not while ' + l, '#B8B3C9', 1, 30)); });
        o += fade(a * seg(t, B.r2, B.r2 + 0.5), `<rect x="460" y="560" width="1000" height="260" rx="40" fill="#fff"/>${txt(960, 660, 'what ends my session', 46, '#2AA594')}${txt(960, 740, 'is known before trade #1', 40, C.dark, { w: 700 })}`);
      }
      const b = p2 * (1 - p3);
      if (b > 0) {
        const sw = Math.sin(t * 2) * 4;
        o += fade(b, `<line x1="560" y1="360" x2="760" y2="440" stroke="#8B6A55" stroke-width="6"/><line x1="960" y1="360" x2="760" y2="440" stroke="#8B6A55" stroke-width="6"/><g transform="rotate(${f1(sw)} 760 440)"><rect x="520" y="440" width="480" height="200" rx="20" fill="#E2556F"/>${txt(760, 520, 'MARKET', 46, '#fff', { ls: 6 })}${txt(760, 590, 'OPEN', 60, '#fff', { ls: 8 })}</g>${txt(1180, 560, '≠', 100, C.dark)}<rect x="1340" y="440" width="420" height="200" rx="20" fill="#fff" stroke="#B8B3C9" stroke-width="6"/>${txt(1550, 530, 'I need to', 40, C.dark, { w: 700 })}${txt(1550, 590, 'be trading', 40, C.dark, { w: 700 })}`);
      }
      if (p3 > 0) {
        // the app window closes
        const cl = ease(seg(t, B.close + 1.5, B.close + 2.2));
        o += fade(p3 * (1 - cl), scaleAt(960, 600, 1 - cl * 0.9, `<rect x="460" y="380" width="1000" height="460" rx="20" fill="#120D1C"/><rect x="460" y="380" width="1000" height="60" rx="20" fill="#2A2142"/><rect x="460" y="420" width="1000" height="20" fill="#2A2142"/><circle cx="1420" cy="410" r="16" fill="#E2556F"/>${candles(490, 470, 940, 330, vals(17, 22, 0, 0.05, 0.5), 22)}`));
        o += fade(p3 * seg(t, B.close + 0.8, B.close + 1.2) * (1 - cl), `<circle cx="1420" cy="410" r="${f1(30 + 6 * Math.sin(t * 10))}" fill="none" stroke="#fff" stroke-width="4"/>`);
        o += fade(cl, txt(960, 600, 'Sometimes discipline is literally', 58, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 700, 'closing TradingView.', 58, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Reflection: five sessions, in order. What were you looking for? Close the chart.
    'v4-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const p2 = seg(t, B.big - 0.3, B.big + 0.3), end = seg(t, B.squeeze - 0.4, B.squeeze + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, txt(960, 150, 'your last five sessions, in order', 52, '#fff', { f: 'Playfair Display', it: true }));
        const Q = [[0.9, 0.85, 0.6, 0.4], [0.9, 0.8], [0.85, 0.9, 0.7, 0.5, 0.35, 0.25], [0.9, 0.88, 0.8], [0.8, 0.75, 0.5, 0.3, 0.2]];
        Q.forEach((row, r) => {
          const y = 270 + r * 100;
          o += fade(a * seg(t, B.five + r * 0.4, B.five + r * 0.4 + 0.3), txt(300, y + 12, 'day ' + (r + 1), 32, '#CFC8FA', { a: 'start', w: 700 }));
          row.forEach((v, i) => { o += fade(a * seg(t, B.order + i * 0.25, B.order + i * 0.25 + 0.3), `<circle cx="${480 + i * 110}" cy="${y}" r="34" fill="${v > 0.6 ? '#2AA594' : v > 0.4 ? '#F9D89A' : '#E2556F'}"/>${txt(480 + i * 110, y + 11, String(i + 1), 28, '#1A1424')}`); });
        });
        [[B.q1, 'cleanest?'], [B.q2, 'followed the plan?'], [B.q3, 'as the session went on?'], [B.q4, 'standards dropping?']].forEach(([at, l], j) => { o += fade(a * seg(t, at, at + 0.4), txt(1300, 300 + j * 120, l, 42, '#F9D89A', { a: 'start', f: 'Playfair Display', it: true, w: 700 })); });
      }
      const b = p2 * (1 - end);
      if (b > 0) {
        o += fade(b, txt(960, 220, 'on the days you kept trading,', 50, '#fff', { f: 'Playfair Display', it: true }) + txt(960, 300, 'what were you actually looking for?', 56, '#F9D89A', { f: 'Playfair Display', it: true }));
        [[B.w1, 'my setup', '#2AA594'], [B.w2, 'a loss back', '#E2556F'], [B.w3, 'a good day → great day', '#E2B04A'], [B.w4, 'hard time being done', '#7F77DD']].forEach(([at, l, col], j) => {
          const x = 560 + (j % 2) * 800, y = 500 + Math.floor(j / 2) * 220;
          o += fade(b * seg(t, at, at + 0.4), `<rect x="${x - 340}" y="${y - 80}" width="680" height="160" rx="30" fill="#2A2142" stroke="${col}" stroke-width="6"/>${txt(x, y + 14, l, 42, '#fff')}`);
        });
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const fin = seg(t, B.last - 0.3, B.last + 0.3);
        o += fade(end * (1 - fin), txt(960, 360, 'squeeze every possible dollar', 60, C.muted, { f: 'Playfair Display', it: true }) + `<line x1="560" x2="${f1(560 + 800 * seg(t, B.squeeze + 1.5, B.squeeze + 2.2))}" y1="342" y2="342" stroke="#E2556F" stroke-width="7"/>`);
        o += fade(end * (1 - fin) * seg(t, B.job, B.job + 0.5), txt(960, 540, 'execute your plan', 72, '#2AA594', { f: 'Playfair Display', it: true }) + txt(960, 630, 'while you can execute it well', 44, C.dark, { w: 700 }));
        if (fin > 0) {
          const cl = ease(seg(t, B.last + 2.5, B.last + 3.3));
          o += fade(fin * (1 - cl), scaleAt(960, 440, 1 - cl * 0.9, `<rect x="560" y="260" width="800" height="360" rx="20" fill="#120D1C"/>${candles(590, 300, 740, 280, vals(41, 18, 0, 0.05, 0.5), 18)}`));
          o += fade(fin, txt(960, 800, 'the best trade might be', 52, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 890, 'closing the chart.', 60, '#2AA594', { f: 'Playfair Display', it: true }));
        }
      }
      return o;
    },

    /* ════ Psychology 12 · Blowing an Account ══════════════════════════ */

    // The balance hits zero. "What the hell did I just do?" The replay loop. Now what?
    'v12-blown': (s, t) => {
      const B = s.b;
      let o = grad('bw', '#1A1018', '#2B1A26') + bg('url(#bw)');
      const endk = seg(t, B.after - 0.4, B.after + 0.3);
      // the account panel draining
      const bal = Math.round(50000 - 2500 * ease(seg(t, s.start, B.blew + 0.6)) * 1);
      const dd = 1 - ease(seg(t, s.start, B.blew + 0.6));
      o += fade(1 - endk, `<rect x="180" y="200" width="760" height="420" rx="30" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>${txt(240, 280, 'EVAL ACCOUNT', 30, '#CFC8FA', { a: 'start', ls: 6 })}${txt(240, 400, '$' + bal.toLocaleString('en-US'), 80, dd > 0.05 ? '#fff' : '#E2556F', { a: 'start', f: 'JetBrains Mono, monospace' })}${txt(240, 470, 'drawdown left', 28, '#CFC8FA', { a: 'start', w: 700 })}<rect x="240" y="500" width="640" height="34" rx="17" fill="#2A2142"/><rect x="240" y="500" width="${f1(Math.max(0, 640 * dd))}" height="34" rx="17" fill="#E2556F"/>`);
      o += fade(1 - endk, scaleAt(560, 430, pop(t, B.blew + 0.5, 0.6), `<rect x="190" y="210" width="740" height="400" rx="24" fill="#120D1C" opacity=".8"/><g transform="rotate(-10 560 430)"><rect x="320" y="360" width="480" height="140" rx="16" fill="#1A1018" stroke="#E2556F" stroke-width="10"/>${txt(560, 455, 'FAILED', 80, '#E2556F', { ls: 10 })}</g>`));
      o += fade(1 - endk, you(t, { x: 1500, y: 1020, scale: 1.25, flip: true, mood: 'sad', frontArm: t > B.hell && t < B.worst ? { a1: -60, a2: -150 } : undefined }));
      o += thought(1440, 300, 'What the hell did I just do?', between(t, B.hell, B.worst - 0.1) * (1 - endk), { size: 40 });
      o += fade((1 - endk) * seg(t, B.knew, B.knew + 0.4) * (1 - seg(t, B.m1 - 0.2, B.m1)), txt(1440, 300, 'you probably knew better.', 46, '#F9D89A', { f: 'Playfair Display', it: true }));
      // the replay: chips cycle
      const chips = [[B.m1, 'green earlier'], [B.m2, 'hit my limit, kept going'], [B.m3, 'size up'], [B.m4, 'revenge trade'], [B.m5, '1 bad decision → 5']];
      chips.forEach(([at, l], j) => { o += pill(560, 700 + j * 70, l, '#3A2F55', (1 - endk) * pop(t, at, 0.4) * (1 - seg(t, B.replay + 4, B.replay + 4.5)), 28, '#FF8DA3'); });
      // replaying: a looping rewind icon around her head
      if (t > B.replay) { const k = seg(t, B.replay, B.replay + 0.5) * (1 - endk); o += fade(k, `<g transform="rotate(${f1(-(t - B.replay) * 200)} 1500 640)"><path d="M1500,460 A180,180 0 1 1 1320,640" fill="none" stroke="#F9D89A" stroke-width="8" stroke-dasharray="20 14"/><path d="M1310,610 l10,40 l30,-25 z" fill="#F9D89A"/></g>`); }
      o += fade((1 - endk) * seg(t, B.now, B.now + 0.4), txt(560, 1000, 'so… now what?', 60, '#fff', { f: 'Playfair Display', it: true }));
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, `<rect x="260" y="360" width="560" height="260" rx="40" fill="#fff"/>${txt(540, 470, 'how you got there', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 })}${txt(960, 510, '=', 90, C.dark)}<rect x="1100" y="360" width="560" height="260" rx="40" fill="#2C1810"/>${txt(1380, 470, 'what you do', 50, '#F9D89A', { f: 'Playfair Display', it: true })}${txt(1380, 540, 'AFTER', 54, '#fff', { ls: 8 })}`);
        o += fade(seg(t, B.after + 2.5, B.after + 3.1), txt(960, 760, 'matters just as much', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Not THE trade. A chain. Find the first link.
    'v12-chain': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const links = ['took a loss', 'traded again right away', 'sized up', 'moved my stop', 'hit my daily limit', 'ignored the limit', '“I need it back”', 'BLOWN'];
      const reveal = seg(t, B.chain, B.chain + 5.5), cam = ease(seg(t, B.chain, B.chain + 1.5));
      // spotlight on "THE trade"
      const sp = seg(t, B.find, B.find + 0.5) * (1 - cam);
      if (sp > 0) {
        o += fade(sp, `<rect width="1920" height="1080" fill="#1A1424" opacity=".85"/><ellipse cx="960" cy="560" rx="360" ry="220" fill="#FDF8F5" opacity=".95"/><rect x="760" y="480" width="400" height="160" rx="30" fill="#E2556F"/>${txt(960, 580, 'THE trade', 54, '#fff')}`);
        o += fade(sp * seg(t, B.this, B.this + 0.4), txt(960, 260, '“this is the trade that blew my account”', 44, '#fff', { f: 'Playfair Display', it: true, w: 700 }));
      }
      o += fade((1 - sp) * seg(t, s.start, s.start + 0.5) * (1 - cam), txt(960, 540, 'not one decision', 80, C.dark, { f: 'Playfair Display', it: true }));
      // the chain
      if (cam > 0) {
        o += fade(cam, txt(960, 170, 'a chain of decisions', 56, C.dark, { f: 'Playfair Display', it: true }));
        links.forEach((l, i) => {
          const x = 270 + (i % 4) * 460, y = i < 4 ? 400 : 720, k = seg(reveal, i / links.length, (i + 0.7) / links.length);
          const last = i === links.length - 1, firstGlow = i === 0 ? seg(t, B.first, B.first + 0.6) : 0;
          if (i > 0) { const px = 270 + ((i - 1) % 4) * 460, py = (i - 1) < 4 ? 400 : 720; o += fade(cam * k, i === 4 ? `<path d="M${px},${py + 55} C${px},${py + 200} 270,${y - 200} 270,${y - 55}" fill="none" stroke="#B8B3C9" stroke-width="10" stroke-dasharray="4 18" stroke-linecap="round"/>` : `<line x1="${px + 190}" x2="${x - 190}" y1="${y}" y2="${y}" stroke="#B8B3C9" stroke-width="10" stroke-dasharray="4 18" stroke-linecap="round"/>`); }
          o += fade(cam * k, `<rect x="${x - 190}" y="${y - 55}" width="380" height="110" rx="55" fill="${last ? '#E2556F' : '#fff'}" stroke="${firstGlow > 0 ? '#F9D89A' : last ? '#E2556F' : '#2C1810'}" stroke-width="${firstGlow > 0 ? 10 : 6}"/>${txt(x, y + 12, l, last ? 40 : 30, last ? '#fff' : C.dark, { w: 800 })}`);
        });
        o += fade(cam * seg(t, B.final, B.final + 0.5), pill(1650, 610, 'the outcome', '#E2556F', 1, 26));
        o += fade(cam * seg(t, B.before, B.before + 0.5), pill(300, 290, 'the breakdown started here', '#2C1810', 1, 26));
        o += fade(seg(t, B.first, B.first + 0.6), txt(960, 960, 'where did you first know you were off your plan?', 46, '#B38A2E', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Profitable first. The shift. "Discipline" isn't a plan. Find where it changed.
    'v12-shift': (s, t) => {
      const B = s.b;
      let o = grad('sh', '#F3E3D6', '#FBF4EF') + bg('url(#sh)');
      const p2 = seg(t, B.easy - 0.4, B.easy + 0.2), p3 = seg(t, B.same - 0.4, B.same + 0.2);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.easy && t < B.where ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const a = 1 - p3;
      const pts = [0.3, 0.42, 0.5, 0.58, 0.66, 0.7, 0.64, 0.55, 0.6, 0.42, 0.3, 0.12, 0];
      const pX = i => 820 + i * 75, pY = v => 700 - v * 480;
      if (a > 0 && p2 < 1) {
        const n = t < B.shift ? Math.max(2, Math.floor(seg(t, B.prof, B.done + 2) * 6)) : 6 + Math.floor(seg(t, B.shift, B.gone + 1) * 7);
        const P = pts.slice(0, n).map((v, i) => `${f1(pX(i))},${f1(pY(v))}`).join(' ');
        o += fade(a * (1 - p2), `<rect x="760" y="160" width="1040" height="620" rx="28" fill="#fff"/><line x1="800" x2="1760" y1="${pY(0)}" y2="${pY(0)}" stroke="#E6DDD3" stroke-width="4"/><polyline points="${P}" fill="none" stroke="${n > 6 ? '#E2556F' : '#2AA594'}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`);
        o += fade(a * (1 - p2), pill(pX(5), pY(0.7) - 60, 'could’ve been done', '#2AA594', pop(t, B.done + 1, 0.4), 26));
        [[B.s1, 6, 'another trade'], [B.s2, 7, 'then another'], [B.s3, 9, 'risk changed'], [B.s4, 10, 'trying to recover']].forEach(([at, i, l]) => { o += fade(a * (1 - p2) * seg(t, at, at + 0.4), `<circle cx="${pX(i)}" cy="${f1(pY(pts[i]))}" r="12" fill="#E2556F"/>${txt(pX(i), pY(pts[i]) + 50, l, 24, '#E2556F', { w: 800 })}`); });
        o += fade(a * (1 - p2) * seg(t, B.gone + 2, B.gone + 2.5), pill(pX(12) - 30, pY(0) - 50, 'BLOWN', '#E2556F', 1, 30));
      }
      if (p2 > 0 && a > 0) {
        o += fade(a * p2, sticky(1280, 320, '“I need more discipline”', 1, -4, '#FFF1A8'));
        o += fade(a * p2 * seg(t, B.teach, B.teach + 0.4), pill(1280, 460, 'not a plan', '#E2556F', 1, 34));
        if (t > B.where) {
          o += fade(a * seg(t, B.where, B.where + 0.4), txt(1280, 580, 'where exactly did it change?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
          ['trade 3?', 'first full stop?', 'gave back profit?', 'sized up?'].forEach((l, j) => { o += pill(940 + (j % 2) * 680, 700 + Math.floor(j / 2) * 100, l, '#7F77DD', a * pop(t, B.where + 1 + j * 0.5, 0.4), 32); });
        }
      }
      if (p3 > 0) {
        // new account, same trader
        const walk = ease(seg(t, B.same + 2, B.same + 4.5));
        o += fade(p3, `<rect x="1180" y="260" width="460" height="560" rx="30" fill="#fff" stroke="#7F77DD" stroke-width="8"/>${txt(1410, 340, 'NEW ACCOUNT', 36, '#7F77DD', { ls: 4 })}${txt(1410, 410, '$50,000', 48, C.dark, { f: 'JetBrains Mono, monospace' })}`);
        o += fade(p3, you(t, { x: lerp(860, 1410, walk), y: 780, scale: 0.9, walking: walk > 0 && walk < 1, mood: 'sad' }));
        o += fade(p3 * seg(t, B.same + 4, B.same + 4.6), txt(1280, 920, 'the exact same trader', 50, '#E2556F', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Don't buy another one tonight. Do the autopsy. Corrections that match the behavior.
    'v12-autopsy': (s, t) => {
      const B = s.b;
      let o = grad('ap', '#E6F5F2', '#FDF8F5') + bg('url(#ap)');
      const p2 = seg(t, B.autopsy - 0.3, B.autopsy + 0.3), p3 = seg(t, B.indicator - 0.3, B.indicator + 0.3), p4 = seg(t, B.p1 - 0.4, B.p1 + 0.2);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, `<rect x="660" y="220" width="600" height="300" rx="36" fill="#7F77DD"/>${txt(960, 360, 'BUY NEW', 56, '#fff', { ls: 6 })}${txt(960, 430, 'ACCOUNT', 56, '#fff', { ls: 6 })}`) + cross(1240, 230, a * pop(t, B.dont + 3, 0.5), '#E2556F', 50);
        [[B.f1, 'embarrassed'], [B.f2, 'frustrated'], [B.f3, 'want another chance'], [B.f4, 'need to prove it wasn’t me']].forEach(([at, l], j) => { o += thought([420, 1500, 440, 1480][j], [640, 640, 800, 800][j], l, a * pop(t, at, 0.5), { size: 36 }); });
        const bk = seg(t, B.button, B.button + 0.5);
        o += fade(a * bk, `<rect width="1920" height="1080" fill="#FDF8F5" opacity=".9"/><rect x="560" y="400" width="360" height="160" rx="30" fill="#2AA594" opacity=".35"/>${txt(740, 500, 'BUY', 60, '#fff')}<rect x="1000" y="400" width="360" height="160" rx="30" fill="#E2556F" opacity=".35"/>${txt(1180, 500, 'SELL', 60, '#fff')}${txt(960, 700, 'not right now', 56, C.dark, { f: 'Playfair Display', it: true })}`);
      }
      // the autopsy worksheet
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, `<rect x="460" y="120" width="1000" height="900" rx="24" fill="#fff"/><rect x="860" y="96" width="200" height="60" rx="14" fill="#B8B3C9"/>${txt(960, 230, 'ACCOUNT AUTOPSY', 46, C.dark, { ls: 6 })}`);
        ['P&L before it went wrong', 'the FIRST rule I broke', 'what happened right before', 'the emotion I felt', 'did my size change?', 'did setup quality change?', 'did I break my daily stop?', 'where should the session have ended?', 'what rule would’ve stopped the rest?'].forEach((l, j) => {
          const y = 320 + j * 76, at = B.autopsy + 0.4 + j * 0.55;
          o += fade(b * seg(t, at, at + 0.3), `<rect x="520" y="${y - 24}" width="40" height="40" rx="8" fill="none" stroke="#7F77DD" stroke-width="4"/>${txt(590, y + 8, l, 32, j === 1 || j === 8 ? '#E2556F' : C.dark, { a: 'start', w: 700 })}`);
        });
      }
      // not an indicator
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, `<rect x="560" y="300" width="800" height="300" rx="36" fill="#fff"/>${txt(960, 420, '“what indicator', 54, C.muted, { f: 'Playfair Display', it: true })}${txt(960, 500, 'would’ve saved me?”', 54, C.muted, { f: 'Playfair Display', it: true })}`) + cross(1340, 310, c * pop(t, B.indicator + 2, 0.5), '#E2556F', 44);
        o += fade(c * seg(t, B.fixing, B.fixing + 0.5), txt(960, 720, 'ignored the daily limit? no indicator fixes that.', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      if (p4 > 0) {
        o += fade(p4, txt(960, 180, 'the correction matches the behavior', 52, '#2AA594', { f: 'Playfair Display', it: true }));
        [[B.p1, 'kept trading after trade 3', 'hard 3-trade max'], [B.p2, 'sized up after losing', 'size locked all session'], [B.p3, 'ignored my daily limit', 'platform lockout']].forEach(([at, a2, b2], j) => {
          const y = 360 + j * 200, k = seg(t, at, at + 0.5);
          o += fade(p4 * k, `<rect x="200" y="${y - 70}" width="640" height="140" rx="30" fill="#FDE8ED"/>${txt(520, y + 12, a2, 36, '#E2556F')}${txt(960, y + 18, '→', 60, C.dark)}<rect x="1080" y="${y - 70}" width="640" height="140" rx="30" fill="#E6F5F2"/>${txt(1400, y + 12, b2, 36, '#2AA594')}`);
        });
      }
      return o;
    },

    // I don't restart until I understand what broke. New account ≠ new trader.
    'v12-rule': (s, t) => {
      const B = s.b;
      let o = grad('r12', '#EEEBFB', '#DDF1EE') + bg('url(#r12)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'I don’t restart until I understand what broke.', 64, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      [[B.r1, 'buying another account to repeat the cycle'], [B.r2, 'blaming a strategy I didn’t follow'], [B.r3, '“I’ll just do better next time”']].forEach(([at, l], j) => {
        const y = 420 + j * 110;
        o += fade(a * seg(t, at, at + 0.4), `<rect x="360" y="${y - 45}" width="1200" height="90" rx="45" fill="#fff"/>${txt(960, y + 12, l, 36, C.muted, { w: 800 })}`) + cross(1530, y, a * pop(t, at + 0.8, 0.4), '#E2556F', 26);
      });
      o += fade(a * seg(t, B.r4, B.r4 + 0.5), `<rect x="460" y="770" width="1000" height="130" rx="65" fill="#2AA594"/>${txt(960, 850, 'identify it · something measurable', 42, '#fff')}`);
      if (fin > 0) {
        // ten evaluations, same trader inside each
        for (let i = 0; i < 5; i++) { const x = 300 + i * 330, k = pop(t, B.line + 0.3 + i * 0.3, 0.4); o += fade(fin, scaleAt(x, 600, k, `<rect x="${x - 130}" y="420" width="260" height="360" rx="24" fill="#fff" stroke="#B8B3C9" stroke-width="6"/>${txt(x, 470, 'EVAL #' + (i + 1), 26, '#7F77DD', { ls: 3 })}`)); o += fade(fin * k, you(t, { x, y: 740, scale: 0.55, mood: 'sad' })); }
        o += fade(fin, txt(960, 370, 'A new account does not create a new trader.', 58, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.same, B.same + 0.5), txt(960, 900, 'same behavior → some version of the same result', 44, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Reflection: rewind the day. The first broken rule. Tuition paid; get the lesson.
    'v12-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const p2 = seg(t, B.big - 0.3, B.big + 0.3), end = seg(t, B.identity - 0.4, B.identity + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        const day = ['open', 'base hit', 'base hit', 'skipped my wait', 'full stop', 'sized up', 'limit hit', 'kept going', 'blown'];
        const rw = ease(seg(t, B.rewind, B.firstq + 1));
        o += fade(a, txt(960, 170, 'go back to that day', 52, '#fff', { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.rewind, B.rewind + 0.4), `<g transform="translate(960,260)">${txt(0, 20, '◀◀ backwards', 40, '#F9D89A', { ls: 3 })}</g>`);
        day.forEach((l, i) => {
          const x = 140 + i * 205, lit = i === 3 ? seg(t, B.theone, B.theone + 0.5) : 0, cur = 8 - Math.floor(rw * 5.99);
          const big = i === 6 ? seg(t, B.biggest, B.biggest + 0.4) : 0;
          o += fade(a * seg(t, B.back, B.back + 0.5), `<rect x="${x - 95}" y="440" width="190" height="140" rx="20" fill="${i >= 7 ? '#3A1420' : '#2A2142'}" stroke="${lit > 0 ? '#F9D89A' : i === cur ? '#fff' : '#3A2F55'}" stroke-width="${lit > 0 ? 10 : 4}"/>${txt(x, 520, l, 20, '#fff', { w: 800 })}`);
          if (big > 0) o += fade(a * big * (1 - lit), pill(x, 640, 'the biggest', '#B8B3C9', 1, 24));
          if (lit > 0) o += pill(x, 640, 'THE FIRST ONE', '#F9D89A', a * pop(t, B.theone, 0.5), 28, '#1A1424');
        });
        o += fade(a * seg(t, B.firstq, B.firstq + 0.4), txt(960, 360, 'what was the first rule you broke?', 48, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
        const bf = seg(t, B.before, B.before + 0.4);
        o += fade(a * bf, txt(960, 780, 'what happened right before?', 46, '#fff', { f: 'Playfair Display', it: true, w: 700 }));
        ['a loss', 'a win', 'gave back profit', 'missed an entry', 'close to payout', 'a daily goal'].forEach((l, j) => { o += pill(310 + j * 260, 880, l, '#3A2F55', a * pop(t, B.before + 0.6 + j * 0.3, 0.4), 26, '#FF8DA3'); });
      }
      const b = p2 * (1 - end);
      if (b > 0) {
        o += fade(b, txt(960, 400, 'What single rule, if I had followed it,', 60, '#fff', { f: 'Playfair Display', it: true }) + txt(960, 500, 'would’ve stopped the rest of that day?', 60, '#F9D89A', { f: 'Playfair Display', it: true }));
        o += fade(b * seg(t, B.big + 4, B.big + 4.6), `<rect x="560" y="620" width="800" height="100" rx="16" fill="none" stroke="#CFC8FA" stroke-width="4" stroke-dasharray="14 10"/>${txt(960, 685, 'write it down', 36, '#CFC8FA', { w: 700 })}`);
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const fin = seg(t, B.l1 - 0.3, B.l1 + 0.3), tu = seg(t, B.tuition - 0.3, B.tuition + 0.3);
        const m = end * (1 - tu);
        o += fade(m, `${txt(560, 300, 'identity', 64, C.muted, { f: 'Playfair Display', it: true })}<line x1="420" x2="${f1(420 + 280 * seg(t, B.identity + 2, B.identity + 2.5))}" y1="280" y2="280" stroke="#E2556F" stroke-width="7"/>${txt(1360, 300, 'information', 64, '#2AA594', { f: 'Playfair Display', it: true, op: f1(seg(t, B.info, B.info + 0.5)) })}`);
        o += fade(m * seg(t, B.never, B.never + 0.4), txt(960, 450, '“I’m never doing that again” isn’t enough', 40, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
        [[B.e1, 'FIND THE FIRST BROKEN RULE', '#E2556F'], [B.e2, 'FIND THE TRIGGER', '#7F77DD'], [B.e3, 'BUILD THE CORRECTION', '#2AA594']].forEach(([at, l, col], j) => { o += fade(m, scaleAt(960, 580 + j * 120, pop(t, at, 0.5), `<rect x="560" y="${530 + j * 120}" width="800" height="96" rx="48" fill="${col}"/>${txt(960, 592 + j * 120, l, 36, '#fff', { ls: 3 })}`)); });
        if (tu > 0) {
          o += fade(tu * (1 - fin), `<g transform="rotate(-3 960 520)"><rect x="660" y="260" width="600" height="520" rx="10" fill="#fff" stroke="#E6DDD3" stroke-width="4"/>${txt(960, 340, 'TUITION', 40, C.muted, { ls: 8 })}${txt(960, 400, 'paid to the market', 30, C.muted, { w: 700 })}<line x1="720" x2="1200" y1="450" y2="450" stroke="#E6DDD3" stroke-width="4" stroke-dasharray="10 8"/>${txt(960, 560, 'the lesson:', 40, C.dark, { f: 'Playfair Display', it: true })}</g>`);
          o += scaleAt(960, 660, pop(t, B.tuition + 3, 0.5) * (1 - fin), `<rect x="760" y="610" width="400" height="100" rx="16" fill="none" stroke="#2AA594" stroke-width="8" transform="rotate(-6 960 660)"/>${txt(960, 680, 'COLLECTED', 50, '#2AA594', { ls: 6 })}`);
        }
        o += fade(fin, txt(960, 440, 'A new account doesn’t create a new trader.', 62, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.l2, B.l2 + 0.5), txt(960, 580, 'New behavior does.', 80, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    /* ════ Psychology 13 · Building Confidence Through Data ════════════ */

    // The setup is right there. "I don't know…" Hesitate, skip, Discord, another timeframe.
    'v13-hesitate': (s, t) => {
      const B = s.b;
      let o = grad('ht', '#1C1528', '#2E2142') + bg('url(#ht)');
      const endk = seg(t, B.build - 0.4, B.build + 0.3);
      // the chart with a clean setup
      const tfs = ['1m', '5m', '15m', '1h'], tf = t > B.h5 ? Math.floor((t - B.h5) * 1.8) % 4 : 0;
      o += fade(1 - endk, `<rect x="160" y="200" width="1060" height="560" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>${candles(190, 240, 1000, 480, vals(13 + tf * 7, 22, 0.012, 0.035, 0.35), 22)}${tfs.map((x, j) => `<rect x="${190 + j * 90}" y="214" width="76" height="40" rx="10" fill="${j === tf ? '#7F77DD' : '#2A2142'}"/>${txt(228 + j * 90, 242, x, 22, '#fff')}`).join('')}`);
      ['confirmation', 'entry', 'risk'].forEach((l, j) => { o += pill(360 + j * 280, 820, l + ' ✓', '#2AA594', (1 - endk) * pop(t, B.checks + j * 1.1, 0.4), 28); });
      // extra confirmations stack up
      if (t > B.h3) for (let i = 0; i < 4; i++) { const k = pop(t, B.h3 + 0.5 + i * 0.4, 0.4) * (1 - endk); o += fade(k, `<path d="M190,${f1(650 - i * 40)} ${[...Array(20)].map((_, x) => `L${190 + x * 52},${f1(650 - i * 40 + 18 * Math.sin(x * 0.9 + i * 2))}`).join(' ')}" fill="none" stroke="${['#F9D89A', '#7ECFC0', '#FF8DA3', '#CFC8FA'][i]}" stroke-width="4" opacity=".8"/>`); }
      o += fade(1 - endk, you(t, { x: 1560, y: 1020, scale: 1.2, flip: true, frontArm: t > B.h1 && t < B.h2 ? { a1: -175, a2: -170 } : undefined }));
      o += thought(1500, 330, 'I don’t know…', between(t, B.idk, B.whatif - 0.1) * (1 - endk), { size: 44 });
      o += thought(1500, 330, 'what if this doesn’t work?', between(t, B.whatif, B.h1 - 0.1) * (1 - endk), { size: 40 });
      o += pill(1560, 180, 'hesitate…', '#3A2F55', between(t, B.h1, B.h2 - 0.1) * (1 - endk), 30, '#F9D89A');
      o += pill(1560, 180, 'skip it', '#3A2F55', between(t, B.h2, B.h3 - 0.1) * (1 - endk), 30, '#F9D89A');
      // Discord window
      if (t > B.h4) o += fade((1 - endk) * between(t, B.h4, B.h5 + 1), `<rect x="1300" y="150" width="520" height="300" rx="20" fill="#36393F"/><rect x="1300" y="150" width="520" height="56" rx="20" fill="#5865F2"/>${txt(1340, 188, '# trading-chat', 26, '#fff', { a: 'start' })}${txt(1340, 260, 'you: what do y’all think??', 26, '#fff', { a: 'start', w: 700 })}${txt(1340, 320, 'someone: idk 🤷', 26, '#B9BBBE', { a: 'start', w: 700 })}${txt(1340, 380, 'someone: bearish', 26, '#B9BBBE', { a: 'start', w: 700 })}`);
      o += fade((1 - endk) * seg(t, B.trust, B.trust + 0.4), `<rect width="1920" height="1080" fill="#1C1528" opacity=".7"/>${txt(960, 480, 'do you actually trust your setup?', 66, '#fff', { f: 'Playfair Display', it: true })}`);
      o += fade((1 - endk) * seg(t, B.reason, B.reason + 0.4), txt(960, 590, 'what have you done to give yourself a reason to?', 44, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      if (endk > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(endk)}"/>`;
        o += fade(endk, txt(960, 300, 'not talked into', 50, C.muted, { f: 'Playfair Display', it: true }));
        for (let i = 0; i < 15; i++) { const row = Math.floor(i / 5), col = i % 5, x = 680 + col * 120 + (row % 2) * 60 - (row === 2 ? 0 : 0), y = 760 - row * 70, k = ease(seg(t, B.build + 2 + i * 0.18, B.build + 2.4 + i * 0.18)); if (row === 1 && col === 4) continue; o += fade(endk * k, `<rect x="${f1(x)}" y="${f1(y - (1 - k) * 200)}" width="110" height="60" rx="8" fill="${['#2AA594', '#7F77DD', '#F9D89A'][row]}"/>`); }
        o += fade(seg(t, B.build + 3, B.build + 3.6), txt(960, 450, 'built.', 90, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    'v13-sample': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const p2 = seg(t, B.c1 - 0.3, B.c1 + 0.3), p3 = seg(t, B.five - 0.4, B.five + 0.2), p4 = seg(t, B.weight - 0.4, B.weight + 0.2);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, txt(960, 200, 'confidence = never nervous?', 54, C.dark, { f: 'Playfair Display', it: true }));
        o += fade(a * seg(t, B.know, B.know + 0.5), `<circle cx="960" cy="520" r="170" fill="#CFC8FA" opacity=".6"/><circle cx="910" cy="470" r="40" fill="#fff" opacity=".6"/><rect x="840" y="680" width="240" height="60" rx="20" fill="#8B6A55"/>${txt(960, 540, 'WIN', 70, '#7F77DD', { op: f1(0.5 + 0.5 * Math.sin(t * 4)) })}${txt(960, 820, '“I just KNOW this one wins”', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1120, 380, a * pop(t, B.not, 0.5), '#E2556F', 50);
        o += fade(a * seg(t, B.next, B.next + 0.5), pill(960, 930, 'the next trade is always unknown', '#2C1810', 1, 32));
      }
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(960, 170, 'real confidence sounds like…', 52, '#2AA594', { f: 'Playfair Display', it: true }));
        [[B.c1, 'seen it before'], [B.c2, 'tested it'], [B.c3, 'documented it'], [B.c4, 'know a valid one'], [B.c5, 'know an invalid one'], [B.c6, 'know it loses sometimes'], [B.c7, 'know the larger sample']].forEach(([at, l], j) => {
          const x = j < 4 ? 560 : 1360, y = 300 + (j % 4) * 140;
          o += fade(b * seg(t, at, at + 0.4), `<rect x="${x - 340}" y="${y - 50}" width="680" height="100" rx="50" fill="#fff"/>${txt(x - 280, y + 13, 'I ' + l, 38, C.dark, { a: 'start', w: 700 })}`) + check(x + 280, y, b * pop(t, at + 0.3, 0.4), '#2AA594', 26);
        });
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, txt(960, 170, 'five trades', 54, C.dark, { f: 'Playfair Display', it: true }));
        const swing = t < B.win ? 0 : t < B.loss ? 1 : -1;
        const res = [1, -1, 1, 1, -1];
        res.forEach((r, i) => { o += fade(c * seg(t, B.five + 0.5 + i * 0.4, B.five + 0.8 + i * 0.4), `<circle cx="${560 + i * 200}" cy="360" r="60" fill="${r > 0 ? '#2AA594' : '#E2556F'}"/>${txt(560 + i * 200, 378, r > 0 ? 'W' : 'L', 50, '#fff')}`); });
        if (swing !== 0) {
          o += fade(c, you(t, { x: 960, y: 1000, scale: 1.05, mood: swing < 0 ? 'sad' : undefined, frontArm: swing > 0 ? { a1: -160, a2: -170 } : undefined }));
          o += thought(1300, 560, swing > 0 ? '“this strategy is AMAZING”' : '“this sh*t doesn’t work”', 1, { size: 40, col: swing > 0 ? '#2AA594' : '#E2556F' });
        }
      }
      if (p4 > 0) {
        o += fade(p4, txt(960, 170, 'a sample', 54, '#2AA594', { f: 'Playfair Display', it: true }));
        for (let i = 0; i < 100; i++) { const r = ((i * 37) % 100) < 43, x = 560 + (i % 20) * 42, y = 300 + Math.floor(i / 20) * 70; o += fade(p4 * seg(t, B.weight + i * 0.02, B.weight + i * 0.02 + 0.2), `<circle cx="${x}" cy="${y}" r="16" fill="${r ? '#2AA594' : '#E2556F'}" opacity="${i === 57 ? 1 : 0.75}"/>`); }
        o += fade(p4 * seg(t, B.weight + 2.5, B.weight + 3), `<circle cx="${560 + 17 * 42}" cy="${300 + 2 * 70}" r="30" fill="none" stroke="#2C1810" stroke-width="5"/>${txt(960, 760, 'one trade doesn’t carry the weight', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      return o;
    },

    // 40-something percent. "Girl, that's terrible." Until you see the R. Losses stop being shocking.
    'v13-numbers': (s, t) => {
      const B = s.b;
      let o = grad('nm', '#F3E3D6', '#FBF4EF') + bg('url(#nm)');
      const p2 = seg(t, B.rr - 0.3, B.rr + 0.3), p3 = seg(t, B.changes - 0.4, B.changes + 0.2), p4 = seg(t, B.data - 0.4, B.data + 0.2);
      o += host(t, { x: 100, y: 330, w: 520, pose: t > B.forty && t < B.rr ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const a = 1 - p2;
      if (a > 0) {
        const v = t < B.ninety ? 0 : t < B.forty ? 0.9 * (1 - 0.5 * ease(seg(t, B.ninety + 2, B.ninety + 3))) : 0.43;
        const ang = Math.PI * (1 - v);
        o += fade(a * seg(t, B.test, B.test + 0.5), `<path d="M900,640 A380,380 0 0 1 1660,640" fill="none" stroke="#fff" stroke-width="70"/><path d="M900,640 A380,380 0 0 1 ${f1(1280 + 380 * Math.cos(ang))},${f1(640 - 380 * Math.sin(ang))}" fill="none" stroke="#7F77DD" stroke-width="70"/>${txt(1280, 600, Math.round(v * 100) + '%', 110, C.dark, { f: 'JetBrains Mono, monospace' })}${txt(1280, 680, 'win rate', 36, C.muted, { w: 700 })}`);
        o += fade(a * seg(t, B.ninety + 1.5, B.ninety + 2), txt(1280, 200, 'not 90%', 46, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="1180" x2="1380" y1="182" y2="182" stroke="#E2556F" stroke-width="0"/>`);
        o += fade(a * seg(t, B.need, B.need + 0.4), txt(1280, 790, 'and it doesn’t need to be', 44, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
        o += thought(1280, 900, '“Girl, that’s terrible.”', between(t, B.forty + 2, B.rr - 0.2), { size: 38 });
      }
      // risk to reward: illustrative bars and an equity line that still climbs
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, `${txt(1280, 170, 'risk-to-reward', 54, C.dark, { f: 'Playfair Display', it: true })}${txt(1280, 225, 'example numbers', 26, C.muted, { w: 700 })}<rect x="760" y="260" width="1040" height="560" rx="28" fill="#fff"/><line x1="800" x2="1760" y1="560" y2="560" stroke="#E6DDD3" stroke-width="4"/>`);
        const res = [-1, 2.5, -1, -1, 2.5, -1, 2.5, -1, -1, 2.5, -1, 2.5];
        let eq = 0; const pts = [];
        res.forEach((r, i) => {
          const k = seg(t, B.rr + 0.3 + i * 0.25, B.rr + 0.5 + i * 0.25), x = 820 + i * 78;
          o += fade(b * k, `<rect x="${x}" y="${r > 0 ? 560 - r * 70 : 560}" width="50" height="${Math.abs(r) * 70}" rx="6" fill="${r > 0 ? '#2AA594' : '#E2556F'}"/>`);
          eq += r; pts.push(`${x + 25},${f1(560 - eq * 30)}`);
        });
        const shown = Math.max(1, Math.floor(seg(t, B.rr + 0.3, B.rr + 3.3) * res.length));
        o += fade(b, `<polyline points="${pts.slice(0, shown).join(' ')}" fill="none" stroke="#7F77DD" stroke-width="8" stroke-linejoin="round"/>`);
        o += fade(b * seg(t, B.rr + 3, B.rr + 3.5), txt(1280, 880, '5 wins · 7 losses · still up', 40, '#2AA594', { w: 800 }));
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        const sh = seg(t, B.shocked + 2, B.shocked + 2.6);
        o += fade(c, `<rect x="900" y="300" width="760" height="380" rx="36" fill="#fff"/>${txt(1280, 420, 'a losing trade', 50, '#E2556F', { f: 'Playfair Display', it: true })}${txt(1280, 520, sh > 0.5 ? 'expected. part of the system.' : '😱 shocked?!', 44, sh > 0.5 ? '#2AA594' : C.dark, { w: 800 })}`);
      }
      if (p4 > 0) {
        o += fade(p4, `${txt(1280, 360, 'the data doesn’t say', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 })}${txt(1280, 440, '“your next trade wins”', 52, C.muted, { f: 'Playfair Display', it: true })}`);
        o += fade(seg(t, B.dontneed, B.dontneed + 0.5), `${txt(1280, 600, 'it says your process works', 52, '#2AA594', { f: 'Playfair Display', it: true })}${txt(1280, 680, 'even when the next trade doesn’t', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      return o;
    },

    // More evidence, not more confirmations. Backtest, journal, review. Don't overfit.
    'v13-evidence': (s, t) => {
      const B = s.b;
      let o = grad('ev', '#E6F5F2', '#FDF8F5') + bg('url(#ev)');
      const p2 = seg(t, B.backtest - 0.3, B.backtest + 0.3), p3 = seg(t, B.feel - 0.4, B.feel + 0.2), p4 = seg(t, B.perfect - 0.4, B.perfect + 0.2);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a, `<rect x="240" y="260" width="600" height="460" rx="30" fill="#120D1C"/>${candles(270, 300, 540, 380, vals(9, 14, 0.01, 0.04, 0.4), 14)}`);
        for (let i = 0; i < 4; i++) o += fade(a * seg(t, B.more + i * 0.5, B.more + i * 0.5 + 0.4), `<path d="M270,${560 - i * 40} ${[...Array(14)].map((_, x) => `L${270 + x * 40},${f1(560 - i * 40 + 18 * Math.sin(x + i))}`).join(' ')}" fill="none" stroke="${['#F9D89A', '#7ECFC0', '#FF8DA3', '#CFC8FA'][i]}" stroke-width="4"/>`);
        o += fade(a, txt(540, 800, 'more confirmations', 40, C.muted, { f: 'Playfair Display', it: true, w: 700 })) + cross(820, 280, a * pop(t, B.evidence, 0.4), '#E2556F', 36);
        o += fade(a * seg(t, B.evidence, B.evidence + 0.5), `<rect x="1120" y="340" width="520" height="380" rx="20" fill="#F9D89A"/><rect x="1120" y="300" width="220" height="70" rx="16" fill="#F9D89A"/><rect x="1150" y="380" width="460" height="310" rx="10" fill="#FFF8E6"/>${txt(1380, 540, 'EVIDENCE', 50, '#B38A2E', { ls: 6 })}${txt(1380, 800, 'more evidence', 44, '#2AA594', { f: 'Playfair Display', it: true })}`);
      }
      // backtest + journal
      const b = p2 * (1 - p3);
      if (b > 0) {
        o += fade(b, txt(560, 180, 'backtest', 50, '#2AA594', { f: 'Playfair Display', it: true }));
        const n = Math.floor(seg(t, B.backtest, B.backtest + 4) * 48);
        for (let i = 0; i < n; i++) { const x = 220 + (i % 8) * 85, y = 260 + Math.floor(i / 8) * 85, w = ((i * 37) % 100) < 43; o += `<g opacity="${f1(b)}"><rect x="${x}" y="${y}" width="70" height="70" rx="12" fill="${w ? '#2AA594' : '#E2556F'}" opacity=".85"/>${txt(x + 35, y + 45, String(i + 1), 24, '#fff')}</g>`; }
        o += fade(b * seg(t, B.backtest + 1.5, B.backtest + 2), txt(1380, 180, 'journal every live trade', 46, '#7F77DD', { f: 'Playfair Display', it: true }));
        ['setup valid?', 'entry rules followed?', 'risk rules followed?', 'win or loss · R:R', 'did I interfere?', 'market conditions'].forEach((l, j) => { o += fade(b * seg(t, B.backtest + 2 + j * 0.4, B.backtest + 2.3 + j * 0.4), `<rect x="1060" y="${250 + j * 95}" width="640" height="76" rx="14" fill="#fff"/><rect x="1080" y="${270 + j * 95}" width="36" height="36" rx="8" fill="none" stroke="#7F77DD" stroke-width="4"/>${txt(1140, 300 + j * 95, l, 32, C.dark, { a: 'start', w: 700 })}`); });
      }
      const c = p3 * (1 - p4);
      if (c > 0) {
        o += fade(c, txt(960, 300, '“I feel like this works”', 60, C.muted, { f: 'Playfair Display', it: true }) + `<line x1="620" x2="${f1(620 + 680 * seg(t, B.e1 - 0.5, B.e1))}" y1="280" y2="280" stroke="#E2556F" stroke-width="7"/>`);
        [[B.e1, 'I’ve tested this.'], [B.e2, 'I’ve tracked this.'], [B.e3, 'I understand how it behaves.']].forEach(([at, l], j) => { o += fade(c * seg(t, at, at + 0.4), txt(960, 480 + j * 120, l, 60, '#2AA594', { f: 'Playfair Display', it: true })); });
      }
      if (p4 > 0) {
        // the rulebook that grows with every loss
        const nr = Math.min(9, Math.floor(seg(t, B.rules, B.rules + 9) * 10));
        o += fade(p4, txt(960, 170, 'don’t hunt for perfection', 54, '#E2556F', { f: 'Playfair Display', it: true }));
        o += fade(p4, `<rect x="260" y="260" width="620" height="${f1(120 + nr * 64)}" rx="20" fill="#fff"/>${txt(570, 330, 'MY STRATEGY', 36, C.dark, { ls: 6 })}`);
        for (let i = 0; i < nr; i++) o += txt(310, 410 + i * 64, `+ rule #${i + 1} (to delete loss #${i + 1})`, 30, i > 3 ? '#E2556F' : C.dark, { a: 'start', w: 700, op: f1(p4) });
        o += fade(p4 * seg(t, B.rules + 6, B.rules + 6.6), `<rect x="1060" y="300" width="640" height="200" rx="30" fill="#E6F5F2"/>${txt(1380, 390, 'looks amazing', 44, '#2AA594')}${txt(1380, 450, 'in hindsight', 36, C.dark, { w: 700 })}`);
        o += fade(p4 * seg(t, B.rules + 9, B.rules + 9.6), `<rect x="1060" y="560" width="640" height="200" rx="30" fill="#FDE8ED"/>${txt(1380, 650, 'impossible', 44, '#E2556F')}${txt(1380, 710, 'in real time', 36, C.dark, { w: 700 })}`);
        o += fade(p4 * seg(t, B.rules + 11, B.rules + 11.6), txt(1380, 860, 'understand it · don’t delete every loss', 34, C.muted, { w: 700 }));
      }
      return o;
    },

    // Evidence, not emotion. Confidence = not needing the next one to win.
    'v13-rule': (s, t) => {
      const B = s.b;
      let o = grad('r13', '#EEEBFB', '#DDF1EE') + bg('url(#r13)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'I build confidence through evidence, not emotion.', 62, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a * seg(t, B.r1, B.r1 + 0.4), `<rect x="260" y="380" width="640" height="200" rx="36" fill="#fff"/>${txt(580, 470, 'winning streak', 42, '#2AA594')}${txt(580, 530, '≠ proof it works', 34, C.dark, { w: 700 })}`);
      o += fade(a * seg(t, B.r2, B.r2 + 0.4), `<rect x="1020" y="380" width="640" height="200" rx="36" fill="#fff"/>${txt(1340, 470, 'losing streak', 42, '#E2556F')}${txt(1340, 530, '≠ proof it doesn’t', 34, C.dark, { w: 700 })}`);
      ['TEST', 'TRACK', 'JOURNAL', 'REVIEW'].forEach((l, j) => { o += fade(a, pill(420 + j * 360, 720, l, ['#2AA594', '#7F77DD', '#E2B04A', '#F4829A'][j], pop(t, B.r3 + j * 0.6, 0.4), 38)); });
      if (fin > 0) {
        o += fade(fin, txt(960, 470, 'Confidence isn’t believing my next trade will win.', 54, C.muted, { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.line + 3.5, B.line + 4.1), txt(960, 600, 'It’s having enough evidence', 64, '#2AA594', { f: 'Playfair Display', it: true }) + txt(960, 700, 'that I don’t need it to.', 64, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Reflection: what evidence do you have? Not TikTok. Build it. Know why YOU take it.
    'v13-reflect': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const p2 = seg(t, B.q1 - 0.3, B.q1 + 0.3), p3 = seg(t, B.okay - 0.4, B.okay + 0.2), end = seg(t, B.stop - 0.4, B.stop + 0.3);
      const a = 1 - p2;
      if (a > 0) {
        o += fade(a * seg(t, B.what, B.what + 0.5), txt(960, 260, 'What evidence do I actually have', 62, '#fff', { f: 'Playfair Display', it: true }) + txt(960, 350, 'that my setup works?', 62, '#F9D89A', { f: 'Playfair Display', it: true }));
        [['somebody else trades it', 470], ['it looked good on TikTok', 610], ['I won 3 trades last week', 750]].forEach(([l, y], j) => { const at = B.what + 1.2 + j * 0.8; o += fade(a * seg(t, at, at + 0.3), txt(960, y, l, 44, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="${960 - l.length * 11 - 20}" x2="${f1(960 - l.length * 11 - 20 + (l.length * 22 + 40) * seg(t, at + 0.4, at + 0.8))}" y1="${y - 14}" y2="${y - 14}" stroke="#E2556F" stroke-width="6"/>`); });
      }
      const b = p2 * (1 - p3);
      if (b > 0) {
        [[B.q1, '# examples tested'], [B.q2, '# live trades journaled'], [B.q3, 'approx. win rate'], [B.q4, 'avg winner vs avg loser'], [B.q5, 'conditions it works in'], [B.q6, 'what my losers look like']].forEach(([at, l], j) => {
          const x = 560 + (j % 2) * 800, y = 270 + Math.floor(j / 2) * 220;
          o += fade(b * seg(t, at, at + 0.4), `<rect x="${x - 360}" y="${y - 80}" width="720" height="160" rx="30" fill="#2A2142"/>${txt(x - 300, y + 14, l, 38, '#fff', { a: 'start', w: 700 })}${txt(x + 300, y + 16, '?', 54, '#F9D89A')}`);
        });
      }
      const c = p3 * (1 - end);
      if (c > 0) {
        o += fade(c, txt(960, 380, 'maybe you’re not an unconfident trader…', 56, '#CFC8FA', { f: 'Playfair Display', it: true, op: f1(seg(t, B.unconf, B.unconf + 0.5)) }) + txt(960, 300, 'and if the answer is no, that’s okay.', 44, '#fff', { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(c * seg(t, B.yet, B.yet + 0.5), txt(960, 560, 'not enough evidence', 72, '#F9D89A', { f: 'Playfair Display', it: true }) + txt(960, 660, 'yet.', 90, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end)}"/>`;
        const p5 = seg(t, B.dayli - 0.3, B.dayli + 0.3);
        o += fade(end * (1 - p5), txt(960, 260, 'stop feeling your way into confidence', 50, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + txt(960, 380, 'build it.', 80, C.dark, { f: 'Playfair Display', it: true, op: f1(seg(t, B.buildit, B.buildit + 0.4)) }));
        [[B.b1, 'TEST', '#2AA594'], [B.b2, 'JOURNAL', '#7F77DD'], [B.b3, 'REVIEW', '#E2B04A'], [B.b4, 'COLLECT', '#F4829A']].forEach(([at, l, col], j) => { o += fade(end * (1 - p5), scaleAt(420 + j * 360, 620, pop(t, at, 0.5), `<rect x="${290 + j * 360}" y="${640 - (j + 1) * 50}" width="260" height="${(j + 1) * 50 + 60}" rx="16" fill="${col}"/>${txt(420 + j * 360, 680, l, 34, '#fff', { ls: 3 })}`)); });
        if (p5 > 0) {
          o += fade(p5, `${txt(960, 260, 'not because Dayli said so', 48, C.muted, { f: 'Playfair Display', it: true, w: 700 })}<line x1="650" x2="${f1(650 + 620 * seg(t, B.dayli + 1.5, B.dayli + 2))}" y1="244" y2="244" stroke="#E2556F" stroke-width="6"/>`);
          o += fade(p5 * seg(t, B.discord, B.discord + 0.4), `${txt(960, 360, 'not because Discord is bullish', 48, C.muted, { f: 'Playfair Display', it: true, w: 700 })}<line x1="610" x2="${f1(610 + 700 * seg(t, B.discord + 1.5, B.discord + 2))}" y1="344" y2="344" stroke="#E2556F" stroke-width="6"/>`);
          o += fade(seg(t, B.you, B.you + 0.5), txt(960, 540, 'you know why YOU take it', 70, '#2AA594', { f: 'Playfair Display', it: true }));
          o += fade(seg(t, B.indep, B.indep + 0.5), pill(960, 700, 'that’s where independence starts', '#2C1810', 1, 40));
          o += fade(seg(t, B.last + 1, B.last + 1.6), txt(960, 860, 'the kind of confidence we’re building', 44, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
        }
      }
      return o;
    },

    /*@@V@@*/
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
