/**
 * eval-calculator-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Pass Your Eval Calculator. Presentation only — all
 * math comes from eval-calculator-math.js, never duplicated here. Follows
 * the same `update(next)`-repaints-everything closure architecture as
 * journal-engine.js's renderJournalEntryPage, and reuses the same
 * `.section-card`/`.chip`/`.chip-group`/`.jh-stat-tile`/`.progress-shell`
 * primitives already defined in dayli-desk.css instead of inventing a new
 * visual language.
 */

import { getInstrument, INSTRUMENT_SYMBOLS } from './instrument-data.js';
import {
  DISCLAIMER, ACCOUNT_SIZE_PRESETS, PRESET_NOTE, DRAWDOWN_TYPES,
  PROFIT_TARGET_TYPES, RISK_MODES, PLAN_RISK_STATUS_COPY,
} from './eval-copy.js';
import {
  computeRiskPerTrade, computeRewardPerTrade, computePlannedRR,
  computeProfitTargetDollar, computeRemainingProfitTarget,
  computeDrawdownLimitDollar, computeRemainingDrawdown, computeDrawdownUsagePerLoss,
  computeMaxLossesRemaining, computeExpectedValuePerTrade, computeEstimatedNetPerDay,
  computeEstimatedTradingDaysRange, classifyPlanRiskStatus, WHAT_IF_SCENARIOS,
  runScenarioBatch, validatePlanInputs, computeActualVsPlanned,
} from './eval-calculator-math.js';

