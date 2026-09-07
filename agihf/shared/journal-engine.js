/**
 * journal-engine.js — A Girl & Her Futures™
 *
 * Render layer for the AG&HF Trade Journal — a 7-step guided flow (Trade
 * Details → Execution → Why I Entered → Why I Exited → Mindset → Lesson
 * Logged → Final Review), one screen at a time, chips/toggles over typed
 * text, conditional reveals, autosave, and a visible completion percentage
 * — built to be journaled in ~3-5 minutes without ever showing a member
 * the whole form at once.
 *
 * Every conditional block (the ICC mini-checklist, the early-exit
 * follow-up, the rule-break chips) is just included or omitted from the
 * returned HTML string based on `entry` state at render time — the same
 * `paint()`-fully-re-renders-on-every-`update()` architecture already
 * proven here, no separate show/hide DOM diffing.
 *
 * `computeTradeTotals()` carries forward the corrected long/short P&L math
 * (long = exit − entry, short = entry − exit; point value from an explicit
 * `manualPointValue` override else the selected instrument's default) and
 * now also derives planned risk/reward/R:R from stop-loss/take-profit.
 * `computeExecutionScore()` is a separate, P&L-blind composite — a losing
 * trade that followed every rule can still score 100.
 */

import { getInstrument, INSTRUMENT_SYMBOLS } from './instrument-data.js';
import { showDeskToast } from './dayli-desk-engine.js';
import { JOURNAL_ENTRY_TAGS, EXIT_TAGS, RULE_BREAK_TAGS, EMOTION_OPTIONS_V2, ICC_MINI_CHECKLIST_ITEMS } from './dashboard-models.js';

const STAGES = ['trade', 'execution', 'entered', 'exited', 'mindset', 'lesson', 'review'];
const STAGE_LABELS = { trade: 'Trade', execution: 'Execution', entered: 'Entered', exited: 'Exited', mindset: 'Mindset', lesson: 'Lesson', review: 'Review' };
const SESSIONS = ['Asia', 'London', 'NY AM', 'NY Lunch', 'NY PM'];

const COMING_SOON_BADGES = [
  { icon: '📓', label: 'Trade Historian' },
  { icon: '🎯', label: 'Sniper Discipline' },
  { icon: '🧠', label: 'Mind Over Market' },
  { icon: '🔥', label: '7-Day Journal Streak' },
  { icon: '💎', label: 'Process Over Profit' },
];

/** Negative-signal emotions that dock the emotional-discipline execution-score component. */
const NEGATIVE_DURING = ['Anxious', 'Watching Every Tick', 'Second Guessing', 'Tempted to Exit', 'Tempted to Move Stop', 'Overconfident'];
const NEGATIVE_AFTER = ['Frustrated', 'Regretful', 'Disappointed'];

function fmt(n) { return Number.isFinite(n) ? n.toFixed(2) : ''; }
function fmtMoney(n) { return Number.isFinite(n) ? `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}` : ''; }

export function computeOutcome(netPnl) {
  if (netPnl == null) return null;
  if (netPnl > 0) return 'win';
  if (netPnl < 0) return 'loss';
  return 'breakeven';
}

/** @param {import('./dashboard-models.js').JournalEntryRecord} entry */
export function computeTradeTotals(entry) {
  const instrument = getInstrument(entry.instrument);
  const pointValue = entry.manualPointValue != null && entry.manualPointValue !== ''
    ? Number(entry.manualPointValue)
    : (instrument ? instrument.pointValue : null);
  const entryPrice = entry.entryPrice;
  const direction = entry.direction;
  const exits = entry.exits || [];

  let totalContracts = 0;
  let weightedPoints = 0;
  let grossPnl = 0;
  const computedExits = exits.map((ex) => {
    const contracts = Number(ex.contracts) || 0;
    const exitPrice = ex.exitPrice != null ? Number(ex.exitPrice) : null;
    if (entryPrice == null || exitPrice == null || !contracts || !direction || pointValue == null) {
      return { ...ex, points: null, dollars: null };
    }
    const points = direction === 'long' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    const dollars = points * pointValue * contracts;
    totalContracts += contracts;
    weightedPoints += points * contracts;
    grossPnl += dollars;
    return { ...ex, points, dollars };
  });

  const exceedsPosition = entry.contracts != null && totalContracts > entry.contracts;
  const netPnl = grossPnl - (Number(entry.fees) || 0);

  let plannedRisk = null;
  let plannedReward = null;
  if (pointValue != null && entry.contracts) {
    if (entry.stopLossPoints != null) {
      plannedRisk = Math.abs(entry.stopLossPoints) * pointValue * entry.contracts;
    }
    if (entry.takeProfitPoints != null) {
      plannedReward = Math.abs(entry.takeProfitPoints) * pointValue * entry.contracts;
    }
  }
  const riskRewardRatio = plannedRisk && plannedReward ? plannedReward / plannedRisk : null;
  const rMultiple = plannedRisk ? netPnl / plannedRisk : null;

  return {
    computedExits, totalContracts, exceedsPosition, weightedPoints, grossPnl, netPnl, pointValue,
    plannedRisk, plannedReward, riskRewardRatio, rMultiple,
  };
}

function scoreRiskManagement(entry, totals) {
  if (entry.entryPrice == null) return null;
  if (entry.stopLossPoints == null) return 0;
  if (!entry.outcome || entry.outcome !== 'loss' || totals.plannedRisk == null) return 20;
  const realizedLoss = Math.abs(totals.netPnl || 0);
  return realizedLoss <= totals.plannedRisk * 1.1 ? 20 : 10;
}

