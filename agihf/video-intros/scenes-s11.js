/**
 * scenes-s11.js: illustrated scene types for Section 11 lesson intro videos
 * (Phase 4 · Section 11: Location Within the Range, Lessons 14 to 21).
 *
 * Every LIVE entry is a pure function of t, drawn on the 1920x1080 stage.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const DK = { teal: '#2F8A7F', pink: '#C2475F', purple: '#5E56B8', peach: '#B86E12' };
  const rad = d => d * Math.PI / 180;

  const pill = (x, y, text, col, k = 1, fs = 28, tc = '#fff') => {
    if (k <= 0) return '';
    const w = [...text].length * fs * 0.62 + 34;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${tc}" font-family="DM Sans">${text}</text></g>`;
  };
  const txt = (x, y, s, size, col, o = {}) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${o.w || 900}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || 'DM Sans'}" ${o.op != null ? `opacity="${o.op}"` : ''}>${s}</text>`;
  const scaleAt = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${inner}</g>`;
  const ground = (y, col = '#F6EDE6') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="#EADFD8"/>`;
  const bub = (x, y, text, k, o = {}) => k <= 0 ? '' : A.bubble(x, y, text, Object.assign({ size: 30, sc: k, weight: 700 }, o));
  const check = (x, y, k, col = C.teal) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="34" fill="${col}"/><path d="M-15,1 L-4,13 L17,-12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, col = C.pink, r = 34) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}"/><path d="M${-r * 0.4},${-r * 0.4} L${r * 0.4},${r * 0.4} M${r * 0.4},${-r * 0.4} L${-r * 0.4},${r * 0.4}" stroke="#fff" stroke-width="${r * 0.24}" stroke-linecap="round"/></g>`;

  function blinkAmt(t, seed) {
    const period = 3.4 + (seed % 4) * 0.6;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }

  // A person that pops in at o.at (scale from the feet).
  function who(t, o) {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    if (k <= 0) return '';
    return scaleAt(o.x, o.y, k, A.person(t, o));
  }

  // Front-arm angles that put the hand at world point (hx, hy), for a person at (x, y).
  function aim(o, hx, hy) {
    const s = o.scale || 1, f = o.flip ? -1 : 1;
    const sx = o.x + 18 * s * f, sy = o.y - 196 * s;
    const lx = (hx - sx) * f / s, ly = (hy - sy) / s;
    const d = Math.max(4, Math.min(Math.hypot(lx, ly), 111)), a = Math.atan2(ly, lx);
    const A1 = Math.acos(clamp((58 * 58 + d * d - 54 * 54) / (2 * 58 * d)));
    const a1 = a - A1, ex = Math.cos(a1) * 58, ey = Math.sin(a1) * 58;
    const tx = Math.cos(a) * d, ty = Math.sin(a) * d;
    return { a1: a1 * 180 / Math.PI, a2: Math.atan2(ty - ey, tx - ex) * 180 / Math.PI };
  }

  /* Small creatures, drawn with (0,0) at the feet. Facing right unless flip. */
  function critter(t, kind, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1;
    const bl = blinkAmt(t, seed);
    const hop = o.hop ? -Math.abs(Math.sin(t * o.hop)) * (o.hopH || 26) : Math.sin(t * 2.4 + seed) * 2.5;
    const eye = (x, y, r = 6) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>${bl < 0.5 ? `<circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>` : ''}`;
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    let g = '';
    if (kind === 'dog') {
      const wag = Math.sin(t * 12 + seed) * 22;
      const fur = o.col || C.peach, ear = o.ear || '#B86E12';
      g = `<path d="M-52,-58 Q-80,${-90 - wag * 0.3} ${-86 + wag * 0.2},${-104 - wag * 0.2}" stroke="${fur}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <rect x="-46" y="-40" width="14" height="40" rx="7" fill="${fur}"/><rect x="-22" y="-40" width="14" height="40" rx="7" fill="${ear}"/>
        <rect x="14" y="-40" width="14" height="40" rx="7" fill="${fur}"/><rect x="34" y="-40" width="14" height="40" rx="7" fill="${ear}"/>
        <ellipse cx="0" cy="-58" rx="62" ry="34" fill="${fur}"/>
        <ellipse cx="-6" cy="-50" rx="30" ry="16" fill="#fff" opacity=".35"/>
        <circle cx="54" cy="-98" r="34" fill="${fur}"/>
        <ellipse cx="84" cy="-88" rx="22" ry="16" fill="#FAE3C8"/><ellipse cx="102" cy="-94" rx="8" ry="6" fill="${C.dark}"/>
        <ellipse cx="34" cy="-104" rx="13" ry="26" transform="rotate(${18 + Math.sin(t * 3 + seed) * 6} 34 -120)" fill="${ear}"/>
        ${eye(62, -108, 6)}
        ${o.happy !== false ? `<path d="M76,-76 Q84,${-62 + talk * 6} 92,-76" fill="${C.pink}"/>` : ''}
        ${o.mouthProp ? `<g transform="translate(98,-78)">${o.mouthProp}</g>` : ''}`;
    } else if (kind === 'cat') {
      const sw = Math.sin(t * 2.2 + seed) * 18;
      const fur = o.col || C.peachL, str = o.str || C.peach;
      g = `<path d="M-30,-14 Q${-80 - sw * 0.5},-20 ${-74 + sw},-84" stroke="${fur}" stroke-width="14" fill="none" stroke-linecap="round"/>
        <ellipse cx="0" cy="-46" rx="40" ry="48" fill="${fur}"/>
        <path d="M-20,-80 L-28,-60 M0,-90 L0,-66 M20,-80 L28,-60" stroke="${str}" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="-16" cy="-4" rx="14" ry="8" fill="${fur}"/><ellipse cx="16" cy="-4" rx="14" ry="8" fill="${fur}"/>
        <circle cx="6" cy="-112" r="34" fill="${fur}"/>
        <path d="M-22,-128 L-26,-160 L-2,-140 Z" fill="${fur}"/><path d="M34,-128 L38,-160 L14,-140 Z" fill="${fur}"/>
        <path d="M-18,-134 L-20,-150 L-8,-140 Z" fill="${C.pinkL}"/><path d="M30,-134 L32,-150 L20,-140 Z" fill="${C.pinkL}"/>
        ${o.sleep ? `<path d="M-10,-114 Q-4,-108 2,-114 M14,-114 Q20,-108 26,-114" stroke="${C.dark}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` : eye(-6, -116, 5) + eye(20, -116, 5)}
        <path d="M4,-102 L10,-102 L7,-98 Z" fill="${C.pink}"/>
        <path d="M-2,-94 Q7,${-88 + talk * 4} 16,-94" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-30,-104 L-48,-108 M-30,-98 L-48,-96 M42,-104 L60,-108 M42,-98 L60,-96" stroke="${C.muted}" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (kind === 'bird' || kind === 'parrot') {
      const flap = o.fly ? Math.sin(t * 22) * 40 : Math.sin(t * 3 + seed) * 6;
      const body = o.col || (kind === 'parrot' ? C.teal : C.purpleL), head = kind === 'parrot' ? C.pink : body;
      const big = kind === 'parrot' ? 1.4 : 1;
      g = `<g transform="scale(${big})">
        ${o.fly ? '' : `<path d="M-6,-6 L-10,0 M6,-6 L10,0" stroke="${C.peach}" stroke-width="4" stroke-linecap="round"/>`}
        ${kind === 'parrot' ? `<path d="M-26,-30 L-58,-6 L-50,-2 L-22,-22 Z" fill="${C.purple}"/><path d="M-26,-26 L-54,4 L-44,6 L-20,-18 Z" fill="${C.pink}"/>` : `<path d="M-24,-30 L-44,-22 L-24,-20 Z" fill="${body}"/>`}
        <ellipse cx="0" cy="-30" rx="28" ry="24" fill="${body}"/>
        <ellipse cx="4" cy="-24" rx="16" ry="12" fill="#fff" opacity=".45"/>
        <circle cx="16" cy="-56" r="18" fill="${head}"/>
        ${eye(22, -60, 4.5)}
        <path d="M32,${-58 - talk * 3} L48,-52 L32,${-48 + talk * 3} Z" fill="${C.gold}"/>
        <path d="M-6,-34 Q-24,${-44 - flap} -34,${-30 - flap * 0.8} Q-18,-22 -6,-26 Z" fill="${kind === 'parrot' ? C.gold : C.purple}"/></g>`;
    } else if (kind === 'rabbit') {
      const fur = '#fff';
      g = `<ellipse cx="-34" cy="-30" rx="14" ry="14" fill="${fur}" stroke="#EADFD8" stroke-width="2"/>
        <ellipse cx="0" cy="-36" rx="38" ry="34" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="24" cy="-6" rx="16" ry="8" fill="${fur}" stroke="#EADFD8" stroke-width="2"/>
        <circle cx="26" cy="-80" r="28" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="14" cy="-128" rx="10" ry="30" transform="rotate(-12 14 -104)" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="14" cy="-128" rx="5" ry="20" transform="rotate(-12 14 -104)" fill="${C.pinkL}"/>
        <ellipse cx="36" cy="-128" rx="10" ry="30" transform="rotate(14 36 -104)" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="36" cy="-128" rx="5" ry="20" transform="rotate(14 36 -104)" fill="${C.pinkL}"/>
        ${eye(36, -84, 5)}<circle cx="52" cy="-74" r="4" fill="${C.pink}"/>
        <ellipse cx="20" cy="-70" rx="7" ry="4" fill="${C.pink}" opacity=".45"/>`;
    } else if (kind === 'duck') {
      const fur = C.peachL;
      g = `<path d="M-8,-4 L-12,0 M8,-4 L12,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>
        <path d="M-46,-40 Q-60,-60 -40,-56 Q-20,-70 20,-56 Q40,-48 34,-24 Q20,-4 -10,-6 Q-40,-8 -46,-40 Z" fill="${fur}"/>
        <path d="M-20,-44 Q-4,-30 14,-40" stroke="${C.peach}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="-76" r="24" fill="${fur}"/>
        ${eye(32, -82, 4.5)}
        <path d="M46,${-76 - talk * 3} Q64,-74 64,-70 Q60,-66 46,${-66 + talk * 3} Z" fill="${C.peach}"/>`;
    } else if (kind === 'owl') {
      g = `<path d="M-8,-4 L-14,0 M8,-4 L14,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="-52" rx="44" ry="52" fill="${C.purple}"/>
        <ellipse cx="0" cy="-40" rx="28" ry="34" fill="${C.purpleL}"/>
        <path d="M-40,-96 L-34,-126 L-16,-100 Z M40,-96 L34,-126 L16,-100 Z" fill="${C.purple}"/>
        <circle cx="-17" cy="-84" r="17" fill="#fff"/><circle cx="17" cy="-84" r="17" fill="#fff"/>
        ${eye(-15, -84, 8)}${eye(19, -84, 8)}
        <path d="M-6,-70 L6,-70 L0,-58 Z" fill="${C.gold}"/>
        <path d="M-44,-60 Q${-60 - Math.sin(t * 2) * 4},-36 -40,-14" stroke="#5E56B8" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M44,-60 Q${60 + Math.sin(t * 2) * 4},-36 40,-14" stroke="#5E56B8" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'squirrel') {
      const sw = Math.sin(t * 3 + seed) * 8;
      g = `<path d="M-20,-20 C-80,-30 -90,-100 ${-50 + sw},-130 C-30,-140 -20,-110 -40,-100 C-60,-80 -40,-50 -14,-40 Z" fill="${C.peach}"/>
        <ellipse cx="4" cy="-40" rx="26" ry="34" fill="#E08E2E"/>
        <ellipse cx="10" cy="-34" rx="14" ry="20" fill="${C.peachL}"/>
        <circle cx="14" cy="-84" r="22" fill="#E08E2E"/>
        <path d="M2,-100 L0,-118 L14,-104 Z" fill="#E08E2E"/>
        ${eye(22, -88, 4.5)}<circle cx="34" cy="-80" r="3.5" fill="${C.dark}"/>
        <path d="M30,-62 L${42 + Math.sin(t * 8) * 4},${-74 + Math.cos(t * 8) * 4}" stroke="#E08E2E" stroke-width="7" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${hop.toFixed(2)})">${g}</g></g>`;
  }
  const crit = (t, kind, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, critter(t, kind, o));
  };

  // Props held in a hand (0,0 = hand).
  const PROP = {
    bag: () => `<g transform="translate(0,10)"><path d="M-14,0 Q0,-26 14,0" stroke="${C.purple}" stroke-width="5" fill="none"/><rect x="-26" y="0" width="52" height="56" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/><circle cx="0" cy="28" r="9" fill="${C.pink}"/></g>`,
    clipboard: () => `<g transform="translate(14,-20) rotate(-8)"><rect x="-30" y="-40" width="60" height="80" rx="8" fill="#9B6A45"/><rect x="-24" y="-30" width="48" height="64" rx="4" fill="#fff"/><rect x="-12" y="-46" width="24" height="12" rx="4" fill="${C.muted}"/>
      <rect x="-16" y="-16" width="32" height="5" rx="2.5" fill="${C.purpleL}"/><rect x="-16" y="-4" width="24" height="5" rx="2.5" fill="${C.purpleL}"/><rect x="-16" y="8" width="28" height="5" rx="2.5" fill="${C.purpleL}"/></g>`,
    gun: () => `<g><rect x="-6" y="-4" width="20" height="40" rx="6" fill="${C.purple}"/><rect x="-16" y="-34" width="86" height="40" rx="14" fill="${C.pink}"/><rect x="56" y="-26" width="22" height="24" rx="4" fill="#fff"/><circle cx="10" cy="-14" r="8" fill="${C.pinkL}"/></g>`,
    hammer: (a = 0) => `<g transform="rotate(${a})"><rect x="-5" y="-70" width="10" height="80" rx="5" fill="#9B6A45"/><rect x="-26" y="-88" width="52" height="24" rx="6" fill="${C.muted}"/></g>`,
    stop: () => `<g><rect x="-5" y="-120" width="10" height="130" rx="5" fill="${C.muted}"/><g transform="translate(0,-150)"><path d="M-22,-52 L22,-52 L52,-22 L52,22 L22,52 L-22,52 L-52,22 L-52,-22 Z" fill="${C.pink}" stroke="#fff" stroke-width="6"/>${txt(0, 10, 'STOP', 26, '#fff')}</g></g>`,
    umbrella: () => `<g transform="rotate(8)"><path d="M0,0 L0,-120" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/><path d="M0,0 Q0,16 12,16" stroke="${C.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M0,-150 L16,-40 Q0,-30 -16,-40 Z" fill="${C.purple}"/><path d="M0,-150 L6,-40 L-6,-40 Z" fill="${C.purpleL}"/></g>`,
    coin: () => `<g><circle cy="-6" r="22" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/>${txt(0, 2, '$', 24, '#fff')}</g>`,
    piece: (col) => `<g transform="translate(0,-30)"><rect x="-34" y="-28" width="68" height="56" rx="10" fill="${col}"/><circle cx="34" cy="0" r="12" fill="${col}"/></g>`,
    pointer: () => `<g transform="rotate(-20)"><rect x="0" y="-4" width="120" height="8" rx="4" fill="${C.dark}"/><circle cx="120" cy="0" r="8" fill="${C.pink}"/></g>`,
  };

  // Standard kicker + swapping headlines.
  const TYPES = ['you-are-here', 'tape-measure', 'fold-ribbon', 'three-lanes', 'two-thermometers', 'label-gun', 'bus-route', 'sale-sign',
    'vending', 'crosswalk', 'climb-wall', 'calc-robot', 'stool', 'late-party', 'thesis-puzzle', 'umbrella-wait'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s11-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const door = (x, y, up, sc = 1) => `<g transform="translate(${x},${y}) scale(${sc})"><rect x="-46" y="${up ? -4 : -116}" width="92" height="120" rx="10" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/><circle cx="26" cy="${up ? 58 : -56}" r="7" fill="${C.purple}"/></g>`;

  const LIVE = {
    /* ---------------- Lesson 14 ---------------- */
    // A mall "you are here" directory shaped like the 4H room. The pin moves bottom, middle, top.
    's11-you-are-here': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Mall decor: plant and bench.
      out += `<g transform="translate(200,1000)"><rect x="-40" y="-70" width="80" height="70" rx="10" fill="${C.pink}"/>
        ${[-40, -10, 20].map((a, i) => `<ellipse cx="${Math.cos(rad(a - 90)) * 50}" cy="${-110 + Math.sin(rad(a - 90)) * 30}" rx="18" ry="46" transform="rotate(${a + Math.sin(t * 1.5 + i) * 4} ${Math.cos(rad(a - 90)) * 50} ${-110 + Math.sin(rad(a - 90)) * 30})" fill="${C.teal}"/>`).join('')}</g>`;
      const bk = pop(t, T.board, 0.8);
      const bx0 = 640, bx1 = 1300, by0 = 380, by1 = 930;
      let board = `<rect x="700" y="${by1 - 10}" width="26" height="${1000 - by1 + 10}" fill="${C.muted}"/><rect x="1214" y="${by1 - 10}" width="26" height="${1000 - by1 + 10}" fill="${C.muted}"/>
        <rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" rx="30" fill="#fff" stroke="${C.purple}" stroke-width="8"/>
        <path d="M${bx0 + 4},${by0 + 70} L${bx0 + 4},${by0 + 30} Q${bx0 + 4},${by0 + 4} ${bx0 + 30},${by0 + 4} L${bx1 - 30},${by0 + 4} Q${bx1 - 4},${by0 + 4} ${bx1 - 4},${by0 + 30} L${bx1 - 4},${by0 + 70} Z" fill="${C.purple}"/>
        ${txt(970, by0 + 50, '4H ROOM · DIRECTORY', 30, '#fff')}
        <rect x="700" y="480" width="540" height="410" rx="16" fill="#FFF6F0" stroke="${C.dark}" stroke-width="6"/>
        <rect x="740" y="760" width="110" height="60" rx="10" fill="${C.pinkP}"/><rect x="1090" y="620" width="110" height="80" rx="10" fill="#E8F8F6"/><rect x="760" y="560" width="90" height="70" rx="10" fill="#FEF3E4"/>`;
      const dk = pop(t, T.doors, 0.6);
      if (dk > 0) board += scaleAt(1110, 480, dk, door(1110, 480, true, 0.7)) + scaleAt(830, 890, dk, door(830, 890, false, 0.7));
      out += scaleAt(970, 1000, bk, board);
      if (dk > 0) {
        out += `<g opacity="${clamp(dk)}"><path d="M1150,500 L1330,500" stroke="${C.purple}" stroke-width="3" stroke-dasharray="6 6"/><path d="M870,870 L1330,870" stroke="${C.purple}" stroke-width="3" stroke-dasharray="6 6"/></g>`;
        out += pill(1452, 500, 'EXTERNAL HIGH 🚪', C.purple, dk, 22) + pill(1452, 870, 'EXTERNAL LOW 🚪', C.purple, dk, 22);
      }
      // The "you are here" pin.
      const stops = [[T.bot, 900, 845, 'near the bottom door', C.teal], [T.mid, 980, 690, 'the middle', C.muted], [T.top, 960, 595, 'right under the top door', C.pink]];
      let px = 900, py = 845, cur = -1;
      stops.forEach(([at, x, y], i) => {
        if (t < at) return;
        cur = i;
        const k = ease((t - at) / 1.0);
        const prev = i ? stops[i - 1] : [0, 900, 845];
        px = i ? lerp(prev[1], x, k) : x; py = i ? lerp(prev[2], y, k) : y;
      });
      if (cur >= 0) {
        const pk = pop(t, T.bot, 0.6), pulse = ((t * 1.2) % 1);
        out += `<circle cx="${px}" cy="${py}" r="${20 + pulse * 40}" fill="none" stroke="${C.pink}" stroke-width="4" opacity="${1 - pulse}"/>`;
        out += `<g transform="translate(${px},${py}) scale(${pk})"><path d="M0,0 C-10,-20 -30,-34 -30,-58 A30,30 0 0,1 30,-58 C30,-34 10,-20 0,0 Z" fill="${C.pink}" stroke="#fff" stroke-width="4"/><circle cy="-58" r="11" fill="#fff"/></g>`;
        const [at, , , label, col] = stops[cur];
        const lk = pop(t, at + 0.9, 0.5);
        out += `<path d="M610,${py - 30} L${px - 36},${py - 30}" stroke="${col}" stroke-width="3" stroke-dasharray="6 6" opacity="${clamp(lk)}"/>` + pill(420, py - 30, label, col, lk, 24);
        out += txt(px, py + 34, 'YOU ARE HERE', 18, C.pink, { op: clamp(pk) });
      }
      // Shopper and dog.
      const sh = { x: 1700, y: 1000, scale: 0.95, look: A.LOOKS.b, flip: true, seed: 4, talk: ctx.talking && t > T.board + 1, at: T.board + 0.3 };
      if (cur >= 0) Object.assign(sh, { frontArm: { a1: -28 + Math.sin(t * 2) * 3, a2: -36 }, backArm: { a1: 95, a2: 90 } });
      else Object.assign(sh, { hold: PROP.bag() });
      out += who(t, sh);
      out += crit(t, 'dog', { x: 430, y: 1000, scale: 0.75, seed: 3, at: T.board + 0.6, hop: t > T.top + 1 && t < T.top + 3 ? 9 : 0 });
      out += bub(1730, 600, 'Where am I? 🤔', t < T.bot ? pop(t, T.board + 1.2, 0.5) : 0, { size: 28 });
      out += bub(1730, 600, 'Relative to the room!', t > T.ask ? pop(t, T.ask, 0.5) : 0, { size: 26 });
      if (t > T.top + 1.2) out += A.sparkle(px, py - 60, T.top + 1.2, t);
      return out;
    },

    // A carpenter tries three tape-measure spans; only the current external range is the room.
    's11-tape-measure': (s, t) => {
      const T = s.beats;
      const x = 320, y = 450, w = 900, h = 480;
      const X = u => x + u * w, Y = v => y + h - v * h;
      const sw = [[0, 0.6], [0.08, 0.96], [0.3, 0.06], [0.55, 0.78], [0.68, 0.42], [0.78, 0.6], [0.87, 0.46], [0.96, 0.55]];
      let out = `<rect x="260" y="400" width="1020" height="580" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>`;
      // Candidate overlays (under the candles).
      const ext = pop(t, T.ext, 0.7);
      if (ext > 0) {
        out += `<rect x="${X(0.3)}" y="${Y(0.78)}" width="${X(1) - X(0.3)}" height="${Y(0.06) - Y(0.78)}" fill="${C.purpleL}" opacity="${0.35 * clamp(ext)}"/>`;
      }
      out += A.swingChart(t, { x, y, w, h, swings: sw, t0: s.start + 0.4, t1: s.start + 3, seed: 141, per: 46, maxBody: 13, wick: 3, fade: ext > 0 ? 0.8 : 1 });
      const lineAt = (v, col, k, u0 = 0) => `<line x1="${X(u0)}" x2="${lerp(X(u0), X(1), ease(k))}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-width="5" stroke-dasharray="14 10"/>`;
      // 1: the highest candle on screen.
      const c1 = seg(t, T.high, T.high + 1), c1x = T.internal;
      if (c1 > 0 && t < c1x + 0.4) {
        const op = 1 - seg(t, c1x, c1x + 0.4);
        out += `<g opacity="${op}">${lineAt(0.96, C.muted, c1)}${pill(X(0.32), Y(0.96) + 2, 'highest candle?', C.muted, pop(t, T.high + 0.4), 24)}${cross(X(0.62), Y(0.96), pop(t, T.high + 3.2))}</g>`;
      }
      // 2: an internal swing.
      const c2 = seg(t, T.internal, T.internal + 1);
      if (c2 > 0 && t < T.ext + 0.4) {
        const op = 1 - seg(t, T.ext, T.ext + 0.4);
        out += `<g opacity="${op}"><rect x="${X(0.66)}" y="${Y(0.6)}" width="${(X(1) - X(0.66)) * ease(c2)}" height="${Y(0.42) - Y(0.6)}" fill="${C.peachL}" opacity=".35" stroke="${C.peach}" stroke-width="4" stroke-dasharray="10 8"/>
          ${pill(X(0.83), Y(0.6) - 34, 'internal swing?', C.peach, pop(t, T.internal + 0.4), 24)}${cross(X(0.83), Y(0.51), pop(t, T.internal + 3.2))}</g>`;
      }
      // 3: the current external range = the room.
      if (ext > 0) {
        out += `<g opacity="${clamp(ext)}"><line x1="${X(0.3)}" x2="${X(1)}" y1="${Y(0.78)}" y2="${Y(0.78)}" stroke="${C.purple}" stroke-width="6"/><line x1="${X(0.3)}" x2="${X(1)}" y1="${Y(0.06)}" y2="${Y(0.06)}" stroke="${C.purple}" stroke-width="6"/></g>`;
        out += scaleAt(X(0.55), Y(0.78), ext, door(X(0.55), Y(0.78), true, 0.5)) + scaleAt(X(0.3) + 40, Y(0.06), ext, door(X(0.3) + 40, Y(0.06), false, 0.5));
        out += pill(X(0.84), Y(0.78) - 30, 'EXTERNAL HIGH', C.purple, pop(t, T.ext + 0.5), 22) + pill(X(0.7), Y(0.06) + 30, 'EXTERNAL LOW', C.purple, pop(t, T.ext + 0.8), 22);
        out += check(X(0.94), Y(0.42), pop(t, T.done, 0.6), C.teal);
        if (t > T.done) out += A.sparkle(X(0.94), Y(0.42), T.done, t);
      }
      // The tape: spans between the candidate levels.
      const span = t < T.internal ? [0.06, 0.96] : t < T.ext ? [0.42, 0.6] : [0.06, 0.78];
      const prev = t < T.internal ? [0.06, 0.06] : t < T.ext ? [0.06, 0.96] : [0.42, 0.6];
      const at = t < T.internal ? T.high : t < T.ext ? T.internal : T.ext;
      const tk = ease(seg(t, at, at + 1.2));
      const lo = lerp(prev[0], span[0], tk), hi = lerp(prev[1], span[1], tk);
      const tp = pop(t, T.high - 0.6, 0.6);
      const tx = 1340, yLo = Y(lo), yHi = Y(hi);
      if (tp > 0) {
        let ticks = '';
        for (let yy = yLo - 20; yy > yHi; yy -= 22) ticks += `<line x1="${tx - 12}" x2="${tx + ((Math.round((yLo - yy) / 22) % 5) ? 2 : 10)}" y1="${yy}" y2="${yy}" stroke="${C.dark}" stroke-width="2.5"/>`;
        out += `<g opacity="${clamp(tp)}"><rect x="${tx - 14}" y="${yHi}" width="28" height="${Math.max(0, yLo - yHi)}" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>${ticks}
          <rect x="${tx - 20}" y="${yHi - 8}" width="40" height="12" rx="3" fill="${C.muted}"/>
          <rect x="${tx - 40}" y="${yLo - 10}" width="80" height="80" rx="18" fill="${C.purple}"/><circle cx="${tx}" cy="${yLo + 30}" r="20" fill="${C.purpleL}"/><circle cx="${tx}" cy="${yLo + 30}" r="7" fill="${C.purple}"/></g>`;
      }
      const cp = { x: 1520, y: 1000, scale: 0.95, look: A.LOOKS.c, flip: true, seed: 6, at: s.start + 0.8 };
      cp.frontArm = aim(cp, tx + 30, Math.min(yLo + 40, 900));
      out += who(t, cp);
      // Hard hat on the carpenter.
      const hk = pop(t, s.start + 0.8, 0.6);
      if (hk > 0) out += scaleAt(1520, 1000, hk, `<g transform="translate(1520,${1000 - 0.95 * 312 + Math.sin(t * 2 + 6) * 2})"><path d="M-44,0 Q-44,-46 0,-48 Q44,-46 44,0 Z" fill="${C.gold}"/><rect x="-54" y="-6" width="108" height="14" rx="7" fill="#C98A1F"/></g>`);
      out += crit(t, 'cat', { x: 400, y: 402, scale: 0.7, seed: 2, at: s.start + 1.2 });
      return out;
    },

    /* ---------------- Lesson 15 ---------------- */
    // Fold the range ribbon in half: the crease is equilibrium. A bird lands on it.
    's11-fold-ribbon': (s, t, ctx) => {
      const T = s.beats;
      const rx = 820, yH = 440, yL = 940, mid = (yH + yL) / 2, rw = 84;
      let out = ground(1000);
      const hk = pop(t, T.hang, 0.8);
      // Ladder.
      let lad = `<line x1="890" y1="1000" x2="902" y2="700" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/><line x1="980" y1="1000" x2="968" y2="700" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>`;
      for (let yy = 960; yy > 710; yy -= 62) lad += `<line x1="${890 + (1000 - yy) * 0.04}" x2="${980 - (1000 - yy) * 0.04}" y1="${yy}" y2="${yy}" stroke="#9B6A45" stroke-width="10"/>`;
      out += scaleAt(935, 1000, pop(t, s.start + 0.4, 0.7), lad);
      // Fold amount: 0 -> 1 -> hold -> 0.
      const fk = t < T.fold + 1.4 ? ease(seg(t, T.fold, T.fold + 1.2)) : 1 - ease(seg(t, T.fold + 2.4, T.fold + 3.6));
      const tint = seg(t, T.halves, T.halves + 0.8);
      const topFill = tint > 0 ? C.pinkL : C.purpleL, botFill = tint > 0 ? C.tealL : C.purpleL;
      if (hk > 0) {
        const half = (y0, y1, fill) => `<rect x="${rx - rw / 2}" y="${y0}" width="${rw}" height="${y1 - y0}" fill="${fill}" stroke="${C.purple}" stroke-width="5"/>
          ${[0.25, 0.5, 0.75].map(f => `<line x1="${rx - rw / 2 + 10}" x2="${rx + rw / 2 - 10}" y1="${lerp(y0, y1, f)}" y2="${lerp(y0, y1, f)}" stroke="#fff" stroke-width="4" opacity=".6"/>`).join('')}`;
        const sy = 1 - 2 * fk;
        out += scaleAt(rx, yH, hk, `${half(yH, mid, topFill)}
          <g transform="translate(0,${mid}) scale(1,${sy.toFixed(3)}) translate(0,${-mid})">${half(mid, yL, fk > 0.5 ? '#E7E4FB' : botFill)}
            <g transform="translate(${rx},${yL})"><path d="M-30,0 L30,0 L40,50 L-40,50 Z" fill="${C.muted}"/></g></g>
          <rect x="${rx - 20}" y="${yH - 30}" width="40" height="34" rx="8" fill="${C.dark}"/>`);
      }
      out += pill(1170, yH, 'HIGH · 20,200', C.purple, pop(t, T.hang + 1.2), 26) + pill(1170, yL - 6, 'LOW · 20,000', C.purple, pop(t, T.hang + 2.2), 26);
      // Crease marker.
      const ck = pop(t, T.fold + 1.4, 0.6);
      if (ck > 0) {
        out += `<line x1="${rx - 70}" x2="${rx + 70}" y1="${mid}" y2="${mid}" stroke="${C.dark}" stroke-width="6" stroke-dasharray="12 8" opacity="${clamp(ck)}"/>`;
        out += pill(1190, mid, 'EQ 50% · 20,100', C.peach, ck, 28) + A.sparkle(rx, mid, T.fold + 1.4, t);
        out += pill(1560, mid - 90, '(high + low) ÷ 2', C.muted, pop(t, T.fold + 2.2), 24);
      }
      // Ladder person holds the top.
      const lp = { x: 935, y: 700, scale: 0.9, look: A.LOOKS.a, flip: true, seed: 2, at: s.start + 0.6 };
      lp.frontArm = aim(lp, rx + 30, yH + 6);
      out += who(t, lp);
      // Second person points at the crease.
      const pp = { x: 1690, y: 1000, scale: 0.95, look: A.LOOKS.c, flip: true, seed: 5, at: s.start + 1.0, talk: ctx.talking };
      if (t > T.fold + 1.6) pp.frontArm = { a1: -24, a2: -34 };
      out += who(t, pp);
      // Bird flies in and perches on the crease.
      if (t > T.bird) {
        const k = ease(seg(t, T.bird, T.bird + 2));
        const bx = lerp(1900, rx - 70, k), by = lerp(380, mid, k) - Math.sin(k * Math.PI) * 120;
        out += critter(t, 'bird', { x: bx, y: by, scale: 0.9, flip: true, fly: k < 1, seed: 4 });
        if (k >= 1) out += bub(rx - 170, mid - 130, 'tweet!', pop(t, T.bird + 2.1, 0.5), { size: 24, tail: 'right' });
      }
      if (tint > 0) {
        out += pill(560, (yH + mid) / 2, 'upper half: premium', C.pink, pop(t, T.halves + 0.2), 26) + pill(560, (mid + yL) / 2, 'lower half: discount', C.teal, pop(t, T.halves + 0.8), 26);
      }
      return out;
    },

    // Three runners cross the same 50% line: through, react, chop. Not a magic line.
    's11-three-lanes': (s, t) => {
      const T = s.beats;
      const lanes = [
        { cx: 480, at: T.a, kind: 'dog', label: 'passes through', col: C.teal, path: u => 470 + u * 390 + Math.sin(u * 14) * 10 },
        { cx: 960, at: T.b, kind: 'rabbit', label: 'reacts', col: C.peach, path: u => u < 0.5 ? 470 + (u / 0.5) * 190 + Math.sin(u * 20) * 8 : 660 - Math.sin((u - 0.5) / 0.5 * Math.PI / 2) * 120 },
        { cx: 1440, at: T.c, kind: 'duck', label: 'chops around', col: C.purple, path: u => lerp(480, 660, clamp(u * 3)) + Math.sin(u * 22) * 46 * clamp(u * 3 - 0.4) },
      ];
      let out = '';
      lanes.forEach((L, i) => {
        const k = pop(t, s.start + 0.5 + i * 0.3, 0.6);
        if (k <= 0) return;
        const x0 = L.cx - 200, x1 = L.cx + 200;
        let g = `<rect x="${x0}" y="410" width="400" height="500" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <line x1="${x0 + 16}" x2="${x1 - 16}" y1="660" y2="660" stroke="${C.gold}" stroke-width="6" stroke-dasharray="16 10"/>
          ${txt(x0 + 40, 650, '50%', 20, '#C98A1F')}
          ${txt(x0 + 30, 450, ['A', 'B', 'C'][i], 30, C.muted, { f: 'Playfair Display' })}`;
        const pk = ease(seg(t, L.at, L.at + 5));
        if (pk > 0) {
          let d = '';
          for (let u = 0; u <= pk + 1e-6; u += 0.01) d += `${d ? 'L' : 'M'}${(x0 + 40 + u * 320).toFixed(1)},${L.path(u).toFixed(1)}`;
          g += `<path d="${d}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>`;
          const ax = x0 + 40 + pk * 320, ay = L.path(pk);
          g += critter(t, L.kind, { x: ax, y: ay + 4, scale: 0.62, flip: i === 1 && pk > 0.5, seed: i + 2, hop: pk < 1 ? (i === 1 ? 7 : 11) : 0, hopH: 14 });
        }
        g += pill(L.cx, 960, L.label, L.col, pop(t, L.at + 4, 0.5), 28);
        out += scaleAt(L.cx, 660, k, g);
      });
      if (t > T.magic) {
        const q = pop(t, T.magic, 0.6);
        // A fizzled wand over the middle lane.
        out += `<g transform="translate(880,820) rotate(${-30 + Math.sin(t * 6) * 4}) scale(${q})"><rect x="-6" y="-70" width="12" height="110" rx="6" fill="${C.dark}"/><rect x="-6" y="-70" width="12" height="20" rx="4" fill="#fff"/>
          ${[0, 1, 2].map(j => { const p = ((t * 0.9) + j / 3) % 1; return `<circle cx="${-10 + j * 12}" cy="${-80 - p * 60}" r="${8 - p * 5}" fill="${C.muted}" opacity="${(1 - p) * 0.6}"/>`; }).join('')}</g>`;
        out += cross(930, 770, pop(t, T.magic + 0.6, 0.5), C.pink, 28);
        out += pill(960, 1030, 'a reference, not a magic line', C.purple, pop(t, T.magic + 1, 0.6), 28);
      }
      return out;
    },

    /* ---------------- Lesson 16 ---------------- */
    // One price, two thermometers: below the 4H middle, above the 1H middle.
    's11-two-thermometers': (s, t, ctx) => {
      const T = s.beats;
      const PY = 720;
      const therm = (x, top, bot, at, name, liquid) => {
        const k = pop(t, at, 0.7);
        if (k <= 0) return '';
        const eq = (top + bot) / 2, bw = 72;
        const fill = ease(seg(t, T.price, T.price + 1.4));
        const ly = lerp(bot, PY, fill);
        const g = `<rect x="${x - bw / 2 - 10}" y="${top - 30}" width="${bw + 20}" height="${bot - top + 60}" rx="${(bw + 20) / 2}" fill="#fff" stroke="${C.muted}" stroke-width="5"/>
          <rect x="${x - bw / 2}" y="${top}" width="${bw}" height="${eq - top}" fill="${C.pinkP}"/>
          <rect x="${x - bw / 2}" y="${eq}" width="${bw}" height="${bot - eq}" fill="#E8F8F6"/>
          <rect x="${x - 14}" y="${ly}" width="28" height="${bot + 30 - ly}" rx="8" fill="${liquid}"/>
          <circle cx="${x}" cy="${bot + 52}" r="46" fill="${liquid}" stroke="${C.muted}" stroke-width="5"/>
          <line x1="${x - bw / 2 - 26}" x2="${x + bw / 2 + 26}" y1="${eq}" y2="${eq}" stroke="${C.dark}" stroke-width="5"/>
          ${txt(x + bw / 2 + 32, eq + 8, '50%', 22, C.dark, { a: 'start' })}
          ${[top, bot].map(yy => `<line x1="${x - bw / 2}" x2="${x + bw / 2}" y1="${yy}" y2="${yy}" stroke="${C.purple}" stroke-width="5"/>`).join('')}
          ${pill(x, top - 62, name, C.purple, 1, 26)}`;
        return scaleAt(x, bot + 52, k, g);
      };
      const read = t > T.read4;
      let out = therm(760, 440, 920, T.t4, '4H RANGE', read ? C.teal : C.purple) + therm(1160, 620, 900, T.t1, '1H RANGE', t > T.read1 ? C.pink : C.purple);
      // The price line across both.
      const pk = seg(t, T.price, T.price + 1);
      if (pk > 0) {
        out += `<line x1="580" x2="${lerp(580, 1340, ease(pk))}" y1="${PY}" y2="${PY}" stroke="${C.dark}" stroke-width="4" stroke-dasharray="10 8"/>
          <circle cx="580" cy="${PY}" r="14" fill="${C.dark}"/>` + pill(580, PY - 44, 'price', C.dark, pop(t, T.price + 0.3), 22);
      }
      const L = { x: 400, y: 1000, scale: 0.95, look: A.LOOKS.e, seed: 3, at: s.start + 0.7, hold: PROP.clipboard(), talk: ctx.talking && t > T.read4 && t < T.read1 };
      if (t > T.read4) Object.assign(L, { frontArm: { a1: -20, a2: -30 }, hold: undefined });
      const R = { x: 1520, y: 1000, scale: 0.95, look: A.LOOKS.buyer, flip: true, seed: 6, at: s.start + 1.0, talk: ctx.talking && t > T.read1 && t < T.both };
      if (t > T.read1) R.frontArm = { a1: -20, a2: -30 };
      out += who(t, L) + who(t, R);
      out += bub(400, 600, '4H discount', pop(t, T.read4, 0.5), { size: 32, color: DK.teal });
      out += bub(1530, 600, '1H premium', pop(t, T.read1, 0.5), { size: 32, color: DK.pink, tail: 'right' });
      const bk = pop(t, T.both, 0.6);
      out += check(500, 520, bk) + check(1640, 520, pop(t, T.both + 0.3, 0.6));
      if (bk > 0) out += pill(1180, 1040, 'both true · different ranges', C.purple, bk, 26) + A.sparkle(960, 700, T.both, t);
      return out;
    },

    // A parrot shouts "premium"; the shopkeeper's label gun prints the full label: which range.
    's11-label-gun': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Back wall shelf + jar.
      const sk = pop(t, T.shelf, 0.7);
      let shelf = `<rect x="540" y="760" width="840" height="26" rx="8" fill="#9B6A45"/><path d="M600,786 L600,840 L640,786 Z M1320,786 L1320,840 L1280,786 Z" fill="#9B6A45"/>
        <rect x="610" y="680" width="90" height="80" rx="14" fill="${C.pinkP}" stroke="${C.pinkL}" stroke-width="4"/><rect x="1220" y="660" width="100" height="100" rx="16" fill="#E8F8F6" stroke="${C.tealL}" stroke-width="4"/>
        <rect x="860" y="520" width="200" height="240" rx="34" fill="#fff" fill-opacity=".75" stroke="${C.tealL}" stroke-width="6"/>
        <rect x="850" y="496" width="220" height="40" rx="12" fill="${C.purple}"/>
        <line x1="960" x2="960" y1="566" y2="736" stroke="${C.teal}" stroke-width="5"/><rect x="934" y="600" width="52" height="96" rx="6" fill="${C.teal}"/>
        <path d="M890,560 Q886,620 892,700" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>`;
      out += scaleAt(960, 786, sk, shelf);
      // Tags flying from the gun to the jar.
      const gun = [1418, 770];
      const tag = (at, tx, ty, text, col, rot, fall) => {
        const k = ease(seg(t, at, at + 0.8));
        if (k <= 0) return '';
        let x = lerp(gun[0], tx, k), y = lerp(gun[1], ty, k) - Math.sin(k * Math.PI) * 120, r = lerp(30, rot, k), op = 1;
        if (fall && t > fall) { const f = ease(seg(t, fall, fall + 1)); y += f * 300; r += f * 70; op = 1 - seg(t, fall + 0.6, fall + 1); }
        const w = [...text].length * 22 * 0.66 + 40;
        return `<g opacity="${op}" transform="translate(${x},${y}) rotate(${r})"><rect x="${-w / 2}" y="-26" width="${w}" height="52" rx="10" fill="#fff" stroke="${col}" stroke-width="5"/>
          <circle cx="${-w / 2 + 16}" cy="0" r="6" fill="${col}"/>${txt(8, 9, text, 24, col === C.teal ? DK.teal : DK.pink)}</g>`;
      };
      out += tag(T.plain, 960, 640, 'PREMIUM', C.pink, -4, T.which + 1.6);
      out += tag(T.tag4, 960, 610, '4H DISCOUNT', C.teal, -5);
      out += tag(T.tag1, 960, 690, '1H PREMIUM', C.pink, 4);
      if (t > T.which && t < T.which + 2.4) {
        const q = pop(t, T.which, 0.5), op = 1 - seg(t, T.which + 1.9, T.which + 2.4);
        out += `<g opacity="${op}">${pill(960, 440, 'premium of WHICH range?', C.purple, q, 30)}</g>`;
      }
      if (t > T.done) out += pill(960, 880, 'always name the range ✓', C.teal, pop(t, T.done, 0.6), 28) + A.sparkle(960, 650, T.done, t);
      // Shopkeeper.
      const sp = { x: 1560, y: 1000, scale: 1, look: A.LOOKS.d, flip: true, seed: 8, at: s.start + 0.6, hold: PROP.gun(), talk: ctx.talking && t > T.which };
      sp.frontArm = { a1: -20 + (t > T.plain - 0.3 && t < T.plain + 0.3 || t > T.tag4 - 0.3 && t < T.tag4 + 0.3 || t > T.tag1 - 0.3 && t < T.tag1 + 0.3 ? -8 : 0), a2: -10 };
      out += who(t, sp);
      // Parrot on a perch.
      const pk = pop(t, s.start + 1, 0.6);
      out += scaleAt(380, 1000, pk, `<rect x="372" y="660" width="16" height="340" rx="8" fill="${C.muted}"/><ellipse cx="380" cy="996" rx="70" ry="12" fill="${C.muted}"/><rect x="300" y="652" width="160" height="16" rx="8" fill="#9B6A45"/>`);
      const squawk = (t > T.parrot && t < T.which) || (t > T.done + 1 && t < T.done + 4);
      out += crit(t, 'parrot', { x: 380, y: 656, scale: 1.1, seed: 2, at: s.start + 1.2, talk: squawk, hop: squawk ? 6 : 0, hopH: 10 });
      out += bub(470, 470, 'PREMIUM! PREMIUM!', t < T.which ? pop(t, T.parrot, 0.5) : 0, { size: 28 });
      out += bub(470, 470, '4H! 1H! 🦜', t > T.done + 1 ? pop(t, T.done + 1, 0.5) : 0, { size: 28 });
      return out;
    },

    /* ---------------- Lesson 17 ---------------- */
    // Same bus, same direction: one passenger boards low, one boards near the terminal. A late runner chases it.
    's11-bus-route': (s, t, ctx) => {
      const T = s.beats;
      const p0 = [220, 930], p1 = [1580, 520];
      const P = u => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
      const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI;
      let out = '';
      const rk = pop(t, T.road, 0.7);
      // Range guides.
      out += `<g opacity="${clamp(rk)}"><line x1="160" x2="1760" y1="490" y2="490" stroke="${C.purple}" stroke-width="4" stroke-dasharray="14 10"/>
        <line x1="160" x2="1760" y1="960" y2="960" stroke="${C.purple}" stroke-width="4" stroke-dasharray="14 10"/>
        <line x1="160" x2="1760" y1="725" y2="725" stroke="${C.gold}" stroke-width="3" stroke-dasharray="8 10" opacity=".7"/>
        ${txt(170, 715, '50%', 20, '#C98A1F', { a: 'start' })}${txt(170, 1000, 'EXTERNAL LOW', 20, DK.purple, { a: 'start' })}</g>`;
      out += scaleAt(900, 725, rk, `<line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="#E9DED6" stroke-width="58" stroke-linecap="round"/>
        <line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="#fff" stroke-width="5" stroke-dasharray="26 22"/>`);
      // Terminal: the objective.
      const tk = pop(t, T.road + 0.6, 0.6);
      out += scaleAt(1680, 520, tk, `<rect x="1610" y="420" width="150" height="100" rx="14" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/><path d="M1600,428 L1685,370 L1770,428 Z" fill="${C.purple}"/>
        <line x1="1685" y1="370" x2="1685" y2="310" stroke="${C.dark}" stroke-width="5"/><path d="M1685,310 Q${1710 + Math.sin(t * 6) * 6},300 1735,316 L1735,340 Q${1710 - Math.sin(t * 6) * 6},328 1685,336 Z" fill="${C.pink}"/>`);
      out += pill(1660, 612, 'OBJECTIVE · EXTERNAL HIGH', C.purple, pop(t, T.road + 1, 0.6), 20);
      // Bus stops.
      const stop = (u, lab, at) => { const [x, y] = P(u); const k = pop(t, at, 0.6); return scaleAt(x, y - 30, k, `<line x1="${x}" y1="${y - 30}" x2="${x}" y2="${y - 150}" stroke="${C.muted}" stroke-width="6"/><circle cx="${x}" cy="${y - 170}" r="26" fill="${C.teal}" stroke="#fff" stroke-width="4"/>${txt(x, y - 161, lab, 26, '#fff')}`); };
      const uA = 0.12, uB = 0.84;
      out += stop(uA, 'A', T.stopA) + stop(uB, 'B', T.stopB);
      // Bus progress: drive, pause at A, drive, pause at B, finish.
      const legs = [[0, uA, 1.2], [uA, uA, 0.8], [uA, uB, 5.2], [uB, uB, 0.8], [uB, 1, 1.2]];
      let u = 0, tt = t - T.go, moving = false;
      if (tt > 0) {
        for (const [a, b, d] of legs) { if (tt <= d) { u = lerp(a, b, ease(tt / d)); moving = a !== b; break; } tt -= d; u = b; }
      }
      const boardA = u >= uA - 0.001 && t > T.go, boardB = u >= uB - 0.001 && t > T.go;
      // Ride-left brackets.
      if (t > T.stopA + 0.4) {
        const k = ease(seg(t, T.stopA + 0.4, T.stopA + 1.6));
        const a = P(uA), b = P(lerp(uA, 1, k));
        out += `<line x1="${a[0]}" y1="${a[1] + 60}" x2="${b[0]}" y2="${b[1] + 60}" stroke="${C.teal}" stroke-width="8" stroke-linecap="round"/>` + pill(860, 870, 'A · lots of room ahead', C.teal, pop(t, T.stopA + 1.4), 24);
      }
      if (t > T.stopB + 0.4) {
        const k = ease(seg(t, T.stopB + 0.4, T.stopB + 1.2));
        const a = P(uB), b = P(lerp(uB, 1, k));
        out += `<line x1="${a[0]}" y1="${a[1] + 60}" x2="${b[0]}" y2="${b[1] + 60}" stroke="${C.peach}" stroke-width="8" stroke-linecap="round"/>` + pill(1440, 690, 'B · near the high', C.peach, pop(t, T.stopB + 1.2), 24);
      }
      // Passengers waiting at the stops.
      const pa = P(uA), pb = P(uB);
      if (!boardA) out += who(t, { x: pa[0] + 50, y: pa[1] - 34, scale: 0.5, look: A.LOOKS.c, seed: 2, at: T.stopA + 0.2, frontArm: t > T.go - 1 ? { a1: -70 + Math.sin(t * 8) * 10, a2: -90 } : undefined });
      if (!boardB) out += who(t, { x: pb[0] + 50, y: pb[1] - 34, scale: 0.5, look: A.LOOKS.d, seed: 5, at: T.stopB + 0.2 });
      // The bus.
      if (t > T.go - 0.6) {
        const [bx, by] = P(u);
        const bk = clamp((t - T.go + 0.6) / 0.6);
        out += `<g opacity="${bk}" transform="translate(${bx},${by - 6}) rotate(${ang})">${A.vehicle('bus', { x: 0, y: 0, dist: u * 3000, t, moving, scale: 0.42 })}
          ${boardA ? `<circle cx="-50" cy="-62" r="12" fill="${A.LOOKS.c.skin}"/>` : ''}${boardB ? `<circle cx="-24" cy="-62" r="12" fill="${A.LOOKS.d.skin}"/>` : ''}</g>`;
        out += pill(bx, by - 150, 'bullish ↑', C.teal, pop(t, T.go + 0.4, 0.5) * (u < 1 ? 1 : 1), 22);
      }
      // A runner chasing the bus near the top.
      if (t > T.chase) {
        const k = seg(t, T.chase, T.chase + 4);
        const [rxp, ryp] = P(lerp(0.66, 0.9, k));
        out += A.person(t, { x: rxp, y: ryp - 34, scale: 0.5, look: A.LOOKS.e, walking: true, seed: 9, frontArm: { a1: -50 + Math.sin(t * 9) * 20, a2: -70 } });
        out += bub(rxp - 20, ryp - 230, 'Wait for me! 🏃', pop(t, T.chase + 0.4, 0.5), { size: 24 });
        out += pill(1150, 960 - 6, 'chasing?', C.pink, pop(t, T.chase + 1.4, 0.5), 24);
      }
      return out;
    },

    // A sale banner tempts the shopper. The owl's compass says: structure creates the idea.
    's11-sale-sign': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const sk = pop(t, T.shop, 0.7);
      const exp = t > T.exp;
      let shop = `<rect x="260" y="470" width="720" height="530" fill="#FFF6F0" stroke="${C.pinkL}" stroke-width="5"/>
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${260 + i * 80},430 L${340 + i * 80},430 L${340 + i * 80},500 Q${300 + i * 80},530 ${260 + i * 80},500 Z" fill="${i % 2 ? '#fff' : C.pink}"/>`).join('')}
        <rect x="320" y="560" width="600" height="300" rx="16" fill="#E8F8F6" stroke="${C.muted}" stroke-width="6"/>
        <rect x="560" y="880" width="120" height="120" rx="8" fill="${C.purpleL}"/>`;
      // Candles on display in the window.
      [[400, 700, 90, 1], [470, 680, 120, 0], [540, 720, 70, 1], [700, 660, 110, 1], [770, 700, 80, 0], [840, 690, 100, 1]].forEach(([x, y, h, up]) => {
        shop += `<line x1="${x}" x2="${x}" y1="${y - h / 2 - 16}" y2="${y + h / 2 + 16}" stroke="${up ? C.tealD : C.pink}" stroke-width="4"/><rect x="${x - 18}" y="${y - h / 2}" width="36" height="${h}" rx="5" fill="${up ? C.teal : C.pink}"/>`;
      });
      out += scaleAt(620, 1000, sk, shop);
      // Swinging price tag.
      const tagK = pop(t, T.cheap, 0.6);
      if (tagK > 0) {
        const sw = Math.sin(t * 2.6) * 6, flip = exp ? clamp((t - T.exp) / 0.4) : 0;
        const col = exp ? C.pink : C.teal, label = exp ? 'EXPENSIVE 💎' : 'CHEAP! 🏷️';
        out += `<g transform="translate(620,560) rotate(${sw}) scale(${tagK})"><line x1="0" y1="0" x2="0" y2="40" stroke="${C.dark}" stroke-width="3"/>
          <g transform="scale(${exp ? Math.abs(1 - 2 * Math.min(1, flip * 2)) || 0.05 : 1},1)"><rect x="-150" y="40" width="300" height="76" rx="18" fill="${col}"/>${txt(0, 92, (exp && flip < 0.5) ? 'CHEAP! 🏷️' : label, 36, '#fff')}</g></g>`;
      }
      // Shopper.
      const sad = (t > T.cheap + 3 && t < T.exp) || (t > T.exp + 3 && t < T.struct + 1);
      const sh = { x: 1160, y: 1000, scale: 1, look: A.LOOKS.a, flip: true, seed: 3, at: s.start + 0.6, talk: ctx.talking && ((t > T.cheap + 0.6 && t < T.cheap + 2.4) || (t > T.exp + 0.6 && t < T.exp + 2.4)), mood: sad ? 'sad' : undefined };
      if ((t > T.cheap + 0.4 && t < T.cheap + 3) || (t > T.exp + 0.4 && t < T.exp + 3)) sh.frontArm = { a1: -40 + Math.sin(t * 8) * 6, a2: -60 };
      out += who(t, sh);
      out += bub(1160, 590, 'Cheap = bullish!', t < T.exp ? pop(t, T.cheap + 0.6, 0.5) : 0, { size: 30 });
      out += bub(1160, 590, 'Expensive = bearish!', t < T.struct ? pop(t, T.exp + 0.6, 0.5) : 0, { size: 30 });
      // "≠" verdicts over the window.
      if (t > T.cheap + 2.6 && t < T.exp + 0.2) out += pill(620, 940, 'cheap ≠ bullish', C.pink, pop(t, T.cheap + 2.6, 0.5), 30);
      if (t > T.exp + 2.6 && t < T.loc) out += pill(620, 940, 'expensive ≠ bearish', C.pink, pop(t, T.exp + 2.6, 0.5), 30);
      // Compass with an owl.
      const ck = pop(t, s.start + 1.2, 0.7);
      const needle = t < T.struct ? Math.sin(t * 3.1) * 140 + Math.sin(t * 7.3) * 40 : lerp(Math.sin(T.struct * 3.1) * 140 + Math.sin(T.struct * 7.3) * 40, 0, ease(seg(t, T.struct, T.struct + 1.2)));
      out += scaleAt(1580, 1000, ck, `<rect x="1572" y="700" width="16" height="300" fill="${C.muted}"/><ellipse cx="1580" cy="998" rx="60" ry="10" fill="${C.muted}"/>
        <circle cx="1580" cy="640" r="96" fill="#fff" stroke="${C.purple}" stroke-width="10"/>
        ${txt(1580, 578, 'N', 22, C.muted)}
        <g transform="translate(1580,640) rotate(${needle})"><path d="M0,-74 L14,0 L-14,0 Z" fill="${C.teal}"/><path d="M0,74 L14,0 L-14,0 Z" fill="${C.pinkL}"/><circle r="9" fill="${C.dark}"/></g>`);
      out += crit(t, 'owl', { x: 1580, y: 548, scale: 0.7, seed: 4, at: s.start + 1.6 });
      out += pill(1580, 780, 'STRUCTURE', C.purple, pop(t, T.struct + 0.8, 0.6), 26);
      if (t > T.struct + 1.2) out += A.sparkle(1580, 570, T.struct + 1.2, t, C.teal);
      if (t > T.loc) out += pill(620, 940, 'location can improve it ✨', C.teal, pop(t, T.loc, 0.6), 30) + A.sparkle(620, 700, T.loc, t);
      return out;
    },

    /* ---------------- Lesson 18 ---------------- */
    // A vending machine with a big BUY? button. Discount alone won't dispense a trade: WAIT.
    's11-vending': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const mk = pop(t, T.machine, 0.8);
      const look = t < T.press ? Math.sin(t * 1.3) * 6 : 10;
      let m = `<rect x="640" y="400" width="460" height="600" rx="34" fill="${C.purple}"/>
        <rect x="660" y="420" width="420" height="60" rx="20" fill="#5E56B8"/>
        <ellipse cx="${830 + look}" cy="450" rx="16" ry="${16 * (1 - blinkAmt(t, 3) * 0.9)}" fill="#fff"/><ellipse cx="${910 + look}" cy="450" rx="16" ry="${16 * (1 - blinkAmt(t, 3) * 0.9)}" fill="#fff"/>
        <circle cx="${834 + look}" cy="452" r="7" fill="${C.dark}"/><circle cx="${914 + look}" cy="452" r="7" fill="${C.dark}"/>
        <rect x="670" y="500" width="260" height="380" rx="16" fill="#EEF7F6" stroke="#fff" stroke-width="6"/>
        <rect x="690" y="900" width="220" height="64" rx="12" fill="#3D3550"/>`;
      // Candle snacks on coils.
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const x = 715 + c * 82, y = 560 + r * 118, up = (r + c) % 3 !== 1;
        m += `<rect x="${x - 30}" y="${y + 46}" width="60" height="8" rx="4" fill="${C.muted}"/><line x1="${x}" x2="${x}" y1="${y - 8}" y2="${y + 50}" stroke="${up ? C.tealD : C.pink}" stroke-width="4"/><rect x="${x - 13}" y="${y + 4}" width="26" height="36" rx="5" fill="${up ? C.teal : C.pink}"/>`;
      }
      // Screen with a mini chart sliding into discount.
      const sx = 950, sy = 510, sw = 130, sh = 120;
      m += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="10" fill="${C.dark}"/>`;
      const showWait = t > T.wait;
      if (!showWait) {
        const k = ease(seg(t, T.slide, T.slide + 3));
        m += `<rect x="${sx + 6}" y="${sy + sh / 2}" width="${sw - 12}" height="${sh / 2 - 6}" fill="${C.teal}" opacity=".3"/><line x1="${sx + 6}" x2="${sx + sw - 6}" y1="${sy + sh / 2}" y2="${sy + sh / 2}" stroke="${C.gold}" stroke-width="2" stroke-dasharray="4 4"/>`;
        let d = '';
        for (let u = 0; u <= k + 1e-6; u += 0.05) d += `${d ? 'L' : 'M'}${sx + 10 + u * (sw - 20)},${sy + 24 + u * 70 + Math.sin(u * 12) * 6}`;
        if (d) m += `<path d="${d}" stroke="#fff" stroke-width="3" fill="none"/>`;
      } else {
        m += txt(sx + sw / 2, sy + 76, 'WAIT', 40, C.gold);
      }
      // Big BUY? button.
      const bk = pop(t, T.button, 0.6), pulse = t > T.button && t < T.wait ? 1 + Math.sin(t * 8) * 0.06 : 1;
      if (bk > 0) m += `<g transform="translate(1015,700) scale(${bk * pulse})"><circle r="62" fill="${showWait ? '#C9B9AE' : C.pink}" stroke="#fff" stroke-width="6"/>${txt(0, 12, 'BUY?', 34, '#fff')}</g>`;
      m += `<rect x="995" y="800" width="40" height="70" rx="8" fill="#3D3550"/><rect x="1011" y="812" width="8" height="46" rx="4" fill="${C.gold}"/>`;
      out += scaleAt(870, 1000, mk, m);
      // Coin toss into the slot.
      const cust = { x: 1340, y: 1000, scale: 1, look: A.LOOKS.buyer, flip: true, seed: 2, at: T.machine + 0.4, talk: ctx.talking && t > T.wait + 0.4, mood: t > T.wait ? 'sad' : undefined };
      if (t < T.press) { cust.hold = PROP.coin(); cust.frontArm = { a1: -30, a2: -60 }; }
      else if (t < T.press + 0.6) cust.frontArm = { a1: -50, a2: -80 };
      out += who(t, cust);
      if (t < T.press && t > T.button + 0.5) out += pill(1340, 600, 'coin: 4H discount', C.teal, pop(t, T.button + 0.5, 0.5), 24);
      if (t > T.press && t < T.press + 1) {
        const k = seg(t, T.press, T.press + 0.9);
        const cx = lerp(1250, 1015, k), cy = lerp(620, 830, k) - Math.sin(k * Math.PI) * 200;
        out += `<g transform="translate(${cx},${cy}) rotate(${k * 540})">${PROP.coin()}</g>`;
      }
      // Status card.
      const ck = pop(t, T.checks, 0.6);
      if (ck > 0) {
        let card = `<rect x="220" y="470" width="360" height="380" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(400, 530, 'STATUS', 30, C.dark, { f: 'Playfair Display' })}`;
        [['Structure', '✓', C.teal], ['Location', '✓', C.teal], ['Execution', '○', C.muted]].forEach(([lab, mk2, col], i) => {
          const rk = pop(t, T.checks + 0.4 + i * 1.1, 0.5);
          if (rk <= 0) return;
          card += `<g opacity="${clamp(rk)}">${txt(260, 600 + i * 76, lab, 30, C.dark, { a: 'start', w: 700 })}<circle cx="530" cy="${590 + i * 76}" r="24" fill="${col}"/>${txt(530, 600 + i * 76, mk2, 28, '#fff')}</g>`;
        });
        card += pill(400, 810, 'WAIT', C.gold, pop(t, T.wait, 0.6), 34);
        out += scaleAt(400, 660, ck, card);
      }
      out += crit(t, 'cat', { x: 720, y: 402, scale: 0.6, seed: 5, at: T.machine + 0.8, sleep: t < T.press });
      out += bub(1360, 580, 'Huh. No snack? 😅', t > T.wait + 0.4 ? pop(t, T.wait + 0.4, 0.5) : 0, { size: 26 });
      return out;
    },

    // Three scenarios at the crosswalk; the light stays red every time.
    's11-crosswalk': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="700" width="1920" height="80" fill="#F6EDE6"/><rect x="0" y="780" width="1920" height="150" fill="#E9DED6"/><rect x="0" y="930" width="1920" height="150" fill="#F6EDE6"/>
        <rect x="0" y="930" width="1920" height="6" fill="#DCCFC6"/><rect x="0" y="776" width="1920" height="6" fill="#DCCFC6"/>`;
      for (let i = 0; i < 6; i++) out += `<rect x="${900 + i * 46}" y="792" width="28" height="126" rx="4" fill="#fff" opacity=".9"/>`;
      // Passing cars (behind the pedestrians, on the road).
      const carX = ((t - s.start) * 420) % 2600 - 340, car2 = 2260 - ((t - s.start + 3) * 360) % 2600;
      out += A.vehicle('car', { x: carX, y: 900, t, dist: carX, moving: true, scale: 0.6 });
      out += `<g transform="translate(${car2},0) scale(-1,1) translate(${-car2},0)">${A.vehicle('gold', { x: car2, y: 860, t, dist: car2, moving: true, scale: 0.5 })}</g>`;
      // Traffic light.
      const lk = pop(t, s.start + 0.4, 0.7);
      const flash = [T.s1, T.s2, T.s3].some(a => t > a + 1.2 && t < a + 1.8) ? 0.5 + 0.5 * Math.sin(t * 30) : 1;
      out += scaleAt(1240, 1000, lk, `<rect x="1232" y="640" width="16" height="360" fill="${C.muted}"/><rect x="1180" y="400" width="120" height="260" rx="26" fill="${C.dark}"/>
        <circle cx="1240" cy="458" r="34" fill="${C.pink}" opacity="${flash}"/><circle cx="1240" cy="458" r="${46}" fill="${C.pink}" opacity="${0.25 * flash}"/>
        <circle cx="1240" cy="530" r="30" fill="#5a4a40"/><circle cx="1240" cy="600" r="30" fill="#5a4a40"/>`);
      // Scenario board.
      const sc = [
        { at: T.s1, label: '4H discount · still falling', path: u => 0.2 + u * 0.75 + Math.sin(u * 9) * 0.03, zone: 'disc' },
        { at: T.s2, label: '4H premium · no execution', path: u => 0.65 - u * 0.35 + Math.sin(u * 12) * 0.04, zone: 'prem' },
        { at: T.s3, label: 'discount · no clear structure', path: u => 0.7 + Math.sin(u * 16) * 0.12, zone: 'disc' },
      ];
      let cur = -1; sc.forEach((c, i) => { if (t > c.at) cur = i; });
      const bk = pop(t, T.s1 - 0.4, 0.6);
      if (bk > 0) {
        let b = `<rect x="1360" y="410" width="400" height="260" rx="22" fill="#fff" stroke="${C.purple}" stroke-width="5"/>`;
        if (cur >= 0) {
          const c = sc[cur], k = ease(seg(t, c.at, c.at + 1.4));
          const X = u => 1390 + u * 340, Y = v => 440 + v * 200;
          b += `<rect x="1380" y="${c.zone === 'disc' ? 540 : 440}" width="360" height="100" fill="${c.zone === 'disc' ? C.teal : C.pink}" opacity=".18"/><line x1="1380" x2="1740" y1="540" y2="540" stroke="${C.gold}" stroke-width="3" stroke-dasharray="8 6"/>`;
          if (cur !== 2) b += `${txt(1745, 470, cur === 1 ? 'premium' : '', 18, DK.pink, { a: 'end' })}${txt(1745, 630, cur === 0 ? 'discount' : '', 18, DK.teal, { a: 'end' })}`;
          let d = '';
          for (let u = 0; u <= k + 1e-6; u += 0.02) d += `${d ? 'L' : 'M'}${X(u).toFixed(1)},${Y(clamp(c.path(u))).toFixed(1)}`;
          b += `<path d="${d}" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linejoin="round"/>`;
        }
        out += scaleAt(1560, 540, bk, b);
        if (cur >= 0) {
          const c = sc[cur];
          out += pill(1560, 712, c.label, C.purple, pop(t, c.at + 0.3, 0.5), 22);
          out += pill(1560, 380, ['scenario 1', 'scenario 2', 'scenario 3'][cur], C.muted, pop(t, c.at, 0.4), 20);
          out += pill(1240, 700, 'WAIT', C.pink, pop(t, c.at + 1.2, 0.5), 30);
        }
      }
      // Pedestrian with a dog, and a crossing guard.
      const ped = { x: 760, y: 1010, scale: 0.9, look: A.LOOKS.e, seed: 4, at: s.start + 0.8, talk: ctx.talking && t > T.done };
      out += who(t, ped);
      out += crit(t, 'dog', { x: 880, y: 1012, scale: 0.6, seed: 6, at: s.start + 1.1, ear: C.muted, col: C.peachL, hop: t > T.done ? 8 : 0 });
      out += `<path d="M${760 + 18 * 0.9 + 30},${1010 - 110} Q840,950 910,${1012 - 50}" stroke="${C.pink}" stroke-width="3" fill="none"/>`;
      const g = { x: 380, y: 1010, scale: 0.95, look: A.LOOKS.c, seed: 7, at: s.start + 1.0, hold: PROP.stop(), frontArm: { a1: -60, a2: -95 + Math.sin(t * 2) * 4 } };
      out += who(t, g);
      if (t > T.done) out += bub(800, 600, 'Still red. We wait. 🐾', pop(t, T.done, 0.5), { size: 28 });
      return out;
    },

    /* ---------------- Lesson 19 ---------------- */
    // Two climbing walls, one objective flag: 300 points of room vs 20.
    's11-climb-wall': (s, t, ctx) => {
      const T = s.beats;
      const Yp = p => 960 - (p - 20610) / 430 * 500;
      const yObj = Yp(21000), yEq = Yp(20825);
      let out = ground(980);
      const wall = (x0, at, lab) => {
        const k = pop(t, at, 0.7);
        if (k <= 0) return '';
        let g = `<rect x="${x0}" y="460" width="360" height="520" rx="18" fill="#F3E3D7" stroke="#E2CDBF" stroke-width="5"/>`;
        for (let i = 0; i < 16; i++) {
          const hx = x0 + 40 + ((i * 97) % 280), hy = 500 + ((i * 61) % 440);
          g += `<ellipse cx="${hx}" cy="${hy}" rx="13" ry="10" fill="${[C.pink, C.teal, C.purple, C.peach][i % 4]}"/>`;
        }
        g += txt(x0 + 30, 1030, lab, 30, C.muted, { a: 'start', f: 'Playfair Display' });
        return scaleAt(x0 + 180, 980, k, g);
      };
      out += wall(380, s.start + 0.4, 'A') + wall(1180, s.start + 0.7, 'B');
      // Objective line + flags, and equilibrium.
      const ok = pop(t, T.obj, 0.6);
      if (ok > 0) {
        out += `<g opacity="${clamp(ok)}"><line x1="340" x2="1580" y1="${yObj}" y2="${yObj}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 10"/>
          <line x1="340" x2="1580" y1="${yEq}" y2="${yEq}" stroke="${C.gold}" stroke-width="3" stroke-dasharray="8 10"/></g>`;
        [560, 1360].forEach(fx => { out += scaleAt(fx, yObj, ok, `<line x1="${fx}" y1="${yObj}" x2="${fx}" y2="${yObj - 80}" stroke="${C.dark}" stroke-width="5"/><path d="M${fx},${yObj - 80} Q${fx + 26 + Math.sin(t * 6) * 6},${yObj - 88} ${fx + 52},${yObj - 72} L${fx + 52},${yObj - 50} Q${fx + 26 - Math.sin(t * 6) * 6},${yObj - 62} ${fx},${yObj - 56} Z" fill="${C.pink}"/>`); });
        out += pill(960, yObj, 'OBJECTIVE 21,000', C.purple, ok, 24) + txt(1060, yEq - 8, '50%', 20, '#C98A1F');
      }
      // Climbers.
      const climber = (cx, target, at, look, seed) => {
        const k = ease(seg(t, at, at + 2.6));
        if (t < at - 0.4) return '';
        const fy = lerp(990, target + 60, k), moving = k > 0 && k < 1;
        return A.person(t, { x: cx, y: fy, scale: 0.5, look, seed, frontArm: { a1: -100 + (moving ? Math.sin(t * 8) * 18 : 0), a2: -95 }, backArm: { a1: -80 - (moving ? Math.sin(t * 8) * 18 : 0), a2: -85 } }) +
          (k >= 1 ? `<circle cx="${cx + 52}" cy="${target}" r="12" fill="${C.dark}" stroke="#fff" stroke-width="4"/>` : '');
      };
      out += climber(520, Yp(20700), T.climbA, A.LOOKS.b, 2) + climber(1320, Yp(20980), T.climbB, A.LOOKS.a, 5);
      // Measuring arrows.
      const meas = (x, from, at, pts, col) => {
        const k = ease(seg(t, at, at + 1.2));
        if (k <= 0) return '';
        const yTop = lerp(from, yObj, k);
        const n = Math.round(pts * k);
        return `<line x1="${x}" x2="${x}" y1="${from}" y2="${yTop}" stroke="${col}" stroke-width="8" stroke-linecap="round"/><path d="M${x - 14},${yTop + 18} L${x},${yTop} L${x + 14},${yTop + 18}" stroke="${col}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
          pill(x + 110, (from + yTop) / 2, `${n} pts`, col, pop(t, at + 0.2, 0.5), 30);
      };
      out += meas(780, Yp(20700), T.measA, 300, C.teal) + meas(1580, Yp(20980), T.measB, 20, C.peach);
      // Squirrel cheering on top of wall B, plus a sparkle on A.
      out += crit(t, 'squirrel', { x: 1240, y: 462, scale: 0.7, seed: 3, at: s.start + 1.4, hop: t > T.measB + 1.2 ? 8 : 0, hopH: 14 });
      if (t > T.measA + 1.2) out += A.sparkle(780, (Yp(20700) + yObj) / 2, T.measA + 1.2, t, C.teal);
      if (t > T.same) out += pill(960, 1040, 'early enough? 🤔', C.purple, pop(t, T.same, 0.6), 26);
      return out;
    },

    // A calculator robot does the room math. Then refuses to turn it into a trade score.
    's11-calc-robot': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const rk = pop(t, T.robot, 0.8);
      const sway = Math.sin(t * 2) * 4;
      const eqs = [[T.eq1, '21,000 − 20,700', '= 300 pts', C.teal], [T.eq2, '21,000 − 20,980', '= 20 pts', C.peach]];
      let line1 = 'objective − price', line2 = '', lcol = C.tealL;
      eqs.forEach(([at, a, b, col]) => { if (t > at) { const n = Math.round(clamp((t - at) / 1.6) * a.length); line1 = a.slice(0, n); line2 = t > at + 2 ? b : ''; lcol = col; } });
      const scoreMode = t > T.score;
      const typing = eqs.some(([at]) => t > at && t < at + 1.6);
      const bl = blinkAmt(t, 7);
      let r = `<g transform="rotate(${sway * 0.3} 960 1000)">
        <rect x="900" y="900" width="40" height="100" rx="10" fill="${C.muted}"/><rect x="980" y="900" width="40" height="100" rx="10" fill="${C.muted}"/>
        <path d="M770,620 Q${700},${700 + sway * 3} ${690},${780 + sway * 2}" stroke="${C.muted}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="690" cy="${780 + sway * 2}" r="22" fill="${C.purple}"/>
        <path d="M1150,620 Q${1230},${scoreMode ? 560 : 700} ${1240},${scoreMode ? 480 + Math.sin(t * 8) * 16 : 780 - sway * 2}" stroke="${C.muted}" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="1240" cy="${scoreMode ? 480 + Math.sin(t * 8) * 16 : 780 - sway * 2}" r="22" fill="${C.purple}"/>
        <rect x="760" y="500" width="400" height="420" rx="36" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="8"/>
        <rect x="790" y="530" width="340" height="120" rx="14" fill="${C.dark}"/>
        ${txt(1110, 584, line1, line1 === 'objective − price' ? 28 : 34, scoreMode ? C.muted : '#fff', { a: 'end' })}
        ${txt(1110, 632, scoreMode ? '' : line2, 36, lcol, { a: 'end' })}`;
      // Keypad.
      for (let i = 0; i < 12; i++) {
        const kx = 810 + (i % 4) * 80, ky = 680 + Math.floor(i / 4) * 74;
        const lit = typing && Math.floor(t * 9 + i * 3.7) % 7 === 0;
        r += `<rect x="${kx}" y="${ky}" width="62" height="56" rx="12" fill="${lit ? C.gold : '#fff'}" stroke="${C.purple}" stroke-width="3"/>`;
      }
      // Head.
      r += `<rect x="830" y="380" width="260" height="120" rx="30" fill="${C.purple}"/>
        <line x1="960" y1="380" x2="960" y2="340" stroke="${C.purple}" stroke-width="8"/><circle cx="960" cy="332" r="14" fill="${Math.floor(t * 2) % 2 ? C.gold : C.pink}"/>
        ${scoreMode && t < T.ctx + 0.5 ? `<path d="M880,420 L920,456 M920,420 L880,456 M1000,420 L1040,456 M1040,420 L1000,456" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`
          : `<ellipse cx="900" cy="438" rx="22" ry="${22 * (1 - bl * 0.9)}" fill="#fff"/><ellipse cx="1020" cy="438" rx="22" ry="${22 * (1 - bl * 0.9)}" fill="#fff"/><circle cx="906" cy="440" r="10" fill="${C.dark}"/><circle cx="1026" cy="440" r="10" fill="${C.dark}"/>`}
        <rect x="920" y="474" width="80" height="10" rx="5" fill="#fff" opacity=".8"/></g>`;
      out += scaleAt(960, 1000, rk, r);
      // Left: mini range map with the two prices.
      const mk = pop(t, T.robot + 0.8, 0.6);
      if (mk > 0) {
        const Y = p => 920 - (p - 20610) / 430 * 440;
        let m = `<rect x="250" y="440" width="300" height="520" rx="24" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
          <line x1="300" x2="500" y1="${Y(21000)}" y2="${Y(21000)}" stroke="${C.purple}" stroke-width="5"/>${txt(400, Y(21000) - 14, 'objective', 22, DK.purple)}`;
        if (t > T.eq1) m += `<circle cx="350" cy="${Y(20700)}" r="13" fill="${C.teal}"/><line x1="350" x2="350" y1="${Y(20700) - 18}" y2="${lerp(Y(20700) - 18, Y(21000) + 6, ease(seg(t, T.eq1 + 1.6, T.eq1 + 2.4)))}" stroke="${C.teal}" stroke-width="6"/>${txt(350, Y(20700) + 44, 'A', 26, DK.teal)}`;
        if (t > T.eq2) m += `<circle cx="450" cy="${Y(20980)}" r="13" fill="${C.peach}"/>${txt(450, Y(20980) + 44, 'B', 26, DK.peach)}`;
        out += scaleAt(400, 700, mk, m);
      }
      // Helper with a pointer.
      const hp = { x: 1480, y: 1000, scale: 0.95, look: A.LOOKS.e, flip: true, seed: 3, at: T.robot + 0.5, talk: ctx.talking, hold: PROP.pointer(), frontArm: { a1: -30, a2: -40 } };
      out += who(t, hp);
      out += crit(t, 'dog', { x: 1700, y: 1000, scale: 0.55, flip: true, seed: 8, at: T.robot + 1, col: C.purpleL, ear: C.purple });
      if (scoreMode) {
        const q = pop(t, T.score, 0.6);
        out += scaleAt(1420, 470, q, `<g transform="rotate(-6 1420 470)"><rect x="1290" y="420" width="260" height="100" rx="18" fill="#fff" stroke="${C.gold}" stroke-width="6"/>${txt(1420, 462, 'TRADE SCORE', 22, C.muted)}${txt(1420, 504, '9/10 ⭐', 34, C.dark)}</g>`);
        out += `<g opacity="${clamp((t - T.score - 1) / 0.3)}"><line x1="1290" y1="420" x2="1550" y2="520" stroke="${C.pink}" stroke-width="10" stroke-linecap="round"/><line x1="1550" y1="420" x2="1290" y2="520" stroke="${C.pink}" stroke-width="10" stroke-linecap="round"/></g>`;
      }
      if (t > T.ctx) out += pill(960, 1040, 'room = context ✓', C.purple, pop(t, T.ctx, 0.6), 26);
      return out;
    },

    /* ---------------- Lesson 20 ---------------- */
    // A three-legged stool: structure, direction, location. All three, then it holds a cat.
    's11-stool': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const legs = [[T.leg1, 800, '1 · STRUCTURE', C.purple, 660, 860], [T.leg2, 960, '2 · DIRECTION', C.teal, 960, 1040], [T.leg3, 1120, '3 · LOCATION', C.pink, 1270, 860]];
      const n = legs.filter(l => t > l[0] + 0.6).length;
      const wob = n < 3 ? Math.sin(t * 4) * (3 - n) * 2.4 : 0;
      const sk = pop(t, T.seat, 0.7);
      let st = '';
      legs.forEach(([at, lx, , col], i) => {
        const k = ease(seg(t, at, at + 0.6));
        if (k <= 0) return;
        const drop = (1 - k) * 260;
        st += `<path d="M${lerp(960, lx, 0.85)},${670 - drop} L${lx},${1000 - drop}" stroke="${col}" stroke-width="30" stroke-linecap="round" opacity="${k}"/>`;
      });
      st += `<ellipse cx="960" cy="666" rx="230" ry="34" fill="#C98A5A"/><ellipse cx="960" cy="650" rx="230" ry="44" fill="${C.peach}"/><ellipse cx="930" cy="640" rx="140" ry="16" fill="#fff" opacity=".25"/>`;
      out += scaleAt(960, 1000, sk, `<g transform="rotate(${wob} 960 1000)">${st}</g>`);
      legs.forEach(([at, , lab, col, px, py]) => { out += pill(px, py, lab, col, pop(t, at + 0.4, 0.5), 26); });
      // Builder with a hammer.
      const hit = legs.some(([at]) => t > at - 0.6 && t < at + 0.4);
      const bd = { x: 380, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 2, at: s.start + 0.6, hold: PROP.hammer(hit ? Math.sin(t * 16) * 40 : 0), frontArm: { a1: hit ? -60 + Math.sin(t * 16) * 25 : -30, a2: -70 }, talk: ctx.talking };
      out += who(t, bd);
      // Cat jumps onto the stool once it holds.
      if (t > T.cat - 1) {
        const k = ease(seg(t, T.cat, T.cat + 1));
        const cx = lerp(1560, 980, k), cy = lerp(1000, 640, k) - Math.sin(k * Math.PI) * 180;
        out += critter(t, 'cat', { x: cx, y: cy, scale: 0.75, flip: k < 1, seed: 3, sleep: t > T.cat + 3 });
        if (t > T.cat + 3) out += [0, 1].map(j => { const p = ((t * 0.7) + j * 0.5) % 1; return txt(1040 + p * 30, 470 - p * 50, 'z', 26 + j * 6, C.purple, { op: 1 - p }); }).join('');
      }
      if (t > T.coherent) out += pill(1500, 470, 'coherent thesis ✓', C.teal, pop(t, T.coherent, 0.6), 28) + A.sparkle(960, 560, T.coherent, t);
      if (t > T.coherent + 2.2) out += pill(1500, 550, 'still not a buy', C.pink, pop(t, T.coherent + 2.2, 0.6), 26);
      return out;
    },

    // Same bullish party, two arrival times: early in discount, late in premium.
    's11-late-party': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const room = (x0, at, late) => {
        const k = pop(t, at, 0.7);
        if (k <= 0) return '';
        const w = 680, top = 420, bot = 980;
        let g = `<rect x="${x0}" y="${top}" width="${w}" height="${bot - top}" rx="30" fill="${late ? '#F6F1EE' : '#FEF3E4'}" stroke="${late ? '#E2D6CE' : C.peachL}" stroke-width="5"/>
          <rect x="${x0 + 20}" y="${bot - 70}" width="${w - 40}" height="50" rx="10" fill="${late ? '#EADFD8' : '#F7E4CF'}"/>`;
        // Garland.
        g += `<path d="M${x0 + 30},${top + 40} Q${x0 + w / 2},${top + 110} ${x0 + w - 30},${top + 40}" stroke="${C.muted}" stroke-width="3" fill="none"/>`;
        for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, gx = lerp(x0 + 30, x0 + w - 30, u), gy = top + 40 + 4 * u * (1 - u) * 70; g += `<path d="M${gx - 16},${gy} L${gx + 16},${gy} L${gx},${gy + (late && i % 2 ? 18 : 34)} Z" fill="${[C.pink, C.teal, C.peach, C.purple][i % 4]}" ${late && i % 3 === 1 ? 'opacity=".35"' : ''}/>`; }
        // Balloons.
        const cols = [C.pink, C.teal, C.peach, C.purple, C.pinkL];
        for (let i = 0; i < 5; i++) {
          const bx = x0 + 90 + i * 120;
          if (!late) { const by = top + 210 + Math.sin(t * 2 + i) * 14; g += `<path d="M${bx},${by + 44} Q${bx + 10},${by + 90} ${bx},${by + 140}" stroke="${C.muted}" stroke-width="2" fill="none"/><ellipse cx="${bx}" cy="${by}" rx="36" ry="44" fill="${cols[i]}"/><ellipse cx="${bx - 12}" cy="${by - 14}" rx="8" ry="12" fill="#fff" opacity=".5"/>`; }
          else if (i % 2 === 0) g += `<ellipse cx="${bx + 20}" cy="${bot - 80}" rx="26" ry="12" fill="${cols[i]}" opacity=".6"/>`;
        }
        // Cake.
        const cx = x0 + w - 150, cy = bot - 70;
        g += `<rect x="${cx - 70}" y="${cy - 12}" width="140" height="12" rx="6" fill="${C.muted}"/>`;
        if (!late) g += `<rect x="${cx - 60}" y="${cy - 100}" width="120" height="88" rx="14" fill="${C.pinkL}"/><rect x="${cx - 60}" y="${cy - 100}" width="120" height="24" rx="12" fill="#fff"/>${[-30, 0, 30].map(d => `<rect x="${cx + d - 4}" y="${cy - 136}" width="8" height="36" rx="3" fill="${C.purpleL}"/><ellipse cx="${cx + d}" cy="${cy - 142 + Math.sin(t * 12 + d) * 2}" rx="6" ry="10" fill="${C.gold}"/>`).join('')}`;
        else g += `<path d="M${cx - 30},${cy - 12} L${cx + 10},${cy - 12} L${cx - 10},${cy - 50} Z" fill="${C.pinkL}"/><circle cx="${cx + 30}" cy="${cy - 18}" r="4" fill="${C.pinkL}"/><circle cx="${cx + 44}" cy="${cy - 16}" r="3" fill="${C.pinkL}"/>`;
        // Confetti (early party only).
        if (!late) for (let i = 0; i < 14; i++) { const p = ((t * 0.25) + i / 14) % 1; g += `<rect x="${x0 + 40 + ((i * 113) % (w - 80)) + Math.sin(t * 3 + i) * 10}" y="${top + 60 + p * (bot - top - 140)}" width="10" height="16" rx="2" transform="rotate(${t * 120 + i * 40} ${x0 + 40 + ((i * 113) % (w - 80))} ${top + 60 + p * 400})" fill="${cols[i % 5]}" opacity="${1 - p * 0.6}"/>`; }
        // Door on the outer side.
        const dx = late ? x0 + w - 70 : x0 + 20;
        g += `<rect x="${dx}" y="${bot - 250}" width="50" height="230" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>`;
        return scaleAt(x0 + w / 2, bot, k, g);
      };
      out += room(220, T.rooms, false) + room(1020, T.rooms + 0.4, true);
      // People.
      const ga = ease(seg(t, T.a, T.a + 2));
      if (t > T.a) out += A.person(t, { x: lerp(260, 470, ga), y: 970, scale: 0.75, look: A.LOOKS.c, seed: 3, walking: ga < 1, frontArm: ga >= 1 ? { a1: -70 + Math.sin(t * 6) * 15, a2: -100 } : undefined });
      out += crit(t, 'dog', { x: 640, y: 972, scale: 0.6, seed: 5, at: T.rooms + 1, hop: 7, hopH: 18 });
      // Sweeper in the late party.
      const sweep = Math.sin(t * 4) * 20;
      out += who(t, { x: 1260, y: 970, scale: 0.75, look: A.LOOKS.d, seed: 8, at: T.rooms + 1.2, frontArm: { a1: 60 + sweep * 0.4, a2: 100 + sweep }, hold: `<g transform="rotate(${-20 + sweep})"><rect x="-4" y="-20" width="8" height="140" rx="4" fill="#9B6A45"/><path d="M-30,120 L30,120 L22,150 L-22,150 Z" fill="${C.peach}"/></g>` });
      const gb = ease(seg(t, T.b, T.b + 2));
      if (t > T.b) out += A.person(t, { x: lerp(1660, 1500, gb), y: 970, scale: 0.75, look: A.LOOKS.e, flip: true, seed: 6, walking: gb < 1, mood: gb >= 1 ? 'sad' : undefined });
      out += bub(1490, 640, 'Did I miss it? 😅', t > T.b + 2 ? pop(t, T.b + 2, 0.5) : 0, { size: 26 });
      out += pill(560, 1030, 'A · discount, room to run', C.teal, pop(t, T.a + 1, 0.6), 24) + pill(1360, 1030, 'B · premium, near the objective', C.pink, pop(t, T.b + 1, 0.6), 24);
      if (t > T.buy) out += pill(960, 396, 'neither one = buy', C.purple, pop(t, T.buy, 0.6), 26);
      return out;
    },

    /* ---------------- Lesson 21 ---------------- */
    // The milestone puzzle: six pieces snap into a complete 4H to 1H thesis. The dog brings the last one.
    's11-thesis-puzzle': (s, t, ctx) => {
      const T = s.beats;
      const bx = 600, by = 440, cw = 240, ch = 200;
      let out = `<rect x="${bx - 20}" y="${by - 20}" width="${cw * 3 + 40}" height="${ch * 2 + 40}" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
      for (let i = 0; i < 6; i++) out += `<rect x="${bx + (i % 3) * cw + 8}" y="${by + Math.floor(i / 3) * ch + 8}" width="${cw - 16}" height="${ch - 16}" rx="16" fill="none" stroke="#EADFD8" stroke-width="3" stroke-dasharray="10 8"/>`;
      const pcs = [['🚪', '4H room', C.purple], ['📍', 'location', C.pink], ['🗺️', '1H map', C.teal], ['🚩', 'objective', C.peach], ['🔀', 'scenarios', C.purple], ['✋', 'invalidation', C.pink]];
      const from = [[260, 380], [300, 1040], [960, 1080], [1700, 380], [1660, 1060], [1500, 900]];
      const done = t > T.done;
      pcs.forEach(([ic, lab, col], i) => {
        const at = T.pieces[i];
        const k = ease(seg(t, at, at + 0.9));
        if (t < at - 0.2) return;
        const tx = bx + (i % 3) * cw + cw / 2, ty = by + Math.floor(i / 3) * ch + ch / 2;
        const x = lerp(from[i][0], tx, k), y = lerp(from[i][1], ty, k) - Math.sin(k * Math.PI) * 60;
        const snap = k >= 1 ? 1 + 0.08 * Math.max(0, 1 - (t - at - 0.9) / 0.3) : 0.8;
        out += `<g transform="translate(${x},${y}) rotate(${(1 - k) * (i % 2 ? 25 : -25)}) scale(${snap})">
          <rect x="${-cw / 2 + 12}" y="${-ch / 2 + 12}" width="${cw - 24}" height="${ch - 24}" rx="18" fill="${col}"/>
          ${i % 3 !== 2 ? `<circle cx="${cw / 2 - 12}" cy="0" r="20" fill="${col}"/>` : ''}${i < 3 ? `<circle cx="0" cy="${ch / 2 - 12}" r="20" fill="${col}"/>` : ''}
          ${txt(0, -8, ic, 56, '#fff')}${txt(0, 52, lab, 28, '#fff')}</g>`;
        if (k >= 1 && t < at + 1.8) out += A.sparkle(tx, ty, at + 0.9, t, col);
      });
      if (done) {
        const q = clamp((t - T.done) / 0.5);
        out += `<rect x="${bx - 20}" y="${by - 20}" width="${cw * 3 + 40}" height="${ch * 2 + 40}" rx="28" fill="none" stroke="${C.gold}" stroke-width="${8 + Math.sin(t * 5) * 3}" opacity="${q}"/>`;
        out += pill(960, by + ch * 2 + 60, 'my 4H → 1H thesis ✓', C.teal, pop(t, T.done, 0.6), 30);
        // Milestone medal.
        const mk = pop(t, T.done + 0.8, 0.7);
        out += scaleAt(1620, 640, mk, `<g transform="translate(1620,640) rotate(${Math.sin(t * 2) * 6})"><path d="M-40,-150 L-10,-60 L10,-60 L40,-150 Z" fill="${C.pink}"/><circle r="84" fill="${C.gold}" stroke="#C98A1F" stroke-width="8"/><circle r="62" fill="#F3C25C"/>${txt(0, 18, '⭐', 54, '#fff')}</g>`);
        out += pill(1620, 780, 'MILESTONE', C.gold, mk, 26);
        if (t > T.done + 0.8) out += A.sparkle(1620, 640, T.done + 0.8, t);
      }
      // Builder at left, dog bringing the last piece.
      const bd = { x: 330, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 2, at: s.start + 0.6, talk: ctx.talking };
      if (done) Object.assign(bd, { frontArm: { a1: -100 + Math.sin(t * 6) * 10, a2: -100 }, backArm: { a1: -80, a2: -80 } });
      else bd.frontArm = { a1: -30, a2: -50 + Math.sin(t * 3) * 10 };
      out += who(t, bd);
      const dk = ease(seg(t, T.dog, T.dog + 2.4));
      if (t > T.dog) {
        const dx = lerp(1960, 1500, dk);
        const carrying = t < T.pieces[5];
        out += critter(t, 'dog', { x: dx, y: 1000, scale: 0.65, flip: true, seed: 4, hop: dk < 1 ? 9 : 0, hopH: 10, happy: !carrying, mouthProp: carrying ? `<rect x="-6" y="-24" width="50" height="40" rx="8" fill="${C.pink}"/>` : '' });
      }
      return out;
    },

    // Forecast is analysis; you don't open the umbrella until it rains. Enter now? No. Next: Phase 5.
    's11-umbrella-wait': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Weather board.
      const bk = pop(t, T.board, 0.7);
      let b = `<rect x="200" y="420" width="600" height="440" rx="28" fill="#fff" stroke="${C.purple}" stroke-width="8"/>
        <rect x="200" y="420" width="600" height="70" rx="28" fill="${C.purple}"/><rect x="200" y="460" width="600" height="30" fill="${C.purple}"/>
        ${txt(500, 470, 'MY THESIS', 32, '#fff', { f: 'Playfair Display' })}
        <rect x="490" y="860" width="20" height="140" fill="${C.muted}"/>`;
      const rows = [['☀️', 'primary: bullish', DK.teal], ['🌧️', 'alternate: IF…', DK.purple], ['⛔', 'invalidation', DK.pink]];
      rows.forEach(([ic, lab, col], i) => {
        const k = pop(t, T.fc + i * 1.2, 0.5);
        if (k <= 0) return;
        b += scaleAt(260, 560 + i * 100, k, `${txt(260, 578 + i * 100, ic, 52, col)}${txt(320, 572 + i * 100, lab, 34, col, { a: 'start', w: 700 })}`);
      });
      out += scaleAt(500, 1000, bk, b);
      // Forecaster pointing at the board.
      const fc = { x: 940, y: 1000, scale: 0.95, look: A.LOOKS.seller, flip: true, seed: 3, at: T.board + 0.3, talk: ctx.talking && t < T.ask, frontArm: { a1: -30 + Math.sin(t * 2) * 4, a2: -40 } };
      out += who(t, fc);
      out += crit(t, 'bird', { x: 740, y: 424, scale: 0.8, seed: 4, at: T.board + 0.8, talk: Math.floor(t * 1.5) % 3 === 0, hop: 4, hopH: 6 });
      // Door, waiting person with a closed umbrella.
      const dk = pop(t, T.door, 0.6);
      out += scaleAt(1380, 1000, dk, `<rect x="1280" y="560" width="200" height="440" rx="14" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="8"/><circle cx="1450" cy="790" r="10" fill="${C.purple}"/><rect x="1240" y="540" width="280" height="30" rx="10" fill="${C.purple}"/>`);
      const wp = { x: 1640, y: 1000, scale: 0.95, look: A.LOOKS.c, flip: true, seed: 6, at: T.door + 0.3, hold: PROP.umbrella(), frontArm: { a1: 80, a2: 95 }, talk: ctx.talking && t > T.ask && t < T.no, mood: t > T.no && t < T.no + 2 ? 'sad' : undefined };
      out += who(t, wp);
      out += bub(1640, 600, 'Enter now?', t < T.no ? pop(t, T.ask, 0.5) : 0, { size: 32 });
      if (t > T.no) {
        const q = pop(t, T.no, 0.6);
        out += scaleAt(1380, 470, q, `<g transform="rotate(${-6 + Math.sin(t * 3) * 2} 1380 470)"><rect x="1240" y="410" width="280" height="110" rx="24" fill="${C.pink}"/>${txt(1380, 488, 'NO 😂', 60, '#fff', { f: 'Playfair Display' })}</g>`);
        out += pill(1380, 1040, 'analysis ✓ · execution ○', C.purple, pop(t, T.no + 1, 0.6), 26);
      }
      // Phase 5 signpost.
      if (t > T.next) {
        const q = pop(t, T.next, 0.7);
        out += scaleAt(500, 1000, q, `<g transform="translate(0,0)"><rect x="200" y="420" width="600" height="440" rx="28" fill="#FEF3E4" stroke="${C.gold}" stroke-width="8"/>
          ${txt(500, 540, 'NEXT UP', 30, C.muted)}${txt(500, 640, 'Phase 5', 84, C.dark, { f: 'Playfair Display' })}${txt(500, 720, 'The Dayli ICC Method', 40, DK.purple, { f: 'Playfair Display', w: 700 })}
          <path d="M440,770 L560,770 L560,750 L600,790 L560,830 L560,810 L440,810 Z" fill="${C.pink}"/></g>`);
        out += A.sparkle(500, 600, T.next + 0.3, t);
      }
      return out;
    },
  };

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
