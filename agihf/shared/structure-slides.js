/**
 * structure-slides.js — A Girl & Her Futures™
 *
 * Slide types for the market-structure lessons, built on the animated
 * charts in structure-charts.js. Registered into lesson-slides-engine.js
 * and reused as levels in the section games (section-engine.js).
 *
 *   structure_story  a chart that builds up step by step as you tap Next
 *   swing_tap        tap the right swing point(s) on a chart
 *   label_swings     place HH / HL / LH / LL chips onto swing points
 *   flash_sort       a fast run of charts: sort each one, with a streak
 *   chart_check      a chart plus a multiple-choice question; can fix a
 *                    wrong label on the chart once answered ("catch the mistake")
 *
 * Every renderer has the slide-engine signature (el, slide, satisfy, helpers).
 */

import { wireRetryOptions } from './lesson-engine.js';
import { mountChart } from './structure-charts.js';

const TONE_FOR = { HH: 'up', HL: 'up', LH: 'down', LL: 'down' };

function cont(el, satisfy, label = 'Continue →') {
  if (el.querySelector(':scope > .lw-continue-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lw-continue-btn';
  btn.textContent = label;
  btn.addEventListener('click', satisfy);
  el.appendChild(btn);
}

function head(slide) {
  return `
    <div class="lw-eyebrow">${slide.kicker || 'Structure'}</div>
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p>${slide.body}</p>` : ''}`;
}

function feedback(fb, html, good) {
  fb.innerHTML = html;
  fb.className = `lw-feedback show ${good ? 'good' : 'bad'}`;
}

/* ── Structure story: the chart builds as you step through ─────────── */

export function renderStructureStory(el, slide, satisfy, helpers) {
  const steps = slide.steps || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}<div class="ss-chart"></div>
    <div class="ss-caption" aria-live="polite"></div>
    <div class="ss-stepper"><div class="ss-pips"></div><button type="button" class="ss-next">Show me →</button></div></div>`;
  const card = el.querySelector('.lw-card');
  const chart = mountChart(card.querySelector('.ss-chart'), slide.chart, { label: slide.title });
  const cap = card.querySelector('.ss-caption');
  const pips = card.querySelector('.ss-pips');
  const next = card.querySelector('.ss-next');
  pips.innerHTML = steps.map(() => '<span></span>').join('');
  let i = -1;
  function go() {
    i += 1;
    const s = steps[i];
    chart.reveal(s.show);
    if (s.hide) chart.hide(s.hide);
    cap.innerHTML = s.text;
    cap.classList.remove('ss-pop'); void cap.offsetWidth; cap.classList.add('ss-pop');
    [...pips.children].forEach((p, k) => p.classList.toggle('on', k <= i));
    if (i >= steps.length - 1) {
      next.remove();
      if (slide.check) renderInlineCheck(card, slide.check, () => cont(el, satisfy), helpers);
      else cont(el, satisfy);
    } else {
      next.textContent = s.next || 'Next →';
    }
  }
  next.addEventListener('click', go);
  if (slide.autoStart !== false) go();
}

function renderInlineCheck(card, check, onSolved, helpers) {
  const box = document.createElement('div');
  box.className = 'ls-check';
  box.innerHTML = `<div class="ls-check-q">${check.prompt}</div>
    <div class="ls-tap-row${check.options.length > 2 ? ' ls-tap-row-3' : ''}">
      ${check.options.map((o, i) => `<button type="button" class="ls-tap" data-i="${i}"><span class="ls-tap-title">${o.label}</span>${o.body ? `<span class="ls-tap-body">${o.body}</span>` : ''}</button>`).join('')}
    </div><div class="lw-feedback"></div>`;
  card.appendChild(box);
  wireRetryOptions(box.querySelectorAll('.ls-tap'), check.options, box.querySelector('.lw-feedback'), onSolved, helpers.handleStreak);
}

/* ── Swing tap: find the right turn ─────────────────────────────────── */

export function renderSwingTap(el, slide, satisfy, helpers) {
  const rounds = slide.rounds || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-round-row"><span class="ss-round"></span></div>
    <p class="ss-prompt"></p><div class="ss-chart"></div><div class="lw-feedback"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const prompt = card.querySelector('.ss-prompt');
  const roundEl = card.querySelector('.ss-round');
  const fb = card.querySelector('.lw-feedback');
  let r = 0;

  function load() {
    const round = rounds[r];
    holder.innerHTML = '';
    fb.className = 'lw-feedback'; fb.textContent = '';
    roundEl.textContent = rounds.length > 1 ? `Round ${r + 1} of ${rounds.length}` : '';
    prompt.innerHTML = round.prompt;
    const chart = mountChart(holder, round.chart);
    const answers = [].concat(round.answer);
    const found = new Set();
    let solved = false;
    chart.tappable((i) => {
      if (solved || found.has(i)) return;
      const note = (round.notes || {})[i];
      if (answers.includes(i)) {
        found.add(i);
        chart.setPoint(i, 'good');
        if (round.reveal && round.reveal[i]) chart.label(i, round.reveal[i].label, round.reveal[i].tone);
        helpers.handleStreak(true);
        if (found.size === answers.length) {
          solved = true;
          feedback(fb, `<strong>✦ Yes.</strong> ${round.why || note || ''}`, true);
          if (round.after) chart.reveal(round.after);
          if (r < rounds.length - 1) {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = 'Next round →';
            b.addEventListener('click', () => { b.remove(); r += 1; load(); });
            card.appendChild(b);
          } else {
            helpers.burst();
            cont(el, satisfy);
          }
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

/* ── Label swings: place HH / HL / LH / LL ──────────────────────────── */

export function renderLabelSwings(el, slide, satisfy, helpers) {
  const rounds = slide.rounds || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-round-row"><span class="ss-round"></span><span class="ss-hint">Tap a label, then tap the swing it belongs to.</span></div>
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
    roundEl.textContent = rounds.length > 1 ? `Round ${r + 1} of ${rounds.length}` : '';
    prompt.innerHTML = round.prompt || '';
    const chart = mountChart(holder, round.chart);
    const targets = round.targets; // { swingIndex: 'HH' }
    const placed = new Set();
    const chips = round.chips || [...new Set(Object.values(targets))];
    let picked = null;
    chipsEl.innerHTML = chips.map((c) => `<button type="button" class="ss-chip ss-chip-${TONE_FOR[c] || 'purple'}" data-c="${c}">${c}</button>`).join('');
    const chipBtns = [...chipsEl.querySelectorAll('.ss-chip')];
    chipBtns.forEach((b) => b.addEventListener('click', () => {
      picked = b.dataset.c;
      chipBtns.forEach((x) => x.classList.toggle('on', x === b));
    }));
    const total = Object.keys(targets).length;
    chart.tappable((i) => {
      if (placed.has(i)) return;
      if (!(i in targets)) { feedback(fb, round.notTarget || 'That point is the starting swing, we label what comes after it.', false); chart.flash(); return; }
      if (!picked) { feedback(fb, 'Pick a label first, then tap the swing.', false); return; }
      if (picked === targets[i]) {
        placed.add(i);
        chart.label(i, picked, TONE_FOR[picked] || 'purple');
        chart.setPoint(i, 'good');
        helpers.handleStreak(true);
        if (placed.size === total) {
          feedback(fb, `<strong>✦ Readable structure.</strong> ${round.why || ''}`, true);
          chipBtns.forEach((x) => { x.disabled = true; });
          if (r < rounds.length - 1) {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = 'Next chart →';
            b.addEventListener('click', () => { b.remove(); r += 1; load(); });
            card.appendChild(b);
          } else {
            helpers.burst();
            cont(el, satisfy);
          }
        } else {
          feedback(fb, `${picked} ✓ ${total - placed.size} to go.`, true);
        }
      } else {
        chart.flash();
        helpers.handleStreak(false);
        feedback(fb, (round.hints && round.hints[picked]) || hintFor(picked), false);
      }
    }, Object.keys(round.chart.swings).map(Number));
  }
  load();
}

function hintFor(label) {
  return {
    HH: 'Not an HH. A higher high has to form above the previous relevant swing high.',
    HL: 'Not an HL. A higher low has to form above the previous relevant swing low.',
    LH: 'Not an LH. A lower high has to form below the previous relevant swing high.',
    LL: 'Not an LL. A lower low has to form below the previous relevant swing low.',
  }[label] || 'Not quite, compare it to the previous swing of the same kind.';
}

/* ── Flash sort: quick charts, quick calls ──────────────────────────── */

export function renderFlashSort(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  const options = slide.options || [];
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}
    <div class="ss-flash-top"><span class="ss-round"></span><span class="ss-streak">🔥 <b>0</b> streak</span></div>
    <div class="ss-progress"><div></div></div>
    <div class="ss-chart ss-flash-chart"></div>
    <div class="ss-opts">${options.map((o) => `<button type="button" class="ss-opt" data-k="${o.key}"><span>${o.emoji || ''}</span>${o.label}</button>`).join('')}</div>
    <div class="lw-feedback"></div></div>`;
  const card = el.querySelector('.lw-card');
  const holder = card.querySelector('.ss-chart');
  const roundEl = card.querySelector('.ss-round');
  const streakEl = card.querySelector('.ss-streak b');
  const bar = card.querySelector('.ss-progress div');
  const fb = card.querySelector('.lw-feedback');
  const btns = [...card.querySelectorAll('.ss-opt')];
  let k = 0, score = 0, run = 0, best = 0, locked = false;

  function load() {
    holder.innerHTML = '';
    mountChart(holder, items[k].chart);
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
    btns.forEach((x) => { x.disabled = true; if (x.dataset.k === item.answer) x.classList.add('correct'); });
    if (!right) b.classList.add('wrong');
    if (right) { score += 1; run += 1; best = Math.max(best, run); } else run = 0;
    streakEl.textContent = run;
    card.querySelector('.ss-streak').classList.toggle('hot', run >= 3);
    helpers.handleStreak(right);
    feedback(fb, `${right ? '✦ ' : ''}${item.why || ''}`, right);
    setTimeout(() => {
      k += 1;
      if (k < items.length) load();
      else finish();
    }, right ? 1200 : 2400);
  }));
  function finish() {
    bar.style.width = '100%';
    holder.innerHTML = `<div class="ss-score"><div class="ss-score-big">${score}/${items.length}</div><div>Best streak: ${best} 🔥</div></div>`;
    card.querySelector('.ss-opts').remove();
    roundEl.textContent = 'Done';
    if (score === items.length) helpers.burst();
    fb.innerHTML = score >= Math.ceil(items.length * 0.7) ? (slide.passText || 'Your eyes are getting sharp.') : (slide.retryText || 'Good reps. Read the swings, not the candles, and try another run anytime.');
    fb.className = 'lw-feedback show good';
    cont(el, satisfy);
  }
  load();
}

/* ── Chart check: a chart and a question (can fix a wrong label) ─────── */

export function renderChartCheck(el, slide, satisfy, helpers) {
  el.innerHTML = `<div class="lw-card ss-card">${head(slide)}${slide.scenario ? `<p class="lw-scenario">${slide.scenario}</p>` : ''}<div class="ss-chart"></div></div>`;
  const card = el.querySelector('.lw-card');
  const chart = slide.chart ? mountChart(card.querySelector('.ss-chart'), slide.chart) : null;
  if (!chart) card.querySelector('.ss-chart').remove();
  if (chart && slide.pre) chart.reveal(slide.pre);
  renderInlineCheck(card, slide.check, () => {
    if (chart && slide.fix) {
      [].concat(slide.fix).forEach((f) => chart.label(f.i, f.label, f.tone || TONE_FOR[f.label] || 'up', f.key));
    }
    if (chart && slide.after) chart.reveal(slide.after);
    cont(el, satisfy);
  }, helpers);
}

export const STRUCTURE_RENDERERS = {
  structure_story: renderStructureStory,
  swing_tap: renderSwingTap,
  label_swings: renderLabelSwings,
  flash_sort: renderFlashSort,
  chart_check: renderChartCheck,
};
