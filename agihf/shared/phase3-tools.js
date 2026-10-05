/**
 * phase3-tools.js — A Girl & Her Futures™
 *
 * Phase 3 (Reading Price Like a Pro) slide types. Phase 3 is market
 * literacy, never entry signals, so most of these ask her to separate what
 * the chart shows from what she's assuming.
 *
 *   verdicts         stamp each statement: YES / NO, MYTH / FACT, KNOW / DON'T KNOW…
 *                    { prompt, choices, items: [{ text, answer, why, feedback, hint, mistake, concept, choices }],
 *                      chart?, levels?, footer, cta, watch? }
 *   explore          tap each card to open it (e.g. WHO MIGHT BE HERE?)
 *                    { prompt, chart?, levels?, cards: [{ icon, title, body }], footer, cta }
 *   literacy_entry   MARKET LITERACY vs ENTRY CRITERIA board, with an optional sort first
 *                    { sort: { prompt, items: [{ text, side: 'lit' | 'entry', why }] },
 *                      literacy: { title, items }, entry: { title, steps }, footer }
 *   joke_checklist   an over-stuffed checklist ticks itself, then gets stamped
 *                    { intro, items, stamp, after, run }
 *
 * Every answer goes to helpers.onPick / handleStreak (games score with it)
 * and to aghf_learning, like the price lab. Nothing relies on color alone:
 * every verdict prints its word, and motion is skipped under reduced motion.
 */

import { mountChart } from './structure-charts.js';
import { mountLevels } from './level-tools.js';
import { recordLearning, mistakeNudge } from './price-lab.js';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function head(slide) {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Investigate it'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p>${slide.body}</p>` : ''}`;
}

