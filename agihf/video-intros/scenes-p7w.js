/**
 * scenes-p7w.js: Phase 7 psychology videos, illustrated style (the Psychology 1 look).
 * One place and one visual idea per scene, very few words on screen.
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


  /* ── shared props ───────────────────────────────────────────────── */
  const wall = (id, a, b, floorY = 860, floorCol = '#C98B6B') => grad(id, a, b) + bg(`url(#${id})`) + `<rect y="${floorY}" width="1920" height="${1080 - floorY}" fill="${floorCol}"/><rect y="${floorY}" width="1920" height="10" fill="#000" opacity=".08"/>`;
  const windowBox = (x, y, w, h, sky, inner = '') => `<rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" rx="10" fill="#fff"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${sky}"/>${inner}<line x1="${x + w / 2}" x2="${x + w / 2}" y1="${y}" y2="${y + h}" stroke="#fff" stroke-width="10"/><line x1="${x}" x2="${x + w}" y1="${y + h / 2}" y2="${y + h / 2}" stroke="#fff" stroke-width="10"/>`;
  const desk = (x, y, w, col = '#8B6A55') => `<rect x="${x}" y="${y}" width="${w}" height="30" rx="8" fill="${col}"/><rect x="${x + 20}" y="${y + 30}" width="${w - 40}" height="${1080 - y}" fill="${col}" opacity=".85"/>`;
  const monitor = (x, y, w, h, inner = '') => `<rect x="${x + w / 2 - 14}" y="${y + h}" width="28" height="60" fill="#3A2F55"/><rect x="${x + w / 2 - 80}" y="${y + h + 52}" width="160" height="14" rx="7" fill="#3A2F55"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#120D1C" stroke="#3A2F55" stroke-width="10"/>${inner}`;
  const envelope = (x, y, s = 1, stamp = '') => `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})"><rect x="-90" y="-60" width="180" height="120" rx="10" fill="#fff" stroke="#E6DDD3" stroke-width="4"/><path d="M-90,-60 L0,10 L90,-60" fill="none" stroke="#E6DDD3" stroke-width="4"/>${stamp ? `<g transform="rotate(-12)"><rect x="-56" y="10" width="112" height="40" rx="6" fill="none" stroke="#E2556F" stroke-width="5"/>${txt(0, 40, stamp, 24, '#E2556F', { ls: 2 })}</g>` : ''}</g>`;
  const phone = (x, y, s = 1, screen = '', buzz = 0) => `<g transform="translate(${f1(x + buzz)},${f1(y)}) scale(${s})"><rect x="-50" y="-90" width="100" height="180" rx="16" fill="#2C1810"/><rect x="-42" y="-76" width="84" height="148" rx="8" fill="#7F77DD"/>${screen}</g>`;
  const coin = (x, y, r = 30) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${C.gold}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${r * 0.72}" fill="none" stroke="#C98A1F" stroke-width="${r * 0.12}"/>${txt(x, y + r * 0.36, '$', r, '#7A4E0F')}`;
  const cloud = (x, y, s = 1, col = '#fff', op = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})" opacity="${op}"><ellipse rx="150" ry="70" fill="${col}"/><ellipse cx="-90" cy="10" rx="90" ry="55" fill="${col}"/><ellipse cx="95" cy="12" rx="95" ry="55" fill="${col}"/><ellipse cx="-20" cy="-45" rx="85" ry="60" fill="${col}"/></g>`;
  const rain = (x, w, y0, y1, t, n = 18, col = '#9DB4D6') => { let s = ''; for (let j = 0; j < n; j++) { const xx = x + (j * 97) % w, yy = y0 + ((t * 700 + j * 131) % (y1 - y0)); s += `<line x1="${xx}" y1="${f1(yy)}" x2="${xx - 10}" y2="${f1(yy + 40)}" stroke="${col}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`; } return s; };
  const sun = (x, y, r, t) => `<g transform="translate(${x},${y})">${[...Array(10)].map((_, j) => `<rect x="-5" y="${-r - 40}" width="10" height="26" rx="5" fill="#F9D89A" transform="rotate(${f1(j * 36 + t * 10)})"/>`).join('')}<circle r="${r}" fill="#F9D89A"/></g>`;
  const bigNum = (x, y, s, size, col) => txt(x, y, s, size, col, { f: 'JetBrains Mono, monospace' });
  const flat = (seed, n) => vals(seed, n, 0, 0.02, 0.5);
  const mini = (x, y, w, h, v, n) => candles(x, y, w, h, v, n);
  const sceneOf = (t, beats) => { let i = 0; beats.forEach((b, j) => { if (t >= b - 0.3) i = j; }); return i; };

  const LIVE = {
    /* ════ Psychology 11 · Your Relationship With Money ════════════════ */

    // Dawn bedroom. A number in her head. The reasons arrive: bill under the door, phone buzz, red calendar, a bag.
    'w11-bedroom': (s, t) => {
      const B = s.b;
      let o = wall('w11a', '#FFE3C7', '#F6C4A6');
      const rise = seg(t, s.start, B.decided + 4);
      o += windowBox(1440, 150, 380, 360, '#FBD1A2', `<circle cx="1630" cy="${f1(470 - 160 * rise)}" r="70" fill="#FFF1C9"/>`);
      // door + bed
      o += `<rect x="70" y="300" width="240" height="560" rx="8" fill="#B27A5A"/><circle cx="270" cy="600" r="12" fill="#F9D89A"/>`;
      o += `<rect x="380" y="640" width="520" height="160" rx="30" fill="#fff"/><rect x="380" y="700" width="520" height="160" rx="20" fill="#7F77DD"/><rect x="400" y="600" width="160" height="70" rx="30" fill="#fff"/><rect x="370" y="560" width="30" height="300" rx="10" fill="#8B6A55"/>`;
      // calendar on the wall
      o += `<rect x="1120" y="190" width="220" height="250" rx="10" fill="#fff"/><rect x="1120" y="190" width="220" height="50" rx="10" fill="#E2556F"/>`;
      for (let i = 0; i < 12; i++) { const cx = 1145 + (i % 4) * 52, cy = 270 + Math.floor(i / 4) * 52, red = i < 3 && t > B.m3 + 0.3 + i * 0.3; o += `<rect x="${cx - 2}" y="${cy - 2}" width="40" height="40" rx="6" fill="${red ? '#FDE8ED' : '#F6EFEA'}"/>${red ? txt(cx + 18, cy + 28, '−', 30, '#E2556F') : ''}`; }
      // her
      o += you(t, { x: 1080, y: 1000, scale: 1.25, flip: t > B.decided + 1, mood: t > B.m1 && t < B.decided ? 'sad' : undefined, frontArm: t > B.num && t < B.m1 ? { a1: -60, a2: -150 } : undefined });
      // the number
      const nk = pop(t, B.num, 0.7), grow = 1 + 0.25 * ease(seg(t, B.decided, B.decided + 1.5));
      o += scaleAt(1000, 300, nk * grow, cloud(1000, 300, 1.05, '#fff') + bigNum(1000, 338, '$500', 96, '#E2B04A'));
      // the reasons
      const ex = lerp(140, 520, ease(seg(t, B.m1, B.m1 + 1.2)));
      if (t > B.m1) o += envelope(ex, 830, 0.9, t > B.m1 + 1.3 ? 'DUE' : '');
      if (t > B.m2) { const bz = t < B.m2 + 2.5 ? Math.sin(t * 60) * 5 : 0; o += phone(700, 640, 0.8, txt(0, 6, '💸', 46, '#fff'), bz); if (t < B.m2 + 2.5) o += `<path d="M640,600 q-20,40 0,80 M760,600 q20,40 0,80" stroke="#2C1810" stroke-width="5" fill="none"/>`; }
      if (t > B.m4) o += scaleAt(220, 790, pop(t, B.m4, 0.5), `<path d="M140,720 L300,720 L320,860 L120,860 Z" fill="#F4829A"/><path d="M180,720 q40,-60 80,0" fill="none" stroke="#2C1810" stroke-width="8"/>${heart(220, 770, 0.5, '#fff')}`);
      // everything feeds the number
      const pull = seg(t, B.decided, B.decided + 1.2);
      if (pull > 0) [[520, 800], [700, 600], [1230, 300], [220, 740]].forEach(([x, y]) => { o += `<line x1="${x}" y1="${y}" x2="${f1(lerp(x, 1000, pull))}" y2="${f1(lerp(y, 330, pull))}" stroke="#E2B04A" stroke-width="6" stroke-dasharray="14 10" opacity=".8"/>`; });
      return o;
    },

    // At the desk. Flat chart, clock spinning, a tumbleweed. The $500 note burns red.
    'w11-nothing': (s, t) => {
      const B = s.b;
      let o = wall('w11b', '#3B2F55', '#2A2142', 900, '#1E1730');
      o += `<circle cx="300" cy="230" r="90" fill="#fff"/><circle cx="300" cy="230" r="80" fill="#F6EFEA"/>`;
      const sp = 1 + 20 * seg(t, B.nothing, B.still);
      o += `<line x1="300" y1="230" x2="${f1(300 + 60 * Math.sin(t * sp))}" y2="${f1(230 - 60 * Math.cos(t * sp))}" stroke="#2C1810" stroke-width="8" stroke-linecap="round"/><line x1="300" y1="230" x2="${f1(300 + 40 * Math.sin(t * sp / 12))}" y2="${f1(230 - 40 * Math.cos(t * sp / 12))}" stroke="#2C1810" stroke-width="10" stroke-linecap="round"/>`;
      const n = 2 + Math.floor(seg(t, B.open, B.what) * 26);
      o += monitor(560, 180, 820, 480, candles(600, 250, 740, 340, flat(41, 28), n, { slots: 28 }));
      // the note on the bezel
      const red = t > B.still, pulse = red ? 1 + 0.08 * Math.sin((t - B.still) * 8) : 1;
      o += scaleAt(1330, 210, pulse, `<g transform="rotate(8 1330 210)"><rect x="1250" y="160" width="170" height="110" fill="${red ? '#FF8DA3' : '#FFF1A8'}"/>${bigNum(1335, 232, '$500', 40, red ? '#fff' : '#7A4E0F')}</g>`);
      // her, seated behind the desk
      o += you(t, { x: 1600, y: 1060, scale: 1.25, flip: true, mood: t > B.chop ? 'sad' : undefined, frontArm: t > B.still && t < B.what ? { a1: -100 + Math.sin(t * 10) * 10, a2: -80 } : { a1: 160, a2: 150 } });
      o += desk(420, 860, 1500);
      // tumbleweed across the desk
      const tw = seg(t, B.nothing, B.nothing + 3.4);
      if (tw > 0 && tw < 1) { const x = lerp(380, 1500, tw), y = 820 - Math.abs(Math.sin(tw * 12)) * 60; o += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(tw * 1000)})"><circle r="42" fill="none" stroke="#B89A6A" stroke-width="6"/><path d="M-32,-12 Q0,30 32,-12 M-22,22 Q0,-30 28,16 M-38,6 Q0,-10 38,8" stroke="#B89A6A" stroke-width="5" fill="none"/></g>`; }
      o += thought(1500, 380, '…now what?', between(t, B.what, s.end), { size: 46 });
      return o;
    },

    // Tug-of-war: her vs a giant $. This is what we're talking about today.
    'w11-tug': (s, t) => {
      const B = s.b;
      let o = grad('w11c', '#FDF8F5', '#F6E7DA') + bg('url(#w11c)') + `<rect y="860" width="1920" height="220" fill="#E8D5C4"/>`;
      const sway = Math.sin(t * 2.4) * 40;
      o += you(t, { x: 560 + sway, y: 900, scale: 1.3, flip: true, frontArm: { a1: 10, a2: 0 }, backArm: { a1: 20, a2: 10 } });
      o += `<path d="M${f1(640 + sway)},700 Q960,${f1(740 + Math.sin(t * 5) * 20)} ${f1(1240 + sway)},640" fill="none" stroke="#C98A1F" stroke-width="12" stroke-linecap="round"/>`;
      o += `<g transform="translate(${f1(1400 + sway)},560) rotate(${f1(-6 + Math.sin(t * 2.4) * 4)})">${txt(0, 120, '$', 420, '#E2B04A', { f: 'Playfair Display' })}</g>`;
      o += fade(seg(t, B.today + 2, B.today + 2.8), txt(960, 180, 'your relationship with money', 64, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Split: sunny garden (wanting) vs rainy ATM called MARKET (needing).
    'w11-split': (s, t) => {
      const B = s.b;
      let o = grad('w11d', '#CDEBF7', '#FDF8F5') + `<rect width="1920" height="1080" fill="url(#w11d)"/><rect y="860" width="1920" height="220" fill="#B9DDB0"/>`;
      o += sun(180, 180, 70, t);
      const g = ease(seg(t, B.want, B.diff + 2));
      o += `<rect x="420" y="780" width="140" height="90" rx="12" fill="#C98B6B"/><path d="M490,780 L490,${f1(780 - 300 * g)}" stroke="#2AA594" stroke-width="12" stroke-linecap="round"/>`;
      [0.3, 0.55, 0.8].forEach((h, j) => { if (g > h) o += coin(490 + (j % 2 ? -50 : 50), 780 - 300 * h, 26 * clamp((g - h) * 5)); });
      o += you(t, { x: 260, y: 900, scale: 1.1, frontArm: { a1: -20, a2: 20 }, hold: `<path d="M0,0 l60,-10 l30,30 l-20,10 z" fill="#7ECFC0"/>` });
      if (t > B.want + 1) for (let j = 0; j < 5; j++) { const p = ((t * 1.4 + j * 0.2) % 1); o += `<circle cx="${f1(360 + p * 90)}" cy="${f1(610 + p * p * 160)}" r="6" fill="#7FB8D6" opacity="${f1(1 - p)}"/>`; }
      o += pill(480, 980, 'wanting', '#2AA594', pop(t, B.want + 0.5, 0.4), 32);
      // the right side appears on "need"
      const r = seg(t, B.diff + 2, B.need);
      o += fade(r, `<rect x="960" width="960" height="1080" fill="#1E2433"/><rect x="960" y="860" width="960" height="220" fill="#151A26"/>` + rain(960, 960, 0, 860, t, 22));
      if (r > 0) {
        const bang = t > B.need ? Math.abs(Math.sin(t * 9)) : 0;
        o += fade(r, `<rect x="1300" y="330" width="380" height="560" rx="24" fill="#3A4560"/><rect x="1340" y="380" width="300" height="160" rx="12" fill="#120D1C"/>${bigNum(1490, 480, t > B.need + 1 && Math.sin(t * 5) > 0 ? '$500?' : '', 52, '#FF8DA3')}${txt(1490, 600, 'MARKET', 34, '#CFC8FA', { ls: 6 })}<rect x="1360" y="660" width="260" height="20" rx="10" fill="#120D1C"/>`);
        o += fade(r, you(t, { x: 1150, y: 900, scale: 1.1, flip: true, mood: 'sad', frontArm: { a1: -20 - bang * 30, a2: -10 - bang * 30 } }));
        o += pill(1440, 980, 'needing', '#E2556F', pop(t, B.need, 0.4), 32);
      }
      return o;
    },

    // Archery: the bullseye says "setup"… then it becomes $500 and runs away.
    'w11-target': (s, t) => {
      const B = s.b;
      let o = grad('w11e', '#E6F5F2', '#FDF8F5') + bg('url(#w11e)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      const sw = ease(seg(t, B.look500, B.look500 + 0.8)), drift = sw * Math.sin(t * 2.2) * 120;
      const cx = 1300 + drift + sw * 120, cy = 480;
      o += `<rect x="${f1(cx - 14)}" y="${cy + 230}" width="28" height="180" fill="#8B6A55"/>`;
      [250, 190, 130, 70].forEach((r, j) => { o += `<circle cx="${f1(cx)}" cy="${cy}" r="${r * (1 - sw * 0.35)}" fill="${j % 2 ? '#fff' : (sw > 0.5 ? '#E2B04A' : '#2AA594')}"/>`; });
      o += fade(1 - sw, txt(cx, cy + 14, 'setup', 40, '#fff'));
      o += scaleAt(cx, cy, sw, bigNum(cx, cy + 16, '$500', 40, '#B38A2E'));
      o += you(t, { x: 360, y: 900, scale: 1.2, flip: false, frontArm: { a1: -5, a2: -5 }, backArm: { a1: 0, a2: 40 } });
      // arrows that miss after the switch
      [0, 1, 2].forEach(j => { const at = B.look500 + 1 + j * 1.6, k = seg(t, at, at + 0.5); if (k <= 0) return; const ex = lerp(480, cx + (j - 1) * 260 + 60, k), ey = lerp(640, cy - 260 + j * 230, k); o += `<line x1="${f1(ex - 80)}" y1="${f1(ey + 20)}" x2="${f1(ex)}" y2="${f1(ey)}" stroke="#2C1810" stroke-width="6"/><path d="M${f1(ex)},${f1(ey)} l-18,-8 l4,18 z" fill="#2C1810"/>`; });
      return o;
    },

    // The track: grab a sloppy setup, then the finish line keeps moving away.
    'w11-track': (s, t) => {
      const B = s.b;
      let o = grad('w11f', '#FFF4DE', '#FDF8F5') + bg('url(#w11f)') + `<rect y="760" width="1920" height="320" fill="#E07B5A"/>`;
      for (let j = 0; j < 4; j++) o += `<line x1="0" x2="1920" y1="${800 + j * 70}" y2="${800 + j * 70}" stroke="#fff" stroke-width="4" opacity=".6"/>`;
      const back1 = ease(seg(t, B.more, B.more + 1)), back2 = ease(seg(t, B.n700, B.n700 + 1.2));
      const fx = 1380 + back1 * 120 + back2 * 200, sc = 1 - back1 * 0.15 - back2 * 0.3;
      const amt = t < B.more ? '$500' : t < B.n700 ? '$300' : '$700';
      o += `<g transform="translate(${f1(fx)},760) scale(${f1(sc)})"><rect x="-200" y="-460" width="14" height="460" fill="#2C1810"/><rect x="186" y="-460" width="14" height="460" fill="#2C1810"/><rect x="-200" y="-460" width="400" height="110" fill="#fff" stroke="#2C1810" stroke-width="6"/>${bigNum(0, -385, amt, 64, t < B.n700 ? '#2AA594' : '#E2556F')}</g>`;
      const run = 260 + 380 * seg(t, s.start, s.end);
      o += you(t, { x: run, y: 900, scale: 1.15, walking: true, mood: t > B.n700 ? 'sad' : undefined, hold: t > B.good + 0.5 && t < B.more ? `<g transform="rotate(-20)"><rect x="-10" y="-90" width="120" height="90" rx="8" fill="#120D1C"/><line x1="10" y1="-40" x2="100" y2="-60" stroke="#E2556F" stroke-width="5" stroke-dasharray="6 6"/></g>` : '' });
      o += thought(run + 120, 380, 'good enough…?', between(t, B.good + 0.3, B.more - 0.2), { size: 40 });
      return o;
    },

    // Same calm chart in the sun. A storm cloud only over her.
    'w11-storm': (s, t) => {
      const B = s.b;
      let o = grad('w11g', '#E6F5F2', '#FDF8F5') + bg('url(#w11g)');
      o += sun(240, 200, 60, t) + `<rect x="160" y="340" width="700" height="440" rx="30" fill="#120D1C"/>${candles(190, 380, 640, 360, flat(77, 18), 18)}`;
      o += fade(seg(t, B.changed + 0.6, B.changed + 1.2), pill(510, 860, 'same chart', '#2AA594', 1, 32));
      const st = ease(seg(t, B.desp - 0.2, B.desp + 0.8));
      o += you(t, { x: 1400, y: 960, scale: 1.3, mood: st > 0.3 ? 'sad' : undefined });
      o += fade(st, cloud(1400, 260, 1.1, '#5A5F77') + rain(1220, 360, 330, 820, t, 14, '#7F92B8'));
      if (st > 0.8 && Math.sin(t * 3) > 0.85) o += `<path d="M1420,320 l-40,110 l40,0 l-30,120" fill="none" stroke="#F9D89A" stroke-width="10" stroke-linejoin="round"/>`;
      return o;
    },

    // She posts her letters into THE MARKET. They come back: RETURN TO SENDER.
    'w11-mail': (s, t) => {
      const B = s.b;
      let o = grad('w11h', '#EEEBFB', '#FDF8F5') + bg('url(#w11h)') + `<rect y="900" width="1920" height="180" fill="#D9D2EA"/>`;
      o += `<rect x="1000" y="200" width="680" height="700" rx="30" fill="#3A2F55"/><rect x="1060" y="260" width="560" height="300" rx="14" fill="#120D1C"/>${candles(1080, 290, 520, 240, vals(31, 16, 0.004, 0.05, 0.5), 16)}<rect x="1180" y="640" width="320" height="40" rx="20" fill="#120D1C"/>${txt(1340, 780, 'THE MARKET', 40, '#CFC8FA', { ls: 6 })}`;
      o += you(t, { x: 600, y: 960, scale: 1.25, flip: false, mood: t > B.owe + 1 ? 'sad' : undefined, frontArm: { a1: -10, a2: -20 } });
      const letters = [[B.mort, 'mortgage'], [B.pay, 'payout'], [B.goal, 'my goal']];
      const ret = seg(t, B.owe + 0.8, B.owe + 2.4);
      letters.forEach(([at, l], j) => {
        const k = ease(seg(t, at, at + 1.1)); if (k <= 0) return;
        if (ret <= 0) { if (k < 1) o += `<g transform="translate(${f1(lerp(700, 1340, k))},${f1(lerp(700, 660, k))}) scale(${f1(0.7 - 0.3 * k)})">${envelope(0, 0, 1)}${txt(0, 90, l, 30, C.dark)}</g>`; }
        else { const x = lerp(1340, 420 + j * 260, ret), y = lerp(660, 300 + j * 40, ret) - Math.sin(ret * Math.PI) * 120; o += envelope(x, y, 0.9, 'RETURN') + txt(x, y + 90, l, 28, C.dark); }
      });
      if (ret >= 1) o += fade(seg(t, B.owe + 2.4, B.owe + 3), txt(860, 190, 'return to sender', 46, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // Uphill with a backpack. Every thought drops another weight in. Every trade gets heavier.
    'w11-backpack': (s, t) => {
      const B = s.b;
      let o = grad('w11i', '#FFE7C7', '#F6D6BD') + bg('url(#w11i)');
      const slope = 0.12 + 0.12 * seg(t, B.heavy, B.heavy + 2);
      o += `<path d="M0,${f1(980)} L1920,${f1(980 - 1920 * slope)} L1920,1080 L0,1080 Z" fill="#C9A27E"/>`;
      const w = [B.t1, B.t2, B.t3].filter(a => t > a + 0.6).length + (t > B.heavy ? 1 : 0);
      const lean = 6 + w * 5, x = 520 + 300 * seg(t, s.start, s.end), gy = 980 - x * slope;
      o += `<g transform="rotate(${f1(lean)} ${f1(x)} ${f1(gy)})"><rect x="${f1(x - 120 - w * 8)}" y="${f1(gy - 330 - w * 10)}" width="${100 + w * 16}" height="${150 + w * 20}" rx="30" fill="#7F77DD"/>${you(t, { x, y: gy, scale: 1.25, walking: true, mood: w >= 2 ? 'sad' : undefined })}</g>`;
      [[B.t1, '“if I make this much…”'], [B.t2, '“that payout…”'], [B.t3, '“I’m short…”']].forEach(([at, l], j) => {
        o += thought(x + 360, 260 + j * 30, l, between(t, at, at + 2.8), { size: 38 });
        const d = seg(t, at + 0.2, at + 0.8); if (d > 0 && d < 1) o += `<g transform="translate(${f1(x - 70)},${f1(lerp(gy - 700, gy - 360, d))})"><rect x="-40" y="-30" width="80" height="60" rx="10" fill="#2C1810"/>${txt(0, 14, '$', 40, '#F9D89A')}</g>`;
      });
      o += fade(seg(t, B.heavy, B.heavy + 0.5), txt(1300, 180, 'every trade feels heavier', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // The jar. A loss tips coins out. A win fills it to 400… and it still looks empty.
    'w11-jar': (s, t) => {
      const B = s.b;
      let o = wall('w11j', '#F6EFEA', '#EADFD8', 820, '#B78F72');
      const lvl = t < B.loss ? 0.45 : t < B.win ? 0.45 - 0.2 * ease(seg(t, B.loss + 0.5, B.loss + 2)) : 0.25 + 0.15 * ease(seg(t, B.win + 1.5, B.win + 3.5));
      const tip = t > B.loss && t < B.win ? Math.sin(seg(t, B.loss, B.loss + 2.5) * Math.PI) * 25 : 0;
      o += `<g transform="rotate(${f1(tip)} 960 820)"><rect x="760" y="300" width="400" height="520" rx="60" fill="#fff" opacity=".55" stroke="#C9B8A8" stroke-width="10"/><rect x="772" y="${f1(808 - 500 * lvl)}" width="376" height="${f1(500 * lvl)}" rx="48" fill="#E2B04A"/><rect x="800" y="260" width="320" height="60" rx="16" fill="#8B6A55"/>${txt(960, 230, '$1,000', 54, C.dark, { f: 'JetBrains Mono, monospace' })}</g>`;
      if (t > B.loss && t < B.win) for (let j = 0; j < 6; j++) { const p = seg(t, B.loss + 0.6 + j * 0.25, B.loss + 1.6 + j * 0.25); if (p > 0 && p < 1) o += coin(1120 + p * 300, 360 + p * p * 460, 24); }
      if (t > B.win) for (let j = 0; j < 6; j++) { const p = seg(t, B.win + 1 + j * 0.3, B.win + 1.7 + j * 0.3); if (p > 0 && p < 1) o += coin(960, lerp(120, 700, p), 24); }
      o += you(t, { x: 1460, y: 980, scale: 1.2, flip: true, mood: 'sad', frontArm: t > B.win + 6 ? { a1: -100, a2: -150 } : undefined });
      o += thought(1460, 330, 'further away', between(t, B.loss + 1.5, B.win - 0.3), { size: 44 });
      o += thought(1460, 330, 'still need $600', between(t, B.win + 6, s.end), { size: 44 });
      o += pill(960, 900, '+$400', '#2AA594', pop(t, B.win + 3.5, 0.5), 40);
      return o;
    },

    // The suitcase stays at the door. She walks into the trading room lighter.
    'w11-door': (s, t) => {
      const B = s.b;
      let o = wall('w11k', '#E9E1F5', '#D9CFEA', 880, '#9C8CB8');
      o += `<rect x="900" y="260" width="380" height="620" fill="#2A2142"/><ellipse cx="1090" cy="560" rx="190" ry="260" fill="#7F77DD" opacity="${f1(0.25 + 0.05 * Math.sin(t * 2))}"/><rect x="980" y="430" width="220" height="140" rx="10" fill="#120D1C"/>${candles(995, 450, 190, 100, vals(5, 10, 0.01, 0.04, 0.4), 10)}<rect x="1280" y="260" width="30" height="620" fill="#B27A5A"/><path d="M1280,260 L1460,220 L1460,920 L1280,880 Z" fill="#B27A5A"/>`;
      const drop = seg(t, B.learn + 1.5, B.learn + 2.3), walk = seg(t, B.learn + 3, B.learn + 6);
      const x = lerp(420, 1090, ease(walk));
      o += `<g transform="translate(${f1(lerp(x - 90, 640, drop))},0)"><rect x="-120" y="740" width="240" height="160" rx="18" fill="#8B5A3C"/><rect x="-40" y="710" width="80" height="40" rx="12" fill="none" stroke="#5A3A28" stroke-width="10"/>${txt(0, 830, 'bills · payouts', 24, '#fff')}${txt(0, 866, 'goals', 24, '#fff')}</g>`;
      o += you(t, { x, y: 960, scale: 1.2, walking: walk > 0 && walk < 1, mood: drop < 1 ? 'sad' : undefined });
      o += fade(seg(t, B.learn + 5, B.learn + 6), txt(960, 170, 'not the market’s job', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A far mountain ($2,000/mo) under passing clouds. Stepping stones at her feet light up as she steps.
    'w11-mountain': (s, t) => {
      const B = s.b;
      let o = grad('w11l', '#CDEBF7', '#FDF8F5') + bg('url(#w11l)');
      o += `<path d="M1000,700 L1450,200 L1900,700 Z" fill="#9C8CB8"/><path d="M1380,280 L1450,200 L1520,280 L1480,300 L1450,270 L1420,300 Z" fill="#fff"/><rect x="1446" y="120" width="8" height="90" fill="#2C1810"/><path d="M1454,120 L1560,145 L1454,170 Z" fill="#E2B04A"/>`;
      o += fade(seg(t, B.sep, B.sep + 0.6), pill(1450, 420, '$2,000 / month', '#2C1810', 1, 32, '#F9D89A'));
      const cl = seg(t, B.not, B.not + 1.5);
      o += fade(cl, cloud(lerp(1900, 1450, cl), 230, 1.2, '#fff', 0.92) + cloud(lerp(1000, 1300, cl), 300, 0.9, '#fff', 0.85));
      o += `<rect y="700" width="1920" height="380" fill="#B9DDB0"/>`;
      const stones = [[360, 940], [560, 880], [760, 930], [960, 870], [1160, 920]];
      const step = Math.floor(seg(t, B.ctrl, B.ctrl + 5) * 5);
      stones.forEach(([x, y], j) => { const lit = t > B.ctrl && j <= step; o += `<ellipse cx="${x}" cy="${y}" rx="80" ry="30" fill="${lit ? '#2AA594' : '#E6DDD3'}"/>${lit ? `<ellipse cx="${x}" cy="${y}" rx="100" ry="40" fill="#2AA594" opacity=".2"/>` : ''}`; });
      const sx = t < B.ctrl ? 360 : stones[Math.min(4, step)][0];
      o += you(t, { x: sx, y: (t < B.ctrl ? 940 : stones[Math.min(4, step)][1]) + 10, scale: 1.0, walking: t > B.ctrl && t < B.ctrl + 5 });
      o += fade(seg(t, B.ctrl + 0.5, B.ctrl + 1), pill(760, 1020, 'today: in your control', '#2AA594', 1, 30));
      o += fade(seg(t, B.unreal, B.unreal + 0.4) * (1 - seg(t, B.sep, B.sep + 0.5)), thought(560, 520, '“just don’t care about money”', 1, { size: 36 }) + cross(860, 490, 1, '#E2556F', 30));
      return o;
    },

    // Evening. Laptop closes on $0 with a green check. She stretches, smiles, walks off.
    'w11-zero': (s, t) => {
      const B = s.b;
      let o = wall('w11m', '#F7B98E', '#F6D6BD', 860, '#B27A5A');
      o += windowBox(1400, 160, 400, 380, '#F59E7A', `<circle cx="1600" cy="${f1(420 + 60 * seg(t, s.start, s.end))}" r="80" fill="#FFD8A8"/>`);
      const cl = ease(seg(t, B.notrade, B.notrade + 1));
      o += `<rect x="460" y="${f1(500 + 320 * cl)}" width="560" height="${f1(320 * (1 - cl) + 20)}" rx="14" fill="#120D1C" stroke="#3A2F55" stroke-width="8"/><rect x="430" y="836" width="620" height="24" rx="10" fill="#3A2F55"/>`;
      if (cl < 0.7) o += fade(1 - cl, bigNum(740, 700, '$0', 110, '#fff') + check(900, 600, pop(t, B.zero + 3, 0.5), '#2AA594', 40));
      o += desk(300, 860, 900);
      o += you(t, { x: 1220, y: 1000, scale: 1.2, flip: true, frontArm: cl > 0.5 ? { a1: -160, a2: -170 } : undefined, backArm: cl > 0.5 ? { a1: -20, a2: -10 } : undefined });
      o += scaleAt(1220, 260, pop(t, B.notrade + 1.5, 0.6), `<path d="M1220,200 l18,38 l42,6 l-30,30 l8,42 l-38,-20 l-38,20 l8,-42 l-30,-30 l42,-6 z" fill="#F9D89A"/>`);
      return o;
    },

    // The rule. Four money things circle a locked setup; none of them can move it.
    'w11-rule': (s, t) => {
      const B = s.b;
      let o = grad('w11n', '#EEEBFB', '#DDF1EE') + bg('url(#w11n)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      const fin = seg(t, B.line - 0.3, B.line + 0.3);
      o += fade(1 - fin, scaleAt(960, 210, pop(t, s.start + 0.4, 0.8), txt(960, 200, 'I don’t make the market responsible', 58, C.dark, { f: 'Playfair Display' }) + txt(960, 270, 'for my financial obligations.', 58, C.dark, { f: 'Playfair Display' })));
      // the locked setup in the middle
      o += `<rect x="760" y="420" width="400" height="300" rx="24" fill="#120D1C"/>${candles(780, 450, 360, 240, [0.3, 0.42, 0.38, 0.55, 0.5, 0.66, 0.62, 0.78], 8)}`;
      o += `<g transform="translate(1160,430)"><rect x="-34" y="-10" width="68" height="56" rx="10" fill="#2AA594"/><path d="M-20,-10 v-18 a20,20 0 0 1 40,0 v18" fill="none" stroke="#2AA594" stroke-width="10"/></g>`;
      const icons = [
        [B.r1, 420, 420, envelope(0, 0, 0.8)],
        [B.r2, 1500, 420, `<circle r="70" fill="#fff" stroke="#E2B04A" stroke-width="10"/><circle r="40" fill="none" stroke="#E2B04A" stroke-width="10"/><circle r="12" fill="#E2B04A"/>`],
        [B.r3, 420, 760, phone(0, 0, 0.6, txt(0, 8, '💸', 40, '#fff'))],
        [B.r4, 1500, 760, `<rect x="-60" y="-80" width="120" height="160" rx="24" fill="#fff" stroke="#C9B8A8" stroke-width="6"/><rect x="-52" y="0" width="104" height="72" rx="18" fill="#E2B04A"/>`]];
      icons.forEach(([at, x, y, art]) => {
        const k = pop(t, at, 0.5); if (k <= 0) return;
        const push = seg(t, at + 0.6, at + 1.4), bounce = Math.sin(push * Math.PI) * 60;
        const dx = x < 960 ? bounce : -bounce;
        o += fade(1 - fin * 0.7, `<g transform="translate(${f1(x + dx)},${y}) scale(${k})">${art}</g>`);
      });
      if (fin > 0) o += fade(fin, `<rect x="0" y="780" width="1920" height="300" fill="#FDF8F5" opacity=".9"/>${txt(960, 880, 'I trade the setup in front of me,', 58, C.dark, { f: 'Playfair Display', it: true })}${txt(960, 970, 'not the dollar amount in my head.', 58, '#2AA594', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // She sits down. What's in her head: a chart… or a calculator?
    'w11-sitdown': (s, t) => {
      const B = s.b;
      let o = wall('w11o', '#3B2F55', '#2A2142', 900, '#1E1730');
      o += monitor(300, 260, 640, 400, candles(330, 320, 580, 280, vals(13, 20, 0.006, 0.04, 0.4), 20));
      const sit = ease(seg(t, B.think, B.think + 1.5));
      o += you(t, { x: lerp(1700, 1240, sit), y: 1060, scale: 1.3, flip: true, walking: sit > 0 && sit < 1 });
      o += desk(160, 880, 1300);
      const q1 = between(t, B.q1, B.q2 - 0.2), q2 = between(t, B.q2, s.end);
      o += scaleAt(1300, 340, q1, cloud(1300, 340, 1, '#fff') + candles(1200, 290, 200, 100, [0.2, 0.35, 0.3, 0.5, 0.45, 0.7], 6));
      o += scaleAt(1300, 340, q2, cloud(1300, 340, 1, '#fff') + `<rect x="1230" y="270" width="140" height="150" rx="14" fill="#3A2F55"/><rect x="1245" y="285" width="110" height="36" rx="6" fill="#CFE9C8"/>${bigNum(1300, 313, '$$$', 26, '#1A1424')}${[0, 1, 2].map(i => [0, 1, 2].map(j => `<rect x="${1248 + i * 38}" y="${334 + j * 28}" width="28" height="20" rx="4" fill="#5A4C7A"/>`).join('')).join('')}`);
      return o;
    },

    // Have you ever…? Four quick rooms, one each.
    'w11-everyou': (s, t) => {
      const B = s.b, beats = [B.h1, B.h2, B.h3, B.h4], i = sceneOf(t, beats), t0 = beats[i];
      const tEnd = i < 3 ? beats[i + 1] - 0.3 : s.end, k = seg(t, t0 - 0.3, t0 + 0.3) * (1 - seg(t, tEnd - 0.3, tEnd)), lt = t - t0;
      let o = '';
      if (i === 0) { // first winner not enough: +$ and the hand goes back to the mouse
        o += grad('ev1', '#FFF4DE', '#F9D89A') + bg('url(#ev1)');
        o += bigNum(760, 300, '+$' + Math.round(220 * ease(seg(lt, 0.2, 1.4))), 110, '#2AA594');
        o += monitor(420, 380, 680, 360, candles(450, 420, 620, 280, vals(3, 14, 0.02, 0.04, 0.3), 14));
        o += you(t, { x: 1420, y: 1060, scale: 1.25, flip: true, frontArm: lt > 2 ? { a1: -175, a2: -170 } : undefined });
        o += thought(1420, 330, 'one more', pop(t, t0 + 2.2), { size: 44 });
      } else if (i === 1) { // risk dial cranked for a payout
        o += grad('ev2', '#2B2752', '#5B4E9A') + bg('url(#ev2)');
        const ang = lerp(-120, 100, ease(seg(lt, 0.8, 2.4)));
        o += `<circle cx="760" cy="540" r="250" fill="#fff"/><path d="M560,690 A250,250 0 0 1 960,690" fill="none" stroke="#E2556F" stroke-width="30" opacity=".5"/><line x1="760" y1="540" x2="${f1(760 + 200 * Math.sin(ang * Math.PI / 180))}" y2="${f1(540 - 200 * Math.cos(ang * Math.PI / 180))}" stroke="#2C1810" stroke-width="16" stroke-linecap="round"/><circle cx="760" cy="540" r="26" fill="#2C1810"/>${txt(760, 860, 'RISK', 40, '#fff', { ls: 8 })}`;
        o += phone(1300, 520, 1.2, txt(0, 8, '💸', 50, '#fff'));
      } else if (i === 2) { // shopping bags… trading to make it back
        o += grad('ev3', '#FDE8ED', '#F4C2CE') + bg('url(#ev3)');
        [[360, 800], [520, 820], [440, 700]].forEach(([x, y], j) => { o += scaleAt(x, y, pop(t, t0 + 0.2 + j * 0.3), `<path d="M${x - 80},${y - 90} L${x + 80},${y - 90} L${x + 100},${y + 80} L${x - 100},${y + 80} Z" fill="${['#F4829A', '#7F77DD', '#E2B04A'][j]}"/><path d="M${x - 40},${y - 90} q40,-60 80,0" fill="none" stroke="#2C1810" stroke-width="8"/>`); });
        o += monitor(860, 300, 700, 400, candles(890, 340, 640, 320, vals(8, 16, -0.01, 0.06, 0.6), 16));
        for (let j = 0; j < 4; j++) o += pill(1000 + j * 140, 790, j % 2 ? 'SELL' : 'BUY', j % 2 ? '#E2556F' : '#2AA594', pop(t, t0 + 1.4 + j * 0.4, 0.3), 26);
      } else { // can't afford a $0 day: forcing a trade
        o += grad('ev4', '#1D2433', '#34405A') + bg('url(#ev4)');
        o += `<rect x="300" y="250" width="420" height="440" rx="20" fill="#fff"/><rect x="300" y="250" width="420" height="90" rx="20" fill="#E2556F"/>${txt(510, 312, 'TODAY', 40, '#fff', { ls: 6 })}${bigNum(510, 560, '$0', 140, '#2C1810')}`;
        o += you(t, { x: 1200, y: 1040, scale: 1.25, flip: true, mood: 'sad', frontArm: { a1: -150 + Math.sin(t * 12) * 8, a2: -160 } });
        o += pill(1500, 560, 'BUY', '#2AA594', pop(t, t0 + 1.2), 60);
        o += thought(1200, 300, 'I can’t have a $0 day', pop(t, t0 + 2), { size: 38 });
      }
      o += txt(960, 1030, 'have you ever…', 40, i === 0 || i === 2 ? C.dark : '#fff', { f: 'Playfair Display', it: true, w: 700 });
      return fade(k, o);
    },

    // Night window. Rain eases. One question.
    'w11-window': (s, t) => {
      const B = s.b;
      let o = wall('w11p', '#1A1424', '#2A2142', 900, '#141026');
      const calm = seg(t, B.big + 2, B.big + 7);
      o += windowBox(660, 140, 600, 520, '#202A44', `<circle cx="1120" cy="260" r="50" fill="#F6E7C8" opacity="${f1(0.4 + 0.6 * calm)}"/>${rain(660, 600, 140, 660, t, Math.round(16 * (1 - calm)) + 1, '#7F92B8')}`);
      o += you(t, { x: 1420, y: 1010, scale: 1.25 });
      o += fade(seg(t, B.big + 4, B.big + 4.8), txt(760, 800, 'would you trade differently?', 56, '#F9D89A', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Weather: some days sun, some days rain, some days nothing to trade.
    'w11-weather': (s, t) => {
      const B = s.b;
      let o = grad('w11q', '#FDF8F5', '#EEEBFB') + bg('url(#w11q)');
      // a slow plant: income built over time
      const g = ease(seg(t, B.income, B.income + 4));
      o += fade(1 - seg(t, B.s1 - 0.4, B.s1), `<rect x="880" y="780" width="160" height="100" rx="14" fill="#C98B6B"/><path d="M960,780 L960,${f1(780 - 360 * g)}" stroke="#2AA594" stroke-width="14" stroke-linecap="round"/>${g > 0.3 ? coin(1010, 780 - 160 * g, 30) : ''}${g > 0.6 ? coin(910, 780 - 280 * g, 30) : ''}`);
      o += fade(seg(t, B.demand, B.demand + 0.5) * (1 - seg(t, B.s1 - 0.4, B.s1)), you(t, { x: 1400, y: 960, scale: 1.1, flip: true, frontArm: { a1: -130 + Math.sin(t * 10) * 15, a2: -160 }, mood: 'sad' }) + thought(1400, 360, 'grow. TODAY.', 1, { size: 40 }));
      const day = (x, at, inner, amt, col) => scaleAt(x, 540, pop(t, at, 0.5), `<rect x="${x - 230}" y="260" width="460" height="560" rx="36" fill="#fff"/>${inner}${amt}`);
      if (t > B.s1 - 0.4) {
        o += day(400, B.s1, sun(400, 460, 80, t), bigNum(400, 740, '+$', 80, '#2AA594'));
        o += day(960, B.s2, cloud(960, 440, 0.9, '#9AA3B8') + rain(820, 280, 500, 640, t, 8, '#7F92B8'), bigNum(960, 740, '−$', 80, '#E2556F'));
        o += day(1520, B.s3, cloud(1520, 460, 0.9, '#D9D2EA'), `<rect x="1440" y="660" width="160" height="100" rx="10" fill="#3A2F55"/><rect x="1420" y="760" width="200" height="14" rx="7" fill="#3A2F55"/>`);
      }
      return o;
    },

    // Trade the setup. Manage the risk. THEN the coins fall: the result, not the instruction.
    'w11-result': (s, t) => {
      const B = s.b;
      let o = grad('w11r', '#E6F5F2', '#FDF8F5') + bg('url(#w11r)');
      o += monitor(360, 200, 860, 500, candles(400, 260, 780, 380, [0.3, 0.32, 0.28, 0.34, 0.4, 0.38, 0.47, 0.55, 0.52, 0.62, 0.7, 0.68, 0.78, 0.84], Math.floor(4 + seg(t, B.e1, B.e3) * 10), { slots: 14 }));
      o += fade(seg(t, B.force, B.force + 0.4) * (1 - seg(t, B.resp, B.resp + 0.4)), you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, mood: 'sad', frontArm: { a1: -140 + Math.sin(t * 12) * 10, a2: -160 } }) + pill(790, 450, 'PAY ME', '#E2556F', 1, 60) + cross(1010, 400, pop(t, B.force + 2, 0.4), '#E2556F', 40));
      if (t > B.resp) {
        o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, frontArm: t > B.e1 && t < B.e2 ? { a1: -175, a2: -170 } : undefined });
        o += pill(400 + 5 * 780 / 14, 640, 'entry', '#2AA594', pop(t, B.e1, 0.4), 28);
        o += fade(seg(t, B.e2, B.e2 + 0.4), `<line x1="400" x2="1180" y1="640" y2="640" stroke="#E2556F" stroke-width="5" stroke-dasharray="14 10"/>`) + pill(1100, 670, 'stop', '#E2556F', pop(t, B.e2, 0.4), 24);
        const rainK = seg(t, B.e3, B.e3 + 1);
        if (rainK > 0) for (let j = 0; j < 14; j++) { const p = ((t - B.e3) * 0.5 + j * 0.13) % 1; o += coin(250 + (j * 137) % 1400, -60 + p * 1100, 22); }
      }
      o += fade(seg(t, B.e3 + 0.5, B.e3 + 1.1), `<rect x="0" y="790" width="1920" height="290" fill="#FDF8F5" opacity=".9"/>${txt(960, 890, 'Let the money be the result,', 62, C.dark, { f: 'Playfair Display', it: true })}${txt(960, 980, 'not the instruction.', 62, '#2AA594', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    /* ════ Psychology 2 · FOMO ═════════════════════════════════════════ */

    // Waiting: coffee steam, the clock creeping from :30 to :45, a flat chart.
    'w2-wait': (s, t) => {
      const B = s.b;
      let o = wall('w2a', '#3B2F55', '#2A2142', 900, '#1E1730');
      const m = 30 + Math.floor(seg(t, s.start, s.end) * 15);
      o += `<rect x="160" y="150" width="240" height="110" rx="20" fill="#120D1C"/>${bigNum(280, 228, '0:' + m, 60, '#F9D89A')}`;
      o += monitor(560, 180, 820, 480, candles(600, 250, 740, 340, flat(19, 28), 6 + Math.floor(seg(t, s.start, s.end) * 10), { slots: 28 }));
      o += you(t, { x: 1600, y: 1060, scale: 1.25, flip: true, frontArm: { a1: 160, a2: 150 } });
      o += desk(420, 860, 1500);
      o += `<rect x="1360" y="790" width="70" height="80" rx="10" fill="#fff"/><path d="M1430,810 q30,10 0,40" fill="none" stroke="#fff" stroke-width="8"/>`;
      for (let j = 0; j < 3; j++) { const p = (t * 0.5 + j / 3) % 1; o += `<path d="M${1380 + j * 15},${f1(780 - p * 90)} q10,-15 0,-30" stroke="#fff" stroke-width="5" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.6)}"/>`; }
      return o;
    },

    // She walks away. The chair spins empty. Behind her back, the screen takes off.
    'w2-away': (s, t) => {
      const B = s.b;
      let o = wall('w2b', '#3B2F55', '#2A2142', 900, '#1E1730');
      const run = [0.3, 0.32, 0.29, 0.31, 0.3, 0.32, 0.31, 0.3, 0.36, 0.44, 0.52, 0.6, 0.68, 0.75, 0.82, 0.88, 0.92];
      o += monitor(300, 180, 820, 480, candles(340, 250, 740, 340, run, 6 + Math.floor(seg(t, B.away + 1.5, s.end) * 11), { slots: 17 }));
      o += desk(160, 860, 1200);
      o += `<rect x="1380" y="300" width="240" height="560" rx="8" fill="#B27A5A"/><circle cx="1590" cy="590" r="12" fill="#F9D89A"/>`;
      const w = ease(seg(t, B.away, B.away + 3));
      o += you(t, { x: lerp(900, 1500, w), y: 1000, scale: 1.2, walking: w > 0 && w < 1, frontArm: { a1: -120, a2: -150 }, hold: `<rect x="-24" y="-60" width="48" height="84" rx="10" fill="#2C1810"/><rect x="-18" y="-52" width="36" height="66" rx="5" fill="#7F77DD"/>` });
      return o;
    },

    // Back at the desk: MOVED. She freezes. "damn. I missed it."
    'w2-moved': (s, t) => {
      const B = s.b;
      let o = wall('w2c', '#3B2F55', '#2A2142', 900, '#1E1730');
      const run = [0.3, 0.32, 0.29, 0.31, 0.3, 0.32, 0.31, 0.3, 0.36, 0.44, 0.52, 0.6, 0.68, 0.75, 0.82, 0.88, 0.92, 0.95];
      const zoom = 1 + 0.08 * ease(seg(t, B.moved, B.moved + 0.6));
      o += scaleAt(840, 420, zoom, monitor(430, 160, 820, 480, candles(470, 230, 740, 340, run, 18, { slots: 18 }) + `<line x1="${470 + 8 * 740 / 18}" x2="${470 + 8 * 740 / 18}" y1="230" y2="570" stroke="#2AA594" stroke-width="4" stroke-dasharray="10 8"/>`));
      o += pill(470 + 8 * 740 / 18, 610, 'your entry', '#2AA594', pop(t, B.missed + 1, 0.4), 24);
      o += desk(160, 860, 1700);
      o += you(t, { x: 1520, y: 1060, scale: 1.25, flip: true, mood: t > B.missed ? 'sad' : undefined, frontArm: t > B.missed ? { a1: -60, a2: -150 } : { a1: 160, a2: 150 } });
      o += thought(1500, 380, 'damn. I missed it.', between(t, B.missed + 0.3, s.end), { size: 44 });
      return o;
    },

    // The train is leaving. She runs down the platform after it.
    'w2-train': (s, t) => {
      const B = s.b;
      let o = grad('w2d', '#CFE3F2', '#F6EFEA') + bg('url(#w2d)') + `<rect y="720" width="1920" height="60" fill="#6B6B7B"/><rect y="780" width="1920" height="300" fill="#C9C2B8"/><rect y="780" width="1920" height="16" fill="#E2B04A"/>`;
      const tx = 700 + 1200 * Math.pow(seg(t, B.going, s.end), 1.6);
      for (let c = 0; c < 4; c++) { const x = tx - c * 380; o += `<rect x="${f1(x - 170)}" y="460" width="340" height="250" rx="${c === 0 ? 60 : 24}" fill="${c === 0 ? '#2AA594' : '#7ECFC0'}"/><rect x="${f1(x - 130)}" y="500" width="100" height="80" rx="10" fill="#E6F5F2"/><rect x="${f1(x + 10)}" y="500" width="100" height="80" rx="10" fill="#E6F5F2"/>${[-110, 110].map(d => `<circle cx="${f1(x + d)}" cy="715" r="28" fill="#2C1810"/>`).join('')}`; }
      o += txt(tx, 660, '▲ THE MOVE', 36, '#fff', { ls: 3 });
      const rx = 260 + 420 * seg(t, B.going + 1, s.end);
      o += you(t, { x: rx, y: 960, scale: 1.2, walking: true, frontArm: { a1: -10, a2: -20 } });
      ['still get in?', 'keep running?', 'don’t miss it!'].forEach((l, j) => { const at = B.going + 2 + j * 3; o += thought(rx + 180, 300, l, between(t, at, at + 2.6), { size: 40 }); });
      if (t > B.expensive) o += scaleAt(rx + 260, 520, pop(t, B.expensive, 0.5), `<g transform="rotate(-6 ${rx + 260} 520)"><rect x="${f1(rx + 150)}" y="470" width="220" height="100" rx="12" fill="#E2556F"/>${txt(rx + 260, 537, '$$$', 54, '#fff', { f: 'JetBrains Mono, monospace' })}</g>`);
      return o;
    },

    // A fork in the road. "missed it" is fine. What you do next is the real choice.
    'w2-fork': (s, t) => {
      const B = s.b;
      let o = grad('w2e', '#E6F5F2', '#FDF8F5') + bg('url(#w2e)') + `<rect y="620" width="1920" height="460" fill="#B9DDB0"/>`;
      o += `<path d="M900,1080 L1020,1080 L980,620 L940,620 Z" fill="#E8D5C4"/><path d="M960,640 Q700,560 300,520 L300,580 Q680,620 940,700 Z" fill="#E8D5C4"/><path d="M960,640 Q1220,560 1620,520 L1620,580 Q1240,620 980,700 Z" fill="#E8D5C4"/>`;
      o += you(t, { x: 960, y: 1000, scale: 1.2, frontArm: t > B.decide ? { a1: -40, a2: -40 } : undefined });
      o += fade(seg(t, B.problem + 2, B.problem + 2.6), `<rect x="280" y="380" width="260" height="90" rx="14" fill="#2AA594"/>${txt(410, 440, 'let it go', 36, '#fff')}<rect x="400" y="470" width="14" height="80" fill="#8B6A55"/>`);
      o += fade(seg(t, B.decide, B.decide + 0.5), `<rect x="1380" y="380" width="260" height="90" rx="14" fill="#E2556F"/>${txt(1510, 440, 'chase it', 36, '#fff')}<rect x="1500" y="470" width="14" height="80" fill="#8B6A55"/>`);
      o += thought(960, 330, 'missed one. okay.', between(t, B.problem + 0.5, B.decide - 0.2), { size: 40 });
      return o;
    },

    // Ghost money: bills float out of the chart into her head while she counts.
    'w2-ghost': (s, t) => {
      const B = s.b;
      let o = wall('w2f', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += monitor(220, 200, 760, 460, candles(260, 260, 680, 360, [0.2, 0.22, 0.21, 0.26, 0.34, 0.44, 0.54, 0.62, 0.7, 0.78, 0.84, 0.9], 12));
      o += you(t, { x: 1460, y: 1040, scale: 1.25, flip: true, frontArm: t > B.math ? { a1: -120 + Math.sin(t * 6) * 10, a2: -150 } : undefined });
      // first beat: setup crossed, money circled
      const a = between(t, B.notsetup, B.math - 0.2);
      o += scaleAt(1460, 300, a, cloud(1460, 300, 1.1, '#fff') + candles(1340, 250, 120, 80, [0.3, 0.4, 0.5, 0.6], 4) + cross(1420, 250, pop(t, B.notsetup + 1, 0.4), '#E2556F', 24) + (t > B.money ? coin(1560, 300, 40) : ''));
      // the math: bills flying from the chart into a growing pile in her head
      if (t > B.math) {
        const pile = seg(t, B.math, B.assign + 6);
        o += cloud(1460, 290, 1.2, '#fff');
        for (let j = 0; j < Math.floor(pile * 14); j++) o += `<rect x="${1360 + (j % 5) * 40}" y="${330 - Math.floor(j / 5) * 22}" width="70" height="34" rx="6" fill="#7CC79A" stroke="#2AA594" stroke-width="3" transform="rotate(${(j * 37) % 20 - 10} ${1395 + (j % 5) * 40} ${347 - Math.floor(j / 5) * 22})"/>`;
        for (let j = 0; j < 4; j++) { const p = ((t - B.math) * 0.6 + j * 0.25) % 1; o += `<rect x="${f1(lerp(800, 1400, p))}" y="${f1(lerp(320, 300, p) - Math.sin(p * Math.PI) * 160)}" width="70" height="34" rx="6" fill="#7CC79A" opacity="${f1(0.4 + 0.6 * Math.sin(p * Math.PI))}"/>`; }
        o += pill(600, 140, '+$300', '#2AA594', between(t, B.m1, B.m2 - 0.1), 40);
        o += pill(600, 140, '×4 = $600', '#2AA594', between(t, B.m2, B.m3 - 0.1), 40);
        o += fade(seg(t, B.m3, B.m3 + 0.6), `<line x1="950" x2="950" y1="${f1(640 - 360 * seg(t, B.m3, B.m3 + 1))}" y2="640" stroke="#F9D89A" stroke-width="8"/><path d="M930,${f1(660 - 360 * seg(t, B.m3, B.m3 + 1))} l20,-34 l20,34 z" fill="#F9D89A"/>`);
        o += fade(seg(t, B.assign + 2, B.assign + 2.6), txt(600, 760, 'a trade you never took', 40, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Magnifying glass → lasso. She stops looking for a setup and starts trying to rope the move.
    'w2-lasso': (s, t) => {
      const B = s.b;
      let o = grad('w2g', '#FFF4DE', '#F6E7DA') + bg('url(#w2g)') + `<rect y="860" width="1920" height="220" fill="#E8D5C4"/>`;
      const lasso = t > B.q2;
      // the running candle
      const cx = lasso ? 1300 + 220 * Math.sin((t - B.q2) * 1.2) : 1300, cy = 520;
      o += `<line x1="${f1(cx)}" x2="${f1(cx)}" y1="${cy - 230}" y2="${cy + 230}" stroke="#2AA594" stroke-width="10"/><rect x="${f1(cx - 60)}" y="${cy - 180}" width="120" height="360" rx="14" fill="#2AA594"/>`;
      if (lasso) for (let j = 0; j < 3; j++) o += `<line x1="${f1(cx + 90 + j * 20)}" x2="${f1(cx + 150 + j * 30)}" y1="${cy - 60 + j * 60}" y2="${cy - 60 + j * 60}" stroke="#2AA594" stroke-width="6" opacity=".5"/>`;
      o += you(t, { x: 480, y: 960, scale: 1.25, frontArm: lasso ? { a1: -100 + Math.sin(t * 8) * 30, a2: -140 } : { a1: -10, a2: -20 }, hold: lasso ? '' : `<circle cx="60" cy="-10" r="50" fill="#fff" opacity=".4" stroke="#2C1810" stroke-width="10"/><line x1="20" y1="20" x2="-10" y2="50" stroke="#2C1810" stroke-width="14" stroke-linecap="round"/>` });
      if (lasso) { const sw = (t - B.q2) * 6; o += `<ellipse cx="${f1(520 + 40 * Math.cos(sw))}" cy="${f1(560 + 15 * Math.sin(sw))}" rx="90" ry="30" fill="none" stroke="#C98A1F" stroke-width="8"/><path d="M560,680 Q${f1(800 + 100 * Math.sin(sw))},${f1(560)} ${f1(cx - 60)},${cy}" fill="none" stroke="#C98A1F" stroke-width="6" stroke-dasharray="${f1(800 * seg(t, B.q2 + 1, B.q2 + 3))} 900"/>`; }
      o += thought(480, 280, 'is my setup here?', between(t, B.q1, B.q2 - 0.2), { size: 40 });
      o += thought(560, 280, 'how do I get IN?', between(t, B.q2, B.recog - 0.2), { size: 40, col: '#E2556F' });
      o += fade(seg(t, B.recog + 2, B.recog + 2.6), pill(960, 1000, 'reacting to FOMO', '#E2556F', 1, 36));
      return o;
    },

    // Rollercoaster: she jumps on at the very top.
    'w2-coaster': (s, t) => {
      const B = s.b;
      let o = grad('w2h', '#CDEBF7', '#FDF8F5') + bg('url(#w2h)');
      const P = x => 920 - 420 * Math.sin(Math.min(Math.PI, x / 1600 * Math.PI)) * (x < 1000 ? 0.4 + 0.6 * x / 1000 : 1);
      let path = `M0,${f1(P(0))}`; for (let x = 0; x <= 1920; x += 40) path += ` L${x},${f1(P(x))}`;
      o += `<path d="${path} L1920,1080 L0,1080 Z" fill="#B9DDB0"/><path d="${path}" fill="none" stroke="#E2556F" stroke-width="14"/>`;
      for (let x = 80; x < 1920; x += 160) o += `<line x1="${x}" x2="${x}" y1="${f1(P(x))}" y2="1080" stroke="#E2556F" stroke-width="6" opacity=".4"/>`;
      const cart = 200 + 1000 * seg(t, s.start, B.never + 1);
      o += `<rect x="${f1(cart - 60)}" y="${f1(P(cart) - 60)}" width="120" height="60" rx="14" fill="#7F77DD"/>`;
      o += fade(seg(t, B.watch, B.watch + 0.5), pill(260, P(260) + 70, 'the beginning', '#2AA594', 1, 28));
      const jump = seg(t, B.never, B.never + 1.5), top = 1000;
      const hx = lerp(1300, top, ease(jump));
      o += you(t, { x: hx, y: P(hx) - Math.sin(jump * Math.PI) * 120, scale: 0.8, flip: true, walking: jump > 0 && jump < 1 });
      o += fade(seg(t, B.never + 1.5, B.never + 2), pill(top, P(top) - 320, 'ME, at the top', '#E2556F', 1, 30));
      return o;
    },

    // The slot machine pays out… and her brain files it as proof.
    'w2-slot': (s, t) => {
      const B = s.b;
      let o = grad('w2i', '#2B2752', '#5B4E9A') + bg('url(#w2i)');
      o += `<rect x="560" y="200" width="560" height="700" rx="40" fill="#E2556F"/><rect x="620" y="300" width="440" height="200" rx="20" fill="#fff"/><rect x="1120" y="360" width="30" height="200" rx="15" fill="#B8B3C9"/><circle cx="1135" cy="350" r="34" fill="#F9D89A"/>`;
      const spin = t < B.works + 1.5;
      ['🍒', '7', '💰'].forEach((g, j) => { const sym = spin ? ['🍒', '7', '💰', '🍋'][Math.floor(t * 12 + j) % 4] : '💰'; o += txt(700 + j * 140, 430, sym, 90, C.dark); });
      if (!spin && t < B.worse + 1) for (let j = 0; j < 10; j++) { const p = ((t - B.works - 1.5) * 0.8 + j * 0.1) % 1; o += coin(700 + (j * 73) % 300, 900 + p * 200, 26); }
      o += you(t, { x: 1500, y: 1040, scale: 1.25, flip: true, frontArm: t > B.works + 1.5 && t < B.worse ? { a1: -160, a2: -170 } : undefined });
      o += scaleAt(1500, 300, pop(t, B.evidence, 0.5) * (1 - seg(t, B.next - 0.3, B.next)), cloud(1500, 300, 1, '#fff') + `<g transform="rotate(-6 1500 300)"><rect x="1400" y="250" width="200" height="100" rx="12" fill="#F9D89A"/>${txt(1500, 315, 'PROOF', 40, '#7A4E0F', { ls: 4 })}</g>`);
      o += thought(1500, 300, '“last time it still went”', between(t, B.next, s.end), { size: 36 });
      return o;
    },

    // Two crossings: one runs the red light and makes it; one waits for green and still gets splashed.
    'w2-crosswalk': (s, t) => {
      const B = s.b;
      let o = grad('w2j', '#E9E1F5', '#FDF8F5') + bg('url(#w2j)') + `<rect y="700" width="1920" height="380" fill="#6B6B7B"/>`;
      for (let x = 100; x < 1900; x += 120) o += `<rect x="${x}" y="860" width="70" height="20" fill="#fff" opacity=".8"/>`;
      o += `<line x1="960" x2="960" y1="0" y2="1080" stroke="#fff" stroke-width="10"/>`;
      // left: red light, she darts, coin
      const L = seg(t, B.bad, B.bad + 2.5);
      o += `<rect x="200" y="200" width="80" height="200" rx="16" fill="#2C1810"/><circle cx="240" cy="250" r="26" fill="#E2556F"/><circle cx="240" cy="340" r="26" fill="#3A3A3A"/><rect x="232" y="400" width="16" height="300" fill="#2C1810"/>`;
      o += you(t, { x: lerp(380, 820, ease(L)), y: 1000, scale: 0.95, walking: L > 0 && L < 1 });
      if (L >= 1) o += coin(820, 560, 40) + check(900, 520, 1, '#2AA594', 26);
      o += fade(seg(t, B.bad + 1, B.bad + 1.5), pill(480, 160, 'made money · bad decision', '#E2556F', 1, 28));
      // right: green light, she waits, still loses
      const R = seg(t, B.good, B.good + 2.5);
      o += `<rect x="1640" y="200" width="80" height="200" rx="16" fill="#2C1810"/><circle cx="1680" cy="250" r="26" fill="#3A3A3A"/><circle cx="1680" cy="340" r="26" fill="#2AA594"/><rect x="1672" y="400" width="16" height="300" fill="#2C1810"/>`;
      o += you(t, { x: lerp(1060, 1480, ease(R)), y: 1000, scale: 0.95, walking: R > 0 && R < 1, mood: R >= 1 ? 'sad' : undefined });
      if (R >= 0.7) o += `<path d="M1300,960 q60,-120 120,-40 q40,-80 100,20" fill="#7FB8D6" opacity=".7"/>`;
      if (R >= 1) o += cross(1560, 520, 1, '#E2556F', 26);
      o += fade(seg(t, B.good + 1, B.good + 1.5), pill(1440, 160, 'lost money · good decision', '#2AA594', 1, 28));
      o += fade(seg(t, B.one, B.one + 0.5) * (1 - seg(t, B.bad - 0.3, B.bad)), txt(960, 560, 'outcome ≠ execution', 70, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Money balloons. She lets go of the strings; they drift off.
    'w2-balloons': (s, t) => {
      const B = s.b;
      let o = grad('w2k', '#CDEBF7', '#FDF8F5') + bg('url(#w2k)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      const go = ease(seg(t, B.never, B.never + 4));
      o += you(t, { x: 960, y: 960, scale: 1.3, frontArm: { a1: -110 + go * 80, a2: -120 + go * 80 } });
      for (let j = 0; j < 6; j++) {
        const bx = 900 + (j - 2.5) * 70 + go * (j - 2.5) * 120, by = 330 - j % 2 * 60 - go * (500 + j * 60);
        o += `<path d="M1000,${f1(640 + go * 300)} Q${f1(bx)},${f1(by + 200)} ${f1(bx)},${f1(by + 80)}" fill="none" stroke="#8B6A55" stroke-width="3" opacity="${f1(1 - go)}"/><ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="60" ry="76" fill="${['#7CC79A', '#E2B04A', '#7CC79A', '#E2B04A', '#7CC79A', '#E2B04A'][j]}"/>${txt(bx, by + 16, '$', 50, '#fff')}`;
      }
      o += fade(seg(t, B.never + 1, B.never + 1.6), txt(960, 200, 'that money was never yours', 60, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Her setup is a puzzle piece. Distracting voices pop. Does the piece fit right now?
    'w2-puzzle': (s, t) => {
      const B = s.b;
      let o = grad('w2l', '#EEEBFB', '#FDF8F5') + bg('url(#w2l)');
      o += `<rect x="280" y="220" width="900" height="560" rx="30" fill="#120D1C"/>${candles(310, 260, 840, 480, vals(15, 22, 0.012, 0.05, 0.4), 22)}`;
      const piece = (x, y, col) => `<path d="M${x},${y} h60 a30,30 0 1 1 60,0 h60 v60 a30,30 0 1 0 0,60 v60 h-180 Z" fill="${col}"/>`;
      o += `<rect x="760" y="420" width="180" height="180" fill="none" stroke="#F9D89A" stroke-width="5" stroke-dasharray="12 10"/>`;
      const tryIt = seg(t, B.exist, B.exist + 1.5), px = lerp(1380, 800, ease(tryIt)) + (tryIt >= 1 ? Math.sin(t * 20) * 8 : 0);
      o += `<g transform="rotate(${tryIt >= 1 ? 25 : 0} ${px + 90} 510)">${piece(px, 420, '#2AA594')}</g>`;
      o += fade(seg(t, B.system, B.system + 0.4), txt(1470, 380, 'my setup', 32, '#2AA594', { w: 800 }));
      o += you(t, { x: 1560, y: 1000, scale: 1.15, flip: true, frontArm: { a1: -170, a2: -170 } });
      [[B.n1, 'justify it?', 380, 160], [B.n2, 'it’ll keep running!', 820, 120], [B.n3, '30 more points!', 1260, 160]].forEach(([at, l, x, y]) => { const k = pop(t, at, 0.4), popped = seg(t, at + 1.8, at + 2.1); if (k > 0 && popped < 1) o += fade(1 - popped, scaleAt(x, y, 1 + popped * 0.5, thought(x, y, l, k, { size: 32, col: '#E2556F' }))); });
      if (tryIt >= 1) o += fade(seg(t, B.exist + 1.6, B.exist + 2), pill(870, 860, 'not here. not now.', '#E2556F', 1, 34));
      return o;
    },

    // Bus stop: one bus pulls away. She doesn't jump on just any bus. Hers comes later.
    'w2-bus': (s, t) => {
      const B = s.b;
      let o = grad('w2m', '#FFE7C7', '#FDF8F5') + bg('url(#w2m)') + `<rect y="760" width="1920" height="320" fill="#8C8C9C"/><rect y="760" width="1920" height="40" fill="#C9C2B8"/>`;
      o += `<rect x="1500" y="420" width="14" height="340" fill="#2C1810"/><rect x="1440" y="380" width="140" height="70" rx="12" fill="#2AA594"/>${txt(1510, 428, 'MY BUS', 26, '#fff', { ls: 2 })}`;
      const bus = (x, col, label) => `<rect x="${f1(x - 260)}" y="520" width="520" height="240" rx="36" fill="${col}"/>${[0, 1, 2, 3].map(i => `<rect x="${f1(x - 230 + i * 120)}" y="550" width="100" height="80" rx="10" fill="#E6F5F2"/>`).join('')}<circle cx="${f1(x - 160)}" cy="770" r="34" fill="#2C1810"/><circle cx="${f1(x + 160)}" cy="770" r="34" fill="#2C1810"/>${txt(x, 710, label, 34, '#fff', { ls: 2 })}`;
      const b1 = seg(t, s.start, B.later + 2);
      if (b1 < 1) o += bus(lerp(800, 2300, ease(b1)), '#9AA3B8', 'MISSED');
      const b2 = seg(t, B.lower, B.lower + 2);
      if (b2 > 0 && b2 < 1) o += bus(lerp(-300, 700, ease(b2)) + (b2 > 0.5 ? 0 : 0), '#E2556F', 'ANY BUS');
      if (b2 >= 1) o += bus(lerp(700, 2400, seg(t, B.lower + 2, B.lower + 4)), '#E2556F', 'ANY BUS');
      const b3 = seg(t, s.end - 4, s.end - 1.5);
      if (b3 > 0) o += bus(lerp(-300, 1000, ease(b3)), '#2AA594', 'MY SETUP');
      o += you(t, { x: 1300, y: 1000, scale: 1.2, flip: true, frontArm: b2 > 0 && b2 < 1 ? { a1: 90, a2: 90 } : { a1: 100, a2: 95 } });
      o += fade(seg(t, B.merit, B.merit + 0.4) * (1 - seg(t, B.lower, B.lower + 0.4)), thought(1300, 300, 'it has to be mine', 1, { size: 40 }));
      o += thought(1300, 300, 'nope.', between(t, B.lower + 0.8, B.lower + 3), { size: 44 });
      return o;
    },

    // Hand off the mouse. Literally. Sit back.
    'w2-hands': (s, t) => {
      const B = s.b;
      let o = grad('w2n', '#E6F5F2', '#FDF8F5') + bg('url(#w2n)');
      const lift = ease(seg(t, B.lit, B.lit + 0.8)), sit = ease(seg(t, B.sit, B.sit + 0.8));
      o += `<rect x="0" y="760" width="1920" height="320" fill="#E8D5C4"/><ellipse cx="960" cy="800" rx="110" ry="70" fill="#fff" stroke="#B8B3C9" stroke-width="6"/><line x1="960" y1="730" x2="960" y2="790" stroke="#B8B3C9" stroke-width="5"/><path d="M960,730 C960,640 1100,660 1120,560" stroke="#B8B3C9" stroke-width="6" fill="none"/>`;
      const hy = 760 - lift * 380, hx = 960 + lift * 260;
      o += fade(1 - sit, `<g transform="translate(${f1(hx)},${f1(hy)}) rotate(${f1(-lift * 25)})"><rect x="-80" y="-60" width="160" height="110" rx="50" fill="#9A6244"/>${[0, 1, 2, 3].map(i => `<rect x="${-72 + i * 38}" y="-110" width="32" height="80" rx="16" fill="#9A6244"/>`).join('')}<rect x="-60" y="40" width="120" height="300" rx="40" fill="#F4829A"/></g>`);
      const chant = t > B.hand && t < B.lit ? Math.floor((t - B.hand) * 1.4) % 3 : -1;
      if (chant >= 0) ['I need to get in', 'I need to get in!', 'I NEED TO GET IN'].forEach((l, j) => { if (j <= chant) o += thought(560 + j * 400, 220 + (j % 2) * 120, l, 1, { size: 34 + j * 4 }); });
      if (sit > 0) {
        o += fade(sit, `<rect x="1360" y="520" width="260" height="300" rx="30" fill="#7F77DD"/><rect x="1340" y="760" width="300" height="60" rx="20" fill="#5A4C9A"/>`) + fade(sit, you(t, { x: 1490, y: 900, scale: 1, frontArm: { a1: 60, a2: 30 } }));
        o += thought(1100, 280, 'what am I waiting to see?', between(t, B.ask, s.end), { size: 40 });
        o += fade(seg(t, B.cant + 2, B.cant + 2.6), pill(800, 520, 'no answer? don’t click.', '#E2556F', 1, 36));
      }
      return o;
    },

    // The rule: two receipts. Missing a trade: $0. Chasing one: −$$$.
    'w2-rule': (s, t) => {
      const B = s.b;
      let o = grad('w2o', '#EEEBFB', '#DDF1EE') + bg('url(#w2o)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 255, 'If my entry is gone, the trade is gone.', 72, C.dark, { f: 'Playfair Display' }));
      // a train door closing on the original trade; a new train later
      const shut = ease(seg(t, B.r1, B.r1 + 1));
      o += fade(1 - seg(t, B.line - 0.3, B.line), `<rect x="560" y="380" width="800" height="400" rx="30" fill="#7ECFC0"/><rect x="${f1(760 - 200 * (1 - shut))}" y="440" width="${f1(200 * (1 - shut) + 0)}" height="340" fill="#E6F5F2"/><rect x="760" y="440" width="${f1(400 * shut)}" height="340" fill="#5FB5A8"/><line x1="960" x2="960" y1="440" y2="780" stroke="#2C1810" stroke-width="${shut >= 1 ? 6 : 0}"/>${txt(960, 860, 'the original trade', 34, C.muted, { w: 700 })}`);
      o += fade(seg(t, B.r2, B.r2 + 0.5) * (1 - seg(t, B.line - 0.3, B.line)), pill(1580, 600, 'new setup? judge it fresh', '#2AA594', 1, 28));
      const fin = seg(t, B.line - 0.3, B.line + 0.3);
      if (fin > 0) {
        const rc = (x, title, amt, col, k) => scaleAt(x, 640, k, `<g transform="rotate(${x < 960 ? -3 : 3} ${x} 640)"><rect x="${x - 260}" y="400" width="520" height="480" rx="12" fill="#fff"/>${[...Array(10)].map((_, i) => `<path d="M${x - 260 + i * 52},880 l26,24 l26,-24" fill="#fff"/>`).join('')}${txt(x, 480, 'RECEIPT', 28, C.muted, { ls: 6 })}${txt(x, 580, title, 44, C.dark, { f: 'Playfair Display', it: true })}<line x1="${x - 200}" x2="${x + 200}" y1="640" y2="640" stroke="#E6DDD3" stroke-width="4" stroke-dasharray="10 8"/>${txt(x, 780, amt, 110, col, { f: 'JetBrains Mono, monospace' })}</g>`);
        o += rc(620, 'missing a trade', '$0', '#2AA594', fin * pop(t, B.line + 0.2, 0.6));
        o += rc(1300, 'chasing one', '−$$$', '#E2556F', pop(t, B.line + 2.2, 0.6));
      }
      return o;
    },

    // A curtain slides over the move you saw. Would you still take that entry?
    'w2-curtain': (s, t) => {
      const B = s.b;
      let o = wall('w2p', '#1A1424', '#2A2142', 920, '#141026');
      const series = [0.15, 0.17, 0.16, 0.22, 0.3, 0.4, 0.5, 0.58, 0.66, 0.74, 0.8, 0.85, 0.82];
      o += `<rect x="360" y="200" width="1200" height="580" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="8"/>${candles(390, 240, 1140, 500, series, 13, { slots: 13 })}`;
      o += pill(390 + 11 * 1140 / 13, 200, 'your entry', '#E2556F', pop(t, B.what, 0.4), 26);
      o += thought(1700, 420, 'setup?', between(t, B.q1, B.q2 - 0.2), { size: 40 });
      o += thought(1700, 420, 'or just… uneasy?', between(t, B.q2, B.bigq - 0.2), { size: 36 });
      const cov = ease(seg(t, B.big + 1, B.big + 2.5));
      o += `<rect x="380" y="200" width="${f1(860 * cov)}" height="580" fill="#7F3A5A"/>${[...Array(8)].map((_, i) => `<line x1="${f1(380 + i * 110 * cov)}" x2="${f1(380 + i * 110 * cov)}" y1="200" y2="780" stroke="#5A2A44" stroke-width="10" opacity="${f1(cov)}"/>`).join('')}<rect x="360" y="180" width="1220" height="30" rx="10" fill="#C98A1F"/>`;
      o += fade(seg(t, B.big + 3, B.big + 3.6), txt(960, 900, 'still take it?', 60, '#F9D89A', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The station: trains keep coming. She waits calmly for hers.
    'w2-station': (s, t) => {
      const B = s.b;
      let o = grad('w2q', '#FFE7C7', '#FDF8F5') + bg('url(#w2q)') + `<rect y="720" width="1920" height="60" fill="#6B6B7B"/><rect y="780" width="1920" height="300" fill="#C9C2B8"/><rect y="780" width="1920" height="16" fill="#E2B04A"/>`;
      const train = (x, col) => [0, 1, 2].map(c => `<rect x="${f1(x - c * 380 - 170)}" y="460" width="340" height="250" rx="${c === 0 ? 60 : 24}" fill="${col}"/><rect x="${f1(x - c * 380 - 130)}" y="500" width="100" height="80" rx="10" fill="#fff" opacity=".8"/><rect x="${f1(x - c * 380 + 10)}" y="500" width="100" height="80" rx="10" fill="#fff" opacity=".8"/>`).join('');
      const tt = (t - B.g1) * 300;
      o += train(((tt) % 3600) - 400, '#B8B3C9') + (t > B.always ? train((((t - B.always) * 420) % 3600) - 600, '#CFC8FA') : '');
      o += you(t, { x: 1500, y: 960, scale: 1.2, flip: true });
      o += fade(seg(t, B.g1, B.g1 + 0.5) * (1 - seg(t, B.g2, B.g2 + 0.4)), txt(960, 200, 'not every move', 56, C.muted, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.g2, B.g2 + 0.5) * (1 - seg(t, B.last - 0.3, B.last)), txt(960, 200, 'your moves', 70, '#2AA594', { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.always + 1, B.always + 1.5) * (1 - seg(t, B.last - 0.3, B.last)), pill(960, 320, 'there’s always another one', '#7F77DD', 1, 34));
      o += fade(seg(t, B.last, B.last + 0.6), `<rect x="0" y="120" width="1920" height="260" fill="#FDF8F5" opacity=".85"/>${txt(960, 230, 'You don’t have to turn every move you see', 54, C.dark, { f: 'Playfair Display', it: true })}${txt(960, 320, 'into a trade you take.', 60, '#E2556F', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    /* ════ Psychology 3 · Revenge Trading ══════════════════════════════ */

    // Clipboard: four ticks, done right. Then the trade goes red anyway.
    'w3-plan': (s, t) => {
      const B = s.b;
      let o = wall('w3a', '#FDF8F5', '#F3E7DD', 880, '#D9C3B0');
      o += `<rect x="260" y="220" width="460" height="600" rx="24" fill="#C98B6B"/><rect x="290" y="270" width="400" height="530" rx="12" fill="#fff"/><rect x="400" y="200" width="180" height="60" rx="16" fill="#8B6A55"/>`;
      ['⌛', '🔍', '🎯', '🛑'].forEach((e, j) => { const y = 350 + j * 115, at = B.plan + j * 1.6; o += txt(360, y + 18, e, 50, C.dark) + `<rect x="430" y="${y - 6}" width="${f1(170 * seg(t, at, at + 0.6))}" height="16" rx="8" fill="#EADFD8"/>` + check(640, y, pop(t, at + 0.4, 0.4), '#2AA594', 30); });
      o += `<rect x="900" y="260" width="760" height="460" rx="28" fill="#120D1C"/>${candles(930, 300, 700, 380, [0.5, 0.52, 0.5, 0.56, 0.6, 0.55, 0.48, 0.4, 0.33], Math.floor(4 + seg(t, B.plan, B.lost) * 5), { slots: 9 })}`;
      if (t > B.lost) o += scaleAt(1280, 640, pop(t, B.lost, 0.5), `<rect x="1080" y="590" width="400" height="100" rx="20" fill="#E2556F"/>${bigNum(1280, 662, 'STOPPED', 50, '#fff')}`);
      o += you(t, { x: 820, y: 1000, scale: 1.1, mood: t > B.lost ? 'sad' : undefined });
      return o;
    },

    // The red number lights her face.
    'w3-red': (s, t) => {
      const B = s.b;
      let o = bg('#1A0F14');
      o += `<ellipse cx="960" cy="600" rx="700" ry="420" fill="#E2556F" opacity="${f1(0.12 + 0.05 * Math.sin(t * 3))}"/>`;
      o += scaleAt(960, 330, 1 + 0.02 * Math.sin(t * 4), bigNum(960, 380, '−$200', 170, '#FF6F8A'));
      o += you(t, { x: 960, y: 1080, scale: 1.4, mood: 'sad' });
      o += thought(1350, 560, 'damn.', pop(t, B.red + 2, 0.5), { size: 50 });
      return o;
    },

    // Boxing gloves on. A punching bag called THE MARKET.
    'w3-gloves': (s, t) => {
      const B = s.b;
      let o = wall('w3b', '#3A1420', '#5A2233', 880, '#2A0F18');
      const swing = t > B.back ? Math.sin(t * 9) : 0;
      o += `<line x1="1300" y1="0" x2="1300" y2="200" stroke="#B8B3C9" stroke-width="8"/><g transform="rotate(${f1(swing * 6)} 1300 200)"><rect x="1190" y="200" width="220" height="520" rx="100" fill="#7F3A5A"/>${txt(1300, 480, 'THE', 36, '#fff', { ls: 4 })}${txt(1300, 530, 'MARKET', 36, '#fff', { ls: 4 })}</g>`;
      const glove = `<ellipse cx="0" cy="0" rx="46" ry="40" fill="#E2556F"/><rect x="-30" y="26" width="60" height="30" rx="8" fill="#fff"/>`;
      const punch = Math.max(0, swing);
      o += you(t, { x: 760, y: 980, scale: 1.3, frontArm: t > B.back ? { a1: -10 + punch * 10, a2: -10 } : { a1: 100, a2: 95 }, backArm: t > B.back ? { a1: -40, a2: -100 } : undefined, hold: t > B.five + 2 ? glove : '' });
      o += fade(seg(t, B.five, B.five + 0.5), `<rect x="200" y="160" width="420" height="240" rx="20" fill="#120D1C"/>${candles(220, 190, 380, 180, [0.3, 0.25, 0.3, 0.38, 0.46, 0.55], Math.floor(2 + seg(t, B.five, B.back) * 4))}`);
      o += thought(760, 300, 'I can make that back.', between(t, B.back + 0.3, s.end), { size: 40 });
      return o;
    },

    // Caution tape across the screen. She holds a sign: WHY?
    'w3-tape': (s, t) => {
      const B = s.b;
      let o = wall('w3c', '#FFF4DE', '#F6E7DA', 880, '#E8D5C4');
      o += monitor(560, 200, 800, 460, candles(600, 260, 720, 340, vals(7, 18, 0.01, 0.05, 0.4), 18));
      const tape = (y, rot, k) => `<g transform="rotate(${rot} 960 ${y})"><rect x="${f1(960 - 1200 * k)}" y="${y - 40}" width="${f1(2400 * k)}" height="80" fill="#F9D89A"/>${[...Array(14)].map((_, i) => `<path d="M${f1(-300 + i * 180)},${y - 40} l60,0 l-60,80 l-60,0 z" fill="#2C1810" opacity="${f1(k)}"/>`).join('')}</g>`;
      o += tape(420, -8, ease(seg(t, B.careful, B.careful + 0.8))) + tape(500, 6, ease(seg(t, B.careful + 0.5, B.careful + 1.3)));
      o += fade(seg(t, B.notauto, B.notauto + 0.5) * (1 - seg(t, B.why - 0.3, B.why)), pill(960, 800, 'another trade ≠ revenge (by itself)', '#2AA594', 1, 32));
      if (t > B.why - 0.3) {
        o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, frontArm: { a1: -100, a2: -140 } });
        o += scaleAt(1390, 400, pop(t, B.why, 0.5), `<rect x="1386" y="420" width="10" height="200" fill="#8B6A55"/><rect x="1240" y="300" width="300" height="140" rx="16" fill="#fff" stroke="#2C1810" stroke-width="6"/>${txt(1390, 400, 'WHY?', 70, '#E2556F')}`);
      }
      return o;
    },

    // The loss becomes a shadow behind her. Its hands creep to the size dial and the mouse.
    'w3-shadow': (s, t) => {
      const B = s.b;
      let o = wall('w3d', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += monitor(300, 200, 700, 420, candles(340, 260, 620, 300, vals(9, 16, 0.006, 0.05, 0.4), 16)) + desk(160, 860, 1100);
      const grow = ease(seg(t, B.isnt, B.infl + 2));
      o += `<g opacity="${f1(0.25 + 0.35 * grow)}"><ellipse cx="1420" cy="${f1(560 - grow * 60)}" rx="${f1(170 + grow * 80)}" ry="${f1(330 + grow * 80)}" fill="#120A18"/><circle cx="1380" cy="${f1(330 - grow * 60)}" r="10" fill="#E2556F"/><circle cx="1450" cy="${f1(330 - grow * 60)}" r="10" fill="#E2556F"/></g>`;
      o += you(t, { x: 1300, y: 1060, scale: 1.25, flip: true, mood: 'sad', frontArm: { a1: 160, a2: 150 } });
      const icons = [['🎚️', 600, 800, 'size'], ['⚡', 820, 800, 'faster'], ['🔍', 380, 800, 'standards']];
      icons.forEach(([e, x, y, l], j) => { const k = pop(t, B.infl + 0.6 + j * 0.9, 0.5); if (k <= 0) return; o += scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="52" fill="#3A2F55" stroke="#E2556F" stroke-width="5"/>${txt(x, y + 18, e, 46, '#fff')}`) + `<path d="M${1250},${f1(500)} Q${(x + 1250) / 2},${300} ${x},${y - 60}" fill="none" stroke="#120A18" stroke-width="18" stroke-linecap="round" opacity="${f1(0.6 * k)}"/>`; });
      return o;
    },

    // A giant eraser scrubbing the red number, never quite clean.
    'w3-eraser': (s, t) => {
      const B = s.b;
      let o = grad('w3e', '#FDF8F5', '#FDE8ED') + bg('url(#w3e)');
      const rub = t > B.erase ? Math.sin((t - B.erase) * 7) * 260 * seg(t, B.erase, B.erase + 0.6) : 0;
      o += bigNum(960, 520, '−$100', 220, '#E2556F');
      o += fade(seg(t, B.erase, B.erase + 0.5), `<g transform="translate(${f1(960 + rub)},${f1(470 + Math.abs(rub) * 0.05)}) rotate(-18)"><rect x="-140" y="-70" width="280" height="140" rx="20" fill="#F4829A"/><rect x="-140" y="10" width="280" height="60" rx="12" fill="#7F77DD"/></g>`);
      for (let j = 0; j < 8; j++) { const p = ((t * 1.4) + j * 0.13) % 1; if (t > B.erase + 0.6) o += `<circle cx="${f1(960 + rub + (j - 4) * 30)}" cy="${f1(620 + p * 300)}" r="8" fill="#F4829A" opacity="${f1(1 - p)}"/>`; }
      o += you(t, { x: 300, y: 1060, scale: 1.1, mood: 'sad' });
      o += fade(seg(t, B.bothers, B.bothers + 0.5), pill(960, 820, 'it bothers you', '#2C1810', 1, 34));
      return o;
    },

    // Scoreboard: +$400 becomes +$300. Then 0 becomes −$300.
    'w3-score': (s, t) => {
      const B = s.b;
      let o = grad('w3f', '#1D2433', '#34405A') + bg('url(#w3f)');
      o += `<rect x="460" y="160" width="1000" height="420" rx="30" fill="#120D1C" stroke="#3A2F55" stroke-width="12"/>`;
      let val, col;
      if (t < B.d300) { const k = seg(t, B.u400 + 0.5, B.u400 + 2); val = Math.round(400 - 100 * k); col = '#2AA594'; }
      else { const k = seg(t, B.d300 + 0.5, B.d300 + 2.5); val = -Math.round(300 * k); col = val < 0 ? '#FF6F8A' : '#fff'; }
      o += bigNum(960, 420, (val >= 0 ? '+$' : '−$') + Math.abs(val), 170, col);
      o += you(t, { x: 960, y: 1060, scale: 1.25, mood: 'sad' });
      o += thought(1450, 700, 'my $100 back', between(t, B.u400 + 2.5, B.d300 - 0.2), { size: 40 });
      o += thought(1450, 700, 'one good trade', between(t, B.d300 + 3, s.end), { size: 40 });
      return o;
    },

    // GPS: "Rerouting… to where you were."
    'w3-gps': (s, t) => {
      const B = s.b;
      let o = grad('w3g', '#E9E1F5', '#FDF8F5') + bg('url(#w3g)');
      o += `<rect x="460" y="140" width="1000" height="700" rx="50" fill="#2C1810"/><rect x="500" y="180" width="920" height="560" rx="24" fill="#DDF1EE"/>`;
      o += `<path d="M560,640 C760,560 760,400 960,380 S1200,300 1360,240" fill="none" stroke="#fff" stroke-width="40"/><path d="M560,640 C760,560 760,400 960,380" fill="none" stroke="#2AA594" stroke-width="16"/>`;
      const re = seg(t, B.getback, B.getback + 1.2);
      o += fade(re, `<path d="M960,380 C900,500 700,560 600,700" fill="none" stroke="#E2556F" stroke-width="16" stroke-dasharray="20 14"/><circle cx="600" cy="700" r="24" fill="#E2556F"/>`);
      o += `<circle cx="960" cy="380" r="26" fill="#7F77DD" stroke="#fff" stroke-width="8"/>`;
      o += `<rect x="500" y="680" width="920" height="60" rx="0" fill="#2C1810" opacity=".85"/>${txt(960, 722, re > 0.3 ? 'rerouting… to where you were' : 'what’s actually happening →', 32, re > 0.3 ? '#FF8DA3' : '#7ECFC0', { w: 800 })}`;
      return o;
    },

    // The market has headphones on. It has no idea about your last trade.
    'w3-headphones': (s, t) => {
      const B = s.b;
      let o = grad('w3h', '#FFF4DE', '#FDE8ED') + bg('url(#w3h)');
      const bob = Math.sin(t * 4) * 8;
      o += `<g transform="translate(0,${f1(bob)})"><rect x="660" y="260" width="600" height="420" rx="40" fill="#120D1C"/>${candles(700, 310, 520, 300, vals(44, 14, 0.004, 0.05, 0.5), 14)}<path d="M640,470 C640,140 1280,140 1280,470" fill="none" stroke="#2C1810" stroke-width="30"/><rect x="600" y="400" width="80" height="150" rx="30" fill="#E2556F"/><rect x="1240" y="400" width="80" height="150" rx="30" fill="#E2556F"/></g>`;
      for (let j = 0; j < 3; j++) { const p = (t * 0.6 + j / 3) % 1; o += txt(1420 + p * 120, 360 - p * 160, '♪', 60, '#7F77DD', { op: f1(1 - p) }); }
      o += you(t, { x: 300, y: 1000, scale: 1.1, mood: 'sad', frontArm: { a1: -40, a2: -60 } });
      o += thought(380, 360, 'I just lost!', pop(t, B.know + 0.8, 0.5), { size: 40 });
      return o;
    },

    // Not button-mashing. Three quiet dials slide: wait → quicker, clean → make it work, normal → bigger.
    'w3-dials': (s, t) => {
      const B = s.b;
      let o = grad('w3i', '#F3E3D6', '#FBF4EF') + bg('url(#w3i)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.s1 && t < B.s3 + 4 ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const mash = between(t, B.dramatic + 1, B.subtle - 0.2);
      if (mash > 0) {
        for (let i = 0; i < 8; i++) { const x = 760 + (i % 4) * 260, y = 300 + Math.floor(i / 4) * 240, hit = Math.sin(t * 16 + i * 1.7) > 0.5; o += fade(mash, `<rect x="${x}" y="${y + (hit ? 12 : 0)}" width="200" height="${hit ? 110 : 122}" rx="24" fill="${i % 2 ? '#2AA594' : '#E2556F'}"/>${txt(x + 100, y + 76, i % 2 ? 'BUY' : 'SELL', 36, '#fff')}`); }
        o += cross(1280, 860, mash * pop(t, B.slam + 2, 0.4), '#E2556F', 50);
      }
      const sub = seg(t, B.subtle, B.subtle + 0.5);
      if (sub > 0) {
        [[B.s1, '⌛', 'patience'], [B.s2, '🔍', 'standards'], [B.s3, '🎚️', 'size']].forEach(([at, e, l], j) => {
          const y = 320 + j * 230, sl = ease(seg(t, at + 1, at + 3.5));
          o += fade(sub * seg(t, at - 0.2, at + 0.3), `${txt(760, y + 20, e, 60, C.dark)}<rect x="860" y="${y - 6}" width="880" height="24" rx="12" fill="#fff"/><rect x="860" y="${y - 6}" width="${f1(880 * lerp(0.15, 0.85, sl))}" height="24" rx="12" fill="${sl > 0.5 ? '#E2556F' : '#2AA594'}" opacity=".5"/><circle cx="${f1(860 + 880 * lerp(0.15, 0.85, sl))}" cy="${y + 6}" r="34" fill="${sl > 0.5 ? '#E2556F' : '#2AA594'}" stroke="#fff" stroke-width="8"/>${txt(860, y + 80, l, 30, C.muted, { a: 'start', w: 700 })}`);
        });
      }
      return o;
    },

    // Lying on the grass: the clouds start looking like setups.
    'w3-clouds': (s, t) => {
      const B = s.b;
      let o = grad('w3j', '#9FD3F0', '#E6F5F2') + bg('url(#w3j)') + `<rect y="820" width="1920" height="260" fill="#9ED39A"/>`;
      o += `<g transform="rotate(-90 760 900)">${you(t, { x: 760, y: 900, scale: 1.1 })}</g>`;
      const morph = ease(seg(t, B.make, B.make + 3));
      [[500, 260], [960, 200], [1420, 280]].forEach(([x, y], j) => { o += cloud(x + Math.sin(t * 0.3 + j) * 20, y, 0.9, '#fff', 0.95); });
      // the middle cloud shapes into candles
      if (morph > 0) for (let i = 0; i < 6; i++) { const h = [60, 90, 70, 120, 100, 150][i] * morph; o += `<rect x="${880 + i * 30}" y="${f1(220 - h / 2)}" width="20" height="${f1(h)}" rx="6" fill="${i % 3 === 1 ? '#F4829A' : '#7ECFC0'}" opacity="${f1(morph)}"/>`; }
      o += thought(1200, 560, 'that’s… a setup, right?', between(t, B.make + 3, s.end), { size: 38 });
      o += fade(seg(t, B.whyt, B.whyt + 0.4) * (1 - seg(t, B.make, B.make + 0.4)), pill(960, 980, 'what… and WHY', '#7F77DD', 1, 34));
      return o;
    },

    // A hammock. Doing nothing, on purpose.
    'w3-hammock': (s, t) => {
      const B = s.b;
      let o = grad('w3k', '#FFE7C7', '#FDF8F5') + bg('url(#w3k)') + `<rect y="860" width="1920" height="220" fill="#B9DDB0"/>`;
      o += `<rect x="440" y="300" width="40" height="580" fill="#8B6A55"/><rect x="1440" y="300" width="40" height="580" fill="#8B6A55"/><circle cx="460" cy="300" r="120" fill="#7CC79A"/><circle cx="1460" cy="300" r="120" fill="#7CC79A"/>`;
      const sw = Math.sin(t * 1.4) * 20;
      o += `<path d="M480,520 Q960,${f1(760 + sw)} 1440,520" fill="none" stroke="#E2B04A" stroke-width="30"/>`;
      o += `<g transform="translate(0,${f1(sw * 0.5)}) rotate(-84 960 700)">${you(t, { x: 960, y: 700, scale: 1.0 })}</g>`;
      o += fade(seg(t, B.nothing + 1.5, B.nothing + 2), txt(960, 200, 'sometimes: nothing.', 60, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Rain is normal. Umbrella up. A stop loss isn't a mistake.
    'w3-umbrella': (s, t) => {
      const B = s.b;
      let o = grad('w3l', '#C9D3E2', '#E9EEF5') + bg('url(#w3l)') + `<rect y="860" width="1920" height="220" fill="#9AA3B8"/>` + rain(0, 1920, 0, 860, t, 40, '#7F92B8');
      o += you(t, { x: 600, y: 980, scale: 1.25, frontArm: { a1: -60, a2: -80 } });
      o += `<path d="M440,520 A250,170 0 0 1 940,520 Z" fill="#7F77DD"/><line x1="690" y1="520" x2="690" y2="700" stroke="#2C1810" stroke-width="10"/>`;
      o += fade(seg(t, B.stop, B.stop + 0.5), `<rect x="1080" y="300" width="640" height="200" rx="30" fill="#fff"/>${txt(1400, 380, 'STOP HIT', 40, '#E2556F', { ls: 6 })}${['⌛', '🎯', '📋'].map((e, j) => txt(1300 + j * 100, 460, e, 40, C.dark)).join('')}`);
      o += fade(seg(t, B.mistake, B.mistake + 0.4), `<rect x="1080" y="560" width="300" height="160" rx="24" fill="#fff"/>${txt(1230, 650, 'mistake?', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1340, 580, pop(t, B.mistake + 0.8, 0.4), '#E2556F', 26);
      o += fade(seg(t, B.tlost, B.tlost + 0.4), `<rect x="1420" y="560" width="300" height="160" rx="24" fill="#fff" stroke="#2AA594" stroke-width="6"/>${txt(1570, 650, 'just a loss', 36, '#2AA594', { f: 'Playfair Display', it: true, w: 700 })}`) + check(1680, 580, pop(t, B.tlost + 0.5, 0.4), '#2AA594', 26);
      return o;
    },

    // Two islands: THE LOSS and THE NEXT DECISION. The water between them widens.
    'w3-islands': (s, t) => {
      const B = s.b;
      let o = grad('w3m', '#CDEBF7', '#7FC3E0') + bg('url(#w3m)');
      for (let j = 0; j < 6; j++) o += `<path d="M${(j * 340 + t * 30) % 2200 - 200},${760 + (j % 3) * 70} q40,-20 80,0 t80,0" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>`;
      const gap = ease(seg(t, B.space + 1, B.space + 5));
      const lx = 560 - gap * 220, rx = 1360 + gap * 220;
      o += `<ellipse cx="${f1(lx)}" cy="760" rx="300" ry="90" fill="#E8D5C4"/><ellipse cx="${f1(rx)}" cy="760" rx="300" ry="90" fill="#E8D5C4"/>`;
      o += `<rect x="${f1(lx - 120)}" y="560" width="240" height="140" rx="20" fill="#E2556F"/>${txt(lx, 645, 'the loss', 36, '#fff')}`;
      o += `<rect x="${f1(rx - 120)}" y="560" width="240" height="140" rx="20" fill="#2C1810"/>${txt(rx, 625, 'next', 32, '#fff')}${txt(rx, 665, 'decision', 32, '#fff')}`;
      o += you(t, { x: lx + 180, y: 760, scale: 0.9 });
      o += fade(gap, txt(960, 260, 'create space', 64, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Calm you vs give-me-my-damn-money-back you.
    'w3-twoyou': (s, t) => {
      const B = s.b;
      let o = grad('w3n', '#E6F5F2', '#FDF8F5') + `<rect width="960" height="1080" fill="url(#w3n)"/>` + grad('w3o', '#3A1420', '#1D0B12') + `<rect x="960" width="960" height="1080" fill="url(#w3o)"/>`;
      o += you(t, { x: 480, y: 980, scale: 1.3 }) + `<circle cx="480" cy="560" r="300" fill="#2AA594" opacity=".08"/>`;
      o += pill(480, 240, 'calm you', '#2AA594', pop(t, B.calm, 0.5), 40);
      const d = seg(t, B.damn, B.damn + 0.4), shake = d > 0 ? Math.sin(t * 30) * 6 : 0;
      o += fade(d, `<g transform="translate(${f1(shake)},0)">${you(t, { x: 1440, y: 980, scale: 1.3, flip: true, mood: 'sad', frontArm: { a1: -150, a2: -160 } })}</g>`);
      if (d > 0) for (let j = 0; j < 3; j++) { const p = ((t * 0.8 + j * 0.33) % 1); o += `<path d="M${1400 + j * 40},${f1(520 - p * 140)} q14,-20 0,-40 q-14,-20 0,-40" stroke="#FF8DA3" stroke-width="6" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.8)}"/>`; }
      o += thought(1440, 240, '“give me my damn money back”', pop(t, B.damn + 0.4, 0.5), { size: 34 });
      return o;
    },

    // The flip test: the last card flips from LOSS to WIN. Does the next trade still look the same?
    'w3-flip': (s, t) => {
      const B = s.b;
      let o = grad('w3p', '#EEEBFB', '#FDF8F5') + bg('url(#w3p)');
      const fl = seg(t, B.would + 1, B.would + 2), sx = Math.abs(Math.cos(fl * Math.PI)), won = fl > 0.5;
      o += `<g transform="translate(560,540) scale(${f1(Math.max(0.02, sx))},1)"><rect x="-200" y="-260" width="400" height="520" rx="30" fill="${won ? '#2AA594' : '#E2556F'}"/>${txt(0, -150, 'LAST TRADE', 32, '#fff', { ls: 4 })}${txt(0, 40, won ? 'WON' : 'LOST', 90, '#fff')}</g>`;
      o += txt(960, 560, '→', 100, C.dark);
      o += `<rect x="1160" y="280" width="400" height="520" rx="30" fill="#120D1C"/>${candles(1190, 340, 340, 360, [0.3, 0.36, 0.33, 0.44, 0.4, 0.5, 0.48], 7)}${txt(1360, 760, 'this trade', 32, '#CFC8FA', { w: 700 })}`;
      o += fade(seg(t, B.would + 2.5, B.would + 3), txt(960, 940, 'still take it?', 60, '#7F77DD', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The rule: step away (timer), water, a break, same stamp either way. The bill bounces off.
    'w3-rule': (s, t) => {
      const B = s.b;
      let o = grad('w3q', '#EEEBFB', '#DDF1EE') + bg('url(#w3q)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 230, 'After a full stop loss, I reset before I re-enter.', 56, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      const secs = Math.max(0, 600 - Math.floor(seg(t, B.r1, B.r1 + 8) * 600));
      o += fade(a * seg(t, B.r1, B.r1 + 0.4), `<circle cx="420" cy="560" r="150" fill="#fff"/>${bigNum(420, 585, `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, 60, '#7F77DD')}`);
      o += fade(a * seg(t, B.r2, B.r2 + 0.4), `<circle cx="960" cy="560" r="150" fill="#fff"/><path d="M900,470 L915,650 L1005,650 L1020,470 Z" fill="#BFE3F5" stroke="#7FB8D6" stroke-width="6"/>`);
      o += fade(a * seg(t, B.r3, B.r3 + 0.4), `<circle cx="1500" cy="560" r="150" fill="#fff"/><rect x="1400" y="530" width="70" height="60" rx="10" fill="#E2556F"/><rect x="1530" y="530" width="70" height="60" rx="10" fill="#2C1810"/><line x1="1475" x2="1525" y1="560" y2="560" stroke="#F9D89A" stroke-width="10" stroke-dasharray="8 8"/>`);
      o += fade(a * seg(t, B.r4, B.r4 + 0.5), `${pill(960, 830, 'same criteria as if I hadn’t lost', '#2C1810', 1, 34)}`);
      if (fin > 0) {
        o += fade(fin, `<rect x="380" y="400" width="420" height="300" rx="30" fill="#E2556F"/>${txt(590, 540, 'LAST TRADE', 40, '#fff', { ls: 4 })}${bigNum(590, 610, '−$200', 44, '#fff')}<rect x="1120" y="400" width="420" height="300" rx="30" fill="#2AA594"/>${txt(1330, 560, 'NEXT TRADE', 40, '#fff', { ls: 4 })}`);
        const slide = ease(seg(t, B.line + 0.5, B.line + 1.5)), bounce = ease(seg(t, B.line + 1.6, B.line + 2.4));
        o += fade(fin, `<g transform="translate(${f1(lerp(800, 1080, slide) - bounce * 240)},550) rotate(${f1(-6 + bounce * 12)})"><rect x="-90" y="-60" width="180" height="120" rx="10" fill="#FFF3D6" stroke="#B38A2E" stroke-width="4"/>${txt(0, 12, 'BILL', 32, '#B38A2E', { ls: 4 })}</g>`) + cross(1330, 400, pop(t, B.line + 2, 0.4), '#E2556F', 36);
        o += fade(seg(t, B.line + 0.2, B.line + 0.8), txt(960, 850, 'My next trade’s job is not to pay for my last trade.', 50, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Replay: the same four dials, but this time she checks what moved after her loss.
    'w3-replay': (s, t) => {
      const B = s.b;
      let o = wall('w3r', '#1A1424', '#2A2142', 920, '#141026');
      o += txt(960, 180, 'after the loss…', 52, '#fff', { f: 'Playfair Display', it: true });
      [[B.q1, '🎚️'], [B.q2, '⚡'], [B.q3, '🔍'], [B.q4, '💸']].forEach(([at, e], j) => {
        const x = 330 + j * 420, k = pop(t, at, 0.5), turn = ease(seg(t, at + 0.6, at + 1.6));
        o += scaleAt(x, 520, k, `<circle cx="${x}" cy="520" r="150" fill="#2A2142" stroke="#3A2F55" stroke-width="10"/><line x1="${x}" y1="520" x2="${f1(x + 110 * Math.sin((-120 + 220 * turn) * Math.PI / 180))}" y2="${f1(520 - 110 * Math.cos((-120 + 220 * turn) * Math.PI / 180))}" stroke="#E2556F" stroke-width="14" stroke-linecap="round"/>${txt(x, 760, e, 70, '#fff')}`);
      });
      return o;
    },

    // Two paths: WIN → next trade and LOSS → next trade. Do they look the same?
    'w3-paths': (s, t) => {
      const B = s.b;
      let o = grad('w3s', '#EEEBFB', '#FDF8F5') + bg('url(#w3s)');
      const lane = (y, col, lbl, k, beh) => fade(k, `<circle cx="300" cy="${y}" r="80" fill="${col}"/>${txt(300, y + 14, lbl, 34, '#fff')}<line x1="400" x2="1300" y1="${y}" y2="${y}" stroke="${col}" stroke-width="10" stroke-dasharray="20 14"/><rect x="1320" y="${y - 90}" width="360" height="180" rx="24" fill="#120D1C"/>${candles(1340, y - 70, 320, 140, [0.3, 0.4, 0.36, 0.5, 0.46, 0.6], 6)}${beh}`);
      o += lane(360, '#2AA594', 'WIN', seg(t, B.big, B.big + 0.6), '');
      o += lane(720, '#E2556F', 'LOSS', seg(t, B.big + 1.5, B.big + 2.1), seg(t, B.big + 4, B.big + 4.5) > 0 ? `<g opacity="${f1(seg(t, B.big + 4, B.big + 4.5))}">${pill(1500, 860, 'bigger · faster · looser', '#E2556F', 1, 26)}</g>` : '');
      o += fade(seg(t, B.big + 3, B.big + 3.5), txt(1500, 560, '= ?', 70, C.dark));
      o += fade(seg(t, B.bigq, B.bigq + 0.4) * (1 - seg(t, B.big, B.big + 0.4)), txt(960, 540, 'the biggest question…', 70, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.changed, B.changed + 0.5), txt(800, 560, 'what changed?', 56, '#7F77DD', { f: 'Playfair Display', it: true }));
      return o;
    },

    // End: drop the loss, breathe, open the rules. The market doesn't owe you.
    'w3-end': (s, t) => {
      const B = s.b;
      let o = grad('w3t', '#FFE7C7', '#FDF8F5') + bg('url(#w3t)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      const a = 1 - seg(t, B.steps - 0.3, B.steps);
      o += fade(a * seg(t, B.c1, B.c1 + 0.4), `<rect x="260" y="300" width="600" height="300" rx="36" fill="#fff"/>${txt(560, 430, 'trade after a loss', 44, C.dark, { f: 'Playfair Display', it: true })}`) + check(560, 530, a * pop(t, B.c1 + 1, 0.4), '#2AA594', 34);
      o += fade(a * seg(t, B.c2, B.c2 + 0.4), `<rect x="1060" y="300" width="600" height="300" rx="36" fill="#fff" stroke="#E2556F" stroke-width="6"/>${txt(1360, 430, 'trade BECAUSE you lost', 44, '#E2556F', { f: 'Playfair Display', it: true })}`) + cross(1360, 530, a * pop(t, B.c2 + 1.5, 0.4), '#E2556F', 34);
      if (a < 1) {
        const k = 1 - a, st = Math.min(2, Math.floor(seg(t, B.steps, B.steps + 3.6) * 3));
        const drop = st >= 0 ? ease(seg(t, B.steps, B.steps + 1)) : 0;
        o += fade(k, you(t, { x: 960, y: 980, scale: 1.3, frontArm: st >= 2 ? { a1: -40, a2: -60 } : undefined, hold: st >= 2 ? `<rect x="-10" y="-90" width="120" height="90" rx="8" fill="#7F77DD"/><rect x="0" y="-80" width="100" height="70" rx="6" fill="#FFF8E6"/>` : '' }));
        o += fade(k * (1 - seg(t, B.steps + 1, B.steps + 1.4)), `<rect x="${f1(760)}" y="${f1(lerp(620, 900, drop))}" width="160" height="90" rx="12" fill="#E2556F"/>${txt(840, lerp(675, 955, drop), '−$', 40, '#fff')}`);
        if (st >= 1) o += `<circle cx="960" cy="560" r="${f1(120 + 60 * Math.sin(t * 2))}" fill="#7ECFC0" opacity=".2"/>`;
        ['TAKE THE LOSS', 'RESET', 'YOUR RULES'].forEach((l, j) => { o += fade(k * (1 - seg(t, B.owe + 0.5, B.owe + 1)), pill(520 + j * 440, 220, l, ['#E2556F', '#7F77DD', '#2AA594'][j], pop(t, B.steps + j * 1.2, 0.5), 34)); });
        o += fade(seg(t, B.owe + 1, B.owe + 1.6), `<rect x="0" y="130" width="1920" height="220" fill="#FDF8F5" opacity=".9"/>${txt(960, 220, 'The market doesn’t owe you your money back.', 54, C.dark, { f: 'Playfair Display', it: true })}${txt(960, 310, 'Your next trade doesn’t have to get it back.', 54, '#2AA594', { f: 'Playfair Display', it: true })}`);
      }
      return o;
    },

    /* ════ Psychology 4 · Overtrading ══════════════════════════════════ */

    // Tally marks on the wall keep growing. She's still at the chart.
    'w4-tally': (s, t) => {
      const B = s.b;
      let o = wall('w4a', '#3B2F55', '#2A2142', 900, '#1E1730');
      let n = 3; if (t > B.another + 1) n = 4; if (t > B.closes + 1.5) n = 5; if (t > B.six) n = 6 + Math.min(2, Math.floor((t - B.six) / 1.2));
      for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, x = 1260 + g * 220 + j * 34; o += j < 4 ? `<line x1="${x}" y1="160" x2="${x + 6}" y2="300" stroke="#F9D89A" stroke-width="10" stroke-linecap="round"/>` : `<line x1="${x - 150}" y1="290" x2="${x + 10}" y2="170" stroke="#F9D89A" stroke-width="10" stroke-linecap="round"/>`; }
      const lights = ['#2AA594', '#E2556F', '#B8B3C9'];
      lights.forEach((c, j) => { o += `<circle cx="${220 + j * 90}" cy="220" r="34" fill="${c}" opacity="${f1(between(t, B.states + j * 1.2, B.still) ? 1 : 0.2)}"/>`; });
      o += monitor(360, 330, 760, 420, candles(400, 390, 680, 300, vals(91, 30, 0, 0.045, 0.5), Math.min(30, 6 + Math.floor(seg(t, s.start, s.end) * 24)), { slots: 30 }));
      o += you(t, { x: 1380, y: 1060, scale: 1.25, flip: true, frontArm: t > B.another ? { a1: -175 + Math.sin(t * 6) * 5, a2: -170 } : { a1: 160, a2: 150 } });
      o += desk(200, 900, 1500);
      o += fade(seg(t, B.still, B.still + 0.5) * (1 - seg(t, B.another, B.another + 0.5)), pill(1380, 620, 'still here', '#7F77DD', 1, 30));
      return o;
    },

    // Night. A flashlight beam sweeps the chart. What is she looking for?
    'w4-flashlight': (s, t) => {
      const B = s.b;
      let o = bg('#0E0A14');
      o += `<rect x="260" y="200" width="1400" height="600" rx="28" fill="#120D1C"/>${candles(300, 250, 1320, 500, vals(66, 40, 0, 0.05, 0.5), 40)}`;
      const bx = 960 + 520 * Math.sin((t - s.start) * 0.9), by = 500 + 100 * Math.cos((t - s.start) * 1.3);
      o += `<defs><radialGradient id="w4fl"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#0E0A14" stop-opacity=".95"/></radialGradient></defs><rect width="1920" height="1080" fill="#0E0A14" opacity=".75"/><circle cx="${f1(bx)}" cy="${f1(by)}" r="200" fill="#FFF8E6" opacity=".18"/>`;
      o += `<path d="M300,1000 L${f1(bx - 120)},${f1(by)} L${f1(bx + 120)},${f1(by)} Z" fill="#FFF8E6" opacity=".07"/>`;
      o += you(t, { x: 240, y: 1080, scale: 1.1, frontArm: { a1: -30, a2: -40 }, hold: `<rect x="-10" y="-20" width="70" height="36" rx="10" fill="#F9D89A"/>` });
      o += fade(seg(t, B.looking, B.looking + 0.5), txt(960, 140, 'what am I still looking for?', 56, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Fishing: when the fish bite vs casting into an empty pond, again and again.
    'w4-pond': (s, t) => {
      const B = s.b;
      let o = grad('w4c', '#CDEBF7', '#FDF8F5') + bg('url(#w4c)') + `<rect y="700" width="1920" height="380" fill="#B9DDB0"/><line x1="960" x2="960" y1="0" y2="1080" stroke="#fff" stroke-width="10"/>`;
      // left: fish jumping at the right times
      o += `<ellipse cx="560" cy="820" rx="360" ry="110" fill="#7FC3E0"/>`;
      for (let j = 0; j < 3; j++) { const p = ((t - s.start) * 0.35 + j / 3) % 1; if (p < 0.3) { const q = p / 0.3; o += `<g transform="translate(${420 + j * 140},${f1(820 - Math.sin(q * Math.PI) * 160)}) rotate(${f1(-40 + q * 80)})"><ellipse rx="40" ry="20" fill="#E2B04A"/><path d="M36,0 l26,-16 l0,32 z" fill="#E2B04A"/></g>`; } }
      o += you(t, { x: 220, y: 760, scale: 0.9, frontArm: { a1: -40, a2: -50 } }) + check(560, 600, pop(t, B.diff + 1.5, 0.5), '#2AA594', 34);
      // right: empty pond, casting again and again
      o += `<ellipse cx="1400" cy="820" rx="360" ry="110" fill="#9AB8C9"/>`;
      const cast = ((t - s.start) * 0.8) % 1;
      o += you(t, { x: 1760, y: 760, scale: 0.9, flip: true, frontArm: { a1: -150 + cast * 120, a2: -160 + cast * 120 } }) + `<path d="M1700,520 Q${f1(1500 - cast * 100)},${f1(500)} ${f1(1450 - cast * 150)},820" fill="none" stroke="#2C1810" stroke-width="3"/>`;
      o += fade(seg(t, B.diff + 3, B.diff + 3.5), txt(1400, 980, 'just… sitting there', 34, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.today + 1, B.today + 1.6), `<rect x="560" y="120" width="800" height="120" rx="60" fill="#2C1810"/>${txt(960, 200, 'overtrading', 60, '#fff', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // A doorman's clicker counting trades: 3 ✓, 7 ✗… then "not that simple".
    'w4-clicker': (s, t) => {
      const B = s.b;
      let o = grad('w4d', '#FFF4DE', '#F6E7DA') + bg('url(#w4d)');
      const cnt = t < B.three ? 3 : Math.min(7, 3 + Math.floor((t - B.three) * 2));
      o += `<circle cx="960" cy="520" r="230" fill="#B8B3C9"/><circle cx="960" cy="520" r="190" fill="#E9E1F5"/><rect x="860" y="430" width="200" height="120" rx="14" fill="#2C1810"/>${bigNum(960, 520, String(cnt).padStart(3, '0'), 64, '#F9D89A')}<rect x="930" y="250" width="60" height="60" rx="14" fill="#7F77DD"/>`;
      o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, frontArm: { a1: -120 + Math.sin(t * 8) * 6, a2: -150 } });
      o += pill(960, 820, cnt < 7 ? '3 = okay?' : '7 = overtrading?', cnt < 7 ? '#2AA594' : '#E2556F', pop(t, B.three, 0.4), 34);
      o += fade(seg(t, B.simple, B.simple + 0.4), `<rect width="1920" height="1080" fill="#FDF8F5" opacity=".85"/>${txt(960, 540, 'not that simple.', 90, C.dark, { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // A seesaw: my plan on one side, what I want to FEEL on the other. It tips.
    'w4-seesaw': (s, t) => {
      const B = s.b;
      let o = grad('w4e', '#CDEBF7', '#FDF8F5') + bg('url(#w4e)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/>`;
      const tip = ease(seg(t, B.reason + 4, B.reason + 7)) * 14;
      o += `<path d="M960,600 L880,820 L1040,820 Z" fill="#8B6A55"/><g transform="rotate(${f1(tip)} 960 600)"><rect x="460" y="580" width="1000" height="30" rx="14" fill="#C98B6B"/><rect x="500" y="460" width="260" height="120" rx="14" fill="#fff" stroke="#2AA594" stroke-width="6"/>${txt(630, 535, '📋 my plan', 34, '#2AA594')}${heart(1300, 500, 1.6, '#E2556F')}<circle cx="1300" cy="520" r="${f1(60 + 20 * seg(t, B.reason + 2, B.reason + 6))}" fill="#E2556F" opacity=".25"/></g>`;
      o += fade(seg(t, B.reason + 4, B.reason + 5), pill(1300, 300, 'what I’m trying to feel', '#E2556F', 1, 32));
      return o;
    },

    // Red day, sun going down, she won't get up: "one more."
    'w4-red': (s, t) => {
      const B = s.b;
      let o = wall('w4f', '#7A2F3A', '#3A1420', 900, '#2A0F18');
      o += windowBox(1400, 160, 380, 360, '#C4566A', `<circle cx="1590" cy="${f1(420 + 120 * seg(t, s.start, s.end))}" r="70" fill="#F9A88A"/>`);
      o += monitor(300, 260, 760, 420, candles(340, 320, 680, 300, vals(8, 20, -0.015, 0.05, 0.75), 20, { dn: '#FF6F8A' })) + desk(160, 900, 1100);
      o += you(t, { x: 1200, y: 1060, scale: 1.25, flip: true, mood: 'sad', frontArm: { a1: -175, a2: -170 } });
      o += thought(1240, 340, 'one more.', pop(t, B.red + 1, 0.5), { size: 48 });
      return o;
    },

    // Football: she kicks… and the goalposts slide back. $400 → $500 → $600.
    'w4-goal': (s, t) => {
      const B = s.b;
      let o = grad('w4g', '#CDEBF7', '#FDF8F5') + bg('url(#w4g)') + `<rect y="700" width="1920" height="380" fill="#7CC79A"/>`;
      for (let x = 0; x < 1920; x += 240) o += `<line x1="${x}" x2="${x + 120}" y1="1080" y2="700" stroke="#fff" stroke-width="5" opacity=".5"/>`;
      const back1 = ease(seg(t, B.green + 1.5, B.green + 2.5)), back2 = ease(seg(t, B.six00, B.six00 + 1));
      const gx = 1300 + back1 * 200 + back2 * 200, sc = 1 - back1 * 0.2 - back2 * 0.2, amt = t < B.green + 1.5 ? '$400' : t < B.six00 ? '$500' : '$600';
      o += `<g transform="translate(${f1(gx)},700) scale(${f1(sc)})"><rect x="-10" y="-420" width="20" height="420" fill="#fff"/><rect x="-160" y="-300" width="320" height="16" fill="#fff"/><rect x="-160" y="-560" width="16" height="276" fill="#fff"/><rect x="144" y="-560" width="16" height="276" fill="#fff"/>${bigNum(0, -600, amt, 70, '#2AA594')}</g>`;
      const kick = ((t - s.start) % 3) / 3;
      o += you(t, { x: 400, y: 900, scale: 1.2, frontArm: { a1: -60, a2: -60 } }) + `<g transform="translate(${f1(500 + kick * 700)},${f1(840 - Math.sin(kick * Math.PI) * 300)})"><ellipse rx="40" ry="26" fill="#8B5A3C"/><line x1="-14" x2="14" y1="0" y2="0" stroke="#fff" stroke-width="4"/></g>`;
      return o;
    },

    // Bored. Chin on hand. A net swiped at random candles.
    'w4-bored': (s, t) => {
      const B = s.b;
      let o = wall('w4h', '#E9E1F5', '#D9CFEA', 900, '#9C8CB8');
      o += monitor(260, 200, 820, 460, candles(300, 260, 740, 360, vals(73, 26, 0, 0.05, 0.5), 26));
      const sw = Math.sin((t - s.start) * 2.4);
      o += `<g transform="rotate(${f1(sw * 30)} 1200 700)"><line x1="1200" y1="700" x2="900" y2="420" stroke="#8B6A55" stroke-width="12"/><ellipse cx="880" cy="400" rx="90" ry="60" fill="none" stroke="#2C1810" stroke-width="6"/><path d="M800,400 Q880,520 960,400" fill="#fff" opacity=".4"/></g>`;
      o += you(t, { x: 1460, y: 1060, scale: 1.25, flip: true, frontArm: { a1: -80, a2: -40 } }) + desk(160, 900, 1600);
      o += thought(1500, 330, 'catch something…?', pop(t, B.bored + 2, 0.5), { size: 40 });
      return o;
    },

    // A shop sign flips: WAITING → HUNTING.
    'w4-sign': (s, t) => {
      const B = s.b;
      let o = grad('w4i', '#FDF8F5', '#F3E7DD') + bg('url(#w4i)');
      const fl = seg(t, B.shift + 2, B.shift + 3), sy = Math.abs(Math.cos(fl * Math.PI)), hunt = fl > 0.5;
      o += `<line x1="760" y1="160" x2="960" y2="320" stroke="#8B6A55" stroke-width="6"/><line x1="1160" y1="160" x2="960" y2="320" stroke="#8B6A55" stroke-width="6"/><circle cx="960" cy="160" r="12" fill="#8B6A55"/>`;
      o += `<g transform="translate(960,520) scale(1,${f1(Math.max(0.03, sy))})"><rect x="-420" y="-200" width="840" height="400" rx="30" fill="${hunt ? '#E2556F' : '#2AA594'}"/>${txt(0, -40, hunt ? 'LOOKING FOR' : 'WAITING FOR', 46, '#fff', { ls: 6 })}${txt(0, 70, hunt ? 'REASONS' : 'OPPORTUNITIES', 70, '#fff', { ls: 4 })}</g>`;
      return o;
    },

    // Jenga: a solid green day built from base hits… then she keeps pulling blocks.
    'w4-jenga': (s, t) => {
      const B = s.b;
      let o = grad('w4j', '#F3E3D6', '#FBF4EF') + bg('url(#w4j)') + `<rect y="880" width="1920" height="200" fill="#C9A27E"/>`;
      o += host(t, { x: 60, y: 360, w: 480, pose: t > B.ask ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const built = Math.min(9, Math.floor(seg(t, B.kept, B.kept + 4) * 10));
      const pulled = Math.floor(seg(t, B.kept + 5, B.ask) * 6);
      const fall = seg(t, B.ask - 0.3, B.ask + 1.5);
      for (let r = 0; r < built; r++) {
        const y = 860 - r * 60, missing = r < 6 && r % 2 === 1 && Math.floor(r / 2) < pulled;
        for (let c = 0; c < 3; c++) {
          if (missing && c === 1) continue;
          const dx = fall * (r * 30 + c * 20) * (c - 1 + 0.5), dy = fall * fall * (r * 40), rot = fall * (r * 8) * (c - 1 + 0.3);
          o += `<g transform="translate(${f1(dx)},${f1(dy)}) rotate(${f1(rot)} ${1100 + c * 130} ${y})"><rect x="${1040 + c * 130}" y="${y - 54}" width="122" height="54" rx="8" fill="${r < 5 ? '#7CC79A' : '#E2B04A'}" stroke="#fff" stroke-width="4"/></g>`;
        }
      }
      o += fade(seg(t, B.kept + 2, B.kept + 2.5), pill(1230, 200, 'base hits ✓', '#2AA594', 1, 30));
      o += thought(1230, 320, 'what was I trying to do?', between(t, B.ask + 2, s.end), { size: 38 });
      return o;
    },

    // Sunglasses and a crown. The confidence balloon swells; every setup flies at her: "mine!"
    'w4-crown': (s, t) => {
      const B = s.b;
      let o = grad('w4k', '#FFF4DE', '#F9D89A') + bg('url(#w4k)');
      o += fade(seg(t, B.sneaky, B.sneaky + 0.4) * (1 - seg(t, B.winning, B.winning + 0.4)), txt(960, 300, 'you don’t have to be losing', 60, C.dark, { f: 'Playfair Display', it: true }) + bigNum(960, 450, '+$', 120, '#2AA594'));
      if (t > B.winning) {
        const conf = seg(t, B.good, B.every + 2);
        o += you(t, { x: 760, y: 1000, scale: 1.3, frontArm: t > B.onit ? { a1: -160, a2: -170 } : undefined });
        if (t > B.reading) o += `<rect x="712" y="${612}" width="96" height="26" rx="10" fill="#2C1810"/>`;
        if (t > B.onit) o += `<path d="M700,560 L720,500 L750,540 L760,490 L770,540 L800,500 L820,560 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="4"/>`;
        o += `<circle cx="1300" cy="${f1(560 - conf * 80)}" r="${f1(60 + conf * 180)}" fill="#E2556F" opacity="${f1(0.25 + conf * 0.35)}"/>`;
        o += fade(seg(t, B.good, B.good + 0.4), txt(1300, 570 - conf * 80, 'confidence', 34, '#fff', { w: 800 }));
        if (t > B.every) for (let j = 0; j < 4; j++) { const p = seg(t, B.every + 0.5 + j * 0.6, B.every + 1.5 + j * 0.6); if (p > 0 && p < 1) o += `<rect x="${f1(lerp(1900, 820, p))}" y="${f1(300 + j * 120 + Math.sin(p * 6) * 20)}" width="110" height="70" rx="10" fill="#120D1C"/>`; }
        o += thought(760, 340, 'mine. mine. MINE.', between(t, B.every + 1, s.end), { size: 40 });
      }
      return o;
    },

    // The permission slip: "I'm green, so I can get careless" — DENIED.
    'w4-slip': (s, t) => {
      const B = s.b;
      let o = grad('w4l', '#EEEBFB', '#FDF8F5') + bg('url(#w4l)');
      o += `<g transform="rotate(-4 960 460)"><rect x="560" y="230" width="800" height="460" rx="12" fill="#FFF8E6" stroke="#E2B04A" stroke-width="6"/>${txt(960, 320, 'PERMISSION SLIP', 38, '#B38A2E', { ls: 6 })}${bigNum(960, 450, '+$', 90, '#2AA594')}${txt(960, 560, '= be careless?', 46, C.dark, { f: 'Playfair Display', it: true })}</g>`;
      o += scaleAt(960, 460, pop(t, B.permission + 2.5, 0.5), `<g transform="rotate(-14 960 460)"><rect x="680" y="400" width="560" height="130" rx="14" fill="none" stroke="#E2556F" stroke-width="12"/>${txt(960, 495, 'DENIED', 84, '#E2556F', { ls: 10 })}</g>`);
      o += fade(seg(t, B.deserves, B.deserves + 0.5), `${pill(680, 850, 'more risk ✗', '#E2556F', 1, 34)}${pill(1240, 850, 'lower standards ✗', '#E2556F', 1, 34)}`);
      return o;
    },

    // Poker table: she pushes her own green chips back to the center.
    'w4-chips': (s, t) => {
      const B = s.b;
      let o = grad('w4m', '#2A1A12', '#3A2418') + bg('url(#w4m)');
      o += `<ellipse cx="960" cy="700" rx="820" ry="260" fill="#2E6B4F"/><ellipse cx="960" cy="690" rx="780" ry="230" fill="#3C8A66"/><ellipse cx="960" cy="200" rx="300" ry="120" fill="#F9D89A" opacity=".1"/>`;
      o += you(t, { x: 1500, y: 980, scale: 1.2, flip: true, mood: t > B.table ? 'sad' : undefined, frontArm: { a1: -170 + Math.sin(t * 5) * 6, a2: -175 } });
      for (let i = 0; i < 12; i++) { const at = B.gave + 0.5 + i * 0.5, k = ease(seg(t, at, at + 0.6)), x = lerp(1340, 820 + (i % 4) * 70, k), y = lerp(720, 650 + Math.floor(i / 4) * 34, k); o += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="42" ry="16" fill="#2AA594" stroke="#fff" stroke-width="5"/>`; }
      o += fade(seg(t, B.table, B.table + 0.5), txt(960, 200, 'I kept putting it back on the table.', 54, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The ladder keeps growing: $300, $400, $500… then she plants her own flag.
    'w4-ladder': (s, t) => {
      const B = s.b;
      let o = grad('w4n', '#CDEBF7', '#FDF8F5') + bg('url(#w4n)') + `<rect y="920" width="1920" height="160" fill="#B9DDB0"/>`;
      const top = 760 - 160 * ease(seg(t, B.u300 + 1, B.u300 + 2)) - 160 * ease(seg(t, B.u500, B.u500 + 1)) - 120 * ease(seg(t, B.finish - 1, B.finish));
      o += `<rect x="820" y="${f1(top - 200)}" width="16" height="${f1(1120 - top)}" fill="#8B6A55"/><rect x="1084" y="${f1(top - 200)}" width="16" height="${f1(1120 - top)}" fill="#8B6A55"/>`;
      for (let y = 900; y > top - 200; y -= 70) o += `<rect x="836" y="${y}" width="248" height="12" fill="#8B6A55"/>`;
      const lbl = t < B.u300 + 1 ? '$300' : t < B.u500 ? '$400' : '$500';
      o += pill(960, top - 240, lbl, '#2AA594', pop(t, B.u300, 0.4) * (1 - seg(t, B.finish + 1, B.finish + 1.5)), 40);
      o += you(t, { x: 960, y: Math.max(top + 120, 400), scale: 0.9 });
      o += fade(seg(t, B.done, B.done + 0.4) * (1 - seg(t, B.u300, B.u300 + 0.3)), thought(1360, 360, 'I’ll stop when I feel done…', 1, { size: 36 }));
      const flag = seg(t, B.finish + 1.5, B.finish + 2.5);
      if (flag > 0) o += scaleAt(1500, 900, flag, `<rect x="1496" y="560" width="10" height="360" fill="#2C1810"/><path d="M1506,560 L1700,600 L1506,640 Z" fill="#E2556F"/>${txt(1500, 980, 'MY finish line', 34, C.dark, { w: 800 })}`);
      return o;
    },

    // A car dashboard of stop rules: trade counter, loss gauge, profit lock, the mental fuel gauge.
    'w4-dashboard': (s, t) => {
      const B = s.b;
      let o = grad('w4o', '#1D2433', '#2B3550') + bg('url(#w4o)');
      o += `<path d="M120,1080 Q960,520 1800,1080 Z" fill="#141A26"/><rect x="200" y="300" width="1520" height="520" rx="60" fill="#232B3D" stroke="#3A4560" stroke-width="10"/>`;
      const g = (x, label, v, col, k) => { const a = (-210 + 240 * v) * Math.PI / 180; return fade(k, `<circle cx="${x}" cy="560" r="150" fill="#141A26" stroke="#3A4560" stroke-width="8"/><path d="M${x - 120},620 A130,130 0 1 1 ${x + 120},620" fill="none" stroke="#3A4560" stroke-width="16"/><line x1="${x}" y1="560" x2="${f1(x + 110 * Math.cos(a))}" y2="${f1(560 + 110 * Math.sin(a))}" stroke="${col}" stroke-width="12" stroke-linecap="round"/><circle cx="${x}" cy="560" r="16" fill="${col}"/>${txt(x, 760, label, 36, '#CFC8FA')}`); };
      const tt = seg(t, B.quality, s.end);
      o += g(480, '# 🔁', 0.3 + 0.5 * tt, '#F9D89A', seg(t, B.quality + 0.5, B.quality + 1));
      o += g(840, '🛑 $', 0.2 + 0.4 * tt, '#E2556F', seg(t, B.quality + 1.5, B.quality + 2));
      o += g(1200, '🔒 +$', 0.6, '#2AA594', seg(t, B.quality + 2.5, B.quality + 3));
      o += g(1560, '🧠 ⛽', 0.9 - 0.8 * tt, '#7F77DD', seg(t, B.quality + 3.5, B.quality + 4));
      o += fade(seg(t, B.quality + 5, B.quality + 5.6), txt(960, 200, 'decide these before you start', 52, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Journal: trade 1 ★★★★★ … trade 5 ★. Better or worse the longer you trade?
    'w4-stars': (s, t) => {
      const B = s.b;
      let o = grad('w4p', '#F6EDE6', '#EADFD8') + bg('url(#w4p)');
      o += `<rect x="360" y="160" width="1200" height="760" rx="20" fill="#fff"/><line x1="960" x2="960" y1="160" y2="920" stroke="#EADFD8" stroke-width="6"/>`;
      const stars = [5, 4, 3, 2, 1];
      stars.forEach((n, i) => {
        const at = B.tr + i * 0.9, y = 280 + i * 130;
        o += fade(seg(t, at, at + 0.3), txt(420, y + 12, '#' + (i + 1), 44, C.dark, { a: 'start', f: 'JetBrains Mono, monospace' }) + [0, 1, 2, 3, 4].map(k => txt(560 + k * 70, y + 18, '★', 56, k < n ? '#E2B04A' : '#EADFD8')).join(''));
      });
      o += fade(seg(t, B.worse, B.worse + 0.5), `<path d="M1100,300 Q1300,500 1440,820" fill="none" stroke="#E2556F" stroke-width="10" stroke-dasharray="20 12"/><path d="M1440,820 l-36,-14 l30,-30 z" fill="#E2556F"/>${txt(1260, 260, 'longer = worse?', 40, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}`);
      return o;
    },

    // The rule. Decided in the calm morning. OPEN sign ≠ "I need to trade". The laptop closes.
    'w4-rule': (s, t) => {
      const B = s.b;
      let o = grad('w4q', '#EEEBFB', '#DDF1EE') + bg('url(#w4q)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 230, 'I decide my stopping conditions before the session starts.', 52, C.dark, { f: 'Playfair Display' }));
      const p2 = seg(t, B.line - 0.3, B.line + 0.3), p3 = seg(t, B.close - 0.3, B.close + 0.3);
      if (p2 < 1) {
        o += fade(1 - p2, sun(500, 520, 90, t) + you(t, { x: 900, y: 920, scale: 1.1, frontArm: { a1: 20, a2: -10 } }) + `<rect x="980" y="620" width="240" height="300" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="5"/>` + [0, 1, 2].map(j => `<rect x="1010" y="${670 + j * 60}" width="${f1(170 * seg(t, B.r2 + j * 0.6, B.r2 + j * 0.6 + 0.5))}" height="14" rx="7" fill="#7F77DD"/>`).join('') + txt(1100, 990, 'before trade #1', 32, C.muted, { w: 700 }));
      }
      if (p2 > 0 && p3 < 1) {
        const glow = 0.6 + 0.4 * Math.sin(t * 5);
        o += fade(p2 * (1 - p3), `<rect x="460" y="400" width="520" height="220" rx="30" fill="#2C1810"/>${txt(720, 540, 'OPEN', 110, '#FF6F8A', { op: f1(glow), ls: 10 })}${txt(1120, 540, '≠', 100, C.dark)}` + you(t, { x: 1460, y: 920, scale: 1.1, frontArm: { a1: 60, a2: 40 } }));
      }
      if (p3 > 0) {
        const cl = ease(seg(t, B.close + 1, B.close + 1.8));
        o += fade(p3, `<rect x="560" y="${f1(380 + 320 * cl)}" width="800" height="${f1(320 * (1 - cl) + 20)}" rx="14" fill="#120D1C" stroke="#3A2F55" stroke-width="8"/><rect x="520" y="720" width="880" height="24" rx="10" fill="#3A2F55"/>`);
        o += fade(seg(t, B.close + 1.8, B.close + 2.4), txt(960, 880, 'sometimes discipline is closing TradingView', 50, '#2AA594', { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // Five ribbons, five sessions, dots fading from green to red as the day goes on.
    'w4-ribbons': (s, t) => {
      const B = s.b;
      let o = wall('w4r', '#1A1424', '#2A2142', 940, '#141026');
      const Q = [[0.9, 0.85, 0.6, 0.4], [0.9, 0.8], [0.85, 0.9, 0.7, 0.5, 0.35, 0.25], [0.9, 0.88, 0.8], [0.8, 0.75, 0.5, 0.3, 0.2]];
      Q.forEach((row, r) => {
        const y = 250 + r * 130, k = seg(t, B.five + r * 0.4, B.five + r * 0.4 + 0.4);
        o += fade(k, `<rect x="260" y="${y - 40}" width="1400" height="80" rx="40" fill="#2A2142"/>`);
        row.forEach((v, i) => { o += scaleAt(380 + i * 150, y, pop(t, B.order + r * 0.2 + i * 0.25, 0.4), `<circle cx="${380 + i * 150}" cy="${y}" r="30" fill="${v > 0.6 ? '#2AA594' : v > 0.4 ? '#F9D89A' : '#E2556F'}"/>`); });
      });
      o += fade(seg(t, B.q3, B.q3 + 0.5), `<path d="M380,940 L1300,940" stroke="#F9D89A" stroke-width="6" stroke-dasharray="16 12"/><path d="M1300,940 l-30,-16 l0,32 z" fill="#F9D89A"/>${txt(1360, 952, 'later', 36, '#F9D89A', { a: 'start', w: 700 })}`);
      return o;
    },

    // Four doors: what was she really looking for?
    'w4-doors': (s, t) => {
      const B = s.b;
      let o = wall('w4s', '#E9E1F5', '#D9CFEA', 900, '#9C8CB8');
      o += fade(seg(t, B.big, B.big + 0.5), txt(960, 150, 'what were you actually looking for?', 52, C.dark, { f: 'Playfair Display', it: true }));
      [[B.w1, '🎯', '#2AA594'], [B.w2, '↩️$', '#E2556F'], [B.w3, '⭐', '#E2B04A'], [B.w4, '🚪', '#7F77DD']].forEach(([at, e, col], j) => {
        const x = 330 + j * 420, op = seg(t, at, at + 0.8);
        o += `<rect x="${x - 140}" y="300" width="280" height="600" rx="10" fill="#2A2142"/><rect x="${x - 140}" y="300" width="${f1(280 * (1 - op * 0.8))}" height="600" rx="10" fill="${col}"/><circle cx="${f1(x + 100 - op * 220)}" cy="620" r="12" fill="#F9D89A"/>`;
        o += fade(op, txt(x + 30, 640, e, 80, '#fff'));
      });
      return o;
    },

    // End: the juicer squeezing every dollar (crossed). She closes the chart and walks into the sunset.
    'w4-sunset': (s, t) => {
      const B = s.b;
      let o = wall('w4t', '#F7B98E', '#F6D6BD', 880, '#B27A5A');
      o += windowBox(1300, 140, 480, 420, '#F59E7A', `<circle cx="1540" cy="${f1(380 + 80 * seg(t, s.start, s.end))}" r="90" fill="#FFD8A8"/>`);
      const sq = between(t, B.squeeze, B.job - 0.2);
      o += scaleAt(560, 420, sq, `<path d="M440,520 L680,520 L640,680 L480,680 Z" fill="#fff" stroke="#EADFD8" stroke-width="6"/><circle cx="560" cy="440" r="80" fill="#2AA594"/>${txt(560, 462, '$', 70, '#fff')}${[0, 1, 2].map(j => `<circle cx="${520 + j * 40}" cy="${f1(560 + ((t * 2 + j * 0.3) % 1) * 90)}" r="10" fill="#7CC79A"/>`).join('')}`) + cross(700, 380, sq * pop(t, B.squeeze + 2, 0.4), '#E2556F', 40);
      const cl = ease(seg(t, B.last + 1, B.last + 2)), walk = seg(t, B.last + 2.5, s.end);
      o += `<rect x="420" y="${f1(560 + 260 * cl)}" width="600" height="${f1(260 * (1 - cl) + 20)}" rx="14" fill="#120D1C" stroke="#3A2F55" stroke-width="8" opacity="${f1(1 - sq)}"/><rect x="380" y="836" width="680" height="24" rx="10" fill="#3A2F55" opacity="${f1(1 - sq)}"/>` + desk(300, 860, 900);
      o += you(t, { x: lerp(1160, 1500, ease(walk)), y: 1000, scale: 1.2, flip: walk < 0.01, walking: walk > 0 && walk < 1 });
      o += fade(seg(t, B.job, B.job + 0.5) * (1 - seg(t, B.last, B.last + 0.4)), txt(960, 200, 'execute your plan while you can do it well', 50, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.last + 2, B.last + 2.6), txt(760, 200, 'the best trade might be closing the chart.', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    /* ════ Psychology 12 · Blowing an Account ══════════════════════════ */

    // The balance drains to zero. FAILED stamp. Dark room.
    'w12-zero': (s, t) => {
      const B = s.b;
      let o = bg('#140C12');
      const dd = 1 - ease(seg(t, s.start, B.blew + 0.5));
      o += `<rect x="460" y="220" width="1000" height="520" rx="30" fill="#120D1C" stroke="#3A2F55" stroke-width="10"/>${bigNum(960, 450, '$' + Math.round(47500 + 2500 * dd).toLocaleString('en-US'), 110, dd > 0.05 ? '#fff' : '#FF6F8A')}<rect x="560" y="540" width="800" height="40" rx="20" fill="#2A2142"/><rect x="560" y="540" width="${f1(800 * dd)}" height="40" rx="20" fill="#E2556F"/>`;
      o += scaleAt(960, 470, pop(t, B.blew + 0.4, 0.6), `<g transform="rotate(-10 960 470)"><rect x="660" y="380" width="600" height="170" rx="16" fill="#140C12" stroke="#E2556F" stroke-width="12"/>${txt(960, 500, 'FAILED', 100, '#E2556F', { ls: 12 })}</g>`);
      return o;
    },

    // Head in hands at the desk.
    'w12-hands': (s, t) => {
      const B = s.b;
      let o = wall('w12b', '#2A1A22', '#3A2230', 900, '#1E1218');
      o += monitor(300, 220, 760, 440, `<rect x="320" y="240" width="720" height="400" fill="#2A0F18"/>${bigNum(680, 470, '$0', 120, '#FF6F8A')}`) + desk(160, 900, 1300);
      o += you(t, { x: 1280, y: 1080, scale: 1.3, flip: true, mood: 'sad', frontArm: { a1: -95, a2: -150 }, backArm: { a1: -85, a2: -30 } });
      o += thought(1280, 330, 'what did I just do?', between(t, B.hell, B.worst - 0.1), { size: 42 });
      o += fade(seg(t, B.knew, B.knew + 0.5), txt(1300, 220, 'you knew better.', 50, '#F9D89A', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Polaroids of the day pin up one by one on a corkboard.
    'w12-polaroids': (s, t) => {
      const B = s.b;
      let o = grad('w12c', '#B78F72', '#9C7458') + bg('url(#w12c)');
      o += `<rect x="160" y="120" width="1600" height="840" rx="20" fill="#C9A27E" stroke="#8B6A55" stroke-width="16"/>`;
      const pics = [
        [B.m1, 380, 380, -6, candles(300, 300, 160, 120, [0.2, 0.35, 0.5, 0.62, 0.7], 5), 'green'],
        [B.m2, 760, 340, 4, `<rect x="690" y="270" width="140" height="120" fill="#2A0F18"/><line x1="690" x2="830" y1="330" y2="330" stroke="#E2556F" stroke-width="6" stroke-dasharray="10 8"/>${txt(760, 380, 'LIMIT', 22, '#FF8DA3', { ls: 2 })}`, 'kept going'],
        [B.m3, 1140, 390, -3, `<rect x="1080" y="320" width="40" height="70" fill="#7F77DD"/><rect x="1130" y="290" width="40" height="100" fill="#7F77DD"/><rect x="1180" y="250" width="40" height="140" fill="#E2556F"/>`, 'size up'],
        [B.m4, 1520, 350, 6, `<ellipse cx="1520" cy="320" rx="44" ry="38" fill="#E2556F"/><rect x="1492" y="348" width="56" height="26" rx="8" fill="#fff"/>`, 'revenge'],
        [B.m5, 960, 700, -2, [0, 1, 2, 3, 4].map(i => `<rect x="${880 + i * 34}" y="${620 + i * 8}" width="22" height="80" rx="4" fill="#fff" stroke="#2C1810" stroke-width="3" transform="rotate(${i * 14} ${891 + i * 34} 700)"/>`).join(''), '1 → 5'],
      ];
      pics.forEach(([at, x, y, r, art, cap]) => { const k = pop(t, at, 0.5); if (k <= 0) return; o += `<g transform="translate(${x},${y}) rotate(${r}) scale(${k}) translate(${-x},${-y})"><rect x="${x - 110}" y="${y - 120}" width="220" height="250" fill="#fff"/><rect x="${x - 95}" y="${y - 105}" width="190" height="160" fill="#F4ECE6"/>${art}${txt(x, y + 100, cap, 26, C.dark, { f: 'Playfair Display', it: true, w: 700 })}<circle cx="${x}" cy="${y - 112}" r="10" fill="#E2556F"/></g>`; });
      return o;
    },

    // Lying awake, staring at the ceiling. The day replays in a loop above her.
    'w12-ceiling': (s, t) => {
      const B = s.b;
      let o = bg('#141026');
      o += `<rect x="260" y="700" width="1400" height="160" rx="30" fill="#3A2F55"/><rect x="260" y="640" width="300" height="100" rx="40" fill="#CFC8FA"/>`;
      o += `<g transform="rotate(-90 760 720)">${you(t, { x: 760, y: 720, scale: 1.0, mood: 'sad' })}</g>`;
      const ring = (t - B.replay) * 0.6;
      ['−$', '⚡', '🎚️', '🥊', '$0'].forEach((e, j) => { const a = ring + j * (Math.PI * 2 / 5), x = 960 + Math.cos(a) * 360, y = 330 + Math.sin(a) * 140; o += fade(seg(t, B.replay, B.replay + 1), `<circle cx="${f1(x)}" cy="${f1(y)}" r="56" fill="#2A2142"/>${txt(x, y + 18, e, 46, '#FF8DA3')}`); });
      o += fade(seg(t, B.now, B.now + 0.5), txt(960, 1000, 'so… now what?', 56, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // A balance scale: HOW YOU GOT THERE vs WHAT YOU DO AFTER. Level.
    'w12-scale': (s, t) => {
      const B = s.b;
      let o = grad('w12e', '#EEEBFB', '#FDF8F5') + bg('url(#w12e)');
      const wob = Math.sin(t * 2) * 8 * (1 - seg(t, B.after + 2, B.after + 5));
      o += `<rect x="950" y="300" width="20" height="560" fill="#8B6A55"/><rect x="820" y="850" width="280" height="30" rx="10" fill="#8B6A55"/><g transform="rotate(${f1(wob)} 960 320)"><rect x="460" y="310" width="1000" height="20" rx="10" fill="#8B6A55"/><line x1="560" y1="330" x2="560" y2="520" stroke="#8B6A55" stroke-width="4"/><line x1="1360" y1="330" x2="1360" y2="520" stroke="#8B6A55" stroke-width="4"/><path d="M420,520 L700,520 Q560,600 420,520 Z" fill="#E8D5C4"/><path d="M1220,520 L1500,520 Q1360,600 1220,520 Z" fill="#E8D5C4"/><rect x="480" y="420" width="160" height="100" rx="14" fill="#B8B3C9"/>${txt(560, 480, 'how', 30, '#fff')}<rect x="1280" y="420" width="160" height="100" rx="14" fill="#2AA594"/>${txt(1360, 480, 'AFTER', 30, '#fff', { ls: 2 })}</g>`;
      o += fade(seg(t, B.after + 3, B.after + 3.6), txt(960, 990, 'just as much', 50, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A spotlight hunts for THE trade.
    'w12-spotlight': (s, t) => {
      const B = s.b;
      let o = bg('#100B16');
      const v = [0.6, 0.62, 0.58, 0.5, 0.45, 0.4, 0.36, 0.3, 0.22, 0.12];
      o += `<rect x="260" y="260" width="1400" height="560" rx="20" fill="#120D1C"/>${candles(300, 300, 1320, 480, v, 10, { slots: 10 })}`;
      const sx = t < B.this ? 600 + 800 * seg(t, B.find, B.this) : 300 + 9 * 132;
      o += `<rect width="1920" height="1080" fill="#100B16" opacity=".45"/><ellipse cx="${f1(sx)}" cy="560" rx="160" ry="260" fill="#FFF8E6" opacity=".22"/><path d="M${f1(sx - 30)},0 L${f1(sx - 160)},300 L${f1(sx + 160)},300 L${f1(sx + 30)},0 Z" fill="#FFF8E6" opacity=".06"/>`;
      o += pill(sx, 220, 'THE trade?', '#E2556F', pop(t, B.this, 0.5), 36);
      return o;
    },

    // Dominoes: loss → again → size → stop → limit → ignored → need it back → BLOWN.
    'w12-dominoes': (s, t) => {
      const B = s.b;
      let o = grad('w12g', '#FDF8F5', '#F3E7DD') + bg('url(#w12g)') + `<rect y="800" width="1920" height="280" fill="#E8D5C4"/>`;
      const icons = ['−$', '↻', '🎚️', '⤵', '🛑', '🙈', '💸', '$0'];
      icons.forEach((e, i) => {
        const x = 220 + i * 210, at = B.chain + 1.2 + i * 0.6, fall = ease(seg(t, at, at + 0.45)), last = i === 7;
        o += `<g transform="rotate(${f1(fall * 70)} ${x + 40} 800)"><rect x="${x}" y="${last ? 520 : 560}" width="80" height="${last ? 280 : 240}" rx="12" fill="${last ? '#E2556F' : i === 0 ? '#F9D89A' : '#fff'}" stroke="#2C1810" stroke-width="5"/>${txt(x + 40, last ? 680 : 700, e, 38, last ? '#fff' : C.dark)}</g>`;
      });
      o += fade(seg(t, B.chain + 0.3, B.chain + 0.8) * (1 - seg(t, B.final - 0.3, B.final)), txt(960, 260, 'a chain of decisions', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.final, B.final + 0.5), pill(1690, 440, 'the outcome', '#E2556F', 1, 30));
      o += fade(seg(t, B.before, B.before + 0.5), pill(260, 440, 'it started here', '#2C1810', 1, 30) + `<circle cx="260" cy="680" r="90" fill="none" stroke="#F9D89A" stroke-width="8"/>`);
      return o;
    },

    // Zoom on the first domino. She points to it.
    'w12-first': (s, t) => {
      const B = s.b;
      let o = grad('w12h', '#FFF4DE', '#FDF8F5') + bg('url(#w12h)');
      o += `<circle cx="760" cy="520" r="${f1(260 + 10 * Math.sin(t * 3))}" fill="#F9D89A" opacity=".3"/><rect x="680" y="300" width="160" height="440" rx="20" fill="#F9D89A" stroke="#2C1810" stroke-width="8"/>${txt(760, 540, '−$', 70, C.dark)}`;
      o += you(t, { x: 1300, y: 960, scale: 1.25, flip: true, frontArm: { a1: -175, a2: -175 } });
      o += fade(seg(t, B.first + 1, B.first + 1.6), txt(960, 170, 'the first moment you knew', 56, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Dayli's confession, warm lamp-lit room, a stack of old account cards.
    'w12-scar': (s, t) => {
      const B = s.b;
      let o = grad('w12i', '#3B2418', '#6A3F26') + bg('url(#w12i)');
      o += `<ellipse cx="420" cy="420" rx="520" ry="420" fill="#F5A857" opacity=".16"/>`;
      o += host(t, { x: 120, y: 340, w: 520, pose: t > B.done ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      for (let i = 0; i < 4; i++) { const k = pop(t, B.real + 0.8 + i * 0.4, 0.4); if (k > 0) o += scaleAt(1300, 500, k, `<g transform="rotate(${-8 + i * 6} 1300 500)"><rect x="${1120 + i * 20}" y="${380 + i * 16}" width="360" height="220" rx="18" fill="#fff"/>${txt(1300 + i * 20, 470 + i * 16, 'EVAL', 30, C.muted, { ls: 6 })}${txt(1300 + i * 20, 540 + i * 16, 'FAILED', 40, '#E2556F', { ls: 4 })}</g>`); }
      if (t > B.prof) o += fade(seg(t, B.prof, B.prof + 0.5), pill(1300, 800, 'profitable first 💔', '#2AA594', 1, 32));
      return o;
    },

    // A hill: up with base hits, a flag where she could've stopped… then over the cliff.
    'w12-hill': (s, t) => {
      const B = s.b;
      let o = grad('w12j', '#CDEBF7', '#FDF8F5') + bg('url(#w12j)');
      const H = x => x < 900 ? 900 - (x / 900) * 420 : x < 1300 ? 480 - (x - 900) * 0.1 : 440 + (x - 1300) * 1.4;
      let p = 'M0,900'; for (let x = 0; x <= 1920; x += 40) p += ` L${x},${f1(Math.min(1080, H(x)))}`;
      o += `<path d="${p} L1920,1080 L0,1080 Z" fill="#B9DDB0"/>`;
      o += `<rect x="1046" y="270" width="8" height="200" fill="#2C1810"/><path d="M1054,270 L1180,300 L1054,330 Z" fill="#2AA594"/>${txt(1100, 250, 'could’ve been done', 28, '#2AA594', { w: 800 })}`;
      const steps = [[s.start, 500], [B.shift, 1050], [B.s1, 1180], [B.s2, 1280], [B.s3, 1360], [B.s4, 1440], [B.gone, 1560]];
      let x = 300; steps.forEach(([at, xx], j) => { if (t > at) x = lerp(j ? steps[j - 1][1] : 300, xx, ease(seg(t, at, at + 1))); });
      const y = Math.min(1060, H(x));
      o += you(t, { x, y, scale: 0.9, walking: true, mood: x > 1300 ? 'sad' : undefined });
      return o;
    },

    // A bandaid labeled "discipline" on a cracked chart. It falls off. A magnifier finds the crack.
    'w12-bandaid': (s, t) => {
      const B = s.b;
      let o = grad('w12k', '#F3E3D6', '#FBF4EF') + bg('url(#w12k)');
      o += `<rect x="460" y="220" width="1000" height="560" rx="30" fill="#120D1C"/>${candles(500, 260, 920, 480, vals(5, 22, -0.01, 0.05, 0.7), 22)}<path d="M960,240 l-30,120 l50,80 l-40,120 l60,100 l-30,100" fill="none" stroke="#FF8DA3" stroke-width="8"/>`;
      const off = seg(t, B.teach + 0.5, B.teach + 1.6);
      if (off < 1) o += `<g opacity="${f1(1 - off)}" transform="translate(${f1(960 + off * 200)},${f1(500 + off * off * 600)}) rotate(${f1(-20 + off * 120)})"><rect x="-170" y="-50" width="340" height="100" rx="40" fill="#F6D2B5"/><rect x="-60" y="-50" width="120" height="100" fill="#E8B898"/>${txt(0, 12, 'discipline', 30, '#8B5A3C', { w: 800 })}</g>`;
      const mg = seg(t, B.where, B.where + 1.5);
      if (mg > 0) { const mx = lerp(1500, 970, ease(mg)), my = lerp(820, 380, ease(mg)); o += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="100" fill="#fff" opacity=".25" stroke="#2C1810" stroke-width="14"/><line x1="${f1(mx + 72)}" y1="${f1(my + 72)}" x2="${f1(mx + 170)}" y2="${f1(my + 170)}" stroke="#2C1810" stroke-width="24" stroke-linecap="round"/>`; }
      ['trade 3?', 'first full stop?', 'gave back profit?', 'sized up?'].forEach((l, j) => { o += pill(360 + j * 400, 900, l, '#7F77DD', pop(t, B.where + 1.5 + j * 0.5, 0.4), 30); });
      return o;
    },

    // The account store: she buys a shiny new box… and climbs in exactly the same.
    'w12-store': (s, t) => {
      const B = s.b;
      let o = wall('w12l', '#E9F2F8', '#D6E6F0', 880, '#B8C8D6');
      for (let i = 0; i < 4; i++) o += `<rect x="${300 + i * 360}" y="260" width="260" height="320" rx="20" fill="#fff" stroke="#7F77DD" stroke-width="6"/>${txt(430 + i * 360, 380, 'NEW', 34, '#7F77DD', { ls: 6 })}${txt(430 + i * 360, 440, 'ACCOUNT', 30, '#7F77DD', { ls: 4 })}`;
      const walk = ease(seg(t, B.same + 2, B.same + 5));
      o += you(t, { x: lerp(200, 790, walk), y: 1000, scale: 1.2, walking: walk > 0 && walk < 1, mood: 'sad' });
      o += fade(seg(t, B.same + 5, B.same + 5.6), txt(960, 180, 'the exact same trader', 52, '#E2556F', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The checkout cart: she reaches for BUY NEW ACCOUNT while feelings swirl; the button dims.
    'w12-cart': (s, t) => {
      const B = s.b;
      let o = wall('w12m', '#3A1420', '#5A2233', 900, '#2A0F18');
      const dim = seg(t, B.button, B.button + 1);
      o += monitor(360, 200, 800, 460, `<rect x="380" y="220" width="760" height="420" fill="#FDF8F5"/>${txt(760, 330, 'CHECKOUT', 30, C.muted, { ls: 6 })}<rect x="510" y="420" width="500" height="130" rx="65" fill="${dim > 0.5 ? '#B8B3C9' : '#7F77DD'}"/>${txt(760, 500, 'BUY NEW ACCOUNT', 34, '#fff', { ls: 2 })}`);
      o += desk(160, 900, 1300) + you(t, { x: 1400, y: 1080, scale: 1.3, flip: true, mood: 'sad', frontArm: dim < 0.5 ? { a1: -175 + Math.sin(t * 9) * 8, a2: -170 } : undefined });
      [[B.f1, 'embarrassed'], [B.f2, 'frustrated'], [B.f3, 'another chance'], [B.f4, 'prove it wasn’t me']].forEach(([at, l], j) => { const a = (t - at) * 0.8 + j * 1.6; o += pill(1400 + Math.cos(a) * 280, 380 + Math.sin(a) * 120, l, '#E2556F', pop(t, at, 0.4) * (1 - dim), 28); });
      o += fade(dim, txt(760, 790, 'not tonight.', 60, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The autopsy lab: lamp on, clipboard, magnifier over the trade log.
    'w12-lab': (s, t) => {
      const B = s.b;
      let o = wall('w12n', '#DDF1EE', '#CFE6E2', 880, '#9DBFB9');
      o += `<path d="M960,0 L960,140" stroke="#2C1810" stroke-width="6"/><path d="M860,140 L1060,140 L1000,220 L920,220 Z" fill="#2AA594"/><path d="M820,220 L1100,220 L1300,820 L620,820 Z" fill="#FFF8E6" opacity=".35"/>`;
      o += `<rect x="560" y="500" width="800" height="340" rx="20" fill="#fff" stroke="#B8C8D6" stroke-width="6"/>`;
      for (let i = 0; i < 9; i++) { const y = 540 + i * 32, k = seg(t, B.autopsy + 0.6 + i * 0.6, B.autopsy + 1 + i * 0.6); o += `<rect x="600" y="${y}" width="22" height="22" rx="4" fill="none" stroke="#2AA594" stroke-width="3"/><rect x="640" y="${y + 6}" width="${f1(560 * k * (0.6 + (i % 3) * 0.15))}" height="10" rx="5" fill="${i === 1 || i === 8 ? '#E2556F' : '#CFE6E2'}"/>`; }
      const mx = 760 + 300 * Math.sin((t - B.autopsy) * 0.8), my = 640 + 80 * Math.cos((t - B.autopsy) * 1.1);
      o += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="70" fill="#fff" opacity=".3" stroke="#2C1810" stroke-width="10"/><line x1="${f1(mx + 50)}" y1="${f1(my + 50)}" x2="${f1(mx + 120)}" y2="${f1(my + 120)}" stroke="#2C1810" stroke-width="18" stroke-linecap="round"/>`;
      o += you(t, { x: 1560, y: 980, scale: 1.2, flip: true, frontArm: { a1: -120, a2: -150 } });
      o += fade(seg(t, B.autopsy + 0.3, B.autopsy + 0.8), txt(960, 330, 'account autopsy', 60, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // An indicator wrench can't fix a broken daily-limit dam.
    'w12-wrench': (s, t) => {
      const B = s.b;
      let o = grad('w12o', '#CDEBF7', '#FDF8F5') + bg('url(#w12o)') + `<rect y="820" width="1920" height="260" fill="#7FC3E0"/>`;
      o += `<rect x="700" y="400" width="520" height="440" fill="#9AA3B8"/>${txt(960, 470, 'DAILY LIMIT', 32, '#fff', { ls: 4 })}<path d="M960,500 l-40,100 l60,60 l-40,180" fill="none" stroke="#2C1810" stroke-width="8"/>`;
      if (t > B.fixing) for (let j = 0; j < 8; j++) { const p = ((t * 0.8) + j * 0.12) % 1; o += `<circle cx="${f1(990 + p * 300)}" cy="${f1(620 + p * p * 220)}" r="10" fill="#7FB8D6"/>`; }
      o += you(t, { x: 460, y: 960, scale: 1.2, frontArm: { a1: -40 + Math.sin(t * 6) * 20, a2: -50 }, hold: `<g transform="rotate(-30)"><rect x="0" y="-10" width="140" height="20" rx="8" fill="#B8B3C9"/><circle cx="150" cy="0" r="24" fill="none" stroke="#B8B3C9" stroke-width="12"/></g>` });
      o += fade(seg(t, B.indicator, B.indicator + 0.4), pill(460, 360, '+1 indicator', '#7F77DD', 1, 30)) + cross(620, 330, pop(t, B.fixing + 1, 0.4), '#E2556F', 30);
      return o;
    },

    // Three corrections, each a lock that matches the leak.
    'w12-locks': (s, t) => {
      const B = s.b;
      let o = grad('w12p', '#E6F5F2', '#FDF8F5') + bg('url(#w12p)');
      const lock = (x, k) => `<g transform="translate(${x},0)" opacity="${f1(k)}"><rect x="-50" y="620" width="100" height="90" rx="14" fill="#2AA594"/><path d="M-30,620 v-30 a30,30 0 0 1 60,0 v30" fill="none" stroke="#2AA594" stroke-width="14"/></g>`;
      const row = (x, at, top, bottom) => { const k = seg(t, at, at + 0.5), lk = seg(t, at + 2, at + 2.6); return fade(k, `<rect x="${x - 220}" y="230" width="440" height="280" rx="30" fill="#fff"/>${top}${txt(x, 470, bottom, 30, C.dark, { w: 800 })}`) + lock(x, lk) + (lk > 0.5 ? txt(x, 790, '', 1, '#000') : ''); };
      o += row(400, B.p1, `${[0, 1, 2].map(i => `<rect x="${330 + i * 50}" y="290" width="36" height="110" rx="8" fill="#7F77DD"/>`).join('')}<rect x="480" y="290" width="36" height="110" rx="8" fill="#E2556F" opacity=".35"/>`, 'max 3 trades');
      o += row(960, B.p2, `<rect x="900" y="300" width="120" height="90" rx="14" fill="#F9D89A"/>${txt(960, 360, '🎚️', 46, C.dark)}`, 'size locked');
      o += row(1520, B.p3, `<rect x="1440" y="290" width="160" height="110" rx="14" fill="#120D1C"/>${txt(1520, 360, '🔒', 46, '#fff')}`, 'platform lockout');
      o += fade(seg(t, B.p3 + 3, B.p3 + 3.6), txt(960, 900, 'the fix matches the behavior', 50, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The rule: three things she won't do, crossed; then the line.
    'w12-rule': (s, t) => {
      const B = s.b;
      let o = grad('w12q', '#EEEBFB', '#DDF1EE') + bg('url(#w12q)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 230, 'I don’t restart until I understand what broke.', 62, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      const ic = [[B.r1, 400, `<rect x="320" y="420" width="160" height="200" rx="14" fill="#fff" stroke="#7F77DD" stroke-width="6"/>${txt(400, 540, '🛒', 60, C.dark)}`], [B.r2, 960, `<rect x="880" y="420" width="160" height="200" rx="14" fill="#fff" stroke="#7F77DD" stroke-width="6"/>${txt(960, 540, '👉📈', 50, C.dark)}`], [B.r3, 1520, `<rect x="1440" y="420" width="160" height="200" rx="14" fill="#fff" stroke="#7F77DD" stroke-width="6"/>${txt(1520, 540, '🤞', 60, C.dark)}`]];
      ic.forEach(([at, x, art]) => { o += fade(a * seg(t, at, at + 0.4), art) + cross(x + 80, 430, a * pop(t, at + 1, 0.4), '#E2556F', 30); });
      o += fade(a * seg(t, B.r4, B.r4 + 0.5), pill(960, 760, 'identify it → measurable fix', '#2AA594', 1, 36));
      if (fin > 0) o += fade(fin, txt(960, 560, 'A new account does not', 76, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 670, 'create a new trader.', 76, '#E2556F', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Ten doors, ten evaluations. She walks through each the same way, same sad result.
    'w12-doors': (s, t) => {
      const B = s.b;
      let o = wall('w12r', '#E9E1F5', '#D9CFEA', 880, '#9C8CB8');
      for (let i = 0; i < 6; i++) o += `<rect x="${140 + i * 290}" y="360" width="220" height="520" rx="10" fill="#7F77DD"/>${txt(250 + i * 290, 330, 'EVAL ' + (i + 1), 28, C.dark, { ls: 2 })}<circle cx="${330 + i * 290}" cy="640" r="10" fill="#F9D89A"/>`;
      const w = seg(t, B.same, s.end);
      o += you(t, { x: 200 + w * 1500, y: 960, scale: 1.1, walking: true, mood: 'sad' });
      for (let i = 0; i < Math.floor(w * 6); i++) o += cross(250 + i * 290, 560, 1, '#E2556F', 34);
      return o;
    },

    // Rewind tape: the day plays backwards until the first broken rule lights up.
    'w12-rewind': (s, t) => {
      const B = s.b;
      let o = wall('w12s', '#1A1424', '#2A2142', 920, '#141026');
      const day = ['open', '+', '+', 'skipped wait', 'full stop', 'sized up', 'limit hit', 'kept going', '$0'];
      const rw = ease(seg(t, B.rewind, B.firstq + 1)), cur = 8 - Math.floor(rw * 5.99);
      o += `<rect x="80" y="380" width="1760" height="240" fill="#0E0A14"/>`;
      for (let x = 100; x < 1840; x += 60) o += `<rect x="${x}" y="392" width="30" height="20" rx="4" fill="#3A2F55"/><rect x="${x}" y="588" width="30" height="20" rx="4" fill="#3A2F55"/>`;
      day.forEach((l, i) => {
        const x = 180 + i * 195, lit = i === 3 ? seg(t, B.theone, B.theone + 0.5) : 0, big = i === 6 ? between(t, B.biggest, B.theone) : 0;
        o += `<rect x="${x - 85}" y="430" width="170" height="140" rx="10" fill="${i >= 7 ? '#3A1420' : '#2A2142'}" stroke="${lit > 0 ? '#F9D89A' : i === cur && t > B.rewind ? '#fff' : '#3A2F55'}" stroke-width="${lit > 0 ? 10 : 4}"/>${txt(x, 510, l, l.length > 6 ? 20 : 30, '#fff', { w: 800 })}`;
        if (big > 0) o += pill(x, 680, 'biggest', '#B8B3C9', big, 26);
        if (lit > 0) o += pill(x, 680, 'FIRST', '#F9D89A', pop(t, B.theone, 0.5), 32, '#1A1424');
      });
      o += fade(seg(t, B.rewind, B.rewind + 0.4), txt(960, 260, '◀◀', 80, '#F9D89A'));
      const bf = seg(t, B.before, B.before + 0.4);
      if (bf > 0) { o += `<line x1="${180 + 2 * 195}" x2="${180 + 3 * 195 - 90}" y1="740" y2="740" stroke="#F9D89A" stroke-width="6"/>`; ['a loss', 'a win', 'gave back', 'missed entry', 'payout', 'daily goal'].forEach((l, j) => { o += pill(260 + j * 280, 860, l, '#3A2F55', pop(t, B.before + 0.6 + j * 0.3, 0.4), 28, '#FF8DA3'); }); }
      return o;
    },

    // One candle in the dark. One rule that would've stopped the rest.
    'w12-candle': (s, t) => {
      const B = s.b;
      let o = bg('#0E0A14');
      const fl = 1 + 0.06 * Math.sin(t * 9) + 0.03 * Math.sin(t * 23);
      o += `<ellipse cx="960" cy="520" rx="${f1(420 * fl)}" ry="${f1(360 * fl)}" fill="#F9D89A" opacity=".12"/><rect x="900" y="560" width="120" height="260" rx="14" fill="#FFF8E6"/><path d="M960,${f1(470 - 20 * fl)} Q1000,530 960,560 Q920,530 960,${f1(470 - 20 * fl)} Z" fill="#F9A857"/>`;
      o += you(t, { x: 1400, y: 1000, scale: 1.2, flip: true });
      o += fade(seg(t, B.big + 3, B.big + 3.6), `<rect x="660" y="860" width="600" height="90" rx="16" fill="none" stroke="#CFC8FA" stroke-width="4" stroke-dasharray="14 10"/>${txt(960, 920, 'the one rule: ______', 34, '#CFC8FA', { w: 700 })}`);
      return o;
    },

    // Tuition receipt. Identity → information. Find, find, build. COLLECTED.
    'w12-tuition': (s, t) => {
      const B = s.b;
      let o = grad('w12t', '#FDF8F5', '#F3E7DD') + bg('url(#w12t)');
      const sw = seg(t, B.info, B.info + 0.8);
      o += `<rect x="260" y="260" width="520" height="360" rx="30" fill="#fff"/>${txt(520, 420, 'IDENTITY', 50, C.muted, { ls: 4, op: f1(1 - sw * 0.6) })}${txt(520, 520, '“I’m a bad trader”', 30, C.muted, { f: 'Playfair Display', it: true, w: 700, op: f1(1 - sw * 0.6) })}<line x1="300" x2="${f1(300 + 440 * seg(t, B.identity + 2, B.identity + 2.6))}" y1="440" y2="440" stroke="#E2556F" stroke-width="7"/>`;
      o += fade(sw, `<rect x="1140" y="260" width="520" height="360" rx="30" fill="#E6F5F2"/>${txt(1400, 420, 'INFORMATION', 50, '#2AA594', { ls: 4 })}${txt(1400, 520, '📋', 70, C.dark)}`);
      [[B.e1, '🔍', '#E2556F'], [B.e2, '⚡', '#7F77DD'], [B.e3, '🛠️', '#2AA594']].forEach(([at, e, col], j) => { o += scaleAt(560 + j * 400, 780, pop(t, at, 0.5) * (1 - seg(t, B.tuition - 0.3, B.tuition)), `<circle cx="${560 + j * 400}" cy="780" r="90" fill="${col}"/>${txt(560 + j * 400, 805, e, 70, '#fff')}`); });
      const tu = seg(t, B.tuition - 0.3, B.tuition + 0.3);
      if (tu > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(tu * 0.95)}"/>`;
        o += fade(tu, `<g transform="rotate(-3 960 540)"><rect x="660" y="230" width="600" height="600" rx="10" fill="#fff" stroke="#E6DDD3" stroke-width="4"/>${txt(960, 320, 'TUITION', 44, C.muted, { ls: 8 })}${txt(960, 380, 'paid to the market', 30, C.muted, { w: 700 })}<line x1="720" x2="1200" y1="430" y2="430" stroke="#E6DDD3" stroke-width="4" stroke-dasharray="10 8"/>${bigNum(960, 540, '$$$', 90, '#E2556F')}</g>`);
        o += scaleAt(960, 690, pop(t, B.tuition + 3, 0.5), `<rect x="700" y="630" width="520" height="120" rx="16" fill="none" stroke="#2AA594" stroke-width="10" transform="rotate(-8 960 690)"/>${txt(960, 715, 'LESSON ✓', 64, '#2AA594', { ls: 6 })}`);
      }
      return o;
    },

    // She closes the old account folder and walks out a new way.
    'w12-new': (s, t) => {
      const B = s.b;
      let o = grad('w12u', '#FFE7C7', '#FDF8F5') + bg('url(#w12u)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      o += sun(1720, 640, 70, t);
      const walk = seg(t, B.l2, s.end);
      o += you(t, { x: 600 + walk * 500, y: 960, scale: 1.25, walking: walk > 0 && walk < 1 });
      o += fade(seg(t, B.l1, B.l1 + 0.5), txt(960, 300, 'A new account doesn’t create a new trader.', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.l2, B.l2 + 0.6), txt(960, 430, 'New behavior does.', 90, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    /* ════ Psychology 13 · Building Confidence Through Data ════════════ */

    // The setup glows. Three green checks. Her hand hovers over BUY… and stops.
    'w13-freeze': (s, t) => {
      const B = s.b;
      let o = wall('w13a', '#2A2142', '#3B2F55', 900, '#1E1730');
      const glow = 0.5 + 0.5 * Math.sin(t * 3);
      o += monitor(300, 180, 820, 460, candles(340, 240, 740, 360, [0.3, 0.32, 0.28, 0.34, 0.31, 0.38, 0.36, 0.44, 0.42, 0.5], Math.floor(4 + seg(t, B.appears - 2, B.appears + 1) * 6), { slots: 12 }) + `<rect x="300" y="180" width="820" height="460" rx="14" fill="none" stroke="#2AA594" stroke-width="${f1(4 + 6 * glow * seg(t, B.appears, B.appears + 0.5))}"/>`);
      ['✓', '✓', '✓'].forEach((c, j) => { o += check(420 + j * 120, 700, pop(t, B.checks + j * 1, 0.4), '#2AA594', 30); });
      o += desk(160, 900, 1600);
      o += pill(900, 830, 'BUY', '#2AA594', 1, 40);
      const hov = t > B.stare ? Math.sin(t * 4) * 10 : 0;
      o += you(t, { x: 1340, y: 1080, scale: 1.3, flip: true, frontArm: t > B.stare ? { a1: -175, a2: -178 + hov * 0.3 } : { a1: 160, a2: 150 } });
      o += thought(1360, 330, 'I don’t know…', between(t, B.idk, B.whatif - 0.1), { size: 44 });
      o += thought(1360, 330, 'what if it doesn’t work?', between(t, B.whatif, s.end), { size: 38 });
      return o;
    },

    // The stall: the setup walks away while she checks Discord, adds lines, flips timeframes.
    'w13-stall': (s, t) => {
      const B = s.b, beats = [B.h1, B.h2, B.h3, B.h4, B.h5], i = sceneOf(t, beats);
      let o = wall('w13b', '#2A2142', '#3B2F55', 900, '#1E1730');
      const n = 10 + Math.floor(seg(t, B.h2, s.end) * 8);
      o += monitor(300, 180, 820, 460, candles(340, 240, 740, 360, [0.3, 0.32, 0.28, 0.34, 0.31, 0.38, 0.36, 0.44, 0.42, 0.5, 0.58, 0.66, 0.72, 0.78, 0.84, 0.88, 0.9, 0.94], n, { slots: 18 }));
      if (i >= 2) for (let j = 0; j < 4; j++) o += fade(seg(t, B.h3 + j * 0.4, B.h3 + j * 0.4 + 0.3), `<path d="M340,${520 - j * 50} ${[...Array(18)].map((_, x) => `L${340 + x * 42},${f1(520 - j * 50 + 16 * Math.sin(x * 0.9 + j * 2))}`).join(' ')}" fill="none" stroke="${['#F9D89A', '#7ECFC0', '#FF8DA3', '#CFC8FA'][j]}" stroke-width="4"/>`);
      if (i === 3) o += `<rect x="1220" y="160" width="540" height="300" rx="20" fill="#36393F"/><rect x="1220" y="160" width="540" height="56" rx="20" fill="#5865F2"/>${txt(1260, 198, '# chat', 28, '#fff', { a: 'start' })}${txt(1260, 270, 'you: thoughts??', 28, '#fff', { a: 'start', w: 700 })}${txt(1260, 330, '…typing', 28, '#B9BBBE', { a: 'start', w: 700 })}${txt(1260, 390, '🤷', 34, '#fff', { a: 'start' })}`;
      if (i === 4) ['1m', '5m', '15m', '1h', '4h'].forEach((l, j) => { o += pill(420 + j * 120, 680, l, j === Math.floor(t * 3) % 5 ? '#7F77DD' : '#3A2F55', 1, 26); });
      o += desk(160, 900, 1600) + you(t, { x: 1500, y: 1080, scale: 1.3, flip: true, mood: 'sad', frontArm: i === 3 ? { a1: -110, a2: -150 } : { a1: 160, a2: 150 }, hold: i === 3 ? `<rect x="-24" y="-60" width="48" height="84" rx="10" fill="#2C1810"/>` : '' });
      o += pill(800, 130, ['hesitate', 'skip', '+1 confirmation', 'ask Discord', 'another timeframe'][i], '#F9D89A', pop(t, beats[i], 0.4), 30, '#2C1810');
      return o;
    },

    // A rope bridge. Does she trust it to hold her? What has she done to test it?
    'w13-bridge': (s, t) => {
      const B = s.b;
      let o = grad('w13c', '#CDEBF7', '#FDF8F5') + bg('url(#w13c)');
      o += `<path d="M0,620 L520,620 L520,1080 L0,1080 Z" fill="#9C7458"/><path d="M1400,620 L1920,620 L1920,1080 L1400,1080 Z" fill="#9C7458"/><rect x="520" y="900" width="880" height="180" fill="#7FC3E0"/>`;
      const sag = 40 + 6 * Math.sin(t * 2);
      o += `<path d="M520,610 Q960,${f1(610 + sag * 2)} 1400,610" fill="none" stroke="#8B6A55" stroke-width="10"/><path d="M520,520 Q960,${f1(520 + sag * 2)} 1400,520" fill="none" stroke="#8B6A55" stroke-width="6"/>`;
      for (let x = 560; x < 1400; x += 60) { const y = 610 + sag * 2 * (1 - Math.pow((x - 960) / 440, 2)); o += `<rect x="${x - 22}" y="${f1(y - 8)}" width="44" height="16" rx="4" fill="#C98B6B"/><line x1="${x}" y1="${f1(y)}" x2="${x}" y2="${f1(y - 90)}" stroke="#8B6A55" stroke-width="3"/>`; }
      o += you(t, { x: 440, y: 620, scale: 1.0, mood: t > B.trust ? 'sad' : undefined, frontArm: t > B.reason ? { a1: -10, a2: 0 } : undefined });
      o += thought(560, 300, 'will it hold me?', between(t, B.trust, B.reason - 0.1), { size: 40 });
      o += fade(seg(t, B.reason + 1, B.reason + 1.6), `${txt(960, 220, 'did you ever test it?', 56, C.dark, { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // Bricks stack into a wall labeled CONFIDENCE.
    'w13-bricks': (s, t) => {
      const B = s.b;
      let o = grad('w13d', '#FFF4DE', '#FDF8F5') + bg('url(#w13d)') + `<rect y="860" width="1920" height="220" fill="#E8D5C4"/>`;
      for (let i = 0; i < 24; i++) { const row = Math.floor(i / 6), col = i % 6, k = ease(seg(t, B.build + 0.5 + i * 0.18, B.build + 0.9 + i * 0.18)); const x = 600 + col * 120 + (row % 2) * 60, y = 800 - row * 70; o += `<rect x="${f1(x)}" y="${f1(y - (1 - k) * 400)}" width="112" height="62" rx="8" fill="${['#2AA594', '#7F77DD', '#E2B04A', '#F4829A'][row]}" opacity="${f1(k)}"/>`; }
      o += you(t, { x: 380, y: 920, scale: 1.2, frontArm: { a1: -30, a2: -40 } });
      o += fade(seg(t, B.build + 4.5, B.build + 5), txt(1020, 450, 'built.', 90, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A crystal ball says WIN. It cracks. Nobody knows the next trade.
    'w13-ball': (s, t) => {
      const B = s.b;
      let o = grad('w13e', '#2B2752', '#5B4E9A') + bg('url(#w13e)');
      const crack = seg(t, B.not, B.not + 0.6);
      o += `<ellipse cx="960" cy="860" rx="200" ry="40" fill="#1E1834"/><rect x="820" y="780" width="280" height="90" rx="20" fill="#8B6A55"/><circle cx="960" cy="560" r="240" fill="#CFC8FA" opacity=".55"/><circle cx="900" cy="490" r="60" fill="#fff" opacity=".4"/>`;
      o += fade((1 - crack) * seg(t, B.know, B.know + 0.6), txt(960, 590, 'WIN', 110, '#fff', { op: f1(0.6 + 0.4 * Math.sin(t * 4)) }));
      if (crack > 0) o += `<path d="M960,320 l-40,90 l60,50 l-50,110 l70,70 l-30,120" fill="none" stroke="#fff" stroke-width="8" opacity="${f1(crack)}"/>`;
      o += fade(seg(t, B.next, B.next + 0.6), txt(960, 590, '?', 200, '#fff', { f: 'Playfair Display' }));
      o += you(t, { x: 360, y: 1000, scale: 1.2, frontArm: { a1: -20, a2: -30 } });
      return o;
    },

    // A recipe card she's written herself, items checking off. A pot of results simmering.
    'w13-recipe': (s, t) => {
      const B = s.b;
      let o = wall('w13f', '#FFF4DE', '#F6E7DA', 860, '#C98B6B');
      o += `<rect x="260" y="160" width="620" height="760" rx="16" fill="#fff" stroke="#EADFD8" stroke-width="6"/>${txt(570, 240, 'MY SETUP', 40, '#7F77DD', { ls: 6 })}`;
      ['👀', '🧪', '📓', '✅', '❌', '📉', '📊'].forEach((e, j) => { const at = [B.c1, B.c2, B.c3, B.c4, B.c5, B.c6, B.c7][j], y = 320 + j * 85; o += fade(seg(t, at, at + 0.4), txt(330, y + 16, e, 44, C.dark) + `<rect x="400" y="${y}" width="${f1(380 * seg(t, at, at + 0.8))}" height="14" rx="7" fill="#EADFD8"/>`) + check(830, y + 6, pop(t, at + 0.4, 0.4), '#2AA594', 22); });
      o += `<rect x="1000" y="620" width="380" height="240" rx="30" fill="#3A2F55"/><ellipse cx="1190" cy="620" rx="190" ry="36" fill="#5A4C7A"/>`;
      for (let j = 0; j < 3; j++) { const p = (t * 0.5 + j / 3) % 1; o += `<path d="M${1120 + j * 60},${f1(590 - p * 120)} q12,-18 0,-36" stroke="#fff" stroke-width="6" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.6)}"/>`; }
      o += you(t, { x: 1600, y: 960, scale: 1.1, flip: true });
      return o;
    },

    // Five trades. A yo-yo between "amazing" and "this doesn't work".
    'w13-yoyo': (s, t) => {
      const B = s.b;
      let o = grad('w13g', '#F4C2CE', '#FDE8ED') + bg('url(#w13g)');
      const ph = t < B.win ? 0 : t < B.loss ? 1 : -1;
      const yy = 560 + (ph === 1 ? -220 : ph === -1 ? 220 : 160 * Math.sin(t * 3));
      o += `<line x1="960" y1="0" x2="960" y2="${f1(yy)}" stroke="#2C1810" stroke-width="4"/><circle cx="960" cy="${f1(yy)}" r="70" fill="${ph === -1 ? '#E2556F' : '#2AA594'}"/>`;
      [1, -1, 1, 1, -1].forEach((r, i) => { o += pill(360 + i * 300, 980, r > 0 ? 'W' : 'L', r > 0 ? '#2AA594' : '#E2556F', pop(t, B.five + 0.5 + i * 0.4, 0.3), 34); });
      o += you(t, { x: 1500, y: 900, scale: 1.1, flip: true, mood: ph === -1 ? 'sad' : undefined, frontArm: ph === 1 ? { a1: -160, a2: -170 } : undefined });
      o += thought(1500, 280, ph === 1 ? 'AMAZING!' : 'this doesn’t work!', ph ? 1 : 0, { size: 44 });
      return o;
    },

    // A jar of 100 marbles. One marble rolls out; the jar barely notices.
    'w13-jar': (s, t) => {
      const B = s.b;
      let o = wall('w13h', '#E6F5F2', '#DDF1EE', 860, '#9DBFB9');
      o += `<rect x="700" y="260" width="520" height="600" rx="70" fill="#fff" opacity=".5" stroke="#B8C8D6" stroke-width="10"/><rect x="740" y="220" width="440" height="60" rx="16" fill="#8B6A55"/>`;
      for (let i = 0; i < 100; i++) { const x = 750 + (i % 10) * 44, y = 820 - Math.floor(i / 10) * 44; o += `<circle cx="${x + 20}" cy="${y}" r="18" fill="${((i * 37) % 100) < 43 ? '#2AA594' : '#E2556F'}"/>`; }
      const r = seg(t, B.weight + 0.5, B.weight + 2.5);
      o += `<circle cx="${f1(1240 + r * 400)}" cy="${f1(840)}" r="18" fill="#E2556F"/>`;
      o += you(t, { x: 380, y: 960, scale: 1.2 });
      o += fade(seg(t, B.weight + 2, B.weight + 2.6), txt(960, 160, 'one trade. not the whole jar.', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Dayli at her desk with a stack of old charts, running the numbers. The win-rate gauge settles at 43%.
    'w13-desk': (s, t) => {
      const B = s.b;
      let o = grad('w13i', '#F3E3D6', '#FBF4EF') + bg('url(#w13i)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.ninety ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      for (let i = 0; i < 6; i++) o += `<rect x="${760 + i * 14}" y="${700 - i * 18}" width="300" height="200" rx="10" fill="#120D1C" stroke="#3A2F55" stroke-width="4"/>`;
      const v = t < B.ninety ? 0.9 : 0.9 - 0.47 * ease(seg(t, B.ninety + 1, B.ninety + 3)), ang = Math.PI * (1 - v);
      o += `<path d="M1220,620 A300,300 0 0 1 1820,620" fill="none" stroke="#fff" stroke-width="60"/><path d="M1220,620 A300,300 0 0 1 ${f1(1520 + 300 * Math.cos(ang))},${f1(620 - 300 * Math.sin(ang))}" fill="none" stroke="#7F77DD" stroke-width="60"/>${bigNum(1520, 600, Math.round(v * 100) + '%', 90, C.dark)}`;
      o += fade(seg(t, B.need, B.need + 0.5), pill(1520, 720, 'and that’s okay', '#2AA594', 1, 32));
      return o;
    },

    // Seesaw: small green wins outweigh lots of little red losses.
    'w13-seesaw': (s, t) => {
      const B = s.b;
      let o = grad('w13j', '#CDEBF7', '#FDF8F5') + bg('url(#w13j)') + `<rect y="860" width="1920" height="220" fill="#B9DDB0"/>`;
      o += thought(560, 260, '“Girl, that’s terrible.”', between(t, B.forty + 1.5, B.rr), { size: 40 });
      const nL = Math.min(6, Math.floor(seg(t, B.rr + 0.5, B.rr + 3) * 7)), nW = Math.min(4, Math.floor(seg(t, B.rr + 1, B.rr + 3.5) * 5));
      const tipv = (nW * 2.5 - nL) * 1.6;
      o += `<path d="M960,640 L880,860 L1040,860 Z" fill="#8B6A55"/><g transform="rotate(${f1(-tipv)} 960 640)"><rect x="360" y="620" width="1200" height="30" rx="14" fill="#C98B6B"/>`;
      for (let i = 0; i < nL; i++) o += `<rect x="${1180 + (i % 3) * 70}" y="${560 - Math.floor(i / 3) * 60}" width="60" height="60" rx="10" fill="#E2556F"/>`;
      for (let i = 0; i < nW; i++) o += `<rect x="${420 + (i % 2) * 140}" y="${470 - Math.floor(i / 2) * 150}" width="130" height="150" rx="14" fill="#2AA594"/>`;
      o += `</g>`;
      o += fade(seg(t, B.rr + 0.3, B.rr + 0.8), `${pill(560, 200, 'bigger wins', '#2AA594', 1, 30)}${pill(1360, 200, 'smaller losses', '#E2556F', 1, 30)}`);
      o += fade(seg(t, B.rr, B.rr + 0.5), txt(960, 980, 'risk-to-reward', 46, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Rain was in the forecast. She already has the umbrella.
    'w13-rain': (s, t) => {
      const B = s.b;
      let o = grad('w13k', '#C9D3E2', '#E9EEF5') + bg('url(#w13k)') + `<rect y="860" width="1920" height="220" fill="#9AA3B8"/>` + rain(0, 1920, 0, 860, t, 34, '#7F92B8');
      o += `<rect x="1200" y="220" width="520" height="300" rx="24" fill="#fff"/>${txt(1460, 290, 'FORECAST', 30, C.muted, { ls: 6 })}${cloud(1460, 400, 0.6, '#9AA3B8')}${txt(1460, 490, 'some losses', 30, '#E2556F', { w: 800 })}`;
      o += you(t, { x: 600, y: 980, scale: 1.25, frontArm: { a1: -60, a2: -80 } }) + `<path d="M440,520 A250,170 0 0 1 940,520 Z" fill="#2AA594"/><line x1="690" y1="520" x2="690" y2="700" stroke="#2C1810" stroke-width="10"/>`;
      o += thought(560, 260, '😱 shocked?', between(t, B.shocked + 1, B.shocked + 4), { size: 38 });
      o += fade(seg(t, B.shocked + 4.5, B.shocked + 5), thought(560, 260, 'expected.', 1, { size: 44 }));
      return o;
    },

    // A sturdy bridge of 100 planks: some planks are red, it still carries her across.
    'w13-bridge2': (s, t) => {
      const B = s.b;
      let o = grad('w13l', '#CDEBF7', '#FDF8F5') + bg('url(#w13l)');
      o += `<path d="M0,640 L240,640 L240,1080 L0,1080 Z" fill="#9C7458"/><path d="M1680,640 L1920,640 L1920,1080 L1680,1080 Z" fill="#9C7458"/><rect x="240" y="900" width="1440" height="180" fill="#7FC3E0"/><rect x="240" y="640" width="1440" height="24" fill="#8B6A55"/>`;
      for (let x = 250; x < 1680; x += 44) o += `<rect x="${x}" y="612" width="38" height="28" rx="4" fill="${((x * 7) % 100) < 55 ? '#E2556F' : '#2AA594'}"/>`;
      for (let x = 300; x < 1680; x += 240) o += `<rect x="${x}" y="664" width="20" height="240" fill="#8B6A55"/>`;
      const w = seg(t, B.dontneed, s.end);
      o += you(t, { x: 200 + w * 1500, y: 612, scale: 0.9, walking: w > 0 && w < 1 });
      o += fade(seg(t, B.data, B.data + 0.5) * (1 - seg(t, B.dontneed, B.dontneed + 0.4)), thought(960, 300, 'is THIS plank safe?', 1, { size: 40 }));
      o += fade(seg(t, B.dontneed + 1, B.dontneed + 1.6), txt(960, 260, 'the whole bridge holds', 56, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // A folder labeled EVIDENCE gets fatter; the confirmation lines get crossed out.
    'w13-folder': (s, t) => {
      const B = s.b;
      let o = grad('w13m', '#FFF4DE', '#FDF8F5') + bg('url(#w13m)');
      o += `<rect x="220" y="260" width="620" height="420" rx="24" fill="#120D1C"/>${candles(250, 300, 560, 340, vals(9, 14, 0.01, 0.04, 0.4), 14)}`;
      for (let j = 0; j < 4; j++) o += fade(seg(t, B.more + j * 0.4, B.more + j * 0.4 + 0.3), `<path d="M250,${520 - j * 40} ${[...Array(14)].map((_, x) => `L${250 + x * 40},${f1(520 - j * 40 + 18 * Math.sin(x + j))}`).join(' ')}" fill="none" stroke="${['#F9D89A', '#7ECFC0', '#FF8DA3', '#CFC8FA'][j]}" stroke-width="4"/>`);
      o += cross(820, 280, pop(t, B.evidence, 0.4), '#E2556F', 40);
      const fat = ease(seg(t, B.evidence, B.evidence + 2));
      o += `<rect x="1100" y="${f1(360 - fat * 60)}" width="560" height="${f1(320 + fat * 60)}" rx="20" fill="#F9D89A"/><rect x="1100" y="${f1(320 - fat * 60)}" width="220" height="70" rx="16" fill="#F9D89A"/>${[...Array(Math.floor(fat * 8))].map((_, i) => `<rect x="1130" y="${f1(380 - fat * 60 + i * 12)}" width="500" height="8" fill="#fff" opacity=".7"/>`).join('')}${txt(1380, 580, 'EVIDENCE', 50, '#B38A2E', { ls: 6 })}`;
      return o;
    },

    // The library: she pulls chart after chart off endless shelves.
    'w13-library': (s, t) => {
      const B = s.b;
      let o = wall('w13n', '#8B5A3C', '#6A3F26', 900, '#4A2A18');
      for (let r = 0; r < 4; r++) { o += `<rect x="100" y="${180 + r * 180}" width="1720" height="16" fill="#3A2418"/>`; for (let c = 0; c < 26; c++) { const lit = r * 26 + c < seg(t, B.backtest, B.backtest + 5) * 104; o += `<rect x="${120 + c * 66}" y="${60 + r * 180}" width="54" height="120" rx="6" fill="${lit ? (((r * 26 + c) * 37) % 100 < 43 ? '#2AA594' : '#E2556F') : '#F6EFEA'}"/>`; } }
      o += you(t, { x: 960 + 400 * Math.sin((t - B.backtest) * 0.7), y: 1040, scale: 1.0, walking: true });
      o += fade(seg(t, B.backtest + 1, B.backtest + 1.6), pill(960, 980, 'again… and again… and again', '#2C1810', 1, 34));
      return o;
    },

    // A thought bubble "I feel like it works" pops; three stamped proof cards slide in.
    'w13-proof': (s, t) => {
      const B = s.b;
      let o = grad('w13o', '#EEEBFB', '#FDF8F5') + bg('url(#w13o)');
      const popd = seg(t, B.e1 - 0.4, B.e1);
      if (popd < 1) o += fade(1 - popd, scaleAt(960, 260, 1 + popd * 0.4, thought(960, 260, 'I feel like it works…', 1, { size: 44 })));
      [[B.e1, '🧪', 'TESTED'], [B.e2, '📓', 'TRACKED'], [B.e3, '📊', 'UNDERSTOOD']].forEach(([at, e, l], j) => { const x = 460 + j * 500, k = ease(seg(t, at, at + 0.6)); o += fade(k, `<g transform="translate(${f1(x)},${f1(lerp(1200, 600, k))}) rotate(${-4 + j * 4})"><rect x="-200" y="-200" width="400" height="400" rx="24" fill="#fff"/>${txt(0, -20, e, 110, C.dark)}<rect x="-150" y="80" width="300" height="70" rx="10" fill="none" stroke="#2AA594" stroke-width="6"/>${txt(0, 128, l, 34, '#2AA594', { ls: 4 })}</g>`); });
      return o;
    },

    // Bonsai: she keeps snipping branches (each a losing trade) until the tree is a twig.
    'w13-bonsai': (s, t) => {
      const B = s.b;
      let o = grad('w13p', '#E6F5F2', '#FDF8F5') + bg('url(#w13p)') + `<rect y="860" width="1920" height="220" fill="#E8D5C4"/>`;
      const cut = Math.min(7, Math.floor(seg(t, B.rules, B.rules + 9) * 8));
      o += `<rect x="760" y="760" width="400" height="110" rx="20" fill="#C98B6B"/><path d="M960,760 C940,620 980,520 960,380" stroke="#8B6A55" stroke-width="30" fill="none"/>`;
      const br = [[-1, 640], [1, 600], [-1, 540], [1, 500], [-1, 450], [1, 420], [-1, 390]];
      br.forEach(([d, y], i) => { if (i < cut) return; o += `<line x1="960" y1="${y}" x2="${960 + d * 200}" y2="${y - 80}" stroke="#8B6A55" stroke-width="16"/><circle cx="${960 + d * 220}" cy="${y - 90}" r="60" fill="#7CC79A"/>`; });
      o += you(t, { x: 1340, y: 960, scale: 1.1, flip: true, frontArm: { a1: -150 + Math.sin(t * 8) * 10, a2: -160 }, hold: `<path d="M0,0 l40,-12 M0,0 l40,12" stroke="#B8B3C9" stroke-width="8"/>` });
      o += fade(seg(t, B.rules + 6, B.rules + 6.6), pill(560, 260, 'perfect in hindsight', '#2AA594', 1, 32));
      o += fade(seg(t, B.rules + 9, B.rules + 9.6), pill(560, 360, 'impossible in real time', '#E2556F', 1, 32));
      o += fade(seg(t, B.perfect, B.perfect + 0.5) * (1 - seg(t, B.rules, B.rules + 0.5)), txt(960, 200, 'don’t hunt for perfection', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // The rule: streaks don't decide. Test, track, journal, review. Then the line.
    'w13-rule': (s, t) => {
      const B = s.b;
      let o = grad('w13q', '#EEEBFB', '#DDF1EE') + bg('url(#w13q)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 230, 'I build confidence through evidence, not emotion.', 58, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a * seg(t, B.r1, B.r1 + 0.4), `${[0, 1, 2, 3].map(i => `<circle cx="${420 + i * 70}" cy="460" r="26" fill="#2AA594"/>`).join('')}${txt(530, 560, '≠ valid', 36, C.dark, { w: 800 })}`);
      o += fade(a * seg(t, B.r2, B.r2 + 0.4), `${[0, 1, 2, 3].map(i => `<circle cx="${1290 + i * 70}" cy="460" r="26" fill="#E2556F"/>`).join('')}${txt(1400, 560, '≠ invalid', 36, C.dark, { w: 800 })}`);
      ['🧪', '📈', '📓', '🔍'].forEach((e, j) => { o += fade(a, scaleAt(510 + j * 300, 760, pop(t, B.r3 + j * 0.5, 0.4), `<circle cx="${510 + j * 300}" cy="760" r="90" fill="#fff"/>${txt(510 + j * 300, 790, e, 70, C.dark)}`)); });
      if (fin > 0) o += fade(fin, txt(960, 500, 'Confidence isn’t believing my next trade will win.', 52, C.muted, { f: 'Playfair Display', it: true })) + fade(seg(t, B.line + 3.5, B.line + 4.1), txt(960, 640, 'It’s having enough evidence that I don’t need it to.', 54, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The courtroom: three flimsy exhibits get thrown out.
    'w13-court': (s, t) => {
      const B = s.b;
      let o = wall('w13r', '#6A3F26', '#4A2A18', 860, '#3A2418');
      o += `<rect x="620" y="260" width="680" height="360" rx="10" fill="#8B5A3C"/><rect x="580" y="600" width="760" height="40" fill="#6A3F26"/>${txt(960, 340, 'EXHIBITS', 40, '#F9D89A', { ls: 8 })}`;
      [['👀 “saw someone trade it”', 0], ['📱 “looked good on TikTok”', 1], ['🏆 “won 3 last week”', 2]].forEach(([l, j]) => { const at = B.what + 1 + j * 1, k = pop(t, at, 0.4), out = seg(t, at + 0.8, at + 1.4); if (k <= 0 || out >= 1) return; o += `<g transform="translate(${f1(960 + out * (j - 1) * 900)},${f1(440 + j * 50 - out * 300)}) rotate(${f1(out * (j - 1) * 60)})" opacity="${f1(1 - out)}"><rect x="-260" y="-40" width="520" height="80" rx="12" fill="#fff"/>${txt(0, 14, l, 30, C.dark, { w: 800 })}</g>`; });
      o += you(t, { x: 1560, y: 960, scale: 1.2, flip: true });
      o += fade(seg(t, B.what, B.what + 0.5), txt(960, 170, 'what evidence do I actually have?', 52, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // A car dashboard of evidence gauges: each one blinks "?" until she knows the number.
    'w13-gauges': (s, t) => {
      const B = s.b;
      let o = grad('w13s', '#1D2433', '#2B3550') + bg('url(#w13s)');
      ['🧪 #', '📓 #', '% win', 'avg W : L', 'conditions', 'losers'].forEach((l, j) => {
        const at = [B.q1, B.q2, B.q3, B.q4, B.q5, B.q6][j], x = 360 + (j % 3) * 600, y = 360 + Math.floor(j / 3) * 380, k = seg(t, at, at + 0.4), blink = Math.sin(t * 5 + j) > 0;
        o += fade(k, `<circle cx="${x}" cy="${y}" r="150" fill="#141A26" stroke="#3A4560" stroke-width="10"/>${txt(x, y + 30, '?', 110, blink ? '#F9D89A' : '#5A6580')}${txt(x, y + 210, l, 34, '#CFC8FA')}`);
      });
      return o;
    },

    // A seed in the dirt: "not enough evidence… yet." It sprouts.
    'w13-seed': (s, t) => {
      const B = s.b;
      let o = grad('w13t', '#FFE7C7', '#FDF8F5') + bg('url(#w13t)') + `<rect y="760" width="1920" height="320" fill="#9C7458"/>`;
      const g = ease(seg(t, B.yet, B.yet + 3));
      o += `<ellipse cx="960" cy="780" rx="40" ry="24" fill="#6A3F26"/><path d="M960,780 L960,${f1(780 - 260 * g)}" stroke="#2AA594" stroke-width="12" stroke-linecap="round"/>${g > 0.4 ? `<ellipse cx="${f1(1000)}" cy="${f1(780 - 180 * g)}" rx="${f1(50 * g)}" ry="${f1(22 * g)}" fill="#2AA594"/><ellipse cx="${f1(920)}" cy="${f1(780 - 230 * g)}" rx="${f1(50 * g)}" ry="${f1(22 * g)}" fill="#2AA594"/>` : ''}`;
      o += you(t, { x: 1400, y: 840, scale: 1.1, flip: true, frontArm: { a1: -40, a2: -60 } });
      o += fade(seg(t, B.unconf, B.unconf + 0.5) * (1 - seg(t, B.yet, B.yet + 0.4)), pill(960, 300, '“unconfident trader”', '#B8B3C9', 1, 34) + cross(1180, 280, pop(t, B.unconf + 1.5, 0.4), '#E2556F', 30));
      o += fade(seg(t, B.yet + 0.5, B.yet + 1.1), txt(960, 260, 'not enough evidence… yet.', 60, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Her toolbox: test, journal, review, collect. Building, not feeling.
    'w13-tools': (s, t) => {
      const B = s.b;
      let o = grad('w13u', '#E6F5F2', '#FDF8F5') + bg('url(#w13u)') + `<rect y="860" width="1920" height="220" fill="#E8D5C4"/>`;
      o += fade(seg(t, B.stop, B.stop + 0.4) * (1 - seg(t, B.buildit, B.buildit + 0.4)), heart(960, 420, 3, '#F4829A') + cross(1080, 300, pop(t, B.stop + 1.5, 0.4), '#E2556F', 40));
      [[B.b1, '🧪', '#2AA594'], [B.b2, '📓', '#7F77DD'], [B.b3, '🔍', '#E2B04A'], [B.b4, '📊', '#F4829A']].forEach(([at, e, col], j) => { const x = 420 + j * 360, k = pop(t, at, 0.5); o += scaleAt(x, 560, k, `<rect x="${x - 130}" y="${560 - 60 - j * 40}" width="260" height="${300 + j * 40}" rx="20" fill="${col}"/>${txt(x, 640, e, 90, '#fff')}`); });
      o += fade(seg(t, B.buildit, B.buildit + 0.4), txt(960, 200, 'build it.', 80, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // She rides solo: training wheels (Dayli, Discord) come off. She knows why she takes it.
    'w13-solo': (s, t) => {
      const B = s.b;
      let o = grad('w13v', '#CDEBF7', '#FDF8F5') + bg('url(#w13v)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/><rect y="860" width="1920" height="60" fill="#E8D5C4"/>`;
      const ride = seg(t, B.you, s.end), x = 400 + ride * 1000;
      const w1 = seg(t, B.dayli + 1.5, B.dayli + 2.5), w2 = seg(t, B.discord + 1.5, B.discord + 2.5);
      o += `<g transform="translate(${f1(x)},0)"><circle cx="-90" cy="850" r="60" fill="none" stroke="#2C1810" stroke-width="10"/><circle cx="110" cy="850" r="60" fill="none" stroke="#2C1810" stroke-width="10"/><path d="M-90,850 L0,780 L110,850 M0,780 L60,720" stroke="#E2556F" stroke-width="12" fill="none"/>${w1 < 1 ? `<g opacity="${f1(1 - w1)}" transform="translate(${f1(-w1 * 200)},${f1(w1 * 80)})"><circle cx="-130" cy="870" r="24" fill="#7F77DD"/>${txt(-130, 930, 'Dayli', 22, C.dark)}</g>` : ''}${w2 < 1 ? `<g opacity="${f1(1 - w2)}" transform="translate(${f1(-w2 * 200)},${f1(w2 * 80)})"><circle cx="150" cy="870" r="24" fill="#5865F2"/>${txt(150, 930, 'Discord', 22, C.dark)}</g>` : ''}</g>`;
      o += you(t, { x: x + 10, y: 860, scale: 0.8, frontArm: { a1: -20, a2: 0 } });
      o += fade(seg(t, B.you, B.you + 0.5), txt(960, 220, 'you know why YOU take it', 60, '#2AA594', { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.indep, B.indep + 0.5), pill(960, 340, 'independence', '#2C1810', 1, 40));
      return o;
    },

    /* ════ Psychology 14 · Your Trading Routine ════════════════════════ */

    // Still in bed, phone glowing in her face: the 1-minute chart is already moving.
    'w14-bed': (s, t) => {
      const B = s.b;
      let o = wall('w14a', '#3B2F55', '#6A5A8C', 860, '#2A2142');
      o += windowBox(1400, 140, 380, 340, '#F7B98E', `<circle cx="1590" cy="${f1(420 - 80 * seg(t, s.start, s.end))}" r="60" fill="#FFF1C9"/>`);
      o += `<rect x="260" y="640" width="1000" height="200" rx="30" fill="#fff"/><rect x="260" y="700" width="1000" height="160" rx="20" fill="#7F77DD"/><rect x="280" y="600" width="220" height="80" rx="34" fill="#fff"/>`;
      o += `<g transform="rotate(-80 520 640)">${you(t, { x: 520, y: 640, scale: 1.0, frontArm: { a1: -100, a2: -120 } })}</g>`;
      o += `<ellipse cx="560" cy="520" rx="200" ry="120" fill="#7F77DD" opacity="${f1(0.2 + 0.05 * Math.sin(t * 4))}"/>`;
      o += phone(640, 500, 1.6, candles(-36, -60, 72, 110, vals(5, 10, 0.01, 0.06, 0.4), 4 + Math.floor(seg(t, B.wake, s.end) * 6)));
      o += thought(900, 300, 'kinda looks like my setup…', between(t, B.kinda, s.end), { size: 38 });
      return o;
    },

    // Juggling: levels, bias, higher timeframe… and she's in a trade before she knows it.
    'w14-juggle': (s, t) => {
      const B = s.b;
      let o = grad('w14b', '#FFF4DE', '#F6E7DA') + bg('url(#w14b)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      const items = [['📏', '#E2B04A'], ['🧭', '#7F77DD'], ['🔭', '#2AA594'], ['⏱️', '#F4829A']];
      items.forEach(([e, col], j) => { const a = (t - B.scramble) * 3.2 + j * Math.PI / 2, x = 960 + Math.cos(a) * 220, y = 380 - Math.abs(Math.sin(a)) * 220; if (t > B.scramble + j * 0.6) o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="56" fill="${col}"/>${txt(x, y + 18, e, 46, '#fff')}`; });
      const fall = seg(t, B.intrade, B.intrade + 1);
      o += you(t, { x: 960, y: 960, scale: 1.3, frontArm: { a1: -120 + Math.sin(t * 9) * 20, a2: -150 }, backArm: { a1: -60 - Math.sin(t * 9) * 20, a2: -30 }, mood: fall > 0 ? 'sad' : undefined });
      o += scaleAt(1400, 700, pop(t, B.intrade + 0.3, 0.5), `<rect x="1240" y="640" width="320" height="110" rx="55" fill="#E2556F"/>${txt(1400, 712, 'IN A TRADE', 38, '#fff', { ls: 2 })}`);
      return o;
    },

    // An empty planner: three blank lines get a "?" each.
    'w14-noplan': (s, t) => {
      const B = s.b;
      let o = grad('w14c', '#EEEBFB', '#FDF8F5') + bg('url(#w14c)');
      o += `<rect x="560" y="140" width="800" height="820" rx="20" fill="#fff" stroke="#EADFD8" stroke-width="6"/><rect x="560" y="140" width="800" height="110" rx="20" fill="#7F77DD"/>${txt(960, 215, 'TODAY’S PLAN', 46, '#fff', { ls: 6 })}`;
      [[B.n1, '📋 plan'], [B.n2, '🛑 max loss'], [B.n3, '🎯 waiting for']].forEach(([at, l], j) => { const y = 360 + j * 170; o += `${txt(640, y, l, 40, C.muted, { a: 'start', w: 800 })}<line x1="640" x2="1280" y1="${y + 50}" y2="${y + 50}" stroke="#EADFD8" stroke-width="4"/>` + fade(seg(t, at, at + 0.4), txt(1220, y + 30, '?', 80, '#E2556F')); });
      o += fade(seg(t, B.n4, B.n4 + 0.5), pill(960, 880, 'just opened the chart', '#2C1810', 1, 34));
      return o;
    },

    // Laptop slams shut; trades get swept into a drawer, never seen again.
    'w14-drawer': (s, t) => {
      const B = s.b;
      let o = wall('w14d', '#F3E7DD', '#EADFD8', 860, '#B78F72');
      const cl = ease(seg(t, B.close, B.close + 0.6));
      o += `<rect x="380" y="${f1(500 + 300 * cl)}" width="560" height="${f1(300 * (1 - cl) + 20)}" rx="12" fill="#120D1C" stroke="#3A2F55" stroke-width="8"/><rect x="340" y="820" width="640" height="24" rx="10" fill="#3A2F55"/>` + desk(200, 840, 1000, '#8B6A55');
      const dr = ease(seg(t, B.close + 0.6, B.close + 1.4)), shut = ease(seg(t, B.close + 3, B.close + 3.6));
      o += `<rect x="${f1(640 + 200 * dr * (1 - shut))}" y="900" width="420" height="120" rx="10" fill="#A07A5F" stroke="#6A4A35" stroke-width="6"/><rect x="${f1(820 + 200 * dr * (1 - shut))}" y="950" width="60" height="16" rx="8" fill="#6A4A35"/>`;
      for (let i = 0; i < 5; i++) { const k = ease(seg(t, B.close + 1 + i * 0.3, B.close + 1.6 + i * 0.3)); if (k > 0 && k < 1) o += `<rect x="${f1(lerp(500 + i * 80, 900, k))}" y="${f1(lerp(700, 940, k))}" width="90" height="56" rx="8" fill="${i % 2 ? '#E2556F' : '#2AA594'}"/>`; }
      o += you(t, { x: 1400, y: 1000, scale: 1.2, flip: true, walking: t > B.close + 3.5 });
      return o;
    },

    // Deciding while the river rushes: she tries to build a raft mid-current.
    'w14-river': (s, t) => {
      const B = s.b;
      let o = grad('w14e', '#CDEBF7', '#7FC3E0') + bg('url(#w14e)');
      for (let j = 0; j < 14; j++) { const x = ((t * 320 + j * 170) % 2200) - 140, y = 300 + (j % 7) * 100; o += `<path d="M${f1(x)},${y} q40,-20 80,0 t80,0" fill="none" stroke="#fff" stroke-width="5" opacity=".6"/>`; }
      const bob = Math.sin(t * 3) * 14;
      o += `<g transform="translate(0,${f1(bob)}) rotate(${f1(Math.sin(t * 2) * 6)} 960 680)"><rect x="760" y="660" width="400" height="40" rx="10" fill="#C98B6B"/><rect x="800" y="640" width="60" height="40" rx="8" fill="#C98B6B" transform="rotate(20 830 660)"/></g>`;
      o += you(t, { x: 960, y: 670 + bob, scale: 1.1, mood: t > B.emo ? 'sad' : undefined, frontArm: { a1: -40 + Math.sin(t * 8) * 20, a2: -60 } });
      ['risk?', 'size?', 'entry?', 'stop?'].forEach((l, j) => { const a = t * 1.2 + j * 1.6; o += pill(960 + Math.cos(a) * 420, 300 + Math.sin(a) * 120, l, t > B.emo ? '#E2556F' : '#7F77DD', pop(t, B.every + 1 + j * 0.5, 0.4), 30); });
      return o;
    },

    // The "aesthetic" morning: 5am, journal, meditate, green juice, books, all crossed out.
    'w14-juice': (s, t) => {
      const B = s.b;
      let o = grad('w14f', '#FFF4DE', '#FDE8ED') + bg('url(#w14f)');
      [['⏰', '5:00 AM'], ['📓', 'journal'], ['🧘🏾‍♀️', 'meditate'], ['🥤', 'green juice'], ['📚', '3 chapters']].forEach(([e, l], j) => { const x = 330 + j * 315; o += fade(seg(t, B.list + j * 0.8, B.list + j * 0.8 + 0.4), `<circle cx="${x}" cy="480" r="120" fill="#fff"/>${txt(x, 512, e, 90, C.dark)}${txt(x, 650, l, 34, C.muted, { w: 700 })}`); });
      o += fade(seg(t, B.aesthetic, B.aesthetic + 0.4), txt(960, 200, '✨ the aesthetic routine ✨', 52, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.not, B.not + 0.3), `<line x1="160" x2="1760" y1="480" y2="480" stroke="#E2556F" stroke-width="12"/>${txt(960, 860, 'not that.', 70, '#E2556F', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // A simple three-panel strip: sunrise desk (before), screen (during), notebook + sunset (after).
    'w14-three': (s, t) => {
      const B = s.b;
      let o = bg('#FDF8F5');
      const p = (x, at, sky, inner, l) => fade(seg(t, at, at + 0.5), `<rect x="${x - 270}" y="200" width="540" height="620" rx="30" fill="${sky}"/>${inner}${txt(x, 900, l, 44, C.dark, { ls: 6 })}`);
      o += p(380, B.bda, '#FFE3C7', sun(380, 320, 60, t) + `<rect x="250" y="560" width="260" height="190" rx="10" fill="#fff"/>${[0, 1, 2].map(j => `<rect x="280" y="${600 + j * 44}" width="200" height="12" rx="6" fill="#7F77DD"/>`).join('')}`, 'BEFORE');
      o += p(960, B.bda + 2, '#DDF1EE', `<rect x="760" y="380" width="400" height="260" rx="14" fill="#120D1C"/>${candles(780, 410, 360, 200, [0.3, 0.34, 0.32, 0.42, 0.4, 0.52, 0.6], 7)}`, 'DURING');
      o += p(1540, B.bda + 4, '#F7B98E', `<circle cx="1540" cy="${f1(380 + 40 * seg(t, B.bda + 4, s.end))}" r="60" fill="#FFD8A8"/><rect x="1410" y="560" width="260" height="190" rx="10" fill="#fff"/>${check(1540, 655, pop(t, B.bda + 5, 0.4), '#2AA594', 40)}`, 'AFTER');
      return o;
    },

    // Pre-packed decisions: three labeled jars on a shelf, made in advance.
    'w14-prepacked': (s, t) => {
      const B = s.b;
      let o = wall('w14h', '#FDF8F5', '#F3E7DD', 860, '#C9A27E');
      o += `<rect x="200" y="620" width="1520" height="30" rx="10" fill="#8B6A55"/>`;
      [[B.d1, '🛑', 'risk', '#E2556F'], [B.d2, '📏', 'levels', '#E2B04A'], [B.d3, '🎯', 'setup', '#2AA594']].forEach(([at, e, l, col], j) => {
        const x = 460 + j * 500, k = ease(seg(t, at, at + 0.8));
        o += `<g transform="translate(0,${f1((1 - k) * -500)})" opacity="${f1(k)}"><rect x="${x - 140}" y="320" width="280" height="300" rx="40" fill="#fff" opacity=".7" stroke="#C9B8A8" stroke-width="8"/><rect x="${x - 120}" y="290" width="240" height="40" rx="12" fill="${col}"/>${txt(x, 500, e, 90, C.dark)}<rect x="${x - 100}" y="540" width="200" height="50" rx="10" fill="${col}"/>${txt(x, 576, l, 30, '#fff', { ls: 2 })}</g>`;
      });
      o += you(t, { x: 1700, y: 960, scale: 1.1, flip: true });
      o += fade(seg(t, B.d1 + 1, B.d1 + 1.5), txt(960, 200, 'decided before the session', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Calm-you writes a letter at dawn; emotional-you opens it at 10:17.
    'w14-letter': (s, t) => {
      const B = s.b;
      let o = grad('w14i', '#FFE7C7', '#FDF8F5') + `<rect width="960" height="1080" fill="url(#w14i)"/>` + grad('w14j', '#3A1420', '#1D0B12') + `<rect x="960" width="960" height="1080" fill="url(#w14j)"/>`;
      o += txt(480, 160, '8:30 AM', 54, C.dark, { f: 'JetBrains Mono, monospace' }) + txt(1440, 160, '10:17 AM', 54, '#FF8DA3', { f: 'JetBrains Mono, monospace' });
      o += you(t, { x: 420, y: 980, scale: 1.2, frontArm: { a1: 20, a2: -10 } }) + you(t, { x: 1500, y: 980, scale: 1.2, flip: true, mood: 'sad', frontArm: { a1: -60, a2: -100 } });
      const fly = ease(seg(t, B.calm + 1, B.calm + 3.5));
      o += `<g transform="translate(${f1(lerp(600, 1340, fly))},${f1(lerp(700, 620, fly) - Math.sin(fly * Math.PI) * 200)})">${envelope(0, 0, 1)}</g>`;
      return o;
    },

    // Split: scramble day vs prepared day.
    'w14-twodays': (s, t) => {
      const B = s.b;
      let o = grad('w14k', '#F3E3D6', '#FBF4EF') + bg('url(#w14k)');
      o += host(t, { x: 60, y: 360, w: 480, pose: t > B.notright && t < B.figuring ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      o += fade(seg(t, B.just, B.just + 0.4), `<rect x="680" y="200" width="560" height="560" rx="30" fill="#fff"/>${txt(960, 270, 'just got on', 34, '#E2556F', { ls: 2 })}${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${720 + (i * 61) % 400}" y1="${330 + (i * 47) % 300}" x2="${1180 - (i * 83) % 400}" y2="${380 + (i * 71) % 300}" stroke="${['#F9D89A', '#7F77DD', '#FF8DA3'][i % 3]}" stroke-width="6"/>`).join('')}${txt(960, 720, '🌀', 60, C.dark)}`);
      o += fade(seg(t, B.prepared, B.prepared + 0.4), `<rect x="1300" y="200" width="560" height="560" rx="30" fill="#fff" stroke="#2AA594" stroke-width="8"/>${txt(1580, 270, 'top-down done', 34, '#2AA594', { ls: 2 })}<line x1="1340" x2="1820" y1="400" y2="400" stroke="#E2B04A" stroke-width="6" stroke-dasharray="16 10"/><line x1="1340" x2="1820" y1="560" y2="560" stroke="#7F77DD" stroke-width="6" stroke-dasharray="16 10"/>${txt(1580, 720, '🎯', 60, C.dark)}`);
      o += fade(seg(t, B.figuring, B.figuring + 0.5), pill(1270, 860, 'not figuring it out mid-trade', '#2AA594', 1, 32));
      return o;
    },

    // Walking into the room: she looks around (HTF) before sitting at the screen.
    'w14-room': (s, t) => {
      const B = s.b;
      let o = wall('w14l', '#E9E1F5', '#D9CFEA', 880, '#9C8CB8');
      const zoom = ease(seg(t, B.htf, B.room + 2)), sc = lerp(0.45, 1, zoom);
      o += `<g transform="translate(960,480) scale(${f1(sc)}) translate(-960,-480)"><rect x="260" y="140" width="1400" height="680" rx="20" fill="#120D1C"/>${candles(300, 180, 1320, 600, vals(71, 40, 0.006, 0.04, 0.3), 40)}</g>`;
      ['1m', '15m', '1h', 'daily'].forEach((l, j) => { o += pill(660 + j * 200, 960, l, j <= Math.floor(zoom * 3.99) ? '#7F77DD' : '#B8B3C9', 1, 30); });
      o += you(t, { x: 1720, y: 1000, scale: 1.0, flip: true, frontArm: { a1: -40, a2: -60 } });
      o += fade(seg(t, B.room, B.room + 0.5), txt(960, 100, 'understand the room first', 50, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // At the door, coat on… she peeks back: "ooh, wait…" and gets pulled back in.
    'w14-oops': (s, t) => {
      const B = s.b;
      let o = wall('w14m', '#3B2F55', '#2A2142', 900, '#1E1730');
      o += monitor(220, 220, 700, 420, candles(260, 280, 620, 300, vals(3, 18, 0.012, 0.05, 0.4), 18)) + desk(120, 900, 960);
      o += `<rect x="1460" y="320" width="260" height="580" rx="8" fill="#B27A5A"/><circle cx="1490" cy="620" r="12" fill="#F9D89A"/>`;
      const back = ease(seg(t, B.back, B.back + 1.5)), x = t < B.ooh ? lerp(900, 1400, ease(seg(t, B.bedone, B.watching + 2))) : lerp(1400, 1100, back);
      o += you(t, { x, y: 1000, scale: 1.2, flip: t > B.ooh, walking: (t < B.ooh && t > B.bedone) || (back > 0 && back < 1) });
      o += thought(x + (t > B.ooh ? -60 : 60), 320, '“ooh, wait… this looks good”', between(t, B.ooh, B.back + 1), { size: 36 });
      o += pill(570, 700, 'a trade we never planned', '#E2556F', pop(t, B.back + 1.5, 0.4), 30);
      return o;
    },

    // Packing a suitcase before the trip: HTF, levels, setup, risk, max trades, daily stop.
    'w14-suitcase': (s, t) => {
      const B = s.b;
      let o = grad('w14n', '#E6F5F2', '#FDF8F5') + bg('url(#w14n)') + `<rect y="900" width="1920" height="180" fill="#E8D5C4"/>`;
      o += `<rect x="560" y="520" width="800" height="380" rx="30" fill="#7F77DD"/><rect x="560" y="520" width="800" height="60" rx="20" fill="#5A4C9A"/><rect x="900" y="470" width="120" height="60" rx="20" fill="none" stroke="#5A4C9A" stroke-width="14"/>`;
      ['🔭', '📏', '🎯', '🛑', '#', '📅'].forEach((e, j) => { const at = B.before + 0.6 + j * 0.55, k = ease(seg(t, at, at + 0.5)), tx = 640 + (j % 3) * 260, ty = 640 + Math.floor(j / 3) * 120; o += `<g transform="translate(${f1(lerp(tx, tx, k))},${f1(lerp(ty - 400, ty, k))})" opacity="${f1(k)}"><rect x="-90" y="-50" width="180" height="100" rx="16" fill="#fff"/>${txt(0, 18, e, 50, C.dark)}</g>`; });
      o += you(t, { x: 1560, y: 960, scale: 1.2, flip: true });
      o += fade(seg(t, B.before, B.before + 0.5), txt(960, 260, 'BEFORE', 70, '#7F77DD', { ls: 10 }));
      return o;
    },

    // The mirror check-in: how is she showing up? Mood tags pop around her reflection.
    'w14-mirror': (s, t) => {
      const B = s.b;
      let o = wall('w14o', '#EEEBFB', '#E0DAF2', 900, '#B8B3C9');
      o += `<ellipse cx="960" cy="500" rx="260" ry="360" fill="#fff" stroke="#C9B8A8" stroke-width="18"/><ellipse cx="960" cy="500" rx="235" ry="335" fill="#E6F5F2"/>`;
      o += you(t, { x: 960, y: 820, scale: 1.0 });
      ['😴 tired', '😤 frustrated', '📱 distracted', '💸 desperate', '📉 big loss', '📈 huge win'].forEach((l, j) => { const a = -Math.PI / 2 + j * (Math.PI * 2 / 6), x = 960 + Math.cos(a) * 560, y = 500 + Math.sin(a) * 320; o += pill(x, y, l, '#F4829A', pop(t, B.showing + 0.8 + j * 0.4, 0.4), 30); });
      o += fade(seg(t, B.showing, B.showing + 0.4), txt(960, 100, 'how am I showing up today?', 52, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.you, B.you + 0.5), pill(960, 1000, 'where YOU are = as important as where price is', '#7F77DD', 1, 30));
      return o;
    },

    // A train on rails: during the session, she follows the track she already laid.
    'w14-train': (s, t) => {
      const B = s.b;
      let o = grad('w14p', '#CDEBF7', '#FDF8F5') + bg('url(#w14p)') + `<rect y="780" width="1920" height="300" fill="#B9DDB0"/>`;
      o += `<rect y="760" width="1920" height="16" fill="#8B6A55"/><rect y="800" width="1920" height="16" fill="#8B6A55"/>${[...Array(24)].map((_, i) => `<rect x="${i * 84}" y="756" width="20" height="64" fill="#6A4A35"/>`).join('')}`;
      const stops = ['wait', 'confirm', 'risk', 'manage'];
      stops.forEach((l, j) => { o += `<rect x="${360 + j * 400}" y="560" width="10" height="200" fill="#2C1810"/>` + pill(365 + j * 400, 540, l, '#2AA594', pop(t, B.execute + 0.6 + j * 0.6, 0.4), 30); });
      const tx = 200 + ((t - s.start) * 120) % 1900;
      o += `<rect x="${f1(tx - 160)}" y="600" width="320" height="160" rx="40" fill="#7F77DD"/><rect x="${f1(tx - 120)}" y="630" width="90" height="70" rx="10" fill="#E6F5F2"/>${you(t, { x: tx + 60, y: 700, scale: 0.55 })}`;
      o += fade(seg(t, B.during, B.during + 0.4) * (1 - seg(t, B.execute, B.execute + 0.4)), txt(960, 260, 'no new plans', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.execute, B.execute + 0.4), txt(960, 260, 'run the one you made', 56, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // A smoke alarm: frustration, chasing, sizing up… the alarm is information. Step away.
    'w14-alarm': (s, t) => {
      const B = s.b;
      let o = wall('w14q', '#FDF8F5', '#F3E7DD', 880, '#D9C3B0');
      const on = t > B.notice + 3, fl = on && Math.sin(t * 10) > 0;
      o += `<ellipse cx="960" cy="140" rx="160" ry="44" fill="#fff" stroke="#C9B8A8" stroke-width="6"/><circle cx="960" cy="140" r="16" fill="${fl ? '#E2556F' : '#B8B3C9'}"/>`;
      if (on) for (let j = 0; j < 3; j++) o += `<path d="M${880 - j * 40},${200 + j * 20} q80,40 160,0" fill="none" stroke="#E2556F" stroke-width="5" opacity="${f1(0.6 - j * 0.15)}"/>`;
      ['😤', '🏃', '🎚️', '💪'].forEach((e, j) => { const p = ((t - B.notice) * 0.4 + j * 0.25) % 1; if (t > B.notice + j * 0.8) o += `<circle cx="${f1(560 + j * 260)}" cy="${f1(700 - p * 420)}" r="${f1(40 + p * 30)}" fill="#B8B3C9" opacity="${f1(0.6 * (1 - p))}"/>${txt(560 + j * 260, 716 - p * 420, e, 40, C.dark, { op: f1(1 - p) })}`; });
      o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, frontArm: on ? { a1: -100, a2: -150 } : undefined });
      o += fade(seg(t, B.notice + 4, B.notice + 4.6), pill(960, 960, 'that’s information → step away', '#7F77DD', 1, 34));
      return o;
    },

    // After: the scoreboard (+$500 / −$300) slides away; the review notebook opens.
    'w14-review': (s, t) => {
      const B = s.b;
      let o = grad('w14r', '#F7B98E', '#FDF8F5') + bg('url(#w14r)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      const sl = ease(seg(t, B.after + 0.8, B.after + 1.6));
      o += `<g transform="translate(0,${f1(-sl * 500)})">${bigNum(700, 260, '+$500', 80, '#2AA594')}${bigNum(1220, 260, '−$300', 80, '#E2556F')}</g>`;
      o += `<rect x="560" y="320" width="800" height="560" rx="16" fill="#fff"/><line x1="960" x2="960" y1="320" y2="880" stroke="#EADFD8" stroke-width="6"/>`;
      ['📋', '✅❌', '🛑', '💭', '🔁', '🔧'].forEach((e, j) => { const at = B.after + 1.2 + j * 0.5, x = j < 3 ? 660 : 1060, y = 420 + (j % 3) * 150; o += fade(seg(t, at, at + 0.3), txt(x, y + 18, e, 46, C.dark) + `<rect x="${x + 70}" y="${y}" width="${f1(170 * seg(t, at, at + 0.8))}" height="14" rx="7" fill="#EADFD8"/>`) + check(x + 260, y + 6, pop(t, at + 0.5, 0.4), '#2AA594', 20); });
      o += fade(seg(t, B.after, B.after + 0.4), txt(960, 200, 'AFTER: the part people skip', 52, C.dark, { f: 'Playfair Display', it: true, op: f1(sl) }));
      return o;
    },

    // Leave. Laptop closes, she grabs her bag, heads out into the day.
    'w14-leave': (s, t) => {
      const B = s.b;
      let o = grad('w14s', '#CDEBF7', '#FDF8F5') + bg('url(#w14s)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      o += sun(1600, 220, 80, t) + `<rect x="300" y="320" width="360" height="560" rx="10" fill="#B27A5A"/><rect x="320" y="340" width="320" height="540" fill="#FFF3D6"/>`;
      const out = ease(seg(t, B.leave, B.leave + 2.5));
      o += you(t, { x: lerp(480, 1300, out), y: 960, scale: 1.2, walking: out > 0 && out < 1, frontArm: { a1: 80, a2: 80 }, hold: `<path d="M-30,0 L30,0 L40,70 L-40,70 Z" fill="#F4829A"/>` });
      o += fade(seg(t, B.leave, B.leave + 0.3), txt(960, 200, 'Leave.', 110, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The rule: four stepping stones across the day. Then the line.
    'w14-rule': (s, t) => {
      const B = s.b;
      let o = grad('w14t', '#EEEBFB', '#DDF1EE') + bg('url(#w14t)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 230, 'I follow a process before, during, and after every session.', 52, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      [[B.r1, '📋', '#7F77DD'], [B.r2, '▶️', '#2AA594'], [B.r3, '🔍', '#E2B04A'], [B.r4, '🚪', '#F4829A']].forEach(([at, e, col], j) => {
        const x = 330 + j * 420; o += fade(a, scaleAt(x, 580, pop(t, at, 0.5), `<circle cx="${x}" cy="580" r="140" fill="${col}"/>${txt(x, 616, e, 100, '#fff')}`));
        if (j < 3) o += fade(a * seg(t, at + 0.5, at + 0.9), txt(x + 210, 600, '→', 60, C.dark));
      });
      o += fade(a * seg(t, B.r0, B.r0 + 0.4) * (1 - seg(t, B.r1, B.r1 + 0.3)), txt(960, 580, '“open the chart and see what happens”', 46, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + cross(1420, 540, pop(t, B.r0 + 1.5, 0.4), '#E2556F', 34));
      if (fin > 0) o += fade(fin, txt(960, 520, 'Discipline gets easier when you stop', 62, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 630, 'making every decision in the moment.', 62, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // A blueprint of her trading day: four rooms. "I open TradingView" is just a door.
    'w14-blueprint': (s, t) => {
      const B = s.b;
      let o = bg('#1E3A5F');
      for (let x = 0; x < 1920; x += 60) o += `<line x1="${x}" x2="${x}" y1="0" y2="1080" stroke="#2C4C75" stroke-width="2"/>`;
      for (let y = 0; y < 1080; y += 60) o += `<line x1="0" x2="1920" y1="${y}" y2="${y}" stroke="#2C4C75" stroke-width="2"/>`;
      o += fade(seg(t, B.open, B.open + 0.4) * (1 - seg(t, B.q1 - 0.3, B.q1)), `<rect x="760" y="380" width="400" height="320" fill="none" stroke="#fff" stroke-width="6"/>${txt(960, 560, '🚪 open TradingView', 34, '#fff', { w: 800 })}${txt(960, 780, '…that’s it?', 44, '#F9D89A', { f: 'Playfair Display', it: true })}`);
      [[B.q1, 'BEFORE'], [B.q2, 'DURING'], [B.q3, 'ENDING IT'], [B.q4, 'AFTER']].forEach(([at, l], j) => { const x = 220 + j * 380; o += fade(seg(t, at, at + 0.5), `<rect x="${x}" y="300" width="340" height="460" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="${j === 2 ? '20 14' : '0'}"/>${txt(x + 170, 370, l, 34, '#fff', { ls: 4 })}${txt(x + 170, 560, '?', 100, '#F9D89A')}`); });
      return o;
    },

    // Four pillars hold up her trading day; one is cracked. Start there.
    'w14-weak': (s, t) => {
      const B = s.b;
      let o = grad('w14u', '#EEEBFB', '#FDF8F5') + bg('url(#w14u)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      const tilt = Math.sin(t * 2) * 2 * seg(t, B.least + 1.5, B.least + 2.5);
      o += `<g transform="rotate(${f1(tilt)} 960 300)"><rect x="300" y="260" width="1320" height="60" rx="10" fill="#C98B6B"/></g>`;
      ['before', 'during', 'ending', 'after'].forEach((l, j) => { const x = 420 + j * 360, weak = j === 2, sh = weak ? seg(t, B.least + 1.5, B.least + 2.5) : 0; o += `<rect x="${x - 50}" y="320" width="100" height="560" fill="${weak && sh > 0 ? '#E8C9C9' : '#fff'}" stroke="#C9B8A8" stroke-width="6"/>${weak && sh > 0 ? `<path d="M${x - 20},400 l30,80 l-30,60 l40,90 l-20,80" fill="none" stroke="#E2556F" stroke-width="6"/>` : ''}${txt(x, 940, l, 32, C.dark, { w: 800 })}`; });
      o += pill(1140, 200, 'start building here', '#E2556F', pop(t, B.weak, 0.5), 34);
      o += fade(seg(t, B.least, B.least + 0.5) * (1 - seg(t, B.weak, B.weak + 0.4)), txt(960, 180, 'which part has the least structure?', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // The loop: prepare → execute → review → walk away, spinning gently like a wheel.
    'w14-loop': (s, t) => {
      const B = s.b;
      let o = grad('w14v', '#FFE7C7', '#FDF8F5') + bg('url(#w14v)');
      o += fade(seg(t, B.perfect, B.perfect + 0.4) * (1 - seg(t, B.repeat, B.repeat + 0.4)), `${txt(960, 480, '⏰ 2-hour perfect routine', 54, C.muted, { f: 'Playfair Display', it: true, w: 700 })}<line x1="560" x2="${f1(560 + 800 * seg(t, B.perfect + 2, B.perfect + 2.6))}" y1="462" y2="462" stroke="#E2556F" stroke-width="7"/>`);
      if (t > B.repeat - 0.3) {
        const k = seg(t, B.repeat - 0.3, B.repeat + 0.3), rot = (t - B.repeat) * 0.4;
        o += fade(k, `<circle cx="960" cy="560" r="300" fill="none" stroke="#EADFD8" stroke-width="20"/>`);
        [['📋', '#7F77DD'], ['▶️', '#2AA594'], ['🔍', '#E2B04A'], ['🚪', '#F4829A']].forEach(([e, col], j) => { const a = rot + j * Math.PI / 2 - Math.PI / 2, x = 960 + Math.cos(a) * 300, y = 560 + Math.sin(a) * 300; o += fade(k, scaleAt(x, y, pop(t, B.pera + j * 0.5, 0.4), `<circle cx="${f1(x)}" cy="${f1(y)}" r="90" fill="${col}"/>${txt(x, y + 30, e, 70, '#fff')}`)); });
        o += fade(k, you(t, { x: 960, y: 700, scale: 0.8 }));
      }
      o += fade(seg(t, B.last + 1, B.last + 1.6), `<rect x="0" y="80" width="1920" height="150" fill="#FDF8F5" opacity=".9"/>${txt(960, 175, 'make discipline the easiest thing to do', 54, '#2AA594', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    /* ════ Psychology 8 · Winning Can Mess With You Too ═══════════════ */

    // A coin flips: the sad side (losing) turns over to the sunny side (winning).
    'w8-flip': (s, t) => {
      const B = s.b;
      const fl = seg(t, B.winning - 0.4, B.winning + 0.6), win = fl > 0.5;
      let o = grad('w8a', win ? '#FFF4DE' : '#3A1420', win ? '#F9D89A' : '#5A2233') + bg('url(#w8a)');
      const sx = Math.abs(Math.cos(fl * Math.PI));
      o += `<g transform="translate(960,480) scale(${f1(Math.max(0.03, sx))},1)"><circle r="230" fill="${win ? '#2AA594' : '#E2556F'}"/><circle r="190" fill="none" stroke="#fff" stroke-width="10" opacity=".5"/>${bigNum(0, 50, win ? '+$' : '−$', 150, '#fff')}</g>`;
      o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, mood: win ? undefined : 'sad', frontArm: win ? { a1: -160, a2: -170 } : undefined });
      return o;
    },

    // Three green calendar days, a payout check, best day ever.
    'w8-streak': (s, t) => {
      const B = s.b;
      let o = wall('w8b', '#FFF4DE', '#F6E7DA', 880, '#E8D5C4');
      [0, 1, 2].forEach(j => { const x = 360 + j * 300, k = pop(t, B.three + 0.3 + j * 0.5, 0.4); o += scaleAt(x, 340, k, `<rect x="${x - 120}" y="220" width="240" height="240" rx="20" fill="#fff"/><rect x="${x - 120}" y="220" width="240" height="60" rx="20" fill="#2AA594"/>${bigNum(x, 400, '+$', 70, '#2AA594')}`); });
      o += pill(660, 560, 'setups hitting', '#2AA594', pop(t, B.hitting, 0.4), 30);
      o += fade(seg(t, B.reading, B.reading + 0.4), `<rect x="260" y="640" width="800" height="200" rx="16" fill="#120D1C"/>${candles(290, 670, 740, 140, [0.2, 0.3, 0.28, 0.4, 0.5, 0.48, 0.6, 0.7, 0.68, 0.8], 10)}`);
      if (t > B.passed) o += scaleAt(1460, 380, pop(t, B.passed + 0.5, 0.5), `<g transform="rotate(-6 1460 380)"><rect x="1240" y="280" width="440" height="200" rx="14" fill="#E6F5F2" stroke="#2AA594" stroke-width="6"/>${txt(1460, 350, 'PAYOUT', 34, '#2AA594', { ls: 6 })}${bigNum(1460, 430, '$$$', 60, '#2AA594')}</g>`);
      o += you(t, { x: 1500, y: 960, scale: 1.1, flip: true, frontArm: t > B.passed + 2 ? { a1: -160, a2: -170 } : undefined });
      return o;
    },

    // Next morning: sunglasses on, strutting to the desk. "Oh, I got this."
    'w8-strut': (s, t) => {
      const B = s.b;
      let o = wall('w8c', '#FFE7C7', '#F9D89A', 880, '#C98B6B');
      o += sun(1650, 200, 80, t) + monitor(260, 260, 640, 380, candles(290, 300, 580, 300, vals(4, 14, 0.01, 0.04, 0.4), 14)) + desk(160, 880, 900);
      const w = ease(seg(t, B.morning, B.gotthis + 1));
      o += you(t, { x: lerp(1700, 1100, w), y: 1000, scale: 1.25, flip: true, walking: w > 0 && w < 1, frontArm: t > B.gotthis ? { a1: -160, a2: -170 } : undefined });
      if (t > B.gotthis - 0.5) o += `<rect x="${f1(lerp(1700, 1100, w) - 50)}" y="642" width="100" height="26" rx="10" fill="#2C1810"/>`;
      o += thought(1180, 330, 'oh, I got this 😎', between(t, B.gotthis, s.end), { size: 44 });
      return o;
    },

    // The thought bubble morphs: "I trust myself" → "I can't miss right now". Rules start falling off a shelf behind her.
    'w8-morph': (s, t) => {
      const B = s.b;
      let o = wall('w8d', '#FDF8F5', '#F3E7DD', 880, '#D9C3B0');
      o += `<rect x="1200" y="300" width="560" height="20" rx="8" fill="#8B6A55"/>`;
      ['confirm', 'size', 'max trades', 'stop'].forEach((l, j) => { const f = seg(t, B.doing + j * 0.6, B.doing + j * 0.6 + 1); o += `<g transform="translate(${1260 + j * 130},${f1(250 + f * f * 700)}) rotate(${f1(f * 60 * (j % 2 ? 1 : -1))})"><rect x="-55" y="-50" width="110" height="100" rx="10" fill="#fff" stroke="#7F77DD" stroke-width="5"/>${txt(0, 10, l, 20, '#7F77DD', { w: 800 })}</g>`; });
      o += you(t, { x: 760, y: 980, scale: 1.3, frontArm: { a1: -160, a2: -170 } });
      const m = seg(t, B.cantmiss - 0.2, B.cantmiss + 0.3);
      o += fade(1 - m, thought(760, 330, '“I trust myself”', pop(t, B.trust, 0.5), { size: 44 }));
      o += fade(m, thought(760, 330, '“I can’t miss right now”', 1, { size: 44, col: '#E2556F' }));
      o += fade(seg(t, B.too, B.too + 0.5), pill(960, 150, 'winning can mess with you too', '#7F77DD', 1, 34));
      return o;
    },

    // Two hikers: one follows the trail map (confidence), one tosses it away (overconfidence).
    'w8-two': (s, t) => {
      const B = s.b;
      let o = grad('w8e', '#CDEBF7', '#FDF8F5') + bg('url(#w8e)') + `<rect y="760" width="1920" height="320" fill="#B9DDB0"/><line x1="960" x2="960" y1="0" y2="1080" stroke="#fff" stroke-width="10"/>`;
      o += fade(1 - seg(t, B.diff, B.diff + 0.4), `<rect x="640" y="360" width="640" height="200" rx="20" fill="#120D1C"/>${candles(660, 380, 600, 160, [0.3, 0.38, 0.35, 0.46, 0.44, 0.56], 6)}` + you(t, { x: 960, y: 900, scale: 1.2, mood: t > B.scared ? 'sad' : undefined, frontArm: t < B.scared ? { a1: -160, a2: -170 } : undefined }) + (t < B.scared ? pill(960, 640, 'confidence ✓', '#2AA594', pop(t, B.want, 0.4), 30) : '') + thought(1300, 300, 'too scared to click', between(t, B.scared, B.diff), { size: 38 }));
      if (t > B.diff) {
        o += `<path d="M120,980 Q400,820 800,860" fill="none" stroke="#E8D5C4" stroke-width="40"/>`;
        o += you(t, { x: 380, y: 900, scale: 1.1, walking: true, frontArm: { a1: -40, a2: -60 }, hold: `<rect x="0" y="-60" width="110" height="80" rx="6" fill="#FFF8E6" stroke="#2AA594" stroke-width="4"/>` });
        o += pill(480, 260, 'confidence', '#2AA594', pop(t, B.diff + 1, 0.4), 34) + fade(seg(t, B.diff + 1.5, B.diff + 2), txt(480, 340, '“I trust my process”', 34, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        const toss = seg(t, B.diff + 3, B.diff + 4);
        o += you(t, { x: 1440, y: 900, scale: 1.1, walking: true, frontArm: { a1: -150, a2: -160 } });
        if (toss > 0) o += `<g transform="translate(${f1(1500 + toss * 300)},${f1(700 - Math.sin(toss * Math.PI) * 260 + toss * 200)}) rotate(${f1(toss * 300)})"><rect x="-55" y="-40" width="110" height="80" rx="6" fill="#FFF8E6" stroke="#E2556F" stroke-width="4"/></g>`;
        o += pill(1440, 260, 'overconfidence', '#E2556F', pop(t, B.diff + 3, 0.4), 34) + fade(seg(t, B.diff + 3.5, B.diff + 4), txt(1440, 340, '“I don’t need the process”', 34, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Rose-tinted goggles: the chart looks perfect through them… and messy without.
    'w8-goggles': (s, t) => {
      const B = s.b;
      let o = grad('w8f', '#FDE8ED', '#FDF8F5') + bg('url(#w8f)');
      const v = vals(17, 22, 0, 0.05, 0.5);
      o += `<rect x="200" y="220" width="820" height="520" rx="24" fill="#120D1C"/>${candles(230, 260, 760, 440, v, 22)}`;
      const lens = 300 + 260 * Math.sin((t - s.start) * 0.8);
      o += `<g><ellipse cx="${f1(lens + 200)}" cy="480" rx="150" ry="110" fill="#F4829A" opacity=".35" stroke="#E2556F" stroke-width="12"/><path d="M${f1(lens + 200)},480 m-40,40 l40,-60 l40,30 l40,-80" fill="none" stroke="#fff" stroke-width="8"/></g>`;
      o += you(t, { x: 1400, y: 980, scale: 1.3, flip: true }) + `<rect x="1345" y="590" width="110" height="34" rx="14" fill="#F4829A" stroke="#E2556F" stroke-width="5"/>`;
      o += thought(1400, 300, 'I see EVERYTHING', between(t, B.seeing + 1, s.end), { size: 40 });
      ['early entry', 'size up', 'B-grade setup', 'looser risk', 'more trades'].forEach((l, j) => { o += pill(300 + j * 180, 830 + (j % 2) * 70, l, '#E2556F', pop(t, B.seeing + 4 + j * 0.6, 0.4), 24); });
      return o;
    },

    // A judge's gavel stamps "JUSTIFIED"… but the next setup's checklist is unchanged.
    'w8-justified': (s, t) => {
      const B = s.b;
      let o = wall('w8g', '#6A3F26', '#4A2A18', 860, '#3A2418');
      const st = pop(t, B.justified, 0.5);
      o += `<rect x="560" y="260" width="800" height="300" rx="16" fill="#FFF8E6"/>${txt(960, 360, 'size up · early entry · extra trade', 34, C.dark, { w: 800 })}`;
      o += scaleAt(960, 470, st, `<g transform="rotate(-8 960 470)"><rect x="740" y="420" width="440" height="100" rx="12" fill="none" stroke="#2AA594" stroke-width="10"/>${txt(960, 492, 'JUSTIFIED?', 56, '#2AA594', { ls: 6 })}</g>`);
      o += fade(seg(t, B.special, B.special + 0.5) * (1 - seg(t, B.requires, B.requires + 0.4)), `${[0, 1, 2, 3, 4].map(i => `<circle cx="${700 + i * 130}" cy="700" r="44" fill="#2AA594"/>${txt(700 + i * 130, 716, 'W', 40, '#fff')}`).join('')}${txt(960, 820, '“I’m special”', 40, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 })}`);
      o += fade(seg(t, B.requires, B.requires + 0.5), `<rect x="660" y="620" width="600" height="220" rx="16" fill="#fff"/>${txt(960, 680, 'NEXT SETUP REQUIRES', 26, C.muted, { ls: 4 })}${['setup', 'confirm', 'risk'].map((l, j) => txt(780 + j * 180, 770, l + ' ✓', 32, '#2AA594', { w: 800 })).join('')}`);
      return o;
    },

    // Dayli: a good session, the confidence meter rising quietly beside her.
    'w8-subtle': (s, t) => {
      const B = s.b;
      let o = grad('w8h', '#F3E3D6', '#FBF4EF') + bg('url(#w8h)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.subtle ? 'idle' : 'think', talk: true, enterAt: s.start + 0.1 });
      o += fade(seg(t, B.best, B.best + 0.4) * (1 - seg(t, B.subtle, B.subtle + 0.4)), `<g transform="translate(1280,420)"><path d="M-80,40 L-100,-60 L-40,-10 L0,-90 L40,-10 L100,-60 L80,40 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="6"/></g>${txt(1280, 600, '“best trader ever”', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1440, 360, pop(t, B.best + 2, 0.4), '#E2556F', 34);
      const lv = seg(t, B.good, B.growing + 3);
      o += fade(seg(t, B.good, B.good + 0.4), `<rect x="800" y="220" width="700" height="440" rx="20" fill="#120D1C"/>${candles(830, 260, 640, 360, [0.2, 0.28, 0.26, 0.36, 0.44, 0.42, 0.52, 0.6, 0.58, 0.68], Math.floor(3 + lv * 7), { slots: 10 })}<rect x="1600" y="220" width="80" height="440" rx="40" fill="#fff"/><rect x="1600" y="${f1(660 - 440 * lv)}" width="80" height="${f1(440 * lv)}" rx="40" fill="#E2B04A"/>${txt(1640, 720, '📈', 50, C.dark)}`);
      [0, 1, 2].forEach(j => { o += check(900 + j * 120, 760, pop(t, B.working + j * 0.6, 0.4), '#2AA594', 30); });
      return o;
    },

    // Three small creeps: quicker click, one more trade, more risk. Then a sticky note on the monitor.
    'w8-creep': (s, t) => {
      const B = s.b;
      let o = wall('w8i', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += monitor(300, 180, 820, 460, candles(340, 240, 740, 360, vals(31, 18, 0.008, 0.05, 0.45), 18)) + desk(160, 900, 1600);
      const icons = [[B.quick, '⚡'], [B.another, '➕'], [B.risk, '🎚️']];
      icons.forEach(([at, e], j) => { o += scaleAt(1440 + j * 140, 260, pop(t, at, 0.5) * (1 - seg(t, B.remind, B.remind + 0.4)), `<circle cx="${1440 + j * 140}" cy="260" r="56" fill="#E2556F"/>${txt(1440 + j * 140, 280, e, 50, '#fff')}`); });
      o += you(t, { x: 1500, y: 1080, scale: 1.3, flip: true, frontArm: t < B.remind ? { a1: -175, a2: -170 } : { a1: 160, a2: 150 } });
      o += scaleAt(1000, 230, pop(t, B.rules, 0.5), `<g transform="rotate(6 1000 230)"><rect x="840" y="160" width="320" height="140" fill="#FFF1A8"/>${txt(1000, 220, 'my rules didn’t', 26, '#4A3A10', { w: 800 })}${txt(1000, 262, 'change today', 26, '#4A3A10', { w: 800 })}</g>`);
      return o;
    },

    // She climbs the streak ladder… then kicks it away at the top.
    'w8-ladder': (s, t) => {
      const B = s.b;
      let o = grad('w8j', '#CDEBF7', '#FDF8F5') + bg('url(#w8j)') + `<rect y="900" width="1920" height="180" fill="#B9DDB0"/>`;
      const kick = seg(t, B.abandon + 1, B.abandon + 2.4);
      o += `<g transform="rotate(${f1(kick * 30)} 960 900)"><rect x="840" y="300" width="16" height="600" fill="#8B6A55"/><rect x="1064" y="300" width="16" height="600" fill="#8B6A55"/>${['setup', 'confirm', 'risk', 'patience', 'stops'].map((l, j) => `<rect x="856" y="${820 - j * 110}" width="208" height="14" fill="#8B6A55"/>${txt(960, 808 - j * 110, l, 22, '#2AA594', { w: 800 })}`).join('')}</g>`;
      const up = ease(seg(t, B.uncert, B.process + 2));
      o += `<rect x="1060" y="260" width="300" height="40" rx="10" fill="#C98B6B"/>`;
      o += you(t, { x: up < 1 ? 960 : 1200, y: up < 1 ? lerp(900, 320, up) : 262, scale: 0.9, mood: kick > 0.5 ? 'sad' : undefined });
      o += fade(seg(t, B.abandon + 2.4, B.abandon + 3), txt(600, 180, 'abandoning what got you there', 50, '#E2556F', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Confetti! She celebrates… while the rulebook stays closed and safe in her other hand.
    'w8-party': (s, t) => {
      const B = s.b;
      let o = grad('w8k', '#FDE8ED', '#FFF4DE') + bg('url(#w8k)');
      for (let j = 0; j < 40; j++) { const p = ((t * 0.4) + j * 0.05) % 1; o += `<rect x="${(j * 97) % 1920}" y="${f1(-40 + p * 1100)}" width="18" height="10" fill="${['#F4829A', '#7F77DD', '#2AA594', '#E2B04A'][j % 4]}" transform="rotate(${f1(p * 720)} ${(j * 97) % 1920} ${f1(-40 + p * 1100)})"/>`; }
      o += you(t, { x: 960, y: 980, scale: 1.4, frontArm: { a1: -160, a2: -170 }, backArm: t > B.rewrite ? { a1: 60, a2: 40 } : { a1: -20, a2: -10 }, hold: '' });
      if (t > B.rewrite) o += scaleAt(820, 760, pop(t, B.rewrite, 0.5), `<rect x="760" y="700" width="120" height="150" rx="8" fill="#7F77DD"/>${txt(820, 790, '📋', 50, '#fff')}`);
      o += fade(seg(t, B.rewrite + 0.5, B.rewrite + 1), pill(960, 200, 'celebrate · keep the rules', '#2AA594', 1, 36));
      return o;
    },

    // Same checkup after a WIN as after a loss: a doctor's chart with five questions.
    'w8-check': (s, t) => {
      const B = s.b;
      let o = wall('w8l', '#E6F5F2', '#DDF1EE', 880, '#9DBFB9');
      o += `<rect x="560" y="160" width="800" height="720" rx="20" fill="#fff" stroke="#B8C8D6" stroke-width="6"/><rect x="860" y="130" width="200" height="60" rx="14" fill="#B8C8D6"/>${txt(960, 250, 'AFTER A WIN CHECKUP', 34, '#2AA594', { ls: 4 })}`;
      ['🎚️ size: plan or feeling?', '⚡ entering earlier?', '🔍 B-grade setups?', '➕ trading more?', '📏 standards changed?'].forEach((l, j) => { const at = B.check + 2 + j * 0.8; o += fade(seg(t, at, at + 0.3), `<rect x="620" y="${320 + j * 100}" width="36" height="36" rx="8" fill="none" stroke="#2AA594" stroke-width="4"/>${txt(680, 350 + j * 100, l, 34, C.dark, { a: 'start', w: 700 })}`); });
      o += you(t, { x: 1600, y: 980, scale: 1.1, flip: true, frontArm: { a1: -120, a2: -150 } });
      o += fade(seg(t, B.aggressive, B.aggressive + 0.5), pill(960, 960, 'more aggressive only because you’re winning? notice it', '#E2556F', 1, 28));
      return o;
    },

    // The size dial is hooked to a heart instead of a plan. She rewires it to the SCALING PLAN.
    'w8-scale': (s, t) => {
      const B = s.b;
      let o = grad('w8m', '#EEEBFB', '#FDF8F5') + bg('url(#w8m)');
      const rw = ease(seg(t, B.plan, B.plan + 2));
      o += `<circle cx="960" cy="520" r="200" fill="#fff" stroke="#2C1810" stroke-width="10"/><line x1="960" y1="520" x2="${f1(960 + 150 * Math.sin((40 - rw * 70) * Math.PI / 180))}" y2="${f1(520 - 150 * Math.cos((40 - rw * 70) * Math.PI / 180))}" stroke="#E2556F" stroke-width="16" stroke-linecap="round"/>${txt(960, 790, 'SIZE', 40, C.dark, { ls: 8 })}`;
      o += fade(1 - rw, `<path d="M760,520 Q560,520 460,520" fill="none" stroke="#E2556F" stroke-width="8"/>${heart(400, 520, 1.8, '#E2556F')}${txt(400, 640, '“I’m green!”', 32, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}`);
      o += fade(rw, `<path d="M1160,520 Q1360,520 1460,520" fill="none" stroke="#2AA594" stroke-width="8"/><rect x="1460" y="440" width="260" height="160" rx="14" fill="#E6F5F2" stroke="#2AA594" stroke-width="6"/>${txt(1590, 510, 'SCALING', 30, '#2AA594', { ls: 3 })}${txt(1590, 556, 'PLAN', 30, '#2AA594', { ls: 3 })}`);
      o += fade(seg(t, B.call, B.call + 0.5), txt(960, 180, 'emotions sizing the trade, called “confidence”', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // The rule: five locked dials that don't move no matter the score.
    'w8-rule': (s, t) => {
      const B = s.b;
      let o = grad('w8n', '#EEEBFB', '#DDF1EE') + bg('url(#w8n)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 240, 'Winning does not change my rules.', 74, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a, bigNum(1640, 380, '+$' + Math.round(200 + 1400 * seg(t, B.r1, B.r5 + 2)), 50, '#2AA594'));
      [[B.r1, '✅'], [B.r2, '🎯'], [B.r3, '🛑'], [B.r4, '#'], [B.r5, '🛡️']].forEach(([at, e], j) => { const x = 330 + j * 315; o += fade(a, scaleAt(x, 640, pop(t, at, 0.4), `<circle cx="${x}" cy="640" r="110" fill="#fff" stroke="#7F77DD" stroke-width="8"/>${txt(x, 670, e, 70, C.dark)}<g transform="translate(${x + 70},560)"><rect x="-24" y="-6" width="48" height="40" rx="8" fill="#2AA594"/><path d="M-14,-6 v-12 a14,14 0 0 1 28,0 v12" fill="none" stroke="#2AA594" stroke-width="8"/></g>`)); });
      if (fin > 0) o += fade(fin, txt(960, 560, 'Confidence should make me trust my process,', 56, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 660, 'not think I’ve outgrown it.', 62, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Photo album of her best week; behavior notes flutter out from the back pages.
    'w8-best': (s, t) => {
      const B = s.b;
      let o = wall('w8o', '#F3E7DD', '#EADFD8', 880, '#B78F72');
      o += `<rect x="460" y="200" width="1000" height="600" rx="20" fill="#7F77DD"/><rect x="490" y="230" width="460" height="540" fill="#FFF8E6"/><rect x="970" y="230" width="460" height="540" fill="#FFF8E6"/>`;
      [[600, 360], [800, 420], [620, 600]].forEach(([x, y], j) => { o += fade(seg(t, B.maybe + j * 0.8, B.maybe + j * 0.8 + 0.4), `<rect x="${x - 80}" y="${y - 70}" width="160" height="140" fill="#fff" stroke="#EADFD8" stroke-width="4"/>${bigNum(x, y + 14, '+$', 44, '#2AA594')}`); });
      ['🎚️ size?', '➕ more trades?', '⚡ faster?', '🔮 anticipating?', '🔍 less picky?'].forEach((l, j) => { const at = B.beh + 0.5 + j * 0.6, k = ease(seg(t, at, at + 0.8)); o += fade(seg(t, at, at + 0.2), pill(lerp(1200, 1200 + (j % 2 ? 300 : -100), k), lerp(500, 280 + j * 120, k), l, '#E2556F', 1, 28)); });
      return o;
    },

    // The swap: her rulebook in the driver's seat… then she slides it out and sits there herself.
    'w8-swap': (s, t) => {
      const B = s.b;
      let o = grad('w8p', '#E9F2F8', '#FDF8F5') + bg('url(#w8p)') + `<rect y="820" width="1920" height="260" fill="#9AA3B8"/>`;
      o += `<rect x="560" y="440" width="800" height="300" rx="80" fill="#7F77DD"/><rect x="660" y="360" width="560" height="160" rx="50" fill="#9C93E8"/><rect x="760" y="380" width="160" height="110" rx="14" fill="#E6F5F2"/><rect x="980" y="380" width="160" height="110" rx="14" fill="#E6F5F2"/><circle cx="740" cy="760" r="70" fill="#2C1810"/><circle cx="1180" cy="760" r="70" fill="#2C1810"/>`;
      const sw = seg(t, B.big + 3, B.big + 4.5);
      o += `<g transform="translate(${f1(840 - sw * 500)},${f1(430 + sw * 300)})"><rect x="-50" y="-40" width="100" height="80" rx="8" fill="#FFF8E6" stroke="#2AA594" stroke-width="5"/>${txt(0, 14, '📋', 40, C.dark)}</g>`;
      if (sw > 0.5) o += `<circle cx="840" cy="430" r="34" fill="#9A6244"/><circle cx="840" cy="400" r="30" fill="#22140E"/>`;
      o += you(t, { x: 1600, y: 960, scale: 1.0, flip: true, frontArm: sw > 0.5 ? { a1: -160, a2: -170 } : undefined });
      o += fade(seg(t, B.big, B.big + 0.5), txt(960, 200, 'process… or me, replacing it?', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Cliff: a great week, then a drop. A magnifier finds the transition: behavior changed first.
    'w8-cliff': (s, t) => {
      const B = s.b;
      let o = grad('w8q', '#FDF8F5', '#F3E7DD') + bg('url(#w8q)');
      const pts = [0.2, 0.3, 0.42, 0.55, 0.66, 0.74, 0.8, 0.84, 0.7, 0.5, 0.3, 0.15];
      const n = Math.max(2, Math.floor(seg(t, B.trans, B.trans + 4) * pts.length));
      o += `<rect x="260" y="200" width="1400" height="620" rx="20" fill="#fff"/><polyline points="${pts.slice(0, n).map((v, i) => `${300 + i * 120},${f1(780 - v * 520)}`).join(' ')}" fill="none" stroke="${n > 8 ? '#E2556F' : '#2AA594'}" stroke-width="12" stroke-linejoin="round"/>`;
      const mk = seg(t, B.changed, B.changed + 1.2);
      if (mk > 0) { const mx = lerp(1700, 1260, ease(mk)), my = lerp(900, 350, ease(mk)); o += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="100" fill="#fff" opacity=".3" stroke="#2C1810" stroke-width="14"/><line x1="${f1(mx + 72)}" y1="${f1(my + 72)}" x2="${f1(mx + 160)}" y2="${f1(my + 160)}" stroke="#2C1810" stroke-width="22" stroke-linecap="round"/>`; }
      o += pill(1260, 230, 'behavior changed here', '#E2556F', pop(t, B.changed + 1.4, 0.4), 30);
      o += fade(seg(t, B.pnl, B.pnl + 0.4), `<g opacity=".6">${bigNum(500, 920, 'P&L', 50, C.muted)}</g><line x1="420" x2="${f1(420 + 160 * seg(t, B.pnl + 0.8, B.pnl + 1.2))}" y1="905" y2="905" stroke="#E2556F" stroke-width="6"/>`);
      return o;
    },

    // Close: trophy on the shelf, rulebook beside it, she walks into a sunny day.
    'w8-close': (s, t) => {
      const B = s.b;
      let o = grad('w8r', '#FFE7C7', '#FDF8F5') + bg('url(#w8r)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      o += `<rect x="460" y="560" width="1000" height="24" rx="8" fill="#8B6A55"/>`;
      o += scaleAt(760, 480, pop(t, B.e1, 0.5), `<path d="M700,400 L820,400 L800,480 Q760,520 720,480 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="5"/><rect x="730" y="500" width="60" height="60" fill="#C98A1F"/>`);
      o += scaleAt(960, 480, pop(t, B.e2, 0.5), `<circle cx="960" cy="480" r="70" fill="#F4829A"/>${txt(960, 505, '💪', 60, '#fff')}`);
      o += scaleAt(1160, 480, pop(t, B.e3, 0.5), `<rect x="1100" y="400" width="120" height="160" rx="10" fill="#7F77DD"/>${txt(1160, 500, '📋', 56, '#fff')}`);
      o += you(t, { x: 1600, y: 980, scale: 1.2, flip: true });
      o += fade(seg(t, B.handle, B.handle + 0.5) * (1 - seg(t, B.e1 - 0.3, B.e1)), txt(960, 260, 'learn to handle winning too', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.e3 + 0.5, B.e3 + 1.1), txt(960, 260, 'celebrate · keep the confidence · keep the rules', 46, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    /* ════ Psychology 9 · Following Your Plan When It Doesn't Work ════ */

    // A pilot's preflight checklist: every box ticked, one after another.
    'w9-list': (s, t) => {
      const B = s.b;
      let o = wall('w9a', '#E9F2F8', '#D6E6F0', 880, '#B8C8D6');
      o += `<rect x="300" y="140" width="620" height="800" rx="20" fill="#C98B6B"/><rect x="330" y="190" width="560" height="730" rx="10" fill="#fff"/><rect x="510" y="120" width="200" height="60" rx="14" fill="#8B6A55"/>`;
      ['⌛', '🔭', '✅', '🎯', '🛑', '🎚️', '🏃', '📋'].forEach((e, j) => { const at = B['k' + (j + 1)], y = 260 + j * 82; o += fade(seg(t, at - 0.3, at), txt(380, y + 16, e, 42, C.dark) + `<rect x="440" y="${y}" width="${f1(320 * seg(t, at, at + 0.6))}" height="14" rx="7" fill="#EADFD8"/>`) + check(840, y + 6, pop(t, at + 0.3, 0.4), '#2AA594', 24); });
      o += you(t, { x: 1300, y: 980, scale: 1.3, flip: true, frontArm: { a1: -60, a2: -100 } });
      o += fade(seg(t, B.right, B.right + 0.4), txt(1400, 320, 'everything right', 50, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // The trade hits the stop. She stares: "but I did everything right."
    'w9-stop': (s, t) => {
      const B = s.b;
      let o = wall('w9b', '#2A1A22', '#3A2230', 900, '#1E1218');
      const v = [0.4, 0.42, 0.4, 0.48, 0.52, 0.5, 0.44, 0.36, 0.28, 0.22];
      o += monitor(300, 200, 820, 460, candles(340, 260, 740, 360, v, Math.floor(5 + seg(t, B.then, B.stop + 0.5) * 5), { slots: 10 }) + `<line x1="340" x2="1080" y1="560" y2="560" stroke="#E2556F" stroke-width="4" stroke-dasharray="12 8"/>`);
      o += scaleAt(710, 420, pop(t, B.stop, 0.5), `<rect x="530" y="370" width="360" height="100" rx="20" fill="#E2556F"/>${txt(710, 440, 'STOPPED', 52, '#fff', { ls: 4 })}`);
      o += desk(160, 900, 1600) + you(t, { x: 1500, y: 1080, scale: 1.3, flip: true, mood: t > B.stop ? 'sad' : undefined, frontArm: t > B.did ? { a1: -60, a2: -150 } : { a1: 160, a2: 150 } });
      o += thought(1460, 340, 'but I did everything right…', between(t, B.did, B.hard), { size: 38 });
      o += fade(seg(t, B.prob, B.prob + 0.5), pill(1460, 240, 'you probably did ✓', '#2AA594', 1, 32));
      return o;
    },

    // Right decision, wet anyway: she packed the umbrella; the wind still flips it.
    'w9-umbrella': (s, t) => {
      const B = s.b;
      let o = grad('w9c', '#C9D3E2', '#E9EEF5') + bg('url(#w9c)') + `<rect y="860" width="1920" height="220" fill="#9AA3B8"/>` + rain(0, 1920, 0, 860, t, 40, '#7F92B8');
      const flipU = seg(t, B.right + 3, B.right + 4);
      o += you(t, { x: 900, y: 980, scale: 1.3, frontArm: { a1: -60, a2: -80 }, mood: flipU > 0.5 ? 'sad' : undefined });
      o += `<path d="M640,520 A280,${f1(180 - flipU * 340)} 0 0 ${flipU > 0.5 ? 0 : 1} 1180,520 Z" fill="#2AA594"/><line x1="910" y1="520" x2="910" y2="700" stroke="#2C1810" stroke-width="10"/>`;
      for (let j = 0; j < 6; j++) { const p = ((t * 0.9) + j * 0.17) % 1; o += `<path d="M${f1(-100 + p * 2200)},${300 + j * 80} q60,-30 120,0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`; }
      o += pill(1500, 300, 'right decision ✓', '#2AA594', pop(t, B.right + 1, 0.4), 32) + pill(1500, 400, 'unwanted outcome', '#7F92B8', pop(t, B.right + 4.2, 0.4), 32);
      return o;
    },

    // A vending machine: she presses A, B, C, D… expecting E to drop. Something else falls out.
    'w9-machine': (s, t) => {
      const B = s.b;
      let o = wall('w9d', '#FDF8F5', '#F3E7DD', 900, '#D9C3B0');
      o += `<rect x="560" y="120" width="620" height="780" rx="30" fill="#7F77DD"/><rect x="600" y="160" width="400" height="560" rx="14" fill="#E6F5F2"/><rect x="1020" y="200" width="130" height="400" rx="14" fill="#5A4C9A"/><rect x="620" y="760" width="380" height="100" rx="12" fill="#3A2F55"/>`;
      ['🧱', '💧', '✅', '🧩'].forEach((e, j) => { o += fade(seg(t, B.avoid + 0.5 + j * 0.9, B.avoid + 0.9 + j * 0.9), txt(700 + (j % 2) * 200, 300 + Math.floor(j / 2) * 220, e, 80, C.dark)); });
      ['A', 'B', 'C', 'D'].forEach((l, j) => { const pr = between(t, B.abcd + 1 + j * 0.8, B.abcd + 1.5 + j * 0.8, 0.2); o += `<rect x="1040" y="${230 + j * 90}" width="90" height="70" rx="12" fill="${pr > 0 ? '#F9D89A' : '#fff'}"/>${txt(1085, 278 + j * 90, l, 36, C.dark)}`; });
      const drop = seg(t, B.abcd + 5, B.abcd + 6);
      if (drop > 0) o += `<g transform="translate(810,${f1(lerp(500, 800, drop))})"><rect x="-60" y="-40" width="120" height="80" rx="12" fill="${drop >= 1 ? '#E2556F' : '#B8B3C9'}"/>${txt(0, 16, drop >= 1 ? '−1R' : 'E?', 36, '#fff')}</g>`;
      o += you(t, { x: 1460, y: 980, scale: 1.2, flip: true, frontArm: { a1: -170, a2: -170 }, mood: drop >= 1 ? 'sad' : undefined });
      o += fade(seg(t, B.abcd, B.abcd + 0.5), txt(870, 70, 'A + B + C + D = E ?', 50, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A pinky promise she offers the chart… the chart has no hands. Her setup is a reason, not a promise.
    'w9-promise': (s, t) => {
      const B = s.b;
      let o = grad('w9e', '#FDE8ED', '#FDF8F5') + bg('url(#w9e)');
      o += `<rect x="1080" y="300" width="560" height="380" rx="24" fill="#120D1C"/>${candles(1110, 340, 500, 300, vals(23, 14, 0.004, 0.05, 0.5), 14)}`;
      o += you(t, { x: 760, y: 980, scale: 1.3, frontArm: { a1: -10, a2: -20 } });
      o += fade(seg(t, B.promise, B.promise + 0.4), `<path d="M900,620 q30,-30 50,0" fill="none" stroke="#9A6244" stroke-width="10" stroke-linecap="round"/>${txt(1360, 760, '🤙 promise?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1550, 730, pop(t, B.promise + 1.2, 0.4), '#E2556F', 30);
      o += fade(seg(t, B.cond, B.cond + 0.5), `<rect x="560" y="160" width="800" height="110" rx="20" fill="#fff"/>${txt(960, 230, 'a set of conditions = a reason to trade', 38, '#2AA594', { w: 800 })}`);
      return o;
    },

    // Detective board: she pins up "suspects" after every loss… then a note: "that trade lost."
    'w9-hunt': (s, t) => {
      const B = s.b;
      let o = grad('w9f', '#B78F72', '#9C7458') + bg('url(#w9f)');
      o += `<rect x="160" y="120" width="1600" height="840" rx="20" fill="#C9A27E" stroke="#8B6A55" stroke-width="16"/>`;
      ['marked it wrong?', '+1 confirmation?', 'another timeframe?', 'strategy broken?'].forEach((l, j) => { const x = 400 + (j % 2) * 600, y = 320 + Math.floor(j / 2) * 300, k = pop(t, B.look + 0.6 + j * 1, 0.4); o += scaleAt(x, y, k, `<rect x="${x - 190}" y="${y - 60}" width="380" height="120" fill="#fff"/>${txt(x, y + 12, l, 30, C.dark, { w: 800 })}<circle cx="${x}" cy="${y - 60}" r="10" fill="#E2556F"/>`); if (k > 0) o += `<line x1="${x}" y1="${y - 60}" x2="960" y2="540" stroke="#E2556F" stroke-width="3" opacity=".7"/>`; });
      o += `<circle cx="960" cy="540" r="70" fill="#E2556F"/>${txt(960, 562, '−1R', 40, '#fff')}`;
      o += scaleAt(960, 820, pop(t, B.lost, 0.6), `<g transform="rotate(-3 960 820)"><rect x="660" y="760" width="600" height="120" fill="#FFF1A8"/>${txt(960, 836, 'that trade lost.', 46, '#4A3A10', { f: 'Playfair Display', it: true })}</g>`);
      o += fade(seg(t, B.some, B.some + 0.4) * (1 - seg(t, B.lost, B.lost + 0.4)), pill(960, 840, 'sometimes there is something to fix', '#7F77DD', 1, 30));
      return o;
    },

    // Dayli at her desk: two folders, REVIEW vs EXCUSES.
    'w9-review': (s, t) => {
      const B = s.b;
      let o = grad('w9g', '#F3E3D6', '#FBF4EF') + bg('url(#w9g)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.explain ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      o += fade(seg(t, B.supposed, B.supposed + 0.4), `<rect x="760" y="320" width="460" height="340" rx="20" fill="#E6F5F2" stroke="#2AA594" stroke-width="6"/><rect x="760" y="280" width="200" height="60" rx="14" fill="#2AA594"/>${txt(990, 520, 'REVIEW', 48, '#2AA594', { ls: 6 })}`) + check(1180, 330, pop(t, B.supposed + 1, 0.4), '#2AA594', 34);
      o += fade(seg(t, B.explain, B.explain + 0.4), `<rect x="1320" y="320" width="460" height="340" rx="20" fill="#FDE8ED" stroke="#E2556F" stroke-width="6"/><rect x="1320" y="280" width="200" height="60" rx="14" fill="#E2556F"/>${txt(1550, 500, 'EXPLAINING', 38, '#E2556F', { ls: 3 })}${txt(1550, 550, 'IT AWAY', 38, '#E2556F', { ls: 3 })}`) + cross(1740, 330, pop(t, B.explain + 2, 0.4), '#E2556F', 34);
      return o;
    },

    // A replay booth. Rule broken → lesson card. All checks → "I'd take it again."
    'w9-again': (s, t) => {
      const B = s.b;
      let o = wall('w9h', '#1A1424', '#2A2142', 920, '#141026');
      o += `<rect x="300" y="160" width="900" height="520" rx="20" fill="#120D1C" stroke="#3A2F55" stroke-width="10"/>${candles(340, 220, 820, 400, vals(19, 16, 0.006, 0.05, 0.4), 16)}${txt(340, 210, '▶ REPLAY', 26, '#F9D89A', { a: 'start', ls: 3 })}`;
      const p1 = between(t, B.broke, B.entire - 0.2);
      o += scaleAt(1520, 380, p1, `<rect x="1320" y="260" width="400" height="240" rx="20" fill="#FFF1A8"/>${txt(1520, 350, 'broke a rule', 36, '#4A3A10', { w: 800 })}${txt(1520, 420, '→ lesson ✏️', 36, '#4A3A10', { w: 800 })}`);
      if (t > B.entire) {
        [B.c1, B.c2, B.c3].forEach((at, j) => { o += pill(1520, 280 + j * 100, ['setup ✓', 'confirmation ✓', 'risk ✓'][j], '#2AA594', pop(t, at, 0.4), 32); });
        o += fade(seg(t, B.again, B.again + 0.5), txt(750, 790, '“I would’ve taken that again.”', 50, '#fff', { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.didnt, B.didnt + 0.5), txt(750, 870, 'it just didn’t work.', 42, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 }));
      }
      o += you(t, { x: 1560, y: 1080, scale: 1.1, flip: true });
      return o;
    },

    // She rolls dice: a good decision, an uncertain result. Hands open.
    'w9-dice': (s, t) => {
      const B = s.b;
      let o = grad('w9i', '#EEEBFB', '#FDF8F5') + bg('url(#w9i)') + `<rect y="860" width="1920" height="220" fill="#D9D2EA"/>`;
      const roll = seg(t, B.control, B.control + 2.5), face = roll < 1 ? Math.floor(t * 12) % 6 + 1 : 3;
      const dx = lerp(700, 1200, ease(roll)), dy = 800 - Math.abs(Math.sin(roll * Math.PI * 3)) * 200 * (1 - roll);
      const pip = n => ({ 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] })[n];
      o += `<g transform="translate(${f1(dx)},${f1(dy)}) rotate(${f1((1 - roll) * 720)})"><rect x="-60" y="-60" width="120" height="120" rx="20" fill="#fff" stroke="#2C1810" stroke-width="5"/>${pip(face).map(([a, b]) => `<circle cx="${a * 32}" cy="${b * 32}" r="11" fill="#2C1810"/>`).join('')}</g>`;
      o += you(t, { x: 480, y: 960, scale: 1.25, frontArm: { a1: -20, a2: 10 }, backArm: { a1: 40, a2: 60 } });
      o += fade(seg(t, B.guarantee, B.guarantee + 0.5), txt(960, 220, 'the right decision, no guarantee', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A signpost at the trailhead: two questions. "Why did this lose?" fades; "Did I follow my plan?" lights up.
    'w9-question': (s, t) => {
      const B = s.b;
      let o = grad('w9j', '#CDEBF7', '#FDF8F5') + bg('url(#w9j)') + `<rect y="800" width="1920" height="280" fill="#B9DDB0"/>`;
      o += `<rect x="950" y="260" width="20" height="560" fill="#8B6A55"/>`;
      const sw = seg(t, B.follow, B.follow + 0.6);
      o += fade(seg(t, B.why, B.why + 0.4), `<g transform="rotate(-6 760 330)" opacity="${f1(1 - sw * 0.7)}"><path d="M560,280 L960,280 L960,380 L560,380 L520,330 Z" fill="#B8B3C9"/>${txt(760, 345, 'why did this lose?', 32, '#fff', { w: 800 })}</g>`);
      o += fade(sw, `<g transform="rotate(4 1160 480)"><path d="M960,430 L1380,430 L1420,480 L1380,530 L960,530 Z" fill="#2AA594"/>${txt(1180, 495, 'did I follow my plan?', 34, '#fff', { w: 800 })}</g>`);
      o += you(t, { x: 760, y: 900, scale: 1.1, frontArm: sw > 0.5 ? { a1: -40, a2: -40 } : undefined });
      [['NO', '#E2556F', 'rule broken → fix it', 380], ['YES', '#2AA594', 'don’t invent a mistake', 1540]].forEach(([l, col, sub, x], j) => { o += fade(seg(t, B.follow + 1.5 + j * 2, B.follow + 2 + j * 2), `<rect x="${x - 200}" y="620" width="400" height="150" rx="24" fill="#fff" stroke="${col}" stroke-width="6"/>${txt(x, 685, l, 44, col, { ls: 4 })}${txt(x, 740, sub, 26, C.dark, { w: 800 })}`); });
      return o;
    },

    // Zoom out: one red dot → five dots → a hundred, with the line still climbing.
    'w9-sample': (s, t) => {
      const B = s.b;
      let o = grad('w9k', '#E6F5F2', '#FDF8F5') + bg('url(#w9k)');
      const n = t < B.five ? 1 : t < B.data ? 5 : Math.min(100, 5 + Math.floor(seg(t, B.data, B.data + 3) * 95));
      for (let i = 0; i < n; i++) { const w = i === 0 ? false : ((i * 37) % 100) < 43, x = n === 1 ? 960 : 360 + (i % 20) * 62, y = n === 1 ? 480 : n === 5 ? 480 : 260 + Math.floor(i / 20) * 70, r = n === 1 ? 70 : n === 5 ? 40 : 22; const xx = n === 5 ? 660 + i * 150 : x; o += `<circle cx="${xx}" cy="${y}" r="${r}" fill="${w ? '#2AA594' : '#E2556F'}"/>`; }
      if (t > B.half) { let eq = 0; const pts = []; for (let i = 0; i < 100; i++) { eq += ((i * 37) % 100) < 43 ? 2.5 : -1; pts.push(`${360 + i * 12},${f1(900 - eq * 3)}`); } o += fade(seg(t, B.half, B.half + 1), `<polyline points="${pts.slice(0, Math.floor(seg(t, B.half, B.half + 3) * 100) + 1).join(' ')}" fill="none" stroke="#7F77DD" stroke-width="8" stroke-linejoin="round"/>`); }
      o += fade(seg(t, B.feel, B.feel + 0.5), pill(960, 160, 'most trades won’t feel good', '#2C1810', 1, 34));
      return o;
    },

    // She keeps tearing down and rebuilding her house of rules every time it rains.
    'w9-rebuild': (s, t) => {
      const B = s.b;
      let o = grad('w9l', '#C9D3E2', '#E9EEF5') + bg('url(#w9l)') + `<rect y="860" width="1920" height="220" fill="#9AA3B8"/>`;
      const cyc = ((t - s.start) / 3.5) % 1, built = cyc < 0.6 ? cyc / 0.6 : 1 - (cyc - 0.6) / 0.4;
      for (let i = 0; i < Math.floor(built * 12); i++) o += `<rect x="${760 + (i % 4) * 100}" y="${800 - Math.floor(i / 4) * 70}" width="92" height="62" rx="6" fill="#7F77DD"/>`;
      if (cyc > 0.6) o += rain(700, 520, 300, 860, t, 14, '#7F92B8');
      o += you(t, { x: 1400, y: 960, scale: 1.2, flip: true, mood: cyc > 0.6 ? 'sad' : undefined, frontArm: { a1: -140 + Math.sin(t * 8) * 20, a2: -160 } });
      o += fade(seg(t, B.loss, B.loss + 0.5), txt(960, 220, 'a loss was always part of it', 56, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // The rule: two lanes. Broke a rule → wrench. Followed → write it down, move on.
    'w9-rule': (s, t) => {
      const B = s.b;
      let o = grad('w9m', '#EEEBFB', '#DDF1EE') + bg('url(#w9m)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 235, 'I review my execution before I judge the outcome.', 58, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a * seg(t, B.r1, B.r1 + 0.4), `<rect x="260" y="360" width="620" height="260" rx="30" fill="#fff"/>${txt(570, 440, 'broke a rule', 40, '#E2556F')}${txt(570, 540, '🔧 fix the behavior', 36, C.dark, { w: 800 })}`);
      o += fade(a * seg(t, B.r2, B.r2 + 0.4), `<rect x="1040" y="360" width="620" height="260" rx="30" fill="#fff"/>${txt(1350, 440, 'followed the rules', 40, '#2AA594')}${txt(1350, 540, '📝 record it · move on', 36, C.dark, { w: 800 })}`);
      [[B.r3, '+3 confirmations'], [B.r4, 'ditch the setup']].forEach(([at, l], j) => { o += fade(a * seg(t, at, at + 0.4), pill(660 + j * 600, 720, l, '#B8B3C9', 1, 32)) + cross(820 + j * 600, 700, a * pop(t, at + 0.8, 0.4), '#E2556F', 24); });
      o += fade(a * seg(t, B.r5, B.r5 + 0.4), pill(960, 840, '📊 let the data decide', '#7F77DD', 1, 34));
      if (fin > 0) o += fade(fin, `${txt(960, 480, 'A loss is an outcome.', 70, '#E2556F', { f: 'Playfair Display', it: true })}${txt(960, 590, 'A mistake is a behavior.', 70, '#7F77DD', { f: 'Playfair Display', it: true })}${txt(960, 720, 'Learn the difference.', 56, C.dark, { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // Her journal open on a losing trade: she skips "why?" and walks the checklist.
    'w9-journal': (s, t) => {
      const B = s.b;
      let o = grad('w9n', '#F6EDE6', '#EADFD8') + bg('url(#w9n)');
      o += `<rect x="360" y="140" width="1200" height="800" rx="20" fill="#fff"/><line x1="960" x2="960" y1="140" y2="940" stroke="#EADFD8" stroke-width="6"/>`;
      o += `<rect x="420" y="220" width="480" height="300" rx="10" fill="#120D1C"/>${candles(440, 250, 440, 240, [0.5, 0.52, 0.5, 0.56, 0.5, 0.4, 0.32], 7)}${bigNum(660, 600, '−1R', 60, '#E2556F')}`;
      o += fade(seg(t, B.dont, B.dont + 0.4), txt(660, 720, 'why did I lose?', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="520" x2="${f1(520 + 280 * seg(t, B.dont + 1, B.dont + 1.5))}" y1="708" y2="708" stroke="#E2556F" stroke-width="5"/>`);
      ['setup', 'confirmation', 'entry rules', 'risk', 'management'].forEach((l, j) => { const at = B.dont + 1.5 + j * 0.6, y = 260 + j * 100; o += fade(seg(t, at, at + 0.3), `<rect x="1020" y="${y - 22}" width="40" height="40" rx="8" fill="none" stroke="#7F77DD" stroke-width="4"/>${txt(1090, y + 10, l + '?', 34, C.dark, { a: 'start', w: 700 })}`); });
      o += fade(seg(t, B.broke, B.broke + 0.4), `<rect x="1020" y="760" width="480" height="120" fill="#FFF1A8"/>${txt(1260, 830, '✏️ the rule I broke = lesson', 30, '#4A3A10', { w: 800 })}`);
      return o;
    },

    // The stamp: VALID SETUP · VALID EXECUTION · LOSING OUTCOME. Then she closes the book, calm.
    'w9-stamp': (s, t) => {
      const B = s.b;
      let o = grad('w9o', '#FDF8F5', '#F3E7DD') + bg('url(#w9o)');
      o += `<rect x="460" y="200" width="1000" height="620" rx="20" fill="#fff"/>`;
      [['VALID SETUP', '#2AA594'], ['VALID EXECUTION', '#2AA594'], ['LOSING OUTCOME', '#7F77DD']].forEach(([l, col], j) => { o += scaleAt(960, 340 + j * 160, pop(t, B.vvl + j * 0.7, 0.5), `<g transform="rotate(${-3 + j * 3} 960 ${340 + j * 160})"><rect x="620" y="${290 + j * 160}" width="680" height="100" rx="12" fill="none" stroke="${col}" stroke-width="8"/>${txt(960, 360 + j * 160, l, 48, col, { ls: 5 })}</g>`); });
      o += you(t, { x: 1640, y: 980, scale: 1.1, flip: true });
      o += fade(seg(t, B.enough, B.enough + 0.6), txt(960, 940, 'let that be enough.', 56, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // A long road with many forks; some lead into puddles, but the road keeps climbing.
    'w9-edge': (s, t) => {
      const B = s.b;
      let o = grad('w9p', '#FFE7C7', '#FDF8F5') + bg('url(#w9p)');
      o += `<path d="M0,1000 C400,940 700,800 1000,700 S1600,420 1920,300 L1920,1080 L0,1080 Z" fill="#B9DDB0"/><path d="M0,1000 C400,940 700,800 1000,700 S1600,420 1920,300" fill="none" stroke="#E8D5C4" stroke-width="60"/>`;
      [[400, 950], [900, 730], [1450, 520]].forEach(([x, y], j) => { o += fade(seg(t, B.some + j * 0.6, B.some + j * 0.6 + 0.4), `<ellipse cx="${x}" cy="${y + 10}" rx="70" ry="20" fill="#7FC3E0" opacity=".8"/>`); });
      const w = seg(t, B.never, s.end), px = 200 + w * 1100, py = px < 1000 ? 1000 - 300 * Math.pow(px / 1000, 1.3) : 700 - (px - 1000) * 0.43;
      o += you(t, { x: px, y: py - 10, scale: 0.85, walking: w < 1 });
      o += fade(seg(t, B.edge, B.edge + 0.5), pill(1500, 300, 'an edge, executed over and over', '#2AA594', 1, 32));
      o += fade(seg(t, B.part, B.part + 0.5) * (1 - seg(t, B.worked, B.worked + 0.4)), txt(700, 300, 'losses are part of the system', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.correct, B.correct + 0.5), `<rect x="0" y="90" width="1920" height="150" fill="#FDF8F5" opacity=".9"/>${txt(960, 190, 'Did you trade it correctly?', 66, C.dark, { f: 'Playfair Display', it: true })}`);
      return o;
    },

    /* ════ Psychology 10 · Separating Outcome From Execution ══════════ */

    // A sloppy trade: she dives in late, stop flapping loose, a confused shrug.
    'w10-sloppy': (s, t) => {
      const B = s.b;
      let o = wall('w10a', '#2A2142', '#3B2F55', 900, '#1E1730');
      const v = [0.3, 0.33, 0.31, 0.38, 0.46, 0.55, 0.62, 0.68];
      o += monitor(300, 180, 820, 460, candles(340, 240, 740, 360, v, 8, { slots: 10 }));
      [[B.b1, '✅'], [B.b2, '🏃'], [B.b3, '🛑'], [B.b4, '🤷🏾‍♀️']].forEach(([at, e], j) => { o += scaleAt(1440 + (j % 2) * 180, 220 + Math.floor(j / 2) * 180, pop(t, at, 0.4), `<circle cx="${1440 + (j % 2) * 180}" cy="${220 + Math.floor(j / 2) * 180}" r="70" fill="#3A2F55"/>${txt(1440 + (j % 2) * 180, 245 + Math.floor(j / 2) * 180, e, 60, '#fff')}`) + cross(1490 + (j % 2) * 180, 170 + Math.floor(j / 2) * 180, j < 3 ? pop(t, at + 0.5, 0.4) : 0, '#E2556F', 22); });
      if (t > B.b2) o += pill(340 + 7 * 74, 240, 'late entry', '#E2556F', pop(t, B.b2 + 0.3, 0.4), 26);
      if (t > B.b3) o += `<line x1="340" x2="1080" y1="${f1(620 + 20 * Math.sin(t * 6))}" y2="${f1(600 - 30 * Math.sin(t * 5))}" stroke="#E2556F" stroke-width="5" stroke-dasharray="12 10"/>`;
      o += desk(160, 900, 1600) + you(t, { x: 1500, y: 1080, scale: 1.3, flip: true, frontArm: t > B.b4 ? { a1: -60, a2: -110 } : { a1: -175, a2: -170 }, backArm: t > B.b4 ? { a1: -120, a2: -70 } : undefined });
      return o;
    },

    // It wins anyway. +$500 pops. She celebrates: "I knew what I saw!"
    'w10-win': (s, t) => {
      const B = s.b;
      let o = grad('w10b', '#FFF4DE', '#F9D89A') + bg('url(#w10b)');
      o += scaleAt(760, 380, pop(t, B.five, 0.6), bigNum(760, 420, '+$500', 150, '#2AA594'));
      if (t > B.okay) for (let j = 0; j < 30; j++) { const p = ((t - B.okay) * 0.4 + j * 0.033) % 1; o += `<rect x="${(j * 113) % 1920}" y="${f1(-40 + p * 1100)}" width="16" height="10" fill="${['#F4829A', '#7F77DD', '#2AA594'][j % 3]}"/>`; }
      o += you(t, { x: 1400, y: 1000, scale: 1.3, flip: true, frontArm: t > B.okay ? { a1: -160, a2: -170 } : undefined, backArm: t > B.okay ? { a1: -20, a2: -10 } : undefined });
      o += thought(1400, 360, '“okayyyy! I knew what I saw”', between(t, B.okay + 0.3, s.end), { size: 36 });
      return o;
    },

    // Two trophies on a shelf: "winning trade" and "good trade". They don't match.
    'w10-ask': (s, t) => {
      const B = s.b;
      let o = wall('w10c', '#FDF8F5', '#F3E7DD', 860, '#D9C3B0');
      o += `<rect x="360" y="620" width="1200" height="26" rx="8" fill="#8B6A55"/>`;
      o += fade(seg(t, B.good, B.good + 0.5), thought(960, 280, 'was that a good trade?', 1, { size: 46 }));
      const tro = (x, col, l) => `<path d="M${x - 90},400 L${x + 90},400 L${x + 60},520 Q${x},570 ${x - 60},520 Z" fill="${col}"/><rect x="${x - 30}" y="550" width="60" height="70" fill="${col}"/>${txt(x, 700, l, 34, C.dark, { w: 800 })}`;
      o += fade(seg(t, B.same, B.same + 0.5), tro(700, '#F9D89A', 'winning trade') + tro(1220, '#7ECFC0', 'good trade') + txt(960, 500, '≠', 100, C.dark));
      return o;
    },

    // A report card graded only by $: + = A, − = F.
    'w10-grade': (s, t) => {
      const B = s.b;
      let o = grad('w10d', '#E9F2F8', '#FDF8F5') + bg('url(#w10d)');
      o += `<rect x="560" y="140" width="800" height="760" rx="20" fill="#fff" stroke="#B8C8D6" stroke-width="6"/>${txt(960, 220, 'REPORT CARD', 40, C.dark, { ls: 8 })}`;
      [['+$', 'A', '#2AA594'], ['−$', 'F', '#E2556F'], ['+$', 'A', '#2AA594'], ['−$', 'F', '#E2556F']].forEach(([m, g, col], j) => { const at = B.judge + 0.6 + j * 0.9, y = 320 + j * 120; o += fade(seg(t, at, at + 0.3), `${bigNum(700, y + 20, m, 56, col)}${txt(960, y + 20, '→', 50, C.muted)}${txt(1220, y + 26, g, 80, col, { f: 'Playfair Display' })}`); });
      o += fade(seg(t, B.reward, B.reward + 0.5), pill(960, 960, 'rewarding bad behavior', '#E2556F', 1, 34));
      return o;
    },

    // Training a puppy: risk $500, win, and her brain gets a treat. Bad trick learned.
    'w10-treat': (s, t) => {
      const B = s.b;
      let o = wall('w10e', '#FFE7C7', '#F6D6BD', 880, '#C98B6B');
      const knob = t < B.frust ? 0.2 : 0.2 + 0.7 * ease(seg(t, B.frust, B.frust + 1));
      o += `<circle cx="560" cy="460" r="180" fill="#fff" stroke="#2C1810" stroke-width="10"/><line x1="560" y1="460" x2="${f1(560 + 140 * Math.sin((-120 + 240 * knob) * Math.PI / 180))}" y2="${f1(460 - 140 * Math.cos((-120 + 240 * knob) * Math.PI / 180))}" stroke="${knob > 0.5 ? '#E2556F' : '#2AA594'}" stroke-width="16" stroke-linecap="round"/>${bigNum(560, 720, t < B.frust ? '$100' : '$500', 60, knob > 0.5 ? '#E2556F' : C.dark)}`;
      o += pill(560, 820, '+$', '#2AA594', pop(t, B.wins, 0.4), 40);
      o += you(t, { x: 1300, y: 980, scale: 1.25, flip: true });
      // the brain getting a treat
      o += scaleAt(1300, 330, pop(t, B.learned, 0.5), `<ellipse cx="1300" cy="330" rx="150" ry="110" fill="#F4829A"/><path d="M1200,330 q50,-60 100,0 t100,0" fill="none" stroke="#fff" stroke-width="8"/>`);
      if (t > B.see) { const k = ease(seg(t, B.see, B.see + 1)); o += `<g transform="translate(${f1(lerp(1700, 1420, k))},${f1(lerp(200, 280, k))})"><path d="M-36,0 a18,18 0 1 1 18,-18 l36,0 a18,18 0 1 1 18,18 a18,18 0 1 1 -18,18 l-36,0 a18,18 0 1 1 -18,-18 Z" fill="#F9D89A"/></g>`; }
      o += fade(seg(t, B.see + 1, B.see + 1.6), txt(1300, 150, '“see? more risk worked”', 40, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // Two more "lessons" filed into her brain: skip the wait, move the stop.
    'w10-lessons': (s, t) => {
      const B = s.b;
      let o = grad('w10f', '#EEEBFB', '#FDF8F5') + bg('url(#w10f)');
      o += `<rect x="760" y="360" width="400" height="460" rx="20" fill="#C9B8A8"/>${[0, 1, 2].map(i => `<rect x="780" y="${380 + i * 146}" width="360" height="130" rx="10" fill="#D9C3B0"/><rect x="920" y="${435 + i * 146}" width="80" height="16" rx="8" fill="#8B6A55"/>`).join('')}`;
      const card = (at, l, sub, i) => { const k = ease(seg(t, at, at + 1.2)); return fade(seg(t, at - 0.3, at), `<g transform="translate(${f1(lerp(i ? 1500 : 420, 960, k))},${f1(lerp(260, 390 + i * 146, k))}) scale(${f1(1 - k * 0.5)})"><rect x="-220" y="-90" width="440" height="180" rx="16" fill="#fff" stroke="#E2556F" stroke-width="5"/>${txt(0, -20, l, 34, '#E2556F', { w: 800 })}${txt(0, 40, sub, 30, C.dark, { f: 'Playfair Display', it: true, w: 700 })}</g>`); };
      o += card(B.chase, 'chased · won', '“no need to wait”', 0);
      o += card(B.stop, 'moved stop · won', '“stops are for losers”', 1);
      o += fade(seg(t, B.chase, B.chase + 0.5), txt(960, 200, 'what your brain files away', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // Watering weeds: the wins water the bad habits and they grow.
    'w10-weeds': (s, t) => {
      const B = s.b;
      let o = grad('w10g', '#CDEBF7', '#FDF8F5') + bg('url(#w10g)') + `<rect y="780" width="1920" height="300" fill="#9C7458"/>`;
      const g = ease(seg(t, B.reinforce, B.reinforce + 4));
      ['🏃', '🎚️', '🛑'].forEach((e, j) => { const x = 760 + j * 260, h = 120 + g * (200 + j * 40); o += `<path d="M${x},780 C${x - 30},${780 - h / 2} ${x + 30},${780 - h / 2} ${x},${f1(780 - h)}" stroke="#7B8C3A" stroke-width="14" fill="none"/><path d="M${x},${f1(780 - h * 0.6)} l-60,-30 M${x},${f1(780 - h * 0.4)} l60,-24" stroke="#7B8C3A" stroke-width="10"/><circle cx="${x}" cy="${f1(780 - h - 30)}" r="46" fill="#C4D06A"/>${txt(x, 780 - h - 14, e, 40, C.dark)}`; });
      o += you(t, { x: 400, y: 840, scale: 1.1, frontArm: { a1: -30, a2: -10 }, hold: `<rect x="0" y="-30" width="90" height="70" rx="10" fill="#2AA594"/><path d="M90,-10 l60,20" stroke="#2AA594" stroke-width="12"/>${txt(45, 15, '$', 34, '#fff')}` });
      for (let j = 0; j < 6; j++) { const p = (t * 1.5 + j / 6) % 1; o += `<circle cx="${f1(560 + p * 120)}" cy="${f1(720 + p * p * 80)}" r="6" fill="#7FB8D6" opacity="${f1(1 - p)}"/>`; }
      return o;
    },

    // The market as a slot machine with no teacher: it pays a bad decision, takes from a good one.
    'w10-noteacher': (s, t) => {
      const B = s.b;
      let o = wall('w10h', '#2B2752', '#5B4E9A', 900, '#1E1834');
      o += `<rect x="700" y="160" width="520" height="680" rx="40" fill="#E2556F"/><rect x="760" y="240" width="400" height="200" rx="20" fill="#fff"/>${txt(960, 520, 'THE MARKET', 40, '#fff', { ls: 6 })}`;
      o += fade(seg(t, B.grades, B.grades + 0.4) * (1 - seg(t, B.pay, B.pay + 0.3)), txt(960, 360, '📝 A+ ?', 70, C.dark) + cross(1120, 270, pop(t, B.grades + 1, 0.4), '#E2556F', 30));
      o += fade(seg(t, B.pay, B.pay + 0.4) * (1 - seg(t, B.take, B.take + 0.3)), `${txt(960, 330, 'bad decision', 34, '#E2556F', { w: 800 })}${bigNum(960, 400, '+$', 60, '#2AA594')}`);
      o += fade(seg(t, B.take, B.take + 0.4), `${txt(960, 330, 'good decision', 34, '#2AA594', { w: 800 })}${bigNum(960, 400, '−$', 60, '#E2556F')}`);
      o += you(t, { x: 1500, y: 1000, scale: 1.2, flip: true, frontArm: t > B.own ? { a1: -40, a2: -60 } : undefined, hold: t > B.own ? `<rect x="-10" y="-90" width="110" height="140" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="5"/>${txt(45, -10, 'MY', 22, '#7F77DD', { w: 900 })}${txt(45, 20, 'GRADES', 20, '#7F77DD', { w: 900 })}` : '' });
      return o;
    },

    // Dayli: green P&L, the review notebook gets pushed aside… "would I repeat this?"
    'w10-confess': (s, t) => {
      const B = s.b;
      let o = grad('w10i', '#F3E3D6', '#FBF4EF') + bg('url(#w10i)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.six ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      o += fade(seg(t, B.taken, B.taken + 0.4), bigNum(1240, 360, '+$600', 110, '#2AA594'));
      const push = ease(seg(t, B.six, B.six + 1.2));
      o += `<g transform="translate(${f1(1240 + push * 420)},${f1(600 + push * 80)}) rotate(${f1(push * 20)})" opacity="${f1(1 - push * 0.6)}"><rect x="-150" y="-100" width="300" height="200" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="5"/>${txt(0, 12, '📓 review', 34, C.dark, { w: 800 })}</g>`;
      o += fade(seg(t, B.forgive, B.forgive + 0.4), txt(1240, 820, 'so easy to forgive when you’re green', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // A photocopier: "would I copy this exact trade 100 times?" A sloppy trade jams it.
    'w10-repeat': (s, t) => {
      const B = s.b;
      let o = wall('w10j', '#E9F2F8', '#D6E6F0', 880, '#B8C8D6');
      o += `<rect x="560" y="420" width="700" height="440" rx="24" fill="#B8B3C9"/><rect x="600" y="360" width="620" height="80" rx="14" fill="#D9D2EA"/><rect x="1180" y="480" width="40" height="40" rx="8" fill="${t > B.repeat ? '#2AA594' : '#3A2F55'}"/>`;
      const jam = t > B.no;
      for (let i = 0; i < (jam ? 2 : Math.floor(seg(t, B.repeat, B.repeat + 3) * 8)); i++) o += `<rect x="${640 + i * 10}" y="${560 - i * 12}" width="300" height="200" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/>${candles(660 + i * 10, 580 - i * 12, 260, 160, [0.3, 0.33, 0.31, 0.5, 0.6, 0.7], 6)}`;
      if (jam) o += `<rect x="700" y="500" width="300" height="200" rx="6" fill="#fff" transform="rotate(${f1(Math.sin(t * 20) * 4)} 850 600)"/>${txt(850, 610, '🏃🎚️🛑', 50, C.dark)}` + pill(960, 300, 'JAM: can’t repeat this', '#E2556F', pop(t, B.no + 0.5, 0.4), 32);
      o += you(t, { x: 1500, y: 980, scale: 1.2, flip: true, frontArm: { a1: -150, a2: -160 } });
      o += fade(seg(t, B.repeat, B.repeat + 0.5) * (1 - seg(t, B.no, B.no + 0.4)), thought(1500, 300, 'would I repeat this?', 1, { size: 38 }));
      return o;
    },

    // A losing trade gets a gold star anyway: setup, risk, rules all checked.
    'w10-lost': (s, t) => {
      const B = s.b;
      let o = grad('w10k', '#EEEBFB', '#FDF8F5') + bg('url(#w10k)');
      o += `<rect x="300" y="240" width="700" height="460" rx="20" fill="#120D1C"/>${candles(330, 280, 640, 360, [0.5, 0.52, 0.5, 0.56, 0.52, 0.44, 0.36, 0.3], 8)}${bigNum(650, 780, '−1R', 70, '#E2556F')}`;
      ['setup ✓', 'risk ✓', 'rules ✓'].forEach((l, j) => { o += pill(1360, 360 + j * 100, l, '#2AA594', pop(t, B.because + j * 0.7, 0.4), 34); });
      o += scaleAt(1360, 740, pop(t, B.still, 0.6), `<path d="M1360,640 l30,62 l68,10 l-50,48 l12,68 l-60,-32 l-60,32 l12,-68 l-50,-48 l68,-10 z" fill="#F9D89A" stroke="#C98A1F" stroke-width="6"/>`);
      o += fade(seg(t, B.yep, B.yep + 0.4), txt(650, 180, '“yep, I’d take that again”', 44, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.shift + 1, B.shift + 1.6), `<rect x="0" y="880" width="1920" height="140" fill="#FDF8F5" opacity=".9"/>${txt(960, 965, 'the P&L doesn’t grade me', 52, '#7F77DD', { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // The 2×2: execution × outcome. Four quadrants appear; the sneaky one (bad + win) glows.
    'w10-grid': (s, t) => {
      const B = s.b;
      let o = bg('#FDF8F5');
      o += fade(seg(t, B.two, B.two + 0.4), `${txt(960, 150, 'execution  ×  outcome', 54, C.dark, { f: 'Playfair Display', it: true })}`);
      const q = [[0, 0, 'good + win', '#2AA594', '😊'], [1, 0, 'good + loss', '#7F77DD', '👍'], [0, 1, 'bad + loss', '#E2B04A', '🔧'], [1, 1, 'bad + WIN', '#E2556F', '👀']];
      q.forEach(([c, r, l, col, e], j) => { const x = 560 + c * 800, y = 380 + r * 380, k = pop(t, B.eo + 0.6 + j * 1.2, 0.5), hot = j === 3 ? seg(t, B.this, B.this + 0.5) : 0; o += scaleAt(x, y, k * (1 + hot * 0.08), `<rect x="${x - 340}" y="${y - 150}" width="680" height="300" rx="30" fill="#fff" stroke="${col}" stroke-width="${8 + hot * 8}"/>${txt(x - 220, y + 30, e, 80, C.dark)}${txt(x + 60, y + 20, l, 46, col, { w: 900 })}`); });
      return o;
    },

    // A stack of cash slides over a red X... she pulls the cash away to see the mistake underneath.
    'w10-curtain': (s, t) => {
      const B = s.b;
      let o = grad('w10l', '#FDE8ED', '#FDF8F5') + bg('url(#w10l)');
      o += cross(960, 500, 1, '#E2556F', 140);
      const lift = 0.6 * ease(seg(t, B.hide + 1.5, B.hide + 2.8));
      for (let i = 0; i < 6; i++) o += `<rect x="${f1(760 + lift * 500 + i * 6)}" y="${f1(380 - i * 14 - lift * 200)}" width="400" height="200" rx="14" fill="#7CC79A" stroke="#2AA594" stroke-width="5"/>`;
      o += txt(f1(960 + lift * 500), 330 - lift * 200, '$$$', 70, '#fff');
      o += fade(seg(t, B.hide, B.hide + 0.5), txt(960, 880, 'don’t let the money hide the mistake', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Blindfold test: the P&L is covered; she grades the checklist first, then peeks.
    'w10-blind': (s, t) => {
      const B = s.b;
      let o = wall('w10m', '#E6F5F2', '#DDF1EE', 880, '#9DBFB9');
      o += `<rect x="260" y="200" width="640" height="560" rx="20" fill="#fff"/>${txt(580, 270, 'EXECUTION', 34, '#2AA594', { ls: 6 })}`;
      ['setup', 'confirmation', 'valid entry', 'risk', 'management'].forEach((l, j) => { const at = B.blind + 0.8 + j * 0.7; o += fade(seg(t, at, at + 0.3), txt(330, 360 + j * 80, l, 34, C.dark, { a: 'start', w: 700 })) + check(830, 348 + j * 80, pop(t, at + 0.3, 0.4), '#2AA594', 22); });
      o += pill(580, 820, 'grade: A', '#2AA594', pop(t, B.first, 0.5), 36);
      const peek = ease(seg(t, B.then, B.then + 1));
      o += `<rect x="1060" y="300" width="600" height="300" rx="20" fill="#120D1C"/>${bigNum(1360, 480, '−$80', 90, '#FF8DA3')}<g opacity="${f1(1 - peek)}"><rect x="1040" y="280" width="640" height="340" rx="20" fill="#3A2F55"/>${txt(1360, 470, 'P&L hidden', 40, '#CFC8FA', { w: 800 })}</g>`;
      return o;
    },

    // The rule: first question isn't "how much?" but "did I execute correctly?"
    'w10-rule': (s, t) => {
      const B = s.b;
      let o = grad('w10n', '#EEEBFB', '#DDF1EE') + bg('url(#w10n)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 240, 'I grade the process before I grade the P&L.', 66, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a * seg(t, B.r1, B.r1 + 0.4), pill(620, 380, 'win ≠ excuse for broken rules', '#E2556F', 1, 30));
      o += fade(a * seg(t, B.r2, B.r2 + 0.4), pill(1300, 380, 'loss ≠ traded badly', '#7F77DD', 1, 30));
      o += fade(a * seg(t, B.r4, B.r4 + 0.4), `${txt(960, 560, '“how much did I make?”', 50, C.muted, { f: 'Playfair Display', it: true })}<line x1="680" x2="${f1(680 + 560 * seg(t, B.r5, B.r5 + 0.6))}" y1="542" y2="542" stroke="#E2556F" stroke-width="7"/>`);
      o += fade(a * seg(t, B.r6, B.r6 + 0.4), txt(960, 700, '“did I execute correctly?”', 62, '#2AA594', { f: 'Playfair Display', it: true }));
      if (fin > 0) o += fade(fin, txt(960, 560, 'I don’t want to be rewarded for', 62, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 670, 'behavior I can’t afford to repeat.', 62, '#E2556F', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Two journal pages side by side: a lost-but-correct trade vs a won-but-broken trade. A scale weighs them.
    'w10-two': (s, t) => {
      const B = s.b;
      let o = grad('w10o', '#F6EDE6', '#EADFD8') + bg('url(#w10o)');
      const page = (x, at, pnl, col, marks, mcol) => fade(seg(t, at, at + 0.5), `<rect x="${x - 300}" y="200" width="600" height="440" rx="16" fill="#fff"/>${bigNum(x, 320, pnl, 80, col)}${txt(x, 440, marks, 44, mcol, { w: 800 })}`);
      o += page(560, B.a, '−1R', '#E2556F', 'rules ✓✓✓', '#2AA594');
      o += page(1360, B.b, '+$500', '#2AA594', 'rules ✗✗✗', '#E2556F');
      const tip = ease(seg(t, B.which + 1, B.which + 3)) * 10;
      o += fade(seg(t, B.which, B.which + 0.5), `<g transform="rotate(${f1(tip)} 960 780)"><rect x="460" y="770" width="1000" height="20" rx="10" fill="#8B6A55"/><rect x="480" y="720" width="160" height="50" rx="10" fill="#2AA594"/><rect x="1280" y="720" width="160" height="50" rx="10" fill="#E2556F"/></g><path d="M960,780 L920,900 L1000,900 Z" fill="#8B6A55"/>${txt(960, 990, 'which was the better trade?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      return o;
    },

    // The win trophy cracks open: inside, the habits it taught her.
    'w10-taught': (s, t) => {
      const B = s.b;
      let o = grad('w10p', '#FDF8F5', '#F3E7DD') + bg('url(#w10p)');
      const op = ease(seg(t, B.teach, B.teach + 1));
      o += `<g transform="translate(${f1(-op * 120)},0) rotate(${f1(-op * 12)} 960 600)"><path d="M820,320 L960,320 L960,600 L900,640 L840,560 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="6"/></g><g transform="translate(${f1(op * 120)},0) rotate(${f1(op * 12)} 960 600)"><path d="M960,320 L1100,320 L1080,560 L1020,640 L960,600 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="6"/></g><rect x="920" y="640" width="80" height="140" fill="#C98A1F"/>`;
      ['🏃 chase', '🎚️ over-risk', '✅ skip confirmation', '🛑 move stop', '➕ overtrade'].forEach((l, j) => { const at = B.teach + 1 + j * 0.6, k = ease(seg(t, at, at + 0.8)); o += fade(seg(t, at, at + 0.2), pill(lerp(960, j % 2 ? 1460 : 460, k), lerp(460, 260 + j * 120, k), l, '#E2556F', 1, 30)); });
      o += fade(seg(t, B.celebrate, B.celebrate + 0.5), txt(960, 960, 'celebrated… never examined', 50, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Close: a long hallway of 100 trade doors; she walks it with the same calm process. Then the two lines.
    'w10-close': (s, t) => {
      const B = s.b;
      let o = wall('w10q', '#E9E1F5', '#D9CFEA', 880, '#9C8CB8');
      for (let i = 0; i < 9; i++) { const x = 140 + i * 210; o += `<rect x="${x}" y="420" width="160" height="460" rx="8" fill="${i % 3 === 1 ? '#E2556F' : '#2AA594'}" opacity=".85"/><circle cx="${x + 135}" cy="650" r="8" fill="#F9D89A"/>${txt(x + 80, 400, '#' + (i * 12 + 1), 24, C.muted, { w: 800 })}`; }
      const w = seg(t, B.today, B.knows + 2);
      o += you(t, { x: 140 + w * 1600, y: 980, scale: 1.0, walking: w > 0 && w < 1, hold: `<rect x="-10" y="-40" width="70" height="90" rx="6" fill="#7F77DD"/>` });
      o += fade(seg(t, B.hundreds, B.hundreds + 0.5) * (1 - seg(t, B.e1 - 0.3, B.e1)), txt(960, 260, 'behavior you can repeat, hundreds of times', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      if (t > B.e1 - 0.3) {
        o += `<rect x="0" y="120" width="1920" height="260" fill="#FDF8F5" opacity="${f1(0.92 * seg(t, B.e1 - 0.3, B.e1))}"/>`;
        o += fade(seg(t, B.e1, B.e1 + 0.4), txt(620, 230, 'good execution can lose.', 50, '#7F77DD', { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.e2, B.e2 + 0.4), txt(1300, 230, 'bad execution can win.', 50, '#E2556F', { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.last + 1, B.last + 1.6), txt(960, 330, 'know the difference.', 54, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    /* ════ Psychology 15 · Build Your Trading Rules ════════════════════ */

    // A gallery: framed pictures of every lesson light up one by one. She walks past them.
    'w15-museum': (s, t) => {
      const B = s.b;
      let o = wall('w15a', '#F3E7DD', '#EADFD8', 880, '#B78F72');
      const icons = ['🏃', '🥊', '🔁', '😨', '🤑', '📉', '👑', '💥', '💸', '📊', '☀️'];
      const pan = seg(t, B.t1, B.t11 + 2) * 1300;
      icons.forEach((e, j) => { const x = 260 + j * 260 - pan, at = B['t' + (j + 1)], lit = t > at; if (x < -100 || x > 2020) return; o += `<rect x="${f1(x - 80)}" y="240" width="160" height="200" rx="6" fill="#C98A1F"/><rect x="${f1(x - 64)}" y="256" width="128" height="168" fill="${lit ? '#FFF8E6' : '#D9C3B0'}"/>${lit ? txt(x, 362, e, 70, C.dark) : ''}${lit ? `<path d="M${f1(x - 60)},140 L${f1(x + 60)},140 L${f1(x + 100)},260 L${f1(x - 100)},260 Z" fill="#FFF8E6" opacity=".18"/>` : ''}`; });
      o += you(t, { x: 960, y: 1000, scale: 1.25, walking: t < B.recog, flip: false });
      o += fade(seg(t, B.recog, B.recog + 0.5), thought(960, 560, 'that’s… me 😅', 1, { size: 42 }));
      return o;
    },

    // She stares at her reflection with a "revenge trader" name tag. Okay… then what?
    'w15-mirror': (s, t) => {
      const B = s.b;
      let o = wall('w15b', '#EEEBFB', '#E0DAF2', 900, '#B8B3C9');
      o += `<ellipse cx="1220" cy="500" rx="240" ry="340" fill="#fff" stroke="#C9B8A8" stroke-width="18"/><ellipse cx="1220" cy="500" rx="215" ry="315" fill="#E6F5F2"/>`;
      o += you(t, { x: 1220, y: 800, scale: 0.9, flip: true }) + you(t, { x: 640, y: 1000, scale: 1.25 });
      o += fade(seg(t, B.know, B.know + 0.4), `<rect x="560" y="660" width="160" height="60" rx="10" fill="#fff" stroke="#E2556F" stroke-width="4"/>${txt(640, 700, 'REVENGE', 22, '#E2556F', { w: 900 })}`);
      o += fade(seg(t, B.enough, B.enough + 0.4) * (1 - seg(t, B.next, B.next + 0.3)), pill(960, 150, 'recognizing isn’t enough', '#7F77DD', 1, 34));
      o += thought(1000, 160, 'next loss… then what?', between(t, B.next, s.end), { size: 40 });
      return o;
    },

    // An instruction manual with her name on the cover opens up.
    'w15-manual': (s, t) => {
      const B = s.b;
      let o = grad('w15c', '#FFF4DE', '#FDF8F5') + bg('url(#w15c)');
      const op = ease(seg(t, B.rules, B.rules + 1.4));
      o += `<rect x="560" y="200" width="800" height="640" rx="16" fill="#7F77DD"/><rect x="580" y="220" width="${f1(380 * op)}" height="600" rx="10" fill="#FFF8E6"/><rect x="${f1(960 + 380 * (1 - op))}" y="220" width="${f1(380 * op)}" height="600" rx="10" fill="#FFF8E6"/><line x1="960" x2="960" y1="220" y2="820" stroke="#5A4C9A" stroke-width="8"/>`;
      o += fade(1 - op, txt(960, 500, 'MY TRADING', 54, '#fff', { ls: 6 }) + txt(960, 580, 'RULES', 54, '#fff', { ls: 6 }));
      if (op > 0.5) [0, 1, 2, 3, 4].forEach(j => { o += `<rect x="620" y="${300 + j * 90}" width="${f1(300 * seg(t, B.final + j * 0.6, B.final + j * 0.6 + 0.6))}" height="16" rx="8" fill="#CECBF6"/>`; });
      o += fade(op, you(t, { x: 1150, y: 760, scale: 0.75, frontArm: { a1: -60, a2: -100 } }));
      o += fade(seg(t, B.final + 2, B.final + 2.6), txt(960, 930, 'instructions for the trader you’re becoming', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // Weather doesn't stop. She has an umbrella, sunglasses, a coat: tools for each feeling.
    'w15-weather': (s, t) => {
      const B = s.b;
      let o = grad('w15d', '#CDEBF7', '#FDF8F5') + bg('url(#w15d)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      const zones = [[400, '#9AA3B8', '😤'], [960, '#F9D89A', '🤩'], [1520, '#CFC8FA', '😨']];
      zones.forEach(([x, col, e], j) => { o += fade(seg(t, B.notrid + j * 1, B.notrid + j * 1 + 0.5), cloud(x, 230, 0.8, col) + txt(x, 250, e, 60, C.dark)); });
      o += rain(220, 360, 300, 880, t, 8, '#7F92B8');
      o += you(t, { x: 960, y: 960, scale: 1.25 });
      o += fade(seg(t, B.g1, B.g1 + 0.4) * (1 - seg(t, B.g2, B.g2 + 0.4)), pill(960, 500, 'feel nothing?', '#B8B3C9', 1, 34) + cross(1110, 480, pop(t, B.g1 + 1, 0.4), '#E2556F', 24));
      o += fade(seg(t, B.g2, B.g2 + 0.5), [['☂️', 300], ['🕶️', 560], ['🧥', 1360], ['🧣', 1620]].map(([e, x], j) => scaleAt(x, 600, pop(t, B.g2 + 0.5 + j * 0.5, 0.4), `<circle cx="${x}" cy="600" r="70" fill="#fff"/>${txt(x, 625, e, 64, C.dark)}`)).join('') + pill(960, 760, 'know what you DO when they show up', '#2AA594', 1, 32));
      return o;
    },

    // A sticky note "be disciplined" flutters off the monitor. What does that MEAN?
    'w15-sticky': (s, t) => {
      const B = s.b;
      let o = wall('w15e', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += monitor(460, 200, 820, 460, candles(500, 260, 740, 360, vals(5, 18, 0.004, 0.05, 0.5), 18)) + desk(300, 900, 1300);
      const fall = seg(t, B.mean + 0.5, B.mean + 2.5);
      o += scaleAt(1180, 240, pop(t, B.just, 0.5), `<g transform="translate(0,${f1(fall * fall * 700)}) rotate(${f1(8 + fall * 90)} 1180 240)"><rect x="1040" y="170" width="280" height="140" fill="#FFF1A8"/>${txt(1180, 230, 'just be', 30, '#4A3A10', { w: 800 })}${txt(1180, 275, 'disciplined', 30, '#4A3A10', { w: 800 })}</g>`);
      o += you(t, { x: 1560, y: 1080, scale: 1.3, flip: true, frontArm: t > B.mean ? { a1: -60, a2: -110 } : undefined, backArm: t > B.mean ? { a1: -120, a2: -70 } : undefined });
      o += thought(1500, 300, '…meaning what?', between(t, B.mean + 0.3, s.end), { size: 40 });
      return o;
    },

    // A wall of light switches: IF (situation) → flip → THEN (action) lights up.
    'w15-switches': (s, t) => {
      const B = s.b;
      let o = grad('w15f', '#FDF8F5', '#F3E7DD') + bg('url(#w15f)');
      o += fade(seg(t, B.beh, B.beh + 0.4), txt(960, 160, 'IF this happens → I do THIS', 56, C.dark, { f: 'Playfair Display', it: true }));
      [['🛑 full stop', '🔄 reset'], ['🏃 missed entry', '🚫 don’t chase'], ['📉 daily limit', '🚪 done'], ['💚 green, want more', '📋 check stop rules'], ['😨 scared after loss', '🔍 judge this setup']].forEach(([a, b], j) => {
        const y = 280 + j * 140, at = B.ifthis + 0.6 + j * 1.1, on = seg(t, at + 0.6, at + 0.8) > 0;
        o += fade(seg(t, at, at + 0.4), `<rect x="200" y="${y - 50}" width="620" height="100" rx="50" fill="#fff"/>${txt(510, y + 12, a, 34, C.dark, { w: 800 })}<rect x="900" y="${y - 44}" width="60" height="88" rx="14" fill="#fff" stroke="#2C1810" stroke-width="4"/><rect x="914" y="${on ? y - 34 : y + 2}" width="32" height="32" rx="6" fill="#2C1810"/><rect x="1040" y="${y - 50}" width="680" height="100" rx="50" fill="${on ? '#2AA594' : '#E6DDD3'}"/>${txt(1380, y + 12, b, 34, on ? '#fff' : C.muted, { w: 800 })}`);
      });
      o += fade(seg(t, B.use, B.use + 0.5), pill(960, 1000, 'psychology you can actually use', '#7F77DD', 1, 32));
      return o;
    },

    // Dayli confesses: four "I knew…" cards, each followed by "…did it anyway".
    'w15-knew': (s, t) => {
      const B = s.b;
      let o = grad('w15g', '#F3E3D6', '#FBF4EF') + bg('url(#w15g)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.k1 ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      o += fade(seg(t, B.learning, B.learning + 0.4), `<rect x="760" y="170" width="420" height="120" rx="24" fill="#2AA594"/>${txt(970, 250, 'KNOWING', 44, '#fff', { ls: 4 })}${txt(1290, 250, '≠', 60, C.dark)}<rect x="1400" y="170" width="420" height="120" rx="24" fill="#7F77DD"/>${txt(1610, 250, 'DOING', 44, '#fff', { ls: 4 })}`);
      ['🔁', '➕', '🎚️', '🚪'].forEach((e, j) => { const at = B['k' + (j + 1)], x = 880 + (j % 2) * 560, y = 470 + Math.floor(j / 2) * 270; o += scaleAt(x + 120, y, pop(t, at, 0.4), `<rect x="${x - 100}" y="${y - 100}" width="440" height="200" rx="20" fill="#fff"/>${txt(x - 20, y + 24, e, 70, C.dark)}${txt(x + 190, y - 10, 'I knew', 30, '#2AA594', { w: 800 })}${txt(x + 190, y + 40, '…did it anyway', 26, '#E2556F', { w: 800, op: f1(seg(t, at + 0.8, at + 1.2)) })}`); });
      return o;
    },

    // Guardrails on a winding mountain road. Her car bumps into them and stays on the road.
    'w15-guardrails': (s, t) => {
      const B = s.b;
      let o = grad('w15h', '#CDEBF7', '#FDF8F5') + bg('url(#w15h)');
      o += `<path d="M0,900 C400,860 600,640 960,640 S1500,500 1920,420 L1920,1080 L0,1080 Z" fill="#9C8CB8"/><path d="M0,900 C400,860 600,640 960,640 S1500,500 1920,420" fill="none" stroke="#E8D5C4" stroke-width="80"/>`;
      const rails = seg(t, B.protect, B.protect + 1.5);
      if (rails > 0) for (let x = 100; x < 1920 * rails; x += 120) { const y = x < 960 ? 900 - (x / 960) * 260 - 40 : 640 - (x - 960) * 0.23 - 40; o += `<rect x="${x}" y="${f1(y - 70)}" width="100" height="20" rx="6" fill="#2AA594"/><rect x="${x + 40}" y="${f1(y - 50)}" width="12" height="50" fill="#2AA594"/>`; }
      const cx = 200 + seg(t, s.start, s.end) * 1400, cy = cx < 960 ? 900 - (cx / 960) * 260 : 640 - (cx - 960) * 0.23, wob = Math.sin(t * 5) * 10;
      o += `<g transform="translate(${f1(cx)},${f1(cy - 40 + wob * 0.3)}) rotate(${f1(wob * 0.5)})"><rect x="-80" y="-50" width="160" height="70" rx="20" fill="#E2556F"/><circle cx="-50" cy="24" r="20" fill="#2C1810"/><circle cx="50" cy="24" r="20" fill="#2C1810"/></g>`;
      ['😤', '🤩', '😨', '😎', '🌀'].forEach((e, j) => { o += txt(300 + j * 300, 200 + (j % 2) * 80, e, 60, C.dark, { op: f1(seg(t, B.protect + 2 + j * 0.8, B.protect + 2.4 + j * 0.8)) }); });
      o += fade(seg(t, B.magic, B.magic + 0.4) * (1 - seg(t, B.protect, B.protect + 0.4)), txt(960, 300, '“just make the perfect decision every time”', 44, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + cross(1460, 280, pop(t, B.magic + 2, 0.4), '#E2556F', 30));
      return o;
    },

    // Calm-you at a sunny desk writes the rulebook, while a stormy trade waits in a window.
    'w15-calm': (s, t) => {
      const B = s.b;
      let o = wall('w15i', '#FFE7C7', '#FDF8F5', 880, '#C98B6B');
      o += windowBox(1340, 160, 440, 360, '#3A1420', rain(1340, 440, 160, 520, t, 10, '#9AA3B8') + candles(1380, 260, 360, 200, vals(8, 12, -0.01, 0.06, 0.6), 12));
      o += fade(seg(t, B.outside, B.outside + 0.5), txt(1560, 580, 'the trade, later', 30, C.muted, { w: 800 }));
      o += desk(300, 860, 900) + you(t, { x: 700, y: 1000, scale: 1.25, frontArm: { a1: 20, a2: -10 } });
      o += `<rect x="780" y="740" width="260" height="120" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="5"/>${[0, 1, 2].map(j => `<rect x="800" y="${764 + j * 30}" width="${f1(220 * seg(t, B.calm + 1 + j * 1.2, B.calm + 2 + j * 1.2))}" height="12" rx="6" fill="#7F77DD"/>`).join('')}`;
      o += sun(300, 220, 70, t);
      o += fade(seg(t, B.exactly, B.exactly + 0.4), pill(700, 520, 'calm you, writing the rules', '#2AA594', 1, 30));
      return o;
    },

    // Pause button appears big on screen; journal and pen slide in.
    'w15-pause': (s, t) => {
      const B = s.b;
      let o = grad('w15j', '#EEEBFB', '#FDF8F5') + bg('url(#w15j)');
      o += scaleAt(560, 460, pop(t, B.grab, 0.6), `<circle cx="560" cy="460" r="170" fill="#2C1810"/><rect x="500" y="380" width="40" height="160" rx="10" fill="#fff"/><rect x="580" y="380" width="40" height="160" rx="10" fill="#fff"/>${txt(560, 720, 'pause the video', 40, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      const k = ease(seg(t, B.grab + 1, B.grab + 2));
      o += `<g transform="translate(${f1(lerp(2100, 1300, k))},460) rotate(-6)"><rect x="-200" y="-260" width="400" height="520" rx="16" fill="#7F77DD"/><rect x="-180" y="-240" width="360" height="480" rx="8" fill="#FFF8E6"/>${txt(0, -150, 'MY RULES', 40, '#7F77DD', { ls: 4 })}<rect x="140" y="-80" width="16" height="220" rx="6" fill="#E2B04A" transform="rotate(20 148 30)"/></g>`;
      o += fade(seg(t, B.build, B.build + 0.5), txt(960, 940, 'let’s build them', 56, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Rule cards drop into her rulebook one by one (FOMO, after a loss, winning day, afraid).
    'w15-cards': (s, t) => {
      const B = s.b;
      let o = wall('w15k', '#FDF8F5', '#F3E7DD', 880, '#D9C3B0');
      o += `<rect x="1180" y="300" width="560" height="560" rx="16" fill="#7F77DD"/><rect x="1200" y="320" width="520" height="520" rx="10" fill="#FFF8E6"/>`;
      const cards = [[B.r1, '🏃', 'missed entry → don’t chase', '#F4829A'], [B.r2, '🛑', 'after a loss → I ____', '#E2556F'], [B.r3, '👑', 'winning day → size stays', '#E2B04A'], [B.r4, '😨', 'afraid → check criteria', '#7F77DD']];
      cards.forEach(([at, e, l, col], j) => {
        const k = ease(seg(t, at, at + 1)), x = lerp(500, 1460, k), y = lerp(500, 400 + j * 110, k), sc = lerp(1.6, 1, k);
        o += fade(seg(t, at - 0.2, at + 0.1), `<g transform="translate(${f1(x)},${f1(y)}) scale(${f1(sc)})"><rect x="-240" y="-44" width="480" height="88" rx="14" fill="#fff" stroke="${col}" stroke-width="5"/>${txt(-190, 14, e, 40, C.dark)}${txt(-140, 12, l, 24, C.dark, { a: 'start', w: 800 })}</g>`);
      });
      if (t > B.r2 && t < B.r3) ['10 min away', 'leave the chart', 'check if valid'].forEach((l, j) => { o += pill(500, 760 + j * 70, l, '#B8B3C9', pop(t, B.r2 + 1.5 + j * 0.4, 0.3), 26); });
      o += you(t, { x: 300, y: 1000, scale: 1.1, frontArm: { a1: -30, a2: -40 } });
      return o;
    },

    // More cards: in profit, daily stops, broke a rule, needing money. Book closes: emergency manual.
    'w15-cards2': (s, t) => {
      const B = s.b;
      let o = wall('w15l', '#FDF8F5', '#F3E7DD', 880, '#D9C3B0');
      const shut = ease(seg(t, B.r8 + 2, B.r8 + 3));
      o += `<rect x="1180" y="300" width="560" height="560" rx="16" fill="#7F77DD"/><rect x="1200" y="320" width="${f1(520 * (1 - shut))}" height="520" rx="10" fill="#FFF8E6"/>`;
      const cards = [[B.r5, '💰', 'in profit → manage by ____', '#2AA594'], [B.r6, '🚪', 'daily stops → trades · loss · mind', '#7F77DD'], [B.r7, '⚠️', 'broke a rule → I ____', '#E2556F'], [B.r8, '💸', 'need money ≠ a setup', '#E2B04A']];
      if (shut < 0.5) cards.forEach(([at, e, l, col], j) => { const k = ease(seg(t, at, at + 1)), x = lerp(500, 1460, k), y = lerp(500, 400 + j * 110, k), sc = lerp(1.6, 1, k); o += fade(seg(t, at - 0.2, at + 0.1), `<g transform="translate(${f1(x)},${f1(y)}) scale(${f1(sc)})"><rect x="-240" y="-44" width="480" height="88" rx="14" fill="#fff" stroke="${col}" stroke-width="5"/>${txt(-190, 14, e, 40, C.dark)}${txt(-140, 12, l, 22, C.dark, { a: 'start', w: 800 })}</g>`); });
      if (t > B.r5 && t < B.r6) ['partials', 'breakeven', 'base hits'].forEach((l, j) => { o += pill(500, 760 + j * 70, l, '#B8B3C9', pop(t, B.r5 + 1, 0.3), 26); });
      o += fade(shut, `${txt(1460, 560, '🚨', 90, C.dark)}${txt(1460, 680, 'EMERGENCY', 36, '#fff', { ls: 4 })}${txt(1460, 730, 'MANUAL', 36, '#fff', { ls: 4 })}`);
      o += you(t, { x: 300, y: 1000, scale: 1.1, frontArm: { a1: -30, a2: -40 } });
      return o;
    },

    // The rule: feelings arrive as letters in an inbox; the DECIDE button is wired to the rulebook.
    'w15-rule': (s, t) => {
      const B = s.b;
      let o = grad('w15m', '#EEEBFB', '#DDF1EE') + bg('url(#w15m)');
      o += txt(960, 110, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 210, pop(t, s.start + 0.4, 0.8), txt(960, 200, 'I don’t rely on how I feel to decide how I trade.', 50, C.dark, { f: 'Playfair Display' }) + txt(960, 265, 'I rely on the rules I created when I was thinking clearly.', 42, '#2AA594', { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      o += fade(a, `<rect x="260" y="380" width="560" height="460" rx="24" fill="#fff"/>${txt(540, 440, '📥 feelings', 34, '#7F77DD', { w: 800 })}`);
      [[B.e1, '😤 frustrated'], [B.e2, '😨 scared'], [B.e3, '😎 overconfident']].forEach(([at, l], j) => { const k = ease(seg(t, at, at + 0.5)); o += fade(a * k, envelope(400, 530 + j * 100 - (1 - k) * 60, 0.45) + txt(560, 545 + j * 100, l, 30, C.dark, { a: 'start', w: 800 })); });
      const wired = seg(t, B.e4, B.e4 + 0.6);
      o += fade(a, `<rect x="1120" y="500" width="520" height="220" rx="110" fill="${wired > 0.5 ? '#2C1810' : '#E2556F'}"/>${txt(1380, 630, 'DECIDE', 60, '#fff', { ls: 8 })}`);
      o += fade(a * wired, `<path d="M1380,720 L1380,830" stroke="#2AA594" stroke-width="10"/><rect x="1300" y="830" width="160" height="80" rx="10" fill="#7F77DD"/>${txt(1380, 882, '📋', 40, '#fff')}`);
      if (fin > 0) o += fade(fin, pill(960, 440, 'remember where we started', '#7F77DD', 1, 32) + txt(960, 600, 'my emotions are information,', 70, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 710, 'not instructions.', 80, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Five glowing question cards on a nightstand: her psychology check-in.
    'w15-checkin': (s, t) => {
      const B = s.b;
      let o = wall('w15n', '#1A1424', '#2A2142', 920, '#141026');
      o += `<ellipse cx="960" cy="300" rx="600" ry="200" fill="#F9D89A" opacity=".08"/>`;
      ['😤', '➡️', '⚡', '📋', '📈'].forEach((e, j) => { const x = 320 + j * 320, k = pop(t, B.five + 0.6 + j * 0.8, 0.5); o += scaleAt(x, 520, k, `<rect x="${x - 130}" y="380" width="260" height="300" rx="24" fill="#2A2142" stroke="#F9D89A" stroke-width="${j === 4 ? 8 : 3}"/><circle cx="${x}" cy="440" r="30" fill="#7F77DD"/>${txt(x, 452, String(j + 1), 30, '#fff')}${txt(x, 600, e, 80, '#fff')}`); });
      o += fade(seg(t, B.five, B.five + 0.5), txt(960, 220, '✍🏽 five questions', 52, '#fff', { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.five + 5, B.five + 5.5), pill(1600, 760, 'how will I know I’m improving?', '#F9D89A', 1, 26, '#1A1424'));
      return o;
    },

    // Growth: FOMO knocks; she waves it off and stays put. A sprout grows.
    'w15-growth': (s, t) => {
      const B = s.b;
      let o = grad('w15o', '#E6F5F2', '#FDF8F5') + bg('url(#w15o)') + `<rect y="880" width="1920" height="200" fill="#B9DDB0"/>`;
      o += fade(seg(t, B.notnever, B.notnever + 0.4) * (1 - seg(t, B.felt, B.felt + 0.4)), pill(960, 260, '“never feel FOMO again”', '#B8B3C9', 1, 36) + cross(1240, 240, pop(t, B.notnever + 2, 0.4), '#E2556F', 28));
      const run = (t - B.felt) * 300;
      if (t > B.felt) o += `<g transform="translate(${f1(1900 - (run % 2400))},560)"><rect x="-150" y="-100" width="300" height="200" rx="40" fill="#E2556F"/>${txt(0, 20, 'FOMO 🏃', 40, '#fff')}</g>`;
      o += you(t, { x: 600, y: 960, scale: 1.25, frontArm: t > B.felt ? { a1: -40, a2: -60 } : undefined });
      const g = ease(seg(t, B.growth, B.growth + 2));
      if (t > B.growth) o += `<rect x="780" y="840" width="100" height="60" rx="10" fill="#C98B6B" opacity="${f1(seg(t, B.growth, B.growth + 0.4))}"/><path d="M830,840 L830,${f1(840 - 200 * g)}" stroke="#2AA594" stroke-width="10"/>${g > 0.5 ? `<ellipse cx="860" cy="${f1(840 - 150 * g)}" rx="${f1(40 * g)}" ry="${f1(18 * g)}" fill="#2AA594"/>` : ''}`;
      o += fade(seg(t, B.growth, B.growth + 0.5), txt(960, 200, 'felt it. didn’t chase. that’s growth.', 52, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Two short comic strips of her own wins.
    'w15-wins': (s, t) => {
      const B = s.b;
      let o = grad('w15p', '#FDF8F5', '#F3E7DD') + bg('url(#w15p)');
      const strip = (y, at, panels, col) => panels.forEach(([e, l], j) => { const x = 280 + j * 340; o += fade(seg(t, at + j * 1.3, at + j * 1.3 + 0.4), `<rect x="${x - 150}" y="${y - 110}" width="300" height="220" rx="16" fill="#fff" stroke="${j === panels.length - 1 ? col : '#EADFD8'}" stroke-width="${j === panels.length - 1 ? 8 : 4}"/>${txt(x, y + 10, e, 70, C.dark)}${txt(x, y + 80, l, 24, C.muted, { w: 800 })}`); });
      strip(320, B.w1, [['🛑', 'stopped out'], ['😤', 'frustrated'], ['🚶🏾‍♀️', 'stepped away'], ['🔍', 'setup there?'], ['✅', 'took it']], '#2AA594');
      strip(700, B.w2, [['💰', 'up $500'], ['🔁', 'urge to keep going'], ['👀', 'noticed it'], ['💻', 'closed TradingView']], '#7F77DD');
      o += fade(seg(t, B.dev, B.dev + 0.5), `<rect x="0" y="900" width="1920" height="140" fill="#FDF8F5" opacity=".95"/>${txt(960, 985, 'THAT is psychological development.', 54, C.dark, { f: 'Playfair Display', it: true })}`);
      return o;
    },

    // "WAIT." stop signs pop up around her as she catches herself, then she holds up her rulebook.
    'w15-wait': (s, t) => {
      const B = s.b;
      let o = grad('w15q', '#FFE7C7', '#FDF8F5') + bg('url(#w15q)') + `<rect y="880" width="1920" height="200" fill="#E8D5C4"/>`;
      o += fade(seg(t, B.never, B.never + 0.4) * (1 - seg(t, B.recog, B.recog + 0.4)), ['😤', '🤩', '😨', '😔'].map((e, j) => txt(500 + j * 300, 260, e, 80, C.dark, { op: f1(0.5 + 0.5 * Math.sin(t * 3 + j)) })).join('') + txt(960, 400, 'you’ll still feel things', 50, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.sooner, B.sooner + 0.4) * (1 - seg(t, B.recog, B.recog + 0.4)), pill(960, 500, 'catch yourself sooner', '#2AA594', 1, 36));
      [[B.w1, '🏃', 380, 240], [B.w2, '💸', 1540, 240], [B.w3, '🔁', 360, 560], [B.w4, '😨', 1560, 560], [B.w5, '😎', 960, 180]].forEach(([at, e, x, y]) => { o += scaleAt(x, y, pop(t, at, 0.5) * (1 - seg(t, B.trader, B.trader + 0.5) * 0.5), `<path d="M${x - 70},${y - 30} L${x - 30},${y - 70} L${x + 30},${y - 70} L${x + 70},${y - 30} L${x + 70},${y + 30} L${x + 30},${y + 70} L${x - 30},${y + 70} L${x - 70},${y + 30} Z" fill="#E2556F"/>${txt(x, y - 4, 'WAIT', 26, '#fff', { ls: 2 })}${txt(x, y + 40, e, 34, '#fff')}`); });
      o += you(t, { x: 960, y: 980, scale: 1.3, frontArm: t > B.rule ? { a1: -100, a2: -60 } : undefined });
      o += scaleAt(1180, 700, pop(t, B.rule, 0.6), `<rect x="1100" y="620" width="160" height="200" rx="12" fill="#7F77DD"/><rect x="1115" y="635" width="130" height="170" rx="8" fill="#FFF8E6"/>${txt(1180, 730, 'RULE', 30, '#7F77DD', { ls: 4 })}`);
      return o;
    },

    // A mirror again, this time with the whole map around her reflection: structure, liquidity… and herself.
    'w15-self': (s, t) => {
      const B = s.b;
      let o = wall('w15r', '#EEEBFB', '#E0DAF2', 900, '#B8B3C9');
      ['structure', 'liquidity', 'HTF', 'ICC'].forEach((l, j) => { o += pill(360 + j * 400, 150, l, '#B8B3C9', pop(t, B.skills + 1 + j * 0.8, 0.4), 30); });
      o += fade(seg(t, B.yourself, B.yourself + 0.5), `<ellipse cx="960" cy="560" rx="190" ry="270" fill="#fff" stroke="#C9B8A8" stroke-width="16"/><ellipse cx="960" cy="560" rx="170" ry="250" fill="#E6F5F2"/>` + you(t, { x: 960, y: 780, scale: 0.75 }));
      [[B.q1, '🎯'], [B.q2, '⌛'], [B.q3, '🛑'], [B.q4, '📉'], [B.q5, '📈'], [B.q6, '🩹'], [B.q7, '📋']].forEach(([at, e], j) => { const ang = -Math.PI * 0.95 + j * (Math.PI * 1.9 / 6), x = 960 + Math.cos(ang) * 470, y = 560 + Math.sin(ang) * 300; o += scaleAt(x, y, pop(t, at, 0.4), `<circle cx="${f1(x)}" cy="${f1(y)}" r="62" fill="${j === 6 ? '#2AA594' : '#fff'}" stroke="#7F77DD" stroke-width="5"/>${txt(x, y + 22, e, 54, C.dark)}`); });
      return o;
    },

    // Training wheels off: no one beside her. Four pillars under her feet; she rides.
    'w15-solo': (s, t) => {
      const B = s.b;
      let o = grad('w15s', '#CDEBF7', '#FDF8F5') + bg('url(#w15s)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/><rect y="860" width="1920" height="60" fill="#E8D5C4"/>`;
      const empty = seg(t, B.beside, B.beside + 1);
      o += fade(1 - empty, you(t, { x: 300, y: 880, scale: 0.9, flip: true }));
      [[B.p1, '📋', '#7F77DD'], [B.p2, '🧠', '#2AA594'], [B.p3, '🧪', '#E2B04A'], [B.p4, '🛡️', '#F4829A']].forEach(([at, e, col], j) => { o += scaleAt(560 + j * 260, 320, pop(t, at, 0.5), `<rect x="${500 + j * 260}" y="240" width="120" height="160" rx="16" fill="${col}"/>${txt(560 + j * 260, 345, e, 60, '#fff')}`); });
      const ride = seg(t, B.exec, s.end), x = 600 + ride * 900;
      o += `<g transform="translate(${f1(x)},0)"><circle cx="-90" cy="850" r="60" fill="none" stroke="#2C1810" stroke-width="10"/><circle cx="110" cy="850" r="60" fill="none" stroke="#2C1810" stroke-width="10"/><path d="M-90,850 L0,780 L110,850 M0,780 L60,720" stroke="#E2556F" stroke-width="12" fill="none"/></g>`;
      o += you(t, { x: x + 10, y: 860, scale: 0.8, frontArm: { a1: -20, a2: 0 } });
      o += fade(seg(t, B.exec, B.exec + 0.5), txt(960, 160, 'now your job is to execute it', 52, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // The last frame: sunrise. "You need to become a self-aware one."
    'w15-end': (s, t) => {
      const B = s.b;
      const k = seg(t, s.start, s.end);
      let o = grad('w15t', '#FDE8ED', '#FFE7C7') + bg('url(#w15t)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/>`;
      o += `<circle cx="960" cy="${f1(820 - 240 * ease(k))}" r="200" fill="#F9D89A" opacity=".9"/>`;
      o += you(t, { x: 960, y: 900, scale: 1.2 });
      o += fade(seg(t, B.last + 0.3, B.last + 0.9), txt(960, 160, 'You don’t need to become an emotionless trader.', 52, C.muted, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.last + 3.5, B.last + 4.1), txt(960, 260, 'You need to become a self-aware one.', 68, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    /* ════ Psychology 5 · Fear of Losing ════════════════════════════ */

    // Evening at the desk: the chart builds into her setup and the zone lights up.
    'w5-ready': (s, t) => {
      const B = s.b;
      let o = wall('w5a', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += windowBox(1500, 160, 300, 240, '#1A1530', `<circle cx="1720" cy="220" r="34" fill="#F9D89A"/>`);
      const v = [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.5, 0.45, 0.48, 0.44, 0.47];
      const n = Math.floor(4 + 7 * seg(t, s.start, B.here));
      o += monitor(300, 180, 900, 520, candles(340, 230, 820, 420, v, n, { slots: 14 })) + desk(160, 820, 1200);
      const z = seg(t, B.here, B.here + 0.6);
      o += fade(z, `<rect x="900" y="${f1(230 + 420 * (1 - 0.52))}" width="260" height="90" rx="10" fill="#2AA594" opacity=".28" stroke="#2AA594" stroke-width="4"/>`) + pill(1030, 220, 'your setup', '#2AA594', pop(t, B.here + 0.3, 0.5), 28);
      o += fade(seg(t, B.every, B.every + 0.5), `<circle cx="1030" cy="${f1(230 + 420 * 0.48)}" r="${f1(70 + 20 * Math.sin(t * 4))}" fill="none" stroke="#F9D89A" stroke-width="5" opacity=".7"/>`);
      o += you(t, { x: 1500, y: 1020, scale: 1.25, flip: true });
      return o;
    },

    // Her checklist ticks itself off next to the chart: structure, confirmation, entry.
    'w5-checks': (s, t) => {
      const B = s.b;
      let o = grad('w5b', '#EEEBFB', '#FDF8F5') + bg('url(#w5b)');
      o += `<rect x="160" y="200" width="900" height="600" rx="22" fill="#120D1C"/>` + candles(200, 250, 820, 500, [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.5, 0.45, 0.48, 0.44, 0.47, 0.55], 12, { slots: 14 });
      o += `<rect x="1180" y="200" width="580" height="600" rx="22" fill="#fff" stroke="#EADFD8" stroke-width="4"/>${txt(1470, 280, 'MY SETUP', 30, '#7F77DD', { ls: 6 })}`;
      [[B.c1, '🏗️', 'structure'], [B.c2, '✅', 'confirmation'], [B.c3, '🎯', 'entry']].forEach(([at, e, l], j) => {
        const y = 400 + j * 130;
        o += fade(seg(t, at - 0.2, at + 0.2), txt(1260, y + 18, e, 46, C.dark) + txt(1310, y + 16, l, 40, C.dark, { a: 'start', w: 700 })) + check(1680, y, pop(t, at + 0.5, 0.4), '#2AA594', 32);
      });
      o += fade(seg(t, B.c1, B.c1 + 0.4), `<path d="M240,${f1(250 + 500 * 0.62)} L560,${f1(250 + 500 * 0.62)}" stroke="#F9D89A" stroke-width="4" stroke-dasharray="14 10"/>`);
      o += fade(seg(t, B.c3, B.c3 + 0.4), `<circle cx="${f1(200 + 11.5 * 820 / 14)}" cy="${f1(250 + 500 * 0.45)}" r="26" fill="none" stroke="#2AA594" stroke-width="6"/>`);
      return o;
    },

    // Close-up: her hand on the mouse, the cursor shaking over BUY.
    'w5-hover': (s, t) => {
      const B = s.b;
      let o = grad('w5c', '#2A2142', '#3B2F55') + bg('url(#w5c)') + `<rect y="700" width="1920" height="380" fill="#8B6A55"/>`;
      o += `<rect x="360" y="70" width="1200" height="500" rx="20" fill="#120D1C" stroke="#3A2F55" stroke-width="10"/>` + candles(400, 110, 700, 420, [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.5, 0.45, 0.48, 0.44], 10);
      o += `<rect x="1180" y="220" width="300" height="120" rx="18" fill="#2AA594"/>${txt(1330, 300, 'BUY', 54, '#fff', { ls: 4 })}`;
      const sh = t > B.hand ? Math.sin(t * 31) * 7 + Math.sin(t * 17) * 4 : 0;
      o += `<g transform="translate(${f1(1300 + sh)},${f1(320 + sh * 0.6)})"><path d="M0,0 L0,64 L16,48 L28,76 L40,70 L28,44 L50,44 Z" fill="#fff" stroke="#120D1C" stroke-width="4"/></g>`;
      o += `<ellipse cx="960" cy="870" rx="190" ry="250" fill="#E6DDD3"/><line x1="960" y1="640" x2="960" y2="790" stroke="#C9B8A8" stroke-width="6"/>`;
      o += `<g transform="translate(${f1(sh * 0.5)},0)"><rect x="830" y="900" width="260" height="200" fill="#F4829A"/><ellipse cx="960" cy="830" rx="150" ry="120" fill="#9A6244"/>${[-90, -30, 30, 90].map((dx, j) => `<ellipse cx="${960 + dx}" cy="${730 - (j === 1 || j === 2 ? 20 : 0)}" rx="30" ry="62" fill="#9A6244"/>`).join('')}</g>`;
      o += thought(1500, 760, 'What if this one loses too?', pop(t, B.what, 0.6), { size: 44 });
      o += fade(seg(t, B.think, B.think + 0.4) * (1 - seg(t, B.what, B.what + 0.3)), txt(1500, 780, '…', 80, '#fff'));
      return o;
    },

    // Behind her: one red trade, a week of red days, then a little rain cloud of her own.
    'w5-ghosts': (s, t) => {
      const B = s.b;
      let o = wall('w5d', '#F3E7DD', '#EADFD8', 880, '#C9B8A8');
      o += scaleAt(420, 320, pop(t, B.m1, 0.5), `<rect x="260" y="200" width="320" height="240" rx="18" fill="#fff" stroke="#E2556F" stroke-width="6"/>${candles(290, 230, 260, 140, [0.8, 0.7, 0.55, 0.3], 4)}${bigNum(420, 420, '−$', 46, '#E2556F')}`);
      ['M', 'T', 'W', 'T', 'F'].forEach((d, j) => { const x = 1180 + j * 130, red = j < 3; o += fade(seg(t, B.m2 + j * 0.35, B.m2 + j * 0.35 + 0.3), `<rect x="${x - 55}" y="220" width="110" height="140" rx="12" fill="#fff" stroke="#EADFD8" stroke-width="4"/>${txt(x, 260, d, 26, C.muted)}`) + (red ? cross(x, 315, pop(t, B.m2 + 0.4 + j * 0.4, 0.4), '#E2556F', 26) : ''); });
      const rk = seg(t, B.m3, B.m3 + 0.6);
      o += fade(rk, cloud(960, 300, 0.6, '#9AA3B8') + (rk > 0.5 ? rain(870, 200, 360, 520, t, 7, '#7F92B8') : ''));
      o += you(t, { x: 960, y: 1000, scale: 1.25, mood: t > B.m2 ? 'sad' : undefined });
      return o;
    },

    // A giant pair of glasses: one lens shows today's setup, the other is tinted red by the past.
    'w5-lens': (s, t) => {
      const B = s.b;
      let o = grad('w5e', '#FDF8F5', '#F3E3D6') + bg('url(#w5e)');
      const tint = seg(t, B.lens + 2, B.lens + 5);
      o += `<defs><clipPath id="w5l1"><circle cx="620" cy="480" r="250"/></clipPath><clipPath id="w5l2"><circle cx="1300" cy="480" r="250"/></clipPath></defs>`;
      o += `<g clip-path="url(#w5l1)"><rect x="370" y="230" width="500" height="500" fill="#120D1C"/>${candles(400, 300, 440, 340, [0.3, 0.4, 0.5, 0.45, 0.55, 0.65, 0.6, 0.72], 8)}</g>`;
      o += `<g clip-path="url(#w5l2)"><rect x="1050" y="230" width="500" height="500" fill="#120D1C"/>${tint < 0.5 ? candles(1080, 300, 440, 340, [0.3, 0.4, 0.5, 0.45, 0.55, 0.65, 0.6, 0.72], 8) : candles(1080, 300, 440, 340, [0.8, 0.7, 0.72, 0.55, 0.5, 0.35, 0.38, 0.2], 8)}<rect x="1050" y="230" width="500" height="500" fill="#E2556F" opacity="${f1(tint * 0.45)}"/></g>`;
      o += `<circle cx="620" cy="480" r="250" fill="none" stroke="#2C1810" stroke-width="30"/><circle cx="1300" cy="480" r="250" fill="none" stroke="#2C1810" stroke-width="30"/><path d="M870,450 Q960,390 1050,450" fill="none" stroke="#2C1810" stroke-width="26"/><path d="M370,440 L180,380 M1550,440 L1740,380" stroke="#2C1810" stroke-width="26" stroke-linecap="round"/>`;
      o += fade(seg(t, B.lens + 0.8, B.lens + 1.3), txt(620, 800, 'what’s in front of you', 38, '#2AA594', { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.lens + 4, B.lens + 4.5), txt(1300, 800, 'everything before it', 38, '#E2556F', { f: 'Playfair Display', it: true }));
      o += scaleAt(960, 930, pop(t, B.title + 2, 0.6), pill(960, 930, 'the fear of losing', '#7F77DD', 1, 44));
      return o;
    },

    // BUY and SELL are easy to press. What she's scared of is the fog on the other side.
    'w5-button': (s, t) => {
      const B = s.b;
      let o = grad('w5f', '#EEEBFB', '#FDF8F5') + bg('url(#w5f)');
      const up = ease(seg(t, B.after, B.after + 1));
      o += `<g transform="translate(0,${f1(-140 * up)})">`;
      o += scaleAt(700, 400, pop(t, B.int, 0.5), `<rect x="520" y="320" width="360" height="160" rx="26" fill="#2AA594"/>${txt(700, 425, 'BUY', 64, '#fff', { ls: 6 })}`);
      o += scaleAt(1220, 400, pop(t, B.int + 0.3, 0.5), `<rect x="1040" y="320" width="360" height="160" rx="26" fill="#E2556F"/>${txt(1220, 425, 'SELL', 64, '#fff', { ls: 6 })}`);
      o += fade(seg(t, B.say, B.say + 0.4) * (1 - seg(t, B.click, B.click + 0.3)), txt(960, 220, '“I’m scared to take the trade”', 44, C.muted, { f: 'Playfair Display', it: true }));
      o += check(900, 330, pop(t, B.click + 1, 0.4), '#2AA594', 34) + check(1420, 330, pop(t, B.click + 1.3, 0.4), '#2AA594', 34);
      o += fade(seg(t, B.click + 0.5, B.click + 1) * (1 - up), txt(960, 590, 'clicking isn’t the scary part', 40, '#2AA594', { f: 'Playfair Display', it: true }));
      o += `</g>`;
      if (up > 0) o += fade(up, `<path d="M960,380 L960,560" stroke="#B8B3C9" stroke-width="8" stroke-dasharray="16 12"/>` + cloud(960, 740, 1.3, '#B8B3C9', 0.9) + cloud(780, 790, 0.7, '#CFC8FA', 0.8) + cloud(1150, 800, 0.7, '#CFC8FA', 0.8) + txt(960, 790, '?', 140, '#fff') + txt(960, 1010, 'what happens AFTER the click', 40, C.dark, { f: 'Playfair Display', it: true }));
      o += you(t, { x: 1700, y: 1020, scale: 1.0, flip: true });
      return o;
    },

    // Four little storms around her: red trade, money flying off, "wrong", stop hit.
    'w5-fears': (s, t) => {
      const B = s.b;
      let o = grad('w5g', '#3A1420', '#5A2233') + bg('url(#w5g)');
      const card = (x, y, at, inner) => scaleAt(x, y, pop(t, at, 0.5), `<rect x="${x - 190}" y="${y - 130}" width="380" height="260" rx="20" fill="#fff"/>${inner}`);
      o += card(400, 290, B.f1, candles(250, 190, 300, 200, [0.85, 0.7, 0.75, 0.5, 0.35, 0.15], 6));
      const fly = seg(t, B.f2 + 0.5, B.f2 + 3);
      o += card(1520, 290, B.f2, [0, 1, 2].map(j => `<g transform="translate(${f1(1430 + j * 80 + fly * 40)},${f1(330 - j * 25 - fly * 60)})" opacity="${f1(1 - fly * 0.4)}"><rect x="-40" y="-24" width="80" height="48" rx="6" fill="#2AA594"/>${txt(0, 12, '$', 32, '#fff')}<path d="M-40,-10 q-30,-30 -50,0 M40,-10 q30,-30 50,0" stroke="#B8B3C9" stroke-width="6" fill="none"/></g>`).join(''));
      o += card(400, 720, B.f3, cross(400, 700, pop(t, B.f3 + 0.4, 0.4), '#E2556F', 70) + txt(400, 820, 'wrong again', 32, '#E2556F'));
      const hit = seg(t, B.f4 + 0.4, B.f4 + 2);
      o += card(1520, 720, B.f4, `<line x1="1350" x2="1690" y1="780" y2="780" stroke="#E2556F" stroke-width="5" stroke-dasharray="12 8"/>${txt(1640, 770, 'STOP', 22, '#E2556F')}<path d="M1360,640 L1430,${f1(lerp(640, 720, hit))} L1500,${f1(lerp(650, 760, hit))} L${f1(lerp(1500, 1580, hit))},${f1(lerp(650, 790, hit))}" fill="none" stroke="#120D1C" stroke-width="6"/>${hit >= 1 ? `<circle cx="1580" cy="780" r="16" fill="#E2556F"/>` : ''}`);
      o += you(t, { x: 960, y: 1020, scale: 1.15, mood: 'sad' });
      return o;
    },

    // The voice in her head, in three bubbles. Then one loss swells into something bigger.
    'w5-voice': (s, t) => {
      const B = s.b;
      let o = wall('w5h', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += fade(seg(t, B.confirm, B.confirm + 0.6), cloud(960, 330, 0.55, '#5A4C7A'));
      o += thought(560, 260, 'Maybe I don’t know what I’m doing.', pop(t, B.v1, 0.5), { size: 38 });
      o += thought(1380, 400, 'Maybe my strategy doesn’t work.', pop(t, B.v2, 0.5), { size: 38 });
      o += thought(540, 560, 'Maybe I’m not good at this.', pop(t, B.v3, 0.5), { size: 38 });
      const g = ease(seg(t, B.bigger, B.bigger + 2.5));
      if (t > B.bigger) o += `<circle cx="1500" cy="${f1(860 - 200 * g)}" r="${f1(50 + 190 * g)}" fill="#E2556F" opacity=".92"/>${txt(1500, 860 - 200 * g + 14, '1 loss', 30 + 40 * g, '#fff')}`;
      o += you(t, { x: 960, y: 1020, scale: 1.1, mood: 'sad' });
      return o;
    },

    // Three red ghosts of old trades sit at the desk with her. Then she carries them toward the next setup.
    'w5-carry': (s, t) => {
      const B = s.b;
      let o = wall('w5i', '#F3E7DD', '#EADFD8', 880, '#C9B8A8');
      const ghost = (x, y, k, lbl) => k <= 0 ? '' : `<g opacity="${f1(0.85 * k)}"><path d="M${x - 70},${y + 80} L${x - 70},${y - 40} Q${x},${y - 140} ${x + 70},${y - 40} L${x + 70},${y + 80} L${x + 45},${y + 60} L${x + 23},${y + 80} L${x},${y + 60} L${x - 23},${y + 80} L${x - 45},${y + 60} Z" fill="#F4A3B3"/><circle cx="${x - 22}" cy="${y - 30}" r="9" fill="#5A2233"/><circle cx="${x + 22}" cy="${y - 30}" r="9" fill="#5A2233"/>${txt(x, y + 30, lbl, 26, '#5A2233')}</g>`;
      const ph = t > B.eval - 0.3 ? 1 : 0;
      if (!ph) {
        o += monitor(640, 260, 640, 380, candles(680, 300, 560, 300, [0.3, 0.4, 0.5, 0.45, 0.55, 0.65], 6)) + desk(380, 760, 1160);
        o += you(t, { x: 960, y: 1040, scale: 1.1 });
        o += ghost(500, 600, seg(t, B.sit + 0.3, B.sit + 0.9), '−1') + ghost(1440, 600, seg(t, B.sit + 0.9, B.sit + 1.5), '−2') + ghost(1640, 540, seg(t, B.sit + 1.5, B.sit + 2.1), '−3');
        o += fade(seg(t, B.sit + 2, B.sit + 2.5), txt(960, 160, 'your last trades pulled up a chair', 46, C.dark, { f: 'Playfair Display', it: true }));
      } else {
        o += monitor(1200, 240, 560, 360, candles(1240, 280, 480, 280, [0.3, 0.4, 0.5, 0.45, 0.55], 5) + `<rect x="1560" y="360" width="140" height="70" rx="8" fill="#2AA594" opacity=".3" stroke="#2AA594" stroke-width="3"/>`) + desk(1120, 760, 720);
        o += txt(1480, 200, 'THIS trade', 30, '#2AA594', { ls: 4 });
        const w = seg(t, B.eval, B.carry + 3);
        const cx = lerp(380, 860, w);
        o += you(t, { x: cx, y: 1000, scale: 1.2, walking: w > 0 && w < 1, mood: 'sad', frontArm: { a1: 40, a2: -20 } });
        [0, 1, 2].forEach(j => { o += `<rect x="${f1(cx + 100)}" y="${752 - j * 50}" width="110" height="48" rx="8" fill="#E2556F" stroke="#fff" stroke-width="3"/>` + txt(cx + 155, 785 - j * 50, '−' + (j + 1), 24, '#fff'); });
        o += fade(seg(t, B.prob, B.prob + 0.5), pill(700, 180, 'the psychological problem', '#7F77DD', 1, 34));
      }
      return o;
    },

    // Dayli: a couple of stormy days, and the questions start piling up.
    'w5-rough': (s, t) => {
      const B = s.b;
      let o = grad('w5j', '#F3E3D6', '#FBF4EF') + bg('url(#w5j)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.rough ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      [0, 1].forEach(j => { const x = 1000 + j * 380; o += scaleAt(x, 340, pop(t, B.rough + j * 0.6, 0.5), `<rect x="${x - 150}" y="180" width="300" height="320" rx="20" fill="#fff" stroke="#EADFD8" stroke-width="4"/><rect x="${x - 150}" y="180" width="300" height="60" rx="20" fill="#9AA3B8"/>${txt(x, 225, j ? 'DAY 2' : 'DAY 1', 26, '#fff', { ls: 4 })}${cloud(x, 340, 0.55, '#9AA3B8')}${rain(x - 80, 160, 380, 480, t, 6, '#7F92B8')}`); });
      [[1600, 300], [1700, 520], [1150, 640], [1450, 700], [1720, 760]].forEach(([x, y], j) => { o += scaleAt(x, y, pop(t, B.rough + 2 + j * 0.7, 0.4), txt(x, y + 30, '?', 90, '#7F77DD')); });
      o += pill(1200, 860, 'really frustrating 😤', '#E2556F', pop(t, B.frus, 0.5), 32);
      return o;
    },

    // She hesitates and skips. Price runs straight to her target without her.
    'w5-skip': (s, t) => {
      const B = s.b;
      let o = wall('w5k', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      const v = [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.5, 0.45, 0.48, 0.55, 0.62, 0.7, 0.68, 0.78, 0.86, 0.84, 0.92];
      const n = 9 + Math.floor(8 * seg(t, B.then + 0.6, B.goes + 2.5));
      o += monitor(180, 140, 1060, 600, candles(220, 190, 980, 500, v, n, { slots: 18 }) + `<line x1="220" x2="1200" y1="${f1(190 + 500 * (1 - 0.92))}" y2="${f1(190 + 500 * (1 - 0.92))}" stroke="#2AA594" stroke-width="4" stroke-dasharray="14 10"/>${txt(1150, 190 + 500 * 0.08 - 14, 'TP', 26, '#2AA594')}`);
      o += fade(seg(t, B.hes, B.hes + 0.4), `<circle cx="${f1(220 + 8.5 * 980 / 18)}" cy="${f1(190 + 500 * 0.52)}" r="34" fill="none" stroke="#F9D89A" stroke-width="6"/>`);
      o += pill(1000, 840, 'skipped', '#B8B3C9', pop(t, B.skip, 0.4), 32);
      o += you(t, { x: 1560, y: 1020, scale: 1.25, flip: true, mood: t > B.irr ? 'sad' : undefined, frontArm: t > B.irr ? { a1: -150, a2: -175 } : undefined });
      o += thought(1440, 300, 'See! I KNEW it! 😤', pop(t, B.knew, 0.5), { size: 44 });
      return o;
    },

    // A crystal ball gets crossed out. The real problem: old trades leaning on her execution dial.
    'w5-hindsight': (s, t) => {
      const B = s.b;
      let o = grad('w5l', '#EEEBFB', '#FDF8F5') + bg('url(#w5l)');
      const ph2 = seg(t, B.allowed - 0.2, B.allowed + 0.4);
      o += fade(1 - ph2, scaleAt(960, 460, pop(t, B.thing, 0.6), `<circle cx="960" cy="440" r="200" fill="#CFC8FA" opacity=".85"/><circle cx="900" cy="380" r="50" fill="#fff" opacity=".6"/><rect x="820" y="620" width="280" height="70" rx="16" fill="#7F77DD"/>${txt(960, 470, '“it’ll win”', 44, '#5A4C9A', { f: 'Playfair Display', it: true })}`) + cross(1180, 280, pop(t, B.didnt + 2.5, 0.4), '#E2556F', 50) + fade(seg(t, B.didnt + 2.5, B.didnt + 3), txt(960, 840, 'nobody knows that', 44, C.dark, { f: 'Playfair Display', it: true })));
      if (ph2 > 0) {
        [0, 1, 2].forEach(j => { o += fade(seg(t, B.allowed + j * 0.5, B.allowed + j * 0.5 + 0.4), `<rect x="${200 + j * 60}" y="${360 + j * 50}" width="260" height="180" rx="16" fill="#fff" stroke="#E2556F" stroke-width="6"/>${bigNum(330 + j * 60, 470 + j * 50, '−$', 50, '#E2556F')}`); });
        const push = ease(seg(t, B.allowed + 3, B.allowed + 5));
        o += fade(seg(t, B.allowed + 2, B.allowed + 2.5), `<path d="M640,520 L${f1(900 + 100 * push)},520" stroke="#E2556F" stroke-width="14" stroke-linecap="round"/><path d="M${f1(900 + 100 * push)},490 L${f1(950 + 100 * push)},520 L${f1(900 + 100 * push)},550 Z" fill="#E2556F"/>`);
        o += `<circle cx="1380" cy="520" r="230" fill="#fff" stroke="#7F77DD" stroke-width="12"/><path d="M1200,520 A180,180 0 0 1 1560,520" fill="none" stroke="#2AA594" stroke-width="22"/><line x1="1380" y1="520" x2="${f1(1380 + 160 * Math.cos(-Math.PI / 2 - push * 1.1))}" y2="${f1(520 + 160 * Math.sin(-Math.PI / 2 - push * 1.1))}" stroke="#2C1810" stroke-width="14" stroke-linecap="round"/><circle cx="1380" cy="520" r="20" fill="#2C1810"/>${txt(1380, 640, 'how I execute', 34, '#7F77DD')}`;
      }
      return o;
    },

    // A fork in the road: a win path and a loss path. Both end at the same sign: followed my process.
    'w5-paths': (s, t) => {
      const B = s.b;
      let o = grad('w5m', '#CDEBF7', '#FDF8F5') + bg('url(#w5m)') + `<rect y="560" width="1920" height="520" fill="#B9DDB0"/>`;
      o += `<path d="M960,1100 L960,720 L520,380 M960,720 L1400,380" fill="none" stroke="#E8D5C4" stroke-width="110" stroke-linecap="round" stroke-linejoin="round"/>`;
      o += `<circle cx="520" cy="340" r="80" fill="#2AA594"/>${txt(520, 365, 'WIN', 34, '#fff')}<circle cx="1400" cy="340" r="80" fill="#E2556F"/>${txt(1400, 365, 'LOSS', 34, '#fff')}`;
      o += fade(seg(t, B.lost, B.lost + 0.5), `<line x1="1400" y1="240" x2="1400" y2="420" stroke="#fff" stroke-width="0"/>`) + scaleAt(1400, 340, pop(t, B.lost, 0.5), `<circle cx="1400" cy="340" r="96" fill="none" stroke="#E2556F" stroke-width="8"/>`);
      o += check(620, 260, pop(t, B.ifit + 1.5, 0.4), '#2AA594', 34) + check(1500, 260, pop(t, B.ifit + 2, 0.4), '#2AA594', 34);
      o += fade(seg(t, B.ifit + 2.4, B.ifit + 3) * (1 - seg(t, B.ability, B.ability + 0.5)), txt(960, 180, 'either way: I followed my process', 48, C.dark, { f: 'Playfair Display', it: true }));
      const sp = Math.abs(Math.cos(t * 5));
      o += fade(seg(t, B.notknow, B.notknow + 0.5), `<g transform="translate(960,560) scale(${f1(Math.max(0.05, sp))},1)">${coin(0, 0, 60)}</g>` + txt(960, 470, '?', 60, '#7F77DD'));
      o += you(t, { x: 960, y: 1020, scale: 0.95 });
      o += fade(seg(t, B.ability + 1, B.ability + 1.6), `<rect x="560" y="140" width="800" height="80" rx="40" fill="#7F77DD"/>${txt(960, 192, 'confidence in my process', 38, '#fff')}`);
      return o;
    },

    // A pep-talk bubble ("definitely going to win!") pops. In its place: the circle of what she controls.
    'w5-convince': (s, t) => {
      const B = s.b;
      let o = grad('w5n', '#FFF4DE', '#FDF8F5') + bg('url(#w5n)') + `<rect y="900" width="1920" height="180" fill="#E8D5C4"/>`;
      const popd = seg(t, B.dont + 0.6, B.dont + 1.2);
      o += fade(1 - popd, scaleAt(1180, 360, pop(t, B.def, 0.6), `<rect x="760" y="240" width="840" height="200" rx="100" fill="#F9D89A"/><path d="M820,420 L700,520 L900,430 Z" fill="#F9D89A"/>${txt(1180, 360, '“definitely going to win!” ✨', 46, '#7A4E0F', { f: 'Playfair Display', it: true })}`) + cross(1560, 260, pop(t, B.dont, 0.4), '#E2556F', 40));
      const c = seg(t, B.control, B.control + 0.8);
      if (c > 0) {
        o += scaleAt(1250, 520, ease(c), `<circle cx="1250" cy="520" r="280" fill="#E6F5F2" stroke="#2AA594" stroke-width="10"/>${txt(1250, 480, 'what I', 42, '#2AA594')}${txt(1250, 540, 'control', 56, '#2AA594')}`);
        [['the outcome', 1700, 250], ['the market', 1720, 780], ['the last trade', 780, 220]].forEach(([l, x, y], j) => { o += fade(seg(t, B.control + 1 + j * 0.5, B.control + 1.5 + j * 0.5), pill(x, y, l, '#B8B3C9', 1, 26)); });
      }
      o += you(t, { x: 460, y: 1000, scale: 1.25, frontArm: t > B.def && t < B.dont + 1 ? { a1: -40, a2: -60 } : undefined });
      return o;
    },

    // Four question cards. The last one, can I accept the loss, glows.
    'w5-control': (s, t) => {
      const B = s.b;
      let o = grad('w5o', '#E6F5F2', '#FDF8F5') + bg('url(#w5o)');
      [[B.q1, '🎯', 'Is my setup', 'present?'], [B.q2, '📋', 'Does this meet my', 'written criteria?'], [B.q3, '🛡️', 'Is my risk', 'appropriate?'], [B.q4, '🤲🏾', 'Can I accept this amount', 'if the trade loses?']].forEach(([at, e, l1, l2], j) => {
        const x = j % 2 ? 1380 : 540, y = j < 2 ? 330 : 700, hl = j === 3 && t > B.last;
        o += scaleAt(x, y, pop(t, at, 0.5), `<rect x="${x - 380}" y="${y - 140}" width="760" height="280" rx="24" fill="#fff" stroke="${hl ? '#E2B04A' : '#EADFD8'}" stroke-width="${hl ? 12 : 4}"/>${txt(x - 280, y + 24, e, 70, C.dark)}${txt(x - 190, y - 10, l1, 38, C.dark, { a: 'start', w: 700 })}${txt(x - 190, y + 46, l2, 38, C.dark, { a: 'start' })}`) + check(x + 320, y - 100, pop(t, at + 1, 0.4), '#2AA594', 26);
      });
      return o;
    },

    // She strains under a giant barbell labelled SIZE. A sticky-note pep talk doesn't help. Smaller plates do.
    'w5-size': (s, t) => {
      const B = s.b;
      let o = wall('w5p', '#EEEBFB', '#E0DAF2', 900, '#B8B3C9');
      o += pill(600, 150, 'psychology problem', '#B8B3C9', pop(t, B.risk, 0.4), 32) + fade(seg(t, B.risk + 1.5, B.risk + 2), `<path d="M860,150 L1010,150" stroke="#7F77DD" stroke-width="8"/><path d="M1000,130 L1030,150 L1000,170 Z" fill="#7F77DD"/>`) + pill(1260, 150, 'risk problem', '#7F77DD', pop(t, B.risk + 2, 0.4), 32);
      const sh = ease(seg(t, B.big, B.big + 1.2)), r = lerp(190, 80, sh), y = lerp(897, 825, sh);
      o += you(t, { x: 960, y: 1000, scale: 1.2, mood: sh < 0.5 ? 'sad' : undefined, frontArm: sh > 0.5 ? { a1: 60, a2: 0 } : { a1: 80, a2: 85 }, backArm: sh > 0.5 ? { a1: 120, a2: 180 } : { a1: 100, a2: 95 } });
      o += `<rect x="520" y="${f1(y - 12)}" width="880" height="24" rx="12" fill="#5A4C7A"/><circle cx="${f1(560)}" cy="${f1(y)}" r="${f1(r)}" fill="#2C1810"/><circle cx="1360" cy="${f1(y)}" r="${f1(r)}" fill="#2C1810"/>${txt(560, y + 14, 'SIZE', r * 0.32, '#fff')}${txt(1360, y + 14, 'SIZE', r * 0.32, '#fff')}`;
      o += fade(seg(t, B.terr, B.terr + 0.4) * (1 - sh), [0, 1, 2].map(j => `<path d="M${880 + j * 60},${470 + (j % 2) * 20} q10,30 0,50" stroke="#7FB5E6" stroke-width="8" fill="none" stroke-linecap="round"/>`).join(''));
      o += fade(1 - sh, sticky(1620, 420, 'you got this! ✨', pop(t, B.aff, 0.5), 6) + cross(1760, 360, pop(t, B.aff + 1.5, 0.4), '#E2556F', 30));
      o += fade(seg(t, B.big + 1.4, B.big + 1.9), txt(960, 260, 'right-sized', 48, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Calm with a small stop. Then the ballot box: the old loss tries to vote, and the slot is closed.
    'w5-accept': (s, t) => {
      const B = s.b;
      let o = grad('w5q', '#E6F5F2', '#FDF8F5') + bg('url(#w5q)') + `<rect y="900" width="1920" height="180" fill="#E8D5C4"/>`;
      if (t < B.vote - 0.2) {
        o += `<rect x="1000" y="200" width="760" height="460" rx="20" fill="#120D1C"/>${candles(1040, 240, 680, 360, [0.5, 0.56, 0.52, 0.46, 0.4, 0.36], 6)}<line x1="1040" x2="1720" y1="${f1(240 + 360 * 0.68)}" y2="${f1(240 + 360 * 0.68)}" stroke="#E2556F" stroke-width="4" stroke-dasharray="12 8"/>${txt(1660, 240 + 360 * 0.68 - 12, 'STOP', 24, '#E2556F')}`;
        o += pill(1380, 720, 'a loss I can live with', '#2AA594', pop(t, B.allow + 1, 0.5), 30);
        o += fade(seg(t, B.enjoy, B.enjoy + 0.4) * (1 - seg(t, B.accept, B.accept + 0.3)), thought(600, 260, 'enjoy losing? 😍', 1, { size: 40 }) + cross(820, 230, pop(t, B.enjoy + 1.2, 0.4), '#E2556F', 26));
        o += check(600, 300, pop(t, B.accept, 0.5), '#2AA594', 50) + fade(seg(t, B.accept, B.accept + 0.4), txt(600, 420, 'accept it', 44, '#2AA594', { f: 'Playfair Display', it: true }));
        o += you(t, { x: 600, y: 1000, scale: 1.2 });
      } else {
        o += `<rect x="780" y="480" width="440" height="380" rx="16" fill="#7F77DD"/><rect x="900" y="470" width="200" height="26" rx="8" fill="#2C1810"/>${txt(1000, 700, 'VOTE', 60, '#fff', { ls: 8 })}`;
        o += you(t, { x: 480, y: 1000, scale: 1.2, frontArm: { a1: 20, a2: -40 }, hold: `<rect x="-10" y="-50" width="60" height="80" rx="6" fill="#fff" stroke="#7F77DD" stroke-width="4"/>` });
        const gx = 1520 + Math.sin(t * 2) * 10;
        o += `<g opacity=".88"><path d="M${gx - 90},880 L${gx - 90},620 Q${gx},480 ${gx + 90},620 L${gx + 90},880 L${gx + 60},850 L${gx + 30},880 L${gx},850 L${gx - 30},880 L${gx - 60},850 Z" fill="#F4A3B3"/><circle cx="${gx - 28}" cy="640" r="11" fill="#5A2233"/><circle cx="${gx + 28}" cy="640" r="11" fill="#5A2233"/>${txt(gx, 740, 'last trade', 26, '#5A2233')}<rect x="${gx - 200}" y="690" width="90" height="60" rx="6" fill="#fff" stroke="#E2556F" stroke-width="4"/></g>`;
        o += scaleAt(1000, 470, pop(t, B.vote + 3.5, 0.5), `<g transform="rotate(-8 1000 470)"><rect x="770" y="420" width="460" height="90" rx="12" fill="#fff" stroke="#E2556F" stroke-width="8"/>${txt(1000, 480, 'NO VOTE', 52, '#E2556F', { ls: 6 })}</g>`);
        o += fade(seg(t, B.vote + 4.5, B.vote + 5), txt(960, 180, 'the previous trade doesn’t get a vote', 50, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // YOUR RULE: execute the plan, and three things this trade is NOT being asked to do.
    'w5-rule': (s, t) => {
      const B = s.b;
      let o = grad('w5r', '#EEEBFB', '#DDF1EE') + bg('url(#w5r)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 240, 'The previous trade doesn’t get a vote.', 70, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      [[B.r1, '▶️', 'execute my plan', 1], [B.r2, '🏅', 'prove I’m good', 0], [B.r3, '💸', 'make back the loss', 0], [B.r4, '⏭️', 'skip out of fear', 0]].forEach(([at, e, l, ok], j) => {
        const x = 330 + j * 420;
        o += fade(a, scaleAt(x, 600, pop(t, at, 0.4), `<circle cx="${x}" cy="580" r="120" fill="#fff" stroke="${ok ? '#2AA594' : '#B8B3C9'}" stroke-width="8"/>${txt(x, 612, e, 80, C.dark)}${txt(x, 760, l, 32, C.dark, { w: 700 })}`) + (ok ? check(x + 90, 490, pop(t, at + 1, 0.4), '#2AA594', 30) : cross(x + 90, 490, pop(t, at + 1, 0.4), '#E2556F', 30)));
      });
      if (fin > 0) o += fade(fin, txt(960, 540, 'Confidence isn’t knowing this trade will win.', 56, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 660, 'It’s knowing what I’ll do either way.', 62, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Her journal: "What was I actually afraid of?" with five boxes to tick.
    'w5-reflect': (s, t) => {
      const B = s.b;
      let o = wall('w5s', '#FFF4DE', '#F6E7DA', 900, '#C98B6B');
      o += `<rect x="220" y="140" width="1100" height="760" rx="20" fill="#7F77DD"/><rect x="250" y="170" width="1040" height="700" rx="10" fill="#FFF8E6"/>`;
      o += txt(770, 250, '✍🏽 Trader Reflection', 30, '#7F77DD', { ls: 4 });
      o += fade(seg(t, B.think, B.think + 0.5), txt(770, 320, 'the last setup I was scared to take…', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.afraid, B.afraid + 0.4), txt(770, 400, 'What was I actually afraid of?', 46, C.dark, { f: 'Playfair Display' }));
      ['💸 losing money', '✗ being wrong', '🔁 another loss after a streak', '🏦 losing an eval / funded account', '📉 giving back profits'].forEach((l, j) => {
        const at = B['a' + (j + 1)], y = 480 + j * 76;
        o += fade(seg(t, at - 0.2, at + 0.2), `<rect x="340" y="${y - 30}" width="40" height="40" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="4"/>` + txt(410, y + 2, l, 34, C.dark, { a: 'start', w: 700 }));
      });
      o += you(t, { x: 1600, y: 1000, scale: 1.2, flip: true, frontArm: { a1: 60, a2: -60 }, hold: `<rect x="0" y="-8" width="90" height="14" rx="6" fill="#E2B04A"/>` });
      return o;
    },

    // Magnifying glass on the setup vs. a rear-view mirror full of old trades. Then: fear, or size?
    'w5-ask': (s, t) => {
      const B = s.b;
      let o = grad('w5t', '#EEEBFB', '#FDF8F5') + bg('url(#w5t)');
      if (t < B.stop - 0.2) {
        o += scaleAt(560, 460, pop(t, B.ask, 0.5), `<rect x="300" y="300" width="520" height="320" rx="18" fill="#120D1C"/>${candles(330, 330, 460, 260, [0.3, 0.4, 0.5, 0.45, 0.55, 0.65, 0.6, 0.72], 8)}<circle cx="640" cy="420" r="120" fill="#fff" opacity=".18" stroke="#F9D89A" stroke-width="16"/><line x1="725" y1="505" x2="820" y2="600" stroke="#F9D89A" stroke-width="24" stroke-linecap="round"/>`) + fade(seg(t, B.ask, B.ask + 0.4), txt(560, 720, 'the setup', 42, '#2AA594', { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.wrong + 2.5, B.wrong + 3), `<rect x="1100" y="320" width="560" height="260" rx="130" fill="#2C1810"/><rect x="1130" y="350" width="500" height="200" rx="100" fill="#F4A3B3"/>${candles(1200, 370, 360, 160, [0.8, 0.7, 0.72, 0.5, 0.4, 0.3], 6)}<rect x="1360" y="580" width="40" height="80" fill="#2C1810"/>` + txt(1380, 720, 'what happened before', 42, '#E2556F', { f: 'Playfair Display', it: true }));
        o += fade(seg(t, B.wrong + 4, B.wrong + 4.4), txt(960, 480, 'or', 50, C.muted, { f: 'Playfair Display', it: true }));
      } else {
        o += `<rect x="300" y="160" width="1320" height="300" rx="20" fill="#120D1C"/>${candles(340, 190, 1100, 240, [0.6, 0.55, 0.58, 0.5, 0.52, 0.47, 0.5, 0.44], 8)}<line x1="340" x2="1580" y1="${f1(190 + 240 * 0.72)}" y2="${f1(190 + 240 * 0.72)}" stroke="#E2556F" stroke-width="5" stroke-dasharray="14 10"/>${txt(1520, 190 + 240 * 0.72 - 14, 'my normal stop', 24, '#E2556F')}`;
        o += scaleAt(620, 700, pop(t, B.fear, 0.5), `<rect x="340" y="580" width="560" height="240" rx="30" fill="#fff" stroke="#CFC8FA" stroke-width="8"/>${txt(620, 690, '😨', 90, C.dark)}${txt(620, 780, 'fear?', 44, '#7F77DD', { f: 'Playfair Display', it: true })}`);
        o += scaleAt(1300, 700, pop(t, B.fear + 1.2, 0.5), `<rect x="1020" y="580" width="560" height="240" rx="30" fill="#fff" stroke="#E2B04A" stroke-width="8"/>${txt(1300, 690, '🏋🏾‍♀️', 90, C.dark)}${txt(1300, 780, 'or risking too much?', 44, '#C98A1F', { f: 'Playfair Display', it: true })}`);
      }
      return o;
    },

    // A hundred little trades. Erasing the red ones doesn't work; zoomed out, one loss is just one dot.
    'w5-sample': (s, t) => {
      const B = s.b;
      let o = grad('w5u', '#FDF8F5', '#E6F5F2') + bg('url(#w5u)');
      const red = new Set([3, 7, 12, 18, 22, 29, 33, 41, 47, 52, 58, 61, 67, 74, 79, 83, 88, 95]);
      const shown = t < B.sample ? 1 : Math.floor(1 + 99 * seg(t, B.sample, B.sample + 3));
      const zoom = lerp(4, 1, ease(seg(t, B.sample, B.sample + 3)));
      o += `<g transform="translate(960,520) scale(${f1(zoom)}) translate(-960,-520)">`;
      for (let i = 0; i < shown; i++) { const k = i === 0 ? 3 : i, x = 420 + (i % 20) * 57, y = 400 + Math.floor(i / 20) * 60; o += `<circle cx="${i === 0 ? 960 : x}" cy="${i === 0 ? 520 : y}" r="20" fill="${i === 0 || red.has(k) ? '#E2556F' : '#2AA594'}"/>`; }
      o += `</g>`;
      const er = seg(t, B.elim + 0.5, B.cant);
      o += fade(seg(t, B.elim, B.elim + 0.4) * (1 - seg(t, B.cant + 1, B.cant + 1.4)), `<g transform="translate(${f1(1080 + Math.sin(er * 12) * 50)},${f1(560 + Math.cos(er * 12) * 20)}) rotate(-30)"><rect x="-40" y="-90" width="80" height="180" rx="14" fill="#F4829A"/><rect x="-40" y="30" width="80" height="60" rx="10" fill="#fff"/></g>`) + cross(1200, 380, pop(t, B.cant, 0.4), '#E2556F', 40);
      o += fade(seg(t, B.sample + 3.5, B.sample + 4), txt(960, 860, 'one loss = one outcome', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Last frame: just her and the setup in front of her, sun coming up.
    'w5-end': (s, t) => {
      const B = s.b;
      const k = seg(t, s.start, s.end);
      let o = grad('w5v', '#FDE8ED', '#FFE7C7') + bg('url(#w5v)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/>`;
      o += `<circle cx="1500" cy="${f1(820 - 240 * ease(k))}" r="180" fill="#F9D89A" opacity=".9"/>`;
      o += `<rect x="1160" y="420" width="560" height="320" rx="18" fill="#120D1C"/>${candles(1190, 450, 500, 260, [0.3, 0.4, 0.5, 0.45, 0.55, 0.65, 0.6], 7)}`;
      o += you(t, { x: 760, y: 900, scale: 1.2 });
      o += fade(seg(t, B.last + 0.3, B.last + 0.9), txt(960, 160, 'Evaluate the setup in front of you,', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.last + 3, B.last + 3.6), txt(960, 260, 'not the one that happened before it.', 60, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },


    /* ════ Psychology 6 · Fear of Giving Back Profit ════════════════ */

    // In a trade: the entry arrow, and price starts climbing her way.
    'w6-entry': (s, t) => {
      const B = s.b;
      let o = wall('w6a', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      const v = [0.4, 0.36, 0.32, 0.3, 0.33, 0.38, 0.45, 0.52, 0.6, 0.66, 0.72, 0.78];
      const n = Math.floor(6 + 6 * seg(t, B.move, B.move + 3));
      o += monitor(220, 160, 1060, 600, candles(260, 210, 980, 500, v, n, { slots: 14 })) + desk(120, 860, 1300);
      o += fade(seg(t, B.good, B.good + 0.4), `<path d="M${f1(260 + 4.5 * 980 / 14)},${f1(210 + 500 * 0.62 + 70)} l0,-50 m-18,18 l18,-18 l18,18" stroke="#F9D89A" stroke-width="8" fill="none" stroke-linecap="round"/>${txt(260 + 4.5 * 980 / 14, 210 + 500 * 0.62 + 110, 'entry', 28, '#F9D89A')}`);
      o += pill(750, 120, 'IN A TRADE', '#2AA594', pop(t, B.in, 0.5), 30);
      o += you(t, { x: 1600, y: 1020, scale: 1.25, flip: true });
      return o;
    },

    // A giant P&L counter ticks up. Her eyes are glued to it.
    'w6-ticker': (s, t) => {
      const B = s.b;
      let o = grad('w6b', '#2A2142', '#3B2F55') + bg('url(#w6b)');
      const val = t < B.up + 1.1 ? 100 : t < B.up + 2.2 ? 200 : 300;
      o += `<rect x="460" y="200" width="900" height="300" rx="30" fill="#120D1C" stroke="#2AA594" stroke-width="8"/>${txt(910, 270, 'P&amp;L', 30, '#9DB4D6', { ls: 6 })}${bigNum(910, 430, '+$' + val, 130, '#2AA594')}`;
      o += `<rect x="460" y="560" width="900" height="300" rx="20" fill="#120D1C"/>` + candles(500, 590, 820, 240, [0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76], Math.floor(3 + 5 * seg(t, B.up, B.up + 2.5)), { slots: 9 });
      o += you(t, { x: 1620, y: 1020, scale: 1.2, flip: true });
      o += fade(seg(t, B.watch, B.watch + 0.4), `<path d="M1580,560 L1380,360" stroke="#F9D89A" stroke-width="5" stroke-dasharray="10 10"/>` + txt(1640, 470, '👀', 70, C.dark));
      return o;
    },

    // The number slides 300 → 250 → 220, turning amber and dripping. She starts to sweat.
    'w6-drip': (s, t) => {
      const B = s.b;
      let o = grad('w6c', '#2A2142', '#3B2F55') + bg('url(#w6c)');
      const val = t < B.p250 ? 300 : t < B.p220 ? 250 : 220, col = val === 300 ? '#2AA594' : val === 250 ? '#E2B04A' : '#F08A4B';
      o += `<rect x="460" y="200" width="900" height="300" rx="30" fill="#120D1C" stroke="${col}" stroke-width="8"/>${txt(910, 270, 'P&amp;L', 30, '#9DB4D6', { ls: 6 })}${bigNum(910, 430, '+$' + val, 130, col)}`;
      if (t > B.p250) [0, 1, 2].forEach(j => { const ph = ((t - B.p250) * 0.8 + j * 0.33) % 1; o += `<ellipse cx="${760 + j * 160}" cy="${f1(500 + ph * 120)}" rx="12" ry="18" fill="${col}" opacity="${f1(1 - ph)}"/>`; });
      o += `<rect x="460" y="620" width="900" height="260" rx="20" fill="#120D1C"/>` + candles(500, 640, 820, 220, [0.2, 0.36, 0.52, 0.68, 0.76, 0.66, 0.6, 0.56], Math.floor(5 + 3 * seg(t, B.pull, B.p220 + 1)), { slots: 9 });
      o += you(t, { x: 1620, y: 1020, scale: 1.2, flip: true, mood: t > B.p250 ? 'sad' : undefined });
      if (t > B.p250) [0, 1].forEach(j => { o += `<path d="M${1560 + j * 120},${600 + j * 10} q-12,22 0,30 q12,-8 0,-30" fill="#7FB5E6"/>`; });
      return o;
    },

    // "Nope." She scoops up the money bag and slams CLOSE.
    'w6-grab': (s, t) => {
      const B = s.b;
      let o = wall('w6d', '#FDE8ED', '#F6E7DA', 900, '#E8D5C4');
      o += thought(1000, 220, 'Nope. Give me my money. 😂', pop(t, B.nope, 0.5), { size: 44 });
      const pr = pop(t, B.close, 0.4), down = t > B.close && t < B.close + 0.4 ? 10 : 0;
      o += scaleAt(1400, 560, pr, `<rect x="1220" y="${490 + down}" width="360" height="150" rx="26" fill="#E2556F"/>${txt(1400, 590 + down, 'CLOSE', 58, '#fff', { ls: 6 })}`);
      o += scaleAt(1400, 760, pop(t, B.close + 1, 0.5), `<g transform="rotate(-8 1400 760)"><rect x="1210" y="710" width="380" height="100" rx="12" fill="#fff" stroke="#2AA594" stroke-width="6"/>${txt(1400, 778, 'CLOSED +$220', 40, '#2AA594')}</g>`);
      const hug = t > B.nope + 1;
      o += you(t, { x: 640, y: 1000, scale: 1.25, frontArm: hug ? { a1: 50, a2: -30 } : undefined });
      if (hug) o += scaleAt(780, 760, pop(t, B.nope + 1, 0.5), `<path d="M700,680 Q690,640 730,630 L830,630 Q870,640 860,680 Q900,780 860,840 L700,840 Q660,780 700,680 Z" fill="#C98A1F"/><rect x="730" y="620" width="100" height="20" rx="8" fill="#8B6A55"/>${txt(780, 780, '$', 70, '#FFF1A8')}`);
      return o;
    },

    // The trade she closed keeps going: straight to her original target. Steam rises.
    'w6-runs': (s, t) => {
      const B = s.b;
      let o = wall('w6e', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      const v = [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.52, 0.5, 0.58, 0.66, 0.74, 0.82, 0.88, 0.92];
      const n = 8 + Math.floor(6 * seg(t, B.turn + 0.8, B.turn + 4));
      const Y = v => 190 + 500 * (1 - v);
      o += monitor(180, 140, 1060, 600, candles(220, 190, 980, 500, v, n, { slots: 15 }) + `<line x1="220" x2="1200" y1="${f1(Y(0.92))}" y2="${f1(Y(0.92))}" stroke="#2AA594" stroke-width="4" stroke-dasharray="14 10"/>${txt(1140, Y(0.92) - 14, 'TP', 26, '#2AA594')}`);
      o += `<circle cx="${f1(220 + 7.5 * 980 / 15)}" cy="${f1(Y(0.5))}" r="18" fill="#E2556F"/>${txt(220 + 7.5 * 980 / 15, Y(0.5) + 56, 'you left', 26, '#E2556F')}`;
      const mad = t > B.mad;
      o += you(t, { x: 1560, y: 1020, scale: 1.25, flip: true, mood: mad ? 'sad' : undefined, frontArm: mad ? { a1: 80, a2: 60 } : undefined, backArm: mad ? { a1: 100, a2: 120 } : undefined });
      if (mad) [0, 1, 2].forEach(j => { const ph = ((t - B.mad) * 0.9 + j * 0.33) % 1; o += `<circle cx="${f1(1560 + Math.sin(ph * 7 + j) * 30)}" cy="${f1(560 - ph * 200)}" r="${f1(20 + ph * 26)}" fill="#fff" opacity="${f1(0.8 * (1 - ph))}"/>`; });
      o += fade(seg(t, B.mad + 0.6, B.mad + 1), txt(1560, 280, '💢', 80, C.dark));
      return o;
    },

    // The question, split in two: did the chart change, or did the number make her uneasy?
    'w6-question': (s, t) => {
      const B = s.b;
      let o = grad('w6f', '#EEEBFB', '#FDF8F5') + bg('url(#w6f)');
      o += txt(960, 170, '?', 120, '#7F77DD', { op: f1(pop(t, B.q, 0.5)) });
      o += scaleAt(520, 480, pop(t, B.change, 0.5), `<rect x="240" y="300" width="560" height="340" rx="20" fill="#120D1C"/>${candles(270, 330, 500, 270, [0.3, 0.4, 0.5, 0.6, 0.55, 0.52, 0.6, 0.66], 8)}<circle cx="640" cy="420" r="90" fill="#fff" opacity=".15" stroke="#F9D89A" stroke-width="14"/><line x1="705" y1="485" x2="780" y2="560" stroke="#F9D89A" stroke-width="20" stroke-linecap="round"/>`) + fade(seg(t, B.change + 0.5, B.change + 1), txt(520, 710, 'did the trade change?', 40, '#2AA594', { f: 'Playfair Display', it: true }));
      const v = Math.round(300 - 80 * seg(t, B.change + 3, B.change + 6));
      o += scaleAt(1400, 480, pop(t, B.change + 2.5, 0.5), `<rect x="1120" y="340" width="560" height="260" rx="26" fill="#120D1C" stroke="#E2B04A" stroke-width="6"/>${bigNum(1400, 510, '+$' + v, 100, '#E2B04A')}`) + fade(seg(t, B.change + 3, B.change + 3.5), txt(1400, 710, 'or did the number shrink?', 40, '#C98A1F', { f: 'Playfair Display', it: true }));
      o += scaleAt(960, 900, pop(t, B.title + 2.5, 0.6), pill(960, 900, 'the fear of giving back profit', '#7F77DD', 1, 42));
      return o;
    },

    // An open toolbox. Out come partials, breakeven, and a base hit, each with a green check.
    'w6-tools': (s, t) => {
      const B = s.b;
      let o = grad('w6g', '#E6F5F2', '#FDF8F5') + bg('url(#w6g)') + `<rect y="900" width="1920" height="180" fill="#E8D5C4"/>`;
      o += `<rect x="700" y="700" width="520" height="220" rx="16" fill="#E2556F"/><rect x="680" y="680" width="560" height="50" rx="12" fill="#C94560"/><rect x="900" y="640" width="120" height="40" rx="14" fill="none" stroke="#8B2A40" stroke-width="12"/>`;
      o += pill(960, 170, 'taking profit early ≠ bad trading', '#2AA594', pop(t, B.early, 0.5), 34);
      const tool = (x, y, at, inner, lbl) => scaleAt(x, y, pop(t, at, 0.6), `<g transform="translate(0,${f1(-40 * Math.sin(t * 2 + x))})">${inner}${txt(x, y + 150, lbl, 34, C.dark)}</g>`) + check(x + 110, y - 90, pop(t, at + 0.8, 0.4), '#2AA594', 30);
      o += tool(520, 420, B.t1, `<circle cx="520" cy="420" r="110" fill="#F9D89A"/><path d="M520,420 L520,310 A110,110 0 0 1 630,420 Z" fill="#2AA594"/>`, 'partials');
      o += tool(960, 400, B.t2, `<path d="M960,290 L1060,330 L1050,440 Q1030,500 960,530 Q890,500 870,440 L860,330 Z" fill="#7F77DD"/>${txt(960, 440, 'BE', 60, '#fff')}`, 'breakeven');
      o += tool(1400, 420, B.t3, `<circle cx="1400" cy="420" r="90" fill="#fff" stroke="#EADFD8" stroke-width="4"/><path d="M1340,370 Q1370,420 1340,470 M1460,370 Q1430,420 1460,470" stroke="#E2556F" stroke-width="6" fill="none"/>`, 'base hits');
      o += fade(seg(t, B.legit, B.legit + 0.5), txt(960, 1000, 'all legit ways to manage a trade', 44, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Who's driving? First her plan holds the wheel. Then a sweaty, shrinking $ number grabs it.
    'w6-why': (s, t) => {
      const B = s.b;
      let o = grad('w6h', '#CDEBF7', '#FDF8F5') + bg('url(#w6h)') + `<rect y="760" width="1920" height="320" fill="#9AA3B8"/><rect y="890" width="1920" height="14" fill="#fff" opacity=".6"/>`;
      o += pill(960, 140, 'WHY are you exiting?', '#7F77DD', pop(t, B.why, 0.5), 38);
      const shake = t > B.watch ? Math.sin(t * 25) * 4 : 0;
      o += `<g transform="translate(${f1(shake)},0)"><path d="M480,760 L520,560 Q560,460 700,450 L1220,450 Q1360,460 1420,600 L1460,760 Z" fill="#F4829A"/><path d="M620,560 Q640,490 720,485 L930,485 L930,600 L620,600 Z" fill="#E6F5F2"/><path d="M990,485 L1200,485 Q1290,495 1320,600 L990,600 Z" fill="#E6F5F2"/><circle cx="660" cy="780" r="70" fill="#2C1810"/><circle cx="1260" cy="780" r="70" fill="#2C1810"/><circle cx="660" cy="780" r="28" fill="#B8B3C9"/><circle cx="1260" cy="780" r="28" fill="#B8B3C9"/></g>`;
      const swap = seg(t, B.watch + 1, B.watch + 2);
      o += fade(1 - swap, `<rect x="1080" y="${f1(500 + swap * 60)}" width="80" height="100" rx="8" fill="#7F77DD"/>${txt(1120, 565 + swap * 60, '📋', 40, '#fff')}`);
      o += fade(seg(t, B.plan + 1, B.plan + 1.5) * (1 - swap), pill(1120, 380, 'trade management ✓', '#2AA594', 1, 28));
      const nums = ['$400', '$350', '$300', '$275'], k = Math.min(3, Math.floor(Math.max(0, t - B.watch - 1) / 1.6));
      o += fade(swap, `<circle cx="1120" cy="545" r="58" fill="#E2B04A"/>${txt(1120, 560, nums[k], 30, '#fff')}<path d="M1085,520 q-6,14 0,20 q6,-6 0,-20" fill="#7FB5E6"/>`);
      o += fade(seg(t, B.decide, B.decide + 0.5), txt(960, 1010, 'what’s actually making the decision?', 44, '#fff', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Unrealized profit floats above the chart as see-through coins. She sticks a MINE flag in them.
    'w6-claim': (s, t) => {
      const B = s.b;
      let o = wall('w6i', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      o += `<rect x="760" y="380" width="960" height="420" rx="20" fill="#120D1C"/>` + candles(800, 420, 880, 340, [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.78], 7, { slots: 8 });
      const solid = seg(t, B.feel, B.feel + 1.5);
      [[1460, 330], [1540, 290], [1620, 330], [1500, 250], [1580, 230]].forEach(([x, y], j) => { o += fade(seg(t, s.start + 0.5 + j * 0.3, s.start + 0.9 + j * 0.3), `<g opacity="${f1(0.45 + 0.55 * solid)}">${coin(x, y + Math.sin(t * 2 + j) * 8, 40)}</g>${solid < 1 ? `<circle cx="${x}" cy="${f1(y + Math.sin(t * 2 + j) * 8)}" r="44" fill="none" stroke="#F9D89A" stroke-width="3" stroke-dasharray="6 6"/>` : ''}`); });
      o += fade(seg(t, B.psych, B.psych + 0.4) * (1 - solid), txt(1240, 340, 'unrealized', 34, '#C98A1F', { f: 'Playfair Display', it: true }));
      o += scaleAt(1540, 230, pop(t, B.claim + 1, 0.5), `<line x1="1540" y1="290" x2="1540" y2="150" stroke="#2C1810" stroke-width="8"/><path d="M1540,150 L1680,175 L1540,200 Z" fill="#F4829A"/>${txt(1600, 186, 'MINE', 22, '#fff')}`);
      o += you(t, { x: 440, y: 1000, scale: 1.25, frontArm: t > B.claim ? { a1: -30, a2: -50 } : undefined });
      o += fade(seg(t, B.claim + 2, B.claim + 2.5), txt(480, 300, 'already claimed it', 44, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Two views of the same pullback: on the chart a gentle dip; in her head a leaking piggy jar.
    'w6-leak': (s, t) => {
      const B = s.b;
      let o = grad('w6j', '#FDF8F5', '#F3E3D6') + bg('url(#w6j)');
      o += scaleAt(520, 480, pop(t, B.pull, 0.5), `<rect x="200" y="280" width="640" height="400" rx="20" fill="#120D1C"/>${candles(230, 310, 580, 330, [0.2, 0.32, 0.44, 0.56, 0.68, 0.62, 0.58, 0.66, 0.74], 9)}`) + fade(seg(t, B.pull + 0.5, B.pull + 1), txt(520, 750, 'the chart: a pullback', 40, '#2AA594', { f: 'Playfair Display', it: true }));
      const lk = seg(t, B.losing, s.end);
      o += scaleAt(1400, 480, pop(t, B.losing, 0.5), `<path d="M1240,300 L1560,300 L1580,640 Q1580,700 1520,700 L1280,700 Q1220,700 1220,640 Z" fill="#E6F5F2" stroke="#9DB4D6" stroke-width="8"/><rect x="1230" y="${f1(380 + 260 * lk)}" width="340" height="${f1(310 - 260 * lk)}" rx="10" fill="#2AA594" opacity=".7"/>${txt(1400, 360, 'MY $', 40, '#5A4C7A')}<path d="M1560,560 l20,10 l-10,14 l18,10" stroke="#5A4C7A" stroke-width="5" fill="none"/>`);
      if (t > B.losing + 0.5) [0, 1, 2].forEach(j => { const ph = ((t - B.losing) * 0.7 + j * 0.33) % 1; o += `<g opacity="${f1(1 - ph)}">${coin(1600 + ph * 60, 590 + ph * 260, 22)}</g>`; });
      o += fade(seg(t, B.losing + 0.6, B.losing + 1.1), txt(1400, 780, 'the feeling: losing MY money', 40, '#E2556F', { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.uncomf, B.uncomf + 0.5), pill(960, 940, 'that’s why it’s so uncomfortable', '#7F77DD', 1, 34));
      return o;
    },

    // Dayli: a scoreboard of base hits, each one a little green, and a happy face.
    'w6-basehits': (s, t) => {
      const B = s.b;
      let o = grad('w6k', '#F3E3D6', '#FBF4EF') + bg('url(#w6k)');
      o += host(t, { x: 80, y: 340, w: 500, pose: t > B.days ? 'idle' : 'think', talk: true, enterAt: s.start + 0.1 });
      o += `<rect x="760" y="200" width="1000" height="440" rx="24" fill="#1F3B2E"/><rect x="780" y="220" width="960" height="400" rx="16" fill="none" stroke="#F9D89A" stroke-width="4"/>${txt(1260, 290, 'TODAY', 34, '#F9D89A', { ls: 8 })}`;
      [0, 1, 2, 3].forEach(j => { const x = 880 + j * 230, at = B.days + j * 1.2; o += fade(seg(t, at, at + 0.4), `<rect x="${x - 90}" y="340" width="180" height="230" rx="14" fill="#2A4F3E"/>${txt(x, 430, '1B', 54, '#fff')}${bigNum(x, 520, '+$', 44, '#7FE0C8')}`); });
      o += scaleAt(1260, 760, pop(t, B.days + 6, 0.5), pill(1260, 760, 'happy with that 😊', '#2AA594', 1, 36));
      return o;
    },

    // The FULL TP trophy gets crossed out. What matters: a reason tag on the exit door.
    'w6-know': (s, t) => {
      const B = s.b;
      let o = wall('w6l', '#EEEBFB', '#E0DAF2', 900, '#B8B3C9');
      o += check(400, 200, pop(t, B.nothing, 0.5), '#2AA594', 40) + fade(seg(t, B.nothing, B.nothing + 0.4), txt(460, 214, 'nothing wrong with base hits', 40, '#2AA594', { a: 'start', f: 'Playfair Display', it: true }));
      o += scaleAt(560, 560, pop(t, B.full, 0.5), `<path d="M460,420 L660,420 L640,560 Q560,620 480,560 Z" fill="#F9D89A" stroke="#C98A1F" stroke-width="6"/><rect x="530" y="590" width="60" height="70" fill="#C98A1F"/><rect x="480" y="660" width="160" height="30" rx="8" fill="#8B6A55"/>${txt(560, 520, 'FULL TP', 30, '#7A4E0F')}${txt(560, 760, 'every. single. time.', 30, C.muted, { f: 'Playfair Display', it: true })}`) + cross(680, 420, pop(t, B.full + 2.5, 0.4), '#E2556F', 40);
      o += `<rect x="1260" y="320" width="300" height="560" rx="10" fill="#8B6A55"/><rect x="1280" y="340" width="260" height="540" fill="#C98B6B"/><circle cx="1500" cy="620" r="14" fill="#F9D89A"/>${txt(1410, 300, 'EXIT', 36, '#E2556F', { ls: 6 })}`;
      o += scaleAt(1410, 470, pop(t, B.why, 0.5), `<rect x="1290" y="430" width="240" height="90" rx="12" fill="#fff" stroke="#7F77DD" stroke-width="6"/>${txt(1410, 488, 'WHY?', 44, '#7F77DD')}`);
      const w = seg(t, B.why + 0.5, B.why + 2.5);
      o += you(t, { x: lerp(960, 1160, w), y: 1000, scale: 1.2, walking: w > 0 && w < 1, frontArm: { a1: 30, a2: -20 }, hold: `<rect x="0" y="-30" width="90" height="60" rx="8" fill="#FFF8E6" stroke="#2AA594" stroke-width="4"/><path d="M20,0 l15,14 l30,-28" stroke="#2AA594" stroke-width="7" fill="none"/>` });
      return o;
    },

    // She out, price to target, "should've held it". Then a giant rear-view mirror: hindsight.
    'w6-hindsight': (s, t) => {
      const B = s.b;
      let o = wall('w6m', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      const v = [0.3, 0.38, 0.46, 0.55, 0.62, 0.56, 0.52, 0.58, 0.66, 0.74, 0.82, 0.9];
      const ob = seg(t, B.obvious, B.obvious + 0.6);
      o += `<rect x="200" y="200" width="900" height="520" rx="20" fill="#120D1C"/>` + candles(240, 240, 820, 440, v, 12, { slots: 13 }) + `<line x1="240" x2="1060" y1="${f1(240 + 440 * 0.1)}" y2="${f1(240 + 440 * 0.1)}" stroke="#2AA594" stroke-width="4" stroke-dasharray="14 10"/><circle cx="${f1(240 + 6.5 * 820 / 13)}" cy="${f1(240 + 440 * 0.48)}" r="16" fill="#E2556F"/>`;
      if (ob > 0) o += fade(ob, `<path d="M${f1(240 + 6.5 * 820 / 13)},${f1(240 + 440 * 0.48)} Q800,500 1040,${f1(240 + 440 * 0.1)}" stroke="#F9D89A" stroke-width="10" fill="none" stroke-dasharray="20 12"/><rect x="200" y="200" width="900" height="520" rx="20" fill="#F9D89A" opacity=".08"/>`) + fade(ob, pill(650, 790, 'hindsight: everything looks obvious', '#C98A1F', 1, 32));
      o += you(t, { x: 1500, y: 1020, scale: 1.25, flip: true, mood: t > B.held + 3 ? 'sad' : undefined });
      o += thought(1440, 300, 'Damn, I should’ve held it 😩', pop(t, B.held + 4, 0.5) * (1 - seg(t, B.obvious + 1.5, B.obvious + 2)), { size: 40 });
      return o;
    },

    // A balance: "what price did after" weighs nothing; "did I follow my plan?" weighs it all.
    'w6-judge': (s, t) => {
      const B = s.b;
      let o = grad('w6n', '#EEEBFB', '#FDF8F5') + bg('url(#w6n)');
      const tilt = ease(seg(t, B.follow, B.follow + 1.2)) * 14;
      o += `<rect x="940" y="300" width="40" height="560" fill="#8B6A55"/><rect x="820" y="850" width="280" height="40" rx="10" fill="#8B6A55"/><circle cx="960" cy="300" r="26" fill="#C98A1F"/>`;
      const ang = tilt * Math.PI / 180, L = 480, lx = 960 - L * Math.cos(ang), ly = 300 - L * Math.sin(ang), rx = 960 + L * Math.cos(ang), ry = 300 + L * Math.sin(ang);
      o += `<line x1="${f1(lx)}" y1="${f1(ly)}" x2="${f1(rx)}" y2="${f1(ry)}" stroke="#C98A1F" stroke-width="16" stroke-linecap="round"/>`;
      const pan = (x, y, inner) => `<path d="M${f1(x - 140)},${f1(y + 200)} L${f1(x)},${f1(y)} L${f1(x + 140)},${f1(y + 200)}" fill="none" stroke="#C98A1F" stroke-width="4"/><path d="M${f1(x - 170)},${f1(y + 200)} Q${f1(x)},${f1(y + 280)} ${f1(x + 170)},${f1(y + 200)} Z" fill="#E2B04A"/>${inner}`;
      o += pan(lx, ly, fade(seg(t, B.after, B.after + 0.5), `<rect x="${f1(lx - 100)}" y="${f1(ly + 80)}" width="200" height="120" rx="12" fill="#120D1C"/>${candles(lx - 90, ly + 90, 180, 100, [0.2, 0.4, 0.6, 0.8], 4)}`) + fade(seg(t, B.after + 1, B.after + 1.5), txt(lx, ly + 340, 'what price did after', 34, C.muted, { f: 'Playfair Display', it: true })));
      o += pan(rx, ry, fade(seg(t, B.follow, B.follow + 0.5), `<rect x="${f1(rx - 70)}" y="${f1(ry + 60)}" width="140" height="150" rx="10" fill="#7F77DD"/>${txt(rx, ry + 160, '📋', 60, '#fff')}`) + fade(seg(t, B.follow + 0.5, B.follow + 1), txt(rx, ry + 340, 'did I follow my plan?', 38, '#2AA594', { f: 'Playfair Display', it: true })));
      o += cross(lx + 120, ly + 60, pop(t, B.after + 3, 0.4), '#E2556F', 28) + check(rx + 120, ry + 40, pop(t, B.follow + 1.5, 0.4), '#2AA594', 32);
      return o;
    },

    // Two cards. Planned exit + price ran: still right. Panic close + reversal: still not a system.
    'w6-vice': (s, t) => {
      const B = s.b;
      let o = grad('w6o', '#FDF8F5', '#E6F5F2') + bg('url(#w6o)');
      const card = (x, at, title, v, n, good, verdict, vAt) => scaleAt(x, 480, pop(t, at, 0.5), `<rect x="${x - 380}" y="200" width="760" height="600" rx="24" fill="#fff" stroke="#EADFD8" stroke-width="4"/>${txt(x, 270, title, 38, C.dark)}<rect x="${x - 320}" y="310" width="640" height="300" rx="14" fill="#120D1C"/>${candles(x - 300, 330, 600, 260, v, n, { slots: v.length })}<circle cx="${f1(x - 300 + 4.5 * 600 / v.length)}" cy="${f1(330 + 260 * (1 - v[4]))}" r="14" fill="#F9D89A"/>`) + (t > vAt ? (good ? check(x, 690, pop(t, vAt, 0.4), '#2AA594', 40) : cross(x, 690, pop(t, vAt, 0.4), '#E2556F', 40)) + fade(seg(t, vAt, vAt + 0.4), txt(x, 770, verdict, 32, good ? '#2AA594' : '#E2556F', { w: 700 })) : '');
      const up = [0.3, 0.4, 0.5, 0.58, 0.62, 0.7, 0.78, 0.86, 0.92], dn = [0.3, 0.4, 0.5, 0.58, 0.62, 0.55, 0.45, 0.35, 0.25];
      o += card(520, B.ran, 'planned base hit ⚾', up, 5 + Math.floor(4 * seg(t, B.ran + 1, B.ran + 3)), true, 'exit still right', B.notwrong + 0.5);
      o += card(1400, B.panic, 'panic close 😱', dn, 5 + Math.floor(4 * seg(t, B.panic + 2, B.panic + 4)), false, 'still not a system', B.panic + 5);
      o += fade(seg(t, B.vice, B.vice + 0.4), txt(960, 500, '⇄', 80, '#7F77DD'));
      o += fade(seg(t, B.panic + 6, B.panic + 6.5), txt(960, 900, 'outcome ≠ execution', 54, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    // $0 on the screen: calm. +$500 on the screen: not calm. So the plan gets written first.
    'w6-before': (s, t) => {
      const B = s.b;
      let o = wall('w6p', '#FFF4DE', '#F6E7DA', 900, '#E8D5C4');
      const nb = seg(t, B.decide, B.decide + 0.8);
      o += fade(1 - nb, `<rect x="240" y="200" width="560" height="300" rx="24" fill="#120D1C"/>${bigNum(520, 390, '$0', 120, '#B8B3C9')}` + you(t, { x: 520, y: 980, scale: 1.0 }) + fade(seg(t, B.feels, B.feels + 0.4), `<rect x="1120" y="200" width="560" height="300" rx="24" fill="#120D1C" stroke="#2AA594" stroke-width="6"/>${bigNum(1400, 390, '+$500', 110, '#2AA594')}` + you(t, { x: 1400, y: 980, scale: 1.0, mood: 'sad' }) + `<path d="M1450,600 q-12,22 0,30 q12,-8 0,-30" fill="#7FB5E6"/><path d="M1350,610 q-12,22 0,30 q12,-8 0,-30" fill="#7FB5E6"/>`));
      o += fade(seg(t, B.before, B.before + 0.5) * (1 - nb), txt(960, 140, 'before you’re staring at green money', 44, C.dark, { f: 'Playfair Display', it: true }));
      if (nb > 0) o += scaleAt(960, 520, ease(nb), `<rect x="560" y="200" width="800" height="640" rx="20" fill="#7F77DD"/><rect x="590" y="230" width="740" height="580" rx="10" fill="#FFF8E6"/>${txt(960, 340, 'MY MANAGEMENT PLAN', 40, '#7F77DD', { ls: 4 })}${txt(960, 420, 'written before the trade', 32, C.muted, { f: 'Playfair Display', it: true, w: 700 })}${[0, 1, 2, 3].map(j => `<rect x="660" y="${500 + j * 70}" width="${520 + (j % 2) * 60}" height="18" rx="9" fill="#CECBF6"/>`).join('')}`);
      return o;
    },

    // The plan, row by row: partials, breakeven, base hit, weakening, full TP.
    'w6-plan': (s, t) => {
      const B = s.b;
      let o = grad('w6q', '#EEEBFB', '#FDF8F5') + bg('url(#w6q)');
      o += `<rect x="300" y="110" width="1320" height="880" rx="24" fill="#fff" stroke="#7F77DD" stroke-width="8"/>${txt(960, 190, 'MY MANAGEMENT PLAN', 36, '#7F77DD', { ls: 6 })}`;
      [['🍰', 'When do I take partials?'], ['🛡️', 'When do I move to breakeven?'], ['⚾', 'What condition lets me secure a base hit?'], ['📉', 'What tells me the trade is weakening?'], ['🏁', 'When will I hold for full TP?']].forEach(([e, l], j) => {
        const at = B['q' + (j + 1)], y = 300 + j * 145;
        o += fade(seg(t, at - 0.2, at + 0.3), txt(420, y + 20, e, 56, C.dark) + txt(500, y + 16, l, 42, C.dark, { a: 'start', w: 700 }) + `<line x1="500" x2="1500" y1="${y + 60}" y2="${y + 60}" stroke="#EADFD8" stroke-width="3"/>`) + check(1530, y, pop(t, at + 1, 0.4), '#2AA594', 26);
      });
      return o;
    },

    // Two signals. A structure break on the chart: a reason. A jittery, sweating P&L: not one.
    'w6-reason': (s, t) => {
      const B = s.b;
      let o = grad('w6r', '#FDF8F5', '#F3E3D6') + bg('url(#w6r)');
      o += fade(seg(t, B.change, B.change + 0.5) * (1 - seg(t, B.price, B.price + 0.3)), txt(960, 500, 'new information is allowed 📰', 54, C.dark, { f: 'Playfair Display', it: true }));
      o += scaleAt(520, 470, pop(t, B.price, 0.5), `<rect x="220" y="240" width="600" height="420" rx="20" fill="#120D1C"/>${candles(250, 270, 540, 360, [0.3, 0.45, 0.6, 0.75, 0.7, 0.66, 0.5, 0.36], 8)}<line x1="250" x2="790" y1="${f1(270 + 360 * 0.4)}" y2="${f1(270 + 360 * 0.4)}" stroke="#F9D89A" stroke-width="4" stroke-dasharray="12 8"/>${txt(720, 270 + 360 * 0.4 - 12, 'structure', 22, '#F9D89A')}`) + fade(seg(t, B.price + 0.5, B.price + 1), txt(520, 740, '“price gave me a reason”', 40, '#2AA594', { f: 'Playfair Display', it: true }));
      const j = t > B.pnl ? Math.sin(t * 28) * 6 : 0;
      o += scaleAt(1400, 470, pop(t, B.pnl, 0.5), `<g transform="translate(${f1(j)},0)"><rect x="1120" y="320" width="560" height="260" rx="26" fill="#120D1C" stroke="#E2B04A" stroke-width="6"/>${bigNum(1400, 490, '+$' + (280 + Math.round(Math.sin(t * 9) * 40)), 100, '#E2B04A')}</g><path d="M1680,330 q-12,22 0,30 q12,-8 0,-30" fill="#7FB5E6"/>`) + fade(seg(t, B.pnl + 0.5, B.pnl + 1), txt(1400, 740, '“the P&amp;L made me nervous”', 40, '#E2556F', { f: 'Playfair Display', it: true }));
      o += check(800, 260, pop(t, B.pnl + 1.5, 0.4), '#2AA594', 36) + cross(1660, 300, pop(t, B.pnl + 2, 0.4), '#E2556F', 36);
      return o;
    },

    // She covers the P&L box with a sticky note. The chart takes over the screen.
    'w6-cover': (s, t) => {
      const B = s.b;
      let o = wall('w6s', '#2A2142', '#3B2F55', 900, '#1E1730');
      o += monitor(220, 140, 1100, 620, candles(260, 260, 1020, 460, [0.2, 0.32, 0.44, 0.4, 0.5, 0.62, 0.58, 0.66, 0.74, 0.7], 10)) + desk(120, 880, 1360);
      o += `<rect x="1030" y="170" width="260" height="90" rx="12" fill="#2A2142"/>${bigNum(1160, 232, '+$' + (t < B.valid ? 347 + Math.round(Math.sin(t * 7) * 25) : 347), 44, '#E2B04A')}`;
      o += sticky(1160, 215, 'watch the chart 👀', pop(t, B.stop + 3, 0.5), -4);
      o += fade(seg(t, B.chart, B.chart + 0.4), `<line x1="260" x2="1280" y1="${f1(260 + 460 * 0.58)}" y2="${f1(260 + 460 * 0.58)}" stroke="#2AA594" stroke-width="4" stroke-dasharray="12 8"/>`) + fade(seg(t, B.valid + 1, B.valid + 1.5), pill(770, 820, 'trade still valid ✓', '#2AA594', 1, 32));
      o += you(t, { x: 1600, y: 1020, scale: 1.25, flip: true, frontArm: t > B.stop + 2 && t < B.stop + 4 ? { a1: -20, a2: -40 } : undefined });
      return o;
    },

    // YOUR RULE: base hit, partials, breakeven, hold. Each one because the plan says so.
    'w6-rule': (s, t) => {
      const B = s.b;
      let o = grad('w6t', '#EEEBFB', '#DDF1EE') + bg('url(#w6t)');
      o += txt(960, 120, '🧠 YOUR RULE', 30, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 220, pop(t, s.start + 0.4, 0.8), txt(960, 240, 'I manage the trade by my plan, not my P&amp;L.', 64, C.dark, { f: 'Playfair Display' }));
      const fin = seg(t, B.line - 0.3, B.line + 0.3), a = 1 - fin;
      [[B.r1, '⚾', 'base hit'], [B.r2, '🍰', 'partials'], [B.r3, '🛡️', 'breakeven'], [B.r4, '⏳', 'hold']].forEach(([at, e, l], j) => {
        const x = 330 + j * 420;
        o += fade(a, scaleAt(x, 580, pop(t, at, 0.4), `<circle cx="${x}" cy="580" r="120" fill="#fff" stroke="#2AA594" stroke-width="8"/>${txt(x, 612, e, 80, C.dark)}${txt(x, 760, l, 34, C.dark)}${txt(x, 806, 'when the plan says', 24, C.muted, { w: 700 })}`) + check(x + 90, 490, pop(t, at + 1, 0.4), '#2AA594', 28));
      });
      if (fin > 0) o += fade(fin, txt(960, 540, 'Profit protection should be a strategy,', 58, C.dark, { f: 'Playfair Display', it: true }) + txt(960, 660, 'not a panic response.', 66, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },

    // Journal: "Why did I exit when I exited?" Four honest options.
    'w6-reflect': (s, t) => {
      const B = s.b;
      let o = wall('w6u', '#FFF4DE', '#F6E7DA', 900, '#C98B6B');
      o += `<rect x="220" y="140" width="1100" height="760" rx="20" fill="#7F77DD"/><rect x="250" y="170" width="1040" height="700" rx="10" fill="#FFF8E6"/>`;
      o += txt(770, 250, '✍🏽 Trader Reflection', 30, '#7F77DD', { ls: 4 });
      o += fade(seg(t, B.last, B.last + 0.5), txt(770, 320, 'the last trade I closed early…', 36, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.tp, B.tp + 0.4) * (1 - seg(t, B.why - 0.4, B.why)), txt(770, 420, '“did it hit TP?”', 44, '#B8B3C9', { f: 'Playfair Display', it: true }) + cross(1010, 400, pop(t, B.tp + 1.5, 0.4), '#E2556F', 26));
      o += fade(seg(t, B.why, B.why + 0.4), txt(770, 420, 'Why did I exit when I exited?', 46, C.dark, { f: 'Playfair Display' }));
      ['🏗️ a structural reason', '❌ my idea was invalidated', '📋 securing profit was the plan', '😱 “give me my money!”'].forEach((l, j) => {
        const at = B['a' + (j + 1)], y = 520 + j * 80;
        o += fade(seg(t, at - 0.2, at + 0.2), `<rect x="340" y="${y - 30}" width="40" height="40" rx="8" fill="#fff" stroke="#7F77DD" stroke-width="4"/>` + txt(410, y + 2, l, 36, C.dark, { a: 'start', w: 700 }));
      });
      o += you(t, { x: 1600, y: 1000, scale: 1.2, flip: true, frontArm: { a1: 60, a2: -60 }, hold: `<rect x="0" y="-8" width="90" height="14" rx="6" fill="#E2B04A"/>` });
      return o;
    },

    // Plan, or a pulse line of feelings? She looks from one to the other.
    'w6-ask': (s, t) => {
      const B = s.b;
      let o = grad('w6v', '#EEEBFB', '#FDF8F5') + bg('url(#w6v)') + `<rect y="900" width="1920" height="180" fill="#E8D5C4"/>`;
      o += scaleAt(480, 480, pop(t, B.ask, 0.5), `<rect x="320" y="260" width="320" height="420" rx="16" fill="#C98B6B"/><rect x="345" y="300" width="270" height="360" rx="8" fill="#fff"/><rect x="420" y="240" width="120" height="44" rx="12" fill="#8B6A55"/>${[0, 1, 2, 3].map(j => `<rect x="375" y="${350 + j * 70}" width="210" height="16" rx="8" fill="#CECBF6"/>`).join('')}`) + fade(seg(t, B.plan + 0.5, B.plan + 1), txt(480, 760, 'a management plan', 40, '#7F77DD', { f: 'Playfair Display', it: true }));
      let d = 'M1180,480'; for (let i = 0; i < 18; i++) { const x = 1180 + i * 30, y = 480 + (i % 4 === 2 ? -120 * Math.sin(t * 3 + i) : i % 4 === 3 ? 90 : 0); d += ` L${x},${f1(y)}`; }
      o += scaleAt(1450, 480, pop(t, B.plan + 4, 0.5), `<rect x="1140" y="300" width="620" height="360" rx="20" fill="#120D1C"/><path d="${d}" stroke="#F4829A" stroke-width="6" fill="none"/>${txt(1450, 360, '+$ 💗', 40, '#F4829A')}`) + fade(seg(t, B.plan + 4.5, B.plan + 5), txt(1450, 760, 'or how I feel in profit?', 40, '#E2556F', { f: 'Playfair Display', it: true }));
      o += you(t, { x: 960, y: 1000, scale: 1.15, flip: t > B.plan + 4 });
      return o;
    },

    // She doesn't have to swing for the fences every time; she just has to know why she's leaving.
    'w6-close': (s, t) => {
      const B = s.b;
      let o = grad('w6w', '#CDEBF7', '#FDF8F5') + bg('url(#w6w)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/>`;
      o += fade(seg(t, B.hold, B.hold + 0.4), txt(960, 170, 'hold every trade to full TP', 44, '#B8B3C9', { f: 'Playfair Display', it: true }) + `<line x1="660" x2="1260" y1="158" y2="158" stroke="#E2556F" stroke-width="6" opacity="${f1(seg(t, B.hold + 2.5, B.hold + 3))}"/>`);
      o += fade(seg(t, B.why, B.why + 0.5), txt(960, 270, 'understand why you’re exiting', 54, '#2AA594', { f: 'Playfair Display', it: true }));
      o += you(t, { x: 760, y: 900, scale: 1.2 });
      o += scaleAt(1200, 620, pop(t, B.notprob, 0.6), coin(1200, 620, 90)) + check(1300, 540, pop(t, B.notprob + 0.8, 0.4), '#2AA594', 36) + fade(seg(t, B.notprob + 0.6, B.notprob + 1), txt(1220, 770, 'taking profit isn’t the problem', 34, C.dark, { w: 700 }));
      return o;
    },

    // Last frame: sunrise, her plan in hand.
    'w6-end': (s, t) => {
      const B = s.b;
      const k = seg(t, s.start, s.end);
      let o = grad('w6x', '#FDE8ED', '#FFE7C7') + bg('url(#w6x)') + `<rect y="820" width="1920" height="260" fill="#B9DDB0"/>`;
      o += `<circle cx="960" cy="${f1(820 - 240 * ease(k))}" r="200" fill="#F9D89A" opacity=".9"/>`;
      o += you(t, { x: 960, y: 900, scale: 1.2, frontArm: { a1: 40, a2: -30 }, hold: `<rect x="-10" y="-50" width="70" height="90" rx="6" fill="#7F77DD"/>` });
      o += fade(seg(t, B.last + 0.3, B.last + 0.9), txt(960, 160, 'Breaking your plan out of fear', 56, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, B.last + 3, B.last + 3.6), txt(960, 260, 'is what we’re working on.', 64, '#2AA594', { f: 'Playfair Display', it: true }));
      return o;
    },


    /*@@W@@*/
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
