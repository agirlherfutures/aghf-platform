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
  burst, showStreak, showToast, wireRetryOptions, drawFrame, renderDayliSays, renderConfusion,
} from './lesson-engine.js';
import { renderLoopWatch } from './loop-engine.js';

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
      showToast(`+${data.xpValue} GP earned!`, `${data.title} complete 🫧✨`);
      onAward();
    }
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    steps.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'lw-dot ' + (i < cur ? (done[i] ? 'done' : '') : i === cur ? 'active' : '');
      if (i <= cur || done[i]) d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });
  }

  function stepLabel(i) {
    const step = steps[i];
    if (step.type === 'watch') return 'Watch';
    if (step.type === 'complete') return 'Complete';
    return step.slide.kicker || step.slide.title || 'Learn It';
  }

  function stepPrompt(i) {
    const step = steps[i];
    if (step.type === 'watch') return 'Watch first';
    if (step.type === 'slide' && step.slide.type === 'reflect') return 'Save your answer';
    return 'Keep going';
  }

  function updateChrome() {
    stepnameEl.textContent = stepLabel(cur);
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = !done[cur];
    nextBtn.textContent = cur === steps.length - 1 ? 'Done ✦' : done[cur] ? 'Next →' : stepPrompt(cur);
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

    if (step.type === 'watch') renderLoopWatch(slideEl, data, () => completeStepAndAdvance(i));
    else if (step.type === 'slide') renderSlideBlock(slideEl, step.slide, () => completeStepAndAdvance(i), helpers);
    else if (step.type === 'complete') renderSlideComplete(slideEl, data, { nextHref, backHref, nextTitle, nextHook, nextCtaLabel });
  }

  prevBtn.addEventListener('click', () => goTo(cur - 1));
  // Fallback only: a slide's own Continue button already advances via
  // completeStepAndAdvance the moment it's clicked. This still matters
  // after Back/a dot lands on an already-done slide with nothing left to
  // click on it.
  nextBtn.addEventListener('click', () => {
    if (!done[cur] || cur === steps.length - 1) return;
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
  if (renderer) renderer(el, slide, satisfy, helpers);
  else satisfy();
}

/* ── Teach: one short paragraph, optionally paired with a quick check ── */

function renderTeachSlide(el, slide, satisfy, helpers) {
  const hasCheck = !!slide.check;
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${slide.kicker || 'Teach'}</div>
      <p>${slide.body}</p>
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
          <button type="button" class="ls-choice" data-v="long">🟢 Long — buyers stay in control</button>
          <button type="button" class="ls-choice" data-v="short">🔴 Short — sellers take over</button>
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
        resultEl.innerHTML = `<div class="lw-feedback show bad">${slide.badMsg || 'Not quite — look again.'}</div>`;
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
    try {
      const key = 'aghf_notes';
      const notes = JSON.parse(localStorage.getItem(key) || '[]');
      notes.push({ lessonId: helpers.lessonId, prompt: slide.prompt, text: input.value.trim(), savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (err) { console.error('Note save error:', err); }
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
    drawPricePath(ctx, canvas.width, canvas.height, round.path);
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
      fb.textContent = nearest.feedback || 'Not quite — look again.';
      fb.className = 'lw-feedback show bad';
      helpers.handleStreak(false);
    }
  });

  loadRound();
}

const SLIDE_RENDERERS = {
  teach: renderTeachSlide,
  chart_direction: renderChartDirectionSlide,
  chart_tap: renderChartTapSlide,
  icon_grid: renderIconGridSlide,
  dayli: (el, slide, satisfy) => renderDayliSays(el, slide, satisfy),
  confusion: (el, slide, satisfy) => renderConfusion(el, slide, satisfy),
  calculator: renderCalculatorSlide,
  reflect: renderReflectSlide,
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
