/**
 * lesson-engine.js — A Girl & Her Futures™
 *
 * Renders the AGHF signature lesson experience: Watch It → Break It
 * Down → Lock It In → Tell Me What You Know. Not a fixed sequence of
 * screens — a lesson's `blocks[]` array picks freely from 9 block
 * types (breakdown, dayli_says, confusion, chart_practice,
 * catch_mistake, what_happens_next, build_sequence, lock_it_in,
 * reflection) so lessons vary in shape instead of repeating the same
 * video→read→quiz loop.
 *
 * Top-level wizard steps: Watch (gated on a Watched click) → Learn It
 * (every non-reflection block, revealed one at a time in a single
 * scroll as each is satisfied) → Reflect (only if a `reflection`
 * block exists) → Complete. The header/breadcrumb/section-progress/
 * Academy Map chrome lives in agihf/lesson.html, not here — this file
 * owns only the body of the experience plus the bottom dots/Prev/Next
 * bar.
 *
 * Feedback philosophy: every interactive block is retry-until-correct.
 * A wrong pick shows a teaching hint and stays selectable — it never
 * just reveals the answer and locks. Chart interactions are 6 small
 * reusable canvas "modes" (not bespoke per lesson): candle_anatomy,
 * wick_close_demo, timeframe_lens, pnl_calculator, comparison,
 * spot_it.
 */

const STREAK_MESSAGES = { 2: ['👀', 'okayyy I see you 👀'], 3: ['🔥', "you're locked in 🔥"], 5: ['🎯', 'sniper energy activated 🎯'] };
let uidCounter = 0;

