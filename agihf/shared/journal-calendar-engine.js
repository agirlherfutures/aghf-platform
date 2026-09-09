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

import { classifyDayBadge } from './journal-calendar-math.js';
import { renderTradeSummaryCard, entryToSummaryCardProps } from './journal-engine.js';

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

function renderDayCell(cell) {
  const badge = classifyDayBadge(cell.aggregate);
  const meta = BADGE_META[badge];
  const agg = cell.aggregate;
  const classes = ['jh-day-cell', meta.cellClass];
  if (!cell.isCurrentMonth) classes.push('jh-day-filler');
  if (cell.isToday) classes.push('jh-day-today');

  const markers = [];
  if (agg?.cleanExecution === true) markers.push('<span class="jh-day-marker jh-day-marker-clean" title="Clean Execution">★</span>');
  if (agg?.ruleAdherenceStatus === 'violated') markers.push('<span class="jh-day-marker jh-day-marker-violation" title="Rule violation">!</span>');
  if (agg?.hasScreenshot) markers.push('<span class="jh-day-marker" title="Has screenshot">📷</span>');
  if (agg?.missedSetup) markers.push('<span class="jh-day-marker" title="Missed/passed setup">◌</span>');

  return `
    <button type="button" class="${classes.join(' ')}" data-cell-date="${cell.date}" aria-label="${cell.date}${agg?.tradeCount ? `, ${agg.tradeCount} trade${agg.tradeCount === 1 ? '' : 's'}, ${meta.label}` : ', no trades'}">
      <div class="jh-day-num">${cell.dayOfMonth}</div>
      ${agg?.tradeCount ? `
        <div class="jh-day-pnl">${meta.icon} ${pnlSpan(agg.netPnl)}</div>
        <div class="jh-day-count">${agg.tradeCount} trade${agg.tradeCount === 1 ? '' : 's'}</div>
      ` : agg?.missedSetup ? `<div class="jh-day-count">${meta.label}</div>` : ''}
      ${markers.length ? `<div class="jh-day-markers">${markers.join('')}</div>` : ''}
    </button>`;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * @param {{year:number, month:number, grid:object[], monthLabel:string}} data
 * @param {{onPrev:Function, onNext:Function, onToday:Function, onSelectDay:Function, onCreateEntryForDate:Function}} handlers
 */
export function renderCalendarView(container, data, handlers) {
  container.innerHTML = `
    <div class="dd-card">
      <div class="jh-cal-nav">
        <button type="button" class="dd-icon-btn" id="jhCalPrev" aria-label="Previous month">←</button>
        <div class="jh-cal-month-label">${data.monthLabel}</div>
        <button type="button" class="dd-icon-btn" id="jhCalNext" aria-label="Next month">→</button>
        <button type="button" class="dd-secondary-btn" id="jhCalToday" style="margin-left:auto;">Today</button>
      </div>
      <div class="jh-cal-grid jh-cal-weekdays">${WEEKDAY_LABELS.map((d) => `<div class="jh-cal-weekday">${d}</div>`).join('')}</div>
      <div class="jh-cal-grid jh-cal-days">${data.grid.map(renderDayCell).join('')}</div>
      <div class="jh-cal-legend">
        <span><span class="jh-legend-swatch jh-day-profit"></span> Profit</span>
        <span><span class="jh-legend-swatch jh-day-loss"></span> Loss</span>
        <span><span class="jh-legend-swatch jh-day-breakeven"></span> Breakeven</span>
        <span>★ Clean Execution</span>
        <span>! Rule violation</span>
        <span>◌ Missed setup</span>
      </div>
    </div>
    <!-- Mobile agenda-list fallback, matching .jh-stats-row's existing max-900px breakpoint convention -->
    <div class="jh-cal-agenda">
      ${data.grid.filter((c) => c.isCurrentMonth && (c.aggregate?.tradeCount || c.aggregate?.missedSetup)).map((c) => {
        const badge = classifyDayBadge(c.aggregate);
        const meta = BADGE_META[badge];
        return `<button type="button" class="jh-agenda-row ${meta.cellClass}" data-cell-date="${c.date}">
          <span class="jh-agenda-date">${c.date}</span>
          <span class="jh-agenda-pnl">${c.aggregate.tradeCount ? pnlSpan(c.aggregate.netPnl) : meta.label}</span>
          ${c.aggregate.cleanExecution === true ? '<span class="jh-day-marker jh-day-marker-clean">★</span>' : ''}
        </button>`;
      }).join('') || '<div class="small-help">Nothing logged this month yet.</div>'}
    </div>`;

  container.querySelector('#jhCalPrev').addEventListener('click', handlers.onPrev);
  container.querySelector('#jhCalNext').addEventListener('click', handlers.onNext);
  container.querySelector('#jhCalToday').addEventListener('click', handlers.onToday);
  container.querySelectorAll('[data-cell-date]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onSelectDay(btn.dataset.cellDate));
  });
}

