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
import { tradeCardHtml, tradeStoryHtml, ladderSvg } from './journal-v2.js';
import { ENTRY_MODELS, entrySetup, ruleChecked, setupCompletion } from './entry-models.js';
import { JOURNAL_ENTRY_TAGS, EXIT_TAGS, RULE_BREAK_TAGS, EMOTION_OPTIONS_V2, todayKey } from './dashboard-models.js';

const STAGES = ['trade', 'execution', 'entered', 'exited', 'mindset', 'lesson', 'review'];
const STAGE_LABELS = { trade: 'Trade', execution: 'Execution', entered: 'Entered', exited: 'Exited', mindset: 'Mindset', lesson: 'Lesson', review: 'Review' };
const SESSIONS = ['Asia', 'London', 'NY AM', 'NY Lunch', 'NY PM'];

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
  // A typed-in market keeps its point value in entryModel; a listed market never uses it.
  const manual = entry.manualPointValue ?? (instrument ? null : entry.entryModel?.pointValue);
  const pointValue = manual != null && manual !== ''
    ? Number(manual)
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

  // Points captured per contract (a contract-weighted average across
  // partial exits). weightedPoints is points × contracts, so it isn't the
  // move itself: 91 points on 5 contracts is 455 contract-points.
  const avgPoints = totalContracts ? weightedPoints / totalContracts : null;
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
    computedExits, totalContracts, exceedsPosition, weightedPoints, avgPoints, grossPnl, netPnl, pointValue,
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
    iccCompletion: setupCompletion(entry) != null ? Math.round(setupCompletion(entry) * 20) : null,
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
    !!(entrySetup(entry) || (entry.entryTags && entry.entryTags.length)),
    !!entry.ruleCheck,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function firstIncompleteStage(entry) {
  if (!entry.tradeDate || !entry.instrument || !entry.direction) return 'trade';
  if (entry.entryPrice == null) return 'execution';
  if (!entrySetup(entry) && !(entry.entryTags && entry.entryTags.length)) return 'entered';
  if (!(entry.exitTags && entry.exitTags.length)) return 'exited';
  if (!entry.emotions || !entry.emotions.entering?.length) return 'mindset';
  if (!(entry.lessons && entry.lessons.length)) return 'lesson';
  return 'review';
}

/* ── Shared bits for the 7 steps ─────────────────────────────────────── */

const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STAGE_INFO = {
  trade: ['The trade', 'Market, side, chart'],
  execution: ['Execution', 'Entry, exit, risk'],
  entered: ['Entered', 'Your setup and why'],
  exited: ['Exited', 'Why you closed'],
  mindset: ['Mindset', 'How it felt'],
  lesson: ['Lesson', 'For future you'],
  review: ['Review', 'Plan, grade, notes'],
};
const FACE_KIND = (label) => (['Calm', 'Prepared', 'Confident', 'Aligned', 'Focused', 'At Ease', 'Proud', 'Grateful', 'Protective', 'Relieved'].includes(label) ? 'good'
  : ['Nervous', 'Impatient', 'FOMO', 'Anxious', 'Watching Every Tick', 'Second Guessing', 'Tempted to Exit', 'Tempted to Move Stop', 'Overconfident', 'Frustrated', 'Regretful', 'Disappointed'].includes(label) ? 'hard' : 'mixed');
