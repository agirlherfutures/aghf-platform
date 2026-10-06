/**
 * icc.js — A Girl & Her Futures™
 *
 * Phase 5 components for READING the ICC story (Section 12) and the shared
 * ICC visual identity every Phase 5 section reuses.
 *
 * Components (exported for other sections):
 *   iccSequenceHtml / mountICCSequence   ● I  ○ C  ○ C  stage tracker
 *   iccStatusCardHtml                     TIMEFRAME · STRUCTURE · ICC STATUS · CLARITY
 *   drawICCOverlay                        I / C / C bands on a structure chart
 *   stageSelectorHtml / claritySelectorHtml
 *   supportCard                           "electric" support after repeated mistakes
 *
 * Slide types (data in lessons-data/p5-*.json):
 *   icc_unlock    the Phase 5 method-unlock welcome
 *   icc_replay    candle-by-candle replay; SHOW ICC / HIDE ICC; tracker never runs ahead of price
 *   icc_split     two-column comparison (framework vs 1M model, correction vs reversal)
 *   icc_pick      A / B / C / D mini charts: which one?
 *   icc_story     ICC Story Builder: drag labels, pick segments, mark an unlabeled chart, forced-label trap
 *   icc_nested    stacked translucent timeframe cards (ICC inside ICC)
 *   icc_layers    STRUCTURE / ICC / BOTH views, or context toggles that never remove ICC
 *   icc_classify  sort mini charts: CLEAR / DEVELOPING / UNCLEAR (or any categories)
 *   icc_read      build a full ICC read on an unmarked chart (status card fills in)
 *   icc_model     the Dayli ICC model ladder, open or locked
 *   icc_cinema    label the story, remove the labels: can you still see it?
 */

import { mountChart } from './structure-charts.js';
import { askQuestion } from './price-lab.js';
import { recordRead } from './topdown.js';
import { wrapGuide } from './guide.js';
import {
  LETTERS, letterStates, stageLines, STAGE_LABEL, CLARITY_LABEL, CLARITY_LINE,
  makeICCRead, saveICCRead, trackICC, mistakeCount, STEPS,
} from './icc-core.js';

const NS = 'http://www.w3.org/2000/svg';
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const KEYS = ['indication', 'correction', 'continuation'];
const NAME = { indication: 'Indication', correction: 'Correction', continuation: 'Continuation' };
const LETTER = { indication: 'I', correction: 'C', continuation: 'C' };

function svgEl(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => { if (v != null) n.setAttribute(k, v); });
  if (parent) parent.appendChild(n);
  return n;
}

