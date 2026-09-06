/**
 * psychology-engine.js — A Girl & Her Futures™
 *
 * Render layer for The Inner Edge (Psychology Coach). Same conventions as
 * journal-engine.js: hand-rolled `state` + `paint()` per multi-step flow
 * (no framework), chip-button groups for single/multi choice, a field
 * committed on blur (never on every keystroke) so a full repaint never
 * steals focus mid-sentence. Every flow consults psychology-rules-engine.js
 * for its actual decision logic — this file is presentation only.
 *
 * Every free-text field a member can type into is scanned by
 * psychology-safety.js before it's used for anything else; a match
 * replaces the normal flow with the matching static safety response
 * from psychology-safety-copy.js — never an AI-generated reply.
 */

import { MODE_CARDS, EMPTY_STATES, COOLDOWN_END_QUESTION } from './psychology-copy.js';
import { PLAYBOOK_CATEGORIES, COOLDOWN_DURATIONS, COACHING_TONES, URGENT_SHORTCUTS } from './dashboard-models.js';
import {
  TALK_TRIGGERS, QUESTION_BANK, resolveTalkMeThrough,
  computeReadiness,
  WHAT_HAPPENED_OPTIONS, EXECUTION_ANSWER_OPTIONS, POST_LOSS_URGE_OPTIONS, classifyPostLoss, recommendPostLossAction,
} from './psychology-rules-engine.js';
import { scanForSafetyConcern } from './psychology-safety.js';
import { CRISIS_RESPONSE, TRADING_HARM_RESPONSE } from './psychology-safety-copy.js';

/* ── Small shared helpers ─────────────────────────────────────────── */

function renderSafetyResponse(container, category) {
  const copy = category === 'crisis' ? CRISIS_RESPONSE : TRADING_HARM_RESPONSE;
  container.innerHTML = `
    <div class="dd-card psy-safety-card">
      <div class="psy-safety-heading">${copy.heading}</div>
      <p class="psy-safety-body">${copy.body}</p>
      <ul class="psy-safety-actions">${copy.actions.map((a) => `<li>${a.href ? `<a href="${a.href}">${a.label}</a>` : a.label}</li>`).join('')}</ul>
      <div class="psy-safety-footer">${copy.footer}</div>
    </div>`;
}

/** Checks free text before it's used anywhere else. Returns true if a safety response was shown (caller should stop). */
export function guardFreeText(container, text) {
  const hit = scanForSafetyConcern(text);
  if (hit) { renderSafetyResponse(container, hit.category); return true; }
  return false;
}

/* ── Coach Home ───────────────────────────────────────────────────── */

export function renderCoachHome(container, opts = {}) {
  container.innerHTML = `
    <div class="psy-urgent-row">
      ${URGENT_SHORTCUTS.map((label) => `<button type="button" class="psy-urgent-chip" data-trigger-label="${label}">${label}</button>`).join('')}
    </div>
    <div class="psy-mode-grid">
      ${MODE_CARDS.map((m) => m.comingSoon
        ? `<div class="psy-mode-card state-gated is-coming-soon"><span class="psy-mode-icon">${m.icon}</span><div class="psy-mode-title">${m.title}</div><div class="psy-mode-desc">${m.desc}</div><span class="gated-label is-soon-label">Coming soon</span></div>`
        : `<a class="psy-mode-card" href="${m.href}"><span class="psy-mode-icon">${m.icon}</span><div class="psy-mode-title">${m.title}</div><div class="psy-mode-desc">${m.desc}</div></a>`
      ).join('')}
    </div>`;
  container.querySelectorAll('[data-trigger-label]').forEach((btn) => {
    btn.addEventListener('click', () => opts.onUrgentChip && opts.onUrgentChip(btn.dataset.triggerLabel));
  });
}

/* ── Mode 1: Talk Me Through This ─────────────────────────────────── */

