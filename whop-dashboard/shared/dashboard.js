// dashboard.js — client logic for the standalone Whop tracker. No build
// step, no framework, same convention as the rest of this project.

const EVENT_LABELS = {
  joined: 'New member', renewed: 'Renewed', reactivated: 'Reactivated',
  cancelled: 'Cancelled', expired: 'Expired',
  payment_succeeded: 'Payment', payment_failed: 'Payment failed',
};
const GOOD_EVENTS = new Set(['joined', 'renewed', 'reactivated', 'payment_succeeded']);

function money(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function api(path, opts = {}) {
  const res = await fetch(path, { ...opts, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status, setupRequired: body.setupRequired });
  return body;
}

const loginWrap = document.getElementById('loginWrap');
const dashWrap = document.getElementById('dashWrap');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const root = document.getElementById('dashRoot');

let currentStats = null;

function kpiTile(label, value, subText, subClass) {
  return `<div class="kpi">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    ${subText ? `<div class="kpi-sub${subClass ? ' ' + subClass : ''}">${subText}</div>` : ''}
  </div>`;
}

function renderChart(dailyRevenue) {
  const w = 900, h = 220, padL = 40, padB = 20, padT = 10;
  const max = Math.max(1, ...dailyRevenue.map((d) => d.amount));
  const barGap = 2;
  const barW = (w - padL) / dailyRevenue.length - barGap;
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + (h - padT - padB) * (1 - f);
    return `<line class="gridline" x1="${padL}" y1="${y}" x2="${w}" y2="${y}"></line>
      <text class="axis-label" x="0" y="${y + 3}">${money(max * f).replace('.00', '')}</text>`;
  }).join('');
  const bars = dailyRevenue.map((d, i) => {
    const barH = (h - padT - padB) * (d.amount / max);
    const x = padL + i * (barW + barGap);
    const y = h - padB - barH;
    const label = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<rect class="bar" data-date="${label}" data-amount="${d.amount}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, barW).toFixed(1)}" height="${Math.max(0, barH).toFixed(1)}" rx="2"></rect>`;
  }).join('');
  const xLabels = dailyRevenue.filter((_, i) => i % 5 === 0).map((d) => {
    const i = dailyRevenue.indexOf(d);
    const x = padL + i * (barW + barGap);
    const label = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<text class="axis-label" x="${x.toFixed(1)}" y="${h}">${label}</text>`;
  }).join('');
  return `<div class="chart-wrap">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Daily revenue, last 30 days">
      ${gridLines}${bars}${xLabels}
    </svg>
    <div class="tooltip" id="chartTooltip"></div>
  </div>`;
}

function wireChartHover(container) {
  const tooltip = container.querySelector('#chartTooltip');
  container.querySelectorAll('.bar').forEach((bar) => {
    bar.addEventListener('mousemove', (e) => {
      const rect = container.querySelector('svg').getBoundingClientRect();
      tooltip.textContent = `${bar.dataset.date} — ${money(Number(bar.dataset.amount))}`;
      tooltip.style.left = `${e.clientX - rect.left}px`;
      tooltip.style.top = `${e.clientY - rect.top}px`;
      tooltip.classList.add('show');
    });
    bar.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
  });
}

