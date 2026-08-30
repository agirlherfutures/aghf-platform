/**
 * lesson-engine.js — A Girl & Her Futures™
 *
 * Renders a lesson detail page (video block, Teach/Experience/Reinforce
 * stage tabs, question types, scoring, and completion) from a lesson
 * JSON object matching the schema in agihf/lessons-data/*.json. Expects
 * the DOM structure built by agihf/lesson.html.
 *
 * Experience is a multi-step guided scenario walkthrough
 * (experience.steps[]) — one shared scenario, 3-4 sequential decision
 * points, each revealing feedback before the next step unlocks. It is
 * practice, not scored, and stays ungated from Reinforce/Complete.
 *
 * Reinforce supports three question types: multiple_choice, fill_blank,
 * and typed_explanation (a required written-explanation textarea that
 * reveals a model answer and has the learner self-mark whether her
 * reasoning matched it — no server-side grading exists, so this is a
 * self-check, same spirit as the other types feeding a boolean into
 * the passThreshold score).
 *
 * No real video hosting exists yet — the video block renders as a
 * styled placeholder.
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
  const exp = data.experience || {};
  const introEl = document.getElementById('experiencePrompt');
  if (exp.intro) {
    introEl.textContent = exp.intro;
    introEl.style.display = '';
  } else {
    introEl.style.display = 'none';
  }

  const container = document.getElementById('interactiveChart');
  const steps = Array.isArray(exp.steps) ? exp.steps : [];
  if (!steps.length) {
    container.textContent = 'Scenario walkthrough coming soon';
    return;
  }

  let current = 0;

  function renderStep() {
    const step = steps[current];
    container.innerHTML = `
      <div class="scenario-progress">Step ${current + 1} of ${steps.length}</div>
      <div class="scenario-prompt">${step.prompt}</div>
      <div class="scenario-options">
        ${step.options.map((opt, i) => `<button type="button" class="scenario-option" data-idx="${i}">${opt.label}</button>`).join('')}
      </div>
      <div class="scenario-feedback-msg" id="scenarioFeedbackMsg"></div>
      <div class="scenario-next-wrap" id="scenarioNextWrap"></div>
    `;

    const feedbackMsg = container.querySelector('#scenarioFeedbackMsg');
    const nextWrap = container.querySelector('#scenarioNextWrap');
    const optionBtns = container.querySelectorAll('.scenario-option');

    function showAdvanceControl() {
      if (nextWrap.childElementCount) return;
      if (current < steps.length - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'scenario-next-btn';
        nextBtn.textContent = 'Next step →';
        nextBtn.addEventListener('click', () => { current += 1; renderStep(); });
        nextWrap.appendChild(nextBtn);
      } else {
        const doneEl = document.createElement('div');
        doneEl.className = 'scenario-done';
        doneEl.textContent = "That's the full read — nice work walking through it.";
        nextWrap.appendChild(doneEl);
      }
    }

    optionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = step.options[Number(btn.dataset.idx)];
        optionBtns.forEach((b) => b.classList.remove('selected', 'correct', 'incorrect'));
        btn.classList.add('selected', opt.correct ? 'correct' : 'incorrect');
        feedbackMsg.innerHTML = `<span class="scenario-feedback-icon">${opt.correct ? '✓' : '✗'}</span> ${opt.feedback}`;
        feedbackMsg.className = `scenario-feedback-msg visible ${opt.correct ? 'correct' : 'incorrect'}`;
        showAdvanceControl();
      });
    });
  }

  renderStep();
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
    } else if (q.type === 'fill_blank') {
      const input = card.querySelector('input');
      input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        state.answers[i] = (q.keywords || []).some((kw) => val.includes(kw.toLowerCase()));
      });
    } else if (q.type === 'typed_explanation') {
      const textarea = card.querySelector('.quiz-typed-textarea');
      const revealBtn = card.querySelector('.quiz-reveal-btn');
      const modelAnswerEl = card.querySelector('.quiz-model-answer');
      const selfmarkRow = card.querySelector('.quiz-selfmark-row');

      textarea.addEventListener('input', () => {
        revealBtn.disabled = textarea.value.trim().length < 15;
      });

      revealBtn.addEventListener('click', () => {
        modelAnswerEl.innerHTML = `<strong>Model answer:</strong> ${q.modelAnswer}`;
        modelAnswerEl.style.display = '';
        selfmarkRow.style.display = '';
        textarea.disabled = true;
        revealBtn.disabled = true;
        revealBtn.textContent = 'Answer revealed';
      });

      selfmarkRow.querySelectorAll('.quiz-selfmark-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          selfmarkRow.querySelectorAll('.quiz-selfmark-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.answers[i] = btn.classList.contains('match');
        });
      });
    }
  });

  return state;
}

function renderQuestionCard(q, i) {
  const typeLabel = q.type === 'multiple_choice' ? 'Multiple choice · applied'
    : q.type === 'typed_explanation' ? 'Written explanation · applied'
    : 'Fill in the blank · applied';

  let body = '';
  if (q.type === 'multiple_choice') {
    body = `<div class="quiz-options">${q.options.map((opt) => `<div class="quiz-option">${opt}</div>`).join('')}</div>`;
  } else if (q.type === 'fill_blank') {
    body = `<div class="quiz-fillblank">${q.question} <input type="text" placeholder="type your answer"></div>`;
  } else if (q.type === 'typed_explanation') {
    body = `<div class="quiz-typed">
      <textarea class="quiz-typed-textarea" rows="3" placeholder="Type your explanation..."></textarea>
      <button type="button" class="quiz-reveal-btn" disabled>Reveal model answer</button>
      <div class="quiz-model-answer" style="display:none"></div>
      <div class="quiz-selfmark-row" style="display:none">
        <button type="button" class="quiz-selfmark-btn match">✓ My reasoning matches</button>
        <button type="button" class="quiz-selfmark-btn review">↻ I need to review this</button>
      </div>
    </div>`;
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
