/**
 * topdown.js — A Girl & Her Futures™
 *
 * Phase 4 (Finding Direction): the TOP-DOWN WORKSPACE. The student builds a
 * market thesis instead of answering questions about one:
 *
 *   STEP 1 · 4H — READ THE ROOM   →   STEP 2 · 1H — BUILD THE MAP
 *
 * with a CURRENT READ board (Analysis Board) and a THESIS BUILDER that fill
 * in as she works. The board never shows a signal: no buy / sell, no scores,
 * no percentages. Execution is always "not being evaluated yet".
 *
 *   td_workspace = {
 *     kicker, title, flow: 0 | 1 | 2      (LEARN → PRACTICE → BUILD YOUR READ)
 *     save: 'p4-3'                        persistence key (defaults to the lesson id)
 *     charts: { '4H': spec, '1H': spec }  structure-charts specs (ids start hidden)
 *     board:  ['4h.high', '4h.low', ...]  which rows to show (see ROWS)
 *     given:  { '4h.high': '21,040' }     rows already filled for this lesson
 *     thesis: true                        show the Thesis Builder panel
 *     tasks: [{
 *       do: 'pick',   tf, key, prompt, only, answer, value, notes: { i: text }, show, label
 *       do: 'choose', key, prompt, options: [{ label, correct, why, feedback, value }]
 *       do: 'tf',     to: '1H', label     (the BUILD THE MAP → transition)
 *       do: 'say'                          Aristella speaks, then Continue
 *       do: 'output', prompt, options      the generated thesis + "What now?" + save to notes
 *       say: Aristella's line when the task starts, after: her line once it's done,
 *       show / hide: chart ids revealed once the task is done
 *     }],
 *     cta
 *   }
 *
 * State persists in localStorage (`aghf_td:<save>`), so an unfinished read
 * survives a refresh. Every filled row is also mirrored into the shared
 * `aghf_topdown_read` (fourHour / oneHour / location / thesis) so later
 * sections and Phase 5 receive her analysis instead of starting from zero.
 * Section 2 adds LOCATION rows by adding keys to ROWS; nothing else changes.
 */

import { mountChart } from './structure-charts.js';
import { mountHost } from './lesson-v2.js';
import { recordLearning, askQuestion } from './price-lab.js';
import { saveLessonReflection } from './journal-service.js';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ── The Analysis Board: rows grouped as the read is built ──────────── */

export const ROWS = {
  '4h.high': ['4H ROOM', 'External High'],
  '4h.low': ['4H ROOM', 'External Low'],
  '4h.structure': ['4H ROOM', 'Structure'],
  '4h.location': ['4H ROOM', 'Location'],
  'loc.range': ['LOCATION', 'Range'],
  'loc.eq': ['LOCATION', 'Equilibrium'],
  'loc.zone': ['LOCATION', 'Premium / Discount'],
  'loc.room': ['LOCATION', 'Room to Objective'],
  '1h.structure': ['1H MAP', 'Structure'],
  '1h.swing': ['1H MAP', 'Relevant Swing'],
  '1h.mss': ['1H MAP', 'MSS'],
  '1h.relation': ['1H MAP', 'Relationship to 4H'],
};

const THESIS = {
  direction: 'Direction',
  evidence: 'Evidence',
  objective: 'Potential objective',
  invalidation: 'Invalidation',
  alternate: 'Alternate scenario',
};

/* topDownRead: the hand-off object later phases read. */
const READ_KEY = 'aghf_topdown_read';
const SCHEMA = {
  '4h.high': ['fourHour', 'externalHigh'], '4h.low': ['fourHour', 'externalLow'],
  '4h.structure': ['fourHour', 'structure'], '4h.location': ['fourHour', 'location'],
  'loc.range': ['location', 'range'], 'loc.eq': ['location', 'equilibrium'],
  'loc.zone': ['location', 'zone'], 'loc.room': ['location', 'roomToObjective'],
  '1h.structure': ['oneHour', 'structure'], '1h.swing': ['oneHour', 'relevantSwing'],
  '1h.mss': ['oneHour', 'mssState'], '1h.relation': ['oneHour', 'relationshipTo4H'],
  'thesis.direction': ['thesis', 'direction'], 'thesis.evidence': ['thesis', 'evidence'],
  'thesis.objective': ['fourHour', 'objective'], 'thesis.invalidation': ['thesis', 'invalidation'],
  'thesis.alternate': ['thesis', 'alternateScenario'], 'thesis.primary': ['thesis', 'primaryScenario'],
};

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function store(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage may be blocked */ }
}

/** Mirror one filled value into the shared topDownRead. */
export function recordRead(k, value) {
  const path = SCHEMA[k];
  if (!path) return;
  const read = load(READ_KEY) || { fourHour: {}, oneHour: {}, location: {}, thesis: {} };
  read[path[0]] = read[path[0]] || {};
  read[path[0]][path[1]] = value;
  read.updatedAt = Date.now();
  store(READ_KEY, read);
}
export function getTopDownRead() { return load(READ_KEY); }