function continueBtn(el, satisfy, label) {
  if (el.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label || 'Continue →';
  b.addEventListener('click', satisfy);
  el.appendChild(b);
}

function maybeChart(card, slide) {
  if (!slide.chart) return null;
  const holder = card.querySelector('.p3-chart');
  const chart = mountChart(holder, slide.chart, { label: slide.title });
  if (slide.levels) mountLevels(chart, slide.levels);
  return chart;
}

/* ── verdicts ───────────────────────────────────────────────────────── */

function renderVerdicts(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  const base = slide.choices || ['YES', 'NO'];
  el.innerHTML = `<div class="lw-card p3-card">${head(slide)}
      ${mistakeNudge(slide.watch)}
      ${slide.chart ? '<div class="p3-chart"></div>' : ''}
      ${slide.prompt ? `<div class="p3-prompt">${slide.prompt}</div>` : ''}
      <div class="p3-verdicts"></div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  const chart = maybeChart(card, slide);
  const list = card.querySelector('.p3-verdicts');
  const foot = card.querySelector('.p3-foot');
  let k = 0;

  function addItem() {
    const it = items[k];
    const choices = it.choices || base;
    const answers = [].concat(it.answer);
    const row = document.createElement('div');
    row.className = 'p3-v';
    row.innerHTML = `<div class="p3-v-text">${it.text}</div>
      <div class="p3-v-btns">${choices.map((c) => `<button type="button" class="p3-v-btn">${c}</button>`).join('')}</div>
      <div class="pl-fb" aria-live="polite"></div>`;
    list.appendChild(row);
    if (k > 0 && !reduced()) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const fb = row.querySelector('.pl-fb');
    let wrongs = 0;
    row.querySelectorAll('.p3-v-btn').forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      const pick = b.textContent;
      const ok = answers.includes(pick);
      helpers.onPick?.({ prompt: it.text, concept: it.concept || slide.concept }, { label: `${pick}` }, ok, wrongs);
      recordLearning({ concept: it.concept || slide.concept, mistake: it.mistake, correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) {
        wrongs += 1;
        b.disabled = true; b.classList.add('no');
        fb.innerHTML = wrongs === 1 && it.hint ? `<strong>Try again.</strong> ${it.hint}` : (it.feedback || 'Not quite. Look at what the chart actually shows.');
        fb.className = 'pl-fb show bad';
        return;
      }
      row.querySelectorAll('.p3-v-btn').forEach((x) => { x.disabled = true; });
      row.querySelector('.p3-v-btns').innerHTML = `<span class="p3-stamp p3-stamp-${(it.tone || slide.tone || 'ok')}">${pick}${it.mark === false ? '' : ' ✓'}</span>`;
      row.classList.add('done');
      fb.innerHTML = it.why ? `<strong>✦</strong> ${it.why}` : '';
      fb.className = it.why ? 'pl-fb show good' : 'pl-fb';
      if (it.show && chart) chart.reveal(it.show);
      k += 1;
      if (k < items.length) setTimeout(addItem, reduced() ? 0 : 260);
      else finish();
    }));
  }
  function finish() {
    if (slide.footer) { foot.innerHTML = slide.footer; foot.classList.add('show'); }
    continueBtn(el, satisfy, slide.cta);
  }
  if (items.length) addItem(); else finish();
}

/* ── explore ────────────────────────────────────────────────────────── */

function renderExplore(el, slide, satisfy) {
  const cards = slide.cards || [];
  el.innerHTML = `<div class="lw-card p3-card">${head(slide)}
      ${slide.chart ? '<div class="p3-chart"></div>' : ''}
      ${slide.prompt ? `<div class="p3-prompt">${slide.prompt}</div>` : ''}
      <div class="p3-ex">${cards.map((c, i) => `<button type="button" class="p3-ex-chip" data-i="${i}" aria-expanded="false"><span class="p3-ex-ic">${c.icon || '•'}</span><span class="p3-ex-t">${c.title}</span><span class="p3-ex-b">${c.body}</span></button>`).join('')}</div>
      <div class="p3-ex-count">Tap each one · <b>0</b> / ${cards.length}</div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  maybeChart(card, slide);
  const seen = new Set();
  const count = card.querySelector('.p3-ex-count b');
  card.querySelectorAll('.p3-ex-chip').forEach((b) => b.addEventListener('click', () => {
    b.classList.add('open'); b.setAttribute('aria-expanded', 'true');
    seen.add(b.dataset.i);
    count.textContent = seen.size;
    if (seen.size === cards.length) {
      const foot = card.querySelector('.p3-foot');
      if (slide.footer) { foot.innerHTML = slide.footer; foot.classList.add('show'); }
      continueBtn(el, satisfy, slide.cta);
    }
  }));
}

/* ── literacy_entry ─────────────────────────────────────────────────── */

const ICC_STEPS = ['PIL', 'Indication', 'Correction', 'Continuation', 'Retest', 'Entry'];

function renderLiteracyEntry(el, slide, satisfy, helpers) {
  const lit = slide.literacy || {};
  const ent = slide.entry || {};
  const sort = slide.sort;
  el.innerHTML = `<div class="lw-card p3-card">${head(slide)}
      ${sort ? `<div class="p3-prompt">${sort.prompt || 'Where does each one belong?'}</div><div class="p3-le-tray"></div>` : ''}
      <div class="p3-le">
        <div class="p3-le-col p3-le-lit"><div class="p3-le-tag">📚 ${lit.title || 'Market literacy'}</div><div class="p3-le-sub">${lit.sub || 'Helps you understand the chart'}</div><ul class="p3-le-list">${(sort ? [] : lit.items || []).map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div class="p3-le-col p3-le-ent"><div class="p3-le-tag">✦ ${ent.title || 'Entry criteria'}</div><div class="p3-le-sub">${ent.sub || 'The Dayli ICC sequence'}</div>
          <ol class="p3-le-seq">${(ent.steps || ICC_STEPS).map((s) => `<li>${s}</li>`).join('')}</ol><ul class="p3-le-list"></ul></div>
      </div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  const foot = card.querySelector('.p3-foot');
  const finish = () => {
    if (slide.footer) { foot.innerHTML = slide.footer; foot.classList.add('show'); }
    continueBtn(el, satisfy, slide.cta);
  };
  if (!sort) { finish(); return; }
  const tray = card.querySelector('.p3-le-tray');
  const lists = { lit: card.querySelector('.p3-le-lit .p3-le-list'), entry: card.querySelector('.p3-le-ent .p3-le-list') };
  let k = 0;
  function next() {
    if (k >= sort.items.length) { tray.remove(); finish(); return; }
    const it = sort.items[k];
    let wrongs = 0;
    tray.innerHTML = `<div class="p3-le-item">${it.text}</div>
      <div class="p3-v-btns"><button type="button" class="p3-v-btn" data-s="lit">📚 Market literacy</button><button type="button" class="p3-v-btn" data-s="entry">✦ Entry criteria</button></div>
      <div class="pl-fb" aria-live="polite"></div>`;
    const fb = tray.querySelector('.pl-fb');
    tray.querySelectorAll('.p3-v-btn').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.s === it.side;
      helpers.onPick?.({ prompt: it.text, concept: sort.concept }, { label: b.textContent }, ok, wrongs);
      recordLearning({ concept: sort.concept, mistake: ok ? null : (it.mistake || 'context-equals-entry'), correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) {
        wrongs += 1; b.disabled = true; b.classList.add('no');
        fb.innerHTML = it.feedback || 'Not quite. Is it part of the entry sequence, or does it help you understand the chart?';
        fb.className = 'pl-fb show bad';
        return;
      }
      const li = document.createElement('li');
      li.className = 'p3-le-new';
      li.innerHTML = `${it.text}${it.why ? `<span>${it.why}</span>` : ''}`;
      lists[it.side].appendChild(li);
      k += 1;
      next();
    }));
  }
  next();
}

/* ── joke_checklist ─────────────────────────────────────────────────── */

function renderJokeChecklist(el, slide, satisfy) {
  const items = slide.items || [];
  el.innerHTML = `<div class="lw-card p3-card p3-joke">${head(slide)}
      <div class="p3-joke-sheet">
        <div class="p3-joke-title">${slide.sheetTitle || 'My entry checklist'}</div>
        <ul>${items.map((x) => `<li><span class="p3-joke-box" aria-hidden="true"></span>${x}</li>`).join('')}</ul>
        <div class="p3-joke-stamp" aria-hidden="true">${slide.stamp || 'ABSOLUTELY NOT.'}</div>
      </div>
      <button type="button" class="p3-joke-run">${slide.run || 'Run the checklist →'}</button>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  const lis = [...card.querySelectorAll('.p3-joke-sheet li')];
  const run = card.querySelector('.p3-joke-run');
  run.addEventListener('click', () => {
    run.remove();
    const gap = reduced() ? 0 : 260;
    lis.forEach((li, i) => setTimeout(() => li.classList.add('on'), gap * i));
    setTimeout(() => {
      card.querySelector('.p3-joke-sheet').classList.add('stamped');
      const foot = card.querySelector('.p3-foot');
      foot.innerHTML = `<div class="p3-joke-said" role="status">${slide.stamp || 'ABSOLUTELY NOT.'}</div>${slide.after || ''}`;
      foot.classList.add('show');
      continueBtn(el, satisfy, slide.cta);
    }, gap * lis.length + (reduced() ? 0 : 350));
  });
}

export const PHASE3_RENDERERS = {
  verdicts: renderVerdicts,
  explore: renderExplore,
  literacy_entry: renderLiteracyEntry,
  joke_checklist: renderJokeChecklist,
};
