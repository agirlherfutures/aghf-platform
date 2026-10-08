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

    /*@@V@@*/
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
