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
      const ed = { x: 500, y: 1000, scale: 0.86, look: A.LOOKS.e, seed: 4, at: T.room + 0.5, hat: 'headset', talk: ctx.talking && t > T.scold && t < T.scold + 3 };
      ed.frontArm = t > T.scold && t < T.scold + 2.4 ? { a1: -40 + Math.sin(t * 8) * 10, a2: -60 } : t > T.snip - 0.4 && t < T.snip + 0.8 ? aim(ed, 790, 610) : { a1: 40 + Math.sin(t * 3) * 10, a2: 10 };
      out += who(t, ed);
      out += fade(shk, `<rect x="300" y="820" width="580" height="22" rx="8" fill="#B8743C"/><rect x="330" y="842" width="16" height="158" fill="#9B6A45"/><rect x="834" y="842" width="16" height="158" fill="#9B6A45"/>`);
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

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
