/**
 * checklist-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Dayli ICC Trade Checklist page. One function per
 * component (matching the suggested names: ChecklistHeader, Progress,
 * Phase, Item, MethodBadge, DayliNote, WalkAwayConditions, ICCFlowSummary,
 * GoldenRuleCard, TradeDecision, ChecklistSaveBar) — presentation only,
 * exactly like dayli-desk-engine.js. All persistence goes through
 * checklist-service.js; this file never touches storage or fetch.
 *
 * Completion, readiness, and phase state are derived from `state.items`/
 * `state.marketContext` (the stored answers) — never from which DOM
 * elements happen to carry a CSS class — so a reload always restores the
 * same numbers a fresh render would compute.
 */

import {
  CHECKLIST_PHASES, WALK_AWAY_CONDITIONS, ICC_FLOW_SUMMARY, GOLDEN_RULE,
  DAYLI_INTRO_NOTE, DECISION_OPTIONS, readinessLabel,
} from './checklist-template.js';

const BADGE_LABELS = {
  '1H4H': '1H + 4H', '4H': '4H', '1H': '1H', key: 'Key level', target: 'Target',
  watch: 'Watch', risk: 'Risk', '1M': '1M', direction: 'Direction', do_nothing: 'Do nothing',
  limit: 'Limit order',
};
const BADGE_CLASSES = {
  '1H4H': 'cl-badge-blue', '4H': 'cl-badge-blue', '1H': 'cl-badge-blue', key: 'cl-badge-pink',
  target: 'cl-badge-teal', watch: 'cl-badge-peach', risk: 'cl-badge-pink', '1M': 'cl-badge-pink',
  direction: 'cl-badge-teal', do_nothing: 'cl-badge-peach', limit: 'cl-badge-teal',
};

/** MethodBadge — small colored pill labeling a checklist item's timeframe/context. */
export function renderMethodBadge(key) {
  return `<span class="cl-badge ${BADGE_CLASSES[key] || 'cl-badge-peach'}">${BADGE_LABELS[key] || key}</span>`;
}

/** ChecklistHeader — condensed hero (title kept short per "reduce intro copy"). */
export function renderChecklistHeader(container) {
  container.innerHTML = `
    <div class="cl-hero">
      <div class="cl-eyebrow">✦ Dayli ICC Method</div>
      <h1 class="cl-h1">Trade Checklist</h1>
      <p class="cl-hero-sub">Run every box before entry. If any box is missing, the setup is incomplete.</p>
    </div>`;
}

/** ChecklistProgress — progress bar + mini stats, driven entirely by state.items. */
export function renderChecklistProgress(container, state) {
  const total = state.items.length;
  const done = state.items.filter((i) => i.checked).length;
  container.innerHTML = `
    <div class="cl-progress-card">
      <div class="dd-section-title" style="margin-bottom:6px;">Run every box before entry</div>
      <div class="progress-shell"><div class="progress-fill" style="width:${state.completionPct}%"></div></div>
      <div class="cl-mini-grid">
        <div class="cl-mini"><small>Items done</small><strong>${done} / ${total}</strong></div>
        <div class="cl-mini"><small>Readiness</small><strong>${state.readinessStatus}</strong></div>
        <div class="cl-mini"><small>Current phase</small><strong>${(CHECKLIST_PHASES.find((p) => p.key === state.currentPhase) || CHECKLIST_PHASES[0]).title}</strong></div>
      </div>
    </div>`;
}

/** DayliNote — the recurring "From Dayli" guidance card. Two visual variants. */
export function renderDayliNote(variant = 'note', text = DAYLI_INTRO_NOTE) {
  if (variant === 'from-dayli') {
    return `<div class="cl-from-dayli"><div class="cl-note-label">From Dayli</div><div class="cl-note-text">${text}</div></div>`;
  }
  return `<div class="cl-note-box"><div class="cl-note-label">From Dayli</div><div class="cl-note-text">${text}</div></div>`;
}

function renderCaptureField(field, marketContext) {
  const value = marketContext[field.key];
  if (field.type === 'select') {
    return `<div class="cl-capture-field">
      <label>${field.label}</label>
      <select class="cl-capture-input" data-mc-key="${field.key}">
        <option value="">—</option>
        ${field.options.map((o) => `<option value="${o}" ${value === o ? 'selected' : ''}>${o[0].toUpperCase()}${o.slice(1)}</option>`).join('')}
      </select>
    </div>`;
  }
  if (field.type === 'boolean') {
    return `<div class="cl-capture-field cl-capture-bool">
      <label><input type="checkbox" class="cl-capture-input" data-mc-key="${field.key}" ${value ? 'checked' : ''}> ${field.label}</label>
    </div>`;
  }
  return `<div class="cl-capture-field">
    <label>${field.label}</label>
    <input class="cl-capture-input" type="${field.type === 'number' ? 'number' : 'text'}" data-mc-key="${field.key}" value="${value ?? ''}" placeholder="${field.placeholder || ''}">
  </div>`;
}

