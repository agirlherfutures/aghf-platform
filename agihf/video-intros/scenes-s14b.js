/**
 * scenes-s14b.js: illustrated scene types for Section 14 lesson intro videos, Lessons 28 to 30
 * (Phase 5 · Section 14: Making the Timeframes Work Together).
 *
 * 28: 1M: Execute Dayli ICC · 29: How HTF ICC and 1M ICC Work Together · 30: Conflicting Information Across Timeframes.
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

  // A polyline revealed along its length (k 0..1).
  const zig = (pts, col, k, w = 6, dash = '') => {
    if (k <= 0) return '';
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let rem = tot * clamp(k), d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const f = Math.min(1, rem / L[i - 1]);
      d += ` L${f1(lerp(pts[i - 1][0], pts[i][0], f))},${f1(lerp(pts[i - 1][1], pts[i][1], f))}`;
      rem -= L[i - 1];
    }
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  };
  // Map normalised points (u right, v up, 0..1) into a box.
  const inBox = (pts, x, y, w, h) => pts.map(([u, v]) => [x + u * w, y + h - v * h]);

  // Standard kicker + swapping headlines.
  const TYPES = ['close-camera', 'bus-stop', 'nesting-dolls', 'cinema-ticket', 'four-questions', 'picnic-mss'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s14b-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson 28: 1M: Execute Dayli ICC ================= */
  // Bullish 1M sequence. PIL = the swing high at 0.6 (bar 1). Bar 5 only wicks through; 7 = I, 9 = C, 10 = C.
  const B28A = [[.35, .48, .5, .33], [.48, .58, .6, .46], [.58, .5, .59, .48], [.5, .42, .52, .4], [.42, .48, .5, .4], [.48, .52, .67, .47],
    [.52, .47, .54, .45], [.47, .68, .7, .46], [.68, .72, .75, .66], [.72, .54, .73, .52], [.54, .7, .72, .53]];
  // After the sequence: price runs away, retests the PIL (0.4) at bar 7, then reaches target. Stop 0.25 (30 pts), target 0.7 (60 pts).
  const B28B = [[.3, .46, .48, .29], [.46, .5, .53, .44], [.5, .34, .51, .32], [.34, .48, .5, .33], [.48, .58, .6, .47], [.58, .62, .65, .56],
    [.62, .52, .63, .5], [.52, .43, .53, .4], [.43, .55, .56, .42], [.55, .66, .68, .54], [.66, .72, .73, .65]];

  // A little photo of one candle against the PIL (for the referee's camera).
  const snap = (x, y, k, kind, cap, col) => {
    if (k <= 0) return '';
    const ly = y - 40; // PIL inside the photo
    const c = { wick: [ly + 18, ly + 2, ly - 30, C.teal], I: [ly + 26, ly - 22, ly - 28, C.teal], C1: [ly - 22, ly + 22, ly - 26, C.pink], C2: [ly + 20, ly - 24, ly - 30, C.teal] }[kind];
    const [o, cl, hi, cc] = c;
    return scaleAt(x, y, k, rotAt(x, y, kind === 'I' ? -4 : kind === 'C1' ? 3 : kind === 'C2' ? -2 : 4, `<rect x="${x - 70}" y="${y - 110}" width="140" height="168" rx="8" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <rect x="${x - 58}" y="${y - 98}" width="116" height="110" rx="4" fill="#F7F3FF"/>
      <line x1="${x - 58}" x2="${x + 58}" y1="${ly}" y2="${ly}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="9 6"/>
      <line x1="${x}" x2="${x}" y1="${hi}" y2="${Math.max(o, cl) + 6}" stroke="${cc}" stroke-width="4"/>
      <rect x="${x - 15}" y="${Math.min(o, cl)}" width="30" height="${Math.abs(o - cl)}" rx="3" fill="${cc}"/>
      ${txt(x, y + 44, cap, 22, col)}`));
  };

  Object.assign(LIVE, {
    // A referee owl with a "close cam" judges each candle at its close: a wick poking through doesn't count.
    's14b-close-camera': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const cg = {
        x: 160, y: 320, w: 940, h: 800, bars: B28A, pil: .6, pilAt: T.pil, grow: 0.6,
        times: [8.7, 8.95, 9.2, 9.45, 9.7, null, T.wick + 2.8, T.ind, T.ind + 1.5, T.corr, T.cont],
        form: { i: 5, t0: T.wick, t1: T.wick + 2.4, path: [.48, .55, .63, .67, .6, .52] },
        tags: [{ i: 5, text: 'wick only ✗', col: C.pink, at: T.wick + 2.4 }, { i: 7, text: 'I', at: T.ind + 0.7, fs: 26 },
          { i: 9, text: 'C', pos: 'below', at: T.corr + 0.7, fs: 26 }, { i: 10, text: 'C', at: T.cont + 0.7, fs: 26 }],
      };
      out += scaleAt(630, 900, pop(t, T.htf, 0.6), `<rect x="130" y="410" width="1000" height="520" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
      if (t > T.htf + 0.2) out += chart(t, Object.assign({ panel: false }, cg));
      // HTF first.
      out += pill(280, 480, '4H done ✓', DK.purple, pop(t, T.cards[0], 0.5), 24);
      out += pill(470, 480, '1H done ✓', DK.teal, pop(t, T.cards[1], 0.5), 24);
      out += pill(630, 900, 'PIL = Pre-Indication Level', C.purple, between(t, T.pil + 0.6, T.wick + 1.6), 24);
      // Camera flashes on each close.
      const closes = [T.wick + 2.4, T.ind + 0.6, T.corr + 0.6, T.cont + 0.6];
      closes.forEach(c => {
        const p = seg(t, c, c + 0.5);
        if (p > 0 && p < 1) out += `<rect x="130" y="410" width="1000" height="520" rx="26" fill="#fff" opacity="${(0.55 * (1 - p)).toFixed(3)}"/>`;
      });
      // Umpire chair + owl referee with a camera.
      const rk = pop(t, T.htf + 0.5, 0.7);
      let ref = `<rect x="1480" y="830" width="14" height="170" fill="#9B6A45"/><rect x="1626" y="830" width="14" height="170" fill="#9B6A45"/>
        <rect x="1480" y="900" width="160" height="10" fill="#9B6A45"/><rect x="1466" y="814" width="188" height="22" rx="8" fill="#C98A5B"/>`;
      ref += critter(t, 'owl', { x: 1560, y: 816, scale: 1, seed: 5, talk: ctx.talking && t > T.wick + 2.4 && t < T.wick + 4 });
      ref += `<g transform="translate(1474,742)"><rect x="-44" y="-30" width="88" height="60" rx="10" fill="${C.dark}"/><rect x="-24" y="-40" width="30" height="14" rx="4" fill="${C.dark}"/>
        <circle cx="-4" cy="2" r="20" fill="#5B4A44"/><circle cx="-4" cy="2" r="11" fill="#9FD9F0"/><circle cx="26" cy="-18" r="6" fill="${C.gold}"/></g>`;
      out += scaleAt(1560, 1000, rk, ref);
      out += pill(1560, 1045, 'only the close counts 📸', DK.purple, pop(t, T.wick + 0.6, 0.6), 24);
      closes.forEach(c => {
        const p = seg(t, c, c + 0.45);
        if (p > 0 && p < 1) out += `<circle cx="1470" cy="744" r="${20 + p * 90}" fill="#FFF6C8" opacity="${(1 - p).toFixed(3)}"/>`;
      });
      // Polaroids on a string.
      const sk = ease(seg(t, T.htf + 0.8, T.htf + 1.6));
      if (sk > 0) out += `<path d="M1240,420 Q1560,${420 + 30 * sk} 1880,420" stroke="${C.muted}" stroke-width="3" fill="none" opacity="${sk}"/>`;
      [['wick', 'wick ✗', DK.pink], ['I', 'I ✓', DK.teal], ['C1', 'C ✓', DK.teal], ['C2', 'C ✓', DK.teal]].forEach(([kd, cap, col], i) => {
        out += snap(1320 + i * 160, 540 + (i === 1 || i === 2 ? 14 : 0), pop(t, closes[i] + 0.35, 0.5), kd, cap, col);
      });
      out += bub(1360, 690, 'Wick only. Not counted.', between(t, T.wick + 2.6, T.ind - 0.2), { size: 26 });
      out += bub(1360, 690, 'All three closes! ✨', between(t, T.done, s.end), { size: 26 });
      out += pill(630, 1045, 'I → C → C · sequence complete ✓', DK.teal, pop(t, T.done, 0.6), 26);
      if (t > T.done) out += A.sparkle(1000, 560, T.done, t);
      return out;
    },

    // The planned limit entry waits at the PIL like a rider at a bus stop. Price (the bus) has to come back.
    's14b-bus-stop': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const missed = t > T.missed;
      const cg = {
        x: 150, y: 373, w: 820, h: 646, bars: B28B, pil: .4, pilAt: T.stop, grow: 0.5,
        times: [T.stop + 0.1, T.stop + 0.3, T.stop + 0.5, T.stop + 0.7, T.run + 0.3, T.run + 1.5, T.back - 0.6, T.back + 0.6, T.risk + 0.8, T.risk + 1.8, T.risk + 2.8],
        dim: i => missed && i >= 6,
      };
      const { X, Y } = geo(cg);
      out += scaleAt(560, 900, pop(t, T.stop, 0.6), `<rect x="120" y="420" width="880" height="500" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
      // Stop and target lines (MNQ example).
      const rk = ease(seg(t, T.risk, T.risk + 0.8));
      if (rk > 0) {
        out += `<rect x="${cg.x - 10}" y="${Y(.7)}" width="${(cg.w + 20) * rk}" height="${Y(.4) - Y(.7)}" fill="${C.teal}" opacity=".12"/><rect x="${cg.x - 10}" y="${Y(.4)}" width="${(cg.w + 20) * rk}" height="${Y(.25) - Y(.4)}" fill="${C.pink}" opacity=".12"/>`;
        out += `<line x1="${cg.x - 10}" x2="${cg.x - 10 + (cg.w + 20) * rk}" y1="${Y(.7)}" y2="${Y(.7)}" stroke="${C.tealD}" stroke-width="4" stroke-dasharray="12 8"/>`;
        out += `<line x1="${cg.x - 10}" x2="${cg.x - 10 + (cg.w + 20) * rk}" y1="${Y(.25)}" y2="${Y(.25)}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="12 8"/>`;
      }
      out += chart(t, Object.assign({ panel: false }, cg));
      // I, C, C already complete (bars 0, 2, 3).
      ['I', 'C', 'C'].forEach((l, i) => {
        const j = [0, 2, 3][i], bb = B28B[j], above = true;
        out += pill(X(j), above ? Y(bb[2]) - 34 : Y(bb[3]) + 34, l, C.purple, pop(t, T.stop + 0.9 + i * 0.25, 0.5), 22);
      });
      // Waiting limit order, then the retest fill.
      out += pill(860, Y(.4) + 34, '◆ limit entry waits here', DK.purple, between(t, T.stop + 1.6, T.back + 0.6), 20);
      if (t > T.back + 1.1 && !missed) {
        const k = pop(t, T.back + 1.1, 0.5);
        out += scaleAt(X(7), Y(.4), k, `<path d="M${X(7)},${Y(.4) - 16} L${X(7) + 16},${Y(.4)} L${X(7)},${Y(.4) + 16} L${X(7) - 16},${Y(.4)} Z" fill="${C.gold}" stroke="${DK.peach}" stroke-width="3"/>`);
        out += pill(X(7), Y(.4) + 50, 'RETEST · ENTRY', DK.peach, k, 20);
      }
      out += pill(330, Y(.7) - 28, 'TARGET · 60 pts', DK.teal, pop(t, T.risk + 0.6, 0.5), 20);
      out += pill(620, Y(.25) + 28, 'STOP · 30 pts', DK.pink, pop(t, T.risk + 1.2, 0.5), 20);
      out += pill(560, 470, 'MNQ example · risk 30 to make 60', C.muted, pop(t, T.risk + 0.2, 0.5), 20);
      if (!missed && t > T.risk + 3.4) out += check(X(10) + 2, Y(.73) - 40, pop(t, T.risk + 3.4, 0.5), C.teal, 22);
      // Missed trade: price runs straight to target without a retest.
      if (missed) {
        const gk = ease(seg(t, T.missed + 0.4, T.missed + 2));
        out += zig([[X(5), Y(.62)], [X(6), Y(.66)], [X(7), Y(.72)], [X(8), Y(.78)]], C.pink, gk, 6, '14 9');
        out += pill(560, 960, 'no retest before target = missed trade', DK.pink, pop(t, T.missed + 1.8, 0.6), 22);
      }
      // Bus stop side.
      out += A.road(1000, { x0: 1060, x1: 1920, h: 80 });
      const sk = pop(t, T.stop + 0.4, 0.6);
      out += scaleAt(1640, 1000, sk, `<rect x="1634" y="660" width="12" height="340" fill="${C.muted}"/><circle cx="1640" cy="640" r="54" fill="${C.purple}" stroke="#fff" stroke-width="6"/>${txt(1640, 652, 'PIL', 32, '#fff')}
        <rect x="1590" y="720" width="100" height="70" rx="8" fill="#fff" stroke="${C.purple}" stroke-width="3"/>${txt(1640, 748, 'LIMIT', 18, DK.purple)}${txt(1640, 772, 'ENTRY', 18, DK.purple)}`);
      // The rider with a ticket.
      const rd = { x: 1770, y: 1000, scale: 0.82, look: A.LOOKS.d, flip: true, seed: 3, at: T.stop + 0.6, talk: ctx.talking && t > T.run + 0.6 && t < T.back };
      rd.hold = `<g><rect x="-30" y="-24" width="60" height="38" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="3"/><path d="M-20,-8 L20,-8 M-20,2 L10,2" stroke="${C.purpleL}" stroke-width="4"/></g>`;
      rd.frontArm = { a1: 60, a2: 0 };
      // The bus (price).
      let bus = '';
      const busAt = (x, flip, moving) => `<g transform="translate(${f1(x)},1050) scale(${flip ? -1 : 1},1) translate(${f1(-x)},-1050)">${A.vehicle('bus', { x, y: 1050, t, scale: 0.72, moving, dist: x })}</g>${txt(x, 1012, 'PRICE', 24, '#fff', { ls: 2 })}`;
      if (!missed) {
        if (t > T.run && t < T.run + 2.6) { const k = seg(t, T.run, T.run + 2.6); bus = busAt(lerp(1150, 2200, ease(k)), false, true); }
        if (t > T.back) { const k = ease(seg(t, T.back, T.back + 1.6)); bus = busAt(lerp(2200, 1480, k), true, k < 1); }
      } else if (t < T.missed + 2.6) { const k = seg(t, T.missed, T.missed + 2.6); bus = busAt(lerp(1150, 2250, k * k), false, true); }
      out += who(t, rd) + bus;
      out += bub(1640, 560, 'I don’t chase. I wait. 🙂', between(t, T.run + 0.8, T.back - 0.2), { size: 26 });
      out += bub(1640, 560, 'It came back. Filled ✓', between(t, T.back + 1.6, T.risk + 3.8), { size: 26 });
      out += bub(1600, 560, 'Missed, not a bad trade.', between(t, T.missed + 2.2, s.end), { size: 26 });
      return out;
    },
  });

  /* ================= Lesson 29: How HTF ICC and 1M ICC Work Together ================= */
  // A nesting doll: (x, y) = feet, H tall. lift 0..1 opens the top half. belly = svg drawn in the belly window.
  function doll(t, o) {
    const { x, y, H, col, dk } = o;
    const cy = y - 0.36 * H, rx = 0.34 * H, ry = 0.36 * H, lift = o.lift || 0;
    const hx = x, hy = y - 0.8 * H, hr = 0.2 * H;
    const bot = `<path d="M${f1(x - rx)},${f1(cy)} A${f1(rx)},${f1(ry)} 0 0 0 ${f1(x + rx)},${f1(cy)} Z" fill="${col}" stroke="${dk}" stroke-width="5"/>
      <rect x="${f1(x - rx)}" y="${f1(cy - 4)}" width="${f1(rx * 2)}" height="8" fill="${dk}"/>`;
    const top = `<path d="M${f1(x - rx)},${f1(cy)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(x + rx)},${f1(cy)} Z" fill="${col}" stroke="${dk}" stroke-width="5"/>
      <circle cx="${hx}" cy="${f1(hy)}" r="${f1(hr)}" fill="${col}" stroke="${dk}" stroke-width="5"/>
      <circle cx="${hx}" cy="${f1(hy + hr * 0.12)}" r="${f1(hr * 0.68)}" fill="#F7D9C2"/>
      <path d="M${f1(hx - hr * 0.68)},${f1(hy)} Q${hx},${f1(hy - hr * 0.9)} ${f1(hx + hr * 0.68)},${f1(hy)}" fill="#7A4A2A"/>
      <circle cx="${f1(hx - hr * 0.25)}" cy="${f1(hy + hr * 0.15)}" r="${f1(hr * 0.08)}" fill="${C.dark}"/><circle cx="${f1(hx + hr * 0.25)}" cy="${f1(hy + hr * 0.15)}" r="${f1(hr * 0.08)}" fill="${C.dark}"/>
      <circle cx="${f1(hx - hr * 0.4)}" cy="${f1(hy + hr * 0.4)}" r="${f1(hr * 0.12)}" fill="${C.pink}" opacity=".6"/><circle cx="${f1(hx + hr * 0.4)}" cy="${f1(hy + hr * 0.4)}" r="${f1(hr * 0.12)}" fill="${C.pink}" opacity=".6"/>
      <path d="M${f1(hx - hr * 0.16)},${f1(hy + hr * 0.42)} Q${hx},${f1(hy + hr * 0.56)} ${f1(hx + hr * 0.16)},${f1(hy + hr * 0.42)}" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${[-1, 0, 1].map(i => `<circle cx="${f1(x + i * rx * 0.42)}" cy="${f1(cy - ry * 0.32 + Math.abs(i) * ry * 0.08)}" r="${f1(H * 0.035)}" fill="#fff" opacity=".85"/>`).join('')}`;
    const pw = 0.56 * H, ph = 0.24 * H, px = x - pw / 2, py = cy + 0.03 * H;
    const win = `<rect x="${f1(px)}" y="${f1(py)}" width="${f1(pw)}" height="${f1(ph)}" rx="${f1(H * 0.04)}" fill="#fff" stroke="${dk}" stroke-width="3"/>${o.belly ? o.belly(px, py, pw, ph) : ''}`;
    const ly = -lift * 0.18 * H, la = -lift * 8;
    return `${bot}${win}<g transform="translate(0,${f1(ly)}) rotate(${f1(la)} ${f1(x + rx)} ${f1(cy)})">${top}</g>`;
  }
  const DOLLS = [
    { tf: '4H', x: 330, H: 520, col: C.purpleL, dk: DK.purple, lab: '4H · the larger story' },
    { tf: '1H', x: 790, H: 400, col: C.tealL, dk: DK.teal, lab: '1H · bearish, inside the 4H correction' },
    { tf: '15M', x: 1260, H: 300, col: C.peachL, dk: DK.peach, lab: '15M · optional extra detail' },
    { tf: '1M', x: 1650, H: 230, col: C.pinkL, dk: DK.pink, lab: '1M · your entry' },
  ];

  Object.assign(LIVE, {
    // Russian nesting dolls: open the 4H and the 1H sits inside it, then the 15M, then the 1M. ICC inside ICC.
    's14b-nesting-dolls': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F6EEF6', '#E6D9E8');
      // Shelf glow.
      out += `<ellipse cx="960" cy="1004" rx="900" ry="16" fill="${C.purpleL}" opacity=".35"/>`;
      const bellies = [
        (px, py, pw, ph) => {
          const P = inBox([[0, .1], [.24, .55], [.38, .32], [.62, .9], [.86, .58]], px + 20, py + 18, pw - 40, ph - 30);
          const k = ease(seg(t, T.d4 + 0.6, T.d4 + 2.4));
          let g = `<line x1="${px + 14}" x2="${px + pw - 14}" y1="${f1(P[1][1])}" y2="${f1(P[1][1])}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="6 6" opacity="${k}"/>`;
          g += zig(P, DK.purple, k, 6);
          if (k >= 1) {
            g += `<circle cx="${f1(P[3][0] + 30)}" cy="${f1(P[3][1] + 8)}" r="20" fill="${C.purple}"/>${txt(P[3][0] + 30, P[3][1] + 16, 'I', 22, '#fff')}`;
            const nk = pop(t, T.phase, 0.5);
            if (nk > 0) g += `<circle cx="${f1(P[4][0])}" cy="${f1(P[4][1])}" r="${f1(9 + Math.sin(t * 6) * 2)}" fill="${C.pink}"/>` + scaleAt(P[4][0] + 32, P[4][1] + 6, nk, `<circle cx="${f1(P[4][0] + 32)}" cy="${f1(P[4][1] + 6)}" r="22" fill="${C.pink}"/>${txt(P[4][0] + 32, P[4][1] + 15, 'C', 24, '#fff')}`);
          }
          return g;
        },
        (px, py, pw, ph) => {
          const P = inBox([[0, .88], [.18, .45], [.34, .7], [.54, .28], [.7, .5], [.9, .08]], px + 16, py + 12, pw - 32, ph - 22);
          return zig(P, DK.pink, ease(seg(t, T.d1 + 1.1, T.d1 + 2.5)), 5);
        },
        (px, py, pw, ph) => {
          const P = inBox([[0, .85], [.1, .6], [.17, .7], [.3, .42], [.38, .52], [.52, .25], [.6, .35], [.74, .12], [.84, .3], [.92, .22], [1, .4]], px + 12, py + 10, pw - 24, ph - 18);
          return zig(P, DK.peach, ease(seg(t, T.d15 + 1.1, T.d15 + 2.3)), 4);
        },
        (px, py, pw, ph) => {
          const P = inBox([[0, .2], [.3, .3], [.45, .78], [.64, .28], [.84, .8], [1, .66]], px + 10, py + 8, pw - 20, ph - 14);
          const k = ease(seg(t, T.d1m + 1.1, T.d1m + 2.3));
          return `<line x1="${px + 6}" x2="${px + pw - 6}" y1="${f1(py + ph / 2)}" y2="${f1(py + ph / 2)}" stroke="${C.purple}" stroke-width="2.5" stroke-dasharray="6 5" opacity="${k}"/>` + zig(P, DK.teal, k, 4);
        },
      ];
      const born = [T.d4, T.d1, T.d15, T.d1m];
      const lifts = [ease(seg(t, T.d1 - 0.8, T.d1)), ease(seg(t, T.d15 - 0.8, T.d15)), ease(seg(t, T.d1m - 0.8, T.d1m)), 0];
      DOLLS.forEach((d, i) => {
        if (t < born[i]) return;
        const o = Object.assign({ y: 1000, lift: lifts[i], belly: bellies[i] }, d);
        if (i === 0) { out += scaleAt(d.x, 1000, pop(t, born[0], 0.7), doll(t, o)); return; }
        const k = ease(seg(t, born[i], born[i] + 1));
        const src = DOLLS[i - 1].x, x = lerp(src, d.x, k), y = 1000 - Math.sin(k * Math.PI) * 140 - (1 - k) * DOLLS[i - 1].H * 0.3;
        out += scaleAt(x, y, lerp(0.55, 1, k), doll(t, Object.assign(o, { x, y })));
      });
      // Labels.
      DOLLS.forEach((d, i) => out += pill(d.x, 1046, i === 0 && t > T.corr ? '4H · now: a correction' : d.lab, i === 0 && t > T.corr ? C.pink : d.dk, i === 0 ? pop(t, born[0] + 0.6, 0.5) : pop(t, born[i] + (i === 1 ? 2.6 : 1.1), 0.5), 20));
      out += pill(330, 430, 'each phase: many 4H candles', C.muted, between(t, T.many, T.corr - 0.2), 24);
      out += pill(1650, 700, 'ICC again', DK.pink, pop(t, T.d1m + 2.2, 0.5), 22);
      if (t > T.d1m + 2.2) out += A.sparkle(1650, 820, T.d1m + 2.2, t);
      // A cat watching from the corner.
      out += crit(t, 'cat', { x: 1830, y: 1000, scale: 0.7, flip: true, seed: 6, at: T.d4 + 1 });
      return out;
    },

    // A cinema: the HTF poster is the story that gets you interested; the 1M ICC ticket is what gets you in.
    's14b-cinema-ticket': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F4F0E8');
      // Poster on the wall.
      const pk = pop(t, T.poster, 0.7);
      let p = `<rect x="110" y="390" width="700" height="530" rx="20" fill="${C.gold}"/><rect x="126" y="406" width="668" height="498" rx="12" fill="#FFFDF8"/>
        <rect x="126" y="406" width="668" height="48" rx="12" fill="${C.dark}"/>${txt(460, 440, 'NOW SHOWING · THE 4H STORY', 22, C.gold, { ls: 2 })}`;
      out += scaleAt(460, 920, pk, p);
      const P4 = [[170, 720], [290, 610], [370, 670], [520, 500], [660, 600]];
      const ck = ease(seg(t, T.poster + 0.6, T.poster + 2.2));
      if (pk > 0.9) {
        out += `<line x1="150" x2="770" y1="610" y2="610" stroke="${C.muted}" stroke-width="2" stroke-dasharray="7 7" opacity="${ck}"/>`;
        out += zig(P4, DK.purple, ck, 7);
        out += pill(200, 490, '4H', C.purple, pop(t, T.poster + 0.5, 0.5), 24);
        out += pill(520, 474, 'I', C.purple, pop(t, T.poster + 2, 0.5), 22);
        const nk = pop(t, T.poster + 2.4, 0.5);
        if (nk > 0) out += `<circle cx="660" cy="600" r="${f1(10 + Math.sin(t * 6) * 2)}" fill="${C.pink}"/>` + pill(726, 600, 'C · now', C.pink, nk, 22);
        // Zoom into the correction: the 1H view.
        const zk = pop(t, T.zoom, 0.6);
        if (zk > 0) {
          out += `<rect x="520" y="500" width="150" height="110" rx="10" fill="${C.pink}" opacity=".12" stroke="${C.pink}" stroke-width="3" stroke-dasharray="8 6"/>`;
          out += `<path d="M595,612 L595,700" stroke="${C.pink}" stroke-width="3" stroke-dasharray="8 6"/>`;
          out += scaleAt(560, 800, zk, `<rect x="330" y="700" width="440" height="190" rx="14" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${txt(550, 734, '1H inside the correction', 22, DK.pink)}`);
          const Z = inBox([[0, .9], [.18, .45], [.33, .68], [.55, .25], [.7, .48], [.92, .05]], 360, 748, 380, 124);
          out += zig(Z, DK.pink, ease(seg(t, T.zoom + 0.5, T.zoom + 1.8)), 5);
          out += txt(200, 810, '1H:', 26, DK.pink) + txt(200, 846, 'bearish', 26, DK.pink);
        }
      }
      out += pill(460, 958, '✓ can be part of the 4H correction', DK.teal, between(t, T.part, T.ctx - 0.3), 22);
      out += pill(460, 1040, '✗ not automatically a reversal', DK.pink, between(t, T.part + 1.6, T.ctx - 0.3), 22);
      out += pill(460, 1000, 'HTF ICC = context (the story)', DK.purple, pop(t, T.ctx, 0.6), 26);
      // Cinema entrance.
      const ek = pop(t, T.poster + 1, 0.7);
      let e = `<rect x="960" y="470" width="900" height="530" fill="#FBEFE6" stroke="#EADFD8" stroke-width="4"/>
        <rect x="940" y="410" width="940" height="76" rx="14" fill="${C.purple}"/>${[0, 1, 2, 3, 8, 9, 10, 11].map(i => `<circle cx="${970 + i * 80}" cy="448" r="7" fill="${(Math.floor(t * 3) + i) % 2 ? C.gold : '#FFF3C4'}"/>`).join('')}
        ${txt(1410, 458, '1M ENTRY', 34, '#fff', { ls: 4 })}
        <rect x="1340" y="580" width="230" height="420" rx="12" fill="${C.dark}" opacity=".85"/><rect x="1352" y="592" width="206" height="408" rx="8" fill="#4A3A34"/>`;
      out += scaleAt(1410, 1000, ek, e);
      // Robot usher.
      out += crit(t, 'robot', { x: 1700, y: 1000, scale: 0.9, seed: 3, at: T.ctx - 0.2, screen: '1M', talk: ctx.talking && t > T.story + 1 });
      // Turnstile.
      const ok = t > T.ticket + 1.6;
      const open = ease(seg(t, T.ticket + 1.6, T.ticket + 2.4));
      const bad = t > T.story + 1.4 && t < T.ticket;
      const tk = pop(t, T.ctx, 0.6);
      out += scaleAt(1270, 1000, tk, `<rect x="1246" y="800" width="48" height="200" rx="10" fill="${C.muted}"/>
        <circle cx="1270" cy="780" r="22" fill="${ok ? C.teal : bad ? C.pink : '#D9CFC8'}" stroke="#fff" stroke-width="4"/>
        <g transform="rotate(${f1(-open * 80)} 1294 880)"><rect x="1294" y="872" width="${130}" height="16" rx="8" fill="#B9AED6"/></g>`);
      // Visitor: first the poster, then the ticket.
      const walk = ease(seg(t, T.ticket + 2.4, T.ticket + 4.2));
      const vs = { x: lerp(1100, 1450, walk), y: 1000, scale: 0.86, look: A.LOOKS.a, seed: 2, at: T.story - 0.4, walking: walk > 0 && walk < 1, talk: ctx.talking && t > T.story && t < T.ticket };
      if (t < T.ticket) {
        vs.frontArm = t > T.story + 0.6 ? aim(vs, 1230, 760) : { a1: 70, a2: 20 };
        vs.hold = `<g transform="rotate(-20)"><rect x="-26" y="-70" width="52" height="80" rx="6" fill="#FFFDF8" stroke="${C.gold}" stroke-width="4"/><path d="M-16,-14 L-4,-36 L4,-28 L16,-52" stroke="${DK.purple}" stroke-width="4" fill="none"/></g>`;
      } else {
        vs.frontArm = t < T.ticket + 2.2 ? aim(vs, 1230, 770) : { a1: 100, a2: 95 };
        vs.hold = t < T.ticket + 2.2 ? `<g transform="rotate(-10)"><rect x="-44" y="-30" width="88" height="48" rx="6" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="3"/>${txt(0, -8, '1M ICC', 16, DK.teal)}${txt(0, 12, 'I ✓ C ✓ C ✓', 13, DK.teal)}</g>` : '';
      }
      out += who(t, vs);
      out += bub(1660, 600, 'A story isn’t a ticket ✗', between(t, T.story + 1.4, T.ticket - 0.2), { size: 26, tail: 'right' });
      out += bub(1660, 600, 'Confirmed. Come in ✓', between(t, T.ticket + 1.6, s.end), { size: 26, tail: 'right' });
      out += pill(1410, 1046, '1M ICC = confirmation', DK.teal, pop(t, T.ticket + 2, 0.6), 26);
      if (ok) out += A.sparkle(1270, 780, T.ticket + 1.6, t);
      return out;
    },
  });

  /* ================= Lesson 30: Conflicting Information Across Timeframes ================= */
  const PANEL = [
    { tf: '4H', q: ['What is the', 'broader', 'environment?'], col: C.purple, dk: DK.purple, look: 'a' },
    { tf: '1H', q: ['What structure', 'and levels', 'matter?'], col: C.teal, dk: DK.teal, look: 'c' },
    { tf: '15M', q: ['What is', 'developing near', 'those levels?'], col: C.peach, dk: DK.peach, look: 'b' },
    { tf: '1M', q: ['Has my', 'entry model', 'completed?'], col: C.pink, dk: DK.pink, look: 'e' },
  ];
  // 1H after the 4H turned bearish: lower highs and lower lows; bar 5's high (0.58) is the last lower high; bar 10 closes above it.
  const B30 = [[.84, .74, .86, .72], [.74, .6, .75, .55], [.6, .7, .72, .58], [.7, .55, .71, .53], [.55, .42, .56, .4], [.42, .55, .58, .41],
    [.55, .44, .56, .42], [.44, .34, .45, .32], [.34, .44, .46, .33], [.44, .52, .54, .43], [.52, .66, .68, .5], [.66, .7, .72, .64]];

  Object.assign(LIVE, {
    // Two views of one market, then a panel of four timeframes, each answering its own question.
    's14b-four-questions': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // The bigger view vs the zoomed-in view.
      const vk = pop(t, T.view, 0.6);
      out += scaleAt(440, 940, vk, `<rect x="100" y="400" width="680" height="540" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(130, 446, 'BIGGER VIEW', 22, DK.teal, { a: 'start', ls: 2 })}`);
      const BV = [[150, 860], [280, 660], [360, 740], [520, 500], [610, 640]];
      const bk = ease(seg(t, T.view + 0.6, T.view + 2.6));
      if (vk > 0.9) {
        out += zig(BV, DK.teal, bk, 7);
        out += pill(360, 790, 'Higher low', DK.teal, pop(t, T.view + 2, 0.5), 20);
        out += pill(520, 466, 'Higher high', DK.teal, pop(t, T.view + 2.4, 0.5), 20);
        out += pill(680, 446, 'BULLISH', DK.teal, pop(t, T.view + 2.8, 0.5), 22);
      }
      // Magnifier on the pullback.
      const zk = pop(t, T.zoom, 0.6);
      if (zk > 0) {
        out += `<circle cx="565" cy="570" r="${f1(58 * zk)}" fill="${C.pink}" opacity=".1" stroke="${C.pink}" stroke-width="5"/><path d="M${f1(565 + 41 * zk)},${f1(570 + 41 * zk)} L${f1(565 + 70 * zk)},${f1(570 + 70 * zk)}" stroke="${C.muted}" stroke-width="12" stroke-linecap="round"/>`;
        out += scaleAt(605, 840, zk, `<rect x="460" y="720" width="300" height="196" rx="14" fill="#FFF7F9" stroke="${C.pink}" stroke-width="4"/>${txt(610, 752, 'ZOOMED IN', 20, DK.pink, { ls: 2 })}${txt(610, 780, 'lower highs, lower lows', 18, DK.pink, { w: 700 })}`);
        const ZP = inBox([[0, .95], [.16, .5], [.3, .7], [.5, .28], [.64, .48], [.86, .04]], 490, 800, 250, 100);
        out += zig(ZP, DK.pink, ease(seg(t, T.zoom + 0.5, T.zoom + 1.8)), 5);
      }
      out += pill(440, 1040, 'may be a correction inside the bullish structure', DK.purple, pop(t, T.may, 0.6), 22);
      // The panel of four.
      const dk = pop(t, T.panel, 0.7);
      PANEL.forEach((p, i) => {
        const x = 1000 + i * 250, k = pop(t, T.q[i], 0.6);
        const pr = { x, y: 1000, scale: 0.86, look: A.LOOKS[p.look], seed: 2 + i, at: T.panel + 0.2 + i * 0.2, talk: ctx.talking && t > T.q[i] && t < (T.q[i + 1] || s.end) };
        if (k > 0 && t < (T.q[i + 1] || s.end)) pr.frontArm = { a1: -60 + Math.sin(t * 5 + i) * 6, a2: -80 };
        out += who(t, pr);
        if (k > 0) out += scaleAt(x, 640, k, `<rect x="${x - 118}" y="420" width="236" height="200" rx="16" fill="#fff" stroke="${p.col}" stroke-width="4"/>
          <rect x="${x - 118}" y="420" width="236" height="46" rx="16" fill="${p.col}"/><rect x="${x - 118}" y="450" width="236" height="16" fill="${p.col}"/>${txt(x, 454, p.tf + ' asks', 22, '#fff')}
          ${p.q.map((l, j) => txt(x, 506 + j * 36, l, 24, p.dk)).join('')}<path d="M${x - 14},620 L${x},${640} L${x + 14},620 Z" fill="${p.col}"/>`);
      });
      out += scaleAt(1375, 1000, dk, `<rect x="860" y="900" width="1030" height="100" rx="12" fill="#9B6A45"/><rect x="850" y="886" width="1050" height="22" rx="8" fill="#C98A5B"/>
        ${PANEL.map((p, i) => `<rect x="${1000 + i * 250 - 64}" y="922" width="128" height="56" rx="10" fill="${p.col}"/>${txt(1000 + i * 250, 960, p.tf, 30, '#fff')}`).join('')}`);
      return out;
    },

    // A picnic planned (bullish thesis), clouds roll in (4H bearish structure): wait for the sun (a bullish 1H MSS).
    's14b-picnic-mss': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const clear = ease(seg(t, T.mss + 0.8, T.mss + 2.4));
      // Sky + sun.
      out += `<rect x="90" y="400" width="740" height="600" rx="24" fill="#E8F4F8" opacity="${f1(0.7 - 0.3 * (1 - clear) * seg(t, T.cloud, T.cloud + 1))}"/>`;
      const sunK = pop(t, T.picnic, 0.6);
      if (sunK > 0) out += scaleAt(680, 500, sunK, `${Array.from({ length: 10 }, (_, i) => { const a = i * 36 + t * 20; return `<line x1="${f1(680 + Math.cos(rad(a)) * 62)}" y1="${f1(500 + Math.sin(rad(a)) * 62)}" x2="${f1(680 + Math.cos(rad(a)) * 84)}" y2="${f1(500 + Math.sin(rad(a)) * 84)}" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>`; }).join('')}<circle cx="680" cy="500" r="50" fill="${C.gold}"/>`);
      out += ground(1000, '#EAF4EC', '#D0E6D5');
      // Blanket + basket.
      out += scaleAt(470, 980, pop(t, T.picnic + 0.3, 0.6), `<ellipse cx="470" cy="975" rx="190" ry="34" fill="${C.pinkL}"/><path d="M330,975 L610,975 M400,950 L400,1000 M470,945 L470,1005 M540,950 L540,1000" stroke="#fff" stroke-width="6" opacity=".7"/>
        <g transform="translate(530,930)"><path d="M-40,0 Q0,-60 40,0" stroke="#9B6A45" stroke-width="6" fill="none"/><path d="M-50,0 L50,0 L40,46 L-40,46 Z" fill="#E0A85C" stroke="#9B6A45" stroke-width="4"/>
        <path d="M${f1(-30)},0 Q0,${f1(-16 - clear * 20)} 30,0" fill="${C.pinkL}" opacity="${clear}"/></g>`);
      // Cloud rolls in, then drifts away once the shift confirms.
      const cin = ease(seg(t, T.cloud, T.cloud + 1.6)), cout = clear;
      if (cin > 0) {
        const cx = lerp(-200, 560, cin) + cout * 500, op = 1 - cout;
        out += `<g opacity="${f1(op)}"><g transform="translate(${f1(cx)},520) scale(2.1)"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#B9B3C9"/><ellipse cx="-44" cy="8" rx="44" ry="24" fill="#B9B3C9"/><ellipse cx="48" cy="6" rx="48" ry="26" fill="#B9B3C9"/><ellipse cx="6" cy="-22" rx="44" ry="30" fill="#B9B3C9"/></g>
          ${txt(cx, 528, '4H: bearish', 28, '#fff')}${txt(cx, 562, 'structure', 28, '#fff')}`;
        if (cin >= 1 && cout < 1) out += Array.from({ length: 12 }, (_, i) => { const p = (t * 1.3 + i / 12) % 1, x = cx - 150 + (i * 53) % 300; return `<line x1="${x}" y1="${600 + p * 300}" x2="${x - 6}" y2="${624 + p * 300}" stroke="${C.purple}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`; }).join('');
        out += '</g>';
      }
      out += pill(460, 430, 'THESIS: BULLISH 🧺', DK.teal, pop(t, T.picnic + 0.4, 0.6), 24);
      // Picnicker.
      const pp = { x: 260, y: 1000, scale: 0.86, look: A.LOOKS.b, seed: 4, at: T.picnic + 0.2, talk: ctx.talking && (t > T.wait && t < T.lh || t > T.mss + 1) };
      const rain = cin >= 1 && clear < 0.5;
      if (rain) { pp.frontArm = { a1: -70, a2: -95 }; pp.hold = `<g><line x1="0" y1="0" x2="0" y2="-120" stroke="${C.dark}" stroke-width="5"/><path d="M-90,-110 Q0,-200 90,-110 Q60,-126 30,-110 Q0,-126 -30,-110 Q-60,-126 -90,-110 Z" fill="${C.purple}"/></g>`; }
      else if (t > T.mss + 1.4) pp.frontArm = { a1: -60 + Math.sin(t * 6) * 8, a2: -80 };
      out += who(t, pp);
      out += bub(330, 600, 'I’ll wait for the 1H.', between(t, T.wait, T.mss + 0.8), { size: 26 });
      out += bub(330, 600, 'Now I can reconsider longs ☀️', between(t, T.mss + 1.6, s.end), { size: 24 });
      // The 1H chart.
      const cg = { x: 940, y: 380, w: 900, h: 714, bars: B30, grow: 0.5, times: [0, 1, 2, 3, 4, 5, 6, 7].map(i => T.cloud + 0.6 + i * 0.4).concat([T.lh + 1.8, T.lh + 3.2, T.mss + 0.2, T.mss + 1.4]) };
      const { X, Y } = geo(cg);
      const gk = pop(t, T.cloud + 0.3, 0.6);
      out += scaleAt(1390, 930, gk, `<rect x="910" y="410" width="960" height="520" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(950, 456, '1H', 26, DK.purple, { a: 'start' })}`);
      if (gk > 0.9) {
        // Last lower high line.
        const lk = ease(seg(t, T.lh, T.lh + 0.8));
        if (lk > 0) out += `<line x1="${X(5)}" x2="${f1(lerp(X(5), cg.x + cg.w + 10, lk))}" y1="${Y(.58)}" y2="${Y(.58)}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="14 9"/>`;
        out += chart(t, Object.assign({ panel: false }, cg));
        const tagK = at => between(t, at, T.lh - 0.2);
        out += pill(X(2), Y(.72) - 32, 'Lower high', DK.pink, tagK(T.cloud + 4.2), 20);
        out += pill(X(4), Y(.4) + 32, 'Lower low', DK.pink, tagK(T.cloud + 4.6), 20);
        out += pill(X(5), Y(.58) - 32, 'Lower high', DK.pink, tagK(T.cloud + 5.0), 20);
        out += pill(X(7), Y(.32) + 32, 'Lower low', DK.pink, tagK(T.cloud + 5.4), 20);
        out += pill(X(7) + 10, Y(.58) - 32, 'LAST 1H LOWER HIGH', C.purple, pop(t, T.lh + 0.6, 0.5), 20);
        out += pill(1300, 474, 'WAIT for a bullish 1H MSS ⏳', DK.peach, between(t, T.wait + 0.4, T.mss + 0.8), 22);
        out += pill(1560, 474, 'BULLISH 1H MSS ✓', DK.teal, pop(t, T.mss + 1, 0.6), 24);
        if (t > T.mss + 0.7) out += check(X(10), Y(.68) - 34, pop(t, T.mss + 0.7, 0.5), C.teal, 18);
      }
      out += pill(1390, 1046, 'and the 1M still has to earn the entry', DK.purple, pop(t, T.mss + 3.2, 0.6), 22);
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
