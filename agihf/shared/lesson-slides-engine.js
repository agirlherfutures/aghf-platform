/**
 * lesson-slides-engine.js — A Girl & Her Futures™
 *
 * The bite-sized, always-visual lesson format. Opt-in via a lesson's
 * `format: "slides"` flag (see agihf/lesson.html) — the existing
 * blocks[]-driven renderLessonWizard and the six-stage renderLoopWizard
 * are both untouched and keep driving every lesson that hasn't been
 * converted.
 *
 * One idea and one thing to look at or tap per slide — never a paragraph
 * without an interaction nearby. A lesson's `slides[]` array picks freely
 * from eight slide types: teach (a short paragraph, optionally paired
 * with a two/three-card quick check), chart_direction (a real price path
 * + a Long/Short pick that reveals live P&L), chart_tap (a real price
 * path where you tap the point where control shifted, one or more
 * rounds), icon_grid (a concept broken into compact cards instead of
 * prose), dayli / confusion (the existing signature card and two-column
 * comparison, reused as-is), calculator (a live-updating P&L
 * calculator), and reflect (free text saved to notes). Watch keeps using
 * the existing Dayli-Learning-Loop video/launchpad/markers experience
 * members already like — only what comes after it is replaced by this
 * file.
 *
 * Reuses the shared primitives lesson-engine.js and loop-engine.js
 * already export instead of duplicating them: burst, showStreak,
 * showToast, wireRetryOptions, drawFrame, renderDayliSays, renderConfusion,
 * renderLoopWatch.
 */

import {
  burst, showStreak, showToast, wireRetryOptions, drawFrame, drawCandle, renderDayliSays, renderConfusion,
} from './lesson-engine.js';
import { isPreviewAll } from './preview.js';
import { renderLoopWatch } from './loop-engine.js';
import { renderP7Learn, p7RuleCardHtml } from './p7-learn.js';
import { saveLessonReflection } from './journal-service.js';
import { STRUCTURE_RENDERERS } from './structure-slides.js';
import { V2_RENDERERS, renderV2Complete, renderV2Dayli } from './lesson-v2.js';
import { PRICE_LAB_RENDERERS } from './price-lab.js';
import { PHASE3_RENDERERS } from './phase3-tools.js';
import { PRICE_REPLAY_RENDERERS } from './price-replay.js';
import { TOPDOWN_RENDERERS } from './topdown.js';
import { ICC_RENDERERS } from './icc.js';
import { ICC_EXEC_RENDERERS } from './icc-exec.js';
import { TRIGGER_RENDERERS } from './trigger.js';
import { MANAGE_RENDERERS } from './manage.js';
import { RISK_RENDERERS } from './risk.js';
import { MIND_RENDERERS } from './mind.js';
import { RULES_RENDERERS } from './rules.js';
import { ENV_RENDERERS } from './env.js';
import { SCENE_RENDERERS } from './scene.js';
import { P7_V2_RENDERERS } from './p7-v2.js';
import { CASEFILE_RENDERERS } from './casefile.js';
import { DESK_RENDERERS } from './desk-lessons.js';
import { LEVEL_RENDERERS } from './level-tools.js';
import { SD_RENDERERS } from './sd-slides.js';

// Temporary: everything unlocked while the Academy is being built (see preview.js).
const UNLOCK = isPreviewAll();

const STREAK_MESSAGES = { 2: ['👀', 'okayyy I see you 👀'], 3: ['🔥', "you're locked in 🔥"], 5: ['🎯', 'sniper energy activated 🎯'] };
let uidCounter = 0;

