/**
 * illustrations.js — animated SVG artwork for the lesson intro videos.
 *
 * Every function is pure: give it the time and options, get back an SVG
 * string for that exact frame. player.html calls these every frame from
 * "live" scene layers, so the animation stays frame-accurate when rendered.
 */
(function () {
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => 1 - Math.pow(1 - clamp(x), 3);
  const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const rad = d => d * Math.PI / 180;

  const COL = {
    pink: '#F4829A', pinkL: '#F9B8C6', pinkP: '#FDE8ED',
    teal: '#7ECEC4', tealD: '#4FA99E', tealL: '#B2E4DF',
    peach: '#F5A857', peachL: '#FAD09A',
    purple: '#7F77DD', purpleL: '#CECBF6',
    dark: '#2C1810', text: '#3D2B20', muted: '#7A5C50', cream: '#FDF8F5',
    gold: '#E9A93B', cash: '#7CC79A', cashD: '#3F9A66',
  };

  // Two-segment arm from a shoulder, angles in degrees (0 = right, 90 = down).
  function arm(sx, sy, a1, a2, l1, l2) {
    const ex = sx + Math.cos(rad(a1)) * l1, ey = sy + Math.sin(rad(a1)) * l1;
    const hx = ex + Math.cos(rad(a2)) * l2, hy = ey + Math.sin(rad(a2)) * l2;
    return { ex, ey, hx, hy };
  }

  // Arm that reaches a target hand position (two-bone IK). bend = +1 / -1 picks the elbow side.
  function reach(sx, sy, hx, hy, l1, l2, bend) {
    let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy);
    const maxD = l1 + l2 - 0.5;
    if (d > maxD) { hx = sx + dx / d * maxD; hy = sy + dy / d * maxD; d = maxD; }
    const a = Math.atan2(hy - sy, hx - sx);
    const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
    return { ex: sx + Math.cos(a + bend * A) * l1, ey: sy + Math.sin(a + bend * A) * l1, hx, hy };
  }

  // A blink every few seconds, offset per character so they don't sync up.
  function blinkAmount(t, seed) {
    const period = 3.6 + (seed % 3) * 0.7;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }

  /* ------------------------------------------------------------------ *
   * Aristella — the AGHF host. Waist-up, viewBox 0 0 400 560.
   *   pose: 'wave' | 'point' | 'think' | 'idle' | 'cheer'
   *   talk: true while narration is playing (mouth moves)
   * ------------------------------------------------------------------ */
  function aristella(t, o = {}) {
    const pose = o.pose || 'idle';
    const skin = '#A86B4C', skinD = '#8E5539', hair = '#2C1810';
    const bob = Math.sin(t * 2.1) * 4;
    const blink = blinkAmount(t, 1);
    const talk = o.talk ? (0.35 + 0.65 * Math.abs(Math.sin(t * 11.3) * Math.sin(t * 4.7 + 1))) : 0;

    // Arms: each pose gives a hand target; the elbow follows.
    let R, L;
    if (pose === 'wave') {
      R = reach(292, 382, 372 + Math.sin(t * 7) * 26, 178, 100, 100, -1);
    } else if (pose === 'point') {
      R = reach(292, 382, 468, 318 + Math.sin(t * 3) * 4, 100, 100, -1);
    } else if (pose === 'think') {
      R = reach(292, 382, 226, 306, 100, 100, 1);
    } else if (pose === 'cheer') {
      R = reach(292, 382, 336 + Math.sin(t * 6) * 8, 150, 100, 100, -1);
    } else {
      R = reach(292, 382, 322, 575, 100, 100, -1);
    }
    L = pose === 'cheer'
      ? reach(108, 382, 64 - Math.sin(t * 6) * 8, 150, 100, 100, 1)
      : reach(108, 382, 78, 575, 100, 100, 1);

    const armPath = a => `M${a === R ? 292 : 108},382 L${a.ex.toFixed(1)},${a.ey.toFixed(1)} L${a.hx.toFixed(1)},${a.hy.toFixed(1)}`;
    const hand = (a, pointing) => `
      <circle cx="${a.hx}" cy="${a.hy}" r="25" fill="${skin}"/>
      ${pointing ? `<rect x="${a.hx + 14}" y="${a.hy - 8}" width="34" height="15" rx="7.5" fill="${skin}"/>` : ''}`;

    const eyeRy = 15 * (1 - blink * 0.92);
    const mouth = talk > 0
      ? `<ellipse cx="200" cy="268" rx="${17 + talk * 3}" ry="${4 + talk * 12}" fill="#6B2A2A"/>
         <ellipse cx="200" cy="${272 + talk * 5}" rx="${9 + talk * 2}" ry="${2 + talk * 4}" fill="#E07A8A"/>`
      : `<path d="M178,262 Q200,${pose === 'think' ? 270 : 284} 222,262" fill="none" stroke="#6B2A2A" stroke-width="6" stroke-linecap="round"/>`;
    const brows = pose === 'think'
      ? `<path d="M150,184 Q165,172 182,182" stroke="${hair}" stroke-width="6" fill="none" stroke-linecap="round"/>
         <path d="M218,178 Q235,170 250,180" stroke="${hair}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<path d="M150,184 Q165,174 182,182" stroke="${hair}" stroke-width="6" fill="none" stroke-linecap="round"/>
         <path d="M218,182 Q235,174 250,184" stroke="${hair}" stroke-width="6" fill="none" stroke-linecap="round"/>`;

    // Curly hair: a cloud of circles behind the head.
    const curls = [];
    for (let i = 0; i < 16; i++) {
      const a = rad(-200 + i * 14.5);
      curls.push(`<circle cx="${200 + Math.cos(a) * 128}" cy="${165 + Math.sin(a) * 118}" r="${46 + (i % 3) * 6}" fill="${hair}"/>`);
    }

    return `<svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <g transform="translate(0,${bob.toFixed(2)})">
        ${curls.join('')}
        <circle cx="200" cy="170" r="132" fill="${hair}"/>
        <!-- body -->
        <rect x="178" y="285" width="44" height="70" rx="18" fill="${skinD}"/>
        <path d="M70,600 C70,430 120,348 200,348 C280,348 330,430 330,600 Z" fill="${COL.pink}"/>
        <path d="M160,350 L200,410 L240,350 Z" fill="${COL.cream}"/>
        <path d="M150,352 Q200,392 250,352" fill="none" stroke="${COL.gold}" stroke-width="4"/>
        <circle cx="200" cy="384" r="9" fill="${COL.gold}"/>
        <circle cx="262" cy="452" r="15" fill="#fff"/><text x="262" y="458" font-size="13" font-weight="700" text-anchor="middle" fill="${COL.pink}" font-family="DM Sans">GF</text>
        <!-- arms -->
        <path d="${armPath(L)}" stroke="#E46F89" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${hand(L)}
        <!-- head -->
        <circle cx="104" cy="222" r="19" fill="${skin}"/><circle cx="296" cy="222" r="19" fill="${skin}"/>
        <circle cx="102" cy="258" r="14" fill="none" stroke="${COL.gold}" stroke-width="5"/>
        <circle cx="298" cy="258" r="14" fill="none" stroke="${COL.gold}" stroke-width="5"/>
        <ellipse cx="200" cy="215" rx="96" ry="106" fill="${skin}"/>
        <!-- hair front + headband -->
        <path d="M106,190 C106,96 180,72 230,86 C276,98 300,140 296,196 C280,150 250,128 214,134 C180,124 130,140 106,190 Z" fill="${hair}"/>
        <path d="M110,150 C150,96 252,92 292,150" fill="none" stroke="${COL.pinkL}" stroke-width="20" stroke-linecap="round"/>
        <circle cx="268" cy="114" r="15" fill="${COL.pink}"/><circle cx="286" cy="128" r="10" fill="${COL.pink}"/>
        ${brows}
        <ellipse cx="166" cy="214" rx="12" ry="${eyeRy.toFixed(2)}" fill="${hair}"/>
        <ellipse cx="234" cy="214" rx="12" ry="${eyeRy.toFixed(2)}" fill="${hair}"/>
        ${blink < 0.5 ? `<circle cx="170" cy="208" r="4.5" fill="#fff"/><circle cx="238" cy="208" r="4.5" fill="#fff"/>` : ''}
        <ellipse cx="140" cy="250" rx="18" ry="11" fill="${COL.pink}" opacity=".45"/>
        <ellipse cx="260" cy="250" rx="18" ry="11" fill="${COL.pink}" opacity=".45"/>
        <path d="M194,236 Q200,244 206,236" fill="none" stroke="${skinD}" stroke-width="5" stroke-linecap="round"/>
        ${mouth}
        <path d="${armPath(R)}" stroke="#E46F89" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${hand(R, pose === 'point')}
      </g>
    </svg>`;
  }

  /* ------------------------------------------------------------------ *
   * Generic full-body person, drawn around (0,0) = feet centre.
   * Height ~300 at scale 1. Returns an SVG <g> fragment.
   *   look: { skin, hair, hairStyle: 'bun'|'short'|'puff'|'waves', shirt, pants }
   *   frontArm: { a1, a2 } angles for the arm nearest the viewer
   *   walk: 0..1 walk-cycle phase amount (legs swing while > 0)
   *   bubble / hold handled by callers.
   * ------------------------------------------------------------------ */
  function person(t, o) {
    const L = o.look, s = o.scale || 1, flip = o.flip ? -1 : 1;
    const seed = o.seed || 2;
    const walking = o.walking ? 1 : 0;
    const swing = walking * Math.sin(t * 9 + seed) * 22;
    const bob = walking ? Math.abs(Math.sin(t * 9 + seed)) * -6 : Math.sin(t * 2 + seed) * 2;
    const blink = blinkAmount(t, seed);
    const fa = o.frontArm || { a1: 100, a2: 95 };
    const ba = o.backArm || { a1: 80 + swing * 0.6, a2: 88 };
    const F = arm(18, -196, fa.a1, fa.a2, 58, 54);
    const B = arm(-18, -196, ba.a1, ba.a2, 58, 54);
    const legL = arm(-14, -110, 90 - swing, 90 - swing * 0.6, 56, 54);
    const legR = arm(14, -110, 90 + swing, 90 + swing * 0.6, 56, 54);
    const mouthOpen = o.talk ? Math.abs(Math.sin(t * 11 + seed)) : 0;
    const smile = o.mood === 'sad'
      ? `<path d="M-10,-262 Q0,-270 10,-262" fill="none" stroke="#5a2a20" stroke-width="3.5" stroke-linecap="round"/>`
      : mouthOpen > 0.05
        ? `<ellipse cx="0" cy="-262" rx="8" ry="${2 + mouthOpen * 6}" fill="#6B2A2A"/>`
        : `<path d="M-11,-266 Q0,-256 11,-266" fill="none" stroke="#5a2a20" stroke-width="3.5" stroke-linecap="round"/>`;

    let hairBack = '', hairFront = '';
    const hc = L.hair;
    if (L.hairStyle === 'bun') {
      hairBack = `<circle cx="0" cy="-332" r="20" fill="${hc}"/>`;
      hairFront = `<path d="M-38,-286 C-40,-330 40,-330 38,-286 C26,-306 -26,-306 -38,-286 Z" fill="${hc}"/>`;
    } else if (L.hairStyle === 'puff') {
      hairBack = `<circle cx="0" cy="-298" r="52" fill="${hc}"/>` +
        [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${Math.cos(rad(-180 + i * 26)) * 50}" cy="${-300 + Math.sin(rad(-180 + i * 26)) * 46}" r="18" fill="${hc}"/>`).join('');
    } else if (L.hairStyle === 'waves') {
      hairBack = `<path d="M-44,-290 C-50,-340 50,-340 44,-290 L48,-220 C30,-206 -30,-206 -48,-220 Z" fill="${hc}"/>`;
      hairFront = `<path d="M-38,-288 C-34,-326 34,-326 38,-288 C20,-312 -4,-300 -38,-288 Z" fill="${hc}"/>`;
    } else {
      hairFront = `<path d="M-38,-284 C-40,-330 40,-334 38,-284 C30,-300 -10,-310 -38,-284 Z" fill="${hc}"/>`;
    }
    const limb = (x, y, a, col, w) => `<path d="M${x},${y} L${a.ex.toFixed(1)},${a.ey.toFixed(1)} L${a.hx.toFixed(1)},${a.hy.toFixed(1)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

    return `<g transform="translate(${o.x},${o.y}) scale(${s * flip},${s})">
      <g transform="translate(0,${bob.toFixed(2)})">
        ${limb(-14, -110, legL, L.pants, 24)}${limb(14, -110, legR, L.pants, 24)}
        <ellipse cx="${legL.hx - 4}" cy="${legL.hy + 4}" rx="16" ry="8" fill="${COL.dark}"/>
        <ellipse cx="${legR.hx + 4}" cy="${legR.hy + 4}" rx="16" ry="8" fill="${COL.dark}"/>
        ${limb(-18, -196, B, L.shirt, 22)}<circle cx="${B.hx}" cy="${B.hy}" r="11" fill="${L.skin}"/>
        <path d="M-34,-102 C-38,-170 -30,-214 0,-216 C30,-214 38,-170 34,-102 Z" fill="${L.shirt}"/>
        <rect x="-9" y="-236" width="18" height="26" rx="8" fill="${L.skin}"/>
        ${hairBack}
        <circle cx="0" cy="-280" r="40" fill="${L.skin}"/>
        ${hairFront}
        <ellipse cx="-14" cy="-282" rx="5" ry="${(7 * (1 - blink * 0.9)).toFixed(2)}" fill="${COL.dark}"/>
        <ellipse cx="14" cy="-282" rx="5" ry="${(7 * (1 - blink * 0.9)).toFixed(2)}" fill="${COL.dark}"/>
        <ellipse cx="-24" cy="-268" rx="7" ry="4.5" fill="${COL.pink}" opacity=".45"/>
        <ellipse cx="24" cy="-268" rx="7" ry="4.5" fill="${COL.pink}" opacity=".45"/>
        ${smile}
        ${limb(18, -196, F, L.shirt, 22)}
        ${o.hold ? `<g transform="translate(${F.hx},${F.hy}) scale(${flip},1)">${o.hold}</g>` : ''}
        <circle cx="${F.hx}" cy="${F.hy}" r="11" fill="${L.skin}"/>
      </g>
    </g>`;
  }

  const LOOKS = {
    buyer: { skin: '#C68B62', hair: '#3A2318', hairStyle: 'puff', shirt: COL.teal, pants: '#4A5A78' },
    seller: { skin: '#F1C7A5', hair: '#7A4A2A', hairStyle: 'waves', shirt: COL.pink, pants: '#5C4A6E' },
    a: { skin: '#8E5A3C', hair: '#2C1810', hairStyle: 'bun', shirt: COL.purple, pants: '#3D3550' },
    b: { skin: '#E8B48C', hair: '#C27A3A', hairStyle: 'waves', shirt: COL.peach, pants: '#4A5A78' },
    c: { skin: '#B07750', hair: '#2C1810', hairStyle: 'short', shirt: COL.teal, pants: '#3D3550' },
    d: { skin: '#F3CDB0', hair: '#2C1810', hairStyle: 'bun', shirt: COL.pinkL, pants: '#5C4A6E' },
    e: { skin: '#6E4530', hair: '#1E120C', hairStyle: 'puff', shirt: COL.purpleL, pants: '#4A5A78' },
  };

  // Props, drawn with (0,0) at the holding hand.
  const cashStack = (n = 3) => Array.from({ length: n }, (_, i) =>
    `<g transform="rotate(${-14 + i * 12}) translate(${-4 + i * 4},${-30 - i * 2})">
      <rect x="-30" y="-17" width="60" height="34" rx="5" fill="${COL.cash}" stroke="${COL.cashD}" stroke-width="3"/>
      <circle cx="0" cy="0" r="10" fill="none" stroke="${COL.cashD}" stroke-width="2.5"/>
      <text x="0" y="5.5" font-size="15" font-weight="700" text-anchor="middle" fill="${COL.cashD}" font-family="DM Sans">$</text>
    </g>`).join('');
  const contract = () => `<g transform="translate(0,-34) rotate(6)">
      <rect x="-30" y="-38" width="60" height="76" rx="6" fill="#fff" stroke="${COL.purple}" stroke-width="3"/>
      <text x="0" y="-14" font-size="15" font-weight="700" text-anchor="middle" fill="${COL.purple}" font-family="DM Sans">MNQ</text>
      <rect x="-18" y="-2" width="36" height="4" rx="2" fill="${COL.purpleL}"/>
      <rect x="-18" y="8" width="28" height="4" rx="2" fill="${COL.purpleL}"/>
      <rect x="-18" y="18" width="32" height="4" rx="2" fill="${COL.purpleL}"/>
    </g>`;

  function bubble(x, y, text, o = {}) {
    const w = o.w || Math.max(80, text.length * (o.size || 30) * 0.52 + 50), h = o.h || (o.size || 30) * 1.9;
    const fill = o.fill || '#fff', stroke = o.stroke || '#F1E7E1', color = o.color || COL.dark;
    const tail = o.tail === 'right' ? `M${x + w * 0.3},${y + h / 2 - 2} L${x + w * 0.42},${y + h / 2 + 26} L${x + w * 0.12},${y + h / 2 - 2}`
      : `M${x - w * 0.3},${y + h / 2 - 2} L${x - w * 0.42},${y + h / 2 + 26} L${x - w * 0.12},${y + h / 2 - 2}`;
    return `<g opacity="${o.op ?? 1}" transform="translate(${x},${y}) scale(${o.sc ?? 1}) translate(${-x},${-y})">
      <path d="${tail}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="${x - w * 0.36}" y="${y + h / 2 - 6}" width="${w * 0.3}" height="8" fill="${fill}"/>
      <text x="${x}" y="${y + (o.size || 30) * 0.36}" font-size="${o.size || 30}" font-weight="${o.weight || 500}" font-style="${o.italic ? 'italic' : 'normal'}" text-anchor="middle" fill="${color}" font-family="${o.font || 'DM Sans'}">${text}</text>
    </g>`;
  }

  function sparkle(x, y, t0, t, color = COL.peach) {
    const p = clamp((t - t0) / 0.9);
    if (p <= 0 || p >= 1) return '';
    return Array.from({ length: 8 }, (_, i) => {
      const a = rad(i * 45), d = 30 + ease(p) * 70;
      return `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="${(1 - p) * 9 + 2}" fill="${i % 2 ? color : COL.pink}" opacity="${1 - p}"/>`;
    }).join('');
  }


  /* ------------------------------------------------------------------ *
   * Vehicles for "instrument = vehicle". (x, y) = centre of the road
   * contact line. dist (px travelled) spins the wheels.
   *   kind: 'car' | 'truck' | 'gold' | 'bus'
   * ------------------------------------------------------------------ */
  function vehicle(kind, o) {
    const { x, y, dist = 0, plate = '', t = 0 } = o;
    const s = o.scale || 1;
    const bounce = Math.sin(t * 9 + x * 0.01) * (o.moving ? 2.5 : 0.6);
    const wheel = (wx, r) => {
      const a = (dist / r) * 180 / Math.PI;
      return `<g transform="translate(${wx},${-r}) rotate(${a})">
        <circle r="${r}" fill="${COL.dark}"/><circle r="${r * 0.45}" fill="#D9CFC8"/>
        <rect x="-2.5" y="${-r * 0.9}" width="5" height="${r * 0.9}" fill="#D9CFC8"/></g>`;
    };
    const plateTag = (px, py) => plate ? `<g transform="translate(${px},${py})">
        <rect x="-50" y="-22" width="100" height="44" rx="10" fill="#fff" stroke="${COL.dark}" stroke-width="3"/>
        <text y="10" font-size="26" font-weight="900" text-anchor="middle" fill="${COL.dark}" font-family="DM Sans">${plate}</text></g>` : '';
    let body = '';
    if (kind === 'truck') {
      body = `<rect x="-170" y="-210" width="230" height="160" rx="14" fill="${COL.purple}"/>
        <rect x="-158" y="-198" width="206" height="10" rx="5" fill="#fff" opacity=".25"/>
        <path d="M60,-150 L120,-150 L170,-100 L170,-50 L60,-50 Z" fill="${COL.purpleL}" stroke="${COL.purple}" stroke-width="5"/>
        <path d="M78,-138 L116,-138 L150,-104 L78,-104 Z" fill="#E8F8F6"/>
        <rect x="-176" y="-60" width="352" height="22" rx="10" fill="${COL.dark}" opacity=".8"/>
        ${wheel(-120, 30)}${wheel(-60, 30)}${wheel(120, 30)}${plateTag(-55, -130)}`;
    } else if (kind === 'bus') {
      body = `<rect x="-175" y="-200" width="350" height="160" rx="28" fill="${COL.pink}"/>
        ${[-140, -80, -20, 40].map(wx => `<rect x="${wx}" y="-180" width="46" height="46" rx="8" fill="#FDE8ED"/>`).join('')}
        <rect x="104" y="-180" width="54" height="100" rx="10" fill="#FDE8ED"/>
        <rect x="-175" y="-110" width="350" height="12" fill="#fff" opacity=".35"/>
        ${wheel(-110, 30)}${wheel(110, 30)}${plateTag(-40, -70)}`;
    } else {
      const col = kind === 'gold' ? COL.peach : COL.teal, dark = kind === 'gold' ? '#E08E2E' : COL.tealD;
      body = `<path d="M-115,-40 L-115,-90 Q-112,-104 -96,-106 L-60,-110 L-30,-160 Q-24,-170 -10,-170 L52,-170 Q66,-170 74,-160 L104,-112 Q118,-108 118,-92 L118,-40 Z" fill="${col}" stroke="${dark}" stroke-width="4"/>
        <path d="M-18,-158 L-44,-114 L6,-114 L6,-158 Z" fill="#E8F8F6"/><path d="M16,-158 L16,-114 L90,-114 L64,-158 Z" fill="#E8F8F6"/>
        ${kind === 'gold' ? `<path d="M-16,-196 L52,-196 L62,-172 L-26,-172 Z" fill="${COL.gold}" stroke="#C98A1F" stroke-width="3"/><path d="M-4,-192 L40,-192" stroke="#fff" stroke-width="3" opacity=".6"/>` : ''}
        <circle cx="112" cy="-80" r="8" fill="#FFF3C4"/>
        ${wheel(-68, 26)}${wheel(70, 26)}${plateTag(0, -72)}`;
    }
    return `<g transform="translate(${x},${y + bounce}) scale(${s})"><ellipse cx="0" cy="2" rx="${kind === 'car' || kind === 'gold' ? 120 : 180}" ry="10" fill="${COL.dark}" opacity=".08"/>${body}</g>`;
  }

  function road(y, o = {}) {
    const x0 = o.x0 ?? 0, x1 = o.x1 ?? 1920, h = o.h ?? 90, shift = o.shift ?? 0;
    const dashes = [];
    for (let x = x0 - 120 + ((shift % 120) + 120) % 120; x < x1 - 60; x += 120) if (x >= x0) dashes.push(`<rect x="${x}" y="${y + h / 2 - 4}" width="60" height="8" rx="4" fill="#fff" opacity=".8"/>`);
    return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" fill="#E9DED6"/>${dashes.join('')}
      <rect x="${x0}" y="${y}" width="${x1 - x0}" height="4" fill="#DCCFC6"/>`;
  }

  // Seeded candles: deterministic so every render is identical.
  function candleSeries(n, seed, drift) {
    let v = 100, s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: n }, (_, i) => {
      const dir = (drift ? drift(i) : 0) + (rnd() - 0.5) * 2;
      const o = v, c = v + dir * 14;
      const hi = Math.max(o, c) + 1 + rnd() * 4, lo = Math.min(o, c) - 1 - rnd() * 4;
      v = c;
      return { o, c, hi, lo };
    });
  }

  // Candle chart that builds candle by candle between t0 and t1.
  function candleChart(t, o) {
    const { w, h, data, t0, t1 } = o;
    const all = data.flatMap(d => [d.hi, d.lo]);
    const mn = Math.min(...all) - 4, mx = Math.max(...all) + 4;
    const y = v => h - (v - mn) / (mx - mn) * h;
    const step = w / data.length, cw = step * 0.56;
    const per = (t1 - t0) / data.length;
    const grid = [0.25, 0.5, 0.75].map(k => `<line x1="0" x2="${w}" y1="${h * k}" y2="${h * k}" stroke="#EADFD8" stroke-width="2" stroke-dasharray="6 10"/>`).join('');
    const candles = data.map((d, i) => {
      const p = ease((t - (t0 + i * per)) / Math.max(per * 1.6, 0.25));
      if (p <= 0) return '';
      const up = d.c >= d.o, col = up ? COL.teal : COL.pink;
      const cx = step * i + step / 2;
      const c = lerp(d.o, d.c, p);
      const top = y(Math.max(d.o, c)), bot = y(Math.min(d.o, c));
      return `<line x1="${cx}" x2="${cx}" y1="${y(lerp(Math.max(d.o, d.c), d.hi, p))}" y2="${y(lerp(Math.min(d.o, d.c), d.lo, p))}" stroke="${col}" stroke-width="4" stroke-linecap="round" opacity="${p}"/>
        <rect x="${cx - cw / 2}" y="${top}" width="${cw}" height="${Math.max(3, bot - top)}" rx="4" fill="${col}"/>`;
    }).join('');
    return `<g>${grid}${candles}</g>`;
  }

  // Badge illustrations for participant types.
  function badge(kind, t) {
    const sway = Math.sin(t * 2.4) * 4;
    if (kind === 'hedger') {
      return `<g>
        <path d="M0,-92 L74,-62 C74,10 44,58 0,84 C-44,58 -74,10 -74,-62 Z" fill="${COL.purpleL}" stroke="${COL.purple}" stroke-width="6"/>
        <g transform="rotate(${sway})">
          <path d="M0,58 L0,-48" stroke="${COL.peach}" stroke-width="6" stroke-linecap="round"/>
          ${[-40, -22, -4, 14].map((yy, i) => `<ellipse cx="${i % 2 ? 14 : -14}" cy="${yy}" rx="9" ry="16" transform="rotate(${i % 2 ? 30 : -30} ${i % 2 ? 14 : -14} ${yy})" fill="${COL.peach}"/>`).join('')}
          <ellipse cx="0" cy="-58" rx="8" ry="15" fill="${COL.peach}"/>
        </g>
      </g>`;
    }
    if (kind === 'broker') {
      const f = Math.sin(t * 2.4) * 6;
      return `<g>
        <circle r="90" fill="#E8F8F6"/>
        <g transform="translate(0,${-26 + f}) rotate(-10)"><rect x="-38" y="-20" width="76" height="40" rx="5" fill="${COL.cash}" stroke="${COL.cashD}" stroke-width="3"/><circle r="10" fill="none" stroke="${COL.cashD}" stroke-width="3"/></g>
        <rect x="-62" y="-14" width="124" height="80" rx="16" fill="${COL.tealD}"/>
        <rect x="16" y="10" width="54" height="34" rx="10" fill="${COL.teal}"/><circle cx="34" cy="27" r="7" fill="${COL.gold}"/>
      </g>`;
    }
    if (kind === 'prop') {
      const lit = Math.floor(t * 2) % 6;
      return `<g>
        <circle r="90" fill="${COL.purpleL}" opacity=".55"/>
        <rect x="-44" y="-70" width="88" height="140" rx="6" fill="${COL.purple}"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${-30 + (i % 3) * 22}" y="${-56 + Math.floor(i / 3) * 26}" width="16" height="16" rx="3" fill="${i % 6 === lit ? COL.gold : '#E7E4FB'}"/>`).join('')}
        <rect x="-12" y="46" width="24" height="24" rx="3" fill="#E7E4FB"/>
        <path d="M-58,70 L58,70" stroke="${COL.dark}" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    }
    if (kind === 'sim') {
      const bub = [0, 1, 2].map(i => { const p = ((t * 0.8) + i / 3) % 1; return `<circle cx="${(i - 1) * 12}" cy="${-20 - p * 60}" r="${6 + i * 2}" fill="${COL.pinkL}" opacity="${1 - p}"/>`; }).join('');
      return `<g>
        <circle r="90" fill="${COL.pinkP}"/>
        ${bub}
        <path d="M-16,-50 L16,-50 L16,-14 L52,52 Q56,64 44,64 L-44,64 Q-56,64 -52,52 L-16,-14 Z" fill="#fff" stroke="${COL.pink}" stroke-width="5"/>
        <path d="M-34,20 L34,20 L50,54 Q52,60 44,60 L-44,60 Q-52,60 -50,54 Z" fill="${COL.pinkL}"/>
        <text x="0" y="50" font-size="22" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="DM Sans">SIM</text>
      </g>`;
    }
    if (kind === 'coins') {
      return `<g>${Array.from({ length: 5 }, (_, i) => `<ellipse cx="0" cy="${30 - i * 14}" rx="34" ry="12" fill="${COL.gold}" stroke="#C98A1F" stroke-width="3"/>`).join('')}
        <text x="0" y="70" font-size="24" font-weight="900" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">100%</text></g>`;
    }
    if (kind === 'split') {
      const a = Math.sin(t * 1.5) * 4;
      return `<g><circle r="40" fill="${COL.purpleL}"/>
        <path d="M0,0 L0,-40 A40,40 0 1,1 -38,-12 Z" fill="${COL.teal}" transform="translate(${a * 0.2},${a * 0.2})"/>
        <text x="8" y="16" font-size="14" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">YOU</text></g>`;
    }
    if (kind === 'open') {
      return `<g><rect x="-30" y="-40" width="60" height="80" rx="6" fill="#fff" stroke="${COL.teal}" stroke-width="4"/>
        <path d="M-30,-40 L4,-30 L4,48 L-30,40 Z" fill="${COL.tealL}"/><circle cx="-2" cy="6" r="4" fill="${COL.tealD}"/></g>`;
    }
    if (kind === 'gate') {
      const k = Math.floor(t * 1.5) % 4;
      return `<g><rect x="-34" y="-44" width="68" height="88" rx="8" fill="#fff" stroke="${COL.pink}" stroke-width="4"/><rect x="-14" y="-52" width="28" height="14" rx="4" fill="${COL.muted}"/>
        ${[0, 1, 2].map(i => `<rect x="-22" y="${-26 + i * 22}" width="12" height="12" rx="3" fill="${i < k ? COL.teal : '#fff'}" stroke="${COL.tealD}" stroke-width="2"/><rect x="-4" y="${-23 + i * 22}" width="28" height="6" rx="3" fill="${COL.pinkL}"/>`).join('')}</g>`;
    }
    if (kind === 'read') {
      const mx = Math.sin(t * 1.2) * 26;
      return `<g>
        <circle r="90" fill="#E8F8F6"/>
        ${[[-46, 20, 26, 1], [-18, 6, 30, 0], [10, -10, 34, 1], [38, -24, 30, 1]].map(([x, y, h, up]) => `<rect x="${x - 8}" y="${y - h / 2}" width="16" height="${h}" rx="3" fill="${up ? COL.teal : COL.pink}"/>`).join('')}
        <g transform="translate(${mx},${-6})"><circle r="38" fill="#fff" fill-opacity=".35" stroke="${COL.dark}" stroke-width="8"/>
          <line x1="27" y1="27" x2="58" y2="58" stroke="${COL.dark}" stroke-width="12" stroke-linecap="round"/></g>
      </g>`;
    }
    if (kind === 'zoom') {
      const on = Math.floor(t / 1.5) % 3;
      return `<g>
        <circle r="90" fill="${COL.purpleL}" opacity=".55"/>
        ${['5m', '15m', '1H'].map((l, i) => `<g transform="translate(${(i - 1) * 54},0)"><rect x="-25" y="-22" width="50" height="44" rx="10" fill="${i === on ? COL.purple : '#fff'}" stroke="${COL.purple}" stroke-width="3"/>
          <text y="7" font-size="18" font-weight="700" text-anchor="middle" fill="${i === on ? '#fff' : COL.purple}" font-family="DM Sans">${l}</text></g>`).join('')}
        <path d="M-50,-46 A60,60 0 0,1 50,-46" fill="none" stroke="${COL.purple}" stroke-width="5" stroke-linecap="round"/>
        <path d="M40,-58 L52,-44 L36,-38" fill="none" stroke="${COL.purple}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;
    }
    if (kind === 'mark') {
      const d = (t * 0.6) % 1;
      const px = -60 + ease(clamp(d / 0.7)) * 120;
      return `<g>
        <circle r="90" fill="${COL.pinkP}"/>
        <line x1="-60" y1="20" x2="${px}" y2="20" stroke="${COL.peach}" stroke-width="7" stroke-dasharray="12 8" stroke-linecap="round"/>
        <g transform="translate(${px},20) rotate(40)">
          <rect x="-9" y="-80" width="18" height="70" rx="3" fill="${COL.pink}"/><rect x="-9" y="-92" width="18" height="14" rx="3" fill="${COL.pinkL}"/>
          <path d="M-9,-10 L9,-10 L0,8 Z" fill="#F3D6B4"/><path d="M-3,2 L3,2 L0,8 Z" fill="${COL.dark}"/></g>
      </g>`;
    }
    if (kind === 'simplify') {
      const sw = Math.sin(t * 4) * 14;
      return `<g>
        <circle r="90" fill="#FEF3E4"/>
        <g transform="rotate(${sw} 0 -10)">
          <rect x="-5" y="-80" width="10" height="90" rx="5" fill="#9B6A45"/>
          <path d="M-34,10 L34,10 L44,58 L-44,58 Z" fill="${COL.peach}"/>
          ${[-30, -15, 0, 15, 30].map(x => `<line x1="${x}" y1="20" x2="${x * 1.25}" y2="56" stroke="#E08E2E" stroke-width="3"/>`).join('')}
          <rect x="-36" y="4" width="72" height="12" rx="4" fill="${COL.pink}"/></g>
        ${[0, 1, 2].map(i => { const p = ((t * 0.9) + i / 3) % 1; return `<circle cx="${50 + p * 20}" cy="${50 - p * 40}" r="${5 - p * 3}" fill="${COL.gold}" opacity="${1 - p}"/>`; }).join('')}
      </g>`;
    }
    if (kind === 'market') {
      const f = Math.sin(t * 2) * 5;
      return `<g>
        <circle r="90" fill="${COL.purpleL}" opacity=".55"/>
        <g transform="rotate(${-8 + f * 0.6}) translate(0,${f})">
          <rect x="-56" y="-70" width="112" height="140" rx="12" fill="#fff" stroke="${COL.purple}" stroke-width="6"/>
          <text x="0" y="-26" font-size="30" font-weight="700" text-anchor="middle" fill="${COL.purple}" font-family="DM Sans">MNQ</text>
          <rect x="-34" y="-6" width="68" height="7" rx="3.5" fill="${COL.purpleL}"/>
          <rect x="-34" y="12" width="52" height="7" rx="3.5" fill="${COL.purpleL}"/>
          <rect x="-34" y="30" width="60" height="7" rx="3.5" fill="${COL.purpleL}"/>
        </g>
        <g transform="translate(52,48) rotate(${f * 2})"><circle r="22" fill="${COL.gold}"/><path d="M-10,18 L-16,44 L0,34 L16,44 L10,18" fill="${COL.pink}"/><circle r="12" fill="#F3C25C"/></g>
      </g>`;
    }
    if (kind === 'direction') {
      const swing = Math.sin(t * 1.7) * 70;
      return `<g>
        <circle r="90" fill="#fff" stroke="${COL.teal}" stroke-width="8"/>
        <circle r="74" fill="#E8F8F6"/>
        <text x="0" y="-46" font-size="24" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">UP</text>
        <text x="0" y="64" font-size="24" font-weight="700" text-anchor="middle" fill="#C2475F" font-family="DM Sans">DOWN</text>
        <g transform="rotate(${swing})">
          <path d="M0,-58 L14,0 L-14,0 Z" fill="${COL.tealD}"/>
          <path d="M0,58 L14,0 L-14,0 Z" fill="${COL.pink}"/>
        </g>
        <circle r="9" fill="${COL.dark}"/>
      </g>`;
    }
    if (kind === 'risk') {
      const wav = Math.sin(t * 5);
      return `<g>
        <circle r="90" fill="${COL.pinkP}"/>
        <path d="M-74,-20 L-40,-40 L-10,-14 L20,-30 L74,-4" fill="none" stroke="${COL.teal}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="-80" x2="80" y1="30" y2="30" stroke="${COL.pink}" stroke-width="6" stroke-dasharray="12 9"/>
        <path d="M-40,30 L-40,-62" stroke="${COL.dark}" stroke-width="5" stroke-linecap="round"/>
        <path d="M-40,-62 Q${-8 + wav * 4},${-70 + wav * 4} 24,-58 L24,-30 Q${-8 - wav * 4},${-42 - wav * 4} -40,-34 Z" fill="${COL.pink}"/>
        <text x="-8" y="-40" font-size="16" font-weight="700" text-anchor="middle" fill="#fff" font-family="DM Sans">STOP</text>
      </g>`;
    }
    if (kind === 'outcome') {
      const tilt = Math.sin(t * 1.4) * 12;
      const pan = (x, y, coins) => `<g transform="translate(${x},${y})">
          <line x1="-26" y1="-40" x2="0" y2="0" stroke="${COL.muted}" stroke-width="3"/><line x1="26" y1="-40" x2="0" y2="0" stroke="${COL.muted}" stroke-width="3"/>
          <path d="M-36,0 L36,0 Q30,22 0,22 Q-30,22 -36,0 Z" fill="${COL.peach}"/>
          ${Array.from({ length: coins }, (_, i) => `<ellipse cx="${-12 + (i % 2) * 22}" cy="${-6 - Math.floor(i / 2) * 9}" rx="11" ry="5" fill="${COL.gold}" stroke="#C98A1F" stroke-width="2"/>`).join('')}
        </g>`;
      const ax = Math.cos(tilt * Math.PI / 180) * 62, ay = Math.sin(tilt * Math.PI / 180) * 62;
      return `<g>
        <circle r="90" fill="#FEF3E4"/>
        <path d="M-30,70 L30,70 L8,50 L8,-46 L-8,-46 L-8,50 Z" fill="${COL.muted}"/>
        <line x1="${-ax}" y1="${-46 - ay}" x2="${ax}" y2="${-46 + ay}" stroke="${COL.muted}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="0" cy="-48" r="9" fill="${COL.gold}"/>
        ${pan(-ax, -6 - ay, 4)}${pan(ax, -6 + ay, 1)}
      </g>`;
    }
    if (kind === 'speculator') {
      const zig = 'M-70,40 L-36,10 L-12,26 L18,-18 L40,-6 L70,-50';
      const d = clamp((t % 4) / 2.2);
      return `<g>
        <circle r="90" fill="#E8F8F6" stroke="${COL.teal}" stroke-width="6"/>
        <path d="${zig}" fill="none" stroke="${COL.tealD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - ease(d)}"/>
        <path d="M54,-56 L72,-52 L68,-34" fill="none" stroke="${COL.tealD}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="${d > 0.9 ? 1 : 0}"/>
        <g transform="translate(${-30 + Math.sin(t * 1.6) * 8},${-34})">
          <circle cx="-14" cy="0" r="14" fill="${COL.dark}"/><circle cx="14" cy="0" r="14" fill="${COL.dark}"/>
          <circle cx="-14" cy="0" r="7" fill="#9FD8D0"/><circle cx="14" cy="0" r="7" fill="#9FD8D0"/>
        </g>
      </g>`;
    }
    // investor: a plant that keeps growing, with coins in the pot
    const g = 0.75 + 0.25 * Math.sin(t * 0.8);
    return `<g>
      <circle r="90" fill="#FEF3E4" stroke="${COL.peach}" stroke-width="6"/>
      <path d="M-40,22 L40,22 L30,70 L-30,70 Z" fill="${COL.pink}"/>
      <rect x="-46" y="12" width="92" height="16" rx="6" fill="${COL.pinkL}"/>
      <g transform="translate(0,14) scale(${g}) translate(0,-14)">
        <path d="M0,14 C0,-20 0,-40 0,-62" stroke="${COL.tealD}" stroke-width="7" stroke-linecap="round" fill="none"/>
        <ellipse cx="-24" cy="-26" rx="22" ry="11" transform="rotate(-30 -24 -26)" fill="${COL.teal}"/>
        <ellipse cx="24" cy="-44" rx="22" ry="11" transform="rotate(30 24 -44)" fill="${COL.teal}"/>
        <ellipse cx="0" cy="-70" rx="12" ry="18" fill="${COL.teal}"/>
      </g>
      <circle cx="-56" cy="56" r="13" fill="${COL.gold}"/><circle cx="-56" cy="46" r="13" fill="#F3C25C"/>
      <circle cx="58" cy="58" r="13" fill="#F3C25C"/>
    </g>`;
  }

  window.ART = { COL, LOOKS, vehicle, road, aristella, person, bubble, sparkle, cashStack, contract, candleSeries, candleChart, badge, ease, back, clamp, lerp };
})();