function continueBtn(el, satisfy, label = 'Continue →') {
  if (el.querySelector('.lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', satisfy);
  el.appendChild(b);
}

function head(slide, fallback = '') {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || fallback}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}`;
}

/* ── ICCSequence ─────────────────────────────────────────────────────── */

/**
 * stage: 'waiting' | 'indication' | 'correction' | 'continuation' | 'complete' | 'unclear'
 * The final C only turns solid on 'complete': the tracker never anticipates.
 */
export function iccSequenceHtml(stage = 'waiting', { tf, compact, dir } = {}) {
  const st = letterStates(stage);
  const lines = stageLines(stage);
  const tone = (l) => (/confirmed$/i.test(l) && !/not/i.test(l) ? 'ok' : /developing/i.test(l) ? 'dev' : 'off');
  return `<div class="icc-seq${compact ? ' icc-seq-sm' : ''}" data-stage="${stage}">
    ${tf || dir ? `<div class="icc-seq-tf">${tf ? `<b>${tf}</b>` : ''}${dir ? `<span class="icc-dir icc-dir-${dir}">${dir === 'bearish' ? '↓ Bearish' : '↑ Bullish'}</span>` : ''}</div>` : ''}
    <div class="icc-seq-row">${LETTERS.map((L, i) => `${i ? '<span class="icc-seq-link"></span>' : ''}<div class="icc-node is-${st[i]}" title="${L.name}"><span class="icc-letter">${L.letter}</span><span class="icc-node-name">${L.name}</span></div>`).join('')}</div>
    ${compact ? '' : `<div class="icc-seq-lines">${lines.map((l) => `<span class="icc-line-${tone(l)}">${l}</span>`).join('')}</div>`}
  </div>`;
}

export function mountICCSequence(el, stage, opts = {}) {
  let cur = stage;
  el.innerHTML = iccSequenceHtml(stage, opts);
  return {
    get stage() { return cur; },
    set(s) {
      if (s === cur) return;
      const before = letterStates(cur);
      cur = s;
      el.innerHTML = iccSequenceHtml(s, opts);
      const after = letterStates(s);
      el.querySelectorAll('.icc-node').forEach((n, i) => { if (before[i] !== after[i]) n.classList.add('icc-pop'); });
    },
  };
}

/* ── ICCStatusCard ───────────────────────────────────────────────────── */

export function iccStatusCardHtml(read, { rows = [], title, foot } = {}) {
  const r = makeICCRead(read);
  const filled = (v) => v != null && v !== '';
  return `<div class="icc-card">
    <div class="icc-card-top"><span class="icc-card-tf">${r.timeframe}</span><span class="icc-card-title">${title || 'Market read'}</span></div>
    ${rows.map((x) => `<div class="icc-card-row"><span>${x.label}</span><b class="${filled(x.value) ? '' : 'is-empty'}">${filled(x.value) ? x.value : '·'}</b></div>`).join('')}
    <div class="icc-card-row icc-card-status"><span>${r.timeframe} ICC status</span><b class="icc-status icc-st-${read.stage ? r.stage : 'none'}">${read.stage ? `<i></i>${STAGE_LABEL[r.stage]}` : '·'}</b></div>
    <div class="icc-card-row"><span>Clarity</span><b class="${read.clarity ? `icc-clar icc-clar-${r.clarity}` : 'is-empty'}">${read.clarity ? CLARITY_LABEL[r.clarity] : '·'}</b></div>
    ${foot ? `<div class="icc-card-foot">${foot}</div>` : ''}
  </div>`;
}

/* ── Selectors ───────────────────────────────────────────────────────── */

export function stageSelectorHtml(choices = ['waiting', 'indication', 'correction', 'continuation', 'unclear']) {
  return `<div class="icc-pick-row" role="group" aria-label="ICC stage">${choices.map((s) => `<button type="button" class="icc-chip" data-v="${s}">${STAGE_LABEL[s]}</button>`).join('')}</div>`;
}
export function claritySelectorHtml() {
  return `<div class="icc-pick-row" role="group" aria-label="ICC clarity">${['clear', 'developing', 'unclear'].map((c) => `<button type="button" class="icc-chip icc-chip-${c}" data-v="${c}"><b>${CLARITY_LABEL[c]}</b><small>${CLARITY_LINE[c]}</small></button>`).join('')}</div>`;
}

/* ── ICCChartOverlay: bands over swing segments ─────────────────────── */

/**
 * segments: [{ key: 'indication' | 'correction' | 'continuation', from, to }]
 * (swing indexes). Returns { show(keys, devKey), hide(), xRange(key) }.
 */
export function drawICCOverlay(chart, segments, { dir = 'bullish' } = {}) {
  const layer = svgEl('g', { class: 'icc-ov' });
  chart.svg.insertBefore(layer, chart.overlayLayer);
  const tags = svgEl('g', { class: 'icc-ov-tags' }, chart.svg);
  const groups = {};
  segments.forEach((sg) => {
    const pts = chart.swings.slice(sg.from, sg.to + 1);
    const x1 = pts[0][0], x2 = pts[pts.length - 1][0];
    const ys = pts.map((p) => p[1]);
    const top = Math.min(...ys) - 16, bot = Math.max(...ys) + 16;
    const g = svgEl('g', { class: `icc-band icc-band-${sg.key}`, 'data-k': sg.key }, layer);
    svgEl('rect', { x: Math.min(x1, x2), y: top, width: Math.abs(x2 - x1), height: bot - top, rx: 8 }, g);
    const tg = svgEl('g', { class: `icc-tag icc-tag-${sg.key}`, 'data-k': sg.key }, tags);
    const cx = (x1 + x2) / 2;
    // The tag sits on the side away from where price is heading next, so it never covers candles.
    const above = sg.key === 'correction' ? dir !== 'bearish' : dir === 'bearish';
    const ty = above ? Math.max(14, top - 4) : Math.min(306, bot + 4);
    svgEl('line', { x1: Math.min(x1, x2) + 4, x2: Math.max(x1, x2) - 4, y1: above ? top : bot, y2: above ? top : bot, class: 'icc-bracket' }, tg);
    svgEl('circle', { cx, cy: ty, r: 11 }, tg);
    const t = svgEl('text', { x: cx, y: ty + 4.5, 'text-anchor': 'middle' }, tg);
    t.textContent = LETTER[sg.key];
    const n = svgEl('text', { x: cx, y: above ? ty - 16 : ty + 25, 'text-anchor': 'middle', class: 'icc-tag-name' }, tg);
    n.textContent = (sg.label || NAME[sg.key]).toUpperCase();
    groups[sg.key] = [g, tg];
  });
  const api = {
    show(keys = KEYS, devKey = null) {
      Object.entries(groups).forEach(([k, gs]) => gs.forEach((g) => {
        const on = keys.includes(k) || k === devKey;
        g.classList.toggle('is-on', on);
        g.classList.toggle('is-dev', k === devKey && !keys.includes(k));
      }));
    },
    hide() { api.show([]); },
    layer, tags,
  };
  api.hide();
  return api;
}

/** Candle index ranges per story segment, from the chart's candle → swing-leg map. */
function segmentCandles(chart, segments) {
  const segs = chart.candleSegs || [];
  return segments.map((sg) => {
    const idx = segs.map((s, i) => (s >= sg.from && s < sg.to ? i : -1)).filter((i) => i >= 0);
    return { ...sg, first: idx.length ? Math.min(...idx) : 0, last: idx.length ? Math.max(...idx) : 0 };
  });
}

/** Stage the tracker may show after `shown` candles: complete only once continuation's candles are in. */
function stageAt(ranges, shown) {
  const r = Object.fromEntries(ranges.map((x) => [x.key, x]));
  const done = (k) => r[k] && shown > r[k].last;
  const started = (k) => r[k] && shown > r[k].first;
  if (done('continuation')) return { stage: 'complete', on: KEYS.filter((k) => r[k]), dev: null };
  if (started('continuation')) return { stage: 'continuation', on: ['indication', 'correction'], dev: 'continuation' };
  if (started('correction')) return { stage: 'correction', on: ['indication'], dev: done('correction') ? null : 'correction', corrDone: done('correction') };
  if (done('indication')) return { stage: 'indication', on: ['indication'], dev: null };
  if (started('indication')) return { stage: 'waiting', on: [], dev: 'indication' };
  return { stage: 'waiting', on: [], dev: null };
}

/* ── Electric support ────────────────────────────────────────────────── */

const SUPPORT = {
  'big-candle-indication': { text: 'You’re seeing momentum. Now ask the more important question: <strong>what did that candle actually change?</strong>', cta: 'View structure →', act: 'structure' },
  'correction-as-reversal': { text: 'You noticed the pullback. Now check whether price changed the <strong>story</strong> or simply moved back inside it.', cta: 'Compare structure →', act: 'structure' },
  'anticipated-continuation': { text: 'You know what normally comes next in the sequence. But knowing the sequence isn’t permission to <strong>predict the next candle.</strong>', cta: 'Let price play →', act: 'play' },
  'forced-icc': { text: 'You’re finding the letters. But are you finding the <strong>meaning?</strong>', cta: 'Clear vs forced →', act: 'clarity' },
  'context-as-requirement': { text: 'You’re adding context to the definition. Would the ICC behavior still exist <strong>without the sweep?</strong>', cta: 'Remove liquidity →', act: 'context' },
  'icc-as-entry': { text: 'You read the story correctly. <strong>Execution is a different question.</strong>', cta: '1M model unlocks next →', act: 'model' },
  // Section 13
  'tiny-pil': { text: 'You’re finding swings. Now find the one price actually needs to <strong>PROVE itself through.</strong>', cta: 'Show structure →', act: 'structure' },
  'wick-counted': { text: 'You’re reading where price traveled. Dayli ICC needs you to read where the candle <strong>CLOSED.</strong>', cta: 'Show closes →', act: 'closes' },
  'correction-panic': { text: 'This pullback isn’t automatically a problem. <strong>Correction is literally part of the sequence.</strong>', cta: 'Show model →', act: 'model' },
  'chased': { text: 'Your analysis may have been right. <strong>Your entry still wasn’t there.</strong>', cta: 'Replay retest rule →', act: 'retest' },
  'stale-pil': { text: 'The chart kept building while you kept waiting. Did price give you a <strong>newer structural reference?</strong>', cta: 'Reassess →', act: 'structure' },
  'forced-messy': { text: 'You’re proving you CAN label it. Now ask whether you <strong>SHOULD</strong> trade it.', cta: 'Compare clean setup →', act: 'clean' },
};

/**
 * After the same mistake twice (across the Academy), show the matching
 * support card. actions: { structure(), play(), ... } supplied by the slide.
 */
export function supportCard(container, tag, actions = {}) {
  const s = SUPPORT[tag];
  if (!s || mistakeCount(tag) < 2) return;
  if (container.querySelector(`.icc-support[data-t="${tag}"]`)) return;
  const box = document.createElement('div');
  box.className = 'icc-support';
  box.dataset.t = tag;
  box.innerHTML = `<span class="icc-support-spark">⚡</span><div><p>${s.text}</p>${actions[s.act] ? `<button type="button" class="icc-support-cta">${s.cta}</button>` : ''}</div>`;
  container.appendChild(box);
  box.querySelector('.icc-support-cta')?.addEventListener('click', () => actions[s.act]());
}

/** askQuestion with ICC tracking + support, chained onto any helpers.onPick (labs use it). */
function ask(container, q, helpers, onSolved, actions = {}) {
  const h = {
    ...helpers,
    onPick(qq, o, correct, wrongs) {
      helpers.onPick?.(qq, o, correct, wrongs);
      if (o.mistake) trackICC(o.mistake, correct);
      if (o.track) trackICC(o.track, correct);
      if (!correct && o.mistake) supportCard(container, o.mistake, actions);
    },
  };
  return askQuestion(container, q, h, onSolved);
}

/* ── icc_unlock: "You earned your way here." ───────────────────────── */

export function renderUnlock(el, slide, satisfy) {
  const fw = slide.framework || [['4H', 'READ THE ROOM'], ['1H', 'BUILD THE MAP'], ['THESIS', '']];
  const lines = slide.lines || ['You made it.', 'You know how to read the market.', 'Now I’m going to show you how I organize the story price is telling me.'];
  el.innerHTML = `<div class="lw-card icc-unlock${reduced() ? ' is-still' : ''}">
    <div class="lw-eyebrow">${slide.kicker || 'Phase 5 · The Dayli ICC Method™'}</div>
    <div class="icc-un-fw">${fw.map(([a, b], i) => `<div class="icc-un-row" style="--d:${0.2 + i * 0.35}s"><b>${a}</b><span>${b}</span><i>✓</i></div>`).join('')}</div>
    <div class="icc-un-q" style="--d:1.6s">${slide.question || 'But how does price actually move <em>through</em> the story?'}</div>
    <div class="icc-un-letters" style="--d:2.6s">${LETTERS.map((L, i) => `${i ? '<span class="icc-un-arrow">↓</span>' : ''}<div class="icc-un-l"><span>${L.letter}</span><small style="--d:${3.4 + i * 0.3}s">${L.name.toUpperCase()}</small></div>`).join('')}</div>
    <div class="icc-un-lines">${lines.map((l, i) => `<p style="--d:${4.6 + i * 0.7}s">${l}</p>`).join('')}</div>
    <div class="icc-un-mark" style="--d:${4.8 + lines.length * 0.7}s">ICC.</div>
  </div>`;
  const card = el.querySelector('.icc-unlock');
  const delay = reduced() ? 0 : (4.8 + lines.length * 0.7) * 1000 + 600;
  setTimeout(() => continueBtn(card, satisfy, slide.cta || 'Show me →'), delay);
}

/* ── icc_replay: watch the story unfold ─────────────────────────────── */

/**
 * slide = {
 *   charts: [{ label, chart, segments: [{ key, from, to }], dir, tf }]  (or chart + segments)
 *   unlabeledFirst: true   play once with no labels, ask, then SHOW ICC unlocks
 *   notice: { prompt, options }   asked after the unlabeled play
 *   tracker: true          show the ICCSequence under the chart
 *   pauses: [{ at, text, ask }]   stop when `at` candles are shown
 *   end: { text, ask, card }      after the last candle
 *   structure: [ids]       "View structure" support reveals these chart ids
 *   speed: ms per candle
 * }
 */
export function renderReplay(el, slide, satisfy, helpers = {}) {
  const charts = slide.charts || [{ chart: slide.chart, segments: slide.segments, dir: slide.dir, tf: slide.tf, label: slide.label }];
  const pauses = (slide.pauses || []).slice().sort((a, b) => a.at - b.at);
  let labeled = !slide.unlabeledFirst;
  el.innerHTML = `<div class="lw-card icc-replay">
    ${head(slide, 'See the sequence')}
    <div class="icc-rp-charts icc-n${charts.length}">${charts.map((c, i) => `<div class="icc-rp-pane">${c.label ? `<div class="icc-rp-label">${c.label}</div>` : ''}<div class="pl-chart" data-i="${i}"></div>${slide.tracker !== false ? '<div class="icc-rp-seq"></div>' : ''}</div>`).join('')}</div>
    <div class="pr-bar icc-bar">
      <button type="button" class="pr-btn" data-a="restart" aria-label="Replay">⟲ Replay</button>
      <button type="button" class="pr-btn pr-play" data-a="play">▶ Play</button>
      <button type="button" class="pr-btn" data-a="next" aria-label="Next candle">Next candle ▶|</button>
      <button type="button" class="pr-btn icc-toggle" data-a="icc" aria-pressed="${labeled}" ${labeled ? '' : 'disabled'}>${labeled ? 'Hide ICC' : 'Show ICC 🔒'}</button>
      <span class="pr-count" aria-live="polite"></span>
    </div>
    <div class="pl-caption" aria-live="polite"></div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-replay');
  const panes = charts.map((c, i) => {
    const chart = mountChart(card.querySelector(`.pl-chart[data-i="${i}"]`), { ...c.chart, showCandles: 0 }, { label: c.label || slide.title || 'ICC replay' });
    const ov = drawICCOverlay(chart, c.segments || [], { dir: c.dir });
    const ranges = segmentCandles(chart, c.segments || []);
    const seqEl = card.querySelectorAll('.icc-rp-seq')[i];
    const seq = seqEl ? mountICCSequence(seqEl, 'waiting', { tf: c.tf, dir: labeled ? c.dir : null, compact: charts.length > 1 }) : null;
    return { chart, ov, ranges, seq, seqEl, c };
  });
  const total = Math.max(...panes.map((p) => p.chart.candleCount));
  const cap = card.querySelector('.pl-caption');
  wrapGuide(cap);
  const asks = card.querySelector('.pl-asks');
  const playBtn = card.querySelector('.pr-play');
  const iccBtn = card.querySelector('[data-a="icc"]');
  const countEl = card.querySelector('.pr-count');
  const solved = new Set();
  let k = 0, timer = null, blocked = false, ended = false, firstPass = !!slide.unlabeledFirst;

  const actions = {
    structure: () => panes.forEach((p) => p.chart.reveal(slide.structure || [])),
    play: () => play(),
  };

  function paint() {
    panes.forEach((p) => {
      const n = Math.min(k, p.chart.candleCount);
      p.chart.showCandles(n, 90);
      const s = stageAt(p.ranges, n);
      if (labeled) p.ov.show(s.on, s.dev); else p.ov.hide();
      // Unlabeled pass: the tracker stays silent too.
      p.seq?.set(labeled ? s.stage : 'waiting');
    });
    countEl.textContent = `Candle ${k} / ${total}`;
  }
  // Candles shown when a story segment (on the first chart) has fully printed.
  function segEnd(key) { const r = panes[0].ranges.find((x) => x.key === key); return r ? r.last + 1 : -1; }
  function stop() { clearInterval(timer); timer = null; playBtn.textContent = ended ? '⟲ Watch again' : '▶ Play'; }
  function step() {
    if (blocked) return false;
    if (k >= total) { finish(); return false; }
    k += 1;
    paint();
    const p = pauses.find((x) => !solved.has(x) && (x.at === k || (x.seg && segEnd(x.seg) + (x.plus || 0) === k)));
    if (p) { stop(); pauseAt(p); return false; }
    if (k >= total) { finish(); return false; }
    return true;
  }
  function play() {
    if (timer) { stop(); return; }
    if (ended || k >= total) { restart(); }
    playBtn.textContent = '❚❚ Pause';
    timer = setInterval(() => { if (!step()) stop(); }, slide.speed || (reduced() ? 120 : 260));
  }
  function restart() { stop(); k = 0; ended = false; cap.classList.remove('show'); paint(); }
  function say(text) { if (!text) return; cap.innerHTML = text; cap.classList.add('show'); wrapGuide(cap); }

  function pauseAt(p) {
    blocked = true;
    say(p.text);
    const qs = p.asks || (p.ask ? [p.ask] : []);
    const resume = () => {
      solved.add(p);
      blocked = false;
      if (p.show) panes.forEach((x) => x.chart.reveal(p.show));
      if (p.after) say(p.after);
      if (p.resume !== false) setTimeout(play, p.after ? 1600 : 700);
    };
    // A caption-only pause just narrates: it never starts playback on its own.
    if (!qs.length) { solved.add(p); blocked = false; if (p.show) panes.forEach((x) => x.chart.reveal(p.show)); return; }
    const run = (j) => { if (j >= qs.length) { resume(); return; } ask(asks, qs[j], helpers, () => run(j + 1), actions); };
    run(0);
  }

  function finish() {
    stop();
    if (ended) return;
    ended = true;
    playBtn.textContent = '⟲ Watch again';
    if (firstPass) {
      firstPass = false;
      const n = slide.notice || { prompt: 'WHAT DO YOU NOTICE?', stack: true, options: [
        { label: 'It pushed, pulled back, then pushed again', correct: true, why: 'Exactly what I see too. Now watch it one more time.' },
        { label: 'It went up, so it will keep going up', feedback: 'That’s a prediction. Just describe what price did.' },
        { label: 'Nothing happened', feedback: 'Look again. Something pushed, paused and pushed.' },
      ] };
      ask(asks, n, helpers, () => {
        labeled = true;
        iccBtn.disabled = false; iccBtn.textContent = 'Hide ICC'; iccBtn.setAttribute('aria-pressed', 'true');
        panes.forEach((p) => { if (p.seqEl) p.seq = mountICCSequence(p.seqEl, 'waiting', { tf: p.c.tf, dir: p.c.dir, compact: charts.length > 1 }); });
        say(slide.replayText || 'Now watch it again. This time I’ll name each chapter.');
        setTimeout(() => { restart(); play(); }, 900);
      }, actions);
      return;
    }
    const e = slide.end || {};
    say(e.text);
    if (e.card) { const c = document.createElement('div'); c.className = 'icc-principle'; c.innerHTML = e.card; asks.appendChild(c); }
    if (e.ask && !solved.has(e)) ask(asks, e.ask, helpers, () => { solved.add(e); continueBtn(card, satisfy); }, actions);
    else continueBtn(card, satisfy);
  }

  card.querySelector('.icc-bar').addEventListener('click', (ev) => {
    const a = ev.target.closest('button')?.dataset.a;
    if (a === 'play') play();
    else if (a === 'next') { stop(); step(); }
    else if (a === 'restart') { restart(); }
    else if (a === 'icc' && !iccBtn.disabled) {
      labeled = !labeled;
      iccBtn.textContent = labeled ? 'Hide ICC' : 'Show ICC';
      iccBtn.setAttribute('aria-pressed', String(labeled));
      paint();
    }
  });
  paint();
  if (slide.intro) say(slide.intro);
}

