/**
 * agent-engine.js — A Girl & Her Futures™
 *
 * Render layer for the AGHF Agent workspace. One entry point,
 * `renderAgentWorkspace(container, helpers)`, builds the whole chat
 * shell once and updates pieces incrementally afterward — the one
 * deliberate exception to this codebase's usual "full repaint on every
 * state change" convention (dayli-desk-engine.js, psychology-engine.js)
 * is the in-flight assistant message, which gets an `appendDelta()`
 * handle so streamed tokens land directly in one DOM node rather than
 * re-rendering the whole thread on every chunk.
 *
 * Reused, unmodified: scanForSafetyConcern (psychology-safety.js) runs
 * on every composer submit before anything is sent; openModal/closeModal/
 * showDeskToast (dayli-desk-engine.js) back rename/delete-confirm/toasts;
 * renderCooldownTimer/renderPreTradeCheck/renderPostLossReset/
 * renderScenarioAttempt (psychology-engine.js) mount unmodified into the
 * slide-over when the agent suggests launching one.
 */

import { RESPONSE_MODES, SUGGESTED_PROMPTS, ATTACHMENT_ACTIONS, EMPTY_STATES, IMAGE_CAVEAT, VOICE_DISCLOSURE, DESCRIPTION, SUPPORTING_COPY } from './agent-copy.js';
import * as agentService from './agent-service.js';
import { scanForSafetyConcern } from './psychology-safety.js';
import { openModal, closeModal, showDeskToast } from './dayli-desk-engine.js';
import { renderCooldownTimer, renderPreTradeCheck, renderPostLossReset, renderScenarioAttempt } from './psychology-engine.js';
import { getScenarioById, PSYCHOLOGY_SCENARIOS } from './psychology-scenarios-data.js';
import { listEntries, setExcludedFromAgent } from './journal-service.js';
import { listChecklists, setChecklistExcludedFromAgent } from './checklist-service.js';
import { savePlaybookItem } from './psychology-service.js';
import { classifyIntent } from './agent-intent-classifier.js';
import { TALK_TRIGGERS, QUESTION_BANK, resolveTalkMeThrough } from './psychology-rules-engine.js';

/* ── Tiny safe text rendering (escape first, then a minimal markdown-lite) ── */

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderRichText(str) {
  const escaped = escapeHtml(str);
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withBold.split('\n\n').map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
}

const EVIDENCE_STRENGTH_LABELS = {
  early_signal: 'Early Signal', emerging: 'Emerging Pattern', repeating: 'Repeating Pattern',
  strong: 'Strong Pattern', not_enough_data: 'Not Enough Data',
};

/* ── Interactive components (belief/urge/execution checks, evidence comparison, if-then) ── */

