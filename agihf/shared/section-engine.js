/**
 * section-engine.js — A Girl & Her Futures™
 *
 * Renders the section-level completion flow that sits after a section's
 * last lesson: Welcome → Challenge → Knowledge Check → Check-In →
 * Complete. This is the template future sections will reuse — only
 * Section 1's content exists today (agihf/lessons-data/p1-s1-section.json).
 *
 * Progress is browser-only (localStorage), same as the lesson-level
 * reflection block: no new backend table this pass. Completing the whole
 * flow sets `aghf_section_clear:<phase>-<section>` so lessons.html/
 * lesson.html/dashboard.html can hard-gate the next section on it.
 *
 * Reuses shared primitives from lesson-engine.js (burst, streak/toast,
 * retry-until-correct wiring) rather than duplicating them.
 */

import { burst, showStreak, showToast, wireRetryOptions } from './lesson-engine.js';
import { saveCheckinReflection } from './journal-service.js';
import { SLIDE_RENDERERS } from './lesson-slides-engine.js';

const STREAK_MESSAGES = { 2: ['👀', 'okayyy I see you 👀'], 3: ['🔥', "you're locked in 🔥"], 5: ['🎯', 'sniper energy activated 🎯'] };

export function renderSectionWizard(data, opts) {
  const { phaseKey, sectionKey, backHref, nextSectionHref, nextSectionLabel, lessonsLabel, lessonGpTotal, initialStep } = opts;
  const flagKey = `aghf_section_clear:${phaseKey}-${sectionKey}`;
  const sectionId = `${phaseKey}-${sectionKey}`;

  // A section can list its own steps (e.g. a game instead of a Challenge,
  // or no Welcome here because it's shown before the lessons instead).
  const STEP_LABELS = { welcome: 'Welcome', challenge: 'Challenge', game: (data.game && data.game.title) || 'Game', knowledge: 'Knowledge Check', checkin: 'Check-In', complete: 'Complete' };
  const steps = (data.steps || ['welcome', 'challenge', 'knowledge', 'checkin', 'complete']).map((type) => ({ type, label: STEP_LABELS[type] }));

  const startIdx = Math.max(0, steps.findIndex((s) => s.type === (initialStep || steps[0].type)));
  let cur = startIdx;
  let streak = 0;
  const done = steps.map(() => false);
  const results = { knowledgePct: null };

  const wrap = document.getElementById('lwWrap');
  const dotsEl = document.getElementById('lwDots');
  const stepnameEl = document.getElementById('lwStepname');
  const prevBtn = document.getElementById('lwPrev');
  const nextBtn = document.getElementById('lwNext');

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

  // A step's own "Continue"/"Save & Continue"/etc. button already means
  // "I'm ready to move on" — advancing here too, instead of just marking
  // the step done and leaving the member to also click the separate
  // bottom Next button. That button stays as a fallback (e.g. after
  // Back/a dot lands on an already-done step with nothing left to click).
  function completeStepAndAdvance(i) {
    markDone(i);
    if (i !== cur || i >= steps.length - 1) return;
    goTo(i + 1);
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
    if (s.type === 'welcome') return 'Start below';
    if (s.type === 'challenge') return 'Work through it';
    if (s.type === 'game') return 'Clear every level';
    if (s.type === 'knowledge') return 'Pass at 80%';
    if (s.type === 'checkin') return 'Save your answers';
    return 'Continue';
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
    const slide = document.createElement('div');
    slide.className = 'lw-slide active';
    wrap.appendChild(slide);

    if (step.type === 'welcome') renderWelcome(slide, data.welcome, () => completeStepAndAdvance(i));
    else if (step.type === 'challenge') renderChallenge(slide, data.challenge, () => completeStepAndAdvance(i), { handleStreak, burst });
    else if (step.type === 'game') renderGame(slide, data.game, () => completeStepAndAdvance(i), { handleStreak, burst });
    else if (step.type === 'knowledge') renderKnowledge(slide, data.knowledgeCheck, (pct) => { results.knowledgePct = pct; completeStepAndAdvance(i); }, { handleStreak, burst });
    else if (step.type === 'checkin') renderCheckin(slide, data.checkin, sectionId, () => completeStepAndAdvance(i));
    else if (step.type === 'complete') renderComplete(slide, data, { flagKey, backHref, nextSectionHref, nextSectionLabel, lessonsLabel, lessonGpTotal, results, data });
  }

  prevBtn.addEventListener('click', () => goTo(cur - 1));
  nextBtn.addEventListener('click', () => {
    if (!done[cur]) return;
    if (cur === steps.length - 1) return;
    goTo(cur + 1);
  });

  goTo(startIdx);
}