/* ── icc_split: two columns, one big "≠" ─────────────────────────────── */

export function renderSplit(el, slide, satisfy) {
  const col = (c, side) => `<div class="icc-split-col icc-split-${side}${c.locked ? ' is-locked' : ''}">
      ${c.tag ? `<div class="icc-split-tag">${c.tag}</div>` : ''}
      <h3>${c.title}</h3>
      ${c.letters ? `<div class="icc-split-letters">${c.letters.map((x) => `<span>${x}</span>`).join('<i>→</i>')}</div>` : ''}
      ${c.items ? `<ul>${c.items.map((x) => (typeof x === 'string' ? `<li>${x}</li>` : `<li class="${x.locked ? 'is-lock' : ''}">${x.text}${x.locked ? ' <b>🔒</b>' : ''}</li>`)).join('')}</ul>` : ''}
      ${c.foot ? `<div class="icc-split-foot">${c.foot}</div>` : ''}
    </div>`;
  el.innerHTML = `<div class="lw-card icc-split">
    ${head(slide, 'Know the difference')}
    <div class="icc-split-grid">${col(slide.left, 'l')}<div class="icc-split-vs">${slide.vs || '≠'}</div>${col(slide.right, 'r')}</div>
    ${slide.principle ? `<div class="icc-principle">${slide.principle}</div>` : ''}
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-split');
  if (slide.ask) ask(card.querySelector('.pl-asks'), slide.ask, {}, () => continueBtn(card, satisfy));
  else continueBtn(card, satisfy);
}

/* ── icc_pick: which of these mini charts? ──────────────────────────── */

export function renderPick(el, slide, satisfy, helpers = {}) {
  const charts = slide.charts || [];
  el.innerHTML = `<div class="lw-card icc-pick">
    ${head(slide, 'Look closely')}
    <div class="icc-pick-grid icc-g${charts.length}">${charts.map((c, i) => `<button type="button" class="icc-mini" data-i="${i}"><span class="icc-mini-l">${c.label}</span><div class="pl-chart"></div>${c.caption ? `<small>${c.caption}</small>` : ''}</button>`).join('')}</div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-pick');
  const minis = charts.map((c, i) => mountChart(card.querySelector(`.icc-mini[data-i="${i}"] .pl-chart`), c.chart, { label: `Chart ${c.label}` }));
  const asks = card.querySelector('.pl-asks');
  const actions = { structure: () => minis.forEach((m, i) => m.reveal(charts[i].structure || [])) };
  const q = { ...slide.ask, options: slide.ask.options.map((o) => ({ ...o })) };
  const box = ask(asks, q, helpers, (o) => {
    const i = charts.findIndex((c) => c.label === o.chart);
    if (i >= 0) card.querySelector(`.icc-mini[data-i="${i}"]`).classList.add('is-win');
    minis.forEach((m, j) => m.reveal(charts[j].after || []));
    const next = () => continueBtn(card, satisfy);
    if (slide.why) ask(asks, slide.why, helpers, next, actions); else next();
  }, actions);
  // Tapping a chart is the same as tapping its answer.
  card.querySelectorAll('.icc-mini').forEach((b) => b.addEventListener('click', () => {
    const lab = charts[+b.dataset.i].label;
    const oi = q.options.findIndex((o) => o.chart === lab);
    box.querySelectorAll('.pl-opt')[oi]?.click();
  }));
}