export function renderSlideWizard(data, opts) {
  const { onAward, nextHref, backHref, nextTitle, nextHook, nextCtaLabel } = opts;
  const lessonId = `${data.phase}-${data.lessonNumber}`;
  const slides = data.slides || [];

  const steps = [
    { type: 'watch' },
    ...slides.map((s) => ({ type: 'slide', slide: s })),
    { type: 'complete' },
  ];

  let cur = 0;
  let streak = 0;
  let awarded = false;
  const done = steps.map(() => false);

  const wrap = document.getElementById('lwWrap');
  const dotsEl = document.getElementById('lwDots');
  const stepnameEl = document.getElementById('lwStepname');
  const prevBtn = document.getElementById('lwPrev');
  const nextBtn = document.getElementById('lwNext');

  const helpers = { handleStreak, burst, lessonId };

  function handleStreak(correct) {
    if (correct) {
      streak += 1;
      const msg = STREAK_MESSAGES[streak];
      if (msg) showStreak(msg[0], msg[1]);
    } else {
      streak = 0;
    }
  }

  function markDone(i) {
    if (done[i]) return;
    done[i] = true;
    updateChrome();
  }

  // Every slide's own "Continue"/"Watched"/etc. button already means "I'm
  // ready to move on" — advancing here too, instead of just unlocking the
  // separate bottom Next button, so nothing ever needs two clicks in a
  // row to do the same thing. The bottom Next button stays as a fallback
  // (e.g. after using Back/a dot to revisit an already-done slide).
  function completeStepAndAdvance(i) {
    markDone(i);
    if (i !== cur || i >= steps.length - 1) return;
    const wasLastBeforeComplete = i === steps.length - 2;
    goTo(i + 1);
    if (wasLastBeforeComplete && !awarded) {
      awarded = true;
      burst();
      showToast(data.xpValue ? `+${data.xpValue} GP earned!` : 'Lesson complete ✦', `${data.title} complete 🫧✨`);
      onAward();
    }
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    steps.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'lw-dot ' + (i < cur ? (done[i] ? 'done' : '') : i === cur ? 'active' : '');
      if (UNLOCK || i <= cur || done[i]) d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });
  }

  function stepLabel(i) {
    const step = steps[i];
    if (step.type === 'watch') return data.phase === 'p7' ? 'Learn with Dayli' : 'Watch';
    if (step.type === 'complete') return 'Complete';
    return step.slide.kicker || step.slide.title || 'Learn It';
  }

  function stepPrompt(i) {
    const step = steps[i];
    if (step.type === 'watch') return data.phase === 'p7' ? 'Start here' : 'Watch first';
    if (step.type === 'slide' && (step.slide.type === 'reflect' || step.slide.type === 'v2_reflect')) return 'Save your answer';
    return 'Keep going';
  }

  function updateChrome() {
    stepnameEl.textContent = stepLabel(cur);
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = !done[cur] && !UNLOCK;
    nextBtn.textContent = cur === steps.length - 1 ? 'Done ✦' : done[cur] ? 'Next →' : UNLOCK ? 'Skip →' : stepPrompt(cur);
    buildDots();
  }

  function goTo(i) {
    if (i < 0 || i >= steps.length) return;
    cur = i;
    renderStep(cur);
    updateChrome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderStep(i) {
    const step = steps[i];
    wrap.innerHTML = '';
    const slideEl = document.createElement('div');
    slideEl.className = 'lw-slide active';
    wrap.appendChild(slideEl);

    if (step.type === 'watch' && data.phase === 'p7') renderP7Learn(slideEl, data, () => completeStepAndAdvance(i));
    else if (step.type === 'watch') renderLoopWatch(slideEl, data, () => completeStepAndAdvance(i));
    else if (step.type === 'slide') {
      // The most recent chart in this lesson, so a follow-up activity can keep it in view.
      const ctx = steps.slice(0, i).reverse().find((st) => st.type === 'slide' && st.slide.chart);
      renderSlideBlock(slideEl, step.slide, () => completeStepAndAdvance(i), { ...helpers, contextChart: ctx?.slide.chart });
    }
    else if (step.type === 'complete' && data.completeStyle === 'v2') renderV2Complete(slideEl, data, { nextHref, backHref, nextTitle, nextCtaLabel });
    else if (step.type === 'complete') renderSlideComplete(slideEl, data, { nextHref, backHref, nextTitle, nextHook, nextCtaLabel });
  }

  prevBtn.addEventListener('click', () => goTo(cur - 1));
  // Fallback only: a slide's own Continue button already advances via
  // completeStepAndAdvance the moment it's clicked. This still matters
  // after Back/a dot lands on an already-done slide with nothing left to
  // click on it.
  nextBtn.addEventListener('click', () => {
    if ((!done[cur] && !UNLOCK) || cur === steps.length - 1) return;
    goTo(cur + 1);
  });

  goTo(0);
}

