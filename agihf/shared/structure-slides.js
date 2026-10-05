/**
 * structure-slides.js — A Girl & Her Futures™
 *
 * Slide types for the market-structure lessons, built on the animated
 * charts in structure-charts.js. Registered into lesson-slides-engine.js
 * and reused as levels in the section games (section-engine.js).
 *
 *   structure_story  a chart that builds as you tap Next. Steps can move
 *                    price forward (to), zoom, switch views, draw a
 *                    comparison and stop to ask a question (ask) before
 *                    price continues ("NEXT MOVE →").
 *   swing_tap        tap the right swing point(s) on a chart
 *   label_swings     drag HH / HL / LH / LL labels onto swing points
 *   flash_sort       a fast run of charts: sort each one, with a streak
 *   chart_check      a chart plus a multiple-choice question; can fix a
 *                    wrong label and draw the comparison that proves it
 *                    ("catch the mistake")
 *
 * Any of them can take `views`: a toggle row that switches what the chart
 * shows (Candles / Structure, All swings / Relevant swings, External /
 * Internal / Both). A view is { key, label, text, show, hide, dim }.
 *
 * Every renderer has the slide-engine signature (el, slide, satisfy, helpers).
 */

import { wireRetryOptions } from './lesson-engine.js';
import { mountChart, swingKind } from './structure-charts.js';

const TONE_FOR = { HH: 'up', HL: 'up', LH: 'down', LL: 'down' };
const KIND_FOR = { HH: 'high', LH: 'high', HL: 'low', LL: 'low' };