/* On phones the 700-wide chart gets small: crop to the candles so they fill the width. */
export function phoneCrop(chart) {
  if (!chart || window.innerWidth >= 600) return;
  requestAnimationFrame(() => {
    try {
      const g = chart.svg.querySelector('.sc-candles');
      const bb = g && g.getBBox();
      if (!bb || !bb.width) return;
      const x = Math.max(0, bb.x - 14), y = Math.max(0, bb.y - 34);
      const w = Math.min(700 - x, bb.width + 70), h = Math.min(320 - y, bb.height + 70);
      chart.svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    } catch { /* not rendered yet */ }
  });
}

/* ── Small pieces of markup ─────────────────────────────────────────── */

function flowHtml(k) {
  return `<div class="td-flow">${['LEARN', 'PRACTICE', 'BUILD YOUR READ'].map((x, i) => (i === k ? `<b>${x}</b>` : `<span>${x}</span>`)).join('<i>→</i>')}</div>`;
}

function guideHtml() {
  return `<div class="ag-guide td-guide"><div class="ag-face" aria-hidden="true"></div><div class="ag-bubble"><div class="ag-name">Aristella</div><div class="td-say" aria-live="polite"></div></div></div>`;
}

/* ── td_workspace ───────────────────────────────────────────────────── */