function appendContinue(el, satisfy, label = 'Continue →') {
  if (el.querySelector('.lw-continue-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lw-continue-btn';
  btn.textContent = label;
  btn.addEventListener('click', satisfy);
  el.appendChild(btn);
}

function renderSlideBlock(el, slide, satisfy, helpers) {
  const renderer = SLIDE_RENDERERS[slide.type];
  // Phase 7 reflections carry the lesson's rule above the writing box.
  if (slide.type === 'v2_reflect' && helpers.lessonId.startsWith('p7-')) slide = { ...slide, beforeHtml: p7RuleCardHtml(+helpers.lessonId.slice(3)) };
  if (renderer) renderer(el, slide, satisfy, helpers);
  else satisfy();
}

/* ── Teach: one short paragraph, optionally paired with a quick check ── */

// beats: [{ icon, title, line }] turn a paragraph into a row of small visual cards.
function beatsHtml(beats) {
  if (!beats || !beats.length) return '';
  const cols = beats.length === 4 ? 2 : Math.min(beats.length, 3);
  return `<div class="vt-beats vt-cols-${cols}">${beats.map((b, i) => `
    <div class="vt-beat" style="animation-delay:${i * 90}ms">
      ${b.icon ? `<span class="vt-ic">${b.icon}</span>` : ''}
      <span class="vt-t">${b.title}</span>
      ${b.line ? `<span class="vt-l">${b.line}</span>` : ''}
    </div>`).join('')}</div>`;
}

function renderTeachSlide(el, slide, satisfy, helpers) {
  const hasCheck = !!slide.check;
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Teach'}</div>
      ${slide.heading || slide.title ? `<h2>${slide.heading || slide.title}</h2>` : ''}
      ${slide.body ? `<p class="${slide.beats ? 'vt-lead' : ''}">${slide.body}</p>` : ''}
      ${beatsHtml(slide.beats)}
      ${slide.punch ? `<div class="vt-punch"><span>✦</span>${slide.punch}</div>` : ''}
      ${hasCheck ? `
        <div class="ls-check">
          <div class="ls-check-q">${slide.check.prompt}</div>
          <div class="ls-tap-row${slide.check.options.length > 2 ? ' ls-tap-row-3' : ''}">
            ${slide.check.options.map((o, i) => `
              <button type="button" class="ls-tap" data-i="${i}">
                <span class="ls-tap-title">${o.label}</span>
                ${o.body ? `<span class="ls-tap-body">${o.body}</span>` : ''}
              </button>`).join('')}
          </div>
          <div class="lw-feedback" id="lsCheckFb"></div>
        </div>
      ` : ''}
    </div>
  `;
  if (hasCheck) {
    const buttons = el.querySelectorAll('.ls-tap');
    const fb = el.querySelector('#lsCheckFb');
    wireRetryOptions(buttons, slide.check.options, fb, () => appendContinue(el, satisfy), helpers.handleStreak);
  } else {
    appendContinue(el, satisfy);
  }
}

/* ── Chart direction: a real price path + a Long/Short pick with live P&L ── */

function drawDirectionChart(ctx, w, h, reversal) {
  drawFrame(ctx, w, h);
  const pts = [];
  for (let i = 0; i < 50; i++) {
    const t = i / 49;
    let y;
    if (reversal === 'down') {
      y = t < 0.62 ? h * 0.75 - t * h * 0.5 + Math.sin(i * 0.8) * 6 : h * 0.45 + (t - 0.62) * h * 1.3 + Math.sin(i * 0.8) * 6;
    } else {
      y = t < 0.62 ? h * 0.28 + t * h * 0.5 + Math.sin(i * 0.8) * 6 : h * 0.6 - (t - 0.62) * h * 1.3 + Math.sin(i * 0.8) * 6;
    }
    pts.push([(i / 49) * w, y]);
  }
  ctx.beginPath();
  ctx.strokeStyle = '#F4829A';
  ctx.lineWidth = 2.5;
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
  const [nx, ny] = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(nx - 4, ny, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#F4829A';
  ctx.fill();
  ctx.font = '12px DM Sans';
  ctx.fillStyle = '#F4829A';
  ctx.fillText('Now', Math.max(4, nx - 40), Math.max(14, ny - 12));
}

function renderChartDirectionSlide(el, slide, satisfy, helpers) {
  const uid = `cd${uidCounter++}`;
  const reversal = slide.reversal || (slide.correct === 'short' ? 'down' : 'up');
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
      <h2>${slide.title || ''}</h2>
      <p>${slide.body || ''}</p>
      <div class="ls-chart-panel">
        <canvas id="lsChart_${uid}" class="ls-chart-canvas" width="700" height="220"></canvas>
        <div class="ls-choice-row" id="lsChoices_${uid}">
          <button type="button" class="ls-choice" data-v="long">🟢 Long, buyers stay in control</button>
          <button type="button" class="ls-choice" data-v="short">🔴 Short, sellers take over</button>
        </div>
        <div id="lsResult_${uid}"></div>
      </div>
    </div>
  `;
  const canvas = document.getElementById(`lsChart_${uid}`);
  drawDirectionChart(canvas.getContext('2d'), canvas.width, canvas.height, reversal);

  const choicesEl = document.getElementById(`lsChoices_${uid}`);
  const resultEl = document.getElementById(`lsResult_${uid}`);
  let solved = false;
  choicesEl.querySelectorAll('.ls-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      const v = btn.dataset.v;
      if (v === slide.correct) {
        solved = true;
        btn.classList.add('correct');
        choicesEl.querySelectorAll('.ls-choice').forEach((b) => { if (b !== btn) b.disabled = true; });
        const movePoints = slide.outcomePoints || 0;
        const pnl = movePoints * (slide.pointValue || 1);
        const current = slide.correct === 'short' ? slide.entry - movePoints : slide.entry + movePoints;
        resultEl.innerHTML = `
          <div class="ls-stat-row">
            <div class="ls-stat-box"><div class="ls-stat-label">Entry</div><div class="ls-stat-value">${(slide.entry || 0).toLocaleString()}</div></div>
            <div class="ls-stat-box"><div class="ls-stat-label">Current</div><div class="ls-stat-value">${current.toLocaleString()}</div></div>
            <div class="ls-stat-box"><div class="ls-stat-label">P&amp;L</div><div class="ls-stat-value pos">+$${pnl}</div></div>
          </div>
          <div class="lw-feedback show good">${slide.goodMsg || 'Exactly.'}</div>
        `;
        helpers.handleStreak(true);
        helpers.burst();
        appendContinue(el, satisfy);
      } else {
        btn.classList.add('wrong');
        helpers.handleStreak(false);
        resultEl.innerHTML = `<div class="lw-feedback show bad">${slide.badMsg || 'Not quite, look again.'}</div>`;
      }
    });
  });
}

/* ── Icon grid: a concept broken into compact, scannable pieces ── */

