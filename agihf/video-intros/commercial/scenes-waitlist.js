/**
 * scenes-waitlist.js: "Save Your Seat", the 45s vertical WAITLIST teaser
 * for A Girl & Her Futures Academy™ (1080x1920, 30 fps, silent).
 *
 * window.WL.draw(t) returns the SVG markup for the frame at time t. Everything
 * is a pure function of t (no state between frames), so renders are
 * frame-accurate. The hero figure system (blinking, breathing, hair sway,
 * expressive faces) is adapted from scenes-her-own.js and extended with the
 * six-woman waitlist cast: Amara, Sofia, Mei, Priya, Layla and Emma.
 *
 * TikTok safe zone: text and faces stay inside x 0..940, y 150..1520.
 * Real Academy screens (./assets/0N-*.jpg, 1440x900) are the only platform
 * screens shown. The waitlist phone UI is drawn in brand style.
 */
(function () {
  const A = window.ART;
  const { ease, back, clamp, lerp } = A;
  const f1 = v => (+v).toFixed(1);
  const f3 = v => (+v).toFixed(3);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const io = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const CX = 540; // true frame centre: every centred title, panel and group sits on this axis
  const PF = 'Playfair Display', DM = 'DM Sans';

  // Brand
  const P = {
    pink: '#F4829A', pinkL: '#F9B8C6', pinkP: '#FDE8ED',
    teal: '#7ECEC4', tealL: '#B2E4DF', tealP: '#E8F8F6',
    peach: '#F5A857', peachL: '#FAD09A', peachP: '#FEF3E4',
    purple: '#7F77DD', purpleL: '#CECBF6', purpleP: '#EEEDFE',
    cream: '#FFFBF9', dark: '#2C1810', text: '#3D2B20', muted: '#7A5C50', gold: '#E9A93B',
  };

  let UID = 0;
  const uid = p => p + (UID++);

  /* ---------------- text ---------------- */
  const cv = document.createElement('canvas').getContext('2d');
  const mcache = {};
  function measure(s, size, font = DM, weight = 700, italic = false) {
    const key = [s, size, font, weight, italic].join('|');
    if (mcache[key]) return mcache[key];
    cv.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${font}"`;
    const w = cv.measureText(s).width;
    if (document.fonts && document.fonts.status === 'loaded') mcache[key] = w;
    return w;
  }
  const plain = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<');
  const fitSize = (s, size, maxW, font, weight, italic) => Math.min(size, size * maxW / Math.max(1, measure(plain(s), size, font, weight, italic)));
  const txt = (x, y, s, size, col, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${f1(size)}" font-weight="${o.w || 700}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || DM}"${o.it ? ' font-style="italic"' : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${s}</text>`;

  // Headline line that rises and fades in at `at` (and out at o.out), auto-shrinks to fit.
  function head(t, at, x, y, s, size, col, o = {}) {
    const k = ease((t - at) / 0.7);
    if (k <= 0) return '';
    const out = o.out != null ? 1 - ease((t - o.out) / 0.4) : 1;
    if (out <= 0) return '';
    const f = o.f || PF, w = o.w || 700;
    const sz = fitSize(s, size, o.max || 840, f, w, o.it);
    const glow = o.glow ? txt(x, y, s.replace(/fill="[^"]*"/g, ''), sz, o.glow, { f, w, it: o.it, op: 0.55 }).replace('<text', `<text filter="url(#fTxt)"`) : '';
    return `<g transform="translate(0,${f1((1 - k) * 30)})" opacity="${f3(k * out)}">${glow}${txt(x, y, s, sz, col, { f, w, it: o.it, ls: o.ls })}</g>`;
  }

  const scaleAt = (x, y, k, inner, op) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k.toFixed(4)}) translate(${f1(-x)},${f1(-y)})"${op != null ? ` opacity="${f3(clamp(op))}"` : ''}>${inner}</g>`;
  const fade = (k, inner) => k <= 0 ? '' : k >= 1 ? inner : `<g opacity="${f3(k)}">${inner}</g>`;
  const cam = (cx, cy, z, inner, dx = 0, dy = 0) => `<g transform="translate(${f1(cx + dx)},${f1(cy + dy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)},${f1(-cy)})">${inner}</g>`;
  const blurG = (sd, inner) => {
    if (sd < 0.4) return inner;
    const id = uid('bl');
    return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-400" y="-400" width="1880" height="2720"><feGaussianBlur stdDeviation="${f1(sd)}"/></filter><g filter="url(#${id})">${inner}</g>`;
  };
  const star = (x, y, r, col, op = 1, rot = 0) => `<path transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})" d="M0,${-r} Q${r * 0.16},${-r * 0.16} ${r},0 Q${r * 0.16},${r * 0.16} 0,${r} Q${-r * 0.16},${r * 0.16} ${-r},0 Q${-r * 0.16},${-r * 0.16} 0,${-r} Z" fill="${col}" opacity="${op}"/>`;
  const heart = (x, y, s, col, op = 1) => `<path transform="translate(${f1(x)},${f1(y)}) scale(${s.toFixed(3)})" d="M0,10 C-26,-8 -20,-30 -6,-28 C0,-27 0,-22 0,-20 C0,-22 0,-27 6,-28 C20,-30 26,-8 0,10 Z" fill="${col}" opacity="${op}"/>`;

  function blink(t, seed) {
    const period = 3.1 + (seed % 4) * 0.55;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  function reach(sx, sy, hx, hy, l1, l2, bend) {
    let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
    const maxD = l1 + l2 - 0.5;
    if (d > maxD) { hx = sx + dx / d * maxD; hy = sy + dy / d * maxD; d = maxD; }
    const a = Math.atan2(hy - sy, hx - sx);
    const An = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, 1))));
    return { ex: sx + Math.cos(a + bend * An) * l1, ey: sy + Math.sin(a + bend * An) * l1, hx, hy };
  }

  /* ================================================================== *
   * SHARED DEFS
   * ================================================================== */
  const DEFS = `<defs>
    ${[['gPk', '#F9B8C6'], ['gTl', '#B2E4DF'], ['gPc', '#FAD09A'], ['gPu', '#CECBF6'], ['gWarm', '#FFD9A0'], ['gSun', '#FFF1CF'], ['gGlow', '#E9FBF8'], ['gLamp', '#FFC777'], ['gCandle', '#FFB648'], ['gWhite', '#FFFFFF'], ['gPinkB', '#F4829A'], ['gTealB', '#7ECEC4'], ['gPeachB', '#F5A857'], ['gPurpleB', '#7F77DD']].map(([id, c]) =>
      `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset=".45" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
    <radialGradient id="gVig" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#2C1810" stop-opacity="0"/><stop offset="1" stop-color="#2C1810" stop-opacity=".55"/></radialGradient>
    <linearGradient id="gTopScrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF9" stop-opacity=".96"/><stop offset=".62" stop-color="#FFFBF9" stop-opacity=".78"/><stop offset="1" stop-color="#FFFBF9" stop-opacity="0"/></linearGradient>
    <linearGradient id="gTopDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1E14" stop-opacity=".62"/><stop offset=".6" stop-color="#3A1E14" stop-opacity=".3"/><stop offset="1" stop-color="#3A1E14" stop-opacity="0"/></linearGradient>
    <linearGradient id="gDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3E6"/><stop offset=".45" stop-color="#FCD9C4"/><stop offset=".8" stop-color="#FBC0A6"/><stop offset="1" stop-color="#FFE3B8"/></linearGradient>
    <linearGradient id="gGolden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8D9B4"/><stop offset=".55" stop-color="#FCE6C3"/><stop offset="1" stop-color="#FFEFD2"/></linearGradient>
    <linearGradient id="gDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D3D7A"/><stop offset=".42" stop-color="#7D63A3"/><stop offset=".72" stop-color="#E592A3"/><stop offset="1" stop-color="#F7B98C"/></linearGradient>
    <linearGradient id="gNightWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2B5C"/><stop offset="1" stop-color="#5B4C86"/></linearGradient>
    <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF4DC" stop-opacity="0"/><stop offset=".5" stop-color="#FFF4DC" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4DC" stop-opacity="0"/></linearGradient>
    <linearGradient id="gShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".48" stop-color="#fff" stop-opacity=".16"/><stop offset=".52" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6C29A"/><stop offset="1" stop-color="#C99A6E"/></linearGradient>
    <linearGradient id="gLid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3ECE6"/><stop offset="1" stop-color="#D9CEC6"/></linearGradient>
    <filter id="fTxt" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="fSoft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#2C1810" flood-opacity=".22"/></filter>
    <filter id="fB3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="fB8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="fB16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="fB30" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
  </defs>`;

  // Soft global finishing: warm grade, vignette.
  const vignette = (op = 1) => `<rect width="1080" height="1920" fill="url(#gVig)" opacity="${f3(op)}"/>`;
  const warm = (op = 0.12, col = '#FFB27A') => `<rect width="1080" height="1920" fill="${col}" opacity="${f3(op)}" style="mix-blend-mode:soft-light"/>`;
  const glowC = (x, y, r, g, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${g})" opacity="${f3(op)}"/>`;
  const glowE = (x, y, rx, ry, g, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#${g})" opacity="${f3(op)}"/>`;
  const screenBlend = inner => `<g style="mix-blend-mode:screen">${inner}</g>`;

  // Floating bokeh discs.
  function bokeh(t, n, seed, cols, box, o = {}) {
    const [x0, y0, w, h] = box;
    let s = '';
    for (let i = 0; i < n; i++) {
      const hx = hash(i + seed), hy = hash(i * 3 + seed + 7), hr = hash(i * 5 + seed + 3);
      const x = x0 + ((hx * w + t * (o.dx || 6) * (0.5 + hr)) % w);
      const y = y0 + hy * h + Math.sin(t * 0.6 + i) * 10;
      const r = (o.r0 || 14) + hr * (o.r1 || 30);
      const tw = 0.55 + 0.45 * Math.sin(t * (o.tw || 1.4) + i * 2.1);
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${cols[i % cols.length]}" opacity="${f3((o.op || 0.35) * tw)}"/>`;
    }
    return o.blur ? `<g filter="url(#${o.blur})">${s}</g>` : s;
  }
  // Dust motes drifting in a light beam.
  function motes(t, n, seed, box, col = '#FFF6E2') {
    const [x0, y0, w, h] = box;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + ((hash(i + seed) * w + t * 10 * (0.4 + hash(i + 2))) % w);
      const y = y0 + ((hash(i * 7 + seed) * h - t * 14 * (0.3 + hash(i + 5)) + h * 10) % h);
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2 + hash(i + 9) * 3.5)}" fill="${col}" opacity="${f3(0.35 + 0.45 * Math.abs(Math.sin(t * 1.3 + i)))}"/>`;
    }
    return s;
  }
  // Rising steam wisps from (x, y).
  function steam(t, x, y, sc = 1, op = 0.55, n = 3) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.55 + i / n) % 1;
      const yy = y - ph * 150 * sc, xx = x + (i - (n - 1) / 2) * 16 * sc + Math.sin(t * 2.2 + i * 2 + ph * 5) * 12 * sc;
      const a = Math.sin(ph * Math.PI) * op;
      s += `<path d="M${f1(xx)},${f1(yy + 50 * sc)} q${f1(-14 * sc)},${f1(-18 * sc)} 0,${f1(-34 * sc)} q${f1(14 * sc)},${f1(-16 * sc)} 0,${f1(-34 * sc)}" stroke="#fff" stroke-width="${f1(7 * sc)}" fill="none" stroke-linecap="round" opacity="${f3(a)}"/>`;
    }
    return `<g filter="url(#fB3)">${s}</g>`;
  }
  // Drifting leaves.
  function leaves(t, n, seed, box, cols) {
    const [x0, y0, w, h] = box;
    let s = '';
    for (let i = 0; i < n; i++) {
      const sp = 50 + hash(i + seed) * 60;
      const y = y0 + ((hash(i * 3 + seed) * h + t * sp) % h);
      const x = x0 + hash(i * 7 + seed) * w + Math.sin(t * 1.3 + i * 1.7) * 40;
      const r = t * (60 + hash(i) * 120) + i * 40;
      const sc = 0.7 + hash(i + 11) * 0.8;
      s += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(r)}) scale(${sc.toFixed(2)},${(sc * (0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i)))).toFixed(2)})"><path d="M-14,0 Q0,-12 14,0 Q0,12 -14,0 Z" fill="${cols[i % cols.length]}"/><path d="M-12,0 L12,0" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/></g>`;
    }
    return s;
  }
  // Anamorphic-ish lens flare.
  function flare(x, y, k, col = '#FFE2B0') {
    if (k <= 0) return '';
    let s = glowC(x, y, 320 * k, 'gSun', 0.9 * k) + glowC(x, y, 90 * k, 'gWhite', k);
    s += `<rect x="${f1(x - 700 * k)}" y="${f1(y - 5)}" width="${f1(1400 * k)}" height="10" rx="5" fill="${col}" opacity="${f3(0.5 * k)}" filter="url(#fB3)"/>`;
    const dx = 540 - x, dy = 960 - y;
    [[0.5, 40, P.peachL], [0.9, 70, P.pinkL], [1.3, 26, '#fff'], [1.6, 110, P.peachL]].forEach(([m, r, c]) => {
      s += `<circle cx="${f1(x + dx * m * 2)}" cy="${f1(y + dy * m * 2)}" r="${f1(r)}" fill="${c}" opacity="${f3(0.18 * k)}"/>`;
    });
    return screenBlend(s);
  }

  /* ================================================================== *
   * THE CAST
   * ================================================================== */
  // The waitlist cast: six women, six lives. Colors are character colors only.
  const CAST = {
    amara: {
      name: 'amara', skin: '#5E3A26', shade: '#462A1A', hi: '#7A4C33', hair: '#1A100A', hairHi: '#4A3226', lip: '#7A3A35', lipD: '#4A201C',
      liner: '#120A06', iris: '#2B160E', blush: '#B55A55', shadow: '#7A4A3A', face: 'round',
      style: 'curls', top: 'sweater', topC: '#E2A23E', topD: '#C5832A', topL: '#F2C06A', ear: 'hoop',
      B: { sh: 132 },
    },
    sofia: {
      name: 'sofia', skin: '#C8916A', shade: '#AD7550', hi: '#DCAA86', hair: '#2A1A12', hairHi: '#5E3D2A', lip: '#B4535C', lipD: '#7E3038',
      liner: '#22140C', iris: '#4A2A18', blush: '#E9807F', shadow: '#A8706A', face: 'round',
      style: 'wavy', top: 'blouse', topC: '#F28B78', topD: '#DC6E5C', topL: '#F9AE9E', ear: 'stud', necklace: true,
      B: { sh: 142, hipW: 122, armW: 60 },
    },
    mei: {
      name: 'mei', skin: '#F2D2B8', shade: '#DDB497', hi: '#FBE4D2', hair: '#17120F', hairHi: '#4A403C', lip: '#D0707A', lipD: '#9A4650',
      liner: '#2A1A14', iris: '#3A2418', blush: '#F59A9E', eyeK: 0.86, face: 'heart',
      style: 'pony', top: 'hoodie', topC: '#CECBF6', topD: '#ABA5EC', topL: '#E4E2FB', ear: 'stud',
      B: { sh: 116, nW: 42, armW: 50 },
    },
    priya: {
      name: 'priya', skin: '#A9734F', shade: '#8C5A3B', hi: '#C08A66', hair: '#1B120E', hairHi: '#4A382E', lip: '#9E4B4E', lipD: '#6A2C30',
      liner: '#170D09', iris: '#2F1A10', blush: '#D9746F', shadow: '#8E5E50',
      style: 'braid1', top: 'kurta', topC: '#7ECEC4', topD: '#5DB3A8', topL: '#B2E4DF', ear: 'stud', noseStud: true,
      B: { sh: 128 },
    },
    layla: {
      name: 'layla', skin: '#D2A47C', shade: '#B78760', hi: '#E3BC98', hair: '#F6C3CB', hairHi: '#FCDDE2', hairD: '#E9A6B1', lip: '#B85E62', lipD: '#843C40',
      liner: '#24160E', iris: '#4E3420', blush: '#E98B88', browC: '#3A2418', shadow: '#B98A7A',
      style: 'hijab', top: 'cardigan', topC: '#F6EBDD', topD: '#E3D2BE', topL: '#FFF8EE', tee: '#E8F8F6',
      B: { sh: 130 },
    },
    emma: {
      name: 'emma', skin: '#F5D7C3', shade: '#E2B49C', hi: '#FFE8DA', hair: '#A4472A', hairHi: '#CB6C43', lip: '#D47A80', lipD: '#A44C55',
      liner: '#5A3426', iris: '#5E7E5A', blush: '#F59A96', browC: '#8A3E24', freckles: true, face: 'narrow',
      style: 'shoulder', top: 'denim', topC: '#86A4C8', topD: '#6A88AD', topL: '#A9C1DE', tee: '#FFFBF9', ear: 'pearl',
      B: { sh: 124, nW: 44 },
    },
  };
  const ORDER = ['amara', 'sofia', 'mei', 'priya', 'layla', 'emma'];
  const NAMES = { amara: 'Amara', sofia: 'Sofia', mei: 'Mei', priya: 'Priya', layla: 'Layla', emma: 'Emma' };

  const BODY = {
    adult: { sh: 128, shY: 186, nW: 46, waistY: 440, hipY: 528, kneeY: 708, footY: 884, l1: 158, l2: 148, armW: 56, legW: 64, hipW: 108 },
    kid: { sh: 92, shY: 166, nW: 38, waistY: 318, hipY: 372, kneeY: 492, footY: 604, l1: 104, l2: 96, armW: 42, legW: 48, hipW: 80 },
  };

  /* ---------------- hair ---------------- */
  function bumpy(cx, cy, rx, ry, n, r, col, rot = 0) {
    let s = `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx * 0.92)}" ry="${f1(ry * 0.92)}" fill="${col}"/>`;
    for (let i = 0; i < n; i++) {
      const a = rad(rot + i * 360 / n);
      s += `<circle cx="${f1(cx + Math.cos(a) * rx * 0.86)}" cy="${f1(cy + Math.sin(a) * ry * 0.86)}" r="${f1(r * (0.85 + 0.3 * hash(i + n)))}" fill="${col}"/>`;
    }
    return s;
  }
  function coils(cx, cy, rx, ry, n, col, seed, op = 0.5) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = hash(i + seed) * Math.PI * 2, d = Math.sqrt(hash(i * 3 + seed));
      const x = cx + Math.cos(a) * rx * d * 0.85, y = cy + Math.sin(a) * ry * d * 0.85;
      s += `<path d="M${f1(x - 6)},${f1(y)} a6,6 0 1,1 12,0" stroke="${col}" stroke-width="3" fill="none" stroke-linecap="round" opacity="${op}"/>`;
    }
    return s;
  }
  function braid(d, col, hi, w = 15) {
    return `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${hi}" stroke-width="${w * 0.55}" fill="none" stroke-linecap="round" stroke-dasharray="5 9" opacity=".7"/>`;
  }

  // Hair drawn behind the head (head-local coords, head centre 0,0).
  function hairBack(t, L, o) {
    const h = L.hair, hi = L.hairHi, seed = o.seed || 1, wind = o.wind || 0;
    const sway = Math.sin(t * 1.6 + seed) * (1 + wind * 2);
    switch (L.style) {
      case 'curls': {
        // voluminous natural curls: big soft cloud of coils with sway
        let c = `<g transform="rotate(${f1(sway * 0.9)} 0 0)">`;
        c += bumpy(0, -34, 168, 150, 30, 36, h, 6);
        [[-150, 60, 40], [150, 60, 40], [-128, 116, 34], [128, 116, 34], [-160, -10, 38], [160, -10, 38]].forEach(([x, y, r], i) => {
          const sw = Math.sin(t * 1.7 + seed + i) * (2 + wind * 6);
          c += `<circle cx="${f1(x + sw)}" cy="${y}" r="${r}" fill="${h}"/>`;
        });
        c += coils(0, -34, 166, 146, 56, hi, 3, 0.55) + coils(0, 40, 160, 80, 18, hi, 11, 0.45) + '</g>';
        return c;
      }
      case 'wavy': {
        const sw = Math.sin(t * 1.6 + seed) * (4 + wind * 10), sw2 = Math.sin(t * 1.6 + seed + 0.8) * (5 + wind * 12);
        return `<path d="M-98,-20 C-106,-106 -50,-134 0,-132 C50,-134 106,-106 98,-20 C122,40 100,100 ${f1(126 + sw * 0.5)},160 C${f1(152 + sw)},220 ${f1(114 + sw)},280 ${f1(136 + sw2)},340 C80,362 -80,362 ${f1(-136 + sw2)},340 C${f1(-114 + sw)},280 ${f1(-152 + sw)},220 ${f1(-126 + sw * 0.5)},160 C-100,100 -122,40 -98,-20 Z" fill="${h}"/>
          <path d="M-110,140 C-96,200 -126,250 -110,310 M110,140 C96,200 126,250 110,310" stroke="${hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45"/>`;
      }
      case 'pony':
        return `<path d="M-90,10 C-100,-82 -50,-128 0,-128 C50,-128 100,-82 90,10 C88,40 80,62 70,72 L-70,72 C-80,62 -88,40 -90,10 Z" fill="${h}"/>`;
      case 'braid1':
        return `<path d="M-92,24 C-104,-80 -52,-130 0,-130 C52,-130 104,-80 92,24 C86,50 74,64 60,70 L-60,70 C-74,64 -86,50 -92,24 Z" fill="${h}"/>`;
      case 'hijab': {
        const sw = Math.sin(t * 1.4 + seed) * (2 + wind * 6);
        return `<path d="M-108,-10 C-116,-104 -62,-150 0,-150 C62,-150 116,-104 108,-10 C112,60 ${f1(124 + sw)},130 ${f1(156 + sw)},200 L${f1(-156 + sw)},200 C${f1(-124 + sw)},130 -112,60 -108,-10 Z" fill="${L.hairD || h}"/>`;
      }
      case 'shoulder': {
        const sw = Math.sin(t * 1.8 + seed) * (3 + wind * 9);
        return `<path d="M-98,-20 C-106,-106 -50,-134 0,-132 C50,-134 106,-106 98,-20 L${f1(116 + sw)},150 C104,172 72,172 60,162 L-60,162 C-72,172 -104,172 ${f1(-116 + sw)},150 Z" fill="${h}"/>`;
      }
      case 'puff':
        return `<g transform="rotate(${f1(sway * 1.2)} 0 -70)">${bumpy(10, -150, 98, 84, 18, 28, h, 8)}${coils(10, -150, 96, 80, 26, hi, 3)}</g>
          <path d="M-88,22 C-100,-70 -56,-124 0,-124 C56,-124 100,-70 88,22 C80,30 72,26 68,10 L-68,10 C-72,26 -80,30 -88,22 Z" fill="${h}"/>`;
      case 'twopuff':
        return [-1, 1].map(sd => `<g transform="rotate(${f1(sway * 2 * sd)} ${sd * 60} -60)">${bumpy(sd * 84, -86, 52, 50, 12, 18, h, sd * 10)}${coils(sd * 84, -86, 50, 48, 10, hi, sd > 0 ? 5 : 9)}</g>`).join('') +
          `<path d="M-86,20 C-98,-70 -54,-118 0,-118 C54,-118 98,-70 86,20 L-86,20 Z" fill="${h}"/>`;
      case 'braids': {
        let s = `<path d="M-92,40 C-106,-70 -56,-126 0,-126 C56,-126 106,-70 92,40 Z" fill="${h}"/>`;
        for (let side of [-1, 1]) for (let i = 0; i < 8; i++) {
          const x0 = side * (54 + i * 6), y0 = -20 + i * 8;
          const sw = Math.sin(t * 1.5 + i * 0.6 + seed) * (4 + wind * 14) + wind * 10 * side;
          const x2 = side * (96 + i * 9) + sw, y2 = 400 + i * 12 - (i % 2) * 20;
          s += braid(`M${f1(x0)},${y0} C${f1(side * (86 + i * 6))},${f1(90 + i * 4)} ${f1(side * (92 + i * 8) + sw * 0.5)},${f1(220 + i * 6)} ${f1(x2)},${f1(y2)}`, h, hi, 15);
        }
        s += `<circle cx="0" cy="-138" r="50" fill="${h}"/>` + [0, 1, 2, 3].map(i => `<path d="M${-42 + i * 6},${-150 + i * 12} Q0,${-196 + i * 18} ${42 - i * 6},${-150 + i * 12}" stroke="${hi}" stroke-width="5" fill="none" opacity=".75" stroke-dasharray="6 7"/>`).join('');
        return s;
      }
      case 'bob': {
        const wx = Math.sin(t * 2.2 + seed) * (2 + wind * 9);
        return `<path d="M-98,-24 C-104,-104 -52,-132 2,-130 C58,-132 106,-104 100,-24 L${f1(104 + wx)},92 C90,104 66,102 52,94 L-52,94 C-66,102 -92,104 ${f1(-104 + wx)},92 Z" fill="${h}"/>`;
      }
      case 'afro':
        return `${bumpy(0, -44, 150, 136, 26, 30, h, 4)}${coils(0, -44, 146, 130, 40, hi, 7, 0.4)}`;
      case 'locs': {
        let s = `<path d="M-94,20 C-106,-76 -56,-128 0,-128 C56,-128 106,-76 94,20 Z" fill="${h}"/>`;
        for (let side of [-1, 1]) for (let i = 0; i < 6; i++) {
          const sw = Math.sin(t * 1.5 + i + seed) * (4 + wind * 10);
          s += `<path d="M${side * (50 + i * 9)},${-40 + i * 10} Q${side * (96 + i * 6)},${80 + i * 6} ${f1(side * (100 + i * 8) + sw)},${210 + i * 10}" stroke="${h}" stroke-width="20" fill="none" stroke-linecap="round"/>`;
        }
        return s;
      }
      case 'long': {
        const sw = Math.sin(t * 1.7 + seed) * (3 + wind * 10);
        return `<path d="M-96,-20 C-104,-104 -50,-132 0,-130 C50,-132 104,-104 96,-20 L${f1(122 + sw)},300 C80,322 -80,322 ${f1(-122 + sw)},300 Z" fill="${h}"/>`;
      }
      case 'curly':
        return `${bumpy(0, -30, 120, 118, 22, 30, h, 0)}${coils(0, -30, 116, 112, 34, hi, 2, 0.45)}`;
      case 'bun':
        return `<circle cx="0" cy="-136" r="44" fill="${h}"/><path d="M-30,-140 Q0,-170 30,-140" stroke="${hi}" stroke-width="5" fill="none" opacity=".6"/><path d="M-90,10 C-100,-80 -50,-124 0,-124 C50,-124 100,-80 90,10 Z" fill="${h}"/>`;
    }
    return '';
  }

  // Hair drawn over the forehead (head-local).
  function hairFront(t, L, o) {
    const h = L.hair, hi = L.hairHi, seed = o.seed || 1, wind = o.wind || 0;
    const cap = `M-84,-2 C-90,-80 -48,-118 0,-118 C48,-118 90,-80 84,-2 C80,-36 70,-56 52,-66 C30,-58 12,-62 0,-68 C-12,-62 -30,-58 -52,-66 C-70,-56 -80,-36 -84,-2 Z`;
    switch (L.style) {
      case 'curls': {
        let c = `<path d="${cap}" fill="${h}"/>` + bumpy(0, -98, 84, 34, 12, 22, h, 0);
        [[-86, -40, 22], [86, -40, 22], [-92, 0, 18], [92, 0, 18]].forEach(([x, y, r]) => { c += `<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/>`; });
        c += coils(0, -96, 80, 30, 12, hi, 5, 0.6);
        c += `<path d="M-60,-62 q-10,14 0,24 q8,8 -2,18 M62,-60 q10,14 0,24 q-8,8 2,18" stroke="${h}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
        return c;
      }
      case 'wavy': {
        const sw = Math.sin(t * 1.6 + seed) * (3 + wind * 8);
        return `<path d="${cap}" fill="${h}"/>
          <path d="M-26,-126 C-80,-122 -98,-82 -96,-20 C-104,40 -84,90 -106,150 C${f1(-122 + sw)},200 ${f1(-98 + sw)},240 ${f1(-114 + sw)},290 L${f1(-86 + sw)},282 C${f1(-76 + sw)},236 -96,196 -80,144 C-66,92 -84,40 -72,-12 C-66,-52 -48,-84 -26,-126 Z" fill="${h}"/>
          <path d="M-26,-126 C34,-132 94,-100 96,-20 C104,40 86,90 108,150 C${f1(124 + sw)},200 ${f1(100 + sw)},240 ${f1(116 + sw)},290 L${f1(88 + sw)},282 C${f1(78 + sw)},236 98,196 82,144 C68,92 86,40 74,-12 C66,-60 14,-66 -26,-126 Z" fill="${h}"/>
          <path d="M-20,-112 C20,-104 52,-88 70,-60 M-66,-80 C-80,-50 -84,-20 -84,10" stroke="${hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`;
      }
      case 'pony':
        return `<path d="M-88,26 C-94,-86 -48,-124 0,-124 C48,-124 94,-86 88,26 L76,34 C78,-6 74,-34 66,-50 L60,-56 Q44,-50 30,-58 Q15,-50 0,-58 Q-15,-50 -30,-58 Q-44,-50 -60,-56 L-66,-50 C-74,-34 -78,-6 -76,34 Z" fill="${h}"/>
          <path d="M-58,-94 C-30,-114 30,-114 58,-94" stroke="${hi}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55"/>
          <path d="M-40,-60 L-38,-80 M-10,-60 L-9,-84 M20,-60 L19,-82 M48,-58 L46,-78" stroke="${hi}" stroke-width="3" opacity=".35" stroke-linecap="round"/>`;
      case 'braid1':
        return `<path d="${cap}" fill="${h}"/><path d="M0,-118 C-2,-100 -2,-84 0,-68" stroke="${L.shade}" stroke-width="4" fill="none" opacity=".7"/>
          <path d="M-12,-112 C-44,-104 -70,-80 -78,-40 M12,-112 C44,-104 70,-80 78,-40" stroke="${hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/>`;
      case 'hijab': {
        const hd = L.hairD || h;
        return `<path fill-rule="evenodd" d="M-110,-10 C-116,-106 -62,-152 0,-152 C62,-152 116,-106 110,-10 C112,64 82,134 0,156 C-82,134 -112,64 -110,-10 Z M-74,-6 C-76,-72 -42,-96 0,-96 C42,-96 76,-72 74,-6 C72,48 44,98 0,105 C-44,98 -72,48 -74,-6 Z" fill="${h}"/>
          <path d="M-74,-6 C-76,-72 -42,-96 0,-96 C42,-96 76,-72 74,-6" stroke="${hd}" stroke-width="6" fill="none" opacity=".7"/>
          <path d="M-96,-60 C-104,0 -96,60 -62,112 M96,-60 C104,0 96,60 62,112 M-40,-128 C-10,-138 30,-136 60,-122" stroke="${hd}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
          <path d="M-70,-110 C-40,-134 20,-138 50,-128" stroke="${L.hairHi}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>
`;
      }
      case 'shoulder': {
        const sw = Math.sin(t * 1.8 + seed) * (3 + wind * 8);
        return `<path d="M24,-126 C-40,-128 -92,-92 -94,-14 L${f1(-106 + sw)},136 Q${f1(-112 + sw)},160 ${f1(-88 + sw)},166 Q-76,150 -76,122 C-80,40 -74,-22 -40,-62 C-14,-86 10,-98 24,-126 Z" fill="${h}"/>
          <path d="M24,-126 C72,-122 98,-84 94,-14 L${f1(108 + sw)},136 Q${f1(114 + sw)},160 ${f1(90 + sw)},166 Q78,150 78,122 C80,40 76,-26 62,-60 C52,-82 40,-102 24,-126 Z" fill="${h}"/>
          <path d="M18,-116 C-20,-110 -56,-90 -72,-54 M-84,0 C-86,40 -84,80 -88,120" stroke="${hi}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>
          <path d="M34,-114 C60,-104 80,-80 84,-40" stroke="${hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>`;
      }
      case 'puff':
        return `<path d="${cap}" fill="${h}"/>
          <path d="M-44,-74 Q-34,-102 -10,-114 M0,-70 Q4,-100 14,-116 M40,-72 Q36,-100 22,-114" stroke="${hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
          <path d="M-80,-26 q9,-4 6,-13 q-3,-7 -10,-1 M80,-26 q-9,-4 -6,-13 q3,-7 10,-1" stroke="${h}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case 'twopuff':
        return `<path d="${cap}" fill="${h}"/><path d="M0,-118 L0,-70" stroke="${hi}" stroke-width="4" opacity=".7"/>
          <ellipse cx="-62" cy="-74" rx="10" ry="15" transform="rotate(-30 -62 -74)" fill="${P.pink}"/><ellipse cx="62" cy="-74" rx="10" ry="15" transform="rotate(30 62 -74)" fill="${P.pink}"/>`;
      case 'braids':
        return `<path d="${cap}" fill="${h}"/>` + [-60, -36, -12, 12, 36, 60].map((x, i) => `<path d="M${x},${-62 - Math.abs(x) * 0.05} Q${f1(x * 0.6)},-110 ${f1(x * 0.15)},-130" stroke="${hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6" stroke-dasharray="7 6"/>`).join('');
      case 'bob': {
        const wx = Math.sin(t * 2.2 + seed) * (2 + wind * 9), wl = Math.sin(t * 2.2 + seed + 0.6) * (2 + wind * 8);
        return `<path d="M34,-122 C-24,-124 -84,-92 -90,-14 L${f1(-98 + wl)},90 C-86,98 -72,98 -64,90 C-72,40 -70,-26 -36,-58 C-10,-80 18,-90 34,-122 Z" fill="${h}"/>
          <path d="M34,-122 C72,-116 98,-82 94,-14 L${f1(100 + wx)},90 C90,98 78,98 70,90 C76,40 74,-24 60,-60 C50,-84 42,-100 34,-122 Z" fill="${h}"/>
          <path d="M-60,-74 C-40,-96 -8,-110 20,-112" stroke="${hi}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
          <path d="M-80,-10 C-82,20 -80,50 -78,76" stroke="${hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>`;
      }
      case 'afro':
        return `<path d="${cap}" fill="${h}"/>`;
      case 'locs':
        return `<path d="${cap}" fill="${h}"/>` + [-1, 1].map(sd => `<path d="M${sd * 30},-90 Q${sd * 84},-40 ${f1(sd * 92 + Math.sin(t * 1.5) * 3)},40" stroke="${h}" stroke-width="20" fill="none" stroke-linecap="round"/>`).join('');
      case 'long': {
        const sw = Math.sin(t * 1.7 + seed) * (3 + wind * 8);
        return `<path d="M0,-124 C-50,-122 -92,-90 -92,-20 L${f1(-104 + sw)},170 C-96,180 -84,178 -78,168 C-80,90 -76,-10 -40,-58 C-24,-78 -10,-90 0,-124 Z" fill="${h}"/>
          <path d="M0,-124 C50,-122 92,-90 92,-20 L${f1(104 + sw)},170 C96,180 84,178 78,168 C80,90 76,-10 40,-58 C24,-78 10,-90 0,-124 Z" fill="${h}"/>
          <path d="M-60,-70 C-40,-96 -16,-108 -4,-112" stroke="${hi}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`;
      }
      case 'curly':
        return `<path d="${cap}" fill="${h}"/>` + bumpy(0, -96, 70, 26, 9, 18, h, 0);
      case 'bun':
        return `<path d="${cap}" fill="${h}"/><path d="M-50,-70 Q-30,-104 -2,-116 M40,-70 Q30,-100 10,-116" stroke="${hi}" stroke-width="4" fill="none" opacity=".5"/>`;
    }
    return '';
  }

  /* ---------------- face ---------------- */
  // Mood presets: eye openness, brow lift, mouth.
  const MOODS = {
    smile: { eye: 1, brow: 0, mouth: 'smile' },
    soft: { eye: 0.86, brow: 2, mouth: 'soft' },
    grin: { eye: 0.82, brow: -3, mouth: 'grin' },
    laugh: { eye: 'happy', brow: -7, mouth: 'laugh' },
    curious: { eye: 1.06, brow: -4, browR: -12, mouth: 'curious' },
    focus: { eye: 0.84, brow: 3, knit: 3, mouth: 'neutral' },
    exhale: { eye: 'closed', brow: -2, mouth: 'o' },
    relief: { eye: 'closed', brow: -5, mouth: 'smile' },
    bliss: { eye: 'happy', brow: -4, mouth: 'grin' },
    kiss: { eye: 'closed', brow: -2, mouth: 'pucker' },
    talk: { eye: 1, brow: -2, mouth: 'talk' },
    gasp: { eye: 1.14, brow: -11, mouth: 'o' },
    wow: { eye: 1.1, brow: -9, mouth: 'grin' },
  };

  function eye(ex, sx, L, o, open, mode, lx, ly, kid) {
    const sc = kid ? 1.22 : 1.1;
    const X = v => f1(ex + sx * v * sc);
    const Y = v => f1(4 + v * sc);
    const ln = L.liner;
    if (mode === 'happy') {
      return `<path d="M${X(-20)},${Y(6)} Q${X(0)},${Y(-13)} ${X(22)},${Y(4)}" stroke="${ln}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M${X(21)},${Y(3)} L${X(29)},${Y(-3)}" stroke="${ln}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (mode === 'closed' || open < 0.22) {
      return `<path d="M${X(-20)},${Y(2)} Q${X(0)},${Y(11)} ${X(22)},${Y(1)}" stroke="${ln}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path d="M${X(20)},${Y(2)} L${X(29)},${Y(6)} M${X(14)},${Y(6)} L${X(20)},${Y(12)}" stroke="${ln}" stroke-width="3.5" stroke-linecap="round"/>`;
    }
    const k = open;
    const id = uid('eye');
    const white = `M${X(-20)},${Y(2)} Q${X(-2)},${Y(-19 * k)} ${X(22)},${Y(-2)} Q${X(4)},${Y(15 * k)} ${X(-20)},${Y(2)} Z`;
    const ix = ex + lx, iy = 4 + ly;
    return `<clipPath id="${id}"><path d="${white}"/></clipPath>
      ${L.shadow ? `<path d="M${X(-22)},${Y(0)} Q${X(0)},${Y(-26 * k)} ${X(26)},${Y(-4)} Q${X(2)},${Y(-12)} ${X(-22)},${Y(0)} Z" fill="${L.shadow}" opacity=".55"/>` : ''}
      <path d="${white}" fill="#FFF9F3"/>
      <g clip-path="url(#${id})"><circle cx="${f1(ix)}" cy="${f1(iy)}" r="${f1(12.5 * sc)}" fill="${L.iris}"/><circle cx="${f1(ix)}" cy="${f1(iy)}" r="${f1(6.4 * sc)}" fill="#120805"/>
        <circle cx="${f1(ix + 4.5)}" cy="${f1(iy - 4.5)}" r="${f1(3.8 * sc)}" fill="#fff"/><circle cx="${f1(ix - 4)}" cy="${f1(iy + 4)}" r="1.7" fill="#fff" opacity=".8"/>
        <path d="M${X(-22)},${Y(-14)} L${X(24)},${Y(-14)} L${X(24)},${Y(-3 - 6 * k)} Q${X(0)},${Y(-12 * k)} ${X(-22)},${Y(-2)} Z" fill="${L.liner}" opacity=".18"/></g>
      <path d="M${X(-21)},${Y(2)} Q${X(-2)},${Y(-20 * k)} ${X(23)},${Y(-2)}" stroke="${ln}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M${X(21)},${Y(-2)} L${X(31)},${Y(-9)} M${X(16)},${Y(-6 - 3 * k)} L${X(23)},${Y(-14 - 2 * k)}" stroke="${ln}" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M${X(-12)},${Y(9 * k)} Q${X(6)},${Y(12 * k)} ${X(18)},${Y(3)}" stroke="${L.shade}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }

  function faceFeatures(t, L, o) {
    const kid = !!L.kid, seed = o.seed || 1;
    const M = MOODS[o.mood || 'smile'] || MOODS.smile;
    const bl = o.noBlink ? 0 : blink(t, seed);
    const [lx, ly] = o.look || [0, 0];
    let open = typeof M.eye === 'number' ? M.eye * (L.eyeK || 1) * (1 - bl) : 1;
    if (ly > 3 && typeof M.eye === 'number') open *= 0.86;
    const emode = typeof M.eye === 'string' ? M.eye : 'open';
    const tw = (o.turn || 0) * 14;
    let s = `<g transform="translate(${f1(tw)},0)">`;
    // blush
    s += `<g filter="url(#fB3)" opacity="${o.blushOp || 0.34}"><ellipse cx="-52" cy="46" rx="19" ry="10" fill="${L.blush}"/><ellipse cx="52" cy="46" rx="19" ry="10" fill="${L.blush}"/></g>`;
    s += eye(-35, -1, L, o, open, emode, lx, ly, kid) + eye(35, 1, L, o, open, emode, lx, ly, kid);
    // brows
    const b = M.brow + (o.browLift || 0), br = M.browR != null ? M.browR : b, kn = M.knit || 0;
    const brow = (sx, d) => `<path d="M${f1(sx * (14 - kn))},${f1(-30 + d + kn)} Q${f1(sx * 30)},${f1(-46 + d)} ${f1(sx * 50)},${f1(-36 + d * 0.6)}" stroke="${L.browC || L.liner}" stroke-width="${kid ? 6 : 7.5}" fill="none" stroke-linecap="round"/>`;
    s += brow(-1, b) + brow(1, br);
    // nose
    s += `<path d="M-2,8 Q-4,26 -6,34" stroke="${L.shade}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>
      <path d="M-13,46 Q-15,56 -4,57 M13,46 Q15,56 4,57" stroke="${L.shade}" stroke-width="${kid ? 3.4 : 4.2}" fill="none" stroke-linecap="round"/>
      <ellipse cx="2" cy="40" rx="5" ry="3.5" fill="${L.hi}" opacity=".6"/>`;
    // mouth
    const my = kid ? 78 : 80;
    const mouth = M.mouth;
    if (mouth === 'smile') {
      s += `<path d="M-26,${my - 6} Q-12,${my - 2} 0,${my - 3} Q12,${my - 2} 26,${my - 6} Q14,${my + 14} 0,${my + 15} Q-14,${my + 14} -26,${my - 6} Z" fill="${L.lip}"/>
        <path d="M-25,${my - 5} Q0,${my + 8} 25,${my - 5}" stroke="${L.lipD}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="4" cy="${my + 9}" rx="8" ry="2.6" fill="#fff" opacity=".25"/>`;
    } else if (mouth === 'laugh' || mouth === 'grin') {
      const g = mouth === 'grin' ? 0.62 : 1;
      const jaw = mouth === 'laugh' ? Math.abs(Math.sin(t * 13 + seed)) * 4 : 0;
      const h = (34 + jaw) * g;
      s += `<path d="M-31,${my - 10} Q0,${my - 5} 31,${my - 10} Q28,${f1(my - 10 + h)} 0,${f1(my - 8 + h)} Q-28,${f1(my - 10 + h)} -31,${my - 10} Z" fill="#4A1A18" stroke="${L.lip}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M-25,${my - 8} Q0,${my - 4} 25,${my - 8} L23,${f1(my - 1 + 2 * g)} Q0,${f1(my + 3 + 2 * g)} -23,${f1(my - 1 + 2 * g)} Z" fill="#FFFDF8"/>
        ${g === 1 ? `<path d="M-15,${f1(my - 12 + h)} Q0,${f1(my - 24 + h)} 15,${f1(my - 12 + h)} Q0,${f1(my - 6 + h)} -15,${f1(my - 12 + h)} Z" fill="#E07C86"/>` : ''}`;
    } else if (mouth === 'soft') {
      s += `<path d="M-19,${my - 3} Q0,${my + 9} 19,${my - 3}" stroke="${L.lip}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-17,${my - 3} Q0,${my + 5} 17,${my - 3}" stroke="${L.lipD}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    } else if (mouth === 'neutral') {
      s += `<path d="M-16,${my} Q0,${my + 4} 16,${my}" stroke="${L.lip}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    } else if (mouth === 'curious') {
      s += `<path d="M-15,${my + 2} Q2,${my + 6} 17,${my - 4}" stroke="${L.lip}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-13,${my + 2} Q2,${my + 4} 15,${my - 3}" stroke="${L.lipD}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    } else if (mouth === 'o') {
      s += `<ellipse cx="0" cy="${my + 2}" rx="11" ry="13" fill="#4A1A18" stroke="${L.lip}" stroke-width="5"/>`;
    } else if (mouth === 'pucker') {
      s += `<ellipse cx="0" cy="${my}" rx="10" ry="9" fill="${L.lip}"/><path d="M-6,${my} L6,${my}" stroke="${L.lipD}" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (mouth === 'talk') {
      const k = Math.abs(Math.sin(t * 10.5 + seed) * Math.sin(t * 4.1 + 1));
      s += `<path d="M-22,${my - 6} Q0,${my - 2} 22,${my - 6} Q18,${f1(my + 2 + k * 16)} 0,${f1(my + 3 + k * 16)} Q-18,${f1(my + 2 + k * 16)} -22,${my - 6} Z" fill="#4A1A18" stroke="${L.lip}" stroke-width="4.5" stroke-linejoin="round"/>`;
    }
    s += '</g>';
    return s;
  }

  function earring(L, side, t, seed) {
    const x = side * 80;
    if (L.ear === 'hoop') {
      const a = Math.sin(t * 2.4 + seed + side) * 6;
      return `<g transform="rotate(${f1(a)} ${x} 26)"><circle cx="${x}" cy="48" r="20" fill="none" stroke="#C8891F" stroke-width="6"/><circle cx="${x}" cy="48" r="20" fill="none" stroke="${P.peachL}" stroke-width="2.4" stroke-dasharray="12 22" opacity=".9"/></g>`;
    }
    if (L.ear === 'pearl') { const px = side * 72; return `<ellipse cx="${px}" cy="30" rx="7" ry="9" fill="${L.skin}"/><circle cx="${px}" cy="40" r="8.5" fill="#FBF6EE"/><circle cx="${px - 2.5}" cy="37.5" r="3" fill="#fff"/><circle cx="${px}" cy="40" r="8.5" fill="none" stroke="#E2D6C8" stroke-width="1.4"/>`; }
    if (false) return `<circle cx="${x}" cy="30" r="8.5" fill="#FBF6EE"/><circle cx="${x - 2.5}" cy="27.5" r="3" fill="#fff"/><circle cx="${x}" cy="30" r="8.5" fill="none" stroke="#E2D6C8" stroke-width="1.4"/>`;
    if (L.ear === 'stud') return `<circle cx="${x}" cy="28" r="5" fill="${P.gold}"/>`;
    return '';
  }

  function glasses(L) {
    const fr = '#8E5A2E', sp = '#4A2810';
    return [-1, 1].map(sd => `<circle cx="${sd * 35}" cy="5" r="31" fill="#fff" fill-opacity=".1" stroke="${fr}" stroke-width="7"/>
        <circle cx="${sd * 35}" cy="5" r="31" fill="none" stroke="${sp}" stroke-width="7" stroke-dasharray="9 5 3 12 6 8" opacity=".3"/>
        <path d="M${sd * 35 - 16},-11 Q${sd * 35 - 4},-20 ${sd * 35 + 8},-18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
        <path d="M${sd * 66},-2 L${sd * 82},-8" stroke="${fr}" stroke-width="6" stroke-linecap="round"/>`).join('') +
      `<path d="M-5,0 Q0,-7 5,0" stroke="${fr}" stroke-width="6" fill="none"/>`;
  }

  // Head (head-local coords, head centre 0,0, face rx ~80).
  function headSVG(t, L, o) {
    const kid = !!L.kid;
    const FACES = {
      oval: 'M-80,-6 C-82,-76 -46,-108 0,-108 C46,-108 82,-76 80,-6 C79,50 48,100 0,106 C-48,100 -79,50 -80,-6 Z',
      round: 'M-83,-6 C-85,-76 -48,-108 0,-108 C48,-108 85,-76 83,-6 C82,56 50,100 0,104 C-50,100 -82,56 -83,-6 Z',
      heart: 'M-81,-8 C-83,-78 -46,-108 0,-108 C46,-108 83,-78 81,-8 C79,46 44,96 0,104 C-44,96 -79,46 -81,-8 Z',
      narrow: 'M-78,-6 C-80,-78 -44,-110 0,-110 C44,-110 80,-78 78,-6 C77,52 46,104 0,110 C-46,104 -77,52 -78,-6 Z',
    };
    const face = kid
      ? 'M-84,-4 C-86,-76 -48,-108 0,-108 C48,-108 86,-76 84,-4 C83,52 50,98 0,100 C-50,98 -83,52 -84,-4 Z'
      : FACES[L.face || 'oval'];
    const tw = (o.turn || 0) * 8;
    let s = '';
    // ears
    s += [-1, 1].map(sd => `<ellipse cx="${sd * 80 + tw * 0.3}" cy="10" rx="14" ry="20" fill="${L.skin}"/><path d="M${sd * 82},0 Q${sd * 88},10 ${sd * 82},20" stroke="${L.shade}" stroke-width="3" fill="none" opacity=".6"/>`).join('');
    s += `<path d="${face}" fill="${L.skin}"/>`;
    // soft form shading on the shadow side + light-side rim
    const ls = o.lightSide || -1;
    s += `<path d="M${-ls * 80},-6 C${-ls * 79},50 ${-ls * 48},100 0,106 C${-ls * 40},92 ${-ls * 66},50 ${-ls * 70},-6 C${-ls * 70},-50 ${-ls * 60},-80 ${-ls * 40},-100 C${-ls * 70},-86 ${-ls * 82},-50 ${-ls * 80},-6 Z" fill="${L.shade}" opacity=".32"/>`;
    if (o.rim) s += `<path d="M${ls * 78},-30 C${ls * 80},20 ${ls * 60},80 ${ls * 18},102" stroke="${o.rim}" stroke-width="6" fill="none" stroke-linecap="round" opacity="${o.rimOp || 0.7}"/>`;
    if (o.glow) s += `<ellipse cx="0" cy="24" rx="78" ry="80" fill="${o.glow}" opacity="${f3((o.glowK ?? 1) * 0.22)}"/>`;
    s += faceFeatures(t, L, o);
    const tx = (o.turn || 0) * 14;
    if (L.freckles) {
      let fr = '';
      for (let i = 0; i < 16; i++) {
        const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2);
        const x = sd * (30 + hash(k + 3) * 34) + tx, y = 30 + hash(k * 5 + 1) * 22;
        fr += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.8 + hash(k + 9) * 1.4)}" fill="#C47E5E" opacity=".55"/>`;
      }
      fr += [[-6, 34], [6, 32], [0, 26]].map(([x, y]) => `<circle cx="${x + tx}" cy="${y}" r="1.7" fill="#C47E5E" opacity=".5"/>`).join('');
      s += fr;
    }
    if (L.noseStud) s += `<circle cx="${f1(-15 + tx)}" cy="49" r="3.8" fill="${P.gold}"/><circle cx="${f1(-16 + tx)}" cy="48" r="1.4" fill="#fff"/>`;
    s += hairFront(t, L, o);
    if (o.earbuds) s += [-1, 1].map(sd => `<g transform="translate(${sd * 84},20)"><ellipse rx="9" ry="11" fill="#fff"/><rect x="-3.5" y="6" width="7" height="22" rx="3.5" fill="#fff"/><ellipse rx="9" ry="11" fill="none" stroke="#D9D2CE" stroke-width="1.5"/></g>`).join('');
    s += earring(L, -1, t, o.seed || 1) + earring(L, 1, t, o.seed || 1);
    if (L.glasses) s += `<g transform="translate(${f1((o.turn || 0) * 14)},0)">${glasses(L)}</g>`;
    return s;
  }

  /* ---------------- hands ---------------- */
  function hand(x, y, ang, L, kind = 'rest', flipY = 1, sc = 1) {
    const sk = L.skin, sh = L.shade;
    if (kind === 'none') return '';
    if (kind === 'open') {
      return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
        ${[-16, -5, 6, 16].map((fx, i) => `<rect x="${fx - 5.5}" y="${-54 + Math.abs(i - 1.5) * 6}" width="11" height="${40 - Math.abs(i - 1.5) * 4}" rx="5.5" fill="${sk}" transform="rotate(${(i - 1.5) * 7} ${fx} -14)"/>`).join('')}
        <ellipse cx="0" cy="-4" rx="23" ry="24" fill="${sk}"/>
        <ellipse cx="-24" cy="2" rx="8" ry="15" transform="rotate(-38 -24 2)" fill="${sk}"/>
        <path d="M-10,8 Q0,14 10,8" stroke="${sh}" stroke-width="2.5" fill="none" opacity=".5"/></g>`;
    }
    if (kind === 'pinch') {
      return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(ang)}) scale(${sc},${sc * flipY})">
        <path d="M-12,-22 C8,-30 30,-24 34,-10 C38,6 30,22 12,24 C-4,26 -14,16 -14,4 Z" fill="${sk}"/>
        ${[0, 1, 2].map(i => `<ellipse cx="${30 - i * 4}" cy="${4 + i * 9}" rx="10" ry="6" fill="${sk}" stroke="${sh}" stroke-width="2" stroke-opacity=".35"/>`).join('')}
        <path d="M28,-14 L56,-8" stroke="${sk}" stroke-width="13" stroke-linecap="round"/>
        <path d="M6,-24 Q30,-30 52,-14" stroke="${sk}" stroke-width="13" fill="none" stroke-linecap="round"/>
        <path d="M30,-18 L44,-16" stroke="${sh}" stroke-width="2" opacity=".4"/>
        <ellipse cx="55" cy="-10" rx="4" ry="3" fill="#fff" opacity=".35"/></g>`;
    }
    const pt = kind === 'point' ? `<rect x="26" y="-17" width="40" height="12" rx="6" fill="${sk}"/><ellipse cx="62" cy="-11" rx="4" ry="4.5" fill="#fff" opacity=".25"/>` : '';
    const ff = kind === 'point' ? '' : `<path d="M30,-12 L40,-10 M31,0 L41,1 M28,11 L37,12" stroke="${sh}" stroke-width="2.6" stroke-linecap="round" opacity=".55"/>`;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(ang)}) scale(${sc},${sc * flipY})">
      <path d="M-8,-20 C12,-27 34,-22 42,-10 C48,2 42,18 26,22 C10,26 -6,22 -9,10 Z" fill="${sk}"/>
      <path d="M2,-20 C8,-36 24,-36 28,-26 C30,-18 22,-14 14,-14" fill="${sk}" stroke="${sh}" stroke-width="2.4" stroke-opacity=".4"/>
      ${ff}${pt}</g>`;
  }

  /* ---------------- torso ---------------- */
  function torso(t, L, o, B) {
    const full = o.body === 'full';
    const W = B.sh + (L.top === 'sweater' ? 18 : 0);
    const nW = B.nW, sy = B.shY;
    const hem = full ? (L.top === 'cardigan' ? B.hipY + 70 : L.top === 'sweater' ? B.hipY + 30 : B.hipY + 18) : (o.cut || 760);
    const wx = full ? (L.top === 'sweater' ? W - 6 : B.hipW - 8) : W + 8;
    const hx = full ? (L.top === 'sweater' ? W - 2 : L.top === 'cardigan' ? B.hipW + 12 : B.hipW + 4) : W + 16;
    const wy = full ? B.waistY : (sy + hem) / 2;
    const path = `M${-nW - 10},${sy - 46} C${-W + 34},${sy - 44} ${-W - 4},${sy - 22} ${-W - 6},${sy + 34} C${-W - 8},${sy + 120} ${-wx},${wy - 60} ${-wx},${wy} L${-hx},${hem} L${hx},${hem} L${wx},${wy} C${wx},${wy - 60} ${W + 8},${sy + 120} ${W + 6},${sy + 34} C${W + 4},${sy - 22} ${W - 34},${sy - 44} ${nW + 10},${sy - 46} Z`;
    let s = `<path d="${path}" fill="${L.topC}"/>`;
    // shadow side panel
    s += `<path d="M${W - 30},${sy - 30} C${W},${sy + 40} ${wx - 8},${wy - 40} ${wx - 4},${wy} L${hx - 6},${hem} L${hx},${hem} L${wx},${wy} C${wx},${wy - 60} ${W + 8},${sy + 120} ${W + 6},${sy + 34} C${W + 4},${sy - 22} ${W - 20},${sy - 40} ${W - 30},${sy - 30} Z" fill="${L.topD}" opacity=".55"/>`;
    if (L.top === 'sweater') {
      s += `<path d="M${-nW - 12},${sy - 44} Q0,${sy - 2} ${nW + 12},${sy - 44}" stroke="${L.topD}" stroke-width="22" fill="none" stroke-linecap="round"/>
        <path d="M${-nW - 12},${sy - 44} Q0,${sy - 2} ${nW + 12},${sy - 44}" stroke="${L.topC}" stroke-width="14" fill="none" stroke-dasharray="3 6" stroke-linecap="round"/>`;
      for (const cx of [-56, 0, 56]) {
        let d = `M${cx},${sy + 10}`;
        for (let y = sy + 10; y < hem - 30; y += 36) d += ` q${cx === 0 ? 8 : 6},18 0,36`;
        s += `<path d="${d}" stroke="${L.topD}" stroke-width="4" fill="none" opacity=".6"/>`;
      }
      if (full) s += `<path d="M${-hx + 4},${hem - 14} L${hx - 4},${hem - 14}" stroke="${L.topD}" stroke-width="18" stroke-dasharray="3 6"/>`;
    } else if (L.top === 'cardigan') {
      const bw = full ? 56 : 62;
      s += `<path d="M${-nW - 6},${sy - 46} Q0,${sy - 30} ${nW + 6},${sy - 46} L${bw},${hem} L${-bw},${hem} Z" fill="${L.tee}"/>
        <path d="M${-nW - 4},${sy - 44} Q0,${sy - 4} ${nW + 4},${sy - 44}" stroke="#E7DFD4" stroke-width="7" fill="none"/>
        <path d="M${-nW - 10},${sy - 46} L${-bw - 4},${hem} M${nW + 10},${sy - 46} L${bw + 4},${hem}" stroke="${L.topD}" stroke-width="9"/>
        ${[0, 1, 2, 3].map(i => `<circle cx="${f1(-nW - 22 - i * (bw - nW) / 4)}" cy="${f1(sy + 30 + i * 70)}" r="6" fill="#F3EDE2"/>`).join('')}`;
    } else if (L.top === 'blazer') {
      s += `<path d="M${-nW - 8},${sy - 46} L0,${sy + 170} L${nW + 8},${sy - 46} Z" fill="${L.blouse}"/>
        <path d="M${-nW + 4},${sy - 48} Q-8,${sy + 10} 0,${sy + 40} Q8,${sy + 10} ${nW - 4},${sy - 48} Z" fill="${L.skin}"/>
        <path d="M${-nW + 4},${sy - 48} Q-8,${sy + 10} 0,${sy + 40} Q8,${sy + 10} ${nW - 4},${sy - 48}" stroke="${L.blouseD}" stroke-width="4" fill="none"/>
        ${[-1, 1].map(sd => `<path d="M${sd * (nW + 10)},${sy - 46} L${sd * 4},${sy + 190} L${sd * 50},${sy + 120} L${sd * 82},${sy + 54} L${sd * 66},${sy + 44} L${sd * (W - 28)},${sy - 34} Z" fill="${L.topC}" stroke="${L.topD}" stroke-width="4" stroke-linejoin="round"/>`).join('')}
        <path d="M0,${sy + 190} L0,${hem}" stroke="${L.topD}" stroke-width="4"/>
        <circle cx="-14" cy="${sy + 216}" r="8" fill="${L.topD}"/>
        ${full ? `<path d="M${-wx + 20},${B.waistY + 50} L${-wx + 70},${B.waistY + 46} M${wx - 20},${B.waistY + 50} L${wx - 70},${B.waistY + 46}" stroke="${L.topD}" stroke-width="5" stroke-linecap="round"/>` : ''}`;
    } else if (L.top === 'blouse') {
      s += `<path d="M${-nW + 2},${sy - 48} Q-8,${sy + 20} 0,${sy + 66} Q8,${sy + 20} ${nW - 2},${sy - 48} Z" fill="${L.skin}"/>
        <path d="M${-nW + 2},${sy - 48} Q-8,${sy + 20} 0,${sy + 66} Q8,${sy + 20} ${nW - 2},${sy - 48}" stroke="${L.topD}" stroke-width="5" fill="none"/>
        ${[-1, 1].map(sd => `<path d="M${sd * (nW + 4)},${sy - 48} Q${sd * (nW + 34)},${sy - 10} ${sd * 14},${sy + 60} Q${sd * (nW + 6)},${sy + 6} ${sd * (nW - 4)},${sy - 46} Z" fill="${L.topL}" stroke="${L.topD}" stroke-width="3" stroke-linejoin="round"/>`).join('')}
        ${[0, 1, 2].map(i => `<circle cx="0" cy="${sy + 96 + i * 62}" r="6" fill="${L.topL}"/>`).join('')}
        <path d="M-60,${sy + 80} Q-40,${sy + 200} -64,${sy + 300} M64,${sy + 90} Q44,${sy + 200} 66,${sy + 300}" stroke="${L.topD}" stroke-width="4" fill="none" opacity=".5"/>`;
      if (L.necklace) s += `<path d="M${-nW + 6},${sy - 44} Q0,${sy + 16} ${nW - 6},${sy - 44}" stroke="${P.gold}" stroke-width="2.6" fill="none"/><path d="M0,${sy + 1} l7,10 l-7,10 l-7,-10 Z" fill="${P.gold}"/><circle cx="-2" cy="${sy + 9}" r="2" fill="#fff"/>`;
    } else if (L.top === 'hoodie') {
      s += `<path d="M${-nW - 34},${sy - 54} Q0,${sy + 30} ${nW + 34},${sy - 54}" stroke="${L.topD}" stroke-width="34" fill="none" stroke-linecap="round"/>
        <path d="M${-nW - 30},${sy - 58} Q0,${sy + 20} ${nW + 30},${sy - 58}" stroke="${L.topL}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
        ${[-1, 1].map(sd => `<path d="M${sd * 18},${sy - 4} Q${sd * 24},${sy + 70} ${sd * 16},${sy + 130}" stroke="#FFFFFF" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="${sd * 16 - 5}" y="${sy + 126}" width="10" height="20" rx="4" fill="${P.purple}"/>`).join('')}
        <path d="M-90,${sy + 250} L90,${sy + 250} L110,${sy + 360} L-110,${sy + 360} Z" fill="${L.topD}" opacity=".5"/>`;
    } else if (L.top === 'kurta') {
      s += `<path d="M${-nW - 4},${sy - 46} Q0,${sy - 26} ${nW + 4},${sy - 46} L${nW + 2},${sy - 36} Q0,${sy - 14} ${-nW - 2},${sy - 36} Z" fill="${L.topD}"/>
        <path d="M0,${sy - 18} L0,${sy + 110}" stroke="${L.topD}" stroke-width="5"/>
        <path d="M-16,${sy - 22} L-16,${sy + 118} Q0,${sy + 130} 16,${sy + 118} L16,${sy - 22}" stroke="${P.gold}" stroke-width="3" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4].map(i => `<circle cx="${-26 - i * 6}" cy="${sy - 6 + i * 26}" r="3" fill="${P.peachL}"/><circle cx="${26 + i * 6}" cy="${sy - 6 + i * 26}" r="3" fill="${P.peachL}"/>`).join('')}
        ${[0, 1, 2].map(i => `<circle cx="${(i - 1) * 60}" cy="${sy + 220}" r="10" fill="none" stroke="${L.topL}" stroke-width="3"/>`).join('')}`;
    } else if (L.top === 'denim') {
      s += `<path d="M${-nW - 4},${sy - 48} Q0,${sy - 18} ${nW + 4},${sy - 48} L${nW - 6},${sy + 40} Q0,${sy + 60} ${-nW + 6},${sy + 40} Z" fill="${L.tee}"/>
        <path d="M${-nW + 2},${sy - 46} Q0,${sy - 8} ${nW - 2},${sy - 46}" stroke="#E9DFD6" stroke-width="5" fill="none"/>
        ${[-1, 1].map(sd => `<path d="M${sd * (nW + 6)},${sy - 52} L${sd * (nW + 46)},${sy - 20} L${sd * (nW + 18)},${sy + 64} L${sd * 22},${sy + 260} L${sd * (nW - 2)},${sy - 40} Z" fill="${L.topC}" stroke="${L.topD}" stroke-width="4" stroke-linejoin="round"/>
          <rect x="${sd > 0 ? 44 : -104}" y="${sy + 96}" width="60" height="54" rx="6" fill="none" stroke="${L.topD}" stroke-width="4"/><path d="M${sd > 0 ? 44 : -104},${sy + 110} L${sd > 0 ? 104 : -44},${sy + 110}" stroke="${P.peachL}" stroke-width="2" stroke-dasharray="4 4"/><circle cx="${sd * 74}" cy="${sy + 124}" r="5" fill="${P.gold}"/>`).join('')}
        <path d="M22,${sy + 260} L22,${hem}" stroke="${L.topD}" stroke-width="4"/>${[0, 1, 2].filter(i => sy + 300 + i * 80 < hem - 10).map(i => `<circle cx="30" cy="${sy + 300 + i * 80}" r="6" fill="${P.gold}"/>`).join('')}
        <path d="M${-W + 10},${sy + 40} L${-W + 30},${hem} M${W - 10},${sy + 40} L${W - 30},${hem}" stroke="${P.peachL}" stroke-width="2" stroke-dasharray="5 5" opacity=".7"/>`;
    } else {
      s += `<path d="M${-nW - 6},${sy - 44} Q0,${sy + (L.kid ? -6 : 2)} ${nW + 6},${sy - 44}" stroke="${L.topD}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
      if (L.top === 'kidtee') s += `<circle cx="0" cy="${sy + 70}" r="22" fill="${P.pink}" opacity=".85"/>${heart(0, sy + 74, 0.8, '#fff')}`;
    }
    if (o.straps) s += [-1, 1].map(sd => `<path d="M${sd * (nW + 18)},${sy - 46} C${sd * (nW + 26)},${sy + 40} ${sd * (W - 14)},${sy + 90} ${sd * (W - 18)},${sy + 150}" stroke="${P.pink}" stroke-width="${L.kid ? 18 : 24}" fill="none" stroke-linecap="round"/>`).join('');
    if (o.tote) s += `<path d="M${W - 50},${sy - 42} C${W - 20},${sy + 60} ${W + 10},${sy + 200} ${W + 20},${B.hipY - 40}" stroke="#E6D5BA" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M${W - 50},${sy - 42} C${W - 20},${sy + 60} ${W + 10},${sy + 200} ${W + 20},${B.hipY - 40}" stroke="#CDB894" stroke-width="3" fill="none" stroke-dasharray="6 6"/>`;
    if (o.glow) s += `<ellipse cx="0" cy="${sy + 120}" rx="${W}" ry="160" fill="${o.glow}" opacity="${f3((o.glowK ?? 1) * 0.18)}"/>`;
    return s;
  }

  /* ---------------- legs ---------------- */
  function legs(t, L, o, B) {
    const pose = o.legs || 'stand';
    const lw = B.legW, hipY = B.hipY - 16;
    let s = '';
    const leg = (hx, kx, ky, ax, ay) => `<path d="M${f1(hx)},${f1(hipY)} L${f1(kx)},${f1(ky)} L${f1(ax)},${f1(ay)}" stroke="${L.pants}" stroke-width="${lw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const shoe = (x, y, sd, bare, sc = 1) => {
      if (bare) return `<ellipse cx="${f1(x + sd * 6)}" cy="${f1(y + 2)}" rx="${f1(22 * sc)}" ry="${f1(12 * sc)}" fill="${L.skin}"/><path d="M${f1(x + sd * 14)},${f1(y - 4)} l${sd * 8},0" stroke="${L.shade}" stroke-width="2" opacity=".5"/>`;
      if (L.heels) return `<path d="M${f1(x - sd * 16)},${f1(y - 10)} Q${f1(x + sd * 6)},${f1(y - 22)} ${f1(x + sd * 34)},${f1(y + 6)} L${f1(x - sd * 16)},${f1(y + 8)} Z" fill="${L.shoe}"/><path d="M${f1(x - sd * 14)},${f1(y + 2)} L${f1(x - sd * 16)},${f1(y + 22)}" stroke="${L.shoeD}" stroke-width="6" stroke-linecap="round"/>`;
      return `<ellipse cx="${f1(x + sd * 8)}" cy="${f1(y)}" rx="${f1(34 * sc)}" ry="${f1(19 * sc)}" fill="${L.shoe}"/><path d="M${f1(x + sd * 8 - 32 * sc)},${f1(y + 8)} L${f1(x + sd * 8 + 32 * sc)},${f1(y + 8)}" stroke="${L.shoeD}" stroke-width="6" stroke-linecap="round"/>`;
    };
    const bareL = o.bareL, bareR = o.bareR;
    if (pose === 'walk') {
      const ph = t * (o.walkSpeed || 7.4) + (o.seed || 0);
      [-1, 1].forEach((sd, i) => {
        const p = ph + (i ? Math.PI : 0);
        const lift = Math.max(0, Math.sin(p)), fwd = Math.cos(p);
        const ax = sd * 44, ay = B.footY - 30 - lift * 64 + fwd * 14;
        const kx = sd * (44 + lift * 8), ky = B.kneeY - lift * 36 + fwd * 8;
        s += leg(sd * 46, kx, ky, ax, ay) + shoe(ax, ay + 24, sd, sd < 0 ? bareL : bareR, 1 + fwd * 0.06);
      });
      return s;
    }
    if (pose === 'kick') { // o.kick: { side, k } k 0..1 lift amount
      [-1, 1].forEach(sd => {
        const lift = o.kick && o.kick.side === sd ? o.kick.k : 0;
        const ax = sd * (46 + lift * 40), ay = B.footY - 30 - lift * 120;
        const kx = sd * (46 + lift * 20), ky = B.kneeY - lift * 60;
        s += leg(sd * 46, kx, ky, ax, ay) + shoe(ax, ay + 24, sd, sd < 0 ? bareL : bareR);
      });
      return s;
    }
    if (pose === 'crouch') {
      // one knee up toward camera (side c), the other knee down on the floor
      const c = o.crouchSide || 1;
      s += leg(-c * 46, -c * 70, B.hipY + 150, -c * 40, B.hipY + 200);
      s += `<path d="M${c * 46},${hipY} L${c * 120},${hipY - 20}" stroke="${L.pantsD}" stroke-width="${lw + 6}" stroke-linecap="round"/>`;
      s += `<path d="M${c * 120},${hipY - 20} L${c * 134},${hipY + 170}" stroke="${L.pants}" stroke-width="${lw}" stroke-linecap="round"/><circle cx="${c * 120}" cy="${hipY - 20}" r="${lw / 2 + 2}" fill="${L.pants}"/>`;
      s += shoe(c * 140, hipY + 196, c, false);
      return s;
    }
    if (pose === 'swing') { // seated on a swing, legs forward and dangling
      const k = o.kickK || 0;
      [-1, 1].forEach(sd => {
        s += `<path d="M${sd * 36},${hipY} L${sd * 40},${hipY + 40}" stroke="${L.pants}" stroke-width="${lw + 4}" stroke-linecap="round"/>`;
        const ax = sd * 40 + k * 20, ay = hipY + 40 + 110 - k * 40;
        s += `<path d="M${sd * 40},${hipY + 40} L${f1(ax)},${f1(ay)}" stroke="${L.pants}" stroke-width="${lw}" stroke-linecap="round"/>` + shoe(ax, ay + 18, sd, false);
      });
      return s;
    }
    [-1, 1].forEach(sd => { s += leg(sd * 46, sd * 46, B.kneeY, sd * 44, B.footY - 30) + shoe(sd * 44, B.footY - 6, sd, sd < 0 ? bareL : bareR); });
    return s;
  }

  /* ---------------- arms ---------------- */
  function armSVG(L, B, sd, target, bend, kind, sc, W, shortSleeve, elbow) {
    const sx = sd * (W - 20), sy = B.shY - 4;
    // explicit elbow (foreshortened poses, phone grips) or two-bone IK
    const a = elbow ? { ex: elbow[0], ey: elbow[1], hx: target[0], hy: target[1] } : reach(sx, sy, target[0], target[1], B.l1, B.l2, bend);
    const sw = B.armW + (L.top === 'sweater' ? 12 : 0);
    let s = '';
    const ang = deg(Math.atan2(a.hy - a.ey, a.hx - a.ex));
    if (shortSleeve) {
      const mx = lerp(sx, a.ex, 0.55), my = lerp(sy, a.ey, 0.55);
      s += `<path d="M${f1(sx)},${sy} L${f1(a.ex)},${f1(a.ey)} L${f1(a.hx)},${f1(a.hy)}" stroke="${L.skin}" stroke-width="${sw - 12}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M${f1(sx)},${sy} L${f1(mx)},${f1(my)}" stroke="${L.topC}" stroke-width="${sw + 2}" fill="none" stroke-linecap="round"/>`;
    } else {
      s += `<path d="M${f1(sx)},${sy} L${f1(a.ex)},${f1(a.ey)} L${f1(a.hx)},${f1(a.hy)}" stroke="${L.topD}" stroke-width="${sw + 5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M${f1(sx)},${sy} L${f1(a.ex)},${f1(a.ey)} L${f1(a.hx)},${f1(a.hy)}" stroke="${L.topC}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      // cuff
      const cx = lerp(a.ex, a.hx, 0.86), cy = lerp(a.ey, a.hy, 0.86);
      const cuffC = L.top === 'blazer' ? L.blouse : L.topD;
      s += `<path d="M${f1(cx)},${f1(cy)} L${f1(lerp(a.ex, a.hx, 0.97))},${f1(lerp(a.ey, a.hy, 0.97))}" stroke="${cuffC}" stroke-width="${sw - 2}" stroke-linecap="round"/>`;
    }
    s += hand(a.hx, a.hy, ang, L, kind, sd < 0 ? -1 : 1, sc);
    return s;
  }

  /**
   * fig(t, look, o): one of the cast, head centre at (o.x, o.y), scale o.s.
   *   body 'bust' | 'full'; legs 'stand' | 'walk' | 'crouch' | 'kick' | 'swing'
   *   mood (see MOODS), look [dx, dy] pupils, tilt (deg), turn (-1..1), head [dx, dy]
   *   hands: hL / hR targets in figure coords (default: relaxed at the sides),
   *   kL / kR hand kinds 'rest' | 'open' | 'point'; bL / bR elbow bends
   *   mid: SVG drawn over the torso, under the arms; front: drawn over everything
   *   glow / glowK: screen light on face and chest; rim: rim-light colour
   */
  function fig(t, L, o) {
    const B = L.kid ? BODY.kid : Object.assign({}, BODY.adult, L.B || {});
    const s = o.s || 1, seed = o.seed || 1;
    const W = B.sh + (L.top === 'sweater' ? 18 : 0);
    let bob = (o.bob ?? 1) * Math.sin(t * 1.9 + seed) * 3;
    if (o.legs === 'walk') bob = -Math.abs(Math.cos(t * (o.walkSpeed || 7.4) + (o.seed || 0))) * 12;
    if (o.mood === 'laugh') bob += -Math.abs(Math.sin(t * 13 + seed)) * 5;
    const breathe = 1 + Math.sin(t * 1.9 + seed) * 0.008;
    const [hdx, hdy] = o.head || [0, 0];
    const tilt = (o.tilt || 0) + Math.sin(t * 1.3 + seed) * 1.2;
    let ws = 0;
    if (o.legs === 'walk') ws = Math.sin(t * (o.walkSpeed || 7.4) + (o.seed || 0));
    const hL = o.hL || [-W - 20 + ws * 10, B.hipY - 10 + ws * 16];
    const hR = o.hR || [W + 20 - ws * 10, B.hipY - 10 - ws * 16];
    const shortS = !!L.shortSleeve;
    const headT = `translate(${f1(hdx)},${f1(hdy + bob * 0.4)}) rotate(${f1(tilt)} 0 120)`;
    const only = o.only || 'all', P1 = only === 'all' || only === 'back', P2 = only === 'all' || only === 'head', P3 = only === 'all' || only === 'arms';
    const leanT = o.lean ? ` rotate(${f1(o.lean)} 0 ${B.hipY})` : '';
    let out = `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s})${o.flip ? ' scale(-1,1)' : ''}"><g transform="translate(0,${f1(bob)})">`;
    if (P1 && o.body === 'full') out += legs(t, L, o, B);
    out += `<g transform="translate(0,0)${leanT}">`;
    if (P1) {
    out += `<g transform="${headT}">${hairBack(t, L, o)}</g>`;
    if (o.under) out += o.under;
    // neck
    out += `<path d="M${-B.nW / 2 - 4},60 L${-B.nW / 2 - 2},${B.shY - 30} L${B.nW / 2 + 2},${B.shY - 30} L${B.nW / 2 + 4},60 Z" fill="${L.skin}"/>
      <path d="M${-B.nW / 2 - 4},70 Q0,${130 + hdy * 0.5} ${B.nW / 2 + 4},70 L${B.nW / 2 + 4},96 Q0,140 ${-B.nW / 2 - 4},96 Z" fill="${L.shade}" opacity=".55"/>`;
    out += `<g transform="translate(0,${B.shY}) scale(${breathe.toFixed(4)}) translate(0,${-B.shY})">${torso(t, L, o, B)}</g>`;
    if (L.style === 'hijab') {
      const sw = Math.sin(t * 1.4 + seed) * (2 + (o.wind || 0) * 6), hd = L.hairD || L.hair;
      out += `<g transform="${headT}"><path d="M-104,40 C-130,110 ${f1(-170 + sw)},170 ${f1(-160 + sw)},250 C-120,300 -40,330 0,336 C40,330 120,300 ${f1(160 + sw)},250 C${f1(170 + sw)},170 130,110 104,40 C80,120 40,150 0,152 C-40,150 -80,120 -104,40 Z" fill="${L.hair}"/>
        <path d="M-120,150 C-90,230 -40,280 10,300 M120,140 C100,210 70,260 30,296" stroke="${hd}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
        <path d="M-140,220 C-100,270 -50,300 0,312" stroke="${L.hairHi}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
    }
    if (L.style === 'pony') {
      const sw = Math.sin(t * 1.6 + seed) * (3 + (o.wind || 0) * 10);
      out += `<g transform="${headT}"><path d="M62,64 C96,90 118,140 ${f1(124 + sw)},220 C${f1(128 + sw)},280 ${f1(112 + sw)},330 ${f1(96 + sw)},350 C${f1(108 + sw * 0.6)},300 104,240 92,190 C84,150 66,110 46,84 Z" fill="${L.hair}"/>
        <path d="M80,110 C100,160 ${f1(110 + sw)},230 ${f1(106 + sw)},300" stroke="${L.hairHi}" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
        <ellipse cx="66" cy="84" rx="20" ry="13" transform="rotate(40 66 84)" fill="${P.purple}"/></g>`;
    }
    if (L.style === 'braid1') {
      const sw = Math.sin(t * 1.5 + seed) * (3 + (o.wind || 0) * 8);
      let b = '';
      const pts = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([-84 - 26 * Math.sin(u * 3.1) + 34 * u + sw * u, 50 + u * 400]); }
      for (let i = 0; i < 12; i++) {
        const [x, y] = pts[i], [x2, y2] = pts[i + 1], w = 30 - i * 1.2;
        const side = i % 2 ? 1 : -1;
        b += `<ellipse cx="${f1((x + x2) / 2 + side * 5)}" cy="${f1((y + y2) / 2)}" rx="${f1(w * 0.62)}" ry="${f1(24)}" transform="rotate(${side * 28} ${f1((x + x2) / 2)} ${f1((y + y2) / 2)})" fill="${L.hair}"/>`;
        b += `<path d="M${f1((x + x2) / 2 - w * 0.4)},${f1((y + y2) / 2 - 6)} q${f1(w * 0.4)},${side * 8} ${f1(w * 0.8)},0" stroke="${L.hairHi}" stroke-width="3" fill="none" opacity=".6"/>`;
      }
      const [ex, ey] = pts[12];
      b += `<rect x="${f1(ex - 12)}" y="${f1(ey - 6)}" width="24" height="14" rx="6" fill="${P.peach}"/><path d="M${f1(ex - 10)},${f1(ey + 8)} Q${f1(ex)},${f1(ey + 50)} ${f1(ex + 12)},${f1(ey + 8)} Z" fill="${L.hair}"/>`;
      out += `<g transform="${headT}"><path d="M-60,30 C-78,40 -86,60 -84,80" stroke="${L.hair}" stroke-width="30" fill="none" stroke-linecap="round"/>${b}</g>`;
    }
    if (L.style === 'braids') {
      // three braids draped over her right shoulder, in front
      for (let i = 0; i < 3; i++) {
        const sw = Math.sin(t * 1.5 + i + seed) * (3 + (o.wind || 0) * 8);
        out += `<g transform="${headT}">` + braid(`M${70 + i * 6},${30 + i * 4} C${108 + i * 8},${150} ${f1(130 + i * 10 + sw)},${250} ${f1(118 + i * 12 + sw)},${430 + i * 14}`, L.hair, L.hairHi, 15) + '</g>';
      }
    }
    }
    if (P2) out += `<g transform="${headT}">${headSVG(t, L, o)}</g>`;
    if (P3) {
      if (o.mid) out += o.mid;
      if (o.armL !== false) out += armSVG(L, B, -1, hL, o.bL ?? 1, o.kL || 'rest', o.hs || 1, W, shortS, o.eL);
      if (o.armR !== false) out += armSVG(L, B, 1, hR, o.bR ?? -1, o.kR || 'rest', o.hs || 1, W, shortS, o.eR);
      if (o.front) out += o.front;
    }
    out += '</g></g></g>';
    return out;
  }

  // From behind (over-the-shoulder shots): back of head, neck and shoulders.
  function figBack(t, L, o) {
    const B = L.kid ? BODY.kid : Object.assign({}, BODY.adult, L.B || {}), s = o.s || 1, seed = o.seed || 1;
    const W = B.sh + (L.top === 'sweater' ? 18 : 0);
    const bob = Math.sin(t * 1.9 + seed) * 3;
    const tilt = (o.tilt || 0) + Math.sin(t * 1.3 + seed) * 1;
    let out = `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s})"><g transform="translate(0,${f1(bob)})">`;
    out += `<path d="M${-B.nW / 2 - 6},40 L${-B.nW / 2 - 4},${B.shY - 20} L${B.nW / 2 + 4},${B.shY - 20} L${B.nW / 2 + 6},40 Z" fill="${L.shade}"/>`;
    const sy = B.shY;
    out += `<path d="M${-B.nW - 16},${sy - 40} C${-W + 30},${sy - 42} ${-W - 10},${sy - 20} ${-W - 14},${sy + 40} L${-W - 30},${sy + 700} L${W + 30},${sy + 700} L${W + 14},${sy + 40} C${W + 10},${sy - 20} ${W - 30},${sy - 42} ${B.nW + 16},${sy - 40} Z" fill="${L.topC}"/>`;
    if (L.top === 'blazer') out += `<path d="M${-B.nW - 16},${sy - 40} Q0,${sy - 10} ${B.nW + 16},${sy - 40} L${B.nW + 10},${sy - 22} Q0,${sy + 6} ${-B.nW - 10},${sy - 22} Z" fill="${L.topD}"/><path d="M0,${sy - 4} L0,${sy + 600}" stroke="${L.topD}" stroke-width="4" opacity=".6"/>`;
    if (L.top === 'sweater') out += `<path d="M${-B.nW - 14},${sy - 40} Q0,${sy - 16} ${B.nW + 14},${sy - 40}" stroke="${L.topD}" stroke-width="18" fill="none" stroke-dasharray="3 6"/>`;
    out += `<path d="M${W - 10},${sy + 10} C${W + 10},${sy + 120} ${W + 20},${sy + 400} ${W + 30},${sy + 700} L${W - 20},${sy + 700} Z" fill="${L.topD}" opacity=".5"/>`;
    out += `<g transform="rotate(${f1(tilt)} 0 120)">`;
    out += hairBack(t, L, o);
    out += [-1, 1].map(sd => `<ellipse cx="${sd * 82}" cy="12" rx="14" ry="21" fill="${L.skin}"/>`).join('');
    if (L.style === 'bob') {
      const wx = Math.sin(t * 2.2 + seed) * 2;
      out += `<path d="M-100,-20 C-106,-104 -52,-132 2,-130 C58,-132 108,-104 102,-20 L${f1(106 + wx)},96 C80,108 -80,108 ${f1(-106 + wx)},96 Z" fill="${L.hair}"/><path d="M-60,-90 C-30,-114 30,-114 60,-90" stroke="${L.hairHi}" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>`;
    } else {
      out += `<ellipse cx="0" cy="-10" rx="86" ry="104" fill="${L.hair}"/>${coils(0, -40, 70, 60, 14, L.hairHi, 4, 0.4)}`;
    }
    if (L.ear === 'hoop') out += earring(L, -1, t, seed) + earring(L, 1, t, seed);
    out += '</g></g></g>';
    return out;
  }
  /* ================================================================== *
   * PROPS
   * ================================================================== */
  const SCR = {
    curriculum: 'assets/01-curriculum.jpg', candles: 'assets/02-candles-vs-structure.jpg', dots: 'assets/03-dots-to-structure.jpg',
    dayli: 'assets/04-dayli-says.jpg', complete: 'assets/05-lesson-complete.jpg', video: 'assets/06-lesson-video.jpg',
  };
  const img = (href, x, y, w, h, par = 'xMidYMid slice') => `<image href="${href}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" preserveAspectRatio="${par}"/>`;

  /**
   * Laptop facing the camera. (x, y) = centre of the hinge line, w = screen width.
   *   open 0..1 lid angle (screen grows up from the hinge), on 0..1 screen brightness
   *   screen: asset key; inner(sw, sh): extra SVG drawn over the screen in screen-local coords
   *   zoom: Ken Burns zoom of the screen image; pan [x, y] in 0..1
   */
  function laptop(x, y, w, o = {}) {
    const open = o.open ?? 1, on = o.on ?? 1;
    const h = w * 0.625, bz = w * 0.028;
    const lidH = (h + bz * 2.6) * open;
    const sw = w, sh = h;
    let s = '';
    // soft shadow on the table
    if (o.shadow !== false) s += `<ellipse cx="${f1(x)}" cy="${f1(y + w * 0.1)}" rx="${f1(w * 0.68)}" ry="${f1(w * 0.07)}" fill="#2C1810" opacity=".18" filter="url(#fB16)"/>`;
    // base / keyboard deck
    s += `<path d="M${f1(x - w * 0.56)},${f1(y)} L${f1(x + w * 0.56)},${f1(y)} L${f1(x + w * 0.64)},${f1(y + w * 0.075)} Q${f1(x + w * 0.64)},${f1(y + w * 0.09)} ${f1(x + w * 0.6)},${f1(y + w * 0.09)} L${f1(x - w * 0.6)},${f1(y + w * 0.09)} Q${f1(x - w * 0.64)},${f1(y + w * 0.09)} ${f1(x - w * 0.64)},${f1(y + w * 0.075)} Z" fill="${o.body || '#E4DAD2'}"/>
      <path d="M${f1(x - w * 0.62)},${f1(y + w * 0.075)} L${f1(x + w * 0.62)},${f1(y + w * 0.075)}" stroke="#C7B9AE" stroke-width="${f1(w * 0.008)}"/>
      <rect x="${f1(x - w * 0.08)}" y="${f1(y + w * 0.004)}" width="${f1(w * 0.16)}" height="${f1(w * 0.012)}" rx="${f1(w * 0.006)}" fill="#C7B9AE"/>`;
    if (open <= 0.01) return s;
    const top = y - lidH;
    if (o.glow !== false && on > 0) s += `<rect x="${f1(x - w * 0.62)}" y="${f1(top - w * 0.1)}" width="${f1(w * 1.24)}" height="${f1(lidH + w * 0.16)}" rx="${f1(w * 0.12)}" fill="${o.glowC || '#FFF3E6'}" opacity="${f3(0.75 * on * open)}" filter="url(#fB30)"/>`;
    s += `<rect x="${f1(x - w / 2 - bz)}" y="${f1(top)}" width="${f1(w + bz * 2)}" height="${f1(lidH)}" rx="${f1(bz * 1.3)}" fill="#2A211E"/>`;
    s += `<rect x="${f1(x - w / 2 - bz + 2)}" y="${f1(top + 2)}" width="${f1(w + bz * 2 - 4)}" height="${f1(lidH - 4)}" rx="${f1(bz * 1.2)}" fill="none" stroke="#4A3C36" stroke-width="2"/>`;
    if (open > 0.25) {
      const id = uid('scr');
      const sy = top + bz * 1.4, sH = Math.max(0, lidH - bz * 2.6);
      const z = o.zoom || 1, [px, py] = o.pan || [0.5, 0.5];
      const iw = sw * z, ih = sh * z;
      const ix = x - w / 2 - (iw - sw) * px, iy = sy - (ih - sH) * py;
      s += `<clipPath id="${id}"><rect x="${f1(x - w / 2)}" y="${f1(sy)}" width="${f1(sw)}" height="${f1(sH)}" rx="${f1(bz * 0.3)}"/></clipPath>`;
      s += `<g clip-path="url(#${id})"><rect x="${f1(x - w / 2)}" y="${f1(sy)}" width="${f1(sw)}" height="${f1(sH)}" fill="#120E10"/>`;
      if (o.screen) s += `<g opacity="${f3(on)}">${img(SCR[o.screen], ix, iy, iw, ih, o.par || 'xMidYMid slice')}${o.inner ? `<g transform="translate(${f1(x - w / 2)},${f1(sy)})">${o.inner(sw, sH)}</g>` : ''}</g>`;
      s += `<rect x="${f1(x - w / 2)}" y="${f1(sy)}" width="${f1(sw)}" height="${f1(sH)}" fill="url(#gShine)"/>`;
      s += `</g>`;
      s += `<circle cx="${f1(x)}" cy="${f1(top + bz * 0.7)}" r="${f1(bz * 0.18)}" fill="#4A3C36"/>`;
    }
    return s;
  }
  // Back of a laptop lid seen from the front (she sits behind it). (x, y) hinge centre.
  function laptopBack(x, y, w, o = {}) {
    const open = o.open ?? 1, on = o.on ?? 1;
    const h = w * 0.66 * open;
    let s = '';
    if (open < 0.04) {
      return s + `<rect x="${f1(x - w / 2)}" y="${f1(y - w * 0.035)}" width="${f1(w)}" height="${f1(w * 0.035)}" rx="${f1(w * 0.012)}" fill="#D9CEC6"/><rect x="${f1(x - w / 2)}" y="${f1(y - w * 0.035)}" width="${f1(w)}" height="${f1(w * 0.012)}" rx="4" fill="#F0E8E2"/>`;
    }
    if (on > 0) s += `<ellipse cx="${f1(x)}" cy="${f1(y - h - 10)}" rx="${f1(w * 0.5)}" ry="${f1(w * 0.12)}" fill="#F2FFFC" opacity="${f3(on * 0.55)}" filter="url(#fB30)"/>`;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.03)}" fill="url(#gLid)"/>`;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(Math.min(h, 6))}" rx="3" fill="${on > 0 ? '#FFFFFF' : '#F6F0EA'}" opacity="${f3(0.5 + on * 0.5)}"/>`;
    if (open > 0.5) s += `<g transform="translate(${f1(x)},${f1(y - h * 0.52)}) scale(${(w / 600).toFixed(3)},${(w / 600 * open).toFixed(3)})"><circle r="30" fill="${P.pink}"/>${heart(0, 4, 0.9, '#fff')}<circle cx="70" cy="40" r="20" fill="${P.teal}"/>${star(70, 40, 11, '#fff')}</g>`;
    s += `<rect x="${f1(x - w * 0.53)}" y="${f1(y - 6)}" width="${f1(w * 1.06)}" height="14" rx="7" fill="#CFC3BA"/>`;
    return s;
  }
  function mug(x, y, sc, col = P.pink, o = {}) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <path d="M34,-46 C66,-46 66,0 34,-4" stroke="${o.dark || '#D9687F'}" stroke-width="11" fill="none"/>
      <path d="M-40,-66 L40,-66 L36,10 Q34,26 18,26 L-18,26 Q-34,26 -36,10 Z" fill="${col}"/>
      <ellipse cx="0" cy="-66" rx="40" ry="9" fill="${o.rim || '#FDE8ED'}"/><ellipse cx="0" cy="-65" rx="33" ry="6" fill="${o.drink || '#8A5A3C'}"/>
      <path d="M-26,-50 L-24,4" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      ${o.heart !== false ? heart(4, -22, 0.7, '#fff', 0.9) : ''}</g>`;
    if (o.steam) s += steam(o.t || 0, x, y - 70 * sc, sc * 0.9, 0.6);
    return s;
  }
  // Window with a sky inside (x, y, w, h); sky(x,y,w,h) draws the view.
  function windowFrame(x, y, w, h, view, o = {}) {
    const id = uid('win'), fr = o.frame || '#FFFFFF';
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx || 10}"/></clipPath>
      <g clip-path="url(#${id})">${view}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx || 10}" fill="none" stroke="${fr}" stroke-width="${o.sw || 22}"/>
      ${o.cross !== false ? `<path d="M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.45} L${x + w},${y + h * 0.45}" stroke="${fr}" stroke-width="${(o.sw || 22) * 0.6}"/>` : ''}
      ${o.sill !== false ? `<rect x="${x - 26}" y="${y + h - 4}" width="${w + 52}" height="26" rx="8" fill="${fr}"/>` : ''}`;
  }
  function plant(x, y, sc, col = '#7FAF8A', pot = P.peach) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">`;
    for (let i = 0; i < 7; i++) {
      const a = -150 + i * 20;
      s += `<path d="M0,-40 Q${f1(Math.cos(rad(a)) * 50)},${f1(-40 + Math.sin(rad(a)) * 70)} ${f1(Math.cos(rad(a)) * 90)},${f1(-40 + Math.sin(rad(a)) * 110)}" stroke="${col}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
    }
    s += `<path d="M-46,-46 L46,-46 L38,30 Q36,40 26,40 L-26,40 Q-36,40 -38,30 Z" fill="${pot}"/></g>`;
    return s;
  }
  function tree(x, y, sc, cols, t = 0, seed = 0) {
    const sw = Math.sin(t * 0.9 + seed) * 3;
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><path d="M-16,0 L-10,-260 L10,-260 L16,0 Z" fill="#8A6248"/>`;
    s += `<g transform="rotate(${f1(sw)} 0 -260)">`;
    [[0, -420, 170, 0], [-110, -330, 120, 1], [110, -340, 125, 2], [-50, -520, 120, 1], [60, -500, 120, 0]].forEach(([cx, cy, r, c]) => {
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cols[c]}"/>`;
    });
    s += `<circle cx="-40" cy="-470" r="70" fill="${cols[3] || cols[2]}" opacity=".6"/></g></g>`;
    return s;
  }
  function stringLights(t, x0, x1, y, sag, n, seed = 0) {
    let d = `M${x0},${y}`, b = '';
    const step = (x1 - x0) / n;
    for (let i = 1; i <= n; i++) d += ` Q${f1(x0 + step * (i - 0.5))},${f1(y + sag)} ${f1(x0 + step * i)},${y}`;
    for (let i = 0; i < n; i++) for (let j = 1; j <= 2; j++) {
      const u = j / 3, bx = x0 + step * (i + u), by = y + 4 * sag * u * (1 - u) * 0.5 + sag * 0.5 * (1 - Math.pow(2 * u - 1, 2)) * 0.5;
      const on = 0.6 + 0.4 * Math.sin(t * 2.5 + i * 1.3 + j + seed);
      b += `<circle cx="${f1(bx)}" cy="${f1(by + 12)}" r="22" fill="url(#gWarm)" opacity="${f3(on * 0.7)}"/><circle cx="${f1(bx)}" cy="${f1(by + 12)}" r="6" fill="#FFF0C8" opacity="${f3(on)}"/>`;
    }
    return `<path d="${d}" stroke="#5A4036" stroke-width="2.5" fill="none" opacity=".6"/>${b}`;
  }

  /* ================================================================== *
   * CAST SHEET (waitlist.html?cast=1)
   * ================================================================== */
  function castSheet(t) {
    UID = 0;
    let s = DEFS + `<rect width="1080" height="1920" fill="#FFF6F0"/>`;
    const moods = ['smile', 'grin', 'laugh', 'curious', 'soft', 'bliss'];
    ORDER.forEach((k, i) => {
      const x = 180 + (i % 3) * 360, y = 330 + Math.floor(i / 3) * 560;
      s += fig(t, CAST[k], { x, y, s: 0.82, seed: i + 1, cut: 520, mood: 'smile' });
      s += txt(x, y + 420, NAMES[k], 40, P.dark, { f: PF });
    });
    ORDER.forEach((k, i) => {
      s += fig(t, CAST[k], { x: 100 + i * 176, y: 1500, s: 0.42, seed: i + 7, mood: moods[i], cut: 600 });
    });
    return s;
  }

  /* ================================================================== *
   * SHARED PIECES
   * ================================================================== */
  const LOGO_SRC = '../../shared/img/aghf-logo.png';
  const loc = (fx, fy, fs, gx, gy) => [(gx - fx) / fs, (gy - fy) / fs];

  // Pink brand splash: blooms breathing in from the corners, rings, drifting twinkles.
  function pinkMesh(tt, o = {}) {
    let s = `<rect width="1080" height="1920" fill="${P.pink}"/>`;
    [[1080, 0, 'gTealB', 1150, 0], [0, 1920, 'gPeachB', 1250, 1], [0, 0, 'gPk', 820, 2], [1080, 1920, 'gPurpleB', 940, 3], [540, 960, 'gWhite', 640, 4]].forEach(([x, y, g, R, i]) => {
      const grow = o.grow ? 0.1 + 0.9 * ease((tt - i * 0.1) / 1.2) : 1;
      const r = R * grow * (1 + 0.06 * Math.sin(tt * 1.2 + i * 2));
      s += `<circle cx="${f1(x + Math.sin(tt * 0.6 + i) * 40)}" cy="${f1(y + Math.cos(tt * 0.5 + i) * 40)}" r="${f1(r)}" fill="url(#${g})" opacity="${i === 4 ? 0.22 : i === 3 ? 0.45 : 0.75}"/>`;
    });
    if (o.rings !== false) [[1080, 0], [0, 1920]].forEach(([x, y], ci) => {
      for (let j = 0; j < 3; j++) {
        const ph = (tt * 0.45 + j / 3 + ci * 0.17) % 1;
        s += `<circle cx="${x}" cy="${y}" r="${f1(160 + ph * 1500)}" fill="none" stroke="${P.cream}" stroke-width="${f1(10 - ph * 7)}" opacity="${f3((1 - ph) * 0.26)}"/>`;
      }
    });
    for (let i = 0; i < 16; i++) {
      const x = 40 + hash(i) * 900, sp = 26 + hash(i + 9) * 30;
      const y = 1700 - ((tt * sp + hash(i + 3) * 1600) % 1600);
      s += star(x, y, 7 + hash(i + 5) * 10, i % 3 ? P.cream : P.peachL, f3(0.65 * (0.4 + 0.6 * Math.abs(Math.sin(tt * 2 + i)))), tt * 30 + i * 20);
    }
    return s;
  }
  function creamMesh(t) {
    return `<rect width="1080" height="1920" fill="${P.cream}"/>
      ${glowC(80 + Math.sin(t * 0.5) * 60, 260 + Math.cos(t * 0.4) * 50, 760, 'gPk', 0.6)}
      ${glowC(1060 + Math.cos(t * 0.45) * 50, 820 + Math.sin(t * 0.35) * 70, 700, 'gTl', 0.5)}
      ${glowC(300 + Math.sin(t * 0.4 + 1) * 70, 1800 + Math.cos(t * 0.5) * 40, 820, 'gPc', 0.5)}
      ${glowC(900, 1700, 500, 'gPu', 0.3)}`;
  }
  function twinkles(t, n, seed, box, cols, o = {}) {
    const [x0, y0, w, h] = box;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + hash(i + seed) * w + Math.sin(t * 0.8 + i) * 12;
      const y = y0 + h - ((t * (o.sp || 40) * (0.5 + hash(i + seed + 4)) + hash(i * 3 + seed) * h) % h);
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.2 + i * 1.7));
      s += star(x, y, (o.r || 9) * (0.6 + hash(i + 2) * 0.9) * (0.7 + 0.3 * tw), cols[i % cols.length], f3((o.op || 0.85) * tw), t * 40 + i * 30);
    }
    return s;
  }

  /**
   * The glowing door. Arched, hinged on the left; (cx, by) = bottom centre.
   * open 0..1 swings the panel in, gk 0..1 light intensity.
   */
  function door(t, cx, by, w, h, open, gk, o = {}) {
    const x0 = cx - w / 2, top = by - h, r = w / 2;
    const arch = `M${f1(x0)},${f1(by)} L${f1(x0)},${f1(top + r)} A${f1(r)},${f1(r)} 0 0,1 ${f1(x0 + w)},${f1(top + r)} L${f1(x0 + w)},${f1(by)} Z`;
    const pw = w * (1 - 0.9 * open);
    const crackX = x0 + pw;
    const pulse = 0.9 + 0.1 * Math.sin(t * 3.1);
    let s = '';
    // halo and floor
    s += `<ellipse cx="${f1(cx)}" cy="${f1(by + 8)}" rx="${f1(w * 0.95)}" ry="${f1(w * 0.12)}" fill="#C85E78" opacity=".28" filter="url(#fB16)"/>`;
    s += screenBlend(glowE(cx, by - h * 0.5, w * 1.25, h * 0.78, 'gWhite', 0.32 * gk * pulse) + glowE(cx, by - h * 0.45, w, h * 0.65, 'gPc', 0.4 * gk));
    // light rays fanning out of the opening
    const rayN = 9;
    let rays = '';
    for (let i = 0; i < rayN; i++) {
      const a = -80 + i * 20 + Math.sin(t * 0.7 + i) * 4;
      const len = h * (0.9 + 0.3 * hash(i + 4)) * (0.55 + 0.45 * Math.sin(t * 1.3 + i * 1.9) ** 2);
      const ox = (crackX + x0 + w) / 2, oy = by - h * 0.5;
      const ax = ox + Math.cos(rad(a - 4)) * len, ay = oy + Math.sin(rad(a - 4)) * len, bx = ox + Math.cos(rad(a + 4)) * len, by2 = oy + Math.sin(rad(a + 4)) * len;
      rays += `<path d="M${f1(ox)},${f1(oy)} L${f1(ax)},${f1(ay)} L${f1(bx)},${f1(by2)} Z" fill="#FFF4E6" opacity="${f3(0.16 * gk * (0.3 + open * 1.2))}"/>`;
    }
    s += screenBlend(`<g filter="url(#fB16)">${rays}</g>`);
    // floor spill through the gap
    const gap = x0 + w - crackX;
    s += screenBlend(`<path d="M${f1(crackX)},${f1(by)} L${f1(x0 + w)},${f1(by)} L${f1(x0 + w + gap * 2.2 + 120)},${f1(by + 520)} L${f1(crackX - 80 - gap * 1.4)},${f1(by + 520)} Z" fill="#FFF1E2" opacity="${f3(0.55 * gk)}" filter="url(#fB16)"/>`);
    const id = uid('dr');
    s += `<clipPath id="${id}"><path d="${arch}"/></clipPath><g clip-path="url(#${id})">
      <rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" fill="#FFF3EA"/>
      ${glowC(cx + w * 0.1, by - h * 0.45, h * 0.6, 'gPc', 0.55)}${glowC(cx, by - h * 0.5, h * 0.42, 'gWhite', 1)}
      ${o.inside ? o.inside : ''}`;
    // panel, hinged left, swinging in
    const lift = open * h * 0.03;
    s += `<path d="M${f1(x0)},${f1(top - 10)} L${f1(crackX)},${f1(top - 10 + lift)} L${f1(crackX)},${f1(by - lift * 0.6)} L${f1(x0)},${f1(by)} Z" fill="#E66F8A"/>`;
    if (pw > 40) {
      const ix = x0 + pw * 0.14, iw = pw * 0.72;
      s += `<rect x="${f1(ix)}" y="${f1(top + r * 0.55)}" width="${f1(iw)}" height="${f1(h * 0.3)}" rx="${f1(iw * 0.5)}" fill="none" stroke="#F49AAE" stroke-width="6"/>
        <rect x="${f1(ix)}" y="${f1(top + r * 0.55 + h * 0.36)}" width="${f1(iw)}" height="${f1(h * 0.34)}" rx="16" fill="none" stroke="#F49AAE" stroke-width="6"/>
        <circle cx="${f1(crackX - pw * 0.12)}" cy="${f1(by - h * 0.44)}" r="${f1(Math.max(5, w * 0.03))}" fill="${P.gold}"/>`;
      s += `<path d="M${f1(crackX - 3)},${f1(top)} L${f1(crackX - 3)},${f1(by)}" stroke="#FFE7EC" stroke-width="5" opacity=".7"/>`;
    }
    s += `</g>`;
    // bright crack line
    s += screenBlend(`<path d="M${f1(crackX + 2)},${f1(top + 30)} L${f1(crackX + 2)},${f1(by)}" stroke="#FFFFFF" stroke-width="${f1(14 + 10 * open)}" opacity="${f3(0.8 * gk)}" filter="url(#fB8)"/>`);
    // glowing outline
    s += `<path d="${arch}" fill="none" stroke="#FFF1E4" stroke-width="22" opacity="${f3(0.75 * gk * pulse)}" filter="url(#fB8)"/><path d="${arch}" fill="none" stroke="${P.cream}" stroke-width="8"/>`;
    // sparkles drifting out of the gap
    s += twinkles(t, 10, 17, [crackX - 40, by - h * 0.95, gap + 160, h], [P.cream, P.peachL, '#fff'], { sp: 60, r: 10, op: gk });
    return s;
  }

  /* ================================================================== *
   * EMOJI, BUBBLES, CAMERA HELPERS
   * ================================================================== */
  const EMO = /(\p{Extended_Pictographic}️?)/gu;
  const emo = s => s.replace(EMO, '<tspan font-family="Noto Color Emoji">$1</tspan>');
  // Where a scene point lands on screen under cam(cx, cy, z, inner, dx, dy).
  const camPt = (cx, cy, z, dx, dy, p) => [cx + dx + (p[0] - cx) * z, cy + dy + (p[1] - cy) * z];
  const camAt = (C, inner) => cam(C.cx, C.cy, C.z, inner, C.dx || 0, C.dy || 0);
  const camP = (C, p) => camPt(C.cx, C.cy, C.z, C.dx || 0, C.dy || 0, p);
  // A figure-local point to global.
  const gl = (fx, fy, fs, p) => [fx + p[0] * fs, fy + p[1] * fs];

  /**
   * Speech bubble that pops out of its tail point. (x, y) = bubble centre,
   * o.tail = [x, y] tip of the tail (below the bubble). Drawn in screen space.
   */
  function say(t, at, x, y, lines, o = {}) {
    const k = back(seg(t, at, at + 0.38));
    const out = o.out != null ? 1 - io(seg(t, o.out, o.out + 0.22)) : 1;
    if (k <= 0 || out <= 0) return '';
    const size = o.size || 42, lh = size * 1.3;
    const wmax = Math.max(...lines.map(l => measure(plain(l), size, DM, 500)));
    const bw = wmax + 76, bh = lines.length * lh + 42;
    const bx = x - bw / 2, by = y - bh / 2;
    const [tx, ty] = o.tail || [x, by + bh + 50];
    const baseX = bx + 60 + clamp((tx - bx - 60) / Math.max(1, bw - 120)) * (bw - 120);
    const fill = o.fill || '#FFFFFF', col = o.col || P.dark;
    let s = `<rect x="${f1(bx)}" y="${f1(by + 10)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(Math.min(44, bh / 2))}" fill="${P.dark}" opacity=".16" filter="url(#fB8)"/>`;
    s += `<path d="M${f1(baseX - 30)},${f1(by + bh - 6)} Q${f1(baseX - 6)},${f1(by + bh + 14)} ${f1(tx)},${f1(ty)} Q${f1(baseX + 4)},${f1(by + bh + 4)} ${f1(baseX + 26)},${f1(by + bh - 6)} Z" fill="${fill}"/>`;
    s += `<rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" rx="${f1(Math.min(44, bh / 2))}" fill="${fill}"/>`;
    if (o.ring) s += `<rect x="${f1(bx + 8)}" y="${f1(by + 8)}" width="${f1(bw - 16)}" height="${f1(bh - 16)}" rx="${f1(Math.min(36, bh / 2 - 8))}" fill="none" stroke="${o.ring}" stroke-width="3" stroke-dasharray="7 9"/>`;
    lines.forEach((l, i) => { s += txt(x, by + 21 + lh * (i + 0.76), emo(l), size, col, { w: o.w || 500, f: o.f }); });
    const wob = Math.sin(t * 3 + x) * 1.2;
    return `<g opacity="${f3(clamp((t - at) / 0.1) * out)}" transform="translate(${f1(tx)},${f1(ty)}) rotate(${f1(wob)}) scale(${f3(k * out)}) translate(${f1(-tx)},${f1(-ty)})">${s}</g>`;
  }

  // Outgoing chat bubble being typed (pink, white text, caret), then sent up and away.
  function typeBubble(t, x, y, text, k, sendK) {
    if (k <= 0) return '';
    const n = Math.round(text.length * clamp(k));
    const chars = Array.from(text);
    const shown = chars.slice(0, Math.round(chars.length * clamp(k))).join('');
    void n;
    const size = 44, w = Math.max(120, measure(shown, size, DM, 500) + 80 + (k < 1 ? 26 : 0)), h = 96;
    const caret = k < 1 && Math.floor(t * 6) % 2 === 0;
    const fly = io(sendK), op = 1 - clamp((sendK - 0.45) / 0.55);
    if (op <= 0) return '';
    const yy = y - fly * 380, sc = 1 - 0.3 * fly;
    const L0 = -w / 2;
    let s = `<rect x="${f1(L0)}" y="${-h / 2 + 10}" width="${f1(w)}" height="${h}" rx="44" fill="${P.dark}" opacity=".18" filter="url(#fB8)"/>`;
    s += `<rect x="${f1(L0)}" y="${-h / 2}" width="${f1(w)}" height="${h}" rx="44" fill="${P.pink}"/><path d="M-14,${h / 2 - 2} L0,${h / 2 + 22} L14,${h / 2 - 2} Z" fill="${P.pink}"/>`;
    s += `<rect x="${f1(L0 + 14)}" y="${-h / 2 + 8}" width="${f1(w - 28)}" height="26" rx="13" fill="#fff" opacity=".16"/>`;
    s += txt(L0 + 40, 15, emo(shown), size, '#FFFFFF', { a: 'start', w: 500 });
    if (caret) s += `<rect x="${f1(w / 2 - 40)}" y="-24" width="5" height="48" rx="2.5" fill="#fff"/>`;
    let trail = '';
    if (fly > 0) for (let i = 0; i < 5; i++) trail += heart((i - 2) * 40 + Math.sin(i * 2 + t * 6) * 10, 60 + i * 16 + fly * 120, 0.5 + 0.1 * i, i % 2 ? P.pinkL : P.peachL, f3(op * 0.9));
    return `<g transform="translate(${f1(x)},${f1(yy)}) scale(${f3(sc * back(clamp(k * 4)))})" opacity="${f3(op)}">${trail}${s}</g>`;
  }

  /* ================================================================== *
   * PHONES HELD THE RIGHT WAY
   * ================================================================== */
  // Small phone screens are drawn in a 118 x 236 box.
  const SW = 118, SH = 236;

  // The waitlist screen. press 0..1 squashes the button, done 0..1 swaps it for the check.
  function scrJoin(o = {}) {
    const d = o.done || 0, pr = o.press || 0;
    let s = `<rect width="${SW}" height="${SH}" fill="${P.cream}"/>${glowC(20, 18, 96, 'gPk', 0.75)}${glowC(118, 150, 80, 'gTl', 0.4)}${glowC(30, 236, 90, 'gPc', 0.5)}`;
    s += `<image href="${LOGO_SRC}" x="35" y="22" width="48" height="48"/>`;
    s += txt(59, 90, 'A Girl &amp; Her Futures', 9.8, P.dark, { f: PF });
    s += txt(59, 103, 'Academy™', 9, P.pink, { f: PF, it: true, w: 400 });
    s += `<path d="M47,110 Q59,114 71,110" stroke="${P.peach}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    s += txt(59, 128, 'Doors open soon.', 8, P.muted, { w: 500 });
    if (d < 1) {
      const pulse = 1 + 0.03 * Math.sin((o.t || 0) * 6);
      s += `<g opacity="${f3(1 - d)}" transform="translate(59,190) scale(${f3((1 - 0.08 * pr) * pulse)})">
        <rect x="-50" y="-17" width="100" height="34" rx="17" fill="${P.pink}" opacity=".3" filter="url(#fB3)"/>
        <rect x="-48" y="-15" width="96" height="30" rx="15" fill="${P.pink}"/><rect x="-44" y="-12" width="88" height="10" rx="5" fill="#fff" opacity=".2"/>
        ${txt(0, 3.6, 'Join the waitlist', 9.6, '#FFFFFF', { w: 700 })}</g>`;
      if (pr > 0) s += `<circle cx="66" cy="190" r="${f1(8 + pr * 40)}" fill="#fff" opacity="${f3(0.5 * (1 - pr))}"/>`;
    }
    if (d > 0) {
      const ck = clamp(d * 1.6 - 0.2);
      s += `<g opacity="${f3(clamp(d * 2.5))}"><g transform="translate(59,158) scale(${f3(back(clamp(d * 1.4)))})"><circle r="21" fill="${P.teal}" opacity=".3"/><circle r="16" fill="${P.teal}"/>
        <path d="M-7,0 L-2,5 L8,-6" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="26" stroke-dashoffset="${f1(26 * (1 - ck))}"/></g>
        ${txt(55, 196, 'You’re on the list', 9, P.dark, { f: PF })}${star(98, 192, 4, P.peach, 1, 0)}</g>`;
      for (let i = 0; i < 8; i++) {
        const a = rad(i * 45 + 20), dd = 22 + ease(d) * 26;
        s += star(59 + Math.cos(a) * dd, 158 + Math.sin(a) * dd, 3 + (i % 3), [P.pink, P.peach, P.teal][i % 3], f3(clamp(1.3 - d)), i * 30);
      }
    }
    return s;
  }

  // The group chat squeezed into a small phone screen (a true miniature of chatUI).
  function scrChat(tc, o = {}) {
    const k = SH / 1920;
    let s = `<g transform="translate(${f1(SW / 2 - 540 * k)},0) scale(${k.toFixed(5)})">${chatUI(tc, { mini: true })}</g>`;
    if (o.kb) s += keyboard(o.kb, o.key);
    return s;
  }
  // Phone keyboard over the lower screen; key = index of the key being pressed (or -1).
  function keyboard(k, key) {
    const y0 = SH - 74 * k;
    let s = `<rect x="0" y="${f1(y0 - 18)}" width="${SW}" height="20" fill="#FFFFFF"/><rect x="6" y="${f1(y0 - 15)}" width="${SW - 30}" height="14" rx="7" fill="#F4EDE9"/><circle cx="${SW - 12}" cy="${f1(y0 - 8)}" r="7" fill="${P.pink}"/>`;
    s += `<rect x="0" y="${f1(y0)}" width="${SW}" height="80" fill="#EFE6E2"/>`;
    const rows = [10, 9, 7];
    let idx = 0;
    rows.forEach((n, r) => {
      const kw = 10, gap = 1.6, tw = n * kw + (n - 1) * gap, x0 = (SW - tw) / 2;
      for (let i = 0; i < n; i++, idx++) {
        const on = idx === key;
        s += `<rect x="${f1(x0 + i * (kw + gap))}" y="${f1(y0 + 5 + r * 17)}" width="${kw}" height="14" rx="2.5" fill="${on ? P.pinkL : '#FFFFFF'}"/>`;
      }
    });
    s += `<rect x="30" y="${f1(y0 + 57)}" width="58" height="12" rx="3" fill="#FFFFFF"/>`;
    return s;
  }
  // Screen-local centre of keyboard key i (for the thumb).
  function keyPos(i) {
    const rows = [10, 9, 7];
    let r = 0;
    while (i >= rows[r]) { i -= rows[r]; r = (r + 1) % 3; }
    const kw = 10, gap = 1.6, tw = rows[r] * kw + (rows[r] - 1) * gap, x0 = (SW - tw) / 2;
    return [x0 + i * (kw + gap) + kw / 2, SH - 74 + 12 + r * 17];
  }

  /**
   * A phone held from below. The palm cradles the bottom edge, three fingertips
   * curl round one side edge and the thumb rests low on the other edge; only
   * those tips touch the bezel, so the screen stays clear. The arm ends at the
   * returned wrist point, below the phone, and is drawn under it.
   *   o: x, y (centre, parent coords), rot, sc, side (+1 right hand, -1 left),
   *      screen (svg in a 118x236 box), glow 0..1,
   *      thumb: null | [sx, sy] screen-local point the thumb tip reaches (taps and typing)
   */
  function heldPhone(t, L, o) {
    const w = SW, h = SH, b = 9, rot = o.rot || 0, sc = o.sc || 1, side = o.side || 1;
    const R = rad(rot), id = uid('ph');
    const toP = (px, py) => [o.x + (px * Math.cos(R) - py * Math.sin(R)) * sc, o.y + (px * Math.sin(R) + py * Math.cos(R)) * sc];
    const wrist = toP(side * 4, h / 2 + b + 46);
    const sk = L.skin, sh = L.shade;
    let g = '';
    if (o.glow) g += screenBlend(glowC(0, -10, 250, 'gPk', 0.5 * o.glow) + glowC(0, -10, 130, 'gWhite', 0.32 * o.glow));
    // palm cupping the bottom edge (mostly hidden behind the phone)
    g += `<path d="M-52,${h / 2 - 20} C-64,${h / 2 + 40} -34,${h / 2 + 76} ${side * 4},${h / 2 + 72} C38,${h / 2 + 76} 64,${h / 2 + 40} 52,${h / 2 - 20} Z" fill="${sk}"/>`;
    g += `<path d="M-30,${h / 2 + 52} Q0,${h / 2 + 64} 30,${h / 2 + 52}" stroke="${sh}" stroke-width="3" fill="none" opacity=".45"/>`;
    // body + screen
    g += `<rect x="${-w / 2 - b}" y="${-h / 2 - b + 5}" width="${w + 2 * b}" height="${h + 2 * b}" rx="25" fill="${P.dark}" opacity=".25" filter="url(#fB3)"/>`;
    g += `<rect x="${-w / 2 - b}" y="${-h / 2 - b}" width="${w + 2 * b}" height="${h + 2 * b}" rx="25" fill="${o.case || '#2A211E'}"/>`;
    g += `<rect x="${-w / 2 - b + 2}" y="${-h / 2 - b + 2}" width="${w + 2 * b - 4}" height="${h + 2 * b - 4}" rx="23" fill="none" stroke="#5A4036" stroke-width="2"/>`;
    g += `<clipPath id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${-w / 2},${-h / 2})">${o.screen || scrJoin()}</g><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#gShine)"/></g>`;
    g += `<rect x="-16" y="${-h / 2 + 5}" width="32" height="9" rx="4.5" fill="#2A211E"/>`;
    // fingertips curled round the far edge: they sit on the bezel, outside the screen
    const fe = -side;
    [h / 2 - 98, h / 2 - 66, h / 2 - 34].forEach((fy, i) => {
      const x0 = fe > 0 ? w / 2 + 1 : -w / 2 - 26;
      g += `<rect x="${x0}" y="${f1(fy - 10)}" width="25" height="20" rx="10" fill="${sk}"/>`;
      g += `<path d="M${fe > 0 ? w / 2 + 9 : -w / 2 - 9},${f1(fy - 6)} l0,12" stroke="${sh}" stroke-width="2.2" opacity=".4" stroke-linecap="round"/>`;
      void i;
    });
    // thumb: resting low on the near edge, or reaching up from below to tap
    const base = o.thumb ? [side * 34, h / 2 + 40] : [side * (w / 2 + 16), h / 2 + 26];
    let tip = o.thumb ? [o.thumb[0] - w / 2, o.thumb[1] - h / 2] : [side * (w / 2 + 1), h / 2 - 30];
    const tw = 22;
    g += `<path d="M${f1(base[0])},${f1(base[1])} L${f1(tip[0])},${f1(tip[1])}" stroke="${sh}" stroke-width="${tw + 3}" stroke-linecap="round" opacity=".5"/>`;
    g += `<path d="M${f1(base[0])},${f1(base[1])} L${f1(tip[0])},${f1(tip[1])}" stroke="${sk}" stroke-width="${tw}" stroke-linecap="round"/>`;
    const na = Math.atan2(tip[1] - base[1], tip[0] - base[0]);
    g += `<ellipse cx="${f1(tip[0] - Math.cos(na) * 4)}" cy="${f1(tip[1] - Math.sin(na) * 4)}" rx="6" ry="4.5" transform="rotate(${f1(deg(na))} ${f1(tip[0] - Math.cos(na) * 4)} ${f1(tip[1] - Math.sin(na) * 4)})" fill="#fff" opacity=".35"/>`;
    if (o.ripple != null && o.ripple > 0 && o.ripple < 1) g += `<circle cx="${f1(tip[0])}" cy="${f1(tip[1])}" r="${f1(10 + o.ripple * 34)}" fill="none" stroke="#fff" stroke-width="${f1(5 * (1 - o.ripple))}" opacity="${f3(1 - o.ripple)}"/>`;
    return { wrist, svg: `<g transform="translate(${f1(o.x)},${f1(o.y)}) rotate(${f1(rot)}) scale(${f3(sc)})">${g}</g>`, toP };
  }
  // Fig options for a woman holding a phone with one hand (elbow tucked low, wrist below the phone).
  function phoneHand(t, L, ph, elbow) {
    const H = heldPhone(t, L, ph);
    const sd = ph.side || 1;
    return sd > 0 ? { hR: H.wrist, kR: 'none', eR: elbow, phone: H.svg, toP: H.toP } : { hL: H.wrist, kL: 'none', eL: elbow, phone: H.svg, toP: H.toP };
  }

  /* ================================================================== *
   * PROPS FOR THE NEW SCENES
   * ================================================================== */
  function pancakes(x, y, sc) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${f3(sc)})">`;
    s += `<ellipse cx="0" cy="26" rx="128" ry="32" fill="#2C1810" opacity=".1" filter="url(#fB3)"/><ellipse cx="0" cy="16" rx="122" ry="31" fill="#FFFFFF"/><ellipse cx="0" cy="14" rx="98" ry="22" fill="#F6ECE6"/>`;
    for (let i = 0; i < 3; i++) { const yy = 6 - i * 22; s += `<ellipse cx="0" cy="${yy + 7}" rx="78" ry="21" fill="#D08A3A"/><ellipse cx="0" cy="${yy}" rx="78" ry="20" fill="#F2C27A"/>`; }
    s += `<path d="M-62,-44 Q-30,-60 2,-58 Q42,-60 66,-42 Q68,-30 54,-26 L52,-4 Q48,4 44,-4 L42,-22 Q12,-18 -18,-22 L-22,2 Q-26,10 -30,2 L-32,-24 Q-64,-28 -62,-44 Z" fill="#B5652A" opacity=".88"/>`;
    s += `<path d="M-40,-50 Q-10,-58 20,-54" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>`;
    s += `<rect x="-16" y="-70" width="32" height="20" rx="5" fill="#FFF0B8"/><rect x="-16" y="-70" width="32" height="7" rx="3" fill="#fff" opacity=".6"/>`;
    [[88, 2, 1], [-94, 8, 1], [100, 20, 0], [-80, 24, 0], [70, 22, 0]].forEach(([bx, by, st]) => {
      s += st ? `<path d="M${bx - 14},${by - 8} Q${bx},${by - 16} ${bx + 14},${by - 8} Q${bx + 10},${by + 14} ${bx},${by + 18} Q${bx - 10},${by + 14} ${bx - 14},${by - 8} Z" fill="#E9606E"/><path d="M${bx - 8},${by - 12} L${bx},${by - 6} L${bx + 8},${by - 12}" stroke="#7FAF8A" stroke-width="5" fill="none" stroke-linecap="round"/>`
        : `<circle cx="${bx}" cy="${by}" r="9" fill="#5B5FA8"/><circle cx="${bx - 3}" cy="${by - 3}" r="2.5" fill="#fff" opacity=".5"/>`;
    });
    return s + '</g>';
  }
  function latte(x, y, sc, col = P.cream, t = 0, st = true) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${f3(sc)})">
      <ellipse cx="0" cy="6" rx="78" ry="16" fill="#FFFFFF"/><ellipse cx="0" cy="4" rx="58" ry="10" fill="#EFE3DA"/>
      <path d="M44,-56 C78,-56 78,-16 40,-18" stroke="${col}" stroke-width="12" fill="none"/>
      <path d="M-50,-70 L50,-70 L42,-6 Q38,6 24,6 L-24,6 Q-38,6 -42,-6 Z" fill="${col}"/>
      <path d="M-34,-60 L-30,-10" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      <ellipse cx="0" cy="-70" rx="50" ry="12" fill="#C69468"/>
      <path d="M0,-62 C-14,-70 -14,-80 -4,-78 C-1,-77 0,-75 0,-74 C0,-75 1,-77 4,-78 C14,-80 14,-70 0,-62 Z" fill="#FBEBDD"/></g>`;
    if (st) s += steam(t, x, y - 80 * sc, sc * 0.8, 0.5);
    return s;
  }
  function vase(x, y, sc, t) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${f3(sc)})">`;
    [[-24, -150, P.pink], [0, -176, P.pinkL], [26, -146, P.peach], [-6, -128, '#fff']].forEach(([fx, fy, c], i) => {
      const sw = Math.sin(t * 1.4 + i) * 4;
      s += `<path d="M0,-30 Q${f1(fx * 0.5)},${f1(fy * 0.5)} ${f1(fx + sw)},${fy}" stroke="#7FAF8A" stroke-width="5" fill="none"/>`;
      s += `<g transform="translate(${f1(fx + sw)},${fy})"><ellipse rx="16" ry="20" fill="${c}"/><path d="M-14,-6 L-6,-22 L0,-8 L6,-22 L14,-6" fill="${c}"/></g>`;
    });
    s += `<path d="M-26,-40 L26,-40 L22,10 Q20,20 10,20 L-10,20 Q-20,20 -22,10 Z" fill="#DFF3F0" opacity=".85"/><path d="M-26,-40 L26,-40" stroke="#fff" stroke-width="4"/><path d="M-14,-30 L-12,10" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>`;
    return s + '</g>';
  }
  function popcorn(x, y, sc) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${f3(sc)})">`;
    for (let i = 0; i < 18; i++) s += `<circle cx="${f1(-70 + hash(i + 3) * 140)}" cy="${f1(-34 - hash(i + 8) * 40)}" r="${f1(14 + hash(i) * 8)}" fill="${i % 4 ? '#FFF6DE' : '#F7DCA0'}"/>`;
    s += `<path d="M-92,-30 L92,-30 L74,60 Q70,74 56,74 L-56,74 Q-70,74 -74,60 Z" fill="#fff"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${-74 + i * 37},-30 L${-60 + i * 30},74" stroke="${P.pink}" stroke-width="14"/>`;
    return s + '</g>';
  }
  function fruitBowl(x, y, sc) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${f3(sc)})">`;
    [[-40, -30, '#E9606E'], [0, -40, '#F5A857'], [38, -28, '#E9606E'], [-14, -18, '#86B596'], [20, -16, '#5B5FA8']].forEach(([fx, fy, c]) => { s += `<circle cx="${fx}" cy="${fy}" r="24" fill="${c}"/><circle cx="${fx - 7}" cy="${fy - 7}" r="6" fill="#fff" opacity=".35"/>`; });
    s += `<path d="M-80,-14 Q0,-4 80,-14 Q72,52 0,56 Q-72,52 -80,-14 Z" fill="${P.tealL}"/><path d="M-80,-14 Q0,-4 80,-14" stroke="${P.teal}" stroke-width="6" fill="none"/>`;
    return s + '</g>';
  }
  function cushion(x, y, sc, col, rot = 0) {
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot}) scale(${f3(sc)})"><path d="M-90,-70 Q0,-90 90,-70 Q104,0 90,70 Q0,88 -90,70 Q-104,0 -90,-70 Z" fill="${col}"/><circle r="10" fill="#fff" opacity=".5"/><path d="M-60,-50 Q0,-62 60,-50" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/></g>`;
  }

  /* ================================================================== *
   * THE GROUP CHAT ("Girls Who Brunch 💖")
   * ================================================================== */
  const CHAT_C = { amara: '#C5832A', sofia: '#DC6E5C', mei: '#7F77DD', priya: '#3E9C90', layla: '#D9687F', emma: '#5C7FAA' };
  const CHAT_BG = { amara: '#FCE3C0', sofia: '#FDE0D8', mei: '#E8E6FB', priya: '#DDF2EF', layla: '#FDE3E8', emma: '#E1EAF5' };
  const CHAT = [
    { at: 13.2, who: 'amara', text: 'Girls!! Look 👀' },
    { at: 13.55, who: 'amara', card: true },
    { at: 15.95, who: 'mei', text: 'omg yes 😭', fx: ['😭', '😂', '💖', '✨'] },
    { at: 17.95, who: 'priya', text: 'structure, not signals?? I’m in', fx: ['🙌', '✨', '💜', '🙌'] },
    { at: 19.95, who: 'layla', text: 'finally something for us 🫶', fx: ['🫶', '💖', '✨', '🌸'] },
  ];
  // A character's face in a circle (chat avatars).
  function avatar(t, key, x, y, r, o = {}) {
    const id = uid('av'), L = CAST[key];
    const s = r / 150;
    const hy = y + r * 0.2 + (L.style === 'curls' ? r * 0.12 : 0);
    const f = fig(t, L, { x, y: hy, s: L.style === 'curls' ? s * 0.86 : s, seed: ORDER.indexOf(key) + 3, cut: 330, mood: o.mood || 'smile', bob: 0, armL: false, armR: false });
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 4)}" fill="#fff"/><clipPath id="${id}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}"/></clipPath><g clip-path="url(#${id})"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${CHAT_BG[key]}"/>${f}</g>`;
  }
  function linkCard(x, y, w, t) {
    const h = 380;
    let s = `<rect x="${x}" y="${y + 10}" width="${w}" height="${h}" rx="34" fill="${P.dark}" opacity=".14" filter="url(#fB8)"/>`;
    const id = uid('lc');
    s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34"/></clipPath><g clip-path="url(#${id})">`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFFFF"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="190" fill="${P.pink}"/>${glowC(x + w, y, 260, 'gPc', 0.8)}${glowC(x, y + 190, 220, 'gPu', 0.5)}${glowC(x + w * 0.5, y + 95, 170, 'gWhite', 0.35)}`;
    for (let i = 0; i < 6; i++) s += star(x + 40 + hash(i + 2) * (w - 80), y + 22 + hash(i + 6) * 120, 6 + hash(i) * 6, P.cream, f3(0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))), t * 40 + i * 20);
    s += `<circle cx="${x + w / 2}" cy="${y + 95}" r="74" fill="#fff" opacity=".9"/><image href="${LOGO_SRC}" x="${x + w / 2 - 70}" y="${y + 25}" width="140" height="140"/>`;
    s += txt(x + 34, y + 244, 'A Girl &amp; Her Futures Academy', fitSize('A Girl & Her Futures Academy', 38, w - 68, PF, 700), P.dark, { f: PF, a: 'start' });
    s += txt(x + 34, y + 284, 'Trading education, reimagined around HER.', fitSize('Trading education, reimagined around HER.', 26, w - 68, DM, 500), P.muted, { a: 'start', w: 500 });
    s += `<rect x="${x + 34}" y="${y + 306}" width="${w - 68}" height="52" rx="26" fill="${P.pinkP}"/>`;
    s += txt(x + w / 2, y + 341, 'Join the waitlist →', 28, P.pink, { w: 700 });
    s += '</g>';
    return { s, h };
  }
  /**
   * The full-frame chat at time tc. Messages pop in at their times, the list
   * scrolls to keep the newest one in view (above the caption band).
   */
  function chatUI(tc, o = {}) {
    let s = `<rect width="1080" height="1920" fill="#FFF5F3"/>${glowC(100 + Math.sin(tc * 0.4) * 40, 600, 700, 'gPk', 0.35)}${glowC(1000, 1300 + Math.cos(tc * 0.5) * 50, 700, 'gPc', 0.3)}${glowC(300, 1800, 600, 'gPu', 0.25)}`;
    for (let i = 0; i < 14; i++) s += heart(60 + hash(i + 40) * 960, 380 + hash(i + 50) * 1500, 0.7 + hash(i) * 0.6, P.pinkL, 0.18);
    // messages
    const top = 372, maxBottom = 1300;
    const rows = [];
    let y = top;
    CHAT.forEach((m, i) => {
      const a = io(seg(tc, m.at, m.at + 0.38));
      if (a <= 0) return;
      const me = m.who === 'amara';
      let h;
      if (m.card) h = 380 + 60 + 26; else h = (me ? 0 : 44) + 112 + 26;
      rows.push({ m, i, y, a, h, me });
      y += h * a;
    });
    // typing indicator for the next message (after the card has landed)
    const nextI = CHAT.findIndex(m => m.at > tc);
    let typing = null;
    if (nextI >= 2) {
      const prevAt = CHAT[nextI - 1].at;
      const ta = io(seg(tc, prevAt + 0.55, prevAt + 0.85));
      if (ta > 0) { typing = { who: CHAT[nextI].who, y, a: ta }; y += (44 + 112 + 26) * ta; }
    }
    const scroll = Math.max(0, y - maxBottom);
    let body = '', fxl = '';
    rows.forEach(({ m, i, y: ry, a, me }) => {
      const pop = back(seg(tc, m.at, m.at + 0.42));
      const col = CHAT_C[m.who];
      let g = '';
      let ax, ay;
      if (m.card) {
        const w = 640, x = 940 - w;
        const C = linkCard(x, ry, w, tc);
        g += C.s;
        ax = 940; ay = ry + C.h;
        // reactions from the brunch table
        const rk = back(seg(tc, 14.2, 14.55));
        if (rk > 0) g += `<g transform="translate(${x + 40},${ry + C.h + 4}) scale(${f3(rk)})"><rect x="-6" y="-24" width="176" height="56" rx="28" fill="#fff" filter="url(#fSoft)"/><rect x="-6" y="-24" width="176" height="56" rx="28" fill="none" stroke="${P.pinkP}" stroke-width="3"/>${txt(18, 16, emo('💖😍'), 34, P.dark, { a: 'start' })}${txt(126, 15, '2', 28, P.muted, { a: 'start', w: 700 })}</g>`;
      } else {
        const size = 42, tw = measure(plain(m.text), size, DM, 500) + 72, bh = 108;
        if (me) {
          const x = 940 - tw;
          g += `<rect x="${f1(x)}" y="${ry + 8}" width="${f1(tw)}" height="${bh}" rx="40" fill="${P.dark}" opacity=".1" filter="url(#fB8)"/>`;
          g += `<rect x="${f1(x)}" y="${ry}" width="${f1(tw)}" height="${bh}" rx="40" fill="${P.pink}"/><path d="M920,${ry + bh - 26} L944,${ry + bh + 6} L900,${ry + bh - 6} Z" fill="${P.pink}"/>`;
          g += txt(x + 36, ry + 69, emo(m.text), size, '#FFFFFF', { a: 'start', w: 500 });
          ax = 940; ay = ry + bh;
        } else {
          const x = 236, by = ry + 44;
          g += txt(x + 12, ry + 30, NAMES[m.who], 30, col, { a: 'start', w: 700 });
          g += `<rect x="${x}" y="${by + 8}" width="${f1(tw)}" height="${bh}" rx="40" fill="${P.dark}" opacity=".1" filter="url(#fB8)"/>`;
          g += `<rect x="${x}" y="${by}" width="${f1(tw)}" height="${bh}" rx="40" fill="#FFFFFF"/><rect x="${x}" y="${by}" width="${f1(tw)}" height="${bh}" rx="40" fill="none" stroke="${CHAT_BG[m.who]}" stroke-width="4"/>`;
          g += txt(x + 36, by + 69, emo(m.text), size, P.dark, { a: 'start', w: 500 });
          g += avatar(tc, m.who, 184, by + bh - 44, 42);
          ax = x; ay = by + bh;
        }
      }
      body += `<g transform="translate(${f1(ax)},${f1(ay)}) scale(${f3(pop)}) translate(${f1(-ax)},${f1(-ay)})" opacity="${f3(clamp(a * 3))}">${g}</g>`;
      // emoji reactions float up from new replies
      if (m.fx && !o.mini) {
        m.fx.forEach((e, j) => {
          const p = seg(tc, m.at + 0.15 + j * 0.09, m.at + 1.5 + j * 0.09);
          if (p <= 0 || p >= 1) return;
          const ex = 660 + j * 70 + Math.sin(p * 6 + j) * 30, ey = ry + 90 - ease(p) * 420;
          fxl += `<text x="${f1(ex)}" y="${f1(ey)}" font-size="${f1(64 * (0.6 + 0.4 * back(clamp(p * 3))))}" text-anchor="middle" font-family="Noto Color Emoji" opacity="${f3(1 - clamp((p - 0.6) / 0.4))}" transform="rotate(${f1((j % 2 ? 1 : -1) * 14 * p)} ${f1(ex)} ${f1(ey)})">${e}</text>`;
        });
      }
    });
    if (rows.length && !o.mini) {
      const card = rows.find(r => r.m.card);
      if (card) ['💖', '😍', '✨'].forEach((e, j) => {
        const p = seg(tc, 14.25 + j * 0.1, 15.4 + j * 0.1);
        if (p <= 0 || p >= 1) return;
        const ex = 220 + j * 70 + Math.sin(p * 5 + j) * 24, ey = card.y + 420 - ease(p) * 360;
        body += `<text x="${f1(ex)}" y="${f1(ey)}" font-size="58" text-anchor="middle" font-family="Noto Color Emoji" opacity="${f3(1 - clamp((p - 0.6) / 0.4))}">${e}</text>`;
      });
    }
    if (typing) {
      const by = typing.y + 44;
      let g = txt(248, typing.y + 30, `${NAMES[typing.who]} is typing…`, 30, CHAT_C[typing.who], { a: 'start', w: 500 });
      g += `<rect x="236" y="${by}" width="170" height="112" rx="44" fill="#FFFFFF"/>`;
      for (let d = 0; d < 3; d++) g += `<circle cx="${280 + d * 40}" cy="${f1(by + 56 - Math.max(0, Math.sin(tc * 9 - d * 0.9)) * 12)}" r="12" fill="${CHAT_C[typing.who]}" opacity=".7"/>`;
      g += avatar(tc, typing.who, 184, by + 68, 42);
      body += `<g opacity="${f3(typing.a)}">${g}</g>`;
    }
    s += `<g transform="translate(0,${f1(-scroll)})">${fxl}${body}</g>`;
    // header
    s += `<rect x="0" y="0" width="1080" height="${o.mini ? 330 : 336}" fill="#FFFFFF" opacity=".97"/><rect x="0" y="330" width="1080" height="8" fill="${P.pinkP}"/>`;
    s += `<path d="M176,214 L156,240 L176,266" stroke="${P.pink}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += avatar(tc, 'mei', 590, 52 + 140, 30) + avatar(tc, 'layla', 490, 192, 30) + avatar(tc, 'amara', 540, 186, 32);
    s += txt(540, 264, emo('Girls Who Brunch 💖'), 48, P.dark, { f: PF });
    s += txt(540, 306, 'Amara, Sofia, Mei, Priya, Layla, Emma', 25, P.muted, { w: 500 });
    return s;
  }

  /* ================================================================== *
   * BRUNCH (0:04-0:13)
   * ================================================================== */
  function cafeBG(t) {
    let w = `<rect width="1080" height="1920" fill="#F8DDCC"/>`;
    [[50, 440, 0], [590, 440, 1]].forEach(([x, wW, i]) => {
      const y = 200, hW = 900, id = uid('cw');
      const arch = `M${x},${y + hW} L${x},${y + wW / 2} A${wW / 2},${wW / 2} 0 0,1 ${x + wW},${y + wW / 2} L${x + wW},${y + hW} Z`;
      let view = `<rect x="${x}" y="${y}" width="${wW}" height="${hW}" fill="url(#gGolden)"/>` + glowC(x + wW * (i ? 0.4 : 0.9), y + 300, 420, 'gSun', 1);
      view += `<rect x="${x}" y="${y + hW - 260}" width="${wW}" height="260" fill="#EBC7AE"/>`;
      view += tree(x + (i ? 300 : 120), y + hW - 200, 0.75, ['#A9C48A', '#8FB27C', '#D1DC9E', '#F2C27E'], t, i + 1);
      for (let k = 0; k < 3; k++) {
        const px = ((t * (60 + k * 25) * (k % 2 ? -1 : 1) + k * 300 + i * 150) % 700 + 700) % 700 + x - 120;
        view += `<g filter="url(#fB8)" opacity=".55"><circle cx="${f1(px)}" cy="${y + hW - 330}" r="34" fill="#8A6A5A"/><rect x="${f1(px - 46)}" y="${y + hW - 296}" width="92" height="200" rx="40" fill="${[P.purpleL, P.tealL, P.peachL][k]}"/></g>`;
      }
      view += bokeh(t, 9, 70 + i * 13, ['#FFE9C4', '#FFF6E2', '#F9B8C6', '#B2E4DF'], [x, y + 260, wW, hW - 300], { r0: 18, r1: 34, op: 0.5, blur: 'fB8', dx: 14 });
      w += `<clipPath id="${id}"><path d="${arch}"/></clipPath><g clip-path="url(#${id})">${view}</g>`;
      w += `<path d="${arch}" fill="none" stroke="#FFF8F2" stroke-width="24"/><path d="M${x + wW / 2},${y + 30} L${x + wW / 2},${y + hW}" stroke="#FFF8F2" stroke-width="12"/><path d="M${x},${y + 500} L${x + wW},${y + 500}" stroke="#FFF8F2" stroke-width="12"/>`;
    });
    // pendant lamps
    [300, 780].forEach((x, i) => {
      const sw = Math.sin(t * 0.9 + i) * 2.5;
      w += `<g transform="rotate(${f1(sw)} ${x} 0)"><path d="M${x},0 L${x},150" stroke="#5A4036" stroke-width="4"/><path d="M${x - 64},214 Q${x},126 ${x + 64},214 Z" fill="${i ? P.teal : P.pink}"/>${glowC(x, 222, 180, 'gLamp', 0.7)}<circle cx="${x}" cy="218" r="12" fill="#FFF0C8"/></g>`;
    });
    // trailing plant on the sill line
    for (let v = 0; v < 4; v++) {
      const vx = 470 + v * 40, sw = Math.sin(t * 1.2 + v) * 8;
      let d = `M${vx},120`;
      for (let j = 1; j <= 5; j++) d += ` Q${f1(vx + (j % 2 ? 22 : -22) + sw * j / 5)},${120 + j * 60 - 30} ${f1(vx + sw * j / 5)},${120 + j * 60}`;
      w += `<path d="${d}" stroke="#6E9E78" stroke-width="5" fill="none"/>`;
      for (let j = 1; j <= 5; j++) w += `<ellipse cx="${f1(vx + sw * j / 5 + (j % 2 ? 16 : -16))}" cy="${120 + j * 60 - 18}" rx="18" ry="11" fill="${j % 2 ? '#86B596' : '#7FAF8A'}"/>`;
    }
    w += `<rect x="-10" y="1060" width="1100" height="60" fill="#EBC1AC"/>`;
    w += screenBlend(`<path d="M600,180 L1100,120 L1100,900 L240,1500 Z" fill="url(#gBeam)" opacity=".5"/>`) + motes(t, 16, 9, [120, 380, 860, 800]);
    return w;
  }
  function brunchTable(t, o = {}) {
    let s = `<path d="M-40,1118 Q540,1084 1120,1118 L1120,1270 L-40,1270 Z" fill="#FFF8F4"/>`;
    s += `<path d="M-40,1118 Q540,1084 1120,1118" stroke="#FFFFFF" stroke-width="10" fill="none"/>`;
    s += `<path d="M60,1180 Q200,1150 330,1196 M600,1160 Q760,1130 920,1180 M200,1240 Q420,1214 560,1250" stroke="#F1D6D6" stroke-width="3" fill="none" opacity=".8"/>`;
    s += `<rect x="-40" y="1262" width="1120" height="30" fill="#E9D3C8"/><rect x="-40" y="1292" width="1120" height="700" fill="#E3B9A4"/>`;
    s += vase(672, 1128, 0.78, t);
    if (!o.noCups) {
      if (!o.amaraCupUp) s += latte(430, 1150, 0.62, P.tealL, t);
      if (!o.emmaCupUp) s += latte(905, 1158, 0.62, P.peachL, t);
      if (!o.sofiaCupUp) s += latte(580, 1150, 0.58, P.pinkP, t);
    }
    s += pancakes(270, 1222, 1.0) + pancakes(540, 1250, 0.95) + pancakes(810, 1222, 1.0);
    return s;
  }
  // A cup held up in a hand (mid layer: the hand grips it).
  const heldCup = (p, col, t, sc = 0.72) => mug(p[0] - 6, p[1] + 34, sc, col, { dark: P.peach, drink: '#C69468', heart: true });

  // Brunch frame. st: per-woman overrides + table flags.
  function brunchScene(t, st) {
    let w = blurG(st.bgBlur ?? 3, cafeBG(t));
    const F = BF;
    ['sofia', 'amara', 'emma'].forEach((k, i) => {
      const [x, y, s] = F[k];
      const o = Object.assign({ x, y, s, seed: i + 2, cut: 600, mood: 'smile', rim: '#FFE3BD', lightSide: 1, hL: [-120, 470], hR: [120, 470] }, st[k] || {});
      w += fig(t, CAST[k], o);
    });
    w += brunchTable(t, st.table || {});
    if (st.over) w += st.over;
    w += blurG(10, latte(110, 1430, 1.5, P.pinkL, t, false) + pancakes(970, 1460, 1.5));
    return w;
  }
  const BF = { sofia: [540, 772, 0.76], amara: [288, 800, 0.78], emma: [792, 800, 0.78] };
  const toLoc = (k, g) => loc(BF[k][0], BF[k][1], BF[k][2], g[0], g[1]);

  // 0:04-0:09.4  Wide, laughing, cups clink; push in on Sofia's sigh; the friends trade a look.
  function shotBrunch(t) {
    const lt = t - 4;
    const C = [540, 978];
    // clink: cups rise, touch at lt 1.35, come back down
    const up = io(seg(lt, 0.85, 1.25)) * (1 - io(seg(lt, 1.75, 2.2)));
    const tap = Math.sin(Math.PI * seg(lt, 1.25, 1.45)) * 10;
    const cupA = [lerp(430, C[0] - 70, up) - tap * 0.3, lerp(1110, C[1], up)];
    const cupE = [lerp(905, C[0] + 70, up) + tap * 0.3, lerp(1118, C[1], up)];
    const cupS = [lerp(580, C[0], up), lerp(1110, C[1] - 40, up)];
    const laughA = lt < 1.0 || (lt > 1.4 && lt < 2.3), laughE = (lt > 0.2 && lt < 1.1) || (lt > 1.45 && lt < 2.4), laughS = lt < 1.2 || (lt > 1.5 && lt < 2.2);
    const sigh = seg(lt, 2.75, 3.45);
    const dream = lt > 3.45;
    const look = lt > 4.45;
    const st = {
      amara: {
        mood: look ? 'grin' : laughA ? 'laugh' : 'smile', look: look ? [9, -1] : lt > 2.5 ? [7, 2] : [4, 2], turn: look ? 0.35 : 0.15, browLift: look ? -6 : 0,
        tilt: laughA ? 6 + Math.sin(t * 7) * 2 : look ? 6 : 2, head: [0, laughA ? -4 : 0],
        hR: toLoc('amara', [cupA[0] + 30, cupA[1] + 20]), bR: 1, hL: [-90, 440], mid: '',
      },
      emma: {
        mood: look ? 'grin' : laughE ? 'laugh' : 'smile', look: look ? [-9, -1] : lt > 2.5 ? [-7, 2] : [-4, 2], turn: look ? -0.35 : -0.15, browLift: look ? -6 : 0,
        tilt: laughE ? -6 - Math.sin(t * 7) * 2 : look ? -6 : -2,
        hL: toLoc('emma', [cupE[0] - 30, cupE[1] + 20]), bL: -1, hR: [100, 450],
      },
      sofia: {
        mood: sigh > 0 && sigh < 1 ? 'exhale' : dream ? 'soft' : laughS ? 'laugh' : 'smile', look: dream ? [-3, -3] : [0, 2],
        tilt: dream ? -7 : laughS ? 4 : 0, head: [0, sigh > 0 ? 8 * Math.sin(Math.PI * Math.min(1, sigh * 1.2)) + (dream ? 4 : 0) : 0],
        hR: up > 0.01 ? toLoc('sofia', [cupS[0] + 28, cupS[1] + 22]) : [110, 470], bR: 1,
        hL: lt > 3.2 ? [lerp(-110, -24, io(seg(lt, 3.2, 3.6))), lerp(470, 150, io(seg(lt, 3.2, 3.6)))] : [-110, 470], bL: 1,
      },
      table: { amaraCupUp: true, emmaCupUp: true, sofiaCupUp: up > 0.01 },
    };
    // cups in the hands (screen order: they sit in front of the bodies, hands over them)
    let cups = heldCup(cupA, P.tealL, t) + heldCup(cupE, P.peachL, t);
    if (up > 0.01) cups += heldCup(cupS, P.pinkP, t, 0.66);
    st.over = cups;
    if (lt > 1.3 && lt < 2.2) st.over += A.sparkle(C[0], C[1] - 40, 1.3 + 4, t, P.peachL) + star(C[0], C[1] - 60, 26 * Math.sin(Math.PI * seg(lt, 1.3, 1.8)), '#fff', 0.95, t * 90);
    let w = brunchScene(t, st);
    // camera: wide drift, then a smooth push to Sofia
    const pk = io(seg(lt, 2.45, 3.15));
    const z = 1.17 + 0.07 * io(lt / 2.45) + 0.2 * pk + 0.07 * seg(lt, 3.15, 5.4);
    const Cm = { cx: 540, cy: lerp(1010, 900, pk), z, dx: Math.sin(lt * 0.6) * 8, dy: -40 };
    let s = camAt(Cm, w) + warm(0.12) + vignette(0.6);
    s += flare(860, 330, 0.5 + 0.1 * Math.sin(t * 1.3));
    // Sofia's line
    const tail = camP(Cm, [BF.sofia[0] + 40, BF.sofia[1] - 120]);
    s += say(t, 6.9, 540, 350, ['I’ve always wanted to learn', 'trading… it just feels', 'so intimidating.'], { tail, size: 42, out: 9.35 });
    return s;
  }

  // 0:09.4-0:13  Amara grins, pulls out her phone; the friends lean in; push into the screen.
  function shotShow(t) {
    const lt = t - 9.4;
    const reach = io(seg(lt, 0.3, 0.75)), rise = io(seg(lt, 0.75, 1.3));
    const lean = io(seg(lt, 1.0, 1.6));
    // phone in Amara's right hand (figure-local)
    const ph = { x: lerp(170, 196, rise), y: lerp(560, 262, rise), rot: lerp(-26, -7, rise) + Math.sin(t * 1.6) * 1.2, sc: 1.3, side: 1, glow: io(seg(lt, 1.1, 1.6)) * (0.8 + 0.2 * Math.sin(t * 4)), screen: scrChat(14.3) };
    const PH = phoneHand(t, CAST.amara, ph, [lerp(150, 150, rise), lerp(480, 470, rise)]);
    const handDown = lt < 0.75;
    const st = {
      amara: Object.assign({
        mood: lt < 1.4 ? 'grin' : 'laugh', browLift: lt < 1.6 ? -7 : -2, look: lt < 0.75 ? [7, 0] : lt < 1.5 ? [3, 8] : [6, 0], turn: 0.25, tilt: lt < 1.5 ? 4 : 7,
        hL: [-90, 440],
      }, handDown ? { hR: [lerp(120, 160, reach), lerp(470, 520, reach)], bR: 1 } : { hR: PH.hR, kR: 'none', eR: PH.eR, front: PH.phone }),
      sofia: {
        lean: -6 * lean, head: [-14 * lean, 6 * lean], look: lean > 0.3 ? [-8, 7] : [-6, 1], turn: -0.25 * lean,
        mood: lt > 1.75 && lt < 2.5 ? 'gasp' : lt >= 2.5 ? 'wow' : lt > 0.4 ? 'curious' : 'soft', tilt: -4, hL: [-110, 470], hR: [110, 470],
      },
      emma: {
        lean: -8 * lean, head: [-20 * lean, 4 * lean], look: lean > 0.3 ? [-9, 6] : [-7, 0], turn: -0.35 * lean,
        mood: lt > 1.85 ? 'grin' : lt > 0.6 ? 'curious' : 'smile', browLift: lt > 1.85 ? -5 : 0, tilt: -6, hL: [-100, 450], hR: [100, 450],
      },
      table: { amaraCupUp: false },
    };
    let w = brunchScene(t, st);
    if (handDown && reach > 0.5) void 0;
    // camera: on Amara and the phone, then a push straight into the screen
    const phG = gl(BF.amara[0], BF.amara[1], BF.amara[2], [ph.x, ph.y]);
    const pz = io(seg(lt, 2.75, 3.6));
    const Cm = { cx: lerp(540, phG[0], pz), cy: lerp(950, phG[1], pz), z: 1.18 + 0.08 * io(lt / 2.75) + pz * pz * 5.3, dx: (1 - pz) * Math.sin(lt * 0.7) * 6 + pz * (540 - phG[0]), dy: -30 * (1 - pz) + pz * (900 - phG[1]) };
    let s = camAt(Cm, w) + warm(0.12) + vignette(0.6 * (1 - pz));
    const tail = camP(Cm, [BF.amara[0] + 30, BF.amara[1] - 150]);
    s += say(t, 9.95, 440, 430, ['Wait. Look at this 👀'], { tail, size: 46, out: 12.05, w: 700 });
    if (lt > 1.2 && lt < 2.4) { const pg = camP(Cm, phG); s += A.sparkle(pg[0] + 60, pg[1] - 120, 10.6, t, P.pinkL); }
    return s;
  }

  /* ================================================================== *
   * THE GROUP CHAT AND THE CUTAWAYS (0:13-0:21)
   * ================================================================== */
  function shotChat(t) {
    // gentle drift that changes each time we come back
    const segI = t < 14.9 ? 0 : t < 16.9 ? 1 : t < 18.9 ? 2 : 3;
    const a = [13, 15.9, 17.9, 19.9][segI];
    const lt = t - a;
    const z = 1.0 + 0.035 * io(lt / 1.6) + (segI % 2 ? 0.02 : 0);
    const dy = (segI % 2 ? 1 : -1) * 10 * io(lt / 1.5);
    return cam(540, 900, z, chatUI(t), 0, dy) + bokeh(t, 8, 91, [P.pinkL, P.peachL, '#FFFFFF'], [0, 1350, 1080, 560], { r0: 20, r1: 40, op: 0.4, blur: 'fB16', dx: 18 });
  }

  // One friend reacting in her own day, typing her reply. lt 0..1.25.
  function friendTyping(t, lt, key, bg, o) {
    const L = CAST[key];
    const fx = o.fx || 540, fy = o.fy || 770, fs = o.fs || 1.0;
    const typeK = seg(lt, o.typeA ?? 0.42, o.typeB ?? 0.98);
    const typing = typeK > 0 && typeK < 1;
    const KEYS = [14, 15, 16, 17, 18, 21, 22, 23, 24, 25];
    const keyI = typing ? KEYS[Math.floor(hash(Math.floor(t * 11)) * KEYS.length)] : -1;
    const thumb = typing ? keyPos(keyI) : null;
    const ph = { x: o.px ?? 92, y: o.py ?? 300, rot: o.prot ?? -8, sc: o.psc ?? 1.22, side: 1, glow: 0.7 + 0.2 * Math.sin(t * 5), screen: scrChat(t - 0.6, { kb: io(seg(lt, 0.25, 0.45)), key: keyI }), thumb };
    const PH = phoneHand(t, L, ph, o.elbow || [176, 476]);
    const fo = Object.assign({ x: fx, y: fy, s: fs, seed: o.seed || 3, cut: 560, rim: o.rim || '#FFE3BD', lightSide: o.ls || 1, glow: '#FFE6EE', glowK: 0.6 },
      o.fig(lt), { hR: PH.hR, kR: 'none', eR: PH.eR });
    fo.front = (fo.front || '') + PH.phone;
    let w = bg(t, lt);
    w += fig(t, L, fo);
    if (o.fore) w += o.fore(t, lt);
    const z = 1.12 + 0.1 * io(lt / 1.25);
    const Cm = { cx: 540, cy: 900, z, dx: (o.dir || 1) * 10 * (1 - io(lt / 0.8)) };
    let s = camAt(Cm, w) + warm(0.1) + vignette(0.65);
    // her reply, typed above her head, then sent
    const bx = 540, by = o.by || 400;
    s += typeBubble(t, bx, by, o.text, typeK, seg(lt, (o.typeB ?? 0.98) + 0.04, (o.typeB ?? 0.98) + 0.32));
    return s;
  }

  function busBG(t) {
    let w = `<rect width="1080" height="1920" fill="#E8E2F4"/>`;
    const wy = 300, wh = 760, id = uid('bus');
    let city = `<rect x="0" y="${wy}" width="1080" height="${wh}" fill="url(#gDawn)"/>` + glowC(300, 520, 360, 'gSun', 0.9);
    const sp = t * 300;
    for (let i = 0; i < 14; i++) {
      const bw = 140 + hash(i + 3) * 120, total = 14 * 200;
      const bx = ((i * 200 - sp * 0.5) % total + total) % total - 300, bh = 200 + hash(i + 11) * 380;
      city += `<rect x="${f1(bx)}" y="${f1(wy + wh - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="${['#E7B9C4', '#D9B3DD', '#F2C6B0'][i % 3]}"/>`;
      for (let r = 0; r < Math.floor(bh / 60); r++) city += `<rect x="${f1(bx + 18)}" y="${f1(wy + wh - bh + 24 + r * 60)}" width="${f1(bw - 36)}" height="16" rx="8" fill="#FFF3E6" opacity=".7"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const total = 8 * 300, tx = ((i * 300 - sp) % total + total) % total - 200;
      city += `<g filter="url(#fB8)"><rect x="${f1(tx + 70)}" y="${wy + wh - 160}" width="22" height="160" fill="#8A6248"/><circle cx="${f1(tx + 80)}" cy="${wy + wh - 190}" r="80" fill="${i % 2 ? '#9DBE84' : '#B5CE8E'}"/></g>`;
    }
    w += `<clipPath id="${id}"><rect x="0" y="${wy}" width="1080" height="${wh}" rx="30"/></clipPath><g clip-path="url(#${id})">${blurG(4, city)}</g>`;
    w += `<rect x="-10" y="${wy - 30}" width="1100" height="40" fill="#CFC6E4"/><rect x="-10" y="${wy + wh - 10}" width="1100" height="60" fill="#CFC6E4"/><rect x="520" y="${wy}" width="24" height="${wh}" fill="#CFC6E4"/>`;
    w += `<rect x="-10" y="200" width="1100" height="16" rx="8" fill="#B8AFCF"/>`;
    [140, 760, 980].forEach((x, i) => { const a = Math.sin(t * 2.6 + i) * 8; w += `<g transform="rotate(${f1(a)} ${x} 208)"><rect x="${x - 8}" y="208" width="16" height="90" fill="${P.purple}"/><path d="M${x - 30},290 Q${x},350 ${x + 30},290 Z" fill="none" stroke="${P.purple}" stroke-width="10"/></g>`; });
    const sweep = (t * 0.9) % 1;
    w += screenBlend(`<path d="M${f1(-400 + sweep * 2200)},200 L${f1(-200 + sweep * 2200)},200 L${f1(-700 + sweep * 2200)},1900 L${f1(-900 + sweep * 2200)},1900 Z" fill="#FFF4E0" opacity=".3" filter="url(#fB16)"/>`);
    w += `<rect x="310" y="880" width="460" height="700" rx="70" fill="${P.teal}"/><rect x="340" y="900" width="400" height="80" rx="36" fill="${P.tealL}"/>`;
    return w;
  }
  function busFore(t) {
    return `<rect x="-10" y="1330" width="1100" height="620" fill="#9E95C2"/><rect x="-10" y="1330" width="1100" height="14" fill="#B8AFCF"/>` +
      `<rect x="40" y="1300" width="300" height="220" rx="50" fill="${P.teal}" opacity=".9"/><rect x="740" y="1300" width="300" height="220" rx="50" fill="${P.teal}" opacity=".9"/>`;
  }
  function shotMei(t) {
    const lt = t - 14.7;
    const sway = Math.sin(t * 2.3) * 6;
    return friendTyping(t, lt, 'mei', (tt) => busBG(tt), {
      fx: 540 + sway, seed: 3, rim: '#FFF0DC', ls: -1, text: 'omg yes 😭', bx: 880, by: 420, dir: -1,
      fig: l => ({
        mood: l < 0.5 ? 'laugh' : 'grin', look: l < 0.5 ? [0, 2] : [3, 9], tilt: l < 0.5 ? -6 + Math.sin(t * 9) * 2 : -3, head: [0, l < 0.5 ? -4 : 4], earbuds: true,
        hL: [-150, -112], bL: -1, kL: 'rest',
        under: '',
      }),
      fore: (tt) => {
        // her raised hand holds a strap from the rail
        const hx = 540 + sway - 150, hy = 770 - 112;
        return `<path d="M${f1(hx + 14)},216 L${f1(hx + 10)},${f1(hy - 30)}" stroke="${P.purple}" stroke-width="16"/><path d="M${f1(hx - 22)},${f1(hy - 36)} Q${f1(hx + 10)},${f1(hy + 30)} ${f1(hx + 42)},${f1(hy - 36)}" fill="none" stroke="${P.purple}" stroke-width="10"/>` + busFore(tt);
      },
    });
  }
  function officeBG(t) {
    let w = `<rect width="1080" height="1920" fill="#EEF2EA"/>`;
    // window with blinds and the city by day
    const id = uid('of');
    let view = `<rect x="80" y="180" width="920" height="760" fill="#CFE8EC"/>` + glowC(760, 380, 420, 'gSun', 0.8);
    for (let i = 0; i < 9; i++) { const bh = 220 + hash(i + 21) * 300, bx = 80 + i * 108; view += `<rect x="${bx}" y="${940 - bh}" width="92" height="${f1(bh)}" fill="${['#BFD3DA', '#D7E2E4', '#C9D9D2'][i % 3]}"/>`; }
    w += `<clipPath id="${id}"><rect x="80" y="180" width="920" height="760" rx="12"/></clipPath><g clip-path="url(#${id})">${blurG(5, view)}`;
    for (let y = 190; y < 940; y += 44) w += `<rect x="80" y="${y}" width="920" height="14" fill="#FFFFFF" opacity=".75"/>`;
    w += `</g><rect x="80" y="180" width="920" height="760" rx="12" fill="none" stroke="#FFFFFF" stroke-width="22"/>`;
    // pinboard with sticky notes
    w += `<rect x="40" y="980" width="330" height="240" rx="12" fill="#E6CDB0"/>${[[80, 1010, P.pinkL, -5], [190, 1020, P.peachL, 4], [270, 1090, P.tealL, -3], [110, 1110, P.purpleL, 6]].map(([x, y, c, r]) => `<rect x="${x}" y="${y}" width="80" height="80" fill="${c}" transform="rotate(${r} ${x + 40} ${y + 40})"/>`).join('')}`;
    // monitor at the side, plant
    w += `<rect x="700" y="900" width="320" height="220" rx="16" fill="#3A302C"/><rect x="714" y="914" width="292" height="192" rx="8" fill="#F7F1EE"/>${[0, 1, 2, 3].map(i => `<rect x="734" y="${934 + i * 38}" width="${200 - i * 30}" height="14" rx="7" fill="${[P.pinkL, P.tealL, P.peachL, P.purpleL][i]}"/>`).join('')}<rect x="845" y="1120" width="30" height="60" fill="#3A302C"/>`;
    w += plant(980, 1250, 1.0, '#7FAF8A', P.peach);
    w += screenBlend(`<path d="M1000,200 L1100,200 L600,1700 L200,1700 Z" fill="url(#gBeam)" opacity=".35"/>`);
    return w;
  }
  function shotPriya(t) {
    const lt = t - 16.7;
    return friendTyping(t, lt, 'priya', officeBG, {
      seed: 4, rim: '#FFE0B0', ls: 1, text: 'structure, not signals?? I’m in', bx: 905, by: 400, dir: 1, typeA: 0.45, typeB: 1.0,
      fig: l => ({
        mood: l < 0.5 ? 'gasp' : 'grin', look: l < 0.5 ? [0, 4] : [3, 9], tilt: l < 0.5 ? 3 : -2, head: [0, l < 0.5 ? -8 * Math.sin(Math.PI * clamp(l / 0.5)) : 4],
        hL: l < 0.55 ? [-30, 300] : [-110, 470], kL: l < 0.55 ? 'open' : 'rest', bL: 1,
      }),
      fore: () => `<rect x="-10" y="1270" width="1100" height="40" fill="#D9B08C"/><rect x="-10" y="1270" width="1100" height="9" fill="#F0D2B2"/><rect x="-10" y="1310" width="1100" height="640" fill="#C99D78"/>` + mug(170, 1270, 0.9, P.teal, { dark: '#5DB3A8' }),
    });
  }
  function laylaCafeBG(t) {
    let w = `<rect width="1080" height="1920" fill="#E9C9B4"/>`;
    const view = `<rect x="40" y="260" width="1000" height="900" fill="#F8D9B4"/>` + glowC(700, 500, 500, 'gSun', 0.9)
      + `<rect x="40" y="820" width="1000" height="340" fill="#D9B8A6"/>`
      + bokeh(t, 18, 61, ['#FFE9C4', '#F9B8C6', '#FFF6E2', '#B2E4DF'], [40, 400, 1000, 500], { r0: 20, r1: 46, op: 0.5, blur: 'fB16', dx: 20 });
    w += windowFrame(60, 280, 960, 860, view, { frame: '#7A5444', sw: 26, cross: false, sill: false });
    w += `<path d="M540,280 L540,1140" stroke="#7A5444" stroke-width="16"/>`;
    [200, 820].forEach((x, i) => {
      const sw = Math.sin(t * 0.9 + i) * 3;
      w += `<g transform="rotate(${f1(sw)} ${x} 0)"><path d="M${x},0 L${x},170" stroke="#5A4036" stroke-width="4"/><path d="M${x - 70},240 Q${x},150 ${x + 70},240 Z" fill="${P.peach}"/>${glowC(x, 250, 200, 'gLamp', 0.8)}<circle cx="${x}" cy="244" r="14" fill="#FFF0C8"/></g>`;
    });
    return w;
  }
  function notebook(x, y, rot, sc) {
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f3(sc)})"><rect x="-80" y="-104" width="160" height="208" rx="12" fill="${P.purple}"/><rect x="-72" y="-96" width="144" height="192" rx="8" fill="${P.purpleL}"/><rect x="-80" y="-104" width="20" height="208" rx="8" fill="#6A62C8"/>${heart(14, -10, 1.3, P.pink)}<rect x="-30" y="40" width="90" height="10" rx="5" fill="#fff" opacity=".7"/></g>`;
  }
  function shotLayla(t) {
    const lt = t - 18.7;
    const hug = 1 + 0.03 * Math.sin(t * 5);
    return friendTyping(t, lt, 'layla', laylaCafeBG, {
      seed: 5, rim: '#FFD39A', ls: 1, text: 'finally something for us 🫶', bx: 900, by: 400, dir: -1, typeA: 0.45, typeB: 1.0,
      fig: l => ({
        mood: l < 0.5 ? 'bliss' : 'smile', look: l < 0.5 ? [0, 0] : [3, 9], tilt: l < 0.5 ? 6 + Math.sin(t * 4) * 2 : -2, head: [0, l < 0.5 ? 0 : 4],
        mid: notebook(-58, 360, 10, 1.05 * hug), hL: [24, 380], bL: 1, kL: 'rest',
      }),
      fore: (tt) => `<rect x="-10" y="1250" width="1100" height="50" fill="#B98861"/><rect x="-10" y="1250" width="1100" height="10" fill="#D7A980"/><rect x="-10" y="1300" width="1100" height="650" fill="#9C6E50"/>` + latte(820, 1262, 0.9, P.cream, tt),
    });
  }

  /* ================================================================== *
   * SNEAK PEEK TOGETHER (0:21-0:30)
   * ================================================================== */
  function livingBG(t) {
    let w = `<rect width="1080" height="1920" fill="#F3D5C6"/>${glowC(900, 600, 600, 'gLamp', 0.55)}${glowC(140, 500, 500, 'gPk', 0.35)}`;
    // night window
    w += windowFrame(70, 250, 330, 440, `<rect x="70" y="250" width="330" height="440" fill="url(#gNightWin)"/>${twinkles(t, 8, 31, [80, 260, 310, 400], ['#FFF6E2'], { sp: 4, r: 6, op: 0.8 })}<circle cx="320" cy="330" r="30" fill="#FFF3D6"/><circle cx="334" cy="322" r="28" fill="#3A3770"/>`, { frame: '#FFF8F2', sw: 18 });
    // framed art and a shelf
    w += `<rect x="560" y="300" width="200" height="250" rx="6" fill="#fff"/><rect x="576" y="316" width="168" height="218" fill="${P.pinkP}"/><circle cx="660" cy="400" r="50" fill="${P.peachL}"/><path d="M580,520 Q640,450 740,520" fill="${P.tealL}"/>`;
    w += `<rect x="800" y="430" width="230" height="16" rx="6" fill="#C99D78"/><rect x="820" y="370" width="26" height="60" fill="${P.purple}"/><rect x="850" y="380" width="22" height="50" fill="${P.teal}"/><rect x="876" y="360" width="26" height="70" fill="${P.peach}"/>` + plant(960, 430, 0.5, '#7FAF8A', P.pink);
    w += stringLights(t, -40, 1120, 170, 70, 6, 4);
    // the couch
    w += `<path d="M30,800 Q540,760 1050,800 L1060,1080 L20,1080 Z" fill="#E59CAD"/><path d="M60,820 Q540,786 1020,820" stroke="#F2B9C5" stroke-width="12" fill="none"/>`;
    w += `<rect x="-20" y="900" width="120" height="300" rx="50" fill="#D98799"/><rect x="980" y="900" width="120" height="300" rx="50" fill="#D98799"/>`;
    w += cushion(130, 900, 0.9, P.tealL, -10) + cushion(950, 900, 0.9, P.peachL, 10);
    // floor lamp glow
    w += `<path d="M1010,300 L1010,1100" stroke="#5A4036" stroke-width="8"/><path d="M950,300 L1070,300 L1040,220 L980,220 Z" fill="${P.peachL}"/>${screenBlend(glowC(1010, 300, 260, 'gLamp', 0.7))}`;
    return w;
  }
  const LV = {
    sofia: [328, 702, 0.6], priya: [540, 676, 0.6], mei: [752, 702, 0.6],
    amara: [278, 985, 0.7], layla: [540, 972, 0.7], emma: [802, 985, 0.7],
  };
  const LV_ORDER = ['sofia', 'priya', 'mei', 'amara', 'emma', 'layla'];
  function livingScene(t, poses, o = {}) {
    let w = livingBG(t);
    w += `<rect x="-10" y="1060" width="1100" height="900" fill="#E7C2AD"/>`;
    LV_ORDER.forEach((k, i) => {
      const [x, y, s] = LV[k];
      const p = Object.assign({ x, y, s, seed: i + 2, cut: 600, mood: 'smile', rim: '#FFD8A8', lightSide: x < 540 ? -1 : 1, glow: '#E9FBF8', glowK: 0.9, hL: [-110, 470], hR: [110, 470] }, poses[k] || {});
      w += fig(t, CAST[k], p);
    });
    // coffee table, laptop seen from behind, snacks
    w += `<path d="M60,1330 L1020,1330 L1060,1400 L20,1400 Z" fill="#C99D78"/><rect x="20" y="1400" width="1040" height="30" fill="#B07F5E"/><rect x="20" y="1430" width="1040" height="500" fill="#E3B9A4"/>`;
    w += laptopBack(540, 1340, 400, { open: 1, on: 1 });
    w += popcorn(195, 1320, 0.85) + fruitBowl(885, 1330, 0.85) + mug(1010, 1340, 0.6, P.teal, { dark: '#5DB3A8', steam: true, t });
    if (o.over) w += o.over;
    return w;
  }
  function peekTag(x, y, k, t) {
    if (k <= 0) return '';
    const wob = Math.sin(t * 4) * 2;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(-7 + wob)}) scale(${f3(back(k))})">
      <rect x="-176" y="-38" width="352" height="76" rx="38" fill="${P.peach}" filter="url(#fSoft)"/>
      <rect x="-168" y="-30" width="336" height="60" rx="30" fill="none" stroke="${P.cream}" stroke-width="3" stroke-dasharray="8 8"/>
      ${txt(26, 13, 'SNEAK PEEK', 32, P.cream, { w: 700, ls: 3 })}
      <g transform="translate(-136,0)"><ellipse rx="20" ry="13" fill="${P.cream}"/><circle r="8" fill="${P.dark}"/><circle cx="3" cy="-3" r="2.5" fill="#fff"/></g>
      ${star(176, -40, 14, P.cream, 0.9 + 0.1 * Math.sin(t * 5), t * 60)}${star(-176, 34, 9, P.cream, 0.8, -t * 50)}</g>`;
  }
  // Brand headline on a soft cream scrim at the top.
  function peekHead(t) {
    let s = `<rect width="1080" height="560" fill="url(#gTopScrim)" opacity=".92"/>`;
    s += head(t, 21.3, CX, 372, `A Girl &amp; Her Futures <tspan font-style="italic" fill="${P.pink}">Academy™</tspan>`, 62, P.dark, { max: 840, out: 25.25 });
    if (t > 25.3) {
      const act = t < 26.9 ? 0 : t < 28.3 ? 1 : 2;
      const words = ['Structured', 'Visual', 'Self-paced'].map((wd, i) => `<tspan fill="${i === act ? P.pink : P.dark}"${i === act ? ' font-style="italic"' : ''}>${wd}</tspan>`);
      s += head(t, 25.45, CX, 372, words.join(`<tspan fill="${P.muted}"> · </tspan>`), 62, P.dark, { max: 840 });
    }
    return s;
  }
  // Everyone leaning in to look, small idle motion.
  function lookPoses(t, lt) {
    const n = k => Math.sin(t * 1.3 + k) * 2;
    return {
      sofia: { look: [6, 8], turn: 0.25, tilt: 8 + n(1), lean: 4, mood: 'curious' },
      priya: { look: [0, 9], tilt: -3 + n(2), head: [0, 6], mood: 'smile' },
      mei: { look: [-6, 8], turn: -0.25, tilt: -8 + n(3), lean: -4, mood: 'curious', hL: [-60, 300], kL: 'rest' },
      amara: { look: [6, 9], turn: 0.3, tilt: 5 + n(4), mood: 'smile' },
      layla: { look: [0, 10], tilt: 2 + n(5), head: [0, 6], mood: 'soft' },
      emma: { look: [-6, 9], turn: -0.3, tilt: -5 + n(6), mood: 'curious', hL: [-20, 420], hR: [40, 430] },
    };
  }
  function shotLiving(t) {
    const lt = t - 21;
    const w = livingScene(t, lookPoses(t, lt));
    const Cm = { cx: 540, cy: 960, z: 1.0 + 0.08 * io(lt / 2.0), dx: 8 * (1 - io(lt / 2.0)) };
    return camAt(Cm, w) + warm(0.14) + vignette(0.65) + peekHead(t);
  }
  // Over the shoulders: the laptop and the real Academy screens.
  function otsScene(t, lt, screens, o = {}) {
    let w = blurG(14, livingBG(t)) + `<rect x="-10" y="1240" width="1100" height="700" fill="#D9AE96"/>`;
    // which screen, crossfading
    const cur = screens.findIndex((sc, i) => i === screens.length - 1 || lt < screens[i + 1][1]);
    const [k0] = screens[Math.max(0, cur)];
    const nx = screens[cur + 1];
    const xf = nx ? io(seg(lt, nx[1] - 0.25, nx[1] + 0.15)) : 0;
    const inner = (sw, sh) => {
      let g = '';
      if (nx && xf > 0) g += `<g opacity="${f3(xf)}">${img(SCR[nx[0]], 0, 0, sw, sh)}</g>`;
      if (o.inner) g += o.inner(sw, sh);
      return g;
    };
    const LX = 540, LY = 1250, LW = 760;
    w += blurG(6 * (1 - io(seg(lt, 0, 0.5))), laptop(LX, LY, LW, { screen: k0, on: 1, inner, zoom: 1 + 0.03 * lt, pan: [0.3, 0.2], glowC: '#FFF3E6' }));
    if (o.after) w += o.after(LX, LY, LW);
    w += blurG(8, figBack(t, CAST.amara, { x: 150, y: 1300, s: 1.28, seed: 1, tilt: 6 }));
    w += blurG(8, figBack(t, CAST.emma, { x: 930, y: 1300, s: 1.28, seed: 6, tilt: -6 }));
    w += blurG(10, popcorn(540, 1720, 1.6));
    return w;
  }
  function shotOTS1(t) {
    const lt = t - 23;
    const w = otsScene(t, lt, [['curriculum', 0], ['dots', 1.25]]);
    const Cm = { cx: 540, cy: 1010, z: 1.0 + 0.12 * io(lt / 2.4) };
    let s = camAt(Cm, w) + warm(0.1) + vignette(0.7);
    const tag = camP(Cm, [540 - 380 + 150, 1250 - 520]);
    s += peekTag(Math.max(220, tag[0]), tag[1], seg(lt, 0.35, 0.7), t);
    return s + peekHead(t);
  }
  function shotOTS2(t) {
    const lt = t - 27;
    const LX = 540, LW = 760, sh = LW * 0.625;
    const pop = back(seg(lt, 0.35, 0.75)), chk = back(seg(lt, 0.6, 0.9));
    const w = otsScene(t, lt, [['complete', 0]], {
      after: (lx, ly, lw) => {
        const sTop = ly - (sh + lw * 0.028 * 2.6) + lw * 0.028 * 1.4;
        const cx = lx + lw * 0.34, cy = sTop + sh * 0.37;
        let g = '';
        if (pop > 0) g += scaleAt(cx, cy, pop, `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="86" fill="#fff" filter="url(#fSoft)"/>${chk > 0 ? `<g transform="translate(${f1(cx)},${f1(cy)}) scale(${f3(chk)})"><circle r="60" fill="${P.teal}"/><path d="M-26,2 L-8,20 L28,-18" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}`);
        g += A.sparkle(cx, cy, 27.7, t, P.peachL) + A.sparkle(cx + 40, cy - 20, 27.85, t, P.pinkL);
        return g;
      },
    });
    const Cm = { cx: 540, cy: 1010, z: 1.06 + 0.1 * io(lt / 1.6) };
    let s = camAt(Cm, w) + warm(0.1) + vignette(0.7);
    const tag = camP(Cm, [540 - 380 + 150, 1250 - 520]);
    s += peekTag(Math.max(220, tag[0]), tag[1], seg(lt, 0.1, 0.4), t);
    void LX;
    return s + peekHead(t);
  }
  // Reactions: gasps, a high five, Layla points at the screen, Emma claps.
  function reactPoses(t, lt, final) {
    const P0 = lookPoses(t, lt);
    const hf = io(seg(lt, 0.2, 0.5)) * (1 - io(seg(lt, 0.95, 1.25)));
    const hit = Math.sin(Math.PI * seg(lt, 0.45, 0.6)) * 6;
    const clap = Math.abs(Math.sin(t * 9));
    const point = io(seg(lt, 0.7, 1.0)) * (final ? 0 : 1);
    // high five between Amara and Layla, hands meet above and between them
    const HF = [410, 878 - hit];
    const aL = loc(LV.amara[0], LV.amara[1], LV.amara[2], HF[0] - 18, HF[1]);
    const lL = loc(LV.layla[0], LV.layla[1], LV.layla[2], HF[0] + 18, HF[1]);
    return {
      sofia: Object.assign({}, P0.sofia, { mood: lt < 0.8 ? 'gasp' : 'laugh', look: [4, 4], hL: lt < 1.0 ? [-30, 190] : [-110, 470], kL: lt < 1.0 ? 'open' : 'rest', bL: 1, hR: lt < 1.0 ? [40, 190] : [110, 470], kR: lt < 1.0 ? 'open' : 'rest', bR: -1 }),
      priya: Object.assign({}, P0.priya, { mood: lt < 0.7 ? 'gasp' : 'grin', look: [0, 4], tilt: lt < 0.7 ? 0 : 6 }),
      mei: Object.assign({}, P0.mei, { mood: lt < 0.5 ? 'wow' : 'laugh', hL: [-110, 470] }),
      amara: Object.assign({}, P0.amara, { mood: hf > 0.3 || final ? 'laugh' : 'grin', look: [5, -2], tilt: 8, hR: hf > 0 ? [lerp(110, aL[0], hf), lerp(470, aL[1], hf)] : [110, 470], kR: hf > 0.5 ? 'open' : 'rest', bR: -1 }),
      layla: Object.assign({}, P0.layla, {
        mood: final ? 'laugh' : hf > 0.3 ? 'laugh' : point > 0.3 ? 'grin' : 'wow', look: point > 0.3 ? [0, 10] : [-5, -2], tilt: -4,
        hL: hf > 0 ? [lerp(-110, lL[0], hf), lerp(470, lL[1], hf)] : [-110, 470], kL: hf > 0.5 ? 'open' : 'rest', bL: 1,
        hR: point > 0 ? [lerp(110, 60, point), lerp(470, 330, point)] : [110, 470], kR: point > 0.4 ? 'point' : 'rest', bR: 1,
      }),
      emma: Object.assign({}, P0.emma, { mood: 'laugh', look: [-3, 0], tilt: -6, hL: [-26 - clap * 26, 300], hR: [26 + clap * 26, 300], kL: 'open', kR: 'open', bL: 1, bR: -1, hs: 0.95 }),
      _hf: hf, _HF: HF,
    };
  }
  function shotReact(t) {
    const lt = t - 25.4;
    const R = reactPoses(t, lt, false);
    let over = '';
    if (lt > 0.5 && lt < 1.4) over += A.sparkle(R._HF[0], R._HF[1] - 20, 25.4 + 0.5, t, P.peachL) + star(R._HF[0], R._HF[1] - 30, 30 * Math.sin(Math.PI * seg(lt, 0.5, 0.9)), '#fff', 0.95, t * 120);
    const w = livingScene(t, R, { over });
    const Cm = { cx: 540, cy: 950, z: 1.12 + 0.06 * io(lt / 1.6), dx: -8 * (1 - io(lt / 1.2)) };
    return camAt(Cm, w) + warm(0.14) + vignette(0.65) + peekHead(t);
  }
  function shotCheer(t) {
    const lt = t - 28.6;
    const R = reactPoses(t, 1.6 + lt, true);
    R.sofia = Object.assign({}, R.sofia, { mood: 'laugh', hL: [-110, 470], hR: [110, 470], kL: 'rest', kR: 'rest' });
    R.priya.mood = 'laugh';
    R.layla = Object.assign({}, R.layla, { mood: 'laugh', tilt: 8, hL: [-110, 470], hR: [110, 470], kL: 'rest', kR: 'rest' });
    const w = livingScene(t, R, { over: twinkles(t, 10, 77, [80, 600, 800, 600], [P.pinkL, P.peachL, '#fff'], { sp: 60, r: 12 }) });
    const Cm = { cx: 540, cy: 930, z: 1.04 + 0.08 * io(lt / 1.4), dx: 8 * (1 - io(lt / 1.2)) };
    return camAt(Cm, w) + warm(0.14) + vignette(0.65) + peekHead(t);
  }

  /* ================================================================== *
   * GOLDEN-HOUR ROOFTOP (0:30-0:38)
   * ================================================================== */
  function roofBG(t) {
    let w = `<rect width="1080" height="1920" fill="url(#gDusk)"/><rect width="1080" height="1920" fill="#FFC890" opacity=".35"/>`;
    w += glowC(900, 1000, 700, 'gSun', 1) + glowC(900, 1010, 120, 'gWhite', 0.9);
    for (let i = 0; i < 4; i++) {
      const x = ((hash(i + 2) * 1400 + t * (12 + i * 5)) % 1500) - 300, y = 300 + i * 110;
      w += `<g opacity=".55" filter="url(#fB8)"><ellipse cx="${f1(x)}" cy="${y}" rx="${150 + i * 20}" ry="28" fill="#FFE2D0"/></g>`;
    }
    let city = '';
    for (let i = 0; i < 12; i++) {
      const bw = 70 + hash(i + 31) * 80, bx = -40 + i * 96 - t * 4, bh = 160 + hash(i + 7) * 300;
      city += `<rect x="${f1(bx)}" y="${f1(1080 - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="#A07AA8" opacity=".8"/>`;
      for (let r = 0; r < Math.floor(bh / 46); r++) city += `<rect x="${f1(bx + 12)}" y="${f1(1080 - bh + 18 + r * 46)}" width="${f1(bw - 24)}" height="9" rx="4.5" fill="#FFE0B5" opacity="${f3(0.35 + 0.35 * hash(i * 9 + r))}"/>`;
    }
    w += blurG(2, city);
    w += stringLights(t, -40, 1120, 150, 120, 5, 7) + stringLights(t + 1, -40, 1120, 330, 80, 4, 9);
    w += `<rect x="-10" y="1060" width="1100" height="70" fill="#C98E7C"/><rect x="-10" y="1060" width="1100" height="12" fill="#E8B4A0"/><rect x="-10" y="1130" width="1100" height="900" fill="#D9A48E"/>`;
    w += plant(70, 1070, 1.1, '#7FAF8A', P.peach) + plant(1010, 1070, 1.1, '#86B596', P.pink);
    w += screenBlend(`<path d="M780,980 L1100,700 L1100,1300 Z" fill="url(#gBeam)" opacity=".4"/>`) + motes(t, 14, 13, [100, 500, 900, 900], '#FFF1D6');
    return w;
  }
  const RF = {
    mei: [328, 702, 0.6], priya: [540, 676, 0.6], emma: [752, 702, 0.6],
    amara: [270, 990, 0.7], sofia: [540, 978, 0.7], layla: [810, 990, 0.7],
  };
  const RF_ORDER = ['mei', 'priya', 'emma', 'amara', 'layla', 'sofia'];
  function roofScene(t, poses, o = {}) {
    let w = roofBG(t);
    // bench back behind the back row
    w += `<rect x="40" y="880" width="1000" height="40" rx="14" fill="#B88C66"/><rect x="40" y="940" width="1000" height="40" rx="14" fill="#B88C66"/>`;
    RF_ORDER.forEach((k, i) => {
      const [x, y, s] = RF[k];
      const p = Object.assign({ x, y, s, seed: i + 1, cut: 600, mood: 'smile', rim: '#FFD08A', lightSide: 1, hL: [-110, 470], hR: [110, 470], wind: 0.4 }, poses[k] || {});
      w += fig(t, CAST[k], p);
    });
    // picnic blanket and basket in front
    let bl = `<path d="M-40,1350 L1120,1350 L1120,1960 L-40,1960 Z" fill="${P.pinkL}"/>`;
    for (let i = 0; i < 12; i++) bl += `<rect x="${-40 + i * 100}" y="1350" width="50" height="620" fill="#fff" opacity=".35"/>`;
    for (let j = 0; j < 7; j++) bl += `<rect x="-40" y="${1360 + j * 90}" width="1160" height="40" fill="#fff" opacity=".25"/>`;
    w += bl + `<g transform="translate(150,1440) scale(.9)"><path d="M-90,-80 Q0,-160 90,-80" stroke="#A0704C" stroke-width="12" fill="none"/><path d="M-100,-80 L100,-80 L84,30 L-84,30 Z" fill="#C99D78"/><path d="M-96,-50 L96,-50 M-92,-20 L92,-20" stroke="#A0704C" stroke-width="5"/></g>`;
    w += latte(950, 1420, 0.6, P.peachL, t, false);
    if (o.over) w += o.over;
    return w;
  }
  // Each of the front three holds her phone; the back row peeks over their shoulders.
  function roofPoses(t, lt, o = {}) {
    const n = k => Math.sin(t * 1.3 + k) * 2;
    const poses = {
      mei: { look: [3, 9], turn: 0.2, tilt: 6 + n(1), lean: 3, head: [10, 6], mood: 'smile' },
      priya: { look: [0, 9], tilt: n(2), head: [0, 8], mood: 'smile' },
      emma: { look: [-3, 9], turn: -0.2, tilt: -6 + n(3), lean: -3, head: [-10, 6], mood: 'smile' },
    };
    [['amara', 0], ['sofia', 1], ['layla', 2]].forEach(([k, i]) => {
      const done = o.done ? o.done(i) : 0;
      const ph = { x: [80, 60, 40][i], y: 300, rot: -6 + i * 4 + Math.sin(t * 1.2 + i) * 1.5, sc: 1.18, side: 1, glow: 0.6 + 0.3 * done, screen: scrJoin({ t, done }) };
      const PH = phoneHand(t, CAST[k], ph, [170, 480]);
      poses[k] = { look: done > 0.5 ? [0, 0] : [3, 9], tilt: done > 0.5 ? 5 : -2 + n(4 + i), head: [0, done > 0.5 ? 0 : 6], mood: done > 0.5 ? 'laugh' : 'smile', hR: PH.hR, kR: 'none', eR: PH.eR, front: PH.phone, hL: [-110, 470] };
    });
    return poses;
  }
  function shotRoof(t) {
    const lt = t - 30;
    const w = roofScene(t, roofPoses(t, lt));
    const Cm = { cx: 540, cy: 960, z: 1.0 + 0.07 * io(lt / 1.5), dx: -8 * (1 - io(lt / 1.5)) };
    return camAt(Cm, w) + warm(0.16, '#FFB070') + vignette(0.6) + flare(1010, 560, 0.4 + 0.08 * Math.sin(t * 1.2));
  }

  // Inserts: thumbs tap the pink button, the checks pop. Three panels at a time.
  function tapInsert(t, key, cx, cy, sc, tapAt, rot, bgCol) {
    const L = CAST[key];
    const lt = t - tapAt;
    const arrive = io(seg(lt, -0.42, -0.08));
    const press = Math.sin(Math.PI * seg(lt, -0.06, 0.12));
    const done = seg(lt, 0.05, 0.5);
    const btn = [59 + 12, 190];
    const rest = [SW + 2, SH - 34];
    const thumb = [lerp(rest[0], btn[0], arrive), lerp(rest[1], btn[1], arrive) + press * 2];
    const H = heldPhone(t, L, { x: cx, y: cy, rot, sc, side: 1, glow: 0.35 + 0.5 * done, screen: scrJoin({ t, done, press }), thumb, ripple: seg(lt, -0.02, 0.4) });
    // sleeve: from the wrist straight down out of frame (never across the screen)
    const sw = 64 * sc;
    const [wx, wy] = H.wrist;
    const top = L.top === 'sweater' ? 12 : 0;
    let s = `<path d="M${f1(wx)},${f1(wy)} L${f1(wx + 40 * sc)},2100" stroke="${L.topD}" stroke-width="${f1(sw + top + 6)}" stroke-linecap="round"/>`;
    s += `<path d="M${f1(wx)},${f1(wy)} L${f1(wx + 40 * sc)},2100" stroke="${L.topC}" stroke-width="${f1(sw + top)}" stroke-linecap="round"/>`;
    s += `<path d="M${f1(wx + 4 * sc)},${f1(wy + 30 * sc)} L${f1(wx + 8 * sc)},${f1(wy + 50 * sc)}" stroke="${L.topD}" stroke-width="${f1(sw + top - 4)}" stroke-linecap="round" opacity=".7"/>`;
    s += H.svg;
    if (done > 0 && done < 1) s += A.sparkle(...H.toP(59, 150), tapAt + 0.1, t, P.pinkL);
    void bgCol;
    return s;
  }
  function panelBG(t, x, w, col, seed) {
    return `<rect x="${x}" y="0" width="${w}" height="1920" fill="${col}"/>` + glowC(x + w * 0.6, 500, 520, 'gSun', 0.7) + bokeh(t, 7, seed, ['#FFE9C4', '#FFF6E2', '#F9B8C6'], [x, 200, w, 1200], { r0: 22, r1: 40, op: 0.55, blur: 'fB16', dx: 16 });
  }
  function shotTaps(t, a, keys) {
    const lt = t - a;
    const cols = ['#F6C8A8', '#F3B7C2', '#E9C4E0'];
    const xs = [0, 360, 720], cxs = [252, 540, 828];
    let s = '';
    keys.forEach((k, i) => {
      const id = uid('pn');
      const z = 1 + 0.06 * io(lt / 0.9);
      let p = panelBG(t, xs[i], 360, cols[i], 120 + i * 7);
      p += tapInsert(t, k, cxs[i], 800 + (i % 2 ? 30 : -10), 1.68, a + 0.38 + i * 0.16, [-4, 3, -2][i], cols[i]);
      s += `<clipPath id="${id}"><rect x="${xs[i]}" y="0" width="360" height="1920"/></clipPath><g clip-path="url(#${id})">${cam(cxs[i], 900, z, p)}</g>`;
    });
    s += `<rect x="357" y="0" width="6" height="1920" fill="${P.cream}"/><rect x="717" y="0" width="6" height="1920" fill="${P.cream}"/>`;
    return s + warm(0.1) + vignette(0.4);
  }
  const shotTapsA = t => shotTaps(t, 31.5, ['amara', 'sofia', 'layla']);
  const shotTapsB = t => shotTaps(t, 32.4, ['mei', 'priya', 'emma']);

  // Back to the group: checks pop over everyone, they cheer and squeeze in for a selfie.
  function shotChecks(t) {
    const lt = t - 33.3;
    const poses = roofPoses(t, lt, { done: i => 1 });
    ['mei', 'priya', 'emma'].forEach((k, i) => { poses[k] = Object.assign({}, poses[k], { mood: 'laugh', look: [0, 0], head: [0, 0], tilt: [8, -4, -8][i] + Math.sin(t * 8 + i) * 2 }); });
    let over = '';
    Object.keys(RF).forEach((k, i) => {
      const [x, y, s] = RF[k];
      const at = 33.38 + i * 0.09;
      const pk = back(seg(t, at, at + 0.35));
      if (pk <= 0) return;
      const bx = x + (k === 'amara' ? 110 : 90) * s, by = y - 170 * s - (k === 'amara' ? 30 : 0);
      over += `<g transform="translate(${f1(bx)},${f1(by)}) scale(${f3(pk)})"><circle r="34" fill="#fff" filter="url(#fSoft)"/><circle r="27" fill="${P.teal}"/><path d="M-12,1 L-3,10 L13,-9" stroke="#fff" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      over += A.sparkle(bx, by, at, t, P.pinkL);
    });
    const w = roofScene(t, poses, { over });
    const Cm = { cx: 540, cy: 940, z: 1.06 + 0.1 * io(lt / 1.0) };
    return camAt(Cm, w) + warm(0.16, '#FFB070') + vignette(0.6) + flare(1010, 560, 0.45);
  }

  // The selfie: what Amara's front camera sees. tf freezes the moment of the shutter.
  const SNAP = 35.3;
  function selfieScene(t) {
    const tf = Math.min(t, SNAP);
    const sq = io(seg(tf, 34.25, 34.85));
    let w = blurG(10, roofBG(tf));
    w += bokeh(tf, 10, 55, ['#FFE9C4', '#FFF6E2', '#F9B8C6'], [0, 150, 1080, 900], { r0: 30, r1: 60, op: 0.5, blur: 'fB16', dx: 6 });
    const S = {
      mei: [340, 700, 0.7, 7], priya: [540, 672, 0.7, 0], emma: [740, 700, 0.7, -7],
      amara: [285, 1000, 0.8, 6], sofia: [540, 1014, 0.8, 0], layla: [795, 1000, 0.8, -6],
    };
    const spread = k => (k - 540) * 0.12 * (1 - sq);
    const order = ['mei', 'priya', 'emma', 'sofia', 'layla', 'amara'];
    order.forEach((k, i) => {
      const [x, y, s, tl] = S[k];
      const o = { x: x + spread(x), y, s, seed: i + 3, cut: 600, rim: '#FFD08A', lightSide: 1, wind: 0.3, tilt: tl * sq, look: [0, 0], mood: tf > 34.9 ? (i % 2 ? 'laugh' : 'grin') : 'smile', hL: [-110, 470], hR: [110, 470] };
      if (k === 'amara') {
        // her arm reaches toward the lens and out of frame (she is holding the camera)
        Object.assign(o, { hL: [-420, 760], eL: [-300, 440], kL: 'none', mood: tf > 34.9 ? 'laugh' : 'grin' });
      }
      if (k === 'layla') Object.assign(o, { hR: [190, 60], kR: 'open', bR: 1 });
      if (k === 'mei') Object.assign(o, { hL: [-200, 40], kL: 'open', bL: -1 });
      w += fig(tf, CAST[k], o);
    });
    return w;
  }
  function cameraUI(t, k) {
    if (k <= 0) return '';
    const press = Math.sin(Math.PI * seg(t, SNAP - 0.12, SNAP + 0.08));
    let s = '';
    [[110, 190, 1, 1], [970, 190, -1, 1], [110, 1450, 1, -1], [970, 1450, -1, -1]].forEach(([x, y, sx, sy]) => {
      s += `<path d="M${x},${y + sy * 70} L${x},${y} L${x + sx * 70},${y}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>`;
    });
    s += `<g transform="translate(540,1660) scale(${f3(1 - 0.12 * press)})"><circle r="78" fill="none" stroke="#fff" stroke-width="10"/><circle r="62" fill="#fff"/></g>`;
    s += `<rect x="745" y="1626" width="70" height="70" rx="20" fill="#fff" opacity=".35"/><circle cx="300" cy="1660" r="34" fill="#fff" opacity=".35"/>`;
    s += `<path d="M120,236 l20,-34 l-4,22 l16,0 l-20,34 l4,-22 Z" fill="#fff" opacity=".9"/>`;
    return `<g opacity="${f3(k)}">${s}</g>`;
  }
  function confetti(t, at, cx, cy, n, seed) {
    const p0 = t - at;
    if (p0 <= 0 || p0 > 2.6) return '';
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = rad(-90 + (hash(i + seed) - 0.5) * 220), v = 700 + hash(i * 3 + seed) * 900;
      const x = cx + Math.cos(a) * v * p0 * 0.75, y = cy + Math.sin(a) * v * p0 * 0.75 + 900 * p0 * p0;
      const r = p0 * (300 + hash(i + 4) * 400) * (i % 2 ? 1 : -1);
      const c = [P.pink, P.peach, P.teal, P.purpleL, '#fff', P.pinkL][i % 6];
      const op = 1 - clamp((p0 - 1.8) / 0.8);
      s += i % 3 === 0 ? star(x, y, 10 + hash(i) * 8, c, f3(op), r) : `<rect x="${f1(x - 8)}" y="${f1(y - 4)}" width="16" height="${f1(8 + 6 * Math.abs(Math.sin(p0 * 8 + i)))}" rx="2" fill="${c}" opacity="${f3(op)}" transform="rotate(${f1(r)} ${f1(x)} ${f1(y)})"/>`;
    }
    return s;
  }
  // 0:34.3-0:38  The selfie, the flash, the polaroid with its sticker.
  function shotSelfie(t) {
    const lt = t - 34.3;
    const k = io(seg(t, 35.45, 36.2));
    const settle = Math.sin(Math.PI * seg(t, 36.1, 36.5)) * 0.03;
    const crop = [160, 500, 760, 700];
    const clip = [lerp(0, crop[0], k), lerp(0, crop[1], k), lerp(1080, crop[2], k), lerp(1920, crop[3], k)];
    const scl = lerp(1, 640 / 760, k) * (1 + settle);
    const ccx = clip[0] + clip[2] / 2, ccy = clip[1] + clip[3] / 2;
    const tx = 540, ty = lerp(960, 820, k), rot = lerp(0, -4, k);
    // backdrop behind the polaroid
    let s = '';
    if (k > 0) s += blurG(16, roofBG(t)) + `<rect width="1080" height="1920" fill="${P.pink}" opacity="${f3(0.35 * k)}"/>` + glowC(540, 840, 700, 'gWhite', 0.4 * k);
    const zoomIn = 1.04 - 0.04 * io(lt / 1.0);
    let photo = cam(540, 900, zoomIn + 0.02 * io(seg(t, 34.3, SNAP)), selfieScene(t));
    const id = uid('pol');
    const bd = 24 / scl, bb = 132 / scl;
    let g = '';
    if (k > 0) {
      g += `<rect x="${f1(clip[0] - bd)}" y="${f1(clip[1] - bd + 14 / scl)}" width="${f1(clip[2] + 2 * bd)}" height="${f1(clip[3] + bd + bb)}" rx="${f1(8 / scl)}" fill="${P.dark}" opacity="${f3(0.3 * k)}" filter="url(#fB16)"/>`;
      g += `<rect x="${f1(clip[0] - bd)}" y="${f1(clip[1] - bd)}" width="${f1(clip[2] + 2 * bd)}" height="${f1(clip[3] + bd + bb)}" rx="${f1(8 / scl)}" fill="#FFFDF9" opacity="${f3(clamp(k * 2))}"/>`;
    }
    g += `<clipPath id="${id}"><rect x="${f1(clip[0])}" y="${f1(clip[1])}" width="${f1(clip[2])}" height="${f1(clip[3])}"/></clipPath><g clip-path="url(#${id})">${photo}</g>`;
    if (k > 0.6) g += `<text x="${f1(ccx)}" y="${f1(clip[1] + clip[3] + bb * 0.62)}" font-size="${f1(44 / scl)}" font-family="${PF}" font-style="italic" text-anchor="middle" fill="${P.dark}" opacity="${f3(seg(k, 0.6, 1))}">${emo('Girls Who Brunch 💖')}</text>`;
    s += `<g transform="translate(${f1(tx)},${f1(ty)}) rotate(${f1(rot)}) scale(${f3(scl)}) translate(${f1(-ccx)},${f1(-ccy)})">${g}</g>`;
    s += cameraUI(t, (1 - io(seg(t, 35.35, 35.6))) * io(seg(t, 34.3, 34.55)));
    // shutter flash
    const fl = seg(t, SNAP, SNAP + 0.35);
    if (fl > 0 && fl < 1) s += `<rect width="1080" height="1920" fill="#FFFFFF" opacity="${f3(Math.pow(1 - fl, 1.6))}"/>`;
    // sticker slaps on, confetti, sparkles
    const stk = seg(t, 36.3, 36.62);
    if (stk > 0) {
      const sc = lerp(1.7, 1, back(stk));
      s += `<g transform="translate(770,580) rotate(${f1(9 + 4 * (1 - stk))}) scale(${f3(sc)})" opacity="${f3(clamp(stk * 3))}">
        <rect x="-170" y="-46" width="340" height="92" rx="46" fill="${P.dark}" opacity=".2" filter="url(#fB8)"/>
        <rect x="-168" y="-48" width="336" height="92" rx="46" fill="${P.pink}"/><rect x="-158" y="-38" width="316" height="72" rx="36" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 8"/>
        ${txt(-30, 14, 'On the list', 38, '#FFFFFF', { f: PF })}${star(124, -4, 15, '#FFFFFF', 1, t * 40)}${star(146, 18, 7, P.peachL, 1, -t * 60)}</g>`;
      s += confetti(t, 36.32, 700, 620, 46, 7) + confetti(t, 36.4, 380, 700, 30, 19);
      s += A.sparkle(900, 540, 36.4, t, P.peachL) + A.sparkle(620, 620, 36.5, t, P.pinkL);
    }
    if (t > 36.4) s += twinkles(t, 12, 88, [110, 300, 860, 1100], [P.cream, P.peachL, '#fff'], { sp: 50, r: 12 });
    // headline
    if (t > 36.5) {
      s += `<rect width="1080" height="500" fill="url(#gTopScrim)" opacity="${f3(seg(t, 36.5, 37))}"/>`;
      s += head(t, 36.55, CX, 330, `<tspan font-style="italic" fill="#C9475F">HER</tspan> future. <tspan font-style="italic" fill="#C9475F">HER</tspan> way.`, 84, P.dark, { max: 840 });
    }
    return s + vignette(0.35);
  }

  /* ================================================================== *
   * SPLASH AND END CARD (approved, unchanged)
   * ================================================================== */
  // 0:00-0:04  Pink splash, the glowing door, logo glints in.
  function shotSplash(t) {
    let s = pinkMesh(t, { grow: true });
    const z = 1.0 + 0.05 * io(t / 4);
    const open = 0.14 + 0.03 * Math.sin(t * 2) ** 2 + 0.07 * io(seg(t, 2.6, 4));
    s += cam(CX, 1100, z, door(t, CX, 1400, 420, 700, open, 0.4 + 0.6 * ease(seg(t, 0.1, 1.2))));
    s += head(t, 0.45, CX, 300, 'Something’s coming', 78, P.cream, { max: 820 });
    s += head(t, 0.8, CX, 398, `for <tspan font-style="italic" fill="${P.dark}">HER.</tspan>`, 86, P.cream, { max: 820 });
    return s + vignette(0.35);
  }

  // 0:38-0:45  End card.
  function shotEnd(t) {
    const tt = t - 38;
    let s = pinkMesh(t);
    const k = (at, inner) => { const e = ease((t - at) / 0.6); return e <= 0 ? '' : `<g transform="translate(0,${f1((1 - e) * 24)})" opacity="${f3(e)}">${inner}</g>`; };
    const her = `<tspan font-style="italic" font-weight="400" fill="${P.dark}">HER</tspan>`;
    s += k(38.45, `<text x="${CX}" y="790" font-size="104" font-family="${PF}" font-weight="700" text-anchor="middle" fill="${P.cream}">${her} future.</text>`);
    s += k(38.6, `<text x="${CX}" y="902" font-size="104" font-family="${PF}" font-weight="700" text-anchor="middle" fill="${P.cream}">${her} way.</text>`);
    // underline swash
    const u = ease(seg(t, 38.8, 39.4));
    if (u > 0) s += `<path d="M${f1(CX - 210 * u)},930 Q${CX},956 ${f1(CX + 210 * u)},930" stroke="${P.peachL}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += k(38.75, txt(CX, 1010, 'A GIRL &amp; HER FUTURES ACADEMY™', fitSize('A GIRL & HER FUTURES ACADEMY™', 36, 900, DM, 700), P.cream, { w: 700, ls: 5 }));
    // pulsing pill button
    const pulse = 1 + 0.035 * Math.sin((t - 38.9) * 4.2);
    const ring = Math.max(0, (t - 38.9) * 0.8) % 1;
    s += k(38.9, `<g transform="translate(${CX},1140) scale(${f3(pulse)})">
      <rect x="${f1(-300 - ring * 40)}" y="${f1(-52 - ring * 22)}" width="${f1(600 + ring * 80)}" height="${f1(104 + ring * 44)}" rx="${f1(52 + ring * 22)}" fill="none" stroke="${P.cream}" stroke-width="4" opacity="${f3((1 - ring) * 0.7)}"/>
      <rect x="-290" y="-30" width="580" height="104" rx="52" fill="${P.dark}" opacity=".16" filter="url(#fB16)"/><rect x="-300" y="-52" width="600" height="104" rx="52" fill="${P.cream}"/>
      <rect x="-288" y="-44" width="576" height="36" rx="18" fill="#fff" opacity=".6"/>
      ${txt(0, 14, 'Join the waitlist', 42, P.pink, { w: 700 })}</g>`);
    s += k(39.05, `<text x="${CX}" y="1290" font-size="58" font-family="${PF}" font-style="italic" font-weight="700" text-anchor="middle" fill="${P.cream}">Link in bio <tspan font-family="${DM}" font-style="normal" font-size="46">✦</tspan></text>`);
    s += k(39.2, txt(CX, 1430, 'Trading involves risk.', 26, P.cream, { w: 500, op: 0.9 }));
    return s;
  }

  /* ================================================================== *
   * TIMELINE + TRANSITIONS
   * ================================================================== */
  const SHOTS = [
    { a: 0, f: shotSplash },
    { a: 4, f: shotBrunch, tr: 'leak', d: 0.8 },
    { a: 9.4, f: shotShow, tr: 'whip', d: 0.42, dir: -1 },
    { a: 13, f: shotChat, tr: 'zoomglow', d: 0.5 },
    { a: 14.7, f: shotMei, tr: 'whip', d: 0.4, dir: 1 },
    { a: 15.9, f: shotChat, tr: 'whip', d: 0.4, dir: -1 },
    { a: 16.7, f: shotPriya, tr: 'whip', d: 0.4, dir: 1 },
    { a: 17.9, f: shotChat, tr: 'whip', d: 0.4, dir: -1 },
    { a: 18.7, f: shotLayla, tr: 'whip', d: 0.4, dir: 1 },
    { a: 19.9, f: shotChat, tr: 'whip', d: 0.4, dir: -1 },
    { a: 21, f: shotLiving, tr: 'leak', d: 0.8 },
    { a: 23, f: shotOTS1, tr: 'dissolve', d: 0.4 },
    { a: 25.4, f: shotReact, tr: 'whip', d: 0.36, dir: -1 },
    { a: 27, f: shotOTS2, tr: 'whip', d: 0.36, dir: 1 },
    { a: 28.6, f: shotCheer, tr: 'dissolve', d: 0.35 },
    { a: 30, f: shotRoof, tr: 'leak', d: 0.8 },
    { a: 31.5, f: shotTapsA, tr: 'split', d: 0.42 },
    { a: 32.4, f: shotTapsB, tr: 'split', d: 0.4 },
    { a: 33.3, f: shotChecks, tr: 'flash', d: 0.3 },
    { a: 34.3, f: shotSelfie, tr: 'flash', d: 0.3 },
    { a: 38, f: shotEnd, tr: 'pink', d: 0.9 },
  ];

  function leakOverlay(k) {
    const e = Math.sin(Math.PI * k);
    const x = -500 + k * 2100;
    return screenBlend(glowE(x, 700, 900, 1300, 'gPc', e) + glowE(x - 300, 1300, 800, 1000, 'gPk', e * 0.9) + glowE(x + 200, 400, 600, 800, 'gWarm', e)) +
      `<rect width="1080" height="1920" fill="#FFF4E4" opacity="${f3(e * e * 0.8)}"/>`;
  }
  function compose(S, prevS, t, k) {
    const prev = () => prevS.f(t), next = () => S.f(t);
    switch (S.tr) {
      case 'dissolve': return prev() + fade(io(k), next());
      case 'leak': return (k < 0.5 ? prev() + fade(clamp((k - 0.38) / 0.12), next()) : next() + fade(clamp((0.62 - k) / 0.12), prev())) + leakOverlay(k);
      case 'whip': {
        // whip pan with motion blur and a pink phone-glow streak
        const e = io(k), sd = 70 * Math.sin(Math.PI * k), dir = S.dir || 1;
        const id = uid('wp');
        const g = Math.sin(Math.PI * k);
        return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-400" y="0" width="1880" height="1920"><feGaussianBlur stdDeviation="${f1(sd)} 0"/></filter>
          <g filter="url(#${id})"><g transform="translate(${f1(-dir * 1150 * e)},0)">${prev()}</g><g transform="translate(${f1(dir * 1150 * (1 - e))},0)">${next()}</g></g>` +
          screenBlend(glowE(540, 960, 300 + 700 * g, 900, 'gPk', 0.75 * g) + glowE(540, 960, 160 + 300 * g, 600, 'gWhite', 0.45 * g));
      }
      case 'zoomglow': {
        const g = Math.sin(Math.PI * k);
        return prev() + fade(io(clamp((k - 0.2) / 0.6)), next()) + screenBlend(glowC(540, 960, 300 + 1100 * g, 'gPk', g) + glowC(540, 960, 200 + 600 * g, 'gWhite', 0.9 * g));
      }
      case 'flash': {
        const g = Math.sin(Math.PI * k);
        return (k < 0.5 ? prev() : next()) + `<rect width="1080" height="1920" fill="#FFF8F0" opacity="${f3(g * 0.95)}"/>` + screenBlend(glowC(540, 900, 900, 'gPc', g));
      }
      case 'split': {
        const offs = [0, 1, 2].map(i => { const e = io(clamp((k - i * 0.12) / 0.76)); return (i % 2 ? 1 : -1) * 1920 * (1 - e); });
        let s = prev();
        [[0, 360], [360, 360], [720, 360]].forEach(([x, w], i) => {
          const id = uid('sp');
          s += `<clipPath id="${id}"><rect x="${x}" y="${f1(offs[i])}" width="${w}" height="1920"/></clipPath><g clip-path="url(#${id})">${S.f(t)}</g>`;
        });
        return s;
      }
      case 'pink': {
        const y = 1920 - k * (1920 + 2300);
        const id1 = uid('pk1'), id2 = uid('pk2');
        const wave = (yy) => `M-20,${f1(yy)} Q270,${f1(yy - 70)} 540,${f1(yy)} T1100,${f1(yy)}`;
        let s = `<clipPath id="${id1}"><rect x="0" y="-100" width="1080" height="${f1(Math.max(0, y + 220))}"/></clipPath><g clip-path="url(#${id1})">${prev()}</g>`;
        s += `<clipPath id="${id2}"><rect x="0" y="${f1(y + 2200)}" width="1080" height="${f1(Math.max(0, 1920 - y - 2200 + 100))}"/></clipPath><g clip-path="url(#${id2})">${next()}</g>`;
        s += `<path d="${wave(y)} L1100,${f1(y + 2300)} Q810,${f1(y + 2370)} 540,${f1(y + 2300)} T-20,${f1(y + 2300)} Z" fill="${P.pink}"/>`;
        s += `<path d="${wave(y - 24)}" stroke="${P.peachL}" stroke-width="14" fill="none" opacity=".9"/><path d="${wave(y + 2324)}" stroke="${P.cream}" stroke-width="14" fill="none" opacity=".9"/>`;
        for (let i = 0; i < 8; i++) s += star(80 + hash(i) * 860, y + 300 + hash(i + 3) * 1700, 14 + hash(i + 7) * 18, i % 2 ? P.cream : P.peachL, 0.8, k * 200 + i * 30);
        return s;
      }
    }
    return next();
  }

  function draw(t) {
    UID = 0;
    t = Math.max(0, Math.min(DURATION - 1e-4, t));
    let i = SHOTS.length - 1;
    while (i > 0 && t < SHOTS[i].a) i--;
    let body;
    const S = SHOTS[i], N = SHOTS[i + 1];
    if (i > 0 && S.d && t < S.a + S.d / 2) body = compose(S, SHOTS[i - 1], t, (t - (S.a - S.d / 2)) / S.d);
    else if (N && N.d && t > N.a - N.d / 2) body = compose(N, S, t, (t - (N.a - N.d / 2)) / N.d);
    else body = S.f(t);
    return DEFS + body;
  }

  // Logo layer (drawn as an <img> by waitlist.html).
  function logo(t) {
    if (t >= 0.9 && t < 4.3) {
      const k = back(seg(t, 0.95, 1.55)), out = 1 - ease(seg(t, 3.75, 4.1));
      return { x: CX, y: 560, size: 190 * k * (1 + 0.02 * Math.sin(t * 2.4)), op: clamp((t - 0.95) / 0.2) * out, rot: (1 - clamp(k)) * -18 + Math.sin(t * 1.8) * 1.5 };
    }
    if (t >= 21.2 && t < 30.2) {
      const k = back(seg(t, 21.25, 21.8)), out = 1 - ease(seg(t, 29.7, 30.1));
      return { x: CX, y: 240, size: 136 * k * (1 + 0.02 * Math.sin(t * 2.2)), op: clamp((t - 21.25) / 0.2) * out, rot: Math.sin(t * 2) * 2 };
    }
    if (t >= 38.3) {
      const k = back(seg(t, 38.35, 38.95));
      return { x: CX, y: 500, size: 300 * k * (1 + 0.02 * Math.sin(t * 2.4)), op: clamp((t - 38.35) / 0.2), rot: (1 - clamp(k)) * -16 + Math.sin(t * 1.8) * 1.5 };
    }
    return null;
  }
  // Glints over the logo (drawn above the logo layer).
  function glint(x, y, r, t, at) {
    const p = seg(t, at, at + 0.7);
    if (p <= 0 || p >= 1) return '';
    const k = Math.sin(Math.PI * p);
    return `<g style="mix-blend-mode:screen">${star(x, y, r * k, '#FFFFFF', f3(k), p * 90)}<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.5 * k)}" fill="#fff" opacity="${f3(0.5 * k)}" filter="url(#fxb)"/></g>`;
  }
  function fx(t) {
    let s = `<defs><filter id="fxb" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter></defs>`;
    s += glint(CX + 60, 500, 46, t, 1.45) + glint(CX - 70, 610, 30, t, 2.5) + glint(CX + 44, 200, 30, t, 21.9);
    s += glint(CX + 100, 400, 60, t, 39.1) + glint(CX - 110, 590, 40, t, 41.4) + glint(CX + 90, 420, 50, t, 43.4);
    return s;
  }

  const DURATION = 45;
  const CAP_BOTTOM = 1490;
  const CAPTIONS = [
    { at: 0.15, end: 1.95, text: 'Something new is coming.' },
    { at: 2.0, end: 3.95, text: 'And it was built around her.' },
    { at: 4.0, end: 6.95, text: 'For the woman who’s curious about trading,' },
    { at: 7.0, end: 9.95, text: 'but tired of the hype.' },
    { at: 10.0, end: 13.95, text: 'For the one who wants structure, not signals.' },
    { at: 14.0, end: 17.95, text: 'For the friends who want to learn it together,' },
    { at: 18.0, end: 20.95, text: 'without putting their lives on hold.' },
    { at: 21.0, end: 23.95, text: 'A Girl & Her Futures Academy.' },
    { at: 24.0, end: 26.95, text: 'Structured, visual lessons' },
    { at: 27.0, end: 29.95, text: 'you learn at your own pace.' },
    { at: 30.0, end: 32.95, text: 'Doors open soon.' },
    { at: 33.0, end: 34.95, text: 'Join the waitlist' },
    { at: 35.0, end: 37.9, text: 'and be the first to know.' },
  ];

  // Caption times follow the voiceover take (vo-*.js, written by place-voiceover.py).
  if (window.VO_CAPTIONS && window.VO_CAPTIONS.length === CAPTIONS.length) window.VO_CAPTIONS.forEach((v, i) => Object.assign(CAPTIONS[i], v));

  window.WL = { DURATION, CAP_BOTTOM, CAPTIONS, draw, logo, fx, castSheet, SHOTS };
})();
