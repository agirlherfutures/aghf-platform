/**
 * eval-lab-engine.js: A Girl & Her Futures™
 *
 * The Evaluation Lab (Pass Your Eval™). Not a pass-date calculator: a
 * guided workspace where a student
 *   1. sets up her evaluation and learns how it can fail,
 *   2. builds her personal regimen (commitments, risk limits, trading
 *      window, setup, no-trade conditions), shared with her Rulebook,
 *   3. checks in on her mindset before a session,
 *   4. logs sessions and tracks two things: profit target progress and
 *      rule adherence, and
 *   5. reviews her preparation for gaps.
 *
 * Plan fields (target, drawdown, risk, balance...) live on the eval plan as
 * before. Everything else lives in `plan.lab` (0014_eval_lab.sql), mirrored
 * in localStorage so it still works before that migration is applied.
 * Presentation and simple arithmetic only: no trade recommendations.
 */

import { openModal, closeModal, showDeskToast } from './dayli-desk-engine.js';
import { loadRulebook, draftRulebook, saveRulebook } from './rules-core.js';
import {
  LAB, STEPS, ACCOUNT_PRESETS, PROFILE_NOTE, DRAWDOWN_METHODS, COMMITMENTS,
  NO_TRADE_CONDITIONS, LESSONS, MOODS, FOLLOWED, READINESS, READINESS_NOTE, AGENT_PROMPTS,
} from './eval-lab-copy.js';
import { computeRiskPerTrade, computeRewardPerTrade } from './eval-calculator-math.js';

/* ── helpers ──────────────────────────────────────────────────────── */

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(n) {
  if (n == null || Number.isNaN(n)) return 'not set';
  const sign = n < 0 ? '−' : '';
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}
function num(v) { return v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v); }
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function prettyDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
const lessonHref = (key) => `lesson.html?phase=p7&n=${LESSONS[key].n}`;
const uid = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function defaultLab() {
  return { provider: '', commitments: {}, regimen: { windowStart: '', windowEnd: '', setup: '', noTrade: [], noTradeOther: '' }, checkIns: [], sessions: [], readiness: {} };
}
const LOCAL_KEY = (id) => `aghf_eval_lab:${id}`;
function readLocalLab(id) {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY(id)) || 'null'); } catch { return null; }
}
function writeLocalLab(id, lab) {
  try { localStorage.setItem(LOCAL_KEY(id), JSON.stringify(lab)); } catch { /* private mode: the server copy still saves */ }
}
function withLab(plan) {
  const lab = plan.lab || (plan.id && readLocalLab(plan.id)) || {};
  const base = defaultLab();
  return { ...plan, lab: { ...base, ...lab, regimen: { ...base.regimen, ...(lab.regimen || {}) } } };
}

/** Older plans stored stop/target in points; the Lab works in dollars. */
function toDollarPlan(plan) {
  if (plan.riskMode === 'dollars') return null;
  return { ...plan, riskMode: 'dollars', riskPerTradeValue: computeRiskPerTrade(plan), rewardPerTradeValue: computeRewardPerTrade(plan) };
}

/* ── evaluation math (plain arithmetic on her own numbers) ────────── */

function balanceNow(plan) {
  return plan.currentBalance ?? plan.startingBalance ?? plan.accountSize ?? null;
}
/** Highest closing balance so far: the start, then each logged session's close. */
function peakClose(plan) {
  let bal = plan.startingBalance ?? plan.accountSize ?? 0;
  let peak = bal;
  [...plan.lab.sessions].sort((a, b) => a.date.localeCompare(b.date)).forEach((s) => { bal += Number(s.pnl) || 0; peak = Math.max(peak, bal); });
  return Math.max(peak, balanceNow(plan) ?? peak);
}
/** Where the account fails, based on the method she entered. Null when unknown. */
function failFloor(plan) {
  const dd = num(plan.drawdownValue);
  const start = plan.startingBalance ?? plan.accountSize;
  if (dd == null || start == null) return null;
  if (plan.drawdownType === 'static') return start - dd;
  if (plan.drawdownType === 'eod_trailing' || plan.drawdownType === 'intraday_trailing') return peakClose(plan) - dd;
  return null;
}
function roomLeft(plan) {
  const floor = failFloor(plan);
  return floor == null ? null : Math.max(0, balanceNow(plan) - floor);
}
function profitSoFar(plan) {
  const start = plan.startingBalance ?? plan.accountSize ?? 0;
  return (balanceNow(plan) ?? start) - start;
}
function adherence(plan) {
  const s = plan.lab.sessions;
  if (!s.length) return null;
  const score = s.reduce((t, x) => t + (FOLLOWED.find((f) => f.key === x.followed)?.score ?? 0), 0);
  return Math.round((score / s.length) * 100);
}
function dailyStopDollars(plan) {
  const risk = num(plan.riskPerTradeValue);
  const losses = plan.maxLossesPerDay || plan.maxTradesPerDay;
  return risk && losses ? risk * losses : null;
}
function profileComplete(plan) {
  return !!(plan.accountSize && num(plan.profitTargetValue) && (num(plan.drawdownValue) || plan.drawdownType === 'unknown') && plan.drawdownType);
}
function regimenComplete(plan) {
  return !!(num(plan.riskPerTradeValue) && plan.maxTradesPerDay);
}