function renderIconGridSlide(el, slide, satisfy) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Break it down'}</div>
      <h2>${slide.title || ''}</h2>
      <div class="ls-icon-grid">
        ${(slide.items || []).map((it) => `
          <div class="ls-icon-card">
            <div class="ls-icon">${it.icon || '✦'}</div>
            <div class="ls-icon-title">${it.label}</div>
            <div class="ls-icon-desc">${it.desc || ''}</div>
          </div>`).join('')}
      </div>
    </div>
  `;
  appendContinue(el, satisfy);
}

/* ── Candle reveal: real drawn candlesticks, tap one to see its story ── */

function renderCandleRevealSlide(el, slide, satisfy, helpers) {
  const uid = `cdl${uidCounter++}`;
  const W = 700, H = 260;
  const candles = slide.candles || [];
  const spacing = W / (candles.length + 1);
  const positions = candles.map((c, i) => ({ ...c, x: spacing * (i + 1) }));
  let picked = false;

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'See It on the Chart'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-chart-panel">
        <canvas id="lsCdl_${uid}" class="ls-chart-canvas" width="${W}" height="${H}" style="cursor:pointer"></canvas>
      </div>
      <div class="lw-feedback" id="lsCdlFb_${uid}"></div>
    </div>
  `;
  const canvas = document.getElementById(`lsCdl_${uid}`);
  const ctx = canvas.getContext('2d');
  const fb = document.getElementById(`lsCdlFb_${uid}`);

  function draw() {
    drawFrame(ctx, W, H);
    if (slide.level) {
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#F4829A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, slide.level.y);
      ctx.lineTo(W, slide.level.y);
      ctx.stroke();
      ctx.setLineDash([]);
      if (slide.level.label) {
        ctx.font = '11px DM Sans';
        ctx.fillStyle = '#F4829A';
        ctx.fillText(slide.level.label, 8, slide.level.y - 6);
      }
    }
    ctx.font = '12px DM Sans';
    ctx.textAlign = 'center';
    positions.forEach((c) => {
      drawCandle(ctx, c.x, c.open, c.close, c.high, c.low, c.bull, 70);
      ctx.fillStyle = '#7A5C50';
      ctx.fillText(c.label, c.x, H - 10);
    });
    ctx.textAlign = 'left';
  }
  draw();

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const hit = positions.find((c) => Math.abs(c.x - x) < 50);
    if (!hit) return;
    fb.className = 'lw-feedback show good';
    fb.innerHTML = `<strong>${hit.label}</strong>, ${hit.desc}`;
    if (!picked) {
      picked = true;
      helpers.handleStreak(true);
      appendContinue(el, satisfy);
    }
  });
}

/* ── Calculator: live-updating P&L, gated on at least one real interaction ── */

function renderCalculatorSlide(el, slide, satisfy) {
  const uid = `calc${uidCounter++}`;
  const instruments = slide.instruments || [];
  let selected = instruments[0] && instruments[0].key;
  let contracts = (slide.contractOptions || [1])[0];
  let interacted = false;

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-inst-row" id="lsInstRow_${uid}">
        ${instruments.map((inst) => `
          <div class="ls-inst-card ${inst.key === selected ? 'on' : ''}" data-key="${inst.key}">
            <h4>${inst.label}</h4><p>${inst.sub || ''}</p>
            <div class="ls-inst-stat"><span>Per point</span><strong>$${Number(inst.pointValue).toFixed(2)}</strong></div>
          </div>`).join('')}
      </div>
      <div class="ls-calc-controls">
        <label>Points moved</label>
        <input type="number" id="lsPoints_${uid}" value="${slide.defaultPoints || 30}" min="1" max="500">
        <label>Contracts</label>
        <div class="ls-num-btns" id="lsContracts_${uid}">
          ${(slide.contractOptions || [1, 2, 3]).map((n) => `<button type="button" class="ls-num-btn ${n === contracts ? 'on' : ''}" data-n="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <div class="ls-calc-result">
        <div class="ls-calc-big" id="lsCalcBig_${uid}"></div>
        <div class="ls-calc-formula" id="lsCalcFormula_${uid}"></div>
      </div>
    </div>
  `;

  const instRow = document.getElementById(`lsInstRow_${uid}`);
  const pointsInput = document.getElementById(`lsPoints_${uid}`);
  const contractsRow = document.getElementById(`lsContracts_${uid}`);
  const bigEl = document.getElementById(`lsCalcBig_${uid}`);
  const formulaEl = document.getElementById(`lsCalcFormula_${uid}`);

  function pointValueFor(key) {
    const inst = instruments.find((i) => i.key === key);
    return inst ? Number(inst.pointValue) : 1;
  }

  function update() {
    const points = Number(pointsInput.value || 0);
    const pv = pointValueFor(selected);
    const total = points * pv * contracts;
    bigEl.textContent = `$${total.toFixed(2)}`;
    formulaEl.textContent = `${points} pts × $${pv} × ${contracts} contract${contracts > 1 ? 's' : ''}`;
  }

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    appendContinue(el, satisfy);
  }

  instRow.querySelectorAll('.ls-inst-card').forEach((card) => {
    card.addEventListener('click', () => {
      selected = card.dataset.key;
      instRow.querySelectorAll('.ls-inst-card').forEach((c) => c.classList.toggle('on', c === card));
      update();
      markInteracted();
    });
  });
  contractsRow.querySelectorAll('.ls-num-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      contracts = Number(btn.dataset.n);
      contractsRow.querySelectorAll('.ls-num-btn').forEach((b) => b.classList.toggle('on', b === btn));
      update();
      markInteracted();
    });
  });
  pointsInput.addEventListener('input', () => { update(); markInteracted(); });

  update();
}

/* ── Reflect: free text, saved to notes (lighter-weight slide version) ── */

