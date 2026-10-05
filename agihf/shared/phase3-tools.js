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
import { recordLearning, mistakeNudge, askQuestion } from './price-lab.js';
import { mountHost } from './lesson-v2.js';

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
// Aristella's clue cards: the chart she just read stays on top, Aristella
// reads one clue at a time, she answers with big tiles, Aristella reacts in
// her bubble, and each solved clue drops into the case notes below.

const TILE = {
  'CHART SHOWS': ['👀', 'I can point to it on the chart'],
  'REASONABLE INFERENCE': ['🤔', 'Makes sense, but not proven'],
  'CAN’T PROVE': ['🚫', 'A chart can’t tell us that'],
  'CAN\'T PROVE': ['🚫', 'A chart can’t tell us that'],
  'MYTH': ['🧢', 'Sounds good, not true'],
  'FACT': ['✅', 'True every time'],
  'YES': ['✅', ''], 'NO': ['❌', ''],
  'NOT ENOUGH INFO': ['🤷🏾‍♀️', 'The chart doesn’t say'],
  'OBJECTIVE': ['📏', 'Just what happened'],
  'STORY': ['📖', 'A tale we added'],
  'OBSERVATION': ['👀', 'On the chart'],
  'INTERPRETATION': ['🤔', 'A fair read of it'],
  'UNSUPPORTED CLAIM': ['🚫', 'No proof for that'],
  'CAN ANSWER': ['✅', 'The chart shows it'],
  'CAN’T ANSWER': ['🚫', 'Not on a chart'],
  'USEFUL': ['💡', 'Helps the read'],
  'NOT USEFUL': ['🙅🏾‍♀️', 'Leads you astray'],
  'FAIR': ['👍🏾', 'Said carefully'],
  'OVERSTATED': ['📢', 'Says too much'],
  'POOL AREA': ['💧', 'Orders may gather here'],
  'NOT REALLY': ['🤷🏾‍♀️', 'Nothing obvious'],
  'PROVEN': ['✅', ''], 'NOT PROVEN': ['🚫', ''],
};
const DEFAULT_INTRO = 'Detective mode. I’ll read you one clue at a time about this chart. You tell me what kind of clue it is.';

