/**
 * price-lab.js — A Girl & Her Futures™
 *
 * The Phase 2 Section 2 "interpret what changed" screen. Price develops
 * candle by candle and stops to make her reason before she sees what
 * happens next:
 *
 *   WHAT BROKE? → WHICH SWING WAS IT? → HOW DID PRICE BREAK IT? →
 *   WHAT WAS THE PRIOR STRUCTURE? → WHAT DOES THAT BREAK TELL ME? →
 *   DO I HAVE ENOUGH INFORMATION YET?
 *
 *   price_lab = {
 *     kicker, title, body,
 *     chart:    structure-charts spec (usually `bars` for exact candles,
 *               `swings` only as tap targets / mark anchors, `candles:false`),
 *     start:    candles visible at the start,
 *     story:    { title, rows: [{ key, label, value, tone }] }   Structure Story panel
 *     evidence: { items: [{ text, ok }], conclusion }            What we know
 *     views:    toggle row (see structure-slides mountViews)
 *     steps: [{
 *       candles: k,               price plays forward to k candles
 *       text, show, hide,         caption + chart reveals
 *       story: { key: { value, tone } },   panel updates
 *       evidence: { items, conclusion },
 *       tap:  { prompt, answer, only, hint, notes, reveal, show, hide }  pick on the chart
 *       pick / keep / clean / zone   a Level Toolkit action (see level-tools.js; needs slide.levels)
 *       asks: [question, …]       chained questions (each solved before the next)
 *       card: { title, rows }     a LEVEL PURPOSE card shown after the asks
 *       next: 'Next candle →'
 *     }],
 *     check: question at the end (optional)
 *   }
 *
 *   question = { prompt, hint, concept, stack,
 *                options: [{ label, correct, why, feedback, nei, mistake }] }
 *
 * Wrong answers get the hint first ("Try again"), then the option's own
 * feedback. "Not enough information" options (nei: true) get their own look.
 * Answers are reported to helpers.onPick (games use it for YOUR READ) and
 * mistake tags are counted in localStorage `aghf_learning`.
 */

import { mountChart } from './structure-charts.js';
import { mountViews } from './structure-slides.js';
import { mountLevels } from './level-tools.js';

const NEI_WHY = '✓ Exactly. You don’t have to force a directional conclusion before price gives you enough evidence.';

/* ── Learning data: concept accuracy + repeated mistake types ───────── */

export function recordLearning({ concept, mistake, correct }) {
  try {
    const all = JSON.parse(localStorage.getItem('aghf_learning') || '{"concepts":{},"mistakes":{}}');
    all.concepts = all.concepts || {};
    all.mistakes = all.mistakes || {};
    if (concept) {
      const c = all.concepts[concept] || { right: 0, tries: 0 };
      c.tries += 1; if (correct) c.right += 1;
      all.concepts[concept] = c;
    }
    if (mistake && !correct) {
      const m = all.mistakes[mistake] || { count: 0 };
      m.count += 1; m.lastAt = Date.now();
      all.mistakes[mistake] = m;
    }
    localStorage.setItem('aghf_learning', JSON.stringify(all));
  } catch (e) { /* storage blocked */ }
}

/* ── A question with hint-first retries ─────────────────────────────── */

export function askQuestion(container, q, helpers, onSolved) {
  const box = document.createElement('div');
  box.className = 'pl-ask';
  const long = q.stack || q.options.some((o) => o.label.length > 22);
  box.innerHTML = `<div class="pl-q">${q.prompt}</div>
    <div class="pl-opts${long ? ' pl-opts-col' : ''}">
      ${q.options.map((o, i) => `<button type="button" class="pl-opt${o.nei ? ' pl-nei' : ''}" data-i="${i}">${o.nei ? '<span class="pl-nei-mark">?</span>' : ''}${o.label}</button>`).join('')}
    </div><div class="pl-fb" aria-live="polite"></div>`;
  container.appendChild(box);
  const fb = box.querySelector('.pl-fb');
  const btns = [...box.querySelectorAll('.pl-opt')];
  let wrongs = 0, solved = false;
  btns.forEach((b, i) => b.addEventListener('click', () => {
    if (solved || b.disabled) return;
    const o = q.options[i];
    helpers.onPick?.(q, o, !!o.correct, wrongs);
    recordLearning({ concept: q.concept, mistake: o.mistake, correct: !!o.correct });
    if (o.correct) {
      solved = true;
      b.classList.add('ok');
      btns.forEach((x) => { if (x !== b) x.disabled = true; });
      fb.innerHTML = o.why ? `<strong>✦</strong> ${o.why}` : (o.nei ? NEI_WHY : '<strong>✦ Yes.</strong>');
      fb.className = 'pl-fb show good';
      helpers.handleStreak?.(true);
      onSolved(o);
      return;
    }
    wrongs += 1;
    b.classList.add('no');
    b.disabled = true;
    helpers.handleStreak?.(false);
    // First miss: a nudge to look again. After that: the specific reason.
    const msg = wrongs === 1 && q.hint
      ? `<strong>Try again.</strong> ${q.hint}`
      : `${o.feedback || 'Not quite.'}${q.hint && wrongs > 1 ? ` <span class="pl-hint">${q.hint}</span>` : ''}`;
    fb.innerHTML = msg;
    fb.className = 'pl-fb show bad';
  }));
  return box;
}