function scoreEmotionalDiscipline(entry) {
  const during = entry.emotions?.during || [];
  const after = entry.emotions?.exiting || [];
  if (!during.length && !after.length) return null;
  let flags = 0;
  if (during.some((e) => NEGATIVE_DURING.includes(e))) flags += 1;
  if (after.some((e) => NEGATIVE_AFTER.includes(e))) flags += 1;
  return flags === 0 ? 20 : flags === 1 ? 10 : 0;
}

/**
 * A composite execution-quality score, 0-100, that never references netPnl,
 * grossPnl, or outcome directly (only scoreRiskManagement peeks at outcome,
 * and only to check *whether a stop was honored*, not whether the trade
 * won) — a losing trade that followed every rule can score 100. Components
 * with nothing to grade yet are excluded from the average, not zeroed, so
 * a partially-filled entry doesn't get unfairly punished.
 * @param {import('./dashboard-models.js').JournalEntryRecord} entry
 */
export function computeExecutionScore(entry) {
  const totals = computeTradeTotals(entry);
  const parts = {
    ruleAdherence: entry.ruleCheck === 'yes' ? 20 : entry.ruleCheck === 'mostly' ? 10 : entry.ruleCheck === 'no' ? 0 : null,
    iccCompletion: entry.iccChecklist ? Math.round((Object.values(entry.iccChecklist).filter(Boolean).length / 7) * 20) : null,
    riskManagement: scoreRiskManagement(entry, totals),
    emotionalDiscipline: scoreEmotionalDiscipline(entry),
    setupAlignment: entry.entryTags?.length ? (entry.entryTags.some((t) => t !== 'Other') ? 20 : 0) : null,
  };
  const scored = Object.values(parts).filter((v) => v != null);
  const score = scored.length ? Math.round((scored.reduce((a, b) => a + b, 0) / scored.length / 20) * 100) : null;
  return { score, parts };
}

