/**
 * challenge-engine.js — A Girl & Her Futures™ (client-safe render layer)
 *
 * Presentation-only render functions for the AGHF Monthly Challenge —
 * countdown hero, "Your Challenge Progress," Ways to Earn, weekly momentum
 * strip, Achievement Rankings tabs/table, winner cards, the Previous
 * Winners archive, the private entry ledger, the privacy prefs panel, and
 * the notification bell. Deliberately separate from
 * agihf/api/_lib/challenge-engine.js (the server-only cryptographic
 * winner-selection algorithm, which needs Node's `crypto` module and can
 * never be served to the browser) — this file lives in agihf/shared/,
 * which every page loads directly via `<script type="module">`.
 *
 * Follows the exact conventions already proven in wins-engine.js:
 * `container.innerHTML = ...` + `container.querySelectorAll(...)` event
 * delegation, a small `escapeHtml`/`fmtDate` helper pair, and a
 * `xToCardProps(row) + renderXCard(props)` split for anything shown as a
 * card in more than one place. Copy comes from challenge-copy.js — this
 * file has zero hardcoded member-facing strings beyond structural glue.
 */

import {
  HERO_COPY, CHALLENGE_STATUS_COPY, COUNTDOWN_STATES, countdownStateFor,
  ACTIVITY_TYPE_LABELS, LEADERBOARD_CATEGORIES, leaderboardCategoryLabel,
  ENTRY_STATUS_LABELS, PROGRESS_COPY, ENTRY_LEDGER_EMPTY_STATE,
  PREVIOUS_WINNERS_EMPTY_STATE, PRIZE_EMPTY_STATE, WEEKLY_MOMENTUM_LABELS, NOTIFICATION_TYPE_META,
} from './challenge-copy.js';
import { renderAvatar } from './avatar.js';

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** A small colored-circle bubble around an emoji, mirroring renderAvatar's
 * markup shape but for an icon instead of an initial letter. */
function renderIconBubble(icon) {
  return `<span class="chal-way-icon-bubble" aria-hidden="true">${icon}</span>`;
}

/** Reusable warm empty-state card (dashed border + radial glow, matching
 * wins.css's .win-empty-state) — used everywhere Monthly Challenge has
 * genuinely nothing real to show yet. Never fabricates a row; only
 * upgrades how "nothing yet" is presented. */
