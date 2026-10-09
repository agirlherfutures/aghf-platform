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

    /* ════ Phase 7 · Lesson 1 · The Moment Between ════════════════════
       Beats are named: s.b.<name> = when that line starts. */

    // 45 minutes of prep, the setup, stopped out… then it goes your way. Hand on the mouse. FREEZE.
    'p7m-moment': (s, t) => {
      const B = s.b, frz = seg(t, B.wait, B.wait + 0.5);
      const tt = t * (1 - frz) + B.wait * frz; // the world stops when she does
      let o = grad('mm', '#1C1528', '#2E2142') + bg('url(#mm)');
      // clock + levels
      const mins = Math.min(45, Math.floor(seg(t, s.start, B.levels) * 45));
      o += txt(240, 150, `MNQ · watching ${mins} min`, 34, '#CFC8FA', { a: 'start', f: 'JetBrains Mono, monospace' });
      o += `<rect x="200" y="200" width="1080" height="560" rx="28" fill="#120D1C" stroke="#3A2F55" stroke-width="6"/>`;
      const lv = seg(t, B.levels, B.levels + 1.2);
      o += `<line x1="230" x2="${f1(230 + 1020 * lv)}" y1="430" y2="430" stroke="#E2B04A" stroke-width="4" stroke-dasharray="14 10"/><line x1="230" x2="${f1(230 + 1020 * lv)}" y1="600" y2="600" stroke="#7F77DD" stroke-width="4" stroke-dasharray="14 10"/>`;
      // the story in candles: build-up → setup → entry → stop → back the original way
      const build = vals(51, 8, 0.01, 0.03, 0.45), drop = [0.5, 0.42, 0.33, 0.26, 0.2], back_ = [0.27, 0.36, 0.45, 0.53, 0.6, 0.68, 0.74];
      let n = 0;
      if (tt > B.setup) n = 8 + Math.floor(seg(tt, B.setup, B.take) * 2);
      if (tt > B.take) n = 10 + Math.floor(seg(tt, B.take + 0.5, B.stopped) * 5);
      if (tt > B.back) n = 15 + Math.floor(seg(tt, B.back + 0.5, B.hand + 1) * 7);
      const series = build.concat([0.47, 0.5], drop, back_);
      if (n > 0) o += candles(230, 260, 1020, 440, series, n, { slots: 24 });
      if (tt > B.take) o += pill(230 + 10 * 1020 / 24, 300, 'ENTRY', '#2AA594', pop(t, B.take, 0.4), 22);
      if (tt > B.stopped) o += scaleAt(740, 880, pop(t, B.stopped, 0.4), `<rect x="540" y="820" width="400" height="110" rx="24" fill="#E2556F"/>${txt(740, 900, 'STOPPED · −1R', 46, '#fff', { f: 'JetBrains Mono, monospace' })}`);
      // irritated
      if (t > B.irritated) { const h = seg(t, B.irritated, B.irritated + 1) * (1 - frz); o += `<circle cx="1580" cy="520" r="${f1(260 + 20 * Math.sin(t * 4))}" fill="#E2556F" opacity="${f1(0.18 * h)}"/>`; for (let j = 0; j < 3; j++) { const p = ((t * 0.8 + j * 0.33) % 1); o += `<path d="M${1540 + j * 40},${f1(300 - p * 140)} q14,-20 0,-40 q-14,-20 0,-40" stroke="#fff" stroke-width="6" fill="none" opacity="${f1(Math.sin(p * Math.PI) * 0.6 * h)}"/>`; } }
      o += you(tt, { x: 1580, y: 1050, scale: 1.25, flip: true, mood: t > B.stopped ? 'sad' : undefined, frontArm: t > B.hand ? { a1: -175, a2: -170 } : { a1: 100, a2: 95 } });
      o += thought(1440, 200, 'Are you serious?', between(t, B.serious, B.serious2 - 0.1), { size: 44 });
      o += thought(1380, 200, 'you had to stop ME out first?', between(t, B.serious2, B.hand - 0.1), { size: 38 });
      o += txt(1250, 160, '2 min later', 30, '#F9D89A', { op: f1(between(t, B.back, B.serious) ? 1 : 0), f: 'JetBrains Mono, monospace' });
      // hand → BUY
      const bp = pop(t, B.hand, 0.5);
      if (bp > 0) { const k = ease(seg(tt, B.hand, B.ready + 1)), cx = lerp(1180, 1080, k), cy = lerp(900, 830, k), pul = t > B.ready && t < B.wait ? 1 + 0.06 * Math.sin(t * 9) : 1;
        o += scaleAt(1040, 830, bp * pul, `<rect x="960" y="790" width="160" height="80" rx="40" fill="#2AA594"/>${txt(1040, 842, 'BUY', 36, '#fff')}`) + `<path d="M${f1(cx)},${f1(cy)} l24,70 l10,-28 l28,-10 z" fill="#fff" stroke="#1C1528" stroke-width="4"/>`; }
      // FREEZE: "wait a minute"
      const q = seg(t, B.setupQ - 0.3, B.setupQ + 0.3), gapIn = seg(t, B.between - 0.3, B.between + 0.4);
      if (frz > 0) {
        o += `<rect width="1920" height="1080" fill="#EDE8F6" opacity="${f1(0.85 * frz)}"/>`;
        o += fade(frz * (1 - q), `<rect x="760" y="380" width="400" height="160" rx="80" fill="#2C1810"/><rect x="900" y="415" width="30" height="90" rx="8" fill="#fff"/><rect x="990" y="415" width="30" height="90" rx="8" fill="#fff"/>` + txt(960, 640, 'wait a minute.', 64, C.dark, { f: 'Playfair Display', it: true }));
        // two honest answers
        o += fade(q * (1 - gapIn), `<rect x="260" y="360" width="620" height="260" rx="40" fill="#fff" stroke="#2AA594" stroke-width="8"/>${txt(570, 470, 'another setup?', 54, C.dark, { f: 'Playfair Display' })}${txt(570, 540, 'what price is doing', 30, '#2AA594', { w: 700 })}
          <rect x="1040" y="360" width="620" height="260" rx="40" fill="#fff" stroke="#E2556F" stroke-width="8"/>${txt(1350, 470, 'or just frustrated?', 54, C.dark, { f: 'Playfair Display' })}${txt(1350, 540, 'how the last trade felt', 30, '#E2556F', { w: 700 })}`);
        o += fade(seg(t, B.frustQ, B.frustQ + 0.4) * (1 - gapIn), pill(1350, 700, 'be honest 😂', '#E2556F', 1, 30));
      }
      if (gapIn > 0) {
        const gap = ease(seg(t, B.between + 0.4, B.between + 2));
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(gapIn)}"/>`;
        const lx = 840 - gap * 300, rx = 1080 + gap * 300;
        o += fade(gapIn, `<rect x="${f1(lx - 380)}" y="420" width="380" height="200" rx="100" fill="#E2556F"/>${txt(lx - 190, 540, 'FEEL', 64, '#fff', { ls: 6 })}<rect x="${f1(rx)}" y="420" width="380" height="200" rx="100" fill="#2C1810"/>${txt(rx + 190, 540, 'DO', 64, '#fff', { ls: 6 })}`);
        if (gap > 0) o += `<rect x="${f1(lx + 20)}" y="450" width="${f1(rx - lx - 40)}" height="140" rx="70" fill="#F9D89A" opacity="${f1(0.5 + 0.3 * Math.sin(t * 3))}"/>`;
        o += fade(seg(t, B.between + 1.6, B.between + 2.2), txt(960, 800, 'the moment between', 86, C.dark, { f: 'Playfair Display', it: true }));
      }
      return o;
    },

    // "You're human." Feelings are normal, including "what in the world is going on?" 😂
    'p7m-human': (s, t) => {
      const B = s.b;
      let o = grad('hm', '#FDF8F5', '#FDE8ED') + bg('url(#hm)');
      const rk = between(t, B.notproblem, B.human + 0.2);
      if (rk > 0) o += scaleAt(1460, 520, rk, `<rect x="1360" y="380" width="200" height="180" rx="24" fill="#B8B3C9"/><rect x="1395" y="430" width="40" height="30" rx="6" fill="#2C1810"/><rect x="1485" y="430" width="40" height="30" rx="6" fill="#2C1810"/><rect x="1410" y="500" width="100" height="12" rx="6" fill="#2C1810"/><rect x="1380" y="570" width="160" height="200" rx="20" fill="#B8B3C9"/>${txt(1460, 830, '“feel nothing”', 34, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`) + cross(1460, 600, pop(t, B.notproblem + 1.6, 0.4) * rk, '#E2556F', 70);
      const cx = 760 - 200 * ease(seg(t, B.diff, B.diff + 0.8));
      o += you(t, { x: cx, y: 1000, scale: 1.4 });
      o += fade(seg(t, B.human, B.human + 0.4), txt(cx, 190, 'you’re human.', 70, C.dark, { f: 'Playfair Display', it: true }));
      const feels = [['😤', 'frustrated', B.f1], ['🤩', 'excited', B.f2], ['😞', 'disappointed', B.f3], ['🤨', '“what in the world?”', B.f4]];
      feels.forEach(([e, l, at], j) => {
        const k = pop(t, at, 0.5); if (k <= 0) return;
        const a = [-2.95, -2.15, -1.0, -0.2][j], x = cx + Math.cos(a) * 380, y = 600 + Math.sin(a) * 300 + 12 * Math.sin(t * 1.6 + j);
        o += scaleAt(x, y, k, `<circle cx="${f1(x)}" cy="${f1(y)}" r="74" fill="#fff"/>${txt(x, y + 22, e, 64, C.dark)}${txt(x, y + 112, l, 26, C.muted, { w: 700 })}`) + check(x + 56, y - 56, pop(t, B.normal, 0.4), '#2AA594', 24);
      });
      o += pill(cx, 960, 'normal ✓', '#2AA594', pop(t, B.normal, 0.5), 34);
      // experiencing ≠ letting it decide
      if (t > B.diff) {
        const k = seg(t, B.diff, B.diff + 0.6);
        o += `<rect x="1180" y="300" width="640" height="460" rx="40" fill="#fff" opacity="${f1(k)}"/>` + fade(k, `${txt(1500, 420, 'EXPERIENCING', 40, '#2AA594', { ls: 3 })}${txt(1500, 480, 'an emotion', 34, C.dark, { w: 700 })}${txt(1500, 560, '≠', 64, C.muted)}${txt(1500, 640, 'LETTING IT DECIDE', 40, '#E2556F', { ls: 3 })}${txt(1500, 700, 'for you', 34, C.dark, { w: 700 })}`);
      }
      return o;
    },

    // Back to that trade: evaluating price vs reacting to a feeling. Feel → think → act. What if…
    'p7m-shift': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const part2 = seg(t, B.fast - 0.3, B.fast + 0.3), part3 = seg(t, B.whatif - 0.3, B.whatif + 0.3);
      // the two questions
      o += fade(1 - part2, `<rect x="140" y="240" width="760" height="520" rx="40" fill="#E6F5F2"/><rect x="1020" y="240" width="760" height="520" rx="40" fill="#FDE8ED"/>
        ${txt(520, 320, 'EVALUATING PRICE', 36, '#2AA594', { ls: 3 })}${txt(1400, 320, 'REACTING TO A FEELING', 36, '#E2556F', { ls: 3 })}`);
      if (part2 < 1) {
        o += fade((1 - part2) * seg(t, B.should, B.should + 0.6), thought(520, 470, 'Do I have another valid setup?', 1, { size: 36 }));
        o += fade((1 - part2) * seg(t, B.instead, B.instead + 0.6), thought(1400, 470, 'I knew I was right. Get back in.', 1, { size: 36 }));
        const arrow = seg(t, B.went, B.went + 1.4);
        o += fade((1 - part2) * arrow, `<path d="M${f1(520)},640 Q960,${f1(760)} ${f1(520 + 880 * arrow)},640" stroke="#2C1810" stroke-width="8" fill="none" stroke-dasharray="16 12"/>${txt(960, 860, 'see the difference?', 46, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      // feel → thought → act, so fast
      if (part2 > 0 && part3 < 1) {
        const k = part2 * (1 - part3);
        o += `<rect width="1920" height="1080" fill="#1C1528" opacity="${f1(0.94 * k)}"/>`;
        [['FEEL', '#E2556F', B.feel], ['THOUGHT', '#F5A857', B.thought], ['ACT', '#fff', B.act]].forEach(([l, c, at], j) => { o += fade(k, pill(420 + j * 540, 520, l, c, pop(t, at, 0.3), 56, j === 2 ? '#1C1528' : '#fff')); });
        o += fade(k * seg(t, B.act, B.act + 0.3), `<path d="M560,520 L700,490 L680,550 L880,520" stroke="#F9D89A" stroke-width="10" fill="none"/><path d="M1100,520 L1240,490 L1220,550 L1420,520" stroke="#F9D89A" stroke-width="10" fill="none"/>${txt(960, 720, 'so fast you don’t even notice', 44, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      // what if…
      if (part3 > 0) {
        o += `<rect width="1920" height="1080" fill="#EEEBFB" opacity="${f1(part3)}"/>`;
        o += fade(part3, txt(960, 170, 'what if you didn’t have to act on every thought?', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
        [['feel frustrated', 'still wait', B.w1], ['feel excited', 'still follow your risk rules', B.w2], ['feel FOMO', 'still let the trade go', B.w3]].forEach(([a, b2, at], j) => {
          const y = 330 + j * 170;
          o += scaleAt(960, y, pop(t, at, 0.5), `<rect x="260" y="${y - 60}" width="1400" height="120" rx="60" fill="#fff"/>${txt(560, y + 14, a, 40, C.dark, { w: 800 })}${txt(860, y + 16, '→', 44, C.muted)}${txt(1220, y + 14, b2, 40, '#7F77DD', { w: 800 })}`);
        });
        o += pill(960, 870, 'THAT’S EMOTIONAL CONTROL', '#2C1810', pop(t, B.control, 0.5), 38);
        o += fade(seg(t, B.recog, B.recog + 0.6), txt(960, 990, 'feeling something ≠ having to do something', 44, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // Dayli: I knew… and still. "Dayli, you literally knew better." Knowing ≠ doing.
    'p7m-knew': (s, t) => {
      const B = s.b;
      let o = grad('kn', '#F3E3D6', '#FBF4EF') + bg('url(#kn)');
      o += host(t, { x: 120, y: 330, w: 520, pose: t > B.literally ? 'think' : 'idle', talk: true, enterAt: s.start + 0.1 });
      const two = seg(t, B.twothings - 0.2, B.twothings + 0.5);
      o += fade(1 - two, `<rect x="900" y="180" width="760" height="460" rx="28" fill="#fff"/>` + txt(1280, 260, 'I KNEW…', 40, '#7F77DD', { ls: 6 }));
      [[B.k1, 'my rules'], [B.k2, 'my setup'], [B.k3, 'what I was waiting for']].forEach(([at, l], j) => { const y = 350 + j * 100; o += fade((1 - two) * seg(t, at, at + 0.5), txt(1000, y + 12, l, 42, C.dark, { a: 'start', w: 700 })) + (two < 1 ? check(1560, y, pop(t, at + 0.3, 0.4) * (1 - two), '#2AA594', 30) : ''); });
      o += fade((1 - two) * seg(t, B.different, B.different + 0.5), txt(1280, 740, '…and did something completely different 😂', 40, '#E2556F', { f: 'Playfair Display', it: true, w: 700 }));
      o += thought(1280, 110, 'Dayli, you literally knew better.', between(t, B.literally + 0.3, B.twothings - 0.3), { size: 40 });
      if (two > 0) {
        o += fade(two, `<rect x="860" y="300" width="400" height="300" rx="36" fill="#2AA594"/>${txt(1060, 470, 'KNOWING', 48, '#fff', { ls: 4 })}<rect x="1400" y="300" width="400" height="300" rx="36" fill="#7F77DD"/>${txt(1600, 470, 'DOING', 48, '#fff', { ls: 4 })}${txt(1330, 470, '≠', 80, C.dark)}${txt(1330, 720, 'two different things', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      return o;
    },

    // Right before the click: setup… or feeling? And the market doesn't care.
    'p7m-reason': (s, t) => {
      const B = s.b;
      let o = bg('#141026');
      const care = seg(t, B.care - 0.3, B.care + 0.4);
      // before the click: three feelings
      o += fade(1 - seg(t, B.ask - 0.3, B.ask + 0.3), `<ellipse cx="960" cy="540" rx="620" ry="330" fill="#2A2142" stroke="#7F77DD" stroke-width="6"/>${txt(960, 170, 'right before the decision', 40, '#CFC8FA', { f: 'Playfair Display', it: true, w: 700 })}`);
      [[B.r1, 'frustrated about a loss', 660, 430], [B.r2, 'excited, I just won', 1260, 470], [B.r3, 'what I could’ve made', 900, 660]].forEach(([at, l, x, y]) => { o += fade(1 - seg(t, B.ask - 0.3, B.ask + 0.3), thought(x, y, l, pop(t, at, 0.5), { size: 38 })); });
      // two reasons to click
      const q = seg(t, B.ask - 0.3, B.ask + 0.3) * (1 - care);
      if (q > 0) {
        o += fade(q, `${txt(960, 200, 'why am I clicking?', 56, '#fff', { f: 'Playfair Display', it: true })}
          <rect x="250" y="320" width="640" height="300" rx="40" fill="#1E3A36" stroke="#2AA594" stroke-width="8"/>${txt(570, 450, 'my setup', 60, '#fff', { f: 'Playfair Display' })}${txt(570, 530, 'is here', 40, '#7ECFC0', { w: 700 })}
          <rect x="1030" y="320" width="640" height="300" rx="40" fill="#3A1420" stroke="#E2556F" stroke-width="8" opacity="${f1(seg(t, B.ask2, B.ask2 + 0.5))}"/>`);
        o += fade(q * seg(t, B.ask2, B.ask2 + 0.5), `${txt(1350, 450, 'how I feel', 60, '#fff', { f: 'Playfair Display' })}${txt(1350, 530, 'right now', 40, '#FF8DA3', { w: 700 })}`);
        o += fade(q * seg(t, B.verydiff, B.verydiff + 0.5), txt(960, 780, 'two very different reasons to click Buy or Sell', 44, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      }
      // the market doesn't care
      if (care > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(care)}"/>`;
        o += fade(care, `<rect x="660" y="330" width="600" height="380" rx="30" fill="#120D1C"/>${candles(690, 370, 540, 300, vals(61, 16, 0.005, 0.06, 0.5), 16)}${txt(960, 790, 'THE MARKET', 40, C.dark, { ls: 6 })}`);
        [[B.care, 'I’m frustrated', 330, 300], [B.c2, 'I want my money back', 1580, 330], [B.c3, 'I should’ve made more 😂', 960, 940]].forEach(([at, l, x, y], j) => {
          const k = pop(t, at + 0.2, 0.5), bounce = ease(seg(t, at + 1.2, at + 1.9));
          o += fade(k * (1 - bounce * 0.6), thought(x + (x < 960 ? -1 : 1) * bounce * 60, y, l, 1, { size: 34 }));
        });
        o += pill(960, 210, 'doesn’t care', '#2C1810', pop(t, B.care + 0.6, 0.5), 34);
        o += fade(seg(t, B.why, B.why + 0.6), txt(960, 1040, 'so why let those feelings pick your next trade?', 40, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      }
      return o;
    },

    // The pause: not 20 minutes, just enough space. After a loss, the urge…
    'p7m-pause': (s, t) => {
      const B = s.b;
      let o = grad('pz', '#E6F5F2', '#FDF8F5') + bg('url(#pz)');
      const gag = between(t, B.notmin, B.space - 0.2);
      if (gag > 0) {
        o += scaleAt(960, 540, gag, `${txt(960, 360, '20:00', 140, C.dark, { f: 'JetBrains Mono, monospace' })}${[0, 1, 2].map(j => { const x = ((t - B.notmin) * 260 + j * 520) % 1800 + 60; return `<g transform="translate(${f1(x)},640)"><rect x="-120" y="-60" width="240" height="120" rx="20" fill="#fff" stroke="#2AA594" stroke-width="5"/>${txt(0, 12, 'setup', 34, '#2AA594')}</g>`; }).join('')}${txt(960, 860, 'missing every setup? no.', 48, C.muted, { f: 'Playfair Display', it: true, w: 700 })}`);
      }
      const pk = seg(t, B.space - 0.2, B.space + 0.5) * (1 - seg(t, B.loss - 0.3, B.loss + 0.2));
      if (pk > 0) {
        o += fade(pk, `<circle cx="960" cy="480" r="220" fill="#2C1810"/><circle cx="960" cy="480" r="190" fill="#7F77DD"/><rect x="880" y="380" width="56" height="200" rx="12" fill="#fff"/><rect x="984" y="380" width="56" height="200" rx="12" fill="#fff"/>`);
        o += fade(pk, txt(960, 140, 'THE PAUSE', 50, '#7F77DD', { ls: 8 }));
        o += fade(pk * seg(t, B.space + 0.6, B.space + 1.2), txt(960, 830, 'just enough space to see what’s influencing you', 48, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      }
      if (t > B.loss - 0.3) {
        const k = seg(t, B.loss - 0.3, B.loss + 0.3);
        o += fade(k, `<rect x="560" y="300" width="800" height="380" rx="30" fill="#120D1C"/>${candles(590, 340, 740, 300, [0.7, 0.62, 0.5, 0.38, 0.3, 0.36, 0.45, 0.52], 8)}<rect x="770" y="740" width="380" height="100" rx="24" fill="#E2556F"/>${txt(960, 808, 'just took a loss', 36, '#fff')}`);
        o += fade(seg(t, B.urge, B.urge + 0.5), thought(1450, 260, 'get back in!', 1, { size: 44 }));
        o += pill(960, 950, 'before you do anything: 3 questions', '#7F77DD', pop(t, B.three, 0.5), 34);
      }
      return o;
    },

    // Q1 what am I feeling · Q2 what is it making me want to do · Q3 what does my plan say.
    'p7m-questions': (s, t) => {
      const B = s.b;
      let o = bg('#FBF4EF');
      const showQ = (at, end, n, q, col, body) => {
        const k = seg(t, at - 0.3, at + 0.3) * (1 - seg(t, end - 0.3, end));
        if (k <= 0) return '';
        return fade(k, `<circle cx="960" cy="170" r="64" fill="${col}"/>${txt(960, 194, n, 70, '#fff')}${txt(960, 320, q, 60, C.dark, { f: 'Playfair Display' })}${body}`);
      };
      o += showQ(B.q1, B.q2, '1', 'What am I feeling right now?', '#E2556F',
        ['frustrated?', 'scared?', 'excited?', 'trying to make something back?'].map((e, j) => pill(960 + (j % 2 ? 330 : -330), 480 + Math.floor(j / 2) * 120, e, '#FDE8ED', pop(t, B.q1 + 1.2 + j * 0.7, 0.4), 34, C.dark)).join('') + pill(960, 800, 'just recognize it', '#E2556F', pop(t, B.recog1, 0.5), 34));
      const pairs = [['frustration', 'revenge trade', B.p1], ['excitement', 'more contracts', B.p2], ['fear', 'close a valid trade early', B.p3], ['FOMO', 'enter before confirmation', B.p4]];
      o += showQ(B.q2, B.q3, '2', 'What is it making me want to do?', '#F5A857',
        pairs.map(([a, b2, at], j) => { const y = 450 + j * 100; return fade(seg(t, at, at + 0.4), `<rect x="380" y="${y - 40}" width="1160" height="80" rx="40" fill="#fff"/>${txt(640, y + 12, a, 36, C.dark, { w: 800 })}${txt(900, y + 14, '→', 40, C.muted)}${txt(1220, y + 12, b2, 36, '#B86E12', { w: 800 })}`); }).join('') + pill(960, 900, 'identify the behavior', '#F5A857', pop(t, B.identify, 0.5), 32));
      const planEnd = s.end + 1;
      o += showQ(B.q3, planEnd, '3', 'What does my plan actually say?', '#7F77DD',
        fade(seg(t, B.n1, B.n1 + 0.4), txt(700, 470, 'what I feel like doing', 36, C.muted, { w: 700 }) + `<line x1="520" x2="${f1(520 + 360 * seg(t, B.n1 + 0.5, B.n1 + 0.9))}" y1="458" y2="458" stroke="#E2556F" stroke-width="6"/>`) +
        fade(seg(t, B.n2, B.n2 + 0.4), txt(700, 540, 'what I hope happens', 36, C.muted, { w: 700 }) + `<line x1="540" x2="${f1(540 + 330 * seg(t, B.n2 + 0.5, B.n2 + 0.9))}" y1="528" y2="528" stroke="#E2556F" stroke-width="6"/>`) +
        [['my setup', B.c1], ['my confirmation', B.c2], ['within my risk rules', B.c3]].map(([l, at], j) => fade(seg(t, at, at + 0.4), `<rect x="1080" y="${430 + j * 90}" width="520" height="70" rx="35" fill="#fff"/>${txt(1340, 476 + j * 90, l, 32, C.dark, { w: 800 })}`) + check(1640, 465 + j * 90, pop(t, at + (t > B.align ? 0 : 99), 0.4), '#2AA594', 26)).join('') +
        fade(seg(t, B.only, B.only + 0.5), `<rect x="560" y="790" width="800" height="110" rx="55" fill="#E2556F"/>${txt(960, 860, 'only clicking because I’m frustrated?', 38, '#fff')}`) +
        fade(seg(t, B.catch, B.catch + 0.6), txt(960, 990, 'catch the decision before it becomes a mistake', 44, C.dark, { f: 'Playfair Display', it: true, w: 700 })));
      return o;
    },

    // The rule: feelings roll in like waves; she stays standing.
    'p7m-rule': (s, t) => {
      const B = s.b;
      let o = grad('rw', '#EEEBFB', '#DDF1EE') + bg('url(#rw)');
      o += txt(960, 130, '🧠 YOUR RULE', 32, '#7F77DD', { ls: 6 });
      o += scaleAt(960, 230, pop(t, s.start + 0.4, 0.8), txt(960, 250, 'I can feel it without acting on it.', 74, C.dark, { f: 'Playfair Display' }));
      const waves = [[B.w1, 'frustrated', 'another trade'], [B.w2, 'excited', 'more risk'], [B.w3, 'afraid', 'abandon my setup'], [B.w4, 'missed it', 'chase it']];
      o += `<path d="M1180,1080 Q1260,820 1440,800 Q1620,820 1700,1080 Z" fill="#8B7B72"/>` + you(t, { x: 1440, y: 820, scale: 0.95 });
      waves.forEach(([at, f, a], j) => {
        const p = seg(t, at, at + 3.2); if (p <= 0) return;
        const x = lerp(-300, 1500, p), op = p < 0.85 ? 1 : 1 - seg(p, 0.85, 1);
        o += `<g opacity="${f1(op)}"><path d="M${f1(x - 300)},960 Q${f1(x - 150)},${f1(760 - 40 * Math.sin(p * 6))} ${f1(x)},850 Q${f1(x + 150)},930 ${f1(x + 300)},960 L${f1(x + 300)},1080 L${f1(x - 300)},1080 Z" fill="#7ECEC4" opacity=".75"/>${txt(x, 920, f, 40, '#fff')}</g>`;
        const y = 400 + j * 80;
        o += fade(seg(t, at + 0.4, at + 0.9), txt(220, y, f, 34, C.dark, { a: 'start', w: 800 }) + txt(520, y, `≠ ${a}`, 34, C.muted, { a: 'start', w: 700 }));
      });
      o += fade(seg(t, B.internal, B.internal + 0.6) * (1 - seg(t, B.info - 0.2, B.info + 0.2)), txt(960, 790, 'they tell me what’s happening inside', 46, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.info, B.info + 0.6), txt(960, 790, 'information, not instructions', 54, '#7F77DD', { f: 'Playfair Display', it: true, w: 700 }));
      return o;
    },

    // Reflection: replay your last emotional decision. The little voice. Catch it BEFORE the click.
    'p7m-replay': (s, t) => {
      const B = s.b;
      let o = bg('#1A1424');
      const frames = [['revenge trade', B.m1], ['chased an entry', B.m2], ['moved my stop', B.m3], ['closed a winner early', B.m4]];
      o += `<rect x="0" y="330" width="1920" height="420" fill="#0E0A14"/>`;
      const sc = (t * 30) % 60;
      for (let x = -60; x < 2000; x += 60) o += `<rect x="${f1(x - sc)}" y="345" width="30" height="22" rx="4" fill="#3A2F55"/><rect x="${f1(x - sc)}" y="713" width="30" height="22" rx="4" fill="#3A2F55"/>`;
      frames.forEach(([f, at], j) => { const x = 170 + j * 420, hot = t > B.goback && t < B.feel - 0.2; o += fade(pop(t, at, 0.5), `<rect x="${x}" y="390" width="360" height="300" rx="10" fill="${hot ? '#2A2142' : '#2A2142'}" stroke="#3A2F55" stroke-width="4"/>${txt(x + 180, 552, f, 32, '#CFC8FA', { w: 800 })}`); });
      o += fade(seg(t, B.feel, B.feel + 0.5) * (1 - seg(t, B.recognize - 0.3, B.recognize)), ['frustrated?', 'scared?', 'excited?', 'impatient?'].map((e, j) => pill(330 + j * 420, 230, e, '#F4829A', pop(t, B.feel + 1 + j * 0.5, 0.4), 34)).join('') + txt(960, 140, 'right before: what was I feeling?', 46, '#fff', { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.recognize, B.recognize + 0.5) * (1 - seg(t, B.voice - 0.3, B.voice)), txt(960, 200, 'did I know I was about to go against my plan?', 50, '#F9D89A', { f: 'Playfair Display', it: true, w: 700 }));
      o += thought(960, 190, 'Girl, you know you’re not supposed to be doing this. 😂', between(t, B.voice + 0.3, B.catch - 0.2), { size: 38 });
      // not after… BEFORE WE CLICK
      if (t > B.catch - 0.3) {
        const k = seg(t, B.catch - 0.3, B.catch + 0.3);
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(k)}"/>`;
        [['after the trade', B.na1], ['after the account is blown', B.na2], ['after giving back profits', B.na3]].forEach(([l, at], j) => { const y = 330 + j * 110; o += fade(k * seg(t, at, at + 0.4), txt(960, y, `not ${l}`, 46, C.muted, { f: 'Playfair Display', it: true, w: 700 }) + `<line x1="${960 - l.length * 13 - 70}" x2="${f1(960 - l.length * 13 - 70 + (l.length * 26 + 140) * seg(t, at + 0.5, at + 0.9))}" y1="${y - 14}" y2="${y - 14}" stroke="#E2556F" stroke-width="5"/>`); });
        o += scaleAt(960, 760, pop(t, B.before, 0.6), `<rect x="560" y="680" width="800" height="160" rx="80" fill="#2C1810"/>${txt(960, 782, 'BEFORE WE CLICK', 58, '#fff', { ls: 4 })}`);
      }
      return o;
    },

    // The goal: recognize it without letting it control you. One moment.
    'p7m-clouds': (s, t) => {
      const B = s.b;
      let o = grad('sk', '#BFE3F5', '#FDF8F5') + bg('url(#sk)');
      o += `<rect x="0" y="880" width="1920" height="200" fill="#CFE9C8"/>` + you(t, { x: 1480, y: 940, scale: 1.2 });
      const cl = (x, y, w, label) => `<g transform="translate(${f1(x)},${f1(y)})"><ellipse rx="${w}" ry="${w * 0.42}" fill="#fff"/><ellipse cx="${-w * 0.55}" cy="${w * 0.1}" rx="${w * 0.6}" ry="${w * 0.33}" fill="#fff"/><ellipse cx="${w * 0.6}" cy="${w * 0.08}" rx="${w * 0.62}" ry="${w * 0.34}" fill="#fff"/>${txt(0, 12, label, 36, C.muted, { w: 800 })}</g>`;
      ['frustrated', 'FOMO', 'excited', 'scared', 'impatient', 'confident'].forEach((f, j) => { const sp = 70 + (j % 3) * 18, x = ((t - s.start) * sp + j * 420) % 2600 - 340, y = 170 + (j % 3) * 150; o += cl(x, y, 150, f); });
      const end = seg(t, B.one - 0.3, B.one + 0.3);
      o += fade(seg(t, B.goal1, B.goal1 + 0.6) * (1 - end), txt(760, 640, 'never feel anything ✗', 50, C.dark, { f: 'Playfair Display', it: true, w: 700 }));
      o += fade(seg(t, B.goal2, B.goal2 + 0.6) * (1 - end), txt(760, 730, 'recognize it, without letting it control you ✓', 50, '#2AA594', { f: 'Playfair Display', it: true, w: 700 }));
      if (end > 0) {
        o += `<rect width="1920" height="1080" fill="#FDF8F5" opacity="${f1(end * 0.9)}"/>`;
        o += fade(end, txt(960, 420, 'one moment.', 90, C.dark, { f: 'Playfair Display', it: true }));
        const gap = ease(seg(t, B.last, B.last + 1.8));
        o += fade(seg(t, B.last, B.last + 0.5), `<rect x="${f1(560 - gap * 160)}" y="560" width="300" height="140" rx="70" fill="#E2556F"/>${txt(710 - gap * 160, 646, 'FEEL', 50, '#fff', { ls: 5 })}<rect x="${f1(1060 + gap * 160)}" y="560" width="300" height="140" rx="70" fill="#2C1810"/>${txt(1210 + gap * 160, 646, 'CHOOSE', 50, '#fff', { ls: 5 })}<rect x="${f1(870 - gap * 160)}" y="585" width="${f1(180 + gap * 320)}" height="90" rx="45" fill="#F9D89A" opacity="${f1(0.5 + 0.3 * Math.sin(t * 3))}"/>`);
      }
      return o;
    },
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = () => ''; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