/* ── icc_story: the Story Builder ───────────────────────────────────── */

/**
 * mode 'label'    drag I / C / C chips onto the matching movement
 * mode 'segment'  labels are fixed; tap the movement for each one, in order
 * mode 'mark'     unlabeled chart; tap the legs for I, then C, then C
 * mode 'forced'   messy chart; any label can be placed, none is meaningful.
 *                 The right answer is "I don't know yet".
 * truth: [{ key, from, to }] swing ranges; legs = every swing-to-swing move.
 */
export function renderStory(el, slide, satisfy, helpers = {}) {
  const mode = slide.mode || 'label';
  const truth = slide.segments || [];
  el.innerHTML = `<div class="lw-card icc-story icc-mode-${mode}">
    ${head(slide, 'ICC Story Builder')}
    <div class="icc-chips" role="group" aria-label="Labels"></div>
    <div class="icc-story-chart"><div class="pl-chart"></div></div>
    <div class="icc-story-tools"></div>
    <div class="pl-fb" aria-live="polite"></div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-story');
  const chart = mountChart(card.querySelector('.pl-chart'), slide.chart, { label: slide.title || 'Price story' });
  const ov = drawICCOverlay(chart, truth, { dir: slide.dir });
  const fb = card.querySelector('.pl-fb');
  const chipsEl = card.querySelector('.icc-chips');
  const tools = card.querySelector('.icc-story-tools');
  const sw = chart.swings;
  const legs = sw.slice(0, -1).map((_, i) => ({ from: i, to: i + 1 }));
  const zones = (mode === 'label' || mode === 'segment') && !slide.legs ? truth.map((t) => ({ from: t.from, to: t.to })).concat(slide.decoys || []) : legs;
  const hit = svgEl('g', { class: 'icc-hits' }, chart.svg);
  const placed = {};
  const say = (html, good) => { fb.innerHTML = html; fb.className = `pl-fb show ${good ? 'good' : 'bad'}`; };
  const truthFor = (z) => truth.find((t) => z.from >= t.from && z.to <= t.to);

  zones.forEach((z, zi) => {
    const x1 = sw[z.from][0], x2 = sw[z.to][0];
    const r = svgEl('rect', { x: Math.min(x1, x2), y: 0, width: Math.max(14, Math.abs(x2 - x1)), height: 320, class: 'icc-hit', 'data-z': zi, tabindex: 0, role: 'button', 'aria-label': `Movement ${zi + 1}` }, hit);
    r.addEventListener('click', () => onZone(zi));
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onZone(zi); } });
  });
  const tagLayer = svgEl('g', { class: 'icc-user-tags' }, chart.svg);
  function tagZone(zi, key, cls = '') {
    const z = zones[zi];
    const x = (sw[z.from][0] + sw[z.to][0]) / 2, y = Math.min(sw[z.from][1], sw[z.to][1]) - 18;
    const g = svgEl('g', { class: `icc-utag icc-tag-${key} ${cls}`, 'data-z': zi }, tagLayer);
    svgEl('circle', { cx: x, cy: Math.max(14, y), r: 12 }, g);
    const t = svgEl('text', { x, y: Math.max(14, y) + 5, 'text-anchor': 'middle' }, g);
    t.textContent = LETTER[key];
    return g;
  }
  const done = () => {
    ov.show(KEYS);
    if (slide.end?.ask) ask(card.querySelector('.pl-asks'), slide.end.ask, helpers, () => continueBtn(card, satisfy));
    else continueBtn(card, satisfy);
    if (slide.end?.text) say(slide.end.text, true);
  };

  /* label: pick a chip, then a zone (drag works too) */
  let armed = null;
  if (mode === 'label' || mode === 'forced') {
    const keys = slide.labels || KEYS;
    chipsEl.innerHTML = keys.map((k, i) => `<button type="button" class="icc-dchip icc-dchip-${k}" data-k="${k}" data-n="${i}"><span>${LETTER[k]}</span>${NAME[k]}</button>`).join('');
    chipsEl.querySelectorAll('.icc-dchip').forEach((b) => {
      b.addEventListener('click', () => { if (b.disabled) return; armed = b; chipsEl.querySelectorAll('.icc-dchip').forEach((x) => x.classList.toggle('is-armed', x === b)); card.classList.add('is-arming'); });
      b.addEventListener('pointerdown', (e) => startDrag(e, b));
    });
  }
  function startDrag(e, b) {
    if (b.disabled || e.pointerType === 'mouse' && e.button !== 0) return;
    const ghost = b.cloneNode(true);
    ghost.classList.add('icc-ghost');
    document.body.appendChild(ghost);
    const move = (ev) => { ghost.style.left = `${ev.clientX}px`; ghost.style.top = `${ev.clientY}px`; };
    move(e);
    let moved = false;
    const mv = (ev) => { moved = true; move(ev); };
    const up = (ev) => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      ghost.remove();
      if (!moved) return;
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.icc-hit');
      if (target) { armed = b; onZone(+target.dataset.z); }
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }

  /* segment / mark: one slot at a time */
  let slot = 0;
  const order = slide.order || KEYS;
  if (mode === 'segment' || mode === 'mark') {
    chipsEl.innerHTML = order.map((k, i) => `<div class="icc-slot${i === 0 ? ' is-cur' : ''}" data-i="${i}"><span>${LETTER[k]}</span>${NAME[k]}</div>`).join('');
    say(mode === 'mark' ? `Tap the move that is the <strong>${NAME[order[0]]}</strong>.` : `Which movement is the <strong>${NAME[order[0]]}</strong>?`, true);
  }
  if (mode === 'forced') {
    tools.innerHTML = `<button type="button" class="icc-idk">🤷🏾‍♀️ I don’t know yet</button>`;
    tools.querySelector('.icc-idk').addEventListener('click', () => {
      trackICC('icc-clarity', true);
      chipsEl.querySelectorAll('.icc-dchip').forEach((b) => { b.disabled = true; });
      say(slide.idk || '✦ <strong>Correct.</strong> Price isn’t giving a clean enough story yet. Sometimes the best markup is less markup.', true);
      card.querySelectorAll('.icc-utag').forEach((g) => g.remove());
      tools.innerHTML = '';
      done();
    });
  }

  function onZone(zi) {
    const z = zones[zi], t = truthFor(z);
    if (mode === 'forced') {
      if (!armed) { say('Pick a label first, then place it.', false); return; }
      const key = armed.dataset.k;
      const g = tagZone(zi, key, 'is-forced');
      trackICC('forced-label', false);
      armed.classList.remove('is-armed'); armed = null; card.classList.remove('is-arming');
      say(`You <strong>CAN</strong> put the label there. But what makes that movement <strong>meaningful?</strong> <button type="button" class="icc-rm">Remove label →</button>`, false);
      fb.querySelector('.icc-rm').addEventListener('click', () => { g.remove(); say('Better. Look for meaning, not just movement.', true); });
      supportCard(card.querySelector('.pl-asks'), 'forced-icc', {});
      return;
    }
    if (mode === 'label') {
      if (!armed) { say('Pick a label first: tap it (or drag it) onto the movement.', false); return; }
      const key = armed.dataset.k;
      if (t && t.key === key && !placed[key]) {
        placed[key] = true;
        tagZone(zi, key);
        armed.disabled = true; armed.classList.remove('is-armed'); armed = null; card.classList.remove('is-arming');
        helpers.handleStreak?.(true);
        trackICC(`story-${key}`, true);
        say(`✦ ${slideWhy(key)}`, true);
        if (KEYS.every((k) => placed[k] || !truth.some((x) => x.key === k))) done();
      } else {
        helpers.handleStreak?.(false);
        const tag = key === 'indication' ? 'big-candle-indication' : key === 'correction' ? 'correction-as-reversal' : 'anticipated-continuation';
        trackICC(tag, false);
        chart.flash();
        say(t ? `That movement is the <strong>${NAME[t.key]}</strong>. ${slideWhy(t.key)}` : 'That movement isn’t one of the three chapters. Look for what price proved, tested and supported.', false);
      }
      return;
    }
    // segment / mark
    const want = order[slot];
    if (t && t.key === want) {
      tagZone(zi, want);
      helpers.handleStreak?.(true);
      trackICC(`story-${want}`, true);
      chipsEl.querySelectorAll('.icc-slot')[slot].classList.replace('is-cur', 'is-done');
      slot += 1;
      if (slot >= order.length) { say('✦ Indication. Correction. Continuation. <strong>That’s the story.</strong>', true); done(); return; }
      chipsEl.querySelectorAll('.icc-slot')[slot].classList.add('is-cur');
      say(`✦ Yes. Now: which movement is the <strong>${NAME[order[slot]]}</strong>?`, true);
    } else {
      helpers.handleStreak?.(false);
      chart.flash();
      trackICC(`story-${want}`, false);
      say(`Not that one. ${slideWhy(want)}`, false);
    }
  }
  function slideWhy(key) {
    return (slide.why || {})[key] || {
      indication: 'Indication: price provided meaningful directional information, beyond a structural reference.',
      correction: 'Correction: price moved back against that move, while the supporting structure held.',
      continuation: 'Continuation: price provided evidence the original direction is trying to resume.',
    }[key];
  }
}

/* ── icc_nested: ICC inside ICC ──────────────────────────────────────── */

export function renderNested(el, slide, satisfy, helpers = {}) {
  const tfs = slide.tfs || [];
  el.innerHTML = `<div class="lw-card icc-nested">
    ${head(slide, 'ICC inside ICC')}
    <div class="icc-nest-tabs" role="tablist">${tfs.map((t, i) => `<button type="button" role="tab" class="icc-nest-tab" data-i="${i}" aria-selected="${i === 0}"><b>${t.tf}</b><small>${t.role}</small></button>`).join('')}</div>
    <div class="icc-nest-stack">${tfs.map((t, i) => `<div class="icc-nest-card" data-i="${i}">
        <div class="icc-nest-head"><b>${t.tf}</b><span>${t.role}</span></div>
        <div class="pl-chart"></div>
        <div class="icc-nest-seq"></div>
        ${t.note ? `<p class="icc-nest-note">${t.note}</p>` : ''}
      </div>`).join('')}</div>
    <button type="button" class="icc-zoom-btn">${slide.zoomLabel || 'Zoom into the correction ↓'}</button>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-nested');
  const cards = [...card.querySelectorAll('.icc-nest-card')];
  const seen = new Set([0]);
  tfs.forEach((t, i) => {
    const c = cards[i];
    const chart = mountChart(c.querySelector('.pl-chart'), t.chart, { label: `${t.tf} chart` });
    if (t.segments) drawICCOverlay(chart, t.segments, { dir: t.dir }).show(t.show || KEYS.filter((k) => t.segments.some((s) => s.key === k)));
    c.querySelector('.icc-nest-seq').innerHTML = iccSequenceHtml(t.stage || 'waiting', { tf: t.tf, dir: t.dir, compact: true });
  });
  let cur = 0;
  function show(i) {
    cur = i;
    seen.add(i);
    cards.forEach((c, j) => {
      c.classList.toggle('is-front', j === i);
      c.classList.toggle('is-behind', j < i);
      c.classList.toggle('is-ahead', j > i);
      c.style.setProperty('--depth', String(i - j));
    });
    card.querySelectorAll('.icc-nest-tab').forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
    const z = card.querySelector('.icc-zoom-btn');
    z.textContent = i < tfs.length - 1 ? (tfs[i].zoomLabel || slide.zoomLabel || 'Zoom into the correction ↓') : '✓ Same market. Different scale.';
    z.disabled = i >= tfs.length - 1;
    if (seen.size === tfs.length && !card.dataset.asked) { card.dataset.asked = '1'; afterAll(); }
  }
  function afterAll() {
    const qs = slide.asks || [];
    const asks = card.querySelector('.pl-asks');
    const run = (j) => { if (j >= qs.length) { if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; asks.appendChild(p); } continueBtn(card, satisfy); return; } ask(asks, qs[j], helpers, () => run(j + 1)); };
    run(0);
  }
  card.querySelectorAll('.icc-nest-tab').forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
  card.querySelector('.icc-zoom-btn').addEventListener('click', () => { if (cur < tfs.length - 1) show(cur + 1); });
  cards.forEach((c, j) => c.addEventListener('click', () => { if (j !== cur) show(j); }));
  show(0);
}