export function renderTalkMeThrough(container, helpers = {}) {
  const state = { triggerKey: helpers.initialTriggerKey || null, answers: {}, qIndex: 0, result: null };

  function currentTrigger() {
    return TALK_TRIGGERS.find((t) => t.key === state.triggerKey);
  }

  function paint() {
    if (state.result) return paintResult();
    if (!state.triggerKey) return paintTriggerPicker();
    const trigger = currentTrigger();
    if (state.qIndex >= trigger.questions.length) {
      state.result = resolveTalkMeThrough(state.answers);
      return paintResult();
    }
    paintQuestion(trigger);
  }

  function paintTriggerPicker() {
    container.innerHTML = `
      <div class="psy-flow-heading">What is happening right now?</div>
      <div class="psy-flow-sub">Pick the one that fits closest — you can be more specific after.</div>
      <div class="chip-group psy-trigger-list" data-chip-group="trigger">
        ${TALK_TRIGGERS.map((t) => `<button type="button" class="chip psy-trigger-chip" data-chip-value="${t.key}">${t.label}</button>`).join('')}
      </div>`;
    container.querySelectorAll('.psy-trigger-chip').forEach((btn) => {
      btn.addEventListener('click', () => { state.triggerKey = btn.dataset.chipValue; state.qIndex = 0; paint(); });
    });
  }

  function paintQuestion(trigger) {
    const qId = trigger.questions[state.qIndex];
    const q = QUESTION_BANK[qId];
    const total = trigger.questions.length;
    const options = q.type === 'yesno' ? [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] : q.options;
    container.innerHTML = `
      <div class="psy-flow-progress">Question ${state.qIndex + 1} of ${total}</div>
      <div class="psy-flow-heading">${q.prompt}</div>
      <div class="chip-group" data-chip-group="answer">
        ${options.map((o) => `<button type="button" class="chip" data-chip-value="${String(o.key)}">${o.label}</button>`).join('')}
      </div>
      <div class="psy-flow-nav">${state.qIndex > 0 ? '<button type="button" class="dd-secondary-btn" id="psyBack">← Back</button>' : ''}</div>`;
    container.querySelectorAll('[data-chip-group="answer"] .chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.chipValue;
        state.answers[qId] = raw === 'true' ? true : raw === 'false' ? false : raw;
        state.qIndex += 1;
        paint();
      });
    });
    const backBtn = container.querySelector('#psyBack');
    if (backBtn) backBtn.addEventListener('click', () => { state.qIndex -= 1; paint(); });
  }

  function paintResult() {
    const r = state.result;
    container.innerHTML = `
      <div class="psy-result-card">
        <div class="psy-result-eyebrow">✦ Based on what you shared</div>
        <div class="psy-result-action">${r.actionLabel}</div>
        <p class="psy-result-message">${r.message}</p>
        <div class="psy-result-actions">
          <button type="button" class="dd-primary-btn" id="psySaveBtn">Save to History</button>
          <button type="button" class="dd-secondary-btn" id="psyRestartBtn">Start Over</button>
          ${helpers.onCooldown ? '<button type="button" class="dd-secondary-btn" id="psyCooldownBtn">Start a Cooldown Timer</button>' : ''}
        </div>
      </div>`;
    container.querySelector('#psySaveBtn').addEventListener('click', async (e) => {
      e.target.disabled = true; e.target.textContent = 'Saved ✓';
      helpers.onComplete && await helpers.onComplete({
        mode: 'talk_me_through', triggerCategory: currentTrigger()?.label, structuredResponses: state.answers,
        rulesTriggered: r.rulesTriggered, recommendedAction: r.action, status: 'completed',
      });
    });
    const cooldownBtn = container.querySelector('#psyCooldownBtn');
    if (cooldownBtn) cooldownBtn.addEventListener('click', () => helpers.onCooldown());
    container.querySelector('#psyRestartBtn').addEventListener('click', () => {
      state.triggerKey = null; state.answers = {}; state.qIndex = 0; state.result = null; paint();
    });
  }

  paint();
  return { getState: () => state };
}

/* ── Mode 2: Pre-Trade Mental Check ──────────────────────────────── */

