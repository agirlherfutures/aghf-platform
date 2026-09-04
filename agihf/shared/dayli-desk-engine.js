/**
 * dayli-desk-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Dayli Desk dashboard: one function per card,
 * `(container, data, helpers?) => void`, mirroring the pattern already
 * proven in loop-engine.js (per-stage render functions importing shared
 * primitives rather than duplicating them). This file is presentation
 * only — every card's data comes from the service files
 * (market-outlook-service.js, trades-service.js, etc.); nothing here
 * touches localStorage or fetch directly except the small toast/modal
 * DOM helpers.
 */

import { METHOD_QUALITY_LABELS, BIAS_LABELS, STRUCTURE_LABELS, PHASE_LABELS } from './dashboard-models.js';

/* ── Small shared DOM helpers ───────────────────────────────────── */

export function showDeskToast(title) {
  let el = document.getElementById('ddToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ddToast';
    el.className = 'dd-toast';
    document.body.appendChild(el);
  }
  el.textContent = title;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function ensureModalHost() {
  let overlay = document.getElementById('ddModalOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'ddModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-card"><button type="button" class="modal-close" id="ddModalClose">✕</button><div class="modal-step visible" id="ddModalBody"></div></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  overlay.querySelector('#ddModalClose').addEventListener('click', closeModal);
  return overlay;
}

let modalGen = 0;

/** @param {string} bodyHtml */
export function openModal(bodyHtml) {
  modalGen += 1;
  const overlay = ensureModalHost();
  overlay.querySelector('#ddModalBody').innerHTML = bodyHtml;
  overlay.classList.add('open');
  return overlay.querySelector('#ddModalBody');
}

export function closeModal() {
  const overlay = document.getElementById('ddModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

/**
 * Auto-close after `delay`ms, but only if no other modal has opened in
 * the meantime — otherwise a delayed close from an earlier modal (e.g.
 * the journal composer's "saved, closing shortly") could incorrectly
 * dismiss a different modal the user opened right after.
 */
function closeModalAfter(delay) {
  const gen = modalGen;
  setTimeout(() => { if (modalGen === gen) closeModal(); }, delay);
}

/* ── Market session (ET-based, approximate — educational display only) ── */

/** @returns {{key: string, label: string}} */
export function getMarketSession(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false, weekday: 'short',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const weekday = get('weekday');
  const totalMin = hour * 60 + minute;
  if (weekday === 'Sat' || weekday === 'Sun') return { key: 'closed', label: 'Market Closed' };
  if (totalMin >= 4 * 60 && totalMin < 9 * 60 + 30) return { key: 'pre', label: 'Pre-Market' };
  if (totalMin >= 9 * 60 + 30 && totalMin < 12 * 60) return { key: 'ny', label: 'NY Session' };
  if (totalMin >= 12 * 60 && totalMin < 14 * 60) return { key: 'mid', label: 'Midday' };
  if (totalMin >= 14 * 60 && totalMin < 20 * 60) return { key: 'after', label: 'After Hours' };
  return { key: 'closed', label: 'Market Closed' };
}

export function renderSessionBadge(container) {
  const s = getMarketSession();
  container.innerHTML = `<span class="dd-session-badge dd-session-${s.key}"><span class="dot"></span>${s.label}</span>`;
}

/* ── Market Outlook ─────────────────────────────────────────────── */

function biasBadgeClass(v) {
  if (v === 'bullish') return 'dd-badge-bull';
  if (v === 'bearish') return 'dd-badge-bear';
  if (v === 'neutral' || v === 'mixed') return 'dd-badge-neutral';
  return 'dd-badge-muted';
}

/** @param {import('./dashboard-models.js').MarketOutlookInstrument[]} instruments */
export function renderMarketOutlookCard(container, instruments) {
  if (!instruments || !instruments.length) {
    container.innerHTML = `<div class="dd-card dd-empty"><div class="dd-empty-icon">📡</div><div class="dd-empty-text">Market outlook connection coming soon.</div></div>`;
    return;
  }
  container.innerHTML = `<div class="dd-outlook-grid">${instruments.map((m) => `
    <div class="dd-outlook-card">
      <div class="dd-outlook-top">
        <div><div class="dd-outlook-symbol">${m.symbol}</div><div class="dd-outlook-label">${m.label}</div></div>
        ${m.isDemo ? '<span class="dd-demo-tag">Demo Data</span>' : ''}
      </div>
      <div class="dd-outlook-rows">
        <div class="dd-outlook-row"><span class="dd-outlook-row-label">4H Bias</span><span class="dd-badge ${biasBadgeClass(m.bias4h)}">${BIAS_LABELS[m.bias4h] || m.bias4h}</span></div>
        <div class="dd-outlook-row"><span class="dd-outlook-row-label">1H Structure</span><span class="dd-badge ${biasBadgeClass(m.structure1h)}">${STRUCTURE_LABELS[m.structure1h] || m.structure1h}</span></div>
        <div class="dd-outlook-row"><span class="dd-outlook-row-label">ICC Phase</span><span class="dd-badge dd-badge-muted">${PHASE_LABELS[m.phase] || m.phase}</span></div>
        <div class="dd-outlook-row"><span class="dd-outlook-row-label">Nearest PIL</span><span>${m.nearestPIL}</span></div>
      </div>
      <div class="dd-outlook-context">${m.checkpoint15m}<br>${m.consolidationStatus}</div>
      <div class="dd-outlook-updated">Last updated ${new Date(m.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${m.isDemo ? ' · sample data, not a live feed' : ''}</div>
    </div>`).join('')}</div>`;
}

/* ── Economic Calendar ──────────────────────────────────────────── */

/** @param {import('./dashboard-models.js').EconomicEvent[]} events */
export function renderEconomicCalendarCard(container, events) {
  if (!events || !events.length) {
    container.innerHTML = `<div class="dd-empty"><div class="dd-empty-icon">🗞️</div><div class="dd-empty-text">No high-impact events today.</div></div>`;
    return;
  }
  container.innerHTML = events.map((e) => {
    const countdown = e.minutesUntil > 0
      ? `Starts in ${e.minutesUntil < 60 ? e.minutesUntil + ' min' : Math.round(e.minutesUntil / 60) + ' hr'}`
      : (e.minutesUntil > -30 ? 'Just released' : 'Already released');
    return `<div class="dd-calendar-row">
      <div class="dd-calendar-time">${e.time}</div>
      <div class="dd-calendar-mid">
        <div class="dd-calendar-event">${e.event} <span style="color:var(--muted);font-weight:500;">· ${e.currency}</span></div>
        <div class="dd-calendar-sub">${e.marketsAffected.join(', ')}${e.isDemo ? ' · Demo Data' : ''}</div>
        <div class="dd-calendar-countdown">${countdown}</div>
      </div>
      <span class="dd-impact dd-impact-${e.impact}">${e.impact}</span>
    </div>`;
  }).join('');
}

/* ── Trading Snapshot ───────────────────────────────────────────── */

let snapshotPrivate = localStorage.getItem('aghf_snapshot_private') === '1';

function fmtPnl(n) {
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}$${Math.abs(Math.round(n))}`;
}

/**
 * @param {ReturnType<import('./trades-service.js').getTodaysSnapshot>} snapshot
 * @param {{ tradeTrackerHref: string }} opts
 */
export function renderTradingSnapshot(container, snapshot, opts) {
  if (!snapshot.tradeCount) {
    container.innerHTML = `
      <div class="dd-empty">
        <div class="dd-empty-icon">📓</div>
        <div class="dd-empty-text">No trades logged today.</div>
        <div class="dd-snapshot-actions" style="justify-content:center;">
          <a class="dd-secondary-btn" href="${opts.tradeTrackerHref}">Log a Trade</a>
          <a class="dd-secondary-btn" href="${opts.tradeTrackerHref}#import">Import Trades</a>
        </div>
      </div>`;
    return;
  }
  const pnlClass = snapshot.netPnl > 0 ? 'dd-pnl-pos' : snapshot.netPnl < 0 ? 'dd-pnl-neg' : 'dd-pnl-flat';
  const limitPct = snapshot.maxTrades ? Math.min((snapshot.tradeCount / snapshot.maxTrades) * 100, 100) : null;
  container.innerHTML = `
    <div class="dd-snapshot-top">
      <div>
        <div class="dd-snapshot-pnl ${pnlClass} ${snapshotPrivate ? 'dd-blurred' : ''}" id="ddSnapPnl">${fmtPnl(snapshot.netPnl)}</div>
        <div class="dd-snapshot-pnl-sub">Today · ${snapshot.tradeCount} trade${snapshot.tradeCount === 1 ? '' : 's'}</div>
      </div>
      <button type="button" class="dd-icon-btn" id="ddPrivacyToggle" aria-label="Toggle privacy" aria-pressed="${snapshotPrivate}">${snapshotPrivate ? '🙈' : '👁️'}</button>
    </div>
    <div class="dd-snapshot-stats">
      <div class="dd-mini-stat"><div class="dd-mini-stat-l">Win / Loss</div><div class="dd-mini-stat-v">${snapshot.wins}W · ${snapshot.losses}L</div></div>
      <div class="dd-mini-stat"><div class="dd-mini-stat-l">Win Rate</div><div class="dd-mini-stat-v">${snapshot.winRate != null ? snapshot.winRate + '%' : '—'}</div></div>
      <div class="dd-mini-stat"><div class="dd-mini-stat-l">Avg R:R</div><div class="dd-mini-stat-v">${snapshot.avgRR != null ? snapshot.avgRR.toFixed(1) + 'R' : '—'}</div></div>
      <div class="dd-mini-stat">
        <div class="dd-mini-stat-l">Daily Limit</div>
        <div class="dd-mini-stat-v">${snapshot.maxTrades ? `${snapshot.tradeCount}/${snapshot.maxTrades}` : '—'}</div>
        ${limitPct != null ? `<div class="dd-limit-track"><div class="dd-limit-fill" style="width:${limitPct}%"></div></div>` : ''}
      </div>
    </div>
    <div class="dd-snapshot-actions">
      <a class="dd-secondary-btn" href="${opts.tradeTrackerHref}">Log a Trade</a>
      <a class="dd-secondary-btn" href="${opts.tradeTrackerHref}#import">Import Trades</a>
    </div>`;
  container.querySelector('#ddPrivacyToggle').addEventListener('click', () => {
    snapshotPrivate = !snapshotPrivate;
    localStorage.setItem('aghf_snapshot_private', snapshotPrivate ? '1' : '0');
    renderTradingSnapshot(container, snapshot, opts);
  });
}

/* ── Pre-Market Plan checklist ──────────────────────────────────── */

/**
 * @param {import('./dashboard-models.js').PreMarketPlanState} plan
 * @param {{ onSave: (state: import('./dashboard-models.js').PreMarketPlanState) => void }} opts
 */
export function renderPreMarketChecklist(container, plan, opts) {
  const doneCount = plan.items.filter((i) => i.checked).length;
  const pct = Math.round((doneCount / plan.items.length) * 100);
  container.innerHTML = `
    <div class="dd-checklist-progress">${doneCount} of ${plan.items.length} steps done</div>
    <div class="dd-checklist-track"><div class="dd-checklist-fill" style="width:${pct}%"></div></div>
    ${plan.items.map((item) => `
      <button type="button" class="dd-checklist-item ${item.checked ? 'on' : ''}" data-key="${item.key}">
        <span class="dd-checklist-check">${item.checked ? '✓' : ''}</span>
        <span class="dd-checklist-label">${item.label}</span>
      </button>`).join('')}
    <div class="dd-checklist-field-row">
      <div class="dd-checklist-field-label">What must price show before you're allowed to enter?</div>
      <textarea class="dd-checklist-textarea" id="ddEntryCondition" placeholder="e.g. A confirmed 1M candle close through the PIL...">${plan.entryCondition || ''}</textarea>
      <div class="dd-checklist-numrow">
        <div class="dd-checklist-num"><div class="dd-checklist-field-label">Max risk ($)</div><input class="dd-checklist-input" type="number" min="0" id="ddMaxRisk" value="${plan.maxRisk ?? ''}"></div>
        <div class="dd-checklist-num"><div class="dd-checklist-field-label">Max trades</div><input class="dd-checklist-input" type="number" min="0" id="ddMaxTrades" value="${plan.maxTrades ?? ''}"></div>
      </div>
    </div>
    ${plan.completedAt ? '<div class="dd-checklist-complete">✓ Pre-Market Plan Complete</div>' : ''}
  `;

  function persist(next) {
    const saved = opts.onSave(next);
    renderPreMarketChecklist(container, saved, opts);
  }

  container.querySelectorAll('.dd-checklist-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const items = plan.items.map((i) => (i.key === btn.dataset.key ? { ...i, checked: !i.checked } : i));
      persist({ ...plan, items });
    });
  });
  const commit = () => {
    const entryCondition = container.querySelector('#ddEntryCondition').value;
    const maxRisk = container.querySelector('#ddMaxRisk').value;
    const maxTrades = container.querySelector('#ddMaxTrades').value;
    opts.onSave({
      ...plan,
      entryCondition,
      maxRisk: maxRisk === '' ? null : Number(maxRisk),
      maxTrades: maxTrades === '' ? null : Number(maxTrades),
    });
  };
  container.querySelector('#ddEntryCondition').addEventListener('blur', commit);
  container.querySelector('#ddMaxRisk').addEventListener('blur', commit);
  container.querySelector('#ddMaxTrades').addEventListener('blur', commit);
}

/* ── Quick Journal ──────────────────────────────────────────────── */

/**
 * @param {{ prompts: {premarket: string[], postmarket: string[]}, tradeTrackerHref: string, onSave: (entry: any) => void }} opts
 */
export function renderQuickJournalCard(container, opts) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const premarketPrompt = pick(opts.prompts.premarket);
  container.innerHTML = `
    <div class="dd-journal-prompt">“${premarketPrompt}”</div>
    <div class="dd-journal-actions">
      <button type="button" class="dd-secondary-btn" id="ddJournalPre">📝 Pre-Market Reflection</button>
      <a class="dd-secondary-btn" href="${opts.tradeTrackerHref}">📊 Log a Trade</a>
      <button type="button" class="dd-secondary-btn" id="ddJournalPost">🌙 Post-Market Reflection</button>
    </div>`;
  container.querySelector('#ddJournalPre').addEventListener('click', () => openJournalModal('premarket', pick(opts.prompts.premarket), opts.onSave));
  container.querySelector('#ddJournalPost').addEventListener('click', () => openJournalModal('postmarket', pick(opts.prompts.postmarket), opts.onSave));
}

const JOURNAL_MODAL_TITLES = { premarket: 'Pre-Market Reflection', postmarket: 'Post-Market Review' };

/**
 * Opens the shared journal composer modal — exported so journal.html can
 * reuse the exact same write path (journal-service.addEntry) the
 * dashboard's Quick Journal card uses, rather than a second form.
 */
export function openJournalModal(type, prompt, onSave) {
  const title = JOURNAL_MODAL_TITLES[type] || 'Quick Note';
  const body = openModal(`
    <div class="dd-modal-eyebrow">✦ Quick Journal</div>
    <div class="dd-modal-title">${title}</div>
    <div class="dd-journal-prompt">“${prompt}”</div>
    <textarea class="dd-checklist-textarea" id="ddJournalText" style="min-height:100px;width:100%;" placeholder="Type your answer..."></textarea>
    <button type="button" class="dd-primary-btn" id="ddJournalSaveBtn" style="margin-top:12px;width:100%;" disabled>Save to My Notes</button>
    <div id="ddJournalSavedMsg"></div>
  `);
  const textarea = body.querySelector('#ddJournalText');
  const saveBtn = body.querySelector('#ddJournalSaveBtn');
  textarea.addEventListener('input', () => { saveBtn.disabled = textarea.value.trim().length < 5; });
  saveBtn.addEventListener('click', () => {
    onSave({ type, prompt, text: textarea.value.trim() });
    body.querySelector('#ddJournalSavedMsg').innerHTML = '<div class="dd-modal-saved">✓ Saved to My Notes</div>';
    saveBtn.disabled = true;
    showDeskToast('Saved to My Notes ✦');
    closeModalAfter(900);
  });
}

/* ── Recent Trades ──────────────────────────────────────────────── */

/** @param {import('./dashboard-models.js').Trade[]} trades */
export function renderRecentTrades(container, trades, opts) {
  if (!trades.length) {
    container.innerHTML = `<div class="dd-empty"><div class="dd-empty-icon">🕊️</div><div class="dd-empty-text">No trades yet — your history starts here.</div><a class="dd-primary-btn" href="${opts.tradeTrackerHref}">Log Your First Trade</a></div>`;
    return;
  }
  container.innerHTML = trades.map((t) => {
    const date = new Date(t.entryTime);
    const pnlClass = t.netPnl > 0 ? 'dd-pnl-pos' : t.netPnl < 0 ? 'dd-pnl-neg' : 'dd-pnl-flat';
    const tags = (t.ruleViolations || []).slice(0, 2).map((tag) => `<span class="dd-trade-tag warn">${METHOD_QUALITY_LABELS[tag] || tag}</span>`).join('');
    const cleanTag = !t.ruleViolations?.length ? '<span class="dd-trade-tag">Followed Plan</span>' : '';
    return `<div class="dd-trade-row" data-id="${t.id}">
      <div class="dd-trade-thumb">${t.screenshot ? `<img src="${t.screenshot}" alt="">` : '📈'}</div>
      <div class="dd-trade-mid">
        <div class="dd-trade-symbol">${t.symbol} <span class="dir">${t.direction === 'long' ? 'Long' : 'Short'}</span></div>
        <div class="dd-trade-sub">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${t.iccPhase ? ' · ' + (PHASE_LABELS[t.iccPhase] || t.iccPhase) : ''}</div>
        <div class="dd-trade-tags">${cleanTag}${tags}</div>
      </div>
      <div class="dd-trade-pnl ${pnlClass}">${fmtPnl(t.netPnl)}</div>
    </div>`;
  }).join('');
  container.querySelectorAll('.dd-trade-row').forEach((row) => {
    row.addEventListener('click', () => { window.location.href = `${opts.tradeTrackerHref}?trade=${row.dataset.id}`; });
  });
}

/* ── Current Focus (default-rule recommendation, structured to swap later) ── */

/**
 * Deliberately simple default rule for this version — the lowest-scoring
 * applicable consistency rule "wins" as today's focus, falling back to a
 * fixed default when there's not enough data yet. Kept as its own pure
 * function (not baked into the render function) so a rules-based or
 * AI-assisted version can replace just this later.
 * @param {import('./dashboard-models.js').ConsistencyScoreResult} consistency
 */
export function computeCurrentFocus(consistency) {
  const FOCUS_MAP = {
    trade_limit: { title: 'Respecting the Daily Trade Limit', body: 'Overtrading is one of the fastest ways to give back a good week. Set the limit before the session, not during it.' },
    waited_for_confirmation: { title: 'Waiting for Continuation', body: 'A correction isn’t your cue to enter — continuation is. Practice spotting the difference before you act.' },
    traded_with_bias: { title: 'Identifying 4H Bias', body: 'Trading against the higher-timeframe bias is a common early mistake. Anchor every entry to what the 4H is actually showing.' },
    avoided_consolidation: { title: 'Avoiding Consolidation', body: 'Consolidation ranges chop up clean setups. Recognizing one early keeps you out of low-quality trades.' },
    avoided_news: { title: 'Respecting News Windows', body: 'High-impact news can invalidate a clean setup in seconds. Build the habit of checking the calendar before entries.' },
  };
  const failed = consistency.rules.find((r) => r.applicable && !r.passed && FOCUS_MAP[r.key]);
  const focusKey = failed ? failed.key : 'trade_limit';
  const focus = FOCUS_MAP[focusKey];
  return { key: focusKey, ...focus };
}

export function renderCurrentFocusCard(container, focus, opts) {
  container.innerHTML = `
    <div class="dd-focus-eyebrow">✦ Your Current Focus</div>
    <div class="dd-focus-title">${focus.title}</div>
    <div class="dd-focus-body">${focus.body}</div>
    <div class="dd-focus-links">
      ${opts.lessonHref ? `<a class="dd-focus-link" href="${opts.lessonHref}">📖 Recommended Academy lesson</a>` : ''}
      <a class="dd-focus-link" href="${opts.chartLabHref}">📊 Recommended Chart Lab drill</a>
      <a class="dd-focus-link" href="${opts.journalHref}">📝 Journal reflection</a>
    </div>
    <a class="dd-primary-btn" href="${opts.lessonHref || opts.chartLabHref}">Practice This</a>
  `;
}

/* ── Continue Learning ───────────────────────────────────────────── */

export function renderContinueLearningCard(container, data) {
  container.innerHTML = `
    <div class="dd-learning-ring" style="--pct:${data.pct}"><span>${Math.round(data.pct)}%</span></div>
    <div class="dd-learning-mid">
      <div class="dd-learning-eyebrow">${data.eyebrow}</div>
      <div class="dd-learning-title">${data.title}</div>
    </div>
    <div class="dd-learning-actions">
      <a class="dd-secondary-btn" href="${data.continueHref}">${data.continueLabel}</a>
      ${data.notesHref ? `<a class="dd-secondary-btn" href="${data.notesHref}">Review Notes</a>` : ''}
      ${data.practiceHref ? `<a class="dd-secondary-btn" href="${data.practiceHref}">Practice This Concept</a>` : ''}
    </div>`;
}

/* ── Consistency Score ───────────────────────────────────────────── */

/** @param {import('./dashboard-models.js').ConsistencyScoreResult} result */
export function renderConsistencyScore(container, result) {
  container.innerHTML = `
    <button type="button" class="dd-consistency-top" id="ddConsistencyOpen">
      <div class="dd-consistency-ring" style="--pct:${result.scorePct}"><span>${result.scorePct}%</span></div>
      <div class="dd-consistency-mid">
        <div class="dd-consistency-title">Execution Consistency: ${result.scorePct}%</div>
        <div class="dd-consistency-sub">You followed ${result.rulesPassed} of ${result.rulesApplicable} trading rules today.</div>
      </div>
      <span class="dd-consistency-chevron">›</span>
    </button>`;
  container.querySelector('#ddConsistencyOpen').addEventListener('click', () => {
    const body = openModal(`
      <div class="dd-modal-eyebrow">✦ How this is calculated</div>
      <div class="dd-modal-title">Execution Consistency</div>
      ${result.rules.map((r) => `
        <div class="dd-rule-row">
          <span class="dd-rule-mark ${!r.applicable ? 'dd-rule-na' : r.passed ? 'dd-rule-pass' : 'dd-rule-fail'}">${!r.applicable ? '–' : r.passed ? '✓' : '✕'}</span>
          <span class="dd-rule-label ${!r.applicable ? 'na' : ''}">${r.label}${!r.applicable ? ' (not applicable today)' : ''}</span>
        </div>`).join('')}
    `);
  });
}

/* ── Journey Summary ─────────────────────────────────────────────── */

export function renderJourneySummary(container, stats) {
  container.innerHTML = `<div class="dd-journey-grid">${stats.map((s) => `
    <div class="dd-journey-stat"><div class="dd-journey-v">${s.value}</div><div class="dd-journey-l">${s.label}</div></div>`).join('')}</div>`;
}

/* ── Skeleton ─────────────────────────────────────────────────────── */

export function renderSkeleton(container, lines = 3) {
  container.innerHTML = `${'<div class="dd-skel dd-skel-line"></div>'.repeat(lines)}<div class="dd-skel dd-skel-block"></div>`;
}

/* ── Error state with retry ─────────────────────────────────────── */

export function renderErrorState(container, message, onRetry) {
  container.innerHTML = `<div class="dd-error"><span>${message}</span><button type="button">Retry</button></div>`;
  container.querySelector('button').addEventListener('click', onRetry);
}