export function renderWorkspace(el, slide, satisfy, helpers = {}) {
  const tasks = slide.tasks || [];
  const tfs = Object.keys(slide.charts || {});
  const hasTwo = tfs.includes('1H') && tfs.includes('4H');
  const saveKey = `aghf_td:${slide.save || helpers.lessonId || 'workspace'}`;
  const saved = load(saveKey);
  const state = saved && saved.v === 1 ? saved : { v: 1, k: 0, vals: {}, tf: tfs[0] || '4H', picks: {} };
  Object.entries(slide.given || {}).forEach(([k, v]) => { if (state.vals[k] == null) state.vals[k] = v; });
  const persist = () => store(saveKey, state);

  const boardKeys = slide.board || [];
  // Only show the thesis fields this screen fills in or was given.
  const usedKeys = new Set([...tasks.map((t) => t.key), ...Object.keys(slide.given || {})].filter(Boolean));
  const groups = [];
  boardKeys.forEach((k) => {
    const [g] = ROWS[k] || ['READ'];
    if (!groups.includes(g)) groups.push(g);
  });

  el.innerHTML = `<div class="lw-card td-ws">
      ${flowHtml(slide.flow ?? 1)}
      ${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
      ${slide.title ? `<h2 class="td-title">${slide.title}</h2>` : ''}
      ${hasTwo ? `<div class="td-steps">
        <button type="button" class="td-step" data-tf="4H"><small>STEP 1</small><span>4H — Read the Room</span></button>
        <i class="td-arrow" aria-hidden="true">→</i>
        <button type="button" class="td-step" data-tf="1H"><small>STEP 2</small><span>1H — Build the Map</span></button>
      </div>` : ''}
      <div class="td-stage">${tfs.map((tf) => `<div class="td-tf" data-tf="${tf}"><span class="td-tf-tag">${tf === '1H' && hasTwo ? '1H · inside the 4H room' : tf}</span><div class="td-chart"></div></div>`).join('')}</div>
      ${guideHtml()}
      <div class="td-task"></div>
      <div class="td-panels${slide.thesis ? '' : ' td-one'}">
        ${boardKeys.length ? `<div class="td-panel td-board">
          <div class="td-ph">CURRENT READ <span class="td-count"></span></div>
          ${groups.map((g) => `<div class="td-grp">${g}</div>${boardKeys.filter((k) => (ROWS[k] || ['READ'])[0] === g).map((k) => `<div class="td-row" data-k="${k}"><span class="td-ck" aria-hidden="true">✓</span><b>${(ROWS[k] || [g, k])[1]}</b><em></em></div>`).join('')}`).join('')}
        </div>` : ''}
        ${slide.thesis ? `<div class="td-panel td-thesis">
          <div class="td-ph">THESIS BUILDER</div>
          ${Object.entries(THESIS).filter(([k]) => usedKeys.has(`thesis.${k}`)).map(([k, label]) => `<div class="td-field" data-k="thesis.${k}"><label>${label.toUpperCase()}</label><div class="td-slot">○</div></div>`).join('')}
          <div class="td-exec">⏸ EXECUTION · NOT BEING EVALUATED YET</div>
        </div>` : ''}
      </div>
    </div>`;

  const card = el.querySelector('.td-ws');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  const say = card.querySelector('.td-say');
  const taskBox = card.querySelector('.td-task');
  const talk = (html, tone = '') => { say.innerHTML = html || ''; say.className = `td-say ${tone}`; };

  const charts = {};
  tfs.forEach((tf) => {
    charts[tf] = mountChart(card.querySelector(`.td-tf[data-tf="${tf}"] .td-chart`), slide.charts[tf], { label: `${tf} chart` });
    phoneCrop(charts[tf]);
  });

  function setTf(tf, animate) {
    state.tf = tf;
    card.querySelectorAll('.td-tf').forEach((n) => {
      const on = n.dataset.tf === tf;
      n.classList.toggle('on', on);
      if (on && animate && !reduced()) { n.classList.remove('td-in'); void n.offsetWidth; n.classList.add('td-in'); }
    });
    card.querySelectorAll('.td-step').forEach((b) => {
      b.classList.toggle('on', b.dataset.tf === tf);
      b.classList.toggle('done', b.dataset.tf === '4H' && tf === '1H');
    });
  }

  /* Board + thesis rendering from state */
  function paint() {
    let filled = 0;
    card.querySelectorAll('.td-row').forEach((r) => {
      const v = state.vals[r.dataset.k];
      r.classList.toggle('ok', v != null);
      if (v != null) filled += 1;
      r.querySelector('em').textContent = v ?? '';
    });
    const cur = tasks[state.k];
    card.querySelectorAll('.td-row').forEach((r) => r.classList.toggle('now', !!cur && cur.key === r.dataset.k && state.vals[r.dataset.k] == null));
    const cnt = card.querySelector('.td-count');
    if (cnt) cnt.textContent = `${filled} / ${boardKeys.length}`;
    card.querySelectorAll('.td-field').forEach((f) => {
      const v = state.vals[f.dataset.k];
      const slot = f.querySelector('.td-slot');
      f.classList.toggle('ok', v != null);
      f.classList.toggle('now', !!cur && cur.key === f.dataset.k && v == null);
      slot.innerHTML = v == null ? '○' : Array.isArray(v) ? v.map((x) => `<span class="td-chip">${x}</span>`).join('') : v;
    });
  }

  function fill(key, value) {
    if (!key) return;
    state.vals[key] = value;
    recordRead(key, value);
  }

  // Early jump to 1H before the room is defined: the "electric" nudge.
  card.querySelectorAll('.td-step').forEach((b) => b.addEventListener('click', () => {
    const tf = b.dataset.tf;
    if (tf === state.tf) return;
    const tfIdx = tasks.findIndex((t) => t.do === 'tf');
    if (tf === '1H' && tfIdx > -1 && state.k < tfIdx) {
      talk(`<strong>Before we zoom in…</strong> where are the doors? Mark the 4H range first.`, 'bad');
      card.querySelector('.td-tf[data-tf="4H"]').classList.add('td-pulse');
      setTimeout(() => card.querySelector('.td-tf[data-tf="4H"]').classList.remove('td-pulse'), 1200);
      return;
    }
    setTf(tf, true);
  }));

  function finishTask(t) {
    const ch = charts[t.tf || state.tf];
    if (ch) {
      if (t.show) ch.reveal(t.show);
      if (t.hide) ch.hide(t.hide);
    }
    if (t.after) talk(t.after, 'good');
    state.k += 1;
    persist();
    paint();
    const next = () => run();
    if (t.do === 'pick' || t.do === 'choose') {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'td-next';
      b.textContent = state.k < tasks.length ? 'Next →' : (slide.cta || 'Continue →');
      b.addEventListener('click', () => { b.remove(); next(); });
      taskBox.appendChild(b);
    } else next();
  }

  /* Re-apply what earlier tasks revealed (after a refresh or Back). */
  function replayDone() {
    tasks.slice(0, state.k).forEach((t) => {
      const ch = charts[t.tf || '4H'] || charts[tfs[0]];
      if (t.do === 'pick' && ch) {
        ch.setPoint(t.answer, 'good');
        if (t.label) ch.label(t.answer, t.label, t.tone || 'purple');
      }
      if (ch && t.show) ch.reveal(t.show);
      if (ch && t.hide) ch.hide(t.hide);
    });
  }

  function doPick(t) {
    const ch = charts[t.tf || state.tf];
    if (t.tf && t.tf !== state.tf) setTf(t.tf, true);
    taskBox.innerHTML = `<div class="td-prompt">👆 ${t.prompt}</div><div class="pl-fb" aria-live="polite"></div>`;
    const fb = taskBox.querySelector('.pl-fb');
    let wrongs = 0, solved = false;
    ch.wrap.classList.add('sc-tappable');
    ch.points.forEach((p, idx) => {
      p.classList.remove('sc-tap');
      p.onclick = null;
      if (t.only && !t.only.includes(idx)) return;
      p.classList.add('sc-tap');
      p.onclick = () => {
        if (solved) return;
        const ok = [].concat(t.answer).includes(idx);
        helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: `Swing ${idx}` }, ok, wrongs);
        recordLearning({ concept: t.concept, mistake: ok ? null : (t.mistakes || {})[idx] || t.mistake, correct: ok });
        helpers.handleStreak?.(ok);
        if (!ok) {
          wrongs += 1;
          ch.setPoint(idx, 'bad'); ch.flash();
          setTimeout(() => ch.setPoint(idx, null), 700);
          fb.innerHTML = (t.notes || {})[idx] || (wrongs === 1 && t.hint ? `<strong>Try again.</strong> ${t.hint}` : 'Look at which swing defines the structure you’re reading right now.');
          fb.className = 'pl-fb show bad';
          talk(fb.innerHTML, 'bad');
          return;
        }
        solved = true;
        ch.points.forEach((q) => { q.classList.remove('sc-tap'); q.onclick = null; });
        ch.wrap.classList.remove('sc-tappable');
        ch.setPoint(idx, 'good');
        if (t.label) ch.label(idx, t.label, t.tone || 'purple');
        fb.innerHTML = `<strong>✦</strong> ${t.why || 'That’s the one.'}`;
        fb.className = 'pl-fb show good';
        fill(t.key, t.value);
        finishTask(t);
      };
    });
  }

  function doChoose(t) {
    taskBox.innerHTML = '';
    const q = { prompt: t.prompt, options: t.options, concept: t.concept, hint: t.hint, stack: t.stack };
    askQuestion(taskBox, q, helpers, () => {
      const right = t.options.find((o) => o.correct);
      fill(t.key, t.value ?? right?.value ?? right?.label);
      finishTask(t);
    });
  }

  function doTf(t) {
    taskBox.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'td-go';
    b.textContent = t.label || 'BUILD THE MAP →';
    b.addEventListener('click', () => { setTf(t.to || '1H', true); b.remove(); finishTask(t); });
    taskBox.appendChild(b);
  }

  function doSay(t) {
    taskBox.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'td-next';
    b.textContent = t.label || 'Next →';
    b.addEventListener('click', () => { b.remove(); finishTask(t); });
    taskBox.appendChild(b);
  }

  function doOutput(t) {
    taskBox.innerHTML = '';
    const sections = t.sections || [
      ['4H ROOM', ['4h.high', '4h.low', '4h.structure', '4h.location']],
      ['1H MAP', ['1h.structure', '1h.swing', '1h.mss', '1h.relation']],
      ['CURRENT THESIS', ['thesis.direction', 'thesis.evidence']],
      ['POTENTIAL OBJECTIVE', ['thesis.objective']],
      ['INVALIDATION', ['thesis.invalidation']],
      ['ALTERNATE SCENARIO', ['thesis.alternate']],
    ];
    const label = (k) => (ROWS[k] ? ROWS[k][1] : THESIS[k.split('.')[1]] || k);
    const val = (k) => { const v = state.vals[k]; return Array.isArray(v) ? v.join(' · ') : v; };
    const missing = sections.flatMap(([, ks]) => ks).filter((k) => (t.required || []).includes(k) && val(k) == null);
    const box = document.createElement('div');
    box.className = 'td-output';
    if (missing.length) {
      box.innerHTML = `<div class="td-incomplete"><b>INCOMPLETE THESIS</b>Finish these first: ${missing.map(label).join(', ')}.</div>`;
      taskBox.appendChild(box);
      return;
    }
    box.innerHTML = `<div class="td-out-k">✦ BUILT FROM YOUR ANSWERS</div><h3>${t.title || 'My AGHF Market Thesis'}</h3>
      <div class="td-out-grid">${sections.map(([h, ks]) => {
        const parts = ks.map((k) => (val(k) != null ? `<span><i>${label(k)}</i>${val(k)}</span>` : '')).filter(Boolean);
        if (!parts.length) return '';
        const cls = h === 'INVALIDATION' ? ' inv' : h === 'ALTERNATE SCENARIO' ? ' alt' : '';
        return `<div class="td-out-c${cls}"><small>${h}${h === 'INVALIDATION' ? ' · my analysis changes' : ''}</small>${parts.join('')}</div>`;
      }).join('')}</div>`;
    taskBox.appendChild(box);
    const finish = () => {
      const save = document.createElement('div');
      save.className = 'td-save';
      save.innerHTML = `<button type="button">Save to My Academy Notes →</button><span></span>`;
      save.querySelector('button').addEventListener('click', (e) => {
        const text = sections.map(([h, ks]) => {
          const parts = ks.map((k) => (val(k) != null ? `${label(k)}: ${val(k)}` : null)).filter(Boolean);
          return parts.length ? `${h}\n${parts.join('\n')}` : null;
        }).filter(Boolean).join('\n\n');
        const prompt = t.title || 'My AGHF Market Thesis';
        try {
          const notes = JSON.parse(localStorage.getItem('aghf_notes') || '[]');
          notes.push({ lessonId: helpers.lessonId || slide.save, prompt, text, savedAt: Date.now() });
          localStorage.setItem('aghf_notes', JSON.stringify(notes));
          const reads = JSON.parse(localStorage.getItem('aghf_market_reads') || '[]');
          reads.push({ id: `${slide.save || helpers.lessonId}-${Date.now()}`, title: prompt, vals: state.vals, savedAt: Date.now() });
          localStorage.setItem('aghf_market_reads', JSON.stringify(reads));
        } catch { /* ignore */ }
        saveLessonReflection(helpers.lessonId || slide.save, prompt, text).catch((err) => console.error('Server reflection save error:', err));
        e.target.disabled = true;
        save.querySelector('span').textContent = '✓ Saved to My Academy Notes';
        talk(t.saved || 'Saved. That’s your first real read, in your own words and levels. 💗', 'good');
        state.k += 1; persist(); paint();
        continueBtn();
      });
      taskBox.appendChild(save);
    };
    if (t.options) {
      const q = { prompt: t.prompt || 'WHAT DO YOU DO NOW?', options: t.options, stack: true, concept: t.concept };
      askQuestion(taskBox, q, helpers, finish);
    } else finish();
  }

  function continueBtn() {
    if (el.querySelector(':scope > .lw-continue-btn')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
    b.addEventListener('click', satisfy);
    el.appendChild(b);
  }

  function run() {
    paint();
    const t = tasks[state.k];
    if (!t) { taskBox.innerHTML = ''; if (slide.outro) talk(slide.outro, 'good'); continueBtn(); return; }
    if (t.say) talk(t.say);
    if (t.tf && t.tf !== state.tf && t.do !== 'tf') setTf(t.tf, true);
    if (t.do === 'pick') doPick(t);
    else if (t.do === 'choose') doChoose(t);
    else if (t.do === 'tf') doTf(t);
    else if (t.do === 'output') doOutput(t);
    else {
      // A "say" step describes what's on the chart, so draw it now.
      const ch = charts[t.tf || state.tf];
      if (ch && t.show) ch.reveal(t.show);
      doSay(t);
    }
  }

  setTf(state.tf in charts ? state.tf : tfs[0]);
  replayDone();
  if (state.k > 0 && state.k < tasks.length) talk('Welcome back. Your read is right where you left it. 💗');
  run();
}