/* ── Electric nudge: only when her own history shows the mistake ────── */

/** watch = { mistake, text } → a heads-up banner if she has made that mistake before. */
export function mistakeNudge(watch) {
  if (!watch) return '';
  try {
    const all = JSON.parse(localStorage.getItem('aghf_learning') || '{}');
    const m = (all.mistakes || {})[watch.mistake];
    if (!m || !m.count) return '';
  } catch (e) { return ''; }
  return `<div class="p3-nudge" role="note"><span>👀</span>${watch.text}</div>`;
}

/* ── Three lenses: structure · context · execution ─────────────────── */

const LENSES = [
  ['structure', '🏗️', 'Structure', 'What is price building?'],
  ['context', '💧', 'Liquidity / context', 'Where might orders sit? How did price deliver?'],
  ['execution', '✦', 'Execution', 'Is the entry model present?'],
];
export function lensCard(l) {
  const d = document.createElement('div');
  d.className = 'p3-lens';
  d.innerHTML = `<div class="pl-panel-title">${l.title || 'Three lenses'}</div>${LENSES.map(([k, ic, name, q]) => `
    <div class="p3-lens-row p3-lens-${k}"><span class="p3-lens-ic" aria-hidden="true">${ic}</span>
      <div><b>${(l.labels || {})[k] || name}</b><small>${q}</small></div>
      <span class="p3-lens-val">${l[k] ?? (k === 'execution' ? 'Entry model: not present / not being evaluated yet' : '·')}</span></div>`).join('')}`;
  return d;
}

/* ── Delivery meter: qualitative only, never a fake number ────────── */

const METER_POS = { overlap: 0.12, balanced: 0.25, mixed: 0.5, imbalanced: 0.75, displaced: 0.88 };
const METER_WORD = { overlap: 'Overlapping', balanced: 'More balanced-looking', mixed: 'Mixed', imbalanced: 'More imbalanced-looking', displaced: 'Displaced' };
/** m = 'balanced' | 'mixed' | 'displaced' | … or { value, label, title } */
export function meterEl(m) {
  const v = typeof m === 'string' ? { value: m } : m;
  const d = document.createElement('div');
  d.className = 'p3-meter';
  d.innerHTML = `<div class="p3-meter-head"><span>${v.title || 'Delivery meter'}</span><em>Educational read · not a measurement</em></div>
    <div class="p3-meter-track" role="img" aria-label="${v.label || METER_WORD[v.value] || ''}"><i style="left:${(METER_POS[v.value] ?? 0.5) * 100}%"></i></div>
    <div class="p3-meter-ends"><span>${v.left || 'Two-sided / overlapping'}</span><span>${v.right || 'One-sided / displaced'}</span></div>
    <div class="p3-meter-word">${v.label || METER_WORD[v.value] || ''}</div>`;
  return d;
}

/* ── Structure Story + What we know ─────────────────────────────────── */

function storyHtml(story) {
  return `<div class="pl-story">
    <div class="pl-panel-title">${story.title || 'Structure story'}</div>
    ${story.rows.map((r) => `<div class="pl-row" data-key="${r.key}"><span class="pl-row-label">${r.label}</span><span class="pl-row-val pl-tone-${r.tone || 'muted'}">${r.value}</span></div>`).join('')}
  </div>`;
}
function evidenceHtml(ev) {
  return `<div class="pl-evidence">
    <div class="pl-panel-title">What we know</div>
    <ul>${ev.items.map((it) => `<li class="${it.ok ? 'on' : ''}"><span>${it.ok ? '✓' : '○'}</span>${it.text}</li>`).join('')}</ul>
    ${ev.conclusion ? `<div class="pl-conclusion"><span>Current conclusion</span>${ev.conclusion}</div>` : ''}
  </div>`;
}