/* ── shared bits ──────────────────────────────────────────────────── */

function field(label, input, help) {
  return `<label class="lab-field"><span class="lab-label">${label}</span>${input}${help ? `<span class="lab-help">${help}</span>` : ''}</label>`;
}
function moneyBox(fieldName, value, placeholder = '') {
  return `<span class="lab-money"><i>$</i><input type="number" inputmode="decimal" min="0" data-f="${fieldName}" value="${value ?? ''}" placeholder="${placeholder}"></span>`;
}
function bar(pct, tone) {
  return `<div class="lab-bar"><div class="lab-bar-fill ${tone || ''}" style="width:${Math.max(0, Math.min(100, pct || 0))}%"></div></div>`;
}
function lessonChip(key) {
  const l = LESSONS[key];
  return `<a class="lab-lesson" href="${lessonHref(key)}"><b>${l.title}</b><span>${l.topic}</span></a>`;
}

/* ── header + dashboard strip ─────────────────────────────────────── */

function renderHeader(plan) {
  const target = num(plan.profitTargetValue);
  const profit = profitSoFar(plan);
  const adh = adherence(plan);
  const room = roomLeft(plan);
  const todays = plan.lab.checkIns.find((c) => c.date === today());
  const mood = todays && MOODS.find((m) => m.key === todays.mood);
  const ready = profileComplete(plan);
  return `
    <section class="lab-hero">
      <div class="lab-hero-copy">
        <div class="lab-eye">The mission</div>
        <h2 class="lab-mission">${LAB.mission}</h2>
        <p class="lab-mission-sub">${LAB.missionSub}</p>
      </div>
      <div class="lab-pillars">
        ${LAB.pillars.map((p) => `<div class="lab-pillar ${p.key}"><b>${p.label}</b><span>${p.text}</span></div>`).join('')}
      </div>
    </section>
    ${ready ? `<section class="lab-strip">
      <div class="lab-strip-item"><small>Profit target</small><b>${money(profit)} <em>of ${money(target)}</em></b>${bar(target ? (profit / target) * 100 : 0, 'pink')}</div>
      <div class="lab-strip-item"><small>Rule adherence</small><b>${adh == null ? 'No sessions yet' : `${adh}%`}</b>${bar(adh ?? 0, 'teal')}</div>
      <div class="lab-strip-item"><small>Room before the account fails</small><b>${room == null ? 'Not sure yet' : money(room)}</b><span>${room != null && num(plan.riskPerTradeValue) ? `About ${Math.floor(room / num(plan.riskPerTradeValue))} losses at your risk` : 'Set your drawdown method'}</span></div>
      <div class="lab-strip-item"><small>Today’s check-in</small><b>${mood ? `${mood.emoji} ${mood.label}` : 'Not yet'}</b><button type="button" class="lab-link" data-go="checkin">${mood ? 'Change' : 'Check in'}</button></div>
    </section>` : ''}`;
}

function renderSteps(active, plan) {
  const done = {
    profile: profileComplete(plan),
    regimen: regimenComplete(plan) && Object.values(plan.lab.commitments).filter(Boolean).length === COMMITMENTS.length,
    checkin: plan.lab.checkIns.some((c) => c.date === today()),
    progress: plan.lab.sessions.length > 0,
    readiness: READINESS.every((r) => plan.lab.readiness[r.key] === 'yes'),
  };
  return `<nav class="lab-steps" aria-label="Evaluation Lab steps">${STEPS.map((s) => `
    <button type="button" class="lab-step ${s.key === active ? 'active' : ''} ${done[s.key] ? 'done' : ''}" data-go="${s.key}">
      <span class="lab-step-n">${done[s.key] ? '✓' : s.n}</span><span>${s.label}</span>
    </button>`).join('')}</nav>`;
}

/* ── 1. My Evaluation ─────────────────────────────────────────────── */

function trailingExample(plan) {
  const start = plan.startingBalance ?? plan.accountSize;
  const dd = num(plan.drawdownValue);
  if (!start || !dd) return '';
  const up = Math.round(dd / 2);
  if (plan.drawdownType === 'static') {
    return `<div class="lab-explain"><b>What this means for you</b><p>Your account fails if your balance reaches <b>${money(start - dd)}</b>. That floor stays put even after good days, so profit you make adds to your room.</p></div>`;
  }
  if (plan.drawdownType === 'eod_trailing' || plan.drawdownType === 'intraday_trailing') {
    const intraday = plan.drawdownType === 'intraday_trailing';
    return `<div class="lab-explain"><b>What trailing means for you</b>
      <ol>
        <li>You start at <b>${money(start)}</b>. Your floor is <b>${money(start - dd)}</b>, so you have ${money(dd)} of room.</li>
        <li>${intraday ? 'Your balance touches' : 'You close a day at'} <b>${money(start + up)}</b>. Your floor moves up to <b>${money(start + up - dd)}</b>.</li>
        <li>If you then drop back to <b>${money(start)}</b>, you only have <b>${money(dd - up)}</b> of room left, not ${money(dd)}.</li>
      </ol>
      <p>${intraday ? 'Because it trails intraday, even an open profit that comes back can raise your floor.' : 'Only your closing balance moves the floor, never an open trade.'} Some providers stop trailing once the floor reaches a certain level. Check your terms.</p></div>`;
  }
  return '';
}