export function renderLessonWizard(data, opts) {
  const { onAward, nextHref, backHref, nextTitle, nextHook, nextCtaLabel } = opts;
  const lessonId = `${data.phase}-${data.lessonNumber}`;

  const allBlocks = data.blocks || [];
  const bodyBlocks = allBlocks.filter((b) => b.type !== 'reflection');
  const reflectionBlock = allBlocks.find((b) => b.type === 'reflection');

  const steps = [
    { type: 'watch', label: 'Watch' },
    { type: 'body', label: 'Learn It' },
    ...(reflectionBlock ? [{ type: 'reflection', label: 'Reflect' }] : []),
    { type: 'complete', label: 'Complete' },
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

  const helpers = { handleStreak, burst };

  function markDone(i) {
    if (done[i]) return;
    done[i] = true;
    updateChrome();
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

  function updateChrome() {
    stepnameEl.textContent = steps[cur].label;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = !done[cur];
    nextBtn.textContent = cur === steps.length - 1 ? 'Done ✦' : done[cur] ? 'Next →' : stepPrompt(cur);
    buildDots();
  }

  function stepPrompt(i) {
    const s = steps[i];
    if (s.type === 'watch') return 'Watch first';
    if (s.type === 'body') return 'Work through it';
    if (s.type === 'reflection') return 'Save your answer';
    return 'Continue';
  }

  function goTo(i) {
    if (i < 0 || i >= steps.length) return;
    cur = i;
    renderStep(cur);
    updateChrome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleStreak(correct) {
    if (correct) {
      streak += 1;
      const msg = STREAK_MESSAGES[streak];
      if (msg) showStreak(msg[0], msg[1]);
    } else {
      streak = 0;
    }
  }

  function renderStep(i) {
    const step = steps[i];
    wrap.innerHTML = '';
    const slide = document.createElement('div');
    slide.className = 'lw-slide active';
    wrap.appendChild(slide);

    if (step.type === 'watch') renderWatch(slide, data, () => markDone(i));
    else if (step.type === 'body') renderBody(slide, bodyBlocks, () => markDone(i), helpers);
    else if (step.type === 'reflection') renderReflection(slide, reflectionBlock, lessonId, () => markDone(i));
    else if (step.type === 'complete') renderComplete(slide, data, { nextHref, backHref, nextTitle, nextHook, nextCtaLabel });
  }

  prevBtn.addEventListener('click', () => goTo(cur - 1));
  nextBtn.addEventListener('click', () => {
    if (!done[cur]) return;
    if (cur === steps.length - 1) return;
    const wasLastBeforeComplete = cur === steps.length - 2;
    goTo(cur + 1);
    if (wasLastBeforeComplete && !awarded) {
      awarded = true;
      burst();
      showToast(`+${data.xpValue} GP earned!`, `${data.title} complete 🫧✨`);
      onAward();
    }
  });

  goTo(0);
}

export function showStreak(icon, text) {
  const el = document.getElementById('lwStreak');
  document.getElementById('lwStreakIcon').textContent = icon;
  document.getElementById('lwStreakText').textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

export function showToast(title, sub) {
  const el = document.getElementById('lwToast');
  document.getElementById('lwToastTitle').textContent = title;
  document.getElementById('lwToastSub').textContent = sub;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

export function burst() {
  const cols = ['#F4829A', '#7ECEC4', '#F5A857', '#F9B8C6', '#B2E4DF', '#FAD09A'];
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.className = 'lw-confetti';
    const sz = 6 + Math.random() * 8;
    p.style.cssText = `left:${10 + Math.random() * 80}vw;top:-10px;width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random() * cols.length)]};`;
    document.body.appendChild(p);
    p.animate(
      [{ opacity: 1, transform: 'translateY(0) rotate(0deg)' }, { opacity: 0, transform: 'translateY(100vh) rotate(720deg)' }],
      { duration: 1200 + Math.random() * 900, delay: Math.random() * 300, fill: 'forwards' }
    );
    setTimeout(() => p.remove(), 2500);
  }
}

/* ── Watch ───────────────────────────────────────────────────────── */

function renderWatch(slide, data, satisfy) {
  slide.innerHTML = `
    <div class="lw-video-block">
      <div class="lw-video-bg"></div>
      <div class="lw-video-play">▶</div>
      ${!data.videoUrl ? '<div class="lw-video-soon">Video coming soon</div>' : ''}
      <div class="lw-video-duration">${data.videoDuration || ''}</div>
    </div>
    <div class="lw-eyebrow" style="margin:14px 0 0">🎥 Watch With Dayli</div>
    <div class="lw-card lw-mission-card">
      <div class="lw-eyebrow">Today's mission</div>
      <p>${data.mission || ''}</p>
    </div>
    <button type="button" class="lw-continue-btn lw-watched-btn" id="lwWatchedBtn">✓ Watched — Continue</button>
  `;
  document.getElementById('lwWatchedBtn').addEventListener('click', satisfy);
}

/* ── Body: progressive block reveal ─────────────────────────────── */

function renderBody(slide, blocks, onAllDone, helpers) {
  const container = document.createElement('div');
  container.className = 'lw-body-stream';
  slide.appendChild(container);

  if (!blocks.length) { onAllDone(); return; }

  let idx = 0;
  function renderNext() {
    if (idx >= blocks.length) { onAllDone(); return; }
    const block = blocks[idx];
    const blockEl = document.createElement('div');
    blockEl.className = 'lw-block-in';
    container.appendChild(blockEl);
    const satisfy = () => {
      idx += 1;
      renderNext();
      requestAnimationFrame(() => blockEl.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    const renderer = BLOCK_RENDERERS[block.type];
    if (renderer) renderer(blockEl, block, satisfy, helpers);
    else { blockEl.innerHTML = ''; satisfy(); }
  }
  renderNext();
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

/** Shared retry-until-correct wiring for any group of option buttons. */
export function wireRetryOptions(buttons, options, feedbackEl, onSolved, handleStreak) {
  let solved = false;
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      const opt = options[i];
      buttons.forEach((b) => b.classList.remove('wrong'));
      if (opt.correct) {
        solved = true;
        btn.classList.add('correct');
        buttons.forEach((b) => { if (b !== btn) b.disabled = true; });
        feedbackEl.innerHTML = opt.why ? `<strong>✦ Why?</strong> ${opt.why}` : (opt.feedback || 'Exactly!');
        feedbackEl.className = 'lw-feedback show good';
        handleStreak(true);
        onSolved();
      } else {
        btn.classList.add('wrong');
        feedbackEl.textContent = opt.feedback || 'Not quite — look again.';
        feedbackEl.className = 'lw-feedback show bad';
        handleStreak(false);
      }
    });
  });
}

/* ── Block renderers ─────────────────────────────────────────────── */

export function renderBreakdown(el, block, satisfy) {
  el.innerHTML = `
    <div class="lw-card lw-breakdown-card">
      <div class="lw-eyebrow">📖 Break It Down</div>
      ${block.heading ? `<h2>${block.heading}</h2>` : ''}
      <div class="lw-beats">
        ${(block.beats || []).map((b) => `<div class="lw-beat"><h3>${b.heading || ''}</h3><p>${b.body}</p></div>`).join('')}
      </div>
    </div>
  `;
  appendContinue(el, satisfy);
}

export function renderDayliSays(el, block, satisfy) {
  el.innerHTML = `
    <div class="lw-card lw-dayli-card">
      <div class="lw-dayli-avatar">🎀</div>
      <div class="lw-dayli-body">
        <div class="lw-dayli-label">Dayli says</div>
        <div class="lw-dayli-quote">${block.quote}</div>
      </div>
    </div>
  `;
  appendContinue(el, satisfy);
}

export function renderConfusion(el, block, satisfy) {
  el.innerHTML = `
    <div class="lw-card lw-confusion-card">
      <div class="lw-eyebrow">⚠️ Don't Get This Confused</div>
      <h2>${block.heading}</h2>
      <div class="lw-confusion-grid">
        <div class="lw-confusion-col left">
          <div class="lw-confusion-label">${block.left.label}</div>
          <ul>${block.left.points.map((p) => `<li>${p}</li>`).join('')}</ul>
        </div>
        <div class="lw-confusion-col right">
          <div class="lw-confusion-label">${block.right.label}</div>
          <ul>${block.right.points.map((p) => `<li>${p}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `;
  appendContinue(el, satisfy);
}

function renderChartPractice(el, block, satisfy, helpers) {
  const uid = `cp${uidCounter++}`;
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">📊 See It on the Chart</div>
      <h2>${block.heading || 'Now find it'}</h2>
      <p>${block.prompt || ''}</p>
      <div class="lw-chartbox">
        <div class="lw-chartwrap">
          <canvas id="lwCanvas_${uid}" class="lw-chart" width="780" height="320"></canvas>
          <div class="lw-chart-note" id="lwNote_${uid}"></div>
        </div>
        <div class="lw-btnrow" id="lwBtns_${uid}"></div>
        <div class="lw-kpi-grid" id="lwKpi_${uid}"></div>
      </div>
    </div>
    <div class="lw-feedback show good" id="lwFb_${uid}"></div>
    <div class="lw-continue-wrap" id="lwContWrap_${uid}"></div>
  `;
  const ctx = document.getElementById(`lwCanvas_${uid}`).getContext('2d');
  const btnRow = document.getElementById(`lwBtns_${uid}`);
  const kpiGrid = document.getElementById(`lwKpi_${uid}`);
  const noteEl = document.getElementById(`lwNote_${uid}`);
  const fbEl = document.getElementById(`lwFb_${uid}`);
  const contWrap = document.getElementById(`lwContWrap_${uid}`);

  function flashNote(text) {
    noteEl.textContent = text;
    noteEl.classList.add('show');
    clearTimeout(noteEl._t);
    noteEl._t = setTimeout(() => noteEl.classList.remove('show'), 1300);
  }
  function setFb(text) { fbEl.textContent = text; }
  function setKpis(items) {
    kpiGrid.innerHTML = items.map((k) => `<div class="lw-kpi"><small>${k.label}</small><strong>${k.value}</strong></div>`).join('');
  }
  function showContinue() {
    if (contWrap.childElementCount) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'lw-continue-btn'; btn.textContent = 'Continue →';
    btn.addEventListener('click', satisfy);
    contWrap.appendChild(btn);
  }

  const mode = CHART_MODES[block.mode] || CHART_MODES.comparison;
  mode.init({ ctx, btnRow, kpiGrid, flashNote, setFb, setKpis, config: block.config || {}, markDone: showContinue, handleStreak: helpers.handleStreak });
}

export function renderCatchMistake(el, block, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🚩 Catch the Mistake</div>
      <h2>${block.heading || 'What did she get wrong?'}</h2>
      <p class="lw-scenario">${block.scenario}</p>
      <div class="${(block.options || []).length >= 3 ? 'lw-grid3' : 'lw-grid2'}" id="lwCmOpts">
        ${block.options.map((o, i) => `<button type="button" class="lw-tap" data-i="${i}"><h3>${o.label}</h3></button>`).join('')}
      </div>
    </div>
    <div class="lw-feedback" id="lwCmFb"></div>
  `;
  const buttons = el.querySelectorAll('.lw-tap');
  const fb = el.querySelector('#lwCmFb');
  wireRetryOptions(buttons, block.options, fb, () => appendContinue(el, satisfy), helpers.handleStreak);
}

function renderWhatHappensNext(el, block, satisfy, helpers) {
  const seqIdx = block.sequence.indexOf(block.askAfter);
  const shown = seqIdx >= 0 ? block.sequence.slice(0, seqIdx + 1) : block.sequence;
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🫧 What Happens Next?</div>
      <h2>${block.heading || 'Continue the sequence'}</h2>
      <div class="lw-seq-strip">
        ${shown.map((s) => `<span class="lw-seq-step done">${s}</span><span class="lw-seq-arrow">→</span>`).join('')}<span class="lw-seq-step next">?</span>
      </div>
      <p>${block.prompt || "What comes next — not where price goes, what's next in the framework?"}</p>
      <div class="lw-opts" id="lwWhnOpts">
        ${block.options.map((o, i) => `<button type="button" class="lw-qopt" data-i="${i}">${o.label}</button>`).join('')}
      </div>
    </div>
    <div class="lw-feedback" id="lwWhnFb"></div>
  `;
  const buttons = el.querySelectorAll('.lw-qopt');
  const fb = el.querySelector('#lwWhnFb');
  wireRetryOptions(buttons, block.options, fb, () => appendContinue(el, satisfy), helpers.handleStreak);
}

function renderBuildSequence(el, block, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🎯 Build the Setup</div>
      <h2>${block.heading || 'Tap the steps in order'}</h2>
      <p>${block.prompt || ''}</p>
      <div class="lw-grid3" id="lwBsItems">
        ${block.items.map((it) => `<button type="button" class="lw-tap" data-key="${it.key}"><h3>${it.label}</h3>${it.desc ? `<p>${it.desc}</p>` : ''}</button>`).join('')}
      </div>
      <div class="lw-kpi-grid">
        <div class="lw-kpi"><small>Built</small><strong id="lwBsCount">0 / ${block.items.length}</strong></div>
        <div class="lw-kpi"><small>Status</small><strong id="lwBsStatus">Waiting</strong></div>
      </div>
    </div>
    <div class="lw-feedback" id="lwBsFb"></div>
  `;
  const order = [];
  const buttons = el.querySelectorAll('.lw-tap');
  const fb = el.querySelector('#lwBsFb');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (order.includes(btn.dataset.key)) return;
      order.push(btn.dataset.key);
      btn.classList.add('selected');
      btn.disabled = true;
      document.getElementById('lwBsCount').textContent = `${order.length} / ${block.items.length}`;
      if (order.length === block.items.length) {
        const success = order.join('|') === block.correctOrder.join('|');
        document.getElementById('lwBsStatus').textContent = success ? 'Correct order!' : 'Review below';
        fb.textContent = success ? (block.successFeedback || 'Clean sequence — nice work.') : (block.failFeedback || "That order isn't quite right yet — review the pieces before the next lesson.");
        fb.className = `lw-feedback show ${success ? 'good' : 'bad'}`;
        helpers.handleStreak(success);
        if (success) helpers.burst();
        appendContinue(el, satisfy);
      }
    });
  });
}

function renderLockItIn(el, block, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">🧠 Lock It In</div>
      <h2>Before we move on, show me you can use it.</h2>
      <div id="lwLiiQuestions">
        ${block.questions.map((q, qi) => `
          <div class="lw-question" data-qi="${qi}">
            <div class="lw-q-label">Question ${qi + 1} of ${block.questions.length}</div>
            <div class="lw-q-text">${q.question}</div>
            <div class="lw-opts">${q.options.map((opt, oi) => `<button type="button" class="lw-qopt" data-oi="${oi}">${opt}</button>`).join('')}</div>
            <div class="lw-qfb" id="lwLiiFb${qi}"></div>
          </div>`).join('')}
      </div>
    </div>
  `;
  let solvedCount = 0;
  block.questions.forEach((q, qi) => {
    const qEl = el.querySelector(`[data-qi="${qi}"]`);
    const buttons = qEl.querySelectorAll('.lw-qopt');
    const fb = document.getElementById(`lwLiiFb${qi}`);
    const options = q.options.map((label, oi) => ({ label, correct: oi === q.correctIndex, why: q.why, feedback: (q.hints && q.hints[oi]) || 'Not quite — look again.' }));
    wireRetryOptions(buttons, options, fb, () => {
      solvedCount += 1;
      if (solvedCount === block.questions.length) appendContinue(el, satisfy);
    }, helpers.handleStreak);
  });
}

const BLOCK_RENDERERS = {
  breakdown: renderBreakdown,
  dayli_says: renderDayliSays,
  confusion: renderConfusion,
  chart_practice: renderChartPractice,
  catch_mistake: renderCatchMistake,
  what_happens_next: renderWhatHappensNext,
  build_sequence: renderBuildSequence,
  lock_it_in: renderLockItIn,
};

/* ── Reflection (own step) ───────────────────────────────────────── */

function renderReflection(slide, block, lessonId, markDone) {
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">💭 Tell Me What You Know</div>
      <h2>In your own words</h2>
      <p>${block.prompt}</p>
      <textarea class="lw-reflect-textarea" id="lwReflectInput" rows="5" placeholder="Type it how YOU understand it..."></textarea>
      <button type="button" class="lw-continue-btn" id="lwSaveNoteBtn" disabled>Save to My Notes →</button>
      <div class="lw-reflect-saved" id="lwReflectSaved" style="display:none">✓ Saved to My Notes</div>
    </div>
  `;
  const input = slide.querySelector('#lwReflectInput');
  const saveBtn = slide.querySelector('#lwSaveNoteBtn');
  input.addEventListener('input', () => { saveBtn.disabled = input.value.trim().length < 5; });
  saveBtn.addEventListener('click', () => {
    try {
      const key = 'aghf_notes';
      const notes = JSON.parse(localStorage.getItem(key) || '[]');
      notes.push({ lessonId, prompt: block.prompt, text: input.value.trim(), savedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (err) { console.error('Note save error:', err); }
    slide.querySelector('#lwReflectSaved').style.display = '';
    saveBtn.disabled = true;
    input.disabled = true;
    markDone();
  });
}

/* ── Complete ─────────────────────────────────────────────────────── */

function renderComplete(slide, data, { nextHref, backHref, nextTitle, nextHook, nextCtaLabel }) {
  slide.innerHTML = `
    <div class="lw-card lw-complete">
      <h2>${data.title} <span>complete.</span></h2>
      <div class="lw-badge">+${data.xpValue} GP</div>
      <div class="lw-takeaways">
        ${(data.takeaways || []).map((t) => `<div class="lw-takeaway">✓ ${t}</div>`).join('')}
      </div>
      ${data.remember ? `<div class="lw-remember"><div class="lw-remember-label">🎀 One Thing to Remember</div><div class="lw-remember-text">${data.remember}</div></div>` : ''}
    </div>
    ${nextTitle ? `
    <div class="lw-card lw-next-up">
      <div class="lw-eyebrow">Next up</div>
      <h2>${nextTitle}</h2>
      ${nextHook ? `<p class="lw-hook-text">"${nextHook}"</p>` : ''}
      <button type="button" class="lw-cc-next" id="lwNextLessonBtn">${nextCtaLabel || 'Start Next Lesson →'}</button>
    </div>` : `
    <div class="lw-card" style="text-align:center">
      <button type="button" class="lw-cc-next" id="lwNextLessonBtn">Back to Lessons →</button>
    </div>`}
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>
  `;
  document.getElementById('lwNextLessonBtn').addEventListener('click', () => { window.location.href = nextHref || backHref; });
}

/* ── Shared canvas primitives ────────────────────────────────────── */

export function drawFrame(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  for (let i = 1; i < 5; i++) {
    ctx.strokeStyle = 'rgba(244,130,154,.08)';
    ctx.beginPath();
    ctx.moveTo(0, (h / 5) * i);
    ctx.lineTo(w, (h / 5) * i);
    ctx.stroke();
  }
}

export function drawCandle(ctx, x, open, close, high, low, bull, width = 56) {
  ctx.strokeStyle = bull ? '#7ECEC4' : '#F4829A';
  ctx.lineWidth = width > 20 ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(x, high);
  ctx.lineTo(x, low);
  ctx.stroke();
  ctx.fillStyle = bull ? '#7ECEC4' : '#F4829A';
  ctx.fillRect(x - width / 2, Math.min(open, close), width, Math.max(2, Math.abs(close - open)));
}

/* ── Chart modes ─────────────────────────────────────────────────── */

const CHART_MODES = {
  candle_anatomy: {
    init({ ctx, btnRow, setFb, setKpis, flashNote, markDone, handleStreak }) {
      const c = ctx.canvas, w = c.width, h = c.height;
      const x = 390, open = 225, close = 145, high = 120, low = 245;
      const parts = ['open', 'high', 'low', 'close', 'body', 'wick'];
      const found = new Set();

      function draw(part) {
        drawFrame(ctx, w, h);
        drawCandle(ctx, x, open, close, high, low, true);
        ctx.fillStyle = '#2C1810';
        ctx.font = 'bold 13px DM Sans';
        ctx.fillText('Tap a label to reveal that part', 60, 45);
        ctx.strokeStyle = '#2C1810';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if (part === 'open' || part === 'all') { line(open, 'Open: where price began'); }
        if (part === 'close' || part === 'all') { line(close, 'Close: where price ended'); }
        if (part === 'high' || part === 'all') { line(high, 'High: top of range'); }
        if (part === 'low' || part === 'all') { line(low, 'Low: bottom of range'); }
        ctx.setLineDash([]);
        if (part === 'body' || part === 'all') {
          ctx.strokeStyle = '#F5A857'; ctx.lineWidth = 4;
          ctx.strokeRect(x - 30, close - 4, 60, Math.abs(close - open) + 8);
          ctx.fillStyle = '#2C1810'; ctx.fillText('Body: open to close', 130, 176);
        }
        if (part === 'wick' || part === 'all') {
          ctx.strokeStyle = '#F4829A'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(x, high); ctx.lineTo(x, close); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, open); ctx.lineTo(x, low); ctx.stroke();
          ctx.fillStyle = '#2C1810'; ctx.fillText('Wick: reached but did not close there', 80, 280);
        }
        function line(y, label) {
          ctx.beginPath(); ctx.moveTo(x + 30, y); ctx.lineTo(x + 116, y); ctx.stroke();
          ctx.fillText(label, x + 122, y + 4);
        }
      }

      btnRow.innerHTML = parts.map((p) => `<button type="button" data-part="${p}">${p[0].toUpperCase() + p.slice(1)}</button>`).join('');
      setKpis([{ label: 'Parts found', value: '0 / 6' }, { label: 'Main clue', value: 'Start here' }, { label: 'Skill', value: 'Building' }]);
      setFb('Tap each body part to reveal it on the chart.');
      btnRow.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const part = btn.dataset.part;
          found.add(part);
          btn.classList.add('active');
          draw(part);
          flashNote(`${part} revealed`);
          setKpis([
            { label: 'Parts found', value: `${found.size} / 6` },
            { label: 'Main clue', value: part[0].toUpperCase() + part.slice(1) },
            { label: 'Skill', value: found.size >= 4 ? 'Rising' : 'Building' },
          ]);
          if (found.size === parts.length) {
            draw('all');
            setFb('Full anatomy unlocked — open, high, low, close, body, and wick.');
            handleStreak(true);
            markDone();
          } else {
            setFb(`${part.toUpperCase()} is one piece of the story. Keep going.`);
          }
        });
      });
      draw();
    },
  },

  wick_close_demo: {
    init({ ctx, btnRow, setFb, setKpis, flashNote, markDone, handleStreak, config }) {
      const c = ctx.canvas, w = c.width, h = c.height;
      const x = 390, open = 220, close = 150, high = 90, low = 238;
      function base() {
        drawFrame(ctx, w, h);
        drawCandle(ctx, x, open, close, high, low, true);
        ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans';
        ctx.fillText(config.caption || 'Tap "Show the rejection" to see what the wick did not hold', 60, 45);
      }
      btnRow.innerHTML = `<button type="button" class="primary" id="lwRunWick">Show the rejection</button><button type="button" id="lwResetWick">Reset</button>`;
      setKpis([{ label: 'Wick', value: 'Reached, not held' }, { label: 'Close', value: 'What actually settled' }, { label: 'Rule', value: 'Close beats wick' }]);
      base();
      btnRow.querySelector('#lwRunWick').addEventListener('click', () => {
        base();
        ctx.strokeStyle = '#F4829A'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x, high); ctx.lineTo(x, open); ctx.stroke();
        ctx.fillStyle = '#2C1810';
        ctx.fillText('Price reached here but closed lower', 430, 108);
        flashNote('Traveled but did not hold');
        setFb('The wick shows price pushed into an area but did not close there. That difference matters.');
        handleStreak(true);
        markDone();
      });
      btnRow.querySelector('#lwResetWick').addEventListener('click', base);
    },
  },

  timeframe_lens: {
    init({ ctx, btnRow, setFb, setKpis, markDone, handleStreak, config }) {
      const c = ctx.canvas, w = c.width, h = c.height;
      const lenses = config.lenses || [
        { key: '4H', count: 5, detail: 'Big picture' },
        { key: '1H', count: 10, detail: 'Structure' },
        { key: '15M', count: 18, detail: 'Fine detail' },
        { key: '1M', count: 34, detail: 'Noise-heavy' },
      ];
      const seen = new Set();

      function draw(lens) {
        drawFrame(ctx, w, h);
        const n = lens.count;
        const cw = Math.max(6, (w - 60) / n - 4);
        let y = h / 2;
        for (let i = 0; i < n; i++) {
          const move = Math.sin(i * 0.7 + n) * 26 + (Math.random() - 0.5) * 18;
          const bull = move >= 0 || Math.random() > 0.5;
          const open = y;
          const close = y - move;
          const high = Math.min(open, close) - 8 - Math.random() * 10;
          const low = Math.max(open, close) + 8 + Math.random() * 10;
          drawCandle(ctx, 40 + i * (cw + 4) + cw / 2, open, close, high, low, bull, cw);
          y = close;
        }
        ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans';
        ctx.fillText(`${lens.key} — ${n} candles shown (${lens.detail})`, 20, 24);
      }

      btnRow.innerHTML = lenses.map((l) => `<button type="button" data-key="${l.key}">${l.key}</button>`).join('');
      setKpis([{ label: 'Lens', value: '—' }, { label: 'Candles shown', value: '—' }, { label: 'Detail level', value: '—' }]);
      setFb('Tap a timeframe to see how the same window looks at different zoom levels.');
      btnRow.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lens = lenses.find((l) => l.key === btn.dataset.key);
          btnRow.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          draw(lens);
          seen.add(lens.key);
          setKpis([{ label: 'Lens', value: lens.key }, { label: 'Candles shown', value: String(lens.count) }, { label: 'Detail level', value: lens.detail }]);
          setFb(`${lens.key} shows ${lens.count} candles — ${lens.key === '4H' ? 'the least detail, the clearest direction' : lens.key === '1M' ? 'the most detail, the most noise' : 'a middle zoom between the two'}.`);
          handleStreak(true);
          if (seen.size >= 2) markDone();
        });
      });
    },
  },

  pnl_calculator: {
    init({ ctx, btnRow, setFb, setKpis, markDone, handleStreak, config }) {
      const w = ctx.canvas.width, h = ctx.canvas.height;
      const instrument = config.instrument || 'MNQ';
      const pointValue = config.pointValue || 2;
      const points = config.points || 30;
      const contractOptions = config.contracts || [1, 3, 5];

      function draw(contracts) {
        drawFrame(ctx, w, h);
        ctx.fillStyle = '#2C1810'; ctx.font = 'bold 15px DM Sans';
        ctx.fillText(`${instrument} moves ${points} points × $${pointValue}/pt`, 40, 50);
        const pnl = contracts ? points * pointValue * contracts : 0;
        ctx.font = 'bold 34px DM Sans';
        ctx.fillStyle = contracts ? '#1a6b63' : '#7A5C50';
        ctx.fillText(contracts ? `$${pnl.toLocaleString()}` : 'Pick contracts →', 40, 140);
        if (contracts) {
          ctx.font = '13px DM Sans'; ctx.fillStyle = '#7A5C50';
          ctx.fillText(`${points} pts × $${pointValue} × ${contracts} contract${contracts > 1 ? 's' : ''}`, 40, 170);
        }
      }

      btnRow.innerHTML = contractOptions.map((n) => `<button type="button" data-n="${n}">${n} contract${n > 1 ? 's' : ''}</button>`).join('');
      setKpis([{ label: 'Points', value: points }, { label: 'Point value', value: `$${pointValue}` }, { label: 'Contracts', value: '—' }]);
      setFb('Choose a contract size to see how P&L scales.');
      draw(null);
      btnRow.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const picked = Number(btn.dataset.n);
          btnRow.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          draw(picked);
          setKpis([{ label: 'Points', value: points }, { label: 'Point value', value: `$${pointValue}` }, { label: 'Contracts', value: picked }]);
          setFb(`${points} points × $${pointValue} × ${picked} contract${picked > 1 ? 's' : ''} = $${(points * pointValue * picked).toLocaleString()}.`);
          handleStreak(true);
          markDone();
        });
      });
    },
  },

  comparison: {
    init({ ctx, btnRow, setFb, setKpis, markDone, handleStreak, config }) {
      const w = ctx.canvas.width, h = ctx.canvas.height;
      const left = config.left || { label: 'Option A', value: 1, desc: '' };
      const right = config.right || { label: 'Option B', value: 2, desc: '' };
      function draw(highlight) {
        drawFrame(ctx, w, h);
        const maxVal = Math.max(left.value, right.value) || 1;
        [{ item: left, x: 140 }, { item: right, x: 500 }].forEach(({ item, x }) => {
          const barH = (item.value / maxVal) * 200;
          const isHi = highlight === item.label;
          ctx.fillStyle = isHi ? '#7ECEC4' : '#F9B8C6';
          ctx.fillRect(x - 60, 260 - barH, 120, barH);
          ctx.fillStyle = '#2C1810'; ctx.font = 'bold 14px DM Sans';
          ctx.fillText(item.label, x - 55, 280);
          ctx.font = 'bold 20px DM Sans';
          ctx.fillText(String(item.value), x - 15, 250 - barH);
        });
      }
      btnRow.innerHTML = `<button type="button" data-k="${left.label}">${left.label}</button><button type="button" data-k="${right.label}">${right.label}</button>`;
      setKpis([{ label: left.label, value: left.value }, { label: right.label, value: right.value }, { label: 'Difference', value: Math.abs(left.value - right.value) }]);
      setFb('Tap each option to compare.');
      draw(null);
      let tapped = 0;
      btnRow.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.dataset.k === left.label ? left : right;
          draw(item.label);
          setFb(item.desc || `${item.label}: ${item.value}`);
          handleStreak(true);
          tapped += 1;
          if (tapped >= 2) markDone();
        });
      });
    },
  },

  spot_it: {
    init({ ctx, btnRow, setFb, setKpis, markDone, handleStreak, config }) {
      const w = ctx.canvas.width, h = ctx.canvas.height;
      const path = config.path || [[60, 220], [160, 140], [260, 180], [360, 90], [460, 150], [560, 60], [660, 110]];
      const points = config.points || [];

      function draw(selectedKey) {
        drawFrame(ctx, w, h);
        ctx.strokeStyle = '#2C1810'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        path.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.stroke();
        points.forEach((p) => {
          const [x, y] = path[p.idx];
          const isSel = p.key === selectedKey;
          ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? (p.correct ? '#7ECEC4' : '#F4829A') : '#F5A857';
          ctx.fill();
          ctx.fillStyle = '#2C1810'; ctx.font = 'bold 13px DM Sans';
          ctx.fillText(p.key, x - 4, y - 16);
        });
      }

      btnRow.innerHTML = points.map((p) => `<button type="button" data-key="${p.key}">${p.key}</button>`).join('');
      setKpis([{ label: 'Structure', value: config.structureLabel || '—' }, { label: 'Points', value: points.length }, { label: 'Tap to explore', value: points.map((p) => p.key).join(' / ') }]);
      setFb(config.prompt2 || 'Tap the point you think is correct.');
      draw(null);
      let solved = false;
      btnRow.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (solved) return;
          const p = points.find((pt) => pt.key === btn.dataset.key);
          draw(p.key);
          setFb(p.feedback || (p.correct ? 'Exactly!' : 'Not quite — look again.'));
          if (p.correct) { solved = true; handleStreak(true); markDone(); }
          else handleStreak(false);
        });
      });
    },
  },
};