/* ── Welcome ─────────────────────────────────────────────────────── */

function renderWelcome(slide, welcome, satisfy) {
  slide.innerHTML = `
    <div class="lw-card sw-hero">
      <div class="lw-eyebrow">${welcome.eyebrow || 'Section Complete Flow'}</div>
      <h2>${welcome.heading}</h2>
      <p>${welcome.body}</p>
      <div class="sw-mission">
        <div class="sw-mission-label">Your mission</div>
        <div class="sw-mission-text">${welcome.mission}</div>
      </div>
    </div>
    <button type="button" class="lw-continue-btn" id="swWelcomeBtn" style="align-self:center">Continue →</button>
  `;
  document.getElementById('swWelcomeBtn').addEventListener('click', satisfy);
}

/* ── Challenge ───────────────────────────────────────────────────── */

function renderChallenge(slide, challenge, onAllDone, helpers) {
  const intro = document.createElement('div');
  intro.className = 'lw-card';
  intro.innerHTML = `
    <div class="lw-eyebrow">Section Challenge</div>
    <h2>${challenge.title}</h2>
    <p>${challenge.subtitle}</p>
  `;
  slide.appendChild(intro);

  const stream = document.createElement('div');
  stream.className = 'lw-body-stream';
  slide.appendChild(stream);

  const rounds = challenge.rounds;
  let idx = 0;

  function renderNext() {
    if (idx >= rounds.length) { onAllDone(); return; }
    const round = rounds[idx];
    const el = document.createElement('div');
    el.className = 'lw-block-in';
    stream.appendChild(el);
    const satisfy = () => {
      idx += 1;
      renderNext();
      requestAnimationFrame(() => el.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };
    if (round.type === 'multiselect') renderMultiselectRound(el, round, idx, rounds.length, satisfy, helpers);
    else renderMcRound(el, round, idx, rounds.length, satisfy, helpers);
  }
  renderNext();
}

function renderMcRound(el, round, i, total, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="sw-round-label">Round ${i + 1} of ${total}${round.heading ? `: ${round.heading.replace(/^Round \d+\s*[—:]\s*/, '')}` : ''}</div>
      <h2>${round.question}</h2>
      ${round.prompt ? `<p class="lw-scenario">${round.prompt}</p>` : ''}
      <div class="lw-opts" id="swOpts${i}">
        ${round.options.map((o, oi) => `<button type="button" class="lw-qopt" data-i="${oi}">${o.label}</button>`).join('')}
      </div>
    </div>
    <div class="lw-feedback" id="swFb${i}"></div>
  `;
  const buttons = el.querySelectorAll('.lw-qopt');
  const fb = el.querySelector(`#swFb${i}`);
  wireRetryOptions(buttons, round.options, fb, () => appendChallengeContinue(el, satisfy), helpers.handleStreak);
}

function renderMultiselectRound(el, round, i, total, satisfy, helpers) {
  el.innerHTML = `
    <div class="lw-card">
      <div class="sw-round-label">Round ${i + 1} of ${total}${round.heading ? `: ${round.heading.replace(/^Round \d+\s*[—:]\s*/, '')}` : ''}</div>
      <h2>${round.question}</h2>
      ${round.prompt ? `<p class="lw-scenario">${round.prompt}</p>` : ''}
      <div class="sw-multi-grid" id="swMulti${i}">
        ${round.items.map((it, ii) => `<button type="button" class="sw-multi-item" data-i="${ii}"><span class="sw-multi-check"></span><span>${it.label}</span></button>`).join('')}
      </div>
      <button type="button" class="lw-continue-btn sw-check-btn" id="swCheck${i}">Check My Answers</button>
    </div>
    <div class="lw-feedback" id="swMultiFb${i}"></div>
  `;
  const items = el.querySelectorAll('.sw-multi-item');
  const fb = el.querySelector(`#swMultiFb${i}`);
  let solved = false;
  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (solved) return;
      btn.classList.toggle('on');
      btn.classList.remove('correct', 'wrong');
    });
  });
  document.getElementById(`swCheck${i}`).addEventListener('click', () => {
    if (solved) return;
    const selected = Array.from(items).map((btn) => btn.classList.contains('on'));
    const correctMatch = round.items.every((it, ii) => it.correct === selected[ii]);
    if (correctMatch) {
      solved = true;
      items.forEach((btn, ii) => btn.classList.add(round.items[ii].correct ? 'correct' : 'wrong'));
      fb.textContent = round.successFeedback || 'Exactly right.';
      fb.className = 'lw-feedback show good';
      helpers.handleStreak(true);
      helpers.burst();
      appendChallengeContinue(el, satisfy);
    } else {
      items.forEach((btn, ii) => {
        if (selected[ii] && !round.items[ii].correct) btn.classList.add('wrong');
      });
      fb.textContent = "Not quite, review your selections and try again.";
      fb.className = 'lw-feedback show bad';
      helpers.handleStreak(false);
    }
  });
}

