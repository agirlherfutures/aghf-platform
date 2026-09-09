/**
 * eval-calculator-wizard-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Pass Your Eval Calculator, redesigned as a calm
 * 3-step wizard (My Evaluation → My Trade Plan → My Plan) answering only
 * three questions: what am I risking, how many wins do I need, does it
 * fit my drawdown. Presentation only — every number comes from
 * eval-calculator-math.js untouched, never duplicated here. Reuses the
 * exact step-wizard chrome already proven in journal-engine.js
 * (.cl-stage-topbar/.dd-tab/.cl-wizard-nav/.cl-nav-status) and the
 * collapsed-accordion pattern already proven in checklist-engine.js
 * (a closure-scoped Set + .cl-toggle-btn "Show details"/"Hide details"),
 * rather than inventing new interaction mechanisms.
 *
 * State model: one continuous `plan` draft object, exactly like the page
 * this replaces — every field commits via the same update(next) → full
 * paint() pattern on blur/change regardless of which step it's on, so
 * stepping back and forth never loses anything (there's only ever one
 * object) and autosave (owned by eval-calculator.html) keeps firing on
 * every commit, so a reload mid-flow is exactly as safe as it always was.
 */

import { getInstrument, INSTRUMENT_SYMBOLS } from './instrument-data.js';
import { openModal, closeModal, showDeskToast } from './dayli-desk-engine.js';
import {
  DISCLAIMER, ACCOUNT_SIZE_PRESETS, PRESET_NOTE, DRAWDOWN_TYPES,
  PROFIT_TARGET_TYPES, RISK_MODES, PLAN_RISK_STATUS_COPY,
} from './eval-copy.js';
import {
  STEP_TITLES, SECTION_LABELS, RESULT_NOTE, NEED_MORE_INFO, WELCOME_BACK,
  resultHeadline, MATH_FORMULA_LABELS,
} from './eval-calculator-copy.js';
import {
  computeRiskPerTrade, computeRewardPerTrade, computePlannedRR,
  computeProfitTargetDollar, computeRemainingProfitTarget,
  computeDrawdownLimitDollar, computeRemainingDrawdown, computeDrawdownUsagePerLoss,
  computeMaxLossesRemaining, computeExpectedValuePerTrade, computeEstimatedNetPerDay,
  computeEstimatedTradingDaysRange, classifyPlanRiskStatus, WHAT_IF_SCENARIOS,
  runScenarioBatch, validatePlanInputs, computeActualVsPlanned,
} from './eval-calculator-math.js';

/* ── formatting + generic field helpers (unchanged from the prior engine) ── */

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

function statTile(label, value, opts = {}) {
  return `<div class="jh-stat-tile ${opts.hero ? 'hero' : ''} ${opts.muted ? 'muted' : ''}"><div class="jh-stat-label">${label}</div><div class="jh-stat-value">${value}</div></div>`;
}

function toggleBtn(key, isOpen) {
  return `<button type="button" class="cl-toggle-btn" data-toggle-section="${key}">${isOpen ? 'Hide' : 'Show'} ${isOpen ? '▴' : '▾'}</button>`;
}

/* ── Step 1: My Evaluation ─────────────────────────────────────────── */

