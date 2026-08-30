/**
 * lesson-engine.js — A Girl & Her Futures™
 *
 * Renders a lesson as a one-screen-at-a-time step wizard, restored from
 * the original pre-rebuild lesson design (git ref 9fc8de7, branch
 * backup-before-k12-rebuild) and generalized to run off JSON data
 * instead of bespoke per-lesson HTML/JS.
 *
 * Step sequence built from the lesson JSON: video+intro → chart
 * (optional) → one slide per tapCards[] entry → a single quiz slide
 * (all questions together) → a completion slide. Progress dots + a
 * gated bottom Prev/Next bar drive navigation; Next stays disabled
 * until the current step's required interaction is done. Confetti,
 * streak toasts, and a completion celebration are restored gamification
 * lifted directly from the original.
 *
 * Chart step "modes" are small reusable canvas renderers (not bespoke
 * per lesson): candle_anatomy, wick_close_demo, timeframe_lens,
 * pnl_calculator, comparison. Adding a 6th mode later is additive.
 */

const STREAK_MESSAGES = { 2: ['👀', 'okayyy I see you 👀'], 3: ['🔥', "you're locked in 🔥"], 5: ['🎯', 'sniper energy activated 🎯'] };

export function renderLessonWizard(data, opts) {
  const { onAward, nextHref, backHref } = opts;

  const steps = buildSteps(data);
  let cur = 0;
  let streak = 0;
  let awarded = false;
  const done = steps.map((s) => s.type === 'video_intro');

  const wrap = document.getElementById('lwWrap');
  const crumb = document.getElementById('lwCrumb');
  const count = document.getElementById('lwCount');
  const xpPill = document.getElementById('lwXp');
  const bar = document.getElementById('lwBar');
  const dotsEl = document.getElementById('lwDots');
  const stepnameEl = document.getElementById('lwStepname');
  const prevBtn = document.getElementById('lwPrev');
  const nextBtn = document.getElementById('lwNext');

  xpPill.textContent = `+${data.xpValue} XP`;

  function buildSteps(data) {
    const list = [{ type: 'video_intro', label: 'Introduction' }];
    if (data.chart) list.push({ type: 'chart', label: 'Explore' });
    (data.tapCards || []).forEach((tc, i) => list.push({ type: 'tapcard', data: tc, label: `Quick check ${i + 1}` }));
    list.push({ type: 'quiz', label: 'Final quiz' });
    list.push({ type: 'complete', label: 'Complete' });
    return list;
  }

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
    crumb.innerHTML = `Lessons › ${data.title} › <strong>${steps[cur].label}</strong>`;
    count.textContent = `${cur + 1} / ${steps.length}`;
    stepnameEl.textContent = steps[cur].label;
    bar.style.width = `${(cur / (steps.length - 1)) * 100}%`;
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = !done[cur];
    nextBtn.textContent = cur === steps.length - 1 ? 'Done ✦' : done[cur] ? 'Next →' : stepPrompt(cur);
    buildDots();
  }

  function stepPrompt(i) {
    const s = steps[i];
    if (s.type === 'chart') return 'Explore the chart';
    if (s.type === 'tapcard') return 'Pick an answer';
    if (s.type === 'quiz') return 'Answer all questions';
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

  function showStreak(icon, text) {
    const el = document.getElementById('lwStreak');
    document.getElementById('lwStreakIcon').textContent = icon;
    document.getElementById('lwStreakText').textContent = text;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }

  function showToast(title, sub) {
    const el = document.getElementById('lwToast');
    document.getElementById('lwToastTitle').textContent = title;
    document.getElementById('lwToastSub').textContent = sub;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  }

  function burst() {
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

  function renderStep(i) {
    const step = steps[i];
    wrap.innerHTML = '';
    const slide = document.createElement('div');
    slide.className = 'lw-slide active';
    wrap.appendChild(slide);

    if (step.type === 'video_intro') renderVideoIntro(slide, data, () => markDone(i));
    else if (step.type === 'chart') renderChart(slide, data.chart, () => markDone(i), handleStreak);
    else if (step.type === 'tapcard') renderTapCard(slide, step.data, () => markDone(i), handleStreak);
    else if (step.type === 'quiz') renderQuiz(slide, data.quiz || [], () => markDone(i), handleStreak);
    else if (step.type === 'complete') renderComplete(slide, data, { nextHref, backHref });
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
      showToast(`+${data.xpValue} XP earned!`, `${data.title} complete 🫧✨`);
      onAward();
    }
  });

  goTo(0);
}

/* ── Step renderers ─────────────────────────────────────────────── */

function renderVideoIntro(slide, data, markDone) {
  const intro = data.intro || {};
  slide.innerHTML = `
    <div class="lw-video-block">
      <div class="lw-video-bg"></div>
      <div class="lw-video-play">▶</div>
      ${!data.videoUrl ? '<div class="lw-video-soon">Video coming soon</div>' : ''}
      <div class="lw-video-duration">${data.videoDuration || ''}</div>
    </div>
    <div class="lw-intro-hero">
      <div class="lw-eyebrow" style="color:var(--pink-light)">✦ ${data.title}</div>
      <h1>${intro.heading || ''}</h1>
      <p>${intro.body || ''}</p>
      <div class="lw-pills">
        <span class="lw-pill pk">${data.videoDuration || ''}</span>
        <span class="lw-pill pc">+${data.xpValue} XP</span>
      </div>
    </div>
    ${intro.dayliNote ? `<div class="lw-card"><div class="lw-dayli-note">${intro.dayliNote}</div></div>` : ''}
  `;
  markDone();
}

