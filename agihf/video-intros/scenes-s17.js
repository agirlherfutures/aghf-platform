/**
 * scenes-s17.js: illustrated scene types for Section 17 lesson intro videos
 * (Phase 6 · Section 17: Protecting Your Account, Lessons 17 to 26).
 * Know the loss before you chase the profit. Every LIVE entry is a pure function of t,
 * drawn on the 1920x1080 stage.
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


  /* ---------------- Section 17 extras ---------------- */
  HATS.top = `<rect x="-30" y="-110" width="60" height="70" rx="6" fill="${C.dark}"/><rect x="-48" y="-46" width="96" height="12" rx="6" fill="${C.dark}"/><rect x="-30" y="-60" width="60" height="12" fill="${C.pink}"/>`;
  HATS.bandana = `<path d="M-42,-30 Q-40,-72 0,-72 Q40,-72 42,-30 Z" fill="${C.pink}"/><circle cx="-46" cy="-30" r="8" fill="${C.pink}"/><path d="M-50,-30 L-66,-12 M-50,-30 L-60,-6" stroke="${C.pink}" stroke-width="7" stroke-linecap="round"/>`;
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const BOX = '#D9A46A', BOXD = '#A8733C';
  // A cardboard box with a label, centred at (x, y).
  const crate = (x, y, w, h, label, col = BOX, dark = BOXD, fs = 30, sub) => `<g transform="translate(${f1(x)},${f1(y)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${col}" stroke="${dark}" stroke-width="4"/>
    <rect x="-10" y="${-h / 2}" width="20" height="${h * 0.32}" fill="${dark}" opacity=".35"/>${txt(0, sub ? fs * 0.25 : fs * 0.36, label, fs, '#fff')}${sub ? txt(0, fs * 0.25 + 26, sub, 19, '#fff', { w: 700, op: 0.9 }) : ''}</g>`;
  // A signboard on a post. (x, y) = foot of the post.
  const post = (x, y, h, inner) => `<rect x="${x - 8}" y="${y - h}" width="16" height="${h}" fill="#9B6A45"/>${inner}`;
  const sparkAt = (x, y, at, t, col) => t > at && t < at + 1 ? A.sparkle(x, y, at, t, col) : '';
  const spiral = (x, y, r, a) => {
    let d = '';
    for (let i = 0; i <= 40; i++) { const k = i / 40, ang = a + k * Math.PI * 4, rr = r * k; d += (i ? ' L' : 'M') + f1(x + Math.cos(ang) * rr) + ',' + f1(y + Math.sin(ang) * rr); }
    return `<path d="${d}" fill="none" stroke="${C.purple}" stroke-width="2.5"/>`;
  };

  /* More creatures, (0,0) at the feet, facing right unless flip. */
  function beast(t, kind, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1;
    const bl = blinkAmt(t, seed);
    const hop = o.hop ? -Math.abs(Math.sin(t * o.hop + seed)) * (o.hopH || 26) : Math.sin(t * 2.4 + seed) * 2.5;
    const eye = (x, y, r = 6) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>${bl < 0.5 ? `<circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>` : ''}`;
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    let g = '';
    if (kind === 'roo') {
      const fur = o.col || '#C98A5B', lt = '#E7C9A5', dk = '#9B6A45';
      const tw = Math.sin(t * 2 + seed) * 6;
      g = `<path d="M-36,-46 Q-100,-20 -140,${-4 + tw}" stroke="${fur}" stroke-width="26" fill="none" stroke-linecap="round"/>
        <ellipse cx="8" cy="-8" rx="52" ry="12" fill="${dk}"/>
        <ellipse cx="-4" cy="-56" rx="40" ry="48" fill="${fur}"/>
        <ellipse cx="6" cy="-130" rx="52" ry="82" fill="${fur}"/>
        <ellipse cx="22" cy="-112" rx="30" ry="56" fill="${lt}"/>
        <path d="M-4,-96 Q24,-58 54,-96 Q50,-70 24,-66 Q2,-70 -4,-96 Z" fill="${dk}"/>
        ${o.pouch || ''}
        <path d="M40,-150 l26,22" stroke="${fur}" stroke-width="12" stroke-linecap="round"/><path d="M30,-140 l28,26" stroke="${fur}" stroke-width="12" stroke-linecap="round"/>
        <ellipse cx="34" cy="-262" rx="11" ry="30" transform="rotate(-14 34 -262)" fill="${fur}"/><ellipse cx="60" cy="-258" rx="11" ry="30" transform="rotate(12 60 -258)" fill="${fur}"/>
        <ellipse cx="60" cy="-258" rx="5" ry="18" transform="rotate(12 60 -258)" fill="${C.pinkL}"/>
        <circle cx="44" cy="-214" r="36" fill="${fur}"/><ellipse cx="76" cy="-202" rx="26" ry="18" fill="${lt}"/><ellipse cx="96" cy="-208" rx="7" ry="5" fill="${C.dark}"/>
        ${eye(50, -222, 6)}<path d="M74,${-192 + talk * 2} Q84,${-186 + talk * 6} 94,-192" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'joey') {
      const fur = '#D9A06E';
      g = `<ellipse cx="0" cy="-30" rx="24" ry="30" fill="${fur}"/><ellipse cx="6" cy="-24" rx="13" ry="18" fill="#F1DCC2"/>
        <ellipse cx="-2" cy="-92" rx="7" ry="18" transform="rotate(-12 -2 -92)" fill="${fur}"/><ellipse cx="16" cy="-90" rx="7" ry="18" transform="rotate(14 16 -90)" fill="${fur}"/>
        <circle cx="6" cy="-66" r="22" fill="${fur}"/><ellipse cx="24" cy="-60" rx="13" ry="10" fill="#F1DCC2"/><circle cx="34" cy="-63" r="4" fill="${C.dark}"/>${eye(10, -70, 4.5)}`;
    } else if (kind === 'koala') {
      const fur = '#B9B3C4';
      g = `<ellipse cx="0" cy="-50" rx="42" ry="50" fill="${fur}"/><ellipse cx="0" cy="-40" rx="24" ry="30" fill="#E6E2EC"/>
        <circle cx="-44" cy="-140" r="28" fill="${fur}"/><circle cx="44" cy="-140" r="28" fill="${fur}"/><circle cx="-44" cy="-140" r="15" fill="#E6E2EC"/><circle cx="44" cy="-140" r="15" fill="#E6E2EC"/>
        <circle cx="0" cy="-118" r="44" fill="${fur}"/><ellipse cx="0" cy="-108" rx="13" ry="18" fill="${C.dark}"/>${eye(-20, -128, 5.5)}${eye(20, -128, 5.5)}
        <path d="M-8,${-84 + talk * 2} Q0,${-78 + talk * 5} 8,-84" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'goat') {
      const fur = '#F4EEE8';
      g = `<rect x="-44" y="-50" width="12" height="50" rx="6" fill="#D9CFC8"/><rect x="-22" y="-50" width="12" height="50" rx="6" fill="#D9CFC8"/><rect x="22" y="-50" width="12" height="50" rx="6" fill="#D9CFC8"/><rect x="42" y="-50" width="12" height="50" rx="6" fill="#D9CFC8"/>
        <ellipse cx="4" cy="-70" rx="64" ry="34" fill="${fur}" stroke="#E2D6CC" stroke-width="3"/><path d="M-58,-80 l-16,-14" stroke="${fur}" stroke-width="10" stroke-linecap="round"/>
        <path d="M66,-128 Q50,-170 80,-176" stroke="${C.muted}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <ellipse cx="76" cy="-112" rx="26" ry="32" fill="${fur}" stroke="#E2D6CC" stroke-width="3"/><path d="M84,-84 L82,-60 L92,-80 Z" fill="#E2D6CC"/>
        <ellipse cx="54" cy="-124" rx="16" ry="7" fill="${fur}" stroke="#E2D6CC" stroke-width="2"/>${eye(84, -120, 5)}`;
    } else if (kind === 'gremlin') {
      const col = o.col || C.pink, wob = Math.sin(t * 9 + seed) * 4;
      g = `<path d="M-30,-6 L-24,-20 M30,-6 L24,-20" stroke="${col}" stroke-width="8" stroke-linecap="round"/>
        <path d="M-26,-80 L-36,-112 L-10,-88 Z M26,-80 L36,-112 L10,-88 Z" fill="${DK.pink}"/>
        <ellipse cx="0" cy="-52" rx="${40 + wob * 0.4}" ry="${42 - wob * 0.4}" fill="${col}"/>
        <path d="M-40,-50 L${-64},${-70 + wob * 2} M40,-50 L64,${-70 - wob * 2}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>
        <path d="M-22,-74 L-6,-66 M22,-74 L6,-66" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="-13" cy="-60" r="9" fill="#fff"/><circle cx="13" cy="-60" r="9" fill="#fff"/>${eye(-12, -59, 4.5)}${eye(14, -59, 4.5)}
        <path d="M-14,-36 Q0,${-24 - talk * 8} 14,-36 Z" fill="#6B2A2A"/><path d="M-8,-36 L-5,-30 L-2,-36 M2,-36 L5,-30 L8,-36" fill="#fff"/>
        ${o.tag ? pill(0, 16, o.tag, DK.purple, 1, 24) : ''}`;
    } else if (kind === 'snail') {
      const st = Math.sin(t * 3 + seed) * 4;
      g = `<path d="M-50,-4 Q-60,-20 -40,-22 L40,-22 Q60,-22 64,-44 L60,-70" stroke="#C9B9AE" stroke-width="18" fill="none" stroke-linecap="round"/>
        <path d="M58,-70 L${50 + st},-100 M66,-70 L${78 + st},-98" stroke="#C9B9AE" stroke-width="5" stroke-linecap="round"/>
        <circle cx="${50 + st}" cy="-102" r="6" fill="${C.dark}"/><circle cx="${78 + st}" cy="-100" r="6" fill="${C.dark}"/>
        <circle cx="-2" cy="-58" r="40" fill="${C.peach}"/>${spiral(-2, -58, 34, t * 0.4).replace(C.purple, '#B86E12').replace('2.5', '5')}`;
    } else if (kind === 'fish') {
      g = `<path d="M-40,0 L-64,-18 L-64,18 Z" fill="${C.peach}"/><ellipse cx="0" cy="0" rx="44" ry="24" fill="${o.col || C.peachL}"/>
        <path d="M-6,-22 Q4,-38 18,-22" fill="${C.peach}"/>${eye(24, -6, 5)}`;
    } else if (kind === 'bee') {
      const fl = Math.sin(t * 40) * 10;
      g = `<ellipse cx="-4" cy="-24" rx="12" ry="${16 + fl * 0.5}" fill="#fff" opacity=".8"/><ellipse cx="6" cy="-24" rx="12" ry="${16 - fl * 0.5}" fill="#fff" opacity=".8"/>
        <ellipse cx="0" cy="0" rx="22" ry="16" fill="${C.gold}"/><path d="M-6,-15 L-6,15 M6,-15 L6,15" stroke="${C.dark}" stroke-width="5"/><circle cx="22" cy="-4" r="11" fill="${C.dark}"/>`;
    }
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * f},${s})"><g transform="translate(0,${hop.toFixed(2)})">${g}</g></g>`;
  }
  const bst = (t, kind, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, beast(t, kind, o));
  };

  // Standard kicker + swapping headlines.
  const TYPES = ['parrot-thirty', 'conveyor', 'twin-backpacks', 'exchange-booth', 'moving-truck', 'height-bar', 'dog-show', 'hypnotist',
    'hoops', 'garden-pots', 'kangaroo-joeys', 'tailor-pattern', 'arcade-tokens', 'night-desk', 'plate-stack', 'punch-card',
    'summit-rope', 'raft-waves', 'two-suitcases', 'shield-forge'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s17-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson 17: What Is Risk Per Trade? ================= */
  Object.assign(LIVE, {
    // A parrot squawks "30!" at a chart; a wise owl asks "30 WHAT?". The answer: 30 points of price risk.
    's17-parrot-thirty': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Easel with a chart board.
      const bk = pop(t, T.board, 0.7);
      let b = `<path d="M330,1000 L420,880 M870,1000 L780,880 M600,1000 L600,900" stroke="#9B6A45" stroke-width="16" stroke-linecap="round"/>
        <rect x="200" y="400" width="800" height="500" rx="20" fill="#9B6A45"/><rect x="218" y="418" width="764" height="464" rx="12" fill="#fff"/>`;
      const bars = [[.30, .36], [.36, .33], [.33, .42], [.42, .50], [.50, .47], [.47, .58], [.58, .66], [.66, .72]];
      const Yv = v => 880 - v * 440;
      bars.forEach(([o, c], i) => {
        const k = ease(seg(t, T.board + 0.3 + i * 0.12, T.board + 0.7 + i * 0.12));
        if (k <= 0) return;
        const x = 270 + i * 50, up = c > o, col = up ? C.teal : C.pink, cc = lerp(o, c, k);
        b += `<line x1="${x}" x2="${x}" y1="${Yv(Math.max(o, c) + 0.025)}" y2="${Yv(Math.min(o, c) - 0.025)}" stroke="${col}" stroke-width="4" opacity="${k}"/><rect x="${x - 14}" y="${Yv(Math.max(o, cc))}" width="28" height="${Math.max(3, Math.abs(Yv(o) - Yv(cc)))}" rx="3" fill="${col}"/>`;
      });
      out += scaleAt(600, 1000, bk, b);
      const EY = 560, SY = 790;
      const ek = ease(seg(t, T.entry, T.entry + 0.8)), sk = ease(seg(t, T.stop, T.stop + 0.8));
      if (ek > 0) out += `<line x1="640" x2="${640 + 320 * ek}" y1="${EY}" y2="${EY}" stroke="${DK.teal}" stroke-width="6" stroke-dasharray="14 9"/>`;
      if (sk > 0) out += `<line x1="640" x2="${640 + 320 * sk}" y1="${SY}" y2="${SY}" stroke="${C.pink}" stroke-width="6" stroke-dasharray="14 9"/>`;
      out += pill(770, EY - 36, 'ENTRY 20,000', DK.teal, pop(t, T.entry + 0.4), 24);
      out += pill(770, SY + 38, 'STOP 19,970', DK.pink, pop(t, T.stop + 0.4), 24);
      // Bracket measuring the gap.
      const bk2 = ease(seg(t, T.bracket, T.bracket + 0.8));
      if (bk2 > 0) {
        const y2 = lerp(EY, SY, bk2);
        out += `<path d="M920,${EY} L940,${EY} L940,${f1(y2)} L920,${f1(y2)}" stroke="${C.purple}" stroke-width="6" fill="none" stroke-linejoin="round"/>`;
        out += pill(800, (EY + SY) / 2, '30 POINTS', C.purple, pop(t, T.bracket + 0.6), 30);
      }
      out += pill(600, 1040, 'PRICE RISK = entry ↔ stop distance', C.purple, pop(t, T.punch, 0.6), 26);
      if (t > T.punch) out += A.sparkle(800, 675, T.bracket + 0.6, t);
      // Trader asking.
      const tr = { x: 1200, y: 1000, scale: 1.05, look: A.LOOKS.c, flip: true, seed: 3, at: T.board + 0.5, talk: ctx.talking && t > T.ask && t < T.ask + 2.2 };
      if (t > T.ask && t < T.parrot) tr.frontArm = aim(tr, 1000, 600);
      else if (t > T.punch + 3) tr.frontArm = { a1: -60 + Math.sin(t * 5) * 8, a2: -100 };
      out += who(t, tr);
      out += bub(1220, 590, 'How much are you risking?', between(t, T.ask, T.parrot + 0.6), { size: 26 });
      // Parrot on a perch.
      out += scaleAt(1440, 1000, pop(t, T.board + 0.9, 0.6), `<rect x="1492" y="700" width="16" height="300" fill="#9B6A45"/><rect x="1440" y="692" width="120" height="14" rx="7" fill="#9B6A45"/><ellipse cx="1500" cy="1000" rx="70" ry="10" fill="#9B6A45"/>`);
      const sq = t > T.parrot && t < T.parrot + 1.4;
      out += crit(t, 'parrot', { x: 1500, y: 694, scale: 1.1, seed: 2, at: T.board + 1.1, talk: sq || (t > T.punch + 3 && t < T.punch + 5.5), hop: sq ? 14 : 0, hopH: 16 });
      const pb = between(t, T.parrot, T.what + 1.2);
      out += bub(1590, 520, '30! 🦜', pb, { size: 36 });
      if (t > T.what + 0.4 && pb > 0) out += cross(1660, 500, pop(t, T.what + 0.4, 0.4) * pb, C.pink, 26);
      out += bub(1580, 520, '30 points! ✓', between(t, T.punch + 3, s.end), { size: 30 });
      // Owl on books.
      out += scaleAt(1720, 1000, pop(t, T.board + 1.3, 0.6), `<rect x="1630" y="960" width="180" height="40" rx="6" fill="${C.purple}"/><rect x="1644" y="922" width="156" height="38" rx="6" fill="${C.teal}"/><rect x="1636" y="886" width="170" height="36" rx="6" fill="${C.peach}"/>`);
      out += crit(t, 'owl', { x: 1720, y: 886, scale: 0.9, seed: 6, monocle: true, at: T.board + 1.5, talk: ctx.talking && t > T.what && t < T.what + 2.4 });
      out += bub(1700, 690, '30 WHAT?', between(t, T.what, T.bracket + 2.4), { size: 32, tail: 'right' });
      out += pill(1180, 450, 'not necessarily $30', C.pink, between(t, T.what + 1.6, s.end), 26);
      return out;
    },

    // A little factory: 30 points goes in, × $2 per point, × contracts, and the dollar crates come out.
    's17-conveyor': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EFE8F2', '#DCD3E6');
      const bk = pop(t, T.belt, 0.7);
      // Belt.
      const shift = (t * 80) % 60;
      let belt = `<rect x="100" y="880" width="1140" height="34" rx="17" fill="${C.dark}"/><rect x="110" y="886" width="1120" height="8" rx="4" fill="#5A4A40"/>`;
      for (let x = 130; x < 1220; x += 60) belt += `<circle cx="${f1(x + shift * 0)}" cy="897" r="10" fill="#8C7A70"/><line x1="${x}" y1="897" x2="${f1(x + Math.cos(t * 5) * 9)}" y2="${f1(897 + Math.sin(t * 5) * 9)}" stroke="#D9CFC8" stroke-width="3"/>`;
      belt += `<rect x="150" y="914" width="18" height="86" fill="${C.muted}"/><rect x="1170" y="914" width="18" height="86" fill="${C.muted}"/>`;
      out += scaleAt(670, 1000, bk, belt);
      // Hopper.
      out += scaleAt(220, 880, pop(t, T.belt + 0.3, 0.6), `<path d="M120,420 L320,420 L260,600 L180,600 Z" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="5"/><rect x="190" y="600" width="60" height="40" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="5"/>${txt(220, 480, 'STOP', 24, DK.peach, { ls: 2 })}${txt(220, 514, 'DISTANCE', 20, DK.peach, { ls: 1 })}`);
      // Press station.
      const pressing = t > T.stamp && t < T.stamp + 1;
      const pd = pressing ? Math.sin(seg(t, T.stamp, T.stamp + 1) * Math.PI) * 120 : 0;
      out += scaleAt(560, 880, pop(t, T.belt + 0.5, 0.6), `<rect x="450" y="420" width="220" height="150" rx="16" fill="${C.purple}"/>${txt(560, 480, '× $2', 44, '#fff')}${txt(560, 520, 'per point · MNQ', 20, '#fff', { w: 700 })}
        <rect x="546" y="570" width="28" height="${60 + pd}" fill="${C.muted}"/><rect x="500" y="${630 + pd}" width="120" height="26" rx="6" fill="${DK.purple}"/>
        <rect x="440" y="560" width="20" height="320" fill="${C.purpleL}"/><rect x="660" y="560" width="20" height="320" fill="${C.purpleL}"/>`);
      // Copier station.
      const n = t < T.dial4 ? 1 : t < T.dial4 + 1 ? 1 + Math.floor(seg(t, T.dial4, T.dial4 + 1) * 3.99) : 4;
      out += scaleAt(920, 880, pop(t, T.belt + 0.7, 0.6), `<rect x="810" y="420" width="220" height="330" rx="18" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="6"/>${txt(920, 470, '× CONTRACTS', 24, DK.teal, { ls: 1 })}
        <circle cx="920" cy="580" r="62" fill="#fff" stroke="${DK.teal}" stroke-width="6"/>${txt(920, 604, n, 64, DK.teal)}
        <path d="M920,580 L${f1(920 + Math.cos(rad(-90 + n * 70)) * 50)},${f1(580 + Math.sin(rad(-90 + n * 70)) * 50)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round" opacity=".5"/>
        <rect x="830" y="750" width="180" height="70" rx="10" fill="${DK.teal}"/><rect x="850" y="790" width="140" height="90" fill="#2a1d16" opacity=".5"/>`);
      // Bin.
      out += scaleAt(1360, 1000, pop(t, T.belt + 0.9, 0.6), `<path d="M1240,780 L1480,780 L1460,1000 L1260,1000 Z" fill="${C.pinkL}" stroke="${C.pink}" stroke-width="6"/>`);
      // The traveling item.
      const CH = 74;
      if (t > T.block) {
        let x = 220, y = 880 - CH / 2, label = '30 PTS', col = C.peach, dk = DK.peach;
        if (t < T.block + 1) y = lerp(620, 880 - CH / 2, A.ease(seg(t, T.block, T.block + 1)));
        else if (t < T.stamp) x = lerp(220, 560, seg(t, T.block + 1, T.stamp));
        else if (t < T.stamp + 1) x = 560;
        else if (t < T.copy) x = lerp(560, 920, seg(t, T.stamp + 1, T.copy));
        else if (t < T.copy + 1) x = 920;
        else { const k = ease(seg(t, T.copy + 1, T.copy + 2)); x = lerp(920, 1310, k); y = lerp(880 - CH / 2, 950, k) - Math.sin(k * Math.PI) * 80; }
        if (t > T.stamp + 0.5) { label = '$60'; col = C.cash; dk = DK.teal; }
        const vis = !(t > T.copy && t < T.copy + 1);
        if (vis) out += crate(x, y, 110, CH, label, col, dk, 30);
        if (pressing && t > T.stamp + 0.45) out += sparkAt(560, 820, T.stamp + 0.45, t, C.gold);
      }
      // Extra copies at four contracts.
      const spots = [[1410, 950], [1310, 874], [1410, 874]];
      spots.forEach(([x, y], i) => {
        const at = T.out4 + i * 0.6, k = ease(seg(t, at, at + 0.9));
        if (k <= 0) return;
        out += crate(lerp(920, x, k), lerp(840, y, k) - Math.sin(k * Math.PI) * 90, 110, CH, '$60', C.cash, DK.teal, 30);
      });
      // Display board with the total.
      const tot = t < T.copy + 2 ? null : t < T.out4 + 0.9 ? 60 : t < T.out4 + 1.5 ? 120 : t < T.out4 + 2.1 ? 180 : 240;
      out += scaleAt(1680, 1000, pop(t, T.belt + 1.1, 0.6), `<rect x="1672" y="600" width="16" height="400" fill="${C.muted}"/><rect x="1540" y="420" width="280" height="190" rx="20" fill="${C.dark}"/><rect x="1556" y="436" width="248" height="158" rx="12" fill="#3B2A22"/>
        ${txt(1680, 476, 'PRICE RISK', 22, C.gold, { ls: 2 })}${tot ? txt(1680, 560, '≈ ' + money(tot), 58, C.cash) : txt(1680, 556, '…', 50, '#7A5C50')}`);
      if (tot === 240 && t < T.out4 + 3.2) out += sparkAt(1680, 520, T.out4 + 2.1, t, C.cash);
      // Robot operator turns the dial, cat watches.
      const rb = { x: 1770, y: 1000, scale: 1.05, seed: 4, at: T.belt + 1.3, screen: tot ? '×' + n : '...', talk: ctx.talking && t > T.note && t < T.note + 3 };
      out += crit(t, 'robot', rb);
      out += crit(t, 'cat', { x: 1110, y: 1000, scale: 0.62, seed: 3, at: T.belt + 1.6, flip: t > T.copy + 1 && t < T.out4 + 3 });
      out += bub(1700, 672, 'Make it 4! 🔧', between(t, T.dial4 - 0.6, T.out4 + 1), { size: 28 });
      out += pill(1360, 740, n + (n > 1 ? ' contracts' : ' contract'), DK.teal, pop(t, T.copy + 1.6, 0.5), 24);
      out += pill(960, 1044, '≈ approximate, before fees and slippage', C.purple, pop(t, T.note, 0.6), 24);
      return out;
    },
  });

  /* ================= Lesson 18: Stop Distance vs Dollar Risk ================= */
  Object.assign(LIVE, {
    // Two hikers on the same 30-point trail: one carries one pack, the other a tower of five.
    's17-twin-backpacks': (s, t, ctx) => {
      const T = s.beats;
      let out = `<path d="M0,820 Q300,700 600,800 T1200,780 T1920,800 L1920,1000 L0,1000 Z" fill="#E4F3EE"/>` + ground(1000, '#F1EAD9', '#E2D6C0');
      out += `<path d="M0,1000 Q600,940 960,960 T1920,960" stroke="#E2D6C0" stroke-width="10" fill="none"/>`;
      out += cloud(lerp(300, 420, (t % 30) / 30), 470, 0.8) + cloud(lerp(1500, 1380, (t % 30) / 30), 430, 0.7);
      // Signpost.
      const sk = pop(t, T.sign, 0.7);
      out += scaleAt(960, 1000, sk, post(960, 1000, 420, `<path d="M820,600 L1080,600 L1120,640 L1080,680 L820,680 Z" fill="${C.purple}"/>${txt(960, 652, 'STOP: 30 PTS', 30, '#fff', { ls: 1 })}`));
      out += crit(t, 'bird', { x: 990, y: 600, scale: 0.8, seed: 3, at: T.sign + 0.6, talk: false });
      // Hiker A with one pack.
      const wa = ease(seg(t, T.a, T.a + 2.2)), ax = lerp(-150, 600, wa);
      const ha = { x: ax, y: 1000, scale: 1.1, look: A.LOOKS.b, seed: 2, walking: wa > 0 && wa < 1, talk: ctx.talking && t > T.say && t < T.say + 2 };
      if (t > T.a) {
        const P = (x, y) => `<rect x="${f1(x - 32)}" y="${f1(y - 40)}" width="64" height="80" rx="16" fill="${C.teal}" stroke="${DK.teal}" stroke-width="4"/><rect x="${f1(x - 20)}" y="${f1(y)}" width="40" height="24" rx="6" fill="${C.tealL}"/>`;
        out += P(ax - 56, 1000 - 190) + who(t, ha);
        out += pill(ax, 1040, '1 MNQ', DK.teal, pop(t, T.a + 1.6), 24);
      }
      // Hiker B with five packs.
      const wb = ease(seg(t, T.b, T.b + 2.4)), bx = lerp(2100, 1360, wb);
      const sway = Math.sin(t * 2.6) * (3 + (wb < 1 ? 5 : 2));
      const hb = { x: bx, y: 1000, scale: 1.1, look: A.LOOKS.e, flip: true, seed: 5, walking: wb > 0 && wb < 1, talk: ctx.talking && t > T.say + 1.6 && t < T.say + 3.4 };
      if (t > T.b) {
        let tower = '';
        const cols = [C.pink, C.peach, C.purple, C.pink, C.peach];
        for (let i = 0; i < 5; i++) tower += `<rect x="${-36}" y="${-80 - i * 70}" width="72" height="72" rx="16" fill="${cols[i]}" stroke="#fff" stroke-width="4"/>`;
        out += `<g transform="translate(${f1(bx + 58)},${1000 - 140}) rotate(${f1(sway)})">${tower}</g>` + who(t, hb);
        out += pill(bx, 1040, '5 MNQ', DK.pink, pop(t, T.b + 1.8), 24);
      }
      out += bub(ax + 70, 540, '30-point stop!', between(t, T.say, T.tagA), { size: 28 });
      out += bub(bx - 120, 470, '30-point stop!', between(t, T.say + 1.4, T.tagA + 0.6), { size: 28, tail: 'right' });
      // Price tags.
      const tag = (x, y, text, col, k, big) => k <= 0 ? '' : scaleAt(x, y - 40, k, rotAt(x, y - 40, Math.sin(t * 3 + x) * 6, `<line x1="${x}" y1="${y - 60}" x2="${x}" y2="${y - 30}" stroke="${C.muted}" stroke-width="3"/><path d="M${x - (big ? 110 : 80)},${y - 30} L${x + (big ? 110 : 80)},${y - 30} L${x + (big ? 110 : 80)},${y + 40} L${x - (big ? 110 : 80)},${y + 40} Z" fill="${col}"/><circle cx="${x}" cy="${y - 18}" r="6" fill="#fff"/>${txt(x, y + 24, text, big ? 40 : 34, '#fff')}`));
      out += tag(ax - 56, 590, '≈ $60', DK.teal, pop(t, T.tagA, 0.6), false);
      out += tag(bx + 58, 400, '≈ $300', DK.pink, pop(t, T.tagB, 0.6), true);
      if (t > T.tagB) out += sparkAt(bx + 58, 380, T.tagB + 0.3, t, C.pink);
      // Dog trots with hiker A.
      const dx = lerp(-300, 360, ease(seg(t, T.a + 0.3, T.a + 2.6)));
      out += crit(t, 'dog', { x: dx, y: 1000, scale: 0.55, seed: 4, hop: wa < 1 ? 9 : t > T.tagB ? 6 : 0, hopH: 10, tongue: true });
      out += pill(960, 470, 'same chart stop · different dollars', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },

    // A currency exchange booth: points come in, dollars come out, but only after three questions.
    's17-exchange-booth': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3ECF4', '#E3D8E6');
      // Booth.
      const bk = pop(t, T.booth, 0.8);
      let b = `<rect x="1080" y="470" width="640" height="530" rx="12" fill="${C.purpleL}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${1060 + i * 85},420 L${1145 + i * 85},420 L${1145 + i * 85},470 Q${1102 + i * 85},500 ${1060 + i * 85},470 Z" fill="${i % 2 ? '#fff' : C.pink}"/>`).join('')}
        <rect x="1060" y="380" width="680" height="44" rx="10" fill="${C.purple}"/>${txt(1400, 412, 'POINTS ⇄ DOLLARS', 28, '#fff', { ls: 3 })}
        <rect x="1140" y="560" width="520" height="290" rx="14" fill="#E8F8F6"/>`;
      out += scaleAt(1400, 1000, bk, b);
      // Clerk behind the window.
      const cl = { x: 1400, y: 1040, scale: 1.25, look: A.LOOKS.d, flip: true, seed: 6, at: T.booth + 0.4, hat: 'cap', talk: ctx.talking && t > T.ask && t < T.ask + 4 };
      if (t > T.r1 - 0.4 && t < T.r2 + 1.2) cl.frontArm = aim(cl, 1200, 780);
      out += who(t, cl);
      // Counter in front.
      out += scaleAt(1400, 1000, bk, `<rect x="1060" y="840" width="680" height="36" rx="8" fill="${C.purple}"/><rect x="1080" y="876" width="640" height="124" fill="#B9AED6"/>
        <rect x="1110" y="890" width="250" height="96" rx="10" fill="#fff"/>${txt(1235, 928, 'MNQ', 26, DK.purple)}${txt(1235, 968, '$2 / point', 26, C.text, { w: 700 })}
        <rect x="1440" y="890" width="250" height="96" rx="10" fill="#fff"/>${txt(1565, 928, 'NQ', 26, DK.purple)}${txt(1565, 968, '$20 / point', 26, C.text, { w: 700 })}`);
      // Three question tabs on the window.
      ['HOW FAR?', 'WORTH?', 'HOW MANY?'].forEach((q, i) => {
        const k = pop(t, T.q[i], 0.5), lit = t > T.q[i];
        out += pill(1230 + i * 170, 532, q, lit ? [C.gold, C.purple, DK.teal][i] : '#C9B9AE', k, 20);
      });
      // Pigeon on the roof, cat sits at the counter edge.
      out += crit(t, 'bird', { x: 1660, y: 380, scale: 0.85, seed: 2, col: '#C9C3D9', at: T.booth + 1 });
      out += crit(t, 'cat', { x: 1820, y: 1000, scale: 0.6, seed: 7, flip: true, at: T.booth + 1.3 });
      // Customer with a "20 PTS" coin.
      const cu = { x: 640, y: 1000, scale: 1.12, look: A.LOOKS.a, seed: 3, at: T.booth + 0.2, talk: ctx.talking && t < T.ask };
      const handing = t > T.coin && t < T.ask + 1;
      cu.frontArm = handing ? aim(cu, 760, 760) : { a1: 60, a2: 30 };
      cu.hold = t < T.ask + 1 ? `<g transform="translate(14,-20)"><circle r="40" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/>${txt(0, -2, '20', 28, '#fff')}${txt(0, 22, 'PTS', 16, '#fff')}</g>` : '';
      out += who(t, cu);
      out += bub(600, 560, 'Only 20 points. Low risk! 😎', between(t, T.coin, T.ask), { size: 26 });
      out += bub(1400, 640, 'Can we know that yet? 🤔', between(t, T.ask, T.q[2] + 1), { size: 26 });
      // Coin slides across and the receipts pop out.
      const ck = ease(seg(t, T.ask + 1, T.ask + 2.2));
      if (ck > 0 && ck < 1) out += `<g transform="translate(${f1(lerp(700, 1100, ck))},${f1(780 - Math.sin(ck * Math.PI) * 80)})"><circle r="40" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/>${txt(0, 10, '20', 28, '#fff')}</g>`;
      const rcpt = (x, y, k, a, bline, col) => k <= 0 ? '' : scaleAt(x, y, k, rotAt(x, y, Math.sin(t * 2 + x) * 3, `<path d="M${x - 150},${y - 70} L${x + 150},${y - 70} L${x + 150},${y + 60} ${[...Array(10)].map((_, i) => `L${x + 150 - (i + 0.5) * 30},${y + (i % 2 ? 60 : 74)}`).join(' ')} L${x - 150},${y + 60} Z" fill="#fff" stroke="${col}" stroke-width="4"/>
        ${txt(x, y - 22, a, 28, C.text, { w: 700 })}${txt(x, y + 36, bline, 46, col)}`));
      out += rcpt(760, 500, pop(t, T.r1, 0.6), '20 pts × 1 MNQ', '≈ $40', DK.teal);
      if (t > T.r2) {
        out += rcpt(330, 660, pop(t, T.r2, 0.6), '20 pts × 10 NQ', '≈ $4,000', DK.pink);
        out += sparkAt(330, 660, T.r2 + 0.3, t, C.pink);
      }
      out += pill(960, 1044, 'points = chart · dollars = account', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 19: Position Sizing from Risk ================= */
  Object.assign(LIVE, {
    // A moving truck with a load limit: the cap decides how many boxes (contracts) go in. Floor it.
    's17-moving-truck': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EEF0E6', '#DCDFCF');
      const ph2 = t > T.phase2;
      // Truck.
      const tk = pop(t, T.truck, 0.8);
      let tr = `<rect x="960" y="520" width="580" height="390" rx="18" fill="${C.purple}"/><rect x="984" y="544" width="532" height="352" rx="10" fill="#F4F1FB"/>
        ${[0, 1, 2, 3].map(i => `<line x1="${1050 + i * 130}" y1="548" x2="${1050 + i * 130}" y2="892" stroke="#E4DFF5" stroke-width="4"/>`).join('')}
        <path d="M1540,640 L1680,640 Q1700,640 1712,656 L1770,740 L1770,910 L1540,910 Z" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
        <path d="M1566,664 L1676,664 L1730,742 L1566,742 Z" fill="#E8F8F6"/><circle cx="1756" cy="860" r="12" fill="#FFF3C4"/>
        <rect x="950" y="900" width="830" height="30" rx="10" fill="${C.dark}" opacity=".85"/>`;
      [1070, 1430, 1670].forEach(wx => tr += `<circle cx="${wx}" cy="950" r="48" fill="${C.dark}"/><circle cx="${wx}" cy="950" r="20" fill="#D9CFC8"/>`);
      out += scaleAt(1360, 1000, tk, tr);
      // Load gauge on the roof.
      const cap = ph2 ? 50 : 150;
      const loaded = ph2 ? 0 : T.loads.filter(x => t > x + 0.8).length * 50;
      const tryF = !ph2 && t > T.fourth + 0.7 && t < T.fourth + 1.7, try2 = ph2 && t > T.nofit + 0.7 && t < T.nofit + 1.7;
      const shown = tryF ? 200 : try2 ? 60 : loaded, over = shown > cap;
      const gk = pop(t, T.cap, 0.6);
      if (gk > 0) {
        const wFill = Math.min(1, shown / cap) * 492, shake = over ? Math.sin(t * 50) * 4 : 0;
        out += scaleAt(1250, 470, gk, `<g transform="translate(${f1(shake)},0)"><rect x="1000" y="452" width="500" height="44" rx="22" fill="#fff" stroke="${over ? C.pink : C.purple}" stroke-width="5"/>
          <rect x="1004" y="456" width="${f1(wFill)}" height="36" rx="18" fill="${over ? C.pink : C.teal}"/>${txt(1250, 484, `${money(shown)} / ${money(cap)}`, 26, C.dark)}</g>`);
        out += pill(1250, 410, `RISK CAP ${money(cap)}`, over ? C.pink : DK.purple, gk, 26);
      }
      // Phase 1 boxes: three fit.
      const slots = [1080, 1250, 1420];
      const pileAt = i => [[470, 950], [610, 950], [540, 850], [470, 750]][i];
      if (!ph2) {
        for (let i = 0; i < 4; i++) {
          const at = i < 3 ? T.loads[i] : T.fourth;
          const [px, py] = pileAt(3 - i);
          let x = px, y = py;
          const k = ease(seg(t, at, at + 0.8));
          if (t > T.box - 1 || i < 3) {
            if (t < at) { /* in the pile */ }
            else if (i < 3) { x = lerp(px, slots[i], k); y = lerp(py, 840, k) - Math.sin(k * Math.PI) * 220; }
            else {
              const kb = ease(seg(t, at + 0.8, at + 1.6));
              x = lerp(lerp(px, 1250, k), 640, kb); y = lerp(lerp(py, 700, k), 948, kb) - Math.sin(k * Math.PI) * 200 * (1 - kb) - Math.sin(kb * Math.PI) * 120;
            }
            const op = t > T.phase2 - 0.6 ? 1 - seg(t, T.phase2 - 0.6, T.phase2) : 1;
            out += fade(op * pop(t, T.box + i * 0.2, 0.5), crate(x, y, 140, 100, '$50', BOX, BOXD, 34, '25 pts × $2'));
          }
        }
        out += cross(640, 860, between(t, T.fourth + 1.6, T.phase2 - 0.4, 0.4), C.pink, 30);
        out += pill(1250, 640, '÷ $50 = 3 contracts', DK.teal, between(t, T.loads[2] + 1, T.fourth + 0.6), 26);
        out += pill(1250, 640, 'floor it: never round up', C.pink, between(t, T.fourth + 1.2, T.phase2 - 0.2), 26);
      } else {
        // Phase 2: one $60 box can't fit a $50 cap.
        const k = ease(seg(t, T.nofit, T.nofit + 0.8)), kb = ease(seg(t, T.nofit + 0.8, T.nofit + 1.6));
        const x = lerp(lerp(540, 1250, k), 640, kb), y = lerp(lerp(950, 760, k), 948, kb) - Math.sin(k * Math.PI) * 220 * (1 - kb) - Math.sin(kb * Math.PI) * 100;
        out += scaleAt(540, 950, pop(t, T.phase2 + 0.2, 0.6), crate(x, y, 160, 100, '$60', C.pink, DK.pink, 34, '30 pts × $2'));
        out += pill(1250, 700, 'no fit = no trade', C.pink, pop(t, T.nofit + 1.6, 0.6), 34);
        if (t > T.nofit + 1.6) out += sparkAt(1250, 700, T.nofit + 1.6, t, C.pink);
      }
      // Mover.
      const lastThrow = [...T.loads, T.fourth, T.nofit].filter(x => t > x - 0.3 && t < x + 0.6).length > 0;
      const mv = { x: 760, y: 1000, scale: 1.05, look: A.LOOKS.c, seed: 3, at: T.truck + 0.3, hat: 'hard', talk: ctx.talking && t > T.phase2 + 2 && t < T.phase2 + 4 };
      mv.frontArm = lastThrow ? { a1: -60, a2: -80 } : { a1: 70, a2: 40 };
      out += who(t, mv);
      out += bub(820, 600, 'Wider stop? Fewer boxes.', between(t, T.phase2, T.nofit + 0.6), { size: 26 });
      // Squirrel on the roof, dog by the pile.
      out += crit(t, 'squirrel', { x: 1620, y: 640, scale: 0.75, seed: 2, at: T.truck + 1, hop: t > T.fourth + 0.7 && t < T.fourth + 1.7 ? 8 : 0 });
      out += bub(1700, 470, 'Shrink the stop? ✂️', between(t, T.nofit + 2.2, T.nofit + 3.8), { size: 26 });
      out += pill(1680, 480, 'never shrink the stop', DK.purple, between(t, T.nofit + 3.8, s.end), 24);
      out += crit(t, 'dog', { x: 260, y: 1000, scale: 0.6, seed: 5, at: T.truck + 1.4, tongue: true });
      return out;
    },

    // A parking-garage height bar: the A+ car with double size on the roof can't get under the risk ceiling.
    's17-height-bar': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="880" width="1920" height="120" fill="#ECE4DE"/>` + ground(1000, '#E3D9D1', '#D6CAC0');
      for (let x = ((-t * 0) % 160); x < 1920; x += 160) out += `<rect x="${x + 40}" y="936" width="80" height="8" rx="4" fill="#fff" opacity=".7"/>`;
      // Garage.
      const gk = pop(t, T.gate, 0.8);
      out += scaleAt(1620, 1000, gk, `<rect x="1320" y="430" width="600" height="570" fill="#D9CFC8"/><rect x="1380" y="560" width="540" height="440" fill="#5A4A40"/>
        ${[0, 1, 2].map(i => `<rect x="1380" y="${600 + i * 120}" width="540" height="6" fill="#4A3B33"/>`).join('')}<rect x="1340" y="456" width="560" height="70" rx="12" fill="${C.purple}"/>${txt(1620, 504, 'THE ACCOUNT', 34, '#fff', { ls: 4 })}`);
      // Attendant behind (drawn before the car).
      out += who(t, { x: 1260, y: 980, scale: 0.92, look: A.LOOKS.buyer, flip: true, seed: 6, at: T.gate + 0.5, hat: 'cap', talk: ctx.talking && t > T.ask && t < T.no + 2,
        frontArm: t > T.ask && t < T.unload ? { a1: -150 + Math.sin(t * 4) * 8, a2: -170 } : t > T.through + 1 ? { a1: -110 + Math.sin(t * 7) * 14, a2: -80 } : undefined });
      // Gantry with the hanging bar.
      const hitAt = T.clank, rock = t > hitAt ? Math.sin((t - hitAt) * 9) * 16 * Math.exp(-(t - hitAt) * 1.4) : 0;
      out += scaleAt(1180, 1000, gk, `<rect x="1172" y="530" width="18" height="470" fill="${C.muted}"/><rect x="980" y="520" width="210" height="18" rx="8" fill="${C.muted}"/>
        ${rotAt(1090, 538, rock, `<line x1="1030" y1="538" x2="1030" y2="672" stroke="${C.muted}" stroke-width="4" stroke-dasharray="6 4"/><line x1="1150" y1="538" x2="1150" y2="672" stroke="${C.muted}" stroke-width="4" stroke-dasharray="6 4"/>
        <rect x="1010" y="670" width="160" height="34" rx="8" fill="${C.gold}"/>${[0, 1, 2, 3].map(i => `<path d="M${1022 + i * 40},670 l20,0 l-14,34 l-20,0 Z" fill="${C.dark}"/>`).join('')}`)}`);
      out += pill(1090, 420, 'RISK CEILING $150', DK.peach, pop(t, T.gate + 0.4, 0.6), 26);
      out += crit(t, 'bird', { x: 1010, y: 520, scale: 0.7, seed: 4, col: '#C9C3D9', at: T.gate + 0.8, hop: t > hitAt && t < hitAt + 1 ? 14 : 0 });
      // The car.
      const inK = ease(seg(t, T.car, T.clank)), outK = seg(t, T.through, T.through + 3.2);
      const cx = t < T.through ? lerp(-260, 950, inK) : lerp(950, 2350, outK * outK);
      const moving = (t > T.car && t < T.clank) || t > T.through;
      const dist = t < T.through ? lerp(-260, 950, inK) : cx;
      const bump = t > hitAt && t < hitAt + 0.4 ? -Math.sin(seg(t, hitAt, hitAt + 0.4) * Math.PI) * 18 : 0;
      if (t > T.car) {
        out += `<g transform="translate(${f1(bump)},0)">` + A.vehicle('gold', { x: cx, y: 1000, dist, t, moving, scale: 1.3, plate: 'A+' });
        // Roof cargo: double size.
        const uk = ease(seg(t, T.unload, T.unload + 1.2));
        [0, 1].forEach(i => {
          const bx = lerp(cx + 26, 560 + i * 130, uk), by = lerp(712 - i * 70, 950, uk) - Math.sin(uk * Math.PI) * 220;
          out += rotAt(bx, by, uk * (i ? 200 : -160) % 360 * (uk < 1 ? 1 : 0), crate(bx, by, 130, 66, '×2', C.pink, DK.pink, 30));
        });
        out += `</g>`;
        if (t < T.clank) out += sparkAt(cx + 60, 700, T.car + 1.2 + Math.floor((t - T.car) / 1.4) * 1.4, t, C.gold);
      }
      if (t > hitAt && t < hitAt + 1) out += scaleAt(1000, 640, pop(t, hitAt, 0.3) * (1 - seg(t, hitAt + 0.7, hitAt + 1)), `<path d="M1000,560 l26,40 l46,-14 l-24,40 l40,26 l-48,8 l6,48 l-34,-30 l-32,32 l2,-48 l-48,-6 l40,-28 l-26,-40 l46,12 Z" fill="${C.gold}"/>${txt(1004, 652, 'CLANK!', 26, C.dark)}`);
      out += bub(lerp(380, 820, inK), 560, 'A+ setup! Double size? ✨', between(t, T.car + 0.8, T.clank + 0.6), { size: 28 });
      out += bub(1290, 610, 'Did the cap change?', between(t, T.ask, T.no + 0.4), { size: 28, tail: 'right' });
      out += bub(780, 560, '…no. 😅', between(t, T.no, T.unload + 0.6), { size: 30 });
      out += pill(960, 1044, 'confidence isn’t capacity', C.purple, pop(t, T.punch, 0.6), 28);
      out += pill(625, 860, 'extra size off', C.pink, between(t, T.unload + 1.2, s.end), 22);
      out += crit(t, 'cat', { x: 1820, y: 430, scale: 0.6, seed: 2, flip: true, at: T.gate + 1, sleep: t > T.punch });
      if (t > T.through + 1) out += crit(t, 'dog', { x: lerp(-200, 380, ease(seg(t, T.through + 1, T.through + 3.5))), y: 1000, scale: 0.6, seed: 2, hop: t < T.through + 3.5 ? 9 : 0, hopH: 10, tongue: true });
      out += bub(400, 780, 'Sniff… ×2? 🐾', between(t, T.through + 4, s.end), { size: 24 });
      return out;
    },
  });

  /* ================= Lesson 20: Understanding R ================= */
  Object.assign(LIVE, {
    // A dog show long jump: a chihuahua and a Great Dane each leap 2 of their own body lengths. Both score +2R.
    's17-dog-show': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="680" width="1920" height="10" fill="#E2D6CC"/>` + ground(1000, '#EAF4E8', '#D3E6CF');
      const lanes = [{ y: 680, sc: 0.7, at: T.dogs, jump: T.jump[0], r: '$50', res: '+$100', col: C.peach, ear: '#B86E12' },
        { y: 1000, sc: 1.6, at: T.dogs + 0.6, jump: T.jump[1], r: '$250', res: '+$500', col: '#B9B3C4', ear: C.muted }];
      const lk = pop(t, T.lanes, 0.6);
      lanes.forEach((L, li) => {
        const len = 200 * L.sc, x0 = 300;
        // Track and start line.
        out += scaleAt(700, L.y, lk, `<rect x="160" y="${L.y - 8}" width="1200" height="14" rx="7" fill="${li ? '#CFE3CB' : '#E2D6CC'}"/><rect x="${x0 - 4}" y="${L.y - 60}" width="8" height="60" fill="${C.purple}"/>`);
        // R blocks under the track.
        const mk = ease(seg(t, T.measure + li * 0.5, T.measure + li * 0.5 + 0.8));
        [0, 1].forEach(j => {
          if (mk <= 0) return;
          const w = len * Math.min(1, Math.max(0, mk * 2 - j));
          out += `<rect x="${x0 + j * len}" y="${L.y - 6}" width="${f1(w)}" height="20" rx="4" fill="${j ? C.purple : C.teal}" opacity=".85"/>`;
          if (mk > 0.5 + j * 0.25) out += pill(x0 + j * len + len / 2, L.y + 36, (j + 1) + 'R', j ? C.purple : DK.teal, 1, 22);
        });
        // The dog: trots in, then jumps 2 body lengths.
        const k = ease(seg(t, L.at, L.at + 1.6)), jk = seg(t, L.jump, L.jump + 1);
        const startX = x0 - 110 * L.sc;
        const x = t < L.jump ? lerp(-260, startX, k) : startX + 2 * len * ease(jk);
        const y = L.y - Math.sin(Math.min(1, jk) * Math.PI) * (li ? 130 : 150);
        if (t > L.at) out += critter(t, 'dog', { x, y, scale: L.sc, seed: 3 + li, col: L.col, ear: L.ear, hop: k < 1 ? 10 : 0, hopH: 8, tongue: jk >= 1 });
        // Labels: 1R and the result.
        out += pill(1260, L.y - 50, '1R = ' + L.r, li ? DK.purple : DK.peach, pop(t, L.at + 1.2, 0.5), li ? 28 : 24);
        const landX = startX + 2 * len + 10 * L.sc;
        const scored = t > T.score + li * 0.4;
        out += pill(landX + (li ? 280 : 0), L.y - (li ? 130 : 190), scored ? '+2R' : L.res, scored ? C.teal : C.cashD, pop(t, L.jump + 1, 0.5), li ? 34 : 26);
        if (scored) out += sparkAt(landX + (li ? 280 : 0), L.y - (li ? 130 : 190), T.score + li * 0.4, t, C.teal);
      });
      // Judge owl on a tall chair.
      out += scaleAt(1500, 1000, pop(t, T.lanes + 0.6, 0.6), `<rect x="1440" y="640" width="120" height="20" rx="6" fill="#9B6A45"/><rect x="1450" y="660" width="14" height="340" fill="#9B6A45"/><rect x="1536" y="660" width="14" height="340" fill="#9B6A45"/><rect x="1450" y="820" width="100" height="12" fill="#9B6A45"/>`);
      const sk = t > T.score;
      out += crit(t, 'owl', { x: 1500, y: 640, scale: 0.85, seed: 5, at: T.lanes + 0.8, talk: ctx.talking && t > T.score && t < T.score + 3 });
      if (sk) [0, 1].forEach(i => {
        const k = pop(t, T.score + i * 0.4, 0.5);
        out += scaleAt(1440 + i * 120, 470, k, `<rect x="${1440 + i * 120 - 2}" y="470" width="8" height="70" fill="${C.muted}"/><rect x="${1440 + i * 120 - 48}" y="420" width="100" height="64" rx="10" fill="#fff" stroke="${C.teal}" stroke-width="5"/>${txt(1442 + i * 120, 465, '+2R', 32, DK.teal)}`);
      });
      // Crowd, hypnotised by the big dollars.
      const ck = t > T.crowd && t < T.measure + 1;
      [[1700, A.LOOKS.a, 4], [1840, A.LOOKS.seller, 7]].forEach(([x, look, seed], i) => {
        const o = { x, y: 1000, scale: 0.85, look, flip: true, seed, at: T.lanes + 1 + i * 0.3, talk: ctx.talking && ck };
        if (ck) o.frontArm = { a1: -120 + Math.sin(t * 7 + i) * 10, a2: -100 };
        out += who(t, o);
        if (ck) out += txt(x - 4, 1000 - 280 * 0.85 + Math.sin(t * 2) * 2, '💲  💲', 18, C.cashD);
      });
      out += bub(1740, 600, '$500!!! 😍', between(t, T.crowd, T.measure + 0.6), { size: 32, tail: 'right' });
      return out;
    },

    // A hypnotist swings a dollar coin; an owl hands over R glasses, and the outcome becomes +2R. Nothing more.
    's17-hypnotist': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#F6EEF7"/>` + ground(1000, '#EFE3EE', '#E1D2E0');
      // Curtain sides.
      out += `<path d="M0,380 L120,380 Q90,700 140,1000 L0,1000 Z" fill="${C.purpleL}"/><path d="M0,380 L1920,380 L1920,410 L0,410 Z" fill="${C.purple}"/>`;
      const awake = t > T.glasses + 1.1;
      // Hypnotist.
      const hy = { x: 360, y: 1000, scale: 1.05, look: A.LOOKS.a, seed: 2, at: T.hyp, hat: 'top', mood: awake && t < T.calc + 2 ? 'sad' : undefined, talk: ctx.talking && t < T.glasses };
      hy.frontArm = awake && t < T.calc ? { a1: 100, a2: 95 } : aim(hy, 530, 620);
      out += who(t, hy);
      // Swinging coin on a chain.
      if (!awake || t > T.calc + 3) {
        const ang = Math.sin(t * 2.6) * 32, hx = 530, hyy = 620;
        const cxp = hx + Math.sin(rad(ang)) * 150, cyp = hyy + Math.cos(rad(ang)) * 150;
        out += fade(pop(t, T.hyp + 0.5), `<line x1="${hx}" y1="${hyy}" x2="${f1(cxp)}" y2="${f1(cyp)}" stroke="${C.gold}" stroke-width="4"/><circle cx="${f1(cxp)}" cy="${f1(cyp)}" r="${awake ? 34 : 44}" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/>${txt(cxp, cyp + 14, '$', 40, '#fff')}
          ${awake ? '' : `<circle cx="${f1(cxp)}" cy="${f1(cyp)}" r="${60 + Math.sin(t * 6) * 8}" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".5"/>`}`);
      }
      // Candle character: hypnotised, then wearing R glasses.
      const ey = -184 + 44;
      const spiralEyes = `${spiral(-16, ey, 12, t * 6)}${spiral(16, ey, 12, t * 6 + 1)}`;
      const glasses = `<circle cx="-16" cy="${ey}" r="17" fill="#fff" fill-opacity=".25" stroke="${C.dark}" stroke-width="5"/><circle cx="16" cy="${ey}" r="17" fill="#fff" fill-opacity=".25" stroke="${C.dark}" stroke-width="5"/><path d="M-1,${ey} L1,${ey}" stroke="${C.dark}" stroke-width="5"/>${txt(0, ey - 26, 'R', 22, C.purple)}`;
      out += candy(t, { x: 820, y: 1000, scale: 1.3, h: 150, w: 80, col: C.teal, wu: 26, seed: 4, at: T.hyp + 0.3, lean: awake ? 0 : Math.sin(t * 2.6) * 7,
        extra: awake ? glasses : spiralEyes, arms: awake && t > T.calc && t < T.q[0] ? 'cheer' : awake ? undefined : 'out', mood: awake && t > T.q[0] && t < T.punch ? 'wow' : undefined });
      if (!awake) for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; out += txt(780 + i * 40 + Math.sin(p * 6) * 10, 760 - p * 200, '$', 34, C.cashD, { op: Math.sin(p * Math.PI) }); }
      // Owl on a stool tosses the R glasses.
      out += scaleAt(1090, 1000, pop(t, T.hyp + 0.8, 0.6), `<rect x="1030" y="860" width="120" height="18" rx="6" fill="#9B6A45"/><rect x="1040" y="878" width="12" height="122" fill="#9B6A45"/><rect x="1128" y="878" width="12" height="122" fill="#9B6A45"/>`);
      out += crit(t, 'owl', { x: 1090, y: 860, scale: 0.85, seed: 3, flip: true, at: T.hyp + 1, talk: ctx.talking && t > T.glasses && t < T.glasses + 2.5 });
      const gk = seg(t, T.glasses, T.glasses + 1.1);
      if (gk > 0 && gk < 1) out += `<g transform="translate(${f1(lerp(1060, 820, gk))},${f1(lerp(730, 860, gk) - Math.sin(gk * Math.PI) * 160)}) rotate(${f1(gk * 360)})"><circle cx="-16" r="17" fill="none" stroke="${C.dark}" stroke-width="5"/><circle cx="16" r="17" fill="none" stroke="${C.dark}" stroke-width="5"/></g>`;
      out += bub(1060, 650, 'Try these. 👓', between(t, T.glasses - 0.3, T.glasses + 2), { size: 28, tail: 'right' });
      if (awake) out += sparkAt(820, 820, T.glasses + 1.1, t, C.purple);
      // Chalkboard.
      const bk = pop(t, T.calc - 0.4, 0.7);
      let b = `<rect x="1250" y="440" width="560" height="300" rx="18" fill="#3B4A44" stroke="#9B6A45" stroke-width="12"/>`;
      out += scaleAt(1530, 590, bk, b);
      out += fade(pop(t, T.calc, 0.4), txt(1290, 510, 'RESULT', 26, '#E8F8F6', { a: 'start', w: 700 }) + txt(1770, 510, '+$300', 38, C.cash, { a: 'end' }));
      out += fade(pop(t, T.calc + 0.8, 0.4), txt(1290, 580, '÷ PLANNED RISK', 26, '#E8F8F6', { a: 'start', w: 700 }) + txt(1770, 580, '$150', 38, C.pinkL, { a: 'end' }) + `<line x1="1290" x2="1770" y1="606" y2="606" stroke="#E8F8F6" stroke-width="3"/>`);
      out += scaleAt(1530, 676, pop(t, T.calc + 1.8, 0.5), txt(1530, 692, '= +2R', 58, C.gold));
      if (t > T.calc + 1.8) out += sparkAt(1530, 676, T.calc + 1.8, t, C.gold);
      // What R can't tell you.
      ['VALID?', 'WELL EXECUTED?', 'EDGE?'].forEach((q, i) => {
        const k = pop(t, T.q[i], 0.5);
        if (k <= 0) return;
        const x = [1340, 1560, 1770][i], y = 840 + (i % 2) * 70, w = q.length * 17 + 50;
        out += scaleAt(x, y, k, rotAt(x, y, Math.sin(t * 2 + i) * 4, `<rect x="${x - w / 2}" y="${y - 32}" width="${w}" height="64" rx="12" fill="#fff" stroke="${C.muted}" stroke-width="4" stroke-dasharray="10 7"/>${txt(x, y + 10, q, 26, C.muted)}`));
        out += cross(x + w / 2 - 6, y - 30, pop(t, T.q[i] + 0.6, 0.4), C.pink, 20);
      });
      out += pill(1560, 1044, 'R can’t tell you these', C.pink, pop(t, T.q[2] + 1, 0.5), 24);
      out += pill(620, 1044, 'R = outcome ÷ planned risk', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 21: 1:1 vs 1:2 ================= */
  Object.assign(LIVE, {
    // Basketball: a 40% shooter on a court where every basket is worth 2R and every miss costs 1R.
    's17-hoops': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="700" y="860" width="1220" height="140" fill="#F3D9B8"/>` + ground(1000, '#EBC9A0', '#D9B48A');
      out += `<path d="M1000,1000 Q1300,880 1600,860" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>`;
      // Rule cards.
      [['1:1', 'risk 1R → make 1R', C.peach, DK.peach], ['1:2', 'risk 1R → make 2R', C.teal, DK.teal]].forEach(([big, small, col, dk], i) => {
        const k = pop(t, T.signs[i], 0.6), y = 430 + i * 120;
        out += scaleAt(420, y + 45, k, rotAt(420, y + 45, Math.sin(t * 1.6 + i) * 1.5, `<rect x="200" y="${y}" width="440" height="96" rx="18" fill="#fff" stroke="${col}" stroke-width="5"/><rect x="200" y="${y}" width="130" height="96" rx="18" fill="${col}"/>${txt(265, y + 64, big, 44, '#fff')}${txt(485, y + 60, small, 26, dk)}`));
      });
      // Hoop.
      const hk = pop(t, T.court, 0.8);
      out += scaleAt(1700, 1000, hk, `<rect x="1690" y="520" width="22" height="480" fill="${C.muted}"/><rect x="1640" y="380" width="22" height="200" rx="4" fill="#fff" stroke="${C.dark}" stroke-width="4"/><rect x="1662" y="520" width="40" height="14" fill="${C.muted}"/>`);
      const SH = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0], dt = 0.8;
      const RX = 1590, RY = 540;
      const idx = Math.floor((t - T.shots) / dt), p = ((t - T.shots) / dt) - idx;
      const swish = idx >= 0 && idx < 10 && SH[idx] && p > 0.6 ? Math.sin((p - 0.6) / 0.4 * Math.PI) * 10 : 0;
      out += fade(hk, `<path d="M${RX - 50},${RY} L${RX - 36},${RY + 70 + swish} L${RX + 36},${RY + 70 + swish} L${RX + 50},${RY}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="8 6"/><path d="M${RX - 36},${RY + 70 + swish} L${RX + 50},${RY} M${RX + 36},${RY + 70 + swish} L${RX - 50},${RY}" stroke="#E9E1DB" stroke-width="3"/>
        <ellipse cx="${RX}" cy="${RY}" rx="54" ry="12" fill="none" stroke="${C.pink}" stroke-width="8"/>`);
      // Player.
      const shooting = idx >= 0 && idx < 10 && p < 0.35;
      const pl = { x: 980, y: 1000, scale: 1.1, look: A.LOOKS.e, seed: 3, at: T.court + 0.4, hat: 'bandana' };
      pl.frontArm = shooting ? { a1: -70, a2: -60 } : { a1: 40, a2: -30 };
      out += who(t, pl);
      // Ball.
      if (idx >= 0 && idx < 10) {
        const made = SH[idx];
        let bx, by;
        const sx = 1040, sy = 660;
        if (p < 0.6) { const k = p / 0.6; bx = lerp(sx, made ? RX : RX - 40, k); by = lerp(sy, RY - 20, k) - Math.sin(k * Math.PI) * 300; }
        else if (made) { const k = (p - 0.6) / 0.4; bx = RX; by = lerp(RY - 20, 960, k * k); }
        else { const k = (p - 0.6) / 0.4; bx = lerp(RX - 40, 1380, k); by = lerp(RY - 20, 960, k) - Math.sin(k * Math.PI) * 120; }
        out += `<g transform="translate(${f1(bx)},${f1(by)}) rotate(${f1(p * 540)})"><circle r="30" fill="${C.peach}" stroke="#B86E12" stroke-width="4"/><path d="M-30,0 L30,0 M0,-30 L0,30" stroke="#B86E12" stroke-width="3"/></g>`;
        if (p > 0.6) out += pill(RX, 420, made ? '+2R' : '−1R', made ? DK.teal : C.pink, back((p - 0.6) / 0.25), 30);
      } else if (idx < 0) out += `<circle cx="1040" cy="${f1(700 + Math.abs(Math.sin(t * 5)) * -40)}" r="30" fill="${C.peach}" stroke="#B86E12" stroke-width="4"/>`;
      // Scoreboard.
      const done = Math.max(0, Math.min(10, idx + (p > 0.6 ? 1 : 0)));
      const W = SH.slice(0, done).reduce((a, b) => a + b, 0), Lo = done - W;
      const bk = pop(t, T.shots - 0.6, 0.6);
      let sb = `<rect x="200" y="690" width="440" height="290" rx="20" fill="${C.dark}"/><rect x="216" y="706" width="408" height="258" rx="12" fill="#3B2A22"/>`;
      sb += txt(240, 760, 'WINS', 26, C.tealL, { a: 'start', ls: 2 }) + txt(240, 820, 'LOSSES', 26, C.pinkL, { a: 'start', ls: 2 });
      sb += txt(420, 762, W, 44, '#fff') + txt(420, 822, Lo, 44, '#fff');
      if (t > T.tally) sb += txt(600, 762, '+' + W * 2 + 'R', 38, C.teal, { a: 'end' }) + txt(600, 822, '−' + Lo + 'R', 38, C.pink, { a: 'end' });
      sb += `<line x1="240" x2="600" y1="848" y2="848" stroke="#7A5C50" stroke-width="3"/>`;
      if (t > T.total) sb += txt(420, 900, 'NET +2R / 10 shots', 30, C.gold) + txt(420, 944, '≈ +0.2R per trade', 28, '#fff', { w: 700 });
      out += scaleAt(420, 830, bk, sb);
      if (t > T.total) out += sparkAt(420, 900, T.total, t, C.gold);
      out += pill(420, 1040, `win rate ${done ? Math.round(W / done * 100) : 0}%`, DK.purple, pop(t, T.shots + 0.4, 0.5), 24);
      out += pill(1300, 1044, 'in theory, before costs', C.purple, pop(t, T.total + 1.4, 0.5), 24);
      // Cat cheerleader and a mascot bird.
      const lastMade = SH.some((m, i) => m && t > T.shots + i * dt + 0.6 && t < T.shots + i * dt + 1.4);
      out += crit(t, 'cat', { x: 1380, y: 1000, scale: 0.65, seed: 2, at: T.court + 0.8, hop: lastMade ? 9 : 0, hopH: 30 });
      out += crit(t, 'bird', { x: 1250 + Math.sin(t * 0.8) * 140, y: 470 + Math.sin(t * 1.7) * 30, scale: 0.8, seed: 5, fly: true, flip: Math.cos(t * 0.8) < 0, at: T.court + 1.2 });
      return out;
    },

    // Two pots, both labelled 1:2. A pot is a structure; what actually grows depends on the real sample.
    's17-garden-pots': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#F2F8EE" opacity=".6"/>` + ground(1000, '#E6F0DE', '#D2E2C6');
      // Fence.
      for (let x = 40; x < 1920; x += 90) out += `<path d="M${x},1000 L${x},640 L${x + 25},610 L${x + 50},640 L${x + 50},1000 Z" fill="#fff" opacity=".7"/>`;
      // Bench.
      out += scaleAt(960, 1000, pop(t, T.pots, 0.7), `<rect x="260" y="880" width="1400" height="26" rx="10" fill="#B8835A"/><rect x="300" y="906" width="22" height="94" fill="#9B6A45"/><rect x="1600" y="906" width="22" height="94" fill="#9B6A45"/>`);
      const pot = (x, k, lab) => scaleAt(x, 880, k, `<path d="M${x - 120},700 L${x + 120},700 L${x + 90},880 L${x - 90},880 Z" fill="${C.peach}"/><rect x="${x - 134}" y="690" width="268" height="40" rx="10" fill="#E08E2E"/>${txt(x, 814, lab, 48, '#fff')}`);
      // Plant A: sprouts, then wilts.
      const ga = ease(seg(t, T.label, T.label + 1.4)), wl = ease(seg(t, T.wilt, T.wilt + 1.6));
      if (ga > 0) {
        const lean = wl * 60, col = wl > 0.5 ? '#B9A88E' : C.teal, h = 200 * ga;
        out += rotAt(560, 700, lean, `<path d="M560,700 Q560,${700 - h * 0.6} 560,${700 - h}" stroke="${wl > 0.5 ? '#9C8A70' : C.tealD}" stroke-width="10" fill="none" stroke-linecap="round"/>
          <ellipse cx="${530}" cy="${700 - h * 0.5}" rx="${34 * ga}" ry="${16 * ga}" transform="rotate(${-30 + wl * 50} 530 ${700 - h * 0.5})" fill="${col}"/><ellipse cx="${592}" cy="${700 - h * 0.7}" rx="${34 * ga}" ry="${16 * ga}" transform="rotate(${30 + wl * 40} 592 ${700 - h * 0.7})" fill="${col}"/>
          <circle cx="560" cy="${700 - h}" r="${22 * ga}" fill="${wl > 0.5 ? '#C9B9AE' : C.pinkL}"/>`);
      }
      out += pot(560, pop(t, T.pots + 0.3, 0.6), '1:2');
      out += pill(560, 950, '25% wins', DK.peach, pop(t, T.wilt - 0.4, 0.5), 26);
      out += pill(560, 470, '≈ −0.25R per trade', C.pink, pop(t, T.wilt + 1.4, 0.5), 28);
      // Plant B grows once the real ingredients are in.
      const gb = ease(seg(t, T.grow, T.grow + 2));
      if (gb > 0) {
        const h = 260 * gb, sw = Math.sin(t * 1.8) * 4;
        out += rotAt(1340, 700, sw, `<path d="M1340,700 Q1330,${700 - h * 0.5} 1340,${700 - h}" stroke="${C.tealD}" stroke-width="12" fill="none" stroke-linecap="round"/>
          ${[0.35, 0.55, 0.75].map((f, i) => `<ellipse cx="${1340 + (i % 2 ? 36 : -36)}" cy="${700 - h * f}" rx="${40 * gb}" ry="${18 * gb}" transform="rotate(${i % 2 ? 28 : -28} ${1340 + (i % 2 ? 36 : -36)} ${700 - h * f})" fill="${C.teal}"/>`).join('')}
          ${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${1340 + Math.cos(i * 1.256) * 26 * gb}" cy="${700 - h + Math.sin(i * 1.256) * 26 * gb}" rx="${18 * gb}" ry="${18 * gb}" fill="${C.pink}"/>`).join('')}<circle cx="1340" cy="${700 - h}" r="${16 * gb}" fill="${C.gold}"/>`);
      }
      out += pot(1340, pop(t, T.pots + 0.5, 0.6), '1:2');
      out += pill(1340, 950, 'real sample?', DK.teal, pop(t, T.label + 0.6, 0.5), 26);
      // Ingredient checklist beside pot B.
      ['real win rate', 'real avg win & loss', 'consistent execution', 'costs + big sample'].forEach((lab, i) => {
        const k = pop(t, T.items[i], 0.5);
        if (k <= 0) return;
        const y = 470 + i * 72, x = 1700;
        out += scaleAt(x, y, k, `<rect x="${x - 170}" y="${y - 28}" width="340" height="56" rx="28" fill="#fff" stroke="${C.tealL}" stroke-width="4"/>${txt(x + 20, y + 9, lab, 22, DK.teal)}`) + check(x - 140, y, k, C.teal, 20);
        // A seed flies into the pot.
        const sk = seg(t, T.items[i], T.items[i] + 0.8);
        if (sk > 0 && sk < 1) out += `<circle cx="${f1(lerp(x - 170, 1340, sk))}" cy="${f1(lerp(y, 700, sk) - Math.sin(sk * Math.PI) * 80)}" r="10" fill="#9B6A45"/>`;
      });
      // Gardener with a watering can.
      const gd = { x: 950, y: 1000, scale: 1.05, look: A.LOOKS.buyer, seed: 4, at: T.pots + 0.6, flip: t < T.items[0] - 0.5, talk: ctx.talking && t > T.label && t < T.label + 3 };
      const pour = t > T.grow - 0.4 && t < T.grow + 2;
      gd.frontArm = pour ? { a1: -30, a2: -10 } : { a1: 40, a2: 20 };
      gd.hold = `<g transform="rotate(${pour ? 30 : 0})"><path d="M-30,-10 L30,-10 L24,40 L-24,40 Z" fill="${C.purple}"/><path d="M28,0 L70,-30" stroke="${C.purple}" stroke-width="10" stroke-linecap="round"/><path d="M-20,-10 Q0,-46 20,-10" stroke="${DK.purple}" stroke-width="6" fill="none"/></g>`;
      out += who(t, gd);
      if (pour) for (let i = 0; i < 5; i++) { const p = (t * 2 + i / 5) % 1; out += `<circle cx="${1070 + p * 120 + i * 6}" cy="${640 + p * 60}" r="5" fill="${C.teal}" opacity="${1 - p}"/>`; }
      out += bub(950, 560, 'Same pot. Different harvest?', between(t, T.wilt + 0.4, T.items[0] - 0.2), { size: 26 });
      // Snail (costs) creeping along the bench; bee around plant B.
      const snx = lerp(1640, 1480, seg(t, T.pots + 1, s.end));
      out += crit(t, 'cat', { x: 200, y: 1000, scale: 0.6, seed: 6, at: T.pots + 1.2, sleep: t < T.wilt });
      out += bst(t, 'snail', { x: snx, y: 880, scale: 0.6, seed: 2, flip: true, at: T.pots + 1.4 });
      out += pill(snx, 960, 'costs', C.muted, pop(t, T.items[3] + 0.4, 0.5), 20);
      if (gb > 0.3) out += bst(t, 'bee', { x: 1340 + Math.cos(t * 2.2) * 120, y: 470 + Math.sin(t * 3.1) * 50, scale: 0.9, seed: 3, flip: Math.sin(t * 2.2) > 0 });
      out += pill(960, 1044, 'the real sample decides', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 22: The Dayli ICC Risk Example ================= */
  Object.assign(LIVE, {
    // A kangaroo carries four joeys (contracts): each risks 30 points, and the target ledge is twice as far up.
    's17-kangaroo-joeys': (s, t, ctx) => {
      const T = s.beats;
      const TY = 600, EY = 820, SY = 930;
      let out = ground(1000, '#F8EBDD', '#EAD7C3');
      // Price lines.
      const lk = ease(seg(t, T.lines, T.lines + 1));
      [[TY, C.teal, 'TARGET +60 pts', DK.teal], [EY, C.purple, 'ENTRY', DK.purple], [SY, C.pink, 'STOP −30 pts', DK.pink]].forEach(([y, col, lab, dk], i) => {
        const k = ease(seg(t, T.lines + i * 0.3, T.lines + i * 0.3 + 0.9));
        if (k > 0) out += `<line x1="380" x2="${f1(380 + 1160 * k)}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="5" stroke-dasharray="14 10"/>`;
        out += pill(1460, y - 32, lab, dk, pop(t, T.lines + i * 0.3 + 0.6, 0.5), 22);
      });
      out += `<rect x="380" y="${SY}" width="${f1(1160 * lk)}" height="70" fill="${C.pinkP}" opacity=".8"/>`;
      // Cliff with two rock ledges.
      out += fade(lk, `<path d="M240,1000 L240,380 Q300,360 340,400 L380,400 L380,1000 Z" fill="#C9A27E"/>
        <path d="M380,${TY} L940,${TY} Q960,${TY + 18} 930,${TY + 34} L380,${TY + 34} Z" fill="#B8835A"/>
        <path d="M380,${EY} L1180,${EY} Q1200,${EY + 18} 1170,${EY + 34} L380,${EY + 34} Z" fill="#B8835A"/>`);
      // Brackets: 1 vs 2.
      const bk = ease(seg(t, T.sum + 0.4, T.sum + 1.2)), gk = ease(seg(t, T.gross + 0.4, T.gross + 1.2));
      if (bk > 0) out += `<path d="M1300,${EY} L1320,${EY} L1320,${f1(lerp(EY, SY, bk))} L1300,${f1(lerp(EY, SY, bk))}" stroke="${C.pink}" stroke-width="6" fill="none"/>` + pill(1360, (EY + SY) / 2, '1', C.pink, pop(t, T.sum + 1, 0.4), 30);
      if (gk > 0) out += `<path d="M1300,${EY} L1320,${EY} L1320,${f1(lerp(EY, TY, gk))} L1300,${f1(lerp(EY, TY, gk))}" stroke="${C.teal}" stroke-width="6" fill="none"/>` + pill(1360, (EY + TY) / 2, '2', DK.teal, pop(t, T.gross + 1, 0.4), 30);
      // Kangaroo: stands on entry, hops to target.
      const hk = seg(t, T.hop, T.hop + 1.1);
      const rx = lerp(500, 640, ease(hk)), ry = lerp(EY, TY, ease(hk)) - Math.sin(hk * Math.PI) * 90;
      out += bst(t, 'roo', { x: rx, y: ry, scale: 0.72, seed: 2, at: T.roo, talk: ctx.talking && t > T.gross && t < T.gross + 3 });
      // Joeys: pop from the pouch, sit on the entry ledge, then follow up.
      T.joeys.forEach((at, i) => {
        if (t < at) return;
        const k = ease(seg(t, at, at + 0.7));
        const sx = 760 + i * 100, tx = 720 + i * 90;
        const jh = seg(t, T.hop + 0.5 + i * 0.25, T.hop + 1.3 + i * 0.25);
        const x0 = lerp(530, sx, k), y0 = lerp(EY - 90, EY, k) - Math.sin(k * Math.PI) * 90;
        const x = lerp(x0, tx, ease(jh)), y = lerp(y0, TY, ease(jh)) - Math.sin(jh * Math.PI) * 80;
        out += beast(t, 'joey', { x, y, scale: 0.7, seed: i + 3, hop: jh <= 0 || jh >= 1 ? 3 + i * 0.4 : 0, hopH: 8 });
        const tg = jh >= 1 ? '+$120' : '$60';
        out += pill(x + 4, y - 96, tg, jh >= 1 ? DK.teal : C.pink, pop(t, at + 0.5, 0.4) * (jh > 0 && jh < 1 ? 0 : 1), 20);
      });
      out += pill(860, 968, '4 × 30 × $2 ≈ $240 risk', C.pink, pop(t, T.sum, 0.6), 28);
      out += pill(1150, 450, '4 × 60 × $2 ≈ $480 gross', DK.teal, pop(t, T.gross, 0.6), 28);
      out += pill(1000, 712, '1:2, before trading costs', C.purple, pop(t, T.note - 0.6, 0.5), 24);
      // Koala referee on a stump.
      out += scaleAt(1720, 1000, pop(t, T.lines + 1, 0.6), `<path d="M1640,1000 L1650,900 L1790,900 L1800,1000 Z" fill="#9B6A45"/><ellipse cx="1720" cy="900" rx="72" ry="16" fill="#C9A27E"/>`);
      out += bst(t, 'koala', { x: 1720, y: 900, scale: 0.9, seed: 4, at: T.lines + 1.3, talk: ctx.talking && t > T.note && t < T.note + 3 });
      const nk = t > T.note;
      out += scaleAt(1720, 700, pop(t, nk ? T.note : T.roo + 1, 0.6), `<rect x="1716" y="640" width="8" height="120" fill="#9B6A45"/><rect x="1590" y="560" width="260" height="${nk ? 100 : 80}" rx="12" fill="#fff" stroke="${nk ? C.pink : C.purple}" stroke-width="5"/>
        ${nk ? txt(1720, 602, 'EXAMPLE,', 28, DK.pink) + txt(1720, 640, 'NOT ADVICE', 28, DK.pink) : txt(1720, 612, 'MNQ · $2/pt', 28, DK.purple)}`);
      return out;
    },

    // A tailor's shop: Dayli's outfit (4 MNQ) is her size. Copy the pattern, cut it to your own cap.
    's17-tailor-pattern': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#FBF0F3" opacity=".7"/>` + ground(1000, '#F1E3E8', '#E4CFD7');
      // Hanging bunting.
      out += `<path d="M0,400 Q480,450 960,400 T1920,400" stroke="${C.muted}" stroke-width="3" fill="none"/>` + [...Array(16)].map((_, i) => { const x = 60 + i * 120, y = 400 + Math.sin(x / 1920 * Math.PI * 2) * 0 + 22 * Math.sin((x % 960) / 960 * Math.PI); return `<path d="M${x - 22},${f1(y)} L${x + 22},${f1(y)} L${x},${f1(y + 40 + Math.sin(t * 3 + i) * 4)} Z" fill="${[C.pink, C.teal, C.peach, C.purple][i % 4]}"/>`; }).join('');
      // Mannequin with Dayli's outfit.
      const mk = pop(t, T.shop, 0.7);
      const onMannequin = t < T.try || t > T.pattern;
      const gown = (x, y, sc, col, dk) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><path d="M-46,-230 L46,-230 L60,-150 L130,20 L-130,20 L-60,-150 Z" fill="${col}" stroke="${dk}" stroke-width="5"/><path d="M-60,-150 L60,-150" stroke="${dk}" stroke-width="5"/>${[-80, -30, 20, 70].map(xx => `<path d="M${xx},-100 L${xx * 1.3},16" stroke="${dk}" stroke-width="3" opacity=".4"/>`).join('')}</g>`;
      out += scaleAt(400, 1000, mk, `<rect x="392" y="700" width="16" height="280" fill="${C.muted}"/><ellipse cx="400" cy="990" rx="80" ry="14" fill="${C.muted}"/><ellipse cx="400" cy="540" rx="44" ry="20" fill="#E2D6CC"/><rect x="380" y="520" width="40" height="40" rx="10" fill="#E2D6CC"/>` + (onMannequin ? gown(400, 780, 1.2, C.purple, DK.purple) : ''));
      out += pill(400, 470, 'Dayli’s size', DK.purple, pop(t, T.shop + 0.6, 0.5), 24);
      out += pill(400, 640, '4 MNQ', C.purple, onMannequin ? pop(t, T.try - 0.4, 0.5) : 0, 24);
      out += pill(400, 700, '$240', C.pink, onMannequin ? pop(t, T.her240, 0.5) : 0, 24);
      // Student.
      const st = { x: 800, y: 1000, scale: 1.05, look: A.LOOKS.d, seed: 5, at: T.shop + 0.3, talk: ctx.talking && t > T.try && t < T.try + 2.5 };
      const wearing = t > T.try && t < T.pattern;
      const fitted = t > T.fit;
      if (fitted) st.look = Object.assign({}, A.LOOKS.d, { shirt: C.teal });
      out += who(t, st);
      if (wearing) {
        const wob = Math.sin(t * 3) * 5;
        out += rotAt(800, 1000, wob, gown(800, 990, 1.75, C.purple, DK.purple) + `<rect x="760" y="${1000 - 330 * 1.05}" width="0" height="0"/>`);
        out += pill(800, 1030, '4 MNQ · $240', C.purple, 1, 22);
      }
      if (fitted) out += scaleAt(800, 1000, pop(t, T.fit, 0.6), gown(800, 990, 1.05, C.teal, DK.teal));
      out += bub(860, 560, 'Way too big! 😅', between(t, T.try + 0.6, T.pattern - 0.2), { size: 28 });
      out += pill(800, 590, 'cap $60 → 1 MNQ', DK.teal, pop(t, T.fit + 0.6, 0.5), 26);
      if (fitted) out += sparkAt(800, 760, T.fit + 0.3, t, C.teal);
      // Cutting table with the pattern.
      const tk = pop(t, T.shop + 0.5, 0.7);
      out += scaleAt(1400, 1000, tk, `<rect x="1100" y="770" width="600" height="26" rx="8" fill="#B8835A"/><rect x="1130" y="796" width="20" height="204" fill="#9B6A45"/><rect x="1650" y="796" width="20" height="204" fill="#9B6A45"/>`);
      const pk = pop(t, T.pattern, 0.6);
      if (pk > 0) {
        out += scaleAt(1400, 770, pk, `<path d="M1130,770 L1670,770 L1640,740 L1160,740 Z" fill="#FFF6E0" stroke="#E2D6C0" stroke-width="3"/>`);
        // The three steps of the pattern.
        ['① stop in points', '② risk per contract', '③ size from YOUR cap'].forEach((lab, i) => {
          const k = pop(t, T.pattern + 0.6 + i * 1.3, 0.5);
          const y = 470 + i * 78;
          out += scaleAt(1400, y, k, `<rect x="1170" y="${y - 30}" width="460" height="60" rx="12" fill="#FFF6E0" stroke="${C.peach}" stroke-width="4" stroke-dasharray="10 6"/>${txt(1400, y + 10, lab, 26, DK.peach)}`);
        });
      }
      // Scissors snipping along the paper during the cut.
      const ck = seg(t, T.cut, T.cut + 2.4);
      if (ck > 0 && ck < 1) {
        const sx = lerp(1180, 1620, ck), op = Math.abs(Math.sin(t * 14)) * 22;
        out += `<line x1="1180" x2="${f1(sx)}" y1="752" y2="752" stroke="${C.muted}" stroke-width="3" stroke-dasharray="6 6"/><g transform="translate(${f1(sx)},740)"><path d="M0,0 L-50,${-op * 0.6}" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/><path d="M0,0 L-50,${op * 0.6}" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/><circle cx="-56" cy="${-op * 0.6}" r="10" fill="none" stroke="${C.pink}" stroke-width="5"/><circle cx="-56" cy="${op * 0.6}" r="10" fill="none" stroke="${C.pink}" stroke-width="5"/></g>`;
      }
      // Tailor.
      const tl = { x: 1500, y: 1000, scale: 1.05, look: A.LOOKS.c, flip: true, seed: 2, at: T.shop + 0.6, hat: 'beret', talk: ctx.talking && t > T.pattern && t < T.pattern + 4.5 };
      tl.frontArm = ck > 0 && ck < 1 ? aim(tl, lerp(1180, 1620, ck) - 30, 740) : t > T.pattern && t < T.cut ? aim(tl, 1400, 560) : undefined;
      out += who(t, tl);
      // Cat batting a spool of thread.
      const spx = 1790 + Math.sin(t * 1.3) * 40;
      out += `<g transform="translate(${f1(spx)},970) rotate(${f1(Math.sin(t * 1.3) * 120)})"><rect x="-24" y="-30" width="48" height="60" rx="6" fill="${C.pink}"/><rect x="-30" y="-34" width="60" height="10" rx="4" fill="#B8835A"/><rect x="-30" y="24" width="60" height="10" rx="4" fill="#B8835A"/></g>`;
      out += crit(t, 'cat', { x: 1700, y: 1000, scale: 0.6, seed: 3, at: T.shop + 1, hop: 4, hopH: 10 });
      out += pill(960, 1044, 'same method · account-sized exposure', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 23: Daily Loss Limits ================= */
  Object.assign(LIVE, {
    // An arcade cabinet with two tokens for the day (−2R). When they're gone, it's locked, even for a beautiful setup.
    's17-arcade-tokens': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#2C1810" opacity=".05"/>` + ground(1000, '#EDE6F4', '#DCD2E8');
      // Floor tiles.
      for (let x = 0; x < 1920; x += 120) out += `<rect x="${x}" y="1004" width="60" height="76" fill="#E3DAEE"/>`;
      // String lights.
      out += `<path d="M0,410 Q480,460 960,410 T1920,410" stroke="${C.muted}" stroke-width="3" fill="none"/>` + [...Array(20)].map((_, i) => { const x = 40 + i * 96, y = 410 + 22 * Math.sin((x % 960) / 960 * Math.PI); const on = (Math.floor(t * 3) + i) % 3 === 0; return `<circle cx="${x}" cy="${f1(y + 12)}" r="9" fill="${[C.pink, C.gold, C.teal][i % 3]}" opacity="${on ? 1 : 0.45}"/>`; }).join('');
      // Cabinet.
      const ck = pop(t, T.cab, 0.8);
      let cab = `<path d="M980,470 L1320,470 L1340,1000 L960,1000 Z" fill="${C.purple}"/><rect x="960" y="440" width="380" height="70" rx="14" fill="${C.pink}"/>${txt(1150, 488, 'TAKE TRADE', 34, '#fff', { ls: 3 })}
        <rect x="1006" y="530" width="288" height="200" rx="14" fill="${C.dark}"/>
        <path d="M990,750 L1310,750 L1330,800 L970,800 Z" fill="${DK.purple}"/><rect x="1060" y="730" width="12" height="30" fill="${C.muted}"/><circle cx="1066" cy="728" r="14" fill="${C.pink}"/>
        <circle cx="1190" cy="772" r="12" fill="${C.gold}"/><circle cx="1230" cy="772" r="12" fill="${C.teal}"/>
        <rect x="1110" y="840" width="80" height="70" rx="10" fill="${DK.purple}"/><rect x="1146" y="852" width="8" height="40" rx="4" fill="${C.dark}"/>${txt(1150, 936, 'TOKEN', 18, '#fff', { ls: 2 })}`;
      out += scaleAt(1150, 1000, ck, cab);
      // Screen content.
      if (ck >= 1) {
        const lost = (t > T.t1 + 0.8 ? 1 : 0) + (t > T.t2 + 0.8 ? 1 : 0), locked = t > T.lock;
        let sc = '';
        if (t > T.setup) {
          const fl = Math.floor(t * 3) % 2;
          [0.2, 0.32, 0.3, 0.45, 0.58, 0.55, 0.7].forEach((v, i) => sc += `<rect x="${1030 + i * 34}" y="${f1(700 - v * 200)}" width="22" height="${f1(40 + (i % 2) * 12)}" rx="3" fill="${i === 2 || i === 5 ? C.pink : C.teal}"/>`);
          sc += txt(1150, 568, 'BEAUTIFUL SETUP ✨', 26, fl ? C.gold : '#fff');
          sc += `<rect x="1006" y="640" width="288" height="56" fill="${C.dark}" opacity=".8"/>${txt(1150, 678, '🔒 LOCKED', 30, C.pinkL)}`;
        } else if (locked) sc = txt(1150, 610, '🔒', 60, '#fff') + txt(1150, 680, 'SESSION LOCKED', 30, C.pinkL);
        else if (lost) sc = txt(1150, 620, 'LOSS', 40, C.pink) + txt(1150, 680, '−' + lost + 'R', 48, '#fff');
        else sc = txt(1150, 640, 'INSERT TOKEN', 30, Math.floor(t * 2) % 2 ? C.gold : '#fff');
        out += sc;
        if (t > T.lock && t < T.lock + 1) out += sparkAt(1150, 620, T.lock, t, C.pink);
      }
      // Daily meter on the side.
      const mk = pop(t, T.cup - 0.6, 0.6);
      const lostN = (t > T.t1 + 0.8 ? 1 : 0) + (t > T.t2 + 0.8 ? 1 : 0);
      out += scaleAt(1420, 800, mk, `<rect x="1396" y="560" width="48" height="300" rx="24" fill="#fff" stroke="${C.pink}" stroke-width="5"/><rect x="1402" y="${f1(854 - lostN * 144)}" width="36" height="${f1(lostN * 144)}" rx="18" fill="${C.pink}"/>
        <line x1="1390" x2="1450" y1="710" y2="710" stroke="${C.pink}" stroke-width="3"/>${txt(1490, 716, '−1R', 22, DK.pink, { a: 'start' })}${txt(1490, 572, '−2R', 22, DK.pink, { a: 'start' })}`);
      out += pill(1420, 520, 'DAILY MAX −2R', C.pink, mk, 22);
      // Trader with the token cup.
      const left = 2 - (t > T.t1 ? 1 : 0) - (t > T.t2 ? 1 : 0);
      const tr = { x: 760, y: 1000, scale: 1.08, look: A.LOOKS.seller, seed: 3, at: T.cab + 0.3, flip: t > T.no + 1.2, talk: ctx.talking && t > T.no && t < T.no + 3 && false };
      const tossing = [T.t1, T.t2].some(x => t > x - 0.3 && t < x + 0.3);
      tr.frontArm = tossing ? { a1: -30, a2: -40 } : { a1: 50, a2: -20 };
      tr.hold = `<g><path d="M-26,-44 L26,-44 L20,10 L-20,10 Z" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${[...Array(left)].map((_, i) => `<ellipse cx="${-8 + i * 16}" cy="${-48 - i * 4}" rx="12" ry="6" fill="${C.gold}" stroke="#C98A1F" stroke-width="2"/>`).join('')}</g>`;
      out += who(t, tr);
      out += pill(760, 1040, `tokens left: ${left}`, C.gold, pop(t, T.cup, 0.5), 24, C.dark);
      // Flying tokens.
      [T.t1, T.t2].forEach(at => {
        const k = seg(t, at, at + 0.8);
        if (k > 0 && k < 1) out += `<g transform="translate(${f1(lerp(840, 1150, k))},${f1(lerp(780, 860, k) - Math.sin(k * Math.PI) * 220)})"><ellipse rx="22" ry="22" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>${txt(0, 8, '1R', 18, '#fff')}</g>`;
      });
      out += bub(820, 560, 'Done for today. 😌', between(t, T.no, s.end), { size: 28 });
      // Revenge gremlin and a robot attendant.
      const gk = t > T.gremlin;
      out += bst(t, 'gremlin', { x: 1560, y: 1000, scale: 1.1, seed: 2, at: T.gremlin, hop: 7, hopH: 30, talk: gk && t < T.no + 1, tag: 'revenge you' });
      out += bub(1640, 700, 'Just one more! 😈', between(t, T.gremlin + 0.4, T.no + 1.6), { size: 28, tail: 'right' });
      out += crit(t, 'robot', { x: 1790, y: 1000, scale: 0.95, seed: 4, at: T.cab + 1, screen: t > T.lock ? '🔒' : '2R', talk: ctx.talking && t > T.no + 2 });
      out += pill(1150, 1044, 'valid setup ≠ override', DK.purple, pop(t, T.no + 0.6, 0.6), 24);
      return out;
    },

    // Decide the daily risk card in the calm morning; when it's hit, Take Trade switches off and learn mode lights up.
    's17-night-desk': (s, t, ctx) => {
      const T = s.beats;
      const dusk = seg(t, T.lock, T.knock);
      let out = `<rect x="0" y="380" width="1920" height="620" fill="${dusk > 0.5 ? '#EDE7F5' : '#F8F1EA'}"/>` + ground(1000, '#E7D8CB', '#D6C4B4');
      // Window with sky going from day to night.
      const sky = dusk < 0.5 ? '#CFEFF0' : '#3D3550';
      out += `<rect x="130" y="430" width="300" height="270" rx="12" fill="#fff"/><rect x="146" y="446" width="268" height="238" rx="6" fill="${sky}"/>`;
      if (dusk < 0.5) out += `<circle cx="${f1(220 + dusk * 200)}" cy="${f1(500 + dusk * 300)}" r="30" fill="${C.gold}"/>` + cloud(330, 520, 0.4);
      else out += `<circle cx="${f1(330 - (dusk - 0.5) * 120)}" cy="510" r="26" fill="#FFF3C4"/><circle cx="${f1(342 - (dusk - 0.5) * 120)}" cy="502" r="22" fill="#3D3550"/>` + [[180, 480], [250, 600], [380, 640], [200, 650]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${3 + Math.abs(Math.sin(t * 3 + i))}" fill="#fff"/>`).join('');
      out += `<rect x="276" y="446" width="8" height="238" fill="#fff"/><rect x="146" y="561" width="268" height="8" fill="#fff"/>`;
      // Person behind the desk.
      const writing = t > T.card - 1 && t < T.card + 0.2;
      const pr = { x: 620, y: 1000, scale: 1.05, look: A.LOOKS.b, seed: 2, at: T.room, talk: ctx.talking && (t < T.card || (t > T.knock + 1.6 && t < T.knock + 3.6)) };
      pr.frontArm = writing ? { a1: 60 + Math.sin(t * 12) * 6, a2: 0 } : t > T.knock + 1.6 && t < T.knock + 4 ? { a1: -60, a2: -100 } : undefined;
      out += who(t, pr);
      // Desk with laptop and a sleeping cat.
      const dk = pop(t, T.room + 0.2, 0.7);
      const tradeOn = t < T.lock;
      out += scaleAt(600, 1000, dk, `<rect x="300" y="800" width="620" height="28" rx="8" fill="#B8835A"/><rect x="320" y="828" width="24" height="172" fill="#9B6A45"/><rect x="876" y="828" width="24" height="172" fill="#9B6A45"/>
        <rect x="660" y="700" width="200" height="100" rx="10" fill="${C.dark}"/><rect x="672" y="712" width="176" height="76" rx="6" fill="${tradeOn ? '#E8F8F6' : '#EFEAF4'}"/><rect x="640" y="796" width="240" height="10" rx="4" fill="${C.muted}"/>
        <rect x="700" y="732" width="120" height="36" rx="18" fill="${tradeOn ? C.teal : '#C9B9AE'}"/>${txt(760, 757, tradeOn ? 'TAKE TRADE' : 'OFF', 16, '#fff')}`);
      out += crit(t, 'cat', { x: 420, y: 800, scale: 0.55, seed: 4, at: T.room + 0.8, sleep: t < T.knock || t > T.knock + 2 });
      // The daily risk card: written on the desk, then pinned on the door.
      const door = pop(t, T.room + 0.4, 0.7);
      const shake = t > T.knock && t < T.knock + 1.6 ? Math.sin(t * 40) * 5 : 0;
      out += scaleAt(1630, 1000, door, `<g transform="translate(${f1(shake)},0)"><rect x="1480" y="470" width="300" height="530" rx="10" fill="#B8835A" stroke="#9B6A45" stroke-width="8"/><rect x="1550" y="492" width="160" height="82" rx="8" fill="${dusk > 0.5 ? '#3D3550' : '#CFEFF0'}"/><circle cx="1740" cy="780" r="12" fill="${C.gold}"/></g>`);
      const fk = ease(seg(t, T.card, T.card + 1));
      const cx = lerp(560, 1630, fk), cy = lerp(780, 730, fk) - Math.sin(fk * Math.PI) * 160, cs = lerp(0.35, 1, fk);
      if (t > T.card - 1.2) {
        let card = `<rect x="-110" y="-150" width="220" height="300" rx="12" fill="#fff" stroke="${C.purple}" stroke-width="5"/>${txt(0, -110, 'DAILY RISK', 22, DK.purple, { ls: 2 })}`;
        [['$', '−$240'], ['R', '−2R'], ['✗', '2 losses'], ['#', '3 trades']].forEach(([ic, lab], i) => {
          const k = pop(t, T.rows[i], 0.4);
          if (k > 0) card += `<g opacity="${clamp(k)}"><circle cx="-70" cy="${-58 + i * 56}" r="18" fill="${[C.cash, C.purple, C.pink, C.peach][i]}"/>${txt(-70, -51 + i * 56, ic, 18, '#fff')}${txt(-40, -49 + i * 56, lab, 26, C.text, { a: 'start', w: 800 })}</g>`;
        });
        out += `<g transform="translate(${f1(cx + (fk >= 1 ? shake : 0))},${f1(cy)}) scale(${f1(cs)}) rotate(${f1((1 - fk) * -6 + (fk >= 1 ? 2 : 0))})">${card}</g>`;
      }
      out += stamp(1630 + shake, 930, 'LOCKED', C.pink, ease(seg(t, T.lock, T.lock + 0.3)), -12, 60, 24);
      // Switch panel.
      const sk = pop(t, T.room + 0.6, 0.6), sw = ease(seg(t, T.lock, T.lock + 0.3));
      out += scaleAt(1160, 490, sk, `<rect x="990" y="440" width="340" height="100" rx="16" fill="#fff" stroke="#E2D6CC" stroke-width="4"/><rect x="1020" y="462" width="56" height="56" rx="10" fill="#F1E7E1"/><rect x="1032" y="${f1(lerp(468, 492, sw))}" width="32" height="20" rx="6" fill="${sw > 0.5 ? C.pink : C.teal}"/>${txt(1100, 500, 'TAKE TRADE', 26, C.text, { a: 'start' })}`);
      // Learn-mode lamps.
      ['REVIEW', 'JOURNAL', 'REPLAY', 'STUDY'].forEach((lab, i) => {
        const on = t > T.lamps[i], x = 1030 + i * 96;
        const k = pop(t, T.room + 0.8 + i * 0.1, 0.5);
        out += scaleAt(x, 640, k, `<line x1="${x}" y1="560" x2="${x}" y2="610" stroke="${C.muted}" stroke-width="3"/>${on ? `<circle cx="${x}" cy="636" r="${40 + Math.sin(t * 4 + i) * 4}" fill="${C.gold}" opacity=".25"/>` : ''}<circle cx="${x}" cy="636" r="24" fill="${on ? '#FFE9A8' : '#EDE6E0'}" stroke="${on ? C.gold : '#D9CFC8'}" stroke-width="4"/><rect x="${x - 10}" y="604" width="20" height="10" fill="${C.muted}"/>`);
        out += pill(x, 700, lab, on ? DK.teal : '#C9B9AE', k, 16);
      });
      out += pill(1174, 760, 'learn mode: ON', DK.teal, pop(t, T.lamps[3] + 0.4, 0.5), 24);
      // The revenge-trading you, at the door.
      if (t > T.knock) {
        const pk = ease(seg(t, T.knock, T.knock + 0.6));
        out += `<g transform="translate(${1630 + shake},${f1(580 - 40 * pk)})"><clipPath id="s17win"><rect x="-70" y="-80" width="140" height="80"/></clipPath><g clip-path="url(#s17win)"><circle cx="0" cy="${f1(40 - pk * 30)}" r="36" fill="#E8B48C"/><path d="M-36,${f1(26 - pk * 30)} C-40,${f1(-20 - pk * 30)} 40,${f1(-20 - pk * 30)} 36,${f1(26 - pk * 30)} C20,${f1(4 - pk * 30)} -20,${f1(4 - pk * 30)} -36,${f1(26 - pk * 30)} Z" fill="#C27A3A"/><path d="M-20,${f1(28 - pk * 30)} L-6,${f1(34 - pk * 30)} M20,${f1(28 - pk * 30)} L6,${f1(34 - pk * 30)}" stroke="${C.dark}" stroke-width="4"/><circle cx="-12" cy="${f1(42 - pk * 30)}" r="4" fill="${C.dark}"/><circle cx="12" cy="${f1(42 - pk * 30)}" r="4" fill="${C.dark}"/><ellipse cx="0" cy="${f1(56 - pk * 30)}" rx="8" ry="${f1(3 + Math.abs(Math.sin(t * 10)) * 4)}" fill="#6B2A2A"/></g></g>`;
        if (t < T.knock + 1.6) out += txt(1440, 520 + Math.sin(t * 20) * 3, 'KNOCK KNOCK', 22, DK.pink, { a: 'end', ls: 2 });
      }
      out += bub(1560, 440, 'Just one more trade! 😤', between(t, T.knock + 0.6, T.knock + 3.4), { size: 26, tail: 'right' });
      out += bub(700, 560, 'Already decided. 😌', between(t, T.knock + 1.8, s.end), { size: 28 });
      return out;
    },
  });

  /* ================= Lesson 24: Maximum Trades & Frequency Risk ================= */
  Object.assign(LIVE, {
    // A waiter stacks plates: each trade adds one more −$100 plate. Exposure = risk × trades.
    's17-plate-stack': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#FDF3E7" opacity=".6"/>` + ground(1000, '#F1E1CF', '#E2CDB6');
      // Checkerboard floor strip.
      for (let x = 0; x < 1920; x += 60) out += `<rect x="${x}" y="1004" width="30" height="38" fill="${(x / 60) % 2 ? '#E8D3BE' : '#F7EADC'}"/><rect x="${x + 30}" y="1042" width="30" height="38" fill="${(x / 60) % 2 ? '#E8D3BE' : '#F7EADC'}"/>`;
      // Counter with a cat.
      out += scaleAt(330, 1000, pop(t, T.diner, 0.7), `<rect x="120" y="840" width="440" height="160" rx="10" fill="${C.pinkL}"/><rect x="104" y="820" width="472" height="26" rx="8" fill="${C.pink}"/><rect x="160" y="880" width="360" height="10" rx="5" fill="#fff" opacity=".5"/>`);
      out += crit(t, 'cat', { x: 470, y: 822, scale: 0.6, seed: 3, at: T.diner + 0.5, flip: true });
      // Menu board tally.
      const n = T.plates.filter(x => t > x).length;
      const bk = pop(t, T.diner + 0.4, 0.7);
      out += scaleAt(340, 540, bk, `<rect x="140" y="430" width="400" height="230" rx="16" fill="${C.dark}"/><rect x="156" y="446" width="368" height="198" rx="10" fill="#3B4A44"/>
        ${txt(340, 492, 'TODAY', 26, C.gold, { ls: 4 })}${txt(180, 552, 'TRADES', 26, '#E8F8F6', { a: 'start' })}${txt(500, 554, n, 40, '#fff', { a: 'end' })}
        ${txt(180, 618, 'DAY', 26, '#E8F8F6', { a: 'start' })}${txt(500, 622, n ? '−' + money(n * 100) : '$0', 44, n >= 6 ? C.pinkL : '#fff', { a: 'end' })}`);
      if (n >= 6) out += sparkAt(400, 600, T.six, t, C.pink);
      // Waiter with the tray.
      const wt = { x: 860, y: 1000, scale: 1.25, look: A.LOOKS.c, seed: 2, at: T.diner + 0.2, talk: ctx.talking && t > T.formula && t < T.formula + 3, mood: n >= 6 && t < T.formula ? 'sad' : undefined };
      const hx = 985, hy = 662;
      wt.frontArm = aim(wt, hx, hy);
      out += who(t, wt);
      const swayAmp = 1 + n * 1.4 + (n >= 6 ? 3 : 0);
      const sway = Math.sin(t * 3.2) * swayAmp;
      const px = hx + 60;
      let stack = `<rect x="${px - 110}" y="${hy - 14}" width="220" height="14" rx="7" fill="${C.muted}"/>`;
      T.plates.forEach((at, i) => {
        const k = ease(seg(t, at, at + 0.5));
        if (k <= 0) return;
        const y = hy - 30 - i * 34 - (1 - k) * 160;
        stack += `<g opacity="${k}"><ellipse cx="${px}" cy="${y + 10}" rx="96" ry="18" fill="#fff" stroke="#E2D6CC" stroke-width="4"/><rect x="${px - 96}" y="${y - 6}" width="192" height="16" fill="#fff"/><ellipse cx="${px}" cy="${y - 6}" rx="96" ry="18" fill="#fff" stroke="#E2D6CC" stroke-width="4"/><ellipse cx="${px}" cy="${y - 6}" rx="60" ry="10" fill="${C.pinkP}"/>${txt(px, y + 1, '−$100', 20, DK.pink)}</g>`;
      });
      out += rotAt(hx, hy, sway, stack);
      if (n >= 6) [0, 1].forEach(i => { const p = (t * 1.2 + i / 2) % 1; out += `<path d="M${830 + i * 70},${f1(660 + p * 40)} q6,10 0,16 q-6,-6 0,-16" fill="${C.tealL}" opacity="${1 - p}"/>`; });
      // Customer at a table, mouse under it.
      out += scaleAt(1400, 1000, pop(t, T.diner + 0.6, 0.6), `<rect x="1290" y="820" width="240" height="20" rx="8" fill="#B8835A"/><rect x="1400" y="840" width="20" height="160" fill="#9B6A45"/><ellipse cx="1410" cy="996" rx="60" ry="8" fill="#9B6A45"/>
        <path d="M1320,800 q0,-30 30,-30 l20,0 q0,30 -30,30 Z" fill="${C.teal}"/><rect x="1446" y="780" width="36" height="40" rx="6" fill="#fff" stroke="#E2D6CC" stroke-width="3"/>`);
      out += who(t, { x: 1600, y: 1000, scale: 1, look: A.LOOKS.a, flip: true, seed: 6, at: T.diner + 0.8, talk: ctx.talking && t < T.plates[0] - 2 });
      out += bub(1540, 600, 'I only risk $100 per trade! 😇', between(t, T.diner + 0.6, T.plates[0] - 0.4), { size: 26, tail: 'right' });
      out += bub(1530, 600, 'Wait, that’s −$600? 😳', between(t, T.six, T.formula + 2), { size: 26, tail: 'right' });
      out += crit(t, 'mouse', { x: 1300 + Math.sin(t * 0.9) * 40, y: 1000, scale: 0.75, seed: 4, at: T.diner + 1.2, flip: Math.cos(t * 0.9) < 0 });
      out += pill(940, 1044, 'exposure = risk per trade × trades', C.purple, pop(t, T.formula, 0.6), 26);
      out += pill(1500, 470, '1% × 10 trades = up to 10%', C.pink, pop(t, T.pct, 0.6), 28);
      return out;
    },

    // A fairground ride pass with three punches. Each ride brings friends (costs); a full card means the day is done.
    's17-punch-card': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#EAF6F4" opacity=".6"/>` + ground(1000, '#E8EFE3', '#D3DECB');
      // Roller coaster track on the right.
      const trackY = u => 780 - 260 * Math.sin(u * Math.PI) + 70 * Math.sin(u * Math.PI * 3);
      const X = u => 1060 + u * 820;
      let pts = '';
      for (let i = 0; i <= 60; i++) pts += (i ? ' L' : 'M') + f1(X(i / 60)) + ',' + f1(trackY(i / 60));
      const tk = pop(t, T.booth + 0.4, 0.8);
      let tr = '';
      for (let i = 1; i < 12; i++) { const u = i / 12; tr += `<line x1="${f1(X(u))}" y1="${f1(trackY(u))}" x2="${f1(X(u))}" y2="1000" stroke="#C9B9AE" stroke-width="8"/>`; }
      tr += `<path d="${pts}" stroke="${C.pink}" stroke-width="12" fill="none"/><path d="${pts}" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="10 10"/>`;
      out += scaleAt(1470, 1000, tk, tr);
      // Cart rides after each punch.
      [...T.punches].forEach(at => {
        const k = seg(t, at + 0.4, at + 2.2);
        if (k <= 0 || k >= 1) return;
        const u = ease(k), x = X(u), y = trackY(u), a = Math.atan2(trackY(u + 0.01) - y, X(u + 0.01) - x) * 180 / Math.PI;
        out += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(a)})"><rect x="-46" y="-46" width="92" height="40" rx="10" fill="${C.purple}"/><circle cx="-26" cy="-4" r="9" fill="${C.dark}"/><circle cx="26" cy="-4" r="9" fill="${C.dark}"/><circle cx="0" cy="-58" r="14" fill="#F1C7A5"/><path d="M-12,-62 L-20,-80 M12,-62 L20,-80" stroke="#F1C7A5" stroke-width="6" stroke-linecap="round"/></g>`;
      });
      // Ticket booth.
      out += scaleAt(330, 1000, pop(t, T.booth, 0.7), `<rect x="180" y="560" width="300" height="440" rx="10" fill="${C.peachL}"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${160 + i * 68},500 L${228 + i * 68},500 L${228 + i * 68},560 Q${194 + i * 68},590 ${160 + i * 68},560 Z" fill="${i % 2 ? '#fff' : C.peach}"/>`).join('')}<rect x="150" y="470" width="360" height="36" rx="10" fill="${DK.peach}"/>${txt(330, 498, 'RIDE PASS', 24, '#fff', { ls: 3 })}<rect x="220" y="620" width="220" height="150" rx="10" fill="#fff" opacity=".7"/>`);
      // The pass card (big).
      const ck = pop(t, T.card, 0.7);
      const full = t > T.punches[2];
      out += scaleAt(780, 480, ck, `<rect x="560" y="420" width="440" height="130" rx="18" fill="#fff" stroke="${C.purple}" stroke-width="5"/>${txt(700, 478, 'MAX', 22, DK.purple, { ls: 2 })}${txt(700, 520, 'TRADES', 22, DK.purple, { ls: 2 })}`);
      T.punches.forEach((at, i) => {
        const x = 820 + i * 70, punched = t > at;
        if (ck > 0) out += scaleAt(780, 480, ck, `<circle cx="${x}" cy="486" r="24" fill="${punched ? C.dark : '#fff'}" stroke="${C.purple}" stroke-width="4" ${punched ? '' : 'stroke-dasharray="6 5"'}/>${punched ? '' : txt(x, 495, i + 1, 22, C.purpleL)}`);
        if (punched) out += sparkAt(x, 486, at, t, [C.pink, C.teal, C.gold][i]);
      });
      out += stamp(890, 486, 'DAY DONE', C.pink, ease(seg(t, T.done, T.done + 0.3)), -10, 74, 22);
      // Conductor with a hole punch, rider with the card.
      const cn = { x: 560, y: 1000, scale: 1.05, look: A.LOOKS.c, seed: 2, at: T.booth + 0.3, hat: 'cap', talk: ctx.talking && t > T.fourth && t < T.done + 1 };
      const clip = T.punches.some(x => t > x - 0.3 && t < x + 0.2);
      cn.frontArm = clip ? { a1: -20, a2: -60 } : { a1: 20, a2: -40 };
      cn.hold = `<g><rect x="-6" y="-30" width="12" height="40" rx="6" fill="${C.muted}"/><path d="M-20,-30 L20,-30 L14,-46 L-14,-46 Z" fill="${C.purple}"/></g>`;
      out += who(t, cn);
      const rd = { x: 830, y: 1000, scale: 1.05, look: A.LOOKS.seller, flip: true, seed: 5, at: T.booth + 0.5, talk: false };
      rd.frontArm = t > T.fourth - 0.2 && t < T.done + 0.6 ? aim(rd, 680, 740) : { a1: 120, a2: 150 };
      rd.hold = `<g transform="rotate(-10)"><rect x="-30" y="-20" width="60" height="36" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="3"/></g>`;
      out += who(t, rd);
      out += bub(900, 640, 'One more ride? 🥺', between(t, T.fourth, T.done + 0.6), { size: 28 });
      out += bub(560, 620, 'Card’s full. Day’s done.', between(t, T.done, s.end), { size: 26 });
      // Friends that tag along: costs.
      [['commission', C.pink], ['slippage', C.purple], ['exposure', C.peach], ['deviation', C.teal]].forEach(([lab, col], i) => {
        out += bst(t, 'gremlin', { x: 1180 + i * 170, y: 1000, scale: 0.7, seed: i + 2, col, at: T.friends[i], hop: 6 + i, hopH: 24, tag: lab });
      });
      out += pill(1440, 640, 'more trades can mean more…', DK.purple, pop(t, T.friends[0] + 0.3, 0.5), 24);
      return out;
    },
  });

  /* ================= Lesson 25: Drawdown, Losing Streaks & Survival ================= */
  Object.assign(LIVE, {
    // A climber at the summit ($10,000) descends to a ledge ($9,400). Drawdown is measured from the peak.
    's17-summit-rope': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#EAF4F8" opacity=".7"/>` + cloud(lerp(1500, 1300, (t % 40) / 40), 470, 0.8) + cloud(lerp(260, 420, (t % 40) / 40), 520, 0.6);
      const PX = 760, PY = 600, LX = 1120, LY = 820;
      const mk = pop(t, T.mtn, 0.9);
      out += scaleAt(960, 1000, mk, `<path d="M120,1000 L${PX},${PY} L${LX},${LY} L1260,${LY} L1820,1000 Z" fill="#B9AED6"/><path d="M${PX},${PY} L${PX + 70},${PY + 60} L${PX + 30},${PY + 50} L${PX},${PY + 76} L${PX - 40},${PY + 46} L${PX - 80},${PY + 66} Z" fill="#fff"/>
        <path d="M${LX},${LY} L1260,${LY} L1250,${LY + 18} L${LX + 10},${LY + 18} Z" fill="${DK.purple}"/><path d="M400,1000 L700,760 L900,1000 Z" fill="${C.purpleL}" opacity=".6"/>`);
      out += ground(1000, '#E6E1F0', '#D6CFE6');
      // Peak flag.
      const fk = pop(t, T.peak, 0.6);
      const wave = Math.sin(t * 5) * 6;
      out += scaleAt(PX, PY, fk, `<rect x="${PX + 30}" y="${PY - 120}" width="6" height="120" fill="${C.dark}"/><path d="M${PX + 36},${PY - 120} Q${PX + 70},${PY - 110 + wave} ${PX + 100},${PY - 116} L${PX + 100},${PY - 80} Q${PX + 70},${PY - 74 + wave} ${PX + 36},${PY - 84} Z" fill="${C.pink}"/>`);
      out += pill(PX - 210, PY - 60, 'PEAK $10,000', DK.purple, fk, 28);
      out += pill(LX + 70, LY + 60, 'NOW $9,400', C.pink, pop(t, T.desc + 2.4, 0.6), 28);
      // Climber: at the peak, then walks down to the ledge.
      const dk = ease(seg(t, T.desc, T.desc + 2.4));
      const cx = lerp(PX, LX + 70, dk), cy = dk < 0.85 ? lerp(PY, LY, dk / 0.85) : LY;
      const cl = { x: cx, y: cy, scale: 0.72, look: A.LOOKS.d, seed: 3, at: T.peak + 0.2, hat: 'hard', walking: dk > 0 && dk < 1, flip: false };
      if (t > T.peak + 0.6 && t < T.desc) cl.frontArm = { a1: -110 + Math.sin(t * 8) * 10, a2: -100 };
      out += who(t, cl);
      // Rope / measurement from the peak.
      const rk = ease(seg(t, T.rope, T.rope + 0.8)), vk = ease(seg(t, T.rope + 0.6, T.rope + 1.4));
      if (rk > 0) out += `<line x1="${PX}" x2="${f1(lerp(PX, 1420, rk))}" y1="${PY}" y2="${PY}" stroke="${DK.purple}" stroke-width="5" stroke-dasharray="14 10"/>`;
      if (vk > 0) out += `<line x1="1400" x2="1400" y1="${PY}" y2="${f1(lerp(PY, LY, vk))}" stroke="${C.pink}" stroke-width="8" stroke-linecap="round"/>${vk >= 1 ? `<path d="M1384,${LY - 18} L1400,${LY} L1416,${LY - 18}" fill="none" stroke="${C.pink}" stroke-width="8" stroke-linecap="round"/>` : ''}<line x1="1260" x2="1420" y1="${LY}" y2="${LY}" stroke="${DK.purple}" stroke-width="5" stroke-dasharray="14 10" opacity="${vk}"/>`;
      out += pill(1620, (PY + LY) / 2 - 42, 'DRAWDOWN', C.pink, pop(t, T.rope + 1.2, 0.5), 26);
      out += pill(1620, (PY + LY) / 2 + 30, '$600 · 6%', DK.pink, pop(t, T.rope + 1.6, 0.5), 34);
      if (t > T.rope + 1.6) out += sparkAt(1620, (PY + LY) / 2, T.rope + 1.6, t, C.pink);
      out += pill(1620, (PY + LY) / 2 + 100, '(peak − now) ÷ peak', DK.purple, pop(t, T.wrong + 2.4, 0.5), 24);
      // Goat with the wrong idea.
      out += bst(t, 'goat', { x: 380, y: 1000, scale: 0.85, seed: 2, at: T.mtn + 1, hop: t > T.wrong && t < T.wrong + 1 ? 8 : 0, hopH: 16 });
      const wk = pop(t, T.wrong, 0.6);
      if (wk > 0) {
        out += scaleAt(250, 860, wk, `<rect x="244" y="760" width="10" height="240" fill="#9B6A45"/><rect x="120" y="700" width="260" height="90" rx="12" fill="#fff" stroke="${C.muted}" stroke-width="4"/>${txt(250, 736, 'from the', 22, C.muted, { w: 700 })}${txt(250, 770, 'START?', 30, C.muted)}`);
        out += cross(370, 708, pop(t, T.wrong + 1, 0.4), C.pink, 24);
      }
      // Eagle circling.
      out += crit(t, 'bird', { x: 1240 + Math.cos(t * 0.9) * 220, y: 470 + Math.sin(t * 0.9) * 40, scale: 1.1, col: '#B8835A', seed: 6, fly: true, flip: Math.sin(t * 0.9) > 0, at: T.mtn + 1.5 });
      out += bub(LX - 40, 560, 'How deep can it get? 🤔', between(t, T.more, s.end), { size: 28 });
      return out;
    },

    // Five waves (losses) hit two rafts: 1% per trade bobs along, 10% per trade is nearly swamped.
    's17-raft-waves': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="400" fill="#E6F4F6" opacity=".8"/>` + cloud(lerp(300, 500, (t % 40) / 40), 470, 0.7) + cloud(lerp(1600, 1400, (t % 40) / 40), 440, 0.8);
      // Sea.
      const SEA = 800;
      let sea = `M0,${SEA}`;
      for (let x = 0; x <= 1920; x += 40) sea += ` L${x},${f1(SEA + Math.sin(x / 90 + t * 2) * 8)}`;
      out += `<path d="${sea} L1920,1080 L0,1080 Z" fill="${C.tealL}"/>`;
      // Wave crests (losses) rolling right.
      const WD = 2.4;
      const crestX = at => lerp(-200, 2120, seg(t, at, at + WD));
      const hitBy = x => T.waves.filter(at => t > at + (x + 200) / 2320 * WD).length;
      T.waves.forEach((at, i) => {
        const k = seg(t, at, at + WD);
        if (k <= 0 || k >= 1) return;
        const x = crestX(at);
        out += `<path d="M${f1(x - 160)},${SEA + 10} Q${f1(x - 60)},${SEA - 10} ${f1(x - 20)},${SEA - 90} Q${f1(x + 30)},${SEA - 130} ${f1(x + 70)},${SEA - 90} Q${f1(x + 40)},${SEA - 80} ${f1(x + 50)},${SEA - 60} Q${f1(x + 90)},${SEA - 10} ${f1(x + 180)},${SEA + 10} Z" fill="${C.teal}"/>${txt(x + 10, SEA - 34, 'L', 34, '#fff')}`;
      });
      // Rafts.
      const rafts = [{ x: 540, r: 0.01, lab: '1% per trade', look: A.LOOKS.d, col: DK.teal, seed: 2 }, { x: 1380, r: 0.1, lab: '10% per trade', look: A.LOOKS.b, col: DK.pink, seed: 5 }];
      rafts.forEach((R, i) => {
        const k = pop(t, T.rafts + i * 0.4, 0.7);
        if (k <= 0) return;
        const n = hitBy(R.x), dd = 1 - Math.pow(1 - R.r, n);
        const lastHit = T.waves.map(at => at + (R.x + 200) / 2320 * WD).filter(h => t > h).pop();
        const jolt = lastHit != null ? Math.sin(Math.min(1, (t - lastHit) / 0.6) * Math.PI) * -26 : 0;
        const sink = dd * 220, bob = Math.sin(t * 2 + i) * 5 + jolt;
        const y = SEA - 10 + sink + bob, tilt = Math.sin(t * 1.6 + i) * (3 + dd * 10);
        const sailor = { x: R.x - 30, y: y - 20, scale: 0.75, look: R.look, seed: R.seed, flip: i === 1 };
        if (i === 1 && n > 1) sailor.frontArm = { a1: 20 + Math.sin(t * 6) * 40, a2: -30 + Math.sin(t * 6) * 40 };
        if (i === 1 && n > 1) sailor.hold = `<path d="M-14,-10 L14,-10 L10,14 L-10,14 Z" fill="${C.muted}"/>`;
        let g = `<rect x="${R.x + 60}" y="${y - 220}" width="8" height="200" fill="#9B6A45"/><path d="M${R.x + 68},${y - 214} L${R.x + 190},${y - 170} L${R.x + 68},${y - 120} Z" fill="#fff" stroke="#E2D6CC" stroke-width="3"/>`
          + A.person(t, sailor)
          + `<rect x="${R.x - 150}" y="${y - 22}" width="300" height="34" rx="10" fill="#B8835A"/>${[0, 1, 2, 3, 4].map(j => `<line x1="${R.x - 150 + j * 60 + 30}" y1="${y - 22}" x2="${R.x - 150 + j * 60 + 30}" y2="${y + 12}" stroke="#9B6A45" stroke-width="3"/>`).join('')}`;
        out += scaleAt(R.x, y, k, rotAt(R.x, y, tilt, g));
        // Water over the raft deck for the deep one.
        out += `<rect x="0" y="${SEA + 6}" width="0" height="0"/>`;
        out += pill(R.x, 470, R.lab, R.col, k, 26);
        if (n > 0) out += pill(R.x, 540, `≈ −${(dd * 100).toFixed(dd < 0.1 ? 1 : 0)}%`, i ? C.pink : C.teal, 1, i ? 30 + Math.min(1, n / 5) * 10 : 30);
        if (i === 1 && n > 1) for (let j = 0; j < 4; j++) { const p = (t * 1.6 + j / 4) % 1; out += `<circle cx="${f1(R.x + 40 + p * 90)}" cy="${f1(y - 120 + p * p * 140 - Math.sin(p * Math.PI) * 60)}" r="6" fill="${C.teal}" opacity="${1 - p}"/>`; }
      });
      // Foreground water to half-hide sunk rafts.
      let fg = `M0,${SEA + 26}`;
      for (let x = 0; x <= 1920; x += 40) fg += ` L${x},${f1(SEA + 26 + Math.sin(x / 70 - t * 2.4) * 10)}`;
      out += `<path d="${fg} L1920,1080 L0,1080 Z" fill="${C.teal}" opacity=".55"/>`;
      // Seagull and a jumping fish.
      out += crit(t, 'bird', { x: 960 + Math.sin(t * 0.7) * 300, y: 440 + Math.sin(t * 1.9) * 20, scale: 0.9, col: '#fff', seed: 3, fly: true, flip: Math.cos(t * 0.7) < 0, at: T.sea + 0.6 });
      const fp = ((t - T.sea) % 3.2) / 1.2;
      if (t > T.sea + 1 && fp < 1) out += rotAt(960 + fp * 160, SEA + 20 - Math.sin(fp * Math.PI) * 140, -60 + fp * 120, beast(t, 'fish', { x: 960 + fp * 160, y: SEA + 20 - Math.sin(fp * Math.PI) * 140, scale: 0.8, seed: 2, hop: 0 }));
      out += pill(960, 1044, 'same streak · different damage · ≈ before costs', C.purple, pop(t, T.punch, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 26: Prop-Firm Risk vs Personal Capital ================= */
  Object.assign(LIVE, {
    // Same trip (chart), two suitcases (accounts): one with plenty of room, one that shows $50,000 but has $300 of room.
    's17-two-suitcases': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3EDF6', '#E3D9EA');
      // Postcard chart: same for both.
      const pk = pop(t, T.chart, 0.7);
      let pc = `<rect x="740" y="400" width="440" height="190" rx="16" fill="#fff" stroke="#E2D6CC" stroke-width="4"/><line x1="770" x2="1150" y1="470" y2="470" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 8"/>`;
      [[.3, .5], [.5, .4], [.4, .7], [.7, .62], [.62, .45], [.45, .58], [.58, .8], [.8, .72]].forEach(([o, c], i) => {
        const y = v => 570 - v * 140, up = c > o;
        pc += `<rect x="${786 + i * 34}" y="${f1(y(Math.max(o, c)))}" width="20" height="${f1(Math.abs(y(o) - y(c)))}" rx="3" fill="${up ? C.teal : C.pink}"/>`;
      });
      pc += `<line x1="1110" x2="1110" y1="470" y2="560" stroke="${C.pink}" stroke-width="4"/>`;
      out += scaleAt(960, 495, pk, rotAt(960, 495, Math.sin(t * 1.2) * 1.5, pc));
      out += pill(960, 630, 'same PIL · same ICC · 30-pt stop', DK.purple, pop(t, T.chart + 0.8, 0.5), 22);
      out += crit(t, 'bird', { x: 1150, y: 402, scale: 0.7, seed: 2, col: '#C9C3D9', at: T.chart + 1 });
      // Suitcases.
      const suit = (x, col, dk, lab, roomW, k, sticker) => k <= 0 ? '' : scaleAt(x, 980, k, `<rect x="${x - 50}" y="680" width="100" height="30" rx="12" fill="none" stroke="${dk}" stroke-width="10"/>
        <rect x="${x - 220}" y="700" width="440" height="280" rx="28" fill="${col}" stroke="${dk}" stroke-width="6"/>${txt(x, 750, lab, 26, '#fff', { ls: 2 })}
        <rect x="${x - 190}" y="780" width="380" height="120" rx="14" fill="#fff" opacity=".35"/>
        <rect x="${x - 190}" y="780" width="${roomW}" height="120" rx="14" fill="#fff" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>
        ${sticker || ''}<circle cx="${x - 150}" cy="990" r="12" fill="${C.dark}"/><circle cx="${x + 150}" cy="990" r="12" fill="${C.dark}"/>`);
      const ak = pop(t, T.A, 0.7), bk = pop(t, T.B, 0.7);
      out += suit(520, C.teal, DK.teal, 'A · PERSONAL', 380, ak);
      out += suit(1400, C.purple, DK.purple, 'B · PROP EVALUATION', 112, bk, `<g transform="translate(1530,840) rotate(${f1(8 + Math.sin(t * 2) * 3)})"><circle r="56" fill="${C.gold}"/>${txt(0, 4, '$50,000', 22, '#fff')}${txt(0, 28, 'shown', 16, '#fff', { w: 700 })}</g>`);
      out += pill(520, 940, 'room for the normal size', DK.teal, pop(t, T.A + 1, 0.5), 20);
      out += pill(1266, 940, 'room: $300', C.pink, pop(t, T.B + 2.4, 0.5), 20);
      // The $240 loss block drops into each. Scale: $300 room = 112px.
      const blk = (x0, x1, y1, at, w, col, lab) => {
        const k = ease(seg(t, at, at + 1));
        if (k <= 0) return '';
        const x = lerp(x0, x1, k), y = lerp(560, y1, k) - Math.sin(k * Math.PI) * 120;
        return `<g transform="translate(${f1(x)},${f1(y)})"><rect x="${-w / 2}" y="-50" width="${w}" height="100" rx="10" fill="${col}" stroke="#fff" stroke-width="3"/>${txt(0, 10, lab, w > 80 ? 26 : 18, '#fff')}</g>`;
      };
      out += blk(240, 375, 840, T.packA, 90, C.pink, '$240');
      out += check(620, 840, pop(t, T.packA + 1.1, 0.5), C.teal, 30);
      const shrink = t > T.verdict + 0.8;
      if (!shrink) out += blk(1700, 1255, 840, T.packB, 90, C.pink, '$240');
      else out += blk(1255, 1225, 840, T.verdict + 0.8, 30, C.peach, '');
      out += pill(1400, 640 + 20, 'one loss = 80% of the room', C.pink, between(t, T.packB + 1.2, T.verdict + 0.6), 24);
      out += pill(1400, 660, 'smaller size, or no trade', DK.purple, pop(t, T.verdict + 1, 0.5), 26);
      if (t > T.packB + 1 && t < T.verdict + 0.8) { const fl = Math.floor(t * 3) % 2; out += `<rect x="1205" y="776" width="120" height="128" rx="14" fill="none" stroke="${fl ? C.pink : C.gold}" stroke-width="5"/>`; }
      // Travellers and a porter dog.
      out += who(t, { x: 190, y: 1000, scale: 1, look: A.LOOKS.buyer, seed: 3, at: T.A + 0.3, talk: ctx.talking && t > T.A && t < T.A + 3 });
      out += who(t, { x: 1730, y: 1000, scale: 1, look: A.LOOKS.d, flip: true, seed: 5, at: T.B + 0.3, talk: ctx.talking && t > T.packB && t < T.packB + 3, mood: t > T.packB + 1 && t < T.verdict + 1 ? 'sad' : undefined });
      out += bub(1700, 600, 'Same chart, so same size? 🤔', between(t, T.B + 2, T.packB), { size: 24, tail: 'right' });
      const dx = 960 + Math.sin(t * 0.8) * 60;
      out += crit(t, 'dog', { x: dx, y: 1000, scale: 0.6, seed: 4, flip: Math.cos(t * 0.8) < 0, hop: 9, hopH: 8, at: T.chart + 1.4, tongue: true });
      return out;
    },

    // An owl checks the current program rules; a blacksmith forges a four-layer shield: trade, daily, account, survival.
    's17-shield-forge': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="380" width="1920" height="620" fill="#FBEFE4" opacity=".6"/>` + ground(1000, '#EADBCB', '#D9C5B0');
      // Lectern with a long rules scroll.
      out += scaleAt(420, 1000, pop(t, T.forge, 0.7), `<rect x="400" y="760" width="40" height="240" fill="#9B6A45"/><ellipse cx="420" cy="996" rx="100" ry="12" fill="#9B6A45"/><path d="M250,700 L590,700 L620,770 L220,770 Z" fill="#B8835A"/>`);
      const rk = ease(seg(t, T.forge + 0.4, T.forge + 1.6));
      const rules = ['max drawdown', 'daily loss rule', 'trailing drawdown', 'consistency', 'contract limits', 'payout & time rules'];
      const upd = t > T.check;
      if (rk > 0) {
        let sc = `<rect x="250" y="${f1(700 - 290 * rk)}" width="340" height="${f1(290 * rk)}" fill="#FFF8EC" stroke="#E2D6C0" stroke-width="3"/><rect x="236" y="${f1(694 - 290 * rk)}" width="368" height="22" rx="11" fill="#E7C9A5"/>`;
        rules.forEach((r, i) => {
          const y = 440 + i * 42;
          if (y < 700 - 290 * rk + 20) return;
          const jitter = upd && t < T.check + 1.6 ? Math.sin(t * 30 + i) * 3 : 0;
          sc += `<circle cx="278" cy="${y - 7}" r="6" fill="${[C.pink, C.peach, C.purple, C.teal, C.pink, C.peach][i]}"/>${txt(296 + jitter, y, r, 22, C.text, { a: 'start', w: 700 })}`;
        });
        out += sc;
      }
      // Owl with magnifier on the lectern.
      out += crit(t, 'owl', { x: 560, y: 700, scale: 0.75, seed: 3, at: T.forge + 0.6, talk: ctx.talking && t > T.check && t < T.check + 3 });
      const mg = 440 + ((t * 0.6) % 1) * 210;
      if (rk >= 1) out += `<g transform="translate(${f1(330 + Math.sin(t * 1.4) * 60)},${f1(mg)})"><circle r="34" fill="#fff" fill-opacity=".3" stroke="${C.dark}" stroke-width="7"/><line x1="24" y1="24" x2="56" y2="56" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/></g>`;
      out += stamp(610, 440, 'UPDATED', C.pink, ease(seg(t, T.check, T.check + 0.3)) * (Math.floor(t * 2) % 2 ? 1 : 0.85), 12, 70, 22);
      out += pill(420, 1044, 'check the current rules for YOUR program', DK.pink, pop(t, T.check + 0.6, 0.5), 22);
      // Anvil.
      out += scaleAt(1150, 1000, pop(t, T.forge + 0.3, 0.7), `<path d="M1040,860 L1260,860 L1300,830 L1260,830 Q1250,800 1220,800 L1060,800 Q1040,800 1040,830 L990,830 Z" fill="${C.muted}"/><rect x="1100" y="860" width="100" height="80" fill="#6E5A50"/><rect x="1070" y="940" width="160" height="60" rx="8" fill="#5A4A40"/>`);
      // Shield, built layer by layer.
      const L = [['SURVIVAL', C.purple, 150], ['ACCOUNT', C.teal, 118], ['DAILY', C.peach, 86], ['TRADE', C.pink, 54]];
      const order = [3, 2, 1, 0]; // trade first
      const SX = 1150, SY = 600;
      const glow = t > T.done ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
      if (glow) out += `<circle cx="${SX}" cy="${SY}" r="${190 + glow * 10}" fill="${C.gold}" opacity=".18"/>`;
      const shieldPath = r => `M${SX},${SY - r} L${SX + r * 0.9},${SY - r * 0.6} C${SX + r * 0.9},${SY + r * 0.3} ${SX + r * 0.5},${SY + r * 0.8} ${SX},${SY + r * 1.05} C${SX - r * 0.5},${SY + r * 0.8} ${SX - r * 0.9},${SY + r * 0.3} ${SX - r * 0.9},${SY - r * 0.6} Z`;
      // Draw outer to inner, each visible once its layer time has passed.
      [0, 1, 2, 3].forEach(li => {
        const at = T.layers[order.indexOf(li)];
        const k = pop(t, at, 0.5);
        if (k <= 0) return;
        out += scaleAt(SX, SY, k, `<path d="${shieldPath(L[li][2])}" fill="${L[li][1]}" stroke="#fff" stroke-width="5"/>`);
      });
      if (t > T.layers[0]) out += `<text x="${SX}" y="${SY + 16}" font-size="40" text-anchor="middle">🛡️</text>`;
      order.forEach((li, j) => {
        const k = pop(t, T.layers[j] + 0.2, 0.5);
        const y = 490 + j * 80;
        out += pill(860, y, L[li][0], L[li][1] === C.peach ? DK.peach : L[li][1] === C.teal ? DK.teal : L[li][1] === C.purple ? DK.purple : DK.pink, k, 24);
        if (t > T.layers[j]) out += sparkAt(SX, SY, T.layers[j], t, L[li][1]);
      });
      out += pill(SX, 400, 'never the same number', C.purple, pop(t, T.four, 0.5), 26);
      // Blacksmith hammering.
      const strikes = T.layers.concat([T.done]);
      const lastS = strikes.filter(x => t > x - 0.4).pop();
      const hp = lastS != null ? clamp((t - lastS + 0.4) / 0.6) : 1;
      const up = hp < 1 ? Math.sin(hp * Math.PI) : 0;
      const bs = { x: 1480, y: 1000, scale: 1.1, look: A.LOOKS.a, flip: true, seed: 4, at: T.forge + 0.5, hat: 'bandana', talk: ctx.talking && t > T.done };
      bs.frontArm = { a1: -100 + (1 - up) * 70, a2: -140 + (1 - up) * 110 };
      bs.hold = `<g transform="rotate(${f1(-40 + (1 - up) * 50)})"><rect x="-5" y="-60" width="10" height="70" rx="4" fill="#9B6A45"/><rect x="-22" y="-80" width="44" height="26" rx="5" fill="${C.dark}"/></g>`;
      out += who(t, bs);
      // Furnace and cat.
      const fl = Math.sin(t * 9) * 6;
      out += scaleAt(1770, 1000, pop(t, T.forge + 0.4, 0.7), `<rect x="1680" y="660" width="180" height="340" rx="20" fill="#B8835A"/><rect x="1720" y="560" width="60" height="110" fill="#9B6A45"/><path d="M1710,1000 L1710,820 Q1770,770 1830,820 L1830,1000 Z" fill="${C.dark}"/>
        <path d="M1730,1000 Q1740,${880 + fl} 1770,${850 - fl} Q1800,${880 + fl} 1810,1000 Z" fill="${C.peach}"/><path d="M1750,1000 Q1760,${920 - fl} 1770,${900 + fl} Q1780,${920 - fl} 1790,1000 Z" fill="${C.gold}"/>`);
      out += crit(t, 'cat', { x: 960, y: 1000, scale: 0.6, seed: 5, at: T.forge + 1, sleep: t < T.layers[0] || t > T.done + 1 });
      out += pill(1150, 1044, 'your framework · your numbers', C.purple, pop(t, T.done, 0.6), 24);
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
