/**
 * scenes-s16.js: illustrated scene types for Section 16 lesson intro videos
 * (Phase 6 · Section 16: Managing the Trade, Lessons 9 to 16).
 *
 * Theme: manage the plan, not the emotion. Every LIVE entry is a pure
 * function of t, drawn on the 1920x1080 stage.
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

  /* ---------------- Section 16 extras ---------------- */
  const TYPES = ['sealed-envelope', 'ship-course', 'twin-climbers', 'gadget-robot', 'blueprint', 'balloon-pump',
    'relay-runners', 'haunted-ride', 'trapeze-net', 'round-trip-taxi', 'seed-digger', 'turbulence-pilot',
    'slot-vs-panel', 'podium', 'report-cards', 'journal-drawers'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s16-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));
  const LIVE = {};

  // Reveal a string letter by letter (k = 0..1).
  const typed = (s, k) => [...s].slice(0, Math.round([...s].length * clamp(k))).join('');
  // Which of a list of times is the latest one passed (-1 if none).
  const lastIdx = (t, arr) => { let j = -1; arr.forEach((a, i) => { if (t >= a) j = i; }); return j; };
  // Rolling sea: a filled wave band.
  const wave = (t, y, col, amp = 14, len = 160, speed = 60, op = 1) => {
    let d = `M0,1080 L0,${y}`;
    for (let x = 0; x <= 1920; x += 20) d += ` L${x},${f1(y + Math.sin((x + t * speed) / len * Math.PI * 2) * amp)}`;
    return `<path d="${d} L1920,1080 Z" fill="${col}" opacity="${op}"/>`;
  };
  // A small worry cloud: purple storm puff with a frown and a lightning tail.
  const worry = (t, x, y, k = 1, s = 1, o = {}) => {
    if (k <= 0) return '';
    const bl = blinkAmt(t, 7), j = Math.sin(t * 13) * 3;
    return scaleAt(x, y, k, `<g transform="translate(${f1(x + j)},${f1(y + Math.sin(t * 3) * 6)}) scale(${s})">
      <path d="M-6,30 L-18,58 L-2,54 L-12,84" stroke="${C.gold}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <ellipse cx="0" cy="0" rx="58" ry="34" fill="${o.col || '#9C95E6'}"/><ellipse cx="-36" cy="8" rx="34" ry="26" fill="${o.col || '#9C95E6'}"/><ellipse cx="38" cy="6" rx="36" ry="26" fill="${o.col || '#9C95E6'}"/><ellipse cx="4" cy="-22" rx="34" ry="26" fill="${o.col || '#9C95E6'}"/>
      <ellipse cx="-14" cy="0" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="14" cy="0" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/>
      <path d="M-24,-14 L-8,-8 M24,-14 L8,-8" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-10,${o.talk ? 16 : 20} Q0,${o.talk ? 10 + Math.abs(Math.sin(t * 11)) * 12 : 12} 10,${o.talk ? 16 : 20}" stroke="${C.dark}" stroke-width="4" fill="${o.talk ? '#6B2A2A' : 'none'}" stroke-linecap="round"/>
    </g>`);
  };
  // A seagull, (x, y) = feet. fly: wings flap.
  const gull = (t, x, y, s = 1, o = {}) => {
    const flap = o.fly ? Math.sin(t * 16) * 34 : Math.sin(t * 2.5) * 5, f = o.flip ? -1 : 1, bl = blinkAmt(t, 9);
    const talk = o.talk ? Math.abs(Math.sin(t * 12)) : 0;
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s * f},${s})">
      ${o.fly ? '' : `<path d="M-6,-4 L-8,0 M8,-4 L10,0" stroke="${C.peach}" stroke-width="4" stroke-linecap="round"/>`}
      <path d="M-40,-30 L-70,-26 L-40,-20 Z" fill="#D9D3CE"/>
      <ellipse cx="0" cy="-30" rx="40" ry="22" fill="#fff" stroke="#E2D9D2" stroke-width="3"/>
      <circle cx="30" cy="-56" r="18" fill="#fff" stroke="#E2D9D2" stroke-width="3"/>
      <ellipse cx="34" cy="-60" rx="4" ry="${f1(4.5 * (1 - bl * 0.9))}" fill="${C.dark}"/>
      <path d="M44,${-60 - talk * 4} L68,-54 L44,${-50 + talk * 4} Z" fill="${C.gold}"/>
      <path d="M-10,-34 Q-30,${-50 - flap} -52,${-40 - flap * 0.9} Q-30,-26 -6,-26 Z" fill="#C9C1BA"/>
    </g>`;
  };
  // A ghost, (x, y) = centre.
  const ghost = (t, x, y, s = 1, k = 1, o = {}) => {
    if (k <= 0) return '';
    const wob = Math.sin(t * 4) * 6, bl = blinkAmt(t, 11);
    let d = 'M-50,34 L-50,-20 Q-50,-80 0,-80 Q50,-80 50,-20 L50,34';
    for (let i = 1; i <= 5; i++) d += ` Q${50 - (i - 1) * 20 - 10},${f1(50 + Math.sin(t * 6 + i) * 6)} ${50 - i * 20},34`;
    return scaleAt(x, y, k, `<g transform="translate(${f1(x)},${f1(y + wob)}) scale(${s})" opacity=".95">
      <path d="${d} Z" fill="#fff" stroke="#E7E4FB" stroke-width="4"/>
      <ellipse cx="-16" cy="-30" rx="9" ry="${f1(13 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="16" cy="-30" rx="9" ry="${f1(13 * (1 - bl * 0.9))}" fill="${C.dark}"/>
      <ellipse cx="0" cy="${o.boo ? 2 : 0}" rx="${o.boo ? 14 : 8}" ry="${o.boo ? 16 : 6}" fill="#6B2A2A"/>
      <path d="M-50,-6 Q${-80 - wob},-20 -76,${-44 + wob}" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M50,-6 Q${80 + wob},-20 76,${-44 - wob}" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none"/>
    </g>`);
  };
  // Paper card with rows of text.
  const card = (x, y, w, h, col, inner, rot = 0) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x + 8}" y="${y + 10}" width="${w}" height="${h}" rx="18" fill="${C.dark}" opacity=".08"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="${col}" stroke-width="5"/>${inner}</g>`;
  // Tiny 4-point twinkle.
  const twinkle = (x, y, r, t, ph = 0, col = C.gold) => { const k = 0.5 + 0.5 * Math.sin(t * 4 + ph); return `<path d="M${x},${y - r * k} L${x + r * 0.25 * k},${y - r * 0.25 * k} L${x + r * k},${y} L${x + r * 0.25 * k},${y + r * 0.25 * k} L${x},${y + r * k} L${x - r * 0.25 * k},${y + r * 0.25 * k} L${x - r * k},${y} L${x - r * 0.25 * k},${y - r * 0.25 * k} Z" fill="${col}"/>`; };

  /* ================= Lesson 9: Plan the Trade Before You're In It ================= */
  Object.assign(LIVE, {
    // Before the open, she writes the plan on a card and seals it in an envelope. Her friend has only an entry.
    's16-sealed-envelope': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F4ECF7', '#E5DBEE');
      // Window with a slow sunrise and a clock: calm, before the open.
      const wk = pop(t, T.desk, 0.7);
      const sunY = lerp(660, 500, ease(seg(t, T.desk, s.end)));
      out += scaleAt(270, 660, wk, `<rect x="110" y="390" width="320" height="270" rx="20" fill="${C.purple}"/>
        <rect x="126" y="406" width="288" height="238" rx="12" fill="#FDE3CF"/>
        <clipPath id="s16win"><rect x="126" y="406" width="288" height="238" rx="12"/></clipPath>
        <g clip-path="url(#s16win)"><circle cx="300" cy="${f1(sunY)}" r="54" fill="${C.peach}"/><circle cx="300" cy="${f1(sunY)}" r="74" fill="${C.peachL}" opacity=".35"/>
          <path d="M126,600 Q200,560 270,592 Q340,560 414,590 L414,644 L126,644 Z" fill="${C.tealL}"/></g>
        <rect x="266" y="406" width="8" height="238" fill="${C.purple}"/><rect x="126" y="520" width="288" height="8" fill="${C.purple}"/>`);
      out += pill(270, 372, '8:15 · before the open', C.muted, pop(t, T.desk + 0.6), 22);
      // Easel + plan card.
      const ck = pop(t, T.desk + 0.4, 0.7), sealK = ease(seg(t, T.seal, T.seal + 1));
      const rows = [['STOP', '30 pts'], ['TARGET', '60 pts'], ['MODEL', 'fixed'], ['STEP IN EARLY IF', '1M close below 1H HL']];
      if (sealK < 1) {
        let c = `<path d="M700,860 L640,1000 M1040,860 L1100,1000 M870,860 L870,1000" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>`;
        c += card(560, 400, 620, 470, C.purple, `${txt(870, 456, 'MY TRADE PLAN', 30, C.purple, { ls: 3 })}<rect x="600" y="476" width="540" height="4" rx="2" fill="${C.purpleL}"/>`);
        rows.forEach(([lab, val], i) => {
          const y = 540 + i * 84, k = seg(t, T.rows[i], T.rows[i] + 1.1);
          c += txt(600, y, lab, 22, C.muted, { a: 'start', w: 700, ls: 1 });
          c += `<rect x="600" y="${y + 14}" width="540" height="3" fill="#EFE6F7"/>`;
          if (k > 0) c += txt(1140, y + 4, typed(val, k), i === 3 ? 26 : 32, DK.purple, { a: 'end' });
          if (k >= 1) c += check(1160, y - 6, pop(t, T.rows[i] + 1.1, 0.4), C.teal, 14);
        });
        const sc = lerp(1, 0.5, sealK), dy = lerp(0, 230, sealK);
        out += fade(1 - sealK * 0.6, scaleAt(870, 640, ck, `<g transform="translate(870,${f1(640 + dy)}) scale(${sc}) translate(-870,-640)">${c}</g>`));
      }
      // Envelope swallows the card.
      const ek = pop(t, T.seal - 0.2, 0.5);
      if (ek > 0) {
        const flap = ease(seg(t, T.seal + 0.9, T.seal + 1.4));
        let e = `<rect x="670" y="770" width="400" height="230" rx="14" fill="#FFF6EA" stroke="${C.peach}" stroke-width="5"/>
          <path d="M670,1000 L870,880 L1070,1000" fill="none" stroke="#F1D9BE" stroke-width="4"/>
          <path d="M672,${f1(772)} L870,${f1(772 + 130 * (flap * 2 - 1))} L1068,772 Z" fill="${flap > 0.5 ? '#FBE7CE' : '#F6DCC0'}" stroke="${C.peach}" stroke-width="4" stroke-linejoin="round"/>`;
        out += scaleAt(870, 1000, ek, e);
        const wax = pop(t, T.seal + 1.5, 0.5);
        if (wax > 0) out += scaleAt(870, 900, wax, `<circle cx="870" cy="900" r="50" fill="${C.pink}"/><circle cx="870" cy="900" r="40" fill="none" stroke="${C.pinkL}" stroke-width="3"/>${txt(870, 908, 'LOCKED', 20, '#fff', { ls: 1 })}`) + A.sparkle(870, 900, T.seal + 1.6, t);
        out += pill(870, 720, 'sealed before money moves', C.purple, pop(t, T.seal + 2, 0.5), 24);
      }
      // Trader writes, then holds up a thumb.
      const tr = { x: 380, y: 1000, scale: 1, look: A.LOOKS.a, seed: 3, at: T.desk + 0.2, talk: ctx.talking && !(t > T.friend + 0.2 && t < T.friend + 3.4) };
      const ri = lastIdx(t, T.rows);
      if (ri >= 0 && t < T.rows[ri] + 1.2 && t < T.seal) {
        const k = seg(t, T.rows[ri], T.rows[ri] + 1.1);
        tr.frontArm = aim(tr, lerp(520, 520, k), 520 + ri * 50 + Math.sin(t * 20) * 6);
        tr.hold = `<g transform="rotate(-30)"><rect x="-5" y="-40" width="10" height="44" rx="4" fill="${C.pink}"/><path d="M-5,4 L5,4 L0,14 Z" fill="${C.dark}"/></g>`;
      } else if (t > T.seal + 1.5) tr.frontArm = { a1: -40, a2: -100 };
      out += who(t, tr);
      // Cat on the floor watching the pen.
      out += crit(t, 'cat', { x: 1250, y: 1000, scale: 0.7, seed: 4, at: T.desk + 1, sleep: t > T.seal + 2.4 && t < T.friend });
      // Friend with an empty card.
      if (t > T.friend) {
        const fk = ease(seg(t, T.friend, T.friend + 1.8));
        const fr = { x: lerp(2050, 1580, fk), y: 1000, scale: 0.95, look: A.LOOKS.b, flip: true, seed: 6, walking: fk < 1, talk: ctx.talking && t > T.friend + 0.2 && t < T.friend + 3.4 };
        fr.frontArm = { a1: -60, a2: -80 };
        fr.hold = `<g transform="translate(0,-40) rotate(-6)"><rect x="-56" y="-44" width="112" height="88" rx="10" fill="#fff" stroke="${C.peach}" stroke-width="4"/>${txt(0, -14, 'PLAN', 18, C.peach, { ls: 2 })}${txt(0, 26, '?', 40, '#E6D3C2')}</g>`;
        out += who(t, fr);
      }
      out += bub(1580, 560, 'I’ll see how it feels 🤷', between(t, T.friend + 1.4, T.verdict - 0.2), { size: 28, tail: 'right' });
      out += pill(1580, 520, 'entry plan ✓', DK.teal, pop(t, T.verdict, 0.5), 28);
      out += pill(1580, 600, 'trade plan ✗', C.pink, pop(t, T.verdict + 1.4, 0.5), 28);
      out += crit(t, 'bird', { x: 1840, y: 1000, scale: 0.8, seed: 2, at: T.friend + 1.6, hop: t > T.verdict ? 5 : 0, hopH: 14, flip: true });
      return out;
    },

    // A captain sails a course set in port. Waves of P&L and a squawking gull; she asks: what changed?
    's16-ship-course': (s, t, ctx) => {
      const T = s.beats;
      const sk = ease(seg(t, s.start, s.start + 0.8));
      let out = `<rect x="0" y="380" width="1920" height="700" fill="#EAF6F4" opacity="${sk}"/>`;
      out += cloud(300 + (t * 12) % 300, 430, 0.8) + cloud(1500 - (t * 8) % 200, 470, 0.6);
      // Island target on the horizon, with a flag.
      const ik = pop(t, T.course, 0.7);
      out += scaleAt(1660, 700, ik, `<path d="M1480,712 Q1660,560 1840,712 Z" fill="${C.peachL}"/><path d="M1560,690 Q1600,640 1640,690" fill="${C.cash}"/>
        <rect x="1694" y="560" width="8" height="120" fill="${C.dark}"/><path d="M1702,${f1(566 + Math.sin(t * 5) * 3)} L1780,580 L1702,${f1(604 + Math.sin(t * 5 + 1) * 3)} Z" fill="${C.teal}"/>`);
      out += pill(1740, 520, 'TARGET +60', DK.teal, pop(t, T.course + 0.5), 24);
      // Stop buoy behind.
      out += scaleAt(170, 740, pop(t, T.course + 0.9), `<g transform="rotate(${f1(Math.sin(t * 2) * 8)} 170 740)"><path d="M140,740 L200,740 L186,680 L154,680 Z" fill="${C.pink}"/><rect x="164" y="640" width="12" height="40" fill="${C.dark}"/><circle cx="170" cy="636" r="10" fill="${C.gold}"/></g>`);
      out += pill(170, 600, 'STOP −30', C.pink, pop(t, T.course + 1.1), 22);
      // Course line.
      const lk = ease(seg(t, T.course + 0.6, T.course + 2));
      if (lk > 0) out += `<line x1="760" y1="720" x2="${f1(lerp(760, 1500, lk))}" y2="${f1(lerp(720, 706, lk))}" stroke="${C.purple}" stroke-width="6" stroke-dasharray="16 12" opacity=".7"/>`;
      // Sea calm, then rough.
      const rough = seg(t, T.waves, T.waves + 1) * (1 - 0.6 * seg(t, T.calm, T.calm + 2));
      out += wave(t, 712, C.tealL, 8 + rough * 22, 220, 50, 0.9);
      // Ship.
      const roll = Math.sin(t * 1.6) * (3 + rough * 9), heave = Math.sin(t * 1.6 + 1) * (6 + rough * 20);
      const shx = 560, shy = 760 + heave;
      let ship = `<path d="M330,0 L790,0 L730,110 L390,110 Z" fill="${C.pink}"/><rect x="330" y="-14" width="460" height="20" rx="6" fill="${DK.pink}"/>
        ${[420, 520, 620].map(x => `<circle cx="${x}" cy="50" r="16" fill="#FDE8ED" stroke="${DK.pink}" stroke-width="4"/>`).join('')}
        <rect x="552" y="-340" width="14" height="340" fill="#9B6A45"/>
        <path d="M570,-330 Q700,-200 570,-30 Z" fill="#fff" stroke="#EADFD8" stroke-width="4"/><path d="M548,-310 Q450,-190 548,-40 Z" fill="${C.cream}" stroke="#EADFD8" stroke-width="4"/>
        <circle cx="720" cy="-40" r="34" fill="none" stroke="#9B6A45" stroke-width="8"/>${[0, 45, 90, 135].map(a => `<line x1="${720 + Math.cos(rad(a + t * 10)) * 44}" y1="${-40 + Math.sin(rad(a + t * 10)) * 44}" x2="${720 - Math.cos(rad(a + t * 10)) * 44}" y2="${-40 - Math.sin(rad(a + t * 10)) * 44}" stroke="#9B6A45" stroke-width="6"/>`).join('')}`;
      // Sealed plan pinned to the mast.
      ship += `<g transform="translate(610,-170) rotate(6)"><rect x="-44" y="-30" width="88" height="60" rx="6" fill="#FFF6EA" stroke="${C.peach}" stroke-width="3"/><path d="M-44,-30 L0,4 L44,-30" fill="none" stroke="${C.peach}" stroke-width="3"/><circle cx="0" cy="8" r="13" fill="${C.pink}"/></g>`;
      const bk = pop(t, s.start + 0.3, 0.8);
      out += scaleAt(shx, 870, bk, `<g transform="translate(${shx - 560},${f1(shy - 760)}) rotate(${f1(roll)} 560 760)"><g transform="translate(0,760)">${ship}</g>
        ${A.person(t, Object.assign({ x: 660, y: 744, scale: 0.62, look: A.LOOKS.c, seed: 5, talk: ctx.talking && t > T.ask - 0.4 }, t > T.ask && t < T.calm + 1 ? { frontArm: { a1: -60, a2: -110 }, hold: `<g transform="translate(0,-26)"><rect x="-34" y="-24" width="68" height="48" rx="6" fill="#FFF6EA" stroke="${C.peach}" stroke-width="3"/><circle cx="0" cy="2" r="9" fill="${C.pink}"/></g>` } : { frontArm: { a1: 20, a2: -10 } }))}
        ${hat(t, { x: 660, y: 744, scale: 0.62, seed: 5 }, 'cap')}</g>`);
      // Front wave over the hull.
      out += wave(t + 1.3, 860, C.teal, 6 + rough * 16, 180, -70, 0.85) + wave(t, 930, '#9ED9D1', 6 + rough * 10, 260, 40);
      // P&L spray numbers.
      const nums = ['+$40', '+$86', '+$124', '+$61', '+$18', '−$12'];
      nums.forEach((n, i) => {
        const at = T.waves + 0.6 + i * 0.75, p = seg(t, at, at + 2.4);
        if (p <= 0 || p >= 1) return;
        const x = 900 + i * 110, y = 820 - ease(p) * 260;
        out += fade(Math.sin(p * Math.PI) * 1.4, txt(x, y, n, 46, n[0] === '+' ? DK.teal : DK.pink, { f: 'Playfair Display' }));
      });
      // Dolphin leaps now and then.
      const dp = ((t - s.start) % 6) / 1.6;
      if (dp < 1 && t > T.course) {
        const dx = 1300 + dp * 260, dy = 900 - Math.sin(dp * Math.PI) * 160;
        out += `<g transform="translate(${f1(dx)},${f1(dy)}) rotate(${f1(-50 + dp * 100)})"><ellipse cx="0" cy="0" rx="56" ry="20" fill="${C.purple}"/><path d="M-50,0 L-80,-18 L-74,0 L-80,18 Z" fill="${C.purple}"/><path d="M0,-18 L-14,-38 L14,-18 Z" fill="${C.purple}"/><circle cx="34" cy="-6" r="4" fill="#fff"/></g>`;
      }
      // Gull on the mast, squawking.
      const gk = pop(t, T.gull, 0.6);
      const sayIdx = lastIdx(t, T.squawk);
      if (gk > 0) out += scaleAt(566, 430, gk, `<g transform="translate(0,${f1(heave)})">${gull(t, 566, 432, 0.9, { talk: ctx.talking && t > T.squawk[0] && t < T.ask })}</g>`);
      out += bub(840, 430, 'Take profit! 💰', between(t, T.squawk[0], T.squawk[1] - 0.2), { size: 28 });
      out += bub(840, 430, 'Move the stop! 😱', between(t, T.squawk[1], T.ask - 0.2), { size: 28 });
      out += bub(900, 480, 'What changed? 🤔', between(t, T.ask, T.checks[0] - 0.1), { size: 30 });
      // Checklist board.
      const items = [['structure', 'same'], ['plan', 'same'], ['the number', 'moved']];
      items.forEach(([a, b], i) => {
        const k = pop(t, T.checks[i], 0.5);
        if (k <= 0) return;
        const y = 440 + i * 80;
        out += scaleAt(1140, y, k, `<rect x="980" y="${y - 32}" width="330" height="64" rx="32" fill="#fff" stroke="${i < 2 ? C.teal : C.peach}" stroke-width="4"/>${txt(1010, y + 9, a, 26, C.text, { a: 'start', w: 700 })}${txt(1250, y + 9, b, 26, i < 2 ? DK.teal : DK.peach, { a: 'end' })}`) + (i < 2 ? check(1340, y, k, C.teal, 22) : '');
      });
      out += pill(1145, 690, 'hold the course ⛵', C.purple, pop(t, T.calm, 0.6), 28);
      if (t > T.calm) out += A.sparkle(1145, 690, T.calm + 0.2, t);
      return out;
    },
  });

  /* ================= Lesson 10: Fixed Targets vs Structure-Based Targets ================= */
  Object.assign(LIVE, {
    // Two climbers on the same cliff. One keeps her anchor where she set it; one re-clips at each new ledge, by rule.
    's16-twin-climbers': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#EAF4FB" opacity="${ease(seg(t, s.start, s.start + 0.8))}"/>` + cloud(900 + Math.sin(t * 0.4) * 60, 430, 0.7) + ground(1000, '#E9E3D6', '#D9CFC0');
      // Price path in points, over time.
      const c0 = T.climb, keys = [[c0, 0], [c0 + 3, 31], [c0 + 5.2, 19], [c0 + 8.4, 42]];
      let pts = 0;
      if (t > c0) {
        let j = 0; while (j < keys.length - 2 && t >= keys[j + 1][0]) j++;
        pts = lerp(keys[j][1], keys[j + 1][1], ease(seg(t, keys[j][0], keys[j + 1][0])));
      }
      const Y = p => 950 - (p + 30) / 90 * 420;
      const walls = [{ x: 180, name: 'FIXED', col: C.peach, dk: DK.peach, look: A.LOOKS.d, plan: 'hold to +60 or −30' },
        { x: 1160, name: 'STRUCTURE', col: C.purple, dk: DK.purple, look: A.LOOKS.e, plan: 'trail under each new HL' }];
      walls.forEach((w, wi) => {
        const k = pop(t, T.walls + wi * 0.3, 0.7);
        if (k <= 0) return;
        const W = 580, x0 = w.x, cx = x0 + W / 2;
        let g = `<path d="M${x0},1000 L${x0 + 30},${Y(60) - 30} Q${cx},${Y(60) - 70} ${x0 + W - 30},${Y(60) - 30} L${x0 + W},1000 Z" fill="#D9B999"/>
          <path d="M${x0 + 40},1000 L${x0 + 60},${Y(60)} L${x0 + 110},1000 Z" fill="#C9A47F" opacity=".5"/>`;
        [-30, 0, 19, 31, 42, 60].forEach(p => { g += `<rect x="${x0 + 50}" y="${Y(p) - 4}" width="${W - 100}" height="8" rx="4" fill="#B88D66" opacity=".45"/>`; });
        // Target flag + stop peg labels.
        g += `<rect x="${cx - 4}" y="${Y(60) - 120}" width="8" height="90" fill="${C.dark}"/><path d="M${cx + 4},${f1(Y(60) - 116 + Math.sin(t * 5) * 3)} L${cx + 70},${Y(60) - 100} L${cx + 4},${Y(60) - 84} Z" fill="${C.teal}"/>`;
        out += scaleAt(cx, 1000, k, g);
        out += pill(cx - 150, Y(60) - 30, 'TARGET +60', DK.teal, pop(t, T.walls + 0.6 + wi * 0.3), 22);
        // Plan clipboard.
        const pk = pop(t, T.plans[wi], 0.6);
        out += scaleAt(cx, 1030, pk, `<rect x="${cx - 240}" y="996" width="480" height="68" rx="16" fill="#fff" stroke="${w.col}" stroke-width="5"/><rect x="${cx - 240}" y="996" width="150" height="68" rx="16" fill="${w.col}"/>
          ${txt(cx - 165, 1039, w.name === 'FIXED' ? 'FIXED' : 'STRUCT.', 24, '#fff')}${txt(cx + 75, 1039, w.plan, 24, w.dk, { w: 800 })}`);
        // Anchor (stop): right wall trails to +18 after the new HL.
        const trail = wi === 1 ? ease(seg(t, T.trail, T.trail + 1)) : 0;
        const sp = lerp(-30, 18, trail), ax = cx - 120, ay = Y(sp);
        // Climber.
        const ux = cx + 70 + Math.sin(pts / 9) * 60, uy = Y(pts) + 20;
        const hold = t > c0 ? 1 : 0;
        if (k > 0.5) {
          out += `<path d="M${ax},${f1(ay)} Q${f1((ax + ux) / 2)},${f1(Math.max(ay, uy) + 60)} ${f1(ux)},${f1(uy - 30)}" stroke="${C.pink}" stroke-width="5" fill="none"/>`;
          out += `<circle cx="${ax}" cy="${f1(ay)}" r="16" fill="${C.dark}"/><circle cx="${ax}" cy="${f1(ay)}" r="8" fill="${C.gold}"/>`;
          out += pill(ax - 110, ay, wi === 1 && trail > 0.5 ? 'STOP +18' : 'STOP −30', C.pink, pop(t, T.walls + 0.8 + wi * 0.3) * (wi === 1 && t > T.trail && t < T.trail + 1 ? 0.9 + 0.1 * Math.sin(t * 20) : 1), 20);
          out += who(t, { x: ux, y: uy + 70, scale: 0.55, look: w.look, seed: 3 + wi, flip: wi === 1, frontArm: { a1: -100 + Math.sin(t * 6 + wi) * 12 * hold, a2: -90 }, backArm: { a1: -80 - Math.sin(t * 6 + wi) * 12 * hold, a2: -90 }, talk: false });
        }
        if (wi === 1 && t > T.trail) out += A.sparkle(ax, ay, T.trail + 0.8, t, C.purple);
      });
      out += pill(1450, Y(19) + 50, 'new 1M higher low', C.purple, between(t, T.hl, T.ask - 0.4), 22);
      // Referee in the middle with a dog.
      const rf = { x: 960, y: 1000, scale: 0.78, look: A.LOOKS.c, seed: 8, at: T.walls + 0.6, talk: ctx.talking && t > T.ask, hat: 'cap' };
      if (t > T.ask - 0.2 && t < T.verdict) rf.frontArm = { a1: -150, a2: -170 };
      else if (t > T.verdict) rf.frontArm = { a1: -40, a2: -100 };
      out += who(t, rf);
      out += crit(t, 'dog', { x: 1050, y: 1000, scale: 0.5, seed: 4, at: T.walls + 1, hop: t > T.verdict ? 6 : 0, hopH: 16, flip: true });
      out += bub(960, 560, 'Who’s wrong? 🧐', between(t, T.ask, T.verdict - 0.1), { size: 30 });
      out += bub(960, 560, 'Neither! ✓', between(t, T.verdict, s.end), { size: 32 });
      out += check(370, 640, pop(t, T.verdict + 0.8), C.teal, 30) + check(1550, 640, pop(t, T.verdict + 1.1), C.teal, 30);
      return out;
    },

    // A many-armed adaptive robot: powerful, but an open hatch lets a worry cloud in until rules are snapped in.
    's16-gadget-robot': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EEF3F2', '#DDE7E5');
      // Workshop shelf behind.
      out += fade(seg(t, s.start, s.start + 0.8), `<rect x="120" y="470" width="420" height="16" rx="6" fill="#C9A47F"/>${[0, 1, 2, 3].map(i => `<rect x="${150 + i * 96}" y="${410 + (i % 2) * 12}" width="60" height="${60 - (i % 2) * 12}" rx="8" fill="${[C.tealL, C.pinkL, C.peachL, C.purpleL][i]}"/>`).join('')}`);
      const rk = pop(t, T.robot, 0.8);
      const chaos = seg(t, T.gremlin + 0.6, T.gremlin + 1.2) * (1 - seg(t, T.calm, T.calm + 0.8));
      const rx = 1100, bob = Math.sin(t * 3) * 4 + chaos * Math.sin(t * 17) * 8;
      if (rk > 0) {
        let r = '';
        // Treads.
        r += `<rect x="930" y="900" width="340" height="90" rx="45" fill="${C.dark}"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${980 + i * 60}" cy="945" r="22" fill="#6B5A52"/><circle cx="${980 + i * 60}" cy="945" r="8" fill="${C.gold}"/>`).join('')}`;
        // Arms with tools.
        const tools = [['mag', -1, 640], ['hook', -1, 760], ['ruler', 1, 640], ['wrench', 1, 760]];
        tools.forEach(([kind, side, sy], i) => {
          const tk = pop(t, T.tools[Math.min(2, i === 3 ? 2 : i)] + (i === 3 ? 0.4 : 0), 0.5);
          if (tk <= 0) return;
          const base = side < 0 ? 200 : -20, a1 = base + side * (i % 2 ? 20 : -10) + Math.sin(t * 2 + i) * 6 + chaos * Math.sin(t * 9 + i * 2) * 60;
          const a2 = a1 + side * -30 + chaos * Math.sin(t * 11 + i) * 50;
          const sx = side < 0 ? 950 : 1250;
          const ex = sx + Math.cos(rad(a1)) * 110 * tk, ey = sy + bob + Math.sin(rad(a1)) * 110 * tk;
          const hx = ex + Math.cos(rad(a2)) * 100 * tk, hy = ey + Math.sin(rad(a2)) * 100 * tk;
          let tool = '';
          if (kind === 'mag') tool = `<circle r="26" fill="#E8F8F6" stroke="${C.dark}" stroke-width="7"/>`;
          if (kind === 'hook') tool = `<path d="M0,-10 L0,10 Q0,34 20,30" stroke="${C.muted}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
          if (kind === 'ruler') tool = `<rect x="-10" y="-40" width="20" height="80" rx="4" fill="${C.gold}"/>${[0, 1, 2, 3].map(j => `<line x1="-10" x2="0" y1="${-30 + j * 20}" y2="${-30 + j * 20}" stroke="${C.dark}" stroke-width="3"/>`).join('')}`;
          if (kind === 'wrench') tool = `<rect x="-6" y="-36" width="12" height="60" rx="6" fill="${C.muted}"/><circle cy="-38" r="16" fill="${C.muted}"/><rect x="-6" y="-58" width="12" height="20" fill="#EEF3F2"/>`;
          r += `<path d="M${sx},${f1(sy + bob)} L${f1(ex)},${f1(ey)} L${f1(hx)},${f1(hy)}" stroke="${C.tealD}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="${f1(ex)}" cy="${f1(ey)}" r="14" fill="${DK.teal}"/><g transform="translate(${f1(hx)},${f1(hy)}) rotate(${f1(a2 + 90)})">${tool}</g>`;
        });
        // Body + head.
        r += `<g transform="translate(0,${f1(bob)})"><rect x="950" y="600" width="300" height="300" rx="40" fill="${C.teal}" stroke="${DK.teal}" stroke-width="6"/>
          <rect x="990" y="660" width="220" height="110" rx="18" fill="#fff"/>`;
        // Rule slot: empty, then a book inserted.
        const bk = ease(seg(t, T.book + 1, T.book + 1.6));
        r += `<rect x="1020" y="800" width="160" height="22" rx="8" fill="${C.dark}"/>`;
        if (bk > 0) r += `<g transform="translate(0,${f1(-60 * (1 - bk))})"><rect x="1030" y="${f1(780 - 40 * (1 - bk))}" width="140" height="46" rx="6" fill="${C.pink}"/>${txt(1100, f1(812 - 40 * (1 - bk)), 'RULES', 22, '#fff', { ls: 2 })}</g>`;
        // Screen: wiggly line in chaos, steady after.
        let d = 'M1010,715';
        for (let x = 1010; x <= 1190; x += 10) d += ` L${x},${f1(715 + Math.sin(x / 14 + t * (chaos > 0.1 ? 12 : 2)) * (6 + chaos * 30))}`;
        r += `<path d="${d}" stroke="${chaos > 0.1 ? C.pink : C.tealD}" stroke-width="5" fill="none"/>`;
        // Head with hatch.
        const hatch = t > T.calm ? 1 - ease(seg(t, T.calm, T.calm + 0.6)) : ease(seg(t, T.robot + 1, T.robot + 1.6));
        const bl = blinkAmt(t, 2);
        r += `<rect x="1010" y="460" width="180" height="130" rx="28" fill="${C.teal}" stroke="${DK.teal}" stroke-width="6"/>
          <rect x="1086" y="580" width="28" height="24" fill="${DK.teal}"/>
          <circle cx="1060" cy="520" r="${chaos > 0.1 ? 22 : 18}" fill="#fff"/><circle cx="1140" cy="520" r="${chaos > 0.1 ? 22 : 18}" fill="#fff"/>
          <ellipse cx="1060" cy="522" rx="9" ry="${f1(9 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="1140" cy="522" rx="9" ry="${f1(9 * (1 - bl * 0.9))}" fill="${C.dark}"/>
          ${chaos > 0.1 ? `<ellipse cx="1100" cy="564" rx="16" ry="10" fill="#6B2A2A"/>` : `<path d="M1076,560 Q1100,576 1124,560" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`}
          <g transform="rotate(${f1(-70 * hatch)} 1040 460)"><rect x="1040" y="446" width="120" height="16" rx="6" fill="${DK.teal}"/></g></g>`;
        out += scaleAt(rx, 1000, rk, r);
      }
      // Tool labels.
      [['highs &amp; lows', 470, 560], ['liquidity', 470, 630], ['new structure', 1480, 470]].forEach(([l, x, y], i) => { out += pill(x, y, l, DK.teal, between(t, T.tools[i] + 0.3, T.gremlin), 24); });
      out += pill(1290, 470, 'undefined', C.pink, between(t, T.robot + 1.6, T.book + 1), 22);
      // Worry cloud flies into the hatch.
      if (t > T.gremlin && t < T.calm + 1.6) {
        const p = ease(seg(t, T.gremlin, T.gremlin + 0.8)), out2 = ease(seg(t, T.calm, T.calm + 1.2));
        const gx = lerp(lerp(1700, 1110, p), 1720, out2), gy = lerp(lerp(420, 420, p), 360, out2);
        out += worry(t, gx, gy + Math.sin(t * 8) * 8 * (1 - out2), 1 - seg(t, T.calm + 0.8, T.calm + 1.6), 0.8, { talk: t < T.calm });
      }
      out += bub(1440, 560, 'MOVE IT! CLOSE IT! 😱', between(t, T.gremlin + 1, T.book), { size: 28, tail: 'left' });
      // Trader with the rulebook.
      const wk = ease(seg(t, T.book, T.book + 1));
      const tr = { x: lerp(500, 760, wk), y: 1000, scale: 0.95, look: A.LOOKS.seller, seed: 5, at: T.robot + 0.4, walking: wk > 0 && wk < 1, talk: ctx.talking && t > T.book };
      if (t > T.book && t < T.book + 1.7) { tr.frontArm = aim(tr, 900, 790); tr.hold = wk < 0.95 ? `<rect x="-30" y="-24" width="60" height="40" rx="6" fill="${C.pink}"/>` : ''; }
      else if (t > T.calm + 0.4) tr.frontArm = { a1: -40, a2: -100 };
      out += who(t, tr);
      // Small fixed robot joins.
      out += crit(t, 'robot', { x: 1730, y: 1000, scale: 0.9, seed: 3, at: T.small, screen: 'FIX', col: C.peachL, talk: false });
      out += pill(1730, 740, 'FIXED · predefined ✓', DK.peach, pop(t, T.badges, 0.6), 24);
      out += pill(1100, 400, 'STRUCTURE · predefined ✓', DK.teal, pop(t, T.badges + 0.5, 0.6), 24);
      if (t > T.badges) out += A.sparkle(1730, 740, T.badges + 0.2, t) + A.sparkle(1100, 400, T.badges + 0.7, t);
      return out;
    },
  });

  /* ================= Lesson 11: Understanding the Dayli ICC Management Example ================= */
  Object.assign(LIVE, {
    // An architect's blueprint of the 30/60 MNQ example, stamped EXAMPLE. A parrot memorizes dollars; an owl reads structure.
    's16-blueprint': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3EEE8', '#E4DAD0');
      const bk = pop(t, T.board, 0.8);
      const BP = '#5E70B8', LN = '#DDE4FF';
      const yE = 720, yS = yE + 120, yT = yE - 240;
      let b = `<path d="M640,960 L600,1000 M1120,960 L1160,1000" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
        <rect x="520" y="400" width="720" height="570" rx="16" fill="${BP}"/>`;
      for (let x = 540; x < 1240; x += 40) b += `<line x1="${x}" y1="410" x2="${x}" y2="960" stroke="#fff" stroke-width="1" opacity=".12"/>`;
      for (let y = 420; y < 970; y += 40) b += `<line x1="530" y1="${y}" x2="1230" y2="${y}" stroke="#fff" stroke-width="1" opacity=".12"/>`;
      b += txt(550, 948, 'DAYLI ICC · MNQ', 20, LN, { a: 'start', ls: 3 });
      out += scaleAt(880, 1000, bk, b);
      if (bk > 0.5) {
        // Entry line.
        out += `<line x1="700" y1="${yE}" x2="1180" y2="${yE}" stroke="#fff" stroke-width="5"/>` + txt(1180, yE - 14, 'ENTRY', 22, '#fff', { a: 'end' });
        const sk = ease(seg(t, T.lines[0], T.lines[0] + 0.8)), tk = ease(seg(t, T.lines[1], T.lines[1] + 0.8));
        if (sk > 0) out += `<line x1="700" y1="${yS}" x2="${f1(lerp(700, 1180, sk))}" y2="${yS}" stroke="${C.pinkL}" stroke-width="5" stroke-dasharray="14 10"/>
          <path d="M640,${yE} L640,${f1(lerp(yE, yS, sk))}" stroke="${C.pinkL}" stroke-width="5"/><path d="M628,${yE + 12} L640,${yE} L652,${yE + 12}" stroke="${C.pinkL}" stroke-width="5" fill="none"/>`
          + fade(sk, txt(1180, yS + 36, 'STOP', 22, C.pinkL, { a: 'end' })) + pill(640, (yE + yS) / 2, '30 pts', C.pink, pop(t, T.lines[0] + 0.6), 24);
        if (tk > 0) out += `<line x1="700" y1="${yT}" x2="${f1(lerp(700, 1180, tk))}" y2="${yT}" stroke="${C.tealL}" stroke-width="5" stroke-dasharray="14 10"/>
          <path d="M640,${yE} L640,${f1(lerp(yE, yT, tk))}" stroke="${C.tealL}" stroke-width="5"/>`
          + fade(tk, txt(1180, yT - 14, 'TARGET', 22, C.tealL, { a: 'end' })) + pill(640, (yE + yT) / 2, '60 pts', DK.teal, pop(t, T.lines[1] + 0.6), 24);
        // A little price path between.
        const pk = seg(t, T.board + 0.8, T.lines[1] + 2);
        let d = `M720,${yE}`;
        for (let i = 1; i <= 20 * pk; i++) d += ` L${720 + i * 22},${f1(yE - i * 9 + Math.sin(i * 1.3) * 26)}`;
        if (pk > 0) out += `<path d="${d}" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linejoin="round"/>`;
        out += stamp(930, 860, '1:2', C.gold, ease(seg(t, T.ratio, T.ratio + 0.3)), -12, 54, 34);
      }
      // Dollar math cards.
      const math = [['30 pts × $2 × 4 MNQ', '$240 risk', C.pink, DK.pink], ['60 pts × $2 × 4 MNQ', '$480 gross reward', C.teal, DK.teal]];
      math.forEach(([a, b2, col, dk], i) => {
        const k = pop(t, T.math[i], 0.6);
        if (k <= 0) return;
        const y = 420 + i * 140;
        out += scaleAt(1560, y + 50, k, card(1300, y, 520, 120, col, `${txt(1560, y + 46, a, 26, C.muted, { w: 800 })}${txt(1560, y + 96, b2, 40, dk, { f: 'Playfair Display', w: 700 })}`, i ? 1.5 : -1.5));
      });
      out += pill(1560, 712, 'before fees &amp; slippage', C.muted, pop(t, T.math[1] + 1.2), 22);
      // EXAMPLE sticky note slapped on.
      const ek = ease(seg(t, T.example, T.example + 0.35));
      if (ek > 0) out += `<g transform="translate(1100,470) rotate(${f1(8 + (1 - ek) * 30)}) scale(${f1(1 + (1 - ek) * 0.8)})" opacity="${f1(clamp(ek * 2))}"><rect x="-120" y="-50" width="240" height="100" rx="6" fill="${C.gold}"/><rect x="-120" y="-50" width="240" height="18" fill="#C98A1F" opacity=".4"/>${txt(0, 18, 'EXAMPLE', 40, C.dark, { f: 'Playfair Display', w: 700 })}</g>`;
      out += pill(1100, 560, 'not universal', C.purple, pop(t, T.example + 1.6), 22);
      out += pill(1100, 610, 'not a recommendation', C.purple, pop(t, T.example + 2.6), 22);
      // Architect pointing.
      const ar = { x: 340, y: 1000, scale: 1, look: A.LOOKS.b, seed: 2, at: T.board + 0.2, talk: ctx.talking && t < T.parrot, hat: 'beret' };
      ar.frontArm = t > T.lines[0] && t < T.math[0] ? aim(ar, 520, 760 - Math.sin(t * 2) * 30) : t > T.example - 0.4 && t < T.example + 0.6 ? aim(ar, 470, 580) : { a1: 60, a2: 80 };
      out += who(t, ar);
      // Parrot on a perch and owl on the floor.
      const pk2 = pop(t, T.parrot, 0.6);
      out += scaleAt(1420, 1000, pk2, `<rect x="1414" y="880" width="12" height="120" fill="#9B6A45"/><rect x="1360" y="874" width="120" height="12" rx="6" fill="#9B6A45"/>` + critter(t, 'parrot', { x: 1420, y: 880, scale: 0.9, seed: 3, talk: ctx.talking && t > T.parrot && t < T.owl }));
      out += bub(1580, 790, '$240! $240! 🦜', between(t, T.parrot + 0.4, T.owl), { size: 28 });
      out += crit(t, 'owl', { x: 1700, y: 1000, scale: 0.9, seed: 4, at: T.parrot + 0.6, talk: ctx.talking && t > T.owl });
      out += bub(1660, 820, 'Learn the structure 🦉', between(t, T.owl, s.end), { size: 26, tail: 'right' });
      if (t > T.owl) out += A.sparkle(1700, 900, T.owl + 0.3, t, C.purple);
      return out;
    },

    // A balloon pump: more contracts inflate the dollar balloon. The chart's points never move.
    's16-balloon-pump': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EEF6F2', '#DCEBE3');
      // Chart panel on the left.
      const ck = pop(t, T.panel, 0.7);
      const yE = 700, yS = yE + 120, yT = yE - 240;
      let p = `<rect x="160" y="420" width="600" height="540" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="4"/>${txt(460, 940, 'THE CHART', 22, C.muted, { ls: 3 })}
        <line x1="200" y1="${yE}" x2="640" y2="${yE}" stroke="${C.dark}" stroke-width="4"/>
        <line x1="200" y1="${yS}" x2="640" y2="${yS}" stroke="${C.pink}" stroke-width="5" stroke-dasharray="14 10"/>
        <line x1="200" y1="${yT}" x2="640" y2="${yT}" stroke="${C.teal}" stroke-width="5" stroke-dasharray="14 10"/>`;
      [[250, .2, .5], [300, .5, .3], [350, .3, .6], [400, .6, .8], [450, .8, .7], [500, .7, .95]].forEach(([x, a, b2]) => {
        const ya = yE - (a - 0.2) * 300, yb = yE - (b2 - 0.2) * 300;
        p += `<line x1="${x}" x2="${x}" y1="${Math.min(ya, yb) - 14}" y2="${Math.max(ya, yb) + 14}" stroke="${b2 > a ? C.teal : C.pink}" stroke-width="5"/><rect x="${x - 14}" y="${Math.min(ya, yb)}" width="28" height="${Math.max(4, Math.abs(ya - yb))}" rx="4" fill="${b2 > a ? C.teal : C.pink}"/>`;
      });
      out += scaleAt(460, 960, ck, p);
      out += pill(700, (yE + yS) / 2, '30 pts', C.pink, pop(t, T.panel + 0.6), 24);
      out += pill(700, (yE + yT) / 2, '60 pts', DK.teal, pop(t, T.panel + 0.9), 24);
      // Mouse guarding the ruler.
      out += crit(t, 'mouse', { x: 560, y: 960, scale: 0.9, seed: 4, at: T.panel + 1.2 });
      out += bub(420, 880, 'Still 30 / 60 ✓', between(t, T.setup + 1.4, T.exposure), { size: 26 });
      // Contracts.
      const N = [2, 4, 8], ci = lastIdx(t, T.counts), n = ci < 0 ? 0 : N[ci];
      const prevN = ci <= 0 ? 0 : N[ci - 1], g = ci < 0 ? 0 : ease(seg(t, T.counts[ci], T.counts[ci] + 1.2));
      const nEff = lerp(prevN, n, g);
      // Pump + vendor.
      const pumpK = pop(t, T.pump, 0.6);
      const pumping = ci >= 0 && t < T.counts[ci] + 1.2;
      const hy = pumping ? Math.abs(Math.sin((t - T.counts[ci]) * 8)) * 60 : 0;
      out += scaleAt(1180, 1000, pumpK, `<rect x="1100" y="984" width="160" height="16" rx="6" fill="${C.muted}"/><rect x="1150" y="800" width="60" height="190" rx="12" fill="${C.purple}"/>
        <rect x="1174" y="${f1(720 + hy)}" width="12" height="90" fill="${C.dark}"/><rect x="1120" y="${f1(708 + hy)}" width="120" height="20" rx="10" fill="${C.dark}"/>
        <path d="M1210,960 C1320,1000 1420,960 1500,900" stroke="${C.dark}" stroke-width="10" fill="none" stroke-linecap="round"/>`);
      // Counter sign.
      out += scaleAt(1180, 560, pop(t, T.pump + 0.3, 0.6), `<rect x="1060" y="500" width="240" height="100" rx="22" fill="${C.dark}"/>${txt(1180, 535, 'CONTRACTS', 18, C.gold, { ls: 3 })}${txt(1180, 582, n ? 'MNQ × ' + n : 'MNQ × ?', 40, '#fff', { f: 'Playfair Display', w: 700 })}`);
      const vd = { x: 1010, y: 1000, scale: 0.95, look: A.LOOKS.c, seed: 6, at: T.pump, talk: false, hat: 'cap' };
      vd.frontArm = aim(vd, 1150, 718 + hy);
      out += who(t, vd);
      // Balloon.
      if (nEff > 0) {
        const r = 60 * Math.sqrt(nEff), sw = Math.sin(t * 1.6) * 4;
        const bx = 1520 + sw, by = 880 - r - 20;
        out += `<path d="M1500,900 Q${1510 + sw},${f1(890)} ${f1(bx)},${f1(by + r + 14)}" stroke="${C.muted}" stroke-width="3" fill="none"/>
          <ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(r * 0.92)}" ry="${f1(r)}" fill="${C.pink}"/><path d="M${f1(bx - 10)},${f1(by + r + 2)} L${f1(bx + 10)},${f1(by + r + 2)} L${f1(bx)},${f1(by + r - 8)} Z" fill="${DK.pink}"/>
          <ellipse cx="${f1(bx - r * 0.35)}" cy="${f1(by - r * 0.4)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.28)}" fill="#fff" opacity=".45" transform="rotate(-24 ${f1(bx - r * 0.35)} ${f1(by - r * 0.4)})"/>
          ${txt(bx, by - 4, 'RISK', Math.max(18, r * 0.2), '#fff', { ls: 2 })}${txt(bx, by + r * 0.36, '$' + (g > 0.5 ? n : prevN) * 60, Math.max(28, r * 0.42), '#fff', { f: 'Playfair Display', w: 700 })}`;
      }
      // Dog backs away as it grows.
      const scared = ci === 2 && t > T.counts[2] + 0.6;
      out += crit(t, 'dog', { x: scared ? 1820 : 1760, y: 1000, scale: 0.55, seed: 5, at: T.pump + 0.6, flip: true, hop: scared ? 10 : 0, hopH: 18 });
      // Questions.
      out += bub(1000, 440, 'Did the setup change?', between(t, T.setup, T.setup + 1.4), { size: 28 });
      out += check(760, 440, between(t, T.setup + 1.4, T.exposure), C.teal, 28);
      out += pill(1000, 440, 'setup: no change', DK.teal, between(t, T.setup + 1.4, T.exposure), 26);
      out += pill(1000, 440, 'exposure: doubled ×2', C.pink, pop(t, T.exposure + 1, 0.5), 26);
      out += bub(1000, 440, 'Did the exposure change?', between(t, T.exposure, T.exposure + 1), { size: 28 });
      return out;
    },
  });

  /* ================= Lesson 12: Partials & Runners ================= */
  // Piecewise price path: keys = [[time, value], ...], eased between keys.
  const path = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    let j = 0; while (j < keys.length - 2 && t >= keys[j + 1][0]) j++;
    return lerp(keys[j][1], keys[j + 1][1], ease(seg(t, keys[j][0], keys[j + 1][0])));
  };
  Object.assign(LIVE, {
    // Two relay lanes of candle runners. Plan A: all four to +60. Plan B: two close at +30, two run on.
    's16-relay-runners': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EAF4E9', '#D6E8D4');
      const X = p => 320 + p / 60 * 1180;
      const lanes = [{ y: 650, name: 'PLAN A', plan: '4 held to +60', col: C.purple, dk: DK.purple, bodies: [C.teal, C.teal, C.teal, C.teal] },
        { y: 930, name: 'PLAN B', plan: '2 close at +30 · 2 run to +60', col: C.peach, dk: DK.peach, bodies: [C.teal, C.teal, C.teal, C.teal] }];
      lanes.forEach((L, li) => {
        const k = pop(t, T.track + li * 0.3, 0.7);
        out += scaleAt(960, L.y, k, `<rect x="200" y="${L.y - 40}" width="1520" height="70" rx="14" fill="#E8A87C"/><rect x="200" y="${L.y - 40}" width="1520" height="6" fill="#fff" opacity=".6"/><rect x="200" y="${L.y + 24}" width="1520" height="6" fill="#fff" opacity=".6"/>`);
        if (k <= 0) return;
        // Markers.
        [[0, 'ENTRY', C.muted], [30, '+30', DK.peach], [60, '+60', DK.teal]].forEach(([p, lab, col]) => {
          out += `<rect x="${X(p) - 3}" y="${L.y - 40}" width="6" height="70" fill="#fff"/>` + pill(X(p), L.y + 56, lab, col, pop(t, T.track + 0.6 + li * 0.3), 20);
        });
        // Finish tape.
        out += `<rect x="${X(60) + 20}" y="${L.y - 150}" width="8" height="150" fill="${C.dark}"/>` + (li === 0 ? '' : '');
        // Lane label.
        out += scaleAt(330, L.y - 200, pop(t, T.lanes[li], 0.6), `<rect x="210" y="${L.y - 232}" width="${li ? 560 : 360}" height="64" rx="32" fill="#fff" stroke="${L.col}" stroke-width="5"/><rect x="210" y="${L.y - 232}" width="140" height="64" rx="32" fill="${L.col}"/>${txt(280, L.y - 190, L.name, 24, '#fff')}${txt(li ? 555 : 455, L.y - 190, L.plan, 24, L.dk, { w: 800 })}`);
        // Runners.
        for (let i = 0; i < 4; i++) {
          const stopAt30 = li === 1 && i >= 2;
          const run = t > T.go ? (stopAt30 ? Math.min(30, path(t, [[T.go, 0], [T.split, 30]])) : path(t, [[T.go, 0], [T.split, 30], [T.finish, 60]])) : 0;
          const x = X(run) - i * 54 - 20 + (stopAt30 && t > T.split ? (i - 2) * 70 + 80 : 0);
          const y = L.y + 10 - (i % 2) * 14 + (stopAt30 && t > T.split ? -ease(seg(t, T.split, T.split + 0.6)) * 0 : 0);
          const moving = t > T.go && ((stopAt30 && t < T.split) || (!stopAt30 && t < T.finish));
          const done = stopAt30 ? t > T.split : t > T.finish;
          const col = stopAt30 && t > T.split ? C.gold : L.bodies[i];
          out += candy(t, { x, y, h: 70, w: 44, col, seed: i + li * 4, scale: 0.9, at: T.lanes[li] + 0.2 + i * 0.12, walking: moving, arms: done ? 'cheer' : undefined, extra: done && stopAt30 ? `<circle cx="0" cy="-60" r="12" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>` : '' });
        }
      });
      // Partial and runner labels.
      out += pill(X(30) + 40, 1046, 'PARTIAL: closed part ✓', DK.peach, between(t, T.split + 0.2, s.end), 24);
      out += pill(X(60) - 60, 1046, 'RUNNERS: the rest kept going', DK.teal, between(t, T.runner, s.end), 24);
      if (t > T.split) out += A.sparkle(X(30), 860, T.split + 0.1, t);
      if (t > T.finish) out += A.sparkle(X(60), 560, T.finish, t) + A.sparkle(X(60), 840, T.finish + 0.2, t);
      // Coach with a whistle and a bird on the finish post.
      const co = { x: 1800, y: 1000, scale: 0.9, look: A.LOOKS.e, flip: true, seed: 7, at: T.track + 0.8, hat: 'cap', talk: ctx.talking && t > T.ask };
      if (t > T.go - 0.4 && t < T.go + 0.8) co.frontArm = { a1: -110, a2: -150 };
      else if (t > T.verdict) co.frontArm = { a1: -50, a2: -100 };
      out += who(t, co);
      out += crit(t, 'bird', { x: X(60) + 24, y: 500, scale: 0.7, seed: 3, at: T.track + 1, hop: t > T.finish && t < T.finish + 2 ? 8 : 0, hopH: 16 });
      out += bub(1640, 400, 'Is Plan B safer? 🤔', between(t, T.ask, T.verdict - 0.1), { size: 28, tail: 'right' });
      out += bub(1640, 400, 'Both are structures ✓', between(t, T.verdict, s.end), { size: 28, tail: 'right' });
      return out;
    },

    // A haunted ride: a ghost spooks two passengers off early (no partial rule). Rewind: now the plan says close two at +30.
    's16-haunted-ride': (s, t, ctx) => {
      const T = s.beats;
      const night = ease(seg(t, s.start, s.start + 0.8));
      let out = `<rect x="0" y="380" width="1920" height="700" fill="#EDEAFB" opacity="${night}"/>` + ground(1000, '#E3DDF3', '#D2CAEC');
      // Moon + stars.
      out += `<circle cx="1700" cy="460" r="48" fill="#FFF3C4" opacity="${night}"/><circle cx="1720" cy="448" r="44" fill="#EDEAFB" opacity="${night}"/>` + [[1500, 420], [1580, 520], [1820, 560], [380, 430]].map(([x, y], i) => twinkle(x, y, 12, t, i)).join('');
      const X = p => 300 + p / 60 * 1240, Y = p => 900 - p * 5.2 + Math.sin(p / 6) * 18;
      // Rails.
      let d = `M${X(-4)},${f1(Y(-4))}`;
      for (let p = -4; p <= 62; p += 1) d += ` L${f1(X(p))},${f1(Y(p))}`;
      const rk = ease(seg(t, T.ride, T.ride + 1));
      out += `<path d="${d}" stroke="${C.muted}" stroke-width="10" fill="none" stroke-dasharray="${f1(1600 * rk)} 3000"/>`;
      for (let p = 0; p <= 60 * rk; p += 4) out += `<line x1="${f1(X(p))}" y1="${f1(Y(p) + 6)}" x2="${f1(X(p))}" y2="1000" stroke="#C9C0DE" stroke-width="5"/>`;
      // Spooky tunnel around +20..+28.
      const tk = pop(t, T.ride + 0.6, 0.7);
      out += scaleAt(X(24), Y(24), tk, `<path d="M${X(17)},${Y(17) + 30} L${X(17)},${Y(19) - 120} Q${X(24)},${Y(24) - 230} ${X(31)},${Y(29) - 120} L${X(31)},${Y(31) + 30}" fill="none" stroke="${DK.purple}" stroke-width="34" stroke-linejoin="round"/>
        ${[19, 24, 29].map((p, i) => `<circle cx="${X(p)}" cy="${Y(p) - 150 + (i === 1 ? -40 : 0)}" r="9" fill="${C.gold}" opacity="${0.5 + 0.5 * Math.sin(t * 5 + i)}"/>`).join('')}`);
      // +30 station and +60 flag.
      const planned = t > T.rewind + 1.2;
      out += pill(X(30), Y(30) + 70, '+30', DK.peach, pop(t, T.ride + 1), 22);
      out += pill(X(60), Y(60) - 70, 'TARGET +60', DK.teal, pop(t, T.ride + 1.2), 22);
      if (planned) out += scaleAt(X(30) + 40, Y(30) + 130, pop(t, T.rewind + 1.4, 0.6), `<rect x="${X(30) - 30}" y="${Y(30) + 100}" width="180" height="24" rx="6" fill="${C.peachL}"/><rect x="${X(30) - 30}" y="${Y(30) + 124}" width="14" height="${1000 - Y(30) - 124}" fill="${C.peach}"/><rect x="${X(30) + 136}" y="${Y(30) + 124}" width="14" height="${1000 - Y(30) - 124}" fill="${C.peach}"/>`);
      // Car progress.
      const p = path(t, [[T.move, 0], [T.ghost, 25], [T.jump + 1.2, 25], [T.jump + 4, 45], [T.rewind, 45], [T.rewind + 1.2, 0], [T.move2, 0], [T.station, 30], [T.station + 1.6, 30], [s.end, 48]]);
      const cx = X(p), cy = Y(p), ang = Math.atan2(Y(p + 1) - Y(p), X(p + 1) - X(p)) * 180 / Math.PI;
      const shake = t > T.ghost && t < T.jump + 1 && !planned ? Math.sin(t * 40) * 4 : 0;
      if (rk > 0.6) {
        let car = '';
        for (let i = 0; i < 4; i++) {
          const gone = (i >= 2) && ((!planned && t > T.jump) || (planned && t > T.station + 0.4));
          if (gone) continue;
          car += cdl(t, { x: -66 + i * 44, y: -30, h: 54, w: 34, col: i < 2 ? C.teal : C.pink, seed: i + 2, scale: 0.9, mood: t > T.ghost && t < T.jump + 1 && !planned ? 'wow' : undefined, arms: t > T.ghost && t < T.jump + 1 && !planned ? 'up' : undefined });
        }
        car += `<rect x="-110" y="-44" width="220" height="64" rx="18" fill="${C.pink}" stroke="${DK.pink}" stroke-width="5"/><rect x="-96" y="-34" width="192" height="10" rx="5" fill="#fff" opacity=".35"/>
          <circle cx="-66" cy="26" r="16" fill="${C.dark}"/><circle cx="66" cy="26" r="16" fill="${C.dark}"/>`;
        // Plan tag on the car's tail.
        car += `<g transform="translate(-200,-40) rotate(${f1(-ang)})"><rect x="-100" y="-36" width="200" height="72" rx="14" fill="#fff" stroke="${planned ? C.peach : C.purple}" stroke-width="4"/>${txt(0, -8, planned ? 'PARTIAL RULE' : 'FIXED PLAN', 18, C.muted, { ls: 1 })}${txt(0, 22, planned ? '2 close at +30' : 'no partials', 24, planned ? DK.peach : DK.purple)}</g>`;
        out += `<g transform="translate(${f1(cx + shake)},${f1(cy - 20)}) rotate(${f1(ang)})">${car}</g>`;
      }
      // The two who jumped (unplanned): arc out to the ground, sad.
      if (!planned && t > T.jump) {
        [2, 3].forEach((i, j) => {
          const jx0 = X(25) - 66 + i * 44, jy0 = Y(25) - 50, k = ease(seg(t, T.jump, T.jump + 0.9));
          const jx = lerp(jx0, X(25) + 40 + j * 80, k), jy = lerp(jy0, 1000, k) - Math.sin(k * Math.PI) * 160;
          out += cdl(t, { x: jx, y: jy, h: 54, w: 34, col: C.pink, seed: i + 2, scale: 0.9, mood: k >= 1 ? 'sad' : 'wow', arms: k < 1 ? 'up' : undefined });
        });
      }
      // The two who exit at the station (planned).
      if (planned && t > T.station + 0.4) {
        [2, 3].forEach((i, j) => {
          const k = ease(seg(t, T.station + 0.4, T.station + 1.2));
          const sx = X(30) + 10 + j * 70, sy = Y(30) + 100;
          out += cdl(t, { x: lerp(X(30) - 66 + i * 44, sx, k), y: lerp(Y(30) - 50, sy, k) - Math.sin(k * Math.PI) * 60, h: 54, w: 34, col: C.pink, seed: i + 2, scale: 0.9, arms: k >= 1 ? 'cheer' : undefined });
        });
        out += check(X(30) + 50, Y(30) - 30, pop(t, T.station + 1.4), C.teal, 30) + A.sparkle(X(30) + 50, Y(30) + 40, T.station + 1.4, t);
        out += pill(X(30) + 50, Y(30) + 190, 'planned partial ✓', DK.teal, pop(t, T.station + 1.6), 24);
      }
      // Ghost.
      out += ghost(t, X(25) - 10, Y(25) - 200, 0.9, between(t, T.ghost - 0.2, T.jump + 1.6), { boo: t < T.jump });
      out += bub(X(25) + 230, Y(25) - 260, 'It could come back! 👻', between(t, T.ghost + 0.3, T.jump + 0.4), { size: 26 });
      out += pill(X(25) + 120, 1046, 'TOOK HALF 😱 · not in the plan', C.pink, between(t, T.verdict, T.rewind), 24);
      // Rewind icon.
      if (t > T.rewind && t < T.rewind + 1.4) out += fade(Math.sin(seg(t, T.rewind, T.rewind + 1.4) * Math.PI) * 1.5, `<g transform="translate(960,560)"><circle r="70" fill="${C.purple}" opacity=".9"/><path d="M-6,-30 L-46,0 L-6,30 Z M38,-30 L-2,0 L38,30 Z" fill="#fff"/></g>`);
      // Operator in the booth.
      const bk = pop(t, T.ride, 0.6);
      out += scaleAt(150, 1000, bk, `<rect x="60" y="700" width="180" height="300" rx="12" fill="${C.purple}"/><path d="M40,700 L150,630 L260,700 Z" fill="${DK.purple}"/><rect x="84" y="740" width="132" height="90" rx="10" fill="#FFF3C4"/>`);
      out += who(t, { x: 150, y: 860, scale: 0.42, look: A.LOOKS.b, seed: 9, at: T.ride + 0.3, talk: false });
      out += scaleAt(150, 1000, bk, `<rect x="60" y="826" width="180" height="174" rx="8" fill="${C.purple}"/>${txt(150, 900, 'RIDE', 26, '#fff', { ls: 3 })}`);
      return out;
    },
  });

  /* ================= Lesson 13: Moving Your Stop & Break Even ================= */
  Object.assign(LIVE, {
    // Circus: a tightrope walker on the price wire, a safety net (the stop). A nervous ringmaster yanks the net up; then a planned rule does it.
    's16-trapeze-net': (s, t, ctx) => {
      const T = s.beats;
      // Tent stripes.
      const tk = ease(seg(t, s.start, s.start + 0.8));
      let out = '';
      for (let i = 0; i < 12; i++) out += `<path d="M${i * 170 - 40},1080 L${960 + (i - 5.5) * 30},360 L${960 + (i - 4.5) * 30},360 L${(i + 1) * 170 - 40},1080 Z" fill="${i % 2 ? '#FBE3E8' : '#FDF3F5'}" opacity="${tk}"/>`;
      out += ground(1000, '#F1D9C4', '#E2C4AA');
      const run = t < T.run2 - 0.4 ? 1 : 2, r0 = run === 1 ? T.run1 : T.run2;
      const keys = [[0, 0], [1.6, 26], [3.6, 25], [4.4, -2], [6, 35], [7, 48], [8.2, 60]].map(([a, b]) => [r0 + a * (run === 1 ? 1.25 : 1), b]);
      const X0 = 340, X1 = 1560, tEnd = keys[keys.length - 1][0];
      const Xt = tt => lerp(X0, X1, seg(tt, r0, tEnd));
      const Y = p => 760 - p * 4.6;
      // Platforms.
      out += `<rect x="${X0 - 70}" y="${Y(0)}" width="70" height="${1000 - Y(0)}" fill="${C.purple}"/><rect x="${X0 - 90}" y="${Y(0) - 10}" width="110" height="16" rx="6" fill="${DK.purple}"/>`;
      out += `<rect x="${X1 + 10}" y="${Y(60)}" width="60" height="${1000 - Y(60)}" fill="${C.teal}"/><rect x="${X1}" y="${Y(60) - 10}" width="100" height="16" rx="6" fill="${DK.teal}"/>`;
      out += pill(X1 + 40, Y(60) - 50, 'TARGET', DK.teal, pop(t, s.start + 0.6), 22) + pill(X0 - 40, Y(0) - 50, 'ENTRY', DK.purple, pop(t, s.start + 0.4), 22);
      // Wire drawn up to now.
      const nowT = Math.min(t, tEnd);
      const yank1 = run === 1 ? ease(seg(t, T.yank, T.yank + 0.4)) : 0;
      const raise2 = run === 2 ? ease(seg(t, T.rule, T.rule + 0.6)) : 0;
      const netP = lerp(-30, 0, run === 1 ? yank1 : raise2);
      const pNow = path(nowT, keys);
      const fallT = run === 1 ? keys[3][0] - 0.1 : 1e9; // touches the raised net on the pullback
      const out1 = run === 1 && t > fallT;
      let d = '', dg = '';
      for (let tt = r0; tt <= nowT; tt += 0.05) {
        const seg2 = `${f1(Xt(tt))},${f1(Y(path(tt, keys)))}`;
        if (out1 && tt > fallT) dg += (dg ? ' L' : 'M') + seg2; else d += (d ? ' L' : 'M') + seg2;
      }
      if (out1) dg = `M${f1(Xt(fallT))},${f1(Y(path(fallT, keys)))} ` + dg.replace(/^M/, 'L');
      if (t > r0) out += `<path d="${d}" stroke="${C.dark}" stroke-width="6" fill="none" stroke-linejoin="round"/>` + (dg ? `<path d="${dg}" stroke="${C.muted}" stroke-width="5" fill="none" stroke-dasharray="12 10" stroke-linejoin="round"/>` : '');
      // The net.
      const ny = Y(netP);
      let net = `<line x1="${X0 - 20}" y1="${f1(ny)}" x2="${X1 + 20}" y2="${f1(ny)}" stroke="${C.pink}" stroke-width="6"/>`;
      for (let x = X0; x <= X1; x += 60) net += `<path d="M${x},${f1(ny)} Q${x + 30},${f1(ny + 30)} ${x + 60},${f1(ny)}" stroke="${C.pink}" stroke-width="3" fill="none"/>`;
      out += fade(ease(seg(t, s.start + 0.4, s.start + 1)), net);
      out += pill(X0 + 90, ny + 46, netP > -1 ? 'STOP @ BREAK EVEN' : 'STOP (−30)', C.pink, pop(t, s.start + 0.8), 20);
      // Walker on the wire (or tumbling into the net).
      if (t > r0 - 0.2) {
        let wx = Xt(nowT), wy = Y(pNow);
        let lean = Math.sin(t * 3) * 8, mood;
        if (out1) { const k = ease(seg(t, fallT, fallT + 0.6)); wx = Xt(fallT); wy = lerp(Y(path(fallT, keys)), ny + 26, k) - Math.sin(k * Math.PI) * 40; lean = 0; mood = 'sad'; }
        const wk = { x: wx, y: wy, scale: 0.42, look: A.LOOKS.d, seed: 4, walking: !out1 && t < tEnd, mood, frontArm: { a1: -10, a2: 0 }, backArm: { a1: 190, a2: 180 } };
        out += `<g transform="rotate(${f1(lean)} ${f1(wx)} ${f1(wy)})">${A.person(t, wk)}</g>`;
        if (!out1) out += `<line x1="${f1(wx - 90)}" y1="${f1(wy - 90)}" x2="${f1(wx + 90)}" y2="${f1(wy - 90)}" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/>`;
      }
      // Run-1 labels.
      if (run === 1) {
        out += pill(Xt(fallT) + 10, ny + 110, 'out at break even 😩', C.pink, pop(t, fallT + 0.5), 24);
        out += pill(1300, Y(60) - 50, 'went on without her', C.muted, pop(t, tEnd - 0.4), 22);
        out += pill(1000, 1040, 'no BE rule → emotional', DK.pink, pop(t, T.verdict1), 24);
      } else {
        out += pill(Xt(keys[3][0]) + 20, Y(-30) - 40 + 110, 'room to move ✓', DK.teal, between(t, keys[3][0], T.rule), 22);
        out += pill(1150, Y(30) - 40, '1M close above +30', C.purple, between(t, T.rule - 0.4, s.end), 22);
        out += pill(1000, 1040, 'BE rule triggered → rule-based ✓', DK.teal, pop(t, T.rule + 0.8), 24);
        if (t > T.rule) out += A.sparkle(1000, Y(0), T.rule + 0.3, t, C.teal);
        if (t > tEnd) out += A.sparkle(X1 + 40, Y(60) - 20, tEnd, t);
      }
      // Rewind flash.
      if (t > T.run2 - 0.8 && t < T.run2 + 0.4) out += fade(Math.sin(seg(t, T.run2 - 0.8, T.run2 + 0.4) * Math.PI) * 1.5, `<g transform="translate(960,620)"><circle r="70" fill="${C.purple}" opacity=".9"/><path d="M-6,-30 L-46,0 L-6,30 Z M38,-30 L-2,0 L38,30 Z" fill="#fff"/></g>`);
      // Ringmaster: top hat; yanks the rope in run 1.
      const rm = { x: 170, y: 1000, scale: 0.9, look: A.LOOKS.c, seed: 6, talk: ctx.talking && run === 1 && t > T.yank - 0.6 && t < T.yank + 1.6 };
      if (run === 1 && t > T.yank - 0.3 && t < T.yank + 0.8) rm.frontArm = { a1: -120 + Math.sin(t * 20) * 15, a2: -150 };
      out += who(t, rm);
      const h = headAt(t, rm);
      out += `<g transform="translate(${f1(h.x)},${f1(h.y)}) scale(${h.s})"><rect x="-30" y="-110" width="60" height="70" rx="6" fill="${C.dark}"/><rect x="-46" y="-46" width="92" height="12" rx="6" fill="${C.dark}"/><rect x="-30" y="-62" width="60" height="10" fill="${C.pink}"/></g>`;
      out += bub(330, 520, 'Yank it to BE! 😰', between(t, T.yank - 0.6, T.yank + 2), { size: 26 });
      // Seal on a drum, clapping.
      const clap = Math.abs(Math.sin(t * (t > T.rule && run === 2 ? 10 : 3)));
      out += scaleAt(1760, 1000, pop(t, s.start + 1, 0.6), `<rect x="1690" y="910" width="140" height="90" rx="14" fill="${C.purple}"/><rect x="1690" y="910" width="140" height="18" rx="9" fill="${C.gold}"/>
        <g transform="translate(1760,910)"><path d="M-40,0 Q-50,-90 0,-120 Q30,-100 20,-40 Q50,-10 40,0 Z" fill="#8C8C9E"/><circle cx="6" cy="-120" r="30" fill="#8C8C9E"/>
        <circle cx="16" cy="-126" r="5" fill="${C.dark}"/><ellipse cx="30" cy="-112" rx="12" ry="8" fill="#6E6E80"/><circle cx="38" cy="-114" r="5" fill="${C.dark}"/>
        <path d="M-20,-60 L${f1(-50 + clap * 20)},-80" stroke="#6E6E80" stroke-width="14" stroke-linecap="round"/><path d="M20,-60 L${f1(50 - clap * 20)},-80" stroke="#6E6E80" stroke-width="14" stroke-linecap="round"/>
        <circle cx="6" cy="-158" r="14" fill="${C.pink}"/></g>`);
      return out;
    },

    // A taxi drives out and back to its starting stop: the meter still shows fees, the brakes slide past, and the stop wall closes in.
    's16-round-trip-taxi': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#FFF4E8" opacity="${ease(seg(t, s.start, s.start + 0.8))}"/>`;
      // City skyline.
      [[80, 560, 160], [260, 620, 120], [1500, 520, 140], [1660, 600, 180], [1180, 640, 120]].forEach(([x, y, w], i) => {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${860 - y}" rx="6" fill="${[C.purpleL, C.pinkL, C.tealL, C.peachL, C.purpleL][i]}" opacity=".7"/>`;
        for (let yy = y + 20; yy < 840; yy += 46) for (let xx = x + 18; xx < x + w - 20; xx += 40) out += `<rect x="${xx}" y="${yy}" width="18" height="22" rx="3" fill="#fff" opacity="${0.5 + 0.4 * Math.sin(xx + yy + t)}"/>`;
      });
      out += A.road(860, { h: 140, shift: 0 }) + `<rect x="0" y="1000" width="1920" height="80" fill="#EFE3D8"/>`;
      // ENTRY stop sign.
      const EX = 900;
      out += scaleAt(EX, 860, pop(t, T.road, 0.6), `<rect x="${EX - 5}" y="620" width="10" height="240" fill="${C.muted}"/><rect x="${EX - 80}" y="590" width="160" height="60" rx="14" fill="${C.purple}"/>${txt(EX, 630, 'ENTRY', 28, '#fff', { ls: 2 })}`);
      // Taxi position.
      let tx = path(t, [[T.drive, EX - 200], [T.drive + 1.8, 1500], [T.drive + 2.4, 1500], [T.meter - 0.4, EX]]);
      let skid = 0;
      if (t > T.slip - 2) {
        tx = path(t, [[T.slip - 2, 1400], [T.slip, EX], [T.slip + 0.6, EX - 90]]);
        skid = seg(t, T.slip, T.slip + 0.6);
      }
      if (t > T.room - 0.4) tx = EX - 90;
      const moving = (t > T.drive && t < T.meter) || (t > T.slip - 2 && t < T.slip + 0.6);
      const facing = (t > T.drive + 2.1 && t < T.meter + 0.2) || (t > T.slip - 2) ? -1 : 1;
      // Skid marks.
      if (skid > 0) out += `<path d="M${EX + 60},960 L${f1(tx + 60)},960 M${EX + 60},948 L${f1(tx + 60)},948" stroke="${C.dark}" stroke-width="6" opacity=".35"/>`;
      // Stop wall (pink barrier) on the left; closes in during 'room'.
      const wallX = lerp(300, EX - 330, ease(seg(t, T.room, T.room + 1.4)));
      const wk = pop(t, T.road + 0.6, 0.6);
      out += scaleAt(wallX, 1000, wk, `<rect x="${f1(wallX - 60)}" y="780" width="60" height="220" rx="10" fill="${C.pink}"/>${[0, 1, 2].map(i => `<rect x="${f1(wallX - 60)}" y="${800 + i * 70}" width="60" height="26" fill="#fff" opacity=".7"/>`).join('')}`);
      out += pill(wallX - 30, 740, 'STOP', C.pink, wk, 22);
      // Room arrow.
      if (t > T.room - 0.2) {
        const ax0 = wallX + 10, ax1 = tx - 140;
        out += `<line x1="${f1(ax0)}" y1="1040" x2="${f1(ax1)}" y2="1040" stroke="${DK.purple}" stroke-width="5"/><path d="M${f1(ax0 + 14)},1028 L${f1(ax0)},1040 L${f1(ax0 + 14)},1052 M${f1(ax1 - 14)},1028 L${f1(ax1)},1040 L${f1(ax1 - 14)},1052" stroke="${DK.purple}" stroke-width="5" fill="none"/>`;
        out += pill((ax0 + ax1) / 2, 1000, 'room to move', DK.purple, pop(t, T.room - 0.2), 20);
      }
      // Taxi.
      const vk = pop(t, T.road + 0.3, 0.6);
      if (vk > 0) {
        const car = A.vehicle('car', { x: 0, y: 0, dist: tx, t, moving, plate: '' });
        out += scaleAt(tx, 950, vk, `<g transform="translate(${f1(tx)},950) scale(${facing},1)">
          ${car}<circle cx="-18" cy="-136" r="16" fill="#8E5A3C"/><circle cx="40" cy="-136" r="14" fill="#F1C7A5"/><path d="M28,-150 Q40,-164 52,-150" fill="#7A4A2A"/></g>
          <g transform="translate(${f1(tx + facing * 10)},950)"><rect x="-36" y="-196" width="72" height="28" rx="8" fill="${C.gold}"/>${txt(0, -175, 'TAXI', 18, C.dark)}</g>`);
      }
      // Fare meter.
      const mk = pop(t, T.meter, 0.6);
      out += scaleAt(1360, 500, mk, `<rect x="1180" y="430" width="360" height="140" rx="22" fill="${C.dark}"/><rect x="1200" y="474" width="320" height="76" rx="10" fill="#1A0F0A"/>
        ${txt(1360, 462, 'BACK AT ENTRY · METER', 18, C.gold, { ls: 2 })}${txt(1360, 528, 'FEES ≠ $0', 44, '#7FF0B0', { f: 'DM Sans' })}`);
      out += pill(1360, 610, 'commissions still apply', C.muted, pop(t, T.meter + 0.8), 22);
      out += pill(EX - 60, 540, 'filled worse than entry', DK.peach, between(t, T.slip + 0.4, T.room - 0.4), 24);
      // Pigeon on the sign, cat on the pavement.
      out += crit(t, 'bird', { x: EX + 40, y: 592, scale: 0.6, seed: 4, at: T.road + 0.8, hop: t > T.slip && t < T.slip + 1 ? 14 : 0, hopH: 30, col: '#C9C1BA' });
      out += crit(t, 'cat', { x: 1760, y: 1000, scale: 0.6, seed: 2, flip: true, at: T.road + 1.2, sleep: t > T.end2 });
      out += bub(1360, 820, 'Less risk. Less room.', between(t, T.end2, s.end), { size: 28 });
      return out;
    },
  });

  /* ================= Lesson 14: Over-Managing the Trade ================= */
  Object.assign(LIVE, {
    // Two gardeners, one seed each. One keeps digging hers up to check it; the other waters on schedule and leaves it alone.
    's16-seed-digger': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#EEF7EC" opacity="${ease(seg(t, s.start, s.start + 0.8))}"/>`;
      out += `<circle cx="960" cy="470" r="50" fill="${C.peachL}" opacity=".8"/>` + cloud(400 + Math.sin(t * 0.3) * 40, 440, 0.6) + cloud(1500 - Math.sin(t * 0.3) * 40, 460, 0.5);
      // Fence.
      for (let x = 40; x < 1920; x += 70) out += `<path d="M${x},860 L${x},700 L${x + 20},680 L${x + 40},700 L${x + 40},860 Z" fill="#fff" stroke="#EADFD8" stroke-width="3"/>`;
      out += `<rect x="0" y="740" width="1920" height="14" fill="#fff"/>` + ground(860, '#B98A62', '#A0744E');
      const beds = [{ x: 560, col: C.pink }, { x: 1360, col: C.teal }];
      beds.forEach(b => { out += `<ellipse cx="${b.x}" cy="880" rx="190" ry="34" fill="#8E6444"/>`; });
      // LEFT: digs.
      const di = lastIdx(t, T.digs);
      const dp = di >= 0 ? t - T.digs[di] : 99;
      const up = dp < 1.8 ? (dp < 0.5 ? ease(dp / 0.5) : dp < 1.4 ? 1 : 1 - ease((dp - 1.4) / 0.4)) : 0;
      const sx = 560, sy = 870 - up * 110;
      if (t > T.plant) {
        out += `<g transform="translate(${sx},${f1(sy)})"><ellipse rx="16" ry="12" fill="#E8C49A" stroke="#9B6A45" stroke-width="3"/>${t > T.plant + 1 && up < 0.2 ? '' : `<path d="M0,-10 Q6,-26 14,-30" stroke="${C.tealD}" stroke-width="4" fill="none"/>`}</g>`;
        if (up > 0.1) out += `<path d="M${sx - 40},880 Q${sx},${f1(860 - up * 20)} ${sx + 40},880" fill="#8E6444"/>`;
      }
      // Dirt flecks when digging.
      if (dp < 0.7) for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + i * 0.1), r = dp * 260; out += `<circle cx="${f1(sx + Math.cos(a) * r)}" cy="${f1(870 + Math.sin(a) * r + dp * dp * 300)}" r="7" fill="#8E6444" opacity="${f1(1 - dp / 0.7)}"/>`; }
      const g1 = { x: 380, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 3, at: T.beds, talk: ctx.talking && t > T.digs[0] && t < T.calm };
      g1.frontArm = dp < 1.8 ? aim(g1, sx - 20, sy - 10) : { a1: 70, a2: 90 };
      if (dp >= 0.5 && dp < 1.4) g1.hold = `<g transform="translate(10,-10)"><circle r="20" fill="#E8F8F6" fill-opacity=".5" stroke="${C.dark}" stroke-width="5"/><line x1="14" y1="14" x2="34" y2="34" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/></g>`;
      out += who(t, g1);
      // Shovel leaning by her.
      out += `<g transform="rotate(${dp < 0.5 ? -20 + dp * 40 : 12} 250 1000)"><rect x="244" y="760" width="10" height="200" rx="5" fill="#9B6A45"/><path d="M230,950 L268,950 L262,1000 L236,1000 Z" fill="${C.muted}"/></g>`;
      out += bub(380, 560, ['Is it growing? 🔍', 'Still there? 👀', 'Move it a bit…', 'Check again!', 'Just one more…', 'Hmm?'][Math.max(0, di)], between(t, T.digs[Math.max(0, di)] + 0.2, T.digs[Math.max(0, di)] + 1.7) * (di >= 0 ? 1 : 0), { size: 26 });
      // Worm.
      out += scaleAt(700, 890, pop(t, T.digs[2] + 0.4, 0.5), `<g transform="translate(700,890)"><path d="M0,0 Q${f1(-14 + Math.sin(t * 5) * 8)},-30 0,-60" stroke="${C.pinkL}" stroke-width="22" fill="none" stroke-linecap="round"/><circle cx="-4" cy="-64" r="4" fill="${C.dark}"/><circle cx="8" cy="-64" r="4" fill="${C.dark}"/><path d="M-6,-52 Q2,-56 10,-52" stroke="${C.dark}" stroke-width="3" fill="none"/></g>`);
      out += bub(800, 760, 'Again?! 😤', between(t, T.digs[2] + 0.8, T.digs[3] + 0.6), { size: 24, tail: 'left' });
      // Touch counter.
      const n1 = di + 1;
      out += scaleAt(560, 960, pop(t, T.beds + 0.5, 0.6), `<rect x="460" y="930" width="200" height="60" rx="14" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${txt(560, 970, 'TOUCHES: ' + n1, 26, DK.pink)}`);
      // RIGHT: growth.
      const gk = ease(seg(t, T.plant + 1, T.calm + 4));
      const h = gk * 280, px = 1360;
      if (t > T.plant) {
        out += `<path d="M${px},880 Q${px + Math.sin(t * 1.4) * 10},${880 - h / 2} ${f1(px + Math.sin(t * 1.4) * 14)},${f1(880 - h)}" stroke="${C.tealD}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
        for (let i = 1; i <= 4; i++) { const ly = 880 - h * i / 5, sd = i % 2 ? 1 : -1, lk = clamp(gk * 5 - i + 0.5); if (lk > 0) out += `<ellipse cx="${px + sd * 34 * lk}" cy="${f1(ly)}" rx="${36 * lk}" ry="${16 * lk}" transform="rotate(${sd * -24} ${px + sd * 34 * lk} ${f1(ly)})" fill="${C.teal}"/>`; }
        const fk = pop(t, T.bloom, 0.8);
        if (fk > 0) { const fx = px + Math.sin(t * 1.4) * 14, fy = 880 - h; out += scaleAt(fx, fy, fk, [0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${f1(fx + Math.cos(i * Math.PI / 3 + t * 0.3) * 30)}" cy="${f1(fy + Math.sin(i * Math.PI / 3 + t * 0.3) * 30)}" rx="22" ry="22" fill="${C.pink}"/>`).join('') + `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="20" fill="${C.gold}"/>`) + A.sparkle(fx, fy, T.bloom, t); }
      }
      // Gardener 2 waters on schedule.
      const watering = t > T.water && t < T.water + 2.4;
      const g2 = { x: 1580, y: 1000, scale: 0.95, look: A.LOOKS.a, flip: true, seed: 6, at: T.beds + 0.3, talk: ctx.talking && t > T.water - 0.2 && t < T.calm + 4 };
      g2.frontArm = watering ? { a1: 170, a2: 160 } : { a1: 110, a2: 90 };
      g2.hold = `<g transform="rotate(${watering ? -30 : 0})"><path d="M-30,-10 L30,-10 L24,40 L-24,40 Z" fill="${C.purple}"/><path d="M-30,0 L-70,-20" stroke="${C.purple}" stroke-width="8" stroke-linecap="round"/></g>`;
      out += who(t, g2);
      if (watering) for (let i = 0; i < 8; i++) { const p = ((t * 2 + i / 8) % 1); out += `<circle cx="${f1(1450 - p * 40 + i * 4)}" cy="${f1(790 + p * 90)}" r="5" fill="${C.tealL}" opacity="${f1(1 - p)}"/>`; }
      // Schedule sign.
      out += scaleAt(1700, 860, pop(t, T.beds + 0.8, 0.6), `<rect x="1694" y="760" width="12" height="100" fill="#9B6A45"/><rect x="1610" y="660" width="180" height="110" rx="14" fill="#fff" stroke="${C.teal}" stroke-width="4"/>${txt(1700, 700, 'PLAN', 22, DK.teal, { ls: 3 })}${txt(1700, 740, 'water 8:00', 24, C.text, { w: 700 })}`);
      out += scaleAt(1360, 960, pop(t, T.beds + 0.7, 0.6), `<rect x="1230" y="930" width="260" height="60" rx="14" fill="#fff" stroke="${C.teal}" stroke-width="4"/>${txt(1360, 970, 'TOUCHES: ' + (t > T.water ? '1 · planned' : '0'), 24, DK.teal)}`);
      out += crit(t, 'bird', { x: 980, y: 742, scale: 0.65, seed: 5, at: T.beds + 1.2, flip: di >= 0 && dp < 1.6 });
      return out;
    },

    // A cockpit in turbulence. The co-pilot monkey slaps every flashing button; the pilot keeps her hands off. Then touches get sorted.
    's16-turbulence-pilot': (s, t, ctx) => {
      const T = s.beats;
      const shake = (Math.sin(t * 23) * 6 + Math.sin(t * 37) * 4) * (1 - seg(t, T.sort - 0.6, T.sort + 0.4));
      let out = '';
      // Windshield sky.
      out += `<g transform="translate(0,${f1(shake)})"><path d="M160,1000 L160,520 Q170,400 320,390 L1600,390 Q1750,400 1760,520 L1760,1000 Z" fill="${C.dark}"/>
        <path d="M200,700 L210,520 Q220,430 330,426 L940,426 L940,700 Z" fill="#CFEAF0"/><path d="M980,700 L980,426 L1590,426 Q1700,430 1710,520 L1720,700 Z" fill="#CFEAF0"/>`;
      // Clouds whoosh past.
      for (let i = 0; i < 5; i++) { const x = 1800 - ((t * 420 + i * 400) % 1700); out += cloud(x, 480 + (i % 3) * 70, 0.5 + (i % 2) * 0.2); }
      const sortK = ease(seg(t, T.sort, T.sort + 0.6));
      // Sort bins on the windshield.
      if (sortK > 0) {
        out += fade(sortK, `<rect x="200" y="426" width="1520" height="274" fill="#F8F4FF"/>`);
        [['PLANNED', C.teal, DK.teal], ['RULE-BASED', C.purple, DK.purple], ['UNPLANNED', C.pink, DK.pink]].forEach(([lab, col, dk], i) => {
          const x = 460 + i * 500;
          out += scaleAt(x, 560, pop(t, T.sort + 0.3 + i * 0.25, 0.5), `<rect x="${x - 220}" y="446" width="440" height="236" rx="20" fill="#fff" stroke="${col}" stroke-width="5"/><rect x="${x - 220}" y="446" width="440" height="56" rx="20" fill="${col}"/>${txt(x, 484, lab, 26, '#fff', { ls: 2 })}`);
        });
        [['hold to target', 0], ['trail by HL rule', 1], ['scary candle: move stop', 2]].forEach(([lab, bi], i) => {
          const at = T.tokens[i], k = ease(seg(t, at, at + 0.7));
          if (k <= 0) return;
          const x = 460 + bi * 500, y = lerp(380, 580, k);
          out += pill(x, y, lab, [DK.teal, DK.purple, DK.pink][bi], 1, 24);
          if (k >= 1) out += (bi < 2 ? check(x, 650, pop(t, at + 0.7), C.teal, 20) : cross(x, 650, pop(t, at + 0.7), C.pink, 20));
        });
      }
      // Instrument panel.
      out += `<rect x="160" y="700" width="1600" height="300" fill="#5A4A44"/><rect x="160" y="700" width="1600" height="16" fill="#6E5C55"/>`;
      // Autopilot plan display.
      out += `<rect x="830" y="740" width="260" height="120" rx="14" fill="#1A0F0A"/>${txt(960, 772, 'AUTOPILOT · PLAN', 16, C.gold, { ls: 2 })}
        <path d="M860,840 L920,820 L980,826 L1060,794" stroke="#7FF0B0" stroke-width="5" fill="none"/><circle cx="${f1(860 + ((t * 40) % 200))}" cy="${f1(840 - ((t * 40) % 200) * 0.22)}" r="7" fill="#fff"/>${txt(960, 850, 'ON', 18, '#7FF0B0')}`;
      // Flashing buttons.
      const labels = ['MOVE STOP!', 'CLOSE?', 'TAKE PARTIAL?', 'MOVE TARGET?', 'ADD CONTRACT?'];
      labels.forEach((lab, i) => {
        const at = T.buttons[i], k = pop(t, at, 0.4);
        if (k <= 0 || t > T.sort) return;
        const bx = 1180 + (i % 3) * 150, by = 790 + Math.floor(i / 3) * 110, hit = t > at + 0.4;
        const flash = hit ? 0.4 : 0.6 + 0.4 * Math.sin(t * 18);
        out += scaleAt(bx, by, k, `<circle cx="${bx}" cy="${by}" r="${hit ? 30 : 34}" fill="${C.pink}" opacity="${flash}"/><circle cx="${bx}" cy="${by}" r="22" fill="${hit ? DK.pink : C.pink}"/>`);
      });
      // Alert pills across the windshield (one at a time).
      const ai = lastIdx(t, T.buttons);
      if (ai >= 0 && t < T.hands) out += pill(1350, 470 + (ai % 3) * 70, labels[ai], C.pink, between(t, T.buttons[ai], (T.buttons[ai + 1] || T.hands) - 0.05, 0.3), 30);
      // Seats.
      out += `<rect x="470" y="760" width="260" height="240" rx="40" fill="${C.purple}"/><rect x="1180" y="1000" width="0" height="0"/>`;
      // Pilot (hands off, relaxed).
      const pl = { x: 600, y: 1010, scale: 1, look: A.LOOKS.e, seed: 4, talk: ctx.talking && t > T.hands && t < T.sort };
      pl.frontArm = t > T.hands ? { a1: -150, a2: -60 } : { a1: 70, a2: 60 };
      pl.backArm = t > T.hands ? { a1: -30, a2: -120 } : { a1: 110, a2: 120 };
      out += who(t, pl) + hat(t, pl, 'cap');
      out += `<rect x="450" y="880" width="300" height="120" rx="30" fill="${DK.purple}"/><rect x="450" y="880" width="300" height="16" rx="8" fill="${C.purple}"/>`;
      out += bub(600, 600, 'Hands off. Plan’s set. ✈️', between(t, T.hands, T.sort), { size: 26 });
      // Monkey co-pilot slapping buttons.
      const mi = lastIdx(t, T.buttons.map(b => b + 0.3));
      const slapping = mi >= 0 && t < T.buttons[mi] + 0.8 && t < T.sort;
      const tgt = mi >= 0 ? [1180 + (mi % 3) * 150, 790 + Math.floor(mi / 3) * 110] : [1500, 900];
      const mx = 1560, my = 1000, mb = Math.abs(Math.sin(t * 9)) * (t < T.sort ? 12 : 3);
      const armTo = slapping ? tgt : [mx - 60, my - 170];
      out += `<g transform="translate(0,${f1(-mb)})">
        <path d="M${mx + 40},${my - 60} Q${mx + 120},${my - 100} ${mx + 100},${f1(my - 200 + Math.sin(t * 4) * 20)}" stroke="#9B6A45" stroke-width="12" fill="none" stroke-linecap="round"/>
        <ellipse cx="${mx}" cy="${my - 90}" rx="56" ry="70" fill="#9B6A45"/><ellipse cx="${mx}" cy="${my - 76}" rx="36" ry="46" fill="#E7C49E"/>
        <path d="M${mx - 40},${my - 130} L${f1(armTo[0])},${f1(armTo[1])}" stroke="#9B6A45" stroke-width="18" stroke-linecap="round"/><circle cx="${f1(armTo[0])}" cy="${f1(armTo[1])}" r="14" fill="#E7C49E"/>
        <circle cx="${mx - 52}" cy="${my - 200}" r="22" fill="#E7C49E" stroke="#9B6A45" stroke-width="8"/><circle cx="${mx + 52}" cy="${my - 200}" r="22" fill="#E7C49E" stroke="#9B6A45" stroke-width="8"/>
        <circle cx="${mx}" cy="${my - 200}" r="56" fill="#9B6A45"/><ellipse cx="${mx}" cy="${my - 186}" rx="40" ry="34" fill="#E7C49E"/>
        <circle cx="${mx - 16}" cy="${my - 210}" r="7" fill="${C.dark}"/><circle cx="${mx + 16}" cy="${my - 210}" r="7" fill="${C.dark}"/>
        <ellipse cx="${mx}" cy="${my - 172}" rx="${slapping ? 14 : 12}" ry="${slapping ? 10 : 4}" fill="#6B2A2A"/></g>`;
      out += pill(1560, 680, 'touches: ' + Math.max(0, Math.min(5, mi + 1)), C.pink, pop(t, T.buttons[0] + 0.4) * (t < T.sort ? 1 : 0), 24);
      out += '</g>';
      return out;
    },
  });

  /* ================= Lesson 15: Stop Watching Dollars. Read the Trade. ================= */
  // A coin character (P&L), (x, y) = feet.
  const coin = (t, x, y, label, o = {}) => {
    const bl = blinkAmt(t, 13), s = o.scale || 1, red = label[0] !== '+';
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s})">
      <path d="M-16,-10 L-20,0 M16,-10 L20,0" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="0" cy="-74" r="64" fill="${C.gold}" stroke="#C98A1F" stroke-width="6"/><circle cx="0" cy="-74" r="50" fill="none" stroke="#F3C25C" stroke-width="4"/>
      <ellipse cx="-20" cy="-94" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="20" cy="-94" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/>
      ${o.wow ? `<ellipse cx="0" cy="-74" rx="8" ry="10" fill="#6B2A2A"/>` : `<path d="M-10,-78 Q0,-70 10,-78" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`}
      ${txt(0, -42, label, 26, red ? DK.pink : '#2F6B3F')}
      <path d="M-60,-80 L${o.arms ? -92 : -80},${o.arms ? -120 : -50}" stroke="#C98A1F" stroke-width="8" stroke-linecap="round"/><path d="M60,-80 L${o.arms ? 92 : 80},${o.arms ? -120 : -50}" stroke="#C98A1F" stroke-width="8" stroke-linecap="round"/></g>`;
  };
  Object.assign(LIVE, {
    // A flashing slot machine (the money view) next to a calm instrument panel (the process view). A curtain hides the slot.
    's16-slot-vs-panel': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3EEF8', '#E2D9EE');
      // Slot machine.
      const sk = pop(t, T.slot, 0.8);
      const si = lastIdx(t, T.spins);
      const spinning = si >= 0 && t < T.spins[si] + 0.9;
      const shown = si < 0 ? '$$$' : ['+$186', '−$80'][si];
      let sm = `<rect x="200" y="470" width="480" height="530" rx="40" fill="${C.pink}"/><path d="M220,470 Q440,370 660,470 Z" fill="${DK.pink}"/>
        ${Array.from({ length: 10 }, (_, i) => `<circle cx="${236 + i * 46}" cy="492" r="10" fill="${(Math.floor(t * 8) + i) % 2 ? C.gold : '#FFF3C4'}"/>`).join('')}
        <rect x="250" y="540" width="380" height="170" rx="20" fill="#fff" stroke="${C.dark}" stroke-width="6"/>`;
      if (spinning) for (let i = 0; i < 3; i++) { const off = ((t * 900 + i * 60) % 120); sm += `<g clip-path="url(#s16slot)">${txt(310 + i * 130, 650 + off - 60, ['$', '7', '$'][i], 70, C.gold, { f: 'Playfair Display' })}${txt(310 + i * 130, 650 + off - 180, ['7', '$', '7'][i], 70, C.pink, { f: 'Playfair Display' })}</g>`; }
      else sm += txt(440, 650, shown, 76, shown[0] === '+' ? '#2F6B3F' : shown[0] === '−' ? DK.pink : C.gold, { f: 'Playfair Display', w: 700 });
      sm += `<clipPath id="s16slot"><rect x="256" y="546" width="368" height="158"/></clipPath>
        <rect x="270" y="760" width="340" height="40" rx="12" fill="${DK.pink}"/><rect x="300" y="860" width="280" height="90" rx="16" fill="${C.pinkL}"/>
        <rect x="690" y="${spinning && t - T.spins[si] < 0.4 ? 640 : 520}" width="16" height="${spinning && t - T.spins[si] < 0.4 ? 120 : 240}" rx="8" fill="${C.muted}"/><circle cx="698" cy="${spinning && t - T.spins[si] < 0.4 ? 640 : 520}" r="26" fill="${C.gold}"/>`;
      out += scaleAt(440, 1000, sk, sm);
      if (!spinning && si >= 0) out += A.sparkle(440, 640, T.spins[si] + 0.9, t, si ? C.pink : C.cash);
      // Frantic player.
      const fp = { x: 820, y: 1000, scale: 0.92, look: A.LOOKS.seller, flip: true, seed: 3, at: T.slot + 0.3, mood: si === 1 && !spinning ? 'sad' : undefined, talk: false };
      fp.frontArm = spinning ? aim(fp, 700, 540) : si >= 0 ? { a1: -120 + Math.sin(t * 9) * 14, a2: -150 } : { a1: 100, a2: 90 };
      out += who(t, fp);
      out += bub(860, 560, si === 1 ? 'PANIC! 😱' : 'WOW! 🤑', si >= 0 && !spinning && t < T.curtain ? pop(t, T.spins[si] + 0.9, 0.4) : 0, { size: 30, tail: 'right' });
      // Curtain over the slot.
      const ck = ease(seg(t, T.curtain, T.curtain + 0.9));
      if (ck > 0) {
        let cu = `<rect x="180" y="440" width="540" height="12" rx="6" fill="#9B6A45"/>`;
        const hh = 560 * ck;
        for (let i = 0; i < 6; i++) cu += `<path d="M${190 + i * 88},450 L${278 + i * 88},450 L${278 + i * 88},${f1(450 + hh)} Q${234 + i * 88},${f1(450 + hh + 14 * Math.sin(t * 3 + i))} ${190 + i * 88},${f1(450 + hh)} Z" fill="${i % 2 ? C.purple : DK.purple}"/>`;
        out += cu + pill(450, 760, 'P&amp;L hidden · practice mode', C.dark, pop(t, T.curtain + 1, 0.5), 24);
      }
      // Calm instrument panel.
      const pk = pop(t, T.panel, 0.7);
      let pn = `<rect x="1080" y="440" width="640" height="420" rx="30" fill="#2F3B48"/><rect x="1100" y="460" width="600" height="380" rx="20" fill="#3B4A59"/>
        <rect x="1340" y="860" width="120" height="140" fill="#2F3B48"/>${txt(1400, 500, 'THE TRADE', 22, C.tealL, { ls: 4 })}`;
      const gauges = [['STRUCTURE', 'intact'], ['STOP', '−30 pts'], ['TARGET', '+60 pts'], ['RULES', 'followed']];
      gauges.forEach(([lab, val], i) => {
        const gx = 1250 + (i % 2) * 300, gy = 620 + Math.floor(i / 2) * 150, k = pop(t, T.gauges[i], 0.5);
        if (k <= 0) return;
        const needle = -40 + Math.sin(t * 1.2 + i) * 3;
        pn += scaleAt(gx, gy, k, `<path d="M${gx - 70},${gy + 10} A70,70 0 0,1 ${gx + 70},${gy + 10}" fill="none" stroke="#56687A" stroke-width="14"/><path d="M${gx - 70},${gy + 10} A70,70 0 0,1 ${gx + 26},${gy - 55}" fill="none" stroke="${C.teal}" stroke-width="14"/>
          <line x1="${gx}" y1="${gy + 10}" x2="${f1(gx + Math.cos(rad(needle - 90 + 90 - 50)) * 56)}" y2="${f1(gy + 10 + Math.sin(rad(needle - 90 + 90 - 50)) * 56)}" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="${gx}" cy="${gy + 10}" r="9" fill="#fff"/>
          ${txt(gx, gy + 50, lab, 18, C.tealL, { ls: 2 })}${txt(gx, gy + 78, val, 22, '#fff')}`);
      });
      out += scaleAt(1400, 1000, pk, pn);
      // Calm reader with a cat.
      const cr = { x: 1820, y: 1000, scale: 0.9, look: A.LOOKS.a, flip: true, seed: 5, at: T.panel + 0.3, talk: ctx.talking && t > T.panel };
      cr.frontArm = t > T.panel + 0.6 && t < T.curtain ? aim(cr, 1720, 640 + Math.sin(t) * 40) : { a1: 100, a2: 85 };
      out += who(t, cr);
      out += crit(t, 'cat', { x: 960, y: 1000, scale: 0.65, seed: 8, at: T.slot + 1, sleep: t > T.verdict, flip: t > T.panel });
      out += pill(1400, 410, 'chart + plan', DK.teal, pop(t, T.verdict, 0.5), 26);
      if (t > T.verdict) out += A.sparkle(1400, 650, T.verdict + 0.2, t, C.teal);
      return out;
    },

    // A podium: Price takes gold, Plan silver, P&L bronze. The coin keeps trying to jump the queue; a referee bird sends it back.
    's16-podium': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#FFF1E2', '#F1DCC4');
      // Bunting.
      out += fade(seg(t, s.start, s.start + 0.8), `<path d="M100,400 Q960,470 1820,400" stroke="${C.muted}" stroke-width="3" fill="none"/>` + Array.from({ length: 16 }, (_, i) => { const x = 150 + i * 108, y = 400 + Math.sin((i / 15) * Math.PI) * 35; return `<path d="M${x - 22},${y} L${x + 22},${y} L${x},${f1(y + 40 + Math.sin(t * 3 + i) * 4)} Z" fill="${[C.pink, C.teal, C.peach, C.purple][i % 4]}"/>`; }).join(''));
      const blocks = [[960, 760, '1', C.gold, 'PRICE'], [700, 840, '2', '#C9C1BA', 'PLAN'], [1220, 900, '3', '#D9A273', 'P&amp;L']];
      blocks.forEach(([x, top, n, col, lab], i) => {
        const k = ease(seg(t, T.podium + i * 0.2, T.podium + i * 0.2 + 0.7));
        if (k <= 0) return;
        const y = lerp(1000, top, k);
        out += `<rect x="${x - 120}" y="${f1(y)}" width="240" height="${f1(1000 - y)}" rx="8" fill="${col}"/>${txt(x, y + 70, n, 60, '#fff', { f: 'Playfair Display' })}`;
        out += pill(x, 1040, lab, [DK.peach, C.muted, DK.peach][i], pop(t, T.ranks[i] + 0.3, 0.5), 24);
      });
      // 1st: price candle.
      out += candy(t, { x: 960, y: 760, h: 140, w: 80, col: C.teal, wu: 30, seed: 2, at: T.ranks[0], arms: t > T.ranks[0] + 0.6 && t < T.ranks[0] + 2.4 ? 'cheer' : undefined });
      // 2nd: plan clipboard character.
      const pk = pop(t, T.ranks[1], 0.6);
      if (pk > 0) {
        const b = Math.sin(t * 2.3) * 3, bl = blinkAmt(t, 21);
        out += scaleAt(700, 840, pk, `<g transform="translate(700,${f1(840 + b)})"><path d="M-20,-30 L-24,0 M20,-30 L24,0" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/>
          <rect x="-60" y="-190" width="120" height="164" rx="12" fill="#9B6A45"/><rect x="-50" y="-176" width="100" height="140" rx="6" fill="#fff"/><rect x="-22" y="-200" width="44" height="22" rx="6" fill="${C.muted}"/>
          <ellipse cx="-18" cy="-140" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="18" cy="-140" rx="6" ry="${f1(8 * (1 - bl * 0.9))}" fill="${C.dark}"/><path d="M-12,-118 Q0,-108 12,-118" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
          ${[0, 1, 2].map(i => `<rect x="-36" y="${-96 + i * 18}" width="72" height="8" rx="4" fill="${C.purpleL}"/>`).join('')}</g>`);
      }
      // 3rd: the coin, hopping toward 1st and being sent back.
      const nums = ['+$186', '−$80', '+$186'];
      const ni = lastIdx(t, T.flips);
      const label = ni < 0 ? '+$186' : nums[ni];
      let cx = 1220, cy = 900, wow = false;
      T.hops.forEach(h => {
        const k = seg(t, h, h + 1.6);
        if (k > 0 && k < 1) {
          const go = k < 0.45 ? ease(k / 0.45) : 1 - ease((k - 0.55) / 0.45);
          cx = lerp(1220, 1060, clamp(go)); cy = lerp(900, 780, clamp(go)) - Math.sin(clamp(go) * Math.PI) * 60; wow = true;
        }
      });
      const ck = pop(t, T.ranks[2], 0.6);
      const flipSq = ni >= 0 ? 1 - 0.5 * Math.max(0, 1 - (t - T.flips[ni]) / 0.3) : 1;
      if (ck > 0) out += scaleAt(cx, cy, ck, `<g transform="translate(${f1(cx)},0) scale(${f1(flipSq)},1) translate(${f1(-cx)},0)">${coin(t, cx, cy, label, { scale: 0.9, wow: wow || (ni >= 0 && t < T.flips[ni] + 0.8), arms: wow })}</g>`);
      // Referee bird with whistle.
      const rb = pop(t, T.ranks[2] + 0.4, 0.6);
      out += scaleAt(1460, 1000, rb, critter(t, 'bird', { x: 1460, y: 1000, scale: 1.3, seed: 6, flip: true, hop: T.hops.some(h => t > h + 0.5 && t < h + 1.4) ? 12 : 0, hopH: 26, talk: T.hops.some(h => t > h + 0.5 && t < h + 1.4) }));
      T.hops.forEach(h => { out += bub(1460, 780, 'Back to third! 📣', between(t, h + 0.5, h + 1.5, 0.3), { size: 26, tail: 'left' }); });
      // Plan card: unchanged.
      const pck = pop(t, T.plan, 0.6);
      if (pck > 0) {
        const rows = [['STOP', '−30 pts'], ['TARGET', '+60 pts'], ['RULES', 'same']];
        let c = card(1380, 440, 420, 250, C.purple, txt(1590, 486, 'THE PLAN', 24, C.purple, { ls: 3 }));
        rows.forEach(([a, b], i) => { const y = 540 + i * 52; c += txt(1410, y, a, 24, C.muted, { a: 'start', w: 700 }) + txt(1720, y, b, 26, DK.purple, { a: 'end' }) + check(1760, y - 8, pop(t, T.plan + 0.6 + i * 0.4, 0.4), C.teal, 14); });
        out += scaleAt(1590, 565, pck, c);
        out += pill(1590, 720, 'unchanged', DK.teal, pop(t, T.plan + 2, 0.5), 24);
      }
      // Flip arrows for the number changing.
      out += pill(1220, 690, 'just the number', C.pink, between(t, T.flips[0] + 0.4, T.plan + 2), 24);
      out += bub(960, 520, 'Plan changed? Or just the number?', between(t, T.ask, s.end), { size: 28 });
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
