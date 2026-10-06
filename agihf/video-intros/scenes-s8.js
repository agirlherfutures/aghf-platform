/**
 * scenes-s8.js: illustrated scene types for Section 8 lesson intro videos
 * (Phase 3 · Section 8: Gaps, Imbalances & Price Delivery, lessons 10 to 18).
 *
 * Every scene is one visual metaphor with characters doing something.
 * LIVE functions are pure functions of t (absolute seconds); beat times live
 * in each lesson file under `beats`.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const rad = d => d * Math.PI / 180;
  const at = (x, y, k, svg) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${svg}</g>`;
  const pill = (x, y, text, col, k = 1, fs = 28, fg = '#fff') => {
    if (k <= 0) return '';
    const w = text.length * fs * 0.6 + 36;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${fg}" font-family="DM Sans">${text}</text></g>`;
  };
  const txt = (x, y, s, fs, col, o = {}) => `<text x="${x}" y="${y}" font-size="${fs}" font-weight="${o.w || 900}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || 'DM Sans'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''} opacity="${o.op ?? 1}">${s}</text>`;
  function blink(t, seed) {
    const period = 3.4 + (seed % 3) * 0.8;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  // Point at fraction k along a polyline, plus the segment index.
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
  const partial = (pts, k) => { const p = alongPath(pts, k); return pts.slice(0, p.seg + 1).concat([[p.x, p.y]]); };
  const poly = (pts, col, w, extra = '') => `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  // A candle in screen coords: o/c are y values of open/close, hi/lo the wick ends.
  const candle = (x, o, c, hi, lo, w, k = 1, col) => {
    if (k <= 0) return '';
    const up = c <= o, cl = col || (up ? C.teal : C.pink), cc = lerp(o, c, clamp(k));
    return `<g opacity="${clamp(k * 2)}"><line x1="${x}" x2="${x}" y1="${lerp(Math.min(o, c), hi, clamp(k))}" y2="${lerp(Math.max(o, c), lo, clamp(k))}" stroke="${cl}" stroke-width="${Math.max(3, w * 0.12)}" stroke-linecap="round"/>
      <rect x="${x - w / 2}" y="${Math.min(o, cc)}" width="${w}" height="${Math.max(4, Math.abs(cc - o))}" rx="${Math.min(6, w * 0.15)}" fill="${cl}"/></g>`;
  };
  // FVG zone box.
  const fvg = (x0, x1, y0, y1, k, col = C.purple, label) => k <= 0 ? '' : `<g opacity="${clamp(k)}">
      <rect x="${x0}" y="${Math.min(y0, y1)}" width="${(x1 - x0) * clamp(k)}" height="${Math.abs(y1 - y0)}" fill="${col}" fill-opacity=".2" stroke="${col}" stroke-width="4" stroke-dasharray="12 8" rx="4"/>
      ${label ? txt(x0 + 12, Math.min(y0, y1) + Math.abs(y1 - y0) / 2 + 9, label, 24, col, { a: 'start' }) : ''}</g>`;
  const panel = (x, y, w, h, k = 1, fill = '#fff') => at(x + w / 2, y + h / 2, k, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="${fill}" stroke="#F1E7E1" stroke-width="3"/>`);
  const look = (base, over) => Object.assign({}, A.LOOKS[base], over);
  const questionMarks = (x, y, t, col = C.purple) => [0, 1, 2].map(i => {
    const p = ((t * 0.7) + i * 0.33) % 1;
    return `<text x="${x + (i - 1) * 34}" y="${y - p * 70}" font-size="${36 + i * 8}" font-weight="900" fill="${col}" opacity="${Math.sin(p * Math.PI) * 0.85}" font-family="Playfair Display" text-anchor="middle">?</text>`;
  }).join('');
  const stampX = (x, y, k, r = 60) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) rotate(-8)">
      <line x1="${-r}" y1="${-r}" x2="${r}" y2="${r}" stroke="${C.pink}" stroke-width="${r * 0.28}" stroke-linecap="round"/>
      <line x1="${r}" y1="${-r}" x2="${-r}" y2="${r}" stroke="${C.pink}" stroke-width="${r * 0.28}" stroke-linecap="round"/></g>`;
  const check = (x, y, k, col = C.tealD, s = 1) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k * s})"><circle r="30" fill="${col}"/><path d="M-13,1 L-3,11 L15,-10" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cloud = (x, y, s = 1, op = 1) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#fff"/><circle cx="-26" cy="-18" r="28" fill="#fff"/><circle cx="18" cy="-26" r="34" fill="#fff"/></g>`;
  const sun = (x, y, t, r = 46) => `<g transform="translate(${x},${y})">${Array.from({ length: 10 }, (_, i) => { const a = rad(i * 36 + t * 12); return `<line x1="${Math.cos(a) * (r + 12)}" y1="${Math.sin(a) * (r + 12)}" x2="${Math.cos(a) * (r + 30)}" y2="${Math.sin(a) * (r + 30)}" stroke="${C.peachL}" stroke-width="7" stroke-linecap="round"/>`; }).join('')}<circle r="${r}" fill="${C.peachL}"/></g>`;
  const box = (w = 40, h = 32, col = C.peachL) => `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="4" fill="${col}" stroke="${C.peach}" stroke-width="3"/><rect x="-4" y="${-h}" width="8" height="${h}" fill="${C.peach}" opacity=".6"/>`;
  const speedLines = (x, y, k, dir = -1, col = C.teal) => k <= 0 ? '' : [0, 1, 2].map(i => `<line x1="${x + dir * 30}" x2="${x + dir * (80 + i * 26)}" y1="${y - 40 + i * 30}" y2="${y - 40 + i * 30}" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity="${0.7 * k}"/>`).join('');

  /* ---------------- creatures ---------------- */
  function cat(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, col = o.col || C.peach, dk = o.dk || '#E08E2E', sd = o.seed || 3;
    const bob = o.walking ? -Math.abs(Math.sin(t * 10)) * 4 : Math.sin(t * 2 + sd) * 1.5;
    const tw = Math.sin(t * 3 + sd) * 14, bl = o.sleep ? 1 : blink(t, sd);
    const lg = i => o.walking ? Math.sin(t * 10 + i * Math.PI) * 9 : 0;
    const eyes = o.sleep
      ? `<path d="M38,-82 Q44,-77 50,-82" stroke="${C.dark}" stroke-width="3" fill="none"/><path d="M60,-82 Q66,-77 72,-82" stroke="${C.dark}" stroke-width="3" fill="none"/>`
      : `<ellipse cx="44" cy="-82" rx="4.5" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/><ellipse cx="66" cy="-82" rx="4.5" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${bob.toFixed(2)})">
      <path d="M-48,-44 C-84,-52 ${-92 + tw * 0.3},-92 ${-70 + tw},-120" stroke="${col}" stroke-width="13" fill="none" stroke-linecap="round"/>
      ${[[-34, 0], [-18, 1], [24, 1], [40, 0]].map(([lx, i]) => `<rect x="${lx - 6 + lg(i)}" y="-30" width="12" height="30" rx="6" fill="${col}"/>`).join('')}
      <ellipse cx="0" cy="-46" rx="56" ry="30" fill="${col}"/>
      <path d="M-20,-72 Q-14,-50 -20,-28 M0,-75 Q6,-50 0,-26" stroke="${dk}" stroke-width="5" fill="none" opacity=".5"/>
      <path d="M30,-98 L34,-132 L54,-106 Z" fill="${col}"/><path d="M58,-106 L78,-130 L80,-96 Z" fill="${col}"/>
      <circle cx="55" cy="-80" r="31" fill="${col}"/>
      ${eyes}
      <path d="M51,-70 L59,-70 L55,-65 Z" fill="${C.pink}"/>
      <path d="M55,-65 Q50,-59 46,-62 M55,-65 Q60,-59 64,-62" stroke="${C.dark}" stroke-width="2.5" fill="none"/>
      <line x1="72" y1="-68" x2="98" y2="-72" stroke="${C.dark}" stroke-width="2" opacity=".5"/><line x1="72" y1="-64" x2="98" y2="-60" stroke="${C.dark}" stroke-width="2" opacity=".5"/>
      ${o.hold ? `<g transform="translate(-6,-122)">${o.hold}</g>` : ''}
    </g></g>`;
  }
  function dog(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, col = o.col || C.peachL, ear = o.ear || C.muted, sd = o.seed || 5;
    const wag = Math.sin(t * (o.wag ? 18 : 3) + sd) * (o.wag ? 22 : 8);
    const bob = o.walking ? -Math.abs(Math.sin(t * 9)) * 5 : Math.sin(t * 2 + sd) * 1.5;
    const lg = i => o.walking ? Math.sin(t * 9 + i * Math.PI) * 10 : 0;
    const bl = blink(t, sd);
    const hd = o.sniff ? `translate(10,${18 + Math.sin(t * 14) * 3}) rotate(18 62 -96)` : o.tilt ? `rotate(${-14 + Math.sin(t * 1.5) * 4} 62 -96)` : '';
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${bob.toFixed(2)})">
      <path d="M-58,-66 L${-92},${-96 + wag}" stroke="${col}" stroke-width="13" stroke-linecap="round"/>
      ${[[-40, 0], [-22, 1], [26, 1], [44, 0]].map(([lx, i]) => `<rect x="${lx - 7 + lg(i)}" y="-36" width="14" height="36" rx="7" fill="${col}"/>`).join('')}
      <ellipse cx="0" cy="-58" rx="64" ry="34" fill="${col}"/>
      <ellipse cx="-14" cy="-64" rx="22" ry="16" fill="${ear}" opacity=".35"/>
      <g transform="${hd}">
        <circle cx="64" cy="-98" r="33" fill="${col}"/>
        <ellipse cx="94" cy="-86" rx="22" ry="15" fill="${col}"/>
        <circle cx="111" cy="-90" r="7.5" fill="${C.dark}"/>
        <ellipse cx="66" cy="-104" rx="5" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
        <path d="M92,-76 Q100,-70 106,-76" stroke="${C.dark}" stroke-width="3" fill="none"/>
        ${o.tongue ? `<ellipse cx="100" cy="-70" rx="6" ry="9" fill="${C.pink}"/>` : ''}
        <ellipse cx="44" cy="-92" rx="13" ry="28" transform="rotate(18 44 -92)" fill="${ear}"/>
      </g>
      ${o.collar ? `<rect x="34" y="-78" width="34" height="10" rx="5" fill="${o.collar}" transform="rotate(-20 50 -73)"/>` : ''}
    </g></g>`;
  }
  function bird(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, col = o.col || C.teal, sd = o.seed || 2;
    const flap = o.flying ? Math.sin(t * 22 + sd) * 40 : Math.sin(t * 2 + sd) * 4;
    const bl = blink(t, sd), hop = o.flying ? 0 : -Math.max(0, Math.sin(t * 3 + sd)) * 4;
    return `<g transform="translate(${o.x},${o.y + hop}) scale(${s * f},${s})">
      ${o.flying ? '' : `<line x1="-6" y1="-6" x2="-8" y2="0" stroke="${C.peach}" stroke-width="3"/><line x1="6" y1="-6" x2="8" y2="0" stroke="${C.peach}" stroke-width="3"/>`}
      <path d="M-22,-24 L-40,-30 L-36,-16 Z" fill="${col}"/>
      <ellipse cx="0" cy="-24" rx="24" ry="18" fill="${col}"/>
      <circle cx="16" cy="-40" r="14" fill="${col}"/>
      <path d="M28,-42 L40,-38 L28,-34 Z" fill="${C.peach}"/>
      <ellipse cx="20" cy="-43" rx="3" ry="${(4 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      <path d="M-8,-28 Q4,${-28 - flap * 0.6} 12,-24 Z" fill="#fff" opacity=".6"/>
    </g>`;
  }
  function parrot(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, sd = o.seed || 4;
    const open = o.talk ? Math.abs(Math.sin(t * 10)) * 10 : 0, bl = blink(t, sd);
    const sway = Math.sin(t * 2 + sd) * 3;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s}) rotate(${sway})">
      <path d="M-10,0 L-30,70 L-6,60 L4,74 L10,2 Z" fill="${C.purple}"/>
      <ellipse cx="0" cy="-50" rx="34" ry="52" fill="${C.teal}"/>
      <path d="M-30,-70 Q-44,-20 -14,10 Q-4,-30 -30,-70 Z" fill="${C.tealD}"/>
      <circle cx="10" cy="-104" r="30" fill="${C.teal}"/>
      <path d="M-6,-132 Q4,-150 18,-132 M6,-134 Q20,-150 28,-128" stroke="${C.pink}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="-110" r="10" fill="#fff"/><ellipse cx="22" cy="-110" rx="5" ry="${(6 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      <path d="M32,-104 Q56,-102 48,${-84 + open * 0.2} L34,${-90} Z" fill="${C.peach}"/>
      <path d="M34,${-88 + open} Q46,${-86 + open} 44,${-80 + open} L34,${-82 + open} Z" fill="#E08E2E"/>
      <ellipse cx="8" cy="-90" rx="9" ry="6" fill="${C.pink}" opacity=".5"/>
      <line x1="-8" y1="0" x2="-8" y2="12" stroke="${C.dark}" stroke-width="5"/><line x1="8" y1="0" x2="8" y2="12" stroke="${C.dark}" stroke-width="5"/>
    </g>`;
  }
  function robot(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, sd = o.seed || 6, dist = o.dist || 0;
    const bl = blink(t, sd), talk = o.talk ? Math.abs(Math.sin(t * 11)) : 0;
    const bob = o.moving ? Math.sin(t * 16) * 2 : Math.sin(t * 2) * 2;
    const ant = 0.5 + 0.5 * Math.sin(t * 6);
    const armA = o.arm ?? 30;
    const wheel = wx => `<g transform="translate(${wx},-22) rotate(${(dist / 22) * 57.3})"><circle r="22" fill="${C.dark}"/><circle r="9" fill="#D9CFC8"/><rect x="-2.5" y="-20" width="5" height="16" fill="#D9CFC8"/></g>`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})">
      ${wheel(-34)}${wheel(34)}
      <g transform="translate(0,${bob.toFixed(2)})">
        <rect x="-62" y="-150" width="124" height="112" rx="24" fill="${o.col || C.tealL}" stroke="${C.tealD}" stroke-width="5"/>
        <rect x="-30" y="-122" width="60" height="40" rx="10" fill="#fff" opacity=".7"/>
        <circle cx="-14" cy="-102" r="6" fill="${C.pink}"/><circle cx="6" cy="-102" r="6" fill="${C.gold}"/>
        <path d="M58,-110 L${58 + Math.cos(rad(armA)) * 60},${-110 + Math.sin(rad(armA)) * 60}" stroke="${C.tealD}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="${58 + Math.cos(rad(armA)) * 60}" cy="${-110 + Math.sin(rad(armA)) * 60}" r="11" fill="${C.tealD}"/>
        ${o.hold ? `<g transform="translate(${58 + Math.cos(rad(armA)) * 60},${-110 + Math.sin(rad(armA)) * 60})">${o.hold}</g>` : ''}
        <rect x="-54" y="-236" width="108" height="80" rx="22" fill="#fff" stroke="${C.tealD}" stroke-width="5"/>
        <rect x="-42" y="-224" width="84" height="56" rx="14" fill="${C.dark}"/>
        <ellipse cx="-18" cy="-200" rx="8" ry="${(10 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.teal}"/>
        <ellipse cx="18" cy="-200" rx="8" ry="${(10 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.teal}"/>
        ${talk > 0.05 ? `<rect x="-12" y="${-184}" width="24" height="${3 + talk * 8}" rx="3" fill="${C.teal}"/>` : `<path d="M-12,-182 Q0,-174 12,-182" stroke="${C.teal}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`}
        <line x1="0" y1="-236" x2="0" y2="-262" stroke="${C.tealD}" stroke-width="5"/>
        <circle cx="0" cy="-268" r="9" fill="${C.pink}" opacity="${0.5 + ant * 0.5}"/>
      </g>
    </g>`;
  }
  // A candle character: body/wick in local units, with a face. (x, y) = bottom of lower wick.
  function candleGuy(t, o) {
    const w = o.w || 90, col = o.col || C.teal, sd = o.seed || 1, bl = blink(t, sd);
    const { bodyTop, bodyBot, hi, lo } = o; // screen y values
    const cx = o.x, my = (bodyTop + bodyBot) / 2;
    const ey = Math.min(bodyBot - 26, bodyTop + 34);
    const mouth = o.talk ? `<ellipse cx="${cx}" cy="${ey + 22}" rx="9" ry="${3 + Math.abs(Math.sin(t * 10)) * 6}" fill="${C.dark}"/>`
      : `<path d="M${cx - 11},${ey + 18} Q${cx},${ey + 28} ${cx + 11},${ey + 18}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const armY = my + 6, sw = Math.sin(t * 3 + sd) * 10;
    const la = o.armL ?? 140 + sw, ra = o.armR ?? 40 - sw;
    const arm = (sx, a) => `<path d="M${sx},${armY} L${sx + Math.cos(rad(a)) * 44},${armY + Math.sin(rad(a)) * 44}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/><circle cx="${sx + Math.cos(rad(a)) * 44}" cy="${armY + Math.sin(rad(a)) * 44}" r="7" fill="${C.dark}"/>`;
    return `<g>
      <line x1="${cx}" x2="${cx}" y1="${hi}" y2="${lo}" stroke="${col}" stroke-width="10" stroke-linecap="round"/>
      ${arm(cx - w / 2, la)}${arm(cx + w / 2, ra)}
      <rect x="${cx - w / 2}" y="${bodyTop}" width="${w}" height="${bodyBot - bodyTop}" rx="16" fill="${col}"/>
      <rect x="${cx - w / 2 + 10}" y="${bodyTop + 10}" width="10" height="${Math.max(10, (bodyBot - bodyTop) * 0.5)}" rx="5" fill="#fff" opacity=".35"/>
      <ellipse cx="${cx - 15}" cy="${ey}" rx="7" ry="${(10 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      <ellipse cx="${cx + 15}" cy="${ey}" rx="7" ry="${(10 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      <circle cx="${cx - 12}" cy="${ey - 4}" r="2.5" fill="#fff"/><circle cx="${cx + 18}" cy="${ey - 4}" r="2.5" fill="#fff"/>
      ${mouth}
    </g>`;
  }
  function drone(t, o) {
    const s = o.s || 1, bl = blink(t, 7), sp = Math.abs(Math.sin(t * 40));
    const tilt = o.tilt || 0;
    return `<g transform="translate(${o.x},${o.y + Math.sin(t * 5) * 4}) rotate(${tilt}) scale(${s})">
      <line x1="-60" y1="-34" x2="60" y2="-34" stroke="${C.dark}" stroke-width="6"/>
      <ellipse cx="-60" cy="-40" rx="${10 + sp * 30}" ry="5" fill="${C.purpleL}"/><ellipse cx="60" cy="-40" rx="${10 + (1 - sp) * 30}" ry="5" fill="${C.purpleL}"/>
      <rect x="-40" y="-34" width="80" height="44" rx="20" fill="${C.purple}"/>
      <ellipse cx="-12" cy="-12" rx="5" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="#fff"/><ellipse cx="12" cy="-12" rx="5" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="#fff"/>
      <path d="M-8,2 Q0,8 8,2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${o.cargo ? `<line x1="0" y1="10" x2="0" y2="30" stroke="${C.muted}" stroke-width="3"/><g transform="translate(0,62)">${box(44, 34)}</g>` : ''}
    </g>`;
  }
  const P = (t, o) => A.person(t, o);

  const LIVE = {};
  const BUILD = {};

  /* ================================================================== *
   * Lesson 10 · What Is Price Delivery?
   * ================================================================== */

  // Two couriers take very different routes to the same house; the routes turn into candles.
  LIVE['s8-two-couriers'] = (s, t) => {
    const T = s.beats;
    let out = `<path d="M0,1080 L0,940 Q480,900 960,930 T1920,915 L1920,1080 Z" fill="#F6EDE6"/>` +
      cloud(380 + Math.sin(t * 0.3) * 30, 430, 0.8, 0.9) + cloud(1180 + Math.sin(t * 0.25 + 1) * 40, 400, 0.6, 0.9);
    const S = [240, 900], D = [1600, 640];
    // Route A: lots of back and forth. Route B: waits, then one fast run.
    const A1 = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, base = lerp(S[1], D[1], u);
      A1.push([lerp(S[0], D[0], u), i === 0 ? S[1] : i === 16 ? D[1] : base + (i % 2 ? -46 : 18) - 130 * Math.sin(Math.PI * u)]);
    }
    const B1 = [S, [1100, 900], D];
    const fadeR = t > T.candles ? 1 - 0.7 * seg(t, T.candles, T.candles + 0.8) : 1;
    const rk = ease(seg(t, s.start + 0.6, s.start + 2.2));
    out += `<g opacity="${fadeR}">` + poly(partial(A1, rk), C.purpleL, 10, 'stroke-dasharray="2 16"') + poly(partial(B1, rk), C.tealL, 10, 'stroke-dasharray="2 16"') + '</g>';
    // Start flag and destination house.
    const fl = Math.sin(t * 4) * 6;
    out += `<g transform="translate(${S[0] - 40},${S[1]})"><line x1="0" y1="0" x2="0" y2="-120" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/><path d="M0,-120 Q${30 + fl},${-128 + fl * 0.4} 64,-112 L64,-80 Q${30 - fl},${-90 - fl * 0.4} 0,-82 Z" fill="${C.purple}"/></g>`;
    out += pill(S[0] - 10, S[1] + 70, 'START', C.purple, pop(t, s.start + 0.8), 24);
    const hk = pop(t, s.start + 1.2, 0.7);
    out += at(1720, 640, hk, `<rect x="1610" y="500" width="220" height="160" rx="10" fill="#fff" stroke="${C.pink}" stroke-width="6"/>
      <path d="M1590,510 L1720,410 L1850,510 Z" fill="${C.pink}"/>
      <rect x="1650" y="570" width="56" height="90" rx="8" fill="${C.purple}"/><circle cx="1694" cy="616" r="5" fill="${C.gold}"/>
      <rect x="1740" y="545" width="60" height="50" rx="8" fill="${C.tealL}" stroke="${C.tealD}" stroke-width="4"/>`);
    out += pill(1720, 380, '📍 DESTINATION', C.pink, pop(t, s.start + 1.6), 26);
    // Couriers.
    const ka = seg(t, T.go, T.go + T.dur), kb = seg(t, T.go + T.dur - 2.6, T.go + T.dur - 0.4);
    const pa = alongPath(A1, ka);
    const arrivedA = ka >= 1, arrivedB = kb >= 1;
    if (t < T.candles + 0.6) {
      const op = 1 - seg(t, T.candles, T.candles + 0.6);
      const walker = P(t, { x: arrivedA ? D[0] - 40 : pa.x, y: (arrivedA ? D[1] : pa.y) + 2, scale: 0.4, look: look('c', { shirt: C.purple }), walking: ka > 0 && !arrivedA, seed: 4,
        frontArm: { a1: -10, a2: -60 }, hold: arrivedA ? '' : box(46, 36) });
      const pb = alongPath(B1, kb);
      const dx = arrivedB ? D[0] - 110 : pb.x, dy = (arrivedB ? D[1] - 40 : pb.y - 110);
      const flying = kb > 0 && !arrivedB;
      out += `<g opacity="${op}">${walker}${drone(t, { x: kb <= 0 ? S[0] + 70 : dx, y: kb <= 0 ? S[1] - 60 : dy, s: 0.8, cargo: !arrivedB, tilt: flying ? 14 : 0 })}${speedLines(dx - 30, dy + 40, flying ? 1 : 0, -1, C.purpleL)}</g>`;
    }
    // Parcels on the doorstep, a happy dog at the door.
    if (arrivedA) out += `<g transform="translate(1570,${D[1]})">${box(46, 36)}</g>`;
    if (arrivedB) out += `<g transform="translate(1520,${D[1]})">${box(46, 36)}</g>`;
    out += at(1730, 900, pop(t, s.start + 2, 0.6), dog(t, { x: 1730, y: 900, s: 0.85, flip: true, wag: arrivedA || arrivedB, tongue: arrivedB, collar: C.pink }));
    if (arrivedA) out += A.sparkle(1570, D[1] - 40, T.go + T.dur, t);
    // The routes become candles.
    if (t > T.candles) {
      for (let i = 0; i < 16; i++) {
        const a = A1[i], b = A1[i + 1], k = ease((t - (T.candles + 0.3 + i * 0.12)) / 0.4);
        out += candle((a[0] + b[0]) / 2, a[1], b[1], Math.min(a[1], b[1]) - 10, Math.max(a[1], b[1]) + 10, 30, k);
      }
      const bx = [1190, 1345, 1500];
      for (let i = 0; i < 3; i++) {
        const y0 = lerp(900, 640, i / 3), y1 = lerp(900, 640, (i + 1) / 3), k = ease((t - (T.candles + 2.4 + i * 0.25)) / 0.4);
        out += candle(bx[i], y0, y1, y1 - 6, y0 + 6, 84, k);
      }
      out += pill(820, 470, 'lots of overlap', C.purple, pop(t, T.candles + 2.2), 28);
      out += pill(1180, 990, '3 big candles', C.tealD, pop(t, T.candles + 3.4), 28);
    }
    if (T.same && t > T.same) out += pill(960, 1040, 'same destination, different delivery', C.pink, pop(t, T.same), 28) + A.sparkle(1720, 380, T.same, t);
    return out;
  };

  // A robot delivers a parcel. The label says where; flip it to see how. The rulebook stays the same.
  LIVE['s8-parcel-label'] = (s, t) => {
    const T = s.beats, G = 960;
    let out = `<rect x="0" y="${G}" width="1920" height="120" fill="#F6EDE6"/><rect x="0" y="${G}" width="1920" height="4" fill="#EADFD8"/>`;
    // House front with a window cat.
    out += `<rect x="1300" y="400" width="640" height="${G - 400}" fill="${C.pinkP}"/><rect x="1300" y="400" width="640" height="16" fill="${C.pinkL}"/>
      <rect x="1600" y="560" width="160" height="${G - 560}" rx="10" fill="${C.purple}"/><circle cx="1740" cy="${(560 + G) / 2}" r="7" fill="${C.gold}"/>
      <rect x="1360" y="470" width="190" height="150" rx="12" fill="${C.tealL}" stroke="#fff" stroke-width="8"/>`;
    out += cat(t, { x: 1450, y: 618, s: 0.7, col: C.peach, seed: 2 });
    out += `<rect x="1350" y="612" width="210" height="16" rx="6" fill="#fff"/>`;
    // Girl at the door.
    const handed = t > T.where;
    const girl = P(t, { x: 1440, y: G, scale: 1.0, look: look('d', { shirt: C.teal }), flip: true, seed: 3, talk: false,
      frontArm: handed ? { a1: -20, a2: -60 } : { a1: 100, a2: 95 }, hold: handed ? `<g transform="translate(0,6)">${box(70, 56)}</g>` : '' });
    out += girl;
    // Robot rolls in.
    const rk = ease(seg(t, T.robot, T.robot + 2.4));
    const rx = lerp(-160, 1000, rk);
    out += robot(t, { x: rx, y: G, s: 1.05, dist: rx, moving: rk > 0 && rk < 1, arm: handed ? 60 : -10, talk: t > T.robot + 2.4 && t < T.robot + 3.6,
      hold: handed ? '' : `<g transform="translate(26,6)">${box(70, 56)}</g>` });
    if (t > T.robot + 2.5 && t < T.where) out += A.bubble(980, 560, 'Delivery!', { size: 30, tail: 'left', stroke: C.tealL, sc: clamp(pop(t, T.robot + 2.5)) });
    // The label card: front = WHERE, back = HOW.
    if (handed) {
      const ck = pop(t, T.where + 0.2, 0.6);
      const flip = seg(t, T.how, T.how + 0.6);
      const sx = Math.abs(Math.cos(flip * Math.PI));
      const showBack = flip > 0.5;
      const cx = 620, cy = 530, w = 600, h = 300;
      let face;
      if (!showBack) {
        face = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="#fff" stroke="${C.pink}" stroke-width="5"/>
          ${txt(0, -64, 'WHERE did price go?', 40, C.dark, { f: 'Playfair Display' })}
          <g transform="translate(-250,40)"><path d="M0,-40 L60,-90 L120,-40 Z" fill="${C.pink}"/><rect x="10" y="-40" width="100" height="70" rx="6" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="4"/></g>
          ${txt(-90, 50, 'the destination', 32, C.muted, { w: 700, a: 'start' })}
          ${check(240, -64 + 0, pop(t, T.where + 1.2), C.tealD, 0.8)}`;
      } else {
        const mk = seg(t, T.how + 0.6, T.how + 3);
        let cs = '';
        const small = [[0, 10], [10, -6], [-6, 16], [16, 2], [2, 24], [24, 12]];
        small.forEach(([a, b], i) => { cs += candle(-230 + i * 34, 60 - a * 1.8, 60 - b * 1.8 - 10, 60 - Math.max(a, b) * 1.8 - 18, 60 - Math.min(a, b) * 1.8 + 6, 22, ease((mk * 9 - i) / 1)); });
        [[0, 1], [1, 2], [2, 3]].forEach(([a], i) => { cs += candle(80 + i * 64, 70 - a * 55, 70 - (a + 1) * 55, 70 - (a + 1) * 55 - 6, 70 - a * 55 + 6, 48, ease((mk * 9 - 6 - i) / 1)); });
        face = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
          ${txt(0, -84, 'HOW did it get there?', 40, C.dark, { f: 'Playfair Display' })}
          <line x1="-10" y1="-50" x2="-10" y2="120" stroke="#F1E7E1" stroke-width="3"/>
          ${cs}${txt(-160, 128, 'overlap', 24, C.purple, { op: clamp(mk * 3 - 1) })}${txt(144, 128, 'one-sided', 24, C.tealD, { op: clamp(mk * 3 - 2) })}`;
      }
      out += `<g transform="translate(${cx},${cy}) scale(${ck * Math.max(0.02, sx)},${ck})">${face}</g>`;
    }
    // The rulebook: delivery doesn't rewrite it.
    if (t > T.rule) {
      const bk = pop(t, T.rule, 0.7);
      out += at(300, 880, bk, `<rect x="270" y="900" width="60" height="${G - 900}" fill="${C.muted}"/><rect x="190" y="890" width="220" height="18" rx="8" fill="${C.muted}"/>
        <g transform="translate(300,805) rotate(-6)"><rect x="-110" y="-80" width="220" height="150" rx="12" fill="${C.purple}"/><rect x="-96" y="-70" width="192" height="130" rx="8" fill="${C.purpleL}"/>
        ${txt(0, -24, 'MY ENTRY', 28, C.purple)}${txt(0, 10, 'MODEL', 28, C.purple)}<rect x="-60" y="26" width="120" height="8" rx="4" fill="#fff"/></g>`);
      out += pill(300, 1030, 'unchanged ✓', C.tealD, pop(t, T.rule + 1.6), 28);
      if (t > T.rule + 0.8) {
        const k = ease(seg(t, T.rule + 0.8, T.rule + 1.6));
        out += `<path d="M${420},${690} Q${380},${700} ${lerp(420, 330, k)},${lerp(690, 720, k)}" fill="none" stroke="${C.muted}" stroke-width="5" stroke-dasharray="10 10" opacity=".6"/>`;
      }
      out += pill(660, 760, 'delivery = context', C.purple, pop(t, T.rule + 4), 28);
    }
    return out;
  };

  /* ================================================================== *
   * Lesson 11 · Displacement
   * ================================================================== */

  // A runner jogs in place (small overlapping candles), then bursts into a sprint (displacement).
  LIVE['s8-sprint-burst'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="930" width="1920" height="150" fill="${C.peachL}" opacity=".55"/>
      ${[950, 990, 1030].map(y => `<rect x="0" y="${y}" width="1920" height="4" fill="#fff" opacity=".8"/>`).join('')}`;
    // Chart panel.
    const px = 230, pw = 1130;
    out += panel(px, 380, pw, 370, pop(t, s.start + 0.3, 0.7));
    const jog = [];
    for (let i = 0; i < 8; i++) { const o = 665 + Math.sin(i * 1.9) * 16, c = 665 + Math.sin(i * 1.9 + 1.7) * 16; jog.push([290 + i * 50, o, c]); }
    jog.forEach(([x, o, c], i) => { out += candle(x, o, c, Math.min(o, c) - 14, Math.max(o, c) + 14, 30, ease((t - (T.jog + i * 0.7)) / 0.4)); });
    const burst = [[720, 670, 600], [810, 600, 530], [900, 530, 465], [990, 465, 420]];
    burst.forEach(([x, o, c], i) => { out += candle(x, o, c, c - 8, o + 6, 66, ease((t - (T.burst + 0.2 + i * 0.35)) / 0.3)); });
    const pb = [[1080, 422, 446], [1150, 446, 462], [1220, 462, 454]];
    pb.forEach(([x, o, c], i) => { out += candle(x, o, c, Math.min(o, c) - 10, Math.max(o, c) + 10, 36, ease((t - (T.pb + i * 0.6)) / 0.4)); });
    out += pill(470, 590, 'small, overlapping', C.purple, pop(t, T.jog + 2.4), 26);
    out += pill(540, 450, '⚡ DISPLACEMENT', C.tealD, pop(t, T.burst + 1.8), 30);
    out += pill(1150, 530, 'then a pullback', C.pink, pop(t, T.pb + 1.6), 24);
    // Hurdle with a bird that takes off as the runner passes.
    const rk = ease(seg(t, T.burst, T.burst + 2.2) ** 1.6);
    const rx = t < T.burst ? 470 : lerp(470, 1320, rk);
    out += `<rect x="986" y="880" width="10" height="${G - 880}" fill="${C.muted}"/><rect x="1094" y="880" width="10" height="${G - 880}" fill="${C.muted}"/><rect x="976" y="870" width="138" height="16" rx="6" fill="#fff" stroke="${C.muted}" stroke-width="3"/>`;
    const fly = seg(t, T.burst + 1.0, T.burst + 3.2);
    out += bird(t, { x: lerp(1050, 1300, fly) + Math.sin(fly * 8) * 20, y: lerp(870, 430, ease(fly)), s: 1.1, flying: fly > 0 && fly < 1, col: C.purpleL, seed: 2 });
    // Runner.
    const sprinting = t >= T.burst && rk < 1;
    out += speedLines(rx - 30, G - 130, sprinting ? 1 : 0, -1, C.teal);
    if (sprinting) out += [0, 1, 2].map(i => { const q = ((t * 3) + i / 3) % 1; return `<circle cx="${rx - 40 - q * 120}" cy="${G - 10 - q * 20}" r="${12 * (1 - q)}" fill="${C.muted}" opacity="${0.3 * (1 - q)}"/>`; }).join('');
    out += P(t, { x: rx, y: G, scale: 0.7, look: look('c', { shirt: C.peach, pants: C.purple }), walking: t < T.photo + 0.4 && rk < 1, seed: 5,
      frontArm: rk >= 1 ? { a1: -60, a2: -100 } : { a1: 60 + Math.sin(t * 9) * 40, a2: -20 }, mood: 'happy' });
    // Photographer captures the moment.
    out += P(t, { x: 1740, y: G, scale: 0.85, look: look('b', { shirt: C.pinkL }), flip: true, seed: 8,
      frontArm: { a1: -30, a2: -20 }, hold: `<g transform="translate(6,-4)"><rect x="-6" y="-26" width="58" height="40" rx="8" fill="${C.dark}"/><circle cx="24" cy="-6" r="13" fill="#fff"/><circle cx="24" cy="-6" r="7" fill="${C.purple}"/></g>` });
    if (t > T.photo) {
      const fl = clamp(1 - (t - T.photo) / 0.5);
      if (fl > 0) out += `<circle cx="1690" cy="${G - 220}" r="${60 + (1 - fl) * 100}" fill="#fff" opacity="${fl}"/>`;
      const pk = pop(t, T.photo + 0.3, 0.6);
      out += at(1640, 520, pk, `<g transform="rotate(4 1640 520)"><rect x="1490" y="400" width="300" height="250" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="4"/>
        <rect x="1510" y="420" width="260" height="170" fill="${C.tealL}" opacity=".35"/>
        ${[0, 1, 2, 3].map(i => candle(1560 + i * 52, 570 - i * 34, 540 - i * 34, 534 - i * 34, 574 - i * 34, 34)).join('')}
        ${txt(1640, 628, 'that moment', 26, C.dark, { f: 'Playfair Display' })}</g>`);
      out += pill(1640, 700, 'not a forecast', C.pink, pop(t, T.photo + 2.2), 24);
    }
    return out;
  };

  // A friend has one puzzle piece (displacement). The trade plan still has empty slots.
  LIVE['s8-missing-pieces'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    const bx = 690, by = 400, bw = 540, bh = 520;
    const bk = pop(t, s.start + 0.4, 0.7);
    const slots = [['DISPLACEMENT', C.teal], ['STRUCTURE', C.purple], ['ENTRY MODEL', C.peach], ['RISK PLAN', C.pink]];
    const cell = i => ({ x: bx + 30 + (i % 2) * 250 + 115, y: by + 100 + Math.floor(i / 2) * 200 + 90 });
    const piece = (cx, cy, col, label, dashed) => `<g transform="translate(${cx},${cy})">
        <path d="M-110,-85 L-20,-85 A20,20 0 0,1 20,-85 L110,-85 L110,-20 A20,20 0 0,1 110,20 L110,85 L-110,85 Z" fill="${dashed ? '#fff' : col}" stroke="${col}" stroke-width="5" ${dashed ? 'stroke-dasharray="14 10"' : ''}/>
        ${txt(0, 10, label, label.length > 10 ? 24 : 28, dashed ? col : '#fff')}</g>`;
    let board = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="30" fill="${C.cream}" stroke="#9B6A45" stroke-width="10"/>
      ${txt(bx + bw / 2, by + 58, 'TRADE PLAN', 34, '#9B6A45', { ls: 4 })}`;
    slots.forEach(([l, c], i) => {
      const q = cell(i);
      const miss = i > 0 && t > T.miss + (i - 1) * (T.gap || 1.1);
      const pulse = miss ? 1 + Math.sin((t - T.miss) * 5 + i) * 0.03 : 1;
      board += `<g transform="translate(${q.x},${q.y}) scale(${pulse}) translate(${-q.x},${-q.y})">${piece(q.x, q.y, i === 0 ? '#C9B9AE' : c, i === 0 ? '' : l, true)}</g>`;
      if (miss) board += pill(q.x, q.y + 60, 'MISSING', C.pink, pop(t, T.miss + (i - 1) * (T.gap || 1.1)), 20);
    });
    out += at(bx + bw / 2, by + bh / 2, bk, board);
    // Friend with the one piece.
    const placed = seg(t, T.place, T.place + 1.0);
    const hand = { x: 430 + 64.7 * 0.95, y: G - 293.6 * 0.95 };
    out += P(t, { x: 430, y: G, scale: 0.95, look: A.LOOKS.seller, seed: 4, talk: t > T.claim && t < T.claim + 2,
      frontArm: placed > 0 ? { a1: -10, a2: 10 } : { a1: -50, a2: -80 } });
    const q0 = cell(0);
    const px = lerp(hand.x, q0.x, ease(placed)), py = lerp(hand.y, q0.y, ease(placed)) - Math.sin(placed * Math.PI) * 120;
    out += `<g transform="translate(${px},${py}) scale(${lerp(0.45, 1, ease(placed))}) rotate(${(1 - placed) * -12}) translate(${-px},${-py})">${piece(px, py, C.teal, 'DISPLACEMENT', false)}</g>`;
    if (placed >= 1) out += check(q0.x + 96, q0.y - 70, pop(t, T.place + 1), C.tealD, 0.7) + A.sparkle(q0.x, q0.y, T.place + 1, t);
    if (t > T.claim && t < T.place + 0.4) out += A.bubble(470, 430, 'It displaced. I’m buying!', { size: 30, tail: 'left', stroke: C.pinkL, sc: clamp(pop(t, T.claim)) });
    // Friend with a magnifier checks the empty slots; a dog tilts its head.
    const mag = `<g transform="rotate(-30)"><circle cx="58" cy="0" r="28" fill="#fff" fill-opacity=".35" stroke="${C.dark}" stroke-width="7"/><line x1="0" y1="0" x2="30" y2="0" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/></g>`;
    out += P(t, { x: 1500, y: G, scale: 0.95, look: A.LOOKS.e, flip: true, seed: 6, talk: t > T.miss && t < T.miss + 3.5,
      frontArm: t > T.miss ? { a1: -40, a2: -20 } : { a1: 100, a2: 95 }, hold: t > T.miss ? mag : '' });
    out += dog(t, { x: 1740, y: G, s: 0.8, flip: true, tilt: t > T.miss, seed: 3, collar: C.teal });
    if (t > T.miss) out += questionMarks(1760, 840, t, C.purple);
    if (T.info && t > T.info) out += pill(960, 1035, 'information, not a complete plan', C.purple, pop(t, T.info), 28);
    return out;
  };

  /* ================================================================== *
   * Lesson 12 · What Is Imbalance?
   * ================================================================== */

  // A tennis rally (two-sided trading, overlapping candles), then a smash nobody returns (imbalance).
  LIVE['s8-tennis-rally'] = (s, t) => {
    const T = s.beats, G = 980, per = 1.1;
    let out = `<rect x="0" y="900" width="1920" height="180" fill="${C.tealL}" opacity=".45"/>
      <rect x="120" y="${G}" width="1680" height="5" fill="#fff"/><rect x="120" y="920" width="1680" height="4" fill="#fff" opacity=".7"/>
      <rect x="954" y="850" width="12" height="${G - 850}" fill="${C.muted}"/>
      <rect x="930" y="856" width="60" height="${G - 860}" fill="#fff" opacity=".6" stroke="${C.muted}" stroke-width="2"/>
      ${[0, 1, 2, 3, 4].map(i => `<line x1="930" x2="990" y1="${870 + i * 22}" y2="${870 + i * 22}" stroke="${C.muted}" stroke-width="1.5" opacity=".6"/>`).join('')}
      <rect x="926" y="848" width="68" height="10" rx="4" fill="#fff"/>`;
    out += panel(480, 380, 960, 260, pop(t, s.start + 0.3, 0.7));
    const hits = Math.max(0, Math.min(9, Math.floor((t - T.rally) / per) + 1));
    for (let k = 0; k < 9; k++) {
      const o = 565 + Math.sin(k * 2.1) * 14, c = 565 + Math.sin(k * 2.1 + 2) * 14;
      out += candle(560 + k * 46, o, c, Math.min(o, c) - 16, Math.max(o, c) + 16, 28, t > T.rally + k * per ? ease((t - T.rally - k * per) / 0.4) : 0);
    }
    if (t > T.smash) {
      out += candle(1040, 575, 490, 484, 580, 64, ease((t - T.smash - 0.2) / 0.3));
      out += candle(1120, 490, 410, 404, 494, 64, ease((t - T.smash - 0.5) / 0.3));
      out += candle(1200, 410, 400, 396, 414, 30, ease((t - T.smash - 0.8) / 0.3));
    }
    out += pill(760, 430, 'both sides trading', C.purple, pop(t, T.rally + 2.4), 26);
    out += pill(1210, 606, 'one side only', C.tealD, pop(t, T.smash + 2.6), 26);
    // Ball.
    const L = [470, 770], R = [1450, 770];
    let bx, by, swingL = 0, swingR = 0, ballOn = t > T.rally - 0.2;
    if (t < T.smash) {
      const f = Math.max(0, (t - T.rally) / per), k = Math.floor(f), u = f - k;
      const from = k % 2 ? R : L, to = k % 2 ? L : R;
      bx = lerp(from[0], to[0], u); by = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 120;
      if (t < T.rally) { bx = L[0]; by = L[1]; }
      const near = u < 0.15 ? 1 - u / 0.15 : u > 0.85 ? (u - 0.85) / 0.15 : 0;
      if ((k % 2 === 0 && u < 0.15) || (k % 2 === 1 && u > 0.85)) swingL = near; else swingR = near;
    } else {
      const u = seg(t, T.smash, T.smash + 0.9);
      bx = lerp(L[0], 2100, u); by = lerp(700, 930, u) - Math.sin(u * Math.PI) * 60;
      swingL = 1 - seg(t, T.smash, T.smash + 0.5);
    }
    const racket = `<g transform="rotate(20)"><line x1="0" y1="0" x2="0" y2="-46" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="-80" rx="26" ry="34" fill="#fff" fill-opacity=".5" stroke="${C.purple}" stroke-width="6"/>
      <line x1="-20" x2="20" y1="-80" y2="-80" stroke="${C.purpleL}" stroke-width="2"/><line x1="0" x2="0" y1="-110" y2="-50" stroke="${C.purpleL}" stroke-width="2"/></g>`;
    const smashing = t > T.smash - 0.4 && t < T.smash + 0.6;
    out += P(t, { x: 380, y: G, scale: 0.9, look: A.LOOKS.buyer, seed: 3, mood: 'happy',
      frontArm: smashing ? { a1: -100 + seg(t, T.smash - 0.4, T.smash + 0.2) * 120, a2: -90 + seg(t, T.smash - 0.4, T.smash + 0.2) * 120 } : { a1: 10 - swingL * 60, a2: -50 - swingL * 40 }, hold: racket });
    const missed = t > T.smash + 0.4;
    out += P(t, { x: 1540, y: G, scale: 0.9, look: A.LOOKS.seller, flip: true, seed: 5, mood: missed ? 'sad' : 'happy',
      frontArm: missed ? { a1: -70, a2: -120 } : { a1: 10 - swingR * 60, a2: -50 - swingR * 40 }, hold: racket });
    if (missed) out += questionMarks(1540, 600, t, C.pink);
    if (ballOn && bx < 1960) out += `<circle cx="${bx}" cy="${by}" r="16" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/><path d="M${bx - 12},${by - 6} Q${bx},${by + 4} ${bx + 12},${by - 6}" stroke="#fff" stroke-width="2.5" fill="none"/>`;
    if (t >= T.smash && t < T.smash + 0.9) out += speedLines(bx - 10, by + 40, 1, -1, C.gold);
    // Ball-kid dog chases it off.
    const dk = seg(t, T.smash + 0.6, T.smash + 2.6);
    out += dog(t, { x: lerp(1760, 2150, ease(dk)), y: G + 20, s: 0.7, flip: dk > 0, walking: dk > 0 && dk < 1, wag: true, seed: 2, collar: C.peach });
    if (T.imb && t > T.imb) out += pill(960, 1040, 'little two-sided trading = IMBALANCE', C.purple, pop(t, T.imb), 30);
    return out;
  };

  // Imbalance is the big idea; an FVG is one measurement inside it. A parrot squawks the myth.
  LIVE['s8-measure-parrot'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    out += panel(560, 390, 820, 560, pop(t, s.start + 0.3, 0.7));
    const ck = i => ease((t - (s.start + 0.6 + i * 0.18)) / 0.4);
    let i = 0;
    for (let k = 0; k < 5; k++, i++) { const o = 850 + Math.sin(k * 2.3) * 14, c = 850 + Math.sin(k * 2.3 + 2) * 14; out += candle(620 + k * 44, o, c, Math.min(o, c) - 16, Math.max(o, c) + 16, 28, ck(i)); }
    // Imbalance glow behind the fast move.
    const gk = ease(seg(t, T.cloud, T.cloud + 0.8));
    if (gk > 0) out += `<rect x="${830}" y="${450}" width="${320}" height="${440}" rx="60" fill="${C.purpleL}" opacity="${0.45 * gk}"/>`;
    const fast = [[870, 860, 770], [950, 770, 660], [1030, 660, 560], [1110, 560, 480]];
    fast.forEach(([x, o, c]) => { out += candle(x, o, c, c - 8, o + 8, 60, ck(i++)); });
    for (let k = 0; k < 4; k++, i++) { const o = 474 - k * 8 + Math.sin(k * 2) * 8, c = 474 - k * 8 + Math.sin(k * 2 + 2) * 8; out += candle(1190 + k * 44, o, c, Math.min(o, c) - 12, Math.max(o, c) + 12, 26, ck(i)); }
    out += pill(990, 432, 'IMBALANCE: the big idea', C.purple, pop(t, T.cloud + 0.4), 26);
    // FVG: candle 1 high (762) to candle 3 low (668).
    const fk = ease(seg(t, T.fvg, T.fvg + 0.8));
    if (fk > 0) {
      out += fvg(845, 1060, 668, 762, fk, C.peach);
      // Ruler beside the box.
      out += at(1090, 715, pop(t, T.fvg + 0.3), `<rect x="1076" y="654" width="30" height="122" rx="5" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>
        ${Array.from({ length: 9 }, (_, j) => `<line x1="1076" x2="${j % 2 ? 1088 : 1096}" y1="${662 + j * 13}" y2="${662 + j * 13}" stroke="${C.dark}" stroke-width="2"/>`).join('')}`);
      out += pill(1180, 905, 'FVG: one measurement', '#E08E2E', pop(t, T.fvg + 1.2), 26);
    }
    // Carpenter with a ruler.
    const ruler = `<g transform="rotate(-20)"><rect x="-8" y="-90" width="18" height="96" rx="3" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map(j => `<line x1="-8" x2="0" y1="${-80 + j * 15}" y2="${-80 + j * 15}" stroke="${C.dark}" stroke-width="2"/>`).join('')}</g>`;
    out += P(t, { x: 340, y: G, scale: 1, look: look('a', { shirt: C.peach }), seed: 2, talk: t > T.fvg && t < T.fvg + 3,
      frontArm: t > T.fvg ? { a1: -30, a2: -40 } : { a1: 80, a2: 60 }, hold: ruler });
    // Parrot on a perch.
    out += `<line x1="1650" y1="${G}" x2="1650" y2="740" stroke="#9B6A45" stroke-width="12"/><line x1="1580" y1="740" x2="1720" y2="740" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
      <path d="M1610,${G} L1690,${G} L1650,${G - 30} Z" fill="#9B6A45"/>`;
    const squawk = t > T.myth && t < T.myth + 3.2;
    out += parrot(t, { x: 1650, y: 730, s: 1.15, flip: true, talk: squawk, seed: 4 });
    if (t > T.myth) {
      const bk = clamp(pop(t, T.myth));
      const fall = seg(t, T.stamp + 2.2, T.stamp + 3.2);
      out += `<g opacity="${1 - fall}">${A.bubble(1590, 500, 'MUST RETURN!', { size: 34, weight: 900, tail: 'right', sc: bk, stroke: C.pinkL })}</g>`;
      const sk = pop(t, T.stamp, 0.4);
      if (sk > 0) out += `<g transform="translate(1590,500) scale(${(2 - clamp(sk)) * sk * 0.9}) rotate(-12)" opacity="${1 - fall}"><rect x="-120" y="-46" width="240" height="92" rx="12" fill="none" stroke="${C.pink}" stroke-width="9"/>${txt(0, 22, 'MYTH', 60, C.pink, { f: 'Playfair Display' })}</g>`;
      out += pill(1500, 1040, 'may revisit, never has to', C.tealD, pop(t, T.stamp + 2.0), 26);
    }
    return out;
  };

  /* ================================================================== *
   * Lesson 13 · Fair Value Gaps
   * ================================================================== */

  // Three candle characters on stage. Candle 1's high and candle 3's low never meet: the gap.
  LIVE['s8-candle-trio'] = (s, t) => {
    const T = s.beats, G = 960;
    let out = `<rect x="0" y="${G}" width="1920" height="120" fill="${C.peachL}" opacity=".6"/><rect x="0" y="${G}" width="1920" height="6" fill="${C.peach}" opacity=".5"/>`;
    // Curtains.
    const sway = Math.sin(t * 1.2) * 6;
    out += `<path d="M0,360 L250,360 Q${200 + sway},700 ${230 + sway},${G} L0,${G} Z" fill="${C.pink}" opacity=".85"/><path d="M1920,360 L1670,360 Q${1720 - sway},700 ${1690 - sway},${G} L1920,${G} Z" fill="${C.pink}" opacity=".85"/>
      <path d="M0,360 L1920,360 L1920,400 Q960,440 0,400 Z" fill="${C.pinkL}"/>`;
    const fl = seg(t, T.flip, T.flip + 0.8), bear = fl >= 0.5;
    const sq = Math.abs(Math.cos(fl * Math.PI));
    const M = 715, my = y => bear ? 2 * M - y : y;
    const col = bear ? C.pink : C.teal;
    const defs = [
      { x: 700, o: 860, c: 800, hi: 770, lo: 890, at: T.c1, w: 124 },
      { x: 960, o: 820, c: 560, hi: 540, lo: 840, at: T.c2, w: 150 },
      { x: 1220, o: 600, c: 520, hi: 500, lo: 680, at: T.c3, w: 124 },
    ];
    // Spotlight cone.
    const sp = clamp((t - T.c1) / 0.6);
    if (sp > 0) out += `<path d="M330,${G - 260} L640,470 L1320,470 L1320,${G} L640,${G} Z" fill="#FFF3C4" opacity="${0.35 * sp}"/>`;
    // Gap box behind the candles.
    const edge1 = bear ? my(770) : 770, edge3 = bear ? my(680) : 680;
    const gk = bear ? ease(seg(t, T.flip + 2.6, T.flip + 3.4)) : ease(seg(t, T.gap, T.gap + 0.8)) * (1 - seg(t, T.flip, T.flip + 0.3));
    if (gk > 0) out += `<rect x="640" y="${Math.min(edge1, edge3)}" width="${600 * gk}" height="${Math.abs(edge1 - edge3)}" fill="${C.purple}" opacity=".22"/>`;
    let guys = '';
    defs.forEach((d, i) => {
      const k = pop(t, d.at, 0.6);
      if (k <= 0) return;
      const drop = i === 1 ? (1 - clamp(back((t - d.at) / 0.7))) * -500 : 0;
      const pointUp = !bear && t > T.edges && (i === 0), pointDn = !bear && t > T.edges + 1 && i === 2;
      const bpu = bear && t > T.flip + 1.6 && i === 0, bpd = bear && t > T.flip + 1.6 && i === 2;
      const g = candleGuy(t, { x: d.x, bodyTop: Math.min(my(d.o), my(d.c)), bodyBot: Math.max(my(d.o), my(d.c)), hi: Math.min(my(d.hi), my(d.lo)), lo: Math.max(my(d.hi), my(d.lo)), col, w: d.w, seed: i + 1,
        armL: pointUp ? -100 : bpu ? 110 : undefined, armR: pointDn ? 80 : bpd ? -70 : undefined, talk: false });
      guys += `<g transform="translate(0,${drop}) translate(${d.x},${M}) scale(${k},${k * Math.max(0.05, sq)}) translate(${-d.x},${-M})">${g}</g>`;
      const lowY = Math.max(my(d.hi), my(d.lo));
      guys += pill(d.x, Math.min(lowY + 44, 1010), 'C' + (i + 1), C.dark, pop(t, d.at + 0.3) * (fl > 0 && fl < 1 ? 0 : 1), 24);
    });
    out += guys;
    // Edges.
    const ek1 = bear ? ease(seg(t, T.flip + 1.6, T.flip + 2.2)) : ease(seg(t, T.edges, T.edges + 0.6)) * (1 - seg(t, T.flip, T.flip + 0.2));
    const ek3 = bear ? ease(seg(t, T.flip + 2.0, T.flip + 2.6)) : ease(seg(t, T.edges + 1, T.edges + 1.6)) * (1 - seg(t, T.flip, T.flip + 0.2));
    if (ek1 > 0) out += `<line x1="630" x2="${lerp(630, 1340, ek1)}" y1="${edge1}" y2="${edge1}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 10"/>` + pill(1430, edge1 + (bear ? -28 : 28), bear ? 'C1 low' : 'C1 high', C.purple, ek1, 24);
    if (ek3 > 0) out += `<line x1="630" x2="${lerp(630, 1340, ek3)}" y1="${edge3}" y2="${edge3}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 10"/>` + pill(1430, edge3 + (bear ? 28 : -28), bear ? 'C3 high' : 'C3 low', C.purple, ek3, 24);
    if (gk > 0.5) out += pill(1500, (edge1 + edge3) / 2 + (bear ? 175 : -150), bear ? 'BEARISH FVG' : 'BULLISH FVG', bear ? C.pink : C.tealD, pop(t, bear ? T.flip + 3.0 : T.gap + 0.6), 32) +
      A.sparkle(1500, (edge1 + edge3) / 2 + (bear ? 175 : -150), bear ? T.flip + 3.0 : T.gap + 0.6, t);
    // Spotlight operator.
    out += P(t, { x: 300, y: G, scale: 0.85, look: look('a', { shirt: C.purpleL }), seed: 6, frontArm: { a1: -30, a2: -40 },
      hold: `<g transform="rotate(-30)"><rect x="-6" y="-14" width="56" height="28" rx="6" fill="${C.dark}"/><rect x="46" y="-20" width="16" height="40" rx="4" fill="${C.gold}"/></g>` });
    return out;
  };

  // An eager labeller keeps sticking rules onto the FVG; the referee blows the whistle on every one.
  LIVE['s8-label-referee'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    // Gallery pedestal with the FVG exhibit.
    const ek = pop(t, s.start + 0.4, 0.7);
    out += at(960, 760, ek, `<rect x="850" y="820" width="220" height="${G - 820}" fill="#fff" stroke="#EADFD8" stroke-width="4"/><rect x="830" y="806" width="260" height="22" rx="6" fill="#EADFD8"/>
      <rect x="790" y="480" width="340" height="320" rx="18" fill="#fff" stroke="${C.gold}" stroke-width="10"/>
      <rect x="840" y="610" width="250" height="70" fill="${C.purple}" opacity=".22"/>
      ${candle(870, 750, 700, 680, 770, 40)}${candle(960, 720, 560, 540, 730, 50)}${candle(1050, 600, 540, 520, 610, 40)}
      ${txt(960, 784, 'FVG', 26, C.purple)}`);
    // Labels fly from the labeller to the frame, then get whistled off.
    const labs = [['SUPPORT', 870, 540, -8], ['TARGET', 1050, 690, 6], ['ENTRY', 900, 650, 10], ['ICC STEP', 1040, 560, -6]];
    let whistle = false, card = false;
    labs.forEach(([l, x, y, r], i) => {
      const a = T.l[i];
      if (t < a) return;
      const fk = ease(seg(t, a, a + 0.7));
      const off = t > a + 1.3, fall = seg(t, a + 1.4, a + 2.4);
      if (t > a + 0.9 && t < a + 1.8) whistle = true;
      if (t > a + 1.0 && t < a + 2.2) card = true;
      const lx = lerp(560, x, fk), ly = lerp(700, y, fk) - Math.sin(fk * Math.PI) * 140 + fall * 420;
      const op = 1 - seg(t, a + 2.0, a + 2.4);
      if (op <= 0) return;
      out += `<g transform="translate(${lx},${ly}) rotate(${r + fall * 80})" opacity="${op}"><rect x="-90" y="-28" width="180" height="56" rx="6" fill="${C.peachL}" stroke="${C.peach}" stroke-width="3"/>${txt(0, 10, l, 28, C.dark)}</g>`;
      if (off) out += stampX(x, y, pop(t, a + 1.0, 0.4) * (1 - fall), 34);
    });
    // Labeller.
    const throwing = T.l.some(a => t > a - 0.3 && t < a + 0.3);
    out += P(t, { x: 470, y: G, scale: 1, look: look('b', { shirt: C.peach }), seed: 3, talk: T.l.some(a => t > a && t < a + 1),
      frontArm: throwing ? { a1: -40, a2: -30 } : { a1: 40, a2: -30 }, mood: t > T.desc ? 'happy' : undefined,
      hold: t < T.l[3] + 0.3 ? `<g transform="rotate(-10)"><rect x="-40" y="-40" width="80" height="44" rx="5" fill="${C.peachL}" stroke="${C.peach}" stroke-width="3"/><rect x="-36" y="-48" width="80" height="44" rx="5" fill="${C.peachL}" stroke="${C.peach}" stroke-width="3"/></g>` : '' });
    // Referee.
    out += P(t, { x: 1480, y: G, scale: 1, look: look('c', { shirt: C.dark, pants: C.dark }), flip: true, seed: 7,
      frontArm: card ? { a1: -80, a2: -95 } : { a1: 100, a2: 95 }, hold: card ? `<rect x="-20" y="-60" width="40" height="56" rx="5" fill="${C.pink}"/>` : '' });
    out += `<g transform="translate(1480,${G})">${[0, 1, 2].map(i => `<rect x="${-34 + i * 24}" y="-214" width="10" height="110" fill="#fff" opacity=".5"/>`).join('')}</g>`;
    if (whistle) out += `<circle cx="1462" cy="${G - 262}" r="8" fill="${C.gold}"/>` + txt(1300, G - 400 - Math.sin(t * 20) * 4, 'TWEET!', 34, C.pink, { f: 'Playfair Display' });
    if (t > T.desc) {
      out += at(960, 450, pop(t, T.desc, 0.6), `<rect x="800" y="404" width="320" height="60" rx="30" fill="${C.tealD}"/>${txt(960, 444, 'a description ✓', 30, '#fff')}`) + A.sparkle(960, 450, T.desc + 0.3, t, C.teal);
      out += pill(960, 1040, 'spotting one = market literacy', C.purple, pop(t, T.desc + 1.2), 28);
    }
    return out;
  };

  /* ================================================================== *
   * Lesson 14 · Efficient vs Inefficient
   * ================================================================== */

  // A dance contest: a swaying dancer and a leaping dancer. The judges' scores turn into descriptions.
  LIVE['s8-dance-judges'] = (s, t) => {
    const T = s.beats, G = 960;
    let out = `<rect x="0" y="${G}" width="1920" height="120" fill="${C.peachL}" opacity=".55"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${i * 260}" x2="${i * 260 - 60}" y1="${G}" y2="1080" stroke="${C.peach}" stroke-width="3" opacity=".35"/>`).join('')}`;
    // Spotlights.
    out += `<path d="M380,360 L250,${G} L650,${G} L480,360 Z" fill="#FFF3C4" opacity="${0.4 * seg(t, T.waltz - 0.6, T.waltz)}"/>
      <path d="M940,360 L760,${G} L1260,${G} L1060,360 Z" fill="#FFF3C4" opacity="${0.4 * seg(t, T.leap - 0.6, T.leap)}"/>`;
    // Candle strips above each dancer.
    out += panel(230, 390, 420, 220, pop(t, T.waltz - 0.4)) + panel(760, 390, 470, 220, pop(t, T.leap - 0.4));
    for (let k = 0; k < 8; k++) { const o = 510 + Math.sin(k * 2.2) * 20, c = 510 + Math.sin(k * 2.2 + 2.1) * 20; out += candle(270 + k * 48, o, c, Math.min(o, c) - 16, Math.max(o, c) + 16, 28, ease((t - T.waltz - k * 0.45) / 0.4)); }
    [[850, 580, 510], [990, 510, 450], [1130, 450, 410]].forEach(([x, o, c], k) => { out += candle(x, o, c, c - 6, o + 6, 80, ease((t - T.leap - 0.6 - k * 1.2) / 0.4)); });
    // Dancer 1 sways in place.
    const wk = t > T.waltz;
    const sw = wk ? Math.sin((t - T.waltz) * 2.6) : 0;
    out += P(t, { x: 440 + sw * 50, y: G, scale: 0.85, look: look('d', { shirt: C.purple }), seed: 2, flip: sw < 0,
      frontArm: wk ? { a1: -60 + sw * 20, a2: -110 } : { a1: 100, a2: 95 }, backArm: wk ? { a1: -120, a2: -80 } : undefined, mood: 'happy' });
    // Dancer 2 leaps across.
    const lu = clamp((t - T.leap - 0.4) / 3.6), n = Math.min(2, Math.floor(lu * 3)), f = lu * 3 - n;
    const lx = lerp(820, 1140, lu), ly = G - (lu > 0 && lu < 1 ? Math.sin(f * Math.PI) * 60 : 0);
    out += P(t, { x: lx, y: ly, scale: 0.85, look: look('buyer', { shirt: C.peach }), seed: 4, mood: 'happy',
      frontArm: lu > 0 && lu < 1 ? { a1: -40, a2: -30 } : { a1: -60, a2: -100 }, backArm: lu > 0 && lu < 1 ? { a1: 200, a2: 190 } : undefined });
    // Judges behind a table.
    const J = [[1460, 'balanced', C.purple, '6'], [1760, 'imbalanced', C.tealD, '10']];
    J.forEach(([x, word, col, score], i) => {
      const up = t > T.score + i * 0.4;
      const flipK = seg(t, T.words + i * 0.4, T.words + i * 0.4 + 0.5);
      const sx = Math.abs(Math.cos(flipK * Math.PI)), showWord = flipK > 0.5;
      const card = up ? `<g transform="translate(0,-118) scale(${Math.max(0.03, sx)},1)"><rect x="-120" y="-70" width="240" height="120" rx="14" fill="#fff" stroke="${col}" stroke-width="5"/>
          ${showWord ? txt(0, -20, word.toUpperCase() + '-', 28, col) + txt(0, 20, 'LOOKING', 28, col) : txt(0, 22, score, 72, C.dark, { f: 'Playfair Display' })}</g>` : '';
      out += P(t, { x, y: G, scale: 0.85, look: i ? A.LOOKS.e : look('a', { shirt: C.teal }), flip: true, seed: 6 + i, talk: false,
        frontArm: up ? { a1: -80, a2: -95 } : { a1: 60, a2: 0 }, hold: card });
      if (up && t > T.fix && t < T.words + i * 0.4 + 0.3) out += stampX(x, G - 470, pop(t, T.fix + i * 0.3, 0.4), 50);
    });
    out += `<rect x="1300" y="800" width="600" height="30" rx="10" fill="#9B6A45"/><rect x="1320" y="830" width="560" height="${G - 830}" fill="${C.pinkL}"/>
      ${txt(1600, 905, 'JUDGES', 30, '#fff', { ls: 6 })}`;
    if (T.desc && t > T.desc) out += pill(760, 1035, 'descriptions, not grades', C.purple, pop(t, T.desc), 30);
    return out;
  };

  // The relevant lower high is the bar. A huge jump that doesn't clear it leaves the structure bearish.
  LIVE['s8-high-jump'] = (s, t) => {
    const T = s.beats, G = 980, BAR = 560;
    let out = `<rect x="0" y="${G}" width="1920" height="100" fill="#F6EDE6"/>`;
    out += panel(760, 390, 960, 590, pop(t, s.start + 0.3, 0.7));
    const pts = [[800, 470], [940, 700], [1060, BAR], [1180, 830]];
    const dk = ease(seg(t, s.start + 0.6, s.start + 3));
    out += poly(partial(pts, dk), C.pink, 8);
    [[0, 'H', -1], [1, 'L', 1], [2, 'LH', -1], [3, 'LL', 1]].forEach(([i, l, d]) => {
      if (dk < i / 3) return;
      out += `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="10" fill="${C.pink}" stroke="#fff" stroke-width="4"/>` + pill(pts[i][0] + (i === 3 ? 0 : 0), pts[i][1] + d * 42, l, C.pink, pop(t, s.start + 0.8 + i * 0.6), 22);
    });
    // The bar = the relevant lower high.
    const bk = ease(seg(t, T.lh, T.lh + 1.2));
    if (bk > 0) {
      out += `<line x1="${1060}" x2="${lerp(1060, 1700, bk)}" y1="${BAR}" y2="${BAR}" stroke="${C.purple}" stroke-width="6" stroke-dasharray="16 10"/>
        <line x1="${lerp(1060, 210, bk)}" x2="760" y1="${BAR}" y2="${BAR}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="6 12" opacity=".5"/>`;
      out += pill(1450, BAR - 34, 'relevant lower high', C.purple, pop(t, T.lh + 0.8), 24);
      // Jump stands with the bar.
      out += at(430, G, pop(t, T.lh + 0.2, 0.7), `<rect x="214" y="${BAR - 20}" width="14" height="${G - BAR + 20}" fill="${C.muted}"/><rect x="636" y="${BAR - 20}" width="14" height="${G - BAR + 20}" fill="${C.muted}"/>
        <rect x="214" y="${BAR - 7}" width="436" height="14" rx="7" fill="${C.purple}"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${240 + i * 70}" y="${BAR - 7}" width="35" height="14" fill="#fff" opacity=".5"/>`).join('')}
        <rect x="200" y="${G - 40}" width="464" height="40" rx="12" fill="${C.tealL}"/>`);
    }
    // Strong candles up from the LL, stopping below the bar.
    const strong = [[1230, 830, 750], [1300, 750, 670], [1370, 670, 595]];
    strong.forEach(([x, o, c], i) => { out += candle(x, o, c, c - 8, o + 6, 56, ease((t - T.jump - 0.1 - i * 0.35) / 0.3)); });
    if (t > T.jump + 1.6) out += candle(1440, 595, 640, 585, 650, 34, ease((t - T.jump - 1.6) / 0.4));
    // Jumper.
    const ju = seg(t, T.jump, T.jump + 1.3);
    const crouch = t > T.jump - 0.6 && t < T.jump ? Math.sin(seg(t, T.jump - 0.6, T.jump) * Math.PI) * 12 : 0;
    const jy = G - 40 - Math.sin(ju * Math.PI) * 150 + crouch;
    out += P(t, { x: 430, y: jy, scale: 0.75, look: look('b', { shirt: C.teal }), seed: 3, mood: ju >= 1 && t > T.close ? 'happy' : undefined,
      frontArm: ju > 0 && ju < 1 ? { a1: -95, a2: -90 } : { a1: 100, a2: 95 }, backArm: ju > 0 && ju < 1 ? { a1: -85, a2: -90 } : undefined });
    if (ju > 0 && ju < 1) out += speedLines(430, jy + 60, 1, 1, C.tealL).replace(/x1="(\d+)"/g, 'x1="$1"');
    // Did it close through? No.
    if (t > T.close) {
      out += pill(1570, 770, 'closed through? NO', C.pink, pop(t, T.close), 26);
      out += stampX(1520, 520, 0, 0);
    }
    if (t > T.still) out += pill(1240, 1035, 'structure: still bearish', C.pink, pop(t, T.still), 30) + A.sparkle(1240, 1000, T.still + 0.3, t, C.pinkL);
    // Coach with a clipboard.
    const clip = `<g transform="rotate(-10)"><rect x="-26" y="-46" width="52" height="66" rx="6" fill="#9B6A45"/><rect x="-20" y="-38" width="40" height="52" rx="3" fill="#fff"/>${[0, 1, 2].map(i => `<rect x="-14" y="${-30 + i * 14}" width="28" height="5" rx="2" fill="${C.purpleL}"/>`).join('')}</g>`;
    out += P(t, { x: 110, y: G, scale: 0.8, look: look('a', { shirt: C.pink }), seed: 9, talk: t > T.still && t < T.still + 2,
      frontArm: { a1: -20, a2: -60 }, hold: clip });
    return out;
  };

  /* ================================================================== *
   * Lesson 15 · Why Price May Revisit an Imbalance
   * ================================================================== */

  // Three possible futures: the cat comes back to its bed quickly, later, or never.
  LIVE['s8-cat-futures'] = (s, t) => {
    const T = s.beats;
    let out = '';
    const beats = [T.p1, T.p2, T.p3], tags = ['quickly?', 'later?', 'never?'], cols = [C.tealD, C.peach, C.pink];
    const paths = [
      [[30, 630], [120, 610], [220, 480], [280, 450], [340, 560], [450, 460]],
      [[30, 630], [120, 610], [220, 480], [270, 450], [310, 470], [350, 445], [390, 470], [450, 560]],
      [[30, 630], [120, 610], [220, 480], [290, 450], [350, 470], [400, 440], [450, 455]],
    ];
    [0, 1, 2].forEach(i => {
      const x0 = 200 + i * 520, k = pop(t, s.start + 0.4 + i * 0.3, 0.6);
      if (k <= 0) return;
      const b = beats[i];
      let g = `<rect x="${x0}" y="420" width="480" height="580" rx="30" fill="#fff" stroke="${t > b ? cols[i] : '#F1E7E1'}" stroke-width="${t > b ? 4 : 3}"/>
        <rect x="${x0}" y="700" width="480" height="300" rx="30" fill="${[C.tealL, C.peachL, C.pinkP][i]}" opacity=".35"/>`;
      const pp = paths[i].map(([x, y]) => [x0 + x, y]);
      g += fvg(x0 + 150, x0 + 460, 535, 585, 1, C.purple);
      const dk = 0.5 + 0.5 * ease(seg(t, b, b + [2.4, 4.8, 3.0][i]));
      g += poly(partial(pp, t > s.start + 1 ? dk : 0.5 * ease(seg(t, s.start + 0.6, s.start + 2))), C.dark, 6);
      // Cat bed = the FVG.
      const bx = x0 + 150, by = 950;
      g += `<ellipse cx="${bx}" cy="${by}" rx="90" ry="26" fill="${C.purple}"/><ellipse cx="${bx}" cy="${by - 8}" rx="74" ry="18" fill="${C.purpleL}"/>${txt(bx, by + 18, 'FVG', 18, '#fff')}`;
      // Cat motion per future.
      let cx = bx, cyy = by - 10, walking = false, flip = false, sleep = false, op = 1;
      const u = t - b;
      if (t > b) {
        if (i === 0) {
          const a = seg(u, 0, 1), c = seg(u, 1.3, 2.3);
          cx = bx + ease(a) * 230 - ease(c) * 230; walking = (a > 0 && a < 1) || (c > 0 && c < 1); flip = u > 1.2 && c < 1;
        } else if (i === 1) {
          const a = seg(u, 0, 1), c = seg(u, 3.8, 4.8);
          cx = bx + ease(a) * 230 - ease(c) * 230; walking = (a > 0 && a < 1) || (c > 0 && c < 1); sleep = u > 1.1 && u < 3.7; flip = u > 3.7 && c < 1;
          const cl = x0 + 400, hand = u > 1.1 && u < 3.7 ? (u - 1.1) * 900 : u >= 3.7 ? 2340 : 0;
          g += `<circle cx="${cl}" cy="770" r="38" fill="#fff" stroke="${C.dark}" stroke-width="5"/><line x1="${cl}" y1="770" x2="${cl + Math.sin(rad(hand)) * 26}" y2="${770 - Math.cos(rad(hand)) * 26}" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/><line x1="${cl}" y1="770" x2="${cl + Math.sin(rad(hand / 12)) * 18}" y2="${770 - Math.cos(rad(hand / 12)) * 18}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>`;
          if (sleep) g += [0, 1].map(j => { const q = ((t * 0.8) + j * 0.5) % 1; return txt(cx + 50 + q * 20, 860 - q * 40, 'z', 24 + j * 6, C.purple, { op: 1 - q }); }).join('');
        } else {
          const a = seg(u, 0, 2.6);
          cx = bx + ease(a) * 330; walking = a > 0 && a < 1; op = 1 - seg(u, 2.2, 2.8);
          g += `<rect x="${x0 + 400}" y="760" width="64" height="190" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>`;
        }
      }
      const bindle = i === 2 && t > b ? `<line x1="0" y1="0" x2="30" y2="-40" stroke="#9B6A45" stroke-width="5"/><circle cx="32" cy="-44" r="14" fill="${C.pink}"/>` : '';
      g += `<g opacity="${op}">${cat(t, { x: cx, y: cyy, s: 0.75, flip, walking, sleep, seed: 3 + i, col: [C.peach, '#C9B9AE', C.peachL][i], hold: bindle })}</g>`;
      if (t > b + [2.3, 4.8, 2.8][i]) g += i < 2 ? check(x0 + 420, 470, pop(t, b + [2.3, 4.8][i]), C.tealD, 0.8) : stampX(x0 + 420, 470, pop(t, b + 2.8), 26);
      out += at(x0 + 240, 710, k, g);
      out += pill(x0 + 240, 420, tags[i], cols[i], pop(t, b), 26);
    });
    if (T.why && t > T.why) out += pill(960, 1045, 'possible, not promised', C.purple, pop(t, T.why), 30);
    return out;
  };

  // A weather forecaster gives the reasons; a heckler overstates it and the gauge buzzes.
  LIVE['s8-forecast-desk'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    // Map screen.
    const mk = pop(t, s.start + 0.3, 0.7);
    let map = `<rect x="560" y="390" width="680" height="470" rx="26" fill="${C.purple}"/><rect x="580" y="410" width="640" height="430" rx="16" fill="#EEEDFE"/>
      <rect x="840" y="860" width="120" height="30" fill="${C.muted}"/>`;
    const pp = [[610, 790], [700, 770], [760, 780], [900, 520], [980, 500], [1060, 520], [1180, 470]];
    map += fvg(800, 1200, 620, 690, 1, C.purple);
    map += poly(partial(pp, ease(seg(t, s.start + 0.6, s.start + 2.4))), C.dark, 7);
    out += at(900, 625, mk, map);
    const icon = (x, y, at0, svg, label, col) => { const k = pop(t, at0, 0.6); return k > 0 ? `<g transform="translate(${x},${y}) scale(${k})">${svg}</g>` + pill(x, y + 64, label, col, k, 22) : ''; };
    out += icon(800, 520, T.r1, `<path d="M8,-44 L-22,4 L-2,4 L-10,44 L22,-6 L2,-6 Z" fill="${C.gold}" stroke="#C98A1F" stroke-width="3" stroke-linejoin="round"/>`, 'fast move', C.peach);
    out += icon(1040, 600, T.r2, `<ellipse cx="-18" cy="0" rx="16" ry="20" fill="#fff" stroke="${C.dark}" stroke-width="4"/><ellipse cx="18" cy="0" rx="16" ry="20" fill="#fff" stroke="${C.dark}" stroke-width="4"/><circle cx="${-14 + Math.sin(t * 2) * 5}" cy="4" r="7" fill="${C.dark}"/><circle cx="${22 + Math.sin(t * 2) * 5}" cy="4" r="7" fill="${C.dark}"/>`, 'watched area', C.tealD);
    out += icon(1110, 750, T.r3, `<g transform="rotate(${Math.sin(t * 2) * 10})"><path d="M-20,-34 L20,-34 L4,0 L20,34 L-20,34 L-4,0 Z" fill="${C.peachL}" stroke="${C.dark}" stroke-width="4" stroke-linejoin="round"/><path d="M-10,24 L10,24 L0,10 Z" fill="${C.peach}"/></g>`, 'missed orders', C.purple);
    // Forecaster.
    const pointer = `<line x1="0" y1="0" x2="120" y2="-50" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/><circle cx="120" cy="-50" r="7" fill="${C.pink}"/>`;
    out += P(t, { x: 380, y: G, scale: 1, look: look('e', { shirt: C.pinkL }), seed: 2, talk: (t > T.r1 && t < T.r3 + 2.5) || (t > T.may && t < T.may + 2),
      frontArm: { a1: -20, a2: -25 + Math.sin(t * 2) * 6 }, hold: pointer, mood: 'happy' });
    if (t > T.may) out += A.bubble(400, 470, 'It MAY revisit.', { size: 32, weight: 900, tail: 'left', sc: clamp(pop(t, T.may)), stroke: C.tealL, color: C.tealD });
    // Gauge.
    const gk = pop(t, s.start + 1, 0.6);
    const ang = t < T.over ? Math.sin(t * 1.5) * 8 : t < T.may ? lerp(0, 62, ease(seg(t, T.over, T.over + 0.5))) + Math.sin(t * 30) * 3 * (t < T.over + 1.2 ? 1 : 0) : lerp(62, -62, ease(seg(t, T.may, T.may + 0.6)));
    out += at(1690, 500, gk * 1.25, `<path d="M1590,520 A100,100 0 0,1 1690,420" fill="none" stroke="${C.teal}" stroke-width="26"/><path d="M1690,420 A100,100 0 0,1 1790,520" fill="none" stroke="${C.pink}" stroke-width="26"/>
      <rect x="1570" y="520" width="240" height="44" rx="12" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      ${txt(1625, 550, 'FAIR', 20, C.tealD)}${txt(1752, 550, 'OVERSTATED', 16, C.pink)}
      <g transform="translate(1690,520) rotate(${ang})"><line x1="0" y1="0" x2="0" y2="-88" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/></g><circle cx="1690" cy="520" r="12" fill="${C.dark}"/>`);
    if (t > T.over && t < T.over + 1.2) out += txt(1690, 372, 'BZZT!', 34, C.pink, { f: 'Playfair Display', op: 0.6 + 0.4 * Math.sin(t * 30) });
    // Heckler.
    const hk = ease(seg(t, T.heck - 0.6, T.heck));
    if (hk > 0) {
      out += P(t, { x: lerp(2050, 1440, hk), y: G, scale: 0.95, look: look('c', { shirt: C.peach }), flip: true, seed: 5, talk: t > T.heck && t < T.heck + 1.8,
        frontArm: t > T.heck ? { a1: -70, a2: -110 } : { a1: 100, a2: 95 }, mood: t > T.over + 0.5 ? 'sad' : undefined, walking: hk < 1 });
      if (t > T.heck && t < T.may) out += A.bubble(1400, 580, 'It WILL fill!', { size: 32, weight: 900, tail: 'right', sc: clamp(pop(t, T.heck)), stroke: C.pinkL, color: C.pink });
    }
    // Robot camera operator.
    out += robot(t, { x: 1800, y: G, s: 0.75, flip: true, arm: -20, hold: `<g transform="rotate(10)"><rect x="-10" y="-30" width="70" height="44" rx="8" fill="${C.dark}"/><rect x="56" y="-22" width="22" height="28" rx="4" fill="${C.purple}"/><circle cx="20" cy="-40" r="12" fill="${C.dark}"/><circle cx="44" cy="-40" r="12" fill="${C.dark}"/></g>` });
    return out;
  };

  /* ================================================================== *
   * Lesson 16 · When FVGs Matter
   * ================================================================== */

  // A sniffer dog checks three gaps on the chart; only one formed in the break, near price now.
  LIVE['s8-sniffer-dog'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    const my = y => 410 + (y - 460) * 0.92;
    out += panel(240, 375, 1440, 405, pop(t, s.start + 0.2, 0.7));
    const pts = [[300, 820], [430, 610], [480, 690], [520, 640], [560, 690], [600, 630], [640, 680], [680, 620], [760, 580], [820, 700], [1000, 460], [1120, 590], [1200, 572]];
    const dk = ease(seg(t, s.start + 0.6, s.start + 3.2));
    pts.forEach(p => { p[1] = my(p[1]); });
    // FVG boxes (drawn behind price).
    const bk = seg(t, T.boxes, T.boxes + 0.6);
    const boxes = [['A', 340, 620, 700, 735, T.a, 'old', C.muted], ['C', 590, 760, 642, 656, T.c, 'messy', C.muted], ['B', 880, 1300, 548, 602, T.b, 'formed in the break, near price', C.tealD]];
    boxes.forEach(([l, x0, x1, y0, y1, a, why, col], i) => {
      const lit = t > a, good = l === 'B' && lit;
      const fade = !good && t > T.auto ? 0.45 : 1;
      out += `<g opacity="${fade}">${fvg(x0, x1, my(y0), my(y1), ease(bk * 2 - i * 0.4), good ? C.teal : C.purple)}</g>`;
      out += pill(x0 - 22, my((y0 + y1) / 2), l, good ? C.tealD : C.purple, pop(t, T.boxes + 0.3 + i * 0.3) * fade, 22);
      if (lit) out += pill(l === 'C' ? 640 : l === 'B' ? 1420 : (x0 + x1) / 2, l === 'B' ? 455 : l === 'C' ? 745 : 745, why, col, pop(t, a + 0.8) * fade, 24);
    });
    out += poly(partial(pts, dk), C.dark, 7);
    if (dk >= 1) {
      out += `<line x1="430" x2="1060" y1="${my(610)}" y2="${my(610)}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="10 10" opacity=".7"/>` + pill(1110, my(640), 'prior high broken', C.pink, pop(t, s.start + 3.2), 22);
      const pulse = 1 + Math.sin(t * 5) * 0.2;
      out += `<circle cx="1200" cy="${my(572)}" r="${14 * pulse}" fill="${C.dark}"/>` + pill(1290, my(700), 'price now', C.dark, pop(t, s.start + 3.6), 22);
    }
    // Dog route: A, C, B.
    const stops = [[s.start, 330], [T.a - 1.2, 330], [T.a, 380], [T.c - 1.2, 380], [T.c, 640], [T.b - 1.4, 640], [T.b, 960]];
    let dx = 330, moving = false;
    for (let i = 0; i < stops.length - 1; i++) {
      const [ta, xa] = stops[i], [tb, xb] = stops[i + 1];
      if (t >= ta && t < tb) { const k = seg(t, ta, tb); dx = lerp(xa, xb, ease(k)); moving = xa !== xb && k < 1; }
    }
    if (t >= T.b) dx = 960;
    const sniff = !moving && ((t > T.a && t < T.a + 1.6) || (t > T.c && t < T.c + 1.6) || (t > T.b && t < T.b + 1.2));
    const happy = t > T.b + 1.2;
    const jump = happy ? Math.abs(Math.sin((t - T.b) * 5)) * 30 * (t < T.b + 3.4 ? 1 : 0) : 0;
    out += dog(t, { x: dx, y: G - jump, s: 0.9, walking: moving, sniff, wag: happy || moving, tongue: happy, collar: C.pink, seed: 4 });
    if (sniff) out += [0, 1, 2].map(i => { const q = ((t * 1.5) + i / 3) % 1; return `<circle cx="${dx + 110 + i * 10}" cy="${G - 60 - q * 50}" r="${5 + q * 6}" fill="none" stroke="${C.muted}" stroke-width="2.5" opacity="${1 - q}"/>`; }).join('');
    if (happy) out += A.sparkle(dx + 90, G - 200, T.b + 1.2, t, C.teal);
    // Handler with a leash.
    const hx = dx - 230;
    out += P(t, { x: hx, y: G, scale: 0.72, look: look('a', { shirt: C.peach }), walking: moving, seed: 2, frontArm: { a1: -10, a2: 20 } });
    out += `<path d="M${hx + 90},${G - 135} Q${(hx + dx) / 2 + 40},${G - 50} ${dx + 45},${G - 66}" fill="none" stroke="${C.pink}" stroke-width="4"/>`;
    if (T.auto && t > T.auto) out += pill(1500, 1040, 'automatic trade? NO', C.pink, pop(t, T.auto + 1.6), 26);
    return out;
  };

  // Three keys open the door: where it formed, ties to structure, where price is now. Inside: context.
  LIVE['s8-three-keys'] = (s, t) => {
    const T = s.beats, G = 980;
    let out = `<rect x="0" y="${G}" width="1920" height="100" fill="#F6EDE6"/>`;
    const dk = pop(t, s.start + 0.3, 0.7);
    const op = ease(seg(t, T.open, T.open + 1.0));
    // Room behind the door: a lantern labelled CONTEXT and a curious cat.
    let inside = `<rect x="790" y="410" width="360" height="${G - 410}" rx="12" fill="#3D3550"/>`;
    if (op > 0) {
      const glow = 0.6 + 0.4 * Math.sin(t * 3);
      inside += `<circle cx="970" cy="650" r="${130 + glow * 20}" fill="#FFF3C4" opacity="${0.35 * op}"/>
        <g transform="translate(970,650)" opacity="${op}"><line x1="0" y1="-120" x2="0" y2="-70" stroke="${C.muted}" stroke-width="5"/><rect x="-44" y="-72" width="88" height="20" rx="8" fill="${C.dark}"/>
        <rect x="-38" y="-52" width="76" height="100" rx="14" fill="#FFF3C4" stroke="${C.gold}" stroke-width="6"/><path d="M0,-30 Q16,0 0,22 Q-16,0 0,-30 Z" fill="${C.peach}"/><rect x="-44" y="48" width="88" height="16" rx="6" fill="${C.dark}"/></g>`;
      inside += cat(t, { x: 1060, y: G, s: 0.8, flip: true, col: C.peachL, seed: 5 });
    }
    out += at(970, 700, dk, inside);
    // Door swings open on the left hinge.
    const dw = 360 * (1 - op * 0.82);
    out += at(970, 700, dk, `<rect x="790" y="410" width="${dw}" height="${G - 410}" rx="12" fill="${C.purple}" stroke="#5E56B8" stroke-width="6"/>
      ${op < 0.5 ? `<rect x="${790 + dw * 0.1}" y="440" width="${dw * 0.8}" height="230" rx="10" fill="#fff" opacity=".12"/><rect x="${790 + dw * 0.1}" y="700" width="${dw * 0.8}" height="230" rx="10" fill="#fff" opacity=".12"/>` : ''}
      <rect x="770" y="395" width="400" height="20" rx="8" fill="#5E56B8"/>`);
    // Locks and keys.
    const ly = [520, 670, 820], labels = ['where it formed', 'ties to structure', 'where price is now'], kc = [C.peach, C.teal, C.pink];
    ly.forEach((y, i) => {
      const a = T.k[i], kk = ease(seg(t, a, a + 0.8)), turn = seg(t, a + 0.8, a + 1.2), opened = t > a + 1.2;
      const fall = seg(t, a + 1.4, a + 2.2);
      if (t < T.open + 0.3 && fall < 1) {
        const lx = 1000, lyy = y + fall * (G - y - 30);
        out += `<g transform="translate(${lx},${lyy}) rotate(${fall * 60})" opacity="${1 - fall}"><path d="M-22,0 L-22,${opened ? -44 : -26} A22,22 0 0,1 22,${opened ? -44 : -26} L22,${opened ? -30 : 0}" fill="none" stroke="${C.muted}" stroke-width="10"/>
          <rect x="-36" y="-6" width="72" height="62" rx="12" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/><circle cx="0" cy="20" r="8" fill="${C.dark}"/></g>`;
      }
      if (kk > 0 && fall < 1) {
        const kx = lerp(560, 1000, kk), kyy = lerp(760, y + 20, kk) - Math.sin(kk * Math.PI) * 100;
        out += `<g transform="translate(${kx},${kyy}) rotate(${turn * 90})" opacity="${1 - fall}"><circle cx="-48" cy="0" r="18" fill="none" stroke="${kc[i]}" stroke-width="9"/><rect x="-32" y="-5" width="44" height="10" rx="4" fill="${kc[i]}"/><rect x="2" y="0" width="8" height="14" fill="${kc[i]}"/></g>`;
      }
      out += pill(1400, y + 20, (i + 1) + ' · ' + labels[i], kc[i] === C.teal ? C.tealD : kc[i] === C.peach ? '#E08E2E' : kc[i], pop(t, a), 26);
      if (opened) out += check(1640, y + 20, pop(t, a + 1.2), C.tealD, 0.7);
    });
    // Locksmith.
    const ring = `<circle cx="0" cy="0" r="20" fill="none" stroke="${C.gold}" stroke-width="6"/>`;
    out += P(t, { x: 520, y: G, scale: 1, look: look('buyer', { shirt: C.purpleL }), seed: 3, talk: T.k.some(a => t > a && t < a + 1.2),
      frontArm: T.k.some(a => t > a - 0.2 && t < a + 0.5) ? { a1: -30, a2: -20 } : { a1: 30, a2: -40 }, hold: ring, mood: 'happy' });
    if (op > 0.6) {
      out += pill(970, 800, 'CONTEXT', C.peach, pop(t, T.open + 0.8), 34) + A.sparkle(970, 650, T.open + 0.8, t);
      out += pill(1450, 960, 'not an automatic trade', C.pink, pop(t, T.open + 2.0), 24);
    }
    return out;
  };

  /* ================================================================== *
   * Lesson 17 · When FVGs Don't Matter
   * ================================================================== */

  // A clear view through a window, until FVG sticky notes cover the glass.
  LIVE['s8-sticky-window'] = (s, t) => {
    const T = s.beats, G = 1000;
    let out = `<rect x="0" y="360" width="1920" height="720" fill="${C.pinkP}" opacity=".6"/><rect x="0" y="${G}" width="1920" height="80" fill="#EADFD8"/>`;
    const wx = 580, wy = 400, ww = 780, wh = 470;
    out += `<rect x="${wx - 20}" y="${wy - 20}" width="${ww + 40}" height="${wh + 40}" rx="16" fill="#fff"/><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#E8F8F6"/>`;
    out += sun(wx + 100, wy + 90, t, 40) + cloud(wx + 520 + Math.sin(t * 0.4) * 30, wy + 90, 0.6);
    const ridge = [[600, 840], [720, 720], [790, 780], [920, 640], [990, 710], [1120, 560], [1190, 620], [1340, 470]];
    out += `<path d="M600,870 ${ridge.map(p => `L${p[0]},${p[1]}`).join(' ')} L1360,470 L1360,870 Z" fill="${C.tealL}" opacity=".7"/>` + poly(partial(ridge, ease(seg(t, T.ridge, T.ridge + 2))), C.tealD, 8);
    [[1, 'HH'], [2, 'HL'], [3, 'HH'], [4, 'HL'], [5, 'HH'], [6, 'HL'], [7, 'HH']].forEach(([i, l], j) => {
      out += pill(ridge[i][0], ridge[i][1] + (l === 'HH' ? -32 : 34), l, l === 'HH' ? C.tealD : C.peach, pop(t, T.ridge + 1 + j * 0.25, 0.4) * (t > T.pile + 6 ? 0.6 : 1), 20);
    });
    // Sticky FVG notes pile onto the glass.
    const notes = [[640, 760, 160, 60], [1000, 520, 220, 70], [800, 600, 200, 90], [1180, 700, 150, 80], [700, 450, 240, 80], [920, 720, 260, 100], [1100, 420, 200, 90], [610, 560, 180, 120], [860, 470, 180, 100], [1150, 580, 190, 110], [780, 790, 280, 70], [960, 610, 200, 90], [620, 820, 150, 40], [1240, 800, 110, 60]];
    let shown = 0;
    notes.forEach(([x, y, w, h], i) => {
      const a = T.pile + Math.pow(i, 0.85) * 0.8;
      const k = pop(t, a, 0.4);
      if (k <= 0) return;
      shown++;
      const xx = Math.min(x, wx + ww - w), yy = Math.min(y, wy + wh - h);
      out += at(xx + w / 2, yy + h / 2, k, `<rect x="${xx}" y="${yy}" width="${w}" height="${h}" rx="6" fill="${[C.purpleL, '#E5E1FA', C.purpleL][i % 3]}" opacity=".92" stroke="${C.purple}" stroke-width="3" stroke-dasharray="10 6"/>${txt(xx + w / 2, yy + h / 2 + 9, 'FVG', Math.min(26, h * 0.5), C.purple)}`);
    });
    out += `<rect x="${wx - 30}" y="${wy + wh + 14}" width="${ww + 60}" height="24" rx="8" fill="#fff" stroke="#EADFD8" stroke-width="3"/>`;
    if (shown) out += at(1560, 470, pop(t, T.pile), `<rect x="1450" y="420" width="220" height="100" rx="20" fill="#fff" stroke="${C.purple}" stroke-width="4"/>${txt(1560, 460, 'FVG boxes', 22, C.muted)}${txt(1560, 504, String(shown), 40, C.purple, { f: 'Playfair Display' })}`);
    // Cat on the sill swats at a note.
    out += cat(t, { x: 1250, y: wy + wh + 16, s: 0.62, flip: true, seed: 2, col: '#C9B9AE' });
    // Viewer.
    const lost = t > T.see;
    out += P(t, { x: 330, y: G, scale: 1.05, look: look('d', { shirt: C.peach }), seed: 5, mood: lost ? 'sad' : undefined,
      frontArm: lost ? { a1: -60, a2: -150 } : { a1: -20, a2: -40 } });
    if (lost) out += questionMarks(330, 600, t, C.purple);
    if (t > T.see) out += pill(960, 1045, 'can you see the structure?', C.pink, pop(t, T.see), 28);
    return out;
  };

  // The trunk is the structure; the gardener prunes old and tiny FVG branches, keeping the latest.
  LIVE['s8-pruning'] = (s, t) => {
    const T = s.beats, G = 980;
    let out = `<rect x="0" y="${G - 20}" width="1920" height="140" fill="${C.tealL}" opacity=".5"/>` + sun(1780, 420, t, 44);
    const trunk = [[600, 975], [760, 760], [840, 840], [1000, 620], [1080, 700], [1240, 500], [1310, 560], [1460, 420]];
    const tk = ease(seg(t, s.start + 0.3, s.start + 2));
    const glow = t > T.keep ? 1 : 0;
    if (glow) out += poly(trunk, C.teal, 44, `opacity="${0.4 + 0.2 * Math.sin(t * 4)}"`);
    out += poly(partial(trunk, tk), '#9B6A45', 24);
    // Branches: [from, to, size, group]
    const br = [
      [[680, 868], [520, 850], [120, 60], 'old'], [[920, 730], [880, 630], [110, 56], 'old'], [[760, 760], [700, 650], [100, 52], 'old'],
      [[800, 800], [870, 860], [50, 24], 'tiny'], [[1040, 660], [1110, 720], [46, 22], 'tiny'], [[1275, 530], [1345, 590], [46, 22], 'tiny'],
      [[1400, 476], [1540, 470], [110, 56], 'keep'],
    ];
    br.forEach(([a, b, [w, h], grp], i) => {
      const grow = pop(t, s.start + 1.2 + i * 0.25, 0.5);
      if (grow <= 0) return;
      const cutAt = grp === 'old' ? T.old + (i) * 0.5 : grp === 'tiny' ? T.tiny + (i - 3) * 0.5 : Infinity;
      const f = isFinite(cutAt) ? seg(t, cutAt, cutAt + 1.1) : 0;
      if (f >= 1) return;
      const dy = f * f * (G - b[1]), rot = f * (i % 2 ? 70 : -70);
      const g = `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#9B6A45" stroke-width="10" stroke-linecap="round"/>
        <rect x="${b[0] - w / 2}" y="${b[1] - h / 2}" width="${w}" height="${h}" rx="6" fill="${grp === 'keep' ? C.teal : C.purpleL}" opacity=".9" stroke="${grp === 'keep' ? C.tealD : C.purple}" stroke-width="3" stroke-dasharray="8 5"/>
        ${w > 60 ? txt(b[0], b[1] + 8, 'FVG', 22, grp === 'keep' ? '#fff' : C.purple) : ''}`;
      out += `<g transform="translate(0,${dy}) rotate(${rot} ${b[0]} ${b[1]})" opacity="${1 - f * 0.6}">${at(a[0], a[1], grow, g)}</g>`;
      if (f > 0 && f < 0.5) out += txt(a[0] + (b[0] - a[0]) * 0.5, a[1] - 30, 'snip!', 30, C.pink, { f: 'Playfair Display' });
    });
    out += pill(560, 560, 'old gaps', C.purple, pop(t, T.old - 0.4) * (1 - seg(t, T.keep, T.keep + 0.5)), 24);
    out += pill(1190, 820, 'tiny gaps', C.purple, pop(t, T.tiny - 0.4) * (1 - seg(t, T.keep, T.keep + 0.5)), 24);
    if (t > T.keep) {
      out += pill(1560, 545, 'latest leg: maybe keep', C.tealD, pop(t, T.keep + 1.2), 24);
      out += pill(440, 900, 'structure first', '#9B6A45', pop(t, T.keep), 28);
    }
    // A bird lands on top of the tree.
    const bl = seg(t, T.keep + 1.6, T.keep + 3);
    if (bl > 0) out += bird(t, { x: lerp(1800, 1462, ease(bl)), y: lerp(380, 418, ease(bl)) - Math.sin(bl * Math.PI) * 60, s: 1.1, flip: true, flying: bl < 1, col: C.pink, seed: 3 });
    // Gardener with shears.
    const shears = `<g transform="rotate(${-30 + (T.old && ((t > T.old && t < T.old + 2) || (t > T.tiny && t < T.tiny + 2)) ? Math.sin(t * 16) * 8 : 0)})"><line x1="0" y1="0" x2="90" y2="-14" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/><line x1="0" y1="0" x2="90" y2="14" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/><rect x="-36" y="-8" width="40" height="16" rx="6" fill="${C.pink}"/></g>`;
    const gx = t < T.tiny - 0.6 ? 330 : lerp(330, 1680, ease(seg(t, T.tiny - 0.6, T.tiny + 0.4)));
    out += P(t, { x: gx, y: G, scale: 1, look: look('c', { shirt: C.teal, pants: C.purple }), seed: 4, flip: gx > 1000,
      walking: t > T.tiny - 0.6 && t < T.tiny + 0.4, frontArm: { a1: -20, a2: -20 }, hold: shears });
    out += `<g transform="translate(${gx},${G - 300}) scale(${gx > 1000 ? -1 : 1},1)"><ellipse cx="0" cy="0" rx="62" ry="12" fill="${C.peach}"/><path d="M-34,0 Q-30,-40 0,-42 Q30,-40 34,0 Z" fill="${C.peach}"/><rect x="-34" y="-10" width="68" height="8" fill="${C.pink}"/></g>`;
    return out;
  };

  /* ================================================================== *
   * Lesson 18 · FVGs in the Dayli ICC Framework
   * ================================================================== */

  // The ICC train pulls in; the inspector checks every car for an FVG step. There isn't one.
  LIVE['s8-icc-train'] = (s, t) => {
    const T = s.beats, R = 830, G = 1045;
    let out = `<rect x="0" y="${R + 20}" width="1920" height="${1080 - R - 20}" fill="#EADFD8"/><rect x="0" y="${R + 20}" width="1920" height="10" fill="${C.muted}" opacity=".4"/>
      <rect x="0" y="${R - 6}" width="1920" height="8" fill="${C.muted}"/>${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 82}" y="${R}" width="44" height="18" fill="#9B6A45" opacity=".5"/>`).join('')}`;
    const ak = ease(seg(t, T.arrive, T.arrive + 3));
    const dx = (1 - ak) * 1900;
    const cars = ['PIL', 'INDICATION', 'CORRECTION', 'CONTINUATION', 'RETEST', 'ENTRY'];
    const cols = [C.purple, C.teal, C.peach, C.pink, C.purpleL, C.tealD];
    const moving = ak > 0 && ak < 1;
    const wheel = (x) => `<g transform="translate(${x},${R - 16}) rotate(${-dx * 2})"><circle r="18" fill="${C.dark}"/><circle r="7" fill="#D9CFC8"/><rect x="-2" y="-16" width="4" height="12" fill="#D9CFC8"/></g>`;
    let train = '';
    // Engine.
    train += `<rect x="150" y="${R - 170}" width="220" height="150" rx="18" fill="${C.dark}"/><rect x="290" y="${R - 230}" width="80" height="80" rx="10" fill="${C.dark}"/>
      <rect x="302" y="${R - 218}" width="56" height="44" rx="6" fill="#FFF3C4"/><rect x="180" y="${R - 220}" width="34" height="60" rx="6" fill="${C.muted}"/>
      <path d="M150,${R - 40} L110,${R - 20} L150,${R - 20} Z" fill="${C.pink}"/><circle cx="170" cy="${R - 120}" r="16" fill="#FFF3C4"/>
      ${wheel(200)}${wheel(260)}${wheel(330)}`;
    cars.forEach((c, i) => {
      const x = 400 + i * 234, lit = t > T.read + i * 0.42;
      const checked = t > T.inspect + (i + 0.6) * (T.walk / 6);
      train += `<rect x="${x}" y="${R - 160}" width="220" height="140" rx="14" fill="${cols[i]}" stroke="${lit ? C.dark : 'none'}" stroke-width="${lit ? 4 : 0}"/>
        <rect x="${x + 14}" y="${R - 146}" width="192" height="64" rx="10" fill="#fff" opacity=".9"/>
        ${txt(x + 110, R - 104, c, c.length > 10 ? 21 : 26, C.dark)}
        ${[0, 1, 2].map(j => `<rect x="${x + 22 + j * 64}" y="${R - 72}" width="48" height="34" rx="6" fill="#fff" opacity=".35"/>`).join('')}
        <rect x="${x - 14}" y="${R - 60}" width="14" height="8" fill="${C.dark}"/>
        ${wheel(x + 50)}${wheel(x + 170)}
        ${checked ? check(x + 200, R - 170, pop(t, T.inspect + (i + 0.6) * (T.walk / 6)), C.tealD, 0.6) : ''}`;
    });
    out += `<g transform="translate(${dx},${moving ? Math.sin(t * 20) * 1.5 : 0})">${train}</g>`;
    // Steam puffs.
    [0, 1, 2, 3].forEach(i => { const q = ((t * 0.6) + i / 4) % 1; out += `<circle cx="${197 + dx - q * 80}" cy="${R - 230 - q * 140}" r="${16 + q * 34}" fill="#fff" opacity="${0.8 * (1 - q)}"/>`; });
    // Inspector walks the platform.
    const wk = seg(t, T.inspect, T.inspect + T.walk);
    const ix = lerp(420, 1760, wk);
    const clip = `<g transform="rotate(-10)"><rect x="-24" y="-44" width="48" height="62" rx="6" fill="#9B6A45"/><rect x="-18" y="-36" width="36" height="48" rx="3" fill="#fff"/></g>`;
    out += P(t, { x: ix, y: G, scale: 0.62, look: look('a', { shirt: C.purpleL }), walking: wk > 0 && wk < 1, seed: 3, flip: t > T.none && Math.floor(t * 1.2) % 2 === 0,
      frontArm: { a1: -20, a2: -60 }, hold: clip });
    if (t > T.none) {
      out += questionMarks(ix, 760 - 30, t, C.pink);
      out += pill(1500, 450, 'FVG car?', C.purple, pop(t, T.none), 28);
      out += pill(1500, 520, 'no FVG step', C.pink, pop(t, T.none + 1.2), 32);
    }
    // Luggage on the platform: the FVG rides as context.
    const lk = pop(t, T.lug, 0.6);
    if (lk > 0) {
      out += at(220, 960, lk, `<rect x="160" y="900" width="130" height="90" rx="14" fill="${C.purple}"/><rect x="200" y="880" width="50" height="24" rx="8" fill="none" stroke="${C.purple}" stroke-width="8"/>
        <rect x="160" y="935" width="130" height="10" fill="#5E56B8"/>${txt(225, 978, 'FVG', 24, '#fff')}`);
      out += pill(330, 860, 'luggage, not a car', C.purple, pop(t, T.lug + 1), 24);
    }
    out += bird(t, { x: 700 + Math.sin(t * 0.7) * 40, y: G + 10, s: 0.9, col: '#C9B9AE', seed: 6, flip: Math.cos(t * 0.7) < 0 });
    return out;
  };

  // A shape sorter: the square FVG block doesn't go into the round Dayli ICC hole. Don't force it.
  LIVE['s8-shape-sorter'] = (s, t) => {
    const T = s.beats, G = 990;
    let out = `<rect x="0" y="${G}" width="1920" height="90" fill="#F6EDE6"/>`;
    // Sorter box.
    const bk = pop(t, s.start + 0.3, 0.7);
    out += at(960, 800, bk, `<rect x="740" y="660" width="440" height="${G - 660}" rx="24" fill="${C.pink}"/><path d="M740,680 L780,620 L1220,620 L1180,680 Z" fill="${C.pinkL}"/>
      <ellipse cx="980" cy="650" rx="74" ry="20" fill="${C.dark}"/>
      <rect x="800" y="760" width="320" height="70" rx="35" fill="#fff"/>${txt(960, 808, 'DAYLI ICC', 34, C.pink, { f: 'Playfair Display' })}
      <circle cx="840" cy="900" r="22" fill="#fff" opacity=".4"/><rect x="1060" y="880" width="40" height="40" fill="#fff" opacity=".4" transform="rotate(20 1080 900)"/>`);
    // The FVG block.
    const shelfX = 1640, shelfY = 520;
    const sh = seg(t, T.shelf, T.shelf + 1.2);
    let fx = 980, fy = 590, rot = 0;
    if (t < T.push) { fx = 690; fy = 640; }
    else if (t < T.shelf) {
      const k = ease(seg(t, T.push, T.push + 0.8));
      fx = lerp(690, 980, k); fy = lerp(640, 590, k) - Math.sin(k * Math.PI) * 60;
      if (t > T.push + 0.8) { fy += Math.abs(Math.sin((t - T.push) * 6)) * 6; rot = Math.sin((t - T.push) * 9) * 6; }
    } else {
      fx = lerp(980, shelfX, ease(sh)); fy = lerp(590, shelfY - 46, ease(sh)) - Math.sin(sh * Math.PI) * 180; rot = sh * 360;
    }
    // Bonks.
    const bonking = t > T.bonk && t < T.stop;
    if (bonking && (t - T.bonk) % 0.6 < 0.15) fy += 8;
    // Shelf of market literacy blocks.
    const shk = pop(t, s.start + 0.8, 0.6);
    out += at(1640, 560, shk, `<rect x="1460" y="${shelfY}" width="380" height="18" rx="6" fill="#9B6A45"/><rect x="1480" y="${shelfY + 18}" width="12" height="40" fill="#9B6A45"/><rect x="1808" y="${shelfY + 18}" width="12" height="40" fill="#9B6A45"/>
      <rect x="1500" y="${shelfY - 70}" width="70" height="70" rx="10" fill="${C.teal}"/>${txt(1535, shelfY - 28, '⚡', 30, '#fff')}
      <rect x="1740" y="${shelfY - 70}" width="70" height="70" rx="10" fill="${C.peach}"/>${txt(1775, shelfY - 26, '≈', 36, '#fff')}`);
    out += pill(1650, shelfY + 90, 'MARKET LITERACY', C.purple, pop(t, s.start + 1.2), 24);
    out += `<g transform="translate(${fx},${fy}) rotate(${rot})"><rect x="-46" y="-46" width="92" height="92" rx="12" fill="${C.purple}" stroke="#5E56B8" stroke-width="5"/>${txt(0, 10, 'FVG', 30, '#fff')}</g>`;
    if (sh >= 1) out += A.sparkle(shelfX, shelfY - 50, T.shelf + 1.2, t, C.purple);
    // Pusher with a toy hammer.
    const hammerUp = bonking ? ((t - T.bonk) % 0.6) / 0.6 : 0;
    const hammer = `<g transform="rotate(${bonking ? -40 + Math.sin(hammerUp * Math.PI * 2) * 50 : -30})"><rect x="-4" y="-70" width="10" height="72" rx="4" fill="#9B6A45"/><rect x="-26" y="-92" width="52" height="30" rx="8" fill="${C.peach}"/></g>`;
    out += P(t, { x: 640, y: G, scale: 1, look: look('e', { shirt: C.teal }), seed: 2, mood: t > T.stop && t < T.shelf ? 'sad' : undefined, talk: t > T.push && t < T.push + 2,
      frontArm: bonking ? { a1: -40 + Math.sin(hammerUp * Math.PI * 2) * 20, a2: -60 } : t > T.push && t < T.bonk ? { a1: -10, a2: -30 } : { a1: 100, a2: 95 }, hold: bonking ? hammer : '' });
    if (bonking && (t - T.bonk) % 0.6 < 0.3) out += txt(1040, 540, 'BONK!', 40, C.pink, { f: 'Playfair Display' }) + [0, 1, 2].map(i => `<text x="${940 + i * 40}" y="${560 - i * 14}" font-size="30" fill="${C.gold}">★</text>`).join('');
    // Friend: don't force it.
    out += P(t, { x: 1340, y: G, scale: 1, look: A.LOOKS.seller, flip: true, seed: 7, talk: t > T.stop && t < T.stop + 1.4,
      frontArm: t > T.stop ? { a1: -100, a2: -110 } : { a1: 100, a2: 95 } });
    if (t > T.stop && t < T.shelf + 1) out += A.bubble(1250, 500, 'Don’t force it!', { size: 34, weight: 900, tail: 'right', sc: clamp(pop(t, T.stop)), stroke: C.pinkL, color: C.pink });
    // Next section sign.
    if (T.next && t > T.next) {
      const nk = pop(t, T.next, 0.7);
      out += at(260, 900, nk, `<rect x="250" y="700" width="16" height="${G - 700}" fill="#9B6A45"/><path d="M110,600 L380,600 L420,650 L380,700 L110,700 Z" fill="${C.purple}"/>${txt(255, 640, 'NEXT', 24, '#fff', { ls: 4 })}${txt(255, 682, 'Section 9', 30, '#fff', { f: 'Playfair Display' })}`);
      out += pill(960, 1040, 'Next: Section 9 · Understanding Market Participation', C.purple, pop(t, T.next + 0.6), 26);
    }
    return out;
  };


  /* -------- shared text layer for every s8 scene -------- */
  const textLayer = s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;
  Object.keys(LIVE).forEach(k => { BUILD[k] = textLayer; });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