function renderStructuredComponent(component, data) {
  if (component === 'belief_check') {
    return `<div class="agc-component" data-component="belief_check">
      <div class="agc-component-label">${escapeHtml(data.statement || '')}</div>
      <div class="agc-scale">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="agc-scale-btn" data-v="${n}">${n}</button>`).join('')}</div>
    </div>`;
  }
  if (component === 'urge_check') {
    return `<div class="agc-component" data-component="urge_check">
      <div class="agc-component-label">How strong is the urge right now?</div>
      <div class="chip-group">${['Low', 'Moderate', 'High', 'Very High'].map((l) => `<button type="button" class="chip" data-v="${l}">${l}</button>`).join('')}</div>
    </div>`;
  }
  if (component === 'execution_check') {
    return `<div class="agc-component" data-component="execution_check">
      <div class="agc-component-label">Was continuation confirmed before entry?</div>
      <div class="chip-group">${['Yes', 'No', 'Not Sure'].map((l) => `<button type="button" class="chip" data-v="${l}">${l}</button>`).join('')}</div>
    </div>`;
  }
  if (component === 'evidence_comparison') {
    return `<div class="agc-component agc-evidence-compare" data-component="evidence_comparison">
      <p>${escapeHtml(data.summary || '')}</p>
      <div class="agc-card-actions">
        <button type="button" class="dd-secondary-btn" data-v="explore">Explore This</button>
        <button type="button" class="dd-secondary-btn" data-v="review">Review Trade</button>
        <button type="button" class="dd-secondary-btn" data-v="dismiss">Dismiss</button>
      </div>
    </div>`;
  }
  if (component === 'action_plan') {
    return `<div class="agc-component" data-component="action_plan">
      <div class="agc-component-label">${escapeHtml(data.title || 'If–Then Rule')}</div>
      <ul class="agc-plan-list">${(data.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      <button type="button" class="dd-primary-btn" data-v="save">Save to My Playbook</button>
    </div>`;
  }
  return '';
}

/* ── Tool-result cards ────────────────────────────────────────────── */

function renderPatternCard(pattern, helpers) {
  const strength = EVIDENCE_STRENGTH_LABELS[pattern.evidenceStrength] || pattern.evidenceStrength;
  const range = pattern.evidenceWindow ? `${pattern.evidenceWindow.from || ''} – ${pattern.evidenceWindow.to || ''}` : '';
  return `<div class="agc-card agc-pattern-card">
    <div class="agc-card-eyebrow">Pattern detected</div>
    <div class="agc-card-title">${escapeHtml((pattern.patternType || '').replace(/_/g, ' '))}</div>
    <div class="agc-pattern-meta">Evidence reviewed: ${pattern.evidenceCount} record${pattern.evidenceCount === 1 ? '' : 's'}${range ? ` · ${range}` : ''}</div>
    <div class="agc-strength-pill agc-strength-${pattern.evidenceStrength}">${strength}</div>
    <p class="agc-observed">${escapeHtml(pattern.observedFacts)}</p>
    <p class="agc-inference"><em>Possible interpretation:</em> ${escapeHtml(pattern.possibleInterpretation)}</p>
    <div class="agc-card-actions">
      <button type="button" class="dd-secondary-btn" data-pattern-action="accurate">This feels accurate</button>
      <button type="button" class="dd-secondary-btn" data-pattern-action="not_accurate">Not accurate</button>
      <button type="button" class="dd-secondary-btn" data-pattern-action="build_rule">Build a Post-Loss Rule</button>
    </div>
  </div>`;
}

function renderDataCard(result) {
  const labels = { trades: 'Trades', checklists: 'Checklists', trade_comparison: 'Trade Comparison', rule_adherence: 'Rule Adherence', emotions: 'Emotions', prior_sessions: 'Prior Sessions', playbook: 'Playbook', academy_progress: 'Academy Progress' };
  return `<div class="agc-card agc-data-card">
    <div class="agc-card-eyebrow">${labels[result.dataType] || 'Data reviewed'}</div>
    <div class="agc-card-body">
      ${result.tradeCount != null ? `<div>${result.tradeCount} trade${result.tradeCount === 1 ? '' : 's'} reviewed</div>` : ''}
      ${result.metrics ? `<div class="agc-metrics-grid">${Object.entries(result.metrics).filter(([, v]) => v != null && typeof v !== 'object').map(([k, v]) => `<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`).join('')}</div>` : ''}
      ${result.topEmotions ? result.topEmotions.map((e) => `<div>${escapeHtml(e.emotion)} × ${e.count}</div>`).join('') : ''}
    </div>
  </div>`;
}

function renderWritePreviewCard(result, helpers) {
  const p = result.previewPayload;
  return `<div class="agc-card agc-preview-card" data-action-id="${result.actionId}">
    <div class="agc-card-eyebrow">Proposed — nothing saved yet</div>
    <div class="agc-card-title">${escapeHtml(p.title || p.focusTitle || 'Proposed update')}</div>
    <p class="agc-card-body">${escapeHtml(p.content || p.focusBody || p.memoryContent || '')}</p>
    <div class="agc-card-actions">
      <button type="button" class="dd-primary-btn" data-approve="true">Add to Dashboard</button>
      <button type="button" class="dd-secondary-btn" data-approve="false">Not Now</button>
    </div>
  </div>`;
}

const LAUNCH_LABELS = {
  scenario_lab: 'Practice this in the Scenario Lab', cooldown_timer: 'Start a Cooldown Timer',
  post_loss_reset: 'Start the Post-Loss Reset', pre_trade_check: 'Start the Pre-Trade Mental Check',
};

function renderLaunchCard(result) {
  return `<div class="agc-card agc-launch-card">
    <button type="button" class="dd-primary-btn" data-launch="${result.launchType}" data-scenario-id="${result.scenarioId || ''}">${LAUNCH_LABELS[result.launchType] || 'Start'} →</button>
  </div>`;
}

function renderSourcesCard(result) {
  const items = [];
  if (result.lesson) items.push(`<a class="agc-source-chip" href="lessons.html">${escapeHtml(result.lesson.title)}</a>`);
  (result.concepts || []).forEach((c) => items.push(`<span class="agc-source-chip">${escapeHtml(c.title)}</span>`));
  if (result.dayliIcc) items.push('<span class="agc-source-chip">Dayli ICC Golden Rule</span>');
  if (!items.length) return '';
  return `<div class="agc-card agc-sources-card"><div class="agc-card-eyebrow">Based on</div>${items.join('')}</div>`;
}

function renderToolResultCard(result, helpers) {
  if (!result) return '';
  if (result.kind === 'pattern') return (result.patterns || []).map((p) => renderPatternCard(p, helpers)).join('');
  if (result.kind === 'no_pattern') return `<div class="agc-card agc-note-card">${EMPTY_STATES.insufficientEvidence}</div>`;
  if (result.kind === 'data') return renderDataCard(result);
  if (result.kind === 'write_preview') return renderWritePreviewCard(result, helpers);
  if (result.kind === 'launch') return renderLaunchCard(result);
  if (result.kind === 'sources') return renderSourcesCard(result);
  if (result.kind === 'interactive_component') return `<div class="agc-card">${renderStructuredComponent(result.component, result.data)}</div>`;
  if (result.kind === 'consent_needed') return `<div class="agc-card agc-note-card">I don't have access to that yet — you can enable it in <a href="psychology-consent.html">Privacy &amp; Settings</a>, or attach the specific record instead.</div>`;
  return '';
}

/* ── Message bubble ───────────────────────────────────────────────── */

function messageActionsHtml(isLastAssistant) {
  return `<div class="agc-msg-actions">
      <button type="button" class="agc-icon-btn" data-act="copy" aria-label="Copy response">⧉</button>
      <button type="button" class="agc-icon-btn" data-act="up" aria-label="Good response">👍</button>
      <button type="button" class="agc-icon-btn" data-act="down" aria-label="Poor response">👎</button>
      <button type="button" class="agc-icon-btn" data-act="save" aria-label="Save insight">✦ Save</button>
      ${isLastAssistant ? '<button type="button" class="agc-icon-btn" data-act="regenerate" aria-label="Regenerate response">↻</button>' : ''}
    </div>`;
}

function renderMessageBubble(msg, helpers, isLastAssistant) {
  const el = document.createElement('div');
  el.className = `agc-msg agc-msg-${msg.role}`;
  const attachmentsHtml = (msg.attachedRecordRefs || []).length
    ? `<div class="agc-attach-row">${msg.attachedRecordRefs.map((a) => `<span class="agc-attach-chip">${a.type}</span>`).join('')}</div>` : '';
  const cardsHtml = (msg.toolResults || []).map((r) => renderToolResultCard(r, helpers)).join('')
    + (msg.sources || []).map((s) => renderSourcesCard(s)).join('');
  const componentHtml = msg.structuredComponentData ? renderStructuredComponent(msg.structuredComponentData.component, msg.structuredComponentData, () => {}) : '';
  el.innerHTML = `
    ${attachmentsHtml}
    <div class="agc-msg-bubble">
      <div class="agc-msg-content">${renderRichText(msg.content)}</div>
      ${componentHtml}
      ${cardsHtml}
    </div>
    ${msg.role === 'assistant' ? messageActionsHtml(isLastAssistant) : ''}
  `;
  el._msg = msg; // read back directly on click — safer than positional DOM indexing now that free ephemeral bubbles (guided questions, concept cards) can sit between real messages
  return el;
}

/* ── Main workspace ───────────────────────────────────────────────── */

export function renderAgentWorkspace(container, helpers = {}) {
  const state = {
    conversationId: null, savePreference: 'save', responseMode: 'coach_me',
    messages: [], clientHistory: [], attachments: [], isStreaming: false, abortController: null,
    sidebarOpen: window.innerWidth > 900, focusMode: false, panel: null, guidedFlow: null,
  };

  container.innerHTML = `
    <div class="agc-workspace${state.focusMode ? ' agc-focus' : ''}" id="agcWorkspace">
      <aside class="agc-sidebar" id="agcSidebar">
        <button type="button" class="dd-primary-btn agc-new-btn" id="agcNewBtn">+ New Conversation</button>
        <label class="agc-onetime-toggle"><input type="checkbox" id="agcOneTime"> Don't save this session</label>
        <div class="agc-sidebar-list" id="agcConvoList"></div>
        <div class="agc-sidebar-section">
          <div class="agc-sidebar-heading">✦ Saved Insights</div>
          <div class="agc-sidebar-list agc-insights-list" id="agcInsightsList"></div>
        </div>
        <div class="agc-sidebar-foot">
          <button type="button" class="agc-sidebar-link" id="agcMemoryBtn">🧠 What I remember</button>
          <a class="agc-sidebar-link" href="psychology-consent.html">🔒 Privacy &amp; Settings</a>
          <a class="agc-sidebar-link" href="psychology-playbook.html">❦ My Playbook</a>
          <a class="agc-sidebar-link" href="psychology-history.html">Coaching Tools History</a>
          <button type="button" class="agc-sidebar-link" id="agcFocusBtn">🌙 Focus Mode</button>
        </div>
      </aside>
      <button type="button" class="agc-sidebar-toggle" id="agcSidebarToggle" aria-label="Toggle conversations">☰</button>
      <main class="agc-main">
        <div class="agc-thread" id="agcThread" aria-live="polite"></div>
        <div class="agc-composer" id="agcComposer"></div>
      </main>
      <div class="agc-panel-host" id="agcPanelHost" hidden></div>
    </div>
  `;

  const els = {
    workspace: container.querySelector('#agcWorkspace'),
    sidebar: container.querySelector('#agcSidebar'),
    convoList: container.querySelector('#agcConvoList'),
    thread: container.querySelector('#agcThread'),
    composer: container.querySelector('#agcComposer'),
    insightsList: container.querySelector('#agcInsightsList'),
    panelHost: container.querySelector('#agcPanelHost'),
  };

  /* ── Sidebar ── */
  async function loadSidebar() {
    try {
      const conversations = await agentService.listConversations();
      els.convoList.innerHTML = conversations.length
        ? conversations.map((c) => `
          <div class="agc-convo-row${c.id === state.conversationId ? ' active' : ''}" data-id="${c.id}">
            <button type="button" class="agc-convo-title">${escapeHtml(c.title || 'New conversation')}</button>
            <button type="button" class="agc-convo-menu" data-menu="${c.id}">⋯</button>
          </div>`).join('')
        : '<div class="agc-sidebar-empty">No saved conversations yet.</div>';
      els.convoList.querySelectorAll('.agc-convo-title').forEach((btn) => {
        btn.addEventListener('click', () => selectConversation(btn.closest('.agc-convo-row').dataset.id));
      });
      els.convoList.querySelectorAll('.agc-convo-menu').forEach((btn) => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); openConvoMenu(btn.dataset.menu); });
      });
    } catch (err) {
      console.error('Sidebar load error:', err);
    }
  }

  async function loadInsights() {
    try {
      const memories = await agentService.listMemory();
      const insights = memories.filter((m) => m.category === 'saved_insight');
      els.insightsList.innerHTML = insights.length
        ? insights.slice(0, 8).map((m) => `<div class="agc-sidebar-insight" title="${escapeHtml(m.content)}">${escapeHtml(m.content.slice(0, 60))}${m.content.length > 60 ? '…' : ''}</div>`).join('')
        : '<div class="agc-sidebar-empty">Nothing saved yet.</div>';
    } catch (err) {
      console.error('Insights load error:', err);
    }
  }

  function openConvoMenu(id) {
    const body = openModal(`
      <div class="dd-modal-eyebrow">Conversation</div>
      <button type="button" class="dd-secondary-btn" id="agcRenameBtn" style="width:100%;margin-bottom:8px;">Rename</button>
      <button type="button" class="dd-secondary-btn" id="agcDeleteBtn" style="width:100%;color:var(--pink);">Delete</button>
    `);
    body.querySelector('#agcRenameBtn').addEventListener('click', async () => {
      const title = window.prompt('Rename this conversation:');
      if (title) { await agentService.renameConversation(id, title); loadSidebar(); }
      closeModal();
    });
    body.querySelector('#agcDeleteBtn').addEventListener('click', async () => {
      if (window.confirm('Delete this conversation? This can’t be undone.')) {
        await agentService.deleteConversation(id);
        if (state.conversationId === id) startNewConversation();
        loadSidebar();
      }
      closeModal();
    });
  }

  async function selectConversation(id) {
    state.conversationId = id;
    state.clientHistory = [];
    try {
      state.messages = await agentService.listMessages(id);
      paintThread();
      loadSidebar();
    } catch (err) {
      console.error('Load conversation error:', err);
    }
  }

  function startNewConversation() {
    state.conversationId = null;
    state.messages = [];
    state.clientHistory = [];
    state.attachments = [];
    paintThread();
    loadSidebar();
  }

  /* ── Thread ── */
  function paintWelcome() {
    els.thread.innerHTML = `
      <div class="agc-welcome">
        <div class="agc-welcome-title">Meet the AGHF Agent</div>
        <div class="agc-welcome-description">${escapeHtml(DESCRIPTION)}</div>
        <div class="agc-welcome-prompt">What's happening with your trading right now?</div>
        <p class="agc-welcome-sub">${escapeHtml(SUPPORTING_COPY)}</p>
        <div class="agc-suggested-grid">${SUGGESTED_PROMPTS.slice(0, 6).map((p) => `<button type="button" class="agc-suggested-chip">${escapeHtml(p)}</button>`).join('')}</div>
      </div>`;
    els.thread.querySelectorAll('.agc-suggested-chip').forEach((btn) => {
      btn.addEventListener('click', () => { getTextarea().value = btn.textContent; getTextarea().focus(); });
    });
  }

  function paintThread() {
    if (!state.messages.length) return paintWelcome();
    els.thread.innerHTML = '';
    let lastAssistantIdx = -1;
    state.messages.forEach((m, i) => { if (m.role === 'assistant') lastAssistantIdx = i; });
    state.messages.forEach((m, i) => els.thread.appendChild(renderMessageBubble(m, helpers, i === lastAssistantIdx)));
    wireMessageActions();
    wireInteractiveComponentsIn(els.thread);
    els.thread.scrollTop = els.thread.scrollHeight;
  }

  function submitSyntheticMessage(text) {
    getTextarea().value = text;
    sendMessage();
  }

  function wireInteractiveComponent(el) {
    const component = el.dataset.component;
    if (!component || el._wired) return;
    el._wired = true;
    if (component === 'action_plan') {
      el.querySelector('[data-v="save"]')?.addEventListener('click', async (e) => {
        const data = JSON.parse(el.dataset.payload || '{}');
        e.target.disabled = true; e.target.textContent = 'Saved ✓';
        try {
          await savePlaybookItem({ category: 'if_then_rules', title: data.title || 'If–Then Rule', content: (data.steps || []).join('\n'), sourceType: 'session' });
          showDeskToast('Saved to your Playbook ✦');
        } catch (err) { console.error(err); }
      });
      return;
    }
    el.querySelectorAll('[data-v]').forEach((btn) => {
      btn.addEventListener('click', () => {
        el.querySelectorAll('[data-v]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const v = btn.dataset.v;
        const text = component === 'belief_check' ? `[Belief Check] I'd rate that ${v}/5 right now.`
          : component === 'evidence_comparison' ? (v === 'explore' ? "Let's explore that." : v === 'review' ? 'Show me that trade.' : 'Dismiss that for now.')
          : `[${component === 'urge_check' ? 'Urge Check' : 'Execution Check'}] ${v}`;
        submitSyntheticMessage(text);
      });
    });
  }

  function wireInteractiveComponentsIn(root) {
    root.querySelectorAll('.agc-component[data-component]').forEach((el) => {
      if (el.dataset.component === 'action_plan' && !el.dataset.payload) {
        // stash the payload used at insert time so the save handler can read it back
        const label = el.querySelector('.agc-component-label')?.textContent || '';
        const steps = Array.from(el.querySelectorAll('.agc-plan-list li')).map((li) => li.textContent);
        el.dataset.payload = JSON.stringify({ title: label, steps });
      }
      wireInteractiveComponent(el);
    });
  }

  function wireMessageActions() {
    els.thread.querySelectorAll('.agc-msg-actions [data-act]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const bubble = btn.closest('.agc-msg');
        const msg = bubble._msg;
        if (!msg) return;
        if (btn.dataset.act === 'copy') {
          navigator.clipboard?.writeText(msg.content).then(() => showDeskToast('Copied ✦'));
        } else if (btn.dataset.act === 'up' || btn.dataset.act === 'down') {
          if (msg.id) await agentService.setMessageFeedback(msg.id, btn.dataset.act);
          showDeskToast('Thanks for the feedback');
        } else if (btn.dataset.act === 'save') {
          btn.disabled = true;
          try {
            await agentService.saveInsight(msg.content, state.conversationId);
            btn.textContent = '✓ Saved';
            showDeskToast('Saved as an insight ✦');
            loadInsights();
          } catch (err) {
            console.error('Save insight error:', err);
            btn.disabled = false;
            showDeskToast('Couldn’t save that insight.');
          }
        } else if (btn.dataset.act === 'regenerate') {
          regenerateLastResponse();
        }
      });
    });
    els.thread.querySelectorAll('.agc-pattern-card [data-pattern-action]').forEach((btn) => {
      btn.addEventListener('click', () => showDeskToast('Noted — thank you for confirming.'));
    });
    els.thread.querySelectorAll('.agc-preview-card [data-approve]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.agc-preview-card');
        const approve = btn.dataset.approve === 'true';
        try {
          await agentService.decideAction(card.dataset.actionId, approve);
          card.innerHTML = `<div class="agc-card-eyebrow">${approve ? 'Added to your dashboard ✦' : 'Not saved'}</div>`;
        } catch (err) { console.error(err); }
      });
    });
    els.thread.querySelectorAll('.agc-launch-card [data-launch]').forEach((btn) => {
      btn.addEventListener('click', () => openLaunchPanel(btn.dataset.launch, btn.dataset.scenarioId));
    });
  }

  /* ── Contextual tool launch (slide-over reusing psychology-engine.js) ── */
  function openLaunchPanel(launchType, scenarioId) {
    els.panelHost.hidden = false;
    els.panelHost.innerHTML = `<div class="agc-panel"><button type="button" class="agc-panel-close" id="agcPanelClose">✕</button><div class="agc-panel-body" id="agcPanelBody"></div></div>`;
    els.panelHost.querySelector('#agcPanelClose').addEventListener('click', closePanel);
    const body = els.panelHost.querySelector('#agcPanelBody');
    if (launchType === 'cooldown_timer') {
      renderCooldownTimer(body, { walkAwayRule: 'Pressure is not confirmation.', onDone: closePanel });
    } else if (launchType === 'pre_trade_check') {
      renderPreTradeCheck(body, { onComplete: async () => { showDeskToast('Saved ✦'); closePanel(); } });
    } else if (launchType === 'post_loss_reset') {
      renderPostLossReset(body, { getLimits: async () => ({ reachedTradeLimit: false, reachedRiskLimit: false }), onComplete: async () => { showDeskToast('Saved ✦'); closePanel(); } });
    } else if (launchType === 'scenario_lab') {
      const scenario = getScenarioById(scenarioId) || PSYCHOLOGY_SCENARIOS[0];
      renderScenarioAttempt(body, scenario, { onComplete: async () => { showDeskToast('Saved ✦'); closePanel(); } });
    }
  }
  function closePanel() { els.panelHost.hidden = true; els.panelHost.innerHTML = ''; }

  /* ── Memory panel ── */
  function memoryRowHtml(m) {
    return `<div class="agc-memory-row${m.active === false ? ' agc-memory-inactive' : ''}" data-id="${m.id}">
      <div class="agc-memory-row-text" data-view>[${escapeHtml(m.category)}] ${escapeHtml(m.content)}</div>
      <textarea class="agc-memory-edit" hidden>${escapeHtml(m.content)}</textarea>
      <div class="agc-memory-row-actions">
        <button type="button" data-edit="${m.id}" title="Edit">✎</button>
        <button type="button" data-save-edit="${m.id}" hidden>Save</button>
        <button type="button" data-toggle-active="${m.id}" data-active="${m.active !== false}" title="${m.active === false ? 'Re-enable' : 'Disable without deleting'}">${m.active === false ? '◯ Off' : '● On'}</button>
        <button type="button" data-del="${m.id}" title="Remove">✕</button>
      </div>
    </div>`;
  }

  async function openMemoryPanel() {
    els.panelHost.hidden = false;
    els.panelHost.innerHTML = `<div class="agc-panel"><button type="button" class="agc-panel-close" id="agcPanelClose">✕</button><div class="agc-panel-body">
      <div class="agc-panel-title">✦ Saved Insights</div>
      <div id="agcInsightMemoryList">Loading…</div>
      <div class="agc-panel-title">What the AGHF Agent remembers about me</div>
      <div id="agcMemoryList">Loading…</div>
      <button type="button" class="dd-secondary-btn" id="agcClearMemory">Clear all memory</button>
    </div></div>`;
    els.panelHost.querySelector('#agcPanelClose').addEventListener('click', closePanel);
    els.panelHost.querySelector('#agcClearMemory').addEventListener('click', async () => {
      if (window.confirm('Clear everything the agent remembers about you, including saved insights?')) { await agentService.clearAllMemory(); openMemoryPanel(); loadInsights(); }
    });
    const memories = await agentService.listMemory({ includeInactive: true });
    const insights = memories.filter((m) => m.category === 'saved_insight');
    const remembered = memories.filter((m) => m.category !== 'saved_insight');

    const insightList = els.panelHost.querySelector('#agcInsightMemoryList');
    insightList.innerHTML = insights.length ? insights.map(memoryRowHtml).join('') : '<p class="agc-flow-sub">Nothing saved yet — use ✦ Save on a response.</p>';
    const list = els.panelHost.querySelector('#agcMemoryList');
    list.innerHTML = remembered.length ? remembered.map(memoryRowHtml).join('') : '<p class="agc-flow-sub">Nothing saved yet — approve a memory suggestion during a conversation, or it will show up here.</p>';

    [insightList, list].forEach((root) => wireMemoryRows(root));
  }

  function wireMemoryRows(root) {
    root.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', async () => {
      await agentService.deleteMemory(btn.dataset.del);
      openMemoryPanel(); loadInsights();
    }));
    root.querySelectorAll('[data-toggle-active]').forEach((btn) => btn.addEventListener('click', async () => {
      const row = btn.closest('.agc-memory-row');
      const nowActive = btn.dataset.active !== 'true';
      await agentService.saveMemory({ id: btn.dataset.toggleActive, active: nowActive });
      row.classList.toggle('agc-memory-inactive', !nowActive);
      btn.dataset.active = String(nowActive);
      btn.textContent = nowActive ? '● On' : '◯ Off';
      btn.title = nowActive ? 'Disable without deleting' : 'Re-enable';
    }));
    root.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
      const row = btn.closest('.agc-memory-row');
      row.querySelector('[data-view]').hidden = true;
      row.querySelector('.agc-memory-edit').hidden = false;
      btn.hidden = true;
      row.querySelector('[data-save-edit]').hidden = false;
    }));
    root.querySelectorAll('[data-save-edit]').forEach((btn) => btn.addEventListener('click', async () => {
      const row = btn.closest('.agc-memory-row');
      const content = row.querySelector('.agc-memory-edit').value.trim();
      if (!content) return;
      await agentService.saveMemory({ id: btn.dataset.saveEdit, content });
      openMemoryPanel(); loadInsights();
    }));
  }

  /* ── Composer ── */
  function paintComposer() {
    els.composer.innerHTML = `
      <div class="agc-attach-chips" id="agcAttachChips"></div>
      <div class="agc-mode-row">${RESPONSE_MODES.map((m) => `<button type="button" class="chip agc-mode-chip${m.key === state.responseMode ? ' active' : ''}" data-mode="${m.key}" title="${m.desc}">${m.label}</button>`).join('')}</div>
      <div class="agc-input-row">
        <button type="button" class="agc-icon-btn" id="agcAttachBtn" aria-label="Add attachment">📎</button>
        <button type="button" class="agc-icon-btn" id="agcMicBtn" aria-label="Voice input" hidden>🎙</button>
        <textarea class="agc-textarea" id="agcTextarea" rows="1" placeholder="What's happening with your trading right now?" aria-label="Message the AGHF Agent"></textarea>
        <button type="button" class="dd-primary-btn agc-send-btn" id="agcSendBtn">Send</button>
        <button type="button" class="dd-secondary-btn agc-stop-btn" id="agcStopBtn" hidden>Stop</button>
      </div>
      <div class="agc-attach-popover" id="agcAttachPopover" hidden></div>
    `;
    els.composer.querySelectorAll('[data-mode]').forEach((btn) => btn.addEventListener('click', () => {
      state.responseMode = btn.dataset.mode;
      els.composer.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b === btn));
    }));
    els.composer.querySelector('#agcSendBtn').addEventListener('click', sendMessage);
    els.composer.querySelector('#agcStopBtn').addEventListener('click', stopGenerating);
    els.composer.querySelector('#agcAttachBtn').addEventListener('click', toggleAttachPopover);
    getTextarea().addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    getTextarea().addEventListener('input', () => {
      const ta = getTextarea(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    });
    setupVoiceInput();
    paintAttachChips();
  }

  function getTextarea() { return els.composer.querySelector('#agcTextarea'); }

  function paintAttachChips() {
    const row = els.composer.querySelector('#agcAttachChips');
    if (!row) return;
    row.innerHTML = state.attachments.map((a, i) => a.type === 'screenshot'
      ? `<span class="agc-attach-chip agc-attach-chip-shot removable">
          <img class="agc-attach-thumb" src="${a.dataUrl}" alt="">
          ${a.uploading ? '<span class="agc-attach-uploading">Uploading…</span>' : ''}
          <button type="button" data-remove="${i}">✕</button>
        </span>`
      : `<span class="agc-attach-chip removable">${escapeHtml(a.label)} <button type="button" data-remove="${i}">✕</button></span>`
    ).join('');
    row.querySelectorAll('[data-remove]').forEach((btn) => btn.addEventListener('click', () => {
      state.attachments.splice(Number(btn.dataset.remove), 1);
      paintAttachChips();
    }));
  }

  function toggleAttachPopover() {
    const pop = els.composer.querySelector('#agcAttachPopover');
    if (!pop.hidden) { pop.hidden = true; return; }
    pop.hidden = false;
    pop.innerHTML = `<div class="agc-attach-actions">${ATTACHMENT_ACTIONS.map((a) => `<button type="button" class="agc-attach-action" data-attach-type="${a.key}">${a.icon} ${a.label}</button>`).join('')}</div><div id="agcAttachPicker"></div>`;
    pop.querySelectorAll('[data-attach-type]').forEach((btn) => btn.addEventListener('click', () => handleAttachAction(btn.dataset.attachType)));
  }

  async function handleAttachAction(type) {
    const picker = els.composer.querySelector('#agcAttachPicker');
    if (type === 'week') {
      state.attachments.push({ type: 'week', label: 'This Week' });
      paintAttachChips(); toggleAttachPopover(); return;
    }
    if (type === 'date_range') {
      picker.innerHTML = `<input type="date" id="agcFrom"> <input type="date" id="agcTo"> <button type="button" class="dd-secondary-btn" id="agcRangeGo">Add</button>`;
      picker.querySelector('#agcRangeGo').addEventListener('click', () => {
        const from = picker.querySelector('#agcFrom').value, to = picker.querySelector('#agcTo').value;
        if (!from || !to) return;
        state.attachments.push({ type: 'date_range', label: `${from} → ${to}`, metadata: { from, to } });
        paintAttachChips(); toggleAttachPopover();
      });
      return;
    }
    if (type === 'screenshot') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp,image/gif';
      input.addEventListener('change', () => handleScreenshotFile(input.files[0]));
      input.click();
      toggleAttachPopover();
      return;
    }
    if (type === 'trade') {
      const { entries } = await listEntries({ entryType: 'trade', limit: 8 });
      renderPickList(picker, entries, {
        attachType: 'trade', getId: (t) => t.id, getLabel: (t) => `Trade ${t.tradeDate}`,
        rowText: (t) => `${t.tradeDate} · ${t.instrument || ''} · ${t.direction || ''}`,
        emptyText: 'No trades logged yet.', excludeFn: setExcludedFromAgent,
      });
      return;
    }
    if (type === 'journal') {
      const { entries } = await listEntries({ limit: 20 });
      const reflections = entries.filter((e) => e.entryType !== 'trade').slice(0, 8);
      renderPickList(picker, reflections, {
        attachType: 'journal', getId: (j) => j.id, getLabel: (j) => `Journal ${j.tradeDate}`,
        rowText: (j) => `${j.tradeDate} · ${j.entryType}`,
        emptyText: 'No journal reflections yet.', excludeFn: setExcludedFromAgent,
      });
      return;
    }
    if (type === 'checklist') {
      const checklists = await listChecklists(8);
      renderPickList(picker, checklists, {
        attachType: 'checklist', getId: (c) => c.id, getLabel: (c) => `Checklist ${c.tradingDate}`,
        rowText: (c) => `${c.tradingDate} · ${c.completionPct}% complete`,
        emptyText: 'No checklists yet.', excludeFn: setChecklistExcludedFromAgent,
      });
    }
  }

  /**
   * Shared multi-select record picker for the trade/journal/checklist
   * attach actions — a checkbox per row + one "Add" confirm, replacing
   * the old close-on-first-pick single-select so several records can be
   * attached in one pass. Each row also carries a small "exclude from
   * AGHF Agent" toggle (a member-set opt-out distinct from the coarser
   * category-level consent settings) that persists immediately via the
   * given `excludeFn`, independent of whether the row is attached.
   */
  function renderPickList(picker, items, { attachType, getId, getLabel, rowText, emptyText, excludeFn }) {
    if (!items.length) { picker.innerHTML = `<div class="agc-flow-sub">${emptyText}</div>`; return; }
    picker.innerHTML = `<div class="agc-pick-list">${items.map((item) => `
      <div class="agc-pick-row" data-id="${getId(item)}">
        <label><input type="checkbox"> ${escapeHtml(rowText(item))}</label>
        <button type="button" class="agc-pick-exclude" data-exclude title="Exclude this record from AGHF Agent analysis">🚫 <span class="agc-pick-exclude-label">Exclude</span></button>
      </div>`).join('')}</div>
      <button type="button" class="dd-secondary-btn" id="agcPickConfirm" disabled>Add</button>`;

    const selected = new Set();
    const confirmBtn = picker.querySelector('#agcPickConfirm');
    picker.querySelectorAll('.agc-pick-row').forEach((row) => {
      const id = row.dataset.id;
      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) selected.add(id); else selected.delete(id);
        confirmBtn.disabled = selected.size === 0;
      });
      row.querySelector('[data-exclude]').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
          await excludeFn(id, true);
          row.classList.add('agc-pick-excluded');
          btn.querySelector('.agc-pick-exclude-label').textContent = 'Excluded';
          checkbox.checked = false; checkbox.disabled = true;
          selected.delete(id);
          confirmBtn.disabled = selected.size === 0;
          showDeskToast('Excluded from AGHF Agent analysis');
        } catch (err) {
          console.error('Exclude-from-agent error:', err);
          btn.disabled = false;
        }
      });
    });
    confirmBtn.addEventListener('click', () => {
      selected.forEach((id) => {
        const item = items.find((x) => String(getId(x)) === id);
        if (item) state.attachments.push({ type: attachType, id: getId(item), label: getLabel(item) });
      });
      paintAttachChips();
      toggleAttachPopover();
    });
  }

  function handleScreenshotFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showDeskToast('That image is over 5MB — try a smaller one.'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const chipIndex = state.attachments.push({ type: 'screenshot', label: `📷 ${file.name}`, dataUrl, uploading: true }) - 1;
      paintAttachChips();
      try {
        const uploaded = await agentService.uploadScreenshot(dataUrl, file.name, state.conversationId);
        state.attachments[chipIndex].metadata = { path: uploaded.path };
        state.attachments[chipIndex].uploading = false;
        paintAttachChips();
        showDeskToast(`${IMAGE_CAVEAT}`);
      } catch (err) {
        console.error('Screenshot upload error:', err);
        state.attachments.splice(chipIndex, 1);
        paintAttachChips();
        showDeskToast('Couldn’t upload that screenshot.');
      }
    };
    reader.readAsDataURL(file);
  }

  function setupVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = els.composer.querySelector('#agcMicBtn');
    if (!SpeechRecognition) return; // feature-detected: hidden, not disabled, when unsupported
    micBtn.hidden = false;
    let recognizing = false;
    let recognizer = null;
    micBtn.addEventListener('click', () => {
      if (recognizing) { recognizer?.stop(); return; }
      if (!window._agcVoiceDisclosed) { showDeskToast(VOICE_DISCLOSURE); window._agcVoiceDisclosed = true; }
      recognizer = new SpeechRecognition();
      recognizer.lang = 'en-US'; recognizer.interimResults = false;
      recognizer.onstart = () => { recognizing = true; micBtn.classList.add('active'); };
      recognizer.onend = () => { recognizing = false; micBtn.classList.remove('active'); };
      recognizer.onresult = (e) => { getTextarea().value += (getTextarea().value ? ' ' : '') + e.results[0][0].transcript; };
      recognizer.start();
    });
  }

  /* ── Sending + streaming ──────────────────────────────────────────
   * Cost design: sendMessage() never calls the AI directly. It first
   * runs the free classifyIntent() check. A matched trigger runs an
   * entirely free, client-side guided Q&A (reusing the same rules engine
   * Talk Me Through already uses) and only makes ONE model call at the
   * very end, to synthesize on top of the already-computed rules-based
   * result. A matched concept shows the free knowledge-library answer
   * immediately, with an opt-in button for the one AI call that connects
   * it to her own trading. Only a genuinely unmatched ("open") question
   * calls the model right away — and still only once, since agent-chat.js
   * no longer runs a multi-turn tool loop. */
  async function sendMessage() {
    const ta = getTextarea();
    const text = ta.value.trim();
    if (!text || state.isStreaming || state.guidedFlow) return;

    const attachmentsForSend = state.attachments.map(({ dataUrl, uploading, label, ...rest }) => rest);
    const userMsg = { role: 'user', content: text, attachedRecordRefs: attachmentsForSend };
    state.messages.push(userMsg);
    state.clientHistory.push({ role: 'user', content: text });
    if (!els.thread.querySelector('.agc-msg')) paintThread(); else els.thread.appendChild(renderMessageBubble(userMsg, helpers));
    els.thread.scrollTop = els.thread.scrollHeight;

    ta.value = ''; ta.style.height = 'auto';
    const sentAttachments = state.attachments.slice();
    state.attachments = []; paintAttachChips();

    // Attachments or an explicit non-Coach-Me mode mean the member wants
    // real analysis/action, not a scripted trigger match — go straight
    // to the single AI call so attachments/mode are actually honored.
    if (sentAttachments.length || state.responseMode !== 'coach_me') {
      return runSingleAICall(text, sentAttachments, null);
    }

    const intent = classifyIntent(text);
    if (intent.type === 'talk_trigger') return startGuidedFlowInChat(intent, text);
    if (intent.type === 'concept') return appendConceptCard(intent.entry, text);
    return runSingleAICall(text, sentAttachments, null);
  }

  /* ── Free guided flow, rendered directly in the chat thread ── */
  function startGuidedFlowInChat(intent, originalText) {
    const trigger = TALK_TRIGGERS.find((t) => t.key === intent.key);
    state.guidedFlow = { trigger, qIndex: 0, answers: {}, originalText };
    askNextGuidedQuestion();
  }

  function askNextGuidedQuestion() {
    const flow = state.guidedFlow;
    const qId = flow.trigger.questions[flow.qIndex];
    const q = QUESTION_BANK[qId];
    const options = q.type === 'yesno' ? [{ key: true, label: 'Yes' }, { key: false, label: 'No' }] : q.options;

    const el = document.createElement('div');
    el.className = 'agc-msg agc-msg-assistant';
    el.dataset.free = 'true'; // marks a zero-AI-call bubble — see verify_cost_redesign.js
    el.innerHTML = `<div class="agc-msg-bubble">
      <div class="agc-tool-status">Free guided check-in — no AI used yet</div>
      <div class="agc-msg-content"><p>${escapeHtml(q.prompt)}</p></div>
      <div class="chip-group agc-guided-options">${options.map((o) => `<button type="button" class="chip" data-v="${String(o.key)}">${escapeHtml(o.label)}</button>`).join('')}</div>
    </div>`;
    els.thread.appendChild(el);
    els.thread.scrollTop = els.thread.scrollHeight;

    el.querySelectorAll('.agc-guided-options .chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        el.querySelectorAll('.chip').forEach((b) => b.disabled = true);
        btn.classList.add('active');
        const raw = btn.dataset.v;
        flow.answers[qId] = raw === 'true' ? true : raw === 'false' ? false : raw;
        flow.qIndex += 1;
        if (flow.qIndex < flow.trigger.questions.length) askNextGuidedQuestion();
        else finishGuidedFlow();
      });
    });
  }

  function finishGuidedFlow() {
    const flow = state.guidedFlow;
    const result = resolveTalkMeThrough(flow.answers);

    const el = document.createElement('div');
    el.className = 'agc-msg agc-msg-assistant';
    el.dataset.free = 'true';
    el.innerHTML = `<div class="agc-msg-bubble agc-note-good">
      <div class="agc-card-eyebrow">✦ Based on your saved rules — no AI needed for this part</div>
      <div class="agc-msg-content"><p><strong>${escapeHtml(result.actionLabel)}</strong></p><p>${escapeHtml(result.message)}</p></div>
    </div>`;
    els.thread.appendChild(el);
    els.thread.scrollTop = els.thread.scrollHeight;

    const answerLines = flow.trigger.questions.map((qId) => `${QUESTION_BANK[qId].prompt} → ${flow.answers[qId]}`).join('; ');
    const guidedSummary = `Trigger: "${flow.trigger.label}". Answers: ${answerLines}. Rules-based result: ${result.actionLabel} — ${result.message}`;

    state.guidedFlow = null;
    runSingleAICall(flow.originalText, [], guidedSummary);
  }

  /* ── Free concept answer, with an opt-in single AI call to personalize ── */
  function appendConceptCard(entry, originalText) {
    const el = document.createElement('div');
    el.className = 'agc-msg agc-msg-assistant';
    el.dataset.free = 'true';
    el.innerHTML = `<div class="agc-msg-bubble">
      <div class="agc-card-eyebrow">From the AGHF knowledge library — no AI used yet</div>
      <div class="agc-msg-content"><p><strong>${escapeHtml(entry.title)}</strong></p><p>${escapeHtml(entry.content)}</p></div>
      <button type="button" class="dd-secondary-btn" id="agcConnectBtn">Connect this to my trading →</button>
    </div>`;
    els.thread.appendChild(el);
    els.thread.scrollTop = els.thread.scrollHeight;
    el.querySelector('#agcConnectBtn').addEventListener('click', (e) => {
      e.target.remove();
      runSingleAICall(originalText, [], `Concept already explained for free from the knowledge library: "${entry.title}" — ${entry.content}. Connect this specifically to what she described, don't re-explain the concept from scratch.`);
    });
  }

  /* ── The one place that actually calls the model — at most once per invocation ── */
  async function runSingleAICall(text, sentAttachments, guidedSummary) {
    state.isStreaming = true;
    els.composer.querySelector('#agcSendBtn').hidden = true;
    els.composer.querySelector('#agcStopBtn').hidden = false;
    els.thread.querySelectorAll('[data-act="regenerate"]').forEach((b) => b.remove());

    const assistantEl = document.createElement('div');
    assistantEl.className = 'agc-msg agc-msg-assistant';
    assistantEl.innerHTML = `<div class="agc-msg-bubble"><div class="agc-thinking"><span></span><span></span><span></span></div><div class="agc-msg-content"></div><div class="agc-cards"></div></div>`;
    els.thread.appendChild(assistantEl);
    els.thread.scrollTop = els.thread.scrollHeight;
    const contentEl = assistantEl.querySelector('.agc-msg-content');
    const cardsEl = assistantEl.querySelector('.agc-cards');
    const thinkingEl = assistantEl.querySelector('.agc-thinking');
    let fullText = '';
    const toolResults = [];

    state.abortController = new AbortController();
    try {
      await agentService.streamChat({
        conversationId: state.conversationId, savePreference: state.savePreference,
        responseMode: state.responseMode, message: text, attachments: sentAttachments || [], guidedSummary,
        clientHistory: state.savePreference === 'one_time' ? state.clientHistory.slice(0, -1) : undefined,
      }, (event) => {
        if (event.type === 'message_start' && event.conversationId && event.conversationId !== 'demo') {
          if (!state.conversationId) { state.conversationId = event.conversationId; loadSidebar(); }
        }
        if (event.type === 'unavailable') {
          thinkingEl.remove();
          contentEl.innerHTML = renderRichText(EMPTY_STATES.aiUnavailable);
        }
        if (event.type === 'safety_block') { thinkingEl.remove(); }
        if (event.type === 'text_delta') {
          thinkingEl.remove();
          fullText += event.text;
          contentEl.innerHTML = renderRichText(fullText);
          els.thread.scrollTop = els.thread.scrollHeight;
        }
        if (event.type === 'tool_use') {
          if (!assistantEl.querySelector('.agc-tool-status')) {
            const status = document.createElement('div');
            status.className = 'agc-tool-status';
            assistantEl.querySelector('.agc-msg-bubble').insertBefore(status, cardsEl);
          }
          assistantEl.querySelector('.agc-tool-status').textContent = `Looking at ${event.toolName.replace(/_/g, ' ')}…`;
        }
        if (event.type === 'tool_result') {
          toolResults.push(event.result);
          cardsEl.insertAdjacentHTML('beforeend', renderToolResultCard(event.result, helpers));
          wireCardsIn(cardsEl);
        }
        if (event.type === 'suggested_followups' && event.followups?.length) {
          cardsEl.insertAdjacentHTML('beforeend', `<div class="agc-followups">${event.followups.map((f) => `<button type="button" class="agc-suggested-chip">${escapeHtml(f)}</button>`).join('')}</div>`);
          cardsEl.querySelectorAll('.agc-followups:last-child .agc-suggested-chip').forEach((btn) => {
            btn.addEventListener('click', () => submitSyntheticMessage(btn.textContent));
          });
        }
        if (event.type === 'rate_limited') { thinkingEl.remove(); }
        if (event.type === 'error') {
          thinkingEl.remove();
          contentEl.innerHTML += `<p class="agc-error-text">${escapeHtml(event.message)}</p>`;
        }
        if (event.type === 'done') {
          const statusEl = assistantEl.querySelector('.agc-tool-status');
          if (statusEl) statusEl.remove();
        }
      }, { signal: state.abortController.signal });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Chat stream error:', err);
    }

    const assistantMsg = { role: 'assistant', content: fullText, toolResults, id: null };
    assistantEl._msg = assistantMsg;
    state.messages.push(assistantMsg);
    state.clientHistory.push({ role: 'assistant', content: fullText });
    assistantEl.querySelector('.agc-msg-content').outerHTML = `<div class="agc-msg-content">${renderRichText(fullText)}</div>`;
    if (fullText) {
      assistantEl.insertAdjacentHTML('beforeend', messageActionsHtml(true));
      wireMessageActions();
    }

    state.isStreaming = false;
    els.composer.querySelector('#agcSendBtn').hidden = false;
    els.composer.querySelector('#agcStopBtn').hidden = true;
  }

  function wireCardsIn(cardsEl) {
    wireInteractiveComponentsIn(cardsEl);
    cardsEl.querySelectorAll('.agc-launch-card [data-launch]').forEach((btn) => {
      if (btn._wired) return; btn._wired = true;
      btn.addEventListener('click', () => openLaunchPanel(btn.dataset.launch, btn.dataset.scenarioId));
    });
    cardsEl.querySelectorAll('.agc-preview-card [data-approve]').forEach((btn) => {
      if (btn._wired) return; btn._wired = true;
      btn.addEventListener('click', async () => {
        const card = btn.closest('.agc-preview-card');
        const approve = btn.dataset.approve === 'true';
        await agentService.decideAction(card.dataset.actionId, approve);
        card.innerHTML = `<div class="agc-card-eyebrow">${approve ? 'Added to your dashboard ✦' : 'Not saved'}</div>`;
      });
    });
  }

  /**
   * Drops the last assistant reply and asks the same preceding question
   * again. Calls runSingleAICall directly (not sendMessage) so the
   * member's question isn't duplicated in the thread — only the answer
   * changes. Known limitation for SAVED conversations: the original
   * reply and this turn's user message were already persisted
   * server-side by the first call, so the model's next-turn history
   * (fetched fresh from agent_messages) still includes the old reply
   * and a regenerate adds one extra duplicate user row — an accepted
   * trade-off rather than adding a new delete-then-resend endpoint.
   */
  function regenerateLastResponse() {
    if (state.isStreaming || state.guidedFlow) return;
    const lastAssistant = state.messages[state.messages.length - 1];
    const lastUser = state.messages[state.messages.length - 2];
    if (!lastAssistant || lastAssistant.role !== 'assistant' || !lastUser || lastUser.role !== 'user') return;
    state.messages.pop();
    state.clientHistory.pop();
    const bubbles = els.thread.querySelectorAll('.agc-msg');
    bubbles[bubbles.length - 1]?.remove();
    runSingleAICall(lastUser.content, [], null);
  }

  function stopGenerating() {
    state.abortController?.abort();
    state.isStreaming = false;
    els.composer.querySelector('#agcSendBtn').hidden = false;
    els.composer.querySelector('#agcStopBtn').hidden = true;
  }

  /* ── Chrome: sidebar toggle, focus mode, memory ── */
  container.querySelector('#agcSidebarToggle').addEventListener('click', () => {
    state.sidebarOpen = !state.sidebarOpen;
    els.sidebar.classList.toggle('open', state.sidebarOpen);
  });
  container.querySelector('#agcNewBtn').addEventListener('click', startNewConversation);
  container.querySelector('#agcOneTime').addEventListener('change', (e) => { state.savePreference = e.target.checked ? 'one_time' : 'save'; });
  container.querySelector('#agcMemoryBtn').addEventListener('click', openMemoryPanel);
  container.querySelector('#agcFocusBtn').addEventListener('click', () => {
    state.focusMode = !state.focusMode;
    els.workspace.classList.toggle('agc-focus', state.focusMode);
  });

  els.sidebar.classList.toggle('open', state.sidebarOpen);
  paintComposer();
  paintThread();
  loadSidebar();
  loadInsights();

  return { getState: () => state };
}
