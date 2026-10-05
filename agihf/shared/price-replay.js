/**
 * price-replay.js — A Girl & Her Futures™
 *
 * PRICE REPLAY: watch how price traveled, candle by candle. Phase 3 Section 2
 * (Gaps, Imbalances & Price Delivery) uses it to ask HOW price got somewhere,
 * not only where it went.
 *
 *   price_replay = {
 *     kicker, title, body,
 *     charts:   [{ label, chart, meter }]   one chart, or two played side by side (PLAY BOTH)
 *     start:    candles visible at the start (default 1)
 *     overlays: [{ key, label, ids }]       optional toggles (show structure / overlap / imbalance / FVG)
 *     pauses:   [{ at, text, asks, meter, show, lens }]
 *               playback stops when it reaches candle `at`; questions must be answered to go on
 *     end:      { text, asks, meter, show, lens, card }   after the last candle
 *     speed:    ms per candle (default 520); "Slow down" doubles it
 *   }
 *
 * Controls: restart, previous candle, play / pause, next candle, slow down.
 * Stepping is always available, so nobody has to watch an animation; under
 * reduced motion candles simply appear.
 */

import { mountChart } from './structure-charts.js';
import { askQuestion, meterEl, lensCard, mistakeNudge } from './price-lab.js';
import { wrapGuide } from './guide.js';

