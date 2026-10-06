/**
 * scenes-s13.js: illustrated scene types for Section 13 lesson intro videos
 * (Phase 5 · Section 13: The Dayli ICC 1-Minute Entry Model™, Lessons 11 to 24).
 *
 * The model: PIL → Indication → Correction → Continuation → Retest → Entry.
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

  // Standard kicker + swapping headlines.
  const TYPES = ['scout-audition', 'passport-stamps', 'steel-beam', 'decor-reject', 'lineup', 'trail-map', 'bouncer-door', 'oven-timer',
    'runup', 'crayon', 'traffic-light', 'bobber', 'dance-steps', 'combo-lock', 'boomerang', 'carousel', 'checkout', 'train-platform',
    'elevator', 'fridge-cards', 'deli-ticket', 'weigh-dial', 'courtroom', 'five-shelves', 'sandcastle', 'lab-notebook', 'decision-tree', 'postcard-gate'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s13-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson 11: What Is the Dayli ICC 1M Entry Model? ================= */
  Object.assign(LIVE, {
    // A talent scout (the HTF analysis) gets interested; the 1M audition stage decides if price earned it.
    's13-scout-audition': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Corkboard of analysis cards.
      const bk = pop(t, T.board, 0.7);
      let b = `<rect x="246" y="860" width="18" height="140" fill="${C.muted}"/><rect x="556" y="860" width="18" height="140" fill="${C.muted}"/>
        <rect x="160" y="420" width="500" height="450" rx="24" fill="#E7C9A5" stroke="#9B6A45" stroke-width="8"/>`;
      const cards = [['4H', 'READ THE ROOM', C.purple], ['1H', 'BUILD THE MAP', C.teal], ['HTF ICC', 'READ THE STORY', C.peach]];
      cards.forEach(([tf, lab, col], i) => {
        const k = pop(t, T.cards[i], 0.5);
        if (k <= 0) return;
        const y = 470 + i * 130, rot = [-2, 1.5, -1][i];
        b += scaleAt(410, y + 45, k, rotAt(410, y + 45, rot, `<rect x="195" y="${y}" width="430" height="96" rx="16" fill="#fff"/><rect x="195" y="${y}" width="150" height="96" rx="16" fill="${col}"/>
          ${txt(270, y + 60, tf, tf.length > 3 ? 30 : 40, '#fff')}${txt(485, y + 58, lab, 26, C.dark)}<circle cx="410" cy="${y + 8}" r="9" fill="${C.pink}"/>`));
      });
      out += scaleAt(410, 1000, bk, b);
      // Scout with binoculars.
      const sc = { x: 790, y: 1000, scale: 0.92, look: A.LOOKS.b, flip: true, seed: 4, at: T.board + 0.3, talk: ctx.talking && t < T.walk, hat: 'cap' };
      sc.frontArm = t > T.interest && t < T.stage ? { a1: -150 + Math.sin(t * 6) * 6, a2: -120 } : aim(sc, 650, 640);
      out += who(t, sc);
      out += bub(840, 560, 'Interesting! 👀', between(t, T.interest, T.walk + 1.5), { size: 30 });
      // Arrow towards the stage.
      const ak = ease(seg(t, T.stage - 0.2, T.stage + 0.6));
      if (ak > 0) out += `<path d="M900,640 L${900 + 150 * ak},640" stroke="${C.muted}" stroke-width="6" stroke-dasharray="12 10"/>${ak > 0.9 ? `<path d="M1050,622 L1080,640 L1050,658 Z" fill="${C.muted}"/>` : ''}`;
      // The 1M stage.
      const stk = pop(t, T.stage, 0.7);
      let st = `<rect x="1110" y="930" width="720" height="70" fill="${DK.purple}"/><rect x="1110" y="914" width="720" height="22" rx="6" fill="${C.purple}"/>
        <rect x="1110" y="400" width="720" height="44" rx="10" fill="${C.pink}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${1110 + i * 90},444 q45,40 90,0" fill="${C.pinkL}"/>`).join('')}
        <path d="M1110,444 L1190,444 Q1170,700 1200,914 L1110,914 Z" fill="${C.pink}"/><path d="M1830,444 L1750,444 Q1770,700 1740,914 L1830,914 Z" fill="${C.pink}"/>
        ${txt(1470, 432, '1M EXECUTION STAGE', 24, '#fff', { ls: 2 })}`;
      out += scaleAt(1470, 1000, stk, st);
      // Spotlight once the question is asked.
      const sp = seg(t, T.ask, T.ask + 0.6);
      if (sp > 0) out += `<path d="M1440,450 L1500,450 L1560,914 L1320,914 Z" fill="${C.gold}" opacity="${0.22 * sp}"/>`;
      // Candle performer walks on.
      if (t > T.walk) {
        const wk = ease(seg(t, T.walk, T.walk + 2.6));
        out += cdl(t, { x: lerp(1160, 1440, wk), y: 916, h: 130, col: C.teal, wu: 30, seed: 2, walking: wk < 1, arms: wk >= 1 && t < T.ask ? 'wave' : undefined, mood: t > T.ask + 0.6 && t < T.split ? 'wow' : undefined });
      }
      // Owl judge at a little desk.
      const jk = pop(t, T.stage + 0.6, 0.6);
      out += scaleAt(1690, 914, jk, `<rect x="1610" y="800" width="170" height="114" rx="10" fill="#9B6A45"/><rect x="1600" y="790" width="190" height="20" rx="8" fill="#C98A5B"/>`
        + critter(t, 'owl', { x: 1690, y: 795, scale: 0.85, seed: 5, talk: ctx.talking && t > T.ask && t < T.ask + 3 })
        + `<g transform="translate(1770,${700 + Math.sin(t * 2) * 4})"><rect x="0" y="0" width="8" height="80" fill="${C.muted}"/><rect x="-36" y="-50" width="80" height="56" rx="10" fill="#fff" stroke="${C.purple}" stroke-width="4"/>${txt(4, -12, '1M', 28, C.purple)}</g>`);
      out += bub(1470, 520, 'Has price earned my entry?', between(t, T.ask, s.end, 0.5), { size: 30 });
      // Payoff labels.
      out += pill(410, 1040, 'analysis = interest 👀', C.peach, pop(t, T.split, 0.6), 26);
      out += pill(1470, 1040, 'execution = earned entry', C.purple, pop(t, T.split + 0.6, 0.6), 26);
      if (t > T.split + 0.6) out += A.sparkle(1440, 700, T.split + 0.6, t);
      return out;
    },

    // A customs officer stamps a six-step passport, in order. No skipping.
    's13-passport-stamps': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const bk = pop(t, T.book, 0.8);
      const steps = [['PIL', 'What level matters?', C.purple], ['I', 'Closed through it?', DK.teal], ['C', 'Closed back through?', DK.pink],
        ['C', 'Closed back again?', DK.teal], ['RETEST', 'Back at the PIL?', DK.peach], ['ENTRY', 'Opportunity arrived?', DK.purple]];
      let b = `<rect x="190" y="420" width="1120" height="540" rx="30" fill="${DK.purple}"/>
        <path d="M210,436 L740,436 Q750,436 750,446 L750,936 L210,936 Z" fill="#FFF9F2"/><path d="M770,446 Q770,436 780,436 L1290,436 L1290,936 L770,936 Z" fill="#FFF9F2"/>
        <rect x="748" y="436" width="24" height="500" fill="#EADFD8"/>
        ${txt(480, 478, 'DAYLI ICC · 1M', 22, C.muted, { ls: 3 })}${txt(1030, 478, 'ENTRY VISA', 22, C.muted, { ls: 3 })}`;
      steps.forEach(([lab, q], i) => {
        const col = i < 3 ? 0 : 1, row = i % 3;
        const cx = 300 + col * 560, cy = 570 + row * 140;
        b += `<circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="#E2D6CC" stroke-width="4" stroke-dasharray="8 8"/>${txt(cx, cy + 9, i + 1, 26, '#D4C4B8')}
          ${txt(cx + 80, cy + 10, q, 28, C.text, { a: 'start', w: 700 })}`;
      });
      out += scaleAt(750, 960, bk, b);
      steps.forEach(([lab, , col], i) => {
        const cx = 300 + (i < 3 ? 0 : 560), cy = 570 + (i % 3) * 140;
        out += stamp(cx, cy, lab, col, ease(seg(t, T.stamps[i], T.stamps[i] + 0.25)), [-12, 8, -6, 10, -8, 6][i], 58, lab.length > 3 ? 21 : 34);
        if (t > T.stamps[i] + 0.2) out += A.sparkle(cx, cy, T.stamps[i] + 0.2, t);
      });
      // Booth and officer.
      const ob = { x: 1560, y: 1000, scale: 1.08, look: A.LOOKS.a, flip: true, seed: 3, at: T.book + 0.4, hat: 'cap', talk: ctx.talking && Math.abs(t - T.skip - 2) < 1.4 };
      const lastStamp = T.stamps.filter(x => t >= x).pop();
      const thump = lastStamp != null ? Math.max(0, 1 - (t - lastStamp) / 0.35) : 0;
      ob.frontArm = { a1: -70 + thump * 60, a2: -100 + thump * 70 };
      ob.hold = `<g transform="rotate(${-10})"><rect x="-8" y="-50" width="16" height="44" rx="6" fill="#9B6A45"/><circle cx="0" cy="-54" r="14" fill="#9B6A45"/><rect x="-26" y="-8" width="52" height="20" rx="5" fill="${C.pink}"/></g>`;
      out += who(t, ob);
      out += scaleAt(1560, 1000, pop(t, T.book + 0.2, 0.6), `<rect x="1400" y="860" width="320" height="140" rx="14" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="6"/>${txt(1560, 924, 'CUSTOMS', 30, DK.teal, { ls: 3 })}${txt(1560, 964, 'one step at a time', 22, DK.teal, { w: 700 })}`);
      // Candle traveller tries to skip.
      out += candy(t, { x: 1810, y: 1000, h: 110, w: 64, col: C.peach, wu: 22, seed: 7, at: T.book + 0.8, arms: Math.abs(t - T.skip - 0.6) < 1.2 ? 'up' : undefined, mood: t > T.skip + 1.8 && t < T.skip + 3.4 ? 'sad' : undefined });
      out += bub(1700, 640, 'Skip to ENTRY? 😅', between(t, T.skip, T.skip + 1.7), { size: 28, tail: 'right' });
      out += bub(1500, 600, 'In order! ✋', between(t, T.skip + 1.9, T.skip + 3.6), { size: 30 });
      // Motto ribbon.
      const mk = pop(t, T.motto, 0.7);
      if (mk > 0) out += scaleAt(960, 1030, mk, `<path d="M300,1006 L1620,1006 L1650,1030 L1620,1054 L300,1054 L270,1030 Z" fill="${C.pink}"/>${txt(960, 1040, 'STOP ANTICIPATING THE MOVE. MAKE PRICE PROVE EVERY STEP.', 28, '#fff', { ls: 1 })}`);
      return out;
    },
  });

  /* ================= Lesson 12: The Pre-Indication Level ================= */
  Object.assign(LIVE, {
    // A crane can only set the PIL beam on a real structural pillar (the swing), not in mid-air.
    's13-steel-beam': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EFE6DC');
      const cols = [[380, 650], [580, 520], [780, 760], [980, 830], [1180, 700]];
      cols.forEach(([x, top], i) => {
        const k = ease(seg(t, T.pillars + i * 0.35, T.pillars + i * 0.35 + 0.7));
        if (k <= 0) return;
        const y = lerp(1000, top, k);
        let g = `<rect x="${x - 26}" y="${y}" width="52" height="${1000 - y}" fill="${C.muted}"/>`;
        for (let yy = y + 20; yy < 990; yy += 60) g += `<path d="M${x - 22},${yy} L${x + 22},${yy + 40} M${x + 22},${yy} L${x - 22},${yy + 40}" stroke="#9C8277" stroke-width="5"/>`;
        out += g + `<rect x="${x - 36}" y="${y - 10}" width="72" height="16" rx="5" fill="${DK.purple}"/>`;
      });
      // The price path over the pillar tops.
      const pk = ease(seg(t, T.pillars + 2, T.pillars + 3.4));
      if (pk > 0) {
        const pts = [[300, 820], ...cols.map(([x, y]) => [x, y - 14]), [1330, 600]];
        const d = 'M' + pts.map(p => p.join(',')).join(' L');
        out += `<path d="${d}" fill="none" stroke="${C.teal}" stroke-width="7" stroke-linejoin="round" stroke-dasharray="${(2400 * pk).toFixed(0)} 3000" opacity=".8"/>`;
        out += pill(580, 466, 'swing high', DK.teal, between(t, T.pillars + 3.2, T.place), 22);
      }
      // Crane.
      const ck = pop(t, T.crane, 0.8);
      const trolley = t < T.place ? lerp(1440, 900, ease(seg(t, T.crane + 0.4, T.float))) : lerp(900, 580, ease(seg(t, T.place, T.place + 1.4)));
      let hookY = t < T.fall ? lerp(470, 600, ease(seg(t, T.crane + 0.4, T.float))) : t < T.place ? lerp(600, 470, ease(seg(t, T.fall + 0.6, T.place))) : lerp(470, 510, ease(seg(t, T.place + 1.4, T.place + 2.2)));
      const wob = t > T.fall && t < T.fall + 1.4 ? Math.sin(t * 18) * 10 * (1 - seg(t, T.fall, T.fall + 1.4)) : 0;
      if (ck > 0) {
        let cr = `<rect x="1660" y="420" width="44" height="580" fill="${C.gold}"/>`;
        for (let yy = 430; yy < 990; yy += 50) cr += `<path d="M1664,${yy} L1700,${yy + 46} M1700,${yy} L1664,${yy + 46}" stroke="#C98A1F" stroke-width="4"/>`;
        cr += `<rect x="520" y="400" width="1300" height="26" rx="6" fill="${C.gold}"/><rect x="1700" y="430" width="110" height="70" rx="10" fill="${DK.peach}"/><rect x="1730" y="444" width="50" height="34" rx="6" fill="#E8F8F6"/>`;
        out += fade(ck, cr);
        // Cable + beam.
        const bx = trolley + wob, by = hookY;
        out += fade(ck, `<rect x="${trolley - 24}" y="418" width="48" height="22" rx="6" fill="${C.dark}"/><line x1="${trolley}" y1="440" x2="${bx}" y2="${by - 30}" stroke="${C.dark}" stroke-width="4"/>
          <path d="M${bx - 60},${by - 4} L${bx},${by - 34} L${bx + 60},${by - 4}" stroke="${C.dark}" stroke-width="3" fill="none"/>
          <rect x="${bx - 150}" y="${by - 6}" width="300" height="28" rx="5" fill="${C.purple}"/>${txt(bx, by + 17, 'PIL', 22, '#fff', { ls: 4 })}`);
      }
      // Mid-air attempt fails.
      out += bub(900, 700, 'Here? Looks nice ✨', between(t, T.float + 0.1, T.fall + 0.3), { size: 28 });
      out += cross(1060, 600, between(t, T.fall, T.place), C.pink, 30);
      out += pill(900, 720, 'nothing holds it up', C.pink, between(t, T.fall + 0.4, T.place), 24);
      // Placed on the swing.
      if (t > T.bolt) {
        out += check(760, 500, pop(t, T.bolt, 0.6), C.teal, 30) + A.sparkle(580, 510, T.bolt, t);
        const lk = ease(seg(t, T.line, T.line + 1.2));
        out += `<line x1="740" y1="514" x2="${740 + 760 * lk}" y2="514" stroke="${C.purple}" stroke-width="6" stroke-dasharray="16 10"/>`;
        out += pill(1240, 470, 'price must prove itself through this', C.purple, pop(t, T.line + 1, 0.6), 24);
      }
      // Builder and owl inspector.
      const bd = { x: 1520, y: 1000, scale: 0.92, look: A.LOOKS.c, flip: true, seed: 6, at: T.crane, hat: 'hard', talk: ctx.talking && t > T.float && t < T.place };
      bd.frontArm = t < T.place ? { a1: -40 + Math.sin(t * 3) * 6, a2: -60 } : aim(bd, 1360, 640);
      out += who(t, bd);
      out += crit(t, 'owl', { x: 210, y: 1000, scale: 0.9, seed: 3, at: T.pillars + 0.5, monocle: true, talk: ctx.talking && t > T.fall && t < T.place + 1 });
      out += bub(330, 700, 'Structure first!', between(t, T.fall + 1.2, T.line), { size: 28 });
      return out;
    },

    // A decorator hangs pretty lines on the chart; the inspector cat rejects each one. Only the swing is the PIL.
    's13-decor-reject': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const bars = [[.26, .42, .44, .24], [.42, .6, .62, .41], [.6, .72, .8, .58], [.72, .6, .74, .58], [.6, .5, .62, .47], [.5, .4, .52, .36], [.4, .47, .5, .38], [.47, .43, .5, .41]];
      const cg = { x: 300, y: 470, w: 780, h: 420, bars, t0: T.frame + 0.3, per: 0.18, maxBody: 46 };
      const fk = pop(t, T.frame, 0.7);
      out += scaleAt(690, 680, fk, `<rect x="230" y="400" width="920" height="560" rx="18" fill="#C98A5B"/><rect x="250" y="420" width="880" height="520" rx="10" fill="#fff"/>`);
      if (fk > 0) out += chart(t, Object.assign({ panel: false }, cg));
      const { Y } = geo(cg);
      const fakes = [['candle high', .52, C.peach], ['FVG edge', .64, C.teal], ['the nearest line', .45, C.pinkL], ['looks pretty ✨', .3, C.pink]];
      fakes.forEach(([lab, v, col], i) => {
        const at = T.items[i], xk = at + 2.2;
        if (t < at) return;
        const nx = i < 3 ? T.items[i + 1] : T.real, k = ease(seg(t, at, at + 0.8)), drop = ease(seg(t, nx - 0.3, nx + 0.6));
        if (drop >= 1) return;
        const y = Y(v) + drop * 300, sag = 18;
        let g = `<path d="M270,${y} Q${270 + 420 * k},${y + sag} ${270 + 840 * k},${y}" stroke="${col}" stroke-width="6" fill="none"/>`;
        for (let j = 0; j < 12 * k; j++) { const x = 300 + j * 68, yy = y + Math.sin(j / 12 * Math.PI) * sag * 0.9; g += `<path d="M${x},${yy} L${x + 24},${yy} L${x + 12},${yy + 26} Z" fill="${[C.pink, C.peach, C.purple, C.teal][j % 4]}"/>`; }
        g += pill(690, y - 30, lab, col === C.pinkL ? DK.pink : col, pop(t, at + 0.5), 22);
        g += cross(1090, y, pop(t, xk, 0.5), C.pink, 26);
        out += `<g opacity="${1 - drop}">${g}</g>`;
      });
      // The real PIL.
      if (t > T.real) {
        const k = ease(seg(t, T.real, T.real + 1));
        out += `<line x1="270" x2="${270 + 840 * k}" y1="${Y(.8)}" y2="${Y(.8)}" stroke="${C.purple}" stroke-width="7"/>`;
        out += pill(690, Y(.8) - 34, 'PIL · the swing', C.purple, pop(t, T.real + 0.6), 24) + check(1090, Y(.8), pop(t, T.real + 1, 0.6), C.teal, 28);
        if (t > T.real + 1) out += A.sparkle(1090, Y(.8), T.real + 1, t);
      }
      // Decorator with a roll of bunting.
      const dc = { x: 1380, y: 1000, scale: 0.95, look: A.LOOKS.d, flip: true, seed: 5, at: T.frame + 0.5, talk: ctx.talking && t > T.items[0] && t < T.real, mood: t > T.real && t < T.real + 2 ? 'sad' : undefined };
      dc.frontArm = t > T.items[0] && t < T.real ? { a1: -100 + Math.sin(t * 4) * 20, a2: -80 } : { a1: 100, a2: 90 };
      dc.hold = `<g><circle r="22" fill="${C.pinkL}" stroke="${C.pink}" stroke-width="5"/><circle r="8" fill="${C.pink}"/></g>`;
      out += who(t, dc);
      out += bub(1400, 580, 'So pretty! ✨', between(t, T.items[0] + 0.6, T.items[1] + 0.4), { size: 28 });
      out += bub(1400, 580, 'This one too? 🥺', between(t, T.items[3] + 0.4, T.real - 0.2), { size: 28 });
      // Inspector cat with a paddle.
      const cat = { x: 1700, y: 1000, scale: 1, seed: 2, at: T.frame + 0.9, talk: ctx.talking && t > T.cat - 0.2 };
      out += crit(t, 'cat', cat);
      out += bub(1640, 700, "We don't decorate charts 😂", between(t, T.cat, s.end), { size: 28, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson 13: Choosing the Correct PIL ================= */
  Object.assign(LIVE, {
    // A police lineup of four candidate lines; the detective picks by structure.
    's13-lineup': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EDE6F3', '#D9CFE9');
      const wk = pop(t, T.wall, 0.7);
      let wall = `<rect x="180" y="400" width="1300" height="600" fill="#F7F3FB"/>`;
      for (let i = 0; i < 6; i++) { const y = 470 + i * 90; wall += `<line x1="180" x2="1480" y1="${y}" y2="${y}" stroke="#D9CFE9" stroke-width="4"/>${txt(210, y - 10, `${7 - i}ft`, 20, '#B9AED6', { a: 'start' })}`; }
      out += fade(wk, wall);
      const sus = [['NEWEST', A.LOOKS.b, C.peach], ['CLOSEST', A.LOOKS.c, C.teal], ['PRETTIEST ✨', A.LOOKS.d, C.pink], ['THE SWING', A.LOOKS.a, C.purple]];
      sus.forEach(([lab, look, col], i) => {
        const x = 370 + i * 300, at = T.suspects[i], xt = T.x[i];
        const out1 = xt != null ? ease(seg(t, xt + 0.8, xt + 1.6)) : 0;
        const p = { x, y: 1000, scale: 0.9, look, seed: i + 2, at, flip: i % 2 === 1, mood: xt != null && t > xt ? 'sad' : undefined, frontArm: { a1: 70, a2: 10 }, backArm: { a1: 110, a2: 170 } };
        const sign = `<rect x="${x - 110}" y="850" width="220" height="70" rx="12" fill="#fff" stroke="${col}" stroke-width="5"/>${txt(x, 896, lab, 26, col === C.pinkL ? DK.pink : col === C.pink ? DK.pink : col)}`;
        let g = who(t, p) + (pop(t, at + 0.3) > 0 ? scaleAt(x, 885, pop(t, at + 0.3), sign) : '');
        if (xt != null) g += cross(x, 660, pop(t, xt, 0.5), C.pink, 30);
        out += `<g opacity="${(1 - out1 * 0.7).toFixed(2)}">${g}</g>`;
      });
      // Spotlight on the pick.
      if (t > T.pick) {
        const k = seg(t, T.pick, T.pick + 0.6);
        out += `<path d="M1240,400 L1300,400 L1400,1000 L1140,1000 Z" fill="${C.gold}" opacity="${0.22 * k}"/>`;
        out += check(1270, 660, pop(t, T.pick + 0.2, 0.6), C.teal, 32) + A.sparkle(1270, 660, T.pick + 0.2, t);
        out += pill(1270, 960 - 0, 'structurally relevant', C.purple, pop(t, T.pick + 0.8), 22);
      }
      // Detective.
      const dt = { x: 1700, y: 1000, scale: 1, look: A.LOOKS.e, flip: true, seed: 8, at: T.det, talk: ctx.talking && t > T.det + 0.5, hat: 'beret' };
      dt.frontArm = { a1: -150 + Math.sin(t * 2) * 6, a2: -170 };
      dt.hold = `<g transform="rotate(-30)"><rect x="-6" y="0" width="12" height="50" rx="6" fill="#9B6A45"/><circle cy="-22" r="30" fill="#E8F8F6" opacity=".8" stroke="${C.dark}" stroke-width="7"/></g>`;
      out += who(t, dt);
      out += bub(1530, 560, 'Which one must price prove itself through?', between(t, T.det + 0.8, T.x[0] + 1.4), { size: 26, tail: 'right' });
      out += pill(830, 1046, 'not newest · not closest · not prettiest', C.muted, pop(t, T.pick + 1.6), 24);
      return out;
    },

    // A hiker's PIL flag sits on a peak; a new swing rises, so she reassesses and the flag can move.
    's13-trail-map': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#F3F7FB" opacity=".6"/>` + cloud(300 + (t * 14) % 300, 440, 0.9) + cloud(1500 - (t * 10) % 200, 410, 0.7);
      const hk = ease(seg(t, T.hills, T.hills + 1));
      const rise = ease(seg(t, T.rise, T.rise + 1.8));
      const shake = t > T.rise && t < T.rise + 1.8 ? Math.sin(t * 40) * 3 : 0;
      // Old peak (A) and valley, new peak (B).
      const hA = lerp(1000, 560, hk), hB = lerp(1000, 650, rise);
      out += `<path d="M120,1000 L420,${lerp(1000, 820, hk)} L700,${hA} L940,${lerp(1000, 880, hk)} L${1180 + shake},${hB} L1460,${lerp(1000, 900, hk)} L1800,1000 Z" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="6" stroke-linejoin="round"/>`;
      out += `<path d="M640,${hA + 70} L700,${hA} L760,${hA + 70} Q730,${hA + 60} 700,${hA + 80} Q670,${hA + 60} 640,${hA + 70} Z" fill="#fff" opacity="${hk}"/>`;
      out += ground(1000, '#E8F3EE', '#CFE5DD');
      if (rise > 0) out += pill(1180, hB + 60, 'NEW SWING', C.peach, between(t, T.rise + 1.2, T.move), 24);
      // Flag: on A, then moves to B.
      const mv = ease(seg(t, T.move, T.move + 1.6));
      const fx = lerp(700, 1180, mv), fy = lerp(hA, hB, mv) - Math.sin(mv * Math.PI) * 140;
      const fk = pop(t, T.flag, 0.6);
      if (fk > 0) {
        out += `<line x1="${Math.min(fx, 700) - 40}" x2="1780" y1="${fy}" y2="${fy}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 10" opacity="${clamp(fk) * 0.8}"/>`;
        out += scaleAt(fx, fy, fk, `<line x1="${fx}" y1="${fy}" x2="${fx}" y2="${fy - 110}" stroke="${C.dark}" stroke-width="6"/><path d="M${fx},${fy - 110} L${fx + 80 + Math.sin(t * 6) * 6},${fy - 90} L${fx},${fy - 66} Z" fill="${C.purple}"/>${txt(fx + 30, fy - 81, 'PIL', 18, '#fff')}`);
      }
      out += pill(1660, fy - 34, t > T.move + 1.6 ? 'PIL updated ✓' : 'active PIL', C.purple, fk, 22);
      if (t > T.move + 1.6) out += A.sparkle(1180, hB - 60, T.move + 1.6, t);
      // Hiker walks in.
      const wk = ease(seg(t, T.walk, T.walk + 2.4));
      const hk2 = { x: lerp(130, 330, wk), y: 1000, scale: 0.9, look: A.LOOKS.b, seed: 3, at: T.walk, walking: t > T.walk && wk < 1, talk: ctx.talking && t > T.think, hat: 'cap' };
      if (t > T.think && t < T.move) hk2.frontArm = { a1: -60, a2: -150 };
      else if (wk >= 1) hk2.frontArm = aim(hk2, 470, 680);
      if (t > T.walk) { const h = headAt(t, hk2); out += `<rect x="${hk2.x - 64}" y="${h.y + 70}" width="44" height="86" rx="14" fill="${C.purple}"/>`; }
      out += who(t, hk2);
      out += bub(470, 560, 'Which swing matters now? 🤔', between(t, T.think, T.move + 0.4), { size: 28 });
      out += bub(470, 560, 'The map can update ✓', between(t, T.done, s.end), { size: 28 });
      // A bird circles, then perches on the flag.
      const bp = t < T.done ? { x: 960 + Math.cos(t * 1.4) * 300, y: 520 + Math.sin(t * 1.4) * 60, fly: true } : { x: fx + 6, y: fy - 110, fly: false };
      out += crit(t, 'bird', Object.assign({ scale: 0.75, seed: 4, at: T.hills + 0.6 }, bp, { flip: t < T.done && Math.sin(t * 1.4) > 0 }));
      return out;
    },
  });

  /* ================= Lesson 14: Indication ================= */
  Object.assign(LIVE, {
    // A bouncer only counts feet past the line: a lean (wick) is not a step (close).
    's13-bouncer-door': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F1E9F4', '#DCCDE6');
      // Club wall with a door frame = the PIL.
      out += `<rect x="0" y="380" width="1920" height="620" fill="#FBF6FD" opacity=".7"/>`;
      const lx = 980;
      const dk = pop(t, T.door, 0.7);
      out += scaleAt(lx, 1000, dk, `<rect x="${lx - 14}" y="470" width="28" height="530" fill="${C.purple}"/><rect x="${lx - 120}" y="440" width="240" height="40" rx="10" fill="${C.purple}"/>${txt(lx, 470, 'PIL', 28, '#fff', { ls: 4 })}
        <rect x="${lx - 200}" y="996" width="400" height="10" fill="${C.gold}"/>`);
      out += pill(760, 1036, '← BELOW', C.muted, pop(t, T.door + 0.6), 22) + pill(1200, 1036, 'ABOVE →', DK.teal, pop(t, T.door + 0.8), 22);
      // Candle 1: walks up, leans past the line, stays behind.
      if (t > T.c1) {
        const wk = ease(seg(t, T.c1, T.c1 + 2));
        const lean = t < T.lean ? 0 : t < T.back ? 42 * ease(seg(t, T.lean, T.lean + 0.6)) : 42 * (1 - ease(seg(t, T.back, T.back + 0.6)));
        const away = ease(seg(t, T.c2 - 0.2, T.c2 + 1.4));
        out += cdl(t, { x: lerp(300, 880, wk) - away * 380, y: 1000, h: 140, col: C.pink, wu: 70, seed: 3, walking: (wk > 0 && wk < 1) || (away > 0 && away < 1), lean, mood: t > T.no ? 'sad' : undefined, flip: away > 0 && away < 1 });
      }
      out += pill(1060, 560, 'WICK: a lean', C.pink, between(t, T.lean + 0.5, T.c2), 24);
      out += cross(1060, 640, between(t, T.no, T.c2), C.pink, 28);
      // Candle 2: walks all the way through.
      let shut = 0;
      if (t > T.c2) {
        const wk = ease(seg(t, T.c2, T.c2 + 3));
        shut = ease(seg(t, T.shut, T.shut + 0.5));
        out += cdl(t, { x: lerp(260, 1240, wk), y: 1000, h: 150, col: C.teal, wu: 20, seed: 6, walking: wk < 1, arms: t > T.shut + 0.4 ? 'cheer' : undefined });
      }
      // The door swings shut behind it.
      if (shut > 0) {
        out += `<g transform="translate(${lx},0) scale(${shut.toFixed(3)},1)"><rect x="-200" y="480" width="200" height="516" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/><circle cx="-30" cy="760" r="10" fill="${C.purple}"/></g>`;
        out += stamp(lx - 100, 720, 'CLOSE ✓', DK.teal, ease(seg(t, T.shut + 0.4, T.shut + 0.7)), -10, 84, 30);
        if (t > T.shut + 0.6) out += A.sparkle(lx - 100, 720, T.shut + 0.6, t);
      }
      // Bouncer.
      const bo = { x: 1560, y: 1000, scale: 1.05, look: A.LOOKS.a, flip: true, seed: 9, at: T.door + 0.4, hat: 'shades', talk: ctx.talking && t > T.no - 0.2 && t < T.no + 2.4 };
      bo.frontArm = t > T.no && t < T.c2 ? { a1: -160, a2: -170 } : { a1: 130, a2: 20 };
      bo.backArm = { a1: 50, a2: 160 };
      out += who(t, bo);
      out += bub(1560, 560, "A lean isn't a step 😎", between(t, T.no, T.c2 + 0.6), { size: 30 });
      out += bub(1560, 560, 'Feet past the line. Counted.', between(t, T.shut + 1, s.end), { size: 28 });
      // A tiny chart inset ties it back: wick vs close.
      const ik = pop(t, T.chart, 0.7);
      if (ik > 0) {
        const inset = chart(t, { x: 200, y: 450, w: 340, h: 260, n: 2, bars: [[.3, .42, .78, .28], [.36, .72, .76, .34]], times: [T.chart + 0.3, T.chart + 1], pil: .6, pilAt: T.chart, pilTag: false, maxBody: 70 });
        out += scaleAt(370, 580, ik, inset + pill(285, 415, 'wick ✗', C.pink, 1, 22) + pill(455, 415, 'close ✓', DK.teal, 1, 22));
      }
      return out;
    },

    // A 1M candle bakes in the oven. Open = not yet. Only the timer's ding (the close) counts.
    's13-oven-timer': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F4EEE8');
      // Tiled wall + counters.
      let wall = '';
      for (let x = 0; x < 1920; x += 80) for (let y = 380; y < 760; y += 80) wall += `<rect x="${x + 2}" y="${y + 2}" width="76" height="76" fill="${(x / 80 + y / 80) % 2 ? '#FDF3EE' : '#FBEDE6'}"/>`;
      out += wall + `<rect x="0" y="760" width="680" height="240" fill="${C.purpleL}"/><rect x="0" y="744" width="690" height="24" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <rect x="1220" y="760" width="700" height="240" fill="${C.purpleL}"/><rect x="1210" y="744" width="710" height="24" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/>`;
      // Oven.
      const ok = pop(t, T.oven, 0.7);
      const wx = 760, wy = 600, ww = 400, wh = 300;
      const ding = t > T.ding;
      const glow = 0.5 + Math.sin(t * 5) * 0.1;
      let ov = `<rect x="700" y="470" width="520" height="530" rx="22" fill="#fff" stroke="${C.muted}" stroke-width="6"/>
        <rect x="700" y="470" width="520" height="90" rx="22" fill="${C.muted}"/><rect x="700" y="530" width="520" height="30" fill="${C.muted}"/>
        <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="16" fill="${ding ? '#FFF6E8' : '#FCE3C4'}" stroke="${C.dark}" stroke-width="6"/>
        <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="16" fill="${C.peach}" opacity="${ding ? 0 : glow * 0.25}"/>
        <rect x="790" y="575" width="340" height="14" rx="7" fill="${C.dark}"/>
        <circle cx="750" cy="515" r="18" fill="#fff"/><circle cx="800" cy="515" r="18" fill="#fff"/>`;
      // Timer.
      const secs = Math.max(0, Math.ceil(60 * (1 - seg(t, T.start, T.ding))));
      ov += `<rect x="1010" y="490" width="170" height="54" rx="10" fill="${C.dark}"/>${txt(1095, 530, t < T.start ? '1:00' : `0:${String(secs).padStart(2, '0')}`, 34, ding ? C.teal : C.peach)}`;
      out += scaleAt(960, 1000, ok, ov);
      // The forming candle inside the window.
      if (ok > 0.9) {
        const path = [.25, .5, .78, .62, .35, .55, .7];
        out += chart(t, { x: wx + 30, y: wy + 40, w: ww - 140, h: wh - 70, n: 1, bars: [[.25, .7, .78, .2]], form: { i: 0, t0: T.start, t1: T.ding, path }, pil: .6, pilAt: T.oven + 0.6, pilTag: false, panel: false, maxBody: 90 });
        const Yp = wy + 40 + (wh - 70) * 0.4;
        out += pill(wx + ww - 50, Yp, 'PIL', C.purple, pop(t, T.oven + 0.9), 22);
      }
      // Status sign on the oven door.
      out += pill(960, 950, 'OPEN CANDLE = NOT YET', C.pink, t < T.ding ? pop(t, T.start + 0.4) : 0, 24);
      if (ding) {
        out += pill(960, 950, 'CLOSED ABOVE ✓ INDICATION', DK.teal, pop(t, T.ding, 0.6), 24);
        out += `<g opacity="${1 - seg(t, T.ding + 0.8, T.ding + 1.6)}">${txt(1095, 470 - seg(t, T.ding, T.ding + 0.8) * 30, 'DING! 🔔', 34, C.gold)}</g>`;
        out += A.sparkle(960, 700, T.ding + 0.2, t);
        out += pill(600, 660, 'wick = a visit →', C.muted, pop(t, T.wick, 0.6), 24);
      }
      // Dog wants it early; baker says not yet.
      out += crit(t, 'dog', { x: 430, y: 1000, scale: 1, seed: 2, at: T.oven + 0.4, tongue: t > T.dog && t < T.ding, hop: t > T.dog && t < T.dog + 1.4 ? 9 : 0 });
      out += bub(470, 600, 'It went above! Now?? 🤤', between(t, T.dog, T.dog + 2.8), { size: 28 });
      const bk = { x: 1440, y: 1000, scale: 0.95, look: A.LOOKS.seller, flip: true, seed: 4, at: T.oven + 0.6, hat: 'chef', talk: ctx.talking && t > T.dog + 2 };
      bk.frontArm = t > T.dog + 2.8 && t < T.ding ? { a1: -150, a2: -100 } : t > T.ding ? aim(bk, 1220, 700) : { a1: 100, a2: 90 };
      out += who(t, bk);
      out += bub(1480, 560, 'Still open. Not yet!', between(t, T.dog + 2.9, T.ding), { size: 28 });
      out += bub(1480, 560, 'Now it closed 👌', between(t, T.ding + 0.6, s.end), { size: 28 });
      return out;
    },
  });

  /* ================= Lesson 15: Correction ================= */
  Object.assign(LIVE, {
    // A long jumper crosses the line, then walks back behind it for her run-up. Stepping back is the routine.
    's13-runup': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F6EDE6');
      // Track lanes.
      out += `<rect x="0" y="880" width="1920" height="120" fill="#F2B98A"/>${[905, 945].map(y => `<rect x="0" y="${y}" width="1920" height="4" fill="#fff" opacity=".7"/>`).join('')}
        <rect x="1380" y="960" width="540" height="40" fill="#F6E3C8"/>`;
      // The PIL line on the runway + flag post.
      const lx = 900, lk = pop(t, T.track, 0.6);
      out += scaleAt(lx, 1000, lk, `<rect x="${lx - 8}" y="880" width="16" height="120" fill="#fff"/><rect x="${lx - 4}" y="600" width="8" height="280" fill="${C.muted}"/>
        <path d="M${lx + 4},600 L${lx + 90 + Math.sin(t * 5) * 6},622 L${lx + 4},648 Z" fill="${C.purple}"/>${txt(lx + 38, 630, 'PIL', 20, '#fff')}`);
      // Athlete: run past (indication), then walk back behind (correction).
      let ax = 300, flip = false, walking = false, mood;
      if (t > T.run) { const k = ease(seg(t, T.run, T.over)); ax = lerp(300, 1100, k); walking = k < 1; }
      if (t > T.back) { const k = ease(seg(t, T.back, T.back + 2.4)); ax = lerp(1100, 680, k); flip = k < 1; walking = k < 1; }
      const ath = { x: ax, y: 1000, scale: 0.92, look: A.LOOKS.c, seed: 3, at: T.track + 0.3, flip, walking, mood };
      if (t > T.back + 2.4) ath.frontArm = { a1: -30 + Math.sin(t * 3) * 8, a2: -60 };
      out += who(t, ath);
      if (t > T.back + 2.4) { const h = headAt(t, ath); out += `<rect x="${ax - 40}" y="${h.y - 34}" width="80" height="12" rx="6" fill="${C.pink}"/>`; }
      out += pill(1100, 560, 'I ✓ closed above', DK.teal, between(t, T.over, T.chart - 0.4), 24);
      out += pill(660, 560, 'C ✓ closed back below', DK.pink, between(t, T.back + 1.6, T.chart - 0.4), 24);
      // Worried spectator on a bench.
      out += `<rect x="1560" y="880" width="260" height="20" rx="8" fill="#9B6A45"/><rect x="1580" y="900" width="14" height="60" fill="#9B6A45"/><rect x="1786" y="900" width="14" height="60" fill="#9B6A45"/>`;
      const sp = { x: 1690, y: 960, scale: 0.85, look: A.LOOKS.b, flip: true, seed: 7, at: T.track + 0.6, talk: ctx.talking && t > T.worry && t < T.coach, mood: t > T.worry && t < T.coach + 1 ? 'sad' : undefined };
      if (t > T.worry && t < T.coach + 1) { sp.frontArm = { a1: -110, a2: -150 }; sp.backArm = { a1: -70, a2: -30 }; }
      out += who(t, sp);
      out += bub(1640, 560, 'She’s going backwards! 😱', between(t, T.worry, T.coach + 0.6), { size: 28, tail: 'right' });
      // Coach with whistle and clipboard.
      const co = { x: 1340, y: 1000, scale: 0.95, look: A.LOOKS.a, flip: true, seed: 2, at: T.track + 0.9, hat: 'cap', talk: ctx.talking && t > T.coach && t < T.chart, hold: '<g transform="translate(14,-20) rotate(-8)"><rect x="-30" y="-40" width="60" height="80" rx="8" fill="#9B6A45"/><rect x="-24" y="-30" width="48" height="64" rx="4" fill="#fff"/></g>' };
            out += who(t, co);
      out += bub(1300, 640, 'That’s the routine 👍', between(t, T.coach + 0.4, T.chart + 1), { size: 28 });
      // Mini chart: I then C.
      const ck = pop(t, T.chart, 0.7);
      if (ck > 0) {
        const cg = { x: 230, y: 430, w: 380, h: 240, bars: SEQ.slice(0, 6), t0: T.chart + 0.2, per: 0.25, pil: .5, pilAt: T.chart, pilTag: false, maxBody: 34,
          tags: [{ i: SEQ_I, text: 'I', col: DK.teal, at: T.chart + 1.4 }, { i: SEQ_C, text: 'C', col: DK.pink, at: T.chart + 1.9, pos: 'below' }] };
        out += scaleAt(420, 550, ck, chart(t, cg));
      }
      out += stamp(1110, 600, 'NOT FAILURE', DK.purple, ease(seg(t, T.done, T.done + 0.3)), -8, 92, 22);
      return out;
    },

    // A kid tries to crayon in a correction that never happened. The robot ref blows the whistle.
    's13-crayon': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EEF6F4', '#D3E9E4');
      // Easel.
      const ek = pop(t, T.easel, 0.7);
      out += scaleAt(700, 1000, ek, `<path d="M420,1000 L500,420 M980,1000 L900,420 M700,1000 L700,860" stroke="#9B6A45" stroke-width="16" stroke-linecap="round"/>
        <rect x="330" y="400" width="740" height="480" rx="14" fill="#fff" stroke="#9B6A45" stroke-width="10"/><rect x="420" y="874" width="560" height="20" rx="6" fill="#9B6A45"/>`);
      const bars = [[.2, .3, .32, .18], [.3, .42, .44, .28], [.42, .6, .62, .4], [.6, .66, .7, .56], [.66, .6, .68, .36], [.6, .64, .67, .56], [.64, .7, .72, .6]];
      const cg = { x: 380, y: 440, w: 640, h: 400, n: 9, bars, t0: T.bars, per: 0.45, pil: .45, pilAt: T.easel + 0.6, pilTag: false, maxBody: 44,
        tags: [{ i: 2, text: 'I ✓', col: DK.teal, at: T.bars + 1.4 }] };
      if (ek > 0.9) out += chart(t, cg);
      const { X, Y } = geo(cg);
      out += pill(1110, Y(.45), 'PIL', C.purple, pop(t, T.easel + 0.9), 22);
      // Fake crayon candle in slot 7.
      const dk = seg(t, T.draw, T.draw + 1.4), er = seg(t, T.erase, T.erase + 1);
      if (dk > 0 && er < 1) {
        const x = X(7), top = Y(.7), bot = lerp(top, Y(.3), dk);
        let scrib = '';
        for (let y = top + 10; y < bot - 6; y += 16) scrib += `L${x + (Math.floor((y - top) / 16) % 2 ? 18 : -18)},${y}`;
        out += `<g opacity="${1 - er}"><rect x="${x - 24}" y="${top}" width="48" height="${bot - top}" fill="none" stroke="${C.pink}" stroke-width="5" stroke-dasharray="8 6"/><path d="M${x - 18},${top + 4} ${scrib}" stroke="${C.pinkL}" stroke-width="7" fill="none"/></g>`;
        if (er > 0) { const ex = lerp(x - 80, x + 80, (er * 3) % 1); out += `<rect x="${ex - 34}" y="${lerp(top, bot, er) - 20}" width="68" height="40" rx="8" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="4"/>`; }
      }
      // The wick back.
      if (t > T.wick) {
        const k = pop(t, T.wick, 0.5);
        out += `<circle cx="${X(4)}" cy="${Y(.38)}" r="${36 * Math.min(1, k)}" fill="none" stroke="${C.peach}" stroke-width="5" stroke-dasharray="8 6"/>`;
        out += pill(X(4), Y(.2), 'wick back ✗', C.pink, pop(t, T.nope, 0.5), 22);
      }
      // Kid with a crayon.
      const kd = { x: 1180, y: 1000, scale: 0.72, look: A.LOOKS.d, flip: true, seed: 4, at: T.kid, talk: ctx.talking && t > T.draw && t < T.whistle };
      kd.frontArm = t > T.draw && t < T.whistle ? aim(kd, X(7) + 30, lerp(Y(.7), Y(.3), dk)) : { a1: 100, a2: 80 };
      kd.hold = `<g transform="rotate(-30)"><rect x="-6" y="-46" width="12" height="46" rx="4" fill="${C.pink}"/><path d="M-6,-46 L0,-60 L6,-46 Z" fill="${C.dark}"/></g>`;
      out += who(t, kd);
      out += bub(1250, 600, 'There! A correction ✏️', between(t, T.draw + 0.6, T.whistle), { size: 28 });
      out += bub(1250, 600, 'What about this wick? 🤔', between(t, T.wick, T.nope + 0.2), { size: 28 });
      // Robot referee.
      const rk = pop(t, T.easel + 0.5, 0.6);
      const whist = t > T.whistle && t < T.whistle + 1.2;
      out += scaleAt(1600, 1000, rk, critter(t, 'robot', { x: 1600, y: 1000, scale: 1.25, seed: 3, screen: 'REF', talk: ctx.talking && t > T.whistle && t < T.done + 2 }));
      if (whist) out += [0, 1, 2].map(i => `<path d="M${1540 - i * 22},${700 - i * 18} q-20,-10 -36,4" stroke="${C.pink}" stroke-width="5" fill="none" opacity="${1 - ((t * 3 + i * 0.3) % 1)}"/>`).join('');
      out += bub(1560, 560, 'No inventing! 🚫', between(t, T.whistle, T.wick - 0.2), { size: 30, tail: 'right' });
      out += bub(1560, 560, 'Wicks don’t count 🙅', between(t, T.nope, T.done), { size: 28, tail: 'right' });
      out += pill(700, 960, 'no close back = no correction yet', C.purple, pop(t, T.done, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 16: Continuation ================= */
  Object.assign(LIVE, {
    // The light stays red while price is on the wrong side; green only on the close back above.
    's13-traffic-light': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000) + A.road(910, { x0: 760, x1: 1920, h: 90 });
      // Mini chart.
      const ck = pop(t, T.chart, 0.7);
      const times = SEQ.slice(0, 8).map((_, i) => i < 7 ? T.chart + 0.3 + i * 0.3 : T.close);
      const cg = { x: 200, y: 450, w: 460, h: 330, bars: SEQ.slice(0, 8), n: 8, times, pil: .5, pilAt: T.chart, pilTag: false, maxBody: 34,
        tags: [{ i: SEQ_I, text: 'I ✓', col: DK.teal, at: T.chart + 2 }, { i: SEQ_C, text: 'C ✓', col: DK.pink, at: T.chart + 2.6, pos: 'below' }, { i: SEQ_N, text: 'CONT ✓', col: DK.purple, at: T.close + 0.5 }] };
      if (ck > 0) out += scaleAt(430, 615, ck, chart(t, cg) + pill(430, 840, 'PIL', C.purple, 1, 20));
      // Waiting region shading on wrong side.
      if (t > T.wrong && t < T.close + 0.4) { const { X, Y } = geo(cg); out += `<rect x="${X(5) - 20}" y="${Y(.5)}" width="${X(7) - X(5) + 40}" height="${Y(.3) - Y(.5)}" fill="${C.pink}" opacity="${0.12 + Math.sin(t * 4) * 0.04}"/>`; }
      // Traffic light.
      const lk = pop(t, T.road, 0.7), green = t > T.green;
      const lamp = (cy, col, on) => `<circle cx="1250" cy="${cy}" r="40" fill="${on ? col : '#5A4A44'}"/>${on ? `<circle cx="1250" cy="${cy}" r="56" fill="${col}" opacity=".25"/>` : ''}`;
      out += scaleAt(1250, 1000, lk, `<rect x="1240" y="640" width="20" height="270" fill="${C.muted}"/><rect x="1190" y="410" width="120" height="290" rx="26" fill="${C.dark}"/>
        ${lamp(470, C.pink, !green)}${lamp(555, C.gold, false)}${lamp(640, C.cash, green)}`);
      out += crit(t, 'bird', { x: 1250, y: 412, scale: 0.7, seed: 4, at: T.road + 0.6, hop: green && t < T.green + 1.5 ? 9 : 0, hopH: 10 });
      out += pill(1520, 470, 'CONTINUATION NOT CONFIRMED', C.pink, t < T.close + 0.4 ? pop(t, T.wrong, 0.6) : 0, 22);
      out += pill(1520, 470, 'CONTINUATION ✓ GO', DK.teal, pop(t, T.green, 0.6), 24);
      // Car revving at the stop line, then going.
      const go = ease(seg(t, T.go, T.go + 3)) * 900;
      const rev = t > T.rev && t < T.green ? Math.sin(t * 40) * 3 : 0;
      out += `<rect x="1150" y="914" width="10" height="86" fill="#fff"/>`;
      out += A.vehicle('car', { x: 1020 + go + rev, y: 1000, t, dist: go, moving: go > 0, scale: 1.05 });
      // Driver's head in the window.
      out += `<g transform="translate(${1035 + go + rev},${1000 - 150})"><circle r="22" fill="#B07750"/><path d="M-22,-4 C-22,-30 22,-30 22,-4 C14,-16 -14,-16 -22,-4 Z" fill="${C.dark}"/><circle cx="8" cy="-2" r="3" fill="${C.dark}"/></g>`;
      if (t > T.rev && t < T.green) out += [0, 1, 2].map(i => { const p = (t * 1.8 + i / 3) % 1; return `<circle cx="${890 - p * 120}" cy="${975 - p * 40}" r="${10 + p * 24}" fill="#D9CFC8" opacity="${0.8 * (1 - p)}"/>`; }).join('');
      out += bub(1000, 700, 'It’s basically above 😤', between(t, T.rev, T.close), { size: 28 });
      // Crossing guard with a stop sign, steps aside on green.
      const gx = lerp(1460, 1700, ease(seg(t, T.green, T.green + 1.2)));
      const cgd = { x: gx, y: 1000, scale: 0.9, look: A.LOOKS.e, flip: true, seed: 6, at: T.road + 0.4, hat: 'cap', talk: ctx.talking && t > T.rev + 1.2 && t < T.close, walking: t > T.green && t < T.green + 1.2 };
      cgd.frontArm = t < T.green ? { a1: -160, a2: -110 } : { a1: -40 + Math.sin(t * 8) * 20, a2: -80 };
      cgd.hold = t < T.green ? `<g transform="rotate(20)"><rect x="-4" y="-80" width="8" height="90" fill="${C.muted}"/><g transform="translate(0,-110)"><path d="M-15,-36 L15,-36 L36,-15 L36,15 L15,36 L-15,36 L-36,15 L-36,-15 Z" fill="${C.pink}" stroke="#fff" stroke-width="4"/>${txt(0, 7, 'WAIT', 18, '#fff')}</g></g>` : '';
      out += who(t, cgd);
      out += bub(1560, 600, 'Almost isn’t above.', between(t, T.rev + 1.4, T.close), { size: 28, tail: 'right' });
      if (t > T.green) out += A.sparkle(1250, 640, T.green, t, C.cash);
      return out;
    },

    // Fishing: a wiggle of the bobber isn't a bite. Wait for the real close.
    's13-bobber': (s, t, ctx) => {
      const T = s.beats;
      const wl = 770;
      let out = `<rect x="0" y="380" width="1920" height="${wl - 380}" fill="#FDF3EA" opacity=".5"/>`;
      out += `<circle cx="1640" cy="500" r="${60 + Math.sin(t) * 3}" fill="${C.peachL}" opacity=".7"/>` + cloud(400 + (t * 12) % 200, 470, 0.7);
      // Water with waves.
      let wv = `M0,${wl}`;
      for (let x = 0; x <= 1920; x += 40) wv += ` L${x},${(wl + Math.sin(x / 60 + t * 2) * 5).toFixed(1)}`;
      out += `<path d="${wv} L1920,1080 L0,1080 Z" fill="${C.tealL}"/><path d="${wv}" stroke="${C.teal}" stroke-width="4" fill="none"/>`;
      out += pill(1740, wl - 36, 'PIL = the waterline', C.purple, pop(t, T.dock + 0.8), 22);
      // Bobber.
      const bx = 1220;
      let by = wl - 6 + Math.sin(t * 2.4) * 4;
      if (t > T.wiggle && t < T.dunk) { const w = Math.max(0, Math.sin((t - T.wiggle) * 9)) * (Math.floor((t - T.wiggle) / 1.8) % 2 ? 6 : 26); by += w; }
      if (t > T.dunk) by = lerp(wl - 6, wl + 70, ease(seg(t, T.dunk, T.dunk + 0.5))) + Math.sin(t * 3) * 4;
      const ck = pop(t, T.cast, 0.6);
      if (ck > 0) {
        out += `<path d="M770,450 Q${(770 + bx) / 2},${t > T.dunk ? 520 : 470} ${bx},${by - 26}" stroke="${C.dark}" stroke-width="2.5" fill="none" opacity="${clamp(ck)}"/>`;
        out += `<g transform="translate(${bx},${by})" opacity="${t > T.dunk ? 0.55 : 1}"><circle cy="-16" r="22" fill="${C.pink}"/><path d="M-22,-16 A22,22 0 0,0 22,-16 Z" fill="#fff"/><rect x="-3" y="-50" width="6" height="16" fill="${C.dark}"/></g>`;
        if (t > T.dunk && t < T.dunk + 1.4) { const p = seg(t, T.dunk, T.dunk + 1.4); out += `<ellipse cx="${bx}" cy="${wl}" rx="${30 + p * 90}" ry="${8 + p * 16}" fill="none" stroke="#fff" stroke-width="5" opacity="${1 - p}"/>`; }
      }
      out += pill(bx, 620, 'a wiggle = a wick', C.peach, between(t, T.wiggle + 0.6, T.dunk - 0.2), 24);
      out += pill(bx, 620, 'close back BELOW ✓', DK.teal, pop(t, T.dunk + 0.4, 0.6), 26);
      out += pill(bx, 540, 'bearish continuation', C.muted, pop(t, T.done, 0.6), 22);
      // Dock.
      const dk = pop(t, T.dock, 0.7);
      out += scaleAt(380, 800, dk, `<rect x="0" y="${wl - 20}" width="740" height="30" fill="#C98A5B"/>${[60, 260, 460, 660].map(x => `<rect x="${x}" y="${wl}" width="22" height="200" fill="#9B6A45"/>`).join('')}
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${i * 106}" x2="${i * 106}" y1="${wl - 20}" y2="${wl + 10}" stroke="#9B6A45" stroke-width="3"/>`).join('')}`);
      // Fisher with a rod.
      const fs = { x: 560, y: wl - 20, scale: 0.9, look: A.LOOKS.e, seed: 5, at: T.dock + 0.3, hat: 'cap', talk: ctx.talking && t > T.wiggle + 2.6 && t < T.dunk };
      fs.frontArm = { a1: -40, a2: -50 };
      fs.hold = `<g transform="rotate(-38)"><rect x="-6" y="-10" width="250" height="10" rx="5" fill="${C.dark}"/><circle cx="20" cy="4" r="14" fill="${C.muted}"/></g>`;
      out += who(t, fs);
      out += bub(600, 405, 'A wiggle isn’t a bite.', between(t, T.wiggle + 2.6, T.dunk), { size: 28 });
      out += bub(600, 405, 'THAT’S the close 🎣', between(t, T.dunk + 0.8, s.end), { size: 28 });
      // Cat on the dock, eager.
      out += crit(t, 'cat', { x: 300, y: wl - 20, scale: 0.85, seed: 3, at: T.dock + 0.6, hop: t > T.cat && t < T.cat + 1.6 ? 10 : 0, hopH: 16, talk: t > T.cat && t < T.cat + 2 });
      out += bub(250, 560, 'Now?! Pull!! 🐟', between(t, T.cat, T.wiggle + 2.6), { size: 28 });
      // A duck paddles by.
      const dx = 1950 - ((t - s.start) * 40) % 2200;
      out += critter(t, 'duck', { x: dx, y: wl + 24, scale: 0.8, seed: 2, flip: true });
      return out;
    },
  });

  /* ================= Lesson 17: The Full Candle-Close Sequence ================= */
  Object.assign(LIVE, {
    // Two candle dancers hop below / above the neon PIL line: bullish, then the bearish mirror.
    's13-dance-steps': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#2F2440', '#4A3A60');
      const bgk = pop(t, T.floor - 0.2, 0.6);
      out += scaleAt(960, 1000, bgk, `<rect x="60" y="380" width="1800" height="640" rx="40" fill="#3A2D4F"/>${[300, 960, 1620].map((x, i) => `<path d="M${x - 20},380 L${x + 20},380 L${x + 160 + Math.sin(t * 1.5 + i * 2) * 120},1000 L${x - 160 + Math.sin(t * 1.5 + i * 2) * 120},1000 Z" fill="${[C.pink, C.teal, C.purple][i]}" opacity=".12"/>`).join('')}`);
      // Dance floor tiles.
      for (let i = 0; i < 24; i++) out += `<rect x="${i * 80}" y="1000" width="78" height="80" fill="${[C.pink, C.purple, C.teal, C.peach][(i + Math.floor(t * 2)) % 4]}" opacity=".35"/>`;
      const lanes = [
        { x0: 180, pos: ['below', 'above', 'below', 'above'], col: C.teal, at: T.bull, lab: ['START', 'I', 'C', 'CONT'], seq: 'BELOW → ABOVE → BELOW → ABOVE', seed: 2 },
        { x0: 1080, pos: ['above', 'below', 'above', 'below'], col: C.pink, at: T.bear, lab: ['START', 'I', 'C', 'CONT'], seq: 'ABOVE → BELOW → ABOVE → BELOW', seed: 5 },
      ];
      const lineY = 770, podTop = 710;
      lanes.forEach((L, li) => {
        const k = pop(t, li ? T.bear[0] - 0.6 : T.floor, 0.6);
        if (k <= 0) return;
        const xs = [0, 1, 2, 3].map(i => L.x0 + 90 + i * 180);
        let g = '';
        L.pos.forEach((p, i) => { if (p === 'above') g += `<rect x="${xs[i] - 70}" y="${podTop}" width="140" height="${1000 - podTop}" rx="10" fill="#5A4A78" stroke="${C.purpleL}" stroke-width="4"/>`; });
        const glow = 0.7 + Math.sin(t * 6 + li) * 0.3;
        g += `<line x1="${L.x0}" x2="${L.x0 + 720}" y1="${lineY}" y2="${lineY}" stroke="${C.purpleL}" stroke-width="12" opacity="${0.3 * glow}"/><line x1="${L.x0}" x2="${L.x0 + 720}" y1="${lineY}" y2="${lineY}" stroke="#fff" stroke-width="4" stroke-dasharray="16 10"/>`;
        g += txt(L.x0 - 6, lineY + 8, 'PIL', 22, C.purpleL, { a: 'end' });
        out += fade(k, g);
        // Step labels on the floor.
        L.pos.forEach((p, i) => out += pill(xs[i], 1040, L.lab[i], i === 0 ? C.muted : L.col === C.teal ? DK.teal : DK.pink, pop(t, L.at[i], 0.5), 22));
        // The dancer hops through the positions.
        let cur = -1; L.at.forEach((a, i) => { if (t >= a) cur = i; });
        if (cur < 0) return;
        const yOf = i => L.pos[i] === 'above' ? podTop : 1000;
        const hk = ease(seg(t, L.at[cur], L.at[cur] + 0.6));
        const px = cur ? lerp(xs[cur - 1], xs[cur], hk) : xs[0], py = cur ? lerp(yOf(cur - 1), yOf(cur), hk) - Math.sin(hk * Math.PI) * 120 : yOf(0);
        out += scaleAt(px, py, cur ? 1 : pop(t, L.at[0], 0.6), cdl(t, { x: px, y: py, h: 120, w: 64, col: L.col, wu: 20, seed: L.seed, arms: hk < 1 && cur ? 'up' : 'cheer' }));
        // The sequence strip.
        const parts = L.seq.split(' → ');
        const shown = parts.slice(0, cur + 1).join(' → ');
        out += pill(L.x0 + 360, 418, shown, L.col === C.teal ? DK.teal : DK.pink, 1, 24);
      });
      // DJ bird on a speaker with music notes.
      const sk = pop(t, T.floor + 0.4, 0.6);
      out += scaleAt(960, 1000, sk, `<rect x="900" y="820" width="120" height="180" rx="14" fill="${C.dark}" stroke="#5A4A78" stroke-width="4"/><circle cx="960" cy="${910}" r="${38 + Math.abs(Math.sin(t * 8)) * 6}" fill="#5A4A78"/><circle cx="960" cy="910" r="14" fill="${C.dark}"/>`);
      out += crit(t, 'parrot', { x: 960, y: 822, scale: 0.75, seed: 3, at: T.floor + 0.6, hop: 8, hopH: 8 });
      out += [0, 1, 2].map(i => { const p = (t * 0.5 + i / 3) % 1; return `<text x="${960 + Math.sin(p * 6 + i) * 60}" y="${780 - p * 260}" font-size="40" fill="${[C.pinkL, C.tealL, C.peachL][i]}" opacity="${sk > 0 ? Math.sin(p * Math.PI) : 0}">♪</text>`; }).join('');
      out += pill(960, 478, 'START · INDICATION · CORRECTION · CONTINUATION', C.gold, pop(t, T.seq, 0.6), 24);
      return out;
    },

    // A three-dial lock: I, C, C. Two clicks is still locked. No "basically", no "almost".
    's13-combo-lock': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EFE8E1');
      const sk = pop(t, T.safe, 0.8);
      const open = ease(seg(t, T.open, T.open + 1.2));
      const rattle = t > T.try && t < T.try + 0.8 ? Math.sin(t * 50) * 5 : 0;
      // Safe body.
      let sf = `<rect x="640" y="440" width="640" height="540" rx="30" fill="#8C7B9E"/><rect x="660" y="460" width="600" height="500" rx="20" fill="#6E5F82"/>
        <rect x="680" y="980" width="60" height="20" fill="${C.dark}"/><rect x="1180" y="980" width="60" height="20" fill="${C.dark}"/>`;
      if (open > 0) sf += `<rect x="690" y="490" width="540" height="440" rx="10" fill="#FFF3D6"/><circle cx="960" cy="720" r="${120 + Math.sin(t * 4) * 8}" fill="${C.gold}" opacity=".35"/>${txt(960, 740, 'ICC ✓', 64, DK.peach, { f: 'Playfair Display' })}`;
      out += scaleAt(960, 1000, sk, sf);
      // Door (swings open).
      const dials = [['I', T.d1], ['C', T.d2], ['C', T.d3]];
      let door = `<rect x="690" y="490" width="540" height="440" rx="14" fill="#A99BBB" stroke="#5E5072" stroke-width="6"/><rect x="1180" y="660" width="26" height="100" rx="8" fill="#5E5072"/>`;
      dials.forEach(([lab, at], i) => {
        const cx = 800 + i * 160, cy = 720;
        const spin = at && t > at - 1 ? Math.min(t, at) * 0 + ease(seg(t, at - 1, at)) * 540 : Math.sin(t * 0.5 + i) * 10;
        const done = t > at;
        door += `<circle cx="${cx}" cy="${cy}" r="62" fill="#E7E1EE" stroke="#5E5072" stroke-width="6"/>
          <g transform="rotate(${spin.toFixed(1)} ${cx} ${cy})">${[0, 1, 2, 3, 4, 5, 6, 7].map(j => `<line x1="${cx}" y1="${cy - 54}" x2="${cx}" y2="${cy - 44}" stroke="#5E5072" stroke-width="4" transform="rotate(${j * 45} ${cx} ${cy})"/>`).join('')}<circle cx="${cx}" cy="${cy - 30}" r="8" fill="${C.pink}"/></g>
          ${txt(cx, cy + 12, lab, 36, '#5E5072', { f: 'Playfair Display' })}
          <circle cx="${cx}" cy="${cy - 110}" r="18" fill="${done ? C.cash : '#5E5072'}"/>${done ? `<circle cx="${cx}" cy="${cy - 110}" r="28" fill="${C.cash}" opacity=".3"/>` : ''}`;
        door += txt(cx, cy + 112, ['indication', 'correction', 'continuation'][i], 22, '#5E5072');
      });
      if (sk > 0) out += `<g transform="translate(${690 + rattle},0) scale(${(1 - open * 1.1).toFixed(3)},1) translate(-690,0)">${scaleAt(960, 1000, sk, door)}</g>`;
      out += pill(960, 420, 'LOCKED 🔒', C.pink, between(t, T.try, T.d3 - 0.6), 28);
      if (t > T.open) out += A.sparkle(960, 700, T.open + 0.3, t, C.gold) + pill(960, 420, 'ALL THREE ✓', DK.teal, pop(t, T.open, 0.6), 28);
      // Person at the dials.
      const pp = { x: 1440, y: 1000, scale: 0.95, look: A.LOOKS.buyer, flip: true, seed: 4, at: T.safe + 0.3, talk: ctx.talking && t > T.b1 - 0.2 && t < T.b3 + 1.6, mood: t > T.try && t < T.try + 1.4 ? 'sad' : undefined };
      const tgt = t < T.d2 ? 800 : t < T.try ? 960 : t < T.d3 - 1.2 ? 1206 : 1120;
      pp.frontArm = t > T.open ? { a1: -150, a2: -100 } : aim(pp, tgt + (t > T.try && t < T.d3 - 1.2 ? 0 : 0), t > T.try && t < T.d3 - 1.2 ? 710 : 720);
      out += who(t, pp);
      const asks = [['Basically? 🥺', T.b1], ['Almost? 🙏', T.b2], ['The wick counted? 😅', T.b3]];
      asks.forEach(([q, at], i) => {
        const y = 470 + i * 96;
        out += bub(1620, y, q, between(t, at, T.d3 - 0.6), { size: 28 });
        out += cross(1800, y, between(t, at + 0.7, T.d3 - 0.6), C.pink, 22);
      });
      // Cat on top of the safe.
      out += crit(t, 'cat', { x: 760, y: 440, scale: 0.8, seed: 6, at: T.safe + 0.8, sleep: t < T.try, hop: t > T.open && t < T.open + 1.5 ? 10 : 0, hopH: 16 });
      return out;
    },
  });

  /* ================= Lesson 18: The Retest ================= */
  Object.assign(LIVE, {
    // Price runs away like a boomerang. Stand on your spot and wait for it to come back.
    's13-boomerang': (s, t, ctx) => {
      const T = s.beats;
      let out = cloud(500 + (t * 10) % 300, 450, 0.8) + cloud(1400 - (t * 8) % 300, 420, 0.6);
      out += ground(1000, '#E3F2EC', '#C9E5DA');
      for (let i = 0; i < 30; i++) { const x = (i * 71) % 1920; out += `<path d="M${x},1000 l6,-18 l6,18" fill="${C.teal}" opacity=".5"/>`; }
      // Status pills.
      ['I ✓', 'C ✓', 'C ✓'].forEach((p, i) => out += pill(250 + i * 110, 430, p, [DK.teal, DK.pink, DK.teal][i], pop(t, T.spot + 0.3 + i * 0.3), 24));
      // The spot = PIL.
      const sx = 620, spk = pop(t, T.spot, 0.6);
      out += scaleAt(sx, 1010, spk, `<ellipse cx="${sx}" cy="1012" rx="110" ry="22" fill="${C.purple}" opacity=".3"/><path d="M${sx - 40},1000 L${sx + 40},1024 M${sx + 40},1000 L${sx - 40},1024" stroke="${C.purple}" stroke-width="8" stroke-linecap="round"/>`);
      out += pill(sx, 1052, 'PIL · your spot', C.purple, spk, 22);
      // Thrower.
      const th = { x: sx, y: 1000, scale: 0.95, look: A.LOOKS.seller, seed: 3, at: T.spot + 0.2, talk: ctx.talking && t > T.dog + 0.6 && t < T.back };
      const u = ease(seg(t, T.throw, T.catch));
      const hand = { x: sx + 60, y: 1000 - 0.95 * 196 + 20 };
      const inAir = t > T.throw && t < T.catch;
      if (t < T.throw) th.frontArm = { a1: -150 + seg(t, T.throw - 1, T.throw) * 60, a2: -170 };
      else if (inAir) th.frontArm = t < T.throw + 0.6 ? { a1: -20, a2: -10 } : { a1: 100, a2: 90 };
      else th.frontArm = { a1: -60, a2: -100 };
      // Boomerang position.
      let bx, by;
      if (!inAir) { bx = t < T.throw ? sx + 40 : sx + 90; by = t < T.throw ? 700 : 690; }
      else { bx = hand.x + 1000 * Math.sin(Math.PI * u) + 60 * Math.sin(2 * Math.PI * u); by = hand.y - 300 * Math.sin(Math.PI * u) - 80 * Math.sin(2 * Math.PI * u); }
      const bshape = `<path d="M-46,10 Q0,-40 46,10 L36,18 Q0,-18 -36,18 Z" fill="${C.peach}" stroke="${DK.peach}" stroke-width="4"/>`;
      if (!inAir) th.hold = `<g transform="translate(0,-14) rotate(-20) scale(1.3)">${bshape}</g>`;
      out += who(t, th);
      if (inAir) out += `<g transform="translate(${f1(bx)},${f1(by)}) rotate(${(t * 720) % 360}) scale(1.5)">${bshape}</g>`;
      out += pill(Math.min(1700, bx), by - 70, 'price runs away…', C.muted, inAir && u > 0.15 && u < 0.62 ? 1 : 0, 22);
      out += pill(Math.min(1700, bx), by - 70, '…and comes back', DK.teal, inAir && u >= 0.62 && u < 0.95 ? 1 : 0, 22);
      // Dog on a leash wants to chase.
      const pull = t > T.dog && t < T.back ? 1 : 0;
      const dx = sx + 220 + pull * 70, dyk = pull ? Math.abs(Math.sin(t * 9)) * -14 : 0;
      out += `<path d="M${sx - 30},${1000 - 0.95 * 110} Q${(sx + dx) / 2},${pull ? 900 : 960} ${dx + 40},${940 + dyk}" stroke="${C.pink}" stroke-width="4" fill="none" opacity="${clamp(pop(t, T.spot + 0.8))}"/>`;
      out += crit(t, 'dog', { x: dx, y: 1000 + dyk, scale: 0.85, seed: 5, at: T.spot + 0.8, tongue: pull > 0 });
      out += bub(1000, 640, 'Chase it!! 🐶', between(t, T.dog, T.dog + 2.6), { size: 28 });
      out += bub(560, 580, 'Nope. It comes back to us.', between(t, T.dog + 2.8, T.back + 1), { size: 28 });
      // The catch.
      if (t > T.catch) out += A.sparkle(sx + 60, 740, T.catch, t) + pill(sx + 60, 560, 'FIRST RETEST ✓', DK.teal, pop(t, T.catch, 0.6), 28);
      return out;
    },

    // Baggage carousel: stand at your spot. Your bag comes round; the first arrival is the one.
    's13-carousel': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#ECEAF2', '#D9D4E6');
      // Back wall with sign.
      const wk = pop(t, T.belt, 0.7);
      out += scaleAt(960, 470, wk, `<rect x="720" y="400" width="480" height="80" rx="16" fill="${C.dark}"/>${txt(960, 452, '🧳 BAGGAGE · BELT 1M', 30, C.gold)}`);
      const by = 800, spotX = 1080;
      // Person A at her spot.
      const pa = { x: spotX, y: 840, scale: 0.95, look: A.LOOKS.a, seed: 2, at: T.belt + 0.4, talk: ctx.talking && t > T.grab };
      if (t > T.grab) { pa.frontArm = { a1: -80, a2: -110 }; pa.hold = `<g transform="translate(0,10)"><rect x="-50" y="0" width="100" height="72" rx="12" fill="${C.purple}"/><rect x="-40" y="14" width="80" height="30" rx="6" fill="#fff"/>${txt(0, 37, 'PIL', 20, C.purple)}</g>`; }
      out += who(t, pa);
      // Belt.
      if (wk > 0) {
        let belt = `<rect x="200" y="${by}" width="1520" height="110" rx="55" fill="#5A5068"/><rect x="230" y="${by + 14}" width="1460" height="56" rx="28" fill="#857A96"/>`;
        for (let x = 230 + (t * 120) % 60; x < 1690; x += 60) belt += `<line x1="${x}" x2="${x}" y1="${by + 14}" y2="${by + 70}" stroke="#6E6480" stroke-width="3"/>`;
        out += fade(wk, belt + `<rect x="200" y="${by + 90}" width="1520" height="20" fill="#3F3850"/>`);
      }
      // Bags riding the belt (loop left -> right).
      const bagAt = (u) => 230 + ((u % 1) + 1) % 1 * 1460;
      const bag = (x, col, lab, k = 1) => `<g transform="translate(${x},${by + 30})" opacity="${k}"><rect x="-50" y="-70" width="100" height="72" rx="12" fill="${col}"/><path d="M-18,-70 Q0,-96 18,-70" stroke="${C.dark}" stroke-width="6" fill="none"/>${lab ? `<rect x="-40" y="-56" width="80" height="30" rx="6" fill="#fff"/>${txt(0, -33, lab, 20, C.purple)}` : ''}</g>`;
      if (wk > 0.9) {
        const sp = 0.06;
        out += bag(bagAt((t - s.start) * sp + 0.1), C.peach) + bag(bagAt((t - s.start) * sp + 0.45), C.teal);
        // Cat riding a suitcase.
        const cx = bagAt((t - s.start) * sp + 0.75);
        out += bag(cx, C.pinkL) + critter(t, 'cat', { x: cx, y: by - 38, scale: 0.55, seed: 4 });
      }
      // My bag (PIL tag) arrives at the spot.
      let myX = null;
      if (t > T.first && t < T.grab) myX = lerp(230, spotX, seg(t, T.first, T.grab));
      if (myX != null) out += bag(myX, C.purple, 'PIL');
      if (t > T.grab) out += A.sparkle(spotX, 760, T.grab, t) + pill(spotX + 300, 560, 'FIRST RETEST ✓', DK.teal, pop(t, T.grab, 0.6), 26);
      // Person B chasing along the belt.
      if (t > T.chaser && t < T.first + 1.5) {
        const k = seg(t, T.chaser, T.first + 1.5);
        const x = lerp(300, 1800, k);
        out += who(t, { x, y: 1000, scale: 0.9, look: A.LOOKS.b, seed: 6, walking: true, frontArm: { a1: -20 + Math.sin(t * 9) * 20, a2: -30 }, mood: 'sad' });
        out += [0, 1].map(i => `<path d="M${x - 50 - i * 16},${700 + i * 10} q-6,12 0,16 q6,-4 0,-16 Z" fill="${C.tealL}"/>`).join('');
        out += bub(x, 590, 'Wait up! 😩', 1, { size: 28 });
      }
      out += pill(700, 1040, 'chasing ✗', C.pink, between(t, T.chaser + 1, T.first + 1.5), 24);
      // Second time round: reassess.
      if (t > T.again) {
        const x = lerp(230, 1690, seg(t, T.again, s.end + 2));
        out += bag(x, C.purple, '2nd?', 0.45) + pill(Math.min(x, 1500), 640, 'back again? reassess', C.muted, pop(t, T.again, 0.6), 22);
      }
      return out;
    },
  });

  // __MORE__

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