function renderChalEmptyState(icon, heading, body) {
  return `<div class="chal-empty-state">
    <div class="chal-empty-icon" aria-hidden="true">${icon}</div>
    <div class="chal-empty-heading">${heading}</div>
    <p class="chal-empty-body">${body}</p>
  </div>`;
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** {days, hours} until a target ISO timestamp, clamped at zero — never a
 * negative countdown once the target has passed. */
function timeUntil(targetIso) {
  const ms = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return { days, hours };
}

/* ── Dashboard teaser card ───────────────────────────────────────────── */

export function renderChallengeTeaserCard(container, challenge, progress) {
  if (!challenge) {
    container.innerHTML = `
      <div class="dd-share-win-card">
        <div class="dd-share-win-copy">
          <div class="win-card-headline" style="margin-bottom:4px;">${HERO_COPY.title}</div>
          <p class="small-help">${HERO_COPY.tagline}</p>
          <a class="dd-primary-btn" href="monthly-challenge.html">Check It Out</a>
        </div>
      </div>`;
    return;
  }
  const stateKey = countdownStateFor(challenge.status);
  const state = stateKey ? COUNTDOWN_STATES[stateKey] : null;
  container.innerHTML = `
    <div class="dd-share-win-card">
      <div class="dd-share-win-copy">
        <div class="win-card-headline" style="margin-bottom:4px;">${escapeHtml(challenge.name)}</div>
        <p class="small-help">${state ? `${state.icon} ${state.label}` : ''}${progress ? ` · ${progress.entriesEarned} ${progress.entriesEarned === 1 ? 'entry' : 'entries'} earned` : ''}</p>
        <a class="dd-primary-btn" href="monthly-challenge.html">Open Monthly Challenge</a>
      </div>
    </div>`;
}

/* ── Countdown hero — 5 status-driven states, per COUNTDOWN_STATES ─────── */

export function renderCountdownHero(container, challenge) {
  if (!challenge) {
    container.innerHTML = `<div class="chal-hero chal-hero-empty">
      <div class="chal-hero-eyebrow">${HERO_COPY.eyebrow}</div>
      <h1 class="chal-hero-title">${HERO_COPY.title}</h1>
      <p class="chal-hero-tagline">${HERO_COPY.tagline}</p>
      <p class="small-help">${CHALLENGE_STATUS_COPY.scheduled.body}</p>
    </div>`;
    return;
  }

  const stateKey = countdownStateFor(challenge.status);
  const state = stateKey ? COUNTDOWN_STATES[stateKey] : null;
  const statusCopy = CHALLENGE_STATUS_COPY[challenge.status] || CHALLENGE_STATUS_COPY.active;

  let countdownHtml = '';
  if (stateKey === 'entries_open') {
    const { days, hours } = timeUntil(challenge.endsAt);
    countdownHtml = `<div class="chal-countdown"><span class="chal-countdown-num">${days}</span>d <span class="chal-countdown-num">${hours}</span>h left to earn entries</div>`;
  } else if (stateKey === 'entries_closed') {
    const { days, hours } = timeUntil(challenge.drawingAt);
    countdownHtml = `<div class="chal-countdown"><span class="chal-countdown-num">${days}</span>d <span class="chal-countdown-num">${hours}</span>h until the drawing</div>`;
  }

  container.innerHTML = `<div class="chal-hero chal-hero-${stateKey || 'default'}">
    <span class="chal-hero-sparkle s1" aria-hidden="true">✦</span><span class="chal-hero-sparkle s2" aria-hidden="true">✦</span><span class="chal-hero-sparkle s3" aria-hidden="true">✧</span>
    <div class="chal-hero-eyebrow">${HERO_COPY.eyebrow}</div>
    <h1 class="chal-hero-title">${escapeHtml(challenge.name)}</h1>
    <p class="chal-hero-tagline">${HERO_COPY.tagline}</p>
    <div class="chal-hero-status">${state ? `${state.icon} ${state.label}` : statusCopy.heading}</div>
    <p class="chal-hero-body">${statusCopy.body}</p>
    ${countdownHtml}
  </div>`;
}

/* ── This month's prize — the "why" behind earning entries. Text only:
   prize.imagePath points into a private bucket with no member-facing
   signed-URL resolution today, so no image is rendered here yet. ──────── */

export function renderPrizeCard(container, prize) {
  if (!prize) {
    container.innerHTML = renderChalEmptyState('🎁', PRIZE_EMPTY_STATE.heading, PRIZE_EMPTY_STATE.body);
    return;
  }
  container.innerHTML = `<div class="chal-prize-card">
    <div class="chal-prize-eyebrow">🎁 This Month's Prize</div>
    <div class="chal-prize-name">${escapeHtml(prize.name)}</div>
    ${prize.estimatedValue ? `<span class="chal-prize-value">${escapeHtml(String(prize.estimatedValue))}</span>` : ''}
    ${prize.description ? `<p class="chal-prize-body">${escapeHtml(prize.description)}</p>` : ''}
  </div>`;
}

/* ── Your Challenge Progress — never an absolute rank, momentum only
   when both weeks have real data ──────────────────────────────────────── */

export function renderYourProgressCard(container, progress) {
  if (!progress) { container.innerHTML = ''; return; }
  const momentumLine = progress.momentum?.available
    ? (progress.momentum.pctChange >= 0 ? PROGRESS_COPY.momentumUp(progress.momentum.pctChange) : PROGRESS_COPY.momentumDown(progress.momentum.pctChange))
    : PROGRESS_COPY.momentumUnavailable;

  const milestoneLine = progress.qualified
    ? PROGRESS_COPY.qualified
    : (progress.nextMilestone
      ? PROGRESS_COPY.nextMilestone(progress.nextMilestone.label, progress.nextMilestone.remaining, progress.nextMilestone.requiredQuantity)
      : PROGRESS_COPY.notYetQualified(progress.activitiesAwayFromQualifying));

  container.innerHTML = `<div class="chal-progress-card">
    <div class="chal-progress-heading">Your Challenge Progress</div>
    <div class="chal-progress-stats">
      <div class="chal-progress-stat"><span class="chal-progress-num">${progress.points}</span><span class="chal-progress-label">Points</span></div>
      <div class="chal-progress-stat"><span class="chal-progress-num">${progress.entriesEarned}</span><span class="chal-progress-label">Entries</span></div>
      <div class="chal-progress-stat"><span class="chal-progress-num">${progress.activitiesCompleted}</span><span class="chal-progress-label">Activities</span></div>
      <div class="chal-progress-stat"><span class="chal-progress-num">${progress.daysRemaining}</span><span class="chal-progress-label">Days Left</span></div>
    </div>
    <p class="chal-progress-milestone">${milestoneLine}</p>
    <p class="small-help chal-progress-momentum">${momentumLine}</p>
  </div>`;
}

/* ── Ways to Earn ────────────────────────────────────────────────────── */

export function renderWaysToEarnList(container, rules) {
  if (!rules?.length) {
    container.innerHTML = `<p class="small-help">Ways to earn entries will show here once this challenge’s rules are set.</p>`;
    return;
  }
  container.innerHTML = `<div class="chal-ways-list">
    ${rules.map((r) => {
      const meta = ACTIVITY_TYPE_LABELS[r.activityType] || { label: r.label, icon: '✦' };
      const qty = r.requiredQuantity > 1 ? ` × ${r.requiredQuantity}` : '';
      return `<div class="chal-way-row">
        ${renderIconBubble(meta.icon)}
        <span class="chal-way-label">${escapeHtml(r.label || meta.label)}${qty}</span>
        <span class="chal-way-reward">+${r.entriesAwarded} ${r.entriesAwarded === 1 ? 'entry' : 'entries'}</span>
      </div>`;
    }).join('')}
  </div>`;
}

/* ── Weekly momentum strip — non-monetary, Week 1-5 ─────────────────────── */

export function renderWeeklyProgressStrip(container, weeklyPoints) {
  const weeks = weeklyPoints || [];
  container.innerHTML = `<div class="chal-weekly-strip">
    ${WEEKLY_MOMENTUM_LABELS.map((label, i) => {
      const has = weeks[i] != null;
      return `<div class="chal-week-tile ${has ? 'has-data' : 'is-empty'}">
        <div class="chal-week-label">${label}</div>
        <div class="chal-week-value">${has ? weeks[i] : '—'}</div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ── Achievement Rankings — tabs + table, always includes "Your Position" ── */

export function renderLeaderboardTabs(container, activeCategory, onChange) {
  container.innerHTML = `<div class="chip-group chal-leaderboard-tabs">
    ${LEADERBOARD_CATEGORIES.map((c) => `<button type="button" class="chip ${c.key === activeCategory ? 'active' : ''}" data-category="${c.key}">${c.icon} ${c.label}</button>`).join('')}
  </div>`;
  container.querySelectorAll('[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => onChange(btn.dataset.category));
  });
}

export function renderLeaderboardTable(container, result) {
  const { category, rows, yourPosition, optedIn } = result || {};
  const rowHtml = (r, isSelf) => `<div class="chal-lb-row ${isSelf ? 'is-self' : ''}">
    <span class="chal-lb-rank">${r.rank ?? '—'}</span>
    <span class="chal-lb-name">${r.showAvatar === false ? '' : renderAvatar(r.displayName)}${escapeHtml(r.displayName || 'A Member')}${r.level ? ` <span class="chal-lb-level">${escapeHtml(r.level)}</span>` : ''}</span>
    <span class="chal-lb-points">${r.points}</span>
  </div>`;

  const yourRowHtml = !optedIn
    ? `<div class="chal-lb-your-position chal-lb-private"><span>Your ranking is private.</span> <a href="#" data-open-prefs>Show it publicly →</a></div>`
    : (yourPosition
      ? `<div class="chal-lb-your-position">${rowHtml(yourPosition, true)}</div>`
      : renderChalEmptyState('✦', 'Not ranked yet', 'Complete a qualifying activity to appear here.'));

  container.innerHTML = `<div class="chal-leaderboard-table" data-category="${category}">
    ${(rows || []).length
      ? (rows || []).map((r) => rowHtml(r, r.userId === yourPosition?.userId)).join('')
      : renderChalEmptyState('✦', 'No rankings yet', `No one has opted into ${leaderboardCategoryLabel(category)} yet — be the first.`)}
    <div class="chal-lb-your-position-wrap">${yourRowHtml}</div>
  </div>`;
}

/* ── Winner cards — strict public-field whitelist only, matches
   winnerPublicShape() in agihf/api/challenge-data.js exactly ────────────── */

export function winnerToCardProps(winner) {
  return {
    id: winner.id,
    challengeName: winner.challengeName,
    displayName: winner.displayName || 'An AGHF Member',
    showAvatar: winner.showAvatar !== false,
    isAlternate: !!winner.isAlternate,
    winnerMessage: winner.winnerMessage,
    achievementBadge: winner.achievementBadge,
    publishedAt: winner.publishedAt,
  };
}

export function renderWinnerCard(props) {
  return `<div class="chal-winner-card">
    <div class="chal-winner-badge">${props.achievementBadge ? escapeHtml(props.achievementBadge) : '🏆 Winner'}</div>
    <div class="chal-winner-name">${props.showAvatar ? renderAvatar(props.displayName) : ''}${escapeHtml(props.displayName)}</div>
    <div class="chal-winner-challenge">${escapeHtml(props.challengeName || 'AGHF Monthly Challenge')}</div>
    ${props.winnerMessage ? `<p class="chal-winner-message">“${escapeHtml(props.winnerMessage)}”</p>` : ''}
    <div class="chal-winner-date small-help">${fmtDate(props.publishedAt)}</div>
  </div>`;
}

export function renderPreviousWinnersGrid(container, winners) {
  if (!winners?.length) {
    container.innerHTML = renderChalEmptyState('🏆', PREVIOUS_WINNERS_EMPTY_STATE.heading, PREVIOUS_WINNERS_EMPTY_STATE.body);
    return;
  }
  container.innerHTML = `<div class="chal-winners-grid">${winners.map((w) => renderWinnerCard(winnerToCardProps(w))).join('')}</div>`;
}

/* ── Private entry ledger ────────────────────────────────────────────── */

export function renderEntryLedger(container, entries, totalConfirmed) {
  if (!entries?.length) {
    container.innerHTML = renderChalEmptyState('🎟️', ENTRY_LEDGER_EMPTY_STATE.heading, ENTRY_LEDGER_EMPTY_STATE.body);
    return;
  }
  container.innerHTML = `<div class="chal-ledger">
    <div class="chal-ledger-total">${totalConfirmed} confirmed ${totalConfirmed === 1 ? 'entry' : 'entries'}</div>
    ${entries.map((e) => {
      const status = ENTRY_STATUS_LABELS[e.entryStatus] || { label: e.entryStatus, help: '' };
      const meta = ACTIVITY_TYPE_LABELS[e.activityType];
      return `<div class="chal-ledger-row chal-ledger-status-${e.entryStatus}">
        <span class="chal-ledger-icon">${meta?.icon || '✦'}</span>
        <span class="chal-ledger-label">${escapeHtml(e.ruleLabel)}</span>
        <span class="chal-ledger-amount">+${e.entryAmount}</span>
        <span class="chal-ledger-status" title="${escapeHtml(status.help)}">${status.label}</span>
        <span class="chal-ledger-date small-help">${fmtDate(e.createdAt)}</span>
        ${e.adjustmentReason ? `<div class="chal-ledger-reason small-help">${escapeHtml(e.adjustmentReason)}</div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

/* ── Privacy prefs panel ─────────────────────────────────────────────── */

export function renderPrefsPanel(container, prefs, handlers) {
  container.innerHTML = `<div class="chal-prefs-panel">
    <label class="chal-prefs-toggle-row">
      <input type="checkbox" id="chalPrefsOptIn" ${prefs.publicOptIn ? 'checked' : ''} />
      Show me on the public Achievement Rankings
    </label>
    <p class="small-help">Off by default. You always see your own position either way.</p>
    <div class="field-group">
      <label class="field-label">How should your name show?</label>
      <select id="chalPrefsDisplayName" class="field-input">
        <option value="full_name" ${prefs.displayNamePreference === 'full_name' ? 'selected' : ''}>Full Name</option>
        <option value="first_name_last_initial" ${prefs.displayNamePreference === 'first_name_last_initial' ? 'selected' : ''}>First Name + Last Initial</option>
        <option value="username" ${prefs.displayNamePreference === 'username' ? 'selected' : ''}>AGHF Username</option>
        <option value="anonymous" ${prefs.displayNamePreference === 'anonymous' ? 'selected' : ''}>Anonymous</option>
      </select>
    </div>
    <label class="chal-prefs-toggle-row"><input type="checkbox" id="chalPrefsShowAvatar" ${prefs.showAvatar ? 'checked' : ''} /> Show my avatar</label>
    <label class="chal-prefs-toggle-row"><input type="checkbox" id="chalPrefsShowLevel" ${prefs.showLevel ? 'checked' : ''} /> Show my Academy level</label>
    <button type="button" class="dd-primary-btn" id="chalPrefsSave">Save Preferences</button>
  </div>`;

  container.querySelector('#chalPrefsSave').addEventListener('click', () => {
    handlers.onSave({
      publicOptIn: container.querySelector('#chalPrefsOptIn').checked,
      displayNamePreference: container.querySelector('#chalPrefsDisplayName').value,
      showAvatar: container.querySelector('#chalPrefsShowAvatar').checked,
      showLevel: container.querySelector('#chalPrefsShowLevel').checked,
    });
  });
}

/* ── Notification bell ───────────────────────────────────────────────── */

export function renderNotificationBell(container, { notifications, unreadCount }, handlers) {
  container.innerHTML = `<div class="chal-notif-bell-wrap">
    <button type="button" class="chal-notif-bell" id="chalNotifBellBtn" aria-label="Notifications">
      🔔${unreadCount ? `<span class="chal-notif-badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
    </button>
    <div class="chal-notif-panel" id="chalNotifPanel" hidden>
      <div class="chal-notif-panel-head">
        <span>Notifications</span>
        ${unreadCount ? `<button type="button" class="cl-toggle-btn" id="chalNotifMarkAll">Mark all read</button>` : ''}
      </div>
      ${notifications?.length
        ? notifications.map((n) => {
          const meta = NOTIFICATION_TYPE_META[n.type] || { icon: '✦' };
          return `<a class="chal-notif-row ${n.readAt ? '' : 'is-unread'}" href="${escapeHtml(n.linkHref || '#')}" data-notif-id="${n.id}">
            <span class="chal-notif-icon">${meta.icon}</span>
            <span class="chal-notif-text"><strong>${escapeHtml(n.title)}</strong>${n.body ? `<br>${escapeHtml(n.body)}` : ''}</span>
            <span class="chal-notif-date small-help">${fmtDateTime(n.createdAt)}</span>
          </a>`;
        }).join('')
        : `<p class="small-help" style="padding:12px;">No notifications yet.</p>`}
    </div>
  </div>`;

  const panel = container.querySelector('#chalNotifPanel');
  container.querySelector('#chalNotifBellBtn').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) handlers.onOpen?.();
  });
  container.querySelector('#chalNotifMarkAll')?.addEventListener('click', (e) => {
    e.preventDefault();
    handlers.onMarkAllRead();
  });
  container.querySelectorAll('[data-notif-id]').forEach((row) => {
    row.addEventListener('click', () => handlers.onOpenNotification(row.dataset.notifId));
  });
  document.addEventListener('click', function outsideHandler(e) {
    if (!container.contains(e.target)) { panel.hidden = true; document.removeEventListener('click', outsideHandler); }
  });
}
