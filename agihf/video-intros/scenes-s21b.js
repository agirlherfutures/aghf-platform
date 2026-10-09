/**
 * scenes-s21b.js: illustrated scene types for Section 21 lesson intro videos
 * (Phase 8 · Section 21: Real Trade Breakdown Lab, Lessons 6 to 10).
 *
 * Case studies: every trade is rebuilt 4H → 1H → 15M → 1M → risk → management
 * → outcome, judged on what was known at the time, with process and outcome
 * graded separately. Every LIVE entry is a pure function of t, drawn on the
 * 1920x1080 stage.
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
  const TYPES = ['lifeguard', 'bus-stop', 'stargazer', 'hindsight-goggles', 'harbour-lights', 'blender',
    'compass-trail', 'dance-curtain', 'magic-cabinet', 'lightbox'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s21b-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};
  /* ================= Shared bits for this section ================= */
  // Vertical gradient definition (use fill="url(#id)").
  const vgrad = (id, top, bot) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`;
  // Partial polyline through pts ([[x,y],...]) up to fraction k. Returns { d, x, y, ang } of the tip.
  function partial(pts, k) {
    const L = [];
    let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
    let rem = clamp(k) * tot, d = `M${f1(pts[0][0])},${f1(pts[0][1])}`, x = pts[0][0], y = pts[0][1], ang = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
      if (rem >= L[i - 1]) { d += ` L${f1(bx)},${f1(by)}`; rem -= L[i - 1]; x = bx; y = by; continue; }
      const q = L[i - 1] ? rem / L[i - 1] : 0;
      x = lerp(ax, bx, q); y = lerp(ay, by, q); d += ` L${f1(x)},${f1(y)}`;
      break;
    }
    return { d, x, y, ang };
  }
  // A city bus facing right. (x, y) = centre of the wheels' ground line.
  // o: s, col, crowd (packed with faces), dist (wheel spin), shake, sign (destination text), t.
  function busArt(t, o) {
    const s = o.s || 1, col = o.col || C.teal, dk = col === C.pink ? DK.pink : col === C.peach ? DK.peach : col === C.purple ? DK.purple : DK.teal;
    const sh = o.shake ? Math.sin(t * 31) * 3 : Math.sin(t * 7) * 1;
    const wheel = wx => `<g transform="translate(${wx},-30) rotate(${f1((o.dist || 0) / 30 * 57.3)})"><circle r="30" fill="${C.dark}"/><circle r="13" fill="#D9CFC8"/><rect x="-2.5" y="-27" width="5" height="27" fill="#D9CFC8"/></g>`;
    let win = '';
    [-150, -88, -26, 36].forEach((wx, i) => {
      win += `<rect x="${wx}" y="-188" width="52" height="54" rx="9" fill="#FDF8F5"/>`;
      if (o.crowd) {
        const skins = ['#8E5A3C', '#F1C7A5', '#C68B62', '#E8B48C', '#6E4530', '#F3CDB0'];
        for (let j = 0; j < 3; j++) {
          const fx = wx + 10 + j * 16, fy = -152 + Math.sin(t * 9 + i * 2 + j) * 3 - (j % 2) * 10;
          win += `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="12" fill="${skins[(i * 3 + j) % 6]}"/><circle cx="${f1(fx - 4)}" cy="${f1(fy - 2)}" r="2" fill="${C.dark}"/><circle cx="${f1(fx + 4)}" cy="${f1(fy - 2)}" r="2" fill="${C.dark}"/>`;
        }
      }
    });
    const g = `<ellipse cx="0" cy="2" rx="190" ry="10" fill="${C.dark}" opacity=".08"/>
      <g transform="translate(0,${f1(sh)})">
      <rect x="-180" y="-210" width="360" height="172" rx="30" fill="${col}" stroke="${dk}" stroke-width="5"/>
      ${win}
      <rect x="100" y="-188" width="60" height="112" rx="10" fill="#FDF8F5" stroke="${dk}" stroke-width="3"/><line x1="130" y1="-188" x2="130" y2="-76" stroke="${dk}" stroke-width="3"/>
      <rect x="-180" y="-118" width="280" height="10" fill="#fff" opacity=".4"/>
      <circle cx="172" cy="-64" r="9" fill="#FFF3C4"/>
      ${o.crowd ? `<path d="M-60,-134 q10,-30 30,-26" stroke="#F1C7A5" stroke-width="12" stroke-linecap="round" fill="none"/>` : ''}
      ${o.sign ? `<rect x="-120" y="-244" width="240" height="40" rx="10" fill="${C.dark}"/>${txt(0, -214, o.sign, 24, C.gold)}` : ''}
      </g>${wheel(-110)}${wheel(110)}`;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s})">${g}</g>`;
  }
  // A phone. (x, y) = centre. buzz 0..1 shakes it and shows rings.
  const phoneArt = (t, x, y, s = 1, buzz = 0, screen = C.tealL, label = '') => {
    const j = buzz > 0 ? Math.sin(t * 50) * 4 * buzz : 0;
    return `<g transform="translate(${f1(x + j)},${f1(y)}) scale(${s})"><rect x="-26" y="-46" width="52" height="92" rx="10" fill="${C.dark}"/><rect x="-21" y="-38" width="42" height="72" rx="5" fill="${screen}"/>${label ? txt(0, 6, label, 18, C.dark) : ''}
      ${buzz > 0 ? [1, 2].map(i => `<path d="M${-34 - i * 10},-20 Q${-44 - i * 10},0 ${-34 - i * 10},20 M${34 + i * 10},-20 Q${44 + i * 10},0 ${34 + i * 10},20" stroke="${C.pink}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${f1(buzz * (0.5 + 0.5 * Math.sin(t * 12 - i)))}"/>`).join('') : ''}</g>`;
  };
  // A wall/desk clock. (x, y) = centre; hrs/mins as numbers.
  const clockArt = (x, y, r, hrs, mins, col = C.purple) => {
    const ma = mins / 60 * 360 - 90, ha = (hrs % 12 + mins / 60) / 12 * 360 - 90;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${col}" stroke-width="${r * 0.12}"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="${f1(x + Math.cos(i * Math.PI / 2) * r * 0.74)}" cy="${f1(y + Math.sin(i * Math.PI / 2) * r * 0.74)}" r="${r * 0.06}" fill="${col}"/>`).join('')}
      <line x1="${x}" y1="${y}" x2="${f1(x + Math.cos(rad(ha)) * r * 0.45)}" y2="${f1(y + Math.sin(rad(ha)) * r * 0.45)}" stroke="${C.dark}" stroke-width="${r * 0.1}" stroke-linecap="round"/>
      <line x1="${x}" y1="${y}" x2="${f1(x + Math.cos(rad(ma)) * r * 0.68)}" y2="${f1(y + Math.sin(rad(ma)) * r * 0.68)}" stroke="${C.dark}" stroke-width="${r * 0.06}" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="${r * 0.08}" fill="${C.pink}"/>`;
  };
  // A star with 5 points.
  const starPath = (x, y, r, rot = 0) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = rad(rot - 90 + i * 36), rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + f1(x + Math.cos(a) * rr) + ',' + f1(y + Math.sin(a) * rr); }
    return d + 'Z';
  };
  // A small candle chart. bars: [o, c, h, l] in 0..1 (up = higher). Bar i shows from o.t0 + i * o.per
  // (or o.times[i]); o.n caps how many are drawn; o.col(i, up) can recolour; o.op(i) sets opacity.
  function candles(t, o) {
    const n = o.bars.length, step = o.w / n, bw = Math.min(step * 0.6, o.maxBody || 34);
    const X = i => o.x + step * i + step / 2, Y = v => o.y + o.h - v * o.h;
    let out = '';
    o.bars.forEach((b, i) => {
      if (o.n != null && i >= o.n) return;
      const at = o.times ? o.times[i] : (o.t0 ?? -99) + i * (o.per || 0);
      const p = ease((t - at) / 0.4);
      if (p <= 0) return;
      const [bo, bc, bh, bl] = b, up = bc >= bo, col = o.col ? o.col(i, up) : (up ? C.teal : C.pink);
      const cc = lerp(bo, bc, p), x = X(i);
      out += `<g opacity="${o.op ? o.op(i) : 1}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(lerp(Math.max(bo, bc), bh, p)))}" y2="${f1(Y(lerp(Math.min(bo, bc), bl, p)))}" stroke="${col}" stroke-width="${o.wick || 4}" stroke-linecap="round"/>
        <rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(bo, cc)))}" width="${f1(bw)}" height="${f1(Math.max(3, Math.abs(Y(bo) - Y(cc))))}" rx="3" fill="${col}"/></g>`;
    });
    return out;
  }
  const cX = (o, i) => o.x + o.w / o.bars.length * (i + 0.5);
  const cY = (o, v) => o.y + o.h - v * o.h;
  // A long move: impulse up, pullback to a level, retest, continuation to the target.
  const BARS_LONG = [[.12, .2, .22, .1], [.2, .3, .32, .18], [.3, .42, .44, .28], [.42, .5, .53, .4], [.5, .44, .52, .42], [.44, .38, .45, .36],
    [.38, .41, .43, .35], [.41, .52, .54, .4], [.52, .6, .62, .5], [.6, .55, .61, .51], [.55, .5, .56, .43], [.5, .58, .59, .47], [.58, .7, .72, .57], [.7, .8, .82, .68], [.8, .9, .93, .79]];

  /* ================= Lesson 6: Why I Passed This Trade ================= */
  Object.assign(LIVE, {
    // A lifeguard on her tower. The surf looks perfect (the setup is valid), but the rip-current
    // flag goes up on schedule (CPI in 3 minutes, news rule). Staying on the tower is the job.
    's21b-lifeguard': (s, t, ctx) => {
      const T = s.beats;
      const rip = seg(t, T.flag, T.flag + 1.6);
      let out = vgrad('s21bSkyL', '#EAF6F4', '#FFFDF8') + `<rect x="0" y="360" width="1920" height="260" fill="url(#s21bSkyL)"/>`;
      // Sun and clouds.
      out += `<circle cx="300" cy="470" r="${46 + Math.sin(t * 2) * 3}" fill="${C.peachL}"/><circle cx="300" cy="470" r="34" fill="${C.gold}" opacity=".8"/>`;
      out += cloud(700 + (t * 14) % 260, 430, 0.6) + cloud(1200 - (t * 9) % 200, 400, 0.5);
      // Sea with rolling waves.
      out += `<rect x="0" y="600" width="1920" height="230" fill="${C.tealL}"/>`;
      for (let r = 0; r < 4; r++) {
        const y0 = 630 + r * 48, amp = 8 + r * 3 + rip * 6, ph = t * (1.6 + r * 0.3) + r;
        let d = `M0,${y0}`;
        for (let x = 0; x <= 1920; x += 40) d += ` L${x},${f1(y0 + Math.sin(x / 90 + ph) * amp)}`;
        out += `<path d="${d} L1920,830 L0,830 Z" fill="${r % 2 ? C.teal : '#9AD9D1'}" opacity="${0.35 + r * 0.1}"/>`;
        for (let x = 60 + r * 70; x < 1920; x += 300) {
          const fx = x + ((t * 40 * (r % 2 ? 1 : -1)) % 300 + 300) % 300 - 150;
          out += `<path d="M${f1(fx)},${f1(y0 + Math.sin(fx / 90 + ph) * amp - 6)} q14,-14 28,0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
        }
      }
      // The big perfect wave (the valid setup).
      const wk = pop(t, T.valid, 0.8);
      if (wk > 0) {
        const wx = 560 + Math.sin(t * 1.4) * 30;
        out += scaleAt(wx, 820, wk, `<path d="M${wx - 260},820 Q${wx - 120},${700} ${wx},${640} Q${wx + 90},${610} ${wx + 120},${660} Q${wx + 70},${650} ${wx + 50},${690} Q${wx + 120},${760} ${wx + 260},820 Z" fill="${C.teal}"/>
          <path d="M${wx - 20},${648} Q${wx + 80},${612} ${wx + 118},${658}" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>`);
        out += pill(wx, 560, 'Setup: valid', DK.teal, between(t, T.valid + 0.4, s.end), 26);
        out += check(wx + 150, 560, between(t, T.valid + 0.8, s.end), C.teal, 22);
      }
      // Rip current swirl.
      if (rip > 0) {
        for (let i = 0; i < 3; i++) out += `<g opacity="${f1(rip * 0.8)}">${spiral(1040, 730, 70 - i * 18, t * 3 + i * 2).replace(C.purple, i % 2 ? C.purple : DK.purple).replace('2.5', '5')}</g>`;
      }
      // Sand.
      out += `<rect x="0" y="826" width="1920" height="254" fill="#F8E7CF"/><path d="M0,826 ${Array.from({ length: 25 }, (_, i) => `Q${i * 80 + 40},${836 + Math.sin(t * 2 + i) * 4} ${i * 80 + 80},826`).join(' ')}" fill="#fff" opacity=".7"/>`;
      for (let i = 0; i < 14; i++) out += `<circle cx="${80 + i * 137}" cy="${900 + (i * 53) % 140}" r="4" fill="#E7C9A5"/>`;
      // Surfboard stuck in the sand.
      out += fade(pop(t, T.beach + 0.6), `<g transform="rotate(-8 1660 1000)"><rect x="1632" y="790" width="56" height="220" rx="28" fill="${C.peach}"/><rect x="1656" y="800" width="8" height="200" fill="#fff" opacity=".6"/></g>`);
      // Lifeguard tower.
      const TX = 1440, PY = 720;
      const tk = pop(t, T.beach, 0.7);
      out += scaleAt(TX, 1010, tk, `<path d="M${TX - 92},1010 L${TX - 62},${PY} M${TX + 92},1010 L${TX + 62},${PY} M${TX - 84},930 L${TX + 70},830 M${TX + 84},930 L${TX - 70},830" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
        <path d="M${TX - 92},1010 L${TX - 62},${PY} M${TX + 92},1010 L${TX + 62},${PY}" stroke="#EADFD8" stroke-width="4"/>
        <rect x="${TX - 100}" y="${PY - 4}" width="200" height="22" rx="8" fill="${C.pink}"/>
        <rect x="${TX - 70}" y="${PY + 30}" width="140" height="60" rx="10" fill="#fff" stroke="${C.pink}" stroke-width="5"/>${txt(TX, PY + 70, '+', 44, C.pink)}`);
      // Lifeguard.
      const stay = t > T.stay;
      const lg = { x: TX, y: PY, scale: 0.95, look: A.LOOKS.c, flip: true, seed: 3, at: T.beach + 0.4, hat: 'cap', talk: ctx.talking && t > T.stay && t < T.stay + 3 };
      if (t > T.flag + 0.2 && t < T.cpi + 1) lg.frontArm = aim(lg, 1700, 470 + Math.sin(t * 3) * 6);
      else if (stay) { lg.frontArm = { a1: 150, a2: 10 }; lg.backArm = { a1: 30, a2: 170 }; }
      else lg.frontArm = aim(lg, TX - 30, PY - 248 * 0.95 + Math.sin(t * 2) * 3);
      out += who(t, lg);
      if (pop(t, lg.at) >= 1 && !stay && !(t > T.flag + 0.2 && t < T.cpi + 1)) {
        // Binoculars at the eyes while watching the surf.
        const h = headAt(t, lg);
        out += `<g transform="translate(${f1(h.x - 34)},${f1(h.y)})"><rect x="-14" y="-16" width="16" height="28" rx="6" fill="${C.dark}"/><rect x="-14" y="10" width="16" height="10" rx="4" fill="${C.dark}"/></g>`;
      }
      // Flag pole and the rip-current flag.
      const FX = 1780;
      out += fade(tk, `<rect x="${FX - 6}" y="440" width="12" height="570" rx="6" fill="${C.muted}"/><circle cx="${FX}" cy="436" r="12" fill="${C.gold}"/>`);
      const fy = lerp(960, 456, ease(seg(t, T.flag, T.flag + 1.4)));
      if (t > T.flag - 0.2) {
        const wv = Math.sin(t * 6) * 10;
        out += `<path d="M${FX + 6},${f1(fy)} Q${FX + 60},${f1(fy - 10 + wv)} ${FX + 120},${f1(fy + wv * 0.5)} L${FX + 116},${f1(fy + 70 + wv * 0.5)} Q${FX + 60},${f1(fy + 60 + wv)} ${FX + 6},${f1(fy + 70)} Z" fill="${C.pink}"/>
          <path d="M${FX + 30},${f1(fy + 18)} l30,34 M${FX + 60},${f1(fy + 18)} l-30,34" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
      }
      out += pill(1660, 590, 'Rip warning', DK.pink, between(t, T.flag + 1.2, T.cpi - 0.2), 26);
      // CPI countdown + news rule.
      const left = Math.max(0, 180 - Math.floor(t - T.cpi));
      const cd = `CPI in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      const bdk = pop(t, T.cpi - 0.3, 0.6);
      out += scaleAt(1110, 1000, bdk, `<rect x="980" y="900" width="14" height="100" fill="#9B6A45"/><rect x="1226" y="900" width="14" height="100" fill="#9B6A45"/><rect x="930" y="840" width="360" height="110" rx="14" fill="#fff" stroke="#9B6A45" stroke-width="6"/>`);
      out += pill(1110, 870, cd, DK.pink, between(t, T.cpi + 0.2, s.end), 26);
      out += pill(1110, 922, 'No entries ±5 min', DK.purple, between(t, T.cpi + 1.6, s.end), 22);
      // Seagull: circles the surf, then lands on a post.
      const PX = 300, PYs = 880;
      out += fade(tk, `<rect x="${PX - 10}" y="${PYs}" width="20" height="130" rx="6" fill="#9B6A45"/>`);
      if (t > T.urge - 1.6) {
        const fk = seg(t, T.urge - 1.6, T.urge);
        const gx = fk < 1 ? lerp(-60, PX, ease(fk)) : PX, gy = fk < 1 ? lerp(450, PYs, ease(fk)) - Math.sin(fk * Math.PI) * 120 : PYs;
        out += critter(t, 'bird', { x: gx, y: gy, scale: 1.1, seed: 5, fly: fk < 1, col: '#fff', talk: ctx.talking && t > T.urge && t < T.flag });
      }
      out += bub(470, 720, 'Perfect waves! Go!', between(t, T.urge, T.flag + 0.2), { size: 26 });
      // Crab at the shoreline.
      out += crit(t, 'crab', { x: 740, y: 1000, scale: 0.9, seed: 2, at: T.beach + 1, hop: t > T.urge && t < T.flag ? 6 : 0, hopH: 14, talk: ctx.talking && t > T.urge + 0.6 && t < T.flag });
      out += bub(790, 860, 'Go go go!', between(t, T.urge + 0.6, T.flag + 0.2), { size: 26 });
      out += bub(790, 860, 'Fair. 👍', between(t, T.stay + 2.2, s.end), { size: 26 });
      // The lifeguard stays.
      out += bub(1170, 420, 'Not mine. I stay.', between(t, T.stay, s.end), { size: 28, tail: 'right' });
      out += pill(TX, 1046, 'Pass = execution', DK.teal, pop(t, T.stamp, 0.6), 26);
      out += check(TX + 190, 1046, pop(t, T.stamp + 0.4, 0.5), C.teal, 26);
      out += sparkAt(TX, 1000, T.stamp + 0.3, t, C.teal);
      return out;
    },

    // A bus stop. The packed bus arrives at the worst moment and she lets it go. Wherever that bus
    // ends up (run, reversal, chop), the pass stays correct: it's graded at the stop. Then the next bus comes.
    's21b-bus-stop': (s, t, ctx) => {
      const T = s.beats;
      let out = vgrad('s21bSkyB', '#EFE9FB', '#FDF8F5') + `<rect x="0" y="360" width="1920" height="420" fill="url(#s21bSkyB)"/>`;
      // City skyline.
      const B = [[40, 520, 150, C.purpleL], [210, 470, 120, C.pinkL], [350, 560, 170, C.tealL], [540, 500, 130, C.peachL], [690, 450, 150, C.purpleL], [860, 540, 120, C.pinkL], [1000, 480, 160, C.tealL], [1180, 520, 140, C.peachL], [1340, 460, 130, C.purpleL], [1490, 540, 170, C.pinkL], [1680, 490, 140, C.tealL], [1840, 530, 120, C.peachL]];
      B.forEach(([x, y, w, col], i) => {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${780 - y}" rx="8" fill="${col}" opacity=".7"/>`;
        for (let r = 0; r < 4; r++) for (let c = 0; c < Math.floor(w / 40); c++) {
          const lit = Math.sin(t * 0.8 + i * 3 + r * 1.7 + c) > 0.6;
          out += `<rect x="${x + 14 + c * 40}" y="${y + 20 + r * 50}" width="20" height="26" rx="4" fill="${lit ? '#FFF3C4' : '#fff'}" opacity=".85"/>`;
        }
      });
      // Pavement, road, front curb.
      out += `<rect x="0" y="770" width="1920" height="90" fill="#EFE3DA"/><rect x="0" y="770" width="1920" height="5" fill="#E2D4CA"/>`;
      out += A.road(860, { h: 150, shift: -t * 60 });
      out += `<rect x="0" y="1010" width="1920" height="70" fill="#EFE3DA"/><rect x="0" y="1010" width="1920" height="6" fill="#E2D4CA"/>`;
      // Shelter and stop sign.
      const sk = pop(t, T.street, 0.7);
      out += scaleAt(260, 860, sk, `<rect x="90" y="620" width="12" height="240" fill="${C.muted}"/><rect x="420" y="620" width="12" height="240" fill="${C.muted}"/>
        <rect x="80" y="606" width="362" height="26" rx="10" fill="${C.purple}"/><rect x="104" y="640" width="310" height="150" rx="8" fill="#fff" opacity=".45"/>
        <rect x="140" y="800" width="240" height="16" rx="6" fill="#9B6A45"/><rect x="160" y="816" width="10" height="44" fill="#9B6A45"/><rect x="350" y="816" width="10" height="44" fill="#9B6A45"/>
        <rect x="486" y="560" width="10" height="300" fill="${C.muted}"/><circle cx="491" cy="560" r="40" fill="${C.pink}"/>${txt(491, 570, 'BUS', 26, '#fff')}`);
      // Pigeon on the shelter roof.
      out += crit(t, 'bird', { x: 180 + Math.sin(t * 0.7) * 30, y: 606, scale: 0.9, seed: 7, col: C.purpleL, at: T.street + 0.8, flip: Math.cos(t * 0.7) < 0 });
      // Bus 1: packed, arrives, waits, leaves without her.
      const arr = ease(seg(t, T.bus, T.bus + 1.6)), lv = Math.pow(seg(t, T.leave, T.leave + 1.8), 2);
      const b1x = t < T.leave ? lerp(-300, 760, arr) : lerp(760, 2300, lv);
      if (t > T.bus && b1x < 2260) {
        out += busArt(t, { x: b1x, y: 990, s: 1.15, col: C.pink, crowd: true, shake: true, dist: b1x, sign: 'CPI 9:30' });
        // A goat riding on the roof.
        out += beast(t, 'goat', { x: b1x - 175, y: 990 - 210 * 1.15 - 2, scale: 0.7, seed: 4, hop: 9, hopH: 8 });
      }
      out += bub(1040, 560, 'Squeeze in!', between(t, T.bus + 1.6, T.leave), { size: 28 });
      // The student and her dog.
      const st = { x: 300, y: 860, scale: 0.88, look: A.LOOKS.b, seed: 2, at: T.street + 0.4, talk: ctx.talking && t > T.bus + 2 && t < T.leave + 0.8 };
      if (t > T.bus + 1.4 && t < T.leave + 1) st.frontArm = { a1: -20, a2: -80 };
      else if (t > T.board + 0.6 && t < T.verdict + 2) st.frontArm = aim(st, 470, 520 + Math.sin(t * 2) * 10);
      else if (t > T.next + 1.4) st.frontArm = { a1: -60, a2: -100 + Math.sin(t * 8) * 14 };
      out += who(t, st);
      out += bub(270, 470, "I'll pass.", between(t, T.bus + 2, T.leave + 1.2), { size: 30 });
      out += crit(t, 'dog', { x: 400, y: 860, scale: 0.55, seed: 3, at: T.street + 0.8, hop: t > T.next + 1.4 ? 12 : 0, hopH: 16, tongue: t > T.next });
      // Where did that bus end up? Three endings on the route board.
      const bk = pop(t, T.board, 0.7);
      if (bk > 0) {
        const BX = 880, BY = 380, BW = 960, BH = 330;
        out += scaleAt(BX + BW / 2, BY + BH / 2, bk, `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="24" fill="${C.dark}"/><rect x="${BX + 10}" y="${BY + 10}" width="${BW - 20}" height="${BH - 20}" rx="18" fill="#3B2A22"/>`);
        const ends = [
          { lab: 'Run', at: T.ends[0], pts: [[0, 150], [60, 120], [90, 130], [150, 70], [180, 80], [250, 20]] },
          { lab: 'Reversal', at: T.ends[1], pts: [[0, 150], [60, 110], [100, 80], [140, 70], [190, 110], [250, 160]] },
          { lab: 'Chop', at: T.ends[2], pts: [[0, 100], [40, 70], [80, 120], [120, 70], [160, 120], [200, 80], [250, 110]] },
        ];
        ends.forEach((e, i) => {
          const ox = BX + 45 + i * 305, oy = BY + 90;
          const k = seg(t, e.at, e.at + 2.4);
          if (t < e.at) return;
          out += fade(pop(t, e.at, 0.4), `<rect x="${ox - 15}" y="${oy - 55}" width="285" height="240" rx="14" fill="#fff" opacity=".08"/>`) + pill(ox + 125, oy - 20, e.lab, [DK.teal, DK.pink, DK.purple][i], pop(t, e.at, 0.5), 24);
          const P = e.pts.map(([x, y]) => [ox + x, oy + 20 + y * 0.9]);
          const pp = partial(P, ease(k));
          out += `<path d="${pp.d}" stroke="${[C.teal, C.pink, C.purpleL][i]}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          // Tiny bus at the tip.
          out += `<g transform="translate(${f1(pp.x)},${f1(pp.y)}) rotate(${f1(Math.max(-40, Math.min(40, pp.ang)))}) scale(.2)">${busArt(t, { x: 0, y: 0, col: C.pink, dist: k * 900 })}</g>`;
          out += check(ox + 230, oy + 160, pop(t, T.verdict + i * 0.4, 0.5), C.teal, 22);
          out += sparkAt(ox + 230, oy + 160, T.verdict + i * 0.4 + 0.2, t, C.teal);
        });
        out += pill(BX + BW / 2, BY + BH + 44, 'Pass: still correct', DK.teal, pop(t, T.verdict + 1.4, 0.6), 26);
      }
      // Bus 2: calm, nearly empty, arrives for her.
      if (t > T.next) {
        const nx = lerp(-300, 760, ease(seg(t, T.next, T.next + 1.4)));
        out += busArt(t, { x: nx, y: 990, s: 1.15, col: C.teal, dist: nx, sign: 'NEXT' });
        out += bub(330, 480, 'Next one comes.', between(t, T.next + 1.2, s.end), { size: 28 });
      }
      return out;
    },
  });

  /* ================= Lesson 7: The Missed Trade ================= */
  Object.assign(LIVE, {
    // Two neighbours, one comet. Next door chooses to skip it (a pass: a decision). Our stargazer
    // planned it, set the alert, then stepped inside with the phone on silent: the comet came and went (a miss).
    's21b-stargazer': (s, t, ctx) => {
      const T = s.beats;
      let out = vgrad('s21bNight', '#4B4390', '#8F86D9') + `<rect x="0" y="360" width="1920" height="560" fill="url(#s21bNight)"/>`;
      // Stars twinkle.
      for (let i = 0; i < 46; i++) {
        const x = (i * 211) % 1900 + 10, y = 380 + (i * 97) % 400, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.6 + i * 1.3));
        out += i % 5 ? `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff" opacity="${f1(tw)}"/>` : `<path d="${starPath(x, y, 9, t * 20 + i)}" fill="${C.peachL}" opacity="${f1(tw)}"/>`;
      }
      out += `<circle cx="1760" cy="450" r="44" fill="#FFF3C4"/><circle cx="1780" cy="438" r="40" fill="#5A51A6" opacity=".9"/>`;
      // Comet streaks across.
      const ck = seg(t, T.comet, T.comet + 2.6);
      if (ck > 0 && ck < 1) {
        const cx = lerp(1880, 120, ck), cy = lerp(400, 600, ck) - Math.sin(ck * Math.PI) * 40;
        out += `<path d="M${f1(cx)},${f1(cy)} L${f1(cx + 300)},${f1(cy - 50)} L${f1(cx + 300)},${f1(cy - 20)} Z" fill="${C.peachL}" opacity=".6"/><path d="M${f1(cx)},${f1(cy)} L${f1(cx + 200)},${f1(cy - 30)} L${f1(cx + 200)},${f1(cy - 12)} Z" fill="#fff" opacity=".8"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="16" fill="#fff"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="26" fill="#FFF3C4" opacity=".4"/>`;
      }
      // Ground and fence.
      out += `<rect x="0" y="900" width="1920" height="180" fill="#3D3550"/><rect x="0" y="900" width="1920" height="6" fill="#5C4A6E"/>`;
      for (let x = 560; x < 1300; x += 60) out += `<rect x="${x}" y="800" width="22" height="100" rx="6" fill="#5C4A6E"/>`;
      out += `<rect x="560" y="824" width="740" height="12" fill="#5C4A6E"/>`;
      // House: x0..x1, body top yT, light on?
      const house = (x0, w, col, roof, lit, k) => scaleAt(x0 + w / 2, 900, k, `<path d="M${x0 - 30},640 L${x0 + w / 2},500 L${x0 + w + 30},640 Z" fill="${roof}"/><rect x="${x0}" y="630" width="${w}" height="270" fill="${col}"/>
        <rect x="${x0 + 40}" y="790" width="80" height="110" rx="8" fill="#5C4A6E"/><circle cx="${x0 + 106}" cy="848" r="5" fill="${C.gold}"/>`);
      const hk = pop(t, T.houses, 0.7);
      // Left neighbour: chose to pass. Her lights go out.
      const off = t > T.pass + 1.2;
      out += house(120, 400, '#E7DDF3', C.purple, !off, hk);
      out += fade(hk, `<rect x="330" y="680" width="150" height="110" rx="10" fill="${off ? '#5A51A6' : '#FFF3C4'}"/><line x1="405" y1="680" x2="405" y2="790" stroke="#fff" stroke-width="5"/>`);
      if (off) out += [0, 1, 2].map(i => { const p = ((t - T.pass) * 0.6 + i / 3) % 1; return txt(470 + p * 60, 670 - p * 90, 'z', 26 + i * 6, '#fff', { op: f1(1 - p) }); }).join('');
      // Cat asleep on her window sill.
      out += crit(t, 'cat', { x: 250, y: 790, scale: 0.6, seed: 4, sleep: true, at: T.houses + 0.6 });
      out += pill(320, 460, 'Pass: chose not to', DK.purple, pop(t, T.pass, 0.6), 24);
      out += bub(420, 592, 'Not my night.', between(t, T.pass + 0.4, T.plan), { size: 26 });
      // Right house: the stargazer's. Phone lies on the table inside.
      out += house(1340, 440, '#FDE8ED', C.pink, true, hk);
      out += fade(hk, `<rect x="1560" y="680" width="180" height="120" rx="10" fill="#FFF3C4"/><rect x="1570" y="770" width="160" height="12" fill="#C98A1F"/>`);
      const buzz = t > T.comet && t < T.comet + 2.6 ? 1 : 0;
      if (hk > 0) out += phoneArt(t, 1650, 740, 0.5, buzz, C.purpleL);
      out += pill(1650, 650, 'silent', C.muted, between(t, T.inside, s.end), 20);
      // Telescope and chair.
      const tk = pop(t, T.plan, 0.6);
      out += scaleAt(1060, 900, tk, `<path d="M1060,760 L1020,900 M1060,760 L1100,900 M1060,760 L1060,900" stroke="${C.muted}" stroke-width="8" stroke-linecap="round"/>
        <g transform="rotate(-28 1060 750)"><rect x="1000" y="732" width="150" height="40" rx="14" fill="${C.purple}"/><rect x="1140" y="726" width="26" height="52" rx="8" fill="${DK.purple}"/></g>
        <rect x="1150" y="830" width="90" height="16" rx="6" fill="${C.peach}"/><rect x="1156" y="846" width="10" height="54" fill="${C.peach}"/><rect x="1224" y="846" width="10" height="54" fill="${C.peach}"/><rect x="1226" y="760" width="14" height="80" rx="6" fill="${C.peach}"/>`);
      out += pill(1240, 520, 'Alert: at the retest', DK.teal, between(t, T.plan + 0.6, T.comet), 24);
      // The stargazer: by the telescope, walks inside, comes back too late.
      let sx = 960, walking = false, flip = false, vis = 1;
      if (t > T.inside) { const k = seg(t, T.inside, T.inside + 1.8); sx = lerp(960, 1420, k); walking = k < 1; vis = 1 - seg(t, T.inside + 1.5, T.inside + 1.9); }
      if (t > T.back) { const k = seg(t, T.back, T.back + 1.6); sx = lerp(1420, 1180, k); walking = k < 1; flip = true; vis = seg(t, T.back, T.back + 0.3); }
      const sg = { x: sx, y: 900, scale: 1, look: A.LOOKS.d, seed: 6, walking, flip, at: T.houses + 0.5, mood: t > T.back + 1.2 ? 'sad' : undefined };
      if (t > T.back) sg.hold = `<rect x="-14" y="-30" width="28" height="34" rx="6" fill="#fff" stroke="${C.pink}" stroke-width="4"/><path d="M14,-20 q12,4 0,16" stroke="${C.pink}" stroke-width="4" fill="none"/>${[0, 1].map(i => `<path d="M${-6 + i * 10},-38 q-6,-10 0,-20" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`).join('')}`;
      if (!walking && t < T.inside) sg.frontArm = aim(sg, 1010, 700);
      out += fade(vis, who(t, sg));
      out += bub(1150, 470, 'Wait... where is it?', between(t, T.back + 1.4, s.end), { size: 26 });
      // Owl on the fence watches the comet; a mouse cheers.
      const wow = t > T.comet && t < T.comet + 3;
      out += crit(t, 'owl', { x: 700, y: 816, scale: 0.7, seed: 3, at: T.houses + 0.9, talk: wow && ctx.talking });
      out += bub(740, 640, 'Whoa! 🌠', between(t, T.comet + 0.6, T.comet + 3.2), { size: 26 });
      out += crit(t, 'mouse', { x: 840, y: 900, scale: 0.9, seed: 2, at: T.houses + 1.1, hop: wow ? 12 : 0, hopH: 20 });
      // Verdict.
      out += pill(1180, 1010, 'Miss: planned, not there', DK.pink, pop(t, T.miss, 0.6), 26);
      out += pill(560, 1010, 'The move happened without her', C.muted, pop(t, T.without, 0.6), 22);
      return out;
    },

    // "Next time I'll enter earlier." Freeze: that's hindsight. With hindsight goggles on, every move
    // looks obvious; take them off and the future is hidden. What failed was access, not the method.
    's21b-hindsight-goggles': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="560" fill="#FBF1EA"/>` + ground(900, '#E7D3C3', '#D6BFAE');
      // Wallpaper stripes, window, doorway to the other room.
      for (let x = 0; x < 1920; x += 80) out += `<rect x="${x}" y="360" width="30" height="540" fill="#F6E6DC"/>`;
      out += `<rect x="60" y="560" width="200" height="340" rx="10" fill="#E2D4CA"/><rect x="74" y="574" width="172" height="326" fill="#CFC0B4"/>`;
      out += pill(160, 530, 'other room', C.muted, pop(t, T.desk, 0.5), 20);
      // Desk.
      const dk = pop(t, T.desk, 0.7);
      out += scaleAt(1040, 900, dk, `<rect x="680" y="840" width="740" height="26" rx="8" fill="#B98A64"/><rect x="700" y="866" width="22" height="34" fill="#9B6A45"/><rect x="1378" y="866" width="22" height="34" fill="#9B6A45"/>
        <rect x="1100" y="790" width="30" height="50" fill="${C.muted}"/><rect x="1050" y="826" width="130" height="14" rx="6" fill="${C.muted}"/>`);
      // Monitor with the chart.
      const MX = 860, MY = 460, MW = 500, MH = 330;
      out += scaleAt(MX + MW / 2, MY + MH, dk, `<rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18" fill="${C.dark}"/><rect x="${MX + 14}" y="${MY + 14}" width="${MW - 28}" height="${MH - 28}" rx="10" fill="#fff"/>`);
      const ch = { x: MX + 40, y: MY + 40, w: MW - 80, h: MH - 80, bars: BARS_LONG, t0: T.desk + 0.4, per: 0.12 };
      const gog = t > T.goggles && t < T.off;
      if (dk >= 1) {
        out += `<line x1="${ch.x - 10}" x2="${ch.x + ch.w + 10}" y1="${f1(cY(ch, 0.5))}" y2="${f1(cY(ch, 0.5))}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 7"/>`;
        out += candles(t, ch);
        if (gog) {
          // Everything looks obvious through hindsight.
          const pp = partial([[cX(ch, 4), cY(ch, 0.5)], [cX(ch, 10), cY(ch, 0.45)], [cX(ch, 14), cY(ch, 0.92)]], ease(seg(t, T.goggles + 0.3, T.goggles + 1.6)));
          out += `<rect x="${MX + 14}" y="${MY + 14}" width="${MW - 28}" height="${MH - 28}" rx="10" fill="${C.gold}" opacity=".18"/><path d="${pp.d}" stroke="${C.gold}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="2 14"/>`;
          out += pill(MX + 150, MY + 60, 'So obvious!', '#C98A1F', pop(t, T.goggles + 1, 0.5), 22);
        }
        if (t > T.off) {
          // Back at 10:04: the future is hidden behind a curtain.
          const ck = ease(seg(t, T.off, T.off + 0.9));
          const cx0 = cX(ch, 7) + 14;
          const cw = (MX + MW - 14 - cx0) * ck;
          out += `<rect x="${f1(MX + MW - 14 - cw)}" y="${MY + 14}" width="${f1(cw)}" height="${MH - 28}" fill="${C.purpleL}"/>`;
          for (let i = 0; i < 5; i++) out += `<line x1="${f1(MX + MW - 14 - cw + 20 + i * cw / 5)}" y1="${MY + 14}" x2="${f1(MX + MW - 14 - cw + 20 + i * cw / 5 + Math.sin(t * 2 + i) * 4)}" y2="${MY + MH - 14}" stroke="${C.purple}" stroke-width="3" opacity=".4"/>`;
          out += pill(MX + MW - 130, MY + MH / 2, 'not known yet', DK.purple, pop(t, T.off + 0.8, 0.5), 20);
          out += pill(MX + 120, MY + 60, 'At 10:04', C.muted, pop(t, T.off + 0.4, 0.5), 20);
        }
      }
      // Rulebook on the desk.
      const bk = pop(t, T.desk + 0.6, 0.6);
      out += scaleAt(780, 840, bk, `<path d="M700,840 L700,770 Q740,756 780,770 Q820,756 860,770 L860,840 Q820,826 780,840 Q740,826 700,840 Z" fill="#fff" stroke="${C.purple}" stroke-width="4"/><line x1="780" y1="770" x2="780" y2="840" stroke="${C.purple}" stroke-width="3"/>
        ${[0, 1, 2].map(i => `<rect x="${712}" y="${786 + i * 14}" width="56" height="5" rx="2" fill="${C.purpleL}"/><rect x="${792}" y="${786 + i * 14}" width="56" height="5" rx="2" fill="${C.purpleL}"/>`).join('')}`);
      out += pill(780, 730, 'Entry model', DK.purple, pop(t, T.desk + 0.9, 0.5), 20);
      // The trader.
      const tr = { x: 540, y: 1000, scale: 0.95, look: A.LOOKS.e, seed: 4, at: T.desk + 0.2, talk: ctx.talking && t > T.thought && t < T.freeze };
      const scribble = t > T.thought + 1.4 && t < T.freeze;
      if (scribble) tr.frontArm = aim(tr, 790 + Math.sin(t * 14) * 16, 790 + Math.cos(t * 11) * 6);
      else if (gog) tr.frontArm = aim(tr, 560, 1000 - 0.95 * 284);
      else if (t > T.quiz) tr.frontArm = aim(tr, 1500, 560 + Math.sin(t * 2) * 8);
      if (scribble || t < T.freeze) tr.hold = scribble ? `<rect x="-4" y="-40" width="8" height="44" rx="3" fill="${C.pink}"/>` : undefined;
      out += who(t, tr);
      if (gog) {
        const h = headAt(t, tr);
        out += `<g transform="translate(${f1(h.x)},${f1(h.y)}) scale(${h.s})"><rect x="-46" y="-20" width="92" height="12" rx="6" fill="#C98A1F"/><circle cx="-18" cy="-2" r="18" fill="${C.gold}" stroke="#C98A1F" stroke-width="5" opacity=".9"/><circle cx="18" cy="-2" r="18" fill="${C.gold}" stroke="#C98A1F" stroke-width="5" opacity=".9"/><circle cx="-24" cy="-8" r="5" fill="#fff"/><circle cx="12" cy="-8" r="5" fill="#fff"/></g>`;
        out += pill(400, 580, 'Hindsight goggles', '#C98A1F', pop(t, T.goggles + 0.3, 0.5), 22);
      } else if (t > T.off && t < T.off + 1.2) {
        // Goggles fall away.
        const k = seg(t, T.off, T.off + 1.2), h = headAt(t, tr);
        out += fade(1 - k, `<g transform="translate(${f1(h.x - 120 * k)},${f1(h.y + 300 * k * k)}) rotate(${f1(-200 * k)})"><circle cx="-18" r="18" fill="${C.gold}"/><circle cx="18" r="18" fill="${C.gold}"/></g>`);
      }
      out += bub(470, 540, "Next time I'll enter earlier.", between(t, T.thought, T.freeze + 0.2), { size: 26 });
      // Parrot coach yells freeze.
      const PX = 1700;
      out += fade(dk, `<rect x="${PX - 70}" y="760" width="140" height="10" rx="5" fill="#9B6A45"/><rect x="${PX - 5}" y="770" width="10" height="130" fill="#9B6A45"/>`);
      const flying = t > T.fix && t < T.fix + 2.4;
      if (!flying) out += crit(t, 'parrot', { x: t > T.fix + 2.4 ? 1300 : PX, y: t > T.fix + 2.4 ? 840 : 760, scale: 0.8, seed: 5, at: T.desk + 1, flip: true, talk: ctx.talking && t > T.freeze && t < T.freeze + 1.6 });
      out += bub(1640, 560, 'FREEZE! ✋', between(t, T.freeze, T.goggles + 0.4), { size: 30 });
      // Freeze frame: everything tints cool for a beat.
      const fz = t > T.freeze && t < T.goggles ? Math.min(1, (t - T.freeze) / 0.2, (T.goggles - t) / 0.3) : 0;
      if (fz > 0) out += `<rect x="0" y="360" width="1920" height="720" fill="${C.tealL}" opacity="${f1(fz * 0.35)}"/>` + [0, 1, 2, 3].map(i => `<path d="${starPath([40, 1880, 40, 1880][i], [400, 400, 1040, 1040][i], 40, 0)}" fill="#fff" opacity="${f1(fz * 0.9)}"/>`).join('');
      // What failed? board.
      const qk = pop(t, T.quiz, 0.6);
      if (qk > 0) {
        out += scaleAt(1660, 560, qk, `<rect x="1450" y="400" width="420" height="300" rx="20" fill="#fff" stroke="#EADFD8" stroke-width="4"/>${txt(1660, 450, 'What failed?', 30, C.dark, { f: 'Playfair Display' })}
          <rect x="1480" y="480" width="360" height="80" rx="14" fill="${C.pinkP}"/>${txt(1600, 530, 'The method', 28, DK.pink)}
          <rect x="1480" y="590" width="360" height="80" rx="14" fill="#E8F8F6"/>${txt(1600, 640, 'Access', 28, DK.teal)}`);
        out += cross(1790, 520, pop(t, T.nope, 0.5), C.pink, 26) + check(1790, 630, pop(t, T.access, 0.5), C.teal, 26);
        out += sparkAt(1790, 630, T.access + 0.2, t, C.teal);
      }
      // Fix: the parrot fetches the phone from the other room to the desk.
      if (flying) {
        const k = ease(seg(t, T.fix, T.fix + 2.4));
        const px = k < 0.5 ? lerp(PX, 160, k * 2) : lerp(160, 1300, k * 2 - 1), py = (k < 0.5 ? lerp(760, 760, k * 2) : lerp(760, 840, k * 2 - 1)) - Math.sin(k * Math.PI * 2) * 120;
        out += critter(t, 'parrot', { x: px, y: py, scale: 0.8, seed: 5, fly: true, flip: k < 0.5 });
        if (k > 0.5) out += phoneArt(t, px + 10, py + 30, 0.55, 0, C.tealL);
      }
      if (t < T.fix + 1.2) out += phoneArt(t, 160, 860, 0.55, 0, '#3B2A22');
      if (t > T.fix + 2.4) out += phoneArt(t, 1240, 800, 0.6, 0.8, C.tealL, '🔔');
      out += pill(1240, 990, 'Alert on, at the desk', DK.teal, pop(t, T.fix + 2.6, 0.5), 22);
      out += pill(780, 990, 'Rules unchanged', DK.purple, pop(t, T.keep, 0.5), 22);
      out += check(925, 990, pop(t, T.keep + 0.3, 0.5), C.teal, 20);
      return out;
    },
  });

  /* ================= Lesson 8: Right Analysis. Wrong Execution. ================= */
  // A little fruit with a face. (x, y) = centre.
  const fruit = (t, x, y, col, r = 40, seed = 1, mood) => {
    const bl = blinkAmt(t, seed);
    const leaf = `<path d="M${x},${y - r} q8,-22 26,-20 q-6,18 -26,20" fill="${C.cash}"/>`;
    const mouth = mood === 'sad' ? `<path d="M${x - 8},${y + 14} Q${x},${y + 8} ${x + 8},${y + 14}" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<path d="M${x - 8},${y + 8} Q${x},${y + 16} ${x + 8},${y + 8}" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return `${leaf}<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${col}"/><circle cx="${f1(x - r * 0.4)}" cy="${f1(y - r * 0.4)}" r="${r * 0.2}" fill="#fff" opacity=".5"/>
      <ellipse cx="${f1(x - 10)}" cy="${f1(y - 4)}" rx="4" ry="${f1(5 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="${f1(x + 10)}" cy="${f1(y - 4)}" rx="4" ry="${f1(5 * (1 - bl * 0.9))}" fill="${C.dark}"/>${mouth}`;
  };
  Object.assign(LIVE, {
    // A navigator reads the chart perfectly, then loads six crates (plan: two), leaves on red
    // (skips the green light = the retest), moves her safety line once, and still reaches the island.
    's21b-harbour-lights': (s, t, ctx) => {
      const T = s.beats;
      let out = vgrad('s21bSkyH', '#FDE8ED', '#FFFDF8') + `<rect x="0" y="360" width="1920" height="300" fill="url(#s21bSkyH)"/>`;
      out += cloud(400 + (t * 10) % 300, 430, 0.55) + cloud(1500 - (t * 7) % 240, 410, 0.45);
      // Sea.
      out += `<rect x="0" y="650" width="1920" height="430" fill="#9AD9D1"/>`;
      for (let r = 0; r < 5; r++) {
        const y0 = 680 + r * 80;
        for (let x = -100 + ((t * (30 + r * 8)) % 200); x < 1980; x += 200) out += `<path d="M${f1(x)},${y0 + Math.sin(t * 2 + x) * 4} q25,-14 50,0 q25,14 50,0" stroke="#fff" stroke-width="4" fill="none" opacity="${0.35 + r * 0.08}" stroke-linecap="round"/>`;
      }
      // Island with the target flag.
      const ik = pop(t, T.harbour + 0.4, 0.7);
      out += scaleAt(1760, 760, ik, `<ellipse cx="1760" cy="770" rx="230" ry="70" fill="#F8E7CF"/><path d="M1780,760 Q1770,640 1800,560" stroke="#9B6A45" stroke-width="16" fill="none" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4].map(i => `<path d="M1800,560 q${f1(Math.cos(rad(-160 + i * 35 + Math.sin(t * 2) * 4)) * 90)},${f1(Math.sin(rad(-160 + i * 35)) * 50 + 30)} ${f1(Math.cos(rad(-160 + i * 35)) * 140)},${f1(Math.sin(rad(-160 + i * 35)) * 30 + 70)}" stroke="${C.cashD}" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}
        <rect x="1660" y="600" width="8" height="160" fill="${C.muted}"/><path d="M1668,${606 + Math.sin(t * 5) * 3} l70,16 l-70,18 Z" fill="${C.gold}"/>`);
      out += pill(1664, 570, 'Target', '#C98A1F', pop(t, T.harbour + 1, 0.5), 20);
      out += crit(t, 'crab', { x: 1880, y: 790, scale: 0.6, seed: 2, at: T.harbour + 1.2, hop: t > T.arrive ? 9 : 0, hopH: 14 });
      // Pier and signal mast.
      const pk = pop(t, T.harbour, 0.6);
      out += scaleAt(220, 780, pk, `<rect x="0" y="760" width="440" height="30" fill="#B98A64"/>${[40, 160, 280, 400].map(x => `<rect x="${x}" y="790" width="22" height="200" fill="#9B6A45"/>`).join('')}
        <rect x="352" y="470" width="16" height="290" fill="${C.muted}"/><rect x="320" y="420" width="80" height="150" rx="16" fill="${C.dark}"/>`);
      const green = t > T.green;
      if (pk > 0) out += `<circle cx="360" cy="460" r="26" fill="${green ? '#5C4A6E' : C.pink}"/>${green ? '' : `<circle cx="360" cy="460" r="${32 + Math.sin(t * 6) * 4}" fill="${C.pink}" opacity=".3"/>`}<circle cx="360" cy="530" r="26" fill="${green ? C.cash : '#5C4A6E'}"/>${green ? `<circle cx="360" cy="530" r="${32 + Math.sin(t * 6) * 4}" fill="${C.cash}" opacity=".35"/>` : ''}`;
      out += pill(250, 640, 'Plan: wait for green', DK.teal, between(t, T.plan, T.leave + 1), 22);
      out += pill(210, 640, 'Green: the retest', C.cashD, between(t, T.green, s.end), 22);
      // Harbour master duck with whistle.
      out += crit(t, 'duck', { x: 160, y: 760, scale: 0.85, seed: 3, at: T.harbour + 0.7, talk: ctx.talking && t > T.leave && t < T.leave + 2, hop: t > T.leave && t < T.leave + 2 ? 10 : 0, hopH: 14 });
      out += bub(260, 520, 'Still red!', between(t, T.leave + 0.2, T.green - 0.4), { size: 28 });
      // Chart board: the read.
      const ck = pop(t, T.chart, 0.7);
      if (ck > 0) {
        const route = partial([[960, 520], [1100, 470], [1250, 500], [1360, 450]], ease(seg(t, T.chart + 0.5, T.chart + 1.8)));
        out += scaleAt(1110, 480, ck, `<rect x="890" y="400" width="520" height="160" rx="14" fill="#FFF8EC" stroke="#E7C9A5" stroke-width="5"/><circle cx="950" cy="520" r="12" fill="${C.purple}"/><circle cx="1360" cy="450" r="14" fill="${C.gold}"/>`);
        if (ck >= 1) out += `<path d="${route.d}" stroke="${C.pink}" stroke-width="5" fill="none" stroke-dasharray="12 9"/>`;
        out += pill(1150, 610, 'Chart: right', DK.teal, pop(t, T.chart + 1.6, 0.5), 22) + check(1290, 610, pop(t, T.chart + 2, 0.5), C.teal, 20);
      }
      // The boat.
      const go = ease(seg(t, T.leave, T.arrive));
      const bx = lerp(620, 1450, go), crates = t > T.crates ? 2 + Math.min(4, Math.floor((t - T.crates) / 0.35) + 1) : 2;
      const sink = (crates - 2) * 7, by = 800 + sink + Math.sin(t * 2.4) * 5, tilt = Math.sin(t * 2) * 2 + (go > 0 && go < 1 ? -3 : 0);
      if (pk > 0) {
        let boat = '';
        // Safety line + buoy trailing behind.
        const moved = t > T.line + 0.6;
        const buoyX = bx - (moved ? 170 : 290), buoyY = 820 + Math.sin(t * 3) * 6;
        boat += `<path d="M${f1(bx - 150)},${f1(by - 40)} Q${f1((bx - 150 + buoyX) / 2)},${f1(by + 10)} ${f1(buoyX)},${f1(buoyY - 18)}" stroke="${C.muted}" stroke-width="4" fill="none"/>
          <circle cx="${f1(buoyX)}" cy="${f1(buoyY - 18)}" r="20" fill="#fff" stroke="${C.pink}" stroke-width="10"/>`;
        // Hull.
        let deck = `<path d="M${-170},-60 L170,-60 L130,10 L-130,10 Z" fill="${C.purple}" stroke="${DK.purple}" stroke-width="5"/><rect x="-170" y="-66" width="340" height="12" rx="6" fill="#fff"/>`;
        // Crates on deck.
        for (let i = 0; i < crates; i++) {
          const cx = 20 + (i % 3) * 52, cy = -92 - Math.floor(i / 3) * 52;
          const k = i < 2 ? 1 : pop(t, T.crates + (i - 2) * 0.35, 0.4);
          deck += scaleAt(cx, cy + 26, k, `<rect x="${cx - 24}" y="${cy - 24}" width="48" height="48" rx="5" fill="${BOX}" stroke="${BOXD}" stroke-width="3"/><path d="M${cx - 24},${cy} L${cx + 24},${cy}" stroke="${BOXD}" stroke-width="3"/>`);
        }
        boat += `<g transform="translate(${f1(bx)},${f1(by)}) rotate(${f1(tilt)})">${deck}</g>`;
        // Navigator on deck.
        const nv = { x: bx - 80, y: by - 60, scale: 0.62, look: A.LOOKS.a, seed: 8, hat: 'cap', talk: ctx.talking && t > T.crates && t < T.leave + 1 };
        if (t > T.line && t < T.line + 1.2) nv.frontArm = aim(nv, bx - 170, by - 60);
        else if (t > T.arrive) nv.frontArm = { a1: -110 + Math.sin(t * 6) * 10, a2: -90 };
        else if (go > 0) nv.frontArm = aim(nv, bx + 100, by - 220);
        boat = A.person(t, nv) + hat(t, nv, 'cap') + boat;
        out += scaleAt(bx, by, pk, boat);
        // Foam behind the moving boat.
        if (go > 0 && go < 1) out += [0, 1, 2].map(i => `<circle cx="${f1(bx - 190 - i * 40 - (t * 80) % 40)}" cy="${f1(by + 4)}" r="${10 - i * 2}" fill="#fff" opacity=".8"/>`).join('');
      }
      out += pill(bx + 20, by + 80, crates > 2 ? `${crates} crates · plan: 2` : 'Plan: 2 crates', crates > 2 ? DK.pink : DK.teal, pop(t, T.plan + 0.6, 0.5), 22);
      out += pill(bx - 230, by + 150, 'Moved the stop', DK.purple, between(t, T.line + 0.6, T.arrive + 0.5), 20);
      // Seagull follows the boat.
      out += critter(t, 'bird', { x: bx + 120 + Math.sin(t * 1.3) * 60, y: 450 + Math.sin(t * 2.6) * 20, scale: 0.9, seed: 4, fly: true, col: '#fff' });
      if (t > T.arrive) out += sparkAt(1664, 600, T.arrive + 0.2, t, C.gold);
      out += pill(960, 1030, 'Arrived ≠ good trip', DK.pink, pop(t, T.verdict, 0.6), 26);
      return out;
    },

    // Five fruits (analysis, execution, risk, management, outcome) tossed in a blender with the win.
    // The lid pops, they fly back into five bowls, and each gets its own grade.
    's21b-blender': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="480" fill="#EAF6F4"/>`;
      // Tiled wall, shelves with jars.
      for (let x = 0; x < 1920; x += 80) for (let y = 380; y < 840; y += 80) out += `<rect x="${x + 4}" y="${y}" width="72" height="72" rx="8" fill="#fff" opacity=".55"/>`;
      out += `<rect x="1640" y="470" width="260" height="14" rx="6" fill="#B98A64"/>` + [0, 1, 2].map(i => `<rect x="${1662 + i * 80}" y="${410 + (i % 2) * 6}" width="50" height="60" rx="10" fill="${[C.pinkL, C.peachL, C.purpleL][i]}"/>`).join('');
      // Bowls along the counter.
      const BX = [240, 480, 720, 960, 1200], FY = 790;
      const F = [['Analysis', C.teal], ['Execution', C.pink], ['Risk', C.peach], ['Management', C.purple], ['Outcome', C.gold]];
      const BLX = 1480, BLY = 840;
      // Chef behind the counter.
      const chef = { x: 1730, y: 1000, scale: 1.05, look: A.LOOKS.buyer, seed: 3, at: T.kitchen + 0.3, hat: 'chef', talk: ctx.talking && t > T.blend && t < T.pop };
      if (t > T.blend && t < T.pop) chef.frontArm = aim(chef, BLX + 60, 800);
      else if (t > T.verdict) chef.frontArm = { a1: -50, a2: -100 + Math.sin(t * 5) * 10 };
      else if (t > T.toss - 0.6 && t < T.blend) chef.frontArm = { a1: -150 + Math.sin(t * 9) * 20, a2: -120 };
      out += who(t, chef);
      // Counter.
      out += `<rect x="0" y="840" width="1920" height="26" fill="#D9C2AE"/><rect x="0" y="866" width="1920" height="214" fill="#F1E2D3"/>`;
      for (let x = 60; x < 1920; x += 320) out += `<rect x="${x}" y="900" width="260" height="150" rx="12" fill="#fff" opacity=".45"/><circle cx="${x + 130}" cy="920" r="6" fill="#D9C2AE"/>`;
      // Blender.
      const bk = pop(t, T.kitchen + 0.5, 0.6);
      const shaking = t > T.blend && t < T.pop ? Math.sin(t * 40) * 5 : 0;
      const lidUp = t > T.pop ? Math.min(1, (t - T.pop) / 0.3) : 0;
      let bl = `<rect x="${BLX - 90}" y="${BLY - 70}" width="180" height="70" rx="16" fill="${C.purple}"/><circle cx="${BLX}" cy="${BLY - 35}" r="16" fill="#fff"/>
        <path d="M${BLX - 80},${BLY - 70} L${BLX - 100},${BLY - 330} L${BLX + 100},${BLY - 330} L${BLX + 80},${BLY - 70} Z" fill="#fff" opacity=".7" stroke="${C.purpleL}" stroke-width="6"/>`;
      if (t > T.blend && t < T.pop + 0.2) {
        const sw = seg(t, T.blend, T.blend + 1);
        bl += `<path d="M${BLX - 82},${BLY - 80} L${BLX - 96},${BLY - 80 - 220 * sw} L${BLX + 96},${BLY - 80 - 220 * sw} L${BLX + 82},${BLY - 80} Z" fill="${C.peachL}" opacity=".9"/>${spiral(BLX, BLY - 180, 70, t * 12)}`;
      }
      bl += `<g transform="translate(${f1(lidUp * 150)},${f1(-lidUp * 110)}) rotate(${f1(lidUp * 30)} ${BLX} ${BLY - 340})"><rect x="${BLX - 110}" y="${BLY - 352}" width="220" height="26" rx="10" fill="${C.purple}"/><rect x="${BLX - 20}" y="${BLY - 372}" width="40" height="22" rx="6" fill="${DK.purple}"/></g>`;
      out += scaleAt(BLX, BLY, bk, `<g transform="translate(${f1(shaking)},0)">${bl}</g>`);
      if (t > T.pop && t < T.pop + 0.9) out += A.sparkle(BLX, BLY - 360, T.pop, t, C.purple);
      out += pill(BLX, BLY - 400, 'WIN', '#C98A1F', between(t, T.blend + 0.4, T.pop), 28);
      out += bub(1640, 450, 'It won, so all good!', between(t, T.blend + 0.6, T.pop), { size: 26, tail: 'right' });
      // Fruits: on the counter, into the blender, then back out into their own bowls.
      F.forEach(([lab, col], i) => {
        const home = [BX[i], FY], inB = [BLX - 40 + (i % 3) * 40, BLY - 120 - Math.floor(i / 3) * 70];
        const k1 = ease(seg(t, T.toss + i * 0.25, T.toss + i * 0.25 + 0.9)), k2 = ease(seg(t, T.pop + i * 0.15, T.pop + i * 0.15 + 1.1));
        let x, y, show = true;
        if (t < T.toss + i * 0.25) { x = home[0]; y = home[1]; }
        else if (k2 <= 0) { x = lerp(home[0], inB[0], k1); y = lerp(home[1], inB[1], k1) - Math.sin(k1 * Math.PI) * 220; show = !(t > T.blend + 0.6); }
        else { x = lerp(BLX, home[0], k2); y = lerp(BLY - 360, home[1], k2) - Math.sin(k2 * Math.PI) * 260; }
        const fk = pop(t, T.kitchen + 0.6 + i * 0.15, 0.5);
        if (show) out += scaleAt(x, y, fk, fruit(t, x, y + Math.sin(t * 3 + i) * (t > T.pop + 1.5 ? 4 : 0), col, 40, i + 2, (i > 0 && i < 4 && t > T.grades[i]) ? 'sad' : undefined));
        // Bowl in front.
        out += fade(fk, `<path d="M${BX[i] - 80},${FY + 10} Q${BX[i]},${FY + 90} ${BX[i] + 80},${FY + 10} Z" fill="#fff" stroke="#EADFD8" stroke-width="4"/>`);
        out += pill(BX[i], FY + 92, lab, i === 4 ? '#C98A1F' : [DK.teal, DK.pink, DK.peach, DK.purple][i], fk, 20);
        // Grades.
        const gk = pop(t, T.grades[i], 0.5);
        if (i === 0) out += check(BX[i], FY - 92, gk, C.teal, 26);
        else if (i < 4) out += cross(BX[i], FY - 92, gk, C.pink, 26);
        else out += pill(BX[i], FY - 92, 'Target hit', '#C98A1F', gk, 20);
      });
      const notes = ['', 'chased', '6 vs 2', 'moved stop', ''];
      notes.forEach((n, i) => { if (n) out += pill(BX[i], FY - 150, n, C.muted, pop(t, T.grades[i] + 0.3, 0.4), 18); });
      // Squirrel taster and cat.
      out += crit(t, 'squirrel', { x: 80, y: 840, scale: 0.75, seed: 6, at: T.kitchen + 0.9, hop: t > T.pop && t < T.pop + 1.6 ? 10 : 0, hopH: 20 });
      out += crit(t, 'cat', { x: 1300, y: 840, scale: 0.7, seed: 1, at: T.kitchen + 1.1, talk: ctx.talking && t > T.pop && t < T.pop + 2, flip: true });
      out += bub(1230, 560, 'They don’t blend!', between(t, T.pop + 0.4, T.grades[0] + 0.4), { size: 26 });
      out += bub(1380, 460, 'Analysis good. Trade not.', between(t, T.verdict, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson 9: Indicator vs No Indicator ================= */
  Object.assign(LIVE, {
    // A hiker at a fork reads the land with map and compass first, picks the big ridge (the 1H swing),
    // locks it, then switches on the GPS. It points at a little hill (an internal swing). She reasons it through.
    's21b-compass-trail': (s, t, ctx) => {
      const T = s.beats;
      let out = vgrad('s21bSkyC', '#E8F8F6', '#FFFDF8') + `<rect x="0" y="360" width="1920" height="720" fill="url(#s21bSkyC)"/>`;
      out += cloud(300 + (t * 12) % 300, 430, 0.5) + cloud(1000 - (t * 8) % 200, 400, 0.4);
      // Far hills.
      out += `<path d="M0,760 Q300,640 600,740 Q900,660 1200,730 Q1500,650 1920,720 L1920,1080 L0,1080 Z" fill="#DCEFD9"/>`;
      // The big ridge (1H swing) and the little hill (internal swing).
      const rk = pop(t, T.trail, 0.8), hk = pop(t, T.trail + 0.3, 0.8);
      out += scaleAt(1500, 960, rk, `<path d="M1080,960 L1500,500 L1920,960 Z" fill="#B9D9B0"/><path d="M1500,500 L1420,590 L1460,580 L1500,610 L1540,580 L1580,590 Z" fill="#fff"/>`);
      out += scaleAt(880, 960, hk, `<path d="M660,960 Q880,560 1100,960 Z" fill="#A9CF9E"/><path d="M800,780 Q880,700 960,780" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>`);
      // Ground and the forked trail.
      out += `<rect x="0" y="940" width="1920" height="140" fill="#E3EED9"/>`;
      out += fade(rk, `<path d="M420,1080 Q440,990 520,960 Q700,900 860,760" stroke="#F1E2D3" stroke-width="22" fill="none" stroke-linecap="round" stroke-dasharray="1 0"/>
        <path d="M520,960 Q900,960 1200,820 Q1380,720 1480,540" stroke="#F1E2D3" stroke-width="22" fill="none" stroke-linecap="round"/>`);
      // Signpost at the fork.
      out += scaleAt(600, 960, pop(t, T.trail + 0.8, 0.5), `<rect x="592" y="800" width="16" height="160" fill="#9B6A45"/><path d="M608,812 L700,812 L720,830 L700,848 L608,848 Z" fill="#B98A64"/><path d="M592,856 L520,856 L500,874 L520,892 L592,892 Z" fill="#B98A64"/>`);
      // Hiker.
      const hk2 = { x: 380, y: 1000, scale: 1, look: A.LOOKS.e, seed: 5, at: T.trail + 0.5, talk: ctx.talking && t > T.reason && t < T.decide + 2 };
      if (t < T.mark) hk2.frontArm = aim(hk2, 470, 770 + Math.sin(t * 2) * 6);
      else if (t < T.lock + 0.6) hk2.frontArm = aim(hk2, 520, 640);
      else if (t > T.gps && t < T.reason) hk2.frontArm = aim(hk2, 480, 820);
      else hk2.frontArm = aim(hk2, 520, 620 + Math.sin(t * 3) * 6);
      // Backpack behind her.
      out += fade(pop(t, hk2.at), `<rect x="${330}" y="${1000 - 230}" width="70" height="110" rx="20" fill="${C.peach}" stroke="${DK.peach}" stroke-width="4"/>`);
      out += who(t, hk2);
      if (pop(t, hk2.at) >= 1 && t < T.mark) {
        // Map and compass in hand.
        out += `<g transform="translate(470,${f1(770 + Math.sin(t * 2) * 6)}) rotate(-8)"><rect x="-60" y="-44" width="120" height="84" rx="6" fill="#FFF8EC" stroke="#E7C9A5" stroke-width="4"/><path d="M-44,20 L-10,-20 L20,4 L44,-28" stroke="${C.pink}" stroke-width="4" fill="none" stroke-dasharray="7 5"/></g>`;
        const na = Math.sin(t * 3) * 30 + 20;
        out += `<circle cx="540" cy="840" r="30" fill="#fff" stroke="${C.gold}" stroke-width="6"/><path d="M540,840 L${f1(540 + Math.cos(rad(na - 90)) * 22)},${f1(840 + Math.sin(rad(na - 90)) * 22)}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>`;
      }
      out += pill(470, 650, 'Eyes first', DK.purple, between(t, T.eyes, T.mark - 0.2), 24);
      // Her mark: a flag on the ridge.
      const fk = pop(t, T.mark + 0.6, 0.6);
      out += scaleAt(1500, 500, fk, `<rect x="1496" y="400" width="8" height="100" fill="${C.dark}"/><path d="M1504,${404 + Math.sin(t * 5) * 3} l70,18 l-70,20 Z" fill="${C.purple}"/>`);
      out += pill(1500, 380, 'My read: 1H swing', DK.purple, pop(t, T.mark + 1, 0.5), 22);
      // Lock.
      const lk = pop(t, T.lock, 0.5);
      out += scaleAt(1680, 420, lk, `<rect x="1652" y="414" width="56" height="44" rx="8" fill="${C.gold}"/><path d="M1662,414 L1662,398 Q1680,376 1698,398 L1698,414" stroke="#C98A1F" stroke-width="7" fill="none"/>`);
      out += pill(1760, 470, 'locked', '#C98A1F', pop(t, T.lock + 0.3, 0.5), 18);
      // GPS robot pops out of the backpack.
      const gk = pop(t, T.gps, 0.6);
      if (gk > 0) {
        const pointing = t > T.hill;
        out += scaleAt(250, 1000, gk, critter(t, 'robot', { x: 250, y: 1000, scale: 0.75, seed: 3, screen: 'GPS', col: C.peachL, talk: ctx.talking && t > T.hill && t < T.reason, hop: t > T.decide ? 6 : 0, hopH: 10 }));
        if (pointing) {
          const k = ease(seg(t, T.hill, T.hill + 0.8));
          out += `<path d="M300,780 Q${f1(lerp(300, 600, k))},${f1(lerp(780, 640, k))} ${f1(lerp(300, 860, k))},${f1(lerp(780, 740, k))}" stroke="${C.peach}" stroke-width="6" fill="none" stroke-dasharray="12 9"/>`;
          if (k >= 1) out += `<circle cx="880" cy="730" r="${16 + Math.sin(t * 6) * 3}" fill="${C.peach}"/>`;
          out += pill(880, 670, 'GPS: internal swing', DK.peach, pop(t, T.hill + 0.6, 0.5), 22);
        }
      }
      out += bub(250, 560, 'Over here!', between(t, T.hill, T.reason), { size: 26 });
      // Reasoning: compare, then decide.
      out += bub(470, 530, 'Hmm. Which one is on my map?', between(t, T.reason, T.decide), { size: 26 });
      out += check(1600, 560, pop(t, T.decide, 0.5), C.teal, 28) + sparkAt(1600, 560, T.decide + 0.2, t, C.teal);
      out += pill(960, 1040, 'GPS assists. She decides.', DK.teal, pop(t, T.decide + 0.6, 0.6), 26);
      // A goat on the ridge and a bird.
      out += bst(t, 'goat', { x: 1720, y: 760, scale: 0.6, seed: 2, at: T.trail + 1.1, flip: true });
      out += critter(t, 'bird', { x: 1100 + Math.sin(t * 0.9) * 300, y: 470 + Math.sin(t * 2) * 30, scale: 0.7, seed: 6, fly: true, col: C.purpleL, flip: Math.cos(t * 0.9) < 0 });
      return out;
    },

    // A dance class with a big mirror. One student only copies the mirror, the other learns the steps.
    // The curtain closes: the copier freezes, the learner keeps dancing. The indicator is the mirror.
    's21b-dance-curtain': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FBEFF3"/>` + ground(960, '#E8CFB8', '#D6B79C');
      for (let x = 0; x < 1920; x += 48) out += `<rect x="${x}" y="964" width="2" height="116" fill="#D6B79C"/>`;
      // Barre.
      out += `<rect x="0" y="740" width="1920" height="10" rx="5" fill="#B98A64"/>`;
      // Mirror.
      const MX0 = 420, MX1 = 1500, MY0 = 390, MY1 = 930;
      const mk = pop(t, T.studio, 0.7);
      out += scaleAt(960, 930, mk, `<rect x="${MX0 - 14}" y="${MY0 - 14}" width="${MX1 - MX0 + 28}" height="${MY1 - MY0 + 28}" rx="16" fill="${C.gold}"/><rect x="${MX0}" y="${MY0}" width="${MX1 - MX0}" height="${MY1 - MY0}" rx="8" fill="#EAF6F4"/>`);
      // Dance moves (both in sync until the curtain).
      const beat = t * 4;
      const moves = (i, frozen) => {
        if (frozen) return { frontArm: { a1: 60, a2: 80 }, backArm: { a1: 110, a2: 100 } };
        const a = Math.sin(beat + i * 0.2);
        return { frontArm: { a1: -60 + a * 50, a2: -90 + a * 40 }, backArm: { a1: -120 - a * 40, a2: -100 - a * 30 } };
      };
      const frozenB = t > T.freeze;
      const dancers = [
        { x: 760, look: A.LOOKS.a, seed: 2, label: 'Copies the mirror', at: T.copier, col: DK.pink, frozen: frozenB },
        { x: 1160, look: A.LOOKS.b, seed: 4, label: 'Knows the steps', at: T.learner, col: DK.teal, frozen: false },
      ];
      const dancing = t > T.dance;
      // Reflections inside the mirror (behind the curtain later).
      let refl = '';
      dancers.forEach((d, i) => {
        const sway = dancing && !d.frozen ? Math.sin(beat * 0.5 + i) * 40 : 0;
        const o = Object.assign({ x: d.x + 140 + sway, y: 900, scale: 0.74, look: d.look, seed: d.seed, flip: true, walking: dancing && !d.frozen }, dancing ? moves(i, d.frozen) : {});
        refl += A.person(t, o);
      });
      if (mk >= 1) out += `<g opacity=".45">${refl}</g>`;
      // Curtain: closes at T.curtain, reopens at T.mirror.
      const cc = ease(seg(t, T.curtain, T.curtain + 1.2)) * (1 - ease(seg(t, T.mirror, T.mirror + 1.2)));
      if (cc > 0) {
        const half = (MX1 - MX0) / 2 * cc;
        const drape = (x0, w) => {
          let g = `<rect x="${f1(x0)}" y="${MY0 - 10}" width="${f1(w)}" height="${MY1 - MY0 + 20}" fill="${C.purple}"/>`;
          for (let x = x0 + 20; x < x0 + w - 10; x += 44) g += `<path d="M${f1(x)},${MY0 - 10} Q${f1(x + Math.sin(t * 2 + x) * 6)},${(MY0 + MY1) / 2} ${f1(x)},${MY1 + 10}" stroke="${DK.purple}" stroke-width="6" fill="none" opacity=".6"/>`;
          return g;
        };
        out += drape(MX0, half) + drape(MX1 - half, half);
      }
      out += `<rect x="${MX0 - 30}" y="${MY0 - 26}" width="${MX1 - MX0 + 60}" height="22" rx="10" fill="${C.muted}"/>`;
      // Dancers.
      dancers.forEach((d, i) => {
        const sway = dancing && !d.frozen ? Math.sin(beat * 0.5 + i) * 40 : 0;
        const o = Object.assign({ x: d.x + sway, y: 1030, scale: 0.92, look: d.look, seed: d.seed, at: T.studio + 0.4 + i * 0.3, walking: dancing && !d.frozen, mood: d.frozen ? 'sad' : undefined }, dancing ? moves(i, d.frozen) : {});
        out += who(t, o);
        out += pill(d.x, 1052, d.label, d.col, pop(t, d.at, 0.5), 20);
      });
      // The copier's gaze line to the mirror.
      if (t > T.copier && t < T.curtain + 1) out += `<path d="M790,${1030 - 0.92 * 282} L880,${900 - 0.74 * 282}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="8 8" opacity=".7"/>`;
      if (frozenB) out += txt(800, 1030 - 0.92 * 340, '?', 70, DK.pink, { op: f1(0.6 + 0.4 * Math.sin(t * 5)) });
      out += bub(620, 640, 'Wait, what comes next?', between(t, T.freeze + 0.3, T.mirror), { size: 26 });
      // Teacher with a beret, clapping the count.
      const tc = { x: 1690, y: 1000, scale: 0.95, look: A.LOOKS.c, seed: 7, at: T.studio + 0.7, hat: 'beret', flip: true, talk: ctx.talking && t > T.curtain && t < T.curtain + 2 };
      const clap = Math.abs(Math.sin(t * 6));
      tc.frontArm = t > T.curtain - 0.4 && t < T.curtain + 1.4 ? aim(tc, 1500, 620) : { a1: -20 - clap * 30, a2: -60 - clap * 40 };
      out += who(t, tc);
      out += bub(1640, 560, 'Curtain!', between(t, T.curtain, T.freeze + 0.6), { size: 28, tail: 'right' });
      // Piano with an owl keeping the beat; a mouse peeking.
      const pk = pop(t, T.studio + 0.5, 0.6);
      out += scaleAt(200, 1000, pk, `<rect x="70" y="780" width="270" height="220" rx="14" fill="${C.dark}"/><rect x="86" y="860" width="238" height="40" fill="#fff"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${108 + i * 32}" y="860" width="16" height="24" fill="${C.dark}"/>`).join('')}`);
      out += crit(t, 'owl', { x: 200, y: 780, scale: 0.75, seed: 4, at: T.studio + 0.9, hop: dancing ? 4 : 0, hopH: 8 });
      if (dancing && t > T.studio + 1.2) out += [0, 1].map(i => { const p = ((t * 0.7) + i * 0.5) % 1; return txt(320 + p * 60, 760 - p * 120, '♪', 36, [C.pink, C.purple][i], { op: f1(1 - p) }); }).join('');
      out += crit(t, 'mouse', { x: 1530, y: 960, scale: 0.8, seed: 5, at: T.dance + 0.8, hop: 4, hopH: 10, flip: true });
      // The mirror is the indicator: great for checking form after.
      out += pill(960, 470, 'Indicator = the mirror', DK.purple, pop(t, T.mirror + 0.6, 0.5), 26);
      out += pill(960, 540, 'Check your form after', DK.teal, pop(t, T.faster, 0.5), 24);
      out += check(1175, 540, pop(t, T.faster + 0.4, 0.5), C.teal, 22);
      return out;
    },
  });

  /* ================= Lesson 10: Full Top-to-Bottom Breakdown ================= */
  Object.assign(LIVE, {
    // A magic show where the trick is only revealed after the audience guesses. The student fills six
    // cards in order (4H, 1H, 15M, 1M, risk, management); the outcome cabinet stays locked until she's done.
    's21b-magic-cabinet': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#3B2A55"/>`;
      // Spotlight cones.
      out += `<path d="M560,360 L300,900 L900,900 Z" fill="#fff" opacity="${f1(0.05 + 0.03 * Math.sin(t * 2))}"/><path d="M1360,360 L1050,900 L1650,900 Z" fill="#fff" opacity="${f1(0.06 + 0.03 * Math.sin(t * 2 + 1))}"/>`;
      // Stage floor.
      out += `<rect x="0" y="900" width="1920" height="180" fill="#9B6A45"/><rect x="0" y="900" width="1920" height="12" fill="#B98A64"/>`;
      for (let x = 0; x < 1920; x += 120) out += `<rect x="${x}" y="912" width="3" height="168" fill="#7E5435" opacity=".6"/>`;
      // Curtains + valance.
      const cw = 170 + Math.sin(t * 1.2) * 6;
      out += `<path d="M0,360 L${f1(cw)},360 Q${f1(cw - 50)},640 ${f1(cw + 10)},1000 L0,1000 Z" fill="${DK.pink}"/><path d="M1920,360 L${f1(1920 - cw)},360 Q${f1(1970 - cw)},640 ${f1(1910 - cw)},1000 L1920,1000 Z" fill="${DK.pink}"/>`;
      out += `<path d="M0,360 L1920,360 L1920,400 ${Array.from({ length: 12 }, (_, i) => `Q${f1(1920 - i * 160 - 80)},450 ${f1(1920 - (i + 1) * 160)},400`).join(' ')} Z" fill="${C.pink}"/>`;
      // Card board (easel).
      const bk = pop(t, T.stage + 0.4, 0.7);
      out += scaleAt(600, 900, bk, `<path d="M400,900 L460,820 M800,900 L740,820" stroke="#7E5435" stroke-width="12" stroke-linecap="round"/><rect x="250" y="470" width="700" height="370" rx="18" fill="#FFF8EC" stroke="${C.gold}" stroke-width="8"/>`);
      const LAB = ['4H', '1H', '15M', '1M', 'RISK', 'MGMT'];
      const SL = LAB.map((_, i) => [370 + (i % 3) * 230, 560 + Math.floor(i / 3) * 170]);
      if (bk >= 1) SL.forEach(([x, y]) => { out += `<rect x="${x - 90}" y="${y - 60}" width="180" height="120" rx="12" fill="none" stroke="#E7C9A5" stroke-width="4" stroke-dasharray="10 8"/>`; });
      // Student in the front row, filling cards in order.
      const st = { x: 230, y: 1080, scale: 1, look: A.LOOKS.buyer, seed: 2, at: T.stage + 0.6, talk: ctx.talking && t > T.cards[0] && t < T.cards[5] + 1 };
      const cur = T.cards.findIndex((c, i) => t >= c - 0.6 && t < c + 0.3);
      if (cur >= 0) st.frontArm = aim(st, 330, 760);
      else if (t > T.open) st.frontArm = { a1: -110 + Math.sin(t * 7) * 12, a2: -95 };
      // Cards flying from her hand into the slots.
      LAB.forEach((lab, i) => {
        const at = T.cards[i];
        if (t < at - 0.6) return;
        const k = ease(seg(t, at - 0.6, at));
        const [sx, sy] = SL[i], x = lerp(330, sx, k), y = lerp(760, sy, k) - Math.sin(k * Math.PI) * 120;
        const col = [C.purple, C.teal, C.peach, C.pink, DK.purple, DK.teal][i];
        out += rotAt(x, y, (1 - k) * -30, `<rect x="${f1(x - 84)}" y="${f1(y - 56)}" width="168" height="112" rx="12" fill="#fff" stroke="${col}" stroke-width="6"/>${txt(x, y + 2, lab, 34, col)}<path d="M${f1(x - 50)},${f1(y + 28)} q12,-8 24,0 t24,0 t24,0" stroke="${C.muted}" stroke-width="3" fill="none"/>`);
        if (k >= 1) out += check(x + 70, y - 46, pop(t, at + 0.1, 0.4), C.teal, 16);
      });
      out += pill(600, 870, 'Your read, in order', DK.purple, pop(t, T.cards[0] + 0.2, 0.5), 22);
      out += who(t, st);
      // The outcome cabinet.
      const CX = 1300, cbk = pop(t, T.cabinet, 0.7);
      const op = ease(seg(t, T.open, T.open + 1));
      let cab = `<rect x="${CX - 140}" y="500" width="280" height="400" rx="16" fill="${DK.purple}"/>`;
      // Inside: the outcome (a short that played out), revealed only when open.
      if (op > 0) {
        cab += `<rect x="${CX - 120}" y="520" width="240" height="360" rx="10" fill="#fff"/>`;
        const pp = partial([[CX - 100, 600], [CX - 60, 580], [CX - 30, 640], [CX, 620], [CX + 40, 720], [CX + 70, 700], [CX + 100, 800]], ease(seg(t, T.open + 0.4, T.open + 1.8)));
        cab += `<path d="${pp.d}" stroke="${C.pink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        cab += pill(CX, 850, 'Outcome', '#C98A1F', pop(t, T.open + 0.8, 0.5), 22);
      }
      // Doors swing open.
      const door = (side) => {
        const w = 140 * (1 - op * 0.85), x0 = side < 0 ? CX - 140 : CX + 140 - w;
        let d = `<rect x="${f1(x0)}" y="500" width="${f1(w)}" height="400" rx="12" fill="${C.purple}" stroke="${DK.purple}" stroke-width="4"/>`;
        if (op < 0.5) d += `<path d="${starPath(x0 + w / 2, 600, 22, t * 30 * side)}" fill="${C.gold}"/><path d="${starPath(x0 + w / 2, 800, 16, -t * 30 * side)}" fill="${C.gold}"/>`;
        return d;
      };
      cab += door(-1) + door(1);
      cab += `<rect x="${CX - 150}" y="480" width="300" height="30" rx="10" fill="${C.gold}"/>${txt(CX, 470, 'OUTCOME', 26, C.gold, { ls: 3 })}`;
      out += scaleAt(CX, 900, cbk, cab);
      // Padlock: shakes when the cat tries it, drops when the read is done.
      if (cbk >= 1 && t < T.open + 0.8) {
        const drop = seg(t, T.open - 0.4, T.open + 0.8), sh = t > T.peek && t < T.peek + 1.6 ? Math.sin(t * 40) * 6 : 0;
        const ly = 700 + drop * drop * 240, open = t > T.open - 0.4;
        out += fade(1 - drop, `<g transform="translate(${f1(CX + sh)},${f1(ly)}) rotate(${f1(drop * 50)})"><path d="M-22,0 L-22,${open ? -50 : -30} Q0,${open ? -76 : -60} 22,${open ? -50 : -30} L22,${open ? -36 : 0}" stroke="#C98A1F" stroke-width="10" fill="none"/><rect x="-36" y="-6" width="72" height="60" rx="10" fill="${C.gold}"/><circle cx="0" cy="18" r="8" fill="${C.dark}"/><rect x="-3" y="18" width="6" height="18" fill="${C.dark}"/></g>`);
      }
      // Doves fly out.
      if (t > T.open + 0.4) [0, 1, 2].forEach(i => {
        const k = seg(t, T.open + 0.4 + i * 0.25, T.open + 3.4 + i * 0.25);
        if (k <= 0 || k >= 1) return;
        out += critter(t, 'bird', { x: CX + (i - 1) * 40 + k * (i - 1) * 500, y: 640 - k * 240, scale: 0.8, seed: i + 3, fly: true, col: '#fff', flip: i === 0 });
      });
      // Magician with a top hat and wand.
      const mg = { x: 1610, y: 900, scale: 0.98, look: A.LOOKS.c, seed: 7, at: T.stage + 0.8, hat: 'top', flip: true, talk: ctx.talking && t > T.peek && t < T.peek + 2 };
      const wandTo = t > T.peek && t < T.peek + 1.8 ? [1440, 640] : t > T.open - 0.6 && t < T.open + 1 ? [1420, 560] : [1500 + Math.sin(t * 2) * 20, 700];
      mg.frontArm = aim(mg, wandTo[0], wandTo[1]);
      mg.hold = `<g transform="rotate(${t > T.peek && t < T.peek + 1.8 ? 0 : -40})"><rect x="-4" y="-80" width="8" height="90" rx="3" fill="${C.dark}"/><rect x="-4" y="-80" width="8" height="16" fill="#fff"/></g>`;
      out += who(t, mg);
      // Twinkles from the wand tip.
      for (let i = 0; i < 3; i++) { const p = ((t * 0.8) + i / 3) % 1; out += `<path d="${starPath(wandTo[0] + Math.sin(i * 2 + t) * 40 * p, wandTo[1] - 70 - p * 80, 12 * (1 - p) + 2, t * 90)}" fill="${C.gold}" opacity="${f1(1 - p)}"/>`; }
      out += bub(1640, 450, 'Not yet!', between(t, T.peek + 0.3, T.peek + 2.4), { size: 30, tail: 'right' });
      if (t > T.open - 0.6 && t < T.open + 0.6) out += A.sparkle(1420, 560, T.open - 0.6, t, C.gold);
      // A cat sneaks up to peek.
      const ck = seg(t, T.peek - 1.2, T.peek), cb = seg(t, T.peek + 1.6, T.peek + 2.8);
      const catX = t < T.peek + 1.6 ? lerp(1040, 1150, ease(ck)) : lerp(1150, 1040, ease(cb));
      out += crit(t, 'cat', { x: catX, y: 900, scale: 0.7, seed: 3, at: T.cabinet + 0.6, flip: t > T.peek + 1.6 && t < T.peek + 2.8, talk: false, hop: ck > 0 && ck < 1 ? 6 : 0, hopH: 8 });
      out += pill(1300, 950, 'Locked until your read is done', C.muted, between(t, T.cabinet + 0.8, T.open - 0.4), 20);
      out += pill(960, 1040, 'Read. Lock. Then reveal.', DK.teal, pop(t, T.final, 0.6), 26);
      return out;
    },

    // A sunny window as a lightbox. Her sheet goes up first; Dayli's tracing paper slides on top.
    // Lines that match glow teal, one differs (purple), one she missed (peach). Then: explain every decision.
    's21b-lightbox': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FDF3E9"/>` + ground(980, '#EAD7C6', '#D9C2AE');
      // Window with sunshine.
      const WX0 = 560, WX1 = 1380, WY0 = 390, WY1 = 900;
      const wk = pop(t, T.window, 0.7);
      out += scaleAt(970, 900, wk, `<rect x="${WX0 - 20}" y="${WY0 - 20}" width="${WX1 - WX0 + 40}" height="${WY1 - WY0 + 40}" rx="14" fill="#fff" stroke="#E7C9A5" stroke-width="6"/>
        <rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" fill="#FFF3C4"/><circle cx="${WX1 - 90}" cy="${WY0 + 90}" r="${54 + Math.sin(t * 2) * 4}" fill="${C.gold}" opacity=".5"/>
        <rect x="${WX0 - 40}" y="${WY1 + 14}" width="${WX1 - WX0 + 80}" height="24" rx="8" fill="#E7C9A5"/>`);
      // Sun rays.
      if (wk >= 1) for (let i = 0; i < 6; i++) { const a = rad(i * 60 + t * 20); out += `<line x1="${f1(WX1 - 90 + Math.cos(a) * 70)}" y1="${f1(WY0 + 90 + Math.sin(a) * 70)}" x2="${f1(WX1 - 90 + Math.cos(a) * 100)}" y2="${f1(WY0 + 90 + Math.sin(a) * 100)}" stroke="${C.gold}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`; }
      // Her sheet.
      const PX0 = 620, PY0 = 430, PW = 700, PH = 430;
      const sk = pop(t, T.mine, 0.6);
      out += scaleAt(PX0 + PW / 2, PY0 + PH / 2, sk, `<rect x="${PX0}" y="${PY0}" width="${PW}" height="${PH}" rx="6" fill="#fff" opacity=".93"/><rect x="${PX0 + PW / 2 - 40}" y="${PY0 - 14}" width="80" height="26" rx="4" fill="${C.peachL}" opacity=".9"/>`);
      // Her marks (a short): swings, the level, the plan arrow.
      const sw = [[PX0 + 50, PY0 + 330], [PX0 + 150, PY0 + 120], [PX0 + 250, PY0 + 230], [PX0 + 350, PY0 + 100], [PX0 + 440, PY0 + 270], [PX0 + 520, PY0 + 200], [PX0 + 640, PY0 + 360]];
      const mk = (a, b) => ease(seg(t, a, b));
      if (sk >= 1) {
        const p1 = partial(sw, mk(T.mine + 0.4, T.mine + 2));
        out += `<path d="${p1.d}" stroke="${C.dark}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        const lv = mk(T.mine + 1.8, T.mine + 2.6);
        if (lv > 0) out += `<line x1="${PX0 + 300}" x2="${f1(PX0 + 300 + 360 * lv)}" y1="${PY0 + 250}" y2="${PY0 + 250}" stroke="${C.dark}" stroke-width="5" stroke-dasharray="12 8"/>`;
        const ar = mk(T.mine + 2.6, T.mine + 3.4);
        if (ar > 0) out += `<path d="M${PX0 + 520},${PY0 + 200} L${f1(PX0 + 520 + 60 * ar)},${f1(PY0 + 200 + 120 * ar)}" stroke="${C.dark}" stroke-width="5"/>` + (ar >= 1 ? `<path d="M${PX0 + 566},${PY0 + 316} l14,10 l2,-18 Z" fill="${C.dark}"/>` : '');
        out += pill(PX0 + 110, PY0 + 40, 'My read', C.dark, pop(t, T.mine + 0.3, 0.5), 20);
      }
      // Dayli's tracing paper slides on, carried by a parrot.
      const ov = ease(seg(t, T.overlay, T.overlay + 1.4));
      if (ov > 0) {
        const dx = (1 - ov) * 900;
        let tr = `<rect x="${PX0 + 10}" y="${PY0 + 10}" width="${PW - 20}" height="${PH - 20}" rx="6" fill="${C.pinkP}" opacity=".45" stroke="${C.pink}" stroke-width="3"/>`;
        // Dayli's lines: same swings (matched), the level a little lower (differed), plus an objective (missed).
        tr += `<path d="${partial(sw, 1).d}" stroke="${C.pink}" stroke-width="4" fill="none" stroke-dasharray="3 9" stroke-linecap="round"/>`;
        tr += `<line x1="${PX0 + 300}" x2="${PX0 + 660}" y1="${PY0 + 210}" y2="${PY0 + 210}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="12 8"/>`;
        tr += `<line x1="${PX0 + 420}" x2="${PX0 + 680}" y1="${PY0 + 385}" y2="${PY0 + 385}" stroke="${C.peach}" stroke-width="6"/>`;
        tr += txt(PX0 + PW - 70, PY0 + 50, 'Dayli', 28, C.pink, { f: 'Playfair Display', w: 700 });
        out += `<g transform="translate(${f1(dx)},0)">${tr}</g>`;
        if (ov < 1) out += critter(t, 'parrot', { x: PX0 + PW + dx + 30, y: PY0 + 60 - Math.sin(ov * Math.PI) * 30, scale: 0.8, seed: 5, fly: true, flip: true });
      }
      if (t > T.overlay + 1.4) out += crit(t, 'parrot', { x: WX1 + 120, y: WY1 + 14, scale: 0.8, seed: 5, flip: true, at: T.overlay + 1.4, talk: ctx.talking && t > T.matched && t < T.notright });
      // Compare labels.
      const glow = k => k > 0 ? `<path d="${partial(sw, 1).d}" stroke="${C.teal}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${f1(0.35 * k + 0.1 * Math.sin(t * 5))}"/>` : '';
      out += glow(pop(t, T.matched, 0.5));
      out += pill(PX0 + 150, PY0 + 165, 'Matched', DK.teal, pop(t, T.matched + 0.2, 0.5), 22);
      out += pill(PX0 + 540, PY0 + 168, 'Differed', DK.purple, pop(t, T.differed, 0.5), 22);
      out += pill(PX0 + 540, PY0 + 420 - 2, 'Missed', DK.peach, pop(t, T.missed, 0.5), 22);
      // The student at the window, pencil in hand.
      const wlk = seg(t, T.window + 0.4, T.window + 2.6);
      const st = { x: lerp(120, 390, ease(wlk)), walking: wlk > 0 && wlk < 1, y: 1020, scale: 1.05, look: A.LOOKS.a, seed: 4, at: T.window + 0.2, talk: ctx.talking && t > T.explain };
      if (t > T.mine + 0.3 && t < T.mine + 3.6) st.frontArm = aim(st, 600 + Math.sin(t * 8) * 10, 650 + Math.cos(t * 7) * 30);
      else if (t > T.matched && t < T.notright) st.frontArm = aim(st, [PX0 + 30, PX0 + 30, PX0 + 30][0], 600 + Math.sin(t * 2) * 30);
      else if (t > T.explain) st.frontArm = { a1: -50, a2: -100 + Math.sin(t * 6) * 10 };
      if (t < T.mine + 3.6) st.hold = `<rect x="-4" y="-44" width="8" height="48" rx="3" fill="${C.gold}"/>`;
      out += who(t, st);
      // Cat on the sill and a snail.
      out += crit(t, 'cat', { x: 1460, y: WY1 + 14, scale: 0.7, seed: 6, at: T.window + 0.8, sleep: t < T.overlay, flip: true });
      out += bst(t, 'snail', { x: 700, y: WY1 + 14, scale: 0.45, seed: 2, at: T.window + 1 });
      out += pill(970, 1035, 'Matched · differed · why it matters', C.dark, pop(t, T.notright, 0.6), 24);
      out += bub(390, 560, 'I can explain it.', between(t, T.explain, s.end), { size: 28 });
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
