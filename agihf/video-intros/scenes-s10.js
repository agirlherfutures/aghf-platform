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
    const X = u => 790 + u * 980, Y = v => 910 - v * 450;
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
    if (r > 14.4) out += dot(X(0.72), Y(0.9), C.teal, 13) + pill(X(0.88), Y(0.9) - 4, 'new swing ✓', C.teal, pop(t, s.start + 14.4) * (1 - seg(r, 17.2, 17.5)), 22);
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

  /* ================= Lesson 6 · Internal Movement Inside the 4H Room ================= */

  // Snow globe: shake it, the 1H storms lower inside, the glass (the 4H room) holds.
  LIVE['s10-snow-globe'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>
      <rect x="520" y="958" width="880" height="26" rx="10" fill="#C9A27A"/><rect x="560" y="984" width="22" height="96" fill="#9B6A45"/><rect x="1338" y="984" width="22" height="96" fill="#9B6A45"/>`;
    const gk = pop(t, s.start + 0.3, 0.7);
    const shake = seg(r, 2.8, 3.2) * (1 - seg(r, 9.6, 10.2));
    const settle = ease(seg(r, 10, 16));
    const wob = Math.sin(t * 13) * 5 * shake;
    const cx = 960, cy = 620, R = 245;
    let g = `<defs><clipPath id="s10-globe"><circle cx="${cx}" cy="${cy}" r="${R - 8}"/></clipPath></defs>
      <path d="M780,880 L1140,880 L1180,958 L740,958 Z" fill="${C.purple}"/><rect x="760" y="864" width="400" height="26" rx="10" fill="#5E56B8"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#E8F8F6" stroke="#fff" stroke-width="10"/>
      <g clip-path="url(#s10-globe)"><rect x="700" y="800" width="520" height="80" fill="#fff"/>`;
    // Faint 4H room inside.
    g += `<rect x="790" y="480" width="340" height="320" fill="${C.purpleL}" opacity=".25"/>` + hline(780, 1140, 480, C.purple, { w: 4, op: 0.7 }) + hline(780, 1140, 800, C.purple, { w: 4, op: 0.7 });
    const pts = [[800, 520], [860, 610], [900, 570], [960, 690], [1010, 650], [1070, 760], [1120, 720]];
    const pk = along(pts, ease(seg(r, 4, 10.4)));
    g += poly(pk.drawn, C.pink, 7);
    [[2, 'LH', -1], [3, 'LL', 1], [4, 'LH', -1], [5, 'LL', 1]].forEach(([i, lab, d]) => { if (pk.seg >= i || pk.seg === pts.length - 2 && pk.f >= 1) g += pill(pts[i][0], pts[i][1] + d * 30, lab, C.pink, pop(t, s.start + 4 + i * 1.0, 0.4), 18); });
    // Snow.
    for (let i = 0; i < 46; i++) {
      const a = i * 2.39 + r * (1.6 + (i % 5) * 0.2) * shake, rr = 40 + (i * 37) % 190;
      const sx = cx + Math.cos(a) * rr, sy = cy + Math.sin(a) * rr * 0.9;
      const bx = cx - 200 + (i * 53) % 400, by = 850 - (i % 4) * 9;
      const m = r < 3 ? 1 : settle;
      g += `<circle cx="${lerp(sx, bx, m)}" cy="${lerp(sy, by, m)}" r="${4 + (i % 3) * 2}" fill="#fff" stroke="#E9DED6" stroke-width="1.5"/>`;
    }
    g += `</g><path d="M${cx - 170},${cy - 150} Q${cx - 210},${cy - 60} ${cx - 196},${cy + 10}" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".7"/>
      <text x="${cx}" y="934" font-size="28" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">4H · BULLISH ROOM ↑</text>`;
    out += `<g transform="rotate(${wob} 960 958)">${scl(960, 958, gk, g)}</g>`;
    if (r > 10.8) out += pill(960, 440, '1H · bearish ↓', C.pink, pop(t, s.start + 10.8), 24);
    // Kid shaking the globe.
    const kh = shake > 0 ? Math.sin(t * 13) * 10 : 0;
    const kid = { x: 620, y: 1000, scale: 0.85, look: LK.d, seed: 3, talk: false, frontArm: shake > 0 || (r > 2.4 && r < 3) ? { a1: -18 + kh * 0.4, a2: -10 + kh } : undefined };
    out += popPerson(t, s.start + 0.6, kid);
    // Grandpa with tea.
    const mug = `<g transform="translate(0,-14)"><rect x="-16" y="-20" width="32" height="34" rx="6" fill="${C.teal}"/><path d="M16,-12 q14,0 14,12 q0,12 -14,10" stroke="${C.teal}" stroke-width="5" fill="none"/>${[0, 1].map(i => { const p = ((r * 0.7) + i * 0.5) % 1; return `<path d="M${-6 + i * 10},${-26 - p * 30} q6,-8 0,-16" stroke="${C.muted}" stroke-width="3" fill="none" opacity="${1 - p}"/>`; }).join('')}</g>`;
    const gp = { x: 1480, y: 1000, scale: 0.9, look: { skin: '#B07750', hair: '#E9DED6', hairStyle: 'short', shirt: C.peach, pants: '#3D3550' }, seed: 5, flip: true, frontArm: { a1: 20, a2: -70 }, hold: mug, talk: ctx.talking && r > 14.4 && r < 17.6 };
    out += popPerson(t, s.start + 0.9, gp);
    out += card(1520, 580, ['Still the', 'same room.'], { k: back(seg(r, 14.6, 15)), fs: 26, tx: -20, italic: true, font: 'Playfair Display' });
    // Cat on the table bats at it.
    out += cat(t, 1250, 958, 0.55, { flip: true, col: '#D9CFC8', dark: C.muted, run: shake > 0 });
    if (r > 14.4) out += pill(960, 1034, 'both true ✓', C.teal, pop(t, s.start + 14.4), 26) + A.sparkle(960, 420, s.start + 16, t, C.teal);
    return out;
  };

  // Living room chaos: the cat moves the couch, the picture falls, you are still in the room.
  LIVE['s10-cat-chaos'] = (s, t, ctx) => {
    const r = t - s.start;
    const rk = pop(t, s.start + 0.3, 0.7);
    let room = `<rect x="240" y="390" width="1440" height="600" rx="20" fill="#FEF3E4" stroke="${C.dark}" stroke-width="8"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${320 + i * 115}" cy="${470 + (i % 2) * 60}" r="10" fill="${C.peachL}" opacity=".6"/>`).join('')}
      <rect x="248" y="900" width="1424" height="86" fill="#F3E3D7"/>
      <rect x="1440" y="386" width="140" height="26" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
      <rect x="400" y="964" width="150" height="26" rx="6" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>`;
    // Window.
    room += `<rect x="330" y="470" width="170" height="160" rx="10" fill="${C.tealL}" stroke="#fff" stroke-width="10"/><line x1="415" x2="415" y1="470" y2="630" stroke="#fff" stroke-width="8"/>`;
    // Couch slides.
    const cpush = ease(seg(r, 2.6, 4.6)), cxp = lerp(620, 860, cpush), ctilt = Math.sin(cpush * Math.PI) * 3;
    room += `<g transform="translate(${cxp},900) rotate(${ctilt})"><rect x="-150" y="-70" width="300" height="70" rx="24" fill="${C.pink}"/><rect x="-170" y="-110" width="50" height="110" rx="18" fill="${C.pinkL}"/><rect x="120" y="-110" width="50" height="110" rx="18" fill="${C.pinkL}"/><rect x="-120" y="-130" width="240" height="70" rx="20" fill="${C.pinkL}"/></g>`;
    if (cpush > 0 && cpush < 1) room += [0, 1, 2].map(i => `<line x1="${cxp - 190 - i * 30}" x2="${cxp - 230 - i * 30}" y1="${860 + i * 14}" y2="${860 + i * 14}" stroke="${C.muted}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`).join('');
    // Picture falls.
    const pf = seg(r, 5.2, 6.4), py = lerp(560, 862, pf * pf), pr = lerp(0, 168, pf) + (pf <= 0 ? Math.sin(r * 9) * (r > 4.6 ? 6 : 0) : 0);
    if (pf <= 0) room += `<line x1="1180" y1="470" x2="1130" y2="500" stroke="${C.muted}" stroke-width="3"/><line x1="1180" y1="470" x2="1230" y2="500" stroke="${C.muted}" stroke-width="3"/>`;
    room += `<circle cx="1180" cy="468" r="6" fill="${C.muted}"/><g transform="translate(1180,${py}) rotate(${pr})"><rect x="-80" y="-60" width="160" height="120" rx="8" fill="#fff" stroke="${C.purple}" stroke-width="10"/><circle cx="0" cy="-6" r="22" fill="${C.peachL}"/><path d="M-30,40 Q0,10 30,40" fill="${C.tealL}"/></g>`;
    // Lamp wobbles.
    const lw = r > 6.4 && r < 9 ? Math.sin(r * 10) * 6 * (1 - seg(r, 6.4, 9)) : 0;
    room += `<g transform="rotate(${lw} 1560 900)"><rect x="1554" y="720" width="12" height="180" fill="${C.dark}"/><path d="M1510,720 L1610,720 L1592,650 L1528,650 Z" fill="${C.peachL}"/></g>`;
    let out = scl(960, 690, rk, room);
    // Cat: enters, pushes couch, leaps at the picture, naps.
    let kx = lerp(-80, cxp - 240, ease(seg(r, 1, 2.6))), ky = 900;
    if (r > 2.6) kx = cxp - 240;
    if (r > 4.6) kx = lerp(cxp - 240, 1110, ease(seg(r, 4.6, 5.3)));
    if (r > 4.9 && r < 6.2) ky = 900 - Math.sin(seg(r, 4.9, 6.2) * Math.PI) * 230;
    if (r > 13) kx = lerp(1110, 980, ease(seg(r, 13, 14.2)));
    out += cat(t, kx, ky, 0.7, { run: (r > 1 && r < 5.3) || (r > 13 && r < 14.2), sleep: r > 15.2, flip: r > 13 && r < 14.2 });
    // Calm person.
    const cup = `<g transform="translate(0,-10)"><rect x="-14" y="-18" width="28" height="28" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="4"/></g>`;
    const cp = { x: 1410, y: 960, scale: 0.85, look: LK.a, seed: 2, flip: true, frontArm: { a1: Math.sin(r * 0.8) > 0.6 ? -40 : 30, a2: Math.sin(r * 0.8) > 0.6 ? -120 : -70 }, hold: cup, talk: ctx.talking && r > 11 && r < 13.4 };
    out += popPerson(t, s.start + 0.8, cp);
    out += pill(760, 700, 'the couch can move', C.pink, pop(t, s.start + 3.2), 24);
    out += pill(1180, 520, 'pictures can fall 😂', C.purple, pop(t, s.start + 6.0) * (1 - seg(r, 10.6, 11)), 24);
    out += card(1250, 610, ['Still in', 'the room.'], { k: back(seg(r, 11, 11.4)), fs: 26, tx: 50, italic: true, font: 'Playfair Display' });
    if (r > 13.8) {
      const gl = 0.5 + 0.5 * Math.sin(r * 5);
      out += `<rect x="1430" y="376" width="160" height="46" rx="10" fill="none" stroke="${C.purple}" stroke-width="${3 + gl * 4}"/><rect x="390" y="954" width="170" height="46" rx="10" fill="none" stroke="${C.purple}" stroke-width="${3 + gl * 4}"/>`;
      out += pill(1510, 450, '🚪 door', C.purple, pop(t, s.start + 13.8), 24) + pill(475, 1036, '🚪 door', C.purple, pop(t, s.start + 14.1), 24);
    }
    return out;
  };

  /* ================= Lesson 7 · Reading 1H Structure Inside the 4H ================= */

  // Mall directory (4H: where am I?) and the path you walk (1H: how am I moving?).
  LIVE['s10-you-are-here'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="960" width="1920" height="120" fill="#F6EDE6"/>${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 130}" x2="${i * 130 - 60}" y1="960" y2="1080" stroke="#EADFD8" stroke-width="3"/>`).join('')}`;
    // Directory sign.
    const dk = pop(t, s.start + 0.3, 0.7);
    let d = `<rect x="488" y="800" width="24" height="170" fill="${C.muted}"/><rect x="240" y="392" width="520" height="420" rx="24" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="240" y="392" width="520" height="62" rx="24" fill="${C.purple}"/><rect x="240" y="430" width="520" height="24" fill="${C.purple}"/>
      <text x="500" y="436" font-size="30" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="2">4H DIRECTORY</text>`;
    const rmk = ease(seg(r, 1.4, 2.4));
    d += `<g opacity="${rmk}"><rect x="290" y="490" width="420" height="270" rx="8" fill="${C.purpleL}" opacity=".35" stroke="${C.purple}" stroke-width="5"/>
      <rect x="560" y="480" width="70" height="20" rx="5" fill="${C.purple}"/><rect x="360" y="750" width="70" height="20" rx="5" fill="${C.purple}"/>
      ${[[330, 540, 90, 60, C.pinkL], [450, 560, 70, 80, C.tealL], [560, 600, 110, 60, C.peachL], [340, 650, 80, 70, C.tealL], [470, 670, 90, 60, C.pinkL]].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c}"/>`).join('')}</g>`;
    if (r > 3) {
      const pu = 1 + Math.sin(r * 6) * 0.2;
      d += `<circle cx="600" cy="712" r="${22 * pu}" fill="${C.pink}" opacity=".3"/><circle cx="600" cy="712" r="13" fill="${C.pink}"/>` + pill(600, 784 - 4, 'YOU ARE HERE', C.pink, pop(t, s.start + 3), 18);
    }
    out += scl(500, 680, dk, d);
    if (r > 7) {
      out += pill(500, 862, 'lower half of the room', C.peach, pop(t, s.start + 7.2), 22);
    }
    if (r > 4) out += pill(500, 920, '4H · read the room', C.purple, pop(t, s.start + 4), 26);
    // Right: the 1H map with the room faint behind.
    const mk = pop(t, s.start + 10.4, 0.7);
    if (mk > 0) {
      const glow = r > 18 ? 0.5 + 0.5 * Math.sin(r * 5) : 0;
      let m = `<rect x="980" y="400" width="780" height="520" rx="22" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
        <rect x="1010" y="440" width="720" height="450" rx="10" fill="${C.purpleL}" opacity="${0.18 + glow * 0.15}" stroke="${C.purple}" stroke-width="${3 + glow * 3}" stroke-dasharray="14 10"/>`;
      const pts = [[1040, 860], [1120, 740], [1190, 800], [1300, 640], [1370, 710], [1490, 540], [1560, 600], [1690, 470]];
      const pk = along(pts, ease(seg(r, 11, 16.6)));
      m += poly(pk.drawn, C.teal, 6, { dash: '2 16' });
      pk.drawn.forEach((p, i) => { if (i > 0) m += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="13" fill="${C.tealD}" transform="rotate(${30} ${p[0]} ${p[1]})"/>`; });
      m += `<circle cx="${pk.x}" cy="${pk.y}" r="12" fill="${C.dark}"/>`;
      m += pill(1370, 430, '1H · build the map', C.teal, pop(t, s.start + 11.2), 26);
      out += scl(1370, 660, mk, m);
      if (r > 15.6) out += pill(1110, 990, 'correcting', '#C9B9AE', pop(t, s.start + 15.6), 22) + pill(1340, 990, 'progressing ✓', C.teal, pop(t, s.start + 15.9), 22) + pill(1570, 990, 'ranging', '#C9B9AE', pop(t, s.start + 16.2), 22);
      if (r > 18) out += pill(1370, 880, 'keep the room in view', C.purple, pop(t, s.start + 18), 22);
    }
    // Shopper and kid.
    const sx = 790;
    const bag = `<g transform="translate(0,10)"><rect x="-26" y="-6" width="52" height="56" rx="6" fill="${C.pink}"/><path d="M-12,-6 Q0,-28 12,-6" stroke="${C.pink}" stroke-width="5" fill="none"/></g>`;
    const sh = { x: sx, y: 1000, scale: 0.85, look: LK.b, seed: 3, flip: r < 10.8, walking: false, hold: bag, talk: ctx.talking && (r > 2.4 && r < 6.4 || r > 10.8 && r < 15) };
    out += person(t, sh);
    out += card(r < 10.8 ? 760 : 840, 560, [r < 10.8 ? 'Where am I?' : 'How am I moving?'], { k: back(seg(r, r < 10.8 ? 2.4 : 11, r < 10.8 ? 2.8 : 11.4)), op: r < 10.8 ? 1 - seg(r, 10, 10.4) : 1, fs: 28, tx: -20 });
    const kid = { x: 900, y: 1000, scale: 0.55, look: LK.k, seed: 8, frontArm: { a1: -70, a2: -90 } };
    const kh = handOf(kid);
    out += person(t, kid) + `<path d="M${kh.x},${kh.y} Q${kh.x + 10},${kh.y - 60} ${kh.x + Math.sin(r * 2) * 10},${kh.y - 120}" stroke="${C.muted}" stroke-width="2" fill="none"/><ellipse cx="${kh.x + Math.sin(r * 2) * 10}" cy="${kh.y - 150}" rx="26" ry="32" fill="${C.teal}"/>`;
    return out;
  };

  // Fish tank: the 1H fish swims inside the 4H tank, breaks the last lower high.
  LIVE['s10-fish-tank'] = (s, t, ctx) => {
    const r = t - s.start;
    const tk = pop(t, s.start + 0.3, 0.7);
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    let g = `<rect x="400" y="900" width="1120" height="100" rx="10" fill="#C9A27A"/><rect x="400" y="900" width="1120" height="16" fill="#9B6A45"/>
      <rect x="420" y="400" width="1080" height="500" rx="14" fill="${C.tealL}" opacity=".45"/>
      <path d="M420,430 ${Array.from({ length: 28 }, (_, i) => `Q${435 + i * 40},${422 + Math.sin(r * 3 + i) * 6} ${455 + i * 40},430`).join(' ')} L1500,430" stroke="#fff" stroke-width="4" fill="none"/>
      <rect x="420" y="850" width="1080" height="50" fill="${C.peachL}"/>`;
    [[520, 0], [700, 1], [1340, 2], [1460, 0]].forEach(([x, i]) => { const sw = Math.sin(r * 2 + i) * 10; g += `<path d="M${x},860 Q${x - 20 + sw},780 ${x + sw},720 M${x + 20},860 Q${x + 30 + sw},790 ${x + 24 + sw},750" stroke="${C.tealD}" stroke-width="12" fill="none" stroke-linecap="round"/>`; });
    for (let i = 0; i < 8; i++) { const p = ((r * 0.35) + i / 8) % 1; g += `<circle cx="${560 + (i * 157) % 900 + Math.sin(p * 9 + i) * 8}" cy="${860 - p * 420}" r="${5 + (i % 3) * 3}" fill="none" stroke="#fff" stroke-width="3" opacity="${1 - p}"/>`; }
    g += `<rect x="420" y="400" width="1080" height="500" rx="14" fill="none" stroke="#fff" stroke-width="12"/><rect x="410" y="390" width="1100" height="20" rx="8" fill="${C.purple}"/>`;
    out += scl(960, 700, tk, g);
    if (r > 1.6) out += pill(1680, 404, '🚪 EXTERNAL HIGH', C.purple, pop(t, s.start + 1.6), 24) + pill(1680, 878, '🚪 EXTERNAL LOW', C.purple, pop(t, s.start + 2), 24);
    const pts = [[500, 520], [600, 640], [680, 590], [780, 720], [860, 670], [960, 790], [1070, 630], [1180, 560], [1300, 610], [1420, 500]];
    const k = seg(r, 3.6, 15);
    const p = along(pts, k);
    out += poly(p.drawn, C.pink, 5, { dash: '4 14', op: 0.8 });
    [[2, 'LH', -1], [3, 'LL', 1], [4, 'LH', -1], [5, 'LL', 1]].forEach(([i, lab, d]) => { if (p.seg >= i) out += dot(pts[i][0], pts[i][1], C.pink, 8) + pill(pts[i][0], pts[i][1] + d * 34, lab, C.pink, 1, 20); });
    if (r > 9) {
      const lk = ease(seg(r, 9, 10));
      out += hline(860, lerp(860, 1480, lk), 670, C.gold, { w: 5 }) + pill(1230, 694, 'last 1H lower high', C.gold, pop(t, s.start + 9.2), 22);
    }
    if (p.seg >= 6 || k >= 1) out += pill(1110, 540, 'closes above: potential shift', C.teal, pop(t, s.start + 12), 22);
    const a = pts[p.seg], b = pts[p.seg + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    out += fish(t, p.x, p.y, 0.8, { rot: ang * 0.6 });
    // Kid at the glass and a cat on top.
    const kid = { x: 290, y: 1000, scale: 0.9, look: LK.j, seed: 4, frontArm: { a1: -30, a2: -20 }, talk: ctx.talking };
    out += popPerson(t, s.start + 0.6, kid);
    const paw = r > 15.6 && r < 17 ? Math.sin(seg(r, 15.6, 17) * Math.PI) * 50 : 0;
    out += `<path d="M1300,400 Q${1290 - paw * 0.3},${420 + paw} ${1280 - paw * 0.2},${430 + paw}" stroke="#D9CFC8" stroke-width="16" stroke-linecap="round" fill="none"/>` + cat(t, 1330, 392, 0.65, { col: '#D9CFC8', dark: C.muted, flip: true });
    if (r > 15) out += pill(960, 950, 'still inside the same tank ✓', C.teal, pop(t, s.start + 15), 26);
    return out;
  };

  /* ================= Lesson 8 · Finding Relevant 1H Swings ================= */

  // Block tower: pull a minor block, it stands; pull the base, the leg falls.
  LIVE['s10-jenga'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="980" width="1920" height="100" fill="#F3E3D7"/>`;
    // Chart.
    const ck = pop(t, s.start + 0.3, 0.6);
    out += scl(530, 680, ck, `<rect x="140" y="400" width="780" height="560" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
    const pts = [[200, 600], [250, 880], [340, 740], [380, 790], [480, 640], [520, 690], [620, 560], [660, 610], [760, 480], [820, 540], [870, 500]];
    out += poly(along(pts, ease(seg(r, 0.6, 3.4))).drawn, C.dark, 6, { op: 0.85 });
    [3, 5, 7, 9].forEach((i, j) => { if (r > 3.6) out += scl(pts[i][0], pts[i][1], pop(t, s.start + 3.6 + j * 0.2, 0.4), dot(pts[i][0], pts[i][1], '#C9B9AE', 9)); });
    if (r > 7.2) out += `<circle cx="${pts[9][0]}" cy="${pts[9][1]}" r="26" fill="none" stroke="${C.peach}" stroke-width="5" stroke-dasharray="8 6"/>` + pill(pts[9][0] - 20, pts[9][1] + 50, 'minor wiggle', C.peach, pop(t, s.start + 7.2), 22);
    if (r > 12.2) {
      const gl = 0.5 + 0.5 * Math.sin(r * 5);
      out += hline(250, 900, 880, C.teal, { w: 5 }) + `<circle cx="250" cy="880" r="${16 + gl * 6}" fill="${C.teal}" opacity=".35"/>` + dot(250, 880, C.teal, 13) + pill(420, 924, 'the leg starts here', C.teal, pop(t, s.start + 12.2), 24);
    }
    // Tower.
    const BX = 1330, BW = 240, BH = 40, N = 12;
    const fail = ease(seg(r, 15.8, 17)) * (1 - ease(seg(r, 19.4, 20.4)));
    const pull = ease(seg(r, 7, 8.6));
    const wob = r > 8 && r < 11 ? Math.sin(r * 12) * 2.5 * (1 - seg(r, 8, 11)) : 0;
    const tilt = fail * 16 + wob;
    let tower = '';
    for (let i = N - 1; i >= 1; i--) {
      const y = 980 - (i + 1) * BH, side = i % 2;
      const col = [C.peachL, '#F3D6B4', C.peachL][i % 3];
      if (side) tower += [0, 1, 2].map(j => `<rect x="${BX - BW / 2 + j * 80 + 2}" y="${y + 2}" width="76" height="${BH - 4}" rx="6" fill="${col}" stroke="#E0B47E" stroke-width="3"/>`).join('');
      else tower += `<rect x="${BX - BW / 2}" y="${y + 2}" width="${BW}" height="${BH - 4}" rx="6" fill="${col}" stroke="#E0B47E" stroke-width="3"/>`;
      if (i === 9 && side) tower = tower.replace(/<rect x="[^"]*" y="[^"]*" width="76"[^>]*\/>$/, '');
    }
    const baseOut = ease(seg(r, 15.8, 16.6)) * (1 - ease(seg(r, 19.4, 20.2)));
    const baseX = BX - baseOut * 300;
    const bg = r > 12.2 ? 0.5 + 0.5 * Math.sin(r * 5) : 0;
    out += `<g transform="rotate(${tilt} ${BX + BW / 2} 980)">${tower}</g>`;
    out += `<rect x="${baseX - BW / 2}" y="${942}" width="${BW}" height="36" rx="6" fill="${C.teal}" stroke="${C.tealD}" stroke-width="${3 + bg * 4}"/>`;
    const p1 = { x: 1640, y: 980, scale: 0.85, look: LK.i, seed: 3, flip: true, frontArm: r > 6.4 ? { a1: -20, a2: 0 } : undefined, talk: false };
    const p2 = { x: 1010, y: 980, scale: 0.85, look: LK.h, seed: 6, frontArm: r > 12.2 ? { a1: 40, a2: 50 } : undefined, talk: ctx.talking && r > 12 && r < 15.4, mood: fail > 0.5 ? 'sad' : undefined };
    // Pulled block travels to player one's hand.
    const h1 = handOf(p1);
    const px = lerp(BX + 80, h1.x - 20, pull), py = lerp(980 - 10 * BH + 2, h1.y - 18, pull);
    out += `<rect x="${px - 38}" y="${py}" width="76" height="${BH - 4}" rx="6" fill="${C.peachL}" stroke="#E0B47E" stroke-width="3" transform="rotate(${pull > 0 ? 0 : tilt * 0.4} ${BX} 980)"/>`;
    out += popPerson(t, s.start + 1.2, p1) + popPerson(t, s.start + 1.4, p2);
    out += card(1640, 560, ['Still standing!'], { k: back(seg(r, 9.6, 10)), op: 1 - seg(r, 12, 12.4), fs: 26, tx: 20 });
    if (r > 16.6 && r < 19.6) out += pill(1330, 470, 'if it fails, the leg fails', C.pink, pop(t, s.start + 16.6), 26);
    if (r > 20.4) out += pill(1330, 470, 'the swing the leg depends on', C.teal, pop(t, s.start + 20.4), 26) + A.sparkle(BX, 960, s.start + 20.4, t, C.teal);
    return out;
  };

  // Talent-show judges score two swings: the closest one and the leg origin.
  LIVE['s10-judges'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="940" width="1920" height="140" fill="#F3E3D7"/><rect x="0" y="936" width="1920" height="8" fill="${C.purpleL}"/>`;
    [470, 860].forEach(x => { out += `<polygon points="${x - 50},360 ${x + 50},360 ${x + 170},940 ${x - 170},940" fill="#FFF3C4" opacity=".35"/>`; });
    // Scoreboard.
    const bk = pop(t, s.start + 2.6, 0.6);
    const rows = [['Closest to price', 4.8, '✓', 'maybe'], ['Defines the leg', 8.6, '✗', '✓'], ['Still intact', 12.8, '✗', '✓'], ['Fits the 4H room', 14.8, 'maybe', '✓']];
    let b = `<rect x="220" y="384" width="900" height="300" rx="22" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
      ${txt(830, 428, 'CLOSEST', { fs: 22, col: TX.pink, ls: 2 })}${txt(1010, 428, 'LEG ORIGIN', { fs: 22, col: TX.teal, ls: 2 })}`;
    rows.forEach(([lab, at, a, c], i) => {
      const y = 482 + i * 56, k = clamp((r - at) / 0.3);
      b += `<line x1="240" x2="1100" y1="${y - 30}" y2="${y - 30}" stroke="#F1E7E1" stroke-width="2"/>` + txt(250, y + 8, lab, { fs: 26, anchor: 'start', w: 700, op: 0.4 + 0.6 * k });
      const mark = (x, m, kk) => kk <= 0 ? '' : m === '✓' ? check(x, y, back(kk), C.teal, 20) : m === '✗' ? cross(x, y, back(kk), C.pink, 20) : pill(x, y, 'maybe', C.peach, back(kk), 18);
      b += mark(830, a, k) + mark(1010, c, clamp((r - at - 0.4) / 0.3));
    });
    out += scl(670, 534, bk, b);
    // Contestants.
    const ck = pop(t, s.start + 0.8, 0.6), ck2 = pop(t, s.start + 1.1, 0.6);
    const win = r > 17.4;
    out += scl(470, 940, ck, candleGuy(t, 470, 940, 1, { up: false, h: 100, seed: 1, mood: win ? 'sad' : undefined }) + pill(470, 990, 'CLOSEST', C.pink, 1, 22));
    out += scl(860, 940, ck2, candleGuy(t, 860, 940, 1.1, { up: true, h: 120, seed: 4, arms: win ? 'up' : undefined, talk: false }) + pill(860, 990, 'LEG ORIGIN', C.teal, 1, 22));
    if (win) {
      const tk = pop(t, s.start + 17.4, 0.6);
      out += scl(860, 760, tk, `<g transform="translate(860,740)"><path d="M-36,-50 L36,-50 L30,-6 Q0,20 -30,-6 Z" fill="${C.gold}"/><rect x="-8" y="10" width="16" height="22" fill="${C.gold}"/><rect x="-28" y="30" width="56" height="12" rx="4" fill="#C98A1F"/>
        <path d="M-36,-40 Q-60,-36 -50,-14 Q-44,-6 -30,-12 M36,-40 Q60,-36 50,-14 Q44,-6 30,-12" stroke="${C.gold}" stroke-width="6" fill="none"/></g>`);
      for (let i = 0; i < 18; i++) { const p = ((r - 17.4) * 0.5 + i / 18) % 1; out += `<rect x="${600 + (i * 97) % 520 + Math.sin(p * 8 + i) * 20}" y="${380 + p * 560}" width="12" height="18" rx="3" fill="${[C.pink, C.teal, C.peach, C.purple][i % 4]}" transform="rotate(${p * 400 + i * 30} ${600 + (i * 97) % 520} ${380 + p * 560})" opacity="${1 - p * 0.6}"/>`; }
    }
    // Judges with paddles.
    const J = [[1330, LK.a, 2], [1530, LK.e, 5], [1730, LK.k, 8]];
    const lastRow = rows.filter(rw => r >= rw[1]).pop();
    J.forEach(([x, look, seed], i) => {
      const raising = lastRow && r - lastRow[1] < 1.8;
      const good = lastRow && lastRow[3] === '✓';
      const paddle = `<g><line x1="0" y1="0" x2="0" y2="-50" stroke="#9B6A45" stroke-width="7"/><circle cx="0" cy="-80" r="38" fill="${good ? C.teal : C.peach}" stroke="#fff" stroke-width="5"/><text y="-68" font-size="34" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${good ? '✓' : '~'}</text></g>`;
      const jp = { x, y: 1000, scale: 0.78, look, seed, flip: true, frontArm: raising ? { a1: -80, a2: -90 } : { a1: 60, a2: 110 }, hold: raising ? paddle : '' };
      out += popPerson(t, s.start + 0.5 + i * 0.2, jp);
    });
    out += `<rect x="1200" y="850" width="640" height="150" rx="14" fill="${C.pink}"/><rect x="1200" y="850" width="640" height="24" rx="10" fill="${C.pinkL}"/>`;
    out += txt(1520, 942, 'JUDGES', { fs: 34, col: '#fff', ls: 6, font: 'Playfair Display' });
    return out;
  };

  /* ================= Lesson 9 · MSS as Directional Information ================= */

  // Farm weathervane: the 1H vane swings back toward the bullish 4H wind.
  LIVE['s10-weathervane'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="${C.tealL}"/><path d="M0,1000 Q480,980 960,1000 T1920,1000" fill="${C.tealL}"/>`;
    out += cloud(((r * 30) % 2200) - 200, 470, 0.8, 0.9) + cloud(((r * 20 + 1100) % 2200) - 200, 560, 0.6, 0.8);
    // Barn.
    const bk = pop(t, s.start + 0.3, 0.7);
    out += scl(510, 1000, bk, `<rect x="270" y="640" width="480" height="360" fill="${C.pink}"/><path d="M240,650 L510,500 L780,650 Z" fill="#C2475F"/>
      <rect x="440" y="820" width="140" height="180" fill="#fff"/><path d="M440,820 L580,1000 M580,820 L440,1000" stroke="${C.pink}" stroke-width="10"/>
      <rect x="470" y="560" width="80" height="70" fill="#fff"/>
      <rect x="320" y="676" width="380" height="76" rx="12" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
      <text x="510" y="726" font-size="30" font-weight="900" text-anchor="middle" fill="${TX.purple}" font-family="DM Sans">4H ROOM: BULLISH ↑</text>
      <line x1="510" y1="500" x2="510" y2="410" stroke="${C.dark}" stroke-width="6"/>`);
    // Vane: down during the correction, swings up at the MSS.
    const swing = ease(seg(r, 14.4, 15.8));
    const ang = lerp(68, -68, swing) + Math.sin(r * 2.6) * (swing < 1 ? 7 : 3);
    if (bk > 0.5) {
      out += txt(560, 404, '▲', { fs: 24, col: TX.teal }) + txt(560, 470, '▼', { fs: 24, col: TX.pink });
      out += `<g transform="translate(510,410) rotate(${ang})"><line x1="-70" y1="0" x2="80" y2="0" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/><path d="M80,-14 L106,0 L80,14 Z" fill="${swing > 0.5 ? C.teal : C.pink}"/><path d="M-70,-20 L-46,0 L-70,20 L-84,0 Z" fill="${C.dark}"/>
        <g transform="translate(10,-6)"><path d="M-30,0 Q-30,-34 0,-36 Q20,-50 30,-30 L40,-26 L28,-20 Q24,0 -30,0 Z" fill="${C.dark}"/><path d="M14,-46 l6,-12 l6,12" fill="${C.pink}"/></g></g><circle cx="510" cy="410" r="9" fill="${C.gold}"/>`;
    }
    // Chalkboard on an easel with the 1H.
    const ek = pop(t, s.start + 1.0, 0.7);
    let e = `<g stroke="#9B6A45" stroke-width="12" stroke-linecap="round"><line x1="1120" y1="880" x2="1080" y2="1000"/><line x1="1580" y1="880" x2="1620" y2="1000"/></g>
      <rect x="980" y="400" width="740" height="490" rx="18" fill="#3D3550" stroke="#9B6A45" stroke-width="14"/>
      ${txt(1050, 450, '1H', { fs: 30, col: '#fff', anchor: 'start', font: 'Playfair Display', op: 0.9 })}`;
    const pts = [[1040, 500], [1120, 620], [1190, 580], [1280, 700], [1340, 650], [1430, 780], [1540, 600], [1640, 630]];
    const pk = along(pts.slice(0, 6), ease(seg(r, 3, 8))), pk2 = ease(seg(r, 11.4, 13.4));
    let drawn = pk.drawn;
    if (pk2 > 0) drawn = drawn.concat(along(pts.slice(5), pk2).drawn.slice(1));
    e += poly(drawn, '#fff', 6, { op: 0.9 });
    [[2, 'LH', -1], [3, 'LL', 1], [4, 'LH', -1], [5, 'LL', 1]].forEach(([i, lab, d]) => { if (pk.seg >= i || pk.f >= 1 && i <= 5) e += txt(pts[i][0], pts[i][1] + d * 26 + (d > 0 ? 18 : 0), lab, { fs: 22, col: C.pinkL }); });
    if (r > 8.2) e += hline(1340, lerp(1340, 1690, ease(seg(r, 8.2, 9.2))), 650, C.gold, { w: 5 }) + txt(1600, 640, 'last LH', { fs: 22, col: C.gold });
    if (r > 13.4) e += pill(1500, 540, 'bullish MSS', C.teal, pop(t, s.start + 13.4), 24);
    out += scl(1350, 700, ek, e);
    if (swing >= 1) out += A.sparkle(560, 360, s.start + 15.8, t, C.teal);
    // Farmer with a clipboard and a chicken.
    const clip = `<g transform="translate(0,-20) rotate(-10)"><rect x="-26" y="-34" width="52" height="68" rx="6" fill="#C9A27A"/><rect x="-20" y="-24" width="40" height="52" fill="#fff"/><path d="M-12,-10 L12,-10 M-12,2 L12,2 M-12,14 L6,14" stroke="${C.muted}" stroke-width="3"/></g>`;
    const fm = { x: 860, y: 1000, scale: 0.85, look: LK.g, seed: 4, frontArm: { a1: 20, a2: -80 }, hold: clip, talk: ctx.talking && r > 17.8 && r < 21 };
    out += popPerson(t, s.start + 0.8, fm) + hat(t, fm, 'fedora', C.gold);
    out += card(880, 560, ['Noted on', 'the 1H map.'], { k: back(seg(r, 17.8, 18.2)), fs: 26, tx: -30 });
    const chx = 700 + Math.sin(r * 0.5) * 60;
    out += chicken(t, chx, 1000, 0.7, { peck: true, flip: Math.cos(r * 0.5) < 0 });
    return out;
  };

  // Track: MSS sounds on the board, one runner false-starts, the starter's gun (Dayli ICC) comes later.
  LIVE['s10-false-start'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="780" width="1920" height="300" fill="${C.pinkL}" opacity=".7"/>
      ${[780, 880, 980].map(y => `<rect x="0" y="${y}" width="1920" height="6" fill="#fff"/>`).join('')}
      <rect x="520" y="780" width="10" height="300" fill="#fff"/>`;
    // Scoreboard.
    const sk = pop(t, s.start + 0.3, 0.6);
    let b = `<rect x="1180" y="384" width="600" height="250" rx="20" fill="${C.dark}"/><rect x="1300" y="634" width="20" height="150" fill="${C.muted}"/><rect x="1640" y="634" width="20" height="150" fill="${C.muted}"/>`;
    [['4H: bullish room ✓', 2.4, '#9FE3D8'], ['1H: bullish MSS ✓', 3.6, '#9FE3D8'], ['ENTRY: not yet', 12.2, C.peachL]].forEach(([l, at, col], i) => {
      const on = r > at, bl = on && r < at + 1.4 ? (Math.floor(r * 6) % 2) : 1;
      b += txt(1220, 450 + i * 70, l, { fs: 34, col: on ? col : '#5E4A40', anchor: 'start', op: on ? (bl ? 1 : 0.4) : 1 });
    });
    out += scl(1480, 510, sk, b) + bird(t, 1700, 384, 0.6, { col: C.peach, wing: '#E08E2E', hop: r > 3.6 && r < 5 });
    // Patient runner.
    const p1 = { x: 400, y: 880, scale: 0.78, look: LK.buyer, seed: 2, frontArm: { a1: 110, a2: 70 }, backArm: { a1: 60, a2: 100 } };
    out += popPerson(t, s.start + 0.8, p1);
    // Eager runner.
    let ex = 590, walking = false, flip = false;
    if (r > 6.6) { ex = lerp(590, 1000, ease(seg(r, 6.6, 8.8))); walking = r < 8.8; }
    if (r > 10.4) { ex = lerp(1000, 590, ease(seg(r, 10.4, 12.4))); walking = r < 12.4; flip = r < 12.4; }
    const p2 = { x: ex, y: 1000, scale: 0.84, look: LK.f, seed: 6, walking, flip, mood: r > 9 && r < 16 ? 'sad' : undefined, talk: ctx.talking && r > 6.6 && r < 8 };
    out += popPerson(t, s.start + 1.0, p2);
    if (r > 6.6 && r < 8.6) out += txt(ex + 60, 640, 'GO!', { fs: 40, col: TX.peach, font: 'Playfair Display' });
    // Starter with a pistol and a flag.
    const flagUp = r > 9 && r < 11.4;
    const pistol = `<g><rect x="-8" y="-6" width="16" height="30" rx="4" fill="${C.dark}"/><rect x="-8" y="-14" width="46" height="14" rx="4" fill="${C.dark}"/></g>`;
    const flag = `<g><line x1="0" y1="0" x2="0" y2="-90" stroke="${C.dark}" stroke-width="5"/><path d="M0,-90 Q${-30 + Math.sin(t * 12) * 8},-96 -60,-80 L-60,-44 Q${-30 - Math.sin(t * 12) * 8},-56 0,-50 Z" fill="${C.pink}"/></g>`;
    const st = { x: 1520, y: 1000, scale: 0.9, look: LK.a, seed: 3, flip: true, frontArm: flagUp ? { a1: -80, a2: -95 } : { a1: -60, a2: -100 }, hold: flagUp ? flag : pistol, talk: ctx.talking && r > 9 && r < 11.4 };
    out += popPerson(t, s.start + 1.2, st) + hat(t, st, 'cap', C.purple);
    if (flagUp) {
      const wh = Math.floor(r * 8) % 2;
      out += card(1300, 640, ['False start!'], { k: back(seg(r, 9, 9.3)), fs: 30, col: TX.pink, stroke: C.pinkL, tx: 60 }) + txt(1640, 600, wh ? 'tweet!' : '', { fs: 28, col: TX.purple, font: 'Playfair Display' });
      out += stamp(1000, 700, 'MSS ≠ ENTRY', TX.pink, t, s.start + 9.4, { fs: 32, rot: -8 });
    }
    if (r > 12.4) {
      const h = handOf(st);
      out += pill(h.x - 40, h.y - 70, 'Dayli ICC · 1-minute · later', C.purple, pop(t, s.start + 12.4), 22);
    }
    if (r > 16.2) out += pill(400, 470, 'information ✓', C.teal, pop(t, s.start + 16.2), 26) + A.sparkle(400, 540, s.start + 16.2, t, C.teal);
    return out;
  };

  /* ================= Lesson 10 · External Objectives & Liquidity ================= */

  // Crossroads signpost of potential objectives; the hiker picks the one that fits the thesis.
  LIVE['s10-signpost'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<path d="M1380,1000 L1700,500 L1900,1000 Z" fill="${C.purpleL}" opacity=".6"/><path d="M1640,594 L1700,500 L1758,590 Q1720,575 1700,596 Q1676,578 1640,594 Z" fill="#fff"/>
      <path d="M0,960 Q480,900 960,950 T1920,940 L1920,1080 L0,1080 Z" fill="${C.tealL}"/><path d="M200,1080 Q600,1000 1000,990 L1100,1080 Z" fill="#F3E3D7"/>`;
    const fk = pop(t, s.start + 0.6, 0.6);
    if (fk > 0) out += scl(1700, 500, fk, `<line x1="1700" y1="500" x2="1700" y2="420" stroke="${C.dark}" stroke-width="5"/><path d="M1700,420 L1750,432 L1700,446 Z" fill="${C.teal}"/>`);
    const pk = pop(t, s.start + 0.3, 0.6);
    out += scl(1000, 1000, pk, `<rect x="988" y="410" width="24" height="590" rx="8" fill="#9B6A45"/><circle cx="1000" cy="408" r="16" fill="#C9A27A"/>`);
    const signs = [[3.0, '4H EXTERNAL HIGH', 1, 470, C.teal, true], [4.4, '4H EXTERNAL LOW', -1, 560, C.pink, false], [5.8, 'PREVIOUS HIGH', 1, 650, C.teal, true], [7.6, 'STRUCTURAL BOUNDARY', -1, 740, C.purple, false], [9.0, 'EXTERNAL LIQUIDITY 💧', 1, 830, C.peach, true]];
    const pick = r > 11.6;
    signs.forEach(([at, label, dir, y, col, fits], i) => {
      const k = pop(t, s.start + at, 0.5);
      if (k <= 0) return;
      const w = tw(label, 26) + 90, sway = Math.sin(r * 2 + i) * 1.5;
      const dim = pick && i !== 0 ? 0.4 : 1, glow = pick && i === 0 ? 0.5 + 0.5 * Math.sin(r * 5) : 0;
      const D = n => dir * n;
      out += `<g transform="translate(1000,${y}) rotate(${(dir > 0 ? -5 : 5) + sway}) scale(${k})" opacity="${dim}">
        <path d="M${D(10)},-32 L${D(w - 30)},-32 L${D(w)},0 L${D(w - 30)},32 L${D(10)},32 Z" fill="${col}" stroke="${glow ? C.gold : '#fff'}" stroke-width="${4 + glow * 6}"/>
        <text x="${D((w - 10) / 2 + 2)}" y="9" font-size="26" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${label}</text></g>`;
    });
    out += bird(t, 1000, 394, 0.6, { hop: r > 3 && r < 9, col: C.purple, wing: '#5E56B8' });
    // Hiker and dog.
    const hx = lerp(-100, 430, ease(seg(r, 9.6, 11.8))), walking = r > 9.6 && r < 11.8;
    const pack = '';
    const hk = { x: hx, y: 1000, scale: 0.9, look: LK.c, seed: 4, walking, frontArm: pick && r < 15 ? { a1: -60, a2: -50 } : undefined, talk: ctx.talking && r > 11.6 && r < 14.4, hold: pack };
    if (r > 9.6) {
      const hp = headOf(t, hk);
      out += `<rect x="${hx - 70 * 0.9}" y="${hp.y + 70}" width="${44}" height="${90}" rx="14" fill="${C.peach}" stroke="#E08E2E" stroke-width="4"/>` + person(t, hk) + hat(t, hk, 'cap', C.pink);
      out += dog(t, hx - 150, 1000, 0.55, { run: walking, happy: pick });
      out += pill(hx, 1040, 'bullish thesis', C.teal, pop(t, s.start + 10.4), 22);
    }
    out += card(330, 600, ['Bullish?', 'Look up.'], { k: back(seg(r, 11.8, 12.2)), op: 1 - seg(r, 15, 15.4), fs: 26, tx: 60 });
    out += stamp(1500, 450, 'POTENTIAL', TX.purple, t, s.start + 15, { fs: 30, rot: -8, fill: '#fff' });
    if (r > 17.4) out += pill(1500, 990, 'guaranteed?', C.pink, pop(t, s.start + 17.4), 26) + cross(1640, 990, pop(t, s.start + 18, 0.5), C.pink, 26);
    return out;
  };

  function plane(t, x, y, s, o = {}) {
    const col = o.col || '#fff', acc = o.acc || C.teal;
    return `<g transform="translate(${x},${y}) scale(${s}) rotate(${o.rot || 0})">
      <path d="M-150,-30 L-180,-110 L-140,-110 L-90,-40 Z" fill="${acc}"/>
      <path d="M-170,-40 Q-170,-70 -120,-70 L110,-70 Q170,-66 190,-30 Q170,0 110,0 L-130,0 Q-170,0 -170,-40 Z" fill="${col}" stroke="#E9DED6" stroke-width="4"/>
      <path d="M150,-60 Q176,-50 186,-34 L144,-34 Z" fill="${C.tealL}"/>
      ${[-90, -50, -10, 30, 70].map(wx => `<circle cx="${wx}" cy="-40" r="10" fill="${C.tealL}"/>`).join('')}
      <path d="M-30,-20 L40,-20 L-10,40 L-50,40 Z" fill="${acc}"/>
      <rect x="-170" y="-36" width="340" height="8" fill="${acc}" opacity=".6"/>
      ${o.gear !== false ? `<line x1="-80" y1="0" x2="-80" y2="22" stroke="${C.dark}" stroke-width="5"/><circle cx="-80" cy="28" r="10" fill="${C.dark}"/><line x1="110" y1="0" x2="110" y2="22" stroke="${C.dark}" stroke-width="5"/><circle cx="110" cy="28" r="10" fill="${C.dark}"/>` : ''}
    </g>`;
  }

  // Two runways, same bullish idea: one has room to fly, one hits a wall.
  LIVE['s10-runway'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="960" width="1920" height="120" fill="${C.tealL}"/>`;
    const rw = (y, at) => { const k = ease(seg(r, at, at + 0.8)); return `<rect x="200" y="${y}" width="${1560 * k}" height="80" rx="10" fill="#E9DED6"/>${Array.from({ length: 14 }, (_, i) => 240 + i * 110 < 200 + 1560 * k - 40 ? `<rect x="${240 + i * 110}" y="${y + 36}" width="60" height="8" rx="4" fill="#fff"/>` : '').join('')}`; };
    out += rw(560, 0.3) + rw(830, 0.6);
    out += txt(150, 540, 'CHART 1', { fs: 22, col: C.muted, anchor: 'start', ls: 2 }) + txt(150, 810, 'CHART 2', { fs: 22, col: C.muted, anchor: 'start', ls: 2 });
    // Objectives.
    const flag = (x, y, col, k) => k <= 0 ? '' : scl(x, y, k, `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 110}" stroke="${C.dark}" stroke-width="6"/><path d="M${x},${y - 110} Q${x + 30 + Math.sin(t * 6) * 6},${y - 116} ${x + 60},${y - 100} L${x + 60},${y - 70} Q${x + 30 - Math.sin(t * 6) * 6},${y - 80} ${x},${y - 74} Z" fill="${col}"/>`);
    out += flag(1700, 560, C.purple, pop(t, s.start + 3.2)) + pill(1600, 400, '4H external high', C.purple, pop(t, s.start + 3.4), 22);
    const wk = pop(t, s.start + 8.4);
    if (wk > 0) out += scl(740, 910, wk, `<rect x="720" y="800" width="40" height="110" rx="6" fill="${C.pink}"/>${[0, 1, 2].map(i => `<rect x="720" y="${812 + i * 34}" width="40" height="12" fill="#fff"/>`).join('')}`) + pill(740, 772, 'high right above', C.pink, pop(t, s.start + 8.6), 22);
    // Distance arrows.
    const da = ease(seg(r, 5, 6.4)), db = ease(seg(r, 9.4, 10.2));
    if (da > 0) out += `<line x1="500" x2="${lerp(500, 1660, da)}" y1="520" y2="520" stroke="${C.teal}" stroke-width="6" stroke-dasharray="14 10"/><path d="M${lerp(500, 1660, da)},506 L${lerp(500, 1660, da) + 22},520 L${lerp(500, 1660, da)},534 Z" fill="${C.teal}"/>` + pill(1080, 490, 'lots of room', C.teal, pop(t, s.start + 6.2), 24);
    if (db > 0) out += `<line x1="500" x2="${lerp(500, 690, db)}" y1="790" y2="790" stroke="${C.pink}" stroke-width="6" stroke-dasharray="10 8"/>` + pill(470, 740, 'barely any room', C.pink, pop(t, s.start + 10.2), 22);
    // Plane one: rolls, lifts off.
    const roll = ease(seg(r, 6.4, 10)), lift = ease(seg(r, 9.2, 12));
    const ax = lerp(420, 1160, roll) + lift * 300, ay = 600 - lift * 130;
    out += scl(ax, ay, pop(t, s.start + 1.2), plane(t, ax, ay, 0.62, { rot: -lift * 10, gear: lift < 0.5 }));
    if (roll > 0 && roll < 1) out += [0, 1, 2].map(i => `<line x1="${ax - 130 - i * 26}" x2="${ax - 170 - i * 26}" y1="${ay - 30 + i * 12}" y2="${ay - 30 + i * 12}" stroke="${C.muted}" stroke-width="4" opacity=".4"/>`).join('');
    if (lift >= 1) out += A.sparkle(ax + 80, ay - 40, s.start + 12, t, C.teal);
    // Plane two: rolls a bit and brakes.
    const br = 1 - Math.pow(1 - seg(r, 12.4, 13.6), 2), bx = lerp(420, 590, br);
    out += scl(bx, 870, pop(t, s.start + 1.5), plane(t, bx, 870, 0.62, { acc: C.pink, rot: r > 13.4 && r < 14 ? 2 : 0 }));
    if (r > 13.4 && r < 15) out += [0, 1, 2].map(i => `<path d="M${bx + 80 + i * 18},${900 + i * 3} q10,-8 20,0" stroke="${C.dark}" stroke-width="4" fill="none" opacity="${1 - seg(r, 13.4, 15)}"/>`).join('');
    out += pill(560, 1000, 'same bullish idea', C.purple, pop(t, s.start + 1.6), 24);
    // Marshaller with paddles.
    const wave = Math.sin(t * 7) * 20;
    const paddle = `<g><line x1="0" y1="0" x2="0" y2="-40" stroke="${C.dark}" stroke-width="6"/><circle cx="0" cy="-58" r="22" fill="${C.peach}"/></g>`;
    const mk = { x: 1300, y: 1040, scale: 0.72, look: LK.i, seed: 5, flip: true, frontArm: r > 12.8 && r < 16 ? { a1: -90 + wave, a2: -100 } : { a1: -60 + wave * 0.5, a2: -90 }, backArm: { a1: -100 - wave, a2: -90 }, hold: paddle, talk: ctx.talking && r > 13.6 && r < 15.4 };
    out += popPerson(t, s.start + 1.0, mk) + hat(t, mk, 'cap', C.peach);
    out += card(1120, 690, ['Not much', 'runway!'], { k: back(seg(r, 13.8, 14.2)), op: 1 - seg(r, 18, 18.4), fs: 26, tx: 70, col: TX.pink });
    return out;
  };

  /* ================= Lesson 11 · Bullish Scenario vs. Bearish Scenario ================= */

  function engine(t, x, y, s, o = {}) {
    const ey = 7 * blink(t, 4), wr = (o.dist || 0) / 20;
    const wheel = (wx) => `<g transform="translate(${wx},0) rotate(${wr * 57})"><circle r="22" fill="${C.dark}"/><circle r="8" fill="#D9CFC8"/><rect x="-2" y="-20" width="4" height="20" fill="#D9CFC8"/></g>`;
    return `<g transform="translate(${x},${y}) scale(${s})" opacity="${o.op ?? 1}">
      <rect x="-250" y="-110" width="150" height="86" rx="12" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>${[-230, -180].map(wx => `<rect x="${wx}" y="-96" width="36" height="30" rx="6" fill="#fff"/>`).join('')}
      <line x1="-100" y1="-50" x2="-80" y2="-50" stroke="${C.dark}" stroke-width="6"/>
      <rect x="-80" y="-150" width="70" height="126" rx="10" fill="${C.pink}"/><rect x="-70" y="-136" width="50" height="40" rx="6" fill="#fff"/>
      <rect x="-14" y="-104" width="130" height="80" rx="30" fill="${C.pink}"/>
      <rect x="60" y="-150" width="28" height="50" rx="6" fill="${C.dark}"/>
      <circle cx="112" cy="-64" r="38" fill="${C.pinkL}" stroke="${C.pink}" stroke-width="5"/>
      <ellipse cx="100" cy="-72" rx="5" ry="${ey}" fill="${C.dark}"/><ellipse cx="124" cy="-72" rx="5" ry="${ey}" fill="${C.dark}"/>
      <path d="M100,-52 Q112,-42 124,-52" stroke="${C.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g transform="translate(0,-14)">${wheel(-210)}${wheel(-140)}${wheel(-40)}${wheel(40)}</g>
    </g>`;
  }

  // Train at a switch: IF price holds the 1H low, one track; IF it breaks, the other.
  LIVE['s10-train-switch'] = (s, t, ctx) => {
    const r = t - s.start;
    const main = [[-60, 800], [860, 800]];
    const up = [[860, 800], [1100, 772], [1350, 660], [1820, 520]];
    const dn = [[860, 800], [1100, 830], [1350, 920], [1820, 960]];
    const track = (pts, k) => { if (k <= 0) return ''; const d = along(pts, k).drawn.map(p => p.map(F1).join(',')).join(' '); return `<polyline points="${d}" fill="none" stroke="#9B6A45" stroke-width="56" stroke-dasharray="10 22"/><polyline points="${d}" fill="none" stroke="#7A5C50" stroke-width="34" stroke-linejoin="round"/><polyline points="${d}" fill="none" stroke="#FFF6F0" stroke-width="20" stroke-linejoin="round"/>`; };
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="${C.tealL}"/>`;
    out += track(main, ease(seg(r, 0.3, 1.2))) + track(up, ease(seg(r, 0.9, 1.9))) + track(dn, ease(seg(r, 1.1, 2.1)));
    // Signal post at the switch: the relevant 1H low.
    const sk = pop(t, s.start + 6.0, 0.6);
    if (sk > 0) {
      const bl = Math.floor(r * 2.5) % 2;
      out += scl(860, 760, sk, `<rect x="852" y="560" width="16" height="200" fill="${C.dark}"/><rect x="826" y="520" width="68" height="110" rx="14" fill="${C.dark}"/>
        <circle cx="860" cy="548" r="16" fill="${r > 14.8 ? (bl ? C.gold : '#5E4A40') : '#5E4A40'}"/><circle cx="860" cy="600" r="16" fill="#5E4A40"/>`) + pill(860, 480, 'RELEVANT 1H LOW', C.gold, sk, 24);
    }
    // Ghost trains preview each path.
    const gu = seg(r, 6.6, 9.6), gd = seg(r, 10.4, 13.4);
    if (gu > 0 && gu < 1) { const p = along(up, ease(gu)); out += engine(t, p.x, p.y - 10, 0.55, { op: 0.45 * Math.sin(gu * Math.PI) + 0.2, dist: gu * 900 }); }
    if (gd > 0 && gd < 1) { const p = along(dn, ease(gd)); out += engine(t, p.x, p.y - 10, 0.55, { op: 0.45 * Math.sin(gd * Math.PI) + 0.2, dist: gd * 900 }); }
    if (r > 6.6) out += pill(1460, 560, 'IF it holds → bullish thesis supported', C.teal, pop(t, s.start + 6.6), 24);
    if (r > 10.4) out += pill(1430, 1022, 'IF it breaks → reassess toward the external low', C.pink, pop(t, s.start + 10.4), 22);
    // The real train arrives and waits.
    const tx = lerp(-300, 720, ease(seg(r, 1, 5)));
    const moving = r > 1 && r < 5;
    for (let i = 0; i < 4; i++) { const p = ((r * 0.8) + i / 4) % 1; out += `<circle cx="${tx + 74 * 0.6 - p * 60}" cy="${800 - 100 - p * 140}" r="${12 + p * 26}" fill="#fff" stroke="#EADFD8" stroke-width="3" opacity="${(moving ? 0.9 : 0.5) * (1 - p)}"/>`; }
    out += engine(t, tx, 790, 0.6, { dist: tx });
    // Operator by the lever.
    const lev = gu > 0 && gu < 1 ? -30 : gd > 0 && gd < 1 ? 30 : 0;
    out += `<g transform="rotate(${lev} 1000 1000)"><line x1="1000" y1="1000" x2="1000" y2="900" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/><circle cx="1000" cy="896" r="16" fill="${C.pink}"/></g><rect x="970" y="990" width="60" height="20" rx="6" fill="${C.muted}"/>`;
    const op = { x: 1090, y: 1040, scale: 0.75, look: LK.a, seed: 2, flip: true, frontArm: { a1: -150 + lev * 0.5, a2: -170 }, talk: ctx.talking && r > 14.8 };
    out += popPerson(t, s.start + 1.6, op) + hat(t, op, 'cap', C.purple);
    if (r > 14.8) out += pill(520, 640, 'both conditional', C.purple, pop(t, s.start + 14.8), 28);
    return out;
  };

  // A choose-your-path storybook: IF this, THEN that, on both pages.
  LIVE['s10-adventure-book'] = (s, t, ctx) => {
    const r = t - s.start;
    const ok = ease(seg(r, 0.3, 1.3));
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    out += `<rect x="${960 - 560 * ok}" y="404" width="${1120 * ok}" height="520" rx="20" fill="${C.purple}"/>`;
    if (ok > 0) out += `<path d="M${960 - 540 * ok},420 Q${960 - 270 * ok},400 960,430 L960,910 Q${960 - 270 * ok},890 ${960 - 540 * ok},904 Z" fill="#FFFBF2"/>
      <path d="M${960 + 540 * ok},420 Q${960 + 270 * ok},400 960,430 L960,910 Q${960 + 270 * ok},890 ${960 + 540 * ok},904 Z" fill="#FFF6EA"/><line x1="960" y1="430" x2="960" y2="910" stroke="#EADFD8" stroke-width="4"/>`;
    const page = (x0, at, ifTxt, thenTxt, pts, col, mark) => {
      if (r < at) return '';
      let g = txt(x0 + 250, 480, ifTxt, { fs: 30, col: TX.purple, font: 'Playfair Display', w: 700, op: clamp((r - at) / 0.4) });
      const Lv = 700;
      g += hline(x0 + 50, x0 + 450, Lv, C.gold, { w: 4, op: clamp((r - at - 0.4) / 0.4) });
      const k = ease(seg(r, at + 0.6, at + 2.6));
      g += poly(along(pts.map(([u, v]) => [x0 + 50 + u * 400, v]), k).drawn, col, 6);
      const tk = pop(t, s.start + at + 2.8, 0.5);
      if (tk > 0) g += pill(x0 + 250, 850, thenTxt, col, tk, 26) + (mark === 'ok' ? check(x0 + 430, 850, tk, C.teal, 22) : '');
      return g;
    };
    out += page(440, 3.6, 'IF price holds the 1H low…', 'THEN: supported', [[0, 600], [0.2, 690], [0.4, 610], [0.55, 680], [0.75, 560], [1, 520]], C.teal, 'ok');
    out += page(980, 8.6, 'IF it breaks…', 'THEN: reassess', [[0, 600], [0.2, 660], [0.35, 620], [0.6, 760], [0.75, 730], [1, 800]], C.pink, '');
    // Reader, owl, hoping guy.
    const rd = { x: 260, y: 1000, scale: 0.9, look: LK.k, seed: 2, frontArm: r > 3.6 && r < 14 ? { a1: -20, a2: -30 } : undefined, talk: ctx.talking && r < 14.6 };
    out += popPerson(t, s.start + 0.5, rd);
    out += owl(t, 1460, 418, 0.7);
    if (r > 18.2 && r < 19.6) out += txt(1540, 360 + 20, 'hoo!', { fs: 30, col: TX.purple, font: 'Playfair Display' });
    if (r > 14.4) {
      const hp = { x: lerp(2020, 1700, ease(seg(r, 14.4, 15.4))), y: 1000, scale: 0.85, look: LK.buyer, seed: 6, flip: true, walking: r < 15.4, frontArm: { a1: -100, a2: -60 + Math.sin(t * 6) * 6 }, talk: ctx.talking && r > 15 && r < 17 };
      out += person(t, hp);
      out += card(1690, 560, ['Please just', 'go up! 🙏'], { k: back(seg(r, 15.2, 15.6)), op: 1 - 0.55 * seg(r, 17, 17.4), fs: 28, tx: 10, italic: true, font: 'Playfair Display' });
      out += stamp(1690, 640, 'HOPE ≠ PLAN', TX.pink, t, s.start + 17.0, { fs: 28, rot: -10 });
    }
    return out;
  };

  /* ================= Lesson 12 · Bias Invalidation ================= */

  // A bridge (the thesis) rests on a pillar (the 1H low). A close below knocks it out.
  LIVE['s10-bridge-collapse'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="500" y="640" width="920" height="440" fill="#FEF3E4"/><rect x="500" y="1030" width="920" height="50" fill="${C.tealL}"/>`;
    // Price drawn faintly on the canyon wall.
    const pts = [[560, 770], [660, 700], [760, 820], [880, 720], [1000, 790], [1120, 700], [1260, 920]];
    const pk = ease(seg(r, 8, 13.2));
    if (pk > 0) out += poly(along(pts, pk).drawn, C.dark, 5, { op: 0.6 });
    const LV = 860;
    if (r > 5.4) out += hline(520, 1400, LV, C.gold, { w: 5, op: clamp((r - 5.4) / 0.5) }) + pill(1250, LV - 30, '1H low', C.gold, pop(t, s.start + 5.6), 22);
    if (r > 13.2) out += dot(1260, 920, C.pink, 12) + pill(1260, 966, 'close below', C.pink, pop(t, s.start + 13.2), 22);
    // Cliffs.
    out += `<path d="M0,640 L520,640 L500,760 L540,900 L480,1080 L0,1080 Z" fill="${C.peach}"/><path d="M0,640 L520,640 L516,668 L0,668 Z" fill="${C.cash}"/>
      <path d="M1920,640 L1400,640 L1420,780 L1380,920 L1440,1080 L1920,1080 Z" fill="${C.peach}"/><path d="M1920,640 L1400,640 L1404,668 L1920,668 Z" fill="${C.cash}"/>`;
    // Rock ledge + pillar.
    const fall = ease(seg(r, 14.8, 16.2)), crack = r > 13.6;
    out += `<path d="M880,${LV} L1040,${LV} L1020,${LV + 50} L900,${LV + 50} Z" fill="#C9B9AE" transform="translate(0,${fall * 180}) rotate(${fall * 20} 960 ${LV})" opacity="${1 - fall}"/>`;
    const bk = ease(seg(r, 1.2, 2.8));
    if (bk > 0) {
      out += `<g transform="translate(0,${fall * 240}) rotate(${fall * -25} 960 750)" opacity="${1 - fall * 0.9}"><rect x="930" y="650" width="60" height="${(LV - 650) * bk}" fill="#9B6A45"/>
        ${crack ? `<path d="M940,700 L965,730 L950,760 L975,800" stroke="${C.dark}" stroke-width="4" fill="none"/>` : ''}</g>`;
      const half = (x0, x1, pivot, dir) => `<g transform="rotate(${dir * fall * 38} ${pivot} 650)"><rect x="${x0}" y="636" width="${(x1 - x0) * bk}" height="22" fill="#C9A27A"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="${x0 + i * 37}" x2="${x0 + i * 37}" y1="600" y2="636" stroke="#9B6A45" stroke-width="5" opacity="${bk}"/>`).join('')}
        <line x1="${x0}" x2="${x0 + (x1 - x0) * bk}" y1="600" y2="600" stroke="#9B6A45" stroke-width="6"/></g>`;
      out += half(520, 960, 520, 1) + half(960, 1400, 1400, -1).replace(`width="${440 * bk}"`, `width="${440 * bk}"`);
    }
    if (r > 4 && fall < 0.3) out += pill(960, 560, 'BULLISH THESIS', C.teal, pop(t, s.start + 4) * (1 - fall * 3), 28);
    if (crack && r < 16) out += txt(1080, 760, 'crack!', { fs: 32, col: TX.pink, font: 'Playfair Display', op: 1 - seg(r, 15.4, 16) });
    // Walker and dog.
    let wx = lerp(120, 720, ease(seg(r, 3, 7.6)));
    if (r > 13.6) wx = lerp(720, 330, ease(seg(r, 13.6, 15.4)));
    const onBridge = wx > 520 ? (wx - 520) * Math.tan(rad(fall * 38)) : 0;
    const wk = { x: wx, y: 640 + onBridge, scale: 0.72, look: LK.c, seed: 3, walking: (r > 3 && r < 7.6) || (r > 13.6 && r < 15.4), flip: r > 13.6 && r < 15.4, talk: ctx.talking && r > 17.6 };
    out += person(t, wk) + dog(t, wx - (r > 13.6 && r < 15.4 ? -90 : 90), 640 + (wx - 90 > 520 ? onBridge : 0), 0.42, { run: wk.walking, flip: wk.flip });
    if (r > 15.6) out += card(330, 380 + 30, ['Story changed.', 'Update the read.'], { k: back(seg(r, 15.8, 16.2)), fs: 24, tx: 0 });
    if (r > 17.6) out += pill(960, 1000, 'thesis invalidated → analysis changes', C.pink, pop(t, s.start + 17.6), 26);
    return out;
  };

  // The analysis board changes; the stop loss is an exit door. Related, not identical.
  LIVE['s10-board-vs-exit'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    // Analysis board.
    const bk = pop(t, s.start + 0.3, 0.6);
    let b = `<g stroke="${C.muted}" stroke-width="10" stroke-linecap="round"><line x1="300" y1="800" x2="270" y2="1000"/><line x1="660" y1="800" x2="690" y2="1000"/></g>
      <rect x="200" y="400" width="560" height="400" rx="16" fill="#fff" stroke="${C.muted}" stroke-width="10"/>
      ${txt(480, 450, 'ANALYSIS BOARD', { fs: 24, col: C.muted, ls: 3 })}`;
    const pts = [[240, 700], [320, 620], [380, 680], [470, 560], [540, 620], [620, 600], [720, 760]];
    b += hline(360, 740, 680, C.gold, { w: 4 }) + poly(along(pts, ease(seg(r, 1, 4))).drawn, C.dark, 5, { op: 0.8 });
    const wr = clamp((r - 1.2) / 0.6);
    b += txt(480, 520, 'BULLISH', { fs: 46, col: TX.teal, font: 'Playfair Display', op: wr });
    const cr = ease(seg(r, 4.6, 5.4));
    if (cr > 0) b += `<line x1="380" y1="508" x2="${lerp(380, 580, cr)}" y2="${lerp(508, 500, cr)}" stroke="${C.pink}" stroke-width="8" stroke-linecap="round"/>`;
    const rw = clamp((r - 5.4) / 1.2);
    if (rw > 0) b += `<defs><clipPath id="s10-rw"><rect x="300" y="530" width="${360 * rw}" height="60"/></clipPath></defs><g clip-path="url(#s10-rw)">${txt(480, 576, 'REASSESS', { fs: 44, col: TX.pink, font: 'Playfair Display' })}</g>`;
    out += scl(480, 700, bk, b);
    const nv = { x: 860, y: 1000, scale: 0.85, look: LK.e, seed: 4, flip: true, frontArm: r > 4.4 && r < 7 ? { a1: -150 + Math.sin(t * 10) * 8, a2: -160 } : undefined, talk: ctx.talking && r > 4.6 && r < 6.6 };
    out += popPerson(t, s.start + 0.6, nv);
    if (r > 6.6) out += pill(480, 860, 'your ANALYSIS changes', C.purple, pop(t, s.start + 6.6), 24);
    // Exit door with a STOP LOSS sign.
    const open = ease(seg(r, 7.4, 8.2)) * (1 - ease(seg(r, 10, 10.6)));
    out += `<rect x="1394" y="554" width="192" height="432" rx="8" fill="${C.dark}"/><rect x="1400" y="560" width="180" height="420" fill="#3D3550"/>
      <rect x="1400" y="560" width="${180 * (1 - open * 0.85)}" height="420" fill="${C.tealD}"/><circle cx="${1400 + 180 * (1 - open * 0.85) - 24}" cy="780" r="9" fill="${C.gold}"/>
      <rect x="1400" y="470" width="180" height="60" rx="10" fill="${C.pink}"/>${txt(1490, 512, 'STOP LOSS', { fs: 28, col: '#fff', ls: 2 })}`;
    const tx_ = lerp(1160, 1490, ease(seg(r, 7.6, 9.6))), top = 1 - seg(r, 9.4, 9.9);
    if (top > 0) {
      const box = `<g transform="translate(-6,-10)"><rect x="-40" y="-40" width="80" height="56" rx="6" fill="#C9A27A" stroke="#9B6A45" stroke-width="3"/><text y="-6" font-size="14" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">POSITION</text></g>`;
      out += `<g opacity="${top}">` + person(t, { x: tx_, y: 980, scale: 0.8, look: LK.buyer, seed: 6, walking: r > 7.6 && r < 9.6, frontArm: { a1: 30, a2: -60 }, hold: box }) + '</g>';
    }
    if (r > 9.8) out += pill(1490, 1030, 'your POSITION exits', C.pink, pop(t, s.start + 9.8), 24);
    // Not identical, but related.
    const nk = pop(t, s.start + 10.4, 0.6) * (1 - seg(r, 15, 15.4));
    if (nk > 0) out += `<g transform="translate(1110,700) scale(${nk})">${txt(0, 40, '≠', { fs: 150, col: TX.purple, font: 'Playfair Display' })}</g>` + `<path d="M820,440 Q1110,360 1380,440" fill="none" stroke="${C.purple}" stroke-width="5" stroke-dasharray="10 10" opacity="${clamp(nk)}"/>` + pill(1110, 410, 'related', C.purple, nk, 22);
    // The mistake.
    if (r > 15.2) {
      const mp = { x: 1110, y: 1000, scale: 0.8, look: LK.j, seed: 8, talk: ctx.talking && r > 15.4 && r < 17.4, mood: r > 17.6 ? 'sad' : undefined, frontArm: r < 17.6 ? { a1: -70, a2: -100 + Math.sin(t * 8) * 10 } : undefined };
      out += popPerson(t, s.start + 15.2, mp);
      out += card(1110, 560, ['“Bullish until', 'my trade loses!”'], { k: back(seg(r, 15.4, 15.8)), fs: 26, italic: true, font: 'Playfair Display', tx: 0 });
      out += cross(1250, 520, pop(t, s.start + 17.6, 0.5), C.pink, 34);
      if (r > 17.6 && r < 18.6) out += txt(1330, 470, 'BZZT', { fs: 34, col: TX.pink });
    }
    return out;
  };

  /* ================= Lesson 13 · Updating Your Bias in Real Time ================= */

  // Hourly mail: each letter is new information; the thesis gets a new stamp.
  LIVE['s10-mailbox'] = (s, t, ctx) => {
    const r = t - s.start;
    let out = `<rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    // Street clock.
    const hrs = [[0, 9], [3.8, 10], [8.4, 11], [12.6, 12]];
    let hour = 9;
    hrs.forEach(([at, h], i) => { if (r > at) hour = i ? lerp(hrs[i - 1][1], h, ease(seg(r, at, at + 0.8))) : h; });
    const ha = rad(hour * 30 - 90), ma = rad((hour % 1) * 360 - 90);
    out += `<rect x="290" y="560" width="20" height="440" fill="${C.dark}"/><circle cx="300" cy="480" r="86" fill="#fff" stroke="${C.dark}" stroke-width="10"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${300 + Math.cos(rad(i * 30)) * 68}" cy="${480 + Math.sin(rad(i * 30)) * 68}" r="4" fill="${C.muted}"/>`).join('')}
      <line x1="300" y1="480" x2="${300 + Math.cos(ha) * 40}" y2="${480 + Math.sin(ha) * 40}" stroke="${C.dark}" stroke-width="9" stroke-linecap="round"/>
      <line x1="300" y1="480" x2="${300 + Math.cos(ma) * 60}" y2="${480 + Math.sin(ma) * 60}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/><circle cx="300" cy="480" r="8" fill="${C.dark}"/>`;
    out += pill(300, 600, ['9 a.m.', '10 a.m.', '11 a.m.', 'Noon'][Math.min(3, Math.round(hour) - 9)], C.purple, 1, 22);
    // Chart panel.
    const pk = pop(t, s.start + 0.3, 0.6);
    out += scl(1340, 680, pk, `<rect x="920" y="400" width="840" height="560" rx="28" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`);
    const LV = 820;
    out += hline(960, 1720, LV, C.gold, { w: 5, op: clamp(r / 1) }) + (r > 1 ? pill(1010, LV + 30, '1H low', C.gold, 1, 20) : '');
    const segs = [[0.4, [[960, 760], [1020, 700], [1060, 760], [1120, 650]]], [3.8, [[1120, 650], [1200, 560], [1240, 600], [1300, 500]]], [8.4, [[1300, 500], [1360, 680], [1440, 580]]], [12.6, [[1440, 580], [1520, 760], [1560, 720], [1640, 880]]]];
    let drawn = [];
    segs.forEach(([at, pts]) => { const k = ease(seg(r, at + 0.4, at + 2.2)); if (k > 0) drawn = drawn.concat(along(pts, k).drawn.slice(drawn.length ? 1 : 0)); });
    out += poly(drawn, C.dark, 6, { op: 0.85 });
    if (drawn.length) { const h = drawn[drawn.length - 1]; out += `<circle cx="${h[0]}" cy="${h[1]}" r="11" fill="${C.dark}"/>`; }
    ['9', '10', '11', '12'].forEach((l, i) => { if (r > segs[i][0]) out += txt(segs[i][1][segs[i][1].length - 1][0], 940, l, { fs: 22, col: C.muted }); });
    const st = [[2.0, 'BULLISH, IF THE LOW HOLDS', TX.purple], [6.0, 'STRENGTHENED', TX.teal], [10.6, 'WEAKENED', TX.peach], [14.6, 'INVALIDATED', TX.pink]];
    st.forEach(([at, label, col], i) => {
      const next = st[i + 1] ? st[i + 1][0] : 99;
      if (r > at && r < next) out += stamp(i ? 1110 : 1200, 450, label, col, t, s.start + at, { fs: i ? 34 : 24, rot: -4, fill: '#fff' });
    });
    // Mailbox, carrier, reader.
    out += `<rect x="562" y="800" width="16" height="200" fill="#9B6A45"/><path d="M510,800 L630,800 L630,730 Q630,690 570,690 Q510,690 510,730 Z" fill="${C.purple}"/>
      <rect x="626" y="${r > 1 ? 700 : 740}" width="8" height="${r > 1 ? 50 : 30}" fill="${C.pink}"/>`;
    const cr = { x: 430, y: 1000, scale: 0.85, look: LK.b, seed: 3, frontArm: { a1: -10, a2: -40 }, talk: false };
    out += popPerson(t, s.start + 0.5, cr) + hat(t, cr, 'cap', C.tealD);
    out += `<path d="M${430 - 46},${1000 - 190} L${430 + 10},${1000 - 120}" stroke="#9B6A45" stroke-width="6"/><rect x="${430 - 66}" y="${1000 - 130}" width="70" height="56" rx="10" fill="#C9A27A"/>`;
    const rd = { x: 790, y: 1000, scale: 0.85, look: LK.a, seed: 5, flip: true, frontArm: { a1: -20, a2: -50 }, talk: ctx.talking && r > 16 };
    out += popPerson(t, s.start + 0.7, rd);
    const env = (x, y, sc = 1) => `<g transform="translate(${x},${y}) scale(${sc})"><rect x="-30" y="-20" width="60" height="40" rx="4" fill="#fff" stroke="${C.pink}" stroke-width="3"/><path d="M-30,-20 L0,4 L30,-20" fill="none" stroke="${C.pink}" stroke-width="3"/></g>`;
    const h1 = handOf(cr), h2 = handOf(rd);
    [3.8, 8.4, 12.6].forEach(at => {
      const k = seg(r, at, at + 1.2);
      if (k > 0 && k < 1) out += env(lerp(h1.x, h2.x, k), lerp(h1.y, h2.y, k) - Math.sin(k * Math.PI) * 120, 1.1);
    });
    if (r > 4.8) out += env(h2.x, h2.y - 10, 1);
    out += card(800, 560, ['New information', 'received.'], { k: back(seg(r, 16, 16.4)), fs: 26, tx: -20 });
    if (r > 18.8) out += pill(1340, 1020, 'reassess current structure', C.purple, pop(t, s.start + 18.8), 24);
    return out;
  };

  // Ferris wheel: READ, MAP, WAIT, UPDATE, REPEAT, round and round.
  LIVE['s10-ferris-loop'] = (s, t, ctx) => {
    const r = t - s.start;
    const cx = 960, cy = 650, R = 220;
    const wk = pop(t, s.start + 0.3, 0.7);
    if (wk <= 0) return '';
    const rot = r * 14;
    let g = `<g stroke="${C.purple}" stroke-width="14" stroke-linecap="round"><line x1="${cx}" y1="${cy}" x2="${cx - 170}" y2="1000"/><line x1="${cx}" y1="${cy}" x2="${cx + 170}" y2="1000"/></g>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.purpleL}" stroke-width="12"/>`;
    for (let i = 0; i < 10; i++) { const a = rad(rot + i * 36); g += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * R}" y2="${cy + Math.sin(a) * R}" stroke="${C.purpleL}" stroke-width="6"/>`; }
    for (let i = 0; i < 20; i++) { const a = rad(rot + i * 18), on = (Math.floor(r * 4) + i) % 2; g += `<circle cx="${cx + Math.cos(a) * R}" cy="${cy + Math.sin(a) * R}" r="7" fill="${on ? C.gold : '#fff'}"/>`; }
    g += `<circle cx="${cx}" cy="${cy}" r="30" fill="${C.purple}"/>`;
    const steps = [['READ', 2.8, C.teal], ['MAP', 5.2, C.peach], ['WAIT', 7.2, C.purple], ['UPDATE', 10.0, C.pink], ['REPEAT', 13.8, C.tealD]];
    let cur = -1; steps.forEach(([, at], i) => { if (r >= at) cur = i; });
    const heads = [LK.a, LK.b, LK.c, LK.d, LK.e];
    steps.forEach(([lab, at, col], i) => {
      const a = rad(rot + i * 72 - 90), ax = cx + Math.cos(a) * R, ay = cy + Math.sin(a) * R;
      const k = pop(t, s.start + 0.6 + i * 0.2, 0.5);
      if (k <= 0) return;
      const hi = i === cur && r < 16 ? 1 : 0, sc = k * (1 + hi * 0.18), sw = Math.sin(r * 2 + i) * 4;
      g += `<g transform="translate(${ax},${ay}) rotate(${sw}) scale(${sc})"><line x1="0" y1="0" x2="0" y2="18" stroke="${C.dark}" stroke-width="5"/>
        <circle cx="-22" cy="20" r="13" fill="${heads[i].skin}"/><circle cx="-22" cy="12" r="10" fill="${heads[i].hair}"/>
        <rect x="-78" y="22" width="156" height="58" rx="18" fill="${hi ? col : '#fff'}" stroke="${col}" stroke-width="5"/>
        <text y="62" font-size="26" font-weight="900" text-anchor="middle" fill="${hi ? '#fff' : C.dark}" font-family="DM Sans">${lab}</text></g>`;
    });
    let out = scl(cx, 1000, wk, g);
    out += `<rect x="700" y="990" width="520" height="16" rx="8" fill="${C.purple}"/><rect x="0" y="1000" width="1920" height="80" fill="#F3E3D7"/>`;
    // Step questions shown beside the wheel.
    const qs = ['What is structure showing?', 'Which levels matter?', 'What does price do there?', 'Confirm, weaken or invalidate?', 'Every session.'];
    if (cur >= 0 && r < 16) out += card(1500, 560, [qs[cur]], { k: back(seg(r, steps[cur][1], steps[cur][1] + 0.4)), fs: 28, tail: 'left', col: TX[['teal', 'peach', 'purple', 'pink', 'teal'][cur]] });
    // Operator and a queue.
    const op = { x: 1330, y: 1000, scale: 0.85, look: LK.g, seed: 3, flip: true, frontArm: { a1: 60 + Math.sin(r * 2) * 10, a2: 80 } };
    out += popPerson(t, s.start + 0.8, op) + hat(t, op, 'cap', C.pink);
    out += `<g transform="rotate(${Math.sin(r * 2) * 10} 1270 1000)"><line x1="1270" y1="1000" x2="1250" y2="900" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/><circle cx="1250" cy="896" r="12" fill="${C.pink}"/></g>`;
    [[440, LK.j, 2], [560, LK.k, 6]].forEach(([x, look, seed], i) => {
      const kid = { x, y: 1000, scale: 0.6, look, seed, frontArm: i ? { a1: -70, a2: -100 + Math.sin(t * 7) * 12 } : undefined };
      out += popPerson(t, s.start + 1 + i * 0.2, kid);
    });
    out += A.sparkle(cx, cy - R - 30, s.start + 13.8, t) + (r > 15.8 ? pill(960, 1040, 'same process, every session', C.purple, pop(t, s.start + 15.8), 26) : '');
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