const PRE_TRADE_QUESTIONS = [
  { key: 'urgeStrength', prompt: 'How strong is the urge to enter right now?', options: [1, 2, 3, 4, 5].map((n) => ({ key: n, label: String(n) })) },
  { key: 'state', prompt: 'Which feels closer to true right now?', options: [{ key: 'calm', label: 'Calm' }, { key: 'activated', label: 'Activated' }, { key: 'emotionally_influenced', label: 'Emotionally influenced' }] },
  { key: 'confirmedOrAnticipating', prompt: 'Has the setup confirmed, or are you expecting it to?', options: [{ key: 'confirmed', label: 'It confirmed' }, { key: 'anticipating', label: 'I’m expecting it to' }] },
  { key: 'comfortableWithPlannedLoss', prompt: 'Are you comfortable accepting the full planned loss?', options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] },
  { key: 'permittedByPlan', prompt: 'Is this permitted by the plan you saved today?', options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] },
  { key: 'avoidingMissingMove', prompt: 'Are you trying to avoid missing the move?', options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] },
  { key: 'tryingToRecover', prompt: 'Are you trying to recover money from an earlier trade?', options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] },
  { key: 'withinDailyLimits', prompt: 'Are you within today’s saved trade and risk limits?', options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] },
];

export function renderPreTradeCheck(container, helpers = {}) {
  const state = { qIndex: 0, answers: {}, readiness: null };

  function paint() {
    if (state.readiness) return paintResult();
    const q = PRE_TRADE_QUESTIONS[state.qIndex];
    container.innerHTML = `
      <div class="psy-flow-progress">Question ${state.qIndex + 1} of ${PRE_TRADE_QUESTIONS.length}</div>
      <div class="psy-flow-heading">${q.prompt}</div>
      <div class="chip-group">
        ${q.options.map((o) => `<button type="button" class="chip" data-v="${String(o.key)}">${o.label}</button>`).join('')}
      </div>
      <div class="psy-flow-nav">${state.qIndex > 0 ? '<button type="button" class="dd-secondary-btn" id="psyBack">← Back</button>' : ''}</div>`;
    container.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.v;
        state.answers[q.key] = raw === 'true' ? true : raw === 'false' ? false : Number.isNaN(Number(raw)) ? raw : Number(raw);
        state.qIndex += 1;
        if (state.qIndex >= PRE_TRADE_QUESTIONS.length) state.readiness = computeReadiness(state.answers);
        paint();
      });
    });
    const backBtn = container.querySelector('#psyBack');
    if (backBtn) backBtn.addEventListener('click', () => { state.qIndex -= 1; paint(); });
  }

  function paintResult() {
    const r = state.readiness;
    container.innerHTML = `
      <div class="psy-result-card">
        <div class="psy-readiness-badge psy-readiness-${r.key}">${r.label}</div>
        <p class="psy-result-message">${r.message}</p>
        <div class="psy-result-actions">
          <button type="button" class="dd-primary-btn" id="psySaveBtn">Save to History</button>
          <button type="button" class="dd-secondary-btn" id="psyRestartBtn">Check Again</button>
          ${helpers.onCooldown ? '<button type="button" class="dd-secondary-btn" id="psyCooldownBtn">Start a Cooldown Timer</button>' : ''}
        </div>
      </div>`;
    container.querySelector('#psySaveBtn').addEventListener('click', async (e) => {
      e.target.disabled = true; e.target.textContent = 'Saved ✓';
      helpers.onComplete && await helpers.onComplete({
        mode: 'pre_trade_check', structuredResponses: state.answers, readinessResult: r.label, status: 'completed',
      });
    });
    const cooldownBtn = container.querySelector('#psyCooldownBtn');
    if (cooldownBtn) cooldownBtn.addEventListener('click', () => helpers.onCooldown());
    container.querySelector('#psyRestartBtn').addEventListener('click', () => {
      state.qIndex = 0; state.answers = {}; state.readiness = null; paint();
    });
  }

  paint();
  return { getState: () => state };
}

/* ── Mode 3: Post-Loss Reset ──────────────────────────────────────── */

