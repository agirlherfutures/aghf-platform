/**
 * scenes-s22.js: illustrated scene types for Section 22 lesson intro videos
 * (Phase 8 · Section 22: Practice Like a Pro, Lessons 11 to 16).
 *
 * Real practice tools: backtests with locked rules, replay with the future hidden,
 * one rep = one evaluated opportunity, real sample sizes, screenshot journaling
 * and the AGHF Trade Journal. Every LIVE entry is a pure function of t,
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

  const LIVE = {};
  /* Shared bits for Section 22. */
  // A tiny candle (body centred on x), used for mini charts. v values in px.
  const mini = (x, yo, yc, yh, yl, w = 22, k = 1) => {
    if (k <= 0) return '';
    const up = yc <= yo, col = up ? C.teal : C.pink, top = Math.min(yo, yc), h = Math.max(4, Math.abs(yo - yc));
    return scaleAt(x, (yo + yc) / 2, k, `<line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(yh)}" y2="${f1(yl)}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><rect x="${f1(x - w / 2)}" y="${f1(top)}" width="${w}" height="${f1(h)}" rx="3" fill="${col}"/>`);
  };
  // A simple wiggle series of n candles: returns [[o,c,h,l]] in 0..1 from a seed.
  const series = (n, seed, start = 0.5) => {
    let v = start; const out = [];
    for (let i = 0; i < n; i++) {
      const d = Math.sin(i * 1.7 + seed) * 0.11 + Math.cos(i * 0.6 + seed * 2) * 0.05;
      const o = v, c = clamp(v + d, 0.12, 0.88);
      out.push([o, c, Math.max(o, c) + 0.05, Math.min(o, c) - 0.05]); v = c;
    }
    return out;
  };
  // A tiny "fog" cloud bank, drifting.
  const fogBank = (x, y, w, h, t, op = 1) => {
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F3EEF7" opacity="${0.92 * op}"/>`;
    for (let i = 0; i < 7; i++) {
      const cx = x + ((i * 97 + t * 26) % (w + 80)) - 40, cy = y + 30 + (i * 53) % Math.max(40, h - 60);
      g += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${70 + (i % 3) * 18}" ry="${26 + (i % 2) * 10}" fill="#fff" opacity="${0.7 * op}"/>`;
    }
    return g;
  };

  /* ================= Lesson 11: What Backtesting Actually Is ================= */
  Object.assign(LIVE, {
    // Two pilots: one rewinds landing videos and stars the smooth ones (review, the ending is known);
    // one sits in a simulator with the runway in fog and has to decide now (a backtest).
    's22-flight-sim': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      /* ---- Left: the living room with the landing videos ---- */
      const lk = ease(seg(t, T.room, T.room + 0.8));
      if (lk > 0) {
        let r = `<rect x="50" y="380" width="860" height="620" rx="28" fill="#FDE8ED"/>`;
        for (let i = 0; i < 9; i++) r += `<circle cx="${110 + i * 96}" cy="410" r="6" fill="${C.pinkL}"/>`;
        r += `<rect x="50" y="930" width="860" height="70" fill="#F3D9C9"/><rect x="50" y="930" width="860" height="5" fill="#E6C5B3"/>`;
        // Couch.
        r += `<rect x="330" y="836" width="430" height="110" rx="34" fill="${C.purpleL}"/><rect x="350" y="790" width="390" height="80" rx="30" fill="#B9B4EE"/>
          <rect x="306" y="820" width="60" height="120" rx="26" fill="#B9B4EE"/><rect x="726" y="820" width="60" height="120" rx="26" fill="#B9B4EE"/>
          <rect x="350" y="946" width="14" height="40" fill="${C.muted}"/><rect x="728" y="946" width="14" height="40" fill="${C.muted}"/>`;
        // Popcorn bowl on the couch.
        r += `<path d="M420,836 L500,836 L490,872 L430,872 Z" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${432 + i * 14}" cy="${828 - (i % 2) * 6 + Math.sin(t * 6 + i) * 2}" r="9" fill="#FFF6DC"/>`).join('')}`;
        out += fade(lk, r);
        // TV with a landing video. Playhead: plays, rewinds, plays again.
        const tvk = pop(t, T.room + 0.3, 0.7);
        const ph = t < T.rewind ? seg(t, T.room + 0.6, T.rewind) : t < T.rewind + 1.4 ? 1 - ease(seg(t, T.rewind, T.rewind + 1.4)) * 0.8 : 0.2 + seg(t, T.rewind + 1.4, T.star) * 0.8;
        const x0 = 330, y0 = 470, w = 380, h = 230;
        let tv = `<rect x="${x0 - 16}" y="${y0 - 16}" width="${w + 32}" height="${h + 56}" rx="20" fill="${C.dark}"/><rect x="${x0 + w / 2 - 50}" y="${y0 + h + 40}" width="100" height="16" rx="6" fill="${C.muted}"/>
          <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="8" fill="#DDF1EE"/>
          <rect x="${x0}" y="${y0 + h - 50}" width="${w}" height="50" fill="#B7D9A8"/><path d="M${x0 + 120},${y0 + h - 26} L${x0 + w - 10},${y0 + h - 26}" stroke="${C.muted}" stroke-width="16"/>
          ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${x0 + 140 + i * 40}" y="${y0 + h - 28}" width="20" height="4" fill="#fff"/>`).join('')}`;
        // The plane glides along the approach to the runway.
        const px = lerp(x0 + 40, x0 + 300, ph), py = lerp(y0 + 50, y0 + h - 40, Math.min(1, ph * 1.15));
        tv += `<g transform="translate(${f1(px)},${f1(py)}) rotate(${ph > 0.85 ? 0 : 12})"><path d="M-34,0 Q-30,-10 20,-8 Q36,-6 38,0 Q36,6 20,6 L-34,6 Z" fill="#fff" stroke="${C.purple}" stroke-width="3"/><path d="M-4,-2 L-18,-26 L-8,-26 L10,-2 Z" fill="${C.purple}"/><path d="M-30,-2 L-38,-18 L-30,-18 L-22,-2 Z" fill="${C.purple}"/></g>`;
        // Progress bar + rewind icon.
        tv += `<rect x="${x0 + 20}" y="${y0 + h - 12}" width="${w - 40}" height="6" rx="3" fill="#fff" opacity=".7"/><rect x="${x0 + 20}" y="${y0 + h - 12}" width="${f1((w - 40) * ph)}" height="6" rx="3" fill="${C.pink}"/><circle cx="${f1(x0 + 20 + (w - 40) * ph)}" cy="${y0 + h - 9}" r="8" fill="${C.pink}"/>`;
        if (t > T.rewind && t < T.rewind + 1.4) tv += txt(x0 + w - 60, y0 + 50, '◀◀', 40, C.pink);
        tv += `<rect x="${x0 + 10}" y="${y0 + 10}" width="98" height="30" rx="8" fill="${C.pink}"/>${txt(x0 + 59, y0 + 32, 'REPLAY', 18, '#fff')}`;
        out += scaleAt(x0 + w / 2, y0 + h + 56, tvk, tv);
        // Gold stars on the "smooth one".
        [0, 1, 2].forEach(i => { out += scaleAt(742, 500 + i * 70, pop(t, T.star + i * 0.25, 0.5), `<path d="M742,${474 + i * 70} l8,17 l18,2 l-13,12 l4,18 l-17,-9 l-17,9 l4,-18 l-13,-12 l18,-2 Z" fill="${C.gold}"/>`); });
        out += sparkAt(742, 560, T.star + 0.6, t, C.gold);
        // Viewer with a remote, and a cat on the couch.
        const v = { x: 180, y: 1000, scale: 0.86, look: A.LOOKS.b, seed: 3, at: T.room + 0.5, talk: ctx.talking && t > T.star && t < T.star + 2 };
        v.frontArm = aim(v, 280 + Math.sin(t * 3) * 6, 700 - (t > T.rewind - 0.4 && t < T.star + 0.5 ? 40 : 0));
        v.hold = `<rect x="-10" y="-26" width="20" height="44" rx="6" fill="${C.dark}"/><circle cx="0" cy="-14" r="4" fill="${C.pink}"/>`;
        out += who(t, v);
        out += crit(t, 'cat', { x: 660, y: 836, scale: 0.75, seed: 4, at: T.room + 0.9, talk: ctx.talking && t > T.cat && t < T.cat + 2.5, sleep: t > T.room + 1 && t < T.cat - 0.5 });
        out += bub(300, 600 + 0, 'Found a winner! ⭐', between(t, T.star + 0.2, T.cat - 0.3), { size: 28 });
        out += bub(470, 760, 'You knew the ending 😼', between(t, T.cat, T.verdict + 2.4), { size: 27, tail: 'right' });
        out += pill(480, 1040, 'REVIEW · the ending is visible', DK.pink, pop(t, T.cat + 0.6, 0.5), 22);
        out += cross(850, 430, pop(t, T.verdict, 0.5), C.pink, 30);
      }
      /* ---- Right: the flight simulator ---- */
      const sk = pop(t, T.sim, 0.8);
      if (sk > 0) {
        const tilt = Math.sin(t * 1.3) * 1.2;
        let g = `<rect x="1050" y="960" width="60" height="40" fill="${C.muted}"/><rect x="1790" y="960" width="60" height="40" fill="${C.muted}"/>
          <rect x="1010" y="380" width="880" height="590" rx="40" fill="${C.purple}"/>`;
        // Windshield: printed candles on the left, fog over the future on the right.
        const wx = 1060, wy = 420, ww = 780, wh = 300;
        g += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="24" fill="#E6F2FB"/>`;
        const bars = series(14, 2.2, 0.45), n = 14, step = 34;
        const shown = Math.floor(seg(t, T.sim + 1, T.decide[4]) * 9.999) + (t >= T.sim + 1 ? 1 : 0);
        for (let i = 0; i < Math.min(shown, n); i++) {
          const [o, c, hh, l] = bars[i], Y = v => wy + wh - 40 - v * (wh - 90);
          g += mini(wx + 50 + i * step, Y(o), Y(c), Y(hh), Y(l), 20, pop(t, T.sim + 1 + i * ((T.decide[4] - T.sim - 1) / 10), 0.4));
        }
        const fogX = wx + 50 + Math.min(shown, n) * step + 6;
        g += `<clipPath id="s22wind"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="24"/></clipPath><g clip-path="url(#s22wind)">${fogBank(fogX, wy, wx + ww - fogX, wh, t)}
          ${[0, 1, 2].map(i => txt(fogX + 90 + i * 110, wy + 150 + Math.sin(t * 3 + i) * 10, '?', 64, C.purpleL)).join('')}</g>`;
                g += pill(Math.min(fogX + 170, wx + ww - 140), wy + 40, 'future hidden', C.purple, pop(t, T.sim + 1.6, 0.5), 22);
        // Dashboard with three decision lights.
        g += `<rect x="1040" y="740" width="820" height="200" rx="26" fill="#3D3550"/>`;
        const dec = ['WAIT', 'WAIT', 'PASS', 'WAIT', 'TAKE'];
        let cur = -1; T.decide.forEach((d, i) => { if (t > d) cur = i; });
        [['TAKE', C.teal], ['WAIT', C.gold], ['PASS', C.pink]].forEach(([lab, col], i) => {
          const on = cur >= 0 && dec[cur] === lab && t - T.decide[cur] < 1.6;
          const bx = 1110 + i * 110;
          g += `<circle cx="${bx}" cy="800" r="${on ? 30 + Math.sin(t * 14) * 3 : 26}" fill="${col}" opacity="${on ? 1 : 0.35}"/>${txt(bx, 862, lab, 22, '#fff', { op: on ? 1 : 0.6 })}`;
        });
        // Gauges spinning.
        [1640, 1760].forEach((gx, i) => { const a = Math.sin(t * (1.4 + i) + i) * 70 - 90; g += `<circle cx="${gx}" cy="810" r="44" fill="#fff"/><line x1="${gx}" y1="810" x2="${f1(gx + Math.cos(rad(a)) * 34)}" y2="${f1(810 + Math.sin(rad(a)) * 34)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/><circle cx="${gx}" cy="810" r="7" fill="${C.dark}"/>`; });
        out += scaleAt(1450, 1000, sk, rotAt(1450, 1000, tilt, g));
        // Pilot seen from behind, with headset; head turns a little.
        const pk = pop(t, T.sim + 0.5, 0.6), turn = Math.sin(t * 1.6) * 8;
        out += scaleAt(1440, 1000, pk, `<path d="M1330,1000 Q1336,900 1440,890 Q1544,900 1550,1000 Z" fill="${C.teal}"/>
          <circle cx="${1440 + turn}" cy="850" r="60" fill="#2C1810"/><path d="M${1384 + turn},840 Q${1440 + turn},770 ${1496 + turn},840" stroke="${C.dark}" stroke-width="10" fill="none"/>
          <rect x="${1372 + turn}" y="828" width="24" height="44" rx="10" fill="${C.pink}"/><rect x="${1484 + turn}" y="828" width="24" height="44" rx="10" fill="${C.pink}"/>
          <path d="M${1400 + turn},800 Q${1440 + turn},780 ${1480 + turn},800 L${1478 + turn},818 Q${1440 + turn},804 ${1402 + turn},818 Z" fill="${C.gold}"/>`);
        // Owl instructor on the dashboard.
        out += crit(t, 'owl', { x: 1590, y: 1000, scale: 0.85, seed: 5, at: T.sim + 0.9, talk: ctx.talking && t > T.decide[4] && t < T.decide[4] + 2 });
        out += bub(1640, 650, 'Decide with what you see', between(t, T.decide[1] + 0.2, T.decide[4] - 0.3), { size: 26, tail: 'right' });
        out += pill(1450, 1046, 'BACKTEST · decide without the future', DK.teal, pop(t, T.decide[4] + 0.4, 0.5), 22);
        out += check(1860, 400, pop(t, T.decide[4] + 0.8, 0.5), C.teal, 30) + sparkAt(1150, 800, T.decide[4], t, C.teal);
      }
      return out;
    },

    // A lab: the study rules are written into the notebook, then sealed in a glass case with a padlock.
    // Test tubes (reps) fill against those rules. A mouse tries to swap the stop rule: that makes Study v2.
    's22-lab-lock': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      // Lab wall, shelves with flasks, a weather balloon drifting up the window.
      out += `<rect x="0" y="360" width="1920" height="640" fill="#EEF7F6"/>` + ground(980, '#E7EEF3', '#D3DEE6');
      out += `<rect x="40" y="400" width="260" height="180" rx="18" fill="#DDEFFA" stroke="#C8DCE8" stroke-width="8"/><line x1="170" y1="400" x2="170" y2="580" stroke="#C8DCE8" stroke-width="6"/>`;
      const by = 560 - ((t - s.start) * 22) % 260;
      out += `<clipPath id="s22win"><rect x="40" y="400" width="260" height="180" rx="18"/></clipPath><g clip-path="url(#s22win)"><line x1="100" y1="${f1(by + 34)}" x2="${f1(96 + Math.sin(t * 2) * 6)}" y2="${f1(by + 100)}" stroke="${C.muted}" stroke-width="2"/><circle cx="100" cy="${f1(by)}" r="32" fill="${C.pinkL}"/><rect x="86" y="${f1(by + 98)}" width="20" height="14" rx="3" fill="${C.purple}"/></g>`;
      // Bench.
      out += `<rect x="60" y="800" width="1800" height="40" rx="10" fill="#C8B6A6"/><rect x="100" y="840" width="24" height="140" fill="#A89585"/><rect x="1800" y="840" width="24" height="140" fill="#A89585"/>`;
      // Lab notebook with the four study rules, written one by one.
      const nk = pop(t, T.bench + 0.4, 0.7);
      const nb = { x: 560, y: 470 };
      const rules = ['Instrument', 'Session', 'Risk model', 'Stop rule'];
      let book = `<rect x="${nb.x - 220}" y="${nb.y - 70}" width="440" height="370" rx="18" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/>
        <rect x="${nb.x - 220}" y="${nb.y - 70}" width="440" height="64" rx="18" fill="${C.purple}"/>${txt(nb.x, nb.y - 26, 'STUDY RULES', 28, '#fff')}`;
      rules.forEach((r, i) => {
        const k = seg(t, T.write[i], T.write[i] + 0.7), y = nb.y + 40 + i * 64;
        book += `<line x1="${nb.x - 190}" y1="${y + 16}" x2="${nb.x + 190}" y2="${y + 16}" stroke="#F1E7E1" stroke-width="3"/>`;
        if (k > 0) book += `<clipPath id="s22wr${i}"><rect x="${nb.x - 200}" y="${y - 40}" width="${f1(400 * k)}" height="60"/></clipPath><g clip-path="url(#s22wr${i})">${txt(nb.x - 190, y, r, 30, C.dark, { a: 'start', w: 800 })}${check(nb.x + 170, y - 10, 1, C.teal, 16)}</g>`;
      });
      // Mouse erases the stop rule? Show a scribble while it tries.
      const tryK = between(t, T.mouse + 1.2, T.bonk);
      if (tryK > 0) book += `<path d="M${nb.x - 190},${nb.y + 222} q20,-14 40,0 t40,0 t40,0 t40,0" stroke="${C.pink}" stroke-width="5" fill="none" opacity="${tryK}"/>`;
      out += scaleAt(nb.x, nb.y + 300, nk, book);
      // Glass case + padlock lowers over the notebook.
      const lockK = ease(seg(t, T.lock, T.lock + 0.8));
      if (lockK > 0) {
        const dy = (1 - lockK) * -260;
        const shake = t > T.bonk && t < T.bonk + 0.6 ? Math.sin(t * 60) * 6 : 0;
        out += `<g transform="translate(${f1(shake)},${f1(dy)})"><rect x="${nb.x - 244}" y="${nb.y - 96}" width="488" height="414" rx="30" fill="#CFEFFF" opacity=".35" stroke="#9FD3EA" stroke-width="6"/>
          <path d="M${nb.x - 200},${nb.y - 70} L${nb.x - 150},${nb.y - 20}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
          <g transform="translate(${nb.x + 200},${nb.y - 96})"><path d="M-22,0 L-22,-24 Q-22,-46 0,-46 Q22,-46 22,-24 L22,0" stroke="${C.muted}" stroke-width="9" fill="none"/><rect x="-34" y="-6" width="68" height="56" rx="10" fill="${C.gold}"/><circle cx="0" cy="18" r="8" fill="${C.dark}"/><rect x="-3" y="20" width="6" height="16" fill="${C.dark}"/></g></g>`;
        out += pill(nb.x, 812, 'STUDY v1 · LOCKED', C.purple, pop(t, T.lock + 0.6, 0.5), 24);
        out += sparkAt(nb.x + 200, nb.y - 80, T.lock + 0.8, t, C.gold);
      }
      // Test tube rack: one tube per rep.
      const rk = pop(t, T.lock + 0.4, 0.6);
      const RX = 990, cols = 10, tubeCol = [C.teal, C.teal, C.pink, C.teal, C.pink, C.pink, C.pink, C.teal, C.teal, C.pink];
      let rack = `<rect x="${RX - 30}" y="760" width="${cols * 58 + 40}" height="40" rx="10" fill="#9B6A45"/><rect x="${RX - 30}" y="660" width="${cols * 58 + 40}" height="16" rx="6" fill="#B98A62"/>`;
      let filled = 0;
      for (let i = 0; i < cols; i++) {
        const at = T.reps + i * 0.62, k = ease(seg(t, at, at + 0.5)), x = RX + i * 58;
        if (t > at) filled = i + 1;
        rack += `<rect x="${x}" y="580" width="34" height="190" rx="17" fill="#fff" stroke="#9FD3EA" stroke-width="4"/>`;
        if (k > 0) rack += `<rect x="${x + 4}" y="${f1(766 - 120 * k)}" width="26" height="${f1(120 * k)}" rx="13" fill="${tubeCol[i]}" opacity=".85"/>${k >= 1 ? `<circle cx="${x + 17}" cy="${f1(640 - ((t * 40 + i * 13) % 40))}" r="4" fill="#fff" opacity=".8"/>` : ''}`;
      }
      out += scaleAt(RX + 270, 800, rk, rack);
      // Rep counter dial.
      const shownN = t > T.reps ? Math.min(20, Math.round(filled * 2)) : 0;
      out += scaleAt(1730, 470, pop(t, T.reps - 0.2, 0.5), `<rect x="1630" y="420" width="200" height="96" rx="20" fill="${C.dark}"/>${txt(1730, 458, 'REPS', 20, C.tealL)}${txt(1730, 502, String(shownN), 44, '#fff')}`);
      // Scientist.
      const sc = { x: 875, y: 1000, scale: 0.84, look: A.LOOKS.a, seed: 6, at: T.bench, hat: 'goggles', talk: ctx.talking && t > T.bench + 0.4 && t < T.lock };
      if (t < T.lock + 0.4) sc.frontArm = aim(sc, 770 + Math.sin(t * 9) * 16, 640 + Math.cos(t * 7) * 10);
      else if (t > T.v2 - 0.3) sc.frontArm = aim(sc, 1000, 700);
      out += who(t, sc);
      if (t < T.lock + 0.4 && t > T.bench + 0.8) out += `<g transform="rotate(${Math.sin(t * 9) * 10} ${770 + Math.sin(t * 9) * 16} ${640 + Math.cos(t * 7) * 10})"><rect x="${f1(760 + Math.sin(t * 9) * 16)}" y="${f1(600 + Math.cos(t * 7) * 10)}" width="10" height="50" rx="4" fill="${C.pink}"/></g>`;
      // Goldfish in a round flask on the bench, watching.
      const fk = pop(t, T.bench + 0.8, 0.6);
      out += scaleAt(1730, 800, fk, `<circle cx="1730" cy="730" r="66" fill="#DDF3FA" stroke="#9FD3EA" stroke-width="5"/><rect x="1708" y="650" width="44" height="22" fill="#DDF3FA" stroke="#9FD3EA" stroke-width="5"/>` + beast(t, 'fish', { x: 1730 + Math.sin(t * 1.4) * 22, y: 740, scale: 0.7, seed: 2, flip: Math.cos(t * 1.4) < 0 }));
      // Mouse sneaks up with a pencil to change the stop rule, bonks the glass.
      if (t > T.mouse) {
        const mx = t < T.mouse + 1.2 ? lerp(150, 290, ease(seg(t, T.mouse, T.mouse + 1.2))) : t < T.bonk ? 290 : 290 - ease(seg(t, T.bonk, T.bonk + 0.5)) * 60;
        out += critter(t, 'mouse', { x: mx, y: 796, scale: 1.35, seed: 3, hop: t < T.mouse + 1.2 ? 10 : 0, hopH: 10 });
        if (t > T.bonk && t < T.bonk + 1.4) out += [0, 1, 2].map(i => `<path d="M${310 + Math.cos(t * 6 + i * 2.1) * 30},${700 + Math.sin(t * 6 + i * 2.1) * 12} l6,-12 l6,12 l-12,-4 l12,0 Z" fill="${C.gold}"/>`).join('');
      }
      out += bub(170, 680, 'Tweak the stop? 🤫', between(t, T.mouse + 0.6, T.bonk), { size: 26 });
      out += bub(170, 680, 'Ouch! Locked.', between(t, T.bonk + 0.1, T.v2 - 0.2), { size: 26 });
      // A rule change opens a new study: Study v2 with an empty rack.
      const v2 = pop(t, T.v2, 0.7);
      if (v2 > 0) {
        out += scaleAt(1290, 470, v2, `<rect x="1120" y="400" width="340" height="140" rx="20" fill="#fff" stroke="${C.peach}" stroke-width="6"/>${txt(1290, 456, 'STUDY v2', 34, DK.peach)}${txt(1290, 508, 'new rules · count from 0', 24, C.muted, { w: 700 })}`);
        out += `<path d="M${nb.x + 250},${nb.y + 20} Q${(nb.x + 1110) / 2},${nb.y - 80} 1110,470" stroke="${C.peach}" stroke-width="5" fill="none" stroke-dasharray="${f1(ease(seg(t, T.v2, T.v2 + 0.8)) * 700)} 900"/>`;
        out += sparkAt(1290, 470, T.v2 + 0.4, t, C.peach);
      }
      return out;
    },
  });

  /* ================= Lesson 12: TradingView Replay ================= */
  const MIC = `<rect x="-7" y="-6" width="14" height="40" rx="6" fill="${C.dark}"/><circle cx="0" cy="-14" r="15" fill="#C9C1D9"/><path d="M-10,-20 L10,-8 M-10,-10 L8,-22" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  Object.assign(LIVE, {
    // Karaoke night: the lyrics screen only ever shows the line you're on. The chart above it is
    // cut at the replay start, the future hidden; a DJ robot presses FORWARD one candle at a time.
    's22-karaoke': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      // Stage: backdrop, spotlights, curtains, floor.
      out += `<rect x="0" y="360" width="1920" height="720" fill="#4A4166"/>`;
      for (let i = 0; i < 40; i++) out += `<circle cx="${(i * 211) % 1900 + 10}" cy="${380 + (i * 97) % 300}" r="${2 + (i % 3)}" fill="#fff" opacity="${0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))}"/>`;
      [[300, C.pink], [1620, C.teal]].forEach(([x, col], i) => {
        const sw = Math.sin(t * 0.9 + i * 2) * 120;
        out += `<path d="M${x},360 L${x + sw - 170},1000 L${x + sw + 170},1000 Z" fill="${col}" opacity=".16"/>`;
      });
      out += `<rect x="0" y="930" width="1920" height="150" fill="#C98A5B"/><rect x="0" y="930" width="1920" height="8" fill="#A8733C"/>`;
      const curt = (x0, dir) => Array.from({ length: 5 }, (_, i) => `<path d="M${x0 + dir * i * 34},360 Q${x0 + dir * (i * 34 + 18 + Math.sin(t * 1.5 + i) * 6)},640 ${x0 + dir * i * 34},930 L${x0 + dir * (i * 34 + 34)},930 Q${x0 + dir * (i * 34 + 16)},640 ${x0 + dir * (i * 34 + 34)},360 Z" fill="${i % 2 ? C.pink : '#E06B85'}"/>`).join('');
      out += curt(0, 1) + curt(1920, -1);
      // The karaoke screen: chart on top, one lyric line at the bottom.
      const sk = pop(t, T.stage + 0.3, 0.8);
      const SX = 560, SY = 384, SW = 800, SH = 400;
      let sc = `<rect x="${SX - 18}" y="${SY - 18}" width="${SW + 36}" height="${SH + 36}" rx="26" fill="${C.dark}"/><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="14" fill="#FFF9F4"/>
        <rect x="${SX + SW / 2 - 60}" y="${SY + SH + 18}" width="120" height="${930 - SY - SH - 18}" fill="${C.dark}"/>`;
      // Chart: history before the cut, then one candle per FORWARD press.
      const bars = series(16, 4.1, 0.4), step = 44, cx0 = SX + 40, Y = v => SY + 230 - v * 190;
      const cutI = 9, cutX = cx0 + cutI * step - step / 2;
      let shown = t < T.lines[1] ? 16 : cutI;
      T.press.forEach(p => { if (t > p) shown++; });
      for (let i = 0; i < Math.min(shown, 16); i++) {
        const [o, c, hh, l] = bars[i];
        const k = i >= cutI && t > T.lines[1] ? pop(t, T.press[i - cutI], 0.4) : 1;
        sc += mini(cx0 + i * step, Y(o), Y(c), Y(hh), Y(l), 22, k);
      }
      if (t > T.lines[1]) {
        const ck = ease(seg(t, T.lines[1], T.lines[1] + 0.8));
        const fx = cx0 + Math.min(shown, 16) * step - step / 2;
        sc += `<line x1="${cutX}" y1="${SY + 16}" x2="${cutX}" y2="${SY + 250}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 8" opacity="${ck}"/>`;
        sc += `<g opacity="${ck}"><rect x="${f1(fx)}" y="${SY + 10}" width="${f1(SX + SW - 10 - fx)}" height="246" rx="10" fill="${C.purpleL}"/>
          ${Array.from({ length: Math.max(1, Math.min(3, Math.floor((SX + SW - 10 - fx) / 80))) }, (_, i) => txt(fx + 44 + i * 80, SY + 150 + Math.sin(t * 3 + i) * 8, '?', 54, '#fff')).join('')}</g>`;
        sc += pill(SX + SW - 120, SY + 236, 'future hidden', C.purple, pop(t, T.lines[2] - 0.6, 0.5), 20);
      }
      // A date picker flashes at the first line.
      sc += scaleAt(SX + 640, SY + 60, between(t, T.lines[0] + 0.2, T.lines[1] - 0.2), `<rect x="${SX + 560}" y="${SY + 20}" width="160" height="90" rx="12" fill="#fff" stroke="${C.purple}" stroke-width="4"/><rect x="${SX + 560}" y="${SY + 20}" width="160" height="26" rx="10" fill="${C.purple}"/>${txt(SX + 640, SY + 90, 'pick a date', 20, C.dark)}`);
      // Lyric band: only the current line, the next one hidden.
      sc += `<rect x="${SX}" y="${SY + 272}" width="${SW}" height="${SH - 272}" rx="0" fill="${C.purple}"/><rect x="${SX}" y="${SY + SH - 14}" width="${SW}" height="14" rx="7" fill="${C.purple}"/>`;
      const LY = ['Click Replay, pick a date', 'Start before the session', '4H, 1H, then 15M', 'Drop to the 1M', 'Forward, one candle'];
      let cur = -1; T.lines.forEach((a, i) => { if (t > a) cur = i; });
      if (cur >= 0) {
        const lk = pop(t, T.lines[cur], 0.4), str = '♪ ' + LY[cur] + ' ♪';
        sc += scaleAt(SX + SW / 2, SY + 322, lk, txt(SX + SW / 2, SY + 334, str, 36, '#fff'));
        // Bouncing ball across the line.
        const nxt = T.lines[cur + 1] || T.lines[cur] + 3.4, u = seg(t, T.lines[cur], nxt - 0.3);
        const bw = [...str].length * 36 * 0.55;
        sc += `<circle cx="${f1(SX + SW / 2 - bw / 2 + u * bw)}" cy="${f1(SY + 290 - Math.abs(Math.sin(u * Math.PI * 6)) * 18)}" r="9" fill="${C.gold}"/>`;
        sc += txt(SX + SW / 2, SY + 378, 'next line: ? ? ?', 22, C.purpleL, { w: 700 });
      } else sc += txt(SX + SW / 2, SY + 340, '♪ ♪ ♪', 36, '#fff', { op: 0.6 });
      out += scaleAt(SX + SW / 2, 930, sk, sc);
      // Singer with a microphone.
      const sg = { x: 330, y: 960, scale: 0.92, look: A.LOOKS.e, seed: 7, at: T.stage + 0.6, talk: t > T.lines[0] && Math.sin(t * 3) > -0.3 };
      sg.frontArm = aim(sg, 372, 960 - 252 * 0.92);
      sg.backArm = { a1: -60 + Math.sin(t * 4) * 20, a2: -80 + Math.sin(t * 4) * 20 };
      sg.hold = MIC;
      out += who(t, sg);
      if (t > T.lines[0]) out += [0, 1].map(i => { const p = ((t * 0.7 + i * 0.5) % 1); return `<text x="${f1(420 + p * 80)}" y="${f1(640 - p * 120)}" font-size="40" fill="${C.gold}" opacity="${(1 - p).toFixed(2)}" font-family="DM Sans">♪</text>`; }).join('');
      // DJ robot with the FORWARD button.
      const rk = pop(t, T.stage + 0.9, 0.6);
      let pressing = false; T.press.forEach(p => { if (t > p - 0.25 && t < p + 0.15) pressing = true; });
      out += scaleAt(1600, 960, rk, critter(t, 'robot', { x: 1560, y: 930, scale: 1, seed: 2, screen: 'DJ' })
        + `<rect x="1500" y="800" width="300" height="130" rx="16" fill="${C.dark}"/><rect x="1520" y="820" width="70" height="24" rx="6" fill="${C.teal}" opacity="${0.5 + 0.5 * Math.abs(Math.sin(t * 6))}"/>
          <rect x="1620" y="${pressing ? 832 : 818}" width="160" height="${pressing ? 50 : 64}" rx="14" fill="${C.gold}"/>${txt(1700, pressing ? 866 : 858, '▶| FORWARD', 22, C.dark)}
          <path d="M1590,${pressing ? 830 : 780} L1660,${pressing ? 840 : 790}" stroke="${DK.teal}" stroke-width="10" stroke-linecap="round"/>`);
      T.press.forEach(p => { out += sparkAt(1700, 840, p, t, C.gold); });
      // Audience: a dog and a duck with glow sticks, swaying.
      const glow = (x, y, a, col) => `<g transform="rotate(${f1(a)} ${x} ${y})"><rect x="${x - 6}" y="${y - 70}" width="12" height="70" rx="6" fill="${col}"/><rect x="${x - 10}" y="${y - 74}" width="20" height="40" rx="10" fill="${col}" opacity=".3"/></g>`;
      out += crit(t, 'dog', { x: 760, y: 1066, scale: 0.85, seed: 1, at: T.stage + 1.2, tongue: true });
      out += crit(t, 'duck', { x: 1180, y: 1066, scale: 1.2, seed: 3, at: T.stage + 1.4, flip: true, hop: t > T.press[0] ? 6 : 0, hopH: 10 });
      if (t > T.stage + 1.6) out += glow(860, 990, Math.sin(t * 3) * 24, C.teal) + glow(1100, 990, Math.sin(t * 3 + 1) * 24, C.pink);
      return out;
    },

    // Candle by candle at a game table: a three-button clock (TAKE, WAIT, PASS) and a chart board
    // with the future under a cloth. A squirrel tries to peek; the snail referee says slow is fine.
    's22-chess-clock': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#F4F0FB"/>`;
      // Wallpaper diamonds drifting.
      for (let i = 0; i < 22; i++) { const x = (i * 97 + t * 10) % 1960 - 20, y = 390 + (i * 61) % 360; out += `<path d="M${f1(x)},${y - 10} l10,10 l-10,10 l-10,-10 Z" fill="${C.purpleL}" opacity=".5"/>`; }
      out += ground(940, '#E9E2F2', '#D9CFE9');
      // Table.
      out += `<rect x="120" y="840" width="1680" height="34" rx="10" fill="#9B6A45"/><rect x="170" y="874" width="22" height="120" fill="#7E5434"/><rect x="1728" y="874" width="22" height="120" fill="#7E5434"/>`;
      // Chart board.
      const bk = pop(t, T.board, 0.8);
      const BX = 620, BY = 400, BW = 820, BH = 420;
      let b = `<rect x="${BX + 80}" y="${BY + BH}" width="16" height="30" fill="#7E5434"/><rect x="${BX + BW - 96}" y="${BY + BH}" width="16" height="30" fill="#7E5434"/>
        <rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="22" fill="#fff" stroke="${C.purple}" stroke-width="8"/>`;
      const bars = series(13, 1.3, 0.38), step = 60, X = i => BX + 60 + i * step, Y = v => BY + BH - 50 - v * 300;
      let shown = 6; T.ticks.forEach(a => { if (t > a) shown++; }); if (t > T.advance) shown++;
      for (let i = 0; i < shown; i++) {
        const [o, c, hh, l] = bars[i];
        const k = i < 6 ? pop(t, T.board + 0.6 + i * 0.15, 0.4) : pop(t, i < 11 ? T.ticks[i - 6] : T.advance, 0.4);
        b += mini(X(i), Y(o), Y(c), Y(hh), Y(l), 30, k);
      }
      // Stop and target set before advancing.
      const ent = 10, eY = Y(bars[ent][1]);
      const lv = ease(seg(t, T.levels, T.levels + 0.8));
      if (lv > 0) {
        b += `<line x1="${X(ent)}" x2="${f1(X(ent) + lv * (BX + BW - 30 - X(ent)))}" y1="${f1(eY - 90)}" y2="${f1(eY - 90)}" stroke="${C.teal}" stroke-width="5" stroke-dasharray="12 8"/>
          <line x1="${X(ent)}" x2="${f1(X(ent) + lv * (BX + BW - 30 - X(ent)))}" y1="${f1(eY + 60)}" y2="${f1(eY + 60)}" stroke="${C.pink}" stroke-width="5" stroke-dasharray="12 8"/>`;
        b += pill(X(ent) - 70, eY - 90, 'target', DK.teal, pop(t, T.levels + 0.5, 0.4), 20) + pill(X(ent) - 60, eY + 60, 'stop', DK.pink, pop(t, T.levels + 0.7, 0.4), 20);
      }
      // The cloth over the future: its left edge follows the last printed candle.
      const fx = X(shown) - step / 2 + 6;
      const peek = t > T.peek && t < T.slap ? ease(seg(t, T.peek, T.peek + 0.8)) : t > T.slap && t < T.slap + 0.3 ? 1 - seg(t, T.slap, T.slap + 0.3) : 0;
      const R = BX + BW + 20, B2 = BY + BH + 30;
      const wav = Math.sin(t * 2) * 6;
      b += `<path d="M${f1(fx)},${BY - 14} L${R},${BY - 14} L${R},${f1(B2 - peek * 220)} Q${f1(R - 80 - peek * 60)},${f1(B2 - peek * 80)} ${f1(R - 180)},${B2 + wav} Q${f1((fx + R) / 2)},${B2 - 20 - wav} ${f1(fx)},${B2} Z" fill="${C.purple}"/>
        ${[1, 2, 3].map(i => `<path d="M${f1(fx + (R - fx) * i / 4)},${BY - 10} Q${f1(fx + (R - fx) * i / 4 + wav)},${(BY + B2) / 2} ${f1(fx + (R - fx) * i / 4)},${B2 - 10}" stroke="${DK.purple}" stroke-width="4" fill="none" opacity=".5"/>`).join('')}
        ${R - fx > 170 ? txt((fx + R) / 2, (BY + B2) / 2 + 14, 'future', 30, '#fff', { op: 0.85 }) : txt((fx + R) / 2, (BY + B2) / 2 + 18, '?', 48, '#fff', { op: 0.85 })}`;
      out += scaleAt(BX + BW / 2, 840, bk, b);
      // Decision clock with three buttons.
      const DEC = ['WAIT', 'PASS', 'WAIT', 'WAIT', 'TAKE'];
      let cur = -1; T.ticks.forEach((a, i) => { if (t > a) cur = i; });
      const ck = pop(t, T.board + 0.4, 0.6);
      const BTN = { TAKE: [330, C.teal], WAIT: [430, C.gold], PASS: [530, C.pink] };
      let clock = `<rect x="270" y="720" width="320" height="120" rx="20" fill="${C.dark}"/><circle cx="350" cy="780" r="30" fill="#fff"/><circle cx="510" cy="780" r="30" fill="#fff"/>
        <line x1="350" y1="780" x2="${f1(350 + Math.cos(t * 2) * 22)}" y2="${f1(780 + Math.sin(t * 2) * 22)}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/><line x1="510" y1="780" x2="${f1(510 + Math.cos(t * 0.5) * 22)}" y2="${f1(780 + Math.sin(t * 0.5) * 22)}" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`;
      Object.entries(BTN).forEach(([lab, [bx, col]]) => {
        const on = cur >= 0 && DEC[cur] === lab && t - T.ticks[cur] < 1.4;
        clock += `<rect x="${bx - 44}" y="${on ? 704 : 690}" width="88" height="${on ? 20 : 34}" rx="10" fill="${col}"/>${txt(bx, 676, lab, 22, on ? (lab === 'WAIT' ? DK.peach : col === C.teal ? DK.teal : DK.pink) : C.muted)}`;
      });
      out += scaleAt(430, 840, ck, clock);
      // The decision pill above the newest candle.
      if (cur >= 0) out += pill(X(6 + cur), BY - 0 + 40, DEC[cur], { TAKE: DK.teal, WAIT: DK.peach, PASS: DK.pink }[DEC[cur]], between(t, T.ticks[cur], T.ticks[cur] + 1.6, 0.4), 22);
      // Player.
      const pl = { x: 170, y: 1000, scale: 0.9, look: A.LOOKS.buyer, seed: 4, at: T.board + 0.2, talk: ctx.talking && t > T.slap - 0.2 && t < T.slap + 1.2 };
      const pressT = T.ticks.find(a => t > a - 0.4 && t < a + 0.6);
      if (pressT != null) { const lab = DEC[T.ticks.indexOf(pressT)]; pl.frontArm = aim(pl, BTN[lab][0] - 20, 690 + (t > pressT ? 16 : 0)); }
      else if (t > T.slap - 0.2 && t < T.slap + 0.8) pl.frontArm = { a1: -40, a2: -60 };
      else if (t > T.journal) pl.hold = `<rect x="-26" y="-40" width="52" height="64" rx="6" fill="${C.pinkL}" stroke="${C.pink}" stroke-width="3"/><line x1="-14" y1="-22" x2="14" y2="-22" stroke="#fff" stroke-width="4"/>`;
      out += who(t, pl);
      out += bub(260, 470, 'Hey! No peeking.', between(t, T.slap - 0.2, T.slap + 1.6), { size: 28 });
      // Squirrel peeker.
      const sqx = t < T.peek ? 1600 : t < T.slap ? lerp(1600, 1500, ease(seg(t, T.peek, T.peek + 0.6))) : lerp(1500, 1640, ease(seg(t, T.slap, T.slap + 0.5)));
      out += crit(t, 'squirrel', { x: sqx, y: 840, scale: 1.1, seed: 3, at: T.board + 1, flip: true, hop: t > T.slap && t < T.slap + 1 ? 14 : 0 });
      out += bub(1640, 560, 'What happens next? 👀', between(t, T.peek + 0.3, T.slap), { size: 26, tail: 'right' });
      if (t > T.slap && t < T.slap + 1.4) out += [0, 1, 2].map(i => `<circle cx="${f1(1660 + Math.cos(t * 7 + i * 2.1) * 34)}" cy="${f1(680 + Math.sin(t * 7 + i * 2.1) * 10)}" r="6" fill="${C.gold}"/>`).join('');
      // Snail referee on the table, crawling slowly.
      const snx = 1700 + (t - s.start) * 3;
      out += bst(t, 'snail', { x: snx, y: 840, scale: 0.8, seed: 2, at: T.board + 1.3 });
      out += bub(1730, 660, 'Slow is fine. 🐌', between(t, T.slow, T.peek - 0.2), { size: 26, tail: 'right' });
      // Rep logged.
      const jk = pop(t, T.journal, 0.6);
      out += scaleAt(1660, 500, jk, `<rect x="1520" y="420" width="280" height="150" rx="18" fill="#fff" stroke="${C.pink}" stroke-width="5"/><rect x="1520" y="420" width="30" height="150" rx="10" fill="${C.pink}"/>${txt(1670, 482, 'Rep logged', 30, C.dark)}${txt(1670, 532, 'TAKE · stop · target', 20, C.muted, { w: 700 })}`) + sparkAt(1660, 500, T.journal + 0.3, t, C.pink);
      out += bub(1680, 690, 'Uncomfortable? Good.', between(t, T.unc, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson 13: What Counts as One Backtest? ================= */
  // A round hamster, (0,0) at the feet, facing right. run: leg cycle on.
  const hamster = (t, o) => {
    const s = o.scale || 1, run = o.run ? 1 : 0, bl = blinkAmt(t, 5);
    const lg = run * Math.sin(t * 22) * 12, bob = run ? -Math.abs(Math.sin(t * 22)) * 6 : Math.sin(t * 2) * 2;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * (o.flip ? -1 : 1)},${s})"><g transform="translate(0,${f1(bob)})">
      <ellipse cx="${-22 + lg}" cy="-6" rx="12" ry="7" fill="${C.pinkL}"/><ellipse cx="${22 - lg}" cy="-6" rx="12" ry="7" fill="${C.pinkL}"/>
      <ellipse cx="0" cy="-52" rx="62" ry="50" fill="#E8B07A"/><ellipse cx="18" cy="-40" rx="36" ry="30" fill="#FBEBD8"/>
      <circle cx="-30" cy="-98" r="16" fill="#E8B07A"/><circle cx="-30" cy="-98" r="8" fill="${C.pinkL}"/><circle cx="20" cy="-102" r="16" fill="#E8B07A"/><circle cx="20" cy="-102" r="8" fill="${C.pinkL}"/>
      <ellipse cx="34" cy="-70" rx="${7}" ry="${(7 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/><circle cx="58" cy="-58" r="6" fill="${C.pink}"/>
      <ellipse cx="44" cy="-46" rx="12" ry="8" fill="#fff"/><path d="M60,-58 L80,-64 M60,-54 L80,-52" stroke="${C.muted}" stroke-width="2"/>
      ${o.think ? `<circle cx="70" cy="-120" r="8" fill="#fff"/><circle cx="84" cy="-142" r="11" fill="#fff"/>` : ''}</g></g>`;
  };
  const flipDigits = (x, y, n, w, col = '#fff', bg = C.dark) => {
    const s = String(n).padStart(3, '0');
    return [...s].map((d, i) => `<rect x="${x + i * (w + 8)}" y="${y}" width="${w}" height="${w * 1.4}" rx="8" fill="${bg}"/><line x1="${x + i * (w + 8)}" x2="${x + i * (w + 8) + w}" y1="${y + w * 0.7}" y2="${y + w * 0.7}" stroke="#000" stroke-width="2" opacity=".4"/>${txt(x + i * (w + 8) + w / 2, y + w * 1.05, d, w * 1.0, col)}`).join('');
  };
  Object.assign(LIVE, {
    // A hamster on a wheel: the CANDLES counter flies, the REPS counter only moves when a real setup
    // is evaluated (a take or a pass). An imaginary setup pops like a soap bubble.
    's22-hamster-wheel': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FFF4E6"/>` + ground(960, '#F3DFC8', '#E6CBB0');
      // Wood shavings and a water bottle.
      for (let i = 0; i < 30; i++) out += `<ellipse cx="${(i * 67) % 1900 + 10}" cy="${975 + (i * 13) % 80}" rx="14" ry="5" fill="#E6CBB0" transform="rotate(${(i * 37) % 60 - 30} ${(i * 67) % 1900 + 10} ${975 + (i * 13) % 80})"/>`;
      out += `<rect x="130" y="420" width="70" height="200" rx="30" fill="#DDF3FA" stroke="#9FD3EA" stroke-width="5"/><rect x="134" y="${f1(500 + Math.sin(t) * 4)}" width="62" height="116" rx="26" fill="${C.tealL}"/><rect x="156" y="620" width="18" height="70" fill="${C.muted}"/>`;
      // Running state: speed 1 while running, eases to 0 at each setup.
      const runs = [[T.run, T.setups[0]], [T.setups[0] + 2.6, T.setups[1]], [T.setups[1] + 2.6, T.ghost], [T.ghost + 3.2, s.end]];
      let ang = 0, running = false;
      runs.forEach(([a, b]) => { if (t > a) { const e = Math.min(t, b); ang += (e - a) * 220; if (t < b) running = true; } });
      // Candle counter: about 9 candles per second of running.
      const candles = Math.floor(ang / 220 * 9);
      // Wheel.
      const wk = pop(t, T.wheel, 0.8), WX = 620, WY = 700, WR = 240;
      let w = `<path d="M${WX - 60},960 L${WX},${WY} L${WX + 60},960" stroke="${C.muted}" stroke-width="16" fill="none" stroke-linejoin="round"/>
        <circle cx="${WX}" cy="${WY}" r="${WR}" fill="none" stroke="${C.purple}" stroke-width="18"/><circle cx="${WX}" cy="${WY}" r="${WR - 16}" fill="none" stroke="${C.purpleL}" stroke-width="6"/>`;
      for (let i = 0; i < 12; i++) { const a = rad(ang + i * 30); w += `<line x1="${WX}" y1="${WY}" x2="${f1(WX + Math.cos(a) * (WR - 10))}" y2="${f1(WY + Math.sin(a) * (WR - 10))}" stroke="${C.purpleL}" stroke-width="5"/>`; }
      for (let i = 0; i < 36; i++) { const a = rad(ang + i * 10); w += `<circle cx="${f1(WX + Math.cos(a) * (WR - 2))}" cy="${f1(WY + Math.sin(a) * (WR - 2))}" r="5" fill="${C.purple}"/>`; }
      w += `<circle cx="${WX}" cy="${WY}" r="22" fill="${C.purple}"/>`;
      out += scaleAt(WX, 960, wk, w);
      if (wk >= 1) out += hamster(t, { x: WX, y: WY + WR - 14, scale: 1, run: running, think: !running && t > T.run });
      if (running) out += [0, 1, 2].map(i => `<line x1="${WX - 120 - i * 30}" y1="${WY + 140 + i * 20}" x2="${WX - 170 - i * 30}" y2="${WY + 140 + i * 20}" stroke="${C.muted}" stroke-width="4" stroke-linecap="round" opacity="${0.3 + 0.3 * Math.abs(Math.sin(t * 12 + i))}"/>`).join('');
      // Scoreboard: CANDLES vs REPS.
      const bk = pop(t, T.wheel + 0.6, 0.7);
      let reps = 0; if (t > T.decide[0] + 0.4) reps = 1; if (t > T.decide[1] + 0.4) reps = 2;
      let sb = `<rect x="1040" y="420" width="800" height="230" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="4"/>
        ${txt(1240, 470, 'CANDLES', 28, C.muted)}${flipDigits(1150, 500, Math.min(999, candles), 56)}
        <line x1="1440" y1="450" x2="1440" y2="620" stroke="#F1E7E1" stroke-width="4"/>
        ${txt(1640, 470, 'REPS', 28, DK.teal)}`;
      const rp = t > T.decide[0] + 0.4 && t < T.decide[0] + 1 ? 1.25 : t > T.decide[1] + 0.4 && t < T.decide[1] + 1 ? 1.25 : 1;
      sb += scaleAt(1640, 570, rp, txt(1640, 610, String(reps), 120, DK.teal));
      out += scaleAt(1440, 650, bk, sb);
      out += pill(1240, 690, 'not decisions', C.pink, pop(t, T.notdec, 0.5), 22);
      // Setup cards appear on a little easel next to the wheel; the hamster decides.
      const setup = (at, dec, decAt, col) => {
        const k = between(t, at, at + 3.2);
        if (k <= 0) return '';
        let g = `<rect x="1060" y="740" width="320" height="180" rx="20" fill="#fff" stroke="${col}" stroke-width="5"/>${txt(1220, 784, 'SETUP FORMED', 24, C.muted)}`;
        const bars = [[.3, .5], [.5, .4], [.4, .7], [.7, .62]];
        bars.forEach(([o, c], i) => { g += mini(1130 + i * 60, 900 - o * 140 + 20, 900 - c * 140 + 20, 900 - Math.max(o, c) * 140 + 10, 900 - Math.min(o, c) * 140 + 30, 24); });
        g += pill(1220, 900, dec, col, pop(t, decAt, 0.4), 26);
        return scaleAt(1220, 920, k, g);
      };
      out += setup(T.setups[0], 'TAKE ✓', T.decide[0], DK.teal) + setup(T.setups[1], 'PASS ✓', T.decide[1], DK.purple);
      out += sparkAt(1640, 570, T.decide[0] + 0.4, t, C.teal) + sparkAt(1640, 570, T.decide[1] + 0.4, t, C.purple);
      // Imaginary setup: a soap bubble that pops.
      if (t > T.ghost && t < T.poof + 0.6) {
        const gk = pop(t, T.ghost, 0.6), pf = seg(t, T.poof, T.poof + 0.4);
        if (pf <= 0) out += scaleAt(1220, 820, gk, `<circle cx="1220" cy="${f1(820 + Math.sin(t * 2) * 10)}" r="110" fill="${C.purpleL}" opacity=".3" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 8"/><ellipse cx="1180" cy="770" rx="24" ry="12" fill="#fff" opacity=".7"/>${txt(1220, 816, 'what if', 26, C.purple)}${txt(1220, 850, 'it pulled back?', 22, C.purple, { w: 700 })}`);
        else out += [0, 1, 2, 3, 4, 5].map(i => { const a = rad(i * 60); return `<circle cx="${f1(1220 + Math.cos(a) * 120 * pf)}" cy="${f1(820 + Math.sin(a) * 120 * pf)}" r="${f1(10 * (1 - pf))}" fill="${C.purpleL}"/>`; }).join('') + txt(1220, 830, 'POP!', 44, C.purple, { op: 1 - pf });
      }
      out += pill(1220, 960, 'imaginary · not data', C.purple, between(t, T.poof, s.end), 22);
      // Parrot coach on the wheel stand, keeping tally.
      out += crit(t, 'parrot', { x: 950, y: 960, scale: 0.9, seed: 3, at: T.wheel + 1, talk: ctx.talking && t > T.notdec && t < T.notdec + 2 });
      out += bub(380, 420, 'Candles aren’t decisions!', between(t, T.notdec, T.setups[0] - 0.2), { size: 26 });
      return out;
    },

    // Bowling: one frame = one rep. A koala photographer snaps four shots of the same frame: still one rep.
    // Re-running a session you've already seen shows on the replay TV: that's review, not a clean rep.
    's22-bowling': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#EDEAF8"/>`;
      // Neon stripes on the back wall.
      for (let i = 0; i < 6; i++) out += `<rect x="${(i * 340 + t * 30) % 2200 - 200}" y="${380 + (i % 2) * 6}" width="180" height="8" rx="4" fill="${[C.pink, C.teal, C.gold][i % 3]}" opacity=".6"/>`;
      // Lane.
      out += `<rect x="0" y="940" width="1920" height="140" fill="#D9CFE9"/><rect x="120" y="884" width="1640" height="56" rx="8" fill="#E7C9A5"/>`;
      for (let i = 0; i < 20; i++) out += `<line x1="${140 + i * 82}" y1="888" x2="${140 + i * 82}" y2="936" stroke="#D2AD86" stroke-width="3"/>`;
      out += `<rect x="120" y="936" width="1640" height="10" fill="#B9B4EE"/>`;
      // Scoreboard with five frames.
      const sk = pop(t, T.alley + 0.3, 0.8);
      let sb = `<rect x="520" y="390" width="1060" height="170" rx="22" fill="${C.dark}"/>`;
      for (let i = 0; i < 5; i++) {
        const x = 540 + i * 206;
        sb += `<rect x="${x}" y="408" width="194" height="134" rx="12" fill="#3D3550"/>${txt(x + 97, 440, 'FRAME ' + (i + 1), 20, C.purpleL)}`;
      }
      sb += scaleAt(637, 500, pop(t, T.frame, 0.5), txt(637, 492, 'REP 1', 34, '#fff') + pill(637, 524, 'TAKE', DK.teal, 1, 18));
      sb += cross(843, 494, pop(t, T.replay + 2.6, 0.5), C.pink, 28) + scaleAt(843, 528, pop(t, T.replay + 2.8, 0.5), txt(843, 534, 'review', 20, C.pinkL));
      out += scaleAt(1050, 560, sk, sb);
      // Photos hang from frame one on a string.
      const ph = ['BEFORE', 'ENTRY', 'AFTER', 'EXTRA'];
      if (t > T.photos[0]) out += `<path d="M550,566 Q720,${606 + Math.sin(t * 2) * 4} 900,566" stroke="${C.muted}" stroke-width="3" fill="none"/>`;
      ph.forEach((p, i) => {
        const k = pop(t, T.photos[i] + 0.3, 0.5);
        if (k <= 0) return;
        const x = 590 + i * 92, y0 = 580 + [6, 16, 16, 6][i], sw = Math.sin(t * 2 + i) * 4;
        out += scaleAt(x, y0, k, rotAt(x, y0 - 4, sw, `<g transform="translate(0,${y0 - 578})"><rect x="${x - 40}" y="578" width="80" height="96" rx="5" fill="#fff" stroke="#E3DAEF" stroke-width="2"/><rect x="${x - 32}" y="586" width="64" height="58" fill="${[C.tealL, C.pinkL, C.peachL, C.purpleL][i]}"/>${mini(x - 12, 626, 604, 598, 632, 10)}${mini(x + 10, 610, 622, 604, 628, 10)}${txt(x, 664, p, 14, C.muted)}<rect x="${x - 4}" y="570" width="8" height="16" rx="2" fill="${C.gold}"/></g>`));
      });
      // Rep counter.
      const still = t > T.still && t < T.still + 1.4 ? 1 + Math.sin(seg(t, T.still, T.still + 1.4) * Math.PI) * 0.25 : 1;
      out += scaleAt(1760, 470, pop(t, T.frame + 0.3, 0.5) * still, `<circle cx="1760" cy="470" r="80" fill="${C.teal}"/>${txt(1760, 450, 'REPS', 22, '#fff')}${txt(1760, 506, '1', 64, '#fff')}`);
      out += pill(1760, 590, 'still 1', DK.teal, between(t, T.still, s.end), 22);
      // Ball roll + pins.
      const roll = seg(t, T.roll, T.roll + 1.8), bx = lerp(330, 1610, ease(roll));
      const hit = t > T.roll + 1.8;
      const pinsX = [1620, 1650, 1680, 1710, 1740];
      pinsX.forEach((px, i) => {
        const fall = hit ? ease(seg(t, T.roll + 1.8 + i * 0.06, T.roll + 2.3 + i * 0.06)) : 0;
        const reset = t > T.alley + 0.5 ? 1 : 0;
        out += reset ? rotAt(px, 884, fall * (i % 2 ? 80 : -80), `<path d="M${px},${884} c-14,0 -14,-30 -8,-46 c4,-10 -4,-18 0,-30 c2,-6 14,-6 16,0 c4,12 -4,20 0,30 c6,16 6,46 -8,46 Z" fill="#fff" stroke="#D9CFE9" stroke-width="2"/><rect x="${px - 6}" y="826" width="12" height="5" fill="${C.pink}"/>`) : '';
      });
      if (t > T.roll && !hit) out += `<g transform="translate(${f1(bx)},858)"><circle r="26" fill="${C.purple}"/><g transform="rotate(${f1(bx * 2)})"><circle cx="-8" cy="-8" r="4" fill="${DK.purple}"/><circle cx="6" cy="-10" r="4" fill="${DK.purple}"/><circle cx="-2" cy="4" r="4" fill="${DK.purple}"/></g></g>`;
      if (hit) out += sparkAt(1680, 830, T.roll + 1.8, t, C.gold);
      // Bowler.
      const bw = { x: 240, y: 1000, scale: 0.9, look: A.LOOKS.seller, seed: 4, at: T.alley + 0.4, talk: ctx.talking && t > T.frame && t < T.frame + 1.6 };
      const swing = t > T.roll - 1 && t < T.roll + 0.4 ? Math.sin(seg(t, T.roll - 1, T.roll + 0.4) * Math.PI * 1.5) : 0;
      bw.frontArm = t > T.frame && t < T.frame + 1.6 ? { a1: -120 + Math.sin(t * 8) * 10, a2: -90 } : { a1: 90 - swing * 80, a2: 90 - swing * 90 };
      if (t > T.roll - 1.4 && t < T.roll) bw.hold = `<circle cx="0" cy="10" r="26" fill="${C.purple}"/>`;
      out += who(t, bw);
      // Koala photographer with a camera; flash on every shot.
      const kx = 1000, ky = 884;
      out += bst(t, 'koala', { x: kx, y: ky, scale: 0.9, seed: 2, at: T.alley + 0.8 });
      if (t > T.alley + 1.4) out += `<rect x="${kx + 10}" y="${ky - 110}" width="70" height="50" rx="8" fill="${C.dark}"/><circle cx="${kx + 45}" cy="${ky - 85}" r="16" fill="#6A6280"/><circle cx="${kx + 45}" cy="${ky - 85}" r="8" fill="${C.tealL}"/>`;
      T.photos.forEach(p => { const f = between(t, p, p + 0.3, 0.1); if (f > 0) out += `<g opacity="${f}"><circle cx="${kx + 60}" cy="${ky - 120}" r="44" fill="#FFF6C8"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${kx + 60}" y1="${ky - 120}" x2="${f1(kx + 60 + Math.cos(rad(i * 45)) * 80)}" y2="${f1(ky - 120 + Math.sin(rad(i * 45)) * 80)}" stroke="${C.gold}" stroke-width="4"/>`).join('')}</g>`; });
      out += bub(1000, 640, 'Snap! Snap! Snap! Snap!', between(t, T.photos[0] + 0.2, T.photos[3] + 1), { size: 26 });
      // Replay TV and crab pinsetter.
      const tk = between(t, T.replay, s.end, 0.6);
      if (tk > 0) {
        const u = ((t - T.replay) % 2.2) / 2.2;
        out += scaleAt(1300, 760, tk, `<rect x="1150" y="620" width="300" height="190" rx="16" fill="${C.dark}"/><rect x="1164" y="634" width="272" height="150" rx="8" fill="#E7C9A5"/>
          <circle cx="${f1(1180 + u * 230)}" cy="740" r="16" fill="${C.purple}" opacity=".7"/>${[0, 1, 2].map(i => `<rect x="${1406 + i * 8}" y="700" width="6" height="40" rx="3" fill="#fff"/>`).join('')}
          ${txt(1200, 668, '◀◀', 28, C.pink)}<rect x="1236" y="812" width="128" height="16" rx="6" fill="${C.muted}"/>`);
        out += stamp(1300, 700, 'SEEN IT', C.pink, pop(t, T.replay + 1, 0.4), -12, 74, 26);
      }
      out += crit(t, 'crab', { x: 1830, y: 940, scale: 1, seed: 6, at: T.alley + 1, talk: ctx.talking && t > T.replay + 1 && t < T.replay + 4 });
      out += bub(1640, 700, 'You know the ending', between(t, T.replay + 1.2, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson 14: Building a Real Sample ================= */
  const coin = (x, y, face, spin = 1, r = 34) => {
    const sx = Math.max(0.12, Math.abs(spin));
    const col = face === 'H' ? C.gold : '#C9C1D9', dk = face === 'H' ? '#C98A1F' : '#8E86A8';
    return `<g transform="translate(${f1(x)},${f1(y)}) scale(${sx.toFixed(3)},1)"><circle r="${r}" fill="${col}" stroke="${dk}" stroke-width="5"/>${sx > 0.5 ? txt(0, r * 0.36, face, r, dk) : ''}</g>`;
  };
  const bear = (t, o) => {
    const s = o.scale || 1, bl = blinkAmt(t, 8), talk = o.talk ? Math.abs(Math.sin(t * 10)) : 0;
    const fur = '#A8733C', lt = '#E7C9A5';
    const bob = Math.sin(t * 2.2) * 3;
    return `<g transform="translate(${f1(o.x)},${f1(o.y)}) scale(${s * (o.flip ? -1 : 1)},${s})"><g transform="translate(0,${f1(bob)})">
      <ellipse cx="-30" cy="-14" rx="26" ry="16" fill="${fur}"/><ellipse cx="30" cy="-14" rx="26" ry="16" fill="${fur}"/>
      <ellipse cx="0" cy="-90" rx="74" ry="82" fill="${fur}"/><ellipse cx="0" cy="-74" rx="44" ry="52" fill="${lt}"/>
      <path d="M-60,-120 Q-96,${-90 + (o.arm || 0)} -70,-60" stroke="${fur}" stroke-width="28" fill="none" stroke-linecap="round"/>
      <path d="M60,-120 Q${96},${-150 - (o.arm || 0)} ${80},${-180 - (o.arm || 0)}" stroke="${fur}" stroke-width="28" fill="none" stroke-linecap="round"/>
      <circle cx="-44" cy="-226" r="22" fill="${fur}"/><circle cx="44" cy="-226" r="22" fill="${fur}"/><circle cx="-44" cy="-226" r="11" fill="${lt}"/><circle cx="44" cy="-226" r="11" fill="${lt}"/>
      <circle cx="0" cy="-190" r="56" fill="${fur}"/><ellipse cx="0" cy="-170" rx="26" ry="20" fill="${lt}"/><ellipse cx="0" cy="-180" rx="10" ry="7" fill="${C.dark}"/>
      <ellipse cx="-20" cy="-204" rx="6" ry="${(6 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/><ellipse cx="20" cy="-204" rx="6" ry="${(6 * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>
      ${o.yuck ? `<path d="M-14,-160 Q0,-168 14,-160" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-32,-216 l14,6 M32,-216 l-14,6" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>` : `<ellipse cx="0" cy="-160" rx="8" ry="${2 + talk * 7}" fill="#6B2A2A"/>`}</g></g>`;
  };
  Object.assign(LIVE, {
    // A fair coin-flip machine lands tails three times. The goat panics: "change the rules!"
    // The machine keeps going to 100 flips and the tally settles near half and half.
    's22-coin-machine': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#EAF6F4"/>` + ground(960, '#DDEDE6', '#C6DDD3');
      for (let i = 0; i < 8; i++) out += `<circle cx="${(i * 260 + t * 14) % 2100 - 90}" cy="${420 + (i % 3) * 60}" r="${8 + (i % 3) * 4}" fill="#fff" opacity=".7"/>`;
      // Flip results: three tails, then a fast run to 100.
      const fast = [];
      for (let i = 0; i < 97; i++) fast.push(((i * 37 + 11) % 100) < 52 ? 'H' : 'T');
      const seq = ['T', 'T', 'T'].concat(fast);
      const at = i => i < 3 ? T.flips[i] : lerp(T.fast, T.result, Math.pow((i - 3) / 96, 0.8));
      let n = 0; for (let i = 0; i < 100; i++) if (t > at(i) + 0.5) n = i + 1;
      const H = seq.slice(0, n).filter(x => x === 'H').length, Tn = n - H;
      // Machine.
      const mk = pop(t, T.machine, 0.8);
      const busy = t > T.fast - 0.2 && t < T.result + 0.4;
      const jig = busy ? Math.sin(t * 40) * 3 : 0;
      let m = `<g transform="translate(${f1(jig)},0)"><rect x="330" y="560" width="400" height="380" rx="36" fill="${C.purple}"/><rect x="360" y="590" width="340" height="150" rx="20" fill="#fff"/>
        ${txt(530, 640, 'FAIR COIN', 30, C.purple)}${txt(530, 690, '50 / 50', 40, C.dark)}
        ${[0, 1, 2].map(i => `<circle cx="${420 + i * 110}" cy="800" r="26" fill="${[C.pink, C.gold, C.teal][i]}" opacity="${0.5 + 0.5 * Math.abs(Math.sin(t * (busy ? 12 : 3) + i))}"/>`).join('')}
        <rect x="380" y="860" width="300" height="40" rx="12" fill="${DK.purple}"/>
        <path d="M720,600 L800,${f1(560 - (busy ? Math.abs(Math.sin(t * 20)) * 30 : 0))}" stroke="${C.muted}" stroke-width="14" stroke-linecap="round"/>
        <rect x="350" y="930" width="30" height="30" fill="${C.muted}"/><rect x="680" y="930" width="30" height="30" fill="${C.muted}"/>
        <circle cx="300" cy="620" r="${30 + (busy ? 8 : 0) * Math.abs(Math.sin(t * 6))}" fill="#C9C1D9"/><circle cx="300" cy="620" r="12" fill="${C.purple}"/></g>`;
      out += scaleAt(530, 960, mk, m);
      // Coins in flight (the three slow ones arc high; fast ones are little blurs).
      for (let i = 0; i < Math.min(100, n + 3); i++) {
        const a0 = at(i), u = seg(t, a0 - 0.5, a0 + 0.5);
        if (u <= 0 || u >= 1) continue;
        const x = lerp(800, 1000, u), y = 560 - Math.sin(u * Math.PI) * (i < 3 ? 160 : 110) + u * 300;
        out += coin(x, y, seq[i], Math.cos(u * Math.PI * 8), i < 3 ? 34 : 24);
      }
      // Tray with the landed coins.
      out += scaleAt(1000, 940, pop(t, T.machine + 0.4, 0.6), `<path d="M900,880 L1100,880 L1080,940 L920,940 Z" fill="${C.peachL}" stroke="${C.peach}" stroke-width="5"/>` + Array.from({ length: Math.min(n, 9) }, (_, i) => coin(930 + (i % 5) * 34, 872 - Math.floor(i / 5) * 14, seq[i], 1, 20)).join(''));
      // Tally board.
      const bk = pop(t, T.machine + 0.6, 0.7);
      let b = `<rect x="1180" y="400" width="660" height="400" rx="30" fill="#fff" stroke="#E3DAEF" stroke-width="4"/>${txt(1510, 460, 'FLIPS: ' + n, 40, C.dark)}`;
      // Last results chips.
      const last = seq.slice(Math.max(0, n - 8), n);
      last.forEach((f, i) => { b += coin(1260 + i * 72, 530, f, 1, 26); });
      // Bars.
      const bw = 560, pH = n ? H / n : 0, pT = n ? Tn / n : 0;
      b += `<rect x="1230" y="600" width="${bw}" height="56" rx="14" fill="#F4F0FB"/><rect x="1230" y="600" width="${f1(bw * pH)}" height="56" rx="14" fill="${C.gold}"/>${txt(1250, 640, 'Heads ' + Math.round(pH * 100) + '%', 26, C.dark, { a: 'start' })}
        <rect x="1230" y="680" width="${bw}" height="56" rx="14" fill="#F4F0FB"/><rect x="1230" y="680" width="${f1(bw * pT)}" height="56" rx="14" fill="#C9C1D9"/>${txt(1250, 720, 'Tails ' + Math.round(pT * 100) + '%', 26, C.dark, { a: 'start' })}`;
      out += scaleAt(1510, 800, bk, b);
      out += stamp(1700, 520, '100%?!', C.pink, between(t, T.panic, T.calm), -12, 70, 26);
      out += pill(1510, 860, 'early sample', C.pink, between(t, T.flips[2] + 0.4, T.fast + 1), 24);
      out += pill(1510, 860, 'N = 100 · a different picture', DK.teal, pop(t, T.result + 0.3, 0.5), 24);
      out += sparkAt(1510, 650, T.result + 0.4, t, C.teal);
      // Operator and goat.
      const op = { x: 170, y: 1000, scale: 0.88, look: A.LOOKS.c, seed: 2, at: T.machine + 0.3, hat: 'hard', talk: ctx.talking && t > T.calm && t < T.calm + 2.4 };
      if (t > T.calm && t < T.calm + 2.6) { op.frontArm = { a1: -30, a2: -80 }; op.backArm = { a1: -150, a2: -100 }; }
      out += who(t, op);
      const gx = t > T.panic && t < T.calm ? 1160 + Math.sin(t * 14) * 14 : 1160;
      out += bst(t, 'goat', { x: gx, y: 1010, scale: 1, seed: 3, at: T.machine + 0.9, hop: t > T.panic && t < T.calm ? 9 : t > T.result + 2 ? 5 : 0, hopH: 22, flip: true });
      out += bub(800, 470, 'It’s broken! Change the rules!', between(t, T.panic, T.calm), { size: 26, tail: 'right' });
      out += bub(860, 470, 'Oh. Never mind. 😅', between(t, T.result + 2, s.end), { size: 26, tail: 'right' });
      out += bub(380, 470, 'Three flips? Keep flipping.', between(t, T.calm, T.fast + 1.6), { size: 26 });
      return out;
    },

    // A beehive evidence meter: 100 honeycomb cells. A bear tastes three jars and condemns the hive;
    // the beekeeper keeps filling. 10 · 25 · 50 · 100 are practice milestones, not proof.
    's22-beehive': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FFF7E3"/>` + ground(960, '#E8F0D8', '#D2E2BC');
      // Flowers swaying.
      for (let i = 0; i < 9; i++) { const x = 60 + i * 110, sw = Math.sin(t * 2 + i) * 6; out += `<line x1="${x}" y1="1040" x2="${f1(x + sw)}" y2="985" stroke="#9BC48A" stroke-width="5"/><circle cx="${f1(x + sw)}" cy="980" r="13" fill="${[C.pink, C.peach, C.purpleL][i % 3]}"/><circle cx="${f1(x + sw)}" cy="980" r="5" fill="${C.gold}"/>`; }
      // Count of filled cells.
      const n = t < T.first ? 0 : t < T.fill ? Math.min(3, Math.floor(seg(t, T.first, T.first + 1.2) * 3) + 1) : Math.max(3, Math.floor(3 + 97 * Math.pow(seg(t, T.fill, T.full), 1.4)));
      // Honeycomb frame: 10 x 10 cells.
      const fk = pop(t, T.hive, 0.8), r = 25, hw = r * Math.sqrt(3), FX = 1080, FY = 440;
      let fr = `<rect x="${FX - 40}" y="${FY - 40}" width="${10 * hw + 70}" height="${10 * r * 1.5 + 66}" rx="18" fill="#C98A5B"/><rect x="${FX - 22}" y="${FY - 22}" width="${10 * hw + 34}" height="${10 * r * 1.5 + 30}" rx="10" fill="#F6E6C8"/>`;
      for (let k = 0; k < 100; k++) {
        const row = Math.floor(k / 10), col = k % 10;
        const cx = FX + col * hw + (row % 2) * hw / 2, cy = FY + row * r * 1.5 + 6;
        const filled = k < n;
        const pts = Array.from({ length: 6 }, (_, j) => { const a = rad(60 * j - 30); return `${f1(cx + Math.cos(a) * (r - 2))},${f1(cy + Math.sin(a) * (r - 2))}`; }).join(' ');
        fr += `<polygon points="${pts}" fill="${filled ? C.gold : '#fff'}" stroke="#E2C48E" stroke-width="3"/>`;
      }
      out += scaleAt(FX + 250, FY + 400, fk, fr);
      // N sign under the frame.
      out += pill(FX + 250, 1010, `N = ${n}` + (n < 25 ? ' · early sample' : ''), n < 25 ? C.pink : DK.peach, pop(t, T.first, 0.5), 26);
      // Milestone ribbons on the right.
      [10, 25, 50, 100].forEach((m, i) => {
        const y = 470 + i * 120, reached = n >= m;
        const k = pop(t, T.hive + 0.6 + i * 0.15, 0.5);
        const glow = reached ? 1 : 0.4;
        out += scaleAt(1780, y, k, `<g opacity="${glow}"><circle cx="1780" cy="${y}" r="46" fill="${reached ? C.teal : '#fff'}" stroke="${DK.teal}" stroke-width="5"/>${txt(1780, y + 13, String(m), 36, reached ? '#fff' : DK.teal)}<path d="M1756,${y + 40} L1748,${y + 74} L1766,${y + 64} L1780,${y + 78} L1786,${y + 44} Z" fill="${reached ? DK.teal : C.tealL}"/></g>`);
      });
      out += pill(1500, 374, 'practice milestones, not proof', DK.teal, pop(t, T.proof, 0.5), 24);
      // Beekeeper with a veil hat and smoker.
      const bk = { x: 840, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 6, at: T.hive + 0.3, talk: ctx.talking && t > T.calm && t < T.calm + 2.6 };
      bk.frontArm = t > T.fill ? aim(bk, 1020 + Math.sin(t * 5) * 20, 640 + Math.cos(t * 4) * 30) : { a1: 60, a2: 30 };
      bk.hold = `<rect x="-14" y="-40" width="28" height="44" rx="6" fill="${C.muted}"/><path d="M0,-40 l0,-14" stroke="${C.muted}" stroke-width="6"/>`;
      out += who(t, bk);
      if (pop(t, bk.at) >= 1) { const h = headAt(t, bk); out += `<path d="M${f1(h.x - 54 * h.s)},${f1(h.y - 30 * h.s)} L${f1(h.x + 54 * h.s)},${f1(h.y - 30 * h.s)} L${f1(h.x + 50 * h.s)},${f1(h.y + 44 * h.s)} L${f1(h.x - 50 * h.s)},${f1(h.y + 44 * h.s)} Z" fill="#fff" opacity=".4" stroke="#E3DAEF" stroke-width="2"/><path d="M${f1(h.x - 44 * h.s)},${f1(h.y - 34 * h.s)} Q${f1(h.x)},${f1(h.y - 100 * h.s)} ${f1(h.x + 44 * h.s)},${f1(h.y - 34 * h.s)} Z" fill="#F6E6C8"/><ellipse cx="${f1(h.x)}" cy="${f1(h.y - 32 * h.s)}" rx="${f1(70 * h.s)}" ry="${f1(12 * h.s)}" fill="#E8D3A8"/>`; }
      // Smoke puffs.
      if (t > T.fill) out += [0, 1, 2].map(i => { const p = ((t * 0.8 + i / 3) % 1); return `<circle cx="${f1(900 + p * 120)}" cy="${f1(700 - p * 160)}" r="${f1(10 + p * 24)}" fill="#fff" opacity="${(0.7 * (1 - p)).toFixed(2)}"/>`; }).join('');
      // Table with three jars, and the bear tasting them.
      const tk = pop(t, T.hive + 0.5, 0.6);
      let tb = `<rect x="330" y="860" width="320" height="22" rx="8" fill="#9B6A45"/><rect x="350" y="882" width="16" height="80" fill="#7E5434"/><rect x="614" y="882" width="16" height="80" fill="#7E5434"/>`;
      [0, 1, 2].forEach(i => {
        const x = 400 + i * 90, tasted = t > T.taste[i];
        tb += `<rect x="${x - 30}" y="780" width="60" height="80" rx="12" fill="${C.gold}" opacity="${tasted ? 0.45 : 0.9}" stroke="#C98A1F" stroke-width="4"/><rect x="${x - 34}" y="770" width="68" height="18" rx="6" fill="${C.pink}"/>${txt(x, 836, '#' + (i + 1), 22, '#fff')}`;
      });
      out += scaleAt(490, 960, tk, tb);
      const tasting = T.taste.some(a => t > a - 0.2 && t < a + 0.6);
      out += (pop(t, T.bear, 0.6) > 0 ? scaleAt(200, 1000, pop(t, T.bear, 0.6), bear(t, { x: 200, y: 1000, scale: 1.05, yuck: t > T.taste[0] + 0.4 && t < T.verdict, talk: ctx.talking && t > T.verdict && t < T.calm, arm: tasting ? 30 : 0 })) : '');
      T.taste.forEach(a => { out += sparkAt(400 + T.taste.indexOf(a) * 90, 760, a, t, C.pink); });
      out += bub(300, 600, 'This hive is bad! 🐻', between(t, T.verdict, T.calm + 0.4), { size: 28 });
      out += bub(700, 560, 'Three jars? Learn, don’t conclude.', between(t, T.calm, T.fill + 2), { size: 26 });
      // Bees buzzing around the frame.
      for (let i = 0; i < 6; i++) {
        const a = t * (0.9 + i * 0.13) + i * 1.1;
        out += beast(t, 'bee', { x: 1330 + Math.cos(a) * (330 + i * 12), y: 680 + Math.sin(a * 1.3) * 260, scale: 0.9, seed: i, flip: Math.sin(a) > 0 });
      }
      return out;
    },
  });

  /* ================= Lesson 15: Screenshot Journaling ================= */
  // A small chart snapshot inside a box (x, y = top-left), with an optional variant.
  const snap = (x, y, w, h, kind, seed = 1) => {
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#FFF9F4"/>`;
    const n = 7, step = (w - 30) / n, bars = series(n, seed, 0.45), Y = v => y + h - 16 - v * (h - 36);
    bars.forEach(([o, c, hh, l], i) => { g += mini(x + 20 + i * step, Y(o), Y(c), Y(hh), Y(l), Math.max(8, step * 0.5)); });
    if (kind === 'before') g += `<line x1="${x + 8}" x2="${x + w - 8}" y1="${f1(Y(0.62))}" y2="${f1(Y(0.62))}" stroke="${C.purple}" stroke-width="3" stroke-dasharray="8 6"/>`;
    if (kind === 'entry') g += `<path d="M${x + w - 40},${f1(Y(bars[5][1]) + 30)} l0,-22 m-9,9 l9,-11 l9,11" stroke="${C.purple}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (kind === 'after') g += `<rect x="${x + w * 0.55}" y="${y + 8}" width="${w * 0.4}" height="${h - 16}" fill="${C.tealL}" opacity=".35"/>`;
    return g;
  };
  Object.assign(LIVE, {
    // A photo booth: a candle character poses three times. The strip prints BEFORE, ENTRY, AFTER,
    // gets labeled automatically, and a dog brings an uploaded shot to clip to the same rep.
    's22-photo-booth': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FBEFF4"/>` + ground(960, '#F2DDE6', '#E6C9D5');
      // Bunting lights.
      for (let i = 0; i < 18; i++) out += `<circle cx="${60 + i * 108}" cy="${392 + Math.sin(i * 0.9) * 8}" r="9" fill="${[C.gold, C.pink, C.teal][i % 3]}" opacity="${0.5 + 0.5 * Math.abs(Math.sin(t * 3 + i))}"/>`;
      // Booth.
      const bk = pop(t, T.booth, 0.8);
      const closed = ease(seg(t, T.close, T.close + 0.6)) * (1 - ease(seg(t, T.strip, T.strip + 0.6)));
      let b = `<rect x="260" y="430" width="500" height="530" rx="26" fill="${C.teal}"/><rect x="260" y="430" width="500" height="80" rx="26" fill="${DK.teal}"/>${txt(510, 484, 'PHOTO BOOTH', 34, '#fff')}
        <rect x="300" y="530" width="300" height="410" rx="10" fill="#3D3550"/>
        <rect x="640" y="560" width="90" height="120" rx="12" fill="#fff"/><circle cx="685" cy="600" r="22" fill="${C.dark}"/><circle cx="685" cy="600" r="10" fill="#6A6280"/>${txt(685, 660, 'SMILE', 16, C.pink)}
        <rect x="660" y="760" width="74" height="16" rx="6" fill="${C.dark}"/>`;
      out += scaleAt(510, 960, bk, b);
      // Candle character walks in and poses.
      if (t > T.booth + 0.6) {
        const walk = seg(t, T.enter, T.enter + 1.6), cx = lerp(80, 450, ease(walk));
        const pose = t > T.flash[2] - 0.6 ? 'cheer' : t > T.flash[1] - 0.6 ? 'out' : t > T.flash[0] - 0.6 ? 'wave' : undefined;
        out += cdl(t, { x: cx, y: 930, h: 150, w: 86, col: C.peach, seed: 3, walking: walk > 0 && walk < 1, arms: walk >= 1 ? pose : undefined, wu: 30, talk: ctx.talking && walk >= 1 && t < T.close });
      }
      // Curtain.
      if (bk >= 1) {
        const cw = lerp(50, 300, closed), wav = Math.sin(t * 2) * 6;
        let cur = `<rect x="296" y="526" width="308" height="14" rx="6" fill="${C.muted}"/>`;
        for (let i = 0; i < 6; i++) cur += `<path d="M${f1(300 + i * cw / 6)},540 Q${f1(300 + i * cw / 6 + 14 + wav)},740 ${f1(300 + i * cw / 6)},940 L${f1(300 + (i + 1) * cw / 6)},940 Q${f1(300 + (i + 1) * cw / 6 - 10 + wav)},740 ${f1(300 + (i + 1) * cw / 6)},540 Z" fill="${i % 2 ? C.pink : '#E06B85'}"/>`;
        out += cur;
      }
      // Flashes light up the booth.
      T.flash.forEach(f => { const k = between(t, f, f + 0.25, 0.1); if (k > 0) out += `<rect x="300" y="530" width="300" height="410" rx="10" fill="#FFF6C8" opacity="${(0.8 * k).toFixed(2)}"/><circle cx="685" cy="600" r="${40 * k}" fill="#FFF6C8"/>`; });
      // The strip: three frames that develop as each shot is taken, then a clip and the auto label.
      const sk = pop(t, T.flash[0] + 0.2, 0.6);
      const KIND = [['BEFORE', 'before', '4H / 1H context'], ['ENTRY', 'entry', '1M execution'], ['AFTER', 'after', 'outcome + structure']];
      let st = `<rect x="880" y="440" width="940" height="360" rx="20" fill="#fff" stroke="#EADFD8" stroke-width="4"/>`;
      KIND.forEach(([lab, kind, sub], i) => {
        const x = 910 + i * 302, dev = seg(t, T.flash[i] + 0.1, T.flash[i] + 1.2);
        st += `<rect x="${x}" y="470" width="278" height="220" rx="10" fill="#3D3550"/>`;
        if (dev > 0) st += `<g opacity="${dev.toFixed(2)}">${snap(x + 6, 476, 266, 208, kind, i * 2 + 1)}</g>`;
        st += pill(x + 139, 730, lab, [C.purple, C.pink, DK.teal][i], pop(t, T.flash[i] + 0.4, 0.5), 24);
        st += scaleAt(x + 139, 772, pop(t, T.flash[i] + 0.8, 0.5), txt(x + 139, 780, sub, 20, C.muted, { w: 700 }));
      });
      out += scaleAt(1350, 620, sk, st);
      T.flash.forEach((f, i) => { out += sparkAt(1049 + i * 302, 580, f + 1.1, t, C.gold); });
      // Clip + auto label.
      const ck = pop(t, T.strip, 0.5);
      out += scaleAt(1350, 440, ck, `<rect x="1320" y="410" width="60" height="44" rx="8" fill="${C.gold}"/><rect x="1336" y="400" width="28" height="14" rx="4" fill="#C98A1F"/>`);
      out += pill(1250, 836, 'REP 12 · STUDY v1 · MNQ · 1M · auto-labeled', C.purple, pop(t, T.label, 0.5), 24);
      // Dog brings an uploaded shot and clips it to the rep.
      const dk = t > T.dog;
      if (dk) {
        const run = seg(t, T.dog, T.dog + 2), dx = lerp(2000, 1420, ease(run));
        out += critter(t, 'dog', { x: dx, y: 1000, scale: 0.9, seed: 2, flip: true, hop: run < 1 ? 12 : 0, hopH: 14 });
        if (t < T.attach) out += `<g transform="translate(${f1(dx - 100)},${946}) rotate(-8)"><rect x="-44" y="-34" width="88" height="68" rx="6" fill="#fff" stroke="${C.purpleL}" stroke-width="3"/>${snap(-38, -28, 76, 46, 'entry', 7)}${txt(0, 30, 'TV upload', 12, C.purple)}</g>`;
        else {
          const u = ease(seg(t, T.attach, T.attach + 0.8));
          out += `<line x1="1720" y1="800" x2="1720" y2="${f1(lerp(800, 860, u))}" stroke="${C.muted}" stroke-width="3"/><g transform="translate(${f1(lerp(1320, 1720, u))},${f1(lerp(946, 910, u))}) scale(${f1(lerp(1, 1.3, u))})"><rect x="-56" y="-40" width="112" height="80" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="3"/>${snap(-48, -32, 96, 54, 'entry', 7)}${txt(0, 34, 'uploaded', 14, C.purple)}</g>`;
          out += pill(1720, 1010, '+ attached to REP 12', DK.purple, pop(t, T.attach + 0.7, 0.5), 22);
        }
      }
      return out;
    },

    // A scrapbook of chart photos. Each gets sticker tags; then a filter lifts out every "clean loser"
    // into a row, and an owl spots the pattern. The chart keeps the receipts.
    's22-scrapbook': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#F1F6EC"/>` + ground(950, '#E6D9C6', '#D4C2AA');
      // Table + album.
      out += `<rect x="300" y="900" width="1380" height="30" rx="10" fill="#9B6A45"/>`;
      const ak = pop(t, T.album, 0.8);
      let al = `<path d="M360,520 Q660,490 980,520 L980,900 Q660,870 360,900 Z" fill="#FFFDF8" stroke="#EADFD8" stroke-width="4"/><path d="M980,520 Q1300,490 1600,520 L1600,900 Q1300,870 980,900 Z" fill="#FFFDF8" stroke="#EADFD8" stroke-width="4"/>
        <line x1="980" y1="520" x2="980" y2="900" stroke="#D9CFC8" stroke-width="6"/>`;
      out += scaleAt(980, 900, ak, al);
      // Eight photos, each with a tag.
      const TAGS = [['clean loser', C.purple], ['chased', C.pink], ['A+ retest', DK.teal], ['clean loser', C.purple], ['early', DK.peach], ['chased', C.pink], ['clean loser', C.purple], ['A+ retest', DK.teal]];
      const home = i => ({ x: [420, 660, 1070, 1320][i % 4], y: 556 + Math.floor(i / 4) * 178 });
      const filt = t > T.f2 ? 'chased' : t > T.f1 ? 'clean loser' : null;
      const matches = name => TAGS.map((g, i) => g[0] === name ? i : -1).filter(i => i >= 0);
      const lane = (name, at) => matches(name).map((i, j) => ({ i, j, at }));
      const pulled = {};
      if (t > T.f1) lane('clean loser', T.f1).forEach(o => { pulled[o.i] = o; });
      if (t > T.f2) { Object.keys(pulled).forEach(k => delete pulled[k]); lane('chased', T.f2).forEach(o => { pulled[o.i] = o; }); }
      // Back-to-album easing when a filter changes.
      TAGS.forEach(([tag, col], i) => {
        const k = pop(t, T.album + 0.5 + i * 0.12, 0.5);
        if (k <= 0) return;
        const h = home(i);
        let x = h.x, y = h.y, sc = 1.3, dim = filt && !pulled[i] ? 0.35 : 1, rot = ((i * 37) % 11) - 5;
        if (pulled[i]) {
          const u = ease(seg(t, pulled[i].at + 0.3 + pulled[i].j * 0.25, pulled[i].at + 1.1 + pulled[i].j * 0.25));
          x = lerp(h.x, 1660, u); y = lerp(h.y, 470 + pulled[i].j * 150, u); sc = lerp(1.3, 1, u); rot = lerp(rot, 0, u);
        } else if (t > T.f2 && matches('clean loser').includes(i)) {
          const u = ease(seg(t, T.f2, T.f2 + 0.8)); const tx = 1660, ty = 470 + matches('clean loser').indexOf(i) * 150;
          x = lerp(tx, h.x, u); y = lerp(ty, h.y, u);
        }
        let ph = `<rect x="0" y="0" width="128" height="124" rx="6" fill="#fff" stroke="#E3DAEF" stroke-width="3"/>${snap(8, 8, 112, 80, ['before', 'entry', 'after'][i % 3], i + 2)}`;
        const tk = pop(t, T.tags[i], 0.4);
        if (tk > 0) ph += `<g transform="translate(64,108) scale(${tk.toFixed(3)})"><rect x="-58" y="-14" width="116" height="28" rx="14" fill="${col}"/>${txt(0, 7, tag, 17, '#fff')}</g>`;
        out += scaleAt(x + 64, y + 62, k * sc, `<g opacity="${dim}" transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)} 64 62)">${ph}</g>`);
      });
      // Filter bar.
      const fk = pop(t, T.f1 - 0.4, 0.5);
      if (fk > 0) {
        const q = t > T.f2 ? 'chased' : 'clean loser', typed = t > T.f2 ? seg(t, T.f2 - 0.4, T.f2) : seg(t, T.f1 - 0.4, T.f1);
        const shown = [...q].slice(0, Math.ceil(typed * q.length)).join('');
        out += scaleAt(980, 450, fk, `<rect x="700" y="420" width="560" height="64" rx="32" fill="#fff" stroke="${C.purple}" stroke-width="4"/><circle cx="740" cy="452" r="14" fill="none" stroke="${C.purple}" stroke-width="4"/><line x1="750" y1="462" x2="760" y2="472" stroke="${C.purple}" stroke-width="4"/>
          ${txt(780, 462, 'show me all my ' + shown + (Math.sin(t * 8) > 0 ? '|' : ''), 26, C.dark, { a: 'start', w: 700 })}`);
      }
      // Tagger with a sticker gun.
      const tg = { x: 180, y: 1000, scale: 0.9, look: A.LOOKS.d, seed: 5, at: T.album + 0.2, talk: ctx.talking && t > T.album && t < T.tags[0] };
      const cur = T.tags.findIndex(a => t > a - 0.5 && t < a + 0.3);
      if (cur >= 0) tg.frontArm = aim(tg, 320, 700 + Math.sin(t * 10) * 20);
      tg.hold = `<rect x="-12" y="-10" width="56" height="30" rx="8" fill="${C.gold}"/><rect x="-6" y="14" width="16" height="28" rx="4" fill="#C98A1F"/>`;
      out += who(t, tg);
      // Stickers flying from the gun.
      if (cur >= 0) { const h = home(cur), u = seg(t, T.tags[cur] - 0.4, T.tags[cur]); out += `<rect x="${f1(lerp(360, h.x + 34, u))}" y="${f1(lerp(700, h.y + 96, u) - Math.sin(u * Math.PI) * 80)}" width="40" height="16" rx="8" fill="${TAGS[cur][1]}"/>`; }
      // Cat batting at the album corner.
      out += crit(t, 'cat', { x: 1280, y: 900, scale: 0.65, seed: 2, at: T.album + 1, col: '#D9CFC8', str: C.muted });
      // Owl with monocle spots the pattern.
      out += crit(t, 'owl', { x: 1860, y: 1000, scale: 0.9, seed: 7, at: T.album + 1.2, monocle: true, talk: ctx.talking && t > T.pattern && t < T.pattern + 2 });
      out += bub(1560, 950, 'A pattern! 🔎', between(t, T.pattern, T.f2 - 0.3), { size: 26, tail: 'right' });
      out += bub(1560, 950, 'Receipts! 🧾', between(t, T.receipts, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Lesson 16: The AGHF Trade Journal ================= */
  const plane = (x, y, ang, col = '#fff', sc = 1) => `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(ang)}) scale(${sc})"><path d="M28,0 L-22,-16 L-12,0 L-22,16 Z" fill="${col}" stroke="${C.purple}" stroke-width="3" stroke-linejoin="round"/><path d="M28,0 L-12,0" stroke="${C.purple}" stroke-width="2"/></g>`;
  const typewriter = (t, x, y, sleep, k = 1) => {
    if (k <= 0) return '';
    const bl = sleep ? 1 : blinkAmt(t, 9), br = Math.sin(t * 1.6) * 3;
    let g = `<rect x="${x - 110}" y="${y - 120}" width="220" height="120" rx="22" fill="${C.pinkL}" stroke="${DK.pink}" stroke-width="5"/>
      <rect x="${x - 80}" y="${y - 190 + br}" width="160" height="80" rx="4" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <rect x="${x - 120}" y="${y - 130}" width="240" height="20" rx="8" fill="${DK.pink}"/>`;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) g += `<circle cx="${x - 75 + i * 30 + r * 14}" cy="${y - 34 + r * 20}" r="9" fill="#fff" stroke="${DK.pink}" stroke-width="2"/>`;
    g += sleep ? `<path d="M${x - 46},${y - 82} q12,10 24,0 M${x + 22},${y - 82} q12,10 24,0" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${x - 34}" cy="${y - 82}" rx="7" ry="${f1(7 * (1 - bl * 0.9))}" fill="${C.dark}"/><ellipse cx="${x + 34}" cy="${y - 82}" rx="7" ry="${f1(7 * (1 - bl * 0.9))}" fill="${C.dark}"/>`;
    if (sleep) g += [0, 1, 2].map(i => { const p = ((t * 0.5 + i / 3) % 1); return txt(x + 90 + p * 60, y - 150 - p * 90, 'z', 26 + i * 6, C.purple, { op: (1 - p).toFixed(2) }); }).join('');
    return scaleAt(x, y, k, g);
  };
  Object.assign(LIVE, {
    // Option one: a poet's endless "Dear journal…" scroll buries the cat. Option two: the five-part form,
    // ticked off by a hummingbird while a stopwatch shows a few minutes. Trades, passes and misses all count.
    's22-quill-scroll': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#FFF8EE"/>` + ground(960, '#F2E6D6', '#E3D3BE');
      // Divider.
      out += `<line x1="960" y1="400" x2="960" y2="1040" stroke="#EADFD8" stroke-width="5" stroke-dasharray="14 12"/>`;
      /* Left: the poet and the endless scroll. */
      const pk = pop(t, T.poet, 0.7);
      const len = 120 + Math.min(640, Math.max(0, t - T.poet - 0.6) * 42);
      // Desk.
      out += scaleAt(330, 960, pk, `<rect x="160" y="760" width="340" height="24" rx="8" fill="#9B6A45"/><rect x="180" y="784" width="18" height="176" fill="#7E5434"/><rect x="462" y="784" width="18" height="176" fill="#7E5434"/>
        <rect x="400" y="716" width="34" height="44" rx="6" fill="${C.dark}"/>`);
      // Scroll: from the desk edge down to the floor and along it.
      if (pk >= 1) {
        const drop = Math.min(len, 190), run = Math.max(0, len - 190);
        let sc = `<rect x="200" y="740" width="200" height="30" fill="#FFFDF5" stroke="#E3D3BE" stroke-width="3"/>`;
        const dp = `M380,770 Q${f1(420 + Math.sin(t * 2) * 6)},${f1(770 + drop / 2)} 400,${f1(770 + drop)}`;
        sc += `<path d="${dp}" stroke="#E3D3BE" stroke-width="62" fill="none"/><path d="${dp}" stroke="#FFFDF5" stroke-width="56" fill="none"/>` + Array.from({ length: Math.floor(drop / 30) }, (_, i) => `<path d="M${f1(386 + Math.sin(t * 2) * 3 * Math.sin(i))},${790 + i * 30} q6,-6 12,0 t12,0" stroke="${C.muted}" stroke-width="2" fill="none"/>`).join('');
        if (run > 0) sc += `<rect x="380" y="928" width="${f1(run)}" height="36" rx="6" fill="#FFFDF5" stroke="#E3D3BE" stroke-width="3"/>` + Array.from({ length: Math.floor(run / 26) }, (_, i) => `<path d="M${392 + i * 26},946 q6,-6 12,0 t12,0" stroke="${C.muted}" stroke-width="2" fill="none"/>`).join('');
        sc += `<circle cx="${f1(380 + run + 6)}" cy="946" r="${run > 0 ? 22 : 0}" fill="#F6EEDC" stroke="#E3D3BE" stroke-width="3"/>`;
        out += sc;
      }
      // Poet with a quill.
      const po = { x: 200, y: 960, scale: 0.84, look: A.LOOKS.seller, seed: 3, at: T.poet + 0.2, hat: 'beret', talk: ctx.talking && t > T.poet && t < T.form };
      po.frontArm = aim(po, 290 + Math.sin(t * 9) * 26, 732 + Math.cos(t * 7) * 6);
      po.hold = `<path d="M0,0 Q26,-60 10,-96 Q-8,-50 0,0 Z" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="2"/>`;
      out += who(t, po);
      out += bub(330, 470, 'Dear journal, today I felt…', between(t, T.poet + 0.8, T.form + 2), { size: 26, italic: true, font: 'Playfair Display' });
      // Cat gets buried by the scroll, then pops out.
      const cx = 700;
      const buried = t > T.bury && t < T.bury + 3 ? 1 : 0;
      out += crit(t, 'cat', { x: cx, y: 960, scale: 0.8, seed: 5, at: T.poet + 0.9 });
      if (buried || t > T.bury + 3) {
        const k = t < T.bury + 3 ? ease(seg(t, T.bury, T.bury + 0.6)) : 1 - ease(seg(t, T.bury + 3, T.bury + 3.6));
        out += fade(k, `<path d="M${cx - 80},960 Q${cx - 60},${960 - 130 * k} ${cx},${960 - 150 * k} Q${cx + 60},${960 - 130 * k} ${cx + 80},960 Z" fill="#FFFDF5" stroke="#E3D3BE" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<path d="M${cx - 50},${930 - i * 26} q8,-6 16,0 t16,0 t16,0 t16,0" stroke="${C.muted}" stroke-width="2" fill="none"/>`).join('')}`);
        out += bub(cx, 700, 'Help… 😿', between(t, T.bury + 0.6, T.bury + 2.8), { size: 26 });
      }
      out += pill(480, 1036, '3 pages · no stop logged', C.pink, pop(t, T.bury + 1.2, 0.5), 22);
      /* Right: the five-part form. */
      const fk = pop(t, T.form, 0.7);
      const PARTS = ['Trade', 'Setup', 'Execution', 'Mindset', 'Review'];
      let f = `<rect x="1040" y="420" width="560" height="520" rx="24" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/><rect x="1040" y="420" width="560" height="70" rx="24" fill="${C.purple}"/>${txt(1320, 468, 'AGHF JOURNAL', 30, '#fff')}`;
      PARTS.forEach((p, i) => {
        const y = 530 + i * 80, done = t > T.parts[i];
        f += `<rect x="1080" y="${y - 30}" width="480" height="62" rx="14" fill="${done ? C.tealL : '#F7F3FC'}"/>${txt(1110, y + 10, (i + 1) + ' · ' + p, 28, C.dark, { a: 'start' })}${check(1520, y, pop(t, T.parts[i], 0.4), C.teal, 22)}`;
      });
      out += scaleAt(1320, 940, fk, f);
      // Hummingbird zipping between boxes.
      if (t > T.form + 0.4) {
        let i = 0; T.parts.forEach((a, j) => { if (t > a - 0.5) i = j; });
        const done = t > T.parts[4] + 0.6;
        const bx = done ? 1700 + Math.sin(t * 2) * 20 : 1500 + Math.sin(t * 7) * 10, by = done ? 560 + Math.sin(t * 3) * 14 : 520 + i * 80 + Math.cos(t * 9) * 8;
        out += critter(t, 'bird', { x: bx, y: by, scale: 0.9, seed: 2, fly: true, flip: !done, col: C.tealL });
      }
      // Stopwatch.
      const sw = pop(t, T.form + 0.3, 0.6);
      const secs = Math.min(220, Math.max(0, (t - T.form) / (T.parts[4] + 0.4 - T.form)) * 220);
      const mm = Math.floor(secs / 60), ss = String(Math.floor(secs % 60)).padStart(2, '0');
      out += scaleAt(1760, 760, sw, `<rect x="1748" y="636" width="24" height="24" rx="6" fill="${C.muted}"/><circle cx="1760" cy="760" r="100" fill="#fff" stroke="${C.peach}" stroke-width="10"/>
        <line x1="1760" y1="760" x2="${f1(1760 + Math.cos(rad(secs * 6 - 90)) * 70)}" y2="${f1(760 + Math.sin(rad(secs * 6 - 90)) * 70)}" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>${txt(1760, 820, mm + ':' + ss, 30, C.dark)}`);
      out += pill(1760, 900, 'a few minutes', DK.peach, pop(t, T.parts[4] + 0.6, 0.5), 22);
      // Entry types.
      ['trade', 'pass', 'missed opportunity'].forEach((w, i) => { out += pill([1130, 1270, 1480][i], 1010, w, [DK.teal, C.purple, DK.peach][i], pop(t, T.types + i * 0.3, 0.5), 24); });
      return out;
    },

    // A replay rep finishes and its details fly as paper planes into the journal, already filled in.
    // The trader reviews; the typewriter sleeps. Then planes from every source land in one journal.
    's22-paper-planes': (s, t, ctx) => {
      const T = s.beats;
      let out = `<rect x="0" y="360" width="1920" height="720" fill="#EEF5FC"/>` + ground(980, '#E4ECF4', '#D0DCE8');
      out += cloud(300 + (t * 10) % 300, 430, 0.6) + cloud(1500 - (t * 8) % 200, 400, 0.5);
      // Replay monitor.
      const mk = pop(t, T.monitor, 0.7);
      let m = `<rect x="110" y="430" width="520" height="330" rx="22" fill="${C.dark}"/><rect x="130" y="450" width="480" height="270" rx="10" fill="#FFF9F4"/><rect x="330" y="760" width="80" height="40" fill="${C.dark}"/><rect x="280" y="796" width="180" height="16" rx="8" fill="${C.dark}"/>
        <rect x="130" y="450" width="140" height="34" rx="10" fill="${C.purple}"/>${txt(200, 474, 'AGHF REPLAY', 18, '#fff')}`;
      const bars = series(10, 3.3, 0.4);
      bars.forEach(([o, c, hh, l], i) => { const Y = v => 690 - v * 180; m += mini(170 + i * 44, Y(o), Y(c), Y(hh), Y(l), 22, pop(t, T.monitor + 0.3 + i * 0.1, 0.4)); });
      m += stamp(450, 600, 'REP SAVED', DK.teal, pop(t, T.saved, 0.5), -10, 90, 26);
      out += scaleAt(370, 800, mk, m);
      // Journal page with fields.
      const jk = pop(t, T.monitor + 0.5, 0.7);
      const F = [['Instrument', 'MNQ'], ['Direction', 'Long'], ['Entry', '1M retest'], ['Stop', 'set'], ['Target', 'set'], ['Screenshots', '3 attached']];
      let j = `<rect x="1180" y="420" width="640" height="530" rx="26" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/><rect x="1180" y="420" width="640" height="70" rx="26" fill="${C.purple}"/>${txt(1500, 468, 'JOURNAL ENTRY · REP 12', 28, '#fff')}`;
      F.forEach(([k, v], i) => {
        const y = 540 + i * 66, land = T.planes[i] + 1.1;
        j += `${txt(1220, y + 8, k, 26, C.muted, { a: 'start', w: 700 })}<rect x="1460" y="${y - 24}" width="320" height="46" rx="10" fill="${t > land ? C.tealL : '#F4F7FB'}"/>`;
        if (t > land) { const n = Math.ceil(seg(t, land, land + 0.4) * v.length); j += txt(1480, y + 8, v.slice(0, n), 26, C.dark, { a: 'start' }); }
      });
      out += scaleAt(1500, 950, jk, j);
      // Planes: monitor → field.
      F.forEach((_, i) => {
        const a = T.planes[i], u = seg(t, a, a + 1.1);
        if (u <= 0 || u >= 1) return;
        const x0 = 600, y0 = 520, x1 = 1460, y1 = 540 + i * 66;
        const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * (160 + i * 14);
        const x2 = lerp(x0, x1, u + 0.02), y2 = lerp(y0, y1, u + 0.02) - Math.sin((u + 0.02) * Math.PI) * (160 + i * 14);
        out += plane(x, y, Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, '#fff', 1.2);
      });
      // Pigeon escorting the planes.
      if (t > T.planes[0]) {
        const u = ((t - T.planes[0]) * 0.18) % 1;
        out += critter(t, 'bird', { x: lerp(640, 1140, u), y: 560 - Math.sin(u * Math.PI) * 140, scale: 1, seed: 4, fly: true, col: '#C9C1D9' });
      } else out += crit(t, 'bird', { x: 560, y: 430, scale: 1, seed: 4, at: T.monitor + 1, col: '#C9C1D9' });
      // Trader reviewing with a mug, and the sleepy typewriter.
      const tr = { x: 960, y: 1000, scale: 0.9, look: A.LOOKS.e, seed: 6, at: T.monitor + 0.4, talk: ctx.talking && t > T.review && t < T.review + 2 };
      tr.frontArm = t > T.review && t < T.review + 2.4 ? aim(tr, 1110, 700 + Math.sin(t * 8) * 10) : { a1: 140, a2: -60 };
      tr.hold = `<rect x="-16" y="-34" width="32" height="38" rx="6" fill="${C.peach}"/><path d="M16,-26 q14,4 0,18" stroke="${C.peach}" stroke-width="5" fill="none"/>${[0, 1].map(i => `<path d="M${-6 + i * 10},${-44 - ((t * 20 + i * 8) % 20)} q4,-6 0,-12" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`).join('')}`;
      out += who(t, tr);
      out += bub(960, 610, 'Review. Don’t retype. ☕', between(t, T.review, T.sources - 0.2), { size: 26 });
      out += typewriter(t, 700, 980, t > T.monitor + 2, pop(t, T.monitor + 0.8, 0.6));
      out += stamp(1090, 880, 'REVIEWED', DK.teal, pop(t, T.review + 1.2, 0.4), -8, 64, 20);
      // Every source lands in one journal.
      const SRC = ['Academy case', 'backtest', 'replay', 'paper', 'live', 'manual'];
      SRC.forEach((w, i) => {
        const a = T.sources + i * 0.45, u = seg(t, a, a + 1);
        if (t < a) return;
        const sx = [180, 420, 180, 420, 180, 420][i], sy = [880, 880, 940, 940, 1020, 1020][i];
        out += pill(sx + 60, sy, w, [C.purple, DK.teal, C.pink, DK.peach, C.purple, DK.teal][i], pop(t, a, 0.4) * (t > s.end - 0.2 ? 0 : 1), 22);
        if (u > 0 && u < 1) { const x = lerp(sx + 60, 1500, u), y = lerp(sy, 470, u) - Math.sin(u * Math.PI) * 200; out += plane(x, y, -20 + u * 40, C.peachL, 1); }
      });
      out += pill(1500, 1010, 'every source · one journal', C.purple, pop(t, T.sources + 3.4, 0.5), 26) + sparkAt(1500, 470, T.sources + 3.2, t, C.purple);
      return out;
    },
  });

  // Standard kicker + swapping headlines for every s22 scene.
  const BUILD = Object.fromEntries(Object.keys(LIVE).map(k => [k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