/** Only the spec's own core-required fields count toward completion — optional fields never inflate it. */
export function computeCompletionPct(entry) {
  const checks = [
    !!entry.tradeDate,
    !!entry.instrument,
    !!entry.direction,
    entry.entryPrice != null,
    (entry.exits || []).some((ex) => ex.exitPrice != null) || !!entry.outcomeOverride,
    !!(entry.entryTags && entry.entryTags.length),
    !!entry.ruleCheck,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function firstIncompleteStage(entry) {
  if (!entry.tradeDate || !entry.instrument || !entry.direction) return 'trade';
  if (entry.entryPrice == null) return 'execution';
  if (!(entry.entryTags && entry.entryTags.length)) return 'entered';
  if (!(entry.exitTags && entry.exitTags.length)) return 'exited';
  if (!entry.emotions || !entry.emotions.entering?.length) return 'mindset';
  if (!(entry.lessons && entry.lessons.length)) return 'lesson';
  return 'review';
}

/** Normalizes plain-string options (value===label) or explicit {value,label} pairs. */
function chipGroupHtml({ mode, field, options, value }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = mode === 'multi' ? (value || []) : null;
  return `<div class="chip-group" data-chip-${mode}="${field}">
    ${opts.map((o) => {
      const active = mode === 'multi' ? selected.includes(o.value) : value === o.value;
      return `<button type="button" class="chip ${active ? 'active' : ''}" data-chip-value="${o.value}">${o.label}</button>`;
    }).join('')}
  </div>`;
}

/* ── Step 1: Trade Details ─────────────────────────────────────────── */

function renderScreenshotUploader(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">📸</div><div><div class="section-title">Chart Screenshot</div><div class="section-sub">Upload the chart you traded so you can review exactly what you saw.</div></div></div>
      <div class="section-body">
        <div class="cl-shot-grid" id="clShotGrid">
          ${(entry.screenshots || []).map((s, i) => `
            <div class="cl-shot-thumb" data-shot-index="${i}">
              <img data-shot-path="${s.path}" alt="Chart screenshot ${i + 1}" src="">
              <button type="button" class="cl-shot-remove" data-remove-shot="${i}" aria-label="Remove screenshot ${i + 1}">✕</button>
            </div>`).join('')}
          <label class="cl-shot-upload">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple id="clShotInput" style="display:none;">
            <span class="upload-icon">📊</span><span class="upload-text">Add screenshot</span><span class="upload-sub">JPEG, PNG, WEBP, or GIF — up to 5MB</span>
          </label>
        </div>
        <div id="clUploadStatus" class="small-help" role="status" aria-live="polite"></div>
      </div>
    </div>`;
}

function renderTradeDetailsStep(entry) {
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">🎯</div><div><div class="section-title">Log Your Trade</div><div class="section-sub">Start with the facts. No judgment — just data.</div></div></div>
      <div class="section-body">
        <div class="field-row cols-4">
          <div class="field-group"><label class="field-label">Trade #</label><input class="field-input" value="${entry.tradeNumber || '— assigned on save'}" readonly></div>
          <div class="field-group"><label class="field-label">Date</label><input class="field-input" type="date" data-field="tradeDate" value="${entry.tradeDate || ''}"></div>
          <div class="field-group"><label class="field-label">Time Entered</label><input class="field-input" type="time" data-field="entryTimeOnly" value="${(entry.entryTime || '').slice(11, 16)}"></div>
          <div class="field-group"><label class="field-label">Session</label>
            <select class="field-input" data-field="session"><option value="">—</option>${SESSIONS.map((s) => `<option ${entry.session === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="field-row cols-4">
          <div class="field-group"><label class="field-label">Instrument</label>
            <select class="field-input" data-field="instrument"><option value="">—</option>${INSTRUMENT_SYMBOLS.map((s) => `<option value="${s}" ${entry.instrument === s ? 'selected' : ''}>${s} — ${getInstrument(s).label}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label class="field-label">Contracts</label><input class="field-input" type="number" min="1" data-field="contracts" value="${entry.contracts ?? ''}"></div>
          <div class="field-group"><label class="field-label">Account / Prop Firm</label><input class="field-input" data-field="accountId" value="${entry.accountId || ''}" placeholder="Optional"></div>
          <div class="field-group"><label class="field-label">Trade Setup / Style</label><input class="field-input" data-field="setupType" value="${entry.setupType || ''}" placeholder="e.g. Dayli ICC"></div>
        </div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Long or Short</label>
            <div class="position-toggle">
              <button type="button" class="position-btn long ${entry.direction === 'long' ? 'active' : ''}" data-direction="long">📈 Long</button>
              <button type="button" class="position-btn short ${entry.direction === 'short' ? 'active' : ''}" data-direction="short">📉 Short</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderScreenshotUploader(entry)}`;
}

/* ── Step 2: Execution ──────────────────────────────────────────────── */

function renderExecutionStep(entry) {
  const totals = computeTradeTotals(entry);
  const exit = (entry.exits && entry.exits[0]) || { contracts: '', exitPrice: '' };
  const instrument = getInstrument(entry.instrument);
  const computed = totals.computedExits[0] || {};
  const outcome = entry.outcomeOverride || computeOutcome(totals.netPnl);
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">📈</div><div><div class="section-title">How Did You Execute?</div></div></div>
      <div class="section-body">
        <div class="field-row cols-3">
          <div class="field-group"><label class="field-label">Entry Price</label><input class="field-input" type="number" step="0.01" data-field="entryPrice" value="${entry.entryPrice ?? ''}"></div>
          <div class="field-group"><label class="field-label">Stop Loss (points)</label><input class="field-input" type="number" min="0" step="0.01" data-field="stopLossPoints" value="${entry.stopLossPoints ?? ''}"></div>
          <div class="field-group"><label class="field-label">Take Profit (points)</label><input class="field-input" type="number" min="0" step="0.01" data-field="takeProfitPoints" value="${entry.takeProfitPoints ?? ''}"></div>
        </div>
        <div class="small-help" style="margin:-6px 0 6px;">Enter Stop Loss and Take Profit as points away from your entry, not the price level (e.g. 20, not 19980).</div>
        <div class="field-row cols-3">
          <div class="field-group"><label class="field-label">Exit Price</label><input class="field-input" type="number" step="0.01" data-exit-field="exitPrice" data-exit-index="0" value="${exit.exitPrice ?? ''}"></div>
          <div class="field-group"><label class="field-label">Exit Contracts</label><input class="field-input" type="number" min="0" step="1" data-exit-field="contracts" data-exit-index="0" value="${exit.contracts ?? entry.contracts ?? ''}"></div>
          <div class="field-group"><label class="field-label">Point Value${instrument ? ' (auto)' : ''}</label><input class="field-input" type="number" step="0.01" data-field="manualPointValue" value="${entry.manualPointValue ?? (instrument ? instrument.pointValue : '')}"></div>
        </div>
        <div class="field-row cols-4" style="margin-top:6px;">
          <div class="field-group"><label class="field-label">Total Points</label><input class="field-input" value="${computed.points != null ? fmt(computed.points) : ''}" placeholder="auto" readonly></div>
          <div class="field-group"><label class="field-label">Profit / Loss</label><input class="field-input" value="${totals.netPnl != null && computed.points != null ? fmtMoney(totals.netPnl) : ''}" placeholder="auto" readonly></div>
          <div class="field-group"><label class="field-label">Planned Risk</label><input class="field-input" value="${totals.plannedRisk != null ? fmtMoney(totals.plannedRisk) : ''}" placeholder="auto" readonly></div>
          <div class="field-group"><label class="field-label">Planned Reward</label><input class="field-input" value="${totals.plannedReward != null ? fmtMoney(totals.plannedReward) : ''}" placeholder="auto" readonly></div>
        </div>
        <div class="field-row cols-2" style="margin-top:6px;">
          <div class="field-group"><label class="field-label">Risk-to-Reward</label><input class="field-input" value="${totals.riskRewardRatio != null ? '1 : ' + totals.riskRewardRatio.toFixed(2) : ''}" placeholder="auto" readonly></div>
          <div class="field-group"><label class="field-label">Outcome</label>
            <div class="outcome-toggle">
              ${['win', 'loss', 'breakeven'].map((o) => `<button type="button" class="outcome-btn outcome-${o === 'breakeven' ? 'be' : o} ${outcome === o ? 'active' : ''}" data-outcome="${o}">${o === 'win' ? '✓ Win' : o === 'loss' ? '✕ Loss' : '≈ Breakeven'}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="field-row" style="margin-top:10px;">
          <div class="field-group"><label class="field-label">Did price hit your original target?</label>
            ${chipGroupHtml({ mode: 'single', field: 'targetHit', value: entry.targetHit, options: [
              { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
              { value: 'still_running', label: 'Still Running' }, { value: 'not_sure', label: 'Not Sure' },
            ] })}
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Step 3: Why I Entered ──────────────────────────────────────────── */

function renderIccMiniChecklist(entry) {
  const state = entry.iccChecklist || {};
  const done = ICC_MINI_CHECKLIST_ITEMS.filter(([key]) => state[key]).length;
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">✦</div><div><div class="section-title">Dayli ICC Checklist</div><div class="section-sub">ICC Alignment: ${done} / ${ICC_MINI_CHECKLIST_ITEMS.length}</div></div></div>
      <div class="section-body">
        <div class="chip-group">
          ${ICC_MINI_CHECKLIST_ITEMS.map(([key, label]) => `<button type="button" class="chip ${state[key] ? 'active' : ''}" data-icc-key="${key}">${state[key] ? '☑' : '☐'} ${label}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderWhyEnteredStep(entry) {
  const hasIcc = (entry.entryTags || []).includes('Dayli ICC Setup');
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">👀</div><div><div class="section-title">Why Did You Enter?</div></div></div>
      <div class="section-body">
        <div class="field-group"><label class="field-label">What did you see?</label>
          ${chipGroupHtml({ mode: 'multi', field: 'entryTags', options: JOURNAL_ENTRY_TAGS, value: entry.entryTags })}
        </div>
        <div class="field-group" style="margin-top:16px;"><label class="field-label">Why did you enter this trade?</label>
          <textarea class="field-textarea short" data-field="entryReasoning" placeholder="Example: Price formed a lower high, consolidated, broke structure and retested my level.">${entry.entryReasoning || ''}</textarea>
        </div>
      </div>
    </div>
    ${hasIcc ? renderIccMiniChecklist(entry) : ''}`;
}

/* ── Step 4: Why I Exited ───────────────────────────────────────────── */

function renderWhyExitedStep(entry) {
  const hasEarlyExit = (entry.exitTags || []).includes('Took Profit Early');
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">📤</div><div><div class="section-title">Why Did You Exit?</div></div></div>
      <div class="section-body">
        <div class="field-group"><label class="field-label">What happened?</label>
          ${chipGroupHtml({ mode: 'multi', field: 'exitTags', options: EXIT_TAGS, value: entry.exitTags })}
        </div>
        <div class="field-group" style="margin-top:16px;"><label class="field-label">What made you close the trade?</label>
          <textarea class="field-textarea short" data-field="exitReasoning" placeholder="Example: Price started bouncing around my zone and I wanted to protect the profit I had already built.">${entry.exitReasoning || ''}</textarea>
        </div>
        ${hasEarlyExit ? `
        <div class="field-group" style="margin-top:16px;"><label class="field-label">Looking back, do you still agree with that exit?</label>
          ${chipGroupHtml({ mode: 'single', field: 'agreeWithEarlyExit', value: entry.agreeWithEarlyExit, options: [
            { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' },
          ] })}
        </div>` : ''}
      </div>
    </div>`;
}

/* ── Step 5: Mindset ────────────────────────────────────────────────── */

function renderMindsetStep(entry) {
  const emotions = entry.emotions || {};
  const stageInfo = [
    ['entering', 'BEFORE THE TRADE', 'How did you feel entering?'],
    ['during', 'DURING THE TRADE', 'How did you feel while the trade was running?'],
    ['exiting', 'AFTER THE TRADE', 'How did you feel when you exited?'],
  ];
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">🧠</div><div><div class="section-title">How Were You Feeling?</div></div></div>
      <div class="section-body">
        ${stageInfo.map(([stage, heading, question]) => `
          <div class="jl-mindset-group">
            <div class="jl-mindset-heading">${heading}</div>
            <div class="field-label" style="margin:6px 0 8px;">${question}</div>
            <div class="chip-group" data-emotion-stage="${stage}">
              ${EMOTION_OPTIONS_V2[stage].map((o) => `<button type="button" class="chip ${(emotions[stage] || []).includes(o) ? 'active' : ''}" data-chip-value="${o}">${o}</button>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ── Step 6: Lesson Logged ──────────────────────────────────────────── */

function renderLessonStep(entry) {
  const lessons = entry.lessons && entry.lessons.length ? entry.lessons : [''];
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-indigo">💎</div><div><div class="section-title">Lesson Logged</div><div class="section-sub">What do you want Future You to remember from this trade?</div></div></div>
      <div class="section-body">
        <div class="jl-lesson-list">
          ${lessons.map((text, i) => `
            <div class="jl-lesson-row">
              <span class="jl-lesson-arrow">→</span>
              <input class="field-input" data-lesson-index="${i}" value="${text || ''}" placeholder="Example: Wait for the break + retest.">
              ${lessons.length > 1 ? `<button type="button" class="cl-shot-remove" data-remove-lesson="${i}" aria-label="Remove lesson ${i + 1}">✕</button>` : ''}
            </div>`).join('')}
        </div>
        <button type="button" class="dd-secondary-btn" id="clAddLesson" style="margin-top:10px;">+ Add another lesson</button>
      </div>
    </div>`;
}

/* ── Step 7: Final Review ───────────────────────────────────────────── */

function renderFinalReviewStep(entry) {
  const showRuleBreak = entry.ruleCheck === 'mostly' || entry.ruleCheck === 'no';
  const exec = computeExecutionScore(entry);
  return `
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">🪞</div><div><div class="section-title">Final Trade Review</div></div></div>
      <div class="section-body">
        <div class="field-group"><label class="field-label">Was your directional bias correct?</label>
          ${chipGroupHtml({ mode: 'single', field: 'biasAccuracy', value: entry.biasAccuracy, options: [
            { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'mixed', label: 'Mixed' }, { value: 'unsure', label: 'Unsure' },
          ] })}
        </div>
        <div class="field-group" style="margin-top:16px;"><label class="field-label">Did you follow your rules?</label>
          ${chipGroupHtml({ mode: 'single', field: 'ruleCheck', value: entry.ruleCheck, options: [
            { value: 'yes', label: 'Yes' }, { value: 'mostly', label: 'Mostly' }, { value: 'no', label: 'No' },
          ] })}
        </div>
        ${showRuleBreak ? `
        <div class="field-group" style="margin-top:16px;"><label class="field-label">What rule did you break?</label>
          ${chipGroupHtml({ mode: 'multi', field: 'ruleViolations', options: RULE_BREAK_TAGS, value: entry.ruleViolations })}
        </div>` : ''}
        <div class="field-group" style="margin-top:16px;"><label class="field-label">How would you grade your execution?</label>
          ${chipGroupHtml({ mode: 'single', field: 'executionGrade', value: entry.executionGrade, options: ['A+', 'A', 'A-', 'B', 'C', 'D'] })}
          <div class="small-help" style="margin-top:6px;">Grade your process — not your P&amp;L.</div>
        </div>
        <div class="field-row cols-2" style="margin-top:16px;">
          <div class="field-group"><label class="field-label">What did you do well?</label><textarea class="field-textarea short" data-field="wentWell">${entry.wentWell || ''}</textarea></div>
          <div class="field-group"><label class="field-label">What would you improve next time?</label><textarea class="field-textarea short" data-field="wouldImprove">${entry.wouldImprove || ''}</textarea></div>
        </div>
        ${exec.score != null ? `<div class="jl-exec-score"><span class="jl-exec-score-label">Execution Score</span><span class="jl-exec-score-value">${exec.score} / 100</span></div>` : ''}
      </div>
    </div>`;
}

/* ── Top bar / wizard nav ───────────────────────────────────────────── */

function stageTopBarHtml(entry, active) {
  const pct = computeCompletionPct(entry);
  return `
    <div class="cl-stage-topbar">
      <div class="cl-stage-pills">${STAGES.map((s) => `<button type="button" class="dd-tab ${s === active ? 'active' : ''}" data-stage="${s}">${STAGE_LABELS[s]}</button>`).join('')}</div>
      <button type="button" class="cl-delete-link" id="clDeleteBtn">Delete Entry</button>
    </div>
    <div class="jl-completion-row">
      <div class="progress-shell"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="jl-completion-text">Trade Journal ${pct}% Complete</span>
    </div>`;
}

function renderWizardNav(container, { activeStage, status, onBack, onNext, onSaveFinal, onSaveDraft }) {
  const idx = STAGES.indexOf(activeStage);
  const isFirst = idx === 0;
  const isLast = idx === STAGES.length - 1;
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? '⚠ Couldn’t save — retrying' : 'Saved ✓';
  container.innerHTML = `
    <div class="cl-wizard-nav">
      <div style="display:flex;align-items:center;gap:14px;">
        <button type="button" class="cl-delete-link" id="clSaveLaterBtn">Save &amp; Finish Later</button>
        <span class="cl-nav-status">${statusText}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        ${!isFirst ? '<button type="button" class="dd-secondary-btn" id="clBackBtn">← Back</button>' : ''}
        ${isLast ? '<button type="button" class="dd-primary-btn" id="clSaveEntryBtn">✦ Save Entry</button>' : '<button type="button" class="dd-primary-btn" id="clNextBtn">Next →</button>'}
      </div>
    </div>`;
  container.querySelector('#clSaveLaterBtn').addEventListener('click', onSaveDraft);
  if (!isFirst) container.querySelector('#clBackBtn').addEventListener('click', onBack);
  if (isLast) {
    const btn = container.querySelector('#clSaveEntryBtn');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        await onSaveFinal();
      } catch (err) {
        console.error('Save entry error:', err);
        btn.disabled = false;
        btn.textContent = '✦ Save Entry';
        alert("Couldn't save this entry — try again in a moment.");
      }
    });
  } else {
    container.querySelector('#clNextBtn').addEventListener('click', onNext);
  }
}

async function hydrateScreenshotThumbs(container, apiFetch) {
  const imgs = container.querySelectorAll('img[data-shot-path]');
  for (const img of imgs) {
    try {
      const { url } = await apiFetch(`/api/journal-screenshot?path=${encodeURIComponent(img.dataset.shotPath)}`);
      img.src = url;
    } catch (err) {
      console.error('Screenshot load error:', err);
      img.closest('.cl-shot-thumb')?.classList.add('cl-shot-error');
      img.alt = `Couldn't load this screenshot — ${err.message}`;
    }
  }
}

/** Background-image variant, used by the Trade Summary Card and Trade Case File hero shots. */
export async function hydrateTscShots(container, apiFetch) {
  const els = container.querySelectorAll('[data-shot-bg-path]');
  for (const el of els) {
    try {
      const { url } = await apiFetch(`/api/journal-screenshot?path=${encodeURIComponent(el.dataset.shotBgPath)}`);
      el.style.backgroundImage = `url(${url})`;
    } catch (err) {
      console.error('Summary card screenshot load error:', err);
      el.classList.add('tsc-hero-shot-error');
      el.textContent = "Couldn't load screenshot";
    }
  }
}

/**
 * Orchestrates the whole entry wizard across its 7 steps.
 * `helpers`: { onChange(nextEntry), onDelete(), onSaveFinal(), onSaveDraft(), apiFetch(path, opts), uploadScreenshot(file, entryId) }
 */
export function renderJournalEntryPage(container, entry, helpers) {
  let activeStage = firstIncompleteStage(entry);

  function update(next) {
    // Every field commit flows through here — fold in the freshly computed
    // totals so what's actually persisted (and scored) matches what the
    // readonly fields show, instead of leaving netPnl/outcome permanently
    // null because nothing ever wrote them onto the entry itself.
    const totals = computeTradeTotals(next);
    const hasPnl = totals.computedExits.some((ex) => ex.dollars != null);
    entry = {
      ...next,
      ...(hasPnl ? { netPnl: totals.netPnl, grossPnl: totals.grossPnl, rMultiple: totals.rMultiple, outcome: next.outcomeOverride || computeOutcome(totals.netPnl) } : {}),
      ...(totals.plannedRisk != null ? { plannedRisk: totals.plannedRisk } : {}),
      ...(totals.plannedReward != null ? { plannedReward: totals.plannedReward } : {}),
      ...(totals.riskRewardRatio != null ? { riskRewardRatio: totals.riskRewardRatio } : {}),
    };
    helpers.onChange(entry);
    paint();
  }

  function navHandlers() {
    return {
      activeStage, status: helpers.saveStatus || 'saved',
      onBack: () => { activeStage = STAGES[STAGES.indexOf(activeStage) - 1]; paint(); },
      onNext: () => { activeStage = STAGES[STAGES.indexOf(activeStage) + 1]; paint(); },
      onSaveFinal: helpers.onSaveFinal,
      onSaveDraft: helpers.onSaveDraft,
    };
  }

  function paint() {
    container.innerHTML = `${stageTopBarHtml(entry, activeStage)}<div id="clStageBody"></div><div id="clNavBar"></div>`;
    const body = container.querySelector('#clStageBody');
    if (activeStage === 'trade') { body.innerHTML = renderTradeDetailsStep(entry); hydrateScreenshotThumbs(body, helpers.apiFetch); }
    else if (activeStage === 'execution') body.innerHTML = renderExecutionStep(entry);
    else if (activeStage === 'entered') body.innerHTML = renderWhyEnteredStep(entry);
    else if (activeStage === 'exited') body.innerHTML = renderWhyExitedStep(entry);
    else if (activeStage === 'mindset') body.innerHTML = renderMindsetStep(entry);
    else if (activeStage === 'lesson') body.innerHTML = renderLessonStep(entry);
    else body.innerHTML = renderFinalReviewStep(entry);

    wireStage(body);
    renderWizardNav(container.querySelector('#clNavBar'), navHandlers());

    container.querySelector('#clDeleteBtn').addEventListener('click', helpers.onDelete);
    container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => { activeStage = btn.dataset.stage; paint(); });
    });
  }

  function wireStage(body) {
    body.querySelectorAll('[data-field]').forEach((el) => {
      const commit = () => {
        const field = el.dataset.field;
        let value = el.value;
        if (['contracts', 'entryPrice', 'stopLossPoints', 'takeProfitPoints', 'manualPointValue'].includes(field)) {
          value = value === '' ? null : Number(value);
        }
        if (field === 'entryTimeOnly') {
          update({ ...entry, entryTime: `${entry.tradeDate || new Date().toISOString().slice(0, 10)}T${value}:00` });
          return;
        }
        update({ ...entry, [field]: value });
      };
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', commit);
    });

    body.querySelectorAll('.position-btn').forEach((btn) => {
      btn.addEventListener('click', () => update({ ...entry, direction: btn.dataset.direction }));
    });

    body.querySelectorAll('[data-exit-field]').forEach((input) => {
      input.addEventListener('blur', () => {
        const idx = Number(input.dataset.exitIndex);
        const field = input.dataset.exitField;
        const exits = entry.exits && entry.exits.length ? entry.exits.slice() : [{}];
        exits[idx] = { ...exits[idx], [field]: input.value === '' ? '' : Number(input.value) };
        update({ ...entry, exits });
      });
    });

    body.querySelectorAll('.outcome-btn').forEach((btn) => {
      btn.addEventListener('click', () => update({ ...entry, outcomeOverride: btn.dataset.outcome }));
    });

    body.querySelectorAll('[data-chip-single]').forEach((group) => {
      const field = group.dataset.chipSingle;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const value = btn.dataset.chipValue;
          const patch = { [field]: entry[field] === value ? null : value };
          if (field === 'ruleCheck' && patch[field] === 'yes') patch.ruleViolations = [];
          update({ ...entry, ...patch });
        });
      });
    });

    body.querySelectorAll('[data-chip-multi]').forEach((group) => {
      const field = group.dataset.chipMulti;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = entry[field] || [];
          const value = btn.dataset.chipValue;
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          const patch = { [field]: next };
          if (field === 'entryTags') patch.iccChecklist = next.includes('Dayli ICC Setup') ? (entry.iccChecklist || {}) : null;
          if (field === 'exitTags' && !next.includes('Took Profit Early')) patch.agreeWithEarlyExit = null;
          update({ ...entry, ...patch });
        });
      });
    });

    body.querySelectorAll('[data-icc-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.iccKey;
        const iccChecklist = { ...(entry.iccChecklist || {}), [key]: !entry.iccChecklist?.[key] };
        update({ ...entry, iccChecklist });
      });
    });

    body.querySelectorAll('[data-emotion-stage]').forEach((group) => {
      const stage = group.dataset.emotionStage;
      group.querySelectorAll('.chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = entry.emotions?.[stage] || [];
          const value = btn.dataset.chipValue;
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          update({ ...entry, emotions: { ...entry.emotions, [stage]: next } });
        });
      });
    });

    body.querySelectorAll('[data-lesson-index]').forEach((input) => {
      input.addEventListener('blur', () => {
        const idx = Number(input.dataset.lessonIndex);
        const lessons = (entry.lessons && entry.lessons.length ? entry.lessons : ['']).slice();
        lessons[idx] = input.value;
        update({ ...entry, lessons });
      });
    });
    const addLessonBtn = body.querySelector('#clAddLesson');
    if (addLessonBtn) addLessonBtn.addEventListener('click', () => {
      update({ ...entry, lessons: [...(entry.lessons && entry.lessons.length ? entry.lessons : ['']), ''] });
    });
    body.querySelectorAll('[data-remove-lesson]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.removeLesson);
        update({ ...entry, lessons: entry.lessons.filter((_, i) => i !== idx) });
      });
    });

    const shotInput = body.querySelector('#clShotInput');
    if (shotInput) shotInput.addEventListener('change', async () => {
      const statusEl = body.querySelector('#clUploadStatus');
      for (const file of Array.from(shotInput.files)) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          statusEl.textContent = `${file.name}: unsupported file type.`; continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          statusEl.textContent = `${file.name}: too large (max 5MB).`; continue;
        }
        statusEl.textContent = `Uploading ${file.name}…`;
        try {
          const path = await helpers.uploadScreenshot(file, entry.id);
          update({ ...entry, screenshots: [...(entry.screenshots || []), { path, uploadedAt: new Date().toISOString() }] });
          statusEl.textContent = `${file.name} uploaded ✓`;
          showDeskToast('Screenshot added ✦');
        } catch (err) {
          console.error('Screenshot upload error:', err);
          statusEl.textContent = `Couldn’t upload ${file.name}: ${err.message}`;
        }
      }
      shotInput.value = '';
    });
    body.querySelectorAll('[data-remove-shot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Remove this screenshot?')) return;
        const idx = Number(btn.dataset.removeShot);
        update({ ...entry, screenshots: entry.screenshots.filter((_, i) => i !== idx) });
      });
    });
  }

  paint();
  return {
    getState: () => entry,
    // Silently folds server-assigned fields (id, tradeNumber, ...) into the
    // closure without repainting — a save completing mid-edit must never
    // yank focus away from whatever the member is currently typing into.
    applySavedFields: (saved) => {
      entry = { ...entry, id: saved.id, tradeNumber: saved.tradeNumber, gpAwardedAt: saved.gpAwardedAt };
    },
    setSaveStatus: (status) => {
      helpers.saveStatus = status;
      const navBar = container.querySelector('#clNavBar');
      if (navBar) renderWizardNav(navBar, navHandlers());
    },
  };
}