/** ChecklistItem — one tappable row: check + badges + title/desc + optional inline capture fields. */
function renderChecklistItemRow(item, itemState, marketContext) {
  return `
    <div class="cl-item-row">
      <button type="button" class="cl-check ${itemState.checked ? 'on' : ''}" data-item-key="${item.key}" aria-pressed="${itemState.checked}" aria-label="Mark '${item.title}' ${itemState.checked ? 'incomplete' : 'complete'}">${itemState.checked ? '✓' : ''}</button>
      <div class="cl-item-copy">
        <div class="cl-item-meta">${(item.badges || []).map(renderMethodBadge).join('')}</div>
        <div class="cl-item-title">${item.title}</div>
        <div class="cl-item-desc">${item.desc}</div>
        ${item.captureFields && itemState.checked ? `<div class="cl-capture-row">${item.captureFields.map((f) => renderCaptureField(f, marketContext)).join('')}</div>` : ''}
      </div>
    </div>`;
}

/** ChecklistPhase — one collapsible ICC phase card containing its items. */
function renderPhaseCard(phase, state, collapsedPhases) {
  const isCollapsed = collapsedPhases.has(phase.key);
  const itemStates = phase.items.map((item) => state.items.find((i) => i.key === item.key) || { key: item.key, checked: false });
  return `
    <div class="cl-phase cl-phase-${phase.colorKey}" data-phase-key="${phase.key}">
      <div class="cl-phase-head">
        <div class="cl-phase-left">
          <div class="cl-phase-num">${phase.n}</div>
          <div><div class="cl-phase-sub">${phase.subtitle}</div><div class="cl-phase-title">${phase.title}</div></div>
        </div>
        <div class="cl-phase-hint">${phase.hint}</div>
      </div>
      <div class="cl-phase-summary">
        <p>${phase.summary}</p>
        <button type="button" class="cl-toggle-btn" data-toggle-phase="${phase.key}">${isCollapsed ? 'Show details' : 'Hide details'}</button>
      </div>
      ${!isCollapsed ? `<div class="cl-phase-body">
        ${phase.items.map((item, idx) => renderChecklistItemRow(item, itemStates[idx], state.marketContext)).join('')}
        ${phase.note ? renderDayliNote('note', phase.note.text) : ''}
      </div>` : ''}
    </div>`;
}

/** WalkAwayConditions — dark card grid of walk-away triggers. */
export function renderWalkAwayConditions(container) {
  container.innerHTML = `
    <div class="cl-card cl-walkaway-card">
      <div class="dd-focus-eyebrow" style="color:#FFB6C5;">Walk away if any of these are true</div>
      <div class="cl-warn-grid">
        ${WALK_AWAY_CONDITIONS.map((c) => `<div class="cl-warn-box"><strong>✕ ${c.title}</strong><div>${c.text}</div></div>`).join('')}
      </div>
    </div>`;
}

/** ICCFlowSummary — the 6-step flow strip. */
export function renderICCFlowSummary(container) {
  container.innerHTML = `
    <div class="cl-card">
      <div class="dd-focus-eyebrow">Full ICC flow — lock this in</div>
      <div class="cl-flow-steps">
        ${ICC_FLOW_SUMMARY.map((s) => `<div class="cl-flow-step"><div class="tiny">${s.tiny}</div><div class="big">${s.big}</div></div>`).join('')}
      </div>
    </div>`;
}

/** GoldenRuleCard — dark navy card with the candle-closure rule per phase. */
export function renderGoldenRuleCard(container) {
  container.innerHTML = `
    <div class="cl-golden">
      <div class="cl-golden-title">💡 ${GOLDEN_RULE.title}</div>
      <p>${GOLDEN_RULE.intro}</p>
      ${GOLDEN_RULE.phaseRules.map((r) => `<div class="cl-phase-rule"><strong>${r.phase}</strong> ${r.text}</div>`).join('')}
      <div class="cl-golden-bottom"><div class="cl-note-label" style="color:#F2C55C;">Bottom line</div><div style="color:#F7D98C;">${GOLDEN_RULE.bottomLine}</div></div>
    </div>`;
}