function howItFails(plan) {
  const items = [];
  const floor = failFloor(plan);
  if (floor != null) items.push(`Your balance reaches <b>${money(floor)}</b>${plan.drawdownType !== 'static' ? ' (this floor moves up as your balance grows)' : ''}.`);
  else if (num(plan.drawdownValue)) items.push(`You lose more than your <b>${money(num(plan.drawdownValue))}</b> drawdown, measured the way your provider measures it.`);
  if (num(plan.dailyLossLimit)) items.push(`You lose <b>${money(num(plan.dailyLossLimit))}</b> or more in a single day.`);
  if (num(plan.consistencyRulePct)) items.push(`One day makes more than <b>${plan.consistencyRulePct}%</b> of your total profit (this can delay a pass instead of failing it, depending on the provider).`);
  if (!items.length) return '';
  return `<div class="lab-fails"><b>How this evaluation can fail</b><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>
    ${plan.minTradingDays ? `<p>You also need at least <b>${plan.minTradingDays}</b> trading days before it can pass.</p>` : ''}</div>`;
}

function renderProfile(plan) {
  const preset = ACCOUNT_PRESETS.find((p) => p.size === plan.accountSize && !plan.isCustomAccount);
  const method = DRAWDOWN_METHODS.find((d) => d.key === plan.drawdownType);
  return `
    <div class="lab-panel">
      <div class="lab-eye">Step 1</div>
      <h3 class="lab-h">My Evaluation Profile</h3>
      <p class="lab-sub">Know your rules before you trade them. Understand how your evaluation can fail before you ever place a trade in it.</p>
      <div class="lab-two">
        <div>
          ${field('Evaluation provider', `<input class="lab-input" type="text" data-lab="provider" value="${esc(plan.lab.provider)}" placeholder="Other / Custom">`)}
          <div class="lab-field"><span class="lab-label">Account size</span>
            <div class="lab-chips">${ACCOUNT_PRESETS.map((p) => `<button type="button" class="lab-chip ${preset?.size === p.size ? 'on' : ''}" data-size="${p.size}">${p.label}</button>`).join('')}
              <button type="button" class="lab-chip ${preset ? '' : 'on'}" data-size="custom">Custom</button></div>
            ${preset ? '' : `<div style="margin-top:8px;">${moneyBox('accountSize', plan.accountSize)}</div>`}
          </div>
          <div class="lab-row3">
            ${field('Profit target', moneyBox('profitTargetValue', plan.profitTargetValue, '3000'))}
            ${field('Maximum drawdown', moneyBox('drawdownValue', plan.drawdownValue, '2000'))}
            ${field('Daily loss limit', moneyBox('dailyLossLimit', plan.dailyLossLimit, 'If any'))}
          </div>
          <div class="lab-field"><span class="lab-label">Drawdown method</span>
            <div class="lab-chips">${DRAWDOWN_METHODS.map((d) => `<button type="button" class="lab-chip ${plan.drawdownType === d.key ? 'on' : ''}" data-dd="${d.key}">${d.label}</button>`).join('')}</div>
            ${method ? `<span class="lab-help">${method.help}</span>` : ''}
          </div>
          ${plan.drawdownType === 'other' ? field('How your provider measures drawdown', `<textarea class="lab-input" rows="2" data-f="notes">${esc(plan.notes)}</textarea>`) : ''}
          <details class="lab-more"><summary>More rules (optional)</summary>
            <div class="lab-row3">
              ${field('Minimum trading days', `<input class="lab-input" type="number" min="0" data-f="minTradingDays" value="${plan.minTradingDays ?? ''}">`)}
              ${field('Consistency rule (%)', `<input class="lab-input" type="number" min="0" max="100" data-f="consistencyRulePct" value="${plan.consistencyRulePct ?? ''}">`)}
              ${field('Plan name', `<input class="lab-input" type="text" data-f="name" value="${esc(plan.name)}">`)}
            </div>
          </details>
        </div>
        <div>
          <div class="lab-card lab-setup">
            <div class="lab-eye">Your evaluation setup</div>
            <div class="lab-setup-title">${esc(plan.lab.provider || 'Other / Custom')} · ${money(plan.accountSize)} account</div>
            <div class="lab-setup-line">Target: <b>${money(num(plan.profitTargetValue))}</b> · Drawdown: <b>${money(num(plan.drawdownValue))}</b>${num(plan.dailyLossLimit) ? ` · Daily loss limit: <b>${money(num(plan.dailyLossLimit))}</b>` : ''}</div>
            <div class="lab-setup-line">Drawdown type: <b>${method ? method.label : 'Not set'}</b></div>
            <p class="lab-fine">${PROFILE_NOTE}</p>
          </div>
          ${trailingExample(plan)}
          ${howItFails(plan)}
        </div>
      </div>
      <div class="lab-actions"><button type="button" class="dd-primary-btn" data-go="regimen">Next: build my regimen →</button></div>
    </div>`;
}

/* ── 2. My Regimen ────────────────────────────────────────────────── */