function appendChallengeContinue(el, satisfy) {
  if (el.querySelector('.lw-continue-btn.sw-round-next')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lw-continue-btn sw-round-next';
  btn.textContent = 'Continue →';
  btn.addEventListener('click', satisfy);
  el.appendChild(btn);
}

/* ── Game: levels built from the lesson slide types ─────────────────── */

function renderGame(slide, game, onAllDone, helpers) {
  const levels = game.levels || [];
  let idx = 0;
  function show() {
    const level = levels[idx];
    slide.innerHTML = `
      <div class="lw-card">
        <div class="lw-eyebrow">${game.title}</div>
        <h2>${game.tagline || ''}</h2>
        <div class="sg-ladder">${levels.map((_, k) => `<span class="${k < idx ? 'on' : k === idx ? 'cur' : ''}"></span>`).join('')}</div>
        <div class="sg-level"><div class="sg-level-badge">${idx + 1}</div><div><div class="sg-level-name">Level ${idx + 1} of ${levels.length}</div><div class="sg-level-title">${level.name}</div></div></div>
      </div>
      <div class="sg-body"></div>`;
    const body = slide.querySelector('.sg-body');
    const renderer = SLIDE_RENDERERS[level.type];
    const next = () => {
      idx += 1;
      if (idx < levels.length) { show(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else {
        slide.innerHTML = `<div class="lw-card lw-complete"><h2>${game.doneHeading || 'Game cleared ✦'}</h2><div class="lw-badge">${game.doneBadge || 'All levels complete'}</div>${game.xp ? `<div class="lw-badge" style="background:rgba(245,168,87,.18);border-color:rgba(245,168,87,.35);color:#F5A857;">+${game.xp} GP</div>` : ''}</div>`;
        helpers.burst();
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'lw-continue-btn'; btn.style.alignSelf = 'center'; btn.textContent = 'Continue →';
        btn.addEventListener('click', onAllDone);
        slide.appendChild(btn);
      }
    };
    if (renderer) renderer(body, level, next, helpers); else next();
  }
  show();
}

/* ── Knowledge Check ─────────────────────────────────────────────── */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderKnowledge(slide, kc, onPass, helpers) {
  const count = Math.min(kc.questionCount, kc.questionBank.length);

  function startAttempt() {
    const set = shuffle(kc.questionBank).slice(0, count);
    let qi = 0;
    let score = 0;
    renderQuestion(set, qi, score);

    function renderQuestion(set, qi, score) {
      const q = set[qi];
      slide.innerHTML = `
        <div class="lw-card">
          <div class="lw-eyebrow">Knowledge Check</div>
          <div class="sw-progress-row"><span>Question ${qi + 1} of ${set.length}</span><span>Score: ${score} / ${qi}</span></div>
          <div class="sw-progress-track"><div class="sw-progress-fill" style="width:${(qi / set.length) * 100}%"></div></div>
          <h2>${q.question}</h2>
          <div class="lw-opts" id="swKcOpts">
            ${q.options.map((opt, oi) => `<button type="button" class="lw-qopt" data-oi="${oi}">${opt}</button>`).join('')}
          </div>
        </div>
        <div class="lw-feedback" id="swKcFb"></div>
      `;
      const buttons = slide.querySelectorAll('.lw-qopt');
      const fb = slide.querySelector('#swKcFb');
      let answered = false;
      buttons.forEach((btn, oi) => {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = oi === q.correctIndex;
          buttons[q.correctIndex].classList.add('correct');
          if (!correct) btn.classList.add('wrong');
          buttons.forEach((b) => { b.disabled = true; });
          fb.innerHTML = `<strong>✦ Why?</strong> ${q.why}`;
          fb.className = `lw-feedback show ${correct ? 'good' : 'bad'}`;
          helpers.handleStreak(correct);
          const nextScore = score + (correct ? 1 : 0);
          const contBtn = document.createElement('button');
          contBtn.type = 'button';
          contBtn.className = 'lw-continue-btn';
          contBtn.textContent = qi + 1 < set.length ? 'Next question →' : 'See my results →';
          contBtn.addEventListener('click', () => {
            if (qi + 1 < set.length) renderQuestion(set, qi + 1, nextScore);
            else renderResults(set.length, nextScore);
          });
          slide.querySelector('.lw-card').appendChild(contBtn);
        });
      });
    }

    function renderResults(total, score) {
      const pct = Math.round((score / total) * 100);
      const passed = pct >= kc.passPct * 100;
      slide.innerHTML = `
        <div class="lw-card sw-result-card">
          <div class="lw-eyebrow">Knowledge Check</div>
          <div class="sw-result-pct ${passed ? 'pass' : 'fail'}">${pct}%</div>
          <div class="sw-result-sub">${score} of ${total} correct, ${passed ? `you passed (${Math.round(kc.passPct * 100)}% required)` : `${Math.round(kc.passPct * 100)}% required to pass`}</div>
          ${passed
            ? '<button type="button" class="lw-continue-btn" id="swKcContinue" style="align-self:center">Continue →</button>'
            : '<button type="button" class="lw-continue-btn" id="swKcRetry" style="align-self:center">Try Again, New Questions</button>'}
        </div>
      `;
      if (passed) {
        helpers.burst();
        showToast(`+${kc.xp} GP earned!`, 'Knowledge Check passed 🧠✨');
        document.getElementById('swKcContinue').addEventListener('click', () => onPass(pct));
      } else {
        document.getElementById('swKcRetry').addEventListener('click', () => startAttempt());
      }
    }
  }

  startAttempt();
}

/* ── Check-In ────────────────────────────────────────────────────── */

function renderCheckin(slide, checkin, sectionId, satisfy) {
  if (checkin.fields) { renderFieldCheckin(slide, checkin, sectionId, satisfy); return; }
  const p = checkin.prompts;
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">Student Check-In</div>
      <h2>Let's reflect before you move on.</h2>

      <div class="sw-field">
        <label>${p.whatClicked}</label>
        <textarea class="sw-textarea" id="swWhatClicked" rows="2"></textarea>
      </div>

      <div class="sw-field">
        <label>${p.didntKnow}</label>
        <textarea class="sw-textarea" id="swDidntKnow" rows="2"></textarea>
      </div>

      <div class="sw-field">
        <label>${p.topicLabel}</label>
        <div class="sw-radio-group" id="swTopicGroup">
          ${p.topics.map((t, i) => `<div class="sw-radio-opt" data-i="${i}"><span class="sw-dot"></span><span>${t}</span></div>`).join('')}
        </div>
      </div>

      <div class="sw-field" style="margin-bottom:8px">
        <label>${p.explainToFriend}</label>
        <textarea class="sw-textarea" id="swExplain" rows="4" placeholder="Type it how YOU understand it..."></textarea>
      </div>

      <button type="button" class="lw-continue-btn" id="swSaveCheckin" disabled>Save & Continue →</button>
      <div class="lw-reflect-saved" id="swCheckinSaved" style="display:none">✓ Saved to My Notes</div>
    </div>
  `;
  let selectedTopic = null;
  const whatClicked = slide.querySelector('#swWhatClicked');
  const didntKnow = slide.querySelector('#swDidntKnow');
  const explain = slide.querySelector('#swExplain');
  const saveBtn = slide.querySelector('#swSaveCheckin');

  function checkValid() {
    saveBtn.disabled = !(whatClicked.value.trim().length >= 3 && didntKnow.value.trim().length >= 3 && selectedTopic !== null && explain.value.trim().length >= 15);
  }

  slide.querySelectorAll('.sw-radio-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      slide.querySelectorAll('.sw-radio-opt').forEach((o) => o.classList.remove('on'));
      opt.classList.add('on');
      selectedTopic = p.topics[Number(opt.dataset.i)];
      checkValid();
    });
  });
  [whatClicked, didntKnow, explain].forEach((input) => input.addEventListener('input', checkValid));

  saveBtn.addEventListener('click', () => {
    const text = explain.value.trim();
    try {
      const key = 'aghf_notes';
      const notes = JSON.parse(localStorage.getItem(key) || '[]');
      notes.push({
        sectionId,
        prompt: p.explainToFriend,
        text,
        whatClicked: whatClicked.value.trim(),
        didntKnow: didntKnow.value.trim(),
        topic: selectedTopic,
        savedAt: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (err) { console.error('Check-in save error:', err); }
    saveCheckinReflection(sectionId, p.explainToFriend, text).catch((err) => console.error('Server reflection save error:', err));
    slide.querySelector('#swCheckinSaved').style.display = '';
    saveBtn.disabled = true;
    [whatClicked, didntKnow, explain].forEach((el) => { el.disabled = true; });
    satisfy();
  });
}

// A check-in described as a list of fields:
//   { type: 'text', label, hint?, rows?, min? } or { type: 'choice', label, options }
// The field marked `share: true` is the one also saved as the server reflection.
function renderFieldCheckin(slide, checkin, sectionId, satisfy) {
  const fields = checkin.fields;
  slide.innerHTML = `
    <div class="lw-card">
      <div class="lw-eyebrow">${checkin.eyebrow || 'Student Check-In'}</div>
      <h2>${checkin.heading || "Let's reflect before you move on."}</h2>
      ${fields.map((f, i) => f.type === 'choice' ? `
        <div class="sw-field"><label>${f.label}</label>
          <div class="sw-radio-group" data-f="${i}">${f.options.map((o, oi) => `<div class="sw-radio-opt" data-oi="${oi}"><span class="sw-dot"></span><span>${o}</span></div>`).join('')}</div></div>` : `
        <div class="sw-field"><label>${f.label}</label>${f.hint ? `<div class="sw-hint">${f.hint}</div>` : ''}
          <textarea class="sw-textarea" data-f="${i}" rows="${f.rows || 2}" placeholder="${f.placeholder || ''}"></textarea></div>`).join('')}
      <button type="button" class="lw-continue-btn" id="swSaveCheckin" disabled>Save & Continue →</button>
      <div class="lw-reflect-saved" id="swCheckinSaved" style="display:none">✓ Saved to My Notes</div>
    </div>`;
  const answers = fields.map(() => null);
  const saveBtn = slide.querySelector('#swSaveCheckin');
  const valid = () => fields.every((f, i) => f.type === 'choice' ? answers[i] !== null : (answers[i] || '').trim().length >= (f.min || 3));
  slide.querySelectorAll('textarea[data-f]').forEach((t) => t.addEventListener('input', () => { answers[Number(t.dataset.f)] = t.value; saveBtn.disabled = !valid(); }));
  slide.querySelectorAll('.sw-radio-group').forEach((g) => {
    g.querySelectorAll('.sw-radio-opt').forEach((opt) => opt.addEventListener('click', () => {
      g.querySelectorAll('.sw-radio-opt').forEach((o) => o.classList.remove('on'));
      opt.classList.add('on');
      const f = Number(g.dataset.f);
      answers[f] = fields[f].options[Number(opt.dataset.oi)];
      saveBtn.disabled = !valid();
    }));
  });
  saveBtn.addEventListener('click', () => {
    const entry = { sectionId, savedAt: Date.now(), answers: fields.map((f, i) => ({ prompt: f.label, answer: (answers[i] || '').trim() })) };
    try {
      const notes = JSON.parse(localStorage.getItem('aghf_notes') || '[]');
      notes.push(entry);
      localStorage.setItem('aghf_notes', JSON.stringify(notes));
    } catch (err) { console.error('Check-in save error:', err); }
    const shareIdx = Math.max(0, fields.findIndex((f) => f.share));
    saveCheckinReflection(sectionId, fields[shareIdx].label, (answers[shareIdx] || '').trim()).catch((err) => console.error('Server reflection save error:', err));
    slide.querySelector('#swCheckinSaved').style.display = '';
    saveBtn.disabled = true;
    slide.querySelectorAll('textarea').forEach((t) => { t.disabled = true; });
    satisfy();
  });
}

/* ── Complete ────────────────────────────────────────────────────── */

function renderComplete(slide, data, { flagKey, backHref, nextSectionHref, nextSectionLabel, lessonsLabel, lessonGpTotal, results }) {
  try { localStorage.setItem(flagKey, 'true'); } catch (err) { console.error('Section clear flag error:', err); }
  if (data.complete.stats) { renderRichComplete(slide, data, { backHref, nextSectionHref, lessonsLabel, lessonGpTotal, results }); return; }

  const challengeXp = data.challenge.xp;
  const knowledgeXp = data.knowledgeCheck.xp;
  const totalGp = lessonGpTotal + challengeXp + knowledgeXp;

  slide.innerHTML = `
    <div class="lw-card lw-complete">
      <h2>${data.complete.heading}</h2>
      <div class="lw-badge">${data.complete.badge}</div>
      <div class="sw-stats">
        <div class="sw-stat-row"><span>Lessons</span><strong>${lessonsLabel} ✓</strong></div>
        <div class="sw-stat-row"><span>Challenge</span><strong>✓ +${challengeXp} GP</strong></div>
        <div class="sw-stat-row"><span>Knowledge Check</span><strong>${results.knowledgePct}% +${knowledgeXp} GP</strong></div>
        <div class="sw-stat-row"><span>Reflection</span><strong>Saved ✓</strong></div>
      </div>
      <div class="lw-badge" style="background:rgba(245,168,87,.18);border-color:rgba(245,168,87,.35);color:#F5A857;">+${totalGp} GP earned</div>
    </div>
    ${nextSectionHref ? `
    <div class="lw-card lw-next-up">
      <div class="lw-eyebrow">What's next</div>
      <h2>${nextSectionLabel || 'Next section unlocked'}</h2>
      <button type="button" class="lw-cc-next" id="swNextSectionBtn">Section 2 Unlocked →</button>
    </div>` : `
    <div class="lw-card" style="text-align:center">
      <button type="button" class="lw-cc-next" id="swNextSectionBtn">Back to Lessons →</button>
    </div>`}
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>
  `;
  burst();
  document.getElementById('swNextSectionBtn').addEventListener('click', () => {
    window.location.href = nextSectionHref || backHref;
  });
}

// Section complete with the section's own stat lines, a phase progress
// block, and a "next up" teaser for the following section.
function renderRichComplete(slide, data, { backHref, nextSectionHref, lessonsLabel, lessonGpTotal, results }) {
  const c = data.complete;
  const fill = (str) => String(str).replace('{lessons}', lessonsLabel).replace('{kc}', results.knowledgePct ?? '').replace('{gp}', c.gp ?? lessonGpTotal);
  const ph = c.phase;
  slide.innerHTML = `
    <div class="lw-card lw-complete">
      <div class="lw-eyebrow">${c.eyebrow || 'Section complete'}</div>
      <h2>${c.heading}</h2>
      <div class="lw-badge">${c.badge}</div>
      <div class="sw-stats">${c.stats.map((st) => `<div class="sw-stat-row"><span>${st.label}</span><strong>${fill(st.value)}</strong></div>`).join('')}</div>
      <div class="lw-badge" style="background:rgba(245,168,87,.18);border-color:rgba(245,168,87,.35);color:#F5A857;">+${fill(c.gp ?? lessonGpTotal)} GP</div>
      ${ph ? `<div class="sw-phase"><div class="lw-eyebrow">${ph.title}</div>
        ${ph.sections.map((x) => `<div class="sw-phase-row"><span>${x.icon} ${x.label}</span></div>`).join('')}
        <div class="sw-phase-bar"><div style="width:${ph.pct}%"></div></div>
        <div class="sw-phase-row"><span></span><strong>${ph.pct}%</strong></div></div>` : ''}
    </div>
    ${c.nextUp ? `
    <div class="lw-card lw-next-up sw-next-teaser">
      <div class="lw-eyebrow">🔓 Next up</div>
      <h2>${c.nextUp.title}</h2>
      ${c.nextUp.lines.map((l) => `<p>${l}</p>`).join('')}
      <button type="button" class="lw-cc-next" id="swNextSectionBtn">${c.nextUp.cta || 'Enter next section →'}</button>
    </div>` : `
    <div class="lw-card" style="text-align:center"><button type="button" class="lw-cc-next" id="swNextSectionBtn">Back to Lessons →</button></div>`}
    <div class="lw-back-link"><a href="${backHref}">← Back to all lessons</a></div>`;
  burst();
  document.getElementById('swNextSectionBtn').addEventListener('click', () => { window.location.href = nextSectionHref || backHref; });
}
