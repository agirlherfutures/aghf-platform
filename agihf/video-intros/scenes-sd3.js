/**
 * scenes-sd3.js: illustrated scene types for Strategy 2 (Supply & Demand, Powered by Higher-Timeframe ICC™)
 * Module 2, Lessons 1 to 5 (sl-m2-1 … sl-m2-5).
 *
 * The sequence: 3 breaks, 2 corrections, 1 zone, 1 retest (SUPPLY_DEMAND_MASTER.md).
 * Zone boundaries and exact limit-entry placement are not finalized, so the zone is drawn without prices
 * and no scene says where inside the zone an order sits.
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

  /* ---------------- Supply & demand chart kit ----------------
     Bars are [open, close, high, low] in price units 0..1 (bullish data; mir() flips them for bearish).
     The bullish 5M sequence (indices):
       0-2  push after BOS #1 (15M level at .30; swing high .48 at bar 2)
       3-4  Correction #1 (pulls back toward the 15M level)
       7    BOS #2 (first 5M close above .48)            8 swing high .62
       9-11 Correction #2 (bar 11 = last bearish candle = zone candle)
       12   bullish candle that is NOT activation (closes below .62)
       13   BOS #3 (first 5M close above .62)
       14-16 price moves away and pulls back            17 retest (first return to the zone) */
  const BULL = [[.22, .30, .31, .21], [.30, .40, .41, .29], [.40, .46, .48, .39], [.46, .40, .47, .39], [.40, .34, .41, .32],
    [.34, .39, .40, .33], [.39, .45, .46, .38], [.45, .53, .54, .44], [.53, .60, .62, .52], [.60, .56, .61, .55],
    [.56, .53, .57, .52], [.53, .49, .54, .47], [.49, .56, .57, .48], [.56, .66, .67, .55], [.66, .72, .74, .65],
    [.72, .66, .73, .65], [.66, .60, .67, .58], [.60, .53, .61, .51], [.53, .63, .64, .52], [.63, .72, .73, .62], [.72, .80, .82, .71]];
  // Same start, but no 5M close above .48 after Correction #1 (no BOS #2).
  const NO_BOS2 = BULL.slice(0, 5).concat([[.34, .39, .40, .33], [.39, .45, .47, .38], [.45, .41, .46, .40], [.41, .44, .46, .39], [.44, .40, .45, .37], [.40, .43, .45, .38]]);
  // Same through bar 12, then no 5M close above .62 (no BOS #3); price keeps trading around the potential zone.
  const NO_BOS3 = BULL.slice(0, 13).concat([[.56, .59, .61, .55], [.59, .55, .60, .53], [.55, .58, .60, .52], [.58, .54, .59, .51]]);
  // Same through bar 14, then price only pulls back a little and never returns to the zone (missed retest).
  const MISSED = BULL.slice(0, 15).concat([[.72, .69, .73, .67], [.69, .76, .77, .68], [.76, .84, .85, .75], [.84, .80, .85, .79], [.80, .88, .90, .79]]);
  // 15M bars: a wick pokes above the 15M level (.55) and closes back below; the next bar closes above (BOS #1).
  const F15 = [[.30, .38, .40, .27], [.38, .34, .40, .32], [.34, .46, .47, .33], [.46, .52, .55, .45], [.52, .45, .53, .43], [.45, .49, .51, .44], [.49, .53, .61, .48], [.53, .63, .65, .52]];
  const mir = bars => bars.map(([o, c, h, l]) => [1 - o, 1 - c, 1 - l, 1 - h]);
  const ZB = BULL[11];

  // Geometry for a chart box o = { x, y, w, h, n, lo, hi }.
  const G = o => {
    const n = o.n, step = o.w / n, lo = o.lo ?? 0.12, hi = o.hi ?? 0.92;
    return { X: i => o.x + step * i + step / 2, Y: v => o.y + o.h - (v - lo) / (hi - lo) * o.h, step, bw: Math.min(step * 0.58, o.maxBody || 38), o };
  };
  // Candles. o.times[i] = reveal time (null = hidden). o.form = { i, t0, t1, path } forms bar i live along a price path.
  function cc(t, o) {
    const g = G(o), { X, Y, bw } = g;
    let out = '';
    if (o.panel !== false) out += `<rect x="${o.x - 30}" y="${o.y - 30}" width="${o.w + 60}" height="${o.h + 60}" rx="26" fill="${o.bg || '#fff'}" stroke="#F1E7E1" stroke-width="3"/>`;
    if (o.tf) out += pill(o.x + 34, o.y + 4, o.tf, o.tfCol || C.purple, 1, 22);
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
        const at = o.times[i];
        if (at == null) return;
        p = ease((t - at) / (o.grow || 0.4));
        if (p <= 0) return;
      }
      const up = bc >= bo, col = up ? C.teal : C.pink;
      const cc2 = lerp(bo, bc, p), x = X(i), op = o.dim && o.dim(i) ? 0.3 : 1;
      out += `<g opacity="${op}"><line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(Y(lerp(Math.max(bo, bc), bh, p)))}" y2="${f1(Y(lerp(Math.min(bo, bc), bl, p)))}" stroke="${up ? C.tealD : col}" stroke-width="${o.wick || 4}" stroke-linecap="round"/>
        <rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(bo, cc2)))}" width="${f1(bw)}" height="${f1(Math.max(3, Math.abs(Y(bo) - Y(cc2))))}" rx="4" fill="${col}"/></g>`;
    });
    return out;
  }
  // Dashed horizontal level from x0, drawn out to x1 by k.
  const hline = (g, v, x0, x1, col, k, w = 4) => k <= 0 ? '' : `<line x1="${f1(x0)}" x2="${f1(lerp(x0, x1, clamp(k)))}" y1="${f1(g.Y(v))}" y2="${f1(g.Y(v))}" stroke="${col}" stroke-width="${w}" stroke-dasharray="12 8" stroke-linecap="round"/>`;
  // A soft glow around one candle (the zone-forming candle).
  const glow = (g, b, i, k, col = C.gold) => {
    if (k <= 0) return '';
    const x = g.X(i), y0 = g.Y(b[2]) - 10, y1 = g.Y(b[3]) + 10, w = g.bw + 22;
    return scaleAt(x, (y0 + y1) / 2, k, `<rect x="${f1(x - w / 2)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(y1 - y0)}" rx="12" fill="${col}" opacity=".22"/><rect x="${f1(x - w / 2)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(y1 - y0)}" rx="12" fill="none" stroke="${col}" stroke-width="5"/>`);
  };
  // The zone drawn from candle i out to x1 (no prices shown). active: 0 = potential (dashed), 1 = active.
  const zone = (g, b, i, x1, k, active = 0) => {
    if (k <= 0) return '';
    const xa = g.X(i) - g.bw / 2 - 6, xb = lerp(xa, x1, ease(k)), y0 = g.Y(b[2]), y1 = g.Y(b[3]);
    const col = active > 0.5 ? DK.teal : DK.peach, fill = active > 0.5 ? C.teal : C.peach;
    return `<rect x="${f1(xa)}" y="${f1(y0)}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}" rx="6" fill="${fill}" opacity="${f1(0.16 + active * 0.12)}"/>
      <rect x="${f1(xa)}" y="${f1(y0)}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}" rx="6" fill="none" stroke="${col}" stroke-width="4" ${active > 0.5 ? '' : 'stroke-dasharray="10 7"'}/>`;
  };
  // Shade a stretch of bars (a correction) with a soft background.
  const shade = (g, i0, i1, vlo, vhi, col, k) => k <= 0 ? '' : `<rect x="${f1(g.X(i0) - g.step / 2)}" y="${f1(g.Y(vhi))}" width="${f1(g.step * (i1 - i0 + 1))}" height="${f1(g.Y(vlo) - g.Y(vhi))}" rx="14" fill="${col}" opacity="${f1(0.22 * clamp(k))}"/>`;
  // A bracket under (or over) bars i0..i1 with a label.
  const bracket = (g, i0, i1, y, text, col, k, fs = 20, up = false) => {
    if (k <= 0) return '';
    const xa = g.X(i0) - g.bw / 2, xb = g.X(i1) + g.bw / 2, d = up ? -12 : 12;
    return fade(k, `<path d="M${f1(xa)},${f1(y - d)} L${f1(xa)},${f1(y)} L${f1(xb)},${f1(y)} L${f1(xb)},${f1(y - d)}" fill="none" stroke="${col}" stroke-width="4" stroke-linejoin="round"/>`) + pill((xa + xb) / 2, y + (up ? -30 : 30), text, col, k, fs);
  };
  const arrow = (x0, y0, x1, y1, col, k, w = 5) => {
    if (k <= 0) return '';
    const x = lerp(x0, x1, ease(k)), y = lerp(y0, y1, ease(k)), a = Math.atan2(y1 - y0, x1 - x0);
    return `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x)}" y2="${f1(y)}" stroke="${col}" stroke-width="${w}" stroke-dasharray="10 8" stroke-linecap="round"/><path d="M${f1(x + Math.cos(a) * 14)},${f1(y + Math.sin(a) * 14)} L${f1(x + Math.cos(a + 2.5) * 16)},${f1(y + Math.sin(a + 2.5) * 16)} L${f1(x + Math.cos(a - 2.5) * 16)},${f1(y + Math.sin(a - 2.5) * 16)} Z" fill="${col}"/>`;
  };
  // Reveal helper: bars a..b at t0 + (i - a) * per.
  const span = (times, a, b, t0, per) => { for (let i = a; i <= b; i++) times[i] = t0 + (i - a) * per; return times; };
  const clock = (x, y, r, t, k, col = C.purple) => k <= 0 ? '' : scaleAt(x, y, k, `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${col}" stroke-width="7"/>
    <line x1="${x}" y1="${y}" x2="${f1(x + Math.cos(t * 1.4) * r * 0.62)}" y2="${f1(y + Math.sin(t * 1.4) * r * 0.62)}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/>
    <line x1="${x}" y1="${y}" x2="${f1(x + Math.cos(t * 0.2) * r * 0.42)}" y2="${f1(y + Math.sin(t * 0.2) * r * 0.42)}" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="6" fill="${col}"/>`);

  // Standard kicker + swapping headlines.
  const TYPES = ['vault-locks', 'false-start', 'stage-crew', 'mirror-check', 'metro-line', 'cookie-cutter', 'open-sign', 'gift-box', 'fishing-dock', 'stay-dog'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['sd3-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ================= Module 2 · Lesson 1: The Three-BOS Execution Sequence ================= */
  Object.assign(LIVE, {
    // Three locks on one vault door: each BOS turns one lock, each with its own job.
    'sd3-vault-locks': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const dk = pop(t, T.door, 0.8);
      const LX = [820, 1080, 1340], LY = 660;
      let d = `<rect x="640" y="410" width="880" height="590" rx="36" fill="${DK.purple}"/>
        <rect x="668" y="438" width="824" height="562" rx="26" fill="#9C96D9"/>
        <rect x="690" y="460" width="780" height="540" rx="20" fill="none" stroke="#B9B4E6" stroke-width="6"/>`;
      [[700, 470], [1460, 470], [700, 980], [1460, 980]].forEach(([x, y]) => d += `<circle cx="${x}" cy="${y}" r="9" fill="${DK.purple}"/>`);
      d += `<rect x="1490" y="600" width="60" height="150" rx="14" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/>`;
      out += scaleAt(1080, 1000, dk, d);
      const jobs = [['BOS #1', '15M close', 'direction'], ['BOS #2', '5M close', 'continuation'], ['BOS #3', '5M close', 'activates the zone']];
      if (dk > 0) LX.forEach((x, i) => {
        const at = T.locks[i], u = ease(seg(t, at, at + 0.9)), lk = pop(t, T.door + 0.4 + i * 0.25, 0.5);
        let l = `<circle cx="${x}" cy="${LY}" r="86" fill="${u > 0.5 ? C.tealL : '#fff'}" stroke="${u > 0.5 ? DK.teal : DK.purple}" stroke-width="8"/>`;
        for (let a = 0; a < 12; a++) l += `<line x1="${f1(x + Math.cos(rad(a * 30)) * 62)}" y1="${f1(LY + Math.sin(rad(a * 30)) * 62)}" x2="${f1(x + Math.cos(rad(a * 30)) * 74)}" y2="${f1(LY + Math.sin(rad(a * 30)) * 74)}" stroke="${C.muted}" stroke-width="4"/>`;
        l += rotAt(x, LY, u * 90, `<rect x="${x - 12}" y="${LY - 58}" width="24" height="116" rx="12" fill="${u > 0.5 ? DK.teal : DK.purple}"/>`) + `<circle cx="${x}" cy="${LY}" r="16" fill="${C.gold}"/>`;
        l += txt(x, LY - 98, i + 1, 32, '#fff');
        out += scaleAt(x, LY, lk, l);
        out += check(x + 66, LY - 66, pop(t, at + 0.7, 0.5), C.teal, 26);
        const pk = pop(t, at + 0.2, 0.6);
        if (pk > 0) out += scaleAt(x, 830, pk, `<rect x="${x - 118}" y="768" width="236" height="128" rx="18" fill="#fff"/>
          ${txt(x, 810, jobs[i][0], 32, DK.purple)}${txt(x, 843, jobs[i][1], 24, C.muted, { w: 700 })}${txt(x, 880, jobs[i][2], i === 2 ? 23 : 26, [DK.teal, DK.teal, C.pink][i])}`);
        if (t > at + 0.7) out += A.sparkle(x, LY, at + 0.7, t);
      });
      // The zone lamp above the locks: lights when BOS #3 turns the last lock.
      const zk = ease(seg(t, T.locks[2] + 0.8, T.locks[2] + 1.4));
      if (dk > 0) out += scaleAt(1080, 474, pop(t, T.door + 0.9, 0.5), `${zk > 0.5 ? `<rect x="880" y="428" width="400" height="92" rx="46" fill="${C.gold}" opacity="${f1(0.25 * zk)}"/>` : ''}<rect x="900" y="446" width="360" height="56" rx="28" fill="${zk > 0.5 ? C.gold : '#7C76B8'}"/>${txt(1080, 484, zk > 0.5 ? 'ZONE · ACTIVE' : 'ZONE · not active', 28, zk > 0.5 ? C.dark : '#E4E1F7', { ls: 2 })}`);
      // Progress counter on the door.
      out += pill(1080, 948, '1 of 3 · not yet', C.muted, between(t, T.locks[0] + 1.2, T.locks[1] - 0.3), 26);
      out += pill(1080, 948, '2 of 3 · not yet', C.muted, between(t, T.locks[1] + 1.2, T.locks[2] - 0.3), 26);
      out += pill(1080, 948, '3 breaks · 3 jobs ✓', DK.teal, pop(t, T.locks[2] + 1.6, 0.6), 26);
      // Someone tries the door.
      const p = { x: 380, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 3, at: T.door + 0.3, talk: ctx.talking && t > T.door + 0.5 && t < T.locks[0] };
      if (t > T.locks[0] + 2 && t < T.locks[1]) p.frontArm = aim(p, 520, 760);
      out += who(t, p);
      out += bub(390, 610, 'Three locks? 🔐', between(t, T.door + 0.9, T.locks[0] - 0.3), { size: 28 });
      out += bub(390, 610, 'Open yet? 🤔', between(t, T.locks[0] + 2.4, T.locks[1] - 0.4), { size: 28 });
      out += bub(390, 610, 'One job each ✓', between(t, T.locks[2] + 2, s.end), { size: 28 });
      return out;
    },

    // The sequence on a chart (15M, then 5M) beside a running track: jumping in at BOS #1 is a false start.
    'sd3-false-start': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const box = { x: 170, y: 450, w: 800, h: 440 };
      // 15M chart: wick through the level doesn't count; the close does (BOS #1).
      const k15 = between(t, T.chart, T.five - 0.4, 0.7);
      if (k15 > 0) {
        const o = Object.assign({}, box, { n: 8, bars: F15, tf: '15M', lo: 0.2, hi: 0.72, maxBody: 46, times: span([], 0, 5, T.chart + 0.4, 0.18) });
        o.form = t < T.close ? { i: 6, t0: T.wick, t1: T.wick + 1.6, path: [.49, .48, .56, .61, .53] } : null;
        if (t >= T.close) o.times[6] = -10;
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [], form: null }));
        c += hline(g, .55, g.X(3) - 30, box.x + box.w, C.purple, ease(seg(t, T.chart + 1.4, T.chart + 2.2)));
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        if (t >= T.close) c += cc(t, Object.assign({}, o, { panel: false, tf: null, times: [], form: { i: 7, t0: T.close, t1: T.close + 1.4, path: [.53, .52, .60, .65, .63] } }));
        c += pill(g.X(1.3), g.Y(.55), '15M level', C.purple, pop(t, T.chart + 2, 0.5), 20);
        c += pill(g.X(6), g.Y(.61) - 40, 'wick ✗ doesn’t count', C.pink, between(t, T.wick + 1.7, T.close + 1.6), 22);
        c += pill(g.X(7) - 130, g.Y(.65) - 40, 'BOS #1 · 15M close ✓', DK.teal, pop(t, T.close + 1.5, 0.5), 22);
        out += fade(k15, scaleAt(570, 670, Math.min(1, k15 * 1.2), c));
      }
      // 5M chart: Correction #1, BOS #2, Correction #2 (zone), BOS #3.
      const k5 = pop(t, T.five, 0.7);
      if (k5 > 0) {
        const times = span([], 0, 4, T.five + 0.2, 0.1);
        span(times, 5, 8, T.bos2 - 0.4, 0.14); span(times, 9, 11, T.c2, 0.18); times[12] = T.bos3 - 0.3;
        const o = Object.assign({}, box, { n: 15, bars: BULL.slice(0, 14), tf: '5M', lo: 0.18, hi: 0.70, times, form: { i: 13, t0: T.bos3, t1: T.bos3 + 1.2, path: [.56, .55, .62, .67, .66] } });
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [], form: null }));
        c += hline(g, .30, box.x, box.x + box.w, C.purple, ease(seg(t, T.five + 0.2, T.five + 0.8)), 3);
        c += shade(g, 3, 4, .30, .48, C.peach, seg(t, T.c1, T.c1 + 0.4)) + shade(g, 9, 11, .45, .62, C.pink, seg(t, T.c2 + 0.4, T.c2 + 0.8));
        c += hline(g, .48, g.X(2), g.X(7) + 20, C.muted, ease(seg(t, T.bos2 - 0.4, T.bos2 + 0.2)), 3);
        c += hline(g, .62, g.X(8), g.X(13) + 20, C.muted, ease(seg(t, T.bos3 - 0.6, T.bos3)), 3);
        c += zone(g, ZB, 11, box.x + box.w, seg(t, T.zone, T.zone + 0.8), t > T.bos3 + 1.2 ? 1 : 0);
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        c += pill(box.x + box.w - 80, g.Y(.30) + 28, '15M level', C.purple, pop(t, T.five + 0.6, 0.5), 18);
        c += bracket(g, 3, 4, g.Y(.28), 'Correction #1', DK.peach, pop(t, T.c1, 0.5), 18);
        c += pill(g.X(7), g.Y(.54) - 36, 'BOS #2', DK.teal, pop(t, T.bos2 + 0.2, 0.5), 20);
        c += bracket(g, 9, 11, g.Y(.43), 'Correction #2', C.pink, between(t, T.c2 + 0.5, T.zone), 18);
        c += pill(g.X(10), g.Y(.43) + 30, 'creates the zone', DK.peach, between(t, T.zone + 0.4, T.bos3 + 1), 18);
        c += pill(g.X(13), g.Y(.67) - 36, 'BOS #3', DK.teal, pop(t, T.bos3 + 1.2, 0.5), 20);
        c += pill(g.X(10), g.Y(.43) + 30, 'zone active ✓', DK.teal, pop(t, T.bos3 + 1.4, 0.5), 18);
        out += scaleAt(570, 670, k5, c);
        out += pill(570, 960, 'now wait for the retest ⏳', DK.purple, pop(t, T.wait, 0.6), 26);
      }
      // Scoreboard.
      const sb = pop(t, T.chart + 0.6, 0.6);
      if (sb > 0) {
        let b = `<rect x="1130" y="420" width="680" height="120" rx="22" fill="${C.dark}"/>`;
        [['BOS #1', T.close + 1.5], ['BOS #2', T.bos2 + 0.2], ['BOS #3', T.bos3 + 1.2]].forEach(([lab, at], i) => {
          const on = t > at, x = 1250 + i * 220;
          b += `<rect x="${x - 96}" y="440" width="192" height="80" rx="14" fill="${on ? C.teal : '#4A3A30'}"/>${txt(x, 492, lab, 30, on ? C.dark : '#9C8A80')}`;
        });
        out += scaleAt(1470, 480, sb, b);
      }
      // Running track and the eager runner.
      out += `<rect x="1100" y="1000" width="820" height="80" fill="#E9B9A0"/><rect x="1100" y="1036" width="820" height="4" fill="#fff" opacity=".8"/>`;
      out += `<rect x="1286" y="1000" width="10" height="80" fill="#fff"/>`;
      const j = ease(seg(t, T.jump, T.jump + 0.8)), back2 = ease(seg(t, T.five + 0.4, T.five + 2.4));
      const rx = lerp(1330, 1640, j) - (1640 - 1330) * back2 * (j > 0 ? 1 : 0);
      const r = { x: rx, y: 1000, scale: 0.9, look: A.LOOKS.c, seed: 5, at: T.chart + 0.8, walking: (j > 0 && j < 1) || (back2 > 0 && back2 < 1), flip: back2 > 0 && back2 < 1,
        talk: ctx.talking && t > T.jump && t < T.jump + 3 };
      if (t > T.jump && t < T.five) r.frontArm = { a1: -60, a2: -80 };
      out += who(t, r);
      out += bub(rx - 20, 600, 'Go! 🏃', between(t, T.jump, T.jump + 1.6), { size: 28 });
      out += stamp(1340, 800, 'FALSE START', C.pink, between(t, T.jump + 1, T.five + 0.2, 0.4), -10, 120, 30);
      out += bub(1480, 640, 'OK. All three first 😅', between(t, T.five + 2.4, T.wait - 0.2), { size: 26 });
      out += bub(1480, 640, 'Now I wait ⏳', between(t, T.wait + 0.3, s.end), { size: 26 });
      return out;
    },
  });

  /* ================= Module 2 · Lesson 2: Recognizing the First Correction ================= */
  Object.assign(LIVE, {
    // A theatre stage: Correction #1 sets the stage; the zone comes later, from Correction #2.
    'sd3-stage-crew': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000, '#F3E3D3', '#E3CBB4');
      // Proscenium and floor.
      const sk = pop(t, T.curtain, 0.7);
      out += scaleAt(960, 1000, sk, `<rect x="250" y="380" width="1380" height="620" rx="20" fill="#8E3A4E"/><rect x="290" y="420" width="1300" height="520" fill="#3B2A35"/>
        <rect x="270" y="930" width="1340" height="70" fill="#C99566"/><rect x="270" y="930" width="1340" height="10" fill="#A87A4E"/>`);
      const box = { x: 420, y: 470, w: 1040, h: 400 };
      if (sk > 0) {
        const times = span([], 0, 2, T.curtain + 1.2, 0.15);
        span(times, 3, 4, T.c1, 0.35); span(times, 5, 11, T.never, 0.18);
        const o = Object.assign({}, box, { n: 13, bars: BULL.slice(0, 12), tf: '5M', lo: 0.18, hi: 0.66, times, bg: '#FFFDF9' });
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [] }));
        // Spotlight on Correction #1.
        const sp = between(t, T.c1 + 0.2, T.never + 0.8, 0.6);
        if (sp > 0) c += `<path d="M${f1(g.X(3.5) - 30)},${box.y - 30} L${f1(g.X(3.5) + 30)},${box.y - 30} L${f1(g.X(3.5) + 110)},${box.y + box.h + 30} L${f1(g.X(3.5) - 110)},${box.y + box.h + 30} Z" fill="${C.gold}" opacity="${f1(0.22 * sp)}"/>`;
        c += hline(g, .30, box.x, box.x + box.w, C.purple, ease(seg(t, T.curtain + 0.8, T.curtain + 1.6)));
        c += pill(g.X(9), g.Y(.30) + 32, '15M level · BOS #1 closed above', C.purple, pop(t, T.curtain + 1.4, 0.5), 20);
        c += zone(g, ZB, 11, box.x + box.w, seg(t, T.never + 1.6, T.never + 2.4), 0);
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        if (t < T.never + 0.4) c += arrow(g.X(3) + 46, g.Y(.49), g.X(4) + 50, g.Y(.37), DK.peach, seg(t, T.c1 + 0.4, T.c1 + 1.2));
        c += bracket(g, 3, 4, g.Y(.56), 'Correction #1', DK.peach, pop(t, T.c1 + 0.6, 0.5), 20, true);
        c += pill(g.X(4) + 40, g.Y(.30) + 74, 'toward the 15M break · preferred', C.purple, between(t, T.toward + 0.4, T.never - 0.2), 20);
        c += pill(g.X(7), g.Y(.54) - 34, 'BOS #2', DK.teal, pop(t, T.never + 0.8, 0.5), 18);
        c += pill(g.X(9.5), g.Y(.47) + 44, 'zone · from Correction #2', DK.teal, pop(t, T.never + 2.2, 0.5), 20);
        c += pill(g.X(3.5), g.Y(.56) - 80, 'never the zone ✗', C.pink, pop(t, T.never + 3, 0.5), 22);
        out += scaleAt(960, 1000, sk, c);
      }
      // Curtains opening.
      const op = ease(seg(t, T.curtain + 0.3, T.curtain + 1.6));
      const cw = lerp(660, 110, op);
      const curtain = (x0, dir) => {
        let g = `<rect x="${dir > 0 ? x0 : x0 - cw}" y="380" width="${f1(cw)}" height="560" fill="#C2475F"/>`;
        for (let i = 1; i < 6; i++) { const x = dir > 0 ? x0 + cw * i / 6 : x0 - cw * i / 6; g += `<line x1="${f1(x)}" x2="${f1(x)}" y1="380" y2="940" stroke="#9E3449" stroke-width="5"/>`; }
        return g;
      };
      if (sk > 0) out += scaleAt(960, 1000, sk, curtain(290, 1) + curtain(1590, -1) + `<rect x="250" y="360" width="1380" height="50" rx="12" fill="#8E3A4E"/>${txt(940, 397, 'TONIGHT: THE SEQUENCE', 26, C.gold, { ls: 4 })}`);
      // The stagehand.
      const h = { x: 1760, y: 1000, scale: 0.85, look: A.LOOKS.e, seed: 4, at: T.curtain + 0.6, flip: true, hat: 'hard', talk: ctx.talking && t > T.never + 3 };
      out += who(t, h);
      out += bub(1680, 640, 'Setting the stage 🎭', between(t, T.c1 + 1, T.never - 0.2), { size: 26, tail: 'right' });
      out += bub(1680, 640, 'The zone comes later', between(t, T.never + 3.4, s.end), { size: 24, tail: 'right' });
      return out;
    },

    // A mirror: the bearish Correction #1 is the mirror image. Then the sequence stops: no BOS #2, no trade.
    'sd3-mirror-check': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Left: the bullish card.
      const lk = pop(t, T.mirror, 0.6);
      if (lk > 0) {
        const o = { x: 150, y: 490, w: 440, h: 170, n: 6, bars: BULL.slice(0, 5), times: [-9, -9, -9, -9, -9], lo: 0.2, hi: 0.54, maxBody: 34 };
        const g = G(o);
        let c = cc(t, o) + hline(g, .30, o.x, o.x + o.w, C.purple, 1, 3);
        c += txt(370, 440, 'BULLISH', 24, DK.teal, { ls: 3 }) + pill(370, 728, 'Correction #1 pulls down', DK.peach, 1, 20);
        out += scaleAt(370, 600, lk, c);
      }
      const p = { x: 330, y: 1000, scale: 0.68, look: A.LOOKS.d, seed: 6, at: T.mirror + 0.3, talk: ctx.talking && t > T.rest };
      if (t > T.bear && t < T.follow) p.frontArm = aim(p, 520, 800);
      out += who(t, p);
      out += bub(560, 840, 'Same job, flipped ✓', between(t, T.bear + 1.6, T.follow - 0.2), { size: 24 });
      // The mirror with the bearish chart.
      const mk = pop(t, T.mirror + 0.3, 0.8);
      if (mk > 0) {
        let m = `<rect x="740" y="390" width="1080" height="610" rx="60" fill="${C.gold}"/><rect x="764" y="414" width="1032" height="586" rx="44" fill="#C98A1F"/>
          <rect x="780" y="430" width="1000" height="570" rx="36" fill="#EEF6F8"/>
          <path d="M840,460 L900,460 L820,560 Z M1700,460 L1740,460 L1640,600 Z" fill="#fff" opacity=".7"/>`;
        m += txt(1280, 482, 'BEARISH', 24, C.pink, { ls: 3 });
        const times = span([], 0, 2, T.bear, 0.15);
        span(times, 3, 4, T.bear + 1.6, 0.35); span(times, 5, 10, T.follow + 0.6, 0.6);
        const o = { x: 860, y: 540, w: 840, h: 340, n: 12, bars: mir(NO_BOS2), times, lo: 0.47, hi: 0.81, panel: false };
        const g = G(o);
        m += hline(g, .70, o.x - 20, o.x + o.w, C.purple, ease(seg(t, T.bear - 0.2, T.bear + 0.6)));
        m += pill(o.x + o.w - 220, g.Y(.70) - 30, '15M level · BOS #1 closed below', C.purple, pop(t, T.bear + 0.6, 0.5), 20);
        m += hline(g, .52, g.X(2), o.x + o.w, C.muted, ease(seg(t, T.follow, T.follow + 0.8)), 3);
        m += cc(t, o);
        if (t < T.follow + 0.6) m += arrow(g.X(3) + 46, g.Y(.53), g.X(4) + 50, g.Y(.65), DK.peach, seg(t, T.bear + 2.2, T.bear + 3));
        m += bracket(g, 3, 4, g.Y(.505), 'Correction #1 pulls up', DK.peach, pop(t, T.bear + 2.6, 0.5), 20);
        m += pill(g.X(9), g.Y(.52) + 40, 'no 5M close below ✗', C.pink, pop(t, T.none - 1.2, 0.5), 20);
        m += pill(1280, 960, 'no BOS #2 · sequence incomplete', C.pink, pop(t, T.none, 0.5), 24);
        out += scaleAt(1280, 1000, mk, m);
        out += stamp(1070, 545, 'NO TRADE', C.pink, pop(t, T.none + 0.6, 0.5), -12, 96, 30);
      }
      out += pill(960, 1046, 'Correction #1 sets the stage. The rest has to follow.', DK.purple, pop(t, T.rest, 0.6), 24);
      return out;
    },
  });

  /* ================= Module 2 · Lesson 3: Recognizing the Second Correction ================= */
  Object.assign(LIVE, {
    // A metro line: the stops come in order, so the order of the breaks tells you which correction you're in.
    'sd3-metro-line': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const SX = [340, 610, 880, 1150, 1420], LY = 500;
      const names = ['BOS #1', 'Correction #1', 'BOS #2', 'Correction #2', 'BOS #3'];
      const mk = pop(t, T.map, 0.7);
      if (mk > 0) {
        let m = `<rect x="200" y="400" width="1360" height="200" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
          <line x1="300" x2="1460" y1="${LY}" y2="${LY}" stroke="${C.purpleL}" stroke-width="18" stroke-linecap="round"/>`;
        // Travelled part of the line.
        const pos = lerp(SX[0], SX[1], ease(seg(t, T.s1, T.s1 + 1.2))) + (SX[3] - SX[1]) * ease(seg(t, T.s2, T.s2 + 1.6));
        m += `<line x1="300" x2="${f1(pos)}" y1="${LY}" y2="${LY}" stroke="${C.purple}" stroke-width="18" stroke-linecap="round"/>`;
        SX.forEach((x, i) => {
          const brk = i % 2 === 0, col = brk ? DK.purple : (i === 1 ? DK.peach : C.pink);
          const pulse = brk && t > T.count ? 1 + 0.18 * Math.max(0, Math.sin((t - T.count - i * 0.35) * 5)) * (t < T.count + 2.6 ? 1 : 0) : 1;
          m += brk ? scaleAt(x, LY, pulse, `<rect x="${x - 26}" y="${LY - 26}" width="52" height="52" rx="10" fill="#fff" stroke="${col}" stroke-width="8"/>${txt(x, LY + 11, i / 2 + 1, 28, col)}`)
            : `<circle cx="${x}" cy="${LY}" r="28" fill="#fff" stroke="${col}" stroke-width="8"/>`;
          m += txt(x, i % 2 ? LY + 72 : LY - 46, names[i], 26, col);
        });
        // The tram.
        m += `<g transform="translate(${f1(pos)},${LY - 4})"><rect x="-46" y="-34" width="92" height="52" rx="16" fill="${C.gold}" stroke="#C98A1F" stroke-width="4"/><rect x="-34" y="-24" width="28" height="20" rx="4" fill="#fff"/><rect x="6" y="-24" width="28" height="20" rx="4" fill="#fff"/></g>`;
        out += scaleAt(880, 500, mk, m);
        out += pill(SX[1], 640, 'never the zone ✗', C.pink, pop(t, T.never + 0.2, 0.5), 22);
        out += pill(SX[3], 640, 'creates the zone ✓', DK.teal, pop(t, T.never + 2.2, 0.5), 22);
      }
      // A 5M chart underneath, lit in step with the tram.
      const ck = pop(t, T.map + 1, 0.7);
      if (ck > 0) {
        const times = span([], 0, 4, T.s1, 0.2);
        span(times, 5, 11, T.s2, 0.2); span(times, 12, 13, T.count + 0.8, 0.3);
        const o = { x: 300, y: 710, w: 1160, h: 240, n: 15, bars: BULL.slice(0, 14), times, lo: 0.25, hi: 0.68, maxBody: 30 };
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [] }));
        c += shade(g, 3, 4, .30, .50, C.peach, seg(t, T.s1 + 1, T.s1 + 1.6)) + shade(g, 9, 11, .45, .64, C.pink, seg(t, T.s2 + 1.6, T.s2 + 2.2));
        c += zone(g, ZB, 11, o.x + o.w, seg(t, T.never + 2.4, T.never + 3.2), 0);
        c += cc(t, Object.assign({}, o, { panel: false }));
        c += txt(o.x - 6, o.y + 8, '5M', 22, C.purple, { a: 'start' });
        out += scaleAt(880, 830, ck, c);
      }
      // The rider.
      const r = { x: 1730, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 2, at: T.map + 0.4, flip: true, talk: ctx.talking && t > T.count };
      if (t > T.count) r.frontArm = { a1: -110, a2: -100 };
      out += who(t, r);
      out += bub(1690, 640, 'Which stop is this? 🚇', between(t, T.map + 0.8, T.s1 - 0.2), { size: 26, tail: 'right' });
      out += bub(1690, 640, 'After BOS #1 ✓', between(t, T.s1 + 1.4, T.s2 - 0.2), { size: 26, tail: 'right' });
      out += bub(1690, 640, 'After BOS #2 ✓', between(t, T.s2 + 1.8, T.never + 1.6), { size: 26, tail: 'right' });
      out += bub(1690, 640, 'Count the breaks ✓', between(t, T.count + 0.4, s.end), { size: 26, tail: 'right' });
      return out;
    },

    // A baker cuts ONE cookie from the tray: one candle makes the zone, not the whole correction.
    'sd3-cookie-cutter': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const box = { x: 160, y: 460, w: 860, h: 420 };
      const ck = pop(t, T.chart, 0.7);
      if (ck > 0) {
        const times = span([], 0, 11, T.chart + 0.2, 0.12);
        span(times, 12, 16, T.nob, 0.45);
        const o = Object.assign({}, box, { n: 18, bars: NO_BOS3, times, tf: '5M', lo: 0.2, hi: 0.68, maxBody: 30 });
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [] }));
        const wb = between(t, T.whole, T.whole + 1.6, 0.4);
        if (wb > 0) {
          const xa = g.X(9) - g.bw / 2 - 10, xb = g.X(11) + g.bw / 2 + 10;
          c += fade(wb, `<rect x="${f1(xa)}" y="${f1(g.Y(.62))}" width="${f1(xb - xa)}" height="${f1(g.Y(.46) - g.Y(.62))}" rx="10" fill="none" stroke="${C.pink}" stroke-width="5" stroke-dasharray="12 8"/>`) + cross(xb + 8, g.Y(.62) - 6, wb, C.pink, 24);
        }
        c += zone(g, ZB, 11, box.x + box.w, seg(t, T.pot, T.pot + 0.8), 0);
        c += hline(g, .62, g.X(8), box.x + box.w, C.muted, ease(seg(t, T.nob, T.nob + 0.8)), 3);
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        c += glow(g, ZB, 11, pop(t, T.pick, 0.5) * (t < T.pot ? 1 : 0));
        c += pill(g.X(3.5), g.Y(.32) + 36, 'Correction #1', DK.peach, pop(t, T.chart + 0.8, 0.5), 18);
        c += pill(g.X(7), g.Y(.54) - 34, 'BOS #2', DK.teal, pop(t, T.chart + 1.2, 0.5), 18);
        c += bracket(g, 9, 11, g.Y(.65), 'Correction #2', C.pink, between(t, T.chart + 1.6, T.pot - 0.2), 18, true);
        c += pill(g.X(11) - 10, g.Y(.47) + 40, 'last bearish candle', DK.peach, between(t, T.pick + 0.4, T.pot - 0.2), 20);
        c += pill(g.X(12) + 70, g.Y(.47) + 40, 'potential zone', DK.peach, pop(t, T.pot + 0.6, 0.5), 20);
        c += pill(g.X(15), g.Y(.62) - 30, 'no close above ✗', C.pink, pop(t, T.nob + 2.4, 0.5), 18);
        out += scaleAt(590, 670, ck, c);
        out += pill(590, 950, 'supply: the last bullish candle', C.pink, between(t, T.pick + 2.6, T.whole - 0.2), 24);
        out += pill(590, 950, 'one candle ✓ not the whole correction', DK.teal, between(t, T.whole + 1.6, T.pot - 0.2), 24);
        out += stamp(820, 800, 'NO TRADE', C.pink, pop(t, T.nob + 2.8, 0.5), -12, 86, 28);
      }
      // Table, tray and the three "candle" cookies of Correction #2.
      const tk = pop(t, T.chart + 0.6, 0.6);
      if (tk > 0) {
        let tb = `<rect x="1090" y="800" width="400" height="24" rx="8" fill="#B98B62"/><rect x="1110" y="824" width="18" height="176" fill="#9B6A45"/><rect x="1452" y="824" width="18" height="176" fill="#9B6A45"/>
          <rect x="1110" y="774" width="360" height="26" rx="10" fill="#D9D4E8" stroke="#B9B4D0" stroke-width="3"/>`;
        out += scaleAt(1290, 1000, tk, tb);
        const lift = ease(seg(t, T.whole + 1.2, T.whole + 2.2));
        [0, 1, 2].map(i => {
          const x = 1190 + i * 100, y = 772 - (i === 2 ? lift * 150 : 0), sel = i === 2 && t > T.pick;
          out += scaleAt(x, y, tk, `<rect x="${x - 28}" y="${y - 70}" width="56" height="70" rx="12" fill="${sel ? '#E8A47A' : '#D9A06E'}" stroke="${sel ? C.gold : '#B97E4E'}" stroke-width="${sel ? 6 : 4}"/>
            <circle cx="${x - 8}" cy="${y - 48}" r="4" fill="#7A4A2A"/><circle cx="${x + 9}" cy="${y - 30}" r="4" fill="#7A4A2A"/><circle cx="${x - 6}" cy="${y - 16}" r="4" fill="#7A4A2A"/>`);
        });
        out += txt(1290, 880, 'Correction #2', 22, C.muted, { op: tk });
        if (lift > 0) {
          // The cutter around the lifted cookie.
          out += `<rect x="${1390 - 40}" y="${f1(772 - lift * 150 - 84)}" width="80" height="98" rx="16" fill="none" stroke="#A8B0BE" stroke-width="8" opacity="${f1(lift)}"/>`;
          if (t > T.whole + 2.2) out += A.sparkle(1390, 772 - 150 - 36, T.whole + 2.2, t);
        }
        out += pill(1390, 530, 'potential · not active yet', DK.peach, pop(t, T.pot + 0.8, 0.5), 20);
      }
      const b = { x: 1700, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 7, at: T.chart + 0.8, flip: true, hat: 'chef', talk: ctx.talking && t > T.whole && t < T.pot };
      if (t > T.whole + 1 && t < T.pot + 2) b.frontArm = aim(b, 1470, 700);
      out += who(t, b);
      out += bub(1660, 600, 'Just one cookie 🍪', between(t, T.whole + 2.4, T.pot + 2.6), { size: 26, tail: 'right' });
      out += bub(1660, 600, 'Not baked yet…', between(t, T.nob + 1, s.end), { size: 26, tail: 'right' });
      return out;
    },
  });

  /* ================= Module 2 · Lesson 4: BOS #3: Activating the Zone ================= */
  Object.assign(LIVE, {
    // A shop with a neon sign: POTENTIAL until BOS #3 closes, then ACTIVE. A knock (an opposite-colour candle) doesn't open it.
    'sd3-open-sign': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const sk = pop(t, T.shop, 0.8);
      if (sk > 0) {
        let b = `<rect x="300" y="430" width="1260" height="570" fill="#FBE7DA"/><rect x="300" y="430" width="1260" height="570" fill="none" stroke="#E6CDBD" stroke-width="6"/>`;
        for (let i = 0; i < 14; i++) b += `<path d="M${280 + i * 93},400 L${373 + i * 93},400 L${373 + i * 93},450 Q${326 + i * 93},476 ${280 + i * 93},450 Z" fill="${i % 2 ? '#fff' : C.pink}"/>`;
        b += `<rect x="270" y="384" width="1320" height="22" rx="8" fill="${DK.pink}"/>`;
        b += `<rect x="1230" y="660" width="230" height="340" rx="12" fill="${DK.purple}"/><rect x="1252" y="684" width="186" height="140" rx="8" fill="#D9D5F3"/><circle cx="1414" cy="860" r="9" fill="${C.gold}"/>`;
        out += scaleAt(930, 1000, sk, b);
        // Window with the chart.
        const times = span([], 0, 11, -10, 0);
        times[12] = T.green + 0.2;
        const o = { x: 380, y: 520, w: 760, h: 360, n: 16, bars: BULL.slice(0, 14), times, lo: 0.18, hi: 0.72, maxBody: 30, bg: '#fff',
          form: { i: 13, t0: T.bos3 + 1.4, t1: T.bos3 + 3, path: [.56, .55, .60, .67, .66] } };
        const g = G(o);
        const act = t > T.active ? 1 : 0;
        let c = cc(t, Object.assign({}, o, { bars: [], form: null }));
        c += zone(g, ZB, 11, o.x + o.w, 1, act);
        c += hline(g, .62, g.X(8), o.x + o.w, C.purple, ease(seg(t, T.bos3, T.bos3 + 0.8)), 4);
        c += cc(t, Object.assign({}, o, { panel: false }));
        c += txt(o.x - 8, o.y - 2, '5M', 22, C.purple, { a: 'start' });
        c += pill(g.X(10), g.Y(.47) + 36, act ? 'active zone' : 'potential zone', act ? DK.teal : DK.peach, 1, 20);
        c += pill(g.X(12), g.Y(.57) - 34, 'not BOS #3', C.pink, between(t, T.not, T.bos3 - 0.2), 18);
        c += pill(g.X(4) + 30, g.Y(.62) - 28, 'high Correction #2 pulled back from', C.purple, pop(t, T.bos3 + 0.6, 0.5), 18);
        c += pill(g.X(13) - 60, g.Y(.67) - 36, 'BOS #3 · 5M close ✓', DK.teal, pop(t, T.bos3 + 3.1, 0.5), 20);
        out += scaleAt(760, 700, sk, c);
        out += pill(760, 960, 'opposite-colour candle ≠ activation', C.pink, between(t, T.not + 0.2, T.bos3 - 0.2), 24);
        out += pill(760, 960, 'BOS #3 switches it on ✓', DK.teal, pop(t, T.active + 0.2, 0.5), 24);
      }
      // Neon sign.
      const nk = pop(t, T.shop + 0.6, 0.6), on = ease(seg(t, T.active, T.active + 0.5));
      const flick = on > 0 && on < 1 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : on;
      if (nk > 0) {
        let n = `<rect x="1190" y="490" width="310" height="140" rx="22" fill="${C.dark}"/>`;
        if (flick > 0.5) n += `<rect x="1176" y="476" width="338" height="168" rx="30" fill="${C.teal}" opacity=".25"/>`;
        n += txt(1345, 548, 'ZONE', 40, flick > 0.5 ? C.tealL : '#6B5A50', { ls: 6 });
        n += txt(1345, 602, flick > 0.5 ? 'ACTIVE' : 'POTENTIAL', 32, flick > 0.5 ? '#fff' : C.peach, { ls: 3 });
        out += scaleAt(1345, 560, nk, n);
        if (t > T.active) out += A.sparkle(1345, 560, T.active, t, C.teal);
      }
      // The customer knocks on the opposite-colour candle.
      const c2 = { x: 1590, y: 1000, scale: 0.9, look: A.LOOKS.buyer, seed: 8, at: T.shop + 0.8, flip: true, talk: ctx.talking && t > T.green && t < T.not };
      if (t > T.green && t < T.not) c2.frontArm = aim(c2, 1468 + Math.abs(Math.sin(t * 9)) * 14, 790);
      out += who(t, c2);
      out += bub(1680, 620, 'Open? 🛎️', between(t, T.green + 0.4, T.not - 0.2), { size: 28, tail: 'right' });
      out += bub(1680, 620, 'Not yet…', between(t, T.not, T.bos3 + 2), { size: 28, tail: 'right' });
      out += bub(1680, 620, 'Active ✓', between(t, T.active + 0.6, s.end), { size: 28, tail: 'right' });
      return out;
    },

    // The bearish side, then a potential zone that never activates: a gift box that stays taped shut.
    'sd3-gift-box': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      // Bearish panel: BOS #3 is a close below the low Correction #2 pulled back from.
      const bk = pop(t, T.bear, 0.7);
      if (bk > 0) {
        const times = span([], 0, 12, T.bear + 0.2, 0.1);
        const o = { x: 150, y: 490, w: 600, h: 340, n: 15, bars: mir(BULL.slice(0, 14)), times, lo: 0.24, hi: 0.86, maxBody: 24,
          form: { i: 13, t0: T.bear + 2, t1: T.bear + 3.4, path: [.44, .45, .38, .33, .34] } };
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [], form: null }));
        c += txt(450, 486, 'BEARISH · SUPPLY', 22, C.pink, { ls: 3 });
        c += zone(g, mir([ZB])[0], 11, o.x + o.w, 1, t > T.bear + 3.6 ? 1 : 0);
        c += hline(g, .38, g.X(8), o.x + o.w, C.purple, ease(seg(t, T.bear + 1.4, T.bear + 2)), 3);
        c += cc(t, Object.assign({}, o, { panel: false }));
        c += pill(g.X(13) - 90, g.Y(.33) + 40, 'BOS #3 · close below ✓', DK.teal, pop(t, T.bear + 3.6, 0.5), 18);
        out += scaleAt(450, 660, bk, c);
      }
      // Bullish panel that never activates.
      const rk = pop(t, T.nb, 0.7);
      if (rk > 0) {
        const times = span([], 0, 12, T.nb + 0.2, 0.08);
        span(times, 13, 16, T.green, 0.9);
        const o = { x: 900, y: 490, w: 880, h: 340, n: 18, bars: NO_BOS3, times, lo: 0.2, hi: 0.68, maxBody: 28 };
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [] }));
        c += txt(1340, 486, 'BULLISH · DEMAND', 22, DK.teal, { ls: 3 });
        // The potential zone, wrapped like a gift.
        const zk = seg(t, T.nb + 1.4, T.nb + 2.2);
        if (zk > 0) {
          const xa = g.X(11) - g.bw / 2 - 6, xb = lerp(xa, o.x + o.w, ease(zk)), y0 = g.Y(ZB[2]), y1 = g.Y(ZB[3]), mx = (xa + xb) / 2;
          c += `<rect x="${f1(xa)}" y="${f1(y0)}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}" rx="6" fill="${C.pinkL}" opacity=".45"/>
            <rect x="${f1(mx - 7)}" y="${f1(y0)}" width="14" height="${f1(y1 - y0)}" fill="${C.purple}" opacity=".55"/>
            <rect x="${f1(xa)}" y="${f1(y0)}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}" rx="6" fill="none" stroke="${DK.peach}" stroke-width="4" stroke-dasharray="10 7"/>`;
          const tp = ease(seg(t, T.tape, T.tape + 0.6));
          if (tp > 0) c += `<g opacity="${f1(tp)}"><rect x="${f1(mx - 70)}" y="${f1((y0 + y1) / 2 - 9)}" width="140" height="18" fill="#E8D9A8" transform="rotate(-18 ${f1(mx)} ${f1((y0 + y1) / 2)})"/><rect x="${f1(mx - 70)}" y="${f1((y0 + y1) / 2 - 9)}" width="140" height="18" fill="#E8D9A8" transform="rotate(18 ${f1(mx)} ${f1((y0 + y1) / 2)})"/></g>`;
        }
        c += hline(g, .62, g.X(8), o.x + o.w, C.purple, ease(seg(t, T.green - 0.6, T.green)), 3);
        c += cc(t, Object.assign({}, o, { panel: false }));
        c += pill(g.X(12) + 40, g.Y(.47) + 40, 'potential zone', DK.peach, pop(t, T.nb + 2.2, 0.5), 18);
        c += pill(g.X(15), g.Y(.62) - 30, 'no close above ✗', C.pink, pop(t, T.green + 3.8, 0.5), 18);
        out += scaleAt(1340, 660, rk, c);
        out += stamp(1600, 770, 'NO TRADE', C.pink, pop(t, T.tape + 0.6, 0.5), -12, 80, 26);
      }
      out += pill(960, 930, 'BOS #3 isn’t an entry · wait for price to come back', DK.purple, pop(t, T.wait + 1, 0.6), 26);
      out += clock(1450, 930, 40, t, pop(t, T.wait + 1.4, 0.5));
      return out;
    },
  });

  /* ================= Module 2 · Lesson 5: Waiting for the Retest ================= */
  Object.assign(LIVE, {
    // Fishing from a dock: you wait; the first return of price to the active zone is the retest (a bite).
    'sd3-fishing-dock': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const box = { x: 150, y: 450, w: 900, h: 440 };
      const ck = pop(t, T.chart, 0.7);
      let bite = 0;
      if (ck > 0) {
        const times = span([], 0, 13, T.chart + 0.2, 0.08);
        span(times, 14, 16, T.away + 0.2, 1);
        const o = Object.assign({}, box, { n: 20, bars: BULL.slice(0, 18), times, tf: '5M', lo: 0.2, hi: 0.8, maxBody: 30,
          form: { i: 17, t0: T.retest, t1: T.retest + 2, path: [.60, .61, .56, .51, .53] } });
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [], form: null }));
        c += zone(g, ZB, 11, box.x + box.w, 1, 1);
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        c += pill(g.X(13) - 54, g.Y(.67) - 20, 'BOS #3', DK.teal, pop(t, T.chart + 1.4, 0.5), 18);
        c += pill(g.X(11) + 30, g.Y(.47) + 36, 'active zone', DK.teal, pop(t, T.chart + 1.6, 0.5), 20);
        c += arrow(g.X(14.6) + 36, g.Y(.71), g.X(16.4) + 36, g.Y(.59), C.muted, seg(t, T.wait + 0.4, T.wait + 1.2), 4);
        c += pill(g.X(17), g.Y(.51) + 44, 'the retest ✓', DK.teal, pop(t, T.retest + 2.2, 0.5), 22);
        out += scaleAt(600, 670, ck, c);
        out += pill(600, 950, 'wait for price to return to the zone', DK.purple, between(t, T.wait, T.retest + 2), 24);
        out += pill(600, 950, 'first return after BOS #3 = the retest', DK.teal, between(t, T.retest + 2.6, T.model - 0.2), 24);
        out += pill(600, 950, 'now the entry model applies', DK.purple, pop(t, T.model, 0.5), 24);
        out += pill(600, 1040, 'exact entry: follow your plan', DK.peach, pop(t, T.model + 2.4, 0.5), 22);
        bite = seg(t, T.retest + 1.4, T.retest + 1.8) * (1 - seg(t, T.retest + 4, T.retest + 4.6));
      }
      // Water and dock.
      out += `<rect x="1120" y="880" width="800" height="200" fill="#9FD8E8"/><path d="M1120,880 ${Array.from({ length: 9 }, (_, i) => `Q${1165 + i * 90},${868 + Math.sin(t * 2 + i) * 6} ${1210 + i * 90},880`).join(' ')} L1920,1080 L1120,1080 Z" fill="#8CCDE0"/>`;
      out += `<rect x="1180" y="852" width="420" height="26" rx="6" fill="#B98B62"/>${[1210, 1360, 1560].map(x => `<rect x="${x}" y="878" width="18" height="140" fill="#9B6A45"/>`).join('')}`;
      // Angler with rod.
      const a = { x: 1390, y: 852, scale: 0.85, look: A.LOOKS.c, seed: 3, at: T.chart + 0.4, hat: 'cap', talk: ctx.talking && t > T.wait && t < T.retest };
      a.frontArm = { a1: -30, a2: -40 };
      const hx = 1390 + 18 * 0.85 + 58 * 0.85 * Math.cos(rad(-30)) + 54 * 0.85 * Math.cos(rad(-40)), hy = 852 - 196 * 0.85 + 58 * 0.85 * Math.sin(rad(-30)) + 54 * 0.85 * Math.sin(rad(-40));
      const tipX = 1760, tipY = 560, bobY = 905 + bite * 22 + Math.sin(t * 2.4) * 3;
      if (pop(t, T.chart + 0.4, 0.6) > 0.6) out += `<line x1="${f1(hx)}" y1="${f1(hy)}" x2="${tipX}" y2="${tipY}" stroke="#7A4A2A" stroke-width="7" stroke-linecap="round"/>
        <line x1="${tipX}" y1="${tipY}" x2="1790" y2="${f1(bobY - 12)}" stroke="#7A5C50" stroke-width="2"/>
        <circle cx="1790" cy="${f1(bobY)}" r="13" fill="${C.pink}"/><rect x="1777" y="${f1(bobY)}" width="26" height="13" fill="#fff"/>`;
      out += who(t, a);
      if (bite > 0.5) out += A.sparkle(1790, 905, T.retest + 1.6, t, C.teal);
      out += clock(1660, 470, 46, t, between(t, T.away, T.retest + 1));
      out += bub(1380, 440, 'I’ll wait 🎣', between(t, T.wait + 0.2, T.retest + 1.2), { size: 26 });
      out += bub(1380, 440, 'There it is!', between(t, T.retest + 1.8, T.model - 0.2), { size: 26 });
      return out;
    },

    // Price never returns (bearish). The dog wants to chase the ball; the owner says "Stay".
    'sd3-stay-dog': (s, t, ctx) => {
      const T = s.beats;
      let out = ground(1000);
      const box = { x: 150, y: 450, w: 880, h: 420 };
      const ck = pop(t, T.chart, 0.7);
      if (ck > 0) {
        const times = span([], 0, 13, T.chart + 0.2, 0.08);
        span(times, 14, 19, T.run, 0.7);
        const o = Object.assign({}, box, { n: 21, bars: mir(MISSED), times, tf: '5M', lo: 0.06, hi: 0.9, maxBody: 28 });
        const g = G(o);
        let c = cc(t, Object.assign({}, o, { bars: [] }));
        c += zone(g, mir([ZB])[0], 11, box.x + box.w, 1, 1);
        c += cc(t, Object.assign({}, o, { panel: false, tf: null }));
        c += pill(g.X(11.5), g.Y(.36), 'BOS #3', DK.teal, pop(t, T.chart + 1.4, 0.5), 18);
        c += pill(g.X(14), g.Y(.53) - 26, 'active supply zone', DK.teal, pop(t, T.chart + 1.6, 0.5), 20);
        c += arrow(g.X(15) + 30, g.Y(.36), g.X(15) + 30, g.Y(.45), C.pink, seg(t, T.run + 3.4, T.run + 4), 4);
        c += pill(g.X(18), g.Y(.40), 'never returns', C.pink, pop(t, T.run + 4, 0.5), 18);
        out += scaleAt(590, 660, ck, c);
        out += pill(590, 960, 'don’t chase ✋', C.pink, between(t, T.chase, T.missed - 0.2), 26);
        out += pill(590, 960, 'missed ≠ trade', C.pink, between(t, T.missed + 0.4, T.valid - 0.2), 26);
        out += pill(590, 960, 'valid no-trade decision ✓', DK.teal, pop(t, T.valid, 0.5), 26);
        out += stamp(900, 500, 'MISSED', C.pink, pop(t, T.missed, 0.5), -12, 76, 26);
      }
      // The ball (price) rolls away to the right.
      const rl = ease(seg(t, T.chase - 2, T.chase + 2.6));
      const bx = lerp(1620, 2000, rl);
      if (t > T.chart + 0.6) out += `<g transform="translate(${f1(bx)},968) rotate(${f1(rl * 540)})"><circle r="32" fill="${C.peach}"/><path d="M-32,0 Q0,-18 32,0 M-32,0 Q0,18 32,0" stroke="#fff" stroke-width="4" fill="none"/></g>`;
      // The dog: leans toward the ball, then sits.
      const lean = between(t, T.chase - 1, T.chase + 2.6) * 1;
      out += crit(t, 'dog', { x: 1450 + lean * 30, y: 1000, scale: 1.05, seed: 2, at: T.chart + 0.6, tongue: t > T.valid, hop: t > T.chase - 1 && t < T.chase ? 10 : 0, hopH: 14 });
      const o2 = { x: 1230, y: 1000, scale: 0.9, look: A.LOOKS.e, seed: 4, at: T.chart + 0.5, talk: ctx.talking && t > T.chase && t < T.missed };
      if (t > T.chase && t < T.missed + 1) o2.frontArm = { a1: -20, a2: -80 };
      out += who(t, o2);
      out += bub(1290, 620, 'Stay. 🖐️', between(t, T.chase + 0.2, T.missed + 1), { size: 30 });
      out += bub(1290, 620, 'Good call ✓', between(t, T.valid + 0.6, T.plan - 0.1), { size: 28 });
      out += bub(1290, 620, 'Stay with the plan 🐾', between(t, T.plan, s.end), { size: 26 });
      if (t > T.plan + 0.4) out += `<path transform="translate(1560,${f1(830 - Math.sin((t - T.plan) * 3) * 6)}) scale(1.3)" d="M0,12 C-18,-2 -10,-16 0,-6 C10,-16 18,-2 0,12 Z" fill="${C.pink}"/>`;
      return out;
    },
  });

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