function renderRegimen(plan) {
  const c = plan.lab.commitments;
  const reviewed = COMMITMENTS.filter((x) => c[x.key]).length;
  const r = plan.lab.regimen;
  const risk = num(plan.riskPerTradeValue);
  const dd = num(plan.drawdownValue);
  const stop = dailyStopDollars(plan);
  const dll = num(plan.dailyLossLimit);
  const losses = plan.maxLossesPerDay || plan.maxTradesPerDay;
  let riskNote = '';
  if (risk && dd) {
    const pct = Math.round((risk / dd) * 100);
    riskNote = `One loss uses <b>${pct}%</b> of your ${money(dd)} drawdown, so you have room for about <b>${Math.floor(dd / risk)}</b> losses.`;
    if (pct > 15) riskNote += ' That’s a big share of your cushion for one trade.';
  }
  let stopNote = '';
  if (stop && dll) stopNote = stop > dll
    ? `<div class="lab-note warn">Your daily stop (${losses} losses, ${money(stop)}) is more than your ${money(dll)} daily loss limit. Take fewer trades or risk less per trade.</div>`
    : `<div class="lab-note ok">Your daily stop (${losses} losses, ${money(stop)}) stays inside your ${money(dll)} daily loss limit.</div>`;

  return `
    <div class="lab-panel">
      <div class="lab-eye">Step 2</div>
      <h3 class="lab-h">My Evaluation Regimen</h3>
      <p class="lab-sub">Before the profit target, build the routine you’ll trade it with.</p>

      <div class="lab-card">
        <div class="lab-card-head"><b>My evaluation commitments</b><span class="lab-count">${reviewed} of ${COMMITMENTS.length} commitments reviewed</span></div>
        ${COMMITMENTS.map((x) => `<label class="lab-commit ${c[x.key] ? 'on' : ''}"><input type="checkbox" data-commit="${x.key}" ${c[x.key] ? 'checked' : ''}><span>${x.text}</span></label>`).join('')}
      </div>

      <div class="lab-card">
        <div class="lab-card-head"><b>My personal rules</b><a class="lab-link" href="rulebook.html">Open My Rulebook</a></div>
        <div class="lab-row3">
          ${field('Maximum risk per trade', moneyBox('riskPerTradeValue', plan.riskPerTradeValue, '150'))}
          ${field('Maximum trades per day', `<input class="lab-input" type="number" min="1" data-f="maxTradesPerDay" value="${plan.maxTradesPerDay ?? ''}">`)}
          ${field('Stop for the day after', `<span class="lab-inline"><input class="lab-input" type="number" min="1" data-f="maxLossesPerDay" value="${plan.maxLossesPerDay ?? ''}" placeholder="${plan.maxTradesPerDay || 2}"> losses</span>`)}
        </div>
        ${riskNote ? `<p class="lab-help" style="margin-top:4px;">${riskNote}</p>` : ''}
        ${stopNote}
        <label class="lab-commit ${plan.stopAfterWin ? 'on' : ''}" style="margin-top:10px;"><input type="checkbox" data-bool="stopAfterWin" ${plan.stopAfterWin ? 'checked' : ''}><span>I stop for the day after my first win.</span></label>
        <div class="lab-row3" style="margin-top:12px;">
          ${field('Trading window starts', `<input class="lab-input" type="time" data-reg="windowStart" value="${esc(r.windowStart)}">`)}
          ${field('Trading window ends', `<input class="lab-input" type="time" data-reg="windowEnd" value="${esc(r.windowEnd)}">`)}
          <div></div>
        </div>
        ${field('My setup criteria', `<textarea class="lab-input" rows="3" data-reg="setup" placeholder="What has to be true before I enter? Where is my invalidation?">${esc(r.setup)}</textarea>`)}
      </div>

      <div class="lab-card">
        <div class="lab-card-head"><b>I don’t trade when…</b></div>
        <div class="lab-chips wrap">${NO_TRADE_CONDITIONS.map((t) => `<button type="button" class="lab-chip ${r.noTrade.includes(t) ? 'on' : ''}" data-notrade="${esc(t)}">${t}</button>`).join('')}</div>
        ${field('Anything else?', `<input class="lab-input" type="text" data-reg="noTradeOther" value="${esc(r.noTradeOther)}" placeholder="Add your own condition">`)}
      </div>

      <div class="lab-actions">
        <button type="button" class="dd-secondary-btn" id="labToRulebook">Save these to My Rulebook</button>
        <button type="button" class="dd-primary-btn" data-go="checkin">Next: check in →</button>
      </div>
    </div>`;
}

/* ── 3. Check In ──────────────────────────────────────────────────── */