/* ── scenario_builder: IF / AND / THEN, primary + alternate side by side ── */
// slide = { kicker, title, body, save, cards: [{ key: 'primary'|'alternate', title, tone,
//   slots: [{ word: 'IF', options: [{ label, ok, feedback }] }] }], say, outro }
// Neither card is "right" or "wrong": one reflects current evidence, the other
// defines what could change the read.

export function renderScenarioBuilder(el, slide, satisfy, helpers = {}) {
  const cards = slide.cards || [];
  el.innerHTML = `<div class="lw-card td-sb">
      ${flowHtml(slide.flow ?? 2)}
      ${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
      ${slide.title ? `<h2 class="td-title">${slide.title}</h2>` : ''}
      ${slide.chart ? '<div class="td-sb-chart"></div>' : ''}
      ${guideHtml()}
      <div class="td-sb-cards">${cards.map((c, ci) => `<div class="td-sb-card ${c.tone || (ci ? 'alt' : 'pri')}" data-c="${ci}">
          <div class="td-sb-h">${c.title}</div>
          ${c.slots.map((s, si) => `<div class="td-sb-slot" data-s="${si}"><span class="td-sb-w">${s.word}</span><div class="td-sb-fill">tap to choose</div></div>`).join('')}
        </div>`).join('')}</div>
      <div class="td-sb-pick"></div>
    </div>`;
  const card = el.querySelector('.td-sb');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  if (slide.chart) phoneCrop(mountChart(card.querySelector('.td-sb-chart'), slide.chart, { label: slide.title }));
  const say = card.querySelector('.td-say');
  const talk = (html, tone = '') => { say.innerHTML = html || ''; say.className = `td-say ${tone}`; };
  talk(slide.say || 'Build both stories. One reflects the evidence now. The other tells you what would change the read.');
  const order = cards.flatMap((c, ci) => c.slots.map((s, si) => [ci, si]));
  let k = 0;
  const pick = card.querySelector('.td-sb-pick');

  function step() {
    card.querySelectorAll('.td-sb-slot').forEach((n) => n.classList.remove('now'));
    if (k >= order.length) {
      pick.innerHTML = '';
      cards.forEach((c) => {
        if (!c.key) return;
        const text = c.slots.map((s) => `${s.word} ${s.chosen}`).join(' ');
        recordRead(`thesis.${c.key}`, text);
      });
      talk(slide.outro || 'Two stories, both conditional. That’s a thesis that tells you what you’d need to see.', 'good');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
      b.addEventListener('click', satisfy);
      el.appendChild(b);
      return;
    }
    const [ci, si] = order[k];
    const slot = cards[ci].slots[si];
    const node = card.querySelector(`.td-sb-card[data-c="${ci}"] .td-sb-slot[data-s="${si}"]`);
    node.classList.add('now');
    if (slot.say) talk(slot.say);
    pick.innerHTML = `<div class="td-prompt">${cards[ci].title}: <b>${slot.word}</b>…</div><div class="td-sb-opts">${slot.options.map((o, oi) => `<button type="button" class="td-sb-opt" data-o="${oi}">${o.label}</button>`).join('')}</div>`;
    let wrongs = 0;
    pick.querySelectorAll('.td-sb-opt').forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      const o = slot.options[+b.dataset.o];
      helpers.onPick?.({ prompt: `${cards[ci].title} ${slot.word}`, concept: slide.concept }, { label: o.label }, !!o.ok, wrongs);
      recordLearning({ concept: slide.concept || 'scenario-thinking', mistake: o.ok ? null : o.mistake, correct: !!o.ok });
      helpers.handleStreak?.(!!o.ok);
      if (!o.ok) {
        wrongs += 1; b.disabled = true; b.classList.add('no');
        talk(o.feedback || 'That doesn’t fit this story. Look at the structure again.', 'bad');
        return;
      }
      slot.chosen = o.label;
      node.querySelector('.td-sb-fill').textContent = o.label;
      node.classList.add('ok');
      if (o.why) talk(o.why, 'good');
      k += 1;
      step();
    }));
  }
  step();
}

