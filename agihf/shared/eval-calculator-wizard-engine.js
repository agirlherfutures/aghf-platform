/**
 * eval-calculator-wizard-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Pass Your Eval Calculator. A new member answers five
 * short questions, one per screen (account, target, drawdown, risk, days).
 * After that the plan lives on one screen: a "write your plan" sentence
 * whose blanks she can change, next to a live pass-plan card. Everything is
 * entered in dollars; picking an instrument just adds the points.
 * Presentation only — every number comes from eval-calculator-math.js.
 *
 * State model: one continuous `plan` object. Every change goes through
 * helpers.onChange (autosave, owned by eval-calculator.html); typing in a
 * blank refreshes the plan card without repainting the inputs.
 */

import { INSTRUMENT_SYMBOLS } from './instrument-data.js';
import { openModal, closeModal, showDeskToast } from './dayli-desk-engine.js';
import { DISCLAIMER, PRESET_NOTE, DRAWDOWN_TYPES, PLAN_RISK_STATUS_COPY } from './eval-copy.js';
import {
  EVAL_PRESETS, GUIDED, PLAN_COPY, SECTION_LABELS, RESULT_NOTE, NEED_MORE_INFO, WELCOME_BACK,
  resultHeadline, MATH_FORMULA_LABELS,
} from './eval-calculator-copy.js';
import {
  resolvePointValue, computeRiskPerTrade, computeRewardPerTrade, computePlannedRR,
  computeProfitTargetDollar, computeRemainingProfitTarget,
  computeDrawdownLimitDollar, computeRemainingDrawdown, computeDrawdownUsagePerLoss,
  computeMaxLossesRemaining, computeExpectedValuePerTrade, computeEstimatedNetPerDay,
  computeEstimatedTradingDaysRange, classifyPlanRiskStatus, WHAT_IF_SCENARIOS,
  runScenarioBatch,
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

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const DEFAULT_WIN_RATE = 45;
const roundTo25 = (n) => Math.max(25, Math.round(n / 25) * 25);

/** Losses she plans to stop at in a day (her own setting, else every trade). */
function lossesPerDay(plan) {
  return plan.maxLossesPerDay || plan.maxTradesPerDay || 1;
}

/** Dollar risk/reward as points on her instrument, when she picked one. */
function pointsText(plan, dollars) {
  const pv = resolvePointValue({ ...plan, riskMode: 'points' });
  if (!pv || !dollars) return null;
  const pts = dollars / (pv * (plan.contractsPlanned || 1));
  return `${pts >= 10 ? Math.round(pts) : Math.round(pts * 4) / 4} pts`;
}

/** A plan has everything the pass-plan card needs. */
function isPlanComplete(plan) {
  return !!(plan.profitTargetValue && plan.riskPerTradeValue && plan.rewardPerTradeValue
    && (plan.drawdownValue || plan.drawdownType === 'unknown'));
}

/* ── Guided questions (first visit) ───────────────────────────────── */

const GUIDED_STEPS = ['account', 'target', 'drawdown', 'risk', 'days'];

function presetFor(plan) {
  return EVAL_PRESETS.find((p) => p.size === plan.accountSize && !plan.isCustomAccount) || null;
}

function choice(attrs, title, sub, active) {
  return `<button type="button" class="ev-choice ${active ? 'active' : ''}" ${attrs}><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</button>`;
}

function moneyInput(field, value, opts = {}) {
  return `<label class="ev-money ${opts.small ? 'sm' : ''}"><i>$</i><input type="number" inputmode="decimal" min="0" data-live-field="${field}" value="${value ?? ''}" placeholder="${opts.placeholder || ''}" aria-label="${opts.label || field}"></label>`;
}

function riskHint(plan) {
  const dd = computeDrawdownLimitDollar(plan);
  const risk = Number(plan.riskPerTradeValue);
  if (!risk) return '';
  if (!dd) return `You’d risk ${fmtMoney(risk)} each trade.`;
  const pct = (risk / dd) * 100;
  const losses = Math.floor(dd / risk);
  return `That’s ${fmtPct(pct)} of your ${fmtMoney(dd)} cushion per loss, or room for about ${losses} loss${losses === 1 ? '' : 'es'}.${pct > 15 ? ' That’s a big bite; a smaller number gives you more room.' : ''}`;
}

function renderGuided(plan, stepIndex) {
  const key = GUIDED_STEPS[stepIndex];
  const q = GUIDED[key];
  const preset = presetFor(plan);
  let body = '';

  if (key === 'account') {
    body = `<div class="ev-choices">
        ${EVAL_PRESETS.map((p) => choice(`data-guided-preset="${p.size}"`, p.label, `Target ${fmtMoney(p.target)}`, preset?.size === p.size)).join('')}
        ${choice('data-guided-preset="custom"', 'Other', 'Type your own', plan.isCustomAccount)}
      </div>
      ${plan.isCustomAccount ? `<div style="margin-top:14px;">${moneyInput('accountSize', plan.accountSize, { label: 'Account size' })}</div>` : ''}
      <div class="ev-hint">${PRESET_NOTE}</div>`;
  } else if (key === 'target') {
    body = `${moneyInput('profitTargetValue', plan.profitTargetValue, { placeholder: '3000', label: 'Profit target' })}
      <div class="ev-hint">${preset ? `Most ${preset.label} evals ask for about ${fmtMoney(preset.target)}.` : 'Use the number your firm gives you.'}</div>`;
  } else if (key === 'drawdown') {
    body = `${moneyInput('drawdownValue', plan.drawdownValue, { placeholder: '2000', label: 'Max drawdown' })}
      <div class="ev-hint">${preset ? `Most ${preset.label} evals give you about ${fmtMoney(preset.drawdown)}.` : 'Use the number your firm gives you.'} If your firm’s drawdown trails your balance, you can set that under More Rules &amp; Settings later.</div>`;
  } else if (key === 'risk') {
    const dd = computeDrawdownLimitDollar(plan) || 2000;
    const picks = [...new Set([roundTo25(dd / 20), roundTo25(dd / 13), roundTo25(dd / 8)])];
    const labels = ['Extra careful', 'Steady', 'Faster, less room'];
    const risk = Number(plan.riskPerTradeValue) || null;
    const x = risk && plan.rewardPerTradeValue ? plan.rewardPerTradeValue / risk : null;
    body = `<div class="ev-choices">
        ${picks.map((v, i) => choice(`data-guided-risk="${v}"`, fmtMoney(v), labels[i], risk === v)).join('')}
      </div>
      ${moneyInput('riskPerTradeValue', risk, { small: true, label: 'Risk per trade' })}
      <div class="ev-hint" id="evRiskHint">${riskHint(plan)}</div>
      <div class="ev-q-mini">${q.rewardTitle}</div>
      <div class="ev-choices" id="evRewardChoices">${rewardChoices(risk, x)}</div>`;
  } else if (key === 'days') {
    const days = plan.maxTradingDays;
    const trades = plan.maxTradesPerDay;
    body = `<div class="ev-choices">
        ${[[10, 'About 2 weeks'], [20, 'About a month'], [30, 'Slow and steady']].map(([n, sub]) => choice(`data-guided-days="${n}"`, `${n} days`, sub, days === n)).join('')}
      </div>
      <div class="ev-hint">Or type your own: <input type="number" min="1" class="field-input" style="display:inline-block;width:90px;padding:6px 10px;" data-live-field="maxTradingDays" value="${days ?? ''}" aria-label="Trading days"> trading days</div>
      <div class="ev-q-mini">${q.tradesTitle}</div>
      <div class="ev-choices">
        ${[[1, 'One and done'], [2, 'A second chance'], [3, 'Up to three']].map(([n, sub]) => choice(`data-guided-trades="${n}"`, `${n}`, sub, trades === n)).join('')}
      </div>`;
  }

  const last = stepIndex === GUIDED_STEPS.length - 1;
  return `
    <div class="ev-q">
      <div class="ev-dots">${GUIDED_STEPS.map((_, i) => `<span class="${i <= stepIndex ? 'on' : ''}"></span>`).join('')}</div>
      <div class="pg-eye">Question ${stepIndex + 1} of ${GUIDED_STEPS.length}</div>
      <div class="ev-q-title">${q.title}</div>
      <p class="ev-q-sub">${q.sub}</p>
      ${body}
      <div class="ev-hint warn" id="evGuidedError" hidden></div>
      <div class="ev-q-nav">
        ${stepIndex > 0 ? '<button type="button" class="dd-secondary-btn" id="evGuidedBack">← Back</button>' : '<span></span>'}
        <button type="button" class="dd-primary-btn" id="evGuidedNext">${last ? 'Build my plan ✦' : 'Next →'}</button>
      </div>
      ${isPlanComplete(plan) ? '<button type="button" class="ev-skip" id="evGuidedSkip">Skip to my plan</button>' : ''}
    </div>`;
}

function rewardChoices(risk, x) {
  return [1.5, 2, 3].map((m) => choice(`data-guided-rr="${m}"`, `${m}×`, risk ? `${fmtMoney(risk * m)} a win` : '', x != null && Math.abs(x - m) < 0.01)).join('');
}

/** What each question needs before Next. Returns an error message or null. */
function guidedError(plan, key) {
  if (key === 'account' && !(plan.accountSize > 0)) return 'Pick an account size to keep going.';
  if (key === 'target' && !(plan.profitTargetValue > 0)) return 'Add your profit target to keep going.';
  if (key === 'drawdown' && !(plan.drawdownValue > 0)) return 'Add your max drawdown to keep going.';
  if (key === 'risk' && !(plan.riskPerTradeValue > 0)) return 'Pick how much you’ll risk per trade.';
  if (key === 'risk' && !(plan.rewardPerTradeValue > 0)) return 'Pick how much you aim to make when you win.';
  if (key === 'days' && !(plan.maxTradingDays > 0)) return 'Pick how many days you want to give it.';
  if (key === 'days' && !(plan.maxTradesPerDay > 0)) return 'Pick the most trades you’ll take in a day.';
  return null;
}

/* ── Write your plan (one screen) ─────────────────────────────────── */

function blank(field, value, opts = {}) {
  return `<span class="ev-blank ${opts.teal ? 't' : ''}">${opts.money === false ? '' : '$'}<input type="number" inputmode="decimal" min="${opts.min ?? 0}" class="${opts.short ? 'short' : ''}" data-live-field="${field}" value="${value ?? ''}" aria-label="${opts.label}"></span>`;
}

function renderWritePlan(plan, ctx) {
  const preset = presetFor(plan);
  const accountSelect = `<span class="ev-blank"><select data-plan-preset aria-label="Account size">
      ${EVAL_PRESETS.map((p) => `<option value="${p.size}" ${preset?.size === p.size ? 'selected' : ''}>${p.label}</option>`).join('')}
      <option value="custom" ${preset ? '' : 'selected'}>other</option>
    </select></span>`;
  const tradesSelect = `<span class="ev-blank t"><select data-live-select="maxTradesPerDay" aria-label="Trades per day">
      ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${Number(plan.maxTradesPerDay) === n ? 'selected' : ''}>${n}</option>`).join('')}
    </select></span>`;
  const unknownDd = plan.drawdownType === 'unknown';

  return `
    <div class="ev-write">
      <div class="pg-eye">${PLAN_COPY.writeEyebrow}</div>
      <div class="ev-write-title">${PLAN_COPY.writeTitle}</div>
      <div class="small-help">${PLAN_COPY.writeSub}</div>
      <div class="ev-split">
        <div>
          <div class="ev-sentence">
            I’m passing a ${accountSelect}${preset ? '' : ` ${blank('accountSize', plan.accountSize, { label: 'Account size' })}`} eval.
            I need to make ${blank('profitTargetValue', plan.profitTargetValue, { label: 'Profit target' })}
            ${unknownDd ? 'and I’m not sure of my max drawdown yet.' : `and I can’t lose more than ${blank('drawdownValue', plan.drawdownValue, { label: 'Max drawdown' })}.`}
            On each trade I’ll risk ${blank('riskPerTradeValue', plan.riskPerTradeValue, { teal: true, label: 'Risk per trade' })}
            to make ${blank('rewardPerTradeValue', plan.rewardPerTradeValue, { teal: true, label: 'Reward per win' })},
            take at most ${tradesSelect} trade${Number(plan.maxTradesPerDay) === 1 ? '' : 's'} a day,
            and give myself ${blank('maxTradingDays', plan.maxTradingDays, { teal: true, money: false, short: true, min: 1, label: 'Trading days' })} trading days.
          </div>
          <div class="ev-inst">
            Want it in points? I trade
            <select data-live-select="instrument" aria-label="Instrument">
              <option value="">pick one</option>
              ${INSTRUMENT_SYMBOLS.map((sym) => `<option value="${sym}" ${plan.instrument === sym ? 'selected' : ''}>${sym}</option>`).join('')}
            </select>
            with
            <select data-live-select="contractsPlanned" aria-label="Contracts">
              ${[1, 2, 3, 4, 5, 6, 8, 10].map((n) => `<option value="${n}" ${Number(plan.contractsPlanned || 1) === n ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            contract${Number(plan.contractsPlanned || 1) === 1 ? '' : 's'}.
          </div>
        </div>
        <div id="evalPlanCard">${renderPlanCard(plan)}</div>
      </div>
      <div class="ev-more">
        <div class="eval-accordion-header"><span class="eval-accordion-label">${SECTION_LABELS.moreSettings}</span>${toggleBtn('moreSettings', ctx.openSections.has('moreSettings'))}</div>
        <div id="evalMoreSettings"></div>
      </div>
      ${renderActualVsPlannedSection(ctx.actualVsPlanned)}

      <div class="eval-accordion-section" style="margin-top:20px;">
        <div class="eval-accordion-header"><span class="eval-accordion-label">${SECTION_LABELS.seeTheMath}</span>${toggleBtn('seeTheMath', ctx.openSections.has('seeTheMath'))}</div>
      </div>
      <div id="evalSeeTheMath"></div>
      <div class="eval-accordion-section" style="margin-top:12px;">
        <div class="eval-accordion-header"><span class="eval-accordion-label">${SECTION_LABELS.exploreWhatIf}</span>${toggleBtn('exploreWhatIf', ctx.openSections.has('exploreWhatIf'))}</div>
      </div>
      <div id="evalExploreWhatIf"></div>

      <div class="eval-step3-actions">
        <div class="eval-step3-secondary" style="margin-top:0;">
          <button type="button" class="cl-delete-link" id="evalGuidedAgainBtn">Walk me through it again</button>
          <button type="button" class="cl-delete-link" id="evalStartOverBtn">Start Over</button>
          <a class="cl-delete-link" href="journal-history.html?view=calendar">View My Trading Calendar</a>
        </div>
      </div>
    </div>`;
}

/** The live pass-plan card. Every number comes from eval-calculator-math.js. */
function renderPlanCard(input) {
  const plan = input.assumedWinRatePct == null ? { ...input, assumedWinRatePct: DEFAULT_WIN_RATE } : input;
  if (!isPlanComplete(plan)) {
    return `<div class="ev-plan"><div class="ev-plan-eye">${PLAN_COPY.cardEyebrow}</div>
      <div class="ev-plan-head">Fill in the blanks to see your plan.</div>
      <div class="small-help">Add your target, what you’ll risk and what you aim to make.</div></div>`;
  }
  const target = computeProfitTargetDollar(plan);
  const remaining = computeRemainingProfitTarget(plan);
  const ddLimit = computeDrawdownLimitDollar(plan);
  const risk = computeRiskPerTrade(plan);
  const reward = computeRewardPerTrade(plan);
  const rr = computePlannedRR(plan);
  const winsNeeded = remaining != null && reward ? Math.ceil(remaining / reward) : null;
  const maxLosses = computeMaxLossesRemaining(plan);
  const range = computeEstimatedTradingDaysRange(plan);
  const days = Number(plan.maxTradingDays) || null;
  const dailyGoal = days && remaining != null ? remaining / days : null;
  const { status } = classifyPlanRiskStatus(plan);
  const copy = PLAN_RISK_STATUS_COPY[status];
  const winRate = plan.assumedWinRatePct ?? DEFAULT_WIN_RATE;
  const stopLosses = lossesPerDay(plan);
  const riskPts = pointsText(plan, risk);
  const rewardPts = pointsText(plan, reward);

  let paceNote = '';
  if (range.expected == null) {
    paceNote = `<div class="ev-note heads">💡 At a ${winRate}% win rate this plan doesn’t grow the account on average. Try aiming for a bigger win, or risking less per trade.</div>`;
  } else if (days && range.expected > days) {
    paceNote = `<div class="ev-note heads">💡 You’re giving it ${days} days. At a ${winRate}% win rate, this plan’s estimated pace is about ${range.expected} trading days. Try giving it more days or aiming for a bigger win, but don’t risk more to rush it.</div>`;
  } else if (days) {
    paceNote = `<div class="ev-note ok">✓ Your ${days} days fit this plan’s estimated pace (about ${range.expected} trading days).</div>`;
  }

  const rules = [
    `Risk <b>${fmtMoney(risk)}</b> per trade${riskPts ? ` (${plan.contractsPlanned || 1} ${esc(plan.instrument)}: stop <b>${riskPts}</b>)` : ''}.`,
    `Aim for <b>${fmtMoney(reward)}</b> when you win${rr ? ` (${Math.round(rr * 100) / 100}× your risk)` : ''}${rewardPts ? `: target <b>${rewardPts}</b>` : ''}.`,
    `Take at most <b>${plan.maxTradesPerDay || 1} trade${(plan.maxTradesPerDay || 1) === 1 ? '' : 's'}</b> a day.`,
    `Done for the day after <b>${stopLosses} loss${stopLosses === 1 ? '' : 'es'}</b> (−${fmtMoney(risk * stopLosses)})${plan.stopAfterWin ? ' or after your <b>first win</b>' : ''}.`,
  ];
  if (maxLosses != null) rules.push(`A loss is part of the plan. You have room for <b>${maxLosses}</b> of them.`);
  if (plan.dailyLossLimit && risk * stopLosses > plan.dailyLossLimit) {
    rules.push(`⚠ ${stopLosses} losses (${fmtMoney(risk * stopLosses)}) is more than your ${fmtMoney(plan.dailyLossLimit)} daily loss limit. Take fewer trades or risk less.`);
  }
  if (plan.minTradingDays) rules.push(`Your firm asks for at least <b>${plan.minTradingDays}</b> trading days.`);

  return `
    <div class="ev-plan">
      <div class="ev-plan-eye">${PLAN_COPY.cardEyebrow}</div>
      <div class="ev-plan-head">Make ${fmtMoney(remaining ?? target)}.${ddLimit != null ? ` Protect ${fmtMoney(computeRemainingDrawdown(plan))}.` : ''}</div>
      <span class="ev-badge tone-${copy.tone}">${resultHeadline(copy.label)}</span>
      <div class="ev-grid">
        <div class="ev-stat"><small>Daily goal</small><b>${dailyGoal != null ? fmtMoney(dailyGoal) : '—'}</b><span>${days ? `over ${days} trading days` : 'add your days'}</span></div>
        <div class="ev-stat"><small>Wins needed</small><b>${winsNeeded ?? '—'}</b><span>at ${fmtMoney(reward)} each</span></div>
        <div class="ev-stat"><small>Room for losses</small><b>${maxLosses ?? '—'}</b><span>${maxLosses != null ? `at ${fmtMoney(risk)} each` : 'add your drawdown'}</span></div>
        <div class="ev-stat"><small>Estimated pace</small><b>${range.expected != null ? `~${range.expected}` : '—'}</b><span>trading days*</span></div>
      </div>
      ${paceNote}
      <div class="ev-rules-eye">Your rules</div>
      <ul class="ev-rules">${rules.map((r) => `<li>${r}</li>`).join('')}</ul>
      <div style="margin-top:14px;"><button type="button" class="dd-primary-btn" id="evalSaveBtn" style="width:100%;">${plan.isActive ? 'Save my plan ✦' : 'Save as my plan ✦'}</button></div>
      <p class="ev-fine">*${RESULT_NOTE} It assumes a ${winRate}% win rate (change it under More Rules &amp; Settings). Your results will vary.</p>
    </div>`;
}

function renderMoreSettingsSection(plan) {
  const currentPl = plan.currentBalance != null ? plan.currentBalance - (plan.startingBalance ?? 0) : null;
  return `
    <div class="section-card" style="margin-top:10px;">
      <div class="section-body">
        <div class="field-row cols-2">
          ${fieldRow('Estimated Win Rate (%)', `<input class="field-input" type="number" min="0" max="100" data-field="assumedWinRatePct" value="${plan.assumedWinRatePct ?? DEFAULT_WIN_RATE}">`, 'Not sure? 45% is a careful starting point. Your journal shows your real one over time.')}
          ${fieldRow('Stop for the day after this many losses', `<input class="field-input" type="number" min="1" data-field="maxLossesPerDay" value="${plan.maxLossesPerDay ?? ''}" placeholder="${plan.maxTradesPerDay || 1}">`)}
        </div>
        <div class="field-group" style="margin-top:12px;">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" data-field-bool="stopAfterWin" ${plan.stopAfterWin ? 'checked' : ''}> Stop for the day after my first win
          </label>
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:8px;">
            <input type="checkbox" data-field-bool="reduceSizeAfterLoss" ${plan.reduceSizeAfterLoss ? 'checked' : ''}> Trade smaller after a loss
          </label>
        </div>
        ${plan.reduceSizeAfterLoss ? fieldRow('Contracts on the trade after a loss', `<input class="field-input" type="number" min="1" data-field="secondTradeContractSize" value="${plan.secondTradeContractSize ?? ''}">`, `Compared with the ${plan.contractsPlanned || 1} contract${(plan.contractsPlanned || 1) === 1 ? '' : 's'} in your plan above.`) : ''}

        <div class="field-group" style="margin-top:16px;"><label class="field-label">How your firm measures drawdown</label>
          ${chipGroupHtml({ mode: 'single', field: 'drawdownType', value: plan.drawdownType, options: DRAWDOWN_TYPES.map((d) => ({ value: d.key, label: d.label })) })}
          <div class="small-help" style="margin-top:6px;">${DRAWDOWN_TYPES.find((d) => d.key === plan.drawdownType)?.help || ''}</div>
        </div>
        ${plan.drawdownType === 'other' ? fieldRow('Describe how your firm measures drawdown', `<textarea class="field-textarea short" data-field="notes">${esc(plan.notes)}</textarea>`) : ''}
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Daily Loss Limit ($)', `<input class="field-input" type="number" min="0" data-field="dailyLossLimit" value="${plan.dailyLossLimit ?? ''}">`)}
          ${fieldRow('Consistency Rule (%)', `<input class="field-input" type="number" min="0" max="100" data-field="consistencyRulePct" value="${plan.consistencyRulePct ?? ''}">`, 'The most of your total profit one day may be, if your firm has this rule.')}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Minimum Trading Days', `<input class="field-input" type="number" min="0" data-field="minTradingDays" value="${plan.minTradingDays ?? ''}">`)}
          ${fieldRow('Fees ($ per trade)', `<input class="field-input" type="number" min="0" step="0.01" data-field="feesPerTrade" value="${plan.feesPerTrade ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Current Balance ($)', `<input class="field-input" type="number" data-field="currentBalance" value="${plan.currentBalance ?? ''}">`, currentPl != null ? `That’s ${fmtMoney(currentPl)} so far.` : 'Already started? Add your balance to plan from where you are.')}
          ${fieldRow('Starting Balance ($)', `<input class="field-input" type="number" min="0" data-field="startingBalance" value="${plan.startingBalance ?? ''}">`)}
        </div>
        <div class="field-row cols-2" style="margin-top:14px;">
          ${fieldRow('Plan Name', `<input class="field-input" type="text" data-field="name" value="${esc(plan.name)}" placeholder="e.g. My 50K Eval Plan">`)}
          <div></div>
        </div>
      </div>
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

/**
 * Older plans entered stop/target in points. The pass plan works in
 * dollars, so convert them once (keeping the instrument for the points
 * line) — or clear them if there's no point value to convert with.
 */
function toDollarPlan(plan) {
  if (plan.riskMode === 'dollars') return null;
  const next = { ...plan, riskMode: 'dollars' };
  if (plan.riskPerTradeValue != null || plan.rewardPerTradeValue != null) {
    next.riskPerTradeValue = computeRiskPerTrade(plan);
    next.rewardPerTradeValue = computeRewardPerTrade(plan);
  }
  return next;
}

/**
 * Orchestrates the whole eval plan editor. `helpers`:
 * { onChange(nextPlan), onReset(), onSaveExplicit(plan)->Promise<plan>,
 *   onUpdateProgress(currentBalance,tradingDaysElapsed)->Promise<plan>,
 *   onCreateAnother(), saveStatus, actualVsPlanned, initialViewMode }
 *
 * Views: 'guided' (one question per screen, for a new or unfinished
 * plan), 'plan' (the one-screen "write your plan" sentence + live plan
 * card) and 'welcome-back'.
 */
export function renderEvalCalculatorPage(container, plan, helpers) {
  const converted = toDollarPlan(plan);
  // Saved on the next tick: the page only gets its handle once this returns.
  if (converted) { plan = converted; setTimeout(() => helpers.onChange(plan), 0); }

  let viewMode = helpers.initialViewMode === 'welcome-back' ? 'welcome-back' : (isPlanComplete(plan) ? 'plan' : 'guided');
  let guidedStep = 0;
  let activeScenarioKey = null;
  let batchResult = null;
  const formulaVisible = new Set();
  const openSections = new Set();

  function update(next) {
    plan = next;
    helpers.onChange(plan);
    paint();
  }

  /** Typing in a blank: save and refresh the live parts, but don't repaint
   * the inputs (that would steal focus mid-number). */
  function liveUpdate(next) {
    plan = next;
    helpers.onChange(plan);
    const card = container.querySelector('#evalPlanCard');
    if (card) { card.innerHTML = renderPlanCard(plan); wireStep3Actions(); }
    const hint = container.querySelector('#evRiskHint');
    if (hint) hint.textContent = riskHint(plan);
    const rr = container.querySelector('#evRewardChoices');
    if (rr) {
      const risk = Number(plan.riskPerTradeValue) || null;
      rr.innerHTML = rewardChoices(risk, risk && plan.rewardPerTradeValue ? plan.rewardPerTradeValue / risk : null);
      wireGuided();
    }
    paintAccordions(false);
  }

  function paint() {
    let bodyHtml;
    if (viewMode === 'welcome-back') bodyHtml = renderWelcomeBackCard(plan);
    else if (viewMode === 'guided') bodyHtml = renderGuided(plan, guidedStep);
    else bodyHtml = renderWritePlan(plan, { openSections, actualVsPlanned: helpers.actualVsPlanned });

    container.innerHTML = `
      <div class="eval-wizard-shell ${viewMode === 'plan' ? 'wide' : ''}">
        ${viewMode !== 'welcome-back' ? `<div class="eval-step-topbar" style="justify-content:flex-end;margin-bottom:10px;">
          <span class="cl-nav-status" id="evalSaveStatus">${saveStatusText(helpers.saveStatus)}</span>
        </div>` : ''}
        ${bodyHtml}
      </div>`;

    paintAccordions(true);
    wireFields();
    wireGuided();
    wireWelcomeBack();
    wireStep3Actions();
  }

  function saveStatusText(status) {
    return status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';
  }

  function numberOrNull(v) { return v === '' || v == null ? null : Number(v); }

  function wireFields() {
    container.querySelectorAll('[data-field]').forEach((el) => {
      const commit = () => {
        const field = el.dataset.field;
        let value = el.value;
        if (el.type === 'number') value = numberOrNull(value);
        update({ ...plan, [field]: value });
      };
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', commit);
    });

    container.querySelectorAll('[data-live-field]').forEach((el) => {
      el.addEventListener('input', () => {
        const field = el.dataset.liveField;
        const value = numberOrNull(el.value);
        const next = { ...plan, [field]: value };
        if (field === 'accountSize') next.startingBalance = value;
        liveUpdate(next);
      });
    });

    container.querySelectorAll('[data-live-select]').forEach((el) => {
      el.addEventListener('change', () => {
        const field = el.dataset.liveSelect;
        const value = field === 'instrument' ? (el.value || null) : Number(el.value);
        update({ ...plan, [field]: value });
      });
    });

    const presetSelect = container.querySelector('[data-plan-preset]');
    if (presetSelect) presetSelect.addEventListener('change', () => update(applyPreset(plan, presetSelect.value)));

    container.querySelectorAll('[data-field-bool]').forEach((el) => {
      el.addEventListener('change', () => update({ ...plan, [el.dataset.fieldBool]: el.checked }));
    });

    container.querySelectorAll('[data-chip-single]').forEach((group) => {
      const field = group.dataset.chipSingle;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => update({ ...plan, [field]: btn.dataset.chipValue }));
      });
    });

    wireSections(container);
  }

  /** What-if chips, the simulation button and formula toggles — inside the
   * See the Math / What-If sections, which a live update re-renders. */
  function wireSections(root) {
    const whatIfGroup = root.querySelector('[data-whatif-group]');
    if (whatIfGroup) {
      whatIfGroup.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeScenarioKey = activeScenarioKey === btn.dataset.whatifKey ? null : btn.dataset.whatifKey;
          paint();
        });
      });
    }

    const runBatchBtn = root.querySelector('#evalRunBatchBtn');
    if (runBatchBtn) {
      runBatchBtn.addEventListener('click', () => {
        batchResult = runScenarioBatch(withWinRate(plan), { trials: 200, seed: 42 });
        paint();
      });
    }

    root.querySelectorAll('[data-toggle-formula]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.toggleFormula;
        if (formulaVisible.has(key)) formulaVisible.delete(key); else formulaVisible.add(key);
        paint();
      });
    });
  }

  /** Picking an account size pre-fills that size's example target and drawdown. */
  function applyPreset(p, value) {
    if (value === 'custom') return { ...p, isCustomAccount: true };
    const preset = EVAL_PRESETS.find((x) => x.size === Number(value));
    return {
      ...p, isCustomAccount: false, accountSize: preset.size, startingBalance: preset.size,
      profitTargetType: 'fixed_amount', profitTargetValue: preset.target, drawdownValue: preset.drawdown,
      drawdownType: p.drawdownType === 'unknown' ? 'static' : p.drawdownType,
    };
  }

  function withWinRate(p) {
    return p.assumedWinRatePct == null ? { ...p, assumedWinRatePct: DEFAULT_WIN_RATE } : p;
  }

  function wireGuided() {
    container.querySelectorAll('[data-guided-preset]').forEach((btn) => {
      btn.onclick = () => update(applyPreset(plan, btn.dataset.guidedPreset));
    });
    container.querySelectorAll('[data-guided-risk]').forEach((btn) => {
      btn.onclick = () => {
        const risk = Number(btn.dataset.guidedRisk);
        const x = plan.riskPerTradeValue && plan.rewardPerTradeValue ? plan.rewardPerTradeValue / plan.riskPerTradeValue : 2;
        update({ ...plan, riskMode: 'dollars', riskPerTradeValue: risk, rewardPerTradeValue: Math.round(risk * x) });
      };
    });
    container.querySelectorAll('[data-guided-rr]').forEach((btn) => {
      btn.onclick = () => {
        const risk = Number(plan.riskPerTradeValue);
        if (!risk) return;
        update({ ...plan, riskMode: 'dollars', rewardPerTradeValue: Math.round(risk * Number(btn.dataset.guidedRr)) });
      };
    });
    container.querySelectorAll('[data-guided-days]').forEach((btn) => {
      btn.onclick = () => update({ ...plan, maxTradingDays: Number(btn.dataset.guidedDays) });
    });
    container.querySelectorAll('[data-guided-trades]').forEach((btn) => {
      btn.onclick = () => update({ ...plan, maxTradesPerDay: Number(btn.dataset.guidedTrades) });
    });

    const next = container.querySelector('#evGuidedNext');
    if (next) next.onclick = () => {
      const err = guidedError(plan, GUIDED_STEPS[guidedStep]);
      if (err) {
        const box = container.querySelector('#evGuidedError');
        box.textContent = err; box.hidden = false;
        return;
      }
      if (guidedStep === 0 && plan.profitTargetValue == null && presetFor(plan)) plan = applyPreset(plan, String(plan.accountSize));
      if (guidedStep < GUIDED_STEPS.length - 1) { guidedStep += 1; update(plan); return; }
      update({ ...withWinRate(plan), riskMode: 'dollars' });
      viewMode = 'plan';
      paint();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const back = container.querySelector('#evGuidedBack');
    if (back) back.onclick = () => { guidedStep = Math.max(0, guidedStep - 1); paint(); };
    const skip = container.querySelector('#evGuidedSkip');
    if (skip) skip.onclick = () => { viewMode = 'plan'; paint(); };
  }

  /** Fills the open accordions. `wire` adds the toggle listeners (only on a
   * full paint; a live update just refreshes the open sections' numbers). */
  function paintAccordions(wire) {
    const more = container.querySelector('#evalMoreSettings');
    if (more && wire) more.innerHTML = openSections.has('moreSettings') ? renderMoreSettingsSection(plan) : '';
    const math = container.querySelector('#evalSeeTheMath');
    if (math) math.innerHTML = openSections.has('seeTheMath') ? renderSeeTheMathSection(withWinRate(plan), formulaVisible) : '';
    const whatIf = container.querySelector('#evalExploreWhatIf');
    if (whatIf) whatIf.innerHTML = openSections.has('exploreWhatIf') ? renderExploreWhatIfSection(withWinRate(plan), activeScenarioKey, batchResult) : '';
    if (!wire) { if (math) wireSections(math); if (whatIf) wireSections(whatIf); return; }

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
    if (continueBtn) continueBtn.addEventListener('click', () => { viewMode = isPlanComplete(plan) ? 'plan' : 'guided'; paint(); });

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
    if (saveBtn) saveBtn.onclick = async () => {
      try {
        const updated = await helpers.onSaveExplicit(withWinRate(plan));
        plan = updated;
        showDeskToast(updated.isActive ? 'Saved ✦ — this is now your active plan' : 'Saved ✦');
        paint();
      } catch (err) {
        console.error('Save plan error:', err);
        alert("Couldn't save this plan — try again in a moment.");
      }
    };
    const againBtn = container.querySelector('#evalGuidedAgainBtn');
    if (againBtn) againBtn.onclick = () => { viewMode = 'guided'; guidedStep = 0; paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const startOverBtn = container.querySelector('#evalStartOverBtn');
    if (startOverBtn) startOverBtn.onclick = helpers.onReset;
  }

  paint();
  return {
    getState: () => plan,
    setSaveStatus: (status) => { helpers.saveStatus = status; const el = container.querySelector('#evalSaveStatus'); if (el) el.textContent = saveStatusText(status); },
    applySavedFields: (saved) => { plan = { ...plan, id: saved.id, status: saved.status, createdAt: saved.createdAt }; },
    setActualVsPlanned: (avp) => { helpers.actualVsPlanned = avp; if (viewMode === 'plan') paint(); },
  };
}