function renderCheckin(plan) {
  const todays = plan.lab.checkIns.find((c) => c.date === today());
  const mood = todays && MOODS.find((m) => m.key === todays.mood);
  const recent = plan.lab.checkIns.slice(-14);
  const counts = MOODS.map((m) => ({ ...m, n: recent.filter((c) => c.mood === m.key).length })).filter((m) => m.n);
  return `
    <div class="lab-panel">
      <div class="lab-eye">Step 3</div>
      <h3 class="lab-h">How are you feeling about today’s session?</h3>
      <p class="lab-sub">Your mindset is part of your risk. Check in before you open a chart.</p>
      <div class="lab-moods">${MOODS.map((m) => `<button type="button" class="lab-mood ${todays?.mood === m.key ? 'on' : ''}" data-mood="${m.key}"><span>${m.emoji}</span>${m.label}</button>`).join('')}</div>
      ${mood ? `
        <div class="lab-card lab-mindset">
          <div class="lab-eye">Your evaluation mindset</div>
          <p>${mood.response}</p>
          ${mood.lessons.length ? `<div class="lab-lessons">${mood.lessons.map(lessonChip).join('')}</div>` : ''}
          <div class="lab-actions left">
            <button type="button" class="dd-secondary-btn" data-agent="${esc(`I’m checking in before my evaluation session and I’m feeling: ${mood.label.toLowerCase()}. Help me think through whether and how to trade today.`)}">Talk it through with the AGHF Agent</button>
            <button type="button" class="lab-link" data-go="regimen">Review my rules first</button>
          </div>
        </div>` : ''}
      ${counts.length > 1 ? `<p class="lab-help">Your last ${recent.length} check-ins: ${counts.map((m) => `${m.emoji} ${m.label.toLowerCase()} ${m.n}×`).join(' · ')}</p>` : ''}
    </div>`;
}

/* ── 4. My Progress ───────────────────────────────────────────────── */

function renderProgress(plan, ctx) {
  const target = num(plan.profitTargetValue);
  const profit = profitSoFar(plan);
  const adh = adherence(plan);
  const room = roomLeft(plan);
  const sessions = [...plan.lab.sessions].sort((a, b) => b.date.localeCompare(a.date));
  const lastLossFollowed = sessions.find((s) => Number(s.pnl) < 0 && s.followed === 'yes');
  let read = '';
  if (adh != null) {
    const pct = target ? (profit / target) * 100 : 0;
    if (adh < 70) read = 'Your reported rule adherence suggests that process consistency deserves more attention than the profit target right now.';
    else if (adh >= 90) read = 'You’re following your plan consistently. That’s the part you control, and it’s what this Lab is here to build.';
    else read = pct >= 50 ? 'Good progress on the target. Keep your process steady as you get closer; this is where traders start to rush.' : 'Your process is mostly on track. Look at the sessions marked “mostly” or “no” for the rule that slips.';
  }
  const avp = ctx.actualVsPlanned;
  return `
    <div class="lab-panel">
      <div class="lab-eye">Step 4</div>
      <h3 class="lab-h">My Evaluation Progress</h3>
      <p class="lab-sub">Two measurements, on purpose. A controlled loss that followed your plan is a win for your process.</p>
      <div class="lab-two">
        <div class="lab-card">
          <div class="lab-meter-head"><b>Profit target progress</b><span>${money(profit)} / ${money(target)}</span></div>
          ${bar(target ? (profit / target) * 100 : 0, 'pink')}
          <div class="lab-meter-head" style="margin-top:18px;"><b>Rule adherence</b><span>${adh == null ? 'none yet' : `${adh}%`}</span></div>
          ${bar(adh ?? 0, 'teal')}
          ${read ? `<p class="lab-read">${read}</p>` : '<p class="lab-help">Log your first session to see your rule adherence.</p>'}
          <p class="lab-fine">Rule adherence is self-reported, not independently verified.${room != null ? ` Room before the account fails: <b>${money(room)}</b>.` : ''}</p>
          ${lastLossFollowed ? `<div class="lab-note ok">🌿 On ${prettyDate(lastLossFollowed.date)} you took a ${money(Math.abs(lastLossFollowed.pnl))} loss and still followed your plan. That’s discipline, and it counts.</div>` : ''}
        </div>
        <div class="lab-card">
          <b>Log a session</b>
          <div class="lab-row2" style="margin-top:10px;">
            ${field('Date', `<input class="lab-input" type="date" id="labSessDate" value="${today()}">`)}
            ${field('Day’s P&amp;L', `<span class="lab-money"><i>$</i><input type="number" inputmode="decimal" id="labSessPnl" placeholder="-150 or 300"></span>`, 'Use a minus sign for a loss. 0 if you didn’t trade.')}
          </div>
          <div class="lab-field"><span class="lab-label">Did you follow your plan?</span>
            <div class="lab-chips">${FOLLOWED.map((f) => `<button type="button" class="lab-chip" data-followed="${f.key}">${f.label}</button>`).join('')}</div></div>
          ${field('What happened? (optional)', `<input class="lab-input" type="text" id="labSessNote" placeholder="e.g. Skipped a messy setup, stopped after 2 losses">`)}
          <div class="lab-note warn" id="labSessErr" hidden></div>
          <button type="button" class="dd-primary-btn" id="labSessSave" style="width:100%;margin-top:6px;">Log session</button>
        </div>
      </div>
      ${sessions.length ? `
        <div class="lab-card">
          <b>My sessions</b>
          <div class="lab-sessions">${sessions.map((s) => `
            <div class="lab-sess">
              <span class="lab-sess-date">${prettyDate(s.date)}</span>
              <span class="lab-sess-pnl ${Number(s.pnl) < 0 ? 'neg' : 'pos'}">${Number(s.pnl) >= 0 ? '+' : ''}${money(Number(s.pnl))}</span>
              <span class="lab-sess-f f-${s.followed}">${FOLLOWED.find((f) => f.key === s.followed)?.label || ''}</span>
              <span class="lab-sess-note">${esc(s.note)}</span>
              <button type="button" class="lab-x" data-del-session="${s.id}" aria-label="Remove this session">✕</button>
            </div>`).join('')}</div>
        </div>` : ''}
      ${avp?.hasData ? `<p class="lab-help">From your Journal: ${avp.actualTradeCount} trades logged. <a class="lab-link" href="journal-history.html">Review them</a></p>` : `<p class="lab-help">Log each trade in your <a class="lab-link" href="journal.html">Journal</a>, including your decisions and emotions.</p>`}
    </div>`;
}