export function renderPostLossReset(container, helpers = {}) {
  const state = { step: 1, whatHappened: null, executionAnswer: null, urge: null, classification: null, actionRec: null };

  async function paint() {
    if (state.step === 1) return paintStep1();
    if (state.step === 2) return paintStep2();
    if (state.step === 3) return paintStep3();
    if (state.step === 4) return paintStep4();
    return paintFinal();
  }

  function paintStep1() {
    container.innerHTML = `
      <div class="psy-flow-progress">Step 1 of 4</div>
      <div class="psy-flow-heading">What happened?</div>
      <div class="chip-group">${WHAT_HAPPENED_OPTIONS.map((o) => `<button type="button" class="chip" data-v="${o.key}">${o.label}</button>`).join('')}</div>`;
    container.querySelectorAll('.chip').forEach((btn) => btn.addEventListener('click', () => { state.whatHappened = btn.dataset.v; state.step = 2; paint(); }));
  }

  function paintStep2() {
    container.innerHTML = `
      <div class="psy-flow-progress">Step 2 of 4</div>
      <div class="psy-flow-heading">Separating the outcome from the execution</div>
      <div class="chip-group">${EXECUTION_ANSWER_OPTIONS.map((o) => `<button type="button" class="chip" data-v="${o.key}">${o.label}</button>`).join('')}</div>
      <div class="psy-flow-nav"><button type="button" class="dd-secondary-btn" id="psyBack">← Back</button></div>`;
    container.querySelectorAll('.chip').forEach((btn) => btn.addEventListener('click', () => {
      state.executionAnswer = btn.dataset.v;
      state.classification = classifyPostLoss(state.whatHappened, state.executionAnswer);
      state.step = 3; paint();
    }));
    container.querySelector('#psyBack').addEventListener('click', () => { state.step = 1; paint(); });
  }

  function paintStep3() {
    container.innerHTML = `
      <div class="psy-flow-progress">Step 3 of 4</div>
      <div class="dd-card psy-inline-note">${state.classification.message}</div>
      <div class="psy-flow-heading">What do you feel the urge to do right now?</div>
      <div class="chip-group">${POST_LOSS_URGE_OPTIONS.map((o) => `<button type="button" class="chip" data-v="${o.key}">${o.label}</button>`).join('')}</div>`;
    container.querySelectorAll('.chip').forEach((btn) => btn.addEventListener('click', async () => {
      state.urge = btn.dataset.v;
      const limits = helpers.getLimits ? await helpers.getLimits() : { reachedTradeLimit: false, reachedRiskLimit: false };
      state.actionRec = recommendPostLossAction(state.urge, limits);
      state.step = 4; paint();
    }));
  }

  function paintStep4() {
    container.innerHTML = `
      <div class="psy-flow-progress">Step 4 of 4</div>
      <div class="psy-result-card">
        <div class="psy-result-eyebrow">✦ Today’s saved limits, checked</div>
        <div class="psy-result-action">${state.actionRec.action.replace(/_/g, ' ')}</div>
        <p class="psy-result-message">${state.actionRec.message}</p>
        <div class="psy-result-actions">
          <button type="button" class="dd-primary-btn" id="psySaveBtn">Save to History</button>
          ${helpers.onCooldown ? '<button type="button" class="dd-secondary-btn" id="psyCooldownBtn">Start a Cooldown Timer</button>' : ''}
        </div>
      </div>`;
    container.querySelector('#psySaveBtn').addEventListener('click', async (e) => {
      e.target.disabled = true; e.target.textContent = 'Saved ✓';
      helpers.onComplete && await helpers.onComplete({
        mode: 'post_loss_reset',
        structuredResponses: { whatHappened: state.whatHappened, executionAnswer: state.executionAnswer, urge: state.urge },
        recommendedAction: state.actionRec.action, status: 'completed',
      });
    });
    const cooldownBtn = container.querySelector('#psyCooldownBtn');
    if (cooldownBtn) cooldownBtn.addEventListener('click', () => helpers.onCooldown());
  }

  paint();
  return { getState: () => state };
}

/* ── Cooldown Timer ───────────────────────────────────────────────── */