export function renderPriceReplay(el, slide, satisfy, helpers) {
  const charts = slide.charts || [{ chart: slide.chart }];
  const pauses = (slide.pauses || []).slice().sort((a, b) => a.at - b.at);
  const overlays = slide.overlays || [];
  el.innerHTML = `<div class="lw-card pl-card pr-card">
      ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Price replay'}</div>`}
      ${slide.title ? `<h2>${slide.title}</h2>` : ''}
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      ${mistakeNudge(slide.watch)}
      ${overlays.length ? `<div class="pr-overlays" role="group" aria-label="Overlays">${overlays.map((o) => `<button type="button" class="pr-ov" data-k="${o.key}" aria-pressed="false">${o.label}</button>`).join('')}</div>` : ''}
      <div class="pr-charts pr-n${charts.length}">${charts.map((c, i) => `<div class="pr-pane">${c.label ? `<div class="pr-label">${c.label}</div>` : ''}<div class="pl-chart" data-i="${i}"></div><div class="pr-meter-slot"></div></div>`).join('')}</div>
      <div class="pr-bar">
        <button type="button" class="pr-btn" data-a="restart" title="Restart" aria-label="Restart">⟲</button>
        <button type="button" class="pr-btn" data-a="prev" title="Previous candle" aria-label="Previous candle">◀</button>
        <button type="button" class="pr-btn pr-play" data-a="play" aria-label="Play">▶ ${charts.length > 1 ? 'Play both' : 'Play'}</button>
        <button type="button" class="pr-btn" data-a="next" title="Next candle" aria-label="Next candle">▶|</button>
        <button type="button" class="pr-btn pr-slow" data-a="slow" aria-pressed="false" title="Slow down">🐢 Slow</button>
        <span class="pr-count" aria-live="polite"></span>
      </div>
      <div class="pl-caption" aria-live="polite"></div>
      <div class="pl-asks"></div>
    </div>`;
  const card = el.querySelector('.pr-card');
  const minis = charts.map((c, i) => mountChart(card.querySelector(`.pl-chart[data-i="${i}"]`), { ...c.chart, showCandles: 0 }, { label: c.label || slide.title }));
  const total = Math.max(...minis.map((m) => m.candleCount));
  const cap = card.querySelector('.pl-caption');
  wrapGuide(cap);
  const asks = card.querySelector('.pl-asks');
  const playBtn = card.querySelector('.pr-play');
  const countEl = card.querySelector('.pr-count');
  const slots = [...card.querySelectorAll('.pr-meter-slot')];
  const solved = new Set();
  let k = 0, timer = null, slow = false, blocked = false, ended = false;

  const say = (html) => { cap.innerHTML = html || ''; cap.classList.remove('pl-pop'); void cap.offsetWidth; if (html) cap.classList.add('pl-pop'); };
  const reveal = (ids) => minis.forEach((m) => m.reveal(ids));
  function meters(m) {
    if (!m) return;
    [].concat(m).forEach((v, i) => { if (slots[i] && v) { slots[i].innerHTML = ''; slots[i].appendChild(meterEl(v)); } });
  }
  function draw() {
    minis.forEach((m) => m.showCandles(Math.min(k, m.candleCount), 0));
    countEl.textContent = `Candle ${k} / ${total}`;
  }
  function stop() { clearInterval(timer); timer = null; playBtn.textContent = charts.length > 1 ? '▶ Play both' : '▶ Play'; playBtn.setAttribute('aria-label', 'Play'); }

  function runAsks(list, i, done) {
    if (!list || i >= list.length) { done(); return; }
    askQuestion(asks, list[i], helpers, () => runAsks(list, i + 1, done));
  }
  function stage(p, key, done) {
    stop();
    blocked = true;
    asks.innerHTML = '';
    say(p.text);
    if (p.show) reveal(p.show);
    meters(p.meter);
    runAsks(p.asks, 0, () => {
      if (p.lens) asks.appendChild(lensCard(p.lens));
      if (p.card) { const c = document.createElement('div'); c.className = 'p3-foot show'; c.innerHTML = p.card; asks.appendChild(c); }
      solved.add(key);
      blocked = false;
      done?.();
    });
  }
  function finish() {
    if (ended) return;
    ended = true;
    const e = slide.end || {};
    stage(e, 'end', () => {
      if (el.querySelector(':scope > .lw-continue-btn')) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
      b.addEventListener('click', satisfy);
      el.appendChild(b);
    });
  }
  function step(dir) {
    if (dir > 0 && blocked) return false;
    const nk = Math.max(0, Math.min(total, k + dir));
    if (nk === k) { if (dir > 0 && k >= total) finish(); return false; }
    k = nk;
    draw();
    if (dir > 0) {
      const p = pauses.find((x) => x.at === k && !solved.has(x.at));
      if (p) { stage(p, p.at); return false; }
      if (k >= total) { stop(); finish(); return false; }
    }
    return true;
  }
  function play() {
    if (timer) { stop(); return; }
    if (blocked) return;
    if (k >= total && !ended) { finish(); return; }
    if (k >= total) { k = slide.start ?? 1; draw(); }
    playBtn.textContent = '⏸ Pause'; playBtn.setAttribute('aria-label', 'Pause');
    timer = setInterval(() => { if (!step(1)) stop(); }, (slide.speed || 520) * (slow ? 2.2 : 1));
  }
  card.querySelectorAll('.pr-btn').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.a;
    if (a === 'play') play();
    else if (a === 'next') { stop(); step(1); }
    else if (a === 'prev') { stop(); step(-1); }
    else if (a === 'restart') { stop(); k = slide.start ?? 1; draw(); }
    else if (a === 'slow') {
      slow = !slow; b.classList.toggle('on', slow); b.setAttribute('aria-pressed', slow);
      if (timer) { stop(); play(); }
    }
  }));
  card.querySelectorAll('.pr-ov').forEach((b) => b.addEventListener('click', () => {
    const o = overlays.find((x) => x.key === b.dataset.k);
    const on = !b.classList.contains('on');
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    minis.forEach((m) => (on ? m.reveal(o.ids) : m.hide(o.ids)));
  }));
  overlays.filter((o) => o.on).forEach((o) => card.querySelector(`.pr-ov[data-k="${o.key}"]`).click());

  k = slide.start ?? 1;
  draw();
  charts.forEach((c, i) => c.meter && meters(Object.assign([], { [i]: c.meter })));
  say(slide.intro || 'Press play, or step through one candle at a time.');
}

export const PRICE_REPLAY_RENDERERS = { price_replay: renderPriceReplay };
