/**
 * icc-walk.js — A Girl & Her Futures™
 * Phase 5: the Dayli ICC walk-through, one clear step at a time.
 *
 *   { type: 'icc_walk', kicker, headline, line, scenario: 'bull-tight' | 'bull-spread' | 'bear-tight' | 'bear-spread',
 *     steps?: ['pil4', 'level1', 'pil1', 'I', 'C', 'C2', 'R'], cta }
 *
 * 4H: mark the 4H PIL.  1H: mark the level price keeps reacting at.
 * 1M: mark the PIL, then press Next candle and tap each step the moment its
 * candle CLOSES past the PIL: Indication, Correction, Continuation, then the
 * first retest. Every mark stays on the timeframe it was made on: switch
 * tabs and it's still there. One instruction at a time, above the chart.
 *
 * Charts and answers come from shared/icc-walk-scenarios.js
 * (tools/build-icc-walks.py), where every answer is derived from the bars.
 */
import { shell, nextBtn } from './lesson-v2.js';
import { mountSdChart } from './sd-chart.js';
import { ICC_WALKS } from './icc-walk-scenarios.js';

const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ALL = ['pil4', 'level1', 'pil1', 'I', 'C', 'C2', 'R'];
const LABEL = { pil4: '4H PIL', level1: '1H level', pil1: '1M PIL', I: 'Indication', C: 'Correction', C2: 'Continuation', R: 'Retest' };
const TF_OF = { pil4: '4H', level1: '1H', pil1: '1M', I: '1M', C: '1M', C2: '1M', R: '1M' };

