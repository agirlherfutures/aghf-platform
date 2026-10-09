/**
 * scenes-her-own.js: "A Life of HER Own", the 60s vertical lifestyle commercial
 * for A Girl & Her Futures Academy™ (1080x1920, 30 fps).
 *
 * window.HO.draw(t) returns the SVG markup for the frame at time t. Everything
 * is a pure function of t (no state between frames), so renders are
 * frame-accurate. Small primitives come from ../illustrations.js (window.ART);
 * the hero cast (Maya and her daughter, Zuri, Simone, friends) is drawn here at
 * large scale with blinking, breathing and moving hair.
 *
 * TikTok safe zone: text and faces stay inside x 0..940, y 150..1520.
 * On-screen headlines sit at the top (y 200..460); the caption band sits at the
 * bottom of the safe zone (bottom edge y CAP_BOTTOM).
 *
 * Real Academy screens (./assets/0N-*.jpg, 1440x900, 16:10) are the only
 * platform screens shown; they are clipped into the laptop screens.
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
  const CAST = {
    maya: {
      name: 'maya', skin: '#A86F4E', shade: '#8A5539', hi: '#C48C67', hair: '#24160F', hairHi: '#4B3123', lip: '#9A4B44', lipD: '#6E2E2A',
      liner: '#1C100B', iris: '#3E2318', shadow: '#B98A6A', blush: '#E87B78',
      style: 'puff', top: 'sweater', topC: '#F4E7D7', topD: '#DCC6AE', topL: '#FFF8EE', ear: 'hoop',
      pants: '#6D7FA1', pantsD: '#56678A', shoe: '#F1E6D9', shoeD: '#CDBBA8',
    },
    kid: {
      name: 'kid', kid: true, skin: '#A86F4E', shade: '#8A5539', hi: '#C48C67', hair: '#24160F', hairHi: '#4B3123', lip: '#B0585A', lipD: '#7A3434',
      liner: '#1C100B', iris: '#3E2318', blush: '#F08A8C',
      style: 'twopuff', top: 'kidtee', topC: '#FAD09A', topD: '#E9B677', topL: '#FFE6BF', shortSleeve: true,
      pants: '#9C94E6', pantsD: '#7F77DD', shoe: '#FFFFFF', shoeD: '#F4829A',
    },
    zuri: {
      name: 'zuri', skin: '#6B4029', shade: '#51301E', hi: '#86563B', hair: '#1B110B', hairHi: '#43302A', lip: '#7C3A33', lipD: '#4E211D',
      liner: '#140B07', iris: '#2E180F', blush: '#C9615E',
      style: 'braids', top: 'cardigan', topC: '#A9C2A0', topD: '#87A37E', topL: '#C2D8BA', tee: '#FCF9F4', glasses: true, ear: 'stud',
      pants: '#7B90B0', pantsD: '#62779A', shoe: '#F6F1EA', shoeD: '#D9CFC3',
    },
    simone: {
      name: 'simone', skin: '#90593A', shade: '#73432A', hi: '#AA7151', hair: '#18100C', hairHi: '#4A3832', lip: '#A44C5A', lipD: '#71303A',
      liner: '#170D09', iris: '#3A2016', shadow: '#9C6A6A', blush: '#E07B84',
      style: 'bob', top: 'blazer', topC: '#C79C6B', topD: '#A57B4D', topL: '#DDB88B', blouse: '#F8CBD1', blouseD: '#EBAFB8', ear: 'pearl',
      pants: '#4B352B', pantsD: '#38261E', shoe: '#E8B3A2', shoeD: '#C98E7C', heels: true,
    },
  };
  const FRIENDS = {
    amara: { name: 'amara', skin: '#5A3624', shade: '#432616', hi: '#74472F', hair: '#1A100A', hairHi: '#3F2C22', lip: '#6E3530', lipD: '#45201C', liner: '#120A06', iris: '#2B160E', blush: '#B95A55',
      style: 'locs', top: 'tee', topC: '#F5A857', topD: '#D98B3C', topL: '#FBC487', shortSleeve: true, ear: 'stud', pants: '#4E5A78', pantsD: '#3D4762', shoe: '#fff', shoeD: '#ddd' },
    lena: { name: 'lena', skin: '#E7BE9C', shade: '#CF9F7C', hi: '#F2D2B6', hair: '#6B3F26', hairHi: '#93603D', lip: '#C2646A', lipD: '#8E3E44', liner: '#3A2016', iris: '#5A3A22', blush: '#F0868C',
      style: 'long', top: 'tee', topC: '#CECBF6', topD: '#ABA5EC', topL: '#E4E2FB', ear: 'stud', pants: '#6D7FA1', pantsD: '#56678A', shoe: '#fff', shoeD: '#ddd' },
    kemi: { name: 'kemi', skin: '#7E4B30', shade: '#633820', hi: '#986246', hair: '#1E130C', hairHi: '#433026', lip: '#7E3B37', lipD: '#4E201C', liner: '#140B07', iris: '#2E180F', blush: '#C9615E',
      style: 'afro', top: 'tee', topC: '#7ECEC4', topD: '#5DB3A8', topL: '#B2E4DF', shortSleeve: true, ear: 'hoop', pants: '#3D3550', pantsD: '#2D2640', shoe: '#fff', shoeD: '#ddd' },
    rosa: { name: 'rosa', skin: '#C79270', shade: '#AB7655', hi: '#DCAA89', hair: '#2A1A12', hairHi: '#54392A', lip: '#B0535C', lipD: '#7B323A', liner: '#21130C', iris: '#3E2318', blush: '#EA8088',
      style: 'curly', top: 'tee', topC: '#F9B8C6', topD: '#F08FA5', topL: '#FDD5DE', ear: 'stud', pants: '#5C4A6E', pantsD: '#4A3A5A', shoe: '#fff', shoeD: '#ddd' },
    nia: { name: 'nia', skin: '#9A6343', shade: '#7D4C30', hi: '#B57B58', hair: '#1C120D', hairHi: '#45322A', lip: '#934550', lipD: '#652A33', liner: '#170D09', iris: '#3A2016', blush: '#DA7680',
      style: 'bun', top: 'tee', topC: '#FAD09A', topD: '#EBB46D', topL: '#FFE3BC', ear: 'pearl', pants: '#3D3550', pantsD: '#2D2640', shoe: '#fff', shoeD: '#ddd' },
    jo: { name: 'jo', skin: '#D9A882', shade: '#BD8B65', hi: '#EBC2A0', hair: '#2E1E14', hairHi: '#5A4030', lip: '#B4606A', lipD: '#80404A', liner: '#2A1810', iris: '#4A2E1C', blush: '#EE8A8E',
      style: 'bob', top: 'tee', topC: '#B2E4DF', topD: '#8FCFC7', topL: '#D3F0EC', ear: 'stud', pants: '#4E5A78', pantsD: '#3D4762', shoe: '#fff', shoeD: '#ddd' },
  };

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
    let open = typeof M.eye === 'number' ? M.eye * (1 - bl) : 1;
    if (ly > 3 && typeof M.eye === 'number') open *= 0.86;
    const emode = typeof M.eye === 'string' ? M.eye : 'open';
    const tw = (o.turn || 0) * 14;
    let s = `<g transform="translate(${f1(tw)},0)">`;
    // blush
    s += `<g filter="url(#fB3)" opacity="${o.blushOp || 0.34}"><ellipse cx="-52" cy="46" rx="19" ry="10" fill="${L.blush}"/><ellipse cx="52" cy="46" rx="19" ry="10" fill="${L.blush}"/></g>`;
    s += eye(-35, -1, L, o, open, emode, lx, ly, kid) + eye(35, 1, L, o, open, emode, lx, ly, kid);
    // brows
    const b = M.brow + (o.browLift || 0), br = M.browR != null ? M.browR : b, kn = M.knit || 0;
    const brow = (sx, d) => `<path d="M${f1(sx * (14 - kn))},${f1(-30 + d + kn)} Q${f1(sx * 30)},${f1(-46 + d)} ${f1(sx * 50)},${f1(-36 + d * 0.6)}" stroke="${L.hair === '#6B3F26' ? '#5A341F' : L.liner}" stroke-width="${kid ? 6 : 7.5}" fill="none" stroke-linecap="round"/>`;
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
    const face = kid
      ? 'M-84,-4 C-86,-76 -48,-108 0,-108 C48,-108 86,-76 84,-4 C83,52 50,98 0,100 C-50,98 -83,52 -84,-4 Z'
      : 'M-80,-6 C-82,-76 -46,-108 0,-108 C46,-108 82,-76 80,-6 C79,50 48,100 0,106 C-48,100 -79,50 -80,-6 Z';
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
    s += hairFront(t, L, o);
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
    const B = L.kid ? BODY.kid : BODY.adult;
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
    const B = L.kid ? BODY.kid : BODY.adult, s = o.s || 1, seed = o.seed || 1;
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
  // Kid from behind, walking away (two puffs, pink backpack).
  function kidBack(t, o) {
    const L = CAST.kid, B = BODY.kid, s = o.s || 1;
    const ph = t * 7.5;
    const bob = -Math.abs(Math.cos(ph)) * 8;
    let out = `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s})"><g transform="translate(0,${f1(bob)})">`;
    [-1, 1].forEach((sd, i) => {
      const lift = Math.max(0, Math.sin(ph + (i ? Math.PI : 0)));
      out += `<path d="M${sd * 34},${B.hipY - 16} L${sd * 36},${B.kneeY - lift * 30} L${sd * 36},${B.footY - 30 - lift * 40}" stroke="${L.pants}" stroke-width="${B.legW}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse cx="${sd * 38}" cy="${f1(B.footY - 8 - lift * 40)}" rx="30" ry="16" fill="#fff"/>`;
    });
    out += `<path d="M-40,${B.shY - 46} C-90,${B.shY - 40} -100,${B.shY} -100,${B.shY + 40} L-${B.hipW},${B.hipY + 10} L${B.hipW},${B.hipY + 10} L100,${B.shY + 40} C100,${B.shY} 90,${B.shY - 40} 40,${B.shY - 46} Z" fill="${L.topC}"/>`;
    [-1, 1].forEach((sd, i) => {
      const sw = Math.sin(ph + (i ? Math.PI : 0)) * 14;
      out += `<path d="M${sd * 84},${B.shY} L${sd * 96 + sw},${B.shY + 110} L${sd * 92 + sw * 1.4},${B.shY + 190}" stroke="${L.skin}" stroke-width="${B.armW - 8}" fill="none" stroke-linecap="round"/><path d="M${sd * 84},${B.shY} L${sd * 92},${B.shY + 60}" stroke="${L.topC}" stroke-width="${B.armW + 4}" stroke-linecap="round"/>`;
    });
    // backpack
    out += `<rect x="-76" y="${B.shY - 30}" width="152" height="190" rx="46" fill="${P.pink}"/><rect x="-54" y="${B.shY + 70}" width="108" height="76" rx="26" fill="#F0697F"/><path d="M-30,${B.shY + 92} L30,${B.shY + 92}" stroke="${P.pinkL}" stroke-width="6" stroke-linecap="round"/><rect x="-24" y="${B.shY - 50}" width="48" height="26" rx="12" fill="none" stroke="#F0697F" stroke-width="8"/>${heart(40, B.shY + 20, 0.6, '#fff')}`;
    out += `<path d="M-14,60 L-12,${B.shY - 40} L12,${B.shY - 40} L14,60 Z" fill="${L.shade}"/>`;
    out += hairBack(t, L, { seed: 3 }) + `<ellipse cx="0" cy="-6" rx="88" ry="100" fill="${L.hair}"/>` + [-1, 1].map(sd => `<ellipse cx="${sd * 84}" cy="10" rx="13" ry="19" fill="${L.skin}"/>`).join('');
    out += `<path d="M0,-104 L0,-20" stroke="${L.hairHi}" stroke-width="4" opacity=".7"/>`;
    out += '</g></g>';
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
   * CAST SHEET (her-own.html?cast=1)
   * ================================================================== */
  function castSheet(t) {
    UID = 0;
    let s = DEFS + `<rect width="1080" height="1920" fill="#FFF6F0"/>`;
    s += fig(t, CAST.maya, { x: 180, y: 300, s: 0.72, seed: 1, mood: 'smile' });
    s += fig(t, CAST.zuri, { x: 540, y: 300, s: 0.72, seed: 2, mood: 'smile' });
    s += fig(t, CAST.simone, { x: 900, y: 300, s: 0.72, seed: 3, mood: 'smile' });
    s += `<rect y="690" width="1080" height="10" fill="#FFF6F0"/>`;
    s += fig(t, CAST.maya, { x: 140, y: 820, s: 0.5, body: 'full', mood: 'laugh', seed: 1 });
    s += fig(t, CAST.zuri, { x: 400, y: 820, s: 0.5, body: 'full', legs: 'walk', mood: 'curious', seed: 2, tote: true });
    s += fig(t, CAST.simone, { x: 660, y: 820, s: 0.5, body: 'full', mood: 'relief', seed: 3 });
    s += fig(t, CAST.kid, { x: 900, y: 920, s: 0.55, body: 'full', mood: 'laugh', seed: 4, straps: true });
    const fr = Object.values(FRIENDS);
    fr.forEach((L, i) => { s += fig(t, L, { x: 100 + i * 176, y: 1420, s: 0.42, seed: 5 + i, mood: i % 2 ? 'laugh' : 'grin' }); });
    s += figBack(t, CAST.maya, { x: 200, y: 1720, s: 0.6 }) + figBack(t, CAST.simone, { x: 520, y: 1720, s: 0.6 }) + kidBack(t, { x: 820, y: 1600, s: 0.4 });
    return s;
  }


  /* ================================================================== *
   * ENVIRONMENTS
   * ================================================================== */
  const MAYA = CAST.maya, ZURI = CAST.zuri, SIM = CAST.simone, KID = CAST.kid;
  // global point -> figure-local point
  const loc = (fx, fy, fs, gx, gy) => [(gx - fx) / fs, (gy - fy) / fs];

  function books(x0, x1, yBase, h, seed) {
    const cols = [P.pinkL, P.tealL, P.peachL, P.purpleL, '#E9DCCB', '#C9A88C', P.pink, P.teal, '#B98B6E', '#F3E9DF'];
    let s = '', x = x0, i = 0;
    while (x < x1) {
      const w = 16 + hash(i + seed) * 22, hh = h * (0.68 + hash(i * 3 + seed) * 0.32);
      const lean = hash(i * 7 + seed) > 0.9 ? 8 : 0;
      s += `<rect x="${f1(x)}" y="${f1(yBase - hh)}" width="${f1(w)}" height="${f1(hh)}" rx="3" fill="${cols[Math.floor(hash(i * 5 + seed) * cols.length)]}" transform="rotate(${lean} ${f1(x)} ${f1(yBase)})"/>`;
      s += `<rect x="${f1(x + 3)}" y="${f1(yBase - hh * 0.8)}" width="${f1(w - 6)}" height="5" fill="#fff" opacity=".35"/>`;
      x += w + 3; i++;
    }
    return s;
  }
  function shelves(x, w, y0, n, gap, seed) {
    let s = `<rect x="${x}" y="${y0 - 40}" width="${w}" height="${n * gap + 60}" fill="#C99D78"/>`;
    for (let i = 0; i < n; i++) {
      const y = y0 + i * gap;
      s += `<rect x="${x + 14}" y="${y - gap + 34}" width="${w - 28}" height="${gap - 34}" fill="#9E7558"/>`;
      s += books(x + 20, x + w - 40, y, gap - 50, seed + i * 13);
      s += `<rect x="${x}" y="${y}" width="${w}" height="18" fill="#D9B08C"/>`;
    }
    return s;
  }

  // Dawn kitchen (Maya).
  function kitchen(t, o = {}) {
    let s = `<rect width="1080" height="1920" fill="#FBE5D6"/>`;
    const view = `<rect x="60" y="300" width="500" height="640" fill="url(#gDawn)"/>` + glowC(330, 790, 300, 'gSun', 1) + glowC(330, 790, 80, 'gWhite', 0.95)
      + `<path d="M60,850 Q150,800 240,836 T420,818 T600,850 L600,960 L60,960 Z" fill="#E9B8B2" opacity=".85"/><path d="M60,890 Q170,856 290,884 T600,876 L600,960 L60,960 Z" fill="#DCA3A8" opacity=".9"/>`;
    s += windowFrame(80, 330, 440, 570, view, { frame: '#FFF8F2', sw: 22 });
    s += plant(170, 878, 0.5, '#86B596', P.teal) + `<rect x="330" y="836" width="56" height="62" rx="12" fill="${P.pinkL}"/><rect x="398" y="850" width="44" height="48" rx="10" fill="${P.peachL}"/>`;
    // cabinets and shelf
    s += `<rect x="620" y="250" width="480" height="400" rx="10" fill="#F8EFE6"/><path d="M860,250 L860,650" stroke="#EAD9C9" stroke-width="6"/>
      <rect x="836" y="570" width="10" height="50" rx="5" fill="${P.gold}"/><rect x="874" y="570" width="10" height="50" rx="5" fill="${P.gold}"/>
      <rect x="640" y="822" width="460" height="16" rx="6" fill="#E8CDB4"/>
      <rect x="670" y="740" width="54" height="82" rx="14" fill="${P.tealL}"/><rect x="664" y="730" width="66" height="18" rx="8" fill="${P.teal}"/>
      <rect x="748" y="760" width="48" height="62" rx="12" fill="${P.peachL}"/><rect x="744" y="752" width="56" height="14" rx="7" fill="${P.peach}"/>
      <rect x="820" y="726" width="58" height="96" rx="16" fill="${P.pinkP}"/><rect x="814" y="718" width="70" height="16" rx="8" fill="${P.pink}"/>`;
    s += `<rect x="-10" y="930" width="1100" height="290" fill="#F8DCCB"/>`;
    for (let x = 0; x < 1100; x += 72) s += `<path d="M${x},930 L${x},1220" stroke="#F2CDB9" stroke-width="3"/>`;
    for (let y = 930; y < 1220; y += 72) s += `<path d="M0,${y} L1100,${y}" stroke="#F2CDB9" stroke-width="3"/>`;
    // kettle
    s += `<g transform="translate(940,1150)"><path d="M-80,40 C-90,-40 -50,-80 0,-80 C50,-80 90,-40 80,40 Z" fill="${P.teal}"/><path d="M-80,40 L80,40" stroke="#5DB3A8" stroke-width="10" stroke-linecap="round"/>
      <path d="M-40,-80 Q0,-130 40,-80" stroke="#3D2B20" stroke-width="10" fill="none"/><path d="M70,-10 L120,-50" stroke="${P.teal}" stroke-width="22" stroke-linecap="round"/><path d="M-50,-50 Q-60,-10 -54,20" stroke="#fff" stroke-width="8" fill="none" opacity=".4" stroke-linecap="round"/></g>`;
    s += steam(t, 1068, 1080, 1.3, 0.75, 3);
    // window light
    s += screenBlend(`<path d="M120,340 L520,340 L1100,1500 L620,1700 Z" fill="url(#gBeam)" opacity=".5"/>` + glowC(330, 640, 700, 'gWarm', 0.35));
    s += motes(t, 18, 3, [200, 500, 700, 900]);
    return s;
  }
  function kitchenCounter(t, y = 1214) {
    return `<rect x="-10" y="${y}" width="1100" height="44" fill="#EBD5BE"/><rect x="-10" y="${y}" width="1100" height="9" fill="#FFF4E8"/>
      <rect x="-10" y="${y + 44}" width="1100" height="${1940 - y}" fill="#F2DFCF"/>
      <rect x="30" y="${y + 90}" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/><rect x="380" y="${y + 90}" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/><rect x="730" y="${y + 90}" width="320" height="600" rx="14" fill="none" stroke="#E6CDB8" stroke-width="6"/>
      <rect x="160" y="${y + 120}" width="60" height="10" rx="5" fill="${P.gold}"/><rect x="510" y="${y + 120}" width="60" height="10" rx="5" fill="${P.gold}"/><rect x="860" y="${y + 120}" width="60" height="10" rx="5" fill="${P.gold}"/>`;
  }
  function kitchenTable(y = 1250) {
    return `<rect x="-10" y="${y}" width="1100" height="40" fill="#E2BE98"/><rect x="-10" y="${y}" width="1100" height="8" fill="#F3DCC3"/><rect x="-10" y="${y + 40}" width="1100" height="${1940 - y}" fill="#D6AD85"/>
      <path d="M-10,${y + 40} L1100,${y + 40}" stroke="#B88C66" stroke-width="5"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M-10,${y + 110 + i * 70} Q540,${y + 100 + i * 70} 1100,${y + 118 + i * 70}" stroke="#C99D77" stroke-width="3" fill="none" opacity=".6"/>`).join('')}`;
  }
  function bowl(x, y, sc, fill) {
    let s = `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><ellipse cx="0" cy="6" rx="78" ry="12" fill="#2C1810" opacity=".12"/>
      <path d="M-76,-40 Q-72,6 0,8 Q72,6 76,-40 Z" fill="#FFFFFF"/><path d="M-76,-40 Q-72,6 0,8 Q72,6 76,-40" fill="none" stroke="${P.pinkL}" stroke-width="4"/>
      <ellipse cx="0" cy="-40" rx="76" ry="15" fill="${P.pinkP}"/><path d="M-60,-22 Q0,-10 60,-22" stroke="${P.pink}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    const n = Math.floor(fill * 16);
    for (let i = 0; i < n; i++) {
      const cx = -56 + hash(i + 3) * 112, cy = -40 - fill * 6 + (hash(i + 8) - 0.5) * 12;
      s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="8" fill="none" stroke="${[P.peach, P.pinkL, P.peachL, '#E7B36A'][i % 4]}" stroke-width="6"/>`;
    }
    return s + '</g>';
  }
  function cerealBox(x, y, rot, sc = 1) {
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${sc})">
      <rect x="-56" y="-80" width="112" height="160" rx="8" fill="${P.peach}"/><rect x="-56" y="-80" width="112" height="30" rx="8" fill="#E8913C"/>
      <circle cx="0" cy="10" r="36" fill="${P.cream}"/><circle cx="-12" cy="6" r="11" fill="none" stroke="${P.pink}" stroke-width="7"/><circle cx="12" cy="16" r="11" fill="none" stroke="${P.teal}" stroke-width="7"/>
      ${star(30, -26, 12, '#fff')}<rect x="-40" y="56" width="80" height="10" rx="5" fill="#fff" opacity=".7"/></g>`;
  }

  // Front hallway with the door on the right (morning).
  function hallway(t, doorK) {
    let s = `<rect width="1080" height="1920" fill="#F7DED6"/>`;
    s += `<rect x="-10" y="1060" width="1100" height="420" fill="#FBEFE8"/><path d="M-10,1060 L1100,1060" stroke="#EBCFC4" stroke-width="10"/>`;
    for (let x = 30; x < 700; x += 170) s += `<rect x="${x}" y="1110" width="130" height="300" rx="8" fill="none" stroke="#EFD9CF" stroke-width="5"/>`;
    // frames
    s += `<rect x="70" y="520" width="190" height="240" rx="10" fill="#fff"/><rect x="88" y="538" width="154" height="204" fill="${P.peachP}"/>${heart(165, 650, 2.2, P.pink, 0.85)}
      <rect x="300" y="600" width="150" height="150" rx="10" fill="#fff"/><rect x="316" y="616" width="118" height="118" fill="${P.tealP}"/><circle cx="375" cy="690" r="28" fill="${P.teal}"/><rect x="316" y="700" width="118" height="34" fill="#BFE6DF"/>`;
    // hooks with a yellow raincoat and a hat
    s += `<rect x="470" y="700" width="200" height="16" rx="8" fill="#C99D78"/><path d="M520,716 C470,760 470,960 500,1000 L600,1000 C630,960 610,760 560,716 Z" fill="${P.peachL}"/><path d="M540,716 L540,1000" stroke="#E7B36A" stroke-width="4"/>`;
    // floor
    s += `<rect x="-10" y="1460" width="1100" height="470" fill="#E3C2A0"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${-200 + i * 160},1940 L${300 + i * 70},1460" stroke="#D2AE89" stroke-width="4"/>`;
    s += `<path d="M120,1560 L760,1560 L820,1900 L60,1900 Z" fill="${P.pinkL}" opacity=".75"/><path d="M150,1590 L750,1590 L800,1870 L90,1870 Z" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10" opacity=".7"/>`;
    // door opening with the bright morning outside
    const dx = 730, dw = 320, dy = 560, dh = 900;
    const out = `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="url(#gDawn)"/>${glowC(dx + 160, dy + 380, 380, 'gSun', 1)}
      <rect x="${dx}" y="${dy + 600}" width="${dw}" height="${dh - 600}" fill="#D7E8C6"/><path d="M${dx + 120},${dy + dh} L${dx + 180},${dy + 600} L${dx + 210},${dy + 600} L${dx + 250},${dy + dh} Z" fill="#F6E9D8"/>
      <circle cx="${dx + 60}" cy="${dy + 520}" r="90" fill="#B9D8A8"/><circle cx="${dx + 280}" cy="${dy + 500}" r="110" fill="#C9E0B0"/>`;
    const id = uid('door');
    s += `<clipPath id="${id}"><rect x="${dx}" y="${dy}" width="${dw}" height="${dh}"/></clipPath><g clip-path="url(#${id})">${out}</g>`;
    const lw = dw * (1 - 0.82 * doorK);
    s += `<rect x="${f1(dx + dw - lw)}" y="${dy}" width="${f1(lw)}" height="${dh}" fill="#F5E6DA"/><rect x="${f1(dx + dw - lw + lw * 0.12)}" y="${dy + 80}" width="${f1(lw * 0.76)}" height="320" rx="8" fill="none" stroke="#E5D1C2" stroke-width="6"/><rect x="${f1(dx + dw - lw + lw * 0.12)}" y="${dy + 480}" width="${f1(lw * 0.76)}" height="340" rx="8" fill="none" stroke="#E5D1C2" stroke-width="6"/>
      <circle cx="${f1(dx + dw - lw + 34)}" cy="${dy + 470}" r="12" fill="${P.gold}"/>`;
    s += `<rect x="${dx - 26}" y="${dy - 26}" width="${dw + 52}" height="${dh + 26}" fill="none" stroke="#FFFFFF" stroke-width="26"/>`;
    // spill of light on the floor
    s += screenBlend(`<path d="M${dx},${dy + dh} L${dx + dw},${dy + dh} L${dx + dw + 120},1920 L${dx - 380},1920 Z" fill="#FFF1D6" opacity="${f3(0.15 + 0.55 * doorK)}" filter="url(#fB16)"/>` + glowC(dx + 160, dy + 400, 600, 'gWarm', 0.25 + 0.5 * doorK));
    return s;
  }

  // Library with an arched window and bookshelves (Zuri).
  function library(t) {
    let s = `<rect width="1080" height="1920" fill="#F2DFCE"/>`;
    s += shelves(-30, 230, 380, 6, 150, 11) + shelves(830, 280, 380, 6, 150, 37);
    const ax = 250, aw = 560, ay = 300, ah = 840;
    const arch = `M${ax},${ay + ah} L${ax},${ay + aw / 2} A${aw / 2},${aw / 2} 0 0,1 ${ax + aw},${ay + aw / 2} L${ax + aw},${ay + ah} Z`;
    const id = uid('arch');
    s += `<clipPath id="${id}"><path d="${arch}"/></clipPath><g clip-path="url(#${id})"><rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="url(#gGolden)"/>
      ${glowC(ax + 380, ay + 420, 360, 'gSun', 1)}
      <circle cx="${ax + 60}" cy="${ay + 700}" r="170" fill="#B9CF9A"/><circle cx="${ax + 260}" cy="${ay + 760}" r="150" fill="#A9C48E"/><circle cx="${ax + 500}" cy="${ay + 720}" r="190" fill="#C6D7A0"/>
      <circle cx="${ax + 130}" cy="${ay + 600}" r="90" fill="${P.peachL}" opacity=".5"/></g>`;
    s += `<path d="${arch}" fill="none" stroke="#FFF7EE" stroke-width="26"/><path d="M${ax + aw / 2},${ay} L${ax + aw / 2},${ay + ah} M${ax},${ay + 520} L${ax + aw},${ay + 520}" stroke="#FFF7EE" stroke-width="14"/>`;
    // window seat
    s += `<rect x="150" y="1140" width="760" height="70" rx="20" fill="${P.pinkP}"/><rect x="120" y="1200" width="820" height="740" fill="#E9CDB6"/><rect x="150" y="1240" width="360" height="300" rx="12" fill="none" stroke="#DDBDA2" stroke-width="6"/><rect x="550" y="1240" width="360" height="300" rx="12" fill="none" stroke="#DDBDA2" stroke-width="6"/>`;
    s += `<rect x="760" y="1040" width="150" height="120" rx="40" fill="${P.tealL}" transform="rotate(8 835 1100)"/>`;
    s += screenBlend(`<path d="M${ax + 100},${ay + 200} L${ax + aw},${ay + 200} L1100,1700 L300,1800 Z" fill="url(#gBeam)" opacity=".45"/>` + glowC(ax + 380, ay + 500, 700, 'gWarm', 0.3));
    s += motes(t, 16, 9, [260, 600, 600, 800]);
    return s;
  }

  // Leafy campus walk at golden hour, camera dollying back (Zuri).
  function campus(t, lt) {
    const H = 960, VX = 470;
    let s = `<rect width="1080" height="1920" fill="url(#gGolden)"/>` + glowC(820, 520, 520, 'gSun', 1) + glowC(820, 520, 120, 'gWhite', 0.9);
    // far buildings
    const bx = -lt * 6;
    s += `<g transform="translate(${f1(bx)},0)"><path d="M-40,${H} L-40,760 L140,760 L140,700 L230,640 L320,700 L320,${H} Z" fill="#E7B9A2" opacity=".85"/>
      <rect x="560" y="660" width="80" height="300" fill="#E2AF98" opacity=".85"/><path d="M550,660 L600,580 L650,660 Z" fill="#D59C8A" opacity=".85"/><circle cx="600" cy="700" r="22" fill="#FFF3E6" opacity=".9"/>
      <rect x="640" y="770" width="460" height="190" fill="#EBC1A8" opacity=".85"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${670 + i * 70}" y="800" width="34" height="56" rx="17" fill="#FFF0DC" opacity=".8"/>`).join('')}
      ${[0, 1, 2].map(i => `<rect x="${-10 + i * 60}" y="790" width="30" height="50" rx="15" fill="#FFF0DC" opacity=".8"/>`).join('')}</g>`;
    // lawn and path
    s += `<rect x="-10" y="${H}" width="1100" height="${1930 - H}" fill="#B8CF8E"/><rect x="-10" y="${H}" width="1100" height="60" fill="#CBD9A0" opacity=".8"/>`;
    s += `<path d="M${VX - 26},${H} L${VX + 26},${H} L${VX + 520},1930 L${VX - 520},1930 Z" fill="#EEDFC9"/>`;
    for (let i = 0; i < 12; i++) {
      const z = ((i * 0.5 + lt * 0.42) % 6) + 0.55;
      const y = H + 560 / z;
      s += `<path d="M${f1(VX - 500 / z)},${f1(y)} L${f1(VX + 500 / z)},${f1(y)}" stroke="#E0CDB2" stroke-width="${f1(Math.max(1, 8 / z))}"/>`;
    }
    // friend on the lawn, waving
    const fk = seg(lt, 0.9, 1.2);
    const wav = Math.sin(t * 10) * 14;
    const fpos = [230 + lt * 8, 870];
    s += fig(t, FRIENDS.kemi, { x: fpos[0], y: fpos[1], s: 0.2, body: 'full', seed: 7, mood: lt > 1 ? 'grin' : 'smile', hR: lt > 0.9 ? [190 + wav, -60] : undefined, kR: lt > 0.9 ? 'open' : 'rest' });
    s += fig(t, FRIENDS.lena, { x: 760 - lt * 10, y: 880, s: 0.17, body: 'full', legs: 'walk', seed: 9, mood: 'smile' });
    // trees on both sides, receding as the camera pulls back
    const trees = [];
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1;
      const z = ((i * 0.62 + lt * 0.38) % 6.2) + 0.5;
      trees.push({ z, side, i });
    }
    trees.sort((a, b) => b.z - a.z).forEach(({ z, side, i }) => {
      const x = VX + side * (360 + hash(i) * 60) / z, y = H + 560 / z, sc = 0.95 / z;
      const op = clamp((6.5 - z) / 1.2);
      const cols = hash(i + 4) > 0.5 ? ['#9DBE84', '#B5CE8E', '#C6D69A', '#F2C27E'] : ['#A9C48A', '#8FB27C', '#D1DC9E', '#F5B472'];
      s += `<g opacity="${f3(op)}">${tree(x, y, sc, cols, t, i)}</g>`;
    });
    return s;
  }

  // Lecture hall: tiered rows behind her (Zuri).
  function lectureHall(t) {
    let s = `<rect width="1080" height="1920" fill="#EBCDB0"/>`;
    s += `<rect x="-20" y="160" width="300" height="900" fill="#FFF3DE"/><path d="M130,160 L130,1060 M-20,600 L280,600" stroke="#E8C7A6" stroke-width="14"/>` + glowC(120, 560, 420, 'gSun', 0.9);
    s += screenBlend(`<path d="M0,200 L280,200 L1100,1300 L600,1500 Z" fill="url(#gBeam)" opacity=".5"/>`);
    const heads = [['#2A1A12', '#C68B62', P.tealL], ['#6B3F26', '#E7BE9C', P.purpleL], ['#1A100A', '#7A4A30', P.peachL], ['#2E1E14', '#D9A882', P.pinkL], ['#1E130C', '#5A3624', '#E9DCCB']];
    for (let r = 0; r < 4; r++) {
      const y = 520 + r * 170, sc = 0.55 + r * 0.12;
      for (let i = 0; i < 7; i++) {
        const x = 330 + i * 120 * sc + (r % 2) * 60 - r * 40;
        if (hash(i * 3 + r) > 0.62) continue;
        const [hc, sk, sh] = heads[(i + r) % 5];
        const bb = Math.sin(t * 1.6 + i + r) * 3;
        s += `<g transform="translate(${f1(x)},${f1(y + bb)}) scale(${sc.toFixed(2)})"><path d="M-60,120 Q-60,50 0,46 Q60,50 60,120 Z" fill="${sh}"/><circle cx="0" cy="0" r="40" fill="${sk}"/><path d="M-42,-4 C-44,-50 44,-50 42,-4 C30,-26 -30,-26 -42,-4 Z" fill="${hc}"/></g>`;
      }
      s += `<rect x="200" y="${y + 70 * sc + 20}" width="1000" height="${f1(46 * sc + 10)}" fill="#B88962"/><rect x="200" y="${y + 70 * sc + 20}" width="1000" height="6" fill="#D2A57C"/>`;
    }
    return s;
  }

  // City dusk with an office entrance (Simone).
  function cityDusk(t, lt) {
    let s = `<rect width="1080" height="1920" fill="url(#gDusk)"/>` + glowC(540, 1060, 700, 'gPc', 0.55);
    // skyline layers with windows switching on
    const sky = (seed, col, base, n, hmin, hmax, wcol, par) => {
      let g = '';
      for (let i = 0; i < n; i++) {
        const w = 90 + hash(i + seed) * 80, x = -60 + i * 1200 / n + par, h = hmin + hash(i * 3 + seed) * (hmax - hmin);
        g += `<rect x="${f1(x)}" y="${f1(base - h)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"/>`;
        for (let r = 0; r < Math.floor(h / 46); r++) for (let c = 0; c < Math.floor(w / 34); c++) {
          const k = hash(i * 31 + r * 7 + c * 13 + seed);
          if (k < 0.45) continue;
          const on = seg(lt, k * 3.4 - 0.4, k * 3.4 - 0.1);
          if (on <= 0) continue;
          g += `<rect x="${f1(x + 10 + c * 34)}" y="${f1(base - h + 14 + r * 46)}" width="16" height="22" rx="3" fill="${wcol}" opacity="${f3(on * (0.6 + 0.4 * k))}"/>`;
        }
      }
      return g;
    };
    s += sky(3, '#5A4E8C', 1000, 9, 260, 520, '#FFD9A0', -lt * 4) + sky(19, '#463E74', 1060, 7, 160, 360, '#FFE2B0', -lt * 9);
    // plaza
    s += `<rect x="-10" y="1040" width="1100" height="900" fill="#8C78A4"/><rect x="-10" y="1040" width="1100" height="900" fill="#F2B39A" opacity=".25"/>`;
    for (let i = 0; i < 8; i++) s += `<path d="M${470 - 60 * i},1040 L${470 - 380 * i},1940 M${470 + 60 * i},1040 L${470 + 380 * i},1940" stroke="#9A86B0" stroke-width="3"/>`;
    // office entrance: glass doors lit warm
    s += `<rect x="190" y="560" width="560" height="500" fill="#6E5F98"/><rect x="190" y="560" width="560" height="30" fill="#5A4E8C"/>
      <rect x="300" y="700" width="340" height="360" fill="#FFD7A3"/>${glowC(470, 880, 330, 'gLamp', 0.9)}
      <path d="M470,700 L470,1060 M385,700 L385,1060 M555,700 L555,1060" stroke="#6E5F98" stroke-width="10"/>
      <rect x="290" y="690" width="360" height="16" fill="#5A4E8C"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${210 + i * 92}" y="610" width="60" height="60" rx="4" fill="#FFE2B0" opacity="${f3(0.4 + 0.5 * seg(lt, 0.3 + i * 0.25, 0.6 + i * 0.25))}"/>`;
    // street lamps blinking on
    [[90, 860, 0.7], [880, 860, 1.25]].forEach(([x, y, at]) => {
      const on = seg(lt, at, at + 0.15) * (0.9 + 0.1 * Math.sin(t * 20));
      s += `<rect x="${x - 7}" y="${y}" width="14" height="${1180 - y}" fill="#3A3360"/><circle cx="${x}" cy="${y - 10}" r="26" fill="${on > 0 ? '#FFE9B8' : '#8E86B0'}"/>${on > 0 ? glowC(x, y - 10, 170, 'gLamp', on) + glowE(x, 1190, 160, 30, 'gLamp', on * 0.6) : ''}`;
    });
    return s;
  }

  // Entryway at night: console, key dish, lamp, mirror (Simone).
  function entry(t) {
    let s = `<rect width="1080" height="1920" fill="#EFD4C8"/>` + glowC(860, 860, 620, 'gLamp', 0.55);
    s += `<rect x="40" y="420" width="300" height="1040" rx="8" fill="#C9A182"/><rect x="70" y="450" width="240" height="440" rx="6" fill="none" stroke="#B38B6C" stroke-width="6"/><rect x="70" y="930" width="240" height="500" rx="6" fill="none" stroke="#B38B6C" stroke-width="6"/><circle cx="300" cy="900" r="12" fill="${P.gold}"/>`;
    // mirror and console
    s += `<circle cx="830" cy="720" r="150" fill="#E7DCD8"/><circle cx="830" cy="720" r="150" fill="none" stroke="${P.gold}" stroke-width="12"/><path d="M760,640 Q820,600 880,620" stroke="#fff" stroke-width="10" fill="none" opacity=".6" stroke-linecap="round"/>`;
    s += `<rect x="640" y="1100" width="420" height="26" rx="8" fill="#B07F5E"/><rect x="660" y="1126" width="20" height="340" fill="#9C6E50"/><rect x="1010" y="1126" width="20" height="340" fill="#9C6E50"/><rect x="660" y="1300" width="370" height="14" fill="#9C6E50"/>`;
    // lamp
    s += `<rect x="955" y="960" width="12" height="140" fill="#8A6248"/><path d="M900,880 L1020,880 L1050,970 L870,970 Z" fill="${P.peachL}"/>${glowC(960, 940, 260, 'gLamp', 0.9)}`;
    s += plant(700, 1060, 0.5, '#86B596', P.pinkL);
    s += `<rect x="-10" y="1460" width="1100" height="1000" fill="#C9A487"/><path d="M60,1520 L1000,1520 L1120,2400 L-60,2400 Z" fill="#E8B8B4" opacity=".7"/>`;
    return s;
  }
  function keyDish(x, y) {
    return `<ellipse cx="${x}" cy="${y}" rx="70" ry="18" fill="${P.tealL}"/><path d="M${x - 70},${y} Q${x - 66},${y + 30} ${x},${y + 32} Q${x + 66},${y + 30} ${x + 70},${y}" fill="${P.teal}"/><ellipse cx="${x}" cy="${y}" rx="56" ry="12" fill="#5DB3A8"/>`;
  }
  function keys(x, y, rot) {
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})"><circle r="16" fill="none" stroke="${P.gold}" stroke-width="5"/><path d="M8,12 L18,46 L26,44 L24,38 L30,36 L26,22" fill="#D7D2CC" stroke="#B7AFA7" stroke-width="2"/><path d="M-10,12 L-22,40" stroke="#C9C2BA" stroke-width="9" stroke-linecap="round"/><circle cx="-4" cy="18" r="9" fill="${P.pink}"/></g>`;
  }
  function heelShoe(x, y, rot, sc = 1) {
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${sc})"><path d="M-30,-6 Q-8,-22 26,8 L-30,10 Z" fill="${SIM.shoe}"/><path d="M-28,4 L-30,26" stroke="${SIM.shoeD}" stroke-width="6" stroke-linecap="round"/></g>`;
  }

  // Living room at night: couch, lamp, window with city lights (Simone).
  function living(t) {
    let s = `<rect width="1080" height="1920" fill="#E7CFCB"/>`;
    const view = `<rect x="40" y="300" width="420" height="700" fill="url(#gNightWin)"/>` + bokeh(t, 14, 5, ['#FFD9A0', '#F9B8C6', '#FFE9C4'], [60, 600, 380, 360], { r0: 8, r1: 16, op: 0.7 })
      + `<circle cx="360" cy="420" r="28" fill="#FFF3D6"/><circle cx="374" cy="410" r="24" fill="#2E2B5C"/>`;
    s += windowFrame(60, 320, 380, 620, view, { frame: '#F7EAE6', sw: 20 });
    s += `<rect x="560" y="440" width="220" height="280" rx="8" fill="#fff"/><rect x="580" y="460" width="180" height="240" fill="${P.purpleP}"/><circle cx="640" cy="560" r="44" fill="${P.pinkL}"/><circle cx="700" cy="610" r="56" fill="${P.peachL}" opacity=".8"/>`;
    // floor lamp
    s += `<rect x="965" y="640" width="12" height="760" fill="#6A4A3A"/><path d="M890,540 L1050,540 L1080,660 L860,660 Z" fill="${P.peachL}"/>` + glowC(970, 640, 440, 'gLamp', 0.9 + 0.04 * Math.sin(t * 3));
    // couch
    s += `<rect x="-20" y="980" width="1120" height="300" rx="80" fill="#EFA9B6"/><rect x="40" y="1020" width="300" height="220" rx="60" fill="#F4BCC6"/><rect x="740" y="1020" width="300" height="220" rx="60" fill="#F4BCC6"/>`;
    s += `<rect x="-20" y="1240" width="1120" height="700" fill="#E896A6"/><rect x="-20" y="1240" width="1120" height="24" fill="#F4BCC6"/>`;
    s += `<rect x="120" y="1060" width="150" height="140" rx="36" fill="${P.tealL}" transform="rotate(-10 195 1130)"/>`;
    return s;
  }
  function blanket(y, t) {
    let s = `<path d="M60,${y} Q260,${y - 40} 470,${y - 20} Q700,${y - 40} 900,${y + 10} L960,1940 L20,1940 Z" fill="#F7C08A"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M${100 + i * 100},${y + 10} Q${110 + i * 100},${y + 300} ${90 + i * 104},1940" stroke="#EBA868" stroke-width="10" fill="none" stroke-dasharray="4 12" opacity=".8"/>`;
    s += `<path d="M60,${y} Q260,${y - 40} 470,${y - 20} Q700,${y - 40} 900,${y + 10}" stroke="#FAD5A9" stroke-width="16" fill="none"/>`;
    return s;
  }

  // Golden park with a swing (Maya + daughter).
  function park(t) {
    let s = `<rect width="1080" height="1920" fill="url(#gGolden)"/>` + glowC(790, 760, 640, 'gSun', 1) + glowC(790, 760, 160, 'gWhite', 1);
    s += `<path d="M-20,1000 Q200,860 420,940 T900,900 T1100,960 L1100,1100 L-20,1100 Z" fill="#E8C49A" opacity=".7"/>`;
    s += tree(80, 1080, 1.1, ['#C9B27A', '#B9A26C', '#D9C38A', '#F2C27E'], t, 1) + tree(1010, 1060, 1.25, ['#C4AE76', '#B39C66', '#D6C088', '#F5B472'], t, 2);
    s += `<rect x="-10" y="1060" width="1100" height="900" fill="#C9C98A"/><rect x="-10" y="1060" width="1100" height="900" fill="#F5B472" opacity=".22"/>`;
    s += bokeh(t, 16, 21, ['#FFE9C4', '#FFD9A0', '#FDE8ED'], [0, 300, 1080, 900], { r0: 18, r1: 40, op: 0.3, blur: 'fB8' });
    return s;
  }
  // Swing frame and swinging daughter. Returns {back, front, seat}.
  function swingSet(t, px, py, len, ang) {
    const sx = px + Math.sin(rad(ang)) * len, sy = py + Math.cos(rad(ang)) * len;
    const frame = `<path d="M${px - 420},${py - 10} L${px + 420},${py - 10}" stroke="#8A6248" stroke-width="26" stroke-linecap="round"/><path d="M${px - 400},${py} L${px - 520},1500 M${px - 400},${py} L${px - 300},1500 M${px + 400},${py} L${px + 300},1500 M${px + 400},${py} L${px + 520},1500" stroke="#9C7356" stroke-width="22" stroke-linecap="round"/>`;
    const ropes = [-1, 1].map(sd => `<path d="M${px + sd * 60},${py} L${f1(sx + sd * 60 * Math.cos(rad(ang)))},${f1(sy - sd * 60 * Math.sin(rad(ang)))}" stroke="#E9D8C0" stroke-width="7"/>`).join('');
    return { frame, ropes, sx, sy };
  }

  /* ================================================================== *
   * SHOTS
   * ================================================================== */

  // 1A 0:00-0:03  Kitchen at dawn: pours cereal, slides the bowl, daughter giggles.
  function shot1A(t) {
    const lt = t;
    const fx = 380, fy = 760, fs = 1.0;
    // box in Maya's left hand: pour, then set it down on the counter
    const pourK = io(seg(lt, 0.12, 0.6)) * (1 - io(seg(lt, 1.35, 1.7)));
    const down = io(seg(lt, 1.35, 1.85));
    const handBox = [lerp(-60, -220, down), lerp(330 + Math.sin(t * 14) * 3 * pourK, 375, down)];
    const boxRot = 72 * pourK;
    const boxG = [fx + handBox[0] * fs, fy + handBox[1] * fs];
    // bowl slides right to the daughter
    const slide = io(seg(lt, 1.95, 2.55));
    const bx = lerp(430, 680, slide), by = 1222;
    const fill = clamp(seg(lt, 0.45, 1.4));
    const hR = slide > 0 || lt > 1.8 ? loc(fx, fy, fs, bx - 64, by - 18) : [150, 460];
    const kidLaugh = lt > 2.45;
    let w = kitchen(t);
    w += fig(t, MAYA, {
      x: fx, y: fy, s: fs, seed: 1, cut: 520, mood: lt > 2.5 ? 'grin' : 'smile', look: lt > 2.5 ? [7, 0] : [2, 6], turn: lt > 2.5 ? 0.25 : 0.05,
      tilt: lt > 2.5 ? 4 : -2, rim: '#FFE3BD', lightSide: -1,
      hL: handBox, kL: 'rest', hR, bR: 1,
    });
    // the box sits over her hand (her fingers wrap the front edge)
    const bxG = boxG[0] + Math.cos(rad(boxRot)) * 30, byG = boxG[1] - 40 + Math.sin(rad(boxRot)) * 10;
    w += cerealBox(bxG, byG, boxRot, 0.95);
    // falling cereal
    const spout = [bxG + Math.cos(rad(boxRot)) * 53 + Math.sin(rad(boxRot)) * 76, byG + Math.sin(rad(boxRot)) * 53 - Math.cos(rad(boxRot)) * 76];
    for (let i = 0; i < 22; i++) {
      const t0 = 0.42 + i * 0.045, p = (lt - t0) / 0.32;
      if (p <= 0 || p >= 1) continue;
      const x = lerp(spout[0], bx - 30 + hash(i) * 60, p), y = lerp(spout[1], by - 40, p * p);
      w += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="none" stroke="${[P.peach, P.pinkL, P.peachL][i % 3]}" stroke-width="6"/>`;
    }
    // daughter at the counter
    w += fig(t, KID, {
      x: 770, y: 1010, s: 0.7, seed: 4, cut: 420, mood: kidLaugh ? 'laugh' : 'smile', look: kidLaugh ? [0, 0] : [-6, 5], tilt: kidLaugh ? -6 : 2,
      hL: kidLaugh ? [-30, 250 + Math.sin(t * 14) * 8] : [-60, 380], hR: kidLaugh ? [30, 250 - Math.sin(t * 14) * 8] : [60, 380], kL: kidLaugh ? 'open' : 'rest', kR: kidLaugh ? 'open' : 'rest', rim: '#FFE3BD',
    });
    w += kitchenCounter(t);
    w += bowl(bx, by, 1, fill);
    w += `<g transform="translate(130,1130)">${mug(0, 80, 0.9, P.teal, { dark: '#5DB3A8', heart: true })}</g>`;
    if (kidLaugh) w += A.sparkle(770, 900, 2.5, t, P.pinkL) + heart(860, 860 - (lt - 2.5) * 60, 1.1, P.pink, clamp(1 - (lt - 2.6) * 1.5));
    const z = 1.28 + 0.08 * io(lt / 3.3);
    return cam(560, 880, z, w) + warm(0.14) + vignette(0.75);
  }

  // 1B 0:03-0:07  Ties her shoe (insert), kisses her forehead, waves her out the door.
  function sneaker(x, y, sc, t) {
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <defs><linearGradient id="kidLegFade" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${KID.pants}"/><stop offset=".55" stop-color="${KID.pants}"/><stop offset="1" stop-color="${KID.pants}" stop-opacity="0"/></linearGradient></defs>
      <path d="M-154,-520 C-150,-360 -142,-230 -130,-120 L-8,-120 C0,-230 10,-360 18,-520 Z" fill="url(#kidLegFade)"/>
      <path d="M-150,-460 C-146,-330 -138,-220 -128,-130" stroke="${KID.pantsD}" stroke-width="22" fill="none" opacity=".35" stroke-linecap="round"/>
      <rect x="-140" y="-176" width="144" height="64" rx="20" fill="#FFFFFF"/><path d="M-140,-154 L4,-154" stroke="${P.pinkL}" stroke-width="8"/>
      <path d="M-210,10 C-224,-70 -180,-120 -120,-126 L-20,-136 C40,-116 120,-76 200,-46 C238,-30 244,-4 238,10 Z" fill="#FFFFFF"/>
      <path d="M120,-72 C170,-56 226,-40 238,10 L120,10 Z" fill="#F4EEF3"/>
      <path d="M-210,10 L238,10 Q252,28 236,44 L-196,44 Q-222,40 -210,10 Z" fill="${P.pink}"/><path d="M-200,26 L236,26" stroke="#fff" stroke-width="5" stroke-dasharray="14 10" opacity=".7"/>
      <path d="M-200,-40 Q-120,-70 -60,-40" stroke="${P.pinkL}" stroke-width="10" fill="none" stroke-linecap="round"/>${heart(-110, -40, 1.1, P.pink)}
      <path d="M-60,-136 C-20,-170 60,-130 110,-86" stroke="#F4EEF3" stroke-width="30" fill="none" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="${-30 + i * 38}" cy="${-128 + i * 14}" r="6" fill="${P.pinkL}"/>`).join('')}
      ${[0, 1, 2].map(i => `<path d="M${-30 + i * 38},${-128 + i * 14} L${8 + i * 38},${-114 + i * 14}" stroke="${P.pink}" stroke-width="7" stroke-linecap="round"/>`).join('')}
    </g>`;
  }
  function shot1B(t) {
    const lt = t - 3;
    if (lt < 1.45) {
      // insert: Maya's hands tie a bow on the pink sneaker
      let w = `<rect width="1080" height="1920" fill="#E9CBB0"/>`;
      w += blurG(14, `<rect width="1080" height="700" fill="#F7DED6"/><rect x="700" y="0" width="400" height="700" fill="#FFF0D6"/>${glowC(860, 380, 500, 'gSun', 1)}<rect x="-10" y="700" width="1100" height="1300" fill="#E3C2A0"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-300 + i * 220},1920 L${200 + i * 110},700" stroke="#D2AE89" stroke-width="8"/>`).join('')}
        <path d="M80,1600 L700,1600 L780,1930 L20,1930 Z" fill="${P.pinkL}" opacity=".8"/><ellipse cx="900" cy="1060" rx="150" ry="70" fill="#fff"/><ellipse cx="900" cy="1080" rx="160" ry="40" fill="${P.pink}"/>`);
      w += bokeh(t, 10, 3, ['#FFF1D6', '#FFE2B0'], [600, 100, 480, 600], { r0: 20, r1: 40, op: 0.4, blur: 'fB8' });
      const SX = 420, SY = 1300, SS = 1.7;
      w += sneaker(SX, SY, SS, t);
      // bow
      const g = ease(seg(lt, 0.35, 0.95)), tight = 1 - 0.12 * Math.sin(Math.PI * seg(lt, 1.0, 1.2));
      const bxx = SX + 40 * SS, byy = SY - 150 * SS;
      const wig = (1 - g) * Math.sin(t * 9) * 10;
      const pull = 30 * g + 14 * Math.sin(Math.PI * seg(lt, 1.0, 1.2));
      // hands pinch the loops from either side and pull them out
      const h1 = [bxx - 175 - pull + Math.sin(t * 8) * 6, byy - 40 + Math.cos(t * 8) * 6];
      const h2 = [bxx + 175 + pull + Math.cos(t * 8 + 1) * 6, byy - 50 + Math.sin(t * 8 + 1) * 6];
      let bow = '';
      bow += `<path d="M${bxx},${byy} Q${bxx - 50},${byy + 50 + wig} ${bxx - 70},${byy + 110}" stroke="${P.pink}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M${bxx},${byy} Q${bxx + 40},${byy + 60 - wig} ${bxx + 90},${byy + 104}" stroke="${P.pink}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
      [-1, 1].forEach(sd => {
        const hx = sd < 0 ? h1 : h2;
        const lx = lerp(bxx + sd * 30, hx[0] - sd * 10, 0.5), ly = lerp(byy - 10, hx[1], 0.5) - 16 * g;
        bow += `<path d="M${bxx},${byy} Q${f1(lx)},${f1(ly - 50 * g)} ${f1(hx[0] - sd * 18)},${f1(hx[1] + 8)} Q${f1(lx)},${f1(ly + 30 * g)} ${bxx},${byy}" fill="none" stroke="${P.pink}" stroke-width="16" stroke-linejoin="round"/>`;
      });
      bow += `<circle cx="${bxx}" cy="${byy}" r="20" fill="#F0697F"/>`;
      w += bow;
      const sleeve = (from, to) => {
        const mx = (from[0] + to[0]) / 2 + 60, my = (from[1] + to[1]) / 2 + 40;
        const ang = Math.atan2(to[1] - my, to[0] - mx), cx = to[0] - Math.cos(ang) * 40, cy = to[1] - Math.sin(ang) * 40;
        return `<path d="M${from[0]},${from[1]} Q${f1(mx)},${f1(my)} ${f1(to[0])},${f1(to[1])}" stroke="${MAYA.topD}" stroke-width="134" fill="none" stroke-linecap="round"/><path d="M${from[0]},${from[1]} Q${f1(mx)},${f1(my)} ${f1(to[0])},${f1(to[1])}" stroke="${MAYA.topC}" stroke-width="124" fill="none" stroke-linecap="round"/>
          <path d="M${f1(cx)},${f1(cy)} L${f1(to[0])},${f1(to[1])}" stroke="${MAYA.topD}" stroke-width="118" stroke-dasharray="4 7"/>
          <path d="M${f1(mx - 40)},${f1(my - 60)} Q${f1(mx)},${f1(my - 20)} ${f1(mx + 20)},${f1(my + 50)}" stroke="${MAYA.topD}" stroke-width="5" fill="none" opacity=".7"/>`;
      };
      const f1p = [-220, 1820], f2p = [1000, 2080];
      const a1 = deg(Math.atan2(h1[1] - f1p[1], h1[0] - f1p[0])), a2 = deg(Math.atan2(h2[1] - f2p[1], h2[0] - f2p[0]));
      const end = (h, a, d) => [h[0] - Math.cos(rad(a)) * d, h[1] - Math.sin(rad(a)) * d];
      // pinch fingertips sit on the loop ends (h1, h2)
      const base = (h, a, fl) => [h[0] - (Math.cos(rad(a)) * 56 - Math.sin(rad(a)) * -10 * fl) * 2.4, h[1] - (Math.sin(rad(a)) * 56 + Math.cos(rad(a)) * -10 * fl) * 2.4];
      const b1 = base(h1, a1, 1), b2 = base(h2, a2, -1);
      w += sleeve(f1p, end(b1, a1, 30)) + hand(b1[0], b1[1], a1, MAYA, 'pinch', 1, 2.4);
      w += sleeve(f2p, end(b2, a2, 30)) + hand(b2[0], b2[1], a2, MAYA, 'pinch', -1, 2.4);
      w += A.sparkle(bxx, byy - 40, 4.15 - 3, lt, P.pinkL) + (lt > 1.15 ? heart(bxx, byy - 70 - (lt - 1.15) * 120, 1.2, P.pink, clamp(1 - (lt - 1.15) * 3)) : '');
      const z = 1.0 + 0.06 * io(lt / 1.45);
      return cam(bxx, byy, z, w) + warm(0.12) + vignette(0.8);
    }
    // medium: kiss, then she waves her out the door
    const l2 = lt - 1.45;
    const doorK = io(seg(l2, 0.95, 1.5));
    let w = hallway(t, doorK);
    const kiss = io(seg(l2, 0.25, 0.65)) * (1 - io(seg(l2, 1.0, 1.35)));
    const away = l2 > 1.25;
    const kx = 730, ky = 905, ks = 0.95;
    const mx = 590, my = 800;
    const mayaO = {
      x: mx, y: my, s: 1, seed: 1, body: 'full', legs: 'crouch', crouchSide: -1,
      mood: kiss > 0.5 ? 'kiss' : away ? 'grin' : 'smile', tilt: -30 * kiss + (away ? 4 : 0), look: away ? [8, -2] : [6, 3], turn: away ? 0.3 : 0.25 + 0.25 * kiss, head: [26 * kiss, -24 * kiss],
      rim: '#FFE3BD', lightSide: 1,
      hL: [-110, 470], hR: away ? [205 + Math.sin(t * 9) * 16, -40] : loc(mx, my, 1, kx - 70, ky + 270), kR: away ? 'open' : 'rest', bR: away ? -1 : 1,
    };
    w += fig(t, MAYA, Object.assign({}, mayaO, { only: 'back' }));
    if (!away) {
      w += fig(t, KID, { x: kx, y: ky, s: ks, seed: 4, body: 'full', straps: true, mood: kiss > 0.5 ? 'bliss' : 'smile', tilt: -5 * kiss, look: [-6, 0], turn: -0.25 });
      w += fig(t, MAYA, Object.assign({}, mayaO, { only: 'arms', armR: false }));
      w += fig(t, MAYA, Object.assign({}, mayaO, { only: 'head' }));
      if (kiss > 0.6) w += heart(680, 740 - (l2 - 0.5) * 120, 1.4 * clamp((l2 - 0.45) * 4), P.pink, clamp(1.3 - (l2 - 0.5) * 1.6));
    } else {
      w += fig(t, MAYA, Object.assign({}, mayaO, { only: 'head' })) + fig(t, MAYA, Object.assign({}, mayaO, { only: 'arms' }));
      const p = io(seg(l2, 1.25, 2.55));
      const op = 1 - seg(l2, 2.1, 2.55);
      w += `<g opacity="${f3(op)}">${kidBack(t, { x: lerp(740, 900, p), y: lerp(ky - 10, 840, p), s: lerp(0.95, 0.72, p) })}</g>`;
    }
    const z = 1.22 + 0.06 * io(l2 / 2.6);
    return cam(640, 1020, z, w) + warm(0.12) + vignette(0.75);
  }

  // 1C 0:07-0:10  Coffee in both hands, exhale, opens the laptop; over-the-shoulder rack focus.
  function shot1C(t) {
    const lt = t - 7;
    if (lt < 1.45) {
      const fx = 470, fy = 800, fs = 1.05;
      const exh = seg(lt, 0.25, 1.0);
      const setDown = io(seg(lt, 0.85, 1.15));
      const open = io(seg(lt, 0.95, 1.4));
      let w = blurG(9, kitchen(t));
      const mugL = [lerp(0, 150, setDown), lerp(250, 400, setDown)];
      const mugG = [fx + mugL[0] * fs, fy + mugL[1] * fs];
      const mood = exh > 0 && exh < 1 ? 'exhale' : lt > 1.0 ? 'soft' : 'smile';
      w += fig(t, MAYA, {
        x: fx, y: fy, s: fs, seed: 1, cut: 520, mood, look: lt > 1 ? [0, 7] : [0, 2], tilt: -3 + 3 * exh, head: [0, 4 * Math.sin(Math.PI * exh)],
        rim: '#FFE3BD', glow: '#E9FBF8', glowK: open,
        mid: mug(mugL[0], mugL[1] + 70, 1.15, P.teal, { dark: '#5DB3A8', drink: '#7A4A30' }),
        hL: setDown > 0.5 ? [lerp(-60, -40, open), lerp(330, 420, open)] : [mugL[0] - 58, mugL[1] + 10], hR: [mugL[0] + 58, mugL[1] + 20], kL: 'rest', kR: 'rest',
      });
      w += steam(t, mugG[0], mugG[1] - 10, 1.0, 0.65);
      if (exh > 0 && exh < 1) w += `<g filter="url(#fB8)" opacity="${f3(Math.sin(Math.PI * exh) * 0.55)}"><ellipse cx="${f1(fx + 10)}" cy="${f1(fy + 120 + exh * 40)}" rx="${f1(30 + exh * 50)}" ry="${f1(14 + exh * 18)}" fill="#fff"/></g>`;
      w += kitchenTable(1250);
      w += laptopBack(470, 1262, 520, { open: Math.max(open, 0.001), on: open });
      const z = 1.03 + 0.05 * io(lt / 1.45);
      return cam(470, 900, z, w) + warm(0.12) + vignette(0.75);
    }
    // over the shoulder: the curriculum glows, focus racks from her to the screen
    const l2 = lt - 1.45;
    const rack = io(seg(l2, 0.1, 0.8));
    let w = blurG(14, kitchen(t));
    w += kitchenTable(1180);
    w += blurG(8 * (1 - rack), laptop(500, 1250, 690, { open: lerp(0.8, 1, io(seg(l2, 0, 0.35))), on: io(seg(l2, 0.05, 0.6)), screen: 'curriculum', zoom: 1 + 0.05 * l2, pan: [0.1, 0.1] }));
    w += blurG(1 + 9 * rack, figBack(t, MAYA, { x: 150, y: 1240, s: 1.45, seed: 1, tilt: 4 }));
    w += blurG(12, mug(950, 1660, 1.8, P.teal, { dark: '#5DB3A8' }) + steam(t, 950, 1520, 1.6, 0.4));
    const z = 1.14 + 0.06 * io(l2 / 1.6);
    return cam(500, 1020, z, w) + warm(0.1) + vignette(0.8);
  }

  // 2A 0:10-0:13  Zuri walks across a leafy campus, a friend waves. Tracking shot.
  function shot2A(t) {
    const lt = t - 10;
    let w = campus(t, lt);
    const wave = lt > 1.35 && lt < 2.5;
    w += fig(t, ZURI, {
      x: 470 + Math.sin(lt * 0.8) * 10, y: 660, s: 0.84, seed: 2, body: 'full', legs: 'walk', walkSpeed: 7.2, tote: true, wind: 0.6,
      mood: wave ? 'grin' : 'smile', look: lt > 1.1 && lt < 2.6 ? [-7, -1] : [0, 0], turn: lt > 1.1 && lt < 2.6 ? -0.3 : 0, rim: '#FFE0B0', lightSide: 1,
      hL: wave ? [-170 + Math.sin(t * 10) * 14, -30] : undefined, kL: wave ? 'open' : 'rest', bL: wave ? -1 : 1,
      front: `<path d="M150,330 L260,330 L250,560 Q248,576 232,576 L170,576 Q154,576 152,560 Z" fill="#EADBC2"/><path d="M168,420 L238,420" stroke="${P.pink}" stroke-width="10" stroke-linecap="round"/>${heart(204, 480, 1, P.pink)}`,
    });
    w += leaves(t, 14, 3, [-40, 200, 1160, 1500], ['#F5A857', '#E9A93B', '#F4829A', '#C6D69A', '#FAD09A']);
    w += blurG(10, leaves(t * 1.3, 4, 17, [-60, 0, 1200, 1900], ['#F5A857', '#E9A93B']).replace(/scale\(([\d.]+),([\d.]+)\)/g, (m, a, b) => `scale(${(a * 3).toFixed(2)},${(b * 3).toFixed(2)})`));
    w += flare(820, 520, 0.8 + 0.1 * Math.sin(t * 1.5));
    return w + warm(0.15) + vignette(0.7);
  }

  // 2B 0:13-0:16  Lecture hall: notes, then a laugh with her seatmate.
  function shot2B(t) {
    const lt = t - 13;
    const fx = 380, fy = 860, fs = 0.95;
    let w = blurG(5, lectureHall(t));
    const laugh = lt > 1.55 && lt < 2.95;
    const writing = lt < 1.45;
    const pen = writing ? [40 + ((lt * 60) % 70) + Math.sin(t * 16) * 4, 372 + Math.sin(t * 24) * 3] : [70, 360];
    w += fig(t, ZURI, {
      x: fx, y: fy, s: fs, seed: 2, cut: 420, mood: laugh ? 'laugh' : lt > 1.25 ? 'smile' : 'focus', look: lt > 1.25 ? [7, 0] : [3, 7], turn: lt > 1.25 ? 0.3 : 0.1,
      tilt: laugh ? 7 : lt > 1.25 ? 4 : -3, rim: '#FFE0B0', lightSide: -1,
      hL: [-80, 395], hR: pen, kR: 'rest',
      front: `<g transform="translate(${f1(pen[0] + 20)},${f1(pen[1] - 30)}) rotate(28)"><rect x="-5" y="-60" width="10" height="70" rx="5" fill="${P.purple}"/><path d="M-5,10 L0,22 L5,10 Z" fill="#3D2B20"/></g>`,
    });
    const lean = io(seg(lt, 0.95, 1.4)) * (1 - io(seg(lt, 2.7, 3.0)));
    w += fig(t, FRIENDS.amara, {
      x: 800 - 20 * lean, y: 880, s: 0.88, seed: 6, cut: 420, mood: laugh ? 'laugh' : lean > 0.5 ? 'talk' : 'smile', look: [-7, lean > 0.3 ? 0 : 5], turn: -0.3,
      tilt: -9 * lean, head: [-14 * lean, 6 * lean], hL: [-90, 410], hR: [60, 420],
    });
    // desk and notebook
    w += `<rect x="-10" y="1240" width="1100" height="40" fill="#C99A70"/><rect x="-10" y="1240" width="1100" height="8" fill="#E2B88E"/><rect x="-10" y="1280" width="1100" height="700" fill="#B8865D"/>`;
    w += `<path d="M300,1238 L560,1238 L600,1260 L270,1260 Z" fill="#fff"/><path d="M430,1238 L432,1260" stroke="#E5DCD2" stroke-width="3"/>`;
    const lines = Math.min(1, lt / 1.45);
    for (let i = 0; i < 3; i++) {
      const k = clamp(lines * 3 - i);
      if (k > 0) w += `<path d="M${450 + i * 2},${1243 + i * 6} L${f1(450 + i * 2 + 110 * k)},${1243 + i * 6}" stroke="${P.purple}" stroke-width="2.5" stroke-dasharray="10 4 6 3"/>`;
    }
    w += blurG(10, `<rect x="860" y="1150" width="120" height="150" rx="20" fill="${P.peachL}"/><rect x="852" y="1136" width="136" height="30" rx="12" fill="#fff"/>`);
    if (laugh) w += A.sparkle(600, 760, 1.6, t, P.peachL);
    const z = 1.02 + 0.04 * io(lt / 3);
    return cam(560, 1000, z, w, -10 * lt) + warm(0.13) + vignette(0.75);
  }

  // 2C 0:16-0:20  Library window seat: opens the laptop (candles vs structure), tilts her head.
  function zuriSeat(t, o) {
    const fx = o.fx || 330, fy = o.fy || 860, fs = o.fs || 0.95;
    const lx = o.lx || 720, ly = o.ly || 1270, lw = o.lw || 440;
    let w = '';
    w += fig(t, ZURI, {
      x: fx, y: fy, s: fs, seed: 2, cut: 440, mood: o.mood || 'focus', look: o.look || [7, 5], turn: o.turn ?? 0.35, tilt: o.tilt || 0, head: o.head || [0, 0],
      rim: '#FFE0B0', lightSide: -1, glow: '#E9FBF8', glowK: o.on ?? 1,
      hL: [-60, 420], hR: loc(fx, fy, fs, lx - lw * 0.42, ly + 10), bR: 1,
    });
    w += `<rect x="${lx - 300}" y="${ly + 20}" width="600" height="60" rx="12" fill="${P.purpleL}"/><rect x="${lx - 280}" y="${ly + 70}" width="560" height="50" rx="10" fill="${P.peachL}"/>`;
    w += laptop(lx, ly + 20, lw, { open: o.open ?? 1, on: o.on ?? 1, screen: o.screen, zoom: o.zoom || 1, pan: o.pan, inner: o.inner });
    return w;
  }
  function shot2C(t) {
    const lt = t - 16;
    const open = io(seg(lt, 0.3, 0.9)), on = io(seg(lt, 0.75, 1.2));
    const cur = io(seg(lt, 1.9, 2.5));
    let w = blurG(4, library(t));
    w += zuriSeat(t, {
      open: Math.max(open, 0.001), on, screen: 'candles', zoom: 1 + 0.04 * seg(lt, 1, 4), pan: [0.3, 0.6],
      mood: lt > 3.45 ? 'smile' : cur > 0.4 ? 'curious' : 'focus', tilt: 11 * cur, look: [7, 4], turn: 0.4,
    });
    w += blurG(12, `<rect x="-40" y="1500" width="300" height="200" rx="40" fill="${P.pinkL}"/><circle cx="1000" cy="1560" r="90" fill="${P.tealL}"/>`);
    const z = 1.18 + 0.12 * io(lt / 4);
    return cam(580, 1080, z, w) + warm(0.13) + vignette(0.75);
  }

  // 3A 0:20-0:24  Simone leaves the office at dusk, city lights blink on, breeze in her hair.
  function shot3A(t) {
    const lt = t - 20;
    const p = io(seg(lt, 0, 4));
    let w = cityDusk(t, lt);
    const s = lerp(0.56, 0.84, p);
    const feet = lerp(1150, 1430, p);
    w += fig(t, SIM, {
      x: 470 + Math.sin(lt * 0.9) * 8, y: feet - 878 * s, s, seed: 3, body: 'full', legs: 'walk', walkSpeed: 6.6, wind: 1,
      mood: lt > 2.6 ? 'soft' : 'smile', look: lt > 2.6 ? [-3, -3] : [0, 0], rim: '#F7B7C4', lightSide: -1, tilt: lt > 2.6 ? -4 : 0,
      hL: undefined, hR: [150, 360], bR: -1,
      front: `<g transform="translate(150,360)"><path d="M-10,0 L-60,40 M30,0 L60,40" stroke="${SIM.topD}" stroke-width="7" fill="none"/><rect x="-80" y="36" width="160" height="120" rx="20" fill="${P.pinkL}"/><rect x="-80" y="36" width="160" height="30" rx="14" fill="#F7A6B6"/></g>`,
    });
    w += bokeh(t, 12, 41, ['#FFD9A0', '#F9B8C6', '#FFE9C4'], [-60, 1300, 1200, 560], { r0: 30, r1: 50, op: 0.3, blur: 'fB16' });
    // breeze streaks
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.7 + i / 6) % 1;
      w += `<path d="M${f1(-200 + ph * 1500)},${640 + i * 90} q60,-12 120,0" stroke="#fff" stroke-width="3" fill="none" opacity="${f3(Math.sin(ph * Math.PI) * 0.35)}" stroke-linecap="round"/>`;
    }
    return cam(470, 900, 1 + 0.03 * lt / 4, w, 0, -12 * lt) + warm(0.1, '#F7A6B6') + vignette(0.8);
  }

  // 3B 0:24-0:27  Front door: keys in the dish, kicks off her heels, relief.
  function shot3B(t) {
    const lt = t - 24;
    const fx = 525, fs = 0.82;
    const shoesOff = seg(lt, 1.95, 2.05);
    const fy = 1460 - 878 * fs + 10 * shoesOff;
    let w = entry(t);
    const reachK = io(seg(lt, 0.0, 0.6)) * (1 - io(seg(lt, 1.0, 1.35)));
    const dish = [785, 1092];
    const hR = [lerp(150, loc(fx, fy, fs, dish[0], dish[1] - 50)[0], reachK), lerp(500, loc(fx, fy, fs, dish[0], dish[1] - 50)[1], reachK)];
    const kickL = Math.sin(Math.PI * seg(lt, 1.1, 1.5)), kickR = Math.sin(Math.PI * seg(lt, 1.6, 2.0));
    const relief = lt > 2.2;
    const keysFall = seg(lt, 0.7, 0.95);
    w += keyDish(dish[0], dish[1]);
    if (keysFall >= 1) w += keys(dish[0] + 6, dish[1] - 8, 70);
    w += fig(t, SIM, {
      x: fx, y: fy, s: fs, seed: 3, body: 'full', legs: 'kick', kick: kickL > 0 ? { side: -1, k: kickL } : { side: 1, k: kickR },
      bareL: lt > 1.3, bareR: lt > 1.8, mood: relief ? 'relief' : lt > 1.05 ? 'grin' : 'smile', tilt: relief ? -5 : 0, head: [0, relief ? -4 : 0],
      look: lt < 1 ? [7, 3] : [0, 0], turn: lt < 1 ? 0.35 : 0, rim: '#FFD08A', lightSide: 1,
      hR, bR: 1, hL: relief ? [-110, 260] : undefined, kL: 'rest',
      mid: keysFall <= 0 ? keys(hR[0] + 30, hR[1] + 20, 20) : '',
    });
    if (keysFall > 0 && keysFall < 1) w += keys(dish[0] + 6, lerp(dish[1] - 50, dish[1] - 8, keysFall * keysFall), 20 + 50 * keysFall);
    w += A.sparkle(dish[0], dish[1] - 30, 0.95, t, P.peachL);
    // flying heels
    const shoeL = seg(lt, 1.3, 1.75), shoeR = seg(lt, 1.8, 2.25);
    const footY = fy + 860 * fs;
    if (lt > 1.3) w += heelShoe(lerp(fx - 40, 230, shoeL), lerp(footY - 60, 1500, shoeL) - Math.sin(Math.PI * shoeL) * 160, -200 * shoeL + (shoeL >= 1 ? -20 : 0), 1.5);
    if (lt > 1.8) w += heelShoe(lerp(fx + 40, 360, shoeR), lerp(footY - 60, 1530, shoeR) - Math.sin(Math.PI * shoeR) * 120, 160 * shoeR + 15, 1.5);
    if (relief) w += A.sparkle(fx, fy - 140, 2.3, t, P.pinkL) + A.sparkle(fx + 120, fy - 60, 2.5, t, P.peachL);
    const z = 1.1 + 0.05 * io(lt / 3);
    return cam(560, 1050, z, w, 0, -250) + warm(0.13) + vignette(0.8);
  }

  // 3C 0:27-0:30  Couch, blanket, tea, laptop on her knees (Dayli says), lamp light.
  function shot3C(t) {
    const lt = t - 27;
    if (lt < 1.4) {
      const fx = 470, fy = 860, fs = 0.95;
      const sip = Math.sin(Math.PI * seg(lt, 0.2, 1.0));
      let w = living(t);
      const mugL = [lerp(-150, -40, sip), lerp(330, 150, sip)];
      w += fig(t, SIM, {
        x: fx, y: fy, s: fs, seed: 3, cut: 520, mood: sip > 0.6 ? 'relief' : 'soft', look: [0, 6], tilt: -3 + sip * 4, rim: '#FFD08A', lightSide: 1, glow: '#E9FBF8', glowK: 1,
        mid: mug(mugL[0], mugL[1] + 50, 0.95, P.purpleL, { dark: P.purple, drink: '#C98E5A', heart: false }),
        hL: [mugL[0] - 46, mugL[1] + 10], hR: [150, 440],
      });
      w += steam(t, fx + mugL[0] * fs, fy + mugL[1] * fs - 20, 0.9, 0.5);
      w += blanket(1300, t);
      w += laptopBack(470, 1330, 440, { open: 1, on: 1 });
      w += `<rect x="860" y="1260" width="220" height="30" rx="8" fill="#B07F5E"/>` + mug(950, 1258, 0.8, P.teal, { dark: '#5DB3A8', steam: true, t });
      return cam(470, 960, 1.22 + 0.05 * lt / 1.4, w) + warm(0.14) + vignette(0.8);
    }
    const l2 = lt - 1.4;
    const rack = io(seg(l2, 0.05, 0.7));
    let w = blurG(14, living(t));
    w += blurG(8 * (1 - rack), laptop(500, 1250, 690, { screen: 'dayli', on: 1, zoom: 1.02 + 0.05 * l2, pan: [0.7, 0.4], glowC: '#FFF0E6' }));
    w += blurG(1 + 9 * rack, figBack(t, SIM, { x: 150, y: 1240, s: 1.45, seed: 3, tilt: 3 }));
    w += blurG(12, mug(960, 1640, 1.7, P.purpleL, { dark: P.purple, heart: false }) + `<path d="M-40,1700 Q300,1600 700,1720 L700,1940 L-40,1940 Z" fill="#F7C08A"/>`);
    return cam(500, 1000, 1.08 + 0.06 * io(l2 / 1.6), w) + warm(0.12) + vignette(0.8);
  }

  // 4A 0:30-0:33  Triptych: each woman looks up and smiles.
  function panelMaya(t, lt) {
    let w = blurG(6, kitchen(t));
    const up = lt > 0.45;
    w += fig(t, MAYA, { x: 180, y: 900, s: 0.8, seed: 1, cut: 520, mood: up ? 'grin' : 'focus', look: up ? [0, 0] : [0, 7], tilt: up ? 5 : -2, rim: '#FFE3BD', glow: '#E9FBF8', glowK: up ? 0.4 : 1 });
    w += kitchenTable(1300) + laptopBack(180, 1312, 300, { open: 1, on: 1 });
    return w;
  }
  function panelZuri(t, lt) {
    let w = blurG(6, library(t));
    const up = lt > 0.85;
    w += fig(t, ZURI, { x: 540, y: 900, s: 0.8, seed: 2, cut: 520, mood: up ? 'grin' : 'focus', look: up ? [0, 0] : [0, 7], tilt: up ? -5 : 2, rim: '#FFE0B0', glow: '#E9FBF8', glowK: up ? 0.4 : 1 });
    w += `<rect x="300" y="1300" width="500" height="700" fill="#E9CDB6"/><rect x="300" y="1292" width="500" height="18" fill="${P.pinkP}"/>` + laptopBack(540, 1312, 300, { open: 1, on: 1 });
    return w;
  }
  function panelSimone(t, lt) {
    let w = blurG(6, living(t));
    const up = lt > 1.25;
    w += fig(t, SIM, { x: 830, y: 900, s: 0.74, seed: 3, cut: 520, mood: up ? 'grin' : 'focus', look: up ? [-2, 0] : [0, 7], tilt: up ? 4 : -2, rim: '#FFD08A', lightSide: 1, glow: '#E9FBF8', glowK: up ? 0.4 : 1 });
    w += `<path d="M640,1310 Q830,1280 1100,1310 L1100,1940 L640,1940 Z" fill="#F7C08A"/>` + laptopBack(830, 1320, 290, { open: 1, on: 1 });
    return w;
  }
  const PANELS = [[0, 356, panelMaya, 180], [362, 356, panelZuri, 540], [724, 356, panelSimone, 830]];
  function tripPanels(t, lt, offs) {
    let s = `<rect width="1080" height="1920" fill="${P.cream}"/>`;
    PANELS.forEach(([x, w, fn, cx], i) => {
      const id = uid('tp');
      const z = 1.04 + 0.05 * io(lt / 3) + i * 0.01;
      s += `<clipPath id="${id}"><rect x="${x}" y="0" width="${w}" height="1920"/></clipPath><g clip-path="url(#${id})"><g transform="translate(0,${f1(offs ? offs[i] : 0)})">${cam(cx, 960, z, fn(t, lt))}${warm(0.12)}</g></g>`;
    });
    return s;
  }
  function shot4A(t) {
    const lt = t - 30;
    let s = tripPanels(t, lt) + vignette(0.6);
    s += `<rect width="1080" height="600" fill="url(#gTopScrim)"/>`;
    s += head(t, 30.35, CX, 330, `Three different <tspan fill="${P.pink}" font-style="italic">women.</tspan>`, 82, P.dark, { max: 820 });
    s += A.sparkle(180, 860, 30.5, t, P.peachL) + A.sparkle(540, 860, 30.9, t, P.peachL) + A.sparkle(830, 860, 31.3, t, P.peachL);
    return s;
  }

  // 4B 0:33-0:35  Over Maya's shoulder: the lesson video plays, mug in the foreground.
  function shot4B(t) {
    const lt = t - 33;
    let w = blurG(14, kitchen(t)) + kitchenTable(1180);
    const prog = 0.32 + lt * 0.07;
    const inner = (sw, sh) => `<rect x="0" y="${f1(sh - 64)}" width="${sw}" height="64" fill="#140F12" opacity=".55"/>
      <path d="M26,${f1(sh - 44)} L26,${f1(sh - 20)} L46,${f1(sh - 32)} Z" fill="#fff"/>
      <rect x="66" y="${f1(sh - 35)}" width="${f1(sw - 170)}" height="7" rx="3.5" fill="#fff" opacity=".35"/>
      <rect x="66" y="${f1(sh - 35)}" width="${f1((sw - 170) * prog)}" height="7" rx="3.5" fill="${P.pink}"/>
      <circle cx="${f1(66 + (sw - 170) * prog)}" cy="${f1(sh - 31.5)}" r="11" fill="#fff"/>
      ${txt(sw - 52, sh - 24, `${Math.floor(3 + lt * 0.5)}:${String(Math.floor((14 + lt * 30) % 60)).padStart(2, '0')}`, 22, '#fff', { w: 500 })}`;
    w += laptop(490, 1250, 700, { screen: 'video', par: 'xMidYMid slice', zoom: 1.0, inner, glowC: '#FFF3E6' });
    w += blurG(9, figBack(t, MAYA, { x: 140, y: 1250, s: 1.45, seed: 1, tilt: 3 }));
    w += blurG(3, mug(900, 1560, 1.7, P.teal, { dark: '#5DB3A8', drink: '#7A4A30' })) + steam(t, 900, 1420, 1.5, 0.55);
    return cam(490, 1010, 1.14 + 0.06 * io(lt / 2), w) + warm(0.1) + vignette(0.8);
  }

  // 4C 0:35-0:37  Zuri's finger traces the structure; she nods.
  const DOTS = [[0.317, 0.752], [0.435, 0.593], [0.535, 0.673], [0.671, 0.507], [0.771, 0.608], [0.861, 0.462]];
  function along(pts, k) {
    const segs = pts.length - 1, f = clamp(k) * segs, i = Math.min(segs - 1, Math.floor(f)), u = f - i;
    return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u), i, u];
  }
  function shot4C(t) {
    const lt = t - 35;
    if (lt < 1.4) {
      const LX = 460, LY = 1290, LW = 800;
      const sh = LW * 0.625, sTop = LY - (sh + LW * 0.028 * 2.6) + LW * 0.028 * 1.4;
      const k = io(seg(lt, 0.15, 1.3));
      const P2 = DOTS.map(([u, v]) => [LX - LW / 2 + u * LW, sTop + v * sh]);
      const tip = along(P2, k);
      let trail = '';
      if (k > 0) {
        let d = `M${f1(P2[0][0])},${f1(P2[0][1])}`;
        for (let j = 1; j <= tip[2]; j++) d += ` L${f1(P2[j][0])},${f1(P2[j][1])}`;
        d += ` L${f1(tip[0])},${f1(tip[1])}`;
        trail = `<path d="${d}" stroke="${P.pink}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".35" filter="url(#fB3)"/><path d="${d}" stroke="${P.pink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        P2.forEach((p, j) => { if (j <= tip[2]) trail += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="9" fill="#fff" stroke="${P.pink}" stroke-width="5"/>`; });
      }
      let w = blurG(14, library(t));
      w += `<rect x="-10" y="1300" width="1100" height="700" fill="#E9CDB6"/>`;
      w += laptop(LX, LY, LW, { screen: 'dots', on: 1, glowC: '#FFF3E6' }) + trail;
      // forearm and pointing hand from the lower right
      const ang = -148;
      const hx = tip[0] - Math.cos(rad(ang)) * 62 * 2.2, hy = tip[1] - Math.sin(rad(ang)) * 62 * 2.2 + 14;
      w += `<path d="M1200,1900 L${f1(hx + 40)},${f1(hy + 26)}" stroke="${ZURI.topD}" stroke-width="128" stroke-linecap="round"/><path d="M1200,1900 L${f1(hx + 40)},${f1(hy + 26)}" stroke="${ZURI.topC}" stroke-width="118" stroke-linecap="round"/>`;
      w += hand(hx, hy, ang, ZURI, 'point', -1, 2.2);
      w += `<circle cx="${f1(tip[0])}" cy="${f1(tip[1])}" r="${f1(20 + 8 * Math.sin(t * 9))}" fill="${P.pink}" opacity=".25"/>`;
      return cam(LX, 1050, 1.02 + 0.05 * io(lt / 1.4), w) + warm(0.1) + vignette(0.75);
    }
    const l2 = lt - 1.4;
    const nod = Math.sin(seg(l2, 0.05, 0.55) * Math.PI * 2) * 8;
    let w = blurG(4, library(t));
    w += zuriSeat(t, { screen: 'dots', mood: 'smile', tilt: 6, head: [0, nod], look: [6, 4], turn: 0.4 });
    return cam(520, 1020, 1.12, w) + warm(0.13) + vignette(0.75);
  }

  // 4D 0:37-0:42  Simone taps; lesson complete pops; closes the laptop and stretches.
  function shot4D(t) {
    const lt = t - 37;
    if (lt < 2.4) {
      const LX = 460, LY = 1290, LW = 800;
      const sh = LW * 0.625, sTop = LY - (sh + LW * 0.028 * 2.6) + LW * 0.028 * 1.4, sL = LX - LW / 2;
      const tapAt = 0.75, sw2 = seg(lt, tapAt + 0.12, tapAt + 0.4);
      const btn = [sL + 0.576 * LW, sTop + 0.913 * sh];
      const ring = [sL + 0.84 * LW, sTop + 0.37 * sh];
      const fillK = io(seg(lt, 1.05, 1.9)), pop = back(seg(lt, 0.9, 1.3)), chk = back(seg(lt, 1.8, 2.1));
      const inner = (sw, shh) => {
        let g = '';
        if (sw2 > 0) g += `<g opacity="${f3(sw2)}">${img(SCR.complete, 0, 0, sw, shh)}</g>`;
        if (lt > tapAt && lt < tapAt + 0.6) {
          const r = seg(lt, tapAt, tapAt + 0.6);
          g += `<circle cx="${f1(btn[0] - sL)}" cy="${f1(btn[1] - sTop)}" r="${f1(10 + r * 70)}" fill="none" stroke="#fff" stroke-width="${f1(8 * (1 - r))}" opacity="${f3(1 - r)}"/>`;
        }
        return g;
      };
      let w = blurG(14, living(t));
      w += blanket(1330, t);
      w += laptop(LX, LY, LW, { screen: 'dayli', on: 1, inner, glowC: '#FFF0E6' });
      // completion ring
      if (pop > 0) {
        const R = 74;
        const C2 = 2 * Math.PI * R;
        w += scaleAt(ring[0], ring[1], pop, `<circle cx="${f1(ring[0])}" cy="${f1(ring[1])}" r="${R + 22}" fill="#fff" filter="url(#fSoft)"/>
          <circle cx="${f1(ring[0])}" cy="${f1(ring[1])}" r="${R}" fill="none" stroke="${P.pinkP}" stroke-width="16"/>
          <circle cx="${f1(ring[0])}" cy="${f1(ring[1])}" r="${R}" fill="none" stroke="${P.pink}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${f1(C2 * fillK)} ${f1(C2)}" transform="rotate(-90 ${f1(ring[0])} ${f1(ring[1])})"/>
          ${chk > 0 ? `<g transform="translate(${f1(ring[0])},${f1(ring[1])}) scale(${chk.toFixed(3)})"><circle r="46" fill="${P.teal}"/><path d="M-20,2 L-6,16 L22,-14" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}`);
        w += A.sparkle(ring[0], ring[1], 2.05, t, P.peachL) + A.sparkle(ring[0] - 30, ring[1] + 20, 2.2, t, P.teal);
      }
      // her hand taps the button
      const press = lt < tapAt ? io(seg(lt, 0.1, tapAt)) : 1 - io(seg(lt, tapAt + 0.1, tapAt + 0.6));
      const tip = [btn[0] + (1 - press) * 120, btn[1] + (1 - press) * 160 - (lt > tapAt && lt < tapAt + 0.1 ? -4 : 0)];
      const ang = -128;
      const hx = tip[0] - Math.cos(rad(ang)) * 62 * 2.2, hy = tip[1] - Math.sin(rad(ang)) * 62 * 2.2 + 14;
      w += `<path d="M1150,2000 L${f1(hx + 30)},${f1(hy + 40)}" stroke="${SIM.topD}" stroke-width="128" stroke-linecap="round"/><path d="M1150,2000 L${f1(hx + 30)},${f1(hy + 40)}" stroke="${SIM.topC}" stroke-width="118" stroke-linecap="round"/>
        <path d="M${f1(hx + 58)},${f1(hy + 74)} L${f1(hx + 30)},${f1(hy + 40)}" stroke="${SIM.blouse}" stroke-width="112" stroke-linecap="round"/>`;
      w += hand(hx, hy, ang, SIM, 'point', -1, 2.2);
      return cam(LX, 1050, 1.02 + 0.04 * io(lt / 2.4), w) + warm(0.12) + vignette(0.75);
    }
    const l2 = lt - 2.4;
    const fx = 470, fy = 860, fs = 0.95;
    const close = io(seg(l2, 0.1, 0.6));
    const str = io(seg(l2, 0.85, 1.4)) * (1 - io(seg(l2, 2.3, 2.6)));
    let w = living(t);
    w += fig(t, SIM, {
      x: fx, y: fy, s: fs, seed: 3, cut: 520, mood: str > 0.3 ? 'bliss' : close > 0.5 ? 'smile' : 'soft', look: close > 0.6 ? [0, 0] : [0, 6],
      tilt: -5 * str, head: [0, -6 * str], rim: '#FFD08A', lightSide: 1, glow: '#E9FBF8', glowK: 1 - close,
      hL: [lerp(-150, -110, str), lerp(420, -170, str)], hR: [lerp(150, 110, str), lerp(420, -170, str)], bL: str > 0.2 ? -1 : 1, bR: str > 0.2 ? 1 : -1,
    });
    w += blanket(1300, t);
    w += laptopBack(470, 1330, 440, { open: Math.max(0.001, 1 - close), on: 1 - close });
    w += `<rect x="860" y="1260" width="220" height="30" rx="8" fill="#B07F5E"/>` + mug(950, 1258, 0.8, P.teal, { dark: '#5DB3A8', steam: true, t });
    if (str > 0.5) w += A.sparkle(fx - 140, fy - 170, 37 + 2.4 + 1.2, t, P.pinkL) + A.sparkle(fx + 140, fy - 170, 37 + 2.4 + 1.35, t, P.peachL);
    return cam(470, 960, 1.2 + 0.04 * l2 / 2.6, w) + warm(0.14) + vignette(0.8);
  }

  // Cream product backdrop with drifting pastel blooms.
  function creamMesh(t) {
    return `<rect width="1080" height="1920" fill="${P.cream}"/>
      ${glowC(80 + Math.sin(t * 0.5) * 60, 260 + Math.cos(t * 0.4) * 50, 760, 'gPk', 0.55)}
      ${glowC(1060 + Math.cos(t * 0.45) * 50, 820 + Math.sin(t * 0.35) * 70, 700, 'gTl', 0.5)}
      ${glowC(300 + Math.sin(t * 0.4 + 1) * 70, 1800 + Math.cos(t * 0.5) * 40, 820, 'gPc', 0.5)}
      ${glowC(900, 1700, 500, 'gPu', 0.3)}`;
  }
  function floatParticles(t, seed) {
    let s = '';
    for (let i = 0; i < 12; i++) {
      const x = 40 + hash(i + seed) * 880, sp = 30 + hash(i + 9) * 40;
      const y = 1500 - ((t * sp + hash(i + 3) * 1300) % 1300);
      s += star(x, y, 7 + hash(i + 5) * 9, [P.pinkL, P.peachL, P.tealL][i % 3], f3(0.6 * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))), t * 30 + i * 20);
    }
    return s;
  }

  // 5A 0:42-0:45  The Academy: curriculum on a laptop, slow dolly in.
  function shot5A(t) {
    const lt = t - 42;
    let s = creamMesh(t) + floatParticles(t, 3);
    const z = 0.95 + 0.08 * io(lt / 3.2);
    const fl = Math.sin(t * 1.4) * 6;
    s += cam(470, 1000, z, laptop(470, 1310 + fl, 820, { screen: 'curriculum', zoom: 1 + 0.07 * io(lt / 3), pan: [0.15, 0.1], glowC: '#FFE7EE' }));
    s += head(t, 42.35, CX, 375, 'A Girl &amp; Her Futures', 76, P.dark, { max: 820 });
    s += head(t, 42.6, CX, 468, `<tspan fill="${P.pink}">Academy™</tspan>`, 76, P.pink, { it: true, max: 820 });
    const u = ease(seg(lt, 0.9, 1.5));
    if (u > 0) s += `<path d="M${f1(CX - 130 * u)},506 Q${CX},526 ${f1(CX + 130 * u)},506" stroke="${P.peach}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    return s;
  }

  // 5B 0:45-0:49  Floating device frames: structure, visual, self-paced.
  function deviceFrame(cx, cy, w, screen, rot, sc, op, t) {
    const h = w * 0.625, b = 18;
    const id = uid('df');
    return `<g opacity="${f3(op)}" transform="translate(${f1(cx)},${f1(cy)}) rotate(${f1(rot)}) scale(${sc.toFixed(4)})">
      <rect x="${-w / 2 - b}" y="${-h / 2 - b}" width="${w + 2 * b}" height="${h + 2 * b}" rx="34" fill="#2A211E" filter="url(#fSoft)"/>
      <clipPath id="${id}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="16"/></clipPath>
      <g clip-path="url(#${id})">${img(SCR[screen], -w / 2, -h / 2, w, h)}<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#gShine)"/></g></g>`;
  }
  function shot5B(t) {
    const lt = t - 45;
    let s = creamMesh(t) + floatParticles(t, 7);
    const step = k => { const i = Math.floor(k), f = k - i; return i + io(clamp((f - 0.55) / 0.45)); };
    const pos = Math.min(2, step(Math.max(0, lt + 0.1) / 1.3));
    const cards = [['candles', 'Structured'], ['dots', 'Visual'], ['dayli', 'Self-paced']];
    const order = cards.map((c, i) => ({ c, i, d: i - pos })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    order.forEach(({ c, i, d }) => {
      const x = 470 + d * 600, y = 960 + Math.abs(d) * 40 + Math.sin(t * 1.3 + i) * 10;
      s += deviceFrame(x, y, 720, c[0], -d * 6, 1 - 0.2 * Math.min(1, Math.abs(d)), clamp(1.4 - Math.abs(d) * 0.6), t);
    });
    // headline with the active word in pink
    const act = Math.round(pos);
    const words = cards.map((c, i) => `<tspan fill="${i === act ? P.pink : P.dark}"${i === act ? ' font-style="italic"' : ''}>${c[1]}</tspan>`);
    s += head(t, 45.25, CX, 350, words.join(`<tspan fill="${P.peach}"> · </tspan>`), 62, P.dark, { max: 840 });
    return s;
  }

  // 5C 0:49-0:53  Three quick inserts: put it away, back to life.
  function insertMaya(t, lt) {
    let w = blurG(8, kitchen(t));
    const close = io(seg(lt, 0.2, 0.7));
    w += fig(t, MAYA, { x: 470, y: 860, s: 1.0, seed: 1, cut: 520, mood: close > 0.6 ? 'grin' : 'soft', look: close > 0.6 ? [0, 0] : [0, 6], tilt: close > 0.6 ? 5 : 0, rim: '#FFE3BD', glow: '#E9FBF8', glowK: 1 - close, hL: [-130, 430], hR: [lerp(60, 120, close), lerp(300, 420, close)] });
    w += kitchenTable(1270) + laptopBack(470, 1282, 500, { open: Math.max(0.001, 1 - close), on: 1 - close }) + mug(820, 1268, 0.9, P.teal, { dark: '#5DB3A8', steam: true, t });
    return cam(470, 1000, 1.03 + 0.03 * lt, w);
  }
  function insertZuri(t, lt) {
    let w = blurG(8, campus(t, 1.5));
    const slide = io(seg(lt, 0.2, 0.85));
    const lyy = lerp(1230, 1420, slide);
    const fx = 470, fy = 820, fs = 1.0;
    const handles = `<path d="M300,1190 C300,1060 420,1060 420,1190 M520,1190 C520,1060 640,1060 640,1190" stroke="#D9C6A6" stroke-width="18" fill="none"/>`;
    const tote = `<path d="M240,1190 L700,1190 L680,1700 Q676,1730 646,1730 L294,1730 Q264,1730 260,1700 Z" fill="#EADBC2"/><path d="M240,1190 L700,1190" stroke="#D9C6A6" stroke-width="10"/>
      <path d="M330,1330 L610,1330" stroke="${P.pink}" stroke-width="14" stroke-linecap="round"/>${heart(470, 1440, 2, P.pink)}`;
    const id = uid('tote');
    w += fig(t, ZURI, { x: fx, y: fy, s: fs, seed: 2, cut: 520, mood: slide > 0.7 ? 'grin' : 'smile', look: slide > 0.7 ? [0, 0] : [0, 6], tilt: slide > 0.7 ? -4 : 0, rim: '#FFE0B0', hL: [-150, lyy - fy + 40], hR: [150, lyy - fy + 40] , armL: false, armR: false });
    w += `<path d="M250,1180 L690,1180 L700,1200 L240,1200 Z" fill="#CDB894"/>` + handles;
    w += `<clipPath id="${id}"><rect x="0" y="0" width="1080" height="1196"/></clipPath><g clip-path="url(#${id})"><rect x="290" y="${f1(lyy - 200)}" width="360" height="240" rx="16" fill="#4A3C36"/><rect x="296" y="${f1(lyy - 194)}" width="348" height="228" rx="12" fill="url(#gLid)"/>${heart(470, lyy - 80, 1.6, P.pink)}<circle cx="560" cy="${f1(lyy - 40)}" r="18" fill="${P.teal}"/>${star(560, lyy - 40, 10, '#fff')}</g>`;
    w += fig(t, ZURI, { x: fx, y: fy, s: fs, seed: 2, cut: 520, only: 'arms', hL: [-185, Math.min(lyy - fy - 100, 330)], hR: [185, Math.min(lyy - fy - 100, 330)], bL: -1, bR: 1 });
    w += tote;
    return cam(470, 1000, 1.03 + 0.03 * lt, w);
  }
  function insertSimone(t, lt) {
    let w = blurG(8, living(t));
    const set = io(seg(lt, 0.15, 0.75));
    const lyy = lerp(1150, 1318, set);
    w += fig(t, SIM, { x: 470, y: 840 + 12 * set, s: 1.0, seed: 3, cut: 520, mood: set > 0.7 ? 'grin' : 'smile', look: set > 0.7 ? [0, 0] : [0, 7], tilt: set > 0.7 ? 4 : 0, head: [0, 8 * set], rim: '#FFD08A', lightSide: 1, hL: [-170, lyy - 850 - 20], hR: [170, lyy - 850 - 20] });
    w += `<path d="M-20,1330 L1100,1330 L1100,1400 L-20,1400 Z" fill="#C99A70"/><rect x="-20" y="1322" width="1120" height="14" fill="#E2B88E"/><rect x="-20" y="1400" width="1120" height="600" fill="#A87A55"/>`;
    w += `<rect x="${f1(320)}" y="${f1(lyy - 16)}" width="300" height="22" rx="8" fill="#D9CEC6"/><rect x="320" y="${f1(lyy - 16)}" width="300" height="8" rx="4" fill="#F0E8E2"/>`;
    w += mug(800, 1324, 0.9, P.purpleL, { dark: P.purple, heart: false, steam: true, t }) + plant(180, 1300, 0.6, '#86B596', P.peach);
    return cam(470, 1000, 1.03 + 0.03 * lt, w);
  }
  function shot5C(t) {
    const lt = t - 49;
    const parts = [[0, insertMaya], [1.33, insertZuri], [2.66, insertSimone]];
    let s = '';
    parts.forEach(([a, fn], i) => {
      const b = i < 2 ? parts[i + 1][0] : 99;
      if (lt < a - 0.12 || lt > b + 0.12) return;
      const op = i === 0 ? 1 : clamp((lt - a + 0.12) / 0.24);
      s += fade(op, fn(t, lt - a) + warm(0.12));
    });
    s += vignette(0.6);
    s += `<rect width="1080" height="620" fill="url(#gTopScrim)"/>`;
    s += head(t, 49.25, CX, 300, 'Designed to fit', 70, P.dark, { max: 820 });
    s += head(t, 49.55, CX, 390, `the life you <tspan fill="${P.pink}" font-style="italic">already have.</tspan>`, 64, P.dark, { max: 840 });
    return s;
  }

  // 6A 0:53-0:56  Golden hour: swing, lawn, candlelit dinner.
  function swingScene(t, o = {}) {
    let w = park(t);
    const ang = 20 * Math.sin((t - 53) * 2 * Math.PI / 2.3 + 0.6);
    const ss = swingSet(t, 710, 430, 720, ang);
    w += ss.frame;
    // Maya behind-left, pushing when the swing comes back
    const near = clamp((-ang + 4) / 20);
    const mx = 235, my = 760, ms = 0.98;
    const back = [ss.sx - 90, ss.sy - 120];
    const hT = loc(mx, my, ms, Math.min(back[0], 450), back[1]);
    w += fig(t, MAYA, {
      x: mx, y: my, s: ms, seed: 1, body: 'full', mood: 'laugh', tilt: 5 + near * 4, look: [6, 0], turn: 0.3, rim: '#FFD39A', lightSide: 1,
      hL: [hT[0] - 30, hT[1]], hR: [hT[0] + 10, hT[1] + 20], kL: 'open', kR: 'open', bL: -1, bR: -1, lean: 6 * near,
    });
    w += ss.ropes;
    // daughter on the swing
    const ks = 0.7;
    const hipLocal = BODY.kid.hipY - 16;
    w += `<g transform="rotate(${f1(-ang)} ${f1(ss.sx)} ${f1(ss.sy)})">`;
    w += fig(t, KID, {
      x: ss.sx, y: ss.sy - hipLocal * ks - 10, s: ks, seed: 4, body: 'full', legs: 'swing', kickK: clamp(ang / 20), mood: 'laugh', tilt: -4, rim: '#FFD39A', lightSide: 1,
      hL: [-62, 120], hR: [62, 120], bL: 1, bR: -1, straps: false,
    });
    w += `<rect x="${f1(ss.sx - 90)}" y="${f1(ss.sy - 10)}" width="180" height="22" rx="10" fill="${P.pink}"/></g>`;
    w += leaves(t, 6, 5, [-40, 300, 1160, 1200], ['#F5A857', '#E9A93B', '#FAD09A']);
    w += flare(800, 760, (o.flare ?? 0.8) + 0.1 * Math.sin(t * 1.3));
    return w;
  }
  function lawnScene(t) {
    let w = `<rect width="1080" height="1920" fill="url(#gGolden)"/>` + glowC(540, 640, 600, 'gSun', 1);
    w += tree(120, 1000, 1.1, ['#B9C783', '#A9BB79', '#CFD594', '#F2C27E'], t, 3) + tree(980, 980, 1.2, ['#B5C27F', '#A3B675', '#C9D08E', '#F5B472'], t, 4);
    w += `<rect x="-10" y="980" width="1100" height="960" fill="#BCCB8A"/><rect x="-10" y="980" width="1100" height="960" fill="#F5B472" opacity=".2"/>`;
    w += bokeh(t, 14, 31, ['#FFE9C4', '#FFD9A0'], [0, 300, 1080, 700], { r0: 18, r1: 40, op: 0.35, blur: 'fB8' });
    const ppl = [[FRIENDS.lena, 170, 930, 0.62, 5, -6], [ZURI, 390, 880, 0.7, 2, 8], [FRIENDS.kemi, 610, 920, 0.64, 7, -4], [FRIENDS.rosa, 815, 945, 0.6, 8, 6]];
    ppl.forEach(([L, x, y, s, seed, tl]) => {
      w += fig(t, L, { x, y, s, seed, cut: 640, mood: 'laugh', tilt: tl + Math.sin(t * 3 + seed) * 2, rim: '#FFD39A', lightSide: x < 540 ? -1 : 1, hL: [-130, 560], hR: [130, 560], tote: L === ZURI });
    });
    w += `<path d="M-40,1300 L1120,1300 L1120,1940 L-40,1940 Z" fill="${P.pinkP}"/>`;
    for (let i = 0; i < 12; i++) w += `<rect x="${-40 + i * 100}" y="1300" width="50" height="640" fill="${P.pinkL}" opacity=".5"/>`;
    for (let i = 0; i < 7; i++) w += `<rect x="-40" y="${1300 + i * 100}" width="1160" height="50" fill="${P.pinkL}" opacity=".35"/>`;
    w += `<rect x="380" y="1340" width="140" height="100" rx="16" fill="#E4DAD2"/>` + leaves(t, 8, 9, [-40, 300, 1160, 1200], ['#F5A857', '#E9A93B', '#FAD09A', '#C6D69A']);
    w += flare(540, 640, 0.7);
    return w;
  }
  function wineGlass(x, y, sc, drink = P.pinkL) {
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><path d="M-30,-110 L30,-110 Q34,-50 0,-36 Q-34,-50 -30,-110 Z" fill="#fff" opacity=".55"/><path d="M-28,-84 L28,-84 Q30,-50 0,-38 Q-30,-50 -28,-84 Z" fill="${drink}"/><path d="M0,-36 L0,10" stroke="#fff" stroke-width="5" opacity=".8"/><ellipse cx="0" cy="12" rx="20" ry="5" fill="#fff" opacity=".7"/><path d="M-18,-104 L-16,-60" stroke="#fff" stroke-width="4" opacity=".7"/></g>`;
  }
  function dinnerScene(t, lt) {
    let w = `<rect width="1080" height="1920" fill="#5E3B36"/>` + glowC(540, 900, 800, 'gLamp', 0.45);
    w += stringLights(t, -40, 1120, 300, 120, 5) + bokeh(t, 18, 51, ['#FFD9A0', '#FFC777', '#F9B8C6'], [0, 350, 1080, 600], { r0: 16, r1: 36, op: 0.45, blur: 'fB8' });
    const clink = io(seg(lt, 0.15, 0.55));
    const ppl = [[FRIENDS.nia, 200, 900, 0.72, 5, 1], [SIM, 470, 860, 0.8, 3, 0], [FRIENDS.jo, 750, 900, 0.72, 6, -1]];
    ppl.forEach(([L, x, y, s, seed, dir]) => {
      const gx = 470 + 30 + dir * lerp(190, 80, clink), gy = lerp(1060, 990, clink) + Math.abs(dir) * 12;
      const h = loc(x, y, s, gx, gy + 6);
      w += fig(t, L, {
        x, y, s, seed, cut: 520, mood: lt > 0.5 ? 'laugh' : 'grin', look: [dir * 4, -2], turn: dir * 0.25, tilt: dir * 4, rim: '#FFC777', lightSide: dir || 1,
        hL: dir >= 0 ? h : [-120, 470], hR: dir < 0 ? h : dir === 0 ? h : [120, 470], kL: 'rest', kR: 'rest', bL: -1, bR: 1,
        mid: '',
      });
      w += wineGlass(gx, gy, 0.9 * (s / 0.75));
    });
    if (clink > 0.95) w += A.sparkle(500, 900, 0.55, lt, '#FFE2B0');
    w += `<rect x="-20" y="1180" width="1120" height="760" fill="#FBEFE4"/><rect x="-20" y="1180" width="1120" height="14" fill="#fff"/>`;
    [[300, 1170], [640, 1160], [820, 1175]].forEach(([x, y], i) => {
      const fl = 1 + 0.12 * Math.sin(t * 13 + i * 2) + 0.06 * Math.sin(t * 29 + i);
      w += `<rect x="${x - 14}" y="${y - 110}" width="28" height="110" rx="6" fill="#FFF6E8"/>` + glowC(x, y - 140, 120 * fl, 'gCandle', 0.9) + `<path d="M${x},${f1(y - 160 * fl)} Q${x + 12},${y - 130} ${x},${y - 116} Q${x - 12},${y - 130} ${x},${f1(y - 160 * fl)} Z" fill="#FFE2A0"/>`;
    });
    w += `<ellipse cx="160" cy="1260" rx="140" ry="36" fill="#fff"/><ellipse cx="480" cy="1290" rx="150" ry="36" fill="#fff"/><ellipse cx="900" cy="1270" rx="140" ry="36" fill="#fff"/>`;
    return w;
  }
  function shot6A(t) {
    const lt = t - 53;
    const parts = [[0, (tt, l) => cam(470, 960, 1.02 + 0.03 * l, swingScene(tt))], [1.05, (tt, l) => cam(470, 980, 1.03 + 0.03 * l, lawnScene(tt))], [2.1, (tt, l) => cam(480, 960, 1.2 + 0.03 * l, dinnerScene(tt, l))]];
    let s = '';
    parts.forEach(([a, fn], i) => {
      const b = i < 2 ? parts[i + 1][0] : 99;
      if (lt < a - 0.2 || lt > b + 0.2) return;
      const op = i === 0 ? 1 : clamp((lt - a + 0.2) / 0.4);
      s += fade(op, fn(t, lt - a));
    });
    return s + warm(0.16) + vignette(0.7);
  }
  // 6B 0:56-0:58  Hold on Maya's laugh, golden flare, fade toward pink.
  function shot6B(t) {
    const lt = t - 56;
    const z = 1.5 + 0.12 * io(lt / 2);
    let s = cam(330, 840, z, swingScene(t, { flare: 0.9 + 0.6 * io(seg(lt, 0.4, 1.6)) }), 140, 40);
    s += warm(0.18) + vignette(0.7);
    s += screenBlend(glowC(800, 520, 900 * io(seg(lt, 0.3, 1.8)), 'gSun', io(seg(lt, 0.3, 1.8))));
    const pk = io(seg(lt, 1.1, 2.0));
    if (pk > 0) s += `<g opacity="${f3(pk)}">${endBG(t)}</g>`;
    return s;
  }

  // 6C 0:58-1:00  End card.
  function endBG(t) {
    const tt = t - 56;
    let s = `<rect width="1080" height="1920" fill="${P.pink}"/>`;
    [[1080, 0, 'gTealB', 1150, 0], [0, 1920, 'gPeachB', 1250, 1], [0, 0, 'gPk', 820, 2], [1080, 1920, 'gPurpleB', 940, 3], [540, 960, 'gWhite', 600, 4]].forEach(([x, y, g, R, i]) => {
      const r = R * (1 + 0.06 * Math.sin(tt * 1.2 + i * 2));
      s += `<circle cx="${f1(x + Math.sin(tt * 0.6 + i) * 40)}" cy="${f1(y + Math.cos(tt * 0.5 + i) * 40)}" r="${f1(r)}" fill="url(#${g})" opacity="${i === 4 ? 0.22 : i === 3 ? 0.45 : 0.75}"/>`;
    });
    for (let i = 0; i < 14; i++) {
      const x = 40 + hash(i) * 880, sp = 26 + hash(i + 9) * 30;
      const y = 1500 - ((tt * sp + hash(i + 3) * 1400) % 1400);
      s += star(x, y, 7 + hash(i + 5) * 10, i % 3 ? P.cream : P.peachL, f3(0.6 * (0.4 + 0.6 * Math.abs(Math.sin(tt * 2 + i)))), tt * 30 + i * 20);
    }
    return s;
  }
  function shot6C(t) {
    let s = endBG(t);
    const k = (at, y, inner) => { const e = ease((t - at) / 0.6); return e <= 0 ? '' : `<g transform="translate(0,${f1((1 - e) * 24)})" opacity="${f3(e)}">${inner}</g>`; };
    s += k(58.35, 0, txt(CX, 950, 'A GIRL &amp; HER FUTURES ACADEMY™', fitSize('A GIRL & HER FUTURES ACADEMY™', 38, 820, DM, 700), P.cream, { w: 700, ls: 4 }));
    s += k(58.6, 0, `<text x="${CX}" y="1062" font-size="64" font-family="${PF}" font-style="italic" font-weight="400" text-anchor="middle" fill="${P.cream}">Go live your life, girl. <tspan font-family="Noto Color Emoji" font-style="normal" font-size="54">🫧✨</tspan></text>`);
    s += k(58.85, 0, txt(CX, 1160, 'Join the AGHF community.', 34, P.cream, { w: 500 }) + txt(CX, 1208, 'Start learning at your pace.', 34, P.cream, { w: 500 }));
    s += k(59.0, 0, txt(CX, 1452, 'Trading involves risk.', 22, P.cream, { w: 500, op: 0.85 }));
    return s;
  }

  /* ================================================================== *
   * TIMELINE + TRANSITIONS
   * ================================================================== */
  const SHOTS = [
    { a: 0, f: shot1A },
    { a: 3, f: shot1B, tr: 'dissolve', d: 0.5 },
    { a: 7, f: shot1C, tr: 'dissolve', d: 0.5 },
    { a: 10, f: shot2A, tr: 'leak', d: 0.9 },
    { a: 13, f: shot2B, tr: 'whip', d: 0.5 },
    { a: 16, f: shot2C, tr: 'dissolve', d: 0.5 },
    { a: 20, f: shot3A, tr: 'leak', d: 0.9 },
    { a: 24, f: shot3B, tr: 'dissolve', d: 0.5 },
    { a: 27, f: shot3C, tr: 'dissolve', d: 0.5 },
    { a: 30, f: shot4A, tr: 'split', d: 0.8 },
    { a: 33, f: shot4B, tr: 'dissolve', d: 0.4 },
    { a: 35, f: shot4C, tr: 'dissolve', d: 0.4 },
    { a: 37, f: shot4D, tr: 'dissolve', d: 0.4 },
    { a: 42, f: shot5A, tr: 'pink', d: 0.9 },
    { a: 45, f: shot5B, tr: 'dissolve', d: 0.5 },
    { a: 49, f: shot5C, tr: 'dissolve', d: 0.5 },
    { a: 53, f: shot6A, tr: 'dissolve', d: 0.6 },
    { a: 56, f: shot6B, tr: 'dissolve', d: 0.5 },
    { a: 58, f: shot6C, tr: 'cut' },
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
        const e = io(k), sd = 70 * Math.sin(Math.PI * k);
        const id = uid('wp');
        return `<filter id="${id}" filterUnits="userSpaceOnUse" x="-400" y="0" width="1880" height="1920"><feGaussianBlur stdDeviation="${f1(sd)} 0"/></filter>
          <g filter="url(#${id})"><g transform="translate(${f1(-1150 * e)},0)">${prev()}</g><g transform="translate(${f1(1150 * (1 - e))},0)">${next()}</g></g>`;
      }
      case 'split': {
        const lt = t - S.a;
        const offs = [0, 1, 2].map(i => { const e = io(clamp((k - i * 0.12) / 0.76)); return (i % 2 ? 1 : -1) * 1920 * (1 - e); });
        let s = prev();
        PANELS.forEach(([x, w, fn, cx], i) => {
          const id = uid('sp');
          s += `<clipPath id="${id}"><rect x="${x}" y="${f1(offs[i])}" width="${w}" height="1920"/></clipPath><g clip-path="url(#${id})">${S.f(t)}</g>`;
          s += `<rect x="${x + w}" y="${f1(offs[i])}" width="6" height="1920" fill="${P.cream}"/>`;
        });
        return s;
      }
      case 'pink': {
        const y = 1920 - k * (1920 + 2300);
        const id1 = uid('pk1'), id2 = uid('pk2');
        const wave = (yy) => `M-20,${f1(yy)} Q270,${f1(yy - 70)} 540,${f1(yy)} T1100,${f1(yy)}`;
        let s = `<clipPath id="${id1}"><rect x="0" y="-100" width="1080" height="${f1(Math.max(0, y + 100))}"/></clipPath><g clip-path="url(#${id1})">${prev()}</g>`;
        s += `<clipPath id="${id2}"><rect x="0" y="${f1(y + 2300)}" width="1080" height="${f1(Math.max(0, 1920 - y - 2300 + 100))}"/></clipPath><g clip-path="url(#${id2})">${next()}</g>`;
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
    // headline spanning 6A and 6B
    let over = '';
    if (t > 53.2 && t < 57.9) {
      const o = 1 - io(seg(t, 57.2, 57.8));
      over += `<g opacity="${f3(o)}"><rect width="1080" height="640" fill="url(#gTopDark)"/>` +
        head(t, 53.35, CX, 300, 'Trading education,', 68, P.cream, { max: 820 }) +
        head(t, 53.7, CX, 392, `reimagined around <tspan fill="${P.peachL}" font-style="italic">HER.</tspan>`, 68, P.cream, { max: 840 }) + '</g>';
    }
    return DEFS + body + over;
  }

  // Logo layer (drawn as an <img> by her-own.html).
  function logo(t) {
    if (t >= 42.2 && t < 45.1) {
      const k = back(seg(t, 42.45, 43.0)), out = 1 - ease(seg(t, 44.7, 45.0));
      return { x: CX, y: 220, size: 132 * k, op: clamp((t - 42.45) / 0.2) * out, rot: Math.sin(t * 2) * 2 };
    }
    if (t >= 58.0) {
      const k = back(seg(t, 58.05, 58.7));
      return { x: CX, y: 640, size: 390 * k * (1 + 0.02 * Math.sin(t * 2.4)), op: clamp((t - 58.05) / 0.2), rot: (1 - clamp(k)) * -16 + Math.sin(t * 1.8) * 1.5 };
    }
    return null;
  }

  const DURATION = 60;
  const CAP_BOTTOM = 1490;
  const CAPTIONS = [
    { at: 0.2, end: 2.95, text: 'She’s a mother.' },
    { at: 3.0, end: 4.95, text: 'Her mornings are busy.' },
    { at: 5.0, end: 6.95, text: 'Her days are full.' },
    { at: 7.0, end: 8.55, text: 'But somewhere between taking care of everyone else,' },
    { at: 8.6, end: 9.95, text: 'she’s still making room for herself.' },
    { at: 10.0, end: 12.95, text: 'She’s a student.' },
    { at: 13.0, end: 15.95, text: 'Building her future, one class at a time.' },
    { at: 16.0, end: 19.95, text: 'But she’s curious about what else she could learn.' },
    { at: 20.0, end: 23.95, text: 'And she’s a woman with a career,' },
    { at: 24.0, end: 26.95, text: 'responsibilities,' },
    { at: 27.0, end: 29.95, text: 'and a life she’s worked hard to build.' },
    { at: 30.0, end: 31.0, text: 'Three different women.' },
    { at: 31.0, end: 32.0, text: 'Three different lives.' },
    { at: 32.0, end: 32.95, text: 'One thing in common.' },
    { at: 35.0, end: 38.2, text: 'They shouldn’t have to put their lives on hold' },
    { at: 38.25, end: 41.95, text: 'just to learn something new.' },
    { at: 42.0, end: 44.95, text: 'Introducing A Girl & Her Futures Academy.' },
    { at: 45.0, end: 48.95, text: 'A structured, self-paced way to learn futures trading,' },
    { at: 49.0, end: 52.95, text: 'designed to fit into the life you already have.' },
    { at: 53.0, end: 55.95, text: 'Because trading can be something you learn' },
    { at: 56.0, end: 57.95, text: 'without becoming your entire life.' },
  ];

  // Caption times follow the voiceover take (vo-*.js, written by place-voiceover.py).
  if (window.VO_CAPTIONS && window.VO_CAPTIONS.length === CAPTIONS.length) window.VO_CAPTIONS.forEach((v, i) => Object.assign(CAPTIONS[i], v));

  window.HO = { DURATION, CAP_BOTTOM, CAPTIONS, draw, logo, castSheet, SHOTS };
})();