export const TOPDOWN_RENDERERS = { td_workspace: renderWorkspace, scenario_builder: renderScenarioBuilder };

/* ── td_zoom: 1M → 5M → 15M → 1H → 4H, noise fading as you zoom out ── */
// slide = { kicker, title, swings: [[t, price]] (4H story, t in 4H candles), seed,
//   frames: [{ tf, say }], pick: { prompt, options: ['1M','15M','4H'], answer: '4H', why, feedback },
//   room: { high: price, low: price, steps: [{ say, show: ['doors'|'room'|'now'|'corr'] }] } }

const TICKS = 4; // price ticks per minute, so even a 1M candle has a body and wicks

function minuteSeries(swings, seed) {
  // Brownian bridge through the 4H swing points, one value per minute.
  let s = (seed || 7) * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
  const out = [];
  for (let i = 0; i < swings.length - 1; i++) {
    const [t0, p0] = swings[i], [t1, p1] = swings[i + 1];
    const n = Math.round((t1 - t0) * 240 * TICKS);
    let walk = 0;
    const w = [];
    for (let k = 0; k < n; k++) { walk += rnd() * 1.3; w.push(walk); }
    for (let k = 0; k < n; k++) {
      const f = k / n;
      out.push(p0 + (p1 - p0) * f + (w[k] - w[n - 1] * f) + rnd() * 0.9);
    }
  }
  out.push(swings[swings.length - 1][1]);
  return out;
}