/* A LEVEL PURPOSE card: { title, rows: [[label, value]] }. Context, never an entry signal. */
function purposeCard(c) {
  const d = document.createElement('div');
  d.className = 'pl-purpose';
  d.innerHTML = `<div class="pl-panel-title">${c.title || 'Level purpose'}</div>${c.rows.map(([k, v]) => `<div class="pl-purpose-row"><span>${k}</span><b>${v}</b></div>`).join('')}${c.note ? `<div class="pl-purpose-note">${c.note}</div>` : ''}`;
  return d;
}

/* ── The screen ─────────────────────────────────────────────────────── */

/* On phones the 700-wide chart shrinks a lot. Crop the empty space right of
   the candles, and pin level labels and notes to the new right edge. */
function compactChart(chart, spec) {
  const bars = spec.bars || [];
  if (!bars.length) return;
  const left = Math.max(0, Math.min(...bars.map((b) => b.x - (b.w || 10))) - 16);
  const right = Math.min(700, Math.max(...bars.map((b) => b.x + (b.w || 10))) + 110);
  if (right - left > 640) return;
  chart.svg.setAttribute('viewBox', `${left} 0 ${right - left} 320`);
  chart.svg.style.overflow = 'hidden';
  chart.svg.classList.add('sc-compact');
  const noteTexts = new Set((spec.notes || []).map((n) => n.text));
  chart.svg.querySelectorAll('text').forEach((t) => {
    const isLevel = t.closest('.sc-hline');
    if (!isLevel && !noteTexts.has(t.textContent)) return;
    t.setAttribute('x', right - 6);
    t.setAttribute('text-anchor', 'end');
    t.classList.add('sc-halo');
  });
}