export function renderCooldownTimer(container, opts = {}) {
  let timerId = null;
  let remaining = null;

  function paintPicker() {
    container.innerHTML = `
      <div class="psy-flow-heading">How long do you want to step away?</div>
      <div class="chip-group">${COOLDOWN_DURATIONS.map((d) => `<button type="button" class="chip" data-key="${d.key}">${d.label}</button>`).join('')}</div>`;
    container.querySelectorAll('.chip').forEach((btn) => btn.addEventListener('click', () => start(btn.dataset.key)));
  }

  function start(key) {
    const duration = COOLDOWN_DURATIONS.find((d) => d.key === key);
    remaining = duration.seconds;
    paintRunning(duration);
    if (remaining != null) {
      timerId = setInterval(() => {
        remaining -= 1;
        const ring = container.querySelector('#psyCooldownRing span');
        if (ring) ring.textContent = fmtTime(remaining);
        if (remaining <= 0) { clearInterval(timerId); paintDone(); }
      }, 1000);
    }
  }

  function fmtTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

  function paintRunning(duration) {
    container.innerHTML = `
      <div class="psy-cooldown-ring" id="psyCooldownRing"><span>${remaining != null ? fmtTime(remaining) : '∞'}</span></div>
      <p class="psy-cooldown-note">Breathe in for 4, hold for 4, out for 6. Let this play out without checking price.</p>
      ${opts.walkAwayRule ? `<div class="dd-card psy-inline-note">Your saved walk-away rule: ${opts.walkAwayRule}</div>` : ''}
      <button type="button" class="dd-secondary-btn" id="psyEndEarly">I’m done — end early</button>`;
    container.querySelector('#psyEndEarly').addEventListener('click', () => { if (timerId) clearInterval(timerId); paintDone(); });
  }

  function paintDone() {
    container.innerHTML = `
      <div class="psy-flow-heading">${COOLDOWN_END_QUESTION}</div>
      <div class="chip-group">
        <button type="button" class="chip" data-v="changed">The setup changed</button>
        <button type="button" class="chip" data-v="urgency_only">Only the urgency changed</button>
      </div>`;
    container.querySelectorAll('.chip').forEach((btn) => btn.addEventListener('click', () => opts.onDone && opts.onDone(btn.dataset.v)));
  }

  paintPicker();
}

/* ── Mode 5: Scenario Lab ─────────────────────────────────────────── */

export function renderScenarioList(container, scenarios, opts = {}) {
  if (!scenarios.length) { container.innerHTML = `<div class="dd-card">${EMPTY_STATES.patternMirror}</div>`; return; }
  container.innerHTML = `<div class="psy-scenario-grid">${scenarios.map((s) => `
    <button type="button" class="psy-scenario-card" data-id="${s.id}">
      <span class="psy-scenario-category">${s.category}</span>
      <div class="psy-scenario-title">${s.title}</div>
      <span class="psy-scenario-difficulty">${s.difficulty}</span>
    </button>`).join('')}</div>`;
  container.querySelectorAll('.psy-scenario-card').forEach((btn) => btn.addEventListener('click', () => opts.onOpen && opts.onOpen(btn.dataset.id)));
}