/* ── icc_layers: STRUCTURE / ICC / BOTH, or context toggles ─────────── */

export function renderLayers(el, slide, satisfy, helpers = {}) {
  const mode = slide.mode || 'views';
  el.innerHTML = `<div class="lw-card icc-layers">
    ${head(slide, mode === 'views' ? 'Two lenses' : 'Context toggle')}
    <div class="icc-lay-btns" role="group"></div>
    <div class="icc-lay-wrap"><div class="pl-chart"></div><div class="icc-lay-side"></div></div>
    <div class="icc-lay-cap" aria-live="polite"></div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-layers');
  const chart = mountChart(card.querySelector('.pl-chart'), slide.chart, { label: slide.title || 'Chart' });
  const ov = drawICCOverlay(chart, slide.segments || [], { dir: slide.dir });
  const btns = card.querySelector('.icc-lay-btns');
  const side = card.querySelector('.icc-lay-side');
  const cap = card.querySelector('.icc-lay-cap');
  const asks = card.querySelector('.pl-asks');
  const iccKeys = (slide.segments || []).map((s) => s.key);
  side.innerHTML = iccSequenceHtml(slide.stage || 'complete', { tf: slide.tf, dir: slide.dir, compact: true });
  const finish = () => {
    if (card.dataset.done) return;
    card.dataset.done = '1';
    const qs = slide.asks || [];
    const run = (j) => { if (j >= qs.length) { if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; asks.appendChild(p); } continueBtn(card, satisfy); return; } ask(asks, qs[j], helpers, () => run(j + 1)); };
    run(0);
  };

  if (mode === 'views') {
    const views = slide.views || [
      { key: 'structure', label: 'Structure', cap: '<b>STRUCTURE ASKS:</b> what is price building?' },
      { key: 'icc', label: 'ICC', cap: '<b>ICC ASKS:</b> where is price in the directional sequence?' },
      { key: 'both', label: 'Both', cap: '<b>BOTH:</b> ICC describes the behavior happening inside the structure.' },
    ];
    const seen = new Set();
    btns.innerHTML = views.map((v) => `<button type="button" class="icc-lay-btn" data-k="${v.key}">${v.label}</button>`).join('');
    const set = (key) => {
      seen.add(key);
      btns.querySelectorAll('.icc-lay-btn').forEach((b) => b.classList.toggle('is-on', b.dataset.k === key));
      const st = slide.structureIds || [];
      if (key === 'icc') { chart.hide(st); ov.show(iccKeys); chart.dim('@candles', false); }
      else if (key === 'structure') { chart.reveal(st); ov.hide(); }
      else { chart.reveal(st); ov.show(iccKeys); }
      cap.innerHTML = views.find((v) => v.key === key).cap;
      side.style.visibility = key === 'structure' ? 'hidden' : 'visible';
      if (seen.size === views.length) finish();
    };
    btns.addEventListener('click', (e) => { const b = e.target.closest('.icc-lay-btn'); if (b) set(b.dataset.k); });
    set(views[0].key);
    return;
  }

  // Context toggles: every layer can go; ICC stays.
  const toggles = slide.toggles || [];
  const off = new Set();
  btns.innerHTML = toggles.map((t) => `<button type="button" class="icc-lay-btn is-on" data-k="${t.key}" aria-pressed="true">${t.label} <i>on</i></button>`).join('');
  ov.show(iccKeys);
  toggles.forEach((t) => chart.reveal(t.ids || []));
  cap.innerHTML = slide.startCap || 'Turn each layer off. Watch what happens to the ICC story.';
  btns.addEventListener('click', (e) => {
    const b = e.target.closest('.icc-lay-btn');
    if (!b) return;
    const t = toggles.find((x) => x.key === b.dataset.k);
    const on = !b.classList.contains('is-on');
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('i').textContent = on ? 'on' : 'off';
    if (on) { chart.reveal(t.ids || []); off.delete(t.key); } else { chart.hide(t.ids || []); off.add(t.key); }
    side.querySelector('.icc-seq')?.classList.remove('icc-still'); void side.offsetWidth; side.querySelector('.icc-seq')?.classList.add('icc-still');
    cap.innerHTML = on ? `${t.label} back on.` : `${t.label} off. <b>Does ICC disappear? No.</b> ${t.offCap || ''}`;
    if (off.size === toggles.length) { cap.innerHTML = slide.allOffCap || '<b>Every context layer is off. The ICC story is still there.</b> Context can support understanding without becoming another box to check.'; finish(); }
  });
}

/* ── icc_classify: sort mini charts into categories ─────────────────── */

export function renderClassify(el, slide, satisfy, helpers = {}) {
  const items = slide.items || [];
  const options = slide.options || [{ key: 'clear', label: 'Clear' }, { key: 'developing', label: 'Developing' }, { key: 'unclear', label: 'Unclear' }];
  el.innerHTML = `<div class="lw-card icc-classify">
    ${head(slide, 'Classify')}
    <div class="icc-cls-grid">${items.map((it, i) => `<div class="icc-cls" data-i="${i}">
        <div class="icc-cls-top"><b>${it.label}</b>${it.caption ? `<small>${it.caption}</small>` : ''}</div>
        <div class="pl-chart"></div>
        <div class="icc-cls-opts">${options.map((o) => `<button type="button" class="icc-chip" data-v="${o.key}">${o.label}</button>`).join('')}</div>
        <div class="icc-cls-fb" aria-live="polite"></div>
      </div>`).join('')}</div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-classify');
  let right = 0;
  items.forEach((it, i) => {
    const box = card.querySelector(`.icc-cls[data-i="${i}"]`);
    const chart = mountChart(box.querySelector('.pl-chart'), it.chart, { label: it.label });
    if (it.segments) drawICCOverlay(chart, it.segments, { dir: it.dir }).show(it.show || []);
    const fb = box.querySelector('.icc-cls-fb');
    box.querySelectorAll('.icc-chip').forEach((b) => b.addEventListener('click', () => {
      if (box.dataset.done || b.disabled) return;
      const ok = b.dataset.v === it.answer;
      helpers.handleStreak?.(ok);
      helpers.onPick?.({ prompt: it.label }, { label: b.textContent }, ok);
      trackICC(slide.track || 'icc-clarity', ok);
      if (!ok && it.mistake) trackICC(it.mistake, false);
      if (ok) {
        box.dataset.done = '1';
        b.classList.add('ok');
        box.querySelectorAll('.icc-chip').forEach((x) => { if (x !== b) x.disabled = true; });
        fb.innerHTML = `✦ ${it.why || ''}`; fb.className = 'icc-cls-fb good';
        right += 1;
        if (right === items.length) {
          if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; card.querySelector('.pl-asks').appendChild(p); }
          continueBtn(card, satisfy);
        }
      } else {
        b.classList.add('no'); b.disabled = true;
        fb.innerHTML = it.miss || 'Look again. What can you explain without arguing with the chart?';
        fb.className = 'icc-cls-fb bad';
      }
    }));
  });
}

