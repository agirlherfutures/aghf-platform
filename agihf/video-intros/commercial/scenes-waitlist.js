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
  const CX = 470;
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
  function armSVG(L, B, sd, target, bend, kind, sc, W, shortSleeve) {
    const sx = sd * (W - 20), sy = B.shY - 4;
    const a = reach(sx, sy, target[0], target[1], B.l1, B.l2, bend);
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
      if (o.armL !== false) out += armSVG(L, B, -1, hL, o.bL ?? 1, o.kL || 'rest', o.hs || 1, W, shortS);
      if (o.armR !== false) out += armSVG(L, B, 1, hR, o.bR ?? -1, o.kR || 'rest', o.hs || 1, W, shortS);
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

  /* ---------------- phones ---------------- */
  // Small handheld phone (local coords of whatever group it sits in).
  // state: 'off' | 'notif' | 'join' | 'done'; k: glow / progress 0..1
  function handPhone(x, y, rot, sc, state, k, t) {
    const w = 118, h = 236, id = uid('hp');
    let scr = '';
    if (state === 'off' || state === 'notif') {
      scr = `<rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="#3A2532"/>
        <rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="url(#gHome)" opacity="${f3(0.35 + 0.65 * k)}"/>
        <circle cx="-30" cy="-70" r="40" fill="${P.cream}" opacity="${f3(0.25 * k)}"/>`;
      if (k > 0) {
        const by = -60 + (1 - ease(k)) * -40;
        scr += `<g opacity="${f3(clamp(k * 2))}"><rect x="-50" y="${f1(by)}" width="100" height="44" rx="14" fill="#FFFFFF"/>
          <circle cx="-30" cy="${f1(by + 22)}" r="13" fill="${P.pink}"/>${heart(-30, by + 24, 0.42, '#fff')}
          <rect x="-12" y="${f1(by + 12)}" width="50" height="7" rx="3.5" fill="${P.dark}" opacity=".7"/><rect x="-12" y="${f1(by + 25)}" width="36" height="6" rx="3" fill="${P.muted}" opacity=".45"/></g>`;
      }
    } else if (state === 'join' || state === 'done') {
      scr = `<rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="${P.cream}"/>${glowC(0, -90, 110, 'gPk', 0.8)}
        <image href="${LOGO_SRC}" x="-22" y="-92" width="44" height="44"/>
        <rect x="-36" y="-36" width="72" height="8" rx="4" fill="${P.dark}" opacity=".7"/><rect x="-26" y="-22" width="52" height="6" rx="3" fill="${P.muted}" opacity=".4"/>`;
      const dk = state === 'done' ? k : 0;
      scr += `<g opacity="${f3(1 - dk)}"><rect x="-42" y="12" width="84" height="30" rx="15" fill="${P.pink}"/><rect x="-24" y="24" width="48" height="6" rx="3" fill="#fff"/></g>`;
      if (dk > 0) scr += `<g transform="translate(0,27) scale(${f3(back(dk))})"><circle r="22" fill="${P.teal}"/><path d="M-10,0 L-3,8 L11,-8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    const gl = state === 'notif' ? k : state === 'done' ? k : 0;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${f3(sc)})">
      ${gl > 0 ? screenBlend(glowC(0, 0, 250, 'gPk', 0.8 * gl) + glowC(0, 0, 120, 'gWhite', 0.35 * gl)) : ''}
      <rect x="${-w / 2 - 9}" y="${-h / 2 - 9}" width="${w + 18}" height="${h + 18}" rx="24" fill="#2A211E"/>
      <clipPath id="${id}"><rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" rx="16"/></clipPath>
      <g clip-path="url(#${id})">${scr}<rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="url(#gShine)"/></g>
      <rect x="-16" y="${-h / 2 + 6}" width="32" height="8" rx="4" fill="#2A211E"/>
      ${state === 'notif' && k > 0.2 ? `<circle r="${f1(40 + ((t * 1.4) % 1) * 160)}" fill="none" stroke="${P.pinkL}" stroke-width="5" opacity="${f3((1 - ((t * 1.4) % 1)) * 0.8 * k)}"/>` : ''}
    </g>`;
  }

  /**
   * One of the six, holding her phone. pose.mode:
   *   'notify' (pose.lt): phone lights up pink, she glances down, then smiles up
   *   'tap' (pose.k): taps "Join the waitlist" with her other hand
   *   'wave': phone away, waving hello
   * o: x, y, s, seed, phone [gx, gy] global, extra fig options (mid, front, hL...)
   */
  function heroFig(t, key, o, pose) {
    const L = CAST[key];
    const fx = o.x, fy = o.y, fs = o.s;
    const ph = o.phone || [610, 1130];
    let mood = o.mood0 || 'soft', look = o.look0 || [0, 4], head = [0, 0], tilt = o.tilt0 || 0;
    let hL = o.hL, kL = o.kL || 'rest', bL = o.bL, hR, kR = 'rest', bR = o.bR ?? 1;
    let phoneSVG = '', front = o.front || '', mid = o.mid || '';
    if (pose.mode === 'notify') {
      const lt = pose.lt;
      const nk = seg(lt, 0.3, 0.55);
      if (lt > 0.42 && lt < 1.08) { look = [2, 10]; head = [0, 8]; tilt = (o.tilt0 || 0) - 3; mood = 'soft'; }
      else if (lt >= 1.08) { mood = lt > 1.45 ? 'grin' : 'smile'; look = [0, 0]; tilt = (o.tilt0 || 0) + 5 * io(seg(lt, 1.08, 1.4)); }
      const lift = 34 * io(seg(lt, 1.05, 1.5));
      const lp = loc(fx, fy, fs, ph[0], ph[1] - lift);
      phoneSVG = handPhone(lp[0], lp[1], -8 + 4 * io(seg(lt, 1.05, 1.5)), 1 / fs * (o.ps || 1), 'notif', nk, t);
      hR = [lp[0] + 26, lp[1] + 72 / fs];
    } else if (pose.mode === 'tap') {
      const k = pose.k;
      const lp = [40, 330];
      const app = io(seg(k, 0.05, 0.42)), press = Math.sin(Math.PI * seg(k, 0.42, 0.56)), away = io(seg(k, 0.6, 0.95));
      const done = seg(k, 0.5, 0.75);
      phoneSVG = handPhone(lp[0], lp[1], -6, 1.25, done > 0 ? 'done' : 'join', done, t);
      hR = [lp[0] + 30, lp[1] + 100]; bR = 1;
      const tgt = [lp[0] - 56 + press * 8, lp[1] + 34];
      hL = [lerp(-150, tgt[0], app * (1 - away)), lerp(470, tgt[1], app * (1 - away))]; kL = 'point'; bL = 1;
      mood = done > 0.4 ? 'grin' : 'smile'; look = done > 0.6 ? [0, 0] : [3, 9]; head = done > 0.6 ? [0, 0] : [0, 6]; tilt = done > 0.6 ? 6 : -2;
      if (done > 0.2 && done < 1) front += A.sparkle(lp[0], lp[1] - 40, 0, done * 0.9, P.pinkL);
    } else if (pose.mode === 'wave') {
      const sd = o.seed || 1;
      hR = [235 + Math.sin(t * 8 + sd) * 22, -30 + Math.cos(t * 8 + sd) * 6]; kR = 'open'; bR = 1;
      hL = o.hLwave || [-150, 470]; kL = 'rest';
      mood = pose.mood || 'laugh'; look = [0, 0]; tilt = (o.tilt0 || 0) + Math.sin(t * 2 + sd) * 3;
      mid = o.midWave || '';
      front = o.frontWave || '';
    }
    return fig(t, L, Object.assign({}, o.fig || {}, {
      x: fx, y: fy, s: fs, seed: o.seed || 1, cut: o.cut || 560, mood, look, head, tilt,
      hL, kL, bL, hR, kR, bR, mid: mid + (pose.mode === 'wave' ? '' : phoneSVG), front,
    }));
  }

  /* ================================================================== *
   * THE SIX VIGNETTES (each a full frame; pose decides the action)
   * ================================================================== */
  // 1. Amara, balcony with plants and morning coffee.
  function vigAmara(t, pose) {
    const lt = pose.lt || 0;
    let w = `<rect width="1080" height="1920" fill="url(#gDawn)"/>` + glowC(780, 560, 520, 'gSun', 1) + glowC(780, 560, 120, 'gWhite', 0.9);
    // drifting clouds
    for (let i = 0; i < 4; i++) {
      const x = ((hash(i + 2) * 1400 + t * (10 + i * 4)) % 1500) - 300, y = 260 + i * 120;
      w += `<g opacity=".7" filter="url(#fB8)"><ellipse cx="${f1(x)}" cy="${y}" rx="${140 + i * 20}" ry="34" fill="#FFF6EE"/><ellipse cx="${f1(x + 70)}" cy="${y - 22}" rx="80" ry="34" fill="#FFF6EE"/></g>`;
    }
    // far city
    const par = -t * 3;
    let city = '';
    for (let i = 0; i < 11; i++) {
      const bw = 70 + hash(i + 31) * 70, bx = -60 + i * 110 + par % 110, bh = 140 + hash(i + 7) * 260;
      city += `<rect x="${f1(bx)}" y="${f1(1060 - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="#E7B3B0" opacity=".75"/>`;
      for (let r = 0; r < Math.floor(bh / 50); r++) city += `<rect x="${f1(bx + 14)}" y="${f1(1060 - bh + 20 + r * 50)}" width="${f1(bw - 28)}" height="10" rx="5" fill="#FFF0E2" opacity=".5"/>`;
    }
    w += `<g filter="url(#fB3)">${city}</g><rect x="-10" y="1050" width="1100" height="300" fill="#EBB9AE" opacity=".6"/>`;
    // hanging pothos swaying from the top left
    for (let v = 0; v < 3; v++) {
      const vx = 70 + v * 70, sw = Math.sin(t * 1.2 + v) * 10;
      let d = `M${vx},150`;
      for (let j = 1; j <= 6; j++) d += ` Q${f1(vx + (j % 2 ? 26 : -26) + sw * j / 6)},${150 + j * 70 - 35} ${f1(vx + sw * j / 6)},${150 + j * 70}`;
      w += `<path d="${d}" stroke="#6E9E78" stroke-width="5" fill="none"/>`;
      for (let j = 1; j <= 6; j++) w += `<ellipse cx="${f1(vx + sw * j / 6 + (j % 2 ? 18 : -18))}" cy="${150 + j * 70 - 20}" rx="20" ry="13" transform="rotate(${j % 2 ? 30 : -30} ${f1(vx + sw * j / 6)} ${150 + j * 70})" fill="${j % 2 ? '#86B596' : '#7FAF8A'}"/>`;
    }
    w += `<path d="M30,150 L340,150" stroke="#C99D78" stroke-width="10" stroke-linecap="round"/><path d="M50,150 Q120,90 180,150 M200,150 Q260,90 320,150" stroke="#C99D78" stroke-width="4" fill="none"/>`;
    w += plant(900, 1060, 1.2, '#86B596', P.peach) + plant(110, 1120, 0.9, '#7FAF8A', P.pinkL);
    w += screenBlend(`<path d="M700,300 L1100,200 L1100,1300 L300,1500 Z" fill="url(#gBeam)" opacity=".35"/>`) + motes(t, 14, 5, [300, 500, 700, 800]);
    // Amara with coffee in her left hand
    const fx = 470, fy = 760, fs = 1.05;
    const mugL = [-100, 380 + Math.sin(t * 1.9) * 3];
    const sip = pose.mode === 'notify' ? 0 : 0;
    w += heroFig(t, 'amara', {
      x: fx, y: fy, s: fs, seed: 1, mood0: 'soft', look0: [-4, 2], tilt0: -2,
      hL: [mugL[0] - 48, mugL[1] + 20], bL: 1,
      front: mug(mugL[0], mugL[1] + 70 + sip, 0.95, P.teal, { dark: '#5DB3A8', drink: '#7A4A30' }),
      fig: { rim: '#FFE3BD', lightSide: 1 },
    }, pose);
    w += steam(t, fx + mugL[0] * fs, fy + (mugL[1] - 10) * fs, 1.0, 0.6);
    // railing foreground
    w += `<rect x="-10" y="1250" width="1100" height="26" rx="8" fill="#B88C6A"/><rect x="-10" y="1250" width="1100" height="7" fill="#D9B08C"/>`;
    for (let x = 10; x < 1100; x += 64) w += `<rect x="${x}" y="1276" width="12" height="660" fill="#9E7558"/>`;
    w += `<rect x="-10" y="1276" width="1100" height="660" fill="#F7D9CC" opacity=".35"/>`;
    w += plant(980, 1330, 1.3, '#7FAF8A', P.teal);
    return w + flare(780, 560, 0.55 + 0.1 * Math.sin(t * 1.2));
  }

  // 2. Sofia, family kitchen, packing a lunchbox.
  function lunchbox(x, y, sc, appleIn) {
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <path d="M-120,-70 L120,-70 L130,-170 L-110,-170 Z" fill="${P.tealL}"/><path d="M-120,-70 L120,-70" stroke="${P.teal}" stroke-width="8"/>
      <rect x="-130" y="-74" width="260" height="120" rx="22" fill="${P.pink}"/><rect x="-116" y="-60" width="232" height="92" rx="14" fill="#F9C7D2"/>
      <rect x="-100" y="-56" width="110" height="64" rx="10" fill="#FFF3DC"/><path d="M-100,-24 L10,-24" stroke="#E7B36A" stroke-width="8"/><path d="M-96,-36 Q-45,-48 6,-36" stroke="#9BC48A" stroke-width="6" fill="none"/>
      ${appleIn ? `<circle cx="64" cy="-30" r="30" fill="#E9606E"/><path d="M64,-60 q4,-12 12,-14" stroke="#7A4A30" stroke-width="5" fill="none"/><ellipse cx="78" cy="-70" rx="12" ry="6" fill="#86B596"/><ellipse cx="54" cy="-40" rx="8" ry="5" fill="#fff" opacity=".4"/>` : ''}
      ${heart(-100, 20, 0.5, '#fff')}</g>`;
  }
  function apple(x, y, sc = 1) {
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><circle r="30" fill="#E9606E"/><path d="M0,-30 q4,-12 12,-14" stroke="#7A4A30" stroke-width="5" fill="none"/><ellipse cx="14" cy="-40" rx="12" ry="6" fill="#86B596"/><ellipse cx="-10" cy="-10" rx="8" ry="5" fill="#fff" opacity=".4"/></g>`;
  }
  function vigSofia(t, pose) {
    const lt = pose.lt || 0;
    let w = `<rect width="1080" height="1920" fill="#F7E6D8"/>`;
    const view = `<rect x="560" y="300" width="460" height="560" fill="url(#gDawn)"/>` + glowC(820, 700, 300, 'gSun', 1) + `<circle cx="660" cy="760" r="90" fill="#C9E0B0"/><circle cx="900" cy="780" r="110" fill="#B9D8A8"/>`;
    w += windowFrame(600, 330, 400, 500, view, { frame: '#FFF8F2', sw: 20 });
    // shelf with jars and a child's drawings on the cabinet
    w += `<rect x="40" y="250" width="420" height="380" rx="10" fill="#FBF1E8"/><path d="M250,250 L250,630" stroke="#EAD9C9" stroke-width="6"/><rect x="226" y="560" width="10" height="46" rx="5" fill="${P.gold}"/><rect x="264" y="560" width="10" height="46" rx="5" fill="${P.gold}"/>`;
    w += `<g transform="rotate(-4 140 400)"><rect x="80" y="320" width="130" height="150" fill="#fff"/><circle cx="145" cy="370" r="26" fill="${P.peach}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${145 + Math.cos(i * 0.785) * 34},${370 + Math.sin(i * 0.785) * 34} l${Math.cos(i * 0.785) * 12},${Math.sin(i * 0.785) * 12}" stroke="${P.peach}" stroke-width="5" stroke-linecap="round"/>`).join('')}<path d="M90,450 Q145,420 200,450" stroke="#86B596" stroke-width="8" fill="none"/></g>`;
    w += `<g transform="rotate(5 360 420)"><rect x="300" y="340" width="120" height="140" fill="#fff"/>${heart(360, 420, 1.6, P.pink)}<rect x="350" y="318" width="20" height="30" rx="4" fill="${P.tealL}" opacity=".9"/></g>`;
    w += `<rect x="560" y="900" width="500" height="16" rx="6" fill="#E8CDB4"/><rect x="600" y="840" width="50" height="60" rx="12" fill="${P.tealL}"/><rect x="670" y="820" width="56" height="80" rx="14" fill="${P.peachL}"/>`;
    w += screenBlend(`<path d="M600,340 L1000,340 L700,1700 L120,1500 Z" fill="url(#gBeam)" opacity=".4"/>` + glowC(800, 600, 600, 'gWarm', 0.3)) + motes(t, 12, 8, [300, 500, 600, 700]);
    // Sofia: left hand drops an apple into the lunchbox, then the phone lights up
    const fx = 460, fy = 760, fs = 1.05;
    const box = [300, 1290];
    const drop = io(seg(lt, 0.0, 0.32));
    const released = pose.mode !== 'notify' || lt > 0.32;
    const appleG = [lerp(250, box[0] + 64 * 1.0, drop), lerp(1130, box[1] - 30, drop)];
    const hLg = released ? [lerp(appleG[0], 230, io(seg(lt, 0.32, 0.7))), lerp(appleG[1] + 10, 1260, io(seg(lt, 0.32, 0.7)))] : [appleG[0] - 10, appleG[1] + 20];
    const hLl = loc(fx, fy, fs, hLg[0], hLg[1]);
    w += heroFig(t, 'sofia', {
      x: fx, y: fy, s: fs, seed: 2, mood0: 'smile', look0: [-6, 8], tilt0: 3,
      hL: hLl, bL: 1, fig: { rim: '#FFE3BD', lightSide: 1 },
    }, pose);
    w += `<rect x="-10" y="1270" width="1100" height="40" fill="#EBD5BE"/><rect x="-10" y="1270" width="1100" height="9" fill="#FFF4E8"/><rect x="-10" y="1310" width="1100" height="640" fill="#F2DFCF"/>`;
    w += `<rect x="30" y="1360" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/><rect x="380" y="1360" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/><rect x="730" y="1360" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/>`;
    w += lunchbox(box[0], box[1], 1, released && pose.mode === 'notify');
    if (pose.mode === 'notify' && !released) w += apple(appleG[0], appleG[1]);
    w += `<g transform="translate(860,1280)"><rect x="-50" y="-150" width="100" height="150" rx="20" fill="${P.peachL}"/><rect x="-40" y="-176" width="80" height="34" rx="12" fill="${P.peach}"/><path d="M-30,-100 L30,-100" stroke="#fff" stroke-width="6" opacity=".6"/></g>`;
    w += apple(720, 1250, 0.9);
    return w;
  }

  // 3. Mei, on the bus with earbuds, city passing.
  function vigMei(t, pose) {
    let w = `<rect width="1080" height="1920" fill="#E8E2F4"/>`;
    // window band with the city sliding past
    const wy = 300, wh = 760;
    const id = uid('bus');
    let city = `<rect x="0" y="${wy}" width="1080" height="${wh}" fill="url(#gDawn)"/>` + glowC(300, 520, 360, 'gSun', 0.9);
    const sp = t * 260;
    for (let i = 0; i < 14; i++) {
      const bw = 140 + hash(i + 3) * 120, total = 14 * 200;
      const bx = ((i * 200 - sp * 0.5) % total + total) % total - 300, bh = 200 + hash(i + 11) * 380;
      city += `<rect x="${f1(bx)}" y="${f1(wy + wh - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="${['#E7B9C4', '#D9B3DD', '#F2C6B0'][i % 3]}"/>`;
      for (let r = 0; r < Math.floor(bh / 60); r++) city += `<rect x="${f1(bx + 18)}" y="${f1(wy + wh - bh + 24 + r * 60)}" width="${f1(bw - 36)}" height="16" rx="8" fill="#FFF3E6" opacity=".7"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const total = 8 * 300, tx = ((i * 300 - sp) % total + total) % total - 200;
      city += `<g filter="url(#fB8)"><rect x="${f1(tx + 70)}" y="${wy + wh - 160}" width="22" height="160" fill="#8A6248"/><circle cx="${f1(tx + 80)}" cy="${wy + wh - 190}" r="80" fill="${i % 2 ? '#9DBE84' : '#B5CE8E'}"/><circle cx="${f1(tx + 40)}" cy="${wy + wh - 150}" r="56" fill="${i % 2 ? '#B5CE8E' : '#9DBE84'}"/></g>`;
    }
    city += `<rect x="0" y="${wy + wh - 70}" width="1080" height="70" fill="#C9B6C8"/>`;
    w += `<clipPath id="${id}"><rect x="0" y="${wy}" width="1080" height="${wh}" rx="30"/></clipPath><g clip-path="url(#${id})">${city}</g>`;
    w += `<rect x="-10" y="${wy - 30}" width="1100" height="40" fill="#CFC6E4"/><rect x="-10" y="${wy + wh - 10}" width="1100" height="60" fill="#CFC6E4"/><rect x="520" y="${wy}" width="24" height="${wh}" fill="#CFC6E4"/>`;
    // grab handles swinging
    w += `<rect x="-10" y="210" width="1100" height="16" rx="8" fill="#B8AFCF"/>`;
    [140, 360, 760, 980].forEach((x, i) => {
      const a = Math.sin(t * 2.6 + i) * 8;
      w += `<g transform="rotate(${f1(a)} ${x} 218)"><rect x="${x - 8}" y="218" width="16" height="90" fill="${P.purple}"/><path d="M${x - 30},300 Q${x},360 ${x + 30},300 Z" fill="none" stroke="${P.purple}" stroke-width="10"/></g>`;
    });
    // passing light sweeps
    const sweep = ((t * 0.9) % 1);
    w += screenBlend(`<path d="M${f1(-400 + sweep * 2200)},200 L${f1(-200 + sweep * 2200)},200 L${f1(-700 + sweep * 2200)},1900 L${f1(-900 + sweep * 2200)},1900 Z" fill="#FFF4E0" opacity=".28" filter="url(#fB16)"/>`);
    // seat back behind her
    w += `<rect x="240" y="880" width="460" height="700" rx="70" fill="${P.teal}"/><rect x="270" y="900" width="400" height="80" rx="36" fill="${P.tealL}"/>`;
    const sway = Math.sin(t * 2.3) * 6;
    w += heroFig(t, 'mei', {
      x: 470 + sway, y: 780, s: 1.05, seed: 3, mood0: 'soft', look0: [-8, 2], tilt0: -2,
      hL: [-140, 470], bL: 1, fig: { earbuds: true, rim: '#FFF0DC', lightSide: -1 },
    }, pose);
    w += `<rect x="-10" y="1330" width="1100" height="620" fill="#9E95C2"/><rect x="-10" y="1330" width="1100" height="14" fill="#B8AFCF"/>`;
    w += `<rect x="40" y="1300" width="300" height="220" rx="50" fill="${P.teal}" opacity=".9"/><rect x="740" y="1300" width="300" height="220" rx="50" fill="${P.teal}" opacity=".9"/>`;
    return w;
  }

  // 4. Priya, garden bench at lunch break, tote beside her.
  function vigPriya(t, pose) {
    let w = `<rect width="1080" height="1920" fill="url(#gGolden)"/>` + glowC(820, 420, 520, 'gSun', 0.9);
    w += tree(120, 1000, 1.0, ['#A9C48A', '#8FB27C', '#D1DC9E', '#F2C27E'], t, 1) + tree(980, 980, 1.15, ['#9DBE84', '#B5CE8E', '#C6D69A', '#F5B472'], t, 2);
    w += `<rect x="-10" y="960" width="1100" height="980" fill="#BCCB8A"/>`;
    // flower beds
    for (let i = 0; i < 26; i++) {
      const x = hash(i + 4) * 1080, y = 980 + hash(i + 9) * 120, r = 12 + hash(i) * 10;
      const sw = Math.sin(t * 1.8 + i) * 3;
      w += `<path d="M${f1(x)},${f1(y + 40)} L${f1(x + sw)},${f1(y)}" stroke="#7FAF8A" stroke-width="4"/><circle cx="${f1(x + sw)}" cy="${f1(y)}" r="${f1(r)}" fill="${[P.pinkL, P.peachL, '#fff', P.pink, P.purpleL][i % 5]}"/><circle cx="${f1(x + sw)}" cy="${f1(y)}" r="${f1(r * 0.35)}" fill="${P.gold}"/>`;
    }
    w += bokeh(t, 12, 41, ['#FFE9C4', '#FFF6E2', '#FDE8ED'], [0, 300, 1080, 700], { r0: 16, r1: 34, op: 0.35, blur: 'fB8' });
    // bench back
    w += `<rect x="60" y="1000" width="820" height="40" rx="10" fill="#C99D78"/><rect x="60" y="1060" width="820" height="40" rx="10" fill="#C99D78"/><rect x="60" y="1120" width="820" height="40" rx="10" fill="#B88C66"/><rect x="90" y="990" width="22" height="300" fill="#6A4A3A"/><rect x="828" y="990" width="22" height="300" fill="#6A4A3A"/>`;
    // tote on the bench beside her
    const tote = `<g transform="translate(790,1180) rotate(6)"><path d="M-40,-60 C-40,-150 40,-150 40,-60" stroke="#D9C6A6" stroke-width="14" fill="none"/><path d="M-95,-60 L95,-60 L110,170 L-110,170 Z" fill="#EADBC2"/><path d="M-60,30 L60,30" stroke="${P.pink}" stroke-width="10" stroke-linecap="round"/>${heart(0, 100, 1.4, P.pink)}</g>`;
    w += tote;
    // sandwich in her left hand during the glance
    w += heroFig(t, 'priya', {
      x: 440, y: 760, s: 1.05, seed: 4, mood0: 'smile', look0: [-6, 4], tilt0: 2,
      hL: [-110, 480], bL: 1, fig: { rim: '#FFE0B0', lightSide: 1 },
    }, pose);
    w += `<rect x="40" y="1290" width="880" height="36" rx="10" fill="#D9B08C"/><rect x="40" y="1326" width="880" height="24" fill="#B88C66"/><rect x="90" y="1350" width="26" height="300" fill="#6A4A3A"/><rect x="820" y="1350" width="26" height="300" fill="#6A4A3A"/>`;
    w += `<rect x="-10" y="1600" width="1100" height="340" fill="#A9BC7A"/>`;
    w += leaves(t, 7, 3, [-40, 200, 1160, 1400], ['#F5A857', '#E9A93B', '#FAD09A', '#C6D69A']);
    // dappled light
    for (let i = 0; i < 6; i++) w += screenBlend(glowC(200 + i * 150 + Math.sin(t + i) * 20, 600 + hash(i) * 600, 120, 'gSun', 0.25));
    return w;
  }

  // 5. Layla, cozy café window with a notebook.
  function vigLayla(t, pose) {
    const lt = pose.lt || 0;
    let w = `<rect width="1080" height="1920" fill="#E9C9B4"/>`;
    // window with the street outside
    const view = `<rect x="40" y="260" width="1000" height="900" fill="#F8D9B4"/>` + glowC(700, 500, 500, 'gSun', 0.9)
      + `<rect x="40" y="820" width="1000" height="340" fill="#D9B8A6"/>`
      + bokeh(t, 18, 61, ['#FFE9C4', '#F9B8C6', '#FFF6E2', '#B2E4DF'], [40, 400, 1000, 500], { r0: 20, r1: 46, op: 0.5, blur: 'fB16', dx: 20 });
    let walkers = '';
    for (let i = 0; i < 3; i++) {
      const x = ((t * 70 * (i % 2 ? 1 : -0.8) + i * 400) % 1300 + 1300) % 1300 - 100;
      walkers += `<g filter="url(#fB16)" opacity=".5"><circle cx="${f1(x)}" cy="700" r="40" fill="#8A6A5A"/><rect x="${f1(x - 55)}" y="740" width="110" height="260" rx="50" fill="${[P.purpleL, P.tealL, P.peachL][i]}"/></g>`;
    }
    w += windowFrame(60, 280, 960, 860, view + walkers, { frame: '#7A5444', sw: 26, cross: false, sill: false });
    w += `<path d="M540,280 L540,1140" stroke="#7A5444" stroke-width="16"/>`;
    // pendant lamps
    [200, 820].forEach((x, i) => {
      const sw = Math.sin(t * 0.9 + i) * 3;
      w += `<g transform="rotate(${f1(sw)} ${x} 0)"><path d="M${x},0 L${x},170" stroke="#5A4036" stroke-width="4"/><path d="M${x - 70},240 Q${x},150 ${x + 70},240 Z" fill="${P.peach}"/>${glowC(x, 250, 200, 'gLamp', 0.8)}<circle cx="${x}" cy="244" r="14" fill="#FFF0C8"/></g>`;
    });
    // Layla writes in her notebook, stops when the phone glows
    const writing = pose.mode === 'notify' && lt < 0.4;
    const pen = writing ? [Math.sin(t * 16) * 12, Math.cos(t * 8) * 4] : [0, 0];
    w += heroFig(t, 'layla', {
      x: 470, y: 760, s: 1.05, seed: 5, mood0: 'soft', look0: [-4, 10], tilt0: -2,
      hL: [-90 + pen[0], 440 + pen[1]], bL: 1, fig: { rim: '#FFD39A', lightSide: 1 },
    }, pose);
    w += `<rect x="-10" y="1250" width="1100" height="50" fill="#B98861"/><rect x="-10" y="1250" width="1100" height="10" fill="#D7A980"/><rect x="-10" y="1300" width="1100" height="650" fill="#9C6E50"/>`;
    // notebook and latte
    w += `<g transform="translate(250,1248) scale(1,0.5)"><rect x="-150" y="-120" width="300" height="200" rx="10" fill="#fff"/><path d="M0,-120 L0,80" stroke="#E9D9CC" stroke-width="5"/>${[0, 1, 2, 3].map(i => `<path d="M-130,${-90 + i * 40} L-20,${-90 + i * 40}" stroke="${P.purpleL}" stroke-width="5"/><path d="M20,${-90 + i * 40} L${110 - i * 20},${-90 + i * 40}" stroke="${P.purpleL}" stroke-width="5"/>`).join('')}${heart(70, 40, 1, P.pink)}</g>`;
    w += `<g transform="translate(790,1230)"><path d="M-70,-10 L70,-10 L60,70 Q56,90 36,90 L-36,90 Q-56,90 -60,70 Z" fill="${P.cream}"/><ellipse cx="0" cy="-10" rx="70" ry="18" fill="#C69468"/>${heart(0, -4, 0.7, '#FBEBDD')}<path d="M70,10 C104,10 104,50 66,52" stroke="${P.cream}" stroke-width="10" fill="none"/><ellipse cx="0" cy="96" rx="96" ry="14" fill="${P.cream}"/></g>`;
    w += steam(t, 790, 1200, 0.9, 0.5);
    return w;
  }

  // 6. Emma, front porch at golden hour with her dog.
  function dog(t, x, y, sc) {
    const wag = Math.sin(t * 11) * 22, tilt = Math.sin(t * 1.4) * 6, pant = Math.abs(Math.sin(t * 7)) * 4;
    const fur = '#E3A866', furD = '#C98B4A', furL = '#F2C68E';
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <g transform="rotate(${f1(wag)} 90 60)"><path d="M90,60 C150,40 170,-20 160,-60" stroke="${fur}" stroke-width="26" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="20" cy="90" rx="120" ry="90" fill="${fur}"/><ellipse cx="-40" cy="60" rx="70" ry="90" fill="${furL}"/>
      <rect x="-70" y="120" width="44" height="90" rx="20" fill="${fur}"/><rect x="-10" y="130" width="44" height="84" rx="20" fill="${furD}"/>
      <g transform="rotate(${f1(tilt)} -40 -40)">
        <ellipse cx="-110" cy="-60" rx="34" ry="62" transform="rotate(20 -110 -60)" fill="${furD}"/><ellipse cx="30" cy="-60" rx="34" ry="62" transform="rotate(-20 30 -60)" fill="${furD}"/>
        <ellipse cx="-40" cy="-70" rx="78" ry="74" fill="${fur}"/><ellipse cx="-40" cy="-30" rx="46" ry="34" fill="${furL}"/>
        <circle cx="-70" cy="-86" r="9" fill="#2C1810"/><circle cx="-10" cy="-86" r="9" fill="#2C1810"/><circle cx="-67" cy="-89" r="3" fill="#fff"/><circle cx="-7" cy="-89" r="3" fill="#fff"/>
        <ellipse cx="-40" cy="-46" rx="14" ry="10" fill="#2C1810"/><path d="M-40,-36 L-40,-26 M-56,-24 Q-40,-14 -24,-24" stroke="#2C1810" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M-50,-22 Q-40,${f1(6 + pant)} -30,-22 Z" fill="#E87B8E"/>
      </g>
      <path d="M-100,-6 Q-40,20 20,-6" stroke="${P.pink}" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="-40" cy="14" r="9" fill="${P.gold}"/>
    </g>`;
  }
  function vigEmma(t, pose) {
    let w = `<rect width="1080" height="1920" fill="#F6DEC0"/>`;
    // house siding
    for (let y = 120; y < 1300; y += 54) w += `<rect x="-10" y="${y}" width="1100" height="50" fill="#FBEBD8"/><rect x="-10" y="${y + 44}" width="1100" height="6" fill="#E9D2B8"/>`;
    // window with warm interior and a door frame
    w += `<rect x="560" y="300" width="380" height="480" rx="8" fill="#FFE3B8"/>${glowC(750, 540, 260, 'gLamp', 0.8)}<rect x="560" y="300" width="380" height="480" rx="8" fill="none" stroke="#fff" stroke-width="22"/><path d="M750,300 L750,780 M560,540 L940,540" stroke="#fff" stroke-width="12"/>`;
    w += `<rect x="-60" y="260" width="300" height="900" fill="#E5AC9E"/><rect x="-40" y="290" width="240" height="380" rx="8" fill="none" stroke="#D49486" stroke-width="6"/><circle cx="200" cy="740" r="12" fill="${P.gold}"/>`;
    // porch posts and string lights
    w += `<rect x="900" y="80" width="60" height="1300" fill="#FFF8F0"/><rect x="890" y="80" width="80" height="30" fill="#EADBC9"/>`;
    w += stringLights(t, -40, 1120, 170, 90, 5, 2);
    // sun from the right, through the posts
    w += screenBlend(`<path d="M1100,200 L1100,600 L200,1500 L-100,1300 Z" fill="url(#gBeam)" opacity=".55"/>` + glowC(1060, 500, 600, 'gSun', 0.8));
    // potted flowers
    w += plant(110, 1200, 1.0, '#86B596', P.pink);
    for (let i = 0; i < 5; i++) w += `<circle cx="${80 + i * 16}" cy="${1060 - (i % 2) * 20}" r="14" fill="${[P.pinkL, P.peachL, '#fff'][i % 3]}"/>`;
    // Emma on the top step, petting the dog with her left hand
    const fx = 560, fy = 780, fs = 1.02;
    const pet = Math.sin(t * 4) * 12;
    const dogX = 230, dogY = 1110;
    const hL = loc(fx, fy, fs, dogX + 10 + pet, dogY - 120);
    w += heroFig(t, 'emma', {
      x: fx, y: fy, s: fs, seed: 6, mood0: 'smile', look0: [-8, 6], tilt0: -3, phone: [700, 1140],
      hL, bL: -1, kL: 'rest', fig: { rim: '#FFD39A', lightSide: 1 },
    }, pose);
    w += dog(t, dogX, dogY, 1.0);
    // steps
    w += `<rect x="-10" y="1300" width="1100" height="40" fill="#D9B08C"/><rect x="-10" y="1300" width="1100" height="10" fill="#F0D2B2"/><rect x="-10" y="1340" width="1100" height="200" fill="#C99D78"/><rect x="-10" y="1540" width="1100" height="40" fill="#D9B08C"/><rect x="-10" y="1580" width="1100" height="400" fill="#B88C66"/>`;
    w += leaves(t, 5, 7, [-40, 200, 1160, 1300], ['#F5A857', '#E9A93B', '#FAD09A']);
    return w + flare(1000, 420, 0.75 + 0.1 * Math.sin(t * 1.3));
  }

  const VIG = { amara: vigAmara, sofia: vigSofia, mei: vigMei, priya: vigPriya, layla: vigLayla, emma: vigEmma };

  /* ================================================================== *
   * SHOTS
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

  // 0:04-0:16  Six vignettes, about 2 s each.
  const VIGS = [['amara', 4], ['sofia', 6], ['mei', 8], ['priya', 10], ['layla', 12], ['emma', 14]];
  function vigShot(key, a) {
    return t => {
      const lt = t - a;
      const z = 1.26 + 0.08 * io((lt + 0.3) / 2.6);
      const dx = (VIGS.findIndex(v => v[0] === key) % 2 ? -1 : 1) * 16 * io((lt + 0.3) / 2.6);
      return cam(CX, 900, z, VIG[key](t, { mode: 'notify', lt }), dx, 0) + warm(0.12) + vignette(0.7);
    };
  }

  // 0:16-0:28  Sneak peek: the door opens a little; real screens float out.
  function deviceFrame(cx, cy, w, screen, rot, sc, op, blur, t) {
    const h = w * 0.625, b = 18;
    const id = uid('df');
    const inner = `<rect x="${-w / 2 - b}" y="${-h / 2 - b}" width="${w + 2 * b}" height="${h + 2 * b}" rx="34" fill="#2A211E" filter="url(#fSoft)"/>
      <clipPath id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16"/></clipPath>
      <g clip-path="url(#${id})">${img(SCR[screen], -w / 2, -h / 2, w, h)}
      <rect x="${f1(-w / 2 - w + ((t * 0.35) % 1) * w * 3)}" y="${-h / 2}" width="${f1(w * 0.5)}" height="${h}" fill="url(#gShine)" transform="skewX(-20)"/></g>`;
    return `<g opacity="${f3(op)}" transform="translate(${f1(cx)},${f1(cy)}) rotate(${f1(rot)}) scale(${sc.toFixed(4)})">${blurG(blur, inner)}</g>`;
  }
  function peekTag(x, y, k, t) {
    if (k <= 0) return '';
    const wob = Math.sin(t * 4) * 2;
    const sc = back(k);
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(-7 + wob)}) scale(${f3(sc)})">
      <rect x="-176" y="-38" width="352" height="76" rx="38" fill="${P.peach}" filter="url(#fSoft)"/>
      <rect x="-168" y="-30" width="336" height="60" rx="30" fill="none" stroke="${P.cream}" stroke-width="3" stroke-dasharray="8 8"/>
      ${txt(26, 13, 'SNEAK PEEK', 32, P.cream, { w: 700, ls: 3 })}
      <g transform="translate(-136,0)"><ellipse rx="20" ry="13" fill="${P.cream}"/><circle r="8" fill="${P.dark}"/><circle cx="3" cy="-3" r="2.5" fill="#fff"/></g>
      ${star(176, -40, 14, P.cream, 0.9 + 0.1 * Math.sin(t * 5), t * 60)}${star(-176, 34, 9, P.cream, 0.8, -t * 50)}</g>`;
  }
  function shotPeek(t) {
    const lt = t - 16;
    let s = pinkMesh(t);
    const open = 0.08 + 0.3 * io(seg(lt, 0.2, 1.4)) + 0.03 * Math.sin(t * 1.5);
    const z = 1.0 + 0.05 * io(lt / 12);
    s += cam(CX, 1000, z, door(t, CX, 1440, 520, 860, open, 1));
    // screens: emerge from the doorway, blur to sharp, float, then lift away
    const screens = [['curriculum', 0.8, 4.5], ['dots', 4.4, 8.3], ['complete', 8.2, 12.4]];
    screens.forEach(([key, a, b], i) => {
      if (lt < a || lt > b + 0.6) return;
      const kin = io(seg(lt, a, a + 1.0)), kout = io(seg(lt, b - 0.1, b + 0.5));
      const x = lerp(CX + 60, CX, kin) - kout * 260, y = lerp(1060, 940, kin) + Math.sin(t * 1.3 + i) * 10 - kout * 420;
      const sc = lerp(0.25, 1, kin) * (1 + 0.04 * seg(lt, a + 1, b)) * lerp(1, 0.7, kout);
      const blur = 16 * (1 - kin) + 10 * kout;
      s += deviceFrame(x, y, 800, key, lerp(4, -2, kin) - 10 * kout, sc, clamp(kin * 1.6) * (1 - kout), blur, t);
      s += peekTag(Math.max(215, x - 220 * sc), y - 285 * sc, seg(lt, a + 0.75, a + 1.15) * (1 - kout), t);
      if (kin > 0.8 && kin < 1) s += A.sparkle(x + 360, y - 240, a + 0.8, lt, P.cream);
    });
    s += `<rect width="1080" height="560" fill="url(#gTopDark)" opacity=".35"/>`;
    s += head(t, 16.35, CX, 420, `A Girl &amp; Her Futures <tspan font-style="italic" fill="${P.dark}">Academy™</tspan>`, 64, P.cream, { max: 840, out: 21.9 });
    if (t > 22.1) {
      const act = lt < 7.6 ? 0 : lt < 9.0 ? 1 : 2;
      const words = ['Structured', 'Visual', 'Self-paced'].map((wd, i) => `<tspan fill="${i === act ? P.dark : P.cream}"${i === act ? ' font-style="italic"' : ''}>${wd}</tspan>`);
      s += head(t, 22.3, CX, 420, words.join(`<tspan fill="${P.cream}"> · </tspan>`), 62, P.cream, { max: 840 });
    }
    return s + vignette(0.35);
  }

  // 0:28-0:30.5  The waitlist phone: tap "Join the waitlist", confirmation.
  function bigPhone(t, x, y, w, h, tapT) {
    const b = 22, sw = w - b * 2, sh = h - b * 2, id = uid('bp');
    const press = Math.sin(Math.PI * seg(t, tapT - 0.05, tapT + 0.12));
    const done = io(seg(t, tapT + 0.1, tapT + 0.35));
    let ui = `<rect width="${sw}" height="${sh}" fill="${P.cream}"/>${glowC(sw * 0.2, 80, 380, 'gPk', 0.7)}${glowC(sw, sh * 0.6, 340, 'gTl', 0.45)}${glowC(sw * 0.3, sh, 360, 'gPc', 0.5)}`;
    ui += `<image href="${LOGO_SRC}" x="${sw / 2 - 80}" y="80" width="160" height="160"/>`;
    ui += txt(sw / 2, 300, 'A Girl &amp; Her Futures', 38, P.dark, { f: PF });
    ui += txt(sw / 2, 346, 'Academy™', 36, P.pink, { f: PF, it: true, w: 400 });
    ui += `<path d="M${sw / 2 - 60},376 Q${sw / 2},392 ${sw / 2 + 60},376" stroke="${P.peach}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // before: the button
    const bw = sw - 70, by = 520;
    const pulse = 1 + 0.03 * Math.sin(t * 6);
    let pre = txt(sw / 2, 450, 'Doors open soon.', 30, P.muted, { w: 500 });
    pre += `<g transform="translate(${sw / 2},${by + 48}) scale(${f3((1 - 0.06 * press) * (done > 0 ? 1 : pulse))})">
      <rect x="${-bw / 2 - 10}" y="-58" width="${bw + 20}" height="116" rx="58" fill="${P.pink}" opacity="${f3(0.25 + 0.15 * Math.sin(t * 6))}" filter="url(#fB8)"/>
      <rect x="${-bw / 2}" y="-48" width="${bw}" height="96" rx="48" fill="${P.pink}"/>
      <rect x="${-bw / 2 + 10}" y="-42" width="${bw - 20}" height="34" rx="17" fill="#fff" opacity=".18"/>
      ${txt(0, 12, 'Join the waitlist', 36, '#FFFFFF', { w: 700 })}</g>`;
    pre += txt(sw / 2, 690, 'Be the first to know.', 28, P.muted, { w: 500 });
    if (press > 0) pre += `<circle cx="${sw / 2 + 40}" cy="${by + 48}" r="${f1(30 + press * 120)}" fill="#fff" opacity="${f3(0.45 * (1 - seg(t, tapT, tapT + 0.3)))}"/>`;
    ui += fade(1 - done, pre);
    if (done > 0) {
      const ck = seg(t, tapT + 0.25, tapT + 0.6);
      let post = `<g transform="translate(${sw / 2},540) scale(${f3(back(done))})"><circle r="110" fill="${P.teal}" opacity=".25"/><circle r="84" fill="${P.teal}"/>
        <path d="M-38,0 L-12,28 L40,-30" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="130" stroke-dashoffset="${f1(130 * (1 - ck))}"/></g>`;
      post += `<text x="${sw / 2}" y="740" font-size="42" font-family="${PF}" font-weight="700" text-anchor="middle" fill="${P.dark}">You’re on the list <tspan font-family="Noto Color Emoji" font-size="36">✨</tspan></text>`;
      post += txt(sw / 2, 796, 'Be the first to know.', 28, P.muted, { w: 500 });
      for (let i = 0; i < 12; i++) {
        const a = rad(i * 30 + 10), d = 120 + ease(ck) * 140;
        post += star(sw / 2 + Math.cos(a) * d, 540 + Math.sin(a) * d, 10 + (i % 3) * 4, [P.pink, P.peach, P.teal][i % 3], f3(clamp(1.4 - ck)), i * 30);
      }
      ui += fade(done, post);
    }
    return `<g transform="translate(${f1(x - w / 2)},${f1(y - h / 2)})">
      <rect x="-8" y="18" width="${w + 16}" height="${h}" rx="84" fill="${P.dark}" opacity=".18" filter="url(#fB16)"/>
      <rect width="${w}" height="${h}" rx="80" fill="#2A211E"/>
      <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="76" fill="none" stroke="#5A4036" stroke-width="3"/>
      <clipPath id="${id}"><rect x="${b}" y="${b}" width="${sw}" height="${sh}" rx="58"/></clipPath>
      <g clip-path="url(#${id})"><g transform="translate(${b},${b})">${ui}</g></g>
      <rect x="${w / 2 - 70}" y="${b + 14}" width="140" height="34" rx="17" fill="#2A211E"/></g>`;
  }
  function tapHand(L, tipX, tipY, k) {
    // pointing hand coming in from the lower right, index fingertip at (tipX, tipY)
    const ang = -128, sc = 2.6;
    const fx = 66 * sc, fy = -11 * sc;
    const ca = Math.cos(rad(ang)), sa = Math.sin(rad(ang));
    const hx = tipX - (fx * ca - fy * sa), hy = tipY - (fx * sa + fy * ca);
    const off = (1 - k) * 700;
    const ox = hx + off * 0.62, oy = hy + off * 0.78;
    const wrist = [ox - ca * 20 * sc, oy - sa * 20 * sc];
    return `<path d="M${f1(wrist[0] + 600 * 0.62)},${f1(wrist[1] + 600 * 0.78)} L${f1(wrist[0])},${f1(wrist[1])}" stroke="${L.topD}" stroke-width="150" stroke-linecap="round"/>
      <path d="M${f1(wrist[0] + 600 * 0.62)},${f1(wrist[1] + 600 * 0.78)} L${f1(wrist[0])},${f1(wrist[1])}" stroke="${L.topC}" stroke-width="136" stroke-linecap="round"/>
      <path d="M${f1(wrist[0] + 40)},${f1(wrist[1] + 50)} L${f1(wrist[0] - 10)},${f1(wrist[1] - 12)}" stroke="${L.topD}" stroke-width="126" stroke-dasharray="4 7"/>
      ${hand(ox, oy, ang, L, 'point', 1, sc)}`;
  }
  function shotPhone(t) {
    const lt = t - 28;
    let s = creamMesh(t) + twinkles(t, 12, 5, [40, 200, 900, 1300], [P.pinkL, P.peachL, P.tealL], { sp: 30, r: 10, op: 0.8 });
    const tapT = 29.05;
    const enter = io(seg(lt, 0, 0.6));
    const py = lerp(1100, 870, enter) + Math.sin(t * 1.4) * 6;
    const z = 1 + 0.05 * io(lt / 2.6);
    let ph = bigPhone(t, CX, py, 500, 1000, tapT);
    const hk = io(seg(t, 28.45, 28.95)) * (1 - io(seg(t, 29.45, 29.95)));
    const press = Math.sin(Math.PI * seg(t, tapT - 0.05, tapT + 0.12));
    if (hk > 0) ph += tapHand(CAST.amara, CX + 130, py - 500 + 22 + 520 + 48 + press * 6, hk);
    s += cam(CX, 900, z, ph);
    s += head(t, 28.15, CX, 280, `Doors open <tspan font-style="italic" fill="${P.pink}">soon.</tspan>`, 80, P.dark, { max: 820 });
    return s;
  }

  // 0:30.5-0:38  Six women: each taps in, then they wave; names pop onto the list card.
  const CELL_BG = { amara: '#FBD3C0', sofia: '#F7E6D8', mei: '#E8E2F4', priya: '#E4ECCB', layla: '#EDD3C2', emma: '#F8DFC2' };
  function gridLayout(t) {
    const k = io(seg(t, 33.2, 33.9));
    const top = lerp(330, 330, k), rowH = lerp(530, 420, k), gap = 14;
    const cells = [];
    ORDER.forEach((key, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      cells.push({ key, i, x: 24 + c * 300, y: top + r * rowH, w: 300 - gap, h: rowH - gap });
    });
    return { cells, k };
  }
  function cellScene(t, key, i, cell, mode) {
    const id = uid('cl');
    const z = cell.w / 640;
    const focusY = mode === 'wave' ? 800 : 870;
    const pose = mode === 'wave' ? { mode: 'wave', mood: i % 2 ? 'laugh' : 'grin' } : { mode: 'tap', k: seg(t, 30.75 + i * 0.32, 30.75 + i * 0.32 + 1.3) };
    const inner = VIG[key](t, pose) + warm(0.1);
    const ccx = cell.x + cell.w / 2, ccy = cell.y + cell.h / 2;
    const pop = back(seg(t, 30.35 + i * 0.08, 30.85 + i * 0.08));
    return `<g transform="translate(${f1(ccx)},${f1(ccy)}) scale(${f3(pop)}) translate(${f1(-ccx)},${f1(-ccy)})">
      <rect x="${cell.x - 4}" y="${cell.y + 8}" width="${cell.w + 8}" height="${cell.h}" rx="34" fill="${P.dark}" opacity=".18" filter="url(#fB8)"/>
      <clipPath id="${id}"><rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" rx="30"/></clipPath>
      <g clip-path="url(#${id})"><rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" fill="${CELL_BG[key]}"/>
        <g transform="translate(${f1(ccx)},${f1(ccy)}) scale(${f3(z * (1 + 0.03 * Math.sin(t * 0.8 + i)))}) translate(${-CX},${-focusY})">${inner}</g></g>
      <rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" rx="30" fill="none" stroke="${P.cream}" stroke-width="6"/></g>`;
  }
  function listCard(t) {
    const k = io(seg(t, 33.6, 34.2));
    if (k <= 0) return '';
    const x = 60, w = 820, y = lerp(1500, 1190, k), h = 210;
    let s = `<g opacity="${f3(k)}">`;
    s += screenBlend(glowE(x + w / 2, y + h / 2, w * 0.7, h * 1.1, 'gPk', 0.7 + 0.2 * Math.sin(t * 3)));
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="${P.cream}" filter="url(#fSoft)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="none" stroke="${P.pink}" stroke-width="6"/>
      <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="28" fill="none" stroke="${P.pinkL}" stroke-width="2" stroke-dasharray="6 8"/>`;
    s += `<text x="${x + w / 2}" y="${y + 56}" font-size="34" font-family="${PF}" font-weight="700" text-anchor="middle" fill="${P.pink}">On the list <tspan font-family="Noto Color Emoji" font-size="28">✨</tspan></text>`;
    ORDER.forEach((key, i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const nx = x + 150 + c * 260, ny = y + 112 + r * 62;
      const at = 34.0 + i * 0.32;
      const pk = back(seg(t, at, at + 0.4));
      if (pk <= 0) return;
      s += `<g transform="translate(${nx},${ny}) scale(${f3(pk)})"><circle cx="-62" cy="-11" r="17" fill="${P.teal}"/><path d="M-70,-11 L-64,-4 L-53,-18" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${txt(-36, 0, NAMES[key], 36, P.dark, { a: 'start', w: 700 })}</g>`;
      s += A.sparkle(nx, ny - 12, at, t, P.pinkL);
    });
    return s + '</g>';
  }
  function shotGrid(t) {
    let s = pinkMesh(t);
    const { cells } = gridLayout(t);
    const mode = t < 33.25 ? 'tap' : 'wave';
    cells.forEach(c => { s += cellScene(t, c.key, c.i, c, mode); });
    s += listCard(t);
    s += `<rect width="1080" height="330" fill="url(#gTopDark)" opacity=".25"/>`;
    s += head(t, 30.6, CX, 268, `Join the <tspan font-style="italic" fill="${P.dark}">waitlist.</tspan>`, 74, P.cream, { max: 820, out: 33.4 });
    s += head(t, 33.75, CX, 268, `<tspan font-style="italic" fill="${P.dark}">HER</tspan> future. <tspan font-style="italic" fill="${P.dark}">HER</tspan> way.`, 80, P.cream, { max: 840 });
    return s;
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
    s += k(38.75, `<text x="${CX}" y="1004" font-size="42" font-family="${PF}" font-style="italic" font-weight="400" text-anchor="middle" fill="${P.cream}">Trading education, reimagined around <tspan fill="${P.dark}">HER.</tspan></text>`);
    s += k(38.9, txt(CX, 1100, 'THE WAITLIST IS OPEN', 40, P.cream, { w: 700, ls: 6 }));
    // pulsing pill button
    const pulse = 1 + 0.035 * Math.sin((t - 39.05) * 4.2);
    const ring = ((t - 39.05) * 0.8) % 1;
    s += k(39.05, `<g transform="translate(${CX},1212) scale(${f3(pulse)})">
      <rect x="${f1(-350 - ring * 40)}" y="${f1(-52 - ring * 22)}" width="${f1(700 + ring * 80)}" height="${f1(104 + ring * 44)}" rx="${f1(52 + ring * 22)}" fill="none" stroke="${P.cream}" stroke-width="4" opacity="${f3((1 - ring) * 0.7)}"/>
      <rect x="-340" y="-30" width="680" height="104" rx="52" fill="${P.dark}" opacity=".16" filter="url(#fB16)"/><rect x="-350" y="-52" width="700" height="104" rx="52" fill="${P.cream}"/>
      <rect x="-338" y="-44" width="676" height="36" rx="18" fill="#fff" opacity=".6"/>
      ${txt(0, 13, 'Join the waitlist · Link in bio', 38, P.pink, { w: 700 })}</g>`);
    s += k(39.2, txt(CX, 1430, 'Trading involves risk.', 26, P.cream, { w: 500, op: 0.9 }));
    return s;
  }

  /* ================================================================== *
   * TIMELINE + TRANSITIONS
   * ================================================================== */
  const SHOTS = [
    { a: 0, f: shotSplash },
    { a: 4, f: vigShot('amara', 4), tr: 'leak', d: 0.8 },
    { a: 6, f: vigShot('sofia', 6), tr: 'glow', d: 0.5 },
    { a: 8, f: vigShot('mei', 8), tr: 'glow', d: 0.5 },
    { a: 10, f: vigShot('priya', 10), tr: 'glow', d: 0.5 },
    { a: 12, f: vigShot('layla', 12), tr: 'glow', d: 0.5 },
    { a: 14, f: vigShot('emma', 14), tr: 'glow', d: 0.5 },
    { a: 16, f: shotPeek, tr: 'leak', d: 0.9 },
    { a: 28, f: shotPhone, tr: 'pink', d: 0.9 },
    { a: 30.5, f: shotGrid, tr: 'dissolve', d: 0.5 },
    { a: 38, f: shotEnd, tr: 'pink', d: 0.9 },
  ];
  // Phone positions in each vignette (for the match cut on the glow).
  const PHONE_AT = [CX + 180, 1180];

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
      case 'glow': {
        const e = Math.sin(Math.PI * k);
        return prev() + fade(io(k), next()) + screenBlend(glowC(PHONE_AT[0], PHONE_AT[1], 200 + 900 * e, 'gPk', e) + glowC(PHONE_AT[0], PHONE_AT[1], 120 + 300 * e, 'gWhite', e * 0.8));
      }
      case 'leak': return (k < 0.5 ? prev() + fade(clamp((k - 0.38) / 0.12), next()) : next() + fade(clamp((0.62 - k) / 0.12), prev())) + leakOverlay(k);
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
    return DEFS + EXTRA_DEFS + body;
  }
  const EXTRA_DEFS = `<defs><linearGradient id="gHome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9B8C6"/><stop offset="1" stop-color="#FAD09A"/></linearGradient></defs>`;

  // Logo layer (drawn as an <img> by waitlist.html).
  function logo(t) {
    if (t >= 0.9 && t < 4.3) {
      const k = back(seg(t, 0.95, 1.55)), out = 1 - ease(seg(t, 3.75, 4.1));
      return { x: CX, y: 560, size: 190 * k * (1 + 0.02 * Math.sin(t * 2.4)), op: clamp((t - 0.95) / 0.2) * out, rot: (1 - clamp(k)) * -18 + Math.sin(t * 1.8) * 1.5 };
    }
    if (t >= 16.3 && t < 28.0) {
      const k = back(seg(t, 16.4, 16.95)), out = 1 - ease(seg(t, 27.5, 27.85));
      return { x: CX, y: 262, size: 150 * k, op: clamp((t - 16.4) / 0.2) * out, rot: Math.sin(t * 2) * 2 };
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
    s += glint(CX + 60, 500, 46, t, 1.45) + glint(CX - 70, 610, 30, t, 2.5) + glint(CX + 40, 210, 30, t, 17.0);
    s += glint(CX + 100, 400, 60, t, 39.1) + glint(CX - 110, 590, 40, t, 41.4) + glint(CX + 90, 420, 50, t, 43.4);
    return s;
  }

  const DURATION = 45;
  const CAP_BOTTOM = 1490;
  const CAPTIONS = [
    { at: 0.15, end: 1.95, text: 'Something new is coming.' },
    { at: 2.0, end: 3.95, text: 'And it was built around her.' },
    { at: 4.0, end: 6.95, text: 'For the woman who’s curious about trading,' },
    { at: 7.0, end: 8.95, text: 'but tired of the hype.' },
    { at: 9.0, end: 11.95, text: 'For the one who wants structure, not signals.' },
    { at: 12.0, end: 13.95, text: 'For the one who has a life,' },
    { at: 14.0, end: 15.95, text: 'and wants to keep it.' },
    { at: 16.0, end: 18.95, text: 'A Girl & Her Futures Academy.' },
    { at: 19.0, end: 21.95, text: 'Structured, visual lessons' },
    { at: 22.0, end: 24.95, text: 'you learn at your own pace.' },
    { at: 25.0, end: 27.95, text: 'Take a peek.' },
    { at: 28.0, end: 30.95, text: 'Doors open soon.' },
    { at: 31.0, end: 32.95, text: 'Join the waitlist' },
    { at: 33.0, end: 37.9, text: 'and be the first to know.' },
  ];

  window.WL = { DURATION, CAP_BOTTOM, CAPTIONS, draw, logo, fx, castSheet, SHOTS };
})();
