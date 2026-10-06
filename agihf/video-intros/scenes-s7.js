/**
 * scenes-s7.js: illustrated scene types for Section 7 (Understanding Liquidity)
 * lesson intro videos, Phase 3 Lessons 1 to 9.
 *
 * Every LIVE entry is a pure function of t. Beats are offsets from s.start,
 * so the lesson files only set start/end and narration times.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const rad = (d) => d * Math.PI / 180;
  const fade = (t, a, b, d = 0.4) => clamp((t - a) / d) * (b == null ? 1 : 1 - clamp((t - b) / d));

  // ---------- shared helpers ----------
  const pill = (x, y, text, col, k = 1, fs = 28, o = {}) => {
    if (k <= 0) return '';
    const w = o.w || text.length * fs * 0.6 + 36;
    return `<g transform="translate(${x},${y}) rotate(${o.rot || 0}) scale(${k})" opacity="${o.op ?? 1}"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="3"` : ''}/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${o.color || '#fff'}" font-family="DM Sans">${text}</text></g>`;
  };
  const ground = (y, col = '#F6EDE6', edge = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="${edge}"/>`;
  const shadow = (x, y, rx, op = 0.08) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.14}" fill="${C.dark}" opacity="${op}"/>`;
  const scaleAt = (x, y, k, inner) => (k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${inner}</g>`);
  const panel = (x0, y0, x1, y1, k = 1, fill = '#fff') => scaleAt((x0 + x1) / 2, (y0 + y1) / 2, k,
    `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="34" fill="${fill}" stroke="#F1E7E1" stroke-width="2"/>`);

  // Keyframed position: frames = [[time, x, y], ...]; eased between frames.
  function kf(t, frames) {
    if (t <= frames[0][0]) return { x: frames[0][1], y: frames[0][2], moving: false, vx: 0, vy: 0 };
    for (let i = 0; i < frames.length - 1; i++) {
      const [t0, x0, y0] = frames[i], [t1, x1, y1] = frames[i + 1];
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0), e = 0.5 - 0.5 * Math.cos(Math.PI * k);
        return { x: lerp(x0, x1, e), y: lerp(y0, y1, e), moving: (x0 !== x1 || y0 !== y1), vx: x1 - x0, vy: y1 - y0 };
      }
    }
    const l = frames[frames.length - 1];
    return { x: l[1], y: l[2], moving: false, vx: 0, vy: 0 };
  }
  function alongPath(pts, k) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let d = lens.reduce((a, b) => a + b, 0) * clamp(k);
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) {
        const f = lens[i] ? Math.min(1, d / lens[i]) : 0;
        return { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f), seg: i, f };
      }
      d -= lens[i];
    }
    return { x: pts[0][0], y: pts[0][1], seg: 0, f: 0 };
  }
  const partial = (pts, k) => {
    const p = alongPath(pts, k);
    return pts.slice(0, p.seg + 1).concat([[p.x, p.y]]);
  };
  const poly = (pts, col, w = 8, extra = '') => `<polyline points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;

  // Same idle/walk bob the person() primitive uses, so hats and glasses stay on heads.
  const personBob = (t, seed, walking) => (walking ? Math.abs(Math.sin(t * 9 + seed)) * -6 : Math.sin(t * 2 + seed) * 2);
  // Front hand position on screen (matches person()'s arm geometry).
  function handPos(o, fa) {
    const s = o.scale || 1, f = o.flip ? -1 : 1;
    const ex = 18 + Math.cos(rad(fa.a1)) * 58, ey = -196 + Math.sin(rad(fa.a1)) * 58;
    const hx = ex + Math.cos(rad(fa.a2)) * 54, hy = ey + Math.sin(rad(fa.a2)) * 54;
    return { x: o.x + hx * s * f, y: o.y + (hy + personBob(o.t, o.seed || 2, o.walking)) * s };
  }
  // Headwear and specs, drawn on top of a person() at the same x/y/scale.
  function headwear(t, o, kind, col) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, by = personBob(t, o.seed || 2, o.walking);
    let g = '';
    if (kind === 'detective') {
      g = `<path d="M-46,-300 C-46,-352 46,-352 46,-300 Z" fill="${C.peach}"/><path d="M-58,-300 L58,-300 L48,-290 L-48,-290 Z" fill="#C98A1F"/>
        <path d="M46,-300 L74,-292 L46,-288 Z" fill="#C98A1F"/><path d="M-30,-338 L30,-338" stroke="#C98A1F" stroke-width="4"/>`;
    } else if (kind === 'hard') {
      g = `<path d="M-44,-298 C-44,-350 44,-350 44,-298 Z" fill="${C.gold}"/><rect x="-56" y="-304" width="112" height="12" rx="6" fill="#C98A1F"/><rect x="-6" y="-346" width="12" height="44" rx="5" fill="#F3C25C"/>`;
    } else if (kind === 'chef') {
      g = `<rect x="-36" y="-336" width="72" height="34" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <circle cx="-26" cy="-350" r="24" fill="#fff"/><circle cx="0" cy="-364" r="28" fill="#fff"/><circle cx="26" cy="-350" r="24" fill="#fff"/>`;
    } else if (kind === 'ranger') {
      g = `<ellipse cx="0" cy="-306" rx="70" ry="12" fill="#9B6A45"/><path d="M-36,-306 C-36,-350 36,-350 36,-306 Z" fill="#B98258"/><rect x="-36" y="-316" width="72" height="8" fill="${C.pink}"/>`;
    } else if (kind === 'headset') {
      g = `<path d="M-44,-284 C-44,-344 44,-344 44,-284" fill="none" stroke="${C.dark}" stroke-width="8"/><rect x="-52" y="-298" width="16" height="30" rx="6" fill="${C.purple}"/><rect x="36" y="-298" width="16" height="30" rx="6" fill="${C.purple}"/>
        <path d="M44,-272 Q40,-246 16,-250" fill="none" stroke="${C.dark}" stroke-width="4"/><circle cx="14" cy="-250" r="6" fill="${C.purple}"/>`;
    } else if (kind === 'cap') {
      g = `<path d="M-40,-298 C-40,-344 40,-344 40,-298 Z" fill="${col || C.purple}"/><path d="M30,-302 L80,-296 L36,-290 Z" fill="${col || C.purple}"/>`;
    } else if (kind === 'glasses') {
      g = `<circle cx="-15" cy="-282" r="15" fill="${col}" fill-opacity=".35" stroke="${C.dark}" stroke-width="4"/><circle cx="15" cy="-282" r="15" fill="${col}" fill-opacity=".35" stroke="${C.dark}" stroke-width="4"/><path d="M-1,-284 L1,-284" stroke="${C.dark}" stroke-width="4"/>`;
    }
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s}) translate(0,${by.toFixed(2)})">${g}</g>`;
  }
  const P = (t, o) => A.person(t, { ...o }) + (o.hat ? headwear(t, { ...o }, o.hat, o.hatCol) : '');

  // ---------- creatures ----------
  function eyes(t, x1, x2, y, r, seed, col = C.dark) {
    const period = 3.4 + (seed % 3) * 0.6, p = ((t + seed * 1.13) % period) / period;
    const b = p > 0.95 ? Math.sin((p - 0.95) / 0.05 * Math.PI) : 0;
    const ry = r * (1 - b * 0.9);
    return `<ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${ry}" fill="${col}"/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${ry}" fill="${col}"/>` +
      (b < 0.5 ? `<circle cx="${x1 + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/><circle cx="${x2 + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>` : '');
  }
  // Cat sitting, (x,y) = paws on ground. o: { sleep, col, flip, hop }
  function cat(t, x, y, s = 1, o = {}) {
    const col = o.col || C.peach, dk = o.dark || '#E08E2E', f = o.flip ? -1 : 1;
    const tail = Math.sin(t * 2.6) * 16;
    const face = o.sleep
      ? `<path d="M-22,-112 Q-14,-106 -6,-112" stroke="${C.dark}" stroke-width="4" fill="none"/><path d="M6,-112 Q14,-106 22,-112" stroke="${C.dark}" stroke-width="4" fill="none"/>`
      : eyes(t, -14, 14, -114, 6, 7);
    const zz = o.sleep ? [0, 1].map((i) => { const p = ((t * 0.6) + i * 0.5) % 1; return `<text x="${36 + p * 30}" y="${-150 - p * 50}" font-size="${22 + i * 8}" font-weight="900" fill="${C.purple}" opacity="${1 - p}" font-family="DM Sans">z</text>`; }).join('') : '';
    return `<g transform="translate(${x},${y - (o.hop || 0)}) scale(${s * f},${s})">
      <path d="M30,-10 Q${80 + tail},-30 ${66 + tail},-90" fill="none" stroke="${dk}" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="0" cy="-40" rx="44" ry="44" fill="${col}"/>
      <path d="M-34,-128 L-30,-170 L-6,-140 Z" fill="${col}"/><path d="M34,-128 L30,-170 L6,-140 Z" fill="${col}"/>
      <path d="M-28,-140 L-27,-158 L-15,-143 Z" fill="${C.pinkL}"/><path d="M28,-140 L27,-158 L15,-143 Z" fill="${C.pinkL}"/>
      <circle cx="0" cy="-110" r="40" fill="${col}"/>
      ${face}
      <path d="M-5,-100 L5,-100 L0,-94 Z" fill="${C.pink}"/>
      <path d="M-30,-98 L-52,-102 M-30,-92 L-52,-88 M30,-98 L52,-102 M30,-92 L52,-88" stroke="${dk}" stroke-width="2.5"/>
      <ellipse cx="-18" cy="-2" rx="14" ry="9" fill="${col}"/><ellipse cx="18" cy="-2" rx="14" ry="9" fill="${col}"/>
      <path d="M-20,-60 Q0,-50 20,-60" stroke="${dk}" stroke-width="4" fill="none"/>
      ${zz}</g>`;
  }
  // Dog sitting/standing, (x,y) = paws. o: { flip, bark, sniff }
  function dog(t, x, y, s = 1, o = {}) {
    const f = o.flip ? -1 : 1, col = o.col || '#C9A27A', dk = '#9B6A45';
    const wag = Math.sin(t * 14) * 20, sn = o.sniff ? Math.sin(t * 6) * 6 : 0;
    const bark = o.bark ? `<text x="96" y="-150" font-size="30" font-weight="900" fill="${C.purple}" font-family="DM Sans" transform="scale(${f},1)" ${f < 0 ? 'text-anchor="end"' : ''}>woof!</text>` : '';
    return `<g transform="translate(${x},${y}) scale(${s * f},${s})">
      <path d="M-56,-60 Q-90,${-90 + wag} -80,${-120 + wag}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round"/>
      <rect x="-50" y="-36" width="16" height="36" rx="7" fill="${col}"/><rect x="26" y="-36" width="16" height="36" rx="7" fill="${col}"/>
      <ellipse cx="-6" cy="-60" rx="66" ry="36" fill="${col}"/>
      <g transform="translate(0,${sn})">
      <circle cx="58" cy="-102" r="36" fill="${col}"/>
      <ellipse cx="88" cy="-92" rx="22" ry="16" fill="#E8D2B8"/><circle cx="106" cy="-96" r="8" fill="${C.dark}"/>
      <ellipse cx="34" cy="-96" rx="14" ry="30" fill="${dk}" transform="rotate(${14 + Math.sin(t * 3) * 6} 34 -120)"/>
      ${eyes(t, 52, 74, -112, 5, 4)}
      <path d="M80,-76 Q90,-70 98,-78" stroke="${C.dark}" stroke-width="3" fill="none"/>
      </g>
      <rect x="20" y="-82" width="40" height="10" rx="5" fill="${C.pink}"/>
      ${bark}</g>`;
  }
  // Bird in flight or perched. o: { flap, col, perched, flip }
  function bird(t, x, y, s = 1, o = {}) {
    const f = o.flip ? -1 : 1, col = o.col || C.purple;
    const w = o.perched ? 0.15 : Math.sin(t * 16);
    return `<g transform="translate(${x},${y}) scale(${s * f},${s})">
      <path d="M-6,-6 Q-30,${-40 * w - 10} -54,${-30 * w - 4}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="0" cy="0" rx="30" ry="22" fill="${col}"/>
      <circle cx="26" cy="-14" r="16" fill="${col}"/>
      <path d="M40,-16 L54,-11 L40,-6 Z" fill="${C.gold}"/>
      <circle cx="30" cy="-18" r="3.5" fill="${C.dark}"/>
      <path d="M-28,4 L-46,10 L-28,12 Z" fill="${col}"/>
      ${o.perched ? `<path d="M-6,20 L-6,30 M8,20 L8,30" stroke="${C.gold}" stroke-width="4"/>` : ''}
      <path d="M6,-2 Q-16,${-26 * w} -36,${-18 * w}" fill="none" stroke="${C.purpleL}" stroke-width="10" stroke-linecap="round"/>
    </g>`;
  }
  // Parrot perched, (x,y) = feet. o: { talk, flip }
  function parrot(t, x, y, s = 1, o = {}) {
    const f = o.flip ? -1 : 1, bob = Math.sin(t * 3) * 3, m = o.talk ? Math.abs(Math.sin(t * 12)) * 6 : 0;
    return `<g transform="translate(${x},${y + bob}) scale(${s * f},${s})">
      <path d="M-8,-20 L-30,40 L-10,36 L4,-12 Z" fill="${C.purple}"/>
      <ellipse cx="0" cy="-48" rx="26" ry="38" fill="${C.teal}"/>
      <path d="M-20,-60 Q-34,-30 -14,-10" fill="none" stroke="${C.tealD}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="6" cy="-92" r="24" fill="${C.pink}"/>
      <path d="M2,-114 Q10,-136 22,-128 Q12,-120 14,-110 Z" fill="${C.peach}"/>
      <circle cx="12" cy="-96" r="9" fill="#fff"/><circle cx="14" cy="-96" r="4.5" fill="${C.dark}"/>
      <path d="M26,-92 Q46,-90 40,-72 Q34,${-80 + m} 26,${-80 + m} Z" fill="${C.gold}"/>
      <path d="M-6,-10 L-6,0 M8,-10 L8,0" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  }
  // Owl (judge), (x,y) = bottom of body. o: { talk, gavel (angle) }
  function owl(t, x, y, s = 1, o = {}) {
    const m = o.talk ? Math.abs(Math.sin(t * 11)) * 8 : 0, sway = Math.sin(t * 1.8) * 2;
    return `<g transform="translate(${x},${y}) scale(${s}) rotate(${sway})">
      <ellipse cx="0" cy="-110" rx="100" ry="118" fill="${C.purple}"/>
      <ellipse cx="0" cy="-84" rx="62" ry="80" fill="${C.purpleL}"/>
      ${[0, 1, 2].map((i) => `<path d="M${-30 + i * 30},${-90 + (i % 2) * 18} q12,10 24,0" stroke="${C.purple}" stroke-width="4" fill="none"/>`).join('')}
      <path d="M-78,-214 L-62,-262 L-36,-216 Z" fill="${C.purple}"/><path d="M78,-214 L62,-262 L36,-216 Z" fill="${C.purple}"/>
      <circle cx="-40" cy="-172" r="36" fill="#fff"/><circle cx="40" cy="-172" r="36" fill="#fff"/>
      ${eyes(t, -40, 40, -172, 16, 9)}
      <path d="M-12,-146 L12,-146 L0,${-122 + m * 0.4} Z" fill="${C.gold}"/>
      <rect x="-74" y="-214" width="148" height="22" rx="6" fill="${C.dark}" opacity=".85"/>
      <g transform="translate(118,-70) rotate(${o.gavel ?? 25})">
        <rect x="-6" y="-84" width="12" height="84" rx="5" fill="#9B6A45"/><rect x="-30" y="-110" width="60" height="34" rx="8" fill="#B98258"/></g>
      <ellipse cx="112" cy="-70" rx="22" ry="30" fill="${C.purple}"/>
    </g>`;
  }
  // Robot on a wheeled base, (x,y) = base. o: { a1, a2 (arm angles), talk, broom, hold, face }
  function robot(t, x, y, s = 1, o = {}) {
    const f = o.flip ? -1 : 1, bob = Math.sin(t * 4) * 3, ant = Math.floor(t * 2) % 2;
    const a1 = o.a1 ?? 70, a2 = o.a2 ?? 80;
    const sx = 52, sy = -200;
    const ex = sx + Math.cos(rad(a1)) * 60, ey = sy + Math.sin(rad(a1)) * 60, hx = ex + Math.cos(rad(a2)) * 56, hy = ey + Math.sin(rad(a2)) * 56;
    const m = o.talk ? Math.abs(Math.sin(t * 12)) * 8 : 0;
    const face = o.face === 'happy'
      ? `<path d="M-30,-282 Q-20,-294 -10,-282 M10,-282 Q20,-294 30,-282" stroke="${C.tealL}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      : `<rect x="-32" y="-296" width="18" height="${22 - (Math.floor(t * 1.3) % 5 === 0 ? 18 : 0)}" rx="6" fill="${C.tealL}"/><rect x="14" y="-296" width="18" height="${22 - (Math.floor(t * 1.3) % 5 === 0 ? 18 : 0)}" rx="6" fill="${C.tealL}"/>`;
    return `<g transform="translate(${x},${y}) scale(${s * f},${s})">
      <ellipse cx="0" cy="0" rx="78" ry="10" fill="${C.dark}" opacity=".08"/>
      <rect x="-60" y="-50" width="120" height="40" rx="18" fill="${C.muted}"/>
      <circle cx="-34" cy="-12" r="14" fill="${C.dark}"/><circle cx="34" cy="-12" r="14" fill="${C.dark}"/>
      <g transform="translate(0,${bob})">
      <path d="M-52,-200 L-70,-120" stroke="#C9B9AE" stroke-width="16" stroke-linecap="round"/>
      <rect x="-58" y="-226" width="116" height="170" rx="26" fill="#E4DCD6"/>
      <rect x="-34" y="-190" width="68" height="44" rx="10" fill="#fff"/>
      <circle cx="-14" cy="-168" r="7" fill="${C.pink}"/><circle cx="12" cy="-168" r="7" fill="${ant ? C.gold : C.teal}"/>
      <rect x="-8" y="-246" width="16" height="22" fill="#C9B9AE"/>
      <rect x="-62" y="-330" width="124" height="90" rx="28" fill="#E4DCD6"/>
      <rect x="-48" y="-316" width="96" height="62" rx="18" fill="${C.dark}"/>
      ${face}
      <rect x="-14" y="${-266 - m * 0.3}" width="28" height="${5 + m}" rx="3" fill="${C.tealL}"/>
      <line x1="0" y1="-330" x2="0" y2="-360" stroke="#C9B9AE" stroke-width="6"/><circle cx="0" cy="-366" r="10" fill="${ant ? C.pink : C.gold}"/>
      <path d="M${sx},${sy} L${ex.toFixed(1)},${ey.toFixed(1)} L${hx.toFixed(1)},${hy.toFixed(1)}" stroke="#C9B9AE" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${o.hold ? `<g transform="translate(${hx},${hy})">${o.hold}</g>` : ''}
      <circle cx="${hx}" cy="${hy}" r="13" fill="${C.muted}"/>
      </g></g>`;
  }
  // Frog, (x,y) = feet. o: { squash, col, mood }
  function frog(t, x, y, s = 1, o = {}) {
    const col = o.col || C.cash, dk = C.cashD, sq = o.squash || 0;
    const sy = 1 - sq * 0.25, sxx = 1 + sq * 0.2;
    const mouth = o.mood === 'sad' ? `<path d="M-22,-44 Q0,-56 22,-44" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/>` : `<path d="M-26,-52 Q0,-34 26,-52" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x},${y}) scale(${s * sxx},${s * sy})">
      <ellipse cx="-36" cy="-8" rx="26" ry="12" fill="${dk}"/><ellipse cx="36" cy="-8" rx="26" ry="12" fill="${dk}"/>
      <ellipse cx="0" cy="-46" rx="56" ry="44" fill="${col}"/>
      <ellipse cx="0" cy="-34" rx="36" ry="24" fill="#D9F2E2"/>
      <circle cx="-26" cy="-88" r="20" fill="${col}"/><circle cx="26" cy="-88" r="20" fill="${col}"/>
      <circle cx="-26" cy="-90" r="13" fill="#fff"/><circle cx="26" cy="-90" r="13" fill="#fff"/>
      ${eyes(t, -24, 28, -90, 6, o.seed || 3)}
      ${mouth}
      <ellipse cx="-38" cy="-60" rx="8" ry="5" fill="${C.pink}" opacity=".5"/><ellipse cx="38" cy="-60" rx="8" ry="5" fill="${C.pink}" opacity=".5"/>
    </g>`;
  }
  // Fish facing +x, rotated by ang (deg).
  function fish(t, x, y, s = 1, ang = 0, col = C.peach) {
    const w = Math.sin(t * 10) * 10;
    return `<g transform="translate(${x},${y}) rotate(${ang}) scale(${s})">
      <path d="M-40,0 L-74,${-26 + w} L-70,${26 + w} Z" fill="${col}"/>
      <ellipse cx="0" cy="0" rx="50" ry="30" fill="${col}"/>
      <path d="M-10,-28 Q8,-50 24,-26" fill="${C.pinkL}"/>
      <path d="M-14,-24 Q-4,0 -14,24" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
      <circle cx="26" cy="-6" r="9" fill="#fff"/><circle cx="28" cy="-6" r="4.5" fill="${C.dark}"/>
      <path d="M40,10 Q46,12 48,6" stroke="${C.dark}" stroke-width="3" fill="none"/>
    </g>`;
  }
  function duck(t, x, y, s = 1, flip = false) {
    const bob = Math.sin(t * 2.4) * 4, f = flip ? -1 : 1;
    return `<g transform="translate(${x},${y + bob}) scale(${s * f},${s})">
      <ellipse cx="0" cy="-20" rx="48" ry="28" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <path d="M-44,-28 L-62,-44 L-40,-36 Z" fill="#fff"/>
      <circle cx="30" cy="-58" r="22" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <path d="M48,-60 L70,-54 L48,-48 Z" fill="${C.peach}"/>
      <circle cx="36" cy="-64" r="4" fill="${C.dark}"/>
      <path d="M-14,-26 Q4,-40 20,-24" stroke="#EADFD8" stroke-width="4" fill="none"/>
    </g>`;
  }
  function crab(t, x, y, s = 1) {
    const c = Math.sin(t * 8) * 8, leg = Math.sin(t * 14) * 6;
    return `<g transform="translate(${x},${y}) scale(${s})">
      ${[-1, 1].map((d) => [0, 1, 2].map((i) => `<path d="M${d * 20},-16 L${d * (44 + i * 6)},${-6 + i * 8 + (i % 2 ? leg : -leg)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>`).join('')).join('')}
      <ellipse cx="0" cy="-22" rx="40" ry="24" fill="${C.pink}"/>
      <path d="M-30,-34 L-50,${-60 - c}" stroke="${C.pink}" stroke-width="7" stroke-linecap="round"/><path d="M30,-34 L50,${-60 + c}" stroke="${C.pink}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="-54" cy="${-66 - c}" r="12" fill="${C.pinkL}"/><circle cx="54" cy="${-66 + c}" r="12" fill="${C.pinkL}"/>
      <line x1="-10" y1="-44" x2="-12" y2="-60" stroke="${C.pink}" stroke-width="4"/><line x1="10" y1="-44" x2="12" y2="-60" stroke="${C.pink}" stroke-width="4"/>
      <circle cx="-12" cy="-62" r="7" fill="#fff"/><circle cx="12" cy="-62" r="7" fill="#fff"/><circle cx="-12" cy="-62" r="3.5" fill="${C.dark}"/><circle cx="12" cy="-62" r="3.5" fill="${C.dark}"/>
    </g>`;
  }
  function snail(t, x, y, s = 1) {
    const st = Math.sin(t * 3) * 3;
    return `<g transform="translate(${x},${y}) scale(${s})">
      <path d="M-50,0 Q-56,-14 -40,-16 L40,-16 Q60,-16 64,-40 L70,-40 Q72,-6 50,0 Z" fill="${C.peachL}"/>
      <line x1="56" y1="-38" x2="${52 + st}" y2="-64" stroke="${C.peachL}" stroke-width="5"/><line x1="66" y1="-38" x2="${72 + st}" y2="-62" stroke="${C.peachL}" stroke-width="5"/>
      <circle cx="${52 + st}" cy="-66" r="5" fill="${C.dark}"/><circle cx="${72 + st}" cy="-64" r="5" fill="${C.dark}"/>
      <circle cx="0" cy="-42" r="34" fill="${C.pink}"/><path d="M0,-42 m-20,0 a20,20 0 1,1 20,20 a12,12 0 1,1 -12,-12" fill="none" stroke="${C.pinkL}" stroke-width="6"/>
    </g>`;
  }
  const tree = (x, y, s = 1, t = 0) => `<g transform="translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 1.2 + x) * 1.5})">
    <rect x="-14" y="-140" width="28" height="140" rx="10" fill="#B98258"/>
    <circle cx="0" cy="-190" r="76" fill="${C.teal}"/><circle cx="-54" cy="-150" r="50" fill="${C.tealD}" opacity=".7"/><circle cx="56" cy="-158" r="54" fill="${C.tealL}"/></g>`;

  // A small candle with a level line, for mini "evidence" cards.
  const candle = (x, top, bot, hi, lo, up, w = 26) => {
    const col = up ? C.teal : C.pink;
    return `<line x1="${x}" x2="${x}" y1="${hi}" y2="${lo}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><rect x="${x - w / 2}" y="${Math.min(top, bot)}" width="${w}" height="${Math.max(4, Math.abs(bot - top))}" rx="4" fill="${col}"/>`;
  };
  const check = (x, y, k, ok = true, r = 30) => (k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${ok ? C.teal : C.pink}" stroke="#fff" stroke-width="4"/>
    ${ok ? `<path d="M${-r * 0.45},0 L${-r * 0.1},${r * 0.35} L${r * 0.5},${-r * 0.35}" fill="none" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="M${-r * 0.35},${-r * 0.35} L${r * 0.35},${r * 0.35} M${r * 0.35},${-r * 0.35} L${-r * 0.35},${r * 0.35}" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round"/>`}</g>`);
  const stamp = (x, y, text, k, col = C.pink, rot = -8, fs = 54) => {
    if (k <= 0) return '';
    const w = text.length * fs * 0.66 + 60;
    const sc = 1 + (1 - clamp(k)) * 0.8;
    return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})" opacity="${clamp(k * 1.4)}">
      <rect x="${-w / 2}" y="${-fs * 0.9}" width="${w}" height="${fs * 1.8}" rx="14" fill="#fff" fill-opacity=".9" stroke="${col}" stroke-width="8"/>
      <rect x="${-w / 2 + 10}" y="${-fs * 0.9 + 10}" width="${w - 20}" height="${fs * 1.8 - 20}" rx="8" fill="none" stroke="${col}" stroke-width="3"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${col}" font-family="DM Sans" letter-spacing="3">${text}</text></g>`;
  };
  const qmarks = (t, x, y, t0, n = 3) => [...Array(n)].map((_, i) => {
    const p = ((t - t0) * 0.7 + i / n) % 1;
    return `<text x="${x + (i - (n - 1) / 2) * 40}" y="${y - p * 90}" font-size="${44 + i * 6}" font-weight="900" fill="${C.purple}" opacity="${Math.sin(p * Math.PI) * 0.85}" text-anchor="middle" font-family="Playfair Display">?</text>`;
  }).join('');
  const confetti = (t, t0, x0 = 0, x1 = 1920) => (t < t0 ? '' : [...Array(40)].map((_, i) => {
    const p = (t - t0) * (0.5 + (i % 5) * 0.08);
    const x = x0 + ((i * 197) % (x1 - x0)) + Math.sin(p * 3 + i) * 30, y = 380 + ((p * 260 + i * 37) % 700);
    const col = [C.pink, C.teal, C.peach, C.purple, C.gold][i % 5];
    return `<rect x="${x}" y="${y}" width="14" height="22" rx="3" fill="${col}" transform="rotate(${p * 200 + i * 30} ${x} ${y})" opacity="${clamp((t - t0) / 0.3) * 0.9}"/>`;
  }).join(''));

  // ---------- BUILD: kicker + one headline at a time ----------
  const textLayer = (s) => `
    <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
    ${(s.headlines || []).map((h) => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;

  const LIVE = {};

  /* ================= Lesson 1 ================= */

  // A market stall: a buyer with no seller can't trade. A seller arrives, the trade happens,
  // and the order board fills with tickets: liquidity = orders available to trade against.
  LIVE['s7-market-stall'] = (s, t, ctx) => {
    const r = t - s.start, G = 940, S = 1.15;
    let out = ground(G);
    // bunting
    const bp = clamp((r - 0.2) / 0.8);
    if (bp > 0) {
      out += `<path d="M0,410 Q960,470 1920,410" fill="none" stroke="${C.muted}" stroke-width="3" opacity="${bp}"/>`;
      for (let i = 0; i < 16; i++) {
        const x = 60 + i * 120, y = 410 + Math.sin(Math.PI * x / 1920) * 60 * 0.98, sw = Math.sin(t * 2 + i) * 6;
        out += `<path d="M${x - 24},${y - 2} L${x + 24},${y - 2} L${x + sw},${y + 44}" fill="${[C.pinkL, C.tealL, C.peachL, C.purpleL][i % 4]}" opacity="${bp}"/>`;
      }
    }
    // order board on an easel (left)
    const bk = pop(t, s.start + 0.6, 0.7);
    out += scaleAt(380, 700, bk, `<path d="M290,940 L330,640 M470,940 L430,640" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
      <rect x="200" y="500" width="360" height="270" rx="18" fill="#4A3B33" stroke="#9B6A45" stroke-width="10"/>
      <text x="380" y="548" font-size="26" font-weight="900" text-anchor="middle" fill="${C.cream}" font-family="DM Sans" letter-spacing="3">ORDERS</text>`);
    [[270, 600, 'BUY', C.teal], [380, 600, 'SELL', C.pink], [490, 600, 'BUY', C.teal], [270, 680, 'SELL', C.pink], [380, 680, 'BUY', C.teal], [490, 680, 'SELL', C.pink]].forEach(([x, y, l, c], i) => {
      const k = pop(t, s.start + 15.6 + i * 0.45, 0.5);
      if (k > 0) out += `<g transform="translate(${x},${y}) rotate(${(i % 2 ? 4 : -5) + Math.sin(t * 2 + i) * 2}) scale(${k})"><rect x="-46" y="-28" width="92" height="56" rx="8" fill="#fff"/><rect x="-46" y="-28" width="92" height="12" rx="6" fill="${c}"/>
        <text y="18" font-size="22" font-weight="900" text-anchor="middle" fill="${c === C.teal ? C.tealD : C.pink}" font-family="DM Sans">${l}</text></g>`;
    });
    // stall back: posts + striped awning
    const sk = pop(t, s.start + 0.3, 0.8);
    let aw = '';
    for (let i = 0; i < 8; i++) aw += `<path d="M${920 + i * 65},520 L${985 + i * 65},520 L${985 + i * 65},600 Q${952 + i * 65},630 ${920 + i * 65},600 Z" fill="${i % 2 ? C.cream : C.pink}"/>`;
    out += scaleAt(1180, 760, sk, `<rect x="950" y="520" width="18" height="420" fill="#B98258"/><rect x="1392" y="520" width="18" height="420" fill="#B98258"/>${aw}
      <rect x="920" y="500" width="520" height="26" rx="10" fill="${C.pink}"/>`);
    // seller walks in behind the counter
    const sellerX = lerp(2100, 1190, ease(seg(r, 8.6, 11)));
    const swapK = ease(seg(r, 12, 13.4));
    const swapped = swapK >= 1, swapping = swapK > 0 && swapK < 1;
    const holdArm = { a1: 40, a2: -50 };
    if (r > 8.4) {
      out += P(t, { x: sellerX, y: G, scale: S, look: A.LOOKS.seller, flip: true, seed: 5, walking: r < 11,
        frontArm: holdArm, hold: swapping ? '' : swapped ? A.cashStack() : `<g transform="translate(0,-34)"><rect x="-32" y="-30" width="64" height="56" rx="6" fill="${C.peachL}" stroke="${C.peach}" stroke-width="4"/><text y="8" font-size="16" font-weight="900" text-anchor="middle" fill="#C98A1F" font-family="DM Sans">MNQ</text></g>`,
        talk: ctx.talking && r > 10.6 && r < 12 });
    }
    // counter front + goods
    out += scaleAt(1180, 760, sk, `<rect x="930" y="770" width="500" height="22" rx="8" fill="#9B6A45"/><rect x="944" y="792" width="472" height="148" fill="#C9A27A"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${960 + i * 112}" y="812" width="96" height="108" rx="8" fill="#B98258" opacity=".5"/>`).join('')}
      <circle cx="1010" cy="752" r="20" fill="${C.peach}"/><circle cx="1046" cy="756" r="16" fill="${C.pink}"/><circle cx="1076" cy="754" r="18" fill="${C.peachL}"/>`);
    // cat on the counter: asleep until the seller arrives
    if (sk > 0.5) out += cat(t, 1340, 772, 0.7, { sleep: r < 9.6, hop: r > 9.6 && r < 10.2 ? Math.sin((r - 9.6) / 0.6 * Math.PI) * 30 : 0, flip: true });
    // buyer walks in with cash
    const buyerX = lerp(-160, 740, ease(seg(r, 0.8, 3.4)));
    out += P(t, { x: buyerX, y: G, scale: S, look: A.LOOKS.buyer, seed: 3, walking: r > 0.8 && r < 3.4,
      frontArm: holdArm, hold: swapping ? '' : swapped ? A.contract() : A.cashStack(), talk: ctx.talking && r > 3.4 && r < 8 });
    if (swapping) {
      const arc = -Math.sin(swapK * Math.PI) * 160;
      out += `<g transform="translate(${lerp(820, 1110, swapK)},${lerp(680, 680, swapK) + arc}) rotate(${swapK * 360}) scale(1.2)">${A.cashStack()}</g>
        <g transform="translate(${lerp(1110, 820, swapK)},${680 + arc * 0.6}) scale(1.2)">${A.contract()}</g>`;
    }
    // bubbles + no-seller beat
    const b1 = fade(r, 3.5, 7.6);
    if (b1 > 0) out += A.bubble(700, 470, 'I’d like to buy!', { op: b1, sc: 0.8 + 0.2 * b1, size: 30, italic: true, font: 'Playfair Display', tail: 'left' });
    if (r > 4.6 && r < 9) out += qmarks(t, 1180, 690, s.start + 4.6) + pill(1180, 700, 'no seller = no trade', C.purple, pop(t, s.start + 5.6) * (1 - seg(r, 8.4, 8.8)), 26);
    const b2 = fade(r, 10.6, 12.6);
    if (b2 > 0) out += A.bubble(1250, 470, 'I’ll sell!', { op: b2, sc: 0.8 + 0.2 * b2, size: 30, italic: true, font: 'Playfair Display', tail: 'right' });
    if (swapped) out += A.sparkle(965, 620, s.start + 13.4, t) + pill(965, 470, 'TRADE ✓', C.teal, pop(t, s.start + 13.5), 30);
    out += pill(960, 1010, 'liquidity = orders available to trade against', C.purple, pop(t, s.start + 20.6), 28);
    return out;
  };

  // A detective sweeps a magnifying glass along a previous high and finds the kinds of
  // orders that may rest there, but no one's motive.
  LIVE['s7-detective'] = (s, t, ctx) => {
    const r = t - s.start, G = 1010;
    const x = 200, y = 470, w = 1020, h = 470;
    const X = (u) => x + u * w, Y = (v) => y + h - v * h;
    let out = ground(G) + panel(140, 400, 1290, 990, pop(t, s.start + 0.2, 0.7));
    const sw = [[0, 0.08], [0.3, 0.72], [0.5, 0.38], [0.74, 0.62]];
    out += A.swingChart(t, { x, y, w, h, swings: sw, t0: s.start + 0.6, t1: s.start + 4, seed: 31, per: 36, maxBody: 18, wick: 3 });
    const hy = Y(0.72);
    const lk = ease(seg(r, 4.4, 5.6));
    if (lk > 0) out += `<line x1="${X(0.3)}" x2="${lerp(X(0.3), 1260, lk)}" y1="${hy}" y2="${hy}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>`;
    out += pill(X(0.3) - 6, hy + 52, 'previous high', C.purple, pop(t, s.start + 5), 22);
    // order tags revealed as the lens passes
    const lensX = lerp(560, 1170, ease(seg(r, 9.8, 15)));
    const tags = [[640, 536, 'take-profits', C.peach], [860, 536, 'short stops', C.pink], [1090, 536, 'breakout buys', C.teal], [760, 462, 'new sellers', C.pink], [1000, 462, '? other orders', C.muted]];
    tags.forEach(([tx, ty, txt, col], i) => {
      if (r < 9.8) return;
      const at = s.start + 9.8 + clamp((tx - 560) / 610) * 5.2;
      const k = pop(t, at, 0.5);
      out += pill(tx, ty + Math.sin(t * 2 + i) * 3, txt, col, k, 22);
      if (r > 18.6) out += `<text x="${tx + txt.length * 7 + 10}" y="${ty - 18 - Math.abs(Math.sin(t * 3 + i)) * 10}" font-size="34" font-weight="900" fill="${C.purple}" font-family="Playfair Display" opacity="${clamp((r - 18.6 - i * 0.2) / 0.4)}">?</text>`;
    });
    if (r > 9.4 && r < 15.8) {
      const lo = fade(r, 9.4, 15.3);
      out += `<g transform="translate(${lensX},500)" opacity="${lo}"><circle r="92" fill="#fff" fill-opacity=".25" stroke="${C.dark}" stroke-width="14"/><circle r="80" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>
        <path d="M-40,-46 Q-56,-20 -50,6" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"/>
        <line x1="66" y1="66" x2="140" y2="140" stroke="${C.dark}" stroke-width="22" stroke-linecap="round"/><line x1="66" y1="66" x2="140" y2="140" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/></g>`;
    }
    out += pill(700, 950, 'AREA ✓', C.teal, pop(t, s.start + 15.2), 28);
    // detective + dog
    const shrug = r > 18.6;
    const det = { x: 1580, y: G, scale: 1.15, look: A.LOOKS.c, flip: true, seed: 6, t,
      frontArm: shrug ? { a1: -20, a2: -80 } : r > 9.6 && r < 15.4 ? { a1: -10, a2: -20 } : { a1: 100, a2: 95 },
      backArm: shrug ? { a1: 200, a2: 260 } : undefined, talk: ctx.talking };
    out += P(t, { ...det, hat: 'detective' });
    out += dog(t, 1380, G, 0.8, { flip: true, sniff: r > 6 && r < 15, bark: r > 15.2 && r < 16.4 });
    out += pill(1580, 520, 'MOTIVE ?', C.purple, pop(t, s.start + 18.8), 28);
    if (r > 18.8) out += qmarks(t, 1580, 470, s.start + 18.8);
    return out;
  };

  /* ================= Lesson 2 ================= */

  // A range with balloons tied above the high (buy-side) and anchors hanging below the low (sell-side).
  LIVE['s7-balloons-anchors'] = (s, t, ctx) => {
    const r = t - s.start;
    const x0 = 420, x1 = 1600, hiY = 610, loY = 860;
    let out = '';
    const rk = ease(seg(r, 0.3, 1.4));
    out += `<rect x="${x0}" y="${hiY}" width="${(x1 - x0) * rk}" height="${loY - hiY}" fill="${C.purpleL}" opacity=".18"/>`;
    out += `<line x1="${x0}" x2="${lerp(x0, x1, rk)}" y1="${hiY}" y2="${hiY}" stroke="${C.tealD}" stroke-width="6" stroke-dasharray="18 10"/>
      <line x1="${x0}" x2="${lerp(x0, x1, rk)}" y1="${loY}" y2="${loY}" stroke="${C.pink}" stroke-width="6" stroke-dasharray="18 10"/>`;
    out += pill(x0 + 70, hiY + 30, 'high', C.tealD, pop(t, s.start + 1.2), 20) + pill(x0 + 64, loY - 30, 'low', C.pink, pop(t, s.start + 1.4), 20);
    out += A.swingChart(t, { x: 560, y: hiY + 10, w: 1000, h: loY - hiY - 20, swings: [[0, 0.5], [0.14, 0.97], [0.28, 0.08], [0.46, 0.94], [0.6, 0.04], [0.78, 0.98], [0.9, 0.3], [1, 0.55]],
      t0: s.start + 1, t1: s.start + 4.2, seed: 21, per: 40, maxBody: 12, wick: 3 });
    // balloons above the high
    const pulse = r > 20.4 ? 1 + Math.sin((r - 20.4) * 6) * 0.06 : 1;
    [600, 780, 960, 1140, 1320, 1480].forEach((bx, i) => {
      const k = ease(seg(r, 5 + i * 0.35, 6.4 + i * 0.35));
      if (k <= 0) return;
      const top = lerp(hiY - 10, 460 + (i % 2) * 34, k), sway = Math.sin(t * 1.6 + i) * 12;
      const col = i % 2 ? C.tealL : C.teal;
      out += `<path d="M${bx},${hiY} Q${bx + sway * 0.5},${(hiY + top) / 2} ${bx + sway},${top + 36}" stroke="${C.muted}" stroke-width="2.5" fill="none"/>
        <g transform="translate(${bx + sway},${top}) scale(${pulse * k})"><ellipse rx="30" ry="36" fill="${col}"/><path d="M-6,34 L6,34 L0,42 Z" fill="${col}"/><ellipse cx="-10" cy="-12" rx="7" ry="11" fill="#fff" opacity=".55"/></g>`;
    });
    // anchors below the low
    [640, 860, 1080, 1300].forEach((ax, i) => {
      const k = ease(seg(r, 12.4 + i * 0.35, 13.8 + i * 0.35));
      if (k <= 0) return;
      const bot = lerp(loY + 10, 950 + (i % 2) * 24, k), sway = Math.sin(t * 1.2 + i) * 6;
      out += `<path d="M${ax},${loY} L${ax + sway},${bot - 40}" stroke="${C.muted}" stroke-width="5" stroke-dasharray="8 6"/>
        <g transform="translate(${ax + sway},${bot}) rotate(${sway}) scale(${pulse})"><circle cy="-40" r="10" fill="none" stroke="${C.pink}" stroke-width="6"/><rect x="-5" y="-32" width="10" height="56" fill="${C.pink}"/>
        <rect x="-22" y="-20" width="44" height="8" rx="4" fill="${C.pink}"/><path d="M-36,4 Q0,44 36,4" fill="none" stroke="${C.pink}" stroke-width="10" stroke-linecap="round"/><path d="M-42,-4 L-30,10 L-44,14 Z M42,-4 L30,10 L44,14 Z" fill="${C.pink}"/></g>`;
    });
    // labels column on the right
    out += pill(1760, 440, 'BUY-SIDE ↑', C.tealD, pop(t, s.start + 6.6), 28) + pill(1760, 500, 'short stops', C.teal, pop(t, s.start + 8.4), 22) + pill(1760, 550, 'breakout buys', C.teal, pop(t, s.start + 9.6), 22);
    out += pill(1760, 920, 'SELL-SIDE ↓', C.pink, pop(t, s.start + 13.6), 28) + pill(1760, 980, 'long stops', C.pinkL, pop(t, s.start + 15.6), 22, { color: C.dark }) + pill(1760, 1030, 'breakdown sells', C.pinkL, pop(t, s.start + 16.8), 22, { color: C.dark });
    // guide character on the left
    const arm = r > 4.8 && r < 11.8 ? { a1: -70, a2: -86 } : r > 12.2 && r < 19 ? { a1: 50, a2: 70 } : { a1: 100, a2: 95 };
    out += P(t, { x: 230, y: 1040, scale: 0.95, look: A.LOOKS.b, seed: 2, frontArm: arm, talk: ctx.talking, hat: 'cap', hatCol: C.teal });
    // bird and crab wander through
    const bk = seg(r, 17, 24);
    if (bk > 0 && bk < 1) out += bird(t, lerp(300, 1700, bk), 410 + Math.sin(bk * 12) * 14, 0.9);
    const ck = seg(r, 14, 25);
    if (ck > 0) out += crab(t, lerp(1420, 760, ck), 1060, 0.7);
    return out;
  };

  // A park map board: buy-side and sell-side are labels on a map, not a route.
  LIVE['s7-street-signs'] = (s, t, ctx) => {
    const r = t - s.start, G = 980;
    let out = ground(G, '#EAF6F3', '#D3F0EC') + tree(170, G, 1, t) + tree(1760, G, 1.1, t) + tree(1880, G, 0.8, t);
    // map board
    const mk = pop(t, s.start + 0.3, 0.8);
    out += scaleAt(1060, 700, mk, `<rect x="840" y="800" width="24" height="${G - 800}" fill="#9B6A45"/><rect x="1256" y="800" width="24" height="${G - 800}" fill="#9B6A45"/>
      <rect x="720" y="400" width="680" height="420" rx="24" fill="#fff" stroke="#9B6A45" stroke-width="12"/>`);
    if (mk > 0.6) {
      const pz = r > 8.6 && r < 12 ? 0.25 + 0.2 * Math.sin((r - 8.6) * 6) : 0.25;
      out += `<rect x="760" y="436" width="600" height="80" rx="10" fill="${C.teal}" opacity="${pz + 0.15}"/><rect x="760" y="700" width="600" height="80" rx="10" fill="${C.pink}" opacity="${pz + 0.1}"/>
        <text x="1060" y="488" font-size="32" font-weight="900" text-anchor="middle" fill="${C.tealD}" font-family="DM Sans" letter-spacing="3">BUY-SIDE</text>
        <text x="1060" y="752" font-size="32" font-weight="900" text-anchor="middle" fill="${C.pink}" font-family="DM Sans" letter-spacing="3">SELL-SIDE</text>
        <line x1="760" x2="1360" y1="520" y2="520" stroke="${C.tealD}" stroke-width="4" stroke-dasharray="12 8"/><line x1="760" x2="1360" y1="696" y2="696" stroke="${C.pink}" stroke-width="4" stroke-dasharray="12 8"/>`;
      out += poly(partial([[780, 640], [830, 560], [880, 650], [930, 545], [980, 670], [1030, 590], [1060, 608]], ease(seg(r, 0.8, 2.8))), C.dark, 6, 'opacity=".55"');
      if (r > 2.8) {
        const pu = 1 + Math.sin(t * 5) * 0.15;
        out += `<circle cx="1060" cy="608" r="${16 * pu}" fill="${C.purple}" opacity=".3"/><circle cx="1060" cy="608" r="10" fill="${C.purple}"/>` + pill(1150, 640, 'you are here', C.purple, pop(t, s.start + 3), 18);
      }
      // possible paths, none guaranteed
      [[[1060, 608], [1140, 560], [1220, 470]], [[1060, 608], [1140, 660], [1220, 750]], [[1060, 608], [1140, 590], [1230, 620], [1320, 600]]].forEach((pts, i) => {
        const k = ease(seg(r, 12.2 + i * 1.2, 13.2 + i * 1.2));
        if (k <= 0) return;
        out += poly(partial(pts, k), [C.teal, C.pink, C.purple][i], 6, 'stroke-dasharray="12 10"');
        if (k >= 1) out += `<text x="${pts[pts.length - 1][0] + 26}" y="${pts[pts.length - 1][1] + 14}" font-size="40" font-weight="900" fill="${[C.tealD, C.pink, C.purple][i]}" font-family="Playfair Display">?</text>`;
      });
      out += stamp(1060, 608, 'NOT A DESTINATION', pop(t, s.start + 17.4, 0.5), C.pink, -8, 46);
    }
    // walker with a dog on a leash
    const wx = lerp(-160, 520, ease(seg(r, 0.6, 3.6))), walking = r > 0.6 && r < 3.6;
    const wo = { x: wx, y: G, scale: 1.05, look: A.LOOKS.e, seed: 4, walking, t, frontArm: { a1: 60, a2: 30 } };
    const hp = handPos(wo, wo.frontArm);
    const dx = wx + 170, dy = G;
    out += `<path d="M${hp.x},${hp.y} Q${(hp.x + dx + 70) / 2},${(hp.y + dy - 70) / 2 + 40} ${dx + 40},${dy - 74}" stroke="${C.pink}" stroke-width="4" fill="none"/>`;
    out += dog(t, dx, dy, 0.75, { bark: r > 4.4 && r < 5.6 });
    out += P(t, { ...wo, talk: ctx.talking && r > 3 && r < 8.2 });
    const b1 = fade(r, 3.8, 8.2);
    if (b1 > 0) out += A.bubble(470, 480, 'So price has to go up there?', { op: b1, sc: 0.8 + 0.2 * b1, size: 26, italic: true, font: 'Playfair Display', tail: 'left' });
    // ranger arrives
    if (r > 19.4) {
      const rx = lerp(2080, 1620, ease(seg(r, 19.4, 21.4)));
      out += P(t, { x: rx, y: G, scale: 1.05, look: A.LOOKS.a, flip: true, seed: 7, walking: r < 21.4, t, hat: 'ranger', talk: ctx.talking && r > 21.4,
        frontArm: r > 21.4 ? { a1: -30, a2: -60 } : { a1: 100, a2: 95 } });
      const b2 = fade(r, 21.6, 30);
      if (b2 > 0) out += A.bubble(1620, 470, 'It’s a map, not a route!', { op: b2, sc: 0.8 + 0.2 * b2, size: 26, italic: true, font: 'Playfair Display', tail: 'right' });
    }
    return out;
  };

  /* ================= Lesson 3 ================= */

  // Shorts and longs read the same chart and toss their stop pins into the same spots.
  LIVE['s7-pin-cluster'] = (s, t, ctx) => {
    const r = t - s.start, G = 1010;
    const cx = 300, cy = 430, cw = 1320, ch = 320;
    const X = (u) => cx + u * cw, Y = (v) => cy + ch - v * ch;
    let out = ground(G) + panel(240, 400, 1680, 790, pop(t, s.start + 0.2, 0.7));
    const sw = [[0, 0.4], [0.16, 0.6], [0.3, 0.45], [0.42, 0.8], [0.56, 0.45], [0.7, 0.1], [0.84, 0.42], [1, 0.32]];
    out += A.swingChart(t, { x: cx, y: cy, w: cw, h: ch, swings: sw, t0: s.start + 0.5, t1: s.start + 3.4, seed: 41, per: 44, maxBody: 14, wick: 3 });
    const hx = X(0.42), hy = Y(0.8), lx = X(0.7), ly = Y(0.1);
    out += pill(hx, hy + 44, 'high', C.muted, pop(t, s.start + 3.4), 20) + pill(lx, ly - 44, 'low', C.muted, pop(t, s.start + 3.6), 20);
    const pin = (x, y, col, down, k) => (k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}${down ? '' : ',-1'})"><path d="M0,0 C-6,-12 -16,-20 -16,-32 A16,16 0 1,1 16,-32 C16,-20 6,-12 0,0 Z" fill="${col}" stroke="#fff" stroke-width="3"/><circle cy="-32" r="6" fill="#fff"/></g>`);
    const throwers = [
      { x: 300, look: A.LOOKS.seller, at: 5.4, tx: hx - 46, ty: hy - 18, col: C.pink, down: true },
      { x: 450, look: A.LOOKS.d, at: 6.2, tx: hx + 4, ty: hy - 24, col: C.pink, down: true },
      { x: 600, look: { ...A.LOOKS.b, shirt: C.pink }, at: 7, tx: hx + 50, ty: hy - 14, col: C.pink, down: true },
      { x: 1320, look: A.LOOKS.buyer, at: 12.4, tx: lx - 48, ty: ly + 18, col: C.tealD, down: false, flip: true },
      { x: 1470, look: A.LOOKS.c, at: 13.2, tx: lx + 2, ty: ly + 24, col: C.tealD, down: false, flip: true },
      { x: 1620, look: { ...A.LOOKS.e, shirt: C.teal }, at: 14, tx: lx + 50, ty: ly + 14, col: C.tealD, down: false, flip: true },
    ];
    let pins = '';
    throwers.forEach((p, i) => {
      const k = pop(t, s.start + 0.6 + i * 0.15, 0.6);
      const throwing = r > p.at - 0.5 && r < p.at + 0.3;
      const cheer = r > 18.2 && r < 21;
      const fa = cheer ? { a1: -80, a2: -100 + Math.sin(t * 8 + i) * 10 } : throwing ? { a1: -60, a2: -80 } : { a1: 100, a2: 95 };
      out += scaleAt(p.x, G, k, P(t, { x: p.x, y: G, scale: 0.62, look: p.look, seed: i + 1, flip: p.flip, frontArm: fa, talk: ctx.talking && i === (r < 11 ? 0 : 3) && r > 0.4 }));
      const fk = ease(seg(r, p.at, p.at + 0.9));
      if (fk > 0 && fk < 1) {
        const sx = p.x + (p.flip ? -20 : 20), sy = G - 200;
        pins += pin(lerp(sx, p.tx, fk), lerp(sy, p.ty, fk) - Math.sin(fk * Math.PI) * 160, p.col, p.down, 1);
      } else if (fk >= 1) pins += pin(p.tx, p.ty, p.col, p.down, back(seg(r, p.at + 0.9, p.at + 1.3)));
    });
    // clusters
    const c1 = pop(t, s.start + 8.6, 0.6), c2 = pop(t, s.start + 15.2, 0.6);
    if (c1 > 0) out += `<ellipse cx="${hx + 2}" cy="${hy - 40}" rx="${110 * c1}" ry="${44 * c1}" fill="${C.pink}" opacity=".12" stroke="${C.pink}" stroke-width="4" stroke-dasharray="10 8"/>` + pill(hx + 250, hy - 40, 'short stops', C.pink, c1, 24);
    if (c2 > 0) out += `<ellipse cx="${lx + 2}" cy="${ly + 40}" rx="${110 * c2}" ry="${44 * c2}" fill="${C.teal}" opacity=".14" stroke="${C.tealD}" stroke-width="4" stroke-dasharray="10 8"/>` + pill(lx - 250, ly + 40, 'long stops', C.tealD, c2, 24);
    out += pins;
    out += pill(450, 1050, 'SHORTS', C.pink, pop(t, s.start + 4.4), 22) + pill(1470, 1050, 'LONGS', C.tealD, pop(t, s.start + 11.6), 22);
    out += pill(960, 900, 'nobody coordinated ✓ same chart', C.purple, pop(t, s.start + 18.4), 26);
    if (r > 18.4) out += A.sparkle(960, 900, s.start + 18.4, t);
    return out;
  };

  // A courtroom: the trader says "the market targeted me", the owl judge asks what price did.
  LIVE['s7-courtroom'] = (s, t, ctx) => {
    const r = t - s.start, G = 1000;
    let out = ground(G, '#F3E3D7', '#E2CDBE');
    // back wall panels
    for (let i = 0; i < 6; i++) out += `<rect x="${60 + i * 310}" y="420" width="270" height="${G - 450}" rx="16" fill="${C.peachL}" opacity="${0.22 * clamp(r / 0.6)}"/>`;
    // exhibit easel
    const ek = pop(t, s.start + 5.8, 0.7);
    out += scaleAt(1525, 620, ek, `<path d="M1400,${G} L1450,780 M1650,${G} L1600,780" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
      <rect x="1290" y="430" width="470" height="360" rx="16" fill="#fff" stroke="#9B6A45" stroke-width="10"/>`) + pill(1525, 426, 'EXHIBIT A', C.purple, ek, 22);
    if (ek > 0.6) {
      const x = 1320, y = 470, w = 410, h = 290;
      const X = (u) => x + u * w, Y = (v) => y + h - v * h;
      const p1 = [[0, 0.6], [0.2, 0.86], [0.4, 0.45], [0.55, 0.62]], p2 = [[0.55, 0.62], [0.72, 0.28], [1, 0.84]];
      out += `<line x1="${X(0.4)}" x2="${X(1)}" y1="${Y(0.45)}" y2="${Y(0.45)}" stroke="${C.muted}" stroke-width="3" stroke-dasharray="8 6"/>`;
      out += `<line x1="${X(0.4)}" x2="${X(1)}" y1="${Y(0.38)}" y2="${Y(0.38)}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="10 6"/>` + pill(X(0.9), Y(0.38) + 22, 'my stop', C.pink, pop(t, s.start + 7.4), 16);
      out += A.swingChart(t, { x, y, w, h, swings: p1, t0: s.start + 6.4, t1: s.start + 8, seed: 51, per: 30, maxBody: 9, wick: 2 });
      out += A.swingChart(t, { x, y, w, h, swings: p2, t0: s.start + 9.6, t1: s.start + 12, seed: 52, per: 30, maxBody: 9, wick: 2 });
    }
    out += pill(1525, 870, 'traded below the low', C.purple, pop(t, s.start + 16.2), 22) + pill(1525, 926, 'then moved up', C.purple, pop(t, s.start + 17.4), 22);
    // judge's bench + owl
    const bk = pop(t, s.start + 0.3, 0.8);
    const bang = (r > 19 && r < 19.3) || (r > 19.7 && r < 20);
    out += scaleAt(960, 800, bk, owl(t, 960, 720, 0.95, { talk: ctx.talking && r > 13 && r < 25, gavel: bang ? 85 : 25 }) +
      `<rect x="740" y="690" width="440" height="${G - 690}" rx="10" fill="#B98258"/><rect x="720" y="672" width="480" height="30" rx="10" fill="#9B6A45"/>
      <circle cx="960" cy="830" r="54" fill="${C.gold}" opacity=".85"/><path d="M930,830 L990,830 M960,800 L960,860 M936,812 L984,812" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
      <rect x="1180" y="664" width="70" height="20" rx="6" fill="#9B6A45"/>`);
    if (bang) out += `<g transform="translate(1080,640)">${[0, 1, 2, 3].map((i) => `<line x1="${Math.cos(rad(-60 - i * 30)) * 40}" y1="${Math.sin(rad(-60 - i * 30)) * 40}" x2="${Math.cos(rad(-60 - i * 30)) * 70}" y2="${Math.sin(rad(-60 - i * 30)) * 70}" stroke="${C.peach}" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>`;
    // witness stand + trader
    const tk = pop(t, s.start + 0.8, 0.7);
    const upset = r < 13;
    out += scaleAt(400, G, tk, P(t, { x: 400, y: G, scale: 1.3, look: A.LOOKS.d, seed: 8, mood: upset && !ctx.talking ? 'sad' : undefined,
      frontArm: r > 1.2 && r < 6 ? { a1: -40, a2: -80 + Math.sin(t * 7) * 12 } : r > 6 && r < 13 ? { a1: -10, a2: -10 } : { a1: 100, a2: 95 }, talk: ctx.talking && r < 6 }) +
      `<rect x="250" y="820" width="300" height="${G - 820}" rx="10" fill="#C9A27A"/><rect x="236" y="806" width="328" height="24" rx="8" fill="#9B6A45"/>`);
    const b1 = fade(r, 1.4, 6.4);
    if (b1 > 0) out += A.bubble(450, 520, 'The market targeted me!', { op: b1, sc: 0.8 + 0.2 * b1, size: 28, italic: true, font: 'Playfair Display', tail: 'left' });
    const b2 = fade(r, 13.4, 18.6);
    if (b2 > 0) out += A.bubble(960, 430, 'Describe what price did.', { op: b2, sc: 0.8 + 0.2 * b2, size: 28, italic: true, font: 'Playfair Display', tail: 'left' });
    // bailiff dog
    out += dog(t, 1240, G, 0.7, { flip: true, bark: bang });
    out += pill(960, 1044, 'structure, not a conspiracy', C.teal, pop(t, s.start + 20.2), 26);
    return out;
  };

  /* ================= Lesson 4 ================= */

  // Swap glasses: the structure lens reads HL/HH, the liquidity lens reads pools at the same points.
  LIVE['s7-lens-swap'] = (s, t, ctx) => {
    const r = t - s.start, G = 1030;
    const x = 660, y = 510, w = 1000, h = 380;
    const X = (u) => x + u * w, Y = (v) => y + h - v * h;
    let out = ground(G) + panel(600, 400, 1720, 990, pop(t, s.start + 0.2, 0.7));
    const sw = [[0, 0.06], [0.16, 0.48], [0.3, 0.26], [0.5, 0.7], [0.64, 0.48], [0.84, 0.92], [1, 0.74]];
    out += A.swingChart(t, { x, y, w, h, swings: sw, t0: s.start + 0.5, t1: s.start + 3.6, seed: 61, per: 40, maxBody: 16, wick: 3 });
    const liq = r > 12.2;
    const swapK = seg(r, 11.8, 12.6);
    const pts = [[1, 'HH', true], [2, 'HL', false], [3, 'HH', true], [4, 'HL', false], [5, 'HH', true]];
    const out1 = 1 - seg(r, 11.8, 12.2);
    pts.forEach(([i, lab, hi], j) => {
      const [u, v] = sw[i], px = X(u), py = Y(v);
      const k1 = pop(t, s.start + 5 + j * 0.45, 0.5) * out1;
      if (k1 > 0) out += `<circle cx="${px}" cy="${py}" r="9" fill="${C.teal}" stroke="#fff" stroke-width="3" opacity="${out1}"/>` + pill(px, py + (hi ? -42 : 42), lab, hi ? C.tealD : C.teal, k1, 22);
      const k2 = pop(t, s.start + 13.2 + j * 0.5, 0.6);
      if (k2 > 0) {
        const wy = py + (hi ? -46 : 46), rip = Math.sin(t * 3 + j) * 4;
        out += `<g transform="translate(${px},${wy}) scale(${k2})"><ellipse rx="${70 + rip}" ry="${22 + rip * 0.3}" fill="${C.purpleL}" opacity=".7"/><ellipse rx="${48 - rip}" ry="${13}" fill="none" stroke="${C.purple}" stroke-width="3" opacity=".7"/>
          <ellipse cx="${-20}" cy="-4" rx="12" ry="3" fill="#fff" opacity=".7"/></g>`;
        if (j === 2 || j === 1) out += pill(px, wy + (hi ? -38 : 38), 'pool', C.purple, k2, 18);
      }
    });
    out += pill(1160, 952, 'what is price building?', C.tealD, pop(t, s.start + 8) * out1, 26);
    out += pill(1160, 952, 'where might orders rest?', C.purple, pop(t, s.start + 16.4), 26);
    // reader with swappable glasses
    const lensCol = liq ? C.purple : C.teal;
    const po = { x: 330, y: G, scale: 1.3, look: { ...A.LOOKS.b, hairStyle: 'puff', hair: '#7A4A2A' }, seed: 3, t,
      frontArm: r > 11.6 && r < 12.8 ? { a1: -70, a2: -130 } : r > 4.8 ? { a1: -15, a2: -25 } : { a1: 100, a2: 95 }, talk: ctx.talking };
    out += P(t, po);
    const gk = r < 3.8 ? 0 : 1;
    if (gk) {
      const lift = r > 11.8 && r < 12.6 ? Math.sin(swapK * Math.PI) * 40 : 0;
      out += `<g transform="translate(0,${-lift})">${headwear(t, po, 'glasses', lensCol)}</g>`;
    }
    out += pill(330, 520, liq ? 'LIQUIDITY LENS' : 'STRUCTURE LENS', liq ? C.purple : C.tealD, liq ? pop(t, s.start + 12.4) : pop(t, s.start + 4), 24);
    // parrot perched on the chart frame
    out += parrot(t, 530, G, 0.8, { talk: r > 20.4 && r < 23 });
    const b = fade(r, 20.4, 25);
    if (b > 0) out += A.bubble(480, 880, 'Same level!', { op: b, sc: 0.8 + 0.2 * b, size: 26, weight: 700, tail: 'left' });
    if (r > 20.4) out += A.sparkle(X(0.5), Y(0.7), s.start + 20.4, t, C.purple);
    return out;
  };

  // Fishermen at ponds where orders may gather. Nobody can count the fish.
  LIVE['s7-fishing-pond'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="600" width="1920" height="480" fill="${C.peachL}" opacity=".35"/><rect x="0" y="600" width="1920" height="4" fill="${C.peachL}"/>`;
    // sun + drifting clouds
    out += `<circle cx="1700" cy="470" r="${56 + Math.sin(t * 2) * 3}" fill="${C.gold}" opacity=".55"/>`;
    [[200, 440], [1220, 470]].forEach(([cx0, cy], i) => {
      const cx = cx0 + ((t * 18 + i * 300) % 400) - 200;
      out += `<g opacity=".8"><ellipse cx="${cx}" cy="${cy}" rx="80" ry="26" fill="#fff"/><ellipse cx="${cx + 40}" cy="${cy - 18}" rx="46" ry="26" fill="#fff"/><ellipse cx="${cx - 34}" cy="${cy - 12}" rx="36" ry="20" fill="#fff"/></g>`;
    });
    const ponds = [[480, 760, 'swing highs & lows'], [900, 950, 'equal highs & lows'], [1320, 770, 'range edges'], [1580, 960, 'session highs & lows']];
    ponds.forEach(([px, py, lab], i) => {
      const k = pop(t, s.start + 1 + i * 1.6, 0.7);
      if (k <= 0) return;
      const rip = ((t * 0.5 + i * 0.3) % 1);
      out += scaleAt(px, py, k, `<ellipse cx="${px}" cy="${py}" rx="190" ry="62" fill="${C.teal}"/><ellipse cx="${px}" cy="${py - 6}" rx="166" ry="48" fill="${C.tealL}" opacity=".6"/>
        <ellipse cx="${px + 30}" cy="${py}" rx="${30 + rip * 70}" ry="${8 + rip * 16}" fill="none" stroke="#fff" stroke-width="3" opacity="${1 - rip}"/>`) +
        pill(px, py - 100, lab, i % 2 ? C.purple : C.tealD, k, 24);
    });
    [[0, 1320, 770, 6], [2, 480, 760, 10.5], [1, 1580, 960, 19.4]].forEach(([i, px, py, at]) => {
      const k = seg(r, at, at + 1.2);
      if (k > 0 && k < 1) out += fish(t, px - 70 + k * 140, py - Math.sin(k * Math.PI) * 140, 0.7, -60 + k * 120, C.peach);
      if (k >= 1 && k < 1.5) out += A.sparkle(px + 70, py, s.start + at + 1.2, t, C.teal);
    });
    out += duck(t, 900 + Math.sin(t * 0.6) * 80, 950, 0.95, Math.cos(t * 0.6) < 0);
    // fishermen: rod line ends at a bobber in their pond
    [[200, 790, A.LOOKS.c, false, 1, 0], [1060, 800, A.LOOKS.seller, false, 3, 2], [1860, 990, A.LOOKS.a, true, 4.6, 3]].forEach(([fx, fy, look, flip, at, pi], i) => {
      const k = pop(t, s.start + at, 0.6);
      if (k <= 0) return;
      const sc = 0.78, fa = { a1: -10, a2: -40 };
      const o = { x: fx, y: fy, scale: sc, look, flip, seed: i + 2, t, frontArm: fa };
      const h = handPos(o, fa), d = flip ? -1 : 1;
      const tipX = h.x + d * 120, tipY = h.y - 120;
      const bob = Math.sin(t * 3 + i) * 5, bx = ponds[pi][0] + (flip ? 60 : -60), by = ponds[pi][1] + bob;
      out += scaleAt(fx, fy, k, P(t, { ...o, hat: i === 1 ? 'cap' : i === 2 ? 'ranger' : undefined, hatCol: C.purple, talk: false }) +
        `<line x1="${h.x}" y1="${h.y}" x2="${tipX}" y2="${tipY}" stroke="#9B6A45" stroke-width="7" stroke-linecap="round"/>
        <path d="M${tipX},${tipY} Q${(tipX + bx) / 2},${tipY + 30} ${bx},${by}" fill="none" stroke="${C.muted}" stroke-width="2.5"/><circle cx="${bx}" cy="${by}" r="9" fill="${C.pink}" stroke="#fff" stroke-width="3"/>`);
    });
    const sk = pop(t, s.start + 12.4, 0.7);
    if (sk > 0) {
      const unknown = r > 15;
      out += scaleAt(960, 500, sk, `<rect x="690" y="440" width="540" height="110" rx="16" fill="#fff" stroke="#9B6A45" stroke-width="8"/>
        <text x="960" y="482" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">POOL SIZE</text>
        <text x="960" y="532" font-size="38" font-weight="900" text-anchor="middle" fill="${unknown ? C.purple : C.dark}" font-family="Playfair Display">${unknown ? '???' : '4,200 contracts'}</text>`);
      const xk = ease(seg(r, 14.2, 14.8)) * (1 - seg(r, 14.9, 15.1));
      if (xk > 0) out += `<line x1="720" y1="540" x2="${lerp(720, 1200, xk)}" y2="${lerp(540, 452, xk)}" stroke="${C.pink}" stroke-width="12" stroke-linecap="round"/>`;
    }
    out += pill(960, 600, 'an area, never a count', C.purple, pop(t, s.start + 17.6), 26);
    return out;
  };

  /* ================= Lesson 5 ================= */

  // A builder lays a spirit level across two highs, then two lows: close enough counts.
  LIVE['s7-spirit-level'] = (s, t, ctx) => {
    const r = t - s.start, G = 1030;
    const x = 240, y = 450, w = 1080, h = 520;
    const X = (u) => x + u * w, Y = (v) => y + h - v * h;
    let out = ground(G) + panel(180, 400, 1400, 990, pop(t, s.start + 0.2, 0.7));
    const sw = [[0, 0.3], [0.16, 0.79], [0.31, 0.46], [0.46, 0.8], [0.61, 0.24], [0.76, 0.22], [0.88, 0.5], [1, 0.42]];
    out += A.swingChart(t, { x, y, w, h, swings: sw, t0: s.start + 0.5, t1: s.start + 3.4, seed: 71, per: 44, maxBody: 15, wick: 3 });
    // level bar: from the highs to the lows
    const mv = ease(seg(r, 15, 17));
    const hiBar = { x0: X(0.1), x1: X(0.52), yb: Y(0.8) - 6 }, loBar = { x0: X(0.55), x1: X(0.82), yb: Y(0.22) + 40 };
    const drop = ease(seg(r, 5, 6.6));
    const bx0 = lerp(hiBar.x0, loBar.x0, mv), bx1 = lerp(hiBar.x1, loBar.x1, mv), byb = lerp(lerp(380, hiBar.yb, drop), loBar.yb, mv);
    const band = (x0, x1, v0, v1, k) => (k <= 0 ? '' : `<rect x="${x0}" y="${Y(v0)}" width="${(x1 - x0) * k}" height="${Y(v1) - Y(v0)}" fill="${C.peach}" opacity=".3"/>`);
    out += band(X(0.1), X(0.56), 0.83, 0.77, ease(seg(r, 8.6, 9.6)) * (1 - seg(r, 14.6, 15)));
    out += band(X(0.55), X(0.84), 0.26, 0.19, ease(seg(r, 17.6, 18.6)));
    if (r > 4.8) {
      const settle = (a) => (r < a ? 1 : Math.exp(-(r - a) * 1.6));
      const wob = (r < 15 ? settle(6.6) * Math.sin((r - 6.6) * 9) : settle(17) * Math.sin((r - 17) * 9)) * 18;
      const mx = (bx0 + bx1) / 2, by = mv > 0 && mv < 1 ? byb : mv >= 1 ? loBar.yb : byb;
      const top = mv >= 1 ? by - 4 : by - 34;
      const yb = mv >= 1 ? by - 34 : by - 34;
      out += `<rect x="${bx0}" y="${yb}" width="${bx1 - bx0}" height="30" rx="8" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>
        <rect x="${mx - 50}" y="${yb + 6}" width="100" height="18" rx="9" fill="${C.tealL}" stroke="${C.tealD}" stroke-width="2"/>
        <line x1="${mx - 14}" x2="${mx - 14}" y1="${yb + 6}" y2="${yb + 24}" stroke="${C.tealD}" stroke-width="2"/><line x1="${mx + 14}" x2="${mx + 14}" y1="${yb + 6}" y2="${yb + 24}" stroke="${C.tealD}" stroke-width="2"/>
        <circle cx="${mx + wob}" cy="${yb + 15}" r="7" fill="#fff"/>`;
      void top;
      // bird hitches a ride on the level
      const bIn = ease(seg(r, 7.4, 8.6)), bOut = ease(seg(r, 13.6, 14.8));
      if (bIn > 0 && bOut < 1) {
        const px = lerp(1500, bx0 + 60, bIn), py = lerp(380, yb - 30, bIn) - bOut * 400, pxx = px - bOut * 600;
        out += bird(t, pxx, py, 0.7, { perched: bIn >= 1 && bOut <= 0, flip: true, col: C.pink });
      }
    }
    out += pill(X(0.31), 450, 'close enough counts', C.peach, pop(t, s.start + 8.8) * (1 - seg(r, 11.2, 11.5)), 22);
    out += pill(X(0.31), 450, 'EQUAL HIGHS', C.tealD, pop(t, s.start + 11.4), 24);
    out += pill(1120, 520, 'potential buy-side ↑', C.teal, pop(t, s.start + 12.4), 22);
    out += pill(X(0.685), Y(0.22) + 96, 'EQUAL LOWS', C.pink, pop(t, s.start + 18), 24);
    out += pill(560, 900, 'potential sell-side ↓', C.pink, pop(t, s.start + 19.4), 22);
    // builder
    const bo = { x: 1620, y: G, scale: 1.15, look: A.LOOKS.c, flip: true, seed: 5, t, hat: 'hard',
      frontArm: (r > 5 && r < 7) || (r > 15 && r < 17.4) ? { a1: -20, a2: -10 } : r > 11 && r < 13 ? { a1: -60, a2: -90 } : { a1: 100, a2: 95 }, talk: ctx.talking,
      hold: `<g transform="rotate(-10)"><rect x="-6" y="-40" width="12" height="44" rx="4" fill="#9B6A45"/><rect x="-22" y="-62" width="44" height="26" rx="6" fill="${C.muted}"/></g>` };
    out += P(t, bo);
    return out;
  };

  // A dangling magnet over equal highs. Run one: price trades through. Run two: price turns away.
  LIVE['s7-magnet'] = (s, t, ctx) => {
    const r = t - s.start, G = 1020;
    let out = ground(G) + panel(420, 400, 1720, 990, pop(t, s.start + 0.2, 0.7));
    const lineY = 600;
    const hist = [[470, 900], [650, 604], [800, 790], [960, 600], [1100, 830]];
    out += poly(partial(hist, ease(seg(r, 0.6, 2.6))), C.dark, 7, 'opacity=".7"');
    const lk = ease(seg(r, 2.4, 3.4));
    if (lk > 0) out += `<line x1="600" x2="${lerp(600, 1690, lk)}" y1="${lineY}" y2="${lineY}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>` +
      check(650, 604, pop(t, s.start + 2.6, 0.4), true, 14) + check(960, 600, pop(t, s.start + 2.9, 0.4), true, 14) + pill(805, 560, 'equal highs', C.purple, pop(t, s.start + 3.2), 20);
    // magnet on a string
    const swing = Math.sin(t * 1.6) * 6;
    out += `<g transform="translate(1340,400) rotate(${swing})"><line x1="0" y1="0" x2="0" y2="40" stroke="${C.muted}" stroke-width="4"/>
      <g transform="translate(0,90)"><path d="M-60,-50 L-60,10 A60,60 0 0,0 60,10 L60,-50 L28,-50 L28,10 A28,28 0 0,1 -28,10 L-28,-50 Z" fill="${C.pink}" transform="rotate(180)"/>
      <rect x="-60" y="38" width="32" height="20" fill="#E8E1DC"/><rect x="28" y="38" width="32" height="20" fill="#E8E1DC"/></g></g>`;
    const fieldOn = r > 3.6;
    if (fieldOn) for (let i = 0; i < 3; i++) {
      const p = ((t * 0.8) + i / 3) % 1;
      out += `<path d="M${1290 - p * 30},${560 + p * 20} Q1340,${590 + p * 30} ${1390 + p * 30},${560 + p * 20}" fill="none" stroke="${C.pinkL}" stroke-width="4" opacity="${1 - p}"/>`;
    }
    // runs
    const runA = [[1100, 830], [1220, 690], [1290, 630], [1345, 572], [1420, 650], [1530, 740]];
    const runB = [[1100, 830], [1210, 700], [1290, 652], [1380, 760], [1500, 870], [1640, 930]];
    const kA = ease(seg(r, 4, 9.2)), fA = 1 - seg(r, 10, 10.6) * 0.75;
    const kB = ease(seg(r, 10.6, 15.8)), fB = 1 - seg(r, 16.4, 17) * 0.7;
    if (kA > 0) {
      const pa = partial(runA, kA), tip = pa[pa.length - 1];
      out += poly(pa, C.teal, 7, `opacity="${fA}"`) + (kA < 1 ? `<circle cx="${tip[0]}" cy="${tip[1]}" r="12" fill="${C.dark}"/>` : '');
    }
    if (kB > 0) {
      const pb = partial(runB, kB), tip = pb[pb.length - 1];
      out += poly(pb, C.pink, 7, `opacity="${fB}"`) + (kB < 1 ? `<circle cx="${tip[0]}" cy="${tip[1]}" r="12" fill="${C.dark}"/>` : '');
    }
    // paper clips: fly to the magnet only when price trades through (run A), reset for run B
    const taken = r > 6.4 && r < 10.4;
    [1250, 1290, 1330, 1370, 1410, 1450].forEach((cx, i) => {
      const k = ease(seg(r, 6.4 + i * 0.08, 7.2 + i * 0.08)) * (1 - seg(r, 10.2, 10.6));
      const rest = { x: cx, y: 585 - (i % 2) * 10 }, mag = { x: 1330 + (i - 2.5) * 16, y: 530 };
      const px = lerp(rest.x, mag.x, k), py = lerp(rest.y, mag.y, k) - Math.sin(k * Math.PI) * 30;
      const ap = pop(t, s.start + 3.8 + i * 0.1, 0.4);
      if (ap > 0) out += `<g transform="translate(${px},${py}) rotate(${(i % 2 ? 20 : -20) + k * 60}) scale(${ap})"><rect x="-6" y="-12" width="12" height="24" rx="6" fill="none" stroke="${C.muted}" stroke-width="3"/></g>`;
    });
    void taken;
    out += pill(1500, 940, 'sometimes: trades through', C.teal, pop(t, s.start + 8) * (1 - seg(r, 10.2, 10.5)), 22);
    out += pill(1430, 470, 'sometimes: turns away', C.pink, pop(t, s.start + 14.6) * (1 - seg(r, 16.8, 17.1)), 22);
    out += pill(900, 850, 'obvious area ✓', C.tealD, pop(t, s.start + 17.4), 24) + pill(900, 905, 'worth monitoring ✓', C.tealD, pop(t, s.start + 18.8), 24) +
      pill(900, 960, 'guaranteed ✗', C.pink, pop(t, s.start + 22.2), 24);
    // robot fan and a curious cat
    out += robot(t, 230, G, 0.95, { a1: r > 4 && r < 16 ? -50 : 80, a2: r > 4 && r < 16 ? -70 : 90, talk: ctx.talking && r > 17, face: r > 22 ? undefined : r > 17.4 ? 'happy' : undefined });
    if (r > 6.6 && r < 9.6) out += bubbleTiny(330, 560, 'beep!');
    if (r > 12.8 && r < 15.6) out += bubbleTiny(330, 560, 'hmm?');
    const ck = pop(t, s.start + 1.2, 0.6);
    out += scaleAt(1820, G, ck, cat(t, 1820, G, 0.8, { col: C.purpleL, dark: C.purple, flip: true, hop: r > 6.4 && r < 7.2 ? Math.sin((r - 6.4) / 0.8 * Math.PI) * 50 : 0 }));
    return out;
  };
  function bubbleTiny(x, y, text) { return A.bubble(x, y, text, { size: 24, weight: 700, color: C.purple, tail: 'left', w: text.length * 15 + 40 }); }

  /* ================= Lesson 6 ================= */

  // A fish tank: the rim and the floor are the external high and low, rocks inside are internal.
  LIVE['s7-aquarium'] = (s, t, ctx) => {
    const r = t - s.start, G = 1010;
    const tx0 = 420, tx1 = 1500, ty0 = 470, ty1 = 940, surf = 520, floor = 880;
    let out = ground(G);
    const tk = pop(t, s.start + 0.3, 0.8);
    let tank = `<rect x="${tx0 - 20}" y="${ty1}" width="${tx1 - tx0 + 40}" height="${G - ty1}" rx="10" fill="#B98258"/>
      <rect x="${tx0}" y="${surf}" width="${tx1 - tx0}" height="${ty1 - surf}" fill="${C.tealL}" opacity=".55"/>
      <path d="M${tx0},${floor} ${[...Array(12)].map((_, i) => `Q${tx0 + 45 + i * 90},${floor - 18} ${tx0 + 90 + i * 90},${floor}`).join(' ')} L${tx1},${ty1} L${tx0},${ty1} Z" fill="${C.peachL}"/>
      <path d="M${tx0},${surf} ${[...Array(12)].map((_, i) => `Q${tx0 + 45 + i * 90},${surf + Math.sin(t * 2 + i) * 6 - 6} ${tx0 + 90 + i * 90},${surf}`).join(' ')}" fill="none" stroke="${C.teal}" stroke-width="4"/>`;
    // rocks + plants inside (internal highs and lows)
    tank += `<path d="M600,${floor} Q640,700 760,690 Q860,700 900,${floor} Z" fill="${C.muted}" opacity=".55"/>
      <path d="M1000,${floor} Q1050,800 1130,790 Q1250,800 1280,${floor} Z" fill="${C.purpleL}"/>
      ${[0, 1, 2].map((i) => `<path d="M${480 + i * 26},${floor} Q${470 + i * 26 + Math.sin(t * 2 + i) * 12},${floor - 90} ${486 + i * 26},${floor - 170 + i * 30}" fill="none" stroke="${C.tealD}" stroke-width="10" stroke-linecap="round"/>`).join('')}
      ${[0, 1].map((i) => `<path d="M${1380 + i * 30},${floor} Q${1370 + i * 30 + Math.sin(t * 2.4 + i) * 12},${floor - 70} ${1390 + i * 30},${floor - 140}" fill="none" stroke="${C.tealD}" stroke-width="10" stroke-linecap="round"/>`).join('')}`;
    tank += `<rect x="${tx0}" y="${ty0}" width="${tx1 - tx0}" height="${ty1 - ty0}" rx="12" fill="none" stroke="${C.dark}" stroke-width="10" opacity=".85"/>`;
    out += scaleAt(960, 720, tk, tank);
    // bubbles
    for (let i = 0; i < 6; i++) {
      const p = ((t * 0.35) + i / 6) % 1;
      out += `<circle cx="${560 + i * 160 + Math.sin(p * 8 + i) * 10}" cy="${lerp(floor - 20, surf + 10, p)}" r="${5 + (i % 3) * 3}" fill="none" stroke="#fff" stroke-width="3" opacity="${(1 - p) * tk}"/>`;
    }
    // external lines
    const ek = ease(seg(r, 2, 3.2));
    if (ek > 0) out += `<line x1="${tx0 - 60}" x2="${lerp(tx0 - 60, tx1 + 80, ek)}" y1="${surf}" y2="${surf}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>
      <line x1="${tx0 - 60}" x2="${lerp(tx0 - 60, tx1 + 80, ek)}" y1="${floor}" y2="${floor}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>`;
    out += pill(1720, surf, 'EXTERNAL HIGH', C.purple, pop(t, s.start + 3.6), 24) + pill(1720, floor, 'EXTERNAL LOW', C.purple, pop(t, s.start + 4.2), 24);
    // internal lines
    const ik = ease(seg(r, 8.4, 9.4));
    if (ik > 0) out += `<line x1="660" x2="${lerp(660, 860, ik)}" y1="690" y2="690" stroke="${C.peach}" stroke-width="4" stroke-dasharray="10 8"/>
      <line x1="1040" x2="${lerp(1040, 1230, ik)}" y1="790" y2="790" stroke="${C.peach}" stroke-width="4" stroke-dasharray="10 8"/>` +
      pill(940, 662, 'internal high', C.peach, pop(t, s.start + 9), 18) + pill(1135, 760, 'internal low', C.peach, pop(t, s.start + 9.3), 18);
    // the fish (price)
    if (r > 8.8) {
      const fp = kf(r, [[8.8, 520, 760], [11.6, 760, 672], [13.2, 900, 740], [15.2, 1180, 720], [16.6, 1300, 466], [17.8, 1420, 640], [20, 1300, 770], [26, 820, 760]]);
      const ang = Math.atan2(fp.vy, fp.vx) * 180 / Math.PI;
      const flipX = fp.vx < 0;
      out += `<g transform="translate(${fp.x},${fp.y}) scale(${flipX ? -1 : 1},1) translate(${-fp.x},${-fp.y})">${fish(t, fp.x, fp.y, 0.85, flipX ? 180 - ang - 180 : ang, C.pink)}</g>`;
      if (r > 11.4 && r < 12.6) out += `<circle cx="760" cy="690" r="${(r - 11.4) * 60}" fill="none" stroke="${C.peach}" stroke-width="4" opacity="${1 - (r - 11.4) / 1.2}"/>`;
      out += A.sparkle(1250, surf, s.start + 16.1, t, C.teal) + A.sparkle(1390, surf, s.start + 17.3, t, C.teal);
    }
    out += pill(760, 610, 'internal ✓', C.peach, pop(t, s.start + 12), 24);
    out += pill(1300, 420, 'external ✓', C.purple, pop(t, s.start + 17), 26);
    // the cat watching (startled by the leap)
    const hop = r > 16.4 && r < 17.2 ? Math.sin((r - 16.4) / 0.8 * Math.PI) * 70 : 0;
    out += cat(t, 240, G, 1.25, { hop, col: C.muted, dark: '#5C4A40' });
    if (hop > 0) out += `<text x="300" y="${G - 260 - hop}" font-size="64" font-weight="900" fill="${C.pink}" font-family="Playfair Display">!</text>`;
    return out;
  };

  // A game show: define the range, then buzz in: internal or external?
  LIVE['s7-quiz-show'] = (s, t, ctx) => {
    const r = t - s.start, G = 960;
    let out = `<rect x="0" y="${G}" width="1920" height="${1080 - G}" fill="${C.purple}" opacity=".85"/><rect x="0" y="${G}" width="1920" height="8" fill="${C.purpleL}"/>`;
    // spotlights
    [500, 1460].forEach((lx, i) => { out += `<path d="M${lx},380 L${lx - 160 + Math.sin(t + i) * 40},${G} L${lx + 160 + Math.sin(t + i) * 40},${G} Z" fill="${C.gold}" opacity=".07"/>`; });
    // screen with bulbs
    const sk = pop(t, s.start + 0.3, 0.8);
    let scr = `<rect x="620" y="390" width="680" height="400" rx="22" fill="${C.dark}"/><rect x="640" y="410" width="640" height="360" rx="14" fill="${C.cream}"/>`;
    for (let i = 0; i < 18; i++) {
      const bx = 630 + (i % 9) * 82.5, by = i < 9 ? 398 : 782, on = (Math.floor(t * 3) + i) % 3 === 0;
      scr += `<circle cx="${bx + 10}" cy="${by}" r="7" fill="${on ? C.gold : '#7A6A60'}"/>`;
    }
    out += scaleAt(960, 590, sk, scr + `<rect x="900" y="790" width="120" height="${G - 790}" fill="${C.dark}" opacity=".7"/>`);
    if (sk > 0.6) {
      const hi = 480, lo = 700;
      const hist = [[680, 600], [740, 488], [800, 640], [860, 560], [920, 690], [990, 590], [1050, 660], [1110, 610]];
      out += poly(partial(hist, ease(seg(r, 1, 3))), C.dark, 6, 'opacity=".7"');
      const rk = ease(seg(r, 3.6, 5.4));
      if (rk > 0) out += `<rect x="670" y="${hi}" width="${560 * rk}" height="${lo - hi}" fill="none" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 10"/>`;
      out += pill(1180, hi - 18, 'RANGE', C.purple, pop(t, s.start + 5.2), 18);
      // internal high marker
      out += `<line x1="960" x2="1080" y1="590" y2="590" stroke="${C.peach}" stroke-width="4" stroke-dasharray="8 6" opacity="${clamp((r - 7.8) / 0.4)}"/>`;
      const q1 = ease(seg(r, 8.4, 10)), q2 = ease(seg(r, 13.8, 15.8));
      const p1 = [[1110, 610], [1150, 572]], p2 = [[1150, 572], [1190, 650], [1222, 724]];
      if (q1 > 0) out += poly(partial(p1, q1), C.teal, 7);
      if (q2 > 0) out += poly(partial(p2, q2), C.pink, 7);
      const tip = q2 > 0 ? alongPath(p2, q2) : q1 > 0 ? alongPath(p1, q1) : null;
      if (tip && q2 < 1) out += `<circle cx="${tip.x}" cy="${tip.y}" r="10" fill="${C.dark}"/>`;
      if (r > 10 && r < 13.4) out += `<circle cx="1150" cy="575" r="${18 + Math.sin(t * 8) * 4}" fill="none" stroke="${C.teal}" stroke-width="4"/>`;
      if (r > 15.8) out += `<circle cx="1222" cy="720" r="${18 + Math.sin(t * 8) * 4}" fill="none" stroke="${C.pink}" stroke-width="4"/>`;
      out += pill(820, 452, 'INTERNAL ✓', C.teal, pop(t, s.start + 11.4) * (1 - seg(r, 13.4, 13.7)), 26);
      out += pill(820, 740, 'EXTERNAL ✓', C.purple, pop(t, s.start + 17.2), 26);
    }
    out += pill(960, 1020, 'STEP 1 · define the range', C.gold, pop(t, s.start + 3.2), 26);
    // contestant + buzzers
    const press1 = r > 11 && r < 11.8, press2 = r > 16.8 && r < 17.6;
    const co = { x: 380, y: G, scale: 1, look: A.LOOKS.buyer, seed: 2, t,
      frontArm: press1 ? { a1: 60, a2: 120 } : press2 ? { a1: 30, a2: 70 } : r > 19.6 ? { a1: -80, a2: -100 } : { a1: 100, a2: 95 }, talk: ctx.talking && (Math.abs(r - 11.4) < 0.8 || Math.abs(r - 17.6) < 1.2) };
    out += P(t, co);
    const btn = (x, label, col, pressed) => `<rect x="${x - 56}" y="${pressed ? 806 : 798}" width="112" height="${pressed ? 18 : 26}" rx="10" fill="${col}"/><rect x="${x - 70}" y="822" width="140" height="18" rx="6" fill="${C.dark}"/>
      <text x="${x}" y="868" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${label}</text>`;
    out += `<rect x="230" y="830" width="300" height="${G - 830}" rx="14" fill="${C.pink}"/>` + btn(310, 'INTERNAL', C.teal, press1) + btn(450, 'EXTERNAL', C.purpleL, press2);
    if (press1 || press2) out += A.sparkle(press1 ? 310 : 450, 790, s.start + (press1 ? 11 : 16.8), t, C.gold);
    // host with a mic
    const ho = { x: 1580, y: G, scale: 1.05, look: A.LOOKS.seller, flip: true, seed: 6, t, hat: undefined,
      frontArm: { a1: -10, a2: -75 }, hold: `<g><rect x="-6" y="-10" width="12" height="40" rx="5" fill="${C.dark}"/><circle cy="-16" r="13" fill="${C.muted}"/></g>`,
      backArm: r > 19.6 ? { a1: 220, a2: 250 } : undefined, talk: ctx.talking };
    out += P(t, ho);
    const b1 = fade(r, 8.2, 10.8), b2 = fade(r, 13.8, 16.6);
    if (b1 > 0) out += A.bubble(1560, 470, 'Which liquidity?', { op: b1, sc: 0.8 + 0.2 * b1, size: 28, italic: true, font: 'Playfair Display', tail: 'right' });
    if (b2 > 0) out += A.bubble(1560, 470, 'And this one?', { op: b2, sc: 0.8 + 0.2 * b2, size: 28, italic: true, font: 'Playfair Display', tail: 'right' });
    out += confetti(t, s.start + 20.6);
    return out;
  };

  /* ================= Lesson 7 ================= */

  // An instant replay on a sports TV: describe the two candles first, name it second.
  LIVE['s7-instant-replay'] = (s, t, ctx) => {
    const r = t - s.start, G = 1010;
    const Yp = (p) => 470 + (20012 - p) * (380 / 32);
    let out = ground(G);
    const tvk = pop(t, s.start + 0.2, 0.8);
    out += scaleAt(880, 650, tvk, `<rect x="360" y="400" width="1040" height="500" rx="28" fill="${C.dark}"/><rect x="380" y="420" width="1000" height="460" rx="16" fill="${C.cream}"/>
      <rect x="840" y="900" width="80" height="60" fill="${C.dark}"/><rect x="740" y="956" width="280" height="20" rx="10" fill="${C.dark}"/>`);
    if (tvk > 0.6) {
      const rec = Math.floor(t * 1.6) % 2;
      out += `<circle cx="420" cy="450" r="10" fill="${rec ? C.pink : '#E8C7CF'}"/><text x="440" y="459" font-size="22" font-weight="900" fill="${C.pink}" font-family="DM Sans" letter-spacing="2">REPLAY</text>`;
      // history candles
      const closes = [19986, 19992, 19998, 19995, 19990, 19986, 19983, 19985, 19988, 19990];
      let prev = 19982;
      closes.forEach((c, i) => {
        const k = clamp((r - 0.6 - i * 0.12) / 0.3);
        if (k <= 0) { prev = c; return; }
        const o = prev, hi = i === 3 ? 20000 : Math.max(o, c) + 1.5, lo = Math.min(o, c) - 1.5;
        out += `<g opacity="${k}">${candle(440 + i * 52, Yp(o), Yp(c), Yp(hi), Yp(lo), c >= o, 26)}</g>`;
        prev = c;
      });
      const lk = ease(seg(r, 2, 3));
      if (lk > 0) out += `<line x1="596" x2="${lerp(596, 1360, lk)}" y1="${Yp(20000)}" y2="${Yp(20000)}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>`;
      out += pill(1250, Yp(20000) + 34, 'previous high · 20,000', C.purple, pop(t, s.start + 2.6), 20);
      out += pill(1060, Yp(19990) + 4, '19,990', C.muted, pop(t, s.start + 3.4) * (1 - seg(r, 5, 5.3)), 20);
      // candle 1: up to 20,008, closes 19,997
      const k1 = seg(r, 5.2, 9.2);
      if (k1 > 0) {
        const path = (u) => (u < 0.55 ? lerp(19990, 20008, ease(u / 0.55)) : lerp(20008, 19997, ease((u - 0.55) / 0.45)));
        let hi = -1e9, lo = 1e9;
        for (let i = 0; i <= 60; i++) { const v = path(Math.min(k1, i / 60)); hi = Math.max(hi, v); lo = Math.min(lo, v); }
        const c = path(k1);
        out += candle(980, Yp(19990), Yp(c), Yp(hi), Yp(lo), c >= 19990, 34);
        if (hi > 20005) out += pill(1060, Yp(20008), '20,008', C.peach, pop(t, s.start + 6.6), 20);
      }
      const k2 = seg(r, 10, 12.8);
      if (k2 > 0) {
        const path = (u) => (u < 0.2 ? lerp(19997, 19999, u / 0.2) : lerp(19999, 19992, ease((u - 0.2) / 0.8)));
        let hi = -1e9, lo = 1e9;
        for (let i = 0; i <= 60; i++) { const v = path(Math.min(k2, i / 60)); hi = Math.max(hi, v); lo = Math.min(lo, v); }
        const c = path(k2);
        out += candle(1040, Yp(19997), Yp(c), Yp(hi), Yp(lo), false, 34);
        if (k2 > 0.95) out += pill(1130, Yp(19992) + 6, '19,992', C.purple, pop(t, s.start + 12.8), 20);
      }
      if (r > 14.4) out += `<path d="M960,${Yp(20000) - 16} q20,-50 40,0" fill="none" stroke="${C.peach}" stroke-width="4" stroke-dasharray="6 5"/>` +
        `<path d="M1006,${Yp(20000) - 4} q20,40 34,62" fill="none" stroke="${C.pink}" stroke-width="4" stroke-dasharray="6 5" marker-end=""/>`;
      out += stamp(760, 520, 'SWEEP-LIKE', pop(t, s.start + 19.4, 0.5), C.purple, -6, 44);
    }
    out += pill(880, 1046, 'describe first · name second', C.teal, pop(t, s.start + 22.8), 24);
    // commentator desk: person with headset + parrot co-host
    const co = { x: 1660, y: G, scale: 1.3, look: A.LOOKS.b, flip: true, seed: 4, t, hat: 'headset',
      frontArm: r > 14 && r < 18 ? { a1: -30, a2: -60 } : { a1: 70, a2: 20 }, talk: ctx.talking };
    out += P(t, co) + `<rect x="1460" y="830" width="440" height="${G - 830}" rx="12" fill="${C.pink}"/><rect x="1450" y="818" width="460" height="22" rx="8" fill="${C.pinkL}"/>
      <text x="1680" y="910" font-size="24" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">LIVE DESK</text>`;
    out += parrot(t, 1840, 820, 0.85, { flip: true, talk: r > 20.2 && r < 22.6 });
    const b1 = fade(r, 14.2, 19);
    if (b1 > 0) out += A.bubble(1650, 600, 'Traded above. Failed to hold.', { op: b1, sc: 0.8 + 0.2 * b1, size: 24, italic: true, font: 'Playfair Display', tail: 'right' });
    const b2 = fade(r, 20.2, 24);
    if (b2 > 0) out += A.bubble(1770, 640, 'Sweep-like!', { op: b2, sc: 0.8 + 0.2 * b2, size: 24, weight: 700, color: C.purple, tail: 'right' });
    return out;
  };

  // A robot janitor sweeps away the assumptions people pile onto a sweep. Context is what's left.
  LIVE['s7-tidy-up'] = (s, t, ctx) => {
    const r = t - s.start, G = 930;
    let out = ground(G, '#F3E3D7', '#E2CDBE');
    // floor tiles
    for (let i = 0; i < 12; i++) out += `<line x1="${i * 180}" y1="${G}" x2="${i * 180 - 120}" y2="1080" stroke="#E2CDBE" stroke-width="3"/>`;
    // bin
    out += `<g transform="translate(1720,${G})"><path d="M-80,-170 L80,-170 L64,0 L-64,0 Z" fill="${C.purpleL}"/><rect x="-92" y="-190" width="184" height="26" rx="10" fill="${C.purple}"/>
      ${[-40, 0, 40].map((x) => `<line x1="${x}" y1="-150" x2="${x * 0.8}" y2="-20" stroke="${C.purple}" stroke-width="5" opacity=".5"/>`).join('')}</g>` + pill(1720, G + 50, 'assumptions', C.purple, pop(t, s.start + 0.6), 20);
    // cards: thrown in by the onlooker, swept to the bin one by one
    const cards = [['REVERSAL?', 640, 'not proven', 6.4], ['MSS?', 880, 'structure question', 9.9], ['ENTRY?', 1120, 'no', 13.4], ['MANIPULATION?', 1360, 'not proven', 16.9]];
    cards.forEach(([txt, cx, verdict, sweepAt], i) => {
      const th = ease(seg(r, 0.8 + i * 0.7, 1.6 + i * 0.7));
      if (th <= 0) return;
      const sk = ease(seg(r, sweepAt, sweepAt + 1));
      let x = lerp(240, cx, th), y = lerp(G - 300, G - 30, th) - Math.sin(th * Math.PI) * 200, rot = (1 - th) * 300 + (i % 2 ? 6 : -6);
      if (sk > 0) { x = lerp(cx, 1720, sk); y = lerp(G - 30, G - 200, sk) - Math.sin(sk * Math.PI) * 220; rot += sk * 540; }
      const sc = sk >= 1 ? 0 : 1 - sk * 0.4;
      if (sc > 0) {
        const w = txt.length * 15 + 50;
        out += `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})"><rect x="${-w / 2}" y="-32" width="${w}" height="64" rx="12" fill="#fff" stroke="${C.pink}" stroke-width="5"/>
          <text y="10" font-size="26" font-weight="900" text-anchor="middle" fill="${C.pink}" font-family="DM Sans">${txt}</text></g>`;
      }
      out += pill(960, 450 + i * 62, `${txt.replace('?', '').toLowerCase()}: ${verdict}`, [C.pink, C.purple, C.pink, C.pink][i], pop(t, s.start + sweepAt + 0.2), 26);
    });
    // robot janitor with a broom
    const rp = kf(r, [[4.4, -180, G], [5.8, 470, G], [9.3, 710, G], [12.8, 950, G], [16.3, 1190, G], [19.6, 1190, G], [21, 760, G]]);
    const sweeping = cards.some(([, , , a]) => r > a - 0.4 && r < a + 0.6);
    const sw = sweeping ? Math.sin(t * 14) * 25 : 0;
    const broom = `<g transform="rotate(${-30 + sw})"><rect x="-5" y="-10" width="10" height="170" rx="4" fill="#9B6A45"/><path d="M-34,160 L34,160 L44,210 L-44,210 Z" fill="${C.peach}"/>
      ${[-30, -15, 0, 15, 30].map((x) => `<line x1="${x}" y1="172" x2="${x * 1.2}" y2="208" stroke="#E08E2E" stroke-width="3"/>`).join('')}</g>`;
    if (r > 4.4) out += robot(t, rp.x, G, 0.9, { a1: 30, a2: 60, hold: broom, talk: ctx.talking && r > 20, face: r > 20 ? 'happy' : undefined });
    if (sweeping) out += [0, 1, 2].map((i) => { const p = ((t * 2) + i / 3) % 1; return `<circle cx="${rp.x + 140 + p * 60}" cy="${G - 10 - p * 40}" r="${8 - p * 6}" fill="#C9B9AE" opacity="${1 - p}"/>`; }).join('');
    // the onlooker who tossed the labels
    const ok = { x: 220, y: G, scale: 1, look: A.LOOKS.d, seed: 9, t,
      frontArm: r > 0.4 && r < 3.6 ? { a1: -50 + Math.sin(t * 9) * 30, a2: -70 } : r > 20 ? { a1: -80, a2: -100 } : { a1: 100, a2: 95 },
      backArm: r > 20 ? { a1: 260, a2: 250 } : undefined, talk: false };
    out += P(t, ok);
    // context on a pedestal
    const ck = pop(t, s.start + 20, 0.7);
    if (ck > 0) {
      out += scaleAt(1460, G, ck, `<rect x="1380" y="${G - 140}" width="160" height="140" rx="10" fill="${C.purpleL}"/><rect x="1360" y="${G - 160}" width="200" height="26" rx="8" fill="${C.purple}"/>`) +
        pill(1460, G - 210, 'CONTEXT ✓', C.teal, ck, 30) + A.sparkle(1460, G - 210, s.start + 20.3, t);
    }
    return out;
  };

  /* ================= Lesson 8 ================= */

  // Two frogs jump at the same ledge (prior high). A pops above and drops back. B lands, holds, builds.
  LIVE['s7-frog-ledge'] = (s, t, ctx) => {
    const r = t - s.start, ledge = 640, water = 900;
    let out = `<rect x="0" y="${water}" width="1920" height="${1080 - water}" fill="${C.teal}" opacity=".55"/>`;
    for (let i = 0; i < 10; i++) out += `<path d="M${i * 200 + ((t * 30) % 200)},${water + 40 + (i % 2) * 50} q30,-10 60,0" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/>`;
    out += `<line x1="960" y1="420" x2="960" y2="1080" stroke="#EADFD8" stroke-width="4" stroke-dasharray="12 10"/>`;
    const half = (hx, tag) => {
      let g = '';
      const wk = pop(t, s.start + 0.3 + (tag === 'B' ? 0.3 : 0), 0.7);
      g += scaleAt(hx + 560, 900, wk, `<rect x="${hx + 400}" y="${ledge}" width="320" height="${1080 - ledge}" rx="8" fill="#D9CFC8"/>
        ${[0, 1, 2, 3].map((j) => `<rect x="${hx + 410 + (j % 2) * 80}" y="${ledge + 20 + j * 70}" width="140" height="56" rx="8" fill="#E9E1DA"/>`).join('')}
        ${tag === 'B' ? `<rect x="${hx + 540}" y="${ledge - 60}" width="180" height="60" rx="8" fill="#D9CFC8"/><rect x="${hx + 630}" y="${ledge - 120}" width="90" height="60" rx="8" fill="#D9CFC8"/>` : ''}`);
      const lk = ease(seg(r, 1, 2));
      if (lk > 0) g += `<line x1="${hx + 20}" x2="${lerp(hx + 20, hx + 740, lk)}" y1="${ledge}" y2="${ledge}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="16 10"/>`;
      g += pill(hx + 160, ledge - 30, 'prior high', C.purple, pop(t, s.start + 1.6), 20);
      g += `<ellipse cx="${hx + 170}" cy="${water + 6}" rx="90" ry="20" fill="${C.cashD}" opacity=".85"/><ellipse cx="${hx + 340}" cy="${water + 10}" rx="70" ry="16" fill="${C.cashD}" opacity=".85"/>`;
      g += `<text x="${hx + 40}" y="${water + 130}" font-size="64" font-weight="900" fill="#fff" font-family="Playfair Display" opacity=".9">${tag}</text>`;
      return g;
    };
    out += half(140, 'A') + half(1060, 'B');
    // frog A: hops above the ledge line, falls back below
    let fa;
    if (r < 3.8) fa = { x: 310, y: water, sq: 0 };
    else if (r < 5.4) { const k = (r - 3.8) / 1.6; fa = { x: lerp(310, 480, k), y: lerp(water, water, k) - Math.sin(k * Math.PI) * 360, sq: 0 }; }
    else fa = { x: 480, y: water, sq: r < 5.7 ? 1 - (r - 5.4) / 0.3 : 0 };
    out += frog(t, fa.x, fa.y, 0.9, { squash: fa.sq, mood: r > 5.6 && r < 12 ? 'sad' : undefined, seed: 2 });
    if (r > 5.4 && r < 6.4) out += `<ellipse cx="480" cy="${water + 6}" rx="${(r - 5.4) * 120}" ry="${(r - 5.4) * 24}" fill="none" stroke="#fff" stroke-width="4" opacity="${1 - (r - 5.4)}"/>`;
    // frog B: lands on the ledge, holds, climbs the steps
    let fb;
    if (r < 10.2) fb = { x: 1230, y: water, sq: 0 };
    else if (r < 11.8) { const k = (r - 10.2) / 1.6; fb = { x: lerp(1230, 1530, k), y: lerp(water, ledge, k) - Math.sin(k * Math.PI) * 200, sq: 0 }; }
    else if (r < 14) fb = { x: 1530, y: ledge, sq: r < 12.1 ? 1 - (r - 11.8) / 0.3 : 0 };
    else if (r < 14.8) { const k = (r - 14) / 0.8; fb = { x: lerp(1530, 1640, k), y: lerp(ledge, ledge - 60, k) - Math.sin(k * Math.PI) * 80, sq: 0 }; }
    else if (r < 15.6) fb = { x: 1640, y: ledge - 60, sq: 0 };
    else if (r < 16.4) { const k = (r - 15.6) / 0.8; fb = { x: lerp(1640, 1720, k), y: lerp(ledge - 60, ledge - 120, k) - Math.sin(k * Math.PI) * 80, sq: 0 }; }
    else fb = { x: 1720, y: ledge - 120, sq: 0 };
    out += frog(t, fb.x, fb.y, 0.8, { squash: fb.sq, col: C.teal, seed: 5 });
    if (r > 16.4) out += A.sparkle(1720, ledge - 220, s.start + 16.4, t, C.teal);
    out += pill(1530, ledge + 50, 'hold ✓', C.teal, pop(t, s.start + 12.4) * (1 - seg(r, 13.9, 14.1)), 20);
    // mini candle evidence cards
    const card = (x, k, kind) => {
      if (k <= 0) return '';
      const ly = 468;
      let c = `<rect x="${x - 80}" y="400" width="160" height="150" rx="16" fill="#fff" stroke="#F1E7E1" stroke-width="3"/><line x1="${x - 66}" x2="${x + 66}" y1="${ly}" y2="${ly}" stroke="${C.purple}" stroke-width="3" stroke-dasharray="8 6"/>`;
      if (kind === 'A') c += candle(x, 520, 486, 424, 532, true, 30);
      else c += candle(x - 24, 520, 456, 450, 528, true, 24) + candle(x + 22, 456, 422, 414, 462, true, 24);
      return scaleAt(x, 475, k, c);
    };
    out += card(780, pop(t, s.start + 6, 0.6), 'A') + card(1150, pop(t, s.start + 12.6, 0.6), 'B');
    out += pill(500, 1030, 'wick above · close back below', C.pink, pop(t, s.start + 6.6), 22);
    out += pill(1420, 1030, 'close above · hold · build', C.tealD, pop(t, s.start + 12.8), 22);
    out += pill(500, 976, 'sweep-like', C.peach, pop(t, s.start + 8.2), 20);
    // both traded through; only B changed structure
    out += check(560, ledge - 56, pop(t, s.start + 18.2, 0.5), true, 22) + check(1460, ledge - 56, pop(t, s.start + 18.4, 0.5), true, 22);
    out += pill(560, ledge - 100, 'traded through', C.teal, pop(t, s.start + 18.4), 18) + pill(1400, ledge - 100, 'traded through', C.teal, pop(t, s.start + 18.6), 18);
    out += pill(1440, 940, 'structure changed ✓', C.tealD, pop(t, s.start + 21.2), 24) + pill(300, 840, 'structure unchanged', C.muted, pop(t, s.start + 21.6), 22);
    // a dragonfly zips about
    const dx = 960 + Math.sin(t * 0.9) * 700, dy = 430 + Math.sin(t * 2.3) * 30;
    out += `<g transform="translate(${dx},${dy}) scale(${Math.cos(t * 0.9) > 0 ? 1 : -1},1)"><ellipse cx="-10" cy="-8" rx="22" ry="7" fill="${C.purpleL}" opacity=".8" transform="rotate(${Math.sin(t * 30) * 20})"/><ellipse cx="-10" cy="8" rx="22" ry="7" fill="${C.purpleL}" opacity=".8" transform="rotate(${-Math.sin(t * 30) * 20})"/>
      <rect x="-34" y="-4" width="44" height="8" rx="4" fill="${C.purple}"/><circle cx="14" cy="0" r="8" fill="${C.purple}"/></g>`;
    return out;
  };

  // Two inspectors, two questions, one scoreboard. Then the classic mistake gets crossed out.
  LIVE['s7-two-clipboards'] = (s, t, ctx) => {
    const r = t - s.start, G = 1020;
    let out = ground(G);
    const bk = pop(t, s.start + 0.3, 0.8);
    out += scaleAt(960, 630, bk, `<rect x="600" y="420" width="720" height="420" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
      <line x1="720" x2="720" y1="440" y2="820" stroke="#F1E7E1" stroke-width="3"/><line x1="1020" x2="1020" y1="440" y2="820" stroke="#F1E7E1" stroke-width="3"/>
      <line x1="620" x2="1300" y1="560" y2="560" stroke="#F1E7E1" stroke-width="3"/><line x1="620" x2="1300" y1="690" y2="690" stroke="#F1E7E1" stroke-width="3"/>
      <text x="660" y="642" font-size="54" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">A</text>
      <text x="660" y="772" font-size="54" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">B</text>
      <path d="M690,612 l-8,0 l0,-22 m0,22 l0,10" stroke="${C.muted}" stroke-width="0"/>`);
    // tiny legends for A and B
    if (bk > 0.6) {
      out += `<g opacity="${bk}">` + candle(690, 640, 618, 586, 644, true, 10) + `<line x1="676" x2="704" y1="604" y2="604" stroke="${C.purple}" stroke-width="2"/>` +
        candle(690, 770, 728, 722, 776, true, 10) + `<line x1="676" x2="704" y1="742" y2="742" stroke="${C.purple}" stroke-width="2"/></g>`;
    }
    const h1 = pop(t, s.start + 2.2, 0.5), h2 = pop(t, s.start + 9, 0.5);
    out += pill(870, 490, 'LIQUIDITY Q', C.purple, h1, 24) + pill(1170, 490, 'STRUCTURE Q', C.tealD, h2, 24);
    out += check(870, 625, pop(t, s.start + 6.6, 0.5), true, 34) + check(870, 755, pop(t, s.start + 7.6, 0.5), true, 34);
    out += check(1170, 625, pop(t, s.start + 12.8, 0.5), false, 34) + check(1170, 755, pop(t, s.start + 13.8, 0.5), true, 34);
    // inspectors
    const clip = (col) => `<g transform="translate(6,-40) rotate(-6)"><rect x="-30" y="-40" width="60" height="80" rx="6" fill="#B98258"/><rect x="-24" y="-30" width="48" height="66" rx="3" fill="#fff"/>
      <rect x="-12" y="-46" width="24" height="12" rx="4" fill="${C.muted}"/>${[0, 1, 2].map((i) => `<rect x="-16" y="${-18 + i * 16}" width="32" height="5" rx="2" fill="${col}"/>`).join('')}</g>`;
    const tick1 = (r > 6.4 && r < 6.9) || (r > 7.4 && r < 7.9), tick2 = (r > 12.6 && r < 13.1) || (r > 13.6 && r < 14.1);
    out += P(t, { x: 380, y: G, scale: 1.1, look: A.LOOKS.a, seed: 3, t, hat: 'cap', hatCol: C.purple, frontArm: tick1 ? { a1: -10, a2: -30 } : { a1: 40, a2: -50 }, hold: clip(C.purpleL), talk: ctx.talking && r > 2.6 && r < 9.4 });
    out += P(t, { x: 1540, y: G, scale: 1.1, look: A.LOOKS.c, flip: true, seed: 6, t, hat: 'cap', hatCol: C.teal, frontArm: tick2 ? { a1: -10, a2: -30 } : { a1: 40, a2: -50 }, hold: clip(C.tealL), talk: ctx.talking && r > 9.4 && r < 15 });
    const b1 = fade(r, 2.6, 8.6), b2 = fade(r, 9.4, 14.8);
    if (b1 > 0) out += A.bubble(400, 560, 'Through the area?', { op: b1, sc: 0.8 + 0.2 * b1, size: 26, italic: true, font: 'Playfair Display', tail: 'left' });
    if (b2 > 0) out += A.bubble(1520, 560, 'Close, hold, build?', { op: b2, sc: 0.8 + 0.2 * b2, size: 26, italic: true, font: 'Playfair Display', tail: 'right' });
    // the classic mistake
    const mk = pop(t, s.start + 15.6, 0.6);
    if (mk > 0) {
      const fixed = r > 19.8;
      out += scaleAt(960, 930, mk, `<rect x="640" y="880" width="640" height="100" rx="20" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="4"/>
        <text x="960" y="946" font-size="40" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">took liquidity ${fixed ? '≠' : '='} MSS</text>`);
      const xk = ease(seg(r, 19.4, 19.8)) * (1 - seg(r, 19.8, 20));
      if (xk > 0) out += `<line x1="660" y1="960" x2="${lerp(660, 1260, xk)}" y2="${lerp(960, 900, xk)}" stroke="${C.pink}" stroke-width="10" stroke-linecap="round"/>`;
      if (fixed) out += A.sparkle(960, 930, s.start + 19.8, t, C.pink);
    }
    out += pill(960, 1046, 'neither is an entry', C.purple, pop(t, s.start + 22.4), 22);
    // a snail slowly crossing the floor
    out += snail(t, lerp(1900, 1100, seg(r, 0, 26)), G + 40, 0.7);
    return out;
  };

  /* ================= Lesson 9 ================= */

  // The overloaded checklist as a sandwich tower that keeps growing until it topples.
  LIVE['s7-tower-sandwich'] = (s, t, ctx) => {
    const r = t - s.start, G = 1000, cx = 1000, LH = 50;
    let out = ground(G, '#FEF3E4', '#FAD09A');
    // counter
    out += `<rect x="640" y="${G - 40}" width="720" height="40" rx="10" fill="#C9A27A"/>`;
    const layers = ['Liquidity sweep', 'Equal highs taken', 'Session high taken', 'Internal AND external', 'Stops cleared', 'Three confirmations', 'Moon phase 🌙'];
    const cols = [C.tealL, C.peachL, C.pinkL, C.purpleL, C.tealL, C.peachL, C.gold];
    const topple = seg(r, 17.6, 19.4);
    const n = layers.length;
    const wobAmp = clamp((r - 6) / 10) * 5 * (1 - topple);
    const plateY = G - 40;
    // bottom bun
    const base = `<rect x="${cx - 200}" y="${plateY - 48}" width="400" height="48" rx="20" fill="#E0A869"/><text x="${cx}" y="${plateY - 16}" font-size="22" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="2">MY ENTRY CHECKLIST</text>`;
    out += `<ellipse cx="${cx}" cy="${plateY + 4}" rx="240" ry="16" fill="#fff" stroke="#EADFD8" stroke-width="3"/>` + base;
    layers.forEach((lab, i) => {
      const at = 2.6 + i * 1.55;
      const k = ease(seg(r, at, at + 0.6));
      if (k <= 0) return;
      const restY = plateY - 48 - (i + 1) * LH;
      const lean = Math.sin(t * 3) * wobAmp * (i + 1) * 0.6;
      let x = cx + lean, y = lerp(380, restY, k), rot = lean * 0.15;
      if (topple > 0) {
        const dir = i % 2 ? 1 : -1, f = ease(topple);
        const fin = [[720, 0], [1270, 0], [880, -42], [1120, -44], [1000, -86], [800, -90], [1000, 0]][i];
        x = lerp(x, fin[0], f);
        y = lerp(restY, G - 24 + fin[1], f) - Math.sin(f * Math.PI) * (80 + i * 30);
        rot = dir * (Math.sin(f * Math.PI) * 70 + f * (4 + i * 1.5));
      }
      if (i === n - 1 && topple > 0.6) return; // the moon layer gets caught by the dog
      const w = 380 - (i % 2) * 20;
      out += `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-LH / 2}" width="${w}" height="${LH - 4}" rx="16" fill="${cols[i]}" stroke="#fff" stroke-width="3"/>
        <text y="9" font-size="23" font-weight="800" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">${lab}</text></g>`;
    });
    // top bun (lands just before the stamp)
    const tb = ease(seg(r, 13.4, 14));
    if (tb > 0 && topple < 0.3) {
      const restY = plateY - 48 - (n + 1) * LH + 6, lean = Math.sin(t * 3) * wobAmp * (n + 1) * 0.6;
      out += `<path d="M${cx + lean - 200},${lerp(380, restY, tb) + 20} Q${cx + lean},${lerp(380, restY, tb) - 60} ${cx + lean + 200},${lerp(380, restY, tb) + 20} Z" fill="#E0A869"/>`;
    }
    out += stamp(cx, 600, 'ABSOLUTELY NOT.', pop(t, s.start + 14.6, 0.5) * (1 - seg(r, 17.4, 17.7)), C.pink, -10, 56);
    if (r > 17.6 && r < 19) out += A.sparkle(cx, 760, s.start + 17.6, t, C.peach);
    // chef, cheerfully adding layers
    const adding = layers.some((_, i) => Math.abs(r - (2.6 + i * 1.55)) < 0.35);
    out += P(t, { x: 440, y: G, scale: 1.2, look: A.LOOKS.buyer, seed: 2, t, hat: 'chef',
      frontArm: adding ? { a1: -40, a2: -70 } : r > 14.6 && r < 17.6 ? { a1: -60, a2: -120 } : { a1: 40, a2: -40 }, mood: r > 18 && r < 22 ? 'sad' : undefined, talk: ctx.talking && r < 18 });
    // dog hoping for scraps, then catching the moon
    const caught = topple > 0.6;
    out += dog(t, 1520, G, 0.95, { flip: true, bark: r > 9 && r < 10 });
    if (caught) out += `<g transform="translate(${1420},${G - 98}) rotate(-12)"><rect x="-70" y="-18" width="140" height="36" rx="12" fill="${C.gold}"/><text y="8" font-size="18" font-weight="800" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">🌙</text></g>`;
    out += pill(960, 470, 'more rules ≠ better reads', C.purple, pop(t, s.start + 19.6), 28);
    return out;
  };

  // Where does liquidity go? On the market-literacy shelf, not into the entry panel.
  LIVE['s7-shelf-or-panel'] = (s, t, ctx) => {
    const r = t - s.start, G = 1010;
    let out = ground(G);
    // bookshelf (left)
    const bk = pop(t, s.start + 0.3, 0.8);
    let shelf = `<rect x="140" y="440" width="460" height="${G - 440}" rx="14" fill="#B98258"/><rect x="160" y="460" width="420" height="${G - 480}" rx="8" fill="#F3E3D7"/>
      ${[0, 1, 2].map((i) => `<rect x="150" y="${600 + i * 140}" width="440" height="16" fill="#9B6A45"/>`).join('')}`;
    const books = [[180, 600, 'STRUCTURE', C.teal], [234, 600, 'SWINGS', C.peach], [288, 600, 'RANGES', C.purple], [180, 740, 'BUY-SIDE', C.pink], [234, 740, 'SELL-SIDE', C.tealD], [288, 740, 'POOLS', C.purpleL], [180, 880, 'SWEEPS', C.peachL], [234, 880, 'EQUAL H/L', C.tealL]];
    books.forEach(([x, y, lab, col], i) => {
      shelf += `<rect x="${x}" y="${y - 120}" width="46" height="120" rx="5" fill="${col}"/><text transform="translate(${x + 30},${y - 10}) rotate(-90)" font-size="16" font-weight="900" fill="#fff" font-family="DM Sans" letter-spacing="1">${lab}</text>`;
    });
    out += scaleAt(370, G, bk, shelf) + pill(370, 410, 'MARKET LITERACY', C.purple, bk, 24);
    out += cat(t, 520, 440, 0.55, { sleep: r < 14 || r > 18, col: C.peachL, dark: C.peach });
    // entry panel (right)
    const pk = pop(t, s.start + 0.6, 0.8);
    let pan = `<rect x="1300" y="460" width="460" height="400" rx="26" fill="${C.dark}"/><rect x="1324" y="484" width="412" height="352" rx="16" fill="#4A3B33"/>
      <rect x="1500" y="860" width="60" height="${G - 860}" fill="${C.dark}"/>`;
    ['Indication', 'Correction', 'Continuation'].forEach((lab, i) => {
      const on = Math.floor((t - s.start) * 1.2) % 4 > i - 0.5 && (Math.floor((t - s.start) * 1.2) % 4) >= i + 1;
      pan += `<circle cx="1380" cy="${560 + i * 90}" r="24" fill="${on ? C.teal : '#6B5A50'}"/>${on ? `<circle cx="1380" cy="${560 + i * 90}" r="36" fill="${C.teal}" opacity=".25"/>` : ''}
        <text x="1424" y="${570 + i * 90}" font-size="30" font-weight="800" fill="${C.cream}" font-family="DM Sans">${lab}</text>`;
    });
    pan += `<rect x="1360" y="780" width="340" height="40" rx="10" fill="#6B5A50"/><text x="1530" y="808" font-size="20" font-weight="900" text-anchor="middle" fill="${C.cream}" font-family="DM Sans" letter-spacing="2">DAYLI ICC SEQUENCE</text>`;
    out += scaleAt(1530, G, pk, pan) + pill(1530, 410, 'ENTRY CRITERIA', C.tealD, pk, 24);
    // "no ... required" chips by the panel
    ['no sweep required', 'no pool required', 'no stops-taken required'].forEach((txt, i) => {
      out += pill(1100, 560 + i * 64, txt, C.pink, pop(t, s.start + 8.8 + i * 1.1) * (1 - seg(r, 14.8, 15.2)), 20);
    });
    // student carrying the liquidity book
    const sp = kf(r, [[2.2, 960, G], [4.8, 960, G], [6.8, 1080, G], [11.6, 1080, G], [14, 700, G]]);
    const placed = r > 14.6;
    const flyK = ease(seg(r, 14, 14.6));
    const book = `<g transform="translate(0,-30) rotate(-8)"><rect x="-26" y="-60" width="52" height="96" rx="5" fill="${C.purple}"/><text transform="translate(8,24) rotate(-90)" font-size="15" font-weight="900" fill="#fff" font-family="DM Sans">LIQUIDITY</text></g>`;
    const k0 = pop(t, s.start + 2.2, 0.6);
    const so = { x: sp.x, y: G, scale: 1.05, look: A.LOOKS.e, seed: 5, t, walking: sp.moving, flip: r > 11.6 && r < 14.4,
      frontArm: placed ? (r > 17 ? { a1: -80, a2: -100 } : { a1: 100, a2: 95 }) : { a1: 40, a2: -50 }, hold: flyK > 0 ? '' : book, talk: ctx.talking };
    out += scaleAt(sp.x, G, k0, P(t, so));
    if (flyK > 0) {
      const hx = 700 - 60, hy = G - 230;
      const bx = lerp(hx, 352, flyK), by = lerp(hy, 880 - 60, flyK) - Math.sin(flyK * Math.PI) * 140;
      out += `<g transform="translate(${bx},${by}) rotate(${-8 + flyK * 8})"><rect x="-23" y="-60" width="46" height="120" rx="5" fill="${C.purple}"/><text transform="translate(8,46) rotate(-90)" font-size="16" font-weight="900" fill="#fff" font-family="DM Sans">LIQUIDITY</text></g>`;
      if (flyK >= 1) out += A.sparkle(352, 820, s.start + 14.6, t, C.purple);
    }
    const b1 = fade(r, 5, 8.4);
    if (b1 > 0) out += A.bubble(1000, 560, 'Where does this go?', { op: b1, sc: 0.8 + 0.2 * b1, size: 26, italic: true, font: 'Playfair Display', tail: 'left' });
    out += pill(960, 1044, 'context · not execution', C.teal, pop(t, s.start + 17.4), 26);
    // next-section signpost
    const nk = pop(t, s.start + 19.6, 0.7);
    if (nk > 0) out += scaleAt(960, 470, nk, `<g transform="translate(960,470)"><rect x="-310" y="-40" width="600" height="80" rx="16" fill="${C.peach}"/><path d="M290,-40 L340,0 L290,40 Z" fill="${C.peach}"/>
      <text x="-10" y="-6" font-size="20" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">NEXT · SECTION 8</text>
      <text x="-10" y="26" font-size="26" font-weight="700" text-anchor="middle" fill="#fff" font-family="Playfair Display">Gaps, Imbalances &amp; Price Delivery</text></g>`);
    return out;
  };

  const BUILD = Object.fromEntries(Object.keys(LIVE).map((k) => [k, textLayer]));
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
