/**
 * scenes-illustrated.js — illustrated, story-driven scene types.
 *
 * Each type has:
 *   build(s)        → the scene's HTML text layer (kickers, headlines), animated by
 *                     player.html through data-in / data-out like every other scene
 *   live(s, t, ctx) → the SVG artwork for time t, redrawn every frame
 *                     (ctx.talking is true while a narration line is being read)
 */
(function () {
  const A = window.ART, C = A.COL;
  const { ease, back, clamp, lerp } = A;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  // Place Aristella (natively 400x560) on the 1920x1080 stage.
  function host(t, o) {
    const w = o.w || 520, h = w * 1.4;
    const enter = o.enterAt != null ? back((t - o.enterAt) / 0.9) : 1;
    const y = o.y + (1 - enter) * 700;
    return A.aristella(t, o).replace('<svg ', `<svg x="${o.x}" y="${y.toFixed(1)}" width="${w}" height="${h}" `);
  }
  const nameTag = (x, y, t, at) => {
    const p = back((t - at) / 0.6);
    if (p <= 0) return '';
    return `<g transform="translate(${x},${y}) scale(${p})">
      <rect x="-150" y="-34" width="300" height="68" rx="34" fill="#fff" stroke="${C.pinkL}" stroke-width="3"/>
      <text x="0" y="-2" font-size="30" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">Aristella</text>
      <text x="0" y="24" font-size="18" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="2">YOUR AGHF GUIDE</text></g>`;
  };
  const ground = (y, op = 1) => `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="#F6EDE6" opacity="${op}"/>
    <rect x="0" y="${y}" width="1920" height="4" fill="#EADFD8" opacity="${op}"/>`;
  const pop = (t, at, d = 0.6) => back((t - at) / d);

  const BUILD = {
    'host-title': s => `
      <div class="abs" style="left:760px;right:120px;top:300px">
        <div class="phase-pill" data-in="${s.start + 0.6}" style="display:inline-block">${esc(s.phase)}</div>
        <div class="h1" data-in="${s.start + 1.1}" style="text-align:left;font-size:116px">${esc(s.title)}</div>
        <div class="title-quote" data-in="${s.start + 2.6}" style="text-align:left;margin-top:40px">“${esc(s.quote)}”</div>
      </div>`,
    'host-hook': s => `
      <div class="abs" style="left:780px;right:120px;top:300px">
        <div class="kicker" data-in="${s.start + 0.4}">${esc(s.kicker)}</div>
        ${s.parts.map(p => `<div class="big" data-in="${p.at}" style="text-align:left;font-size:80px">${p.html || esc(p.text)}</div>`).join('')}
      </div>`,
    participants: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.start + 0.6}">${esc(s.title)}</div></div>`,
    exchange: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.titleAt}" style="font-size:64px">${esc(s.title)}</div></div>
      <div class="bottom"><div class="footer-pill" data-in="${s.footer.at}" style="margin:0">${esc(s.footer.text)}</div></div>`,
    crowd: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:64px">${h.html || esc(h.text)}</div></div>`).join('')}`,
    'chart-tug': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.textAt}" style="font-size:58px;max-width:1500px">${s.html}</div></div>`,
    'crystal-surf': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.4}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.lineA}" style="font-size:64px">Trading isn’t <span class="strike">predicting the future<i data-grow="${s.strikeAt}"></i></span>.</div>
        <div class="h2" data-in="${s.surfAt}" style="font-size:64px;margin-top:14px">You’re <span class="mark">participating</span> in price movement.</div></div>`,
    sides: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.start + 0.6}" style="font-size:64px">${esc(s.title)}</div></div>
      <div class="bottom"><div class="footer-pill" data-in="${s.footer.at}" style="margin:0">${esc(s.footer.text)}</div></div>`,
    'time-compare': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.start + 0.6}" style="font-size:64px">${esc(s.title)}</div></div>`,
    checklist: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        ${s.parts.map(p => `<div class="h2" data-in="${p.at}" style="font-size:56px;margin-top:10px">${p.html || esc(p.text)}</div>`).join('')}</div>`,
    'push-candle': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.4}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.lineA}" style="font-size:58px">Price isn’t moving because your <span style="color:#2F8A7F">candle turned green.</span></div>
        <div class="h2" data-in="${s.rewindAt}" style="font-size:58px;margin-top:12px">The candle turned green because <span class="mark">price moved.</span></div></div>`,
    stairs: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:58px">${h.html}</div></div>`).join('')}`,
    pullback: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'host-mission': s => `
      <div class="abs" style="left:760px;right:110px;top:260px">
        <div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="mission-q" data-in="${s.question.at}" style="text-align:left;font-size:76px">${esc(s.question.text)}</div>
        <div class="cta" data-in="${s.cta.at}" data-anim="pop" style="display:inline-block">${esc(s.cta.text)} →</div>
      </div>`,
  };

  const LIVE = {
    'host-title': (s, t, ctx) =>
      host(t, { x: 130, y: 300, w: 560, pose: t < s.start + 5.5 ? 'wave' : 'idle', talk: ctx.talking, enterAt: s.start + 0.1 }) +
      (s.nameTag ? nameTag(410, 1010, t, s.nameTagAt ?? s.start + 1.6) : ''),

    'host-hook': (s, t, ctx) => {
      const pose = t < s.pointAt ? 'think' : 'point';
      const q = t < s.pointAt ? [0, 1, 2].map(i => {
        const p = ((t - s.start) * 0.7 + i * 0.33) % 1;
        return `<text x="${560 + i * 50}" y="${380 - p * 120}" font-size="${50 + i * 8}" font-weight="900" fill="${C.purple}" opacity="${Math.sin(p * Math.PI) * 0.8}" font-family="Playfair Display">?</text>`;
      }).join('') : '';
      return host(t, { x: 100, y: 330, w: 540, pose, talk: ctx.talking }) + q;
    },

    participants: (s, t) => s.items.map((it, i) => {
      const n = s.items.length, gap = n > 3 ? 420 : 480, half = Math.min(200, gap / 2 - 20);
      const cx = 960 + (i - (n - 1) / 2) * gap, p = pop(t, it.at, 0.7);
      if (p <= 0) return '';
      const next = s.items[i + 1] ? s.items[i + 1].at : s.end - 0.6;
      const focus = t >= it.at && t < next ? ease((t - it.at) / 0.4) : 0;
      const col = C[it.color];
      const lines = it.desc.map((d, k) => `<text x="${cx}" y="${835 + k * 40}" font-size="31" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(d)}</text>`).join('');
      return `<g transform="translate(${cx},${650 - focus * 16}) scale(${p * (1 + focus * 0.04)}) translate(${-cx},-650)">
        <rect x="${cx - half}" y="420" width="${half * 2}" height="500" rx="40" fill="#fff" stroke="${focus > 0 ? col : '#F1E7E1'}" stroke-width="${focus > 0 ? 4 : 2}"/>
        <g transform="translate(${cx},610) scale(1.25)">${A.badge(it.kind, t)}</g>
        <text x="${cx}" y="785" font-size="54" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${esc(it.label)}</text>
        ${lines}
      </g>`;
    }).join(''),

    exchange: (s, t, ctx) => {
      const G = 900, sc = 1.3;
      const T = s.beats;
      // Walk in, then step together for the handshake.
      const bx0 = lerp(-200, 560, ease(seg(t, T.buyerIn, T.buyerIn + 2.6)));
      const sx0 = lerp(2120, 1360, ease(seg(t, T.sellerIn, T.sellerIn + 2.6)));
      const meet = ease(seg(t, T.meet, T.meet + 1.3));
      const bx = lerp(bx0, 812, meet), sx = lerp(sx0, 1108, meet);
      const bWalk = (t > T.buyerIn && t < T.buyerIn + 2.6) || (t > T.meet && t < T.meet + 1.3);
      const sWalk = (t > T.sellerIn && t < T.sellerIn + 2.6) || (t > T.meet && t < T.meet + 1.3);
      const shaking = t > T.meet + 1.3;
      const shake = shaking ? Math.sin((t - T.meet) * 14) * 9 : 0;

      // Swap: cash arcs buyer → seller, contract arcs seller → buyer.
      const sw = ease(seg(t, T.swap, T.swap + 1.4));
      const swapping = sw > 0 && sw < 1;
      const swapped = sw >= 1;
      const holdArm = { a1: 40, a2: -50 };
      const shakeArm = { a1: -8, a2: 4 + shake * 0.5 };
      const bArm = shaking ? shakeArm : holdArm, sArm = shaking ? shakeArm : holdArm;
      const bHold = shaking || swapping ? '' : (swapped ? A.contract() : A.cashStack());
      const sHold = shaking || swapping ? '' : (swapped ? A.cashStack() : A.contract());

      let flying = '';
      if (swapping) {
        const fromB = { x: 560 + 70, y: G - 230 }, fromS = { x: 1360 - 70, y: G - 230 };
        const arc = k => -Math.sin(k * Math.PI) * 180;
        flying = `<g transform="translate(${lerp(fromB.x, fromS.x, sw)},${lerp(fromB.y, fromS.y, sw) + arc(sw)}) rotate(${sw * 360}) scale(1.3)">${A.cashStack()}</g>
          <g transform="translate(${lerp(fromS.x, fromB.x, sw)},${lerp(fromS.y, fromB.y, sw) + arc(sw) * 0.6}) rotate(${-sw * 20}) scale(1.3)">${A.contract()}</g>`;
      }

      const bubbleOp = (at, out) => clamp((t - at) / 0.4) * (1 - clamp((t - out) / 0.4));
      const bb = bubbleOp(T.buyerSay, T.price - 0.2), sb = bubbleOp(T.sellerSay, T.price - 0.2);
      const pr = pop(t, T.price, 0.8);
      const tagY = lerp(-120, 385, ease(seg(t, T.price, T.price + 0.7)));
      const tag = pr > 0 ? `<g transform="translate(960,${tagY}) rotate(${Math.sin(t * 2.2) * 3})">
          <path d="M-130,-60 L110,-60 L150,0 L110,60 L-130,60 Z" fill="${C.peachL}" stroke="${C.peach}" stroke-width="5"/>
          <circle cx="112" cy="0" r="10" fill="${C.cream}" stroke="${C.peach}" stroke-width="4"/>
          <text x="-10" y="-14" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="2">SAME PRICE</text>
          <text x="-10" y="34" font-size="46" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">$18,000</text>
        </g>` : '';

      return ground(G) + tag +
        A.person(t, { x: bx, y: G, scale: sc, look: A.LOOKS.buyer, walking: bWalk, frontArm: bArm, hold: bHold, seed: 3, talk: ctx.talking && t > T.buyerSay && t < T.buyerSay + 3 }) +
        A.person(t, { x: sx, y: G, scale: sc, look: A.LOOKS.seller, walking: sWalk, flip: true, frontArm: sArm, hold: sHold, seed: 5, talk: ctx.talking && t > T.sellerSay && t < T.sellerSay + 3 }) +
        flying +
        (bb > 0 ? A.bubble(600, 420, esc(s.buyerQuote), { op: bb, sc: 0.8 + 0.2 * bb, size: 30, italic: true, font: 'Playfair Display', tail: 'left' }) : '') +
        (sb > 0 ? A.bubble(1320, 420, esc(s.sellerQuote), { op: sb, sc: 0.8 + 0.2 * sb, size: 30, italic: true, font: 'Playfair Display', tail: 'right' }) : '') +
        (shaking ? A.sparkle(960, G - 250, T.meet + 1.3, t) : '');
    },

    crowd: (s, t) => {
      const G = 900, T = s.beats;
      const xs = [560, 760, 960, 1160, 1360];
      const looks = ['a', 'b', 'c', 'd', 'e'];
      const flipped = t >= T.flip;
      const traded = t >= T.trade;
      let out = ground(G);
      // Rolling tumbleweed while nobody trades.
      const tw = seg(t, T.agree + 0.8, T.flip - 0.2);
      if (tw > 0 && tw < 1) {
        const x = lerp(-120, 2040, tw), y = G - 46 - Math.abs(Math.sin(tw * 18)) * 40;
        out += `<g transform="translate(${x},${y}) rotate(${tw * 900})" opacity=".85">
          ${[0, 1, 2, 3].map(i => `<circle r="${42 - i * 8}" fill="none" stroke="#C9A27A" stroke-width="5" stroke-dasharray="${14 + i * 4} 10"/>`).join('')}</g>`;
      }
      xs.forEach((x, i) => {
        const p = pop(t, s.start + 0.3 + i * 0.18, 0.6);
        if (p <= 0) return;
        const isFlip = i === 3 && flipped;
        const happy = traded && (i === 2 || i === 3);
        out += `<g transform="translate(${x},${G}) scale(${p}) translate(${-x},${-G})">` +
          A.person(t, { x, y: G, scale: 1, look: A.LOOKS[looks[i]], seed: i + 1,
            frontArm: happy ? { a1: i === 2 ? -10 : -10, a2: -6 + Math.sin(t * 14) * 6 } : { a1: 100, a2: 95 },
            flip: i === 3 }) + '</g>';
        const bo = clamp((t - (T.agree + i * 0.12)) / 0.35);
        if (bo > 0) {
          const up = !isFlip;
          const flipP = i === 3 ? clamp((t - T.flip) / 0.35) : 1;
          out += A.bubble(x, G - 400, up ? '▲ Up!' : '▼ Down!', {
            op: bo, sc: i === 3 && flipped ? 0.7 + 0.3 * back(flipP) : 0.8 + 0.2 * bo, size: 28, weight: 700,
            color: up ? '#2F8A7F' : '#C2475F', fill: up ? '#E8F8F6' : C.pinkP, stroke: up ? C.tealL : C.pinkL, w: 150, tail: 'left' });
        }
      });
      // Trades counter.
      const n = traded ? 1 : 0, cp = traded ? back((t - T.trade) / 0.6) : 1;
      if (t > T.agree) {
        out += `<g transform="translate(1660,430)"><g transform="scale(${0.9 + 0.1 * cp})">
          <rect x="-120" y="-70" width="240" height="140" rx="28" fill="#fff" stroke="${traded ? C.teal : '#F1E7E1'}" stroke-width="4"/>
          <text x="0" y="-22" font-size="20" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">TRADES</text>
          <text x="0" y="46" font-size="72" font-weight="900" text-anchor="middle" fill="${traded ? '#2F8A7F' : C.dark}" font-family="Playfair Display">${n}</text></g></g>`;
      }
      if (traded) {
        out += `<path d="M960,${G - 300} Q1060,${G - 380} 1160,${G - 300}" fill="none" stroke="${C.peach}" stroke-width="6" stroke-dasharray="12 10" opacity="${clamp((t - T.trade) / 0.4)}"/>` +
          A.sparkle(1060, G - 340, T.trade, t) + A.sparkle(1660, 430, T.trade + 0.1, t, C.teal);
      }
      return out;
    },

    'chart-tug': (s, t) => {
      const data = s._data || (s._data = A.candleSeries(18, 11, i => Math.sin(i / 2.6) * 0.8));
      const x0 = 330, y0 = 470, w = 1260, h = 290;
      const per = (s.chartEnd - s.chartStart) / data.length;
      const k = Math.max(0, Math.min(data.length - 1, Math.floor((t - s.chartStart) / per)));
      // The knot leans toward whoever won the latest candles.
      let lean = 0;
      for (let i = Math.max(0, k - 2); i <= k; i++) lean += Math.sign(data[i].c - data[i].o);
      const target = t < s.chartStart ? 0 : lean / 3;
      const knot = 960 + target * 150 + Math.sin(t * 5) * 6;
      const panel = `<rect x="${x0 - 40}" y="${y0 - 40}" width="${w + 80}" height="${h + 80}" rx="36" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>`;
      const chart = `<g transform="translate(${x0},${y0})">${A.candleChart(t, { w, h, data, t0: s.chartStart, t1: s.chartEnd })}</g>`;
      const rope = `<g opacity="${clamp((t - s.chartStart) / 0.6)}">
        <path d="M420,905 Q${(420 + knot) / 2},${915 + Math.sin(t * 6) * 4} ${knot},905 Q${(knot + 1500) / 2},${915 - Math.sin(t * 6) * 4} 1500,905" fill="none" stroke="#C9A27A" stroke-width="10" stroke-linecap="round"/>
        <circle cx="${knot}" cy="905" r="16" fill="${C.peach}"/>
        <circle cx="380" cy="905" r="44" fill="${C.teal}"/><text x="380" y="917" font-size="34" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">B</text>
        <circle cx="1540" cy="905" r="44" fill="${C.pink}"/><text x="1540" y="917" font-size="34" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">S</text>
        <text x="380" y="985" font-size="24" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans" letter-spacing="2">BUYERS</text>
        <text x="1540" y="985" font-size="24" font-weight="700" text-anchor="middle" fill="#C2475F" font-family="DM Sans" letter-spacing="2">SELLERS</text></g>`;
      return panel + chart + rope;
    },

    'crystal-surf': (s, t) => {
      let out = '';
      // Crystal ball (fortune telling) gets stamped out, then fades away.
      const gone = ease(seg(t, s.surfAt - 0.6, s.surfAt + 0.2));
      if (gone < 1) {
        const cIn = pop(t, s.start + 0.6, 0.8);
        const swirl = [0, 1, 2].map(i => {
          const a = t * (0.9 + i * 0.4) + i * 2;
          return `<circle cx="${Math.cos(a) * 55}" cy="${Math.sin(a * 1.3) * 45}" r="${46 - i * 10}" fill="#fff" opacity="${0.35 - i * 0.07}"/>`;
        }).join('');
        const stamp = back((t - s.strikeAt) / 0.5);
        out += `<g transform="translate(960,700) scale(${cIn * (1 - gone * 0.4)})" opacity="${1 - gone}">
          <path d="M-120,150 L120,150 L90,105 L-90,105 Z" fill="${C.purple}"/>
          <rect x="-140" y="148" width="280" height="26" rx="13" fill="#5E56B8"/>
          <circle cx="0" cy="-20" r="150" fill="${C.purpleL}"/>
          <circle cx="0" cy="-20" r="150" fill="none" stroke="${C.purple}" stroke-width="6"/>
          <g transform="translate(0,-20)">${swirl}</g>
          <ellipse cx="-62" cy="-88" rx="28" ry="16" transform="rotate(-35 -62 -88)" fill="#fff" opacity=".7"/>
          <text x="0" y="12" font-size="110" font-weight="900" text-anchor="middle" fill="${C.purple}" opacity=".5" font-family="Playfair Display">?</text>
          ${stamp > 0 ? `<g transform="translate(0,-10) scale(${stamp}) rotate(-8)">
            <line x1="-130" y1="-130" x2="130" y2="130" stroke="${C.pink}" stroke-width="34" stroke-linecap="round"/>
            <line x1="130" y1="-130" x2="-130" y2="130" stroke="${C.pink}" stroke-width="34" stroke-linecap="round"/></g>` : ''}
        </g>`;
      }
      // Price wave with a surfer riding it.
      const w = ease(seg(t, s.surfAt - 0.1, s.surfAt + 1.6));
      if (w > 0) {
        const yAt = x => 820 - (x - 100) * 0.12 + Math.sin(x / 150 - t * 2.2) * 46;
        const pts = [];
        for (let x = 100; x <= 100 + 1720 * w; x += 12) pts.push(`${x.toFixed(0)},${yAt(x).toFixed(1)}`);
        const fill = `M100,1080 L${pts.join(' L')} L${(100 + 1720 * w).toFixed(0)},1080 Z`;
        out += `<path d="${fill}" fill="${C.tealL}" opacity=".35"/>
          <polyline points="${pts.join(' ')}" fill="none" stroke="${C.teal}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
        const sp = ease(seg(t, s.surfAt + 0.6, s.surfAt + 1.4));
        if (sp > 0) {
          const sx = 960 + Math.sin(t * 0.9) * 60, sy = yAt(sx);
          const slope = Math.atan2(yAt(sx + 8) - yAt(sx - 8), 16) * 180 / Math.PI;
          out += `<g transform="translate(${sx},${sy}) rotate(${slope}) translate(0,${(1 - sp) * -260})" opacity="${sp}">
            <ellipse cx="0" cy="-8" rx="92" ry="15" fill="${C.pink}"/><ellipse cx="0" cy="-12" rx="78" ry="6" fill="#fff" opacity=".5"/>
            ${A.person(t, { x: 0, y: -14, scale: 0.72, look: A.LOOKS.buyer, frontArm: { a1: -20, a2: -10 + Math.sin(t * 3) * 8 }, backArm: { a1: 200, a2: 190 }, seed: 4 })}
          </g>`;
        }
      }
      return out;
    },

    sides: (s, t) => {
      const G = 900;
      return [[s.long, 160, true, A.LOOKS.buyer, 3], [s.short, 1000, false, A.LOOKS.seller, 5]].map(([x, px, up, look, seed]) => {
        const p = pop(t, x.at, 0.7);
        if (p <= 0) return '';
        const col = up ? C.teal : C.pink, dark = up ? '#2F8A7F' : '#C2475F';
        const cx = px + 380;
        const draw = ease(seg(t, x.at + 0.5, x.at + 2.4));
        const won = t > x.at + 2.5;
        const pts = up
          ? [[0, 210], [60, 180], [110, 196], [170, 140], [230, 158], [290, 96], [350, 112], [420, 40]]
          : [[0, 40], [60, 70], [110, 56], [170, 114], [230, 98], [290, 160], [350, 146], [420, 214]];
        const cx0 = px + 300, cy0 = 380;
        const n = Math.max(1, Math.ceil(draw * (pts.length - 1)));
        const vis = pts.slice(0, n + 1).map(([a, b], i) => {
          if (i < n) return [a, b];
          const k = draw * (pts.length - 1) - (n - 1), [a0, b0] = pts[i - 1];
          return [lerp(a0, a, k), lerp(b0, b, k)];
        });
        const end = vis[vis.length - 1];
        const coins = won ? [0, 1, 2].map(i => {
          const k = ((t - x.at - 2.5) * 0.8 + i * 0.33) % 1;
          return `<g transform="translate(${px + 170 + (i - 1) * 46},${G - 330 - k * 140})" opacity="${Math.sin(k * Math.PI)}">
            <circle r="22" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/><text y="8" font-size="22" font-weight="700" text-anchor="middle" fill="#8A5A0A" font-family="DM Sans">$</text></g>`;
        }).join('') : '';
        const sign = `<g><line x1="0" y1="0" x2="0" y2="-96" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/>
          <rect x="-66" y="-150" width="132" height="62" rx="12" fill="#fff" stroke="${col}" stroke-width="5"/>
          <text x="0" y="-108" font-size="30" font-weight="900" text-anchor="middle" fill="${dark}" font-family="Playfair Display">${esc(x.label.toUpperCase())}</text></g>`;
        return `<g transform="translate(${cx},640) scale(${p}) translate(${-cx},-640)">
          <rect x="${px}" y="340" width="760" height="560" rx="40" fill="#fff" stroke="${won ? col : '#F1E7E1'}" stroke-width="${won ? 4 : 2}"/>
          <g transform="translate(${cx0},${cy0})">
            <line x1="0" x2="420" y1="250" y2="250" stroke="#EADFD8" stroke-width="3"/>
            <polyline points="${vis.map(v => v.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="${end[0]}" cy="${end[1]}" r="13" fill="${col}"/>
            <path d="M${up ? '380,40 L420,40 L420,80' : '380,214 L420,214 L420,174'}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="${draw >= 1 ? 1 : 0}"/>
          </g>
          <text x="${cx0 + 210}" y="${cy0 + 300}" font-size="30" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(x.desc)}</text>
          ${coins}
          ${A.person(t, { x: px + 170, y: G - 30, scale: 0.95, look, seed, mood: 'happy',
            frontArm: won ? { a1: -60, a2: -95 + Math.sin(t * 8) * 10 } : { a1: -40, a2: -80 },
            hold: sign, talk: false })}
        </g>`;
      }).join('');
    },

    'time-compare': (s, t) => {
      const out = [];
      // Investing: a tree grows while the calendar flips through the years.
      const L = s.left, R = s.right;
      const pl = pop(t, L.at, 0.7);
      if (pl > 0) {
        const g = ease(seg(t, L.at + 0.4, L.at + 4.5));
        const year = 2026 + Math.floor(g * 10);
        out.push(`<g transform="translate(540,640) scale(${pl}) translate(-540,-640)">
          <rect x="160" y="340" width="760" height="580" rx="40" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <text x="540" y="420" font-size="56" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${esc(L.label)}</text>
          <text x="540" y="466" font-size="30" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(L.desc)}</text>
          <rect x="250" y="820" width="580" height="16" rx="8" fill="#EADFD8"/>
          <rect x="${452 - 10}" y="${828 - 40 - g * 170}" width="22" height="${40 + g * 170}" rx="8" fill="#9B6A45"/>
          <g transform="translate(452,${790 - g * 170}) scale(${0.3 + g * 0.7})">
            <circle cx="-50" cy="10" r="62" fill="${C.teal}"/><circle cx="50" cy="10" r="62" fill="${C.teal}"/>
            <circle cx="0" cy="-40" r="74" fill="${C.tealD}" opacity=".9"/><circle cx="0" cy="30" r="56" fill="${C.teal}"/>
            ${g > 0.8 ? `<circle cx="-40" cy="-20" r="10" fill="${C.pink}"/><circle cx="34" cy="0" r="10" fill="${C.pink}"/><circle cx="6" cy="-66" r="10" fill="${C.pink}"/>` : ''}
          </g>
          <g transform="translate(700,640) rotate(4)">
            <rect x="-80" y="-80" width="160" height="160" rx="18" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
            <rect x="-80" y="-80" width="160" height="44" rx="18" fill="${C.purple}"/><rect x="-80" y="-56" width="160" height="20" fill="${C.purple}"/>
            <text x="0" y="-48" font-size="20" font-weight="700" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="2">YEAR</text>
            <text x="0" y="40" font-size="50" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${year}</text>
          </g></g>`);
      }
      // Trading: a stopwatch spins while candles print fast.
      const pr = pop(t, R.at, 0.7);
      if (pr > 0) {
        const data = s._d || (s._d = A.candleSeries(10, 3, i => (i < 5 ? 0.6 : -0.5)));
        out.push(`<g transform="translate(1380,640) scale(${pr}) translate(-1380,-640)">
          <rect x="1000" y="340" width="760" height="580" rx="40" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <text x="1380" y="420" font-size="56" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${esc(R.label)}</text>
          <text x="1380" y="466" font-size="30" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(R.desc)}</text>
          <g transform="translate(1180,680)">
            <rect x="-16" y="-128" width="32" height="26" rx="6" fill="${C.pink}"/>
            <circle r="104" fill="#fff" stroke="${C.pink}" stroke-width="10"/>
            ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-88" x2="0" y2="-74" stroke="${C.muted}" stroke-width="4" transform="rotate(${i * 30})"/>`).join('')}
            <line x1="0" y1="0" x2="0" y2="-72" stroke="${C.dark}" stroke-width="7" stroke-linecap="round" transform="rotate(${(t - R.at) * 300})"/>
            <circle r="10" fill="${C.pink}"/>
          </g>
          <g transform="translate(1330,560)">${A.candleChart(t, { w: 330, h: 230, data, t0: R.at + 0.6, t1: R.at + 3.2 })}</g>
        </g>`);
      }
      return out.join('');
    },

    checklist: (s, t) => {
      let out = '';
      // Drifting clouds of uncertainty.
      [[200, 520, 0.8, 0], [1650, 600, 1.1, 2], [380, 860, 0.7, 4], [1500, 900, 0.9, 1]].forEach(([x, y, sc, ph]) => {
        const dx = Math.sin(t * 0.35 + ph) * 60;
        out += `<g transform="translate(${x + dx},${y}) scale(${sc})" opacity=".8">
          <circle cx="-60" cy="10" r="50" fill="#EDE7F7"/><circle cx="0" cy="-20" r="66" fill="#EDE7F7"/><circle cx="64" cy="10" r="48" fill="#EDE7F7"/>
          <rect x="-110" y="10" width="220" height="50" rx="25" fill="#EDE7F7"/>
          <text x="0" y="28" font-size="60" font-weight="900" text-anchor="middle" fill="${C.purpleL}" font-family="Playfair Display">?</text></g>`;
      });
      const p = pop(t, s.boardAt, 0.8);
      if (p > 0) {
        out += `<g transform="translate(960,700) scale(${p}) rotate(${Math.sin(t * 1.2) * 1.2})">
          <rect x="-270" y="-260" width="540" height="560" rx="30" fill="#C99A6E"/>
          <rect x="-240" y="-228" width="480" height="500" rx="16" fill="#fff"/>
          <rect x="-80" y="-286" width="160" height="56" rx="16" fill="${C.muted}"/>
          ${s.items.map((it, i) => {
            const y = -150 + i * 110, k = back((t - it.at) / 0.5);
            return `<rect x="-200" y="${y - 34}" width="68" height="68" rx="16" fill="#fff" stroke="${k > 0 ? C.teal : '#EADFD8'}" stroke-width="5"/>
              ${k > 0 ? `<path d="M-186,${y} L-170,${y + 18} L-140,${y - 22}" fill="none" stroke="${C.tealD}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="translate(-166,${y}) scale(${k}) translate(166,${-y})"/>` : ''}
              <text x="-104" y="${y + 16}" font-size="48" font-weight="700" fill="${k > 0 ? C.dark : C.muted}" font-family="Playfair Display">${esc(it.label)}</text>`;
          }).join('')}
        </g>`;
      }
      return out;
    },

    'push-candle': (s, t) => {
      let out = '';
      const R = s.rewindAt;
      // The candle: shown first as if it "made" the move, then rewound and rebuilt by the push.
      const shrink = ease(seg(t, R, R + 0.6));
      const k = ease(seg(t, R + 0.9, R + 4.2));
      const h = t < R + 0.6 ? 1 - shrink : k;
      const ap = pop(t, s.start + 0.8, 0.8);
      const cx = 1480, bot = 940, top = bot - 286 * h;
      if (ap > 0) {
        out += `<g transform="translate(${cx},700) scale(${ap}) translate(${-cx},-700)">
          <line x1="${cx}" x2="${cx}" y1="${top - 40 * h}" y2="${bot + 30}" stroke="${C.teal}" stroke-width="10" stroke-linecap="round"/>
          <rect x="${cx - 70}" y="${top}" width="140" height="${Math.max(6, bot - top)}" rx="14" fill="${C.teal}"/>
          ${t < R ? `<text x="${cx + 120}" y="${560 + Math.sin(t * 3) * 8}" font-size="90" font-weight="900" fill="${C.purple}" opacity=".6" font-family="Playfair Display">?</text>` : ''}
        </g>`;
      }
      // Slope, ball and the buyer pushing it.
      const so = clamp((t - (R + 0.3)) / 0.5);
      if (so > 0) {
        const x0 = 220, y0 = 980, x1 = 1060, y1 = 700;
        const bx = lerp(x0 + 160, x1 - 40, k), by = lerp(y0, y1, (bx - x0) / (x1 - x0));
        out += `<g opacity="${so}">
          <path d="M${x0},${y0} L${x1},${y1} L${x1},1080 L${x0},1080 Z" fill="#F6EDE6"/>
          <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#EADFD8" stroke-width="6"/>
          <line x1="${bx}" x2="${cx - 80}" y1="${by - 46}" y2="${by - 46}" stroke="${C.teal}" stroke-width="3" stroke-dasharray="10 10" opacity="${k > 0 ? 0.8 : 0}"/>
          <g transform="translate(${bx},${by - 46}) rotate(${k * 540})">
            <circle r="46" fill="${C.peach}"/><circle r="46" fill="none" stroke="#E08E2E" stroke-width="4"/>
            <text y="14" font-size="40" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">$</text></g>
          ${A.person(t, { x: bx - 120, y: lerp(y0, y1, (bx - 120 - x0) / (x1 - x0)), scale: 0.9, look: A.LOOKS.buyer, walking: k > 0 && k < 1, frontArm: { a1: -5, a2: -10 }, backArm: { a1: 10, a2: 0 }, seed: 3 })}
        </g>`;
      }
      return out;
    },

    stairs: (s, t) => {
      const x0 = 340, W = 220, H = 56, base = 960, n = 5;
      let steps = `M${x0},1080 `;
      for (let i = 0; i < n; i++) steps += `L${x0 + i * W},${base - i * H} L${x0 + (i + 1) * W},${base - i * H} `;
      steps += `L${x0 + n * W},1080 Z`;
      let out = `<path d="${steps}" fill="#F6EDE6" stroke="#EADFD8" stroke-width="5" stroke-linejoin="round"/>`;
      for (let i = 0; i < n; i++) out += `<text x="${x0 + i * W + W / 2}" y="${base - i * H + 50}" font-size="24" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">$18,${String(i * 10).padStart(3, '0')}</text>`;
      const B = s.buyer, S = s.seller;
      const kb = ease(seg(t, B.at + 0.5, B.end)), ks = ease(seg(t, S.at + 0.4, S.end));
      const selling = t >= S.at;
      const f = selling ? (n - 1) * (1 - ks) : (n - 1) * kb;
      const fl = Math.floor(f + 1e-6), fr = f - fl;
      // Stay on the current step, then hop up (buying) or down (selling) near the edge.
      const level = fl + (selling ? clamp(fr / 0.45) : clamp((fr - 0.55) / 0.45));
      const px = x0 + W / 2 + f * W, py = base - level * H;
      const price = 18000 + Math.round(level) * 10;
      const moving = selling ? ks > 0 && ks < 1 : kb > 0 && kb < 1;
      const vis = selling ? clamp((t - S.at) / 0.4) : clamp((t - (B.at - 0.2)) / 0.4) * (1 - clamp((t - (S.at - 0.4)) / 0.3));
      const col = selling ? C.pink : C.teal, dark = selling ? '#C2475F' : '#2F8A7F';
      const sign = `<g><line x1="0" y1="0" x2="0" y2="-90" stroke="${C.muted}" stroke-width="7" stroke-linecap="round"/>
        <rect x="-90" y="-150" width="180" height="66" rx="14" fill="#fff" stroke="${col}" stroke-width="5"/>
        <text x="0" y="-105" font-size="32" font-weight="900" text-anchor="middle" fill="${dark}" font-family="Playfair Display">$${price.toLocaleString('en-US')}</text></g>`;
      if (vis > 0) {
        out += `<g opacity="${vis}">` + A.person(t, { x: px, y: py, scale: 0.8, look: selling ? A.LOOKS.seller : A.LOOKS.buyer, flip: selling, walking: moving,
          frontArm: { a1: -40, a2: -80 }, hold: sign, seed: selling ? 5 : 3 }) + '</g>';
        // Trail of arrows showing the push.
        for (let i = 0; i < 3; i++) {
          const p = ((t * 1.2) + i / 3) % 1;
          if (moving) out += `<text x="${px + (selling ? 90 : -90)}" y="${py - 100 - (selling ? -p * 60 : p * 60)}" font-size="40" font-weight="900" text-anchor="middle" fill="${col}" opacity="${Math.sin(p * Math.PI) * 0.8}" font-family="DM Sans">${selling ? '▼' : '▲'}</text>`;
        }
      }
      // Price ticker.
      if (t > B.at - 0.2) {
        const tc = selling ? '#C2475F' : (kb > 0 ? '#2F8A7F' : C.dark);
        out += `<g transform="translate(1680,560)">
          <rect x="-170" y="-80" width="340" height="160" rx="30" fill="#fff" stroke="${moving ? col : '#F1E7E1'}" stroke-width="4"/>
          <text x="0" y="-30" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">PRICE</text>
          <text x="0" y="40" font-size="62" font-weight="900" text-anchor="middle" fill="${tc}" font-family="Playfair Display">${price.toLocaleString('en-US')} ${selling ? '▼' : (kb > 0 ? '▲' : '')}</text></g>`;
      }
      return out;
    },

    pullback: (s, t) => {
      const closes = [100, 104, 103, 108, 112, 110, 115, 119, 115, 118, 122, 121, 126, 123, 119, 114, 108, 103];
      const T = s.beats;
      const at = closes.map((_, i) => i < 8 ? s.start + 0.6 + i * ((T.red - 0.5 - s.start - 0.6) / 8)
        : i === 8 ? T.red : i <= 12 ? T.resume + (i - 9) * 0.6 : T.brk + (i - 13) * 0.6);
      const x0 = 260, y0 = 380, w = 1400, h = 520;
      const mn = 96, mx = 130, Y = v => y0 + h - (v - mn) / (mx - mn) * h;
      const step = w / closes.length, cw = step * 0.56;
      const spot = t > T.red + 0.6 && t < T.resume;
      let out = `<rect x="${x0 - 40}" y="${y0 - 30}" width="${w + 80}" height="${h + 60}" rx="36" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>`;
      closes.forEach((c, i) => {
        const p = ease((t - at[i]) / 0.45);
        if (p <= 0) return;
        const o = i ? closes[i - 1] : 98, up = c >= o, col = up ? C.teal : C.pink;
        const cc = lerp(o, c, p), cx = x0 + step * i + step / 2;
        const tp = Y(Math.max(o, cc)), bt = Y(Math.min(o, cc));
        const dim = spot && i !== 8 ? 0.22 : 1;
        out += `<g opacity="${dim}"><line x1="${cx}" x2="${cx}" y1="${Y(Math.max(o, c) + 1.4 * p)}" y2="${Y(Math.min(o, c) - 1.4 * p)}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
          <rect x="${cx - cw / 2}" y="${tp}" width="${cw}" height="${Math.max(3, bt - tp)}" rx="4" fill="${col}"/></g>`;
      });
      const c8x = x0 + step * 8 + step / 2, c8y = Y(117);
      if (spot) {
        const r = 90 + Math.sin(t * 4) * 4;
        out += `<circle cx="${c8x}" cy="${c8y}" r="${r}" fill="none" stroke="${C.purple}" stroke-width="10"/>
          <line x1="${c8x + r * 0.7}" y1="${c8y + r * 0.7}" x2="${c8x + r * 0.7 + 80}" y2="${c8y + r * 0.7 + 80}" stroke="${C.purple}" stroke-width="18" stroke-linecap="round"/>`;
        if (t > T.ask) out += A.bubble(c8x - 60, c8y - 170, 'Sellers in control?', { op: clamp((t - T.ask) / 0.4), size: 32, weight: 700, color: '#C2475F', fill: C.pinkP, stroke: C.pinkL, tail: 'left' });
      }
      if (t > T.resume + 2.4) {
        const p = back((t - T.resume - 2.4) / 0.5);
        out += `<g transform="translate(${c8x},${Y(108.5)}) scale(${p})">
          <rect x="-150" y="-30" width="300" height="60" rx="30" fill="#E8F8F6" stroke="${C.tealL}" stroke-width="3"/>
          <text y="11" font-size="28" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">✓ Just a pullback</text></g>`;
      }
      const brk = at[15] + 0.4;
      if (t > brk) {
        const lp = ease((t - brk) / 0.6), ly = Y(115);
        out += `<line x1="${c8x - 40}" x2="${c8x - 40 + (x0 + w - c8x + 40) * lp}" y1="${ly}" y2="${ly}" stroke="${C.pink}" stroke-width="5" stroke-dasharray="14 10"/>`;
        const p = back((t - brk - 0.4) / 0.5);
        if (p > 0) out += `<g transform="translate(${x0 + step * 15.5},${Y(130) + 40}) scale(${p})">
          <rect x="-130" y="-30" width="260" height="60" rx="30" fill="${C.pinkP}" stroke="${C.pinkL}" stroke-width="3"/>
          <text y="11" font-size="28" font-weight="700" text-anchor="middle" fill="#C2475F" font-family="DM Sans">⚡ Real shift</text></g>` + A.sparkle(x0 + step * 15.5, Y(130) + 40, brk + 0.4, t, C.pink);
      }
      return out;
    },

    'host-mission': (s, t, ctx) =>
      host(t, { x: 110, y: 330, w: 540, pose: t < s.cta.at ? 'point' : 'cheer', talk: ctx.talking, enterAt: s.start + 0.1 }) +
      (t > s.cta.at ? A.sparkle(380, 400, s.cta.at, t) : ''),
  };

  window.ILLUS = { BUILD, LIVE };
})();