function renderReflectSlide(el, slide, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Tell me what you know'}</div>
      ${helpers.lessonId.startsWith('p7-') ? p7RuleCardHtml(+helpers.lessonId.slice(3)) : ''}
      <p class="ls-reflect-prompt">${slide.prompt}</p>
      <textarea class="lw-reflect-textarea" id="lsReflectInput" rows="4" placeholder="Type it how YOU understand it..."></textarea>
      <button type="button" class="lw-continue-btn" id="lsReflectSave" disabled>Save to My Notes →</button>
      <div class="lw-reflect-saved" id="lsReflectSaved" style="display:none">✓ Saved to My Notes</div>
    </div>
  `;
  const input = el.querySelector('#lsReflectInput');
  const saveBtn = el.querySelector('#lsReflectSave');
  input.addEventListener('input', () => { saveBtn.disabled = input.value.trim().length < 5; });
  saveBtn.addEventListener('click', () => {
    const text = input.value.trim();
    try {
      const key = 'aghf_notes';
      const notes = JSON.parse(localStorage.getItem(key) || '[]');
      notes.push({ lessonId: helpers.lessonId, prompt: slide.prompt, text, savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (err) { console.error('Note save error:', err); }
    saveLessonReflection(helpers.lessonId, slide.prompt, text).catch((err) => console.error('Server reflection save error:', err));
    el.querySelector('#lsReflectSaved').style.display = '';
    saveBtn.disabled = true;
    input.disabled = true;
    satisfy();
  });
}

/* ── Chart tap: a real price path, tap the point where control shifted ── */

function drawPricePath(ctx, w, h, path) {
  drawFrame(ctx, w, h);
  ctx.strokeStyle = '#2C1810';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  (path || []).forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
}

function drawTapCandle(ctx, w, h, candle) {
  drawFrame(ctx, w, h);
  drawCandle(ctx, w / 2, candle.open, candle.close, candle.high, candle.low, candle.bull, 90);
}

function renderChartTapSlide(el, slide, satisfy, helpers) {
  const uid = `ct${uidCounter++}`;
  const rounds = slide.rounds || [];
  let idx = 0;
  let solved = false;
  let currentPoints = [];

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.intro ? `<p>${slide.intro}</p>` : ''}
      <p id="lsCtPrompt_${uid}" style="font-weight:700;color:var(--dark);"></p>
      <div class="ls-chart-panel">
        <canvas id="lsCtCanvas_${uid}" class="ls-chart-canvas" width="700" height="260" style="cursor:pointer"></canvas>
      </div>
      <div class="lw-feedback" id="lsCtFb_${uid}"></div>
    </div>
  `;
  const card = el.querySelector('.lw-card');
  const canvas = document.getElementById(`lsCtCanvas_${uid}`);
  const ctx = canvas.getContext('2d');
  const promptEl = document.getElementById(`lsCtPrompt_${uid}`);
  const fb = document.getElementById(`lsCtFb_${uid}`);

  function loadRound() {
    const round = rounds[idx];
    currentPoints = round.points || [];
    solved = false;
    fb.className = 'lw-feedback';
    fb.textContent = '';
    promptEl.textContent = round.prompt || '';
    if (round.candle) drawTapCandle(ctx, canvas.width, canvas.height, round.candle);
    else drawPricePath(ctx, canvas.width, canvas.height, round.path);
  }

  canvas.addEventListener('click', (e) => {
    if (solved) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX, y = (e.clientY - rect.top) * scaleY;
    let nearest = null, nearestDist = Infinity;
    currentPoints.forEach((p) => {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < (p.r || 40) && d < nearestDist) { nearest = p; nearestDist = d; }
    });
    if (!nearest) return;
    if (nearest.correct) {
      solved = true;
      fb.innerHTML = `<strong>✦ Why?</strong> ${nearest.feedback || 'Exactly!'}`;
      fb.className = 'lw-feedback show good';
      helpers.handleStreak(true);
      if (idx < rounds.length - 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lw-continue-btn';
        btn.textContent = 'Next part →';
        btn.addEventListener('click', () => { idx += 1; btn.remove(); loadRound(); });
        card.appendChild(btn);
      } else {
        helpers.burst();
        appendContinue(el, satisfy);
      }
    } else {
      fb.textContent = nearest.feedback || 'Not quite, look again.';
      fb.className = 'lw-feedback show bad';
      helpers.handleStreak(false);
    }
  });

  loadRound();
}

/* ── Instrument explorer: tap a card, see its real per-point/per-tick numbers, plus a full comparison table ── */