function aggregate(series, per, count) {
  const bars = [];
  const start = Math.max(0, series.length - per * count);
  for (let i = start; i + per <= series.length; i += per) {
    const seg = series.slice(i, i + per);
    bars.push({ o: seg[0], c: seg[seg.length - 1], h: Math.max(...seg), l: Math.min(...seg) });
  }
  return bars;
}

function toSpec(bars, extra = {}) {
  const hi = Math.max(...bars.map((b) => b.h)), lo = Math.min(...bars.map((b) => b.l));
  const pad = (hi - lo) * 0.08 || 1;
  const Y = (p) => 30 + (1 - (p - (lo - pad)) / (hi - lo + 2 * pad)) * 260;
  const step = 600 / bars.length;
  const out = bars.map((b, i) => {
    const o = Y(b.o), c = Y(b.c);
    return { x: +(40 + step * (i + 0.5)).toFixed(1), o: +o.toFixed(1), c: +(Math.abs(c - o) < 0.6 ? c + 0.6 : c).toFixed(1), h: +Y(b.h).toFixed(1), l: +Y(b.l).toFixed(1), w: +Math.max(2, step * 0.6).toFixed(1) };
  });
  out.forEach((b) => { b.h = Math.min(b.h, b.o, b.c); b.l = Math.max(b.l, b.o, b.c); });
  return { spec: { swings: [[out[0].x, out[0].o], [out[out.length - 1].x, out[out.length - 1].c]], candles: false, bars: out, ...extra }, Y };
}

const TF_MIN = { '1M': 1, '5M': 5, '15M': 15, '1H': 60, '4H': 240 };