function renderVerdicts(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  const base = slide.choices || ['YES', 'NO'];
  const chartData = slide.chart || (slide.chart === false ? null : helpers?.contextChart);
  const columns = base.length <= 3 && !items.some((it) => it.choices);
  el.innerHTML = `<div class="lw-card p3-card p3-case">${head(slide)}
      ${mistakeNudge(slide.watch)}
      ${chartData ? `<div class="p3-case-chartwrap">${slide.chart ? '' : '<span class="p3-case-tag">The chart we’re reading</span>'}<div class="p3-chart"></div></div>` : ''}
      <div class="ag-guide p3-case-guide"><div class="ag-face" aria-hidden="true"></div><div class="ag-bubble"><div class="ag-name">Aristella</div><div class="p3-case-say" aria-live="polite"></div></div></div>
      <div class="p3-case-stage"></div>
      <div class="p3-case-notes">
        <div class="p3-case-notes-h">📁 Case notes <b>0</b> / ${items.length}</div>
        ${columns ? `<div class="p3-case-cols">${base.map((c) => `<div class="p3-case-col" data-c="${c}"><div class="p3-case-col-h">${(TILE[c] || [''])[0]} ${c}</div></div>`).join('')}</div>` : '<div class="p3-case-list"></div>'}
      </div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-case');
  mountHost(card.querySelector('.ag-face'), 'idle', '30 20 340 340');
  if (chartData) {
    const chart = mountChart(card.querySelector('.p3-chart'), chartData, { label: slide.title });
    if (slide.levels) mountLevels(chart, slide.levels);
    card._chart = chart;
  }
  const say = card.querySelector('.p3-case-say');
  const stage = card.querySelector('.p3-case-stage');
  const count = card.querySelector('.p3-case-notes-h b');
  const foot = card.querySelector('.p3-foot');
  const talk = (html, tone = '') => { say.innerHTML = html; say.className = `p3-case-say ${tone}`; };
  talk(slide.intro || (slide.prompt && slide.prompt !== 'Sort each statement.' ? `${DEFAULT_INTRO.split('.')[0]}. ${slide.prompt}` : DEFAULT_INTRO));
  let k = 0;

  function file(it, pick, tone) {
    const chip = `<div class="p3-case-note p3-case-${tone}">${it.text}${columns ? '' : ` <span>→ ${pick}</span>`}</div>`;
    const col = columns && card.querySelector(`.p3-case-col[data-c="${CSS.escape(pick)}"]`);
    (col || card.querySelector('.p3-case-list') || card.querySelector('.p3-case-cols')).insertAdjacentHTML('beforeend', chip);
    count.textContent = k + 1;
  }

  function showClue() {
    const it = items[k];
    const choices = it.choices || base;
    const answers = [].concat(it.answer);
    stage.innerHTML = `<div class="p3-clue">
        <div class="p3-clue-n">Clue ${k + 1} of ${items.length}</div>
        <div class="p3-clue-text">“${it.text.replace(/^[“"]|[”"]$/g, '')}”</div>
      </div>
      <div class="p3-tiles p3-tiles-${Math.min(choices.length, 4)}">${choices.map((c) => {
        const [ic, sub] = TILE[c] || ['', ''];
        return `<button type="button" class="p3-tile">${ic ? `<span class="p3-tile-ic">${ic}</span>` : ''}<span class="p3-tile-t">${c}</span>${sub ? `<span class="p3-tile-s">${sub}</span>` : ''}</button>`;
      }).join('')}</div>
      <div class="p3-case-extra"></div>`;
    if (k > 0 && !reduced()) stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (k > 0) talk(it.lead || 'Next clue. What kind is this one?');
    const extra = stage.querySelector('.p3-case-extra');
    let wrongs = 0;
    stage.querySelectorAll('.p3-tile').forEach((b) => b.addEventListener('click', () => {
      if (b.disabled) return;
      const pick = b.querySelector('.p3-tile-t').textContent;
      const ok = answers.includes(pick);
      helpers.onPick?.({ prompt: it.text, concept: it.concept || slide.concept }, { label: `${pick}` }, ok, wrongs);
      recordLearning({ concept: it.concept || slide.concept, mistake: it.mistake, correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) {
        wrongs += 1;
        b.disabled = true; b.classList.add('no');
        talk(wrongs === 1 && it.hint ? `<strong>Hmm, try again.</strong> ${it.hint}` : (it.feedback || 'Not quite. Look at what the chart actually shows.'), 'bad');
        return;
      }
      stage.querySelectorAll('.p3-tile').forEach((x) => { x.disabled = true; if (x !== b) x.classList.add('dim'); });
      b.classList.add('ok');
      talk(`<strong>${pick}${it.mark === false ? '' : ' ✓'}</strong> ${it.why || 'Nice detective work.'}`, 'good');
      if (it.show && card._chart) card._chart.reveal(it.show);
      file(it, pick, it.tone || slide.tone || 'ok');
      const next = () => {
        const last = k === items.length - 1;
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'p3-case-next';
        btn.textContent = last ? 'Close the case ✦' : 'Next clue →';
        btn.addEventListener('click', () => { btn.remove(); k += 1; if (last) finish(); else showClue(); });
        extra.appendChild(btn);
      };
      const afterInstead = () => (it.write ? freeWrite(extra, it.write, next) : next());
      if (it.instead) askQuestion(extra, it.instead, helpers, afterInstead);
      else afterInstead();
    }));
  }
  function finish() {
    stage.innerHTML = '';
    talk(slide.outro || 'Case closed. That’s how a pro reads: what the chart shows, what we can fairly guess, and what nobody can know.', 'good');
    card.querySelector('.p3-case-notes').classList.add('closed');
    if (slide.footer) { foot.innerHTML = slide.footer; foot.classList.add('show'); }
    continueBtn(el, satisfy, slide.cta);
  }
  if (items.length) showClue(); else finish();
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


/* Free response after a selection: not graded, a model answer follows. */
function freeWrite(container, w, done) {
  const box = document.createElement('div');
  box.className = 'pl-ask p3-write';
  box.innerHTML = `<div class="pl-q">${w.prompt || 'Now say it in your own words.'}</div>
    <textarea class="sw-textarea" rows="2" placeholder="${w.placeholder || 'Type it objectively…'}"></textarea>
    <button type="button" class="p3-v-btn p3-write-go" disabled>Check it →</button><div class="p3-write-model"></div>`;
  container.appendChild(box);
  const ta = box.querySelector('textarea'), go = box.querySelector('.p3-write-go');
  ta.addEventListener('input', () => { go.disabled = ta.value.trim().length < (w.min || 10); });
  go.addEventListener('click', () => {
    ta.disabled = true; go.remove();
    box.querySelector('.p3-write-model').innerHTML = `<div class="pl-purpose"><div class="pl-panel-title">One objective version</div><p>${w.model}</p></div>`;
    done();
  });
}

/* ── evidence_board ─────────────────────────────────────────────────── */

const BOARD_COLS = [
  ['shows', '✓', 'What the chart shows'],
  ['infer', '○', 'What we may infer'],
  ['cannot', '✕', 'What we cannot prove'],
];

function renderEvidenceBoard(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  el.innerHTML = `<div class="lw-card p3-card">${head(slide)}
      ${mistakeNudge(slide.watch)}
      ${slide.chart ? '<div class="p3-chart"></div>' : ''}
      ${items.length ? `<div class="p3-prompt">${slide.prompt || 'Put each statement on the board.'}</div><div class="p3-le-tray"></div>` : ''}
      <div class="p3-board">
        ${BOARD_COLS.map(([k, ic, t]) => `<div class="p3-bcol p3-b-${k}"><div class="p3-btag"><span>${ic}</span>${t}</div><ul data-col="${k}">${(slide.filled?.[k] || []).map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}
        <div class="p3-bcol p3-b-entry"><div class="p3-btag"><span>○</span>Entry model</div><ul><li>${slide.entry || 'Not present / not being evaluated yet'}</li></ul></div>
      </div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  maybeChart(card, slide);
  const finish = () => {
    const foot = card.querySelector('.p3-foot');
    if (slide.footer) { foot.innerHTML = slide.footer; foot.classList.add('show'); }
    continueBtn(el, satisfy, slide.cta);
  };
  if (!items.length) { finish(); return; }
  const tray = card.querySelector('.p3-le-tray');
  let k = 0;
  function next() {
    if (k >= items.length) { tray.remove(); finish(); return; }
    const it = items[k];
    let wrongs = 0;
    tray.innerHTML = `<div class="p3-le-item">${it.text}</div>
      <div class="p3-v-btns">${BOARD_COLS.map(([c, ic, t]) => `<button type="button" class="p3-v-btn" data-c="${c}">${ic} ${t.replace('What ', '').replace('the chart ', 'Chart ')}</button>`).join('')}</div>
      <div class="pl-fb" aria-live="polite"></div>`;
    const fb = tray.querySelector('.pl-fb');
    tray.querySelectorAll('.p3-v-btn').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.c === it.col;
      helpers.onPick?.({ prompt: it.text, concept: it.concept || slide.concept }, { label: b.textContent.trim() }, ok, wrongs);
      recordLearning({ concept: it.concept || slide.concept, mistake: ok ? null : (it.mistake || 'storytelling-over-evidence'), correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) {
        wrongs += 1; b.disabled = true; b.classList.add('no');
        fb.innerHTML = wrongs === 1 && it.hint ? `<strong>Try again.</strong> ${it.hint}` : (it.feedback || 'Not quite. Can you point at it on the chart?');
        fb.className = 'pl-fb show bad';
        return;
      }
      const li = document.createElement('li');
      li.className = 'p3-le-new';
      li.innerHTML = `${it.text}${it.why ? `<span>${it.why}</span>` : ''}`;
      card.querySelector(`.p3-board ul[data-col="${it.col}"]`).appendChild(li);
      k += 1; next();
    }));
  }
  next();
}

/* ── read_builder: assemble a disciplined read, piece by piece ─────── */

function renderReadBuilder(el, slide, satisfy, helpers) {
  const slots = slide.slots || [];
  el.innerHTML = `<div class="lw-card p3-card">${head(slide)}
      ${slide.chart ? '<div class="p3-chart"></div>' : ''}
      <div class="p3-rb-sentence" aria-live="polite">${slots.map((s, i) => `<span class="p3-rb-slot" data-i="${i}">${s.label}</span>`).join(' ')}</div>
      <div class="p3-rb-pick"></div>
      <div class="p3-foot"></div>
    </div>`;
  const card = el.querySelector('.p3-card');
  maybeChart(card, slide);
  const pick = card.querySelector('.p3-rb-pick');
  let k = 0;
  function next() {
    if (k >= slots.length) {
      pick.innerHTML = '';
      card.querySelector('.p3-rb-sentence').classList.add('done');
      const foot = card.querySelector('.p3-foot');
      foot.innerHTML = slide.footer || '<strong>✓ DISCIPLINED READ.</strong>';
      foot.classList.add('show');
      helpers.burst?.();
      continueBtn(el, satisfy, slide.cta);
      return;
    }
    const s = slots[k];
    card.querySelectorAll('.p3-rb-slot').forEach((x, i) => x.classList.toggle('cur', i === k));
    const q = { prompt: `${s.prompt || 'Choose the piece'}: <em>${s.label}</em>`, concept: s.concept, stack: true, options: s.options };
    pick.innerHTML = '';
    askQuestion(pick, q, helpers, (o) => {
      const slot = card.querySelector(`.p3-rb-slot[data-i="${k}"]`);
      slot.textContent = o.piece || o.label;
      slot.classList.remove('cur'); slot.classList.add('filled');
      k += 1;
      setTimeout(next, reduced() ? 0 : 450);
    });
  }
  next();
}

export const PHASE3_RENDERERS = {
  evidence_board: renderEvidenceBoard,
  read_builder: renderReadBuilder,
  verdicts: renderVerdicts,
  explore: renderExplore,
  literacy_entry: renderLiteracyEntry,
  joke_checklist: renderJokeChecklist,
};