function renderEventsTable(events) {
  if (!events.length) {
    return `<div class="empty-state">No member activity recorded yet. Once your Whop webhook is connected, joins, renewals, cancellations and payments will show up here in real time.</div>`;
  }
  const rows = events.map((e) => {
    const good = GOOD_EVENTS.has(e.event_type);
    return `<tr>
      <td><span class="event-dot ${good ? 'good' : 'critical'}"></span>${EVENT_LABELS[e.event_type] || e.event_type}</td>
      <td>${e.email || e.membership_id || '—'}</td>
      <td>${e.amount != null ? `<span class="event-amount">${money(e.amount)}</span>` : '—'}</td>
      <td>${relTime(e.occurred_at)}</td>
    </tr>`;
  }).join('');
  return `<table class="events-table">
    <thead><tr><th>Event</th><th>Member</th><th>Amount</th><th>When</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderError(err) {
  root.innerHTML = `<div class="error-box">
    <div class="title">Something went wrong loading the dashboard</div>
    <div class="msg">${err?.message || 'An unexpected error occurred.'}</div>
    <button type="button" class="btn primary" onclick="location.reload()">Reload</button>
  </div>`;
}

function render(stats, { syncing } = {}) {
  root.innerHTML = `
    ${!stats.recentEvents.length && !stats.activeMembers ? `<div class="setup-note">
      <strong>No Whop data yet.</strong> Connect your Whop webhook to <code>/api/whop-webhook</code> and set <code>WHOP_API_KEY</code> / <code>WHOP_WEBHOOK_SECRET</code> to start tracking members and revenue. Then run a first <em>Sync now</em> below to backfill existing members.
    </div>` : ''}

    <div class="dash-actions" style="justify-content:flex-end;">
      <div style="text-align:right;">
        <button type="button" class="btn primary" id="syncBtn" ${syncing ? 'disabled' : ''}>${syncing ? 'Syncing…' : 'Sync now'}</button>
        <div class="sync-meta">${stats.lastSync?.last_synced_at
          ? `Last synced ${relTime(stats.lastSync.last_synced_at)}${stats.lastSync.last_sync_status === 'error' ? ` — error: ${stats.lastSync.last_sync_error}` : ''}`
          : 'Never synced'}</div>
      </div>
    </div>

    <div class="kpi-grid">
      ${kpiTile('Active Members', stats.activeMembers.toLocaleString())}
      ${kpiTile('New This Week', '+' + stats.members.newThisWeek, `${stats.members.churnedThisWeek} churned`, stats.members.netThisWeek >= 0 ? 'pos' : 'neg')}
      ${kpiTile('Net This Month', (stats.members.netThisMonth >= 0 ? '+' : '') + stats.members.netThisMonth, `${stats.members.newThisMonth} new / ${stats.members.churnedThisMonth} churned`)}
      ${kpiTile('Revenue Today', money(stats.revenue.today))}
      ${kpiTile('Revenue This Week', money(stats.revenue.thisWeek))}
      ${kpiTile('Revenue This Month', money(stats.revenue.thisMonth))}
      ${kpiTile('Est. Run Rate', money(stats.revenue.estMonthlyRunRate), 'trailing 30-day revenue')}
    </div>

    <div class="card">
      <div class="card-title">Daily Revenue — Last 30 Days</div>
      ${renderChart(stats.dailyRevenue)}
    </div>

    <div class="card">
      <div class="card-title">Recent Activity</div>
      ${renderEventsTable(stats.recentEvents)}
    </div>
  `;
  wireChartHover(root.querySelector('.chart-wrap'));
  root.querySelector('#syncBtn').addEventListener('click', onSync);
}

async function onSync() {
  try {
    render(currentStats, { syncing: true });
    await api('/api/sync', { method: 'POST' });
    currentStats = await api('/api/dashboard');
    render(currentStats);
  } catch (err) {
    console.error('Sync error:', err);
    alert(`Sync failed: ${err.message}`);
    render(currentStats);
  }
}

async function loadDashboard() {
  try {
    currentStats = await api('/api/dashboard');
    loginWrap.hidden = true;
    dashWrap.hidden = false;
    render(currentStats);
  } catch (err) {
    if (err.status === 401) { showLogin(); return; }
    console.error('Dashboard load error:', err);
    loginWrap.hidden = true;
    dashWrap.hidden = false;
    renderError(err);
  }
}

function showLogin() {
  dashWrap.hidden = true;
  loginWrap.hidden = false;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  try {
    const password = document.getElementById('passwordInput').value;
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
    await loadDashboard();
  } catch (err) {
    loginError.textContent = err.message || 'Incorrect password';
  } finally {
    loginBtn.disabled = false;
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch { /* cookie clears regardless of network hiccup */ }
  showLogin();
});

loadDashboard();