/* ── icc_read: build a full ICC read on an unmarked chart ───────────── */

/**
 * steps: [{ kind: 'ask', ask, set: { field: value } }
 *         { kind: 'tap', prompt, answer: [legIndexes], set }
 *         { kind: 'stage', answer, prompt }
 *         { kind: 'clarity', answer, prompt }]
 * rows:  [{ key, label }] lines on the read card (filled by step.set)
 */
export function renderRead(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card icc-read">
    ${head(slide, 'Where are we in the story?')}
    <div class="icc-read-grid"><div class="icc-read-chart"><div class="pl-chart"></div></div><div class="icc-read-card"></div></div>
    <div class="icc-read-step"></div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-read');
  const chart = mountChart(card.querySelector('.pl-chart'), slide.chart, { label: slide.title || 'Unmarked chart' });
  const ov = drawICCOverlay(chart, slide.segments || [], { dir: slide.dir });
  const read = { timeframe: slide.tf || '4H', direction: null };
  const vals = {};
  const rowsSpec = slide.rows || [];
  const cardEl = card.querySelector('.icc-read-card');
  const draw = () => {
    cardEl.innerHTML = iccStatusCardHtml(read, { title: 'Your read', rows: rowsSpec.map((r) => ({ label: r.label, value: vals[r.key] })), foot: slide.foot });
  };
  draw();
  const stepEl = card.querySelector('.icc-read-step');
  const asks = card.querySelector('.pl-asks');
  const steps = slide.steps || [];
  const sw = chart.swings;
  const legHit = svgEl('g', { class: 'icc-hits' }, chart.svg);
  const apply = (set = {}) => {
    Object.entries(set).forEach(([k, v]) => {
      if (k in read || ['stage', 'clarity', 'direction', 'indicationReference', 'correctionState', 'continuationState'].includes(k)) read[k] = v;
      vals[k] = v;
    });
    draw();
  };
  const revealOv = () => { const keys = (slide.segments || []).map((s) => s.key).filter((k) => vals[`saw_${k}`]); ov.show(keys); };
  function run(j) {
    stepEl.innerHTML = `<div class="icc-read-n">${Math.min(j + 1, steps.length)} / ${steps.length}</div>`;
    if (j >= steps.length) { final(); return; }
    const s = steps[j];
    const next = () => { apply(s.set); if (s.reveal) { vals[`saw_${s.reveal}`] = true; revealOv(); } setTimeout(() => run(j + 1), 350); };
    if (s.kind === 'ask') { ask(asks, s.ask, helpers, () => next()); return; }
    if (s.kind === 'stage' || s.kind === 'clarity') {
      const box = document.createElement('div');
      box.className = 'pl-ask';
      box.innerHTML = `<div class="pl-q">${s.prompt || (s.kind === 'stage' ? 'Current ICC stage?' : 'ICC clarity?')}</div>${s.kind === 'stage' ? stageSelectorHtml(s.choices) : claritySelectorHtml()}<div class="pl-fb" aria-live="polite"></div>`;
      asks.appendChild(box);
      const fb = box.querySelector('.pl-fb');
      box.querySelectorAll('.icc-chip').forEach((b) => b.addEventListener('click', () => {
        if (box.dataset.done || b.disabled) return;
        const ok = b.dataset.v === s.answer;
        helpers.handleStreak?.(ok);
        helpers.onPick?.({ prompt: box.querySelector('.pl-q').textContent }, { label: b.textContent }, ok);
        trackICC(s.kind === 'stage' ? 'htf-icc-stage' : 'icc-clarity', ok);
        if (ok) {
          box.dataset.done = '1'; b.classList.add('ok');
          box.querySelectorAll('.icc-chip').forEach((x) => { if (x !== b) x.disabled = true; });
          fb.innerHTML = `✦ ${s.why || ''}`; fb.className = 'pl-fb show good';
          read[s.kind] = s.answer; vals[s.kind] = s.answer; draw();
          next();
        } else { b.classList.add('no'); b.disabled = true; fb.innerHTML = s.miss || 'Not quite. Read what price has actually done so far.'; fb.className = 'pl-fb show bad'; }
      }));
      return;
    }
    if (s.kind === 'tap') {
      const box = document.createElement('div');
      box.className = 'pl-ask';
      box.innerHTML = `<div class="pl-q">${s.prompt}</div><div class="pl-fb" aria-live="polite"></div>`;
      asks.appendChild(box);
      const fb = box.querySelector('.pl-fb');
      legHit.innerHTML = '';
      card.classList.add('is-arming');
      sw.slice(0, -1).forEach((_, li) => {
        const x1 = sw[li][0], x2 = sw[li + 1][0];
        const r = svgEl('rect', { x: Math.min(x1, x2), y: 0, width: Math.max(14, Math.abs(x2 - x1)), height: 320, class: 'icc-hit', tabindex: 0, role: 'button', 'aria-label': `Move ${li + 1}` }, legHit);
        const pick = () => {
          if (box.dataset.done) return;
          const ok = s.answer.includes(li);
          helpers.handleStreak?.(ok);
          helpers.onPick?.({ prompt: s.prompt }, { label: `Move ${li + 1}` }, ok);
          trackICC(s.track || 'meaningful-indication', ok);
          if (ok) { box.dataset.done = '1'; legHit.innerHTML = ''; card.classList.remove('is-arming'); fb.innerHTML = `✦ ${s.why || ''}`; fb.className = 'pl-fb show good'; next(); }
          else { chart.flash(); if (s.mistake) { trackICC(s.mistake, false); supportCard(asks, s.mistake, { structure: () => chart.reveal(slide.structure || []) }); } fb.innerHTML = s.miss || 'Not that move. What did price actually prove?'; fb.className = 'pl-fb show bad'; }
        };
        r.addEventListener('click', pick);
        r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    }
  }
  function final() {
    if (slide.save) saveICCRead(slide.save, makeICCRead(read));
    // Hand the read to the TopDownWorkspace (Section 14 builds on it): each timeframe keeps its own ICC state.
    if (slide.handoff && read.stage) {
      const tf = (read.timeframe || '4H').toLowerCase();
      recordRead(`${tf}.icc`, read.stage);
      if (tf === '4h' && read.clarity) recordRead('4h.iccClarity', read.clarity);
    }
    const f = slide.final;
    const end = () => { if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; asks.appendChild(p); } continueBtn(card, satisfy); };
    if (f) ask(asks, f, helpers, end, { model: () => {} }); else end();
  }
  run(0);
}

/* ── icc_model: the Dayli ICC model ladder ──────────────────────────── */

export function iccModelHtml({ locked = false, answers = {}, questions } = {}) {
  return `<div class="icc-model${locked ? ' is-locked' : ''}">${STEPS.map((s, i) => `
    ${i ? '<div class="icc-model-arrow">↓</div>' : ''}
    <div class="icc-model-step" style="--d:${0.25 + i * 0.35}s"><span class="icc-model-k">${s.short === 'C' ? 'C' : s.short}</span>
      <div><b>${s.name.toUpperCase()}</b><em>“${(questions || {})[s.key] || s.q}”</em>${locked ? '<small>🔒 Unlocks in the 1M model</small>' : answers[s.key] ? `<small>${answers[s.key]}</small>` : ''}</div></div>`).join('')}</div>`;
}

export function renderModel(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card icc-model-card${reduced() ? ' is-still' : ''}">
    ${head(slide, 'The model')}
    ${iccModelHtml({ locked: slide.locked, answers: slide.answers, questions: slide.questions })}
    ${slide.principle ? `<div class="icc-principle">${slide.principle}</div>` : ''}
    <div class="pl-asks"></div>
  </div>`;
  const card = el.querySelector('.icc-model-card');
  if (slide.ask) ask(card.querySelector('.pl-asks'), slide.ask, helpers, () => continueBtn(card, satisfy, slide.cta));
  else setTimeout(() => continueBtn(card, satisfy, slide.cta), reduced() ? 0 : 2400);
}

/* ── icc_cinema: label the story, then take the labels away ─────────── */

export function renderCinema(el, slide, satisfy) {
  el.innerHTML = `<div class="lw-card icc-cinema${reduced() ? ' is-still' : ''}">
    <div class="pl-chart"></div>
    <div class="icc-cine-q" aria-live="polite"></div>
    <div class="icc-cine-mark">${slide.mark || '✦ YOU CAN READ THE ICC STORY.'}</div>
  </div>`;
  const card = el.querySelector('.icc-cinema');
  const chart = mountChart(card.querySelector('.pl-chart'), slide.chart, { label: 'The ICC story' });
  const ov = drawICCOverlay(chart, slide.segments || [], { dir: slide.dir });
  const q = card.querySelector('.icc-cine-q');
  const keys = (slide.segments || []).map((s) => s.key);
  const t = reduced() ? 0 : 1;
  keys.forEach((k, i) => setTimeout(() => ov.show(keys.slice(0, i + 1)), t * (600 + i * 900)));
  setTimeout(() => { ov.hide(); q.textContent = slide.question || 'Can you still see the story?'; q.classList.add('show'); }, t * (600 + keys.length * 900 + 1400));
  setTimeout(() => { card.classList.add('is-done'); if (satisfy) continueBtn(card, satisfy, slide.cta || 'Continue →'); }, t * (600 + keys.length * 900 + 3600));
}


/* ── icc_order: put the chapters in order (wrong taps don't count) ─── */

export function renderOrder(el, slide, satisfy, helpers = {}) {
  const items = slide.items || KEYS.map((k) => ({ key: k, label: NAME[k], desc: '' }));
  const order = slide.order || items.map((i) => i.key);
  const shown = slide.shuffle || [2, 0, 1].map((i) => items[i]).filter(Boolean);
  el.innerHTML = `<div class="lw-card icc-order">
    ${head(slide, 'Put it in order')}
    <div class="icc-order-slots">${order.map((_, i) => `<div class="icc-oslot" data-i="${i}"><span>${i + 1}</span></div>`).join('<i class="icc-oarrow">→</i>')}</div>
    <div class="icc-order-cards">${shown.map((it) => `<button type="button" class="icc-ocard" data-k="${it.key}"><b>${LETTER[it.key] || ''}</b>${it.label}${it.desc ? `<small>${it.desc}</small>` : ''}</button>`).join('')}</div>
    <div class="pl-fb" aria-live="polite"></div>
  </div>`;
  const card = el.querySelector('.icc-order');
  const fb = card.querySelector('.pl-fb');
  let n = 0;
  card.querySelectorAll('.icc-ocard').forEach((b) => b.addEventListener('click', () => {
    if (b.disabled) return;
    const ok = b.dataset.k === order[n];
    helpers.handleStreak?.(ok);
    helpers.onPick?.({ prompt: slide.title || 'order' }, { label: b.textContent }, ok);
    trackICC('icc-definition', ok);
    if (!ok) { b.classList.remove('icc-shake'); void b.offsetWidth; b.classList.add('icc-shake'); fb.innerHTML = slide.miss || 'Not yet. What has to happen first?'; fb.className = 'pl-fb show bad'; return; }
    const slot = card.querySelector(`.icc-oslot[data-i="${n}"]`);
    slot.innerHTML = `<b>${LETTER[b.dataset.k] || ''}</b>${b.dataset.k ? NAME[b.dataset.k] || b.textContent : b.textContent}`;
    slot.classList.add('is-on');
    b.disabled = true;
    n += 1;
    fb.className = 'pl-fb';
    if (n === order.length) { fb.innerHTML = slide.done || '✦ Indication → Correction → Continuation.'; fb.className = 'pl-fb show good'; continueBtn(card, satisfy); }
  }));
}

export const ICC_RENDERERS = {
  icc_order: renderOrder,
  icc_unlock: renderUnlock,
  icc_replay: renderReplay,
  icc_split: renderSplit,
  icc_pick: renderPick,
  icc_story: renderStory,
  icc_nested: renderNested,
  icc_layers: renderLayers,
  icc_classify: renderClassify,
  icc_read: renderRead,
  icc_model: renderModel,
  icc_cinema: renderCinema,
};
