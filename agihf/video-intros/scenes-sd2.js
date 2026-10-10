/**
 * scenes-sd2.js: illustrated scene types for Strategy 2 (Supply & Demand, Powered by Higher-Timeframe ICC™)
 * Module 1, Lessons 6 to 10 intro videos.
 *
 * The sequence: 3 Breaks. 2 Corrections. 1 Zone. 1 Retest.
 * BOS #1 (15M close) → Correction #1 (5M) → BOS #2 (5M close) → Correction #2 (creates the zone)
 * → BOS #3 (5M close, activates the zone) → Retest.
 * Zones are drawn around the zone-forming candle without any boundary rule being stated (that rule needs Dayli’s confirmation).
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

  /* ---------------- 5M candle data (open, close, high, low) ----------------
     The bullish model. The bearish model is its mirror (BEAR), so every step lines up.
     i1 high (.55): the high Correction #1 pulls back from. i4: a wick above it that closes back below (not BOS #2).
     i5: first 5M close above .55 = BOS #2. i6 high (.71): the high Correction #2 pulls back from.
     Correction #2 = i7..i10; its last bearish candle before BOS #3 is i9 (the zone-forming candle).
     i11: first 5M close above .71 = BOS #3. i14: the retest back into the zone. */
  const BULL = [
    [.30, .40, .42, .29], [.40, .52, .55, .39], [.52, .47, .53, .46], [.47, .41, .48, .39],
    [.41, .50, .58, .40], [.50, .62, .64, .49], [.62, .69, .71, .61], [.69, .63, .70, .62],
    [.63, .65, .66, .61], [.65, .58, .66, .57], [.58, .66, .68, .57], [.66, .78, .80, .65],
    [.78, .81, .83, .76], [.81, .74, .82, .73], [.74, .67, .75, .64], [.67, .76, .78, .66]];
  const mirror = bars => bars.map(([o, c, h, l]) => [1 - o, 1 - c, 1 - l, 1 - h]);
  const BEAR = mirror(BULL);
  const H1 = .55, H2 = .71;
  // Bearish, BOS #2 never comes: Correction #1 bounces up from the .45 low and no 5M candle closes below it.
  const NOB2 = [[.70, .60, .71, .58], [.60, .48, .61, .45], [.48, .53, .54, .47], [.53, .59, .61, .52],
    [.59, .51, .60, .48], [.51, .57, .58, .50], [.57, .63, .65, .56], [.63, .58, .66, .57]];
  // Bearish 15M: the 15M level is b1's low (.50); b4 closes below it (BOS #1).
  const B15 = [[.58, .66, .68, .56], [.66, .56, .67, .50], [.56, .63, .66, .55], [.63, .58, .65, .54], [.58, .42, .59, .40]];

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

  // A verdict stamp on a white backing, so it reads over a chart.
  const vstamp = (x, y, text, col, k, rot, r, fs) => k <= 0 ? '' : `<circle cx="${x}" cy="${y}" r="${f1(r * (1 + (1 - clamp(k)) * 0.8))}" fill="#fff" opacity="${(0.92 * clamp(k * 1.6)).toFixed(2)}"/>` + stamp(x, y, text, col, k, rot, r, fs);
  const kgeo = o => {
    const n = o.n || o.bars.length, step = o.w / n;
    return { X: i => o.x + step * i + step / 2, Y: v => o.y + o.h - (v - o.lo) / (o.hi - o.lo) * o.h, step, bw: Math.min(step * 0.56, o.maxBody || 42), o };
  };
  // Bars reveal at o.times[i] (null = hidden). o.under is drawn between the panel and the bars.
  function kchart(t, o) {
    const G = kgeo(o), { X, Y, bw } = G;
    let out = '';
    if (o.panel !== false) out += `<rect x="${o.x - 30}" y="${o.y - 30}" width="${o.w + 60}" height="${o.h + 60}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
    if (o.label) out += txt(o.x - 6, o.labelBottom ? o.y + o.h + 14 : o.y + 6, o.label, o.labelSize || 26, o.labelCol || C.purple, { a: 'start', ls: 2 });
    out += o.under || '';
    o.bars.forEach((b, i) => {
      const at = o.times[i];
      if (at == null) return;
      const p = ease((t - at) / (o.grow || 0.45));
      if (p <= 0) return;
      const [bo, bc, bh, bl] = b, up = bc >= bo, col = up ? C.teal : C.pink;
      const cc = lerp(bo, bc, p), x = X(i), op = o.dim && o.dim(i) ? 0.3 : 1;
      out += `<g opacity="${op}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(lerp(Math.max(bo, bc), bh, p)))}" y2="${f1(Y(lerp(Math.min(bo, bc), bl, p)))}" stroke="${up ? DK.teal : C.pink}" stroke-width="${o.wick || 5}" stroke-linecap="round"/>
        <rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(bo, cc)))}" width="${f1(bw)}" height="${f1(Math.max(3, Math.abs(Y(bo) - Y(cc))))}" rx="4" fill="${col}"/></g>`;
    });
    return out;
  }
  const allAt = (n, at) => Array.from({ length: n }, () => at);
  const level = (G, v, i0, xEnd, k, col, dash = '14 9') => {
    if (k <= 0) return '';
    const x0 = G.X(i0) - G.bw / 2 - 6, y = G.Y(v);
    return `<line x1="${f1(x0)}" x2="${f1(lerp(x0, xEnd, clamp(k)))}" y1="${f1(y)}" y2="${f1(y)}" stroke="${col}" stroke-width="5" stroke-dasharray="${dash}"/>`;
  };
  // The zone drawn around the zone-forming candle and carried to the right (no boundary rule is stated anywhere).
  const zoneBox = (G, i, b, xEnd, k, col, solid) => {
    if (k <= 0) return '';
    const x0 = G.X(i) - G.bw / 2 - 8, y0 = G.Y(b[2]), y1 = G.Y(b[3]);
    const w = lerp(G.bw + 16, xEnd - x0, ease(k));
    return `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(y1 - y0)}" rx="6" fill="${col}" fill-opacity="${(0.2 * clamp(k * 2)).toFixed(3)}" stroke="${col}" stroke-width="4" ${solid ? '' : 'stroke-dasharray="12 8"'}/>`;
  };
  const ring = (G, i, b, k, col = C.gold) => {
    if (k <= 0) return '';
    const x = G.X(i), y0 = G.Y(b[2]) - 14, y1 = G.Y(b[3]) + 14, w = G.bw + 30;
    return scaleAt(x, (y0 + y1) / 2, k, `<rect x="${f1(x - w / 2)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(y1 - y0)}" rx="14" fill="none" stroke="${col}" stroke-width="6"/>`);
  };
  // A bracket under (or over) bars i0..i1 at height y, with a label.
  const bracket = (G, i0, i1, y, label, col, k, above) => {
    if (k <= 0) return '';
    const x0 = G.X(i0) - G.bw / 2, x1 = G.X(i1) + G.bw / 2, d = above ? 14 : -14, cx = (x0 + x1) / 2;
    return fade(k, `<path d="M${f1(x0)},${f1(y + d)} L${f1(x0)},${f1(y)} L${f1(x1)},${f1(y)} L${f1(x1)},${f1(y + d)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
      + txt(cx, above ? y - 14 : y + 32, label, 24, col));
  };
  const tagAt = (G, i, b, text, col, k, below, off = 38, fs = 22) => pill(G.X(i), below ? G.Y(b[3]) + off : G.Y(b[2]) - off, text, col, k, fs);
  // A pawn (board-game piece), feet at (x, y).
  const pawn = (x, y, col, dark, k = 1) => k <= 0 ? '' : scaleAt(x, y, k, `<ellipse cx="${f1(x)}" cy="${f1(y - 6)}" rx="40" ry="12" fill="${dark}"/>
    <path d="M${f1(x - 30)},${f1(y - 10)} L${f1(x - 12)},${f1(y - 80)} L${f1(x + 12)},${f1(y - 80)} L${f1(x + 30)},${f1(y - 10)} Z" fill="${col}"/>
    <circle cx="${f1(x)}" cy="${f1(y - 96)}" r="24" fill="${col}"/><circle cx="${f1(x - 7)}" cy="${f1(y - 104)}" r="7" fill="#fff" opacity=".45"/>`);
  // A filled stamp circle for the sequence card.
  const dotStamp = (x, y, k, col) => k <= 0 ? '' : scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="30" fill="${col}"/><path d="M${x - 13},${y + 1} L${x - 3},${y + 11} L${x + 14},${y - 10}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);

  // Standard kicker + swapping headlines.
  const TYPES = ['hurdle-race', 'recipe-card', 'two-waves', 'seed-sprout', 'spotlight-lineup', 'bookmark', 'mirror-lake', 'weathervane-floor', 'board-game', 'stamp-card'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['sd2-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Lesson 6: The 5M: BOS #2 ================= */
  Object.assign(LIVE, {
    // The Correction #1 high is a hurdle on the 5M chart. A wick that knocks it isn't a clear; a 5M candle close above it is BOS #2.
    'sd2-hurdle-race': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      out += `<rect x="0" y="1036" width="1920" height="5" fill="#fff" opacity=".8"/>`;
      const o = { x: 170, y: 440, w: 960, h: 430, lo: .27, hi: .68, n: 8, bars: BULL.slice(0, 6), label: '5M',
        times: [T.chart, T.chart + 0.4, T.c1 + 0.3, T.c1 + 0.9, T.wick + 0.2, T.bos + 0.2] };
      const G = kgeo(o);
      // The hurdle sits on the Correction #1 high.
      const hk = ease(seg(t, T.mark, T.mark + 0.9));
      if (hk > 0) {
        const y0 = G.Y(H1), x0 = G.X(1) - G.bw / 2 - 6, x1 = o.x + o.w + 10, xk = lerp(x0, x1, hk);
        const jig = t > T.wick + 0.5 && t < T.wick + 2.1 ? Math.sin((t - T.wick) * 32) * 7 * (1 - seg(t, T.wick + 0.5, T.wick + 2.1)) : 0;
        const y = y0 + jig;
        let h = `<rect x="${f1(x0)}" y="${f1(y - 8)}" width="${f1(xk - x0)}" height="16" rx="6" fill="#fff" stroke="${C.pink}" stroke-width="3"/>`;
        for (let x = x0 + 8; x < xk - 30; x += 64) h += `<rect x="${f1(x)}" y="${f1(y - 6)}" width="30" height="12" fill="${C.pinkL}"/>`;
        const xp = G.X(1.5);
        h += `<rect x="${f1(xp - 4)}" y="${f1(y + 8)}" width="8" height="60" fill="${C.muted}"/><rect x="${f1(xp - 16)}" y="${f1(y + 64)}" width="32" height="8" rx="4" fill="${C.muted}"/>`;
        if (hk >= 1) h += `<rect x="${f1(x1 - 24)}" y="${f1(y + 8)}" width="8" height="60" fill="${C.muted}"/><rect x="${f1(x1 - 36)}" y="${f1(y + 64)}" width="32" height="8" rx="4" fill="${C.muted}"/>`;
        o.under = h;
      }
      out += kchart(t, o);
      out += pill(o.x + 250, o.y + 4, 'BOS #1 (15M) done ✓', C.purple, pop(t, T.chart + 0.4, 0.5), 20);
      out += bracket(G, 2, 3, G.Y(.39) + 36, 'Correction #1', DK.peach, ease(seg(t, T.c1 + 1.2, T.c1 + 1.7)));
      out += pill(330, G.Y(H1) - 40, 'Correction #1 high', C.pink, pop(t, T.mark + 0.6, 0.5), 22);
      // The wick: trades through, closes back below.
      out += cross(G.X(4) + 48, G.Y(.58) + 4, pop(t, T.wick + 1.0, 0.5), C.pink, 22);
      out += pill(710, 480, 'a wick through isn’t a close ✗', C.pink, between(t, T.wick + 1.3, T.bos - 0.2), 22);
      // BOS #2: a 5M close above the high.
      out += tagAt(G, 5, BULL[5], 'BOS #2 · 5M close ✓', DK.teal, pop(t, T.bos + 0.9, 0.5));
      if (t > T.bos + 0.9) out += A.sparkle(G.X(5), G.Y(.62), T.bos + 0.9, t, C.teal);
      // Recap chips: three things make a BOS #2.
      ['On the 5M ✓', 'Through the Correction #1 swing ✓', 'A candle close ✓'].forEach((c, i) =>
        out += pill(1530, 470 + i * 80, c, [C.purple, DK.peach, DK.teal][i], pop(t, T.recap[i], 0.5), 22));
      // The runner (a hurdler) watches from the track.
      const rd = { x: 1740, y: 1000, scale: 0.82, look: A.LOOKS.c, seed: 3, flip: true, at: T.chart + 0.2, talk: ctx.talking && t > T.wick && t < T.recap[0] };
      if (t > T.mark && t < T.wick + 3) rd.frontArm = aim(rd, 1260, 640);
      out += who(t, rd);
      out += bub(1580, 600, 'Touching isn’t clearing!', between(t, T.wick + 1.6, T.bos - 0.2), { size: 26, tail: 'right' });
      out += bub(1580, 600, 'Cleared it! 🏁', between(t, T.bos + 1.2, T.recap[0] - 0.3), { size: 26, tail: 'right' });
      return out;
    },

    // A recipe card: three steps done, but the cake isn't baked. Then a bearish chart where BOS #2 never comes.
    'sd2-recipe-card': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // The oven.
      const ok = pop(t, T.oven, 0.6);
      const hand = (t * 90) % 360;
      const rise = 0.4 + 0.25 * seg(t, T.oven, s.end);
      let ov = `<rect x="150" y="620" width="360" height="380" rx="24" fill="${C.purpleL}" stroke="${DK.purple}" stroke-width="5"/>
        <rect x="150" y="620" width="360" height="74" rx="24" fill="${C.purple}"/><rect x="150" y="660" width="360" height="34" fill="${C.purple}"/>
        <circle cx="205" cy="657" r="15" fill="#fff"/><circle cx="255" cy="657" r="15" fill="#fff"/>
        <circle cx="450" cy="657" r="24" fill="#fff"/><line x1="450" y1="657" x2="${f1(450 + Math.cos(rad(hand - 90)) * 18)}" y2="${f1(657 + Math.sin(rad(hand - 90)) * 18)}" stroke="${C.pink}" stroke-width="4" stroke-linecap="round"/>
        <rect x="210" y="710" width="240" height="12" rx="6" fill="${DK.purple}"/>
        <rect x="190" y="740" width="280" height="200" rx="16" fill="#FFE9C7" stroke="${DK.purple}" stroke-width="5"/>
        <path d="M210,924 Q230,914 250,924 T290,924 T330,924 T370,924 T410,924 T450,924" stroke="${C.peach}" stroke-width="4" fill="none"/>
        <rect x="260" y="${f1(900 - 80 * rise)}" width="140" height="${f1(80 * rise)}" rx="10" fill="#F7E3B5" stroke="#E0C79A" stroke-width="3"/>
        <rect x="246" y="900" width="168" height="10" rx="4" fill="${C.muted}"/>`;
      out += scaleAt(330, 1000, ok, ov);
      // The baker.
      const bk = { x: 600, y: 1000, scale: 0.78, look: A.LOOKS.d, seed: 5, at: T.oven + 0.2, hat: 'chef', talk: ctx.talking && t < T.none };
      out += who(t, bk);
      out += bub(380, 560, 'Can I eat it yet? 🍰', between(t, T.oven + 0.4, T.wait - 0.3), { size: 26, tail: 'right' });
      out += bub(380, 560, 'Not baked yet ⏳', between(t, T.wait + 0.2, T.none - 0.2), { size: 26, tail: 'right' });
      // The recipe card: the sequence.
      const ck = pop(t, T.card, 0.7);
      const rows = ['BOS #1 · 15M', 'Correction #1 · 5M', 'BOS #2 · 5M', 'Correction #2', 'BOS #3', 'Retest'];
      let card = `<rect x="706" y="418" width="520" height="550" rx="18" fill="#000" opacity=".06"/><rect x="700" y="410" width="520" height="550" rx="18" fill="#FFF9F2" stroke="#EADFD8" stroke-width="4"/>
        <rect x="700" y="410" width="520" height="70" rx="18" fill="${C.peachL}"/><rect x="700" y="450" width="520" height="30" fill="${C.peachL}"/>
        ${txt(960, 457, 'RECIPE: THE SEQUENCE', 24, DK.peach, { ls: 3 })}`;
      rows.forEach((r, i) => {
        const y = 530 + i * 72;
        const nk = i >= 3 ? ease(seg(t, T.next[i - 3], T.next[i - 3] + 0.4)) : 0;
        if (nk > 0) card += `<rect x="716" y="${y - 30}" width="488" height="60" rx="12" fill="${C.peachL}" opacity="${(0.55 * nk).toFixed(2)}"/>`;
        card += `<rect x="736" y="${y - 18}" width="36" height="36" rx="8" fill="#fff" stroke="${C.muted}" stroke-width="3"/>${txt(796, y + 11, r, 30, C.text, { a: 'start', f: 'Playfair Display', w: 700 })}`;
      });
      out += scaleAt(960, 960, ck, rotAt(960, 685, -1.5, card));
      if (ck > 0) {
        [T.card + 0.5, T.card + 0.9, T.here].forEach((a, i) => out += check(754, 530 + i * 72, pop(t, a, 0.5), C.teal, 20));
        out += pill(1112, 674, 'you are here', C.pink, pop(t, T.here + 0.4, 0.5), 20);
        T.next.forEach((a, i) => out += pill(1140, 746 + i * 72, 'still to come', DK.peach, pop(t, a, 0.5), 18));
        out += pill(960, 1042, 'no zone yet · no entry yet', C.pink, pop(t, T.next[2] + 0.8, 0.5), 24);
      }
      // When BOS #2 never comes (bearish example).
      const nk = ease(seg(t, T.none, T.none + 0.6));
      if (nk > 0) {
        const o = { x: 1360, y: 470, w: 440, h: 370, lo: .38, hi: .74, n: 9, bars: NOB2, label: 'BEARISH · 5M', labelBottom: true, labelSize: 22,
          times: [T.none + 0.3, T.none + 0.6, T.none + 0.9, T.none + 1.2, T.none + 2.6, T.none + 3.0, T.none + 3.4, T.none + 3.8] };
        const G = kgeo(o);
        let g = kchart(t, o);
        g += level(G, .45, 1, o.x + o.w + 10, ease(seg(t, T.none + 1.6, T.none + 2.3)), C.pink);
        g += pill(1580, G.Y(.45) + 36, 'Correction #1 low', C.pink, pop(t, T.none + 2.1, 0.5), 20);
        out += fade(nk, g);
        out += pill(1580, 920, 'no 5M close below it = no BOS #2', C.pink, pop(t, T.verdict, 0.5), 22);
        out += vstamp(1600, 640, 'NO TRADE', C.pink, ease(seg(t, T.verdict + 0.8, T.verdict + 1.3)), -12, 86, 28);
      }
      return out;
    },
  });

  /* ================= Lesson 7: Correction #2: Where Zones Begin ================= */
  Object.assign(LIVE, {
    // Two pullbacks on the chart, two waves on a beach: the first leaves nothing, the second leaves a shell (the zone begins).
    'sd2-two-waves': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const o = { x: 130, y: 440, w: 900, h: 450, lo: .27, hi: .75, n: 12, bars: BULL.slice(0, 11), label: '5M',
        times: [T.chart, T.chart + 0.4, T.c1 + 0.3, T.c1 + 0.8, T.c1 + 1.3, T.bos2 + 0.4, T.c2 + 0.4, T.c2 + 0.9, T.c2 + 1.4, T.c2 + 1.9, T.c2 + 2.4] };
      const G = kgeo(o);
      out += kchart(t, o);
      out += pill(o.x + 210, o.y + 4, 'after BOS #1 · 15M', C.purple, pop(t, T.chart + 0.4, 0.5), 20);
      out += bracket(G, 2, 4, G.Y(.39) + 36, 'Correction #1', DK.peach, ease(seg(t, T.c1 + 1.6, T.c1 + 2.1)));
      out += pill(G.X(3), G.Y(.39) + 116, 'no zone', C.muted, pop(t, T.c1 + 3.2, 0.5), 18);
      out += tagAt(G, 5, BULL[5], 'BOS #2', DK.teal, pop(t, T.bos2 + 0.8, 0.5), true);
      out += bracket(G, 7, 10, G.Y(.57) + 36, 'Correction #2', C.purple, ease(seg(t, T.zone, T.zone + 0.5)));
      out += pill(G.X(8.5), G.Y(.57) + 116, 'the zone begins here ✓', C.purple, pop(t, T.zone + 0.6, 0.5), 20);
      // The beach.
      const X0 = 1100, X1 = 1860;
      let b = `<rect x="${X0}" y="420" width="${X1 - X0}" height="580" fill="#F3DDB5"/>`;
      for (let i = 0; i < 14; i++) b += `<circle cx="${X0 + 40 + (i * 157) % 700}" cy="${700 + (i * 89) % 260}" r="3" fill="#D9BC8C"/>`;
      const wave = (a, d) => t > a && t < a + d ? Math.sin(Math.PI * (t - a) / d) : 0;
      const w1 = wave(T.c1 + 0.2, 4), w2 = wave(T.c2 + 0.2, 4);
      const E = 590 + 210 * Math.max(w1, w2);
      const EP = [];
      for (let x = X0; x <= X1; x += 20) EP.push([x, E + Math.sin(x / 40 + t * 3) * 10]);
      b += `<path d="M${X0},420 L${X1},420 L${EP.slice().reverse().map(p => f1(p[0]) + ',' + f1(p[1])).join(' L')} Z" fill="#BFE6EE"/>`;
      b += poly(EP, '#fff', 8, { op: 0.9 });
      for (let i = 0; i < 4; i++) b += `<path d="M${f1(X0 + 60 + i * 180 + Math.sin(t + i) * 20)},${470 + (i % 2) * 50} q20,-12 40,0 q20,12 40,0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`;
      out += fade(ease(seg(t, T.chart + 0.4, T.chart + 1.2)), b);
      // Wave badges.
      if (w1 > 0.05) out += pill(1480, E - 50, 'wave 1', DK.peach, clamp(w1 * 3), 22);
      if (w2 > 0.05) out += pill(1480, E - 50, 'wave 2', C.purple, clamp(w2 * 3), 22);
      out += pill(1480, 930, 'wave 1 leaves nothing', DK.peach, between(t, T.c1 + 4, T.c2 + 1), 24);
      // The shell, left by wave 2.
      const sk = pop(t, T.c2 + 3.2, 0.6);
      if (sk > 0) {
        out += scaleAt(1480, 790, sk, `<g transform="translate(1480,790)"><path d="M0,0 L-52,-56 Q0,-96 52,-56 Z" fill="${C.peachL}" stroke="${C.peach}" stroke-width="5" stroke-linejoin="round"/>
          ${[-36, -18, 0, 18, 36].map(a => `<line x1="0" y1="0" x2="${f1(Math.sin(rad(a)) * 70)}" y2="${f1(-Math.cos(rad(a)) * 70)}" stroke="${C.peach}" stroke-width="4"/>`).join('')}
          <rect x="-14" y="-6" width="28" height="14" rx="6" fill="${C.peach}"/></g>`);
        if (t > T.beach) out += A.sparkle(1480, 750, T.beach, t, C.purple);
      }
      out += pill(1480, 870, 'wave 2 leaves a shell', C.purple, pop(t, T.c2 + 3.6, 0.5), 24);
      out += pill(1480, 940, 'Correction #2 → the zone', C.purple, pop(t, T.beach + 0.6, 0.5), 24);
      out += crit(t, 'crab', { x: 1770, y: 990, scale: 0.6, seed: 2, at: T.chart + 1, talk: ctx.talking && t > T.beach });
      return out;
    },

    // The zone from Correction #2 is a seed: potential until BOS #3 makes it grow. No BOS #3, no trade.
    'sd2-seed-sprout': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const o = { x: 130, y: 440, w: 900, h: 450, lo: .27, hi: .86, n: 12, bars: BULL.slice(0, 12), label: '5M',
        times: allAt(11, s.start - 1).concat([T.bos3 + 0.6]) };
      const G = kgeo(o);
      const act = ease(seg(t, T.active, T.active + 0.6));
      o.under = zoneBox(G, 9, BULL[9], o.x + o.w + 10, ease(seg(t, T.chart + 0.6, T.chart + 1.4)), act > 0.5 ? DK.teal : C.purple, act > 0.5);
      out += kchart(t, o);
      out += ring(G, 9, BULL[9], pop(t, T.chart + 0.2, 0.5));
      out += level(G, H2, 6, o.x + o.w + 10, ease(seg(t, T.bos3, T.bos3 + 0.7)), DK.teal);
      out += pill(560, G.Y(H2) - 36, 'Correction #2 high', DK.teal, pop(t, T.bos3 + 0.4, 0.5), 22);
      out += tagAt(G, 11, BULL[11], 'BOS #3 ✓', DK.teal, pop(t, T.bos3 + 1.2, 0.5));
      out += pill(950, G.Y(.57) + 32, 'potential zone', C.purple, between(t, T.chart + 1.2, T.active - 0.1), 20);
      out += pill(950, G.Y(.57) + 32, 'active zone ✓', DK.teal, pop(t, T.active, 0.5), 20);
      out += pill(330, 965, 'Correction #2 creates it', C.purple, pop(t, T.sum, 0.5), 24);
      out += pill(790, 965, 'BOS #3 activates it', DK.teal, pop(t, T.sum + 1.2, 0.5), 24);
      // Pots.
      const pot = (x, k, col) => k <= 0 ? '' : scaleAt(x, 1000, k, `<path d="M${x - 80},880 L${x + 80},880 L${x + 62},1000 L${x - 62},1000 Z" fill="${col}"/><rect x="${x - 92}" y="864" width="184" height="30" rx="10" fill="${col}" stroke="#fff" stroke-width="3"/><ellipse cx="${x}" cy="868" rx="76" ry="10" fill="#7A5236"/>`);
      out += pot(1330, pop(t, T.pot, 0.6), C.peach);
      // Seed drops into pot 1.
      const sd = ease(seg(t, T.seed, T.seed + 0.8));
      if (sd > 0 && t < T.bos3 + 1.4) out += `<ellipse cx="1330" cy="${f1(lerp(600, 860, sd))}" rx="14" ry="10" fill="#9B6A45"/>`;
      out += pill(1330, 640, 'a seed: potential', C.purple, between(t, T.seed + 0.7, T.bos3 + 0.4), 22);
      out += pill(1330, 700, 'needs BOS #3 to grow', C.purple, between(t, T.seed + 1.6, T.bos3 + 0.4), 22);
      // BOS #3: the sun comes out, and the sprout grows.
      const sk = pop(t, T.bos3 + 0.6, 0.7);
      if (sk > 0) {
        let sun = '';
        for (let i = 0; i < 12; i++) { const a = rad(i * 30 + t * 20); sun += `<line x1="${f1(1330 + Math.cos(a) * 64)}" y1="${f1(480 + Math.sin(a) * 64)}" x2="${f1(1330 + Math.cos(a) * 88)}" y2="${f1(480 + Math.sin(a) * 88)}" stroke="${C.gold}" stroke-width="7" stroke-linecap="round"/>`; }
        sun += `<circle cx="1330" cy="480" r="54" fill="${C.gold}"/>${txt(1330, 490, 'BOS #3', 26, '#fff')}`;
        out += scaleAt(1330, 480, sk, sun);
      }
      const gk = ease(seg(t, T.bos3 + 1.2, T.active + 0.4));
      if (gk > 0) {
        const top = lerp(866, 690, gk);
        out += `<path d="M1330,866 L1330,${f1(top)}" stroke="#4FA36B" stroke-width="10" stroke-linecap="round"/>`;
        const lk = clamp(gk * 1.6);
        out += `<path d="M1330,800 q-60,-20 -70,-60 q50,0 70,50 Z" fill="#7CC79A" transform="scale(1)" opacity="${lk.toFixed(2)}"/><path d="M1330,770 q60,-20 70,-60 q-50,0 -70,50 Z" fill="#7CC79A" opacity="${lk.toFixed(2)}"/>`;
        const fk = pop(t, T.active, 0.6);
        if (fk > 0) out += scaleAt(1330, top, fk, [0, 72, 144, 216, 288].map(a => `<circle cx="${f1(1330 + Math.cos(rad(a)) * 26)}" cy="${f1(top + Math.sin(rad(a)) * 26)}" r="20" fill="${C.pink}"/>`).join('') + `<circle cx="1330" cy="${f1(top)}" r="16" fill="${C.gold}"/>`);
        if (t > T.active) out += A.sparkle(1330, top, T.active, t, C.teal);
      }
      // No BOS #3: the second pot never grows.
      const nk = pop(t, T.none, 0.6);
      out += pot(1680, nk, C.purpleL);
      if (nk > 0) {
        out += `<ellipse cx="1680" cy="858" rx="14" ry="10" fill="#9B6A45" opacity="${nk}"/>`;
        let cl = `<g transform="translate(1680,560)" opacity=".95"><ellipse cx="0" cy="0" rx="80" ry="34" fill="#C9C2D6"/><ellipse cx="-44" cy="10" rx="50" ry="26" fill="#C9C2D6"/><ellipse cx="48" cy="8" rx="52" ry="28" fill="#C9C2D6"/><ellipse cx="6" cy="-22" rx="46" ry="32" fill="#C9C2D6"/></g>`;
        for (let i = 0; i < 6; i++) { const y = 610 + ((t * 160 + i * 47) % 200); cl += `<line x1="${1620 + i * 24}" y1="${f1(y)}" x2="${1614 + i * 24}" y2="${f1(y + 18)}" stroke="#9FB6D6" stroke-width="4" stroke-linecap="round"/>`; }
        out += scaleAt(1680, 600, nk, cl);
        out += pill(1680, 690, 'if BOS #3 never comes', C.muted, pop(t, T.none + 0.6, 0.5), 22);
        out += vstamp(1680, 780, 'NO TRADE', C.pink, ease(seg(t, T.nostamp, T.nostamp + 0.5)), -12, 74, 24);
      }
      out += crit(t, 'bird', { x: 1530, y: 1000, scale: 0.8, seed: 4, at: T.pot + 0.4, flip: true });
      return out;
    },
  });

  /* ================= Lesson 8: Identifying the Zone-Forming Candle ================= */
  Object.assign(LIVE, {
    // Correction #2's candles stand in a line on a stage. A spotlight finds the bearish ones, then lands on the last one before BOS #3.
    'sd2-spotlight-lineup': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // The stage.
      const stk = pop(t, T.stage, 0.7);
      let st = `<rect x="120" y="420" width="990" height="530" fill="#FFF3EA"/><rect x="100" y="940" width="1030" height="60" fill="#E7C9A5"/><rect x="100" y="940" width="1030" height="8" fill="#C9A36E"/>
        <path d="M120,380 L210,380 Q190,640 214,1000 L120,1000 Z" fill="${C.pink}"/><path d="M1110,380 L1020,380 Q1040,640 1016,1000 L1110,1000 Z" fill="${C.pink}"/>
        <rect x="100" y="372" width="1030" height="40" rx="10" fill="${DK.pink}"/>`;
      for (let x = 130; x < 1110; x += 60) st += `<path d="M${x},412 q30,34 60,0" fill="${C.pink}"/>`;
      out += scaleAt(615, 1000, stk, st);
      // The spotlight.
      const lk = ease(seg(t, T.bear + 0.8, T.bear + 1.3));
      const xs = [300, 450, 600, 750];
      if (lk > 0) {
        const xt = lerp(xs[0], xs[2], ease(seg(t, T.sweep, T.sweep + 2)));
        out += `<path d="M680,430 L700,430 L${f1(xt + 95)},945 L${f1(xt - 95)},945 Z" fill="${C.gold}" opacity="${(0.22 * lk).toFixed(3)}"/><ellipse cx="${f1(xt)}" cy="945" rx="100" ry="18" fill="${C.gold}" opacity="${(0.4 * lk).toFixed(3)}"/>`;
        out += `<rect x="668" y="414" width="44" height="30" rx="8" fill="${C.dark}"/>`;
      }
      // Correction #2's candles: bearish, bullish, bearish (the last one), bullish. Then BOS #3.
      const cols = [C.pink, C.teal, C.pink, C.teal], hs = [120, 80, 120, 80];
      cols.forEach((col, i) => {
        const last = i === 2 && t > T.zone;
        out += candy(t, { x: xs[i], y: 950, h: hs[i], w: 70, col, seed: i + 2, at: T.stage + 0.5 + i * 0.25, arms: last ? 'cheer' : undefined, mood: i === 0 && t > T.notfirst + 0.4 ? 'sad' : undefined });
      });
      out += candy(t, { x: 930, y: 950, h: 210, w: 86, col: C.teal, seed: 7, at: T.bos3, arms: 'up', hop: t > T.bos3 && t < T.bos3 + 2 ? 8 : 0 });
      out += pill(930, 680, 'BOS #3', DK.teal, pop(t, T.bos3 + 0.3, 0.5), 24);
      // Banner over the whole correction.
      const bnk = pop(t, T.stage + 1.2, 0.6);
      if (bnk > 0) {
        out += scaleAt(525, 640, bnk, `<rect x="230" y="616" width="590" height="50" rx="12" fill="${C.peachL}" stroke="${C.peach}" stroke-width="4"/>${txt(525, 651, 'CORRECTION #2', 28, DK.peach, { ls: 3 })}`);
        const sk = ease(seg(t, T.notall, T.notall + 0.5));
        if (sk > 0) out += `<line x1="236" y1="641" x2="${f1(lerp(236, 814, sk))}" y2="641" stroke="${C.pink}" stroke-width="7" stroke-linecap="round"/>`;
        out += cross(850, 641, pop(t, T.notall + 0.4, 0.5), C.pink, 24);
      }
      out += pill(525, 580, 'not the whole correction', C.pink, between(t, T.notall + 0.5, T.zone - 0.2), 22);
      // Labels on the bearish candles.
      [0, 2].forEach(i => out += pill(xs[i], 768, 'bearish', C.pink, between(t, T.bear + i * 0.2, T.notfirst - 0.2), 18));
      out += cross(xs[0], 762, pop(t, T.notfirst, 0.5), C.pink, 22);
      out += pill(xs[0], 716, 'not the first', C.pink, between(t, T.notfirst + 0.2, T.zone - 0.2), 20);
      out += pill(xs[2], 740, 'the last one ✓', DK.teal, pop(t, T.last, 0.5), 22);
      out += pill(xs[2], 520, 'DEMAND ZONE', C.purple, pop(t, T.zone, 0.6), 28);
      if (t > T.zone) out += A.sparkle(xs[2], 520, T.zone, t, C.purple);
      // The 5M chart: the same candles.
      const o = { x: 1250, y: 450, w: 560, h: 430, lo: .27, hi: .84, n: 13, bars: BULL.slice(0, 12), label: '5M', times: allAt(11, s.start - 1).concat([T.bos3]) };
      const G = kgeo(o);
      const shk = ease(seg(t, T.stage + 0.6, T.stage + 1.2));
      o.under = (shk > 0 ? `<rect x="${f1(G.X(7) - G.step / 2)}" y="${o.y - 14}" width="${f1(G.step * 4)}" height="${o.h + 28}" rx="10" fill="${C.peachL}" opacity="${(0.4 * shk).toFixed(3)}"/>` + txt(G.X(8.5), o.y + o.h + 4, 'Correction #2', 20, DK.peach, { op: shk.toFixed(2) }) : '')
        + zoneBox(G, 9, BULL[9], o.x + o.w + 10, ease(seg(t, T.zone, T.zone + 0.8)), C.purple, true);
      out += kchart(t, o);
      out += ring(G, 9, BULL[9], pop(t, T.sweep + 2, 0.5));
      out += tagAt(G, 11, BULL[11], 'BOS #3', DK.teal, pop(t, T.bos3 + 0.3, 0.5), false, 34, 20);
      return out;
    },

    // You bookmark one page, not a whole chapter: mark the one candle, not the whole correction. Then the supply mirror.
    'sd2-bookmark': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const sup = ease(seg(t, T.supply, T.supply + 0.6));
      // The chapter folder with four pages (Correction #2's candles).
      const fk = pop(t, T.folder, 0.7);
      let f = `<rect x="136" y="468" width="760" height="440" rx="20" fill="#000" opacity=".05"/><rect x="130" y="460" width="760" height="440" rx="20" fill="#FFF9F2" stroke="${C.purpleL}" stroke-width="5"/>
        <rect x="130" y="460" width="230" height="44" rx="14" fill="${C.purpleL}"/>${txt(245, 490, 'CHAPTER', 22, DK.purple, { ls: 3 })}
        ${txt(620, 494, 'Correction #2', 34, C.text, { f: 'Playfair Display', w: 700 })}`;
      const flip = Math.abs(Math.cos(Math.PI * sup));
      [170, 345, 520, 695].forEach((x, i) => {
        const bear = i % 2 === 0;
        const isBear = sup < 0.5 ? bear : !bear;
        const col = isBear ? C.pink : C.teal, dk = isBear ? DK.pink : DK.teal;
        const cx = x + 75;
        f += `<g transform="translate(${cx},0) scale(${flip.toFixed(3)},1) translate(${-cx},0)"><rect x="${x}" y="540" width="150" height="290" rx="12" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
          <line x1="${cx}" x2="${cx}" y1="586" y2="736" stroke="${dk}" stroke-width="6" stroke-linecap="round"/><rect x="${cx - 22}" y="606" width="44" height="110" rx="6" fill="${col}"/>
          ${txt(cx, 800, 'p. ' + (i + 1), 24, C.muted, { w: 700 })}</g>`;
      });
      out += scaleAt(510, 900, fk, f);
      out += pill(510, 945, 'next chapter: BOS #3 →', DK.teal, between(t, T.folder + 0.8, T.rem - 0.3), 22);
      // Wrong: highlight the whole chapter.
      const hk = ease(seg(t, T.wrong, T.wrong + 1.2)), hOut = 1 - seg(t, T.right, T.right + 0.5);
      if (hk > 0 && hOut > 0) {
        const xe = lerp(160, 860, hk);
        out += fade(hOut, `<rect x="160" y="640" width="${f1(xe - 160)}" height="60" rx="8" fill="${C.gold}" opacity=".45"/>
          <g transform="translate(${f1(xe)},640) rotate(30)"><rect x="-14" y="-90" width="28" height="90" rx="6" fill="${C.purple}"/><path d="M-14,0 L14,0 L8,20 L-8,20 Z" fill="${C.gold}"/></g>`);
      }
      out += cross(840, 590, between(t, T.xwrong, T.right - 0.1), C.pink, 26);
      out += pill(510, 868, 'the whole chapter ✗', C.pink, between(t, T.xwrong + 0.2, T.right - 0.1), 22);
      // Right: one bookmark, on the last page before the next chapter (p. 3).
      const rk = ease(seg(t, T.mark, T.mark + 0.7));
      if (rk > 0) {
        const yb = lerp(524, 690, rk);
        out += `<path d="M579,524 L611,524 L611,${f1(yb)} L595,${f1(yb - 16)} L579,${f1(yb)} Z" fill="${C.purple}"/>`;
      }
      out += pill(510, 868, 'one page ✓ the last one', C.purple, pop(t, T.mark + 0.5, 0.5), 22);
      // The chart: demand first, then the supply mirror.
      const mk = (bars, lo, hi, label, bottom) => ({ x: 1050, y: 450, w: 740, h: 420, lo, hi, n: 13, bars: bars.slice(0, 12), label, labelBottom: bottom, labelSize: 22, times: allAt(12, s.start - 1) });
      const ob = mk(BULL, .27, .84, 'DEMAND · BULLISH', false), Gb = kgeo(ob);
      const os = mk(BEAR, .16, .73, 'SUPPLY · BEARISH', true), Gs = kgeo(os);
      out += `<rect x="1020" y="420" width="800" height="480" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
      ob.panel = os.panel = false;
      ob.under = zoneBox(Gb, 9, BULL[9], ob.x + ob.w + 10, ease(seg(t, T.zone + 0.6, T.zone + 1.4)), C.purple, true);
      os.under = zoneBox(Gs, 9, BEAR[9], os.x + os.w + 10, ease(seg(t, T.supply + 0.8, T.supply + 1.6)), C.purple, true);
      let bull = kchart(t, ob) + tagAt(Gb, 11, BULL[11], 'BOS #3', DK.teal, 1, false, 34, 20);
      // Wrong box: the whole correction.
      const wk = pop(t, T.wrong + 0.3, 0.5) * (1 - seg(t, T.zone, T.zone + 0.5));
      if (wk > 0) {
        const x0 = Gb.X(7) - Gb.bw / 2 - 12, x1 = Gb.X(10) + Gb.bw / 2 + 12, y0 = Gb.Y(.70) - 12, y1 = Gb.Y(.57) + 12;
        bull += fade(wk, `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" rx="10" fill="${C.pink}" fill-opacity=".12" stroke="${C.pink}" stroke-width="5" stroke-dasharray="12 8"/>`)
          + cross(x1, y0, pop(t, T.xwrong, 0.5) * (1 - seg(t, T.zone, T.zone + 0.5)), C.pink, 22);
        bull += pill((x0 + x1) / 2, y1 + 34, 'whole correction', C.pink, wk, 20);
      }
      bull += ring(Gb, 9, BULL[9], pop(t, T.zone, 0.5));
      bull += pill(Gb.X(9), Gb.Y(.57) + 40, 'the zone candle ✓', C.purple, pop(t, T.zone + 0.6, 0.5), 22);
      out += fade(1 - sup, bull);
      if (sup > 0) {
        let bear = kchart(t, os) + tagAt(Gs, 11, BEAR[11], 'BOS #3', DK.pink, 1, true, 34, 20);
        bear += ring(Gs, 9, BEAR[9], pop(t, T.supply + 0.6, 0.5));
        bear += pill(1560, 480, 'last bullish candle before BOS #3', C.purple, pop(t, T.supply + 1.2, 0.5), 22);
        out += fade(sup, bear);
      }
      out += pill(960, 960, 'ONE CANDLE. THE LAST ONE. BEFORE BOS #3.', C.purple, pop(t, T.rem, 0.6), 26);
      return out;
    },
  });

  /* ================= Lesson 9: Supply vs. Demand ================= */
  Object.assign(LIVE, {
    // The bullish (demand) sequence on the bank; its reflection in the lake is the bearish (supply) sequence.
    'sd2-mirror-lake': (s, t, ctx) => {
      const T = s.beats;
      let out = '';
      // Lake and bank.
      out += `<rect x="0" y="680" width="1920" height="320" fill="#CFEAF0"/><rect x="0" y="672" width="1920" height="14" rx="7" fill="#9ED3A5"/>`;
      out += ground(1000);
      const up = { x: 400, y: 405, w: 940, h: 245, lo: .27, hi: .83, n: 13, bars: BULL.slice(0, 12), panel: false, times: BULL.slice(0, 12).map((_, i) => T.up + i * 0.18) };
      const dn = { x: 400, y: 705, w: 940, h: 245, lo: .17, hi: .73, n: 13, bars: BEAR.slice(0, 12), panel: false, times: BEAR.slice(0, 12).map((_, i) => T.down + i * 0.18) };
      const Gu = kgeo(up), Gd = kgeo(dn);
      out += fade(pop(t, T.up - 0.2, 0.6), `<rect x="370" y="380" width="1000" height="282" rx="22" fill="#fff" opacity=".75"/>`);
      up.under = zoneBox(Gu, 9, BULL[9], up.x + up.w + 10, ease(seg(t, T.dem + 0.4, T.dem + 1.2)), C.purple, true);
      dn.under = zoneBox(Gd, 9, BEAR[9], dn.x + dn.w + 10, ease(seg(t, T.sup + 0.4, T.sup + 1.2)), C.purple, true);
      out += kchart(t, up);
      out += `<g opacity=".85">${kchart(t, dn)}</g>`;
      // Ripples over the reflection.
      for (let j = 0; j < 14; j++) {
        const x = 400 + ((j * 211 + t * 36) % 900), y = 715 + (j * 53) % 250;
        out += `<rect x="${f1(x)}" y="${y}" width="${60 + (j % 3) * 20}" height="4" rx="2" fill="#fff" opacity=".55"/>`;
      }
      // Same steps on both.
      out += tagAt(Gu, 5, BULL[5], 'BOS #2', DK.teal, pop(t, T.steps, 0.5), false, 30, 20);
      out += tagAt(Gu, 11, BULL[11], 'BOS #3', DK.teal, pop(t, T.steps + 0.6, 0.5), false, 30, 20);
      out += tagAt(Gd, 5, BEAR[5], 'BOS #2', DK.pink, pop(t, T.steps + 0.3, 0.5), true, 30, 20);
      out += tagAt(Gd, 11, BEAR[11], 'BOS #3', DK.pink, pop(t, T.steps + 0.9, 0.5), true, 30, 20);
      // Labels.
      out += pill(1620, 440, 'DEMAND', DK.teal, pop(t, T.up + 0.3, 0.5), 32);
      out += fade(pop(t, T.up + 0.6, 0.5), txt(1620, 512, 'the bullish model', 28, C.text, { f: 'Playfair Display', w: 700 }));
      out += pill(1620, 760, 'SUPPLY', DK.pink, pop(t, T.down + 0.3, 0.5), 32);
      out += fade(pop(t, T.down + 0.6, 0.5), txt(1620, 832, 'the bearish model', 28, C.text, { f: 'Playfair Display', w: 700 }));
      // The zone candles.
      out += ring(Gu, 9, BULL[9], pop(t, T.dem, 0.5));
      out += pill(1620, 586, 'zone: last bearish candle', C.purple, pop(t, T.dem + 0.6, 0.5), 22);
      out += ring(Gd, 9, BEAR[9], pop(t, T.sup, 0.5));
      out += pill(1620, 900, 'zone: last bullish candle', C.purple, pop(t, T.sup + 0.6, 0.5), 22);
      out += pill(870, 679, 'Same sequence. Mirrored.', C.purple, pop(t, T.same, 0.6), 30);
      if (t > T.same) out += A.sparkle(870, 679, T.same, t, C.purple);
      // A walker on the bank, a duck on the lake.
      const wk = { x: 220, y: 672, scale: 0.72, look: A.LOOKS.e, seed: 4, at: T.up, talk: ctx.talking && t > T.steps && t < T.dem };
      if (t > T.dem && t < T.same) wk.frontArm = aim(wk, 380, 560);
      out += who(t, wk);
      out += crit(t, 'duck', { x: 230, y: 900 + Math.sin(t * 1.6) * 4, scale: 0.9, seed: 3, at: T.down });
      return out;
    },

    // A weathervane (the HTF ICC direction) says which zone you hunt. Demand has a floor; supply has a ceiling.
    'sd2-weathervane-floor': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // The house and the weathervane.
      const hk = pop(t, T.house, 0.7);
      out += scaleAt(370, 1000, hk, `<rect x="200" y="730" width="340" height="270" fill="#FBEBDF" stroke="#EADFD8" stroke-width="4"/><rect x="330" y="880" width="80" height="120" rx="10" fill="${C.peach}"/>
        <path d="M170,740 L370,590 L570,740 Z" fill="${C.purple}"/><rect x="260" y="780" width="220" height="70" rx="12" fill="${C.dark}"/>${txt(370, 826, 'HTF ICC', 30, C.gold, { ls: 3 })}
        <line x1="370" y1="596" x2="370" y2="470" stroke="${C.muted}" stroke-width="7"/><circle cx="370" cy="470" r="10" fill="${C.muted}"/>`);
      let a;
      const a0 = ((T.bull - T.spin) * 300) % 360, tgt = a0 <= 270 ? 270 : 630;
      if (t < T.spin) a = Math.sin(t * 2) * 12;
      else if (t < T.bull) a = (t - T.spin) * 300;
      else if (t < T.bear) a = lerp(a0, tgt, back(seg(t, T.bull, T.bull + 0.7)));
      else a = lerp(tgt, tgt + 180, back(seg(t, T.bear, T.bear + 0.8)));
      if (hk > 0) out += rotAt(370, 470, a, `<path d="M300,470 L440,470" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/><path d="M440,450 L476,470 L440,490 Z" fill="${C.dark}"/><path d="M300,470 L280,446 L320,446 Z M300,470 L280,494 L320,494 Z" fill="${C.gold}"/>`);
      out += pill(370, 1042, 'bullish → hunt demand', DK.teal, between(t, T.bull + 0.5, T.bear), 24);
      out += pill(370, 1042, 'bearish → hunt supply', DK.pink, pop(t, T.bear + 0.6, 0.5), 24);
      // Two rooms.
      const isBull = t > T.bull + 0.5 && t < T.bear + 0.6, isBear = t > T.bear + 0.6;
      const room = (x0, title, col, glow, k) => k <= 0 ? '' : scaleAt(x0 + 260, 960, k, `<rect x="${x0}" y="420" width="520" height="540" rx="24" fill="#fff" stroke="${glow ? col : '#F1E7E1'}" stroke-width="${glow ? 6 : 3}"/>${txt(x0 + 260, 474, title, 30, col, { ls: 4 })}`);
      out += room(720, 'DEMAND', DK.teal, isBull, pop(t, T.house + 0.6, 0.6));
      out += room(1320, 'SUPPLY', DK.pink, isBear, pop(t, T.house + 0.8, 0.6));
      const rk = ease(seg(t, T.house + 1, T.house + 1.6));
      if (rk > 0) {
        // Demand: the zone candle is bearish; price comes back down into it.
        let d = `<rect x="760" y="690" width="440" height="100" rx="6" fill="${C.purple}" fill-opacity=".18" stroke="${C.purple}" stroke-width="4"/>
          <line x1="800" x2="800" y1="690" y2="790" stroke="${C.pink}" stroke-width="5"/><rect x="786" y="702" width="28" height="74" rx="4" fill="${C.pink}"/>${txt(920, 750, 'demand zone', 26, C.purple, { w: 800 })}`;
        let sp = `<rect x="1360" y="560" width="440" height="100" rx="6" fill="${C.purple}" fill-opacity=".18" stroke="${C.purple}" stroke-width="4"/>
          <line x1="1400" x2="1400" y1="560" y2="660" stroke="${DK.teal}" stroke-width="5"/><rect x="1386" y="572" width="28" height="74" rx="4" fill="${C.teal}"/>${txt(1520, 620, 'supply zone', 26, C.purple, { w: 800 })}`;
        out += fade(rk, d + sp);
        const pk = ease(seg(t, T.house + 1.4, T.house + 3.4));
        out += poly(partial([[880, 560], [950, 630], [1000, 600], [1080, 730], [1140, 600], [1190, 520]], pk), DK.teal, 7);
        out += fade(1 - seg(t, T.inval, T.inval + 0.4), poly(partial([[1460, 880], [1530, 810], [1580, 850], [1660, 620], [1730, 760], [1790, 860]], pk), C.pink, 7));
      }
      // The boundary that matters for invalidation.
      const flk = ease(seg(t, T.floor, T.floor + 0.6));
      if (flk > 0) out += `<line x1="752" x2="${f1(lerp(752, 1208, flk))}" y1="790" y2="790" stroke="${DK.teal}" stroke-width="12" stroke-linecap="round"/>`;
      out += pill(980, 850, 'lower boundary · the floor', DK.teal, pop(t, T.floor + 0.4, 0.5), 22);
      out += fade(pop(t, T.floor + 0.8, 0.5), txt(980, 912, 'matters for invalidation', 24, C.muted, { w: 700 }));
      const clk = ease(seg(t, T.ceil, T.ceil + 0.6));
      if (clk > 0) out += `<line x1="1352" x2="${f1(lerp(1352, 1808, clk))}" y1="560" y2="560" stroke="${DK.pink}" stroke-width="12" stroke-linecap="round"/>`;
      out += pill(1550, 520, 'upper boundary · the ceiling', DK.pink, pop(t, T.ceil + 0.4, 0.5), 22);
      out += fade(pop(t, T.ceil + 0.8, 0.5), txt(1580, 924, 'matters for invalidation', 24, C.muted, { w: 700 }));
      // Price moves past the ceiling: the supply setup is invalid.
      const ik = ease(seg(t, T.inval, T.inval + 1.2));
      if (ik > 0) {
        const pp = partial([[1460, 880], [1530, 810], [1580, 850], [1660, 640], [1700, 690], [1770, 490]], ik), e = pp[pp.length - 1];
        out += poly(pp, DK.pink, 7) + dot(e[0], e[1], 12, DK.pink);
      }
      out += vstamp(1730, 830, 'INVALID', C.pink, ease(seg(t, T.inval + 1.2, T.inval + 1.7)), -12, 72, 24);
      return out;
    },
  });

  /* ================= Lesson 10: Bringing the Full Sequence Together ================= */
  Object.assign(LIVE, {
    // A board game of six squares. You land on a square only when its requirement is met; skip one and there's no trade.
    'sd2-board-game': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const bk = pop(t, T.board, 0.7);
      out += scaleAt(960, 990, bk, `<rect x="110" y="395" width="1700" height="595" rx="30" fill="#FFF6EE" stroke="#EADFD8" stroke-width="5"/>`);
      if (bk <= 0) return out;
      const TP = [[330, 840], [600, 700], [870, 840], [1140, 700], [1410, 840], [1680, 700]];
      const titles = ['BOS #1', 'Correction #1', 'BOS #2', 'Correction #2', 'BOS #3', 'Retest'];
      const subs = ['a 15M close below', '5M bounce up', 'a 5M close below', 'creates the zone', 'activates the zone', 'price returns'];
      const kind = [0, 1, 0, 1, 0, 3];           // 0 break, 1 correction, 3 retest
      const kcol = [C.purple, C.peach, C.gold, C.teal], kdk = [DK.purple, DK.peach, '#B07A1F', DK.teal];
      const cnt = [T.counts[0], T.counts[1], T.counts[2], T.counts[3]];
      out += fade(bk, poly(TP, '#E3CDB8', 10, { dash: '4 22' }));
      TP.forEach(([x, y], i) => {
        const k = pop(t, T.board + 0.4 + i * 0.25, 0.5);
        const glowK = i === 3 ? Math.max(ease(seg(t, cnt[1], cnt[1] + 0.4)), ease(seg(t, cnt[2], cnt[2] + 0.4))) : ease(seg(t, cnt[kind[i]], cnt[kind[i]] + 0.4));
        const col = i === 3 && t > cnt[2] ? kcol[2] : kcol[kind[i]], dk = i === 3 && t > cnt[2] ? kdk[2] : kdk[kind[i]];
        out += scaleAt(x, y, k, `<rect x="${x - 125}" y="${y - 62}" width="250" height="124" rx="20" fill="#fff" stroke="${glowK > 0 ? col : '#EADFD8'}" stroke-width="${f1(4 + glowK * 4)}"/>
          ${glowK > 0 ? `<rect x="${x - 125}" y="${y - 62}" width="250" height="124" rx="20" fill="${col}" opacity="${(0.16 * glowK).toFixed(3)}"/>` : ''}
          ${txt(x, y - 8, titles[i], 30, C.text, { f: 'Playfair Display', w: 700 })}${txt(x, y + 30, subs[i], 21, C.muted, { w: 700 })}`);
        if (i === 3) out += scaleAt(x - 112, y - 56, pop(t, cnt[2] + 0.2, 0.5), `<path d="M${x - 112},${y - 82} l8,17 l19,2 l-14,13 l4,19 l-17,-9 l-17,9 l4,-19 l-14,-13 l19,-2 Z" fill="${C.gold}" stroke="#fff" stroke-width="3"/>`);
      });
      // The HTF story sign.
      out += scaleAt(330, 540, pop(t, T.sign, 0.6), `<rect x="135" y="478" width="390" height="124" rx="18" fill="${C.dark}"/>${txt(330, 526, 'HTF STORY: BEARISH ↓', 26, C.gold, { ls: 2 })}${txt(330, 572, 'look for supply', 30, '#fff', { f: 'Playfair Display', w: 700 })}`);
      // Counters.
      [['3 BREAKS', 760], ['2 CORRECTIONS', 990], ['1 ZONE', 1210], ['1 RETEST', 1400]].forEach(([lab, x], i) => out += pill(x, 470, lab, kdk[i], pop(t, cnt[i], 0.5), 26));
      // Dice.
      out += scaleAt(1690, 500, pop(t, T.board + 1.6, 0.6), rotAt(1690, 500, Math.sin(t * 1.5) * 8, `<rect x="1648" y="458" width="84" height="84" rx="16" fill="#fff" stroke="${C.purple}" stroke-width="5"/>${[[-20, -20], [20, 20], [0, 0], [20, -20], [-20, 20]].map(([dx, dy]) => `<circle cx="${1690 + dx}" cy="${500 + dy}" r="7" fill="${C.purple}"/>`).join('')}`));
      // The purple pawn walks the squares in order, each square checked as it lands.
      const H = T.hops;
      let px = TP[0][0], py = TP[0][1] - 70, hop = 0;
      for (let i = 1; i < 6; i++) {
        if (t >= H[i]) {
          const u = seg(t, H[i], H[i] + 0.5);
          px = lerp(TP[i - 1][0], TP[i][0], ease(u)); py = lerp(TP[i - 1][1], TP[i][1], ease(u)) - 70; hop = Math.sin(Math.PI * u) * 90;
        }
      }
      out += pawn(px - 80, py + 8 - hop, C.purple, DK.purple, pop(t, T.pawn, 0.6));
      TP.forEach(([x, y], i) => out += check(x + 96, y - 52, pop(t, H[i] + 0.45, 0.5) * (1 - seg(t, T.skip - 0.3, T.skip + 0.1)), C.teal, 20));
      // A pink pawn tries to skip a square.
      const sk = pop(t, T.skip, 0.5);
      if (sk > 0) {
        const u = seg(t, T.skip + 0.4, T.skip + 1.2);
        const x = lerp(TP[1][0], TP[3][0], ease(u)), y = TP[1][1] - 62 - Math.sin(Math.PI * u) * 140;
        out += pawn(x + 70, y, C.pink, DK.pink, sk);
        out += pill(TP[2][0], 750, 'skipped ✗', C.pink, pop(t, T.skip + 1.0, 0.5), 22);
        out += cross(TP[3][0] + 70, TP[3][1] - 160, pop(t, T.skip + 1.3, 0.5), C.pink, 26);
        out += vstamp(1000, 600, 'NO TRADE', C.pink, ease(seg(t, T.no, T.no + 0.5)), -10, 84, 28);
      }
      return out;
    },

    // The bearish chart builds, step by step, while a sequence card fills: 3 breaks, 2 corrections, 1 zone, 1 retest.
    'sd2-stamp-card': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      out += `<rect x="110" y="410" width="1070" height="530" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
      // 15M: BOS #1.
      const k15 = 1 - seg(t, T.m5 - 0.2, T.m5 + 0.2);
      if (k15 > 0) {
        const o = { x: 220, y: 470, w: 760, h: 420, lo: .36, hi: .74, n: 7, bars: B15, panel: false, label: '15M',
          times: [T.m15 + 0.1, T.m15 + 0.45, T.m15 + 0.8, T.m15 + 1.15, T.bos1 - 0.4] };
        const G = kgeo(o);
        let g = kchart(t, o);
        g += level(G, .50, 1, o.x + o.w, ease(seg(t, T.m15 + 1.3, T.m15 + 2)), C.purple);
        g += pill(G.X(2.6), G.Y(.50) + 36, '15M level', C.purple, pop(t, T.m15 + 1.8, 0.5), 20);
        g += tagAt(G, 4, B15[4], 'BOS #1 · 15M close', C.purple, pop(t, T.bos1, 0.5), true, 40, 20);
        out += fade(k15, g);
      }
      // 5M: the rest of the sequence.
      const k5 = seg(t, T.m5, T.m5 + 0.4);
      if (k5 > 0) {
        const bt = [T.m5 + 0.2, T.m5 + 0.5, T.c1, T.c1 + 0.3, T.c1 + 0.6, T.bos2, T.bos2 + 0.8,
          T.c2, T.c2 + 0.4, T.c2 + 0.8, T.c2 + 1.2, T.bos3, T.retest, T.retest + 0.4, T.retest + 0.8];
        const o = { x: 150, y: 450, w: 990, h: 450, lo: .17, hi: .73, n: 16, bars: BEAR.slice(0, 15), panel: false, label: '5M', labelBottom: true, times: bt };
        const G = kgeo(o);
        const act = ease(seg(t, T.active, T.active + 0.5));
        o.under = zoneBox(G, 9, BEAR[9], o.x + o.w + 10, ease(seg(t, T.zone + 0.4, T.zone + 1.2)), act > 0.5 ? DK.pink : C.purple, act > 0.5)
          + level(G, 1 - H1, 1, G.X(5) + 30, ease(seg(t, T.bos2 - 1.2, T.bos2 - 0.5)), DK.peach)
          + level(G, 1 - H2, 6, G.X(11) + 30, ease(seg(t, T.bos3 - 0.8, T.bos3 - 0.2)), DK.peach);
        let g = kchart(t, o);
        g += bracket(G, 2, 4, G.Y(.61) - 30, 'Correction #1', DK.peach, ease(seg(t, T.c1 + 0.8, T.c1 + 1.3)), true);
        g += tagAt(G, 5, BEAR[5], 'BOS #2', C.purple, pop(t, T.bos2 + 0.5, 0.5), true, 40, 20);
        g += bracket(G, 7, 10, G.Y(.43) - 30, 'Correction #2', DK.peach, ease(seg(t, T.c2 + 1.4, T.c2 + 1.9)), true);
        g += ring(G, 9, BEAR[9], pop(t, T.zone, 0.5));
        g += pill(1000, 650, 'potential supply zone', C.purple, between(t, T.zone + 1, T.active - 0.1), 20);
        g += pill(1000, 650, 'active supply zone ✓', DK.pink, pop(t, T.active, 0.5), 20);
        g += tagAt(G, 11, BEAR[11], 'BOS #3', C.purple, pop(t, T.bos3 + 0.5, 0.5), true, 36, 20);
        g += tagAt(G, 14, BEAR[14], 'retest', DK.teal, pop(t, T.retest + 1.2, 0.5), true, 40, 20);
        out += fade(k5, g);
      }
      out += pill(645, 970, 'no return? don’t chase', C.pink, pop(t, T.chase, 0.5), 24);
      // The sequence card.
      const ck = pop(t, s.start + 0.4, 0.7);
      out += scaleAt(1540, 930, ck, `<rect x="1246" y="428" width="600" height="510" rx="22" fill="#000" opacity=".05"/><rect x="1240" y="420" width="600" height="510" rx="22" fill="#FFF9F2" stroke="${C.purpleL}" stroke-width="5"/>
        ${txt(1540, 482, 'SEQUENCE CARD', 26, C.muted, { ls: 4 })}<line x1="1280" x2="1800" y1="510" y2="510" stroke="#EFE3DA" stroke-width="3"/>`);
      const rows = [['3 BREAKS', 580, [T.bos1, T.bos2 + 0.5, T.bos3 + 0.5], C.purple], ['2 CORRECTIONS', 680, [T.c1 + 1.3, T.c2 + 1.9], C.peach],
        ['1 ZONE', 780, [T.zone + 0.6], C.gold], ['1 RETEST', 870, [T.retest + 1.2], C.teal]];
      if (ck > 0) rows.forEach(([lab, y, at, col]) => {
        out += fade(ck, txt(1280, y + 10, lab, 28, C.text, { a: 'start', f: 'Playfair Display', w: 700 }));
        [1800, 1720, 1640].slice(0, at.length).reverse().forEach((x, j) => {
          out += `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="#E3CDB8" stroke-width="4" stroke-dasharray="6 6"/>` + dotStamp(x, y, pop(t, at[j], 0.5), col);
        });
      });
      if (t > T.retest + 1.8) out += A.sparkle(1540, 870, T.retest + 1.8, t, C.purple);
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