function renderStep1(plan) {
  const isUnknownDrawdown = plan.drawdownType === 'unknown';
  return `
    <div class="eval-wizard-panel">
      <div class="pg-eye">${STEP_TITLES.step1.eyebrow}</div>
      <div class="eval-step-heading">${STEP_TITLES.step1.title}</div>

      <div class="field-group" style="margin-top:18px;">
        <label class="field-label">Account Size</label>
        <div class="eval-preset-grid" data-account-preset="1">
          ${ACCOUNT_SIZE_PRESETS.map((p) => `<button type="button" class="eval-preset-card ${p.value != null && plan.accountSize === p.value && !plan.isCustomAccount ? 'active' : ''} ${p.value == null && plan.isCustomAccount ? 'active' : ''}" data-preset-value="${p.value ?? 'custom'}">${p.label}</button>`).join('')}
        </div>
        <div class="small-help" style="margin-top:6px;">${PRESET_NOTE}</div>
        ${plan.isCustomAccount ? `<div class="field-row cols-2" style="margin-top:12px;">
          ${fieldRow('Account Size ($)', `<input class="field-input" type="number" min="0" data-field="accountSize" value="${plan.accountSize ?? ''}">`)}
          ${fieldRow('Starting Balance ($)', `<input class="field-input" type="number" min="0" data-field="startingBalance" value="${plan.startingBalance ?? ''}">`)}
        </div>` : ''}
      </div>

      <div class="field-row cols-2" style="margin-top:18px;">
        ${fieldRow(plan.profitTargetType === 'percent' ? 'Profit Target (%)' : 'Profit Target ($)', `<input class="field-input" type="number" min="0" data-field="profitTargetValue" value="${plan.profitTargetValue ?? ''}" placeholder="e.g. 3000">`, 'How much profit your firm requires to pass.')}
        ${isUnknownDrawdown
          ? `<div class="field-group"><label class="field-label">Maximum Drawdown</label><div class="small-help">${NEED_MORE_INFO} ${DISCLAIMER.notSure}</div></div>`
          : fieldRow('Maximum Drawdown ($)', `<input class="field-input" type="number" min="0" data-field="drawdownValue" value="${plan.drawdownValue ?? ''}" placeholder="e.g. 2000">`, 'The most your account can lose before the evaluation fails.')}
      </div>

      <div class="field-row cols-2" style="margin-top:18px;">
        ${fieldRow('Minimum Trading Days (optional)', `<input class="field-input" type="number" min="0" data-field="minTradingDays" value="${plan.minTradingDays ?? ''}">`)}
        <div></div>
      </div>

      <div class="eval-accordion-section" style="margin-top:18px;">
        <div class="eval-accordion-header">
          <span class="eval-accordion-label">${SECTION_LABELS.addMoreEvalRules}</span>
          ${toggleBtn('addMoreEvalRules', false)}
        </div>
      </div>
      <div id="evalStep1Accordion"></div>

      <div class="eval-step-actions">
        <button type="button" class="dd-primary-btn" id="evalStep1Continue">Continue to My Trade Plan</button>
      </div>
    </div>`;
}

