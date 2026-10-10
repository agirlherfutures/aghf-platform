/**
 * scenes-sd1.js: illustrated scene types for Strategy 2 lesson intro videos
 * (Strategy 2: Supply & Demand, Powered by Higher-Timeframe ICC™ · Module 1, Lessons 1 to 5).
 *
 * The flow: 4H story → 1H structure and location → 15M BOS #1 (a close) → 5M Correction #1, BOS #2,
 * Correction #2 (creates the zone), BOS #3 (activates it) → retest.
 * Zone boundaries, wick-vs-close invalidation, MSS as BOS #1, the 15M reclaim and limit-entry placement are
 * not settled rules, so these scenes never state them.
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

  /* Path helpers: P() makes an SVG path; partial() returns the first k (0..1) of a polyline by length. */
  const P = pts => 'M' + pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' L');
  const partial = (pts, k) => {
    if (k <= 0) return [pts[0], pts[0]];
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let rem = clamp(k) * tot; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (rem >= L[i - 1]) { out.push(pts[i]); rem -= L[i - 1]; continue; }
      const f = rem / L[i - 1];
      out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
      break;
    }
    return out;
  };
  const poly = (pts, col, w, o = {}) => `<path d="${P(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;
  const dot = (x, y, r, col, k = 1) => k <= 0 ? '' : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * k)}" fill="${col}" stroke="#fff" stroke-width="4"/>`;
  // A sticky note (pops in at k), centred at (x, y).
  const sticky = (x, y, w, h, title, sub, col, k, rot = 0) => k <= 0 ? '' : scaleAt(x, y, k, rotAt(x, y, rot,
    `<rect x="${x - w / 2 + 6}" y="${y - h / 2 + 8}" width="${w}" height="${h}" rx="8" fill="#000" opacity=".06"/><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8" fill="#FFF3C4" stroke="#EBD58A" stroke-width="3"/>
     <rect x="${x - 26}" y="${y - h / 2 - 10}" width="52" height="20" rx="4" fill="${col}" opacity=".55"/>
     ${txt(x, y - 4, title, 20, C.muted, { ls: 2 })}${txt(x, y + 26, sub, 26, col)}`));


  /* ---------- Strategy 2 chart helpers ----------
     Bars are [open, close, high, low] in price units; mk() maps them into the chart box
     (lo..hi → bottom..top) so level lines and tags use the same scale (o.vy). */
  const mk = (o) => {
    const lo = o.lo ?? 0, hi = o.hi ?? 1, m = v => (v - lo) / (hi - lo);
    const q = Object.assign({}, o, { bars: o.raw.map(b => b.map(m)) });
    q.vy = v => q.y + q.h - m(v) * q.h;
    q.X = i => geo(q).X(i);
    q.bw = geo(q).bw;
    return q;
  };
  const hline = (x1, x2, y, col, k, o = {}) => k <= 0 ? '' : `<line x1="${f1(x1)}" x2="${f1(lerp(x1, x2, ease(k)))}" y1="${f1(y)}" y2="${f1(y)}" stroke="${col}" stroke-width="${o.w || 5}" stroke-linecap="round"${o.dash === false ? '' : ` stroke-dasharray="${o.dash || '14 9'}"`}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;
  // Highlight ring around candle i (k = pop amount).
  const ring = (q, i, col, k) => {
    if (k <= 0) return '';
    const b = q.raw[i], x = q.X(i), y1 = q.vy(b[2]) - 12, y2 = q.vy(b[3]) + 12, w = q.bw + 26;
    return scaleAt(x, (y1 + y2) / 2, k, `<rect x="${f1(x - w / 2)}" y="${f1(y1)}" width="${f1(w)}" height="${f1(y2 - y1)}" rx="12" fill="${col}" opacity=".18" stroke="${col}" stroke-width="4"/>`);
  };
  const panel = (x, y, w, h, k, cx, cy) => k <= 0 ? '' : scaleAt(cx ?? x + w / 2, cy ?? y + h, k, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
  // A small arrow head at the end of a two-point line.
  const arrowTo = (x1, y1, x2, y2, col, w = 6, k = 1) => {
    if (k <= 0) return '';
    const ex = lerp(x1, x2, ease(k)), ey = lerp(y1, y2, ease(k)), a = Math.atan2(y2 - y1, x2 - x1);
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(ex)}" y2="${f1(ey)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>
      <path d="M${f1(ex + Math.cos(a) * 14)},${f1(ey + Math.sin(a) * 14)} L${f1(ex + Math.cos(a + 2.4) * 18)},${f1(ey + Math.sin(a + 2.4) * 18)} L${f1(ex + Math.cos(a - 2.4) * 18)},${f1(ey + Math.sin(a - 2.4) * 18)} Z" fill="${col}"/>`;
  };

  // Bullish example sequence. 15M: the 15M level is the swing high of bar 1 (0.57); bar 5 closes above it (BOS #1).
  const B15 = [[.30, .42, .44, .28], [.42, .55, .57, .41], [.55, .47, .56, .45], [.47, .40, .48, .38], [.40, .50, .52, .39], [.50, .66, .68, .49]];
  // 5M after BOS #1: push (0-1), Correction #1 (2-3), BOS #2 = bar 5 closes above 0.50 (high C1 pulled back from),
  // push (6), Correction #2 (7-8; bar 8 = last bearish candle = zone-forming candle), BOS #3 = bar 10 closes above 0.64,
  // then the retest back into the zone (12-13).
  const B5 = [[.32, .40, .42, .31], [.40, .48, .50, .39], [.48, .42, .49, .40], [.42, .36, .43, .34], [.36, .44, .45, .35], [.44, .56, .58, .43], [.56, .62, .64, .55],
    [.62, .57, .63, .55], [.57, .52, .58, .50], [.52, .60, .61, .51], [.60, .70, .72, .59], [.70, .74, .76, .68], [.74, .64, .75, .62], [.64, .58, .65, .56]];

  const TYPES = ['relay', 'countdown', 'cinema', 'rail-switch', 'mall-map', 'elevator', 'goal-line', 'starting-gun', 'trail-camp', 'first-pancake'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['sd1-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Module 1 · Lesson 1: Supply & Demand Through the ICC Lens ================= */
  const RX = [330, 750, 1170, 1590], RLOOK = ['a', 'b', 'c', 'e'];
  const JOBS = [['4H', 'Higher-timeframe', 'context', C.purple], ['1H', 'ICC, market structure', 'and location', DK.teal], ['15M', 'The directional', 'break', DK.peach], ['5M', 'Corrections, the zone', 'and the entry', DK.pink]];
  const BATON = `<g transform="rotate(-24)"><rect x="-62" y="-17" width="124" height="34" rx="17" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/>${txt(0, 7, 'STORY', 21, '#7A4A12', { ls: 1 })}</g>`;
  Object.assign(LIVE, {
    // Not a zone on its own: the HTF ICC story comes first. Then a relay team: each timeframe has one job, the story baton passes down.
    'sd1-relay': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Phase 1: a lonely zone, crossed out; the story book comes first.
      const lk = between(t, T.lone, T.team - 0.6, 0.6);
      if (lk > 0) {
        out += scaleAt(1060, 1000, lk, `<rect x="1000" y="720" width="120" height="280" fill="#EADFD8"/><rect x="960" y="980" width="200" height="20" rx="6" fill="#D9C9BE"/>
          <rect x="800" y="560" width="520" height="150" rx="20" fill="${C.tealL}" opacity=".55" stroke="${DK.teal}" stroke-width="4" stroke-dasharray="14 10"/>${txt(1060, 648, 'a zone on its own', 40, DK.teal, { f: 'Playfair Display', w: 700 })}`);
        out += cross(1320, 560, Math.min(lk, pop(t, T.cross, 0.5)), C.pink, 40);
        out += pill(1060, 1042, 'not stand-alone supply and demand', C.pink, Math.min(lk, pop(t, T.cross + 0.3, 0.5)), 24);
        const bk = Math.min(lk, pop(t, T.story, 0.7));
        if (bk > 0) {
          out += scaleAt(440, 820, bk, `<path d="M440,640 Q350,610 250,640 L250,820 Q350,790 440,820 Z" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
            <path d="M440,640 Q530,610 630,640 L630,820 Q530,790 440,820 Z" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
            <line x1="440" y1="640" x2="440" y2="820" stroke="${C.purple}" stroke-width="5"/>
            ${txt(345, 715, 'HTF', 36, C.purple)}${txt(535, 715, 'ICC', 36, C.purple)}
            <rect x="290" y="745" width="110" height="8" rx="4" fill="${C.purpleL}"/><rect x="480" y="745" width="110" height="8" rx="4" fill="${C.purpleL}"/>
            <rect x="290" y="765" width="90" height="8" rx="4" fill="${C.purpleL}"/><rect x="480" y="765" width="96" height="8" rx="4" fill="${C.purpleL}"/>`);
          out += pill(440, 900, 'the story comes first', C.purple, Math.min(lk, pop(t, T.story + 0.4, 0.5)), 26);
          out += arrowTo(660, 700, 770, 660, C.purple, 6, Math.min(lk, seg(t, T.story + 0.6, T.story + 1.2)));
        }
      }
      // Phase 2: the relay team.
      const tk = ease(seg(t, T.team - 0.3, T.team + 0.5));
      if (tk > 0) {
        out += fade(tk, `<rect x="0" y="1004" width="1920" height="76" fill="#F2C9B6"/>${[1028, 1056].map(y => `<rect x="0" y="${y}" width="1920" height="3" fill="#fff" opacity=".8"/>`).join('')}`);
        const n = T.jobs.filter(j => t >= j).length;
        let fly = null;
        for (let i = 1; i < 4; i++) if (t > T.jobs[i] - 0.8 && t < T.jobs[i]) fly = { from: i - 1, to: i, k: ease(seg(t, T.jobs[i] - 0.8, T.jobs[i])) };
        const holder = t > T.team + 1 ? Math.max(0, n - 1) : -1;
        const has = fly ? -1 : holder;
        RX.forEach((x, i) => {
          const o = { x, y: 1000, scale: 0.72, look: A.LOOKS[RLOOK[i]], seed: i + 2, at: T.team + i * 0.2, walking: i === has };
          if (i === has) { o.frontArm = { a1: -40, a2: -60 }; o.hold = BATON; }
          else if (fly && i === fly.to) o.frontArm = { a1: -150, a2: -170 };
          else if (t > T.jobs[3] + 1.6 && i === 3) o.frontArm = { a1: -100, a2: -110 };
          out += who(t, o);
          out += pill(x, 1042, JOBS[i][0], JOBS[i][3], pop(t, T.team + 0.3 + i * 0.2, 0.5), 24);
        });
        if (fly) {
          const ax = RX[fly.from] + 64, bx = RX[fly.to] + 64, y = 798;
          const bxw = lerp(ax, bx, fly.k), byw = y - Math.sin(fly.k * Math.PI) * 140;
          out += `<g transform="translate(${f1(bxw)},${f1(byw)}) scale(.72) rotate(${f1(fly.k * 360)})">${BATON}</g>`;
        }
        JOBS.forEach(([tf, a, b, col], i) => {
          const k = pop(t, T.jobs[i], 0.6);
          if (k <= 0) return;
          const x = RX[i];
          out += scaleAt(x, 620, k, `<rect x="${x - 190}" y="420" width="380" height="200" rx="24" fill="#fff" stroke="${col}" stroke-width="5"/>
            <path d="M${x - 190},484 L${x - 190},444 Q${x - 190},420 ${x - 166},420 L${x + 166},420 Q${x + 190},420 ${x + 190},444 L${x + 190},484 Z" fill="${col}"/>
            ${txt(x, 466, tf, 38, '#fff')}${txt(x, 538, a, 28, C.text, { w: 800 })}${txt(x, 578, b, 28, C.text, { w: 800 })}`);
          if (i > 0) out += arrowTo(x - 214, 520, x - 202, 520, C.muted, 5, k);
        });
      }
      return out;
    },

    // The core sequence as a launch countdown: 3 · 2 · 1 · 1. The chart builds it on the left (15M, then 5M).
    'sd1-countdown': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const pk = pop(t, T.board, 0.7);
      out += panel(90, 380, 940, 610, pk, 560, 990);
      // ---- Chart ----
      if (pk > 0 && t < T.m5) {
        // 15M: BOS #1 closes above the 15M level.
        const q = mk({ raw: B15, lo: 0.2, hi: 0.8, x: 150, y: 450, w: 820, h: 460, n: 8, maxBody: 44 });
        const k15 = 1 - seg(t, T.m5 - 0.4, T.m5);
        let g = txt(130, 432, '15M', 30, DK.peach, { a: 'start' }) + pill(890, 422, 'HTF story: bullish', DK.teal, pop(t, T.bos1, 0.5), 20);
        g += hline(q.X(1) - 20, q.x + q.w, q.vy(0.57), C.purple, seg(t, T.bos1 + 1.2, T.bos1 + 2));
        g += txt(q.x + q.w - 4, q.vy(0.57) + 34, '15M level', 22, C.purple, { a: 'end', op: clamp(seg(t, T.bos1 + 1.6, T.bos1 + 2.2)) });
        g += chart(t, Object.assign({}, q, { panel: false, times: [0, 1, 2, 3, 4].map(i => T.bos1 + 0.2 + i * 0.3).concat([T.bos1c]),
          tags: [{ i: 5, text: 'BOS #1 · 15M close ✓', col: DK.teal, at: T.bos1c + 0.4, off: 40, fs: 22 }] }));
        out += fade(k15, g);
      } else if (pk > 0) {
        // 5M: the rest of the sequence.
        const q = mk({ raw: B5, lo: 0.2, hi: 0.82, x: 150, y: 440, w: 800, h: 480, n: 14, maxBody: 34 });
        const k5 = seg(t, T.m5, T.m5 + 0.4);
        let g = txt(130, 432, '5M', 30, DK.pink, { a: 'start' });
        g += hline(q.x, q.x + q.w, q.vy(0.26), C.purple, seg(t, T.m5, T.m5 + 0.6), { w: 4, op: 0.6 });
        g += txt(q.x + q.w, q.vy(0.26) + 30, '15M break', 20, C.purple, { a: 'end', op: 0.7 * k5 });
        // Zone band from the zone-forming candle (potential until BOS #3).
        const zk = seg(t, T.zone, T.zone + 0.6);
        if (zk > 0) {
          const act = seg(t, T.bos3, T.bos3 + 0.5);
          const x0 = q.X(8) - q.bw / 2 - 8;
          out += '';
          g += `<rect x="${f1(x0)}" y="${f1(q.vy(0.58))}" width="${f1((q.x + q.w - x0) * ease(zk))}" height="${f1(q.vy(0.50) - q.vy(0.58))}" fill="${C.teal}" opacity="${(0.16 + act * 0.16).toFixed(2)}"${act < 1 ? ' stroke="' + DK.teal + '" stroke-width="2" stroke-dasharray="8 8"' : ''}/>`;
        }
        g += hline(q.X(1), q.X(5) + 22, q.vy(0.50), DK.teal, seg(t, T.bos2 - 0.8, T.bos2 - 0.2), { w: 4 });
        g += hline(q.X(6), q.X(10) + 22, q.vy(0.64), DK.teal, seg(t, T.bos3 - 0.8, T.bos3 - 0.2), { w: 4 });
        const times = [T.m5 + 0.2, T.m5 + 0.5, T.c1 - 0.4, T.c1, T.bos2 - 0.6, T.bos2, T.c2 - 1.0, T.c2 - 0.4, T.c2, T.bos3 - 0.8, T.bos3, T.retest - 1.2, T.retest - 0.6, T.retest];
        g += chart(t, Object.assign({}, q, { panel: false, times, tags: [
          { i: 3, text: 'Correction #1', col: DK.peach, at: T.c1 + 0.4, pos: 'below', off: 30, fs: 20 },
          { i: 5, text: 'BOS #2', col: DK.teal, at: T.bos2 + 0.3, off: 40, fs: 20 },
          { i: 8, text: 'Correction #2', col: DK.peach, at: T.c2 + 0.3, pos: 'below', off: 40, fs: 20 },
          { i: 10, text: 'BOS #3', col: DK.teal, at: T.bos3 + 0.3, off: 40, fs: 20 },
          { i: 13, text: 'retest', col: C.purple, at: T.retest + 0.4, pos: 'below', off: 70, fs: 20 }] }));
        g += ring(q, 8, DK.teal, pop(t, T.zone, 0.5));
        g += pill(807, 790, t < T.bos3 ? 'ZONE · potential' : 'ZONE · active ✓', t < T.bos3 ? C.muted : DK.teal, pop(t, T.zone + 0.3, 0.5), 20);
        out += fade(k5, g);
      }
      // ---- The countdown board ----
      const bk = pop(t, T.board + 0.3, 0.7);
      if (bk > 0) {
        const rows = [[3, 'BREAKS', [T.bos1c, T.bos2, T.bos3], C.purple], [2, 'CORRECTIONS', [T.c1, T.c2], DK.peach], [1, 'ZONE', [T.zone], DK.teal], [1, 'RETEST', [T.retest], C.pink]];
        let b = `<rect x="1080" y="390" width="750" height="330" rx="26" fill="${C.dark}"/>${txt(1455, 432, 'LAUNCH COUNTDOWN', 22, C.gold, { ls: 4 })}`;
        rows.forEach(([nn, lab, beats, col], r) => {
          const y = 490 + r * 64, on = pop(t, T.rows[r], 0.5);
          const full = beats.every(bt => t >= bt);
          b += `<circle cx="1140" cy="${y}" r="26" fill="${full ? col : '#4A3329'}"/>${txt(1140, y + 11, nn, 30, '#fff')}`;
          b += txt(1186, y + 11, lab, 30, on > 0 ? '#fff' : '#7A5C50', { a: 'start', ls: 2 });
          beats.forEach((bt, j) => {
            const lit = t >= bt;
            const px = 1780 - (beats.length - 1 - j) * 52;
            const zonePot = lab === 'ZONE' && lit && t < T.bos3;
            b += `<circle cx="${px}" cy="${y}" r="17" fill="${lit ? (zonePot ? 'none' : col) : '#4A3329'}" stroke="${lit ? col : '#5E463B'}" stroke-width="4"${zonePot ? ' stroke-dasharray="6 5"' : ''}/>`;
          });
        });
        out += scaleAt(1455, 720, bk, b);
      }
      // ---- The rocket ----
      const rk = pop(t, T.board + 0.6, 0.7);
      if (rk > 0) {
        const lift = ease(seg(t, T.retest + 0.4, T.retest + 1.6)) * 40;
        const fl = t > T.retest + 0.2 ? 1 : 0;
        let r = `<rect x="1330" y="975" width="250" height="20" rx="8" fill="${C.muted}"/><rect x="1345" y="930" width="16" height="50" fill="${C.muted}"/><rect x="1549" y="930" width="16" height="50" fill="${C.muted}"/>`;
        let body = `<g transform="translate(0,${f1(-lift)})">
          ${fl ? `<path d="M1430,955 Q1455,${f1(1010 + Math.sin(t * 30) * 10)} 1480,955 Z" fill="${C.gold}"/><path d="M1440,955 Q1455,${f1(990 + Math.sin(t * 24) * 6)} 1470,955 Z" fill="#fff" opacity=".8"/>` : ''}
          <path d="M1400,950 L1380,975 L1420,955 Z M1510,950 L1530,975 L1490,955 Z" fill="${C.pink}"/>
          <path d="M1410,955 L1410,820 Q1410,750 1455,730 Q1500,750 1500,820 L1500,955 Z" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
          <circle cx="1455" cy="830" r="22" fill="${C.tealL}" stroke="${C.purple}" stroke-width="5"/>
          <path d="M1424,770 Q1455,738 1486,770 Z" fill="${C.pink}"/></g>`;
        out += scaleAt(1455, 995, rk, r + body);
        out += pill(1455, 1042, 'the entry lives at the retest', C.pink, pop(t, T.retest + 0.6, 0.5), 22);
        if (t > T.retest + 0.4) out += A.sparkle(1455, 900, T.retest + 0.4, t);
      }
      // ---- Not at BOS #1 or BOS #2 ----
      out += pill(330, 1042, 'BOS #1: not an entry ✗', C.pink, pop(t, T.not, 0.5), 22);
      out += pill(770, 1042, 'BOS #2: not an entry ✗', C.pink, pop(t, T.not + 0.6, 0.5), 22);
      return out;
    },
  });

  /* ================= Module 1 · Lesson 2: The 4H: Establish the Story ================= */
  const curtain = (x0, x1, col, dk) => {
    let g = `<rect x="${f1(Math.min(x0, x1))}" y="370" width="${f1(Math.abs(x1 - x0))}" height="500" fill="${col}"/>`;
    const n = Math.max(1, Math.round(Math.abs(x1 - x0) / 40));
    for (let i = 0; i < n; i++) g += `<rect x="${f1(Math.min(x0, x1) + i * Math.abs(x1 - x0) / n + 6)}" y="370" width="8" height="500" fill="${dk}" opacity=".35"/>`;
    return g;
  };
  Object.assign(LIVE, {
    // A cinema plays the 4H story: higher low, push toward the prior high, break to a higher high (bullish), now pulling back.
    'sd1-cinema': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#EFE2F0', '#DCCBE2');
      // Screen.
      const sk = pop(t, T.screen, 0.8);
      out += scaleAt(960, 870, sk, `<rect x="330" y="356" width="1260" height="528" rx="18" fill="${C.dark}"/><rect x="350" y="376" width="1220" height="488" rx="8" fill="#FFFDF9"/>`);
      if (sk > 0) {
        out += txt(380, 420, '4H', 32, C.purple, { a: 'start', op: clamp(sk) });
        // Projector beam.
        const bm = ease(seg(t, T.play, T.play + 0.8));
        if (bm > 0) out += `<path d="M940,930 L380,400 L1540,400 L980,930 Z" fill="#FFF3C4" opacity="${(0.22 * bm).toFixed(2)}"/>`;
        // Story path.
        const PL = [470, 820], PH = [650, 560], HL = [820, 730], AP = [1000, 590], HH = [1180, 450], NOW = [1390, 640];
        const k1 = ease(seg(t, T.play + 0.6, T.play + 2.6)), k2 = ease(seg(t, T.hl, T.hl + 2)), k3 = ease(seg(t, T.hh, T.hh + 1.4)), k4 = ease(seg(t, T.now, T.now + 1.4));
        out += hline(650, 1540, 560, C.muted, seg(t, T.play + 2.4, T.play + 3.2), { w: 4 });
        out += pill(560, 520, 'prior high', C.muted, pop(t, T.play + 2.6, 0.5), 22);
        if (k1 > 0) out += poly(partial([PL, PH, HL], k1), '#A08B80', 7);
        if (k2 > 0) out += poly(partial([HL, AP], k2), C.teal, 9);
        if (k3 > 0) out += poly(partial([AP, HH], k3), C.teal, 9);
        if (k4 > 0) out += poly(partial([HH, NOW], k4), C.gold, 8, { dash: '16 12' });
        out += pill(820, 780, 'higher low', DK.teal, pop(t, T.hl + 0.4, 0.5), 22);
        out += pill(1050, 512, 'broke the prior high', DK.teal, pop(t, T.hh + 1.2, 0.5), 20);
        out += pill(1180, 410, 'higher high', DK.teal, pop(t, T.hh + 1.6, 0.5), 22);
        out += pill(800, 440, 'BULLISH STORY', DK.teal, pop(t, T.hh + 3, 0.6), 30);
        if (t > T.hh + 3) out += A.sparkle(800, 440, T.hh + 3, t);
        const nk = pop(t, T.now + 1.2, 0.5);
        if (nk > 0) {
          const pulse = 1 + Math.sin(t * 5) * 0.12;
          out += `<circle cx="${NOW[0]}" cy="${NOW[1]}" r="${f1(26 * pulse * nk)}" fill="${C.pink}" opacity=".25"/>` + dot(NOW[0], NOW[1], 13, C.pink, nk);
          out += pill(1390, 700, 'now · pulling back', C.pink, pop(t, T.now + 1.4, 0.5), 22);
        }
      }
      // Curtains open.
      const ck = ease(seg(t, T.screen + 0.4, T.screen + 2));
      if (sk > 0) {
        out += curtain(330, lerp(960, 400, ck), C.pink, DK.pink) + curtain(1590, lerp(960, 1520, ck), C.pink, DK.pink);
        out += `<rect x="310" y="350" width="1300" height="34" rx="12" fill="${DK.pink}"/>`;
        out += pill(960, 367, 'NOW SHOWING · THE 4H STORY', C.dark, pop(t, T.screen + 0.6, 0.5), 20, C.gold);
      }
      // Seats and the audience.
      let seats = '';
      for (let x = 150; x < 1800; x += 150) seats += `<rect x="${x}" y="924" width="120" height="76" rx="22" fill="${C.purple}"/><rect x="${x + 10}" y="992" width="100" height="10" fill="${DK.purple}"/>`;
      out += crit(t, 'owl', { x: 510, y: 940, scale: 0.6, seed: 2, at: T.screen + 0.6 });
      out += crit(t, 'cat', { x: 1410, y: 940, scale: 0.55, seed: 5, at: T.screen + 0.8, talk: ctx.talking && t < T.play });
      out += seats;
      // Popcorn.
      out += scaleAt(1520, 930, pop(t, T.play, 0.5), `<path d="M1494,880 L1546,880 L1538,950 L1502,950 Z" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<rect x="${1500 + i * 11}" y="880" width="6" height="70" fill="${C.pink}" opacity=".6"/>`).join('')}${[1500, 1516, 1532, 1508, 1526].map((x, i) => `<circle cx="${x}" cy="${872 - (i > 2 ? 12 : 0)}" r="11" fill="#FFF3C4"/>`).join('')}`);
      out += bub(1480, 780, 'What’s the story? 🍿', between(t, T.screen + 1.2, T.play - 0.2), { size: 26 });
      return out;
    },

    // A railway switch: the 4H story sets the track (bullish → demand, bearish → supply). The train still waits for the sequence.
    'sd1-rail-switch': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(520);
      const MAIN = [[0, 760], [760, 760]], UP = [[760, 760], [960, 620], [1920, 620]], LO = [[760, 760], [960, 900], [1920, 900]];
      const rails = (pts, col, op = 1) => {
        const sl = `<path d="${P(pts)}" fill="none" stroke="#B8835A" stroke-width="44" stroke-dasharray="10 24" opacity="${(0.7 * op).toFixed(2)}"/>`;
        return sl + poly(pts.map(p => [p[0], p[1] - 12]), col, 6, { op }) + poly(pts.map(p => [p[0], p[1] + 12]), col, 6, { op });
      };
      const tk = ease(seg(t, T.tracks, T.tracks + 1));
      const sideK = seg(t, T.bull, T.bull + 0.4), bearK = seg(t, T.bear, T.bear + 0.4);
      const boardK = seg(t, T.ctx - 0.2, T.ctx + 0.4);
      if (tk > 0) {
        const dim = 1 - boardK * 0.6;
        out += rails(partial(MAIN, Math.min(1, tk * 2)), '#8E8090');
        out += rails(partial(UP, tk), bearK > 0 ? C.pink : '#8E8090', bearK > 0 ? dim : (1 - sideK * 0.5) * dim);
        out += rails(partial(LO, tk), sideK > 0 && bearK <= 0 ? DK.teal : '#8E8090', sideK > 0 && bearK <= 0 ? dim : (bearK > 0 ? 0.5 : 1) * dim);
      }
      // Station signs.
      const sign = (x, y, top, sub, col, k, op) => k <= 0 ? '' : fade(op, scaleAt(x, y, k, `<rect x="${x - 170}" y="${y - 44}" width="340" height="88" rx="16" fill="${col}"/>${txt(x, y - 4, top, 32, '#fff', { ls: 3 })}${txt(x, y + 30, sub, 22, '#fff', { w: 700 })}`));
      out += sign(1640, 548, 'SUPPLY', 'look here when bearish', C.pink, pop(t, T.tracks + 0.8, 0.6), 1 - boardK * 0.8);
      out += sign(1640, 790, 'DEMAND', 'look here when bullish', DK.teal, pop(t, T.tracks + 1, 0.6), 1 - boardK * 0.8);
      // Train waiting on the main line.
      const trk = pop(t, T.tracks + 0.4, 0.6);
      if (trk > 0) {
        const x = 250, y = 748;
        let g = `<rect x="${x - 150}" y="${y - 210}" width="110" height="170" rx="12" fill="${C.purple}"/><rect x="${x - 132}" y="${y - 192}" width="74" height="50" rx="8" fill="#E8F8F6"/>
          <rect x="${x - 40}" y="${y - 140}" width="190" height="100" rx="40" fill="${DK.purple}"/><rect x="${x + 96}" y="${y - 196}" width="32" height="60" rx="6" fill="${C.dark}"/>
          <rect x="${x - 160}" y="${y - 220}" width="130" height="18" rx="8" fill="${C.dark}"/>
          <path d="M${x + 150},${y - 60} L${x + 186},${y - 20} L${x + 150},${y - 20} Z" fill="${C.gold}"/>
          ${[-110, -30, 60, 120].map(wx => `<circle cx="${x + wx}" cy="${y - 22}" r="${wx > 50 ? 20 : 26}" fill="${C.dark}"/><circle cx="${x + wx}" cy="${y - 22}" r="9" fill="#D9CFC8"/>`).join('')}
          <rect x="${x - 128}" y="${y - 126}" width="66" height="30" rx="6" fill="#fff"/>${txt(x - 95, y - 104, 'SETUP', 18, C.purple)}`;
        for (let i = 0; i < 3; i++) {
          const p = ((t * 0.5 + i / 3) % 1);
          g += `<circle cx="${f1(x + 112 + p * 40)}" cy="${f1(y - 210 - p * 120)}" r="${f1(14 + p * 20)}" fill="#fff" opacity="${(0.8 * (1 - p)).toFixed(2)}"/>`;
        }
        out += scaleAt(x, y, trk, g);
      }
      // Signal: red until the sequence completes.
      const sg = pop(t, T.wait, 0.6);
      if (sg > 0) out += scaleAt(520, 760, sg, `<rect x="512" y="560" width="16" height="200" fill="${C.dark}"/><rect x="484" y="500" width="72" height="130" rx="16" fill="${C.dark}"/><circle cx="520" cy="534" r="22" fill="${C.pink}"/><circle cx="520" cy="594" r="22" fill="#4A3329"/>`)
        + `<circle cx="520" cy="534" r="${f1(36 + Math.sin(t * 5) * 4)}" fill="${C.pink}" opacity="${(0.25 * clamp(sg)).toFixed(2)}"/>`;
      // Lever + switchman.
      const lv = pop(t, T.tracks + 0.6, 0.6);
      const ang = sideK > 0 ? (bearK > 0 ? lerp(24, -24, ease(bearK)) : lerp(0, 24, ease(sideK))) : 0;
      const top = [760 + Math.sin(rad(ang)) * 110, 960 - Math.cos(rad(ang)) * 110];
      out += scaleAt(760, 1000, lv, `<rect x="720" y="960" width="80" height="40" rx="8" fill="${C.muted}"/><line x1="760" y1="960" x2="${f1(top[0])}" y2="${f1(top[1])}" stroke="${C.dark}" stroke-width="12" stroke-linecap="round"/><circle cx="${f1(top[0])}" cy="${f1(top[1])}" r="16" fill="${C.pink}"/>`);
      const sm = { x: 640, y: 1000, scale: 0.85, look: A.LOOKS.c, seed: 3, at: T.tracks + 0.5, hat: 'cap', talk: ctx.talking && t > T.wait };
      if (t > T.bull - 0.3 && t < T.ctx) sm.frontArm = aim(sm, top[0], top[1]);
      out += who(t, sm);
      // The story placard.
      const st = between(t, T.bull, T.wait - 0.4, 0.5);
      if (st > 0) {
        const bear = bearK > 0.5;
        out += scaleAt(1110, 1000, st, `<rect x="900" y="952" width="420" height="92" rx="18" fill="${bear ? C.pink : DK.teal}"/>${txt(1110, 990, '4H STORY', 22, '#fff', { ls: 3 })}${txt(1110, 1030, bear ? 'bearish → supply' : 'bullish → demand', 30, '#fff', { f: 'Playfair Display', w: 700 })}`);
      }
      // Context, not an entry.
      const bdk = pop(t, T.ctx, 0.7);
      if (bdk > 0) {
        let b = `<rect x="1040" y="380" width="800" height="400" rx="26" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/>
          <line x1="1440" y1="410" x2="1440" y2="${t > T.wait ? 640 : 750}" stroke="#EFE3DA" stroke-width="3"/>`;
        b += txt(1240, 432, 'THE 4H GIVES YOU', 22, DK.teal, { ls: 2 });
        ['the story', 'the direction', 'which side to look for'].forEach((w, i) => b += txt(1070, 492 + i * 52, '✓ ' + w, 28, C.text, { a: 'start', w: 700 }));
        out += scaleAt(1440, 780, bdk, b);
        const nk = pop(t, T.not, 0.6);
        if (nk > 0) {
          let g = txt(1640, 432, 'IT DOESN’T GIVE YOU', 22, C.pink, { ls: 2 });
          ['an entry', 'a zone', 'a way to skip', 'the sequence'].forEach((w, i) => g += txt(1468, 492 + i * 52, (i < 3 ? '✗ ' : '   ') + w, 28, C.text, { a: 'start', w: 700 }));
          out += fade(nk, g);
        }
        const wk = pop(t, T.wait + 0.4, 0.6);
        if (wk > 0) {
          let g = `<line x1="1070" x2="1810" y1="660" y2="660" stroke="#EFE3DA" stroke-width="3"/>${txt(1440, 700, 'CARRY THE STORY DOWN, THEN WAIT FOR', 20, C.muted, { ls: 2 })}`;
          [['1H read', 1150], ['15M BOS #1', 1330], ['5M sequence', 1540], ['retest', 1730]].forEach(([w, x], i) => g += pill(x, 742, w, i % 2 ? C.purple : DK.peach, pop(t, T.wait + 0.8 + i * 0.4, 0.5), 20));
          out += fade(wk, g);
        }
      }
      out += bub(380, 470, 'Which track? 🤔', between(t, T.tracks + 1.2, T.bull - 0.2), { size: 26 });
      out += bub(380, 470, 'Carry it down ⬇️', between(t, T.wait + 0.6, s.end), { size: 26 });
      return out;
    },
  });

  /* ================= Module 1 · Lesson 3: The 1H: Find the Relevant Structure ================= */
  // The lesson's 1H swings (internal moves at 3, 4, 7, 8; previous swing low 9, swing high 10; now 11), mapped into the directory board.
  const SW1H = [[40, 50], [95, 112], [140, 84], [180, 124], [200, 112], [245, 160], [295, 130], [330, 162], [350, 150], [400, 204], [450, 170], [500, 192]]
    .map(([x, y]) => [440 + (x - 40) * 1.6, 480 + (y - 50) * 2.35]);
  Object.assign(LIVE, {
    // A mall directory: the 1H has three jobs (ICC, structure, location). Then the floor map: main swings only, "you are here".
    'sd1-mall-map': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3ECF4', '#E2D7E6');
      // Kiosk.
      const kk = pop(t, T.board, 0.8);
      out += scaleAt(840, 1000, kk, `<rect x="560" y="960" width="40" height="40" fill="${C.muted}"/><rect x="1080" y="960" width="40" height="40" fill="${C.muted}"/>
        <rect x="380" y="380" width="920" height="590" rx="26" fill="${C.dark}"/><rect x="398" y="448" width="884" height="504" rx="12" fill="#FFFDF9"/>
        ${txt(840, 428, '1H DIRECTORY', 30, C.gold, { ls: 5 })}`);
      // Phase 1: three jobs.
      const jk = 1 - seg(t, T.map - 0.4, T.map);
      if (kk > 0 && jk > 0) {
        const rows = [['ICC', 'Which chapter is the HTF ICC in?', C.purple], ['MARKET STRUCTURE', 'Bullish, bearish or consolidating?', DK.teal], ['LOCATION', 'Where is price vs the previous 1H swings?', DK.peach]];
        let g = '';
        rows.forEach(([a, b, col], i) => {
          const k = pop(t, T.jobs[i], 0.5);
          if (k <= 0) return;
          const y = 540 + i * 140;
          g += scaleAt(470, y, k, `<circle cx="470" cy="${y}" r="40" fill="${col}"/>${txt(470, y + 14, i + 1, 40, '#fff')}`)
            + fade(k, txt(536, y - 6, a, 36, col, { a: 'start', ls: 1 }) + txt(536, y + 36, b, 28, C.text, { a: 'start', w: 700 }));
        });
        out += fade(jk, g);
      }
      // Phase 2: the 1H floor map.
      if (t > T.map - 0.2) {
        const mk2 = seg(t, T.map - 0.2, T.map + 0.3);
        const pk = ease(seg(t, T.map, T.map + 2.4));
        let g = '';
        for (let x = 470; x < 1280; x += 80) g += `<line x1="${x}" x2="${x}" y1="460" y2="940" stroke="#F3EAE2" stroke-width="2"/>`;
        g += poly(partial(SW1H, pk), DK.teal, 8);
        out += fade(mk2, g);
        // Internal wiggles.
        const ik = pop(t, T.map + 2.6, 0.5);
        [[3, 4], [7, 8]].forEach(([a, b]) => {
          const x = (SW1H[a][0] + SW1H[b][0]) / 2, y = Math.min(SW1H[a][1], SW1H[b][1]) - 46;
          out += pill(x, y, 'internal ✗', C.muted, ik, 18);
        });
        // Previous swing low, then swing high.
        const lw = SW1H[9], hi = SW1H[10], now = SW1H[11];
        const pin = (x, y, col, k, up) => k <= 0 ? '' : scaleAt(x, y, k, `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + (up ? -44 : 44)}" stroke="${C.dark}" stroke-width="4"/><circle cx="${x}" cy="${y + (up ? -52 : 52)}" r="14" fill="${col}" stroke="#fff" stroke-width="4"/>`);
        out += hline(lw[0], 1400, lw[1], C.gold, seg(t, T.low, T.low + 0.6), { w: 5, dash: false });
        out += pin(lw[0], lw[1], C.gold, pop(t, T.low, 0.5), false);
        out += pill(1560, lw[1], 'PREVIOUS 1H SWING LOW', DK.peach, pop(t, T.low + 0.3, 0.5), 20);
        out += hline(hi[0], 1400, hi[1], C.gold, seg(t, T.high, T.high + 0.6), { w: 5, dash: false });
        out += pin(hi[0], hi[1], C.gold, pop(t, T.high, 0.5), true);
        out += pill(1560, hi[1], 'PREVIOUS 1H SWING HIGH', DK.peach, pop(t, T.high + 0.3, 0.5), 20);
        // You are here.
        const nk = pop(t, T.now, 0.6);
        if (nk > 0) {
          const pulse = 1 + Math.sin(t * 5) * 0.12;
          out += `<circle cx="${now[0]}" cy="${now[1]}" r="${f1(28 * pulse * nk)}" fill="${C.pink}" opacity=".25"/>` + dot(now[0], now[1], 14, C.pink, nk);
          out += pill(now[0] - 30, 916, 'YOU ARE HERE · between', C.pink, pop(t, T.now + 0.3, 0.5), 20);
        }
      }
      // Shopper.
      const sh = { x: 1700, y: 1000, scale: 0.9, look: A.LOOKS.d, seed: 4, flip: true, at: T.board + 0.4, talk: ctx.talking && (t < T.jobs[0] || t > T.now) };
      if (t > T.jobs[0] && t < T.map) sh.frontArm = aim(sh, 1310, 640);
      if (t > T.low && t < T.now + 1.5) sh.frontArm = aim(sh, 1620, 760);
      out += who(t, sh);
      out += bub(1620, 560, 'Where am I? 🗺️', between(t, T.board + 0.8, T.jobs[0] - 0.3), { size: 26, tail: 'right' });
      out += bub(1620, 560, 'Main swings only.', between(t, T.map + 0.6, T.low - 0.3), { size: 26, tail: 'right' });
      out += bub(1620, 560, 'Stuck in between 🤔', between(t, T.now + 0.6, s.end), { size: 26, tail: 'right' });
      return out;
    },

    // An elevator stuck between two floors (the previous 1H swings): don't force the doors. Direction with the story? Watch the 15M.
    'sd1-elevator': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const SX0 = 700, SX1 = 1100, TOPF = 470, BOTF = 920;
      const shk = pop(t, T.shaft, 0.8);
      if (shk > 0) {
        let g = `<rect x="${SX0}" y="380" width="${SX1 - SX0}" height="620" fill="#EEE6F3"/>
          <rect x="${SX0 - 16}" y="380" width="16" height="620" fill="${C.muted}"/><rect x="${SX1}" y="380" width="16" height="620" fill="${C.muted}"/>
          <line x1="${SX0 + 40}" x2="${SX0 + 40}" y1="380" y2="1000" stroke="#D3C6DC" stroke-width="4"/><line x1="${SX1 - 40}" x2="${SX1 - 40}" y1="380" y2="1000" stroke="#D3C6DC" stroke-width="4"/>
          <rect x="${SX0 - 220}" y="${TOPF}" width="${SX1 - SX0 + 440}" height="24" rx="6" fill="${C.gold}"/>
          <rect x="${SX0 - 220}" y="${BOTF}" width="${SX1 - SX0 + 440}" height="24" rx="6" fill="${C.gold}"/>`;
        out += scaleAt(900, 1000, shk, g);
        out += pill(430, TOPF - 34, 'PREVIOUS 1H SWING HIGH', DK.peach, pop(t, T.shaft + 0.6, 0.5), 22);
        out += pill(430, BOTF - 34, 'PREVIOUS 1H SWING LOW', DK.peach, pop(t, T.shaft + 0.8, 0.5), 22);
      }
      // The car: jiggles between the floors (no direction) until the direction beat, then eases upward a little.
      const ck = pop(t, T.shaft + 0.4, 0.7);
      if (ck > 0) {
        const dir = ease(seg(t, T.dir, T.dir + 1.6));
        const jig = (1 - dir) * (Math.sin(t * 3.1) * 16 + Math.sin(t * 7.3) * 6);
        const cy = 600 + jig - dir * 30;
        let g = `<rect x="740" y="${f1(cy)}" width="320" height="250" rx="14" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
          <rect x="770" y="${f1(cy + 70)}" width="128" height="166" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="3"/><rect x="902" y="${f1(cy + 70)}" width="128" height="166" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="3"/>
          <rect x="820" y="${f1(cy + 14)}" width="160" height="46" rx="10" fill="${C.dark}"/>`;
        const up = dir > 0.2;
        g += `<path d="M860,${f1(cy + 48)} L874,${f1(cy + 24)} L888,${f1(cy + 48)} Z" fill="${up ? C.teal : '#5E463B'}"/><path d="M912,${f1(cy + 24)} L926,${f1(cy + 48)} L940,${f1(cy + 24)} Z" fill="#5E463B"/>`;
        out += scaleAt(900, 1000, ck, g);
        // Chop sparkline under the car.
        out += pill(900, 990, up ? '1H direction agrees with the story ✓' : 'no meaningful direction', up ? DK.teal : C.muted, pop(t, T.between + 1, 0.5), 22);
      }
      // Don't force it.
      const fk = between(t, T.stamp, T.dir - 0.4, 0.4);
      out += stamp(900, 720, 'DON’T FORCE IT', C.pink, fk, -10, 150, 34);
      // 4H story badge.
      out += pill(430, 690, '4H STORY: BULLISH', DK.teal, pop(t, T.bull, 0.5), 24);
      out += pill(430, 750, 'still: don’t force it', C.pink, between(t, T.bull + 1.2, T.dir - 0.4), 22);
      // The 15M monitor.
      const mk3 = pop(t, T.watch, 0.7);
      if (mk3 > 0) {
        let g = `<rect x="1430" y="400" width="420" height="280" rx="20" fill="${C.dark}"/><rect x="1446" y="416" width="388" height="248" rx="10" fill="#fff"/>
          <rect x="1630" y="680" width="20" height="40" fill="${C.muted}"/>${txt(1466, 452, '15M', 24, DK.peach, { a: 'start' })}`;
        out += scaleAt(1640, 720, mk3, g);
        const q = mk({ raw: B15.slice(0, 5), lo: 0.25, hi: 0.75, x: 1470, y: 470, w: 320, h: 170, n: 7, maxBody: 26 });
        out += hline(q.X(1) - 10, 1820, q.vy(0.57), C.purple, seg(t, T.watch + 0.4, T.watch + 1), { w: 4 });
        out += chart(t, Object.assign({}, q, { panel: false, wick: 4, times: [0, 1, 2, 3, 4].map(i => T.watch + 0.6 + i * 0.25) }));
        out += pill(1640, 760, 'watch for BOS #1', DK.peach, pop(t, T.watch + 1.6, 0.5), 22);
      }
      // The trader: reaches with a crowbar, then waits; later watches the 15M with binoculars.
      const pr = { x: 1300, y: 1000, scale: 0.9, look: A.LOOKS.b, seed: 2, flip: t < T.watch, at: T.shaft + 0.6, talk: ctx.talking && t > T.between };
      if (t > T.force && t < T.stamp + 0.6) { pr.frontArm = aim(pr, 1080, 760); pr.hold = `<g transform="rotate(-30)"><rect x="-8" y="-70" width="16" height="120" rx="6" fill="${C.muted}"/><path d="M-8,-70 Q-30,-80 -24,-96" stroke="${C.muted}" stroke-width="14" fill="none" stroke-linecap="round"/></g>`; }
      if (t > T.watch + 0.2) { pr.frontArm = { a1: -110, a2: -170 }; pr.hold = `<g transform="translate(-6,-4)"><rect x="-26" y="-14" width="22" height="26" rx="8" fill="${C.dark}"/><rect x="4" y="-14" width="22" height="26" rx="8" fill="${C.dark}"/><rect x="-6" y="-8" width="12" height="10" fill="${C.dark}"/></g>`; }
      out += who(t, pr);
      out += bub(1380, 580, 'Pry it open? 🤔', between(t, T.force + 0.2, T.stamp - 0.1), { size: 26 });
      out += bub(1380, 580, 'OK. I’ll wait. ☕', between(t, T.stamp + 0.8, T.dir - 0.4), { size: 26 });
      return out;
    },
  });

  /* ================= Module 1 · Lesson 4: The 15M: First Directional Break ================= */
  // 15M with a wick-only poke (bar 4) and the real close (bar 5).
  const B15W = [[.30, .42, .44, .28], [.42, .55, .57, .41], [.55, .47, .56, .45], [.47, .40, .48, .38], [.40, .52, .66, .39], [.52, .70, .72, .51]];
  Object.assign(LIVE, {
    // Goal-line check: a wick pokes over the line and comes back (no goal). A 15M candle closing beyond the level is BOS #1.
    'sd1-goal-line': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const pk = pop(t, T.chart, 0.7);
      out += panel(90, 380, 880, 610, pk, 530, 990);
      if (pk > 0) {
        const q = mk({ raw: B15W, lo: 0.22, hi: 0.8, x: 150, y: 450, w: 760, h: 460, n: 7, maxBody: 44 });
        let g = txt(130, 432, '15M', 30, DK.peach, { a: 'start' }) + pill(840, 422, 'HTF story: bullish', DK.teal, pop(t, T.chart + 0.6, 0.5), 20);
        g += hline(q.X(1) - 20, q.x + q.w, q.vy(0.57), C.purple, seg(t, T.level, T.level + 0.8));
        g += pill(q.x + q.w - 70, q.vy(0.57) + 34, '15M level', C.purple, pop(t, T.level + 0.6, 0.5), 20);
        g += chart(t, Object.assign({}, q, { panel: false, times: [0, 1, 2, 3].map(i => T.chart + 0.4 + i * 0.4).concat([null, null]),
          tags: [{ i: 4, text: 'wick only ✗', col: C.pink, at: T.wick + 2.2, off: 34, fs: 20 }, { i: 5, text: '15M close above · BOS #1 ✓', col: DK.teal, at: T.body + 1.6, off: 40, fs: 20 }] }));
        // Live-forming candles (bar 4: poke above, close back below; bar 5: closes above).
        const formed = (i, t0, t1, path) => chart(t, Object.assign({}, q, { panel: false, bars: q.bars.map((b, j) => j === i ? b : [0, 0, 0, 0]), times: q.bars.map(() => null), form: { i, t0, t1, path: path.map(v => (v - 0.22) / 0.58) } }));
        g += formed(4, T.wick, T.wick + 2, [.40, .50, .66, .58, .52]) + formed(5, T.body, T.body + 1.4, [.52, .60, .70]);
        if (t > T.wick + 2.1) g += cross(q.X(4) + 46, q.vy(0.66) - 4, between(t, T.wick + 2.1, T.body - 0.3), C.pink, 20);
        out += g;
      }
      // Pitch + goal.
      const gk = pop(t, T.chart + 0.4, 0.8);
      if (gk > 0) {
        let g = `<rect x="1010" y="640" width="880" height="360" rx="10" fill="#BFE3C6"/>${[0, 1, 2, 3].map(i => `<rect x="${1010 + i * 220}" y="640" width="110" height="360" fill="#AEDAB7"/>`).join('')}
          <rect x="1596" y="640" width="10" height="360" fill="#fff"/>
          <rect x="1596" y="700" width="14" height="300" fill="#fff" stroke="#D9D9D9" stroke-width="2"/><rect x="1596" y="690" width="230" height="14" fill="#fff" stroke="#D9D9D9" stroke-width="2"/>
          ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${1620 + i * 38}" y1="704" x2="${1620 + i * 38}" y2="1000" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('')}
          ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="1610" y1="${730 + i * 48}" x2="1826" y2="${730 + i * 48}" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('')}`;
        out += scaleAt(1450, 1000, gk, g);
        out += pill(1601, 1042, 'the line = the 15M level', C.purple, pop(t, T.level + 0.8, 0.5), 22);
        // Ball: wick phase pokes over and rolls back; body phase crosses and stays.
        let bx = 1150;
        if (t >= T.ball && t < T.body) {
          const a = ease(seg(t, T.ball + 0.4, T.wick + 0.8)), b = ease(seg(t, T.wick + 1.2, T.wick + 2.2));
          bx = lerp(1150, 1612, a) - b * 140;
        } else if (t >= T.body) bx = lerp(1472, 1720, ease(seg(t, T.body, T.body + 1.2)));
        const by = 966 - Math.abs(Math.sin((bx - 1150) / 40)) * 10;
        out += `<g transform="translate(${f1(bx)},${f1(by)}) rotate(${f1(bx * 1.6)})"><circle r="32" fill="#fff" stroke="${C.dark}" stroke-width="4"/><path d="M0,-12 L11,-4 L7,10 L-7,10 L-11,-4 Z" fill="${C.dark}"/><path d="M0,-12 L0,-30 M11,-4 L28,-10 M7,10 L17,26 M-7,10 L-17,26 M-11,-4 L-28,-10" stroke="${C.dark}" stroke-width="3"/></g>`;
        // Scoreboard.
        const sbk = pop(t, T.ball, 0.6);
        if (sbk > 0) {
          const noGoal = t > T.wick + 1.6 && t < T.body + 0.8, goal = t > T.body + 1;
          out += scaleAt(1230, 700, sbk, `<rect x="1060" y="410" width="340" height="150" rx="18" fill="${C.dark}"/>${txt(1230, 452, 'GOAL-LINE CHECK', 20, C.gold, { ls: 3 })}
            ${txt(1230, 522, goal ? 'GOAL · BOS #1 ✓' : noGoal ? 'NO GOAL ✗' : 'checking…', goal ? 34 : 40, goal ? C.teal : noGoal ? C.pink : '#fff', { f: 'Playfair Display', w: 700 })}
            <rect x="1222" y="560" width="16" height="80" fill="${C.muted}"/>`);
          out += bub(1400, 820, 'Wicks don’t count!', between(t, T.wick + 2.2, T.body - 0.3), { size: 26 });
          if (goal) out += A.sparkle(1720, 900, T.body + 1, t);
        }
      }
      return out;
    },

    // Bearish mirror (a 15M close below), then BOS #1 as the starting gun: it starts the sequence, not the trade.
    'sd1-starting-gun': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Phase 1: bearish BOS #1.
      const bk = between(t, T.bear, T.gun - 0.5, 0.7);
      if (bk > 0) {
        const raw = [[.70, .58, .72, .56], [.58, .45, .59, .43], [.45, .53, .55, .44], [.53, .60, .62, .52], [.60, .50, .61, .48], [.50, .34, .51, .32]];
        const q = mk({ raw, lo: 0.24, hi: 0.8, x: 590, y: 440, w: 740, h: 460, n: 7, maxBody: 44 });
        let g = `<rect x="530" y="380" width="860" height="610" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(570, 432, '15M', 30, DK.peach, { a: 'start' })}${pill(1270, 422, 'HTF story: bearish', C.pink, 1, 20)}`;
        g += hline(q.X(1) - 20, q.x + q.w, q.vy(0.43), C.purple, seg(t, T.bear + 1.2, T.bear + 1.8));
        g += txt(q.x + q.w, q.vy(0.43) - 14, '15M level', 22, C.purple, { a: 'end', op: clamp(seg(t, T.bear + 1.6, T.bear + 2)) });
        g += chart(t, Object.assign({}, q, { panel: false, times: [0, 1, 2, 3, 4].map(i => T.bear + 0.2 + i * 0.32).concat([T.bear + 2.6]),
          tags: [{ i: 5, text: '15M close below · BOS #1 ✓', col: C.pink, at: T.bear + 3.2, pos: 'below', off: 40, fs: 20 }] }));
        out += scaleAt(960, 990, bk, g);
      }
      // Phase 2: the race.
      const rk = ease(seg(t, T.gun - 0.4, T.gun + 0.4));
      if (rk > 0) {
        out += fade(rk, `<rect x="0" y="860" width="1920" height="140" fill="#F2C9B6"/>${[900, 950].map(y => `<rect x="0" y="${y}" width="1920" height="3" fill="#fff" opacity=".85"/>`).join('')}
          <rect x="300" y="860" width="10" height="140" fill="#fff"/>`);
        // Finish (the retest and entry, far away).
        const fk = pop(t, T.gun + 0.6, 0.6);
        if (fk > 0) {
          let g = `<rect x="1700" y="560" width="12" height="440" fill="${C.muted}"/><rect x="1880" y="560" width="12" height="440" fill="${C.muted}"/>
            <rect x="1700" y="560" width="192" height="70" rx="8" fill="${C.purple}"/>${txt(1796, 604, 'RETEST', 26, '#fff', { ls: 2 })}`;
          for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) g += `<rect x="${1712 + i * 28}" y="${860 + j * 14}" width="14" height="14" fill="${(i + j) % 2 ? C.dark : '#fff'}"/>`;
          out += scaleAt(1796, 1000, fk, g);
        }
        out += stamp(1796, 760, 'NOT YET', C.pink, pop(t, T.enter, 0.5), -10, 74, 24);
        // Hurdles: what the 5M still has to build.
        const H = [['Correction #1', DK.peach], ['BOS #2', DK.teal], ['Correction #2', DK.peach], ['BOS #3', DK.teal]];
        H.forEach(([lab, col], i) => {
          const x = 700 + i * 250, k = pop(t, T.hurdles[i], 0.6);
          if (k <= 0) return;
          out += scaleAt(x, 960, k, `<rect x="${x - 50}" y="880" width="10" height="80" fill="${C.muted}"/><rect x="${x + 40}" y="880" width="10" height="80" fill="${C.muted}"/><rect x="${x - 56}" y="870" width="112" height="20" rx="6" fill="${col}"/><rect x="${x - 20}" y="870" width="40" height="20" fill="#fff" opacity=".6"/>`);
          out += pill(x, 820, lab, col, k, 20);
        });
        out += pill(1075, 740, 'the 5M builds the rest', DK.pink, pop(t, T.hurdles[0] - 0.8, 0.6), 24);
        // Starter with the pistol.
        const st = { x: 170, y: 1000, scale: 0.85, look: A.LOOKS.a, seed: 4, at: T.gun, talk: false };
        st.frontArm = { a1: -70, a2: -80 };
        st.hold = `<g transform="rotate(-80)"><rect x="-6" y="-8" width="40" height="16" rx="4" fill="${C.dark}"/><rect x="-6" y="-8" width="14" height="30" rx="4" fill="${C.dark}"/></g>`;
        out += who(t, st);
        const bang = between(t, T.bang, T.bang + 1.2, 0.3);
        if (bang > 0) out += scaleAt(240, 600, bang, `<path d="M240,540 L262,580 L306,566 L278,602 L310,636 L264,628 L246,672 L230,630 L184,640 L214,604 L180,570 L224,580 Z" fill="${C.gold}"/>${txt(244, 616, 'BANG', 20, C.dark)}`);
        out += pill(260, 470, 'BOS #1 = the starting gun', C.purple, pop(t, T.gun + 0.4, 0.6), 24);
        // The runner: a candle, set at the line, then off (stops before the first hurdle and keeps jogging).
        const run = ease(seg(t, T.bang, T.bang + 1.6));
        const rx = lerp(360, 560, run);
        const cnd = { x: rx, y: 975, h: 110, w: 64, col: C.teal, wu: 16, seed: 5, at: T.gun + 0.3, walking: t > T.bang, lean: t < T.bang ? 16 : 6, arms: t > T.bang + 2 && t < T.enter ? 'cheer' : undefined };
        out += candy(t, cnd);
        out += bub(560, 660, 'Is that the finish? 🏁', between(t, T.enter + 0.2, T.hurdles[0] - 1), { size: 24 });
        out += pill(1300, 470, 'not an entry ✗', C.pink, pop(t, T.enter + 0.4, 0.5), 26);
      }
      return out;
    },
  });

  /* ================= Module 1 · Lesson 5: The 5M: Correction #1 ================= */
  // 5M after BOS #1 (15M break level at 0.22): push higher (0-3), then Correction #1 pulls back toward the break (4-6).
  const B5C1 = [[.26, .34, .36, .25], [.34, .44, .46, .33], [.44, .54, .56, .43], [.54, .60, .62, .53], [.60, .52, .61, .50], [.52, .44, .53, .42], [.44, .36, .45, .32]];
  Object.assign(LIVE, {
    // The 5M chart beside a mountain: the climber leaves base camp (the 15M break), climbs, then steps back toward camp (Correction #1).
    'sd1-trail-camp': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const pk = pop(t, T.chart, 0.7);
      out += panel(90, 380, 860, 610, pk, 520, 990);
      if (pk > 0) {
        const q = mk({ raw: B5C1, lo: 0.16, hi: 0.68, x: 150, y: 450, w: 740, h: 470, n: 8, maxBody: 44 });
        let g = txt(130, 432, t < T.m5 ? '15M' : '5M', 30, t < T.m5 ? DK.peach : DK.pink, { a: 'start' });
        g += pill(780, 422, 'BOS #1 closed on the 15M ✓', DK.teal, pop(t, T.chart + 0.6, 0.5), 18);
        g += hline(q.x, q.x + q.w, q.vy(0.22), C.purple, seg(t, T.chart + 1, T.chart + 1.8));
        g += txt(q.x + q.w, q.vy(0.22) + 32, 'original 15M break', 22, C.purple, { a: 'end', op: clamp(seg(t, T.chart + 1.4, T.chart + 2)) });
        const times = [T.m5 + 0.4, T.m5 + 1.2, T.m5 + 2, T.m5 + 2.8, T.pull + 0.6, T.pull + 1.4, T.pull + 2.2];
        g += chart(t, Object.assign({}, q, { panel: false, times }));
        // Correction #1 bracket under bars 4-6.
        const bk = ease(seg(t, T.pull + 3, T.pull + 3.6));
        if (bk > 0) {
          const x0 = q.X(4) - 24, x1 = q.X(6) + 24, y = q.vy(0.32) + 36;
          g += `<path d="M${f1(x0)},${f1(y - 14)} L${f1(x0)},${f1(y)} L${f1(lerp(x0, x1, bk))},${f1(y)}${bk >= 1 ? ` L${f1(x1)},${f1(y - 14)}` : ''}" fill="none" stroke="${DK.peach}" stroke-width="5" stroke-linejoin="round"/>`;
          g += pill((x0 + x1) / 2, y - 120, 'Correction #1', DK.peach, pop(t, T.pull + 3.4, 0.5), 22);
        }
        g += arrowTo(q.X(3) + 30, q.vy(0.62) + 10, q.X(6) + 50, q.vy(0.26), C.purple, 5, seg(t, T.camp + 0.8, T.camp + 1.8));
        g += pill(q.X(5) + 30, q.vy(0.22) - 30, 'toward the 15M break', C.purple, pop(t, T.camp + 1.6, 0.5), 18);
        out += g;
      }
      // Mountain.
      const mtk = pop(t, T.chart + 0.4, 0.8);
      if (mtk > 0) {
        out += scaleAt(1440, 1000, mtk, `<path d="M980,1000 L1520,400 L1900,1000 Z" fill="${C.purpleL}"/><path d="M1520,400 L1450,478 L1490,470 L1520,500 L1556,466 L1590,478 Z" fill="#fff"/>
          <path d="M980,1000 L1520,400 L1440,1000 Z" fill="#B9B3EE" opacity=".5"/>
          <rect x="1090" y="868" width="160" height="12" rx="6" fill="#D4AE84"/>
          <path d="M1120,868 L1150,820 L1180,868 Z" fill="${C.peach}"/><rect x="1216" y="790" width="6" height="80" fill="${C.dark}"/><path d="M1222,792 L1270,804 L1222,816 Z" fill="${C.purple}"/>`);
        out += pill(1176, 940, 'BASE CAMP · 15M BREAK', C.purple, pop(t, T.chart + 1.2, 0.5), 20);
        // The climber walks along the slope from camp (1200, 868) toward the peak (1520, 400).
        const along = u => [lerp(1210, 1470, u), lerp(868, 488, u)];
        const up = ease(seg(t, T.m5 + 0.4, T.m5 + 3.6));
        const back1 = ease(seg(t, T.pull + 0.6, T.pull + 2.4)) * 0.35, back2 = ease(seg(t, T.camp + 0.6, T.camp + 2.4)) * 0.25;
        const u = Math.max(0, up * 0.82 - back1 - back2);
        const [cx, cy] = along(u);
        const moving = (t > T.m5 + 0.4 && t < T.m5 + 3.6) || (t > T.pull + 0.6 && t < T.pull + 2.4) || (t > T.camp + 0.6 && t < T.camp + 2.4);
        const cl = { x: cx, y: cy, scale: 0.5, look: A.LOOKS.e, seed: 6, at: T.chart + 1, walking: moving, flip: t > T.pull + 0.4, hat: 'cap' };
        out += who(t, cl);
        out += bub(cx + 60, cy - 230, 'Pulling back ↩️', between(t, T.pull + 1, T.camp - 0.2), { size: 24 });
        out += bub(cx + 60, cy - 230, 'Back toward camp ⛺', between(t, T.camp + 1.2, s.end), { size: 24 });
      }
      return out;
    },

    // The first pancake: Correction #1 never creates the zone. If BOS #2 never happens, the sequence is incomplete: no trade.
    'sd1-first-pancake': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Chef (drawn before the counter so the counter hides the legs).
      const ch = { x: 760, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 3, at: T.kitchen + 0.3, hat: 'chef', talk: ctx.talking && t < T.inset };
      ch.frontArm = aim(ch, 600, 770);
      ch.hold = `<g transform="rotate(-10)"><rect x="-4" y="-6" width="60" height="10" rx="5" fill="${C.muted}"/><rect x="50" y="-14" width="40" height="26" rx="6" fill="#B8B0AA"/></g>`;
      if (t > T.flip - 0.2 && t < T.flip + 0.6) ch.frontArm = { a1: -30, a2: -80 };
      out += who(t, ch);
      // Counter and stove.
      const ck = pop(t, T.kitchen, 0.7);
      out += scaleAt(960, 1000, ck, `<rect x="160" y="830" width="1600" height="30" rx="8" fill="#D4AE84"/><rect x="180" y="860" width="1560" height="140" fill="#EAD3A8"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${220 + i * 310}" y="880" width="270" height="100" rx="10" fill="#F3E3C8" stroke="#D9BE90" stroke-width="3"/>`).join('')}
        <rect x="400" y="806" width="320" height="26" rx="8" fill="${C.dark}"/>`);
      const flame = t < T.nobos + 1 ? 1 : 1 - seg(t, T.nobos + 1, T.nobos + 1.6);
      if (ck > 0 && flame > 0) out += fade(flame, [0, 1, 2].map(i => `<path d="M${520 + i * 40},806 Q${510 + i * 40},${f1(784 + Math.sin(t * 14 + i) * 4)} ${520 + i * 40},${f1(772 + Math.sin(t * 11 + i) * 5)} Q${530 + i * 40},${f1(784 + Math.sin(t * 13 + i) * 4)} ${520 + i * 40},806 Z" fill="${C.peach}"/>`).join(''));
      if (ck > 0) out += `<rect x="460" y="776" width="200" height="22" rx="10" fill="#5E463B"/><rect x="660" y="782" width="110" height="10" rx="5" fill="#5E463B"/>`;
      // Pancake #1: cooks, then flips onto the side plate ("not served").
      const fl = ease(seg(t, T.flip, T.flip + 1.1));
      if (ck > 0) {
        const px = lerp(560, 300, fl), py = lerp(770, 806, fl) - Math.sin(fl * Math.PI) * 200;
        out += `<ellipse cx="300" cy="822" rx="110" ry="16" fill="#fff" stroke="#E6DCD3" stroke-width="4"/>`;
        out += `<g transform="translate(${f1(px)},${f1(py)}) rotate(${f1(fl * 360)})"><ellipse rx="80" ry="16" fill="#E9B76A"/><ellipse rx="64" ry="9" cy="-3" fill="#F3CD8A"/></g>`;
        out += pill(lerp(560, 300, fl), lerp(720, 760, fl), 'Correction #1', DK.peach, pop(t, T.kitchen + 0.8, 0.5), 20);
        out += pill(300, 900, 'the first pancake: not served', C.pink, pop(t, T.flip + 1.2, 0.5), 20);
        out += cross(410, 760, pop(t, T.flip + 1.4, 0.5), C.pink, 24);
      }
      // Serving plate reserved for the zone.
      const sp = pop(t, T.zone2, 0.6);
      if (sp > 0) {
        out += scaleAt(1120, 830, sp, `<rect x="1110" y="760" width="20" height="70" fill="${C.muted}"/><ellipse cx="1120" cy="760" rx="130" ry="20" fill="#fff" stroke="${C.gold}" stroke-width="5"/>
          <rect x="1210" y="690" width="170" height="60" rx="8" fill="#fff" stroke="${DK.teal}" stroke-width="3"/>${txt(1295, 716, 'RESERVED', 16, DK.teal, { ls: 2 })}${txt(1295, 740, 'for the zone', 18, C.text, { w: 700 })}`);
        out += pill(1120, 900, 'the zone comes from Correction #2', DK.teal, pop(t, T.zone2 + 0.4, 0.5), 20);
      }
      // Wall chart: Correction #1's last bearish candle is not demand. Then BOS #2 never happens.
      const ik = pop(t, T.inset, 0.7);
      if (ik > 0) {
        const raw = B5C1.concat([[.36, .48, .50, .35], [.48, .58, .60, .47], [.58, .50, .61, .48], [.50, .55, .57, .49]]);
        const q = mk({ raw, lo: 0.18, hi: 0.68, x: 1100, y: 430, w: 700, h: 250, n: 11, maxBody: 30 });
        let g = `<rect x="1060" y="380" width="780" height="330" rx="22" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>${txt(1080, 418, '5M', 24, DK.pink, { a: 'start' })}`;
        g += hline(q.x, q.x + q.w, q.vy(0.22), C.purple, 1, { w: 3, op: 0.6 });
        out += scaleAt(1450, 710, ik, g);
        if (ik >= 0.5) {
          const times = raw.map((b, i) => i < 7 ? -1 : T.nobos + 0.2 + (i - 7) * 0.5);
          out += chart(t, Object.assign({}, q, { panel: false, wick: 4, times }));
          out += ring(q, 6, C.pink, between(t, T.inset + 0.6, T.nobos - 0.4, 0.5));
          out += pill(q.X(6) - 20, q.vy(0.32) + 40, 'last bearish candle: not demand ✗', C.pink, between(t, T.inset + 1, T.nobos - 0.4, 0.5), 18);
          out += hline(q.X(3), q.x + q.w, q.vy(0.62), DK.teal, seg(t, T.nobos, T.nobos + 0.6), { w: 4 });
          out += txt(q.X(3) - 10, q.vy(0.62) - 12, 'high Correction #1 pulled back from', 16, DK.teal, { a: 'start', op: clamp(seg(t, T.nobos + 0.4, T.nobos + 1)) });
          out += pill(1500, 742, 'no 5M close above · BOS #2 never happens ✗', C.pink, pop(t, T.nobos + 2.4, 0.5), 18);
        }
      }
      // Sequence incomplete sign.
      out += scaleAt(960, 990, pop(t, T.nobos + 3, 0.6), `<rect x="700" y="890" width="520" height="96" rx="16" fill="${C.dark}"/>${txt(960, 930, 'SEQUENCE INCOMPLETE', 22, C.gold, { ls: 3 })}${txt(960, 968, 'no trade', 30, '#fff', { f: 'Playfair Display', w: 700 })}`);
      out += pill(1120, 1048, 'no BOS #2 → no Correction #2 → no zone', C.pink, pop(t, T.nozone, 0.5), 20);
      out += bub(940, 600, 'Chef’s rule 👩‍🍳', between(t, T.flip + 0.4, T.inset - 0.2), { size: 24, tail: 'right' });
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