/** TradeDecision — the final Trade / Wait / Pass filter. */
export function renderTradeDecision(container, state, onDecide) {
  container.innerHTML = `
    <div class="cl-card">
      <div class="dd-focus-eyebrow">Final filter</div>
      <div class="dd-focus-title" style="margin-bottom:8px;">Trade or pass?</div>
      <div class="btn-row">
        ${DECISION_OPTIONS.map((d) => `<button type="button" class="btn cl-decision-btn cl-decision-${d.key} ${state.finalDecision === d.key ? 'active' : ''}" data-decision="${d.key}">${d.label}</button>`).join('')}
      </div>
      <div class="decision-output">${state.finalDecision ? DECISION_OPTIONS.find((d) => d.key === state.finalDecision)?.text : 'No decision made yet.'}</div>
      ${state.finalDecision === 'clean' && !state.linkedJournalEntryId ? `<button type="button" class="dd-primary-btn" id="clCreateJournalBtn" style="margin-top:12px;">Create Trade Journal Entry →</button>` : ''}
      ${state.linkedJournalEntryId ? `<a class="dd-secondary-btn" href="journal-entry.html?id=${state.linkedJournalEntryId}" style="margin-top:12px;display:inline-block;">Open Linked Journal Entry →</a>` : ''}
    </div>`;
  container.querySelectorAll('.cl-decision-btn').forEach((btn) => {
    btn.addEventListener('click', () => onDecide(btn.dataset.decision));
  });
  const createBtn = container.querySelector('#clCreateJournalBtn');
  if (createBtn) createBtn.addEventListener('click', () => onDecide('clean', { createJournalEntry: true }));
}

/** ChecklistSaveBar — sticky save-state indicator. */
export function renderChecklistSaveBar(container, status, lastSavedAt) {
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : lastSavedAt ? `✓ Saved ${new Date(lastSavedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Not saved yet';
  container.innerHTML = `
    <div class="cl-save-bar">
      <span class="cl-save-quote">“You don’t enter because price is moving.” — Dayli</span>
      <span class="cl-save-status cl-save-${status}" role="status" aria-live="polite">${statusText}</span>
    </div>`;
}

/**
 * Orchestrates the whole page. `helpers.onChange(nextState)` is called
 * after every answer change (item toggle, capture field, decision) so the
 * host page can trigger autosave; this module never saves anything itself.
 */
export function renderChecklistPage(container, state, helpers) {
  const collapsedPhases = new Set(CHECKLIST_PHASES.slice(1).map((p) => p.key)); // phases 2-4 start collapsed, matching preview.html

  function update(next) {
    state = next;
    helpers.onChange(state);
    paint();
  }

  function paint() {
    container.innerHTML = `
      <div id="clHeader"></div>
      <div class="grid2 cl-grid2">
        <div id="clProgress"></div>
        <div id="clDayliNote"></div>
      </div>
      <div id="clPhases"></div>
      <div id="clWalkAway"></div>
      <div id="clFlow"></div>
      <div id="clGolden"></div>
      <div id="clFromDayli"></div>
      <div id="clDecision"></div>
      <div id="clSaveBar"></div>
    `;
    renderChecklistHeader(container.querySelector('#clHeader'));
    renderChecklistProgress(container.querySelector('#clProgress'), state);
    container.querySelector('#clDayliNote').innerHTML = renderDayliNote('note');
    container.querySelector('#clPhases').innerHTML = CHECKLIST_PHASES.map((p) => renderPhaseCard(p, state, collapsedPhases)).join('');
    renderWalkAwayConditions(container.querySelector('#clWalkAway'));
    renderICCFlowSummary(container.querySelector('#clFlow'));
    renderGoldenRuleCard(container.querySelector('#clGolden'));
    container.querySelector('#clFromDayli').innerHTML = renderDayliNote('from-dayli', DAYLI_INTRO_NOTE);
    renderTradeDecision(container.querySelector('#clDecision'), state, handleDecision);
    renderChecklistSaveBar(container.querySelector('#clSaveBar'), helpers.saveStatus || 'saved', helpers.lastSavedAt);

    container.querySelectorAll('.cl-check').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.itemKey;
        const items = state.items.map((i) => (i.key === key ? { ...i, checked: !i.checked } : i));
        update({ ...state, items });
      });
    });
    container.querySelectorAll('[data-toggle-phase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.togglePhase;
        if (collapsedPhases.has(key)) collapsedPhases.delete(key); else collapsedPhases.add(key);
        paint();
      });
    });
    container.querySelectorAll('.cl-capture-input').forEach((input) => {
      const commit = () => {
        const key = input.dataset.mcKey;
        const value = input.type === 'checkbox' ? input.checked : input.type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value;
        update({ ...state, marketContext: { ...state.marketContext, [key]: value } });
      };
      input.addEventListener(input.tagName === 'SELECT' || input.type === 'checkbox' ? 'change' : 'blur', commit);
    });
  }

  function handleDecision(decisionKey, opts = {}) {
    update({ ...state, finalDecision: decisionKey });
    if (opts.createJournalEntry) helpers.onCreateJournalEntry(state);
  }

  paint();
  return {
    getState: () => state,
    setState: update,
    setSaveStatus(status, lastSavedAt) {
      helpers.saveStatus = status;
      helpers.lastSavedAt = lastSavedAt;
      const bar = container.querySelector('#clSaveBar');
      if (bar) renderChecklistSaveBar(bar, status, lastSavedAt);
    },
  };
}
