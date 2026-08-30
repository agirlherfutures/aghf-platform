/**
 * lesson-engine.js — A Girl & Her Futures™
 *
 * Renders a lesson detail page (video block, Teach/Experience/Reinforce
 * stage tabs, the 3 quiz types, scoring, and completion) from a lesson
 * JSON object matching the schema in agihf/lessons-data/*.json. Expects
 * the DOM structure built by agihf/lesson.html.
 *
 * No real video hosting or canvas chart interactions exist yet — the
 * video block and experience "chart" render as styled placeholders.
 * experience.chartConfig is carried through so a real interactive chart
 * can be wired in later without changing the JSON schema.
 */
export function renderLesson(data, opts) {
  const { onComplete } = opts;

  renderVideo(data);
  renderTeach(data);
  renderExperience(data);
  const reinforceState = renderReinforce(data);
  wireStageTabs();
  wireCompleteButton(data, reinforceState, onComplete);
}

function renderVideo(data) {
  document.getElementById('videoDuration').textContent = data.videoDuration || '';
  document.getElementById('videoCaptionDuration').textContent = data.videoDuration || '';
  if (!data.videoUrl) {
    document.getElementById('videoSoonLabel').style.display = '';
  }
}

function renderTeach(data) {
  document.getElementById('teachHeading').textContent = data.teach.heading;
  document.getElementById('teachBody').textContent = data.teach.body;
  const noteEl = document.getElementById('dayliNote');
  if (data.teach.dayliNote) {
    noteEl.innerHTML = `<strong>Dayli Note:</strong> ${data.teach.dayliNote}`;
  } else {
    noteEl.style.display = 'none';
  }
}

function renderExperience(data) {
  document.getElementById('experiencePrompt').textContent = data.experience.prompt;
  const chart = document.getElementById('interactiveChart');
  const cfg = data.experience.chartConfig || {};
  if (Array.isArray(cfg.options) && cfg.options.length) {
    chart.innerHTML = cfg.options
      .map((opt) => `<button type="button" data-opt="${opt}">${opt}</button>`)
      .join('');
    chart.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        chart.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  } else {
    chart.textContent = 'Interactive chart coming soon';
  }
}

function renderReinforce(data) {
  const container = document.getElementById('reinforceQuestions');
  const state = { answers: new Array(data.reinforce.length).fill(null) };

  container.innerHTML = data.reinforce
    .map((q, i) => renderQuestionCard(q, i))
    .join('');

  data.reinforce.forEach((q, i) => {
    const card = container.querySelector(`[data-qindex="${i}"]`);
    if (q.type === 'multiple_choice') {
      card.querySelectorAll('.quiz-option').forEach((opt, optIdx) => {
        opt.addEventListener('click', () => {
          card.querySelectorAll('.quiz-option').forEach((o) => o.classList.remove('selected'));
          opt.classList.add('selected');
          state.answers[i] = optIdx === q.correctIndex;
        });
      });
    } else if (q.type === 'chart_click') {
      const box = card.querySelector('.quiz-chart-click');
      box.addEventListener('click', () => {
        box.classList.add('tapped');
        box.textContent = 'Tapped ✓';
        state.answers[i] = true;
      });
    } else if (q.type === 'fill_blank') {
      const input = card.querySelector('input');
      input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        state.answers[i] = (q.keywords || []).some((kw) => val.includes(kw.toLowerCase()));
      });
    }
  });

  return state;
}

function renderQuestionCard(q, i) {
  const typeLabel = q.type === 'multiple_choice' ? 'Multiple choice · applied'
    : q.type === 'chart_click' ? 'Chart identification · applied'
    : 'Fill in the blank · applied';

  let body = '';
  if (q.type === 'multiple_choice') {
    body = `<div class="quiz-options">${q.options.map((opt) => `<div class="quiz-option">${opt}</div>`).join('')}</div>`;
  } else if (q.type === 'chart_click') {
    body = `<div class="quiz-chart-click">Tap the chart to answer</div>`;
  } else if (q.type === 'fill_blank') {
    body = `<div class="quiz-fillblank">${q.question} <input type="text" placeholder="type your answer"></div>`;
  }

  const questionText = q.type === 'fill_blank' ? 'Complete the sentence:' : q.question;

  return `<div class="quiz-card" data-qindex="${i}">
    <div class="quiz-type-label">${typeLabel}</div>
    <div class="quiz-question">${questionText}</div>
    ${body}
  </div>`;
}

function wireStageTabs() {
  const tabs = document.querySelectorAll('.stage-tab');
  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
      document.querySelectorAll('.stage-panel').forEach((panel, i) => {
        panel.classList.toggle('visible', i === idx);
      });
    });
  });
}

function wireCompleteButton(data, reinforceState, onComplete) {
  const checkBtn = document.getElementById('checkReinforceBtn');
  const completeBtn = document.getElementById('completeBtn');
  const xpLabel = document.getElementById('completeXpLabel');
  const scoreEl = document.getElementById('reinforceScore');
  const msgEl = document.getElementById('reinforceMsg');
  const total = data.reinforce.length;
  let passed = false;

  checkBtn.addEventListener('click', () => {
    const correct = reinforceState.answers.filter(Boolean).length;
    const pct = correct / total;
    scoreEl.textContent = `${correct} / ${total} correct (${Math.round(pct * 100)}%)`;
    passed = pct >= data.passThreshold;
    if (passed) {
      msgEl.textContent = "You've got this — lesson unlocked.";
      msgEl.className = 'reinforce-result-msg pass';
      completeBtn.disabled = false;
      completeBtn.classList.remove('locked-btn');
      xpLabel.textContent = `You'll earn +${data.xpValue} XP for finishing this lesson`;
    } else {
      msgEl.textContent = `Not quite at ${Math.round(data.passThreshold * 100)}% yet — review the Teach tab and try again.`;
      msgEl.className = 'reinforce-result-msg fail';
      completeBtn.disabled = true;
      completeBtn.classList.add('locked-btn');
      xpLabel.textContent = `Score ${Math.round(data.passThreshold * 100)}%+ on Reinforce to unlock · +${data.xpValue} XP on completion`;
    }
  });

  completeBtn.addEventListener('click', () => {
    if (!passed || completeBtn.disabled) return;
    completeBtn.disabled = true;
    completeBtn.textContent = 'Completing…';
    onComplete();
  });
}