export function renderScenarioAttempt(container, scenario, opts = {}) {
  const state = { selected: null, submitted: false };

  function paint() {
    if (state.submitted) return paintFeedback();
    container.innerHTML = `
      <div class="psy-scenario-category">${scenario.category}</div>
      <div class="psy-flow-heading">${scenario.title}</div>
      <p class="psy-scenario-situation">${scenario.situation}</p>
      <div class="dd-card psy-inline-note"><strong>ICC context:</strong> ${scenario.iccContext}</div>
      <div class="psy-scenario-trigger">Trigger: ${scenario.trigger}</div>
      <div class="chip-group psy-scenario-options" data-chip-group="options">
        ${scenario.options.map((o) => `<button type="button" class="chip psy-scenario-option" data-v="${o.id}">${o.label}</button>`).join('')}
      </div>
      <label class="field-label" for="psyReasoning">Optional — why? (not scored, just for your own reflection)</label>
      <textarea class="field-textarea" id="psyReasoning" rows="2"></textarea>
      <button type="button" class="dd-primary-btn" id="psySubmit" disabled>See Feedback</button>`;
    let selected = null;
    container.querySelectorAll('.psy-scenario-option').forEach((btn) => btn.addEventListener('click', () => {
      container.querySelectorAll('.psy-scenario-option').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selected = btn.dataset.v;
      container.querySelector('#psySubmit').disabled = false;
    }));
    container.querySelector('#psySubmit').addEventListener('click', () => {
      const reasoning = container.querySelector('#psyReasoning').value.trim();
      if (reasoning && guardFreeText(container, reasoning)) return;
      state.selected = selected;
      state.reasoning = reasoning;
      state.submitted = true;
      paint();
    });
  }

  function paintFeedback() {
    const option = scenario.options.find((o) => o.id === state.selected);
    container.innerHTML = `
      <div class="psy-flow-heading">${scenario.title}</div>
      <div class="dd-card psy-inline-note ${option.isBestProcess ? 'psy-note-good' : ''}">${option.feedback}</div>
      <div class="psy-scenario-principle"><strong>The principle:</strong> ${scenario.principle}</div>
      <div class="psy-scenario-reflection">${scenario.reflectionPrompt}</div>
      <div class="psy-result-actions">
        <button type="button" class="dd-primary-btn" id="psySaveBtn">Save & Continue</button>
      </div>`;
    container.querySelector('#psySaveBtn').addEventListener('click', async (e) => {
      e.target.disabled = true; e.target.textContent = 'Saved ✓';
      opts.onComplete && await opts.onComplete({
        scenarioId: scenario.id, selectedResponseId: state.selected, writtenReasoning: state.reasoning || null,
        feedbackShown: option.feedback, processScore: option.processScore,
      });
    });
  }

  paint();
}

/* ── Mode 7: Playbook ─────────────────────────────────────────────── */