/* ── 5. Readiness ─────────────────────────────────────────────────── */

function renderReadiness(plan) {
  const ans = plan.lab.readiness;
  const answered = READINESS.filter((r) => ans[r.key]);
  const yes = READINESS.filter((r) => ans[r.key] === 'yes').length;
  const gaps = READINESS.filter((r) => ans[r.key] === 'notyet');
  const gapLink = (r) => (r.step ? `<button type="button" class="lab-link" data-go="${r.step}">${r.gap} →</button>`
    : r.lesson ? `<a class="lab-link" href="${lessonHref(r.lesson)}">${r.gap} →</a>`
      : `<a class="lab-link" href="${r.href}">${r.gap} →</a>`);
  return `
    <div class="lab-panel">
      <div class="lab-eye">Step 5</div>
      <h3 class="lab-h">Practice Readiness Review</h3>
      <p class="lab-sub">Not a pass prediction. An honest look at what’s in place and what still needs work.</p>
      <div class="lab-card">
        ${READINESS.map((r) => `
          <div class="lab-ready">
            <span>${r.text}</span>
            <div class="lab-chips">
              <button type="button" class="lab-chip ${ans[r.key] === 'yes' ? 'on' : ''}" data-ready="${r.key}" data-val="yes">Yes</button>
              <button type="button" class="lab-chip ${ans[r.key] === 'notyet' ? 'on warn' : ''}" data-ready="${r.key}" data-val="notyet">Not yet</button>
            </div>
          </div>`).join('')}
      </div>
      ${answered.length ? `
        <div class="lab-card lab-mindset">
          <div class="lab-eye">${yes} of ${READINESS.length} in place</div>
          ${gaps.length ? `<p>Gaps to work on before you start:</p><ul class="lab-gaps">${gaps.map((g) => `<li>${gapLink(g)}</li>`).join('')}</ul>`
            : answered.length === READINESS.length ? '<p>Everything on this list is in place. Keep checking in and logging your sessions so your process stays this clear.</p>' : '<p>Answer the rest to see your full picture.</p>'}
        </div>` : ''}
      <p class="lab-fine">${READINESS_NOTE}</p>
    </div>`;
}

/* ── Agent + lessons ──────────────────────────────────────────────── */

function agentContext(plan) {
  const bits = [];
  if (plan.accountSize) bits.push(`${money(plan.accountSize)} evaluation account`);
  if (num(plan.profitTargetValue)) bits.push(`target ${money(num(plan.profitTargetValue))}`);
  if (num(plan.drawdownValue)) bits.push(`max drawdown ${money(num(plan.drawdownValue))} (${DRAWDOWN_METHODS.find((d) => d.key === plan.drawdownType)?.label.toLowerCase() || 'method not set'})`);
  if (num(plan.dailyLossLimit)) bits.push(`daily loss limit ${money(num(plan.dailyLossLimit))}`);
  const room = roomLeft(plan);
  if (room != null) bits.push(`about ${money(room)} of room left before it fails`);
  if (num(plan.riskPerTradeValue)) bits.push(`my max risk is ${money(num(plan.riskPerTradeValue))} per trade`);
  if (plan.maxTradesPerDay) bits.push(`max ${plan.maxTradesPerDay} trades a day`);
  return bits.length ? `\n\nMy evaluation: ${bits.join(', ')}.` : '';
}

function renderAside(plan) {
  return `
    <section class="lab-aside">
      <div class="lab-card lab-agent">
        <div class="lab-eye">AGHF Agent</div>
        <b>Talk through a decision before you make it.</b>
        <p class="lab-help">The Agent can help you review your rules, your remaining room and the pressure behind a decision. It won’t tell you what trade to place.</p>
        <div class="lab-prompts">${AGENT_PROMPTS.map((p) => `<button type="button" class="lab-prompt" data-agent="${esc(p)}">“${p}”</button>`).join('')}</div>
      </div>
      <div class="lab-card">
        <div class="lab-eye">Lessons for evaluation days</div>
        <div class="lab-lessons">${['afterLoss', 'threeInARow', 'justOneMore', 'frozen'].map(lessonChip).join('')}</div>
      </div>
    </section>`;
}

/* ── Orchestrator ─────────────────────────────────────────────────── */

/**
 * helpers: { onChange(plan), onReset(), onSaveExplicit(plan)->Promise<plan>,
 *   onUpdateProgress(balance, days)->Promise<plan>, onCreateAnother(),
 *   saveStatus, actualVsPlanned }
 */