export function renderIccWalk(el, slide, satisfy, helpers) {
  const sc = ICC_WALKS[slide.scenario || 'bull-tight'];
  const bull = sc.dir === 'bullish';
  const W = bull
    ? { hl: 'high', above: 'above', below: 'below', sr: 'support', dirWord: 'bullish' }
    : { hl: 'low', above: 'below', below: 'above', sr: 'resistance', dirWord: 'bearish' };
  const steps = (slide.steps || ALL).filter((s) => ALL.includes(s));
  const tfs = [...new Set(steps.map((s) => TF_OF[s]))];
  if (!tfs.includes('1M') && steps.some((s) => TF_OF[s] === '1M')) tfs.push('1M');
  const M = sc.tfs['1M'], icc = M.icc;

  const { act, right } = shell(el, slide, `
    <div class="iw">
      <div class="iw-track">${steps.map((s, i) => `<span class="iw-step" data-s="${s}"><b>${i + 1}</b>${LABEL[s]}</span>`).join('')}</div>
      <div class="iw-tabs" role="tablist">${tfs.map((t) => `<button type="button" class="iw-tab" data-tf="${t}" disabled>${t}</button>`).join('')}</div>
      <div class="iw-prompt"></div>
      <div class="iw-charts">${tfs.map((t) => `<div class="iw-chart" data-tf="${t}" hidden></div>`).join('')}</div>
      <div class="iw-play" hidden><button type="button" class="iw-next">Next candle ▸</button><span class="iw-count"></span></div>
      <div class="lw-feedback"></div>
    </div>`, '', { cls: 'v2-wide iw-wide' });
  const $ = (s) => right.querySelector(s);
  const fb = $('.lw-feedback');
  const say = (html, tone) => { fb.className = `lw-feedback show ${tone || ''}`; fb.innerHTML = html; };
  const charts = {};
  let cur = 0, tf = null;

  function chartFor(t) {
    if (charts[t]) return charts[t];
    const data = sc.tfs[t];
    const box = right.querySelector(`.iw-chart[data-tf="${t}"]`);
    box.hidden = false;
    const k = t === '1M' ? (steps.includes('pil1') || steps.includes('I') ? M.start : M.bars.length) : data.bars.length;
    charts[t] = mountSdChart(box, { bars: data.bars, dir: sc.dir }, { tf: t, k, toggle: false, minSlots: data.bars.length, maxBody: 14, symbol: 'MNQ' });
    return charts[t];
  }
  function showTf(t) {
    tf = t;
    right.querySelectorAll('.iw-chart').forEach((c) => { c.hidden = c.dataset.tf !== t; });
    right.querySelectorAll('.iw-tab').forEach((b) => b.classList.toggle('on', b.dataset.tf === t));
    chartFor(t);
  }
  right.querySelectorAll('.iw-tab').forEach((b) => b.addEventListener('click', () => showTf(b.dataset.tf)));

  // Marks that come before this slide's first step are drawn for you.
  const pre = ALL.slice(0, ALL.indexOf(steps[0]));
  function placeLevel(key) {
    if (key === 'pil4') chartFor('4H').level('pil4', { price: sc.tfs['4H'].pil, label: `4H PIL ${fmt(sc.tfs['4H'].pil)}`, tone: 'gold', at: sc.tfs['4H'].pilAt });
    if (key === 'level1') chartFor('1H').level('level1', { price: sc.tfs['1H'].level, label: `1H ${W.sr} ${fmt(sc.tfs['1H'].level)}`, tone: 'teal', at: sc.tfs['1H'].levelAt });
    if (key === 'pil1') chartFor('1M').level('pil1', { price: M.pil, label: `PIL ${fmt(M.pil)}`, tone: 'gold', at: M.pilAt });
  }
  const TAG = { I: ['I', 'purple'], C: ['C', 'pink'], C2: ['C', 'teal'], R: ['RETEST · ENTRY', 'gold'] };
  function placeTag(key) {
    const at = { I: icc.I, C: icc.C, C2: icc.C2, R: icc.R }[key];
    const [text, tone] = TAG[key];
    const ch = chartFor('1M');
    if (ch.k <= at) ch.show(at + 1);
    ch.tag(key, { at, text, tone, where: key === 'C' ? (bull ? 'below' : 'above') : (bull ? 'above' : 'below') });
  }
  pre.forEach((k) => { if (TF_OF[k] !== '1M' || k === 'pil1') { if (tfs.includes(TF_OF[k])) placeLevel(k); } else placeTag(k); });
  if (!steps.includes('pil1')) placeLevel('pil1');

  // ── What a tapped candle actually is ─────────────────────────────────
  const closesThrough = (b) => (bull ? b.c > M.pil : b.c < M.pil);
  const closesBack = (b) => (bull ? b.c < M.pil : b.c > M.pil);
  const wicksThrough = (b) => (bull ? b.h > M.pil : b.l < M.pil);
  const wicksBack = (b) => (bull ? b.l < M.pil : b.h > M.pil);
  function explain(key, i) {
    const b = M.bars[i];
    if (key === 'I') {
      if (i > icc.I) return `Price had already closed ${W.above} the PIL before this candle. The Indication is the FIRST close ${W.above} it.`;
      if (wicksThrough(b)) return `Wick only. It traded ${W.above} the PIL but closed back ${W.below} it. The Indication needs the candle to CLOSE ${W.above} the PIL.`;
      return `That candle didn’t close ${W.above} the PIL. Keep pressing Next candle.`;
    }
    if (key === 'C') {
      if (i <= icc.I) return 'The Correction comes after the Indication.';
      if (i > icc.C) return `Price had already closed back ${W.below} the PIL before this candle. The Correction is the first close back ${W.below} it.`;
      if (wicksBack(b)) return `Wick only. It dipped back ${W.below} the PIL but closed ${W.above} it. The Correction needs a CLOSE back ${W.below} the PIL.`;
      return `That candle closed ${W.above} the PIL. The Correction is a close back ${W.below} it.`;
    }
    if (key === 'C2') {
      if (i <= icc.C) return 'The Continuation comes after the Correction.';
      if (i > icc.C2) return `Price had already closed back ${W.above} the PIL before this candle. The Continuation is the first close back ${W.above} it.`;
      if (wicksThrough(b)) return `Wick only. It poked ${W.above} the PIL but closed ${W.below} it. The Continuation needs a CLOSE back ${W.above} the PIL.`;
      return `That candle closed ${W.below} the PIL. Wait for a close back ${W.above} it.`;
    }
    if (key === 'R') {
      if (i <= icc.C2) return 'The retest comes after the Continuation. Indication, Correction and Continuation come first; then you wait for price to come back.';
      if (i > icc.R) return 'Price had already come back to the PIL before this candle. The retest is the FIRST return.';
      return `Price hasn’t come back to the PIL yet on that candle. Don’t chase. Wait for it to return.`;
    }
    return 'Not that one.';
  }

  const PROMPT = {
    pil4: () => `<b>On the 4H:</b> tap the swing ${W.hl} that price broke through to make its ${W.dirWord} indication. That swing is the <b>4H PIL</b>.`,
    level1: () => `<b>On the 1H:</b> tap the ${W.sr} level price keeps reacting at.`,
    pil1: () => `<b>On the 1M:</b> tap the swing ${W.hl} the pullback came from. That’s your <b>PIL</b>.`,
    I: () => `Press <b>Next candle</b>. When a candle <b>closes ${W.above}</b> the PIL, tap it. That’s the <b>Indication</b>.`,
    C: () => `Keep going. When a candle <b>closes back ${W.below}</b> the PIL, tap it. That’s the <b>Correction</b>.`,
    C2: () => `When a candle <b>closes back ${W.above}</b> the PIL, tap it. That’s the <b>Continuation</b>.`,
    R: () => `Now wait for price to come back. Tap the <b>first candle that returns to the PIL</b>. That’s the retest, where the planned entry is.`,
  };
  const YES = {
    pil4: `That’s the 4H swing price broke through. It stays on your 4H chart.`,
    level1: `That’s where price keeps reacting. It stays on your 1H chart.`,
    pil1: `That’s the swing the pullback came from. Every step is now measured against this line.`,
    I: `The candle CLOSED ${W.above} the PIL. Indication.`,
    C: `The candle CLOSED back ${W.below} the PIL. Correction. That’s part of the model, not a problem.`,
    C2: `The candle CLOSED back ${W.above} the PIL. Continuation.`,
    R: `Price came back to the PIL after Indication, Correction and Continuation. That’s the retest, and the planned entry sits right here.`,
  };
  const WRONG_LEVEL = {
    pil4: (j) => (j === 1 ? `That ${W.hl} is too early and too small. It isn’t the swing price broke through for the indication.` : `That’s the indication’s extreme, the result of the break. The PIL is the swing that got broken.`),
    level1: (j) => (j === 1 ? `That’s a bounce ${bull ? 'high' : 'low'}, not where price keeps reacting.` : 'That’s where this pullback started. Price isn’t reacting there now.'),
    pil1: () => `That’s an earlier, smaller ${W.hl}. The PIL is the swing the current pullback came from.`,
  };

  function track() {
    right.querySelectorAll('.iw-step').forEach((e) => {
      const i = steps.indexOf(e.dataset.s);
      e.className = `iw-step${i < cur ? ' is-done' : i === cur ? ' is-now' : ''}`;
    });
    right.querySelectorAll('.iw-tab').forEach((b) => { b.disabled = !steps.slice(0, cur + 1).some((s) => TF_OF[s] === b.dataset.tf) && !pre.some((s) => TF_OF[s] === b.dataset.tf); });
  }
  function count() { const ch = charts['1M']; $('.iw-count').textContent = ch ? `1M · candle ${ch.k} of ${M.bars.length}` : ''; }

  function run() {
    track();
    const key = steps[cur];
    if (!key) return finish();
    const t = TF_OF[key];
    showTf(t);
    const ch = chartFor(t);
    $('.iw-prompt').innerHTML = `<span class="iw-n">Step ${cur + 1} of ${steps.length}</span>${PROMPT[key]()}`;
    fb.className = 'lw-feedback'; fb.innerHTML = '';
    $('.iw-play').hidden = !['I', 'C', 'C2', 'R'].includes(key);
    count();
    if (['pil4', 'level1', 'pil1'].includes(key)) {
      const d = sc.tfs[t];
      const cands = d.candidates;
      const tags = ['A', 'B', 'C'];
      cands.forEach((at, j) => ch.tag(`cand${j}`, { at, text: tags[j], tone: 'ink', where: key === 'level1' ? (j === 0 ? (bull ? 'below' : 'above') : (bull ? 'above' : 'below')) : (bull ? 'above' : 'below') }));
      ch.tappable((i) => {
        const j = cands.indexOf(i);
        const ok = j === 0;
        helpers.handleStreak?.(ok);
        if (!ok) { ch.mark(i, 'bad'); ch.flash(); setTimeout(() => ch.mark(i, null), 700); say(WRONG_LEVEL[key](j), 'bad'); return; }
        ch.tappable(null);
        cands.forEach((_, jj) => ch.tag(`cand${jj}`, null));
        placeLevel(key);
        done(key);
      }, (i) => cands.includes(i));
      return;
    }
    // 1M candle steps: tap any printed candle after the PIL.
    const answer = { I: icc.I, C: icc.C, C2: icc.C2, R: icc.R }[key];
    ch.tappable((i) => {
      if (i === answer) { ch.tappable(null); placeTag(key); done(key); return; }
      helpers.handleStreak?.(false);
      ch.mark(i, 'bad'); ch.flash(); setTimeout(() => ch.mark(i, null), 700);
      say(explain(key, i), 'bad');
    }, (i) => i > M.pilAt);
  }

  $('.iw-next').addEventListener('click', () => {
    const ch = chartFor('1M');
    if (ch.k >= M.bars.length) { say('That’s every candle. Look back at the ones that printed.', ''); return; }
    ch.show(ch.k + 1);
    count();
  });

  function done(key) {
    helpers.handleStreak?.(true);
    say(`<strong>✦ Yes.</strong> ${YES[key]}`, 'good');
    const next = steps[cur + 1];
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'v2-stepbtn iw-go';
    btn.textContent = !next ? 'Finish ✦' : TF_OF[next] !== TF_OF[key] ? `Drop to the ${TF_OF[next]} →` : 'Next step →';
    btn.addEventListener('click', () => { cur += 1; run(); });
    fb.appendChild(btn);
    $('.iw-play').hidden = true;
  }

  function finish() {
    $('.iw-prompt').innerHTML = `<span class="iw-n">Done</span>Every mark is still on its own timeframe. Tap <b>${tfs.join('</b>, <b>')}</b> to look back.`;
    $('.iw-play').hidden = true;
    fb.className = 'lw-feedback show good';
    fb.innerHTML = `<strong>✦ The full read.</strong> ${steps.includes('pil4') ? 'The 4H PIL gave the story, ' : ''}${steps.includes('level1') ? `the 1H showed where price reacts, ` : ''}and on the 1M every step was a <b>close</b> past the PIL${sc.rhythm === 'tight' ? ', here on three back-to-back candles' : ', with room between each step'}.`;
    helpers.burst?.();
    nextBtn(act, satisfy, slide.cta || 'Next →');
  }
  run();
}

export const ICC_WALK_RENDERERS = { icc_walk: renderIccWalk };