export function renderZoom(el, slide, satisfy, helpers = {}) {
  const series = minuteSeries(slide.swings, slide.seed);
  const frames = slide.frames || [{ tf: '1M' }, { tf: '5M' }, { tf: '15M' }, { tf: '1H' }, { tf: '4H' }];
  const count = slide.count || 46;
  const build = (tf, extra) => toSpec(aggregate(series, TF_MIN[tf] * TICKS, count), extra);
  el.innerHTML = `<div class="lw-card td-zoom">
      ${flowHtml(slide.flow ?? 0)}
      ${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
      ${slide.title ? `<h2 class="td-title">${slide.title}</h2>` : ''}
      <div class="td-zoom-tfs">${frames.map((f, i) => `<span data-i="${i}">${f.tf}</span>`).join('')}</div>
      <div class="td-stage"><div class="td-tf on"><span class="td-tf-tag"></span><div class="td-chart"></div></div></div>
      ${guideHtml()}
      <div class="td-task"></div>
    </div>`;
  const card = el.querySelector('.td-zoom');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  const say = card.querySelector('.td-say');
  const talk = (html, tone = '') => { say.innerHTML = html || ''; say.className = `td-say ${tone}`; };
  const holder = card.querySelector('.td-chart');
  const tag = card.querySelector('.td-tf-tag');
  const task = card.querySelector('.td-task');
  let chart = null;

  function show(tf, extra) {
    holder.innerHTML = '';
    const { spec, Y } = build(tf, extra ? extra(build(tf).Y) : {});
    chart = mountChart(holder, spec, { label: `${tf} chart` });
    tag.textContent = tf;
    const st = card.querySelector('.td-tf');
    if (!reduced()) { st.classList.remove('td-in'); void st.offsetWidth; st.classList.add('td-in'); }
    return Y;
  }

  let i = 0;
  function frame() {
    const f = frames[i];
    card.querySelectorAll('.td-zoom-tfs span').forEach((n) => { n.classList.toggle('on', +n.dataset.i === i); n.classList.toggle('done', +n.dataset.i < i); });
    show(f.tf);
    talk(f.say || '');
    task.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'td-go';
    b.textContent = i < frames.length - 1 ? `Zoom out → ${frames[i + 1].tf}` : 'Stop here';
    b.addEventListener('click', () => { i += 1; if (i < frames.length) frame(); else choose(); });
    task.appendChild(b);
  }

  function choose() {
    const pk = slide.pick;
    if (!pk) { room(); return; }
    talk(pk.say || 'Three views of the same market. Which one helps you understand the bigger environment?');
    task.innerHTML = `<div class="td-prompt">${pk.prompt}</div><div class="td-thumbs">${pk.options.map((tf) => `<button type="button" class="td-thumb" data-tf="${tf}"><span>${tf}</span><div class="td-thumb-c"></div></button>`).join('')}</div><div class="pl-fb" aria-live="polite"></div>`;
    task.querySelectorAll('.td-thumb').forEach((b) => {
      mountChart(b.querySelector('.td-thumb-c'), build(b.dataset.tf).spec, { label: `${b.dataset.tf} preview` });
      b.addEventListener('click', () => {
        const ok = b.dataset.tf === pk.answer;
        recordLearning({ concept: pk.concept || '4h-room', mistake: ok ? null : 'ltf-for-context', correct: ok });
        helpers.handleStreak?.(ok);
        const fb = task.querySelector('.pl-fb');
        if (!ok) { b.classList.add('no'); fb.innerHTML = pk.feedback || 'That view is busy with movement. Which one shows the larger story?'; fb.className = 'pl-fb show bad'; return; }
        b.classList.add('ok');
        fb.innerHTML = `<strong>✦</strong> ${pk.why || ''}`; fb.className = 'pl-fb show good';
        const go = document.createElement('button');
        go.type = 'button'; go.className = 'td-go'; go.textContent = 'NOW FIND THE ROOM →';
        go.addEventListener('click', room);
        task.appendChild(go);
      });
    });
  }

  function room() {
    const r = slide.room;
    if (!r) { done(); return; }
    const last = frames[frames.length - 1].tf;
    const extra = (Y) => ({
      hlines: [
        { y: Y(r.high), label: 'EXTERNAL HIGH', tone: 'purple', door: true, id: 'doors', x1: r.x1 ?? 300, labelX: r.labelX ?? 470 },
        { y: Y(r.low), label: 'EXTERNAL LOW', tone: 'purple', door: true, id: 'doors', x1: r.x1 ?? 300, labelX: r.labelX ?? 470, below: true },
      ],
      boxes: [{ x1: r.x1 ?? 300, y1: Y(r.high), x2: 692, y2: Y(r.low), tone: 'purple', op: 0.45, dashed: false, stroke: false, rx: 6, id: 'room' }],
      notes: (r.notes || []).map((n) => ({ x: n.x, y: n.price != null ? Y(n.price) : n.y, text: n.text, tone: n.tone || 'muted', size: n.size || 13, id: n.id })),
    });
    show(last, extra);
    card.querySelectorAll('.td-zoom-tfs span').forEach((n) => n.classList.add('done'));
    let k = 0;
    const steps = r.steps || [];
    function next() {
      const st = steps[k];
      if (!st) { done(); return; }
      talk(st.say);
      if (st.show) chart.reveal(st.show);
      task.innerHTML = '';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'td-next'; b.textContent = k < steps.length - 1 ? 'Next →' : 'Got it →';
      b.addEventListener('click', () => { k += 1; next(); });
      task.appendChild(b);
    }
    next();
  }

  function done() {
    task.innerHTML = '';
    if (slide.outro) talk(slide.outro, 'good');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
    b.addEventListener('click', satisfy);
    el.appendChild(b);
  }
  frame();
}

