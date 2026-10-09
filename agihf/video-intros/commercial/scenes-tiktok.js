/**
 * scenes-tiktok.js: the 48s vertical TikTok commercial for A Girl & Her Futures™.
 *
 * window.TT.draw(t) returns the SVG markup for the 1080x1920 frame at time t.
 * Everything is a pure function of t (no state between frames), so renders are
 * frame-accurate. Drawing primitives come from ../illustrations.js (window.ART).
 *
 * TikTok safe zone: text and key art stay inside x 0..940, y 150..1520.
 * Headlines sit at the top (y 200..450); the caption band sits at the bottom
 * of the safe zone (bottom edge y 1490), so shot art lives in y 450..1330.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const f1 = v => (+v).toFixed(1);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.5) => back((t - at) / d);
  const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rad = d => d * Math.PI / 180;
  const CX = 490;                     // centre of the safe zone horizontally
  const PF = 'Playfair Display', DM = 'DM Sans';
  const DK = { teal: '#2F8A7F', pink: '#C2475F', purple: '#5E56B8', peach: '#B86E12' };
  const PALE = { pink: '#FDE8ED', teal: '#E8F8F6', peach: '#FEF3E4', purple: '#EEEDFE' };
  const CREAM = '#FFFBF9', DARK = C.dark;

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

  // Headline line: slides up and fades in at `at`, auto-shrinks to fit maxW.
  function head(t, at, x, y, s, size, col, o = {}) {
    const k = ease((t - at) / 0.45);
    if (k <= 0) return '';
    const out = o.out != null ? 1 - ease((t - o.out) / 0.3) : 1;
    if (out <= 0) return '';
    const f = o.f || PF, w = o.w || 900;
    const sz = fitSize(s, size, o.max || 860, f, w, o.it);
    const sh = o.shadow ? txt(x, y + 5, s.replace(/fill="[^"]*"/g, ''), sz, o.shadow, { f, w, it: o.it, op: 0.22 }) : '';
    return `<g transform="translate(0,${f1((1 - k) * 46)})" opacity="${(k * out).toFixed(3)}">${sh}${txt(x, y, s, sz, col, { f, w, it: o.it })}</g>`;
  }
  // Headline that pops (scale) instead of sliding.
  function popHead(t, at, x, y, s, size, col, o = {}) {
    const k = pop(t, at, 0.5);
    if (k <= 0) return '';
    const f = o.f || PF, w = o.w || 900;
    const sz = fitSize(s, size, o.max || 860, f, w, o.it);
    const sh = o.shadow ? txt(x, y + 5, s.replace(/fill="[^"]*"/g, ''), sz, o.shadow, { f, w, it: o.it, op: 0.22 }) : '';
    return scaleAt(x, y - sz * 0.35, k, sh + txt(x, y, s, sz, col, { f, w, it: o.it }), clamp((t - at) / 0.15));
  }

  const scaleAt = (x, y, k, inner, op) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k.toFixed(4)}) translate(${f1(-x)},${f1(-y)})"${op != null ? ` opacity="${clamp(op).toFixed(3)}"` : ''}>${inner}</g>`;
  const rotAt = (x, y, a, inner) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${inner}</g>`;
  const fade = (k, inner) => k <= 0 ? '' : `<g opacity="${clamp(k).toFixed(3)}">${inner}</g>`;
  const pill = (x, y, text, col, k = 1, fs = 34, tc = '#fff', o = {}) => {
    if (k <= 0) return '';
    const w = measure(plain(text), fs, DM, 700) + fs * 1.3 + (o.ls ? o.ls * [...plain(text)].length : 0);
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${k.toFixed(4)})"><rect x="${f1(-w / 2)}" y="${f1(-fs * 0.85)}" width="${f1(w)}" height="${f1(fs * 1.7)}" rx="${f1(fs * 0.85)}" fill="${col}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="3"` : ''}/>
      ${txt(0, fs * 0.36, text, fs, tc, { w: 700, ls: o.ls })}</g>`;
  };
  const check = (x, y, k, col = C.teal, r = 34) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${(k * r / 34).toFixed(3)})"><circle r="34" fill="${col}" stroke="#fff" stroke-width="5"/><path d="M-15,1 L-4,13 L17,-12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, col = C.pink, r = 34) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k.toFixed(3)})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/><path d="M${-r * 0.38},${-r * 0.38} L${r * 0.38},${r * 0.38} M${r * 0.38},${-r * 0.38} L${-r * 0.38},${r * 0.38}" stroke="#fff" stroke-width="${r * 0.24}" stroke-linecap="round"/></g>`;
  const spark = (x, y, t0, t, col) => A.sparkle(x, y, t0, t, col);
  // A four-point twinkle star.
  const star = (x, y, r, col, op = 1, rot = 0) => `<path transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})" d="M0,${-r} Q${r * 0.18},${-r * 0.18} ${r},0 Q${r * 0.18},${r * 0.18} 0,${r} Q${-r * 0.18},${r * 0.18} ${-r},0 Q${-r * 0.18},${-r * 0.18} 0,${-r} Z" fill="${col}" opacity="${op}"/>`;
  const heart = (x, y, s, col, op = 1) => `<path transform="translate(${f1(x)},${f1(y)}) scale(${s.toFixed(3)})" d="M0,10 C-26,-8 -20,-30 -6,-28 C0,-27 0,-22 0,-20 C0,-22 0,-27 6,-28 C20,-30 26,-8 0,10 Z" fill="${col}" opacity="${op}"/>`;

  function blink(t, seed) {
    const period = 3.3 + (seed % 4) * 0.6;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  function reach(sx, sy, hx, hy, l1, l2, bend) {
    let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
    const maxD = l1 + l2 - 0.5;
    if (d > maxD) { hx = sx + dx / d * maxD; hy = sy + dy / d * maxD; d = maxD; }
    const a = Math.atan2(hy - sy, hx - sx);
    const Ang = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
    return { ex: sx + Math.cos(a + bend * Ang) * l1, ey: sy + Math.sin(a + bend * Ang) * l1, hx, hy };
  }

  /* ---------------- shared defs ---------------- */
  const DEFS = `<defs>
    ${[['gT', C.teal], ['gP', C.peach], ['gPL', '#FBC3CF'], ['gPu', C.purpleL], ['gTP', '#D9F2EE'], ['gPP', '#FCDDE4'], ['gPeP', '#FDE9CF'], ['gPuP', '#E4E2FB'], ['gGlow', '#9FE6DC'], ['gGold', '#FFE7A8']].map(([id, c]) =>
      `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".5" stop-color="${c}" stop-opacity=".5"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
    <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D1633"/><stop offset="1" stop-color="#3A2A58"/></linearGradient>
    <linearGradient id="gDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8F8F6"/><stop offset="1" stop-color="#FFFBF9"/></linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FDCF0"/><stop offset="1" stop-color="#DDF4F1"/></linearGradient>
    <linearGradient id="gScrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140F24" stop-opacity=".92"/><stop offset=".7" stop-color="#140F24" stop-opacity=".6"/><stop offset="1" stop-color="#140F24" stop-opacity="0"/></linearGradient>
    <linearGradient id="gHome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9B8C6"/><stop offset="1" stop-color="#FAD09A"/></linearGradient>
    <linearGradient id="gLv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8F87EA"/><stop offset="1" stop-color="#5E56B8"/></linearGradient>
    <linearGradient id="gShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#2C1810" flood-opacity=".16"/></filter>
    <clipPath id="lensClip"><circle r="33"/></clipPath>
  </defs>`;

  // Soft cream mesh: drifting pastel blobs (like the site's radial mesh).
  function creamMesh(t, base = CREAM) {
    return `<rect width="1080" height="1920" fill="${base}"/>
      <circle cx="${f1(80 + Math.sin(t * 0.5) * 60)}" cy="${f1(160 + Math.cos(t * 0.4) * 50)}" r="760" fill="url(#gPP)"/>
      <circle cx="${f1(1060 + Math.cos(t * 0.45) * 50)}" cy="${f1(620 + Math.sin(t * 0.35) * 70)}" r="700" fill="url(#gTP)"/>
      <circle cx="${f1(360 + Math.sin(t * 0.4 + 1) * 70)}" cy="${f1(1880 + Math.cos(t * 0.5) * 40)}" r="820" fill="url(#gPeP)"/>`;
  }

  // Pink splash with teal and peach blooms rippling in from the corners.
  function splash(tt) {
    const blooms = [[1080, 0, 'gT', 0.0, 1150], [0, 1920, 'gP', 0.12, 1250], [0, 0, 'gPL', 0.28, 820], [1080, 1920, 'gPu', 0.4, 940]];
    let s = `<rect width="1080" height="1920" fill="${C.pink}"/>`;
    blooms.forEach(([x, y, g, d, R], i) => {
      const r = R * (0.08 + 0.92 * ease((tt - d) / 1.2)) * (1 + 0.05 * Math.sin(tt * 1.4 + i * 2));
      s += `<circle cx="${x}" cy="${y}" r="${f1(r)}" fill="url(#${g})"/>`;
    });
    [[1080, 0], [0, 1920]].forEach(([x, y], ci) => {
      for (let j = 0; j < 3; j++) {
        const ph = ((tt * 0.5 + j / 3 + ci * 0.17) % 1);
        const op = (1 - ph) * 0.32 * clamp(tt * 2);
        s += `<circle cx="${x}" cy="${y}" r="${f1(160 + ph * 1500)}" fill="none" stroke="${CREAM}" stroke-width="${f1(10 - ph * 7)}" opacity="${op.toFixed(3)}"/>`;
      }
    });
    // drifting twinkles
    for (let i = 0; i < 14; i++) {
      const x = 60 + hash(i) * 860, sp = 40 + hash(i + 9) * 50;
      const y = 1500 - ((tt * sp + hash(i + 3) * 1400) % 1400);
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(tt * 2 + i));
      s += star(x, y, 8 + hash(i + 5) * 12, i % 3 ? CREAM : C.peachL, (0.7 * tw * clamp(tt * 2)).toFixed(2), tt * 40 + i * 20);
    }
    return s;
  }

  /* ---------------- the student (new character, not Aristella) ----------------
   * Waist-up bust, head centre at (0,0), torso bottom ~y 560. Round glasses,
   * high bun with a peach scrunchie, bob, teal hoodie.
   *   mood: 'confused' | 'happy' | 'calm'; lookX/lookY: pupils; handL/handR: local targets
   *   reflect(t): SVG drawn inside each lens (lens-local coords, r 33)
   */
  function student(t, o) {
    const s = o.s || 1, seed = o.seed || 3, bl = blink(t, seed);
    const skin = '#B07A55', skinD = '#93603F', hair = '#2A1A12', hood = o.hood || C.teal, hoodD = o.hoodD || C.tealD;
    const bob = (o.bob ?? 1) * Math.sin(t * 2.2 + seed) * 4;
    const mood = o.mood || 'calm', lx = o.lookX || 0, ly = o.lookY || 0;
    const hL = o.handL || [-150, 520], hR = o.handR || [150, 520];
    const aL = reach(-140, 200, hL[0], hL[1], 150, 140, 1);
    const aR = reach(140, 200, hR[0], hR[1], 150, 140, o.bendR || -1);
    const armP = (sx, a) => `<path d="M${sx},200 L${f1(a.ex)},${f1(a.ey)} L${f1(a.hx)},${f1(a.hy)}" stroke="${hood}" stroke-width="64" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const handP = (a, fist) => fist
      ? `<g transform="translate(${f1(a.hx)},${f1(a.hy)})"><circle r="36" fill="${skin}"/><path d="M-20,-14 Q-10,-24 0,-14 M0,-14 Q10,-24 20,-14" stroke="${skinD}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-24,4 Q-6,14 14,6" stroke="${skinD}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`
      : `<circle cx="${f1(a.hx)}" cy="${f1(a.hy)}" r="32" fill="${skin}"/>`;
    const brow = {
      confused: `<path d="M-64,-50 Q-42,-70 -18,-56" /><path d="M18,-36 Q42,-30 64,-40" />`,
      happy: `<path d="M-62,-50 Q-40,-66 -18,-52" /><path d="M18,-52 Q40,-66 62,-50" />`,
      calm: `<path d="M-60,-44 Q-40,-54 -20,-46" /><path d="M20,-46 Q40,-54 60,-44" />`,
    }[mood];
    const eyes = o.squint
      ? `<path d="M-52,10 Q-40,-6 -28,10 M28,10 Q40,-6 52,10" stroke="${hair}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      : [-40, 40].map(ex => `<ellipse cx="${f1(ex + lx)}" cy="${f1(4 + ly)}" rx="11" ry="${f1(14 * (1 - bl * 0.9))}" fill="${hair}"/>${bl < 0.5 ? `<circle cx="${f1(ex + lx + 4)}" cy="${f1(ly - 2)}" r="4" fill="#fff"/>` : ''}`).join('');
    const talk = o.talk ? Math.abs(Math.sin(t * 11 + seed)) : 0;
    const mouth = mood === 'confused'
      ? `<path d="M-26,66 Q-14,56 -2,66 Q10,76 24,64" stroke="#6B2A2A" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : mood === 'happy'
        ? `<path d="M-36,52 Q0,108 36,52 Q0,62 -36,52 Z" fill="#6B2A2A"/><ellipse cx="0" cy="80" rx="15" ry="8" fill="${C.pink}"/>`
        : talk > 0.1 ? `<ellipse cx="0" cy="64" rx="16" ry="${f1(4 + talk * 10)}" fill="#6B2A2A"/>`
          : `<path d="M-26,56 Q0,78 26,56" stroke="#6B2A2A" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    const lens = ex => `<g transform="translate(${ex},2)">${o.reflect ? `<g clip-path="url(#lensClip)">${o.reflect(t, ex)}</g>` : ''}
        <circle r="36" fill="#fff" fill-opacity="${o.reflect ? 0.06 : 0.16}" stroke="${o.frame || C.purple}" stroke-width="7"/>
        <path d="M-18,-20 Q-8,-28 4,-26" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/></g>`;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s})"><g transform="translate(0,${f1(bob)}) rotate(${f1(o.tilt || 0)} 0 200)">
      <circle cx="0" cy="-156" r="56" fill="${hair}"/><circle cx="-26" cy="-180" r="22" fill="${hair}"/><circle cx="28" cy="-176" r="20" fill="${hair}"/>
      <ellipse cx="0" cy="-112" rx="46" ry="13" fill="${C.peach}"/><circle cx="34" cy="-114" r="10" fill="${C.peachL}"/>
      <path d="M-122,20 C-136,-110 -76,-152 0,-152 C76,-152 136,-110 122,20 L126,116 Q96,136 66,114 L-66,114 Q-96,136 -126,116 Z" fill="${hair}"/>
      <rect x="-30" y="80" width="60" height="100" rx="24" fill="${skinD}"/>
      <path d="M-206,620 C-206,320 -176,196 -100,174 L100,174 C176,196 206,320 206,620 Z" fill="${hood}"/>
      <path d="M-104,176 Q0,250 104,176 Q60,150 0,156 Q-60,150 -104,176 Z" fill="${hoodD}"/>
      <path d="M-30,214 L-36,310 M30,214 L36,310" stroke="${CREAM}" stroke-width="7" stroke-linecap="round"/><circle cx="-36" cy="314" r="8" fill="${CREAM}"/><circle cx="36" cy="314" r="8" fill="${CREAM}"/>
      ${o.badge ? `<circle cx="-110" cy="300" r="26" fill="#fff"/><text x="-110" y="309" font-size="22" font-weight="700" text-anchor="middle" fill="${C.pink}" font-family="${DM}">GF</text>` : ''}
      ${o.armL === false ? '' : armP(-140, aL) + handP(aL, o.fistL)}${o.armR === false ? '' : armP(140, aR) + handP(aR, o.fistR)}
      <circle cx="-98" cy="10" r="19" fill="${skin}"/><circle cx="98" cy="10" r="19" fill="${skin}"/>
      <circle cx="-100" cy="38" r="7" fill="${C.gold}"/><circle cx="100" cy="38" r="7" fill="${C.gold}"/>
      <ellipse cx="0" cy="6" rx="96" ry="108" fill="${skin}"/>
      ${o.glow ? `<ellipse cx="0" cy="20" rx="96" ry="98" fill="${o.glow}" opacity="${o.glowOp || 0.18}"/>` : ''}
      <ellipse cx="-58" cy="44" rx="18" ry="10" fill="${C.pink}" opacity=".42"/><ellipse cx="58" cy="44" rx="18" ry="10" fill="${C.pink}" opacity=".42"/>
      <g stroke="${hair}" stroke-width="8" fill="none" stroke-linecap="round">${brow}</g>
      ${eyes}
      <path d="M-7,30 Q0,38 7,30" stroke="${skinD}" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${mouth}
      <path d="M-102,-26 C-104,-118 -40,-130 0,-128 C52,-130 106,-112 102,-26 C86,-66 46,-80 12,-72 C-18,-90 -70,-72 -102,-26 Z" fill="${hair}"/>
      ${lens(-40)}${lens(40)}
      <path d="M-4,-2 Q0,-10 4,-2" stroke="${o.frame || C.purple}" stroke-width="6" fill="none"/>
      <path d="M-76,0 L-94,-6 M76,0 L94,-6" stroke="${o.frame || C.purple}" stroke-width="6" stroke-linecap="round"/>
    </g></g>`;
  }

  /* ---------------- candles ---------------- */
  // A busy, endlessly scrolling chart (pure function of t): for the "lost" moment.
  const walk = i => Math.sin(i * 0.37) * 0.32 + Math.sin(i * 0.13 + 1) * 0.3 + Math.sin(i * 1.7) * 0.12 + (hash(i) - 0.5) * 0.18;
  function busyChart(t, x, y, w, h, o = {}) {
    const n = o.n || 24, step = w / n, off = t * (o.speed || 6) + (o.seed || 0);
    const i0 = Math.floor(off), fr = off - i0;
    const Y = v => y + h / 2 - v * h * 0.55;
    const up = o.up || '#3ED6A0', dn = o.dn || '#FF5D73';
    let s = '';
    for (let k = -1; k <= n + 1; k++) {
      const i = i0 + k, cx = x + (k - fr + 0.5) * step;
      if (cx < x - step || cx > x + w + step) continue;
      const a = walk(i - 1), b = walk(i), hi = Math.max(a, b) + hash(i * 3) * 0.12, lo = Math.min(a, b) - hash(i * 5) * 0.12;
      const col = b >= a ? up : dn;
      s += `<line x1="${f1(cx)}" x2="${f1(cx)}" y1="${f1(Y(hi))}" y2="${f1(Y(lo))}" stroke="${col}" stroke-width="${o.wick || 3}"/>
        <rect x="${f1(cx - step * 0.32)}" y="${f1(Y(Math.max(a, b)))}" width="${f1(step * 0.64)}" height="${f1(Math.max(2, Math.abs(Y(a) - Y(b))))}" fill="${col}"/>`;
    }
    if (o.lines) {
      [['#B9A8FF', 3, 0.0], [C.peach, 6, 0.08], ['#FFE066', 10, -0.1]].forEach(([col, sm, dv]) => {
        let d = '';
        for (let k = -1; k <= n + 1; k++) {
          const i = i0 + k, cx = x + (k - fr + 0.5) * step;
          let v = 0; for (let j = 0; j < sm; j++) v += walk(i - j); v = v / sm + dv;
          d += (d ? ' L' : 'M') + f1(cx) + ',' + f1(Y(v));
        }
        s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${o.lw || 4}" opacity=".85"/>`;
      });
    }
    return s;
  }

  // One chart candle in price space: grows from open to close over [at, at+d].
  function candle(t, cx, bw, Yf, c, colUp = C.teal, colDn = C.pink) {
    const p = ease((t - c.at) / c.d);
    if (p <= 0) return '';
    const cur = lerp(c.o, c.c, p), up = c.c >= c.o, col = up ? colUp : colDn;
    const hi = lerp(Math.max(c.o, cur), c.hi, p), lo = lerp(Math.min(c.o, cur), c.lo, p);
    return `<line x1="${f1(cx)}" x2="${f1(cx)}" y1="${f1(Yf(hi))}" y2="${f1(Yf(lo))}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
      <rect x="${f1(cx - bw / 2)}" y="${f1(Yf(Math.max(c.o, cur)))}" width="${f1(bw)}" height="${f1(Math.max(4, Math.abs(Yf(c.o) - Yf(cur))))}" rx="4" fill="${col}"/>`;
  }
  function makeCandles(spec, start) {
    let prev = start;
    return spec.map((c, i) => {
      const o = prev, hi = Math.max(o, c.c) + (c.hw ?? (0.3 + hash(i * 7 + 1) * 0.9)), lo = Math.min(o, c.c) - (c.lw ?? (0.3 + hash(i * 11 + 2) * 0.9));
      prev = c.c;
      return Object.assign({}, c, { o, hi: c.hi ?? hi, lo: c.lo ?? lo });
    });
  }

  /* ---------------- phone ---------------- */
  // Phone with a clipped screen; inner is drawn in screen-local coords (0..sw, 0..sh).
  function phone(x, y, w, h, inner, o = {}) {
    const b = 22, sw = w - b * 2, sh = h - b * 2, id = o.id || 'ph';
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(o.rot || 0)} ${w / 2} ${h / 2})">
      <rect x="-6" y="10" width="${w + 12}" height="${h}" rx="78" fill="${DARK}" opacity=".16"/>
      <rect width="${w}" height="${h}" rx="74" fill="${DARK}"/>
      <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="70" fill="none" stroke="#5A4036" stroke-width="3"/>
      <clipPath id="${id}"><rect x="${b}" y="${b}" width="${sw}" height="${sh}" rx="54"/></clipPath>
      <g clip-path="url(#${id})"><g transform="translate(${b},${b})">${inner(sw, sh)}</g></g>
      <rect x="${w / 2 - 70}" y="${b + 12}" width="140" height="34" rx="17" fill="${DARK}"/>
    </g>`;
  }

  // A hand (palm + fingers pointing left) on a hoodie sleeve, for swiping.
  function swipeHand(x, y, rot) {
    const skin = '#B07A55';
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})">
      <rect x="70" y="-46" width="260" height="96" rx="44" fill="${C.teal}"/><rect x="62" y="-50" width="40" height="104" rx="18" fill="${C.tealD}"/>
      <ellipse cx="34" cy="2" rx="58" ry="50" fill="${skin}"/>
      <rect x="-70" y="-40" width="104" height="26" rx="13" fill="${skin}"/>
      <rect x="-82" y="-12" width="116" height="26" rx="13" fill="${skin}"/>
      <rect x="-72" y="16" width="104" height="24" rx="12" fill="${skin}"/>
      <rect x="-44" y="40" width="80" height="22" rx="11" fill="${skin}"/>
      <ellipse cx="20" cy="-44" rx="38" ry="16" transform="rotate(-25 20 -44)" fill="${skin}"/>
    </g>`;
  }

  /* ================================================================== *
   * SHOTS
   * ================================================================== */

  // 1. 0:00–0:03  Pink splash, logo pop, "A Girl & Her Futures presents"
  function shot1(t) {
    let s = splash(t);
    s += spark(300, 640, 0.75, t, CREAM) + spark(690, 900, 0.95, t, C.peachL);
    s += popHead(t, 1.0, CX, 1110, 'A Girl &amp; Her Futures', 84, CREAM, { shadow: DARK });
    s += head(t, 1.45, CX, 1205, 'presents', 66, CREAM, { f: PF, w: 400, it: true, shadow: DARK });
    // underline flourish
    const u = ease(seg(t, 1.7, 2.3));
    if (u > 0) s += `<path d="M${f1(CX - 150 * u)},1240 Q${CX},1262 ${f1(CX + 150 * u)},1240" stroke="${C.peachL}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    return s;
  }

  // 2. 0:03–0:07  Night, laptop, busy candles, confused face, "?" marks
  const nightRoom = t => {
    let s = `<rect width="1080" height="1920" fill="url(#gNight)"/>`;
    // window with moon and stars
    s += `<rect x="40" y="680" width="300" height="400" rx="24" fill="#2B2350" stroke="#4A3B70" stroke-width="12"/>
      <circle cx="250" cy="780" r="50" fill="#FFF3D6"/><circle cx="272" cy="764" r="44" fill="#2B2350"/>
      <path d="M190,680 L190,1080 M40,880 L340,880" stroke="#4A3B70" stroke-width="10"/>`;
    for (let i = 0; i < 7; i++) s += star(70 + hash(i) * 240, 710 + hash(i + 20) * 340, 6 + hash(i + 4) * 6, '#FFF3D6', (0.4 + 0.6 * Math.abs(Math.sin(t * 2.4 + i))).toFixed(2));
    // fairy lights
    let d = 'M-20,600', bulbs = '';
    for (let i = 0; i <= 12; i++) {
      const x = -20 + i * 95, y = 600 + Math.sin(i * 1.3) * 10 + (i % 2) * 34;
      d += ` Q${x - 48},${y + 30} ${x},${y}`;
      const on = 0.45 + 0.55 * Math.abs(Math.sin(t * 3 + i * 1.7));
      const col = [C.pink, C.peach, C.teal, C.purpleL][i % 4];
      bulbs += `<circle cx="${x}" cy="${y + 14}" r="26" fill="${col}" opacity="${(on * 0.3).toFixed(2)}"/><circle cx="${x}" cy="${y + 14}" r="11" fill="${col}" opacity="${on.toFixed(2)}"/>`;
    }
    s += `<path d="${d}" stroke="#4A3B70" stroke-width="4" fill="none"/>${bulbs}`;
    return s;
  };
  function shot2(t) {
    const zoom = 1 + 0.42 * ease(seg(t, 4.5, 7.1));
    const fx = 500, fy = 1090;
    const reflect = (tt, ex) => `<rect x="-40" y="-40" width="80" height="80" fill="#15112A" opacity=".55"/>${busyChart(tt, -40, -30, 80, 60, { n: 9, speed: 7, seed: ex > 0 ? 5 : 0, wick: 2 })}`;
    let room = nightRoom(t);
    // student, behind the laptop, lit by the screen
    room += student(t, {
      x: fx, y: fy, s: 1.55, mood: 'confused', seed: 3, lookX: Math.sin(t * 3.4) * 5, lookY: 3,
      glow: '#9FE6DC', glowOp: 0.2, reflect, tilt: Math.sin(t * 1.3) * 3,
      armL: false, armR: false,
    });
    room += `<ellipse cx="500" cy="1330" rx="520" ry="260" fill="url(#gGlow)" opacity=".55"/>`;
    // laptop lid (back), foreground
    room += `<path d="M150,1330 L850,1330 L880,1920 L120,1920 Z" fill="#3A3150"/>
      <path d="M150,1330 L850,1330" stroke="#9FE6DC" stroke-width="8" stroke-linecap="round" opacity="${(0.6 + 0.4 * Math.sin(t * 9)).toFixed(2)}"/>
      ${heart(500, 1560, 2.4, C.pinkL, 0.9)}`;
    let s = `<g transform="translate(${fx},${fy}) scale(${zoom.toFixed(4)}) translate(${-fx},${-fy})">${room}</g>`;
    // question marks
    [[200, 900, 4.85, C.pink, -14], [790, 820, 5.3, C.peach, 12], [840, 1150, 5.75, C.teal, 18], [150, 1230, 6.2, CREAM, -20]].forEach(([x, y, at, col, r], i) => {
      const k = pop(t, at, 0.45);
      if (k <= 0) return;
      const wob = Math.sin(t * 5 + i) * 10, by = Math.sin(t * 3 + i) * 10;
      s += scaleAt(x, y + by, k, rotAt(x, y + by, r + wob, txt(x + 4, y + by + 46, '?', 150, DARK, { f: PF, w: 900, op: 0.25 }) + txt(x, y + by + 40, '?', 150, col, { f: PF, w: 900 })));
    });
    // POV of the screen: busy chart, then it shrinks into her glasses
    const k = ease(seg(t, 4.15, 4.75));
    if (k < 1) {
      const lensX = fx + (-40 * 1.55), lensY = fy + 2 * 1.55;
      const sc = 1 - 0.96 * k, shake = (1 - k) * Math.sin(t * 37) * 4;
      const ox = lerp(0, lensX, k), oy = lerp(0, lensY - 960 * sc, k);
      let pov = `<rect width="1080" height="1920" fill="#15112A"/>`;
      for (let i = 0; i < 9; i++) pov += `<line x1="0" x2="1080" y1="${500 + i * 120}" y2="${500 + i * 120}" stroke="#2A2445" stroke-width="2"/>`;
      pov += busyChart(t, 0, 560, 1080, 760, { n: 26, speed: 9, lines: true, lw: 5 });
      for (let i = 0; i < 40; i++) {
        const v = hash(i + Math.floor(t * 12)) * 0.6 + 0.2;
        pov += `<rect x="${i * 27}" y="${f1(1560 - v * 150)}" width="18" height="${f1(v * 150)}" fill="${hash(i * 3 + Math.floor(t * 12)) > 0.5 ? '#3ED6A0' : '#FF5D73'}" opacity=".55"/>`;
      }
      ['BUY?', 'SELL?', 'RSI 71', 'MACD ✕', 'BUY?', 'VWAP'].forEach((lb, i) => {
        const ph = (t * 2.2 + i * 0.37) % 1;
        if (ph > 0.6) return;
        pov += pill(120 + hash(i + 40) * 700, 640 + hash(i + 70) * 600, lb, i % 2 ? '#FF5D73' : '#3ED6A0', 1, 34, '#15112A');
      });
      pov += `<rect x="0" y="0" width="1080" height="560" fill="url(#gScrim)"/>`;
      s += `<g opacity="${(1 - seg(t, 4.45, 4.75)).toFixed(3)}" transform="translate(${f1(ox + shake)},${f1(oy)}) scale(${sc.toFixed(4)})">${pov}</g>`;
    }
    s += `<rect x="0" y="0" width="1080" height="${f1(560 * seg(t, 4.4, 4.8))}" fill="url(#gScrim)"/>`;
    s += head(t, 3.25, CX, 280, 'Ever stared at a chart', 84, CREAM);
    s += head(t, 3.6, CX, 385, `and felt <tspan fill="${C.pink}">lost?</tspan>`, 84, CREAM);
    return s;
  }

  // 3. 0:07–0:12  Phone of "signals" gets crossed out, swiped away, app closes
  const SPAM = [['🚀', 'GUARANTEED SIGNAL'], ['💯', '100% WIN RATE'], ['🚨', 'BUY NOW!!!'], ['🔥', 'VIP ALERT: ACT FAST'], ['⚡', "DON'T MISS OUT"], ['🚀', 'SECRET SIGNAL'], ['💯', 'NEVER LOSE']];
  function shot3(t) {
    const calm = seg(t, 9.6, 10.2);
    let s = creamMesh(t, '#FDE8ED');
    // alarm pulses behind the phone until the swipe
    if (t < 9.8) for (let j = 0; j < 3; j++) {
      const ph = (t * 1.6 + j / 3) % 1;
      s += `<circle cx="${CX}" cy="880" r="${f1(380 + ph * 520)}" fill="none" stroke="${C.pink}" stroke-width="${f1(14 * (1 - ph))}" opacity="${((1 - ph) * 0.5 * (1 - seg(t, 9.2, 9.8))).toFixed(3)}"/>`;
    }
    const PX = 180, PY = 440, PW = 620, PH = 880;
    const rot = Math.sin(t * 2) * 1.2 + (t < 9.4 ? Math.sin(t * 31) * 0.8 * (1 - seg(t, 8.8, 9.4)) : 0);
    s += phone(PX, PY, PW, PH, (sw, sh) => {
      let g = '';
      // home screen (revealed when the app closes)
      g += `<rect width="${sw}" height="${sh}" fill="url(#gHome)"/>`;
      g += txt(sw / 2, 150, '9:41', 92, CREAM, { f: DM, w: 700 });
      const icons = [C.teal, C.peach, C.purple, '#fff', C.purpleL, C.tealL, C.pinkL, C.peachL];
      icons.forEach((col, i) => {
        const k = pop(t, 9.9 + i * 0.05, 0.4);
        const ix = 76 + (i % 4) * 128, iy = 280 + Math.floor(i / 4) * 150;
        g += scaleAt(ix, iy, k, `<rect x="${ix - 48}" y="${iy - 48}" width="96" height="96" rx="26" fill="${col}"/>${i === 3 ? `<text x="${ix}" y="${iy + 12}" font-size="34" font-weight="700" text-anchor="middle" fill="${C.pink}" font-family="${DM}">GF</text>` : ''}`);
      });
      g += scaleAt(sw / 2, 640, pop(t, 10.3, 0.5), `<rect x="40" y="560" width="${sw - 80}" height="160" rx="36" fill="#fff" opacity=".9"/>
        ${txt(sw / 2, 630, 'Focus mode', 40, DARK, { w: 700 })}${txt(sw / 2, 685, 'No alerts. Just learning.', 28, C.muted, { w: 500 })}`);
      // the signal app
      const close = ease(seg(t, 9.5, 9.95));
      if (close < 1) {
        let app = `<rect width="${sw}" height="${sh}" fill="#241C38"/>`;
        const scroll = 230 * ease(seg(t, 7.3, 8.5)) + (t - 7) * 12;
        SPAM.forEach(([em, label], i) => {
          const k = pop(t, 7.05 + i * 0.13, 0.4);
          if (k <= 0) return;
          const cy = 250 + i * 152 - scroll;
          if (cy < 60) return;
          const flyT = seg(t, 8.95 + Math.abs(cy - 500) * 0.0005 + i * 0.03, 9.35 + i * 0.03);
          const fx = -sw * 1.3 * ease(flyT), fr = -16 * ease(flyT);
          const flash = Math.floor(t * 8 + i) % 2 ? '#FF5D73' : C.peach;
          const strike = ease(seg(t, 8.4 + i * 0.04, 8.62 + i * 0.04));
          const cardW = sw - 50;
          app += `<g transform="translate(${f1(fx)},0) rotate(${f1(fr)} ${sw / 2} ${f1(cy)})">` + scaleAt(sw / 2, cy, k, `
            <rect x="25" y="${f1(cy - 64)}" width="${cardW}" height="128" rx="28" fill="#fff" stroke="${flash}" stroke-width="7"/>
            <text x="62" y="${f1(cy + 20)}" font-size="54" font-family="Noto Color Emoji">${em}</text>
            ${txt(140, cy + 4, label, fitSize(label, 38, cardW - 150, DM, 700), DARK, { a: 'start', w: 700 })}
            ${txt(140, cy + 42, 'Tap to unlock', 24, C.muted, { a: 'start', w: 500 })}
            ${strike > 0 ? `<rect x="40" y="${f1(cy - 7)}" width="${f1((cardW - 30) * strike)}" height="14" rx="7" fill="${C.pink}"/>` : ''}`) + `</g>`;
        });
        app += `<rect width="${sw}" height="150" fill="#3A2C55"/>`;
        app += txt(40, 112, 'HOT ALERTS', 42, CREAM, { a: 'start', w: 700 });
        const bk = 1 + 0.12 * Math.abs(Math.sin(t * 9));
        const cnt = Math.min(99, Math.floor(seg(t, 7.0, 8.6) * 99) + 7);
        app += scaleAt(sw - 80, 96, bk, `<circle cx="${sw - 80}" cy="96" r="40" fill="#FF5D73"/>${txt(sw - 80, 108, cnt >= 99 ? '99+' : String(cnt), 30, '#fff', { w: 700 })}`);
        g += close > 0 ? scaleAt(sw / 2, sh / 2, 1 - 0.9 * close, app, 1 - close) : app;
      }
      return g;
    }, { id: 'ph3', rot });
    // crossed-out stamp on the phone
    const st = pop(t, 8.55, 0.4);
    if (st > 0 && t < 9.1) s += scaleAt(820, 520, st, cross(820, 520, 1, C.pink, 64));
    // swiping hand
    const sp = seg(t, 8.85, 9.45);
    if (sp > 0 && sp < 1) {
      const hx = lerp(1150, -120, ease(sp)), hy = 860 + Math.sin(sp * Math.PI) * -60;
      s += `<g transform="translate(${f1(hx)},${f1(hy)}) scale(1.5) translate(${f1(-hx)},${f1(-hy)})">${swipeHand(hx, hy, -8 + sp * 14)}</g>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${f1(hx + 260 + i * 40)}" y="${f1(hy - 60 + i * 36)}" width="${f1(160 - i * 20)}" height="8" rx="4" fill="${C.pink}" opacity="${(0.6 - i * 0.12).toFixed(2)}"/>`;
    }
    // headline after the swipe
    s += popHead(t, 9.55, CX, 250, 'No signals.', 104, DARK);
    s += popHead(t, 9.9, CX, 368, `No <tspan fill="${C.pink}">guesswork.</tspan>`, 104, DARK);
    s += spark(780, 300, 9.95, t, C.teal) + spark(200, 360, 10.25, t, C.peach);
    // calm-mode twinkles around phone
    if (calm > 0) for (let i = 0; i < 6; i++) {
      const a = t * 0.8 + i * 1.05;
      s += star(CX + Math.cos(a) * 420, 880 + Math.sin(a) * 470, 12 + 6 * Math.sin(t * 3 + i), [C.teal, C.peach, C.purple][i % 3], calm.toFixed(2), t * 60);
    }
    return s;
  }

  // 4. 0:12–0:16  "Learn to trade / with structure." + building-block staircase
  function shot4(t) {
    let s = creamMesh(t);
    let T = '';
    T += pill(CX, 360, 'NO HYPE. JUST A PLAN.', C.pink, pop(t, 12.25, 0.45), 38, '#fff', { ls: 2 });
    const L1 = 'Learn to trade', sz1 = fitSize(L1, 124, 860, PF, 900);
    const n = Math.floor(seg(t, 12.3, 13.35) * L1.length + 0.001);
    const w1 = measure(L1, sz1, PF, 900), x0 = CX - w1 / 2;
    const sub = L1.slice(0, n);
    T += txt(x0, 620, sub, sz1, C.pink, { f: PF, w: 900, a: 'start' });
    if (t < 13.9 && Math.floor(t * 4) % 2 === 0 || t < 13.4) {
      const cxp = x0 + measure(sub, sz1, PF, 900) + 8;
      T += `<rect x="${f1(cxp)}" y="${f1(620 - sz1 * 0.78)}" width="9" height="${f1(sz1 * 0.92)}" rx="4" fill="${DARK}" opacity="${t < 13.9 ? 1 : 0}"/>`;
    }
    const k2 = ease(seg(t, 13.5, 14.05));
    if (k2 > 0) {
      const L2 = 'with structure.', sz2 = fitSize(L2, 120, 860, PF, 900);
      T += `<g transform="translate(0,${f1((1 - k2) * 120)})" opacity="${k2.toFixed(3)}">${txt(CX, 770, L2, sz2, C.tealD, { f: PF, w: 900 })}</g>`;
      const u = ease(seg(t, 14.05, 14.6));
      const w2 = measure('structure.', sz2, PF, 900), xs = CX + measure(L2, sz2, PF, 900) / 2 - w2;
      if (u > 0) T += `<path d="M${f1(xs)},810 Q${f1(xs + w2 / 2)},${f1(828)} ${f1(xs + w2 * u)},806" stroke="${C.peach}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    }
    // staircase of blocks
    const base = 1320, cols = [C.pink, C.teal, C.peach, C.purple, C.pink], bw = 150;
    let tops = [];
    for (let i = 0; i < 5; i++) {
      const x = 115 + i * 160, hgt = 90 + i * 70, at = 12.35 + i * 0.22;
      const p = seg(t, at, at + 0.45), yOff = -900 * (1 - ease(p)) + (p >= 1 ? 0 : 0);
      const squash = p >= 1 ? 1 - 0.08 * Math.sin(clamp((t - at - 0.45) / 0.3) * Math.PI) : 1;
      tops.push([x + bw / 2, base - hgt]);
      if (p <= 0) continue;
      const by = base - hgt + yOff + Math.sin(t * 2 + i) * 2;
      s += `<g transform="translate(${x + bw / 2},${base}) scale(${(2 - squash).toFixed(3)},${squash.toFixed(3)}) translate(${-(x + bw / 2)},${-base})">
        <rect x="${x}" y="${f1(by)}" width="${bw}" height="${hgt}" rx="22" fill="${cols[i]}"/>
        <rect x="${x + 14}" y="${f1(by + 14)}" width="${bw - 28}" height="14" rx="7" fill="#fff" opacity=".35"/></g>`;
    }
    // zigzag structure line over the steps (higher highs, higher lows)
    const zk = ease(seg(t, 13.6, 15.0));
    if (zk > 0) {
      const pts = [];
      tops.forEach(([x, y], i) => { pts.push([x - 50, y - 16]); pts.push([x + 30, y - 72]); });
      let d = '', total = 0;
      const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      const all = segs.reduce((a, b) => a + b, 0) * zk;
      d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        if (total + segs[i - 1] <= all) { d += ` L${pts[i][0]},${pts[i][1]}`; total += segs[i - 1]; continue; }
        const f = (all - total) / segs[i - 1];
        d += ` L${f1(lerp(pts[i - 1][0], pts[i][0], f))},${f1(lerp(pts[i - 1][1], pts[i][1], f))}`;
        break;
      }
      s += `<path d="${d}" fill="none" stroke="${DARK}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>`;
      pts.forEach(([x, y], i) => {
        const at = 13.6 + 1.4 * (i / pts.length);
        if (t > at) s += `<circle cx="${x}" cy="${y}" r="${f1(12 * Math.min(1, back((t - at) / 0.3)))}" fill="${i % 2 ? C.teal : C.pink}" stroke="#fff" stroke-width="5"/>`;
      });
      const fk = pop(t, 15.05, 0.5), last = pts[pts.length - 1];
      if (fk > 0) s += scaleAt(last[0], last[1], fk, `<path d="M${last[0]},${last[1]} L${last[0]},${last[1] - 84}" stroke="${DARK}" stroke-width="7"/><path d="M${last[0]},${last[1] - 84} L${last[0] - 64 - Math.sin(t * 8) * 6},${last[1] - 66} L${last[0]},${last[1] - 48} Z" fill="${C.peach}"/>`);
      s += spark(last[0], last[1] - 80, 15.1, t, C.teal);
    }
    return s + T;
  }

  // 5. 0:16–0:26  The ICC Method™ on a 1-minute chart
  const ICC = (() => {
    const spec = [];
    [95.2, 94, 96.3, 95.4, 97.6, 96.6, 98.6, 97.9, 99.1].forEach((c, i) => spec.push({ c, at: 16.0 + i * 0.1, d: 0.14, hi: undefined, cap: 99.7 }));
    spec.push({ c: 104.4, at: 16.95, d: 0.22, tag: 'I1', hw: 0.5 });
    [[102.9], [101.5], [100.9, 99.9]].forEach(([c, lo], i) => spec.push({ c, at: 17.35 + i * 0.3, d: 0.26, lo, tag: i === 2 ? 'C1' : null }));
    [102.7, 104.9, 106.9, 109.1, 111.3].forEach((c, i) => spec.push({ c, at: 18.5 + i * 0.23, d: 0.2, tag: i === 4 ? 'K1' : null, hw: 0.4 }));
    [110.2, 111.0, 109.8, 110.9].forEach((c, i) => spec.push({ c, at: 21.0 + i * 0.2, d: 0.16, cap: 111.6 }));
    spec.push({ c: 114.6, at: 21.85, d: 0.2, tag: 'I2' });
    [[113.3], [112.6, 111.7]].forEach(([c, lo], i) => spec.push({ c, at: 22.2 + i * 0.28, d: 0.22, lo, tag: i === 1 ? 'C2' : null }));
    [114.2, 116.3, 118.2, 119.7].forEach((c, i) => spec.push({ c, at: 22.85 + i * 0.22, d: 0.18, tag: i === 3 ? 'K2' : null, hw: 0.4 }));
    [118.7, 119.5].forEach((c, i) => spec.push({ c, at: 23.8 + i * 0.2, d: 0.16, cap: 120.0 }));
    spec.push({ c: 123.0, at: 24.25, d: 0.2, tag: 'I3' });
    spec.push({ c: 121.3, at: 24.6, d: 0.22, lo: 120.2, tag: 'C3' });
    [123.4, 125.6].forEach((c, i) => spec.push({ c, at: 24.95 + i * 0.22, d: 0.18, tag: i === 1 ? 'K3' : null, hw: 0.4 }));
    const cs = makeCandles(spec, 95.5);
    cs.forEach(c => { if (c.cap) c.hi = Math.min(c.hi, c.cap); });
    const idx = tag => cs.findIndex(c => c.tag === tag);
    return { cs, idx };
  })();
  function shot5(t) {
    let s = creamMesh(t);
    s += popHead(t, 16.05, CX, 270, `The <tspan fill="${C.pink}">ICC</tspan> Method™`, 96, DARK);
    s += pill(CX, 350, '1-MINUTE CHART', PALE.teal, pop(t, 16.3, 0.4), 28, DK.teal, { ls: 2 });
    // chart card
    const X0 = 50, Y0 = 410, Wc = 880, Hc = 690;
    const ck = ease(seg(t, 16.0, 16.35));
    s += `<g opacity="${ck.toFixed(3)}"><rect x="${X0}" y="${Y0}" width="${Wc}" height="${Hc}" rx="40" fill="#fff" filter="url(#soft)"/></g>`;
    const px0 = X0 + 30, px1 = X0 + Wc - 30, py0 = Y0 + 40, py1 = Y0 + Hc - 40, pw = px1 - px0;
    const r0 = ease(seg(t, 20.9, 21.9)), r1 = ease(seg(t, 23.6, 24.4));
    const lo = lerp(lerp(92.5, 103, r0), 110, r1), hi = lerp(lerp(112.8, 121.5, r0), 127, r1);
    const Yf = v => py1 - (v - lo) / (hi - lo) * (py1 - py0);
    const step = 50, bw = 32;
    const cs = ICC.cs;
    let printed = 0;
    cs.forEach(c => { printed += clamp((t - c.at) / c.d); });
    const cam = Math.max(0, (printed + 1.5) * step - pw);
    const X = i => px0 + (i + 0.5) * step - cam;
    let g = '';
    for (let i = 1; i < 6; i++) g += `<line x1="${px0}" x2="${px1}" y1="${f1(py0 + i * (py1 - py0) / 6)}" y2="${f1(py0 + i * (py1 - py0) / 6)}" stroke="#F1E7E1" stroke-width="2"/>`;
    // levels
    [[100, 0, 16.05, C.purple], [111.4, ICC.idx('K1') - 1, 20.95, C.purple], [119.9, ICC.idx('K2') - 1, 23.75, C.purple]].forEach(([lv, from, at, col], li) => {
      const k = ease(seg(t, at, at + 0.45));
      if (k <= 0) return;
      const xa = X(from) - step * 0.5, xb = lerp(xa, px1 + 400, k);
      const flash = li === 0 ? Math.max(0, 1 - Math.abs(t - 17.2) / 0.35) : li === 1 ? Math.max(0, 1 - Math.abs(t - 22.05) / 0.3) : Math.max(0, 1 - Math.abs(t - 24.45) / 0.3);
      g += `<line x1="${f1(xa)}" x2="${f1(xb)}" y1="${f1(Yf(lv))}" y2="${f1(Yf(lv))}" stroke="${flash > 0 ? C.pink : col}" stroke-width="${f1(5 + flash * 6)}" stroke-dasharray="16 12" opacity=".9"/>`;
      const nextAt = [20.95, 23.75, 99][li];
      if (li === 0) g += fade(1 - seg(t, nextAt, nextAt + 0.3), pill(px1 - 70, Yf(lv) - 34, 'LEVEL', col, pop(t, at + 0.2, 0.4), 26, '#fff', { ls: 1 }));
    });
    cs.forEach((c, i) => { const x = X(i); if (x > px0 - step && x < px1 + step) g += candle(t, x, bw, Yf, c); });
    // ICC pins
    const PIN = { I: [C.pink, 'I'], C: [C.teal, 'C'], K: [C.peach, 'C'] };
    cs.forEach((c, i) => {
      if (!c.tag) return;
      const kind = c.tag[0], big = c.tag.endsWith('1');
      const at = c.at + c.d + 0.02, k = pop(t, at, 0.45);
      if (k <= 0) return;
      const [col, L] = PIN[kind], r = big ? 34 : 26;
      const x = X(i), below = kind === 'C';
      const y = below ? Yf(c.lo) + r + 18 : Yf(c.hi) - r - 18;
      g += scaleAt(x, y, k, `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/>${txt(x, y + r * 0.36, L, r * 1.05, '#fff', { f: PF, w: 900 })}`);
      if (big) g += spark(x, y, at, t, col);
      if (kind === 'I' && big) {
        const rk = seg(t, at, at + 0.6);
        if (rk > 0 && rk < 1) g += `<circle cx="${f1(x)}" cy="${f1(Yf(c.c))}" r="${f1(20 + rk * 70)}" fill="none" stroke="${C.pink}" stroke-width="${f1(8 * (1 - rk))}"/>`;
      }
    });
    // continuation arrow
    const ak = ease(seg(t, 18.55, 19.6));
    if (ak > 0 && t < 21.4) {
      const ia = ICC.idx('C1'), ib = ICC.idx('K1');
      const xa = X(ia) + 10, ya = Yf(101.5), xb = lerp(xa, X(ib) - 30, ak), yb = lerp(ya, Yf(110.5), ak);
      g += `<path d="M${f1(xa)},${f1(ya)} Q${f1((xa + xb) / 2 - 30)},${f1((ya + yb) / 2 + 20)} ${f1(xb)},${f1(yb)}" stroke="${C.peach}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="2 16" opacity="${(1 - seg(t, 20.9, 21.4)).toFixed(2)}"/>`;
    }
    s += `<clipPath id="plot"><rect x="${px0 - 10}" y="${Y0 + 6}" width="${pw + 20}" height="${Hc - 12}"/></clipPath><g clip-path="url(#plot)" opacity="${ck.toFixed(3)}">${g}</g>`;
    // the three cards
    const cards = [[C.pink, 'I', 'Indication', 17.18], [C.teal, 'C', 'Correction', 18.4], [C.peach, 'C', 'Continuation', 19.7]];
    const cycleIdx = ['I2', 'C2', 'K2', 'I3', 'C3', 'K3'].map(tg => { const c = ICC.cs[ICC.idx(tg)]; return c.at + c.d; });
    cards.forEach(([col, L, label, at], i) => {
      const k = pop(t, at, 0.5);
      if (k <= 0) return;
      const cx = 205 + i * 285, cy = 1225;
      let act = Math.max(0, 1 - Math.abs(t - at - 0.5) / 0.7);
      [cycleIdx[i], cycleIdx[i + 3]].forEach(ct => { act = Math.max(act, Math.max(0, 1 - Math.abs(t - ct - 0.2) / 0.35)); });
      if (t > 25.4) act = Math.max(act, 0.5 + 0.5 * Math.sin((t - 25.4) * 5 - i * 1.2));
      const lift = act * 14;
      const inner = `<rect x="${cx - 135}" y="${f1(cy - 95 - lift)}" width="270" height="190" rx="30" fill="#fff" stroke="${col}" stroke-width="${f1(4 + act * 4)}" filter="url(#soft)"/>
        <circle cx="${cx}" cy="${f1(cy - 34 - lift)}" r="40" fill="${col}"/>${txt(cx, cy - 34 - lift + 18, L, 50, '#fff', { f: PF, w: 900 })}
        ${txt(cx, cy + 50 - lift, label, fitSize(label, 36, 240, DM, 700), DARK, { w: 700 })}`;
      s += scaleAt(cx, cy, k * (1 + act * 0.04), inner);
    });
    s += spark(CX, 1225, 25.4, t, C.purple);
    return s;
  }

  // 6. 0:26–0:33  App montage: game round, level-up, weekly leaderboard; fist pump
  function shot6(t) {
    let s = creamMesh(t, '#FEF3E4');
    // rotating rays
    let rays = '';
    for (let i = 0; i < 16; i++) {
      const a = rad(i * 22.5 + t * 14);
      rays += `<path d="M640,880 L${f1(640 + Math.cos(a) * 1400)},${f1(880 + Math.sin(a) * 1400)} L${f1(640 + Math.cos(a + 0.12) * 1400)},${f1(880 + Math.sin(a + 0.12) * 1400)} Z" fill="${i % 2 ? '#FFFFFF' : '#FDE8ED'}" opacity=".55"/>`;
    }
    s += rays;
    s += popHead(t, 26.1, CX, 260, `Learn it. <tspan fill="${C.pink}">Play it.</tspan>`, 100, DARK);
    s += pill(CX, 365, '8 phases · 50+ lessons', C.purple, pop(t, 26.45, 0.45), 40, '#fff');

    const PX = 400, PY = 450, PW = 500, PH = 870;
    const scr = t < 28.3 ? 0 : t < 30.6 ? 1 : 2;
    const swT = [26, 28.3, 30.6][scr];
    const slide = 1 - ease(seg(t, swT, swT + 0.28));
    const rot = 3 + Math.sin(t * 2.2) * 1.5 - (scr === 0 ? 0 : slide * 6);
    const bounce = scr > 0 ? Math.sin(seg(t, swT, swT + 0.35) * Math.PI) * -26 : 0;
    s += `<g transform="translate(0,${f1(bounce)})">` + phone(PX, PY, PW, PH, (sw, sh) => {
      const screens = [screenGame, screenLevel, screenBoard];
      let g = '';
      if (scr > 0 && slide > 0) g += `<g transform="translate(${f1(-sw * (1 - slide))},0)">${screens[scr - 1](t, sw, sh)}</g>`;
      g += `<g transform="translate(${f1(sw * slide)},0)">${screens[scr](t, sw, sh)}</g>`;
      return g;
    }, { id: 'ph6', rot }) + '</g>';

    // GP coins flying out of the phone
    [[27.35, '+50 GP'], [29.25, '+120 GP'], [31.6, '+80 GP']].forEach(([at, lb], i) => {
      const p = seg(t, at, at + 1.1);
      if (p <= 0 || p >= 1) return;
      const x = lerp(640, 250 + i * 20, ease(p)), y = lerp(800, 640 + i * 30, ease(p)) - Math.sin(p * Math.PI) * 120;
      s += fade(1 - seg(p, 0.75, 1) * 1, scaleAt(x, y, back(p / 0.3), `<circle cx="${f1(x - 92)}" cy="${f1(y)}" r="34" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/>${txt(x - 92, y + 12, '★', 34, '#fff', { w: 700 })}${pill(x + 40, y, lb, C.gold, 1, 38, DARK)}`));
    });

    // the student cheering beside the phone
    const pump = t > 31.4 ? Math.abs(Math.sin((t - 31.4) * 7)) : 0;
    const pumpK = ease(seg(t, 31.3, 31.55));
    const sk = ease(seg(t, 26.2, 26.7));
    const sy = 1110 + (1 - sk) * 500;
    s += student(t, {
      x: 215, y: sy, s: 0.92, mood: 'happy', seed: 3, lookX: pumpK > 0 ? 0 : 7, lookY: 2, squint: pumpK > 0.5, badge: true,
      armL: false, armR: pumpK > 0, handR: pumpK > 0 ? [lerp(160, 190, pumpK), lerp(520, -70 - pump * 60, pumpK)] : [160, 520], fistR: pumpK > 0.3, bendR: pumpK > 0.3 ? 1 : -1,
    });
    if (pumpK > 0) {
      s += spark(390, 980, 31.5, t, C.peach) + spark(110, 900, 31.8, t, C.teal);
      s += A.bubble(170, 790, 'YES!', { size: 48, weight: 900, sc: pop(t, 31.45, 0.4), fill: C.pink, stroke: C.pink, color: '#fff', tail: 'right' });
    }
    return s;
  }
  function screenGame(t, sw, sh) {
    let g = `<rect width="${sw}" height="${sh}" fill="#FFFBF9"/><rect width="${sw}" height="150" fill="${C.pink}"/>`;
    g += txt(sw / 2, 112, 'GAME · ROUND 3', 34, '#fff', { w: 700, ls: 1 });
        g += txt(sw / 2, 215, 'Tap the Indication', 36, DARK, { w: 700 });
    // mini chart
    const lv = 470;
    g += `<line x1="20" x2="${sw - 20}" y1="${lv}" y2="${lv}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="12 9"/>`;
    const cs = [[560, 520], [520, 545], [545, 500], [500, 515], [515, 480], [480, 395], [395, 420], [420, 360]];
    const opts = { 2: 'A', 5: 'B', 7: 'C' };
    cs.forEach(([o, c], i) => {
      const x = 50 + i * 50, up = c < o, col = up ? C.teal : C.pink;
      g += `<line x1="${x}" x2="${x}" y1="${Math.min(o, c) - 14}" y2="${Math.max(o, c) + 14}" stroke="${col}" stroke-width="4"/><rect x="${x - 15}" y="${Math.min(o, c)}" width="30" height="${Math.abs(o - c)}" rx="4" fill="${col}"/>`;
    });
    const tap = 27.05, ok = t > tap + 0.1;
    Object.entries(opts).forEach(([i, L]) => {
      const x = 50 + i * 50, y = 640, right = L === 'B';
      const dim = ok && !right ? 0.35 : 1;
      const k = pop(t, 26.3 + i * 0.06, 0.4);
      g += fade(dim, scaleAt(x, y, k * (right && ok ? 1.15 : 1), `<circle cx="${x}" cy="${y}" r="38" fill="${right && ok ? C.teal : '#fff'}" stroke="${right && ok ? C.tealD : C.purple}" stroke-width="5"/>${txt(x, y + 13, L, 36, right && ok ? '#fff' : C.purple, { w: 700 })}`));
      g += `<line x1="${x}" x2="${x}" y1="${y - 40}" y2="560" stroke="${C.purpleL}" stroke-width="3" stroke-dasharray="4 6" opacity="${dim}"/>`;
    });
    // finger tap
    const fp = seg(t, 26.6, tap);
    if (t < tap + 0.6) {
      const fx = lerp(sw - 40, 50 + 5 * 50, ease(fp)), fy = lerp(sh - 60, 650, ease(fp));
      const rk = seg(t, tap, tap + 0.5);
      if (rk > 0 && rk < 1) g += `<circle cx="300" cy="640" r="${f1(30 + rk * 60)}" fill="none" stroke="${C.teal}" stroke-width="${f1(8 * (1 - rk))}"/>`;
      g += `<g opacity="${(1 - seg(t, tap + 0.3, tap + 0.6)).toFixed(2)}"><circle cx="${f1(fx)}" cy="${f1(fy + 20)}" r="30" fill="#B07A55"/><rect x="${f1(fx - 13)}" y="${f1(fy - 10)}" width="26" height="40" rx="13" fill="#B07A55"/></g>`;
    }
    g += pill(sw / 2, 750, 'Correct! ✓', C.teal, pop(t, tap + 0.15, 0.4), 40, '#fff');
    return g;
  }
  function screenLevel(t, sw, sh) {
    let g = `<rect width="${sw}" height="${sh}" fill="url(#gLv)"/>`;
    for (let i = 0; i < 12; i++) {
      const a = rad(i * 30 + t * 30);
      g += `<path d="M${sw / 2},330 L${f1(sw / 2 + Math.cos(a) * 700)},${f1(330 + Math.sin(a) * 700)} L${f1(sw / 2 + Math.cos(a + 0.18) * 700)},${f1(330 + Math.sin(a + 0.18) * 700)} Z" fill="#fff" opacity=".08"/>`;
    }
    const k = pop(t, 28.45, 0.6);
    const sr = Math.sin(t * 3) * 6;
    let starP = '';
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 62 : 140, a = rad(-90 + i * 36); starP += (i ? 'L' : 'M') + f1(sw / 2 + Math.cos(a) * r) + ',' + f1(330 + Math.sin(a) * r); }
    g += scaleAt(sw / 2, 330, k, rotAt(sw / 2, 330, sr, `<path d="${starP}Z" fill="${C.gold}" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>${txt(sw / 2, 362, '4', 96, '#fff', { f: PF, w: 900 })}`));
    g += scaleAt(sw / 2, 540, pop(t, 28.7, 0.5), txt(sw / 2, 560, 'LEVEL UP!', 64, '#fff', { f: PF, w: 900 }));
    const bar = ease(seg(t, 28.9, 29.9));
    g += `<rect x="50" y="630" width="${sw - 100}" height="34" rx="17" fill="#fff" opacity=".25"/><rect x="50" y="630" width="${f1((sw - 100) * (0.15 + 0.85 * bar))}" height="34" rx="17" fill="${C.peach}"/>`;
    g += txt(sw / 2, 720, 'Phase 2 unlocked', 32, '#fff', { w: 700, op: clamp((t - 29.6) / 0.3) });
    for (let i = 0; i < 26; i++) {
      const x = hash(i) * sw, y = ((t - 28.3) * (180 + hash(i + 3) * 160) + hash(i + 7) * 300) % (sh + 40) - 40;
      g += `<rect x="${f1(x)}" y="${f1(y)}" width="14" height="22" rx="3" fill="${[C.pink, C.teal, C.peach, '#fff'][i % 4]}" transform="rotate(${f1(t * 200 + i * 40)} ${f1(x + 7)} ${f1(y + 11)})"/>`;
    }
    return g;
  }
  function screenBoard(t, sw, sh) {
    let g = `<rect width="${sw}" height="${sh}" fill="#FFFBF9"/><rect width="${sw}" height="150" fill="${C.tealD}"/>`;
    g += txt(sw / 2, 108, 'WEEKLY LEADERBOARD', fitSize('WEEKLY LEADERBOARD', 32, sw - 60, DM, 700), '#fff', { w: 700, ls: 1 });
    const rows = [['Jada', 2480, C.purple, '#8E5A3C'], ['Mia', 2310, C.peach, '#E8B48C'], ['Amara', 2150, C.teal, '#6E4530'], ['Sofia', 1980, C.purpleL, '#F3CDB0'], ['You', 2200, C.pink, '#B07A55']];
    const climb = ease(seg(t, 31.0, 31.7));
    // "You" moves from slot 4 to slot 2 (0-based); Amara and Sofia shift down
    rows.forEach((r, i) => {
      let slot = i;
      if (r[0] === 'You') slot = lerp(4, 2, climb);
      else if (i === 2 || i === 3) slot = i + climb;
      const k = pop(t, 30.7 + i * 0.07, 0.4);
      const y = 180 + slot * 108, you = r[0] === 'You';
      g += scaleAt(sw / 2, y + 46, k, `<rect x="20" y="${f1(y)}" width="${sw - 40}" height="92" rx="24" fill="${you ? C.pink : '#fff'}" stroke="${you ? C.pink : '#F1E7E1'}" stroke-width="3"/>
        ${txt(60, y + 60, you ? String(Math.round(slot + 1)) : String(Math.round(slot + 1)), 34, you ? '#fff' : C.muted, { w: 700 })}
        <circle cx="122" cy="${f1(y + 46)}" r="28" fill="${r[3]}"/><circle cx="122" cy="${f1(y + 30)}" r="18" fill="${DARK}" opacity=".8"/>
        ${txt(168, y + 58, r[0], 32, you ? '#fff' : DARK, { a: 'start', w: 700 })}
        ${txt(sw - 44, y + 58, (you ? Math.round(lerp(1950, 2200, climb)) : r[1]) + ' GP', 30, you ? '#fff' : C.muted, { a: 'end', w: 700 })}`);
      if (i === 0) g += `<path d="M98,${y + 2} L104,${y - 18} L114,${y - 6} L122,${y - 24} L130,${y - 6} L140,${y - 18} L146,${y + 2} Z" fill="${C.gold}"/>`;
    });
    g += pill(sw / 2, 760, '▲ 2 spots this week', C.teal, pop(t, 31.75, 0.45), 32, '#fff');
    return g;
  }

  // 7. 0:33–0:38  Community feed + Share My Win, then a grid of traders at desks
  const AV = [['#8E5A3C', '#2C1810'], ['#E8B48C', '#C27A3A'], ['#F3CDB0', '#7A4A2A']];
  function avatar(x, y, r, skin, hair) {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${PALE.purple}"/><circle cx="${x}" cy="${y - r * 0.12}" r="${r * 0.62}" fill="${hair}"/><circle cx="${x}" cy="${y + r * 0.08}" r="${r * 0.5}" fill="${skin}"/><path d="M${x - r * 0.5},${y - r * 0.05} Q${x},${y - r * 0.75} ${x + r * 0.5},${y - r * 0.05} Q${x},${y - r * 0.4} ${x - r * 0.5},${y - r * 0.05}Z" fill="${hair}"/>`;
  }
  const LOOKS7 = [
    { skin: '#8E5A3C', hair: '#2C1810', hairStyle: 'puff', shirt: C.pink, pants: '#3D3550' },
    { skin: '#F3CDB0', hair: '#C27A3A', hairStyle: 'waves', shirt: C.teal, pants: '#4A5A78' },
    { skin: '#E8B48C', hair: '#2C1810', hairStyle: 'bun', shirt: C.peach, pants: '#5C4A6E' },
    { skin: '#6E4530', hair: '#1E120C', hairStyle: 'short', shirt: C.purple, pants: '#3D3550' },
    { skin: '#C68B62', hair: '#7A4A2A', hairStyle: 'waves', shirt: C.purpleL, pants: '#4A5A78' },
    { skin: '#F1C7A5', hair: '#E2B15C', hairStyle: 'bun', shirt: C.tealL, pants: '#5C4A6E' },
  ];
  function shot7(t) {
    let s = creamMesh(t, '#EEEDFE');
    const n = Math.round(300 * ease(seg(t, 33.05, 33.9)));
    s += popHead(t, 33.05, CX, 270, `<tspan fill="${C.pink}">${n}+</tspan> traders`, 112, DARK);
    s += head(t, 35.35, CX, 365, 'Every win counts,', 76, DARK);
    s += head(t, 35.6, CX, 450, `not just <tspan fill="${C.pink}">profit.</tspan>`, 76, DARK);

    const gridOn = seg(t, 35.3, 35.6);
    // feed panel
    if (gridOn < 1) {
      let f = '';
      const FX = 60, FY = 400, FW = 860, FH = 640;
      f += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" rx="40" fill="#2B2342" filter="url(#soft)"/>
        <rect x="${FX}" y="${FY}" width="104" height="${FH}" rx="40" fill="#221B36"/>`;
      [[C.pink, 'GF'], [C.teal, ''], [C.peach, ''], [C.purple, '']].forEach(([col, L], i) => {
        f += `<circle cx="${FX + 52}" cy="${FY + 70 + i * 96}" r="34" fill="${col}"/>${L ? txt(FX + 52, FY + 80 + i * 96, L, 26, '#fff', { w: 700 }) : ''}`;
      });
      f += txt(FX + 140, FY + 66, '# share-my-wins', 36, CREAM, { a: 'start', w: 700 });
      f += `<rect x="${FX + 130}" y="${FY + 96}" width="${FW - 160}" height="3" fill="#3E3460"/>`;
      const MSG = [['Jada', C.teal, 'Marked my first level today! 🎯', '💖 ', 12], ['Priya', C.peach, 'Followed my plan all week.', '🙌 ', 18], ['Sofia', C.pinkL, 'Skipped a messy setup. Still a win.', '✨ ', 9]];
      MSG.forEach(([name, col, msg, em, cnt], i) => {
        const at = 33.25 + i * 0.4, k = pop(t, at, 0.4);
        if (k <= 0) return;
        const y = FY + 120 + i * 170, x = FX + 140;
        const c = Math.round(cnt * ease(seg(t, at + 0.3, at + 1.4)));
        f += fade(clamp((t - at) / 0.2), `<g transform="translate(${f1((1 - k) * 60)},0)">${avatar(x + 34, y + 44, 34, AV[i][0], AV[i][1])}
          ${txt(x + 86, y + 34, name, 32, col, { a: 'start', w: 700 })}${txt(x + 86 + measure(name, 32, DM, 700) + 16, y + 34, 'today', 24, '#8D80B0', { a: 'start', w: 500 })}
          ${txt(x + 86, y + 82, msg, fitSize(msg, 36, FW - 250, DM, 500), CREAM, { a: 'start', w: 500 })}
          <rect x="${x + 86}" y="${y + 104}" width="116" height="46" rx="23" fill="#3E3460"/><text x="${x + 102}" y="${y + 136}" font-size="26" font-family="Noto Color Emoji">${em}</text>${txt(x + 184, y + 137, String(c), 28, CREAM, { a: 'end', w: 700 })}</g>`);
      });
      // Share My Win card
      const wk = pop(t, 34.45, 0.5);
      if (wk > 0) {
        const cy = 1185;
        f += scaleAt(CX, cy, wk, `<rect x="90" y="${cy - 120}" width="800" height="240" rx="36" fill="#fff" stroke="${C.pink}" stroke-width="6" filter="url(#soft)"/>
          <rect x="90" y="${cy - 120}" width="800" height="76" rx="36" fill="${C.pink}"/><rect x="90" y="${cy - 80}" width="800" height="36" fill="${C.pink}"/>
          <text x="130" y="${cy - 66}" font-size="38" font-family="Noto Color Emoji">🏆</text>${txt(190, cy - 68, 'SHARE MY WIN', 34, '#fff', { a: 'start', w: 700, ls: 2 })}
          ${txt(130, cy + 18, 'Journaled every trade this week', fitSize('Journaled every trade this week', 36, 720, DM, 700), DARK, { a: 'start', w: 700 })}
          ${pill(760, cy + 76, 'Share', C.teal, 1 + 0.05 * Math.sin(t * 8), 30, '#fff')}
          ${[0, 1, 2].map(i => heart(160 + i * 46, cy + 78, 1.1, [C.pink, C.peach, C.purple][i])).join('')}
          ${txt(310, cy + 88, '+24', 28, C.muted, { a: 'start', w: 700 })}`);
        f += spark(840, cy - 120, 34.6, t, C.peach) + spark(140, cy - 110, 34.75, t, C.teal);
        for (let i = 0; i < 5; i++) {
          const p = ((t - 34.6) * 0.9 + i * 0.2) % 1;
          if (t > 34.6) f += heart(800 + hash(i) * 80 + Math.sin(t * 3 + i) * 14, cy - 130 - p * 150, 1.2 + hash(i + 3) * 0.6, [C.pink, C.peach, C.teal][i % 3], (1 - p).toFixed(2));
        }
      }
      s += fade(1 - gridOn, `<g transform="translate(${f1(-gridOn * 200)},0)">${f}</g>`);
    }
    // grid of traders at desks
    if (t >= 35.3) {
      const cols = [PALE.pink, PALE.teal, PALE.peach, PALE.purple, '#FFF3F6', '#F0FAF8'];
      const tags = [['Plan followed ✓', C.teal], ['Level 3!', C.purple], null, ['Journaled', C.pink], null, ['First sim trade', C.peach]];
      for (let i = 0; i < 6; i++) {
        const cx = i % 2, ry = Math.floor(i / 2);
        const x = 60 + cx * 440, y = 500 + ry * 280, w = 420, h = 262;
        const k = pop(t, 35.3 + i * 0.09, 0.45);
        if (k <= 0) continue;
        const id = 'cell' + i;
        let c = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30"/></clipPath><g clip-path="url(#${id})">
          <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cols[i]}"/>`;
        // wall art / window
        c += i % 2 ? `<rect x="${x + 26}" y="${y + 26}" width="90" height="70" rx="10" fill="#fff" opacity=".8"/><circle cx="${x + 92}" cy="${y + 46}" r="12" fill="${C.peachL}"/>`
          : `<circle cx="${x + 70}" cy="${y + 70}" r="40" fill="#fff" opacity=".7"/>${heart(x + 70, y + 76, 1.2, C.pinkL)}`;
        // monitor
        const mx = cx ? x + 60 : x + w - 170;
        c += `<rect x="${mx}" y="${y + 92}" width="130" height="92" rx="12" fill="${DARK}"/><rect x="${mx + 8}" y="${y + 100}" width="114" height="76" rx="6" fill="#FFFBF9"/>`;
        for (let j = 0; j < 6; j++) {
          const up = (j + i) % 3 !== 0, hh = 12 + ((j * 7 + i * 3) % 4) * 8, yy = y + 160 - j * 7 - hh / 2 + Math.sin(t * 2 + j) * 2;
          c += `<rect x="${mx + 16 + j * 17}" y="${f1(yy)}" width="10" height="${hh}" rx="2" fill="${up ? C.teal : C.pink}"/>`;
        }
        c += `<rect x="${mx + 55}" y="${y + 184}" width="20" height="24" fill="${C.muted}"/>`;
        // person
        const pxp = cx ? x + w - 120 : x + 130, pyp = y + h + 40;
        const cheer = i === 1 || i === 4;
        const o = { x: pxp, y: pyp, scale: 0.78, look: LOOKS7[i], seed: i + 2, flip: cx === 1, talk: i === 0 || i === 3 ? Math.sin(t * 1.5 + i) > 0 : false,
          frontArm: cheer ? { a1: -70 + Math.sin(t * 8 + i) * 10, a2: -100 } : { a1: 40, a2: -10 + Math.sin(t * 9 + i) * 8 } };
        c += A.person(t, o);
        // desk
        c += `<rect x="${x}" y="${y + h - 52}" width="${w}" height="52" fill="#E9CDB4"/><rect x="${x}" y="${y + h - 52}" width="${w}" height="8" fill="#F5DCC6"/>`;
        c += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="none" stroke="#fff" stroke-width="6"/>`;
        if (tags[i]) c += pill(cx ? x + 110 : x + w - 120, y + 230, tags[i][0], tags[i][1], pop(t, 35.9 + i * 0.18, 0.4), 24, '#fff');
        s += scaleAt(x + w / 2, y + h / 2, k, c);
      }
      s += spark(270, 640, 36.0, t, C.pink) + spark(710, 920, 36.4, t, C.teal) + spark(270, 1200, 36.8, t, C.peach);
    }
    return s;
  }

  // 8. 0:38–0:42  Same student, daytime, calmly marking a level; check pops
  function shot8(t) {
    let s = creamMesh(t, '#E8F8F6');
    // window with sun and drifting clouds
    s += `<rect x="60" y="500" width="330" height="320" rx="24" fill="url(#gSky)" stroke="#fff" stroke-width="14"/>`;
    s += `<clipPath id="win8"><rect x="67" y="507" width="316" height="306" rx="18"/></clipPath><g clip-path="url(#win8)">
      <g transform="translate(300,590) rotate(${f1(t * 30)})">${Array.from({ length: 8 }, (_, i) => `<rect x="-5" y="-86" width="10" height="26" rx="5" fill="${C.gold}" transform="rotate(${i * 45})"/>`).join('')}</g>
      <circle cx="300" cy="590" r="46" fill="#FFD36B"/>
      ${[0, 1].map(i => { const x = 40 + ((t * 30 + i * 200) % 460) - 60, y = 690 + i * 60; return `<g transform="translate(${f1(x)},${y}) scale(.7)"><ellipse rx="70" ry="28" fill="#fff"/><ellipse cx="-38" cy="8" rx="40" ry="22" fill="#fff"/><ellipse cx="40" cy="6" rx="44" ry="24" fill="#fff"/><ellipse cx="4" cy="-18" rx="40" ry="28" fill="#fff"/></g>`; }).join('')}
    </g><path d="M225,500 L225,820 M60,660 L390,660" stroke="#fff" stroke-width="10"/>`;
    s += head(t, 38.15, CX, 260, `She's brand <tspan fill="${C.pink}">new.</tspan>`, 100, DARK);
    s += head(t, 39.45, CX, 362, "That's exactly", 78, C.tealD);
    s += head(t, 39.65, CX, 446, 'where we start.', 78, C.tealD);

    // student (calm, then a happy beat at the check)
    const happy = t > 40.05 && t < 41.3;
    const mouseX = 560 + Math.sin(seg(t, 38.6, 39.7) * Math.PI) * 30 + ease(seg(t, 38.6, 39.7)) * 30;
    s += student(t, {
      x: 235, y: 905, s: 0.9, mood: happy ? 'happy' : 'calm', seed: 3, lookX: 8, lookY: 2, badge: true,
      handL: [-150, 560], handR: [(mouseX - 235) / 0.9 - 10, (1180 - 905) / 0.9],
    });
    // monitor
    const MX = 450, MY = 520, MW = 470, MH = 400;
    s += `<rect x="${MX + MW / 2 - 18}" y="${MY + MH}" width="36" height="${1160 - MY - MH}" fill="${C.muted}"/><rect x="${MX + MW / 2 - 90}" y="1148" width="180" height="16" rx="8" fill="${C.muted}"/>`;
    s += `<rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="26" fill="${DARK}" filter="url(#soft)"/><rect x="${MX + 16}" y="${MY + 16}" width="${MW - 32}" height="${MH - 32}" rx="14" fill="#FFFBF9"/>`;
    const lvY = 770;
    const cs = [[690, 720], [720, 700], [700, 745], [745, 768], [768, 735], [735, 700], [700, 740], [740, 768], [768, 720], [720, 690]];
    cs.forEach(([o, c], i) => {
      const x = MX + 50 + i * 38, up = c < o, col = up ? C.teal : C.pink;
      const at = i < 8 ? 37.9 : 40.3 + (i - 8) * 0.35;
      const p = ease((t - at) / 0.3);
      if (p <= 0) return;
      const cc = lerp(o, c, p);
      s += `<line x1="${x}" x2="${x}" y1="${Math.min(o, cc) - 12}" y2="${Math.max(o, cc) + (i === 3 || i === 7 ? 2 : 10)}" stroke="${col}" stroke-width="4"/><rect x="${x - 12}" y="${Math.min(o, cc)}" width="24" height="${Math.max(3, Math.abs(o - cc))}" rx="3" fill="${col}"/>`;
    });
    s += txt(MX + 40, MY + 64, 'MNQ · 1m', 26, C.muted, { a: 'start', w: 700 });
    // level line drawn by the cursor
    const lk = ease(seg(t, 38.65, 39.7));
    const lx0 = MX + 34, lx1 = lerp(lx0, MX + MW - 34, lk);
    if (lk > 0) s += `<line x1="${lx0}" x2="${f1(lx1)}" y1="${lvY + 12}" y2="${lvY + 12}" stroke="${C.purple}" stroke-width="7" stroke-dasharray="18 10" stroke-linecap="round"/>`;
    if (t > 38.5 && t < 40.1) s += `<path transform="translate(${f1(lk > 0 ? lx1 : lx0)},${lvY + 12})" d="M0,0 L0,40 L11,30 L19,48 L27,44 L19,27 L34,26 Z" fill="#fff" stroke="${DARK}" stroke-width="4" stroke-linejoin="round"/>`;
    s += pill(MX + 120, lvY + 58, 'MY LEVEL', C.purple, pop(t, 39.75, 0.4), 24, '#fff', { ls: 1 });
    s += check(MX + MW - 60, lvY - 60, pop(t, 39.95, 0.45), C.teal, 40);
    s += spark(MX + MW - 60, lvY - 60, 40.0, t, C.teal) + spark(MX + MW - 110, lvY + 10, 41.0, t, C.peach);
    // desk, mug, mouse
    s += `<rect x="0" y="1160" width="1080" height="760" fill="#E9CDB4"/><rect x="0" y="1160" width="1080" height="16" fill="#F5DCC6"/>`;
    s += `<ellipse cx="${f1(mouseX)}" cy="1196" rx="40" ry="24" fill="#fff" stroke="#D9C3B0" stroke-width="4"/>`;
    s += `<circle cx="${f1(mouseX - 6)}" cy="1188" r="32" fill="#B07A55"/><rect x="${f1(mouseX - 90)}" y="1160" width="90" height="56" rx="26" fill="${C.teal}"/>`;
    s += `<rect x="790" y="1090" width="90" height="100" rx="16" fill="${C.pink}"/><path d="M880,1110 Q920,1120 880,1160" stroke="${C.pink}" stroke-width="12" fill="none"/>${heart(835, 1145, 0.9, '#fff', 0.8)}`;
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.7 + i / 3) % 1;
      s += `<path d="M${815 + i * 20},${1080 - p * 120} q12,-16 0,-32 q-12,-16 0,-32" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="${((1 - p) * 0.8).toFixed(2)}"/>`;
    }
    return s;
  }

  // 9. 0:42–0:48  End card
  function shot9(t) {
    const tt = t - 42;
    let s = splash(tt + 1.5);
    s += popHead(t, 42.55, CX, 790, 'A Girl &amp; Her', 104, CREAM, { shadow: DARK });
    s += popHead(t, 42.7, CX, 895, 'Futures™', 104, CREAM, { shadow: DARK });
    const pk = pop(t, 43.6, 0.5);
    if (pk > 0) {
      const tw = measure('Start for $14.99/mo', 68, PF, 900) + 90;
      s += scaleAt(CX, 1010, pk, `<rect x="${f1(CX - tw / 2)}" y="955" width="${f1(tw)}" height="118" rx="30" fill="${CREAM}" filter="url(#soft)"/>
        ${txt(CX, 1036, `Start for <tspan fill="${C.pink}">$14.99</tspan>/mo`, 68, DARK, { f: PF, w: 900 })}`);
    }
    s += head(t, 43.95, CX, 1140, 'Cancel anytime', 46, CREAM, { f: DM, w: 700 });
    const bk = pop(t, 45.2, 0.55);
    if (bk > 0) {
      const pulse = 1 + 0.05 * Math.sin((t - 45.2) * 6.5);
      const bw = 520, by = 1240;
      const sh = ((t - 45.2) * 0.8) % 1.4;
      s += scaleAt(CX, by, bk * pulse, `<rect x="${CX - bw / 2 - 10}" y="${by - 62}" width="${bw + 20}" height="124" rx="62" fill="${CREAM}" opacity="${(0.35 * (0.5 + 0.5 * Math.sin((t - 45.2) * 6.5))).toFixed(2)}"/>
        <rect x="${CX - bw / 2}" y="${by - 52}" width="${bw}" height="104" rx="52" fill="${DARK}"/>
        <clipPath id="btn9"><rect x="${CX - bw / 2}" y="${by - 52}" width="${bw}" height="104" rx="52"/></clipPath>
        <g clip-path="url(#btn9)"><rect x="${f1(CX - bw / 2 - 160 + sh * 600)}" y="${by - 52}" width="120" height="104" fill="url(#gShine)" transform="skewX(-20)"/></g>
        ${txt(CX - 20, by + 18, 'Link in bio', 52, CREAM, { w: 700 })}
        <path d="M${CX + 150},${by - 14 + Math.sin(t * 7) * 6} l18,18 l18,-18" stroke="${C.peach}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    s += head(t, 44.2, CX, 1502, 'Trading involves risk.', 34, CREAM, { f: DM, w: 500 });
    s += spark(860, 760, 42.9, t, CREAM) + spark(140, 900, 43.2, t, C.peachL) + spark(CX, 1240, 45.5, t, C.peachL);
    return s;
  }

  /* ---------------- timeline ---------------- */
  const SHOTS = [
    { a: 0, b: 3, draw: shot1 },
    { a: 3, b: 7, draw: shot2, tr: 'circle', at: [490, 760] },
    { a: 7, b: 12, draw: shot3, tr: 'wipeL', band: C.pink },
    { a: 12, b: 16, draw: shot4, tr: 'zoom' },
    { a: 16, b: 26, draw: shot5, tr: 'wipeUp', band: C.teal },
    { a: 26, b: 33, draw: shot6, tr: 'circle', at: [640, 880] },
    { a: 33, b: 38, draw: shot7, tr: 'wipeL', band: C.purple },
    { a: 38, b: 42, draw: shot8, tr: 'wipeUp', band: C.peach },
    { a: 42, b: 48, draw: shot9, tr: 'circle', at: [490, 960] },
  ];
  const TR = 0.42;
  function draw(t) {
    let i = SHOTS.length - 1;
    while (i > 0 && t < SHOTS[i].a) i--;
    const S = SHOTS[i];
    let body;
    const p = (t - S.a) / TR;
    if (i > 0 && p < 1) {
      const k = ease(p), prev = SHOTS[i - 1].draw(t);
      let clip = '', extra = '', wrapOpen = '', wrapClose = '';
      if (S.tr === 'circle') {
        clip = `<circle cx="${S.at[0]}" cy="${S.at[1]}" r="${f1(k * 2300)}"/>`;
        extra = `<circle cx="${S.at[0]}" cy="${S.at[1]}" r="${f1(k * 2300)}" fill="none" stroke="${CREAM}" stroke-width="${f1(30 * (1 - k))}"/>`;
      } else if (S.tr === 'wipeL') {
        const x = 1080 * (1 - k);
        clip = `<rect x="${f1(x)}" y="0" width="1200" height="1920"/>`;
        extra = `<rect x="${f1(x - 46)}" y="0" width="46" height="1920" fill="${S.band}"/><rect x="${f1(x - 74)}" y="0" width="16" height="1920" fill="${CREAM}" opacity=".8"/>`;
      } else if (S.tr === 'wipeUp') {
        const y = 1920 * (1 - k);
        clip = `<rect x="0" y="${f1(y)}" width="1080" height="2000"/>`;
        extra = `<rect x="0" y="${f1(y - 46)}" width="1080" height="46" fill="${S.band}"/><rect x="0" y="${f1(y - 74)}" width="1080" height="16" fill="${CREAM}" opacity=".8"/>`;
      } else {
        clip = `<rect x="0" y="0" width="1080" height="1920"/>`;
        const sc = 1.25 - 0.25 * k;
        wrapOpen = `<g opacity="${k.toFixed(3)}" transform="translate(540,960) scale(${sc.toFixed(4)}) translate(-540,-960)">`; wrapClose = '</g>';
        extra = `<rect width="1080" height="1920" fill="#fff" opacity="${(0.7 * (1 - k)).toFixed(3)}"/>`;
      }
      body = prev + `<clipPath id="trc">${clip}</clipPath><g clip-path="url(#trc)">${wrapOpen}${S.draw(t)}${wrapClose}</g>` + extra;
    } else body = S.draw(t);
    return DEFS + body;
  }

  // Logo layer (drawn as an <img> by tiktok.html).
  function logo(t) {
    if (t < 3.2) {
      const k = pop(t, 0.35, 0.7), out = 1 - ease(seg(t, 2.85, 3.1));
      return { x: 490, y: 740, size: 400 * k * (1 + 0.02 * Math.sin(t * 3)) * (1 - 0.3 * (1 - out)), op: clamp((t - 0.35) / 0.2) * out, rot: (1 - clamp(k)) * -20 + Math.sin(t * 2) * 2 };
    }
    if (t >= 42.15) {
      const k = pop(t, 42.2, 0.7);
      return { x: 490, y: 470, size: 380 * k * (1 + 0.025 * Math.sin(t * 2.6)), op: clamp((t - 42.2) / 0.2), rot: (1 - clamp(k)) * 20 + Math.sin(t * 1.8) * 2 };
    }
    return null;
  }

  // Caption bottom edge (y) for the band; lifted on the end card to clear the disclaimer.
  const capBottom = t => (t >= 42 ? 1440 : 1490);

  const CAPTIONS = [
    { at: 0.25, end: 2.9, text: 'A Girl & Her Futures presents.' },
    { at: 3.1, end: 4.75, text: 'Ever stared at a chart' },
    { at: 4.8, end: 6.9, text: 'with no idea what it *means?' },
    { at: 7.1, end: 8.9, text: 'Skip the *signals.' },
    { at: 8.95, end: 11.9, text: 'Skip the *guesswork.' },
    { at: 12.1, end: 15.9, text: 'Learn to trade with *structure.' },
    { at: 16.1, end: 17.1, text: 'One method.' },
    { at: 17.15, end: 18.35, text: '*Indication.' },
    { at: 18.4, end: 19.65, text: '*Correction.' },
    { at: 19.7, end: 21.0, text: '*Continuation.' },
    { at: 21.1, end: 23.0, text: 'Every trade you learn' },
    { at: 23.05, end: 25.9, text: 'lives *inside it.' },
    { at: 26.1, end: 27.7, text: 'Learn it through *games,' },
    { at: 27.75, end: 29.3, text: '*levels and *lessons,' },
    { at: 29.35, end: 32.9, text: 'before you risk a single dollar.' },
    { at: 33.1, end: 34.7, text: 'Join *300+ traders' },
    { at: 34.75, end: 36.3, text: 'who’ve been *exactly' },
    { at: 36.35, end: 37.9, text: 'where you are.' },
    { at: 38.1, end: 39.4, text: 'Brand *new?' },
    { at: 39.45, end: 41.9, text: 'That’s exactly where we start.' },
    { at: 42.1, end: 43.55, text: 'A Girl & Her Futures.' },
    { at: 43.6, end: 45.15, text: 'Start for *$14.99 a month.' },
    { at: 45.2, end: 48.1, text: 'Link in *bio.' },
  ];

  window.TT = { DURATION: 48, draw, logo, capBottom, CAPTIONS, SHOTS };
})();
