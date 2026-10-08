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

    /*@@W@@*/
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