function renderChart(slide, chart, markDone, handleStreak) {
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">Teach → Experience</div>
      <h2>${chart.heading || 'See it on the chart'}</h2>
      <p>${chart.prompt || 'Tap through the chart below.'}</p>
      <div class="lw-chartbox">
        <div class="lw-chartwrap">
          <canvas id="lwChartCanvas" class="lw-chart" width="780" height="320"></canvas>
          <div class="lw-chart-note" id="lwChartNote"></div>
        </div>
        <div class="lw-btnrow" id="lwChartBtns"></div>
        <div class="lw-kpi-grid" id="lwChartKpis"></div>
      </div>
    </div>
    <div class="lw-feedback show good" id="lwChartFb"></div>
  `;
  const ctx = document.getElementById('lwChartCanvas').getContext('2d');
  const btnRow = document.getElementById('lwChartBtns');
  const kpiGrid = document.getElementById('lwChartKpis');
  const noteEl = document.getElementById('lwChartNote');
  const fbEl = document.getElementById('lwChartFb');

  function flashNote(text) {
    noteEl.textContent = text;
    noteEl.classList.add('show');
    clearTimeout(noteEl._t);
    noteEl._t = setTimeout(() => noteEl.classList.remove('show'), 1300);
  }
  function setFb(text) {
    fbEl.textContent = text;
  }
  function setKpis(items) {
    kpiGrid.innerHTML = items.map((k) => `<div class="lw-kpi"><small>${k.label}</small><strong>${k.value}</strong></div>`).join('');
  }

  const mode = CHART_MODES[chart.mode] || CHART_MODES.comparison;
  mode.init({ ctx, btnRow, kpiGrid, flashNote, setFb, setKpis, config: chart.config || {}, markDone, handleStreak });
}

function renderTapCard(slide, tc, markDone, handleStreak) {
  const gridClass = (tc.options || []).length >= 3 ? 'lw-grid3' : 'lw-grid2';
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">Quick check</div>
      <h2>${tc.prompt}</h2>
      <div class="${gridClass}" id="lwTapGrid">
        ${(tc.options || []).map((opt, i) => `<button type="button" class="lw-tap" data-idx="${i}"><h3>${opt.label}</h3></button>`).join('')}
      </div>
    </div>
    <div class="lw-feedback" id="lwTapFb"></div>
  `;
  const fbEl = document.getElementById('lwTapFb');
  const buttons = slide.querySelectorAll('.lw-tap');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const opt = tc.options[Number(btn.dataset.idx)];
      buttons.forEach((b) => { b.classList.remove('correct', 'incorrect'); b.disabled = true; });
      btn.classList.add(opt.correct ? 'correct' : 'incorrect');
      fbEl.textContent = opt.feedback || '';
      fbEl.className = `lw-feedback show ${opt.correct ? 'good' : 'bad'}`;
      handleStreak(!!opt.correct);
      markDone();
    });
  });
}

function renderQuiz(slide, questions, markDone, handleStreak) {
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">Final quiz</div>
      <h2>Lock it in</h2>
      <div id="lwQuizQuestions">
        ${questions.map((q, qi) => `
          <div class="lw-question" data-qidx="${qi}">
            <div class="lw-q-label">Question ${qi + 1} of ${questions.length}</div>
            <div class="lw-q-text">${q.question}</div>
            <div class="lw-opts">
              ${q.options.map((opt, oi) => `<button type="button" class="lw-qopt" data-oidx="${oi}">${opt}</button>`).join('')}
            </div>
            <div class="lw-qfb" id="lwQfb${qi}"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  const answered = new Set();
  questions.forEach((q, qi) => {
    const qBlock = slide.querySelector(`[data-qidx="${qi}"]`);
    const optBtns = qBlock.querySelectorAll('.lw-qopt');
    const fb = document.getElementById(`lwQfb${qi}`);
    optBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const oi = Number(btn.dataset.oidx);
        const correct = oi === q.correctIndex;
        optBtns.forEach((b) => { b.disabled = true; });
        btn.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) optBtns[q.correctIndex].classList.add('correct');
        fb.textContent = q.explanation || (correct ? 'Correct.' : 'Not quite.');
        fb.className = `lw-qfb show ${correct ? 'good' : 'bad'}`;
        handleStreak(correct);
        answered.add(qi);
        if (answered.size === questions.length) markDone();
      });
    });
  });
}

function renderComplete(slide, data, { nextHref, backHref }) {
  slide.innerHTML = `
    <div class="lw-card lw-complete">
      <h2>${data.title} <span>complete.</span></h2>
      <p>Nice work — you watched, explored, and locked it in.</p>
      <div class="lw-badge">+${data.xpValue} XP · Lesson unlocked</div>
      <div class="lw-cc-btns">
        <button type="button" class="lw-cc-next" id="lwNextLessonBtn">${nextHref ? 'Next lesson →' : 'Back to lessons →'}</button>
        <button type="button" class="lw-cc-hub" id="lwBackHubBtn">Back to lessons</button>
      </div>
    </div>
  `;
  document.getElementById('lwNextLessonBtn').addEventListener('click', () => { window.location.href = nextHref || backHref; });
  document.getElementById('lwBackHubBtn').addEventListener('click', () => { window.location.href = backHref; });
}

/* ── Shared canvas primitives ────────────────────────────────────── */

function drawFrame(ctx, w, h) {
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

function drawCandle(ctx, x, open, close, high, low, bull, width = 56) {
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
    init({ ctx, btnRow, kpiGrid, setFb, setKpis, markDone, handleStreak, config }) {
      const w = ctx.canvas.width, h = ctx.canvas.height;
      const instrument = config.instrument || 'MNQ';
      const pointValue = config.pointValue || 2;
      const points = config.points || 30;
      const contractOptions = config.contracts || [1, 3, 5];
      let picked = null;

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
          picked = Number(btn.dataset.n);
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
};