function cont(el, satisfy, label = 'Continue →') {
  if (el.querySelector(':scope > .lw-continue-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lw-continue-btn';
  btn.textContent = label;
  btn.addEventListener('click', satisfy);
  el.appendChild(btn);
}

function nextRoundBtn(card, label, go) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', () => { b.remove(); go(); });
  card.appendChild(b);
}

function head(slide) {
  return `
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Structure'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p>${slide.body}</p>` : ''}`;
}

function feedback(fb, html, good) {
  fb.innerHTML = html;
  fb.className = `lw-feedback show ${good ? 'good' : 'bad'}`;
}

/* ── View toggles ───────────────────────────────────────────────────── */

export function mountViews(before, chart, views, initial) {
  const bar = document.createElement('div');
  bar.className = 'ss-views';
  bar.innerHTML = `<div class="ss-views-row" role="tablist">${views.map((v) => `<button type="button" class="ss-view" data-k="${v.key}" role="tab">${v.label}</button>`).join('')}</div><div class="ss-view-text"></div>`;
  before.parentNode.insertBefore(bar, before);
  const text = bar.querySelector('.ss-view-text');
  const allDim = [...new Set(views.flatMap((v) => v.dim || []))];
  function set(key) {
    const v = views.find((x) => x.key === key) || views[0];
    chart.dim(allDim, false);
    chart.reveal(v.show);
    chart.hide(v.hide);
    chart.dim(v.dim);
    bar.querySelectorAll('.ss-view').forEach((b) => { const on = b.dataset.k === v.key; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    text.innerHTML = v.text || '';
    text.classList.toggle('show', !!v.text);
  }
  bar.querySelectorAll('.ss-view').forEach((b) => b.addEventListener('click', () => set(b.dataset.k)));
  set(initial || views[0].key);
  return { set, el: bar };
}

/* ── Structure story: the chart builds as you step through ─────────── */

export function renderStructureStory(el, slide, satisfy, helpers) {
  const steps = slide.steps || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}<div class="ss-chart"></div>
    <div class="ss-caption" aria-live="polite"></div><div class="ss-ask"></div>
    <div class="ss-stepper"><div class="ss-pips"></div><button type="button" class="ss-next">Show me →</button></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const chart = mountChart(holder, slide.chart, { label: slide.title });
  const cap = card.querySelector('.ss-caption');
  const ask = card.querySelector('.ss-ask');
  const pips = card.querySelector('.ss-pips');
  const next = card.querySelector('.ss-next');
  let views = null;
  if (slide.views) {
    views = mountViews(holder, chart, slide.views, slide.view);
    if (slide.viewsFrom) views.el.classList.add('ss-views-off');
  }
  pips.innerHTML = steps.map(() => '<span></span>').join('');
  let i = -1;

  function say(html) {
    cap.innerHTML = html;
    cap.classList.remove('ss-pop'); void cap.offsetWidth; cap.classList.add('ss-pop');
  }
  function finishStep() {
    if (i >= steps.length - 1) {
      next.remove();
      if (slide.check) renderInlineCheck(card, slide.check, () => cont(el, satisfy), helpers);
      else cont(el, satisfy, slide.cta);
    } else {
      next.style.display = '';
      next.textContent = steps[i].next || 'Next →';
    }
  }
  function go() {
    i += 1;
    const s = steps[i];
    ask.innerHTML = '';
    if (s.to != null) chart.progress(s.to);
    if (s.zoom) chart.zoomTo(s.zoom === 'out' ? null : s.zoom, s.zoomMs);
    if (views && slide.viewsFrom === i) views.el.classList.remove('ss-views-off');
    if (s.view && views) views.set(s.view);
    chart.reveal(s.show);
    if (s.hide) chart.hide(s.hide);
    if (s.dim) chart.dim(s.dim);
    if (s.undim) chart.dim(s.undim, false);
    if (s.compare) chart.compare(s.compare); else if (s.clearCompare) chart.clearCompare();
    say(s.text);
    [...pips.children].forEach((p, k) => p.classList.toggle('on', k <= i));
    if (s.ask) {
      next.style.display = 'none';
      renderInlineCheck(ask, s.ask, () => {
        chart.reveal(s.ask.show);
        if (s.ask.compare) chart.compare(s.ask.compare);
        if (s.ask.text) say(s.ask.text);
        finishStep();
      }, helpers);
    } else {
      finishStep();
    }
  }
  next.addEventListener('click', go);
  if (slide.autoStart !== false) go();
}

function renderInlineCheck(container, check, onSolved, helpers, onWrong) {
  const box = document.createElement('div');
  box.className = 'ls-check';
  box.innerHTML = `<div class="ls-check-q">${check.prompt}</div>
    <div class="ls-tap-row${check.options.length > 2 ? ' ls-tap-row-3' : ''}${check.options.length > 3 ? ' ls-tap-row-4' : ''}">
      ${check.options.map((o, i) => `<button type="button" class="ls-tap" data-i="${i}"><span class="ls-tap-title">${o.label}</span>${o.body ? `<span class="ls-tap-body">${o.body}</span>` : ''}</button>`).join('')}
    </div><div class="lw-feedback"></div>`;
  container.appendChild(box);
  // Report every answer so games (Your read) and the Phase Final (scoring) can see it.
  let picked = false;
  const solved = () => { if (!picked) { picked = true; helpers.onPick?.(check, { label: check.options.find((o) => o.correct)?.label || '' }, true); } onSolved(); };
  const wrong = (opt, i) => { picked = true; helpers.onPick?.(check, { label: opt.label }, false); if (onWrong) onWrong(opt, i); };
  wireRetryOptions(box.querySelectorAll('.ls-tap'), check.options, box.querySelector('.lw-feedback'), solved, helpers.handleStreak, wrong);
}

/* ── Swing tap: find the right turn ─────────────────────────────────── */

export function renderSwingTap(el, slide, satisfy, helpers) {
  const rounds = slide.rounds || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-round-row"><span class="ss-round"></span><span class="ss-tag"></span></div>
    <p class="ss-prompt"></p><div class="ss-chart"></div><div class="lw-feedback"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const prompt = card.querySelector('.ss-prompt');
  const roundEl = card.querySelector('.ss-round');
  const tagEl = card.querySelector('.ss-tag');
  const fb = card.querySelector('.lw-feedback');
  let r = 0;

  function load() {
    const round = rounds[r];
    holder.innerHTML = '';
    card.querySelectorAll('.ss-views').forEach((v) => v.remove());
    fb.className = 'lw-feedback'; fb.textContent = '';
    roundEl.textContent = rounds.length > 1 ? `Round ${r + 1} of ${rounds.length}` : '';
    tagEl.textContent = round.tag || '';
    tagEl.className = `ss-tag${round.tag ? ' show' : ''}`;
    prompt.innerHTML = round.prompt;
    const chart = mountChart(holder, round.chart);
    if (round.views) mountViews(holder, chart, round.views, round.view);
    const answers = [].concat(round.answer);
    const found = new Set();
    let solved = false;
    chart.tappable((i) => {
      if (solved || found.has(i)) return;
      const note = (round.notes || {})[i];
      helpers.onPick?.({ prompt: round.prompt, concept: round.concept || slide.concept }, { label: (round.names || {})[i] || `Point ${i}` }, answers.includes(i));
      if (answers.includes(i)) {
        found.add(i);
        chart.setPoint(i, 'good');
        if (round.reveal && round.reveal[i]) chart.label(i, round.reveal[i].label, round.reveal[i].tone);
        helpers.handleStreak(true);
        if (found.size === answers.length) {
          solved = true;
          feedback(fb, `<strong>✦ Yes.</strong> ${round.why || note || ''}`, true);
          if (round.after) chart.reveal(round.after);
          if (r < rounds.length - 1) nextRoundBtn(card, round.nextLabel || 'Next round →', () => { r += 1; load(); });
          else { helpers.burst(); cont(el, satisfy, slide.cta); }
        } else {
          feedback(fb, note || `Good, that's one. ${answers.length - found.size} to go.`, true);
        }
      } else {
        chart.setPoint(i, 'bad');
        chart.flash();
        setTimeout(() => chart.setPoint(i, null), 700);
        feedback(fb, note || round.miss || 'Not that one, look again.', false);
        helpers.handleStreak(false);
      }
    }, round.only);
  }
  load();
}