function renderInstrumentExplorerSlide(el, slide, satisfy, helpers) {
  const instruments = slide.instruments || [];
  const compareCols = slide.compareColumns || [2, 5];
  let picked = false;

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-ie-grid">
        ${instruments.map((inst) => `
          <div class="ls-ie-card" data-key="${inst.key}">
            <div class="ls-ie-name">${inst.label}</div>
            <div class="ls-ie-sub">${inst.sub || ''}</div>
            <div class="ls-ie-row"><span>Per point</span><strong>$${Number(inst.perPoint).toFixed(2)}</strong></div>
            <div class="ls-ie-row"><span>Per tick</span><strong>$${Number(inst.perTick).toFixed(2)}</strong></div>
            ${inst.useCase ? `<div class="ls-ie-row"><span>Use case</span><strong>${inst.useCase}</strong></div>` : ''}
          </div>`).join('')}
      </div>
      <div class="lw-feedback" id="lsIeFb"></div>
      <div class="ls-compare-wrap">
        <table class="ls-compare-table">
          <thead><tr><th>Instrument</th><th>1 Point</th><th>1 Tick</th>${compareCols.map((c) => `<th>${c} Contracts</th>`).join('')}</tr></thead>
          <tbody>
            ${instruments.map((inst) => `
              <tr><td><strong>${inst.label}</strong></td><td>$${Number(inst.perPoint).toFixed(2)}</td><td>$${Number(inst.perTick).toFixed(2)}</td>${compareCols.map((c) => `<td>$${(inst.perPoint * c).toFixed(2)}/pt</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const fb = el.querySelector('#lsIeFb');
  el.querySelectorAll('.ls-ie-card').forEach((card) => {
    card.addEventListener('click', () => {
      el.querySelectorAll('.ls-ie-card').forEach((c) => c.classList.remove('on'));
      card.classList.add('on');
      const inst = instruments.find((i) => i.key === card.dataset.key);
      fb.className = 'lw-feedback show good';
      fb.innerHTML = `<strong>${inst.label}</strong>${inst.tone ? `: ${inst.tone}` : ''}<br><br><strong>1 point = $${Number(inst.perPoint).toFixed(2)}</strong> &nbsp; <strong>1 tick = $${Number(inst.perTick).toFixed(2)}</strong>`;
      if (!picked) {
        picked = true;
        helpers.handleStreak(true);
        appendContinue(el, satisfy);
      }
    });
  });
}

/* ── P&L lab: dropdown-driven calculator with a 4-cell stat readout ── */

function renderPnlLabSlide(el, slide, satisfy) {
  const uid = `pnl${uidCounter++}`;
  const instruments = slide.instruments || [];
  const contractOptions = slide.contractOptions || [1, 2, 3, 5];
  let interacted = false;

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-pnl-grid">
        <div class="ls-pnl-panel">
          <label>Instrument</label>
          <select class="ls-pnl-select" id="lsPnlInst_${uid}">
            ${instruments.map((i) => `<option value="${i.key}">${i.label}</option>`).join('')}
          </select>
          <label>Points moved</label>
          <input class="ls-pnl-input" type="number" id="lsPnlPoints_${uid}" value="${slide.defaultPoints || 15}" min="1" max="500">
          <label>Contracts</label>
          <select class="ls-pnl-select" id="lsPnlContracts_${uid}">
            ${contractOptions.map((n) => `<option value="${n}">${n} contract${n > 1 ? 's' : ''}</option>`).join('')}
          </select>
        </div>
        <div class="ls-pnl-panel ls-pnl-readout">
          <div class="ls-pnl-output" id="lsPnlOutput_${uid}"></div>
          <div class="ls-pnl-formula" id="lsPnlFormula_${uid}"></div>
          <div class="ls-stat-grid-4">
            <div class="ls-stat-box"><div class="ls-stat-label">Per Point</div><div class="ls-stat-value" id="lsPPStat_${uid}"></div></div>
            <div class="ls-stat-box"><div class="ls-stat-label">Per Tick</div><div class="ls-stat-value" id="lsPTStat_${uid}"></div></div>
            <div class="ls-stat-box"><div class="ls-stat-label">Exposure</div><div class="ls-stat-value" id="lsExpStat_${uid}"></div></div>
            <div class="ls-stat-box"><div class="ls-stat-label">Feeling</div><div class="ls-stat-value" id="lsFeelStat_${uid}"></div></div>
          </div>
        </div>
      </div>
      <div class="lw-feedback show" id="lsPnlFb_${uid}"></div>
    </div>
  `;

  const instSel = document.getElementById(`lsPnlInst_${uid}`);
  const pointsInput = document.getElementById(`lsPnlPoints_${uid}`);
  const contractsSel = document.getElementById(`lsPnlContracts_${uid}`);
  const outputEl = document.getElementById(`lsPnlOutput_${uid}`);
  const formulaEl = document.getElementById(`lsPnlFormula_${uid}`);
  const ppStat = document.getElementById(`lsPPStat_${uid}`);
  const ptStat = document.getElementById(`lsPTStat_${uid}`);
  const expStat = document.getElementById(`lsExpStat_${uid}`);
  const feelStat = document.getElementById(`lsFeelStat_${uid}`);
  const fb = document.getElementById(`lsPnlFb_${uid}`);

  function update() {
    const inst = instruments.find((i) => i.key === instSel.value) || instruments[0];
    const points = Math.max(1, Number(pointsInput.value || 1));
    const contracts = Math.max(1, Number(contractsSel.value || 1));
    const total = points * inst.perPoint * contracts;
    outputEl.textContent = `$${total.toFixed(2)}`;
    formulaEl.textContent = `${points} points × $${Number(inst.perPoint).toFixed(2)} × ${contracts} ${contracts === 1 ? 'contract' : 'contracts'}`;
    ppStat.textContent = `$${Number(inst.perPoint).toFixed(2)}`;
    ptStat.textContent = `$${Number(inst.perTick).toFixed(2)}`;
    const exposure = inst.exposure || ['-', '-'];
    expStat.textContent = exposure[0];
    feelStat.textContent = contracts >= 5 ? 'Loud' : contracts >= 3 ? 'Heavier' : exposure[1];
    fb.textContent = `A ${points}-point move on ${inst.label} with ${contracts} ${contracts === 1 ? 'contract' : 'contracts'} = $${total.toFixed(2)}. This is exactly why instrument and size both matter.`;
  }

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    appendContinue(el, satisfy);
  }

  instSel.addEventListener('change', () => { update(); markInteracted(); });
  pointsInput.addEventListener('input', () => { update(); markInteracted(); });
  contractsSel.addEventListener('change', () => { update(); markInteracted(); });

  update();
}

/* ── Compare cards: tap the better vs. worse understanding, then a quick check ── */

function renderCompareCardsSlide(el, slide, satisfy, helpers) {
  const hasQuickCheck = !!slide.quickCheck;
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Correct a misconception'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-compare-cards">
        ${(slide.options || []).map((o, i) => `
          <button type="button" class="ls-compare-card" data-i="${i}">
            <div class="ls-compare-card-label">${o.label}</div>
            <div class="ls-compare-card-body">${o.body}</div>
          </button>`).join('')}
      </div>
      <div class="lw-feedback" id="lsCompareFb"></div>
      ${hasQuickCheck ? `
        <div class="ls-check" style="margin-top:18px">
          <div class="ls-check-q">${slide.quickCheck.prompt}</div>
          <div class="ls-tap-row${slide.quickCheck.options.length > 2 ? ' ls-tap-row-3' : ''}">
            ${slide.quickCheck.options.map((o) => `
              <button type="button" class="ls-tap">
                <span class="ls-tap-title">${o.label}</span>
              </button>`).join('')}
          </div>
          <div class="lw-feedback" id="lsQuickCheckFb"></div>
        </div>
      ` : ''}
    </div>
  `;

  const fb = el.querySelector('#lsCompareFb');
  let picked = false;
  let quickCheckDone = !hasQuickCheck;
  const cards = el.querySelectorAll('.ls-compare-card');

  function checkDone() {
    if (picked && quickCheckDone) appendContinue(el, satisfy);
  }

  cards.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (picked) return;
      picked = true;
      const opt = slide.options[Number(btn.dataset.i)];
      cards.forEach((c) => { c.disabled = true; });
      btn.classList.add(opt.correct ? 'correct' : 'wrong');
      fb.className = `lw-feedback show ${opt.correct ? 'good' : 'bad'}`;
      fb.textContent = opt.feedback || '';
      helpers.handleStreak(!!opt.correct);
      checkDone();
    });
  });

  if (hasQuickCheck) {
    const qcButtons = el.querySelectorAll('.ls-tap');
    const qcFb = el.querySelector('#lsQuickCheckFb');
    wireRetryOptions(qcButtons, slide.quickCheck.options, qcFb, () => { quickCheckDone = true; checkDone(); }, helpers.handleStreak);
  }
}