function fmtMoney(n) {
  if (n == null || Number.isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtPct(n) {
  return n == null || Number.isNaN(n) ? '—' : `${n.toFixed(0)}%`;
}

function chipGroupHtml({ mode, field, options, value }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = mode === 'multi' ? (value || []) : null;
  return `<div class="chip-group" data-chip-${mode}="${field}">
    ${opts.map((o) => {
      const active = mode === 'multi' ? selected.includes(o.value) : value === o.value;
      return `<button type="button" class="chip ${active ? 'active' : ''}" data-chip-value="${o.value ?? ''}">${o.label}</button>`;
    }).join('')}
  </div>`;
}

function fieldRow(label, inputHtml, help) {
  return `<div class="field-group"><label class="field-label">${label}</label>${inputHtml}${help ? `<div class="small-help" style="margin-top:6px;">${help}</div>` : ''}</div>`;
}

/* ── Section 1: Account setup ─────────────────────────────────────── */

function renderAccountSetupSection(plan) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">🏦</div><div><div class="section-title">Account Setup</div><div class="section-sub">${PRESET_NOTE}</div></div></div>
      <div class="section-body">
        <div class="field-group"><label class="field-label">Account Size</label>
          <div class="chip-group" data-account-preset="1">
            ${ACCOUNT_SIZE_PRESETS.map((p) => `<button type="button" class="chip ${p.value != null && plan.accountSize === p.value && !plan.isCustomAccount ? 'active' : ''} ${p.value == null && plan.isCustomAccount ? 'active' : ''}" data-preset-value="${p.value ?? 'custom'}">${p.label}</button>`).join('')}
          </div>
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Account Size ($)', `<input class="field-input" type="number" min="0" data-field="accountSize" value="${plan.accountSize ?? ''}">`)}
          ${fieldRow('Starting Balance ($)', `<input class="field-input" type="number" min="0" data-field="startingBalance" value="${plan.startingBalance ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Plan Name', `<input class="field-input" type="text" data-field="name" value="${plan.name || ''}" placeholder="e.g. My 50K Eval Plan">`)}
          ${fieldRow('Prop Firm', `<input class="field-input" type="text" data-field="propFirm" value="${plan.propFirm || ''}" placeholder="Example/editable — every firm's rules differ">`)}
        </div>
      </div>
    </div>`;
}

/* ── Section 2: Evaluation rules ──────────────────────────────────── */

function renderEvalRulesSection(plan) {
  const isUnknownDrawdown = plan.drawdownType === 'unknown';
  const isOtherDrawdown = plan.drawdownType === 'other';
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">📋</div><div><div class="section-title">Evaluation Rules</div><div class="section-sub">As you understand them for your firm — never assumed uniform across prop firms.</div></div></div>
      <div class="section-body">
        <div class="field-row cols-2">
          ${fieldRow('Profit Target Type', chipGroupHtml({ mode: 'single', field: 'profitTargetType', value: plan.profitTargetType, options: PROFIT_TARGET_TYPES.map((t) => ({ value: t.key, label: t.label })) }))}
          ${fieldRow(plan.profitTargetType === 'percent' ? 'Profit Target (%)' : 'Profit Target ($)', `<input class="field-input" type="number" min="0" data-field="profitTargetValue" value="${plan.profitTargetValue ?? ''}">`)}
        </div>
        <div class="field-group" style="margin-top:16px;"><label class="field-label">Drawdown Type</label>
          ${chipGroupHtml({ mode: 'single', field: 'drawdownType', value: plan.drawdownType, options: DRAWDOWN_TYPES.map((d) => ({ value: d.key, label: d.label })) })}
          <div class="small-help" style="margin-top:6px;">${DRAWDOWN_TYPES.find((d) => d.key === plan.drawdownType)?.help || ''}</div>
        </div>
        ${!isUnknownDrawdown ? fieldRow('Drawdown Amount ($)', `<input class="field-input" type="number" min="0" data-field="drawdownValue" value="${plan.drawdownValue ?? ''}">`) : ''}
        ${isOtherDrawdown ? fieldRow('Describe how your firm measures drawdown', `<textarea class="field-textarea short" data-field="notes">${plan.notes || ''}</textarea>`) : ''}
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow('Daily Loss Limit ($)', `<input class="field-input" type="number" min="0" data-field="dailyLossLimit" value="${plan.dailyLossLimit ?? ''}">`)}
          ${fieldRow('Consistency Rule (%)', `<input class="field-input" type="number" min="0" max="100" data-field="consistencyRulePct" value="${plan.consistencyRulePct ?? ''}">`, 'The max % of total profit any single day may represent, if your firm has one.')}
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow('Minimum Trading Days', `<input class="field-input" type="number" min="0" data-field="minTradingDays" value="${plan.minTradingDays ?? ''}">`)}
          ${fieldRow('Maximum Trading Days', `<input class="field-input" type="number" min="0" data-field="maxTradingDays" value="${plan.maxTradingDays ?? ''}">`)}
        </div>
      </div>
    </div>`;
}

/* ── Section 3: Trading plan inputs ───────────────────────────────── */

function renderTradingPlanSection(plan) {
  const known = getInstrument(plan.instrument);
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">🎯</div><div><div class="section-title">Your Trading Plan</div></div></div>
      <div class="section-body">
        <div class="field-row cols-2">
          <div class="field-group"><label class="field-label">Instrument</label>
            <select class="field-input" data-field="instrument">
              <option value="">Select…</option>
              ${INSTRUMENT_SYMBOLS.map((s) => `<option value="${s}" ${plan.instrument === s ? 'selected' : ''}>${s} — ${getInstrument(s).label}</option>`).join('')}
              <option value="OTHER" ${plan.instrument === 'OTHER' ? 'selected' : ''}>Other / Custom</option>
            </select>
          </div>
          ${(!known) ? fieldRow('Point Value (manual override)', `<input class="field-input" type="number" min="0" step="0.01" data-field="manualPointValue" value="${plan.manualPointValue ?? ''}">`) : ''}
          ${fieldRow('Contracts', `<input class="field-input" type="number" min="1" data-field="contractsPlanned" value="${plan.contractsPlanned ?? ''}">`)}
        </div>
        <div class="field-group" style="margin-top:16px;"><label class="field-label">Risk Entered As</label>
          ${chipGroupHtml({ mode: 'single', field: 'riskMode', value: plan.riskMode, options: RISK_MODES.map((r) => ({ value: r.key, label: r.label })) })}
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow(plan.riskMode === 'dollars' ? 'Risk per Trade ($)' : 'Stop Loss (points)', `<input class="field-input" type="number" min="0" step="0.01" data-field="riskPerTradeValue" value="${plan.riskPerTradeValue ?? ''}">`)}
          ${fieldRow(plan.riskMode === 'dollars' ? 'Reward per Trade ($)' : 'Take Profit (points)', `<input class="field-input" type="number" min="0" step="0.01" data-field="rewardPerTradeValue" value="${plan.rewardPerTradeValue ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow('Assumed Win Rate (%)', `<input class="field-input" type="number" min="0" max="100" data-field="assumedWinRatePct" value="${plan.assumedWinRatePct ?? ''}">`)}
          ${fieldRow('Fees per Trade ($)', `<input class="field-input" type="number" min="0" step="0.01" data-field="feesPerTrade" value="${plan.feesPerTrade ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow('Max Trades per Day', `<input class="field-input" type="number" min="1" data-field="maxTradesPerDay" value="${plan.maxTradesPerDay ?? ''}">`)}
          ${fieldRow('Max Losses per Day', `<input class="field-input" type="number" min="1" data-field="maxLossesPerDay" value="${plan.maxLossesPerDay ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          ${fieldRow('Trading Days per Week', `<input class="field-input" type="number" min="1" max="7" data-field="tradingDaysPerWeek" value="${plan.tradingDaysPerWeek ?? ''}">`)}
          <div></div>
        </div>
        <div class="field-group" style="margin-top:16px;">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-field-bool="stopAfterWin" ${plan.stopAfterWin ? 'checked' : ''}> Stop trading after one win
          </label>
        </div>
        <div class="field-group" style="margin-top:10px;">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-field-bool="reduceSizeAfterLoss" ${plan.reduceSizeAfterLoss ? 'checked' : ''}> Reduce size on the trade after a loss
          </label>
        </div>
        ${plan.reduceSizeAfterLoss ? fieldRow('Second-Trade Contract Size', `<input class="field-input" type="number" min="1" data-field="secondTradeContractSize" value="${plan.secondTradeContractSize ?? ''}">`) : ''}
      </div>
    </div>`;
}

/* ── Section 4: Calculated metrics ────────────────────────────────── */

function statTile(label, value, opts = {}) {
  return `<div class="jh-stat-tile ${opts.hero ? 'hero' : ''} ${opts.muted ? 'muted' : ''}"><div class="jh-stat-label">${label}</div><div class="jh-stat-value">${value}</div></div>`;
}

function renderCalculatedMetricsSection(plan) {
  const { valid, errors } = validatePlanInputs(plan);
  if (!valid) {
    return `
      <div class="section-card">
        <div class="section-header"><div class="section-icon icon-dark">🧮</div><div><div class="section-title">Calculated Metrics</div></div></div>
        <div class="section-body">
          <div class="small-help">More Information Needed — fix these before the numbers below can compute:</div>
          <ul style="margin:10px 0 0 18px;color:var(--muted);font-size:.85rem;">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>
        </div>
      </div>`;
  }

  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const rr = computePlannedRR(plan);
  const target = computeProfitTargetDollar(plan);
  const remainingTarget = computeRemainingProfitTarget(plan);
  const ddLimit = computeDrawdownLimitDollar(plan);
  const remainingDd = computeRemainingDrawdown(plan);
  const usagePerLoss = computeDrawdownUsagePerLoss(plan);
  const maxLosses = computeMaxLossesRemaining(plan);
  const ev = computeExpectedValuePerTrade(plan);
  const netPerDay = computeEstimatedNetPerDay(plan);
  const daysRange = computeEstimatedTradingDaysRange(plan);

  const targetProgressPct = target ? Math.min(100, ((target - remainingTarget) / target) * 100) : 0;
  const ddUsedPct = ddLimit ? Math.min(100, ((ddLimit - (remainingDd ?? ddLimit)) / ddLimit) * 100) : 0;

  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">🧮</div><div><div class="section-title">Calculated Metrics</div><div class="section-sub">${DISCLAIMER.short}</div></div></div>
      <div class="section-body">
        <div class="jh-stats-row">
          ${statTile('Risk per Trade', fmtMoney(risk))}
          ${statTile('Reward per Trade', fmtMoney(reward))}
          ${statTile('Planned R:R', rr != null ? `1 : ${rr.toFixed(2)}` : '—')}
          ${statTile('Expected Value / Trade', fmtMoney(ev), ev != null && ev < 0 ? { muted: true } : {})}
        </div>
        <div class="jh-stats-row" style="margin-top:12px;">
          ${statTile('Remaining Profit Target', fmtMoney(remainingTarget), { hero: true })}
          ${statTile('Remaining Drawdown', ddLimit == null ? 'Not Sure — add a drawdown amount' : fmtMoney(remainingDd), { hero: ddLimit != null })}
          ${statTile('Drawdown Used per Loss', usagePerLoss != null ? fmtPct(usagePerLoss) : '—')}
          ${statTile('Max Full Losses Remaining', maxLosses != null ? maxLosses : '—')}
        </div>
        <div style="margin-top:16px;">
          <div class="small-help">Progress toward profit target — ${fmtMoney(target ? target - remainingTarget : null)} of ${fmtMoney(target)}</div>
          <div class="progress-shell"><div class="progress-fill" style="width:${targetProgressPct}%"></div></div>
        </div>
        ${ddLimit != null ? `
        <div style="margin-top:14px;">
          <div class="small-help">Drawdown used — ${fmtMoney(ddLimit - (remainingDd ?? ddLimit))} of ${fmtMoney(ddLimit)}</div>
          <div class="progress-shell"><div class="progress-fill" style="width:${ddUsedPct}%;background:linear-gradient(90deg,var(--peach),var(--pink));"></div></div>
        </div>` : ''}
        <div class="jh-stats-row" style="margin-top:16px;">
          ${statTile('Estimated Net / Trading Day', fmtMoney(netPerDay))}
          ${statTile('Est. Trading Days — Conservative', daysRange.conservative ?? '—', { muted: true })}
          ${statTile('Est. Trading Days — Expected', daysRange.expected ?? '—', { hero: true })}
          ${statTile('Est. Trading Days — Strong', daysRange.strong ?? '—', { muted: true })}
        </div>
        <div class="small-help" style="margin-top:10px;">${DISCLAIMER.full} Max-losses-remaining doesn't model slippage beyond the fee you entered.</div>
      </div>
    </div>`;
}

/* ── Actual vs. Planned (read-only, never overwrites the plan) ──────── */

function renderActualVsPlannedSection(actualVsPlanned) {
  if (!actualVsPlanned?.hasData) return '';
  const delta = actualVsPlanned.winRateDelta;
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">📊</div><div><div class="section-title">Your Actual Results So Far</div><div class="section-sub">From your journaled trades — read-only, never overwrites your plan's assumptions.</div></div></div>
      <div class="section-body">
        <div class="jh-stats-row">
          ${statTile('Trades Journaled', actualVsPlanned.actualTradeCount)}
          ${statTile('Actual Net P&amp;L', fmtMoney(actualVsPlanned.actualNetPnl), { hero: true })}
          ${statTile('Actual Win Rate', `${actualVsPlanned.actualWinRate.toFixed(0)}%`)}
          ${statTile('Planned Win Rate', actualVsPlanned.plannedWinRate != null ? `${actualVsPlanned.plannedWinRate}%` : '—', { muted: true })}
        </div>
        ${delta != null ? `<div class="small-help" style="margin-top:6px;">Your actual win rate is ${Math.abs(delta).toFixed(0)} points ${delta >= 0 ? 'above' : 'below'} what your plan assumed.</div>` : ''}
      </div>
    </div>`;
}

/* ── Section 5: What If? scenarios ─────────────────────────────────── */

function renderWhatIfSection(plan, activeScenarioKey, batchResult) {
  const daysRange = computeEstimatedTradingDaysRange(plan);
  const scenarioPlan = activeScenarioKey ? WHAT_IF_SCENARIOS.find((s) => s.key === activeScenarioKey)?.apply(plan) : null;
  const scenarioDays = scenarioPlan ? computeEstimatedTradingDaysRange(scenarioPlan) : null;

  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">🔁</div><div><div class="section-title">What If?</div><div class="section-sub">Tap a scenario to see how it shifts your estimated path — updates immediately, nothing is saved.</div></div></div>
      <div class="section-body">
        <div class="chip-group" data-whatif-group="1">
          ${WHAT_IF_SCENARIOS.map((s) => `<button type="button" class="chip ${activeScenarioKey === s.key ? 'active' : ''}" data-whatif-key="${s.key}">${s.label}</button>`).join('')}
        </div>
        ${scenarioDays ? `
        <div class="jh-stats-row" style="margin-top:14px;">
          ${statTile('Expected Days — Current Plan', daysRange.expected ?? '—', { muted: true })}
          ${statTile('Expected Days — With This Scenario', scenarioDays.expected ?? '—', { hero: true })}
        </div>` : ''}
        <div style="margin-top:16px;border-top:1px solid rgba(244,130,154,.1);padding-top:14px;">
          <button type="button" class="dd-secondary-btn" id="evalRunBatchBtn">Run 200-Trial Simulation</button>
          ${batchResult ? `
          <div class="jh-stats-row" style="margin-top:12px;">
            ${statTile('Pass Rate (est.)', fmtPct(batchResult.passRate), { hero: true })}
            ${statTile('Median Days to Pass', batchResult.medianDaysToPass ?? '—')}
            ${statTile('Trials / Seed', `${batchResult.trials} / ${batchResult.seed}`, { muted: true })}
          </div>
          <div class="small-help" style="margin-top:8px;">A reproducible projection from your own assumptions — not a promise of how real trading will go.</div>` : ''}
        </div>
      </div>
    </div>`;
}

/* ── Section 6: Plan risk status ───────────────────────────────────── */

function renderPlanRiskStatusSection(plan) {
  const { status, reasons } = classifyPlanRiskStatus(plan);
  const copy = PLAN_RISK_STATUS_COPY[status];
  const icon = { good: '✓', watch: '◐', warn: '⚠', neutral: '○' }[copy.tone] || '○';
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">${icon}</div><div><div class="section-title">Plan Risk Status: ${copy.label}</div><div class="section-sub">${copy.description}</div></div></div>
      ${reasons?.length ? `<div class="section-body"><ul style="margin:0 0 0 18px;color:var(--muted);font-size:.85rem;">${reasons.map((r) => `<li>${r}</li>`).join('')}</ul></div>` : ''}
    </div>`;
}

/* ── Actions bar ──────────────────────────────────────────────────── */

function renderActionsBar(status) {
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';
  return `
    <div class="cl-wizard-nav">
      <span class="cl-nav-status">${statusText}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <button type="button" class="dd-secondary-btn" id="evalDuplicateBtn">Duplicate</button>
        <button type="button" class="dd-secondary-btn" id="evalArchiveBtn">Archive</button>
        <button type="button" class="dd-primary-btn" id="evalSetActiveBtn">Set as Active Plan</button>
      </div>
    </div>`;
}

/**
 * Orchestrates the whole eval plan editor. `helpers`:
 * { onChange(nextPlan), onDuplicate(), onArchive(), onSetActive(), saveStatus }
 */
export function renderEvalCalculatorPage(container, plan, helpers) {
  let activeScenarioKey = null;
  let batchResult = null;

  function update(next) {
    plan = next;
    helpers.onChange(plan);
    paint();
  }

  function paint() {
    container.innerHTML = `
      ${renderAccountSetupSection(plan)}
      ${renderEvalRulesSection(plan)}
      ${renderTradingPlanSection(plan)}
      ${renderCalculatedMetricsSection(plan)}
      ${renderActualVsPlannedSection(helpers.actualVsPlanned)}
      ${renderWhatIfSection(plan, activeScenarioKey, batchResult)}
      ${renderPlanRiskStatusSection(plan)}
      <div id="evalActionsBar"></div>`;
    wireFields();
    const actionsBar = container.querySelector('#evalActionsBar');
    actionsBar.innerHTML = renderActionsBar(helpers.saveStatus || 'saved');
    actionsBar.querySelector('#evalDuplicateBtn').addEventListener('click', helpers.onDuplicate);
    actionsBar.querySelector('#evalArchiveBtn').addEventListener('click', helpers.onArchive);
    actionsBar.querySelector('#evalSetActiveBtn').addEventListener('click', helpers.onSetActive);
  }

  function wireFields() {
    container.querySelectorAll('[data-field]').forEach((el) => {
      const commit = () => {
        const field = el.dataset.field;
        let value = el.value;
        if (el.type === 'number') value = value === '' ? null : Number(value);
        update({ ...plan, [field]: value });
      };
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', commit);
    });

    container.querySelectorAll('[data-field-bool]').forEach((el) => {
      el.addEventListener('change', () => update({ ...plan, [el.dataset.fieldBool]: el.checked }));
    });

    container.querySelectorAll('[data-chip-single]').forEach((group) => {
      const field = group.dataset.chipSingle;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => update({ ...plan, [field]: btn.dataset.chipValue }));
      });
    });

    const presetGroup = container.querySelector('[data-account-preset]');
    if (presetGroup) {
      presetGroup.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const v = btn.dataset.presetValue;
          if (v === 'custom') update({ ...plan, isCustomAccount: true });
          else update({ ...plan, accountSize: Number(v), startingBalance: Number(v), isCustomAccount: false });
        });
      });
    }

    const whatIfGroup = container.querySelector('[data-whatif-group]');
    if (whatIfGroup) {
      whatIfGroup.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeScenarioKey = activeScenarioKey === btn.dataset.whatifKey ? null : btn.dataset.whatifKey;
          paint();
        });
      });
    }

    const runBatchBtn = container.querySelector('#evalRunBatchBtn');
    if (runBatchBtn) {
      runBatchBtn.addEventListener('click', () => {
        batchResult = runScenarioBatch(plan, { trials: 200, seed: 42 });
        paint();
      });
    }
  }

  paint();
  return {
    getState: () => plan,
    setSaveStatus: (status) => { helpers.saveStatus = status; const bar = container.querySelector('#evalActionsBar'); if (bar) bar.querySelector('.cl-nav-status').textContent = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓'; },
    applySavedFields: (saved) => { plan = { ...plan, id: saved.id, status: saved.status, createdAt: saved.createdAt }; },
    setActualVsPlanned: (avp) => { helpers.actualVsPlanned = avp; paint(); },
  };
}