function renderAddMoreEvalRulesSection(plan) {
  const currentPl = plan.currentBalance != null ? plan.currentBalance - (plan.startingBalance ?? 0) : null;
  return `
    <div class="section-card">
      <div class="section-body">
        <div class="field-row cols-2">
          ${fieldRow('Current Balance ($)', `<input class="field-input" type="number" data-field="currentBalance" value="${plan.currentBalance ?? ''}">`)}
          ${fieldRow('Current Profit or Loss', `<div class="field-input" style="background:var(--bg);">${currentPl != null ? fmtMoney(currentPl) : '—'}</div>`, 'Calculated from Current Balance − Starting Balance.')}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Daily Loss Limit ($)', `<input class="field-input" type="number" min="0" data-field="dailyLossLimit" value="${plan.dailyLossLimit ?? ''}">`)}
          ${fieldRow('Consistency Rule (%)', `<input class="field-input" type="number" min="0" max="100" data-field="consistencyRulePct" value="${plan.consistencyRulePct ?? ''}">`, 'The max % of total profit any single day may represent, if your firm has one.')}
        </div>
        <div class="field-group" style="margin-top:14px;"><label class="field-label">Drawdown Type</label>
          ${chipGroupHtml({ mode: 'single', field: 'drawdownType', value: plan.drawdownType, options: DRAWDOWN_TYPES.map((d) => ({ value: d.key, label: d.label })) })}
          <div class="small-help" style="margin-top:6px;">${DRAWDOWN_TYPES.find((d) => d.key === plan.drawdownType)?.help || ''}</div>
        </div>
        ${plan.drawdownType === 'other' ? fieldRow('Describe how your firm measures drawdown', `<textarea class="field-textarea short" data-field="notes">${plan.notes || ''}</textarea>`) : ''}
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Maximum Evaluation Days', `<input class="field-input" type="number" min="0" data-field="maxTradingDays" value="${plan.maxTradingDays ?? ''}">`)}
          ${fieldRow('Prop Firm', `<input class="field-input" type="text" data-field="propFirm" value="${plan.propFirm || ''}" placeholder="Example/editable — every firm's rules differ">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Evaluation Start Date', `<input class="field-input" type="date" data-field="evalStartDate" value="${plan.evalStartDate || ''}">`)}
          ${fieldRow('Plan Name', `<input class="field-input" type="text" data-field="name" value="${plan.name || ''}" placeholder="e.g. My 50K Eval Plan">`)}
        </div>
      </div>
    </div>`;
}

/* ── Step 2: My Trade Plan ─────────────────────────────────────────── */

function renderLiveCalcStrip(plan) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const rr = computePlannedRR(plan);
  return `
    <div class="eval-calc-strip">
      <div class="eval-calc-strip-item"><span class="eval-calc-strip-label">Risk per trade</span><span class="eval-calc-strip-value">${fmtMoney(risk)}</span></div>
      <div class="eval-calc-strip-item"><span class="eval-calc-strip-label">Reward per win</span><span class="eval-calc-strip-value">${fmtMoney(reward)}</span></div>
      <div class="eval-calc-strip-item"><span class="eval-calc-strip-label">Risk-to-reward</span><span class="eval-calc-strip-value">${rr != null ? `1:${rr.toFixed(2)}` : '—'}</span></div>
    </div>`;
}

function renderStep2(plan) {
  const known = getInstrument(plan.instrument);
  return `
    <div class="eval-wizard-panel">
      <div class="pg-eye">${STEP_TITLES.step2.eyebrow}</div>
      <div class="eval-step-heading">${STEP_TITLES.step2.title}</div>

      <div class="field-row cols-2" style="margin-top:18px;">
        <div class="field-group"><label class="field-label">Instrument</label>
          <select class="field-input" data-field="instrument">
            <option value="">Select…</option>
            ${INSTRUMENT_SYMBOLS.map((s) => `<option value="${s}" ${plan.instrument === s ? 'selected' : ''}>${s} — ${getInstrument(s).label}</option>`).join('')}
            <option value="OTHER" ${plan.instrument === 'OTHER' ? 'selected' : ''}>Other / Custom</option>
          </select>
        </div>
        ${fieldRow('Contracts', `<input class="field-input" type="number" min="1" data-field="contractsPlanned" value="${plan.contractsPlanned ?? ''}">`)}
      </div>
      ${(!known) ? `<div class="field-row cols-2" style="margin-top:14px;">${fieldRow('Point Value (manual override)', `<input class="field-input" type="number" min="0" step="0.01" data-field="manualPointValue" value="${plan.manualPointValue ?? ''}">`)}<div></div></div>` : ''}

      <div class="field-row cols-2" style="margin-top:14px;">
        ${fieldRow(plan.riskMode === 'dollars' ? 'Stop Loss ($)' : 'Stop Loss (points)', `<input class="field-input" type="number" min="0" step="0.01" data-field="riskPerTradeValue" value="${plan.riskPerTradeValue ?? ''}">`)}
        ${fieldRow(plan.riskMode === 'dollars' ? 'Take Profit ($)' : 'Take Profit (points)', `<input class="field-input" type="number" min="0" step="0.01" data-field="rewardPerTradeValue" value="${plan.rewardPerTradeValue ?? ''}">`)}
      </div>

      <div id="evalLiveCalcStrip" style="margin-top:14px;">${renderLiveCalcStrip(plan)}</div>

      <div class="field-row cols-2" style="margin-top:18px;">
        ${fieldRow('Estimated Win Rate (%)', `<input class="field-input" type="number" min="0" max="100" data-field="assumedWinRatePct" value="${plan.assumedWinRatePct ?? ''}">`)}
        ${fieldRow('Maximum Trades Per Day', `<input class="field-input" type="number" min="1" data-field="maxTradesPerDay" value="${plan.maxTradesPerDay ?? ''}">`)}
      </div>

      <div class="eval-accordion-section" style="margin-top:18px;">
        <div class="eval-accordion-header">
          <span class="eval-accordion-label">${SECTION_LABELS.customizeMyPlan}</span>
          ${toggleBtn('customizeMyPlan', false)}
        </div>
      </div>
      <div id="evalStep2Accordion"></div>

      <div class="eval-step-actions">
        <button type="button" class="dd-secondary-btn" id="evalStep2Back">← Back</button>
        <button type="button" class="dd-primary-btn" id="evalStep2Continue">Show My Eval Plan</button>
      </div>
    </div>`;
}

function renderCustomizeMyPlanSection(plan) {
  return `
    <div class="section-card">
      <div class="section-body">
        <div class="field-group"><label class="field-label">Risk Entered As</label>
          ${chipGroupHtml({ mode: 'single', field: 'riskMode', value: plan.riskMode, options: RISK_MODES.map((r) => ({ value: r.key, label: r.label })) })}
        </div>
        <div class="field-group" style="margin-top:14px;">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-field-bool="stopAfterWin" ${plan.stopAfterWin ? 'checked' : ''}> Stop After First Win
          </label>
        </div>
        <div class="small-help" style="margin-top:10px;">Your Maximum Trades Per Day above already allows a second trade after a loss — the two settings below shape what that second trade looks like.</div>
        <div class="field-group" style="margin-top:8px;">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-field-bool="reduceSizeAfterLoss" ${plan.reduceSizeAfterLoss ? 'checked' : ''}> Reduce Size After a Loss
          </label>
        </div>
        ${plan.reduceSizeAfterLoss ? fieldRow('Second-Trade Contract Size', `<input class="field-input" type="number" min="1" data-field="secondTradeContractSize" value="${plan.secondTradeContractSize ?? ''}">`) : ''}
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Estimated Fees ($ per trade)', `<input class="field-input" type="number" min="0" step="0.01" data-field="feesPerTrade" value="${plan.feesPerTrade ?? ''}">`)}
          ${fieldRow('Planned Trading Days Per Week', `<input class="field-input" type="number" min="1" max="7" data-field="tradingDaysPerWeek" value="${plan.tradingDaysPerWeek ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Max Losses Per Day', `<input class="field-input" type="number" min="1" data-field="maxLossesPerDay" value="${plan.maxLossesPerDay ?? ''}">`)}
          <div></div>
        </div>
      </div>
    </div>`;
}

/* ── Step 3: My Plan ───────────────────────────────────────────────── */

function renderResultStatusCard(plan) {
  const { valid, errors } = validatePlanInputs(plan);
  if (!valid) {
    return `
      <div class="eval-result-hero tone-neutral">
        <div class="eval-result-headline">More Information Needed</div>
        <div class="eval-result-summary">Fix these before we can show your plan: ${errors.join(' ')}</div>
      </div>`;
  }

  const { status, reasons } = classifyPlanRiskStatus(plan);
  const copy = PLAN_RISK_STATUS_COPY[status];
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const maxLosses = computeMaxLossesRemaining(plan);
  const daysRange = computeEstimatedTradingDaysRange(plan);

  const lossesClause = maxLosses != null
    ? `Your entered drawdown can absorb approximately ${maxLosses} full loss${maxLosses === 1 ? '' : 'es'} at this risk level.`
    : NEED_MORE_INFO;
  const pathClause = daysRange.expected != null
    ? `Based on your assumptions, your estimated path is approximately ${daysRange.conservative ?? daysRange.expected}–${daysRange.strong ?? daysRange.expected} trading days.`
    : 'Add a profit target and win rate to see an estimated path.';

  return `
    <div class="eval-result-hero tone-${copy.tone}">
      <div class="eval-result-headline">${resultHeadline(copy.label)}</div>
      <div class="eval-result-summary">You're risking ${fmtMoney(risk)} to make ${fmtMoney(reward)} per trade. ${lossesClause} ${pathClause}</div>
      ${reasons?.length ? `<div class="eval-result-why">${reasons[0]}</div>` : `<div class="eval-result-why">${copy.description}</div>`}
    </div>`;
}

function renderGoalCard(plan) {
  const target = computeProfitTargetDollar(plan);
  const remaining = computeRemainingProfitTarget(plan);
  const pct = target ? Math.min(100, ((target - (remaining ?? target)) / target) * 100) : 0;
  return `
    <div class="dd-card eval-result-card">
      <div class="eval-result-card-label">Your Goal</div>
      <div class="eval-result-card-value">${fmtMoney(target ? target - remaining : null)} of ${fmtMoney(target)}</div>
      <div class="progress-shell"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
}

function renderRiskCushionCard(plan) {
  const ddLimit = computeDrawdownLimitDollar(plan);
  const remainingDd = computeRemainingDrawdown(plan);
  const maxLosses = computeMaxLossesRemaining(plan);
  if (ddLimit == null) {
    return `
      <div class="dd-card eval-result-card">
        <div class="eval-result-card-label">Your Risk Cushion</div>
        <div class="small-help">${NEED_MORE_INFO}</div>
      </div>`;
  }
  return `
    <div class="dd-card eval-result-card">
      <div class="eval-result-card-label">Your Risk Cushion</div>
      <div class="eval-result-card-value">${fmtMoney(remainingDd)} remaining</div>
      <div class="small-help" style="margin-top:4px;">Approximately ${maxLosses ?? '—'} full losses</div>
    </div>`;
}

function renderEstimatedPathCard(plan) {
  const daysRange = computeEstimatedTradingDaysRange(plan);
  return `
    <div class="dd-card eval-result-card">
      <div class="eval-result-card-label">Your Estimated Path</div>
      ${daysRange.expected != null
        ? `<div class="eval-result-card-value">${daysRange.conservative ?? daysRange.expected}–${daysRange.strong ?? daysRange.expected} estimated trading days</div>`
        : `<div class="small-help">Add a profit target and win rate to see an estimate.</div>`}
      ${plan.minTradingDays ? `<div class="small-help" style="margin-top:4px;">${plan.minTradingDays} minimum days required</div>` : ''}
      ${daysRange.spreadNote ? `<div class="small-help" style="margin-top:4px;">${daysRange.spreadNote}</div>` : ''}
    </div>`;
}

function renderActualVsPlannedSection(actualVsPlanned) {
  if (!actualVsPlanned?.hasData) return '';
  const delta = actualVsPlanned.winRateDelta;
  return `
    <div class="section-card" style="margin-top:16px;">
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

function mathLineItem(key, plainLanguage, formulaVisible) {
  const entry = MATH_FORMULA_LABELS[key];
  const isOpen = formulaVisible.has(key);
  return `
    <div class="eval-math-item">
      <div class="eval-math-item-row">
        <div><span class="eval-math-item-label">${entry.label}:</span> <span class="eval-math-item-value">${plainLanguage}</span></div>
        <button type="button" class="eval-formula-toggle" data-toggle-formula="${key}">${isOpen ? 'Hide Formula' : 'Show Formula'}</button>
      </div>
      ${isOpen ? `<div class="eval-formula-text">${entry.formula}</div>` : ''}
    </div>`;
}

function renderSeeTheMathSection(plan, formulaVisible) {
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const ev = computeExpectedValuePerTrade(plan);
  const remaining = computeRemainingProfitTarget(plan);
  const winsNeeded = (remaining != null && reward) ? Math.ceil(remaining / reward) : null;
  const usagePerLoss = computeDrawdownUsagePerLoss(plan);
  const ddLimit = computeDrawdownLimitDollar(plan);
  const dailyLossExposure = (plan.dailyLossLimit && ddLimit) ? (plan.dailyLossLimit / ddLimit) * 100 : null;
  const netPerDay = computeEstimatedNetPerDay(plan);
  const daysRange = computeEstimatedTradingDaysRange(plan);

  return `
    <div class="section-card">
      <div class="section-body">
        ${mathLineItem('risk', fmtMoney(risk), formulaVisible)}
        ${mathLineItem('reward', fmtMoney(reward), formulaVisible)}
        ${mathLineItem('expectedValue', fmtMoney(ev), formulaVisible)}
        ${mathLineItem('winsNeeded', winsNeeded != null ? `${winsNeeded} wins` : '—', formulaVisible)}
        ${mathLineItem('drawdownExposure', usagePerLoss != null ? fmtPct(usagePerLoss) : NEED_MORE_INFO, formulaVisible)}
        ${mathLineItem('dailyLossExposure', dailyLossExposure != null ? fmtPct(dailyLossExposure) : '—', formulaVisible)}
        ${mathLineItem('consistencyRule', plan.consistencyRulePct ? `${plan.consistencyRulePct}% rule entered — compared automatically against your journaled trades' best day` : 'No consistency rule entered', formulaVisible)}
        ${mathLineItem('fees', plan.feesPerTrade ? fmtMoney(plan.feesPerTrade) + ' per trade' : 'No fee entered', formulaVisible)}
        ${mathLineItem('estimatedPath', netPerDay != null ? `${fmtMoney(netPerDay)} estimated net per trading day` : '—', formulaVisible)}
        ${daysRange.spreadNote ? `<div class="small-help" style="margin-top:10px;">${daysRange.spreadNote}</div>` : ''}
        <div class="small-help" style="margin-top:10px;">${DISCLAIMER.full}</div>
      </div>
    </div>`;
}

function renderExploreWhatIfSection(plan, activeScenarioKey, batchResult) {
  const daysRange = computeEstimatedTradingDaysRange(plan);
  const scenarioPlan = activeScenarioKey ? WHAT_IF_SCENARIOS.find((s) => s.key === activeScenarioKey)?.apply(plan) : null;
  const scenarioDays = scenarioPlan ? computeEstimatedTradingDaysRange(scenarioPlan) : null;

  return `
    <div class="section-card">
      <div class="section-body">
        <div class="small-help" style="margin-bottom:10px;">Tap a scenario to see how it shifts your estimated path — updates immediately, nothing is saved.</div>
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

function renderStep3(plan, ctx) {
  const { formulaVisible, activeScenarioKey, batchResult, actualVsPlanned, viewMode } = ctx;
  return `
    <div class="eval-wizard-panel">
      ${viewMode === 'wizard' ? `<div class="pg-eye">${STEP_TITLES.step3.eyebrow}</div>` : ''}
      ${renderResultStatusCard(plan)}
      <div class="eval-result-grid">
        ${renderGoalCard(plan)}
        ${renderRiskCushionCard(plan)}
        ${renderEstimatedPathCard(plan)}
      </div>
      <div class="small-help" style="margin-top:10px;text-align:center;">${RESULT_NOTE}</div>
      ${renderActualVsPlannedSection(actualVsPlanned)}

      <div class="eval-accordion-section" style="margin-top:20px;">
        <div class="eval-accordion-header"><span class="eval-accordion-label">${SECTION_LABELS.seeTheMath}</span>${toggleBtn('seeTheMath', false)}</div>
      </div>
      <div id="evalSeeTheMath"></div>

      <div class="eval-accordion-section" style="margin-top:12px;">
        <div class="eval-accordion-header"><span class="eval-accordion-label">${SECTION_LABELS.exploreWhatIf}</span>${toggleBtn('exploreWhatIf', false)}</div>
      </div>
      <div id="evalExploreWhatIf"></div>

      <div class="eval-step3-actions">
        <button type="button" class="dd-primary-btn" id="evalSaveBtn">Save My Eval Plan</button>
        <div class="eval-step3-secondary">
          <button type="button" class="cl-delete-link" id="evalAdjustBtn">Adjust My Numbers</button>
          <button type="button" class="cl-delete-link" id="evalStartOverBtn">Start Over</button>
          <a class="cl-delete-link" href="journal-history.html?view=calendar">View My Trading Calendar</a>
        </div>
      </div>
    </div>`;
}

/* ── Welcome-back state ───────────────────────────────────────────── */

function renderWelcomeBackCard(plan) {
  const target = computeProfitTargetDollar(plan);
  const remaining = computeRemainingProfitTarget(plan);
  const remainingDd = computeRemainingDrawdown(plan);
  const { status } = classifyPlanRiskStatus(plan);
  const copy = PLAN_RISK_STATUS_COPY[status];
  return `
    <div class="eval-wizard-panel">
      <div class="pg-eye">✦ ${WELCOME_BACK.heading}</div>
      <div class="eval-step-heading">${WELCOME_BACK.sub}</div>
      ${plan.status === 'passed' ? `<div class="dd-card" style="margin-top:14px;background:var(--teal-pale);border-color:var(--teal);">
        <strong>You passed! ✦</strong> That’s a real win worth celebrating.
        <a class="dd-secondary-btn" style="margin-left:10px;" href="share-win-flow.html?fromEvalPlanId=${plan.id}">Share Your Win</a>
      </div>` : ''}
      <div class="dd-card eval-welcome-card" style="margin-top:18px;">
        <div class="jh-stats-row">
          ${statTile('Account Size', fmtMoney(plan.accountSize))}
          ${statTile('Target Progress', fmtMoney(target ? target - remaining : null) + ' of ' + fmtMoney(target), { hero: true })}
          ${statTile('Drawdown Remaining', remainingDd != null ? fmtMoney(remainingDd) : 'Not Sure')}
          ${statTile('Evaluation Day', plan.tradingDaysElapsed || 0)}
        </div>
        <div style="margin-top:10px;"><span class="dd-badge dd-badge-${copy.tone === 'good' ? 'bull' : copy.tone === 'warn' ? 'bear' : copy.tone === 'watch' ? 'neutral' : 'muted'}">${copy.label}</span></div>
      </div>
      <div class="eval-step-actions" style="margin-top:18px;">
        <button type="button" class="dd-primary-btn" id="evalContinuePlanBtn">Continue My Plan</button>
        <button type="button" class="dd-secondary-btn" id="evalUpdateProgressBtn">Update Progress</button>
        <button type="button" class="cl-delete-link" id="evalCreateAnotherBtn">Create Another Plan</button>
      </div>
    </div>`;
}

/* ── Orchestrator ─────────────────────────────────────────────────── */

const STEPS = ['step1', 'step2', 'step3'];
const STEP_LABELS = { step1: 'My Evaluation', step2: 'My Trade Plan', step3: 'My Plan' };

function firstIncompleteWizardStep(plan) {
  if (!plan.accountSize || !plan.profitTargetValue) return 'step1';
  if (!plan.instrument || !plan.riskPerTradeValue || !plan.rewardPerTradeValue) return 'step2';
  return 'step1';
}

/**
 * Orchestrates the whole eval plan editor. `helpers`:
 * { onChange(nextPlan), onReset(), onSaveExplicit(plan)->Promise<plan>,
 *   onUpdateProgress(currentBalance,tradingDaysElapsed)->Promise<plan>,
 *   onCreateAnother(), saveStatus, actualVsPlanned, initialViewMode }
 */
export function renderEvalCalculatorPage(container, plan, helpers) {
  let viewMode = helpers.initialViewMode === 'welcome-back' ? 'welcome-back' : 'wizard';
  let activeStep = viewMode === 'wizard' ? firstIncompleteWizardStep(plan) : 'step1';
  let activeScenarioKey = null;
  let batchResult = null;
  const formulaVisible = new Set();
  const openSections = new Set();

  function update(next) {
    plan = next;
    helpers.onChange(plan);
    paint();
  }

  function paint() {
    let bodyHtml;
    if (viewMode === 'welcome-back') {
      bodyHtml = renderWelcomeBackCard(plan);
    } else if (activeStep === 'step3') {
      bodyHtml = renderStep3(plan, { formulaVisible, activeScenarioKey, batchResult, actualVsPlanned: helpers.actualVsPlanned, viewMode });
    } else if (activeStep === 'step2') {
      bodyHtml = renderStep2(plan);
    } else {
      bodyHtml = renderStep1(plan);
    }

    const showTopbar = viewMode === 'wizard';
    container.innerHTML = `
      <div class="eval-wizard-shell">
        ${showTopbar ? `<div class="eval-step-topbar">
          <div class="cl-stage-pills">${STEPS.map((s) => `<button type="button" class="dd-tab ${s === activeStep ? 'active' : ''}" data-eval-step="${s}">${STEP_LABELS[s]}</button>`).join('')}</div>
          <span class="cl-nav-status" id="evalSaveStatus">${saveStatusText(helpers.saveStatus)}</span>
        </div>` : ''}
        ${bodyHtml}
      </div>`;

    wireAccordions();
    wireFields();
    wireStepNav();
    wireWelcomeBack();
    wireStep3Actions();
  }

  function saveStatusText(status) {
    return status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';
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
      presetGroup.querySelectorAll('.eval-preset-card').forEach((btn) => {
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

    container.querySelectorAll('[data-toggle-formula]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.toggleFormula;
        if (formulaVisible.has(key)) formulaVisible.delete(key); else formulaVisible.add(key);
        paint();
      });
    });
  }

  function wireStepNav() {
    container.querySelectorAll('[data-eval-step]').forEach((btn) => {
      btn.addEventListener('click', () => { activeStep = btn.dataset.evalStep; paint(); });
    });
    const c1 = container.querySelector('#evalStep1Continue');
    if (c1) c1.addEventListener('click', () => { activeStep = 'step2'; paint(); });
    const b2 = container.querySelector('#evalStep2Back');
    if (b2) b2.addEventListener('click', () => { activeStep = 'step1'; paint(); });
    const c2 = container.querySelector('#evalStep2Continue');
    if (c2) c2.addEventListener('click', () => { activeStep = 'step3'; paint(); });
  }

  function wireAccordions() {
    const s1 = container.querySelector('#evalStep1Accordion');
    if (s1) { s1.innerHTML = openSections.has('addMoreEvalRules') ? renderAddMoreEvalRulesSection(plan) : ''; }
    const s2 = container.querySelector('#evalStep2Accordion');
    if (s2) { s2.innerHTML = openSections.has('customizeMyPlan') ? renderCustomizeMyPlanSection(plan) : ''; }
    const s3math = container.querySelector('#evalSeeTheMath');
    if (s3math) { s3math.innerHTML = openSections.has('seeTheMath') ? renderSeeTheMathSection(plan, formulaVisible) : ''; }
    const s3whatif = container.querySelector('#evalExploreWhatIf');
    if (s3whatif) { s3whatif.innerHTML = openSections.has('exploreWhatIf') ? renderExploreWhatIfSection(plan, activeScenarioKey, batchResult) : ''; }

    container.querySelectorAll('[data-toggle-section]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.toggleSection;
        if (openSections.has(key)) openSections.delete(key); else openSections.add(key);
        paint();
      });
    });
  }

  function wireWelcomeBack() {
    const continueBtn = container.querySelector('#evalContinuePlanBtn');
    if (continueBtn) continueBtn.addEventListener('click', () => { viewMode = 'result-only'; activeStep = 'step3'; paint(); });

    const updateBtn = container.querySelector('#evalUpdateProgressBtn');
    if (updateBtn) updateBtn.addEventListener('click', () => {
      const body = openModal(`
        <div class="section-title" style="margin-bottom:14px;">Update Progress</div>
        ${fieldRow('Current Account Balance ($)', `<input class="field-input" type="number" id="evalModalBalance" value="${plan.currentBalance ?? plan.startingBalance ?? ''}">`)}
        <div style="margin-top:14px;">${fieldRow('Trading Days Completed So Far', `<input class="field-input" type="number" min="0" id="evalModalDays" value="${plan.tradingDaysElapsed ?? 0}">`)}</div>
        <button type="button" class="dd-primary-btn" id="evalModalSave" style="margin-top:18px;">Save Progress</button>`);
      body.querySelector('#evalModalSave').addEventListener('click', async () => {
        const currentBalance = Number(body.querySelector('#evalModalBalance').value) || 0;
        const tradingDaysElapsed = Number(body.querySelector('#evalModalDays').value) || 0;
        try {
          const updated = await helpers.onUpdateProgress(currentBalance, tradingDaysElapsed);
          plan = updated;
          closeModal();
          showDeskToast('Progress updated ✦');
          paint();
        } catch (err) {
          console.error('Update progress error:', err);
          alert("Couldn't update progress — try again in a moment.");
        }
      });
    });

    const createBtn = container.querySelector('#evalCreateAnotherBtn');
    if (createBtn) createBtn.addEventListener('click', helpers.onCreateAnother);
  }

  function wireStep3Actions() {
    const saveBtn = container.querySelector('#evalSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      try {
        const updated = await helpers.onSaveExplicit(plan);
        plan = updated;
        showDeskToast(updated.isActive ? 'Saved ✦ — this is now your active plan' : 'Saved ✦');
        paint();
      } catch (err) {
        console.error('Save plan error:', err);
        alert("Couldn't save this plan — try again in a moment.");
      }
    });
    const adjustBtn = container.querySelector('#evalAdjustBtn');
    if (adjustBtn) adjustBtn.addEventListener('click', () => { viewMode = 'wizard'; activeStep = 'step1'; paint(); });
    const startOverBtn = container.querySelector('#evalStartOverBtn');
    if (startOverBtn) startOverBtn.addEventListener('click', helpers.onReset);
  }

  paint();
  return {
    getState: () => plan,
    setSaveStatus: (status) => { helpers.saveStatus = status; const el = container.querySelector('#evalSaveStatus'); if (el) el.textContent = saveStatusText(status); },
    applySavedFields: (saved) => { plan = { ...plan, id: saved.id, status: saved.status, createdAt: saved.createdAt }; },
    setActualVsPlanned: (avp) => { helpers.actualVsPlanned = avp; if (activeStep === 'step3') paint(); },
  };
}