/* ── Read-only Trade Case File (a finalized entry, per journal-entry.html's isDraft branch) ── */

function caseFieldRow(label, value) {
  if (value == null || value === '') return '';
  return `<div class="jl-case-row"><span class="jl-case-label">${label}</span><span class="jl-case-value">${value}</span></div>`;
}

export function renderTradeCaseFile(container, entry, { onEdit, apiFetch }) {
  const totals = computeTradeTotals(entry);
  const exec = computeExecutionScore(entry);
  const lastExit = entry.exits && entry.exits[entry.exits.length - 1];
  container.innerHTML = `
    <div class="cl-stage-topbar">
      <div class="tsc-case-heading">💎 TRADE #${entry.tradeNumber || '—'} <span class="jl-case-sub">${entry.instrument || '—'} • ${entry.direction ? entry.direction.toUpperCase() : '—'} • ${entry.tradeDate || ''}</span></div>
      <button type="button" class="dd-primary-btn" id="clEditBtn">✎ Edit This Entry</button>
    </div>
    ${entry.screenshots?.length ? `<div class="tsc-hero-shot" data-shot-bg-path="${entry.screenshots[0].path}"></div>` : ''}
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">🧾</div><div><div class="section-title">Trade Details</div></div></div>
      <div class="section-body">
        ${caseFieldRow('Date', entry.tradeDate)}
        ${caseFieldRow('Time', (entry.entryTime || '').slice(11, 16))}
        ${caseFieldRow('Instrument', entry.instrument)}
        ${caseFieldRow('Position', entry.direction)}
        ${caseFieldRow('Contracts', entry.contracts)}
        ${caseFieldRow('Trade Style', entry.setupType)}
        ${caseFieldRow('Execution Grade', entry.executionGrade)}
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-teal">📈</div><div><div class="section-title">Execution</div></div></div>
      <div class="section-body">
        ${caseFieldRow('Entry', entry.entryPrice)}
        ${caseFieldRow('Exit', lastExit?.exitPrice)}
        ${caseFieldRow('Stop Loss (pts)', entry.stopLossPoints)}
        ${caseFieldRow('Take Profit (pts)', entry.takeProfitPoints)}
        ${caseFieldRow('Points', totals.weightedPoints ? fmt(totals.weightedPoints) : null)}
        ${caseFieldRow('P&L', entry.netPnl != null ? fmtMoney(entry.netPnl) : null)}
        ${caseFieldRow('Risk-to-Reward', totals.riskRewardRatio != null ? '1 : ' + totals.riskRewardRatio.toFixed(2) : null)}
        ${caseFieldRow('Target Hit?', entry.targetHit)}
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-peach">📍</div><div><div class="section-title">Why I Entered</div></div></div>
      <div class="section-body"><p>${entry.entryReasoning || '—'}</p></div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">📤</div><div><div class="section-title">Why I Exited</div></div></div>
      <div class="section-body"><p>${entry.exitReasoning || '—'}</p></div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-indigo">💎</div><div><div class="section-title">Lessons Logged</div></div></div>
      <div class="section-body">${(entry.lessons || []).filter(Boolean).length ? `<ul class="jl-lesson-readlist">${entry.lessons.filter(Boolean).map((l) => `<li>→ ${l}</li>`).join('')}</ul>` : '<p>—</p>'}</div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-pink">🧠</div><div><div class="section-title">Emotional Check-In</div></div></div>
      <div class="section-body">
        ${caseFieldRow('Before', (entry.emotions?.entering || []).join(', '))}
        ${caseFieldRow('During', (entry.emotions?.during || []).join(', '))}
        ${caseFieldRow('After', (entry.emotions?.exiting || []).join(', '))}
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><div class="section-icon icon-dark">🪞</div><div><div class="section-title">Bonus Reflection</div></div></div>
      <div class="section-body">
        ${caseFieldRow('Bias Accuracy', entry.biasAccuracy)}
        ${caseFieldRow('Followed Rules?', entry.ruleCheck)}
        ${(entry.ruleViolations || []).length ? caseFieldRow('Mistakes', entry.ruleViolations.join(', ')) : ''}
        ${caseFieldRow('What Went Well', entry.wentWell)}
        ${caseFieldRow('What To Improve', entry.wouldImprove)}
        ${exec.score != null ? caseFieldRow('Execution Score', exec.score + ' / 100') : ''}
      </div>
    </div>`;
  if (entry.screenshots?.length && apiFetch) hydrateTscShots(container, apiFetch);
  container.querySelector('#clEditBtn').addEventListener('click', onEdit);
}