const FACE_SVG = (kind) => {
  const [ink, mouth] = { good: ['#3E9E93', 'M8 13.5q4 3.5 8 0'], mixed: ['#C4741F', 'M8.5 14.5h7'], hard: ['#E0607C', 'M8 15.5q4-3.5 8 0'] }[kind];
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff" stroke="${ink}" stroke-width="1.6"/><circle cx="8.8" cy="10" r="1.3" fill="${ink}"/><circle cx="15.2" cy="10" r="1.3" fill="${ink}"/><path d="${mouth}" stroke="${ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>`;
};
const SYM_STYLE = (s) => (/^M?GC$/.test(s) ? 'gold' : /^M?ES$/.test(s) ? 'teal' : /^(M2K|RTY)$/.test(s) ? 'peach' : /^M?YM$/.test(s) ? 'pink' : 'purple');

/** Normalizes plain-string options (value===label) or explicit {value,label} pairs. */
function chipGroupHtml({ mode, field, options, value }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = mode === 'multi' ? (value || []) : null;
  return `<div class="je-chips" data-chip-${mode}="${field}">
    ${opts.map((o) => {
      const active = mode === 'multi' ? selected.includes(o.value) : value === o.value;
      return `<button type="button" class="je-chip ${active ? 'on' : ''}" data-chip-value="${escHtml(o.value)}" aria-pressed="${active}">${escHtml(o.label)}</button>`;
    }).join('')}
  </div>`;
}

const head = (n, title, sub) => `<span class="jv-kicker">Step ${n} of 7</span><h2 class="je-h">${title}</h2>${sub ? `<p class="je-sub">${sub}</p>` : ''}`;
const q = (text) => `<div class="je-q">${text}</div>`;

/* ── Step 1: The trade ─────────────────────────────────────────────── */

function renderScreenshotUploader(entry) {
  const shots = entry.screenshots || [];
  return `${q('Your chart')}
    <div class="je-shots" id="clShotGrid">
      ${shots.map((s, i) => `
        <div class="cl-shot-thumb je-shot" data-shot-index="${i}">
          <img data-shot-path="${escHtml(s.path)}" alt="Chart screenshot ${i + 1}" src="">
          <button type="button" class="cl-shot-remove" data-remove-shot="${i}" aria-label="Remove screenshot ${i + 1}">✕</button>
        </div>`).join('')}
      <label class="je-drop">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple id="clShotInput" hidden>
        <svg viewBox="0 0 96 60" aria-hidden="true"><rect x="2" y="2" width="92" height="56" rx="10" fill="#fff"/><path d="M12 46 L30 32 L42 38 L60 20 L84 12" fill="none" stroke="#3E9E93" stroke-width="3.5" stroke-linecap="round"/><circle cx="84" cy="12" r="5" fill="#F4829A"/></svg>
        <span><b>${shots.length ? 'Add another chart' : 'Add your chart'}</b><small>Tap to upload a screenshot (JPEG, PNG, WEBP or GIF, up to 5MB). The first one becomes the picture on your trade card.</small></span>
      </label>
    </div>
    <div id="clUploadStatus" class="je-status" role="status" aria-live="polite"></div>`;
}

function renderTradeDetailsStep(entry) {
  const known = INSTRUMENT_SYMBOLS.includes(entry.instrument);
  const custom = !!entry.instrument && !known;
  const showCustom = custom || entry._customInstrument;
  const today = todayKey();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  return `${head(1, 'What did you <em class="jv-p">trade?</em>', 'Just the facts. No judgment.')}
    ${q('Market')}
    <div class="je-markets">
      ${INSTRUMENT_SYMBOLS.map((s) => `<button type="button" class="je-market ${entry.instrument === s ? 'on' : ''}" data-instrument="${s}" aria-pressed="${entry.instrument === s}"><span class="jv-sym ${SYM_STYLE(s)}">${s}</span><span>${escHtml(getInstrument(s).label)}</span></button>`).join('')}
      <button type="button" class="je-market ${showCustom ? 'on' : ''}" data-instrument="__custom" aria-pressed="${!!showCustom}"><span class="jv-sym">+</span><span>Something else</span></button>
    </div>
    ${showCustom ? `<div class="je-row je-custom">
      <label class="je-field"><small>Your market</small><input data-field="instrument" value="${custom ? escHtml(entry.instrument) : ''}" placeholder="e.g. CL, 6E, BTC" maxlength="12"></label>
      <label class="je-field"><small>$ per point, per contract</small><input type="number" step="0.01" min="0" data-field="manualPointValue" value="${entry.manualPointValue ?? entry.entryModel?.pointValue ?? ''}" placeholder="e.g. 10"></label>
      <p class="je-help">So we can work out your P&amp;L. CL is $1,000 a point, 6E is $125,000.</p>
    </div>` : ''}
    ${q('Long or short?')}
    <div class="je-row">
      <button type="button" class="je-dir long ${entry.direction === 'long' ? 'on' : ''}" data-direction="long" aria-pressed="${entry.direction === 'long'}"><svg viewBox="0 0 58 40" aria-hidden="true"><path d="M4 34 L18 22 L26 27 L40 12 L54 4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><span><b>Long</b><small>I bought, expecting up</small></span></button>
      <button type="button" class="je-dir short ${entry.direction === 'short' ? 'on' : ''}" data-direction="short" aria-pressed="${entry.direction === 'short'}"><svg viewBox="0 0 58 40" aria-hidden="true"><path d="M4 6 L18 18 L26 13 L40 28 L54 36" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><span><b>Short</b><small>I sold, expecting down</small></span></button>
    </div>
    ${q('When')}
    <div class="je-row je-when">
      <div class="je-chips">
        <button type="button" class="je-chip ${entry.tradeDate === today ? 'on' : ''}" data-date="${today}">Today</button>
        <button type="button" class="je-chip ${entry.tradeDate === yesterday ? 'on' : ''}" data-date="${yesterday}">Yesterday</button>
      </div>
      <label class="je-field sm"><small>Date</small><input type="date" data-field="tradeDate" value="${entry.tradeDate || ''}"></label>
      <label class="je-field sm"><small>Time in</small><input type="time" data-field="entryTimeOnly" value="${(entry.entryTime || '').slice(11, 16)}"></label>
    </div>
    ${chipGroupHtml({ mode: 'single', field: 'session', options: SESSIONS, value: entry.session })}
    <div class="je-row je-two">
      <div>${q('Contracts')}
        <div class="je-stepper"><button type="button" data-step-contracts="-1" aria-label="One fewer contract">−</button><input type="number" min="1" data-field="contracts" value="${entry.contracts ?? ''}" placeholder="1" aria-label="Contracts"><button type="button" data-step-contracts="1" aria-label="One more contract">+</button></div>
      </div>
      <div>${q('Account or prop firm (optional)')}<label class="je-field"><input data-field="accountId" value="${escHtml(entry.accountId || '')}" placeholder="e.g. Apex 50K #2"></label></div>
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
  const ladder = ladderSvg({ ...entry }, exit.exitPrice === '' ? null : exit.exitPrice);
  const tile = (label, value, bg) => `<div style="--c:${bg}"><small>${label}</small><b>${value}</b></div>`;
  return `${head(2, 'The <em class="jv-t">numbers.</em>', 'Type your prices. We do the math.')}
    <div class="je-fields">
      <label class="je-field"><small>Entry price</small><input type="number" step="0.01" data-field="entryPrice" value="${entry.entryPrice ?? ''}" placeholder="21480.25"></label>
      <label class="je-field"><small>Exit price</small><input type="number" step="0.01" data-exit-field="exitPrice" data-exit-index="0" value="${exit.exitPrice ?? ''}" placeholder="21520.25"></label>
      <label class="je-field"><small>Stop (points away)</small><input type="number" min="0" step="0.01" data-field="stopLossPoints" value="${entry.stopLossPoints ?? ''}" placeholder="20"></label>
      <label class="je-field"><small>Target (points away)</small><input type="number" min="0" step="0.01" data-field="takeProfitPoints" value="${entry.takeProfitPoints ?? ''}" placeholder="40"></label>
    </div>
    <p class="je-help">Stop and target are points away from your entry (20, not 19980).</p>
    ${ladder ? `<div class="je-ladder">${ladder}</div>` : '<div class="je-ladder empty">Your stop, entry and target picture draws here once you add an entry, stop and target.</div>'}
    <div class="je-auto">
      ${tile('P&amp;L', totals.netPnl != null && computed.points != null ? fmtMoney(totals.netPnl) : '–', '#E8F8F6')}
      ${tile('Result', totals.rMultiple != null && computed.points != null ? `${totals.rMultiple > 0 ? '+' : ''}${totals.rMultiple.toFixed(2)}R` : '–', '#EEEDFE')}
      ${tile('You risked', totals.plannedRisk != null ? fmtMoney(totals.plannedRisk) : '–', '#FDE8ED')}
      ${tile('Planned', totals.riskRewardRatio != null ? `1 : ${Number(totals.riskRewardRatio.toFixed(2))}` : '–', '#FEF3E4')}
    </div>
    <details class="je-more" ${entry.exits?.[0]?.contracts && entry.exits[0].contracts !== entry.contracts ? 'open' : ''}>
      <summary>Partial exit or different point value?</summary>
      <div class="je-fields three">
        <label class="je-field"><small>Exit contracts</small><input type="number" min="0" step="1" data-exit-field="contracts" data-exit-index="0" value="${exit.contracts ?? entry.contracts ?? ''}"></label>
        <label class="je-field"><small>$ per point${instrument ? ' (auto)' : ''}</small><input type="number" step="0.01" data-field="manualPointValue" value="${entry.manualPointValue ?? entry.entryModel?.pointValue ?? (instrument ? instrument.pointValue : '')}"></label>
        <label class="je-field"><small>Points</small><input value="${computed.points != null ? fmt(computed.points) : ''}" placeholder="auto" readonly></label>
      </div>
    </details>
    ${q('Outcome')}
    <div class="je-chips je-outcome">
      ${['win', 'loss', 'breakeven'].map((o) => `<button type="button" class="je-chip ${o} ${outcome === o ? 'on' : ''} outcome-btn" data-outcome="${o}" aria-pressed="${outcome === o}">${o === 'win' ? 'Win' : o === 'loss' ? 'Loss' : 'Breakeven'}</button>`).join('')}
    </div>
    ${q('Did price reach your original target?')}
    ${chipGroupHtml({ mode: 'single', field: 'targetHit', value: entry.targetHit, options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
      { value: 'still_running', label: 'Still running' }, { value: 'not_sure', label: 'Not sure' },
    ] })}`;
}

/* ── Step 3: Why I entered (setup picker + that setup's rules) ─────── */

function renderSetupRules(entry, setup) {
  const model = ENTRY_MODELS[setup];
  const steps = model.steps(entry.direction);
  const on = (key) => ruleChecked(entry, setup, key);
  if (setup === 'other') {
    return `<label class="je-field"><small>Name your setup</small><input data-model-name value="${escHtml(entry.entryModel?.name || '')}" placeholder="e.g. Opening range breakout"></label>`;
  }
  return `<h3 class="je-h3">${model.question}</h3><p class="je-sub">Tap each step you actually saw before you entered.</p>
    <div class="je-rules" style="--n:${steps.length}">
      ${steps.map((s, i) => `${i ? `<i class="je-rule-ln ${on(s.key) && on(steps[i - 1].key) ? 'on' : ''}"></i>` : ''}<button type="button" class="je-rule ${on(s.key) ? 'on' : ''}" data-rule="${s.key}" aria-pressed="${on(s.key)}"><span>${on(s.key) ? '✓' : i + 1}</span><small>${escHtml(s.label)}</small></button>`).join('')}
    </div>
    <div class="je-chips soft">${model.extras().map((x) => `<button type="button" class="je-chip pu ${on(x.key) ? 'on' : ''}" data-rule="${x.key}" aria-pressed="${on(x.key)}">${on(x.key) ? '✓ ' : ''}${escHtml(x.label)}</button>`).join('')}</div>`;
}

function renderWhyEnteredStep(entry) {
  const setup = entrySetup(entry);
  return `${head(3, 'Why did you <em class="jv-p">enter?</em>', 'Pick the setup you traded. Its entry rules show up for you to check.')}
    <div class="je-setups">
      ${Object.entries(ENTRY_MODELS).map(([key, m]) => `<button type="button" class="je-setup ${setup === key ? 'on' : ''}" data-setup="${key}" aria-pressed="${setup === key}"><b>${m.label}</b><small>${m.sub}</small></button>`).join('')}
    </div>
    ${setup ? `<div class="je-setup-body">${renderSetupRules(entry, setup)}</div>` : ''}
    ${q(setup === 'other' ? 'What did you see?' : 'Anything else you saw? (optional)')}
    ${chipGroupHtml({ mode: 'multi', field: 'entryTags', options: JOURNAL_ENTRY_TAGS.filter((t) => t !== 'Dayli ICC Setup'), value: entry.entryTags })}
    ${q('In one line, why did you enter?')}
    <textarea class="je-bubble in" data-field="entryReasoning" rows="2" placeholder="e.g. PIL held on the 1H and price came back to it.">${escHtml(entry.entryReasoning || '')}</textarea>`;
}

/* ── Step 4: Why I exited ───────────────────────────────────────────── */

function renderWhyExitedStep(entry) {
  const hasEarlyExit = (entry.exitTags || []).includes('Took Profit Early');
  return `${head(4, 'Why did you <em class="jv-t">exit?</em>', 'What happened, in a tap or two.')}
    ${chipGroupHtml({ mode: 'multi', field: 'exitTags', options: EXIT_TAGS, value: entry.exitTags })}
    ${hasEarlyExit ? `${q('Looking back, do you still agree with that exit?')}
      ${chipGroupHtml({ mode: 'single', field: 'agreeWithEarlyExit', value: entry.agreeWithEarlyExit, options: [
        { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' },
      ] })}` : ''}
    ${q('In one line, what made you close it?')}
    <textarea class="je-bubble out" data-field="exitReasoning" rows="2" placeholder="e.g. Hit my 2R target.">${escHtml(entry.exitReasoning || '')}</textarea>`;
}

/* ── Step 5: Mindset ────────────────────────────────────────────────── */

function renderMindsetStep(entry) {
  const emotions = entry.emotions || {};
  const cols = [['entering', 'Before', 'Entering'], ['during', 'During', 'In the trade'], ['exiting', 'After', 'Exiting']];
  return `${head(5, 'How did it <em class="jv-p">feel?</em>', 'Honest beats perfect. Tap as many as fit.')}
    <div class="je-faces">
      ${cols.map(([stage, title, sub]) => `<div class="je-fcol" data-emotion-stage="${stage}"><h4>${title}<small>${sub}</small></h4>
        ${EMOTION_OPTIONS_V2[stage].map((o) => {
          const on = (emotions[stage] || []).includes(o);
          const kind = FACE_KIND(o);
          return `<button type="button" class="je-face ${kind} ${on ? 'on' : ''}" data-chip-value="${escHtml(o)}" aria-pressed="${on}">${FACE_SVG(kind)}${escHtml(o)}</button>`;
        }).join('')}</div>`).join('')}
    </div>`;
}

/* ── Step 6: Lesson ─────────────────────────────────────────────────── */

function renderLessonStep(entry) {
  const lessons = entry.lessons && entry.lessons.length ? entry.lessons : [''];
  return `${head(6, 'A lesson for <em class="jv-g">future you.</em>', 'What do you want to remember from this trade?')}
    <div class="je-lessons">
      ${lessons.map((text, i) => `<div class="je-lesson"><span>✦</span><input data-lesson-index="${i}" value="${escHtml(text || '')}" placeholder="e.g. Wait for the break and the retest." aria-label="Lesson ${i + 1}">
        ${lessons.length > 1 ? `<button type="button" data-remove-lesson="${i}" aria-label="Remove lesson ${i + 1}">✕</button>` : ''}</div>`).join('')}
    </div>
    <button type="button" class="je-add" id="clAddLesson">+ Add another lesson</button>`;
}

/* ── Step 7: Review ─────────────────────────────────────────────────── */

function renderFinalReviewStep(entry) {
  const showRuleBreak = entry.ruleCheck === 'mostly' || entry.ruleCheck === 'no';
  const plan = [
    ['yes', 'Yes', 'Every rule', '<path d="M7.5 12.5l3 3 6-6"/>', '#3E9E93'],
    ['mostly', 'Mostly', 'One small slip', '<path d="M8 12h8"/>', '#C4741F'],
    ['no', 'No', 'I broke a rule', '<path d="M9 9l6 6M15 9l-6 6"/>', '#E0607C'],
  ];
  return `${head(7, 'Your <em class="jv-p">review.</em>', 'Grade the process, not the P&amp;L.')}
    ${q('Did you follow your plan?')}
    <div class="je-plan" data-chip-single="ruleCheck">
      ${plan.map(([v, label, sub, path, ink]) => `<button type="button" class="je-chip je-plan-card ${v} ${entry.ruleCheck === v ? 'on' : ''}" data-chip-value="${v}" aria-pressed="${entry.ruleCheck === v}"><svg viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/>${path}</svg><b>${label}</b><small>${sub}</small></button>`).join('')}
    </div>
    ${showRuleBreak ? `${q('Which rule?')}${chipGroupHtml({ mode: 'multi', field: 'ruleViolations', options: RULE_BREAK_TAGS, value: entry.ruleViolations })}` : ''}
    ${q('Was your directional bias right?')}
    ${chipGroupHtml({ mode: 'single', field: 'biasAccuracy', value: entry.biasAccuracy, options: [
      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'mixed', label: 'Mixed' }, { value: 'unsure', label: 'Unsure' },
    ] })}
    ${q('Grade your execution')}
    <div class="je-grades" data-chip-single="executionGrade">
      ${['A+', 'A', 'A-', 'B', 'C', 'D'].map((g) => `<button type="button" class="je-chip je-grade ${entry.executionGrade === g ? 'on' : ''}" data-chip-value="${g}" aria-pressed="${entry.executionGrade === g}">${g.replace('-', '−')}</button>`).join('')}
    </div>
    ${q('Your notes')}
    <div class="je-notes">
      <label class="je-note good"><small>What went well</small><textarea data-field="wentWell" rows="3" placeholder="Tap to write…">${escHtml(entry.wentWell || '')}</textarea></label>
      <label class="je-note mixed"><small>What I’d improve</small><textarea data-field="wouldImprove" rows="3" placeholder="Tap to write…">${escHtml(entry.wouldImprove || '')}</textarea></label>
    </div>`;
}

/* ── Step bar / wizard nav ──────────────────────────────────────────── */

function stageTopBarHtml(entry, active) {
  const done = {
    trade: !!(entry.tradeDate && entry.instrument && entry.direction),
    execution: entry.entryPrice != null && (entry.exits || []).some((ex) => ex.exitPrice != null && ex.exitPrice !== ''),
    entered: !!(entrySetup(entry) || entry.entryTags?.length),
    exited: !!entry.exitTags?.length,
    mindset: !!entry.emotions?.entering?.length,
    lesson: !!(entry.lessons || []).filter(Boolean).length,
    review: !!entry.ruleCheck,
  };
  return `<div class="je-top">
      <div class="je-steps">${STAGES.map((s, i) => `<button type="button" class="je-step ${s === active ? 'now' : done[s] ? 'done' : ''}" data-stage="${s}" aria-current="${s === active ? 'step' : 'false'}"><i>${done[s] && s !== active ? '✓' : i + 1}</i><span><b>${STAGE_INFO[s][0]}</b><small>${STAGE_INFO[s][1]}</small></span></button>`).join('')}</div>
      <button type="button" class="je-delete" id="clDeleteBtn">Delete entry</button>
    </div>`;
}

function renderWizardNav(container, { activeStage, status, onBack, onNext, onSaveFinal, onSaveDraft }) {
  const idx = STAGES.indexOf(activeStage);
  const isFirst = idx === 0;
  const isLast = idx === STAGES.length - 1;
  const statusText = status === 'saving' ? 'Saving…' : status === 'error' ? 'Couldn’t save, retrying' : 'Saved · finish later anytime';
  container.innerHTML = `
    <div class="je-nav">
      <div class="je-nav-left">
        <span class="je-saved ${status === 'error' ? 'err' : ''}"><i></i>${statusText}</span>
        <button type="button" class="je-later" id="clSaveLaterBtn">Save &amp; finish later</button>
      </div>
      <div class="je-nav-right">
        ${!isFirst ? '<button type="button" class="jv-btn ghost plain" id="clBackBtn">Back</button>' : ''}
        ${isLast ? '<button type="button" class="jv-btn" id="clSaveEntryBtn">✦ Save my trade</button>' : '<button type="button" class="jv-btn" id="clNextBtn">Next →</button>'}
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
        btn.textContent = '✦ Save my trade';
        alert("Couldn't save this entry. Try again in a moment.");
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
      el.classList.add('tsc-hero-shot-error', 'jv-card-shot-error');
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
    // The exit's contracts follow the trade's contracts unless she split the exit herself.
    const ex0 = next.exits?.[0];
    if (ex0 && next.contracts != null && (ex0.contracts == null || ex0.contracts === '' || ex0.contracts === entry.contracts)) {
      next = { ...next, exits: [{ ...ex0, contracts: next.contracts }, ...next.exits.slice(1)] };
    }
    // A market she typed herself has no built-in point value, so keep hers with the entry.
    if (next.instrument && !getInstrument(next.instrument) && next.manualPointValue != null && next.manualPointValue !== '') {
      next = { ...next, entryModel: { ...(next.entryModel || {}), pointValue: Number(next.manualPointValue) } };
    }
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
      onBack: () => { activeStage = STAGES[STAGES.indexOf(activeStage) - 1]; paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      onNext: () => { activeStage = STAGES[STAGES.indexOf(activeStage) + 1]; paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      onSaveFinal: helpers.onSaveFinal,
      onSaveDraft: helpers.onSaveDraft,
    };
  }

  const shotUrls = new Map();
  const cachedFetch = async (path, opts) => {
    if (!shotUrls.has(path)) shotUrls.set(path, helpers.apiFetch(path, opts));
    try { return await shotUrls.get(path); } catch (err) { shotUrls.delete(path); throw err; }
  };

  // Every commit repaints the step, so remember where focus was heading
  // (the field she tabbed or tapped into) and put it back afterwards.
  let pendingFocus = null;
  const focusKey = (el) => {
    if (!el || !container.contains(el)) return null;
    for (const attr of ['data-field', 'data-exit-field', 'data-lesson-index', 'data-model-name']) {
      if (el.hasAttribute?.(attr)) return `[${attr}="${el.getAttribute(attr)}"]${attr === 'data-exit-field' ? `[data-exit-index="${el.dataset.exitIndex}"]` : ''}`;
    }
    return null;
  };
  // Capture phase, so this runs before the field's own blur handler repaints.
  container.addEventListener('blur', (e) => { pendingFocus = focusKey(e.relatedTarget); }, true);

  function paint() {
    const restore = pendingFocus;
    pendingFocus = null;
    container.innerHTML = `<div class="je">${stageTopBarHtml(entry, activeStage)}
      <div class="je-wrap">
        <div class="je-panel"><div id="clStageBody"></div><div id="clNavBar"></div></div>
        <aside class="je-live"><span class="jv-kicker">Your trade card · live</span>${tradeCardHtml(entry, { variant: 'preview' })}<p>This is how it shows in your journal.</p></aside>
      </div></div>`;
    const body = container.querySelector('#clStageBody');
    if (activeStage === 'trade') { body.innerHTML = renderTradeDetailsStep(entry); hydrateScreenshotThumbs(body, cachedFetch); }
    else if (activeStage === 'execution') body.innerHTML = renderExecutionStep(entry);
    else if (activeStage === 'entered') body.innerHTML = renderWhyEnteredStep(entry);
    else if (activeStage === 'exited') body.innerHTML = renderWhyExitedStep(entry);
    else if (activeStage === 'mindset') body.innerHTML = renderMindsetStep(entry);
    else if (activeStage === 'lesson') body.innerHTML = renderLessonStep(entry);
    else body.innerHTML = renderFinalReviewStep(entry);
    if (entry.screenshots?.length && helpers.apiFetch) hydrateTscShots(container.querySelector('.je-live'), cachedFetch);

    wireStage(body);
    renderWizardNav(container.querySelector('#clNavBar'), navHandlers());
    if (restore) {
      const el = body.querySelector(restore);
      if (el) { el.focus({ preventScroll: true }); if (el.select && el.type !== 'date' && el.type !== 'time') el.select(); }
    }

    container.querySelector('#clDeleteBtn').addEventListener('click', helpers.onDelete);
    container.querySelectorAll('[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => { activeStage = btn.dataset.stage; paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
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
        if (field === 'instrument') value = value.trim().toUpperCase().slice(0, 12);
        if (field === 'entryTimeOnly') {
          update({ ...entry, entryTime: `${entry.tradeDate || todayKey()}T${value}:00` });
          return;
        }
        update({ ...entry, [field]: value });
      };
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', commit);
    });

    body.querySelectorAll('[data-direction]').forEach((btn) => {
      btn.addEventListener('click', () => update({ ...entry, direction: btn.dataset.direction }));
    });

    body.querySelectorAll('[data-instrument]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pick = btn.dataset.instrument;
        if (pick === '__custom') {
          update({ ...entry, _customInstrument: true, instrument: getInstrument(entry.instrument) ? '' : entry.instrument });
          body.querySelector('[data-field="instrument"]')?.focus();
          return;
        }
        const { pointValue, ...model } = entry.entryModel || {};
        update({
          ...entry, instrument: pick, _customInstrument: false,
          manualPointValue: getInstrument(entry.instrument) ? entry.manualPointValue : null,
          entryModel: entry.entryModel ? model : entry.entryModel,
        });
      });
    });

    body.querySelectorAll('[data-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const time = (entry.entryTime || '').slice(11, 16);
        update({ ...entry, tradeDate: btn.dataset.date, ...(time ? { entryTime: `${btn.dataset.date}T${time}:00` } : {}) });
      });
    });

    body.querySelectorAll('[data-step-contracts]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Math.max(1, (Number(entry.contracts) || 0) + Number(btn.dataset.stepContracts));
        update({ ...entry, contracts: next });
      });
    });

    body.querySelectorAll('[data-setup]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.setup;
        const same = entrySetup(entry) === key;
        const name = key === 'other' ? (entry.entryModel?.name || 'My own setup') : ENTRY_MODELS[key].label;
        const tags = (entry.entryTags || []).filter((t) => t !== 'Dayli ICC Setup');
        update({
          ...entry,
          entryModel: { ...(entry.entryModel || {}), setup: key, steps: same ? (entry.entryModel?.steps || {}) : {} },
          iccChecklist: key === 'icc' ? (entry.iccChecklist || {}) : null,
          // The ICC tag keeps the setup-based insights counting Dayli ICC trades.
          entryTags: key === 'icc' ? [...tags, 'Dayli ICC Setup'] : tags,
          setupType: name,
        });
      });
    });

    body.querySelectorAll('[data-rule]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.rule;
        const setup = entrySetup(entry);
        if (setup === 'icc') {
          update({ ...entry, iccChecklist: { ...(entry.iccChecklist || {}), [key]: !entry.iccChecklist?.[key] } });
        } else {
          const steps = { ...(entry.entryModel?.steps || {}), [key]: !entry.entryModel?.steps?.[key] };
          update({ ...entry, entryModel: { ...(entry.entryModel || {}), steps } });
        }
      });
    });

    const modelName = body.querySelector('[data-model-name]');
    if (modelName) modelName.addEventListener('blur', () => {
      const name = modelName.value.trim().slice(0, 60);
      update({ ...entry, entryModel: { ...(entry.entryModel || {}), name }, setupType: name || 'My own setup' });
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
      group.querySelectorAll('.je-chip').forEach((btn) => {
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
      group.querySelectorAll('.je-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const current = entry[field] || [];
          const value = btn.dataset.chipValue;
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          const patch = { [field]: next };
          if (field === 'exitTags' && !next.includes('Took Profit Early')) patch.agreeWithEarlyExit = null;
          update({ ...entry, ...patch });
        });
      });
    });


    body.querySelectorAll('[data-emotion-stage]').forEach((group) => {
      const stage = group.dataset.emotionStage;
      group.querySelectorAll('.je-face').forEach((btn) => {
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

export function renderTradeCaseFile(container, entry, { onEdit, apiFetch }) {
  // The "trade story" layout lives in journal-v2.js.
  container.innerHTML = tradeStoryHtml(entry);
  if (entry.screenshots?.length && apiFetch) hydrateTscShots(container, apiFetch);
  container.querySelector('#jvEdit').addEventListener('click', onEdit);
  container.querySelector('#jvAsk').addEventListener('click', () => {
    sessionStorage.setItem('aghf_pending_agent_attachment', JSON.stringify({ type: 'trade', id: entry.id, label: `Trade ${entry.tradeDate}` }));
    window.location.href = 'psychology.html';
  });
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
    points: totals.avgPoints,
    executionGrade: entry.executionGrade,
    entryTags: entry.entryTags || [],
    entryReasoningShort: (entry.entryReasoning || '').slice(0, 140),
    exitReasoningShort: (entry.exitReasoning || '').slice(0, 140),
    emotions: entry.emotions || {},
    ruleCheck: entry.ruleCheck,
    biggestLesson: (entry.lessons || []).filter(Boolean)[0] || '',
    screenshotPath: entry.screenshots?.[0]?.path || null,
    entry,
  };
}

/** @param {ReturnType<typeof entryToSummaryCardProps>} props */
export function renderTradeSummaryCard(props, opts = {}) {
  // The illustrated card lives in journal-v2.js; props.entry carries the full record.
  return tradeCardHtml(props.entry || props, { variant: opts.variant || 'list' });
}