/* ── Lab checkpoint: two sequential steps, each a tap between two card options ── */

function renderLabCheckpointSlide(el, slide, satisfy, helpers) {
  const steps = slide.steps || [];
  const answers = steps.map(() => null);

  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Checkpoint'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      ${steps.map((step, si) => `
        <div class="ls-lab-step">
          <div class="ls-lab-step-label">Step ${si + 1}</div>
          <div class="ls-lab-step-prompt">${step.prompt}</div>
          <div class="ls-lab-grid" data-step="${si}">
            ${step.options.map((o, oi) => `<button type="button" class="ls-lab-card" data-step="${si}" data-i="${oi}">${o.label}</button>`).join('')}
          </div>
        </div>
      `).join('')}
      <div class="lw-feedback" id="lsLabFb"></div>
    </div>
  `;

  const fb = el.querySelector('#lsLabFb');
  el.querySelectorAll('.ls-lab-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = Number(btn.dataset.step);
      if (answers[si] !== null) return;
      const oi = Number(btn.dataset.i);
      const opt = steps[si].options[oi];
      answers[si] = !!opt.correct;
      el.querySelector(`.ls-lab-grid[data-step="${si}"]`).querySelectorAll('.ls-lab-card').forEach((c) => { c.disabled = true; });
      btn.classList.add('on');
      if (answers.every((a) => a !== null)) {
        const allCorrect = answers.every(Boolean);
        fb.className = `lw-feedback show ${allCorrect ? 'good' : 'bad'}`;
        fb.textContent = allCorrect ? (slide.goodFeedback || 'Clean logic.') : (slide.badFeedback || 'Almost, think it through again next time.');
        helpers.handleStreak(allCorrect);
        if (allCorrect) helpers.burst();
        appendContinue(el, satisfy);
      }
    });
  });
}

/* ── Decision path: a branching "what now?" scenario, tap through to an outcome ── */

function renderDecisionPathSlide(el, slide, satisfy, helpers) {
  const nodesById = {};
  (slide.nodes || []).forEach((n) => { nodesById[n.id] = n; });
  let currentId = slide.startNode;

  function renderNode() {
    const node = nodesById[currentId];
    let answered = false;
    el.innerHTML = `
      <div class="lw-card">
        <div class="lw-eyebrow">${slide.kicker || 'Experience'}</div>
        <h2>${slide.title || ''}</h2>
        ${slide.body ? `<p>${slide.body}</p>` : ''}
        <p style="font-weight:700;color:var(--dark);margin-top:14px;">${node.prompt}</p>
        <div class="ls-tap-row">
          ${node.options.map((o, i) => `<button type="button" class="ls-tap" data-i="${i}"><span class="ls-tap-title">${o.label}</span></button>`).join('')}
        </div>
        <div class="lw-feedback" id="lsDpFb"></div>
      </div>
    `;
    const buttons = el.querySelectorAll('.ls-tap');
    const fb = el.querySelector('#lsDpFb');
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const opt = node.options[i];
        buttons.forEach((b) => { b.disabled = true; });
        btn.classList.add(opt.good ? 'correct' : 'wrong');
        fb.textContent = opt.feedback || opt.outcomeText || '';
        fb.className = `lw-feedback show ${opt.good ? 'good' : 'bad'}`;
        helpers.handleStreak(!!opt.good);
        if (opt.outcomeText) {
          if (opt.good) helpers.burst();
          appendContinue(el, satisfy);
        } else if (opt.next) {
          const nextBtn = document.createElement('button');
          nextBtn.type = 'button';
          nextBtn.className = 'lw-continue-btn';
          nextBtn.textContent = 'Continue →';
          nextBtn.addEventListener('click', () => { currentId = opt.next; renderNode(); });
          el.querySelector('.lw-card').appendChild(nextBtn);
        } else {
          appendContinue(el, satisfy);
        }
      });
    });
  }

  renderNode();
}

