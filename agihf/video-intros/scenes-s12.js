/**
 * scenes-s12.js: illustrated scene types for Section 12 lesson intro videos
 * (Phase 5 · Section 12: ICC Across the Market, Lessons 1 to 10).
 *
 * Every LIVE entry is a pure function of t, drawn on the 1920x1080 stage.
 * Chapter colours used throughout: Indication = teal, Correction = peach, Continuation = purple.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const DK = { teal: '#2F8A7F', pink: '#C2475F', purple: '#5E56B8', peach: '#B86E12' };
  const CH = { I: C.teal, C: C.peach, C2: C.purple };
  const rad = d => d * Math.PI / 180;

  const pill = (x, y, text, col, k = 1, fs = 28, tc = '#fff') => {
    if (k <= 0) return '';
    const w = [...text].length * fs * 0.6 + 34;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${tc}" font-family="DM Sans">${text}</text></g>`;
  };
  const txt = (x, y, s, size, col, o = {}) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${o.w || 900}" text-anchor="${o.a || 'middle'}" fill="${col}" font-family="${o.f || 'DM Sans'}" ${o.op != null ? `opacity="${o.op}"` : ''} ${o.rot != null ? `transform="rotate(${o.rot} ${x} ${y})"` : ''}>${s}</text>`;
  const scaleAt = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${inner}</g>`;
  const ground = (y, col = '#F6EDE6', line = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="${line}"/>`;
  const bub = (x, y, text, k, o = {}) => k <= 0 ? '' : A.bubble(x, y, text, Object.assign({ size: 30, sc: k, weight: 700 }, o));
  const check = (x, y, k, col = C.teal, r = 34) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k * r / 34})"><circle r="34" fill="${col}"/><path d="M-15,1 L-4,13 L17,-12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, col = C.pink, r = 34) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}"/><path d="M${-r * 0.4},${-r * 0.4} L${r * 0.4},${r * 0.4} M${r * 0.4},${-r * 0.4} L${-r * 0.4},${r * 0.4}" stroke="#fff" stroke-width="${r * 0.24}" stroke-linecap="round"/></g>`;
  // A round chapter tag: I / C / C.
  const tag = (x, y, letter, col, k, r = 30) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/>${txt(0, r * 0.36, letter, r * 1.05, '#fff', { f: 'Playfair Display' })}</g>`;
  const notes = (x, y, t, n = 3, col = C.purple) => Array.from({ length: n }, (_, i) => {
    const p = ((t * 0.6) + i / n) % 1;
    return `<text x="${x + Math.sin(p * 6 + i) * 30 + i * 30}" y="${y - p * 160}" font-size="${40 + i * 6}" fill="${[col, C.pink, C.teal][i % 3]}" opacity="${Math.sin(p * Math.PI)}" font-family="DM Sans">${i % 2 ? '♫' : '♪'}</text>`;
  }).join('');

  function blinkAmt(t, seed) {
    const period = 3.4 + (seed % 4) * 0.6;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  const eyeAt = (t, seed) => (x, y, r = 6) => { const bl = blinkAmt(t, seed); return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * (1 - bl * 0.9)).toFixed(2)}" fill="${C.dark}"/>${bl < 0.5 ? `<circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>` : ''}`; };

  // A person that pops in at o.at (scale from the feet).
  function who(t, o) {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    if (k <= 0) return '';
    return scaleAt(o.x, o.y, k, A.person(o.tFreeze != null ? o.tFreeze : t, o));
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
  // Hats drawn on top of a person (x, y = feet).
  const hat = (t, o, kind, k = 1) => {
    if (k <= 0) return '';
    const s = o.scale || 1, hy = o.y - 312 * s + Math.sin(t * 2 + (o.seed || 2)) * 2 * s;
    let g = '';
    if (kind === 'chef') g = `<rect x="-30" y="-20" width="60" height="22" rx="4" fill="#fff" stroke="#EADFD8" stroke-width="3"/><circle cx="-20" cy="-36" r="22" fill="#fff"/><circle cx="4" cy="-46" r="26" fill="#fff"/><circle cx="24" cy="-34" r="20" fill="#fff"/>`;
    else if (kind === 'captain') g = `<path d="M-46,6 Q0,-8 46,6 L40,-6 Q0,-20 -40,-6 Z" fill="${C.dark}"/><path d="M-38,-4 Q-36,-44 0,-46 Q36,-44 38,-4 Z" fill="#fff" stroke="#EADFD8" stroke-width="3"/><circle cy="-22" r="9" fill="${C.gold}"/>`;
    else if (kind === 'headset') g = `<path d="M-42,30 Q-46,-30 0,-32 Q46,-30 42,30" stroke="${C.dark}" stroke-width="8" fill="none"/><rect x="-52" y="18" width="18" height="34" rx="8" fill="${C.purple}"/><rect x="34" y="18" width="18" height="34" rx="8" fill="${C.purple}"/><path d="M-44,48 Q-40,74 -12,76" stroke="${C.dark}" stroke-width="4" fill="none"/><circle cx="-10" cy="76" r="6" fill="${C.dark}"/>`;
    else if (kind === 'goggles') g = `<rect x="-40" y="16" width="80" height="12" rx="6" fill="${C.purple}"/><circle cx="-16" cy="22" r="14" fill="#E8F8F6" stroke="${C.purple}" stroke-width="5"/><circle cx="16" cy="22" r="14" fill="#E8F8F6" stroke="${C.purple}" stroke-width="5"/>`;
    else if (kind === 'party') g = `<path d="M-14,-6 L4,-70 L22,-6 Z" fill="${C.pink}"/><circle cx="4" cy="-72" r="8" fill="${C.gold}"/><path d="M-6,-24 L16,-30 M-10,-12 L20,-18" stroke="#fff" stroke-width="4"/>`;
    else if (kind === '3d') g = `<rect x="-42" y="12" width="84" height="26" rx="6" fill="#fff" stroke="${C.dark}" stroke-width="4"/><rect x="-36" y="16" width="32" height="18" rx="4" fill="${C.pink}" opacity=".8"/><rect x="4" y="16" width="32" height="18" rx="4" fill="${C.teal}" opacity=".9"/>`;
    else if (kind === 'helmet') g = `<path d="M-44,8 Q-44,-46 0,-48 Q44,-46 44,8 Z" fill="${C.teal}"/><path d="M-30,-20 L30,-20 M-34,-6 L34,-6" stroke="#fff" stroke-width="5" opacity=".6"/>`;
    else if (kind === 'cap') g = `<path d="M-38,0 Q-38,-40 0,-42 Q38,-40 38,0 Z" fill="${C.pink}"/><path d="M20,-2 L70,4 L66,10 L20,6 Z" fill="${DK.pink}"/>`;
    const f = o.flip ? -1 : 1;
    return scaleAt(o.x, o.y, k, `<g transform="translate(${o.x},${hy}) scale(${s * f},${s})">${g}</g>`);
  };

  /* Small creatures, drawn with (0,0) at the feet. Facing right unless flip. */
  function critter(t, kind, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1;
    const eye = eyeAt(t, seed);
    const tt = o.tFreeze != null ? o.tFreeze : t;
    const hop = o.hop ? -Math.abs(Math.sin(tt * o.hop)) * (o.hopH || 26) : Math.sin(tt * 2.4 + seed) * 2.5;
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    let g = '';
    if (kind === 'dog') {
      const wag = Math.sin(tt * 12 + seed) * 22;
      const fur = o.col || C.peach, ear = o.ear || '#B86E12';
      g = `<path d="M-52,-58 Q-80,${-90 - wag * 0.3} ${-86 + wag * 0.2},${-104 - wag * 0.2}" stroke="${fur}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <rect x="-46" y="-40" width="14" height="40" rx="7" fill="${fur}"/><rect x="-22" y="-40" width="14" height="40" rx="7" fill="${ear}"/>
        <rect x="14" y="-40" width="14" height="40" rx="7" fill="${fur}"/><rect x="34" y="-40" width="14" height="40" rx="7" fill="${ear}"/>
        <ellipse cx="0" cy="-58" rx="62" ry="34" fill="${fur}"/><ellipse cx="-6" cy="-50" rx="30" ry="16" fill="#fff" opacity=".35"/>
        <circle cx="54" cy="-98" r="34" fill="${fur}"/>
        <ellipse cx="84" cy="-88" rx="22" ry="16" fill="#FAE3C8"/><ellipse cx="102" cy="-94" rx="8" ry="6" fill="${C.dark}"/>
        <ellipse cx="34" cy="-104" rx="13" ry="26" transform="rotate(${18 + Math.sin(tt * 3 + seed) * 6} 34 -120)" fill="${ear}"/>
        ${eye(62, -108, 6)}
        <path d="M76,-76 Q84,${-62 + talk * 6} 92,-76" fill="${C.pink}"/>`;
    } else if (kind === 'cat') {
      const sw = Math.sin(tt * 2.2 + seed) * 18;
      const fur = o.col || C.peachL, str = o.str || C.peach;
      g = `<path d="M-30,-14 Q${-80 - sw * 0.5},-20 ${-74 + sw},-84" stroke="${fur}" stroke-width="14" fill="none" stroke-linecap="round"/>
        <ellipse cx="0" cy="-46" rx="40" ry="48" fill="${fur}"/>
        <path d="M-20,-80 L-28,-60 M0,-90 L0,-66 M20,-80 L28,-60" stroke="${str}" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="-16" cy="-4" rx="14" ry="8" fill="${fur}"/><ellipse cx="16" cy="-4" rx="14" ry="8" fill="${fur}"/>
        <circle cx="6" cy="-112" r="34" fill="${fur}"/>
        <path d="M-22,-128 L-26,-160 L-2,-140 Z" fill="${fur}"/><path d="M34,-128 L38,-160 L14,-140 Z" fill="${fur}"/>
        <path d="M-18,-134 L-20,-150 L-8,-140 Z" fill="${C.pinkL}"/><path d="M30,-134 L32,-150 L20,-140 Z" fill="${C.pinkL}"/>
        ${eye(-6, -116, 5) + eye(20, -116, 5)}
        <path d="M4,-102 L10,-102 L7,-98 Z" fill="${C.pink}"/>
        <path d="M-2,-94 Q7,${-88 + talk * 4} 16,-94" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-30,-104 L-48,-108 M-30,-98 L-48,-96 M42,-104 L60,-108 M42,-98 L60,-96" stroke="${C.muted}" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (kind === 'bird' || kind === 'parrot' || kind === 'gull') {
      const flap = o.fly ? Math.sin(t * 22) * 40 : Math.sin(tt * 3 + seed) * 6;
      const body = o.col || (kind === 'parrot' ? C.teal : kind === 'gull' ? '#fff' : C.purpleL), head = kind === 'parrot' ? C.pink : body;
      const big = kind === 'parrot' ? 1.4 : 1;
      const wing = kind === 'parrot' ? C.gold : kind === 'gull' ? '#D9CFC8' : C.purple;
      g = `<g transform="scale(${big})">
        ${o.fly ? '' : `<path d="M-6,-6 L-10,0 M6,-6 L10,0" stroke="${C.peach}" stroke-width="4" stroke-linecap="round"/>`}
        ${kind === 'parrot' ? `<path d="M-26,-30 L-58,-6 L-50,-2 L-22,-22 Z" fill="${C.purple}"/><path d="M-26,-26 L-54,4 L-44,6 L-20,-18 Z" fill="${C.pink}"/>` : `<path d="M-24,-30 L-44,-22 L-24,-20 Z" fill="${kind === 'gull' ? '#D9CFC8' : body}"/>`}
        <ellipse cx="0" cy="-30" rx="28" ry="24" fill="${body}" ${kind === 'gull' ? 'stroke="#EADFD8" stroke-width="3"' : ''}/>
        <ellipse cx="4" cy="-24" rx="16" ry="12" fill="#fff" opacity=".45"/>
        <circle cx="16" cy="-56" r="18" fill="${head}" ${kind === 'gull' ? 'stroke="#EADFD8" stroke-width="3"' : ''}/>
        ${eye(22, -60, 4.5)}
        <path d="M32,${-58 - talk * 3} L48,-52 L32,${-48 + talk * 3} Z" fill="${C.gold}"/>
        <path d="M-6,-34 Q-24,${-44 - flap} -34,${-30 - flap * 0.8} Q-18,-22 -6,-26 Z" fill="${wing}"/></g>`;
    } else if (kind === 'rabbit') {
      const fur = '#fff';
      g = `<ellipse cx="-34" cy="-30" rx="14" ry="14" fill="${fur}" stroke="#EADFD8" stroke-width="2"/>
        <ellipse cx="0" cy="-36" rx="38" ry="34" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="24" cy="-6" rx="16" ry="8" fill="${fur}" stroke="#EADFD8" stroke-width="2"/>
        <circle cx="26" cy="-80" r="28" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="14" cy="-128" rx="10" ry="30" transform="rotate(-12 14 -104)" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="14" cy="-128" rx="5" ry="20" transform="rotate(-12 14 -104)" fill="${C.pinkL}"/>
        <ellipse cx="36" cy="-128" rx="10" ry="30" transform="rotate(14 36 -104)" fill="${fur}" stroke="#EADFD8" stroke-width="3"/>
        <ellipse cx="36" cy="-128" rx="5" ry="20" transform="rotate(14 36 -104)" fill="${C.pinkL}"/>
        ${eye(36, -84, 5)}<circle cx="52" cy="-74" r="4" fill="${C.pink}"/>
        <ellipse cx="20" cy="-70" rx="7" ry="4" fill="${C.pink}" opacity=".45"/>`;
    } else if (kind === 'duck') {
      const fur = o.col || C.peachL;
      g = `${o.swim ? '' : `<path d="M-8,-4 L-12,0 M8,-4 L12,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>`}
        <path d="M-46,-40 Q-60,-60 -40,-56 Q-20,-70 20,-56 Q40,-48 34,-24 Q20,-4 -10,-6 Q-40,-8 -46,-40 Z" fill="${fur}"/>
        <path d="M-20,-44 Q-4,-30 14,-40" stroke="${C.peach}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="-76" r="24" fill="${fur}"/>
        ${eye(32, -82, 4.5)}
        <path d="M46,${-76 - talk * 3} Q64,-74 64,-70 Q60,-66 46,${-66 + talk * 3} Z" fill="${C.peach}"/>`;
    } else if (kind === 'owl') {
      g = `<path d="M-8,-4 L-14,0 M8,-4 L14,0" stroke="${C.peach}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="-52" rx="44" ry="52" fill="${C.purple}"/><ellipse cx="0" cy="-40" rx="28" ry="34" fill="${C.purpleL}"/>
        <path d="M-40,-96 L-34,-126 L-16,-100 Z M40,-96 L34,-126 L16,-100 Z" fill="${C.purple}"/>
        <circle cx="-17" cy="-84" r="17" fill="#fff"/><circle cx="17" cy="-84" r="17" fill="#fff"/>
        ${eye(-15, -84, 8)}${eye(19, -84, 8)}
        <path d="M-6,-70 L6,-70 L0,-58 Z" fill="${C.gold}"/>`;
    } else if (kind === 'mouse') {
      const sw = Math.sin(tt * 3 + seed) * 10;
      g = `<path d="M-34,-14 Q-70,${-10 + sw} -86,-34" stroke="${C.pinkL}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="0" cy="-26" rx="38" ry="26" fill="#D9CFC8"/>
        <circle cx="34" cy="-44" r="22" fill="#D9CFC8"/><circle cx="24" cy="-70" r="16" fill="#D9CFC8"/><circle cx="24" cy="-70" r="9" fill="${C.pinkL}"/>
        ${eye(42, -50, 4)}<circle cx="57" cy="-42" r="5" fill="${C.pink}"/>
        <path d="M54,-40 L74,-46 M54,-38 L74,-34" stroke="${C.muted}" stroke-width="2"/>`;
    } else if (kind === 'crab') {
      const cl = Math.sin(tt * 5 + seed) * 10;
      g = `<path d="M-30,-10 L-46,0 M-20,-8 L-30,4 M30,-10 L46,0 M20,-8 L30,4" stroke="${DK.pink}" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="0" cy="-26" rx="44" ry="26" fill="${C.pink}"/>
        <path d="M-34,-36 L-58,${-70 - cl}" stroke="${C.pink}" stroke-width="8" stroke-linecap="round"/><path d="M34,-36 L58,${-70 + cl}" stroke="${C.pink}" stroke-width="8" stroke-linecap="round"/>
        <path d="M-58,${-70 - cl} m-14,-6 a16,14 0 1,1 28,0 l-14,6 Z" fill="${C.pink}"/><path d="M58,${-70 + cl} m-14,-6 a16,14 0 1,1 28,0 l-14,6 Z" fill="${C.pink}"/>
        <path d="M-12,-46 L-14,-64 M12,-46 L14,-64" stroke="${DK.pink}" stroke-width="4"/>
        <circle cx="-14" cy="-68" r="9" fill="#fff"/><circle cx="14" cy="-68" r="9" fill="#fff"/>${eye(-13, -68, 4.5)}${eye(15, -68, 4.5)}
        <path d="M-10,-24 Q0,${-16 + talk * 4} 10,-24" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    } else if (kind === 'fish') {
      const w = Math.sin(t * 8 + seed) * 10;
      const col = o.col || C.peach;
      g = `<path d="M-40,-30 L${-70},${-52 + w} L${-70},${-8 + w} Z" fill="${col}"/>
        <ellipse cx="0" cy="-30" rx="44" ry="26" fill="${col}"/><path d="M-6,-54 Q6,-70 18,-52" fill="${col}"/>
        <path d="M-10,-50 Q-2,-30 -10,-10" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/>
        ${eye(22, -36, 5)}<path d="M38,-26 Q44,-22 38,-18" stroke="${C.dark}" stroke-width="3" fill="none"/>`;
    }
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${hop.toFixed(2)})">${g}</g></g>`;
  }
  const crit = (t, kind, o) => {
    const k = o.at != null ? pop(t, o.at, 0.6) : 1;
    return k <= 0 ? '' : scaleAt(o.x, o.y, k, critter(t, kind, o));
  };

  /* A candle character. (x, y) = feet. o.col body colour, o.h body height, o.pose: 'flex' | 'cheer' | 'run' | 'wave' | null. */
  function candleGuy(t, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1, h = o.h || 130, w = o.w || 74, col = o.col || C.teal;
    const dk = { [C.pink]: DK.pink, [C.teal]: DK.teal, [C.purple]: DK.purple, [C.peach]: DK.peach }[col] || C.dark;
    const tt = o.tFreeze != null ? o.tFreeze : t;
    const eye = eyeAt(t, seed);
    const run = o.pose === 'run' ? Math.sin(tt * 14 + seed) : 0;
    const bob = o.pose === 'run' ? -Math.abs(run) * 8 : Math.sin(tt * 3 + seed) * 3;
    const talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    const top = -34 - h, sy = top + h * 0.45;
    const arm = (side) => {
      const x0 = side * w / 2;
      let ex, ey;
      if (o.pose === 'flex') { ex = side * (w / 2 + 34); ey = sy - 40; }
      else if (o.pose === 'cheer') { ex = side * (w / 2 + 26); ey = sy - 70 + Math.sin(tt * 8 + side) * 8; }
      else if (o.pose === 'run') { ex = side * (w / 2 + 22) + run * 18 * side; ey = sy + 30; }
      else if (o.pose === 'wave' && side === 1) { ex = w / 2 + 34; ey = sy - 50 + Math.sin(tt * 9) * 14; }
      else { ex = side * (w / 2 + 22); ey = sy + 44; }
      const mx = o.pose === 'flex' ? side * (w / 2 + 40) : (x0 + ex) / 2 + side * 8, my = o.pose === 'flex' ? sy + 4 : (sy + ey) / 2;
      return `<path d="M${x0},${sy} Q${mx},${my} ${ex},${ey}" stroke="${dk}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="${o.pose === 'flex' ? 13 : 9}" fill="${dk}"/>`;
    };
    const legs = `<path d="M${-w * 0.2},-34 L${-w * 0.2 + run * 14},-4" stroke="${dk}" stroke-width="9" stroke-linecap="round"/><path d="M${w * 0.2},-34 L${w * 0.2 - run * 14},-4" stroke="${dk}" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="${-w * 0.2 + run * 14 - 4}" cy="-2" rx="13" ry="7" fill="${C.dark}"/><ellipse cx="${w * 0.2 - run * 14 + 4}" cy="-2" rx="13" ry="7" fill="${C.dark}"/>`;
    const mouth = o.mood === 'sad' ? `<path d="M-12,${top + 70} Q0,${top + 60} 12,${top + 70}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : talk > 0.05 ? `<ellipse cx="0" cy="${top + 64}" rx="9" ry="${2 + talk * 7}" fill="#6B2A2A"/>`
        : `<path d="M-13,${top + 60} Q0,${top + 74} 13,${top + 60}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const g = `${legs}<line x1="0" y1="${top}" x2="0" y2="${top - 30}" stroke="${dk}" stroke-width="7" stroke-linecap="round"/>
      ${arm(-1)}<rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" rx="16" fill="${col}" stroke="${dk}" stroke-width="5"/>
      <rect x="${-w / 2 + 10}" y="${top + 10}" width="10" height="${h - 30}" rx="5" fill="#fff" opacity=".35"/>
      ${eye(-14, top + 40, 7)}${eye(14, top + 40, 7)}
      <ellipse cx="-24" cy="${top + 56}" rx="7" ry="4" fill="${C.pink}" opacity=".5"/><ellipse cx="24" cy="${top + 56}" rx="7" ry="4" fill="${C.pink}" opacity=".5"/>
      ${mouth}${arm(1)}
      ${o.label ? txt(0, top + h - 18, o.label, 24, '#fff') : ''}`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${bob.toFixed(2)})">${g}</g></g>`;
  }
  const cguy = (t, o) => { const k = o.at != null ? pop(t, o.at, 0.6) : 1; return k <= 0 ? '' : scaleAt(o.x, o.y, k, candleGuy(t, o)); };

  /* A little robot. (x, y) = wheels on the ground. o.face: 'happy' | 'x' | 'wow'. */
  function robot(t, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, seed = o.seed || 1;
    const bob = Math.sin(t * 3 + seed) * 3, talk = o.talk ? Math.abs(Math.sin(t * 10 + seed)) : 0;
    const bl = blinkAmt(t, seed), light = Math.sin(t * 6) > 0 ? C.pink : C.gold;
    const face = o.face === 'x' ? `<path d="M-30,-212 L-14,-196 M-14,-212 L-30,-196 M14,-212 L30,-196 M30,-212 L14,-196" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>`
      : `<rect x="-30" y="${-212 + bl * 6}" width="14" height="${16 * (1 - bl * 0.9)}" rx="5" fill="${C.tealL}"/><rect x="16" y="${-212 + bl * 6}" width="14" height="${16 * (1 - bl * 0.9)}" rx="5" fill="${C.tealL}"/>`;
    const mouth = o.face === 'x' ? `<path d="M-16,-170 Q0,-180 16,-170" stroke="${C.pink}" stroke-width="5" fill="none"/>`
      : talk > 0.05 ? `<rect x="-14" y="${-178}" width="28" height="${4 + talk * 12}" rx="4" fill="${C.tealL}"/>` : `<path d="M-16,-176 Q0,-164 16,-176" stroke="${C.tealL}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    const fa = o.armUp ? `<path d="M44,-110 L84,-150 L96,-200" stroke="${C.muted}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="96" cy="-204" r="12" fill="${C.purple}"/>`
      : `<path d="M44,-110 L74,-80 L90,-110" stroke="${C.muted}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="92" cy="-114" r="12" fill="${C.purple}"/>`;
    const g = `<circle cx="-26" cy="-18" r="18" fill="${C.dark}"/><circle cx="26" cy="-18" r="18" fill="${C.dark}"/><circle cx="-26" cy="-18" r="7" fill="#D9CFC8"/><circle cx="26" cy="-18" r="7" fill="#D9CFC8"/>
      <g transform="translate(0,${bob.toFixed(2)})">
      <path d="M-44,-110 L-74,-80 L-80,-50" stroke="${C.muted}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="-46" y="-140" width="92" height="110" rx="20" fill="${o.col || C.purpleL}" stroke="${C.purple}" stroke-width="5"/>
      <circle cx="0" cy="-90" r="16" fill="${C.gold}"/><rect x="-24" y="-60" width="48" height="8" rx="4" fill="${C.purple}" opacity=".5"/>
      <rect x="-8" y="-152" width="16" height="16" fill="${C.muted}"/>
      <rect x="-52" y="-240" width="104" height="92" rx="24" fill="${o.col || C.purpleL}" stroke="${C.purple}" stroke-width="5"/>
      <rect x="-40" y="-228" width="80" height="68" rx="16" fill="${C.dark}"/>
      ${face}${mouth}
      <line x1="0" y1="-240" x2="0" y2="-270" stroke="${C.purple}" stroke-width="5"/><circle cx="0" cy="-276" r="9" fill="${light}"/>
      ${fa}${o.hold ? `<g transform="translate(${o.armUp ? 96 : 92},${o.armUp ? -204 : -114})">${o.hold}</g>` : ''}</g>`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})">${g}</g>`;
  }
  const bot = (t, o) => { const k = o.at != null ? pop(t, o.at, 0.6) : 1; return k <= 0 ? '' : scaleAt(o.x, o.y, k, robot(t, o)); };

  /* ---------- Chart helpers ---------- */
  function genCandles(swings, seed, per) {
    let sd = seed * 9301 + 49297;
    const rnd = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
    const out = [], idx = [0];
    for (let k = 0; k < swings.length - 1; k++) {
      const [u0, v0] = swings[k], [u1, v1] = swings[k + 1];
      const n = Math.max(2, Math.round((u1 - u0) * per));
      let prev = v0;
      for (let j = 0; j < n; j++) {
        const fr = (j + 1) / n;
        let c = v0 + (v1 - v0) * fr + (j < n - 1 ? (rnd() - 0.5) * Math.abs(v1 - v0) * 0.4 : 0);
        if (j === n - 1) c = v1;
        const op = prev, wk = 0.012 + rnd() * 0.03;
        let hi = Math.max(op, c) + wk * rnd(), lo = Math.min(op, c) - wk * rnd();
        if (j === n - 1) { if (v1 > v0) hi = v1; else lo = v1; }
        out.push({ u: u0 + (u1 - u0) * ((j + 0.5) / n), o: op, c, hi, lo, du: (u1 - u0) / n });
        prev = c;
      }
      idx.push(out.length);
    }
    return { cs: out, idx };
  }
  // Draw a candle chart revealed up to "pos" (a swing index, may be fractional).
  function chart(o, pos) {
    const { x, y, w, h } = o, X = u => x + u * w, Y = v => y + h - v * h;
    const { cs, idx } = genCandles(o.swings, o.seed || 3, o.per || 30);
    const i0 = Math.floor(Math.max(0, Math.min(pos, o.swings.length - 1))), fr = pos - i0;
    const shown = i0 >= idx.length - 1 ? cs.length : idx[i0] + (idx[i0 + 1] - idx[i0]) * fr;
    let out = '';
    cs.forEach((c, i) => {
      const p = clamp(shown - i);
      if (p <= 0) return;
      const up = c.c >= c.o, col = o.mono || (up ? C.teal : C.pink), cx = X(c.u), bw = Math.max(4, Math.min(o.maxBody || 22, c.du * w * 0.62));
      const cc = lerp(c.o, c.c, ease(p));
      out += `<line x1="${cx}" x2="${cx}" y1="${Y(lerp(Math.max(c.o, c.c), c.hi, p))}" y2="${Y(lerp(Math.min(c.o, c.c), c.lo, p))}" stroke="${col}" stroke-width="${o.wick || 3.5}" stroke-linecap="round" opacity="${o.fade ?? 1}"/>
        <rect x="${cx - bw / 2}" y="${Y(Math.max(c.o, cc))}" width="${bw}" height="${Math.max(3, Math.abs(Y(c.o) - Y(cc)))}" rx="2.5" fill="${col}" opacity="${o.fade ?? 1}"/>`;
    });
    return out;
  }
  const P = (o, i) => [o.x + o.swings[i][0] * o.w, o.y + o.h - o.swings[i][1] * o.h];
  // Piecewise reveal: stops = [[time, swingIndex], ...].
  const posAt = (t, stops) => {
    if (t <= stops[0][0]) return t < stops[0][0] - 0.01 ? -1 : stops[0][1];
    for (let i = 1; i < stops.length; i++) if (t < stops[i][0]) return lerp(stops[i - 1][1], stops[i][1], ease(seg(t, stops[i - 1][0], stops[i][0])));
    return stops[stops.length - 1][1];
  };
  // A highlighted leg between swing i and j, drawn to fraction k.
  function leg(o, i, j, k, col, wd = 10, op = 0.85) {
    if (k <= 0) return '';
    const pts = []; for (let q = i; q <= j; q++) pts.push(P(o, q));
    return polyPart(pts, k, col, wd, op);
  }
  function polyPart(pts, k, col, wd = 8, op = 1, dash = '') {
    if (k <= 0 || pts.length < 2) return '';
    const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const tot = L.reduce((a, b) => a + b, 0) * clamp(k);
    let d = `M${pts[0][0]},${pts[0][1]}`, acc = 0;
    for (let i = 1; i < pts.length; i++) {
      if (acc + L[i - 1] <= tot) { d += ` L${pts[i][0]},${pts[i][1]}`; acc += L[i - 1]; continue; }
      const f = (tot - acc) / L[i - 1]; d += ` L${lerp(pts[i - 1][0], pts[i][0], f)},${lerp(pts[i - 1][1], pts[i][1], f)}`; break;
    }
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  }
  function pointOn(pts, k) {
    const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let tot = L.reduce((a, b) => a + b, 0) * clamp(k), i = 1;
    for (; i < pts.length; i++) { if (tot <= L[i - 1]) break; tot -= L[i - 1]; }
    if (i >= pts.length) return pts[pts.length - 1];
    const f = tot / L[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
  }
  const hline = (x1, x2, y, col, k = 1, label = '', lx = null, fs = 20) => k <= 0 ? '' : `<line x1="${x1}" x2="${lerp(x1, x2, ease(clamp(k)))}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="4" stroke-dasharray="12 9"/>${label ? pill(lx ?? x2 - 80, y - 24, label, col, pop(k * 1.2, 0.3, 0.6), fs) : ''}`;
  const board = (x, y, w, h, k, o = {}) => scaleAt(x + w / 2, y + h / 2, k, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 26}" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#F1E7E1'}" stroke-width="${o.sw || 3}"/>`);

  // Standard kicker + swapping headlines.
  const TYPES = ['passport-stamps', 'puppet-theatre', 'banner-burst', 'pond-mirror', 'sandcastle', 'xray-scanner', 'musical-statues', 'medal-ceremony',
    'clothesline', 'cookie-cutter', 'microscope', 'commentary-booth', 'toolbelt', 'reading-nook', '3d-glasses', 'tandem-bike', 'band-stage', 'switch-panel',
    'fog-harbor', 'scribble-eraser'];
  const BUILD = Object.fromEntries(TYPES.map(k => ['s12-' + k, s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`]));

  const LIVE = {};

  /* ======================= Lesson 1: What Is ICC? ======================= */
  // A passport desk stamps the three things already earned, then the gate to Phase 5 lifts.
  LIVE['s12-passport-stamps'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, '#F3EEF9', '#E2DDF3');
    // Floor tiles.
    for (let i = 0; i < 16; i++) out += `<rect x="${i * 130}" y="1004" width="64" height="76" fill="#E7E2F5" opacity=".6"/>`;
    // Gate arch to Phase 5.
    const ak = pop(t, T.arch, 0.8);
    if (ak > 0) {
      const glow = 0.5 + Math.sin(t * 3) * 0.2;
      out += scaleAt(1720, 1000, ak, `<rect x="1560" y="470" width="320" height="530" rx="160" fill="#FEF3E4" stroke="${C.gold}" stroke-width="14"/>
        <rect x="1600" y="520" width="240" height="480" rx="120" fill="#FFF9EE" opacity="${glow}"/>
        <rect x="1580" y="430" width="280" height="96" rx="24" fill="${C.gold}"/>
        ${txt(1720, 476, 'PHASE 5', 40, '#fff', { f: 'Playfair Display' })}${txt(1720, 510, 'THE DAYLI ICC METHOD™', 17, '#fff')}`);
      out += A.sparkle(1720, 600, T.arch + 0.3, t, C.gold);
    }
    // Barrier.
    const gk = ease(seg(t, T.gate, T.gate + 1.1));
    out += `<rect x="1440" y="800" width="34" height="200" rx="10" fill="${C.purple}"/><circle cx="1457" cy="810" r="20" fill="${C.dark}"/>
      <g transform="rotate(${-82 * gk} 1457 810)"><rect x="1457" y="796" width="320" height="28" rx="14" fill="#fff" stroke="${C.pink}" stroke-width="4"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${1490 + i * 72}" y="798" width="34" height="24" fill="${C.pink}"/>`).join('')}</g>`;
    // Clerk behind the desk.
    const stamps = [T.s1, T.s2, T.s3];
    const slam = Math.max(...stamps.map(a => t > a - 0.5 && t < a + 0.5 ? 1 - Math.abs(t - a) * 2 : 0));
    const ck = { x: 1190, y: 1000, scale: 0.92, look: A.LOOKS.a, flip: true, seed: 3, at: s.start + 0.4, frontArm: { a1: -70 + slam * 90, a2: -60 + slam * 80 },
      hold: `<g transform="rotate(${-20 + slam * 20})"><rect x="-10" y="-46" width="20" height="40" rx="8" fill="#9B6A45"/><rect x="-26" y="-8" width="52" height="20" rx="5" fill="${C.pink}"/></g>` };
    out += who(t, ck);
    out += `<rect x="980" y="790" width="420" height="210" rx="18" fill="${C.purple}"/><rect x="980" y="790" width="420" height="30" rx="12" fill="${DK.purple}"/>
      ${txt(1190, 900, 'PASSPORT CONTROL', 26, '#fff')}${txt(1190, 940, 'Phase 4 → Phase 5', 22, C.purpleL, { w: 700 })}`;
    // The passport (zoomed in, floating).
    const pk = pop(t, T.open, 0.8);
    if (pk > 0) {
      let pp = `<rect x="556" y="384" width="808" height="276" rx="26" fill="${C.purple}"/>
        <rect x="570" y="396" width="384" height="252" rx="16" fill="#FFFDF8"/><rect x="966" y="396" width="384" height="252" rx="16" fill="#FFFDF8"/>
        <line x1="960" y1="396" x2="960" y2="648" stroke="${C.purpleL}" stroke-width="6"/>
        <rect x="600" y="424" width="96" height="116" rx="12" fill="${C.pinkP}"/><circle cx="648" cy="470" r="26" fill="${A.LOOKS.b.skin}"/><path d="M620,462 C618,430 678,430 676,462 C664,446 632,446 620,462 Z" fill="${A.LOOKS.b.hair}"/><path d="M612,540 Q648,496 684,540 Z" fill="${C.peach}"/>
        ${txt(716, 450, 'STUDENT', 22, C.muted, { a: 'start' })}${txt(716, 486, 'AGHF ACADEMY', 26, C.dark, { a: 'start', f: 'Playfair Display' })}
        <rect x="716" y="506" width="150" height="8" rx="4" fill="${C.purpleL}"/><rect x="716" y="524" width="110" height="8" rx="4" fill="${C.purpleL}"/>`;
      const st = [[770, 600, '4H · READ THE ROOM', -6, C.teal, DK.teal], [1150, 466, '1H · BUILD THE MAP', 5, C.pink, DK.pink], [1180, 590, 'THESIS', -3, C.peach, DK.peach]];
      st.forEach(([x, y, label, r, col, dk], i) => {
        const k = t < stamps[i] ? 0 : back((t - stamps[i]) / 0.35) * (1 + Math.max(0, 0.6 - (t - stamps[i]) * 2));
        if (k <= 0) return;
        const w = label.length * 13 + 80;
        pp += `<g transform="translate(${x},${y}) rotate(${r}) scale(${k})" opacity=".92"><rect x="${-w / 2}" y="-30" width="${w}" height="60" rx="14" fill="none" stroke="${dk}" stroke-width="5"/>
          ${txt(-18, 9, label, 22, dk, { })}<circle cx="${w / 2 - 28}" cy="0" r="17" fill="${col}"/><path d="M${w / 2 - 36},0 L${w / 2 - 30},7 L${w / 2 - 20},-6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
      });
      out += `<g transform="translate(960,522) scale(1,${clamp(pk, 0, 1.2)}) translate(-960,-522)">${pp}</g>`;
    }
    // Traveller walks in, then through the gate.
    const wk = ease(seg(t, T.walk, T.walk + 2.6)), gok = ease(seg(t, T.go, T.go + 3));
    const tx = t < T.go ? lerp(-140, 860, wk) : lerp(860, 1700, gok);
    const walking = (t > T.walk && t < T.walk + 2.6) || (t > T.go && t < T.go + 3);
    const tr = { x: tx, y: 1000, scale: 0.95, look: A.LOOKS.b, seed: 5, walking, talk: ctx.talking && t > T.welcome, hold: t < T.go + 3 ? `<g transform="translate(0,6)"><rect x="-20" y="0" width="40" height="54" rx="8" fill="${C.teal}" stroke="${DK.teal}" stroke-width="4"/><path d="M-10,0 Q0,-16 10,0" stroke="${DK.teal}" stroke-width="4" fill="none"/></g>` : undefined };
    if (t > T.go + 3) Object.assign(tr, { frontArm: { a1: -60 + Math.sin(t * 8) * 10, a2: -80 }, flip: true });
    out += who(t, tr);
    const dx = t < T.go ? lerp(-320, 680, ease(seg(t, T.walk + 0.4, T.walk + 3))) : lerp(680, 1460, ease(seg(t, T.go + 0.5, T.go + 3.5)));
    out += critter(t, 'dog', { x: dx, y: 1000, scale: 0.6, seed: 2, hop: walking ? 12 : 0, hopH: 12 });
    out += bub(1190, 660, 'All checked ✓', t > T.s3 + 0.6 && t < T.gate + 0.4 ? pop(t, T.s3 + 0.6, 0.5) : 0, { size: 28, tail: 'right' });
    if (t > T.go + 3) out += bub(1560, 620, 'I made it!', pop(t, T.go + 3, 0.5), { size: 30, tail: 'right' }) + A.sparkle(1700, 640, T.go + 3.1, t);
    return out;
  };

  // A puppet theatre: a candle puppet acts out the story twice, the second time with chapter names.
  LIVE['s12-puppet-theatre'] = (s, t) => {
    const T = s.beats;
    let out = `<rect x="0" y="940" width="1920" height="140" fill="#3D2B20" opacity=".08"/>`;
    const sk = pop(t, s.start + 0.2, 0.8);
    // Proscenium.
    let st = `<rect x="400" y="370" width="1120" height="610" rx="30" fill="${C.purple}"/>
      <rect x="450" y="430" width="1020" height="470" rx="10" fill="#FFF6F0"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${520 + i * 110}" x2="${520 + i * 110}" y1="440" y2="890" stroke="#F1E7E1" stroke-width="2"/>`).join('')}
      <rect x="440" y="890" width="1040" height="64" rx="8" fill="#C98A5A"/><rect x="440" y="890" width="1040" height="12" fill="#9B6A45"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${520 + i * 147}" cy="402" r="9" fill="${C.gold}" opacity="${0.6 + 0.4 * Math.sin(t * 4 + i)}"/>`).join('')}`;
    out += scaleAt(960, 980, sk, st);
    // Path of the story.
    const pts = [[520, 860], [640, 770], [730, 830], [905, 660], [1010, 750], [1360, 600]];
    const run1 = seg(t, T.run1, T.run1 + 5.4);
    const replay = t >= T.replay;
    // progress along the path in "index" units
    let pi;
    if (!replay) pi = run1 * 5;
    else pi = posAt(t, [[T.replay, 0], [T.replay + 1.2, 2], [T.I, 2], [T.I + 1.8, 3], [T.C, 3], [T.C + 1.6, 4], [T.C2, 4], [T.C2 + 2, 5]]);
    const idxPts = (a, b) => pts.slice(Math.floor(a), Math.floor(b) + 1).concat(b % 1 ? [[lerp(pts[Math.floor(b)][0], pts[Math.ceil(b)][0], b % 1), lerp(pts[Math.floor(b)][1], pts[Math.ceil(b)][1], b % 1)]] : []);
    if (pi > 0) {
      if (!replay) out += polyPart(idxPts(0, pi), 1, C.muted, 8, 0.6, '14 10');
      else {
        out += hline(500, 1200, 770, C.muted, seg(t, T.replay + 0.8, T.replay + 1.6), 'meaningful high', 1130, 18);
        out += polyPart(idxPts(0, Math.min(pi, 2)), 1, '#C9B9AE', 8, 0.8);
        if (pi > 2) out += polyPart(idxPts(2, Math.min(pi, 3)), 1, CH.I, 12);
        if (pi > 3) out += polyPart(idxPts(3, Math.min(pi, 4)), 1, CH.C, 12);
        if (pi > 4) out += polyPart(idxPts(4, Math.min(pi, 5)), 1, CH.C2, 12);
        out += tag(770, 720, 'I', CH.I, pop(t, T.I + 1), 30) + tag(990, 650, 'C', CH.C, pop(t, T.C + 1), 30) + tag(1180, 610, 'C', CH.C2, pop(t, T.C2 + 1.4), 30);
      }
    }
    // Puppet on strings.
    if (pi >= 0 && sk > 0.9) {
      const [px, py] = idxPts(0, Math.max(0.001, Math.min(pi, 5))).slice(-1)[0];
      const sway = Math.sin(t * 3) * 6;
      out += `<line x1="${px - 40 + sway}" y1="436" x2="${px - 30}" y2="${py - 90}" stroke="${C.muted}" stroke-width="2"/><line x1="${px + 40 + sway}" y1="436" x2="${px + 30}" y2="${py - 90}" stroke="${C.muted}" stroke-width="2"/><line x1="${px + sway}" y1="436" x2="${px}" y2="${py - 128}" stroke="${C.muted}" stroke-width="2"/>
        <rect x="${px - 60 + sway}" y="428" width="120" height="14" rx="7" fill="#9B6A45"/>`;
      const going = (!replay && run1 > 0 && run1 < 1) || (replay && t < T.C2 + 2);
      out += candleGuy(t, { x: px, y: py, scale: 0.55, col: pi > 3 && pi <= 4 && replay ? C.pink : C.teal, seed: 4, pose: t > T.C2 + 2 ? 'cheer' : going ? 'run' : null });
    }
    // Act sign.
    const acts = [[T.I, 'ACT I · INDICATION', CH.I], [T.C, 'ACT II · CORRECTION', CH.C], [T.C2, 'ACT III · CONTINUATION', CH.C2]];
    let cur = null; acts.forEach(a => { if (t >= a[0]) cur = a; });
    // Curtains.
    const ck = ease(seg(t, T.curtain, T.curtain + 1.4));
    const cw = lerp(520, 70, ck);
    const drape = (x0, dir) => {
      let g = `<path d="M${x0},430 L${x0 + dir * cw},430 Q${x0 + dir * cw * 0.8},660 ${x0 + dir * (cw + 20)},900 L${x0},900 Z" fill="${C.pink}"/>`;
      for (let i = 1; i < 4; i++) g += `<path d="M${x0 + dir * cw * i / 4},430 Q${x0 + dir * cw * i / 4 + Math.sin(t * 2 + i) * 4},660 ${x0 + dir * (cw * i / 4 + 6)},900" stroke="${DK.pink}" stroke-width="4" fill="none" opacity=".5"/>`;
      return g;
    };
    if (sk > 0.9) out += drape(450, 1) + drape(1470, -1) + `<path d="M450,430 L1470,430 L1470,470 Q960,500 450,470 Z" fill="${DK.pink}"/>`;
    if (cur && t < T.lock) out += pill(960, 530, cur[1], cur[2], pop(t, cur[0], 0.5), 28);
    // Audience: backs of heads.
    const head = (x, kind, col) => kind === 'cat' ? `<g transform="translate(${x},1060)"><circle r="46" fill="${col}"/><path d="M-36,-26 L-42,-70 L-10,-42 Z M36,-26 L42,-70 L10,-42 Z" fill="${col}"/></g>`
      : kind === 'owl' ? `<g transform="translate(${x},1056)"><ellipse rx="48" ry="54" fill="${C.purple}"/><path d="M-40,-30 L-34,-72 L-14,-44 Z M40,-30 L34,-72 L14,-44 Z" fill="${C.purple}"/></g>`
        : `<g transform="translate(${x},1066)"><rect x="-56" y="10" width="112" height="60" rx="30" fill="${col}"/><circle cy="-14" r="44" fill="${kind}"/><path d="M-44,-14 C-46,-70 46,-70 44,-14 C30,-40 -30,-40 -44,-14 Z" fill="${C.dark}"/></g>`;
    const bounce = i => Math.abs(Math.sin(t * 2 + i)) * -4;
    out += [[300, A.LOOKS.b.skin, C.peach], [700, 'cat', C.peachL], [1220, A.LOOKS.c.skin, C.teal], [1620, 'owl']].map(([x, k, col], i) => `<g transform="translate(0,${bounce(i)})">${head(x, k, col)}</g>`).join('');
    // Locked door to Section 13.
    const lk = pop(t, T.lock, 0.7);
    if (lk > 0) {
      out += scaleAt(1700, 980, lk, `<rect x="1580" y="560" width="240" height="420" rx="18" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="8"/>
        <rect x="1610" y="600" width="180" height="150" rx="10" fill="#fff" opacity=".6"/>${txt(1700, 660, 'SECTION 13', 26, DK.purple)}${txt(1700, 700, '1M Entry Model', 22, C.muted, { w: 700 })}
        <g transform="translate(1700,${830 + Math.sin(t * 4) * 3})"><path d="M-22,-10 L-22,-34 A22,22 0 0,1 22,-34 L22,-10" stroke="${C.dark}" stroke-width="9" fill="none"/><rect x="-34" y="-12" width="68" height="56" rx="10" fill="${C.gold}"/><circle cy="12" r="8" fill="${C.dark}"/></g>`);
      out += pill(1700, 520, 'NEXT · ITS OWN RULES', C.purple, pop(t, T.lock + 0.6, 0.5), 22);
      out += pill(960, 530, 'THE STORY ✓', C.teal, pop(t, T.lock + 0.3, 0.5), 28);
    }
    return out;
  };

  /* ======================= Lesson 2: Indication ======================= */
  // Three candles try to impress the coach at a paper banner marked "level that mattered". Only one bursts through.
  LIVE['s12-banner-burst'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, '#EAF6F3', '#D3ECE7');
    // Bleachers with a bobbing crowd.
    out += `<rect x="0" y="640" width="1920" height="360" fill="#F7EFE9"/>`;
    [0, 1, 2].forEach(r => {
      out += `<rect x="0" y="${660 + r * 80}" width="1920" height="22" fill="#EADFD8"/>`;
      for (let i = 0; i < 22; i++) {
        const x = 40 + i * 88 + (r % 2) * 44, b = Math.abs(Math.sin(t * 3 + i * 1.7 + r)) * -6;
        out += `<circle cx="${x}" cy="${650 + r * 80 + b}" r="18" fill="${[C.pinkL, C.tealL, C.purpleL, C.peachL][(i + r) % 4]}" opacity=".7"/>`;
      }
    });
    out += `<rect x="0" y="900" width="1920" height="100" fill="#EAF6F3"/>`;
    // The banner.
    const hit = T.burst + 1.4, torn = t > hit;
    const bx = 1150;
    const pole = `<rect x="${bx - 8}" y="500" width="16" height="500" rx="8" fill="${C.muted}"/>`;
    if (!torn) {
      const wob = t > T.touch + 1.2 && t < T.touch + 1.8 ? Math.sin(t * 40) * 8 : 0;
      out += pole + `<path d="M${bx},520 L${bx + 70 + wob},540 L${bx + 70 + wob},980 L${bx},990 Z" fill="${C.gold}" opacity=".95"/>`;
    } else {
      const f = ease(seg(t, hit, hit + 0.6));
      out += pole + `<path d="M${bx},520 L${bx + 70},540 L${bx + 70 + 40 * f},${700 - 60 * f} L${bx},${720} Z" fill="${C.gold}"/>
        <path d="M${bx},790 L${bx + 70 + 50 * f},${820 + 40 * f} L${bx + 70},980 L${bx},990 Z" fill="${C.gold}"/>`;
      for (let i = 0; i < 10; i++) {
        const p = seg(t, hit, hit + 1.6);
        if (p > 0 && p < 1) out += `<rect x="${bx + 40 + Math.cos(i * 1.3) * 300 * p}" y="${740 + Math.sin(i * 2.1) * 200 * p + 200 * p * p}" width="18" height="10" fill="${[C.gold, C.pink, C.teal][i % 3]}" opacity="${1 - p}" transform="rotate(${i * 40 + p * 300} ${bx + 40 + Math.cos(i * 1.3) * 300 * p} ${740 + Math.sin(i * 2.1) * 200 * p})"/>`;
      }
    }
    out += pill(bx + 36, 470, 'LEVEL THAT MATTERED', C.purple, pop(t, s.start + 0.6), 24);
    // Contestant 1: big green candle flexing.
    const c1in = ease(seg(t, T.big, T.big + 1.6)), c1out = ease(seg(t, T.bigX + 1.2, T.bigX + 2.6));
    if (t > T.big && c1out < 1) {
      const x = lerp(lerp(-240, 820, c1in), -300, c1out);
      out += candleGuy(t, { x, y: 1000, h: 250, w: 120, col: C.teal, seed: 2, pose: c1in < 1 || c1out > 0 ? 'run' : 'flex', flip: c1out > 0, mood: t > T.bigX ? 'sad' : null, talk: t > T.big + 1.6 && t < T.bigX });
      out += bub(x + 140, 600, 'I’m huge! And green!', t < T.bigX + 1.2 ? pop(t, T.big + 1.6, 0.5) : 0, { size: 28 });
      out += cross(x, 640, t < T.bigX + 1.2 ? pop(t, T.bigX, 0.5) : 0);
    }
    if (t > T.bigX && t < T.burst) out += pill(560, 1040, 'size · colour: not proof', C.pink, pop(t, T.bigX + 0.3), 26);
    // Contestant 2: touches the level and stops.
    const c2in = ease(seg(t, T.touch, T.touch + 1.2)), c2back = ease(seg(t, T.touch + 1.2, T.touch + 1.8)), c2out = ease(seg(t, T.touchX + 1.4, T.touchX + 2.8));
    if (t > T.touch && c2out < 1) {
      const x = lerp(lerp(lerp(-200, 1080, c2in), 960, c2back), -260, c2out);
      out += candleGuy(t, { x, y: 1000, h: 120, col: C.teal, seed: 5, pose: c2in < 1 || c2out > 0 ? 'run' : null, flip: c2out > 0, mood: t > T.touchX ? 'sad' : null });
      out += bub(x - 40, 760, 'boop!', t > T.touch + 1.2 && t < T.touchX ? pop(t, T.touch + 1.2, 0.4) : 0, { size: 26, tail: 'right' });
      out += cross(x, 760, t < T.touchX + 1.4 ? pop(t, T.touchX, 0.5) : 0);
    }
    if (t > T.touchX && t < T.burst) out += pill(1400, 1040, 'a touch: not proof', C.pink, pop(t, T.touchX + 0.3), 26) + pill(1400, 400 + 0, 'FVG? sweep? events: not proof', C.muted, pop(t, T.events), 24);
    // Contestant 3: bursts through.
    if (t > T.burst) {
      const k1 = ease(seg(t, T.burst, hit)), k2 = ease(seg(t, hit, hit + 1.8));
      const x = t < hit ? lerp(-200, bx, k1 * k1) : lerp(bx, 1500, k2);
      out += candleGuy(t, { x, y: 1000, h: 140, col: C.teal, seed: 7, pose: t < hit + 1.8 ? 'run' : 'cheer' });
      if (t > T.ok) out += check(1500, 700, pop(t, T.ok, 0.5)) + pill(1500, 620, 'NEW INFORMATION', C.teal, pop(t, T.ok + 0.3), 28) + A.sparkle(1500, 700, T.ok, t);
    }
    // Coach and dog.
    const coach = { x: 1800, y: 1000, scale: 0.92, look: A.LOOKS.e, flip: true, seed: 3, at: s.start + 0.4, talk: ctx.talking && t > T.rule };
    coach.frontArm = t > T.ok ? { a1: -40 + Math.sin(t * 6) * 8, a2: -70 } : { a1: 70, a2: 100 };
    out += who(t, coach) + hat(t, coach, 'cap', pop(t, s.start + 0.4));
    out += crit(t, 'dog', { x: 1640, y: 1000, scale: 0.55, seed: 4, flip: true, at: s.start + 0.8, hop: t > hit && t < hit + 2 ? 12 : 0, hopH: 14 });
    out += bub(1730, 560, 'What did it prove?', t > T.rule ? pop(t, T.rule, 0.5) : 0, { size: 26, tail: 'right' });
    return out;
  };

  // A pond: the bullish story above the water, its bearish reflection below.
  LIVE['s12-pond-mirror'] = (s, t) => {
    const T = s.beats;
    let out = `<rect x="0" y="720" width="1920" height="360" fill="#DDF2EF"/>`;
    for (let i = 0; i < 7; i++) { const x = ((i * 300 + t * 40) % 2100) - 100; out += `<path d="M${x},${790 + (i % 3) * 90} q30,-10 60,0 t60,0" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`; }
    // Banks.
    out += `<path d="M0,700 L430,700 Q480,760 440,1080 L0,1080 Z" fill="#F3E3CF"/><path d="M1920,700 L1500,700 Q1450,760 1490,1080 L1920,1080 Z" fill="#F3E3CF"/>
      <rect x="0" y="696" width="440" height="10" rx="5" fill="${C.cash}"/><rect x="1500" y="696" width="420" height="10" rx="5" fill="${C.cash}"/>`;
    const up = { x: 520, y: 390, w: 900, h: 300, seed: 21, per: 34, maxBody: 16, swings: [[0, 0.15], [0.15, 0.62], [0.27, 0.3], [0.4, 0.6], [0.52, 0.36], [0.76, 0.95], [0.86, 0.84]] };
    const dn = Object.assign({}, up, { y: 742, seed: 22, swings: up.swings.map(([u, v]) => [u, 1 - v]) });
    const pu = posAt(t, [[T.up, 0], [T.up + 3.2, 4], [T.upBreak, 4], [T.upBreak + 1.6, 6]]);
    const pd = posAt(t, [[T.mirror, 0], [T.mirror + 3.2, 4], [T.downBreak, 4], [T.downBreak + 1.6, 6]]);
    const hy = P(up, 1)[1], ly = P(dn, 1)[1];
    out += hline(500, 1430, hy, C.muted, seg(t, T.high, T.high + 0.8), 'meaningful high', 640, 20);
    if (pu >= 0) out += chart(up, pu);
    if (pd >= 0) out += `<g opacity=".85">${hline(500, 1430, ly, C.muted, seg(t, T.lowline, T.lowline + 0.8), 'meaningful low', 1330, 20)}${chart(dn, pd)}</g>`;
    // A mirror shimmer line.
    const mk = seg(t, T.mirror - 0.6, T.mirror + 0.4);
    if (mk > 0) out += `<line x1="460" x2="${lerp(460, 1480, mk)}" y1="721" y2="721" stroke="#fff" stroke-width="6" opacity=".9"/>`;
    const bu = P(up, 5), bd = P(dn, 5);
    out += pill(bu[0] - 20, bu[1] - 40, 'beyond it ✓', C.teal, pop(t, T.upBreak + 1.6), 24);
    out += pill(bd[0] + 150, bd[1] - 10, 'below it ✓', C.pink, pop(t, T.downBreak + 1.6), 24);
    // People on the banks.
    const L = { x: 250, y: 700, scale: 0.9, look: A.LOOKS.buyer, seed: 2, at: s.start + 0.4 };
    L.frontArm = t > T.upBreak ? { a1: -50, a2: -60 } : { a1: 90, a2: 95 };
    const R = { x: 1690, y: 700, scale: 0.9, look: A.LOOKS.seller, flip: true, seed: 6, at: T.mirror - 0.4 };
    R.frontArm = t > T.downBreak ? { a1: 30, a2: 40 } : { a1: 90, a2: 95 };
    out += who(t, L) + who(t, R);
    out += bub(250, 340, 'Bullish', pop(t, T.up + 0.5, 0.5), { size: 30, color: DK.teal });
    out += bub(1690, 340, 'Bearish', pop(t, T.mirror + 0.4, 0.5), { size: 30, color: DK.pink, tail: 'right' });
    // Duck paddles across; a fish jumps on the mirror.
    const dxk = ((t - s.start) * 55) % 1300;
    out += critter(t, 'duck', { x: 420 + dxk, y: 1060, scale: 0.7, seed: 3, swim: true });
    const fj = seg(t, T.mirror, T.mirror + 1.2);
    if (fj > 0 && fj < 1) out += `<g transform="rotate(${-60 + fj * 120} ${1460} ${780})">${critter(t, 'fish', { x: 1460, y: 780 - Math.sin(fj * Math.PI) * 160, scale: 0.6, seed: 2 })}</g>`;
    if (t > T.same) { out += A.sparkle(960, 720, T.same, t) + pill(960, 721, 'SAME IDEA · MIRRORED', C.purple, pop(t, T.same, 0.6), 26); }
    return out;
  };

  /* ======================= Lesson 3: Correction ======================= */
  // A sandcastle: a small wave washes back and the wall holds (correction); a big wave knocks it down (reversal).
  LIVE['s12-sandcastle'] = (s, t, ctx) => {
    const T = s.beats;
    // Sea and sand.
    const w1 = Math.sin(Math.PI * seg(t, T.wave1, T.wave1 + 3.4));
    const w2 = t < T.wave2 ? 0 : t < T.wave2 + 1.6 ? ease(seg(t, T.wave2, T.wave2 + 1.6)) : 1 - 0.5 * ease(seg(t, T.wave2 + 1.8, T.wave2 + 3.6));
    const xw = 560 + w1 * 430 + w2 * 1000 + Math.sin(t * 2) * 20;
    let out = `<rect x="0" y="760" width="1920" height="320" fill="#F9E3C4"/>`;
    for (let i = 0; i < 30; i++) out += `<circle cx="${(i * 137) % 1920}" cy="${790 + (i * 53) % 270}" r="3" fill="#E8C9A0"/>`;
    out += `<path d="M0,760 L${xw - 80},760 Q${xw},820 ${xw - 60},920 Q${xw + 20},1000 ${xw - 40},1080 L0,1080 Z" fill="${C.tealL}"/>
      <path d="M${xw - 80},760 Q${xw},820 ${xw - 60},920 Q${xw + 20},1000 ${xw - 40},1080" stroke="#fff" stroke-width="12" fill="none" opacity=".9"/>`;
    // Sun.
    out += `<circle cx="1760" cy="440" r="60" fill="${C.peachL}"/><circle cx="1760" cy="440" r="${76 + Math.sin(t * 2) * 6}" fill="none" stroke="${C.peachL}" stroke-width="4" opacity=".6"/>`;
    // Wall (the higher low) and castle.
    const smash = ease(seg(t, T.smash, T.smash + 0.8));
    const wk = pop(t, T.build, 0.7);
    const wallH = 120 * (1 - smash * 0.85);
    out += scaleAt(1060, 900, wk, `<path d="M1000,900 L1000,${900 - wallH} ${[0, 1, 2, 3].map(i => `L${1012 + i * 30},${900 - wallH} L${1012 + i * 30},${900 - wallH - 18} L${1030 + i * 30},${900 - wallH - 18} L${1030 + i * 30},${900 - wallH}`).join(' ')} L1130,${900 - wallH} L1130,900 Z" fill="#E8C08E" stroke="#C99A60" stroke-width="4"/>`);
    out += pill(1065, 1000, 'HIGHER LOW', C.purple, wk * (1 - smash * 0.0), 22);
    const ck = pop(t, T.build + 0.4, 0.8);
    const tw = (x, h, w) => { const hh = h * (1 - smash * 0.8); return `<rect x="${x - w / 2}" y="${880 - hh}" width="${w}" height="${hh}" fill="#F0CD9C" stroke="#C99A60" stroke-width="4"/><path d="M${x - w / 2 - 8},${880 - hh} L${x + w / 2 + 8},${880 - hh} L${x},${880 - hh - 50 * (1 - smash)} Z" fill="#E8C08E" stroke="#C99A60" stroke-width="4"/>`; };
    out += scaleAt(1330, 880, ck, `${tw(1240, 150, 70)}${tw(1420, 150, 70)}<rect x="1260" y="${880 - 100 * (1 - smash * 0.8)}" width="140" height="${100 * (1 - smash * 0.8)}" fill="#F0CD9C" stroke="#C99A60" stroke-width="4"/>${tw(1330, 230, 90)}
      ${smash < 0.5 ? `<path d="M1330,${650} L1330,590" stroke="${C.dark}" stroke-width="5"/><path d="M1330,590 L${1380 + Math.sin(t * 6) * 6},605 L1330,620 Z" fill="${C.pink}"/>` : ''}
      <rect x="1300" y="${880 - 70 * (1 - smash)}" width="60" height="${70 * (1 - smash)}" rx="30" fill="#C99A60"/>`);
    // Kid builder with bucket, and a crab.
    const kid = { x: 1640, y: 960, scale: 0.9, look: A.LOOKS.d, flip: true, seed: 4, at: s.start + 0.5, mood: t > T.smash && t < T.rule ? 'sad' : undefined, talk: ctx.talking && t > T.rule,
      hold: `<g transform="translate(0,10)"><path d="M-22,0 L22,0 L16,44 L-16,44 Z" fill="${C.pink}"/><path d="M-20,0 Q0,-26 20,0" stroke="${C.dark}" stroke-width="3" fill="none"/></g>` };
    out += who(t, kid);
    const cx = t < T.wave2 ? 860 + Math.sin(t * 1.5) * 40 : lerp(860, 1180, ease(seg(t, T.wave2, T.wave2 + 0.8)));
    out += crit(t, 'crab', { x: cx, y: 1010, scale: 0.8, seed: 3, at: s.start + 0.8, hop: t > T.wave2 && t < T.wave2 + 1.4 ? 14 : 0, hopH: 20 });
    // Chart sign.
    const sk = pop(t, T.build + 0.8, 0.7);
    if (sk > 0) {
      let g = `<rect x="320" y="840" width="14" height="160" fill="#9B6A45"/><rect x="120" y="390" width="420" height="300" rx="22" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
        <line x1="150" x2="510" y1="600" y2="600" stroke="${C.purple}" stroke-width="3" stroke-dasharray="10 8"/>${txt(500, 590, 'higher low', 18, DK.purple, { a: 'end' })}`;
      const base = [[150, 650], [230, 540], [270, 600], [370, 450]];
      g += polyPart(base, 1, CH.I, 8);
      const c1 = [[370, 450], [430, 545]], c2 = [[370, 450], [430, 545], [500, 660]];
      if (t < T.wave2) g += polyPart(c1, seg(t, T.wave1, T.wave1 + 1.7), C.pink, 8);
      else g += polyPart(c2, seg(t, T.wave2, T.wave2 + 1.8), C.pink, 8);
      out += scaleAt(330, 690, sk, g + `<rect x="300" y="690" width="60" height="160" fill="#9B6A45"/>`);
    }
    // Verdicts.
    if (t > T.held && t < T.wave2) out += check(1065, 700, pop(t, T.held, 0.5)) + pill(1065, 620, 'CORRECTION · moved back', C.peach, pop(t, T.held + 0.3), 26);
    if (t > T.story) out += cross(1065, 700, pop(t, T.story, 0.5)) + pill(1065, 620, 'REVERSAL · story changed', C.pink, pop(t, T.story + 0.3), 26);
    out += crit(t, 'gull', { x: 640 + Math.sin(t * 0.8) * 120, y: 470 + Math.sin(t * 2) * 20, scale: 0.7, fly: true, flip: Math.cos(t * 0.8) < 0, seed: 2 });
    return out;
  };

  // Airport X-ray: two identical red pullbacks, the scanner shows the structure inside.
  LIVE['s12-xray-scanner'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, '#EEF0F6', '#DCDFEA');
    // Guard and robot behind the belt.
    const g = { x: 1380, y: 1000, scale: 0.92, look: A.LOOKS.c, seed: 4, at: s.start + 0.4, talk: ctx.talking && t > T.rule };
    g.frontArm = (t > T.resA && t < T.resA + 2) || (t > T.resB && t < T.resB + 2) ? { a1: -100, a2: -120 } : { a1: 80, a2: 95 };
    out += who(t, g) + hat(t, g, 'cap', pop(t, s.start + 0.4));
    out += bot(t, { x: 1680, y: 1000, scale: 0.85, seed: 2, at: s.start + 0.8, flip: true, face: t > T.resB && t < T.rule ? 'x' : 'happy', armUp: t > T.resA && t < T.resA + 1.5 });
    // Monitor.
    const mk = pop(t, s.start + 0.3, 0.7);
    let m = `<rect x="950" y="630" width="20" height="60" fill="${C.muted}"/><rect x="690" y="370" width="540" height="270" rx="20" fill="${C.dark}"/><rect x="706" y="386" width="508" height="238" rx="12" fill="#1F3A40"/>
      ${Array.from({ length: 6 }, (_, i) => `<line x1="706" x2="1214" y1="${400 + i * 40}" y2="${400 + i * 40}" stroke="#2F5A60" stroke-width="2"/>`).join('')}`;
    const which = t < T.b + 1.6 ? 'A' : 'B';
    const sc = which === 'A' ? seg(t, T.scanA, T.scanA + 1.8) : seg(t, T.scanB, T.scanB + 1.8);
    if (sc > 0) {
      m += `<line x1="720" x2="1200" y1="560" y2="560" stroke="${C.tealL}" stroke-width="3" stroke-dasharray="10 8"/>` + txt(1196, 552, 'higher low', 18, C.tealL, { a: 'end' });
      m += polyPart([[730, 600], [800, 520], [850, 560], [950, 430]], 1, C.tealL, 7);
      const pts = which === 'A' ? [[950, 430], [1030, 520], [1090, 500]] : [[950, 430], [1030, 590], [1080, 560], [1180, 610]];
      m += polyPart(pts, sc, C.pink, 7);
      const scanX = 706 + ((t * 300) % 508);
      if (sc < 1) m += `<rect x="${scanX}" y="386" width="8" height="238" fill="${C.tealL}" opacity=".5"/>`;
      m += txt(730, 420, `BAG ${which}`, 22, C.tealL, { a: 'start' });
    }
    out += scaleAt(960, 640, mk, m);
    // Belt and tunnel.
    out += `<rect x="160" y="880" width="1560" height="34" rx="17" fill="${C.dark}"/>${Array.from({ length: 20 }, (_, i) => `<circle cx="${200 + i * 78}" cy="897" r="9" fill="${C.muted}"/>`).join('')}
      <rect x="200" y="914" width="20" height="86" fill="${C.muted}"/><rect x="1660" y="914" width="20" height="86" fill="${C.muted}"/>`;
    const bag = (x, lbl) => `<g transform="translate(${x},880)"><rect x="-80" y="-120" width="160" height="120" rx="18" fill="${C.pink}" stroke="${DK.pink}" stroke-width="5"/><path d="M-30,-120 L-30,-146 L30,-146 L30,-120" stroke="${DK.pink}" stroke-width="8" fill="none"/>
      <rect x="-60" y="-90" width="120" height="40" rx="8" fill="#fff" opacity=".85"/>${txt(0, -62, 'red pullback', 18, DK.pink)}${txt(0, -18, lbl, 24, '#fff', { f: 'Playfair Display' })}</g>`;
    const bxA = posAt(t, [[T.a, 260], [T.a + 2, 960], [T.resA + 0.4, 960], [T.resA + 2, 1500], [T.b + 1, 1500], [T.b + 3, 2200]]);
    const bxB = posAt(t, [[T.b, 260], [T.b + 2, 960], [T.resB + 0.4, 960], [T.resB + 2, 1500]]);
    if (bxA >= 0) out += bag(bxA, 'A');
    if (bxB >= 0) out += bag(bxB, 'B');
    out += `<rect x="820" y="700" width="280" height="184" rx="16" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${834 + i * 37}" y="716" width="30" height="164" fill="${C.purple}" opacity=".35"/>`).join('')}
      ${txt(960, 694, 'X-RAY', 22, DK.purple)}`;
    out += pill(560, 690, 'both red · look the same', C.muted, t < T.resA ? pop(t, T.a + 1.4) : 0, 24);
    // Verdicts.
    if (t > T.resA && t < T.b + 1.6) out += check(1260, 420, pop(t, T.resA, 0.5)) + pill(1240, 1040, 'A: CORRECTION · higher low held', C.peach, pop(t, T.resA + 0.3), 24);
    if (t > T.resB) out += cross(1260, 420, pop(t, T.resB, 0.5)) + pill(1240, 1040, 'B: REVERSAL · story changed', C.pink, pop(t, T.resB + 0.3), 24);
    if (t > T.rule) out += pill(480, 1040, 'colour decides nothing · structure does', C.purple, pop(t, T.rule, 0.6), 26);
    return out;
  };

  /* ======================= Lesson 4: Continuation ======================= */
  // Musical statues: the music stops after the correction; everyone freezes. Not enough information until price moves again.
  LIVE['s12-musical-statues'] = (s, t, ctx) => {
    const T = s.beats;
    const playing = t < T.freeze || t > T.resume;
    const tf = playing ? null : T.freeze;
    let out = `<rect x="0" y="360" width="1920" height="640" fill="#FBEFF4"/>` + ground(1000, '#F3E6F0', '#E8D3E2');
    // String lights.
    out += `<path d="M0,380 Q480,450 960,380 Q1440,450 1920,380" stroke="${C.dark}" stroke-width="3" fill="none"/>`;
    for (let i = 0; i < 16; i++) { const x = 60 + i * 120, y = 380 + Math.sin((x % 960) / 960 * Math.PI) * 52; out += `<circle cx="${x}" cy="${y + 14}" r="12" fill="${[C.pink, C.gold, C.teal, C.purple][i % 4]}" opacity="${playing ? 0.6 + 0.4 * Math.sin(t * 6 + i) : 0.35}"/>`; }
    // TV with the chart.
    const tk = pop(t, s.start + 0.3, 0.7);
    const o = { x: 680, y: 470, w: 560, h: 230, seed: 41, per: 40, maxBody: 13, swings: [[0, 0.15], [0.2, 0.5], [0.32, 0.32], [0.55, 0.78], [0.7, 0.5], [0.95, 0.98]] };
    let tv = `<rect x="640" y="440" width="640" height="290" rx="20" fill="${C.dark}"/><rect x="656" y="456" width="608" height="258" rx="12" fill="#fff"/>`;
    const pos = posAt(t, [[T.chart, 0], [T.freeze - 0.6, 4], [T.resume, 4], [T.resume + 2, 5]]);
    if (pos >= 0) tv += chart(o, pos);
    const hy = P(o, 3)[1];
    if (t > T.freeze) tv += hline(660, 1260, hy, C.muted, seg(t, T.freeze + 0.4, T.freeze + 1.2));
    if (!playing) {
      const q = pop(t, T.freeze, 0.4);
      tv += `<rect x="656" y="456" width="608" height="258" rx="12" fill="${C.purple}" opacity="${0.12 * clamp(q)}"/>` + scaleAt(1180, 520, q, `<rect x="1150" y="494" width="20" height="56" rx="5" fill="${C.purple}"/><rect x="1186" y="494" width="20" height="56" rx="5" fill="${C.purple}"/>`);
      tv += txt(1060, 620, '?', 90, C.purple, { f: 'Playfair Display', op: 0.5 + 0.3 * Math.sin(t * 4) });
    }
    out += scaleAt(960, 730, tk, tv);
    if (!playing && t > T.nei) out += pill(960, 790, 'NOT ENOUGH INFORMATION', C.purple, pop(t, T.nei, 0.5), 28);
    if (t > T.freeze && playing === false) out += pill(960, 410, 'FREEZE!', C.pink, pop(t, T.freeze, 0.4), 30);
    if (t > T.confirm) { const c = P(o, 5); out += check(1300, 520, pop(t, T.confirm, 0.5)) + pill(960, 790, 'CONTINUATION CONFIRMED', C.purple, pop(t, T.confirm + 0.2, 0.5), 28) + A.sparkle(c[0], c[1], T.confirm, t); }
    // Dancers.
    const dance = (base, i) => playing ? { a1: -100 + Math.sin(t * 6 + i) * 40, a2: -120 + Math.sin(t * 6 + i) * 40 } : { a1: -100 + Math.sin(T.freeze * 6 + i) * 40, a2: -120 + Math.sin(T.freeze * 6 + i) * 40 };
    const d1 = { x: 330, y: 1000, scale: 0.9, look: A.LOOKS.d, seed: 2, at: s.start + 0.5, tFreeze: tf, frontArm: dance(0, 1) };
    const d2 = { x: 1720, y: 1000, scale: 0.9, look: A.LOOKS.b, flip: true, seed: 5, at: s.start + 0.8, tFreeze: tf, frontArm: dance(0, 3), talk: ctx.talking && t > T.guess && t < T.nei };
    const bounce = (x, i) => playing ? -Math.abs(Math.sin(t * 6 + i)) * 18 : -Math.abs(Math.sin(T.freeze * 6 + i)) * 18;
    out += `<g transform="translate(0,${bounce(0, 1)})">${who(t, d1)}${hat(tf ?? t, d1, 'party', pop(t, s.start + 0.5))}</g>`;
    out += `<g transform="translate(0,${bounce(0, 2)})">${who(t, d2)}${hat(tf ?? t, d2, 'party', pop(t, s.start + 0.8))}</g>`;
    out += crit(t, 'rabbit', { x: 560, y: 1000, scale: 0.8, seed: 3, at: s.start + 1, tFreeze: tf, hop: playing ? 6 : 0, hopH: 30 });
    out += crit(t, 'cat', { x: 1050, y: 1000, scale: 0.75, seed: 6, flip: true, at: s.start + 1.2, tFreeze: tf, hop: playing ? 5 : 0, hopH: 22 });
    // DJ.
    const dj = { x: 1380, y: 1040, scale: 0.8, look: A.LOOKS.e, seed: 4, at: s.start + 0.4, frontArm: playing ? { a1: 10 + Math.sin(t * 8) * 10, a2: 20 } : { a1: -80, a2: -100 } };
    out += who(t, dj) + hat(t, dj, 'headset', pop(t, s.start + 0.4));
    out += `<g transform="translate(420,0)"><rect x="800" y="900" width="320" height="140" rx="16" fill="${C.purple}"/><circle cx="880" cy="930" r="30" fill="${C.dark}" /><circle cx="1040" cy="930" r="30" fill="${C.dark}"/>
      <line x1="880" y1="930" x2="${880 + Math.cos(playing ? t * 8 : 0) * 26}" y2="${930 + Math.sin(playing ? t * 8 : 0) * 26}" stroke="#fff" stroke-width="4"/><line x1="1040" y1="930" x2="${1040 + Math.cos(playing ? t * 8 + 2 : 2) * 26}" y2="${930 + Math.sin(playing ? t * 8 + 2 : 2) * 26}" stroke="#fff" stroke-width="4"/></g>`;
    if (playing && t > s.start + 1) out += notes(1580, 880, t) + notes(200, 900, t + 0.5);
    // Guesses.
    out += bub(560, 760, 'Up next!', t > T.guess && t < T.resume ? pop(t, T.guess, 0.5) : 0, { size: 28 });
    out += bub(1700, 600, 'Down?!', t > T.guess + 0.8 && t < T.resume ? pop(t, T.guess + 0.8, 0.5) : 0, { size: 28, tail: 'right' });
    return out;
  };

  // An award ceremony: the continuation medal is only handed out when it is proven. Price chops, so it goes back in the box.
  LIVE['s12-medal-ceremony'] = (s, t, ctx) => {
    const T = s.beats;
    let out = `<rect x="0" y="360" width="1920" height="640" fill="#F4F2FC"/>` + ground(1000, '#E9E6F7', '#DAD6F0');
    for (let i = 0; i < 6; i++) out += `<path d="M${200 + i * 320},360 L${260 + i * 320},360 L${300 + i * 320 + Math.sin(t + i) * 10},1000 L${160 + i * 320 + Math.sin(t + i) * 10},1000 Z" fill="#fff" opacity=".35"/>`;
    // Scoreboard chart.
    const bk = pop(t, T.board, 0.7);
    const o = { x: 230, y: 440, w: 520, h: 280, seed: 52, per: 46, maxBody: 11, swings: [[0, 0.2], [0.18, 0.6], [0.3, 0.42], [0.45, 0.8], [0.55, 0.55], [0.62, 0.7], [0.68, 0.6], [0.75, 0.72], [0.82, 0.58], [0.9, 0.71], [0.98, 0.62]] };
    let sb = `<rect x="200" y="410" width="580" height="340" rx="22" fill="#fff" stroke="${C.purple}" stroke-width="6"/><rect x="470" y="750" width="40" height="250" fill="${C.purple}"/>`;
    const pos = posAt(t, [[T.board + 0.3, 0], [T.board + 3.2, 4], [T.chop, 4], [T.chop + 4.4, 10]]);
    if (pos >= 0) sb += chart(o, pos);
    sb += hline(220, 770, P(o, 3)[1], C.purple, seg(t, T.chop + 0.4, T.chop + 1.2), 'prove it here', 640, 18);
    out += scaleAt(490, 750, bk, sb);
    out += crit(t, 'owl', { x: 700, y: 412, scale: 0.6, seed: 2, at: T.board + 0.6 });
    // Tracker.
    const tr = pop(t, T.tracker, 0.6);
    if (tr > 0) {
      out += scaleAt(1520, 470, tr, `<rect x="1300" y="420" width="440" height="100" rx="50" fill="#fff" stroke="#E2DDF3" stroke-width="3"/>`);
      out += tag(1380, 470, 'I', CH.I, tr, 32) + check(1410, 444, tr, C.teal, 14) + tag(1520, 470, 'C', CH.C, tr, 32) + check(1550, 444, tr, C.teal, 14);
      const bl = 0.5 + 0.5 * Math.sin(t * 5);
      out += scaleAt(1660, 470, tr, `<circle cx="1660" cy="470" r="32" fill="#fff" stroke="${C.purple}" stroke-width="5" stroke-dasharray="8 6" opacity="${0.5 + bl * 0.5}"/>${txt(1660, 482, 'C', 32, C.purple, { f: 'Playfair Display' })}`);
      if (t > T.noaward) out += pill(1660, 545, 'stays open', C.purple, pop(t, T.noaward + 1, 0.5), 20);
    }
    // Podium.
    out += `<rect x="820" y="860" width="280" height="140" rx="10" fill="${C.purple}"/><rect x="700" y="920" width="130" height="80" rx="10" fill="${C.purpleL}"/><rect x="1090" y="940" width="130" height="60" rx="10" fill="${C.purpleL}"/>
      ${txt(960, 950, '1', 60, '#fff', { f: 'Playfair Display' })}`;
    const chopping = t > T.chop && t < T.chop + 4.4;
    const wig = chopping ? Math.sin(t * 7) * 40 : 0;
    out += cguy(t, { x: 960 + wig, y: 860, scale: 0.8, col: C.teal, seed: 3, at: s.start + 0.6, pose: chopping ? 'run' : t > T.noaward ? null : 'wave', flip: chopping && Math.cos(t * 7) < 0, mood: t > T.noaward ? 'sad' : null });
    // Host with the medal.
    const host = { x: 1420, y: 1000, scale: 0.92, look: A.LOOKS.seller, flip: true, seed: 6, at: s.start + 0.4, talk: ctx.talking && t > T.rule };
    const mk = ease(seg(t, T.noaward, T.noaward + 1.4));
    const medal = `<g><path d="M-14,-60 L0,-20 L14,-60" stroke="${C.pink}" stroke-width="10" fill="none"/><circle cy="0" r="30" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/>${txt(0, 12, 'C', 34, '#fff', { f: 'Playfair Display' })}</g>`;
    host.frontArm = t < T.noaward ? { a1: -40, a2: -60 } : { a1: lerp(-40, 60, mk), a2: lerp(-60, 30, mk) };
    if (t < T.noaward + 0.6) host.hold = medal;
    out += who(t, host);
    // Medal box.
    out += `<rect x="1580" y="900" width="200" height="100" rx="10" fill="#9B6A45"/><rect x="1580" y="880" width="200" height="30" rx="8" fill="#B88058"/>${txt(1680, 965, 'CONTINUATION', 18, '#fff')}`;
    if (t > T.noaward + 0.6) { const k = ease(seg(t, T.noaward + 0.6, T.noaward + 1.6)); out += `<g transform="translate(${lerp(1460, 1680, k)},${lerp(800, 880, k) - Math.sin(k * Math.PI) * 120}) scale(${1 - k * 0.4})">${medal}</g>`; }
    out += bub(1420, 560, 'Continuation?', t > T.chop + 1.2 && t < T.noaward ? pop(t, T.chop + 1.2, 0.5) : 0, { size: 28, tail: 'right' });
    if (t > T.noaward) out += pill(1000, 1040, 'NO CONTINUATION · NO AWARD', C.pink, pop(t, T.noaward + 0.4, 0.5), 26);
    return out;
  };

  /* ======================= Lesson 5: The Full ICC Sequence ======================= */
  // A clothesline strung along the price path: I, a long C bedsheet across two swings, then C.
  LIVE['s12-clothesline'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, '#EEF6EC', '#DCEBD8');
    out += `<path d="M0,1000 Q300,940 620,1000 Z" fill="#DCEBD8"/><path d="M1300,1000 Q1620,930 1920,1000 Z" fill="#DCEBD8"/>`;
    const pts = [[200, 700], [330, 640], [420, 690], [640, 470], [800, 590], [900, 540], [1060, 640], [1480, 420], [1640, 450]];
    // Posts.
    out += `<rect x="186" y="680" width="22" height="320" rx="8" fill="#9B6A45"/><rect x="1630" y="430" width="22" height="570" rx="8" fill="#9B6A45"/>`;
    const rk = seg(t, T.rope, T.rope + 1.6);
    out += polyPart(pts, rk, C.dark, 4, 0.8);
    out += pill(260, 610, 'price', C.muted, pop(t, T.rope + 1.2), 22);
    const yAt = x => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); return pts[pts.length - 1][1]; };
    const sway = Math.sin(t * 2) * 4;
    const peg = (x) => `<rect x="${x - 5}" y="${yAt(x) - 14}" width="10" height="26" rx="3" fill="${C.gold}"/>`;
    const shirt = (x0, x1, col, letter, k) => {
      if (k <= 0) return '';
      const y0 = yAt(x0), y1 = yAt(x1), d = 150 * k, sl = 40;
      return `<g opacity="${clamp(k * 2)}"><path d="M${x0},${y0} L${x0 - sl},${y0 + 40} L${x0 - sl + 18},${y0 + 62} L${x0 + 6},${y0 + 46} L${x0 + 6 + sway},${y0 + d} L${x1 - 6 + sway},${y1 + d} L${x1 - 6},${y1 + 46} L${x1 + sl - 18},${y1 + 62} L${x1 + sl},${y1 + 40} L${x1},${y1} Z" fill="${col}"/>
        ${txt((x0 + x1) / 2 + sway, (y0 + y1) / 2 + d * 0.62, letter, 54, '#fff', { f: 'Playfair Display' })}${peg(x0)}${peg(x1)}</g>`;
    };
    const sheet = (x0, x1, col, k) => {
      if (k <= 0) return '';
      let d = '', st = 20;
      for (let x = x0; x <= x1; x += st) d += `${d ? 'L' : 'M'}${x},${yAt(x)}`;
      const drop = 190 * k;
      for (let x = x1; x >= x0; x -= st) d += ` L${x + sway},${yAt(x) + drop + Math.sin(x * 0.05 + t * 3) * 6}`;
      return `<g opacity="${clamp(k * 2)}"><path d="${d} Z" fill="${col}"/>${[0.3, 0.6].map(f => `<line x1="${lerp(x0, x1, f)}" y1="${yAt(lerp(x0, x1, f)) + 10}" x2="${lerp(x0, x1, f) + sway}" y2="${yAt(lerp(x0, x1, f)) + drop - 10}" stroke="#fff" stroke-width="3" opacity=".35"/>`).join('')}
        ${txt((x0 + x1) / 2 + sway, yAt((x0 + x1) / 2) + drop * 0.6, 'C', 60, '#fff', { f: 'Playfair Display' })}${peg(x0)}${peg((x0 + x1) / 2)}${peg(x1)}</g>`;
    };
    out += shirt(470, 590, CH.I, 'I', ease(seg(t, T.I, T.I + 0.8)));
    out += sheet(660, 1050, CH.C, ease(seg(t, T.C, T.C + 1)));
    out += shirt(1180, 1330, CH.C2, 'C', ease(seg(t, T.C2, T.C2 + 0.8)));
    if (t > T.two) out += pill(855, 440, 'one correction · two swings', C.peach, pop(t, T.two, 0.5), 24);
    // Hanger walks to each spot with a prop stick.
    const spots = [[T.rope, 300], [T.I - 1, 530], [T.C - 1, 855], [T.C2 - 1, 1255], [T.done, 1255]];
    let px = 300; spots.forEach(([at, x], i) => { if (t > at && i) px = lerp(spots[i - 1][1], x, ease(seg(t, at, at + 1))); });
    const moving = spots.some(([at], i) => i && t > at && t < at + 1);
    const hp = { x: px, y: 1000, scale: 0.9, look: A.LOOKS.a, seed: 3, at: s.start + 0.4, walking: moving, talk: ctx.talking && t > T.done,
      frontArm: moving ? undefined : { a1: -80, a2: -90 }, hold: moving ? undefined : `<rect x="-5" y="-150" width="10" height="160" rx="5" fill="#9B6A45"/>` };
    out += who(t, hp);
    out += `<g transform="translate(${px + 110},1000)"><path d="M-56,-70 L56,-70 L44,0 L-44,0 Z" fill="${C.peachL}" stroke="${C.peach}" stroke-width="4"/>${[0, 1, 2].map(i => `<line x1="${-46 + i * 4}" y1="${-50 + i * 18}" x2="${46 - i * 4}" y2="${-50 + i * 18}" stroke="${C.peach}" stroke-width="3"/>`).join('')}</g>`;
    out += crit(t, 'bird', { x: 197, y: 680, scale: 0.7, seed: 2, at: s.start + 1, talk: t > T.two && t < T.two + 2 });
    out += crit(t, 'cat', { x: 1760, y: 1000, scale: 0.75, flip: true, seed: 5, at: s.start + 1.4, hop: t > T.done ? 4 : 0, hopH: 16 });
    if (t > T.done) out += A.sparkle(1255, 520, T.done, t) + pill(960, 1040, 'each letter on the movement it describes', C.purple, pop(t, T.done, 0.5), 24);
    return out;
  };

  // A baker cuts an "up, down, up" cookie out of a range. Right shape, nothing meaningful: not enough information.
  LIVE['s12-cookie-cutter'] = (s, t, ctx) => {
    const T = s.beats;
    let out = `<rect x="0" y="360" width="1920" height="460" fill="#FDF4EC"/>`;
    for (let i = 0; i < 20; i++) for (let j = 0; j < 5; j++) out += `<rect x="${i * 100 + (j % 2) * 50}" y="${380 + j * 90}" width="92" height="82" rx="6" fill="#fff" opacity=".55"/>`;
    out += `<rect x="0" y="820" width="1920" height="260" fill="#C98A5A"/><rect x="0" y="820" width="1920" height="24" fill="#E0A877"/>`;
    // Dough with the range.
    const dk = pop(t, T.dough, 0.7);
    let dg = `<path d="M520,560 Q500,520 560,520 L1320,520 Q1380,520 1360,560 L1380,800 Q1390,840 1330,840 L550,840 Q490,840 500,800 Z" fill="#F6DDB6" stroke="#E8C08E" stroke-width="5"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${600 + i * 130}" cy="${560 + (i % 3) * 90}" r="5" fill="#E8C08E"/>`).join('')}`;
    out += scaleAt(940, 840, dk, dg);
    const rg = seg(t, T.check, T.check + 0.8);
    const rangeCol = rg > 0 ? C.pink : C.muted;
    out += hline(540, 1340, 590, rangeCol, seg(t, T.dough + 0.6, T.dough + 1.4)) + hline(540, 1340, 790, rangeCol, seg(t, T.dough + 0.8, T.dough + 1.6));
    out += pill(1440, 590, 'range high', rangeCol, pop(t, T.dough + 1.2), 22) + pill(1440, 790, 'range low', rangeCol, pop(t, T.dough + 1.4), 22);
    // Cutter.
    const zz = [[720, 760], [840, 640], [930, 720], [1060, 620], [1140, 650]];
    const down = ease(seg(t, T.press, T.press + 0.7)), up = ease(seg(t, T.press + 1.6, T.press + 2.3));
    const cy = -300 * (1 - down) - 300 * up;
    const zd = zz.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    if (t > T.press + 0.7) out += `<path d="${zd}" stroke="#E8A35C" stroke-width="30" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${zd}" stroke="#F6C98A" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (t > T.press - 0.4 && up < 1) {
      const sq = t > T.press + 0.7 && t < T.press + 1.6 ? 1 - Math.sin(seg(t, T.press + 0.7, T.press + 1.0) * Math.PI) * 0.05 : 1;
      out += `<g transform="translate(0,${cy}) translate(930,690) scale(1,${sq}) translate(-930,-690)" opacity="${clamp((t - T.press + 0.4) * 3)}"><path d="${zd}" stroke="#B8BCC8" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="${zd}" transform="translate(0,-14)" stroke="#D9DCE4" stroke-width="10" fill="none" stroke-linejoin="round"/>
        <rect x="900" y="570" width="60" height="30" rx="10" fill="${C.pink}" transform="translate(0,-20)"/></g>`;
    }
    // Baker.
    const bk = { x: 330, y: 1020, scale: 0.95, look: A.LOOKS.d, seed: 2, at: s.start + 0.4, talk: ctx.talking && t > T.claim && t < T.check };
    bk.frontArm = t > T.claim && t < T.nei ? { a1: -20, a2: -30 } : { a1: 70, a2: 95 };
    bk.mood = t > T.nei && t < T.rule ? 'sad' : undefined;
    out += who(t, bk) + hat(t, bk, 'chef', pop(t, s.start + 0.4));
    out += bub(400, 560, 'Bullish ICC!', t > T.claim && t < T.check + 0.4 ? pop(t, T.claim, 0.5) : 0, { size: 30 });
    // Cat taster on the counter.
    out += crit(t, 'cat', { x: 1600, y: 830, scale: 0.85, flip: true, seed: 4, at: s.start + 1, talk: t > T.check && t < T.nei });
    out += bub(1640, 470, 'Anything meaningful?', t > T.check && t < T.rule ? pop(t, T.check, 0.5) : 0, { size: 26, tail: 'right' });
    if (t > T.check) out += pill(940, 480, 'price never left the range', C.pink, pop(t, T.check + 0.4, 0.5), 26);
    if (t > T.nei) {
      const q = pop(t, T.nei, 0.5);
      out += scaleAt(940, 690, q, `<g transform="rotate(-6 940 690)"><rect x="640" y="640" width="600" height="100" rx="18" fill="#fff" stroke="${C.purple}" stroke-width="7" opacity=".95"/>${txt(940, 705, 'NOT ENOUGH INFORMATION', 34, DK.purple)}</g>`);
    }
    if (t > T.rule) out += pill(940, 960, 'the shape isn’t the method', C.purple, pop(t, T.rule, 0.5), 30) + A.sparkle(940, 900, T.rule, t);
    return out;
  };

  /* ======================= Lesson 6: ICC Across Different Timeframes ======================= */
  // A scientist zooms into the 4H correction: inside it, the 1H printed its own full ICC.
  LIVE['s12-microscope'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, '#EEF4F8', '#DCE6EE');
    for (let i = 0; i < 12; i++) out += `<rect x="${i * 160}" y="1004" width="80" height="76" fill="#E2EBF2"/>`;
    const o4 = { x: 210, y: 440, w: 520, h: 300, seed: 61, per: 30, maxBody: 14, swings: [[0, 0.12], [0.25, 0.45], [0.4, 0.3], [0.7, 0.92], [1, 0.5]] };
    const bk = pop(t, T.board, 0.7);
    let b = `<rect x="180" y="410" width="580" height="360" rx="24" fill="#fff" stroke="${C.purple}" stroke-width="6"/>`;
    const p4 = posAt(t, [[T.board + 0.2, 0], [T.board + 3, 4]]);
    if (p4 >= 0) b += chart(o4, p4);
    out += scaleAt(470, 770, bk, b);
    out += leg(o4, 2, 3, seg(t, T.label4 - 0.4, T.label4 + 0.4), CH.I, 7, 0.5) + leg(o4, 3, 4, seg(t, T.label4, T.label4 + 0.8), CH.C, 7, 0.6);
    out += pill(470, 820, '4H · correcting', C.peach, pop(t, T.label4), 28);
    // Lens on the correction leg, cone to the view.
    const a = P(o4, 3), c = P(o4, 4), lc = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    const lk = pop(t, T.lens, 0.6);
    const vx = 1380, vy = 640, vr = 250;
    const vk = pop(t, T.view, 0.7);
    if (vk > 0) out += `<path d="M${lc[0]},${lc[1] - 60} L${vx},${vy - vr} L${vx},${vy + vr} L${lc[0]},${lc[1] + 60} Z" fill="${C.purpleL}" opacity="${0.3 * clamp(vk)}"/>`;
    if (lk > 0) out += scaleAt(lc[0], lc[1], lk, `<circle cx="${lc[0]}" cy="${lc[1]}" r="64" fill="#fff" fill-opacity=".25" stroke="${C.dark}" stroke-width="10"/><line x1="${lc[0] + 46}" y1="${lc[1] + 46}" x2="${lc[0] + 120}" y2="${lc[1] + 140}" stroke="${C.dark}" stroke-width="18" stroke-linecap="round"/>`);
    if (vk > 0) {
      const o1 = { x: vx - 200, y: vy - 170, w: 400, h: 330, seed: 62, per: 34, maxBody: 11, swings: [[0, 0.85], [0.2, 0.45], [0.3, 0.6], [0.45, 0.15], [0.6, 0.66], [0.72, 0.42], [0.98, 0.92]] };
      let v = `<defs><clipPath id="s12-mclip"><circle cx="${vx}" cy="${vy}" r="${vr}"/></clipPath></defs><circle cx="${vx}" cy="${vy}" r="${vr}" fill="#fff"/>
        <g clip-path="url(#s12-mclip)">${Array.from({ length: 10 }, (_, i) => `<line x1="${vx - vr}" x2="${vx + vr}" y1="${vy - vr + i * 50}" y2="${vy - vr + i * 50}" stroke="#F1E7E1" stroke-width="2"/>`).join('')}`;
      const p1 = posAt(t, [[T.view + 0.4, 0], [T.view + 2.6, 3], [T.view + 3.8, 6]]);
      if (p1 >= 0) v += chart(o1, p1);
      v += leg(o1, 3, 4, seg(t, T.tags, T.tags + 0.6), CH.I, 6, 0.6) + leg(o1, 4, 5, seg(t, T.tags + 0.8, T.tags + 1.4), CH.C, 6, 0.6) + leg(o1, 5, 6, seg(t, T.tags + 1.6, T.tags + 2.2), CH.C2, 6, 0.6);
      v += `</g><circle cx="${vx}" cy="${vy}" r="${vr}" fill="none" stroke="${C.dark}" stroke-width="14"/>`;
      const m = (i, j) => { const p = P(o1, i), q = P(o1, j); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
      const [i1, c1, c2] = [m(3, 4), m(4, 5), m(5, 6)];
      v += tag(i1[0] - 40, i1[1], 'I', CH.I, pop(t, T.tags, 0.5), 24) + tag(c1[0] + 30, c1[1] + 30, 'C', CH.C, pop(t, T.tags + 0.8, 0.5), 24) + tag(c2[0] - 40, c2[1] + 10, 'C', CH.C2, pop(t, T.tags + 1.6, 0.5), 24);
      out += scaleAt(vx, vy, vk, v);
      out += pill(vx, vy + vr + 50, '1H · bullish sequence', C.teal, pop(t, T.label1), 28);
    }
    // Deeper scales.
    const dk = pop(t, T.deep, 0.6);
    if (dk > 0) {
      const mini = (x, y, r, n, at, label) => scaleAt(x, y, pop(t, at, 0.6), `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${C.dark}" stroke-width="7"/>
        <polyline points="${Array.from({ length: n }, (_, i) => `${x - r * 0.7 + i * (r * 1.4) / (n - 1)},${y + r * 0.3 - i * (r * 0.6) / (n - 1) + (i % 2 ? -1 : 1) * r * 0.22}`).join(' ')}" fill="none" stroke="${C.teal}" stroke-width="4" stroke-linejoin="round"/>
        ${pill(x, y + r + 26, label, C.muted, 1, 18)}`);
      out += mini(1720, 410, 70, 9, T.deep, '15M') + mini(1760, 590, 54, 17, T.deep + 0.8, '1M');
    }
    // Scientist and lab mouse.
    const sc = { x: 940, y: 1000, scale: 0.92, look: A.LOOKS.e, seed: 3, at: s.start + 0.5, talk: ctx.talking && t > T.same };
    sc.frontArm = t > T.lens ? aim(sc, lc[0] + 120, lc[1] + 140) : { a1: 80, a2: 95 };
    out += who(t, sc) + hat(t, sc, 'goggles', pop(t, s.start + 0.5));
    out += crit(t, 'mouse', { x: 1120, y: 1000, scale: 0.9, seed: 2, at: s.start + 1, hop: t > T.view && t < T.view + 1.5 ? 10 : 0, hopH: 16 });
    if (t > T.same) out += pill(960, 1040, 'same market · different scale', C.purple, pop(t, T.same, 0.5), 28);
    return out;
  };

  // A commentary booth: the robot says "the market is bearish" and gets the buzzer; the pro names the timeframe and the chapter.
  LIVE['s12-commentary-booth'] = (s, t, ctx) => {
    const T = s.beats;
    let out = `<rect x="0" y="360" width="1920" height="720" fill="#F6F1EE"/>`;
    // Window with two screens.
    const flash = t > T.buzz && t < T.buzz + 0.8 ? 0.25 * (1 - seg(t, T.buzz, T.buzz + 0.8)) : 0;
    out += `<rect x="340" y="370" width="1240" height="270" rx="24" fill="${C.dark}"/><rect x="356" y="386" width="1208" height="238" rx="16" fill="#E8F4F7"/>
      <rect x="356" y="386" width="1208" height="238" rx="16" fill="${C.pink}" opacity="${flash}"/>`;
    const o4 = { x: 420, y: 430, w: 480, h: 170, seed: 71, per: 28, maxBody: 12, swings: [[0, 0.1], [0.3, 0.5], [0.42, 0.35], [0.72, 0.95], [1, 0.5]] };
    const o1 = { x: 1030, y: 430, w: 480, h: 170, seed: 72, per: 36, maxBody: 10, swings: [[0, 0.75], [0.25, 0.3], [0.38, 0.5], [0.55, 0.12], [0.75, 0.62], [0.88, 0.42], [1, 0.6]] };
    out += `<rect x="400" y="400" width="520" height="210" rx="12" fill="#fff"/><rect x="1010" y="400" width="520" height="210" rx="12" fill="#fff"/>`;
    out += chart(o4, posAt(t, [[s.start + 0.3, 0], [s.start + 2.4, 4]])) + chart(o1, posAt(t, [[s.start + 0.6, 0], [s.start + 2.8, 6]]));
    out += txt(420, 446, '4H', 24, C.muted, { a: 'start' }) + txt(1030, 446, '1H', 24, C.muted, { a: 'start' });
    if (t > T.say1) out += leg(o4, 3, 4, seg(t, T.say1, T.say1 + 0.8), CH.C, 8, 0.7) + `<rect x="400" y="400" width="520" height="210" rx="12" fill="none" stroke="${C.peach}" stroke-width="8"/>`;
    if (t > T.say2) out += leg(o1, 3, 4, seg(t, T.say2, T.say2 + 0.6), CH.I, 7, 0.6) + leg(o1, 4, 5, seg(t, T.say2 + 0.6, T.say2 + 1.2), CH.C, 7, 0.6) + `<rect x="1010" y="400" width="520" height="210" rx="12" fill="none" stroke="${C.teal}" stroke-width="8"/>`;
    // Commentators.
    out += bot(t, { x: 600, y: 1010, scale: 0.85, seed: 3, at: s.start + 0.4, talk: ctx.talking && t > T.robot && t < T.buzz, face: t > T.buzz && t < T.say1 ? 'x' : 'happy', armUp: t > T.robot && t < T.buzz });
    const pro = { x: 1320, y: 1010, scale: 0.88, look: A.LOOKS.buyer, flip: true, seed: 5, at: s.start + 0.6, talk: ctx.talking && t > T.say1 - 0.2 };
    if (t > T.say1) pro.frontArm = { a1: -40 + Math.sin(t * 3) * 6, a2: -60 };
    out += who(t, pro) + hat(t, pro, 'headset', pop(t, s.start + 0.6));
    // Desk with mics.
    out += `<rect x="260" y="930" width="1400" height="160" rx="20" fill="${C.purple}"/><rect x="260" y="930" width="1400" height="22" rx="10" fill="${DK.purple}"/>
      ${[700, 1200].map(x => `<rect x="${x - 6}" y="870" width="12" height="64" fill="${C.dark}"/><rect x="${x - 18}" y="836" width="36" height="50" rx="18" fill="${C.muted}"/>`).join('')}
      ${txt(960, 1000, 'MARKET COMMENTARY', 28, '#fff')}`;
    out += crit(t, 'parrot', { x: 960, y: 930, scale: 0.8, seed: 2, at: s.start + 1, talk: t > T.parrot && t < T.parrot + 2, hop: t > T.parrot && t < T.parrot + 1 ? 8 : 0, hopH: 12 });
    // Lines.
    out += bub(600, 690, 'The market is bearish!', t > T.robot && t < T.say1 ? pop(t, T.robot, 0.5) : 0, { size: 28 });
    out += cross(830, 690, t > T.buzz && t < T.say1 ? pop(t, T.buzz, 0.4) : 0);
    out += bub(1000, 760, 'Which market? Which scale?', t > T.parrot && t < T.say1 ? pop(t, T.parrot, 0.5) : 0, { size: 26, fill: '#FEF3E4' });
    out += bub(1240, 670, '“The 4H is correcting.”', t > T.say1 && t < T.say2 ? pop(t, T.say1, 0.5) : 0, { size: 28, tail: 'right', color: DK.peach });
    out += bub(1180, 670, '“1H bullish sequence developing.”', t > T.say2 ? pop(t, T.say2, 0.5) : 0, { size: 26, tail: 'right', color: DK.teal });
    out += check(660, 505, pop(t, T.say1 + 0.4, 0.5), C.peach, 30) + check(1270, 505, pop(t, T.say2 + 0.4, 0.5), C.teal, 30);
    if (t > T.up) out += pill(960, 1052, 'timeframe + chapter = a whole upgrade', C.pink, pop(t, T.up, 0.5), 26) + A.sparkle(960, 700, T.up, t);
    return out;
  };

  /* @@MORE@@ */

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
