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
      (s.nameTag ? nameTag(410, 1010, t, s.start + 1.6) : ''),

    'host-hook': (s, t, ctx) => {
      const pose = t < s.pointAt ? 'think' : 'point';
      const q = t < s.pointAt ? [0, 1, 2].map(i => {
        const p = ((t - s.start) * 0.7 + i * 0.33) % 1;
        return `<text x="${560 + i * 50}" y="${380 - p * 120}" font-size="${50 + i * 8}" font-weight="900" fill="${C.purple}" opacity="${Math.sin(p * Math.PI) * 0.8}" font-family="Playfair Display">?</text>`;
      }).join('') : '';
      return host(t, { x: 100, y: 330, w: 540, pose, talk: ctx.talking }) + q;
    },

    participants: (s, t) => s.items.map((it, i) => {
      const cx = 480 + i * 480, p = pop(t, it.at, 0.7);
      if (p <= 0) return '';
      const next = s.items[i + 1] ? s.items[i + 1].at : s.end - 0.6;
      const focus = t >= it.at && t < next ? ease((t - it.at) / 0.4) : 0;
      const col = C[it.color];
      const lines = it.desc.map((d, k) => `<text x="${cx}" y="${835 + k * 40}" font-size="31" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(d)}</text>`).join('');
      return `<g transform="translate(${cx},${650 - focus * 16}) scale(${p * (1 + focus * 0.04)}) translate(${-cx},-650)">
        <rect x="${cx - 200}" y="420" width="400" height="500" rx="40" fill="#fff" stroke="${focus > 0 ? col : '#F1E7E1'}" stroke-width="${focus > 0 ? 4 : 2}"/>
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

    'host-mission': (s, t, ctx) =>
      host(t, { x: 110, y: 330, w: 540, pose: t < s.cta.at ? 'point' : 'cheer', talk: ctx.talking, enterAt: s.start + 0.1 }) +
      (t > s.cta.at ? A.sparkle(380, 400, s.cta.at, t) : ''),
  };

  window.ILLUS = { BUILD, LIVE };
})();