export function renderEvalCalculatorPage(container, initialPlan, helpers) {
  let plan = withLab(initialPlan);
  let needsSave = false;
  const converted = toDollarPlan(plan);
  if (converted) { plan = converted; needsSave = true; }

  // Pre-fill her regimen from the Rulebook so she never types it twice.
  const rb = loadRulebook();
  if (rb && !plan.riskPerTradeValue && !plan.maxTradesPerDay) {
    const r = num(String(rb.risk?.riskPerTrade || '').replace(/[^0-9.]/g, '').split('.').slice(0, 2).join('.'));
    const t = num(rb.risk?.maxTrades);
    needsSave = !!(r || t);
    plan = { ...plan, riskMode: 'dollars', riskPerTradeValue: r || plan.riskPerTradeValue, maxTradesPerDay: t || plan.maxTradesPerDay, maxLossesPerDay: rb.dailyStop?.losses || plan.maxLossesPerDay };
    if (rb.sessionRule?.start && !plan.lab.regimen.windowStart) plan.lab.regimen = { ...plan.lab.regimen, windowStart: rb.sessionRule.start, windowEnd: rb.sessionRule.end || '' };
  }
  // Saved on the next tick: the page only gets its handle once this returns.
  if (needsSave) setTimeout(() => helpers.onChange(plan), 0);

  let step = profileComplete(plan) ? (plan.lab.sessions.length ? 'progress' : 'regimen') : 'profile';
  let followedPick = null;

  function commit(next, { repaint = true } = {}) {
    plan = next;
    if (plan.id) writeLocalLab(plan.id, plan.lab);
    helpers.onChange(plan);
    if (repaint) paint();
  }
  const setLab = (patch, opts) => commit({ ...plan, lab: { ...plan.lab, ...patch } }, opts);

  function paint() {
    const panels = { profile: renderProfile, regimen: renderRegimen, checkin: renderCheckin, progress: renderProgress, readiness: renderReadiness };
    container.innerHTML = `
      <div class="lab">
        <div class="lab-top"><span class="cl-nav-status" id="evalSaveStatus">${statusText(helpers.saveStatus)}</span>
          ${plan.isActive ? '<span class="lab-active">★ Active evaluation</span>' : '<button type="button" class="lab-link" id="labMakeActive">Make this my active evaluation</button>'}</div>
        ${renderHeader(plan)}
        ${renderSteps(step, plan)}
        <div class="lab-main">${panels[step](plan, { actualVsPlanned: helpers.actualVsPlanned })}</div>
        ${renderAside(plan)}
        <div class="lab-foot">
          <button type="button" class="cl-delete-link" id="evalStartOverBtn">Start over</button>
          <button type="button" class="cl-delete-link" id="evalCreateAnotherBtn">Set up another evaluation</button>
        </div>
        <p class="lab-fine lab-center">${LAB.disclaimer}</p>
      </div>`;
    wire();
  }

  function statusText(s) {
    return s === 'saving' ? 'Saving…' : s === 'error' ? '⚠ Couldn’t save, retrying' : 'Saved ✓';
  }

  function wire() {
    const $$ = (sel) => container.querySelectorAll(sel);
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => { step = b.dataset.go; paint(); container.querySelector('.lab-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));

    // Plan fields: commit on change (blur) so typing isn't interrupted.
    $$('[data-f]').forEach((el) => el.addEventListener('change', () => {
      const k = el.dataset.f;
      let v = el.type === 'number' ? num(el.value) : el.value;
      const next = { ...plan, [k]: v };
      if (k === 'accountSize') next.startingBalance = v;
      if (k === 'profitTargetValue') next.profitTargetType = 'fixed_amount';
      if (k === 'riskPerTradeValue') next.riskMode = 'dollars';
      commit(next);
    }));
    $$('[data-bool]').forEach((el) => el.addEventListener('change', () => commit({ ...plan, [el.dataset.bool]: el.checked })));
    $$('[data-size]').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.size;
      commit(v === 'custom' ? { ...plan, isCustomAccount: true } : { ...plan, isCustomAccount: false, accountSize: Number(v), startingBalance: Number(v) });
    }));
    $$('[data-dd]').forEach((b) => b.addEventListener('click', () => commit({ ...plan, drawdownType: b.dataset.dd })));
    $$('[data-lab]').forEach((el) => el.addEventListener('change', () => setLab({ [el.dataset.lab]: el.value })));
    $$('[data-reg]').forEach((el) => el.addEventListener('change', () => setLab({ regimen: { ...plan.lab.regimen, [el.dataset.reg]: el.value } })));
    $$('[data-commit]').forEach((el) => el.addEventListener('change', () => setLab({ commitments: { ...plan.lab.commitments, [el.dataset.commit]: el.checked } })));
    $$('[data-notrade]').forEach((b) => b.addEventListener('click', () => {
      const t = b.dataset.notrade;
      const list = plan.lab.regimen.noTrade.includes(t) ? plan.lab.regimen.noTrade.filter((x) => x !== t) : [...plan.lab.regimen.noTrade, t];
      setLab({ regimen: { ...plan.lab.regimen, noTrade: list } });
    }));
    $$('[data-mood]').forEach((b) => b.addEventListener('click', () => {
      const rest = plan.lab.checkIns.filter((c) => c.date !== today());
      setLab({ checkIns: [...rest, { date: today(), mood: b.dataset.mood, at: new Date().toISOString() }].slice(-90) });
    }));
    $$('[data-ready]').forEach((b) => b.addEventListener('click', () => setLab({ readiness: { ...plan.lab.readiness, [b.dataset.ready]: b.dataset.val } })));
    $$('[data-agent]').forEach((b) => b.addEventListener('click', () => {
      try { sessionStorage.setItem('aghf_pending_agent_prompt', b.dataset.agent + agentContext(plan)); } catch { /* opens with an empty box */ }
      location.href = 'psychology.html';
    }));

    $$('[data-followed]').forEach((b) => b.addEventListener('click', () => {
      followedPick = b.dataset.followed;
      $$('[data-followed]').forEach((x) => x.classList.toggle('on', x === b));
    }));
    const saveSess = container.querySelector('#labSessSave');
    if (saveSess) saveSess.addEventListener('click', logSession);
    $$('[data-del-session]').forEach((b) => b.addEventListener('click', () => removeSession(b.dataset.delSession)));

    const toRb = container.querySelector('#labToRulebook');
    if (toRb) toRb.addEventListener('click', syncRulebook);
    const active = container.querySelector('#labMakeActive');
    if (active) active.addEventListener('click', async () => {
      try {
        const saved = await helpers.onSaveExplicit(plan);
        plan = withLab({ ...saved, lab: plan.lab });
        showDeskToast('This is now your active evaluation ✦');
        paint();
      } catch (err) { console.error(err); alert('Couldn’t update this plan. Try again in a moment.'); }
    });
    container.querySelector('#evalStartOverBtn')?.addEventListener('click', helpers.onReset);
    container.querySelector('#evalCreateAnotherBtn')?.addEventListener('click', helpers.onCreateAnother);
  }

  async function logSession() {
    const err = container.querySelector('#labSessErr');
    const pnl = num(container.querySelector('#labSessPnl').value);
    const date = container.querySelector('#labSessDate').value || today();
    const note = container.querySelector('#labSessNote').value.trim();
    const show = (m) => { err.textContent = m; err.hidden = false; };
    if (pnl == null) return show('Add the day’s P&L (use 0 if you didn’t trade).');
    if (!followedPick) return show('Choose whether you followed your plan.');
    const sessions = [...plan.lab.sessions, { id: uid(), date, pnl, followed: followedPick, note: note.slice(0, 280) }];
    const followed = followedPick;
    followedPick = null;
    await applyBalance(sessions, (balanceNow(plan) ?? 0) + pnl);
    showDeskToast(followed === 'yes' && pnl < 0 ? 'Session logged. You followed your plan, and that counts ✦' : 'Session logged ✦');
  }

  async function removeSession(id) {
    const s = plan.lab.sessions.find((x) => x.id === id);
    if (!s || !confirm('Remove this session? Your balance will be adjusted back.')) return;
    await applyBalance(plan.lab.sessions.filter((x) => x.id !== id), (balanceNow(plan) ?? 0) - Number(s.pnl));
  }

  /** Saves the session list and moves the plan's balance and day count to match. */
  async function applyBalance(sessions, balance) {
    const lab = { ...plan.lab, sessions };
    commit({ ...plan, lab }, { repaint: false });
    const days = new Set(sessions.map((s) => s.date)).size;
    try {
      const updated = await helpers.onUpdateProgress(Math.round(balance * 100) / 100, days);
      // Only take the progress fields: the server copy can be a moment behind her latest edits.
      plan = { ...plan, lab, currentBalance: updated.currentBalance, tradingDaysElapsed: updated.tradingDaysElapsed };
      helpers.onChange(plan);
    } catch (e) {
      console.error('Progress sync error:', e);
      plan = { ...plan, currentBalance: balance, tradingDaysElapsed: days };
      showDeskToast('Saved here. We’ll sync your balance next time.');
    }
    paint();
  }

  function syncRulebook() {
    const book = loadRulebook() || draftRulebook();
    const risk = num(plan.riskPerTradeValue);
    const losses = plan.maxLossesPerDay || plan.maxTradesPerDay || null;
    book.risk = { ...book.risk, riskPerTrade: risk ? `$${risk}` : book.risk.riskPerTrade, maxTrades: plan.maxTradesPerDay ? String(plan.maxTradesPerDay) : book.risk.maxTrades };
    if (losses || plan.maxTradesPerDay) book.dailyStop = { ...(book.dailyStop || {}), losses, trades: plan.maxTradesPerDay || null, dollars: dailyStopDollars(plan), logic: 'first' };
    const r = plan.lab.regimen;
    if (r.windowStart) book.sessionRule = { start: r.windowStart, end: r.windowEnd || '' };
    saveRulebook(book);
    showDeskToast('Saved to My Rulebook ✦');
  }

  paint();
  return {
    getState: () => plan,
    setSaveStatus: (status) => { helpers.saveStatus = status; const el = container.querySelector('#evalSaveStatus'); if (el) el.textContent = statusText(status); },
    applySavedFields: (saved) => {
      plan = { ...plan, id: saved.id, status: saved.status, createdAt: saved.createdAt };
      if (saved.lab == null && plan.id) writeLocalLab(plan.id, plan.lab); // column not migrated yet: keep the browser copy
    },
    setActualVsPlanned: (avp) => { helpers.actualVsPlanned = avp; if (step === 'progress') paint(); },
  };
}
