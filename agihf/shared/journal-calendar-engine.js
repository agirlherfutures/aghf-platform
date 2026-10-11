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
import { dayPanelHtml } from './journal-v2.js';
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

/* ── View switcher (List / Calendar / Performance Summary) ─────────── */

export function renderViewSwitcher(container, activeView, onSwitch) {
  const views = [
    { key: 'list', label: 'List' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'summary', label: 'Performance Summary' },
  ];
  container.innerHTML = `<div class="chip-group jh-view-switch">
    ${views.map((v) => `<button type="button" class="chip ${v.key === activeView ? 'active' : ''}" data-view="${v.key}">${v.label}</button>`).join('')}
  </div>`;
  container.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => onSwitch(btn.dataset.view));
  });
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

/* ── Trade Day Drawer (Journal History's full calendar) ──────────────── */

/**
 * A slide-over from the right with the same day panel the Journal page
 * shows inline.
 * @param {{date:string, aggregate:object, trades:object[], plan?:object, reflections?:object[]}} data
 * @param {{onClose:Function}} handlers
 */
export function renderTradeDayDrawer(container, data, handlers) {
  const { date, aggregate, trades, plan, reflections } = data;
  container.innerHTML = `
    <div class="jh-day-drawer-host" id="jhDrawerHost">
      <div class="jh-day-drawer jv-day">
        <button type="button" class="jh-day-drawer-close" id="jhDrawerClose" aria-label="Close">✕</button>
        ${dayPanelHtml({ date, aggregate, trades, reflections, planNote: plan ? renderDayVsPlanNote(aggregate, plan) : '' })}
      </div>
    </div>`;
  wireDayPanel(container);
  const close = () => handlers.onClose();
  container.querySelector('#jhDrawerClose').addEventListener('click', close);
  container.querySelector('#jhDrawerHost').addEventListener('click', (e) => { if (e.target.id === 'jhDrawerHost') close(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  });
}

export function closeTradeDayDrawer(container) {
  container.innerHTML = '';
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
    container.innerHTML = `
      <div class="dd-card" style="margin-bottom:16px;">
        <div class="section-title" style="margin-bottom:6px;">Your Eval Plan</div>
        <div class="small-help" style="margin-bottom:14px;">No active plan yet — set one as active in the Pass Your Eval Calculator to track your progress here.</div>
        <a class="dd-primary-btn" href="eval-calculator.html">Open Eval Calculator</a>
      </div>`;
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

  container.innerHTML = `
    <div class="dd-card" style="margin-bottom:16px;">
      <div class="section-title" style="margin-bottom:10px;">Active Plan: ${plan.name}</div>
      <div class="jh-stats-row">
        <div class="jh-stat-tile hero"><div class="jh-stat-label">Remaining Target</div><div class="jh-stat-value">${target != null ? pnlSpan(remainingTarget) : '—'}</div></div>
        <div class="jh-stat-tile ${ddLimit != null ? '' : 'muted'}"><div class="jh-stat-label">Remaining Drawdown</div><div class="jh-stat-value">${ddLimit != null ? pnlSpan(remainingDd) : 'Not Sure'}</div></div>
        <div class="jh-stat-tile"><div class="jh-stat-label">Trading Days</div><div class="jh-stat-value">${daysElapsed}${minDays ? ` / ${minDays} min` : ''}</div></div>
        <div class="jh-stat-tile"><div class="jh-stat-label">Plan Risk Status</div><div class="jh-stat-value" style="font-size:1rem;">${riskCopy.label}</div></div>
      </div>
      ${consistency.applicable && consistency.status !== 'not_enough_data' ? `<div class="small-help" style="margin-top:10px;">Consistency rule: ${consistency.status === 'violated' ? `your best day was ${consistency.bestDayPct.toFixed(0)}% of total profit, above your ${plan.consistencyRulePct}% rule.` : 'within your consistency rule so far.'}</div>` : ''}
    </div>`;
}

/* ── Performance Summary view ─────────────────────────────────────── */

export function renderPerformanceSummaryView(container, summary, opts = {}) {
  if (summary.insufficientData) {
    container.innerHTML = `
      <div class="dd-card dd-empty">
        <div class="dd-empty-icon">📊</div>
        <div class="dd-empty-text">Not enough data yet — journal at least 3 trading days this month to see a performance summary.</div>
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="dd-card">
      <div class="section-title" style="margin-bottom:14px;">${opts.monthLabel || 'This Month'}</div>
      <div class="jh-stats-row">
        <div class="jh-stat-tile hero"><div class="jh-stat-label">Net P&amp;L</div><div class="jh-stat-value">${pnlSpan(summary.netPnl)}</div></div>
        <div class="jh-stat-tile"><div class="jh-stat-label">Trading Days</div><div class="jh-stat-value">${summary.tradingDaysCount}</div></div>
        <div class="jh-stat-tile"><div class="jh-stat-label">Win Rate</div><div class="jh-stat-value">${summary.winRate != null ? summary.winRate + '%' : '—'}</div></div>
        <div class="jh-stat-tile muted"><div class="jh-stat-label">Total Trades</div><div class="jh-stat-value">${summary.totalTrades}</div></div>
      </div>
      <div class="jh-stats-row" style="margin-top:12px;">
        <div class="jh-stat-tile"><div class="jh-stat-label">Best Day</div><div class="jh-stat-value">${pnlSpan(summary.bestDay?.netPnl)}</div></div>
        <div class="jh-stat-tile muted"><div class="jh-stat-label">Worst Day</div><div class="jh-stat-value">${pnlSpan(summary.worstDay?.netPnl)}</div></div>
        <div class="jh-stat-tile"><div class="jh-stat-label">Clean Execution Days</div><div class="jh-stat-value">★ ${summary.cleanExecutionDays}</div></div>
        <div class="jh-stat-tile ${summary.ruleViolationDays ? '' : 'muted'}"><div class="jh-stat-label">Rule Violation Days</div><div class="jh-stat-value">${summary.ruleViolationDays}</div></div>
      </div>
      ${summary.missedSetupDays ? `<div class="small-help" style="margin-top:12px;">${summary.missedSetupDays} day${summary.missedSetupDays === 1 ? '' : 's'} this month had a reviewed-and-passed setup with no trade taken.</div>` : ''}
      ${summary.journalingStreak != null ? `<div class="small-help" style="margin-top:6px;">Current journaling streak: ${summary.journalingStreak} day${summary.journalingStreak === 1 ? '' : 's'}.</div>` : ''}
    </div>`;
}
