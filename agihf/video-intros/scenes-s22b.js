/**
 * scenes-s22b.js: illustrated scene types for Section 22 lesson intro videos
 * (Phase 8 · Section 22: Practice Like a Pro, Lessons 17 to 22).
 *
 * Real practice tools on My Trader Desk: quality vs outcome, violation tags,
 * the performance dashboard, weekly and monthly reviews, and the
 * strategy-or-trader diagnostic. Every LIVE entry is a pure function of t,
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
  const TYPES = ['kiln-tags', 'star-nights', 'warden-book', 'code-reader', 'gauge-dash', 'coin-pipes',
    'weed-beds', 'piano-bar', 'proposal', 'test-batches', 'clinic', 'laundry-sort'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s22b-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* Shared bits for this section. */
  // A vertical gradient fill registered under a unique id; returns the defs + id.
  const grad = (id, top, bot) => `<defs><linearGradient id="s22b${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>`;
  // A hanging luggage-style tag: string from (x, y) down to a tag that swings.
  const htag = (t, x, y, text, col, k, o = {}) => {
    if (k <= 0) return '';
    const fs = o.fs || 26, w = Math.max(70, [...text].length * fs * 0.62 + 40), len = o.len || 46;
    const sw = (o.still ? 0 : Math.sin(t * 2.6 + x * 0.01) * 6) + (1 - clamp(k)) * 30;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(sw)}) scale(${clamp(k * 1.2)})">
      <line x1="0" y1="0" x2="0" y2="${len}" stroke="${C.muted}" stroke-width="3"/>
      <path d="M${-w / 2},${len + 14} L${-w / 2 + 14},${len} L${w / 2 - 14},${len} L${w / 2},${len + 14} L${w / 2},${len + fs * 1.8} Q${w / 2},${len + fs * 1.8 + 8} ${w / 2 - 8},${len + fs * 1.8 + 8} L${-w / 2 + 8},${len + fs * 1.8 + 8} Q${-w / 2},${len + fs * 1.8 + 8} ${-w / 2},${len + fs * 1.8} Z" fill="${col}"/>
      <circle cx="0" cy="${len + 10}" r="5" fill="#fff"/>
      ${txt(0, len + fs * 1.3 + 4, text, fs, o.tc || '#fff')}</g>`;
  };
  // A little star (5 points).
  const star5 = (x, y, r, col, rot = 0) => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = rad(-90 + i * 36 + rot), rr = i % 2 ? r * 0.45 : r; return `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)},${f1(y + Math.sin(a) * rr)}`; }).join(' ')} Z" fill="${col}"/>`;
  // Little face (eyes + smile) centred at (x, y).
  const face = (t, x, y, s = 1, seed = 1, o = {}) => {
    const bl = blinkAmt(t, seed);
    const mouth = o.sad ? `<path d="M${-9 * s},${12 * s} Q0,${5 * s} ${9 * s},${12 * s}" stroke="${C.dark}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`
      : o.talk ? `<ellipse cx="0" cy="${10 * s}" rx="${6 * s}" ry="${(2 + Math.abs(Math.sin(t * 11 + seed)) * 5) * s}" fill="#6B2A2A"/>`
        : `<path d="M${-9 * s},${7 * s} Q0,${15 * s} ${9 * s},${7 * s}" stroke="${C.dark}" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${f1(x)},${f1(y)})"><ellipse cx="${-11 * s}" cy="${-4 * s}" rx="${4.5 * s}" ry="${(5.5 * (1 - bl * 0.9) * s).toFixed(2)}" fill="${C.dark}"/><ellipse cx="${11 * s}" cy="${-4 * s}" rx="${4.5 * s}" ry="${(5.5 * (1 - bl * 0.9) * s).toFixed(2)}" fill="${C.dark}"/>
      <ellipse cx="${-19 * s}" cy="${6 * s}" rx="${5 * s}" ry="${3 * s}" fill="${C.pink}" opacity=".5"/><ellipse cx="${19 * s}" cy="${6 * s}" rx="${5 * s}" ry="${3 * s}" fill="${C.pink}" opacity=".5"/>${mouth}</g>`;
  };
  // Walk helper: x position moving from a to b between t0 and t1 (eased), plus whether walking now.
  const walkX = (t, t0, t1, a, b) => ({ x: lerp(a, b, ease(seg(t, t0, t1))), walking: t > t0 && t < t1 });

  /* ================= Lesson 17: Setup Quality vs Outcome ================= */
  // A pot with a face, feet at (x, y). kind 'vase' (A, elegant) or 'bowl' (C, lumpy, cracked).
  const pot = (t, x, y, kind, o = {}) => {
    const s = o.s || 1, w = Math.sin(t * 2 + x) * 2;
    let g;
    if (kind === 'vase') {
      g = `<path d="M-30,0 Q-70,-50 -62,-100 Q-52,-140 -24,-150 L-22,-176 Q-34,-182 -30,-190 L30,-190 Q34,-182 22,-176 L24,-150 Q52,-140 62,-100 Q70,-50 30,0 Z" fill="${C.purple}" stroke="${DK.purple}" stroke-width="5"/>
        <path d="M-60,-96 Q0,-80 60,-96 L58,-80 Q0,-64 -58,-80 Z" fill="${C.gold}"/>
        <path d="M-40,-128 Q-46,-90 -36,-40" stroke="#fff" stroke-width="7" fill="none" opacity=".35" stroke-linecap="round"/>` + face(t, 4, -46, 0.9, 3, { sad: o.sad, talk: o.talk });
    } else {
      g = `<path d="M-78,-96 Q-60,-104 -40,-98 Q-10,-108 20,-98 Q50,-106 80,-94 Q76,-30 40,-4 Q0,6 -40,-4 Q-74,-24 -78,-96 Z" fill="${C.peach}" stroke="${DK.peach}" stroke-width="5"/>
        <ellipse cx="0" cy="-98" rx="78" ry="12" fill="${DK.peach}" opacity=".5"/>
        <path d="M30,-100 L22,-80 L36,-66 L26,-44" stroke="${C.pink}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` + face(t, -16, -54, 0.9, 5, { talk: o.talk, sad: o.sad });
    }
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${s}) rotate(${f1(w * (o.wob || 0.3))})">${g}</g>`;
  };

  Object.assign(LIVE, {
    // Pottery studio: every pot gets a GRADE tag and a separate SALE tag. A mouse tries to swap grades to match the sale.
    's22b-kiln-tags': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      // Studio wall, shelves of small pots, floor.
      let st = `<rect x="0" y="380" width="1920" height="620" fill="#F7E6DA"/>`;
      st += `<rect x="1680" y="470" width="220" height="12" rx="6" fill="#C89A72"/>`;
      [[1700, 470, C.tealL], [1760, 470, C.pinkL], [1830, 470, C.purpleL]].forEach(([x, y, c], i) =>
        st += `<path d="M${x - 18},${y} Q${x - 26},${y - 30} ${x - 12},${y - 44} L${x + 12},${y - 44} Q${x + 26},${y - 30} ${x + 18},${y} Z" fill="${c}"/>`);
      st += ground(1000, '#EBD6C6', '#D8BFAC');
      out += fade(bk, st);
      // Kiln: brick dome with a glowing door.
      const glow = 0.6 + Math.sin(t * 5) * 0.2;
      out += scaleAt(280, 1000, pop(t, T.set, 0.7), `<path d="M120,1000 L120,760 Q120,600 280,600 Q440,600 440,760 L440,1000 Z" fill="#C9785A" stroke="#9B4E36" stroke-width="7"/>
        ${[680, 740, 800, 860, 920].map((y, r) => Array.from({ length: 5 }, (_, i) => `<rect x="${130 + i * 64 + (r % 2) * 30}" y="${y}" width="48" height="22" rx="4" fill="#B5654A" opacity=".55"/>`).join('')).join('')}
        <rect x="260" y="560" width="40" height="50" fill="#9B4E36"/>
        ${[0, 1, 2].map(i => { const p = ((t * 0.4 + i / 3) % 1); return `<circle cx="${280 + Math.sin(p * 8 + i) * 12}" cy="${550 - p * 150}" r="${14 + p * 22}" fill="#fff" opacity="${(0.5 * (1 - p)).toFixed(2)}"/>`; }).join('')}
        <path d="M190,1000 L190,850 Q190,770 280,770 Q370,770 370,850 L370,1000 Z" fill="${C.gold}" opacity="${glow.toFixed(2)}"/>
        <path d="M220,1000 L220,870 Q220,810 280,810 Q340,810 340,870 L340,1000 Z" fill="${C.peach}"/>`);
      // Counter (the shop table).
      const TY = 820;
      const counter = `<rect x="700" y="${TY}" width="900" height="40" rx="10" fill="#C89A72"/><rect x="720" y="${TY + 40}" width="860" height="22" fill="#B4855E"/>
        <rect x="740" y="${TY + 60}" width="26" height="${1000 - TY - 60}" fill="#B4855E"/><rect x="1534" y="${TY + 60}" width="26" height="${1000 - TY - 60}" fill="#B4855E"/>`;
      // Customer walks BEHIND the counter.
      const P1 = 960, P2 = 1350;
      let cx = 2060, cw = false, cflip = true, cmood, cHold;
      if (t > T.pass1 - 1.6 && t < T.loss1 + 1.4) {
        const a = walkX(t, T.pass1 - 1.6, T.pass1, 2060, P1 + 170), b = walkX(t, T.loss1 + 0.2, T.loss1 + 1.4, P1 + 170, 2060);
        cx = t < T.loss1 ? a.x : b.x; cw = a.walking || b.walking; cflip = !(t > T.loss1); cmood = t > T.pass1 + 0.4 && t < T.loss1 + 0.4 ? 'sad' : undefined;
      } else if (t > T.buy2 - 1.6) {
        const a = walkX(t, T.buy2 - 1.6, T.buy2, 2060, P2 + 160), b = walkX(t, T.win2 + 0.8, T.win2 + 2.2, P2 + 160, 2060);
        cx = t < T.win2 + 0.8 ? a.x : b.x; cw = a.walking || b.walking; cflip = t < T.win2 + 0.8;
        if (t > T.buy2 + 0.3 && t < T.win2 + 0.8) cHold = `<g>${[0, 1, 2].map(i => `<ellipse cx="0" cy="${-i * 9}" rx="20" ry="7" fill="${C.gold}" stroke="#C98A1F" stroke-width="2"/>`).join('')}</g>`;
      }
      if (cx < 2000) {
        const co = { x: cx, y: 1000, scale: 0.9, look: A.LOOKS.e, seed: 7, walking: cw, flip: cflip, mood: cmood, talk: false, hold: cHold };
        if (cHold) co.frontArm = { a1: -30, a2: -80 };
        out += who(t, co);
      }
      out += fade(bk, counter);
      // Display stands (crossbar for tags) behind each pot.
      const stand = (x, k) => scaleAt(x, TY, k, `<rect x="${x - 6}" y="520" width="12" height="${TY - 520}" fill="#9B6A45"/><rect x="${x - 160}" y="516" width="320" height="14" rx="7" fill="#9B6A45"/>`);
      // Pots: carried from the kiln by the potter, then set on the counter.
      const carry = (t0, px) => {
        const k = ease(seg(t, t0, t0 + 1.8));
        return { x: lerp(280, px, k), y: k < 1 ? TY - Math.sin(k * Math.PI) * 40 : TY, k };
      };
      const c1 = carry(T.pot1, P1), c2 = carry(T.pot2, P2);
      out += stand(P1, pop(t, T.grade1 - 0.6)) + stand(P2, pop(t, T.grade2 - 0.6));
      // Potter.
      let px = 520, pw = false, pflip = false, parm = null;
      const carrying = (t > T.pot1 && t < T.pot1 + 1.8) ? c1 : (t > T.pot2 && t < T.pot2 + 1.8) ? c2 : null;
      if (carrying) { px = carrying.x - 120; pw = true; parm = carrying; }
      else if (t > T.pot1 + 1.8 && t < T.pot1 + 3.6) { const r = walkX(t, T.pot1 + 1.8, T.pot1 + 3.6, P1 - 120, 520); px = r.x; pw = r.walking; pflip = true; }
      else if (t > T.pot2 + 1.8 && t < T.pot2 + 4) { const r = walkX(t, T.pot2 + 1.8, T.pot2 + 4, P2 - 120, 520); px = r.x; pw = r.walking; pflip = true; }
      const po = { x: px, y: 1000, scale: 0.92, look: A.LOOKS.b, seed: 2, walking: pw, flip: pflip, at: T.set + 0.5, hat: 'beret' };
      if (parm) po.frontArm = aim(po, parm.x - 60, parm.y - 70);
      else if (t > T.both) po.frontArm = { a1: -120 + Math.sin(t * 6) * 10, a2: -100 };
      // Pots before the potter's arm? Draw potter, then pots in front.
      out += who(t, po);
      // Apron on the potter.
      if (pop(t, po.at) >= 1) { const h = headAt(t, po); out += `<rect x="${f1(h.x - 26 * h.s)}" y="${f1(h.y + 110 * h.s)}" width="${f1(52 * h.s)}" height="${f1(90 * h.s)}" rx="10" fill="#fff" opacity=".85"/>`; }
      const sad1 = t > T.loss1 && t < T.sum1;
      if (t > T.pot1) out += pot(t, c1.x, c1.y, 'vase', { s: 1.25, sad: sad1, talk: false, wob: c1.k < 1 ? 3 : 0.3 });
      if (t > T.pot2) out += pot(t, c2.x, c2.y, 'bowl', { s: 1.25, wob: c2.k < 1 ? 3 : 0.3, talk: false });
      out += A.sparkle(P1, 700, T.pot1 + 1.8, t, C.purple) + A.sparkle(P2, 760, T.pot2 + 1.8, t);
      // Tags: GRADE (left) and OUTCOME (right).
      out += htag(t, P1 - 112, 523, 'A', C.purple, pop(t, T.grade1, 0.6), { fs: 30 });
      out += htag(t, P1 + 112, 523, 'LOSS', C.pink, pop(t, T.loss1, 0.6));
      out += htag(t, P2 - 112, 523, 'C', DK.peach, pop(t, T.grade2, 0.6), { fs: 30 });
      out += htag(t, P2 + 112, 523, 'WIN', DK.teal, pop(t, T.win2, 0.6));
      // Violation sticker on the bowl's crack.
      out += pill(P2 + 40, TY - 150, 'violation', C.pink, pop(t, T.grade2 + 0.8, 0.5), 20);
      // Owl grader on the counter between the pots.
      const ox = 750;
      out += crit(t, 'owl', { x: ox, y: TY, scale: 0.72, seed: 4, monocle: true, at: T.set + 0.9, talk: ctx.talking && ((t > T.no1 && t < T.no1 + 1.4) || (t > T.no2 && t < T.no2 + 1.4)) });
      // Mouse sneaks in with a swapped grade tag.
      const sneak = (t0, tx, lab, col) => {
        if (t < t0 || t > t0 + 3.4) return '';
        const inK = ease(seg(t, t0, t0 + 1)), outK = ease(seg(t, t0 + 2.2, t0 + 3.2));
        const mx = lerp(1640, tx, inK) + (1640 - tx) * outK;
        const flee = t > t0 + 2.2;
        let g = critter(t, 'mouse', { x: mx, y: TY, scale: 0.8, seed: 9, flip: !flee, hop: 14, hopH: 8 });
        if (t < t0 + 1.4) g += htag(t, mx - 10, TY - 130, lab, col, 1, { len: 20, fs: 24 });
        else {
          const f = seg(t, t0 + 1.4, t0 + 2.4);
          g += fade(1 - f, rotAt(mx - 10 - f * 120, TY - 130 - Math.sin(f * Math.PI) * 120, f * 300, htag(t, mx - 10 - f * 120, TY - 130 - Math.sin(f * Math.PI) * 120, lab, col, 1, { len: 20, fs: 24, still: true })));
        }
        return g;
      };
      out += sneak(T.mouse1, P1 + 70, 'C', DK.peach) + sneak(T.mouse2, P2 + 90, 'B', DK.teal);
      out += cross(P1 + 180, 700, between(t, T.no1, T.no1 + 1.4), C.pink, 26) + cross(P2 + 190, 700, between(t, T.no2, T.no2 + 1.4), C.pink, 26);
      out += bub(ox + 20, 655, 'No downgrades!', between(t, T.no1, T.no1 + 1.6), { size: 28 });
      out += bub(ox + 20, 655, 'No upgrades!', between(t, T.no2, T.no2 + 1.6), { size: 28 });
      out += bub(P1 + 280, 600, 'Not today', between(t, T.pass1 + 0.3, T.loss1 + 0.2), { size: 26, tail: 'right' });
      out += bub(P2 + 250, 610, 'Sold! +2R', between(t, T.buy2 + 0.3, T.win2 + 0.8), { size: 26, tail: 'right' });
      out += A.sparkle(P2 + 80, 640, T.win2, t, C.teal);
      // Summary pills on the counter apron.
      out += pill(P1, 935, 'A + LOSS', C.purple, pop(t, T.sum1), 28);
      out += pill(P2, 935, 'C · violation · WIN', DK.peach, pop(t, T.sum2), 28);
      if (t > T.both) out += A.sparkle(P1, 680, T.both, t, C.purple) + A.sparkle(P2, 720, T.both + 0.3, t, C.teal);
      return out;
    },

    // Night observatory: two lucky stars look like "100%". Only enough nights turn dots into a discovery.
    's22b-star-nights': (s, t, ctx) => {
      const T = s.beats;
      let out = grad('night', '#3E3780', '#7F77DD');
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.8));
      // Night sky and hill.
      let sky = `<rect x="0" y="360" width="1920" height="720" fill="url(#s22bnight)"/>`;
      for (let i = 0; i < 40; i++) {
        const x = (i * 197) % 1900 + 10, y = 390 + (i * 131) % 360, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i));
        sky += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${tw.toFixed(2)}"/>`;
      }
      sky += `<path d="M0,900 Q300,820 640,850 Q900,870 1100,900 Q1500,960 1920,900 L1920,1080 L0,1080 Z" fill="#4A4390"/><path d="M0,960 Q500,900 1000,950 Q1500,1000 1920,960 L1920,1080 L0,1080 Z" fill="#3A3478"/>`;
      out += fade(bk, sky);
      // Moon with a face, arcing across once per "night" during the montage.
      const nightK = seg(t, T.montage, T.montageEnd);
      const nights = Math.floor(nightK * 7);
      const mp = t < T.montage ? 0.35 : t > T.montageEnd ? 0.5 : (nightK * 7) % 1;
      const mx = lerp(120, 1060, mp), my = 560 - Math.sin(mp * Math.PI) * 140;
      out += fade(bk, `<circle cx="${f1(mx)}" cy="${f1(my)}" r="54" fill="#FFF3D6"/><circle cx="${f1(mx + 18)}" cy="${f1(my - 14)}" r="10" fill="#F2E2BC"/>` + face(t, mx - 6, my + 6, 1.1, 8, { talk: ctx.talking && t > T.montage && t < T.montageEnd }));
      // Telescope on a tripod + astronomer.
      const tk = pop(t, T.set + 0.4, 0.7);
      out += scaleAt(420, 940, tk, `<path d="M420,820 L360,940 M420,820 L480,940 M420,820 L420,940" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/>
        ${rotAt(420, 810, -28 + Math.sin(t * 0.8) * 3, `<rect x="340" y="784" width="260" height="52" rx="18" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="5"/><rect x="580" y="776" width="40" height="68" rx="10" fill="${C.peach}"/><rect x="310" y="796" width="40" height="28" rx="6" fill="${DK.peach}"/>`)}`);
      const ao = { x: 250, y: 950, scale: 0.92, look: A.LOOKS.c, seed: 3, at: T.set + 0.6, talk: ctx.talking && t > T.calm && t < T.calm + 3, hat: 'cap' };
      ao.frontArm = aim(ao, 330, 800);
      out += who(t, ao);
      // Parrot on a post.
      out += scaleAt(640, 950, pop(t, T.set + 1, 0.6), `<rect x="632" y="760" width="14" height="190" fill="#9B6A45"/>`) + crit(t, 'parrot', { x: 640, y: 760, scale: 0.85, seed: 2, at: T.set + 1, hop: t > T.hype && t < T.hype + 2.4 ? 9 : 0, hopH: 16, talk: ctx.talking && t > T.hype && t < T.hype + 2 });
      out += bub(820, 560, '100% win rate! 🔥', between(t, T.hype, T.stamp + 0.6), { size: 30 });
      // Eyepiece view: a big lens circle at right with dots (results) appearing.
      const LX = 1280, LY = 650, LR = 230;
      const lk = pop(t, T.lens, 0.7);
      let lens = `<circle cx="${LX}" cy="${LY}" r="${LR + 16}" fill="${C.dark}"/><circle cx="${LX}" cy="${LY}" r="${LR}" fill="#2E2868"/>
        <line x1="${LX - LR}" y1="${LY}" x2="${LX + LR}" y2="${LY}" stroke="#fff" stroke-width="1.5" opacity=".2"/><line x1="${LX}" y1="${LY - LR}" x2="${LX}" y2="${LY + LR}" stroke="#fff" stroke-width="1.5" opacity=".2"/>`;
      // 30 results: first 2 are wins; the rest a believable mix.
      const RES = [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];
      const PTS = RES.map((_, i) => { const a = i * 2.4, r = 30 + (i * 37) % 180; return [LX + Math.cos(a) * r, LY + Math.sin(a) * r * 0.9]; });
      const shown = t < T.montage ? (t > T.first ? 1 : 0) + (t > T.first + 1 ? 1 : 0) : t > T.montageEnd ? 30 : 2 + Math.floor(nightK * 28);
      for (let i = 0; i < shown; i++) {
        const at = i < 2 ? T.first + i : T.montage + (i - 2) / 28 * (T.montageEnd - T.montage);
        const k = pop(t, at, 0.4), [x, y] = PTS[i];
        lens += scaleAt(x, y, k, star5(x, y, 16, RES[i] ? C.teal : C.pink, t * 20 + i * 10));
      }
      // Constellation lines link the dots once the sample is meaningful.
      if (t > T.montageEnd) {
        const ck = ease(seg(t, T.montageEnd, T.montageEnd + 1.6));
        const m = Math.floor(29 * ck);
        lens += PTS.slice(0, m).map((p, i) => `<line x1="${f1(p[0])}" y1="${f1(p[1])}" x2="${f1(PTS[i + 1][0])}" y2="${f1(PTS[i + 1][1])}" stroke="#fff" stroke-width="2" opacity=".45"/>`).join('');
      }
      out += scaleAt(LX, LY, lk, lens);
      // N counter sign + calendar.
      const N = Math.min(30, shown), wins = RES.slice(0, N).reduce((a, b) => a + b, 0);
      const sk = pop(t, T.first + 1.4, 0.6);
      out += scaleAt(1700, 640, sk, `<rect x="1580" y="470" width="240" height="190" rx="24" fill="#fff"/>${txt(1700, 530, 'A SETUPS', 26, C.muted)}${txt(1700, 600, `${wins}/${N}`, 64, C.dark, { f: 'Playfair Display' })}${txt(1700, 642, `N = ${N}`, 26, DK.purple)}`);
      // Calendar flipping pages during the montage.
      const ck2 = pop(t, T.montage - 0.4, 0.6);
      out += scaleAt(1700, 820, ck2, `<rect x="1610" y="720" width="180" height="170" rx="16" fill="#fff"/><rect x="1610" y="720" width="180" height="46" rx="16" fill="${C.pink}"/><rect x="1610" y="750" width="180" height="16" fill="${C.pink}"/>${txt(1700, 752, 'NIGHT', 24, '#fff')}${txt(1700, 852, String(N), 66, C.dark, { f: 'Playfair Display' })}`);
      // Stamps.
      out += pill(1280, 935, '2/2 · EARLY SAMPLE', DK.peach, between(t, T.stamp, T.montage - 0.2), 30);
      out += pill(1280, 935, `N = ${N} · bigger sample`, DK.teal, pop(t, T.montageEnd + 0.4), 30);
      out += bub(820, 560, 'Now it means more', between(t, T.calm, s.end), { size: 28 });
      if (t > T.montageEnd) out += A.sparkle(LX, LY - 120, T.montageEnd + 1.6, t, C.teal);
      return out;
    },
  });

  /* ================= Lesson 18: Rule Violation Tracking ================= */
  // A cartoon car with a face, facing right, (x, y) = road contact. o: col, dist (wheel spin), moving, mood, s.
  const fcar = (t, x, y, col, o = {}) => {
    const s = o.s || 1, dk = col === C.pink ? DK.pink : col === C.purple ? DK.purple : col === C.peach ? DK.peach : DK.teal;
    const bounce = o.moving ? Math.sin(t * 14 + x * 0.02) * 3 : Math.sin(t * 2 + x) * 1;
    const wheel = wx => `<g transform="translate(${wx},-30) rotate(${f1((o.dist || x) * 2.2)})"><circle r="30" fill="${C.dark}"/><circle r="13" fill="#DDD"/><rect x="-3" y="-13" width="6" height="26" fill="${C.muted}"/></g>`;
    const bl = blinkAmt(t, (o.seed || 1) + 2);
    const eyes = [-0, 1].map(i => { const ex = 30 + i * 52; return `<ellipse cx="${ex}" cy="-122" rx="16" ry="${f1(18 * (1 - bl * 0.9))}" fill="#fff"/><ellipse cx="${ex + 5}" cy="-120" rx="8" ry="${f1(10 * (1 - bl * 0.9))}" fill="${C.dark}"/>`; }).join('');
    const mouth = o.mood === 'sad' ? `<path d="M100,-48 Q120,-62 140,-48" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : o.mood === 'wow' ? `<ellipse cx="120" cy="-54" rx="12" ry="10" fill="#6B2A2A"/>` : `<path d="M98,-60 Q120,-40 142,-60" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const lines = o.moving ? [0, 1, 2].map(i => `<line x1="${-190 - i * 10}" y1="${-60 - i * 26}" x2="${-260 - i * 30 - Math.sin(t * 20 + i) * 10}" y2="${-60 - i * 26}" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`).join('') : '';
    return `<g transform="translate(${f1(x)},${f1(y + bounce)}) scale(${s})"><ellipse cx="0" cy="4" rx="160" ry="10" fill="${C.dark}" opacity=".1"/>${lines}
      <path d="M-160,-30 L-160,-90 Q-158,-112 -130,-116 L-80,-120 L-40,-176 Q-30,-186 -10,-186 L110,-186 Q130,-186 140,-170 L160,-120 Q172,-112 172,-90 L172,-30 Z" fill="${col}" stroke="${dk}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-26,-168 L-6,-168 L-6,-126 L-60,-126 Z" fill="#E8F8F6" opacity=".9"/>
      ${eyes}${mouth}
      <rect x="150" y="-104" width="22" height="16" rx="6" fill="${C.gold}"/><rect x="-166" y="-100" width="16" height="16" rx="5" fill="${C.pink}"/>
      ${wheel(-100)}${wheel(100)}</g>`;
  };
  // A storm cloud of a feeling (trigger) floating over something.
  const moodCloud = (t, x, y, text, k) => k <= 0 ? '' : scaleAt(x, y, k, `<g transform="translate(${f1(x)},${f1(y + Math.sin(t * 3) * 6)})">
      <ellipse cx="0" cy="0" rx="78" ry="34" fill="${C.purpleL}"/><ellipse cx="-44" cy="8" rx="44" ry="26" fill="${C.purpleL}"/><ellipse cx="46" cy="6" rx="46" ry="26" fill="${C.purpleL}"/><ellipse cx="6" cy="-22" rx="44" ry="30" fill="${C.purpleL}"/>
      ${[-30, 0, 30].map((dx, i) => `<line x1="${dx}" y1="38" x2="${dx - 6}" y2="${52 + ((t * 60 + i * 13) % 16)}" stroke="${C.purple}" stroke-width="4" stroke-linecap="round"/>`).join('')}
      ${txt(0, 12, text, 30, DK.purple)}</g>`);
  // A paper slip: pink VIOLATION ticket or purple TRIGGER note.
  const slip = (t, x, y, head, text, col, k, rot = -4) => k <= 0 ? '' : `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot + Math.sin(t * 2.4 + x) * 2)}) scale(${k})">
      <rect x="-130" y="-62" width="260" height="124" rx="10" fill="#fff" stroke="${col}" stroke-width="4"/><rect x="-130" y="-62" width="260" height="40" rx="10" fill="${col}"/><rect x="-130" y="-34" width="260" height="12" fill="${col}"/>
      ${txt(0, -32, head, 22, '#fff', { ls: 2 })}${txt(0, 30, text, [...text].length > 10 ? 28 : 34, C.dark)}
      <path d="M-130,62 ${Array.from({ length: 13 }, (_, i) => `L${-130 + (i + 0.5) * 20},${i % 2 ? 62 : 70}`).join(' ')} L130,62" fill="#fff" stroke="${col}" stroke-width="3"/></g>`;

  Object.assign(LIVE, {
    // A traffic warden names the EXACT violation. A feeling cloud alone gets no ticket.
    's22b-warden-book': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      // Shopfronts, sidewalk, road with three bays.
      let st = `<rect x="0" y="380" width="1920" height="520" fill="#FBEFF2"/>`;
      [[0, 360, C.pinkL], [360, 420, C.tealL], [780, 380, C.peachL], [1160, 400, C.purpleL], [1560, 360, C.pinkP]].forEach(([x, w, c], i) => {
        st += `<rect x="${x + 10}" y="${470 + (i % 2) * 30}" width="${w - 20}" height="${430 - (i % 2) * 30}" fill="${c}"/><rect x="${x + 40}" y="${560 + (i % 2) * 30}" width="${w - 80}" height="110" rx="10" fill="#fff" opacity=".7"/>`;
        st += `<path d="M${x + 10},${470 + (i % 2) * 30} ${Array.from({ length: 6 }, (_, j) => `l${(w - 20) / 12},26 l${(w - 20) / 12},-26`).join(' ')}" fill="#fff" opacity=".8"/>`;
      });
      st += `<rect x="0" y="860" width="1920" height="40" fill="#E6DCD6"/><rect x="0" y="896" width="1920" height="8" fill="#CFC3BC"/><rect x="0" y="904" width="1920" height="176" fill="#8E8496"/>`;
      for (let i = 0; i < 12; i++) st += `<rect x="${i * 170 + 20}" y="1050" width="90" height="8" rx="4" fill="#fff" opacity=".6"/>`;
      out += fade(bk, st);
      const BAYS = [520, 1000, 1480];
      // Bay lines + bay lights. Light states: green windows per bay.
      const WIN = [[T.l3g, T.l3r], [T.l2g, T.l2g + 4], [T.l1g, T.l1g + 6]];
      BAYS.forEach((bx, i) => {
        const k = pop(t, T.set + 0.3 + i * 0.2, 0.5);
        const green = t > WIN[i][0] && t < WIN[i][1];
        out += fade(k, `<rect x="${bx - 210}" y="908" width="8" height="150" fill="#fff" opacity=".8"/><rect x="${bx + 202}" y="908" width="8" height="150" fill="#fff" opacity=".8"/>`);
        out += scaleAt(bx - 200, 870, k, `<rect x="${bx - 206}" y="640" width="12" height="230" fill="${C.muted}"/><rect x="${bx - 230}" y="600" width="60" height="110" rx="14" fill="${C.dark}"/>
          <circle cx="${bx - 200}" cy="630" r="18" fill="${green ? '#5a4a4a' : C.pink}"/><circle cx="${bx - 200}" cy="680" r="18" fill="${green ? C.cash : '#4a5a52'}"/>`);
      });
      // Lamppost + pigeon.
      out += fade(bk, `<rect x="1850" y="560" width="14" height="300" fill="${C.muted}"/><rect x="1820" y="548" width="74" height="18" rx="8" fill="${C.muted}"/>`) + crit(t, 'bird', { x: 1857, y: 548, scale: 0.9, seed: 3, at: T.set + 1, flip: true, talk: ctx.talking && t > T.ok2 && t < T.ok2 + 1.2 });
      // Cars: [enterStart, arriveAt, bay, col, mood rule]
      const drive = (t0, t1, bx, fast) => {
        const k = fast ? seg(t, t0, t1) : ease(seg(t, t0, t1));
        return { x: lerp(-260, bx, fast ? 1 - (1 - k) * (1 - k) : k), moving: t > t0 && t < t1, on: t > t0 };
      };
      const c1 = drive(T.c1, T.c1 + 1.6, BAYS[2], true);
      const c2a = ease(seg(t, T.c2, T.c2 + 1.6)), c2b = ease(seg(t, T.l2g + 0.2, T.l2g + 1.2));
      const c2x = lerp(-260, BAYS[1] - 330, c2a) + 330 * c2b;
      const c3 = drive(T.c3, T.c3 + 1.2, BAYS[0], true);
      if (c1.on) out += fcar(t, c1.x, 1040, C.pink, { moving: c1.moving, mood: t > T.tk1 ? 'sad' : 'wow', seed: 1 });
      if (t > T.c2) out += fcar(t, c2x, 1040, C.teal, { moving: (t > T.c2 && t < T.c2 + 1.6) || (t > T.l2g + 0.2 && t < T.l2g + 1.2), seed: 2 }) + moodCloud(t, c2x, 700, 'FOMO', pop(t, T.c2 + 1.6, 0.6) * (1 - seg(t, T.ok2 + 2.4, T.ok2 + 3)));
      if (c3.on) out += fcar(t, c3.x, 1040, C.purple, { moving: c3.moving, mood: t > T.tk3 ? 'sad' : 'wow', seed: 3 }) + moodCloud(t, c3.x - 10, 700, 'FOMO', pop(t, T.c3 + 0.2, 0.6));
      // Warden walks to each bay and writes.
      let wx = 140, ww = false, wflip = false;
      const stops = [[T.set + 0.6, 140], [T.c1 + 0.4, BAYS[2] + 250], [T.c2 + 2.4, BAYS[1] + 250], [T.c3 + 0.6, BAYS[0] + 250]];
      for (let i = 1; i < stops.length; i++) if (t > stops[i][0]) { const d = i === 1 ? 2.2 : 1.4, r = walkX(t, stops[i][0], stops[i][0] + d, stops[i - 1][1], stops[i][1]); wx = r.x; ww = r.walking; wflip = i > 1 && r.walking; }
      const writing = [T.tk1, T.ok2, T.tk3].some(a => t > a - 0.8 && t < a + 0.4);
      const wo = { x: wx, y: 890, scale: 0.86, look: A.LOOKS.a, seed: 5, walking: ww, flip: wflip, at: T.set + 0.6, hat: 'cap', talk: ctx.talking && t > T.sum };
      wo.frontArm = writing ? { a1: 40 + Math.sin(t * 16) * 8, a2: -40 } : { a1: 70, a2: 10 };
      wo.backArm = { a1: 50, a2: -20 };
      wo.hold = `<rect x="-6" y="-46" width="54" height="66" rx="6" fill="#fff" stroke="${C.pink}" stroke-width="4"/><rect x="-6" y="-46" width="54" height="14" rx="4" fill="${C.pink}"/>`;
      out += who(t, wo);
      // Tickets and notes float above each bay.
      out += slip(t, BAYS[2], 540, 'VIOLATION', 'EARLY ENTRY', C.pink, pop(t, T.tk1, 0.6));
      out += slip(t, BAYS[1] - 40, 520, 'TRIGGER', 'FOMO', C.purple, pop(t, T.ok2, 0.6), 3);
      out += check(BAYS[1] + 130, 470, pop(t, T.ok2 + 0.8, 0.5), C.teal, 30) + pill(BAYS[1] - 40, 640, 'no violation', DK.teal, pop(t, T.ok2 + 0.9, 0.5), 24);
      out += slip(t, BAYS[0] - 150, 520, 'TRIGGER', 'FOMO', C.purple, pop(t, T.tk3 + 0.9, 0.6), 4);
      out += slip(t, BAYS[0] + 150, 560, 'VIOLATION', 'CHASED', C.pink, pop(t, T.tk3, 0.6), -5);
      out += bub(BAYS[2] - 120, 760, 'Too early!', between(t, T.c1 + 1.2, T.tk1 + 0.6), { size: 26 });
      out += bub(BAYS[0] + 90, 640, 'Window closed!', between(t, T.c3 + 0.9, T.tk3 - 0.1), { size: 26 });
      out += A.sparkle(BAYS[1] + 130, 470, T.ok2 + 0.8, t, C.teal);
      // Summary legend.
      if (t > T.sum) out += A.sparkle(BAYS[0] - 150, 470, T.sum, t, C.purple) + A.sparkle(BAYS[0] + 150, 500, T.sum + 0.3, t, C.pink);
      return out;
    },

    // Garage: "this car is just bad" tells you nothing. The diagnostic computer counts named codes you can fix.
    's22b-code-reader': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="380" width="1920" height="620" fill="#EEF1F6"/>`;
      for (let i = 0; i < 8; i++) st += `<rect x="${i * 240 + 20}" y="400" width="200" height="12" rx="6" fill="#D8DEE8"/>`;
      // Pegboard with tools.
      st += `<rect x="1430" y="440" width="440" height="250" rx="16" fill="#E7C9A5"/>`;
      for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) st += `<circle cx="${1460 + i * 48}" cy="${470 + j * 60}" r="4" fill="#C49A70"/>`;
      st += `<path d="M1490,500 l0,120 M1475,500 l30,0" stroke="${C.muted}" stroke-width="10" stroke-linecap="round"/><circle cx="1600" cy="560" r="36" fill="none" stroke="${C.peach}" stroke-width="10"/><rect x="1700" y="480" width="24" height="150" rx="8" fill="${C.teal}"/><rect x="1780" y="500" width="50" height="110" rx="10" fill="${C.pink}"/>`;
      st += ground(1000, '#D9DEE6', '#C2C9D4');
      out += fade(bk, st);
      // Car on a lift.
      const lift = ease(seg(t, T.lift, T.lift + 1.4)) * 70;
      const CX = 760;
      out += fade(bk, `<rect x="${CX - 200}" y="${f1(980 - lift)}" width="400" height="20" rx="8" fill="${C.muted}"/><rect x="${CX - 20}" y="${f1(1000 - lift)}" width="40" height="${f1(lift)}" fill="#B6AEB8"/><rect x="${CX - 120}" y="990" width="240" height="12" rx="6" fill="${C.muted}"/>`);
      const happy = t > T.fixed;
      out += scaleAt(CX, 980, pop(t, T.set + 0.3, 0.7), fcar(t, CX, 980 - lift, C.peach, { seed: 6, mood: happy ? undefined : 'sad' }));
      // Owner: "This car is just bad."
      const oo = { x: 300, y: 1000, scale: 0.92, look: A.LOOKS.buyer, seed: 1, at: T.set + 0.8, talk: ctx.talking && t > T.bad && t < T.bad + 1.6, mood: t > T.bad + 2 && t < T.codes ? 'sad' : undefined };
      oo.frontArm = t > T.bad && t < T.bad + 2 ? { a1: -20, a2: -40 } : happy ? { a1: -120 + Math.sin(t * 7) * 12, a2: -100 } : undefined;
      out += who(t, oo);
      out += bub(400, 540, 'This car is just bad.', between(t, T.bad, T.cross + 1.6), { size: 28 });
      out += cross(600, 460, between(t, T.cross, T.cross + 1.6), C.pink, 30) + pill(400, 615, 'not actionable', C.pink, between(t, T.cross + 0.2, T.cross + 1.6), 24);
      // Mechanic with a plug cable to the robot diagnostic computer.
      const mo = { x: 1130, y: 1000, scale: 0.92, look: A.LOOKS.d, seed: 4, flip: true, at: T.set + 1, hat: 'hard', talk: ctx.talking && t > T.codes && t < T.fixed };
      const fixing = t > T.fix && t < T.fixed;
      mo.frontArm = fixing ? aim(mo, 900, 860 - lift + Math.sin(t * 14) * 10) : { a1: 110, a2: 100 };
      if (fixing) mo.hold = `<g transform="rotate(${f1(Math.sin(t * 14) * 30)})"><rect x="-8" y="-60" width="16" height="70" rx="6" fill="${C.muted}"/><circle cy="-64" r="16" fill="none" stroke="${C.muted}" stroke-width="8"/></g>`;
      out += who(t, mo);
      // Robot diagnostic computer.
      const RX = 1360;
      const plugK = ease(seg(t, T.plug, T.plug + 1));
      if (plugK > 0) out += `<path d="M${RX - 50},${900} Q${lerp(RX - 50, 1000, plugK * 0.5)},${980} ${f1(lerp(RX - 50, 930, plugK))},${f1(lerp(900, 900 - lift, plugK))}" stroke="${C.dark}" stroke-width="7" fill="none"/>`;
      const reading = t > T.plug + 1 && t < T.codes;
      out += crit(t, 'robot', { x: RX, y: 1000, scale: 1.1, seed: 2, at: T.set + 1.3, screen: reading ? ['.', '..', '...'][Math.floor(t * 3) % 3] : t > T.codes ? '6/20' : 'OBD', talk: ctx.talking && t > T.codes && t < T.codes + 2 });
      // Code readout panel (big screen floating above the robot).
      const PX = 760, PY = 540;
      const pk = pop(t, T.codes - 0.4, 0.6);
      const ROWS = [['EARLY ENTRY', 6, C.pink], ['CHASED', 2, C.purple], ['MOVED STOP', 1, C.peach]];
      if (pk > 0) {
        let g = `<rect x="${PX - 270}" y="${PY - 130}" width="540" height="290" rx="22" fill="${C.dark}"/><rect x="${PX - 252}" y="${PY - 112}" width="504" height="254" rx="14" fill="#2F3A46"/>`;
        g += txt(PX - 230, PY - 72, 'LAST 20 SETUPS', 22, C.tealL, { a: 'start', ls: 2 });
        ROWS.forEach(([lab, n, col], i) => {
          const k = ease(seg(t, T.codes + i * 0.6, T.codes + i * 0.6 + 0.8)), y = PY - 20 + i * 62;
          const hl = i === 0 && t > T.focus;
          g += `<rect x="${PX - 236}" y="${y - 28}" width="472" height="52" rx="10" fill="${hl ? '#47566A' : 'none'}"/>`;
          g += fade(k, txt(PX - 220, y + 9, lab, 26, '#fff', { a: 'start' }) + `<rect x="${PX + 20}" y="${y - 10}" width="${f1(150 * k * n / 6)}" height="20" rx="10" fill="${col}"/>` + txt(PX + 230, y + 9, `${n}/20`, 26, '#fff', { a: 'end' }));
        });
        out += scaleAt(PX, PY + 160, pk * 0.85, g);
      }
      out += pill(PX, 428, '6 of 20 entered before continuation', C.pink, pop(t, T.focus + 0.4, 0.5), 22);
      // Fix: the named part gets practice.
      out += A.sparkle(CX + 120, 860 - lift, T.fixed, t, C.teal) + pill(1590, 735, 'practice: wait for continuation', DK.teal, pop(t, T.fixed + 0.2, 0.5), 24);
      // Cat napping on a tyre stack.
      out += fade(bk, `<ellipse cx="1760" cy="975" rx="70" ry="26" fill="${C.dark}"/><ellipse cx="1760" cy="975" rx="30" ry="10" fill="#555"/><ellipse cx="1760" cy="935" rx="70" ry="26" fill="${C.dark}"/><ellipse cx="1760" cy="935" rx="30" ry="10" fill="#555"/>`) + crit(t, 'cat', { x: 1760, y: 915, scale: 0.75, seed: 5, at: T.set + 1.6, sleep: t < T.fixed });
      return out;
    },
  });

  /* ================= Lesson 19: Performance Tracking ================= */
  // A round gauge: centre (x, y), radius r, value v in 0..1 (needle), label, readout.
  const gauge = (x, y, r, v, label, read, col, k = 1) => {
    if (k <= 0) return '';
    const a0 = 150, a1 = 390, ang = a0 + (a1 - a0) * clamp(v);
    const arc = (from, to, c, w) => { const p = q => [x + Math.cos(rad(q)) * r * 0.82, y + Math.sin(rad(q)) * r * 0.82]; const [sx, sy] = p(from), [ex, ey] = p(to); return `<path d="M${f1(sx)},${f1(sy)} A${r * 0.82},${r * 0.82} 0 ${to - from > 180 ? 1 : 0} 1 ${f1(ex)},${f1(ey)}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`; };
    let ticks = '';
    for (let i = 0; i <= 8; i++) { const q = rad(a0 + (a1 - a0) * i / 8); ticks += `<line x1="${f1(x + Math.cos(q) * r * 0.62)}" y1="${f1(y + Math.sin(q) * r * 0.62)}" x2="${f1(x + Math.cos(q) * r * 0.7)}" y2="${f1(y + Math.sin(q) * r * 0.7)}" stroke="#fff" stroke-width="4" opacity=".6"/>`; }
    return scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="${r}" fill="#2F2A3E" stroke="${C.muted}" stroke-width="8"/>${arc(a0, a1, '#4A4458', 14)}${arc(a0, ang, col, 14)}${ticks}
      <line x1="${x}" y1="${y}" x2="${f1(x + Math.cos(rad(ang)) * r * 0.66)}" y2="${f1(y + Math.sin(rad(ang)) * r * 0.66)}" stroke="${C.pink}" stroke-width="7" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="12" fill="${C.pink}"/>
      ${txt(x, y + r * 0.42, read, r * 0.26, '#fff')}${txt(x, y + r + 40, label, 26, C.dark, { ls: 2 })}`);
  };

  Object.assign(LIVE, {
    // Driving: the gauges you control sit on top. The fuel-price sign (P&L) flickers underneath. A cat can't stop staring at it.
    's22b-gauge-dash': (s, t, ctx) => {
      const T = s.beats;
      let out = grad('road', '#CDEBF0', '#FBEFF2');
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      // Windshield view: sky, hills, road to the horizon, passing posts.
      let v = `<rect x="0" y="370" width="1920" height="330" fill="url(#s22broad)"/>` + cloud(300 + (t * 20) % 300, 440, 0.6) + cloud(1500 - (t * 14) % 260, 420, 0.5);
      v += `<path d="M0,620 Q400,560 900,600 Q1400,640 1920,590 L1920,700 L0,700 Z" fill="#CFE6C9"/>`;
      v += `<path d="M900,600 L1020,600 L1500,700 L420,700 Z" fill="#9C94A6"/>`;
      for (let i = 0; i < 4; i++) { const p = ((t * 0.9 + i / 4) % 1), y = 600 + p * p * 100, w = 4 + p * 14; v += `<rect x="${f1(960 - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(4 + p * 14)}" fill="#fff" opacity=".85"/>`; }
      for (let i = 0; i < 3; i++) { const p = ((t * 0.45 + i / 3) % 1), x = 1040 + p * p * 700, y = 596 + p * p * 70; v += `<rect x="${f1(x)}" y="${f1(y - 20 - p * 60)}" width="${f1(3 + p * 8)}" height="${f1(20 + p * 60)}" fill="${C.muted}"/>`; }
      out += fade(bk, v);
      // Fuel-price style sign on the roadside (the P&L), approaching, then held in view.
      const fp = ease(seg(t, T.sign, T.sign + 2));
      const sx = lerp(1060, 1560, fp), sy = lerp(600, 520, fp), ss = lerp(0.3, 1, fp);
      if (t > T.sign) {
        const r = (Math.sin(t * 3.1) * 1.6 + Math.sin(t * 7.3) * 0.9);
        const val = (r >= 0 ? '+' : '') + r.toFixed(1) + 'R';
        out += `<g transform="translate(${f1(sx)},${f1(sy)}) scale(${f1(ss)})"><rect x="-10" y="0" width="20" height="170" fill="${C.muted}"/><rect x="-120" y="-130" width="240" height="140" rx="16" fill="#fff" stroke="${C.peach}" stroke-width="8"/>${txt(0, -90, 'P&amp;L', 28, C.muted)}${txt(0, -30, val, 52, r >= 0 ? DK.teal : DK.pink, { f: 'Playfair Display' })}</g>`;
      }
      // Dashboard.
      const dk = pop(t, T.set + 0.2, 0.8);
      out += scaleAt(960, 1080, dk, `<path d="M0,700 Q960,640 1920,700 L1920,1080 L0,1080 Z" fill="#E9DDF0"/><path d="M0,700 Q960,640 1920,700 L1920,722 Q960,664 0,722 Z" fill="${C.purpleL}"/>
        <rect x="380" y="738" width="1160" height="320" rx="40" fill="#F7F1FA" stroke="${C.purpleL}" stroke-width="5"/>`);
      out += pill(960, 770, 'PROCESS · you control this', C.purple, pop(t, T.g1 - 0.4, 0.5), 22);
      const g1v = 0.82 * ease(seg(t, T.g1, T.g1 + 1.6)) + (t > T.g1 + 1.6 ? Math.sin(t * 3) * 0.01 : 0);
      out += gauge(640, 880, 100, g1v, 'RULES FOLLOWED', `${Math.round(g1v * 100)}%`, C.teal, pop(t, T.g1 - 0.3, 0.6));
      // Quality mix: a segmented donut.
      const qk = pop(t, T.g2 - 0.3, 0.6);
      if (qk > 0) {
        const mix = [[0.42, C.purple, 'A'], [0.33, C.teal, 'B'], [0.25, C.peach, 'C']], R = 78;
        const grow = ease(seg(t, T.g2, T.g2 + 1.6));
        let a = -90, g = `<circle cx="1280" cy="880" r="100" fill="#2F2A3E" stroke="${C.muted}" stroke-width="8"/>`;
        mix.forEach(([p, c, l]) => {
          const sweep = p * 360 * grow, e = a + sweep;
          if (sweep > 0.5) g += `<path d="M${f1(1280 + Math.cos(rad(a)) * R)},${f1(880 + Math.sin(rad(a)) * R)} A${R},${R} 0 ${sweep > 180 ? 1 : 0} 1 ${f1(1280 + Math.cos(rad(e - 1)) * R)},${f1(880 + Math.sin(rad(e - 1)) * R)}" stroke="${c}" stroke-width="26" fill="none"/>`;
          const m = rad(a + sweep / 2);
          if (grow > 0.9) g += txt(1280 + Math.cos(m) * R, 880 + Math.sin(m) * R + 8, l, 24, '#fff');
          a = e;
        });
        g += txt(1280, 1020, 'QUALITY MIX', 26, C.dark, { ls: 2 });
        out += scaleAt(1280, 880, qk, g);
      }
      // N badges on each gauge.
      out += pill(735, 790, 'N = 24', C.dark, pop(t, T.n, 0.5), 20) + pill(1375, 790, 'N = 24', C.dark, pop(t, T.n + 0.3, 0.5), 20);
      // Little P&L strip underneath, smaller.
      const lk = pop(t, T.pnl, 0.6);
      out += scaleAt(960, 950, lk, `<rect x="830" y="905" width="260" height="90" rx="14" fill="#2F2A3E"/>${txt(960, 938, 'P&amp;L · underneath', 18, C.tealL, { ls: 1 })}${txt(960, 978, '+2.4R', 32, '#fff')}`);
      out += pill(960, 1030, 'early sample', DK.peach, pop(t, T.n + 0.6, 0.5), 22);
      // Bobblehead dog on the dash (nods with the road).
      const nod = Math.sin(t * 6) * 10;
      out += scaleAt(1490, 742, pop(t, T.set + 1.2, 0.6), `<rect x="1460" y="724" width="60" height="22" rx="6" fill="${C.purple}"/><g transform="rotate(${f1(nod)} 1490 714)">${critter(t, 'dog', { x: 1460, y: 730, scale: 0.42, seed: 3 })}</g>`);
      // Driving instructor pointing at the top gauges.
      const io = { x: 200, y: 1060, scale: 0.98, look: A.LOOKS.e, seed: 6, at: T.set + 0.8, hat: 'cap', talk: ctx.talking && t > T.tap && t < T.tap + 2.4 };
      io.frontArm = t > T.tap - 0.2 ? aim(io, 330 + Math.sin(t * 8) * 6, 810) : { a1: 100, a2: 95 };
      out += who(t, io);
      out += bub(310, 560, 'Eyes up here 👆', between(t, T.tap, T.tap + 3.4), { size: 28 });
      // Cat passenger glued to the sign.
      const stare = t > T.cat && t < T.tap + 0.6;
      const co = { x: 1720, y: 1000, scale: 1, seed: 4, at: T.set + 1.4, flip: !stare && t > T.tap + 0.6, hop: stare ? 10 : 0, hopH: 22, talk: ctx.talking && t > T.cat && t < T.cat + 1.6 };
      out += crit(t, 'cat', co);
      out += bub(1640, 600, 'Ooh, the number!', between(t, T.cat, T.tap + 0.4), { size: 28, tail: 'right' });
      return out;
    },

    // Two water tanks run ten trades each. 60% wins can still drain; 40% wins can still fill. Win rate alone can't tell.
    's22b-coin-pipes': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      out += fade(bk, `<rect x="0" y="380" width="1920" height="620" fill="#EAF6F4"/>` + ground(1000, '#DCEFEA', '#C4E2DB'));
      // Pipes along the top feeding both tanks.
      out += fade(bk, `<rect x="300" y="430" width="1320" height="22" rx="11" fill="${C.muted}"/>`);
      const TK = [
        { x: 620, seq: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0], win: 0.5, wr: '60%', col: C.pink, exp: '−0.1R per trade', duck: C.peachL },
        { x: 1300, seq: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1], win: 2, wr: '40%', col: C.teal, exp: '+0.2R per trade', duck: C.gold },
      ];
      const W = 300, TOP = 600, BOT = 960, H = BOT - TOP, U = 0.1;
      const at = i => T.trades + i * T.step;
      TK.forEach((tk, j) => {
        const k = pop(t, T.set + 0.3 + j * 0.3, 0.7);
        // Level: start 0.5, each trade eases its change in.
        let lv = 0.5;
        tk.seq.forEach((w, i) => { lv += (w ? tk.win : -1) * U * ease(seg(t, at(i) + 0.3, at(i) + 0.8)); });
        const ly = BOT - lv * H;
        let g = `<rect x="${tk.x - W / 2 - 10}" y="${TOP - 10}" width="${W + 20}" height="${H + 20}" rx="26" fill="#fff" stroke="${C.muted}" stroke-width="6"/>`;
        const wav = Array.from({ length: 6 }, (_, q) => `Q${f1(tk.x - W / 2 + q * W / 6 + W / 12)},${f1(ly + Math.sin(t * 4 + q) * 8)} ${f1(tk.x - W / 2 + (q + 1) * W / 6)},${f1(ly)}`).join(' ');
        g += `<path d="M${tk.x - W / 2},${f1(ly)} ${wav} L${tk.x + W / 2},${BOT} L${tk.x - W / 2},${BOT} Z" fill="${C.tealL}" opacity=".9"/>`;
        g += `<line x1="${tk.x - W / 2 - 10}" y1="${BOT - 0.5 * H}" x2="${tk.x + W / 2 + 10}" y2="${BOT - 0.5 * H}" stroke="${C.muted}" stroke-width="3" stroke-dasharray="10 8"/>`;
        // Tap from the pipe, and a drain spout at the bottom.
        g += `<rect x="${tk.x + 96}" y="452" width="28" height="${TOP - 462}" fill="${C.muted}"/><rect x="${tk.x + 80}" y="${TOP - 26}" width="60" height="20" rx="8" fill="${C.muted}"/>`;
        g += `<rect x="${tk.x + W / 2 + 6}" y="${BOT - 50}" width="60" height="26" rx="8" fill="${C.muted}"/>`;
        out += scaleAt(tk.x, BOT, k, g);
        // Duck floating on the surface.
        if (k >= 1) out += critter(t, 'duck', { x: tk.x - 40, y: ly + 18, scale: 0.9, seed: j + 2, talk: false });
        // Trade effects.
        tk.seq.forEach((w, i) => {
          const p = seg(t, at(i), at(i) + 0.9);
          if (p <= 0 || p >= 1) return;
          if (w) {
            const n = tk.win >= 2 ? 6 : 2;
            for (let q = 0; q < n; q++) { const y = lerp(TOP - 10, ly, clamp(p * 1.6 - q * 0.08)); out += `<ellipse cx="${tk.x + 110 + (q - n / 2) * 10}" cy="${f1(y)}" rx="${tk.win >= 2 ? 12 : 8}" ry="${tk.win >= 2 ? 18 : 12}" fill="${C.teal}" opacity="${(1 - p).toFixed(2)}"/>`; }
            out += pill(tk.x + 210, TOP - 40, `+${tk.win}R`, DK.teal, Math.sin(p * Math.PI) * 1.1, 24);
          } else {
            const sx = tk.x + W / 2 + 66;
            out += `<path d="M${sx},${BOT - 37} Q${sx + 60},${BOT - 30} ${sx + 70 + p * 20},${BOT + 30}" stroke="${C.tealL}" stroke-width="${f1(22 * Math.sin(p * Math.PI))}" fill="none" stroke-linecap="round"/>`;
            out += pill(tk.x + W / 2 + 120, BOT - 90, '−1R', DK.pink, Math.sin(p * Math.PI) * 1.1, 24);
          }
        });
        // Trade chips row under the tank title.
        const chips = tk.seq.map((w, i) => { const ck = pop(t, at(i), 0.4); return ck > 0 ? scaleAt(tk.x - W / 2 - 46, TOP + 24 + i * 36, ck, `<circle cx="${tk.x - W / 2 - 46}" cy="${TOP + 24 + i * 36}" r="14" fill="${w ? C.teal : C.pink}"/>`) : `<circle cx="${tk.x - W / 2 - 46}" cy="${TOP + 24 + i * 36}" r="14" fill="#fff" stroke="${C.muted}" stroke-width="2"/>`; }).join('');
        out += fade(k, chips);
        // Win rate sign.
        out += pill(tk.x - 40, 520, `win rate ${tk.wr}`, j ? DK.purple : C.purple, pop(t, T.rate + j * 0.5, 0.5), 22);
        // Result.
        out += pill(tk.x, 1036, tk.exp, j ? DK.teal : C.pink, pop(t, T.result + j * 0.6, 0.5), 28);
        if (t > T.result + j * 0.6) out += A.sparkle(tk.x, ly, T.result + j * 0.6, t, j ? C.teal : C.pink);
      });
      // Parrot on the pipe, cheering for the 60% tank, then confused.
      const confused = t > T.result;
      out += crit(t, 'parrot', { x: 960, y: 1000, scale: 1.1, seed: 2, at: T.set + 1, hop: !confused && t > T.rate ? 7 : 0, hopH: 18, talk: ctx.talking && t > T.rate && t < T.rate + 2, flip: true });
      out += bub(960, 780, '60%! Amazing!', between(t, T.rate + 0.4, T.trades + 4.4), { size: 26 });
      out += bub(960, 780, 'Wait... what?', between(t, T.result + 0.2, s.end), { size: 26 });
      out += pill(960, 1036, 'before trading costs', C.muted, pop(t, T.costs, 0.5), 22);
      return out;
    },
  });

  /* ================= Lesson 20: Weekly Review ================= */
  // A weed with a cheeky face, root at (x, y), scale k.
  const weed = (t, x, y, k, seed) => k <= 0 ? '' : scaleAt(x, y, k, `<g transform="rotate(${f1(Math.sin(t * 3 + seed) * 6)} ${x} ${y})">
      <path d="M${x},${y} L${x - 26},${y - 40} L${x - 8},${y - 34} L${x - 14},${y - 70} L${x},${y - 50} L${x + 14},${y - 74} L${x + 10},${y - 36} L${x + 28},${y - 44} Z" fill="#7BAF5E" stroke="#4F8A3A" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="${x - 5}" cy="${y - 30}" r="3" fill="${C.dark}"/><circle cx="${x + 6}" cy="${y - 30}" r="3" fill="${C.dark}"/><path d="M${x - 6},${y - 20} l12,0" stroke="${C.dark}" stroke-width="2.5" stroke-linecap="round"/></g>`);
  const flower = (t, x, y, k, col) => k <= 0 ? '' : `<line x1="${x}" y1="${y}" x2="${x}" y2="${f1(y - 60 * k)}" stroke="#4F8A3A" stroke-width="5"/>` + scaleAt(x, y - 60 * k, k, `<g transform="rotate(${f1(t * 30)} ${x} ${f1(y - 60 * k)})">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${f1(x + Math.cos(rad(i * 72)) * 14)}" cy="${f1(y - 60 * k + Math.sin(rad(i * 72)) * 14)}" rx="11" ry="9" fill="${col}"/>`).join('')}</g><circle cx="${x}" cy="${f1(y - 60 * k)}" r="9" fill="${C.gold}"/>`);

  Object.assign(LIVE, {
    // Seven weedy beds. Running between all of them fixes nothing. One bed per week actually blooms.
    's22b-weed-beds': (s, t, ctx) => {
      const T = s.beats;
      let out = grad('garden', '#DDF1F4', '#F4FAEF');
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="340" fill="url(#s22bgarden)"/>` + cloud(260 + (t * 14) % 240, 450, 0.6) + cloud(1500 - (t * 10) % 200, 430, 0.5);
      st += `<rect x="0" y="700" width="1920" height="380" fill="#D6EBC4"/><rect x="0" y="700" width="1920" height="6" fill="#BCD9A6"/>`;
      // Fence.
      for (let i = 0; i < 25; i++) st += `<rect x="${i * 80 + 10}" y="610" width="24" height="100" rx="6" fill="#fff" opacity=".9"/>`;
      st += `<rect x="0" y="640" width="1920" height="12" fill="#fff" opacity=".9"/><rect x="0" y="680" width="1920" height="12" fill="#fff" opacity=".9"/>`;
      out += fade(bk, st);
      const LAB = ['chased', 'oversized', 'early entry', 'moved stop', 'hesitation', 'extra trade', 'fear exit'];
      const BX = i => 200 + i * 253, BY = 960, F = 2;
      // Gardener path: frantic dash between beds, then focus.
      const hops = [[T.frantic, 3], [T.frantic + 1, 0], [T.frantic + 2, 5], [T.frantic + 3, 1], [T.frantic + 4, 6], [T.frantic + 5, 4]];
      let gx = BX(3) - 30, gw = false, gflip = false, prevX = BX(3) - 30;
      hops.forEach(([a, b]) => { if (t > a) { const r = walkX(t, a, a + 0.55, prevX, BX(b) - 30); gx = r.x; gw = r.walking; gflip = BX(b) - 30 < prevX; } prevX = BX(b) - 30; });
      if (t > T.pick) { const r = walkX(t, T.pick, T.pick + 1.4, prevX, BX(F) - 110); gx = r.x; gw = r.walking; gflip = BX(F) - 110 < prevX; }
      const frantic = t > T.frantic && t < T.stop;
      const weeding = t > T.weed && t < T.bloom;
      const go = { x: gx, y: 935, scale: 1, look: A.LOOKS.d, seed: 3, hat: 'beret', walking: gw || (frantic && Math.floor(t * 2) % 2 === 0 && false), flip: gflip, at: T.set + 0.5, mood: t > T.stop - 0.6 && t < T.pick ? 'sad' : undefined, talk: ctx.talking && t > T.stop && t < T.pick };
      if (weeding) { const yy = 900 + Math.sin(t * 9) * 26; go.frontArm = aim(go, BX(F) - 30 + Math.sin(t * 2.3) * 40, yy); }
      else if (frantic) go.frontArm = { a1: -60 + Math.sin(t * 12) * 30, a2: -90 };
      else if (t > T.bloom) go.frontArm = { a1: -120 + Math.sin(t * 6) * 10, a2: -100 };
      if (weeding || (t > T.pick + 1.4 && t < T.weed)) go.hold = `<rect x="-5" y="-6" width="10" height="44" rx="4" fill="#9B6A45"/><path d="M-14,38 L14,38 L10,60 L-10,60 Z" fill="${C.muted}"/>`;
      out += who(t, go);
      // Sweat drops while frantic.
      if (frantic) { const h = headAt(t, go); [0, 1].forEach(q => { const p = (t * 1.6 + q * 0.5) % 1; out += `<ellipse cx="${f1(h.x + (q ? 50 : -50) * (1 + p * 0.4))}" cy="${f1(h.y - 40 + p * 50)}" rx="7" ry="11" fill="${C.tealL}" opacity="${(1 - p).toFixed(2)}"/>`; }); }
      // Beds.
      LAB.forEach((lab, i) => {
        const x = BX(i), k = pop(t, T.set + 0.4 + i * 0.12, 0.5);
        const focus = i === F && t > T.sign;
        const dim = t > T.sign && i !== F ? 0.45 : 1;
        let g = `<ellipse cx="${x}" cy="${BY}" rx="118" ry="38" fill="#8B5E3C"/><ellipse cx="${x}" cy="${BY - 6}" rx="108" ry="27" fill="#A47148"/>`;
        // Weeds: 4 per bed. In frantic mode, pulled weeds pop back.
        for (let w = 0; w < 4; w++) {
          const wx = x - 72 + w * 48, grow = ease(seg(t, T.grow + i * 0.15 + w * 0.1, T.grow + i * 0.15 + w * 0.1 + 0.8));
          let wk = grow;
          // Frantic tug: when she visits, one weed dips then regrows.
          hops.forEach(([a, b]) => { if (b === i && w === 1) wk *= 1 - Math.sin(clamp((t - a - 0.5) / 0.6) * Math.PI) * 0.8; });
          if (i === F) { const pull = T.weed + w * 1.1; if (t > pull) wk *= 1 - ease(seg(t, pull, pull + 0.5)); }
          g += weed(t, wx, BY - 4, wk * 1.25, i * 4 + w);
          if (i === F && t > T.weed + w * 1.1 && t < T.weed + w * 1.1 + 0.9) { const p = seg(t, T.weed + w * 1.1, T.weed + w * 1.1 + 0.9); g += fade(1 - p, weed(t, wx - p * 80, BY - 4 - Math.sin(p * Math.PI) * 140, 0.7, w)); }
        }
        if (i === F) [[-60, C.pink], [-20, C.purple], [20, C.peach], [60, C.pink]].forEach(([dx, c], q) => g += flower(t, x + dx, BY - 8, back(seg(t, T.bloom + q * 0.25, T.bloom + q * 0.25 + 0.7)), c));
        g += `<rect x="${x + 96}" y="${BY - 90}" width="8" height="70" fill="#9B6A45"/>`;
        out += scaleAt(x, BY, k, `<g opacity="${dim}">${g}</g>`);
        out += pill(x, 1040, lab, focus ? C.pink : C.muted, k, focus ? 25 : 22);
      });
      // Sign: THIS WEEK.
      const sk = pop(t, T.sign, 0.6);
      out += scaleAt(BX(F) + 110, 900, sk, `<rect x="${BX(F) + 104}" y="740" width="12" height="160" fill="#9B6A45"/><rect x="${BX(F) + 20}" y="690" width="180" height="70" rx="12" fill="${C.pink}"/>${txt(BX(F) + 110, 735, 'THIS WEEK', 24, '#fff', { ls: 1 })}`);
      // Squirrel on the fence and a bird.
      out += crit(t, 'squirrel', { x: 1560, y: 640, scale: 0.85, seed: 2, at: T.set + 1, flip: true, hop: t > T.bloom ? 9 : 0, hopH: 20 });
      const bp = ((t - T.set) * 0.12) % 1;
      out += critter(t, 'bird', { x: lerp(-80, 2000, bp), y: 480 + Math.sin(t * 2) * 20, scale: 0.7, seed: 5, fly: true });
      out += bub(gx + 40, 560, 'Too many! 😵', between(t, T.stop - 0.4, T.pick), { size: 28 });
      out += bub(1560, 520, 'One bed!', between(t, T.sign + 0.4, T.weed), { size: 26, tail: 'right' });
      if (t > T.bloom) out += A.sparkle(BX(F), 860, T.bloom + 0.8, t, C.pink);
      return out;
    },

    // Piano lesson: the teacher circles ONE bar. The student loops it until 8 of 10 reps are clean.
    's22b-piano-bar': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="630" fill="#F6EEF8"/>`;
      for (let i = 0; i < 12; i++) st += `<rect x="${i * 170}" y="370" width="85" height="630" fill="#fff" opacity=".35"/>`;
      st += ground(1000, '#E8D9C9', '#D6C2AE');
      // Rug.
      st += `<ellipse cx="860" cy="1030" rx="520" ry="34" fill="${C.purpleL}" opacity=".6"/>`;
      out += fade(bk, st);
      // Sheet music board with 7 bars.
      const SX = 300, SY = 400, SW = 1120, SH = 200, bw = SW / 7;
      const sk = pop(t, T.set + 0.3, 0.7);
      let sh = `<rect x="${SX - 20}" y="${SY - 20}" width="${SW + 40}" height="${SH + 40}" rx="18" fill="#fff" stroke="#EADFD8" stroke-width="4"/>`;
      for (let l = 0; l < 5; l++) sh += `<line x1="${SX}" y1="${SY + 50 + l * 22}" x2="${SX + SW}" y2="${SY + 50 + l * 22}" stroke="${C.muted}" stroke-width="2" opacity=".6"/>`;
      for (let b = 0; b <= 7; b++) sh += `<line x1="${f1(SX + b * bw)}" y1="${SY + 50}" x2="${f1(SX + b * bw)}" y2="${SY + 138}" stroke="${C.muted}" stroke-width="3"/>`;
      const FB = 2;
      const weak = [1, 2, 4, 5];
      for (let b = 0; b < 7; b++) {
        const dim = t > T.circle + 0.8 && b !== FB ? 0.3 : 1;
        let nb = '';
        for (let n = 0; n < 4; n++) {
          const nx = SX + b * bw + 26 + n * 30, ny = SY + 128 - ((b * 3 + n * 5) % 7) * 11;
          const hop = t > T.play && b === FB ? Math.max(0, Math.sin((t - T.play) * 5.2 - n * 1.3)) * 10 : 0;
          nb += `<ellipse cx="${nx}" cy="${f1(ny - hop)}" rx="11" ry="8" fill="${C.dark}" transform="rotate(-20 ${nx} ${f1(ny - hop)})"/><line x1="${nx + 10}" y1="${f1(ny - hop)}" x2="${nx + 10}" y2="${f1(ny - hop - 46)}" stroke="${C.dark}" stroke-width="3"/>`;
        }
        // Red pencil marks on weak bars.
        if (weak.includes(b)) nb += fade(ease(seg(t, T.weak + weak.indexOf(b) * 0.3, T.weak + weak.indexOf(b) * 0.3 + 0.4)), `<path d="M${f1(SX + b * bw + 20)},${SY + 30} q20,-14 40,0 t40,0 t40,0" stroke="${C.pink}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
        sh += `<g opacity="${dim}">${nb}</g>`;
      }
      out += scaleAt(SX + SW / 2, SY + SH, sk, sh);
      // Teacher's circle round bar 3.
      const ck = ease(seg(t, T.circle, T.circle + 0.9));
      if (ck > 0) { const cx = SX + FB * bw + bw / 2, r = bw * 0.62, c = 2 * Math.PI * r; out += `<ellipse cx="${f1(cx)}" cy="${SY + 92}" rx="${f1(r)}" ry="88" fill="none" stroke="${C.pink}" stroke-width="8" stroke-dasharray="${f1(c * ck)} ${f1(c)}" transform="rotate(-80 ${f1(cx)} ${SY + 92})"/>`; }
      out += pill(SX + FB * bw + bw / 2, SY + SH + 46, 'THIS WEEK’S FOCUS', C.pink, pop(t, T.circle + 0.8, 0.5), 22);
      // Keyboard.
      const KX = 520, KY = 840, KW = 620;
      const kk = pop(t, T.set + 0.5, 0.6);
      let kb = `<rect x="${KX - 10}" y="${KY - 20}" width="${KW + 20}" height="90" rx="14" fill="${C.dark}"/>`;
      const playing = t > T.play && t < T.reps;
      for (let i = 0; i < 20; i++) { const down = playing && Math.floor(t * 6 + i * 7) % 9 === 0; kb += `<rect x="${KX + i * KW / 20 + 2}" y="${KY + (down ? 4 : 0)}" width="${KW / 20 - 4}" height="60" rx="4" fill="#fff"/>`; }
      for (let i = 0; i < 19; i++) if (i % 7 !== 2 && i % 7 !== 6) kb += `<rect x="${f1(KX + (i + 1) * KW / 20 - 9)}" y="${KY}" width="18" height="36" rx="3" fill="${C.dark}"/>`;
      kb += `<rect x="${KX + 20}" y="${KY + 70}" width="20" height="90" fill="${C.dark}"/><rect x="${KX + KW - 40}" y="${KY + 70}" width="20" height="90" fill="${C.dark}"/>`;
      // Student behind the keyboard.
      const so = { x: 830, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 4, at: T.set + 0.7, talk: false };
      if (playing) { so.frontArm = { a1: 70 + Math.sin(t * 12) * 8, a2: -10 }; so.backArm = { a1: 100 + Math.sin(t * 11) * 8, a2: 190 }; }
      else if (t > T.reps + 0.6) so.frontArm = { a1: -120 + Math.sin(t * 6) * 10, a2: -100 };
      out += who(t, so);
      out += scaleAt(KX + KW / 2, KY + 160, kk, kb);
      // Notes flying out while playing.
      if (playing) for (let q = 0; q < 4; q++) { const p = ((t - T.play) * 0.8 + q / 4) % 1; const x = 700 + q * 70 + Math.sin(p * 6 + q) * 30, y = 800 - p * 170; out += `<g opacity="${(1 - p).toFixed(2)}"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="12" ry="9" fill="${[C.purple, C.pink, C.teal, C.peach][q]}"/><line x1="${f1(x + 11)}" y1="${f1(y)}" x2="${f1(x + 11)}" y2="${f1(y - 34)}" stroke="${[C.purple, C.pink, C.teal, C.peach][q]}" stroke-width="4"/></g>`; }
      // Metronome with a face on the keyboard lid.
      const mk = pop(t, T.set + 1, 0.6);
      const sw = Math.sin(t * Math.PI * 2) * 26;
      out += scaleAt(1230, 1000, mk, `<path d="M1170,1000 L1200,820 L1260,820 L1290,1000 Z" fill="${C.peach}" stroke="${DK.peach}" stroke-width="5"/><line x1="1230" y1="960" x2="${f1(1230 + Math.sin(rad(sw)) * 140)}" y2="${f1(960 - Math.cos(rad(sw)) * 140)}" stroke="${C.dark}" stroke-width="6"/><circle cx="${f1(1230 + Math.sin(rad(sw)) * 100)}" cy="${f1(960 - Math.cos(rad(sw)) * 100)}" r="11" fill="${C.gold}"/>` + face(t, 1230, 930, 0.8, 6));
      // Teacher with a baton.
      const to = { x: 1750, y: 1000, scale: 0.95, look: A.LOOKS.a, seed: 2, flip: true, at: T.set + 0.9, hat: 'shades', talk: ctx.talking && t > T.circle && t < T.circle + 2.6 };
      to.frontArm = t > T.circle - 0.6 && t < T.play ? { a1: -140 + Math.sin(t * 5) * 6, a2: -150 } : { a1: 70, a2: 40 };
      to.hold = `<line x1="0" y1="0" x2="0" y2="-90" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`;
      out += who(t, to);
      // Rep counter: 10 dots, clean (teal) or wobbly (pink). Final: 8 of 10 clean.
      const REPS = [0, 1, 1, 0, 1, 1, 1, 1, 1, 1];
      const dur = (T.reps - T.play) / 10;
      const rk = pop(t, T.play - 0.4, 0.5);
      if (rk > 0) {
        let g = '';
        const n = REPS.filter((r, i) => t > T.play + (i + 1) * dur).length, clean = REPS.filter((r, i) => r && t > T.play + (i + 1) * dur).length;
        REPS.forEach((r, i) => { const dk2 = pop(t, T.play + (i + 1) * dur, 0.4); g += `<circle cx="${1180 + i * 52}" cy="690" r="18" fill="#fff" stroke="${C.muted}" stroke-width="2"/>` + scaleAt(1180 + i * 52, 690, dk2, `<circle cx="${1180 + i * 52}" cy="690" r="18" fill="${r ? C.teal : C.pink}"/>`); });
        g += txt(1414, 750, `clean reps: ${clean}/${n}`, 28, C.dark);
        out += fade(rk, g);
      }
      out += pill(1414, 790, 'measure: 8 of 10 clean', DK.teal, pop(t, T.reps + 0.2, 0.5), 24);
      // Cat napping on the keyboard end.
      out += crit(t, 'cat', { x: 470, y: KY - 20, scale: 0.7, seed: 3, at: T.set + 1.2, sleep: !(t > T.reps && t < T.reps + 3) });
      if (t > T.reps) out += A.sparkle(1414, 690, T.reps + 0.2, t, C.teal);
      return out;
    },
  });

  /* ================= Lesson 21: Monthly Review ================= */
  // A walking rule-card character, feet at (x, y).
  const ruleCard = (t, x, y, o = {}) => {
    const sw = o.walking ? Math.sin(t * 9) * 12 : 0, bob = o.walking ? -Math.abs(Math.sin(t * 9)) * 6 : Math.sin(t * 2.2) * 3;
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${o.s || 1})">
      <path d="M-20,-60 L${f1(-20 - sw)},-4 M20,-60 L${f1(20 + sw)},-4" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/>
      <g transform="translate(0,${f1(bob)})">
      <path d="M-70,-150 l-40,${f1(30 + Math.sin(t * 5) * 8)} M70,-150 l40,${f1(30 - Math.sin(t * 5) * 8)}" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/>
      <rect x="-80" y="-250" width="160" height="200" rx="16" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="-80" y="-250" width="160" height="48" rx="16" fill="${C.purple}"/><rect x="-80" y="-216" width="160" height="14" fill="${C.purple}"/>
      ${txt(0, -216, 'NEW RULE', 24, '#fff', { ls: 1 })}
      ${face(t, 0, -150, 1.3, 7, { talk: o.talk })}
      ${o.veil ? `<path d="M-70,-250 Q0,-300 70,-250 L96,-120 Q0,-100 -96,-120 Z" fill="#fff" opacity=".55" stroke="#EADFD8" stroke-width="2"/>` : ''}
      </g></g>`;
  };

  Object.assign(LIVE, {
    // A trader rushes to marry a new rule. The owl officiant objects: write it as a hypothesis and test it first.
    's22b-proposal': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="630" fill="#FDF0F3"/>`;
      // Bunting + aisle.
      st += `<path d="M0,420 ${Array.from({ length: 12 }, (_, i) => `Q${80 + i * 160},${450 + Math.sin(t * 2 + i) * 5} ${160 + i * 160},420`).join(' ')}" stroke="${C.muted}" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < 24; i++) { const x = 40 + i * 80, y = 424 + Math.abs(Math.sin((x / 160) * Math.PI)) * 22; st += `<path d="M${x - 14},${f1(y)} L${x + 14},${f1(y)} L${x},${f1(y + 30 + Math.sin(t * 4 + i) * 4)} Z" fill="${[C.pinkL, C.purpleL, C.peachL, C.tealL][i % 4]}"/>`; }
      st += ground(1000, '#F3E4EA', '#E6D2DA') + `<path d="M760,1000 L1160,1000 L1300,1080 L620,1080 Z" fill="${C.pinkL}" opacity=".6"/>`;
      out += fade(bk, st);
      // Floral arch.
      const ak = pop(t, T.set + 0.2, 0.8);
      let arch = `<path d="M720,1000 L720,640 Q720,470 960,470 Q1200,470 1200,640 L1200,1000" stroke="#C9B2A0" stroke-width="22" fill="none"/>`;
      for (let i = 0; i < 18; i++) { const a = rad(180 + i * 10), x = 960 + Math.cos(a) * 240, y = 640 + Math.sin(a) * 170; arch += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${16 + (i % 3) * 4}" fill="${[C.pink, C.peach, C.purpleL][i % 3]}"/>`; }
      for (let i = 0; i < 6; i++) arch += `<circle cx="${i % 2 ? 720 : 1200}" cy="${700 + i * 50}" r="15" fill="${[C.pink, C.peach, C.purpleL][i % 3]}"/>`;
      out += scaleAt(960, 1000, ak, arch);
      // Owl officiant at a lectern under the arch.
      out += scaleAt(960, 1000, pop(t, T.set + 0.6, 0.6), `<path d="M900,1000 L915,860 L1005,860 L1020,1000 Z" fill="#B4855E"/><rect x="895" y="848" width="130" height="20" rx="6" fill="#9B6A45"/>`);
      const object = t > T.object && t < T.object + 3;
      out += crit(t, 'owl', { x: 960, y: 850, scale: 0.95, seed: 4, at: T.set + 0.6, monocle: true, hop: object ? 10 : 0, hopH: 14, talk: ctx.talking && object });
      out += bub(960, 560, 'Objection! Test it first.', between(t, T.object, T.write + 0.6), { size: 30 });
      // The trader walks up the aisle from the left; the rule card from the right.
      const tr = walkX(t, T.walk, T.walk + 1.8, -120, 560);
      const rc = walkX(t, T.walk + 0.4, T.walk + 2.2, 2040, 1380);
      // Exit together toward the STUDY door.
      const ex = walkX(t, T.exit, T.exit + 2.4, 0, 1);
      const trX = tr.x + ex.x * 1040, rcX = rc.x + ex.x * 260;
      const trader = { x: trX, y: 1000, scale: 1, look: A.LOOKS.c, seed: 2, walking: tr.walking || ex.walking, talk: ctx.talking && t > T.ring && t < T.object };
      const ringOut = t > T.ring && t < T.write;
      if (ringOut) trader.frontArm = aim(trader, trX + 110, 790), trader.hold = `<g transform="translate(8,-10)"><rect x="-26" y="-30" width="52" height="36" rx="6" fill="${C.pink}"/><path d="M-26,-30 L26,-30 L20,-60 L-20,-60 Z" fill="${DK.pink}"/><circle cx="0" cy="-34" r="11" fill="none" stroke="${C.gold}" stroke-width="5"/></g>`;
      else if (t > T.write && t < T.exit) { trader.frontArm = { a1: 30, a2: -60 }; trader.hold = `<rect x="-6" y="-70" width="70" height="90" rx="8" fill="#fff" stroke="${C.teal}" stroke-width="4"/><rect x="10" y="-76" width="38" height="12" rx="4" fill="${C.muted}"/>${[0, 1, 2].map(q => `<line x1="6" y1="${-46 + q * 20}" x2="${f1(6 + 46 * ease(seg(t, T.write + q * 0.4, T.write + q * 0.4 + 0.5)))}" y2="${-46 + q * 20}" stroke="${C.dark}" stroke-width="4"/>`).join('')}`; }
      const gone = 1 - seg(t, T.exit + 2.2, T.exit + 2.8);
      out += fade(gone, who(t, trader));
      if (t > T.walk) out += fade(gone, ruleCard(t, rcX, 1000, { walking: rc.walking || ex.walking, veil: t < T.write + 1, talk: ctx.talking && t > T.ring + 1 && t < T.ring + 2.6 }));
      out += A.sparkle(trX + 110, 760, T.ring + 0.2, t, C.gold);
      out += bub(trX + 60, 600, 'Let’s make it official! 💍', between(t, T.ring + 0.2, T.object - 0.2), { size: 28 });
      // Hypothesis card pops.
      out += pill(560, 600, 'HYPOTHESIS · written', DK.teal, between(t, T.write + 1.2, T.exit + 0.6), 26);
      // STUDY door at the right edge.
      const dk2 = pop(t, T.door, 0.6);
      out += scaleAt(1760, 1000, dk2, `<rect x="1660" y="640" width="200" height="360" rx="16" fill="${C.tealL}" stroke="${DK.teal}" stroke-width="6"/><circle cx="1690" cy="830" r="10" fill="${DK.teal}"/><rect x="1680" y="600" width="160" height="50" rx="12" fill="${DK.teal}"/>${txt(1760, 636, 'STUDY', 28, '#fff', { ls: 2 })}`);
      // Once inside: the study is running (glow + dots).
      if (t > T.exit + 2.6) {
        const g2 = (t * 0.8) % 1;
        out += `<rect x="${f1(1660 - g2 * 30)}" y="${f1(640 - g2 * 30)}" width="${f1(200 + g2 * 60)}" height="${f1(360 + g2 * 30)}" rx="20" fill="none" stroke="${C.teal}" stroke-width="5" opacity="${(1 - g2).toFixed(2)}"/>`;
        out += bub(1620, 540, ['study running .', 'study running ..', 'study running ...'][Math.floor(t * 2.5) % 3], pop(t, T.exit + 2.8, 0.5), { size: 26, w: 270, tail: 'right' });
        out += A.sparkle(1760, 820, T.exit + 2.6, t, C.teal);
      }
      // Dove carrying a little banner.
      const dp = seg(t, T.set + 1, s.end);
      out += critter(t, 'bird', { x: 300 + Math.sin(dp * 12) * 120, y: 520 + Math.cos(dp * 9) * 30, scale: 0.8, seed: 3, fly: true, col: '#fff' });
      // The three steps along the bottom.
      [['PROPOSE', T.write + 1], ['TEST', T.exit + 1.6], ['DECIDE', 1e9]].forEach(([lab, on], i) => {
        const x = 700 + i * 260, lit = t > on;
        out += pill(x, 1046, (lit ? '✓ ' : '') + lab, lit ? (i === 1 ? C.purple : DK.teal) : '#CBB8C0', pop(t, T.steps + i * 0.2, 0.5), 24);
      });
      return out;
    },

    // Bakery: house recipe vs one change, baked side by side as CONTROL and TEST. Decide only after the batches are in.
    's22b-test-batches': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="630" fill="#FFF6EC"/>`;
      for (let i = 0; i < 16; i++) for (let j = 0; j < 5; j++) st += `<rect x="${i * 120 + (j % 2) * 60}" y="${380 + j * 70}" width="114" height="64" fill="#fff" opacity=".5"/>`;
      st += ground(1000, '#EAD9C6', '#D7C1A8');
      out += fade(bk, st);
      // Oven with a face, centre back.
      const OX = 960, ok = pop(t, T.set + 0.3, 0.7);
      const batchI = Math.floor((t - T.bake) / T.step), inBatch = t > T.bake && batchI < T.n;
      const doorOpen = inBatch ? Math.sin(clamp(((t - T.bake) % T.step) / T.step) * Math.PI) : 0;
      out += scaleAt(OX, 840, ok, `<rect x="${OX - 170}" y="470" width="340" height="370" rx="30" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="6"/>
        <rect x="${OX - 130}" y="600" width="260" height="${f1(190 - doorOpen * 120)}" rx="16" fill="${C.dark}"/>
        <rect x="${OX - 110}" y="${f1(620)}" width="220" height="${f1(Math.max(0, 150 - doorOpen * 120))}" rx="10" fill="${C.gold}" opacity="${(0.5 + Math.sin(t * 6) * 0.15).toFixed(2)}"/>
        ${[0, 1, 2].map(i => `<circle cx="${OX - 80 + i * 80}" cy="510" r="14" fill="${DK.peach}"/>`).join('')}` + face(t, OX, 555, 1.1, 9, { talk: doorOpen > 0.5 }));
      // Recipe card on the wall (left).
      const rk = pop(t, T.recipe, 0.6);
      out += scaleAt(330, 560, rk, `<g transform="rotate(-3 330 560)"><rect x="180" y="440" width="300" height="230" rx="14" fill="#fff" stroke="${C.pinkL}" stroke-width="5"/><rect x="180" y="440" width="300" height="50" rx="14" fill="${C.pink}"/><rect x="180" y="474" width="300" height="16" fill="${C.pink}"/>${txt(330, 476, 'HOUSE RECIPE', 24, '#fff', { ls: 1 })}${[0, 1, 2, 3].map(q => `<line x1="210" y1="${525 + q * 34}" x2="${q === 2 ? 380 : 450}" y2="${525 + q * 34}" stroke="${C.muted}" stroke-width="5" opacity=".5"/>`).join('')}</g>`);
      // Chalkboard (right): two columns of results with N.
      const ck = pop(t, T.board, 0.6);
      if (ck > 0) {
        const done = Math.max(0, Math.min(T.n, Math.floor((t - T.bake) / T.step + 0.5)));
        const nc = Math.ceil(done / 2), nt = Math.floor(done / 2);
        let g = `<rect x="1380" y="430" width="440" height="300" rx="16" fill="#3E4A44" stroke="#9B6A45" stroke-width="10"/>`;
        g += txt(1500, 480, 'CONTROL', 24, '#fff', { ls: 1 }) + txt(1700, 480, 'TEST', 24, '#fff', { ls: 1 });
        const CR = [0.5, 0.6, 0.45, 0.55, 0.5], TR = [0.6, 0.7, 0.55, 0.65, 0.68];
        const hC = nc ? CR.slice(0, nc).reduce((a, b) => a + b) / nc : 0, hT = nt ? TR.slice(0, nt).reduce((a, b) => a + b) / nt : 0;
        g += `<rect x="1460" y="${f1(680 - hC * 160)}" width="80" height="${f1(hC * 160)}" rx="8" fill="${C.tealL}"/><rect x="1660" y="${f1(680 - hT * 160)}" width="80" height="${f1(hT * 160)}" rx="8" fill="${C.peachL}"/>`;
        g += `<line x1="1410" y1="682" x2="1790" y2="682" stroke="#fff" stroke-width="3" opacity=".6"/>`;
        g += txt(1500, 715, `N = ${nc}`, 22, '#fff') + txt(1700, 715, `N = ${nt}`, 22, '#fff');
        out += scaleAt(1600, 730, ck, g);
      }
      // Counter.
      const CY = 830;
      // Baker and apprentice behind the counter.
      const baker = { x: 560, y: 1000, scale: 0.98, look: A.LOOKS.buyer, seed: 3, at: T.set + 0.5, hat: 'chef', talk: ctx.talking && t > T.decide - 0.4 && t < T.decide + 2.4 };
      baker.frontArm = t > T.decide ? { a1: -120 + Math.sin(t * 6) * 10, a2: -100 } : inBatch && batchI % 2 === 0 ? aim(baker, 760, CY - 30) : { a1: 70, a2: 40 };
      out += who(t, baker);
      const app = { x: 1360, y: 1000, scale: 0.92, look: A.LOOKS.e, seed: 6, at: T.set + 0.8, flip: true, hat: 'chef' };
      app.frontArm = inBatch && batchI % 2 === 1 ? aim(app, 1160, CY - 30) : { a1: 70, a2: 40 };
      out += who(t, app);
      out += fade(bk, `<rect x="420" y="${CY}" width="1080" height="36" rx="10" fill="#C89A72"/><rect x="440" y="${CY + 36}" width="1040" height="${1000 - CY - 36}" fill="#E1BC93"/>`);
      // Two trays with signs.
      const TRAYS = [[760, 'CONTROL', C.teal], [1160, 'TEST', C.peach]];
      TRAYS.forEach(([x, lab, col], j) => {
        const k = pop(t, T.trays + j * 0.4, 0.6);
        let g = `<rect x="${x - 150}" y="${CY - 12}" width="300" height="14" rx="6" fill="${C.muted}"/>`;
        const batches = Math.max(0, Math.min(T.n, Math.floor((t - T.bake) / T.step + 0.5)));
        const mine = j === 0 ? Math.ceil(batches / 2) : Math.floor(batches / 2);
        for (let b = 0; b < mine; b++) {
          const at = T.bake + (b * 2 + j) * T.step + T.step * 0.5;
          const ck2 = pop(t, at, 0.4), cx = x - 116 + b * 58, cy = CY - 28;
          g += scaleAt(cx, cy, ck2, `<ellipse cx="${cx}" cy="${cy}" rx="26" ry="14" fill="${j ? '#E8A65C' : '#D9A066'}" stroke="#B4733A" stroke-width="3"/>${[0, 1, 2].map(q => `<circle cx="${cx - 10 + q * 10}" cy="${cy - 2 + (q % 2) * 5}" r="3" fill="${C.dark}"/>`).join('')}`);
        }
        out += scaleAt(x, CY, k, g);
        out += pill(x, 940, lab, j ? DK.peach : DK.teal, k, 28);
        if (j === 1) out += pill(x, 990, 'one change', C.muted, k, 20);
        if (j === 0) out += pill(x, 990, 'current recipe', C.muted, k, 20);
      });
      // Mouse sneaking a cookie off the counter end.
      const mp = seg(t, T.mouse, T.mouse + 3);
      if (mp > 0 && mp < 1) {
        const mx = mp < 0.5 ? lerp(1560, 1340, ease(mp * 2)) : lerp(1340, 1600, ease(mp * 2 - 1));
        out += critter(t, 'mouse', { x: mx, y: CY, scale: 0.8, seed: 2, flip: mp < 0.5, hop: 14, hopH: 6 }) + (mp > 0.5 ? `<ellipse cx="${f1(mx + 40)}" cy="${CY - 40}" rx="18" ry="8" fill="#D9A066"/>` : '');
      }
      // Decide.
      out += stamp(1600, 840, 'DECIDE', DK.purple, pop(t, T.decide, 0.5), -8, 80, 30);
      out += bub(600, 420, 'Now we decide.', between(t, T.decide + 0.2, s.end), { size: 28 });
      if (t > T.decide) out += A.sparkle(1600, 840, T.decide + 0.3, t, C.purple);
      return out;
    },
  });

  /* ================= Lesson 22: Strategy Problem or Trader Problem? ================= */
  // A laundry T-shirt centred at (x, y), optional stain.
  const shirt = (x, y, col, stain, rot = 0, sc = 1) => `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${sc})">
      <path d="M-22,-30 L-50,-16 L-40,6 L-28,0 L-28,34 L28,34 L28,0 L40,6 L50,-16 L22,-30 Q0,-16 -22,-30 Z" fill="${col}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
      ${stain ? `<path d="M-8,4 q8,-10 16,-2 q10,4 4,12 q-4,10 -14,6 q-12,-2 -6,-16 Z" fill="#8B5E3C" opacity=".85"/>` : ''}</g>`;

  Object.assign(LIVE, {
    // Clinic: "the medicine stopped working!" The doctor opens a 4-day pill organizer: how was it taken?
    's22b-clinic': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="630" fill="#EAF4F8"/><rect x="0" y="760" width="1920" height="240" fill="#DDEBF1"/><rect x="0" y="756" width="1920" height="8" fill="#C8DCE5"/>`;
      // Eye chart.
      st += `<rect x="1700" y="420" width="170" height="250" rx="12" fill="#fff" stroke="#C8DCE5" stroke-width="4"/>${txt(1785, 490, 'I', 54, C.dark, { f: 'Playfair Display' })}${txt(1785, 560, 'C C', 38, C.dark, { f: 'Playfair Display' })}${txt(1785, 620, 'P I L', 26, C.dark, { f: 'Playfair Display' })}`;
      // Hanging lamp.
      st += `<line x1="960" y1="370" x2="960" y2="440" stroke="${C.muted}" stroke-width="4"/><path d="M900,480 Q960,420 1020,480 Z" fill="${C.peach}"/>`;
      st += ground(1000, '#D3E3EA', '#BFD3DC');
      out += fade(bk, st);
      // Pill organizer: 4 compartments.
      const CX = [675, 865, 1055, 1245], OY = 700;
      const LAB = [['METHOD', 'early entry', 0], ['SETUPS', 'chased', 0], ['RISK', 'oversized', 0], ['MANAGEMENT', 'as directed', 1]];
      const ok = pop(t, T.box, 0.7);
      let box = `<rect x="560" y="${OY - 10}" width="800" height="140" rx="24" fill="${C.purple}"/>`;
      CX.forEach((x, i) => {
        box += `<rect x="${x - 80}" y="${OY}" width="160" height="110" rx="16" fill="#fff"/>`;
        const open = ease(seg(t, T.lids[i], T.lids[i] + 0.6));
        // Contents.
        if (open > 0.3) {
          if (i === 0) box += `<ellipse cx="${x - 20}" cy="${OY + 60}" rx="26" ry="14" fill="${C.pink}"/><ellipse cx="${x + 30}" cy="${OY + 90 + Math.sin(t * 4) * 3}" rx="20" ry="11" fill="${C.pink}" opacity=".5"/>`;
          if (i === 1) box += `<ellipse cx="${x}" cy="${OY + 60}" rx="26" ry="14" fill="${C.peach}"/><path d="M${x + 30},${OY + 46} l30,-14 m-8,-6 l8,6 l-6,8" stroke="${C.muted}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
          if (i === 2) box += `<ellipse cx="${x - 22}" cy="${OY + 60}" rx="26" ry="14" fill="${C.pink}"/><ellipse cx="${x + 22}" cy="${OY + 60}" rx="26" ry="14" fill="${C.pink}"/>`;
          if (i === 3) box += `<ellipse cx="${x}" cy="${OY + 60}" rx="26" ry="14" fill="${C.teal}"/>`;
        }
        if (open < 1) box += `<g opacity="${(1 - open).toFixed(2)}" transform="translate(0,${f1(-open * 60)}) rotate(${f1(-open * 12)} ${x} ${OY})"><rect x="${x - 84}" y="${OY - 14}" width="168" height="22" rx="8" fill="${DK.purple}"/></g>`;
        box += txt(x, OY + 158, LAB[i][0], 22, DK.purple, { ls: 1 });
      });
      out += scaleAt(960, OY + 130, ok, box);
      CX.forEach((x, i) => {
        const k = pop(t, T.lids[i] + 0.5, 0.5);
        out += pill(x, OY - 46, LAB[i][1], LAB[i][2] ? DK.teal : C.pink, k, 22);
        out += LAB[i][2] ? check(x + 58, OY + 22, pop(t, T.lids[i] + 0.8, 0.5), C.teal, 18) : cross(x + 58, OY + 22, pop(t, T.lids[i] + 0.8, 0.5), C.pink, 18);
      });
      out += pill(960, 920, '3 of 4: how it was taken', C.pink, pop(t, T.verdict, 0.5), 28);
      // Patient walks in with a big bottle.
      const pw = walkX(t, T.set + 0.4, T.set + 2, -100, 360);
      const po = { x: pw.x, y: 1000, scale: 1, look: A.LOOKS.seller, seed: 5, walking: pw.walking, talk: ctx.talking && t > T.complain && t < T.complain + 2.4, mood: t > T.verdict && t < T.rx + 1.5 ? 'sad' : undefined };
      po.frontArm = t > T.complain && t < T.complain + 2.6 ? { a1: -60 + Math.sin(t * 8) * 14, a2: -100 } : { a1: 40, a2: -30 };
      po.hold = `<g transform="rotate(${t > T.complain && t < T.complain + 2.6 ? 0 : 10})"><rect x="-24" y="-74" width="48" height="76" rx="10" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="4"/><rect x="-18" y="-90" width="36" height="18" rx="5" fill="${C.pink}"/><rect x="-20" y="-56" width="40" height="34" rx="4" fill="#fff"/>${txt(0, -42, 'DAYLI', 11, DK.peach)}${txt(0, -28, 'ICC', 13, DK.peach)}</g>`;
      out += who(t, po);
      out += bub(380, 560, 'Dayli ICC stopped working!', between(t, T.complain, T.check), { size: 28 });
      // Parrot on the lamp.
      out += crit(t, 'parrot', { x: 960, y: 470, scale: 0.75, seed: 3, at: T.set + 1, hop: t > T.did && t < T.did + 2 ? 8 : 0, hopH: 14, talk: ctx.talking && t > T.did && t < T.did + 1.4 });
      out += bub(1110, 470, 'Did it? 😂', between(t, T.did, T.did + 2.6), { size: 28 });
      // Doctor with a head mirror and a clipboard.
      const dO = { x: 1550, y: 1000, scale: 1, look: A.LOOKS.c, seed: 2, flip: true, at: T.set + 0.8, talk: ctx.talking && t > T.check && t < T.verdict + 4 };
      dO.frontArm = t > T.lids[0] - 0.4 && t < T.lids[3] + 0.6 ? aim(dO, CX[Math.min(3, Math.max(0, Math.floor((t - T.lids[0] + 0.4) / (T.lids[1] - T.lids[0]))))] + 200, OY + 40) : { a1: 50, a2: -40 };
      if (!(t > T.lids[0] - 0.4 && t < T.lids[3] + 0.6)) dO.hold = `<rect x="-6" y="-60" width="64" height="84" rx="8" fill="#fff" stroke="${C.teal}" stroke-width="4"/><rect x="12" y="-66" width="30" height="12" rx="4" fill="${C.muted}"/>`;
      out += who(t, dO);
      // Lab coat + head mirror.
      if (pop(t, dO.at) >= 1) { const h = headAt(t, dO); out += `<path d="M${f1(h.x - 38)},${f1(h.y + 80)} L${f1(h.x - 42)},${f1(h.y + 190)} L${f1(h.x + 42)},${f1(h.y + 190)} L${f1(h.x + 38)},${f1(h.y + 80)} L${f1(h.x + 12)},${f1(h.y + 66)} L${f1(h.x)},${f1(h.y + 140)} L${f1(h.x - 12)},${f1(h.y + 66)} Z" fill="#fff" opacity=".9"/><circle cx="${f1(h.x - 4)}" cy="${f1(h.y - 46)}" r="16" fill="#E8F8F6" stroke="${C.muted}" stroke-width="4"/>`; }
      out += bub(1430, 470, 'Let’s check, in order.', between(t, T.check, T.lids[0] + 0.6), { size: 26, tail: 'right' });
      out += bub(1430, 470, 'Rx: take it as directed', between(t, T.rx, s.end), { size: 26, tail: 'right' });
      // Robot heart monitor beeping.
      const beat = (t * 1.6) % 1;
      out += crit(t, 'robot', { x: 150, y: 1000, scale: 0.8, seed: 4, at: T.set + 1.2, screen: beat < 0.2 ? '♥' : '·' });
      if (t > T.rx) out += A.sparkle(960, 600, T.rx, t, C.teal);
      return out;
    },

    // Laundromat: 20 practice reps tumble out. Stained shirts (rule broken) go in one basket, clean ones in another.
    's22b-laundry-sort': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      const bk = ease(seg(t, T.set - 0.3, T.set + 0.7));
      let st = `<rect x="0" y="370" width="1920" height="630" fill="#F2F0FA"/>`;
      for (let i = 0; i < 10; i++) st += `<rect x="${i * 200}" y="370" width="100" height="630" fill="#fff" opacity=".35"/>`;
      st += ground(1000, '#E3DDF0', '#D0C8E4');
      out += fade(bk, st);
      // Dryer with a spinning window.
      const DX = 330, DY = 770;
      const spin = t * (t < T.sort + 12 ? 6 : 1.5);
      out += scaleAt(DX, 1000, pop(t, T.set + 0.2, 0.7), `<rect x="${DX - 170}" y="520" width="340" height="480" rx="30" fill="#fff" stroke="${C.purpleL}" stroke-width="6"/><rect x="${DX - 150}" y="545" width="300" height="40" rx="10" fill="${C.purpleL}"/>
        <circle cx="${DX - 110}" cy="565" r="10" fill="${C.pink}"/><circle cx="${DX - 76}" cy="565" r="10" fill="${C.teal}"/>
        <circle cx="${DX}" cy="${DY}" r="120" fill="${C.purpleL}"/><circle cx="${DX}" cy="${DY}" r="98" fill="#E8F8F6"/>
        <g transform="rotate(${f1(spin * 57)} ${DX} ${DY})">${shirt(DX - 30, DY - 20, C.pink, 1, 20, 0.9)}${shirt(DX + 34, DY + 24, C.teal, 0, -40, 0.9)}${shirt(DX - 10, DY + 50, C.pink, 0, 80, 0.8)}</g>`);
      // Baskets.
      const BK = [[1080, 'RULES FOLLOWED', DK.teal], [1600, 'RULES BROKEN', C.pink]];
      // Data: 20 reps. [won, stained]. 9 stained losses, 5 clean losses, 6 clean wins.
      const REPS = [[0, 1], [1, 0], [0, 1], [0, 0], [1, 0], [0, 1], [0, 1], [0, 0], [1, 0], [0, 1], [0, 0], [0, 1], [1, 0], [0, 1], [0, 0], [1, 0], [0, 1], [0, 0], [1, 0], [0, 1]];
      const at = i => T.sort + i * T.step;
      const cnt = [0, 0], lossB = [0, 0];
      REPS.forEach(([w, st2], i) => { if (t > at(i) + 0.6) { cnt[st2]++; if (!w) lossB[st2]++; } });
      BK.forEach(([x, lab, col], j) => {
        const k = pop(t, T.set + 0.6 + j * 0.3, 0.6);
        let g = '';
        // Heap of shirts inside.
        for (let q = 0; q < cnt[j]; q++) { const hx = x - 90 + (q * 47) % 180, hy = 900 - Math.floor(q / 4) * 22; g += shirt(hx, hy, REPS.filter(r => r[1] === j)[q][0] ? C.teal : C.pink, j, (q * 37) % 60 - 30, 0.8); }
        g += `<path d="M${x - 150},860 L${x + 150},860 L${x + 125},1000 L${x - 125},1000 Z" fill="${j ? C.pinkL : C.tealL}" stroke="${col}" stroke-width="6"/>`;
        for (let q = 0; q < 5; q++) g += `<line x1="${x - 120 + q * 60}" y1="870" x2="${x - 100 + q * 50}" y2="990" stroke="${col}" stroke-width="3" opacity=".4"/>`;
        g += txt(x, 950, String(cnt[j]), 46, col, { f: 'Playfair Display' });
        out += scaleAt(x, 1000, k, g);
        out += pill(x, 820, lab, col, k, 22);
      });
      // Flying shirts.
      REPS.forEach(([w, st2], i) => {
        const p = seg(t, at(i), at(i) + 0.6);
        if (p <= 0 || p >= 1) return;
        const tx = BK[st2][0], x = lerp(DX + 110, tx, p), y = lerp(DY, 880, p) - Math.sin(p * Math.PI) * 300;
        out += shirt(x, y, w ? C.teal : C.pink, st2, p * 360, 1);
      });
      // Attendant pointing the sort.
      const sorting = t > T.sort && t < T.sort + 20 * T.step;
      const ao = { x: 760, y: 1000, scale: 1, look: A.LOOKS.a, seed: 3, at: T.set + 0.8, talk: ctx.talking && t > T.ninety && t < T.ninety + 3 };
      if (sorting) { const cur = REPS[Math.min(19, Math.floor((t - T.sort) / T.step))]; ao.frontArm = cur[1] ? { a1: -30, a2: -10 } : { a1: -50, a2: -30 }; }
      else if (t > T.verdict) ao.frontArm = { a1: -120 + Math.sin(t * 6) * 10, a2: -100 };
      out += who(t, ao);
      // Legend.
      out += fade(pop(t, T.legend, 0.5), shirt(560, 470, C.teal, 0, 0, 0.8) + txt(600, 480, 'won', 24, C.dark, { a: 'start' }) + shirt(720, 470, C.pink, 0, 0, 0.8) + txt(760, 480, 'lost', 24, C.dark, { a: 'start' }) + shirt(880, 470, C.pink, 1, 0, 0.8) + txt(920, 480, 'rule broken', 24, C.dark, { a: 'start' }));
      // Findings.
      out += pill(1600, 640, '9 of 14 losses', C.pink, pop(t, T.ninety, 0.5), 28);
      out += pill(1600, 700, 'early entry · chased', C.muted, pop(t, T.ninety + 0.5, 0.5), 22);
      out += pill(1080, 640, 'N = 11 · too few to judge', DK.peach, pop(t, T.few, 0.5), 26);
      out += pill(1340, 540, 'points to: execution first', DK.purple, pop(t, T.verdict, 0.5), 30);
      // Cat napping on top of the dryer; a sock creature hopping.
      out += crit(t, 'cat', { x: DX + 60, y: 520, scale: 0.7, seed: 6, at: T.set + 1.2, sleep: t < T.verdict });
      const sp = (t - T.set) * 0.09 % 1;
      const sx = lerp(1880, 420, sp), sy = 1000 - Math.abs(Math.sin(t * 6)) * 30;
      if (t > T.set + 1.5) out += `<g transform="translate(${f1(sx)},${f1(sy)})"><path d="M-14,-90 L14,-90 L14,-26 Q14,0 -12,0 L-40,0 Q-52,-14 -36,-24 L-14,-30 Z" fill="${C.peachL}" stroke="${DK.peach}" stroke-width="3"/><rect x="-14" y="-90" width="28" height="16" fill="${C.pink}"/>${face(t, 0, -54, 0.6, 9)}</g>`;
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
