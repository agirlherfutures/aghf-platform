/**
 * journal-calendar-engine.js — A Girl & Her Futures™
 *
 * Render layer for the Monthly Trade Journal Calendar. Presentation only —
 * every number comes from journal-calendar-math.js, never recomputed here.
 * This is the app's first pill-toggle view switcher (List/Calendar/
 * Performance Summary), built from the existing `.chip`/`.chip-group`
 * classes, and the first month-grid layout anywhere in the app.
 *
 * Never color-only: every day cell pairs its color with an icon/label, and
 * every "Clean Execution"/"Rule Violation" marker is independent of the
 * day's P&L sign (a losing, rule-following day still gets the clean-
 * execution star; a winning, rule-breaking day never does).
 */

import { classifyDayBadge, classifyDayVsPlan } from './journal-calendar-math.js';
import {
  computeProfitTargetDollar, computeRemainingProfitTarget, computeDrawdownLimitDollar,
  computeRemainingDrawdown, computeConsistencyRuleStatus, classifyPlanRiskStatus,
} from './eval-calculator-math.js';
import { PLAN_RISK_STATUS_COPY } from './eval-copy.js';

const BADGE_META = {
  profit: { label: 'Profit', icon: '↗', cellClass: 'jh-day-profit' },
  loss: { label: 'Loss', icon: '↘', cellClass: 'jh-day-loss' },
  breakeven: { label: 'Breakeven', icon: '→', cellClass: 'jh-day-breakeven' },
  missed_setup: { label: 'Missed Setup', icon: '◌', cellClass: 'jh-day-missed' },
  no_trades: { label: 'No trades', icon: '', cellClass: 'jh-day-empty' },
};

export function isPnlHidden() {
  return localStorage.getItem('aghf_snapshot_private') === '1';
}

