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


  // Shared chart panel for trade-plan scenes: frame, past candles, planned levels.
  function tradePanel(t, s, o) {
    const x0 = 260, x1 = 1660, y0 = 400, y1 = 960;
    const X = u => x0 + 30 + u * (x1 - x0 - 60), Y = v => y0 + 30 + v * (y1 - y0 - 60);
    const wp = pop(t, s.start + 0.3, 0.6);
    const frame = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2" opacity="${clamp(wp)}"/>`;
    const history = (upto, a, b) => {
      const n = 10, out = [];
      for (let i = 0; i < n; i++) {
        const p = ease((t - (a + (b - a) * i / n)) / 0.4);
        if (p <= 0) continue;
        const u = (i + 0.5) / n * upto, v0 = 0.62 - i * 0.012 + Math.sin(i * 1.7) * 0.05, v1 = v0 + (i % 3 === 1 ? 0.05 : -0.06);
        const up = v1 < v0, col = up ? C.teal : C.pink, w = (upto / n) * (x1 - x0) * 0.45;
        out.push(`<line x1="${X(u)}" x2="${X(u)}" y1="${Y(Math.min(v0, v1) - 0.035)}" y2="${Y(Math.max(v0, v1) + 0.035)}" stroke="${col}" stroke-width="3" opacity="${0.85 * p}"/>`);
        out.push(`<rect x="${X(u) - w / 2}" y="${Y(Math.min(v0, lerp(v0, v1, p)))}" width="${w}" height="${Math.max(3, Math.abs(Y(v1) - Y(v0)) * p)}" rx="3" fill="${col}" opacity=".85"/>`);
      }
      return out.join('');
    };
    const level = (at, v, col, label, icon, wave) => {
      const k = ease((t - at) / 0.8);
      if (k <= 0) return '';
      const y = Y(v), flap = Math.sin(t * (wave && t > wave ? 9 : 3)) * (wave && t > wave ? 10 : 4);
      const ic = icon === 'flag'
        ? `<g transform="translate(${x0 + 36},${y})"><line x1="0" y1="0" x2="0" y2="-64" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/><path d="M0,-64 Q${22 + flap},${-70 + flap * 0.4} 46,-58 L46,-34 Q${22 - flap},${-42 - flap * 0.4} 0,-36 Z" fill="${col}"/></g>`
        : `<g transform="translate(${x0 + 36},${y})"><path d="M0,-34 L28,-24 C28,0 16,16 0,26 C-16,16 -28,0 -28,-24 Z" fill="${col}" stroke="#fff" stroke-width="3"/></g>`;
      return `<g opacity="${k}"><line x1="${x0 + 80}" x2="${x0 + 80 + (x1 - x0 - 120) * k}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="6" stroke-dasharray="16 10"/>${ic}
        <text x="${x1 - 40}" y="${y - 14}" font-size="26" font-weight="900" text-anchor="end" fill="${col === C.pink ? '#C2475F' : '#2F8A7F'}" font-family="DM Sans">${label}</text></g>`;
    };
    return { frame, history, level, X, Y, x0, x1 };
  }


  // A candle that forms live from a price path. path(u) gives price for u in [0,1];
  // y(price) maps price to screen. Returns the SVG and the live OHLC.
  function formCandle(t, o) {
    const k = clamp((t - o.t0) / (o.t1 - o.t0));
    if (t < o.t0) return { svg: '', k: 0 };
    const steps = Math.max(1, Math.round(k * 120));
    let hi = -Infinity, lo = Infinity;
    for (let i = 0; i <= steps; i++) { const v = o.path(i / 120); hi = Math.max(hi, v); lo = Math.min(lo, v); }
    const op = o.path(0), cl = o.path(k), up = cl >= op;
    const col = up ? C.teal : C.pink, w = o.w || 120, x = o.x, Y = o.y;
    const top = Y(Math.max(op, cl)), bot = Y(Math.min(op, cl));
    let svg = `<line x1="${x}" x2="${x}" y1="${Y(hi)}" y2="${Y(lo)}" stroke="${col}" stroke-width="${o.wick || 8}" stroke-linecap="round"/>
      <rect x="${x - w / 2}" y="${top}" width="${w}" height="${Math.max(5, bot - top)}" rx="${w * 0.12}" fill="${col}"/>`;
    if (k < 1 && o.live !== false) svg += `<line x1="${x - w}" x2="${x + w}" y1="${Y(cl)}" y2="${Y(cl)}" stroke="${C.dark}" stroke-width="2" stroke-dasharray="6 6" opacity=".5"/>
      <circle cx="${x + w / 2 + 26}" cy="${Y(cl)}" r="12" fill="${C.dark}"/>`;
    return { svg, k, op, cl, hi, lo, up };
  }

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
        ${s.parts.map(p => `<div class="big" data-in="${p.at}" style="text-align:left;font-size:${s.size || 80}px">${p.html || esc(p.text)}</div>`).join('')}
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
    garage: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:58px">${h.html}</div></div>`).join('')}`,
    convoy: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:58px">${h.html}</div></div>`).join('')}`,
    'point-value': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    lift: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:58px">${h.html}</div></div>`).join('')}`,
    'lift-reveal': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'versus-rows': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div>
        <div class="h2" data-in="${s.start + 0.6}" style="font-size:60px">${esc(s.title)}</div></div>`,
    maya: s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'ruler-zoom': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'formula': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'mirror': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'declutter': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'timeframe-zoom': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'prop-path': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'order-demo': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'seesaw': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'exit-plan': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'fear-drag': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'tp-hit': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'backpacks': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'size-dial': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'same-size': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'sessions': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'crowd-rooms': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'clock24': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'candle-forms': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'two-stories': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'color-rule': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'anatomy': s => `
      <div class="top"><div class="kicker" data-in="${s.start + 0.3}">${esc(s.kicker)}</div></div>
      ${s.headlines.map(h => `<div class="top" style="top:250px"><div class="h2" data-in="${h.at}" ${h.out ? `data-out="${h.out}"` : ''} style="font-size:56px">${h.html}</div></div>`).join('')}`,
    'level-candles': s => `
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

    garage: (s, t) => {
      const RY = 780;
      let out = A.road(RY - 10, { h: 110 });
      s.items.forEach((it, i) => {
        const k = ease(seg(t, it.at, it.at + 1.6));
        if (k <= 0) return;
        const x = lerp(-300, it.x, k);
        out += A.vehicle(it.kind, { x, y: RY + 60, dist: x, plate: it.plate, t, moving: k < 1 });
        const lp = clamp((t - it.at - 1.2) / 0.5);
        out += `<g opacity="${lp}"><text x="${it.x}" y="${RY + 170}" font-size="40" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${esc(it.plate)}</text>
          <text x="${it.x}" y="${RY + 212}" font-size="26" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${esc(it.name)}</text></g>`;
      });
      return out;
    },

    convoy: (s, t) => {
      const RY = 760;
      let out = A.road(RY - 10, { h: 110 });
      const k1 = ease(seg(t, s.oneAt, s.oneAt + 1.6));
      const k3 = ease(seg(t, s.threeAt, s.threeAt + 1.8));
      const lead = lerp(lerp(-300, 960, k1), 1340, k3);
      out += A.vehicle('car', { x: lead, y: RY + 60, dist: lead, plate: 'MNQ', t, moving: (k1 > 0 && k1 < 1) || (k3 > 0 && k3 < 1) });
      if (k3 > 0) {
        [960, 580].forEach((tx, i) => {
          const kk = ease(seg(t, s.threeAt + i * 0.25, s.threeAt + 1.8 + i * 0.25));
          const x = lerp(-300 - i * 320, tx, kk);
          out += A.vehicle('car', { x, y: RY + 60, dist: x, plate: 'MNQ', t, moving: kk < 1 });
        });
      }
      const n = t >= s.threeAt + 1.2 ? 3 : 1;
      if (k1 > 0) {
        const cp = n === 3 ? back((t - s.threeAt - 1.2) / 0.6) : 1;
        out += `<g transform="translate(960,${RY + 220})">
          <rect x="-330" y="-46" width="300" height="92" rx="24" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>
          <text x="-180" y="-10" font-size="20" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">MARKET</text>
          <text x="-180" y="30" font-size="36" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">MNQ</text>
          <g transform="translate(180,0) scale(${0.85 + 0.15 * cp})">
            <rect x="-150" y="-46" width="300" height="92" rx="24" fill="#fff" stroke="${n === 3 ? C.teal : '#F1E7E1'}" stroke-width="3"/>
            <text y="-10" font-size="20" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">CONTRACTS</text>
            <text y="30" font-size="36" font-weight="900" text-anchor="middle" fill="${n === 3 ? '#2F8A7F' : C.dark}" font-family="Playfair Display">${n}</text></g></g>`;
        if (n === 3) out += A.sparkle(1140, RY + 220, s.threeAt + 1.2, t, C.teal);
      }
      return out;
    },

    'point-value': (s, t) => {
      const lanes = [{ y: 600, kind: 'car', plate: 'MNQ', at: s.mnqAt, usd: 20, bills: 1, col: C.teal },
                     { y: 870, kind: 'truck', plate: 'NQ', at: s.nqAt, usd: 200, bills: 10, col: C.purple }];
      const x0 = 260, x1 = 1180;
      const k = ease(seg(t, s.moveAt, s.moveAt + 2.4));
      let out = '';
      // Points ruler.
      const rp = clamp((t - s.start - 0.6) / 0.5);
      out += `<g opacity="${rp}"><line x1="${x0}" x2="${x1}" y1="420" y2="420" stroke="${C.muted}" stroke-width="4"/>
        ${Array.from({ length: 11 }, (_, i) => `<line x1="${x0 + i * (x1 - x0) / 10}" x2="${x0 + i * (x1 - x0) / 10}" y1="408" y2="432" stroke="${C.muted}" stroke-width="3"/>`).join('')}
        <text x="${x0}" y="398" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">0</text>
        <text x="${x1}" y="398" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">10 pts</text>
        <circle cx="${lerp(x0, x1, k)}" cy="420" r="13" fill="${C.peach}"/></g>`;
      lanes.forEach(L => {
        out += A.road(L.y - 70, { x0: 140, x1: 1300, h: 80, shift: k * 900 });
        const x = lerp(x0, x1, k);
        out += A.vehicle(L.kind, { x, y: L.y, dist: x, plate: L.plate, t, moving: k > 0 && k < 1, scale: L.kind === 'truck' ? 0.62 : 0.7 });
        // Cash stack next to the lane.
        const cp = clamp((t - L.at) / 1.2);
        if (cp > 0) {
          const shown = Math.max(1, Math.ceil(cp * L.bills));
          for (let b = 0; b < shown; b++) {
            out += `<g transform="translate(1440,${L.y - 18 - b * 16})"><rect x="-80" y="-14" width="160" height="30" rx="5" fill="${C.cash}" stroke="${C.cashD}" stroke-width="3"/>
              <circle r="9" fill="none" stroke="${C.cashD}" stroke-width="2.5"/></g>`;
          }
          const val = Math.round(cp * L.usd);
          out += `<text x="1640" y="${L.y - 30}" font-size="66" font-weight="900" fill="${L.kind === 'truck' ? C.purple : '#2F8A7F'}" font-family="Playfair Display">$${val}</text>
            <text x="1640" y="${L.y + 8}" font-size="24" fill="${C.muted}" font-family="DM Sans">1 ${L.plate} contract</text>`;
        }
      });
      if (t > s.timesAt) {
        const p = back((t - s.timesAt) / 0.6);
        out += `<g transform="translate(1720,698) scale(${p})"><circle r="56" fill="${C.pink}"/>
          <text y="16" font-size="44" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">×10</text></g>` + A.sparkle(1720, 698, s.timesAt, t);
      }
      return out;
    },

    lift: (s, t) => {
      const G = 940;
      let out = ground(G);
      // Heavy: struggling under a huge barbell.
      const hp = pop(t, s.heavyAt, 0.7);
      if (hp > 0) {
        const wob = Math.sin(t * 7) * 6;
        const bar = `<g transform="translate(-22,-96) rotate(${wob})">
          <rect x="-190" y="-8" width="380" height="16" rx="8" fill="#8C7A70"/>
          <rect x="-200" y="-62" width="44" height="124" rx="10" fill="${C.dark}"/><rect x="-250" y="-74" width="50" height="148" rx="10" fill="${C.dark}"/>
          <rect x="156" y="-62" width="44" height="124" rx="10" fill="${C.dark}"/><rect x="200" y="-74" width="50" height="148" rx="10" fill="${C.dark}"/>
          <rect x="-56" y="-26" width="112" height="52" rx="12" fill="#fff" stroke="${C.pink}" stroke-width="4"/>
          <text y="12" font-size="30" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="DM Sans">ES</text></g>`;
        const sweat = [0, 1].map(i => {
          const p = ((t * 0.9) + i * 0.5) % 1;
          return `<path d="M${1350 + 46 + i * 18},${G - 300 + p * 50} q6,10 0,16 q-6,-6 0,-16 Z" fill="#9FD8F0" opacity="${1 - p}"/>`;
        }).join('');
        out += `<g transform="translate(1350,${G}) scale(${hp}) translate(-1350,${-G})">` +
          A.person(t, { x: 1350, y: G + Math.abs(wob) * 0.6, scale: 1.1, look: A.LOOKS.d, mood: 'sad', frontArm: { a1: -80, a2: -92 }, backArm: { a1: -100, a2: -88 }, hold: bar, seed: 6 }) + sweat + '</g>';
      }
      // Light: easy curls with a small dumbbell.
      const lp = pop(t, s.lightAt, 0.7);
      if (lp > 0) {
        const curl = (Math.sin(t * 3.2) + 1) / 2;
        const db = `<g><rect x="-26" y="-6" width="52" height="12" rx="6" fill="#8C7A70"/>
          <rect x="-38" y="-20" width="16" height="40" rx="5" fill="${C.teal}"/><rect x="22" y="-20" width="16" height="40" rx="5" fill="${C.teal}"/>
          <text y="48" font-size="22" font-weight="900" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">MNQ</text></g>`;
        out += `<g transform="translate(560,${G}) scale(${lp}) translate(-560,${-G})">` +
          A.person(t, { x: 560, y: G, scale: 1.1, look: A.LOOKS.c, frontArm: { a1: 95, a2: lerp(50, -25, curl) }, hold: db, seed: 2 }) + '</g>' +
          (t > s.lightAt + 0.8 ? A.bubble(700, G - 420, 'I can learn here!', { op: clamp((t - s.lightAt - 0.8) / 0.4), size: 30, weight: 700, color: '#2F8A7F', fill: '#E8F8F6', stroke: C.tealL, tail: 'left' }) : '');
      }
      return out;
    },

    'lift-reveal': (s, t) => {
      const data = s._d || (s._d = A.candleSeries(12, 5, i => Math.sin(i / 2.4) * 0.7 + 0.2));
      return [[s.left, 540, 'stock'], [s.right, 1380, 'futures']].map(([side, cx, kind]) => {
        const p = pop(t, s.start + 0.5 + (kind === 'futures' ? 0.3 : 0), 0.7);
        if (p <= 0) return '';
        const lift = ease(seg(t, side.at, side.at + 0.9));
        let under = '';
        if (kind === 'stock') {
          // A little storefront you own a slice of.
          const sl = clamp((t - side.at - 0.6) / 0.6);
          under = `<g transform="translate(${cx},760)">
            <rect x="-150" y="-90" width="300" height="170" rx="10" fill="#fff" stroke="${C.purple}" stroke-width="5"/>
            <path d="M-170,-90 L170,-90 L150,-150 L-150,-150 Z" fill="${C.purple}"/>
            ${[-120, -60, 0, 60, 120].map((x, i) => `<path d="M${x - 30},-90 Q${x},-60 ${x + 30},-90" fill="${i % 2 ? '#fff' : C.purpleL}"/>`).join('')}
            <rect x="-40" y="0" width="80" height="80" rx="6" fill="${C.purpleL}"/>
            <rect x="-120" y="-40" width="60" height="50" rx="6" fill="#E8F8F6"/><rect x="60" y="-40" width="60" height="50" rx="6" fill="#E8F8F6"/>
            <g transform="translate(150,-160) scale(${back(sl)})">
              <circle r="46" fill="${C.purpleL}"/><path d="M0,0 L0,-46 A46,46 0 0,1 40,-23 Z" fill="${C.pink}" transform="translate(${6 * sl},${-6 * sl})"/>
            </g></g>
            <text x="${cx}" y="900" font-size="34" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display" opacity="${lift}">You own a slice</text>`;
        } else {
          under = `<g transform="translate(${cx},740) rotate(${Math.sin(t * 2) * 3})">
            <rect x="-110" y="-130" width="220" height="250" rx="14" fill="#fff" stroke="${C.pink}" stroke-width="5"/>
            <text y="-82" font-size="30" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="Playfair Display">CONTRACT</text>
            ${[-40, -10, 20].map(y => `<rect x="-76" y="${y}" width="${y === 20 ? 100 : 152}" height="10" rx="5" fill="${C.pinkL}"/>`).join('')}
            <path d="M-60,80 Q-30,60 0,82 T60,78" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/></g>
            <text x="${cx}" y="900" font-size="34" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="Playfair Display" opacity="${lift}">An agreement on price</text>`;
        }
        const col = kind === 'stock' ? C.purple : C.pink;
        return `<g transform="translate(${cx},640) scale(${p}) translate(${-cx},-640)">
          <rect x="${cx - 360}" y="380" width="720" height="560" rx="40" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <g opacity="${lift}">${under}</g>
          <g transform="translate(0,${-lift * 60})" opacity="${1 - lift}">
            <rect x="${cx - 330}" y="410" width="660" height="500" rx="30" fill="#fff" stroke="${col}" stroke-width="4"/>
            <rect x="${cx - 70}" y="${380 + 10}" width="140" height="44" rx="22" fill="${col}"/>
            <text x="${cx}" y="${380 + 41}" font-size="22" font-weight="700" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">${kind === 'stock' ? 'STOCK' : 'FUTURES'}</text>
            <g transform="translate(${cx - 270},500)">${A.candleChart(t, { w: 540, h: 340, data, t0: s.start + 0.8, t1: s.start + 3.2 })}</g>
          </g></g>`;
      }).join('');
    },

    'versus-rows': (s, t) => {
      const colX = [700, 1360], rowY = r => 545 + r * 165;
      let out = '';
      const hp = clamp((t - s.start - 0.8) / 0.5);
      out += `<g opacity="${hp}">
        <rect x="${colX[0] - 260}" y="378" width="520" height="70" rx="35" fill="${C.purpleP || '#EEEDFE'}"/>
        <text x="${colX[0]}" y="426" font-size="36" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">${esc((s.cols || ['Stocks'])[0])}</text>
        <rect x="${colX[1] - 260}" y="378" width="520" height="70" rx="35" fill="${C.pinkP}"/>
        <text x="${colX[1]}" y="426" font-size="36" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="Playfair Display">${esc((s.cols || [0, 'Futures'])[1])}</text></g>`;
      const icon = (kind, x, y) => {
        if (kind === 'pie') return `<g transform="translate(${x},${y})"><circle r="34" fill="${C.purpleL}"/><path d="M0,0 L0,-34 A34,34 0 0,1 30,-16 Z" fill="${C.purple}" transform="translate(4,-4)"/></g>`;
        if (kind === 'doc') return `<g transform="translate(${x},${y}) rotate(-6)"><rect x="-26" y="-34" width="52" height="68" rx="6" fill="#fff" stroke="${C.pink}" stroke-width="4"/><rect x="-14" y="-16" width="28" height="5" rx="2" fill="${C.pinkL}"/><rect x="-14" y="-4" width="28" height="5" rx="2" fill="${C.pinkL}"/><rect x="-14" y="8" width="20" height="5" rx="2" fill="${C.pinkL}"/></g>`;
        if (kind === 'inf') return `<g transform="translate(${x},${y})"><path d="M0,0 C-16,-24 -44,-24 -44,0 C-44,24 -16,24 0,0 C16,-24 44,-24 44,0 C44,24 16,24 0,0 Z" fill="none" stroke="${C.purple}" stroke-width="8" stroke-linecap="round"/></g>`;
        if (kind === 'cal') {
          const f = (t * 0.8) % 1;
          return `<g transform="translate(${x},${y})"><rect x="-34" y="-30" width="68" height="64" rx="8" fill="#fff" stroke="${C.pink}" stroke-width="4"/><rect x="-34" y="-30" width="68" height="18" rx="6" fill="${C.pink}"/>
            <text y="22" font-size="22" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">EXP</text>
            <g transform="translate(44,-28) rotate(${f * 360})"><path d="M-12,0 A12,12 0 1,1 0,12" fill="none" stroke="${C.tealD}" stroke-width="5" stroke-linecap="round"/><path d="M-4,8 L0,14 L6,10" fill="none" stroke="${C.tealD}" stroke-width="5" stroke-linecap="round"/></g></g>`;
        }
        if (kind === 'sun') return `<g transform="translate(${x},${y}) rotate(${t * 30})"><circle r="20" fill="${C.peach}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-3" y="-36" width="6" height="11" rx="3" fill="${C.peach}" transform="rotate(${i * 45})"/>`).join('')}</g>`;
        if (kind !== 'moon') return `<g transform="translate(${x},${y}) scale(${['coins', 'split', 'open', 'gate'].includes(kind) ? 0.9 : 0.42})">${A.badge(kind, t)}</g>`;
        // sun and moon orbiting: nearly all day
        const a = t * 1.4;
        return `<g transform="translate(${x},${y})"><circle r="34" fill="none" stroke="#EADFD8" stroke-width="4" stroke-dasharray="6 6"/>
          <circle cx="${Math.cos(a) * 34}" cy="${Math.sin(a) * 34}" r="13" fill="${C.peach}"/>
          <circle cx="${Math.cos(a + Math.PI) * 34}" cy="${Math.sin(a + Math.PI) * 34}" r="12" fill="${C.purple}"/>
          <circle cx="${Math.cos(a + Math.PI) * 34 + 5}" cy="${Math.sin(a + Math.PI) * 34 - 4}" r="9" fill="#fff"/></g>`;
      };
      s.rows.forEach((r, i) => {
        const p = pop(t, r.at, 0.6);
        if (p <= 0) return;
        const y = rowY(i), cx = 1030;
        out += `<g transform="translate(${cx},${y}) scale(${p}) translate(${-cx},${-y})">
          <rect x="${colX[0] - 300}" y="${y - 70}" width="1260" height="140" rx="30" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <text x="${colX[0] - 520}" y="${y + 12}" font-size="30" font-weight="700" fill="${C.muted}" font-family="DM Sans">${esc(r.label)}</text>
          ${icon(r.left.icon, colX[0] - 200, y)}<text x="${colX[0] - 140}" y="${y + 12}" font-size="32" fill="${C.dark}" font-family="DM Sans">${esc(r.left.text)}</text>
          ${icon(r.right.icon, colX[1] - 200, y)}<text x="${colX[1] - 140}" y="${y + 12}" font-size="32" fill="${C.dark}" font-family="DM Sans">${esc(r.right.text)}</text>
        </g>`;
      });
      return out;
    },

    maya: (s, t, ctx) => {
      const G = 940, T = s.beats;
      let out = ground(G);
      const mp = pop(t, s.start + 0.4, 0.7);
      if (mp > 0) out += `<g transform="translate(960,${G}) scale(${mp}) translate(-960,${-G})">` +
        A.person(t, { x: 960, y: G, scale: 1.15, look: A.LOOKS.e, seed: 7, talk: t > T.say && t < T.say + 3,
          frontArm: t > T.say ? { a1: -30, a2: -70 } : { a1: 100, a2: 95 } }) + '</g>';
      if (t > T.say) out += A.bubble(1160, 470, '“10 is my normal size!”', { op: clamp((t - T.say) / 0.4) * (1 - clamp((t - T.neq + 0.3) / 0.4)), size: 32, italic: true, font: 'Playfair Display', tail: 'left' });
      if (t > T.neq) {
        const p = back((t - T.neq) / 0.6);
        out += `<g transform="translate(960,430) scale(${p})"><rect x="-170" y="-62" width="340" height="124" rx="30" fill="${C.pink}"/>
          <text y="28" font-size="80" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">10 ≠ 10</text></g>`;
      }
      // Two very different "10s".
      [[T.shares, 410, 'purple'], [T.mnq, 1510, 'teal']].forEach(([at, x, col], i) => {
        const p = pop(t, at, 0.7);
        if (p <= 0) return;
        const shares = i === 0;
        let stack = '';
        if (shares) {
          for (let k = 0; k < 10; k++) stack += `<rect x="${x - 110 + (k % 5) * 46}" y="${700 - Math.floor(k / 5) * 46}" width="38" height="38" rx="8" fill="${C.purpleL}" stroke="${C.purple}" stroke-width="3"/>`;
        } else {
          const n = Math.max(1, Math.ceil(clamp((t - at - 0.3) / 1.2) * 10));
          for (let k = 0; k < n; k++) stack += `<g transform="translate(${x},${740 - k * 16})"><rect x="-90" y="-14" width="180" height="30" rx="5" fill="${C.cash}" stroke="${C.cashD}" stroke-width="3"/><circle r="9" fill="none" stroke="${C.cashD}" stroke-width="2.5"/></g>`;
        }
        out += `<g transform="translate(${x},700) scale(${p}) translate(${-x},-700)">
          <rect x="${x - 220}" y="420" width="440" height="460" rx="36" fill="#fff" stroke="${shares ? C.purpleL : C.tealL}" stroke-width="3"/>
          <text x="${x}" y="490" font-size="44" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${shares ? '10 shares' : '10 MNQ'}</text>
          <text x="${x}" y="530" font-size="24" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${shares ? 'stock moves $1' : 'price moves 10 points'}</text>
          ${stack}
          <text x="${x}" y="840" font-size="62" font-weight="900" text-anchor="middle" fill="${shares ? C.purple : '#2F8A7F'}" font-family="Playfair Display">${shares ? '$10' : '$200'}</text></g>`;
      });
      return out;
    },

    'ruler-zoom': (s, t) => {
      const x0 = 380, x1 = 1540, y = 640;
      const rp = clamp((t - s.start - 0.6) / 0.6);
      let out = `<g opacity="${rp}">
        <rect x="${x0 - 60}" y="${y - 150}" width="${x1 - x0 + 120}" height="360" rx="40" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
        <line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/>
        <line x1="${x0}" x2="${x0}" y1="${y - 40}" y2="${y + 40}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/>
        <line x1="${x1}" x2="${x1}" y1="${y - 40}" y2="${y + 40}" stroke="${C.dark}" stroke-width="6" stroke-linecap="round"/>
        <text x="${x0}" y="${y + 90}" font-size="34" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">20,000</text>
        <text x="${x1}" y="${y + 90}" font-size="34" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">20,001</text></g>`;
      // A one-point move.
      const mv = ease(seg(t, s.pointAt, s.pointAt + 1.6));
      if (t > s.pointAt - 0.4) {
        const mx = lerp(x0, x1, mv);
        out += `<path d="M${x0},${y - 70} Q${(x0 + mx) / 2},${y - 130} ${mx},${y - 70}" fill="none" stroke="${C.peach}" stroke-width="6" stroke-dasharray="12 10" opacity="${mv}"/>
          <g transform="translate(${mx},${y - 20})"><path d="M0,0 L-18,-30 L18,-30 Z" fill="${C.peach}"/><circle cy="-44" r="22" fill="${C.peach}"/></g>`;
        if (mv >= 1) {
          const p = back((t - s.pointAt - 1.6) / 0.5);
          out += `<g transform="translate(${(x0 + x1) / 2},${y - 150}) scale(${p})"><rect x="-110" y="-34" width="220" height="68" rx="34" fill="${C.peachL}"/>
            <text y="12" font-size="34" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">1 point</text></g>`;
        }
      }
      // Split into four ticks.
      if (t > s.tickAt) {
        [0.25, 0.5, 0.75].forEach((f, i) => {
          const p = clamp((t - s.tickAt - i * 0.25) / 0.4);
          const x = lerp(x0, x1, f);
          out += `<g opacity="${p}"><line x1="${x}" x2="${x}" y1="${y - 28 * p}" y2="${y + 28 * p}" stroke="${C.pink}" stroke-width="5" stroke-linecap="round"/>
            <text x="${x}" y="${y + 70}" font-size="24" font-weight="700" text-anchor="middle" fill="#C2475F" font-family="DM Sans">.${String(f * 100)}</text></g>`;
        });
        for (let i = 0; i < 4; i++) {
          const p = back((t - s.tickAt - 1.2 - i * 0.35) / 0.5);
          if (p <= 0) continue;
          const cx = lerp(x0, x1, i / 4 + 0.125);
          out += `<g transform="translate(${cx},${y - 60}) scale(${p})"><circle r="30" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/>
            <text y="8" font-size="20" font-weight="900" text-anchor="middle" fill="#7A4E08" font-family="DM Sans">$.50</text></g>`;
        }
      }
      if (t > s.sumAt) {
        const p = back((t - s.sumAt) / 0.6);
        out += `<g transform="translate(960,${y + 190}) scale(${p})"><rect x="-330" y="-40" width="660" height="80" rx="40" fill="${C.teal}"/>
          <text y="14" font-size="36" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">4 ticks = 1 point = $2.00 (1 MNQ)</text></g>` + A.sparkle(960, y + 190, s.sumAt, t, C.teal);
      }
      return out;
    },

    formula: (s, t) => {
      const T = s.beats, y = 520;
      const three = t >= T.three;
      const tiles = [
        { at: T.parts, x: 330, top: 'POINTS', val: '30', col: C.peach },
        { at: T.parts + 0.6, x: 750, top: 'POINT VALUE', val: '$2', col: C.purple },
        { at: T.parts + 1.2, x: 1170, top: 'CONTRACTS', val: three ? '3' : '1', col: C.teal, pulse: three ? T.three : null },
      ];
      let out = '';
      tiles.forEach((tl, i) => {
        const p = pop(t, tl.at, 0.6);
        if (p <= 0) return;
        const pulse = tl.pulse ? 1 + 0.15 * Math.max(0, 1 - (t - tl.pulse) / 0.6) : 1;
        out += `<g transform="translate(${tl.x},${y}) scale(${p * pulse})">
          <rect x="-150" y="-90" width="300" height="180" rx="30" fill="#fff" stroke="${tl.col}" stroke-width="5"/>
          <text y="-40" font-size="20" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">${tl.top}</text>
          <text y="46" font-size="84" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${tl.val}</text></g>`;
        if (i < 2) out += `<text x="${tl.x + 210}" y="${y + 24}" font-size="70" font-weight="900" text-anchor="middle" fill="${C.muted}" opacity="${p}" font-family="Playfair Display">×</text>`;
      });
      // Gears turning while it calculates.
      const gp = clamp((t - T.parts - 1.6) / 0.5);
      const gear = (cx, cy, r, dir, col) => `<g transform="translate(${cx},${cy}) rotate(${t * 60 * dir})">${Array.from({ length: 8 }, (_, i) => `<rect x="-9" y="${-r - 14}" width="18" height="24" rx="4" fill="${col}" transform="rotate(${i * 45})"/>`).join('')}<circle r="${r}" fill="${col}"/><circle r="${r * 0.35}" fill="#fff"/></g>`;
      out += `<g opacity="${gp}">${gear(860, 820, 50, 1, C.purpleL)}${gear(958, 790, 34, -1.5, C.pinkL)}${gear(1040, 846, 40, 1.2, C.tealL)}</g>`;
      // Result jar.
      if (t > T.result) {
        const val = three ? Math.round(lerp(60, 180, ease((t - T.three) / 1.2))) : Math.round(60 * ease((t - T.result) / 1));
        const p = pop(t, T.result, 0.6);
        out += `<text x="1395" y="${y + 24}" font-size="70" font-weight="900" text-anchor="middle" fill="${C.muted}" opacity="${p}" font-family="Playfair Display">=</text>
          <g transform="translate(1640,${y}) scale(${p})">
            <rect x="-160" y="-90" width="320" height="180" rx="30" fill="${C.teal}"/>
            <text y="-40" font-size="20" font-weight="700" text-anchor="middle" fill="#fff" font-family="DM Sans" letter-spacing="3">P&amp;L</text>
            <text y="46" font-size="84" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">$${val}</text></g>`;
        const fill = val / 200;
        out += `<g transform="translate(1640,860)" opacity="${p}">
          <path d="M-90,-120 L90,-120 L80,60 Q78,80 58,80 L-58,80 Q-78,80 -80,60 Z" fill="#fff" stroke="${C.tealL}" stroke-width="5"/>
          <clipPath id="jarclip"><path d="M-86,-116 L86,-116 L76,58 Q74,76 56,76 L-56,76 Q-74,76 -76,58 Z"/></clipPath>
          <rect x="-90" y="${76 - 196 * fill}" width="180" height="${196 * fill}" fill="${C.gold}" clip-path="url(#jarclip)"/>
          ${Array.from({ length: Math.round(fill * 9) }, (_, i) => `<ellipse cx="${-50 + (i % 3) * 50}" cy="${66 - Math.floor(i / 3) * 22}" rx="22" ry="8" fill="#F3C25C" stroke="#C98A1F" stroke-width="2"/>`).join('')}
        </g>`;
        if (three) out += A.sparkle(1640, y, T.three + 0.6, t, C.teal);
      }
      return out;
    },

    mirror: (s, t) => {
      const T = s.beats, cy = 690, x = 960;
      let out = `<line x1="420" x2="1500" y1="${cy}" y2="${cy}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="14 10" opacity="${clamp((t - s.start - 0.4) / 0.5)}"/>
        <text x="400" y="${cy + 10}" font-size="26" font-weight="700" text-anchor="end" fill="${C.muted}" font-family="DM Sans" opacity="${clamp((t - s.start - 0.4) / 0.5)}">ENTRY</text>`;
      const side = (at, up) => {
        const k = ease(seg(t, at, at + 1.2));
        if (k <= 0) return '';
        const len = 200 * k, col = up ? C.teal : C.pink, dark = up ? '#2F8A7F' : '#C2475F';
        const y2 = up ? cy - len : cy + len;
        const head = up ? `M${x - 34},${y2 + 10} L${x},${y2 - 30} L${x + 34},${y2 + 10} Z` : `M${x - 34},${y2 - 10} L${x},${y2 + 30} L${x + 34},${y2 - 10} Z`;
        const p = back((t - at - 0.8) / 0.5);
        return `<line x1="${x}" x2="${x}" y1="${cy}" y2="${y2}" stroke="${col}" stroke-width="22" stroke-linecap="round"/><path d="${head}" fill="${col}"/>
          <g transform="translate(${x + 380},${up ? cy - 130 : cy + 130}) scale(${Math.max(0, p)})">
            <rect x="-290" y="-50" width="580" height="100" rx="50" fill="#fff" stroke="${col}" stroke-width="4"/>
            <text y="14" font-size="36" font-weight="900" text-anchor="middle" fill="${dark}" font-family="Playfair Display">${up ? '+30' : '−30'} pts × $2 × 3 = ${up ? '+$180' : '−$180'}</text></g>
          <text x="${x - 90}" y="${up ? cy - 110 : cy + 130}" font-size="30" font-weight="700" text-anchor="end" fill="${dark}" font-family="DM Sans" opacity="${k}">${up ? 'In your favor' : 'Against you'}</text>`;
      };
      out += side(T.win, true) + side(T.loss, false);
      if (t > T.short) {
        const p = back((t - T.short) / 0.5);
        out += `<g transform="translate(1660,420) scale(${p}) rotate(-6)"><rect x="-150" y="-36" width="300" height="72" rx="36" fill="${C.purpleL}"/>
          <text y="12" font-size="30" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">Short? Same math.</text></g>`;
      }
      return out;
    },

    declutter: (s, t) => {
      const wx = 300, wy = 370, ww = 1320, wh = 620;
      const cx0 = wx + 60, cy0 = wy + 90, cw = ww - 120, ch = wh - 140;
      const closes = [100, 103, 101, 106, 109, 104, 101, 104, 108, 112, 110, 106, 104, 107, 111, 115, 113, 110, 113, 117];
      const mn = 94, mx = 122, Y = v => cy0 + ch - (v - mn) / (mx - mn) * ch, step = cw / closes.length;
      const wp = pop(t, s.start + 0.4, 0.7);
      if (wp <= 0) return '';
      let out = `<g transform="translate(960,680) scale(${wp}) translate(-960,-680)">
        <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="28" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <rect x="${wx}" y="${wy}" width="${ww}" height="56" rx="28" fill="#F6EDE6"/><rect x="${wx}" y="${wy + 30}" width="${ww}" height="26" fill="#F6EDE6"/>
        ${[0, 1, 2].map(i => `<circle cx="${wx + 36 + i * 30}" cy="${wy + 28}" r="9" fill="${[C.pink, C.peach, C.teal][i]}"/>`).join('')}
        <text x="${wx + 140}" y="${wy + 37}" font-size="24" font-weight="700" fill="${C.muted}" font-family="DM Sans">MNQ · 5m</text>`;
      closes.forEach((c, i) => {
        const o = i ? closes[i - 1] : 99, up = c >= o, col = up ? C.teal : C.pink, x = cx0 + step * i + step / 2;
        out += `<line x1="${x}" x2="${x}" y1="${Y(Math.max(o, c) + 1.2)}" y2="${Y(Math.min(o, c) - 1.2)}" stroke="${col}" stroke-width="3"/>
          <rect x="${x - step * 0.28}" y="${Y(Math.max(o, c))}" width="${step * 0.56}" height="${Math.max(3, Math.abs(Y(o) - Y(c)))}" rx="3" fill="${col}"/>`;
      });
      // Clutter piles up, then the broom sweeps it away.
      const bx = lerp(wx - 120, wx + ww + 140, ease(seg(t, s.sweepAt, s.sweepAt + 1.8)));
      const swept = t >= s.sweepAt ? bx : wx - 200;
      const junk = [];
      const add = (at, svg) => { if (t > at) junk.push(`<g opacity="${clamp((t - at) / 0.3)}">${svg}</g>`); };
      const wav = (amp, ph, col, w) => { let d = ''; for (let x = cx0; x <= cx0 + cw; x += 20) d += `${d ? 'L' : 'M'}${x},${Y(108 + Math.sin(x / 90 + ph) * amp)}`; return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}"/>`; };
      const m = s.messAt;
      add(m, wav(5, 0, '#E9A93B', 4)); add(m + 0.4, wav(7, 2, '#7F77DD', 4)); add(m + 0.8, wav(4, 4, '#4FA99E', 4));
      add(m + 1.1, `<line x1="${cx0}" y1="${Y(98)}" x2="${cx0 + cw}" y2="${Y(121)}" stroke="#C2475F" stroke-width="3"/><line x1="${cx0}" y1="${Y(104)}" x2="${cx0 + cw}" y2="${Y(96)}" stroke="#5E56B8" stroke-width="3"/>`);
      add(m + 1.5, [0.236, 0.382, 0.5, 0.618, 0.786].map((f, i) => `<line x1="${cx0}" x2="${cx0 + cw}" y1="${cy0 + ch * f}" y2="${cy0 + ch * f}" stroke="${['#F4829A', '#F5A857', '#7ECEC4', '#7F77DD', '#E9A93B'][i]}" stroke-width="2"/><text x="${cx0 + 6}" y="${cy0 + ch * f - 6}" font-size="16" fill="${C.muted}" font-family="DM Sans">${f}</text>`).join(''));
      add(m + 2.0, [[0.2, 0.3, '▲'], [0.45, 0.7, '▼'], [0.7, 0.25, '▲'], [0.85, 0.6, '★'], [0.33, 0.55, '◆']].map(([fx, fy, g]) => `<text x="${cx0 + cw * fx}" y="${cy0 + ch * fy}" font-size="34" fill="${['#C2475F', '#7F77DD', '#E9A93B'][Math.floor(fx * 10) % 3]}" font-family="DM Sans">${g}</text>`).join(''));
      add(m + 2.4, `<rect x="${cx0}" y="${cy0 + ch - 90}" width="${cw}" height="90" fill="#F3EEF9" opacity=".9"/>${wav(0, 0, 'none', 0)}<text x="${cx0 + 10}" y="${cy0 + ch - 60}" font-size="18" font-weight="700" fill="#7F77DD" font-family="DM Sans">RSI · MACD · STOCH · VOL</text>
        <path d="M${cx0},${cy0 + ch - 30} ${Array.from({ length: 40 }, (_, i) => `L${cx0 + i * cw / 39},${cy0 + ch - 45 + Math.sin(i * 0.9) * 22}`).join(' ')}" fill="none" stroke="#7F77DD" stroke-width="3"/>`);
      add(m + 2.8, `<rect x="${cx0 + cw * 0.55}" y="${cy0 + 20}" width="260" height="90" rx="10" fill="#FFF3C4" stroke="#E9A93B" stroke-width="2"/><text x="${cx0 + cw * 0.55 + 16}" y="${cy0 + 60}" font-size="20" fill="${C.dark}" font-family="DM Sans">BUY SIGNAL??</text><text x="${cx0 + cw * 0.55 + 16}" y="${cy0 + 90}" font-size="20" fill="${C.dark}" font-family="DM Sans">or SELL??</text>`);
      out += `<clipPath id="sweepclip"><rect x="${swept}" y="${wy}" width="${ww + 400}" height="${wh}"/></clipPath><g clip-path="url(#sweepclip)">${junk.join('')}</g>`;
      // Clean levels.
      if (t > s.levelsAt) {
        [[104, 0], [110, 0.5]].forEach(([lv, d]) => {
          const k = ease((t - s.levelsAt - d) / 0.9);
          out += `<line x1="${cx0}" x2="${cx0 + cw * k}" y1="${Y(lv)}" y2="${Y(lv)}" stroke="${C.peach}" stroke-width="6" stroke-dasharray="16 10"/>`;
          if (k >= 1) out += `<rect x="${cx0 - 30}" y="${Y(lv) - 18}" width="210" height="36" rx="18" fill="${C.peachL}"/><text x="${cx0 + 75}" y="${Y(lv) + 7}" font-size="20" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">reaction area</text>`;
        });
      }
      out += '</g>';
      if (t > s.sweepAt && t < s.sweepAt + 2) {
        out += `<g transform="translate(${bx},${wy + wh / 2}) rotate(${-12 + Math.sin(t * 14) * 8})">
          <rect x="-9" y="-330" width="18" height="300" rx="9" fill="#9B6A45"/>
          <path d="M-70,-40 L70,-40 L100,90 L-100,90 Z" fill="${C.peach}"/>
          ${[-60, -30, 0, 30, 60].map(x => `<line x1="${x}" y1="-20" x2="${x * 1.4}" y2="88" stroke="#E08E2E" stroke-width="5"/>`).join('')}
          <rect x="-76" y="-54" width="152" height="26" rx="8" fill="${C.pink}"/></g>`;
      }
      return out;
    },

    'timeframe-zoom': (s, t) => {
      const wx = 300, wy = 370, ww = 1320, wh = 620;
      const cx0 = wx + 60, cy0 = wy + 100, cw = ww - 120, ch = wh - 160;
      const small = s._sm || (s._sm = A.candleSeries(48, 13, i => Math.sin(i / 7) * 0.5 + 0.15));
      const big = s._bg || (s._bg = Array.from({ length: 8 }, (_, g) => {
        const grp = small.slice(g * 6, g * 6 + 6);
        return { o: grp[0].o, c: grp[5].c, hi: Math.max(...grp.map(d => d.hi)), lo: Math.min(...grp.map(d => d.lo)) };
      }));
      const all = small.flatMap(d => [d.hi, d.lo]), mn = Math.min(...all) - 2, mx = Math.max(...all) + 2;
      const Y = v => cy0 + ch - (v - mn) / (mx - mn) * ch;
      const wp = pop(t, s.start + 0.4, 0.7);
      if (wp <= 0) return '';
      const toSmall = ease(seg(t, s.switchAt, s.switchAt + 0.8));
      const active = toSmall > 0.5 ? '5m' : '1H';
      const draw = (data, op) => {
        const step = cw / data.length;
        return `<g opacity="${op}">${data.map((d, i) => {
          const up = d.c >= d.o, col = up ? C.teal : C.pink, x = cx0 + step * i + step / 2;
          return `<line x1="${x}" x2="${x}" y1="${Y(d.hi)}" y2="${Y(d.lo)}" stroke="${col}" stroke-width="${step > 60 ? 5 : 3}"/>
            <rect x="${x - step * 0.3}" y="${Y(Math.max(d.o, d.c))}" width="${step * 0.6}" height="${Math.max(3, Math.abs(Y(d.o) - Y(d.c)))}" rx="${step > 60 ? 8 : 3}" fill="${col}"/>`;
        }).join('')}</g>`;
      };
      let out = `<g transform="translate(960,680) scale(${wp}) translate(-960,-680)">
        <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="28" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <rect x="${wx}" y="${wy}" width="${ww}" height="64" rx="28" fill="#F6EDE6"/><rect x="${wx}" y="${wy + 34}" width="${ww}" height="30" fill="#F6EDE6"/>
        <text x="${wx + 40}" y="${wy + 42}" font-size="24" font-weight="700" fill="${C.muted}" font-family="DM Sans">MNQ</text>
        ${['5m', '15m', '1H'].map((l, i) => `<g transform="translate(${wx + 200 + i * 90},${wy + 32})"><rect x="-38" y="-20" width="76" height="40" rx="10" fill="${l === active ? C.purple : '#fff'}" stroke="${C.purple}" stroke-width="2"/>
          <text y="8" font-size="20" font-weight="700" text-anchor="middle" fill="${l === active ? '#fff' : C.purple}" font-family="DM Sans">${l}</text></g>`).join('')}
        <g transform="translate(${wx + ww - 200},${wy + 32})"><rect x="-150" y="-20" width="300" height="40" rx="20" fill="${C.tealL}"/>
          <text y="8" font-size="20" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">Same market underneath</text></g>
        ${draw(big, 1 - toSmall)}${draw(small, toSmall)}`;
      if (t > s.boxAt) {
        const k = back((t - s.boxAt) / 0.6), step = cw / 48, g = 3;
        const grp = small.slice(g * 6, g * 6 + 6), hi = Math.max(...grp.map(d => d.hi)), lo = Math.min(...grp.map(d => d.lo));
        const bx0 = cx0 + step * g * 6, bx1 = bx0 + step * 6;
        out += `<g opacity="${clamp(k)}"><rect x="${bx0 - 6}" y="${Y(hi) - 16}" width="${bx1 - bx0 + 12}" height="${Y(lo) - Y(hi) + 32}" rx="14" fill="none" stroke="${C.peach}" stroke-width="5" stroke-dasharray="12 8"/>
          <rect x="${(bx0 + bx1) / 2 - 130}" y="${Y(hi) - 70}" width="260" height="44" rx="22" fill="${C.peachL}"/>
          <text x="${(bx0 + bx1) / 2}" y="${Y(hi) - 40}" font-size="22" font-weight="700" text-anchor="middle" fill="${C.dark}" font-family="DM Sans">6 × 5m = 1 hour candle</text></g>`;
      }
      return out + '</g>';
    },

    'prop-path': (s, t) => {
      const G = 900, T = s.beats;
      const st = [{ x: 480, at: T.eval, label: 'Evaluation' }, { x: 960, at: T.funded, label: 'Funded' }, { x: 1440, at: T.split, label: 'Profit split' }];
      let out = ground(G);
      // Dotted path between stations.
      out += `<path d="M160,${G + 40} L1760,${G + 40}" stroke="#DCCFC6" stroke-width="8" stroke-dasharray="4 18" stroke-linecap="round"/>`;
      st.forEach((p, i) => {
        const k = pop(t, p.at - 0.4, 0.6);
        if (k <= 0) return;
        let art = '';
        if (i === 0) {
          const ticks = Math.floor(clamp((t - p.at - 0.6) / 2.4) * 3.999);
          art = `<rect x="-120" y="-200" width="240" height="250" rx="20" fill="#fff" stroke="${C.pink}" stroke-width="5"/><rect x="-46" y="-220" width="92" height="36" rx="10" fill="${C.muted}"/>
            ${['Daily loss limit', 'Max drawdown', 'Follow the rules'].map((r, j) => `<rect x="-96" y="${-160 + j * 64}" width="34" height="34" rx="8" fill="#fff" stroke="${j < ticks ? C.teal : '#EADFD8'}" stroke-width="4"/>
              ${j < ticks ? `<path d="M-88,${-143 + j * 64} L-80,${-134 + j * 64} L-66,${-152 + j * 64}" fill="none" stroke="${C.tealD}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
              <text x="-50" y="${-136 + j * 64}" font-size="20" font-weight="700" fill="${C.dark}" font-family="DM Sans">${r}</text>`).join('')}`;
        } else if (i === 1) {
          const open = ease(seg(t, p.at + 0.3, p.at + 1.5));
          art = `<rect x="-130" y="-210" width="260" height="260" rx="24" fill="#8C7A70"/>
            <rect x="-110" y="-190" width="220" height="220" rx="16" fill="#4A3A33"/>
            ${[0, 1, 2].map(j => `<rect x="${-80 + j * 40}" y="${-30 - j * 22}" width="70" height="26" rx="4" fill="${C.gold}" stroke="#C98A1F" stroke-width="2"/>`).join('')}
            <g transform="translate(-110,-190) scale(${1 - open * 0.85},1)"><rect x="0" y="0" width="220" height="220" rx="16" fill="#A8968B" stroke="#7A6A60" stroke-width="5"/>
              <circle cx="110" cy="110" r="44" fill="none" stroke="#7A6A60" stroke-width="8"/><g transform="translate(110,110) rotate(${open * 270})"><rect x="-5" y="-44" width="10" height="88" fill="#7A6A60"/><rect x="-44" y="-5" width="88" height="10" fill="#7A6A60"/></g></g>`;
        } else {
          const sp = ease(seg(t, p.at + 0.3, p.at + 1.4));
          art = `<g transform="translate(0,-90)"><circle r="110" fill="${C.purpleL}"/>
            <path d="M0,0 L0,-110 A110,110 0 1,1 -105,-33 Z" fill="${C.teal}" transform="translate(${-sp * 12},${sp * 8})"/>
            <text x="${-sp * 12 + 20}" y="${sp * 8 + 40}" font-size="30" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">You</text>
            <text x="-54" y="-50" font-size="24" font-weight="900" text-anchor="middle" fill="${C.purple}" font-family="Playfair Display">Firm</text></g>`;
        }
        out += `<g transform="translate(${p.x},${G - 70}) scale(${k * 1.3})">${art}</g>
          <text x="${p.x}" y="${G + 110}" font-size="34" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display" opacity="${clamp(k)}">${p.label}</text>`;
      });
      // The trader walks from station to station.
      const legs = [[s.start + 0.6, T.eval - 0.2, 140, 260], [T.funded - 1.2, T.funded, 260, 740], [T.split - 1.2, T.split, 740, 1220]];
      let x = 160, walking = false;
      legs.forEach(([a, b, x0, x1]) => { if (t >= a) { x = lerp(x0, x1, ease(seg(t, a, b))); if (t < b) walking = true; } });
      out += A.person(t, { x, y: G, scale: 1.0, look: A.LOOKS.buyer, walking, seed: 3, frontArm: walking ? undefined : { a1: 100, a2: 95 } });
      return out;
    },

    'order-demo': (s, t) => {
      const panels = [{ x: 160, at: s.mkt, kind: 'mkt', title: 'Market' }, { x: 700, at: s.lmt, kind: 'lmt', title: 'Limit' }, { x: 1240, at: s.stp, kind: 'stp', title: 'Stop' }];
      const W = 520, top = 400, H = 500, py0 = top + 110, ph = 300;
      return panels.map((P, i) => {
        const k = pop(t, P.at - 0.3, 0.6);
        if (k <= 0) return '';
        const cx = P.x + W / 2, col = [C.peach, C.teal, C.pink][i], dark = ['#B86E12', '#2F8A7F', '#C2475F'][i];
        const prog = ease(seg(t, P.at + 0.2, P.at + 4.2));
        // Price paths (0..1 x, value in panel units 0 top .. 1 bottom).
        const path = i === 0 ? (u => 0.45 + Math.sin(u * 12) * 0.06)
          : i === 1 ? (u => 0.25 + u * 0.56 + Math.sin(u * 14) * 0.04 - (u > 0.72 ? (u - 0.72) * 1.6 : 0))
          : (u => 0.3 + u * 0.55 + Math.sin(u * 13) * 0.04);
        const X = u => P.x + 40 + u * (W - 80), Yv = v => py0 + v * ph;
        const end = i === 0 ? 0.5 : 1;
        let d = '';
        for (let u = 0; u <= prog * end + 1e-6; u += 0.01) d += `${d ? 'L' : 'M'}${X(u).toFixed(1)},${Yv(path(u)).toFixed(1)}`;
        let extra = '';
        const lineV = i === 1 ? 0.62 : 0.72;
        if (i > 0) {
          const hit = i === 1 ? 0.62 : 0.72;
          // Find when price first reaches the line.
          let hu = 1; for (let u = 0; u <= 1; u += 0.005) if (path(u) >= hit) { hu = u; break; }
          const triggered = prog >= hu;
          const flash = triggered ? clamp(1 - (t - (P.at + 0.2 + hu * 4)) / 0.8) : 0;
          extra += `<line x1="${P.x + 30}" x2="${P.x + W - 30}" y1="${Yv(lineV)}" y2="${Yv(lineV)}" stroke="${col}" stroke-width="${5 + flash * 6}" stroke-dasharray="14 10"/>
            <text x="${P.x + 34}" y="${Yv(lineV) + 34}" font-size="22" font-weight="700" text-anchor="start" fill="${dark}" font-family="DM Sans">${i === 1 ? 'Buy limit' : 'Stop below your long'}</text>`;
          if (i === 2) extra += `<circle cx="${X(0)}" cy="${Yv(path(0))}" r="11" fill="${C.tealD}"/><text x="${X(0) + 16}" y="${Yv(path(0)) - 14}" font-size="20" font-weight="700" fill="#2F8A7F" font-family="DM Sans">Long entry</text>`;
          if (i === 2 && !triggered) extra += [0, 1].map(j => { const q = ((t * 0.8) + j * 0.5) % 1; return `<text x="${P.x + 60 + q * 20}" y="${Yv(lineV) - 14 - q * 30}" font-size="${22 + j * 6}" font-weight="900" fill="${C.purple}" opacity="${1 - q}" font-family="DM Sans">z</text>`; }).join('');
          if (triggered) {
            const tp = back((t - (P.at + 0.2 + hu * 4)) / 0.5);
            extra += `<circle cx="${X(hu)}" cy="${Yv(lineV)}" r="${14 + flash * 10}" fill="${col}"/>
              <g transform="translate(${cx},${top + H - 50}) scale(${tp})"><rect x="-210" y="-30" width="420" height="60" rx="30" fill="${col}"/>
              <text y="10" font-size="26" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${i === 1 ? 'Filled at your price' : 'Triggered → exits at market'}</text></g>`;
          }
        } else {
          const clickAt = P.at + 2.2;
          if (t > clickAt) {
            const tp = back((t - clickAt) / 0.5), u = 0.5;
            extra += `<circle cx="${X(u)}" cy="${Yv(path(u))}" r="16" fill="${col}"/>${A.sparkle(X(u), Yv(path(u)), clickAt, t)}
              <g transform="translate(${cx},${top + H - 50}) scale(${tp})"><rect x="-210" y="-30" width="420" height="60" rx="30" fill="${col}"/>
              <text y="10" font-size="26" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">Filled instantly</text></g>`;
          }
          const press = t > clickAt - 0.2 && t < clickAt + 0.2 ? 0.9 : 1;
          extra += `<g transform="translate(${P.x + W - 110},${py0 + 30}) scale(${press})"><rect x="-70" y="-28" width="140" height="56" rx="14" fill="${C.tealD}"/>
            <text y="9" font-size="24" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">BUY</text></g>`;
        }
        return `<g transform="translate(${cx},${top + H / 2}) scale(${k}) translate(${-cx},${-(top + H / 2)})">
          <rect x="${P.x}" y="${top}" width="${W}" height="${H}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <g transform="translate(${P.x + 60},${top + 52}) scale(0.38)">${A.badge(P.kind, t)}</g>
          <text x="${P.x + 104}" y="${top + 66}" font-size="40" font-weight="900" fill="${C.dark}" font-family="Playfair Display">${P.title}</text>
          <path d="${d}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>${extra}</g>`;
      }).join('');
    },

    seesaw: (s, t) => {
      const p = pop(t, s.start + 0.4, 0.8);
      if (p <= 0) return '';
      const tilt = Math.sin((t - s.start) * 1.2) * 9;
      const L = 520, cx = 960, cy = 800;
      const end = dir => ({ x: cx + dir * Math.cos(tilt * Math.PI / 180) * L, y: cy - 30 + dir * Math.sin(tilt * Math.PI / 180) * L });
      const l = end(-1), r = end(1);
      const seat = (q, kind, label, sub, col) => `<g transform="translate(${q.x},${q.y - 110})">
          <g transform="scale(0.8)">${A.badge(kind, t)}</g>
          <text y="-132" font-size="40" font-weight="900" text-anchor="middle" fill="${C.dark}" font-family="Playfair Display">${label}</text>
          <text y="-92" font-size="26" font-weight="700" text-anchor="middle" fill="${col}" font-family="DM Sans">${sub}</text></g>`;
      return `<g transform="translate(${cx},${cy}) scale(${p}) translate(${-cx},${-cy})">
        <path d="M${cx - 70},${cy + 120} L${cx + 70},${cy + 120} L${cx},${cy - 20} Z" fill="${C.purple}"/>
        <line x1="${l.x}" y1="${l.y}" x2="${r.x}" y2="${r.y}" stroke="#9B6A45" stroke-width="22" stroke-linecap="round"/>
        ${seat(l, 'mkt', 'Speed', 'Market order', '#B86E12')}${seat(r, 'lmt', 'Control', 'Limit order', '#2F8A7F')}</g>`;
    },

    'exit-plan': (s, t) => {
      const P = tradePanel(t, s, { entryX: 0.55 });
      let out = P.frame;
      const T = s.beats;
      out += P.history(0.55, s.start + 0.6, s.start + 3);
      out += P.level(T.tp, 0.18, C.teal, 'Take profit', 'flag');
      out += P.level(T.sl, 0.8, C.pink, 'Stop loss', 'shield');
      if (t > T.entry) {
        const k = back((t - T.entry) / 0.5), ex = P.X(0.55), ey = P.Y(0.5);
        out += `<g transform="translate(${ex},${ey}) scale(${k})"><circle r="16" fill="${C.tealD}"/><circle r="28" fill="none" stroke="${C.tealD}" stroke-width="4" opacity=".5"/></g>
          <text x="${ex + 36}" y="${ey + 9}" font-size="28" font-weight="900" fill="#2F8A7F" font-family="DM Sans" opacity="${clamp(k)}">Entry</text>`;
      }
      // Plan checklist.
      const items = [['Take profit', T.tp], ['Stop loss', T.sl], ['Entry', T.entry]];
      out += `<g transform="translate(1440,572)" opacity="${clamp((t - T.tp + 0.4) / 0.4)}"><rect x="-150" y="-50" width="300" height="250" rx="24" fill="#fff" stroke="#EADFD8" stroke-width="3"/>
        <text y="-12" font-size="22" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans" letter-spacing="3">THE ORDER</text>
        ${items.map(([l, at], i) => { const k = back((t - at - 0.4) / 0.4); return `<text x="-110" y="${40 + i * 56}" font-size="26" font-weight="900" fill="${C.dark}" font-family="DM Sans">${i + 1}.</text>
          <text x="-76" y="${40 + i * 56}" font-size="28" font-weight="700" fill="${k > 0 ? C.dark : '#C9B9AE'}" font-family="DM Sans">${l}</text>
          ${k > 0 ? `<path d="M80,${30 + i * 56} l10,10 l20,-22" fill="none" stroke="${C.tealD}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(${95},${30 + i * 56}) scale(${k}) translate(${-95},${-30 - i * 56})"/>` : ''}`; }).join('')}</g>`;
      return out;
    },

    'fear-drag': (s, t) => {
      const P = tradePanel(t, s, {});
      const T = s.beats;
      let out = P.frame + P.history(0.3, s.start + 0.4, s.start + 1.6);
      out += `<circle cx="${P.X(0.3)}" cy="${P.Y(0.45)}" r="14" fill="${C.tealD}"/>`;
      // Pullback toward the stop, without closing below it.
      const k = ease(seg(t, T.pull, T.pull + 3));
      let d = `M${P.X(0.3)},${P.Y(0.45)}`;
      for (let u = 0; u <= k; u += 0.01) d += ` L${P.X(0.3 + u * 0.45)},${P.Y(0.45 + Math.sin(u * Math.PI * 0.9) * 0.3 + Math.sin(u * 20) * 0.02)}`;
      out += `<path d="${d}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round"/>`;
      // The stop gets dragged down, stamped, and snaps back.
      const drag = ease(seg(t, T.drag, T.drag + 1.6)) * (1 - ease(seg(t, T.snap, T.snap + 0.6)));
      const slY = P.Y(0.8 + drag * 0.14);
      out += `<line x1="${P.x0}" x2="${P.x1}" y1="${P.Y(0.8)}" y2="${P.Y(0.8)}" stroke="${C.pink}" stroke-width="3" stroke-dasharray="4 10" opacity="${drag > 0 ? 0.5 : 0}"/>
        <line x1="${P.x0}" x2="${P.x1}" y1="${slY}" y2="${slY}" stroke="${C.pink}" stroke-width="7" stroke-dasharray="16 10"/>
        <text x="${P.x0 + 10}" y="${slY + 36}" font-size="26" font-weight="900" fill="#C2475F" font-family="DM Sans">Stop loss</text>`;
      if (t > T.drag - 0.6 && t < T.snap + 0.4) {
        const hx = P.X(0.85), hy = slY + 10;
        out += `<g transform="translate(${hx},${hy})"><path d="M0,0 L0,46 L12,34 L22,56 L32,52 L22,30 L40,30 Z" fill="#fff" stroke="${C.dark}" stroke-width="4" stroke-linejoin="round"/></g>`;
      }
      if (t > T.stamp) {
        const sp = back((t - T.stamp) / 0.5) * (1 - clamp((t - T.snap - 0.8) / 0.5));
        if (sp > 0) out += `<g transform="translate(${P.X(0.7)},${P.Y(0.88)}) scale(${sp}) rotate(-8)"><line x1="-70" y1="-70" x2="70" y2="70" stroke="${C.pink}" stroke-width="26" stroke-linecap="round"/><line x1="70" y1="-70" x2="-70" y2="70" stroke="${C.pink}" stroke-width="26" stroke-linecap="round"/></g>`;
      }
      // A nervous trader.
      const pp = pop(t, T.pull + 1, 0.6);
      if (pp > 0) {
        const sweat = [0, 1].map(i => { const q = ((t * 0.9) + i * 0.5) % 1; return `<path d="M${1560 + 40 + i * 16},${560 + q * 46} q6,10 0,16 q-6,-6 0,-16 Z" fill="#9FD8F0" opacity="${(1 - q) * (t < T.snap ? 1 : 0)}"/>`; }).join('');
        out += `<g transform="translate(1560,880) scale(${pp}) translate(-1560,-880)">` + A.person(t, { x: 1560, y: 880, scale: 0.9, look: A.LOOKS.d, mood: t < T.snap ? 'sad' : undefined, seed: 8 }) + sweat + '</g>';
      }
      return out;
    },

    'tp-hit': (s, t) => {
      const P = tradePanel(t, s, {});
      const T = s.beats;
      let out = P.frame + P.history(0.25, s.start + 0.4, s.start + 1.6);
      out += P.level(s.start + 0.6, 0.2, C.teal, 'Take profit', 'flag', T.hit);
      out += `<circle cx="${P.X(0.25)}" cy="${P.Y(0.65)}" r="14" fill="${C.tealD}"/>`;
      const k = ease(seg(t, T.rise, T.hit));
      let d = `M${P.X(0.25)},${P.Y(0.65)}`;
      for (let u = 0; u <= k; u += 0.01) d += ` L${P.X(0.25 + u * 0.5)},${P.Y(0.65 - u * 0.45 + Math.sin(u * 18) * 0.03 * (1 - u))}`;
      out += `<path d="${d}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round"/>`;
      if (t > T.hit) {
        const hx = P.X(0.75), hy = P.Y(0.2);
        out += A.sparkle(hx, hy, T.hit, t) + [0, 1, 2, 3, 4].map(i => {
          const q = clamp((t - T.hit - i * 0.12) / 1.2);
          return `<g transform="translate(${hx + (i - 2) * 40 * q},${hy - 40 - q * 120 + q * q * 80})" opacity="${1 - q * 0.6}"><circle r="20" fill="${C.gold}" stroke="#C98A1F" stroke-width="3"/><text y="7" font-size="20" font-weight="900" text-anchor="middle" fill="#8A5A0A" font-family="DM Sans">$</text></g>`;
        }).join('');
        const bp = back((t - T.hit - 0.6) / 0.5);
        out += `<g transform="translate(1420,${P.Y(0.62)}) scale(${bp})"><rect x="-190" y="-36" width="380" height="72" rx="36" fill="${C.teal}"/>
          <text y="12" font-size="32" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">Plan executed ✓</text></g>`;
      }
      return out;
    },

    backpacks: (s, t) => {
      const G = 960;
      let out = ground(G);
      [[s.light, 560, 1, A.LOOKS.c, '#2F8A7F', C.teal], [s.heavy, 1360, 10, A.LOOKS.d, '#C2475F', C.pink]].forEach(([at, cx, n, look, dark, col], i) => {
        const p = pop(t, at, 0.7);
        if (p <= 0) return;
        const heavy = i === 1;
        // Same mini chart above each: entry and a 10-point stop.
        const cy = 470;
        out += `<g transform="translate(${cx},${cy}) scale(${p})">
          <rect x="-250" y="-90" width="500" height="180" rx="24" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <path d="M-210,40 L-140,10 L-80,24 L-20,-20 L40,-6" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round"/>
          <circle cx="40" cy="-6" r="11" fill="${C.tealD}"/>
          <line x1="-220" x2="220" y1="56" y2="56" stroke="${C.pink}" stroke-width="5" stroke-dasharray="12 8"/>
          <text x="210" y="46" font-size="20" font-weight="700" text-anchor="end" fill="#C2475F" font-family="DM Sans">10-pt stop</text>
          <text x="-226" y="-56" font-size="20" font-weight="700" fill="${C.muted}" font-family="DM Sans" letter-spacing="2">SAME SETUP</text></g>`;
        const walk = Math.sin(t * (heavy ? 3 : 7));
        const bag = heavy ? 2.4 : 0.9, hunch = heavy ? 18 : 0;
        const pack = `<g transform="translate(${cx - 34 - 14 * bag},${G - 190 + hunch - 30 * bag}) scale(${bag})">
          <rect x="-34" y="-46" width="68" height="92" rx="16" fill="${col}" stroke="${dark}" stroke-width="${3 / bag + 1}"/>
          <rect x="-24" y="0" width="48" height="30" rx="8" fill="#fff" opacity=".4"/>
          <text y="24" font-size="${20 / Math.sqrt(bag)}" font-weight="900" text-anchor="middle" fill="${dark}" font-family="DM Sans">${n}</text></g>`;
        const sweat = heavy ? [0, 1].map(j => { const q = ((t * 0.9) + j * 0.5) % 1; return `<path d="M${cx + 46 + j * 16},${G - 330 + hunch + q * 46} q6,10 0,16 q-6,-6 0,-16 Z" fill="#9FD8F0" opacity="${1 - q}"/>`; }).join('') : '';
        out += `<g transform="translate(${cx},${G}) scale(${p}) translate(${-cx},${-G})">${pack}` +
          A.person(t, { x: cx, y: G + hunch * 0.3, scale: 1.05, look, mood: heavy ? 'sad' : undefined, walking: true, seed: i + 2 }) + sweat +
          `<text x="${cx + 170}" y="${G - 210}" font-size="38" font-weight="900" fill="${C.dark}" font-family="Playfair Display">${n} contract${n > 1 ? 's' : ''}</text>
          <text x="${cx + 170}" y="${G - 166}" font-size="32" font-weight="900" fill="${dark}" font-family="DM Sans">$${n * 20} at risk</text></g>`;
        void walk;
      });
      return out;
    },

    'size-dial': (s, t) => {
      const T = s.beats, cx = 860, cy = 820;
      const size = t >= T.d2 ? 4 : t >= T.d1 ? 2 : 1;
      const target = { 1: -60, 2: 0, 4: 60 }[size];
      const prev = { 1: -60, 2: -60, 4: 0 }[size], at = size === 4 ? T.d2 : size === 2 ? T.d1 : s.start;
      const ang = lerp(prev, target, back((t - at) / 0.7)) + (size === 4 ? Math.sin(t * 20) * 3 : 0);
      const p = pop(t, s.start + 0.4, 0.7);
      if (p <= 0) return '';
      const heat = clamp((size - 1) / 3);
      let out = `<g transform="translate(${cx},${cy}) scale(${p})">
        <circle r="300" fill="${C.pink}" opacity="${heat * 0.12 * (1 + Math.sin(t * 6) * 0.3)}"/>
        <path d="M-260,0 A260,260 0 0,1 260,0" fill="none" stroke="#EADFD8" stroke-width="44" stroke-linecap="round"/>
        <path d="M-260,0 A260,260 0 0,1 -130,-225" fill="none" stroke="${C.teal}" stroke-width="44" stroke-linecap="round"/>
        <path d="M130,-225 A260,260 0 0,1 260,0" fill="none" stroke="${C.pink}" stroke-width="44" stroke-linecap="round"/>
        <text x="-240" y="60" font-size="24" font-weight="700" fill="#2F8A7F" font-family="DM Sans">calm</text>
        <text x="240" y="60" font-size="24" font-weight="700" text-anchor="end" fill="#C2475F" font-family="DM Sans">on tilt</text>
        <g transform="rotate(${ang})"><path d="M-14,0 L0,-230 L14,0 Z" fill="${C.dark}"/></g><circle r="26" fill="${C.dark}"/>
        <text y="120" font-size="64" font-weight="900" text-anchor="middle" fill="${size > 1 ? '#C2475F' : C.dark}" font-family="Playfair Display">${size} contract${size > 1 ? 's' : ''}</text></g>`;
      // Loss tags.
      [[T.l1, '−$20', 1420, 520], [T.l2, '−$40', 1500, 680]].forEach(([at, txt, x, y]) => {
        const k = back((t - at) / 0.5);
        if (k > 0) out += `<g transform="translate(${x},${y}) scale(${k}) rotate(${-6})"><rect x="-110" y="-44" width="220" height="88" rx="22" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="4"/>
          <text y="16" font-size="46" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="Playfair Display">${txt}</text></g>`;
      });
      if (t > T.stamp) {
        const k = back((t - T.stamp) / 0.5);
        out += `<g transform="translate(1440,860) scale(${k}) rotate(-8)"><rect x="-240" y="-56" width="480" height="112" rx="20" fill="none" stroke="#C2475F" stroke-width="8"/>
          <text y="-6" font-size="36" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="DM Sans">EMOTION,</text>
          <text y="36" font-size="36" font-weight="900" text-anchor="middle" fill="#C2475F" font-family="DM Sans">NOT A RISK PLAN</text></g>`;
      }
      return out;
    },

    'same-size': (s, t) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], moods = ['happy', 'sad', 'wow', 'meh', 'happy'];
      const face = (m) => {
        const mouth = m === 'happy' ? 'M-16,8 Q0,24 16,8' : m === 'sad' ? 'M-16,18 Q0,4 16,18' : m === 'wow' ? '' : 'M-14,14 L14,14';
        return `<circle r="44" fill="${C.peachL}"/><circle cx="-14" cy="-8" r="5" fill="${C.dark}"/><circle cx="14" cy="-8" r="5" fill="${C.dark}"/>
          ${m === 'wow' ? `<ellipse cx="0" cy="14" rx="8" ry="11" fill="${C.dark}"/>` : `<path d="${mouth}" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>`}`;
      };
      let out = '';
      days.forEach((d, i) => {
        const x = 360 + i * 300, at = s.start + 0.6 + i * 0.5, p = pop(t, at, 0.6);
        if (p <= 0) return;
        out += `<g transform="translate(${x},660) scale(${p})">
          <rect x="-125" y="-200" width="250" height="400" rx="30" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>
          <text y="-150" font-size="30" font-weight="900" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${d}</text>
          <g transform="translate(0,-50)">${face(moods[i])}</g>
          <rect x="-90" y="50" width="180" height="110" rx="20" fill="#E8F8F6" stroke="${C.tealL}" stroke-width="3"/>
          <text y="104" font-size="54" font-weight="900" text-anchor="middle" fill="#2F8A7F" font-family="Playfair Display">1</text>
          <text y="142" font-size="20" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans">contract</text></g>`;
      });
      if (t > s.ruleAt) {
        const k = ease((t - s.ruleAt) / 1.2);
        out += `<line x1="235" x2="${235 + 1450 * k}" y1="905" y2="905" stroke="${C.teal}" stroke-width="8" stroke-linecap="round"/>
          <text x="960" y="960" font-size="34" font-weight="900" text-anchor="middle" fill="#2F8A7F" font-family="Playfair Display" opacity="${k}">Same rule. Same size.</text>`;
      }
      return out;
    },

    sessions: (s, t) => {
      const cols = [
        { x: 400, at: s.asia, name: 'Asia', sky: ['#3D3550', '#5E56B8'], kind: 'asia', amp: 0.4, desc: 'Quiet, range-bound' },
        { x: 960, at: s.london, name: 'London', sky: ['#F5A857', '#F9B8C6'], kind: 'london', amp: 0.45, desc: 'First real expansion' },
        { x: 1520, at: s.ny, name: 'New York', sky: ['#7ECEC4', '#E8F8F6'], kind: 'ny', amp: 0.9, desc: 'Highest volume, sharpest moves' },
      ];
      const active = t >= s.ny ? 2 : t >= s.london ? 1 : t >= s.asia ? 0 : -1;
      return cols.map((c, i) => {
        const p = pop(t, c.at - 0.2, 0.7);
        if (p <= 0) return '';
        const w = 500, x0 = c.x - w / 2, top = 360;
        const on = i === active;
        let sky = `<defs><linearGradient id="sky${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient></defs>
          <rect x="${x0}" y="${top}" width="${w}" height="250" rx="28" fill="url(#sky${i})"/>`;
        const g = top + 250;
        if (c.kind === 'asia') {
          sky += `<circle cx="${x0 + 400}" cy="${top + 70}" r="34" fill="#FFF3C4"/><circle cx="${x0 + 414}" cy="${top + 60}" r="30" fill="${c.sky[0]}"/>
            ${[[80, 120], [190, 90], [300, 140]].map(([dx, h]) => `<rect x="${x0 + dx}" y="${g - h}" width="90" height="${h}" fill="#2A2440"/><path d="M${x0 + dx - 14},${g - h} L${x0 + dx + 45},${g - h - 34} L${x0 + dx + 104},${g - h} Z" fill="#2A2440"/>
              ${[0, 1].map(k => `<rect x="${x0 + dx + 18 + k * 34}" y="${g - h + 24}" width="18" height="18" rx="3" fill="#FFE08A" opacity="${0.5 + 0.5 * Math.sin(t * 2 + dx + k)}"/>`).join('')}`).join('')}`;
        } else if (c.kind === 'london') {
          const rise = Math.sin(t * 0.8) * 6;
          sky += `<circle cx="${x0 + 380}" cy="${g - 40 + rise}" r="56" fill="#FFE08A"/>
            <rect x="${x0 + 230}" y="${g - 190}" width="56" height="190" fill="#6E5A62"/><path d="M${x0 + 224},${g - 190} L${x0 + 258},${g - 240} L${x0 + 292},${g - 190} Z" fill="#6E5A62"/>
            <circle cx="${x0 + 258}" cy="${g - 150}" r="20" fill="#FFF3C4"/><line x1="${x0 + 258}" y1="${g - 150}" x2="${x0 + 258 + Math.cos(t) * 14}" y2="${g - 150 + Math.sin(t) * 14}" stroke="#6E5A62" stroke-width="3"/>
            <rect x="${x0 + 30}" y="${g - 80}" width="80" height="80" fill="#8A7480"/><rect x="${x0 + 120}" y="${g - 110}" width="100" height="110" fill="#8A7480"/><rect x="${x0 + 310}" y="${g - 70}" width="160" height="70" fill="#6E5A62"/>`;
        } else {
          sky += `<circle cx="${x0 + 410}" cy="${top + 60}" r="38" fill="#FFE08A"/>${Array.from({ length: 8 }, (_, k) => `<rect x="${x0 + 407}" y="${top + 6}" width="6" height="14" rx="3" fill="#FFE08A" transform="rotate(${k * 45 + t * 20} ${x0 + 410} ${top + 60})"/>`).join('')}
            ${[[30, 150, 70], [110, 200, 60], [180, 130, 80], [270, 220, 56], [336, 160, 70]].map(([dx, h, ww]) => `<rect x="${x0 + dx}" y="${g - h}" width="${ww}" height="${h}" fill="#4FA99E"/>
              ${Array.from({ length: Math.floor(h / 30) }, (_, k) => `<rect x="${x0 + dx + 10}" y="${g - h + 12 + k * 30}" width="${ww - 20}" height="10" rx="2" fill="#E8F8F6" opacity=".7"/>`).join('')}`).join('')}`;
        }
        // Candle strip showing the session's personality.
        let candles = '';
        const n = 9, cw = w / n;
        // Build the session's candles, then scale them into the strip.
        const seq = []; let v = 0;
        for (let k = 0; k < n; k++) {
          const dir = c.kind === 'asia' ? (k % 2 ? 1 : -1) : (k < 3 ? (k % 2 ? 1 : -1) * 0.5 : 1) * (c.kind === 'ny' && k > 6 ? -1 : 1);
          const o = v, cl = v + dir * c.amp * (c.kind === 'asia' ? 0.6 : 1);
          seq.push([o, cl]); v = cl;
        }
        const lo = Math.min(...seq.flat()) - 0.15, hi = Math.max(...seq.flat()) + 0.15;
        const span = Math.max(hi - lo, 1.6), mid = (hi + lo) / 2;
        const Yc = val => 765 - (val - mid) / span * 200;
        seq.forEach(([o, cl], k) => {
          const kp = ease((t - c.at - 0.4 - k * 0.22) / 0.4);
          if (kp <= 0) return;
          const up = cl >= o, col = up ? C.teal : C.pink, cx = x0 + cw * k + cw / 2;
          const y1 = Yc(Math.max(o, lerp(o, cl, kp))), y2 = Yc(Math.min(o, lerp(o, cl, kp)));
          candles += `<line x1="${cx}" x2="${cx}" y1="${y1 - 8}" y2="${y2 + 8}" stroke="${col}" stroke-width="3"/><rect x="${cx - cw * 0.3}" y="${y1}" width="${cw * 0.6}" height="${Math.max(3, y2 - y1)}" rx="3" fill="${col}"/>`;
          const vh = (c.kind === 'asia' ? 14 : c.kind === 'london' ? 34 : 70) * (0.7 + 0.3 * Math.abs(Math.sin(k * 2.3))) * kp;
          candles += `<rect x="${cx - cw * 0.3}" y="${930 - vh}" width="${cw * 0.6}" height="${vh}" rx="2" fill="${C.purpleL}"/>`;
        });
        return `<g transform="translate(${c.x},640) scale(${p * (on ? 1.03 : 1)}) translate(${-c.x},-640)">
          <rect x="${x0 - 14}" y="${top - 14}" width="${w + 28}" height="${600}" rx="36" fill="#fff" stroke="${on ? C.peach : '#F1E7E1'}" stroke-width="${on ? 5 : 2}"/>
          ${sky}<text x="${x0 + 24}" y="${top + 50}" font-size="40" font-weight="900" fill="#fff" font-family="Playfair Display">${c.name}</text>
          ${candles}
          <text x="${c.x}" y="${985}" font-size="26" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${c.desc}</text></g>`;
      }).join('');
    },

    'crowd-rooms': (s, t) => {
      const G = 900;
      let out = '';
      [[s.empty, 520, 2, 'Overnight', true], [s.packed, 1400, 7, 'New York open', false]].forEach(([at, cx, n, label, night], i) => {
        const p = pop(t, at, 0.7);
        if (p <= 0) return;
        const w = 760, x0 = cx - w / 2, top = 400;
        let room = `<rect x="${x0}" y="${top}" width="${w}" height="560" rx="36" fill="${night ? '#EEEDFE' : '#FEF3E4'}" stroke="${night ? C.purpleL : C.peachL}" stroke-width="4"/>
          <rect x="${x0 + 30}" y="${top + 30}" width="160" height="110" rx="14" fill="${night ? '#3D3550' : '#B2E4DF'}"/>
          ${night ? `<circle cx="${x0 + 140}" cy="${top + 70}" r="22" fill="#FFF3C4"/><circle cx="${x0 + 150}" cy="${top + 63}" r="20" fill="#3D3550"/>` : `<circle cx="${x0 + 110}" cy="${top + 85}" r="30" fill="#FFE08A"/>`}
          <text x="${x0 + w - 30}" y="${top + 70}" font-size="40" font-weight="900" text-anchor="end" fill="${C.dark}" font-family="Playfair Display">${label}</text>`;
        const looks = ['a', 'b', 'c', 'd', 'e', 'buyer', 'seller'];
        for (let k = 0; k < n; k++) {
          const kp = pop(t, at + 0.3 + k * 0.25, 0.5);
          if (kp <= 0) continue;
          const px = n === 2 ? x0 + 260 + k * 260 : x0 + 90 + k * 96, sway = night ? 0 : Math.sin(t * 4 + k) * 6;
          room += `<g transform="translate(${px},${G}) scale(${kp}) translate(${-px},${-G})">` + A.person(t, { x: px + sway, y: G, scale: n === 2 ? 0.8 : 0.72, look: A.LOOKS[looks[k % looks.length]], seed: k + i * 3, talk: !night && k % 2 === 0,
            frontArm: !night && k % 3 === 0 ? { a1: -60, a2: -100 + Math.sin(t * 6 + k) * 10 } : undefined }) + '</g>';
        }
        // Volume meter.
        const vp = clamp((t - at - 0.6) / 1.4) * (night ? 0.18 : 0.95);
        room += `<rect x="${x0 + 30}" y="${top + 160}" width="24" height="${330}" rx="12" fill="#fff"/>
          <rect x="${x0 + 30}" y="${top + 490 - 330 * vp}" width="24" height="${330 * vp}" rx="12" fill="${night ? C.purple : C.peach}"/>
          <text x="${x0 + 42}" y="${top + 530}" font-size="18" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">VOL</text>`;
        out += `<g transform="translate(${cx},680) scale(${p}) translate(${-cx},-680)">${room}</g>`;
      });
      return out;
    },

    clock24: (s, t) => {
      const cx = 960, cy = 700, R = 230;
      const p = pop(t, s.start + 0.4, 0.7);
      if (p <= 0) return '';
      // Approximate session windows in US Eastern Time (hours).
      const sess = [{ a: 19, b: 28, col: C.purple, name: 'Asia' }, { a: 3, b: 11.5, col: C.peach, name: 'London' }, { a: 9.5, b: 16, col: C.teal, name: 'New York' }];
      const ang = h => (h / 24) * 360 - 90;
      const pt = (h, r) => [cx + Math.cos(ang(h) * Math.PI / 180) * r, cy + Math.sin(ang(h) * Math.PI / 180) * r];
      const arc = (a, b, r) => { const [x1, y1] = pt(a, r), [x2, y2] = pt(b, r); return `M${x1},${y1} A${r},${r} 0 ${b - a > 12 ? 1 : 0},1 ${x2},${y2}`; };
      const now = (s.start + 0.5 < t ? ((t - s.start) * 2.4 + 18) % 24 : 18);
      let out = `<g transform="translate(${cx},${cy}) scale(${p}) translate(${-cx},${-cy})">
        <circle cx="${cx}" cy="${cy}" r="${R + 60}" fill="#fff" stroke="#F1E7E1" stroke-width="3"/>`;
      sess.forEach((q, i) => {
        const r = R - i * 46;
        const inside = (now >= q.a && now < q.b) || (now + 24 >= q.a && now + 24 < q.b);
        out += `<path d="${arc(q.a, q.b, r)}" fill="none" stroke="${q.col}" stroke-width="${inside ? 40 : 30}" stroke-linecap="round" opacity="${inside ? 1 : 0.45}"/>`;
        const [lx, ly] = pt((q.a + q.b) / 2, r);
        out += `<text x="${lx}" y="${ly + 8}" font-size="${inside ? 26 : 22}" font-weight="900" text-anchor="middle" fill="${inside ? '#fff' : C.dark}" font-family="DM Sans">${q.name}</text>`;
      });
      [0, 6, 12, 18].forEach(h => { const [x, y] = pt(h, R + 34); out += `<text x="${x}" y="${y + 9}" font-size="26" font-weight="700" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${['12am', '6am', '12pm', '6pm'][h / 6]}</text>`; });
      const [hx, hy] = pt(now, R - 150);
      out += `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="18" fill="${C.dark}"/>
        <text x="${cx}" y="${cy + R + 110}" font-size="22" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">Approximate hours, US Eastern Time</text></g>`;
      return out;
    },

    'candle-forms': (s, t) => {
      const Y = v => 900 - v * 4.4;
      const path = u => 50 + Math.sin(u * 9) * 18 * (1 - u * 0.4) - Math.sin(u * 3.3) * 22 + u * 52 + Math.sin(u * 23) * 4;
      const c = formCandle(t, { x: 960, y: Y, path, t0: s.formAt, t1: s.formAt + 5, w: 150, wick: 10 });
      let out = `<rect x="700" y="${Y(120) - 20}" width="520" height="${Y(0) - Y(120) + 40}" rx="30" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>` + c.svg;
      // Buyers and sellers pushing as price moves.
      if (c.k > 0 && c.k < 1) {
        const rising = path(Math.min(1, c.k + 0.01)) >= path(c.k);
        out += `<text x="${rising ? 560 : 1360}" y="${Y(c.cl) + 20}" font-size="60" font-weight="900" text-anchor="middle" fill="${rising ? C.teal : C.pink}" font-family="DM Sans">${rising ? '▲' : '▼'}</text>`;
      }
      const bp = pop(t, s.start + 0.6, 0.6);
      if (bp > 0) {
        out += `<g transform="translate(470,${560}) scale(${bp})"><circle r="70" fill="${C.teal}"/><text y="20" font-size="58" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">B</text></g>
          <text x="470" y="680" font-size="26" font-weight="700" text-anchor="middle" fill="#2F8A7F" font-family="DM Sans" opacity="${bp}">BUYERS</text>
          <g transform="translate(1450,${560}) scale(${bp})"><circle r="70" fill="${C.pink}"/><text y="20" font-size="58" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">S</text></g>
          <text x="1450" y="680" font-size="26" font-weight="700" text-anchor="middle" fill="#C2475F" font-family="DM Sans" opacity="${bp}">SELLERS</text>`;
      }
      if (c.k >= 1) {
        const wp = back((t - s.formAt - 5) / 0.6);
        out += `<g transform="translate(470,820) scale(${wp})"><rect x="-130" y="-38" width="260" height="76" rx="38" fill="${C.teal}"/>
          <text y="12" font-size="32" font-weight="900" text-anchor="middle" fill="#fff" font-family="Playfair Display">Buyers won</text></g>` + A.sparkle(470, 560, s.formAt + 5, t, C.teal)
          + `<text x="1080" y="${Y(c.op) + 10}" font-size="24" font-weight="700" fill="${C.muted}" font-family="DM Sans">open</text>
             <text x="1080" y="${Y(c.cl) + 10}" font-size="24" font-weight="700" fill="${C.dark}" font-family="DM Sans">close</text>`;
      }
      return out;
    },

    'two-stories': (s, t) => {
      const Y = v => 850 - v * 3.9;
      const big = u => 15 + ease(u) * 95 + Math.sin(u * 14) * 3;
      const fight = u => 60 + Math.sin(u * 7) * 40 * Math.sin(u * Math.PI) - u * 5;
      const L = formCandle(t, { x: 640, y: Y, path: big, t0: s.bigAt, t1: s.bigAt + 3, w: 140, wick: 10 });
      const R = formCandle(t, { x: 1280, y: Y, path: fight, t0: s.fightAt, t1: s.fightAt + 3.4, w: 140, wick: 10 });
      let out = '';
      [[640, s.bigAt, L, 'Decisive win', 'Price traveled far, one direction', C.teal, '#2F8A7F'], [1280, s.fightAt, R, 'A real fight', 'Long wicks, nobody settled it', C.pink, '#C2475F']].forEach(([x, at, c, h, d, col, dark]) => {
        const p = pop(t, at - 0.3, 0.6);
        if (p <= 0) return;
        out += `<rect x="${x - 290}" y="380" width="580" height="580" rx="34" fill="#fff" stroke="${c.k >= 1 ? col : '#F1E7E1'}" stroke-width="${c.k >= 1 ? 4 : 2}" opacity="${clamp(p)}"/>` + c.svg;
        if (c.k >= 1) {
          const lp = clamp((t - at - (x === 640 ? 3 : 3.4)) / 0.5);
          out += `<g opacity="${lp}"><text x="${x}" y="900" font-size="38" font-weight="900" text-anchor="middle" fill="${dark}" font-family="Playfair Display">${h}</text>
            <text x="${x}" y="938" font-size="24" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${d}</text></g>`;
        }
      });
      return out;
    },

    'color-rule': (s, t) => {
      const cx = 960, open = 680;
      const phase = t < s.redAt ? 0 : 1;
      const k = ease(seg(t, phase ? s.redAt : s.greenAt, (phase ? s.redAt : s.greenAt) + 1.2));
      const close = phase ? lerp(open - 220, open + 220, k) : lerp(open, open - 220, k);
      const up = close <= open, col = up ? C.teal : C.pink;
      const p = pop(t, s.start + 0.4, 0.6);
      if (p <= 0) return '';
      return `<g opacity="${clamp(p)}">
        <line x1="620" x2="1300" y1="${open}" y2="${open}" stroke="${C.muted}" stroke-width="4" stroke-dasharray="14 10"/>
        <text x="600" y="${open + 10}" font-size="30" font-weight="900" text-anchor="end" fill="${C.muted}" font-family="DM Sans">OPEN</text>
        <rect x="${cx - 80}" y="${Math.min(open, close)}" width="160" height="${Math.max(6, Math.abs(open - close))}" rx="16" fill="${col}"/>
        <line x1="620" x2="1300" y1="${close}" y2="${close}" stroke="${C.dark}" stroke-width="4"/>
        <text x="1320" y="${close + 10}" font-size="30" font-weight="900" fill="${C.dark}" font-family="DM Sans">CLOSE</text>
        <text x="1500" y="${open + 14}" font-size="52" font-weight="900" text-anchor="middle" fill="${up ? '#2F8A7F' : '#C2475F'}" font-family="Playfair Display">${up ? 'Green' : 'Red'}</text>
        <text x="1500" y="${open + 56}" font-size="24" text-anchor="middle" fill="${C.muted}" font-family="DM Sans">${up ? 'close above open' : 'close below open'}</text></g>`;
    },

    anatomy: (s, t) => {
      const Y = v => 930 - v * 4.4;
      const path = u => 30 + Math.sin(u * 8) * 20 * Math.sin(u * Math.PI) - (u < 0.3 ? u * 50 : 15) + ease(clamp((u - 0.3) / 0.7)) * 70 + (u > 0.75 ? Math.sin((u - 0.75) * 12) * 30 : 0);
      const c = formCandle(t, { x: 960, y: Y, path, t0: s.formAt, t1: s.formAt + 4.4, w: 170, wick: 12 });
      let out = `<rect x="560" y="${Y(120)}" width="800" height="${Y(-10) - Y(120)}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>` + c.svg;
      if (c.k >= 1) {
        const tag = (at, x, y, text, col, side) => {
          const k = back((t - at) / 0.5);
          if (k <= 0) return '';
          const tx = side < 0 ? x - 210 : x + 210;
          return `<g opacity="${clamp(k)}"><line x1="${x + side * 20}" x2="${tx - side * 6}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="3" stroke-dasharray="6 6"/>
            <g transform="translate(${tx + side * 70},${y}) scale(${k})"><rect x="-74" y="-26" width="148" height="52" rx="26" fill="${col}"/>
            <text y="9" font-size="26" font-weight="900" text-anchor="middle" fill="#fff" font-family="DM Sans">${text}</text></g></g>`;
        };
        const L = s.labels;
        out += tag(L.open, 960 - 85, Y(c.op), 'Open', C.muted, -1) + tag(L.close, 960 + 85, Y(c.cl), 'Close', C.pink, 1)
          + tag(L.range, 960, Y(c.hi), 'High', C.purple, 1) + tag(L.range, 960, Y(c.lo), 'Low', C.purple, 1)
          + tag(L.body, 960 + 85, (Y(c.op) + Y(c.cl)) / 2, 'Body', C.tealD, 1) + tag(L.wick, 960, (Y(c.hi) + Y(c.cl)) / 2, 'Wick', C.peach, -1);
      }
      return out;
    },

    'level-candles': (s, t) => {
      // Candle paths relative to a level at 60 (open, extreme, close).
      const P = {
        pokeReject: u => 40 + Math.sin(Math.min(u, 0.7) / 0.7 * Math.PI / 2) * 36 - (u > 0.7 ? (u - 0.7) / 0.3 * 42 : 0),
        breakHold: u => 42 + ease(u) * 30 + Math.sin(u * 12) * 3,
        supportHold: u => 70 - Math.sin(Math.min(u, 0.6) / 0.6 * Math.PI / 2) * 46 + (u > 0.6 ? (u - 0.6) / 0.4 * 66 : 0),
        supportBreak: u => 70 - Math.sin(Math.min(u, 0.6) / 0.6 * Math.PI / 2) * 46 + (u > 0.6 ? (u - 0.6) / 0.4 * 6 : 0),
      };
      const Y = v => 960 - v * 5.2;
      const lv = s.level ?? 60;
      const lp = clamp((t - s.levelAt) / 0.8);
      let out = `<rect x="300" y="${Y(100)}" width="1320" height="${Y(0) - Y(100)}" rx="34" fill="#fff" stroke="#F1E7E1" stroke-width="2"/>`;
      if (lp > 0) out += `<line x1="340" x2="${340 + 1240 * ease(lp)}" y1="${Y(lv)}" y2="${Y(lv)}" stroke="${C.purple}" stroke-width="6" stroke-dasharray="18 10"/>
        <text x="350" y="${Y(lv) - 16}" font-size="28" font-weight="900" fill="${C.purple}" font-family="DM Sans" opacity="${lp}">${esc(s.levelLabel)}</text>`;
      s.candles.forEach(cd => {
        const c = formCandle(t, { x: cd.x, y: Y, path: P[cd.path], t0: cd.at, t1: cd.at + (cd.dur || 4), w: 130, wick: 10 });
        out += c.svg;
        if (c.k >= 1 && cd.verdict) {
          const vp = back((t - cd.at - (cd.dur || 4) - 0.2) / 0.5);
          const col = cd.good ? C.teal : C.pink, dark = cd.good ? '#2F8A7F' : '#C2475F';
          const vy = cd.below ? Y(8) : Y(94);
          out += `<g transform="translate(${cd.x},${vy}) scale(${Math.max(0, vp)})"><rect x="-160" y="-30" width="320" height="60" rx="30" fill="${cd.good ? '#E8F8F6' : C.pinkP}" stroke="${col}" stroke-width="3"/>
            <text y="10" font-size="26" font-weight="900" text-anchor="middle" fill="${dark}" font-family="DM Sans">${esc(cd.verdict)}</text></g>`;
        }
      });
      return out;
    },

    'host-mission': (s, t, ctx) =>
      host(t, { x: 110, y: 330, w: 540, pose: t < s.cta.at ? 'point' : 'cheer', talk: ctx.talking, enterAt: s.start + 0.1 }) +
      (t > s.cta.at ? A.sparkle(380, 400, s.cta.at, t) : ''),
  };

  window.ILLUS = { BUILD, LIVE };
})();
