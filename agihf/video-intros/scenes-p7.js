/**
 * scenes-p7.js: Phase 7 psychology videos. The chart isn't the lesson anymore, she is.
 * Every scene is its own place and mood, drawn on the 1920x1080 stage as a pure
 * function of t. Beat times come from the narration (s.at[i] = start of line i).
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
    /* ── 1 · after hours: why the hell did I do that? ─────────────────── */
    'p7-afterhours': (s, t) => {
      const T = s.at;
      let o = grad('ahbg', '#141026', '#2A1D3D') + bg('url(#ahbg)');
      // window + moon
      o += `<rect x="1380" y="120" width="380" height="420" rx="18" fill="#1E1834" stroke="#3A2F55" stroke-width="10"/><circle cx="1600" cy="250" r="56" fill="#F6E7C8" opacity=".9"/><circle cx="1625" cy="235" r="56" fill="#1E1834"/>`;
      for (let i = 0; i < 18; i++) o += `<circle cx="${1400 + (i * 97) % 340}" cy="${150 + (i * 53) % 360}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i))}"/>`;
      // desk + laptop glow
      o += `<rect x="260" y="760" width="1160" height="40" rx="12" fill="#3A2A2A"/><rect x="320" y="800" width="30" height="280" fill="#2C1F1F"/><rect x="1330" y="800" width="30" height="280" fill="#2C1F1F"/>`;
      o += `<ellipse cx="830" cy="560" rx="560" ry="300" fill="#7F77DD" opacity="${0.10 + 0.04 * Math.sin(t * 2)}"/>`;
      o += `<path d="M560,760 L1100,760 L1140,780 L520,780 Z" fill="#4A3F5E"/><rect x="590" y="430" width="480" height="330" rx="16" fill="#0F0B18" stroke="#4A3F5E" stroke-width="8"/>`;
      // screen: P&L and a messy day
      const day = vals(7, 26, -0.012, 0.07, 0.75);
      o += candles(610, 520, 440, 200, day, Math.floor(seg(t, s.start, T[0] + 3) * 26) + 1);
      o += txt(830, 494, '−$740.00', 42, '#FF8DA3', { f: 'JetBrains Mono, monospace' });
      o += txt(660, 470, 'TODAY', 16, '#8C83C9', { a: 'start', ls: 3 });
      // you, slumped
      o += you(t, { x: 460, y: 1060, scale: 1.25, flip: false, mood: 'sad', frontArm: { a1: -30 + Math.sin(t) * 2, a2: -100 } });
      // the thought
      o += thought(1040, 300, 'why the hell did I do that?', between(t, T[0] + 1.2, T[1] - 0.2), { size: 50 });
      // you knew: three notes on the monitor
      const notes = [['wait for confirmation', T[2]], ['stop goes HERE', T[3]], ['2 trades. max.', T[4]]];
      notes.forEach(([n, at], i) => {
        const fall = seg(t, T[5] + 0.8 + i * 0.25, T[5] + 2.2 + i * 0.25);
        const k = pop(t, at, 0.5);
        if (k <= 0) return;
        const x = 470 + i * 380, y = 250 + fall * 900, rot = -6 + i * 6 + fall * 50;
        o += sticky(x, y, n, k, rot);
        o += fall < 0.05 ? pill(x + 110, y - 70, 'YOU KNEW', '#2AA594', pop(t, at + 0.5, 0.4), 22) : '';
      });
      o += fade(seg(t, T[5] + 1.6, T[5] + 2.4) * (1 - seg(t, T[6] + 2.5, T[6] + 3)), txt(960, 180, 'and did something completely different.', 54, '#fff', { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    /* ── 2 · two skills ───────────────────────────────────────────────── */
    'p7-two-skills': (s, t) => {
      const T = s.at;
      let o = bg('#FDF8F5') + `<rect x="960" width="960" height="1080" fill="#241B33"/>`;
      const k1 = pop(t, T[0] + 0.6), k2 = pop(t, T[0] + 3.2);
      o += scaleAt(480, 520, k1, `<rect x="230" y="300" width="500" height="440" rx="36" fill="#fff" stroke="#EADFD8" stroke-width="6"/>${candles(270, 360, 420, 220, vals(3, 14, 0.02, 0.05, 0.25), 14)}${txt(480, 680, 'LEARNING HOW TO TRADE', 34, C.dark, { ls: 2 })}`);
      const shake = t > T[0] + 4 ? Math.sin(t * 22) * 4 * (1 - seg(t, T[0] + 4, T[0] + 8)) : 0;
      o += scaleAt(1440, 520, k2, `<g transform="translate(${f1(shake)},0)"><rect x="1190" y="300" width="500" height="440" rx="36" fill="#33284A" stroke="#4A3F5E" stroke-width="6"/>${heart(1440, 470, 1 + 0.12 * Math.abs(Math.sin(t * 5)))}${txt(1440, 640, 'MANAGING YOURSELF', 34, '#fff', { ls: 2 })}${txt(1440, 690, 'WHILE YOU’RE TRADING', 30, '#CFC8FA', { ls: 2, w: 700 })}</g>`);
      o += pill(960, 880, 'two completely different skills', C.purple, pop(t, T[0] + 5.5), 36);
      return o;
    },

    /* ── 3 · the knowledge tower meets real money ─────────────────────── */
    'p7-tower': (s, t) => {
      const T = s.at;
      let o = bg('#FBF1E7');
      const blocks = [['MARKET STRUCTURE', C.teal], ['LIQUIDITY', C.purple], ['HIGHER TIMEFRAMES', C.peach], ['YOUR SETUP', C.pink]];
      const per = (T[1] - T[0]) / 4.2;
      const coin = seg(t, T[1] + 1.2, T[1] + 2.2), landed = t > T[1] + 2.2;
      const wob = landed ? Math.sin((t - T[1]) * 9) * 7 * (1 - seg(t, T[1] + 2.2, T[1] + 5)) : 0;
      let tower = '';
      blocks.forEach(([n, col], i) => {
        const at = T[0] + 0.4 + i * per, k = ease(seg(t, at, at + 0.6));
        if (k <= 0) return;
        const y = 900 - i * 130 - (1 - k) * 500;
        tower += `<g opacity="${k}"><rect x="610" y="${f1(y - 110)}" width="700" height="110" rx="20" fill="${col}"/>${txt(960, y - 42, n, 38, '#fff', { ls: 2 })}</g>`;
        tower += check(1360, y - 55, pop(t, at + 0.5), '#2AA594', 26);
      });
      o += `<g transform="rotate(${f1(wob)} 960 900)">${tower}</g>`;
      o += `<rect x="560" y="900" width="800" height="20" rx="10" fill="#E5D3C5"/>`;
      if (t > T[1] + 1.2) {
        const cy = landed ? 330 : lerp(-120, 330, ease(coin));
        o += `<g transform="translate(960,${f1(cy)})"><circle r="78" fill="${C.gold}"/><circle r="60" fill="none" stroke="#C98A1F" stroke-width="6"/>${txt(0, 18, '$', 60, '#7A4E0F')}</g>${txt(960, 210, 'REAL MONEY', 34, C.dark, { op: clamp(coin * 2), ls: 4 })}`;
      }
      // heartbeat across the screen
      if (t > T[1] + 2.4) {
        const p = seg(t, T[1] + 2.4, T[1] + 4.6);
        const pts = []; for (let x = 0; x <= 1920 * p; x += 20) { const ph = (x % 480) / 480; const y = ph > 0.4 && ph < 0.46 ? -160 : ph > 0.46 && ph < 0.52 ? 120 : 0; pts.push(`${x},${980 + y * 0.6}`); }
        o += `<polyline points="${pts.join(' ')}" fill="none" stroke="#E2556F" stroke-width="8" stroke-linejoin="round"/>`;
        o += pill(960, 1030, 'now emotions get involved', '#E2556F', pop(t, T[1] + 3.2), 30);
      }
      return o;
    },

    /* ── 4 · four moments, four different rooms ───────────────────────── */
    'p7-moments': (s, t) => {
      const T = s.at, n = T.length;
      let i = 0; for (let j = 0; j < n; j++) if (t >= T[j] - 0.3) i = j;
      const t0 = T[i], tEnd = i < n - 1 ? T[i + 1] - 0.3 : s.end, k = seg(t, t0 - 0.3, t0 + 0.3) * (1 - seg(t, tEnd - 0.3, tEnd));
      const lt = t - t0;
      let o = '';
      if (i === 0) { // the loss → I want it back
        o += grad('m1', '#3A1420', '#6B2233') + bg('url(#m1)');
        const v = vals(11, 18, -0.025, 0.04, 0.85);
        o += `<rect x="260" y="200" width="900" height="560" rx="30" fill="#1D0B12" opacity=".8"/>` + candles(290, 260, 840, 440, v, Math.floor(seg(lt, 0, 2.5) * 18) + 1, { dn: '#FF6F8A' });
        o += txt(710, 860, '−1R', 90, '#FF8DA3', { f: 'JetBrains Mono, monospace', op: clamp(lt - 1.6) });
        o += you(t, { x: 1480, y: 1040, scale: 1.3, flip: true, mood: 'sad', frontArm: { a1: -150 + Math.sin(t * 8) * 6, a2: -160 } });
        o += thought(1480, 260, 'I want it back.', pop(t, t0 + 2.3), { size: 50 });
      } else if (i === 1) { // missed entry → watching it run
        o += grad('m2', '#2B2752', '#5B4E9A') + bg('url(#m2)');
        const p = seg(lt, 0.4, 4);
        const pts = []; for (let x = 0; x <= p * 1500; x += 30) pts.push(`${200 + x},${f1(820 - Math.pow(x / 1500, 2.2) * 640 + Math.sin(x / 40) * 14)}`);
        o += `<polyline points="${pts.join(' ')}" fill="none" stroke="#7ECFC0" stroke-width="12" stroke-linecap="round"/>`;
        if (p > 0.05) { const lx = 200 + p * 1500, ly = 820 - Math.pow(p, 2.2) * 640; o += `<circle cx="${f1(lx)}" cy="${f1(ly)}" r="18" fill="#7ECFC0"/>` + txt(lx - 10, ly - 40, `+${Math.round(p * 70)} pts`, 40, '#fff', { f: 'JetBrains Mono, monospace' }); }
        o += `<line x1="200" x2="1700" y1="820" y2="820" stroke="#E2B04A" stroke-width="4" stroke-dasharray="14 12"/>` + txt(250, 800, 'your entry', 28, '#E2B04A', { a: 'start', w: 700 });
        o += you(t, { x: 360, y: 1060, scale: 1.05, mood: 'sad' });
        o += thought(640, 330, '…without me.', pop(t, t0 + 2.6), { size: 44 });
      } else if (i === 2) { // +$500 → not enough
        o += grad('m3', '#FFF4DE', '#F9D89A') + bg('url(#m3)');
        const amt = Math.round(500 * ease(seg(lt, 0.2, 1.8)));
        o += txt(960, 260, `+$${amt}.00`, 120, '#2AA594', { f: 'JetBrains Mono, monospace' });
        const grow = 1 + 0.9 * ease(seg(lt, 2.4, 4.4)), fill = 0.6 / grow;
        o += scaleAt(960, 960, grow, `<rect x="830" y="560" width="260" height="400" rx="40" fill="#fff" opacity=".55" stroke="#C98A1F" stroke-width="8"/><rect x="838" y="${f1(952 - 384 * fill)}" width="244" height="${f1(384 * fill)}" rx="32" fill="#7CC79A"/>`);
        o += thought(1440, 470, 'not enough.', pop(t, t0 + 2.6), { size: 50 });
        o += you(t, { x: 430, y: 1060, scale: 1.1, frontArm: { a1: -60, a2: -80 } });
      } else { // three losses → scared of a valid setup
        o += grad('m4', '#1D2433', '#34405A') + bg('url(#m4)');
        [0, 1, 2].forEach(j => { o += cross(430 + j * 150, 230, pop(t, t0 + 0.2 + j * 0.5), '#E2556F', 52); });
        const glow = 0.5 + 0.5 * Math.sin(t * 3);
        o += `<rect x="900" y="340" width="760" height="420" rx="30" fill="#141A26" stroke="#2AA594" stroke-width="${6 + glow * 6}" opacity="${clamp(lt - 1.2)}"/>`;
        if (lt > 1.2) o += candles(930, 380, 700, 340, vals(5, 14, 0.03, 0.035, 0.2), 14, { up: '#7ECFC0' }) + pill(1280, 330, 'VALID SETUP', '#2AA594', pop(t, t0 + 1.6), 28);
        const shake = lt > 2.6 ? Math.sin(t * 30) * 7 : 0;
        o += `<g transform="translate(${f1(shake)},0)">${pill(1280, 880, 'BUY', '#2AA594', pop(t, t0 + 2.4), 46)}<path d="M${1340 + 60 * Math.sin(t * 2)},880 l26,72 l10,-30 l30,-10 z" fill="#fff" stroke="#1D2433" stroke-width="4" opacity="${clamp(lt - 2.6)}"/></g>`;
        o += you(t, { x: 430, y: 1060, scale: 1.1, mood: 'sad' });
      }
      return fade(k, o);
    },

    /* ── 5 · the mirror: the chart didn't change. you did. ────────────── */
    'p7-mirror': (s, t) => {
      const T = s.at;
      let o = bg('#EEEBFB');
      const v = vals(21, 16, 0.004, 0.05, 0.5);
      [0, 1, 2, 3].forEach(j => {
        const x = 150 + (j % 2) * 360, y = 170 + Math.floor(j / 2) * 330;
        o += scaleAt(x + 160, y + 130, pop(t, s.start + 0.3 + j * 0.25), `<rect x="${x}" y="${y}" width="320" height="260" rx="22" fill="#fff"/>${candles(x + 10, y + 30, 300, 200, v, 16)}`);
      });
      o += pill(470, 820, 'SAME CHART', C.purple, pop(t, T[0] + 1.2), 32);
      const hue = ['#F4829A', '#E2556F', '#F5A857', '#7F77DD', '#7ECFC0'][Math.floor((t * 1.2) % 5)];
      const calm = t > T[1];
      o += `<ellipse cx="1360" cy="560" rx="300" ry="420" fill="#fff" stroke="#CECBF6" stroke-width="18"/><ellipse cx="1360" cy="560" rx="270" ry="390" fill="${calm ? '#E6F5F2' : hue}" opacity=".35"/>`;
      o += you(t, { x: 1360, y: 960, scale: 1.25, mood: calm ? undefined : 'sad' });
      o += fade(seg(t, T[0] + 2, T[0] + 2.6), txt(1360, 210, 'You did.', 80, C.dark, { f: 'Playfair Display', it: true }));
      return o;
    },

    /* ── 6 · confession: a lamp, a living room, receipts ──────────────── */
    'p7-confession': (s, t) => {
      const T = s.at;
      let o = grad('cf', '#3B2418', '#6A3F26') + bg('url(#cf)');
      o += `<ellipse cx="420" cy="420" rx="520" ry="420" fill="#F5A857" opacity=".18"/><path d="M380,150 L460,150 L500,250 L340,250 Z" fill="#F9D89A"/><rect x="414" y="250" width="12" height="320" fill="#C98A1F"/>`;
      o += host(t, { x: 140, y: 340, w: 520, pose: t > T[4] + 4 ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const cards = [
        [T[1], 'PROFITABLE DAY', 'kept trading', (x, y) => { const v = vals(9, 14, 0.02, 0.03, 0.2).concat(vals(4, 8, -0.06, 0.03, 0.75)); return candles(x - 150, y - 60, 300, 110, v, 22); }],
        [T[2], 'MY OWN RULES', 'broke them', (x, y) => `<rect x="${x - 70}" y="${y - 60}" width="140" height="110" rx="8" fill="#7F77DD"/><path d="M${x - 10},${y - 60} l20,40 l-20,30 l14,40" stroke="#fff" stroke-width="6" fill="none"/>`],
        [T[3], 'NOT MY SETUP', 'took it anyway', (x, y) => cross(x, y - 5, 1, '#E2556F', 50)],
      ];
      cards.forEach(([at, h, sub, art], j) => {
        const k = pop(t, at, 0.6); if (k <= 0) return;
        const x = 960 + j * 300, y = 360 + (j % 2) * 40, rot = -5 + j * 5;
        o += `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k}) translate(${-x},${-y})"><rect x="${x - 135}" y="${y - 150}" width="270" height="330" rx="10" fill="#fff"/><rect x="${x - 115}" y="${y - 130}" width="230" height="200" fill="#F4ECE6"/>${art(x, y - 30)}${txt(x, y + 110, h, 24, C.dark, { ls: 1 })}${txt(x, y + 148, sub, 26, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}</g>`;
      });
      // dominoes: one bad decision into another
      if (t > T[4]) {
        for (let j = 0; j < 7; j++) {
          const at = T[4] + 0.8 + j * 0.45, fall = ease(seg(t, at, at + 0.4));
          const x = 980 + j * 110, y = 960;
          o += `<g transform="rotate(${f1(fall * 62)} ${x + 26} ${y})"><rect x="${x}" y="${y - 170}" width="52" height="170" rx="8" fill="${j < 1 ? '#F4829A' : '#fff'}" stroke="#2C1810" stroke-width="4"/></g>`;
        }
        o += thought(1360, 700, 'girl. what did we just do? 😂', pop(t, T[4] + 4.4), { size: 44 });
      }
      return o;
    },

    /* ── 7 · the review: strategy problem or execution problem ────────── */
    'p7-review': (s, t) => {
      const T = s.at;
      let o = bg('#F6EDE6') + `<rect x="160" y="140" width="1600" height="820" rx="40" fill="#E9D6C6"/>`;
      // journal on the desk, magnifier sweeping
      o += `<rect x="260" y="230" width="640" height="620" rx="16" fill="#fff"/>`;
      for (let j = 0; j < 8; j++) o += `<rect x="300" y="${290 + j * 66}" width="${360 + (j * 53) % 180}" height="14" rx="7" fill="#EADFD8"/>`;
      const mx = 380 + Math.sin(t * 0.9) * 160, my = 470 + Math.cos(t * 0.7) * 160;
      o += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="90" fill="#fff" opacity=".35" stroke="#2C1810" stroke-width="12"/><line x1="${f1(mx + 64)}" y1="${f1(my + 64)}" x2="${f1(mx + 150)}" y2="${f1(my + 150)}" stroke="#2C1810" stroke-width="22" stroke-linecap="round"/>`;
      const k1 = pop(t, T[1] + 0.3), k2 = pop(t, T[1] + 2.4);
      o += scaleAt(1310, 380, k1, `<rect x="1060" y="270" width="500" height="220" rx="26" fill="#fff"/>${txt(1310, 375, 'STRATEGY PROBLEM', 40, C.muted, { ls: 2 })}<line x1="1100" x2="1520" y1="362" y2="362" stroke="#E2556F" stroke-width="8" stroke-dasharray="${f1(420 * seg(t, T[1] + 1.4, T[1] + 2))} 420"/>`);
      o += scaleAt(1310, 680, k2, `<rect x="1040" y="560" width="540" height="240" rx="26" fill="#7F77DD"/>${txt(1310, 690, 'EXECUTION PROBLEM', 44, '#fff', { ls: 2 })}`);
      o += fade(seg(t, T[2] + 0.4, T[2] + 1), txt(1310, 880, 'I knew. I just didn’t do it.', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    /* ── 8 · "okay… thanks" ───────────────────────────────────────────── */
    'p7-thanks': (s, t) => {
      const T = s.at;
      let o = bg('#FDE8ED');
      const posters = [['DON’T REVENGE TRADE', 330, -6], ['DON’T HAVE FOMO', 960, 4], ['DON’T OVERTRADE', 1590, -3]];
      const drop = seg(t, T[1] + 1.4, T[1] + 2.6);
      posters.forEach(([p, x, r], j) => {
        const k = pop(t, T[0] + 1.2 + j * 1.1, 0.5); if (k <= 0) return;
        const y = 330 + drop * (1500 + j * 120);
        o += `<g transform="translate(${x},${f1(y)}) rotate(${f1(r + drop * (j - 1) * 40)}) scale(${k})"><rect x="-260" y="-150" width="520" height="300" rx="12" fill="#fff" stroke="#2C1810" stroke-width="6"/>${txt(0, 18, p, 40, C.dark)}</g>`;
      });
      o += fade(seg(t, T[1], T[1] + 0.3) * (1 - seg(t, T[2] - 0.2, T[2] + 0.2)), `${txt(960, 720, 'okay… thanks. 😂', 96, C.dark, { f: 'Playfair Display', it: true })}`);
      // before · during · after
      if (t > T[2]) {
        const lbl = ['BEFORE', 'DURING', 'AFTER'], cols = [C.teal, C.peach, C.purple];
        o += `<line x1="320" x2="1600" y1="620" y2="620" stroke="#2C1810" stroke-width="8" stroke-linecap="round" stroke-dasharray="${f1(1280 * seg(t, T[2] + 0.3, T[2] + 1.4))} 1300"/>`;
        lbl.forEach((l, j) => { const x = 320 + j * 640; o += scaleAt(x, 620, pop(t, T[2] + 1 + j * 0.9), `<circle cx="${x}" cy="620" r="54" fill="${cols[j]}"/>${txt(x, 730, l, 40, C.dark, { ls: 3 })}`); });
        const mx = 320 + 1280 * seg(t, T[2] + 2, T[2] + 6);
        o += `<circle cx="${f1(mx)}" cy="460" r="70" fill="#fff" opacity=".5" stroke="#2C1810" stroke-width="10"/><line x1="${f1(mx + 50)}" y1="510" x2="${f1(mx + 110)}" y2="570" stroke="#2C1810" stroke-width="18" stroke-linecap="round"/>`;
      }
      return o;
    },

    /* ── 9 · patterns: recognize yourself ─────────────────────────────── */
    'p7-patterns': (s, t) => {
      const T = s.at;
      let o = grad('pt', '#EEEBFB', '#FDE8ED') + bg('url(#pt)');
      o += `<ellipse cx="960" cy="560" rx="230" ry="330" fill="#fff" stroke="#CECBF6" stroke-width="16"/>` + you(t, { x: 960, y: 860, scale: 1.0 });
      const qs = [[T[1], 'after a loss?', 400, 260], [T[2], 'when I miss an entry?', 1520, 260], [T[3], 'on a really good day?', 400, 820], [T[4], 'in drawdown?', 1520, 820]];
      const toRules = seg(t, T[5] + 1.5, T[5] + 3);
      qs.forEach(([at, q, x, y], j) => {
        const k = pop(t, at, 0.5); if (k <= 0) return;
        o += `<line x1="${x}" y1="${y}" x2="960" y2="560" stroke="#7F77DD" stroke-width="4" stroke-dasharray="10 10" opacity="${clamp(t - at - 0.4) * 0.7}"/>`;
        o += scaleAt(x, y, k, `<rect x="${x - 250}" y="${y - 60}" width="500" height="120" rx="60" fill="${toRules > 0 ? '#2C1810' : '#fff'}"/>${txt(x, y + 14, toRules > 0.5 ? ['RULE: after a loss…', 'RULE: missed entry…', 'RULE: good day…', 'RULE: drawdown…'][j] : 'What happens ' + q, 30, toRules > 0 ? '#fff' : C.dark, { w: 700 })}`);
      });
      o += pill(960, 120, 'recognize your patterns → create rules around them', C.purple, pop(t, T[5] + 0.6), 30);
      return o;
    },

    /* ── 10 · calm-you protects 10:17-you ─────────────────────────────── */
    'p7-calm-1017': (s, t) => {
      const T = s.at;
      let o = grad('cl', '#FFE7C7', '#FDF8F5') + `<rect width="960" height="1080" fill="url(#cl)"/>` + grad('st', '#3A1420', '#1D0B12') + `<rect x="960" width="960" height="1080" fill="url(#st)"/>`;
      o += `<circle cx="300" cy="260" r="110" fill="#F5A857" opacity=".7"/>` + txt(480, 160, '8:30 AM', 60, C.dark, { f: 'JetBrains Mono, monospace' }) + txt(1440, 160, '10:17 AM', 60, '#FF8DA3', { f: 'JetBrains Mono, monospace' });
      for (let j = 0; j < 14; j++) { const x = 1000 + (j * 137) % 900, y = ((t * 900 + j * 211) % 1100) - 40; o += `<line x1="${x}" y1="${f1(y)}" x2="${x - 18}" y2="${f1(y + 60)}" stroke="#7A8AA8" stroke-width="3" opacity=".5"/>`; }
      o += you(t, { x: 480, y: 1040, scale: 1.2, frontArm: { a1: 20, a2: -10 } }) + `<rect x="560" y="760" width="220" height="280" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="5"/>` + [0, 1, 2].map(j => `<rect x="590" y="${810 + j * 50}" width="${seg(t, T[0] + 1 + j * 0.6, T[0] + 1.6 + j * 0.6) * 160}" height="12" rx="6" fill="#7F77DD"/>`).join('');
      const shake = Math.sin(t * 25) * 5;
      o += `<g transform="translate(${f1(shake)},0)">${you(t, { x: 1440, y: 1040, scale: 1.2, flip: true, mood: 'sad', frontArm: { a1: -120, a2: -150 } })}</g>` + thought(1440, 340, 'I’m pissed. one more.', pop(t, T[1] + 1.4), { size: 40 });
      // the rules fly over and stand between
      const fly = ease(seg(t, T[1] + 3, T[1] + 4.6));
      if (fly > 0) { const x = lerp(670, 1180, fly), y = lerp(900, 600, fly); o += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(-8 + fly * 8)})"><rect x="-130" y="-170" width="260" height="340" rx="14" fill="#fff" stroke="#7F77DD" stroke-width="8"/>${txt(0, -110, 'MY RULES', 30, '#7F77DD', { ls: 2 })}${[0, 1, 2].map(j => `<rect x="-90" y="${-60 + j * 54}" width="180" height="14" rx="7" fill="#CECBF6"/>`).join('')}</g>`; }
      return o;
    },

    /* ── 11 · the rule ────────────────────────────────────────────────── */
    'p7-rule': (s, t) => {
      const T = s.at;
      let o = grad('rl', '#FDE8ED', '#EEEBFB') + bg('url(#rl)');
      o += txt(960, 150, '🧠 YOUR RULE', 34, C.purple, { ls: 6 });
      o += scaleAt(960, 270, pop(t, s.start + 0.4, 0.8), txt(960, 290, 'My emotions are information,', 76, C.dark, { f: 'Playfair Display' }) + txt(960, 380, 'not instructions.', 76, C.pink, { f: 'Playfair Display', it: true }));
      const rows = [['FRUSTRATED', 'trade'], ['SCARED', 'skip my setup'], ['MISSING OUT', 'chase price'], ['CONFIDENT', 'increase my risk']];
      rows.forEach(([e, a], j) => {
        const at = T[j], k = pop(t, at, 0.5); if (k <= 0) return;
        const y = 520 + j * 105, cut = seg(t, at + 1.6, at + 2.2);
        o += scaleAt(960, y, k, `<rect x="420" y="${y - 44}" width="1080" height="88" rx="44" fill="#fff"/>${txt(560, y + 14, e, 34, C.dark, { ls: 2 })}${txt(760, y + 14, '→', 40, C.muted)}${txt(860, y + 14, a, 36, C.muted, { a: 'start', w: 700 })}<line x1="850" x2="${f1(850 + cut * (a.length * 20 + 30))}" y1="${y + 2}" y2="${y + 2}" stroke="#E2556F" stroke-width="7" stroke-linecap="round"/>${cut >= 1 ? check(1440, y, 1, '#2AA594', 26) : ''}`);
      });
      o += fade(seg(t, T[4] + 0.4, T[4] + 1.2), txt(960, 1000, 'Feel it. Don’t let it make the decision.', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    /* ── 12 · reflection: between knowing and doing ───────────────────── */
    'p7-reflect': (s, t) => {
      const T = s.at;
      let o = bg('#FBF4EF') + `<rect x="300" y="110" width="1320" height="860" rx="24" fill="#fff" stroke="#EADFD8" stroke-width="6"/>`;
      for (let j = 0; j < 12; j++) o += `<line x1="340" x2="1580" y1="${200 + j * 64}" y2="${200 + j * 64}" stroke="#F1E5DD" stroke-width="3"/>`;
      o += `<line x1="420" x2="420" y1="110" y2="970" stroke="#F9B8C6" stroke-width="4"/>`;
      o += fade(seg(t, T[0] + 0.6, T[0] + 1.4), txt(460, 250, 'My most recent', 60, C.dark, { a: 'start', f: 'Playfair Display' }));
      const lossK = seg(t, T[1] - 0.3, T[1] + 0.3), strike = seg(t, T[1] + 0.8, T[1] + 1.3);
      o += fade(lossK, txt(980, 250, 'loss', 60, C.muted, { a: 'start', f: 'Playfair Display', it: true }) + `<line x1="975" x2="${f1(975 + strike * 120)}" y1="232" y2="232" stroke="#E2556F" stroke-width="7"/>`);
      o += fade(seg(t, T[1] + 1.4, T[1] + 2), txt(1120, 250, 'mistake.', 60, C.pink, { a: 'start', f: 'Playfair Display', it: true }));
      o += fade(seg(t, T[3], T[3] + 0.6), txt(460, 380, '☐  I genuinely didn’t know what to do.', 40, C.dark, { a: 'start', w: 700 }));
      o += fade(seg(t, T[4], T[4] + 0.6), txt(460, 460, '☐  I knew, and chose something different.', 40, C.dark, { a: 'start', w: 700 }));
      if (t > T[5]) {
        const p = seg(t, T[5] + 0.4, T[5] + 2);
        o += `<rect x="460" y="600" width="360" height="130" rx="65" fill="#2AA594"/>${txt(640, 680, 'KNOWING', 44, '#fff', { ls: 3 })}<rect x="1180" y="600" width="360" height="130" rx="65" fill="#7F77DD"/>${txt(1360, 680, 'DOING', 44, '#fff', { ls: 3 })}`;
        o += `<line x1="830" x2="${f1(830 + p * 340)}" y1="665" y2="665" stroke="#2C1810" stroke-width="8" stroke-dasharray="16 14"/>`;
        o += scaleAt(1000, 665, pop(t, T[5] + 2, 0.6), `<circle cx="1000" cy="665" r="62" fill="#F4829A"/>${txt(1000, 690, '?', 76, '#fff', { f: 'Playfair Display' })}`);
        o += fade(seg(t, T[6], T[6] + 0.6), txt(1000, 870, 'That’s where we start.', 54, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    /* ════ Phase 7 · Lesson 1 · The Moment Between ════════════════════ */
    // A loss, the urge, the hand on the mouse… then everything FREEZES.
    'p7m-moment': (s, t) => {
      const T = s.at, frz = seg(t, T[8], T[8] + 0.5);
      let o = grad('mm', '#1C1528', '#2E2142') + bg('url(#mm)');
      const loss = vals(31, 10, -0.05, 0.03, 0.8), again = vals(33, 14, 0.03, 0.05, 0.35);
      const n2 = t < T[3] ? 0 : Math.floor(seg(t, T[3], T[8]) * 14) + 1;
      const series = loss.concat(again.slice(0, n2));
      o += `<rect x="200" y="200" width="1080" height="560" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>` + candles(230, 260, 1020, 440, series, series.length + 1, { slots: 24 });
      // the red number, slammed
      const slam = pop(t, T[0] + 0.2, 0.4);
      o += scaleAt(740, 880, slam, `<rect x="560" y="820" width="360" height="110" rx="24" fill="#E2556F"/>${txt(740, 900, '−$300', 64, '#fff', { f: 'JetBrains Mono, monospace' })}`);
      // frustration: heat + steam
      if (t > T[1]) { const h = seg(t, T[1], T[1] + 1); o += `<circle cx="1580" cy="520" r="${f1(260 + 20 * Math.sin(t * 4))}" fill="#E2556F" opacity="${f1(0.18 * h * (1 - frz))}"/>`; for (let j = 0; j < 3; j++) { const p = ((t * 0.8 + j * 0.33) % 1); o += `<path d="M${1540 + j * 40},${f1(300 - p * 140)} q14,-20 0,-40 q-14,-20 0,-40" stroke="#fff" stroke-width="6" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.6 * h * (1 - frz))}"/>`; } }
      o += you(t * (1 - frz) + T[8] * frz, { x: 1580, y: 1050, scale: 1.25, flip: true, mood: 'sad', frontArm: t > T[5] ? { a1: -175, a2: -170 } : { a1: 100, a2: 95 } });
      o += thought(1500, 230, 'maybe I can get back in…', between(t, T[4] + 0.6, T[8] - 0.1), { size: 40 });
      // cursor heading to BUY
      const bp = pop(t, T[5], 0.5);
      if (bp > 0) { const cx = lerp(1180, 1080, ease(seg(t, T[5], T[7] + 1))), cy = lerp(900, 830, ease(seg(t, T[5], T[7] + 1))); const pul = t > T[7] && t < T[8] ? 1 + 0.06 * Math.sin(t * 9) : 1;
        o += scaleAt(1040, 830, bp * pul, `<rect x="960" y="790" width="160" height="80" rx="40" fill="#2AA594"/>${txt(1040, 842, 'BUY', 36, '#fff')}`) + `<path d="M${f1(cx)},${f1(cy)} l24,70 l10,-28 l28,-10 z" fill="#fff" stroke="#1C1528" stroke-width="4"/>`; }
      // FREEZE: grey wash, "hold on"
      if (frz > 0) {
        o += `<rect width="1920" height="1080" fill="#EDE8F6" opacity="${f1(0.82 * frz * (1 - seg(t, T[9] - 0.2, T[9] + 0.4)))}"/>`;
        o += fade(frz * (1 - seg(t, T[9] - 0.2, T[9] + 0.3)), `<rect x="760" y="420" width="400" height="160" rx="80" fill="#2C1810"/><rect x="900" y="455" width="30" height="90" rx="8" fill="#fff"/><rect x="990" y="455" width="30" height="90" rx="8" fill="#fff"/>` + txt(960, 660, 'hold on.', 64, C.dark, { f: 'Playfair Display', it: true }));
      }
      // FEEL ── the moment between ── DO
      if (t > T[9] - 0.2) {
        const k = seg(t, T[9] - 0.2, T[9] + 0.6), gap = ease(seg(t, T[11], T[11] + 1.6));
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(k)}"/>`;
        const lx = 960 - 120 - gap * 300, rx = 960 + 120 + gap * 300;
        o += fade(k, `<rect x="${f1(lx - 380)}" y="440" width="380" height="200" rx="100" fill="#E2556F"/>${txt(lx - 190, 560, 'FEEL', 64, '#fff', { ls: 6 })}<rect x="${f1(rx)}" y="440" width="380" height="200" rx="100" fill="#2C1810"/>${txt(rx + 190, 560, 'DO', 64, '#fff', { ls: 6 })}`);
        if (gap > 0) o += `<rect x="${f1(lx + 20)}" y="470" width="${f1(rx - lx - 40)}" height="140" rx="70" fill="#F9D89A" opacity="${f1(0.5 + 0.3 * Math.sin(t * 3))}"/>`;
        o += fade(seg(t, T[12], T[12] + 0.6), txt(960, 820, 'the moment between', 86, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // "Girl, you're human." Feelings are normal; the problem is who's driving.
    'p7m-human': (s, t) => {
      const T = s.at;
      let o = grad('hm', '#FDF8F5', '#FDE8ED') + bg('url(#hm)');
      // a robot "never emotional", crossed out
      const rk = between(t, T[1], T[2] + 0.2);
      if (rk > 0) o += scaleAt(1460, 520, rk, `<rect x="1360" y="380" width="200" height="180" rx="24" fill="#B8B3C9"/><rect x="1395" y="430" width="40" height="30" rx="6" fill="#2C1810"/><rect x="1485" y="430" width="40" height="30" rx="6" fill="#2C1810"/><rect x="1410" y="500" width="100" height="12" rx="6" fill="#2C1810"/><rect x="1380" y="570" width="160" height="200" rx="20" fill="#B8B3C9"/>${txt(1460, 830, '“never emotional”', 34, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1460, 600, pop(t, T[1] + 1.5, 0.4) * rk, '#E2556F', 70);
      o += you(t, { x: 760, y: 1000, scale: 1.4 });
      o += fade(seg(t, T[2], T[2] + 0.4), txt(760, 200, 'you’re human 😂', 70, C.dark, { f: 'Playfair Display', it: true }));
      const feels = [['😤', 'frustrated', 0], ['🤩', 'excited', 1.6], ['😞', 'disappointed', 3.2]];
      const drive = seg(t, T[5], T[5] + 1.5);
      feels.forEach(([e, l, dt], j) => {
        const k = pop(t, T[3] + dt, 0.5); if (k <= 0) return;
        const a = -2.4 + j * 1.1 + t * 0.25, ox = 760 + Math.cos(a) * 380, oy = 560 + Math.sin(a) * 260;
        const x = lerp(ox, 1380 + j * 120, drive), y = lerp(oy, 470, drive);
        o += scaleAt(x, y, k, `<circle cx="${f1(x)}" cy="${f1(y)}" r="74" fill="#fff"/>${txt(x, y + 22, e, 64, C.dark)}${drive < 0.3 ? txt(x, y + 112, l, 28, C.muted, { w: 700 }) : ''}`) + (drive < 0.3 ? check(x + 56, y - 56, pop(t, T[4], 0.4), '#2AA594', 24) : '');
      });
      if (drive > 0) {
        o += fade(drive, `<rect x="1300" y="560" width="440" height="200" rx="40" fill="#2C1810"/><circle cx="1520" cy="560" r="70" fill="none" stroke="#2C1810" stroke-width="22"/>${txt(1520, 690, 'DECISIONS', 34, '#fff', { ls: 4 })}`);
        o += pill(1520, 880, 'that’s where we run into problems', '#E2556F', pop(t, T[6], 0.5), 30);
      }
      return o;
    },

    // Three rows: the feeling (fine) vs the action because of it (the mistake). Then: so fast.
    'p7m-difference': (s, t) => {
      const T = s.at;
      let o = bg('#FBF4EF');
      const rows = [['frustrated after a loss', 'another trade BECAUSE you’re frustrated'], ['excited after a win', 'more contracts BECAUSE you’re excited'], ['you missed an opportunity', 'chasing price BECAUSE of it']];
      const fast = seg(t, T[4], T[4] + 0.3) * (1 - seg(t, T[6] - 0.2, T[6] + 0.3));
      rows.forEach(([a, b], j) => {
        const k = pop(t, T[j] + 0.3, 0.5); if (k <= 0) return;
        const y = 250 + j * 210;
        o += scaleAt(960, y, k, `<rect x="160" y="${y - 70}" width="700" height="140" rx="70" fill="#E6F5F2"/>${txt(510, y + 12, a, 34, C.dark, { w: 700 })}<rect x="1060" y="${y - 70}" width="700" height="140" rx="70" fill="#FDE8ED"/>${txt(1410, y + 12, b, 30, C.dark, { w: 700 })}${txt(960, y + 18, '≠', 70, C.muted)}`);
        if (t > T[3] + 1) o += check(860, y - 60, pop(t, T[3] + 1 + j * 0.25, 0.4), '#2AA594', 26) + cross(1760, y - 60, pop(t, T[3] + 2.4 + j * 0.25, 0.4), '#E2556F', 26);
      });
      o += fade(seg(t, T[3], T[3] + 0.5) * (1 - fast), txt(960, 920, 'The emotion isn’t the mistake. What you do with it can be.', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      // so fast: a lightning bolt, FEEL → REACT
      if (fast > 0) {
        o += `<rect width="1920" height="1080" fill="#1C1528" opacity="${f1(0.9 * fast)}"/>`;
        o += fade(fast, `${pill(560, 540, 'FEEL', '#E2556F', 1, 56)}${pill(1360, 540, 'REACT', '#2C1810', 1, 56)}<path d="M740,540 L940,500 L900,560 L1170,520" stroke="#F9D89A" stroke-width="16" fill="none" stroke-linejoin="round"/>${txt(960, 700, '0.2 seconds', 44, '#F9D89A', { f: 'JetBrains Mono, monospace' })}`);
      }
      if (t > T[6] - 0.2) {
        const k = seg(t, T[6] - 0.2, T[6] + 0.5);
        o += `<rect width="1920" height="1080" fill="#EEEBFB" opacity="${f1(k)}"/>`;
        o += fade(k, `${pill(480, 300, 'FEEL', '#E2556F', 1, 50)}<path d="M600,300 Q900,300 1200,300" stroke="#2C1810" stroke-width="8" fill="none" stroke-dasharray="14 12"/>${pill(1380, 300, 'REACT', '#2C1810', 1, 50)}
          <path d="M600,330 Q820,600 1120,640" stroke="#7F77DD" stroke-width="12" fill="none"/>`);
        o += scaleAt(1320, 650, pop(t, T[6] + 1.2, 0.6), `<rect x="1150" y="580" width="340" height="140" rx="70" fill="#7F77DD"/>${txt(1320, 666, 'NOTICE ⏸', 50, '#fff', { ls: 3 })}`);
        o += fade(seg(t, T[7], T[7] + 0.6), txt(960, 900, 'Feel something. Don’t immediately do something.', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Dayli at home: I knew the rules… "Dayli, why did you do that?"
    'p7m-knew': (s, t) => {
      const T = s.at;
      let o = grad('kn', '#F3E3D6', '#FBF4EF') + bg('url(#kn)');
      o += host(t, { x: 120, y: 330, w: 520, pose: t > T[5] ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const list = [[T[1], 'my trading rules'], [T[2], 'what to wait for'], [T[3], 'when to be done']];
      o += `<rect x="900" y="180" width="760" height="460" rx="28" fill="#fff"/>` + txt(1280, 260, 'I KNEW…', 40, '#7F77DD', { ls: 6 });
      list.forEach(([at, l], j) => { const y = 350 + j * 100; o += fade(seg(t, at, at + 0.5), txt(1000, y + 12, l, 42, C.dark, { a: 'start', w: 700 })) + check(1560, y, pop(t, at + 0.3, 0.4), '#2AA594', 30); });
      if (t > T[4]) {
        const k = seg(t, T[4], T[4] + 0.6);
        ['frustration', 'excitement', 'whatever'].forEach((w, j) => { o += pill(1000 + j * 230, 730, w, ['#E2556F', '#F5A857', '#7F77DD'][j], pop(t, T[4] + 0.5 + j * 0.6, 0.4), 28); });
        o += fade(k, `<path d="M1280,800 L1280,900" stroke="#2C1810" stroke-width="8"/>${txt(1280, 960, 'a decision that didn’t line up', 40, '#E2556F', { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      o += thought(1280, 120, 'Dayli, why did you do that? 😂', pop(t, T[5] + 0.5), { size: 40 });
      return o;
    },

    // The decision didn't start at the click. Rewind the tape into her head.
    'p7m-rewind': (s, t) => {
      const T = s.at;
      let o = bg('#141026');
      const rw = seg(t, T[1] + 0.5, T[2] + 0.5);
      // tape frame
      o += `<rect x="140" y="140" width="1640" height="800" rx="36" fill="#1E1834" stroke="#3A2F55" stroke-width="8"/>`;
      o += txt(260, 220, rw > 0 && rw < 1 ? '◀◀ REWIND' : t > T[2] ? '▌▌ BEFORE THE CLICK' : '▶ PLAY', 34, rw > 0 && rw < 1 ? '#F9D89A' : '#CFC8FA', { a: 'start', f: 'JetBrains Mono, monospace' });
      if (rw > 0 && rw < 1) for (let j = 0; j < 12; j++) o += `<rect x="140" y="${f1(160 + ((j * 67 + t * 900) % 760))}" width="1640" height="3" fill="#fff" opacity=".12"/>`;
      // the click (in the past)
      const clickK = 1 - seg(t, T[2] - 0.3, T[2] + 0.4);
      o += fade(clickK, `${pill(960, 560, 'BUY', '#2AA594', 1 + 0.08 * Math.sin(t * 6), 70)}<path d="M1040,600 l30,86 l12,-34 l34,-12 z" fill="#fff" stroke="#141026" stroke-width="5"/>${txt(960, 760, 'the click', 40, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 })}`);
      // inside her head
      if (t > T[2] - 0.3) {
        const k = seg(t, T[2] - 0.3, T[2] + 0.5);
        o += fade(k, `<ellipse cx="960" cy="560" rx="560" ry="330" fill="#2A2142" stroke="#7F77DD" stroke-width="6"/>`);
        const th = [[T[3], 'make the money back', 700, 420], [T[4], 'don’t miss the move', 1220, 480], [T[5], 'I’m overly confident', 860, 660]];
        th.forEach(([at, l, x, y]) => { o += thought(x, y, l, pop(t, at + 0.2, 0.5), { size: 40 }); });
        o += fade(seg(t, T[6], T[6] + 0.6) * (1 - seg(t, T[7] - 0.3, T[7])), txt(960, 900, 'recognize it… or just act on it?', 44, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      }
      // pause: the opportunity to recognize why
      if (t > T[7] - 0.3) {
        const k = seg(t, T[7] - 0.3, T[7] + 0.5);
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(k)}"/>`;
        o += scaleAt(960, 470, pop(t, T[7], 0.7), `<circle cx="960" cy="470" r="170" fill="#7F77DD"/><rect x="895" y="390" width="44" height="160" rx="10" fill="#fff"/><rect x="981" y="390" width="44" height="160" rx="10" fill="#fff"/>`);
        o += fade(seg(t, T[8], T[8] + 0.5), txt(960, 760, 'not a guarantee', 46, C.muted, { f: 'Playfair Display', it: true, w: 700 }));
        o += fade(seg(t, T[9], T[9] + 0.5), txt(960, 850, 'a chance to see WHY', 64, C.dark, { f: 'Playfair Display' }));
      }
      return o;
    },

    // "Not meditate for 30 minutes 😂" → just a moment. The pause button.
    'p7m-pause': (s, t) => {
      const T = s.at;
      let o = grad('pz', '#E6F5F2', '#FDF8F5') + bg('url(#pz)');
      const med = between(t, T[2], T[3] - 0.2);
      if (med > 0) {
        o += scaleAt(960, 700, med, `<ellipse cx="960" cy="930" rx="260" ry="40" fill="#CFE9E4"/>${A.person(t, { x: 960, y: 940, scale: 1.1, look: YOU, seed: 3, frontArm: { a1: 30, a2: -20 } })}${txt(960, 300, '30:00', 120, C.dark, { f: 'JetBrains Mono, monospace' })}`);
        o += cross(1240, 260, pop(t, T[2] + 2, 0.4), '#E2556F', 60) + fade(med, txt(960, 140, '😂', 70, C.dark));
      }
      const pk = seg(t, T[3] - 0.2, T[3] + 0.5);
      if (pk > 0) {
        const press = t > T[3] + 1.5 && t < T[3] + 1.8 ? 0.92 : 1;
        o += fade(pk, scaleAt(960, 480, press, `<circle cx="960" cy="480" r="220" fill="#2C1810"/><circle cx="960" cy="480" r="190" fill="#7F77DD"/><rect x="880" y="380" width="56" height="200" rx="12" fill="#fff"/><rect x="984" y="380" width="56" height="200" rx="12" fill="#fff"/>`));
        o += fade(seg(t, T[3] + 1, T[3] + 1.6), txt(960, 830, 'stop · check yourself', 64, C.dark, { f: 'Playfair Display', it: true }));
        o += pill(960, 960, 'three questions', '#7F77DD', pop(t, T[4], 0.5), 40);
      }
      return o;
    },

    // The three questions, one card at a time; a mismatch means STOP.
    'p7m-questions': (s, t) => {
      const T = s.at;
      let o = bg('#FBF4EF');
      const cards = [[T[0], '1', 'What am I feeling?', '#E2556F'], [T[3], '2', 'What is it making me want to do?', '#F5A857'], [T[6], '3', 'What does my plan say?', '#7F77DD']];
      cards.forEach(([at, n, q, col], j) => {
        const k = pop(t, at, 0.6); if (k <= 0) return;
        const x = 340 + j * 620;
        o += scaleAt(x, 380, k, `<rect x="${x - 270}" y="160" width="540" height="440" rx="34" fill="#fff" stroke="${col}" stroke-width="6"/><circle cx="${x}" cy="240" r="48" fill="${col}"/>${txt(x, 258, n, 52, '#fff')}${txt(x, 360, q.length > 22 ? q.slice(0, q.indexOf(' ', 14)) : q, 34, C.dark, { w: 800 })}${q.length > 22 ? txt(x, 404, q.slice(q.indexOf(' ', 14) + 1), 34, C.dark, { w: 800 }) : ''}`);
      });
      // card 1 contents: emotions → NAME IT tag
      ['frustrated', 'excited', 'scared', 'impatient'].forEach((e, j) => { o += pill(340 + (j % 2 ? 110 : -110), 470 + Math.floor(j / 2) * 70, e, '#FDE8ED', pop(t, T[1] + j * 0.35, 0.4), 24, C.dark); });
      o += pill(340, 650, 'NAME IT', '#E2556F', pop(t, T[2], 0.5), 30);
      ['enter early', 'another trade', 'bigger size', 'move my stop'].forEach((e, j) => { o += pill(960 + (j % 2 ? 115 : -115), 470 + Math.floor(j / 2) * 70, e, '#FFF1DA', pop(t, T[4] + j * 0.45, 0.4), 24, C.dark); });
      o += fade(seg(t, T[5], T[5] + 0.5), txt(960, 670, 'the behavior matters more', 30, '#B86E12', { f: 'Playfair Display', it: true, w: 700 }));
      // plan: what I want ✗, what might happen ✗, the plan ✓
      [[T[7], 'what I want'], [T[8], 'what might happen']].forEach(([at, l], j) => { const y = 470 + j * 60; o += fade(seg(t, at, at + 0.4), txt(1580, y, l, 28, C.muted, { w: 700 }) + `<line x1="1470" x2="${f1(1470 + 220 * seg(t, at + 0.5, at + 0.9))}" y1="${y - 9}" y2="${y - 9}" stroke="#E2556F" stroke-width="5"/>`); });
      o += pill(1580, 600, 'MY PLAN ✓', '#7F77DD', pop(t, T[9], 0.5), 30);
      // mismatch → STOP
      if (t > T[10]) {
        const k = pop(t, T[10] + 1.6, 0.6);
        o += `<line x1="610" y1="820" x2="1310" y2="820" stroke="#2C1810" stroke-width="6" stroke-dasharray="14 12" opacity="${f1(seg(t, T[10], T[10] + 1))}"/>` + txt(960, 790, 'doesn’t line up?', 36, C.dark, { op: f1(seg(t, T[10], T[10] + 1)), f: 'Playfair Display', it: true, w: 700 });
        o += scaleAt(960, 920, k, `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = Math.PI / 8 + i * Math.PI / 4; return `${f1(960 + Math.cos(a) * 92)},${f1(920 + Math.sin(a) * 92)}`; }).join(' ')}" fill="#E2556F"/>${txt(960, 934, 'STOP', 40, '#fff')}`);
      }
      return o;
    },

    // Pausing isn't second-guessing; and it's okay to step away.
    'p7m-stepaway': (s, t) => {
      const T = s.at;
      let o = bg('#FDF8F5');
      const s1 = 1 - seg(t, T[2] - 0.3, T[2] + 0.2);
      if (s1 > 0) { // hourglass of second-guessing, crossed
        o += fade(s1, `${candles(300, 300, 700, 360, vals(5, 14, 0.03, 0.035, 0.2), 14)}${pill(650, 260, 'VALID SETUP', '#2AA594', 1, 28)}`);
        const sand = seg(t, T[1], T[1] + 4);
        o += fade(s1, `<path d="M1300,280 L1520,280 L1430,480 L1520,680 L1300,680 L1390,480 Z" fill="#fff" stroke="#2C1810" stroke-width="8"/><path d="M${1320 + sand * 60},${300 + sand * 140} L${1500 - sand * 60},${300 + sand * 140} L1410,470 Z" fill="#F5A857"/><path d="M1340,660 L1480,660 L${1410 + 70 * (1 - sand)},${660 - sand * 150} L${1410 - 70 * (1 - sand)},${660 - sand * 150} Z" fill="#F5A857"/>`);
        o += fade(s1, txt(1410, 780, 'second-guessing…', 40, C.muted, { f: 'Playfair Display', it: true, w: 700 })) + cross(1580, 300, pop(t, T[1] + 3, 0.4) * s1, '#E2556F', 50);
      }
      // part of the process
      const s2 = seg(t, T[2] - 0.3, T[2] + 0.3) * (1 - seg(t, T[3] - 0.3, T[3] + 0.2));
      if (s2 > 0) { const steps = [['ANALYZE', '#7ECEC4'], ['CHECK YOURSELF', '#7F77DD'], ['EXECUTE', '#2AA594']]; o += fade(s2, steps.map(([l, c], j) => `<rect x="${200 + j * 540}" y="420" width="440" height="160" rx="80" fill="${c}"/>${txt(420 + j * 540, 515, l, 38, '#fff', { ls: 3 })}${j < 2 ? txt(690 + j * 540, 520, '→', 60, C.dark) : ''}`).join('') + txt(960, 760, 'part of the process', 54, C.dark, { f: 'Playfair Display', it: true })); }
      // step away: candles keep moving, she walks out
      if (t > T[3] - 0.3) {
        const k = seg(t, T[3] - 0.3, T[3] + 0.3), walk = seg(t, T[3] + 1.5, T[4] + 3);
        o += fade(k, `<rect x="220" y="240" width="760" height="480" rx="24" fill="#120D1C"/>${candles(250, 290, 700, 380, vals(41, 30, 0, 0.08, 0.5), Math.floor(8 + (t - T[3]) * 3), { slots: 30 })}<rect x="1500" y="220" width="220" height="560" rx="10" fill="#E9D6C6"/><circle cx="1690" cy="520" r="12" fill="#B8835A"/>`);
        o += fade(k, A.person(t, { x: lerp(1080, 1600, walk), y: 1000, scale: 1.2, look: YOU, seed: 3, walking: walk > 0 && walk < 1 }));
        o += fade(seg(t, T[4], T[4] + 0.6), txt(960, 140, 'price moving ≠ you have to participate', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // The rule: emotions roll in like waves; she stays standing.
    'p7m-rule': (s, t) => {
      const T = s.at;
      let o = grad('rw', '#EEEBFB', '#DDF1EE') + bg('url(#rw)');
      o += txt(960, 130, 'YOUR TRADING RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 250, 'I can feel it without acting on it.', 74, C.dark, { f: 'Playfair Display' }));
      const waves = [[T[0], 'frustrated', 'revenge trading'], [T[1], 'excited', 'increasing my risk'], [T[2], 'FOMO', 'chasing price'], [T[3], 'afraid', 'abandoning my plan']];
      // rock + figure
      o += `<path d="M1180,1080 Q1260,820 1440,800 Q1620,820 1700,1080 Z" fill="#8B7B72"/>` + you(t, { x: 1440, y: 820, scale: 0.95 });
      waves.forEach(([at, f, a], j) => {
        const p = seg(t, at, at + 3.2); if (p <= 0) return;
        const x = lerp(-300, 1500, p), op = p < 0.85 ? 1 : 1 - seg(p, 0.85, 1);
        o += `<g opacity="${f1(op)}"><path d="M${f1(x - 300)},1000 Q${f1(x - 150)},${f1(820 - 40 * Math.sin(p * 6))} ${f1(x)},900 Q${f1(x + 150)},${f1(980)} ${f1(x + 300)},1000 L${f1(x + 300)},1080 L${f1(x - 300)},1080 Z" fill="#7ECEC4" opacity=".75"/>${txt(x, 950, f, 40, '#fff')}</g>`;
        const y = 400 + j * 80;
        o += fade(seg(t, at + 0.4, at + 0.9), txt(240, y, `feel ${f}`, 34, C.dark, { a: 'start', w: 700 }) + txt(600, y, `without ${a}`, 34, C.muted, { a: 'start', w: 700 }));
      });
      o += fade(seg(t, T[4], T[4] + 0.6), txt(960, 790, 'information, not instructions', 50, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, T[5] + 1, T[5] + 1.8), `<rect x="0" y="0" width="1920" height="1080" fill="#FDF8F5" opacity=".92"/>` + txt(960, 500, 'Sometimes the most important trading decision', 56, C.dark, { f: 'Playfair Display' }) + txt(960, 590, 'is the one you choose not to make.', 56, C.pink, { f: 'Playfair Display', it: true }));
      return o;
    },

    // Reflection: replay your last emotional decision; find the frame where you knew.
    'p7m-replay': (s, t) => {
      const T = s.at;
      let o = bg('#1A1424');
      const frames = ['the setup', 'the feeling', 'the urge', 'you knew', 'the click', 'the result'];
      const scroll = (t - s.start) * 40 % 300;
      o += `<rect x="0" y="330" width="1920" height="420" fill="#0E0A14"/>`;
      for (let x = -300; x < 2200; x += 60) o += `<rect x="${f1(x - scroll)}" y="345" width="30" height="22" rx="4" fill="#3A2F55"/><rect x="${f1(x - scroll)}" y="713" width="30" height="22" rx="4" fill="#3A2F55"/>`;
      frames.forEach((f, j) => {
        const x = 160 + j * 300 - scroll * 0.0, hot = j === 3 && t > T[4];
        o += fade(pop(t, T[0] + 0.5 + j * 0.3, 0.5), `<rect x="${x}" y="390" width="260" height="300" rx="10" fill="${hot ? '#F4829A' : '#2A2142'}" stroke="${hot ? '#fff' : '#3A2F55'}" stroke-width="${hot ? 8 : 4}"/>${txt(x + 130, 550, f, 32, hot ? '#fff' : '#CFC8FA', { w: 800 })}`);
      });
      [[T[1], 'What were you feeling?', 1], [T[2], 'What did it make you want to do?', 2]].forEach(([at, q, j]) => { o += fade(seg(t, at, at + 0.5) * (1 - seg(t, T[4] - 0.4, T[4])), txt(960, 180 + (j - 1) * 70, q, 46, '#fff', { f: 'Playfair Display', it: true, w: 700 })); });
      o += fade(seg(t, T[4], T[4] + 0.5), txt(960, 220, 'the moment you knew… and did it anyway', 52, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      o += pill(1210, 860, 'start recognizing THIS moment', '#F4829A', pop(t, T[5], 0.5), 34);
      return o;
    },

    // Feelings pass like clouds. Notice it, and let it pass.
    'p7m-clouds': (s, t) => {
      const T = s.at;
      let o = grad('sk', '#BFE3F5', '#FDF8F5') + bg('url(#sk)');
      o += `<rect x="0" y="880" width="1920" height="200" fill="#CFE9C8"/>` + you(t, { x: 960, y: 940, scale: 1.2 });
      const cl = (x, y, w, label) => `<g transform="translate(${f1(x)},${f1(y)})"><ellipse rx="${w}" ry="${w * 0.42}" fill="#fff"/><ellipse cx="${-w * 0.55}" cy="${w * 0.1}" rx="${w * 0.6}" ry="${w * 0.33}" fill="#fff"/><ellipse cx="${w * 0.6}" cy="${w * 0.08}" rx="${w * 0.62}" ry="${w * 0.34}" fill="#fff"/>${txt(0, 12, label, 36, C.muted, { w: 800 })}</g>`;
      const feels = ['frustrated', 'FOMO', 'excited', 'scared', 'impatient', 'confident'];
      feels.forEach((f, j) => { const sp = 70 + (j % 3) * 18, x = ((t - s.start) * sp + j * 420) % 2600 - 340, y = 170 + (j % 3) * 150; o += cl(x, y, 150, f); });
      o += fade(seg(t, T[0], T[0] + 0.6) * (1 - seg(t, T[3] - 0.3, T[3])), txt(960, 720, 'never feel anything? ✗', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, T[1], T[1] + 0.6) * (1 - seg(t, T[3] - 0.3, T[3])), txt(960, 800, 'recognize it before it’s a decision ✓', 50, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, T[5], T[5] + 0.6), txt(960, 760, 'Notice it.', 72, C.dark, { f: 'Playfair Display', it: true }));
      o += fade(seg(t, T[6], T[6] + 0.6), txt(960, 850, 'And let it pass.', 72, C.pink, { f: 'Playfair Display', it: true }));
      return o;
    },
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