function fmtPnl(n) {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}$${Math.abs(Math.round(n))}`;
}

function pnlSpan(n, extraClass = '') {
  return `<span class="${extraClass} ${isPnlHidden() ? 'dd-blurred' : ''}">${fmtPnl(n)}</span>`;
}

/* ── Calendar view ────────────────────────────────────────────────── */

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TONE = { profit: 'win', loss: 'loss', breakeven: 'even', missed_setup: 'missed', no_trades: '' };

/** Sums a week's 7 cells. Filler cells from an adjacent month always carry a
 * null aggregate, so only the displayed month's days are tallied. */
function weekNetPnl(weekCells) {
  return weekCells.reduce((s, c) => s + (c.aggregate?.netPnl || 0), 0);
}

function toneOf(n) {
  return n > 0 ? 'win' : n < 0 ? 'loss' : 'even';
}

/** Null (never a misleading $0) when nothing has been logged this month yet. */
function monthNetPnl(grid) {
  const currentMonthCells = grid.filter((c) => c.isCurrentMonth);
  if (!currentMonthCells.some((c) => c.aggregate?.tradeCount)) return null;
  return currentMonthCells.reduce((s, c) => s + (c.aggregate?.netPnl || 0), 0);
}

function renderDayCell(cell, trades, selected) {
  const badge = classifyDayBadge(cell.aggregate);
  const meta = BADGE_META[badge];
  const agg = cell.aggregate;
  const classes = ['jv-d', TONE[badge] || ''];
  if (!cell.isCurrentMonth) classes.push('out');
  if (cell.isToday) classes.push('today');
  if (selected) classes.push('sel');
  const marks = [];
  if (agg?.cleanExecution === true) marks.push('<i class="star" title="Clean execution">★</i>');
  if (agg?.ruleAdherenceStatus === 'violated') marks.push('<i class="bang" title="Rule broken">!</i>');
  const dots = (trades || []).map((t) => `<i class="${t.ruleCheck === 'yes' ? '' : t.ruleCheck === 'mostly' ? 'mid' : t.ruleCheck === 'no' ? 'no' : 'none'}"></i>`).join('');
  return `<button type="button" class="${classes.join(' ')}" data-cell-date="${cell.date}" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${cell.date}${agg?.tradeCount ? `, ${agg.tradeCount} trade${agg.tradeCount === 1 ? '' : 's'}, ${meta.label}` : agg?.missedSetup ? ', passed on a setup' : ', no trades'}">
    <span class="n">${cell.dayOfMonth}</span>
    ${marks.length ? `<span class="marks">${marks.join('')}</span>` : ''}
    ${agg?.tradeCount ? `<b>${pnlSpan(agg.netPnl)}</b><small>${agg.tradeCount} trade${agg.tradeCount === 1 ? '' : 's'}</small>` : agg?.missedSetup ? '<small>Passed</small>' : ''}
    ${dots ? `<span class="dots">${dots}</span>` : ''}
  </button>`;
}

/**
 * @param {{year:number, month:number, grid:object[], monthLabel:string, tradesByDate?:Map, selectedDate?:string}} data
 * @param {{onPrev:Function, onNext:Function, onToday:Function, onSelectDay:Function}} handlers
 */
export function renderCalendarView(container, data, handlers) {
  const weeks = [];
  for (let i = 0; i < data.grid.length; i += 7) weeks.push(data.grid.slice(i, i + 7));
  // Drop a trailing all-filler week so a 5-week month doesn't show a dead row.
  while (weeks.length && weeks[weeks.length - 1].every((c) => !c.isCurrentMonth)) weeks.pop();
  const days = weeks.map((week) => {
    const hasTrades = week.some((c) => c.aggregate?.tradeCount);
    const total = weekNetPnl(week);
    return week.map((c) => renderDayCell(c, data.tradesByDate?.get(c.date), c.date === data.selectedDate)).join('')
      + `<div class="jv-wk"><b class="${hasTrades ? toneOf(total) : 'none'}">${hasTrades ? pnlSpan(total) : '–'}</b></div>`;
  }).join('');
  const monthTotal = monthNetPnl(data.grid);
  const [mName, mYear] = data.monthLabel.split(' ');

  container.innerHTML = `<div class="jv-cal">
    <div class="jv-cal-head">
      <button type="button" class="jv-arr" id="jhCalPrev" aria-label="Previous month">←</button>
      <h3>${mName} <em class="jv-p">${mYear || ''}</em></h3>
      <button type="button" class="jv-arr" id="jhCalNext" aria-label="Next month">→</button>
      <button type="button" class="jv-today" id="jhCalToday">Today</button>
    </div>
    <div class="jv-grid">${WEEKDAY_LABELS.map((d) => `<div class="jv-dow">${d}</div>`).join('')}<div class="jv-dow wk">Week</div>${days}</div>
    <div class="jv-cal-foot">
      <div class="jv-legend">
        <span><i class="sw win"></i>Green day</span><span><i class="sw loss"></i>Red day</span><span><i class="sw even"></i>Breakeven</span>
        <span><i class="dot"></i>One dot per trade, by plan</span><span><i class="star">★</i>Clean execution</span><span><i class="bang">!</i>Rule broken</span>
      </div>
      <div class="jv-month-total">Month: ${monthTotal == null ? '<span class="none">no trades yet</span>' : `<b class="${toneOf(monthTotal)}">${pnlSpan(monthTotal)}</b>`}</div>
    </div>
  </div>`;

  container.querySelector('#jhCalPrev').addEventListener('click', handlers.onPrev);
  container.querySelector('#jhCalNext').addEventListener('click', handlers.onNext);
  container.querySelector('#jhCalToday').addEventListener('click', handlers.onToday);
  container.querySelectorAll('[data-cell-date]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onSelectDay(btn.dataset.cellDate));
  });
}

/** Wires the day panel's Ask-the-Agent button (shared by the inline panel and the drawer). */
export function wireDayPanel(container) {
  container.querySelector('[data-ask-day]')?.addEventListener('click', (e) => {
    const date = e.currentTarget.dataset.askDay;
    sessionStorage.setItem('aghf_pending_agent_attachment', JSON.stringify({ type: 'day', metadata: { date }, label: `Day: ${date}` }));
    window.location.href = 'psychology.html';
  });
}

/* ── Evaluation Plan Integration ──────────────────────────────────── */

const DAY_VS_PLAN_COPY = {
  risk_exceeded: 'Risk Exceeded',
  trade_limit_exceeded: 'Trade Limit Exceeded',
  within_plan: 'Within Plan',
};

/** A calm, factual line for the day drawer — never worded as a failure or scolding. */
export function renderDayVsPlanNote(aggregate, plan) {
  const status = classifyDayVsPlan(aggregate, plan);
  if (!status) return '';
  const notes = [];
  if (status.riskStatus === 'risk_exceeded') notes.push('This day\'s loss was larger than your plan\'s daily loss limit.');
  if (status.tradeCountStatus === 'trade_limit_exceeded') notes.push('More trades were taken than your plan\'s daily max.');
  if (status.journalStatus === 'incomplete') notes.push('Journal reflection wasn\'t completed for every trade this day.');
  if (!notes.length) return `<div class="jv-plan-note good">✓ Within your evaluation plan’s daily rules.</div>`;
  return `<div class="jv-plan-note">${notes.join(' ')}</div>`;
}

/**
 * Shown only when an active plan exists. Target progress, drawdown
 * remaining, days completed/remaining, consistency status, and a plan
 * risk status — all read-only, never overwriting the plan's own saved
 * assumptions.
 */
export function renderEvalPlanProgressStrip(container, plan, dayAggregates) {
  if (!plan) {
    container.innerHTML = `<div class="jv-plan-card empty">
      <div><span class="jv-kicker">Pass Your Eval</span><h3>Track an evaluation <em class="jv-p">here.</em></h3>
      <p>Set a plan as active in the Evaluation Lab and its target, drawdown and days show up next to your calendar.</p></div>
      <a class="jv-btn ghost" href="eval-calculator.html">Open the Evaluation Lab</a></div>`;
    return;
  }
  const target = computeProfitTargetDollar(plan);
  const remainingTarget = computeRemainingProfitTarget(plan);
  const ddLimit = computeDrawdownLimitDollar(plan);
  const remainingDd = computeRemainingDrawdown(plan);
  const daysElapsed = plan.tradingDaysElapsed || 0;
  const minDays = plan.minTradingDays;
  const tradingDays = (dayAggregates || []).filter((d) => d.tradeCount > 0);
  const consistency = computeConsistencyRuleStatus(plan, tradingDays);
  const { status: riskStatusKey } = classifyPlanRiskStatus(plan);
  const riskCopy = PLAN_RISK_STATUS_COPY[riskStatusKey];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  container.innerHTML = `<div class="jv-plan-card">
    <div class="jv-plan-head"><span class="jv-kicker">Active evaluation</span><h3>${esc(plan.name)}</h3></div>
    <div class="jv-plan-tiles">
      <div class="jv-st" style="--c:#3E9E93"><small>Target left</small><b>${target != null ? pnlSpan(remainingTarget) : '–'}</b></div>
      <div class="jv-st" style="--c:#E0607C"><small>Drawdown left</small><b>${ddLimit != null ? pnlSpan(remainingDd) : 'Not sure'}</b></div>
      <div class="jv-st" style="--c:#7F77DD"><small>Trading days</small><b>${daysElapsed}${minDays ? ` <span>of ${minDays}</span>` : ''}</b></div>
      <div class="jv-st" style="--c:#F5A857"><small>Plan risk</small><b style="font-size:17px">${esc(riskCopy.label)}</b></div>
    </div>
    ${consistency.applicable && consistency.status !== 'not_enough_data' ? `<p class="jv-plan-foot">Consistency rule: ${consistency.status === 'violated' ? `your best day was ${consistency.bestDayPct.toFixed(0)}% of total profit, above your ${plan.consistencyRulePct}% rule.` : 'within your rule so far.'}</p>` : ''}
  </div>`;
}

/* ── Performance view ────────────────────────────────────────────── */

/**
 * @param {object} summary from computeMonthSummary()
 * @param {{monthLabel?:string, days?:object[], onPrev?:Function, onNext?:Function}} opts days = that month's day aggregates, for the bar chart
 */
export function renderPerformanceSummaryView(container, summary, opts = {}) {
  const [mName, mYear] = (opts.monthLabel || 'This month').split(' ');
  const nav = `<div class="jv-cal-head"><button type="button" class="jv-arr" data-perf="prev" aria-label="Previous month">←</button><h3>${mName} <em class="jv-p">${mYear || ''}</em></h3><button type="button" class="jv-arr" data-perf="next" aria-label="Next month">→</button></div>`;
  const wire = () => {
    container.querySelector('[data-perf="prev"]')?.addEventListener('click', () => opts.onPrev?.());
    container.querySelector('[data-perf="next"]')?.addEventListener('click', () => opts.onNext?.());
  };
  if (summary.insufficientData) {
    container.innerHTML = `<div class="jv-perf">${nav}<div class="jv-empty"><h3>A few more days <em class="jv-p">to go.</em></h3>
      <p>Journal at least 3 trading days in a month to see its performance. ${summary.tradingDaysCount ? `You have ${summary.tradingDaysCount} so far.` : ''}</p></div></div>`;
    wire();
    return;
  }
  const traded = (opts.days || []).filter((d) => d.tradeCount > 0).sort((a, b) => a.date.localeCompare(b.date));
  const max = Math.max(1, ...traded.map((d) => Math.abs(d.netPnl || 0)));
  const bars = traded.map((d) => {
    const h = Math.max(4, Math.round((Math.abs(d.netPnl || 0) / max) * 70));
    const cls = d.netPnl > 0 ? 'win' : d.netPnl < 0 ? 'loss' : 'even';
    return `<div class="jv-bar ${cls}" title="${d.date}: ${fmtPnl(d.netPnl)}"><i style="height:${h}px"></i>${d.cleanExecution === true ? '<em>★</em>' : ''}<small>${Number(d.date.slice(8))}</small></div>`;
  }).join('');
  const tone = summary.netPnl > 0 ? 'win' : summary.netPnl < 0 ? 'loss' : 'even';
  container.innerHTML = `<div class="jv-perf">${nav}
    <div class="jv-stats">
      <div class="jv-st" style="--c:${summary.netPnl >= 0 ? '#3E9E93' : '#E0607C'}"><small>Net P&amp;L</small><b>${pnlSpan(summary.netPnl)}</b><span>${summary.totalTrades} trades</span></div>
      <div class="jv-st" style="--c:#7F77DD"><small>Win rate</small><b>${summary.winRate != null ? `${summary.winRate}%` : '–'}</b><span>${summary.wins} wins · ${summary.losses} losses</span></div>
      <div class="jv-st" style="--c:#F5A857"><small>Best day</small><b>${pnlSpan(summary.bestDay?.netPnl)}</b><span>${summary.bestDay ? new Date(`${summary.bestDay.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span></div>
      <div class="jv-st" style="--c:#F4829A"><small>Toughest day</small><b>${pnlSpan(summary.worstDay?.netPnl)}</b><span>${summary.worstDay ? new Date(`${summary.worstDay.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span></div>
    </div>
    <div class="jv-panel"><span class="jv-kicker">Day by day</span><h3>How the month <em class="jv-t">${tone === 'win' ? 'grew.' : 'moved.'}</em></h3>
      <div class="jv-bars">${bars}</div><div class="jv-bars-base"></div>
      <div class="jv-legend"><span><i class="sw win"></i>Green day</span><span><i class="sw loss"></i>Red day</span><span><i class="star">★</i>Clean execution</span></div>
    </div>
    <div class="jv-process">
      <div class="good"><b>★ ${summary.cleanExecutionDays}</b><small>clean execution day${summary.cleanExecutionDays === 1 ? '' : 's'}</small></div>
      <div class="${summary.ruleViolationDays ? 'hard' : 'good'}"><b>${summary.ruleViolationDays}</b><small>day${summary.ruleViolationDays === 1 ? '' : 's'} with a broken rule</small></div>
      <div class="purple"><b>${summary.missedSetupDays}</b><small>setup${summary.missedSetupDays === 1 ? '' : 's'} you passed on</small></div>
      <div class="mixed"><b>${summary.journalingStreak ?? 0}</b><small>day journal streak</small></div>
    </div>
  </div>`;
  wire();
}
