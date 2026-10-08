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
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