/* ── before_after: drag a slider between an old map and an updated one ── */
// slide = { kicker, title, before: { label, chart, rows: [[k, v]] }, after: {…}, say, outro }

export function renderBeforeAfter(el, slide, satisfy) {
  const side = (s, k) => `<div class="td-ba-rows ${k}"><small>${s.label}</small>${(s.rows || []).map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>`;
  el.innerHTML = `<div class="lw-card td-ba">
      ${flowHtml(slide.flow ?? 0)}
      ${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
      ${slide.title ? `<h2 class="td-title">${slide.title}</h2>` : ''}
      <div class="td-ba-stage"><div class="td-ba-layer before"></div><div class="td-ba-layer after"></div>
        <span class="td-ba-tag l">${slide.before.label}</span><span class="td-ba-tag r">${slide.after.label}</span></div>
      <input class="td-ba-range" type="range" min="0" max="100" value="50" aria-label="Slide between before and after">
      <div class="td-ba-grid">${side(slide.before, 'b')}${side(slide.after, 'a')}</div>
      ${guideHtml()}
    </div>
    <button type="button" class="lw-continue-btn">${slide.cta || 'Continue →'}</button>`;
  const card = el.querySelector('.td-ba');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  card.querySelector('.td-say').innerHTML = slide.say || 'Drag the slider. Same chart, before and after price gave new information.';
  mountChart(card.querySelector('.before'), slide.before.chart, { label: slide.before.label });
  mountChart(card.querySelector('.after'), slide.after.chart, { label: slide.after.label });
  const after = card.querySelector('.after');
  const range = card.querySelector('.td-ba-range');
  const set = () => { after.style.clipPath = `inset(0 0 0 ${range.value}%)`; };
  range.addEventListener('input', set);
  set();
  el.querySelector('.lw-continue-btn').addEventListener('click', satisfy);
}

TOPDOWN_RENDERERS.td_zoom = renderZoom;
TOPDOWN_RENDERERS.before_after = renderBeforeAfter;

/* ── td_compare: two charts side by side + a question ───────────────── */
// slide = { kicker, title, flow, a: { label, chart, note }, b: {…}, say, asks: [question], outro }

export function renderCompare(el, slide, satisfy, helpers = {}) {
  const pane = (s, k) => `<div class="td-cmp-pane ${k}"><span class="td-cmp-tag">${s.label}</span><div class="td-chart"></div>${s.note ? `<div class="td-cmp-note">${s.note}</div>` : ''}</div>`;
  el.innerHTML = `<div class="lw-card td-cmp">
      ${flowHtml(slide.flow ?? 1)}
      ${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
      ${slide.title ? `<h2 class="td-title">${slide.title}</h2>` : ''}
      <div class="td-cmp-grid">${pane(slide.a, 'a')}${pane(slide.b, 'b')}</div>
      ${guideHtml()}
      <div class="td-task"></div>
    </div>`;
  const card = el.querySelector('.td-cmp');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  const say = card.querySelector('.td-say');
  say.innerHTML = slide.say || '';
  mountChart(card.querySelector('.td-cmp-pane.a .td-chart'), slide.a.chart, { label: slide.a.label });
  mountChart(card.querySelector('.td-cmp-pane.b .td-chart'), slide.b.chart, { label: slide.b.label });
  const task = card.querySelector('.td-task');
  const asks = slide.asks || [];
  let k = 0;
  const done = () => {
    if (slide.outro) { say.innerHTML = slide.outro; say.className = 'td-say good'; }
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = slide.cta || 'Continue →';
    b.addEventListener('click', satisfy);
    el.appendChild(b);
  };
  const next = () => { if (k >= asks.length) { done(); return; } askQuestion(task, asks[k++], helpers, next); };
  next();
}
TOPDOWN_RENDERERS.td_compare = renderCompare;