/* ── Trade Summary Card — shared by the post-save celebration and the Journal History grid ── */

/** @param {import('./dashboard-models.js').JournalEntryRecord} entry */
export function entryToSummaryCardProps(entry) {
  const totals = computeTradeTotals(entry);
  return {
    id: entry.id,
    tradeNumber: entry.tradeNumber,
    instrument: entry.instrument,
    direction: entry.direction,
    tradeDate: entry.tradeDate,
    netPnl: entry.netPnl ?? totals.netPnl,
    weightedPoints: totals.weightedPoints,
    executionGrade: entry.executionGrade,
    entryTags: entry.entryTags || [],
    entryReasoningShort: (entry.entryReasoning || '').slice(0, 140),
    exitReasoningShort: (entry.exitReasoning || '').slice(0, 140),
    emotions: entry.emotions || {},
    ruleCheck: entry.ruleCheck,
    biggestLesson: (entry.lessons || []).filter(Boolean)[0] || '',
    screenshotPath: entry.screenshots?.[0]?.path || null,
  };
}

/** @param {ReturnType<typeof entryToSummaryCardProps>} props */
export function renderTradeSummaryCard(props, opts = {}) {
  const variant = opts.variant || 'list';
  const isCelebration = variant === 'celebration';
  const pnlClass = props.netPnl > 0 ? 'dd-pnl-pos' : props.netPnl < 0 ? 'dd-pnl-neg' : 'dd-pnl-flat';
  const setupFlow = props.entryTags.filter((t) => t !== 'Other').join(' → ');
  const ruleIcon = props.ruleCheck === 'yes' ? '✅' : props.ruleCheck === 'mostly' ? '➰' : props.ruleCheck === 'no' ? '⚠️' : '';
  const emotionChips = ['entering', 'during', 'exiting'].flatMap((s) => props.emotions?.[s] || []).join(' • ');
  const Tag = isCelebration ? 'div' : 'a';
  return `
    <${Tag} class="tsc-card tsc-card-${variant}" ${isCelebration ? '' : `href="journal-entry.html?id=${props.id}"`}>
      ${props.screenshotPath ? `<div class="tsc-hero-shot" data-shot-bg-path="${props.screenshotPath}"></div>` : ''}
      <div class="tsc-body">
        <div class="tsc-top">
          <span class="tsc-trade-num">${props.tradeNumber ? `TRADE #${props.tradeNumber}` : 'New Trade'}</span>
          ${ruleIcon ? `<span class="tsc-rule-icon">${ruleIcon}</span>` : ''}
        </div>
        <div class="tsc-ticker">${props.instrument || '—'} • ${props.direction ? props.direction.toUpperCase() : '—'}</div>
        <div class="tsc-date">${props.tradeDate || ''}</div>
        <div class="tsc-pnl ${pnlClass}">${props.netPnl != null ? fmtMoney(props.netPnl) : '—'}</div>
        ${props.weightedPoints ? `<div class="tsc-points">${fmt(props.weightedPoints)} pts</div>` : ''}
        ${props.executionGrade ? `<div class="tsc-grade">${props.executionGrade} Execution</div>` : ''}
        ${setupFlow ? `<div class="tsc-setup-flow">${setupFlow}</div>` : ''}
        ${isCelebration && props.entryReasoningShort ? `<div class="tsc-section"><strong>Why I Entered</strong><p>${props.entryReasoningShort}</p></div>` : ''}
        ${isCelebration && props.exitReasoningShort ? `<div class="tsc-section"><strong>Why I Exited</strong><p>${props.exitReasoningShort}</p></div>` : ''}
        ${emotionChips ? `<div class="tsc-emotions">${emotionChips}</div>` : ''}
        ${props.biggestLesson ? `<div class="tsc-lesson">💎 ${props.biggestLesson}</div>` : ''}
      </div>
    </${Tag}>`;
}

/* ── Journal History page helpers ───────────────────────────────────── */

export function renderJournalStatsRow(container, stats) {
  const tiles = [
    { label: 'Trades Logged', value: stats.tradesLogged, hero: false, muted: false },
    { label: 'Win Rate', value: stats.winRate != null ? stats.winRate + '%' : '—', hero: false, muted: false },
    { label: 'Avg Winner', value: stats.avgWinner != null ? fmtMoney(stats.avgWinner) : '—', hero: false, muted: true },
    { label: 'Avg Loser', value: stats.avgLoser != null ? fmtMoney(stats.avgLoser) : '—', hero: false, muted: true },
    { label: 'Avg R', value: stats.avgR != null ? stats.avgR.toFixed(2) + 'R' : '—', hero: false, muted: false },
    { label: 'Rule Follow Rate', value: stats.ruleFollowRate != null ? stats.ruleFollowRate + '%' : '—', hero: true, muted: false },
    { label: 'Bias Accuracy', value: stats.biasAccuracyRate != null ? stats.biasAccuracyRate + '%' : '—', hero: true, muted: false },
    { label: 'Journaling Streak', value: stats.journalingStreak ? `${stats.journalingStreak} 🔥` : '0', hero: true, muted: false },
  ];
  container.innerHTML = tiles.map((t) => `
    <div class="jh-stat-tile ${t.hero ? 'hero' : ''} ${t.muted ? 'muted' : ''}">
      <div class="jh-stat-label">${t.label}</div>
      <div class="jh-stat-value">${t.value}</div>
    </div>`).join('');
}

export function renderBadgesStrip(container) {
  container.innerHTML = COMING_SOON_BADGES.map((b) => `
    <div class="jh-badge-tile locked" title="Badges are coming soon">
      <span class="jh-badge-icon">${b.icon}</span>
      <span class="jh-badge-label">${b.label}</span>
    </div>`).join('');
}

export function renderInsightCards(container, insights) {
  if (!insights.length) { container.innerHTML = ''; return; }
  container.innerHTML = insights.map((i) => `
    <div class="jh-insight-card ${i.kind}">
      <span class="jh-insight-icon">${i.icon}</span>
      <span class="jh-insight-text">${i.text}</span>
    </div>`).join('');
}
