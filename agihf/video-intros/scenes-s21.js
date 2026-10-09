/**
 * scenes-s21.js: illustrated scene types for Section 21 lesson intro videos
 * (Phase 8 · Section 21: Real Trade Breakdown Lab, Lessons 1 to 5).
 *
 * Case studies, reconstructed in one order: 4H → 1H → 15M → 1M → RISK →
 * MANAGEMENT → OUTCOME. The outcome stays locked until the read is done, and
 * process and outcome are graded separately.
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
  const TYPES = ['dig', 'cutting-room', 'cook-off', 'paper-plane', 'hail-garden', 'sample-jar',
    'thin-ice', 'warning-museum', 'shell-beach', 'appraiser'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s21-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ---------- Section 21 extras ---------- */
  Object.assign(HATS, {
    safari: `<ellipse cx="0" cy="-30" rx="66" ry="14" fill="#D9B98A"/><path d="M-38,-30 Q-40,-74 0,-76 Q40,-74 38,-30 Z" fill="#E7CDA1"/><rect x="-38" y="-42" width="76" height="10" fill="#9B6A45"/>`,
    ranger: `<ellipse cx="0" cy="-30" rx="70" ry="12" fill="#3F9A66"/><path d="M-36,-30 L-30,-72 Q0,-60 30,-72 L36,-30 Z" fill="#3F9A66"/><path d="M-30,-72 Q0,-86 30,-72" stroke="#2F7A50" stroke-width="5" fill="none"/>`,
    sun: `<ellipse cx="0" cy="-30" rx="78" ry="16" fill="${C.peachL}"/><path d="M-40,-30 Q-40,-76 0,-78 Q40,-76 40,-30 Z" fill="${C.peachL}"/><rect x="-40" y="-44" width="80" height="12" fill="${C.pink}"/>`,
    headset: `<path d="M-44,-4 Q-46,-62 0,-64 Q46,-62 44,-4" stroke="${C.dark}" stroke-width="7" fill="none"/><rect x="-54" y="-18" width="18" height="34" rx="8" fill="${C.purple}"/><rect x="36" y="-18" width="18" height="34" rx="8" fill="${C.purple}"/>`,
    glasses: `<circle cx="-15" cy="-2" r="12" fill="none" stroke="${C.dark}" stroke-width="4"/><circle cx="15" cy="-2" r="12" fill="none" stroke="${C.dark}" stroke-width="4"/><path d="M-3,-2 L3,-2" stroke="${C.dark}" stroke-width="4"/>`,
    loupe: `<circle cx="15" cy="-2" r="14" fill="#E8F8F6" stroke="${C.gold}" stroke-width="5" opacity=".9"/>`,
    bow: `<path d="M-6,-58 L-30,-74 L-30,-46 Z M6,-58 L30,-74 L30,-46 Z" fill="${C.pink}"/><circle cx="0" cy="-58" r="8" fill="${DK.pink}"/>`,
  });

  /* More creatures, (0,0) at the feet, facing right unless flip. */
  function beast(t, kind, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1;
    const bl = blinkAmt(t, seed);
    const hop = o.hop ? -Math.abs(Math.sin(t * o.hop)) * (o.hopH || 20) : Math.sin(t * 2.4 + seed) * 2.5;
    const eye = (x, y, r = 6) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>${bl < 0.5 ? `<circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>` : ''}`;
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    const sad = o.mood === 'sad';
    let g = '';
    if (kind === 'mole') {
      const paw = o.dig ? Math.sin(t * 16 + seed) * 14 : Math.sin(t * 3 + seed) * 4;
      g = `<ellipse cx="0" cy="-46" rx="46" ry="44" fill="#7A5C50"/><ellipse cx="8" cy="-34" rx="26" ry="24" fill="#A58474"/>
        <ellipse cx="${30 + paw * 0.3}" cy="${-30 + paw}" rx="16" ry="10" fill="${C.pinkL}"/><ellipse cx="${-24 - paw * 0.3}" cy="${-26 - paw}" rx="16" ry="10" fill="${C.pinkL}"/>
        <ellipse cx="34" cy="-74" rx="30" ry="24" fill="#7A5C50"/><circle cx="62" cy="-74" r="10" fill="${C.pink}"/>
        ${o.goggles ? `<circle cx="34" cy="-84" r="11" fill="#E8F8F6" stroke="${C.gold}" stroke-width="4"/>` : eye(36, -84, 4)}
        ${sad ? `<path d="M40,-60 Q48,-66 56,-60" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M40,-62 Q48,${-56 + talk * 5} 56,-62" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`}`;
    } else if (kind === 'penguin') {
      const wob = o.waddle ? Math.sin(t * 10 + seed) * 8 : 0;
      const flap = o.flap ? Math.sin(t * 14) * 30 : Math.sin(t * 2 + seed) * 5;
      g = `<g transform="rotate(${wob.toFixed(1)})"><ellipse cx="-14" cy="-4" rx="16" ry="7" fill="${C.peach}"/><ellipse cx="14" cy="-4" rx="16" ry="7" fill="${C.peach}"/>
        <ellipse cx="0" cy="-62" rx="42" ry="58" fill="#3D3550"/><ellipse cx="6" cy="-56" rx="28" ry="46" fill="#fff"/>
        <path d="M-36,-80 Q${-62 - flap * 0.4},${-50 - flap} -44,-30" fill="#3D3550"/><path d="M36,-80 Q${62 + flap * 0.4},${-50 - flap} 44,-30" fill="#3D3550"/>
        <circle cx="4" cy="-118" r="30" fill="#3D3550"/><ellipse cx="10" cy="-112" rx="20" ry="18" fill="#fff"/>
        ${eye(0, -118, 5)}${eye(20, -118, 5)}<path d="M8,${-106 - talk * 2} L30,-102 L8,${-96 + talk * 3} Z" fill="${C.peach}"/>
        ${o.scarf ? `<path d="M-24,-94 Q4,-84 32,-94 L32,-84 Q4,-74 -24,-84 Z" fill="${C.pink}"/><rect x="-22" y="-86" width="12" height="30" rx="4" fill="${C.pink}"/>` : ''}</g>`;
    } else if (kind === 'raccoon') {
      const tw = Math.sin(t * 3 + seed) * 10;
      g = `<g>${[0, 1, 2, 3].map(i => `<path d="M-40,-30 Q${-70 - i * 4},${-40 - i * 2} ${-86 + tw * 0.4 - i * 8},${-70 - i * 14}" stroke="${i % 2 ? '#3D3550' : '#A59CB2'}" stroke-width="${18 - i * 2}" fill="none" stroke-linecap="round"/>`).join('')}
        <rect x="-26" y="-34" width="14" height="34" rx="7" fill="#7D748C"/><rect x="14" y="-34" width="14" height="34" rx="7" fill="#7D748C"/>
        <ellipse cx="0" cy="-52" rx="46" ry="38" fill="#A59CB2"/>
        <path d="M18,-120 L10,-146 L34,-130 Z M58,-120 L66,-146 L44,-130 Z" fill="#7D748C"/>
        <ellipse cx="38" cy="-100" rx="38" ry="32" fill="#A59CB2"/><ellipse cx="62" cy="-90" rx="16" ry="12" fill="#fff"/><circle cx="74" cy="-94" r="6" fill="${C.dark}"/>
        <path d="M6,-112 Q38,-96 70,-112 L70,-98 Q38,-84 6,-98 Z" fill="#3D3550"/>${eye(26, -104, 5)}${eye(52, -104, 5)}
        <path d="M54,-80 Q62,${-74 + talk * 5} 70,-80" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    } else if (kind === 'peacock') {
      const fan = o.fan == null ? 1 : o.fan;
      const fanS = Math.sin(t * 3 + seed) * 4;
      let tail = '';
      for (let i = 0; i < 9; i++) {
        const a = rad(-170 + i * 20 + fanS * 0.3), L = 150 * fan;
        if (L < 4) continue;
        const x = Math.cos(a) * L - 20, y = Math.sin(a) * L - 70;
        tail += `<path d="M-20,-70 L${f1(x)},${f1(y)}" stroke="${C.tealD}" stroke-width="${14 * fan}" stroke-linecap="round"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${18 * fan}" fill="${C.teal}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${9 * fan}" fill="${C.purple}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${4 * fan}" fill="${C.gold}"/>`;
      }
      g = `${tail}<path d="M-6,-8 L-10,0 M8,-8 L12,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="-50" rx="34" ry="42" fill="${C.purple}"/>
        <path d="M10,-80 Q30,-120 30,-150" stroke="${C.purple}" stroke-width="22" fill="none" stroke-linecap="round"/>
        <circle cx="34" cy="-158" r="20" fill="${C.purple}"/>${eye(40, -162, 4.5)}
        <path d="M52,${-162 - talk * 3} L70,-156 L52,${-150 + talk * 3} Z" fill="${C.gold}"/>
        ${[0, 1, 2].map(i => `<line x1="${30 + i * 6}" y1="-176" x2="${26 + i * 10}" y2="-196" stroke="${C.purple}" stroke-width="3"/><circle cx="${26 + i * 10}" cy="-198" r="5" fill="${C.teal}"/>`).join('')}`;
    } else if (kind === 'gull') {
      const flap = o.fly ? Math.sin(t * 14 + seed) * 36 : Math.sin(t * 3 + seed) * 4;
      g = `${o.fly ? '' : `<path d="M-6,-6 L-10,0 M6,-6 L10,0" stroke="${C.peach}" stroke-width="4" stroke-linecap="round"/>`}
        <path d="M-30,-34 L-58,-26 L-30,-22 Z" fill="#B9B2C4"/>
        <ellipse cx="0" cy="-32" rx="34" ry="22" fill="#fff" stroke="#E2DCE8" stroke-width="3"/>
        <circle cx="24" cy="-58" r="18" fill="#fff" stroke="#E2DCE8" stroke-width="3"/>${eye(30, -62, 4)}
        <path d="M40,${-60 - talk * 3} L62,-54 L40,${-50 + talk * 3} Z" fill="${C.gold}"/><circle cx="54" cy="-55" r="2.5" fill="${C.pink}"/>
        <path d="M-6,-36 Q-26,${-50 - flap} -44,${-36 - flap * 0.9} Q-20,-24 -6,-28 Z" fill="#B9B2C4"/>`;
    } else if (kind === 'snail') {
      const st = Math.sin(t * 3 + seed) * 4;
      g = `<path d="M-40,0 Q-46,-20 -20,-22 L50,-22 Q70,-22 70,-40 L70,-70" stroke="#C8D98E" stroke-width="22" fill="none" stroke-linecap="round"/>
        <path d="M64,-76 L56,${-104 + st}" stroke="#C8D98E" stroke-width="5" stroke-linecap="round"/><path d="M76,-76 L86,${-104 - st}" stroke="#C8D98E" stroke-width="5" stroke-linecap="round"/>
        <circle cx="56" cy="${-106 + st}" r="6" fill="${C.dark}"/><circle cx="86" cy="${-106 - st}" r="6" fill="${C.dark}"/>
        <path d="M66,-58 Q74,${-52 + talk * 5} 82,-58" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="-60" r="46" fill="${C.peach}"/><path d="M0,-60 m-30,0 a30,30 0 1,1 30,30 a18,18 0 1,1 -14,-22 a8,8 0 1,1 10,8" stroke="${DK.peach}" stroke-width="6" fill="none"/>`;
    } else if (kind === 'bee') {
      const buzz = Math.sin(t * 40) * 10;
      g = `<ellipse cx="-6" cy="-30" rx="14" ry="${10 + buzz * 0.4}" fill="#fff" opacity=".8" transform="rotate(-30 -6 -30)"/><ellipse cx="8" cy="-32" rx="14" ry="${10 - buzz * 0.4}" fill="#fff" opacity=".8" transform="rotate(30 8 -32)"/>
        <ellipse cx="0" cy="-14" rx="24" ry="16" fill="${C.gold}"/><rect x="-8" y="-29" width="6" height="30" fill="${C.dark}"/><rect x="6" y="-29" width="6" height="30" fill="${C.dark}"/>
        ${eye(18, -18, 3.5)}<path d="M-24,-14 L-32,-14" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * f},${s})"><g transform="translate(0,${hop.toFixed(2)})">${g}</g></g>`;
  }
  const bst = (t, kind, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, beast(t, kind, o));
  };
  // A stamp on a light backing, so it reads over busy art.
  const bstamp = (x, y, text, col, k, rot = -10, r = 64, fs = 30) => k <= 0 ? '' : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * (1 + (1 - clamp(k)) * 0.8))}" fill="#FFFDF8" opacity="${(clamp(k * 1.6) * 0.95).toFixed(2)}"/>` + stamp(x, y, text, col, k, rot, r, fs);
  // A padlock, (x, y) = centre of the body. open 0..1 lifts the shackle.
  const padlock = (x, y, sc = 1, open = 0, col = C.gold) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <path d="M-18,-10 L-18,${-34 - open * 22} Q-18,${-56 - open * 22} 0,${-56 - open * 22} Q18,${-56 - open * 22} 18,${-34 - open * 22} L18,${-10 - open * 22}" stroke="${C.muted}" stroke-width="8" fill="none" transform="${open > 0 ? `rotate(${-open * 30} -18 -10)` : ''}"/>
      <rect x="-30" y="-14" width="60" height="48" rx="10" fill="${col}" stroke="#C98A1F" stroke-width="4"/><circle cx="0" cy="6" r="7" fill="${C.dark}"/><rect x="-3" y="6" width="6" height="14" fill="${C.dark}"/></g>`;
  // Small "ICC" candle cluster used as an artifact icon (x, y) = centre.
  const iccIcon = (x, y, sc = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <line x1="-44" x2="44" y1="0" y2="0" stroke="${C.purple}" stroke-width="4" stroke-dasharray="8 6"/>
      ${[[-30, 14, -22, C.teal], [-10, -16, 0, C.pink], [10, -2, -32, C.teal], [30, -20, -8, C.teal]].map(([cx, a, b, col]) => `<rect x="${cx - 7}" y="${Math.min(a, b)}" width="14" height="${Math.abs(a - b)}" rx="3" fill="${col}"/>`).join('')}</g>`;
  const shieldIcon = (x, y, sc = 1, col = C.pink) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><path d="M0,-34 L28,-24 Q28,16 0,34 Q-28,16 -28,-24 Z" fill="${col}"/><path d="M-10,0 L-2,9 L12,-8" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;

  /* ================= Lesson 1: How to Break Down a Trade ================= */
  // A small long ICC on the 1M (0..1 price): indication 4, correction 5, continuation 6, retest 8, entry 9; 10-11 run to the stop.
  const B1 = [[.30, .36, .38, .28], [.36, .33, .38, .31], [.33, .40, .42, .32], [.40, .43, .47, .38], [.43, .56, .58, .42], [.56, .50, .57, .48],
    [.50, .63, .65, .49], [.63, .57, .64, .55], [.57, .49, .58, .46], [.49, .53, .54, .47], [.53, .44, .54, .42], [.44, .37, .45, .35]].map(b => b.map(v => (v - .3) * 2.2 + .12));
  const STRATA = ['#EBD7BA', '#E1C7A2', '#D6B78E', '#CBA77B', '#C0986B', '#B38A5D', '#A27B51'];

  Object.assign(LIVE, {
    // An archaeology dig: seven layers (4H, 1H, 15M, 1M, risk, management, outcome), uncovered top-down. The mole that tunnels straight to the treasure is stopped.
    's21-dig': (s, t, ctx) => {
      const T = s.beats, SURF = 520, LH = 72, X0 = 720, X1 = 1200;
      let out = '';
      // Sky strip, clouds, a bird.
      out += `<rect x="0" y="372" width="1920" height="${SURF - 372}" fill="#E4F3F1" opacity=".7"/>` + cloud(300 + (t * 10) % 260, 420, 0.5) + cloud(1500 - (t * 7) % 200, 405, 0.45);
      out += critter(t, 'bird', { x: ((t - s.start) * 120) % 2300 - 200, y: 430 + Math.sin(t * 2) * 10, scale: 0.6, seed: 2, fly: true });
      // Strata.
      const gk = ease(seg(t, T.site - 0.3, T.site + 0.7));
      let st = '';
      STRATA.forEach((c, i) => {
        const y = SURF + i * LH;
        st += `<path d="M0,${y} ${Array.from({ length: 13 }, (_, j) => `Q${80 + j * 160},${y + (j % 2 ? 6 : -6)} ${160 + j * 160},${y}`).join(' ')} L1920,${y + LH + 6} L0,${y + LH + 6} Z" fill="${c}"/>`;
        for (let j = 0; j < 9; j++) { const px = (j * 233 + i * 97) % 1880 + 20; if (px > X0 - 30 && px < X1 + 30) continue; st += `<ellipse cx="${px}" cy="${y + 24 + (j * 13) % 34}" rx="${6 + (j % 3) * 3}" ry="${4 + (j % 2) * 2}" fill="#fff" opacity=".22"/>`; }
      });
      [[200, 640, 0], [1500, 760, 1], [380, 900, 2], [1700, 600, 1], [1420, 960, 0]].forEach(([fx, fy, k]) => {
        st += k === 0 ? `<g transform="translate(${fx},${fy}) rotate(-15)"><rect x="-40" y="-6" width="80" height="12" rx="6" fill="#FFF8EC"/><circle cx="-40" cy="-8" r="9" fill="#FFF8EC"/><circle cx="-40" cy="8" r="9" fill="#FFF8EC"/><circle cx="40" cy="-8" r="9" fill="#FFF8EC"/><circle cx="40" cy="8" r="9" fill="#FFF8EC"/></g>`
          : k === 1 ? `<g transform="translate(${fx},${fy})"><path d="M0,0 m-30,0 a30,30 0 1,1 30,30 a18,18 0 1,1 -14,-22 a8,8 0 1,1 10,8" stroke="#FFF8EC" stroke-width="7" fill="none"/></g>`
          : `<g transform="translate(${fx},${fy})"><path d="M-50,0 Q0,-30 50,0" stroke="#FFF8EC" stroke-width="6" fill="none"/>${[0, 1, 2, 3, 4].map(j => `<path d="M${-36 + j * 18},${-12 + Math.abs(j - 2) * 4} l0,22" stroke="#FFF8EC" stroke-width="5"/>`).join('')}</g>`;
      });
      st += `<rect x="0" y="${SURF - 8}" width="1920" height="14" rx="6" fill="#9FCB8E"/>`;
      for (let j = 0; j < 40; j++) st += `<path d="M${j * 49 + 10},${SURF - 4} l6,-16 l6,16" fill="#7CB46B"/>`;
      out += fade(gk, st);
      // Excavated layers.
      const dug = i => ease(seg(t, T.layers[i] - 0.5, T.layers[i] + 0.3));
      let depth = -1;
      T.layers.forEach((a, i) => { if (t > a - 0.5) depth = i; });
      for (let i = 0; i < 6; i++) {
        const k = dug(i);
        if (k <= 0) continue;
        const y = SURF + i * LH, w = (X1 - X0) * k, cx = (X0 + X1) / 2;
        out += `<rect x="${f1(cx - w / 2)}" y="${y + 2}" width="${f1(w)}" height="${LH}" fill="#F8EEDF"/><rect x="${f1(cx - w / 2)}" y="${y + LH - 2}" width="${f1(w)}" height="4" fill="#E2CDB0"/>`;
      }
      if (depth >= 0) out += `<path d="M${X0},${SURF} L${X0},${SURF + (depth + 1) * LH} M${X1},${SURF} L${X1},${SURF + (depth + 1) * LH}" stroke="#9B6A45" stroke-width="5" stroke-dasharray="4 10" opacity="${f1(gk)}"/>`;
      // A pulley at the top of the shaft hauls buckets of dirt up while digging.
      if (gk > 0) {
        const dg = T.layers.some(a => t > a - 0.6 && t < a + 0.6);
        const by = SURF - 40 + (dg ? 0 : Math.max(0, depth + 1) * LH * 0.5) + Math.sin(t * 3) * 10;
        out += fade(gk, `<path d="M690,${SURF} L710,392 L850,392 L870,${SURF}" stroke="#9B6A45" stroke-width="10" fill="none"/><circle cx="780" cy="392" r="16" fill="${C.muted}"/><line x1="780" y1="392" x2="780" y2="${f1(by - 40)}" stroke="${C.muted}" stroke-width="3"/>
          <path d="M756,${f1(by - 40)} L804,${f1(by - 40)} L798,${f1(by)} L762,${f1(by)} Z" fill="${C.peach}"/><ellipse cx="780" cy="${f1(by - 42)}" rx="22" ry="7" fill="#C9A276"/>`);
      }
      // Labels and artifacts per layer.
      const labs = [['4H · room', C.purple], ['1H · map', DK.teal], ['15M · observe', DK.peach], ['1M · execute', DK.pink], ['RISK', C.pink], ['MANAGEMENT', C.purple]];
      const icon = (i, x, y) => {
        if (i === 0) return `<g transform="translate(${x},${y})"><path d="M-40,26 L-40,-8 L0,-34 L40,-8 L40,26 Z" fill="#fff" stroke="${C.purple}" stroke-width="5"/><rect x="-20" y="2" width="9" height="16" rx="2" fill="${C.teal}"/><rect x="-4" y="-6" width="9" height="24" rx="2" fill="${C.teal}"/><rect x="12" y="-14" width="9" height="32" rx="2" fill="${C.teal}"/></g>`;
        if (i === 1) return `<g transform="translate(${x},${y})"><rect x="-44" y="-26" width="88" height="52" rx="6" fill="#FFF6E0" stroke="${DK.peach}" stroke-width="4"/><path d="M-32,14 L-14,-6 L4,6 L30,-16" stroke="${DK.teal}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="30" cy="-16" r="6" fill="${C.pink}"/></g>`;
        if (i === 2) return `<g transform="translate(${x},${y})"><circle cx="-18" cy="4" r="20" fill="${C.dark}"/><circle cx="18" cy="4" r="20" fill="${C.dark}"/><circle cx="-18" cy="4" r="12" fill="${C.tealL}"/><circle cx="18" cy="4" r="12" fill="${C.tealL}"/><rect x="-8" y="-12" width="16" height="12" fill="${C.dark}"/></g>`;
        if (i === 3) return iccIcon(x, y + 4, 0.9);
        if (i === 4) return shieldIcon(x, y, 0.9);
        return `<g transform="translate(${x},${y})"><rect x="-30" y="-32" width="60" height="66" rx="8" fill="#fff" stroke="${C.purple}" stroke-width="4"/><rect x="-14" y="-38" width="28" height="12" rx="4" fill="${C.purple}"/>${[0, 1, 2].map(j => `<path d="M-18,${-12 + j * 16} l5,5 l9,-9" stroke="${C.teal}" stroke-width="4" fill="none"/><rect x="2" y="${-12 + j * 16}" width="18" height="4" rx="2" fill="${C.purpleL}"/>`).join('')}</g>`;
      };
      labs.forEach(([lab, col], i) => {
        const y = SURF + i * LH + LH / 2 + 4;
        out += pill(590, y, lab, col, pop(t, T.layers[i] + 0.1, 0.5), 22);
        const ik = pop(t, T.layers[i] + 0.2, 0.6);
        if (ik > 0) out += scaleAt(1120, y, ik, icon(i, 1120, y));
      });
      // The locked chest at the bottom (layer 7).
      const cy = SURF + 6 * LH + LH / 2 + 6, cx = 960;
      const ck = pop(t, T.site + 0.8, 0.7), open = ease(seg(t, T.open, T.open + 0.8));
      const glow = t > T.open ? `<ellipse cx="${cx}" cy="${cy - 30}" rx="${120 + Math.sin(t * 6) * 8}" ry="40" fill="${C.gold}" opacity="${f1(open * 0.35)}"/>` : '';
      out += scaleAt(cx, cy + 30, ck, `${glow}<rect x="${cx - 70}" y="${cy - 14}" width="140" height="48" rx="8" fill="#B8743C" stroke="#7A4A2A" stroke-width="5"/>
        <g transform="rotate(${f1(-open * 28)} ${cx - 70} ${cy - 14})"><path d="M${cx - 70},${cy - 14} Q${cx - 70},${cy - 46} ${cx},${cy - 48} Q${cx + 70},${cy - 46} ${cx + 70},${cy - 14} Z" fill="#C98A4E" stroke="#7A4A2A" stroke-width="5"/></g>
        <rect x="${cx - 74}" y="${cy + 2}" width="148" height="8" fill="${C.gold}"/>`
        + (open < 1 ? padlock(cx, cy + 4, 0.62, open, C.gold) : ''));
      out += pill(590, cy + 6, 'OUTCOME', C.dark, pop(t, T.site + 1.2, 0.5) * (1 - 0.0), 22);
      if (open > 0) out += A.sparkle(cx, cy - 40, T.open + 0.3, t, C.gold) + A.sparkle(cx + 90, cy - 70, T.open + 0.6, t, C.teal) + pill(cx + 250, cy - 20, 'last, not first', C.gold, pop(t, T.open + 0.5), 22);
      out += bub(1380, cy - 30, 'Locked till the end', between(t, T.site + 1.6, T.mole - 0.4), { size: 24 });
      // Archaeologist: walks in, then stands on the floor of the deepest dug layer, brushing.
      const floorY = i => i < 0 ? SURF : SURF + (i + 1) * LH - 2;
      let ay = SURF, ax = 900;
      if (t < T.layers[0] - 0.4) ax = lerp(560, 900, ease(seg(t, T.site + 0.5, T.site + 2)));
      else {
        let fy = SURF;
        T.layers.forEach((a, i) => { fy = lerp(fy, floorY(i), ease(seg(t, a - 0.5, a))); });
        ay = fy;
      }
      const digging = T.layers.some(a => t > a - 0.6 && t < a + 0.6);
      const ar = { x: ax, y: ay, scale: 0.58, look: A.LOOKS.b, seed: 3, at: T.site + 0.4, walking: t > T.site + 0.5 && t < T.site + 2, talk: ctx.talking && t > T.open + 1, hat: 'safari' };
      ar.frontArm = digging ? { a1: 10 + Math.sin(t * 14) * 25, a2: 30 + Math.sin(t * 14) * 30 } : t > T.open ? { a1: -100, a2: -110 } : { a1: 50, a2: 20 };
      ar.hold = `<rect x="-5" y="-8" width="10" height="40" rx="4" fill="#9B6A45"/><rect x="-10" y="28" width="20" height="18" rx="4" fill="${C.peach}"/>`;
      out += who(t, ar);
      if (digging) for (let j = 0; j < 6; j++) { const p = ((t * 2 + j / 6) % 1); out += `<circle cx="${f1(ax + 50 + p * 70 * Math.cos(j))}" cy="${f1(ay - 40 - p * 50)}" r="${f1(6 * (1 - p))}" fill="#C9A276" opacity="${f1(1 - p)}"/>`; }
      // Owl foreman with a hard hat, on the surface.
      const ok = pop(t, T.site + 1, 0.6);
      out += scaleAt(330, SURF, ok, critter(t, 'owl', { x: 330, y: SURF, scale: 0.72, seed: 5, talk: ctx.talking && t > T.stop && t < T.stop + 2.4 }) + `<g transform="translate(330,${SURF - 92 + Math.sin(t * 2.4 + 5) * 1.8})"><path d="M-34,-6 Q-34,-40 0,-42 Q34,-40 34,-6 Z" fill="${C.gold}"/><rect x="-40" y="-10" width="80" height="10" rx="5" fill="#C98A1F"/></g>`);
      out += bub(380, 370 + 30, 'The ending goes last!', between(t, T.stop, T.layers[0] - 0.2), { size: 26 });
      // The mole: tunnels from the surface on the right towards the chest, gets stopped, retreats.
      const P0 = [1620, SURF + 6], P1 = [1150, cy];
      const go = seg(t, T.mole, T.stop + 0.2) * 0.62, ret = ease(seg(t, T.stop + 0.8, T.stop + 2.4));
      const prog = go * (1 - ret);
      if (t > T.mole) {
        out += `<path d="M${P0[0]},${P0[1]} L${f1(lerp(P0[0], P1[0], go))},${f1(lerp(P0[1], P1[1], go))}" stroke="#7A5C50" stroke-width="44" stroke-linecap="round" opacity="${f1(0.55 * (1 - ret * 0.6))}"/>`;
        const mx = lerp(P0[0], P1[0], prog), my = lerp(P0[1], P1[1], prog) + 34;
        out += bst(t, 'mole', { x: mx, y: my, scale: 0.8, seed: 2, flip: true, dig: t < T.stop, mood: t > T.stop ? 'sad' : undefined, at: T.mole, talk: ctx.talking && t < T.stop });
        out += bub(1560, 400, 'Straight to the ending!', between(t, T.mole + 0.4, T.stop - 0.2), { size: 26, tail: 'right' });
        out += cross(lerp(P0[0], P1[0], 0.62) - 60, lerp(P0[1], P1[1], 0.62) - 40, between(t, T.stop, T.stop + 2.2), C.pink, 30);
      }
      return out;
    },

    // A film editor cuts the case together. The last reel (the outcome) is taped shut; the cat wants to start there.
    's21-cutting-room': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="640" fill="#F3EEF7" opacity=".8"/>` + ground(1000, '#E8D3BE', '#D6BFA6');
      for (let i = 0; i < 12; i++) out += `<rect x="${i * 170}" y="1004" width="4" height="76" fill="#D6BFA6"/>`;
      // Shelf with seven reels.
      const shk = ease(seg(t, T.room - 0.2, T.room + 0.7));
      out += fade(shk, `<rect x="110" y="560" width="760" height="16" rx="6" fill="#9B6A45"/><rect x="140" y="576" width="12" height="40" fill="#9B6A45"/><rect x="830" y="576" width="12" height="40" fill="#9B6A45"/>`);
      const names = ['4H', '1H', '15M', '1M', 'RISK', 'MGMT', 'END'];
      const played = i => i < 6 ? seg(t, T.play + i * 0.15, T.play + i * 0.15 + 0.3) : seg(t, T.snip + 0.2, T.snip + 0.6);
      names.forEach((n, i) => {
        const x = 170 + i * 104, k = pop(t, T.room + 0.2 + i * 0.12, 0.5);
        const wob = i === 6 && t > T.cat + 0.6 && t < T.scold ? Math.sin(t * 22) * 8 : 0;
        const spin = (t * (played(i) > 0 && played(i) < 1 ? 600 : 20) + i * 40) % 360;
        const reel = `<g transform="rotate(${f1(wob)} ${x} 556)"><circle cx="${x}" cy="510" r="44" fill="${i === 6 ? C.dark : C.purple}"/><g transform="rotate(${f1(spin)} ${x} 510)">${[0, 1, 2].map(j => `<circle cx="${f1(x + Math.cos(rad(j * 120)) * 22)}" cy="${f1(510 + Math.sin(rad(j * 120)) * 22)}" r="11" fill="#F3EEF7"/>`).join('')}</g><circle cx="${x}" cy="510" r="7" fill="${C.gold}"/>
          ${i === 6 && t < T.snip + 0.2 ? `<path d="M${x - 50},468 L${x + 50},552 M${x + 50},468 L${x - 50},552" stroke="${C.pinkL}" stroke-width="16" stroke-linecap="round" opacity=".95"/>` : ''}</g>`;
        out += scaleAt(x, 556, k * (1 - 0.0), reel);
        if (k > 0) out += txt(x, 606, n, 22, i === 6 ? C.pink : C.muted, { op: f1(k) });
      });
      out += pill(694 + 104 / 2 + 52, 450, 'taped shut', C.pink, between(t, T.room + 1.2, T.snip), 20);
      // Desk, editor, a spinning reel on the desk.
      const ed = { x: 500, y: 935, scale: 0.9, look: A.LOOKS.e, seed: 4, at: T.room + 0.5, hat: 'headset', talk: ctx.talking && t > T.scold && t < T.scold + 3 };
      ed.frontArm = t > T.scold && t < T.scold + 2.4 ? { a1: -40 + Math.sin(t * 8) * 10, a2: -60 } : t > T.snip - 0.4 && t < T.snip + 0.8 ? aim(ed, 790, 610) : { a1: 40 + Math.sin(t * 3) * 10, a2: 10 };
      out += who(t, ed);
      out += fade(shk, `<rect x="300" y="820" width="580" height="22" rx="8" fill="#B8743C"/><rect x="346" y="842" width="488" height="96" fill="#C98A4E"/><rect x="330" y="842" width="16" height="158" fill="#9B6A45"/><rect x="834" y="842" width="16" height="158" fill="#9B6A45"/>`);
      if (shk > 0) {
        const sp = t > T.play && t < T.snip + 2 ? t * 400 : t * 30;
        out += `<g transform="rotate(${f1(sp % 360)} 770 772)"><circle cx="770" cy="772" r="48" fill="${C.pink}"/>${[0, 1, 2].map(j => `<circle cx="${f1(770 + Math.cos(rad(j * 120)) * 24)}" cy="${f1(772 + Math.sin(rad(j * 120)) * 24)}" r="12" fill="#F3EEF7"/>`).join('')}<circle cx="770" cy="772" r="8" fill="${C.gold}"/></g>`;
      }
      // Projector and film strip.
      const pk = pop(t, T.room + 0.8, 0.6);
      const strip = (t * (t > T.play ? 160 : 12)) % 40;
      out += scaleAt(920, 820, pk, `<path d="M790,730 Q830,700 870,760" stroke="${C.dark}" stroke-width="20" fill="none"/><path d="M790,730 Q830,700 870,760" stroke="#F3EEF7" stroke-width="8" fill="none" stroke-dasharray="10 30" stroke-dashoffset="${f1(-strip)}"/>
        <rect x="860" y="740" width="130" height="80" rx="14" fill="${C.muted}"/><circle cx="990" cy="770" r="20" fill="${C.dark}"/><circle cx="990" cy="770" r="10" fill="${t > T.play ? '#FFF4C8' : '#999'}"/>
        <rect x="900" y="820" width="12" height="180" fill="${C.muted}"/><rect x="870" y="990" width="72" height="12" rx="6" fill="${C.muted}"/>`);
      // Screen.
      const sk = pop(t, T.room + 0.4, 0.7);
      const SX = 1060, SY = 400, SW = 720, SH = 420;
      out += scaleAt(SX + SW / 2, SY + SH, sk, `<rect x="${SX - 14}" y="${SY - 14}" width="${SW + 28}" height="${SH + 28}" rx="10" fill="${C.dark}"/><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="#fff"/>`);
      if (t > T.play - 0.2) out += `<path d="M1008,770 L${SX},${SY + 30} L${SX},${SY + SH - 30} Z" fill="#FFF4C8" opacity="${f1(0.35 + Math.sin(t * 20) * 0.04)}"/>`;
      if (sk > 0 && t < T.play) out += txt(SX + SW / 2, SY + SH / 2 + 20, 'THE CASE', 54, '#E8DDF0', { f: 'Playfair Display' });
      // Title cards for 4H, 1H, 15M, then the 1M replay.
      const cards = ['4H', '1H', '15M'];
      cards.forEach((c, i) => {
        const a = T.play + i * 0.45;
        if (t > a && t < a + 0.45) out += `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="${[C.purpleL, C.tealL, C.peachL][i]}"/>` + txt(SX + SW / 2, SY + SH / 2 + 34, c, 110, C.dark, { f: 'Playfair Display' });
      });
      const c0 = T.play + 1.35;
      if (t > c0) {
        const bars = B1.map((b, i) => i);
        const times = bars.map(i => i <= 9 ? c0 + i * 0.24 : T.snip + 0.8 + (i - 10) * 0.45);
        out += chart(t, { x: SX + 50, y: SY + 70, w: SW - 170, h: SH - 120, bars: B1, times, panel: false, pil: (0.45 - .3) * 2.2 + .12, pilAt: c0 - 0.4, maxBody: 28,
          tags: [{ i: 4, text: 'IND', at: c0 + 1.1, col: C.purple, fs: 18 }, { i: 6, text: 'CONT', at: c0 + 1.6, col: DK.teal, fs: 18 }, { i: 8, text: 'RETEST', at: c0 + 2.1, col: DK.pink, pos: 'below', fs: 18, off: 34 }] });
        const { X, Y } = geo({ x: SX + 50, y: SY + 70, w: SW - 170, h: SH - 120, bars: B1 });
        // Pause at the decision: everything after is not known yet.
        if (t > T.pause && t < T.snip + 0.8) {
          const cv = 1 - ease(seg(t, T.snip + 0.2, T.snip + 0.8));
          out += `<rect x="${f1(X(9) + 30)}" y="${SY + 4}" width="${f1((SX + SW - 4 - X(9) - 30) * cv)}" height="${SH - 8}" fill="#EDE8F2"/>`;
          if (cv > 0.5) out += txt(X(9) + 30 + (SX + SW - X(9) - 30) / 2, SY + SH / 2 + 30, '?', 90, C.purpleL, { f: 'Playfair Display' });
          out += `<g transform="translate(${SX + 40},${SY + 40})" opacity="${f1(Math.min(cv, 0.6 + Math.sin(t * 5) * 0.4))}"><rect x="-12" y="-16" width="9" height="32" rx="3" fill="${C.pink}"/><rect x="5" y="-16" width="9" height="32" rx="3" fill="${C.pink}"/></g>`;
        }
        if (t > T.pause) {
          out += `<line x1="${X(9) + 12}" x2="${SX + SW - 20}" y1="${Y(.36)}" y2="${Y(.36)}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="10 8" opacity="${f1(ease(seg(t, T.pause + 1.2, T.pause + 1.8)))}"/>`;
          out += `<path d="M${X(9)},${Y(.48) + 40} l-14,22 l28,0 Z" fill="${C.teal}" opacity="${f1(pop(t, T.pause + 0.4))}"/>`;
        }
        out += pill(SX + SW / 2, SY + SH + 56, 'What did I know here?', C.purple, between(t, T.pause + 0.2, T.snip - 0.2), 26);
      }
      // Outcome reel: snipped and played last.
      if (t > T.snip) {
        out += `<g transform="translate(${760 + Math.sin(t * 30) * 4},${620}) rotate(${-20 + Math.sin(t * 20) * 14})" opacity="${f1(1 - seg(t, T.snip + 0.8, T.snip + 1.2))}"><circle cx="-10" cy="0" r="12" fill="none" stroke="${C.muted}" stroke-width="6"/><circle cx="-10" cy="28" r="12" fill="none" stroke="${C.muted}" stroke-width="6"/><path d="M0,6 L44,-10 M0,22 L44,38" stroke="${C.muted}" stroke-width="6" stroke-linecap="round"/></g>`;
        out += pill(SX + SW / 2, SY + SH + 56, 'Stop hit · -1R', C.pink, pop(t, T.verdict - 0.4, 0.5), 26);
        out += bstamp(SX + 120, SY + 100, 'VALID', DK.teal, pop(t, T.verdict + 0.4, 0.6), -12, 70, 26);
        out += pill(SX + 120, SY + 192, 'process', DK.teal, pop(t, T.verdict + 0.7, 0.5), 20);
      }
      // The cat on the shelf, pawing the taped reel; then sent down.
      const onShelf = t > T.cat && t < T.scold + 1.2;
      const catK = pop(t, T.room + 1.4, 0.6);
      const jump = t > T.cat && t < T.cat + 0.6 ? Math.sin(seg(t, T.cat, T.cat + 0.6) * Math.PI) * 120 : t > T.scold + 1.2 && t < T.scold + 1.8 ? Math.sin(seg(t, T.scold + 1.2, T.scold + 1.8) * Math.PI) * 80 : 0;
      const catX = onShelf ? 860 + 10 : t > T.scold + 1.2 ? 960 : 980, catY = (onShelf ? 556 : 1000) - jump;
      out += scaleAt(catX, catY, catK, critter(t, 'cat', { x: catX, y: catY, scale: 0.72, seed: 6, flip: true, talk: ctx.talking && t > T.cat && t < T.scold, sleep: false }));
      out += bub(1080, 470, 'Start with: “I lost”', between(t, T.cat + 0.6, T.scold - 0.1), { size: 26 });
      out += bub(330, 660, 'Wrong part of the trade!', between(t, T.scold, T.play - 0.2), { size: 26, tail: 'left' });
      // A mouse projectionist on the projector, munching popcorn.
      const mk = pop(t, T.room + 1.8, 0.6);
      out += scaleAt(950, 740, mk, critter(t, 'mouse', { x: 940, y: 740, scale: 0.7, seed: 3 }) + `<g transform="translate(${975},${716 + Math.sin(t * 6) * 3})"><path d="M-10,-6 L10,-6 L8,14 L-8,14 Z" fill="${C.pinkL}"/><circle cx="-5" cy="-8" r="5" fill="#FFF6E0"/><circle cx="4" cy="-10" r="5" fill="#FFF6E0"/></g>`);
      return out;
    },
  });

  /* ================= Lesson 2: A Valid Winning Trade ================= */
  const studioLights = (t, y = 392, n = 14) => Array.from({ length: n }, (_, i) => {
    const x = 70 + i * (1780 / (n - 1)), on = Math.sin(t * 4 + i * 0.9) > -0.2;
    return `<circle cx="${f1(x)}" cy="${y}" r="11" fill="${on ? C.gold : '#EADFD8'}"/>${on ? `<circle cx="${f1(x)}" cy="${y}" r="20" fill="${C.gold}" opacity=".18"/>` : ''}`;
  }).join('');
  // Paper plane shape: k = 0 (flat sheet) .. 1 (folded plane). Facing right, centred at 0,0.
  const PLANE0 = [[80, -50], [-80, -50], [-80, 0], [-80, 50], [80, 50]];
  const PLANE1 = [[92, 0], [-70, -34], [-82, -4], [-66, 22], [2, 8]];
  const paperPlane = (x, y, k, ang = 0, sc = 1) => {
    const P = PLANE0.map((p, i) => [lerp(p[0], PLANE1[i][0], k), lerp(p[1], PLANE1[i][1], k)]);
    const crease = k > 0.25 ? `<path d="M${f1(P[0][0])},${f1(P[0][1])} L${f1(P[2][0])},${f1(P[2][1])}" stroke="${C.purpleL}" stroke-width="4"/>` : '';
    const crease2 = k > 0.6 ? `<path d="M${f1(P[0][0])},${f1(P[0][1])} L${f1(lerp(P[2][0], P[3][0], 0.5))},${f1(lerp(P[2][1], P[3][1], 0.5) + 6)}" stroke="${C.purpleL}" stroke-width="3"/>` : '';
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(ang)}) scale(${sc},${f1(sc * lerp(0.5, 1, k))})"><path d="M${P.map(p => `${f1(p[0])},${f1(p[1])}`).join(' L')} Z" fill="#fff" stroke="${C.purple}" stroke-width="4" stroke-linejoin="round"/>${crease}${crease2}</g>`;
  };

  Object.assign(LIVE, {
    // A cooking show: the dish arrives with a gold "+2R" price tag. The judge slides the tag aside and grades the recipe card.
    's21-cook-off': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="628" fill="#FBEFF3"/>` + ground(1000, '#EFE3F3', '#D9CFE9');
      out += fade(ease(seg(t, T.set - 0.2, T.set + 0.6)), studioLights(t) + `<path d="M0,410 L1920,410" stroke="#EADFD8" stroke-width="4"/>`);
      for (let i = 0; i < 10; i++) out += `<rect x="${i * 200}" y="1000" width="100" height="80" fill="#E5D9EE" opacity=".6"/>`;
      // Chef behind the counter.
      const chef = { x: 470, y: 1000, scale: 1.0, look: A.LOOKS.c, seed: 2, at: T.set + 0.3, hat: 'chef', talk: ctx.talking && t > T.reveal && t < T.reveal + 1.5 };
      chef.frontArm = t > T.reveal - 0.5 && t < T.reveal + 1.2 ? aim(chef, 640, 730 - ease(seg(t, T.reveal, T.reveal + 0.6)) * 120) : t > T.stamp ? { a1: -110 + Math.sin(t * 7) * 12, a2: -100 } : { a1: 70, a2: 30 };
      out += who(t, chef);
      // Counter.
      const ck = ease(seg(t, T.set, T.set + 0.6));
      out += fade(ck, `<rect x="240" y="870" width="680" height="26" rx="10" fill="${C.purple}"/><rect x="260" y="896" width="640" height="104" fill="${C.purpleL}"/>${[0, 1, 2].map(i => `<rect x="${300 + i * 210}" y="914" width="160" height="70" rx="12" fill="#fff" opacity=".5"/>`).join('')}`);
      // The dish: plate, food, and the cloche lifting off.
      const lift = ease(seg(t, T.reveal, T.reveal + 0.7));
      const dk = pop(t, T.set + 0.8, 0.6);
      out += '<g transform="translate(0,80)">' + scaleAt(700, 790, dk, `<ellipse cx="700" cy="782" rx="120" ry="18" fill="#fff" stroke="#EADFD8" stroke-width="4"/>
        <ellipse cx="660" cy="760" rx="34" ry="22" fill="${C.peach}"/><ellipse cx="730" cy="758" rx="40" ry="24" fill="${C.pink}"/><circle cx="696" cy="740" r="14" fill="${C.teal}"/>
        <g transform="translate(${f1(lift * 40)},${f1(-lift * 150)}) rotate(${f1(lift * 18)} 700 780)"><path d="M590,780 Q590,670 700,664 Q810,670 810,780 Z" fill="#DCD6E2" stroke="#B9B2C4" stroke-width="5"/><circle cx="700" cy="656" r="12" fill="#B9B2C4"/><path d="M630,740 Q640,700 680,690" stroke="#fff" stroke-width="8" fill="none" opacity=".7" stroke-linecap="round"/></g>`);
      if (lift > 0) out += `<g opacity="${f1(lift)}">${[0, 1, 2].map(i => `<path d="M${670 + i * 30},${730 - ((t * 40 + i * 20) % 60)} q10,-15 0,-30" stroke="#EADFD8" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
      out += '</g>';
      // The gold "+2R" price tag, then slid aside by the judge.
      const slide = ease(seg(t, T.slide, T.slide + 1));
      const tagK = pop(t, T.reveal + 0.5, 0.6);
      if (tagK > 0) {
        const tx = 820 + slide * -560, ty = 740 + slide * 200, sw = Math.sin(t * 3) * 8;
        out += fade(1 - slide * 0.6, scaleAt(tx, ty, tagK, `<g transform="rotate(${f1(sw - slide * 30)} ${tx - 50} ${ty})"><line x1="${tx - 120}" y1="${ty - 40}" x2="${tx - 60}" y2="${ty}" stroke="${C.muted}" stroke-width="3"/><path d="M${tx - 60},${ty} L${tx - 30},${ty - 40} L${tx + 90},${ty - 40} L${tx + 90},${ty + 40} L${tx - 30},${ty + 40} Z" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/><circle cx="${tx - 34}" cy="${ty}" r="8" fill="#FFF6E0"/>${txt(tx + 30, ty + 16, '+2R', 46, '#fff')}</g>`));
        if (t > T.reveal + 0.6 && t < T.slide) out += A.sparkle(tx + 30, ty - 30, T.reveal + 0.8, t, C.gold) + A.sparkle(tx - 10, ty + 20, T.reveal + 1.5, t, C.gold);
        out += cross(tx + 100, ty - 50, between(t, T.slide + 0.6, s.end), C.pink, 26);
        out += pill(tx + 20, ty + 76, 'not the reason', C.pink, between(t, T.slide + 0.8, s.end), 20);
      }
      // Parrot on a stand, losing it.
      const pk = pop(t, T.set + 1.2, 0.6);
      out += scaleAt(1000, 1000, pk, `<rect x="994" y="620" width="12" height="380" fill="${C.muted}"/><rect x="940" y="612" width="120" height="12" rx="6" fill="${C.muted}"/><ellipse cx="1000" cy="996" rx="60" ry="10" fill="${C.muted}"/>`
        + critter(t, 'parrot', { x: 990, y: 614, scale: 0.85, seed: 3, hop: t > T.parrot && t < T.slide ? 12 : 0, hopH: 18, talk: ctx.talking && t > T.parrot && t < T.slide }));
      out += bub(1060, 470, 'It won! It won!', between(t, T.parrot, T.slide), { size: 30 });
      // Judge's table with the recipe card.
      const jd = { x: 1500, y: 1000, scale: 1.0, look: A.LOOKS.a, seed: 7, at: T.set + 0.6, flip: true, hat: 'glasses', talk: ctx.talking && t > T.taste + 0.6 };
      jd.frontArm = t > T.slide - 0.3 && t < T.slide + 1.1 ? aim(jd, 1240, 700) : t > T.taste && t < T.taste + 1.4 ? { a1: -60 + Math.sin(t * 6) * 8, a2: -150 } : t > T.card && t < T.taste ? aim(jd, 1330, 720 + Math.sin(t * 3) * 10) : { a1: 80, a2: 60 };
      if (t > T.taste && t < T.taste + 1.4) jd.hold = `<rect x="-4" y="-30" width="8" height="40" rx="3" fill="#B9B2C4" transform="rotate(30)"/><ellipse cx="-10" cy="-30" rx="12" ry="8" fill="#B9B2C4"/>`;
      out += who(t, jd);
      out += fade(ck, `<rect x="1120" y="880" width="640" height="24" rx="10" fill="${C.teal}"/><rect x="1140" y="904" width="600" height="96" fill="${C.tealL}"/>` + txt(1440, 966, 'JUDGE', 40, '#fff', { ls: 6 }));
      const ckk = pop(t, T.card, 0.7);
      const items = ['Thesis agreed', 'I-C-C closed', 'Retest entry', 'Risk set', 'Plan made first'];
      out += scaleAt(1260, 830, ckk, `<rect x="1150" y="470" width="250" height="330" rx="16" fill="#FFF8EC" stroke="${C.peach}" stroke-width="5" transform="rotate(-3 1275 640)"/>`
        + txt(1275, 518, 'RECIPE', 30, DK.peach, { f: 'Playfair Display', ls: 2 })
        + items.map((it, i) => {
          const y = 568 + i * 48, k = pop(t, T.checks[i], 0.5);
          return `<rect x="1176" y="${y - 14}" width="26" height="26" rx="6" fill="#fff" stroke="${C.peach}" stroke-width="3"/>` + (k > 0 ? scaleAt(1189, y, k, `<path d="M1180,${y} l7,8 l13,-16" stroke="${C.tealD}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) : '') + txt(1214, y + 9, it, 22, C.text, { a: 'start', w: 700 });
        }).join(''));
      out += bstamp(1510, 560, 'GOOD', DK.teal, pop(t, T.stamp, 0.6), -14, 64, 26);
      out += bub(1700, 440, 'Good before it won', between(t, T.stamp + 0.6, s.end), { size: 26, tail: 'right' });
      if (t > T.stamp) out += A.sparkle(1510, 560, T.stamp + 0.2, t, C.teal);
      return out;
    },

    // A paper plane contest: folded by the plan, lands on target. "Because it flew far" is not the reason; rewind to before the throw.
    's21-paper-plane': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="600" fill="#E4F3F1" opacity=".75"/>` + cloud(400 + (t * 14) % 300, 440, 0.6) + cloud(1400 - (t * 9) % 260, 470, 0.5);
      out += `<path d="M0,900 Q300,820 640,880 Q980,930 1300,860 Q1620,800 1920,870 L1920,980 L0,980 Z" fill="#CFE6C4"/>` + ground(960, '#E3EED9', '#CFE0C2');
      // Target on the ground with a flag.
      const tg = pop(t, T.set + 0.6, 0.6);
      out += scaleAt(1660, 975, tg, `<ellipse cx="1660" cy="975" rx="150" ry="34" fill="${C.pinkL}"/><ellipse cx="1660" cy="975" rx="100" ry="23" fill="#fff"/><ellipse cx="1660" cy="975" rx="52" ry="12" fill="${C.pink}"/>
        <rect x="1780" y="760" width="8" height="216" fill="${C.muted}"/><path d="M1788,766 L${1870 + Math.sin(t * 5) * 6},790 L1788,814 Z" fill="${C.teal}"/>`);
      out += pill(1784, 726, 'target', DK.teal, pop(t, T.land + 0.3, 0.5), 20);
      // Folding table and the engineer.
      const en = { x: 320, y: 980, scale: 0.92, look: A.LOOKS.d, seed: 4, at: T.set + 0.2, hat: 'bow', talk: ctx.talking && t > T.rewind + 2 };
      const foldK = T.folds.reduce((k, a) => k + ease(seg(t, a, a + 0.6)) / T.folds.length, 0);
      const throwing = t > T.throw - 0.6 && t < T.throw + 0.4;
      const holdP = t > T.folds[3] + 0.7 && t < T.throw;
      const back = t > T.rewind + 1.6;
      if (t < T.folds[3] + 0.7) en.frontArm = aim(en, 470 + Math.sin(t * 9) * 16, 760);
      else if (throwing) en.frontArm = { a1: lerp(-160, -20, ease(seg(t, T.throw - 0.3, T.throw + 0.1))), a2: lerp(-170, -10, ease(seg(t, T.throw - 0.3, T.throw + 0.1))) };
      else if (holdP || back) en.frontArm = { a1: -30, a2: -60 };
      else en.frontArm = { a1: -120 + Math.sin(t * 6) * 10, a2: -100 };
      out += who(t, en);
      const tk = ease(seg(t, T.set, T.set + 0.6));
      out += fade(tk, `<rect x="380" y="790" width="220" height="14" rx="6" fill="#B8743C"/><path d="M400,804 L384,980 M580,804 L596,980" stroke="#9B6A45" stroke-width="8"/>`);
      // The plane: on the table (folding), in the hand, in flight, then rewound.
      const P0 = [470, 768], P1 = [1640, 950], PC = [1050, 340];
      const qb = (u) => [lerp(lerp(P0[0], PC[0], u), lerp(PC[0], P1[0], u), u), lerp(lerp(P0[1], PC[1], u), lerp(PC[1], P1[1], u), u)];
      const handPos = () => { const sx = en.x + 18 * en.scale, sy = en.y - 196 * en.scale; return [sx + 90, sy - 50]; };
      if (t > T.set + 0.6) {
        let u = null;
        if (t >= T.throw && t < T.rewind) u = ease(seg(t, T.throw, T.land));
        if (t >= T.rewind) u = 1 - ease(seg(t, T.rewind, T.rewind + 1.4));
        if (u === null || (t >= T.rewind && u <= 0)) {
          const [hx, hy] = holdP || back ? handPos() : [470, 776];
          out += paperPlane(hx, hy, foldK, holdP || back ? -10 : 0, holdP || back ? 0.9 : 1.05);
        } else {
          const [x, y] = qb(u), [x2, y2] = qb(Math.min(1, u + 0.01));
          const ang = u >= 1 ? 8 : Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
          // Dashed trail.
          const tr = Array.from({ length: 24 }, (_, i) => qb(u * i / 23)).map(p => `${f1(p[0])},${f1(p[1])}`).join(' L');
          out += `<path d="M${tr}" stroke="${t > T.rewind ? C.purple : C.purpleL}" stroke-width="5" fill="none" stroke-dasharray="4 14" stroke-linecap="round"/>`;
          out += paperPlane(x, y - (u >= 1 ? 10 : 0), 1, ang, 1.4);
        }
      }
      if (t > T.land && t < T.rewind) out += A.sparkle(1660, 940, T.land, t, C.gold) + A.sparkle(1600, 900, T.land + 0.3, t, C.teal);
      if (t > T.rewind && t < T.rewind + 1.4) out += `<g transform="translate(960,640)" opacity="${f1(0.6 + Math.sin(t * 12) * 0.3)}"><path d="M0,-40 L-50,0 L0,40 Z M50,-40 L0,0 L50,40 Z" fill="${C.purple}"/></g>`;
      // The crease checks glow after the rewind.
      const glowK = pop(t, T.rewind + 1.8, 0.6);
      const labs = ['thesis', 'sequence', 'retest', 'risk', 'plan'];
      if (glowK > 0) labs.forEach((l, i) => out += pill(520 + (i % 3) * 200 + (i > 2 ? 100 : 0), 450 + (i > 2 ? 70 : 0), l, [C.purple, DK.teal, DK.pink, C.pink, DK.peach][i], pop(t, T.rewind + 1.8 + i * 0.35, 0.5), 28));
      out += pill(720, 610, 'all true before the throw', DK.teal, pop(t, T.rewind + 3.8, 0.6), 30);
      // Two flying gulls, a dog fan by the target.
      out += critter(t, 'bird', { x: ((t - s.start) * 90) % 2200 - 100, y: 450 + Math.sin(t * 2) * 14, scale: 0.55, seed: 1, fly: true });
      out += beast(t, 'gull', { x: 1980 - ((t - s.start) * 70) % 2300, y: 520 + Math.sin(t * 1.6) * 16, scale: 0.7, seed: 4, fly: true, flip: true });
      const cheer = t > T.land && t < T.rewind;
      out += crit(t, 'dog', { x: 1300, y: 970, scale: 1.0, seed: 5, at: T.set + 1, hop: cheer ? 10 : 0, hopH: 30, tongue: cheer, talk: ctx.talking && t > T.dog && t < T.nope });
      out += bub(1360, 700, 'It flew far, so it was good!', between(t, T.dog, T.nope), { size: 26 });
      out += cross(1530, 640, between(t, T.nope, T.rewind + 1.2), C.pink, 30);
      out += bub(1330, 700, 'Because it won? No.', between(t, T.nope + 0.2, T.rewind + 1.2), { size: 26 });
      // A robot judge with a clipboard nods at the end.
      out += crit(t, 'robot', { x: 1060, y: 975, scale: 1.0, seed: 3, at: T.set + 1.4, screen: 'PLAN', talk: ctx.talking && t > T.rewind + 2 && t < s.end - 1 });
      return out;
    },
  });

  /* ================= Lesson 3: A Valid Losing Trade ================= */
  // A sprout: (x, y) = soil level, h 0..1 height, bend 0..1 (flattened).
  const sprout = (x, y, h, bend = 0, sw = 0) => {
    if (h <= 0) return '';
    const H = 150 * h, a = bend * 78 + sw;
    const tx = x + Math.sin(rad(a)) * H, ty = y - Math.cos(rad(a)) * H;
    const mx = x + Math.sin(rad(a * 0.5)) * H * 0.5, my = y - Math.cos(rad(a * 0.5)) * H * 0.5;
    const lf = (cx, cy, ang, s) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(28 * s)}" ry="${f1(12 * s)}" fill="#7CB46B" transform="rotate(${f1(ang)} ${f1(cx)} ${f1(cy)})"/>`;
    return `<path d="M${x},${y} Q${f1(mx)},${f1(my)} ${f1(tx)},${f1(ty)}" stroke="#5E9E4E" stroke-width="9" fill="none" stroke-linecap="round"/>`
      + lf(tx - 22, ty, -20 + a, h) + lf(tx + 22, ty, 20 + a, h) + (h > 0.7 ? `<circle cx="${f1(tx)}" cy="${f1(ty - 10)}" r="${f1(14 * (h - 0.7) / 0.3)}" fill="${bend > 0.5 ? '#C9B8A6' : C.pink}"/>` : '');
  };

  Object.assign(LIVE, {
    // A gardener plants by the book; the sprout comes up; hail flattens it. The snail says change everything; she plants the next row the same way.
    's21-hail-garden': (s, t, ctx) => {
      const T = s.beats;
      const dark = ease(seg(t, T.cloud, T.hail)) * (1 - ease(seg(t, T.flat + 2.4, T.flat + 3.6)));
      let out = `<rect x="0" y="372" width="1920" height="560" fill="${dark > 0 ? '#DCD6E2' : '#E4F3F1'}" opacity="${f1(0.6 + dark * 0.3)}"/>`;
      out += cloud(300 + (t * 10) % 240, 440, 0.55) + cloud(1600 - (t * 8) % 200, 420, 0.5);
      // Sun peeking.
      out += `<g opacity="${f1(1 - dark)}"><circle cx="1720" cy="470" r="46" fill="${C.gold}"/>${Array.from({ length: 8 }, (_, i) => { const a = rad(i * 45 + t * 20); return `<line x1="${f1(1720 + Math.cos(a) * 60)}" y1="${f1(470 + Math.sin(a) * 60)}" x2="${f1(1720 + Math.cos(a) * 80)}" y2="${f1(470 + Math.sin(a) * 80)}" stroke="${C.gold}" stroke-width="7" stroke-linecap="round"/>`; }).join('')}</g>`;
      out += ground(900, '#E3EED9', '#CFE0C2');
      // Fence.
      for (let i = 0; i < 13; i++) out += `<rect x="${30 + i * 150}" y="780" width="18" height="122" rx="6" fill="#E7CDA1"/>`;
      out += `<rect x="0" y="806" width="1920" height="12" fill="#E7CDA1"/><rect x="0" y="852" width="1920" height="12" fill="#E7CDA1"/>`;
      // Soil bed.
      out += `<path d="M560,904 Q600,872 700,870 L1500,870 Q1600,872 1640,904 Z" fill="#9B6A45"/>`;
      // Main seed, then the sprout.
      const MX = 940, MY = 880;
      const seedDrop = seg(t, T.plant, T.plant + 0.6);
      if (t > T.plant && t < T.grow) out += `<ellipse cx="${MX}" cy="${f1(lerp(700, MY, ease(seedDrop)))}" rx="10" ry="7" fill="#7A4A2A"/>`;
      if (t > T.plant + 0.6) out += `<ellipse cx="${MX}" cy="${MY - 2}" rx="40" ry="12" fill="#7A4A2A"/>`;
      const h = ease(seg(t, T.grow, T.grow + 1.6)), bend = ease(seg(t, T.flat - 0.4, T.flat + 0.4));
      out += sprout(MX, MY - 6, h, bend, Math.sin(t * 2) * 4 * (1 - bend));
      // The check stakes.
      const stakes = ['thesis', 'I-C-C', 'retest', 'risk'];
      stakes.forEach((lab, i) => {
        const k = pop(t, T.stakes[i], 0.5), x = 700 + i * 120 + (i > 1 ? 120 : 0), y = 880;
        if (k <= 0) return;
        out += scaleAt(x, y, k, `<rect x="${x - 4}" y="${y - 120}" width="8" height="120" fill="#B8743C"/><rect x="${x - 50}" y="${y - 150}" width="100" height="44" rx="8" fill="#fff" stroke="${C.tealD}" stroke-width="3"/>` + txt(x - 6, y - 120, lab, 20, C.text) + `<circle cx="${x + 36}" cy="${y - 128}" r="11" fill="${C.teal}"/><path d="M${x + 31},${y - 128} l4,4 l7,-8" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
      });
      // Hail cloud and hailstones.
      const cx = lerp(2200, 980, ease(seg(t, T.cloud, T.hail))) + ease(seg(t, T.flat + 2.4, T.flat + 3.6)) * -1500;
      if (t > T.cloud && cx > -400) {
        out += `<g transform="translate(${f1(cx)},470)"><ellipse cx="0" cy="0" rx="190" ry="60" fill="#8E8AA0"/><ellipse cx="-110" cy="16" rx="110" ry="50" fill="#8E8AA0"/><ellipse cx="110" cy="14" rx="120" ry="52" fill="#8E8AA0"/><ellipse cx="10" cy="-40" rx="110" ry="60" fill="#9C98AE"/>
          <ellipse cx="-40" cy="0" rx="8" ry="${f1(10 * (1 - blinkAmt(t, 3)))}" fill="${C.dark}"/><ellipse cx="40" cy="0" rx="8" ry="${f1(10 * (1 - blinkAmt(t, 3)))}" fill="${C.dark}"/><path d="M-36,-22 L-18,-14 M36,-22 L18,-14" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/></g>`;
        if (t > T.hail && t < T.flat + 2.6) for (let i = 0; i < 26; i++) {
          const p = ((t - T.hail) * 1.6 + i * 0.137) % 1, hx = cx - 260 + (i * 97) % 520;
          out += `<circle cx="${f1(hx - p * 40)}" cy="${f1(520 + p * 370)}" r="${7 + (i % 3) * 2}" fill="#fff" stroke="#B9B2C4" stroke-width="2"/>`;
        }
      }
      out += pill(MX + 150, 690, 'stop hit · -1R', C.pink, between(t, T.flat + 0.4, T.calm - 0.2), 24);
      // Next row, planted the same way.
      [1350, 1470, 1590].forEach((x, i) => {
        const a = T.row + i * 0.8;
        if (t > a) out += `<ellipse cx="${x}" cy="${MY - 2}" rx="30" ry="10" fill="#7A4A2A"/>` + sprout(x, MY - 6, ease(seg(t, a + 0.4, a + 1.8)), 0, Math.sin(t * 2 + i) * 4);
      });
      out += pill(1440, 540, 'same method · next row', DK.teal, pop(t, T.row + 1.2, 0.6), 24);
      // Gardener.
      const walkTo = t < T.row ? 600 : lerp(600, 1268, ease(seg(t, T.row - 0.6, T.row + 0.4)));
      const gd = { x: t < T.row - 0.6 ? 600 : walkTo, y: 900, scale: 0.92, look: A.LOOKS.buyer, seed: 3, at: T.set + 0.2, hat: 'sun', walking: t > T.row - 0.6 && t < T.row + 0.4, mood: t > T.flat && t < T.calm - 0.4 ? 'sad' : undefined, talk: ctx.talking && t > T.calm && t < T.row };
      const planting = (t > T.plant - 0.4 && t < T.plant + 0.6) || (t > T.row && t < T.row + 2.6);
      gd.frontArm = planting ? { a1: 40 + Math.sin(t * 10) * 10, a2: 70 } : t > T.calm && t < T.row - 0.6 ? { a1: -40, a2: -70 } : { a1: 90, a2: 80 };
      if (t > T.set + 1 && t < T.row - 0.6) gd.hold = `<rect x="-5" y="-6" width="10" height="70" rx="4" fill="#9B6A45" transform="rotate(10)"/><path d="M8,58 L-14,58 L-20,86 L14,86 Z" fill="${C.muted}" transform="rotate(10)"/>`;
      out += who(t, gd);
      // Snail panics; a bee buzzes around.
      out += bst(t, 'snail', { x: 1700, y: 900, scale: 0.9, seed: 2, at: T.snail - 0.6, talk: ctx.talking && t > T.snail && t < T.calm, flip: true });
      out += bub(1600, 640, 'Change everything!', between(t, T.snail, T.calm), { size: 28, tail: 'right' });
      out += bub(600, 480, 'Based on what?', between(t, T.calm, T.row - 0.2), { size: 28 });
      const bx = 1100 + Math.sin(t * 1.3) * 300, by = 520 + Math.sin(t * 2.6) * 50;
      if (t < T.cloud || t > T.flat + 3) out += beast(t, 'bee', { x: bx, y: by, scale: 1.1, seed: 1, flip: Math.cos(t * 1.3) < 0 });
      return out;
    },

    // A sample jar: every trade is one marble. The raccoon goes for the "rewrite" button after one loss; the scientist covers it.
    's21-sample-jar': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="590" fill="#EEF3F8"/>` + ground(960, '#E5E1EE', '#D2CCE0');
      for (let i = 0; i < 9; i++) out += `<rect x="${i * 220}" y="372" width="2" height="588" fill="#E1E6EE"/>`;
      // Chalkboard with the sample count, a mouse on top.
      const JX = 960, JB = 940, JW = 300, JT = 520;
      const slot = j => { const row = Math.floor(j / 6), col = j % 6; return [JX - JW / 2 + 32 + col * 47 + (row % 2 ? 14 : 0), JB - 26 - row * 40]; };
      const colOf = j => [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0][j % 14] ? C.pink : C.teal;
      const N0 = 14, NEW = 14, POUR = 28;
      const dropT = j => j < N0 ? -1 : j === NEW ? T.drop : T.pour + (j - NEW - 1) * 0.14;
      let count = 0;
      for (let j = 0; j < N0 + 1 + POUR; j++) if (t > dropT(j) + 0.5) count++;
      const bk = pop(t, T.set + 0.4, 0.6);
      out += scaleAt(340, 720, bk, `<rect x="160" y="520" width="360" height="230" rx="14" fill="#3D5A55" stroke="#9B6A45" stroke-width="10"/>` + txt(340, 590, 'SAMPLE', 30, '#E8F8F6', { ls: 4 }) + txt(340, 690, 'n = ' + count, 72, '#fff', { f: 'Playfair Display' }));
      out += crit(t, 'mouse', { x: 300, y: 516, scale: 0.9, seed: 4, at: T.set + 1 });
      if (t > T.drop + 0.5) out += `<g transform="translate(400,${490 + Math.sin(t * 8) * 4})"><rect x="-4" y="-30" width="8" height="30" fill="${C.gold}"/><rect x="-14" y="-40" width="28" height="12" rx="4" fill="${C.gold}"/></g>`;
      // Chute.
      const ck = pop(t, T.set + 0.3, 0.6);
      out += scaleAt(JX, 400, ck, `<path d="M${JX - 40},372 L${JX - 40},440 L${JX + 40},440 L${JX + 40},372" fill="#D9CFE9"/><rect x="${JX - 60}" y="436" width="120" height="16" rx="8" fill="${C.purple}"/>`);
      // Jar back, marbles, jar front.
      const jk = pop(t, T.set, 0.7);
      let marbles = '';
      for (let j = 0; j < N0 + 1 + POUR; j++) {
        const [mx, my] = slot(j), dt = dropT(j);
        if (dt > 0 && t < dt) continue;
        const k = dt < 0 ? 1 : seg(t, dt, dt + 0.5);
        const y = dt < 0 ? my : lerp(450, my, k * k) - (k >= 1 ? Math.max(0, Math.sin((t - dt - 0.5) * 12) * 10 * Math.exp(-(t - dt - 0.5) * 6)) : 0);
        const col = j === NEW ? C.pink : colOf(j + 3);
        marbles += `<circle cx="${f1(mx)}" cy="${f1(y)}" r="${j === NEW ? 24 : 21}" fill="${col}"/><circle cx="${f1(mx - 7)}" cy="${f1(y - 7)}" r="6" fill="#fff" opacity=".6"/>`;
        if (j === NEW && k >= 1) marbles += `<circle cx="${f1(mx)}" cy="${f1(y)}" r="30" fill="none" stroke="${C.gold}" stroke-width="4" opacity="${f1(0.5 + Math.sin(t * 6) * 0.4)}"/>`;
      }
      out += scaleAt(JX, JB, jk, `<rect x="${JX - JW / 2}" y="${JT}" width="${JW}" height="${JB - JT + 10}" rx="40" fill="#F4FBFF" opacity=".55"/>` + marbles
        + `<rect x="${JX - JW / 2}" y="${JT}" width="${JW}" height="${JB - JT + 10}" rx="40" fill="none" stroke="#B2C8D6" stroke-width="7"/><rect x="${JX - JW / 2 + 20}" y="${JT - 30}" width="${JW - 40}" height="34" rx="10" fill="#B2C8D6"/><path d="M${JX - JW / 2 + 26},${JT + 60} L${JX - JW / 2 + 26},${JT + 200}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`);
      out += pill(JX - 260, slot(NEW)[1] - 40, 'this loss', C.pink, between(t, T.drop + 0.6, T.pour + 1.4), 24);
      out += pill(JX, 1010, 'one marble in the sample', C.purple, pop(t, T.pour + 2.4, 0.6), 24);
      // The rewrite button on a pedestal; then a glass cover.
      const BX = 1560;
      const pk = pop(t, T.set + 0.8, 0.6);
      out += scaleAt(BX, 960, pk, `<rect x="${BX - 60}" y="790" width="120" height="170" rx="10" fill="${C.purpleL}"/><rect x="${BX - 80}" y="776" width="160" height="22" rx="8" fill="${C.purple}"/>
        <ellipse cx="${BX}" cy="${t > T.raccoon + 1 && t < T.cover ? 770 : 762}" rx="46" ry="20" fill="${C.pink}"/><rect x="${BX - 46}" y="${t > T.raccoon + 1 && t < T.cover ? 770 : 762}" width="92" height="12" fill="${DK.pink}"/>`);
      out += pill(BX, 880, 'REWRITE METHOD', DK.pink, pop(t, T.set + 1.2, 0.5) * (t < T.cover + 0.6 ? 1 : 1), 22);
      const cov = ease(seg(t, T.cover, T.cover + 0.7));
      if (t > T.cover) out += `<path d="M${BX - 90},${f1(782 - (1 - cov) * 300)} L${BX - 90},${f1(700 - (1 - cov) * 300)} Q${BX},${f1(630 - (1 - cov) * 300)} ${BX + 90},${f1(700 - (1 - cov) * 300)} L${BX + 90},${f1(782 - (1 - cov) * 300)} Z" fill="#E8F8F6" opacity=".55" stroke="#9FC2D0" stroke-width="5"/>`;
      out += pill(BX, 590, 'not on one valid loss', DK.teal, pop(t, T.cover + 0.6, 0.5), 22);
      // Raccoon dashes in from the right; sulks after the cover.
      const rx = t < T.raccoon ? 2060 : lerp(2060, BX + 180, ease(seg(t, T.raccoon, T.raccoon + 0.9))) + ease(seg(t, T.cover + 1.2, T.cover + 2.2)) * 120;
      out += beast(t, 'raccoon', { x: rx, y: 960, scale: 1.0, seed: 3, flip: true, hop: t > T.raccoon && t < T.raccoon + 0.9 ? 14 : 0, hopH: 14, mood: t > T.cover ? 'sad' : undefined, talk: ctx.talking && t > T.raccoon && t < T.cover });
      out += bub(1700, 560, 'One loss! Rewrite it!', between(t, T.raccoon + 0.8, T.cover), { size: 26, tail: 'right' });
      // Scientist.
      const sc = { x: 1300, y: 960, scale: 0.92, look: A.LOOKS.a, seed: 5, at: T.set + 0.5, hat: 'goggles', talk: ctx.talking && ((t > T.cover && t < T.cover + 2.4) || t > T.stamp) };
      sc.frontArm = t > T.cover - 0.4 && t < T.cover + 1 ? aim(sc, BX - 80, 700) : t > T.stamp ? { a1: -100 + Math.sin(t * 6) * 10, a2: -110 } : t > T.drop && t < T.drop + 1.4 ? aim(sc, JX + 170, 640) : { a1: 85, a2: 80 };
      out += who(t, sc);
      out += bstamp(JX, 640, 'VALID', DK.teal, pop(t, T.stamp, 0.6), -10, 80, 30);
      if (t > T.stamp) out += A.sparkle(JX, 640, T.stamp + 0.2, t, C.teal);
      return out;
    },
  });

  /* ================= Lesson 4: An Invalid Winning Trade ================= */
  const trophy = (x, y, sc = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><rect x="-34" y="-14" width="68" height="14" rx="4" fill="#C98A1F"/><rect x="-10" y="-44" width="20" height="32" fill="${C.gold}"/>
      <path d="M-44,-120 L44,-120 Q44,-50 0,-44 Q-44,-50 -44,-120 Z" fill="${C.gold}"/><path d="M-44,-110 Q-74,-110 -66,-84 Q-60,-66 -40,-70" stroke="${C.gold}" stroke-width="8" fill="none"/><path d="M44,-110 Q74,-110 66,-84 Q60,-66 40,-70" stroke="${C.gold}" stroke-width="8" fill="none"/>
      <path d="M-28,-108 Q-26,-76 -10,-62" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  const warnSign = (x, y, sc = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})"><rect x="-6" y="-60" width="12" height="60" fill="${C.muted}"/><path d="M0,-170 L70,-50 L-70,-50 Z" fill="${C.pink}" stroke="${DK.pink}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="-7" y="-140" width="14" height="50" rx="6" fill="#fff"/><circle cx="0" cy="-74" r="8" fill="#fff"/></g>`;

  Object.assign(LIVE, {
    // A frozen pond: two of the three ice lights are on, continuation is not. She skates anyway, makes it, gets paid. The penguin learns the wrong lesson.
    's21-thin-ice': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="600" fill="#E8F1F8"/>`;
      // Snowy hills, falling snow.
      out += `<path d="M0,760 Q260,640 560,720 Q860,800 1160,700 Q1460,610 1920,720 L1920,980 L0,980 Z" fill="#F8FBFF"/>`;
      for (let i = 0; i < 40; i++) { const p = ((t * 0.12 + i * 0.173) % 1); out += `<circle cx="${f1((i * 211) % 1920 + Math.sin(t + i) * 20)}" cy="${f1(380 + p * 600)}" r="${3 + (i % 3)}" fill="#fff" opacity=".9"/>`; }
      out += [[90, 720], [1820, 700], [1500, 660]].map(([x, y]) => `<path d="M${x},${y} L${x - 50},${y + 110} L${x + 50},${y + 110} Z M${x},${y + 50} L${x - 64},${y + 170} L${x + 64},${y + 170} Z" fill="#9FCBB8"/><path d="M${x - 30},${y + 100} L${x + 30},${y + 100}" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`).join('');
      out += ground(950, '#F3F7FB', '#DCE6F0');
      // The pond.
      const PX = 1040, PY = 900;
      out += `<ellipse cx="${PX}" cy="${PY}" rx="520" ry="76" fill="#CFE6F2" stroke="#fff" stroke-width="10"/><ellipse cx="${PX - 120}" cy="${PY - 20}" rx="220" ry="16" fill="#fff" opacity=".5"/>`;
      // Skater path and cracks behind her.
      const go = ease(seg(t, T.go, T.arrive));
      const kx = t < T.go ? 380 : lerp(380, 1640, go) + Math.sin(go * Math.PI * 6) * 10 * (go < 1 ? 1 : 0);
      for (let i = 0; i < 12; i++) {
        const cx = 560 + i * 86, cy = PY + ((i * 37) % 30) - 12;
        if (kx < cx + 60 || t < T.go) continue;
        const k = ease(seg(kx, cx + 60, cx + 160));
        out += `<path d="M${cx},${cy} l${f1(-30 * k)},${f1(-14 * k)} M${cx},${cy} l${f1(26 * k)},${f1(-18 * k)} l${f1(16 * k)},${f1(10 * k)} M${cx},${cy} l${f1(8 * k)},${f1(26 * k)} M${cx},${cy} l${f1(-22 * k)},${f1(16 * k)}" stroke="#6E8FB0" stroke-width="4" stroke-linecap="round" fill="none"/>`;
      }
      // The ice-light board and the ranger.
      const bk = pop(t, T.set + 0.3, 0.6);
      const lamps = [['IND', T.lamps[0], true], ['CORR', T.lamps[1], true], ['CONT', T.lamps[1] + 0.8, false]];
      out += scaleAt(200, 950, bk, `<g transform="translate(-50,0)"><rect x="244" y="760" width="12" height="190" fill="${C.muted}"/><rect x="160" y="530" width="190" height="236" rx="18" fill="#3D3550"/>` + lamps.map(([lab, at, on], i) => {
        const y = 580 + i * 70, lit = on && t > at, blink = !on && t > at ? 0.35 + Math.abs(Math.sin(t * 4)) * 0.25 : 0;
        return `<circle cx="206" cy="${y}" r="22" fill="${lit ? C.teal : '#5C5470'}"/>${lit ? `<circle cx="206" cy="${y}" r="34" fill="${C.teal}" opacity=".25"/>` : ''}${blink ? `<circle cx="206" cy="${y}" r="22" fill="none" stroke="${C.pink}" stroke-width="4" opacity="${f1(blink * 2)}"/>` : ''}` + txt(240, y + 9, lab, 24, lit ? '#fff' : '#B9B2C4', { a: 'start' });
      }).join('') + '</g>');
      out += pill(205, 488, 'not closed: wait', C.pink, between(t, T.lamps[1] + 1, T.arrive), 22);
      const rg = { x: 66, y: 960, scale: 0.78, look: A.LOOKS.c, seed: 6, at: T.set + 0.5, hat: 'ranger', talk: ctx.talking && ((t > T.verdict && t < T.verdict + 2.4) || (t > T.whistle && t < T.whistle + 1)) };
      rg.frontArm = (t > T.go - 0.4 && t < T.go + 1.6) || (t > T.whistle - 0.2 && t < T.whistle + 1.2) ? { a1: -60 + Math.sin(t * 10) * 14, a2: -90 } : { a1: 70, a2: 40 };
      out += who(t, rg);
      // The prize on the far bank.
      const open = ease(seg(t, T.open, T.open + 0.6));
      const prk = pop(t, T.set + 1, 0.6);
      out += scaleAt(1760, 960, prk, `<rect x="1700" y="880" width="120" height="80" rx="8" fill="${C.purple}"/><rect x="1752" y="880" width="16" height="80" fill="${C.gold}"/>
        <g transform="rotate(${f1(-open * 60)} 1700 880)"><rect x="1690" y="860" width="140" height="26" rx="8" fill="${C.purpleL}"/><path d="M1760,860 q-30,-30 -40,-4 M1760,860 q30,-30 40,-4" stroke="${C.gold}" stroke-width="7" fill="none"/></g>`);
      if (t > T.tempt && t < T.go) out += A.sparkle(1760, 860, T.tempt, t, C.gold) + A.sparkle(1760, 860, T.tempt + 1.2, t, C.gold);
      if (open > 0) {
        for (let i = 0; i < 7; i++) { const p = seg(t, T.open + i * 0.08, T.open + 0.8 + i * 0.08); out += `<circle cx="${f1(1760 + (i - 3) * 22 * p)}" cy="${f1(870 - Math.sin(p * Math.PI) * 120 - p * 10)}" r="14" fill="${C.gold}" stroke="#C98A1F" stroke-width="3" opacity="${f1(p > 0 ? 1 : 0)}"/>`; }
        out += pill(1760, 760, '+$464', C.cashD, pop(t, T.open + 0.4, 0.5), 30);
      }
      // The skater.
      const sk = { x: kx, y: t < T.go || t > T.arrive ? 950 : PY + 30, scale: 0.8, look: A.LOOKS.seller, seed: 2, at: T.set + 0.4, hat: 'bow', walking: t > T.go && t < T.arrive, talk: ctx.talking && t > T.tempt && t < T.go, mood: undefined };
      sk.frontArm = t > T.go && t < T.arrive ? { a1: -30 + Math.sin(t * 9) * 20, a2: -10 } : t > T.open ? { a1: -120 + Math.sin(t * 7) * 10, a2: -110 } : { a1: 80, a2: 60 };
      sk.backArm = t > T.go && t < T.arrive ? { a1: 160 + Math.sin(t * 9) * 20, a2: 190 } : undefined;
      out += who(t, sk);
      out += bub(kx + 60, 600, 'It wants to go!', between(t, T.tempt, T.go), { size: 26 });
      out += cross(1600, 640, between(t, T.verdict, s.end), C.pink, 30);
      out += bub(1380, 620, 'Made it. Still invalid.', between(t, T.verdict, s.end), { size: 26 });
      // Penguin copies her.
      const pg = t < T.penguin ? 500 : lerp(500, 680, ease(seg(t, T.penguin, T.penguin + 1.6))) - ease(seg(t, T.whistle + 0.2, T.whistle + 1)) * 170;
      const onIce = pg > 580;
      out += bst(t, 'penguin', { x: pg, y: onIce ? PY + 10 : 955, scale: 0.9, seed: 4, at: T.set + 1.4, waddle: t > T.penguin && t < T.whistle + 1, flap: t > T.crack && t < T.whistle + 1, scarf: true, talk: ctx.talking && t > T.penguin && t < T.crack });
      if (t > T.crack && t < T.whistle + 1.4) { const k = ease(seg(t, T.crack, T.crack + 0.4)); out += `<path d="M680,${PY + 10} l-60,${f1(-14 * k)} m60,${f1(14 * k)} l70,${f1(-20 * k)} m-70,${f1(20 * k)} l20,${f1(30 * k)} m-20,${f1(-30 * k)} l-40,${f1(26 * k)}" stroke="#6E8FB0" stroke-width="5" stroke-linecap="round" fill="none"/>`; }
      out += bub(560, 640, 'Early works! Me next!', between(t, T.penguin, T.whistle), { size: 26 });
      out += pill(560, 600, 'a paid violation teaches habits', DK.pink, pop(t, T.habit, 0.6), 24);
      return out;
    },

    // A museum curator files the case: the win in one display case, the violation in another. The peacock's confetti is swept away.
    's21-warning-museum': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="610" fill="#F6EFE6"/>` + ground(980, '#E6D6C4', '#D2BFA8');
      for (let i = 0; i < 14; i++) out += `<rect x="${i * 140}" y="984" width="70" height="96" fill="#DCC8B2" opacity=".6"/>`;
      // Columns and two framed paintings.
      [70, 1850].forEach(x => { out += `<rect x="${x - 30}" y="400" width="60" height="580" fill="#EDE2D3"/><rect x="${x - 44}" y="392" width="88" height="20" fill="#E0D2BF"/><rect x="${x - 44}" y="960" width="88" height="20" fill="#E0D2BF"/>`; });
      [[250, 'up'], [1660, 'chop']].forEach(([x, kind]) => {
        out += `<rect x="${x - 100}" y="440" width="200" height="150" rx="6" fill="#fff" stroke="${C.gold}" stroke-width="10"/>`;
        const ys = kind === 'up' ? [560, 540, 550, 520, 500, 480] : [520, 540, 510, 545, 515, 535];
        ys.forEach((y, i) => out += `<rect x="${x - 72 + i * 26}" y="${y - 20}" width="14" height="34" rx="3" fill="${i % 2 ? C.pink : C.teal}"/>`);
      });
      // Two display cases.
      const cases = [{ x: 680, lab: 'OUTCOME · WIN', col: DK.teal, at: T.set + 0.4 }, { x: 1240, lab: 'PROCESS · VIOLATION', col: DK.pink, at: T.set + 0.6 }];
      cases.forEach((c, i) => {
        const k = pop(t, c.at, 0.7);
        out += scaleAt(c.x, 980, k, `<rect x="${c.x - 120}" y="800" width="240" height="180" fill="#E7DCCB"/><rect x="${c.x - 136}" y="784" width="272" height="22" rx="6" fill="#D9C8B0"/>`);
        // Item inside.
        const ik = ease(seg(t, i === 0 ? T.trophy : T.warn, (i === 0 ? T.trophy : T.warn) + 0.7));
        if (ik > 0) out += i === 0 ? trophy(c.x, lerp(560, 782, ik), 1.1) : warnSign(c.x, lerp(560, 782, ik), 1.0);
        out += scaleAt(c.x, 980, k, `<rect x="${c.x - 120}" y="560" width="240" height="226" rx="8" fill="#E8F8F6" opacity=".35" stroke="#B2D6E0" stroke-width="5"/><path d="M${c.x - 96},590 L${c.x - 96},740" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`);
        out += pill(c.x, 890, c.lab, c.col, pop(t, (i === 0 ? T.trophy : T.warn) + 0.6, 0.5), 22);
      });
      out += pill(1240, 940, 'early entry · no continuation', C.muted, pop(t, T.warn + 1, 0.5), 18);
      // The curator between the cases.
      const cu = { x: 960, y: 980, scale: 0.86, look: A.LOOKS.e, seed: 3, at: T.set + 0.2, hat: 'glasses', talk: ctx.talking && ((t > T.trophy && t < T.warn + 2) || (t > T.stop && t < T.stop + 2)) };
      cu.frontArm = t > T.trophy - 0.4 && t < T.trophy + 1 ? aim(cu, 760, 700) : t > T.stop - 0.2 && t < T.stop + 1.6 ? { a1: -20, a2: -80 } : t > T.plaque ? { a1: -100, a2: -120 } : { a1: 80, a2: 70 };
      cu.backArm = t > T.warn - 0.4 && t < T.warn + 1 ? { a1: -10, a2: -20 } : undefined;
      cu.flip = t > T.warn - 0.4 && t < T.warn + 1 || (t > T.stop - 0.4 && t < T.sweep);
      out += who(t, cu);
      // Peacock with a confetti cannon.
      const px = t < T.peacock ? 2100 : lerp(2100, 1700, ease(seg(t, T.peacock, T.peacock + 1.2)));
      const fan = t < T.peacock + 0.8 ? 0.2 : t < T.stop ? ease(seg(t, T.peacock + 0.8, T.peacock + 1.4)) : 1 - ease(seg(t, T.stop, T.stop + 0.8)) * 0.8;
      out += beast(t, 'peacock', { x: px, y: 980, scale: 0.95, seed: 5, flip: true, fan, waddle: true, talk: ctx.talking && t > T.peacock && t < T.stop, mood: t > T.stop ? 'sad' : undefined });
      if (t > T.peacock) out += `<g transform="translate(${f1(px - 150)},960)"><circle cx="-30" cy="10" r="20" fill="${C.muted}"/><circle cx="30" cy="10" r="20" fill="${C.muted}"/><g transform="rotate(-40)"><rect x="-20" y="-70" width="40" height="80" rx="8" fill="${C.pink}"/><rect x="-26" y="-80" width="52" height="16" rx="6" fill="${DK.pink}"/></g></g>`;
      out += bub(1520, 660, 'Party time!', between(t, T.peacock + 0.8, T.fire + 0.6), { size: 28, tail: 'right' });
      // Confetti: sprays, falls, then is swept.
      const cols = [C.pink, C.teal, C.gold, C.purple, C.peach];
      if (t > T.fire) for (let i = 0; i < 46; i++) {
        const p = seg(t, T.fire + (i % 8) * 0.04, T.fire + 1.8 + (i % 5) * 0.2);
        const vx = -(160 + (i * 53) % 900), vy = -(420 + (i * 37) % 260);
        let x = px - 190 + vx * p, y = 880 + vy * p + 1400 * p * p * 0.5;
        y = Math.min(y, 974 - (i % 4) * 3);
        const swept = t > T.sweep && x < lerp(-100, 1480, seg(t, T.sweep, T.sweep + 3.2)) - 40;
        if (swept) continue;
        out += `<rect x="${f1(x)}" y="${f1(y)}" width="12" height="7" fill="${cols[i % 5]}" transform="rotate(${f1((t * 300 + i * 40) % 360 * (y < 970 ? 1 : 0))} ${f1(x + 6)} ${f1(y + 3)})"/>`;
      }
      out += bstamp(1240, 520, 'NO PARTY', DK.pink, between(t, T.stop, T.sweep + 1), -12, 70, 22);
      // Mouse janitor with a broom.
      if (t > T.sweep) {
        const mx = lerp(-100, 1480, seg(t, T.sweep, T.sweep + 3.2));
        out += critter(t, 'mouse', { x: mx, y: 980, scale: 1.0, seed: 2, hop: 10, hopH: 8 }) + `<g transform="translate(${f1(mx - 30)},940) rotate(${f1(-30 + Math.sin(t * 14) * 14)})"><rect x="-4" y="-70" width="8" height="80" fill="#9B6A45"/><path d="M-20,10 L20,10 L26,40 L-26,40 Z" fill="${C.gold}"/></g>`;
      }
      // The plaque above.
      const pk = pop(t, T.plaque, 0.7);
      out += scaleAt(960, 470, pk, `<line x1="760" y1="372" x2="760" y2="430" stroke="${C.muted}" stroke-width="4"/><line x1="1160" y1="372" x2="1160" y2="430" stroke="${C.muted}" stroke-width="4"/><rect x="620" y="424" width="680" height="84" rx="12" fill="#3D3550" stroke="${C.gold}" stroke-width="6"/>` + txt(960, 480, 'A winner can still be a warning', 36, '#fff', { f: 'Playfair Display' }));
      if (t > T.plaque) out += A.sparkle(1300, 430, T.plaque + 0.3, t, C.gold);
      return out;
    },
  });

  /* ================= Lesson 5: Clean vs Messy Setups ================= */
  // A scallop shell, (x, y) = bottom centre. kind: 'clean' | 'chip' | 'messy'.
  const shell = (x, y, sc, kind, rot = 0) => {
    const col = kind === 'messy' ? '#E3C9B8' : kind === 'chip' ? C.peachL : C.pinkL, rib = kind === 'messy' ? '#C9AE9A' : kind === 'chip' ? C.peach : C.pink;
    let g = `<path d="M-60,-20 Q-66,-90 0,-100 Q66,-90 60,-20 L14,0 L-14,0 Z" fill="${col}" stroke="${rib}" stroke-width="4" stroke-linejoin="round"/>`;
    for (let i = -2; i <= 2; i++) g += `<path d="M0,-4 L${i * 26},-92" stroke="${rib}" stroke-width="4" opacity=".8"/>`;
    g += `<path d="M-18,0 L-24,10 L24,10 L18,0 Z" fill="${rib}"/>`;
    if (kind === 'chip') g += `<path d="M40,-86 L60,-60 L46,-58 Z" fill="#F6E7D3"/>`;
    if (kind === 'messy') g += `<path d="M-40,-70 L-10,-40 L-20,-20 M10,-90 L20,-60" stroke="${C.muted}" stroke-width="4" fill="none"/><path d="M-70,-30 Q-40,-70 -10,-30 Q20,-70 50,-20 Q70,-50 80,-10" stroke="#7CB46B" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-30" cy="-50" r="6" fill="#D6B78E"/><circle cx="22" cy="-30" r="5" fill="#D6B78E"/><circle cx="36" cy="-70" r="4" fill="#D6B78E"/>`;
    return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) scale(${sc})">${g}</g>`;
  };
  const vase = (x, y, sc, messy) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${sc})">
      <path d="M-30,-200 L30,-200 L26,-170 Q80,-120 64,-50 Q50,0 0,0 Q-50,0 -64,-50 Q-80,-120 -26,-170 Z" fill="${messy ? '#C9B8A6' : C.purple}" stroke="${messy ? C.muted : DK.purple}" stroke-width="5"/>
      <path d="M-58,-90 Q0,-70 58,-90" stroke="${messy ? '#E7CDA1' : C.gold}" stroke-width="10" fill="none"/>
      ${messy ? `<path d="M30,-200 L44,-178 L22,-172 Z" fill="#F6EFE6"/><path d="M-20,-150 L-6,-120 L-22,-96 L-8,-70" stroke="${C.dark}" stroke-width="3" fill="none"/><ellipse cx="20" cy="-30" rx="40" ry="14" fill="#9B6A45" opacity=".55"/><ellipse cx="-40" cy="-120" rx="14" ry="20" fill="#9B6A45" opacity=".45"/>`
      : `<path d="M-40,-140 Q-50,-100 -40,-60" stroke="#fff" stroke-width="9" fill="none" opacity=".5" stroke-linecap="round"/>`}</g>`;

  Object.assign(LIVE, {
    // A beach after the tide: four real shells, but only the clean one goes in the basket. Messy and drifting ones get a pass.
    's21-shell-beach': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="100" fill="#E4F3F1" opacity=".8"/>` + cloud(400 + (t * 12) % 200, 420, 0.5);
      // Sea with moving waves.
      out += `<rect x="0" y="470" width="1920" height="230" fill="#9FD8D0"/>`;
      for (let r = 0; r < 4; r++) out += `<path d="M${-200 + ((t * (30 + r * 10)) % 200)},${500 + r * 50} ${Array.from({ length: 13 }, (_, j) => `q50,-14 100,0 q50,14 100,0`).join(' ')}" stroke="#fff" stroke-width="5" fill="none" opacity=".55"/>`;
      // Wet edge then sand.
      const surf = Math.sin(t * 1.3) * 16;
      out += `<path d="M0,${700 + surf} ${Array.from({ length: 10 }, (_, j) => `Q${96 + j * 192},${720 + surf + (j % 2 ? 14 : -10)} ${192 + j * 192},${700 + surf}`).join(' ')} L1920,1080 L0,1080 Z" fill="#F3E2C4"/>`;
      out += `<path d="M0,${704 + surf} ${Array.from({ length: 10 }, (_, j) => `Q${96 + j * 192},${724 + surf + (j % 2 ? 14 : -10)} ${192 + j * 192},${704 + surf}`).join(' ')}" stroke="#fff" stroke-width="8" fill="none" opacity=".8"/>`;
      for (let i = 0; i < 30; i++) out += `<circle cx="${(i * 173) % 1900 + 10}" cy="${760 + (i * 61) % 300}" r="3" fill="#E1C9A2"/>`;
      // Basket.
      const bk = pop(t, T.set + 0.4, 0.6);
      out += scaleAt(300, 960, bk, `<path d="M220,880 L380,880 L360,960 L240,960 Z" fill="#D9B98A" stroke="#9B6A45" stroke-width="5"/><path d="M228,906 L372,906 M234,932 L366,932" stroke="#9B6A45" stroke-width="3"/><path d="M240,880 Q300,800 360,880" stroke="#9B6A45" stroke-width="7" fill="none"/>`);
      // Rock overhang over shell B.
      const rk = pop(t, T.set + 0.6, 0.6);
      out += scaleAt(900, 960, rk, `<path d="M790,960 L800,780 Q860,730 960,740 Q1040,740 1050,800 L1010,812 Q920,800 860,820 L850,960 Z" fill="#B9B2C4" stroke="#8E8AA0" stroke-width="5"/>`);
      out += pill(930, 720, '4H ceiling', C.muted, pop(t, T.B + 0.6, 0.5), 20);
      // Shells.
      const SH = [{ x: 620, kind: 'clean', at: T.A, lab: 'A · clean', col: DK.teal }, { x: 930, kind: 'chip', at: T.B, lab: 'B · room limited', col: DK.peach }, { x: 1240, kind: 'messy', at: T.C, lab: 'C · messy', col: DK.pink }];
      SH.forEach((h, i) => {
        const k = pop(t, T.set + 0.8 + i * 0.25, 0.6);
        let x = h.x, y = 940, sc = 0.9 * k;
        if (i === 0 && t > T.A + 1.2) { const p = ease(seg(t, T.A + 1.2, T.A + 2)); x = lerp(h.x, 300, p); y = lerp(940, 900, p) - Math.sin(p * Math.PI) * 220; sc = lerp(0.9, 0.6, p); }
        if (k > 0) out += shell(x, y, sc, h.kind, Math.sin(t * 2 + i) * 3);
        out += pill(h.x, 1000, h.lab, h.col, pop(t, h.at + 0.2, 0.5), 22);
        if (i === 0) out += check(h.x, 790, between(t, h.at + 0.6, T.D), C.teal, 30);
        if (i === 1) out += pill(h.x + 30, 1046, 'take or wait', C.peach, pop(t, h.at + 1.6, 0.5), 18);
        if (i === 2) out += cross(h.x, 800, pop(t, h.at + 1.6, 0.5), C.pink, 30) + pill(h.x, 1046, 'pass', C.pink, pop(t, h.at + 1.8, 0.5), 18);
      });
      // Shell D drifts off in the surf.
      const dx = 1560 + ease(seg(t, T.D - 1, T.D + 3)) * 200, dy = 690 + Math.sin(t * 2.4) * 12;
      out += fade(pop(t, T.set + 1.6, 0.6), shell(dx, dy, 0.7, 'clean', Math.sin(t * 2) * 16));
      out += pill(1620, 1000, 'D · no retest', DK.purple, pop(t, T.D + 0.2, 0.5), 22);
      out += cross(1700, 610, pop(t, T.D + 1.6, 0.5), C.pink, 28) + pill(1620, 1046, 'chasing · pass', C.pink, pop(t, T.D + 1.8, 0.5), 18);
      // The collector walks shell to shell.
      const stops = [[T.set + 0.4, 420], [T.A - 0.6, 480], [T.B - 0.6, 1100], [T.C - 0.6, 1390], [T.D - 0.6, 1470]];
      let cx = 420, walking = false;
      stops.forEach(([a, x], i) => { if (i === 0) return; const p = seg(t, a - 1, a); if (p > 0) { cx = lerp(stops[i - 1][1], x, ease(p)); if (p < 1) walking = true; } });
      const co = { x: cx, y: 960, scale: 0.9, look: A.LOOKS.b, seed: 4, at: T.set + 0.2, hat: 'shades', walking, talk: ctx.talking && t > T.end, flip: false };
      const near = SH.findIndex(h => t > h.at - 0.2 && t < h.at + 1.6);
      co.flip = near > 0 && SH[near].x < cx;
      co.frontArm = near === 0 && t < T.A + 1.4 ? aim(co, 600, 900) : near >= 0 ? aim(co, SH[near].x - 40, 860) : t > T.D && t < T.D + 2 ? { a1: -20, a2: -30 } : t > T.end ? { a1: -100 + Math.sin(t * 6) * 10, a2: -110 } : { a1: 80, a2: 70 };
      out += who(t, co);
      out += bub(cx - 150, 590, 'Not chasing that one', between(t, T.D + 0.6, T.end - 0.2), { size: 24 });
      // Crab and gull.
      const crabX = 1820 + Math.sin(t * 0.9) * 50;
      out += crit(t, 'crab', { x: crabX, y: 1040, scale: 0.7, seed: 3, at: T.set + 1.2 });
      out += beast(t, 'gull', { x: 2050 - ((t - s.start) * 110) % 2400, y: 430 + Math.sin(t * 1.8) * 20, scale: 0.8, seed: 5, fly: true, flip: true });
      if (t > T.A + 2) out += A.sparkle(300, 880, T.A + 2, t, C.teal);
      return out;
    },

    // An antiques appraiser hangs three separate tags on every piece: validity, quality, decision.
    's21-appraiser': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="372" width="1920" height="610" fill="#FBF3EA"/>` + ground(980, '#EAD9C6', '#D6C2AA');
      // Striped tent canopy.
      const ck = ease(seg(t, T.set - 0.2, T.set + 0.6));
      let can = '';
      for (let i = 0; i < 16; i++) can += `<path d="M${i * 120},380 L${i * 120 + 120},380 L${i * 120 + 120},430 Q${i * 120 + 60},${456 + Math.sin(t * 2 + i) * 4} ${i * 120},430 Z" fill="${i % 2 ? '#fff' : C.pinkL}"/>`;
      out += fade(ck, can);
      // The appraiser with a loupe.
      const ap = { x: 1060, y: 925, scale: 0.92, look: A.LOOKS.d, seed: 5, at: T.set + 0.4, hat: 'loupe', flip: true, talk: ctx.talking && t > T.item1 + 1 };
      const tagT = [...T.tags1, ...T.tags2];
      const tagging = tagT.findIndex(a => t > a - 0.5 && t < a + 0.3);
      ap.frontArm = tagging >= 0 ? aim(ap, 1180 + 0, 600) : aim(ap, 900, 700 + Math.sin(t * 3) * 20);
      out += who(t, ap);
      // Table and turntable.
      out += fade(ck, `<rect x="420" y="800" width="800" height="26" rx="10" fill="#B8743C"/><rect x="440" y="826" width="760" height="154" fill="#C98A4E"/><rect x="470" y="850" width="700" height="100" rx="8" fill="#B8743C" opacity=".5"/>`);
      const spin = Math.sin(t * 1.5) * 0.06;
      out += fade(ck, `<ellipse cx="800" cy="796" rx="120" ry="18" fill="#9B6A45"/>`);
      // Vases: the clean one, then the messy one.
      const in1 = ease(seg(t, T.item1, T.item1 + 0.8)), out1 = ease(seg(t, T.swap, T.swap + 0.7));
      if (in1 > 0 && out1 < 1) out += vase(lerp(800, -200, out1) + (1 - in1) * -900, 790, 1.05 + spin, false);
      const in2 = ease(seg(t, T.swap + 0.3, T.swap + 1.1));
      if (in2 > 0) out += vase(800 + (1 - in2) * -1000, 790, 1.05 + spin, true);
      if (t > T.tags1[2] && t < T.swap) out += A.sparkle(840, 640, T.tags1[2], t, C.gold);
      // Tag rail and three tags.
      const rk = pop(t, T.set + 0.6, 0.6);
      out += scaleAt(1540, 470, rk, `<rect x="1260" y="466" width="580" height="12" rx="6" fill="${C.muted}"/><rect x="1270" y="466" width="10" height="514" fill="${C.muted}"/><rect x="1820" y="466" width="10" height="514" fill="${C.muted}"/>`);
      const cats = ['VALIDITY', 'QUALITY', 'DECISION'];
      const v1 = [['VALID', DK.teal], ['A', DK.teal], ['TAKE', DK.teal]], v2 = [['VALID', DK.teal], ['C', DK.pink], ['PASS', DK.pink]];
      const combo = ease(seg(t, T.combo, T.combo + 0.5));
      cats.forEach((c, i) => {
        const x = 1360 + i * 180, sw = Math.sin(t * 2 + i) * 4;
        const k = pop(t, T.set + 0.9 + i * 0.2, 0.6);
        if (k <= 0) return;
        const val = t > T.tags2[i] ? v2[i] : t > T.tags1[i] && t < T.swap ? v1[i] : null;
        const vk = val ? pop(t, t > T.tags2[i] ? T.tags2[i] : T.tags1[i], 0.5) : 0;
        const hi = combo > 0 ? 1 : 0;
        out += scaleAt(x, 478, k, `<g transform="rotate(${f1(sw)} ${x} 478)"><line x1="${x}" y1="478" x2="${x}" y2="560" stroke="${C.muted}" stroke-width="3"/>
          <path d="M${x - 70},570 L${x - 50},552 L${x + 70},552 L${x + 70},740 L${x - 70},740 Z" fill="#fff" stroke="${hi && val ? val[1] : '#E1D3C2'}" stroke-width="${hi ? 6 : 4}"/><circle cx="${x - 46}" cy="572" r="7" fill="#EADFD8"/>`
          + txt(x, 610, c, 20, C.muted, { ls: 1 }) + (vk > 0 ? scaleAt(x, 680, vk, txt(x, 696, val[0], val[0].length > 2 ? 40 : 64, val[1], { f: 'Playfair Display' })) : '') + '</g>');
      });
      out += pill(1540, 800, 'a real combination', DK.pink, pop(t, T.combo + 0.3, 0.5), 24);
      out += pill(1540, 870, 'labels, not signals', C.purple, pop(t, T.note, 0.5), 24);
      // Customer and a sniffing dog.
      const cu = { x: 230, y: 980, scale: 0.9, look: A.LOOKS.buyer, seed: 2, at: T.set + 0.3, talk: ctx.talking && t > T.swap && t < T.swap + 1 };
      cu.frontArm = t > T.swap - 0.6 && t < T.swap + 1.4 ? aim(cu, 400, 720) : { a1: 80, a2: 70 };
      out += who(t, cu);
      out += crit(t, 'dog', { x: 380, y: 980, scale: 0.75, seed: 6, at: T.set + 1, hop: t > T.swap + 1 && t < T.swap + 2.6 ? 8 : 0, hopH: 14, tongue: t > T.item1 + 1 });
      out += bub(470, 560, 'Still genuine!', between(t, T.swap + 0.6, T.tags2[0] + 0.8), { size: 26 });
      out += crit(t, 'cat', { x: 490, y: 800, scale: 0.55, seed: 4, at: T.set + 1.6, flip: true, sleep: t < T.combo });
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
