/**
 * scenes-sd4.js: illustrated scene types for Strategy 2 (Supply & Demand, Powered by Higher-Timeframe ICC™) intro videos,
 * Module 2, Lessons 6 to 10: Executing Bullish Demand, Executing Bearish Supply, Recognizing Invalid Setups,
 * Missed Trades and No-Trade Decisions, Full Strategy Walkthrough.
 *
 * The sequence: 3 breaks, 2 corrections, 1 zone, 1 retest. BOS #1 is a 15M close; BOS #2 and BOS #3 are 5M closes.
 * Correction #2's last opposite-colour candle forms the zone; BOS #3 activates it. Zone boundaries and limit-entry
 * placement are working rules, so no numbers or placements are shown. Invalidation is only ever shown as a 5M
 * candle CLOSING beyond the zone's far edge (invalid under either reading); no wick rule is stated.
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
  const f1 = v => (+v).toFixed(1);

  const pill = (x, y, text, col, k = 1, fs = 28, tc = '#fff') => {
    if (k <= 0) return '';
    const w = [...text].length * fs * 0.62 + 34;
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${tc}" font-family="DM Sans">${text}</text></g>`;
  };
  const txt = (x, y, s, size, col, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" font-weight="${o.w || 900}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || 'DM Sans'}" ${o.op != null ? `opacity="${o.op}"` : ''} ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${s}</text>`;
  const scaleAt = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k}) translate(${f1(-x)},${f1(-y)})">${inner}</g>`;
  const rotAt = (x, y, a, inner) => `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${inner}</g>`;
  const fade = (k, inner) => k <= 0 ? '' : `<g opacity="${clamp(k).toFixed(3)}">${inner}</g>`;
  const ground = (y, col = '#F6EDE6', edge = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="${edge}"/>`;
  const bub = (x, y, text, k, o = {}) => k <= 0 ? '' : A.bubble(x, y, text, Object.assign({ size: 30, sc: k, weight: 700 }, o));
  const check = (x, y, k, col = C.teal, r = 34) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k * r / 34})"><circle r="34" fill="${col}"/><path d="M-15,1 L-4,13 L17,-12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, col = C.pink, r = 34) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) scale(${k})"><circle r="${r}" fill="${col}"/><path d="M${-r * 0.4},${-r * 0.4} L${r * 0.4},${r * 0.4} M${r * 0.4},${-r * 0.4} L${-r * 0.4},${r * 0.4}" stroke="#fff" stroke-width="${r * 0.24}" stroke-linecap="round"/></g>`;
  // A between-beat helper: k for "visible from a until b" with pop in and fade out.
  const between = (t, a, b, d = 0.5) => t < a || t > b + 0.4 ? 0 : t > b ? 1 - seg(t, b, b + 0.4) : pop(t, a, d);
  const cloud = (x, y, s = 1) => `<g transform="translate(${f1(x)},${y}) scale(${s})" opacity=".9"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#fff"/><ellipse cx="-40" cy="8" rx="44" ry="24" fill="#fff"/><ellipse cx="44" cy="6" rx="48" ry="26" fill="#fff"/><ellipse cx="6" cy="-20" rx="42" ry="30" fill="#fff"/></g>`;
  const stamp = (x, y, text, col, k, rot = -10, r = 64, fs = 30) => {
    if (k <= 0) return '';
    const sc = 1 + (1 - clamp(k)) * 0.8;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot}) scale(${sc.toFixed(3)})" opacity="${clamp(k * 1.6).toFixed(2)}"><circle r="${r}" fill="${col}" opacity=".16"/><circle r="${r}" fill="none" stroke="${col}" stroke-width="7"/>${[...text].length > 4 ? '' : `<circle r="${r - 12}" fill="none" stroke="${col}" stroke-width="3" stroke-dasharray="6 6"/>`}${txt(0, fs * 0.36, text, fs, col)}</g>`;
  };

  function blinkAmt(t, seed) {
    const period = 3.4 + (seed % 4) * 0.6;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  // Person's head centre (for hats and glasses), allowing for their idle bob.
  const headAt = (t, o) => {
    const s = o.scale || 1, seed = o.seed || 2;
    const bob = o.walking ? Math.abs(Math.sin(t * 9 + seed)) * -6 : Math.sin(t * 2 + seed) * 2;
    return { x: o.x, y: o.y + (bob - 280) * s, s };
  };
  const HATS = {
    hard: `<path d="M-44,-22 Q-44,-68 0,-70 Q44,-68 44,-22 Z" fill="${C.gold}"/><rect x="-54" y="-28" width="108" height="14" rx="7" fill="#C98A1F"/>`,
    chef: `<rect x="-34" y="-64" width="68" height="40" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/><circle cx="-24" cy="-74" r="22" fill="#fff"/><circle cx="0" cy="-86" r="26" fill="#fff"/><circle cx="24" cy="-74" r="22" fill="#fff"/>`,
    cap: `<path d="M-40,-30 Q-40,-72 0,-72 Q40,-72 40,-30 Z" fill="${C.purple}"/><rect x="-6" y="-38" width="74" height="12" rx="6" fill="${DK.purple}"/><rect x="-14" y="-62" width="28" height="18" rx="4" fill="${C.gold}"/>`,
    beret: `<ellipse cx="0" cy="-38" rx="46" ry="18" fill="${C.pink}"/><circle cx="0" cy="-56" r="6" fill="${C.pink}"/>`,
    wig: `<path d="M-50,-10 Q-56,-60 -30,-70 Q0,-84 30,-70 Q56,-60 50,-10 Q46,40 36,50 Q30,0 -2,-38 Q-30,0 -36,50 Q-46,40 -50,-10 Z" fill="#fff" stroke="#EADFD8" stroke-width="3"/>`,
    shades: `<rect x="-36" y="-12" width="30" height="18" rx="6" fill="${C.dark}"/><rect x="6" y="-12" width="30" height="18" rx="6" fill="${C.dark}"/><rect x="-8" y="-8" width="16" height="4" fill="${C.dark}"/>`,
    goggles: `<circle cx="-15" cy="-2" r="13" fill="#E8F8F6" stroke="${C.muted}" stroke-width="4"/><circle cx="15" cy="-2" r="13" fill="#E8F8F6" stroke="${C.muted}" stroke-width="4"/>`,
  };
  const hat = (t, o, kind) => {
    const h = headAt(t, o), f = o.flip ? -1 : 1;
    return `<g transform="translate(${f1(h.x)},${f1(h.y)}) scale(${h.s * f},${h.s})">${HATS[kind]}</g>`;
  };

  // A person that pops in at o.at (scale from the feet), with optional hat.
  function who(t, o) {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    if (k <= 0) return '';
    return scaleAt(o.x, o.y, k, A.person(t, o) + (o.hat ? [].concat(o.hat).map(h => hat(t, o, h)).join('') : ''));
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
        <ellipse cx="0" cy="-58" rx="62" ry="34" fill="${fur}"/><ellipse cx="-6" cy="-50" rx="30" ry="16" fill="#fff" opacity=".35"/>
        <circle cx="54" cy="-98" r="34" fill="${fur}"/>
        <ellipse cx="84" cy="-88" rx="22" ry="16" fill="#FAE3C8"/><ellipse cx="102" cy="-94" rx="8" ry="6" fill="${C.dark}"/>
        <ellipse cx="34" cy="-104" rx="13" ry="26" transform="rotate(${18 + Math.sin(t * 3 + seed) * 6} 34 -120)" fill="${ear}"/>
        ${eye(62, -108, 6)}
        ${o.tongue ? `<ellipse cx="90" cy="${-66 + Math.sin(t * 8) * 3}" rx="8" ry="14" fill="${C.pink}"/>` : `<path d="M76,-76 Q84,${-62 + talk * 6} 92,-76" fill="${C.pink}"/>`}`;
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
        <ellipse cx="0" cy="-30" rx="28" ry="24" fill="${body}"/><ellipse cx="4" cy="-24" rx="16" ry="12" fill="#fff" opacity=".45"/>
        <circle cx="16" cy="-56" r="18" fill="${head}"/>${eye(22, -60, 4.5)}
        <path d="M32,${-58 - talk * 3} L48,-52 L32,${-48 + talk * 3} Z" fill="${C.gold}"/>
        <path d="M-6,-34 Q-24,${-44 - flap} -34,${-30 - flap * 0.8} Q-18,-22 -6,-26 Z" fill="${kind === 'parrot' ? C.gold : C.purple}"/></g>`;
    } else if (kind === 'owl') {
      g = `<path d="M-8,-4 L-14,0 M8,-4 L14,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="-52" rx="44" ry="52" fill="${o.col || C.purple}"/><ellipse cx="0" cy="-40" rx="28" ry="34" fill="${C.purpleL}"/>
        <path d="M-40,-96 L-34,-126 L-16,-100 Z M40,-96 L34,-126 L16,-100 Z" fill="${o.col || C.purple}"/>
        <circle cx="-17" cy="-84" r="17" fill="#fff"/><circle cx="17" cy="-84" r="17" fill="#fff"/>
        ${eye(-15, -84, 8)}${eye(19, -84, 8)}
        ${o.monocle ? `<circle cx="19" cy="-84" r="20" fill="none" stroke="${C.gold}" stroke-width="4"/><path d="M38,-80 Q46,-50 40,-30" stroke="${C.gold}" stroke-width="2.5" fill="none"/>` : ''}
        <path d="M-6,-70 L6,-70 L0,${-58 + talk * 4} Z" fill="${C.gold}"/>
        <path d="M-44,-60 Q${-60 - Math.sin(t * 2) * 4},-36 -40,-14" stroke="${DK.purple}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M44,-60 Q${60 + Math.sin(t * 2) * 4},-36 40,-14" stroke="${DK.purple}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'duck') {
      const fur = C.peachL;
      g = `<path d="M-46,-40 Q-60,-60 -40,-56 Q-20,-70 20,-56 Q40,-48 34,-24 Q20,-4 -10,-6 Q-40,-8 -46,-40 Z" fill="${fur}"/>
        <path d="M-20,-44 Q-4,-30 14,-40" stroke="${C.peach}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="-76" r="24" fill="${fur}"/>${eye(32, -82, 4.5)}
        <path d="M46,${-76 - talk * 3} Q64,-74 64,-70 Q60,-66 46,${-66 + talk * 3} Z" fill="${C.peach}"/>`;
    } else if (kind === 'squirrel') {
      const sw = Math.sin(t * 3 + seed) * 8;
      g = `<path d="M-20,-20 C-80,-30 -90,-100 ${-50 + sw},-130 C-30,-140 -20,-110 -40,-100 C-60,-80 -40,-50 -14,-40 Z" fill="${C.peach}"/>
        <ellipse cx="4" cy="-40" rx="26" ry="34" fill="#E08E2E"/><ellipse cx="10" cy="-34" rx="14" ry="20" fill="${C.peachL}"/>
        <circle cx="14" cy="-84" r="22" fill="#E08E2E"/><path d="M2,-100 L0,-118 L14,-104 Z" fill="#E08E2E"/>
        ${eye(22, -88, 4.5)}<circle cx="34" cy="-80" r="3.5" fill="${C.dark}"/>`;
    } else if (kind === 'robot') {
      const ant = Math.sin(t * 6 + seed) * 8;
      g = `<rect x="-30" y="-30" width="22" height="30" rx="6" fill="${C.muted}"/><rect x="8" y="-30" width="22" height="30" rx="6" fill="${C.muted}"/>
        <rect x="-46" y="-120" width="92" height="92" rx="20" fill="${o.col || C.tealL}" stroke="${DK.teal}" stroke-width="5"/>
        <rect x="-24" y="-96" width="48" height="40" rx="8" fill="#fff"/>${txt(0, -68, o.screen || '1M', 22, DK.teal)}
        <rect x="-38" y="-198" width="76" height="70" rx="18" fill="${o.col || C.tealL}" stroke="${DK.teal}" stroke-width="5"/>
        <line x1="0" y1="-198" x2="${ant}" y2="-226" stroke="${DK.teal}" stroke-width="5"/><circle cx="${ant}" cy="-230" r="8" fill="${C.pink}"/>
        <rect x="-26" y="-180" width="52" height="30" rx="12" fill="${C.dark}"/>
        <rect x="-18" y="${-172 + bl * 8}" width="12" height="${14 - bl * 12}" rx="4" fill="${C.teal}"/><rect x="6" y="${-172 + bl * 8}" width="12" height="${14 - bl * 12}" rx="4" fill="${C.teal}"/>
        <rect x="-12" y="-144" width="24" height="${4 + talk * 6}" rx="2" fill="${DK.teal}"/>`;
    } else if (kind === 'crab') {
      const cl = Math.sin(t * 5 + seed) * 10;
      g = `${[-1, 1].map(sd => [0, 1, 2].map(i => `<path d="M${sd * 30},-24 L${sd * (50 + i * 10)},${-6 + i * 2}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>`).join('')).join('')}
        <ellipse cx="0" cy="-34" rx="48" ry="30" fill="${C.pink}"/>
        <path d="M-40,-46 L-62,${-80 - cl}" stroke="${C.pink}" stroke-width="7"/><path d="M40,-46 L62,${-80 + cl}" stroke="${C.pink}" stroke-width="7"/>
        <path d="M-62,${-80 - cl} m-14,0 a14,14 0 1,1 28,0 l-14,0 Z" fill="${C.pink}"/><path d="M62,${-80 + cl} m-14,0 a14,14 0 1,1 28,0 l-14,0 Z" fill="${C.pink}"/>
        <line x1="-12" y1="-60" x2="-14" y2="-80" stroke="${C.pink}" stroke-width="4"/><line x1="12" y1="-60" x2="14" y2="-80" stroke="${C.pink}" stroke-width="4"/>
        <circle cx="-14" cy="-84" r="9" fill="#fff"/><circle cx="14" cy="-84" r="9" fill="#fff"/>${eye(-13, -84, 4.5)}${eye(15, -84, 4.5)}
        <path d="M-10,-30 Q0,${-22 + talk * 4} 10,-30" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'mouse') {
      g = `<path d="M-30,-14 Q-70,-10 -80,${-40 + Math.sin(t * 4) * 8}" stroke="${C.pinkL}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="0" cy="-26" rx="34" ry="26" fill="#D9CFE9"/>
        <circle cx="26" cy="-46" r="20" fill="#D9CFE9"/><circle cx="14" cy="-66" r="14" fill="#D9CFE9"/><circle cx="14" cy="-66" r="8" fill="${C.pinkL}"/>
        ${eye(32, -50, 4)}<circle cx="46" cy="-42" r="5" fill="${C.pink}"/>
        <path d="M44,-40 L62,-46 M44,-38 L62,-36" stroke="${C.muted}" stroke-width="2"/>`;
    }
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * f},${s})"><g transform="translate(0,${hop.toFixed(2)})">${g}</g></g>`;
  }
  const crit = (t, kind, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, critter(t, kind, o));
  };

  /* A candle character: (x, y) = feet. o: h body height, w width, col, wu wick-up length,
     walking, hop, lean (deg, about the feet), arms ('wave' | 'up' | 'out' | 'cheer'), mood ('sad' | 'wow'), talk. */
  function cdl(t, o) {
    const s = o.scale || 1, w = o.w || 70, h = o.h || 120, seed = o.seed || 1, col = o.col || C.teal;
    const dark = col === C.pink ? DK.pink : col === C.purple ? DK.purple : col === C.peach ? DK.peach : DK.teal;
    const leg = 34, top = -leg - h;
    const sw = o.walking ? Math.sin(t * 9 + seed) * 12 : 0;
    const bob = o.walking ? -Math.abs(Math.sin(t * 9 + seed)) * 7 : (o.hop ? -Math.abs(Math.sin(t * o.hop + seed)) * (o.hopH || 30) : Math.sin(t * 2.2 + seed) * 3);
    const bl = blinkAmt(t, seed + 3), talk = o.talk ? Math.abs(Math.sin(t * 11 + seed)) : 0;
    const ey = top + Math.min(44, h * 0.32), ex = w * 0.2;
    const armY = top + h * 0.55;
    const wav = Math.sin(t * 8 + seed) * 18;
    const armA = { wave: [-130 + wav, -50 - wav], up: [-120, -60], out: [-170, -10], cheer: [-120 + wav * 0.5, -60 - wav * 0.5] }[o.arms] || [120 + sw * 2, 60 - sw * 2];
    const armL = `<path d="M${-w / 2},${armY} l${f1(Math.cos(rad(armA[0])) * 44)},${f1(Math.sin(rad(armA[0])) * 44)}" stroke="${dark}" stroke-width="9" stroke-linecap="round"/>`;
    const armR = `<path d="M${w / 2},${armY} l${f1(Math.cos(rad(armA[1])) * 44)},${f1(Math.sin(rad(armA[1])) * 44)}" stroke="${dark}" stroke-width="9" stroke-linecap="round"/>`;
    const mouth = o.mood === 'sad' ? `<path d="M-10,${ey + 26} Q0,${ey + 18} 10,${ey + 26}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : o.mood === 'wow' || talk > 0.1 ? `<ellipse cx="0" cy="${ey + 22}" rx="7" ry="${3 + (o.mood === 'wow' ? 6 : talk * 6)}" fill="#6B2A2A"/>`
        : `<path d="M-11,${ey + 18} Q0,${ey + 28} 11,${ey + 18}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const g = `<path d="M${-w * 0.2},${-leg} L${f1(-w * 0.2 - sw)},-4 M${w * 0.2},${-leg} L${f1(w * 0.2 + sw)},-4" stroke="${C.dark}" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="${f1(-w * 0.2 - sw - 4)}" cy="-2" rx="13" ry="7" fill="${C.dark}"/><ellipse cx="${f1(w * 0.2 + sw + 4)}" cy="-2" rx="13" ry="7" fill="${C.dark}"/>
      ${o.wu ? `<line x1="0" y1="${top}" x2="0" y2="${top - o.wu}" stroke="${dark}" stroke-width="8" stroke-linecap="round"/>` : ''}
      ${armL}${armR}
      <rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" rx="14" fill="${col}" stroke="${dark}" stroke-width="4"/>
      <rect x="${-w / 2 + 8}" y="${top + 8}" width="10" height="${h - 16}" rx="5" fill="#fff" opacity=".3"/>
      <circle cx="${-ex}" cy="${ey}" r="9" fill="#fff"/><circle cx="${ex}" cy="${ey}" r="9" fill="#fff"/>
      <ellipse cx="${-ex + 2}" cy="${ey + 1}" rx="5" ry="${(5 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/><ellipse cx="${ex + 2}" cy="${ey + 1}" rx="5" ry="${(5 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      <ellipse cx="${-ex - 6}" cy="${ey + 16}" rx="6" ry="4" fill="${C.pink}" opacity=".5"/><ellipse cx="${ex + 6}" cy="${ey + 16}" rx="6" ry="4" fill="${C.pink}" opacity=".5"/>
      ${mouth}${o.extra || ''}`;
    const f = o.flip ? -1 : 1;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) rotate(${o.lean || 0}) scale(${s * f},${s})"><g transform="translate(0,${bob.toFixed(2)})">${g}</g></g>`;
  }
  const candy = (t, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, cdl(t, o));
  };

  /* A small 1M candle chart. bars: [o, c, h, l] in 0..1. Bars reveal at times[i] (or t0 + i * per).
     o.form = { i, t0, t1, path:[...] } makes candle i form live along a price path. */
  const SEQ = [[.2, .28, .3, .18], [.28, .36, .38, .26], [.36, .44, .47, .34], [.44, .58, .6, .43], [.58, .53, .62, .51], [.53, .42, .55, .4],
    [.42, .46, .48, .38], [.46, .6, .62, .45], [.6, .72, .74, .59], [.72, .8, .83, .7], [.8, .66, .81, .64], [.66, .53, .67, .5], [.53, .7, .72, .52], [.7, .84, .86, .69]];
  const SEQ_I = 3, SEQ_C = 5, SEQ_N = 7, SEQ_R = 11;
  const geo = o => {
    const n = o.n || o.bars.length, step = o.w / n;
    return { X: i => o.x + step * i + step / 2, Y: v => o.y + o.h - v * o.h, step, bw: Math.min(step * 0.58, o.maxBody || 40) };
  };
  function chart(t, o) {
    const { X, Y, bw } = geo(o);
    let out = '';
    if (o.panel !== false) out += `<rect x="${o.x - 30}" y="${o.y - 30}" width="${o.w + 60}" height="${o.h + 60}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
    if (o.pil != null && t > (o.pilAt ?? -1)) {
      const k = ease(seg(t, o.pilAt ?? -1, (o.pilAt ?? -1) + 0.8));
      out += `<line x1="${o.x - 10}" x2="${f1(lerp(o.x - 10, o.x + o.w + 10, k))}" y1="${Y(o.pil)}" y2="${Y(o.pil)}" stroke="${o.pilCol || C.purple}" stroke-width="5" stroke-dasharray="14 9"/>`;
      if (o.pilTag !== false) out += pill(o.x + o.w + 64, Y(o.pil), o.pilTag || 'PIL', o.pilCol || C.purple, pop(t, (o.pilAt ?? -1) + 0.5), 22);
    }
    o.bars.forEach((b, i) => {
      let [bo, bc, bh, bl] = b, p;
      if (o.form && o.form.i === i) {
        const F = o.form;
        if (t < F.t0) return;
        const u = seg(t, F.t0, F.t1) * (F.path.length - 1), j = Math.min(F.path.length - 2, Math.floor(u));
        bo = F.path[0]; bc = lerp(F.path[j], F.path[j + 1], ease(u - j));
        const seen = F.path.slice(0, j + 1).concat([bc]);
        bh = Math.max(...seen); bl = Math.min(...seen); p = 1;
      } else {
        const at = o.times ? o.times[i] : o.t0 + i * o.per;
        if (at == null) return;
        p = ease((t - at) / (o.grow || 0.45));
        if (p <= 0) return;
      }
      const up = bc >= bo, col = o.colOf ? o.colOf(i, up) : (up ? C.teal : C.pink);
      const cc = lerp(bo, bc, p), x = X(i), op = o.dim && o.dim(i) ? 0.3 : 1;
      out += `<g opacity="${op}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(lerp(Math.max(bo, bc), bh, p)))}" y2="${f1(Y(lerp(Math.min(bo, bc), bl, p)))}" stroke="${col}" stroke-width="${o.wick || 5}" stroke-linecap="round"/>
        <rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(bo, cc)))}" width="${f1(bw)}" height="${f1(Math.max(3, Math.abs(Y(bo) - Y(cc))))}" rx="4" fill="${col}"/></g>`;
    });
    (o.tags || []).forEach(tg => {
      const k = pop(t, tg.at, 0.5);
      if (k <= 0) return;
      const b = o.bars[tg.i], x = X(tg.i), above = tg.pos !== 'below';
      const y = above ? Y(b[2]) - (tg.off || 40) : Y(b[3]) + (tg.off || 40);
      out += pill(x, y, tg.text, tg.col || C.purple, k, tg.fs || 22);
    });
    return out;
  }

  /* Path helpers: P() makes an SVG path; partial() returns the first k (0..1) of a polyline by length. */
  const P = pts => 'M' + pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' L');
  const partial = (pts, k) => {
    if (k <= 0) return [pts[0], pts[0]];
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let rem = clamp(k) * tot; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (rem >= L[i - 1]) { out.push(pts[i]); rem -= L[i - 1]; continue; }
      const f = rem / L[i - 1];
      out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
      break;
    }
    return out;
  };
  const poly = (pts, col, w, o = {}) => `<path d="${P(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;
  const dot = (x, y, r, col, k = 1) => k <= 0 ? '' : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * k)}" fill="${col}" stroke="#fff" stroke-width="4"/>`;
  // A sticky note (pops in at k), centred at (x, y).
  const sticky = (x, y, w, h, title, sub, col, k, rot = 0) => k <= 0 ? '' : scaleAt(x, y, k, rotAt(x, y, rot,
    `<rect x="${x - w / 2 + 6}" y="${y - h / 2 + 8}" width="${w}" height="${h}" rx="8" fill="#000" opacity=".06"/><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8" fill="#FFF3C4" stroke="#EBD58A" stroke-width="3"/>
     <rect x="${x - 26}" y="${y - h / 2 - 10}" width="52" height="20" rx="4" fill="${col}" opacity=".55"/>
     ${txt(x, y - 4, title, 20, C.muted, { ls: 2 })}${txt(x, y + 26, sub, 26, col)}`));


  /* ================= Shared Supply & Demand chart pieces ================= */
  // The bullish 5M sequence, prices in 0..1 ([open, close, high, low]). The bearish version is the mirror image.
  // 0-2 move after BOS #1 · 3-4 Correction #1 · 6 BOS #2 (close above bar 2's high) · 8-9 Correction #2 (9 = last bearish candle = zone)
  // 11 BOS #3 (close above bar 7's high) · then one of the endings.
  const BASE = [[.10, .18, .20, .08], [.18, .28, .30, .17], [.28, .36, .38, .27], [.36, .31, .37, .29], [.31, .26, .32, .24], [.26, .33, .34, .25],
    [.33, .45, .47, .32], [.45, .52, .54, .44], [.52, .47, .53, .45], [.47, .42, .48, .40], [.42, .49, .50, .41], [.49, .60, .62, .48]];
  const ENDS = {
    valid: [[.60, .66, .68, .59], [.66, .58, .67, .57], [.58, .51, .59, .50], [.51, .45, .52, .43], [.45, .56, .57, .44], [.56, .63, .65, .55]],
    invalid: [[.60, .63, .65, .58], [.63, .53, .64, .51], [.53, .34, .54, .32], [.34, .31, .37, .29], [.31, .39, .40, .30], [.39, .45, .47, .38]],
    missed: [[.60, .66, .68, .59], [.66, .63, .67, .61], [.63, .72, .74, .62], [.72, .79, .81, .71], [.79, .76, .80, .74], [.76, .86, .88, .75]],
  };
  const NOBOS3 = BASE.slice(0, 10).concat([[.42, .49, .51, .41], [.49, .45, .52, .44], [.45, .51, .53, .44], [.51, .46, .52, .45], [.46, .43, .47, .41], [.43, .47, .49, .42]]);
  const NOBOS2 = BASE.slice(0, 5).concat([[.26, .33, .35, .25], [.33, .30, .36, .28], [.30, .34, .37, .29], [.34, .29, .35, .27], [.29, .32, .34, .27], [.32, .30, .35, .28]]);
  const IDX = { c1: [3, 4], sw2: 2, bos2: 6, c2: [8, 9], sw3: 7, zone: 9, bos3: 11, retest: 15, invalid: 14 };
  const mirror = b => [1 - b[0], 1 - b[1], 1 - b[3], 1 - b[2]];
  const barsOf = (dir, kind) => {
    const bull = kind === 'nobos3' ? NOBOS3 : kind === 'nobos2' ? NOBOS2 : BASE.concat(ENDS[kind] || ENDS.valid);
    return dir === 'bear' ? bull.map(mirror) : bull;
  };
  // Reveal times per bar from stages [[time, lastIndex], ...].
  const revealTimes = (sched, per) => {
    const at = []; let prev = -1;
    (sched || []).forEach(([ts, upto, pp]) => { for (let i = prev + 1; i <= upto; i++) at[i] = ts + (i - prev - 1) * (pp ?? per); prev = Math.max(prev, upto); });
    return at;
  };
  // Price (latest close, growing) at time t, for metaphors that follow price.
  const priceAt = (o, t) => {
    const bars = barsOf(o.dir, o.kind), at = revealTimes(o.sched, o.per || 0.18);
    let v = null;
    bars.forEach((b, i) => { if (at[i] != null && t >= at[i]) v = lerp(b[0], b[1], ease((t - at[i]) / (o.grow || 0.45))); });
    return v;
  };

  /* A 5M sequence chart. o: x, y, w, h (plot), n slots, dir, kind, sched, per, ann {c1, bos2, c2, zone, bos3, active, retest, invalid, dead},
     lab (label column centre x), from (draw bars from index), dimFrom/dimAt (fade later bars), panel {x,y,w,h}, title. */
  function seq(t, o) {
    const bars = barsOf(o.dir, o.kind), bull = o.dir !== 'bear';
    const n = o.n || 18, step = o.w / n, bw = Math.min(step * 0.6, o.maxBody || 30);
    const [lo, hi] = o.dom || (bull ? [0.04, 0.92] : [0.08, 0.96]);
    const X = i => o.x + step * i + step / 2, Y = v => o.y + o.h - (v - lo) / (hi - lo) * o.h;
    const at = revealTimes(o.sched, o.per || 0.18), A_ = o.ann || {}, fs = o.fs || 22;
    const seen = i => at[i] != null && t >= at[i];
    const lab = o.lab || (o.x + o.w + 110);
    const zc = bull ? { f: C.tealL, s: DK.teal, name: 'DEMAND ZONE', cand: 'last bearish candle' } : { f: C.pinkL, s: DK.pink, name: 'SUPPLY ZONE', cand: 'last bullish candle' };
    let out = '';
    if (o.panel) {
      const p = o.panel;
      out += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(p.x + 34, p.y + 48, o.title || '5M', 30, C.purple, { a: 'start' })}`;
      if (o.ctxTag) out += pill(p.x + p.w - 30 - ([...o.ctxTag].length * 20 * 0.62 + 34) / 2, p.y + 40, o.ctxTag, bull ? DK.teal : DK.pink, 1, 20);
    }
    const band = (ix, k, col, label) => {
      if (k <= 0) return '';
      const x0 = X(ix[0]) - step / 2 + 3, x1 = X(ix[ix.length - 1]) + step / 2 - 3;
      return `<rect x="${f1(x0)}" y="${o.y - 6}" width="${f1(x1 - x0)}" height="${o.h + 12}" rx="10" fill="${col}" opacity="${(0.32 * clamp(k)).toFixed(3)}"/>`;
    };
    const bandLabel = (ix, k, text, col) => {
      if (k <= 0) return '';
      const lo = Math.min(...ix.map(i => bars[i][3])), hi = Math.max(...ix.map(i => bars[i][2]));
      const cx = (X(ix[0]) + X(ix[ix.length - 1])) / 2;
      return pill(cx, bull ? Y(lo) + 34 : Y(hi) - 34, text, col, k, fs - 2);
    };
    const kA = v => v == null ? 0 : pop(t, v, 0.5);
    // Correction bands (behind the candles).
    out += band(IDX.c1, kA(A_.c1), C.peachL) + band(IDX.c2, kA(A_.c2), C.peachL);
    // The zone box.
    const zk = kA(A_.zone);
    if (zk > 0 && bars[IDX.zone]) {
      const b = bars[IDX.zone], x0 = X(IDX.zone) - bw / 2 - 6, x1 = o.x + o.w;
      const active = A_.active != null ? seg(t, A_.active, A_.active + 0.4) : 0;
      const dead = A_.invalid != null ? seg(t, A_.invalid, A_.invalid + 0.6) : 0;
      const fill = dead > 0 ? '#CFC6C1' : zc.f, stroke = dead > 0 ? C.muted : zc.s;
      const op = (0.25 + 0.35 * active) * (1 - dead * 0.3);
      out += fade(zk, `<rect x="${f1(x0)}" y="${f1(Y(b[2]))}" width="${f1(x1 - x0)}" height="${f1(Y(b[3]) - Y(b[2]))}" fill="${fill}" opacity="${op.toFixed(3)}"/>
        <rect x="${f1(x0)}" y="${f1(Y(b[2]))}" width="${f1(x1 - x0)}" height="${f1(Y(b[3]) - Y(b[2]))}" fill="none" stroke="${stroke}" stroke-width="3" ${active < 1 || dead > 0 ? 'stroke-dasharray="10 7"' : ''}/>`);
      const ly = (Y(b[2]) + Y(b[3])) / 2;
      const nm = o.zoneName || zc.name;
      if (dead > 0) out += pill(lab, ly, 'INVALID', C.muted, kA(A_.invalid), fs);
      else if (active > 0) out += pill(lab, ly, nm + ' · active', stroke, kA(A_.active), fs - 2);
      else out += pill(lab, ly, 'potential zone', zc.s, zk, fs - 2);
    }
    // Candles.
    bars.forEach((b, i) => {
      if (i < (o.from || 0) || !seen(i)) return;
      const p = ease((t - at[i]) / (o.grow || 0.45));
      const [bo, bc, bh, bl] = b, up = bc >= bo, col = up ? C.teal : C.pink;
      const cc = lerp(bo, bc, p), x = X(i);
      let op = 1;
      if (o.dimFrom != null && i >= o.dimFrom && o.dimAt != null) op = 1 - seg(t, o.dimAt, o.dimAt + 0.6);
      if (o.dimBefore != null && i < o.dimBefore) op = 0.35;
      out += `<g opacity="${op.toFixed(2)}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(lerp(Math.max(bo, bc), bh, p)))}" y2="${f1(Y(lerp(Math.min(bo, bc), bl, p)))}" stroke="${col}" stroke-width="${o.wick || 4}" stroke-linecap="round"/>
        <rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(bo, cc)))}" width="${f1(bw)}" height="${f1(Math.max(3, Math.abs(Y(bo) - Y(cc))))}" rx="3" fill="${col}"/></g>`;
    });
    // Zone candle outline + its pill.
    const zck = kA(A_.zone);
    if (zck > 0 && bars[IDX.zone] && (o.from || 0) <= IDX.zone) {
      const b = bars[IDX.zone], x = X(IDX.zone);
      out += fade(zck, `<rect x="${f1(x - bw / 2 - 7)}" y="${f1(Y(b[2]) - 7)}" width="${f1(bw + 14)}" height="${f1(Y(b[3]) - Y(b[2]) + 14)}" rx="8" fill="none" stroke="${C.gold}" stroke-width="5"/>`);
      if (!o.noCandleTag) out += pill(x, bull ? Y(b[3]) + 82 : Y(b[2]) - 82, zc.cand, C.gold, between(t, A_.zone + 0.2, A_.zoneOut != null ? A_.zoneOut : 1e9), fs - 4, C.dark);
    }
    // Correction labels.
    if ((o.from || 0) <= 4) out += bandLabel(IDX.c1, kA(A_.c1), 'Correction #1', DK.peach);
    if (A_.c2 != null) out += bandLabel(IDX.c2, between(t, A_.c2, A_.c2Out != null ? A_.c2Out : 1e9), 'Correction #2', DK.peach);
    // BOS level lines and tags.
    const bos = (sw, bi, k, label) => {
      if (k <= 0 || !bars[bi]) return '';
      const lv = bull ? bars[sw][2] : bars[sw][3];
      const x0 = X(sw), x1 = lerp(x0, X(bi) + step * 0.5, ease(clamp(k)));
      const b = bars[bi];
      return `<line x1="${f1(x0)}" x2="${f1(x1)}" y1="${f1(Y(lv))}" y2="${f1(Y(lv))}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 7"/>` +
        pill(X(bi), bull ? Y(Math.max(b[2], (bars[bi + 1] || b)[2])) - 32 : Y(Math.min(b[3], (bars[bi + 1] || b)[3])) + 32, label, C.purple, k, fs - 2);
    };
    if (A_.lvl2 != null && bars[IDX.sw2]) {
      const lk = ease(seg(t, A_.lvl2, A_.lvl2 + 0.8)), lv = bull ? bars[IDX.sw2][2] : bars[IDX.sw2][3];
      if (lk > 0) out += `<line x1="${f1(X(IDX.sw2))}" x2="${f1(lerp(X(IDX.sw2), o.x + o.w, lk))}" y1="${f1(Y(lv))}" y2="${f1(Y(lv))}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 7"/>`;
    }
    out += bos(IDX.sw2, IDX.bos2, kA(A_.bos2), 'BOS #2');
    out += bos(IDX.sw3, IDX.bos3, kA(A_.bos3), 'BOS #3');
    // Retest ring.
    const rk = kA(A_.retest);
    if (rk > 0 && bars[IDX.retest]) {
      const b = bars[IDX.retest], x = X(IDX.retest), y = bull ? Y(b[3]) : Y(b[2]);
      out += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(26 * rk)}" fill="none" stroke="${C.gold}" stroke-width="5"/>`;
      out += pill(x, bull ? y + 52 : y - 52, 'retest', C.gold, rk, fs - 2, C.dark);
    }
    // Invalidation: ring on the close beyond the far edge.
    const ik = kA(A_.invalid);
    if (ik > 0 && bars[IDX.invalid]) {
      const b = bars[IDX.invalid], x = X(IDX.invalid);
      out += `<circle cx="${f1(x)}" cy="${f1(Y(b[1]))}" r="${f1(24 * ik)}" fill="none" stroke="${C.pink}" stroke-width="5"/>`;
      out += pill(x, bull ? Y(b[3]) + 46 : Y(b[2]) - 46, bull ? 'closed below the zone' : 'closed above the zone', C.pink, between(t, A_.invalid, A_.invalidOut != null ? A_.invalidOut : 1e9), fs - 4);
    }
    return out;
  }

  // A small 15M chart: price closes beyond the 15M level for BOS #1.
  const M15 = [[.10, .30, .34, .06], [.30, .50, .58, .26], [.50, .36, .56, .32], [.36, .22, .40, .18], [.22, .44, .48, .20], [.44, .88, .92, .42]];
  function m15(t, o) {
    const bull = o.dir !== 'bear', bars = bull ? M15 : M15.map(mirror), lv = bull ? 0.65 : 0.35;
    const Y = v => o.y + o.h - v * o.h;
    let out = '';
    if (o.panel) out += `<rect x="${o.panel.x}" y="${o.panel.y}" width="${o.panel.w}" height="${o.panel.h}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(o.panel.x + 30, o.panel.y + 46, '15M', 30, DK.peach, { a: 'start' })}`;
    const lk = ease(seg(t, o.t0, o.t0 + 0.8));
    if (lk > 0) out += `<line x1="${o.x - 10}" x2="${f1(lerp(o.x - 10, o.x + o.w + 10, lk))}" y1="${Y(lv)}" y2="${Y(lv)}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 9"/>${txt(o.x - 6, Y(lv) + (bull ? -14 : 30), '15M level', 20, C.purple, { a: 'start', op: lk })}`;
    out += chart(t, { x: o.x, y: o.y, w: o.w, h: o.h, n: 7, bars, panel: false, maxBody: 34, wick: 4,
      times: bars.map((b, i) => i < 5 ? o.t0 + 0.4 + i * (o.per || 0.35) : o.bosAt - 0.5),
      tags: [{ i: 5, text: bull ? 'BOS #1 · close above' : 'BOS #1 · close below', col: C.purple, at: o.bosAt, off: 36, fs: 20, pos: bull ? 'above' : 'below' }] });
    return out;
  }
  const flash = (x, y, t0, t) => t > t0 ? A.sparkle(x, y, t0, t) : '';
  // Hop between waypoints [{at, x, y}] with a small arc.
  const hopPos = (t, wps, d = 0.7, hgt = 80) => {
    let p = { x: wps[0].x, y: wps[0].y, moving: false };
    for (let i = 1; i < wps.length; i++) {
      const w = wps[i], pr = wps[i - 1];
      if (t < w.at) break;
      const k = seg(t, w.at, w.at + (w.d || d));
      p = { x: lerp(pr.x, w.x, ease(k)), y: lerp(pr.y, w.y, k) - Math.sin(k * Math.PI) * (w.h ?? hgt), moving: k < 1 };
    }
    return p;
  };
  const card = (x, y, w, h, tab, sub, col, k) => k <= 0 ? '' : scaleAt(x + w / 2, y + h / 2, k,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="${col}" stroke-width="4"/><rect x="${x}" y="${y}" width="150" height="${h}" rx="18" fill="${col}"/>
     ${txt(x + 75, y + h / 2 + 10, tab, 28, '#fff')}${txt(x + 172, y + h / 2 + 9, sub, 24, C.text, { a: 'start', w: 700 })}`);

  const TYPES = ['stepping-stones', 'elevator-lobby', 'mirror-lake', 'cable-car', 'thin-ice', 'missing-plank', 'boomerang', 'weather-board', 'relay-race', 'practice-gym'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['sd4-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson m2-6: Executing Bullish Demand ================= */
  Object.assign(LIVE, {
    // Crossing the river one stone at a time: 4H, 1H, HTF ICC, then the 15M BOS #1 stone. Only then onto the 5M bank.
    'sd4-stepping-stones': (s, t, ctx) => {
      const T = s.beats;
      const RY = 900;
      let out = `<rect x="0" y="${RY}" width="1920" height="${1080 - RY}" fill="${C.tealL}" opacity=".75"/>`;
      let wv = `M0,${RY + 12}`;
      for (let x = 0; x <= 1920; x += 40) wv += ` L${x},${(RY + 12 + Math.sin(x / 55 + t * 1.6) * 5).toFixed(1)}`;
      out += `<path d="${wv} L1920,1080 L0,1080 Z" fill="${C.teal}" opacity=".35"/>`;
      // Banks.
      out += `<path d="M0,880 L250,880 Q280,884 292,1080 L0,1080 Z" fill="#E7C9A5"/><rect x="0" y="874" width="252" height="10" rx="4" fill="#D4AE84"/>`;
      out += `<path d="M1920,880 L1270,880 Q1240,884 1228,1080 L1920,1080 Z" fill="#E7C9A5"/><rect x="1268" y="874" width="652" height="10" rx="4" fill="#D4AE84"/>`;
      // Stones.
      const SX = [420, 630, 840, 1060], SY = 930;
      const lit = [T.stones[0], T.stones[1], T.stones[2], T.bos1];
      const names = ['4H', '1H', 'HTF ICC', 'BOS #1 · 15M'];
      SX.forEach((x, i) => {
        const k = pop(t, T.river + 0.3 + i * 0.25, 0.6), on = seg(t, lit[i], lit[i] + 0.4);
        out += scaleAt(x, SY, k, `${on > 0 ? `<ellipse cx="${x}" cy="${SY}" rx="${96}" ry="34" fill="${C.gold}" opacity="${(0.35 * on).toFixed(2)}"/>` : ''}
          <ellipse cx="${x}" cy="${SY + 6}" rx="82" ry="26" fill="#9E8C80"/><ellipse cx="${x}" cy="${SY - 2}" rx="78" ry="22" fill="#BFAEA2"/><ellipse cx="${x - 18}" cy="${SY - 8}" rx="30" ry="7" fill="#fff" opacity=".35"/>`);
        out += pill(x, 1032, names[i], i === 3 ? C.purple : i === 2 ? DK.purple : DK.teal, pop(t, lit[i], 0.5), 22);
      });
      // HTF story cards.
      const rows = [['4H', 'Bullish · lower half of the range · correcting'], ['1H', 'Bullish structure · reacting from a higher low'], ['HTF ICC', 'Bullish Indication · Correction in progress']];
      rows.forEach(([a, b], i) => out += card(110, 400 + i * 92, 800, 76, a, b, [C.purple, DK.teal, DK.purple][i], pop(t, T.stones[i], 0.6)));
      out += pill(510, 690, 'the story is bullish → look for DEMAND', DK.teal, pop(t, T.demand, 0.6), 24);
      // 15M panel.
      const pk = pop(t, T.chart, 0.7);
      if (pk > 0) out += scaleAt(1450, 580, pk, m15(t, { dir: 'bull', x: 1140, y: 450, w: 500, h: 270, t0: T.chart + 0.2, per: 0.4, bosAt: T.bos1, panel: { x: 1080, y: 380, w: 740, h: 390 } }));
      out += flash(1630, 470, T.bos1, t);
      out += pill(1450, 740, 'a step, not an entry ✋', C.pink, pop(t, T.notEntry, 0.5), 22);
      // The far bank sign: next, the 5M.
      const sk = pop(t, T.switch, 0.6);
      out += scaleAt(1700, 880, sk, `<rect x="1694" y="790" width="12" height="90" fill="#9B6A45"/><rect x="1600" y="782" width="200" height="56" rx="12" fill="${C.purple}"/>${txt(1700, 820, 'TO THE 5M →', 22, '#fff')}`);
      // The hiker.
      const wps = [{ x: 160, y: 880 }, { at: T.stones[0] + 0.4, x: SX[0], y: SY }, { at: T.stones[1] + 0.4, x: SX[1], y: SY }, { at: T.stones[2] + 0.4, x: SX[2], y: SY }, { at: T.bos1 + 0.5, x: SX[3], y: SY }, { at: T.switch + 0.4, x: 1420, y: 880, d: 1 }];
      const hp = hopPos(t, wps);
      const hk = { x: hp.x, y: hp.y, scale: 0.6, look: A.LOOKS.b, seed: 3, at: T.river, hat: 'cap', talk: ctx.talking && t > T.river && t < T.stones[0] };
      if (hp.moving) hk.frontArm = { a1: -40, a2: -60 };
      out += who(t, hk);
      out += bub(330, 640, 'Story first 📖', between(t, T.river + 0.6, T.stones[0] - 0.2), { size: 28 });
      out += bub(880, 780, 'Not yet! 5M next.', between(t, T.notEntry + 0.6, T.switch + 0.2), { size: 26 });
      return out;
    },

    // The 5M builds the setup. Price is an elevator; the demand zone is the lobby floor. After BOS #3 it rides up, and you wait in the lobby.
    'sd4-elevator-lobby': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const o = { x: 150, y: 450, w: 790, h: 500, n: 18, dir: 'bull', kind: 'valid', lab: 1070, per: 0.2, ctxTag: 'bullish context',
        sched: [[T.chart, 4], [T.bos2 - 0.8, 7], [T.c2, 9], [T.bos3 - 0.6, 11], [T.wait - 0.8, 14], [T.retest - 0.4, 15]],
        ann: { c1: T.c1, bos2: T.bos2, c2: T.c2 + 0.5, zone: T.zone, zoneOut: T.bos3 - 0.2, bos3: T.bos3, active: T.active, retest: T.retest + 0.2 },
        panel: { x: 100, y: 390, w: 1100, h: 600 } };
      out += fade(pop(t, T.chart - 0.1, 0.6), seq(t, o));
      out += pill(650, 1042, 'BOS #2 · still not an entry', C.purple, between(t, T.notEntry, T.zone - 0.2), 24);
      out += pill(650, 1042, 'BOS #3 · the zone is active', DK.teal, between(t, T.active, T.wait - 0.2), 24);
      out += pill(650, 1042, 'wait for the retest · never chase', DK.peach, between(t, T.wait, T.retest + 0.4), 24);
      out += pill(650, 1042, 'retest ✓ the entry model can apply', C.gold, pop(t, T.retest + 0.8, 0.5), 24, C.dark);
      // The elevator building (rises when Correction #2 starts).
      const bk = pop(t, T.c2 - 0.4, 0.8);
      const BX0 = 1290, BX1 = 1690, TOP = 440, CX = 1420;
      const Yc = v => 990 - (clamp((v - 0.36) / 0.36)) * (990 - 560);
      if (bk > 0) {
        let b = `<rect x="${BX0}" y="${TOP}" width="${BX1 - BX0}" height="${1000 - TOP}" rx="10" fill="#FFF6EE" stroke="${C.purple}" stroke-width="5"/>
          <rect x="${BX0 - 14}" y="${TOP - 26}" width="${BX1 - BX0 + 28}" height="34" rx="10" fill="${C.purple}"/>${txt((BX0 + BX1) / 2, TOP - 1, 'THE PRICE ELEVATOR', 20, '#fff', { ls: 2 })}
          <rect x="${CX - 80}" y="${TOP + 20}" width="160" height="${1000 - TOP - 20}" fill="#F1E7E1"/>
          <line x1="${CX - 2}" y1="${TOP + 20}" x2="${CX - 2}" y2="1000" stroke="#D9CFC8" stroke-width="3"/>`;
        for (let y = TOP + 100; y < 1000; y += 110) b += `<line x1="${BX0}" x2="${BX1}" y1="${y}" y2="${y}" stroke="#F1E7E1" stroke-width="3"/><rect x="${BX1 - 120}" y="${y - 76}" width="80" height="54" rx="8" fill="#E8F8F6"/>`;
        out += scaleAt(1490, 1000, bk, b);
      }
      // The lobby = the demand zone (zone candle range on the same price scale).
      const zk = pop(t, T.zone, 0.6);
      if (zk > 0 && bk >= 1) {
        const act = seg(t, T.active, T.active + 0.4);
        const y0 = Yc(0.48), y1 = Yc(0.40);
        out += fade(zk, `<rect x="${BX0 + 4}" y="${f1(y0)}" width="${BX1 - BX0 - 8}" height="${f1(y1 - y0)}" fill="${C.tealL}" opacity="${(0.35 + 0.35 * act).toFixed(2)}"/>
          <rect x="${BX0 + 4}" y="${f1(y0)}" width="${BX1 - BX0 - 8}" height="${f1(y1 - y0)}" fill="none" stroke="${DK.teal}" stroke-width="4" ${act < 1 ? 'stroke-dasharray="10 7"' : ''}/>`);
        out += pill(1490, 1046, act > 0 ? 'the lobby = the demand zone · active' : 'the lobby = the demand zone', DK.teal, zk, 22);
      }
      // The car follows price.
      if (bk >= 1) {
        const v = priceAt(o, t);
        if (v != null) {
          const yb = Yc(v);
          out += `<line x1="${CX}" y1="${TOP + 20}" x2="${CX}" y2="${f1(yb - 110)}" stroke="${C.muted}" stroke-width="4"/>
            <rect x="${CX - 66}" y="${f1(yb - 110)}" width="132" height="104" rx="12" fill="${C.purple}" stroke="${DK.purple}" stroke-width="4"/>
            <rect x="${CX - 52}" y="${f1(yb - 96)}" width="104" height="58" rx="6" fill="#E9E6FB"/><line x1="${CX}" x2="${CX}" y1="${f1(yb - 96)}" y2="${f1(yb - 38)}" stroke="${C.purple}" stroke-width="3"/>
            ${txt(CX, yb - 14, 'PRICE', 16, '#fff', { ls: 2 })}`;
        }
        if (t > T.retest + 0.4) out += flash(CX, Yc(0.47) - 60, T.retest + 0.4, t);
      }
      // The trader waits in the lobby.
      const tr = { x: 1600, y: 1000, scale: 0.62, look: A.LOOKS.c, seed: 5, flip: true, at: T.chart + 0.5, talk: ctx.talking && t > T.wait };
      if (t > T.wait && t < T.retest) tr.hold = `<g transform="translate(0,-6)"><rect x="-14" y="-24" width="28" height="30" rx="6" fill="#fff" stroke="${C.peach}" stroke-width="4"/><path d="M14,-16 q12,0 12,10 q0,10 -12,10" fill="none" stroke="${C.peach}" stroke-width="4"/></g>`;
      if (t > T.retest + 0.4) tr.frontArm = { a1: -120, a2: -150 };
      out += who(t, tr);
      out += bub(1560, 560, 'Still not an entry ✋', between(t, T.notEntry + 0.3, T.c2 - 0.4), { size: 26 });
      out += bub(1640, 500, 'I’ll wait right here ☕', between(t, T.wait + 0.2, T.retest), { size: 24, tail: 'right' });
      out += bub(1640, 500, 'It came back ✓', between(t, T.retest + 0.6, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson m2-7: Executing Bearish Supply ================= */
  Object.assign(LIVE, {
    // The bullish sequence on the hill, the bearish sequence in its reflection. Then the bearish HTF story and the 15M close below.
    'sd4-mirror-lake': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const HZ = 690, LX0 = 110, LX1 = 930;
      // Lake (below the horizon), sky band above.
      const lk = pop(t, T.lake, 0.7);
      if (lk > 0) {
        let g = `<rect x="${LX0}" y="400" width="${LX1 - LX0}" height="${HZ - 400}" rx="22" fill="#FFF9F2"/>
          <path d="M${LX0},${HZ} L${LX1},${HZ} L${LX1},${980} Q${LX1},996 ${LX1 - 16},996 L${LX0 + 16},996 Q${LX0},996 ${LX0},980 Z" fill="${C.tealL}" opacity=".8"/>`;
        for (let i = 0; i < 6; i++) g += `<line x1="${LX0 + 60 + i * 130 + Math.sin(t * 1.5 + i) * 14}" x2="${LX0 + 130 + i * 130 + Math.sin(t * 1.5 + i) * 14}" y1="${HZ + 50 + (i % 3) * 90}" y2="${HZ + 50 + (i % 3) * 90}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
        g += `<line x1="${LX0}" x2="${LX1}" y1="${HZ}" y2="${HZ}" stroke="${C.muted}" stroke-width="4"/>`;
        out += scaleAt(520, HZ, lk, g);
      }
      // Candles on the hill (bullish) and in the water (mirror).
      const mini = [[.1, .3, .33, .08], [.3, .55, .58, .28], [.55, .42, .57, .38], [.42, .7, .73, .4], [.7, .58, .72, .55], [.58, .9, .93, .56]];
      const cw = 30, x0 = 220, stp = 115, H = 250;
      mini.forEach((b, i) => {
        const k = ease(seg(t, T.lake + 0.5 + i * 0.25, T.lake + 0.9 + i * 0.25));
        if (k <= 0) return;
        const x = x0 + i * stp, up = b[1] > b[0];
        const yU = v => HZ - 12 - v * H, yD = v => HZ + 12 + v * H;
        const c1 = up ? C.teal : C.pink, c2 = up ? C.pink : C.teal;
        out += fade(k, `<line x1="${x}" x2="${x}" y1="${f1(yU(b[2]))}" y2="${f1(yU(b[3]))}" stroke="${c1}" stroke-width="4"/><rect x="${x - cw / 2}" y="${f1(yU(Math.max(b[0], b[1])))}" width="${cw}" height="${f1(Math.abs(b[1] - b[0]) * H)}" rx="3" fill="${c1}"/>`);
        const wob = Math.sin(t * 3 + i) * 3;
        out += fade(k * 0.75, `<g transform="translate(${f1(wob)},0)"><line x1="${x}" x2="${x}" y1="${f1(yD(b[2]))}" y2="${f1(yD(b[3]))}" stroke="${c2}" stroke-width="4"/><rect x="${x - cw / 2}" y="${f1(yD(Math.min(b[0], b[1])))}" width="${cw}" height="${f1(Math.abs(b[1] - b[0]) * H)}" rx="3" fill="${c2}"/></g>`);
      });
      out += pill(320, 440, 'bullish · demand', DK.teal, pop(t, T.lake + 2, 0.5), 22);
      out += pill(320, 960, 'bearish · supply', DK.pink, pop(t, T.lake + 2.4, 0.5), 22);
      out += pill(700, HZ, 'same sequence, flipped', C.purple, pop(t, T.lake + 2.8, 0.5), 22);
      // Right column: the bearish HTF story cards, then the 15M panel.
      const rows = [['4H', 'Bearish · upper half · correcting'], ['1H', 'Bearish · reacting from a lower high'], ['HTF ICC', 'Bearish Indication · correcting']];
      rows.forEach(([a, b], i) => {
        const k = between(t, T.cards[i], T.chart - 0.5, 0.6);
        out += card(1010, 400 + i * 92, 820, 76, a, b, [C.purple, DK.pink, DK.purple][i], k);
      });
      out += pill(1420, 700, 'the story is bearish → look for SUPPLY', DK.pink, between(t, T.supply, T.chart - 0.5, 0.6), 24);
      const pk = pop(t, T.chart, 0.7);
      if (pk > 0) out += scaleAt(1420, 590, pk, m15(t, { dir: 'bear', x: 1100, y: 460, w: 500, h: 270, t0: T.chart + 0.2, per: 0.4, bosAt: T.bos1, panel: { x: 1010, y: 390, w: 820, h: 400 } }));
      out += flash(1580, 760, T.bos1, t);
      out += pill(1420, 850, 'don’t sell yet ✋ switch to the 5M', C.pink, pop(t, T.dont, 0.5), 24);
      // Observer on the shore.
      const ob = { x: 1000, y: 1000, scale: 0.55, look: A.LOOKS.e, seed: 4, flip: true, at: T.lake + 0.3, talk: ctx.talking && t < T.cards[0] };
      out += who(t, ob);
      out += bub(1260, 640, 'Same steps, mirrored 🪞', between(t, T.lake + 3.2, T.cards[0] + 1), { size: 26 });
      return out;
    },

    // The bearish 5M sequence. Price is a cable car; the supply zone is a stretch of cable near the top station.
    'sd4-cable-car': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const o = { x: 150, y: 450, w: 790, h: 500, n: 18, dir: 'bear', kind: 'valid', lab: 1070, per: 0.2, ctxTag: 'bearish context',
        sched: [[T.chart, 4], [T.bos2 - 0.8, 7], [T.c2, 9], [T.bos3 - 0.6, 11], [T.wait - 0.6, 14], [T.retest - 0.4, 15]],
        ann: { c1: T.c1, bos2: T.bos2, c2: T.c2 + 0.5, zone: T.zone, zoneOut: T.bos3 - 0.2, bos3: T.bos3, active: T.active, retest: T.retest + 0.2 },
        panel: { x: 100, y: 390, w: 1100, h: 600 } };
      out += fade(pop(t, T.chart - 0.1, 0.6), seq(t, o));
      out += pill(650, 1042, 'BOS #2 · not an entry', C.purple, between(t, T.bos2 + 0.4, T.zone - 0.2), 24);
      out += pill(650, 1042, 'BOS #3 · the supply zone is active', DK.pink, between(t, T.active, T.wait - 0.2), 24);
      out += pill(650, 1042, 'wait for price to climb back', DK.peach, between(t, T.wait, T.retest + 0.4), 24);
      out += pill(650, 1042, 'retest ✓ the entry model can apply', C.gold, pop(t, T.retest + 0.8, 0.5), 24, C.dark);
      // Mountain + cable.
      const mk = pop(t, T.chart + 0.3, 0.8);
      const V = [1330, 950], TOPS = [1760, 500];
      const sOf = v => clamp((v - 0.28) / 0.36);
      const at = s_ => [lerp(V[0], TOPS[0], s_), lerp(V[1], TOPS[1], s_)];
      if (mk > 0) {
        out += scaleAt(1580, 1000, mk, `<path d="M1240,1000 L1560,620 L1640,690 L1800,440 L1910,600 L1910,1000 Z" fill="#E6DCF5"/><path d="M1760,500 L1800,440 L1840,500 L1820,492 L1800,510 L1780,494 Z" fill="#fff"/>
          <rect x="${V[0] - 60}" y="${V[1] - 10}" width="120" height="60" rx="8" fill="${C.peach}"/>${txt(V[0], V[1] + 30, 'VALLEY', 18, '#fff', { ls: 2 })}
          <rect x="${TOPS[0] - 70}" y="${TOPS[1] - 70}" width="140" height="80" rx="10" fill="${C.purple}"/>${txt(TOPS[0], TOPS[1] - 22, 'TOP', 20, '#fff', { ls: 2 })}
          <line x1="${V[0]}" y1="${V[1]}" x2="${TOPS[0]}" y2="${TOPS[1]}" stroke="${C.dark}" stroke-width="4"/>`);
      }
      // The supply zone: a stretch of cable on the same price scale.
      const zk = pop(t, T.zone, 0.6);
      if (zk > 0 && mk >= 1) {
        const act = seg(t, T.active, T.active + 0.4);
        const a = at(sOf(0.52)), b = at(sOf(0.60));
        out += fade(zk, `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${C.pink}" stroke-width="${act > 0 ? 22 : 14}" stroke-linecap="round" opacity="${(0.45 + 0.4 * act).toFixed(2)}" ${act < 1 ? 'stroke-dasharray="14 10"' : ''}/>`);
        out += pill(1500, 560, act > 0 ? 'supply zone · active' : 'supply zone', DK.pink, zk, 22);
      }
      if (mk >= 1 && t > T.c2 - 0.4) {
        const v = priceAt(o, t);
        if (v != null) {
          const [cx, cy] = at(sOf(v));
          out += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(cx)}" y2="${f1(cy + 30)}" stroke="${C.dark}" stroke-width="4"/>
            <rect x="${f1(cx - 46)}" y="${f1(cy + 30)}" width="92" height="70" rx="14" fill="${C.pink}" stroke="${DK.pink}" stroke-width="4"/>
            <rect x="${f1(cx - 34)}" y="${f1(cy + 40)}" width="68" height="28" rx="6" fill="#FDE8ED"/>${txt(cx, cy + 92, 'PRICE', 15, '#fff', { ls: 1 })}`;
        }
        if (t > T.retest + 0.4) out += flash(at(sOf(0.55))[0], at(sOf(0.55))[1] + 60, T.retest + 0.4, t);
      }
      const tr = { x: 1250, y: 1000, scale: 0.56, look: A.LOOKS.a, seed: 7, flip: true, at: T.chart + 0.6, talk: ctx.talking && t > T.wait };
      if (t > T.wait && t < T.retest) tr.frontArm = aim(tr, 1640, 690);
      out += who(t, tr);
      out += bub(1330, 700, 'I’ll wait for it ⏳', between(t, T.wait + 0.2, T.retest), { size: 24 });
      return out;
    },
  });

  /* ================= Lesson m2-8: Recognizing Invalid Setups ================= */
  Object.assign(LIVE, {
    // The active demand zone is a sheet of ice. A 5M close below its low breaks through. Coming back later doesn't fix the ice.
    'sd4-thin-ice': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const o = { x: 150, y: 450, w: 790, h: 500, n: 18, dir: 'bull', kind: 'invalid', lab: 1070, per: 0.08, ctxTag: 'bullish context',
        sched: [[T.chart, 12], [T.pull, 13], [T.inv, 14], [T.back, 17, 0.6]], grow: 0.5,
        ann: { zone: T.chart + 0.9, zoneOut: T.chart + 1, bos3: T.chart + 1.3, active: T.chart + 1.5, invalid: T.inv + 0.7, invalidOut: T.back - 0.3 },
        noCandleTag: true, panel: { x: 100, y: 390, w: 1100, h: 600 } };
      const ok = between(t, T.chart - 0.1, T.sup - 0.3, 0.6);
      if (ok > 0) {
        out += fade(ok, seq(t, Object.assign({}, o, { per: 0.08 })));
        out += fade(ok, pill(830, 520, 'back inside the old zone', C.muted, pop(t, T.back + 1.8, 0.5), 20));
        out += fade(ok, pill(650, 1042, 'a dead zone · still not an entry', C.muted, pop(t, T.dead + 1.6, 0.5), 24));
      }
      // The pond (right).
      const pk = between(t, T.chart + 0.4, T.sup - 0.3, 0.7);
      if (pk > 0) {
        const brk = seg(t, T.inv + 0.5, T.inv + 1.1);
        let g = `<ellipse cx="1560" cy="960" rx="300" ry="50" fill="${C.tealL}"/><ellipse cx="1560" cy="955" rx="260" ry="34" fill="${C.teal}" opacity=".35"/>`;
        // The ice: whole, then two tilted halves.
        const ice = (x0, x1, rot, px) => rotAt(px, 900, rot, `<rect x="${x0}" y="884" width="${x1 - x0}" height="30" rx="8" fill="#E8F8F6" stroke="${C.tealD}" stroke-width="4"/>`);
        if (brk <= 0) g += ice(1330, 1790, 0, 1560) + txt(1560, 906, 'DEMAND ZONE · active', 20, DK.teal);
        else {
          const dead = seg(t, T.dead, T.dead + 0.6);
          const col = dead > 0 ? '#D9D2CD' : '#E8F8F6';
          g += rotAt(1330, 900, brk * 10, `<rect x="1330" y="884" width="210" height="30" rx="8" fill="${col}" stroke="${C.muted}" stroke-width="4"/>`);
          g += rotAt(1790, 900, -brk * 12, `<rect x="1590" y="884" width="200" height="30" rx="8" fill="${col}" stroke="${C.muted}" stroke-width="4"/>`);
          g += `<path d="M1540,884 l14,12 l-10,8 l16,10" stroke="${C.muted}" stroke-width="4" fill="none" opacity="${(1 - brk).toFixed(2)}"/>`;
        }
        out += scaleAt(1560, 1000, pk, g);
        // The bearish candle walks on, then drops through when it closes below.
        const walk = ease(seg(t, T.pull, T.pull + 1.4));
        const drop = ease(seg(t, T.inv + 0.5, T.inv + 1.3));
        const climb = ease(seg(t, T.back + 0.2, T.back + 1.6));
        if (t > T.pull - 0.2) {
          let cx = lerp(1840, 1565, walk), cy = 884 + drop * 120;
          if (climb > 0) { cx = lerp(1565, 1440, climb); cy = lerp(1004, 884, climb) - Math.sin(climb * Math.PI) * 40; }
          out += cdl(t, { x: cx, y: cy, h: 96, w: 58, col: C.pink, wu: 14, seed: 4, walking: walk > 0 && walk < 1, mood: drop > 0.5 ? 'wow' : undefined, arms: drop > 0 && climb < 1 ? 'up' : undefined });
          if (drop > 0 && climb <= 0) out += `<ellipse cx="1565" cy="964" rx="${f1(120 * drop)}" ry="26" fill="${C.teal}" opacity=".9"/>`;
          if (t > T.inv + 0.9) out += flash(1565, 900, T.inv + 0.9, t);
        }
        // The closed sign.
        const sk = pop(t, T.dead, 0.6);
        out += scaleAt(1760, 884, sk, `<rect x="1754" y="760" width="12" height="124" fill="#9B6A45"/><rect x="1660" y="740" width="200" height="76" rx="12" fill="${C.muted}"/>${txt(1760, 774, 'DEAD ZONE', 22, '#fff', { ls: 2 })}${txt(1760, 802, 'no entry', 20, '#fff', { w: 700 })}`);
        out += bub(1460, 640, 'It’s cracked. Let it go.', between(t, T.back + 1.8, T.sup - 0.4), { size: 24 });
      }
      // The supply mirror.
      const qk = pop(t, T.sup, 0.7);
      if (qk > 0) {
        const q = { x: 280, y: 470, w: 940, h: 420, n: 18, dir: 'bear', kind: 'invalid', lab: 1400, per: 0.06,
          sched: [[T.sup + 0.2, 13], [T.sup + 1.4, 14]], grow: 0.5,
          ann: { zone: T.sup + 0.9, zoneOut: T.sup + 1, bos3: T.sup + 1, active: T.sup + 1.1, invalid: T.sup + 2.1 }, noCandleTag: true, zoneName: 'SUPPLY ZONE',
          panel: { x: 220, y: 390, w: 1480, h: 600 }, title: '5M · the supply mirror' };
        out += scaleAt(960, 690, qk, seq(t, q));
        out += pill(1400, 930, 'far edge = the zone’s high', DK.pink, pop(t, T.sup + 2.6, 0.5), 22);
      }
      return out;
    },

    // A bridge of steps. A missing plank means you can't cross: no BOS #2, or no BOS #3, means no trade.
    'sd4-missing-plank': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="930" width="1920" height="150" fill="#EADFD8"/><rect x="230" y="930" width="1460" height="150" fill="#D8C8BE"/>`;
      // Cliffs.
      out += `<path d="M0,920 L230,920 L250,1080 L0,1080 Z" fill="#E7C9A5"/><path d="M1920,920 L1690,920 L1670,1080 L1920,1080 Z" fill="#E7C9A5"/>`;
      out += txt(1805, 900, 'TRADE', 24, DK.teal, { ls: 3, op: pop(t, T.intro, 0.5) });
      const names = ['BOS #1', 'CORRECTION #1', 'BOS #2', 'CORRECTION #2', 'BOS #3', 'RETEST'];
      const PW = (1690 - 230) / 6;
      const case2 = t >= T.case2;
      const built = i => i < 2 ? T.intro + 0.3 + i * 0.4 : !case2 ? null : i < 4 ? T.case2 + 0.6 + (i - 2) * 0.5 : null;
      // Ropes.
      out += `<path d="M230,830 Q960,900 1690,830" fill="none" stroke="#9B6A45" stroke-width="5"/>`;
      names.forEach((nm, i) => {
        const x0 = 230 + i * PW + 6, b = built(i), k = b == null ? 0 : pop(t, b, 0.5);
        out += `<rect x="${f1(x0)}" y="920" width="${f1(PW - 12)}" height="38" rx="6" fill="none" stroke="#B9A89E" stroke-width="3" stroke-dasharray="10 8"/>`;
        if (k > 0) {
          const pot = i === 3;
          out += scaleAt(x0 + PW / 2, 939, k, `<rect x="${f1(x0)}" y="920" width="${f1(PW - 12)}" height="38" rx="6" fill="${pot ? C.peach : '#B8835A'}" stroke="#9B6A45" stroke-width="3"/>${txt(x0 + PW / 2 - 6, 946, nm, 18, '#fff', { ls: 1 })}`);
        } else out += txt(x0 + PW / 2 - 6, 946, nm, 18, '#B9A89E', { ls: 1, op: pop(t, T.intro + 0.4, 0.5) });
      });
      // Walker.
      const w1 = ease(seg(t, T.case1 + 0.4, T.stop1)), w2 = ease(seg(t, T.case2 + 1.6, T.stop2));
      const wx = !case2 ? lerp(120, 230 + 2 * PW - 40, w1) : lerp(230 + 2 * PW - 40, 230 + 4 * PW - 40, w2);
      const wk = { x: wx, y: 920, scale: 0.45, look: A.LOOKS.d, seed: 6, at: T.intro, walking: (!case2 && w1 > 0 && w1 < 1) || (case2 && w2 > 0 && w2 < 1), mood: (t > T.stop1 && !case2) || t > T.stop2 ? 'sad' : undefined };
      out += who(t, wk);
      out += cross(230 + 2 * PW + PW / 2, 1010, between(t, T.stop1, T.case2 - 0.2), C.pink, 26) + pill(230 + 2 * PW + PW / 2 + 260, 1010, 'no BOS #2 · no zone · no trade', C.pink, between(t, T.stop1 + 0.2, T.case2 - 0.2), 22);
      out += cross(230 + 4 * PW + PW / 2, 1010, between(t, T.stop2, s.end), C.pink, 26) + pill(230 + 4 * PW + PW / 2 - 330, 1010, 'no BOS #3 · the zone never activates', C.pink, between(t, T.stop2 + 0.2, T.stamp - 0.2), 22);
      // The chart above: case 1 (bearish, no BOS #2), case 2 (bullish, no BOS #3).
      const P1 = { x: 300, y: 440, w: 980, h: 270, n: 18, lab: 1460, per: 0.22, panel: { x: 240, y: 380, w: 1440, h: 370 } };
      const c1k = between(t, T.case1 - 0.2, T.case2 - 0.4, 0.6);
      if (c1k > 0) {
        out += fade(c1k, seq(t, Object.assign({}, P1, { dir: 'bear', kind: 'nobos2', dom: [0.6, 0.97], ctxTag: 'bearish · BOS #1 on the 15M ✓', sched: [[T.case1, 4], [T.case1 + 1.6, 10]], ann: { c1: T.case1 + 1.2, lvl2: T.case1 + 1.4 } })));
        out += fade(c1k, pill(1460, 560, 'no close below → no BOS #2', C.pink, pop(t, T.stop1 - 0.4, 0.5), 20));
      }
      const c2k = pop(t, T.case2 - 0.2, 0.6);
      if (c2k > 0) {
        out += fade(c2k, seq(t, Object.assign({}, P1, { dir: 'bull', kind: 'nobos3', dom: [0.04, 0.6], ctxTag: 'bullish context', per: 0.1, sched: [[T.case2, 9], [T.case2 + 2.2, 15, 0.4]],
          ann: { c1: T.case2 + 0.3, bos2: T.case2 + 0.6, c2: T.case2 + 0.9, c2Out: T.case2 + 2, zone: T.case2 + 1.2, zoneOut: T.case2 + 2 }, noCandleTag: true })));
        out += fade(c2k, pill(1460, 470, 'no close above → no BOS #3', C.pink, pop(t, T.stop2 - 0.6, 0.5), 20));
        out += fade(c2k, pill(1020, 700, 'back in the zone ≠ a retest ✗', C.pink, pop(t, T.notRetest, 0.5), 20));
      }
      out += stamp(1480, 640, 'NO TRADE', C.pink, pop(t, T.stamp, 0.6), -8, 70, 24);
      out += pill(960, 1010, 'invalid or incomplete = no trade', DK.pink, pop(t, T.stamp + 0.6, 0.5), 24);
      return out;
    },
  });

  /* ================= Lesson m2-9: Missed Trades and No-Trade Decisions ================= */
  Object.assign(LIVE, {
    // BOS #3 throws the boomerang. If it comes back to the zone, that's the retest. If it flies off, you let it go.
    'sd4-boomerang': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const base = { x: 150, y: 450, w: 790, h: 500, n: 18, dir: 'bull', lab: 1070, per: 0.08, ctxTag: 'bullish context', panel: { x: 100, y: 390, w: 1100, h: 600 }, noCandleTag: true };
      out += fade(pop(t, T.chart - 0.1, 0.6), seq(t, Object.assign({}, base, { kind: 'valid', sched: [[T.chart, 11], [T.ret - 1.4, 15, 0.35]], per: 0.08,
        ann: { zone: T.chart + 0.7, bos3: T.chart + 1.1, active: T.chart + 1.3, retest: between(t, 0, T.throw2 - 0.2) > 0 ? T.ret + 0.2 : null },
        dimFrom: 12, dimAt: T.throw2 })));
      // The missed ending replaces it.
      if (t > T.throw2) out += seq(t, Object.assign({}, base, { panel: null, ctxTag: null, kind: 'missed', from: 12, sched: [[T.throw2 - 0.2, 11], [T.throw2 + 0.4, 17]], per: 0.6 }));
      out += pill(650, 1042, 'it came back: the retest ✓', C.gold, between(t, T.ret + 0.6, T.throw2 - 0.2), 24, C.dark);
      out += pill(650, 1042, 'never came back: a missed trade', C.pink, pop(t, T.missed, 0.5), 24);
      // Thrower.
      const P = { x: 1460, y: 1000, scale: 0.78, look: A.LOOKS.a, seed: 2, at: T.chart + 0.4, talk: ctx.talking && (t > T.missed) };
      const hx = 1540, hy = 740;
      let bx, by, held = false, rot = t * 900;
      const u1 = seg(t, T.throw1, T.ret + 0.4), u2 = seg(t, T.throw2, T.throw2 + 2.6);
      if (t < T.throw1 || (t > T.ret + 0.4 && t < T.throw2)) { bx = hx; by = hy; held = true; rot = -20; }
      else if (t < T.throw2) { bx = hx + Math.sin(Math.PI * u1) * 190 + Math.sin(2 * Math.PI * u1) * 40; by = hy - Math.sin(Math.PI * u1) * 300; }
      else { bx = hx + u2 * 700; by = hy - u2 * 520 - Math.sin(Math.PI * u2) * 60; }
      if (held) P.frontArm = aim(P, hx, hy + 10);
      else if (t < T.throw2 + 0.5 || (t > T.throw1 && t < T.throw1 + 0.5)) P.frontArm = { a1: -50, a2: -40 };
      if (t > T.missed) { P.frontArm = aim(P, hx - 30, hy + 70); P.mood = undefined; }
      out += who(t, P);
      if (bx < 1960 && by > -80 && t > T.chart + 0.4) out += rotAt(bx, by, rot, `<path d="M${bx - 40},${by + 8} L${bx},${by - 26} L${bx + 40},${by + 8} L${bx + 28},${by + 16} L${bx},${by - 6} L${bx - 28},${by + 16} Z" fill="${C.peach}" stroke="${DK.peach}" stroke-width="4" stroke-linejoin="round"/>`);
      out += pill(1500, 1046, 'BOS #3: off it goes', C.purple, between(t, T.throw1, T.ret - 0.4), 24);
      // The dog that wants to chase, held back.
      const dk = pop(t, T.missed - 0.2, 0.6);
      if (dk > 0) {
        const lean = seg(t, T.missed, T.missed + 0.5);
        const dx = 1640 + lean * 30;
        out += scaleAt(dx, 1000, dk, critter(t, 'dog', { x: dx, y: 1000, scale: 0.75, seed: 3, tongue: true }));
        out += `<path d="M${hx - 30},${hy + 70} Q${f1(dx - 20)},${f1(940 - lean * 20)} ${f1(dx + 40)},${f1(930)}" fill="none" stroke="${C.purple}" stroke-width="4" opacity="${dk.toFixed(2)}"/>`;
      }
      out += bub(1640, 600, 'Let it go 🐾', between(t, T.missed + 0.4, s.end), { size: 28 });
      out += pill(1500, 1046, 'DON’T CHASE', C.pink, pop(t, T.missed + 1, 0.5), 26);
      return out;
    },

    // Fog between the 1H swings, then the "stay out" board: four reasons, each a confident no-trade decision.
    'sd4-weather-board': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // 1H chart.
      const ck = pop(t, T.chart, 0.7);
      if (ck > 0) {
        let g = `<rect x="100" y="390" width="900" height="600" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(134, 438, '1H', 30, DK.teal, { a: 'start' })}`;
        out += scaleAt(550, 690, ck, g);
        const pts = [[160, 900], [260, 720], [330, 800], [450, 600], [520, 700], [610, 560], [680, 790], [740, 690], [800, 760], [850, 650], [900, 720]];
        // Fog between the swings (behind the path).
        const fk = seg(t, T.fog, T.fog + 1.2);
        if (fk > 0) {
          let fg = `<rect x="610" y="566" width="370" height="218" rx="12" fill="#CFC6C1" opacity=".35"/>`;
          [0, 1, 2].forEach(i => fg += `<g opacity=".55" transform="translate(${f1(700 + i * 110 + Math.sin(t * 0.8 + i) * 16)},${640 + (i % 2) * 70}) scale(.7)"><ellipse rx="70" ry="30" fill="#BDB2C9"/><ellipse cx="-40" cy="8" rx="44" ry="24" fill="#BDB2C9"/><ellipse cx="44" cy="6" rx="48" ry="26" fill="#BDB2C9"/></g>`);
          out += fade(fk, fg);
        }
        const pk = ease(seg(t, T.chart + 0.3, T.chart + 2));
        if (pk > 0) out += poly(partial(pts, pk), '#A08B80', 6);
        const lk = ease(seg(t, T.lines, T.lines + 0.8));
        if (lk > 0) {
          out += `<line x1="610" x2="${f1(lerp(610, 980, lk))}" y1="560" y2="560" stroke="${DK.teal}" stroke-width="5" stroke-dasharray="14 9"/><line x1="680" x2="${f1(lerp(680, 980, lk))}" y1="790" y2="790" stroke="${DK.pink}" stroke-width="5" stroke-dasharray="14 9"/>`;
          out += txt(980, 540, 'previous 1H swing high', 22, DK.teal, { a: 'end', op: lk }) + txt(980, 826, 'previous 1H swing low', 22, DK.pink, { a: 'end', op: lk });
        }
        if (pk >= 1) out += dot(900, 720, 12, C.purple, pop(t, T.chart + 2, 0.5)) + pill(900, 670, 'now', C.purple, pop(t, T.chart + 2.2, 0.5), 20);
        out += pill(550, 900, 'no meaningful directional confirmation', C.muted, pop(t, T.fog + 1.2, 0.5), 22);
        out += pill(550, 952, 'don’t force a trade', C.pink, pop(t, T.fog + 2.4, 0.5), 24);
      }
      // The board.
      const bk = pop(t, T.board, 0.7);
      let b = `<rect x="1070" y="390" width="760" height="420" rx="24" fill="${DK.purple}"/><rect x="1086" y="406" width="728" height="388" rx="16" fill="#FFF9F2"/>${txt(1450, 456, 'STAY OUT WHEN…', 26, C.muted, { ls: 3 })}`;
      out += scaleAt(1450, 810, bk, b);
      const rows = [['🌫️', 'Between the 1H swings', 'no confirmation'], ['🧩', 'Sequence incomplete', 'no BOS #2 or #3'], ['🧊', 'Zone invalidated', 'closed beyond'], ['🏃', 'No retest', 'missed · don’t chase']];
      rows.forEach(([ic, a, sub], i) => {
        const k = pop(t, T.rows[i], 0.5);
        if (k <= 0 || bk < 1) return;
        const y = 520 + i * 74;
        out += scaleAt(1130, y, k, `<text x="1130" y="${y + 12}" font-size="36" text-anchor="middle">${ic}</text>${txt(1180, y + 12, a, 30, C.text, { a: 'start', f: 'Playfair Display', w: 700 })}${txt(1790, y + 10, sub, 20, C.muted, { a: 'end', w: 700 })}`);
        if (i < 3) out += `<line x1="1110" x2="1790" y1="${y + 40}" y2="${y + 40}" stroke="#EFE3DA" stroke-width="3" opacity="${clamp(k).toFixed(2)}"/>`;
      });
      // Calm trader with tea.
      const tr = { x: 1250, y: 1000, scale: 0.52, look: A.LOOKS.b, seed: 3, at: T.board + 0.3, talk: ctx.talking && t > T.calm };
      tr.frontArm = { a1: -110, a2: -170 };
      tr.hold = `<g transform="translate(0,-6)"><rect x="-14" y="-24" width="28" height="30" rx="6" fill="#fff" stroke="${C.peach}" stroke-width="4"/><path d="M14,-16 q12,0 12,10 q0,10 -12,10" fill="none" stroke="${C.peach}" stroke-width="4"/></g>`;
      out += who(t, tr);
      out += crit(t, 'cat', { x: 1390, y: 1000, scale: 0.6, seed: 2, sleep: true, at: T.calm });
      out += pill(1640, 900, 'no trade = a decision ✓', DK.purple, pop(t, T.calm, 0.6), 26);
      out += flash(1640, 900, T.calm, t);
      return out;
    },
  });

  /* ================= Lesson m2-10: Full Strategy Walkthrough ================= */
  Object.assign(LIVE, {
    // A relay: HTF ICC hands the direction to the 15M, the 15M hands it to the 5M, and the 5M builds the rest.
    'sd4-relay-race': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Track.
      out += `<rect x="0" y="900" width="1920" height="100" fill="#F2C9B4"/>` + [925, 950, 975].map(y => `<line x1="0" x2="1920" y1="${y}" y2="${y}" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('');
      // The HTF story (before the 15M takes over).
      [['4H', 'Bearish · upper half · correcting'], ['1H', 'Bearish · reacting from a lower high'], ['HTF ICC', 'Bearish Indication · correcting']]
        .forEach(([a, b], i) => out += card(400, 420 + i * 100, 1120, 80, a, b, [C.purple, DK.pink, DK.purple][i], between(t, T.story + 0.6 + i * 0.6, T.r15 - 0.5, 0.6)));
      // 15M panel.
      const p15 = pop(t, T.r15, 0.6);
      if (p15 > 0) out += scaleAt(380, 570, p15, m15(t, { dir: 'bear', x: 170, y: 460, w: 380, h: 250, t0: T.r15 - 0.2, per: 0.12, bosAt: T.bos1, panel: { x: 120, y: 380, w: 520, h: 400 } }));
      // 5M panel.
      const p5 = pop(t, T.r5, 0.6);
      const o = { x: 730, y: 470, w: 800, h: 290, n: 18, dir: 'bear', kind: 'valid', lab: 1660, per: 0.2, noCandleTag: false,
        sched: [[T.r5 + 0.2, 4], [T.bos2 - 0.8, 7], [T.c2, 9], [T.bos3 - 0.6, 11], [T.retest - 1.4, 15]],
        ann: { c1: T.c1, bos2: T.bos2, c2: T.c2 + 0.4, zone: T.zone, zoneOut: T.bos3 - 0.2, bos3: T.bos3, active: T.bos3 + 0.4, retest: T.retest },
        panel: { x: 680, y: 380, w: 1140, h: 410 } };
      if (p5 > 0) out += scaleAt(1250, 585, p5, seq(t, o));
      // Correction #1 never creates the zone.
      if (p5 >= 1) out += cross(800, 520, between(t, T.noZone, T.c2 - 0.2), C.pink, 24);
      out += pill(1340, 1046, 'Correction #1 never creates the zone', C.pink, between(t, T.noZone, T.c2 - 0.2), 24);
      out += pill(1340, 1046, 'Correction #2 does: its last bullish candle', DK.peach, between(t, T.c2 + 0.2, T.bos3 - 0.2), 24);
      out += pill(1340, 1046, 'BOS #3 activates it · then wait for the retest', C.purple, between(t, T.bos3 + 0.2, s.end), 24);
      // Counters along the 5M panel header.
      if (p5 >= 1) {
        const nB = (t > T.bos1 ? 1 : 0) + (t > T.bos2 ? 1 : 0) + (t > T.bos3 ? 1 : 0), nC = (t > T.c1 ? 1 : 0) + (t > T.c2 ? 1 : 0);
        [['BREAKS ' + nB + '/3', nB === 3], ['CORRECTIONS ' + nC + '/2', nC === 2], ['ZONE ' + (t > T.zone ? 1 : 0) + '/1', t > T.zone], ['RETEST ' + (t > T.retest ? 1 : 0) + '/1', t > T.retest]]
          .forEach(([lab, done], i) => out += pill(900 + i * 225, 420, lab, done ? DK.teal : '#B9A89E', 1, 18));
      }
      // Runners.
      const runner = (x0, x1, a, b, look, name, at, seed, hold) => {
        const k = ease(seg(t, a, b));
        const r = { x: lerp(x0, x1, k), y: 1000, scale: 0.46, look, seed, at, walking: k > 0 && k < 1 };
        if (hold) { r.frontArm = { a1: -20, a2: -30 }; r.hold = `<rect x="-6" y="-30" width="14" height="44" rx="6" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>`; }
        return who(t, r) + pill(r.x, 826, name, look.shirt === C.purple ? DK.purple : C.muted, pop(t, at + 0.3, 0.5), 18);
      };
      out += runner(140, 470, T.story + 0.4, T.r15 - 0.4, A.LOOKS.a, 'HTF ICC', T.story, 2, t < T.r15);
      out += runner(560, 900, T.r15 + 0.2, T.r5 - 0.2, A.LOOKS.b, '15M', T.story + 0.4, 4, t >= T.r15 && t < T.r5);
      out += runner(990, 1560, T.r5 + 0.2, T.retest, A.LOOKS.c, '5M', T.story + 0.8, 6, t >= T.r5);
      out += pill(320, 1046, 'direction: bearish ↓', DK.pink, pop(t, T.story + 1.2, 0.5), 22);
      return out;
    },

    // Two other endings (missed, invalid), then the practice gym: the Zone Builder and the Execution Lab.
    'sd4-practice-gym': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const ck = between(t, T.charts, T.gym - 0.4, 0.6);
      if (ck > 0) {
        const mk = (x, kind, at, title) => seq(t, { x: x + 40, y: 470, w: 500, h: 360, n: 18, dir: 'bull', kind, lab: x + 650, per: 0.06, noCandleTag: true, fs: 20,
          sched: [[T.charts, 12], [at, 17, 0.5]], ann: { zone: T.charts + 0.6, bos3: T.charts + 0.9, active: T.charts + 1.1, invalid: kind === 'invalid' ? at + 1.5 : null, invalidOut: at + 4 },
          panel: { x, y: 390, w: 820, h: 520 }, title });
        let g = mk(110, 'missed', T.a, 'Chart A · 5M') + mk(990, 'invalid', T.b, 'Chart B · 5M');
        g += pill(520, 960, 'never came back · missed', C.pink, pop(t, T.a + 2.6, 0.5), 22);
        g += pill(1400, 960, 'closed below the zone · invalid', C.pink, pop(t, T.b + 2.2, 0.5), 22);
        g += stamp(740, 800, 'NO TRADE', C.pink, pop(t, T.both, 0.6), -8, 80, 26) + stamp(1620, 800, 'NO TRADE', C.pink, pop(t, T.both + 0.4, 0.6), 8, 80, 26);
        out += fade(ck, g);
      }
      // The practice gym.
      const gk = pop(t, T.gym, 0.8);
      if (gk > 0) {
        let g = `<rect x="80" y="380" width="1760" height="620" rx="30" fill="#FFF6EE"/><rect x="80" y="900" width="1760" height="100" fill="#F3E3D3"/>`;
        for (let x = 140; x < 1840; x += 120) g += `<rect x="${x}" y="900" width="60" height="100" fill="#EBD5C2" opacity=".6"/>`;
        out += scaleAt(960, 1000, gk, g);
        // Station 1: the Zone Builder.
        const z = pop(t, T.zb, 0.6);
        out += scaleAt(560, 900, z, `<rect x="300" y="430" width="520" height="110" rx="18" fill="${DK.teal}"/>${txt(560, 480, 'THE ZONE BUILDER', 30, '#fff', { ls: 2 })}${txt(560, 520, 'Correction #2 · zone candle · still valid?', 22, '#fff', { w: 700 })}
          <rect x="360" y="580" width="400" height="230" rx="16" fill="#fff" stroke="${DK.teal}" stroke-width="5"/>
          <rect x="420" y="700" width="300" height="40" fill="${C.tealL}" opacity=".7" stroke="${DK.teal}" stroke-width="3" stroke-dasharray="10 7"/>
          ${[[440, 640, 700, 1], [490, 660, 720, 0], [540, 690, 735, 0], [590, 650, 700, 1], [640, 610, 660, 1], [690, 600, 640, 1]].map(([x, y0, y1, up]) => `<rect x="${x - 12}" y="${y0}" width="24" height="${y1 - y0}" rx="3" fill="${up ? C.teal : C.pink}"/>`).join('')}
          <rect x="420" y="820" width="280" height="80" rx="10" fill="#B8835A"/>`);
        // Station 2: the Execution Lab.
        const e = pop(t, T.el, 0.6);
        out += scaleAt(1360, 900, e, `<rect x="1100" y="430" width="520" height="110" rx="18" fill="${C.purple}"/>${txt(1360, 480, 'THE EXECUTION LAB', 30, '#fff', { ls: 2 })}${txt(1360, 520, 'HTF story → every step → entry or no trade', 22, '#fff', { w: 700 })}
          <rect x="1160" y="580" width="400" height="230" rx="16" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
          <path d="M1190,760 L1250,700 L1290,730 L1360,640 L1400,680 L1460,620" fill="none" stroke="${DK.teal}" stroke-width="6" stroke-linejoin="round"/>
          <rect x="1190" y="770" width="140" height="30" rx="15" fill="${DK.teal}"/>${txt(1260, 791, 'ENTRY', 18, '#fff')}<rect x="1360" y="770" width="170" height="30" rx="15" fill="${C.pink}"/>${txt(1445, 791, 'NO TRADE', 18, '#fff')}
          <rect x="1220" y="820" width="280" height="80" rx="10" fill="#B8835A"/>`);
        // Students.
        const s1 = { x: 230, y: 1000, scale: 0.62, look: A.LOOKS.e, seed: 2, at: T.zb + 0.3, hat: 'cap', talk: ctx.talking && t > T.zb && t < T.el };
        s1.frontArm = aim(s1, 400, 760);
        const s2 = { x: 1700, y: 1000, scale: 0.62, look: A.LOOKS.b, seed: 5, flip: true, at: T.el + 0.3, talk: ctx.talking && t > T.el };
        s2.frontArm = aim(s2, 1540, 780);
        out += who(t, s1) + who(t, s2);
        out += pill(960, 1046, 'practise until it’s automatic ✓', C.gold, pop(t, T.el + 1.6, 0.6), 26, C.dark);
        out += flash(960, 1046, T.el + 1.6, t);
      }
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
