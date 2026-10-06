/**
 * scenes-s5.js: illustrated scene types for Section 5 (Breaks, Shifts & Fakeouts)
 * lesson intro videos, Phase 2 Lessons 10 to 17. Every type is prefixed `s5-`.
 * LIVE functions are pure functions of t.
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pop = (t, at, d = 0.6) => back((t - at) / d);
  const win = (t, a, b, d = 0.35) => clamp((t - a) / d) * (1 - clamp((t - b) / d));
  const rad = d => d * Math.PI / 180;
  const F = 'font-family="DM Sans"', PF = 'font-family="Playfair Display"';
  const TD = { teal: '#2F8A7F', pink: '#C2475F', peach: '#B86E12' };

  function blink(t, seed) {
    const period = 3.6 + (seed % 3) * 0.7;
    const p = ((t + seed * 1.37) % period) / period;
    return p > 0.955 ? Math.sin((p - 0.955) / 0.045 * Math.PI) : 0;
  }
  const pill = (x, y, text, col, k = 1, fs = 28, fg = '#fff') => {
    if (k <= 0) return '';
    const w = text.length * fs * 0.6 + 36;
    return `<g transform="translate(${x},${y}) scale(${k})"><rect x="${-w / 2}" y="${-fs * 0.8}" width="${w}" height="${fs * 1.6}" rx="${fs * 0.8}" fill="${col}"/>
      <text y="${fs * 0.36}" font-size="${fs}" font-weight="900" text-anchor="middle" fill="${fg}" ${F}>${text}</text></g>`;
  };
  const scaleAt = (x, y, k, inner) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k}) translate(${-x},${-y})">${inner}</g>`;
  const sparkle = A.sparkle;
  const xMark = (x, y, k, r = 30, col = C.pink) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><path d="M${-r},${-r} L${r},${r} M${r},${-r} L${-r},${r}" stroke="${col}" stroke-width="${r * 0.36}" stroke-linecap="round"/></g>`;
  const tick = (x, y, k, r = 26, col = C.tealD) => k <= 0 ? '' : `<g transform="translate(${x},${y}) scale(${k})"><path d="M${-r},0 L${-r * 0.3},${r * 0.7} L${r},${-r * 0.7}" fill="none" stroke="${col}" stroke-width="${r * 0.4}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const ground = (y, fill = '#F6EDE6', edge = '#EADFD8') => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${fill}"/><rect x="0" y="${y}" width="1920" height="5" fill="${edge}"/>`;
  const cloud = (x, y, s = 1, op = 0.9) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#fff"/><circle cx="-26" cy="-18" r="30" fill="#fff"/><circle cx="20" cy="-26" r="36" fill="#fff"/></g>`;

  // Person bob, copied from illustrations.js so hats and props can follow the head.
  const bobOf = (t, seed, walking) => walking ? Math.abs(Math.sin(t * 9 + seed)) * -6 : Math.sin(t * 2 + seed) * 2;
  function hat(kind, t, o) {
    const s = o.scale || 1, f = o.flip ? -1 : 1, b = bobOf(t, o.seed || 2, o.walking);
    let h = '';
    if (kind === 'deerstalker') h = `<path d="M-46,-300 C-44,-352 44,-352 46,-300 Z" fill="${C.peach}"/><path d="M-46,-300 L46,-300" stroke="#C98A1F" stroke-width="5"/>
      <path d="M-30,-344 L30,-296 M30,-344 L-30,-296" stroke="#C98A1F" stroke-width="3" opacity=".6"/><path d="M40,-304 L74,-296 L42,-292 Z" fill="${C.peach}"/><circle cx="0" cy="-350" r="7" fill="#C98A1F"/>`;
    if (kind === 'top') h = `<rect x="-50" y="-318" width="100" height="12" rx="6" fill="${C.dark}"/><rect x="-32" y="-392" width="64" height="78" rx="6" fill="${C.dark}"/><rect x="-32" y="-338" width="64" height="12" fill="${C.pink}"/>`;
    if (kind === 'cap') h = `<path d="M-40,-298 C-40,-344 40,-344 40,-298 Z" fill="${o.col || C.purple}"/><path d="M30,-302 L82,-296 L34,-290 Z" fill="${o.col || C.purple}"/><circle cx="0" cy="-340" r="6" fill="#fff"/>`;
    if (kind === 'beret') h = `<ellipse cx="6" cy="-316" rx="48" ry="18" fill="${o.col || C.pink}"/><circle cx="8" cy="-334" r="6" fill="${o.col || C.pink}"/>`;
    if (kind === 'visor') h = `<path d="M-42,-306 L42,-306 L42,-318 L-42,-318 Z" fill="${o.col || C.teal}"/><path d="M20,-306 L80,-300 L24,-298 Z" fill="${o.col || C.teal}"/>`;
    if (kind === 'headset') h = `<path d="M-42,-286 C-42,-340 42,-340 42,-286" fill="none" stroke="${C.dark}" stroke-width="7"/><rect x="-50" y="-298" width="16" height="30" rx="6" fill="${C.dark}"/><path d="M-42,-272 Q-30,-246 -8,-248" stroke="${C.dark}" stroke-width="4" fill="none"/><circle cx="-6" cy="-248" r="6" fill="${C.pink}"/>`;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s})"><g transform="translate(0,${b.toFixed(2)})">${h}</g></g>`;
  }
  const P = (t, o, hatKind, hatCol) => A.person(t, o) + (hatKind ? hat(hatKind, t, { ...o, col: hatCol }) : '');

  /* --------------------------- creatures --------------------------- */
  function cat(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, fur = o.col || C.peach, dk = o.dark || '#D98A3A', sd = o.seed || 4;
    const bl = blink(t, sd), tail = Math.sin(t * 2.4 + sd) * 14, lx = (o.lookX || 0), ly = (o.lookY || 0);
    const shock = o.mood === 'shock', dizzy = o.mood === 'dizzy';
    const eyes = dizzy ? `<path d="M-22,-128 l12,12 m0,-12 l-12,12 M10,-128 l12,12 m0,-12 l-12,12" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`
      : shock ? `<circle cx="${-15 + lx}" cy="${-122 + ly}" r="9" fill="#fff" stroke="${C.dark}" stroke-width="3"/><circle cx="${15 + lx}" cy="${-122 + ly}" r="9" fill="#fff" stroke="${C.dark}" stroke-width="3"/><circle cx="${-15 + lx}" cy="${-122 + ly}" r="4" fill="${C.dark}"/><circle cx="${15 + lx}" cy="${-122 + ly}" r="4" fill="${C.dark}"/>`
        : `<ellipse cx="${-15 + lx}" cy="${-122 + ly}" rx="6" ry="${(9 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/><ellipse cx="${15 + lx}" cy="${-122 + ly}" rx="6" ry="${(9 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>`;
    const mouth = shock ? `<ellipse cx="0" cy="-98" rx="6" ry="8" fill="#6B2A2A"/>` : `<path d="M-10,-100 Q-5,-94 0,-100 Q5,-94 10,-100" fill="none" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>`;
    return `<g transform="translate(${o.x},${o.y}) rotate(${o.rot || 0}) scale(${s * f},${s * (o.sy || 1)})">
      <path d="M34,-24 C84,-24 ${92 + tail * 0.4},${-70 + tail} ${70 + tail},${-112 + tail * 0.6}" stroke="${fur}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-48" rx="46" ry="50" fill="${fur}"/>
      <ellipse cx="0" cy="-38" rx="24" ry="32" fill="#FFF3E6"/>
      <ellipse cx="-20" cy="-4" rx="17" ry="9" fill="${fur}"/><ellipse cx="20" cy="-4" rx="17" ry="9" fill="${fur}"/>
      <path d="M-36,-140 L-32,-184 L-6,-154 Z" fill="${fur}"/><path d="M36,-140 L32,-184 L6,-154 Z" fill="${fur}"/>
      <path d="M-30,-146 L-29,-170 L-14,-152 Z" fill="${C.pinkL}"/><path d="M30,-146 L29,-170 L14,-152 Z" fill="${C.pinkL}"/>
      <circle cx="0" cy="-118" r="42" fill="${fur}"/>
      <path d="M-8,-158 L-6,-144 M0,-160 L0,-144 M8,-158 L6,-144" stroke="${dk}" stroke-width="4" stroke-linecap="round"/>
      ${eyes}<path d="M-5,-110 L5,-110 L0,-104 Z" fill="${C.pink}"/>${mouth}
      <path d="M-20,-106 L-50,-110 M-20,-100 L-48,-96 M20,-106 L50,-110 M20,-100 L48,-96" stroke="${C.dark}" stroke-width="2" opacity=".5"/>
      <ellipse cx="-26" cy="-104" rx="7" ry="4" fill="${C.pink}" opacity=".45"/><ellipse cx="26" cy="-104" rx="7" ry="4" fill="${C.pink}" opacity=".45"/>
    </g>`;
  }

  function dog(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, run = o.run ? 1 : 0, air = o.air ? 1 : 0, sd = o.seed || 3;
    const sw = run * Math.sin(t * 16 + sd) * 26, wag = Math.sin(t * 14) * 18, bl = blink(t, sd);
    const leg = (x, a) => `<path d="M${x},-34 L${x + Math.sin(rad(a)) * 34},${-34 + Math.cos(rad(a)) * 34}" stroke="${C.peachL}" stroke-width="13" stroke-linecap="round"/>`;
    const legs = air ? leg(-34, 50) + leg(-20, 40) + leg(26, -50) + leg(38, -40) : leg(-34, sw) + leg(-20, -sw) + leg(26, -sw) + leg(38, sw);
    const sitting = o.sit;
    return `<g transform="translate(${o.x},${o.y}) scale(${s * f},${s}) rotate(${o.rot || 0})">
      <path d="M-46,-52 Q-70,${-80 + wag * 0.4} ${-64 + wag * 0.5},${-96}" stroke="${C.peach}" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${sitting ? `<ellipse cx="-14" cy="-36" rx="40" ry="38" fill="${C.peachL}"/>${leg(18, 0)}${leg(32, 0)}<ellipse cx="-30" cy="-6" rx="22" ry="10" fill="${C.peachL}"/>` : legs + `<ellipse cx="0" cy="-48" rx="54" ry="28" fill="${C.peachL}"/>`}
      <ellipse cx="-14" cy="-56" rx="20" ry="13" fill="${C.peach}" opacity=".8"/>
      <circle cx="${sitting ? 30 : 46}" cy="${sitting ? -96 : -84}" r="30" fill="${C.peachL}"/>
      <ellipse cx="${sitting ? 56 : 72}" cy="${sitting ? -88 : -76}" rx="18" ry="13" fill="#FFF3E6"/>
      <circle cx="${sitting ? 70 : 86}" cy="${sitting ? -92 : -80}" r="7" fill="${C.dark}"/>
      <ellipse cx="${sitting ? 38 : 54}" cy="${sitting ? -104 : -92}" rx="5" ry="${(7 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      <ellipse cx="${sitting ? 12 : 28}" cy="${sitting ? -92 : -80}" rx="11" ry="24" transform="rotate(${18 + (run ? Math.sin(t * 16) * 14 : 0)} ${sitting ? 14 : 30} ${sitting ? -112 : -100})" fill="${C.peach}"/>
      <path d="M${sitting ? 52 : 68},${sitting ? -78 : -66} Q${sitting ? 58 : 74},${sitting ? -70 : -58} ${sitting ? 64 : 80},${sitting ? -78 : -66}" stroke="${C.dark}" stroke-width="3" fill="none"/>
      ${o.tongue ? `<ellipse cx="${sitting ? 60 : 76}" cy="${sitting ? -68 : -56}" rx="6" ry="9" fill="${C.pink}"/>` : ''}
      <rect x="${sitting ? 6 : 22}" y="${sitting ? -76 : -64}" width="10" height="16" rx="4" fill="${C.pink}" transform="rotate(-20 ${sitting ? 10 : 26} ${sitting ? -70 : -58})"/>
    </g>`;
  }

  function bird(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, col = o.col || C.teal, wing = o.wing || C.tealD, sd = o.seed || 2;
    const flap = o.fly ? Math.sin(t * 22) * 40 : Math.sin(t * 3 + sd) * 4, bl = blink(t, sd + 1);
    const hop = o.hop ? -Math.abs(Math.sin(t * 5 + sd)) * 10 : 0;
    return `<g transform="translate(${o.x},${o.y + hop}) scale(${s * f},${s})">
      ${o.fly ? '' : `<path d="M-6,-4 L-8,6 M6,-4 L8,6" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`}
      ${o.tail ? `<path d="M-20,-24 L-62,-6 L-56,-20 L-66,-30 Z" fill="${o.tail}"/>` : `<path d="M-22,-26 L-44,-16 L-24,-14 Z" fill="${wing}"/>`}
      <ellipse cx="0" cy="-28" rx="28" ry="24" fill="${col}"/>
      <circle cx="16" cy="-52" r="18" fill="${col}"/>
      <ellipse cx="-4" cy="-28" rx="18" ry="12" fill="${wing}" transform="rotate(${-flap} 6 -32)"/>
      <path d="M32,-56 L46,-50 L32,-44 Z" fill="${C.gold}"/>
      <ellipse cx="20" cy="-56" rx="3.5" ry="${(5 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      ${o.crest ? `<path d="M10,-68 Q4,-90 18,-84 Q16,-96 28,-86" fill="${o.crest}"/>` : ''}
      <ellipse cx="6" cy="-18" rx="14" ry="9" fill="#fff" opacity=".35"/>
    </g>`;
  }

  function owl(t, o) {
    const s = o.s || 1, bl = blink(t, 7), look = o.lookX || 0;
    const gv = o.gavel ?? 0; // 0..1 gavel swing down
    const ga = -40 + gv * 60;
    return `<g transform="translate(${o.x},${o.y}) scale(${s})">
      <ellipse cx="0" cy="-110" rx="96" ry="116" fill="#9B6A45"/>
      <ellipse cx="0" cy="-84" rx="62" ry="80" fill="${C.peachL}"/>
      ${[0, 1, 2].map(i => `<path d="M${-30 + i * 30},${-110 + i % 2 * 30} q8,10 16,0" stroke="#C98A1F" stroke-width="3" fill="none"/>`).join('')}
      ${[-1, 1].map(d => [0, 1, 2, 3].map(i => `<circle cx="${d * (92 + (i % 2) * 6)}" cy="${-200 + i * 30}" r="20" fill="#fff" stroke="#EADFD8" stroke-width="2"/>`).join('')).join('')}
      <path d="M-70,-200 L-84,-250 L-40,-214 Z" fill="#9B6A45"/><path d="M70,-200 L84,-250 L40,-214 Z" fill="#9B6A45"/>
      <circle cx="-36" cy="-170" r="32" fill="#fff"/><circle cx="36" cy="-170" r="32" fill="#fff"/>
      <ellipse cx="${-36 + look}" cy="-168" rx="14" ry="${(15 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/><ellipse cx="${36 + look}" cy="-168" rx="14" ry="${(15 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      <circle cx="${-31 + look}" cy="-174" r="4" fill="#fff"/><circle cx="${41 + look}" cy="-174" r="4" fill="#fff"/>
      <path d="M-66,-196 Q-36,-214 -8,-198 M66,-196 Q36,-214 8,-198" stroke="#6E4530" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M-12,-142 L12,-142 L0,-118 Z" fill="${C.gold}"/>
      <g transform="translate(78,-90) rotate(${ga})">
        <ellipse cx="0" cy="0" rx="20" ry="40" fill="#8A5A38"/>
        <rect x="-4" y="-80" width="8" height="70" rx="4" fill="#6E4530"/><rect x="-26" y="-104" width="52" height="28" rx="8" fill="#6E4530"/>
      </g>
    </g>`;
  }

  function robot(t, o) {
    const s = o.s || 1, bl = blink(t, 5), talk = o.talk ? Math.abs(Math.sin(t * 12)) : 0;
    const led = Math.floor(t * 2) % 2 ? C.gold : '#FFF3C4';
    const face = o.face === 'q'
      ? `<text x="0" y="-232" font-size="70" font-weight="900" text-anchor="middle" fill="${C.teal}" ${PF}>?</text>`
      : `<ellipse cx="-34" cy="-262" rx="13" ry="${(16 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.teal}"/><ellipse cx="34" cy="-262" rx="13" ry="${(16 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.teal}"/>
        <rect x="${-22 - talk * 6}" y="${-226 - talk * 4}" width="${44 + talk * 12}" height="${6 + talk * 10}" rx="4" fill="${C.teal}"/>`;
    const armR = o.armR ?? 0;
    return `<g transform="translate(${o.x},${o.y}) scale(${s})">
      <line x1="0" y1="-330" x2="0" y2="-370" stroke="${C.muted}" stroke-width="6"/><circle cx="0" cy="-376" r="11" fill="${led}"/>
      <rect x="-26" y="-196" width="52" height="30" fill="${C.muted}"/>
      <rect x="-120" y="-176" width="240" height="190" rx="36" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="6"/>
      <circle cx="-50" cy="-110" r="12" fill="${C.pink}"/><circle cx="-14" cy="-110" r="12" fill="${C.gold}"/><circle cx="22" cy="-110" r="12" fill="${C.teal}"/>
      <path d="M120,-140 L${120 + Math.cos(rad(armR)) * 90},${-140 + Math.sin(rad(armR)) * 90}" stroke="${C.purple}" stroke-width="18" stroke-linecap="round"/>
      <circle cx="${120 + Math.cos(rad(armR)) * 96}" cy="${-140 + Math.sin(rad(armR)) * 96}" r="16" fill="${C.purple}"/>
      <path d="M-120,-140 L-170,-60" stroke="${C.purple}" stroke-width="18" stroke-linecap="round"/><circle cx="-172" cy="-56" r="16" fill="${C.purple}"/>
      <rect x="-104" y="-330" width="208" height="140" rx="34" fill="#fff" stroke="${C.purple}" stroke-width="6"/>
      <rect x="-84" y="-312" width="168" height="104" rx="22" fill="${C.dark}"/>
      ${face}
      <circle cx="-110" cy="-262" r="12" fill="${C.purple}"/><circle cx="110" cy="-262" r="12" fill="${C.purple}"/>
    </g>`;
  }

  function mouse(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, bl = blink(t, 9), laugh = o.laugh ? Math.abs(Math.sin(t * 14)) : 0;
    return `<g transform="translate(${o.x},${o.y - laugh * 6}) scale(${s * f},${s})">
      <path d="M-30,-14 Q-70,-10 -80,-40" stroke="#C9B9AE" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-24" rx="34" ry="24" fill="#C9B9AE"/>
      <circle cx="12" cy="-70" r="20" fill="#C9B9AE" stroke="#fff" stroke-width="0"/><circle cx="12" cy="-70" r="12" fill="${C.pinkL}"/>
      <circle cx="34" cy="-48" r="22" fill="#C9B9AE"/>
      <circle cx="54" cy="-46" r="6" fill="${C.pink}"/>
      <ellipse cx="38" cy="-54" rx="3.5" ry="${(5 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      ${o.laugh ? `<path d="M34,-38 Q42,-28 50,-38 Z" fill="#6B2A2A"/>` : `<path d="M36,-38 Q42,-34 48,-38" stroke="${C.dark}" stroke-width="2.5" fill="none"/>`}
    </g>`;
  }

  function duck(t, o) {
    const s = o.s || 1, f = o.flip ? -1 : 1, bob = Math.sin(t * 2.6) * 4, bl = blink(t, 11);
    return `<g transform="translate(${o.x},${o.y + bob}) scale(${s * f},${s})">
      <path d="M-46,-24 Q-60,-50 -40,-44 Z" fill="#fff"/>
      <ellipse cx="0" cy="-22" rx="48" ry="28" fill="#fff" stroke="#EADFD8" stroke-width="2"/>
      <ellipse cx="-6" cy="-26" rx="24" ry="13" fill="#F1E7E1"/>
      <circle cx="30" cy="-62" r="22" fill="#fff" stroke="#EADFD8" stroke-width="2"/>
      <path d="M48,-64 L70,-58 L48,-52 Z" fill="${C.peach}"/>
      <ellipse cx="34" cy="-68" rx="3.5" ry="${(5 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      <rect x="-60" y="-6" width="120" height="14" fill="${C.tealL}" opacity=".9"/>
    </g>`;
  }

  function seal(t, o) {
    const s = o.s || 1, clap = o.clap ? Math.sin(t * 16) * 20 : 0, bl = blink(t, 13);
    const ballA = t * 120;
    return `<g transform="translate(${o.x},${o.y}) scale(${s})">
      <path d="M-70,0 C-80,-60 -40,-150 10,-170 C40,-180 50,-140 40,-100 C30,-50 40,-10 60,0 Z" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>
      <path d="M-70,0 L-110,-14 L-96,8 Z" fill="${C.purple}"/>
      <path d="M10,-90 L${50 + clap * 0.3},${-60 - clap}" stroke="${C.purple}" stroke-width="16" stroke-linecap="round"/>
      <path d="M-10,-90 L${-46 - clap * 0.3},${-60 - clap}" stroke="${C.purple}" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="18" cy="-150" rx="4" ry="${(6 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      <ellipse cx="44" cy="-146" rx="10" ry="7" fill="${C.purple}"/>
      <path d="M30,-136 Q38,-130 46,-136" stroke="${C.dark}" stroke-width="2.5" fill="none"/>
      <g transform="translate(46,-196) rotate(${ballA})"><circle r="26" fill="${C.pink}"/><path d="M-26,0 A26,26 0 0,1 26,0 Z" fill="${C.gold}"/><path d="M0,-26 A10,26 0 0,1 0,26" fill="${C.teal}"/></g>
    </g>`;
  }

  // A candle character with a face. x = centre; screen ys for body and wick ends.
  function candleGuy(t, o) {
    const col = o.col || C.teal, w = o.w || 70, sd = o.seed || 6, bl = blink(t, sd);
    const cy = (o.top + o.bot) / 2, mood = o.mood;
    const face = `<ellipse cx="${o.x - 13}" cy="${cy - 10}" rx="5" ry="${(8 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/><ellipse cx="${o.x + 13}" cy="${cy - 10}" rx="5" ry="${(8 * (1 - bl * 0.9)).toFixed(1)}" fill="${C.dark}"/>
      ${mood === 'o' ? `<ellipse cx="${o.x}" cy="${cy + 12}" rx="6" ry="7" fill="#6B2A2A"/>` : `<path d="M${o.x - 11},${cy + 8} Q${o.x},${cy + 18} ${o.x + 11},${cy + 8}" fill="none" stroke="${C.dark}" stroke-width="3.5" stroke-linecap="round"/>`}
      <ellipse cx="${o.x - 22}" cy="${cy + 4}" rx="6" ry="4" fill="#fff" opacity=".45"/><ellipse cx="${o.x + 22}" cy="${cy + 4}" rx="6" ry="4" fill="#fff" opacity=".45"/>`;
    return `<line x1="${o.x}" x2="${o.x}" y1="${o.wt}" y2="${o.top}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>
      <line x1="${o.x}" x2="${o.x}" y1="${o.bot}" y2="${o.wb}" stroke="${col}" stroke-width="7" stroke-linecap="round"/>
      ${o.feet ? `<ellipse cx="${o.x - 16}" cy="${o.wb + 2}" rx="14" ry="7" fill="${C.dark}"/><ellipse cx="${o.x + 16}" cy="${o.wb + 2}" rx="14" ry="7" fill="${C.dark}"/>` : ''}
      <rect x="${o.x - w / 2}" y="${o.top}" width="${w}" height="${o.bot - o.top}" rx="12" fill="${col}"/>
      ${face}`;
  }

  /* ------------------------ staged swing chart ------------------------ */
  // Candles from A.swingChart revealed in stages: stages = [{at, to (swing index), dur}].
  function staged(t, o) {
    const per = o.per || 30, sw = o.swings, cum = [0];
    for (let k = 0; k < sw.length - 1; k++) cum.push(cum[k] + Math.max(2, Math.round((sw[k + 1][0] - sw[k][0]) * per)));
    let c = 0, prev = 0;
    for (const st of o.stages) {
      if (t <= st.at) break;
      c = lerp(prev, cum[st.to], clamp((t - st.at) / st.dur));
      prev = cum[st.to];
    }
    const N = cum[cum.length - 1];
    const svg = A.swingChart(c * 0.25, { x: o.x, y: o.y, w: o.w, h: o.h, swings: sw, seed: o.seed || 5, per, t0: 0, t1: N * 0.25, maxBody: o.maxBody || 18, wick: o.wick || 3 });
    const X = u => o.x + u * o.w, Y = v => o.y + o.h - v * o.h;
    // Where price is now (end of revealed candles).
    let k = 0; while (k < cum.length - 2 && cum[k + 1] < c) k++;
    const f = cum[k + 1] > cum[k] ? clamp((c - cum[k]) / (cum[k + 1] - cum[k])) : 0;
    const now = { u: lerp(sw[k][0], sw[k + 1][0], f), v: lerp(sw[k][1], sw[k + 1][1], f) };
    return { svg, X, Y, now, c };
  }
  const level = (X, Y, u0, u1, v, col, k, dash = '14 10', wdt = 5) => k <= 0 ? '' :
    `<line x1="${X(u0)}" x2="${lerp(X(u0), X(u1), ease(k))}" y1="${Y(v)}" y2="${Y(v)}" stroke="${col}" stroke-width="${wdt}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
  const panel = (x, y, w, h, k = 1, fill = '#fff') => scaleAt(x + w / 2, y + h / 2, k, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="${fill}" stroke="#F1E7E1" stroke-width="3"/>`);

  /* ------------------------------ BUILD ------------------------------ */
  const textLayer = s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${(s.headlines || []).map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:${h.size || 56}px">${h.html}</div></div>`).join('')}`;

  const LIVE = {};

  /* ===================== Lesson 10 ===================== */
  // A puppy hops fences of different heights: every hop is "a break", but not the same event.
  LIVE['s5-fences'] = (s, t, ctx) => {
    const T = s.beats, G = 960;
    let out = `<rect x="0" y="${G}" width="1920" height="150" fill="#E8F8F6"/><rect x="0" y="${G}" width="1920" height="6" fill="${C.tealL}"/>`;
    out += cloud(260 + Math.sin(t * 0.3) * 30, 440, 1.1) + cloud(1120 + Math.sin(t * 0.25 + 1) * 40, 410, 0.8);
    for (let i = 0; i < 22; i++) { const gx = 40 + i * 88, sw = Math.sin(t * 2 + i) * 3; out += `<path d="M${gx},${G + 40} l${-6 + sw},-18 M${gx + 8},${G + 40} l${sw},-24 M${gx + 16},${G + 40} l${6 + sw},-16" stroke="${C.tealD}" stroke-width="4" stroke-linecap="round" opacity=".45"/>`; }
    const bars = [
      { x: 700, h: 44, label: 'candle high', col: '#B9A79C', at: T.j1 + 0.5 },
      { x: 1010, h: 130, label: 'minor internal', col: C.muted, at: T.j2 + 0.5 },
      { x: 1290, h: 250, label: 'relevant swing', col: C.peach, at: T.j3 + 0.6 },
      { x: 1700, h: 470, label: 'external swing', col: C.purple, at: T.wall },
    ];
    bars.forEach((b, i) => {
      const k = pop(t, s.start + 0.5 + i * 0.35, 0.6);
      if (k <= 0) return;
      let g = '';
      if (i === 0) g = Array.from({ length: 6 }, (_, j) => `<rect x="${b.x - 48 + j * 18}" y="${G - b.h}" width="10" height="${b.h}" rx="4" fill="#C9A27A"/>`).join('') + `<rect x="${b.x - 54}" y="${G - b.h + 8}" width="110" height="6" rx="3" fill="#B98A5E"/>`;
      if (i === 1) g = Array.from({ length: 5 }, (_, j) => `<path d="M${b.x - 70 + j * 32},${G} l0,${-b.h + 14} l11,-14 l11,14 l0,${b.h - 14} Z" fill="#fff" stroke="#D9CFC8" stroke-width="3"/>`).join('') + `<rect x="${b.x - 80}" y="${G - 70}" width="160" height="10" rx="4" fill="#E9DED6"/><rect x="${b.x - 80}" y="${G - 30}" width="160" height="10" rx="4" fill="#E9DED6"/>`;
      if (i === 2) g = `<rect x="${b.x - 100}" y="${G - b.h}" width="20" height="${b.h}" rx="5" fill="#C98A1F"/><rect x="${b.x + 80}" y="${G - b.h}" width="20" height="${b.h}" rx="5" fill="#C98A1F"/>
        ${[0, 1, 2, 3, 4, 5].map(j => `<rect x="${b.x - 84}" y="${G - b.h + 16 + j * 40}" width="168" height="16" rx="5" fill="${C.peach}"/>`).join('')}<path d="M${b.x - 80},${G - 20} L${b.x + 80},${G - b.h + 20}" stroke="${C.peach}" stroke-width="14"/>`;
      if (i === 3) { g = `<rect x="${b.x - 110}" y="${G - b.h}" width="220" height="${b.h}" rx="10" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="5"/>`; for (let r = 0; r < 11; r++) for (let c2 = 0; c2 < 3; c2++) g += `<rect x="${b.x - 104 + c2 * 72 + (r % 2 ? 36 : 0) - (r % 2 && c2 === 2 ? 36 : 0)}" y="${G - b.h + 6 + r * 41.5}" width="${r % 2 && c2 === 2 ? 66 : 66}" height="36" rx="6" fill="#E7E4FB" opacity=".8"/>`; }
      out += scaleAt(b.x, G, k, g);
      out += pill(b.x, G - b.h - 46, b.label, b.col, pop(t, b.at, 0.5), 26);
    });
    // Dog keyframes: [time, x, jump height of the hop that ends here].
    const keys = [[T.run, 500, 0], [T.j1 - 0.35, 560, 0], [T.j1 + 0.35, 830, 120], [T.j2 - 0.9, 830, 0], [T.j2 - 0.35, 880, 0], [T.j2 + 0.4, 1140, 220], [T.j3 - 0.9, 1140, 0], [T.j3 - 0.35, 1150, 0], [T.j3 + 0.55, 1470, 380], [T.wall - 1.2, 1470, 0], [T.wall - 0.2, 1480, 0]];
    let dx = keys[0][1], dy = G, run = false, air = false, rot = 0;
    if (t >= keys[keys.length - 1][0]) dx = keys[keys.length - 1][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0] = keys[i], [t1, x1, h] = keys[i + 1];
      if (t >= t0 && t < t1) {
        const f = (t - t0) / (t1 - t0); dx = lerp(x0, x1, h ? f : ease(f));
        if (h) { dy = G - Math.sin(Math.PI * f) * h; air = true; rot = lerp(-18, 18, f); }
        run = x1 !== x0; break;
      }
    }
    const dk = pop(t, s.start + 0.6, 0.6);
    const atWall = t > T.wall - 0.2;
    out += scaleAt(dx, G, dk, dog(t, { x: dx, y: dy, s: 1.5, run: run && !air, air, rot, sit: atWall, tongue: !atWall }));
    if (atWall) out += [0, 1, 2].map(i => { const p = ((t - T.wall) * 0.7 + i * 0.33) % 1; return `<text x="${1480 + i * 34}" y="${740 - p * 110}" font-size="${44 + i * 8}" font-weight="900" fill="${C.purple}" opacity="${Math.sin(p * Math.PI) * 0.85}" ${PF}>?</text>`; }).join('');
    // Two onlookers on the left.
    const cheer = t > T.j1 && t < T.j1 + 3;
    out += P(t, { x: 180, y: G + 10, scale: 1.08, look: A.LOOKS.c, seed: 2, talk: cheer, frontArm: cheer ? { a1: -70, a2: -100 + Math.sin(t * 12) * 12 } : undefined }, 'cap', C.peach);
    out += P(t, { x: 360, y: G + 10, scale: 1.0, look: A.LOOKS.d, seed: 5, talk: t > T.ask && t < T.ask + 2.6, frontArm: { a1: 30, a2: -60 }, hold: `<rect x="-26" y="-60" width="52" height="66" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="4"/><rect x="-12" y="-66" width="24" height="10" rx="3" fill="${C.purple}"/><path d="M-14,-36 h28 M-14,-22 h20" stroke="${C.purpleL}" stroke-width="5"/>` });
    const b1 = win(t, T.j1 + 0.2, T.j1 + 3.2), b2 = win(t, T.ask, T.ask + 3.4);
    if (b1 > 0) out += A.bubble(250, 520, 'It broke out!', { op: b1, sc: 0.8 + 0.2 * b1, size: 30, weight: 700, tail: 'left' });
    if (b2 > 0) out += A.bubble(470, 540, 'Which fence?', { op: b2, sc: 0.8 + 0.2 * b2, size: 30, weight: 700, tail: 'left', color: C.purple });
    [T.j1 + 0.35, T.j2 + 0.4, T.j3 + 0.5].forEach((a, i) => { out += sparkle([830, 1140, 1470][i], G - 80, a, t, [C.muted, C.peach, C.gold][i]); });
    return out;
  };

  // A detective works the chart: which high actually broke?
  LIVE['s5-detective'] = (s, t, ctx) => {
    const T = s.beats;
    const px = 640, py = 392, pw = 1140, ph = 600;
    let out = panel(px, py, pw, ph, pop(t, s.start + 0.2, 0.7));
    if (t < s.start + 0.3) return out;
    const sw = [[0, 0.08], [0.16, 0.86], [0.27, 0.56], [0.38, 0.73], [0.55, 0.16], [0.64, 0.42], [0.7, 0.3], [0.78, 0.5], [0.87, 0.77], [0.93, 0.8]];
    const ch = staged(t, { x: 700, y: 440, w: 960, h: 500, swings: sw, seed: 10, per: 30, stages: [{ at: T.build, to: 6, dur: 3.2 }, { at: T.a, to: 7, dur: 1.0 }, { at: T.b, to: 8, dur: 1.0 }, { at: T.c - 0.6, to: 9, dur: 0.5 }] });
    const { X, Y } = ch;
    const lv = [[0.86, 0.16, C.purple, 'C'], [0.73, 0.38, C.peach, 'B'], [0.42, 0.64, '#B9A79C', 'A']];
    lv.forEach(([v, u, col, L], i) => {
      const k = seg(t, T.levels + i * 0.5, T.levels + i * 0.5 + 0.8);
      out += level(X, Y, u, 1.04, v, col, k);
      const q = pop(t, T.levels + i * 0.5 + 0.6, 0.5);
      if (q > 0) out += `<g transform="translate(${X(1.04) + 26},${Y(v)}) scale(${q})"><circle r="24" fill="${col}"/><text y="10" font-size="28" font-weight="900" text-anchor="middle" fill="#fff" ${F}>${L}</text></g>`;
    });
    out += ch.svg;
    // The wick-only candle at C.
    const wk = ease((t - T.c) / 0.8);
    if (wk > 0) {
      const cx = X(0.975), top = lerp(0.8, 0.93, wk);
      out += `<line x1="${cx}" x2="${cx}" y1="${Y(top)}" y2="${Y(0.77)}" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/><rect x="${cx - 8}" y="${Y(0.8)}" width="16" height="${Math.max(3, Y(0.785) - Y(0.8))}" rx="3" fill="${C.pink}"/>`;
    }
    // Magnifying lens hops from clue to clue.
    const clues = [[T.a + 0.8, 0.745, 0.42, 'A · tiny internal high', '#B9A79C', 0.28, 0.2], [T.b + 0.8, 0.835, 0.73, 'B · relevant swing high', C.peach, 0.55, 0.95], [T.c + 0.9, 0.975, 0.86, 'C · wick only', C.purple, 0.82, 1.08]];
    let lx = null, ly = null, li = -1;
    clues.forEach(([a, u, v], i) => { if (t > a) { li = i; } });
    if (li >= 0) {
      const [a, u, v] = clues[li];
      const prevC = clues[li - 1];
      const m = ease((t - a) / 0.6);
      lx = prevC ? lerp(X(prevC[1]), X(u), m) : X(u); ly = prevC ? lerp(Y(prevC[2]), Y(v), m) : Y(v);
      const k = li === 0 ? back((t - a) / 0.5) : 1;
      out += `<g transform="translate(${lx},${ly}) scale(${k})"><circle r="70" fill="#fff" fill-opacity=".25" stroke="${C.dark}" stroke-width="10"/><line x1="50" y1="50" x2="104" y2="104" stroke="${C.dark}" stroke-width="18" stroke-linecap="round"/></g>`;
    }
    clues.forEach(([a, u, v, txt, col, pu, pv], i) => { out += pill(X(pu), Y(pv), txt, col, pop(t, a + 0.5, 0.5), 25); });
    // Notebook: the investigation loop.
    const nb = pop(t, s.start + 1.0, 0.6);
    const steps = ['What broke?', 'Which swing?', 'How did it break?'];
    out += scaleAt(250, 500, nb, `<g transform="rotate(-4 250 500)"><rect x="110" y="400" width="300" height="210" rx="14" fill="#FFFDF6" stroke="${C.peachL}" stroke-width="4"/>
      ${[0, 1, 2, 3, 4].map(i => `<circle cx="${140 + i * 60}" cy="400" r="9" fill="none" stroke="${C.muted}" stroke-width="4"/>`).join('')}
      ${steps.map((st, i) => `<text x="170" y="${458 + i * 54}" font-size="25" font-weight="700" fill="${C.dark}" ${F}>${st}</text><rect x="132" y="${436 + i * 54}" width="26" height="26" rx="6" fill="none" stroke="${C.purple}" stroke-width="3"/>`).join('')}</g>`);
    [T.a + 1.4, T.b + 1.4, T.c + 1.6].forEach((a, i) => { out += `<g transform="rotate(-4 250 500)">${tick(145, 449 + i * 54, pop(t, a, 0.4), 16)}</g>`; });
    // Detective and her cat.
    const pointing = li >= 0;
    out += P(t, { x: 460, y: 1010, scale: 0.98, look: A.LOOKS.b, seed: 4, talk: ctx.talking, frontArm: pointing ? { a1: -30, a2: -50 } : { a1: 40, a2: -70 },
      hold: `<g transform="rotate(${pointing ? 20 : -20})"><line x1="0" y1="0" x2="0" y2="-40" stroke="${C.dark}" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="-64" r="26" fill="#fff" fill-opacity=".4" stroke="${C.dark}" stroke-width="7"/></g>` }, 'deerstalker');
    out += cat(t, { x: 220, y: 1010, s: 0.8, col: '#C9B9AE', dark: C.muted, seed: 3, lookX: 6, lookY: -3, mood: li === 2 && t < clues[2][0] + 2 ? 'shock' : undefined });
    return out;
  };

  /* ===================== Lesson 11 ===================== */
  // High jump over the relevant prior high (bullish BOS); limbo under the prior low (bearish BOS).
  LIVE['s5-high-jump'] = (s, t, ctx) => {
    const T = s.beats, G = 960, YB = 700, YL = 830;
    let out = `<rect x="0" y="${G}" width="1920" height="120" fill="${C.peachL}"/><rect x="0" y="${G}" width="1920" height="5" fill="${C.peach}"/>
      <rect x="0" y="${G + 46}" width="1920" height="4" fill="#fff" opacity=".8"/><rect x="0" y="${G + 90}" width="1920" height="4" fill="#fff" opacity=".8"/>`;
    // Left: bullish structure leading to the bar.
    const lp = seg(t, s.start + 0.5, s.start + 2.2);
    const bull = [[150, 930], [250, 800], [320, 860], [430, YB], [520, 800]];
    const bear = [[1790, 560], [1720, 690], [1660, 640], [1570, YL], [1500, 760]];
    const poly = (pts, k, col) => { const n = Math.max(2, Math.ceil(k * pts.length)); return k > 0 ? `<polyline points="${pts.slice(0, n).map(p => p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity=".55"/>` : ''; };
    out += poly(bull, lp, C.tealD);
    if (lp >= 1) out += pill(430, YB - 38, 'HH', C.teal, 1, 20) + pill(320, 900, 'HL', C.teal, 1, 20);
    out += level(x => x, y => y, 430, 760, YB, C.peach, seg(t, T.bar, T.bar + 0.8));
    out += pill(600, YB - 32, 'relevant prior high', C.peach, pop(t, T.bar + 0.5, 0.5), 21);
    const pk = pop(t, s.start + 0.4, 0.6);
    out += scaleAt(780, G, pk, `<rect x="770" y="${G - 330}" width="14" height="330" rx="5" fill="${C.muted}"/><rect x="752" y="${YB - 6}" width="70" height="12" rx="6" fill="${C.peach}"/>
      <rect x="752" y="${YB - 6}" width="18" height="12" fill="#fff" opacity=".7"/><rect x="788" y="${YB - 6}" width="18" height="12" fill="#fff" opacity=".7"/>
      <rect x="800" y="${G - 54}" width="230" height="54" rx="14" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>`);
    // Athlete.
    const sc = 0.8;
    let ax = 120, ay = G, rot = 0, walking = false, cheer = false;
    if (t >= T.run && t < T.jump) { ax = lerp(120, 650, seg(t, T.run, T.jump)); walking = true; }
    else if (t >= T.jump && t < T.jump + 1.0) { const f = (t - T.jump) / 1.0; ax = lerp(650, 900, f); ay = lerp(G, G - 54, f) - Math.sin(Math.PI * f) * 250; rot = 360 * ease(f); }
    else if (t >= T.jump + 1.0) { ax = 900; ay = G - 54; cheer = true; }
    out += `<g transform="rotate(${rot} ${ax} ${ay - 150 * sc})">` + A.person(t, { x: ax, y: ay, scale: sc, look: A.LOOKS.buyer, seed: 3, walking,
      frontArm: cheer ? { a1: -70, a2: -100 + Math.sin(t * 12) * 10 } : rot ? { a1: -100, a2: -90 } : undefined, backArm: cheer ? { a1: -110, a2: -80 } : undefined }) + '</g>';
    if (t > T.jump + 1.0) out += sparkle(900, G - 380, T.jump + 1.0, t, C.teal);
    // Right: bearish structure and the limbo bar.
    const rp = seg(t, T.limbo - 4.2, T.limbo - 2.6);
    out += poly(bear, rp, C.pink);
    if (rp >= 1) out += pill(1720, 650, 'LH', C.pink, 1, 20) + pill(1640, YL + 36, 'LL', C.pink, 1, 20);
    out += level(x => x, y => y, 1570, 1440, YL, C.purple, seg(t, T.limbo - 2.4, T.limbo - 1.6));
    out += pill(1310, YL - 40, 'relevant prior low', C.purple, pop(t, T.limbo - 1.8, 0.5), 21);
    const lk = pop(t, T.limbo - 4.4, 0.6);
    out += scaleAt(1320, G, lk, `<rect x="1170" y="${YL - 10}" width="14" height="${G - YL + 10}" rx="5" fill="${C.muted}"/><rect x="1456" y="${YL - 10}" width="14" height="${G - YL + 10}" rx="5" fill="${C.muted}"/>
      <rect x="1160" y="${YL - 8}" width="320" height="14" rx="7" fill="${C.purple}"/>${[0, 1, 2, 3].map(i => `<rect x="${1190 + i * 74}" y="${YL - 8}" width="30" height="14" fill="#fff" opacity=".5"/>`).join('')}`);
    let dx = 1640, lean = 0, dWalk = false;
    if (t >= T.limbo) { const f = seg(t, T.limbo, T.limbo + 4.0); dx = lerp(1640, 1100, f); dWalk = f < 1; lean = 68 * clamp(Math.min((1560 - dx) / 80, (dx - 1100) / 70)); }
    if (lk > 0) out += `<g transform="rotate(${lean} ${dx} ${G})">` + A.person(t, { x: dx, y: G, scale: sc, look: A.LOOKS.seller, flip: true, seed: 6, walking: dWalk,
      frontArm: t > T.limbo + 4.0 ? { a1: -70, a2: -100 + Math.sin(t * 12) * 10 } : { a1: -20, a2: -10 } }) + '</g>';
    if (t > T.limbo + 4.0) out += sparkle(1100, G - 300, T.limbo + 4.0, t, C.pink);
    // Scoreboard with a referee bird.
    const sb = pop(t, s.start + 0.8, 0.6), SX = 1030;
    const up = t > T.jump + 1.0, down = t > T.limbo + 3.6;
    const msg = down ? ['BOS ▼', C.pink, 'bearish'] : up ? ['BOS ▲', C.teal, 'bullish'] : ['· · ·', C.muted, 'waiting'];
    const flash = up && !down ? clamp(1 - (t - T.jump - 1.0) / 0.6) : down ? clamp(1 - (t - T.limbo - 3.6) / 0.6) : 0;
    out += scaleAt(SX, 455, sb, `<rect x="${SX - 130}" y="395" width="260" height="124" rx="20" fill="${C.dark}" stroke="${flash > 0 ? msg[1] : C.dark}" stroke-width="${6 + flash * 8}"/>
      <text x="${SX}" y="462" font-size="48" font-weight="900" text-anchor="middle" fill="${msg[1]}" ${F}>${msg[0]}</text>
      <text x="${SX}" y="498" font-size="20" font-weight="700" text-anchor="middle" fill="#fff" opacity=".8" letter-spacing="3" ${F}>${msg[2].toUpperCase()}</text>
      <rect x="${SX - 60}" y="519" width="12" height="50" fill="${C.muted}"/><rect x="${SX + 48}" y="519" width="12" height="50" fill="${C.muted}"/>`);
    const blow = (up && t < T.jump + 2.4) || (down && t < T.limbo + 5);
    out += bird(t, { x: SX + 80, y: 398, s: 1.0, col: C.peachL, wing: C.peach, seed: 4, hop: blow });
    if (blow) out += `<rect x="${SX + 116}" y="348" width="24" height="11" rx="5" fill="${C.purple}"/>` + [0, 1].map(i => { const q = ((t * 1.4) + i * 0.5) % 1; return `<text x="${SX + 150 + q * 40}" y="${345 - q * 30}" font-size="${26 + i * 6}" fill="${C.purple}" opacity="${1 - q}" ${F}>♪</text>`; }).join('');
    return out;
  };

  // A BOS is a receipt: it records what price already proved.
  LIVE['s5-receipt'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000);
    // Shop shelves behind.
    const sh = pop(t, s.start + 0.2, 0.6);
    out += scaleAt(1000, 480, sh, `<rect x="1180" y="400" width="560" height="16" rx="6" fill="#C9A27A"/><rect x="1180" y="540" width="560" height="16" rx="6" fill="#C9A27A"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${1200 + i * 88}" y="${340 + (i % 2) * 6}" width="60" height="${60 - (i % 2) * 6}" rx="10" fill="${[C.pinkL, C.tealL, C.peachL, C.purpleL][i % 4]}"/>`).join('')}
      ${[0, 1, 2, 3, 4].map(i => `<circle cx="${1230 + i * 110}" cy="512" r="26" fill="${[C.peach, C.teal, C.pink, C.gold, C.purple][i]}" opacity=".8"/>`).join('')}`);
    // Robot behind the counter.
    const rk = pop(t, s.start + 0.4, 0.7);
    const stampAt = T.stamp;
    const armR = t > stampAt - 0.8 && t < stampAt + 1.2 ? 30 : Math.sin(t * 2) * 6;
    out += scaleAt(560, 900, rk, robot(t, { x: 560, y: 900, s: 1.0, talk: ctx.talking && t < T.ask, face: t > T.ask + 0.8 && t < T.no ? 'q' : undefined, armR }));
    // Counter and register.
    out += `<rect x="290" y="740" width="1060" height="30" rx="10" fill="${C.peach}"/><rect x="310" y="770" width="1020" height="230" fill="${C.peachL}"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${340 + i * 250}" y="800" width="210" height="170" rx="14" fill="none" stroke="${C.peach}" stroke-width="4" opacity=".6"/>`).join('')}
      <rect x="860" y="620" width="240" height="122" rx="16" fill="${C.purple}"/><rect x="884" y="640" width="120" height="50" rx="8" fill="${C.dark}"/>
      <text x="944" y="674" font-size="26" font-weight="900" text-anchor="middle" fill="${C.teal}" ${F}>BOS</text>
      ${[0, 1, 2].map(i => `<rect x="${1020}" y="${638 + i * 24}" width="60" height="16" rx="5" fill="${C.purpleL}"/>`).join('')}
      <rect x="900" y="726" width="160" height="12" rx="6" fill="${C.dark}"/>`;
    // Receipt prints downward line by line.
    const rows = [['HL', '✓'], ['HH', '✓'], ['Closed above', ''], ['prior high', '✓'], ['TOTAL', 'BOS']];
    const pr = clamp((t - T.print) / (rows.length * 0.9));
    const L = 60 + pr * rows.length * 46;
    if (t > T.print) {
      out += `<path d="M890,732 L1070,732 L1070,${732 + L} ${Array.from({ length: 9 }, (_, i) => `L${1070 - (i + 0.5) * 20},${732 + L + (i % 2 ? 0 : 10)}`).join(' ')} L890,${732 + L} Z" fill="#fff" stroke="#EADFD8" stroke-width="3"/>`;
      rows.forEach((r, i) => {
        const a = T.print + i * 0.9 + 0.4;
        if (t < a) return;
        const y = 790 + i * 46, last = i === rows.length - 1;
        if (last) out += `<line x1="905" x2="1055" y1="${y - 30}" y2="${y - 30}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="6 5"/>`;
        out += `<text x="905" y="${y}" font-size="${last ? 24 : 22}" font-weight="${last ? 900 : 700}" fill="${C.dark}" ${F}>${r[0]}</text>
          <text x="1055" y="${y}" font-size="${last ? 24 : 22}" font-weight="900" text-anchor="end" fill="${last ? TD.teal : C.tealD}" ${F}>${r[1]}</text>`;
      });
    }
    // Stamp.
    const sk = clamp((t - stampAt) / 0.35);
    if (sk > 0) out += `<g transform="translate(1190,${890}) rotate(-12) scale(${lerp(1.8, 0.9, ease(sk))})" opacity="${sk}"><rect x="-120" y="-36" width="240" height="72" rx="12" fill="none" stroke="${C.tealD}" stroke-width="7"/>
        <text y="14" font-size="38" font-weight="900" text-anchor="middle" fill="${C.tealD}" letter-spacing="3" ${F}>PROVED</text></g>` + sparkle(1190, 890, stampAt + 0.2, t, C.teal);
    // Customer.
    const ck = pop(t, s.start + 0.8, 0.6);
    const asking = t > T.ask && t < T.ask + 3.2;
    out += scaleAt(1560, 1010, ck, P(t, { x: 1560, y: 1010, scale: 1.05, look: A.LOOKS.e, flip: true, seed: 8, talk: asking,
      frontArm: { a1: 70, a2: 100 }, hold: `<g transform="translate(0,6)"><path d="M-30,0 L30,0 L36,70 L-36,70 Z" fill="${C.pinkL}"/><path d="M-16,0 Q0,-30 16,0" stroke="${C.pink}" stroke-width="5" fill="none"/></g>` }, 'beret', C.teal));
    const bq = win(t, T.ask, T.no + 3.5);
    if (bq > 0) out += A.bubble(1400, 560, 'So it WILL keep going?', { op: bq, sc: 0.8 + 0.2 * bq, size: 34, weight: 700, tail: 'right', italic: true, font: 'Playfair Display' });
    if (t > T.no) out += xMark(1640, 530, pop(t, T.no, 0.4), 26) + pill(1290, 660, 'not on the receipt', C.pink, pop(t, T.no + 0.5, 0.5), 24);
    return out;
  };

  /* ===================== Lesson 12 ===================== */
  // A block tower: wobbles and a small block don't topple it; pulling the supporting block does.
  LIVE['s5-block-tower'] = (s, t, ctx) => {
    const T = s.beats, G = 980, TX = 690, RH = 46, NR = 9;
    let out = `<rect x="0" y="${G}" width="1920" height="100" fill="${C.pinkP}"/><rect x="0" y="${G}" width="1920" height="5" fill="${C.pinkL}"/>
      <ellipse cx="${TX}" cy="${G + 40}" rx="330" ry="30" fill="${C.pinkL}" opacity=".5"/>`;
    const wob = [[T.wob, 4], [T.int + 0.5, 5], [T.key + 0.6, 3]].reduce((a, [te, amp]) => t > te ? a + amp * Math.exp(-(t - te) * 1.6) * Math.sin((t - te) * 9) : a, 0);
    const lean = -9 * ease((t - T.key - 0.7) / 1.2);
    const tk = pop(t, s.start + 0.3, 0.6);
    let rowsSvg = '', upper = '';
    for (let r = 0; r < NR; r++) {
      const k = pop(t, s.start + 0.3 + r * 0.16, 0.5);
      if (k <= 0) continue;
      const y = G - (r + 1) * RH;
      const blocks = r % 2 === 0 ? [[TX - 120, 240]] : [[TX - 120, 70], [TX - 35, 70], [TX + 50, 70]];
      let g = '';
      blocks.forEach(([bx, bw], j) => {
        let dx = 0, dy = 0, rot = 0, fill = r % 4 < 2 ? C.peachL : '#FCE3C4', stroke = C.peach;
        const isKey = r === 1 && j === 1, isInt = r === 5 && j === 0, isTop = r === NR - 1;
        if (isKey) { fill = C.teal; stroke = C.tealD; if (t > T.key) { const f = ease((t - T.key) / 0.7); dx = f * 220; const d = clamp((t - T.key - 0.7) / 0.5); dy = d * d * 46; rot = d * 14; } }
        if (isInt) { fill = '#E9DED6'; stroke = C.muted; if (t > T.int) { const f = ease((t - T.int) / 0.6); dx = -f * 120; const d = clamp((t - T.int - 0.6) / 0.5); dy = d * d * (G - y - RH); rot = -d * 30; } }
        if (isTop && t > T.key + 1.6) { const d = clamp((t - T.key - 1.6) / 0.8); dx = -d * 130; dy = d * d * (G - y - RH + 12); rot = -d * 28; }
        const bl = `<g transform="translate(${dx},${dy}) rotate(${rot} ${bx + bw / 2} ${y + RH / 2})"><rect x="${bx}" y="${y}" width="${bw}" height="${RH - 4}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
          ${bw > 100 ? `<path d="M${bx + 20},${y + 14} h${bw - 40} M${bx + 30},${y + 28} h${bw - 70}" stroke="${stroke}" stroke-width="2" opacity=".35"/>` : `<circle cx="${bx + bw / 2}" cy="${y + RH / 2 - 2}" r="10" fill="none" stroke="${stroke}" stroke-width="2" opacity=".4"/>`}</g>`;
        if ((isKey && t > T.key) || (isInt && t > T.int) || (isTop && t > T.key + 1.6)) out += `<g>${bl}</g>`; // loose blocks drawn unrotated by the tower
        else g += bl;
      });
      const row = scaleAt(TX, y + RH / 2, k, g);
      if (r >= 2) upper += row; else rowsSvg += row;
    }
    // Loose blocks were appended to `out` first; the tower goes on top of the ground but behind them visually is fine.
    out += `<g transform="rotate(${wob} ${TX} ${G})">${rowsSvg}<g transform="rotate(${lean} ${TX - 120} ${G - 2 * RH})">${upper}</g></g>`;
    // Bird on top flies off when the key block goes.
    const topY = G - NR * RH;
    if (t < T.key + 2.4) {
      const fl = seg(t, T.key, T.key + 2.4);
      out += bird(t, { x: TX + 50 + fl * 520, y: topY - fl * 260, s: 1.0, col: C.purpleL, wing: C.purple, seed: 3, fly: fl > 0, flip: false, hop: fl === 0 && t > T.wob && t < T.wob + 1.5 });
    }
    // Kids.
    const k1Reach = t > T.int - 0.7 && t < T.int + 0.4, k2Reach = t > T.key - 0.7 && t < T.key + 0.5;
    out += scaleAt(360, G, tk, P(t, { x: 360, y: G, scale: 0.92, look: A.LOOKS.b, seed: 2, frontArm: k1Reach ? { a1: -8, a2: -14 } : t > T.wob && t < T.wob + 0.8 ? { a1: -20, a2: -30 } : undefined }));
    out += scaleAt(1000, G, tk, P(t, { x: 1000, y: G, scale: 0.92, look: A.LOOKS.e, flip: true, seed: 6, frontArm: k2Reach ? { a1: 8, a2: 20 } : undefined, talk: false }, 'cap', C.teal));
    // Tower labels.
    out += pill(TX, G + 50, 'supporting low', C.tealD, pop(t, T.sup, 0.5), 25);
    out += pill(TX, topY - 60, 'wobble ≠ shift', C.muted, pop(t, T.wob + 1.4, 0.5) * (1 - clamp((t - T.int + 0.4) / 0.3)), 25);
    out += pill(TX, topY - 60, 'still standing ✓', C.teal, pop(t, T.int + 1.4, 0.5) * (1 - clamp((t - T.key + 0.4) / 0.3)), 25);
    out += pill(TX - 40, topY - 60, 'potential MSS', C.pink, pop(t, T.key + 2.0, 0.5), 28);
    // Chart that mirrors the story.
    const ck = pop(t, s.start + 1.2, 0.7);
    out += panel(1130, 420, 640, 520, ck);
    if (ck > 0.6) {
      const sw = [[0, 0.08], [0.18, 0.5], [0.3, 0.36], [0.48, 0.9], [0.56, 0.7], [0.63, 0.78], [0.74, 0.52], [0.8, 0.6], [1, 0.22]];
      const ch = staged(t, { x: 1180, y: 470, w: 520, h: 420, swings: sw, seed: 12, per: 26, maxBody: 14, stages: [{ at: s.start + 1.6, to: 3, dur: 2.4 }, { at: T.wob, to: 5, dur: 1.6 }, { at: T.int, to: 7, dur: 1.4 }, { at: T.key + 0.2, to: 8, dur: 1.4 }] });
      out += level(ch.X, ch.Y, 0.3, 1.02, 0.36, C.tealD, seg(t, T.sup, T.sup + 0.8)) + level(ch.X, ch.Y, 0.56, 1.02, 0.7, '#B9A79C', seg(t, T.wob + 1, T.wob + 1.8), '10 10', 4);
      out += ch.svg;
      out += pill(ch.X(0.32), ch.Y(0.36) + 34, 'supporting HL', C.tealD, pop(t, T.sup + 0.4, 0.5), 20);
      out += pill(ch.X(0.84), ch.Y(0.7) - 30, 'internal low', '#B9A79C', pop(t, T.wob + 1.6, 0.5), 20);
      if (t > T.key + 1.6) out += `<circle cx="${ch.X(0.86)}" cy="${ch.Y(0.36)}" r="${16 + Math.sin(t * 6) * 3}" fill="none" stroke="${C.pink}" stroke-width="5"/>` + sparkle(ch.X(0.86), ch.Y(0.36), T.key + 1.6, t, C.pink);
    }
    return out;
  };

  // A traffic light turns amber: change information, not a green light to enter.
  LIVE['s5-traffic'] = (s, t, ctx) => {
    const T = s.beats, R = 860;
    let out = '';
    // Street backdrop.
    const bk = pop(t, s.start + 0.2, 0.6);
    const bldg = [[120, 560, 220, C.pinkP], [360, 500, 180, C.purpleL], [1460, 520, 200, '#FEF3E4'], [1690, 600, 200, C.pinkP]];
    bldg.forEach(([x, y, w, col], i) => {
      out += scaleAt(x + w / 2, R, bk, `<rect x="${x}" y="${y}" width="${w}" height="${R - y}" rx="12" fill="${col}" opacity=".9"/>${Array.from({ length: 6 }, (_, j) => `<rect x="${x + 26 + (j % 2) * (w / 2)}" y="${y + 30 + Math.floor(j / 2) * 80}" width="${w / 2 - 52}" height="46" rx="6" fill="#fff" opacity=".8"/>`).join('')}`);
    });
    out += `<rect x="0" y="${R - 20}" width="1920" height="20" fill="#EADFD8"/>` + A.road(R, { h: 140 }) + `<rect x="0" y="${R + 140}" width="1920" height="80" fill="#F6EDE6"/><rect x="0" y="${R + 140}" width="1920" height="6" fill="#DCCFC6"/>`;
    // Crosswalk and stop line.
    out += Array.from({ length: 5 }, (_, i) => `<rect x="${1190 + i * 0}" y="${R + 12 + i * 26}" width="80" height="16" rx="4" fill="#fff"/>`).join('') + `<rect x="1150" y="${R + 8}" width="10" height="124" fill="#fff"/>`;
    // Car waiting, revving.
    const rev = t > T.rev && t < T.rev + 3.4;
    const jit = rev ? Math.sin(t * 60) * 3 : 0;
    const carX = 880 + jit;
    out += A.vehicle('car', { x: carX, y: R + 104, t, scale: 1.2, moving: rev });
    out += `<circle cx="${carX + 50}" cy="${R + 104 - 164}" r="20" fill="#B07750"/><path d="M${carX + 32},${R + 104 - 170} C${carX + 30},${R + 104 - 196} ${carX + 70},${R + 104 - 196} ${carX + 68},${R + 104 - 170} Z" fill="${C.dark}"/>`;
    if (rev) out += [0, 1, 2].map(i => { const q = ((t - T.rev) * 1.6 + i / 3) % 1; return `<circle cx="${carX - 150 - q * 90}" cy="${R + 60 - q * 30}" r="${12 + q * 24}" fill="#D9CFC8" opacity="${0.8 * (1 - q)}"/>`; }).join('');
    const bd = win(t, T.rev + 0.2, T.guard + 1.6);
    if (bd > 0) out += A.bubble(820, 600, 'Enter now?!', { op: bd, sc: 0.8 + 0.2 * bd, size: 34, weight: 800, tail: 'right', color: C.pink });
    // Traffic light.
    const LX = 1330, amber = t > T.amber;
    const glow = amber ? 0.6 + 0.4 * Math.sin(t * 5) : 0;
    out += `<rect x="${LX - 9}" y="560" width="18" height="${R + 140 - 560}" fill="${C.dark}"/><rect x="${LX - 52}" y="420" width="104" height="270" rx="26" fill="${C.dark}"/>
      <circle cx="${LX}" cy="470" r="32" fill="${C.pink}" opacity=".25"/>
      ${amber ? `<circle cx="${LX}" cy="555" r="${54 + glow * 10}" fill="${C.gold}" opacity="${0.25 * glow}"/>` : ''}
      <circle cx="${LX}" cy="555" r="32" fill="${C.gold}" opacity="${amber ? 1 : 0.25}"/>
      <circle cx="${LX}" cy="640" r="32" fill="${C.cash}" opacity="${amber ? 0.25 : 1}"/>`;
    out += bird(t, { x: LX - 10, y: 420, s: 0.9, col: C.purpleL, wing: C.purple, seed: 5, flip: true, hop: t > T.amber && t < T.amber + 1.4 });
    if (amber) out += sparkle(LX, 555, T.amber, t, C.gold);
    // Crossing guard steps out.
    let gx = 1700, gw = false;
    if (t > T.guard) { const f = seg(t, T.guard, T.guard + 1.6); gx = lerp(1700, 1190, ease(f)); gw = f < 1; }
    const sign = `<g transform="translate(0,-10)"><rect x="-5" y="-150" width="10" height="150" fill="${C.muted}"/><circle cx="0" cy="-196" r="62" fill="${C.pink}" stroke="#fff" stroke-width="7"/>
      <text y="-186" font-size="34" font-weight="900" text-anchor="middle" fill="#fff" ${F}>WAIT</text></g>`;
    out += P(t, { x: gx, y: R + 150, scale: 0.95, look: A.LOOKS.a, flip: true, seed: 4, walking: gw, frontArm: t > T.guard ? { a1: -40, a2: -80 } : undefined, hold: t > T.guard ? sign : '', talk: ctx.talking && t > T.guard + 1.6 }, 'cap', C.gold);
    // Pills.
    out += pill(1640, 470, 'MSS = change information', C.peach, pop(t, T.amber + 0.6, 0.5), 25);
    out += pill(1640, 540, 'may be transitioning', C.gold, pop(t, T.may, 0.5), 23);
    out += pill(1640, 610, '≠ confirmed reversal', C.purple, pop(t, T.notrev, 0.5), 23);
    out += pill(960, 1035, 'not an entry signal', C.pink, pop(t, T.guard + 1.6, 0.5), 26);
    return out;
  };

  /* ===================== Lesson 13 ===================== */
  // A game show of honest reads: continuation, potential shift, or not enough information.
  LIVE['s5-game-show'] = (s, t, ctx) => {
    const T = s.beats;
    let out = ground(1000, C.pinkP, C.pinkL);
    // Spotlights.
    [[300, 0.5], [1620, -0.5]].forEach(([x, d], i) => {
      const a = Math.sin(t * 0.9 + i * 2) * 10 * d;
      out += `<g transform="rotate(${a} ${x} 360)"><path d="M${x - 14},360 L${x + 14},360 L${x + Math.sign(d) * 420 + 150},1000 L${x + Math.sign(d) * 420 - 150},1000 Z" fill="${C.gold}" opacity=".13"/></g>`;
    });
    // Curtains.
    const curtain = (x0, dir) => `<path d="M${x0},360 L${x0 + dir * 190},360 Q${x0 + dir * 120},680 ${x0 + dir * 170},1000 L${x0},1000 Z" fill="${C.purple}"/>` +
      [0, 1, 2].map(i => `<path d="M${x0 + dir * (40 + i * 46)},360 Q${x0 + dir * (24 + i * 40)},680 ${x0 + dir * (36 + i * 44)},1000" stroke="${C.purpleL}" stroke-width="6" fill="none" opacity=".5"/>`).join('');
    out += curtain(0, 1) + curtain(1920, -1);
    // Big screen with the chart.
    const sk = pop(t, s.start + 0.3, 0.6);
    out += scaleAt(960, 550, sk, `<rect x="620" y="380" width="680" height="340" rx="22" fill="${C.dark}"/><rect x="640" y="400" width="640" height="300" rx="12" fill="#FFFDF6"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${640 + i * 49}" cy="388" r="5" fill="${Math.floor(t * 4 + i) % 2 ? C.gold : '#FFF3C4'}"/>`).join('')}`);
    if (sk > 0.7) {
      const sw = [[0, 0.08], [0.2, 0.5], [0.32, 0.34], [0.55, 0.82], [0.66, 0.6], [0.72, 0.68], [0.8, 0.5], [0.88, 0.62], [0.97, 0.95]];
      const ch = staged(t, { x: 670, y: 420, w: 580, h: 260, swings: sw, seed: 21, per: 30, maxBody: 12, stages: [{ at: s.start + 0.9, to: 3, dur: 2.2 }, { at: T.pull, to: 7, dur: 2.2 }, { at: T.cont, to: 8, dur: 1.0 }] });
      out += level(ch.X, ch.Y, 0.55, 1.02, 0.82, C.tealD, seg(t, s.start + 3.2, s.start + 4)) + level(ch.X, ch.Y, 0.32, 1.02, 0.34, C.pink, seg(t, s.start + 3.6, s.start + 4.4));
      out += ch.svg;
      out += pill(ch.X(0.3), ch.Y(0.82), 'prior high', C.tealD, pop(t, s.start + 3.6, 0.5), 18) + pill(ch.X(0.5), ch.Y(0.34) + 26, 'supporting HL', C.pink, pop(t, s.start + 4.0, 0.5), 18);
      if (t > T.shift) {
        const k = ease((t - T.shift) / 1.0);
        out += `<path d="M${ch.X(0.88)},${ch.Y(0.62)} Q${ch.X(0.93)},${ch.Y(0.5)} ${lerp(ch.X(0.88), ch.X(0.99), k)},${lerp(ch.Y(0.62), ch.Y(0.16), k)}" fill="none" stroke="${C.pink}" stroke-width="5" stroke-dasharray="10 8" opacity=".85"/>`;
        out += pill(ch.X(0.86), ch.Y(0.1), 'or…', C.pink, pop(t, T.shift + 0.8, 0.4), 18);
      }
      if (t > T.buzz && t < T.buzz + 2.2) {
        const q = clamp((t - T.buzz) / 0.2) * (1 - clamp((t - T.buzz - 1.8) / 0.4));
        out += `<g opacity="${q}"><rect x="640" y="400" width="640" height="300" rx="12" fill="${C.pinkP}" opacity=".7"/>${xMark(960, 530, 1, 70)}
          <text x="960" y="660" font-size="54" font-weight="900" text-anchor="middle" fill="${C.pink}" ${F} transform="rotate(${Math.sin(t * 40) * 2} 960 640)">BZZT!</text></g>`;
      }
    }
    // Podiums.
    const pods = [[560, 'Continuation', C.teal, t > T.cont + 0.6], [960, 'Potential shift', C.pink, t > T.shift + 0.6], [1360, 'Not enough info', C.purple, t > T.nei && t < T.cont + 0.6]];
    pods.forEach(([x, lab, col, lit], i) => {
      const k = pop(t, s.start + 0.6 + i * 0.25, 0.6);
      const dashed = i === 1;
      const pulse = lit ? 0.85 + 0.15 * Math.sin(t * 6) : 1;
      out += scaleAt(x, 990, k, `${lit ? `<ellipse cx="${x}" cy="770" rx="${90 * pulse}" ry="${40 * pulse}" fill="${col}" opacity=".3"/>` : ''}
        <path d="M${x - 60},790 Q${x - 60},748 ${x},748 Q${x + 60},748 ${x + 60},790 Z" fill="${lit ? col : '#fff'}" stroke="${col}" stroke-width="5"/>
        <rect x="${x - 160}" y="790" width="320" height="200" rx="18" fill="${lit ? col : '#fff'}" stroke="${col}" stroke-width="5" ${dashed && lit ? 'stroke-dasharray="16 10"' : ''}/>
        <text x="${x}" y="880" font-size="34" font-weight="900" text-anchor="middle" fill="${lit ? '#fff' : col}" ${F}>${lab}</text>
        <text x="${x}" y="935" font-size="40" font-weight="900" text-anchor="middle" fill="${lit ? '#fff' : col}" ${F}>${['→', '⇄', '?'][i]}</text>`);
      if (lit) out += sparkle(x, 760, [T.cont + 0.6, T.shift + 0.6, T.nei][i], t, col);
    });
    // Host with a mic, contestant who buzzes too early.
    const mic = `<g transform="rotate(-30)"><rect x="-6" y="-56" width="12" height="56" rx="5" fill="${C.dark}"/><circle cx="0" cy="-64" r="16" fill="${C.muted}"/></g>`;
    out += P(t, { x: 260, y: 1010, scale: 1.0, look: A.LOOKS.seller, seed: 3, frontArm: { a1: -10, a2: -90 }, hold: mic, talk: ctx.talking && t < T.guess }, 'top');
    const sad = t > T.buzz && t < T.nei + 0.6, happy = t > T.cont + 0.6;
    out += P(t, { x: 1680, y: 1010, scale: 1.0, look: A.LOOKS.c, flip: true, seed: 7, mood: sad ? 'sad' : undefined,
      frontArm: t > T.guess - 0.3 && t < T.buzz + 0.4 ? { a1: -100, a2: -110 } : happy ? { a1: -70, a2: -100 + Math.sin(t * 12) * 10 } : undefined }, 'headset');
    const bg = win(t, T.guess, T.buzz + 1.0);
    if (bg > 0) out += A.bubble(1590, 560, 'Reversal!', { op: bg, sc: 0.8 + 0.2 * bg, size: 38, weight: 800, tail: 'right', color: C.pink });
    // Audience heads.
    for (let i = 0; i < 9; i++) {
      const hx = 260 + i * 175, clap = t > T.cont + 0.6 || (t > T.nei && t < T.nei + 1.5);
      const hy = 1072 - (clap ? Math.abs(Math.sin(t * 9 + i)) * 12 : Math.sin(t * 2 + i) * 2);
      out += `<circle cx="${hx}" cy="${hy}" r="34" fill="${['#3A2318', '#7A4A2A', '#2C1810', '#C27A3A'][i % 4]}"/><ellipse cx="${hx}" cy="${hy + 40}" rx="56" ry="30" fill="${[C.purpleL, C.tealL, C.pinkL, C.peachL][i % 4]}"/>`;
    }
    return out;
  };

  // An owl judge: a pullback alone is not evidence; "I don't know yet" is an honest verdict.
  LIVE['s5-owl-court'] = (s, t, ctx) => {
    const T = s.beats;
    let out = `<rect x="0" y="380" width="1920" height="620" fill="#FEF3E4"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${i * 170}" y="380" width="6" height="620" fill="${C.peachL}" opacity=".7"/>`).join('') +
      `<rect x="0" y="640" width="1920" height="10" fill="${C.peachL}"/>` + ground(1000, '#F3E3D7', '#E9D3C2');
    // Evidence easel with a chart.
    const ek = pop(t, s.start + 0.6, 0.6);
    out += scaleAt(1580, 700, ek, `<path d="M1460,900 L1500,640 M1700,900 L1660,640 M1580,900 L1580,700" stroke="#9B6A45" stroke-width="12" stroke-linecap="round"/>
      <rect x="1380" y="450" width="400" height="420" rx="20" fill="#fff" stroke="#9B6A45" stroke-width="8"/>`);
    if (ek > 0.7) {
      const sw = [[0, 0.1], [0.25, 0.62], [0.4, 0.4], [0.62, 0.9], [0.78, 0.6], [0.86, 0.7], [1, 0.55]];
      const ch = staged(t, { x: 1410, y: 520, w: 340, h: 300, swings: sw, seed: 31, per: 26, maxBody: 10, stages: [{ at: s.start + 1.0, to: 3, dur: 2.0 }, { at: T.shout - 0.8, to: 6, dur: 1.8 }] });
      const lr = seg(t, T.rules, T.rules + 0.8);
      out += level(ch.X, ch.Y, 0.62, 1.03, 0.9, C.tealD, lr, '10 8', 4) + level(ch.X, ch.Y, 0.4, 1.03, 0.4, C.pink, lr, '10 8', 4);
      out += ch.svg;
      out += pill(1580, 485, 'close above → continuation', C.tealD, pop(t, T.rules + 0.6, 0.5), 18);
      out += pill(1580, 845, 'close below → potential shift', C.pink, pop(t, T.rules + 1.0, 0.5), 18);
    }
    out += pill(1580, 940, 'a pullback ≠ evidence', C.purple, pop(t, T.notev + 0.4, 0.5), 24);
    // Lawyer.
    const shouting = t > T.shout && t < T.shout + 3.6, deflated = t > T.notev + 0.4;
    out += P(t, { x: 440, y: 1010, scale: 1.08, look: A.LOOKS.b, seed: 5, talk: shouting, mood: deflated && t < T.verdict ? 'sad' : undefined,
      frontArm: shouting ? { a1: -30, a2: -40 + Math.sin(t * 10) * 8 } : { a1: 70, a2: 100 }, hold: shouting ? '' : `<rect x="-30" y="-10" width="60" height="44" rx="6" fill="${C.dark}"/><rect x="-10" y="-18" width="20" height="10" rx="3" fill="${C.dark}"/>` });
    const bs = win(t, T.shout, T.notev + 0.2);
    if (bs > 0) out += A.bubble(560, 560, 'It pulled back! Reversal!', { op: bs, sc: 0.8 + 0.2 * bs, size: 34, weight: 800, tail: 'left', color: C.pink });
    // Bench and owl.
    const bk = pop(t, s.start + 0.3, 0.7);
    const bang = [T.notev, T.verdict].reduce((a, b) => t > b && t < b + 0.6 ? Math.sin((t - b) / 0.6 * Math.PI) : a, 0);
    out += scaleAt(960, 1000, bk, owl(t, { x: 960, y: 745, s: 1.12, gavel: bang, lookX: t > T.shout && t < T.notev ? -10 : t > T.rules - 0.4 && t < T.verdict ? 10 : 0 }) +
      `<rect x="680" y="700" width="560" height="34" rx="10" fill="${C.peachL}" stroke="#C98A1F" stroke-width="4"/><rect x="700" y="734" width="520" height="266" fill="${C.peach}"/>
      ${[0, 1].map(i => `<rect x="${730 + i * 240}" y="760" width="220" height="210" rx="14" fill="none" stroke="#C98A1F" stroke-width="5"/>`).join('')}
      <circle cx="960" cy="800" r="0"/>`);
    if (bang > 0) out += [0, 1, 2].map(i => `<path d="M${1050 + i * 24},${690 - i * 6} l${10 + i * 6},${-20 - i * 4}" stroke="${C.gold}" stroke-width="5" stroke-linecap="round" opacity="${bang}"/>`).join('');
    // Verdict scroll unrolls down the bench.
    const vk = ease((t - T.verdict) / 0.9);
    if (vk > 0) {
      const h = 210 * vk;
      out += `<rect x="740" y="760" width="440" height="${h}" rx="6" fill="#FFFDF6" stroke="${C.peachL}" stroke-width="4"/><rect x="726" y="${746}" width="468" height="26" rx="13" fill="#E9D3C2"/><rect x="726" y="${746 + h}" width="468" height="26" rx="13" fill="#E9D3C2"/>
        ${vk > 0.8 ? `<text x="960" y="840" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" letter-spacing="4" ${F}>VERDICT</text>
        <text x="960" y="904" font-size="48" font-weight="700" font-style="italic" text-anchor="middle" fill="${C.dark}" ${PF}>“I don’t know yet”</text>` : ''}`;
      out += sparkle(960, 860, T.verdict + 0.9, t, C.purple);
    }
    // Mouse stenographer.
    const typing = Math.floor(t * 8) % 2;
    out += `<rect x="1240" y="930" width="120" height="70" rx="10" fill="${C.purpleL}"/><rect x="1252" y="912" width="96" height="24" rx="6" fill="${C.purple}"/>
      <rect x="1266" y="${880 - (typing ? 4 : 0)}" width="68" height="34" rx="4" fill="#fff"/>` + mouse(t, { x: 1170, y: 1000, s: 1.3, laugh: t > T.verdict + 1 });
    return out;
  };

  /* ===================== Lesson 14 ===================== */
  // Circus safety net = the supporting swing. A big drop that the net catches is a retracement; a tear is different.
  LIVE['s5-circus-net'] = (s, t, ctx) => {
    const T = s.beats, NY = 780, G = 1000;
    let out = Array.from({ length: 16 }, (_, i) => `<rect x="${i * 120}" y="400" width="120" height="${G - 400}" fill="${i % 2 ? C.pinkP : '#FFF8F4'}"/>`).join('') +
      Array.from({ length: 24 }, (_, i) => `<path d="M${i * 80},400 a40,34 0 0,0 80,0 Z" fill="${i % 2 ? C.pink : C.pinkL}"/>`).join('') +
      `<rect x="0" y="392" width="1920" height="12" fill="${C.pink}"/>` + ground(G, C.peachL, C.peach);
    // Poles and platform.
    out += `<rect x="292" y="620" width="16" height="${G - 620}" fill="${C.muted}"/><rect x="210" y="620" width="190" height="16" rx="6" fill="${C.purple}"/>
      <rect x="1612" y="640" width="16" height="${G - 640}" fill="${C.muted}"/><rect x="1560" y="640" width="120" height="14" rx="6" fill="${C.purple}"/>
      <rect x="472" y="${NY}" width="12" height="${G - NY}" fill="${C.muted}"/><rect x="1436" y="${NY}" width="12" height="${G - NY}" fill="${C.muted}"/>`;
    const scenB = t > T.resetB;
    const Tf = scenB ? T.fallB : T.fallA;
    const ti1 = Tf + 1.4;
    const torn = scenB && t > ti1;
    // Acrobat motion.
    let ax = 330, ay = 620, rot = 0, cheer = false, wave = true, sag = 0;
    const arc = (a, b, h, f) => lerp(a, b, f) - Math.sin(Math.PI * f) * h;
    if (t >= Tf && t < ti1) { const f = (t - Tf) / 1.4; ax = lerp(330, 960, f); ay = lerp(620, NY, f * f) - 90 * Math.sin(Math.PI * f) * (1 - f); rot = 360 * ease(f); wave = false; }
    else if (t >= ti1) {
      wave = false;
      if (!scenB) {
        const c = [[ti1, 0.35, 90], [ti1 + 1.45, 0.3, 50]];
        const b1 = ti1 + 0.35, b2 = ti1 + 1.75, rest = ti1 + 2.35;
        sag = c.reduce((a, [st, d, amp]) => a + (t > st && t < st + d ? amp * Math.sin(Math.PI * (t - st) / d) : 0), 0);
        ax = 960;
        if (t < b1) ay = NY + sag;
        else if (t < b1 + 1.1) ay = arc(NY, NY, 170, (t - b1) / 1.1);
        else if (t < b2) ay = NY + sag;
        else if (t < rest) ay = arc(NY, NY, 70, (t - b2) / 0.6);
        else { sag = 18; ay = NY + sag; cheer = true; }
      } else {
        const land = ti1 + 0.45, hop = land + 1.2, hopEnd = hop + 1.0;
        ax = 960;
        if (t < land) ay = lerp(NY, 955, ease((t - ti1) / 0.45));
        else if (t < hop) ay = 955;
        else if (t < hopEnd) { const f = (t - hop) / 1.0; ax = lerp(960, 1200, f); ay = lerp(955, G, f) - Math.sin(Math.PI * f) * 100; }
        else { ax = 1200; ay = G; }
      }
    }
    // Net (or torn net).
    const netPath = (sg) => { const pts = []; for (let i = 0; i <= 24; i++) { const x = 480 + i * 40, u = (x - 960) / 480; pts.push([x, NY + sg * (1 - u * u)]); } return pts; };
    if (!torn) {
      const pts = netPath(sag);
      out += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${C.tealD}" stroke-width="7"/>` +
        `<polyline points="${pts.map(p => `${p[0]},${p[1] + 34}`).join(' ')}" fill="none" stroke="${C.tealD}" stroke-width="4"/>` +
        pts.map((p, i) => i < 24 ? `<path d="M${p[0]},${p[1]} L${p[0] + 40},${pts[i + 1][1] + 34} M${p[0] + 40},${pts[i + 1][1]} L${p[0]},${p[1] + 34}" stroke="${C.teal}" stroke-width="3"/>` : '').join('');
    } else {
      const k = ease((t - ti1) / 0.6);
      [[480, 1], [1440, -1]].forEach(([x0, d]) => {
        const ang = d * 30 * k, len = 440;
        out += `<g transform="rotate(${ang} ${x0} ${NY})"><rect x="${d > 0 ? x0 : x0 - len}" y="${NY}" width="${len}" height="34" fill="none" stroke="${C.tealD}" stroke-width="5"/>
          ${Array.from({ length: 11 }, (_, i) => `<line x1="${x0 + d * i * 40}" x2="${x0 + d * (i * 40 + 40)}" y1="${NY}" y2="${NY + 34}" stroke="${C.teal}" stroke-width="3"/>`).join('')}
          <path d="M${x0 + d * len},${NY} l${d * 14},12 l${-d * 10},10 l${d * 12},12" stroke="${C.tealD}" stroke-width="4" fill="none"/></g>`;
      });
      out += `<rect x="830" y="955" width="260" height="45" rx="14" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="4"/>`;
      if (t > ti1 + 0.1) out += sparkle(960, NY, ti1, t, C.pink);
    }
    const nl = pop(t, T.net, 0.5);
    out += pill(620, NY + 80, 'supporting HL', C.tealD, nl, 24);
    // New structure after the tear: lower high, lower low.
    if (scenB && t > ti1 + 2.8) {
      const k = ease((t - ti1 - 2.8) / 1.2);
      const pts = [[960, NY], [960, 955], [1080, 875], [1200, G]];
      const pp = alongPath(pts, k);
      const drawn = pts.slice(0, pp.seg + 1).concat([[pp.x, pp.y]]);
      out += `<polyline points="${drawn.map(q => q.join(',')).join(' ')}" fill="none" stroke="${C.pink}" stroke-width="6" stroke-dasharray="12 10" stroke-linejoin="round"/>`;
      out += pill(1080, 835, 'LH', C.pink, pop(t, ti1 + 3.4, 0.4), 22) + pill(1290, 1040, 'LL', C.pink, pop(t, ti1 + 3.9, 0.4), 22);
    }
    // Acrobat.
    const ak = scenB && t < T.fallB ? pop(t, T.resetB, 0.5) : 1;
    out += scaleAt(ax, ay, ak, `<g transform="rotate(${rot} ${ax} ${ay - 90})">` + A.person(t, { x: ax, y: ay, scale: 0.6, look: A.LOOKS.d, seed: 4,
      frontArm: cheer || rot ? { a1: -70, a2: -100 + (cheer ? Math.sin(t * 12) * 10 : 0) } : wave ? { a1: -60, a2: -120 + Math.sin(t * 7) * 20 } : undefined, backArm: cheer || rot ? { a1: -110, a2: -80 } : undefined }) + '</g>');
    if (!scenB && cheer) out += sparkle(960, NY - 230, ti1 + 2.35, t, C.teal);
    out += pill(1200, 640, 'net holds: retracement', C.tealD, pop(t, T.holds, 0.5) * (1 - clamp((t - T.resetB + 0.3) / 0.3)), 26);
    out += pill(1200, 640, 'potential reversal', C.pink, pop(t, T.rev, 0.5), 28);
    // Ringmaster and seal.
    out += P(t, { x: 1760, y: G + 10, scale: 1.0, look: A.LOOKS.a, flip: true, seed: 8, talk: ctx.talking, frontArm: { a1: -20, a2: -10 } }, 'top');
    out += seal(t, { x: 1500, y: G, s: 0.8, clap: (!scenB && cheer) });
    return out;
  };

  function alongPath(pts, k) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let d = lens.reduce((a, b) => a + b, 0) * clamp(k);
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? Math.min(1, d / lens[i]) : 0; return { x: lerp(pts[i][0], pts[i + 1][0], f), y: lerp(pts[i][1], pts[i + 1][1], f), seg: i, f }; }
      d -= lens[i];
    }
    return { x: pts[0][0], y: pts[0][1], seg: 0, f: 0 };
  }

  // Walking toward the back of a moving train: current move vs larger structure.
  LIVE['s5-train'] = (s, t, ctx) => {
    const T = s.beats, TR = 900;
    const run = (t - s.start);
    const hills = (base, amp, off, col, op) => { let d = `M-40,${TR}`; for (let x = -40; x <= 1960; x += 40) d += ` L${x},${base - amp * (0.6 * Math.sin((x + off) / 190) + 0.4 * Math.sin((x + off) / 83))}`; return `<path d="${d} L1960,${TR} Z" fill="${col}" opacity="${op}"/>`; };
    let out = hills(700, 60, run * 60, C.purpleL, 0.45) + hills(790, 50, run * 160, C.tealL, 0.7);
    // Trees whizzing by.
    for (let i = 0; i < 8; i++) { const x = ((i * 290 - run * 260) % 2320 + 2320) % 2320 - 200; out += `<rect x="${x - 6}" y="790" width="12" height="70" fill="#9B6A45"/><circle cx="${x}" cy="780" r="38" fill="${C.teal}"/>`; }
    out += `<rect x="0" y="860" width="1920" height="220" fill="#E8F8F6"/>`;
    for (let i = 0; i < 40; i++) { const x = ((i * 60 - run * 420) % 2400 + 2400) % 2400 - 200; out += `<rect x="${x}" y="${TR + 8}" width="34" height="14" rx="3" fill="#C9A27A"/>`; }
    out += `<rect x="0" y="${TR}" width="1920" height="7" fill="${C.muted}"/>`;
    const mark = out.length;
    // Train.
    const tb = Math.sin(t * 11) * 2;
    const wheels = (x0, x1) => [x0 + 50, x1 - 50].map(x => `<g transform="translate(${x},${TR - 22}) rotate(${run * 400})"><circle r="24" fill="${C.dark}"/><circle r="10" fill="#D9CFC8"/><rect x="-2" y="-22" width="4" height="22" fill="#D9CFC8"/></g>`).join('');
    out += `<g transform="translate(0,${tb})">
      <rect x="850" y="800" width="40" height="12" fill="${C.dark}"/><rect x="1260" y="800" width="50" height="12" fill="${C.dark}"/>
      <rect x="470" y="640" width="380" height="230" rx="22" fill="${C.peach}"/><rect x="470" y="630" width="380" height="22" rx="10" fill="${C.peachL}"/>
      ${[0, 1, 2].map(i => `<rect x="${500 + i * 116}" y="680" width="90" height="80" rx="12" fill="#FFF6EC"/>`).join('')}
      <rect x="880" y="610" width="390" height="260" rx="22" fill="${C.teal}"/><rect x="880" y="600" width="390" height="22" rx="10" fill="${C.tealL}"/>
      <rect x="900" y="640" width="350" height="210" rx="14" fill="#FFFDF6"/>
      <rect x="1300" y="650" width="320" height="220" rx="24" fill="${C.purple}"/><rect x="1300" y="560" width="150" height="310" rx="18" fill="${C.purple}"/>
      <rect x="1320" y="585" width="110" height="90" rx="12" fill="#E8F8F6"/><rect x="1530" y="570" width="44" height="90" rx="6" fill="${C.dark}"/><rect x="1520" y="560" width="64" height="18" rx="6" fill="${C.dark}"/>
      <circle cx="1610" cy="720" r="18" fill="#FFF3C4"/><path d="M1620,870 L1680,870 L1620,800 Z" fill="${C.dark}"/>
      ${wheels(470, 850)}${wheels(880, 1270)}${wheels(1300, 1620)}
    </g>`;
    // Smoke.
    out += [0, 1, 2, 3].map(i => { const q = ((t * 0.7) + i / 4) % 1; return `<circle cx="${1552 - q * 260}" cy="${545 - q * 50}" r="${14 + q * 26}" fill="#fff" opacity="${0.85 * (1 - q)}"/>`; }).join('');
    // Conductor in the cab; dog out of carriage window.
    out += `<g transform="translate(0,${tb})"><circle cx="1375" cy="640" r="28" fill="#C68B62"/><path d="M1343,628 C1345,598 1405,598 1407,628 Z" fill="${C.dark}"/><rect x="1343" y="620" width="64" height="10" rx="4" fill="${C.dark}"/>
      <ellipse cx="1365" cy="642" rx="3.5" ry="5" fill="${C.dark}"/><ellipse cx="1385" cy="642" rx="3.5" ry="5" fill="${C.dark}"/><path d="M1366,656 Q1375,662 1384,656" stroke="${C.dark}" stroke-width="3" fill="none"/></g>`;
    out += `<g transform="translate(0,${tb})">${dog(t, { x: 640, y: 790, s: 0.9, sit: true, tongue: true, flip: false })}</g>`;
    // Passenger walking toward the back, clipped to the big window.
    let px = 1210, walking = false;
    if (t > T.walk) { const f = seg(t, T.walk, T.walk + 8); px = lerp(1210, 960, f); walking = f < 1; }
    const red = t > T.red;
    const candle = `<g transform="translate(0,-8)"><line x1="0" y1="-74" x2="0" y2="0" stroke="${C.pink}" stroke-width="5"/><rect x="-14" y="-60" width="28" height="46" rx="5" fill="${C.pink}"/></g>`;
    out += `<defs><clipPath id="s5-train-win"><rect x="900" y="640" width="350" height="210" rx="14"/></clipPath></defs>
      <g clip-path="url(#s5-train-win)" transform="translate(0,${tb})">${A.person(t, { x: px, y: 850, scale: 0.6, look: A.LOOKS.b, flip: true, seed: 3, walking, frontArm: red ? { a1: 20, a2: -60 } : undefined, hold: red ? candle : '' })}</g>`;
    out = out.slice(0, mark) + `<g transform="translate(1045,${TR}) scale(1.2) translate(-1045,${-TR})">${out.slice(mark)}</g>`;
    // Arrows and labels.
    const ak = seg(t, s.start + 1.0, s.start + 2.0);
    if (ak > 0) {
      const xe = lerp(560, 1560, ease(ak));
      out += `<line x1="560" y1="470" x2="${xe}" y2="470" stroke="${C.tealD}" stroke-width="14" stroke-linecap="round" stroke-dasharray="40 18" stroke-dashoffset="${-t * 80}"/><path d="M${xe + 4},${440} L${xe + 54},470 L${xe + 4},500 Z" fill="${C.tealD}"/>`;
    }
    out += pill(1060, 412, 'the train: larger structure', C.tealD, pop(t, s.start + 2.2, 0.5), 25);
    const pk = pop(t, T.walk + 0.8, 0.5);
    out += pill(1045 + (px - 1045) * 1.2, 985, red ? '◀ red candles: current move' : '◀ you: current move', C.pink, pk, 24);
    // Level post scrolls by.
    if (t > T.levels) {
      const f = (t - T.levels) / 7, x = lerp(2000, 200, f);
      out += `<g transform="translate(${x},1080)"><rect x="-6" y="-40" width="12" height="40" fill="${C.muted}"/><rect x="-170" y="-92" width="340" height="56" rx="16" fill="#fff" stroke="${C.tealD}" stroke-width="5"/>
        <text y="-54" font-size="25" font-weight="900" text-anchor="middle" fill="${C.tealD}" ${F}>supporting HL: intact ✓</text></g>`;
    }
    return out;
  };

  /* ===================== Lesson 15 ===================== */
  // A two-storey house: the floor is the level. A wick peeks upstairs; a close moves in.
  LIVE['s5-house-visit'] = (s, t, ctx) => {
    const T = s.beats, FL = 690, G = 1000;
    let out = ground(G, '#E8F8F6', C.tealL);
    const hk = pop(t, s.start + 0.3, 0.7);
    let house = `<path d="M450,505 L960,385 L1470,505 Z" fill="${C.pink}"/><path d="M500,500 L960,395 L1420,500" fill="none" stroke="${C.pinkL}" stroke-width="10"/>
      <rect x="520" y="500" width="880" height="${FL - 500}" fill="#FFF6F0"/><rect x="520" y="${FL + 24}" width="880" height="${G - FL - 24}" fill="#FEF3E4"/>
      <rect x="510" y="500" width="14" height="${G - 500}" fill="${C.pinkL}"/><rect x="1396" y="500" width="14" height="${G - 500}" fill="${C.pinkL}"/>
      <rect x="580" y="545" width="110" height="90" rx="10" fill="#E8F8F6" stroke="${C.pinkL}" stroke-width="6"/><path d="M635,545 V635 M580,590 H690" stroke="${C.pinkL}" stroke-width="5"/>
      
      <ellipse cx="840" cy="${FL - 4}" rx="110" ry="12" fill="${C.peachL}"/>
      <rect x="590" y="${G - 140}" width="10" height="140" fill="${C.dark}"/><path d="M555,${G - 140} L635,${G - 140} L615,${G - 200} L575,${G - 200} Z" fill="${C.peachL}"/>
      <rect x="1290" y="${G - 70}" width="70" height="70" rx="10" fill="${C.pink}"/><circle cx="1325" cy="${G - 100}" r="40" fill="${C.teal}"/>`;
    // Ladder to the hatch on the right.
    house += `<rect x="1196" y="${FL - 20}" width="10" height="${G - FL + 20}" fill="#9B6A45"/><rect x="1254" y="${FL - 20}" width="10" height="${G - FL + 20}" fill="#9B6A45"/>
      ${Array.from({ length: 7 }, (_, i) => `<rect x="1196" y="${FL + 10 + i * 42}" width="68" height="8" rx="3" fill="#9B6A45"/>`).join('')}`;
    out += scaleAt(960, G, hk, house);
    // Picture appears upstairs once the mover is home.
    out += scaleAt(1290, 570, pop(t, T.home + 0.6, 0.5), `<rect x="1250" y="535" width="80" height="70" rx="6" fill="#fff" stroke="${C.gold}" stroke-width="6"/><path d="M1262,592 L1282,566 L1298,582 L1318,560 L1318,592 Z" fill="${C.teal}"/>`);
    // Cat upstairs.
    const peek = t > T.wick + 0.6 && t < T.wick + 3.6;
    if (hk > 0.5) out += cat(t, { x: 840, y: FL, s: 0.62, col: '#C9B9AE', dark: C.muted, seed: 2, flip: true, mood: peek ? 'shock' : undefined, lookX: peek ? -8 : 0 });
    if (peek) out += `<text x="880" y="${FL - 120}" font-size="56" font-weight="900" fill="${C.pink}" ${PF} opacity="${clamp((t - T.wick - 0.6) / 0.2)}">!</text>`;
    // Visitor candle: the wick pokes upstairs, the body stays below.
    const vk = pop(t, s.start + 1.0, 0.5);
    const up = ease((t - T.wick) / 0.8) * (1 - ease((t - T.wick - 3.4) / 0.8));
    const wt = lerp(800, 600, up);
    if (vk > 0) {
      out += scaleAt(760, G, vk, candleGuy(t, { x: 760, top: 830, bot: 950, wt, wb: G - 6, col: C.teal, feet: true, seed: 3, mood: up > 0.2 ? 'o' : undefined }));
      if (up > 0.05) {
        const look = Math.sin((t - T.wick) * 2.5) * 14;
        out += `<g transform="translate(760,${wt})"><rect x="-6" y="-26" width="12" height="26" fill="${C.tealD}"/><rect x="${-6 + Math.min(0, look)}" y="-34" width="${30 + Math.abs(look)}" height="20" rx="8" fill="${C.tealD}" transform="scale(${look < 0 ? -1 : 1},1)"/>
          <circle cx="${(look < 0 ? -1 : 1) * (26 + Math.abs(look))}" cy="-24" r="10" fill="#fff" stroke="${C.tealD}" stroke-width="4"/><circle cx="${(look < 0 ? -1 : 1) * (28 + Math.abs(look))}" cy="-24" r="4" fill="${C.dark}"/></g>`;
      }
    }
    // Floor slab (the level) drawn over the wick, with hatches.
    out += scaleAt(960, G, hk, `<rect x="520" y="${FL}" width="200" height="24" fill="${C.purple}"/><rect x="800" y="${FL}" width="380" height="24" fill="${C.purple}"/><rect x="1280" y="${FL}" width="120" height="24" fill="${C.purple}"/>`);
    out += level(x => x, y => y, 520, 140, FL + 12, C.purple, seg(t, T.level, T.level + 0.8), '16 10', 6) + level(x => x, y => y, 1400, 1780, FL + 12, C.purple, seg(t, T.level, T.level + 0.8), '16 10', 6);
    out += pill(300, FL - 34, 'the level', C.purple, pop(t, T.level + 0.5, 0.5), 26);
    // Mover candle: walks to the ladder, climbs, finishes upstairs.
    const mk = pop(t, s.start + 1.3, 0.5);
    let mx = 1080, lift = 0, walking = false;
    if (t > T.move) {
      const a = seg(t, T.move, T.move + 1.0), b = seg(t, T.move + 1.0, T.move + 3.0), c = seg(t, T.move + 3.0, T.move + 4.0);
      mx = lerp(1080, 1230, ease(a)); lift = (G - FL) * ease(b); mx = lerp(mx, 1110, ease(c)); walking = (a > 0 && a < 1) || (c > 0 && c < 1);
    }
    const hop = walking ? Math.abs(Math.sin(t * 9)) * 8 : 0;
    const my = -lift - hop;
    if (mk > 0) out += scaleAt(mx, G, mk, `<g transform="translate(0,${my})">${candleGuy(t, { x: mx, top: 830, bot: 950, wt: 795, wb: G - 6, col: C.teal, feet: true, seed: 8 })}
      <g transform="translate(${mx - 70},905)"><rect x="-26" y="-6" width="52" height="40" rx="8" fill="${C.peach}"/><path d="M-10,-6 Q0,-20 10,-6" stroke="#C98A1F" stroke-width="4" fill="none"/></g></g>`);
    if (t > T.home) out += sparkle(1100, 560, T.home, t, C.teal);
    // Labels.
    out += pill(300, 830, 'wick through', C.purple, pop(t, T.wickL, 0.5), 26) + pill(300, 890, 'body closed back below', C.purpleL, pop(t, T.wickL + 0.5, 0.5), 22, C.purple);
    out += pill(1620, 560, 'close through', C.tealD, pop(t, T.home + 0.4, 0.5), 26) + pill(1620, 620, 'body finished above', C.tealL, pop(t, T.home + 0.9, 0.5), 22, C.tealD);
    return out;
  };

  // Photo finish: a hand reaching across the line is not a finish. Where did the body finish?
  LIVE['s5-photo-finish'] = (s, t, ctx) => {
    const T = s.beats, FX = 1180, L1 = 832, L2 = 978;
    let out = `<rect x="0" y="600" width="1920" height="92" fill="#E8F8F6"/><rect x="0" y="690" width="1920" height="300" fill="${C.peachL}"/>
      <rect x="0" y="688" width="1920" height="6" fill="#fff"/><rect x="0" y="838" width="1920" height="6" fill="#fff"/><rect x="0" y="986" width="1920" height="6" fill="#fff"/>` + ground(990, '#F6EDE6');
    // Finish line, post, bird.
    for (let i = 0; i < 15; i++) out += `<rect x="${FX - 12}" y="${692 + i * 20}" width="12" height="20" fill="${i % 2 ? C.dark : '#fff'}"/><rect x="${FX}" y="${692 + i * 20}" width="12" height="20" fill="${i % 2 ? '#fff' : C.dark}"/>`;
    out += `<rect x="${FX - 4}" y="560" width="8" height="132" fill="${C.muted}"/><rect x="${FX - 70}" y="560" width="140" height="40" rx="10" fill="${C.dark}"/><text x="${FX}" y="588" font-size="22" font-weight="900" text-anchor="middle" fill="#fff" letter-spacing="3" ${F}>FINISH</text>`;
    out += bird(t, { x: FX + 30, y: 560, s: 0.85, col: C.pinkL, wing: C.pink, seed: 9, hop: (t > T.r1 && t < T.r1 + 1) || (t > T.r2 && t < T.r2 + 1) });
    // Camera and official.
    const flash = (at) => t > at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0;
    const f1 = flash(T.r1 + 0.2), f2 = flash(T.r2 + 0.1), fl = Math.max(f1, f2);
    out += `<path d="M1500,700 L1450,990 M1500,700 L1550,990 M1500,700 L1500,990" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
      <rect x="1440" y="630" width="120" height="76" rx="14" fill="${C.purple}"/><circle cx="1440" cy="668" r="28" fill="${C.dark}"/><circle cx="1440" cy="668" r="14" fill="${C.purpleL}"/><rect x="1500" y="616" width="34" height="16" rx="4" fill="${C.purple}"/>`;
    if (fl > 0) out += `<circle cx="1440" cy="668" r="${40 + (1 - fl) * 80}" fill="#fff" opacity="${fl}"/><rect x="0" y="0" width="1920" height="1080" fill="#fff" opacity="${fl * 0.35}"/>`;
    out += P(t, { x: 1650, y: 1000, scale: 0.95, look: A.LOOKS.c, flip: true, seed: 6, frontArm: { a1: 10, a2: -10 } }, 'visor', C.purple);
    // Runner 1: reaches across, body stays behind, then steps back.
    const sc = 0.7;
    let x1 = 120, lean1 = 0, w1 = false, reach = false;
    if (t > T.r1 - 2.4) { const f = seg(t, T.r1 - 2.4, T.r1); x1 = lerp(120, 1112, ease(f)); w1 = f < 1; }
    if (t > T.r1 - 0.2) { reach = true; lean1 = 14 * (1 - seg(t, T.r1 + 1.6, T.r1 + 2.2)); }
    if (t > T.r1 + 1.6) { x1 = lerp(1112, 1040, seg(t, T.r1 + 1.6, T.r1 + 2.2)); reach = t < T.r1 + 1.8; }
    out += `<g transform="rotate(${lean1} ${x1} ${L1})">` + A.person(t, { x: x1, y: L1, scale: sc, look: A.LOOKS.seller, seed: 2, walking: w1, frontArm: reach ? { a1: -8, a2: -6 } : w1 ? undefined : { a1: 80, a2: 95 } }) + '</g>';
    // Runner 2: whole body crosses.
    let x2 = 120, w2 = false;
    if (t > T.r2 - 2.6) { const f = seg(t, T.r2 - 2.6, T.r2 + 0.6); x2 = lerp(120, 1300, f); w2 = f < 1; }
    const done2 = t > T.r2 + 0.6;
    out += A.person(t, { x: x2, y: L2, scale: sc, look: A.LOOKS.buyer, seed: 5, walking: w2, frontArm: done2 ? { a1: -70, a2: -100 + Math.sin(t * 12) * 10 } : undefined });
    if (done2) out += sparkle(1300, L2 - 250, T.r2 + 0.6, t, C.teal);
    // Polaroids.
    const photo = (tx, at, rot, wick, label, col) => {
      const cx = 400;
      const k = pop(t, at, 0.6);
      if (k <= 0) return '';
      const iy = 410, lv = 480;
      const cnd = wick
        ? `<line x1="${cx}" x2="${cx}" y1="${lv - 40}" y2="${lv + 80}" stroke="${C.teal}" stroke-width="5"/><rect x="${cx - 18}" y="${lv + 14}" width="36" height="56" rx="5" fill="${C.teal}"/>`
        : `<line x1="${cx}" x2="${cx}" y1="${lv - 60}" y2="${lv + 50}" stroke="${C.teal}" stroke-width="5"/><rect x="${cx - 18}" y="${lv - 50}" width="36" height="72" rx="5" fill="${C.teal}"/>`;
      return `<g transform="translate(${tx},525) scale(1.35) translate(${-cx},-500)"><g transform="translate(${cx},500) rotate(${rot}) scale(${k}) translate(${-cx},-500)">
        <rect x="${cx - 150}" y="${iy - 22}" width="300" height="236" rx="8" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <rect x="${cx - 130}" y="${iy - 4}" width="260" height="160" rx="4" fill="#FFF8F2"/>
        <line x1="${cx - 120}" x2="${cx + 120}" y1="${lv}" y2="${lv}" stroke="${C.purple}" stroke-width="4" stroke-dasharray="10 7"/>
        ${cnd}
        <text x="${cx}" y="${iy + 196}" font-size="28" font-weight="900" text-anchor="middle" fill="${col}" letter-spacing="2" ${F}>${label}</text></g></g>`;
    };
    out += photo(330, T.r1 + 0.6, -4, true, 'WICK THROUGH', C.purple) + photo(800, T.r2 + 0.5, 3, false, 'CLOSE THROUGH ✓', C.tealD);
    // What a wick can still show.
    ['traded beyond', 'rejection', 'quick excursion'].forEach((txt, i) => { out += pill(1560, 420 + i * 62, txt, C.purpleL, pop(t, T.info + i * 0.5, 0.5), 26, C.purple); });
    out += pill(960, 1036, 'the close carries more weight', C.tealD, pop(t, T.conv, 0.5), 26);
    return out;
  };

  /* ===================== Lesson 16 ===================== */
  // A cat jumps above the shelf (resistance), then slides back off: false break behavior.
  LIVE['s5-cat-shelf'] = (s, t, ctx) => {
    const T = s.beats, SH = 600, CT = 880;
    let out = `<rect x="100" y="390" width="1060" height="${CT - 390}" rx="24" fill="#FFF8F2"/>` +
      Array.from({ length: 6 }, (_, i) => `<line x1="100" x2="1160" y1="${720 + i * 32}" y2="${720 + i * 32}" stroke="${C.peachL}" stroke-width="2"/>`).join('') +
      Array.from({ length: 17 }, (_, i) => `<line x1="${120 + i * 62}" x2="${120 + i * 62}" y1="720" y2="${CT}" stroke="${C.peachL}" stroke-width="2"/>`).join('') + ground(1000);
    // Counter.
    out += `<rect x="90" y="${CT - 10}" width="1090" height="24" rx="8" fill="${C.peach}"/><rect x="100" y="${CT + 14}" width="1070" height="${1000 - CT - 14}" fill="${C.peachL}"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${130 + i * 262}" y="${CT + 30}" width="230" height="80" rx="10" fill="none" stroke="${C.peach}" stroke-width="4" opacity=".7"/><rect x="${230 + i * 262}" y="${CT + 44}" width="30" height="8" rx="4" fill="${C.peach}"/>`).join('')}`;
    // Shelf with jars and brackets.
    out += `<rect x="300" y="${SH}" width="600" height="18" rx="6" fill="#C9A27A"/><path d="M340,${SH + 18} l0,40 l40,-40 Z M860,${SH + 18} l0,40 l-40,-40 Z" fill="#B98A5E"/>
      <rect x="800" y="${SH - 70}" width="44" height="70" rx="10" fill="${C.tealL}"/><rect x="796" y="${SH - 82}" width="52" height="16" rx="5" fill="${C.teal}"/>
      <rect x="854" y="${SH - 52}" width="36" height="52" rx="10" fill="${C.pinkL}"/><rect x="850" y="${SH - 62}" width="44" height="14" rx="5" fill="${C.pink}"/>`;
    // Price display on the wall.
    const price = t > T.slip + 0.6 ? '19,985' : t > T.jump + 0.6 ? '20,005' : '19,990';
    const pcol = t > T.slip + 0.6 ? C.pink : t > T.jump + 0.6 ? C.tealD : C.dark;
    out += scaleAt(240, 450, pop(t, s.start + 0.6, 0.5), `<rect x="140" y="420" width="200" height="70" rx="14" fill="${C.dark}"/><text x="240" y="470" font-size="40" font-weight="900" text-anchor="middle" fill="${pcol === C.dark ? '#FFF3C4' : pcol}" ${F}>${price}</text>`);
    // Level line to the chart.
    out += level(x => x, y => y, 300, 1760, SH, C.purple, seg(t, s.start + 0.8, s.start + 2.0), '16 10', 5);
    // Chart panel.
    const pk = pop(t, s.start + 0.4, 0.6);
    out += panel(1210, 400, 560, 580, pk);
    const Yp = v => SH - (v - 20000) * 6;
    const cs = [[1260, 19950, 19965, 19968, 19946, s.start + 1.2], [1320, 19965, 19958, 19970, 19954, s.start + 1.5], [1380, 19958, 19976, 19979, 19955, s.start + 1.8], [1440, 19976, 19990, 19993, 19972, s.start + 2.1],
      [1530, 19990, 20005, 20008, 19987, T.jump + 0.2], [1630, 20005, 19985, 20009, 19982, T.slip + 0.2]];
    cs.forEach(([x, o, c, hi, lo, at], i) => {
      const p = ease((t - at) / 0.6);
      if (p <= 0) return;
      const cc = lerp(o, c, p), col = c >= o ? C.teal : C.pink, w = i >= 4 ? 46 : 30;
      out += `<line x1="${x}" x2="${x}" y1="${Yp(lerp(Math.max(o, c), hi, p))}" y2="${Yp(lerp(Math.min(o, c), lo, p))}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
        <rect x="${x - w / 2}" y="${Yp(Math.max(o, cc))}" width="${w}" height="${Math.max(4, Math.abs(Yp(o) - Yp(cc)))}" rx="5" fill="${col}"/>`;
    });
    out += pill(1430, SH - 36, 'resistance 20,000', C.purple, pop(t, s.start + 2.0, 0.5), 22);
    if (t > T.jump + 0.8) out += pill(1530, Yp(20005) + 120, '20,005', C.tealD, pop(t, T.jump + 0.8, 0.4), 20);
    if (t > T.slip + 0.8) out += pill(1650, Yp(19985) + 70, '19,985', C.pink, pop(t, T.slip + 0.8, 0.4), 20);
    // Cat.
    let cx = 560, cy = CT, rot = 0, mood, sy = 1;
    if (t > T.jump && t < T.jump + 0.8) { const f = (t - T.jump) / 0.8; cx = lerp(560, 640, f); cy = lerp(CT, SH, f) - Math.sin(Math.PI * f) * 90; rot = lerp(-25, 0, f); sy = 1.08; }
    else if (t >= T.jump + 0.8 && t < T.slip) { cx = 640; cy = SH; }
    else if (t >= T.slip) {
      const a = seg(t, T.slip, T.slip + 0.7), b = seg(t, T.slip + 0.7, T.slip + 1.3);
      cx = lerp(640, 930, ease(a)); cy = SH; rot = a * 10;
      if (b > 0) { cx = lerp(930, 990, b); cy = lerp(SH, CT, b * b); rot = lerp(10, -20, b); }
      mood = b > 0 ? (b >= 1 ? 'dizzy' : 'shock') : 'shock';
    }
    out += cat(t, { x: cx, y: cy, s: 1.0, rot, sy, mood, seed: 6, lookY: t < T.jump ? -6 : 0 });
    if (t > T.jump + 0.8 && t < T.slip) out += sparkle(640, SH - 150, T.jump + 0.8, t, C.gold);
    if (t > T.slip + 1.3) out += [0, 1, 2].map(i => { const a = t * 3 + i * 2.1; return `<text x="${990 + Math.cos(a) * 54}" y="${CT - 200 + Math.sin(a) * 14}" font-size="30" text-anchor="middle" fill="${C.gold}" ${F}>★</text>`; }).join('');
    // Mouse laughs at the slip.
    out += mouse(t, { x: 1080, y: CT - 10, s: 1.1, flip: true, laugh: t > T.slip + 1.2 && t < T.slip + 4.5 });
    // Pills.
    out += pill(620, 470, 'breakout confirmed forever?', C.peach, pop(t, T.forever, 0.5) * (1 - clamp((t - T.slip + 0.2) / 0.3)), 26);
    if (t > T.forever + 1.4 && t < T.slip) out += xMark(860, 470, pop(t, T.forever + 1.4, 0.4), 20);
    out += pill(640, 470, 'moved above, failed to hold', C.pink, pop(t, T.fail, 0.5), 26);
    out += pill(1490, 1030, 'false break behavior', C.pink, pop(t, T.fb, 0.5), 26);
    return out;
  };

  // The security footage only shows price: observation before interpretation.
  LIVE['s5-cctv'] = (s, t, ctx) => {
    const T = s.beats, DK = 860;
    let out = `<rect x="0" y="380" width="1920" height="${DK - 380}" fill="#F7F1FB" opacity=".7"/>` + ground(1000);
    // Monitor.
    const mk = pop(t, s.start + 0.3, 0.6);
    let mon = `<rect x="920" y="790" width="80" height="80" fill="${C.muted}"/><rect x="840" y="850" width="240" height="16" rx="8" fill="${C.muted}"/>
      <rect x="620" y="390" width="680" height="410" rx="26" fill="${C.dark}"/><rect x="650" y="420" width="620" height="350" rx="12" fill="#3D3550"/>`;
    for (let i = 0; i < 18; i++) mon += `<rect x="650" y="${420 + i * 20 + (t * 30) % 20}" width="620" height="3" fill="#fff" opacity=".05"/>`;
    const rec = Math.floor(t * 1.5) % 2;
    mon += `<circle cx="684" cy="450" r="9" fill="${C.pink}" opacity="${rec ? 1 : 0.3}"/><text x="702" y="458" font-size="22" font-weight="900" fill="#fff" opacity=".85" ${F}>REC</text>
      <text x="1250" y="458" font-size="20" font-weight="700" text-anchor="end" fill="#fff" opacity=".6" ${F}>CAM 1 · PRICE</text>`;
    out += scaleAt(960, 600, mk, mon);
    if (mk > 0.7) {
      const pts = [[680, 720], [760, 680], [820, 700], [900, 630], [960, 660], [1030, 590], [1080, 520], [1130, 600], [1180, 650], [1240, 630]];
      const k = ease(seg(t, s.start + 1.0, s.start + 4.0));
      const pp = alongPath(pts, k);
      const drawn = pts.slice(0, pp.seg + 1).concat([[pp.x, pp.y]]);
      out += `<line x1="670" x2="1250" y1="560" y2="560" stroke="${C.purpleL}" stroke-width="4" stroke-dasharray="12 8"/>
        <text x="676" y="548" font-size="20" font-weight="700" fill="${C.purpleL}" ${F}>prior high</text>
        <polyline points="${drawn.map(q => q.join(',')).join(' ')}" fill="none" stroke="${C.tealL}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${pp.x}" cy="${pp.y}" r="10" fill="${C.gold}"/>`;
      if (t > T.foot) out += pill(960, 736, 'only price on camera', C.purple, pop(t, T.foot, 0.5), 22);
      if (t > T.obs) {
        const q = pop(t, T.obs, 0.5);
        out += `<circle cx="1080" cy="520" r="${22 * q}" fill="none" stroke="${C.gold}" stroke-width="5"/><circle cx="1180" cy="650" r="${22 * q}" fill="none" stroke="${C.gold}" stroke-width="5"/>`;
      }
    }
    // Gossip with a parrot; calm analyst.
    const gTalk = t > T.g1 && t < T.g1 + 2.8;
    out += P(t, { x: 300, y: 1000, scale: 1.05, look: A.LOOKS.b, seed: 3, talk: gTalk, frontArm: gTalk ? { a1: -50, a2: -90 + Math.sin(t * 9) * 12 } : undefined, mood: t > T.assume + 0.4 && t < T.parrot2 ? 'sad' : undefined });
    const squawk = (t > T.g1 + 1.4 && t < T.g1 + 3.8) || (t > T.parrot2 && t < T.parrot2 + 3);
    out += bird(t, { x: 338, y: 800, s: 0.85, col: C.teal, wing: C.pink, tail: C.peach, crest: C.pink, seed: 5, hop: squawk });
    const aTalk = t > T.obs - 0.2 && t < T.obs + 4;
    out += P(t, { x: 1600, y: 1000, scale: 1.05, look: A.LOOKS.e, flip: true, seed: 7, talk: aTalk, frontArm: { a1: 40, a2: -60 },
      hold: `<rect x="-28" y="-62" width="56" height="70" rx="6" fill="#fff" stroke="${C.tealD}" stroke-width="4"/><path d="M-16,-40 h32 M-16,-26 h24 M-16,-12 h28" stroke="${C.tealL}" stroke-width="5"/>` }, 'cap', C.purple);
    // Desk in front.
    out += `<rect x="200" y="${DK}" width="1520" height="26" rx="10" fill="${C.peach}"/><rect x="220" y="${DK + 26}" width="1480" height="${1000 - DK - 26}" fill="${C.peachL}"/>
      <path d="M470,${DK} L480,${DK - 60} L540,${DK - 60} L550,${DK} Z" fill="#fff" stroke="${C.pink}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${488 + i * 11}" cy="${DK - 66 - (i % 2) * 8}" r="9" fill="#FFF3C4"/>`).join('')}
      <rect x="1380" y="${DK - 54}" width="44" height="54" rx="8" fill="${C.teal}"/><path d="M1424,${DK - 42} q20,0 20,16 q0,14 -20,14" stroke="${C.teal}" stroke-width="6" fill="none"/>`;
    // Speech.
    const b1 = win(t, T.g1, T.obs - 0.4);
    if (b1 > 0) out += A.bubble(430, 455, 'Big money trapped retail!', { op: b1, sc: 0.8 + 0.2 * b1, size: 30, weight: 800, tail: 'left', color: C.pink });
    const b2 = win(t, T.g1 + 1.4, T.g1 + 4.2);
    if (b2 > 0) out += A.bubble(300, 560, 'Trapped! Squawk!', { op: b2, sc: 0.8 + 0.2 * b2, size: 26, weight: 800, tail: 'right', color: C.tealD });
    const sa = clamp((t - T.assume) / 0.3);
    if (sa > 0 && b1 > 0) out += `<g transform="translate(430,455) rotate(-8) scale(${lerp(1.6, 1, ease(sa))})" opacity="${sa}"><rect x="-140" y="-30" width="280" height="60" rx="10" fill="#fff" fill-opacity=".85" stroke="${C.pink}" stroke-width="6"/>
      <text y="12" font-size="32" font-weight="900" text-anchor="middle" fill="${C.pink}" letter-spacing="3" ${F}>ASSUMPTION</text></g>`;
    const b3 = win(t, T.obs, s.end);
    if (b3 > 0) out += A.bubble(1590, 470, 'Above the high, then back below.', { op: b3, sc: 0.8 + 0.2 * b3, size: 28, weight: 700, tail: 'right', color: C.tealD });
    const so = clamp((t - T.obs - 2.6) / 0.3);
    if (so > 0) out += `<g transform="translate(1590,555) rotate(6) scale(${lerp(1.6, 1, ease(so))})" opacity="${so}"><rect x="-150" y="-30" width="300" height="60" rx="10" fill="#fff" fill-opacity=".85" stroke="${C.tealD}" stroke-width="6"/>
      <text y="12" font-size="30" font-weight="900" text-anchor="middle" fill="${C.tealD}" letter-spacing="3" ${F}>OBSERVATION ✓</text></g>`;
    const b4 = win(t, T.parrot2, s.end);
    if (b4 > 0) out += A.bubble(300, 560, 'Observation!', { op: b4, sc: 0.8 + 0.2 * b4, size: 26, weight: 800, tail: 'right', color: C.tealD });
    return out;
  };

  /* @@MORE@@ */

  window.ILLUS.BUILD = window.ILLUS.BUILD || {};
  Object.assign(window.ILLUS.LIVE, LIVE);
  Object.assign(window.ILLUS.BUILD, Object.fromEntries(Object.keys(LIVE).map(k => [k, textLayer])));
})();
