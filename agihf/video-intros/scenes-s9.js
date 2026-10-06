/**
 * scenes-s9.js: illustrated scene types for Section 9 lesson intro videos
 * (Phase 3 · Section 9: Understanding Market Participation, Lessons 19 to 27).
 *
 * Every scene times its beats relative to its own start (r = t - s.start), so the
 * lesson files only need the narration lines to match those offsets.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const inout = (t, a, b, d = 0.4) => clamp((t - a) / d) * (1 - clamp((t - b) / d));
  const rad = d => d * Math.PI / 180;
  const TD = '#2F8A7F', PD = '#C2475F';

  function blink(t, seed) {
    const period = 3.6 + (seed % 3) * 0.7;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  const ground = (y, col = '#F6EDE6', edge = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="${edge}"/>`;
  const zoom = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${inner}</g>`;
  function pill(x, y, text, col, k = 1, fs = 28, o = {}) {
    if (k <= 0) return '';
    const w = o.w || (String(text).length * fs * 0.6 + 38);
    return `<g transform="translate(${x},${y}) rotate(${o.rot || 0}) scale(${k})" opacity="${o.op ?? 1}"><rect x="${-w / 2}" y="${-fs * 0.82}" width="${w}" height="${fs * 1.64}" rx="${fs * 0.82}" fill="${col}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="3"` : ''}/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${o.color || '#fff'}" font-family="DM Sans">${esc(text)}</text></g>`;
  }
  const P = (t, o) => A.person(t, o);
  // Where a person's front hand ends up (ignores the idle bob).
  function handPos(o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, fa = o.frontArm || { a1: 100, a2: 95 };
    const hx = 18 + Math.cos(rad(fa.a1)) * 58 + Math.cos(rad(fa.a2)) * 54;
    const hy = -196 + Math.sin(rad(fa.a1)) * 58 + Math.sin(rad(fa.a2)) * 54;
    return { x: o.x + hx * s * f, y: o.y + hy * s };
  }
  const headPos = o => ({ x: o.x, y: o.y - 280 * (o.scale || 1) });
  const look = (base, shirt, extra = {}) => Object.assign({}, A.LOOKS[base], { shirt }, extra);

  // Hats and small props drawn on a person's head.
  const hardHat = (o) => { const h = headPos(o), s = o.scale || 1; return `<g transform="translate(${h.x},${h.y}) scale(${s})"><path d="M-46,-14 Q-44,-62 0,-64 Q44,-62 46,-14 Z" fill="${C.gold}"/><rect x="-56" y="-20" width="112" height="14" rx="7" fill="#C98A1F"/><rect x="-6" y="-64" width="12" height="46" rx="6" fill="#F3C25C"/></g>`; };
  const fedora = (o) => { const h = headPos(o), s = o.scale || 1; return `<g transform="translate(${h.x},${h.y}) scale(${s})"><ellipse cx="0" cy="-26" rx="66" ry="14" fill="${C.dark}"/><path d="M-40,-28 Q-40,-80 0,-78 Q40,-80 40,-28 Z" fill="${C.dark}"/><rect x="-40" y="-42" width="80" height="12" fill="${C.pink}"/></g>`; };
  const chefHat = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-30" y="-20" width="60" height="26" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/><circle cx="-24" cy="-36" r="22" fill="#fff"/><circle cx="0" cy="-50" r="26" fill="#fff"/><circle cx="24" cy="-36" r="22" fill="#fff"/></g>`;

  /* ---------------- creatures ---------------- */
  function cat(t, o) {
    const s = o.s || 1, col = o.col || C.peach, seed = o.seed || 4, f = o.flip ? -1 : 1;
    const sw = Math.sin(t * 2.2 + seed) * 14, b = blink(t, seed), lx = (o.lookX || 0) * 4;
    const tilt = o.tilt || 0;
    const eyes = o.sleep
      ? `<path d="M-22,-122 q8,7 16,0 M6,-122 q8,7 16,0" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${-14 + lx}" cy="-124" rx="6" ry="${(9 * (1 - b * 0.9)).toFixed(2)}" fill="${C.dark}"/><ellipse cx="${14 + lx}" cy="-124" rx="6" ry="${(9 * (1 - b * 0.9)).toFixed(2)}" fill="${C.dark}"/>
         ${b < 0.5 ? `<circle cx="${-12 + lx}" cy="-128" r="2.2" fill="#fff"/><circle cx="${16 + lx}" cy="-128" r="2.2" fill="#fff"/>` : ''}`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})">
      <path d="M30,-20 C84,-26 ${74 + sw},-92 ${52 + sw},-122" stroke="${col}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-50" rx="42" ry="52" fill="${col}"/><ellipse cx="0" cy="-38" rx="24" ry="34" fill="#FFF3E6"/>
      <ellipse cx="-18" cy="-4" rx="15" ry="9" fill="${col}"/><ellipse cx="18" cy="-4" rx="15" ry="9" fill="${col}"/>
      <g transform="rotate(${tilt} 0 -110)">
        <path d="M-34,-130 L-28,-172 L-6,-150 Z" fill="${col}"/><path d="M34,-130 L28,-172 L6,-150 Z" fill="${col}"/>
        <path d="M-28,-140 L-25,-160 L-14,-149 Z" fill="${C.pinkL}"/><path d="M28,-140 L25,-160 L14,-149 Z" fill="${C.pinkL}"/>
        <circle cx="0" cy="-118" r="37" fill="${col}"/>
        ${eyes}
        <path d="M-5,-110 L5,-110 L0,-104 Z" fill="${C.pink}"/>
        <path d="M-8,-100 Q0,-94 0,-102 Q0,-94 8,-100" stroke="${C.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M-14,-106 L-40,-110 M-14,-102 L-40,-98 M14,-106 L40,-110 M14,-102 L40,-98" stroke="${C.dark}" stroke-width="1.8" opacity=".5"/>
        <ellipse cx="-24" cy="-104" rx="7" ry="4" fill="${C.pink}" opacity=".45"/><ellipse cx="24" cy="-104" rx="7" ry="4" fill="${C.pink}" opacity=".45"/>
        ${o.hat || ''}
      </g>
      ${o.sleep ? [0, 1].map(i => { const p = ((t * 0.7) + i * 0.5) % 1; return `<text x="${40 + p * 30}" y="${-160 - p * 50}" font-size="${24 + i * 6}" font-weight="900" fill="${C.purple}" opacity="${1 - p}" font-family="DM Sans">z</text>`; }).join('') : ''}
    </g>`;
  }

  function dog(t, o) {
    const s = o.s || 1, col = o.col || C.peachL, ear = o.ear || '#C9874A', seed = o.seed || 7, f = o.flip ? -1 : 1;
    const wag = Math.sin(t * (o.excited ? 18 : 7)) * 22, b = blink(t, seed);
    const hop = o.hop ? -Math.abs(Math.sin(t * 10)) * 26 : 0;
    return `<g transform="translate(${o.x},${o.y + hop}) scale(${s * f},${s})">
      <path d="M-34,-30 Q-70,${-60 + wag * 0.4} ${-66 + wag * 0.3},${-88 + wag}" stroke="${col}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-48" rx="44" ry="48" fill="${col}"/>
      <rect x="-30" y="-24" width="18" height="26" rx="9" fill="${col}"/><rect x="12" y="-24" width="18" height="26" rx="9" fill="${col}"/>
      <ellipse cx="6" cy="-120" rx="42" ry="38" fill="${col}"/>
      <ellipse cx="34" cy="-104" rx="22" ry="16" fill="#FFF3E6"/>
      <ellipse cx="50" cy="-110" rx="9" ry="7" fill="${C.dark}"/>
      ${o.frosting ? `<circle cx="44" cy="-118" r="8" fill="${C.pinkL}"/><circle cx="52" cy="-122" r="5" fill="#fff"/>` : ''}
      <ellipse cx="-30" cy="-110" rx="14" ry="30" fill="${ear}" transform="rotate(${14 + Math.sin(t * 3) * 6} -30 -134)"/>
      <ellipse cx="10" cy="-130" rx="6" ry="${(8 * (1 - b * 0.9)).toFixed(2)}" fill="${C.dark}"/><ellipse cx="30" cy="-132" rx="5" ry="${(7 * (1 - b * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      ${o.tongue !== false ? `<path d="M30,-94 Q34,-78 42,-90 Z" fill="${C.pink}"/>` : ''}
      ${o.halo ? `<ellipse cx="6" cy="-178" rx="30" ry="8" fill="none" stroke="${C.gold}" stroke-width="5" opacity="${o.halo}"/>` : ''}
    </g>`;
  }

  function bird(t, o) {
    const s = o.s || 1, col = o.col || C.purple, f = o.flip ? -1 : 1, b = blink(t, o.seed || 3);
    const flap = o.flying ? Math.sin(t * (o.fast ? 30 : 16)) * 40 : Math.sin(t * 2) * 4;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s}) rotate(${o.rot || 0})">
      <path d="M-22,-18 L-46,-30 L-40,-10 Z" fill="${col}"/>
      ${o.flying ? '' : `<path d="M-6,0 L-6,12 M6,0 L6,12" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>`}
      <ellipse cx="0" cy="-20" rx="26" ry="22" fill="${col}"/><ellipse cx="6" cy="-14" rx="14" ry="12" fill="${o.belly || C.pinkL}"/>
      <ellipse cx="-4" cy="-24" rx="16" ry="9" fill="${o.wing || C.purpleL}" transform="rotate(${-flap} 4 -24)"/>
      <circle cx="12" cy="-28" r="4" fill="${C.dark}" transform="scale(1,${(1 - b * 0.9).toFixed(2)})" transform-origin="12 -28"/>
      <path d="M22,-26 L34,-22 L22,-18 Z" fill="${C.gold}"/>
    </g>`;
  }

  function owl(t, o) {
    const x = o.x, y = o.y, b = blink(t, 6), tilt = o.tilt || 0, lx = (o.lookX || 0) * 8;
    const er = 30 * (1 - b * 0.92);
    return `<g transform="translate(${x},${y}) rotate(${tilt})">
      <path d="M-62,-104 L-46,-150 L-24,-112 Z" fill="${C.purple}"/><path d="M62,-104 L46,-150 L24,-112 Z" fill="${C.purple}"/>
      <ellipse cx="0" cy="-20" rx="96" ry="112" fill="${C.purple}"/>
      <ellipse cx="0" cy="10" rx="60" ry="76" fill="${C.purpleL}"/>
      ${[-1, 1].map(sd => [0, 1, 2, 3].map(i => `<circle cx="${sd * (92 + (i % 2) * 6)}" cy="${-70 + i * 26}" r="18" fill="#fff" stroke="#EADFD8" stroke-width="2"/>`).join('')).join('')}
      <circle cx="-36" cy="-58" r="34" fill="#fff"/><circle cx="36" cy="-58" r="34" fill="#fff"/>
      <ellipse cx="${-36 + lx}" cy="-56" rx="15" ry="${Math.max(1, er * 0.5).toFixed(2)}" fill="${C.dark}"/><ellipse cx="${36 + lx}" cy="-56" rx="15" ry="${Math.max(1, er * 0.5).toFixed(2)}" fill="${C.dark}"/>
      <path d="M-12,-30 L12,-30 L0,-6 Z" fill="${C.gold}"/>
      ${[0, 1, 2].map(i => `<path d="M${-30 + i * 30},20 q8,10 16,0" stroke="${C.purple}" stroke-width="4" fill="none" opacity=".5"/>`).join('')}
    </g>`;
  }

  // Small seeded candle set inside a box. data: [open, close, high, low] in 0..1 (up).
  function bars(r, o) {
    const n = o.data.length, step = o.w / n, bw = Math.min(o.bw || step * 0.56, 46);
    const Y = v => o.y + o.h - v * o.h;
    return o.data.map((d, i) => {
      const p = ease((r - (o.t0 + i * o.dt)) / 0.35);
      if (p <= 0) return '';
      const [op, cl, hi, lo] = d, up = cl >= op, col = up ? C.teal : C.pink, cx = o.x + step * (i + 0.5);
      const c = lerp(op, cl, p), top = Y(Math.max(op, c)), bot = Y(Math.min(op, c));
      return `<line x1="${cx}" x2="${cx}" y1="${Y(lerp(Math.max(op, cl), hi, p))}" y2="${Y(lerp(Math.min(op, cl), lo, p))}" stroke="${col}" stroke-width="${o.wick || 4}" stroke-linecap="round"/>
        <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${Math.max(3, bot - top)}" rx="3" fill="${col}"/>`;
    }).join('');
  }
  const card = (x, y, w, h, k, extra = '') => zoom(x + w / 2, y + h / 2, k, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${extra}`);
  const mirror = d => d.map(([o, c, h, l]) => [1 - o, 1 - c, 1 - l, 1 - h]);
  const qmarks = (x, y, t, n = 3, col = C.purple) => Array.from({ length: n }, (_, i) => {
    const p = ((t * 0.7) + i / n) % 1;
    return `<text x="${x + (i - 1) * 34}" y="${y - p * 70}" font-size="${40 + i * 6}" font-weight="900" fill="${col}" opacity="${Math.sin(p * Math.PI) * 0.85}" font-family="Playfair Display">?</text>`;
  }).join('');
  // Little puffs of smoke or dust.
  const puffs = (x, y, t0, r, n = 10, spread = 70, col = '#fff') => Array.from({ length: n }, (_, i) => {
    const age = r - (t0 + i * 0.12);
    if (age <= 0 || age > 2.2) return '';
    const sd = i % 2 ? 1 : -1, px = x + sd * (14 + age * spread * (0.6 + (i % 3) * 0.3)), py = y - age * (16 + (i % 4) * 10);
    return `<circle cx="${px}" cy="${py}" r="${16 + age * 22}" fill="${col}" stroke="#EADFD8" stroke-width="2" opacity="${(1 - age / 2.2) * 0.9}"/>`;
  }).join('');

  const DEMAND = [[.22, .25, .29, .18], [.25, .21, .28, .17], [.21, .24, .27, .18], [.24, .22, .27, .19], [.22, .42, .44, .21], [.42, .62, .64, .4], [.62, .8, .83, .6], [.8, .92, .95, .78]];

  /* ---------------- BUILD: kicker + one headline at a time ---------------- */
  const buildStd = s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;

  const LIVE = {};

  /* ===== L19 A: rocket launch (demand) and high-dive (supply) ===== */
  LIVE['s9-launchpad'] = (s, t, ctx) => {
    const r = t - s.start, padX = 400;
    let out = ground(960);
    // Launch tower and pad.
    const tw = clamp(r / 0.5);
    let lattice = '';
    for (let k = 0; k < 7; k++) lattice += `<path d="M${padX - 176},${580 + k * 50} L${padX - 134},${630 + k * 50} M${padX - 134},${580 + k * 50} L${padX - 176},${630 + k * 50}" stroke="${C.muted}" stroke-width="4" opacity=".6"/>`;
    out += `<g opacity="${tw}"><rect x="${padX - 182}" y="570" width="12" height="390" fill="${C.muted}"/><rect x="${padX - 140}" y="570" width="12" height="390" fill="${C.muted}"/>${lattice}
      <rect x="${padX - 182}" y="560" width="70" height="14" rx="6" fill="${C.purple}"/>
      <rect x="${padX - 140}" y="930" width="280" height="30" rx="10" fill="${C.purple}"/><rect x="${padX - 120}" y="922" width="240" height="10" rx="5" fill="${C.purpleL}"/></g>`;
    // Zone glow left behind on the pad.
    const zk = ease(seg(r, 8, 8.8));
    if (zk > 0) out += `<rect x="${padX - 160}" y="900" width="320" height="64" rx="16" fill="${C.teal}" opacity="${zk * (0.35 + 0.15 * Math.sin(t * 4))}"/>` + pill(padX, 1010, 'POTENTIAL DEMAND', C.tealD, pop(r, 8.2), 26);
    // Rocket.
    const lt = r - 3.0;
    let ry = 930, rx = padX, rot = 0, rop = 1;
    if (lt > 0) { ry = 930 - lt * lt * 95; rx = padX + lt * lt * 10; rot = lt * 3; rop = clamp((ry - 380) / 140); }
    const shake = r > 2.2 && r < 3.3 ? Math.sin(t * 60) * 3 : 0;
    const fire = r > 2.4;
    if (rop > 0) out += `<g transform="translate(${rx + shake},${ry}) rotate(${rot})" opacity="${rop}">
      ${fire ? `<path d="M-22,0 Q0,${70 + Math.sin(t * 40) * 16} 22,0 Z" fill="${C.peach}"/><path d="M-12,0 Q0,${40 + Math.sin(t * 50) * 9} 12,0 Z" fill="${C.gold}"/>` : ''}
      <path d="M-48,-10 L-30,-74 L-30,-10 Z" fill="${C.pink}"/><path d="M48,-10 L30,-74 L30,-10 Z" fill="${C.pink}"/>
      <path d="M-30,-8 L-30,-150 Q0,-236 30,-150 L30,-8 Z" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
      <circle cx="0" cy="-122" r="17" fill="${C.tealL}" stroke="${C.purple}" stroke-width="5"/>
      <rect x="-30" y="-36" width="60" height="14" fill="${C.pink}"/></g>`;
    out += puffs(padX, 940, 2.5, r, 16, 80);
    // Mission controller with countdown.
    const cheer = r > 3.4 && r < 9;
    const ctrl = { x: 150, y: 960, scale: 0.78, look: A.LOOKS.c, seed: 2, talk: r < 4.4 && ctx.talking,
      frontArm: cheer ? { a1: -80, a2: -100 + Math.sin(t * 9) * 14 } : r > 0.5 ? { a1: -40, a2: -70 } : undefined };
    out += P(t, ctrl);
    [['3', 0.6, 1.4], ['2', 1.4, 2.2], ['1', 2.2, 3.0], ['Liftoff!', 3.0, 4.8]].forEach(([txt, a, b]) => {
      const o = inout(r, a, b, 0.2);
      if (o > 0) out += A.bubble(250, 640, txt, { op: o, sc: 0.8 + 0.2 * o, size: 34, weight: 900, tail: 'left', color: C.purple });
    });
    // Mini charts: demand and supply.
    const ck = pop(r, 3.0);
    out += card(530, 450, 280, 250, ck, bars(r, { x: 550, y: 470, w: 240, h: 210, data: DEMAND, t0: 3.2, dt: 0.3 }) +
      (zk > 0 ? `<rect x="552" y="${470 + 210 - 0.3 * 210}" width="${120 * zk}" height="${0.14 * 210}" rx="6" fill="${C.teal}" opacity=".35"/>` : ''));
    const sk = pop(r, 14.2);
    const zs = ease(seg(r, 17.8, 18.6));
    out += card(850, 450, 280, 250, sk, bars(r, { x: 870, y: 470, w: 240, h: 210, data: mirror(DEMAND), t0: 14.4, dt: 0.3 }) +
      (zs > 0 ? `<rect x="872" y="${470 + 210 - 0.84 * 210}" width="${120 * zs}" height="${0.14 * 210}" rx="6" fill="${C.pink}" opacity=".35"/>` : ''));
    // Diving tower and pool.
    let tower = `<rect x="1180" y="512" width="14" height="448" fill="${C.muted}"/><rect x="1290" y="512" width="14" height="448" fill="${C.muted}"/>`;
    for (let k = 0; k < 8; k++) tower += `<rect x="1180" y="${560 + k * 52}" width="124" height="8" rx="4" fill="${C.muted}" opacity=".6"/>`;
    out += `<g opacity="${clamp((r - 0.2) / 0.5)}">${tower}<rect x="1170" y="504" width="250" height="14" rx="7" fill="${zs > 0 ? C.pink : C.peach}"/>
      <rect x="1400" y="880" width="430" height="80" rx="10" fill="${C.tealL}"/>
      <path d="M1400,884 ${Array.from({ length: 9 }, (_, i) => `Q${1424 + i * 48},${876 + Math.sin(t * 3 + i) * 6} ${1448 + i * 48},884`).join(' ')}" fill="none" stroke="${C.tealD}" stroke-width="4"/>
      <rect x="1392" y="872" width="446" height="12" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="2"/></g>`;
    if (zs > 0) out += pill(1300, 460, 'POTENTIAL SUPPLY', C.pink, pop(r, 17.8), 26);
    // Bird perched on the rail, then off it goes.
    const bf = seg(r, 14.6, 16.6);
    out += bf <= 0 ? bird(t, { x: 1200, y: 504, s: 1, col: C.teal, wing: C.tealL, flip: true })
      : bf < 1 ? bird(t, { x: lerp(1200, 1960, bf), y: 504 - Math.sin(bf * Math.PI) * 120 - bf * 80, s: 1, col: C.teal, wing: C.tealL, flying: true, fast: true }) : '';
    // Diver.
    const look = A.LOOKS.seller;
    if (r < 14.6) {
      const hop = r > 13.8 ? -Math.abs(Math.sin((r - 13.8) * 12)) * 16 : 0;
      out += P(t, { x: 1380, y: 504 + hop, scale: 0.6, look, seed: 5, flip: true, frontArm: r > 13.4 ? { a1: -95, a2: -90 } : undefined, backArm: r > 13.4 ? { a1: -85, a2: -90 } : undefined });
    } else if (r < 15.7) {
      const k = (r - 14.6) / 1.1, x = lerp(1380, 1600, k), y = 504 - 200 * k + 636 * k * k;
      out += `<g transform="rotate(${k * 170} ${x} ${y - 90})">${P(t, { x, y, scale: 0.6, look, seed: 5, frontArm: { a1: -95, a2: -90 }, backArm: { a1: -85, a2: -90 } })}</g>`;
    }
    if (r > 15.6) {
      const sp = seg(r, 15.6, 16.6);
      if (sp < 1) out += `<ellipse cx="1600" cy="884" rx="${40 + sp * 120}" ry="${10 + sp * 20}" fill="none" stroke="#fff" stroke-width="${6 * (1 - sp)}"/>` + Array.from({ length: 9 }, (_, i) => {
        const a = rad(-160 + i * 17.5), d = sp * 150;
        return `<circle cx="${1600 + Math.cos(a) * d}" cy="${884 + Math.sin(a) * d + sp * sp * 80}" r="${9 * (1 - sp) + 3}" fill="${C.tealL}" stroke="${C.tealD}" stroke-width="2"/>`;
      }).join('');
      if (r > 16.6) {
        const by = 878 + Math.sin(t * 3) * 5, b = blink(t, 5);
        out += `<g transform="translate(1600,${by}) scale(${pop(r, 16.6, 0.5)})"><path d="M-30,-6 C-34,-50 34,-50 30,-6 Z" fill="${look.hair}"/><circle cx="0" cy="-20" r="26" fill="${look.skin}"/>
          <path d="M-26,-26 C-24,-50 24,-50 26,-26 C14,-40 -14,-40 -26,-26 Z" fill="${look.hair}"/>
          <ellipse cx="-9" cy="-20" rx="3.5" ry="${5 * (1 - b * 0.9)}" fill="${C.dark}"/><ellipse cx="9" cy="-20" rx="3.5" ry="${5 * (1 - b * 0.9)}" fill="${C.dark}"/>
          <path d="M-7,-8 Q0,-2 7,-8" stroke="#5a2a20" stroke-width="3" fill="none" stroke-linecap="round"/></g>
          <rect x="1560" y="880" width="80" height="6" rx="3" fill="${C.tealL}"/>`;
      }
    }
    // Hedged words that do real work.
    [['potential', 20.0, 760], ['previously', 20.8, 1010], ['may', 21.6, 1230]].forEach(([w, at, x], i) => {
      out += pill(x, 1018, w, C.purple, pop(r, at), 30, { rot: Math.sin(t * 3 + i) * 3 });
      out += A.sparkle(x, 1018, s.start + at, t, C.purpleL);
    });
    return out;
  };

  /* ===== L19 B: the price-ball returns to the trampoline ===== */
  LIVE['s9-trampoline'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const tramp = (cx, sc, sag, torn, glow) => {
      const top = -140;
      const mat = torn
        ? `<path d="M-210,${top} Q-120,${top + 40} -46,${top + 70}" stroke="${C.tealD}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M210,${top} Q120,${top + 40} 46,${top + 70}" stroke="${C.tealD}" stroke-width="14" fill="none" stroke-linecap="round"/>`
        : `<path d="M-210,${top} Q0,${top + sag * 2} 210,${top}" stroke="${C.tealD}" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      return `<g transform="translate(${cx},960) scale(${sc})">
        ${glow ? `<rect x="-240" y="${top - 30}" width="480" height="60" rx="30" fill="${C.teal}" opacity="${glow * (0.25 + 0.1 * Math.sin(t * 4))}"/>` : ''}
        <path d="M-200,0 L-170,${top} M200,0 L170,${top} M-120,0 L-150,${top} M120,0 L150,${top}" stroke="${C.dark}" stroke-width="12" stroke-linecap="round"/>
        <rect x="-236" y="${top - 12}" width="472" height="24" rx="12" fill="${C.purple}"/>
        ${mat}</g>`;
    };
    const ball = (x, y, sq = 0, lk = 0, sc = 1) => {
      const b = blink(t, 8);
      return `<g transform="translate(${x},${y}) scale(${sc * (1 + sq)},${sc * (1 - sq)})"><circle r="34" fill="${C.dark}"/>
        <circle cx="${-11 + lk * 4}" cy="-6" r="9" fill="#fff"/><circle cx="${11 + lk * 4}" cy="-6" r="9" fill="#fff"/>
        <ellipse cx="${-10 + lk * 6}" cy="-6" rx="4.5" ry="${4.5 * (1 - b * 0.9)}" fill="${C.dark}"/><ellipse cx="${12 + lk * 6}" cy="-6" rx="4.5" ry="${4.5 * (1 - b * 0.9)}" fill="${C.dark}"/>
        <path d="M-8,12 Q0,16 8,12" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    };
    // Fence and cat on the right.
    out += `<g opacity="${clamp(r / 0.6)}">${[1700, 1780, 1860].map(x => `<rect x="${x - 8}" y="840" width="16" height="120" rx="4" fill="${C.peachL}"/>`).join('')}
      <rect x="1680" y="858" width="240" height="14" rx="5" fill="${C.peach}"/><rect x="1680" y="908" width="240" height="12" rx="5" fill="${C.peach}"/></g>`;
    // Phase 1: one big trampoline, the ball comes back.
    const big = 1 - ease(seg(r, 6.6, 7.2));
    let ballX = 1560, ballY = 360, lkX = 0;
    if (big > 0) {
      const glow = ease(seg(r, 0.4, 1.2));
      const k = seg(r, 0.6, 4.0), landed = r >= 4.0;
      ballX = lerp(1560, 960, k); ballY = 380 + (786 - 380) * k * k;
      const sag = landed ? 12 + Math.sin(t * 5) * 3 : 0;
      if (landed) ballY = 786 + sag;
      out += `<g opacity="${big}">` + tramp(960, 1, sag, false, glow) +
        pill(960, 905, 'potential demand zone', C.tealD, pop(r, 0.6) * big, 24);
      // Memory of where price left before.
      const mk = ease(seg(r, 0.8, 1.8));
      if (mk > 0) out += `<path d="M890,800 Q860,600 780,450" fill="none" stroke="${C.teal}" stroke-width="6" stroke-dasharray="14 12" opacity="${mk * 0.8}"/><path d="M766,474 L776,440 L800,466" fill="none" stroke="${C.teal}" stroke-width="6" stroke-linecap="round" opacity="${mk * 0.8}"/>` +
        pill(680, 430, 'left strongly up, before', C.teal, pop(r, 1.0), 22);
      if (r > 0.6) out += ball(ballX, ballY, landed ? 0.08 + Math.sin(t * 5) * 0.03 : 0, landed ? Math.sin(t * 1.5) : -1);
      if (landed) out += qmarks(960, 700, t);
      out += '</g>';
      lkX = (ballX - 1800) / 600;
    }
    // Kid spectator in phase 1.
    const kid = { x: 1600, y: 960, scale: 0.7, look: A.LOOKS.d, seed: 9, flip: true };
    out += P(t, kid);
    const kb = inout(r, 3.8, 6.6);
    if (kb > 0) out += A.bubble(1560, 640, 'Bounce?', { op: kb, sc: 0.8 + 0.2 * kb, size: 30, weight: 700, tail: 'right', color: C.purple });
    // Phase 2: three outcomes, side by side.
    const outs = [[480, 7.0, 'bounce?'], [960, 8.6, 'chop?'], [1400, 10.2, 'break?']];
    outs.forEach(([cx, at, label], i) => {
      const k = pop(r, at, 0.7);
      if (k <= 0) return;
      const sc = 0.6, matY = 960 - 140 * sc;
      let g = tramp(cx, sc, i === 1 ? 8 : 0, i === 2, 0.8);
      const lp = r - at;
      if (i === 0) { const p = (lp % 1.6) / 1.6; const y = matY - 22 - Math.sin(p * Math.PI) * 250; g += ball(cx, y, p < 0.06 || p > 0.94 ? 0.15 : 0, 0, 0.8); }
      if (i === 1) { const x = cx + Math.sin(lp * 3) * 70, y = matY - 18 - Math.abs(Math.sin(lp * 6)) * 34; g += ball(x, y, 0, Math.sin(lp * 3), 0.8); }
      if (i === 2) { const p = (lp % 2.0) / 2.0; const y = p < 0.4 ? lerp(620, matY - 10, (p / 0.4) ** 2) : p < 0.7 ? lerp(matY - 10, 932, (p - 0.4) / 0.3) : 932; g += `<g opacity="${p > 0.85 ? (1 - p) / 0.15 : 1}">${ball(cx, y, p > 0.7 ? 0.12 : 0, 0, 0.8)}</g>`; }
      out += zoom(cx, 900, k, g) + pill(cx, 480, label, C.gold, k, 30);
    });
    // Referee with the sign.
    const rk = pop(r, 11.8, 0.7);
    if (rk > 0) {
      const ref = { x: 170, y: 960, scale: 0.8, look: look('e', C.purpleL), seed: 4, frontArm: { a1: -80, a2: -95 } };
      const h = handPos(ref);
      out += zoom(170, 960, rk, P(t, ref) + `<g transform="translate(${h.x},${h.y - 70})"><rect x="-4" y="0" width="8" height="70" fill="${C.muted}"/><rect x="-120" y="-70" width="240" height="84" rx="14" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
        <text y="-34" font-size="24" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans">NOT ENOUGH</text><text y="-6" font-size="24" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans">INFORMATION</text></g>`);
    }
    out += pill(960, 1016, 'the zone is past participation', C.purple, pop(r, 15.4) * (1 - clamp((r - 19.2) / 0.3)), 26);
    out += pill(960, 1016, 'zones do not replace structure', C.tealD, pop(r, 19.4), 26);
    // Cat on the fence follows the action.
    out += cat(t, { x: 1790, y: 858, s: 0.7, col: C.peachL, seed: 3, lookX: r < 7 ? -1 : Math.sin(t * 1.4), flip: true });
    return out;
  };

  /* ===== L20 A: stadium crowds and the applause meter ===== */
  const SEQ_A = [[.2, .32, .34, .17], [.3, .44, .46, .28], [.42, .56, .58, .38], [.54, .68, .7, .5], [.66, .8, .82, .62], [.78, .9, .92, .74]];
  const SEQ_C = [[.5, .6, .76, .3], [.6, .46, .72, .28], [.46, .56, .74, .32], [.56, .44, .76, .3], [.44, .53, .72, .26], [.53, .47, .74, .3]];
  LIVE['s9-cheer-meter'] = (s, t, ctx) => {
    const r = t - s.start;
    const state = r < 5.6 ? 'idle' : r < 10.2 ? 'buy' : r < 14.6 ? 'sell' : 'mixed';
    let out = ground(960);
    // Bleachers.
    const stand = (x0, x1) => `<rect x="${x0}" y="820" width="${x1 - x0}" height="140" rx="10" fill="${C.purpleL}" opacity=".55"/><rect x="${x0}" y="930" width="${x1 - x0}" height="30" rx="8" fill="${C.purpleL}"/>`;
    out += stand(60, 640) + stand(1280, 1860);
    const pom = col => `<g>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${Math.cos(i) * 14}" cy="${Math.sin(i) * 14 - 10}" r="13" fill="${col}"/>`).join('')}</g>`;
    const crowd = (side) => {
      const buyers = side === 'buy', shirt = buyers ? C.teal : C.pink, active = state === side;
      const bases = buyers ? ['a', 'buyer', 'e', 'c', 'b', 'd'] : ['seller', 'd', 'c', 'b', 'a', 'e'];
      const slots = [[200, 822, 0.55], [360, 822, 0.55], [520, 822, 0.55], [130, 934, 0.62], [300, 934, 0.62], [470, 934, 0.62]];
      return slots.map(([x, y, sc], i) => {
        const X = buyers ? x : 1920 - x;
        const jump = active ? -Math.abs(Math.sin(t * 7 + i)) * 26 : 0;
        const shrug = state === 'mixed';
        const fa = active ? { a1: -70, a2: -100 + Math.sin(t * 10 + i) * 22 } : shrug ? { a1: 30, a2: -40 } : undefined;
        const ba = active ? { a1: -110, a2: -80 + Math.sin(t * 10 + i + 1) * 22 } : shrug ? { a1: 150, a2: 220 } : undefined;
        const k = pop(r, 0.3 + i * 0.12, 0.5);
        return zoom(X, y, k, P(t, { x: X, y: y + jump, scale: sc, look: look(bases[i], shirt), seed: i + (buyers ? 1 : 7), flip: !buyers,
          frontArm: fa, backArm: ba, hold: active ? pom(buyers ? C.tealL : C.pinkL) : '', mood: !active && state !== 'idle' && state !== 'mixed' ? 'sad' : undefined }));
      }).join('') + (state === 'mixed' ? qmarks(buyers ? 330 : 1590, 640, t + (buyers ? 0 : 0.4), 3) : '');
    };
    out += crowd('buy') + crowd('sell');
    out += pill(330, 580, 'BUYERS', C.tealD, pop(r, 1.0), 30) + pill(1590, 580, 'SELLERS', C.pink, pop(r, 1.2), 30);
    // Applause meter.
    const gk = pop(r, 0.5, 0.7);
    const cx = 960, cy = 640, R = 150;
    const arc = (a, b, col) => {
      const x1 = cx + Math.cos(rad(a)) * R, y1 = cy + Math.sin(rad(a)) * R, x2 = cx + Math.cos(rad(b)) * R, y2 = cy + Math.sin(rad(b)) * R;
      return `<path d="M${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2}" fill="none" stroke="${col}" stroke-width="40"/>`;
    };
    const keys = [[0, -90], [5.6, -90], [6.4, -152], [10.2, -152], [11.0, -28], [14.6, -28], [15.4, -90]];
    let ang = -90;
    for (let i = 0; i < keys.length - 1; i++) if (r >= keys[i][0]) ang = lerp(keys[i][1], keys[i + 1][1], ease(seg(r, keys[i][0], keys[i + 1][0])));
    if (r >= 15.4) ang = -90 + Math.sin(t * 5) * 28 + Math.sin(t * 13) * 6; else ang += Math.sin(t * 9) * 2.5;
    out += zoom(cx, cy, gk, `<path d="M${cx - R - 40},${cy} A${R + 40},${R + 40} 0 0,1 ${cx + R + 40},${cy} Z" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
      ${arc(-180, -120, C.teal)}${arc(-120, -60, C.purpleL)}${arc(-60, 0, C.pink)}
      <text x="${cx}" y="${cy - R - 52}" font-size="22" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans" letter-spacing="2">MIXED</text>
      <line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(rad(ang)) * (R - 24)}" y2="${cy + Math.sin(rad(ang)) * (R - 24)}" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="20" fill="${C.dark}"/>`);
    // Candle screen.
    const seqs = [[4.4, SEQ_A], [9.0, mirror(SEQ_A)], [13.2, SEQ_C]];
    let cur = null;
    seqs.forEach(q => { if (r >= q[0]) cur = q; });
    out += card(700, 690, 520, 250, pop(r, 0.8), cur ? bars(r, { x: 730, y: 710, w: 460, h: 210, data: cur[1], t0: cur[0], dt: 0.5, bw: 40 }) +
      cur[1].map((d, i) => r > cur[0] + i * 0.5 + 0.35 ? `<circle cx="${730 + 460 / 6 * (i + 0.5)}" cy="${710 + 210 - d[1] * 210}" r="7" fill="${C.gold}" stroke="#fff" stroke-width="3"/>` : '').join('') : '');
    out += pill(960, 1012, 'mixed / unclear is a real answer', C.purple, pop(r, 17.6), 26);
    return out;
  };

  /* ===== L20 B: wind, a kite and a weather vane ===== */
  LIVE['s9-weather-vane'] = (s, t, ctx) => {
    const r = t - s.start, w = ease(seg(r, 9.8, 11.0));
    let out = ground(960);
    out += `<path d="M880,962 C1150,962 1240,650 1450,650 C1660,650 1760,962 1920,962 Z" fill="${C.tealL}" opacity=".7"/>`;
    // Wind streaks: buyers blow up and right, sellers blow down.
    for (let i = 0; i < 16; i++) {
      const ph = (t * 0.55 + i * 0.137) % 1, lane = (i % 6) * 80;
      const op = Math.sin(ph * Math.PI) * 0.55 * clamp(r / 1);
      const x = -100 + ph * 2100;
      if ((1 - w) > 0.02) { const y = 980 - ph * 360 - lane; out += `<path d="M${x},${y} q60,-24 120,-30" stroke="${C.teal}" stroke-width="6" fill="none" stroke-linecap="round" opacity="${op * (1 - w)}"/>`; }
      if (w > 0.02) { const y = 420 + ph * 360 + lane; out += `<path d="M${x},${y} q60,24 120,30" stroke="${C.pink}" stroke-width="6" fill="none" stroke-linecap="round" opacity="${op * w}"/>`; }
    }
    // Weather vane on the hill.
    const dir = lerp(-1, 1, w);
    out += `<rect x="1446" y="470" width="8" height="182" fill="${C.dark}"/>
      <g transform="translate(1450,520) scale(${dir},1)">
        <path d="M-90,0 L80,0" stroke="${C.dark}" stroke-width="6"/><path d="M-110,0 L-80,-14 L-80,14 Z" fill="${C.dark}"/><path d="M70,-20 L104,0 L70,20 L82,0 Z" fill="${C.dark}"/>
        <g transform="translate(0,-8)"><path d="M-36,0 Q-40,-40 -8,-46 Q10,-60 28,-48 Q20,-30 30,-14 Q10,0 -36,0 Z" fill="${C.gold}"/>
          <path d="M-8,-46 Q-4,-62 6,-56 Q8,-66 16,-58" fill="${C.pink}"/><circle cx="-18" cy="-36" r="4" fill="${C.dark}"/><path d="M-30,-34 L-42,-30 L-30,-26 Z" fill="${C.peach}"/>
          <path d="M28,-48 Q46,-56 48,-32 Q40,-40 30,-30" fill="${C.purple}"/></g></g>`;
    out += pill(1450, 708, w < 0.5 ? 'wind: BUYERS' : 'wind: SELLERS', w < 0.5 ? C.tealD : C.pink, pop(r, 0.8), 24);
    // Kid and kite.
    const kid = { x: 560, y: 960, scale: 0.82, look: A.LOOKS.b, seed: 3, frontArm: { a1: lerp(-45, -15, w), a2: lerp(-55, -25, w) } };
    const h = handPos(kid);
    const kx = lerp(880 + Math.sin(t * 1.3) * 40, 1000 + Math.sin(t * 3) * 30, w);
    const ky = lerp(460 + Math.sin(t * 2) * 22, 800 + Math.sin(t * 4) * 26, w);
    const krot = lerp(Math.sin(t * 1.6) * 8, Math.sin(t * 6) * 22, w);
    out += `<path d="M${h.x},${h.y} Q${(h.x + kx) / 2},${(h.y + ky) / 2 + 60} ${kx},${ky + 60}" stroke="${C.muted}" stroke-width="2.5" fill="none"/>`;
    const tail = Array.from({ length: 5 }, (_, i) => [kx - 10 - i * 26, ky + 76 + i * 18 + Math.sin(t * 5 + i) * 10]);
    out += `<polyline points="${kx},${ky + 64} ${tail.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.purple}" stroke-width="3"/>` +
      tail.map(([x, y], i) => `<path d="M${x - 10},${y - 8} L${x + 10},${y + 8} M${x + 10},${y - 8} L${x - 10},${y + 8}" stroke="${i % 2 ? C.pink : C.teal}" stroke-width="7" stroke-linecap="round"/>`).join('');
    out += `<g transform="translate(${kx},${ky}) rotate(${krot})"><path d="M0,-66 L46,0 L0,72 L-46,0 Z" fill="${C.peach}" stroke="#E08E2E" stroke-width="4"/><path d="M0,-66 L0,72 M-46,0 L46,0" stroke="#E08E2E" stroke-width="3"/>
      <circle cx="-12" cy="-10" r="5" fill="${C.dark}"/><circle cx="12" cy="-10" r="5" fill="${C.dark}"/><path d="${w < 0.5 ? 'M-10,8 Q0,18 10,8' : 'M-10,14 Q0,4 10,14'}" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    out += P(t, Object.assign(kid, { walking: w > 0.3 && r < 14 }));
    if (r > 6.8 && r < 9.8) out += A.sparkle(kx, ky, s.start + 6.6, t);
    // A bird riding (then fighting) the wind.
    if (w < 0.5) { const p = ((r * 0.16) % 1); out += bird(t, { x: lerp(620, 1780, p), y: 600 - p * 160, s: 1.1, col: C.pink, wing: C.pinkL, belly: C.cream, flying: true, rot: -8 }); }
    else out += bird(t, { x: 1220 - Math.min(r - 10.6, 6) * 22, y: 640 + Math.sin(t * 5) * 18, s: 1.1, col: C.pink, wing: C.pinkL, belly: C.cream, flying: true, fast: true, rot: 18 });
    // Candles that tell the story of the wind.
    const data = SEQ_A.slice(0, 4).map(d => d.map(v => v * 0.6 + 0.3)).concat(mirror(SEQ_A).slice(0, 4).map(d => d.map(v => v * 0.6 + 0.04)));
    const ck = pop(r, 0.6);
    out += card(80, 430, 340, 250, ck, bars(r, { x: 100, y: 450, w: 300, h: 210, data: data.slice(0, 4), t0: 2.8, dt: 0.5 }) +
      bars(r, { x: 100 + 150, y: 450, w: 150, h: 210, data: data.slice(4, 6), t0: 10.2, dt: 0.6 }));
    out += pill(250, 728, 'buyers appear aggressive', C.tealD, pop(r, 4.6) * (1 - clamp((r - 9.8) / 0.3)), 22);
    out += pill(250, 728, 'now sellers do', C.pink, pop(r, 11.4), 22);
    return out;
  };

  /* ===== L21 A: who smashed the cake? ===== */
  LIVE['s9-smashed-cake'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    // Wall chart board.
    const bk = pop(r, 0.3);
    const pre = [[.66, .7, .73, .63], [.7, .68, .72, .65], [.68, .74, .76, .66], [.74, .72, .77, .7], [.72, .76, .79, .7], [.76, .78, .8, .74]];
    const big = ease(seg(r, 4.6, 5.0));
    let bigC = '';
    if (big > 0) { const Y = v => 440 + 340 - v * 340, x = 120 + 380 / 7 * 6.5 + 20; bigC = `<line x1="${x}" x2="${x}" y1="${Y(.8)}" y2="${Y(lerp(.78, .1, big))}" stroke="${C.pink}" stroke-width="5"/><rect x="${x - 20}" y="${Y(.78)}" width="40" height="${Math.max(3, (0.78 - lerp(0.78, 0.12, big)) * 340)}" rx="4" fill="${C.pink}"/>`; }
    out += card(110, 420, 420, 380, bk, bars(r, { x: 140, y: 440, w: 380 / 7 * 6, h: 340, data: pre, t0: 0.6, dt: 0.3, bw: 30 }) + bigC);
    out += pill(320, 850, 'one enormous red candle', C.pink, pop(r, 5.0) * (1 - clamp((r - 16.4) / 0.3)), 22);
    [['dropped sharply', 17.0], ['in one candle', 18.2], ['little overlap', 19.4]].forEach(([w, at], i) => { out += pill(320, 856 + i * 62, w, C.tealD, pop(r, at), 24); });
    // Table and cake.
    out += `<rect x="690" y="840" width="440" height="22" rx="8" fill="${C.muted}"/><rect x="720" y="860" width="16" height="100" fill="${C.muted}"/><rect x="1084" y="860" width="16" height="100" fill="${C.muted}"/>
      <path d="M680,842 L1140,842 L1140,880 ${Array.from({ length: 8 }, (_, i) => `Q${1140 - i * 57.5 - 29},${900} ${1140 - (i + 1) * 57.5},880`).join(' ')} Z" fill="${C.pinkP}" stroke="${C.pinkL}" stroke-width="3"/>`;
    const k = ease(seg(r, 4.6, 5.0));
    const cx = 910, cb = 838;
    const tier = (y0, y1, w, col, drip) => `<rect x="${cx - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" rx="12" fill="${col}"/>
      <path d="M${cx - w / 2},${y0 + 8} ${Array.from({ length: 6 }, (_, i) => `q${w / 12},${i % 2 ? 22 : 12} ${w / 6},0`).join(' ')} L${cx + w / 2},${y0} L${cx - w / 2},${y0} Z" fill="${drip}"/>`;
    out += `<ellipse cx="${cx}" cy="${cb}" rx="${170 + k * 40}" ry="10" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <g transform="translate(${cx},${cb}) scale(${1 + k * 0.55},${1 - k * 0.66}) translate(${-cx},${-cb})">
        ${tier(cb - 110, cb, 260, C.pinkL, '#fff')}${tier(cb - 190, cb - 110, 200, C.cream, C.pinkL)}
        <g transform="translate(${k * 60},${k * 20}) rotate(${k * 24} ${cx} ${cb - 190})">${tier(cb - 260, cb - 190, 140, C.pink, '#fff')}
          <rect x="${cx - 5}" y="${cb - 300}" width="10" height="40" rx="3" fill="${C.purpleL}"/>${k < 0.3 ? `<ellipse cx="${cx}" cy="${cb - 312}" rx="7" ry="12" fill="${C.gold}" opacity="${0.8 + 0.2 * Math.sin(t * 20)}"/>` : ''}</g></g>`;
    if (r > 4.6) {
      const p = seg(r, 4.6, 6.0);
      if (p < 1) out += Array.from({ length: 12 }, (_, i) => { const a = rad(-170 + i * 14), d = 60 + p * 200; return `<circle cx="${cx + Math.cos(a) * d}" cy="${cb - 60 + Math.sin(a) * d * 0.7 + p * p * 160}" r="${8 * (1 - p) + 3}" fill="${i % 2 ? C.pinkL : C.cream}" stroke="#EADFD8" stroke-width="1.5"/>`; }).join('');
      out += [[-200, -6], [210, -4], [-140, 30], [160, 34]].map(([dx, dy], i) => `<ellipse cx="${cx + dx}" cy="${cb + dy}" rx="${22 * pop(r, 5.0 + i * 0.1)}" ry="${9 * pop(r, 5.0 + i * 0.1)}" fill="${C.pinkL}"/>`).join('');
      out += puffs(cx, cb - 20, 4.7, r, 8, 90);
    }
    // The innocent dog.
    out += dog(t, { x: 600, y: 960, s: 0.95, frosting: r > 5.2, halo: r > 12.4 ? clamp((r - 12.4) / 0.5) : 0, excited: r > 4.6 && r < 7 });
    // Theory-tellers.
    const ppl = [[1310, 'a', 'A big bank!', 8.6, 570], [1510, 'buyer', 'Retail panicked!', 9.6, 470], [1710, 'seller', 'Smart money!', 10.6, 570]];
    ppl.forEach(([x, lk, txt, at, by], i) => {
      const k2 = pop(r, 0.6 + i * 0.2, 0.5);
      const saying = r > at && r < 12.2, shrug = r > 12.4;
      out += zoom(x, 960, k2, P(t, { x, y: 960, scale: 0.8, look: A.LOOKS[lk], seed: i + 2, flip: true, talk: saying && r < at + 1.2,
        frontArm: saying ? { a1: -14, a2: -26 } : shrug ? { a1: 40, a2: -30 } : undefined, backArm: shrug ? { a1: 140, a2: 210 } : undefined }));
      const o = inout(r, at, 12.2, 0.3);
      if (o > 0) out += A.bubble(x, by, txt, { op: o, sc: 0.8 + 0.2 * o, size: 28, weight: 700, tail: 'right', italic: true, font: 'Playfair Display' });
    });
    out += pill(1510, 520, 'the chart can’t say who', C.purple, pop(r, 12.6) * (1 - clamp((r - 16.4) / 0.4)), 28);
    if (r > 12.4 && r < 16.4) out += qmarks(1510, 640, t);
    return out;
  };

  /* ===== L21 B: the language-transformer robot ===== */
  LIVE['s9-story-robot'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const proc = (r > 4.0 && r < 5.6) || (r > 12.8 && r < 14.2);
    const happy = (r > 5.6 && r < 10.6) || r > 14.2;
    const rk = pop(r, 0.2, 0.8);
    const gearRot = proc ? t * 400 : t * 20;
    const gear = (x, y, R, rot, col) => `<g transform="translate(${x},${y}) rotate(${rot})">${Array.from({ length: 8 }, (_, i) => `<rect x="-9" y="${-R - 12}" width="18" height="24" rx="4" fill="${col}" transform="rotate(${i * 45})"/>`).join('')}<circle r="${R}" fill="${col}"/><circle r="${R * 0.4}" fill="#fff"/></g>`;
    const b = blink(t, 2);
    const face = proc
      ? [0, 1].map(i => `<g transform="translate(${910 + i * 100},530) rotate(${t * 720})"><path d="M-16,0 A16,16 0 1,1 0,16" stroke="${C.gold}" stroke-width="6" fill="none" stroke-linecap="round"/></g>`).join('')
      : happy ? `<path d="M892,540 Q910,516 928,540 M992,540 Q1010,516 1028,540" stroke="${C.teal}" stroke-width="8" fill="none" stroke-linecap="round"/>`
        : `<rect x="896" y="${520 + b * 10}" width="28" height="${30 * (1 - b * 0.9)}" rx="8" fill="${C.teal}"/><rect x="996" y="${520 + b * 10}" width="28" height="${30 * (1 - b * 0.9)}" rx="8" fill="${C.teal}"/>`;
    const sway = proc ? Math.sin(t * 30) * 3 : 0;
    out += zoom(960, 960, rk, `<g transform="translate(${sway},0)">
      <rect x="870" y="900" width="40" height="60" rx="10" fill="${C.purple}"/><rect x="1010" y="900" width="40" height="60" rx="10" fill="${C.purple}"/>
      <path d="M690,560 L840,560 L812,650 L790,650 Z" fill="${C.pinkL}" stroke="${C.pink}" stroke-width="5"/>
      <text x="765" y="604" font-size="18" font-weight="900" text-anchor="middle" fill="${PD}" font-family="DM Sans">STORY</text>
      <path d="M1130,780 L1230,830 L1230,880 L1130,850 Z" fill="${C.tealL}" stroke="${C.tealD}" stroke-width="5"/>
      <rect x="790" y="600" width="340" height="300" rx="34" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
      ${gear(890, 730, 46, gearRot, C.purple)}${gear(1010, 800, 34, -gearRot * 1.3, C.peach)}
      <rect x="1050" y="640" width="54" height="24" rx="12" fill="${proc ? C.gold : '#fff'}"/>
      <line x1="960" y1="470" x2="960" y2="430" stroke="${C.purple}" stroke-width="6"/><circle cx="960" cy="424" r="13" fill="${proc && Math.sin(t * 20) > 0 ? C.gold : C.pink}"/>
      <rect x="840" y="470" width="240" height="132" rx="28" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="860" y="490" width="200" height="92" rx="18" fill="#3D3550"/>
      ${face}
      <rect x="770" y="680" width="26" height="90" rx="13" fill="${C.purple}" transform="rotate(${proc ? Math.sin(t * 16) * 20 : 10} 783 690)"/>
      <rect x="1124" y="680" width="26" height="90" rx="13" fill="${C.purple}" transform="rotate(${proc ? -Math.sin(t * 16) * 20 : -10} 1137 690)"/></g>`);
    if (proc) out += puffs(960, 420, r > 12 ? 12.8 : 4.0, r, 8, 60);
    // Speech cards.
    const storyCard = (x, y, l1, l2, k, rot = 0, op = 1) => k <= 0 ? '' : `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})" opacity="${op}">
      <rect x="-180" y="-66" width="360" height="132" rx="20" fill="#fff" stroke="${C.pink}" stroke-width="5"/>
      <rect x="-180" y="-66" width="360" height="34" rx="17" fill="${C.pink}"/><text y="-42" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">STORY</text>
      <text y="0" font-size="27" font-style="italic" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${l1}</text>
      <text y="36" font-size="27" font-style="italic" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${l2}</text></g>`;
    const factCard = (x, y, l1, l2, k, op = 1) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})" opacity="${op}">
      <rect x="-220" y="-76" width="440" height="152" rx="22" fill="#fff" stroke="${C.tealD}" stroke-width="5"/>
      <rect x="-220" y="-76" width="440" height="36" rx="18" fill="${C.tealD}"/><text y="-51" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">YOU CAN POINT AT IT</text>
      <text y="0" font-size="27" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">${l1}</text>
      <text y="38" font-size="27" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">${l2}</text></g>`;
    const giver = { x: 330, y: 960, scale: 0.85, look: A.LOOKS.buyer, seed: 3 };
    const holding1 = r > 0.8 && r < 2.6, holding2 = r > 10.4 && r < 11.8;
    giver.frontArm = holding1 || holding2 ? { a1: -70, a2: -85 } : undefined;
    out += P(t, giver);
    const h = handPos(giver), hold = { x: h.x, y: h.y - 70 };
    const cards = [
      { inAt: 0.8, fly: 2.4, out: 5.6, gone: 10.6, s1: 'Institutions', s2: 'dumped it.', f1: 'Price dropped sharply with', f2: 'large bearish candles.' },
      { inAt: 10.4, fly: 11.6, out: 14.2, gone: 99, s1: 'Smart money trapped', s2: 'the buyers.', f1: 'Price closed above the high,', f2: 'then closed back below it.' },
    ];
    cards.forEach(cd => {
      if (r > cd.inAt && r < cd.fly) out += storyCard(hold.x, hold.y, cd.s1, cd.s2, pop(r, cd.inAt, 0.5));
      else if (r >= cd.fly && r < cd.fly + 1.2) {
        const k = ease((r - cd.fly) / 1.2);
        out += storyCard(lerp(hold.x, 765, k), lerp(hold.y, 570, k) - Math.sin(k * Math.PI) * 140, cd.s1, cd.s2, lerp(1, 0.25, k), k * 200, 1 - clamp((k - 0.8) / 0.2));
      }
      if (r > cd.out) {
        const k = ease((r - cd.out) / 1.2), op = 1 - clamp((r - cd.gone) / 0.5);
        if (op > 0) out += factCard(lerp(1230, 1440, k), lerp(860, 600, k), cd.f1, cd.f2, lerp(0.25, 1, k), op);
        out += A.sparkle(1440, 600, s.start + cd.out + 1.1, t, C.teal);
      }
    });
    const getter = { x: 1720, y: 960, scale: 0.85, look: A.LOOKS.d, seed: 6, flip: true,
      frontArm: (r > 6.6 && r < 10.6) || r > 15.2 ? { a1: -60, a2: -90 + Math.sin(t * 8) * 10 } : undefined };
    out += P(t, getter);
    [['Describe first', C.tealD, 560, 17.6], ['Interpret carefully', C.peach, 960, 18.4], ['Claim less', C.purple, 1360, 19.2]].forEach(([w, col, x, at]) => { out += pill(x, 1018, w, col, pop(r, at), 26); });
    return out;
  };

  /* ===== L22 A: two identical gift boxes ===== */
  LIVE['s9-mystery-gifts'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const range = [[.45, .6, .66, .4], [.6, .42, .64, .38], [.42, .58, .63, .38], [.58, .44, .64, .4], [.44, .6, .66, .38], [.6, .45, .63, .4], [.45, .57, .62, .39]];
    const shakeAmt = (wins) => wins.reduce((m, [a, b]) => Math.max(m, inout(r, a, b, 0.2)), 0);
    const box = (x, label, wins, openAt, kid) => {
      const pk = pop(r, kid ? 0.4 : 0.7, 0.7);
      const sh = shakeAmt(wins) * Math.sin(t * 22) * 5;
      const ok = ease(seg(r, openAt, openAt + 0.9));
      const lidY = -ok * 320, lidRot = ok * (label === 'A' ? -40 : 40), lidOp = 1 - clamp((ok - 0.6) / 0.4);
      const yB = 800;
      let g = `<rect x="${x - 120}" y="800" width="240" height="160" rx="12" fill="#fff" stroke="#EADFD8" stroke-width="4"/>
        <text x="${x}" y="900" font-size="54" font-weight="900" text-anchor="middle" fill="${C.purpleL}" font-family="Playfair Display">${label}</text>`;
      g += `<g transform="rotate(${sh} ${x} ${yB})">
        <rect x="${x - 150}" y="${yB - 220}" width="300" height="220" rx="14" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/>
        <rect x="${x - 17}" y="${yB - 220}" width="34" height="220" fill="${C.peach}"/>
        <rect x="${x - 118}" y="${yB - 182}" width="236" height="122" rx="14" fill="#fff" stroke="${C.peach}" stroke-width="4"/>
        <rect x="${x - 104}" y="${yB - 168}" width="208" height="94" rx="8" fill="none" stroke="${C.purple}" stroke-width="3" stroke-dasharray="8 7"/>
        ${bars(r, { x: x - 100, y: yB - 168, w: 200, h: 94, data: range, t0: 0.8, dt: 0.15, bw: 16, wick: 3 })}
        <g transform="translate(0,${lidY}) rotate(${lidRot} ${x} ${yB - 240})" opacity="${lidOp}">
          <rect x="${x - 166}" y="${yB - 260}" width="332" height="44" rx="12" fill="${C.purple}"/><rect x="${x - 17}" y="${yB - 260}" width="34" height="44" fill="${C.peach}"/>
          <ellipse cx="${x - 36}" cy="${yB - 274}" rx="38" ry="20" fill="${C.peach}" transform="rotate(-20 ${x - 36} ${yB - 274})"/><ellipse cx="${x + 36}" cy="${yB - 274}" rx="38" ry="20" fill="${C.peach}" transform="rotate(20 ${x + 36} ${yB - 274})"/>
          <circle cx="${x}" cy="${yB - 268}" r="14" fill="${C.gold}"/></g></g>`;
      return zoom(x, 960, pk, g);
    };
    out += box(600, 'A', [[3.4, 4.6], [8.6, 9.4]], 12.8, true) + box(1320, 'B', [[5.0, 6.2], [9.6, 10.4]], 14.4, false);
    // Kids.
    const kA = { x: 250, y: 960, scale: 0.85, look: A.LOOKS.c, seed: 2, frontArm: shakeAmt([[3.4, 4.6], [8.6, 9.4]]) > 0 ? { a1: -10, a2: -4 + Math.sin(t * 22) * 6 } : r > 13.2 ? { a1: -70, a2: -100 } : undefined };
    const kB = { x: 1690, y: 960, scale: 0.85, look: A.LOOKS.b, seed: 5, flip: true, frontArm: shakeAmt([[5.0, 6.2], [9.6, 10.4]]) > 0 ? { a1: -10, a2: -4 + Math.sin(t * 22) * 6 } : r > 14.8 ? { a1: 60, a2: 100 } : undefined };
    out += P(t, kA) + P(t, kB);
    // Flip-flopping guesses.
    const tg = inout(r, 7.8, 12.4, 0.3);
    if (tg > 0) {
      const idx = Math.floor(r / 0.7) % 2, words = ['accumulation?', 'distribution?'];
      out += pill(600, 470, words[idx], C.gold, tg, 28) + pill(1320, 470, words[1 - idx], C.gold, tg, 28);
      out += qmarks(250, 600, t) + qmarks(1690, 600, t + 0.3);
    }
    // What came out.
    const upC = [[.0, .4], [.3, .7], [.55, .95], [.8, 1.25]];
    upC.forEach(([a, b], i) => {
      const k = pop(r, 13.2 + i * 0.3, 0.5);
      if (k <= 0) return;
      const x = 560 + i * 70, y0 = 560 - a * 200, y1 = 560 - b * 200;
      out += zoom(x, y0, k, `<line x1="${x}" x2="${x}" y1="${y1 - 14}" y2="${y0 + 12}" stroke="${C.teal}" stroke-width="5"/><rect x="${x - 20}" y="${y1}" width="40" height="${y0 - y1}" rx="5" fill="${C.teal}"/>`);
    });
    if (r > 13.2) out += A.sparkle(780, 340, s.start + 14.4, t, C.teal);
    const dnC = [[0, .4], [.3, .75], [.6, 1.1], [.95, 1.4]];
    dnC.forEach(([a, b], i) => {
      const k = pop(r, 14.8 + i * 0.3, 0.5);
      if (k <= 0) return;
      const x = 1480 + i * 50, y0 = 600 + a * 240, y1 = 600 + b * 240;
      out += zoom(x, y0, k, `<line x1="${x}" x2="${x}" y1="${y0 - 12}" y2="${y1 + 14}" stroke="${C.pink}" stroke-width="5"/><rect x="${x - 17}" y="${y0}" width="34" height="${y1 - y0}" rx="5" fill="${C.pink}"/>`);
    });
    out += pill(600, 1012, 'accumulation, in hindsight', C.tealD, pop(r, 16.6), 24) + pill(1320, 1012, 'distribution, in hindsight', C.pink, pop(r, 17.2), 24);
    return out;
  };

  /* ===== L22 B: the developing polaroid ===== */
  LIVE['s9-polaroid'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    // Hourglass on the right, time passing.
    const hk = pop(r, 3.6);
    const flow = seg(r, 4.0, 12.4), flipK = ease(seg(r, 12.4, 13.0));
    out += zoom(1650, 700, hk, `<g transform="rotate(${flipK * 180} 1650 700)">
      <rect x="1580" y="560" width="140" height="18" rx="9" fill="${C.muted}"/><rect x="1580" y="822" width="140" height="18" rx="9" fill="${C.muted}"/>
      <path d="M1596,578 L1704,578 Q1704,660 1660,700 Q1704,740 1704,822 L1596,822 Q1596,740 1640,700 Q1596,660 1596,578 Z" fill="#fff" fill-opacity=".6" stroke="${C.purple}" stroke-width="5"/>
      <path d="M${1610 + flow * 40},${600 + flow * 90} L${1690 - flow * 40},${600 + flow * 90} L1650,694 Z" fill="${C.gold}" opacity="${flipK > 0.5 ? 0 : 1}"/>
      <path d="M1606,818 L1694,818 L${1694 - (1 - flow) * 40},${818 - flow * 90} L${1606 + (1 - flow) * 40},${818 - flow * 90} Z" fill="${C.gold}" opacity="${flipK > 0.5 ? 0 : 1}"/>
      ${flow > 0 && flow < 1 ? `<line x1="1650" y1="700" x2="1650" y2="814" stroke="${C.gold}" stroke-width="3" stroke-dasharray="4 6" stroke-dashoffset="${-t * 40}"/>` : ''}</g>`);
    // Photographer and parrot.
    const ph = { x: 300, y: 960, scale: 0.9, look: A.LOOKS.e, seed: 4, frontArm: r < 1.4 ? { a1: -20, a2: -40 } : { a1: 60, a2: 90 }, talk: false };
    const cam = `<g transform="rotate(20)"><rect x="-44" y="-30" width="88" height="60" rx="10" fill="${C.dark}"/><rect x="-20" y="-40" width="34" height="14" rx="4" fill="${C.dark}"/><circle cx="4" cy="2" r="20" fill="#3D3550" stroke="#fff" stroke-width="4"/><circle cx="30" cy="-18" r="5" fill="${C.gold}"/></g>`;
    ph.hold = r < 1.4 ? cam : '';
    out += P(t, ph);
    if (r >= 1.4) out += `<g transform="translate(350,900)">${cam}</g>`;
    const fl = inout(r, 0.5, 0.8, 0.12);
    if (fl > 0) out += `<circle cx="${handPos(ph).x + 30}" cy="${handPos(ph).y - 30}" r="${60 + fl * 60}" fill="#FFF3C4" opacity="${fl}"/>`;
    const squawk = r > 8.2 && r < 11.4;
    const pb = squawk ? -Math.abs(Math.sin(t * 12)) * 10 : 0;
    out += bird(t, { x: 250, y: 790 + pb, s: 1.3, col: C.teal, wing: C.pink, belly: C.tealL, flip: true, flying: squawk, fast: true });
    const sq = inout(r, 8.2, 11.4, 0.25);
    if (sq > 0) out += A.bubble(220, 620, 'Accumulation!', { op: sq, sc: 0.8 + 0.2 * sq, size: 28, weight: 900, tail: 'left', color: C.purple });
    out += pill(300, 520, 'too early', C.pink, pop(r, 9.4) * (1 - clamp((r - 11.6) / 0.3)), 26);
    // The polaroid.
    const ek = ease(seg(r, 0.6, 1.5));
    const px = lerp(380, 1080, ek), py = lerp(820, 685, ek), psc = lerp(0.15, 1, ek);
    const dev = ease(seg(r, 1.4, 3.8)), dev2 = ease(seg(r, 12.4, 14.4));
    const shake = Math.sin(t * 22) * 3 * inout(r, 1.5, 3.8, 0.2);
    if (r > 0.6) {
      const ix = 820, iy = 420, iw = 520, ih = 450;
      const rng = [[.42, .55, .6, .38], [.55, .44, .6, .4], [.44, .56, .61, .4], [.56, .43, .6, .39], [.43, .54, .58, .38], [.54, .45, .6, .41], [.45, .55, .6, .4]];
      const fut = [[.55, .7, .72, .53], [.7, .64, .73, .61], [.64, .8, .82, .62], [.8, .74, .83, .71], [.74, .92, .94, .72]];
      let img = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${C.cream}"/>`;
      img += `<rect x="${ix + 22}" y="${iy + ih - 0.62 * ih}" width="292" height="${0.26 * ih}" rx="8" fill="none" stroke="${C.purple}" stroke-width="3" stroke-dasharray="10 8"/>`;
      img += bars(99, { x: ix + 26, y: iy + 10, w: 290, h: ih - 20, data: rng, t0: 0, dt: 0, bw: 22 });
      img += bars(99, { x: ix + 330, y: iy + 10, w: 180, h: ih - 20, data: fut, t0: 0, dt: 0, bw: 20 });
      img += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#6B6475" opacity="${(1 - dev) * 0.92}"/>`;
      img += `<rect x="${ix + 318}" y="${iy}" width="${iw - 318}" height="${ih}" fill="#8A8494" opacity="${(1 - dev2) * 0.97}"/>`;
      if (dev2 > 0.6) img += pill(ix + 420, iy + 50, 'broke higher, built', C.tealD, pop(r, 14.0), 20);
      img += pill(ix + 70, iy + 36, r < 12.2 ? 'LIVE' : 'HINDSIGHT', r < 12.2 ? C.purple : C.gold, pop(r, 3.4), 20, { w: r < 12.2 ? 90 : 150 });
      const conf = r > 16.8;
      const word = r < 3.4 ? '' : conf ? 'accumulation' : 'consolidation';
      out += `<g transform="translate(${px},${py}) rotate(${-3 + shake}) scale(${psc}) translate(-1080,-685)">
        <rect x="796" y="396" width="580" height="600" rx="10" fill="${C.dark}" opacity=".08" transform="translate(8,10)"/>
        <rect x="796" y="396" width="568" height="590" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="3"/>${img}
        ${word ? `<text x="1080" y="${conf ? 946 : 940}" font-size="${conf ? 50 : 44}" font-style="italic" font-weight="700" text-anchor="middle" fill="${conf ? TD : C.muted}" font-family="Playfair Display" transform="translate(1080,935) scale(${conf ? back((r - 16.8) / 0.5) : 1}) translate(-1080,-935)">${word}</text>` : ''}</g>`;
      if (conf) out += A.sparkle(1080, 930, s.start + 16.8, t, C.teal) + pill(1080, 1036, 'confirmed by structure', C.tealD, pop(r, 17.4), 22);
    }
    return out;
  };

  /* ===== L23 A: the order-flow gadget shop ===== */
  LIVE['s9-gadget-shop'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960, '#FDF1EA');
    // Back wall shelf.
    out += `<rect x="460" y="530" width="1000" height="18" rx="6" fill="${C.muted}"/><path d="M520,548 L520,590 L560,548 Z M1400,548 L1400,590 L1360,548 Z" fill="${C.muted}"/>`;
    const gad = (i) => {
      const fl = Math.sin(t * 5 + i);
      if (i === 0) return `<rect x="-62" y="-150" width="124" height="150" rx="12" fill="#fff" stroke="${C.purple}" stroke-width="5"/>${Array.from({ length: 7 }, (_, j) => { const y = -136 + j * 19; return `<rect x="-8" y="${y}" width="16" height="12" rx="3" fill="${C.purpleL}"/><rect x="${-14 - (16 + Math.abs(Math.sin(t * 2 + j * 1.7)) * 30)}" y="${y}" width="${16 + Math.abs(Math.sin(t * 2 + j * 1.7)) * 30}" height="12" rx="3" fill="${C.teal}"/><rect x="14" y="${y}" width="${14 + Math.abs(Math.cos(t * 2.2 + j)) * 30}" height="12" rx="3" fill="${C.pink}"/>`; }).join('')}`;
      if (i === 1) return `<path d="M0,-150 C46,-150 54,-100 44,-70 C36,-44 44,-20 30,-4 C14,10 -20,6 -30,-10 C-44,-34 -30,-60 -44,-90 C-56,-130 -36,-150 0,-150 Z" fill="${C.peachL}" stroke="${C.peach}" stroke-width="5"/>${Array.from({ length: 8 }, (_, j) => `<text x="${(j % 2) * 34 - 17}" y="${-118 + Math.floor(j / 2) * 30}" font-size="16" font-weight="900" text-anchor="middle" fill="${j % 3 ? TD : PD}" font-family="DM Sans">${(j * 37 + 12) % 90}</text>`).join('')}`;
      if (i === 2) return `<rect x="-62" y="-150" width="124" height="150" rx="12" fill="#fff" stroke="${C.teal}" stroke-width="5"/><line x1="-44" y1="-138" x2="-44" y2="-12" stroke="${C.dark}" stroke-width="3"/>${[30, 60, 92, 74, 46, 24].map((w, j) => `<rect x="-42" y="${-134 + j * 20}" width="${w * (0.9 + 0.1 * fl)}" height="14" rx="4" fill="${j === 2 ? C.purple : C.tealL}"/>`).join('')}`;
      return `<circle cx="0" cy="-75" r="66" fill="${C.purple}" stroke="${C.purpleL}" stroke-width="6"/><text x="0" y="-52" font-size="64" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">±</text>`;
    };
    const names = ['DOM', 'Footprint', 'Volume profile', 'Delta'];
    const slotX = i => 610 + i * 230, basket = { x: 0, y: 0 };
    const shopper = { x: 250, y: 960, scale: 0.9, look: A.LOOKS.buyer, seed: 3, frontArm: { a1: 30, a2: -20 } };
    const hp = handPos(shopper);
    basket.x = hp.x + 20; basket.y = hp.y + 20;
    const loaded = clamp((r - 7.4) / 2.4) * (1 - clamp((r - 11.2) / 2.8));
    for (let i = 0; i < 4; i++) {
      const appear = pop(r, 4.2 + i * 0.8, 0.6);
      if (appear <= 0) continue;
      const goT = 7.4 + i * 0.6, backT = 11.2 + i * 0.7;
      let x = slotX(i), y = 530, sc = 1, rot = 0;
      if (r > goT && r < backT) {
        const k = ease((r - goT) / 0.6);
        x = lerp(slotX(i), basket.x - 30 + i * 22, k); y = lerp(530, basket.y - 6 - (i % 2) * 18, k) - Math.sin(k * Math.PI) * 160; sc = lerp(1, 0.38, k); rot = k * (i % 2 ? 14 : -14);
      } else if (r >= backT) {
        const k = ease((r - backT) / 0.6);
        x = lerp(basket.x - 30 + i * 22, slotX(i), k); y = lerp(basket.y - 6 - (i % 2) * 18, 530, k) - Math.sin(k * Math.PI) * 160; sc = lerp(0.38, 1, k);
      }
      const glow = r < goT ? 0.5 + 0.5 * Math.sin(t * 4 + i) : 0;
      out += `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc * appear})">${glow ? `<ellipse cx="0" cy="-75" rx="96" ry="96" fill="${C.gold}" opacity="${0.12 + glow * 0.1}"/>` : ''}${gad(i)}</g>`;
      if (r < goT) out += A.sparkle(slotX(i), 440, s.start + 4.2 + i * 0.8, t, C.gold);
      out += pill(slotX(i), 578, names[i], C.purple, appear * (r < goT || r > backT + 0.5 ? 1 : 0.35), 20);
      if (r > backT + 0.5) out += pill(slotX(i) + 60, 628, 'later', C.peach, pop(r, backT + 0.5), 18, { rot: 8 });
    }
    // Counter.
    out += `<rect x="520" y="748" width="980" height="24" rx="8" fill="#fff" stroke="#EADFD8" stroke-width="3"/><rect x="540" y="772" width="940" height="188" fill="${C.pinkL}"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${560 + i * 186}" y="792" width="160" height="150" rx="14" fill="${C.pinkP}" opacity=".7"/>`).join('')}`;
    out += cat(t, { x: 1340, y: 748, s: 0.62, col: C.purpleL, seed: 5, sleep: r < 15 });
    // The basket the shopper carries.
    const bw = 1 + loaded * 0.1;
    out += P(t, Object.assign(shopper, { talk: r > 7.4 && r < 8.6 }));
    out += `<g transform="translate(${basket.x},${basket.y + 30}) rotate(${loaded * Math.sin(t * 6) * 6}) scale(${bw})"><path d="M-70,-30 L70,-30 L56,30 L-56,30 Z" fill="${C.peach}" stroke="#E08E2E" stroke-width="4"/><path d="M-50,-30 Q0,-96 50,-30" fill="none" stroke="#E08E2E" stroke-width="6"/></g>`;
    const ob = inout(r, 7.6, 10.6, 0.3);
    if (ob > 0) out += A.bubble(330, 560, 'Ooh, all of it!', { op: ob, sc: 0.8 + 0.2 * ob, size: 28, weight: 700, tail: 'left' });
    // Shopkeeper.
    out += P(t, { x: 1690, y: 960, scale: 0.9, look: A.LOOKS.a, seed: 7, flip: true, talk: r > 4.2 && r < 7.0, frontArm: r > 4.2 && r < 7.2 ? { a1: -30, a2: -50 } : undefined });
    // The price in front of you.
    const pk = pop(r, 15.0, 0.7);
    const pdat = [[.3, .45, .48, .28], [.45, .4, .5, .37], [.4, .58, .6, .38], [.58, .52, .62, .5], [.52, .72, .74, .5]];
    out += zoom(960, 748, pk, `<rect x="810" y="610" width="300" height="138" rx="16" fill="#fff" stroke="${C.tealD}" stroke-width="5"/>${bars(99, { x: 830, y: 620, w: 260, h: 118, data: pdat, t0: 0, dt: 0, bw: 28 })}`);
    out += pill(960, 860, 'the price in front of you', C.tealD, pop(r, 15.6), 26);
    if (r > 15) out += A.sparkle(960, 640, s.start + 15.4, t, C.teal);
    return out;
  };

  /* ===== L23 B: price interrogation ===== */
  LIVE['s9-candle-interview'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="330" width="1920" height="640" fill="${C.purpleL}" opacity=".18"/>` + ground(960, '#F3ECF6', '#E2DAF0');
    // Swinging lamp and its light.
    const la = Math.sin(t * 1.6) * 5, lx = 1400 + Math.sin(rad(la)) * 130, ly = 330 + Math.cos(rad(la)) * 130;
    out += `<path d="M${lx - 40},${ly + 20} L${lx + 40},${ly + 20} L1580,940 L1220,940 Z" fill="${C.gold}" opacity=".13"/>
      <line x1="1400" y1="330" x2="${lx}" y2="${ly}" stroke="${C.dark}" stroke-width="4"/>
      <path d="M${lx - 46},${ly + 24} L${lx - 22},${ly - 8} L${lx + 22},${ly - 8} L${lx + 46},${ly + 24} Z" fill="${C.purple}"/><ellipse cx="${lx}" cy="${ly + 26}" rx="22" ry="8" fill="#FFF3C4"/>`;
    const mx = lx + Math.cos(t * 3) * 80, my = ly + 10 + Math.sin(t * 4.4) * 34, mf = Math.sin(t * 40) * 10;
    out += `<g transform="translate(${mx},${my})"><ellipse cx="-8" cy="0" rx="10" ry="${6 + mf * 0.3}" fill="${C.purpleL}"/><ellipse cx="8" cy="0" rx="10" ry="${6 - mf * 0.3}" fill="${C.purpleL}"/><ellipse rx="4" ry="8" fill="${C.muted}"/></g>`;
    // Table.
    out += `<rect x="1000" y="860" width="230" height="16" rx="6" fill="${C.muted}"/><rect x="1020" y="876" width="12" height="84" fill="${C.muted}"/><rect x="1198" y="876" width="12" height="84" fill="${C.muted}"/>`;
    // The candle suspect.
    const qs = [
      ['Where did you close?', 'Back below the level', 2.0], ['Did you hold beyond it?', 'No', 3.8], ['How fast did you move?', 'Big candles', 6.2],
      ['Clean, or overlapping?', 'Clean', 7.6], ['Did structure change?', 'Not yet', 9.0]];
    let nod = 0;
    qs.forEach(q => { nod = Math.max(nod, inout(r, q[2] + 0.8, q[2] + 1.6, 0.2)); });
    const shrug = r > 14.6 && r < 18.5;
    const ck = pop(r, 0.3, 0.7);
    const cx = 1400, base = 900, b = blink(t, 3);
    const nr = nod * Math.sin(t * 12) * 6;
    out += `<rect x="1330" y="900" width="140" height="18" rx="8" fill="${C.peach}"/><rect x="1346" y="918" width="12" height="42" fill="${C.peach}"/><rect x="1442" y="918" width="12" height="42" fill="${C.peach}"/>`;
    out += zoom(cx, base, ck, `<g transform="rotate(${nr} ${cx} ${base})">
      <line x1="${cx}" y1="600" x2="${cx}" y2="${base}" stroke="${C.tealD}" stroke-width="8" stroke-linecap="round"/>
      <rect x="${cx - 60}" y="640" width="120" height="236" rx="16" fill="${C.teal}"/>
      <path d="M${cx - 60},${720} L${cx - 96},${shrug ? 660 : 760}" stroke="${C.tealD}" stroke-width="12" stroke-linecap="round"/><path d="M${cx + 60},720 L${cx + 96},${shrug ? 660 : 760}" stroke="${C.tealD}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="${cx - 22}" cy="700" r="12" fill="#fff"/><circle cx="${cx + 22}" cy="700" r="12" fill="#fff"/>
      <ellipse cx="${cx - 22 + (shrug ? 4 : -3)}" cy="${700 + (shrug ? -4 : 0)}" rx="6" ry="${6 * (1 - b * 0.9)}" fill="${C.dark}"/><ellipse cx="${cx + 22 + (shrug ? 4 : -3)}" cy="${700 + (shrug ? -4 : 0)}" rx="6" ry="${6 * (1 - b * 0.9)}" fill="${C.dark}"/>
      <path d="${shrug ? `M${cx - 14},744 L${cx + 14},744` : `M${cx - 14},738 Q${cx},752 ${cx + 14},738`}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="${cx - 38}" cy="724" rx="9" ry="5" fill="${C.pink}" opacity=".5"/><ellipse cx="${cx + 38}" cy="724" rx="9" ry="5" fill="${C.pink}" opacity=".5"/></g>`);
    // Answers from the candle.
    qs.forEach(([, ans, at], i) => {
      const nxt = i < qs.length - 1 ? qs[i + 1][2] : 10.8;
      const o = inout(r, at + 0.8, nxt, 0.2);
      if (o > 0) out += A.bubble(1630, 580, ans, { op: o, sc: 0.8 + 0.2 * o, size: 28, weight: 700, tail: 'left', color: TD });
    });
    const so = inout(r, 14.6, 18.4, 0.25);
    if (so > 0) out += A.bubble(1640, 580, 'Can’t say!', { op: so, sc: 0.8 + 0.2 * so, size: 30, weight: 900, tail: 'left', color: PD }) + qmarks(1400, 600, t);
    // The detective.
    const det = { x: 290, y: 960, scale: 0.9, look: A.LOOKS.c, seed: 2, talk: ctx.talking && r < 15,
      frontArm: { a1: -30, a2: -60 + Math.sin(t * 2) * 6 },
      hold: `<g transform="rotate(-30)"><rect x="-6" y="0" width="12" height="46" rx="5" fill="${C.dark}"/><circle cx="0" cy="-22" r="26" fill="#fff" fill-opacity=".4" stroke="${C.dark}" stroke-width="7"/></g>` };
    out += P(t, det) + fedora(det);
    // Question list.
    qs.forEach(([q, , at], i) => {
      const k = pop(r, at, 0.5);
      if (k <= 0) return;
      const y = 430 + i * 82, done = r > at + 1.0;
      out += zoom(800, y, k, `<rect x="510" y="${y - 32}" width="600" height="64" rx="32" fill="#fff" stroke="${done ? C.teal : '#F1E7E1'}" stroke-width="3"/>
        <text x="546" y="${y + 10}" font-size="28" font-weight="700" fill="${C.dark}" font-family="DM Sans">${q}</text>
        ${done ? `<g transform="translate(1076,${y}) scale(${pop(r, at + 1.0, 0.4)})"><circle r="22" fill="${C.teal}"/><path d="M-10,0 L-3,8 L11,-8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}`);
    });
    const wk = pop(r, 13.8, 0.5);
    if (wk > 0) {
      const done = r > 14.8;
      out += zoom(800, 868, wk, `<rect x="510" y="836" width="600" height="64" rx="32" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="3" stroke-dasharray="${done ? '0' : '10 8'}"/>
        <text x="546" y="878" font-size="28" font-weight="700" fill="${PD}" font-family="DM Sans">Who was buying?</text>
        ${done ? `<g transform="translate(1076,868) scale(${pop(r, 14.8, 0.4)})"><circle r="22" fill="${C.pink}"/><path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>` : ''}`);
    }
    if (r > 17.2) out += A.sparkle(800, 590, s.start + 17.2, t, C.teal);
    return out;
  };

  /* ===== L24 A: the quiz show where the chart is the contestant ===== */
  LIVE['s9-quiz-show'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="900" width="1920" height="180" fill="${C.purpleL}" opacity=".5"/><rect x="0" y="900" width="1920" height="10" fill="${C.purple}" opacity=".5"/>`;
    // Curtains and marquee lights.
    const curtain = (x0, dir) => `<path d="M${x0},330 L${x0 + dir * 150},330 Q${x0 + dir * 110},620 ${x0 + dir * 150},960 L${x0},960 Z" fill="${C.pink}"/>${[0, 1, 2].map(i => `<path d="M${x0 + dir * (30 + i * 40)},340 Q${x0 + dir * (20 + i * 40)},640 ${x0 + dir * (34 + i * 40)},950" stroke="${C.pinkL}" stroke-width="6" fill="none" opacity=".6"/>`).join('')}`;
    out += curtain(0, 1) + curtain(1920, -1);
    for (let i = 0; i < 22; i++) out += `<circle cx="${200 + i * 72}" cy="350" r="9" fill="${(i + Math.floor(t * 4)) % 2 ? C.gold : '#FFF3C4'}"/>`;
    // Host.
    const host = { x: 380, y: 900, scale: 0.9, look: A.LOOKS.d, seed: 5, talk: ctx.talking, frontArm: { a1: -40, a2: -100 },
      hold: `<g><rect x="-6" y="-6" width="12" height="40" rx="5" fill="${C.dark}"/><circle cx="0" cy="-14" r="14" fill="${C.muted}"/></g>` };
    out += P(t, host);
    // Questions.
    const Q = [[4.8, 'Where did price close?', 1], [8.2, 'Who was buying?', 0], [12.4, 'Did it hold above the level?', 1], [14.6, 'Why did they sell?', 0], [17.6, 'What happens next?', 0]];
    let cur = -1;
    Q.forEach((q, i) => { if (r >= q[0]) cur = i; });
    if (cur >= 0) {
      const [at, text, can] = Q[cur];
      const k = pop(r, at, 0.5);
      out += zoom(790, 500, k, `<rect x="540" y="444" width="500" height="112" rx="26" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
        <circle cx="590" cy="500" r="30" fill="${C.purple}"/><text x="590" y="512" font-size="32" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">Q</text>
        <text x="${640}" y="510" font-size="${text.length > 22 ? 25 : 29}" font-weight="700" fill="${C.dark}" font-family="DM Sans">${text}</text>`);
      const vk = pop(r, at + 1.1, 0.5);
      out += pill(790, 612, can ? 'CAN ANSWER' : 'CAN’T ANSWER', can ? C.tealD : C.pink, vk, 30);
    }
    const ans = cur >= 0 && r > Q[cur][0] + 1.1 ? Q[cur][2] : -1;
    // TV contestant.
    const tvk = pop(r, 0.4, 0.8);
    const sx = 1090, sy = 560, sw = 320, sh = 200;
    const cdat = [[.3, .42, .45, .26], [.42, .36, .46, .32], [.36, .52, .55, .34], [.52, .48, .58, .45], [.48, .64, .66, .46], [.64, .74, .78, .6], [.74, .7, .78, .66], [.7, .72, .75, .66]];
    let scr = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="14" fill="#fff"/>` + bars(r, { x: sx + 10, y: sy + 10, w: sw - 20, h: sh - 20, data: cdat, t0: 1.0, dt: 0.25, bw: 22 }) +
      `<line x1="${sx + 10}" x2="${sx + sw - 10}" y1="${sy + 10 + (1 - 0.6) * (sh - 20)}" y2="${sy + 10 + (1 - 0.6) * (sh - 20)}" stroke="${C.peach}" stroke-width="3" stroke-dasharray="8 6"/>`;
    if (ans === 1) scr += `<circle cx="${sx + 10 + (sw - 20) / 8 * 5.5}" cy="${sy + 10 + (1 - 0.74) * (sh - 20)}" r="${18 + Math.sin(t * 8) * 3}" fill="none" stroke="${C.tealD}" stroke-width="5"/>`;
    if (ans === 0) {
      const f = Math.floor(t * 12);
      for (let i = 0; i < 70; i++) { const h = ((i * 7919 + f * 104729) % 1000) / 1000, h2 = ((i * 15485863 + f * 7) % 1000) / 1000; scr += `<rect x="${sx + h * (sw - 14)}" y="${sy + h2 * (sh - 8)}" width="14" height="6" fill="${i % 3 ? C.muted : '#fff'}" opacity=".8"/>`; }
      scr += `<text x="${sx + sw / 2}" y="${sy + sh / 2 + 34}" font-size="96" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">?</text>`;
    }
    const b = blink(t, 6), bob = Math.sin(t * 2.4) * 4;
    out += `<rect x="1100" y="820" width="300" height="140" rx="16" fill="${C.pinkL}"/><rect x="1100" y="820" width="300" height="20" rx="10" fill="${C.pink}"/>
      <ellipse cx="1250" cy="${820}" rx="46" ry="${ans >= 0 ? 30 : 24}" fill="${ans === 1 ? C.teal : ans === 0 ? C.pink : C.muted}"/>
      ${ans >= 0 ? `<ellipse cx="1250" cy="812" rx="70" ry="44" fill="${ans === 1 ? C.teal : C.pink}" opacity="${0.2 + 0.15 * Math.sin(t * 10)}"/>` : ''}`;
    out += zoom(1250, 800, tvk, `<g transform="translate(0,${bob})">
      <line x1="1200" y1="500" x2="1150" y2="440" stroke="${C.purple}" stroke-width="5"/><line x1="1300" y1="500" x2="1350" y2="440" stroke="${C.purple}" stroke-width="5"/>
      <circle cx="1150" cy="440" r="10" fill="${C.gold}"/><circle cx="1350" cy="440" r="10" fill="${C.gold}"/>
      <rect x="1060" y="500" width="380" height="290" rx="34" fill="${C.purple}"/>
      <ellipse cx="1205" cy="530" rx="9" ry="${9 * (1 - b * 0.9)}" fill="#fff"/><ellipse cx="1295" cy="530" rx="9" ry="${9 * (1 - b * 0.9)}" fill="#fff"/>
      ${scr}
      <path d="${ans === 0 ? 'M1225,778 q12,-8 25,0 q12,8 25,0' : 'M1225,772 Q1250,788 1275,772'}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`);
    // Scoreboard.
    const canN = Q.filter((q, i) => i <= cur && r > q[0] + 1.1 && q[2]).length, cantN = Q.filter((q, i) => i <= cur && r > q[0] + 1.1 && !q[2]).length;
    out += card(1530, 420, 230, 150, pop(r, 3.6), `<text x="1590" y="470" font-size="20" font-weight="900" text-anchor="middle" fill="${TD}" font-family="DM Sans">CAN</text><text x="1700" y="470" font-size="20" font-weight="900" text-anchor="middle" fill="${PD}" font-family="DM Sans">CAN’T</text>
      <text x="1590" y="540" font-size="60" font-weight="900" text-anchor="middle" fill="${TD}" font-family="Playfair Display">${canN}</text><text x="1700" y="540" font-size="60" font-weight="900" text-anchor="middle" fill="${PD}" font-family="Playfair Display">${cantN}</text>`);
    // Audience heads.
    const hairs = ['#2C1810', '#7A4A2A', '#C27A3A', '#1E120C', '#3A2318'];
    for (let i = 0; i < 9; i++) {
      const x = 260 + i * 175, y = 1050 + Math.abs(Math.sin(t * 3 + i * 1.3)) * -10 * (ans >= 0 ? 1.6 : 0.4);
      out += `<circle cx="${x}" cy="${y}" r="52" fill="${hairs[i % 5]}"/><rect x="${x - 70}" y="${y + 30}" width="140" height="80" rx="40" fill="${[C.teal, C.peach, C.purple, C.pink][i % 4]}"/>`;
    }
    return out;
  };

  /* ===== L24 B: the evidence corkboard ===== */
  LIVE['s9-cork-board'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const bk = pop(r, 0.2, 0.8);
    let speck = '';
    for (let i = 0; i < 60; i++) speck += `<circle cx="${540 + (i * 197) % 1220}" cy="${400 + (i * 113) % 520}" r="${2 + i % 3}" fill="${C.peach}" opacity=".35"/>`;
    out += zoom(1150, 660, bk, `<rect x="510" y="372" width="1280" height="576" rx="22" fill="${C.muted}"/><rect x="528" y="390" width="1244" height="540" rx="12" fill="${C.peachL}" opacity=".55"/>${speck}
      <line x1="940" y1="470" x2="940" y2="910" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 10" opacity=".5"/><line x1="1360" y1="470" x2="1360" y2="910" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 10" opacity=".5"/>`);
    out += pill(730, 432, 'SHOWS', C.tealD, pop(r, 0.6), 24) + pill(1150, 432, 'MAY INFER', C.peach, pop(r, 0.8), 24) + pill(1570, 432, 'CANNOT PROVE', C.pink, pop(r, 1.0), 24);
    // Exhibit photo of the chart.
    const ek = pop(r, 1.0, 0.6);
    const ed = [[.2, .32, .34, .18], [.32, .28, .36, .24], [.28, .5, .52, .26], [.5, .66, .7, .48], [.66, .62, .7, .58], [.62, .7, .74, .6]];
    out += zoom(1150, 820, ek, `<g transform="rotate(-3 1150 820)"><rect x="1000" y="750" width="300" height="150" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <line x1="1014" x2="1286" y1="${760 + (1 - 0.48) * 130}" y2="${760 + (1 - 0.48) * 130}" stroke="${C.peach}" stroke-width="3" stroke-dasharray="7 6"/>
      ${bars(99, { x: 1014, y: 760, w: 272, h: 130, data: ed, t0: 0, dt: 0, bw: 22 })}<circle cx="1150" cy="756" r="10" fill="${C.pink}"/></g>`);
    // Notes.
    const notes = [[730, 540, 'Closed above', 'the prior high', 3.2, C.tealL], [730, 680, 'Held above it for', 'several candles', 5.6, C.tealL],
      [1150, 540, 'Buyers appear', 'more aggressive', 8.4, '#FFF0D9'], [1570, 540, 'Big funds', 'are buying', 12.4, C.pinkP], [1570, 680, 'Price will keep', 'going higher', 14.4, C.pinkP]];
    const pinner = { x: 290, y: 960, scale: 0.9, look: A.LOOKS.a, seed: 4 };
    const throwing = notes.some(n => r > n[4] - 0.8 && r < n[4] + 0.1);
    pinner.frontArm = throwing ? { a1: -40, a2: -50 } : undefined;
    pinner.talk = false;
    out += P(t, pinner);
    const hp = handPos(pinner);
    notes.forEach(([x, y, l1, l2, at, col], i) => {
      if (r < at - 0.8) return;
      let nx = hp.x + 10, ny = hp.y - 30, sc = 0.5, rot = -8;
      if (r >= at) { const k = ease((r - at) / 0.7); nx = lerp(hp.x + 10, x, k); ny = lerp(hp.y - 30, y, k) - Math.sin(k * Math.PI) * 120; sc = lerp(0.5, 1, k); rot = lerp(-8, (i % 2 ? 2 : -2), k); }
      const landed = r > at + 0.7, cannot = x > 1400;
      out += `<g transform="translate(${nx},${ny}) rotate(${rot}) scale(${sc})"><rect x="-176" y="-52" width="352" height="104" rx="8" fill="${col}" stroke="${cannot && landed ? C.pink : 'none'}" stroke-width="3" stroke-dasharray="10 7"/>
        <text y="-6" font-size="26" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">${l1}</text><text y="28" font-size="26" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">${l2}</text>
        ${landed ? `<circle cx="0" cy="-48" r="${11 * pop(r, at + 0.7, 0.3)}" fill="${cannot ? C.pink : C.purple}" stroke="#fff" stroke-width="3"/>` : ''}</g>`;
    });
    // Red string from the facts to the inference.
    const sk = ease(seg(r, 9.2, 10.4));
    if (sk > 0) {
      out += `<path d="M730,488 Q940,440 ${lerp(730, 1150, sk)},${lerp(488, 488, sk)}" fill="none" stroke="${C.pink}" stroke-width="4"/>
        <path d="M730,628 Q960,620 ${lerp(730, 1150, sk)},${lerp(628, 490, sk)}" fill="none" stroke="${C.pink}" stroke-width="4"/>`;
    }
    // Dangling string and the cat.
    const sw = Math.sin(t * 3) * 18;
    out += `<path d="M1700,948 Q${1700 + sw},990 ${1690 + sw * 1.6},1020" fill="none" stroke="${C.pink}" stroke-width="4"/>`;
    const paw = Math.max(0, Math.sin(t * 3 + 1));
    out += cat(t, { x: 1800, y: 1040, s: 0.75, col: C.peach, seed: 2, flip: true, lookX: -1 });
    out += `<ellipse cx="${1760 - paw * 40}" cy="${940 - paw * 40}" rx="14" ry="11" fill="${C.peach}"/>`;
    if (r > 17.8) out += A.sparkle(1150, 660, s.start + 17.8, t);
    return out;
  };

  /* ===== L25 A: the courtroom ===== */
  LIVE['s9-courtroom'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="330" width="1920" height="640" fill="${C.peachL}" opacity=".18"/>` + ground(960);
    [620, 1300].forEach(x => { out += `<rect x="${x - 26}" y="360" width="52" height="600" rx="8" fill="#fff" opacity=".7"/><rect x="${x - 40}" y="350" width="80" height="22" rx="6" fill="#fff" opacity=".8"/>`; });
    // Exhibit easel.
    const ek = pop(r, 0.3, 0.7);
    const ed = [[.84, .72, .86, .68], [.72, .6, .74, .56], [.6, .45, .62, .4], [.45, .34, .47, .3], [.34, .46, .48, .32], [.46, .54, .57, .43], [.54, .46, .56, .42], [.46, .4, .48, .37], [.4, .44, .46, .16], [.44, .6, .62, .42], [.6, .76, .78, .58]];
    const X0 = 1370, Y0 = 470, W = 380, H = 320, Yv = v => Y0 + H - v * H;
    let ch = bars(r, { x: X0, y: Y0, w: W, h: H, data: ed.slice(0, 8), t0: 0.6, dt: 0.22, bw: 20 }).replace(/<rect/g, '<rect') +
      bars(r, { x: X0 + W / 11 * 8, y: Y0, w: W / 11 * 3, h: H, data: ed.slice(8), t0: 5.4, dt: 0.6, bw: 20 });
    const lk = ease(seg(r, 2.2, 3.0));
    if (lk > 0) ch += `<line x1="${X0}" x2="${X0 + W * lk}" y1="${Yv(0.3)}" y2="${Yv(0.3)}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="12 8"/>` + pill(X0 + 70, Yv(0.3) + 30, 'prior low', C.purple, pop(r, 2.6), 18);
    if (r > 6.4) ch += `<circle cx="${X0 + W / 11 * 8.5}" cy="${Yv(0.2)}" r="${30 + Math.sin(t * 6) * 3}" fill="none" stroke="${C.tealD}" stroke-width="5"/>`;
    out += zoom(1560, 640, ek, `<path d="M1460,960 L1560,400 L1660,960 M1560,400 L1560,960" stroke="${C.muted}" stroke-width="12" stroke-linecap="round"/>
      <rect x="1340" y="430" width="440" height="390" rx="14" fill="#fff" stroke="${C.muted}" stroke-width="6"/>${ch}`);
    out += pill(1560, 410, 'EXHIBIT A', C.pink, pop(r, 0.6), 22);
    out += pill(1560, 880, 'dipped below, closed back above', C.tealD, pop(r, 7.0), 22);
    // Owl judge behind the bench.
    const ask = r > 14.2 && r < 19.0;
    out += owl(t, { x: 960, y: 610, tilt: ask ? Math.sin(t * 2) * 8 : 0, lookX: r < 10 ? 1 : r < 14 ? -1 : 0 });
    if (ask) out += qmarks(1100, 480, t, 3);
    // Gavel.
    const lift = ease(seg(r, 18.8, 19.3)), slam = r > 19.3 ? ease(seg(r, 19.3, 19.45)) : 0, rel = ease(seg(r, 20.2, 20.8));
    const gA = lerp(lerp(-20, -75, lift), 12, slam) * (1 - rel) + (-20) * rel;
    out += `<g transform="translate(1060,600) rotate(${gA})"><rect x="0" y="-7" width="110" height="14" rx="7" fill="${C.muted}"/><rect x="96" y="-24" width="34" height="48" rx="8" fill="${C.dark}"/></g>`;
    out += `<rect x="740" y="630" width="440" height="330" rx="14" fill="${C.peachL}"/><rect x="726" y="620" width="468" height="30" rx="10" fill="${C.peach}"/>
      <rect x="1120" y="608" width="60" height="16" rx="6" fill="${C.dark}"/>
      <text x="960" y="790" font-size="30" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="Playfair Display" letter-spacing="2">COURT OF CHARTS</text>`;
    if (r > 19.3 && r < 20.3) { const p = seg(r, 19.3, 20.3); out += [0, 1, 2, 3, 4].map(i => { const a = rad(-160 + i * 35); return `<line x1="${1150 + Math.cos(a) * (30 + p * 40)}" y1="${612 + Math.sin(a) * (30 + p * 40)}" x2="${1150 + Math.cos(a) * (60 + p * 60)}" y2="${612 + Math.sin(a) * (60 + p * 60)}" stroke="${C.gold}" stroke-width="6" stroke-linecap="round" opacity="${1 - p}"/>`; }).join(''); }
    // Prosecutor with the story.
    const pros = { x: 330, y: 960, scale: 0.9, look: A.LOOKS.seller, seed: 5, talk: r > 10.4 && r < 13.4, mood: r > 19.6 ? 'sad' : undefined,
      frontArm: r > 10.4 && r < 14 ? { a1: -30, a2: -50 + Math.sin(t * 8) * 8 } : undefined };
    out += `<rect x="170" y="850" width="330" height="18" rx="6" fill="${C.muted}"/><rect x="190" y="868" width="14" height="92" fill="${C.muted}"/><rect x="466" y="868" width="14" height="92" fill="${C.muted}"/>`;
    out += P(t, pros);
    [['Stop hunt!', 10.4, 400, 560], ['Manipulation!', 11.6, 360, 470]].forEach(([txt, at, x, y]) => {
      const o = inout(r, at, 18.6, 0.3);
      if (o > 0) out += A.bubble(x, y, txt, { op: o, sc: 0.8 + 0.2 * o, size: 32, weight: 900, tail: 'left', color: PD, fill: C.pinkP, stroke: C.pinkL });
    });
    out += pill(720, 1016, 'OBSERVED: the sweep', C.tealD, pop(r, 19.5), 26) + pill(1220, 1016, 'NOT ON THE CHART: intent', C.pink, pop(r, 20.2), 26);
    if (r > 19.5) out += A.sparkle(720, 1016, s.start + 19.5, t, C.teal);
    return out;
  };

  /* ===== L25 B: a house on rock, a house on a cloud ===== */
  LIVE['s9-cloud-house'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    // Rock.
    out += `<path d="M250,962 Q260,860 360,846 L800,840 Q900,850 910,962 Z" fill="${C.muted}" opacity=".45"/><path d="M330,900 L380,880 M700,890 L760,872" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
    // Foundation slab drops in, block by block.
    [0, 1, 2].forEach(i => {
      const k = ease(seg(r, 2.2 + i * 0.25, 2.6 + i * 0.25));
      if (k <= 0) return;
      out += `<rect x="${400 + i * 120}" y="${800 - (1 - k) * 300}" width="120" height="40" rx="6" fill="${C.teal}" stroke="#fff" stroke-width="3"/>`;
    });
    out += pill(580, 908, 'OBSERVATION', C.tealD, pop(r, 3.0), 26);
    const wk = ease(seg(r, 7.4, 8.0));
    if (wk > 0) out += `<g transform="translate(0,${-(1 - wk) * 400})"><rect x="430" y="620" width="300" height="180" rx="8" fill="${C.peachL}" stroke="${C.peach}" stroke-width="4"/>
      <rect x="590" y="700" width="70" height="100" rx="8" fill="${C.peach}"/><circle cx="645" cy="752" r="5" fill="${C.dark}"/>
      <rect x="460" y="650" width="80" height="64" rx="8" fill="${C.tealL}" stroke="#fff" stroke-width="4"/></g>`;
    out += pill(580, 584, 'INTERPRETATION', C.peach, pop(r, 8.0), 22) ;
    const rk = ease(seg(r, 9.0, 9.6));
    if (rk > 0) out += `<g transform="translate(0,${-(1 - rk) * 400})"><path d="M400,624 L580,500 L760,624 Z" fill="${C.pink}"/><rect x="680" y="520" width="34" height="64" fill="${C.pinkL}"/></g>`;
    if (rk >= 1) out += pill(580, 584, 'INTERPRETATION', C.peach, 1, 22);
    if (r > 9.6) out += A.sparkle(580, 520, s.start + 9.6, t, C.teal);
    if (r > 10.4) { const k = seg(r, 10.4, 11.4); out += bird(t, { x: lerp(300, 580, ease(k)), y: lerp(420, 500, ease(k)), s: 1, col: C.teal, wing: C.tealL, flying: k < 1, flip: false }); }
    // Builder 1.
    const b1 = { x: 170, y: 960, scale: 0.85, look: A.LOOKS.c, seed: 3, frontArm: r > 9.6 && r < 12 ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : undefined };
    out += P(t, b1) + hardHat(b1);
    // Cloud house.
    const ck = pop(r, 12.4, 0.7);
    const gone = seg(r, 18.4, 19.6);
    const fallK = seg(r, 18.6, 19.3);
    const cloudC = [[-150, 20, 60], [-80, -10, 76], [0, -24, 86], [90, -6, 74], [160, 22, 56], [0, 30, 70], [-90, 34, 54], [90, 36, 56]];
    if (ck > 0 && gone < 1) out += zoom(1420, 660, ck, cloudC.map(([dx, dy, R], i) => {
      const a = Math.atan2(dy + 10, dx || 1), d = gone * 160;
      return `<circle cx="${1420 + dx + Math.cos(a) * d}" cy="${670 + dy + Math.sin(a) * d * 0.6 + Math.sin(t * 1.5 + i) * 4}" r="${R}" fill="#fff" stroke="${C.purpleL}" stroke-width="4" opacity="${1 - gone}"/>`;
    }).join(''));
    if (ck > 0 && gone < 0.6) out += pill(1420, 762, '“banks are hunting stops”', C.pink, ck * (1 - gone / 0.6), 22);
    const hk = pop(r, 13.2, 0.7);
    if (hk > 0) {
      const landed = r > 19.3;
      const dy = landed ? 960 - 640 : fallK * fallK * (960 - 640);
      const rot = landed ? 18 : fallK * 18;
      const sq = landed ? 0.82 : 1;
      out += `<g transform="translate(1420,${640 + dy}) rotate(${rot}) scale(${hk},${hk * sq}) translate(-1420,-640)">
        <rect x="1330" y="530" width="180" height="110" rx="6" fill="${C.pinkP}" stroke="${C.pinkL}" stroke-width="4"/>
        <path d="M1310,534 L1420,456 L1530,534 Z" fill="${C.purple}"/><rect x="1400" y="580" width="44" height="60" rx="6" fill="${C.pinkL}"/>
        <rect x="1350" y="556" width="36" height="32" rx="5" fill="${C.purpleL}"/></g>`;
      if (landed) out += puffs(1420, 950, 19.3, r, 12, 110);
    }
    out += pill(1420, 412, 'UNSUPPORTED CLAIM', C.pink, pop(r, 13.0) * (1 - clamp((r - 18.2) / 0.3)), 24);
    // Builder 2, proud then not.
    const b2 = { x: 1770, y: 960, scale: 0.85, look: A.LOOKS.b, seed: 6, flip: true, mood: r > 19.3 ? 'sad' : undefined,
      frontArm: r > 13.4 && r < 18.4 ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : r > 19.3 ? { a1: -100, a2: -150 } : undefined };
    out += P(t, b2) + hardHat(b2);
    return out;
  };

  /* ===== L26 A: the trader's eye exam ===== */
  const EYE = { swings: [[0, .32], [.16, .12], [.34, .5], [.48, .3], [.72, .86], [.86, .62], [1, .7]], seed: 11, per: 30 };
  LIVE['s9-eye-exam'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const x0 = 1000, y0 = 440, w = 760, h = 380, X = u => x0 + 20 + u * (w - 40), Y = v => y0 + h - 20 - v * (h - 60);
    const pk = pop(r, 0.2, 0.7);
    const mess = r > 7.0 && r < 13.8;
    const on = k => {
      const at = { st: 3.2, lv: 4.2, lq: 5.0, dl: 5.8, pa: 6.6 }[k];
      if (r < at) return 0;
      if (r >= 13.8) return (k === 'st' || k === 'pa') ? 1 : 0;
      return ease((r - at) / 0.4);
    };
    let layers = '';
    if (on('st')) layers += `<g opacity="${on('st')}"><polyline points="${EYE.swings.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ')}" fill="none" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 8"/>` +
      pill(X(.48), Y(.3) + 36, 'HL', C.purple, 1, 20) + pill(X(.72), Y(.86) - 34, 'HH', C.purple, 1, 20) + '</g>';
    if (on('lv')) layers += `<g opacity="${on('lv')}"><line x1="${X(.4)}" x2="${X(1)}" y1="${Y(.3)}" y2="${Y(.3)}" stroke="${C.peach}" stroke-width="5"/></g>`;
    if (on('lq')) layers += `<g opacity="${on('lq')}"><line x1="${X(.6)}" x2="${X(1)}" y1="${Y(.95)}" y2="${Y(.95)}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="6 6"/><text x="${X(.98)}" y="${Y(.95) - 10}" font-size="22" font-weight="900" text-anchor="end" fill="${C.gold}" font-family="DM Sans">$$$</text></g>`;
    if (on('dl')) layers += `<g opacity="${on('dl')}"><rect x="${X(.56)}" y="${Y(.66)}" width="${X(.64) - X(.56)}" height="${Y(.5) - Y(.66)}" fill="${C.purpleL}" opacity=".7"/><text x="${X(.6)}" y="${Y(.58) + 7}" font-size="18" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans">FVG</text></g>`;
    if (on('pa')) layers += `<g opacity="${on('pa')}"><path d="M${X(.44)},${Y(.2)} Q${X(.5)},${Y(.45)} ${X(.6)},${Y(.62)}" fill="none" stroke="${C.tealD}" stroke-width="7" stroke-linecap="round"/><path d="M${X(.6) - 22},${Y(.62) + 2} L${X(.6)},${Y(.62)} L${X(.6) - 4},${Y(.62) + 22}" fill="none" stroke="${C.tealD}" stroke-width="7" stroke-linecap="round"/>` +
      pill(X(.3), Y(.06), 'buyers appeared aggressive', C.tealD, 1, 17) + '</g>';
    let junk = '';
    if (mess) {
      const jk = ease(seg(r, 7.0, 8.4));
      junk = `<g opacity="${jk}">${[.15, .42, .58, .78].map((v, i) => `<line x1="${x0 + 20}" x2="${x0 + w - 20}" y1="${Y(v)}" y2="${Y(v)}" stroke="${[C.gold, C.purple, C.teal, C.pink][i]}" stroke-width="3"/>`).join('')}
        <rect x="${X(.05)}" y="${Y(.6)}" width="${X(.3) - X(.05)}" height="${Y(.4) - Y(.6)}" fill="${C.pinkL}" opacity=".5"/><rect x="${X(.75)}" y="${Y(.55)}" width="${X(.95) - X(.75)}" height="${Y(.4) - Y(.55)}" fill="${C.tealL}" opacity=".6"/>
        ${[['S&amp;D', .1, .65], ['ACC?', .25, .9], ['VWAP', .82, .45], ['delta +', .62, .2], ['fib .618', .9, .25], ['EQH', .66, .98]].map(([tx, u, v], i) => `<text x="${X(u)}" y="${Y(v)}" font-size="24" font-weight="900" fill="${[C.pink, C.purple, C.gold, C.tealD, C.peach, C.dark][i]}" font-family="DM Sans" transform="rotate(${(i % 3 - 1) * 8} ${X(u)} ${Y(v)})">${tx}</text>`).join('')}
        <path d="M${X(.1)},${Y(.2)} Q${X(.5)},${Y(1.1)} ${X(.95)},${Y(.1)}" fill="none" stroke="${C.gold}" stroke-width="4"/></g>`;
    }
    const blurAmt = mess ? 1.6 + Math.sin(t * 3) * 0.8 : 0;
    const chart = A.swingChart(t, Object.assign(EYE, { x: x0 + 20, y: y0 + 40, w: w - 40, h: h - 60, t0: s.start + 0.6, t1: s.start + 2.6, maxBody: 14, wick: 3 }));
    out += zoom(x0 + w / 2, y0 + h / 2, pk, `<defs><filter id="s9blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${blurAmt.toFixed(2)}"/></filter></defs>
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="26" fill="#fff" stroke="${mess ? C.pinkL : '#F1E7E1'}" stroke-width="4"/>
      <g ${mess ? 'filter="url(#s9blur)"' : ''}>${chart}${layers}${junk}</g>`);
    if (r > 13.8) out += A.sparkle(x0 + w / 2, y0 + h / 2, s.start + 13.8, t, C.teal);
    // Lens toggles.
    const tg = [['Structure', 'st'], ['Levels', 'lv'], ['Liquidity', 'lq'], ['Delivery', 'dl'], ['Participation', 'pa']];
    tg.forEach(([lab, k], i) => {
      const x = 1000 + i * 130 + 60, isOn = on(k) > 0.5 || mess;
      out += zoom(x, 900, pop(r, 1.0 + i * 0.1, 0.4), `<rect x="${x - 62}" y="878" width="124" height="44" rx="22" fill="${isOn ? C.purple : '#fff'}" stroke="${C.purple}" stroke-width="3"/>
        <text x="${x}" y="907" font-size="${lab.length > 10 ? 15 : 18}" font-weight="900" text-anchor="middle" fill="${isOn ? '#fff' : C.purple}" font-family="DM Sans">${lab}</text>`);
    });
    out += zoom(1730, 900, pop(r, 1.6, 0.4), `<rect x="1676" y="878" width="96" height="44" rx="22" fill="${mess ? C.pink : '#fff'}" stroke="${C.pink}" stroke-width="3"/><text x="1724" y="907" font-size="18" font-weight="900" text-anchor="middle" fill="${mess ? '#fff' : C.pink}" font-family="DM Sans">ALL</text>`);
    // Optometrist and patient with the phoropter.
    const doc = { x: 210, y: 960, scale: 0.9, look: A.LOOKS.e, seed: 2, talk: r > 11.4 && r < 12.6 || r > 14 && r < 16,
      frontArm: { a1: -20, a2: -40 + Math.sin(t * 2) * 8 } };
    out += P(t, doc);
    const pat = { x: 640, y: 960, scale: 0.9, look: A.LOOKS.b, seed: 5, mood: mess && r > 9 ? 'sad' : undefined };
    out += P(t, pat);
    const hy = 960 - 282 * 0.9, dial = (r > 3 ? Math.floor((r - 3.2) / 0.8) : 0) * 45 + Math.sin(t * 2) * 5;
    out += `<path d="M640,${hy - 40} L640,560 L460,560 L460,960" fill="none" stroke="${C.muted}" stroke-width="10" stroke-linecap="round"/>
      <rect x="560" y="${hy - 34}" width="160" height="64" rx="26" fill="${C.purple}"/>
      ${[600, 680].map((x, i) => `<g transform="translate(${x},${hy - 2})"><circle r="27" fill="${C.purpleL}"/><circle r="19" fill="${mess ? C.pinkL : C.tealL}" opacity=".9"/><g transform="rotate(${dial * (i ? -1 : 1)})"><rect x="-3" y="-27" width="6" height="12" fill="${C.dark}"/></g></g>`).join('')}`;
    const pb = inout(r, 11.4, 13.6, 0.25);
    if (pb > 0) out += A.bubble(760, 560, 'Busier!', { op: pb, sc: 0.8 + 0.2 * pb, size: 32, weight: 900, tail: 'left', color: PD });
    const db = inout(r, 14.0, 21.0, 0.3);
    if (db > 0) out += A.bubble(300, 560, 'One lens at a time.', { op: db, sc: 0.8 + 0.2 * db, size: 28, weight: 700, tail: 'left' });
    return out;
  };

  /* ===== L26 B: the Market Read order ticket ===== */
  LIVE['s9-order-ticket'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    // Kitchen pass-through with a chef cat and the bell.
    out += `<rect x="1200" y="400" width="640" height="560" rx="10" fill="${C.pinkP}"/><rect x="1260" y="430" width="520" height="290" rx="10" fill="${C.purpleL}" opacity=".6"/>
      ${[0, 1, 2].map(i => `<circle cx="${1330 + i * 60}" cy="470" r="18" fill="none" stroke="${C.muted}" stroke-width="5" opacity=".5"/>`).join('')}`;
    const shake = inout(r, 11.6, 13.4, 0.2) * Math.sin(t * 10) * 12;
    out += cat(t, { x: 1420, y: 760, s: 1.05, col: C.cream, seed: 4, tilt: shake, hat: chefHat(0, -150, 0.9), lookX: 1 });
    out += `<rect x="1240" y="716" width="560" height="44" rx="10" fill="${C.peach}"/><rect x="1240" y="760" width="560" height="200" fill="${C.pinkL}"/>`;
    const tap = r > 15.2 ? 0 : Math.max(0, Math.sin(t * 2.4)) * 16;
    out += `<g transform="translate(1640,716)"><rect x="-40" y="-8" width="80" height="10" rx="4" fill="${C.muted}"/><path d="M-32,-8 Q-32,-52 0,-52 Q32,-52 32,-8 Z" fill="${C.gold}"/><circle cx="0" cy="-58" r="7" fill="${C.gold}"/></g>
      <ellipse cx="${1560}" cy="${700 - tap}" rx="20" ry="14" fill="${C.cream}" stroke="#EADFD8" stroke-width="2"/>`;
    out += pill(1640, 800, 'ENTRY MODEL', C.purple, pop(r, 1.0), 22);
    out += pill(1520, 880, 'decides execution', C.tealD, pop(r, 15.4), 26);
    // Waiter.
    out += P(t, { x: 250, y: 960, scale: 0.9, look: A.LOOKS.c, seed: 3, frontArm: r > 4.4 && r < 11 ? { a1: -14, a2: -30 } : undefined, talk: ctx.talking && r < 4 });
    // The pad.
    const pk = pop(r, 0.4, 0.7);
    const rows = [['Structure', 'Bullish: HL to HH', 4.6], ['Location', 'Pulling back above the HL', 5.2], ['Liquidity', 'Potential buy-side above HH', 5.8], ['Delivery', 'Displaced up, left an FVG', 6.4], ['Participation', '', 0], ['Execution', '', 0]];
    let pad = `<rect x="468" y="398" width="640" height="600" rx="10" fill="${C.dark}" opacity=".08"/><rect x="460" y="390" width="640" height="600" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <rect x="460" y="390" width="640" height="40" rx="10" fill="${C.pink}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${510 + i * 78}" cy="410" r="7" fill="#fff"/>`).join('')}
      <text x="500" y="490" font-size="40" font-weight="700" fill="${C.dark}" font-family="Playfair Display">Market Read</text>`;
    let pencil = null;
    const write = (x, y, txt, a, b, col = C.dark, id) => {
      const k = clamp((r - a) / (b - a));
      if (k <= 0) return '';
      if (k < 1) pencil = [x + k * 380, y];
      return `<clipPath id="s9ot${id}"><rect x="${x - 4}" y="${y - 34}" width="${k * 390}" height="48"/></clipPath><text x="${x}" y="${y}" font-size="26" font-style="italic" font-weight="700" fill="${col}" font-family="Playfair Display" clip-path="url(#s9ot${id})">${txt}</text>`;
    };
    rows.forEach(([lab, val, at], i) => {
      const y = 556 + i * 72;
      pad += `<text x="496" y="${y}" font-size="22" font-weight="900" fill="${C.muted}" font-family="DM Sans">${lab}</text><line x1="496" x2="1070" y1="${y + 18}" y2="${y + 18}" stroke="#F1E7E1" stroke-width="2"/>`;
      if (val) pad += write(696, y, val, at, at + 0.6, C.dark, i);
    });
    const py = 556 + 4 * 72;
    const wrongOp = 1 - clamp((r - 9.0) / 0.4);
    if (wrongOp > 0) pad += `<g opacity="${wrongOp}">${write(696, py, 'Banks are buying', 8.0, 8.5, PD, 'w')}${r > 8.6 ? `<line x1="692" x2="${692 + 230 * ease(seg(r, 8.6, 8.9))}" y1="${py - 9}" y2="${py - 9}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>` : ''}</g>`;
    pad += write(696, py, 'Buyers appeared aggressive', 9.4, 10.2, TD, 'p');
    const sk = r > 11.4 ? back((r - 11.4) / 0.4) : 0;
    if (sk > 0) pad += `<g transform="translate(830,${556 + 5 * 72 - 8}) rotate(-6) scale(${lerp(1.6, 1, Math.min(1, sk))})" opacity="${Math.min(1, sk)}"><rect x="-130" y="-28" width="260" height="56" rx="10" fill="none" stroke="${C.pink}" stroke-width="5"/><text y="10" font-size="28" font-weight="900" text-anchor="middle" fill="${PD}" font-family="DM Sans" letter-spacing="3">NOT PRESENT</text></g>`;
    const ck = r > 15.2 ? back((r - 15.2) / 0.4) : 0;
    if (ck > 0) pad += `<g transform="translate(985,478) rotate(10) scale(${lerp(1.5, 1, Math.min(1, ck))})" opacity="${Math.min(1, ck)}"><rect x="-96" y="-24" width="192" height="48" rx="10" fill="none" stroke="${C.purple}" stroke-width="5"/><text y="9" font-size="22" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans" letter-spacing="2">CONTEXT ONLY</text></g>`;
    out += zoom(780, 690, pk, pad);
    if (pencil) out += `<g transform="translate(${pencil[0]},${pencil[1] - 6}) rotate(35)"><rect x="-7" y="-80" width="14" height="70" rx="3" fill="${C.gold}"/><path d="M-7,-10 L7,-10 L0,6 Z" fill="#F3D6B4"/><rect x="-7" y="-90" width="14" height="12" rx="3" fill="${C.pink}"/></g>`;
    return out;
  };

  /* ===== L27 A: the overcomplicated trader's checklist ===== */
  LIVE['s9-scroll-checklist'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const items = [['Liquidity swept', 3.4], ['FVG filled', 4.2], ['Demand zone touched', 5.0], ['Buyers aggressive', 5.8], ['Accumulation confirmed', 7.2], ['Footprint delta positive', 8.1], ['Equal highs untouched', 9.0], ['Mercury not in retrograde', 9.8]];
    const shown = items.filter(it => r > it[1] - 0.2).length;
    const len = 110 + shown * 58;
    const bottom = Math.min(966, 410 + len);
    const rk = pop(r, 0.3, 0.7);
    // Roller and paper.
    let sc = `<rect x="640" y="410" width="480" height="${bottom - 410}" fill="${C.cream}" stroke="#EADFD8" stroke-width="3"/>
      <rect x="610" y="392" width="540" height="26" rx="13" fill="${C.muted}"/><circle cx="610" cy="405" r="18" fill="${C.peach}"/><circle cx="1150" cy="405" r="18" fill="${C.peach}"/>
      <text x="880" y="464" font-size="30" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">Before I take ANY trade</text>`;
    items.forEach(([txt, at], i) => {
      const k = pop(r, at, 0.4);
      if (k <= 0) return;
      const y = 520 + i * 58, strike = ease(seg(r, 17.2 + i * 0.15, 17.6 + i * 0.15));
      sc += `<g opacity="${Math.min(1, k)}"><rect x="672" y="${y - 22}" width="30" height="30" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="3"/>
        ${r > at + 0.3 ? `<path d="M678,${y - 8} L686,${y + 1} L698,${y - 16}" stroke="${C.tealD}" stroke-width="5" fill="none" stroke-linecap="round"/>` : ''}
        <text x="720" y="${y + 2}" font-size="25" font-weight="700" fill="${i === 7 ? C.purple : C.dark}" font-family="DM Sans">${txt}</text>
        ${strike > 0 ? `<line x1="716" x2="${716 + strike * 340}" y1="${y - 8}" y2="${y - 8}" stroke="${C.pink}" stroke-width="4"/>` : ''}</g>`;
    });
    out += zoom(880, 410, rk, sc);
    // The roll escapes along the floor.
    if (bottom >= 966) {
      const rollK = ease(seg(r, 9.8, 11.4)), rx = lerp(900, 1600, rollK);
      out += `<path d="M640,962 L${rx},962 L${rx},990 L640,990 Z" fill="${C.cream}" stroke="#EADFD8" stroke-width="3"/>
        <g transform="translate(${rx},962) rotate(${rollK * 720})"><circle r="30" fill="${C.cream}" stroke="#EADFD8" stroke-width="4"/><path d="M0,0 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0" fill="none" stroke="#EADFD8" stroke-width="3"/></g>`;
      const chase = r > 10 && r < 12;
      out += dog(t, { x: r < 10 ? 1760 : lerp(1760, 1720, 0) + 0, y: 990, s: 0.85, flip: true, excited: chase || r > 12, hop: chase });
    } else out += dog(t, { x: 1760, y: 990, s: 0.85, flip: true });
    // The trader.
    const me = { x: 460, y: 960, scale: 0.9, look: A.LOOKS.d, seed: 4, talk: ctx.talking && r < 10.4 && r > 3.2, mood: r > 11.4 && r < 13 ? 'sad' : undefined,
      frontArm: r < 11.2 ? { a1: -30, a2: -20 + Math.sin(t * 3) * 6 } : { a1: 80, a2: 100 } };
    out += P(t, me);
    // Friend with the stamp.
    const walkK = ease(seg(r, 9.6, 10.8));
    const slamUp = r > 10.8 && r < 11.2, slam = r >= 11.2;
    const fr = { x: lerp(1600, 1290, walkK), y: 960, scale: 0.9, look: A.LOOKS.e, seed: 8, flip: true, walking: r > 9.6 && r < 10.8,
      frontArm: slamUp ? { a1: -60, a2: -100 } : slam && r < 12.4 ? { a1: -10, a2: 0 } : { a1: 60, a2: 90 } };
    const stamp = `<g transform="rotate(-90)"><rect x="-10" y="-50" width="20" height="44" rx="8" fill="${C.muted}"/><circle cx="0" cy="-56" r="16" fill="${C.pink}"/><rect x="-34" y="-8" width="68" height="22" rx="5" fill="${C.dark}"/></g>`;
    fr.hold = stamp;
    out += P(t, fr);
    const mk = r >= 11.25 ? back((r - 11.25) / 0.35) : 0;
    if (mk > 0) out += `<g transform="translate(880,690) rotate(-12) scale(${lerp(1.6, 1, Math.min(1, mk))})" opacity="${Math.min(1, mk) * 0.92}"><rect x="-210" y="-62" width="420" height="124" rx="16" fill="${C.pinkP}" fill-opacity=".6" stroke="${C.pink}" stroke-width="8"/><text y="24" font-size="74" font-weight="900" text-anchor="middle" fill="${PD}" font-family="Playfair Display">GIRL. NO.</text></g>`;
    if (r > 11.25) out += A.sparkle(880, 690, s.start + 11.25, t);
    out += pill(1420, 560, 'none are entry rules', C.purple, pop(r, 17.4), 26);
    return out;
  };

  /* ===== L27 B: the context shelf and the key in the case ===== */
  LIVE['s9-library-key'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = ground(960);
    const fk = pop(r, 0.2, 0.8);
    out += zoom(570, 960, fk, `<rect x="140" y="400" width="860" height="560" rx="14" fill="#fff" stroke="${C.muted}" stroke-width="10"/>
      ${[560, 720, 880].map(y => `<rect x="146" y="${y}" width="848" height="16" fill="${C.muted}"/>`).join('')}
      ${[0, 1, 2, 3].map(i => `<rect x="${180 + i * 34}" y="${776 + (i % 2) * 10}" width="28" height="${104 - (i % 2) * 10}" rx="4" fill="${[C.purpleL, C.tealL, C.peachL, C.pinkL][i]}"/>`).join('')}
      <path d="M840,880 L870,820 L900,880 Z" fill="${C.peach}"/><circle cx="870" cy="800" r="34" fill="${C.teal}"/><circle cx="846" cy="790" r="22" fill="${C.teal}"/><circle cx="894" cy="790" r="22" fill="${C.teal}"/>`);
    out += pill(570, 470, 'CONTEXT', C.tealD, pop(r, 0.8), 30);
    const books = [['Liquidity', C.teal], ['Sweeps', C.purple], ['Equal highs', C.peach], ['FVGs', C.pink], ['S&D zones', C.tealD], ['Pressure', C.purple], ['Accumulation', C.gold], ['Order flow', C.pink]];
    const lib = { x: 1120, y: 960, scale: 0.88, look: A.LOOKS.a, seed: 3, flip: true };
    const tossing = books.some((b, i) => { const a = 3.8 + i * 0.6; return r > a - 0.3 && r < a + 0.2; });
    lib.frontArm = tossing ? { a1: -40, a2: -60 } : r > 14 ? { a1: -60, a2: -90 } : undefined;
    const hp = handPos(lib);
    books.forEach(([name, col], i) => {
      const a = 3.8 + i * 0.6;
      if (r < a - 0.3) return;
      const row = i < 4 ? 0 : 1, sx = 440 + (i % 4) * 92, sy = row ? 720 : 560;
      const k = ease(seg(r, a, a + 0.6));
      const x = lerp(hp.x, sx, k), y = lerp(hp.y, sy, k) - Math.sin(k * Math.PI) * 140, rot = (1 - k) * 200, sc = lerp(0.6, 1, k);
      out += `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})"><rect x="-38" y="-136" width="76" height="136" rx="6" fill="${col}"/><rect x="-38" y="-118" width="76" height="6" fill="#fff" opacity=".5"/><rect x="-38" y="-22" width="76" height="6" fill="#fff" opacity=".5"/>
        <text transform="translate(8,-68) rotate(-90)" font-size="${name.length > 9 ? 15 : 18}" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${esc(name)}</text></g>`;
    });
    // Robin hopping along the top.
    const hopP = (t * 0.25) % 1, bx = 260 + Math.abs(((hopP * 2) % 2) - 1) * 620, by = 396 - Math.abs(Math.sin(t * 6)) * 14;
    out += bird(t, { x: bx, y: by, s: 1, col: C.peach, belly: C.pinkL, wing: '#E08E2E', flip: ((hopP * 2) % 2) > 1 });
    out += P(t, lib);
    // Glass case with the key.
    const ck = pop(r, 9.0, 0.7);
    const kr = Math.sin(t * 1.5) * 10;
    out += zoom(1410, 960, ck, `<rect x="1290" y="800" width="240" height="160" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="4"/>
      <text x="1410" y="866" font-size="26" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">DAYLI ICC</text><text x="1410" y="898" font-size="19" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="2">ENTRY MODEL</text>
      <ellipse cx="1410" cy="690" rx="${80 + Math.sin(t * 3) * 6}" ry="${80 + Math.sin(t * 3) * 6}" fill="${C.gold}" opacity=".18"/>
      <g transform="translate(1410,690) rotate(${-30 + kr})"><circle cx="-40" cy="0" r="30" fill="none" stroke="${C.gold}" stroke-width="14"/><rect x="-12" y="-7" width="96" height="14" rx="6" fill="${C.gold}"/><rect x="58" y="6" width="12" height="22" rx="3" fill="${C.gold}"/><rect x="74" y="6" width="10" height="16" rx="3" fill="${C.gold}"/></g>
      <rect x="1310" y="560" width="200" height="240" rx="10" fill="${C.tealL}" fill-opacity=".22" stroke="${C.tealD}" stroke-width="4"/><path d="M1330,580 L1360,580 L1330,640 Z" fill="#fff" opacity=".5"/>`);
    out += pill(1410, 520, 'UNCHANGED', C.gold, pop(r, 9.8), 26);
    if (r > 9.8) out += A.sparkle(1410, 680, s.start + 9.8, t, C.gold);
    // The door to Phase 4.
    const dk = pop(r, 16.0, 0.7);
    if (dk > 0) {
      const open = ease(seg(r, 16.8, 18.0));
      const na = Math.sin(t * 2) * 30 + (1 - open) * 120;
      out += zoom(1740, 960, dk, `<rect x="1630" y="550" width="220" height="410" rx="12" fill="${C.purple}"/><rect x="1645" y="565" width="190" height="395" rx="8" fill="${C.peachL}"/>
        <ellipse cx="1740" cy="760" rx="${90 * open}" ry="${170 * open}" fill="#FFF3C4" opacity="${open * 0.8}"/>
        <g transform="translate(1740,760) scale(${open})"><circle r="56" fill="#fff" stroke="${C.gold}" stroke-width="8"/><g transform="rotate(${na})"><path d="M0,-44 L10,0 L-10,0 Z" fill="${C.pink}"/><path d="M0,44 L10,0 L-10,0 Z" fill="${C.purple}"/></g><circle r="7" fill="${C.dark}"/></g>
        <g transform="translate(1645,0) scale(${lerp(1, 0.14, open)},1) translate(-1645,0)"><rect x="1645" y="565" width="190" height="395" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/><circle cx="1810" cy="770" r="10" fill="${C.gold}"/></g>`);
      out += pill(1740, 504, 'PHASE 4', C.purple, pop(r, 16.4), 26) + pill(1740, 1016, 'Finding Your Bias', C.pink, pop(r, 18.0), 26);
      if (r > 18) out += A.sparkle(1740, 760, s.start + 18.0, t, C.gold);
    }
    return out;
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => { BUILD[k] = buildStd; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