/* ── Label swings: drag HH / HL / LH / LL onto the chart ────────────── */

function wireDrag(chip, chart, which, onDrop, onTap) {
  chip.addEventListener('pointerdown', (e) => {
    if (chip.disabled) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    let ghost = null, hover = -1;
    const move = (ev) => {
      if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
      if (!ghost) {
        ghost = chip.cloneNode(true);
        ghost.classList.add('ss-ghost');
        document.body.appendChild(ghost);
        chip.classList.add('ss-chip-lifted');
        chart.wrap.classList.add('sc-dropping');
      }
      ghost.style.left = `${ev.clientX}px`;
      ghost.style.top = `${ev.clientY}px`;
      const i = chart.pointAt(ev.clientX, ev.clientY, which);
      if (i !== hover) {
        if (hover >= 0) chart.points[hover].classList.remove('is-hover');
        if (i >= 0) chart.points[i].classList.add('is-hover');
        hover = i;
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      chip.classList.remove('ss-chip-lifted');
      chart.wrap.classList.remove('sc-dropping');
      if (hover >= 0) chart.points[hover].classList.remove('is-hover');
      if (ghost) { ghost.remove(); if (hover >= 0) onDrop(hover); }
      else onTap();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  });
}

export function renderLabelSwings(el, slide, satisfy, helpers) {
  const rounds = slide.rounds || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-round-row"><span class="ss-round"></span><span class="ss-hint">Drag a label onto its swing, or tap a label and then the swing.</span></div>
    <p class="ss-prompt"></p><div class="ss-chips"></div><div class="ss-chart"></div><div class="lw-feedback"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const chipsEl = card.querySelector('.ss-chips');
  const prompt = card.querySelector('.ss-prompt');
  const roundEl = card.querySelector('.ss-round');
  const fb = card.querySelector('.lw-feedback');
  let r = 0;

  function load() {
    const round = rounds[r];
    holder.innerHTML = '';
    fb.className = 'lw-feedback'; fb.textContent = '';
    roundEl.textContent = rounds.length > 1 ? `Chart ${r + 1} of ${rounds.length}` : '';
    prompt.innerHTML = round.prompt || '';
    const chart = mountChart(holder, round.chart);
    const swings = round.chart.swings;
    const targets = round.targets; // { swingIndex: 'HH' }
    const which = Object.keys(targets).map(Number);
    const placed = new Set();
    const chips = round.chips || [...new Set(Object.values(targets))];
    let picked = null;
    chipsEl.innerHTML = chips.map((c) => `<button type="button" class="ss-chip ss-chip-${TONE_FOR[c] || 'purple'}" data-c="${c}">${c}</button>`).join('');
    const chipBtns = [...chipsEl.querySelectorAll('.ss-chip')];
    const total = which.length;

    function attempt(i, lab) {
      if (placed.has(i)) return;
      if (!(i in targets)) { feedback(fb, round.notTarget || 'That swing is where we start. Label the swings that come after it.', false); chart.flash(); return; }
      if (lab === targets[i]) {
        placed.add(i);
        chart.clearCompare();
        chart.label(i, `${lab} ✓`, TONE_FOR[lab] || 'purple');
        chart.setPoint(i, 'good');
        helpers.handleStreak(true);
        if (placed.size === total) {
          feedback(fb, `<strong>✦ Readable structure.</strong> ${round.why || ''}`, true);
          chipBtns.forEach((x) => { x.disabled = true; });
          if (r < rounds.length - 1) nextRoundBtn(card, 'Next chart →', () => { r += 1; load(); });
          else { helpers.burst(); cont(el, satisfy, slide.cta); }
        } else {
          feedback(fb, `${lab} ✓ &nbsp;${total - placed.size} to go.`, true);
        }
        return;
      }
      chart.flash();
      chart.setPoint(i, 'bad');
      setTimeout(() => { if (!placed.has(i)) chart.setPoint(i, null); }, 800);
      helpers.handleStreak(false);
      const kind = swingKind(swings, i);
      if (KIND_FOR[lab] && KIND_FOR[lab] !== kind) {
        feedback(fb, `${lab} describes a swing ${KIND_FOR[lab]}. This point is a swing <strong>${kind}</strong>. Try a ${kind} label.`, false);
        return;
      }
      const prev = (round.prev && round.prev[i] != null) ? round.prev[i] : i - 2;
      if (prev >= 0) chart.compare({ i, prev, newText: `THIS ${kind.toUpperCase()}`, prevText: `PREVIOUS ${kind.toUpperCase()}`, tone: 'purple' });
      feedback(fb, (round.hints && round.hints[i]) || `Compare this ${kind} to the previous relevant ${kind}. Did it form above it or below it? Try again.`, false);
    }

    chipBtns.forEach((b) => wireDrag(b, chart, which, (i) => attempt(i, b.dataset.c), () => {
      picked = b.dataset.c;
      chipBtns.forEach((x) => x.classList.toggle('on', x === b));
    }));
    chart.tappable((i) => {
      if (placed.has(i)) return;
      if (!picked) { feedback(fb, 'Drag a label onto this swing, or tap a label first.', false); return; }
      attempt(i, picked);
    }, which);
  }
  load();
}

/* ── Flash sort: quick charts, quick calls ──────────────────────────── */

export function renderFlashSort(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  const options = slide.options || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-flash-top"><span class="ss-round"></span><span class="ss-streak">STREAK <b>0</b></span></div>
    <div class="ss-progress"><div></div></div>
    <div class="ss-chart ss-flash-chart"></div>
    <div class="ss-opts${options.length > 3 ? ' ss-opts-4' : ''}">${options.map((o) => `<button type="button" class="ss-opt" data-k="${o.key}"><span>${o.emoji || ''}</span>${o.label}</button>`).join('')}</div>
    <div class="lw-feedback"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const roundEl = card.querySelector('.ss-round');
  const streakBox = card.querySelector('.ss-streak');
  const bar = card.querySelector('.ss-progress div');
  const fb = card.querySelector('.lw-feedback');
  const btns = [...card.querySelectorAll('.ss-opt')];
  let k = 0, score = 0, run = 0, best = 0, locked = false, chart = null;

  function load() {
    holder.innerHTML = '';
    holder.classList.remove('ss-slide-in'); void holder.offsetWidth; holder.classList.add('ss-slide-in');
    chart = mountChart(holder, items[k].chart);
    roundEl.textContent = `Chart ${k + 1} of ${items.length}`;
    bar.style.width = `${(k / items.length) * 100}%`;
    btns.forEach((b) => { b.classList.remove('correct', 'wrong'); b.disabled = false; });
    fb.className = 'lw-feedback'; fb.textContent = '';
    locked = false;
  }
  btns.forEach((b) => b.addEventListener('click', () => {
    if (locked) return;
    locked = true;
    const item = items[k];
    const right = b.dataset.k === item.answer;
    helpers.onPick?.(item, { label: options.find((o) => o.key === b.dataset.k)?.label || b.textContent.trim() }, right);
    btns.forEach((x) => { x.disabled = true; if (x.dataset.k === item.answer) x.classList.add('correct'); });
    if (!right) b.classList.add('wrong');
    if (right) { score += 1; run += 1; best = Math.max(best, run); } else run = 0;
    streakBox.innerHTML = `${run >= 4 ? '🔥 ' : ''}STREAK <b>${run}</b>`;
    streakBox.classList.toggle('hot', run >= 4);
    streakBox.classList.remove('bump'); void streakBox.offsetWidth; if (right) streakBox.classList.add('bump');
    helpers.handleStreak(right);
    if (item.after) chart.reveal(item.after);
    feedback(fb, `${right ? '✦ ' : ''}${item.why || ''}`, right);
    setTimeout(() => {
      k += 1;
      if (k < items.length) load();
      else finish();
    }, right ? (item.after ? 1700 : 1150) : 2700);
  }));
  function finish() {
    bar.style.width = '100%';
    holder.innerHTML = `<div class="ss-score"><div class="ss-score-big">${score}/${items.length}</div><div>Best streak: ${best}${best >= 4 ? ' 🔥' : ''}</div></div>`;
    card.querySelector('.ss-opts').remove();
    roundEl.textContent = 'Done';
    if (score === items.length) helpers.burst();
    fb.innerHTML = score >= Math.ceil(items.length * 0.7) ? (slide.passText || 'Your eyes are getting sharp.') : (slide.retryText || 'Good reps. Read the swings, not the candles.');
    fb.className = 'lw-feedback show good';
    if (score < items.length && slide.replay !== false) {
      const again = document.createElement('button');
      again.type = 'button'; again.className = 'ss-again'; again.textContent = '↻ Run it again';
      again.addEventListener('click', () => renderFlashSort(el, slide, satisfy, helpers));
      card.appendChild(again);
    }
    cont(el, satisfy, slide.cta);
  }
  load();
}

/* ── Chart check: a chart and a question ("catch the mistake") ──────── */

export function renderChartCheck(el, slide, satisfy, helpers) {
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}${slide.scenario ? `<p class="lw-scenario">${slide.scenario}</p>` : ''}<div class="ss-chart"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const chart = slide.chart ? mountChart(holder, slide.chart) : null;
  if (!chart) holder.remove();
  if (chart && slide.views) mountViews(holder, chart, slide.views, slide.view);
  if (chart && slide.pre) chart.reveal(slide.pre);
  let compared = false;
  const drawCompare = () => { if (chart && slide.compare && !compared) { compared = true; chart.compare(slide.compare); } };
  renderInlineCheck(card, slide.check, () => {
    if (chart && slide.fix) {
      [].concat(slide.fix).forEach((f) => chart.label(f.i, f.label, f.tone || TONE_FOR[f.label.replace(/[^A-Z]/g, '')] || 'up', f.key));
    }
    drawCompare();
    if (chart && slide.after) chart.reveal(slide.after);
    cont(el, satisfy, slide.cta);
  }, helpers, () => { if (slide.compareOnWrong !== false) drawCompare(); });
}

export const STRUCTURE_RENDERERS = {
  structure_story: renderStructureStory,
  swing_tap: renderSwingTap,
  label_swings: renderLabelSwings,
  flash_sort: renderFlashSort,
  chart_check: renderChartCheck,
};
