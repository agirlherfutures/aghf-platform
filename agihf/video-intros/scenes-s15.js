/**
 * scenes-s15.js: illustrated scene types for Section 15 lesson intro videos
 * (Phase 6 · Section 15: How to Actually Enter, Lessons 1 to 8).
 *
 * Execution training: let price earn the entry. The 1M sits at the end of
 * 4H → 1H → 15M → 1M, and the entry only comes at the first valid retest.
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


  // Standard kicker + swapping headlines.
  const TYPES = ['relay', 'archer', 'preflight', 'photo-hide', 'hatchery', 'coaster', 'spin-call', 'goalkeeper',
    'conductor', 'fetch', 'surf-line', 'ice-cream', 'driving-test', 'dog-treat', 'batter', 'session-close'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s15-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* Shared bits for this section. */
  // A bib / name card pinned to a person's chest.
  const bib = (t, o, text, col) => {
    const h = headAt(t, o), f = o.flip ? -1 : 1;
    return `<g transform="translate(${f1(h.x + 4 * h.s * f)},${f1(h.y + 128 * h.s)}) scale(${h.s})"><rect x="-30" y="-20" width="60" height="40" rx="8" fill="#fff" stroke="${col}" stroke-width="4"/>${txt(0, 9, text, text.length > 2 ? 18 : 24, col)}</g>`;
  };
  const bstamp = (x, y, text, col, k, rot = -10, r = 64, fs = 30) => k <= 0 ? '' : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (1 + (1 - clamp(k)) * 0.8))}" fill="#FFFDF8" opacity="${(clamp(k * 1.6) * 0.95).toFixed(2)}"/>` + stamp(x, y, text, col, k, rot, r, fs);
  const sky = (top, bot) => `<defs><linearGradient id="s15sky${top.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`;

  /* ================= Lesson 1: The Job of the 1-Minute Timeframe ================= */
  Object.assign(LIVE, {
    // A four-leg relay: 4H, 1H, 15M and 1M. The 1M tries to start the race and is sent back: it runs the LAST leg.
    's15-relay': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      // Stadium: bleachers, bunting, track.
      const bk = ease(seg(t, T.track - 0.2, T.track + 0.8));
      if (bk > 0) {
        let st = `<rect x="0" y="560" width="1920" height="300" fill="#EFE3F3"/>`;
        for (let r = 0; r < 3; r++) {
          st += `<rect x="0" y="${590 + r * 90}" width="1920" height="12" fill="#D9CFE9"/>`;
          for (let i = 0; i < 26; i++) {
            const x = 40 + i * 74 + (r % 2) * 36, jump = Math.max(0, Math.sin(t * 5 + i * 1.3 + r)) * (t > T.finish ? 14 : 4);
            const col = [C.pinkL, C.tealL, C.peachL, C.purpleL][(i + r) % 4];
            st += `<circle cx="${x}" cy="${f1(570 + r * 90 - jump)}" r="15" fill="${col}"/><rect x="${x - 14}" y="${f1(582 + r * 90 - jump)}" width="28" height="12" rx="6" fill="${col}"/>`;
          }
        }
        st += `<path d="M0,410 ${Array.from({ length: 13 }, (_, i) => `Q${80 + i * 160},${440 + Math.sin(t * 2 + i) * 6} ${160 + i * 160},410`).join(' ')}" stroke="${C.muted}" stroke-width="3" fill="none"/>`;
        for (let i = 0; i < 24; i++) { const x = 40 + i * 80, y = 418 + Math.abs(Math.sin((x / 160) * Math.PI)) * 22; st += `<path d="M${x - 16},${f1(y)} L${x + 16},${f1(y)} L${x},${f1(y + 34 + Math.sin(t * 4 + i) * 4)} Z" fill="${[C.pink, C.peach, C.purple, C.teal][i % 4]}"/>`; }
        st += `<rect x="0" y="860" width="1920" height="220" fill="#E89A7E"/>`;
        for (let i = 0; i < 3; i++) st += `<rect x="0" y="${900 + i * 60}" width="1920" height="5" fill="#fff" opacity=".8"/>`;
        out += fade(bk, st);
      }
      const ST = [200, 560, 920, 1280], FIN = 1660;
      // Finish tape.
      const broke = t > T.finish;
      out += fade(bk, `<rect x="${FIN - 4}" y="740" width="10" height="280" fill="#fff"/><rect x="${FIN + 30}" y="740" width="10" height="280" fill="#fff"/>
        ${broke ? `<path d="M${FIN},800 Q${FIN - 30},830 ${FIN - 50},880" stroke="${C.pink}" stroke-width="6" fill="none"/><path d="M${FIN + 34},800 Q${FIN + 70},840 ${FIN + 80},890" stroke="${C.pink}" stroke-width="6" fill="none"/>` : `<line x1="${FIN}" y1="800" x2="${FIN + 34}" y2="800" stroke="${C.pink}" stroke-width="6"/>`}`);
      const runners = [['4H', A.LOOKS.a, C.purple, 'read the room'], ['1H', A.LOOKS.c, DK.teal, 'build the map'], ['15M', A.LOOKS.b, DK.peach, 'observe'], ['1M', A.LOOKS.d, DK.pink, 'execute']];
      const LEG = 2.6;
      let batonX = ST[0];
      runners.forEach(([tf, look, col, job], i) => {
        const L0 = T.legs[i], from = ST[i], to = i < 3 ? ST[i + 1] - 100 : FIN + 80;
        let x = from, walking = false, flip = false, arms = null, mood;
        if (t >= L0) { const k = seg(t, L0, L0 + LEG); x = lerp(from, to, k); walking = k < 1; }
        if (i === 3 && t < T.legs[3]) {
          // The 1M bolts too early, then walks back.
          const go = ease(seg(t, T.bolt, T.bolt + 0.8)), back = ease(seg(t, T.back, T.back + 1.4));
          x = from + 220 * go - 220 * back;
          walking = (t > T.bolt && t < T.bolt + 0.8) || (t > T.back && t < T.back + 1.4);
          flip = t > T.back && t < T.back + 1.4;
          mood = t > T.whistle && t < T.back + 1.6 ? 'sad' : undefined;
        }
        const has = t >= L0 && (i === 3 || t < T.legs[i + 1]);
        if (has) batonX = x;
        const done = i < 3 ? t > T.legs[i + 1] : t > T.finish;
        const o = { x, y: 1000, scale: 0.86, look, seed: i * 2 + 1, walking, flip, at: T.track + 0.3 + i * 0.25, mood };
        if (walking) o.frontArm = { a1: 60 + Math.sin(t * 9 + i) * 40, a2: 10 + Math.sin(t * 9 + i) * 30 };
        else if (done) { o.frontArm = { a1: -110 + Math.sin(t * 6 + i) * 10, a2: -90 }; o.backArm = { a1: -70, a2: -90 }; }
        else o.frontArm = { a1: 30, a2: -20 };
        if (has) o.hold = `<rect x="-8" y="-36" width="16" height="56" rx="6" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>`;
        out += who(t, o);
        if (pop(t, o.at) >= 1) out += bib(t, o, tf, col);
        out += pill(ST[i] + 40, 1046, `${tf} · ${job}`, col, pop(t, i === 3 ? T.legs[3] : L0, 0.5) * (t > T.legs[0] - 0.2 ? 1 : 0), 22);
      });
      // A dog mascot running alongside the baton.
      if (t > T.legs[0]) out += critter(t, 'dog', { x: Math.min(batonX - 70, FIN - 40), y: 1030, scale: 0.55, seed: 3, hop: 12, hopH: 14, tongue: true });
      else out += crit(t, 'dog', { x: 120, y: 1030, scale: 0.55, seed: 3, at: T.track + 1.2 });
      // Owl referee with a whistle on a tall chair.
      const ok = pop(t, T.track + 0.8, 0.6);
      out += scaleAt(1820, 1000, ok, `<rect x="1776" y="820" width="10" height="180" fill="${C.muted}"/><rect x="1856" y="820" width="10" height="180" fill="${C.muted}"/><rect x="1764" y="810" width="114" height="18" rx="6" fill="${C.muted}"/>`
        + critter(t, 'owl', { x: 1820, y: 812, scale: 0.8, seed: 4, talk: ctx.talking && t > T.whistle && t < T.back + 1 })
        + (t > T.whistle && t < T.whistle + 1.6 ? `<g transform="translate(1790,${730})"><circle r="${10 + Math.sin(t * 30) * 2}" fill="${C.gold}"/>${[0, 1, 2].map(j => `<path d="M${-20 - j * 14},${-12 + j * 12} l-14,${-4 + j * 4}" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>` : ''));
      out += bub(1660, 600, 'You run the LAST leg! ✋', between(t, T.whistle, T.back + 1.2), { size: 28, tail: 'right' });
      out += bub(1380, 640, 'Oops 😅', between(t, T.whistle + 0.6, T.back + 0.8), { size: 26 });
      // Finish payoff.
      if (broke) {
        out += A.sparkle(FIN, 800, T.finish, t) + A.sparkle(FIN + 100, 700, T.finish + 0.3, t, C.teal);
        out += bub(1500, 560, 'Has price earned the entry?', between(t, T.finish + 0.4, s.end), { size: 28 });
      }
      return out;
    },

    // Shoot first, then paint the target around the arrow? That is using HTF to justify a 1M decision. Target first.
    's15-archer': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EAF6F4" opacity=".55"/>` + cloud(260 + (t * 12) % 200, 450, 0.7) + cloud(820 - (t * 8) % 160, 410, 0.55) + ground(1000, '#E3EED9', '#CFE0C2');
      // Barn wall.
      const wk = pop(t, T.wall, 0.8);
      let wall = `<path d="M1020,1000 L1020,520 L1360,400 L1700,520 L1700,1000 Z" fill="#E7C9A5" stroke="#9B6A45" stroke-width="8"/>`;
      for (let x = 1060; x < 1700; x += 60) wall += `<line x1="${x}" y1="${x < 1360 ? 520 - (x - 1020) * 0.35 + 12 : 400 + (x - 1360) * 0.35 + 12}" x2="${x}" y2="996" stroke="#D2AD86" stroke-width="4"/>`;
      out += scaleAt(1360, 1000, wk, wall);
      // Archer.
      const ar = { x: 330, y: 1000, scale: 1, look: A.LOOKS.e, seed: 5, at: T.wall + 0.4, talk: ctx.talking && t > T.verdict + 1.2 && t < T.wipe };
      const bow = { x: 452, y: 760 };
      ar.frontArm = aim(ar, bow.x, bow.y);
      const pull = (sh, rl) => t > sh - 1.4 && t < rl ? ease(seg(t, sh - 1.4, sh - 0.4)) : 0;
      const pl = Math.max(pull(T.shoot, T.shoot), pull(T.release, T.release));
      ar.backArm = pl > 0 ? aim({ x: ar.x, y: ar.y, scale: 1 }, bow.x - 30 - pl * 70, bow.y) : { a1: 100, a2: 95 };
      out += who(t, ar);
      if (pop(t, ar.at) >= 1) {
        out += `<path d="M${bow.x},${bow.y - 110} Q${bow.x + 60},${bow.y} ${bow.x},${bow.y + 110}" stroke="#9B6A45" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M${bow.x},${bow.y - 110} L${bow.x - 10 - pl * 70},${bow.y} L${bow.x},${bow.y + 110}" stroke="${C.muted}" stroke-width="2.5" fill="none"/>`;
        if (pl > 0) out += `<line x1="${bow.x - 10 - pl * 70}" y1="${bow.y}" x2="${bow.x + 70}" y2="${bow.y}" stroke="${C.dark}" stroke-width="5"/><path d="M${bow.x + 70},${bow.y - 10} L${bow.x + 92},${bow.y} L${bow.x + 70},${bow.y + 10} Z" fill="${C.dark}"/>`;
      }
      // Arrows in flight / stuck.
      const arrow = (t0, tx, ty, op = 1) => {
        if (t < t0) return '';
        const k = seg(t, t0, t0 + 0.5);
        const P = q => [lerp(bow.x + 70, tx, q), lerp(bow.y, ty, q) - Math.sin(q * Math.PI) * 60];
        const [x, y] = P(k), [x2, y2] = P(Math.min(1, k + 0.02)), [x0, y0] = P(0.98);
        const ang = k < 0.98 ? Math.atan2(y2 - y, x2 - x) * 180 / Math.PI : Math.atan2(ty - y0, tx - x0) * 180 / Math.PI;
        return fade(op, rotAt(x, y, ang, `<line x1="${f1(x - 110)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y)}" stroke="${C.dark}" stroke-width="6"/><path d="M${f1(x - 110)},${f1(y)} l-18,-14 l12,14 l-12,14 Z" fill="${C.pink}"/>`) + (k >= 1 ? `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="${Math.max(0, 1 - (t - t0 - 0.5) / 0.4) * 30}" fill="none" stroke="${C.gold}" stroke-width="4"/>` : ''));
      };
      // Rings painted after the arrow (backwards), wiped later.
      const wipe = ease(seg(t, T.wipe, T.wipe + 1));
      const A1 = { x: 1220, y: 690 };
      const ring = (cx, cy, r, col, t0, lab) => {
        const k = ease(seg(t, t0, t0 + 1));
        if (k <= 0) return '';
        const c = 2 * Math.PI * r;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="22" stroke-dasharray="${f1(c * k)} ${f1(c)}" transform="rotate(-90 ${cx} ${cy})"/>` + (lab ? pill(cx + r + 4, cy - r + 10, lab, col === C.purpleL ? C.purple : col === C.tealL ? DK.teal : col === C.peachL ? DK.peach : col, pop(t, t0 + 0.8), 20) : '');
      };
      let bad = ring(A1.x, A1.y, 150, C.purpleL, T.paint[1], '4H') + ring(A1.x, A1.y, 96, C.tealL, T.paint[0], '1H') + `<circle cx="${A1.x}" cy="${A1.y}" r="${t > T.paint[0] ? 40 : 0}" fill="${C.pink}" opacity=".5"/>`;
      out += fade(1 - wipe, bad + arrow(T.shoot, A1.x, A1.y));
      out += pill(A1.x, 900, '1M first, HTF to justify', C.pink, between(t, T.verdict, T.wipe), 24);
      out += cross(A1.x + 170, 520, between(t, T.verdict, T.wipe, 0.5), C.pink, 32);
      // Squirrel painter on a ladder.
      const paintNow = t > T.paint[0] - 0.4 && t < T.paint[1] + 1.2;
      const sqX = paintNow ? A1.x - 230 : t > T.rings[0] - 0.4 && t < T.rings[2] + 1.2 ? 1360 - 230 : 920;
      const lk = pop(t, T.shoot + 0.6, 0.6);
      out += scaleAt(sqX, 1000, lk, `<path d="M${sqX - 30},1000 L${sqX - 10},640 M${sqX + 30},1000 L${sqX + 10},640" stroke="#9B6A45" stroke-width="8"/>${[0, 1, 2, 3, 4].map(i => `<line x1="${sqX - 28 + i * 4}" y1="${960 - i * 72}" x2="${sqX + 28 - i * 4}" y2="${960 - i * 72}" stroke="#9B6A45" stroke-width="6"/>`).join('')}`
        + critter(t, 'squirrel', { x: sqX + 6, y: 744, scale: 0.9, seed: 2, hop: (paintNow || (t > T.rings[0] && t < T.rings[2] + 1)) ? 8 : 0, hopH: 8 })
        + `<g transform="rotate(${-30 + Math.sin(t * 10) * (paintNow ? 20 : 4)} ${sqX + 40} ${660})"><rect x="${sqX + 36}" y="620" width="8" height="60" rx="3" fill="#9B6A45"/><rect x="${sqX + 32}" y="600" width="16" height="24" rx="4" fill="${C.purple}"/></g>`);
      // Goat critic.
      out += crit(t, 'cat', { x: 760, y: 1000, scale: 0.9, seed: 6, at: T.wall + 0.9, talk: ctx.talking && t > T.verdict && t < T.verdict + 2 });
      out += bub(820, 640, "That's backwards! 😂", between(t, T.verdict, T.wipe), { size: 28 });
      // Correct order: rings first, then the arrow comes last.
      const A2 = { x: 1360, y: 700 };
      if (t > T.rings[0]) {
        out += ring(A2.x, A2.y, 170, C.purpleL, T.rings[0], '4H') + ring(A2.x, A2.y, 116, C.tealL, T.rings[1], '1H') + ring(A2.x, A2.y, 62, C.peachL, T.rings[2], '15M');
        const bk2 = pop(t, T.rings[2] + 0.6, 0.5);
        out += scaleAt(A2.x, A2.y, bk2, `<circle cx="${A2.x}" cy="${A2.y}" r="22" fill="${C.pink}"/>`);
        out += pill(A2.x, 920, 'the 1M executes last', DK.teal, pop(t, T.done - 0.6), 24);
        out += arrow(T.release, A2.x, A2.y);
        if (t > T.release + 0.5) out += A.sparkle(A2.x, A2.y, T.release + 0.5, t) + check(A2.x + 190, 520, pop(t, T.release + 0.6, 0.5), C.teal, 32);
      }
      out += bub(470, 560, 'Only once price earns it', between(t, T.aim, s.end), { size: 26 });
      return out;
    },
  });

  /* ================= Lesson 2: Your Pre-Entry Checklist ================= */
  Object.assign(LIVE, {
    // A pilot's pre-flight card with six fields. One unknown (the PIL) = NOT READY. All six defined = READY TO WAIT, not "take off".
    's15-preflight': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EAF2FB" opacity=".6"/>` + cloud(1200 + (t * 16) % 300, 430, 0.8) + cloud(1700 - (t * 10) % 200, 470, 0.6) + ground(1000, '#DCDDE6', '#C9CAD6');
      for (let i = 0; i < 8; i++) out += `<rect x="${(i * 260 - (t * 0) % 260) + 40}" y="1036" width="120" height="10" rx="5" fill="#fff" opacity=".8"/>`;
      // Plane at the gate.
      const pk = ease(seg(t, T.board, T.board + 1.2));
      const px = lerp(2300, 0, pk), shake = t > T.notready && t < T.notready + 0.6 ? Math.sin(t * 50) * 3 : 0;
      let pl = `<g transform="translate(${f1(px + shake)},0)">
        <path d="M1690,720 L1800,520 L1870,520 L1860,740 Z" fill="${C.pink}"/>
        <path d="M990,720 Q920,730 920,810 Q920,900 1000,900 L1850,900 Q1890,860 1870,720 Z" fill="#fff" stroke="#E2D6E8" stroke-width="5"/>
        <rect x="950" y="866" width="910" height="16" fill="${C.pink}" opacity=".6"/>
        <path d="M940,770 Q960,736 1010,736 L1070,736 L1070,786 L930,786 Z" fill="${C.purpleL}" stroke="${DK.purple}" stroke-width="3"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<circle cx="${1140 + i * 72}" cy="780" r="16" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="3"/>`).join('')}
        <path d="M1220,850 L1520,850 L1430,940 L1310,940 Z" fill="#E2D6E8"/>
        <line x1="1060" y1="900" x2="1060" y2="976" stroke="${C.muted}" stroke-width="8"/><circle cx="1060" cy="982" r="18" fill="${C.dark}"/>
        <line x1="1640" y1="900" x2="1640" y2="976" stroke="${C.muted}" stroke-width="8"/><circle cx="1620" cy="982" r="18" fill="${C.dark}"/><circle cx="1660" cy="982" r="18" fill="${C.dark}"/>
        <text x="1450" y="836" font-size="26" font-weight="900" fill="${DK.purple}" font-family="DM Sans" letter-spacing="4">AGHF AIR</text>`;
      // Dog co-pilot in the cockpit window.
      const dy = Math.sin(t * 3) * 2, bl = blinkAmt(t, 9);
      pl += `<g transform="translate(1010,${f1(764 + dy)})"><ellipse cx="-16" cy="-6" rx="7" ry="13" fill="#B86E12" transform="rotate(20 -16 -6)"/><circle cx="0" cy="4" r="18" fill="${C.peach}"/><ellipse cx="-4" cy="2" rx="3" ry="${f1(4 * (1 - bl * 0.9))}" fill="${C.dark}"/><circle cx="-16" cy="10" r="4" fill="${C.dark}"/>
        <path d="M-14,-12 Q0,-28 18,-12 Z" fill="${C.purple}"/></g>`;
      pl += `</g>`;
      out += pl;
      // Seagull on the tail.
      if (pk >= 1) out += critter(t, 'bird', { x: 1850, y: 522, scale: 0.8, seed: 3, flip: true, talk: ctx.talking && t > T.ready && t < T.ready + 1.6 });
      // Pilot.
      const pi = { x: 830, y: 1000, scale: 0.95, look: A.LOOKS.a, seed: 4, flip: true, at: T.board + 0.8, hat: 'cap', talk: ctx.talking && ((t > T.unsure && t < T.unsure + 3) || t > T.hold), mood: t > T.notready && t < T.fill ? 'sad' : undefined };
      pi.frontArm = t > T.unsure && t < T.unsure + 3 ? { a1: -60 + Math.sin(t * 5) * 12, a2: -120 } : { a1: 150, a2: 200 };
      pi.hold = t > T.unsure && t < T.unsure + 3 ? '' : `<rect x="-26" y="-50" width="52" height="66" rx="6" fill="#C98A5B"/><rect x="-20" y="-42" width="40" height="52" rx="3" fill="#fff"/>`;
      out += who(t, pi);
      out += bub(950, 540, "I'll know it when I see it 🤷", between(t, T.unsure, T.unsure + 3), { size: 26, tail: 'right' });
      // The big card.
      const ck = pop(t, T.board + 0.3, 0.7);
      let card = `<rect x="170" y="410" width="590" height="580" rx="26" fill="#C98A5B"/><rect x="190" y="430" width="550" height="540" rx="14" fill="#FFFDF8"/>
        <rect x="390" y="396" width="150" height="44" rx="12" fill="${C.muted}"/>${txt(465, 492, 'PRE-FLIGHT CARD', 26, C.dark, { ls: 3 })}`;
      const F = [['CONTEXT', '4H bullish'], ['STRUCTURE', '1H HL holding'], ['LOCATION', '4H discount'], ['DIRECTION', 'long only'], ['PIL', 'the swing high'], ['INVALIDATION', 'close below 1H HL']];
      F.forEach(([lab, val], i) => {
        const y = 548 + i * 70, k = pop(t, T.fields[i], 0.5);
        card += `<line x1="220" y1="${y + 30}" x2="710" y2="${y + 30}" stroke="#EADFD8" stroke-width="3"/>${txt(224, y + 8, lab, 20, C.muted, { a: 'start', ls: 2 })}`;
        if (k <= 0) return;
        const isPil = i === 4, filled = !isPil || t > T.fill;
        const v = isPil && !filled ? '? ? ?' : val;
        const vk = isPil && filled ? pop(t, T.fill, 0.5) : k;
        card += fade(vk, txt(420, y + 10, v, 26, isPil && !filled ? C.pink : C.dark, { a: 'start', f: 'Playfair Display', w: 700 }));
        card += isPil && !filled ? cross(690, y, k, C.pink, 18) : check(690, y, isPil ? pop(t, T.fill + 0.3, 0.5) : k, C.teal, 18);
      });
      out += scaleAt(465, 990, ck, card);
      out += bstamp(465, 760, 'NOT READY', C.pink, ease(seg(t, T.notready, T.notready + 0.25)) * (t < T.fill - 0.3 ? 1 : 1 - seg(t, T.fill - 0.3, T.fill)), -12, 110, 30);
      out += bstamp(465, 760, 'READY TO WAIT', DK.teal, ease(seg(t, T.ready, T.ready + 0.25)), 8, 120, 28);
      if (t > T.ready + 0.2) out += A.sparkle(465, 760, T.ready + 0.2, t, C.teal);
      out += pill(465, 1040, 'any unknown = NOT READY', C.pink, between(t, T.notready + 0.6, T.fill - 0.2), 24);
      out += pill(465, 1040, 'not "take off": wait for ICC', DK.teal, pop(t, T.hold, 0.6), 24);
      out += bub(1610, 470, 'Engines off. We wait ☕', between(t, T.hold + 0.4, s.end), { size: 26, tail: 'right' });
      return out;
    },

    // A wildlife photographer in a hide: the plan names exactly what she's waiting for (the bird on THIS branch). Ready camera, no click yet.
    's15-photo-hide': (s, t, ctx) => {
      const T = s.beats;
      const dusk = seg(t, T.wait, T.land);
      let out = `<rect x="0" y="360" width="1920" height="640" fill="${dusk > 0 ? '#F6E7DA' : '#EEF6EE'}" opacity=".6"/>`;
      // Sun drifting across while she waits.
      const sx = lerp(1180, 1480, ease(seg(t, T.hide, s.end))), sy = 470 + Math.sin(seg(t, T.hide, s.end) * Math.PI) * -30;
      out += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="46" fill="${C.gold}" opacity=".85"/>` + cloud(400 + (t * 14) % 300, 440, 0.7);
      out += ground(1000, '#E3EED9', '#CFE0C2');
      for (let i = 0; i < 30; i++) { const x = 20 + i * 66, h = 26 + (i * 37) % 22; out += `<path d="M${x},1000 Q${x + 4 + Math.sin(t * 2 + i) * 6},${1000 - h} ${x + 10},1000" fill="#9CCB8F"/>`; }
      // Tree and THE branch.
      const tk = pop(t, T.hide, 0.8);
      let tree = `<path d="M1640,1000 L1660,560 L1720,560 L1740,1000 Z" fill="#9B6A45"/><circle cx="1690" cy="480" r="150" fill="#9CCB8F"/><circle cx="1580" cy="530" r="90" fill="#8BBF7E"/><circle cx="1800" cy="540" r="100" fill="#8BBF7E"/>
        <path d="M1662,740 Q1520,720 1380,736" stroke="#9B6A45" stroke-width="18" fill="none" stroke-linecap="round"/><ellipse cx="1420" cy="722" rx="22" ry="10" fill="#8BBF7E" transform="rotate(-20 1420 722)"/>`;
      out += scaleAt(1690, 1000, tk, tree);
      // Focus box on the branch spot.
      const fk = pop(t, T.plan, 0.6);
      if (fk > 0) {
        const pulse = 1 + Math.sin(t * 4) * 0.03;
        out += scaleAt(1470, 700, fk * pulse, `<path d="M1390,630 l0,-24 l24,0 M1526,606 l24,0 l0,24 M1550,750 l0,24 l-24,0 M1414,774 l-24,0 l0,-24" stroke="${C.pink}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
        out += pill(1470, 560, 'waiting for: THIS branch', C.pink, fk, 22);
      }
      // The hide (a bush with a lens poking out) and tripod.
      const hk = pop(t, T.hide + 0.3, 0.7);
      const flash = t > T.click && t < T.click + 0.35 ? 1 - seg(t, T.click, T.click + 0.35) : 0;
      let hide = `<line x1="720" y1="1000" x2="760" y2="800" stroke="${C.dark}" stroke-width="7"/><line x1="820" y1="1000" x2="780" y2="800" stroke="${C.dark}" stroke-width="7"/><line x1="770" y1="1000" x2="770" y2="800" stroke="${C.dark}" stroke-width="7"/>
        <rect x="700" y="740" width="150" height="80" rx="14" fill="${C.dark}"/><rect x="840" y="752" width="110" height="56" rx="10" fill="${C.muted}"/><circle cx="950" cy="780" r="30" fill="${C.dark}"/><circle cx="950" cy="780" r="16" fill="${C.purpleL}"/>
        <rect x="726" y="724" width="40" height="20" rx="5" fill="${C.dark}"/>`;
      hide += `<g>${[[380, 900, 150], [520, 860, 140], [640, 910, 130], [460, 790, 120]].map(([x, y, r], i) => `<circle cx="${x}" cy="${f1(y + Math.sin(t * 2 + i) * 3)}" r="${r}" fill="${['#8BBF7E', '#9CCB8F', '#7DB070', '#A8D49A'][i]}"/>`).join('')}</g>`;
      out += scaleAt(600, 1000, hk, hide);
      if (flash > 0) out += `<circle cx="950" cy="780" r="${60 + flash * 80}" fill="#fff" opacity="${flash}"/><rect x="0" y="0" width="1920" height="1080" fill="#fff" opacity="${flash * 0.5}"/>`;
      // Photographer peeking out of the hide.
      if (hk >= 1) {
        const peek = Math.sin(t * 1.6) * 6, bl = blinkAmt(t, 7);
        const talk = ctx.talking && ((t > T.itch && t < T.itch + 2.4) || (t > T.wait && t < T.wait + 2.4)) ? Math.abs(Math.sin(t * 11)) : 0;
        const finger = t > T.itch && t < T.itch + 2.6 ? Math.abs(Math.sin(t * 14)) * 10 : 0;
        out += `<g transform="translate(640,${f1(740 + peek)})"><circle r="44" fill="#E8B48C"/><path d="M-46,-6 C-50,-60 50,-60 46,-6 C30,-30 -30,-30 -46,-6 Z" fill="#C27A3A"/>
          <path d="M-50,-18 Q0,-70 50,-18 L54,-10 L-54,-10 Z" fill="#7DB070"/>${[-30, 0, 30].map(x => `<ellipse cx="${x}" cy="-46" rx="16" ry="8" fill="#8BBF7E" transform="rotate(${x} ${x} -46)"/>`).join('')}
          <ellipse cx="-12" cy="0" rx="5" ry="${f1(7 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="16" cy="0" rx="5" ry="${f1(7 * (1 - bl * 0.9))}" fill="${C.dark}"/>
          ${talk > 0.05 ? `<ellipse cx="2" cy="20" rx="7" ry="${f1(2 + talk * 5)}" fill="#6B2A2A"/>` : `<path d="M-8,18 Q2,26 12,18" stroke="#5a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>`}</g>
          <circle cx="${730}" cy="${f1(720 - finger)}" r="12" fill="#E8B48C"/>`;
      }
      out += bub(560, 560, 'Click now? 😬', between(t, T.itch, T.itch + 2.4), { size: 28 });
      // Mouse assistant with the plan.
      out += crit(t, 'mouse', { x: 1000, y: 1000, scale: 1.1, seed: 4, at: T.hide + 1, talk: ctx.talking && t > T.itch + 2.4 && t < T.butter + 1 });
      out += bub(1080, 860, 'Branch is empty!', between(t, T.itch + 1.2, T.butter - 0.2), { size: 26 });
      // A butterfly flutters near, but it is not the plan.
      if (t > T.butter && t < T.wait + 1) {
        const k = seg(t, T.butter, T.wait + 1), bx = lerp(900, 1900, k), by = 640 + Math.sin(k * 10) * 60;
        const w = Math.abs(Math.sin(t * 16));
        out += `<g transform="translate(${f1(bx)},${f1(by)})"><ellipse cx="-12" cy="-6" rx="${f1(16 * w + 3)}" ry="14" fill="${C.peach}"/><ellipse cx="12" cy="-6" rx="${f1(16 * w + 3)}" ry="14" fill="${C.pinkL}"/><rect x="-3" y="-18" width="6" height="26" rx="3" fill="${C.dark}"/></g>`;
        out += pill(bx, by - 54, 'not the plan', C.muted, between(t, T.butter + 0.4, T.wait), 20);
      }
      // Bird arrives and lands on the branch.
      if (t > T.land - 1.6) {
        const k = ease(seg(t, T.land - 1.6, T.land));
        const bx = lerp(1960, 1470, k), by = lerp(420, 724, k) - Math.sin(k * Math.PI) * 60;
        out += critter(t, 'bird', { x: bx, y: by, scale: 1.1, seed: 2, flip: true, fly: k < 1, col: C.purpleL });
      }
      if (t > T.click + 0.3) {
        out += check(1580, 620, pop(t, T.click + 0.3, 0.5), C.teal, 28) + A.sparkle(1470, 690, T.click + 0.3, t);
        out += pill(1470, 900, 'the moment you planned for', DK.teal, pop(t, T.click + 0.8), 24);
      }
      out += pill(820, 1046, 'camera ready ≠ click', C.purple, between(t, T.plan + 0.8, T.land), 22);
      return out;
    },
  });

  /* ================= Lesson 3: Developing Setup vs Executable Setup ================= */
  // A hen, drawn with (0,0) at the feet, facing right.
  function hen(t, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1, bl = blinkAmt(t, seed);
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0, flap = o.flap ? Math.sin(t * 20) * 30 : Math.sin(t * 2 + seed) * 4;
    const peck = Math.max(0, Math.sin(t * 1.3 + seed)) > 0.96 ? 10 : 0;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * f},${s})">
      <path d="M-8,-30 L-12,0 M10,-30 L12,0" stroke="${C.peach}" stroke-width="6" stroke-linecap="round"/>
      <path d="M-70,-90 Q-100,-140 -80,-150 Q-60,-120 -50,-100 Z" fill="${C.peachL}"/>
      <ellipse cx="0" cy="-74" rx="66" ry="50" fill="#FFF6EC" stroke="#EADFD8" stroke-width="3"/>
      <path d="M-20,-80 Q-50,${-110 - flap} -60,${-70 - flap * 0.4} Q-30,-50 -6,-62 Z" fill="${C.peachL}"/>
      <g transform="translate(0,${peck})"><circle cx="44" cy="-124" r="30" fill="#FFF6EC" stroke="#EADFD8" stroke-width="3"/>
      <path d="M30,-152 q6,-16 12,0 q6,-18 12,0 q6,-14 10,2 Z" fill="${C.pink}"/>
      <path d="M70,${-128 - talk * 3} L90,-120 L70,${-112 + talk * 3} Z" fill="${C.gold}"/><path d="M66,-110 q6,14 -4,16 q-6,-6 4,-16" fill="${C.pink}"/>
      <ellipse cx="54" cy="-130" rx="5" ry="${f1(6 * (1 - bl * 0.9))}" fill="${C.dark}"/></g></g>`;
  }
  Object.assign(LIVE, {
    // Counting chickens before they hatch: a wobbling egg is DEVELOPING. "Might be" is not an entry, and it may hatch into something else.
    's15-hatchery': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#FFF4E4" opacity=".6"/>` + cloud(300 + (t * 10) % 200, 430, 0.7) + ground(1000, '#EFE3C8', '#E2D2AE');
      // Fence.
      const fk = ease(seg(t, T.coop - 0.3, T.coop + 0.6));
      let fence = `<rect x="0" y="830" width="1920" height="14" fill="#E7C9A5"/><rect x="0" y="900" width="1920" height="14" fill="#E7C9A5"/>`;
      for (let x = 30; x < 1920; x += 120) fence += `<path d="M${x},1000 L${x},800 L${x + 20},780 L${x + 40},800 L${x + 40},1000 Z" fill="#F1DFC4" stroke="#D9BE9A" stroke-width="3"/>`;
      out += fade(fk, fence);
      // Coop.
      const ck = pop(t, T.coop, 0.8);
      let coop = `<rect x="1400" y="620" width="420" height="380" fill="${C.pink}"/><path d="M1370,630 L1610,480 L1850,630 Z" fill="${DK.pink}"/>
        <path d="M1560,1000 L1560,820 Q1610,770 1660,820 L1660,1000 Z" fill="${C.dark}" opacity=".75"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${1420 + i * 76}" y1="640" x2="${1420 + i * 76}" y2="1000" stroke="${DK.pink}" stroke-width="3" opacity=".35"/>`).join('')}
        <rect x="1480" y="560" width="260" height="76" rx="14" fill="#fff" stroke="${C.muted}" stroke-width="4"/>${txt(1610, 586, 'STATUS', 16, C.muted, { ls: 3 })}`;
      out += scaleAt(1610, 1000, ck, coop);
      if (ck >= 1) {
        const dev = t > T.wobble;
        const k = dev ? pop(t, T.wobble, 0.5) : pop(t, T.wait, 0.5);
        out += pill(1610, 616, dev ? 'DEVELOPING' : 'WAITING', dev ? DK.peach : C.gold, k, 24);
      }
      // A sleepy cat on the coop roof.
      out += crit(t, 'cat', { x: 1720, y: 580, scale: 0.6, seed: 5, at: T.coop + 0.8, sleep: t < T.hatch, talk: false });
      if (t < T.hatch) out += `<text x="${1760 + Math.sin(t * 2) * 6}" y="${470 - ((t * 20) % 40)}" font-size="26" font-weight="900" fill="${C.purple}" font-family="DM Sans" opacity=".7">z</text>`;
      // Nest and egg.
      const nk = pop(t, T.coop + 0.5, 0.6);
      const EX = 1020, EY = 960;
      const wob = t > T.wobble && t < T.hatch ? Math.sin(t * 11) * (6 + 8 * seg(t, T.wobble, T.hatch)) : 0;
      let egg = '';
      if (t < T.hatch) {
        const cr = seg(t, T.hen + 1, T.hatch);
        egg = rotAt(EX, EY, wob, `<ellipse cx="${EX}" cy="${EY - 62}" rx="50" ry="64" fill="#FFF9F0" stroke="#EADFD8" stroke-width="4"/><ellipse cx="${EX - 18}" cy="${EY - 86}" rx="10" ry="16" fill="#fff"/>
          ${cr > 0 ? `<path d="M${EX - 40},${EY - 70} l14,-14 l12,12 l14,-16 l12,14 l14,-12" stroke="${C.muted}" stroke-width="4" fill="none" stroke-dasharray="${f1(cr * 120)} 200" stroke-linejoin="round"/>` : ''}`);
      } else {
        const h = ease(seg(t, T.hatch, T.hatch + 0.6));
        egg = `<path d="M${EX - 50},${EY - 62} A50,64 0 0,0 ${EX + 50},${EY - 62} l-14,-14 l-12,12 l-14,-16 l-12,14 l-14,-12 Z" fill="#FFF9F0" stroke="#EADFD8" stroke-width="4"/>`;
        egg = critter(t, 'duck', { x: EX - 10, y: EY - 40 - 40 * h, scale: 0.9, seed: 6, talk: ctx.talking && t > T.duck && t < T.duck + 1.6 }) + egg;
        egg += rotAt(EX, EY - 160, -30 * h, `<path d="M${EX - 50},${f1(EY - 62 - 140 * h)} A50,64 0 0,1 ${EX + 50},${f1(EY - 62 - 140 * h)} l-14,-14 Z" fill="#FFF9F0" stroke="#EADFD8" stroke-width="4"/>`);
        out += A.sparkle(EX, EY - 120, T.hatch, t);
      }
      out += scaleAt(EX, EY, nk, `<ellipse cx="${EX}" cy="${EY + 4}" rx="110" ry="34" fill="#E0B872"/>${egg}<path d="M${EX - 110},${EY} Q${EX},${EY + 40} ${EX + 110},${EY} Q${EX + 90},${EY + 40} ${EX},${EY + 40} Q${EX - 90},${EY + 40} ${EX - 110},${EY} Z" fill="#C99A55"/>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${EX - 100 + i * 32}" y1="${EY + 6}" x2="${EX - 80 + i * 32}" y2="${EY + 24}" stroke="#B08040" stroke-width="3"/>`).join('')}`);
      out += bub(EX + 70, 760, 'Quack? 🦆', between(t, T.duck, T.duck + 2.6), { size: 28 });
      // Hen.
      const hk = pop(t, T.coop + 0.9, 0.6);
      out += scaleAt(1260, 1000, hk, hen(t, { x: 1260, y: 1000, scale: 1.1, flip: true, seed: 3, talk: ctx.talking && t > T.hen && t < T.hen + 2.4, flap: t > T.hen && t < T.hen + 1.2 }));
      out += bub(1290, 740, 'Not yet! ✋', between(t, T.hen, T.hatch - 0.4), { size: 28 });
      // Kid farmer with a basket, counting chickens.
      const kd = { x: 600, y: 1000, scale: 0.92, look: A.LOOKS.b, seed: 5, at: T.kid, talk: ctx.talking && t > T.dream && t < T.hen, mood: t > T.duck + 0.4 && t < T.duck + 2.8 ? 'sad' : undefined };
      kd.frontArm = t > T.dream && t < T.hen ? { a1: -60 + Math.sin(t * 6) * 14, a2: -100 } : { a1: 60, a2: 20 };
      kd.hold = t > T.dream && t < T.hen ? '' : `<g><path d="M-36,-10 Q0,-60 36,-10" stroke="#9B6A45" stroke-width="5" fill="none"/><path d="M-40,-10 L40,-10 L30,30 L-30,30 Z" fill="#E0B872" stroke="#B08040" stroke-width="3"/></g>`;
      out += who(t, kd);
      // Thought cloud full of imaginary chicks.
      const dk = between(t, T.dream, T.hen + 0.6, 0.7);
      if (dk > 0) {
        let th = `<circle cx="660" cy="660" r="10" fill="#fff"/><circle cx="690" cy="620" r="16" fill="#fff"/>
          <ellipse cx="780" cy="520" rx="170" ry="80" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
        [0, 1, 2].forEach(i => {
          const x = 700 + i * 80, y = 560 - Math.abs(Math.sin(t * 6 + i)) * 14;
          th += `<circle cx="${x}" cy="${f1(y - 30)}" r="26" fill="${C.gold}"/><circle cx="${x + 6}" cy="${f1(y - 36)}" r="4" fill="${C.dark}"/><path d="M${x + 22},${f1(y - 34)} l12,4 l-12,4 Z" fill="${C.peach}"/>`;
        });
        th += txt(780, 500, '3 chickens! 🤩', 28, C.dark, { w: 700 });
        out += scaleAt(700, 640, dk, th);
      }
      out += pill(EX, 1046, '“might be” is not “is”', C.purple, pop(t, T.final, 0.6), 24);
      return out;
    },

    // A roller coaster runs the ICC: CONFIRMED once the last hill is crested, but riders only board when the car comes back to the PIL platform.
    's15-coaster': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EEF0FB" opacity=".6"/>` + cloud(900 + (t * 12) % 200, 420, 0.6) + ground(1000, '#E9E3F3', '#D9CFE9');
      const P = [[60, 800], [300, 800], [470, 600], [600, 570], [760, 880], [900, 900], [1080, 470], [1200, 450], [1360, 800], [1880, 800]];
      const lens = [0]; for (let i = 1; i < P.length; i++) lens.push(lens[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      const at = d => { let i = 1; while (i < P.length - 1 && lens[i] < d) i++; const k = clamp((d - lens[i - 1]) / (lens[i] - lens[i - 1])); return { x: lerp(P[i - 1][0], P[i][0], k), y: lerp(P[i - 1][1], P[i][1], k), a: Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]) * 180 / Math.PI }; };
      const tk = ease(seg(t, T.track, T.track + 1.6));
      if (tk > 0) {
        let tr = '';
        for (let i = 1; i < P.length - 1; i++) tr += `<line x1="${P[i][0]}" y1="${P[i][1] + 10}" x2="${P[i][0]}" y2="1000" stroke="#C9C2DE" stroke-width="10"/>`;
        tr += `<polyline points="${P.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.purple}" stroke-width="12" stroke-linejoin="round" stroke-dasharray="${f1(lens[lens.length - 1] * tk)} 9999"/>`;
        tr += `<polyline points="${P.map(p => `${p[0]},${p[1] + 16}`).join(' ')}" fill="none" stroke="${C.purpleL}" stroke-width="6" stroke-linejoin="round" stroke-dasharray="${f1(lens[lens.length - 1] * tk)} 9999"/>`;
        out += tr;
      }
      // PIL line.
      const lk = ease(seg(t, T.track + 0.8, T.track + 2));
      if (lk > 0) out += `<line x1="40" x2="${f1(lerp(40, 1880, lk))}" y1="788" y2="788" stroke="${C.pink}" stroke-width="5" stroke-dasharray="14 10" opacity=".8"/>` + pill(150, 740, 'PIL', C.pink, pop(t, T.track + 1.6), 24);
      // Step labels along the ride.
      [['I', 520, 540, 0], ['C', 830, 950, 1], ['C', 990, 600, 2]].forEach(([l, x, y, i]) => { out += pill(x, y, l, [DK.teal, DK.pink, DK.teal][i], pop(t, T.steps[i], 0.5), 26); });
      // Boarding platform at PIL height.
      const pk = pop(t, T.track + 0.4, 0.7);
      let plat = `<rect x="1440" y="808" width="420" height="30" rx="6" fill="${C.muted}"/><rect x="1460" y="838" width="16" height="162" fill="${C.muted}"/><rect x="1820" y="838" width="16" height="162" fill="${C.muted}"/>
        <rect x="1440" y="560" width="420" height="40" rx="10" fill="${C.pink}"/>${txt(1650, 590, 'BOARDING', 24, '#fff', { ls: 4 })}<rect x="1450" y="600" width="12" height="208" fill="${C.pinkL}"/><rect x="1838" y="600" width="12" height="208" fill="${C.pinkL}"/>`;
      out += scaleAt(1650, 1000, pk, plat);
      // Car progress: run the ICC, pause at the top (confirmed), roll down to the platform (retest).
      const L = lens[lens.length - 1], crest = lens[7] - 50, stop = lens[8] + 240;
      let d = -1;
      if (t > T.depart) d = t < T.crest ? lerp(0, crest, seg(t, T.depart, T.crest)) : t < T.roll ? crest + Math.sin(t * 3) * 3 : lerp(crest, stop, ease(seg(t, T.roll, T.arrive)));
      if (d >= 0) {
        const c = at(d), bl = blinkAmt(t, 4);
        out += rotAt(c.x, c.y, c.a, `<g transform="translate(${f1(c.x)},${f1(c.y)})"><circle cx="-34" cy="-6" r="12" fill="${C.dark}"/><circle cx="34" cy="-6" r="12" fill="${C.dark}"/>
          <rect x="-66" y="-80" width="132" height="70" rx="20" fill="${C.teal}" stroke="${DK.teal}" stroke-width="5"/><rect x="-56" y="-72" width="12" height="54" rx="6" fill="#fff" opacity=".35"/>
          <circle cx="18" cy="-50" r="10" fill="#fff"/><circle cx="44" cy="-50" r="10" fill="#fff"/><ellipse cx="20" cy="-49" rx="5" ry="${f1(5 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="46" cy="-49" rx="5" ry="${f1(5 * (1 - bl * 0.9))}" fill="${C.dark}"/>
          <path d="M22,-32 Q32,-24 42,-32" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/></g>`);
      }
      // Status board.
      const conf = t > T.crest, exe = t > T.arrive;
      out += scaleAt(260, 640, pop(t, T.track + 0.6, 0.6), `<rect x="110" y="410" width="300" height="130" rx="18" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/>${txt(260, 450, 'STATUS', 18, C.muted, { ls: 3 })}`);
      if (pop(t, T.track + 0.6) >= 1) {
        const lab = exe ? 'EXECUTABLE' : conf ? 'CONFIRMED' : 'DEVELOPING', col = exe ? DK.teal : conf ? C.purple : C.gold;
        out += pill(260, 500, lab, col, pop(t, exe ? T.arrive : conf ? T.crest : T.depart, 0.5), 26);
        out += txt(260, 580, exe ? 'first valid retest ✓' : conf ? 'I · C · C closed · no retest yet' : 'still forming', 20, C.muted, { w: 700 });
      }
      // Gate + riders.
      const gate = ease(seg(t, T.arrive + 0.2, T.arrive + 0.9));
      out += fade(pk, `<rect x="${f1(1500 + gate * 120)}" y="700" width="${f1(140 - gate * 120)}" height="14" rx="7" fill="${C.gold}"/><rect x="1494" y="690" width="14" height="118" rx="6" fill="${C.dark}"/>`);
      const board = ease(seg(t, T.board, T.board + 1.2));
      const r1 = { x: lerp(1590, 1620, board), y: lerp(808, 760, board), scale: 0.62, look: A.LOOKS.c, seed: 2, flip: true, at: T.track + 1, talk: ctx.talking && t > T.itch && t < T.itch + 2 };
      r1.frontArm = t > T.itch && t < T.itch + 2.4 ? { a1: -150 + Math.sin(t * 8) * 10, a2: -150 } : { a1: 100, a2: 95 };
      if (t > T.board + 0.8) { r1.frontArm = { a1: -110 + Math.sin(t * 8) * 10, a2: -90 }; r1.backArm = { a1: -70, a2: -90 }; }
      out += who(t, r1);
      out += crit(t, 'dog', { x: lerp(1720, 1700, board), y: lerp(808, 770, board), scale: 0.6, flip: true, seed: 4, at: T.track + 1.3, tongue: t > T.arrive, hop: t > T.arrive ? 8 : 0, hopH: 14 });
      // Attendant.
      const at1 = { x: 1468, y: 808, scale: 0.62, look: A.LOOKS.e, seed: 7, at: T.track + 0.8, hat: 'cap', talk: ctx.talking && t > T.itch + 0.6 && t < T.roll };
      at1.frontArm = t > T.itch + 0.6 && t < T.roll ? { a1: -40, a2: -80 } : exe ? { a1: -130, a2: -120 } : { a1: 100, a2: 95 };
      out += who(t, at1);
      out += bub(1700, 470, 'Board now? 😬', between(t, T.itch, T.itch + 1.8), { size: 26 });
      out += bub(1380, 470, 'Not back yet! ✋', between(t, T.itch + 1.8, T.roll), { size: 26, tail: 'right' });
      if (exe) out += A.sparkle(1650, 740, T.arrive, t, C.teal) + pill(1650, 1046, 'back at the PIL: first valid retest', DK.teal, pop(t, T.arrive + 0.6), 24);
      return out;
    },
  });

  /* ================= Lesson 4: Confirmation vs Anticipation ================= */
  Object.assign(LIVE, {
    // An open candle spins like a flipped coin. The parrot calls it early (anticipation); the owl reads it once it lands (confirmation).
    's15-spin-call': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#F3EEFB" opacity=".6"/>` + ground(1000, '#F1E9F6', '#E0D3EC');
      // Bunting-free backdrop: a park with two round trees.
      out += fade(ease(seg(t, T.set - 0.2, T.set + 0.8)), `<rect x="150" y="740" width="22" height="260" fill="#9B6A45"/><circle cx="161" cy="700" r="90" fill="#B9DDB0"/><rect x="1840" y="760" width="20" height="240" fill="#9B6A45"/><circle cx="1850" cy="720" r="80" fill="#B9DDB0"/>`);
      // Landing pad.
      const pk = pop(t, T.set + 0.3, 0.6);
      out += scaleAt(960, 960, pk, `<ellipse cx="960" cy="968" rx="190" ry="34" fill="#fff" stroke="${C.purpleL}" stroke-width="6"/><ellipse cx="960" cy="964" rx="150" ry="22" fill="${C.purpleL}" opacity=".5"/>`);
      out += pill(960, 1040, 'CLOSE', C.purple, pk, 22);
      // The two flips.
      const flip = (t0, t1, final) => {
        if (t < t0) return null;
        if (t < t1) {
          const k = seg(t, t0, t1), y = 950 - Math.sin(k * Math.PI) * 380;
          const sx = Math.cos(t * 13), col = sx > 0 ? C.teal : C.pink;
          return { y, sx, col, spinning: true, k };
        }
        return { y: 950, sx: 1, col: final, spinning: false, k: 1 };
      };
      const f = t < T.flip2 - 0.4 ? flip(T.flip1, T.land1, C.pink) : flip(T.flip2, T.land2, C.teal);
      const gone = t > T.flip2 - 0.8 && t < T.flip2 ? seg(t, T.flip2 - 0.8, T.flip2 - 0.4) : 0;
      if (f) {
        const c = cdl(t, { x: 0, y: 0, h: 130, w: 74, col: f.col, wu: 26, seed: 3, mood: f.spinning ? 'wow' : undefined, arms: !f.spinning && f.col === C.teal ? 'cheer' : undefined });
        out += fade(1 - gone, `<g transform="translate(960,${f1(f.y)}) scale(${f1(Math.max(0.08, Math.abs(f.sx)))},1)">${c}</g>`);
        // A timer ring: the candle is still open until it lands.
        if (f.spinning) {
          const r = 120, cc = 2 * Math.PI * r;
          out += `<circle cx="960" cy="${f1(f.y - 90)}" r="${r}" fill="none" stroke="${C.purpleL}" stroke-width="8" opacity=".6"/><circle cx="960" cy="${f1(f.y - 90)}" r="${r}" fill="none" stroke="${C.purple}" stroke-width="8" stroke-dasharray="${f1(cc * f.k)} ${f1(cc)}" transform="rotate(-90 960 ${f1(f.y - 90)})"/>`;
          out += pill(960, f.y - 240, 'OPEN', C.gold, 1, 22);
        } else if (t > T.land1) {
          const lt = f.col === C.pink ? T.land1 : T.land2;
          out += A.sparkle(960, 860, lt, t, f.col === C.pink ? C.pink : C.teal);
        }
      }
      // Kid who flips the candle.
      const kd = { x: 520, y: 1000, scale: 0.95, look: A.LOOKS.c, seed: 6, at: T.set + 0.5, talk: false };
      const toss = Math.max(t > T.flip1 - 0.4 && t < T.flip1 + 0.6 ? 1 - Math.abs(t - T.flip1) / 0.6 : 0, t > T.flip2 - 0.4 && t < T.flip2 + 0.6 ? 1 - Math.abs(t - T.flip2) / 0.6 : 0);
      kd.frontArm = { a1: lerp(40, -60, toss), a2: lerp(0, -80, toss) };
      out += who(t, kd);
      // Parrot (anticipation) on a perch.
      const pr = pop(t, T.set + 0.8, 0.6);
      out += scaleAt(1360, 1000, pr, `<rect x="1352" y="760" width="16" height="240" fill="${C.muted}"/><rect x="1290" y="752" width="140" height="14" rx="7" fill="${C.muted}"/>`);
      out += crit(t, 'parrot', { x: 1340, y: 756, scale: 0.85, flip: true, seed: 2, at: T.set + 1, hop: t > T.squawk && t < T.land1 ? 9 : 0, hopH: 16, talk: ctx.talking && t > T.squawk && t < T.land1 });
      out += bub(1280, 520, "It's going green! 🚀", between(t, T.squawk, T.land1 + 0.2), { size: 28 });
      out += bub(1280, 520, 'Oops 🙈', between(t, T.land1 + 0.6, T.flip2 - 0.6), { size: 28 });
      out += pill(1360, 450, 'anticipation', C.pink, pop(t, T.squawk + 0.4), 22);
      // Owl (confirmation) on a post.
      const ok = pop(t, T.set + 1.1, 0.6);
      out += scaleAt(1660, 1000, ok, `<rect x="1610" y="820" width="100" height="180" rx="10" fill="#C98A5B"/>`);
      out += crit(t, 'owl', { x: 1660, y: 822, scale: 0.95, seed: 5, at: T.set + 1.3, monocle: true, talk: ctx.talking && t > T.owl && t < T.owl + 3 });
      out += bub(1700, 600, 'Wait for the close 🧐', between(t, T.owl, T.flip2 + 2), { size: 26, tail: 'right' });
      out += pill(1660, 1046, 'confirmation', DK.teal, pop(t, T.owl + 0.4), 22);
      // Payoffs.
      out += pill(960, 520, 'an open candle confirms nothing', C.pink, between(t, T.land1 + 0.4, T.flip2 - 0.4), 24);
      out += bstamp(760, 740, 'CLOSED ✓', DK.teal, ease(seg(t, T.stamp, T.stamp + 0.25)), -10, 80, 26);
      return out;
    },

    // Two keepers make the same save. A dived before the kick (a guess that worked); B waited and read the shot. Grade the process.
    's15-goalkeeper': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EAF6F2" opacity=".55"/>` + ground(960, '#BFE3B3', '#A9D69B');
      for (let i = 0; i < 10; i++) out += `<rect x="${i * 192}" y="964" width="96" height="116" fill="#B2DCA5" opacity=".7"/>`;
      const goal = (gx, k) => {
        let g = `<rect x="${gx - 280}" y="560" width="560" height="400" fill="#fff" opacity=".35"/>`;
        for (let x = gx - 280; x <= gx + 280; x += 40) g += `<line x1="${x}" y1="560" x2="${x}" y2="960" stroke="#fff" stroke-width="2.5" opacity=".9"/>`;
        for (let y = 560; y <= 960; y += 40) g += `<line x1="${gx - 280}" y1="${y}" x2="${gx + 280}" y2="${y}" stroke="#fff" stroke-width="2.5" opacity=".9"/>`;
        g += `<path d="M${gx - 290},962 L${gx - 290},552 L${gx + 290},552 L${gx + 290},962" fill="none" stroke="#fff" stroke-width="20" stroke-linejoin="round"/><path d="M${gx - 290},962 L${gx - 290},552 L${gx + 290},552 L${gx + 290},962" fill="none" stroke="#E2D6E8" stroke-width="4"/>`;
        return scaleAt(gx, 960, k, g);
      };
      const GA = 520, GB = 1400;
      out += goal(GA, pop(t, T.goals, 0.7)) + goal(GB, pop(t, T.goals + 0.3, 0.7));
      out += pill(GA, 500, 'KEEPER A', C.pink, pop(t, T.goals + 0.6), 22) + pill(GB, 500, 'KEEPER B', DK.teal, pop(t, T.goals + 0.9), 22);
      // A keeper who dives to the right at tDive.
      const keeper = (gx, tDive, look, seed, flip, mood) => {
        const d = ease(seg(t, tDive, tDive + 0.5));
        const lift = Math.sin(d * Math.PI * 0.5) * 120, ang = 45 * d;
        const p = { x: gx + 60 * d, y: 960 - lift, scale: 0.85, look, seed, at: T.goals + 0.5, mood };
        p.frontArm = d > 0 ? { a1: -90, a2: -90 } : { a1: -30 + Math.sin(t * 5 + seed) * 10, a2: -60 };
        p.backArm = d > 0 ? { a1: -100, a2: -90 } : { a1: -150 - Math.sin(t * 5 + seed) * 10, a2: -120 };
        p.hold = `<circle r="14" fill="${C.gold}"/>`;
        const k = pop(t, p.at, 0.6);
        return k <= 0 ? '' : scaleAt(gx, 960, k, rotAt(p.x, p.y, ang, A.person(t, p)));
      };
      const ball = (gx, tKick, tSave) => {
        if (t < tKick) return `<g transform="translate(${gx + 40},1040)">${ballSvg(1.2, 0)}</g>`;
        const k = ease(seg(t, tKick, tSave));
        let x = lerp(gx + 40, gx + 210, k), y = lerp(1040, 680, k), sc = lerp(1.2, 0.8, k);
        if (t > tSave) { const b = seg(t, tSave, tSave + 0.8); x = gx + 210 - b * 120; y = 680 + Math.sin(b * Math.PI) * -80 + b * 300; sc = 0.8; }
        return `<g transform="translate(${f1(x)},${f1(y)})">${ballSvg(sc, t * 400)}</g>`;
      };
      out += keeper(GA, T.diveA, A.LOOKS.b, 3, false, t > T.stampA ? 'sad' : undefined) + keeper(GB, T.diveB, A.LOOKS.a, 5, false);
      if (t > T.goals + 0.8) out += ball(GA, T.kickA, T.kickA + 0.6) + ball(GB, T.kickB, T.kickB + 0.6);
      // A dove before the ball moved.
      out += pill(GA + 40, 440, 'dived before the kick 🙈', C.pink, between(t, T.diveA + 0.2, T.grade), 22);
      out += pill(GB + 40, 440, 'waited, read it, moved', DK.teal, between(t, T.kickB + 0.4, T.grade), 22);
      // Outcome + process cards.
      const card = (gx, k, proc, ok) => k <= 0 ? '' : scaleAt(gx, 1010, k, `<rect x="${gx - 200}" y="976" width="400" height="88" rx="16" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
        ${txt(gx - 180, 1012, 'outcome', 18, C.muted, { a: 'start', ls: 2 })}${txt(gx + 180, 1012, 'SAVED ✓', 22, DK.teal, { a: 'end' })}
        ${txt(gx - 180, 1048, 'process', 18, C.muted, { a: 'start', ls: 2 })}${txt(gx + 180, 1048, proc, 22, ok ? DK.teal : DK.pink, { a: 'end' })}`);
      out += card(GA, pop(t, T.grade, 0.6), 'guessed ✗', false) + card(GB, pop(t, T.grade + 0.4, 0.6), 'read it ✓', true);
      out += bstamp(GA, 720, 'RULE BREAK', C.pink, ease(seg(t, T.stampA, T.stampA + 0.25)), -10, 100, 26);
      // Coach in the middle with a clipboard.
      const co = { x: 960, y: 1000, scale: 0.8, look: A.LOOKS.d, seed: 8, at: T.goals + 1.2, hat: 'cap', talk: ctx.talking && t > T.grade && t < T.grade + 3.6 };
      co.frontArm = { a1: 150, a2: 200 };
      co.hold = `<rect x="-24" y="-46" width="48" height="62" rx="6" fill="#C98A5B"/><rect x="-18" y="-38" width="36" height="48" rx="3" fill="#fff"/>`;
      out += who(t, co);
      out += bub(960, 470, 'Same save. Different process.', between(t, T.grade + 0.4, T.stampA + 3), { size: 26 });
      // Ball-boy dog and a crow on the crossbar.
      out += crit(t, 'dog', { x: 1810, y: 1040, scale: 0.6, flip: true, seed: 2, at: T.goals + 1.5, tongue: true, hop: t > T.kickB + 0.6 && t < T.kickB + 2.4 ? 10 : 0, hopH: 16 });
      out += crit(t, 'bird', { x: GA - 200, y: 548, scale: 0.7, seed: 4, at: T.goals + 1.8, col: '#8E89B8', talk: ctx.talking && t > T.stampA && t < T.stampA + 1.2 });
      return out;
    },
  });
  function ballSvg(sc, rot) {
    return `<g transform="scale(${f1(sc)}) rotate(${f1(rot % 360)})"><circle r="34" fill="#fff" stroke="${C.dark}" stroke-width="4"/><path d="M0,-12 L11,-4 L7,10 L-7,10 L-11,-4 Z" fill="${C.dark}"/>
      ${[0, 72, 144, 216, 288].map(a => `<path d="M${f1(Math.cos(rad(a - 90)) * 34)},${f1(Math.sin(rad(a - 90)) * 34)} L${f1(Math.cos(rad(a - 90)) * 22)},${f1(Math.sin(rad(a - 90)) * 22)}" stroke="${C.dark}" stroke-width="3"/>`).join('')}</g>`;
  }

  /* ================= Lesson 5: Timing the First Retest ================= */
  Object.assign(LIVE, {
    // An orchestra count-in: 1 (indication) WAIT, 2 (correction) WAIT, 3 (continuation closes) PREPARE, 4 (first valid retest) EXECUTE.
    // The cymbal cat wants to crash early; only beat four gets the crash.
    's15-conductor': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      // Stage: curtain sides and a wooden floor.
      const sk = ease(seg(t, T.stage - 0.2, T.stage + 0.8));
      if (sk > 0) {
        let st = `<rect x="0" y="560" width="1920" height="440" fill="#FBEFF3" opacity=".7"/><rect x="0" y="900" width="1920" height="180" fill="#E7C9A5"/>`;
        for (let x = 0; x < 1920; x += 120) st += `<line x1="${x}" y1="900" x2="${x - 40}" y2="1080" stroke="#D9B68E" stroke-width="3"/>`;
        st += `<path d="M0,360 L120,360 Q90,700 140,1000 L0,1000 Z" fill="${C.pink}"/><path d="M1920,360 L1800,360 Q1830,700 1780,1000 L1920,1000 Z" fill="${C.pink}"/>`;
        out += fade(sk, st);
      }
      // The count: four beat circles.
      const LAB = [['1', 'WAIT', 'indication', C.gold], ['2', 'WAIT', 'correction', C.gold], ['3', 'PREPARE', 'continuation closed', C.purple], ['4', 'EXECUTE', 'first valid retest', DK.teal]];
      const beat = T.b.filter(b => t >= b).length - 1;
      LAB.forEach(([n, st, sub, col], i) => {
        const x = 520 + i * 300, k = pop(t, T.b[i], 0.5), on = beat === i;
        const base = `<circle cx="${x}" cy="440" r="50" fill="#fff" stroke="#EADFD8" stroke-width="4" stroke-dasharray="8 8"/>${txt(x, 456, n, 40, '#D4C4B8', { f: 'Playfair Display' })}`;
        out += fade(sk, base);
        if (k <= 0) return;
        const pulse = on ? 1 + Math.max(0, 1 - (t - T.b[i]) / 0.4) * 0.15 : 1;
        out += scaleAt(x, 440, k * pulse, `<circle cx="${x}" cy="440" r="50" fill="${col}"/>${txt(x, 456, n, 40, '#fff', { f: 'Playfair Display' })}`);
        out += pill(x, 530, st, col, k, 24);
        out += fade(k, txt(x, 580, sub, 20, C.muted, { w: 700 }));
        if (i < 3 && t > T.b[i + 1]) out += fade(seg(t, T.b[i + 1], T.b[i + 1] + 0.4), `<path d="M${x + 64},440 L${x + 236},440" stroke="#EADFD8" stroke-width="5" stroke-dasharray="10 8"/>`);
      });
      // Podium + conductor.
      out += fade(sk, `<rect x="250" y="900" width="230" height="40" rx="8" fill="${C.purple}"/><rect x="270" y="940" width="190" height="60" fill="${DK.purple}"/>`);
      const cd = { x: 365, y: 902, scale: 0.92, look: A.LOOKS.e, seed: 3, at: T.stage + 0.3, talk: ctx.talking && t > T.itch && t < T.itch + 2 };
      const since = beat >= 0 ? t - T.b[beat] : 0;
      const bt = beat >= 0 ? Math.max(0, 1 - since / 0.5) : 0;
      cd.frontArm = t > T.itch && t < T.itch + 2.2 ? { a1: -20, a2: -80 } : { a1: -60 + bt * 50 + Math.sin(t * 3) * 6, a2: -40 + bt * 40 };
      cd.backArm = { a1: -140 + Math.sin(t * 3 + 1) * 8, a2: -160 };
      cd.hold = t > T.itch && t < T.itch + 2.2 ? '' : `<line x1="0" y1="0" x2="70" y2="-40" stroke="#fff" stroke-width="6" stroke-linecap="round"/><line x1="0" y1="0" x2="70" y2="-40" stroke="${C.dark}" stroke-width="2"/>`;
      out += who(t, cd);
      out += bub(470, 680, 'Not yet ✋', between(t, T.itch + 0.4, T.itch + 2.2), { size: 28 });
      // Musicians on chairs.
      const chair = (x) => `<rect x="${x - 50}" y="900" width="100" height="16" rx="6" fill="#9B6A45"/><rect x="${x - 44}" y="916" width="10" height="84" fill="#9B6A45"/><rect x="${x + 34}" y="916" width="10" height="84" fill="#9B6A45"/>`;
      const stand = (x) => `<line x1="${x}" y1="1000" x2="${x}" y2="790" stroke="${C.dark}" stroke-width="5"/><rect x="${x - 50}" y="740" width="100" height="60" rx="6" fill="#fff" stroke="${C.dark}" stroke-width="4"/>${[0, 1, 2].map(j => `<line x1="${x - 38}" y1="${756 + j * 16}" x2="${x + 38}" y2="${756 + j * 16}" stroke="${C.muted}" stroke-width="2"/>`).join('')}`;
      const mk = pop(t, T.stage + 0.6, 0.6);
      out += scaleAt(960, 1000, mk, chair(820) + chair(1180) + chair(1560) + stand(700) + stand(1060));
      // Mouse with a triangle (ting on every beat).
      const ting = bt;
      out += crit(t, 'mouse', { x: 820, y: 900, scale: 1.3, seed: 4, at: T.stage + 0.8 });
      if (mk >= 1) out += `<g transform="translate(900,${800 + Math.sin(t * 2) * 3}) rotate(${ting * 8})"><line x1="0" y1="-40" x2="0" y2="-10" stroke="${C.muted}" stroke-width="2"/><path d="M0,-10 L-30,40 L30,40 Z" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linejoin="round"/></g>`;
      // Robot with a drum.
      out += crit(t, 'robot', { x: 1180, y: 900, scale: 0.75, seed: 6, at: T.stage + 1, screen: beat >= 0 ? String(beat + 1) : '♪', col: C.purpleL });
      if (mk >= 1) out += `<g transform="translate(1260,${900 - ting * 6})"><rect x="-40" y="-70" width="80" height="70" rx="10" fill="${C.pink}"/><ellipse cx="0" cy="-70" rx="40" ry="12" fill="#fff" stroke="${DK.pink}" stroke-width="3"/><path d="M-30,-60 L30,-10 M30,-60 L-30,-10" stroke="${DK.pink}" stroke-width="3"/></g>`;
      // Cat with cymbals: itches to crash early, crashes on four.
      const crash = t > T.b[3] && t < T.b[3] + 0.6 ? 1 - seg(t, T.b[3], T.b[3] + 0.6) : 0;
      const itch = t > T.itch && t < T.itch + 2.2 ? 1 : 0;
      out += crit(t, 'cat', { x: 1560, y: 900, scale: 1.05, seed: 2, at: T.stage + 1.2, talk: ctx.talking && t > T.itch && t < T.itch + 1.2, hop: itch ? 10 : 0, hopH: 12 });
      if (mk >= 1) {
        const sep = itch ? 70 + Math.sin(t * 12) * 10 : crash > 0 ? 6 + (1 - crash) * 40 : t > T.b[2] ? 90 : 60;
        const cy = itch || t > T.b[2] ? 700 : 790;
        out += `<g transform="translate(1600,${cy})"><ellipse cx="${-sep}" cy="0" rx="14" ry="60" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/><ellipse cx="${sep}" cy="0" rx="14" ry="60" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/></g>`;
        if (crash > 0) out += `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${1600 + Math.cos(rad(i * 45)) * (60 + (1 - crash) * 40)}" y1="${700 + Math.sin(rad(i * 45)) * (60 + (1 - crash) * 40)}" x2="${1600 + Math.cos(rad(i * 45)) * (90 + (1 - crash) * 60)}" y2="${700 + Math.sin(rad(i * 45)) * (90 + (1 - crash) * 60)}" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>`).join('')}`;
        if (t > T.b[3]) out += A.sparkle(1600, 700, T.b[3], t) + A.sparkle(1400, 620, T.b[3] + 0.3, t, C.teal);
      }
      out += bub(1640, 560, 'Now?! 🥁', between(t, T.itch, T.itch + 1.6), { size: 28, tail: 'right' });
      // Floating notes once the music plays.
      if (t > T.b[0]) for (let i = 0; i < 6; i++) { const p = ((t - T.b[0]) * 0.35 + i / 6) % 1; out += `<text x="${f1(760 + i * 150 + Math.sin(p * 8 + i) * 20)}" y="${f1(720 - p * 100)}" font-size="34" fill="${[C.purple, C.pink, C.teal][i % 3]}" opacity="${f1(Math.sin(p * Math.PI) * 0.7)}">♪</text>`; }
      return out;
    },

    // Playing fetch: the catch line is the PIL. Too early (jumps while the ball is still going up), on model (catches it as it comes back), too late (chasing it).
    's15-fetch': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EDF7F1" opacity=".6"/>` + cloud(1500 - (t * 12) % 300, 430, 0.7) + ground(1000, '#D7EBC8', '#C3DFB0');
      // Catch line (the PIL).
      const lk = ease(seg(t, T.field, T.field + 1));
      if (lk > 0) out += `<line x1="1040" x2="${f1(lerp(1040, 1860, lk))}" y1="740" y2="740" stroke="${C.pink}" stroke-width="5" stroke-dasharray="14 10"/>` + pill(1790, 700, 'PIL', C.pink, pop(t, T.field + 0.8), 22);
      // Kid thrower.
      const R = T.rounds, r = R.filter(x => t >= x).length - 1;
      const t0 = r >= 0 ? R[r] : 1e9, u = t - t0;
      const kd = { x: 330, y: 1000, scale: 0.95, look: A.LOOKS.buyer, seed: 4, at: T.field + 0.2, talk: false };
      const throwK = u > -0.4 && u < 0.4 ? 1 - Math.abs(u) / 0.4 : 0;
      kd.frontArm = { a1: lerp(110, -70, throwK), a2: lerp(100, -60, throwK) };
      out += who(t, kd);
      // Ball path: (420,780) up to (980,420) back down to the line at (1400,740).
      const ballAt = k => ({ x: lerp(420, 1305, k), y: lerp(780, 745, k) - Math.sin(k * Math.PI) * 290 });
      const FL = 2.4;
      let ball = null, dog = { x: 1400, y: 1000, jump: 0, run: false, flip: true };
      if (r >= 0) {
        const k = u / FL;
        if (r === 0) { // too early
          const j = u > 0.6 && u < 1.4 ? Math.sin((u - 0.6) / 0.8 * Math.PI) : 0;
          dog.jump = j * 200;
          ball = k < 1 ? ballAt(k) : (() => { const b = Math.min(1, (u - FL) / 0.8); return { x: 1305 + b * 160, y: 745 + Math.abs(Math.sin(b * Math.PI * 1.5)) * -60 + b * 220 }; })();
        } else if (r === 1) { // on model
          const j = u > FL - 0.4 && u < FL + 0.4 ? Math.sin((u - FL + 0.4) / 0.8 * Math.PI) : 0;
          dog.jump = j * 155;
          ball = k < 1 ? ballAt(k) : null;
        } else { // too late
          const b = Math.max(0, u - FL);
          ball = k < 1 ? ballAt(k) : { x: 1305 + Math.min(b, 2.6) * 200, y: 960 - Math.abs(Math.sin(b * 5)) * 60 * Math.max(0, 1 - b / 1.6) };
          if (u > FL + 0.8) { dog.run = true; dog.flip = false; dog.x = 1400 + Math.min(u - FL - 0.8, 2.4) * 180; }
        }
      }
      const caught = r === 1 && u > FL;
      // Dog.
      const dk = pop(t, T.field + 0.5, 0.6);
      if (dk > 0) out += scaleAt(dog.x, 1000, dk, critter(t, 'dog', { x: dog.x, y: 1000 - dog.jump, scale: 1.05, flip: dog.flip, seed: 3, hop: dog.run ? 18 : 0, hopH: 18, tongue: !caught }));
      if (caught) ball = { x: dog.x - 98, y: 1000 - dog.jump - 80 };
      if (ball) out += `<g transform="translate(${f1(ball.x)},${f1(ball.y)})"><circle r="26" fill="${C.cash}" stroke="${C.cashD}" stroke-width="4"/><path d="M-20,-14 Q0,0 -20,14 M20,-14 Q0,0 20,14" stroke="#fff" stroke-width="3" fill="none"/></g>`;
      // Round label + verdict.
      const V = [['TOO EARLY', C.pink, false], ['ON MODEL', DK.teal, true], ['TOO LATE: chasing', C.pink, false]];
      if (r >= 0) {
        const [lab, col, good] = V[r];
        out += pill(1400, 470, `${r + 1} · ${lab}`, col, pop(t, t0 + 0.2, 0.5) * (r < 2 && t > R[r + 1] - 0.3 ? 1 - seg(t, R[r + 1] - 0.3, R[r + 1]) : 1), 28);
        const vt = t0 + FL + 0.3;
        out += good ? check(1560, 560, pop(t, vt, 0.5), C.teal, 34) : cross(1560, 560, pop(t, vt, 0.5), C.pink, 34);
        if (good && t > vt) out += A.sparkle(1300, 840, vt, t, C.teal);
      }
      // Bird judge with score cards on a fence post.
      const jk = pop(t, T.field + 0.8, 0.6);
      out += scaleAt(760, 1000, jk, `<rect x="730" y="860" width="60" height="140" fill="#E7C9A5"/>`);
      out += crit(t, 'bird', { x: 760, y: 862, scale: 1.1, seed: 5, at: T.field + 1, talk: ctx.talking && t > T.final && t < T.final + 1.4 });
      if (r >= 0 && t > t0 + FL + 0.4) { const [, col, good] = V[r]; out += scaleAt(800, 790, pop(t, t0 + FL + 0.4, 0.5), `<rect x="770" y="740" width="70" height="56" rx="8" fill="#fff" stroke="${col}" stroke-width="4"/>${txt(805, 780, good ? '10' : '0', 30, col)}`); }
      // Butterfly distraction in round 3.
      if (r === 2 && u < FL + 0.8) { const w = Math.abs(Math.sin(t * 16)); out += `<g transform="translate(${f1(1300 + Math.sin(t * 2) * 40)},${f1(900 + Math.cos(t * 3) * 20)})"><ellipse cx="-10" cy="0" rx="${f1(12 * w + 3)}" ry="12" fill="${C.purpleL}"/><ellipse cx="10" cy="0" rx="${f1(12 * w + 3)}" ry="12" fill="${C.pinkL}"/></g>`; }
      out += pill(960, 1046, 'execute as it comes back to the line', DK.teal, pop(t, T.final, 0.6), 24);
      return out;
    },
  });

  /* ================= Lesson 6: No Retest, No Chase ================= */
  Object.assign(LIVE, {
    // A surfer waits at her buoy (the retest spot). The wave takes off further out and never comes back; the seal yells "paddle!", she stays.
    's15-surf-line': (s, t, ctx) => {
      const T = s.beats;
      const WL = 760; // waterline
      let out = `<rect x="0" y="360" width="1920" height="${WL - 360}" fill="#EAF6FA" opacity=".7"/><circle cx="1620" cy="470" r="56" fill="${C.gold}" opacity=".8"/>` + cloud(380 + (t * 12) % 260, 440, 0.8) + cloud(1100 - (t * 8) % 200, 410, 0.55);
      const sk = ease(seg(t, T.sea - 0.2, T.sea + 0.8));
      // Sea.
      let sea = `<rect x="0" y="${WL - 40}" width="1920" height="${1080 - WL + 40}" fill="${C.tealL}"/><rect x="0" y="${WL - 40}" width="1920" height="10" fill="#fff" opacity=".5"/>`;
      for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = ((i * 240 + t * (20 + r * 10) + r * 90) % 2100) - 90, y = WL + 30 + r * 70; sea += `<path d="M${f1(x)},${y} q30,-14 60,0 q30,14 60,0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>`; }
      out += fade(sk, sea);
      // Next set on the horizon.
      if (t > T.next) { const k = ease(seg(t, T.next, T.next + 1.4)); for (let i = 0; i < 3; i++) { const x = 200 + i * 140 + Math.sin(t + i) * 10; out += `<path d="M${x - 60},${WL - 34} Q${x},${f1(WL - 34 - 30 * k)} ${x + 60},${WL - 34} Z" fill="${C.teal}" opacity=".7"/>`; } out += pill(340, WL - 110, 'another wave will come', DK.teal, pop(t, T.next + 0.6), 22); }
      // The swell: forms out to the right, races to shore without coming back.
      if (t > T.swell) {
        const h = 230 * ease(seg(t, T.swell, T.swell + 2)), x = lerp(1180, 2300, ease(seg(t, T.swell + 2.2, T.gone)));
        const y0 = WL + 10;
        out += `<path d="M${x - 300},${y0} Q${x - 130},${y0} ${x - 50},${f1(y0 - h)} Q${x + 30},${f1(y0 - h - 40)} ${x + 80},${f1(y0 - h + 30)} Q${x + 40},${f1(y0 - h + 10)} ${x + 30},${f1(y0 - h + 50)} Q${x + 90},${y0} ${x + 300},${y0} Z" fill="${C.teal}"/>
          <path d="M${x - 120},${f1(y0 - h * 0.5)} Q${x - 70},${f1(y0 - h * 0.9)} ${x - 30},${f1(y0 - h * 0.95)}" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
          ${[0, 1, 2, 3, 4].map(i => `<circle cx="${f1(x - 40 + i * 26)}" cy="${f1(y0 - h - 20 + Math.sin(t * 8 + i) * 6)}" r="${12 - i}" fill="#fff"/>`).join('')}`;
        // The gull rides it away.
        if (h > 120) out += critter(t, 'bird', { x: x - 60, y: y0 - h + 10, scale: 0.9, seed: 3, flip: false, col: '#fff' }) + `<ellipse cx="${f1(x - 60)}" cy="${f1(y0 - h + 14)}" rx="60" ry="10" fill="${C.pink}" transform="rotate(-14 ${f1(x - 60)} ${f1(y0 - h + 14)})"/>`;
        out += pill(Math.min(x, 1700), y0 - h - 90, 'no retest', C.pink, between(t, T.swell + 1.6, T.gone), 22);
      }
      // Buoy = the retest spot.
      const bk = pop(t, T.buoy, 0.6), by = WL + Math.sin(t * 2) * 6;
      out += scaleAt(560, WL, bk, `<g transform="rotate(${f1(Math.sin(t * 2 + 1) * 6)} 560 ${f1(by)})"><line x1="560" y1="${f1(by)}" x2="560" y2="${f1(by - 120)}" stroke="${C.dark}" stroke-width="5"/><path d="M560,${f1(by - 120)} L630,${f1(by - 104)} L560,${f1(by - 88)} Z" fill="${C.pink}"/>
        <path d="M520,${f1(by)} Q520,${f1(by - 50)} 560,${f1(by - 54)} Q600,${f1(by - 50)} 600,${f1(by)} Z" fill="${C.pink}"/><rect x="520" y="${f1(by - 34)}" width="80" height="12" fill="#fff"/></g>`);
      // Surfer sitting on her board, waist in the water.
      const sf = { x: 760, y: WL + 96 + Math.sin(t * 2) * 5, scale: 0.8, look: A.LOOKS.seller, seed: 2, flip: true, at: T.sea + 0.5, talk: ctx.talking && t > T.stay && t < T.stay + 2.4, mood: undefined };
      sf.frontArm = t > T.stay && t < T.stay + 2.4 ? { a1: -20, a2: -80 } : { a1: 60, a2: 80 };
      const sk2 = pop(t, sf.at, 0.6);
      if (sk2 > 0) {
        out += `<ellipse cx="760" cy="${f1(WL + 6 + Math.sin(t * 2) * 5)}" rx="150" ry="16" fill="${C.peach}" stroke="${DK.peach}" stroke-width="4"/>`;
        out += A.person(t, sf);
        out += `<rect x="560" y="${f1(WL + 12 + Math.sin(t * 2) * 5)}" width="400" height="140" fill="${C.tealL}"/><path d="M560,${f1(WL + 12 + Math.sin(t * 2) * 5)} q50,-10 100,0 q50,10 100,0 q50,-10 100,0 q50,10 100,0" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`;
      }
      out += pill(560, WL + 190, 'the retest spot', C.pink, pop(t, T.buoy + 0.4), 22);
      out += bub(820, 470, 'I wait for my spot 🏄‍♀️', between(t, T.stay, T.gone + 0.6), { size: 26, tail: 'right' });
      // Seal popping up, urging her to chase.
      const se = between(t, T.seal, T.gone + 0.4, 0.6);
      if (se > 0) {
        const sx = 1040, sy = WL + 50 - se * 40 + Math.sin(t * 3) * 4, bl = blinkAmt(t, 6), talk = ctx.talking ? Math.abs(Math.sin(t * 10)) : 0;
        out += `<g transform="translate(${sx},${f1(sy)})"><ellipse cx="0" cy="0" rx="46" ry="70" fill="#8E89B8"/><circle cx="0" cy="-58" r="40" fill="#8E89B8"/>
          <circle cx="-14" cy="-66" r="7" fill="${C.dark}"/><circle cx="14" cy="-66" r="${f1(7 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="0" cy="-48" rx="14" ry="9" fill="#B9B4DC"/><circle cx="0" cy="-52" r="5" fill="${C.dark}"/>
          <ellipse cx="0" cy="-36" rx="7" ry="${f1(2 + talk * 5)}" fill="#6B2A2A"/><path d="M-12,-46 l-26,-4 M-12,-42 l-26,4 M12,-46 l26,-4 M12,-42 l26,4" stroke="${C.dark}" stroke-width="2"/>
          <path d="M40,-10 Q${70 + Math.sin(t * 12) * 10},-50 80,-60" stroke="#8E89B8" stroke-width="16" fill="none" stroke-linecap="round"/></g>`;
        out += `<rect x="980" y="${WL + 20}" width="130" height="100" fill="${C.tealL}"/>`;
        out += bub(1140, 560, 'Paddle after it!! 🌊', between(t, T.seal + 0.2, T.stay + 0.4), { size: 28 });
      }
      out += pill(760, 1046, 'the move happened without you', C.purple, pop(t, T.sign, 0.6), 26);
      return out;
    },

    // The ice cream van rolls past without stopping. One kid lets it go (coins safe); one chases, past "market buy", "move the PIL", "random FVG", and trips.
    's15-ice-cream': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="520" fill="#FFF3EA" opacity=".6"/>` + cloud(600 + (t * 10) % 200, 420, 0.6);
      // Houses in the background.
      const hk = ease(seg(t, T.street - 0.2, T.street + 0.8));
      let bg = '';
      [[80, C.purpleL], [420, C.pinkL], [1180, C.tealL], [1540, C.peachL]].forEach(([x, col], i) => { bg += `<rect x="${x}" y="560" width="280" height="300" fill="${col}"/><path d="M${x - 20},570 L${x + 140},460 L${x + 300},570 Z" fill="${C.muted}" opacity=".6"/><rect x="${x + 40}" y="620" width="70" height="70" rx="8" fill="#fff" opacity=".8"/><rect x="${x + 170}" y="620" width="70" height="70" rx="8" fill="#fff" opacity=".8"/>`; });
      out += fade(hk, bg);
      out += `<rect x="0" y="860" width="1920" height="60" fill="#F1E5DA"/>` + A.road(920, { h: 160, shift: 0 });
      // Signposts the chaser runs past.
      const SG = [['market buy', 1000], ['move the PIL', 1250], ['random FVG', 1500]];
      SG.forEach(([lab, x], i) => {
        const k = pop(t, T.signs[i], 0.5);
        if (k <= 0) return;
        out += scaleAt(x, 870, k, `<rect x="${x - 6}" y="700" width="12" height="170" fill="${C.muted}"/><rect x="${x - 110}" y="650" width="220" height="60" rx="12" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${txt(x, 690, lab, 24, DK.pink)}`) + cross(x + 110, 650, pop(t, T.signs[i] + 0.3, 0.4), C.pink, 20);
      });
      // Bench + kid who lets it go.
      out += fade(hk, `<rect x="300" y="800" width="240" height="16" rx="6" fill="#9B6A45"/><rect x="300" y="760" width="240" height="14" rx="6" fill="#9B6A45"/><rect x="316" y="816" width="12" height="60" fill="#9B6A45"/><rect x="512" y="816" width="12" height="60" fill="#9B6A45"/>`);
      const ka = { x: 420, y: 880, scale: 0.8, look: A.LOOKS.d, seed: 3, at: T.street + 0.4, talk: ctx.talking && t > T.calm && t < T.calm + 3 };
      ka.frontArm = t > T.calm ? { a1: -60, a2: -110 } : { a1: 70, a2: 10 };
      ka.hold = `<g><rect x="-24" y="-30" width="48" height="36" rx="10" fill="${C.purple}"/><circle cx="0" cy="-30" r="8" fill="${C.gold}"/></g>`;
      out += who(t, ka);
      out += bub(420, 470, 'Missed it. Coins safe ✓', between(t, T.calm, s.end), { size: 26 });
      // The van.
      if (t > T.truck) {
        const k = seg(t, T.truck, T.pass), x = lerp(-300, 2300, k), dist = x;
        const jingle = Math.sin(t * 6);
        out += `<g transform="translate(${f1(x)},${f1(1010 + Math.sin(t * 9) * 2)})"><ellipse cx="0" cy="4" rx="200" ry="12" fill="${C.dark}" opacity=".08"/>
          <rect x="-190" y="-220" width="300" height="190" rx="22" fill="#fff" stroke="${C.pinkL}" stroke-width="6"/><path d="M110,-170 L170,-170 L200,-110 L200,-30 L110,-30 Z" fill="${C.pinkL}"/><path d="M122,-160 L162,-160 L184,-114 L122,-114 Z" fill="#E8F8F6"/>
          <rect x="-190" y="-90" width="300" height="20" fill="${C.pink}"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-190 + i * 50},-220 q25,30 50,0" fill="${[C.pink, C.teal][i % 2]}"/>`).join('')}
          <rect x="-150" y="-170" width="140" height="70" rx="10" fill="${C.peachL}"/>${txt(-80, -125, 'ICE CREAM', 22, DK.peach)}
          <g transform="translate(-40,-250) rotate(${f1(jingle * 6)})"><path d="M-24,0 L24,0 L0,60 Z" fill="${C.peach}"/><circle cx="-12" cy="-12" r="22" fill="${C.pinkL}"/><circle cx="14" cy="-14" r="22" fill="${C.tealL}"/><circle cx="0" cy="-34" r="20" fill="${C.cream}"/><circle cx="0" cy="-58" r="8" fill="${C.pink}"/></g>
          <circle cx="146" cy="-140" r="14" fill="#C68B62"/>
          ${[-110, 110].map(wx => `<g transform="translate(${wx},-30) rotate(${f1(dist * 2)})"><circle r="30" fill="${C.dark}"/><circle r="13" fill="#D9CFC8"/><rect x="-2.5" y="-27" width="5" height="27" fill="#D9CFC8"/></g>`).join('')}</g>`;
        if (k > 0 && k < 1) for (let i = 0; i < 3; i++) { const p = ((t * 0.8 + i / 3) % 1); out += `<text x="${f1(x - 40 + i * 30)}" y="${f1(700 - p * 120)}" font-size="34" fill="${C.purple}" opacity="${f1(Math.sin(p * Math.PI))}">♪</text>`; }
      }
      // Kid who chases.
      const run = seg(t, T.chase, T.trip), trip = ease(seg(t, T.trip, T.trip + 0.5));
      const kb = { x: lerp(760, 1560, run), y: 880, scale: 0.8, look: A.LOOKS.buyer, seed: 5, at: T.street + 0.6, walking: t > T.chase && t < T.trip, mood: t > T.trip ? 'sad' : undefined, talk: ctx.talking && t > T.chase && t < T.trip };
      kb.frontArm = t > T.chase && t < T.trip ? { a1: -40 + Math.sin(t * 9) * 30, a2: -60 } : { a1: 90, a2: 80 };
      const kbk = pop(t, kb.at, 0.6);
      if (kbk > 0) out += scaleAt(kb.x, 880, kbk, rotAt(kb.x, 880, trip * 70, A.person(t, kb)));
      out += bub(900, 500, 'Wait for me!! 🏃', between(t, T.chase, T.trip - 0.6), { size: 26 });
      // Coins spill when they trip.
      if (t > T.spill) {
        for (let i = 0; i < 7; i++) {
          const k = ease(seg(t, T.spill, T.spill + 0.8)), cx = 1640 + (i - 3) * 34 * k + i * 8, cy = 880 - Math.sin(k * Math.PI) * (60 + i * 8) + k * 30;
          out += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="14" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>`;
        }
        out += pill(1700, 520, 'chasing can cost you', C.pink, pop(t, T.spill + 0.6), 24);
      }
      // A pigeon pecking up the spilled coins.
      out += crit(t, 'bird', { x: lerp(1960, 1880, ease(seg(t, T.pigeon, T.pigeon + 1))), y: 912, scale: 0.9, seed: 8, flip: true, at: T.pigeon, col: '#B9B4DC' });
      out += pill(420, 560, 'missed ≠ lost', DK.teal, pop(t, T.calm + 0.4), 24);
      return out;
    },
  });

  /* ================= Lesson 7: Being Right About Direction vs Being Right About the Trade ================= */
  Object.assign(LIVE, {
    // A driving test: A rolls through the STOP sign and still arrives (win, fail). B stops properly and hits a closed road (loss, pass).
    's15-driving-test': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#F2F7EC" opacity=".6"/>` + cloud(1300 + (t * 10) % 200, 420, 0.7) + ground(960, '#DDEBCB', '#C9DDB2');
      const rk = ease(seg(t, T.course - 0.2, T.course + 0.8));
      const LA = 670, LB = 960; // road bottoms
      if (rk > 0) {
        out += fade(rk, A.road(LA - 110, { h: 110 }) + A.road(LB - 120, { h: 120 }));
        out += pill(60, LA - 55, 'A', C.pink, rk, 26) + pill(60, LB - 60, 'B', DK.teal, rk, 26);
      }
      // STOP signs.
      const stop = (x, y, k, ph) => k <= 0 ? '' : scaleAt(x, y, k, `<rect x="${x - 5}" y="${y - ph}" width="10" height="${ph}" fill="${C.muted}"/><g transform="translate(${x},${y - ph - 38})"><path d="M-17,-40 L17,-40 L40,-17 L40,17 L17,40 L-17,40 L-40,17 L-40,-17 Z" fill="${C.pink}" stroke="#fff" stroke-width="4"/>${txt(0, 8, 'STOP', 22, '#fff')}</g>`);
      out += stop(900, LA - 110, pop(t, T.course + 0.5, 0.6), 100) + stop(900, LB - 120, pop(t, T.course + 0.7, 0.6), 40);
      // Finish flag across both lanes.
      const fk = pop(t, T.course + 0.9, 0.6);
      if (fk > 0) {
        let fl = `<rect x="1700" y="430" width="12" height="530" fill="${C.dark}"/>`;
        const wave = Math.sin(t * 5) * 6;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) fl += `<rect x="${1712 + c * 26}" y="${f1(432 + r * 26 + Math.sin(t * 5 + c) * 4)}" width="26" height="26" fill="${(r + c) % 2 ? '#fff' : C.dark}"/>`;
        out += scaleAt(1706, 960, fk, fl + `<text x="1764" y="534" font-size="20" font-weight="900" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">FINISH</text>`);
      }
      // Roadblock in lane B.
      const bk = pop(t, T.goB + 1, 0.5);
      out += scaleAt(1420, LB, bk, `<rect x="1360" y="${LB - 90}" width="140" height="22" rx="6" fill="${C.peach}"/>${[0, 1, 2, 3].map(i => `<rect x="${1366 + i * 34}" y="${LB - 90}" width="16" height="22" fill="#fff"/>`).join('')}<rect x="1370" y="${LB - 68}" width="10" height="68" fill="${C.muted}"/><rect x="1480" y="${LB - 68}" width="10" height="68" fill="${C.muted}"/>
        <path d="M1520,${LB} L1540,${LB - 60} L1560,${LB} Z" fill="${C.peach}"/><rect x="1526" y="${LB - 30}" width="28" height="8" fill="#fff"/>`);
      // Cars.
      const xA = t < T.goA ? 200 : lerp(200, 1600, ease(seg(t, T.goA, T.goA + 4)));
      const movingA = t > T.goA && t < T.goA + 4;
      let xB = 200;
      if (t > T.goB) xB = lerp(200, 760, ease(seg(t, T.goB, T.goB + 1.6)));
      if (t > T.goB + 3.4) xB = lerp(760, 1260, ease(seg(t, T.goB + 3.4, T.goB + 5)));
      const movingB = (t > T.goB && t < T.goB + 1.6) || (t > T.goB + 3.4 && t < T.goB + 5);
      const ck = pop(t, T.course + 0.4, 0.6);
      out += scaleAt(xA, LA, ck, A.vehicle('car', { x: xA, y: LA - 4, dist: xA, t, moving: movingA, scale: 0.85 }));
      out += scaleAt(xB, LB, ck, A.vehicle('gold', { x: xB, y: LB - 4, dist: xB, t, moving: movingB, scale: 0.85 }));
      // Speed lines and verdict bits.
      if (movingA) out += [0, 1, 2].map(i => `<line x1="${f1(xA - 120 - i * 10)}" y1="${LA - 60 + i * 18}" x2="${f1(xA - 180 - i * 20)}" y2="${LA - 60 + i * 18}" stroke="${C.muted}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`).join('');
      out += pill(1090, LA - 260, 'rolled the stop 🙈', C.pink, between(t, T.goA + 1.8, T.grade), 22);
      out += pill(1060, LB - 210, 'full stop ✓', DK.teal, between(t, T.goB + 1.8, T.grade), 22);
      if (t > T.goA + 4) out += A.sparkle(1620, LA - 120, T.goA + 4, t);
      out += cross(1300, LB - 190, between(t, T.goB + 5, T.grade), C.pink, 22) + (t > T.goB + 5 && t < T.grade ? pill(1300, LB - 240, 'road closed', C.muted, pop(t, T.goB + 5), 20) : '');
      // Grades.
      const gA = pop(t, T.grade, 0.6), gB = pop(t, T.grade + 0.6, 0.6);
      out += pill(500, LA - 200, 'outcome: WIN · process: ✗', C.pink, gA, 24);
      out += pill(500, LB - 200, 'outcome: LOSS · process: ✓', DK.teal, gB, 24);
      out += bstamp(1450, LA - 190, 'FAIL', C.pink, ease(seg(t, T.stamp, T.stamp + 0.25)), -12, 56, 26);
      out += bstamp(1240, LB - 210, 'PASS', DK.teal, ease(seg(t, T.stamp + 0.8, T.stamp + 1.05)), 10, 56, 26);
      // Squirrel at the finish with a flag; examiner with a clipboard.
      out += crit(t, 'squirrel', { x: 1630, y: 1010, scale: 0.9, seed: 3, at: T.course + 1.2, hop: t > T.goA + 4 && t < T.goA + 6 ? 9 : 0, hopH: 24 });
      out += bub(1560, 420, 'Made it! 🎉', between(t, T.goA + 4, T.grade), { size: 26 });
      const ex = { x: 1830, y: 1000, scale: 0.82, look: A.LOOKS.e, seed: 6, flip: true, at: T.course + 1.4, talk: ctx.talking && t > T.grade && t < T.grade + 3, hat: 'shades' };
      ex.frontArm = { a1: 150, a2: 200 };
      ex.hold = `<rect x="-24" y="-46" width="48" height="62" rx="6" fill="#C98A5B"/><rect x="-18" y="-38" width="36" height="48" rx="3" fill="#fff"/>${t > T.grade ? `<path d="M-10,-24 l6,6 l12,-14" stroke="${C.teal}" stroke-width="4" fill="none"/>` : ''}`;
      out += who(t, ex);
      // Duck waddling along the verge.
      out += crit(t, 'duck', { x: 300 + ((t - T.course) * 30) % 500, y: 1050, scale: 0.7, seed: 4, at: T.course + 1.6 });
      return out;
    },

    // A puppy jumps on the table and gets the sausage: the rule break "wins", so the habit grows. The journal grades process, not the prize.
    's15-dog-treat': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#FFF6EE" opacity=".7"/>`;
      // Kitchen: tiles, window, table.
      const kk = ease(seg(t, T.kitchen - 0.2, T.kitchen + 0.8));
      let kit = `<rect x="0" y="880" width="1920" height="200" fill="#F1E5DA"/>`;
      for (let x = 0; x < 1920; x += 80) kit += `<rect x="${x}" y="880" width="78" height="78" fill="${(x / 80) % 2 ? '#F6EDE6' : '#EADFD8'}"/><rect x="${x + 40}" y="960" width="78" height="78" fill="${(x / 80) % 2 ? '#EADFD8' : '#F6EDE6'}"/>`;
      kit += `<rect x="1180" y="420" width="220" height="180" rx="12" fill="#E8F4FA" stroke="#9B6A45" stroke-width="10"/><line x1="1290" y1="420" x2="1290" y2="600" stroke="#9B6A45" stroke-width="6"/><line x1="1180" y1="510" x2="1400" y2="510" stroke="#9B6A45" stroke-width="6"/>
        <rect x="760" y="740" width="400" height="22" rx="8" fill="#C98A5B"/><rect x="790" y="762" width="18" height="118" fill="#9B6A45"/><rect x="1112" y="762" width="18" height="118" fill="#9B6A45"/>
        <rect x="770" y="728" width="380" height="14" rx="6" fill="${C.pinkL}"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${780 + i * 76}" y="728" width="38" height="14" fill="#fff" opacity=".7"/>`).join('')}`;
      // Fridge with a cat on top.
      kit += `<rect x="1460" y="560" width="200" height="320" rx="16" fill="#fff" stroke="#E2D6E8" stroke-width="5"/><line x1="1460" y1="680" x2="1660" y2="680" stroke="#E2D6E8" stroke-width="5"/><rect x="1630" y="600" width="10" height="50" rx="5" fill="${C.muted}"/><rect x="1630" y="710" width="10" height="70" rx="5" fill="${C.muted}"/>`;
      out += fade(kk, kit);
      out += crit(t, 'cat', { x: 1560, y: 562, scale: 0.75, seed: 3, at: T.kitchen + 0.8, talk: ctx.talking && t > T.again[0] && t < T.again[0] + 2 });
      out += bub(1470, 380 + 30, "He'll do it again 😼", between(t, T.again[0], T.journal - 0.2), { size: 24, tail: 'right' });
      // Plate + sausage.
      const grabbed = t > T.grab;
      out += fade(kk, `<ellipse cx="960" cy="726" rx="80" ry="14" fill="#fff" stroke="#E2D6E8" stroke-width="3"/>`);
      if (!grabbed && kk > 0) out += `<rect x="910" y="702" width="100" height="26" rx="13" fill="#C2475F"/><path d="M920,712 L1000,712" stroke="#F4829A" stroke-width="3"/>`;
      // Puppy path: floor (560) → table (960) → floor (1340).
      let dx = 560, dy = 880, eating = false, ghosts = '';
      if (t > T.jump) {
        const k = seg(t, T.jump, T.land);
        if (k < 1) { dx = lerp(560, 1340, k); dy = lerp(880, 880, k) - Math.sin(k * Math.PI) * 260; }
        else { dx = 1340; dy = 880; eating = true; }
      }
      // Habit ghosts: the jump repeats.
      T.again.forEach((a, i) => {
        if (t < a) return;
        const k = seg(t, a, a + 1.2), op = 0.5 * (1 - seg(t, a + 1.4, a + 2.4));
        if (op <= 0) return;
        const gx = lerp(560, 1340, k), gy = 880 - Math.sin(k * Math.PI) * 260;
        ghosts += `<g opacity="${f1(op)}">${critter(t, 'dog', { x: gx, y: gy, scale: 0.85, seed: 5 + i, col: C.peachL, ear: C.peach })}</g>`;
        ghosts += pill(gx, gy - 190, 'again', C.peach, op * 2, 20);
      });
      out += ghosts;
      const pk = pop(t, T.kitchen + 0.6, 0.6);
      if (pk > 0) out += scaleAt(dx, dy, pk, critter(t, 'dog', { x: dx, y: dy, scale: 0.95, seed: 2, hop: eating ? 6 : 0, hopH: 8, talk: false, tongue: !eating }) + (grabbed ? `<rect x="${f1(dx + 70)}" y="${f1(dy - 82)}" width="${eating ? f1(70 - seg(t, T.land, T.land + 3) * 40) : 70}" height="20" rx="10" fill="#C2475F"/>` : ''));
      // Lightbulb thought: "jumping works".
      const tk = between(t, T.think, T.journal - 0.4, 0.6);
      if (tk > 0) out += scaleAt(1340, 640, tk, `<circle cx="1300" cy="740" r="8" fill="#fff"/><circle cx="1280" cy="700" r="12" fill="#fff"/><ellipse cx="1240" cy="620" rx="160" ry="56" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(1240, 632, 'Jumping works! 💡', 28, C.dark, { w: 700 })}`);
      // Trainer.
      const tr = { x: 330, y: 1000, scale: 0.95, look: A.LOOKS.a, seed: 4, at: T.kitchen + 0.3, talk: ctx.talking && t > T.journal, mood: t > T.grab && t < T.journal ? 'sad' : undefined };
      tr.frontArm = t > T.grab && t < T.think + 1 ? { a1: -60, a2: -120 } : t > T.journal ? aim(tr, 560, 640) : { a1: 140, a2: 60 };
      tr.backArm = { a1: 40, a2: 140 };
      out += who(t, tr);
      out += bub(380, 560, 'Hey! 😳', between(t, T.grab, T.think + 0.6), { size: 28 });
      // The journal card.
      const jk = pop(t, T.journal, 0.7);
      if (jk > 0) {
        let j = `<rect x="470" y="400" width="440" height="300" rx="20" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/><rect x="470" y="400" width="440" height="56" rx="20" fill="${C.purple}"/><rect x="470" y="436" width="440" height="20" fill="${C.purple}"/>${txt(690, 438, 'TRADE JOURNAL', 24, '#fff', { ls: 3 })}`;
        const rows = [['outcome', 'WIN 🌭', C.gold], ['rule broken', 'jumped early', DK.pink], ['process grade', '✗', DK.pink]];
        rows.forEach(([a, b, col], i) => { const k = pop(t, T.rows[i], 0.5), y = 510 + i * 66; j += `<line x1="500" y1="${y + 26}" x2="880" y2="${y + 26}" stroke="#EADFD8" stroke-width="3"/>${txt(500, y + 6, a, 22, C.muted, { a: 'start', w: 700 })}` + fade(k, txt(880, y + 8, b, 26, col, { a: 'end' })); });
        out += scaleAt(690, 700, jk, j);
      }
      out += pill(960, 1046, 'grade the process, never the P&amp;L', C.purple, pop(t, T.final, 0.6), 24);
      return out;
    },
  });

  /* ================= Lesson 8: When the Best Entry Is No Entry ================= */
  Object.assign(LIVE, {
    // A batter takes three pitches outside the zone: PASS (PIL unclear), WAIT (no indication), NO TRADE (no retest). No swing, perfect at-bat.
    's15-batter': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#EEF6EA" opacity=".6"/>` + cloud(700 + (t * 10) % 200, 420, 0.6);
      const fk = ease(seg(t, T.field - 0.2, T.field + 0.8));
      // Outfield wall + grass + dirt.
      let fd = `<rect x="0" y="600" width="1920" height="60" fill="${DK.teal}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${60 + i * 240}" y="612" width="120" height="36" rx="6" fill="${C.tealL}" opacity=".5"/>`).join('')}
        <rect x="0" y="660" width="1920" height="420" fill="#BFE3B3"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${i * 192}" y="660" width="96" height="420" fill="#B2DCA5" opacity=".6"/>`).join('')}
        <ellipse cx="1330" cy="960" rx="260" ry="50" fill="#E3BE93"/><ellipse cx="430" cy="990" rx="380" ry="70" fill="#E3BE93"/><path d="M705,990 l30,-14 l30,14 l-30,14 Z" fill="#fff"/>`;
      out += fade(fk, fd);
      // Strike zone.
      const zk = pop(t, T.field + 0.6, 0.6);
      out += scaleAt(735, 760, zk, `<rect x="660" y="640" width="150" height="190" rx="10" fill="${C.teal}" opacity=".12" stroke="${DK.teal}" stroke-width="4" stroke-dasharray="12 8"/>`);
      out += pill(735, 610, 'the model', DK.teal, zk, 20);
      // Scoreboard of outputs.
      const sb = pop(t, T.field + 0.9, 0.6);
      if (sb > 0) {
        let b = `<rect x="1460" y="380" width="420" height="230" rx="18" fill="${C.dark}"/>${txt(1670, 420, 'OUTPUT', 20, C.gold, { ls: 4 })}`;
        const rows = [['PASS', 'PIL unclear', C.pinkL], ['WAIT', 'no indication', C.gold], ['NO TRADE', 'no retest', C.purpleL]];
        rows.forEach(([a, b2, col], i) => { const k = pop(t, T.pitches[i] + 1.1, 0.5); if (k > 0) b += fade(k, `${txt(1490, 470 + i * 48, a, 24, col, { a: 'start' })}${txt(1850, 470 + i * 48, b2, 22, '#fff', { a: 'end', w: 700 })}`); });
        out += scaleAt(1670, 495, sb, b);
      }
      // Pitches.
      const PATH = [[[1290, 740], [800, 540], [390, 690]], [[1290, 740], [800, 960], [390, 930]], [[1290, 740], [900, 1010], [390, 890]]];
      let mittY = 830;
      T.pitches.forEach((p0, i) => {
        if (t < p0 + 0.3 || t > p0 + 3.6) return;
        const k = seg(t, p0 + 0.3, p0 + 1.2), [a, m, b] = PATH[i];
        const x = (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * m[0] + k * k * b[0], y = (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * m[1] + k * k * b[1];
        if (k >= 1) mittY = b[1];
        else mittY = lerp(830, b[1], k);
        out += `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(t * 600)})"><circle r="18" fill="#fff" stroke="#E2D6E8" stroke-width="2"/><path d="M-8,-14 Q-2,0 -8,14 M8,-14 Q2,0 8,14" stroke="${C.pink}" stroke-width="2.5" fill="none"/></g>`;
        if (k < 1) out += `<line x1="${f1(x + 30)}" y1="${f1(y)}" x2="${f1(x + 90)}" y2="${f1(y)}" stroke="#fff" stroke-width="4" opacity=".6"/>`;
        out += pill(735, 520, ['PASS · PIL unclear', 'WAIT · no indication', 'NO TRADE · no retest'][i], [C.pink, DK.peach, C.purple][i], between(t, p0 + 1.1, p0 + 3.4), 24);
      });
      // Pitcher on the mound.
      const pc = { x: 1330, y: 950, scale: 0.9, look: A.LOOKS.c, seed: 4, flip: true, at: T.field + 0.4, hat: 'cap' };
      const wind = Math.max(0, ...T.pitches.map(p => t > p - 0.6 && t < p + 0.6 ? 1 - Math.abs(t - p - 0.1) / 0.6 : 0));
      pc.frontArm = { a1: lerp(110, -150, wind), a2: lerp(90, -170, wind) };
      out += who(t, pc);
      // Catcher dog with a mitt, umpire owl behind.
      out += crit(t, 'owl', { x: 170, y: 990, scale: 0.9, seed: 7, at: T.field + 1, talk: ctx.talking && t > T.final && t < T.final + 1.4 });
      out += crit(t, 'dog', { x: 300, y: 990, scale: 0.9, seed: 2, at: T.field + 0.8, tongue: true, hop: mittY < 780 ? 6 : 0, hopH: 30 });
      if (pop(t, T.field + 0.8) >= 1) out += `<g transform="translate(390,${f1(mittY + Math.sin(t * 3) * 3)})"><ellipse rx="34" ry="30" fill="#B86E12"/><ellipse rx="20" ry="16" fill="#E08E2E"/></g>`;
      // Batter: bat ready, never swings.
      const bt = { x: 560, y: 990, scale: 0.95, look: A.LOOKS.b, seed: 5, at: T.field + 0.5, hat: 'cap', talk: ctx.talking && t > T.final && t < T.final + 2.4 };
      bt.frontArm = { a1: -110 + Math.sin(t * 2) * 4, a2: -140 };
      bt.backArm = { a1: -120, a2: -150 };
      bt.hold = `<g transform="rotate(${f1(-60 + Math.sin(t * 2) * 4)})"><rect x="-8" y="-150" width="16" height="150" rx="8" fill="#C98A5B"/><rect x="-11" y="-150" width="22" height="80" rx="11" fill="#C98A5B"/></g>`;
      out += who(t, bt);
      // Payoff.
      out += bub(740, 470, 'No swing. Perfect at-bat ✓', between(t, T.final, s.end), { size: 26 });
      if (t > T.final) out += A.sparkle(735, 700, T.final, t, C.teal);
      out += pill(960, 1046, 'swings: 0 · rules broken: 0', DK.teal, pop(t, T.final + 0.6), 24);
      return out;
    },

    // End of a session at home. A FOMO gremlin whispers "it's leaving!"; she asks "model complete, or afraid?", closes the laptop. Zero trades, perfect session.
    's15-session-close': (s, t, ctx) => {
      const T = s.beats;
      const night = ease(seg(t, T.answer, T.close + 1));
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FBF3EE" opacity=".7"/>`;
      // Wall, window with day → dusk → night.
      const rk = ease(seg(t, T.room - 0.2, T.room + 0.8));
      const skyCol = night > 0.5 ? '#3D3550' : night > 0 ? '#F5A857' : '#CFE9F5';
      let room = `<rect x="0" y="900" width="1920" height="180" fill="#E7C9A5"/><rect x="0" y="896" width="1920" height="8" fill="#C98A5B"/>
        <rect x="1240" y="410" width="420" height="300" rx="14" fill="${skyCol}" stroke="#fff" stroke-width="14"/><line x1="1450" y1="410" x2="1450" y2="710" stroke="#fff" stroke-width="10"/>`;
      if (night > 0.5) room += `<circle cx="1560" cy="490" r="34" fill="#FFF3C4"/><circle cx="1576" cy="480" r="30" fill="#3D3550"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${1280 + i * 70}" cy="${460 + (i * 37) % 120}" r="${3 + (Math.sin(t * 3 + i) + 1) * 1.5}" fill="#fff"/>`).join('')}`;
      else room += `<circle cx="${f1(1340 + night * 80)}" cy="${f1(480 + night * 160)}" r="40" fill="${C.gold}"/>`;
      // Wall clock spinning through the session.
      const prog = seg(t, T.room, T.close);
      room += `<circle cx="1110" cy="470" r="56" fill="#fff" stroke="${C.purple}" stroke-width="8"/><line x1="1110" y1="470" x2="${f1(1110 + Math.sin(prog * Math.PI * 2 * 6) * 40)}" y2="${f1(470 - Math.cos(prog * Math.PI * 2 * 6) * 40)}" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/><line x1="1110" y1="470" x2="${f1(1110 + Math.sin(prog * Math.PI) * 26)}" y2="${f1(470 - Math.cos(prog * Math.PI) * 26)}" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/><circle cx="1110" cy="470" r="7" fill="${C.pink}"/>`;
      room += `<rect x="560" y="760" width="760" height="24" rx="8" fill="#9B6A45"/><rect x="590" y="784" width="20" height="116" fill="#9B6A45"/><rect x="1270" y="784" width="20" height="116" fill="#9B6A45"/>`;
      out += fade(rk, room);
      // Laptop with a little chart (closes at T.close).
      const lid = ease(seg(t, T.close, T.close + 0.7));
      if (rk > 0) {
        const h = 165 * (1 - lid);
        out += `<rect x="760" y="748" width="320" height="14" rx="6" fill="${C.muted}"/>`;
        if (h > 4) {
          out += `<rect x="780" y="${f1(750 - h)}" width="280" height="${f1(h)}" rx="10" fill="${C.dark}"/><rect x="792" y="${f1(760 - h)}" width="256" height="${f1(Math.max(0, h - 22))}" rx="6" fill="#fff"/>`;
          if (h > 100) {
            const bars = [[.3, .4], [.4, .48], [.48, .44], [.44, .5], [.5, .46], [.46, .52], [.52, .5]];
            bars.forEach(([o, c], i) => { const x = 816 + i * 32, y0 = 750 - h + 30, hh = h - 60; const up = c > o; out += `<rect x="${x}" y="${f1(y0 + hh - Math.max(o, c) * hh)}" width="16" height="${f1(Math.max(4, Math.abs(c - o) * hh))}" rx="3" fill="${up ? C.teal : C.pink}"/>`; });
            out += `<line x1="800" x2="1040" y1="${f1(750 - h + 30 + (h - 60) * 0.45)}" y2="${f1(750 - h + 30 + (h - 60) * 0.45)}" stroke="${C.purple}" stroke-width="3" stroke-dasharray="8 6"/>`;
          }
        } else out += `<rect x="780" y="736" width="280" height="14" rx="6" fill="${C.dark}"/>`;
      }
      // Cat on the desk, curling up to sleep after close.
      out += crit(t, 'cat', { x: 1180, y: 760, scale: 0.8, seed: 4, at: T.room + 0.8, sleep: t > T.close + 0.8 });
      // Trader.
      const tr = { x: 560, y: 1000, scale: 1, look: A.LOOKS.a, seed: 3, at: T.room + 0.4, talk: ctx.talking && t > T.question && t < T.close, mood: undefined };
      tr.frontArm = t > T.close - 0.4 && t < T.close + 0.8 ? aim(tr, 900, 600 + lid * 140) : t > T.question && t < T.answer ? { a1: -60, a2: -130 } : aim(tr, 780, 740);
      out += who(t, tr);
      // FOMO gremlin on her shoulder.
      const gk = between(t, T.gremlin, T.answer, 0.5);
      if (gk > 0 || (t > T.answer && t < T.answer + 0.8)) {
        const poof = t > T.answer ? seg(t, T.answer, T.answer + 0.8) : 0;
        if (poof > 0) out += [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${f1(400 + Math.cos(i) * 50 * (1 + poof))}" cy="${f1(620 + Math.sin(i) * 40 * (1 + poof))}" r="${f1(24 * (1 - poof))}" fill="#E2D6E8"/>`).join('');
        else {
          const jit = Math.sin(t * 20) * 3, talk = ctx.talking ? Math.abs(Math.sin(t * 12)) : 0;
          out += scaleAt(410, 680, gk, `<g transform="translate(${f1(410 + jit)},640)"><ellipse cx="0" cy="0" rx="40" ry="44" fill="${C.cash}"/><path d="M-30,-30 L-46,-66 L-12,-40 Z M30,-30 L46,-66 L12,-40 Z" fill="${C.cash}"/>
            <circle cx="-14" cy="-8" r="11" fill="#fff"/><circle cx="14" cy="-8" r="11" fill="#fff"/><circle cx="-12" cy="-6" r="6" fill="${C.dark}"/><circle cx="16" cy="-6" r="6" fill="${C.dark}"/>
            <ellipse cx="0" cy="20" rx="12" ry="${f1(4 + talk * 8)}" fill="#6B2A2A"/><path d="M-38,10 L-60,${f1(-20 + Math.sin(t * 14) * 10)} M38,10 L60,${f1(-20 - Math.sin(t * 14) * 10)}" stroke="${C.cashD}" stroke-width="7" stroke-linecap="round"/></g>`);
          out += bub(300, 500, "It's leaving!! Get in!", gk, { size: 26, fill: '#FDE8ED', stroke: C.pinkL });
        }
      }
      // The question card.
      const qk = between(t, T.question, T.close + 0.4, 0.6);
      if (qk > 0) {
        let q = `<rect x="560" y="390" width="400" height="210" rx="20" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/>${txt(760, 432, 'BEFORE EVERY ENTRY', 18, C.muted, { ls: 3 })}
          <rect x="590" y="452" width="340" height="56" rx="14" fill="${C.tealL}"/>${txt(760, 488, 'model complete?', 26, DK.teal)}
          <rect x="590" y="520" width="340" height="56" rx="14" fill="${C.pinkP}"/>${txt(760, 556, 'afraid it’s leaving?', 26, DK.pink)}`;
        if (t > T.answer) q += cross(910, 480, pop(t, T.answer, 0.4), C.pink, 20) + pill(760, 620, 'not complete = no trade', C.purple, pop(t, T.answer + 0.3), 22);
        out += scaleAt(760, 600, qk, q);
      }
      // Session card.
      const ck = pop(t, T.card, 0.7);
      if (ck > 0) {
        out += scaleAt(1450, 820, ck, `<rect x="1300" y="740" width="420" height="150" rx="20" fill="#fff" stroke="${C.tealL}" stroke-width="5"/>${txt(1510, 778, 'SESSION', 18, C.muted, { ls: 3 })}
          ${txt(1330, 820, 'trades', 24, C.muted, { a: 'start', w: 700 })}${txt(1690, 820, '0', 28, C.dark, { a: 'end' })}${txt(1330, 860, 'rules broken', 24, C.muted, { a: 'start', w: 700 })}${txt(1690, 860, '0', 28, C.dark, { a: 'end' })}`);
        out += check(1720, 740, pop(t, T.card + 0.6, 0.5), C.teal, 30);
        if (t > T.card + 0.6) out += A.sparkle(1720, 740, T.card + 0.6, t, C.teal);
        out += pill(1510, 950, 'a perfect session', DK.teal, pop(t, T.final, 0.6), 24);
      }
      // Night tint.
      if (night > 0) out += `<rect x="0" y="360" width="1920" height="720" fill="#3D3550" opacity="${f1(night * 0.08)}"/>`;
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