/* ── Trade Day Drawer ─────────────────────────────────────────────── */

/**
 * A slide-over from the right, replicating agent-engine.js's `.agc-panel`
 * full-height technique (not literally reused — that one is scoped to the
 * agent workspace's own closure).
 * @param {{date:string, aggregate:object, trades:object[], checklists:object[]}} data
 * @param {{onClose:Function, apiFetch:Function}} handlers
 */
export function renderTradeDayDrawer(container, data, handlers) {
  const { date, aggregate, trades } = data;
  const badge = classifyDayBadge(aggregate);
  const meta = BADGE_META[badge];

  container.innerHTML = `
    <div class="jh-day-drawer-host" id="jhDrawerHost">
      <div class="jh-day-drawer">
        <button type="button" class="jh-day-drawer-close" id="jhDrawerClose" aria-label="Close">✕</button>
        <div class="jh-day-drawer-header">
          <div class="pg-eye" style="margin-bottom:2px;">${date}</div>
          <div class="jh-day-drawer-pnl">${meta.icon} ${aggregate.tradeCount ? pnlSpan(aggregate.netPnl) : meta.label}</div>
        </div>
        <div class="jh-stats-row" style="margin:14px 0;">
          <div class="jh-stat-tile"><div class="jh-stat-label">Trades</div><div class="jh-stat-value">${aggregate.tradeCount}</div></div>
          <div class="jh-stat-tile"><div class="jh-stat-label">Win / Loss / BE</div><div class="jh-stat-value" style="font-size:1rem;">${aggregate.wins}W · ${aggregate.losses}L · ${aggregate.breakeven}BE</div></div>
          <div class="jh-stat-tile ${aggregate.cleanExecution === true ? '' : 'muted'}"><div class="jh-stat-label">Clean Execution</div><div class="jh-stat-value" style="font-size:1rem;">${aggregate.cleanExecution === true ? '★ Yes' : aggregate.cleanExecution === false ? 'No' : 'Not enough data'}</div></div>
          <div class="jh-stat-tile muted"><div class="jh-stat-label">Journal Complete</div><div class="jh-stat-value" style="font-size:1rem;">${aggregate.journalComplete == null ? '—' : aggregate.journalComplete ? 'Yes' : 'Incomplete'}</div></div>
        </div>
        ${aggregate.missedSetup ? `<div class="small-help" style="margin-bottom:14px;">A setup was reviewed and passed on this day — tracked separately, not counted as a trade.</div>` : ''}
        <div id="jhDrawerTrades">
          ${trades.length ? trades.map((t) => renderTradeSummaryCard(entryToSummaryCardProps(t), { variant: 'list' })).join('') : '<div class="small-help">No trades logged this day.</div>'}
        </div>
        <div style="margin-top:16px;">
          <a class="dd-primary-btn" href="journal-entry.html?tradeDate=${date}">Add Entry for This Day</a>
        </div>
      </div>
    </div>`;

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