/* ── Sequence build: tap items in the order you think is right, then find out ── */

function renderSequenceBuildSlide(el, slide, satisfy, helpers) {
  const items = slide.items || [];
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Build the Order'}</div>
      <h2>${slide.title || ''}</h2>
      ${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="ls-tap-row${items.length === 3 ? ' ls-tap-row-3' : ''}">
        ${items.map((it) => `<button type="button" class="ls-tap" data-key="${it.key}"><span class="ls-tap-title">${it.label}</span>${it.desc ? `<span class="ls-tap-body">${it.desc}</span>` : ''}</button>`).join('')}
      </div>
      <div class="lw-feedback" id="lsSeqFb"></div>
    </div>
  `;
  const order = [];
  const buttons = el.querySelectorAll('.ls-tap');
  const fb = el.querySelector('#lsSeqFb');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (order.includes(btn.dataset.key)) return;
      order.push(btn.dataset.key);
      btn.classList.add('correct');
      btn.disabled = true;
      if (order.length === items.length) {
        const success = order.join('|') === (slide.correctOrder || []).join('|');
        fb.textContent = success ? (slide.successFeedback || 'Clean order, nice work.') : (slide.failFeedback || "That order isn't quite right, review the pieces.");
        fb.className = `lw-feedback show ${success ? 'good' : 'bad'}`;
        helpers.handleStreak(success);
        if (success) helpers.burst();
        appendContinue(el, satisfy);
      }
    });
  });
}

export const SLIDE_RENDERERS = {
  ...STRUCTURE_RENDERERS,
  ...V2_RENDERERS,
  ...PRICE_LAB_RENDERERS,
  ...LEVEL_RENDERERS,
  ...SD_RENDERERS,
  ...PHASE3_RENDERERS,
  ...PRICE_REPLAY_RENDERERS,
  ...TOPDOWN_RENDERERS,
  ...ICC_RENDERERS,
  ...ICC_EXEC_RENDERERS,
  ...TRIGGER_RENDERERS,
  ...MANAGE_RENDERERS,
  ...RISK_RENDERERS,
  ...MIND_RENDERERS,
  ...RULES_RENDERERS,
  ...ENV_RENDERERS,
  ...SCENE_RENDERERS,
  ...P7_V2_RENDERERS,
  ...CASEFILE_RENDERERS,
  ...DESK_RENDERERS,
  teach: renderTeachSlide,
  chart_direction: renderChartDirectionSlide,
  chart_tap: renderChartTapSlide,
  icon_grid: renderIconGridSlide,
  candle_reveal: renderCandleRevealSlide,
  decision_path: renderDecisionPathSlide,
  sequence_build: renderSequenceBuildSlide,
  // Aristella delivers every Dayli Says.
  dayli: (el, slide, satisfy) => {
    // A long quote keeps its first line as the big headline; the rest becomes her line underneath.
    const [quote, ...rest] = String(slide.quote).split(/<br>\s*<br>/);
    renderV2Dayli(el, { kicker: slide.label || 'Dayli says', quote, line: rest.join(' ') || undefined, pose: 'point', cta: slide.cta }, satisfy);
  },
  confusion: (el, slide, satisfy) => renderConfusion(el, slide, satisfy),
  calculator: renderCalculatorSlide,
  reflect: renderReflectSlide,
  instrument_explorer: renderInstrumentExplorerSlide,
  pnl_lab: renderPnlLabSlide,
  compare_cards: renderCompareCardsSlide,
  lab_checkpoint: renderLabCheckpointSlide,
};

/* ── Complete ─────────────────────────────────────────────────────── */

function renderSlideComplete(el, data, { nextHref, backHref, nextTitle, nextHook, nextCtaLabel }) {
  el.innerHTML = `
    <div class="lw-card lw-complete">
      <h2>${data.title} <span>complete.</span></h2>
      <div class="lw-badge">+${data.xpValue} GP</div>
      <div class="lw-takeaways">
        ${(data.takeaways || []).map((t) => `<div class="lw-takeaway">✓ ${t}</div>`).join('')}
      </div>
      ${data.remember ? `<div class="lw-remember"><div class="lw-remember-label">✦ One Thing to Remember</div><div class="lw-remember-text">${data.remember}</div></div>` : ''}
    </div>
    ${nextTitle ? `
    <div class="lw-card lw-next-up">
      <div class="lw-eyebrow">Next up</div>
      <h2>${nextTitle}</h2>
      ${nextHook ? `<p class="lw-hook-text">"${nextHook}"</p>` : ''}
      <button type="button" class="lw-cc-next" id="lsNextLessonBtn">${nextCtaLabel || 'Start Next Lesson →'}</button>
    </div>` : `
    <div class="lw-card" style="text-align:center">
      <button type="button" class="lw-cc-next" id="lsNextLessonBtn">Back to Lessons →</button>
    </div>`}
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>
  `;
  document.getElementById('lsNextLessonBtn').addEventListener('click', () => { window.location.href = nextHref || backHref; });
}
