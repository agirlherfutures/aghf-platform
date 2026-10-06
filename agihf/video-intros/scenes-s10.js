/**
 * scenes-s10.js: illustrated scene types for Section 10 (Phase 4: Finding Your Bias)
 * lesson intro videos. Every LIVE function is a pure function of t; times inside a
 * scene are written relative to the scene start (r = t - s.start).
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const vis = (t, a, b, d = 0.4) => clamp((t - a) / d) * (b == null ? 1 : 1 - clamp((t - b) / d));
  const TX = { teal: '#2F8A7F', pink: '#C2475F', purple: '#5E56B8', peach: '#B86E12', dark: C.dark };
  const rad = d => d * Math.PI / 180;

  const LK = Object.assign({}, A.LOOKS, {
    f: { skin: '#D9A07A', hair: '#5A3A26', hairStyle: 'short', shirt: C.peach, pants: '#3D3550' },
    g: { skin: '#9C6644', hair: '#2C1810', hairStyle: 'waves', shirt: C.tealD, pants: '#5C4A6E' },
    h: { skin: '#F1C7A5', hair: '#C27A3A', hairStyle: 'bun', shirt: C.purple, pants: '#4A5A78' },
    i: { skin: '#7A4A30', hair: '#1E120C', hairStyle: 'short', shirt: C.gold, pants: '#3D3550' },
    j: { skin: '#C68B62', hair: '#7A5C50', hairStyle: 'puff', shirt: C.pinkL, pants: '#4A5A78' },
    k: { skin: '#E8B48C', hair: '#2C1810', hairStyle: 'waves', shirt: C.tealL, pants: '#5C4A6E' },
  });

  const tw = (text, fs) => [...String(text)].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2000 ? 1.15 : /[A-Z0-9]/.test(ch) ? 0.68 : ch === ' ' ? 0.3 : 0.56), 0) * fs;
  function pill(x, y, text, col, k = 1, fs = 28, fg = '#fff') {
    if (k <= 0) return '';
    const w = tw(text, fs) + 36;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${fg}" font-family="DM Sans">${text}</text></g>`;
  }
  const scl = (x, y, k, svg) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${svg}</g>`;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.fs || 28}" font-weight="${o.w || 900}" text-anchor="${o.anchor || 'middle'}" fill="${o.col || C.dark}" font-family="${o.font || 'DM Sans'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''} opacity="${o.op ?? 1}">${s}</text>`;

  // Multi-line speech card. tail: 'down' | 'left' | 'right' | 'none', tx = tail x offset.
  function card(x, y, lines, o = {}) {
    const k = o.k ?? 1;
    if (k <= 0) return '';
    const fs = o.fs || 26, lh = fs * 1.25;
    const w = o.w || Math.max(...lines.map(l => tw(l, fs))) + 56, h = lines.length * lh + fs * 1.1;
    const fill = o.fill || '#fff', stroke = o.stroke || '#F1E7E1';
    const tx = o.tx ?? 0;
    const tail = o.tail === 'none' ? '' : o.tail === 'left' ? `<path d="M${-w / 2 + 4},${-10} L${-w / 2 - 34},${14} L${-w / 2 + 4},${14}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`
      : o.tail === 'right' ? `<path d="M${w / 2 - 4},${-10} L${w / 2 + 34},${14} L${w / 2 - 4},${14}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`
      : `<path d="M${tx - 18},${h / 2 - 4} L${tx + 4},${h / 2 + 30} L${tx + 22},${h / 2 - 4}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    const cover = o.tail === 'none' ? '' : o.tail === 'left' ? `<rect x="${-w / 2}" y="-12" width="10" height="28" fill="${fill}"/>` : o.tail === 'right' ? `<rect x="${w / 2 - 10}" y="-12" width="10" height="28" fill="${fill}"/>` : `<rect x="${tx - 20}" y="${h / 2 - 8}" width="44" height="10" fill="${fill}"/>`;
    return `<g transform="translate(${x},${y}) scale(${k}) rotate(${o.rot || 0})" opacity="${o.op ?? 1}">${tail}
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(30, h / 2)}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>${cover}
      ${lines.map((l, i) => `<text x="0" y="${-h / 2 + fs * 0.55 + lh * (i + 0.5) + fs * 0.3}" font-size="${fs}" font-weight="${o.weight || 700}" font-style="${o.italic ? 'italic' : 'normal'}" text-anchor="middle" fill="${o.col || C.dark}" font-family="${o.font || 'DM Sans'}">${l}</text>`).join('')}</g>`;
  }

  // Point at fraction k along a polyline, plus the drawn part.
  function along(pts, k) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let d = lens.reduce((a, b) => a + b, 0) * clamp(k);
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) {
        const f = lens[i] ? Math.min(1, d / lens[i]) : 0;
        const x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f);
        return { x, y, seg: i, f, drawn: pts.slice(0, i + 1).concat([[x, y]]) };
      }
      d -= lens[i];
    }
    return { x: pts[0][0], y: pts[0][1], seg: 0, f: 0, drawn: [pts[0]] };
  }
  const poly = (pts, col, w = 8, o = {}) => `<polyline points="${pts.map(p => p.map(F1).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity="${o.op ?? 1}"/>`;
  const F1 = n => Math.round(n * 10) / 10;
  const dot = (x, y, col, r = 10) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="4"/>`;
  const hline = (x0, x1, y, col, o = {}) => `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="${o.w || 5}" stroke-dasharray="${o.dash || '16 10'}" opacity="${o.op ?? 1}" stroke-linecap="round"/>`;
  const check = (x, y, k, col = C.teal, r = 34) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/><path d="M${-r * 0.45},0 L${-r * 0.1},${r * 0.35} L${r * 0.5},${-r * 0.35}" fill="none" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const cross = (x, y, k, col = C.pink, r = 34) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><circle r="${r}" fill="${col}" stroke="#fff" stroke-width="5"/><path d="M${-r * 0.36},${-r * 0.36} L${r * 0.36},${r * 0.36} M${r * 0.36},${-r * 0.36} L${-r * 0.36},${r * 0.36}" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round"/></g>`;
  // Rubber stamp that slams down.
  function stamp(x, y, text, col, t, at, o = {}) {
    const k = clamp((t - at) / 0.35);
    if (k <= 0) return '';
    const sc = lerp(2.2, 1, ease(k)), fs = o.fs || 40, w = tw(text, fs) + 50;
    return `<g transform="translate(${x},${y}) rotate(${o.rot ?? -10}) scale(${sc})" opacity="${Math.min(1, k * 1.6) * (o.op ?? 1)}">
      <rect x="${-w / 2}" y="${-fs * 0.85}" width="${w}" height="${fs * 1.7}" rx="12" fill="${o.fill || 'none'}" stroke="${col}" stroke-width="7"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${col}" font-family="DM Sans" letter-spacing="3">${text}</text></g>`;
  }
  const person = (t, o) => A.person(t, o);
  const popPerson = (t, at, o) => scl(o.x, o.y, pop(t, at, 0.6), A.person(t, o));
  // Head centre of A.person (for hats), matching its bob.
  function headOf(t, o) {
    const s = o.scale || 1, seed = o.seed || 2;
    const bob = o.walking ? Math.abs(Math.sin(t * 9 + seed)) * -6 : Math.sin(t * 2 + seed) * 2;
    return { x: o.x, y: o.y + (bob - 280) * s, s };
  }
  function hat(t, o, kind, col) {
    const h = headOf(t, o), s = h.s;
    if (kind === 'fedora') return `<g transform="translate(${h.x},${h.y}) scale(${s})"><ellipse cx="0" cy="-30" rx="62" ry="12" fill="${col}"/><path d="M-36,-32 L-30,-74 Q0,-86 30,-74 L36,-32 Z" fill="${col}"/><rect x="-35" y="-46" width="70" height="10" fill="${C.dark}" opacity=".5"/></g>`;
    if (kind === 'cap') return `<g transform="translate(${h.x},${h.y}) scale(${o.flip ? -s : s},${s})"><path d="M-40,-24 Q-40,-72 0,-72 Q40,-72 40,-24 Z" fill="${col}"/><path d="M20,-28 L74,-22 L70,-14 L20,-18 Z" fill="${col}"/><circle cx="0" cy="-72" r="6" fill="#fff"/></g>`;
    if (kind === 'helmet') return `<g transform="translate(${h.x},${h.y}) scale(${s})"><path d="M-44,-14 Q-46,-74 0,-76 Q46,-74 44,-14 Z" fill="${col}"/><rect x="-46" y="-20" width="92" height="10" rx="5" fill="${C.dark}" opacity=".4"/></g>`;
    if (kind === 'chef') return `<g transform="translate(${h.x},${h.y}) scale(${s})"><rect x="-32" y="-60" width="64" height="30" fill="#fff" stroke="#EADFD8" stroke-width="3"/><circle cx="-22" cy="-70" r="22" fill="#fff"/><circle cx="0" cy="-80" r="26" fill="#fff"/><circle cx="22" cy="-70" r="22" fill="#fff"/></g>`;
    return '';
  }
  const ground = (y, col = '#F6EDE6', edge = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${col}"/><rect x="0" y="${y}" width="1920" height="4" fill="${edge}"/>`;
  function cloud(x, y, s, op = 1) {
    return `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="0" rx="70" ry="34" fill="#fff"/><ellipse cx="-44" cy="8" rx="44" ry="26" fill="#fff"/><ellipse cx="46" cy="8" rx="48" ry="26" fill="#fff"/><ellipse cx="6" cy="-22" rx="40" ry="30" fill="#fff"/></g>`;
  }

  /* ----------------------------- creatures ----------------------------- */
  function blink(t, seed) { const p = ((t + seed * 1.37) % 3.9) / 3.9; return p > 0.95 ? 0.1 : 1; }
  function cat(t, x, y, s, o = {}) {
    const col = o.col || C.peach, dk = o.dark || '#E08E2E', fl = o.flip ? -1 : 1;
    const sw = Math.sin(t * 3 + (o.seed || 0)) * 18, ey = 7 * blink(t, (o.seed || 0) + 3);
    const run = o.run ? Math.sin(t * 16) * 10 : 0;
    const sleep = o.sleep;
    const eyes = sleep ? `<path d="M40,-92 q8,6 16,0 M66,-92 q8,6 16,0" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="48" cy="-92" rx="5" ry="${ey}" fill="${C.dark}"/><ellipse cx="74" cy="-92" rx="5" ry="${ey}" fill="${C.dark}"/>`;
    return `<g transform="translate(${x},${y}) scale(${s * fl},${s})">
      <path d="M-52,-46 Q-110,${-70 + sw} -96,${-130 + sw * 0.6}" stroke="${col}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <rect x="-42" y="-30" width="14" height="${30 + run * 0.5}" rx="7" fill="${dk}"/><rect x="26" y="-30" width="14" height="${30 - run * 0.5}" rx="7" fill="${dk}"/>
      <ellipse cx="0" cy="-46" rx="62" ry="36" fill="${col}"/>
      <rect x="-24" y="-30" width="14" height="${30 - run * 0.5}" rx="7" fill="${col}"/><rect x="40" y="-30" width="14" height="${30 + run * 0.5}" rx="7" fill="${col}"/>
      <path d="M36,-110 L42,-142 L60,-118 Z M70,-118 L86,-142 L90,-108 Z" fill="${col}"/>
      <circle cx="62" cy="-90" r="34" fill="${col}"/>
      ${eyes}<path d="M58,-80 L66,-80 L62,-75 Z" fill="${C.pink}"/>
      <path d="M50,-78 L24,-82 M50,-74 L26,-70 M74,-78 L100,-82 M74,-74 L98,-70" stroke="${C.dark}" stroke-width="2" opacity=".5"/>
      <path d="M-30,-70 Q-20,-60 -30,-50 M-8,-78 Q2,-66 -8,-54" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>
    </g>${sleep ? [0, 1].map(i => { const p = ((t * 0.6) + i * 0.5) % 1; return `<text x="${x + fl * s * (96 + p * 30)}" y="${y + s * (-130 - p * 50)}" font-size="${(26 + i * 8) * s * 1.4}" font-weight="900" fill="${C.purple}" opacity="${1 - p}" font-family="DM Sans">z</text>`; }).join('') : ''}`;
  }
  function bird(t, x, y, s, o = {}) {
    const col = o.col || C.teal, fl = o.flip ? -1 : 1, flap = o.fly ? Math.sin(t * 18) * 40 : Math.sin(t * 3) * 6;
    const hop = o.hop ? -Math.abs(Math.sin(t * 5)) * 14 : 0;
    return `<g transform="translate(${x},${y + hop}) scale(${s * fl},${s})">
      <path d="M-30,-20 L-58,-30 L-52,-12 Z" fill="${col}"/>
      <ellipse cx="0" cy="-22" rx="32" ry="24" fill="${col}"/>
      <circle cx="22" cy="-42" r="17" fill="${col}"/>
      <path d="M36,-44 L54,-40 L36,-36 Z" fill="${C.gold}"/>
      <circle cx="26" cy="-46" r="4" fill="${C.dark}"/>
      <path d="M-8,-26 Q-26,${-40 - flap} -40,${-30 - flap * 0.8} Q-20,-14 -8,-18 Z" fill="${o.wing || C.tealD}"/>
      ${o.fly ? '' : `<path d="M-6,0 L-6,8 M8,0 L8,8" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`}
    </g>`;
  }
  function dog(t, x, y, s, o = {}) {
    const col = o.col || '#C9A27A', dk = o.dark || '#9B6A45', fl = o.flip ? -1 : 1;
    const wag = Math.sin(t * (o.happy ? 16 : 6)) * 22, run = o.run ? Math.sin(t * 14) * 10 : 0;
    const ey = 6 * blink(t, 5);
    return `<g transform="translate(${x},${y}) scale(${s * fl},${s})">
      <path d="M-50,-56 Q-74,${-80 - wag * 0.4} ${-70 + wag * 0.3},-100" stroke="${col}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <rect x="-44" y="-36" width="16" height="${36 + run}" rx="7" fill="${dk}"/><rect x="24" y="-36" width="16" height="${36 - run}" rx="7" fill="${dk}"/>
      <ellipse cx="0" cy="-54" rx="58" ry="30" fill="${col}"/>
      <rect x="-26" y="-36" width="16" height="${36 - run}" rx="7" fill="${col}"/><rect x="38" y="-36" width="16" height="${36 + run}" rx="7" fill="${col}"/>
      <circle cx="58" cy="-94" r="30" fill="${col}"/>
      <ellipse cx="84" cy="-86" rx="18" ry="13" fill="#E8D2BC"/><circle cx="96" cy="-90" r="7" fill="${C.dark}"/>
      <ellipse cx="62" cy="-102" rx="5" ry="${ey}" fill="${C.dark}"/>
      <path d="M40,-118 Q22,-110 30,-74 Q42,-84 48,-110 Z" fill="${dk}"/>
      ${o.happy ? `<path d="M80,-76 Q86,-62 92,-76" fill="${C.pink}"/>` : ''}
    </g>`;
  }
  function robot(t, x, y, s, o = {}) {
    const b = 0.5 + 0.5 * Math.sin(t * 5), bob = Math.sin(t * 2.2) * 4, ey = 18 * blink(t, 7);
    const talk = o.talk ? Math.abs(Math.sin(t * 12)) : 0;
    const face = o.happy ? `<path d="M-40,-356 l14,-14 l14,14 M14,-356 l14,-14 l14,14" stroke="${C.tealL}" stroke-width="7" fill="none" stroke-linecap="round"/>`
      : `<rect x="-42" y="${-362 - ey / 2}" width="24" height="${ey}" rx="6" fill="${C.tealL}"/><rect x="18" y="${-362 - ey / 2}" width="24" height="${ey}" rx="6" fill="${C.tealL}"/>`;
    const armR = o.armUp ? `<path d="M60,-230 L104,-290 L120,-350" stroke="${C.purple}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="120" cy="-356" r="14" fill="${C.purpleL}"/>`
      : `<path d="M60,-230 L100,-180 L120,-140" stroke="${C.purple}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="122" cy="-134" r="14" fill="${C.purpleL}"/>`;
    return `<g transform="translate(${x},${y}) scale(${o.flip ? -s : s},${s})"><g transform="translate(0,${bob})">
      <rect x="-40" y="-110" width="22" height="110" rx="10" fill="${C.muted}"/><rect x="18" y="-110" width="22" height="110" rx="10" fill="${C.muted}"/>
      <ellipse cx="-29" cy="0" rx="26" ry="10" fill="${C.dark}"/><ellipse cx="29" cy="0" rx="26" ry="10" fill="${C.dark}"/>
      <path d="M-60,-230 L-100,-180 L-118,-140" stroke="${C.purple}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-120" cy="-134" r="14" fill="${C.purpleL}"/>
      <rect x="-64" y="-262" width="128" height="160" rx="26" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
      <circle cx="0" cy="-196" r="22" fill="#fff" stroke="${C.purple}" stroke-width="5"/><circle cx="0" cy="-196" r="9" fill="${o.light || C.gold}" opacity="${0.5 + b * 0.5}"/>
      ${armR}
      <rect x="-12" y="-282" width="24" height="24" fill="${C.muted}"/>
      <line x1="0" y1="-420" x2="0" y2="-456" stroke="${C.muted}" stroke-width="6"/><circle cx="0" cy="-462" r="11" fill="${C.pink}" opacity="${0.5 + b * 0.5}"/>
      <rect x="-80" y="-422" width="160" height="142" rx="28" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="-64" y="-406" width="128" height="110" rx="18" fill="#3D3550"/>
      ${face}
      <rect x="-22" y="${-326 - talk * 6}" width="44" height="${6 + talk * 12}" rx="5" fill="${C.pinkL}"/>
    </g></g>`;
  }
  // Candle with a face. (x, y) = feet. h = body height.
  function candleGuy(t, x, y, s, o = {}) {
    const col = o.up === false ? C.pink : C.teal, h = o.h || 120, bob = Math.sin(t * 3 + (o.seed || 0)) * 3;
    const ey = 8 * blink(t, (o.seed || 0) + 2), talk = o.talk ? Math.abs(Math.sin(t * 11)) : 0;
    const legs = o.walk ? Math.sin(t * 12) * 10 : 0;
    const top = -40 - h;
    const mouth = o.mood === 'sad' ? `<path d="M-12,${top + h * 0.62} Q0,${top + h * 0.54} 12,${top + h * 0.62}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : talk > 0.1 ? `<ellipse cx="0" cy="${top + h * 0.58}" rx="9" ry="${3 + talk * 7}" fill="#6B2A2A"/>`
      : `<path d="M-12,${top + h * 0.55} Q0,${top + h * 0.66} 12,${top + h * 0.55}" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x},${y}) scale(${s})"><g transform="translate(0,${bob})">
      <line x1="-14" y1="-40" x2="${-20 - legs}" y2="0" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/><line x1="14" y1="-40" x2="${20 + legs}" y2="0" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
      <line x1="0" y1="${top - (o.wickUp || 30)}" x2="0" y2="${top}" stroke="${col}" stroke-width="8" stroke-linecap="round"/>
      <rect x="-40" y="${top}" width="80" height="${h}" rx="14" fill="${col}"/>
      ${o.arms === 'up' ? `<path d="M-40,${top + 40} L-74,${top - 6} M40,${top + 40} L74,${top - 6}" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>` : `<path d="M-40,${top + 50} L-62,${top + 84} M40,${top + 50} L62,${top + 84}" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>`}
      <circle cx="-14" cy="${top + h * 0.34}" r="9" fill="#fff"/><circle cx="14" cy="${top + h * 0.34}" r="9" fill="#fff"/>
      <ellipse cx="-13" cy="${top + h * 0.34}" rx="4.5" ry="${ey * 0.6}" fill="${C.dark}"/><ellipse cx="15" cy="${top + h * 0.34}" rx="4.5" ry="${ey * 0.6}" fill="${C.dark}"/>
      ${mouth}
      ${o.sash ? `<path d="M-40,${top + h * 0.72} L40,${top + h * 0.84} L40,${top + h * 0.96} L-40,${top + h * 0.84} Z" fill="${o.sash}"/>` : ''}
    </g></g>`;
  }
  function fish(t, x, y, s, o = {}) {
    const col = o.col || C.peach, fl = o.flip ? -1 : 1, wig = Math.sin(t * 10) * 12;
    return `<g transform="translate(${x},${y}) scale(${s * fl},${s}) rotate(${o.rot || 0})">
      <path d="M-40,0 L-74,${-26 + wig} L-74,${26 + wig} Z" fill="${o.fin || C.pink}"/>
      <ellipse cx="0" cy="0" rx="48" ry="30" fill="${col}"/>
      <path d="M-6,-28 Q8,-50 22,-26 Z" fill="${o.fin || C.pink}"/>
      <circle cx="24" cy="-6" r="9" fill="#fff"/><circle cx="26" cy="-6" r="5" fill="${C.dark}"/>
      <path d="M40,8 Q34,12 30,8" stroke="${C.dark}" stroke-width="3" fill="none"/>
      <path d="M-10,-18 Q0,0 -10,18" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/>
    </g>`;
  }
  function owl(t, x, y, s, o = {}) {
    const ey = 14 * blink(t, 9), tilt = Math.sin(t * 1.4) * 8;
    return `<g transform="translate(${x},${y}) scale(${s}) rotate(${tilt})">
      <ellipse cx="0" cy="-60" rx="48" ry="60" fill="${o.col || C.purple}"/>
      <ellipse cx="0" cy="-44" rx="30" ry="36" fill="${C.purpleL}"/>
      <path d="M-40,-110 L-30,-136 L-14,-114 Z M40,-110 L30,-136 L14,-114 Z" fill="${o.col || C.purple}"/>
      <circle cx="-20" cy="-84" r="18" fill="#fff"/><circle cx="20" cy="-84" r="18" fill="#fff"/>
      <ellipse cx="-20" cy="-84" rx="8" ry="${ey * 0.6}" fill="${C.dark}"/><ellipse cx="20" cy="-84" rx="8" ry="${ey * 0.6}" fill="${C.dark}"/>
      <path d="M-7,-68 L7,-68 L0,-56 Z" fill="${C.gold}"/>
      <path d="M-14,0 L-14,8 M14,0 L14,8" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>
    </g>`;
  }
  function chicken(t, x, y, s, o = {}) {
    const peck = o.peck ? Math.max(0, Math.sin(t * 5)) * 26 : 0, fl = o.flip ? -1 : 1;
    return `<g transform="translate(${x},${y}) scale(${s * fl},${s})">
      <path d="M-6,0 L-6,-30 M10,0 L10,-30" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>
      <path d="M-50,-60 L-74,-90 L-60,-50 Z" fill="#F3E3D7"/>
      <ellipse cx="0" cy="-56" rx="50" ry="36" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <g transform="rotate(${peck} 30 -70)"><circle cx="40" cy="-96" r="22" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
      <path d="M30,-118 q6,-14 12,0 q6,-14 12,0 Z" fill="${C.pink}"/><path d="M60,-98 L76,-92 L60,-86 Z" fill="${C.gold}"/>
      <circle cx="46" cy="-100" r="4" fill="${C.dark}"/><path d="M58,-82 q4,10 -4,10" fill="${C.pink}"/></g>
      <path d="M-14,-62 Q0,-44 18,-60" stroke="#EADFD8" stroke-width="5" fill="none"/>
    </g>`;
  }

  const LIVE = {};

  // Hand position of A.person's front arm (ignores the tiny idle bob).
  function handOf(o) {
    const s = o.scale || 1, fl = o.flip ? -1 : 1, a = o.frontArm || { a1: 100, a2: 95 };
    return { x: o.x + fl * s * (18 + Math.cos(rad(a.a1)) * 58 + Math.cos(rad(a.a2)) * 54), y: o.y + s * (-196 + Math.sin(rad(a.a1)) * 58 + Math.sin(rad(a.a2)) * 54) };
  }
  const magnifier = `<g transform="rotate(-30)"><line x1="0" y1="0" x2="40" y2="0" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/><circle cx="70" cy="0" r="30" fill="#fff" fill-opacity=".35" stroke="${C.dark}" stroke-width="7"/></g>`;

  /* ================= Lesson 1 · What Is Directional Bias? ================= */

  // Game show: three contestants, three statements, one useful bias.
  LIVE['s10-game-show'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="360" width="1920" height="720" fill="#FFF6F0"/>`;
    for (let i = 0; i < 25; i++) { const on = (Math.floor(r * 4) + i) % 3 === 0; out += `<circle cx="${60 + i * 75}" cy="384" r="9" fill="${on ? C.gold : '#F3E3D7'}"/>`; }
    // Curtains.
    [[0, 1], [1920, -1]].forEach(([x0, d]) => {
      for (let k = 0; k < 3; k++) {
        const sw = Math.sin(r * 1.3 + k) * 6;
        out += `<path d="M${x0 + d * k * 46},400 L${x0 + d * (k * 46 + 50)},400 Q${x0 + d * (k * 46 + 60 + sw)},700 ${x0 + d * (k * 46 + 44)},1080 L${x0 + d * k * 46},1080 Z" fill="${k % 2 ? C.pinkL : C.pink}"/>`;
      }
    });
    out += `<rect x="0" y="940" width="1920" height="140" fill="#F3E3D7"/><rect x="0" y="940" width="1920" height="4" fill="#EADFD8"/>`;
    const P = [400, 840, 1280];
    const win = [[3.4, 8.2], [8.5, 14], [14.2, 19.4]];
    const looks = [LK.c, LK.h, LK.i];
    const labels = [['OBSERVATION', C.teal], ['THESIS', C.purple], ['PREDICTION', C.pink]];
    const cards = [['“The 4H is', 'progressing higher.”'], ['“Bullish, unless price', 'changes the story.”'], ['“DEFINITELY 21,000', 'today!”']];
    const V = 19.6;
    P.forEach((x, i) => {
      const speaking = r >= win[i][0] && r < win[i][1];
      out += `<polygon points="${x - 40},400 ${x + 40},400 ${x + 190},940 ${x - 190},940" fill="#FFF3C4" opacity="${0.25 + (speaking ? 0.45 : 0)}"/>`;
    });
    P.forEach((x, i) => {
      const k = pop(t, s.start + 0.4 + i * 0.25, 0.6);
      if (k <= 0) return;
      const speaking = r >= win[i][0] && r < win[i][1];
      const wave = i === 2 && speaking ? { a1: -70 + Math.sin(t * 9) * 18, a2: -110 + Math.sin(t * 9) * 20 } : i === 1 && r > win[1][0] ? { a1: -40, a2: -85 } : undefined;
      let g = person(t, { x, y: 900, scale: 0.9, look: looks[i], seed: i * 2 + 1, talk: ctx.talking && speaking, frontArm: wave, mood: i === 2 && r > V + 0.4 ? 'sad' : undefined, flip: i === 2 });
      g += `<rect x="${x - 140}" y="790" width="280" height="22" rx="10" fill="${C.purple}"/>
        <path d="M${x - 124},812 L${x + 124},812 L${x + 110},1000 L${x - 110},1000 Z" fill="#fff" stroke="${C.purpleL}" stroke-width="5"/>
        <circle cx="${x}" cy="784" r="16" fill="${r > V ? (i === 1 ? C.teal : i === 2 ? C.pink : C.peachL) : C.pinkL}"/>`;
      const lk = pop(t, s.start + win[i][0] + 0.6, 0.5);
      if (lk > 0) g += pill(x, 900, labels[i][0], labels[i][1], lk, 30);
      out += scl(x, 1000, k, g);
      const ck = clamp((r - win[i][0]) / 0.35);
      if (ck > 0) out += card(x, 485, cards[i], { k: back(ck), fs: 26, op: r > win[i][1] && r < V ? 0.7 : 1, tx: i === 2 ? 30 : 0, italic: true, font: 'Playfair Display' });
    });
    // Verdict.
    if (r > V) {
      out += pill(400, 1030, 'evidence', C.teal, pop(t, s.start + V + 0.2), 24) + pill(840, 1030, '✓ useful bias', C.purple, pop(t, s.start + V), 26) + pill(1280, 1030, '✗ certainty', C.pink, pop(t, s.start + V + 0.4), 24);
      out += check(990, 820, pop(t, s.start + V, 0.5), C.teal, 30) + cross(1430, 820, pop(t, s.start + V + 0.4, 0.5), C.pink, 30);
      out += A.sparkle(840, 560, s.start + V, t);
    }
    // Robot host.
    const rk = pop(t, s.start + 0.2, 0.7);
    out += scl(1690, 1010, rk, robot(t, 1690, 1010, 0.92, { talk: ctx.talking && (r < 3.3 || r > V), armUp: r > V, happy: r > V, light: r > V ? C.teal : C.gold }));
    return out;
  };

  // Detective's corkboard: seven questions pinned around the thesis; the feeling balloon pops.
  LIVE['s10-corkboard'] = (s, t, ctx) => {
    const r = t - s.start;
    const bp = pop(t, s.start + 0.3, 0.7);
    if (bp <= 0) return '';
    const cx = 960, cy = 675;
    let board = `<rect x="520" y="390" width="880" height="570" rx="18" fill="#E8C9A0" stroke="#B98A5E" stroke-width="18"/>`;
    for (let i = 0; i < 60; i++) board += `<circle cx="${545 + (i * 137) % 830}" cy="${410 + (i * 89) % 530}" r="3" fill="#C9A27A" opacity=".6"/>`;
    let out = scl(960, 675, bp, board);
    const Q = ['Structure?', 'Location?', 'Key swing?', 'Attempting?', 'Supports?', 'Weakens?', 'Invalidates?'];
    const pos = Q.map((q, i) => { const a = rad(-90 + i * 360 / 7); return [cx + Math.cos(a) * 312, cy + Math.sin(a) * 205]; });
    // Strings first, then the cards on top.
    Q.forEach((q, i) => {
      const at = 3.8 + i * 1.3, k = ease(seg(r, at + 0.2, at + 0.8));
      if (k <= 0) return;
      out += `<line x1="${cx}" y1="${cy}" x2="${lerp(cx, pos[i][0], k)}" y2="${lerp(cy, pos[i][1], k)}" stroke="${C.pink}" stroke-width="4"/>`;
    });
    const tk = pop(t, s.start + 1.4, 0.6);
    if (tk > 0) out += `<g transform="translate(${cx},${cy}) scale(${tk})"><rect x="-120" y="-44" width="240" height="88" rx="10" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
      <text y="14" font-size="42" font-weight="700" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">THESIS</text><circle cx="0" cy="-44" r="10" fill="${C.pink}"/></g>`;
    Q.forEach((q, i) => {
      const at = 3.8 + i * 1.3, k = pop(t, s.start + at, 0.5);
      if (k <= 0) return;
      const last = i === 6, glow = last && r > 19.4 ? 0.5 + 0.5 * Math.sin(r * 6) : 0;
      out += `<g transform="translate(${pos[i][0]},${pos[i][1]}) scale(${k * (1 + glow * 0.06)}) rotate(${(i % 2 ? 3 : -3)})">
        <rect x="-104" y="-32" width="208" height="64" rx="8" fill="${last ? C.pinkP : '#FFFBE6'}" stroke="${last ? C.pink : '#EADFD8'}" stroke-width="${last ? 4 + glow * 3 : 3}"/>
        <text y="9" font-size="25" font-weight="900" text-anchor="middle" fill="${last ? TX.pink : C.dark}" font-family="DM Sans">${q}</text>
        <circle cx="0" cy="-32" r="9" fill="${C.pink}"/></g>`;
    });
    // Detective with a magnifier.
    const det = { x: 300, y: 1010, scale: 1, look: LK.f, seed: 4, frontArm: { a1: -20 + Math.sin(r * 1.4) * 6, a2: -30 }, hold: magnifier, talk: false };
    out += scl(300, 1010, pop(t, s.start + 0.8, 0.6), person(t, det) + hat(t, det, 'fedora', '#9B6A45'));
    // Kid with the feeling balloon.
    const kx = lerp(2060, 1660, ease(seg(r, 12.6, 14.6)));
    const kid = { x: kx, y: 1010, scale: 0.85, look: LK.j, seed: 6, flip: true, walking: r > 12.6 && r < 14.6, frontArm: r < 16.2 ? { a1: -60, a2: -85 } : { a1: 100, a2: 95 } };
    if (r > 12.4) {
      out += person(t, kid);
      const h = handOf(kid);
      const heart = (x, y, sc, op = 1) => `<g transform="translate(${x},${y}) scale(${sc})" opacity="${op}"><path d="M0,44 C-90,-14 -74,-104 0,-60 C74,-104 90,-14 0,44 Z" fill="${C.pink}" stroke="#E46F89" stroke-width="4"/>
        <text y="-28" font-size="24" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">I feel</text><text y="2" font-size="24" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">bullish</text></g>`;
      const rel = ease(seg(r, 16.2, 18.2));
      const hx0 = h.x - 10 + Math.sin(r * 2) * 12, hy0 = h.y - 210;
      const bx = rel > 0 ? lerp(1640, 1345, rel) + Math.sin(r * 3) * 10 : hx0, by = rel > 0 ? lerp(hy0, 520, rel) : hy0;
      if (r < 18.3) {
        out += `<path d="M${rel > 0 ? bx : h.x},${rel > 0 ? by + 140 : h.y} Q${bx + 20},${by + 100} ${bx},${by + 44}" stroke="${C.muted}" stroke-width="3" fill="none"/>` + heart(bx, by, 1);
      } else {
        const p = clamp((r - 18.3) / 0.8);
        if (p < 1) out += Array.from({ length: 10 }, (_, i) => { const a = rad(i * 36), d = 30 + ease(p) * 90; return `<line x1="${bx + Math.cos(a) * d * 0.5}" y1="${by + Math.sin(a) * d * 0.5}" x2="${bx + Math.cos(a) * d}" y2="${by + Math.sin(a) * d}" stroke="${C.pink}" stroke-width="7" stroke-linecap="round" opacity="${1 - p}"/>`; }).join('') +
          txt(bx, by + 14, 'POP!', { fs: 54 * (0.6 + 0.4 * back(p * 2)), col: TX.pink, font: 'Playfair Display', op: 1 - p });
      }
    }
    if (r > 19.2) out += pill(960, 1022, 'feelings can’t be invalidated', C.pink, pop(t, s.start + 19.2), 26);
    return out;
  };

  /* ================= Lesson 2 · The 4H Tells the Bigger Story ================= */

  // Hot-air balloon: the higher you rise, the quieter the chart gets.
  LIVE['s10-balloon-zoom'] = (s, t, ctx) => {
    const r = t - s.start;
    const z = ease(seg(r, 3.5, 10));
    let out = `<rect x="0" y="360" width="1920" height="720" fill="#F2FAF9"/>`;
    [[0.3, 520, 0.9], [0.17, 640, 0.7], [0.23, 450, 0.6]].forEach(([sp, y, sc], i) => { const x = ((r * 40 * sp * 3 + i * 700) % 2300) - 200; out += cloud(x, y + z * 120 * (i + 1) * 0.5, sc, 0.9); });
    out += `<path d="M0,1000 Q300,940 600,990 T1200,980 T1920,990 L1920,1080 L0,1080 Z" fill="${C.tealL}"/><path d="M0,1030 Q400,990 800,1030 T1920,1030 L1920,1080 L0,1080 Z" fill="#9FD8D0"/>`;
    // Altitude ruler.
    const ticks = [['1m', 980], ['5m', 845], ['15m', 710], ['1H', 575], ['4H', 440]];
    const tf = Math.min(4, Math.floor(z * 4.999));
    out += `<line x1="120" y1="440" x2="120" y2="980" stroke="${C.muted}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
    ticks.forEach(([l, y], i) => { out += `<line x1="104" x2="136" y1="${y}" y2="${y}" stroke="${C.muted}" stroke-width="5" opacity=".5"/>` + txt(176, y + 9, l, { fs: 26, col: i === tf ? TX.purple : C.muted, anchor: 'middle' }); });
    // Balloon.
    const by = lerp(990, 770, z), bx = 470 + Math.sin(r * 0.9) * 14;
    const ym = lerp(980, 440, z);
    out += `<polygon points="100,${ym} 78,${ym - 14} 78,${ym + 14}" fill="${C.purple}"/>`;
    const pilot = { x: bx, y: by - 6, scale: 0.42, look: LK.c, seed: 3, frontArm: z >= 1 ? { a1: -60, a2: -100 + Math.sin(t * 8) * 12 } : { a1: 20, a2: 60 } };
    out += `<g>${[-48, -16, 16, 48].map(dx => `<line x1="${bx + dx * 0.6}" y1="${by - 50}" x2="${bx + dx * 1.7}" y2="${by - 170}" stroke="#9B6A45" stroke-width="3"/>`).join('')}
      <path d="M${bx},${by - 380} C${bx + 140},${by - 380} ${bx + 140},${by - 230} ${bx + 46},${by - 168} L${bx - 46},${by - 168} C${bx - 140},${by - 230} ${bx - 140},${by - 380} ${bx},${by - 380} Z" fill="${C.pink}"/>
      <path d="M${bx},${by - 380} C${bx + 50},${by - 370} ${bx + 50},${by - 230} ${bx + 18},${by - 168} L${bx - 18},${by - 168} C${bx - 50},${by - 230} ${bx - 50},${by - 370} ${bx},${by - 380} Z" fill="${C.peachL}"/>
      <rect x="${bx - 50}" y="${by - 168}" width="100" height="14" rx="6" fill="#9B6A45"/></g>` + person(t, pilot) +
      `<rect x="${bx - 48}" y="${by - 56}" width="96" height="58" rx="10" fill="#C9A27A" stroke="#9B6A45" stroke-width="5"/><line x1="${bx - 44}" x2="${bx + 44}" y1="${by - 36}" y2="${by - 36}" stroke="#9B6A45" stroke-width="3"/>`;
    // Birds flying past.
    [[5.5, 640], [15.5, 520]].forEach(([at, y], i) => { const k = seg(r, at, at + 6); if (k > 0 && k < 1) out += bird(t, lerp(2000, -120, k), y + Math.sin(r * 3 + i) * 20, 0.8, { fly: true, flip: true, col: i ? C.peach : C.teal, wing: i ? '#E08E2E' : C.tealD }); });
    // The chart view.
    const pk = pop(t, s.start + 0.3, 0.7);
    if (pk > 0) {
      const x0 = 760, x1 = 1780, y0 = 410, y1 = 990, X = u => 800 + u * 940, Y = v => 940 - v * 450;
      const sw = [[0, 0.3], [0.12, 0.85], [0.25, 0.4], [0.36, 0.62], [0.47, 0.16], [0.6, 0.7], [0.7, 0.45], [0.8, 0.6], [0.9, 0.36], [1, 0.52]];
      const base = u => { for (let i = 0; i < sw.length - 1; i++) if (u <= sw[i + 1][0]) { const f = (u - sw[i][0]) / (sw[i + 1][0] - sw[i][0]); return lerp(sw[i][1], sw[i + 1][1], f); } return sw[sw.length - 1][1]; };
      const amp = 0.16 * Math.pow(1 - z, 1.4);
      const pts = [];
      for (let i = 0; i <= 260; i++) { const u = i / 260; pts.push([X(u), Y(base(u) + amp * (Math.sin(u * 97 + 1) * 0.5 + Math.sin(u * 233 + r * 3) * 0.35 + Math.sin(u * 517 - r * 5) * 0.25))]); }
      let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>` + poly(pts, z > 0.95 ? C.purple : C.muted, 3 + z * 4);
      g += pill(870, 452, ['1-minute', '5-minute', '15-minute', '1H', '4H'][tf], tf === 4 ? C.purple : C.peach, 1, 26);
      if (r < 4) g += txt(1500, 462, 'noise everywhere', { fs: 26, col: C.muted, w: 700 });
      const dk = ease(seg(r, 12.4, 13.6));
      if (dk > 0) {
        g += hline(X(0.12), lerp(X(0.12), X(1), dk), Y(0.85), C.purple, { w: 6 }) + hline(X(0.47), lerp(X(0.47), X(1), dk), Y(0.16), C.purple, { w: 6 });
        g += pill(1520, Y(0.85) - 36, '🚪 EXTERNAL HIGH', C.purple, pop(t, s.start + 13.2), 26) + pill(1520, Y(0.16) + 38, '🚪 EXTERNAL LOW', C.purple, pop(t, s.start + 14.6), 26);
      }
      if (r > 18.2) {
        [6, 7, 8].forEach((i, j) => { const q = pop(t, s.start + 18.2 + j * 0.3, 0.5); if (q > 0) g += scl(X(sw[i][0]), Y(sw[i][1]), q, dot(X(sw[i][0]), Y(sw[i][1]), C.peach, 12)); });
        g += pill(X(0.8), Y(0.27), 'furniture 🛋', C.peach, pop(t, s.start + 19.2), 24);
      }
      out += scl(1270, 700, pk, g);
    }
    if (z >= 1) out += A.sparkle(bx, by - 300, s.start + 10, t);
    return out;
  };

  // Dark room, flashlight: furniture shows up first, but you are looking for the doors.
  LIVE['s10-flashlight'] = (s, t, ctx) => {
    const r = t - s.start;
    const rk = pop(t, s.start + 0.3, 0.7);
    if (rk <= 0) return '';
    const X0 = 280, X1 = 1640, Y0 = 400, Y1 = 980;
    let room = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="20" fill="#FFF6F0"/>
      <rect x="${X0}" y="900" width="${X1 - X0}" height="80" fill="#F3E3D7"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<rect x="${X0 + 20 + i * 150}" y="440" width="70" height="440" fill="${C.pinkP}" opacity=".5"/>`).join('')}`;
    // Top door (ceiling hatch with a ladder) and bottom door (trapdoor).
    room += `<rect x="1170" y="${Y0 - 6}" width="140" height="30" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/><circle cx="1240" cy="${Y0 + 9}" r="6" fill="${C.purple}"/>
      <g stroke="#9B6A45" stroke-width="8" stroke-linecap="round"><line x1="1200" y1="430" x2="1200" y2="900"/><line x1="1280" y1="430" x2="1280" y2="900"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="1200" x2="1280" y1="${470 + i * 64}" y2="${470 + i * 64}"/>`).join('')}</g>
      <rect x="1010" y="924" width="160" height="36" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/><circle cx="1150" cy="942" r="6" fill="${C.purple}"/>`;
    // Furniture.
    room += `<g transform="translate(700,900)"><rect x="-150" y="-70" width="300" height="70" rx="24" fill="${C.teal}"/><rect x="-170" y="-110" width="50" height="110" rx="18" fill="${C.tealL}"/><rect x="120" y="-110" width="50" height="110" rx="18" fill="${C.tealL}"/><rect x="-120" y="-130" width="240" height="70" rx="20" fill="${C.tealL}"/></g>
      <g transform="translate(960,600)"><rect x="-90" y="-64" width="180" height="128" rx="8" fill="#fff" stroke="${C.peach}" stroke-width="10"/><path d="M-66,40 L-20,-6 L12,24 L36,2 L66,40 Z" fill="${C.tealL}"/><circle cx="38" cy="-26" r="13" fill="${C.peachL}"/></g>
      <g transform="translate(1440,900)"><path d="M-36,0 L36,0 L28,-60 L-28,-60 Z" fill="${C.pink}"/><path d="M0,-60 Q-40,-120 -10,-170 Q10,-120 0,-60 M0,-60 Q40,-130 20,-180 Q0,-120 0,-60" fill="${C.tealD}"/></g>
      <g transform="translate(1560,900)"><rect x="-6" y="-200" width="12" height="200" fill="${C.dark}"/><path d="M-50,-200 L50,-200 L32,-270 L-32,-270 Z" fill="${C.peachL}"/></g>`;
    const lo = ease(seg(r, 19, 19.8));
    // Flashlight holder and aim.
    const hx = lerp(300, 400, ease(seg(r, 0.6, 2)));
    const keys = [[0, 700, 880], [3.6, 700, 860], [5.0, 960, 600], [6.6, 1440, 820], [8.6, 1440, 820], [9.6, 1240, 410], [12.4, 1240, 410], [13.4, 1090, 940], [99, 1090, 940]];
    let k = 0; while (k < keys.length - 2 && r > keys[k + 1][0]) k++;
    const f = ease(seg(r, keys[k][0], keys[k + 1][0]));
    const tx = lerp(keys[k][1], keys[k + 1][1], f), ty = lerp(keys[k][2], keys[k + 1][2], f);
    const sh = { x: hx + 18 * 0.95, y: 960 - 196 * 0.95 };
    const aim = Math.atan2(ty - sh.y, tx - sh.x) * 180 / Math.PI;
    const holder = { x: hx, y: 960, scale: 0.95, look: LK.h, seed: 2, walking: r > 0.6 && r < 2, frontArm: { a1: aim, a2: aim }, talk: ctx.talking && r > 17.2 && r < 19 };
    const hand = handOf(holder);
    const on = r > 2.2 && lo < 1;
    const half = rad(13), L = 1800, a = rad(aim);
    const beam = `${hand.x},${hand.y} ${hand.x + Math.cos(a - half) * L},${hand.y + Math.sin(a - half) * L} ${hand.x + Math.cos(a + half) * L},${hand.y + Math.sin(a + half) * L}`;
    let out = `<defs><mask id="s10-fl-mask"><rect x="0" y="0" width="1920" height="1080" fill="#fff"/>${on ? `<polygon points="${beam}" fill="#000"/>` : ''}</mask>
      <clipPath id="s10-fl-clip"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="20"/></clipPath></defs>`;
    let lit = room;
    lit += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="#2C1810" opacity="${0.88 * (1 - lo)}" mask="url(#s10-fl-mask)"/>`;
    if (on) lit += `<polygon points="${beam}" fill="#FFF3C4" opacity=".28"/>`;
    out += scl(960, 690, rk, `<g clip-path="url(#s10-fl-clip)">${lit}</g><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="20" fill="none" stroke="${C.dark}" stroke-width="8"/>`);
    // Labels as the beam finds things.
    if (r > 4) out += pill(700, 742, 'furniture', C.teal, pop(t, s.start + 4), 22);
    if (r > 7.2) out += pill(1500, 650, 'furniture', C.peach, pop(t, s.start + 7.2), 22);
    if (r > 10.1) out += pill(1240, 470, '🚪 EXTERNAL HIGH', C.purple, pop(t, s.start + 10.1), 28);
    if (r > 13.8) out += pill(1090, 1024, '🚪 EXTERNAL LOW', C.purple, pop(t, s.start + 13.8), 28);
    // Flashlight body.
    out += person(t, holder) + `<g transform="translate(${hand.x},${hand.y}) rotate(${aim})"><rect x="-10" y="-11" width="50" height="22" rx="6" fill="${C.dark}"/><rect x="36" y="-15" width="14" height="30" rx="4" fill="${C.gold}"/></g>`;
    // Friend rushing to the couch.
    if (r > 14.6) {
      const fx = lerp(1900, 860, ease(seg(r, 14.6, 16.2)));
      const fr = { x: fx, y: 960, scale: 0.9, look: LK.buyer, seed: 5, flip: true, walking: r < 16.2, talk: ctx.talking && r > 15.4 && r < 17, frontArm: r > 16.2 && r < 17.4 ? { a1: -40, a2: -60 } : undefined };
      out += person(t, fr);
      out += card(fx + 10, 560, ['Ooh, a couch!'], { k: back(seg(r, 15.4, 15.8)), op: 1 - seg(r, 18.6, 19), fs: 28, tx: 0 });
    }
    out += card(hx + 90, 560, ['Doors first!'], { k: back(seg(r, 17.4, 17.8)), fs: 30, col: TX.purple, stroke: C.purpleL, tx: -40 });
    if (lo > 0) out += A.sparkle(1240, 420, s.start + 19.3, t) + A.sparkle(1090, 940, s.start + 19.5, t, C.purple);
    return out;
  };

  /* ================= Lesson 3 · Finding the 4H External Range ================= */

  // Moving day: the tallest old house is not where price lives now.
  LIVE['s10-moving-house'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="140" y="380" width="1640" height="620" rx="30" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
    for (let i = 1; i < 6; i++) out += `<line x1="160" x2="1760" y1="${380 + i * 103}" y2="${380 + i * 103}" stroke="#F3E3D7" stroke-width="2" stroke-dasharray="6 10"/>`;
    const pts = [[200, 900], [330, 640], [430, 470], [560, 720], [640, 630], [720, 905], [900, 620], [1010, 780], [1100, 690], [1200, 830], [1300, 720], [1400, 810], [1500, 740]];
    const k = ease(seg(r, 0.4, 4.2)), p = along(pts, k);
    // Current house: walls = the range around price.
    const hk = pop(t, s.start + 13.8, 0.7);
    if (hk > 0) {
      out += scl(1280, 760, hk, `<path d="M860,620 L1280,500 L1700,620 Z" fill="${C.pinkL}" opacity=".7"/><rect x="860" y="620" width="840" height="285" fill="${C.purpleL}" opacity=".35"/>
        <rect x="1580" y="540" width="40" height="60" fill="${C.pink}" opacity=".7"/>`);
      const lk = ease(seg(r, 14, 15.2));
      out += hline(900, lerp(900, 1700, lk), 620, C.purple, { w: 7 }) + hline(720, lerp(720, 1700, lk), 905, C.purple, { w: 7 });
      out += `<g opacity="${clamp(lk)}"><rect x="1080" y="566" width="80" height="54" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/><rect x="1380" y="905" width="80" height="54" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/></g>`;
    }
    out += poly(p.drawn, C.dark, 7, { op: 0.85 });
    // Old house on the old peak, with a bat.
    const ok = pop(t, s.start + 2.6, 0.6);
    if (ok > 0) {
      const glow = r > 4.2 && r < 9 ? 0.5 + 0.5 * Math.sin(r * 6) : 0;
      out += scl(430, 470, ok, `<rect x="392" y="404" width="76" height="62" fill="#D9CFC8" stroke="${C.muted}" stroke-width="4"/><path d="M380,408 L430,366 L480,408 Z" fill="${C.muted}"/>
        <rect x="420" y="430" width="20" height="36" fill="${C.muted}"/><path d="M395,408 L410,424 M395,420 L408,410" stroke="#fff" stroke-width="2" opacity=".8"/>
        ${glow ? `<circle cx="430" cy="430" r="${70 + glow * 8}" fill="none" stroke="${C.peach}" stroke-width="5" stroke-dasharray="10 8"/>` : ''}`);
      const bx = 520 + Math.sin(r * 1.7) * 40, by = 420 + Math.sin(r * 3.1) * 16, f = Math.sin(r * 14) * 14;
      out += `<g transform="translate(${bx},${by})"><path d="M0,0 Q-20,${-14 - f} -36,${-4 - f} Q-24,4 0,6 Q24,4 36,${-4 - f} Q20,${-14 - f} 0,0 Z" fill="${C.purple}"/><circle cx="-4" cy="-2" r="2.5" fill="#fff"/><circle cx="4" cy="-2" r="2.5" fill="#fff"/></g>`;
    }
    if (r > 4.4) out += pill(640, 448, 'highest visible high', C.peach, pop(t, s.start + 4.4), 24);
    out += stamp(430, 520, 'OLDER ROOM', TX.pink, t, s.start + 9.4, { fs: 30, rot: -12 });
    if (hk > 0) out += pill(1280, 576, '🚪 EXTERNAL HIGH', C.purple, pop(t, s.start + 15.2), 26) + pill(1180, 955, '🚪 EXTERNAL LOW', C.purple, pop(t, s.start + 15.6), 26);
    if (k >= 1) {
      const pr = 1 + Math.sin(r * 5) * 0.15;
      out += `<circle cx="1500" cy="740" r="${18 * pr}" fill="${C.teal}" opacity=".35"/><circle cx="1500" cy="740" r="11" fill="${C.dark}"/>`;
      if (r > 18.4) out += pill(1610, 740, 'price now', C.teal, pop(t, s.start + 18.4), 22);
    }
    // Moving day: a mover carries a box to the new room, the dog follows.
    if (r > 9.6) {
      const mx = lerp(300, 900, ease(seg(r, 9.6, 16.2))), walking = r < 16.2;
      const mv = { x: mx, y: 1040, scale: 0.5, look: LK.d, seed: 3, walking, frontArm: { a1: 30, a2: -60 }, hold: `<rect x="-34" y="-50" width="68" height="50" rx="4" fill="#C9A27A" stroke="#9B6A45" stroke-width="3"/><path d="M-34,-36 L34,-36" stroke="#9B6A45" stroke-width="3"/>` };
      out += person(t, mv) + dog(t, mx - 120, 1040, 0.5, { run: walking, happy: true });
    }
    return out;
  };

  // A picture frame tried on three spots: the old peak, a wiggle, then the current room.
  LIVE['s10-frame-it'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="960" width="1920" height="120" fill="#F3E3D7"/><rect x="0" y="940" width="1920" height="20" fill="#EADFD8"/>`;
    const X = u => 300 + u * 1320, Y = v => 780 - v * 360;
    const sw = [[0, 0.3], [0.1, 0.98], [0.2, 0.4], [0.27, 0.55], [0.37, 0.05], [0.52, 0.72], [0.6, 0.45], [0.66, 0.6], [0.73, 0.35], [0.8, 0.55], [0.87, 0.32], [0.93, 0.5], [1, 0.42]];
    const wk = pop(t, s.start + 0.3, 0.6);
    out += scl(960, 600, wk, `<rect x="250" y="380" width="1420" height="440" rx="10" fill="#fff" stroke="#EADFD8" stroke-width="6"/>`);
    const pts = sw.map(([u, v]) => [X(u), Y(v)]);
    out += poly(along(pts, ease(seg(r, 0.6, 3.2))).drawn, C.dark, 6, { op: 0.8 });
    const F = [[0.03, 0.19, 0.22, 1.06], [0.62, 0.77, 0.3, 0.65], [0.33, 1.03, 0.05, 0.72]];
    let i = 0, f = 0;
    if (r < 7) { i = 0; f = 0; } else if (r < 8.4) { i = 0; f = ease(seg(r, 7, 8.4)); } else if (r < 12) { i = 1; f = 0; } else if (r < 13.4) { i = 1; f = ease(seg(r, 12, 13.4)); } else { i = 2; f = 0; }
    const a = F[i], b = F[Math.min(2, i + 1)], cur = a.map((v, j) => lerp(v, b[j], f));
    const fx0 = X(cur[0]), fx1 = X(cur[1]), fy0 = Y(cur[3]), fy1 = Y(cur[2]);
    const fk = pop(t, s.start + 1.6, 0.6);
    const tilt = f > 0 && f < 1 ? Math.sin(f * Math.PI) * 4 : Math.sin(r * 2) * 0.6;
    if (fk > 0) {
      const done = r > 14.6;
      const fc = (fx0 + fx1) / 2, fm = (fy0 + fy1) / 2;
      out += `<g transform="translate(${fc},${fm}) rotate(${tilt}) scale(${fk}) translate(${-fc},${-fm})">
        <rect x="${fx0}" y="${fy0}" width="${fx1 - fx0}" height="${fy1 - fy0}" fill="none" stroke="${C.gold}" stroke-width="18"/>
        <rect x="${fx0 - 9}" y="${fy0 - 9}" width="${fx1 - fx0 + 18}" height="${fy1 - fy0 + 18}" fill="none" stroke="#C98A1F" stroke-width="3"/>
        ${[[fx0, fy0], [fx1, fy0], [fx0, fy1], [fx1, fy1]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#F3C25C" stroke="#C98A1F" stroke-width="3"/>`).join('')}
        ${done ? `<rect x="${fx0}" y="${fy0}" width="${fx1 - fx0}" height="${fy1 - fy0}" fill="${C.purpleL}" opacity=".18"/>` : ''}</g>`;
      // Two helpers carry it on rods.
      [[fx0 + 30, LK.e, 4, false], [fx1 - 30, LK.b, 6, true]].forEach(([hx, look, seed, flip]) => {
        const hp = { x: hx, y: 1040, scale: 0.55, look, seed, flip, walking: f > 0 && f < 1, frontArm: { a1: -75, a2: -92 } };
        const h = handOf(hp);
        out += person(t, hp) + `<line x1="${h.x}" y1="${h.y}" x2="${hx}" y2="${fy1 + 8}" stroke="#9B6A45" stroke-width="8" stroke-linecap="round"/>`;
      });
    }
    out += stamp(X(0.11), Y(0.62), 'OLDER ROOM', TX.pink, t, s.start + 5.2, { fs: 26, rot: -14 });
    out += stamp(X(0.695), Y(0.47), 'FURNITURE', TX.peach, t, s.start + 9.4, { fs: 24, rot: 10, op: 1 - seg(r, 12, 12.6) });
    if (r > 14.6) {
      out += pill(X(0.68), Y(0.72) - 40, '🚪 EXTERNAL HIGH', C.purple, pop(t, s.start + 14.8), 26) + pill(X(0.68), Y(0.05) + 42, '🚪 EXTERNAL LOW', C.purple, pop(t, s.start + 15.4), 26);
      out += check(X(1.03) - 4, Y(0.72) - 4, pop(t, s.start + 14.6, 0.5), C.teal, 30) + A.sparkle(X(0.68), Y(0.4), s.start + 14.8, t, C.purple);
    }
    out += cat(t, 1790, 1000, 0.7, { flip: true, col: '#D9CFC8', dark: C.muted, sleep: r > 19 });
    return out;
  };

  /* ================= Lesson 4 · Previous 4H Swing Highs & Lows ================= */

  // Candle that forms along a price path (unit prices), drawn with X(i)/Y(v).
  function pathCandle(path, k, x, Y, bw, o = {}) {
    if (k <= 0) return '';
    const n = path.length - 1, f = clamp(k) * n, i = Math.min(n - 1, Math.floor(f)), cur = lerp(path[i], path[i + 1], f - i);
    let hi = Math.max(path[0], cur), lo = Math.min(path[0], cur);
    for (let j = 1; j <= i; j++) { hi = Math.max(hi, path[j]); lo = Math.min(lo, path[j]); }
    const up = cur >= path[0], col = up ? C.teal : C.pink;
    return `<line x1="${x}" x2="${x}" y1="${Y(hi)}" y2="${Y(lo)}" stroke="${col}" stroke-width="${o.wick || 4}" stroke-linecap="round"/>
      <rect x="${x - bw / 2}" y="${Y(Math.max(path[0], cur))}" width="${bw}" height="${Math.max(3, Math.abs(Y(cur) - Y(path[0])))}" rx="3" fill="${col}"/>`;
  }

  // Two TVs, two replays of the same swing; a couple reacts from the couch.
  LIVE['s10-replay-tv'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="980" width="1920" height="100" fill="#F3E3D7"/>`;
    const hist = [[0.2, 0.36], [0.36, 0.52], [0.52, 0.72, 0.66], [0.66, 0.55], [0.55, 0.45], [0.45, 0.53], [0.53, 0.62]];
    const A1 = [[0.62, 0.82, 0.64], [0.64, 0.68, 0.55], [0.55, 0.47]];
    const B1 = [[0.62, 0.66, 0.6, 0.8], [0.8, 0.76, 0.9], [0.9, 0.86, 0.98]];
    const tv = (x0, story, at, lab, col) => {
      const k = pop(t, s.start + 0.3 + (x0 > 900 ? 0.2 : 0), 0.6);
      if (k <= 0) return '';
      const w = 620, h = 330, y0 = 390, Y = v => 690 - v * 270, step = 50, X = i => x0 + 50 + i * step;
      let g = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="26" fill="${C.dark}"/><rect x="${x0 + 16}" y="${y0 + 16}" width="${w - 32}" height="${h - 32}" rx="16" fill="#FFF6F0"/>
        <rect x="${x0 + w / 2 - 50}" y="${y0 + h}" width="100" height="20" fill="${C.dark}"/>`;
      hist.forEach((p, i) => { g += pathCandle(p, seg(r, 0.6 + i * 0.25, 0.9 + i * 0.25), X(i), Y, 26); });
      const lk = ease(seg(r, 3.8, 4.8));
      if (lk > 0) g += hline(X(2) - 20, lerp(X(2), x0 + w - 30, lk), Y(0.72), C.gold, { w: 5 }) + `<circle cx="${X(2)}" cy="${Y(0.72)}" r="9" fill="${C.gold}"/>`;
      story.forEach((p, i) => { g += pathCandle(p, seg(r, at + i * 1.4, at + i * 1.4 + 1.3), X(7 + i), Y, 26); });
      g += pill(x0 + 92, y0 + 48, lab, col, 1, 22);
      if (r > at - 0.2 && r < at + 4.4) g += `<circle cx="${x0 + w - 50}" cy="${y0 + 48}" r="10" fill="${C.pink}" opacity="${0.5 + 0.5 * Math.sin(r * 8)}"/>` + txt(x0 + w - 106, y0 + 56, 'LIVE', { fs: 20, col: TX.pink });
      return scl(x0 + w / 2, y0 + h / 2, k, g);
    };
    out += tv(260, A1, 7.6, 'REPLAY A', C.pink) + tv(1040, B1, 12.8, 'REPLAY B', C.teal);
    if (r > 4) out += pill(570, 376, 'previous 4H swing high', C.gold, pop(t, s.start + 4), 22) + pill(1350, 376, 'same swing', C.gold, pop(t, s.start + 4.3), 22);
    // Viewers on the couch.
    const v1 = { x: 860, y: 1000, scale: 0.72, look: LK.e, seed: 2, talk: ctx.talking && r > 9 && r < 12, frontArm: r > 9.4 && r < 12 ? { a1: -30, a2: -60 } : undefined };
    const v2 = { x: 1060, y: 1000, scale: 0.72, look: LK.f, seed: 5, flip: true, talk: ctx.talking && r > 14 && r < 17, frontArm: r > 14.6 ? { a1: -70, a2: -100 + Math.sin(t * 9) * 10 } : undefined };
    out += person(t, v1) + person(t, v2);
    out += `<rect x="690" y="860" width="540" height="70" rx="30" fill="${C.purple}"/><rect x="660" y="900" width="600" height="90" rx="30" fill="${C.purpleL}"/>
      <rect x="640" y="870" width="70" height="120" rx="26" fill="${C.purple}"/><rect x="1210" y="870" width="70" height="120" rx="26" fill="${C.purple}"/>`;
    // Popcorn.
    out += `<path d="M930,880 L990,880 L982,920 L938,920 Z" fill="${C.pink}"/><path d="M944,880 L944,920 M960,880 L960,920 M976,880 L976,920" stroke="#fff" stroke-width="4"/>`;
    for (let i = 0; i < 4; i++) { const p = ((r * 0.9) + i / 4) % 1; out += `<circle cx="${940 + i * 14 + Math.sin(i * 3) * 6}" cy="${872 - Math.sin(p * Math.PI) * 50}" r="8" fill="#FFF3C4" stroke="${C.gold}" stroke-width="2"/>`; }
    out += card(560, 800, ['Wick through…', 'closed back below.'], { k: back(seg(r, 9.6, 10)), tail: 'right', fs: 24 });
    out += card(1370, 800, ['Closed through,', 'and it’s building!'], { k: back(seg(r, 15.2, 15.6)), tail: 'left', fs: 24 });
    if (r > 17.2) out += pill(570, 748, 'wick, close below', C.pink, pop(t, s.start + 17.2), 22) + pill(1350, 748, 'close, build above', C.teal, pop(t, s.start + 17.6), 22) + A.sparkle(1350, 520, s.start + 17.6, t, C.teal);
    return out;
  };

  // Climbing wall: the ledge is the landmark. One climber slips back, one pulls up and builds.
  LIVE['s10-ledge-climb'] = (s, t, ctx) => {
    const r = t - s.start;
    const LY = 600;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    // Upper wall (set back) and lower face.
    out += `<path d="M1180,${LY} L1180,430 Q1300,400 1460,420 L1780,410 L1780,${LY} Z" fill="#E9DED6"/>
      <rect x="1000" y="${LY}" width="780" height="${1000 - LY}" fill="#D9CFC8"/>
      <rect x="980" y="${LY - 16}" width="820" height="26" rx="10" fill="#C9B9AE"/>`;
    [[1060, 920], [1130, 840], [1090, 730], [1250, 900], [1330, 780], [1290, 680], [1430, 930], [1520, 820], [1470, 700], [1640, 880], [1700, 740], [1600, 660]].forEach(([x, y], i) => { out += `<ellipse cx="${x}" cy="${y}" rx="16" ry="12" fill="${[C.pink, C.teal, C.peach, C.purple][i % 4]}"/>`; });
    const lk = ease(seg(r, 4.6, 5.8));
    if (lk > 0) out += hline(lerp(980, 260, lk), 980, LY - 3, C.gold, { w: 6 });
    // Checklist pills.
    [[4.8, '1 · the swing: where to look'], [8.4, '2 · the close: how it interacted'], [14.8, '3 · next: did it build beyond?']].forEach(([at, txt_], i) => {
      out += pill(560, 690 + i * 90, txt_, [C.gold, C.pink, C.teal][i], pop(t, s.start + at), 24);
    });
    // Climber one.
    const footAt = 600 + 0.6 * (196 + 112);
    let y1 = 1000;
    if (r > 8.4) y1 = lerp(1000, footAt, ease(seg(r, 8.6, 11)));
    if (r > 12.4) y1 = lerp(footAt, 1000, seg(r, 12.4, 13.1) ** 2);
    const climbing1 = r > 8.6 && r < 12.4, arm = Math.sin(t * 6) * 14;
    const c1 = { x: 1200, y: y1, scale: 0.6, look: LK.g, seed: 3, mood: r > 13 ? 'sad' : undefined,
      frontArm: climbing1 ? { a1: -92 + arm, a2: -92 } : r > 13.1 ? undefined : { a1: -80, a2: -88 }, backArm: climbing1 ? { a1: -88 - arm, a2: -92 } : undefined };
    out += person(t, c1) + hat(t, c1, 'helmet', C.pink);
    if (r > 12.4 && r < 13.4) out += txt(1260, 640, 'whoops', { fs: 30, col: TX.pink, font: 'Playfair Display', op: 1 - seg(r, 13, 13.4) });
    if (r > 13.2) out += pill(1260, 520, 'slipped back', C.pink, pop(t, s.start + 13.2), 22);
    // Climber two.
    let x2 = 1500, y2 = 1000;
    if (r > 14.8) y2 = lerp(1000, footAt, ease(seg(r, 14.8, 17)));
    if (r > 17) y2 = lerp(footAt, LY - 4, ease(seg(r, 17, 18)));
    if (r > 18.4) x2 = lerp(1500, 1640, ease(seg(r, 18.4, 19.6)));
    const climbing2 = r > 14.8 && r < 18;
    const c2 = { x: x2, y: y2, scale: 0.6, look: LK.k, seed: 6, walking: r > 18.4 && r < 19.6,
      frontArm: climbing2 ? { a1: -92 - arm, a2: -92 } : r > 19.6 ? { a1: -60, a2: -100 + Math.sin(t * 8) * 10 } : undefined, backArm: climbing2 ? { a1: -88 + arm, a2: -92 } : undefined };
    out += person(t, c2) + hat(t, c2, 'helmet', C.teal);
    const fk = pop(t, s.start + 19.6, 0.6);
    if (fk > 0) {
      const fl = Math.sin(t * 6) * 6;
      out += scl(1730, LY - 6, fk, `<line x1="1730" y1="${LY - 6}" x2="1730" y2="${LY - 130}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/><path d="M1730,${LY - 130} Q${1760 + fl},${LY - 136} 1790,${LY - 120} L1790,${LY - 90} Q${1760 - fl},${LY - 100} 1730,${LY - 92} Z" fill="${C.teal}"/>`) + A.sparkle(1730, LY - 120, s.start + 19.6, t, C.teal);
      out += pill(1430, 470, 'built beyond ✓', C.teal, fk, 24);
    }
    out += bird(t, 1330, 418, 0.7, { hop: true, flip: true, col: C.peach, wing: '#E08E2E' });
    return out;
  };

  /* ================= Lesson 5 · When a New 4H Swing Changes the Map ================= */

  // Polaroids: snap the room before, wait for the new swing, snap it after.
  LIVE['s10-polaroid'] = (s, t, ctx) => {
    const r = t - s.start;
    const sw = [[0, 0.4], [0.1, 0.7], [0.2, 0.35], [0.3, 0.55], [0.38, 0.12], [0.5, 0.6], [0.58, 0.42], [0.72, 0.9], [0.82, 0.66]];
    const X = u => 780 + u * 1060, Y = v => 910 - v * 450;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    const pk = pop(t, s.start + 0.3, 0.6);
    out += scl(1240, 680, pk, `<rect x="720" y="400" width="1100" height="560" rx="30" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
    const pts = sw.map(([u, v]) => [X(u), Y(v)]);
    // Path: first six points, then the rest after the first photo.
    const k1 = seg(r, 0.5, 2.6), k2 = ease(seg(r, 9.2, 14.4));
    const shown = k2 > 0 ? along(pts.slice(5), k2).drawn : [];
    out += poly(along(pts.slice(0, 6), k1).drawn.concat(shown.slice(1)), C.dark, 7, { op: 0.85 });
    const after = r > 17.4;
    const ok = ease(seg(r, 1.2, 2.2));
    if (ok > 0) {
      const col = after ? '#C9B9AE' : C.purple;
      out += hline(X(0.1), lerp(X(0.1), X(1), ok), Y(0.7), col, { w: 6 }) + hline(X(0.38), lerp(X(0.38), X(1), ok), Y(0.12), col, { w: 6 });
      out += pill(X(0.24), Y(0.7) - 30, after ? 'old high' : '🚪 EXTERNAL HIGH', after ? '#C9B9AE' : C.purple, 1, 22) + pill(X(0.62), Y(0.12) + 32, after ? 'old low' : '🚪 EXTERNAL LOW', after ? '#C9B9AE' : C.purple, 1, 22);
    }
    if (r > 11.6) out += pill(X(0.66), Y(0.78), 'closes through', C.peach, pop(t, s.start + 11.6) * (after ? 0 : 1), 22);
    if (r > 14.4) out += dot(X(0.72), Y(0.9), C.teal, 13) + pill(X(0.86), Y(0.9) - 4, 'new swing ✓', C.teal, pop(t, s.start + 14.4), 22);
    if (after) {
      const nk = ease(seg(r, 17.6, 18.6));
      out += hline(X(0.72), lerp(X(0.72), X(1), nk), Y(0.9), C.purple, { w: 7 }) + hline(X(0.58), lerp(X(0.58), X(1), nk), Y(0.42), C.purple, { w: 7 });
      out += pill(X(0.93), Y(0.42) + 34, 'NEW LOW', C.purple, pop(t, s.start + 18.4), 22) + pill(X(0.93), Y(0.9) - 32, 'NEW HIGH', C.purple, pop(t, s.start + 18.2), 22);
    }
    // Clothesline with polaroids.
    out += `<path d="M90,420 Q360,450 650,420" stroke="${C.muted}" stroke-width="3" fill="none"/>`;
    const polaroid = (cx, at, label, which) => {
      const e = clamp((r - at) / 1.2);
      if (e <= 0) return '';
      const x = lerp(470, cx, ease(e)), y = lerp(760, 540, ease(e)), rot = which ? 4 + Math.sin(t * 2) * 2 : -4 + Math.sin(t * 2 + 1) * 2;
      const mx = u => -76 + u * 152, my = v => 40 - v * 110;
      const mpts = (which ? sw : sw.slice(0, 6)).map(([u, v]) => `${mx(u)},${my(v)}`).join(' ');
      const lines = which ? [[0.9, 0.72], [0.42, 0.58]] : [[0.7, 0.1], [0.12, 0.38]];
      const dev = which ? clamp((r - at - 1.2) / 1.5) : 1;
      return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-95" y="-110" width="190" height="230" rx="6" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <rect x="-80" y="-94" width="160" height="150" fill="${C.cream}"/>
        <g opacity="${dev}"><polyline points="${mpts}" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linejoin="round"/>
        ${lines.map(([v, u]) => `<line x1="${mx(u)}" x2="76" y1="${my(v)}" y2="${my(v)}" stroke="${C.purple}" stroke-width="3" stroke-dasharray="6 5"/>`).join('')}</g>
        <rect x="-80" y="-94" width="160" height="150" fill="#3D3550" opacity="${1 - dev}"/>
        ${txt(0, 94, label, { fs: 24, col: which ? TX.purple : C.muted, font: 'Playfair Display', w: 700 })}
        <rect x="-10" y="-124" width="20" height="30" rx="4" fill="${C.peach}"/></g>`;
    };
    out += polaroid(220, 3.4, 'BEFORE', 0) + polaroid(510, 17.6, 'AFTER', 1);
    // Photographer + tripod camera.
    const ph = { x: 300, y: 1000, scale: 0.9, look: LK.c, seed: 2, frontArm: { a1: 0, a2: -30 } };
    out += `<g stroke="${C.dark}" stroke-width="7" stroke-linecap="round"><line x1="430" y1="800" x2="390" y2="1000"/><line x1="430" y1="800" x2="470" y2="1000"/><line x1="430" y1="800" x2="430" y2="1000"/></g>`;
    out += person(t, ph) + hat(t, ph, 'cap', C.peach);
    out += `<rect x="388" y="736" width="100" height="66" rx="12" fill="${C.dark}"/><circle cx="452" cy="769" r="22" fill="#5E56B8" stroke="#fff" stroke-width="5"/><rect x="400" y="726" width="30" height="14" rx="4" fill="${C.dark}"/>`;
    [3, 17.4].forEach(at => {
      const fl = clamp(1 - Math.abs(r - at) / 0.3);
      if (fl > 0) out += `<circle cx="470" cy="760" r="${120 + fl * 200}" fill="#FFF3C4" opacity="${fl * 0.85}"/><rect x="0" y="360" width="1920" height="720" fill="#fff" opacity="${fl * 0.35}"/>`;
    });
    // Dog reacts to the flashes.
    const bark = (r > 3 && r < 4.4) || (r > 17.4 && r < 18.8);
    out += dog(t, 610, 1000, 0.6, { happy: bark });
    if (bark) out += txt(700, 900, 'woof!', { fs: 30, col: TX.peach, font: 'Playfair Display' });
    return out;
  };

  // The carpenter waits for the new swing, then moves the doors himself.
  LIVE['s10-door-carpenter'] = (s, t, ctx) => {
    const r = t - s.start;
    const X = u => 330 + u * 1080, Y = v => 940 - v * 470;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    const wk = pop(t, s.start + 0.3, 0.6);
    let wall = `<rect x="270" y="400" width="1250" height="600" fill="#FFF6F0" stroke="#EADFD8" stroke-width="4"/>`;
    for (let row = 0; row < 10; row++) for (let c = 0; c < 9; c++) wall += `<rect x="${280 + c * 138 + (row % 2) * 69}" y="${410 + row * 59}" width="128" height="50" rx="6" fill="#FBEFE7" opacity="${(row * 7 + c * 3) % 5 === 0 ? 1 : 0.55}"/>`;
    out += scl(895, 700, wk, wall);
    const sw = [[0, 0.3], [0.12, 0.62], [0.25, 0.25], [0.36, 0.5], [0.45, 0.12], [0.6, 0.55], [0.68, 0.4], [0.84, 0.9], [0.94, 0.76]];
    const pts = sw.map(([u, v]) => [X(u), Y(v)]);
    const k1 = ease(seg(r, 0.6, 3)), k2 = ease(seg(r, 3.8, 7.8)), k3 = ease(seg(r, 13.4, 15));
    let drawn = along(pts.slice(0, 7), k1).drawn;
    if (k2 > 0) drawn = drawn.concat(along(pts.slice(6, 8), k2).drawn.slice(1));
    if (k3 > 0) drawn = drawn.concat(along(pts.slice(7), k3).drawn.slice(1));
    const head = drawn[drawn.length - 1];
    // Door lines.
    const mv = ease(seg(r, 18, 19.6)), mvL = ease(seg(r, 19.8, 21.2));
    const hiV = lerp(0.62, 0.9, mv), loV = lerp(0.12, 0.4, mvL);
    if (r > 0.8) {
      if (mv > 0) out += hline(X(0.12), X(1.08), Y(0.62), '#C9B9AE', { w: 4 });
      if (mvL > 0) out += hline(X(0.45), X(1.08), Y(0.12), '#C9B9AE', { w: 4 });
      out += hline(mv > 0 ? X(0.84) : X(0.12), X(1.08), Y(hiV), C.purple, { w: 6 }) + hline(mvL > 0 ? X(0.68) : X(0.45), X(1.08), Y(loV), C.purple, { w: 6 });
    }
    out += poly(drawn, C.dark, 7, { op: 0.85 });
    out += candleGuy(t, head[0], head[1] - 6, 0.32, { up: !(r > 13.4 && r < 15.4), seed: 1, arms: r > 4 && r < 8 ? 'up' : undefined });
    const door = (y) => `<g transform="translate(1440,${y})"><rect x="-44" y="-62" width="88" height="124" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/><circle cx="24" cy="2" r="7" fill="${C.purple}"/></g>`;
    out += scl(1440, Y(0.62), pop(t, s.start + 1.0), door(Y(hiV))) + scl(1440, Y(0.12), pop(t, s.start + 1.3), door(Y(loV)));
    if (r > 5.6) out += pill(X(0.62), Y(0.62) - 34, 'closes through', C.peach, pop(t, s.start + 5.6) * (1 - seg(r, 17.6, 18)), 22);
    if (r > 8.4 && r < 13.4) out += pill(head[0] - 160, head[1] + 10, 'still pushing…', C.pink, pop(t, s.start + 8.4), 22);
    if (r > 15) out += dot(X(0.84), Y(0.9), C.teal, 12) + pill(X(0.84) - 210, Y(0.9) + 2, 'new swing ✓', C.teal, pop(t, s.start + 15) * (1 - seg(r, 21.4, 21.8)), 22) + A.sparkle(X(0.84), Y(0.9), s.start + 15, t, C.teal);
    if (mv >= 1) out += pill(1280, Y(0.9) - 34, 'NEW EXTERNAL HIGH', C.purple, pop(t, s.start + 19.6), 22);
    if (mvL >= 1) out += pill(1280, Y(0.4) + 34, 'NEW EXTERNAL LOW', C.purple, pop(t, s.start + 21.2), 22);
    // Ladder and carpenter.
    out += `<g stroke="#9B6A45" stroke-width="9" stroke-linecap="round"><line x1="1560" y1="1000" x2="1540" y2="470"/><line x1="1640" y1="1000" x2="1620" y2="470"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${1558 - i * 2.5}" x2="${1638 - i * 2.5}" y1="${950 - i * 64}" y2="${950 - i * 64}"/>`).join('')}</g>`;
    const cy = lerp(1000, 780, ease(seg(r, 17, 18))) + (r > 21.6 ? lerp(0, 220, ease(seg(r, 21.6, 22.6))) : 0);
    const waiting = r > 8.4 && r < 15;
    const sign = `<g transform="rotate(-8)"><line x1="0" y1="0" x2="0" y2="-80" stroke="#9B6A45" stroke-width="7"/><rect x="-60" y="-140" width="120" height="66" rx="10" fill="${C.peach}" stroke="#fff" stroke-width="4"/><text y="-96" font-size="30" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">WAIT</text></g>`;
    const cp = { x: r > 17 ? 1600 : 1740, y: cy, scale: 0.78, look: LK.buyer, seed: 4, flip: true, talk: ctx.talking && r > 9 && r < 12, frontArm: waiting ? { a1: -60, a2: -90 } : r > 17.8 && r < 21.6 ? { a1: -150 + Math.sin(t * 8) * 10, a2: -170 } : undefined, hold: waiting ? sign : '' };
    out += person(t, cp) + hat(t, cp, 'cap', C.teal);
    // Impatient helper.
    const hp = { x: 150, y: 1000, scale: 0.75, look: LK.i, seed: 7, talk: ctx.talking && r > 8.6 && r < 10, frontArm: r > 8.4 && r < 13 ? { a1: -50 + Math.sin(t * 10) * 12, a2: -80 } : undefined };
    out += person(t, hp);
    out += card(240, 600, ['Move it now?'], { k: back(seg(r, 8.4, 8.8)), op: 1 - seg(r, 13, 13.4), fs: 26, tx: -60 });
    out += card(1690, 560, ['Not yet.'], { k: back(seg(r, 9.6, 10)), op: 1 - seg(r, 13.4, 13.8), fs: 28, col: TX.peach, tx: 30 });
    return out;
  };

  const BUILD = {};
  Object.keys(LIVE).forEach(k => {
    BUILD[k] = s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;
  });
  Object.assign(window.ILLUS.BUILD, BUILD);
  Object.assign(window.ILLUS.LIVE, LIVE);
})();
