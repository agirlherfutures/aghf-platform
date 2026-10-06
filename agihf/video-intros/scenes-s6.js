/**
 * scenes-s6.js: illustrated scene types for Section 6 (Reading Key Levels) lesson intro videos.
 *
 * Fourteen bespoke metaphor scenes, two per lesson (Phase 2, Lessons 18 to 24).
 * Every LIVE entry is a pure function of t, so renders are frame-accurate.
 * Choreography is written in scene-local time u = t - s.start; the lesson files
 * time their narration and headlines to match.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  const F = n => (+n).toFixed(1);

  function blink(t, seed) {
    const period = 3.4 + (seed % 3) * 0.8;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }

  // Pill label with white text.
  const pill = (x, y, text, col, k = 1, fs = 28, fg = '#fff') => {
    if (k <= 0) return '';
    const w = [...text].length * fs * 0.6 + 36;
    return `<g transform="translate(${F(x)},${F(y)}) scale(${k.toFixed(3)})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${fg}" font-family="DM Sans">${text}</text></g>`;
  };
  // Scale a fragment about a point.
  const about = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${F(x)},${F(y)}) scale(${k.toFixed(3)}) translate(${F(-x)},${F(-y)})">${inner}</g>`;
  // Rubber stamp that slams down.
  function stamp(x, y, text, col, t, at, rot = -8, fs = 44) {
    const e = ease((t - at) / 0.35);
    if (e <= 0) return '';
    const w = [...text].length * fs * 0.66 + 60, sc = 1 + (1 - e) * 0.9;
    return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc.toFixed(3)})" opacity="${clamp(e * 1.5)}">
      <rect x="${-w / 2}" y="${-fs * 0.95}" width="${w}" height="${fs * 1.9}" rx="16" fill="#fff" fill-opacity=".85" stroke="${col}" stroke-width="7"/>
      <rect x="${-w / 2 + 10}" y="${-fs * 0.95 + 10}" width="${w - 20}" height="${fs * 1.9 - 20}" rx="10" fill="none" stroke="${col}" stroke-width="2.5"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${col}" font-family="DM Sans" letter-spacing="2">${text}</text></g>`;
  }
  const tick = (x, y, k, r = 26, col = C.tealD) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}"/><path d="M${-r * 0.42},0 L${-r * 0.1},${r * 0.32} L${r * 0.45},${-r * 0.32}" fill="none" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, r = 26, col = C.pink) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}"/><path d="M${-r * 0.35},${-r * 0.35} L${r * 0.35},${r * 0.35} M${r * 0.35},${-r * 0.35} L${-r * 0.35},${r * 0.35}" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round"/></g>`;
  const qmark = (x, y, t, at, col = C.purple, size = 90) => {
    const k = pop(t, at, 0.5);
    if (k <= 0) return '';
    return `<text x="${x}" y="${F(y + Math.sin(t * 3) * 6)}" font-size="${F(size * k)}" font-weight="900" text-anchor="middle" fill="${col}" font-family="Playfair Display">?</text>`;
  };
  const P = (t, o) => A.person(t, o);
  // Angle (local, degrees) for a person's front arm to point at a world target.
  const aim = (px, py, s, flip, tx, ty) => {
    const sx = px + (flip ? -18 : 18) * s, sy = py - 196 * s;
    const dx = tx - sx, dy = ty - sy;
    return deg(Math.atan2(dy, flip ? -dx : dx));
  };
  const walkX = (t, a, b, x0, x1) => ({ x: lerp(x0, x1, seg(t, a, b)), walking: t > a && t < b });

  const LK = {
    kid: { skin: '#8E5A3C', hair: '#2C1810', hairStyle: 'puff', shirt: C.peach, pants: '#3D3550' },
    hiker: { skin: '#E8B48C', hair: '#7A4A2A', hairStyle: 'short', shirt: C.tealD, pants: '#5C4A6E' },
    grump: { skin: '#F1C7A5', hair: '#9B8B80', hairStyle: 'short', shirt: C.purple, pants: '#3D3550' },
    zoe: { skin: '#C68B62', hair: '#2C1810', hairStyle: 'bun', shirt: C.teal, pants: '#5C4A6E' },
    goldi: { skin: '#F3CDB0', hair: '#E9A93B', hairStyle: 'waves', shirt: C.pinkL, pants: '#4A5A78' },
    bouncer: { skin: '#6E4530', hair: '#1E120C', hairStyle: 'short', shirt: C.dark, pants: '#2C1810' },
    mover: { skin: '#B07750', hair: '#2C1810', hairStyle: 'short', shirt: C.peach, pants: '#4A5A78' },
    judge: { skin: '#A86B4C', hair: '#C9B9AE', hairStyle: 'bun', shirt: C.purpleL, pants: '#5C4A6E' },
    janitor: { skin: '#E8B48C', hair: '#3A2318', hairStyle: 'short', shirt: C.teal, pants: '#3D3550' },
    captain: { skin: '#C68B62', hair: '#fff', hairStyle: 'short', shirt: '#4A5A78', pants: '#3D3550' },
    girl: { skin: '#6E4530', hair: '#1E120C', hairStyle: 'puff', shirt: C.pink, pants: '#4A5A78' },
    mom: { skin: '#8E5A3C', hair: '#2C1810', hairStyle: 'waves', shirt: C.purple, pants: '#3D3550' },
    boss: { skin: '#F1C7A5', hair: '#2C1810', hairStyle: 'bun', shirt: '#4A5A78', pants: '#3D3550' },
    tech: { skin: '#C68B62', hair: '#C27A3A', hairStyle: 'waves', shirt: C.peach, pants: '#5C4A6E' },
    g1: { skin: '#F1C7A5', hair: '#7A4A2A', hairStyle: 'waves', shirt: C.peach, pants: '#5C4A6E' },
    g2: { skin: '#8E5A3C', hair: '#2C1810', hairStyle: 'short', shirt: C.purple, pants: '#3D3550' },
    g3: { skin: '#E8B48C', hair: '#C27A3A', hairStyle: 'bun', shirt: C.pink, pants: '#4A5A78' },
    g4: { skin: '#6E4530', hair: '#1E120C', hairStyle: 'puff', shirt: C.gold, pants: '#3D3550' },
    artist: { skin: '#B07750', hair: '#2C1810', hairStyle: 'puff', shirt: C.purpleL, pants: '#4A5A78' },
  };

  /* ---------------- creatures ---------------- */
  function cat(t, x, y, s = 1, o = {}) {
    const col = o.col || C.peach, dk = o.dark || '#E08E2E', fl = o.flip ? -1 : 1;
    const sw = Math.sin(t * 2.2 + (o.seed || 0)) * 14, b = blink(t, o.seed || 4);
    const ey = 6.5 * (1 - b * 0.9), lx = (o.look || 0) * 4;
    return `<g transform="translate(${F(x)},${F(y - (o.hop || 0))}) scale(${s * fl},${s})">
      <path d="M26,-14 Q78,-8 ${F(66 + sw)},-72" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="0" cy="-44" rx="40" ry="46" fill="${col}"/>
      <ellipse cx="0" cy="-30" rx="22" ry="26" fill="#FFF3E6"/>
      <ellipse cx="-18" cy="-4" rx="14" ry="8" fill="${col}"/><ellipse cx="18" cy="-4" rx="14" ry="8" fill="${col}"/>
      <path d="M-34,-112 L-30,-152 L-6,-126 Z" fill="${col}"/><path d="M34,-112 L30,-152 L6,-126 Z" fill="${col}"/>
      <path d="M-28,-120 L-27,-140 L-14,-126 Z" fill="${C.pinkL}"/><path d="M28,-120 L27,-140 L14,-126 Z" fill="${C.pinkL}"/>
      <circle cx="0" cy="-104" r="36" fill="${col}"/>
      <ellipse cx="${-13 + lx}" cy="-108" rx="4.5" ry="${F(ey)}" fill="${C.dark}"/><ellipse cx="${13 + lx}" cy="-108" rx="4.5" ry="${F(ey)}" fill="${C.dark}"/>
      <path d="M-5,-96 L5,-96 L0,-90 Z" fill="${C.pink}"/>
      <path d="M0,-90 Q-5,-84 -10,-87 M0,-90 Q5,-84 10,-87" stroke="${C.dark}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M-16,-95 L-46,-100 M-16,-91 L-44,-86 M16,-95 L46,-100 M16,-91 L44,-86" stroke="${dk}" stroke-width="2"/>
      ${o.hat ? `<path d="M-16,-134 L6,-196 L24,-128 Z" fill="${C.purple}"/><circle cx="6" cy="-198" r="8" fill="${C.gold}"/><path d="M-10,-150 L18,-146" stroke="${C.gold}" stroke-width="4"/>` : ''}
      ${o.dizzy ? [0, 1, 2].map(i => { const a = t * 4 + i * 2.1; return `<circle cx="${F(Math.cos(a) * 34)}" cy="${F(-160 + Math.sin(a) * 10)}" r="7" fill="${C.gold}"/>`; }).join('') : ''}
    </g>`;
  }

  function dog(t, x, y, s = 1, o = {}) {
    const fl = o.flip ? -1 : 1, b = blink(t, o.seed || 6);
    const wag = o.wag ? Math.sin(t * 16) * 26 : Math.sin(t * 3) * 8;
    const lx = clamp((o.look || 0) * 0.5 + 0.5) * 2 - 1, tilt = o.tilt || 0;
    const body = C.peachL, ear = C.muted;
    return `<g transform="translate(${F(x)},${F(y - (o.hop || 0))}) scale(${s * fl},${s})">
      <g transform="translate(34,-30) rotate(${F(-40 + wag)})"><path d="M0,0 Q30,-10 40,-44" fill="none" stroke="${body}" stroke-width="13" stroke-linecap="round"/></g>
      <ellipse cx="0" cy="-48" rx="44" ry="50" fill="${body}"/>
      <ellipse cx="0" cy="-36" rx="24" ry="28" fill="#FFF3E6"/>
      <ellipse cx="-20" cy="-4" rx="15" ry="9" fill="${body}"/><ellipse cx="20" cy="-4" rx="15" ry="9" fill="${body}"/>
      <g transform="translate(0,-118) rotate(${F(tilt + Math.sin(t * 1.7) * 3)})">
        <circle r="40" fill="${body}"/>
        <ellipse cx="-38" cy="6" rx="14" ry="30" fill="${ear}" transform="rotate(${F(14 + Math.sin(t * 5) * 4)} -38 -16)"/>
        <ellipse cx="38" cy="6" rx="14" ry="30" fill="${ear}" transform="rotate(${F(-14 - Math.sin(t * 5) * 4)} 38 -16)"/>
        <ellipse cx="0" cy="16" rx="22" ry="16" fill="#FFF3E6"/>
        <ellipse cx="0" cy="8" rx="9" ry="6" fill="${C.dark}"/>
        ${o.happy ? `<path d="M-6,26 Q0,42 6,26 Z" fill="${C.pink}"/>` : `<path d="M-7,24 Q0,30 7,24" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>`}
        <ellipse cx="${F(-14 + lx * 4)}" cy="-8" rx="5" ry="${F(7 * (1 - b * 0.9))}" fill="${C.dark}"/>
        <ellipse cx="${F(14 + lx * 4)}" cy="-8" rx="5" ry="${F(7 * (1 - b * 0.9))}" fill="${C.dark}"/>
      </g>
    </g>`;
  }

  function bird(t, x, y, s = 1, o = {}) {
    const col = o.col || C.purple, dk = o.dark || '#5E56B8', fl = o.flip ? -1 : 1, sd = o.seed || 1;
    const flap = o.fly ? Math.sin(t * 24 + sd) * 40 : Math.sin(t * 2 + sd) * 4;
    const b = blink(t, sd + 3);
    return `<g transform="translate(${F(x)},${F(y)}) rotate(${F(o.rot || 0)}) scale(${s * fl},${s})">
      ${o.parrot ? `<path d="M-20,-2 L-62,22 L-58,6 L-70,4 L-24,-8 Z" fill="${C.pink}"/><path d="M-20,2 L-56,30 L-40,4 Z" fill="${C.gold}"/>` : `<path d="M-22,-4 L-46,-16 L-42,6 Z" fill="${dk}"/>`}
      <ellipse cx="0" cy="0" rx="28" ry="21" fill="${col}"/>
      <ellipse cx="6" cy="6" rx="16" ry="12" fill="#fff" opacity=".55"/>
      <g transform="rotate(${F(-10 + flap)} -2 -4)"><ellipse cx="-8" cy="-6" rx="20" ry="11" fill="${dk}"/></g>
      <circle cx="22" cy="-16" r="${o.parrot ? 17 : 15}" fill="${col}"/>
      ${o.parrot ? `<path d="M14,-30 Q18,-48 26,-30 Q30,-46 34,-28" fill="${C.gold}"/>` : ''}
      <ellipse cx="27" cy="-19" rx="3.5" ry="${F(5 * (1 - b * 0.9))}" fill="${C.dark}"/>
      <path d="M35,-19 L${o.parrot ? 50 : 48},-12 L35,-8 Z" fill="${C.gold}"/>
      ${o.fly ? '' : `<path d="M-4,20 L-6,30 M8,20 L8,30" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`}
    </g>`;
  }

  function robot(t, x, y, s = 1, o = {}) {
    const fl = o.flip ? -1 : 1, b = blink(t, 7), bulb = Math.sin(t * 6) > 0 ? C.gold : C.pink;
    const armA = o.armUp ? -60 + Math.sin(t * 2) * 4 : 70 + Math.sin(t * 2.4) * 6;
    const hx = 60 + Math.cos(rad(armA)) * 80, hy = -120 + Math.sin(rad(armA)) * 80;
    const face = o.face === '?' ? `<text x="0" y="-190" font-size="52" font-weight="900" text-anchor="middle" fill="${C.gold}" font-family="DM Sans">?</text>`
      : `<rect x="-26" y="${F(-218 + b * 10)}" width="16" height="${F(22 * (1 - b * 0.85))}" rx="6" fill="${C.teal}"/><rect x="10" y="${F(-218 + b * 10)}" width="16" height="${F(22 * (1 - b * 0.85))}" rx="6" fill="${C.teal}"/>
         <path d="M-16,-188 Q0,${o.sad ? -196 : -178} 16,-188" fill="none" stroke="${C.teal}" stroke-width="5" stroke-linecap="round"/>`;
    return `<g transform="translate(${F(x)},${F(y + Math.sin(t * 3) * 3)}) scale(${s * fl},${s})">
      <rect x="-56" y="-34" width="112" height="34" rx="17" fill="${C.dark}"/>
      <circle cx="-34" cy="-17" r="9" fill="#8a7d76"/><circle cx="0" cy="-17" r="9" fill="#8a7d76"/><circle cx="34" cy="-17" r="9" fill="#8a7d76"/>
      <rect x="-60" y="-150" width="120" height="118" rx="22" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
      <circle cx="0" cy="-92" r="16" fill="${bulb}" opacity=".85"/>
      <path d="M-60,-120 L-92,-70" stroke="${C.purple}" stroke-width="12" stroke-linecap="round"/><circle cx="-92" cy="-70" r="12" fill="${C.purple}"/>
      <path d="M60,-120 L${F(hx)},${F(hy)}" stroke="${C.purple}" stroke-width="12" stroke-linecap="round"/>
      ${o.hold ? `<g transform="translate(${F(hx)},${F(hy)}) scale(${fl},1)">${o.hold}</g>` : ''}
      <circle cx="${F(hx)}" cy="${F(hy)}" r="12" fill="${C.purple}"/>
      <rect x="-56" y="-252" width="112" height="96" rx="26" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="-42" y="-238" width="84" height="68" rx="16" fill="${C.dark}"/>
      ${face}
      <line x1="0" y1="-252" x2="0" y2="-284" stroke="${C.purple}" stroke-width="5"/><circle cx="0" cy="-290" r="10" fill="${bulb}"/>
    </g>`;
  }

  // A candle with eyes and legs. Feet at (x, y). ~210 tall at s = 1.
  function candleGuy(t, x, y, s = 1, o = {}) {
    const col = o.col || C.teal, dk = o.dark || C.tealD, fl = o.flip ? -1 : 1, sd = o.seed || 2;
    const sw = o.walking ? Math.sin(t * 10 + sd) * 24 : 0;
    const bob = o.walking ? -Math.abs(Math.sin(t * 10 + sd)) * 6 : Math.sin(t * 2.4 + sd) * 2;
    const b = blink(t, sd);
    const leg = (lx, a) => { const ex = lx + Math.sin(rad(a)) * 52, ey = -52 + Math.cos(rad(a)) * 52; return `<path d="M${lx},-52 L${F(ex)},${F(ey)}" stroke="${C.dark}" stroke-width="9" stroke-linecap="round"/><ellipse cx="${F(ex + 6)}" cy="${F(ey + 2)}" rx="13" ry="7" fill="${C.dark}"/>`; };
    const lean = o.lean || 0;
    const mouth = o.mood === 'sad' ? `<path d="M-12,-98 Q0,-108 12,-98" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`
      : o.talk ? `<ellipse cx="0" cy="-100" rx="9" ry="${F(3 + Math.abs(Math.sin(t * 11)) * 6)}" fill="#6B2A2A"/>`
        : `<path d="M-12,-104 Q0,-92 12,-104" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`;
    const armR = o.armR ?? (60 + sw * 0.6), armL = o.armL ?? (120 - sw * 0.6);
    const ar = (sx, a) => { const hx = sx + Math.cos(rad(a)) * 50, hy = -128 + Math.sin(rad(a)) * 50; return { d: `<path d="M${sx},-128 L${F(hx)},${F(hy)}" stroke="${dk}" stroke-width="9" stroke-linecap="round"/><circle cx="${F(hx)}" cy="${F(hy)}" r="8" fill="${dk}"/>`, hx, hy }; };
    const R = ar(30, armR), L = ar(-30, armL);
    return `<g transform="translate(${F(x)},${F(y)}) rotate(${F(lean)}) scale(${s * fl},${s})"><g transform="translate(0,${F(bob)})">
      ${leg(-14, -sw)}${leg(14, sw)}
      ${L.d}
      <line x1="0" y1="-178" x2="0" y2="${o.tallWick ? -250 : -214}" stroke="${dk}" stroke-width="8" stroke-linecap="round"/>
      <rect x="-32" y="-180" width="64" height="130" rx="12" fill="${col}"/>
      <rect x="-24" y="-172" width="12" height="80" rx="6" fill="#fff" opacity=".3"/>
      <ellipse cx="-12" cy="-130" rx="9" ry="${F(11 * (1 - b * 0.9))}" fill="#fff"/><ellipse cx="12" cy="-130" rx="9" ry="${F(11 * (1 - b * 0.9))}" fill="#fff"/>
      <circle cx="-10" cy="-128" r="${b > 0.5 ? 0 : 5}" fill="${C.dark}"/><circle cx="14" cy="-128" r="${b > 0.5 ? 0 : 5}" fill="${C.dark}"/>
      ${mouth}
      ${R.d}
      ${o.hold ? `<g transform="translate(${F(R.hx)},${F(R.hy)})">${o.hold}</g>` : ''}
    </g></g>`;
  }

  // A level line with a face and legs (Lesson 23). Feet at (x, y).
  function lineGuy(t, x, y, s = 1, o = {}) {
    const col = o.col || C.teal, fl = o.flip ? -1 : 1, sd = o.seed || 3;
    const sw = o.walking ? Math.sin(t * 10 + sd) * 22 : 0;
    const bob = o.walking ? -Math.abs(Math.sin(t * 10 + sd)) * 5 : Math.sin(t * 2.2 + sd) * 2;
    const b = blink(t, sd);
    const leg = (lx, a) => { const ex = lx + Math.sin(rad(a)) * 58, ey = -62 + Math.cos(rad(a)) * 58; return `<path d="M${lx},-62 L${F(ex)},${F(ey)}" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/><ellipse cx="${F(ex + 5)}" cy="${F(ey + 2)}" rx="12" ry="6" fill="${C.dark}"/>`; };
    const mouth = o.mood === 'sad' ? `<path d="M-10,-70 Q0,-78 10,-70" fill="none" stroke="${C.dark}" stroke-width="3.5" stroke-linecap="round"/>`
      : `<path d="M-10,-76 Q0,-66 10,-76" fill="none" stroke="${C.dark}" stroke-width="3.5" stroke-linecap="round"/>`;
    return `<g transform="translate(${F(x)},${F(y)}) scale(${s * fl},${s})"><g transform="translate(0,${F(bob)})">
      ${leg(-44, -sw)}${leg(44, sw)}
      <path d="M-112,-82 L-134,${F(-110 + sw * 0.5)} M112,-82 L134,${F(-110 - sw * 0.5)}" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
      <rect x="-118" y="-100" width="236" height="40" rx="20" fill="${col}"/>
      <rect x="-104" y="-94" width="80" height="8" rx="4" fill="#fff" opacity=".35"/>
      <ellipse cx="-16" cy="-82" rx="8" ry="${F(10 * (1 - b * 0.9))}" fill="#fff"/><ellipse cx="16" cy="-82" rx="8" ry="${F(10 * (1 - b * 0.9))}" fill="#fff"/>
      <circle cx="-14" cy="-80" r="${b > 0.5 ? 0 : 4.5}" fill="${C.dark}"/><circle cx="18" cy="-80" r="${b > 0.5 ? 0 : 4.5}" fill="${C.dark}"/>
      ${mouth}
    </g></g>`;
  }

  function bear(t, x, y, s = 1, o = {}) {
    const b = blink(t, 9), c1 = '#C9A27A', c2 = '#E8C9A8', hop = o.hop || 0;
    return `<g transform="translate(${F(x)},${F(y - hop)}) scale(${s}) rotate(${F(Math.sin(t * 1.6) * 3)})">
      <ellipse cx="-30" cy="-10" rx="22" ry="14" fill="${c1}"/><ellipse cx="30" cy="-10" rx="22" ry="14" fill="${c1}"/>
      <ellipse cx="0" cy="-56" rx="48" ry="52" fill="${c1}"/><ellipse cx="0" cy="-46" rx="28" ry="30" fill="${c2}"/>
      <circle cx="-34" cy="-160" r="18" fill="${c1}"/><circle cx="34" cy="-160" r="18" fill="${c1}"/>
      <circle cx="-34" cy="-160" r="9" fill="${c2}"/><circle cx="34" cy="-160" r="9" fill="${c2}"/>
      <circle cx="0" cy="-126" r="44" fill="${c1}"/>
      <ellipse cx="0" cy="-110" rx="20" ry="15" fill="${c2}"/><ellipse cx="0" cy="-116" rx="8" ry="6" fill="${C.dark}"/>
      <ellipse cx="-16" cy="-134" rx="5" ry="${F(7 * (1 - b * 0.9))}" fill="${C.dark}"/><ellipse cx="16" cy="-134" rx="5" ry="${F(7 * (1 - b * 0.9))}" fill="${C.dark}"/>
      ${o.shock ? `<ellipse cx="0" cy="-100" rx="6" ry="8" fill="#6B2A2A"/>` : `<path d="M-7,-103 Q0,-97 7,-103" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>`}
      <path d="M-14,-170 L0,-158 L14,-170 L0,-182 Z" fill="${C.pink}"/>
    </g>`;
  }

  // The "area" with a face (Lesson 24). Feet at (x, y).
  function zoneBlob(t, x, y, s = 1, o = {}) {
    const b = blink(t, 5), sq = 1 + Math.sin(t * 3) * 0.02;
    return `<g transform="translate(${F(x)},${F(y)}) scale(${F(s * sq)},${F(s / sq)})">
      <path d="M-50,-40 L-56,0 M50,-40 L56,0" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="-60" cy="2" rx="18" ry="8" fill="${C.dark}"/><ellipse cx="60" cy="2" rx="18" ry="8" fill="${C.dark}"/>
      <path d="M-160,-150 L-200,${F(-190 + Math.sin(t * 4) * 8)} M160,-150 L200,${F(-190 - Math.sin(t * 4) * 8)}" stroke="${C.tealD}" stroke-width="10" stroke-linecap="round"/>
      <rect x="-165" y="-250" width="330" height="214" rx="46" fill="${C.tealL}" stroke="${C.tealD}" stroke-width="6"/>
      <rect x="-165" y="-250" width="330" height="214" rx="46" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="14 12" opacity=".7" transform="translate(0,0) scale(.92) translate(0,-12)"/>
      <ellipse cx="-34" cy="-200" rx="11" ry="${F(14 * (1 - b * 0.9))}" fill="${C.dark}"/><ellipse cx="34" cy="-200" rx="11" ry="${F(14 * (1 - b * 0.9))}" fill="${C.dark}"/>
      <ellipse cx="-68" cy="-180" rx="14" ry="8" fill="${C.pink}" opacity=".5"/><ellipse cx="68" cy="-180" rx="14" ry="8" fill="${C.pink}" opacity=".5"/>
      ${o.puzzled ? `<path d="M-14,-176 Q0,-184 14,-176" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`
        : `<path d="M-18,-182 Q0,-164 18,-182" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`}
    </g>`;
  }

  // Ball and balloon drawn at a centre point.
  const beachBall = (x, y, r, spin, sx = 1, sy = 1) => `<g transform="translate(${F(x)},${F(y)}) scale(${F(sx)},${F(sy)}) rotate(${F(spin)})">
      <circle r="${r}" fill="${C.peach}"/><path d="M${-r},0 A${r},${r} 0 0,1 ${r},0 Z" fill="${C.pink}"/>
      <path d="M0,${-r} A${r * 0.45},${r} 0 0,0 0,${r}" fill="${C.teal}"/><circle r="${r * 0.22}" fill="#fff"/></g>`;
  const balloon = (t, x, y, col = C.pink) => `<g transform="translate(${F(x)},${F(y)})">
      <path d="M0,52 Q${F(10 + Math.sin(t * 5) * 10)},90 0,120 Q${F(-10 + Math.sin(t * 5 + 1) * 10)},150 4,180" fill="none" stroke="${C.muted}" stroke-width="3"/>
      <ellipse rx="42" ry="52" fill="${col}"/><ellipse cx="-14" cy="-18" rx="10" ry="16" fill="#fff" opacity=".45"/>
      <path d="M-8,52 L8,52 L0,60 Z" fill="${col}"/></g>`;

  // Hop between turning points: accelerate into contacts (odd points), decelerate away.
  function hopPath(pts, f) {
    const n = pts.length - 1, ff = clamp(f) * n, j = Math.min(n - 1, Math.floor(ff)), g = ff - j;
    const [x0, y0] = pts[j], [x1, y1] = pts[j + 1];
    const e = j % 2 === 0 ? g * g : 1 - (1 - g) * (1 - g);
    return { x: lerp(x0, x1, g), y: lerp(y0, y1, e), j, g };
  }
  const trail = (pts, f, col, w = 6, dash = '14 12', op = 0.6) => {
    if (f <= 0) return '';
    const out = [];
    for (let q = 0; q <= f + 1e-6; q += 0.004) { const p = hopPath(pts, Math.min(q, f)); out.push(`${F(p.x)},${F(p.y)}`); }
    return `<polyline points="${out.join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
  };
  // Polyline drawn progressively.
  function drawLine(pts, k) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let d = lens.reduce((a, b) => a + b, 0) * clamp(k);
    const out = [pts[0]];
    for (let i = 0; i < lens.length; i++) {
      if (d >= lens[i]) { out.push(pts[i + 1]); d -= lens[i]; continue; }
      const f = d / lens[i]; out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); break;
    }
    return { pts: out, head: out[out.length - 1], d: out.map(p => `${F(p[0])},${F(p[1])}`).join(' ') };
  }

  // A small candle that forms over [at, at+dur]. Unit prices map through Y.
  function miniCandle(t, c, at, dur, x, Y, w) {
    const f = clamp((t - at) / dur);
    if (f <= 0) return '';
    let cur, hi, lo;
    if (c.wick) {
      const ext = c.wick === 'up' ? c.h : c.l;
      cur = f < 0.55 ? lerp(c.o, ext, f / 0.55) : lerp(ext, c.c, (f - 0.55) / 0.45);
      hi = c.wick === 'up' ? (f < 0.55 ? Math.max(c.o, cur) : c.h) : lerp(Math.max(c.o, c.c), c.h, f);
      lo = c.wick === 'down' ? (f < 0.55 ? Math.min(c.o, cur) : c.l) : Math.min(c.o, cur, lerp(Math.min(c.o, c.c), c.l, f));
    } else {
      cur = lerp(c.o, c.c, ease(f)); hi = lerp(Math.max(c.o, c.c), c.h, f); lo = lerp(Math.min(c.o, c.c), c.l, f);
    }
    const up = cur >= c.o, col = up ? C.teal : C.pink;
    const top = Y(Math.max(c.o, cur)), bot = Y(Math.min(c.o, cur));
    return `<line x1="${x}" x2="${x}" y1="${F(Y(hi))}" y2="${F(Y(lo))}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
      <rect x="${x - w / 2}" y="${F(top)}" width="${w}" height="${F(Math.max(4, bot - top))}" rx="3" fill="${col}"/>`;
  }

  const panel = (x0, y0, x1, y1, k = 1, fill = '#fff') => k <= 0 ? '' : about((x0 + x1) / 2, (y0 + y1) / 2, k, `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="28" fill="${fill}" stroke="#F1E7E1" stroke-width="3"/>`);

  /* ---------------- text layer ---------------- */
  const head = s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;
  const TYPES = ['s6-bounce-room', 's6-signpost', 's6-bird-wire', 's6-easels', 's6-bouncer', 's6-moving-in', 's6-weigh-scale',
    's6-key-ring', 's6-lighthouse', 's6-growth-chart', 's6-job-interview', 's6-chart-vacuum', 's6-name-party', 's6-sticker-storm'];
  const BUILD = Object.fromEntries(TYPES.map(k => [k, head]));

  const LIVE = {
    /* ================= Lesson 18 ================= */
    // A ball keeps bouncing off the same floor (support); a balloon keeps bumping the same ceiling (resistance).
    's6-bounce-room': (s, t) => {
      const u = t - s.start;
      const X0 = 300, X1 = 1620, Y0 = 390, Y1 = 1010, FL = 905, CE = 440;
      const k = pop(t, s.start + 0.1, 0.8);
      if (k <= 0) return '';
      let room = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="30" fill="#FFF6F0"/>`;
      for (let x = X0 + 40; x < X1 - 40; x += 92) room += `<rect x="${x}" y="${CE}" width="46" height="${FL - CE}" fill="${C.pinkP}" opacity=".6"/>`;
      room += `<path d="M${X0},${CE} L${X0},${Y0 + 30} Q${X0},${Y0} ${X0 + 30},${Y0} L${X1 - 30},${Y0} Q${X1},${Y0} ${X1},${Y0 + 30} L${X1},${CE} Z" fill="#F3E3D7"/>
        <path d="M${X0},${FL} L${X1},${FL} L${X1},${Y1 - 30} Q${X1},${Y1} ${X1 - 30},${Y1} L${X0 + 30},${Y1} Q${X0},${Y1} ${X0},${Y1 - 30} Z" fill="#EADBCF"/>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${X0 + 100 + i * 190}" y1="${FL + 8}" x2="${X0 + 60 + i * 190}" y2="${Y1 - 8}" stroke="#DCCBBE" stroke-width="3"/>`).join('')}`;
      // Window with a drifting cloud.
      const cx = 1300 + ((t * 14) % 220) - 20;
      room += `<rect x="1290" y="530" width="200" height="130" rx="12" fill="#E8F8F6" stroke="#fff" stroke-width="10"/>
        <g opacity=".9"><circle cx="${F(cx)}" cy="580" r="18" fill="#fff"/><circle cx="${F(cx + 20)}" cy="572" r="22" fill="#fff"/><circle cx="${F(cx + 42)}" cy="582" r="16" fill="#fff"/></g>
        <rect x="1290" y="530" width="200" height="130" rx="12" fill="none" stroke="#fff" stroke-width="10"/>
        <line x1="1390" y1="530" x2="1390" y2="660" stroke="#fff" stroke-width="8"/>
        <path d="M1280,522 L1330,522 Q1312,600 1336,670 L1280,670 Z" fill="${C.pinkL}"/><path d="M1500,522 L1450,522 Q1468,600 1444,670 L1500,670 Z" fill="${C.pinkL}"/>
        <rect x="1270" y="514" width="240" height="12" rx="6" fill="${C.pink}"/>`;
      // Support glow, then resistance glow.
      const sg = ease(seg(u, 10.4, 11.4)), rg = ease(seg(u, 18.2, 19.2)), pl = 0.8 + 0.2 * Math.sin(t * 3);
      if (sg > 0) room += `<rect x="${X0 + 6}" y="${FL - 48}" width="${(X1 - X0 - 12) * sg}" height="54" fill="${C.teal}" opacity="${0.3 * pl}"/><line x1="${X0 + 6}" x2="${X0 + 6 + (X1 - X0 - 12) * sg}" y1="${FL - 48}" y2="${FL - 48}" stroke="${C.tealD}" stroke-width="4" stroke-dasharray="14 10"/>`;
      if (rg > 0) room += `<rect x="${X0 + 6}" y="${CE - 4}" width="${(X1 - X0 - 12) * rg}" height="54" fill="${C.pink}" opacity="${0.28 * pl}"/><line x1="${X0 + 6}" x2="${X0 + 6 + (X1 - X0 - 12) * rg}" y1="${CE + 50}" y2="${CE + 50}" stroke="${C.pink}" stroke-width="4" stroke-dasharray="14 10"/>`;
      room += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="30" fill="none" stroke="${C.dark}" stroke-width="8"/>`;
      let out = about(960, 700, k, room);

      // The ball: three bounces off the same floor.
      const BP = [[360, 470], [540, 869], [680, 610], [830, 866], [985, 585], [1135, 871], [1290, 520]];
      const bf = seg(u, 1.0, 9.4), bfade = 1 - seg(u, 9.4, 9.9);
      const trailOp = u > 16 ? 0.25 : 0.55;
      out += trail(BP, bf, C.tealD, 6, '14 12', trailOp);
      const contacts = [1, 3, 5].map(c => 1.0 + c / 6 * 8.4);
      let target = null;
      if (bf > 0 && bfade > 0) {
        const p = hopPath(BP, bf);
        const near = contacts.find(tc => Math.abs(u - tc) < 0.13);
        const sq = near != null ? 1 - (0.13 - Math.abs(u - near)) / 0.13 * 0.22 : 1;
        out += `<g opacity="${bfade}">${beachBall(p.x, p.y + (1 - sq) * 36, 36, p.x * 0.9, 2 - sq, sq)}</g>`;
        target = [p.x, p.y];
      }
      contacts.forEach((tc, i) => {
        const q = pop(u, tc, 0.4), fade = 1 - seg(u, tc + 1.6, tc + 2.1);
        if (q <= 0 || fade <= 0) return;
        const x = BP[1 + i * 2][0];
        out += `<g opacity="${fade}">${pill(x, FL - 130, String(i + 1), C.tealD, q, 34)}</g>` + A.sparkle(x, FL - 20, s.start + tc, t, C.teal);
      });
      if (sg > 0) out += pill(560, FL + 50, 'SUPPORT AREA', C.tealD, pop(u, 10.6, 0.6), 28);

      // The balloon: three bumps against the same ceiling.
      const BL = [[470, 860], [600, 492], [730, 650], [870, 494], [1010, 660], [1150, 492], [1250, 610]];
      const lf = seg(u, 16.6, 22.2);
      if (lf > 0) {
        out += trail(BL, lf, C.pink, 6, '14 12', 0.55);
        const p = hopPath(BL, lf);
        out += balloon(t, p.x, p.y);
        target = [p.x, p.y];
        [1, 3, 5].forEach((c, i) => {
          const tc = 16.6 + c / 6 * 5.6, q = pop(u, tc, 0.4), fade = 1 - seg(u, tc + 1.6, tc + 2.1);
          if (q > 0 && fade > 0) out += `<g opacity="${fade}">${pill(BL[c][0], CE + 120, String(i + 1), C.pink, q, 34)}</g>`;
        });
      }
      if (rg > 0) out += pill(1460, 474, 'RESISTANCE AREA', C.pink, pop(u, 18.4, 0.6), 26);
      if (u > 22.6) out += pill(960, 735, 'AREA OF INTEREST ✓', C.purple, pop(u, 22.6, 0.6), 34) + A.sparkle(960, 735, s.start + 23.0, t, C.gold);

      // Watchers: a kid who counts and a dog whose head follows the ball.
      const kx = 1410, ky = 985, ks = 0.8;
      const counting = [...contacts, 16.6 + 1 / 6 * 5.6, 16.6 + 3 / 6 * 5.6, 16.6 + 5 / 6 * 5.6].some(tc => u > tc && u < tc + 1.1);
      const arm = target ? aim(kx, ky, ks, true, target[0], target[1]) : 100;
      out += P(t, { x: kx, y: ky, scale: ks * k, look: LK.kid, flip: true, seed: 3, talk: counting, frontArm: target ? { a1: arm, a2: arm } : { a1: 100, a2: 95 } });
      const look = target ? clamp((target[0] - 1560) / -800) * -1 : 0;
      out += dog(t, 1550, 992, 0.78 * k, { look, wag: counting, happy: counting, tilt: target ? -10 : 0, flip: true });
      if (u > 6.4 && u < 9.6) out += A.bubble(1270, 700, 'Same floor!', { size: 28, weight: 700, tail: 'right', op: clamp((u - 6.4) / 0.3) * (1 - seg(u, 9.2, 9.6)), color: C.tealD });
      return out;
    },

    // A hiker at a trail sign: the sign is information; the forks ahead are unknown.
    's6-signpost': (s, t) => {
      const u = t - s.start;
      let out = `<path d="M0,880 Q480,820 960,870 T1920,850 L1920,1080 L0,1080 Z" fill="#E8F8F6"/>
        <path d="M0,880 Q480,820 960,870 T1920,850" fill="none" stroke="${C.tealL}" stroke-width="10"/>`;
      // Distant hills and sun.
      out += `<circle cx="1300" cy="470" r="${F(54 + Math.sin(t * 1.5) * 3)}" fill="${C.peachL}" opacity=".8"/>
        <path d="M1100,866 Q1300,700 1500,860 Z" fill="${C.tealL}" opacity=".45"/><path d="M1380,858 Q1620,660 1880,852 Z" fill="${C.tealL}" opacity=".35"/>`;
      // Trail into the sign.
      out += `<path d="M-20,1000 Q400,960 900,930" fill="none" stroke="#EADFD8" stroke-width="58" stroke-linecap="round"/>`;
      // Forks ahead: up (bounce?) and down (break?).
      const fk = ease(seg(u, 8.4, 10.2));
      if (fk > 0) {
        const up = 'M900,930 Q1250,900 1420,720 T1820,560', dn = 'M900,930 Q1250,950 1440,1000 T1840,1060';
        out += `<path d="${up}" fill="none" stroke="#EADFD8" stroke-width="44" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - fk}"/>
          <path d="${dn}" fill="none" stroke="#EADFD8" stroke-width="44" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - fk}"/>
          <path d="${up}" fill="none" stroke="${C.tealD}" stroke-width="6" stroke-dasharray="16 14" opacity="${fk}"/>
          <path d="${dn}" fill="none" stroke="${C.pink}" stroke-width="6" stroke-dasharray="16 14" opacity="${fk}"/>`;
        out += qmark(1700, 560, t, s.start + 9.4, C.tealD, 96) + qmark(1560, 950, t, s.start + 9.8, C.pink, 96);
        out += pill(1520, 640, 'bounce?', C.tealD, pop(u, 9.6, 0.5), 26) + pill(1300, 1010, 'break?', C.pink, pop(u, 10.0, 0.5), 26);
      }
      // The sign: flips from SUPPORT to RESISTANCE.
      const sp = pop(u, 3.2, 0.7);
      if (sp > 0) {
        const fl = u < 11.8 ? 1 : Math.cos(Math.PI * seg(u, 11.8, 12.6));
        const res = u > 12.2, w = Math.abs(fl);
        const icon = res
          ? `<rect x="-120" y="22" width="240" height="18" rx="6" fill="${C.pinkL}"/><polyline points="-110,78 -70,30 -40,66 0,32 30,70 70,30 100,64" fill="none" stroke="${C.pink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`
          : `<rect x="-120" y="62" width="240" height="18" rx="6" fill="${C.tealL}"/><polyline points="-110,24 -70,70 -40,36 0,70 30,32 70,70 100,30" fill="none" stroke="${C.tealD}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
        out += about(960, 900, sp, `<rect x="948" y="610" width="24" height="320" rx="8" fill="#9B6A45"/>
          <g transform="translate(960,610) scale(${F(w)},1)">
            <rect x="-210" y="-100" width="420" height="210" rx="18" fill="${C.peachL}" stroke="#C98A1F" stroke-width="6"/>
            <text y="-40" font-size="38" font-weight="900" text-anchor="middle" fill="${res ? '#C2475F' : '#2F8A7F'}" font-family="Playfair Display">${res ? 'RESISTANCE' : 'SUPPORT'} AREA</text>
            ${icon}
          </g>`);
      }
      // Parrot on top of the sign.
      const pp = seg(u, 3.6, 4.4);
      if (pp > 0) {
        const px = lerp(1260, 1110, ease(pp)), py = lerp(430, 495, ease(pp)) - Math.sin(pp * Math.PI) * 50;
        out += bird(t, px, py, 1.3, { col: C.teal, dark: C.tealD, parrot: true, fly: pp < 1, flip: true, seed: 4 });
        if (u > 9.0 && u < 15) out += A.bubble(1290, 430, 'Not a promise!', { size: 28, weight: 700, color: '#C2475F', op: clamp((u - 9) / 0.3) * (1 - seg(u, 14.6, 15)), tail: 'left' });
      }
      // Hiker walks in, reads, then takes out a notebook.
      const w = walkX(u, 0.2, 3.2, 120, 740);
      const hy = lerp(990, 940, (w.x - 120) / 620) + 0;
      const notebook = `<g transform="rotate(-8)"><rect x="-26" y="-60" width="52" height="64" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="4"/><rect x="-16" y="-46" width="32" height="5" rx="2" fill="${C.purpleL}"/><rect x="-16" y="-34" width="24" height="5" rx="2" fill="${C.purpleL}"/><rect x="-16" y="-22" width="28" height="5" rx="2" fill="${C.purpleL}"/></g>`;
      const stick = `<rect x="-5" y="-40" width="10" height="150" rx="5" fill="#9B6A45"/>`;
      const reading = u > 15;
      const pack = `<g transform="translate(${F(w.x - 50)},${F(hy - 240)})"><rect x="-30" y="0" width="60" height="100" rx="18" fill="${C.peach}"/><rect x="-18" y="40" width="36" height="22" rx="6" fill="${C.peachL}"/></g>`;
      out += pack + P(t, { x: w.x, y: hy, scale: 0.88, look: LK.hiker, walking: w.walking, seed: 5, talk: false,
        frontArm: reading ? { a1: 40, a2: -40 } : u > 3.4 && u < 8 ? { a1: -40, a2: -60 } : { a1: 80, a2: 90 }, hold: reading ? notebook : u > 3.4 && u < 8 ? '' : stick });
      // Payoff pills.
      out += pill(400, 560, 'information ✓', C.tealD, pop(u, 15.0, 0.6), 30);
      const pk = pop(u, 17.8, 0.6);
      if (pk > 0) out += pill(400, 650, 'permission to enter', C.pink, pk, 30) + cross(620, 650, pop(u, 18.4, 0.4), 28, C.dark);
      if (u > 18.6) out += A.sparkle(420, 560, s.start + 18.6, t, C.teal);
      return out;
    },

    /* ================= Lesson 19 ================= */
    // Birds turn a little above and below an exact wire; a zone catches every turn.
    's6-bird-wire': (s, t) => {
      const u = t - s.start, WY = 690;
      let out = '';
      // Poles and wire.
      const pk = pop(u, 0.1, 0.7);
      const wireOp = u > 17.4 ? 0.35 : 1;
      out += about(960, 1000, pk, `
        ${[330, 1590].map(x => `<rect x="${x - 12}" y="520" width="24" height="490" rx="8" fill="#9B6A45"/><rect x="${x - 60}" y="560" width="120" height="16" rx="6" fill="#9B6A45"/>
          <circle cx="${x - 44}" cy="552" r="9" fill="${C.purpleL}"/><circle cx="${x + 44}" cy="552" r="9" fill="${C.purpleL}"/>`).join('')}
        <path d="M330,${WY} Q960,${WY + 6} 1590,${WY}" fill="none" stroke="${C.dark}" stroke-width="6" opacity="${wireOp}"/>`);
      out += `<rect x="0" y="1000" width="1920" height="80" fill="#E8F8F6"/><rect x="0" y="1000" width="1920" height="6" fill="${C.tealL}"/>`;
      out += pill(1440, WY + 56, 'EXACT LINE · 19,980', C.dark, pop(u, 1.0, 0.6) * (u > 17.4 ? 0.0001 + (1 - seg(u, 17.4, 17.8)) : 1), 24);
      // Zone band (after the girl arrives).
      const zk = ease(seg(u, 17.4, 18.8));
      if (zk > 0) {
        const zx1 = 1560, zx0 = lerp(1560, 360, zk);
        out += `<rect x="${F(zx0)}" y="${WY - 44}" width="${F(zx1 - zx0)}" height="88" rx="14" fill="${C.teal}" opacity=".26" stroke="${C.tealD}" stroke-width="4" stroke-dasharray="16 10"/>`;
      }
      // Five birds swoop and turn near the wire.
      const offs = [-34, 28, -18, 38, -10], xs = [560, 760, 960, 1160, 1360], cols = [C.purple, C.peach, C.pink, C.tealD, C.purple];
      xs.forEach((cx, i) => {
        const at = 4.4 + i * 1.0, f = seg(u, at, at + 1.9);
        if (f <= 0) return;
        const ty = WY + offs[i];
        const pos = q => [lerp(cx - 230, cx + 230, q), ty - (ty - 420) * Math.pow(2 * q - 1, 2)];
        const pts = [];
        for (let q = 0; q <= f + 1e-6; q += 0.02) pts.push(pos(Math.min(q, f)).map(F).join(','));
        out += `<polyline points="${pts.join(' ')}" fill="none" stroke="${cols[i]}" stroke-width="4" stroke-dasharray="10 9" opacity=".55"/>`;
        if (f >= 0.5) {
          const glow = zk > 0.9 ? 1 : 0;
          out += `<circle cx="${cx}" cy="${ty}" r="${glow ? 15 : 13}" fill="${glow ? C.tealD : C.peach}" stroke="#fff" stroke-width="4"/>`;
        }
        if (f < 1) {
          const [bx, by] = pos(f), [nx, ny] = pos(Math.min(1, f + 0.02));
          out += bird(t, bx, by, 1.6, { col: cols[i], dark: C.dark, fly: true, seed: i + 1, rot: deg(Math.atan2(ny - by, nx - bx)) * 0.6 });
        }
      });
      // Birds that finished settle on the left pole's crossbar.
      [0, 1, 2, 3, 4].forEach(i => {
        const done = 4.4 + i * 1.0 + 1.9;
        const q = pop(u, done + 0.2, 0.4);
        if (q > 0 && u < 26) out += about(1520 + (i % 3) * 36 - 36, 548, q, bird(t, 1520 + (i % 3) * 44 - 44 + (i > 2 ? 22 : 0), 534 - (i > 2 ? 40 : 0), 0.75, { col: cols[i], dark: C.dark, seed: i + 2, flip: i % 2 === 1 }));
      });
      if (u > 12.4) out += pill(960, 830, 'same small area', C.peach, pop(u, 12.4, 0.6), 28);
      // A grump with a ruler, and the girl who brings the zone.
      const missing = u > 4.8 && u < 12;
      const ruler = `<g transform="rotate(-20)"><rect x="-8" y="-110" width="18" height="120" rx="4" fill="${C.gold}"/>${[0, 1, 2, 3, 4, 5].map(i => `<line x1="-8" x2="0" y1="${-100 + i * 18}" y2="${-100 + i * 18}" stroke="#C98A1F" stroke-width="3"/>`).join('')}</g>`;
      out += P(t, { x: 180, y: 1000, scale: 0.92, look: LK.grump, seed: 2, mood: u > 8.6 && u < 16 ? 'sad' : undefined, talk: missing && Math.sin(u * 3) > 0, frontArm: { a1: -50, a2: -70 }, hold: ruler });
      if (missing) out += A.bubble(250, 640, 'Missed!', { size: 30, weight: 900, color: '#C2475F', fill: C.pinkP, stroke: C.pinkL, op: clamp((u - 4.8) / 0.3) * (1 - seg(u, 11.6, 12)) });
      const g = walkX(u, 15.8, 17.2, 2040, 1750);
      if (u > 15.8) {
        const flag = `<g><rect x="-4" y="-120" width="8" height="130" rx="4" fill="${C.dark}"/><path d="M4,-120 Q${F(40 + Math.sin(t * 6) * 6)},-130 70,-112 L70,-80 Q40,-92 4,-84 Z" fill="${C.teal}"/></g>`;
        out += P(t, { x: g.x, y: 1000, scale: 0.92, look: LK.zoe, flip: true, walking: g.walking, seed: 6, talk: u > 19.8 && u < 25.5, frontArm: { a1: -60, a2: -80 }, hold: flag });
      }
      if (zk >= 1) out += pill(1220, WY + 84, 'ZONE ✓', C.tealD, pop(u, 18.8, 0.6), 30) + A.sparkle(960, WY, s.start + 18.8, t, C.teal);
      if (u > 20) out += pill(640, 930, 'line = exact price', C.dark, pop(u, 20.0, 0.6), 28) + pill(1280, 930, 'zone = reaction area', C.tealD, pop(u, 22.4, 0.6), 28);
      return out;
    },

    // Three easels: a line (exact reference), a tight zone, and a giant mystery box.
    's6-easels': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="990" width="1920" height="90" fill="#F6EDE6"/><rect x="0" y="990" width="1920" height="4" fill="#EADFD8"/>`;
      const E = [{ x: 470, at: 0.3, lab: 'LINE', col: C.purple }, { x: 960, at: 0.6, lab: 'TIGHT ZONE', col: C.tealD }, { x: 1450, at: 0.9, lab: 'GIANT BOX', col: C.pink }];
      const BW = 380, BH = 270, BY = 430;
      const lows = [[0, .82], [.18, .26], [.32, .62], [.5, .22], [.64, .6], [.82, .28], [1, .7]];
      const rise = [[0, .15], [.22, .5], [.36, .34], [.6, .72], [.74, .56], [.9, .78], [1, .9]];
      E.forEach((e, i) => {
        const k = pop(u, e.at, 0.7);
        if (k <= 0) return;
        const bx = e.x - BW / 2, X = q => bx + 24 + q * (BW - 48), Y = v => BY + BH - 24 - v * (BH - 48);
        const pts = (i === 0 ? rise : lows);
        const dk = ease(seg(u, e.at + 0.4, e.at + 1.6));
        const dl = drawLine(pts.map(([a, b]) => [X(a), Y(b)]), dk);
        let g = `<path d="M${e.x - 120},${BY + BH} L${e.x - 160},990 M${e.x + 120},${BY + BH} L${e.x + 160},990 M${e.x},${BY + BH} L${e.x},970" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
          <rect x="${bx}" y="${BY}" width="${BW}" height="${BH}" rx="18" fill="#fff" stroke="#9B6A45" stroke-width="8"/>
          <rect x="${bx - 14}" y="${BY + BH - 6}" width="${BW + 28}" height="16" rx="6" fill="#9B6A45"/>`;
        // Tool overlay.
        if (i === 0) g += `<line x1="${bx + 16}" x2="${bx + BW - 16}" y1="${Y(0.72)}" y2="${Y(0.72)}" stroke="${C.purple}" stroke-width="5"/>`;
        if (i === 1) g += `<rect x="${bx + 16}" y="${Y(0.31)}" width="${BW - 32}" height="${Y(0.18) - Y(0.31)}" rx="6" fill="${C.teal}" opacity=".3" stroke="${C.tealD}" stroke-width="3" stroke-dasharray="10 8"/>`;
        if (i === 2) g += `<rect x="${bx + 16}" y="${Y(0.92)}" width="${BW - 32}" height="${Y(0.06) - Y(0.92)}" rx="6" fill="${C.purpleL}" opacity=".45" stroke="${C.purple}" stroke-width="3" stroke-dasharray="10 8"/>`;
        g += `<polyline points="${dl.d}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
        if (i === 0 && dk >= 1) g += `<rect x="${X(1) - 12}" y="${Y(0.9)}" width="20" height="${Y(0.76) - Y(0.9)}" rx="3" fill="${C.teal}"/>`;
        if (i === 1 && dk >= 1) g += [1, 3, 5].map(j => `<circle cx="${X(lows[j][0])}" cy="${Y(lows[j][1])}" r="9" fill="${C.tealD}" stroke="#fff" stroke-width="3"/>`).join('');
        out += about(e.x, 990, k, g);
        out += pill(e.x, 760, e.lab, e.col, pop(u, e.at + 0.5, 0.5), 26);
      });
      // The giant box springs a jack-in-the-box.
      const jk = ease(seg(u, 15.6, 16.2));
      if (jk > 0) {
        const jy = BY + 120 - jk * 150 + Math.sin(t * 9) * 6 * jk;
        out += `<path d="M1450,${BY + 150} ${[0, 1, 2, 3, 4, 5].map(i => `L${1450 + (i % 2 ? 22 : -22)},${F(lerp(BY + 150, jy + 40, (i + 1) / 6))}`).join(' ')}" fill="none" stroke="${C.muted}" stroke-width="6"/>
          <g transform="translate(1450,${F(jy)}) rotate(${F(Math.sin(t * 7) * 10)})"><circle r="40" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
          <text y="20" font-size="58" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">?</text>
          <path d="M-34,-24 L-10,-80 L4,-30 L22,-76 L36,-22" fill="${C.pink}"/></g>`;
      }
      // Verdicts.
      out += pill(470, 820, 'exact reference ✓', C.purple, pop(u, 4.6, 0.6), 24);
      out += pill(960, 820, 'fits the reaction ✓', C.tealD, pop(u, 10.6, 0.6), 24);
      out += pill(1450, 820, 'mystery box ✗', C.pink, pop(u, 16.4, 0.6), 24);
      if (u > 20.4) out += about(960, 560, 1 + 0.05 * Math.sin(t * 5), `<rect x="${960 - BW / 2 - 12}" y="${BY - 12}" width="${BW + 24}" height="${BH + 24}" rx="24" fill="none" stroke="${C.gold}" stroke-width="8"/>`) + A.sparkle(960, 470, s.start + 20.6, t, C.gold);
      // Girl walks easel to easel; bear watches.
      let gx = 150, walking = false;
      [[0.2, 2.6, 150, 250], [8.6, 9.8, 250, 690], [12.8, 14.0, 690, 1220], [20.0, 21.2, 1220, 680]].forEach(([a, b, x0, x1]) => { if (u >= a) { gx = lerp(x0, x1, seg(u, a, b)); if (u < b) walking = true; } });
      const sad = u > 15.8 && u < 20, cheer = u > 21.2;
      const facingLeft = u > 20 && u < 21.2;
      const arm = cheer ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : walking ? undefined : { a1: -40, a2: -50 };
      out += P(t, { x: gx, y: 1000, scale: 0.82, look: LK.goldi, seed: 8, walking, flip: facingLeft, mood: sad ? 'sad' : undefined, talk: !walking && !sad && Math.sin(u * 2) > 0.3, frontArm: arm });
      out += bear(t, 1740, 990, 0.8, { hop: jk > 0 && u < 17 ? Math.abs(Math.sin((u - 15.6) * 8)) * 30 : 0, shock: u > 15.6 && u < 18 });
      return out;
    },

    /* ================= Lesson 20 ================= */
    // A candle tries to get past the velvet rope; the bouncer sends it back.
    's6-bouncer': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="930" width="1920" height="150" fill="#EADFD8"/><rect x="0" y="930" width="1920" height="6" fill="#DCCFC6"/>`;
      // Club facade.
      const neon = 0.75 + 0.25 * (Math.sin(t * 13) > -0.7 ? 1 : 0);
      out += `<rect x="1060" y="440" width="700" height="490" rx="10" fill="${C.purple}"/>
        <rect x="1060" y="440" width="700" height="40" fill="#5E56B8"/>
        <text x="1290" y="560" font-size="64" font-weight="900" text-anchor="middle" fill="${C.pinkL}" opacity="${neon}" font-family="Playfair Display" style="filter:drop-shadow(0 0 10px ${C.pink})">THE LEVEL</text>
        <rect x="1200" y="610" width="200" height="320" rx="14" fill="#5E56B8"/><rect x="1214" y="624" width="172" height="306" rx="10" fill="${C.purpleL}"/><circle cx="1366" cy="790" r="9" fill="${C.gold}"/>
        <rect x="1540" y="560" width="160" height="130" rx="10" fill="${C.peachL}"/><line x1="1620" y1="560" x2="1620" y2="690" stroke="${C.purple}" stroke-width="6"/>`;
      out += cat(t, 1650, 690, 0.42, { col: C.muted, dark: C.dark, seed: 2, look: -1 });
      // Velvet rope: the resistance area.
      const sway = Math.sin(t * 2) * 4;
      out += `${[1060, 1180].map(x => `<rect x="${x - 8}" y="780" width="16" height="150" rx="6" fill="${C.gold}"/><circle cx="${x}" cy="776" r="14" fill="${C.gold}"/><ellipse cx="${x}" cy="930" rx="30" ry="8" fill="${C.gold}"/>`).join('')}
        <path d="M1060,790 Q1120,${F(850 + sway)} 1180,790" fill="none" stroke="${C.pink}" stroke-width="14" stroke-linecap="round"/>`;
      out += pill(1120, 990, 'RESISTANCE AREA', C.pink, pop(u, 0.8, 0.6), 24);
      // Chart inset with the same story in candles.
      const ik = pop(u, 0.4, 0.7);
      const IX0 = 220, IX1 = 760, IY0 = 380, IY1 = 630;
      const Y = v => IY1 - 20 - v * (IY1 - IY0 - 40);
      if (ik > 0) {
        let g = `<rect x="${IX0}" y="${IY0}" width="${IX1 - IX0}" height="${IY1 - IY0}" rx="24" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
          <rect x="${IX0 + 10}" y="${F(Y(0.76))}" width="${IX1 - IX0 - 20}" height="${F(Y(0.62) - Y(0.76))}" fill="${C.pink}" opacity=".18"/>
          <line x1="${IX0 + 10}" x2="${IX1 - 10}" y1="${F(Y(0.76))}" y2="${F(Y(0.76))}" stroke="${C.pink}" stroke-width="3" stroke-dasharray="10 8"/>
          <line x1="${IX0 + 10}" x2="${IX1 - 10}" y1="${F(Y(0.62))}" y2="${F(Y(0.62))}" stroke="${C.pink}" stroke-width="3" stroke-dasharray="10 8"/>`;
        const cs = [{ o: .12, c: .24, h: .27, l: .09 }, { o: .24, c: .38, h: .41, l: .22 }, { o: .38, c: .5, h: .53, l: .36 }, { o: .5, c: .64, h: .67, l: .48 },
          { o: .64, c: .67, h: .9, l: .61, wick: 'up' }, { o: .67, c: .54, h: .69, l: .51 }, { o: .54, c: .4, h: .56, l: .37 }, { o: .4, c: .26, h: .42, l: .23 }];
        const at = [4.2, 4.9, 5.6, 6.3, 7.4, 13.6, 14.3, 15.0], du = [0.6, 0.6, 0.6, 0.6, 1.8, 0.6, 0.6, 0.6];
        cs.forEach((c, i) => { g += miniCandle(u, c, at[i], du[i], IX0 + 60 + i * 60, Y, 26); });
        if (u > 9.2) g += `<circle cx="${IX0 + 60 + 4 * 60}" cy="${F(Y(0.9))}" r="${F(22 + Math.sin(t * 5) * 3)}" fill="none" stroke="${C.gold}" stroke-width="4"/>`;
        out += about((IX0 + IX1) / 2, (IY0 + IY1) / 2, ik, g);
        if (u > 9.2) out += pill(IX0 + 300, Y(0.9) - 4, 'wick', C.gold, pop(u, 9.2, 0.5), 22);
        if (u > 11.3 && u < 16.6) out += pill(IX1 + 150, IY0 + 60, 'not enough info yet', C.muted, pop(u, 11.3, 0.5), 22);
      }
      // The candle walks up, leans over the rope, gets sent back, walks away.
      let cx = 260, walking = false, flip = false, lean = 0;
      if (u < 0.6) cx = -120; else { cx = lerp(-120, 980, seg(u, 0.6, 4.0)); walking = u < 4.0; }
      if (u > 7.4 && u < 10.2) lean = Math.sin(seg(u, 7.4, 10.2) * Math.PI) * 24;
      if (u > 13.6) { flip = true; cx = lerp(980, 400, seg(u, 13.6, 17.0)); walking = u < 17.0; }
      out += candleGuy(t, cx, 930, 1.3, { walking, flip, lean, mood: u > 13.6 ? 'sad' : undefined, tallWick: u > 7.4 && u < 10.2, armR: lean > 4 ? -30 : undefined });
      // Bouncer.
      const stop = u > 7.8 && u < 12;
      const shades = `<g transform="translate(1300,${F(930 - 280 * 1.05)})"></g>`;
      out += P(t, { x: 1300, y: 930, scale: 1.05, look: LK.bouncer, flip: true, seed: 4, talk: stop && u < 10, frontArm: stop ? { a1: -20, a2: -70 } : { a1: 150, a2: 30 }, backArm: { a1: 40, a2: 160 } });
      const hy = 930 - 282 * 1.05 + Math.sin(t * 2 + 4) * 2;
      out += `<g transform="translate(1300,${F(hy)})"><rect x="-38" y="-10" width="32" height="18" rx="7" fill="${C.dark}"/><rect x="6" y="-10" width="32" height="18" rx="7" fill="${C.dark}"/><rect x="-8" y="-4" width="16" height="5" fill="${C.dark}"/></g>` + shades;
      if (stop) out += A.bubble(1520, 770, 'Not tonight.', { size: 30, weight: 900, color: C.dark, tail: 'left', op: clamp((u - 7.8) / 0.3) * (1 - seg(u, 11.6, 12)) });
      if (u > 11.3 && u < 13.4) out += qmark(cx + 10, 600, t, s.start + 11.3, C.purple, 80);
      out += stamp(730, 820, 'REJECTION-LIKE', C.pink, u, 16.8, -7, 40);
      if (u > 16.8) out += A.sparkle(730, 820, s.start + 17.1, t);
      return out;
    },

    // The candle moves in upstairs: closes above, holds, and builds.
    's6-moving-in': (s, t) => {
      const u = t - s.start;
      const BX0 = 400, BX1 = 1260, UP = 470, SL = 730, SL2 = 770, GR = 980;
      let out = `<rect x="0" y="${GR}" width="1920" height="${1080 - GR}" fill="#F6EDE6"/><rect x="0" y="${GR}" width="1920" height="4" fill="#EADFD8"/>`;
      const bk = pop(u, 0.1, 0.8);
      // Building.
      let b = `<path d="M${BX0 - 30},${UP} L${(BX0 + BX1) / 2},${UP - 80} L${BX1 + 30},${UP} Z" fill="${C.pink}"/>
        <rect x="${BX0}" y="${UP}" width="${BX1 - BX0}" height="${SL - UP}" fill="#E8F8F6"/>
        <rect x="${BX0}" y="${SL2}" width="${BX1 - BX0}" height="${GR - SL2}" fill="${C.pinkP}"/>
        <rect x="${BX0}" y="${SL}" width="${BX1 - BX0}" height="${SL2 - SL}" fill="${C.pink}" opacity=".75"/>
        <rect x="${BX0}" y="${UP}" width="${BX1 - BX0}" height="${GR - UP}" fill="none" stroke="${C.dark}" stroke-width="8"/>
        <rect x="${BX0 + 640}" y="${SL2 + 40}" width="120" height="${GR - SL2 - 40}" rx="8" fill="${C.peachL}" stroke="${C.peach}" stroke-width="4"/>`;
      // Staircase through a gap in the slab.
      const steps = 7, sx0 = 470, sx1 = 760;
      for (let i = 0; i < steps; i++) {
        const x = sx0 + i * (sx1 - sx0) / steps, y = GR - (i + 1) * (GR - SL) / steps;
        b += `<rect x="${F(x)}" y="${F(y)}" width="${F((sx1 - sx0) / steps + 1)}" height="${F(GR - y)}" fill="#DCCBBE"/><rect x="${F(x)}" y="${F(y)}" width="${F((sx1 - sx0) / steps + 1)}" height="6" fill="#C9B9AE"/>`;
      }
      b += `<rect x="${sx1 - 10}" y="${SL}" width="${80}" height="${SL2 - SL}" fill="#E8F8F6"/>`;
      out += about(830, GR, bk, b);
      out += pill(1060, 750, 'RESISTANCE AREA', C.pink, pop(u, 0.8, 0.6) * 1, 22, '#fff');
      // Move-in props on the upper floor.
      const prop = (at, x, svg) => { const q = pop(u, at, 0.5); return q > 0 ? `<g transform="translate(${x},${SL}) scale(${q.toFixed(3)})">${svg}</g>` : ''; };
      out += prop(9.4, 1180, `<rect x="-6" y="-120" width="12" height="120" fill="${C.dark}"/><path d="M-40,-120 L40,-120 L26,-170 L-26,-170 Z" fill="${C.peachL}"/>`);
      out += prop(10.2, 900, `<rect x="-34" y="-50" width="68" height="50" rx="6" fill="${C.pink}"/><ellipse cx="-12" cy="-70" rx="22" ry="12" fill="${C.teal}" transform="rotate(-30 -12 -70)"/><ellipse cx="14" cy="-80" rx="22" ry="12" fill="${C.teal}" transform="rotate(30 14 -80)"/>`);
      out += prop(11.0, 1020, `<rect x="-60" y="-210" width="120" height="84" rx="8" fill="#fff" stroke="${C.peach}" stroke-width="7"/><path d="M-44,-140 L-14,-176 L10,-152 L28,-168 L44,-140 Z" fill="${C.tealL}"/>`);
      // Building new structure: crates stacked as HL then HH.
      const crate = (x, y, at, lab, col) => { const q = pop(u, at, 0.5); return q > 0 ? about(x, y, q, `<rect x="${x - 40}" y="${y - 70}" width="80" height="70" rx="6" fill="${C.peachL}" stroke="#C98A1F" stroke-width="4"/><path d="M${x - 40},${y - 70} L${x + 40},${y}" stroke="#C98A1F" stroke-width="3"/>`) + pill(x, y - 96, lab, col, q, 20) : ''; };
      out += crate(830, SL, 12.8, 'HL', C.teal) + crate(1110, SL, 13.4, '', C.teal);
      out += crate(1110, SL - 70, 14.0, 'HH', C.tealD);
      // The candle: climbs (closes above), pulls back without going back down, settles.
      let cx = 980, cy = GR, walking = false, flip = true;
      const box = `<g transform="translate(-6,-10)"><rect x="-30" y="-40" width="60" height="44" rx="5" fill="${C.peachL}" stroke="#C98A1F" stroke-width="3"/></g>`;
      if (u > 0.8) {
        const f = seg(u, 0.8, 4.2), k1 = 0.35;
        if (f < k1) { cx = lerp(980, sx0 - 20, f / k1); cy = GR; } else { const g = (f - k1) / (1 - k1); cx = lerp(sx0 - 20, sx1 + 30, g); cy = lerp(GR, SL, clamp((cx - sx0) / (sx1 - sx0))); flip = false; }
        walking = u < 4.2;
      }
      if (u > 4.2) { flip = false; cx = sx1 + 30; cy = SL; }
      if (u > 5.6) { const f = seg(u, 5.6, 7.6); cx = lerp(sx1 + 30, 1000, f); walking = u < 7.6; }
      if (u > 8.0) { const f = seg(u, 8.0, 9.2); cx = lerp(1000, 820, f); flip = true; walking = u < 9.2; }
      if (u > 9.6) { const f = seg(u, 9.6, 11.6); cx = lerp(820, 980, f); flip = false; walking = u < 11.6; }
      out += candleGuy(t, cx, cy, 1.0, { walking, flip, hold: u < 5.6 ? box : '', armR: u < 5.6 ? 20 : u > 16.2 ? -70 + Math.sin(t * 8) * 10 : undefined, armL: u > 16.2 ? -110 : undefined, talk: u > 12.6 && u < 15.6 });
      if (u > 8.6 && u < 11) out += pill(600, 520, 'pulls back, stays above', C.peach, pop(u, 8.6, 0.5), 20);
      if (u > 5.2 && u < 7.8) out += qmark(cx, 520, t, s.start + 5.2, C.purple, 70);
      // Cat follows upstairs.
      const catX = u < 6 ? 1180 : lerp(1180, 1200, seg(u, 6, 7));
      out += cat(t, u < 6 ? 1150 : 1210, u < 6 ? GR : SL, 0.45, { col: C.muted, dark: C.dark, seed: 5, flip: true, look: -1 }) + (catX ? '' : '');
      // Mover outside waves.
      out += P(t, { x: 250, y: GR, scale: 0.9, look: LK.mover, seed: 2, frontArm: u < 3 ? { a1: -60, a2: -100 + Math.sin(t * 8) * 20 } : { a1: 100, a2: 95 }, talk: u > 5.2 && u < 7.4 });
      if (u > 5.2 && u < 7.8) out += A.bubble(240, 640, 'Moved in?', { size: 28, weight: 700, op: clamp((u - 5.2) / 0.3) * (1 - seg(u, 7.4, 7.8)) });
      // Checklist chips.
      const chips = [[2.6, 'closes beyond'], [8.2, 'holds beyond'], [12.8, 'builds beyond']];
      chips.forEach(([at, txt], i) => {
        const q = pop(u, at, 0.6);
        if (q <= 0) return;
        out += about(1560, 540 + i * 100, q, `<rect x="1360" y="${506 + i * 100}" width="400" height="68" rx="34" fill="#fff" stroke="${C.tealL}" stroke-width="4"/>
          <text x="1440" y="${552 + i * 100}" font-size="30" font-weight="700" fill="${C.dark}" font-family="DM Sans">${txt}</text>`) + tick(1400, 540 + i * 100, pop(u, at + 0.5, 0.4), 22);
      });
      out += stamp(1560, 860, 'ACCEPTANCE-LIKE', C.tealD, u, 16.4, -6, 38);
      if (u > 16.4) out += A.sparkle(1560, 860, s.start + 16.7, t, C.teal);
      return out;
    },

    /* ================= Lesson 21 ================= */
    // A balance scale: weights of context pile onto B; a feather sits on A; a robot's 93% gets crossed out.
    's6-weigh-scale': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="990" width="1920" height="90" fill="#F6EDE6"/><rect x="0" y="990" width="1920" height="4" fill="#EADFD8"/>`;
      const k = pop(u, 0.2, 0.8);
      const spring = x => x <= 0 ? 0 : 1 - Math.exp(-3.5 * x) * Math.cos(9 * x);
      const drops = [[8.4, 6], [13.0, 5], [14.4, 4]];
      const th = drops.reduce((a, [at, w]) => a + w * spring(u - at - 0.5), 0) + Math.sin(t * 1.3) * 0.6;
      const PX = 960, PY = 560, L = 330;
      const ax = PX - Math.cos(rad(th)) * L, ay = PY - Math.sin(rad(th)) * L;
      const bx = PX + Math.cos(rad(th)) * L, by = PY + Math.sin(rad(th)) * L;
      const pan = (x, y, col) => `<path d="M${x - 70},${y + 150} L${x},${y} L${x + 70},${y + 150}" fill="none" stroke="${C.muted}" stroke-width="4"/>
        <path d="M${x - 110},${y + 150} L${x + 110},${y + 150} Q${x + 96},${y + 196} ${x},${y + 196} Q${x - 96},${y + 196} ${x - 110},${y + 150} Z" fill="${col}"/>`;
      let g = `<path d="M860,990 L1060,990 L1010,950 L910,950 Z" fill="${C.gold}"/><rect x="948" y="${PY}" width="24" height="392" rx="8" fill="${C.gold}"/>
        <line x1="${F(ax)}" y1="${F(ay)}" x2="${F(bx)}" y2="${F(by)}" stroke="#C98A1F" stroke-width="16" stroke-linecap="round"/>
        <circle cx="${PX}" cy="${PY}" r="20" fill="${C.gold}" stroke="#C98A1F" stroke-width="5"/>
        ${pan(ax, ay, C.purpleL)}${pan(bx, by, C.tealL)}`;
      out += about(960, 990, k, g);
      // Feather drifts onto A.
      const ff = seg(u, 3.4, 6.0);
      if (ff > 0) {
        const fx = ax + Math.sin(ff * 9) * 40 * (1 - ff), fy = lerp(380, ay + 135, ease(ff));
        out += `<g transform="translate(${F(fx)},${F(fy)}) rotate(${F(-30 + Math.sin(ff * 9) * 25)})"><path d="M0,-44 Q22,-10 0,40 Q-22,-10 0,-44 Z" fill="#fff" stroke="${C.purple}" stroke-width="3"/><line x1="0" y1="-30" x2="0" y2="52" stroke="${C.purple}" stroke-width="3"/></g>`;
      }
      // Weights fall onto B.
      const W = [['swing', C.tealD], ['reaction', C.teal], ['location', C.purple]];
      drops.forEach(([at], i) => {
        const f = seg(u, at, at + 0.5);
        if (f <= 0) return;
        const tx = bx + (i === 2 ? 0 : (i - 0.5) * 108), ty = by + 148 - (i === 2 ? 64 : 0);
        const x = tx, y = lerp(370, ty, f * f);
        out += `<g transform="translate(${F(x)},${F(y)})"><path d="M-50,0 L50,0 L40,-60 L-40,-60 Z" fill="${W[i][1]}"/><rect x="-14" y="-74" width="28" height="18" rx="8" fill="none" stroke="${W[i][1]}" stroke-width="6"/>
          <text y="-20" font-size="20" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${W[i][0]}</text></g>`;
      });
      out += pill(ax, ay + 240, 'A · random price', C.muted, pop(u, 3.4, 0.6), 24);
      out += pill(bx, by + 240, 'B · higher low', C.tealD, pop(u, 7.8, 0.6), 24);
      if (u > 15.8) out += pill(960, 430, 'B gets more weight', C.tealD, pop(u, 15.8, 0.6), 30) + A.sparkle(bx, by + 100, s.start + 16.0, t, C.teal);
      // Judge points; robot rolls in with a score that gets crossed out.
      out += P(t, { x: 1620, y: 1000, scale: 0.85, look: LK.judge, flip: true, seed: 6, talk: u > 12.4 && u < 19.8, frontArm: u > 7.8 ? { a1: -10, a2: -20 } : { a1: 100, a2: 95 } });
      const rx = lerp(-160, 300, ease(seg(u, 19.4, 20.8)));
      if (u > 19.4) {
        const sign = `<g transform="translate(10,-60)"><rect x="-6" y="0" width="12" height="70" fill="#9B6A45"/><rect x="-80" y="-74" width="160" height="80" rx="12" fill="#fff" stroke="${C.purple}" stroke-width="5"/><text y="-14" font-size="46" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="DM Sans">93%</text></g>`;
        out += robot(t, rx, 1000, 0.85, { armUp: true, hold: sign, face: u > 22 ? '?' : undefined });
        const ck = ease(seg(u, 21.6, 22.0));
        if (ck > 0) {
          const hx = rx + (60 + Math.cos(rad(-60)) * 80) * 0.85 + 8, hy = 1000 + (-120 + Math.sin(rad(-60)) * 80) * 0.85 - 60 * 0.85 - 34 * 0.85;
          out += `<path d="M${F(hx - 70)},${F(hy - 30)} L${F(lerp(hx - 70, hx + 70, ck))},${F(lerp(hy - 30, hy + 30, ck))}" stroke="${C.pink}" stroke-width="12" stroke-linecap="round"/>`;
          if (ck >= 1) out += `<path d="M${F(hx + 70)},${F(hy - 30)} L${F(lerp(hx + 70, hx - 70, ease(seg(u, 22.0, 22.3))))},${F(lerp(hy - 30, hy + 30, ease(seg(u, 22.0, 22.3))))}" stroke="${C.pink}" stroke-width="12" stroke-linecap="round"/>`;
        }
        out += pill(560, 600, 'weigh it, don’t score it', C.purple, pop(u, 22.6, 0.6), 28);
      }
      return out;
    },

    // A janitor tries keys on two doors: which level matters depends on the question.
    's6-key-ring': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="970" width="1920" height="110" fill="#F6EDE6"/><rect x="0" y="970" width="1920" height="4" fill="#EADFD8"/>`;
      // Wall chart with four lettered levels.
      const ck = pop(u, 0.3, 0.7);
      const X0 = 200, X1 = 820, Y0 = 410, Y1 = 900;
      const sw = [[0, .04], [.22, .62], [.4, .34], [.68, .95], [.78, .7], [.86, .8], [1, .52]];
      const X = q => X0 + 70 + q * (X1 - X0 - 100), Y = v => Y1 - 30 - v * (Y1 - Y0 - 60);
      const LV = { A: [.5, C.muted], B: [.8, C.peach], C: [.34, C.tealD], D: [.04, C.purple] };
      const hiC = u > 14.4, hiD = u > 20.6;
      if (ck > 0) {
        let g = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="26" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
        Object.entries(LV).forEach(([L, [v, col]]) => {
          const on = (L === 'C' && hiC) || (L === 'D' && hiD);
          const dim = (hiC || hiD) && !on ? 0.3 : 1;
          g += `<g opacity="${dim}"><line x1="${X0 + 60}" x2="${X1 - 20}" y1="${F(Y(v))}" y2="${F(Y(v))}" stroke="${col}" stroke-width="${on ? 7 : 4}" stroke-dasharray="${on ? '' : '12 9'}"/>
            <circle cx="${X0 + 36}" cy="${F(Y(v))}" r="20" fill="${col}"/><text x="${X0 + 36}" y="${F(Y(v) + 8)}" font-size="22" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${L}</text></g>`;
        });
        g += `<polyline points="${drawLine(sw.map(([a, b]) => [X(a), Y(b)]), ease(seg(u, 0.6, 2.6))).d}" fill="none" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
        out += about((X0 + X1) / 2, (Y0 + Y1) / 2, ck, g);
      }
      if (hiC) out += pill(X(0.62), Y(0.34) + 44, 'C · supporting HL', C.tealD, pop(u, 14.4, 0.6), 24);
      if (hiD) out += pill(X(0.62), Y(0.04) - 40, 'D · external boundary', C.purple, pop(u, 20.6, 0.6), 24);
      // Doors.
      const door = (x, lab, at, open, col) => {
        const q = pop(u, at, 0.6);
        if (q <= 0) return '';
        const o = ease(open);
        return about(x, 970, q, `<rect x="${x - 110}" y="560" width="220" height="410" rx="14" fill="${C.cream}" stroke="${C.dark}" stroke-width="6"/>
          <rect x="${x - 100}" y="570" width="200" height="400" fill="#FFF3C4" opacity="${o}"/>
          <path d="M${x - 100},570 L${x - 100 + 200 * (1 - o * 0.7)},${570 + o * 20} L${x - 100 + 200 * (1 - o * 0.7)},${970 - o * 20} L${x - 100},970 Z" fill="${col}"/>
          <circle cx="${x - 100 + 200 * (1 - o * 0.7) - 24}" cy="770" r="9" fill="${C.gold}"/>`) + pill(x, 516, lab, C.dark, q, 22);
      };
      out += door(1160, 'CURRENT STRUCTURE?', 7.8, seg(u, 14.4, 15.2), C.purpleL);
      out += door(1580, 'LARGER RANGE?', 16.8, seg(u, 20.6, 21.4), C.peachL);
      if (u > 14.6) out += A.sparkle(1160, 640, s.start + 14.8, t, C.gold);
      if (u > 20.8) out += A.sparkle(1580, 640, s.start + 21.0, t, C.gold);
      // Big keys at the locks.
      const bigKey = (x, y, L, col, k, wob) => k <= 0 ? '' : `<g transform="translate(${F(x)},${F(y)}) rotate(${F(wob)}) scale(${k.toFixed(3)})"><circle cx="-60" cy="0" r="30" fill="${col}"/><circle cx="-60" cy="0" r="12" fill="#fff"/>
        <rect x="-34" y="-8" width="90" height="16" rx="6" fill="${col}"/><rect x="34" y="6" width="10" height="18" fill="${col}"/><rect x="48" y="6" width="8" height="14" fill="${col}"/>
        <text x="-60" y="-40" font-size="30" font-weight="900" text-anchor="middle" fill="${col}" font-family="DM Sans">${L}</text></g>`;
      if (u > 13.0 && u < 16) out += bigKey(1110, 770, 'C', C.tealD, pop(u, 13.0, 0.4), u > 14.2 ? -20 * ease(seg(u, 14.2, 14.5)) : 0);
      if (u > 18.6 && u < 20.2) { const sh = Math.sin(u * 40) * 8 * (u > 19.2 ? 1 : 0); out += bigKey(1530 + sh, 770, 'C', C.tealD, pop(u, 18.6, 0.4), 0) + (u > 19.4 ? cross(1600, 700, pop(u, 19.4, 0.3), 22) : ''); }
      if (u > 20.2 && u < 22.4) out += bigKey(1530, 770, 'D', C.purple, pop(u, 20.2, 0.4), u > 20.6 ? -20 * ease(seg(u, 20.6, 20.9)) : 0);
      // Janitor with a key ring, and a dog tagging along.
      const ring = `<g><circle cx="0" cy="10" r="20" fill="none" stroke="${C.gold}" stroke-width="5"/>${[['A', C.muted], ['B', C.peach], ['C', C.tealD], ['D', C.purple]].map(([L, col], i) => `<g transform="translate(0,28) rotate(${-45 + i * 30 + Math.sin(t * 3 + i) * 6})"><rect x="-4" y="0" width="8" height="38" rx="3" fill="${col}"/><circle cx="0" cy="44" r="11" fill="${col}"/><text y="49" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${L}</text></g>`).join('')}</g>`;
      let jx = 920, jw = false;
      [[3.8, 5.2, 1980, 920], [12.2, 13.0, 920, 980], [17.0, 18.4, 980, 1400]].forEach(([a, b, x0, x1]) => { if (u >= a) { jx = lerp(x0, x1, seg(u, a, b)); if (u < b) jw = true; } });
      if (u < 3.8) jx = 1980;
      out += P(t, { x: jx, y: 985, scale: 0.8, look: LK.janitor, seed: 4, flip: u < 5.2, walking: jw, talk: (u > 14.4 && u < 16.6) || (u > 20.6 && u < 22.4), frontArm: { a1: -30, a2: 40 }, hold: ring });
      out += dog(t, jx - 140 + (u < 5.2 ? 260 : 0), 985, 0.55, { wag: hiC, happy: hiC, flip: u < 5.2, look: 1, hop: jw ? Math.abs(Math.sin(t * 9)) * 10 : 0 });
      // Myth buster.
      if (u > 22.8) out += pill(960, 1028, '3 touches ≠ strong', C.pink, pop(u, 22.8, 0.6), 28) + `<g opacity="${clamp(u - 23)}">${[0, 1, 2].map(i => `<line x1="${1150 + i * 16}" x2="${1150 + i * 16}" y1="1010" y2="1046" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>`).join('')}</g>`;
      return out;
    },

    /* ================= Lesson 22 ================= */
    // A lighthouse marks the old high; a gull (price) flies back toward it; the captain knows it is a landmark.
    's6-lighthouse': (s, t) => {
      const u = t - s.start;
      const SEA = 860, LH = 560, LX = 640;
      let out = `<rect x="0" y="${SEA}" width="1920" height="${1080 - SEA}" fill="${C.tealL}" opacity=".7"/>`;
      for (let r = 0; r < 3; r++) {
        let d = '';
        for (let x = 0; x <= 1920; x += 40) d += `${x ? 'L' : 'M'}${x},${F(SEA + 30 + r * 60 + Math.sin(x * 0.02 + t * 2 + r) * 6)}`;
        out += `<path d="${d}" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`;
      }
      // Rock and lighthouse.
      const lk = pop(u, 0.1, 0.8);
      const beamA = Math.sin(t * 1.2) * 0.9;
      const beam = `<path d="M${LX},${LH - 18} L${F(LX + Math.cos(beamA) * 700)},${F(LH - 18 + Math.sin(beamA) * 120 - 110)} L${F(LX + Math.cos(beamA) * 700)},${F(LH - 18 + Math.sin(beamA) * 120 + 110)} Z" fill="${C.gold}" opacity=".16"/>`;
      out += about(LX, SEA, lk, `${beam}
        <path d="M${LX - 210},${SEA + 30} Q${LX - 160},${SEA - 120} ${LX - 40},${SEA - 130} Q${LX + 80},${SEA - 140} ${LX + 170},${SEA + 30} Z" fill="#9B8B80"/>
        <path d="M${LX - 60},${SEA - 120} L${LX - 44},${LH + 20} L${LX + 44},${LH + 20} L${LX + 60},${SEA - 120} Z" fill="#fff" stroke="${C.dark}" stroke-width="5"/>
        ${[0, 1, 2].map(i => { const y0 = SEA - 120 - i * 60 - 30; return `<path d="M${LX - 58 + i * 5},${y0} L${LX - 54 + i * 5},${y0 - 28} L${LX + 54 - i * 5},${y0 - 28} L${LX + 58 - i * 5},${y0} Z" fill="${C.pink}"/>`; }).join('')}
        <rect x="${LX - 56}" y="${LH + 8}" width="112" height="16" rx="4" fill="${C.dark}"/>
        <rect x="${LX - 34}" y="${LH - 44}" width="68" height="52" rx="6" fill="#FFF3C4" stroke="${C.dark}" stroke-width="5"/>
        <circle cx="${LX}" cy="${LH - 18}" r="${F(14 + Math.sin(t * 6) * 2)}" fill="${C.gold}"/>
        <path d="M${LX - 46},${LH - 44} L${LX},${LH - 92} L${LX + 46},${LH - 44} Z" fill="${C.pink}"/>`);
      // Level line from the lamp.
      const lvk = ease(seg(u, 3.4, 4.6));
      if (lvk > 0) out += `<line x1="${LX + 40}" x2="${F(lerp(LX + 40, 1820, lvk))}" y1="${LH - 18}" y2="${LH - 18}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="18 12"/>`;
      out += pill(1560, LH - 64, 'PREVIOUS HIGH', C.purple, pop(u, 3.6, 0.6), 26);
      out += pill(1560, LH + 30, 'a landmark', C.purpleL, pop(u, 4.4, 0.6), 24, '#5E56B8');
      // Gull flight path = price.
      const GP = [[200, 820], [LX - 20, LH - 70], [920, 800], [1300, LH + 40]];
      const segs = [[0.4, 3.0, 0], [3.4, 5.8, 1], [11.4, 14.0, 2]];
      let gx = GP[0][0], gy = GP[0][1], flying = false, k2 = 0;
      const path = [];
      segs.forEach(([a, b, i]) => {
        const f = seg(u, a, b);
        if (f <= 0) return;
        const [x0, y0] = GP[i], [x1, y1] = GP[i + 1];
        for (let q = 0; q <= f + 1e-6; q += 0.04) path.push([lerp(x0, x1, Math.min(q, f)), lerp(y0, y1, ease(Math.min(q, f))) + Math.sin(Math.min(q, f) * Math.PI * 3) * 14]);
        gx = lerp(x0, x1, f); gy = lerp(y0, y1, ease(f)) + Math.sin(f * Math.PI * 3) * 14; flying = f < 1; k2 = i;
      });
      if (path.length > 1) out += `<polyline points="${path.map(p => p.map(F).join(',')).join(' ')}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-dasharray="12 10" opacity=".45"/>`;
      if (u > 0.4) out += bird(t, gx, gy - (flying ? 0 : 6 + Math.sin(t * 4) * 6), 1.2, { col: '#fff', dark: C.muted, fly: flying || u > 14, seed: 2, flip: k2 === 1 && flying });
      if (u > 14 && u < 17.2) out += A.bubble(gx + 60, gy - 110, 'Will it reverse?', { size: 28, weight: 700, color: '#C2475F', op: clamp((u - 14) / 0.3) * (1 - seg(u, 16.8, 17.2)) });
      // Boat with the captain and a telescope.
      const bxp = lerp(1500, 1180, ease(seg(u, 0.5, 10))), byp = SEA + 50 + Math.sin(t * 2) * 6, rock = Math.sin(t * 1.6) * 3;
      const scope = `<g transform="rotate(-8)"><rect x="-6" y="-12" width="70" height="20" rx="6" fill="${C.gold}"/><rect x="56" y="-16" width="20" height="28" rx="4" fill="#C98A1F"/></g>`;
      out += `<g transform="translate(${F(bxp)},${F(byp)}) rotate(${F(rock)})">
        <rect x="-4" y="-260" width="8" height="250" fill="#9B6A45"/><path d="M8,-250 L120,-60 L8,-60 Z" fill="#fff" stroke="${C.muted}" stroke-width="3"/><path d="M-8,-230 L-90,-70 L-8,-70 Z" fill="${C.pinkL}"/>
        ${P(t, { x: -70, y: -24, scale: 0.42, look: LK.captain, flip: true, seed: 7, talk: u > 17.4 && u < 21.4, frontArm: { a1: -8, a2: -8 }, hold: scope })}
        <path d="M-170,-30 L170,-30 L130,30 L-130,30 Z" fill="${C.peach}"/><path d="M-170,-30 L170,-30" stroke="#E08E2E" stroke-width="6"/>
        <circle cx="-80" cy="0" r="9" fill="#fff"/><circle cx="0" cy="0" r="9" fill="#fff"/><circle cx="80" cy="0" r="9" fill="#fff"/></g>`;
      if (u > 17.4) out += A.bubble(bxp + 40, 690, 'A landmark, not a forecast.', { size: 28, weight: 700, color: C.dark, tail: 'left', op: clamp((u - 17.4) / 0.3) });
      return out;
    },

    // Height marks on a door frame: tiptoes (wick), standing tall (close), staying taller (structure).
    's6-growth-chart': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="200" y="380" width="1520" height="620" rx="24" fill="#FFF6F0"/>
        ${Array.from({ length: 16 }, (_, i) => `<rect x="${230 + i * 92}" y="390" width="40" height="590" fill="${C.purpleL}" opacity=".18"/>`).join('')}
        <rect x="200" y="960" width="1520" height="40" fill="#EADBCF"/><rect x="0" y="1000" width="1920" height="80" fill="#F6EDE6"/>`;
      const DX0 = 1000, DX1 = 1240, DT = 420, OLD = 778, NEW = 745;
      out += `<rect x="${DX0 + 26}" y="${DT + 26}" width="${DX1 - DX0 - 52}" height="${1000 - DT - 26}" fill="${C.purpleL}" opacity=".5"/>
        <rect x="${DX0}" y="${DT}" width="26" height="${1000 - DT}" fill="#C9A27A"/><rect x="${DX1 - 26}" y="${DT}" width="26" height="${1000 - DT}" fill="#C9A27A"/><rect x="${DX0}" y="${DT}" width="${DX1 - DX0}" height="26" fill="#C9A27A"/>`;
      // Small old tick marks for flavour.
      [900, 860, 820].forEach((y, i) => { out += `<line x1="${DX0 - 4}" x2="${DX0 + 30}" y1="${y}" y2="${y}" stroke="${C.muted}" stroke-width="3" opacity=".6"/>`; });
      // The old high mark.
      const ok = pop(u, 3.8, 0.6);
      if (ok > 0) out += `<line x1="${DX0 - 30}" x2="${F(lerp(DX0, 1190, ease(seg(u, 4.2, 5.2))))}" y1="${OLD}" y2="${OLD}" stroke="${C.purple}" stroke-width="5" stroke-dasharray="${u > 4.2 ? '12 8' : ''}"/>` + pill(880, OLD, 'OLD HIGH', C.purple, ok, 24);
      const nk = ease(seg(u, 17.0, 17.8));
      if (nk > 0) out += `<line x1="${DX0 - 30}" x2="${F(lerp(DX0, 1190, nk))}" y1="${NEW}" y2="${NEW}" stroke="${C.tealD}" stroke-width="5"/>` + pill(880, NEW - 44, 'NEW MARK', C.tealD, pop(u, 17.4, 0.6), 24);
      // Kid: base, tiptoe, grow, grow again.
      let ks = 0.62, lift = 0;
      if (u > 6.8 && u < 11.4) lift = 34 * ease(seg(u, 6.8, 7.3)) * (1 - ease(seg(u, 10.8, 11.4)));
      ks = lerp(0.62, 0.71, ease(seg(u, 12.2, 13.2)));
      ks = lerp(ks, 0.77, ease(seg(u, 15.8, 16.8)));
      const kidX = 1110;
      if (lift > 1) out += `<ellipse cx="${kidX}" cy="1000" rx="30" ry="6" fill="${C.dark}" opacity=".12"/>`;
      out += P(t, { x: kidX, y: 995 - lift, scale: ks, look: LK.girl, seed: 3, talk: u > 12.6 && u < 14, frontArm: lift > 1 ? { a1: -100, a2: -95 } : { a1: 100, a2: 95 }, backArm: lift > 1 ? { a1: -80, a2: -85 } : undefined });
      // Labels for the three moments.
      out += pill(560, 560, 'WICK THROUGH', C.gold, pop(u, 7.4, 0.5) * (1 - seg(u, 11.6, 12) * 0.999), 28);
      out += pill(560, 560, 'CLOSE THROUGH', C.teal, pop(u, 12.6, 0.5) * (1 - seg(u, 15.6, 16) * 0.999), 28);
      out += pill(560, 560, 'BUILDING BEYOND', C.tealD, pop(u, 16.2, 0.5) * (1 - seg(u, 19.8, 20.2) * 0.999), 28);
      // Level → candle → structure chips.
      if (u > 20.2) [['level', C.purple], ['candle', C.gold], ['structure', C.tealD]].forEach(([w, col], i) => {
        out += pill(400 + i * 190, 560, w, col, pop(u, 20.2 + i * 0.5, 0.5), 28) + (i < 2 ? `<text x="${495 + i * 190}" y="572" font-size="34" font-weight="900" text-anchor="middle" fill="${C.muted}" opacity="${clamp(u - 20.6 - i * 0.5)}" font-family="DM Sans">→</text>` : '');
      });
      // Calendar flips while she stays taller.
      const pages = Math.floor(clamp((u - 15.8) / 2.4) * 4);
      out += `<g transform="translate(1520,560)"><rect x="-80" y="-80" width="160" height="170" rx="14" fill="#fff" stroke="${C.pinkL}" stroke-width="5"/><rect x="-80" y="-80" width="160" height="44" rx="14" fill="${C.pink}"/>
        <text y="56" font-size="70" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${12 + pages * 3}</text>
        <circle cx="-40" cy="-84" r="7" fill="${C.dark}"/><circle cx="40" cy="-84" r="7" fill="${C.dark}"/></g>`;
      if (u > 15.8 && u < 18.4) { const f = ((u - 15.8) * 1.66) % 1; out += `<path d="M1440,520 L1600,520 L1600,${F(520 + 130 * (1 - f))} L1440,${F(520 + 130 * (1 - f))} Z" fill="#fff" opacity="${F(1 - f)}" stroke="${C.pinkL}" stroke-width="3"/>`; }
      // Mom with the pencil; dog.
      const pencil = `<g transform="rotate(-60)"><rect x="-6" y="-70" width="12" height="62" rx="3" fill="${C.gold}"/><path d="M-6,-8 L6,-8 L0,8 Z" fill="#F3D6B4"/></g>`;
      const marking = (u > 4.0 && u < 5.4) || (u > 17.0 && u < 18.0);
      out += P(t, { x: 1360, y: 1000, scale: 0.92, look: LK.mom, flip: true, seed: 5, talk: u > 7.4 && u < 10.6, frontArm: marking ? { a1: -10, a2: 10 } : u > 7.4 && u < 10.6 ? { a1: -30, a2: -60 + Math.sin(t * 8) * 15 } : { a1: 100, a2: 95 }, hold: pencil });
      if (u > 7.4 && u < 10.8) out += A.bubble(1450, 650, 'Tiptoes don’t count!', { size: 26, weight: 700, color: '#B07A1C', tail: 'left', op: clamp((u - 7.4) / 0.3) * (1 - seg(u, 10.4, 10.8)) });
      out += dog(t, 1600, 1000, 0.6, { flip: true, look: -1, wag: u > 16 && u < 20, happy: u > 16 && u < 20 });
      return out;
    },

    /* ================= Lesson 23 ================= */
    // Level-lines line up for a job interview; two get hired onto the chart, one has no job.
    's6-job-interview': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="990" width="1920" height="90" fill="#F6EDE6"/><rect x="0" y="990" width="1920" height="4" fill="#EADFD8"/>`;
      // Wall chart that hired levels move into.
      const X0 = 300, X1 = 1100, Y0 = 400, Y1 = 690;
      const wk = pop(u, 0.3, 0.7);
      const sw = [[0, .08], [.25, .7], [.45, .35], [.62, .78], [.8, .5], [1, .62]];
      const X = q => X0 + 40 + q * (X1 - X0 - 80), Y = v => Y1 - 24 - v * (Y1 - Y0 - 48);
      if (wk > 0) out += about((X0 + X1) / 2, (Y0 + Y1) / 2, wk, `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="22" fill="#fff" stroke="#9B6A45" stroke-width="8"/>
        <polyline points="${sw.map(([a, b]) => `${F(X(a))},${F(Y(b))}`).join(' ')}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round" opacity=".8"/>`);
      // Desk and the boss.
      out += P(t, { x: 1500, y: 1000, scale: 0.9, look: LK.boss, flip: true, seed: 6, talk: [[6.0, 7.2], [10.6, 11.8], [16.2, 17.4], [18.0, 19.0]].some(([a, b]) => u > a && u < b),
        frontArm: u > 17.8 && u < 18.6 ? { a1: -60, a2: -80 } : { a1: 20, a2: -10 } });
      const gy = 1000 - 282 * 0.9 + Math.sin(t * 2 + 6) * 1.8;
      out += `<g transform="translate(1500,${F(gy)})"><circle cx="-15" cy="0" r="14" fill="none" stroke="${C.dark}" stroke-width="4"/><circle cx="15" cy="0" r="14" fill="none" stroke="${C.dark}" stroke-width="4"/><line x1="-1" x2="1" y1="0" y2="0" stroke="${C.dark}" stroke-width="4"/></g>`;
      out += `<rect x="1260" y="800" width="460" height="34" rx="10" fill="#9B6A45"/><rect x="1290" y="834" width="400" height="160" fill="#B9845A"/>
        <rect x="1380" y="760" width="160" height="40" rx="8" fill="#fff" stroke="${C.dark}" stroke-width="3"/><text x="1460" y="788" font-size="20" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">HIRING</text>
        <rect x="1590" y="740" width="70" height="60" rx="6" fill="${C.pinkL}"/><ellipse cx="1610" cy="728" rx="18" ry="10" fill="${C.teal}" transform="rotate(-30 1610 728)"/><ellipse cx="1640" cy="722" rx="18" ry="10" fill="${C.teal}" transform="rotate(30 1640 722)"/>`;
      // Three candidates.
      const G = [
        { col: C.teal, q: 0, v: .35, step: 5.8, badge: '🛡️ supports the HL', badgeAt: 7.2, hire: 8.8 },
        { col: C.peach, q: 1, v: .78, step: 10.4, badge: '🚧 high to overcome', badgeAt: 11.8, hire: 13.6 },
        { col: '#C9B9AE', q: 2, v: null, step: 16.0, badge: null, fire: 18.0 },
      ];
      const queueX = [820, 560, 300];
      G.forEach((g, i) => {
        let x = lerp(-200 - i * 260, queueX[i], seg(u, 2.2, 4.8)), y = 990, walking = u > 2.2 && u < 4.8, op = 1, mood;
        // Move forward as earlier candidates leave.
        const ahead = G.slice(0, i).filter(h => u > (h.hire || h.fire || 99) + 0.2).length;
        if (ahead > 0) x = lerp(queueX[i], queueX[i - ahead], seg(u, (G[i - 1].hire || G[i - 1].fire) + 0.2, (G[i - 1].hire || G[i - 1].fire) + 1.2));
        if (u > g.step) { x = lerp(x, 1100, seg(u, g.step, g.step + 1.0)); walking = u < g.step + 1.0; }
        if (g.hire && u > g.hire) {
          const f = ease(seg(u, g.hire, g.hire + 1.2));
          if (f >= 1) {
            out += `<line x1="${X0 + 16}" x2="${X1 - 16}" y1="${F(Y(g.v))}" y2="${F(Y(g.v))}" stroke="${g.col}" stroke-width="7" stroke-dasharray="20 10"/>` + pill(X1 - 180, Y(g.v) + (g.v > 0.5 ? -30 : 34), g.badge, g.col === C.peach ? '#E08E2E' : C.tealD, 1, 22);
            return;
          }
          x = lerp(1100, (X0 + X1) / 2, f); y = lerp(990, Y(g.v) + 82, f); op = 1;
          out += `<g opacity="${op}">${lineGuy(t, x, y, lerp(0.9, 1.6, f), { col: g.col, seed: i + 2 })}</g>`;
          return;
        }
        if (g.fire && u > g.fire + 1.0) { x = lerp(1100, -260, seg(u, g.fire + 1.0, g.fire + 3.4)); walking = true; mood = 'sad'; }
        if (g.fire && u > g.fire - 1.6) mood = 'sad';
        out += lineGuy(t, x, y, 0.9, { col: g.col, walking, seed: i + 2, mood, flip: g.fire && u > g.fire + 1.0 });
        if (g.badge && u > g.badgeAt) out += pill(x, y - 140, g.badge, g.col === C.peach ? '#E08E2E' : C.tealD, pop(u, g.badgeAt, 0.5), 24);
        if (g.fire && u > g.fire - 1.2 && u < g.fire + 1.2) out += qmark(x, y - 120, t, s.start + g.fire - 1.2, C.muted, 64);
      });
      if (u > 6.0 && u < 7.2) out += A.bubble(1380, 600, 'Your job?', { size: 28, weight: 700, op: clamp((u - 6) / 0.3) });
      if (u > 10.6 && u < 11.8) out += A.bubble(1380, 600, 'And yours?', { size: 28, weight: 700, op: clamp((u - 10.6) / 0.3) });
      if (u > 16.2 && u < 17.8) out += A.bubble(1380, 600, 'No swing here?', { size: 28, weight: 700, op: clamp((u - 16.2) / 0.3) });
      out += stamp(1100, 820, 'NO JOB', C.muted, u, 18.0, -10, 40);
      return out;
    },

    // A robot vacuum hoovers up every line with no job; three labelled levels remain.
    's6-chart-vacuum': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F6EDE6"/><rect x="0" y="1000" width="1920" height="4" fill="#EADFD8"/>`;
      const PX0 = 360, PX1 = 1560, PY0 = 400, PY1 = 880;
      out += panel(PX0, PY0, PX1, PY1, pop(u, 0.2, 0.7));
      const X = q => PX0 + 50 + q * 860, Y = v => PY1 - 30 - v * (PY1 - PY0 - 60);
      if (u > 0.2) out += A.swingChart(t, { x: PX0 + 50, y: PY0 + 30, w: 860, h: PY1 - PY0 - 60, swings: [[0, .04], [.22, .62], [.38, .3], [.62, .92], [.78, .55], [.9, .66], [1, .5]], t0: s.start + 0.5, t1: s.start + 2.2, seed: 61, per: 40, maxBody: 12, wick: 3, fade: u > 9 ? 0.55 : 1 });
      const KEEP = [[.04, C.purple, 'external low', 10.8], [.3, C.tealD, 'supporting HL', 14.0], [.92, '#E08E2E', 'prior high', 16.8]];
      const JUNK = [.14, .21, .39, .46, .58, .7, .76, .83, .99];
      const jcol = [C.pinkL, C.purpleL, C.peachL, '#C9B9AE', C.pinkL, C.tealL, C.purpleL, C.peachL, '#C9B9AE'];
      const vx = lerp(-100, 2000, seg(u, 5.0, 9.0));
      JUNK.forEach((v, i) => {
        const at = 2.0 + i * 0.16, q = ease(seg(u, at, at + 0.4));
        if (q <= 0) return;
        const dropAt = 5.0 + (300 + i * 140 + 100) / 2100 * 4.0;
        const f = seg(u, dropAt, dropAt + 0.55);
        if (f >= 1) return;
        const y = lerp(Y(v), 960, f * f), rot = f * (i % 2 ? 14 : -14), w = (PX1 - PX0 - 60) * q * (1 - f * 0.85);
        const cx = lerp((PX0 + PX1) / 2, 300 + i * 140 + 100, f);
        out += `<g transform="translate(${F(cx)},${F(y)}) rotate(${F(rot)})" opacity="${1 - f * 0.5}"><line x1="${F(-w / 2)}" x2="${F(w / 2)}" y1="0" y2="0" stroke="${jcol[i]}" stroke-width="6" stroke-dasharray="${i % 2 ? '16 10' : ''}" stroke-linecap="round"/></g>`;
      });
      KEEP.forEach(([v, col, lab, at], i) => {
        const q = ease(seg(u, 2.0 + (i + 9) * 0.16, 2.4 + (i + 9) * 0.16));
        if (q <= 0) return;
        const hi = u > at;
        out += `<line x1="${PX0 + 30}" x2="${F(PX0 + 30 + (PX1 - PX0 - 60) * q)}" y1="${F(Y(v))}" y2="${F(Y(v))}" stroke="${hi ? col : '#C9B9AE'}" stroke-width="${hi ? 7 : 5}"/>`;
        if (hi) out += pill(1430, Y(v) + (i === 2 ? 34 : -28), lab, col, pop(u, at, 0.5), 24);
      });
      if (u > 2.0 && u < 5.4) out += pill(1430, 440, '12 markings', C.pink, pop(u, 2.0, 0.5) * (1 - seg(u, 5.0, 5.4) * 0.999), 26);
      if (u > 9.0) out += pill(960, 945, '3 left, each with a job', C.purple, pop(u, 9.0, 0.6), 26);
      if (u > 20.4) out += pill(960, 1035, 'context, not an entry signal', C.muted, pop(u, 20.4, 0.6), 24);
      // Robot vacuum.
      if (u > 5.0 && u < 9.2) {
        const b = blink(t, 3);
        out += `<g transform="translate(${F(vx)},970)"><ellipse cx="0" cy="22" rx="96" ry="12" fill="${C.dark}" opacity=".1"/>
          <path d="M-90,20 Q-90,-40 0,-44 Q90,-40 90,20 Z" fill="${C.purple}"/><rect x="-92" y="6" width="184" height="18" rx="9" fill="${C.dark}"/>
          <ellipse cx="34" cy="-14" rx="8" ry="${F(11 * (1 - b * 0.9))}" fill="#fff"/><ellipse cx="62" cy="-14" rx="8" ry="${F(11 * (1 - b * 0.9))}" fill="#fff"/>
          <path d="M36,4 Q48,12 60,4" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
          <line x1="-20" y1="-44" x2="-30" y2="-70" stroke="${C.dark}" stroke-width="4"/><circle cx="-30" cy="-74" r="8" fill="${Math.sin(t * 10) > 0 ? C.gold : C.pink}"/>
          ${[0, 1, 2].map(i => { const p = ((t * 3) + i / 3) % 1; return `<circle cx="${F(-100 - p * 60)}" cy="${F(10 - p * 20)}" r="${F(8 - p * 6)}" fill="${C.muted}" opacity="${F(0.5 * (1 - p))}"/>`; }).join('')}</g>`;
      }
      // Girl with the remote.
      const remote = `<g transform="rotate(-20)"><rect x="-12" y="-46" width="24" height="46" rx="6" fill="${C.dark}"/><circle cx="0" cy="-34" r="5" fill="${C.pink}"/></g>`;
      out += P(t, { x: 210, y: 1005, scale: 0.7, look: LK.tech, seed: 4, talk: u > 10.8 && u < 20, frontArm: u > 9.2 && u < 10.6 ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : { a1: -20, a2: -40 }, hold: remote });
      return out;
    },

    /* ================= Lesson 24 ================= */
    // A party: four guests call the same area by four names.
    's6-name-party': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="990" width="1920" height="90" fill="#F6EDE6"/><rect x="0" y="990" width="1920" height="4" fill="#EADFD8"/>`;
      // Garland of lights.
      let d = 'M180,420', bulbs = '';
      for (let i = 0; i <= 20; i++) {
        const x = 180 + i * 78, y = 420 + Math.sin(i / 20 * Math.PI) * 60;
        d += ` L${x},${F(y)}`;
        const on = (Math.floor(t * 3) + i) % 3 !== 0;
        bulbs += `<ellipse cx="${x}" cy="${F(y + 16)}" rx="9" ry="13" fill="${[C.pink, C.gold, C.teal, C.purple][i % 4]}" opacity="${on ? 1 : 0.4}"/>`;
      }
      out += `<path d="${d}" fill="none" stroke="${C.muted}" stroke-width="3"/>${bulbs}`;
      // Cake table and cat.
      out += `<rect x="1700" y="880" width="180" height="16" rx="6" fill="#9B6A45"/><rect x="1712" y="896" width="12" height="94" fill="#9B6A45"/><rect x="1856" y="896" width="12" height="94" fill="#9B6A45"/>
        <rect x="1740" y="830" width="100" height="50" rx="8" fill="${C.pinkL}"/><rect x="1740" y="830" width="100" height="14" rx="6" fill="#fff"/><rect x="1786" y="804" width="8" height="26" fill="${C.purple}"/><ellipse cx="1790" cy="${F(798 + Math.sin(t * 9) * 2)}" rx="6" ry="10" fill="${C.gold}"/>`;
      out += cat(t, 1790, 990, 0.55, { hat: true, col: C.peach, seed: 3, flip: true, look: -1 });
      // The area itself.
      const bk = pop(u, 0.3, 0.8);
      out += about(960, 990, bk, zoneBlob(t, 960, 990, 0.95, { puzzled: u > 11.2 && u < 14.2 }));
      out += pill(960, 650 + 30, 'ONE AREA', C.tealD, pop(u, 0.9, 0.5) * (u < 3.6 ? 1 : 1 - seg(u, 3.6, 4) * 0.999), 26);
      // Guests and their names for it.
      const GU = [
        { x: 330, look: LK.g1, at: 4.0, name: 'Support!', tag: 'SUPPORT', col: C.tealD, flip: false },
        { x: 600, look: LK.g2, at: 5.6, name: 'Demand!', tag: 'DEMAND', col: C.purple, flip: false },
        { x: 1320, look: LK.g3, at: 7.6, name: 'Previous low!', tag: 'PREV LOW', col: C.pink, flip: true },
        { x: 1580, look: LK.g4, at: 9.2, name: 'Discount!', tag: 'DISCOUNT', col: '#E08E2E', flip: true },
      ];
      const tagPos = [[-80, -205], [80, -205], [-80, -150], [80, -150]];
      GU.forEach((g, i) => {
        const enter = pop(u, 1.0 + i * 0.3, 0.6);
        if (enter <= 0) return;
        const talking = u > g.at && u < g.at + 1.4;
        const point = u > 14.2;
        const arm = point || talking ? { a1: aim(g.x, 990, 0.72, g.flip, 960, 840), a2: aim(g.x, 990, 0.72, g.flip, 960, 840) } : { a1: 100, a2: 95 };
        out += about(g.x, 990, enter, P(t, { x: g.x, y: 990, scale: 0.72, look: g.look, flip: g.flip, seed: i + 2, talk: talking, frontArm: arm }));
        if (u > g.at && u < g.at + 3.4) out += A.bubble(g.x + (g.flip ? -30 : 30), 690, g.name, { size: 28, weight: 900, color: g.col, tail: g.flip ? 'right' : 'left', op: clamp((u - g.at) / 0.3) * (1 - seg(u, g.at + 3.0, g.at + 3.4)) });
        // The name tag flies onto the blob.
        const f = seg(u, g.at + 0.6, g.at + 1.4);
        if (f > 0) {
          const [ox, oy] = tagPos[i], tx = 960 + ox * 0.95, ty = 990 + oy * 0.95;
          const x = lerp(g.x, tx, ease(f)), y = lerp(780, ty, ease(f)) - Math.sin(f * Math.PI) * 120;
          out += `<g transform="translate(${F(x)},${F(y)}) rotate(${F((i % 2 ? 6 : -6) + (1 - f) * 200)})"><rect x="-74" y="-24" width="148" height="48" rx="8" fill="#fff" stroke="${g.col}" stroke-width="4"/><rect x="-74" y="-24" width="148" height="12" rx="6" fill="${g.col}"/>
            <text y="16" font-size="20" font-weight="900" text-anchor="middle" fill="${g.col}" font-family="DM Sans">${g.tag}</text></g>`;
        }
      });
      if (u > 11.2 && u < 14.2) out += qmark(960, 690, t, s.start + 11.2, C.purple, 90);
      if (u > 14.2) out += pill(960, 680, 'same price area', C.tealD, pop(u, 14.4, 0.6), 30) + A.sparkle(960, 680, s.start + 14.8, t, C.teal);
      if (u > 18.6) out += pill(960, 560, 'why does it matter to the structure?', C.purple, pop(u, 18.6, 0.6), 30);
      return out;
    },

    // Stickers pile onto a chart until the structure disappears; a fan blows them away.
    's6-sticker-storm': (s, t) => {
      const u = t - s.start;
      let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F6EDE6"/><rect x="0" y="1000" width="1920" height="4" fill="#EADFD8"/>`;
      const BX0 = 520, BX1 = 1400, BY0 = 400, BY1 = 880;
      const bk = pop(u, 0.2, 0.7);
      const X = q => BX0 + 50 + q * (BX1 - BX0 - 100), Y = v => BY1 - 40 - v * (BY1 - BY0 - 80);
      const sw = [[0, .06], [.2, .6], [.38, .3], [.62, .9], [.78, .52], [1, .8]];
      out += about(960, 1000, bk, `<path d="M640,${BY1} L580,1000 M1280,${BY1} L1340,1000" stroke="#9B6A45" stroke-width="14" stroke-linecap="round"/>
        <rect x="${BX0 - 14}" y="${BY0 - 14}" width="${BX1 - BX0 + 28}" height="${BY1 - BY0 + 28}" rx="20" fill="#C9A27A"/>
        <rect x="${BX0}" y="${BY0}" width="${BX1 - BX0}" height="${BY1 - BY0}" rx="10" fill="#fff"/>
        <rect x="${X(0.3)}" y="${F(Y(0.36))}" width="${X(0.7) - X(0.3)}" height="${F(Y(0.24) - Y(0.36))}" rx="8" fill="${C.teal}" opacity=".28"/>
        <polyline points="${drawLine(sw.map(([a, b]) => [X(a), Y(b)]), ease(seg(u, 0.6, 2.2))).d}" fill="none" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`);
      // Stickers.
      const ST = [['Support', C.tealD, 900, 650, -8], ['Demand', C.purple, 1060, 700, 6], ['FVG', C.peach, 780, 600, -4], ['Fib 0.5', C.muted, 1180, 560, 8], ['Fib 0.618', C.muted, 700, 760, -10],
        ['Fib 0.786', C.muted, 1240, 800, 4], ['Previous low', C.pink, 960, 760, -3], ['Order block', '#5E56B8', 840, 520, 7], ['Trendline', '#E08E2E', 1120, 470, -6], ['Discount', C.gold, 660, 470, 5]];
      const AT = [4.0, 4.6, 5.2, 5.6, 6.0, 6.4, 6.8, 7.6, 8.4, 9.0];
      const blowAt = 16.4;
      ST.forEach(([lab, col, tx, ty, rot], i) => {
        const f = seg(u, AT[i], AT[i] + 0.6);
        if (f <= 0) return;
        const b = seg(u, blowAt + i * 0.08, blowAt + i * 0.08 + 1.2);
        if (b >= 1) return;
        let x = lerp(380, tx, ease(f)), y = lerp(760, ty, ease(f)) - Math.sin(f * Math.PI) * 160, r = rot + (1 - f) * -180;
        const slap = f >= 1 ? 1 + 0.25 * Math.max(0, 1 - (u - AT[i] - 0.6) / 0.25) : 1;
        x += b * b * 1400; y -= b * 300 + Math.sin(b * 8 + i) * 40; r += b * 300;
        const w = lab.length * 17 + 46;
        out += `<g transform="translate(${F(x)},${F(y)}) rotate(${F(r)}) scale(${F(slap * 1.15)})" opacity="${F(1 - b)}"><rect x="${-w / 2}" y="-28" width="${w}" height="56" rx="12" fill="${col}" stroke="#fff" stroke-width="4"/>
          <text y="10" font-size="28" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${lab}</text></g>`;
      });
      if (u > 8.4 && u < 17) { const k = ease(seg(u, 8.4, 9.2)) * (1 - seg(u, 16.4, 17)); out += `<line x1="${X(0)}" y1="${Y(0.2)}" x2="${F(lerp(X(0), X(1), k))}" y2="${F(lerp(Y(0.2), Y(0.95), k))}" stroke="#E08E2E" stroke-width="6" opacity="${k}"/>`; }
      if (u > 10.2 && u < 16.2) out += qmark(960, 470, t, s.start + 10.6, C.pink, 120);
      if (u > 10.2 && u < 16.6) out += pill(1650, 470, 'structure?', C.pink, pop(u, 11.4, 0.5) * (1 - seg(u, 16.2, 16.6) * 0.999), 28);
      // Desk fan.
      const fk = pop(u, 15.4, 0.6);
      if (fk > 0) {
        const spin = u > 16 ? t * 1600 : 0;
        out += about(1660, 1000, fk, `<rect x="1640" y="900" width="20" height="100" fill="${C.muted}"/><ellipse cx="1650" cy="1000" rx="60" ry="12" fill="${C.muted}"/>
          <g transform="translate(1650,860)"><circle r="78" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
          <g transform="rotate(${F(spin % 360)})">${[0, 1, 2].map(i => `<ellipse cx="0" cy="-36" rx="18" ry="36" fill="${C.purpleL}" transform="rotate(${i * 120})"/>`).join('')}</g><circle r="12" fill="${C.purple}"/></g>`);
        if (u > 16) for (let i = 0; i < 5; i++) { const p = ((t * 1.6) + i / 5) % 1; out += `<path d="M${F(1560 - p * 700)},${F(700 + i * 60)} q-60,-16 -120,0" fill="none" stroke="${C.purpleL}" stroke-width="5" stroke-linecap="round" opacity="${F(Math.sin(p * Math.PI) * 0.8)}"/>`; }
      }
      if (u > 17.6) out += pill(960, Y(0.3), 'supporting HL · the structural reason', C.tealD, pop(u, 17.6, 0.6), 26) + A.sparkle(960, Y(0.3), s.start + 18, t, C.teal);
      if (u > 20.8) out += pill(960, 945, 'knowing a concept ≠ trading it', C.purple, pop(u, 20.8, 0.6), 30);
      // Kid with stickers, cat that gets dizzy.
      const throwing = u > 3.8 && u < 9.6;
      out += P(t, { x: 300, y: 1000, scale: 0.78, look: LK.artist, seed: 2, mood: u > 10.4 && u < 16 ? 'sad' : undefined, talk: throwing,
        frontArm: throwing ? { a1: -30 + Math.sin(u * 9) * 40, a2: -50 + Math.sin(u * 9) * 40 } : u > 18 ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : { a1: 100, a2: 95 } });
      out += cat(t, 1500, 1000, 0.6, { col: C.purpleL, dark: C.purple, seed: 6, flip: true, dizzy: u > 9.6 && u < 16.4, look: -1 });
      return out;
    },
  };

  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