export function renderPlaybook(container, items, opts = {}) {
  container.innerHTML = PLAYBOOK_CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat.key);
    return `
      <div class="psy-playbook-section">
        <div class="psy-playbook-section-head">
          <span>${cat.label}</span>
          <button type="button" class="dd-secondary-btn psy-add-btn" data-cat="${cat.key}">+ Add</button>
        </div>
        <div class="psy-playbook-items" data-cat-list="${cat.key}">
          ${catItems.map((i) => `
            <div class="psy-playbook-item${i.pinned ? ' pinned' : ''}" data-id="${i.id}">
              <div class="psy-playbook-item-title">${i.pinned ? '📌 ' : ''}${i.title}</div>
              <div class="psy-playbook-item-content">${i.content}</div>
              <div class="psy-playbook-item-actions">
                <button type="button" data-act="pin" data-id="${i.id}">${i.pinned ? 'Unpin' : 'Pin'}</button>
                <button type="button" data-act="delete" data-id="${i.id}">Remove</button>
              </div>
            </div>`).join('') || '<div class="psy-playbook-empty">Nothing here yet.</div>'}
        </div>
        <div class="psy-playbook-form" data-form="${cat.key}" hidden>
          <input class="field-input" type="text" placeholder="Title" data-field="title">
          <textarea class="field-textarea" rows="2" placeholder="e.g. If I miss the original entry, I will record it as missed and wait for a completely new setup." data-field="content"></textarea>
          <button type="button" class="dd-primary-btn" data-save-cat="${cat.key}">Save</button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.psy-add-btn').forEach((btn) => btn.addEventListener('click', () => {
    const form = container.querySelector(`[data-form="${btn.dataset.cat}"]`);
    form.hidden = !form.hidden;
  }));
  container.querySelectorAll('[data-save-cat]').forEach((btn) => btn.addEventListener('click', async () => {
    const form = container.querySelector(`[data-form="${btn.dataset.saveCat}"]`);
    const title = form.querySelector('[data-field="title"]').value.trim();
    const content = form.querySelector('[data-field="content"]').value.trim();
    if (!title && !content) return;
    if (guardFreeText(container, `${title} ${content}`)) return;
    await opts.onAdd({ category: btn.dataset.saveCat, title, content, sourceType: 'manual' });
  }));
  container.querySelectorAll('[data-act="pin"]').forEach((btn) => btn.addEventListener('click', () => {
    const item = items.find((i) => i.id === btn.dataset.id);
    opts.onUpdate({ id: item.id, category: item.category, title: item.title, content: item.content, pinned: !item.pinned });
  }));
  container.querySelectorAll('[data-act="delete"]').forEach((btn) => btn.addEventListener('click', () => opts.onDelete(btn.dataset.id)));
}

/* ── History ──────────────────────────────────────────────────────── */

const MODE_LABELS = {
  talk_me_through: 'Talk Me Through This', pre_trade_check: 'Pre-Trade Mental Check',
  post_loss_reset: 'Post-Loss Reset', scenario: 'Scenario Lab', weekly_review: 'Weekly Review', ask_question: 'Ask a Question',
};

export function renderHistoryList(container, sessions, opts = {}) {
  if (!sessions.length) { container.innerHTML = `<div class="dd-card">${EMPTY_STATES.dashboardCard}</div>`; return; }
  container.innerHTML = `<div class="psy-history-list">${sessions.map((s) => `
    <div class="psy-history-row" data-id="${s.id}">
      <div>
        <div class="psy-history-mode">${MODE_LABELS[s.mode] || s.mode}</div>
        <div class="psy-history-meta">${new Date(s.createdAt).toLocaleDateString()} ${s.triggerCategory ? `· ${s.triggerCategory}` : ''}${s.readinessResult ? `· ${s.readinessResult}` : ''}</div>
      </div>
      <button type="button" data-del="${s.id}">Remove</button>
    </div>`).join('')}</div>`;
  container.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => opts.onDelete && opts.onDelete(btn.dataset.del)));
}

/* ── Consent Settings ─────────────────────────────────────────────── */

const CONSENT_LABELS = {
  tradeData: 'Structured trade data', checklistAnswers: 'Checklist answers', journalStructured: 'Structured journal fields',
  journalFreetext: 'Free-text journal reflections', emotions: 'Structured emotions', sessionHistory: 'Psychology session history',
  playbook: 'Playbook entries', academyProgress: 'Academy progress',
};

export function renderConsentSettings(container, profile, opts = {}) {
  container.innerHTML = `
    <div class="dd-card">
      <div class="dd-section-title">Coaching Tone</div>
      <div class="chip-group" data-chip-group="tone">
        ${COACHING_TONES.map((t) => `<button type="button" class="chip${profile.coachingTone === t.key ? ' active' : ''}" data-v="${t.key}" title="${t.desc}">${t.label}</button>`).join('')}
      </div>
    </div>
    <div class="dd-card">
      <label class="psy-toggle-row"><input type="checkbox" id="psyPersonalization" ${profile.personalizationEnabled ? 'checked' : ''}> Use my history to personalize coaching</label>
    </div>
    <div class="dd-card">
      <div class="dd-section-title">What The Inner Edge can look at</div>
      ${Object.entries(CONSENT_LABELS).map(([key, label]) => `
        <label class="psy-toggle-row"><input type="checkbox" data-consent="${key}" ${profile.consent?.[key] !== false ? 'checked' : ''}> ${label}</label>`).join('')}
    </div>
    <div class="dd-card">
      <button type="button" class="dd-secondary-btn" id="psyDeleteHistory">Delete Psychology History</button>
      <p class="psy-flow-sub">Removes every saved coaching session. Playbook entries are kept separate and removable individually.</p>
    </div>
    <button type="button" class="dd-primary-btn" id="psySaveConsent">Save Settings</button>`;

  container.querySelector('#psySaveConsent').addEventListener('click', () => {
    const coachingTone = container.querySelector('[data-chip-group="tone"] .chip.active')?.dataset.v || profile.coachingTone;
    const personalizationEnabled = container.querySelector('#psyPersonalization').checked;
    const consent = { ...profile.consent };
    container.querySelectorAll('[data-consent]').forEach((cb) => { consent[cb.dataset.consent] = cb.checked; });
    opts.onSave && opts.onSave({ coachingTone, personalizationEnabled, consent });
  });
  container.querySelectorAll('[data-chip-group="tone"] .chip').forEach((btn) => btn.addEventListener('click', () => {
    container.querySelectorAll('[data-chip-group="tone"] .chip').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
  }));
  container.querySelector('#psyDeleteHistory').addEventListener('click', () => opts.onDeleteHistory && opts.onDeleteHistory());
}