export function renderPriceLab(el, slide, satisfy, helpers) {
  const steps = slide.steps || [];
  const side = slide.story || slide.evidence;
  el.innerHTML = `<div class="lw-card pl-card">
      ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Price lab'}</div>`}
      ${slide.title ? `<h2>${slide.title}</h2>` : ''}
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      ${mistakeNudge(slide.watch)}
      <div class="pl-stage${side ? ' pl-has-side' : ''}">
        <div class="pl-main"><div class="pl-chart"></div></div>
        ${side ? `<div class="pl-side">${slide.story ? storyHtml(slide.story) : ''}<div class="pl-ev-slot">${slide.evidence ? evidenceHtml(slide.evidence) : ''}</div></div>` : ''}
      </div>
      <div class="pl-caption" aria-live="polite"></div>
      <div class="pl-asks"></div>
      <div class="pl-controls">
        <button type="button" class="pl-reset" title="Start this chart over">↺ Reset</button>
        <div class="pl-pips">${steps.map(() => '<span></span>').join('')}</div>
        <button type="button" class="pl-next">Play price →</button>
      </div>
    </div>`;
  const card = el.querySelector('.pl-card');
  const chart = mountChart(card.querySelector('.pl-chart'), { ...slide.chart, showCandles: slide.start ?? slide.chart.showCandles }, { label: slide.title });
  if (window.matchMedia?.('(max-width: 600px)').matches) compactChart(chart, slide.chart);
  if (slide.views) mountViews(card.querySelector('.pl-chart'), chart, slide.views, slide.view);
  const lv = slide.levels ? mountLevels(chart, slide.levels) : null;
  const cap = card.querySelector('.pl-caption');
  const asks = card.querySelector('.pl-asks');
  const next = card.querySelector('.pl-next');
  const pips = [...card.querySelectorAll('.pl-pips span')];
  card.querySelector('.pl-reset').addEventListener('click', () => renderPriceLab(el, slide, satisfy, helpers));
  let i = -1;
  let shownAt = slide.start ?? 0;

  const say = (html) => { cap.innerHTML = html || ''; cap.classList.remove('pl-pop'); void cap.offsetWidth; cap.classList.add('pl-pop'); };
  function updateStory(upd) {
    Object.entries(upd || {}).forEach(([key, v]) => {
      const row = card.querySelector(`.pl-row[data-key="${key}"] .pl-row-val`);
      if (!row) return;
      row.textContent = v.value;
      row.className = `pl-row-val pl-tone-${v.tone || 'muted'} pl-flash`;
    });
  }

  function finish() {
    const isLast = i >= steps.length - 1;
    if (!isLast) {
      next.style.display = '';
      const cur = steps[i].candles ?? shownAt, nxt = steps[i + 1].candles;
      if (steps[i].candles != null) shownAt = steps[i].candles;
      next.textContent = steps[i].next || (nxt != null && nxt > cur ? (nxt - cur > 1 ? 'Play price →' : 'Next candle →') : 'Next →');
      return;
    }
    next.remove();
    if (slide.check) askQuestion(asks, slide.check, helpers, () => cont());
    else cont();
  }
  function cont() {
    if (el.querySelector(':scope > .lw-continue-btn')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
    b.addEventListener('click', satisfy);
    el.appendChild(b);
  }

  function runAsks(list, k, done) {
    if (k >= list.length) { done(); return; }
    askQuestion(asks, list[k], helpers, (o) => {
      if (list[k].show) chart.reveal(list[k].show);
      if (list[k].story) updateStory(list[k].story);
      if (list[k].text) say(list[k].text);
      runAsks(list, k + 1, done);
    });
  }

  function runTap(t, done) {
    const box = document.createElement('div');
    box.className = 'pl-ask';
    box.innerHTML = `<div class="pl-q">👆 ${t.prompt}</div><div class="pl-fb"></div>`;
    asks.appendChild(box);
    const fb = box.querySelector('.pl-fb');
    const answers = [].concat(t.answer);
    let wrongs = 0, solved = false;
    chart.wrap.classList.add('sc-tappable');
    chart.points.forEach((p, idx) => {
      p.classList.remove('sc-tap');
      if (t.only && !t.only.includes(idx)) return;
      p.classList.add('sc-tap');
      p.onclick = () => {
        if (solved) return;
        const ok = answers.includes(idx);
        helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: (t.names || {})[idx] || `Point ${idx}` }, ok, wrongs);
        recordLearning({ concept: t.concept, mistake: (t.mistakes || {})[idx], correct: ok });
        if (ok) {
          solved = true;
          chart.setPoint(idx, 'good');
          if (t.reveal && t.reveal[idx]) chart.label(idx, t.reveal[idx].label, t.reveal[idx].tone);
          chart.points.forEach((q) => { q.classList.remove('sc-tap'); q.onclick = null; });
          chart.wrap.classList.remove('sc-tappable');
          fb.innerHTML = `<strong>✦</strong> ${t.why || ''}`;
          fb.className = 'pl-fb show good';
          helpers.handleStreak?.(true);
          if (t.show) chart.reveal(t.show);
          if (t.hide) chart.hide(t.hide);
          if (t.story) updateStory(t.story);
          done();
        } else {
          wrongs += 1;
          chart.setPoint(idx, 'bad'); chart.flash();
          setTimeout(() => chart.setPoint(idx, null), 700);
          helpers.handleStreak?.(false);
          const note = (t.notes || {})[idx];
          fb.innerHTML = wrongs === 1 && t.hint ? `<strong>Try again.</strong> ${t.hint}` : (note || t.hint || 'Not that one.');
          fb.className = 'pl-fb show bad';
        }
      };
    });
  }

  function go() {
    i += 1;
    const s = steps[i];
    asks.innerHTML = '';
    next.style.display = 'none';
    pips.forEach((p, k) => p.classList.toggle('on', k <= i));
    const wait = s.candles != null ? chart.showCandles(s.candles, s.gap ?? 220) : 0;
    setTimeout(() => {
      if (s.show) { chart.reveal(s.show); lv?.show(s.show); }
      if (s.hide) { chart.hide(s.hide); lv?.hide(s.hide); }
      if (s.story) updateStory(s.story);
      if (s.evidence) card.querySelector('.pl-ev-slot').innerHTML = evidenceHtml(s.evidence);
      if (s.relabel && lv) Object.entries(s.relabel).forEach(([id, r]) => lv.relabel(id, r.label, r.tone));
      say(s.text);
      const afterAsks = () => { if (s.card) asks.appendChild(purposeCard(s.card)); if (s.lens) asks.appendChild(lensCard(s.lens)); if (s.meter) asks.appendChild(meterEl(s.meter)); finish(); };
      const afterTools = () => (s.asks || s.ask ? runAsks(s.asks || [s.ask], 0, afterAsks) : afterAsks());
      const tool = lv && ['pick', 'keep', 'clean', 'zone'].find((k) => s[k]);
      const afterTap = () => (tool ? lv[tool](s[tool], asks, helpers, afterTools) : afterTools());
      if (s.tap) runTap(s.tap, afterTap); else afterTap();
    }, s.candles != null ? Math.min(wait, 2400) : 0);
  }
  next.addEventListener('click', go);
  go();
}

export const PRICE_LAB_RENDERERS = { price_lab: renderPriceLab };
