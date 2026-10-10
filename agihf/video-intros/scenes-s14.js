/**
 * scenes-s14.js: illustrated scene types for Section 14 lesson intro videos
 * (Phase 5 · Section 14: Making the Timeframes Work Together, Lessons 25 to 27).
 * Lessons 28 to 30 live in scenes-s14b.js.
 *
 * The flow: 4H read the room → 1H build the map → 15M checkpoint (recommended, not required) → 1M execute.
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

  // Standard kicker + swapping headlines.
  const TYPES = ['room-doors', 'story-chapters', 'map-carry', 'scenario-bus', 'bridge-checkpoint', 'wick-visit'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s14-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson 25: 4H: Read the Room ================= */
  Object.assign(LIVE, {
    // The 4H range is a room: the external swing high is the top door, the external swing low the bottom door.
    // Everything inside is furniture. Price ("now") sits in the lower area.
    's14-room-doors': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const X0 = 560, X1 = 1440, CEIL = 440, FLOOR = 920;
      // The room (cutaway house).
      const rk = pop(t, T.room, 0.8);
      let room = `<rect x="${X0}" y="${CEIL}" width="${X1 - X0}" height="${FLOOR - CEIL}" fill="#FFF6EE"/>`;
      for (let x = X0 + 40; x < X1 - 20; x += 90) room += `<rect x="${x}" y="${CEIL}" width="34" height="${FLOOR - CEIL}" fill="#FBEBDF"/>`;
      room += `<rect x="${X0 - 20}" y="${FLOOR + 30}" width="${X1 - X0 + 40}" height="${1000 - FLOOR - 30}" fill="#E7C9A5"/>
        <rect x="${X0 - 20}" y="${CEIL - 30}" width="20" height="${FLOOR - CEIL + 60}" fill="${DK.purple}"/><rect x="${X1}" y="${CEIL - 30}" width="20" height="${FLOOR - CEIL + 60}" fill="${DK.purple}"/>
        <rect x="${X0 - 34}" y="${CEIL - 34}" width="${X1 - X0 + 68}" height="34" rx="10" fill="${C.purple}"/>
        <rect x="${X0 - 34}" y="${FLOOR}" width="${X1 - X0 + 68}" height="34" rx="10" fill="${C.purple}"/>`;
      out += scaleAt(1000, 1000, rk, room);
      // Furniture (faint, behind the price path).
      const fk = pop(t, T.furn, 0.6);
      out += fade(fk * 0.75, scaleAt(1040, FLOOR, fk, `<rect x="950" y="836" width="200" height="60" rx="18" fill="${C.pinkL}"/><rect x="936" y="816" width="40" height="90" rx="16" fill="${C.pink}"/><rect x="1124" y="816" width="40" height="90" rx="16" fill="${C.pink}"/>
        <rect x="960" y="806" width="180" height="50" rx="16" fill="${C.pink}"/><rect x="964" y="896" width="12" height="24" fill="${C.muted}"/><rect x="1124" y="896" width="12" height="24" fill="${C.muted}"/>`)
        + scaleAt(626, FLOOR, fk, `<path d="M600,920 L606,872 L646,872 L652,920 Z" fill="${C.peach}"/>${[-30, 0, 30].map(a => `<ellipse cx="${626 + a * 0.6}" cy="842" rx="12" ry="34" transform="rotate(${a} 626 870)" fill="${C.teal}"/>`).join('')}`)
        + scaleAt(1176, FLOOR, fk, `<rect x="1172" y="760" width="8" height="160" fill="${C.muted}"/><path d="M1146,764 L1206,764 L1192,724 L1160,724 Z" fill="${C.gold}"/><ellipse cx="1176" cy="918" rx="26" ry="6" fill="${C.muted}"/>`));
      // Doors (hatches) in the ceiling and floor.
      const door = (x, y, k, open) => {
        if (k <= 0) return '';
        const glow = open > 0 ? `<rect x="${x - 70}" y="${y - 10}" width="140" height="54" rx="12" fill="${C.gold}" opacity="${0.3 * open}"/>` : '';
        return scaleAt(x, y + 17, k, `${glow}<rect x="${x - 56}" y="${y + 2}" width="112" height="30" rx="6" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/><circle cx="${x + 34}" cy="${y + 17}" r="6" fill="#9B6A45"/><line x1="${x - 40}" y1="${y + 17}" x2="${x + 20}" y2="${y + 17}" stroke="#C98A1F" stroke-width="3"/>`);
      };
      out += door(1090, CEIL - 34, pop(t, T.room + 0.5, 0.5), seg(t, T.top, T.top + 0.5));
      out += door(760, FLOOR, pop(t, T.room + 0.6, 0.5), seg(t, T.bottom, T.bottom + 0.5));
      // Price path: from the external low (floor) to the external high (ceiling), then pulling back.
      const pts = [[600, 700], [760, 918], [880, 700], [930, 760], [1090, 442], [1180, 600], [1225, 565], [1320, 800]];
      const pk = ease(seg(t, T.frame, T.frame + 3.2));
      if (pk > 0) out += poly(partial(pts, pk), DK.teal, 7);
      // Middle of the room (shown with "now").
      const mk = ease(seg(t, T.now, T.now + 0.8));
      if (mk > 0) out += `<line x1="${X0 + 14}" x2="${lerp(X0 + 14, X1 - 14, mk)}" y1="680" y2="680" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 10" opacity=".7"/>${txt(X0 + 20, 668, 'middle', 20, C.muted, { a: 'start', w: 700, op: mk })}`;
      // Door labels.
      const tk = pop(t, T.top, 0.6), bk = pop(t, T.bottom, 0.6);
      if (tk > 0) out += scaleAt(1090, CEIL - 54, tk, txt(1090, CEIL - 52, 'TOP DOOR', 24, DK.peach, { ls: 3 }));
      out += pill(790, 482, 'EXTERNAL HIGH · 21,040', C.purple, tk, 22);
      if (t > T.top) out += A.sparkle(1090, CEIL - 17, T.top, t);
      if (bk > 0) out += scaleAt(760, 984, bk, txt(760, 986, 'BOTTOM DOOR', 24, DK.peach, { ls: 3 }));
      out += pill(1120, 978, 'EXTERNAL LOW · 20,610', C.purple, bk, 22);
      if (t > T.bottom) out += A.sparkle(760, FLOOR + 17, T.bottom, t);
      // Furniture vs doors.
      out += pill(740, 1042, 'everything inside = furniture', DK.peach, pop(t, T.furn + 0.3, 0.6), 24);
      out += pill(1260, 1042, 'the doors are what matter', C.purple, pop(t, T.furn + 1.2, 0.6), 24);
      // Now marker.
      const nk = pop(t, T.now, 0.6);
      if (nk > 0) {
        const pulse = 1 + Math.sin(t * 5) * 0.12;
        out += `<circle cx="1320" cy="800" r="${f1(26 * pulse * nk)}" fill="${C.pink}" opacity=".25"/>` + dot(1320, 800, 13, C.pink, nk);
        out += pill(1310, 852, 'now · lower area', C.pink, pop(t, T.now + 0.4, 0.6), 22);
      }
      // A signpost and the reader at the doorway.
      out += scaleAt(1680, 1000, pop(t, T.room + 0.8, 0.6), `<rect x="1672" y="640" width="16" height="360" fill="#9B6A45"/><rect x="1560" y="540" width="240" height="120" rx="16" fill="${C.dark}"/>${txt(1680, 594, '4H CHART', 28, C.gold, { ls: 2 })}${txt(1680, 636, 'the room', 28, '#fff', { f: 'Playfair Display', w: 700 })}`);
      const rd = { x: 350, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 3, at: T.room + 0.2, talk: ctx.talking && t > T.now };
      if (t > T.top && t < T.furn) rd.frontArm = aim(rd, 520, 640);
      out += who(t, rd);
      out += bub(330, 600, 'Read the room first 👀', between(t, T.room + 0.6, T.frame + 1.4), { size: 26 });
      out += bub(330, 600, 'Lower area. Noted. 📝', between(t, T.now + 1, s.end), { size: 26 });
      return out;
    },

    // Structure from the swings (one red candle doesn't change it), then the 4H ICC story: which chapter are we in?
    's14-story-chapters': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // 4H chart panel.
      const ck = pop(t, T.chart, 0.7);
      out += scaleAt(520, 680, ck, `<rect x="120" y="400" width="800" height="560" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(160, 448, '4H', 30, C.purple, { a: 'start' })}`);
      const pts = [[170, 820], [330, 600], [440, 760], [620, 470], [720, 600], [760, 560], [850, 680]];
      const pk = ease(seg(t, T.chart + 0.4, T.chart + 2.4));
      if (pk > 0) out += poly(partial(pts, pk), '#A08B80', 6);
      // Prior high level.
      const phk = ease(seg(t, T.chart + 2.4, T.chart + 3));
      if (phk > 0) out += `<line x1="330" x2="${lerp(330, 660, phk)}" y1="600" y2="600" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 8"/>`;
      out += pill(330, 565, 'Prior high', C.muted, pop(t, T.chart + 2.4, 0.5), 22);
      // ICC colouring of the legs.
      const ik = ease(seg(t, T.ch[0], T.ch[0] + 0.8));
      if (ik > 0) out += poly(partial([[440, 760], [620, 470]], ik), C.teal, 11);
      const rk = ease(seg(t, T.ch[1], T.ch[1] + 0.9));
      if (rk > 0) out += poly(partial([[620, 470], [720, 600], [760, 560], [850, 680]], rk), C.gold, 9, { dash: '16 12' });
      // Swing labels.
      out += pill(440, 805, 'Higher low', DK.teal, pop(t, T.hh, 0.5), 22);
      out += pill(720, 450, 'Higher high', DK.teal, pop(t, T.hh + 0.6, 0.5), 22);
      out += pill(430, 512, 'INDICATION', DK.teal, pop(t, T.ch[0] + 0.3, 0.5), 22);
      out += pill(770, 760, 'CORRECTION', DK.peach, pop(t, T.ch[1] + 0.3, 0.5), 22);
      if (pk >= 1) out += dot(850, 680, 11, C.pink, pop(t, T.chart + 2.4, 0.5));
      out += pill(520, 910, 'BULLISH · higher highs + higher lows', DK.teal, between(t, T.hh + 1.2, T.bully - 0.2), 22);
      out += pill(520, 910, 'one candle isn’t structure', C.pink, between(t, T.swings, T.book - 0.2), 22);
      // The big red candle tries to flip the story.
      const bly = between(t, T.bully, T.book - 0.3);
      if (bly > 0) out += scaleAt(812, 940, bly, cdl(t, { x: 812, y: 940, h: 140, w: 74, col: C.pink, wu: 24, seed: 5, arms: t < T.swings ? 'up' : undefined, mood: t > T.swings + 0.4 ? 'sad' : 'wow' }));
      out += bub(1080, 620, 'Bearish now? 😈', between(t, T.bully + 0.3, T.swings + 0.2), { size: 28 });
      // The reader.
      const rd = { x: 1010, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 4, at: T.chart + 0.3, flip: t < T.book, talk: ctx.talking && t > T.swings - 0.2 && t < T.book };
      if (t > T.swings && t < T.book) rd.frontArm = { a1: -150 + Math.sin(t * 6) * 5, a2: -120 };
      if (t > T.ch[0] && t < T.ctx) rd.frontArm = aim(rd, 1130, 680);
      out += who(t, rd);
      out += bub(1290, 640, 'Still bullish. Read the swings ✋', between(t, T.swings, T.book - 0.2), { size: 26 });
      // The ICC storybook.
      const bk = pop(t, T.book, 0.7);
      const rows = [['Indication', 590], ['Correction', 700], ['Continuation', 810]];
      let b = `<rect x="1110" y="430" width="720" height="480" rx="24" fill="${DK.purple}"/><rect x="1128" y="448" width="684" height="444" rx="16" fill="#FFF9F2"/>
        ${txt(1470, 506, 'THE 4H ICC STORY', 24, C.muted, { ls: 3 })}`;
      rows.forEach(([lab, y], i) => {
        b += `<circle cx="1196" cy="${y}" r="30" fill="${[C.tealL, C.peachL, C.purpleL][i]}"/>${txt(1196, y + 10, i + 1, 28, [DK.teal, DK.peach, DK.purple][i])}
          ${txt(1246, y + 11, lab, 34, C.text, { a: 'start', f: 'Playfair Display', w: 700 })}`;
        if (i < 2) b += `<line x1="1160" x2="1780" y1="${y + 55}" y2="${y + 55}" stroke="#EFE3DA" stroke-width="3"/>`;
      });
      out += scaleAt(1470, 910, bk, b);
      if (bk > 0) {
        out += check(1560, 590, pop(t, T.ch[0], 0.5), C.teal, 24) + pill(1690, 590, 'happened', DK.teal, pop(t, T.ch[0] + 0.2, 0.5), 22);
        const rb = ease(seg(t, T.ch[1], T.ch[1] + 0.6));
        if (rb > 0) out += `<path d="M1780,430 L1780,${lerp(430, 726, rb)} L1796,${lerp(430, 712, rb)} L1812,${lerp(430, 726, rb)} L1812,430 Z" fill="${C.pink}"/>`;
        out += pill(1640, 700, 'you are here', C.pink, pop(t, T.ch[1] + 0.3, 0.5), 22);
        out += pill(1660, 810, 'not yet', C.muted, pop(t, T.ch[2], 0.5), 22);
      }
      out += pill(1470, 952, 'context, not an entry ✓', DK.purple, pop(t, T.ctx, 0.6), 26);
      if (t > T.ctx) out += A.sparkle(1470, 952, T.ctx, t);
      return out;
    },
  });

  /* ================= Lesson 26: 1H: Build the Map ================= */
  Object.assign(LIVE, {
    // A mapmaker carries the 4H read down and unrolls it as the frame of the 1H map, then inks only the main roads.
    's14-map-carry': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const MX0 = 440, MX1 = 1520, MY0 = 410, MY1 = 960, HI = 470, LO = 905;
      // Map unrolls from the left.
      const uk = ease(seg(t, T.unroll, T.unroll + 1.2));
      if (uk > 0) {
        let m = `<rect x="${MX0}" y="${MY0}" width="${MX1 - MX0}" height="${MY1 - MY0}" rx="16" fill="#FBF1DC" stroke="#E0C79A" stroke-width="6"/>`;
        for (let x = MX0 + 90; x < MX1; x += 90) m += `<line x1="${x}" x2="${x}" y1="${MY0 + 8}" y2="${MY1 - 8}" stroke="#F0E2C4" stroke-width="2"/>`;
        for (let y = MY0 + 90; y < MY1; y += 90) m += `<line x1="${MX0 + 8}" x2="${MX1 - 8}" y1="${y}" y2="${y}" stroke="#F0E2C4" stroke-width="2"/>`;
        m += `<line x1="${MX0 + 20}" x2="${MX1 - 20}" y1="${HI}" y2="${HI}" stroke="${C.purple}" stroke-width="7"/><line x1="${MX0 + 20}" x2="${MX1 - 20}" y1="${LO}" y2="${LO}" stroke="${C.purple}" stroke-width="7"/>`;
        out += `<g transform="translate(${MX0},0) scale(${uk.toFixed(3)},1) translate(${-MX0},0)">${m}</g>`;
        if (uk < 1) out += `<rect x="${MX0 + (MX1 - MX0) * uk - 20}" y="${MY0 - 10}" width="40" height="${MY1 - MY0 + 20}" rx="20" fill="#EAD3A8" stroke="#C9A86E" stroke-width="4"/>`;
        out += pill(640, HI, '4H SWING HIGH', C.purple, pop(t, T.unroll + 1.1, 0.5), 22);
        out += pill(640, LO, '4H SWING LOW', C.purple, pop(t, T.unroll + 1.3, 0.5), 22);
      }
      // What else comes with you.
      const notes = [['4H STRUCTURE', 'bullish', DK.teal], ['4H LEVELS', 'marked', C.purple], ['HTF ICC PHASE', 'correction', DK.peach]];
      notes.forEach(([a, b, col], i) => out += sticky(1720, 470 + i * 120, 300, 92, a, b, col, pop(t, T.notes[i], 0.5), [-3, 2, -2][i]));
      // The 1H road: bearish swings (lower highs, lower lows) with small internal wiggles inside each leg.
      const M = [[520, 560], [600, 700], [680, 620], [780, 770], [880, 670], [990, 830], [1140, 700], [1270, 800]];
      const W = [M[0]];
      for (let i = 1; i < M.length; i++) {
        const a = M[i - 1], b = M[i];
        W.push([lerp(a[0], b[0], 0.42), lerp(a[1], b[1], 0.58)], [lerp(a[0], b[0], 0.6), lerp(a[1], b[1], 0.4)], b);
      }
      const rdk = ease(seg(t, T.road, T.road + 1.6));
      const mainK = ease(seg(t, T.main, T.main + 1.2));
      if (rdk > 0) {
        const pp = partial(W, rdk);
        out += poly(pp, '#D9C3A0', 20, { op: 1 - mainK * 0.55 }) + poly(pp, '#fff', 3, { dash: '10 10', op: 1 - mainK * 0.55 });
      }
      if (mainK > 0) out += poly(partial(M, mainK), C.teal, 12);
      out += pill(740, 856, 'small wiggles = internal moves', C.muted, pop(t, T.main + 1, 0.5), 22);
      // Pins on the previous 1H swing high and swing low.
      const pin = (x, y, col, k) => k <= 0 ? '' : scaleAt(x, y, k, `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 50}" stroke="${C.dark}" stroke-width="4"/><circle cx="${x}" cy="${y - 58}" r="16" fill="${col}" stroke="#fff" stroke-width="4"/>`);
      out += pin(1140, 700, C.teal, pop(t, T.pins[0], 0.5)) + pill(1140, 610, 'PREVIOUS 1H SWING HIGH', DK.teal, pop(t, T.pins[0] + 0.2, 0.5), 20);
      out += pin(990, 830, C.pink, pop(t, T.pins[1], 0.5)) + pill(1140, 868, 'PREVIOUS 1H SWING LOW', DK.pink, pop(t, T.pins[1] + 0.2, 0.5), 20);
      // Price now, just above the swing low.
      out += dot(1270, 800, 12, C.purple, pop(t, T.pins[1] + 0.8, 0.5)) + pill(1340, 800, 'now', C.purple, pop(t, T.pins[1] + 1, 0.5), 20);
      // A tiny internal high doesn't make the map.
      const nk = pop(t, T.not, 0.5);
      if (nk > 0) {
        const w = W[17];
        out += fade(1 - seg(t, T.not + 1.4, T.not + 2) * 0.6, pin(w[0], w[1], C.gold, nk)) + cross(w[0] + 40, w[1] - 70, pop(t, T.not + 0.8, 0.5), C.pink, 22);
        out += pill(1160, 520, 'not every high is a level', C.pink, pop(t, T.not + 1, 0.5), 22);
      }
      // Mapmaker carries the rolled-up 4H read in.
      const wk = ease(seg(t, T.walk, T.walk + 2.2));
      const mm = { x: lerp(-90, 260, wk), y: 1000, scale: 0.92, look: A.LOOKS.c, seed: 2, walking: wk > 0 && wk < 1, hat: 'cap', talk: ctx.talking && (t < T.unroll + 1 || t > T.main) };
      if (t < T.unroll) mm.hold = `<g transform="rotate(-20)"><rect x="-70" y="-26" width="140" height="40" rx="20" fill="#EAD3A8" stroke="#C9A86E" stroke-width="4"/>${txt(0, 4, '4H READ', 20, DK.purple)}</g>`;
      else mm.frontArm = t < T.road ? aim(mm, 440, 680) : aim(mm, 420, 760);
      out += who(t, mm);
      out += bub(250, 600, 'Don’t start over! 🗺️', between(t, T.walk + 1, T.unroll + 2.2), { size: 26 });
      out += bub(250, 600, 'Main roads only.', between(t, T.main + 0.4, s.end), { size: 26 });
      return out;
    },

    // Three scenario cards (how the 1H relates to the 4H), then the bus: if price already broke your first level, don't chase it.
    's14-scenario-bus': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const arrow = (cx, cy, up, col, len, w) => {
        const d = up ? -1 : 1, hy = cy + d * len / 2, ty = cy - d * len / 2;
        return `<path d="M${cx - w / 2},${ty} L${cx + w / 2},${ty} L${cx + w / 2},${hy - d * w * 0.9} L${cx + w},${hy - d * w * 0.9} L${cx},${hy} L${cx - w},${hy - d * w * 0.9} L${cx - w / 2},${hy - d * w * 0.9} Z" fill="${col}"/>`;
      };
      const zig = (cx, cy, up, col) => {
        const d = up ? -1 : 1;
        const pts = [[cx - 60, cy - d * 80], [cx - 25, cy - d * 10], [cx - 5, cy - d * 40], [cx + 30, cy + d * 40], [cx + 50, cy + d * 10], [cx + 70, cy + d * 70]];
        const e = pts[5], p = pts[4], a = Math.atan2(e[1] - p[1], e[0] - p[0]);
        const hd = `<path d="M${f1(e[0] + Math.cos(a) * 18)},${f1(e[1] + Math.sin(a) * 18)} L${f1(e[0] + Math.cos(a + 2.3) * 22)},${f1(e[1] + Math.sin(a + 2.3) * 22)} L${f1(e[0] + Math.cos(a - 2.3) * 22)},${f1(e[1] + Math.sin(a - 2.3) * 22)} Z" fill="${col}"/>`;
        return poly(pts, col, 9) + hd;
      };
      const cards = [['SCENARIO A', true, true, 'both support bullish'], ['SCENARIO B', true, false, 'correcting, or changing?'], ['SCENARIO C', false, true, 'a countertrend move?']];
      cards.forEach(([name, h4, h1, cap], i) => {
        const k = between(t, T.cards[i], T.bus - 0.5, 0.6);
        if (k <= 0) return;
        const cx = 400 + i * 560;
        let g = `<rect x="${cx - 240}" y="420" width="480" height="440" rx="26" fill="#fff" stroke="${i === 0 ? C.tealL : i === 1 ? C.peachL : C.pinkL}" stroke-width="5"/>
          ${txt(cx, 470, name, 24, C.muted, { ls: 3 })}
          ${arrow(cx - 100, 640, h4, h4 ? C.tealL : C.pinkL, 230, 64)}${txt(cx - 100, 790, '4H', 30, h4 ? DK.teal : DK.pink)}
          ${zig(cx + 90, 640, h1, h1 ? DK.teal : DK.pink)}${txt(cx + 90, 790, '1H', 30, h1 ? DK.teal : DK.pink)}
          ${txt(cx, 838, cap, 26, C.text, { w: 800 })}`;
        out += scaleAt(cx, 860, k, g);
      });
      // Owl interpreter under the cards.
      const ow = between(t, T.cards[0] + 0.4, T.bus - 0.5, 0.6);
      if (ow > 0) out += scaleAt(960, 1000, ow, critter(t, 'owl', { x: 960, y: 1000, scale: 0.75, seed: 3, monocle: true, talk: ctx.talking }));
      // The bus route: first level, then the next level (a 4H swing).
      if (t > T.bus - 0.6) {
        const rk = ease(seg(t, T.bus - 0.6, T.bus));
        out += fade(rk, A.road(900, { h: 100, shift: -t * 40 }));
        const stop = (x, top, sub, col, k) => k <= 0 ? '' : scaleAt(x, 900, k, `<rect x="${x - 7}" y="640" width="14" height="260" fill="${C.muted}"/><rect x="${x - 150}" y="540" width="300" height="110" rx="16" fill="${col}"/>
          ${txt(x, 584, top, 24, '#fff', { ls: 2 })}${txt(x, 626, sub, 28, '#fff', { f: 'Playfair Display', w: 700 })}<circle cx="${x}" cy="540" r="18" fill="#fff" stroke="${col}" stroke-width="5"/>${txt(x, 548, 'B', 20, col)}`);
        out += stop(520, 'FIRST LEVEL', '1H swing low', DK.teal, pop(t, T.bus - 0.4, 0.6));
        out += stop(1580, 'NEXT LEVEL', '4H swing low', C.purple, pop(t, T.next, 0.6));
        out += pill(520, 690, 'already broken', C.pink, pop(t, T.bus + 1.2, 0.5), 22);
      }
      // The traveller: runs after it, stops, then walks calmly to the next level and observes.
      const run = ease(seg(t, T.chase, T.chase + 1.4));
      const walk = ease(seg(t, T.next + 0.3, T.next + 3.2));
      const tv = { x: t < T.next ? lerp(420, 760, run) : lerp(760, 1720, walk), y: 1000, scale: 0.9, look: A.LOOKS.b, seed: 6, at: T.bus - 0.3,
        walking: (run > 0 && run < 1) || (walk > 0 && walk < 1), mood: t > T.chase + 1.4 && t < T.next ? 'sad' : undefined, talk: ctx.talking && t > T.chase && t < T.chase + 1.5 };
      if (t > T.chase && t < T.chase + 1.4) tv.frontArm = { a1: -30, a2: -40 };
      if (walk >= 1) {
        tv.flip = true;
        tv.frontArm = { a1: -110, a2: -170 };
        tv.hold = `<g transform="translate(-6,-4)"><rect x="-26" y="-14" width="22" height="26" rx="8" fill="${C.dark}"/><rect x="4" y="-14" width="22" height="26" rx="8" fill="${C.dark}"/><rect x="-6" y="-8" width="12" height="10" fill="${C.dark}"/></g>`;
      }
      // The bus ("price") speeds past the first stop, then slows as it heads toward the next level.
      if (t > T.bus) {
        const u = t - T.bus;
        const bx = u < 1.6 ? lerp(-260, 860, ease(u / 1.6)) : 860 + Math.min(1, (u - 1.6) / 8) * 300;
        out += A.vehicle('bus', { x: bx, y: 990, dist: bx, t, moving: true, plate: 'PRICE', scale: 0.9 });
        if (u < 2) out += [0, 1, 2].map(i => `<rect x="${f1(bx - 230 - i * 50)}" y="${860 + i * 24}" width="${40 - i * 8}" height="6" rx="3" fill="${C.muted}" opacity=".5"/>`).join('');
      }
      out += who(t, tv);
      out += bub(760, 600, 'Wait for me! 🏃‍♀️', between(t, T.chase + 0.2, T.chase + 1.6), { size: 26 });
      out += cross(860, 640, between(t, T.chase + 1.5, T.next + 0.2), C.pink, 30);
      out += pill(760, 470, 'DON’T CHASE', C.pink, between(t, T.chase + 1.6, s.end), 28);
      out += bub(1810, 470, 'Watching 👀', between(t, T.done, s.end), { size: 26 });
      out += pill(1240, 405, 'observe it for a qualified Dayli ICC setup', C.purple, pop(t, T.done + 0.6, 0.6), 22);
      return out;
    },
  });

  /* ================= Lesson 27: The 15M Checkpoint ================= */
  Object.assign(LIVE, {
    // A bridge from the HTF story to execution, with a 15M checkpoint booth in the middle (recommended, not required).
    's14-bridge-checkpoint': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="900" width="1920" height="180" fill="${C.tealL}" opacity=".7"/>`;
      let wv = 'M0,912';
      for (let x = 0; x <= 1920; x += 40) wv += ` L${x},${(912 + Math.sin(x / 60 + t * 1.8) * 5).toFixed(1)}`;
      out += `<path d="${wv} L1920,1080 L0,1080 Z" fill="${C.teal}" opacity=".45"/>`;
      const DECK = 820;
      // Cliffs.
      const ck = ease(seg(t, T.bridge, T.bridge + 0.8));
      out += `<path d="M0,${lerp(1080, DECK, ck)} L360,${lerp(1080, DECK, ck)} L400,1080 L0,1080 Z" fill="#E7C9A5"/><path d="M1920,${lerp(1080, DECK, ck)} L1560,${lerp(1080, DECK, ck)} L1520,1080 L1920,1080 Z" fill="#E7C9A5"/>`;
      if (ck > 0.5) out += `<rect x="0" y="${DECK - 6}" width="364" height="10" fill="#D4AE84"/><rect x="1556" y="${DECK - 6}" width="364" height="10" fill="#D4AE84"/>`;
      // Bridge deck + rails draw across.
      const bk = ease(seg(t, T.bridge + 0.5, T.bridge + 1.8));
      if (bk > 0) {
        const xe = lerp(360, 1560, bk);
        out += `<rect x="360" y="${DECK - 6}" width="${f1(xe - 360)}" height="26" fill="#B8835A"/><rect x="360" y="${DECK - 70}" width="${f1(xe - 360)}" height="8" rx="4" fill="#9B6A45"/>`;
        for (let x = 380; x < xe; x += 60) out += `<rect x="${x}" y="${DECK - 70}" width="8" height="66" fill="#9B6A45"/>`;
      }
      // Cliff signs.
      const sign = (x, top, sub, col, k) => k <= 0 ? '' : scaleAt(x, DECK, k, `<rect x="${x - 6}" y="${DECK - 130}" width="12" height="130" fill="#9B6A45"/><rect x="${x - 140}" y="${DECK - 250}" width="280" height="124" rx="16" fill="${col}"/>
        ${txt(x, DECK - 202, top, 26, '#fff', { ls: 2 })}${txt(x, DECK - 154, sub, 30, '#fff', { f: 'Playfair Display', w: 700 })}`);
      out += sign(180, 'THE STORY', '4H + 1H', C.purple, pop(t, T.bridge + 0.6, 0.6));
      out += sign(1740, 'EXECUTION', '1M', DK.pink, pop(t, T.bridge + 0.9, 0.6));
      // Checkpoint booth.
      const boothK = pop(t, T.bridge + 1.6, 0.7);
      out += scaleAt(960, DECK, boothK, `<rect x="850" y="660" width="220" height="160" rx="10" fill="#FFF6EE" stroke="${DK.peach}" stroke-width="5"/><path d="M830,668 L960,630 L1090,668 Z" fill="${C.peach}"/>
        <rect x="900" y="690" width="120" height="70" rx="8" fill="#E8F8F6" stroke="${DK.peach}" stroke-width="4"/>
        <rect x="860" y="772" width="200" height="36" rx="8" fill="${DK.peach}"/>${txt(960, 798, '15M CHECKPOINT', 17, '#fff')}`);
      if (boothK > 0) out += critter(t, 'owl', { x: 960, y: 760, scale: 0.55, seed: 4, monocle: true });
      // Barrier arm (raised: you may pass).
      if (boothK > 0) out += rotAt(1070, 790, -20 - seg(t, T.carry + 2, T.carry + 3) * 40, `<rect x="1070" y="784" width="160" height="12" rx="6" fill="${C.pink}"/><rect x="1110" y="784" width="20" height="12" fill="#fff"/><rect x="1170" y="784" width="20" height="12" fill="#fff"/>`);
      out += pill(960, 870, 'recommended · not required', DK.peach, pop(t, T.sign, 0.6), 26);
      out += pill(960, 930, 'extra confluence ✨', C.purple, pop(t, T.sign + 0.7, 0.6), 24);
      // The 15M screen above the booth: 4H and 1H levels stay, 15M candles step down toward the 1H level.
      const sk = pop(t, T.screen, 0.7);
      if (sk > 0) {
        const SX = 560, SY = 370, SW = 800, SH = 250;
        let sc = `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="18" fill="#fff" stroke="${DK.peach}" stroke-width="5"/><line x1="960" y1="${SY + SH}" x2="960" y2="630" stroke="${C.muted}" stroke-width="6"/>
          ${txt(SX + 22, SY + 36, '15M', 24, DK.peach, { a: 'start' })}`;
        out += scaleAt(960, 630, sk, sc);
        const Y = v => SY + 20 + (1 - v) * (SH - 40);
        const lk1 = ease(seg(t, T.screen + 0.4, T.screen + 1.2)), lk2 = ease(seg(t, T.screen + 0.9, T.screen + 1.7));
        if (lk1 > 0) out += `<line x1="${SX + 20}" x2="${lerp(SX + 20, SX + SW - 20, lk1)}" y1="${Y(0.02)}" y2="${Y(0.02)}" stroke="${C.purple}" stroke-width="5"/>${txt(SX + SW - 24, Y(0.02) - 8, '4H level', 18, C.purple, { a: 'end', op: lk1 })}`;
        if (lk2 > 0) out += `<line x1="${SX + 20}" x2="${lerp(SX + 20, SX + SW - 20, lk2)}" y1="${Y(0.2)}" y2="${Y(0.2)}" stroke="${DK.teal}" stroke-width="5"/>${txt(SX + SW - 24, Y(0.2) - 8, '1H level', 18, DK.teal, { a: 'end', op: lk2 })}`;
        const bars = [[.86, .80, .90, .78], [.80, .70, .81, .68], [.70, .75, .78, .69], [.75, .62, .76, .60], [.62, .53, .63, .51], [.53, .58, .61, .52], [.58, .46, .59, .44], [.46, .36, .47, .34], [.36, .30, .38, .27]];
        out += chart(t, { x: SX + 90, y: SY + 20, w: SW - 300, h: SH - 40, bars, t0: T.approach, per: 0.32, panel: false, maxBody: 30, wick: 4 });
      }
      // Traveller carries the 4H and 1H level flags onto the bridge.
      const wk = ease(seg(t, T.carry, T.carry + 2.4));
      const tv = { x: lerp(380, 440, wk), y: DECK, scale: 0.68, look: A.LOOKS.e, seed: 5, at: T.bridge + 1, walking: wk > 0 && wk < 1, talk: ctx.talking && t > T.carry + 2.4 && t < T.approach };
      tv.frontArm = { a1: -60, a2: -95 };
      tv.hold = `<g><rect x="-5" y="-190" width="10" height="230" fill="#9B6A45"/><path d="M5,-188 L125,-166 L5,-144 Z" fill="${C.purple}"/>${txt(46, -156, '4H', 26, '#fff')}<path d="M5,-136 L125,-114 L5,-92 Z" fill="${DK.teal}"/>${txt(46, -104, '1H', 26, '#fff')}</g>`;
      out += who(t, tv);
      // The three questions as price nears the level.
      [['directional?', DK.teal], ['correcting?', DK.peach], ['structure changing?', DK.pink]].forEach(([q, col], i) => out += pill(1640, 404 + i * 60, q, col, pop(t, T.qs[i], 0.5), 26));
      return out;
    },

    // Wick vs body: a wick can visit, a body close beyond the level is the BOS. Then a 15M shift is info, not an override, and the 1M door.
    's14-wick-visit': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const p1 = between(t, T.chart, T.shift - 0.4, 0.7);
      // Bullish BOS chart.
      if (p1 > 0) {
        const o = { x: 200, y: 440, w: 600, h: 440 };
        const Y = v => o.y + o.h - v * o.h;
        let g = `<rect x="140" y="400" width="800" height="560" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(170, 450, '15M', 28, DK.peach, { a: 'start' })}`;
        const lk = ease(seg(t, T.level, T.level + 0.8));
        if (lk > 0) g += `<line x1="180" x2="${lerp(180, 910, lk)}" y1="${Y(0.62)}" y2="${Y(0.62)}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 9"/>${txt(190, Y(0.62) - 16, 'previous 15M swing high', 20, C.purple, { a: 'start', op: lk })}`;
        const bars = [[.30, .40, .42, .28], [.40, .52, .54, .39], [.52, .60, .62, .50], [.60, .50, .61, .48], [.50, .44, .51, .40], [.44, .54, .56, .43], [.54, .58, .70, .53], [.58, .52, .60, .50], [.52, .74, .76, .51]];
        g += chart(t, Object.assign({}, o, { bars, panel: false, times: [0, 1, 2, 3, 4, 5].map(i => T.chart + 0.3 + i * 0.2).concat([T.wick, T.wick + 1, T.body]), maxBody: 36,
          tags: [{ i: 6, text: 'wick only ✗', col: C.pink, at: T.wick + 0.6, off: 30 }, { i: 8, text: 'body close · BOS ✓', col: DK.teal, at: T.body + 0.5, off: 60 }] }));
        out += scaleAt(540, 680, p1, g);
      }
      // Bearish example (inset).
      const p2 = between(t, T.bear, T.shift - 0.4, 0.6);
      if (p2 > 0) {
        const o = { x: 1030, y: 460, w: 320, h: 160 };
        const Y = v => o.y + o.h - v * o.h;
        let g = `<rect x="990" y="400" width="400" height="270" rx="22" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(1190, 436, 'BEARISH BOS', 20, DK.pink, { ls: 2 })}
          <line x1="1010" x2="1370" y1="${Y(0.4)}" y2="${Y(0.4)}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="12 8"/>${txt(1012, Y(0.4) + 26, 'previous swing low', 17, C.purple, { a: 'start' })}`;
        g += chart(t, Object.assign({}, o, { bars: [[.75, .62, .78, .60], [.62, .48, .64, .40], [.48, .58, .62, .46], [.58, .20, .60, .14]], panel: false, times: [T.bear + 0.2, T.bear + 0.4, T.bear + 0.6, T.bear + 1.2], maxBody: 34, wick: 4 }));
        g += txt(1190, 652, 'body closes below ✓', 20, DK.pink);
        out += scaleAt(1190, 670, p2, g);
      }
      // The doorway: a wick pokes in and leaves; a body steps in and stays.
      const dk = between(t, T.chart + 0.5, T.shift - 0.4, 0.7);
      if (dk > 0) {
        let d = `<rect x="1560" y="560" width="320" height="440" fill="#FFF6EE" stroke="${C.purple}" stroke-width="6"/><path d="M1540,570 L1720,470 L1900,570 Z" fill="${C.purple}"/>
          <rect x="1650" y="760" width="140" height="240" fill="#F3E3D3"/><rect x="1630" y="996" width="180" height="10" fill="${C.purple}"/>${txt(1720, 620, 'BEYOND THE LEVEL', 20, DK.purple, { ls: 1 })}`;
        // Door leaf (open while someone is in the doorway).
        const open = Math.max(seg(t, T.wick - 0.2, T.wick + 0.3) * (1 - seg(t, T.wick + 2, T.wick + 2.4)), seg(t, T.body - 0.2, T.body + 0.3) * (1 - seg(t, T.body + 2.6, T.body + 3)));
        d += `<path d="M1650,760 L${f1(1650 + 140 * (1 - open * 0.75))},${f1(760 + open * 20)} L${f1(1650 + 140 * (1 - open * 0.75))},${f1(1000 - open * 20)} L1650,1000 Z" fill="${C.peach}" stroke="${DK.peach}" stroke-width="4"/>`;
        out += scaleAt(1720, 1000, dk, d);
        // Candle A: only its wick reaches in, then it goes home.
        const aIn = seg(t, T.wick, T.wick + 0.8) * (1 - seg(t, T.wick + 1.6, T.wick + 2.4));
        if (t > T.wick - 0.2 && t < T.wick + 2.6) out += cdl(t, { x: lerp(1460, 1560, aIn), y: 1000, h: 110, w: 64, col: C.teal, wu: 70, seed: 3, lean: aIn * 14, walking: aIn > 0 && aIn < 1 });
        out += bub(1480, 722, 'Just visiting 👋', between(t, T.wick + 0.6, T.wick + 2.2), { size: 24 });
        // Candle B: walks all the way in.
        const bIn = ease(seg(t, T.body, T.body + 1.6));
        if (t > T.body - 0.2 && bIn < 1) out += cdl(t, { x: lerp(1460, 1720, bIn), y: 1000, h: 130, w: 70, col: C.teal, wu: 20, seed: 7, walking: bIn < 1, arms: 'cheer' });
                out += pill(1720, 1046, 'body closed beyond = BOS', DK.teal, between(t, T.body + 1.4, T.shift - 0.4), 22);
        out += pill(1450, 1046, 'a wick can visit', C.pink, between(t, T.wick + 1.6, T.body + 1.2), 22);
      }
      // Phase 2: a 15M shift is useful information, not an override.
      const q = between(t, T.shift, s.end + 1, 0.7);
      if (q > 0) {
        const o = { x: 200, y: 450, w: 620, h: 420 };
        const Y = v => o.y + o.h - v * o.h;
        let g = `<rect x="140" y="400" width="800" height="560" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(170, 450, '15M', 28, DK.peach, { a: 'start' })}
          <line x1="180" x2="910" y1="${Y(0.2)}" y2="${Y(0.2)}" stroke="${DK.teal}" stroke-width="6"/>${txt(910, Y(0.2) + 32, 'your 1H level', 20, DK.teal, { a: 'end' })}`;
        const lk = ease(seg(t, T.shift + 1.6, T.shift + 2.2));
        if (lk > 0) g += `<line x1="540" x2="${lerp(540, 910, lk)}" y1="${Y(0.52)}" y2="${Y(0.52)}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="12 8"/>${txt(548, Y(0.52) - 34, 'last lower high', 20, C.muted, { a: 'start', op: lk })}`;
        const bars = [[.84, .74, .86, .72], [.74, .64, .75, .62], [.64, .70, .72, .63], [.70, .52, .71, .50], [.52, .42, .53, .40], [.42, .50, .52, .41], [.50, .34, .51, .30], [.34, .28, .36, .24], [.28, .42, .44, .27], [.42, .60, .62, .41]];
        g += chart(t, Object.assign({}, o, { bars, panel: false, times: bars.map((b, i) => i < 9 ? T.shift + 0.2 + i * 0.16 : T.shift + 2.4), maxBody: 34,
          tags: [{ i: 9, text: '15M may be shifting', col: DK.teal, at: T.shift + 2.8, off: 40, fs: 20 }] }));
        out += scaleAt(540, 680, q, g);
      }
      // Context plaques (1H, 4H) stand while the 15M shift is noted.
      const pk = between(t, T.shift + 0.4, T.ready - 0.3, 0.6);
      if (pk > 0) {
        const plaque = (y, tf, sub, col) => `<rect x="1080" y="${y}" width="560" height="110" rx="20" fill="#fff" stroke="${col}" stroke-width="5"/><rect x="1080" y="${y}" width="130" height="110" rx="20" fill="${col}"/>${txt(1145, y + 70, tf, 40, '#fff')}${txt(1425, y + 66, sub, 28, C.text, { w: 800 })}`;
        out += scaleAt(1360, 700, pk, plaque(450, '1H', 'not confirmed yet', DK.teal) + plaque(590, '4H', 'context still stands', C.purple));
      }
      out += pill(1360, 780, 'useful information, not an override', DK.purple, between(t, T.shift + 3.2, T.ready - 0.3), 24);
      // Notetaker.
      const nt = { x: 1780, y: 1000, scale: 0.85, look: A.LOOKS.d, seed: 2, flip: true, at: T.shift + 0.6, talk: ctx.talking && t > T.shift + 3 && t < T.ready };
      if (t < T.ready) { nt.frontArm = { a1: 150, a2: -150 }; nt.hold = `<g transform="rotate(10)"><rect x="-30" y="-40" width="56" height="70" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="4"/><rect x="-20" y="-24" width="36" height="5" fill="${C.purpleL}"/><rect x="-20" y="-12" width="30" height="5" fill="${C.purpleL}"/></g>`; }
      // Ready: the 1M door opens when price is at a level you marked.
      const rk = pop(t, T.ready, 0.7);
      if (rk > 0) {
        const op = ease(seg(t, T.gate, T.gate + 0.8));
        let g = `<rect x="1180" y="470" width="300" height="530" rx="20" fill="${C.purple}"/><rect x="1206" y="530" width="248" height="470" fill="#FFF3C4"/>
          ${txt(1330, 512, '1M', 34, '#fff', { ls: 4 })}
          <path d="M1206,530 L${f1(1206 + 248 * (1 - op * 0.7))},${f1(530 + op * 30)} L${f1(1206 + 248 * (1 - op * 0.7))},${f1(1000 - op * 30)} L1206,1000 Z" fill="${DK.purple}"/>`;
        out += scaleAt(1330, 1000, rk, g);
        if (op > 0.3) out += fade(op, `<path d="M1260,1000 L1400,1000 L1460,540 L1300,540 Z" fill="${C.gold}" opacity=".18"/>`);
      }
      out += pill(1180, 1046, 'price approaching or reacting to a marked level ✓', DK.teal, pop(t, T.ready + 0.6, 0.6), 22);
      out += pill(1720, 1046, 'not forcing it ✓', DK.purple, pop(t, T.ready + 1.4, 0.6), 22);
      if (t > T.ready) {
        const wk = ease(seg(t, T.gate + 0.4, T.gate + 2.4));
        nt.x = lerp(1780, 1520, wk); nt.walking = wk > 0 && wk < 1; nt.flip = true;
      }
      out += who(t, nt);
      out += bub(1640, 560, 'Noted 📝', between(t, T.shift + 3.4, T.ready - 0.3), { size: 26, tail: 'right' });
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
