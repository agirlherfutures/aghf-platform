/**
 * journal-v2.js — A Girl & Her Futures™
 *
 * The Trade Journal's visual layer, in the Dayli Desk look: illustrated
 * trade cards, the day-by-day timeline, the calendar's day panel, and the
 * full "trade story" detail page. Presentation only. Every number comes
 * from the saved entry or from journal-engine.js's own math.
 *
 * Process over profit: the plan badge, ICC steps and execution grade are
 * always shown next to the P&L, never under it.
 */

import { computeTradeTotals, computeExecutionScore } from './journal-engine.js';

const ICC_STEPS = [
  ['validPil', 'PIL', 'Valid PIL'],
  ['indication', 'Ind', 'Indication'],
  ['correction', 'Corr', 'Correction'],
  ['continuation', 'Cont', 'Continuation'],
  ['firstRetest', 'Retest', 'First Retest'],
];

const GOOD_FEELINGS = new Set(['Calm', 'Prepared', 'Confident', 'Aligned', 'Focused', 'At Ease', 'Proud', 'Grateful', 'Protective', 'Relieved', 'Patient', 'Happy']);
const HARD_FEELINGS = new Set(['Nervous', 'Impatient', 'FOMO', 'Anxious', 'Watching Every Tick', 'Second Guessing', 'Tempted to Exit', 'Tempted to Move Stop', 'Overconfident', 'Frustrated', 'Regretful', 'Disappointed', 'Doubtful', 'Stressed']);
const MOOD = {
  good: { bg: '#E8F8F6', ink: '#3E9E93', mouth: 'M8 13.5q4 3.5 8 0' },
  mixed: { bg: '#FEF3E4', ink: '#C4741F', mouth: 'M8.5 14.5h7' },
  hard: { bg: '#FDE8ED', ink: '#E0607C', mouth: 'M8 15.5q4-3.5 8 0' },
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function isPnlHidden() {
  try { return localStorage.getItem('aghf_snapshot_private') === '1'; } catch { return false; }
}
const blur = () => (isPnlHidden() ? ' dd-blurred' : '');

export function money(n, { cents = false } = {}) {
  if (n == null || !Number.isFinite(Number(n))) return '–';
  const v = Number(n);
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  const abs = Math.abs(v);
  return `${sign}$${cents ? abs.toFixed(2) : Math.round(abs).toLocaleString('en-US')}`;
}
const tone = (n) => (n > 0 ? 'win' : n < 0 ? 'loss' : 'even');
const fmtR = (r) => (r == null || !Number.isFinite(r) ? null : `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r).toFixed(2).replace(/\.?0+$/, '')}R`);
const fmtPrice = (p) => (p == null || p === '' ? '' : Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

function dayLabel(date, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  if (!date) return '';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', opts);
}
function timeLabel(entry) {
  if (!entry.entryTime) return '';
  const d = new Date(entry.entryTime);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
const dirWord = (d) => (d === 'long' ? 'Long' : d === 'short' ? 'Short' : 'Trade');

export function feelingKind(label) {
  if (GOOD_FEELINGS.has(label)) return 'good';
  if (HARD_FEELINGS.has(label)) return 'hard';
  return 'mixed';
}
export function faceSvg(kind, size = 20) {
  const m = MOOD[kind] || MOOD.mixed;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff" stroke="${m.ink}" stroke-width="1.6"/><circle cx="8.8" cy="10" r="1.3" fill="${m.ink}"/><circle cx="15.2" cy="10" r="1.3" fill="${m.ink}"/><path d="${m.mouth}" stroke="${m.ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/></svg>`;
}

export function planBadge(ruleCheck) {
  if (ruleCheck === 'yes') return { label: 'Followed plan', cls: 'good' };
  if (ruleCheck === 'mostly') return { label: 'Mostly followed', cls: 'mixed' };
  if (ruleCheck === 'no') return { label: 'Broke a rule', cls: 'hard' };
  return null;
}
const gradeCls = (g) => (!g ? 'none' : g[0] === 'A' ? 'good' : g[0] === 'B' ? 'mixed' : 'hard');
const symCls = (inst) => (/^(GC|MGC)$/i.test(inst || '') ? 'gold' : /^(ES|MES)$/i.test(inst || '') ? 'teal' : 'purple');

/** The numbers every view needs from one entry. */
export function tradeFacts(entry) {
  const totals = computeTradeTotals(entry);
  const net = entry.netPnl ?? totals.netPnl;
  const r = entry.rMultiple ?? totals.rMultiple;
  const lastExit = entry.exits?.[entry.exits.length - 1];
  return { totals, net, r, exitPrice: lastExit?.exitPrice ?? null, points: totals.avgPoints };
}

/* ── Small pieces ─────────────────────────────────────────────────── */

function rBar(r) {
  if (r == null || !Number.isFinite(r)) return '';
  const pos = Math.max(0, Math.min(100, ((r + 1) / 3) * 100));
  return `<div class="jv-rbar" aria-label="Result ${esc(fmtR(r))} on a scale from stop at minus 1R to target at plus 2R">
    <div class="jv-rbar-track"></div><div class="jv-rbar-tick"></div><div class="jv-rbar-dot ${r >= 0 ? 'good' : 'hard'}" style="left:${pos}%"></div>
  </div><div class="jv-rbar-l"><span>Stop −1R</span><span>Entry</span><span>+2R</span></div>`;
}

export function iccSteps(icc, { compact = false } = {}) {
  if (!icc) return '';
  const on = ICC_STEPS.map(([k]) => !!icc[k]);
  if (compact) return `<div class="jv-icc-dots" title="Dayli ICC steps seen">${on.map((v) => `<i class="${v ? '' : 'off'}"></i>`).join('')}</div>`;
  return `<div class="jv-icc">${ICC_STEPS.map(([, short, full], i) => `${i ? `<div class="jv-icc-ln ${on[i] && on[i - 1] ? 'on' : ''}"></div>` : ''}<div class="jv-icc-n ${on[i] ? 'on' : ''}" title="${full}">${on[i] ? '✓' : i + 1}</div>`).join('')}</div>
    <div class="jv-icc-l">${ICC_STEPS.map(([, short]) => `<span>${short}</span>`).join('')}</div>`;
}

function feelingChips(emotions) {
  const all = ['entering', 'during', 'exiting'].map((s) => (emotions?.[s] || [])[0]).filter(Boolean);
  if (!all.length) return '';
  return `<div class="jv-moods">${all.map((w) => `<span class="jv-mood ${feelingKind(w)}">${faceSvg(feelingKind(w))}${esc(w)}</span>`).join('')}</div>`;
}

/* ── Trade card (list, day panel, celebration) ───────────────────── */

function cardArt(entry) {
  const shot = entry.screenshots?.[0]?.path;
  const dir = entry.direction === 'short' ? 'short' : entry.direction === 'long' ? 'long' : '';
  const pill = dir ? `<span class="jv-dir ${dir}">${dir === 'long' ? '↗ Long' : '↘ Short'}</span>` : '';
  if (shot) return `<div class="jv-card-shot" data-shot-bg-path="${esc(shot)}" role="img" aria-label="Chart screenshot">${pill}</div>`;
  // No chart yet: a soft drawing in the trade's direction, so every card has a picture.
  const path = dir === 'short' ? 'M14 18 L46 34 L70 26 L104 52 L132 44 L166 70' : 'M14 70 L46 50 L70 58 L104 32 L132 40 L166 16';
  return `<div class="jv-card-art ${dir || 'none'}">${pill}
    <svg viewBox="0 0 180 86" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="166" cy="${dir === 'short' ? 70 : 16}" r="6" fill="#F4829A" stroke="#fff" stroke-width="2.5"/></svg>
    <small>No chart added</small></div>`;
}

function riskReward(f) {
  const { plannedRisk, plannedReward, riskRewardRatio } = f.totals;
  if (!plannedRisk && !plannedReward) return '';
  const cell = (label, value, cls = '') => `<div><small>${label}</small><b class="${cls}">${value}</b></div>`;
  return `<div class="jv-rr">
    ${cell('Risk', plannedRisk ? `<span class="${blur()}">$${Math.round(plannedRisk).toLocaleString('en-US')}</span>` : '–', 'hard')}
    ${cell('Reward', plannedReward ? `<span class="${blur()}">$${Math.round(plannedReward).toLocaleString('en-US')}</span>` : '–', 'good')}
    ${cell('R:R', riskRewardRatio ? `1 : ${Number(riskRewardRatio.toFixed(2))}` : '–')}
  </div>`;
}

export function tradeCardHtml(entry, { variant = 'list' } = {}) {
  const f = tradeFacts(entry);
  const badge = planBadge(entry.ruleCheck);
  const lesson = (entry.lessons || []).filter(Boolean)[0] || entry.wentWell || '';
  const Tag = variant === 'celebration' ? 'div' : 'a';
  const href = variant === 'celebration' ? '' : ` href="journal-entry.html?id=${encodeURIComponent(entry.id)}"`;
  return `<${Tag} class="jv-card jv-card-${variant}"${href}>
    ${cardArt(entry)}
    <div class="jv-card-top">
      <div class="jv-sym ${symCls(entry.instrument)}">${esc(entry.instrument || '–')}</div>
      <div class="jv-card-title"><h3>${dirWord(entry.direction)}${entry.tradeNumber ? ` <span>#${entry.tradeNumber}</span>` : ''}</h3><small>${esc(dayLabel(entry.tradeDate))}${timeLabel(entry) ? ` · ${esc(timeLabel(entry))}` : ''}</small></div>
      <div class="jv-pnl ${tone(f.net)}"><b class="${blur()}">${money(f.net)}</b>${fmtR(f.r) ? `<small>${fmtR(f.r)}</small>` : ''}</div>
    </div>
    <div class="jv-card-mid">
      ${riskReward(f)}
      ${rBar(f.r)}
      ${iccSteps(entry.iccChecklist)}
      ${badge || entry.emotions ? `<div class="jv-card-tags">${badge ? `<span class="jv-tag ${badge.cls}">${badge.label}</span>` : ''}${feelingChips(entry.emotions)}</div>` : ''}
    </div>
    ${lesson || entry.executionGrade ? `<div class="jv-card-foot">
      ${entry.executionGrade ? `<div class="jv-grade ${gradeCls(entry.executionGrade)}" title="Execution grade">${esc(entry.executionGrade)}</div>` : ''}
      ${lesson ? `<q>${esc(lesson)}</q>` : '<span class="jv-muted">No lesson logged yet</span>'}
    </div>` : ''}
  </${Tag}>`;
}

/* ── Timeline (grouped by day) ───────────────────────────────────── */

export function timelineHtml(entries) {
  const byDay = new Map();
  for (const e of entries) {
    if (!byDay.has(e.tradeDate)) byDay.set(e.tradeDate, []);
    byDay.get(e.tradeDate).push(e);
  }
  return `<div class="jv-tl">${[...byDay.entries()].map(([date, trades]) => {
    const sum = trades.reduce((s, t) => s + (tradeFacts(t).net || 0), 0);
    return `<div class="jv-tl-day"><small>${esc(dayLabel(date, { weekday: 'short' }))}</small><b>${esc(dayLabel(date, { month: 'short', day: 'numeric' }))}</b><span class="${tone(sum)}${blur()}">${money(sum)}</span></div>
      <div class="jv-tl-rows ${tone(sum)}">${trades.map((t) => {
        const f = tradeFacts(t);
        const badge = planBadge(t.ruleCheck);
        const lesson = (t.lessons || []).filter(Boolean)[0] || t.entryReasoning || '';
        return `<a class="jv-row" href="journal-entry.html?id=${encodeURIComponent(t.id)}">
          <div class="jv-sym ${symCls(t.instrument)}">${esc(t.instrument || '–')}</div>
          <div class="jv-row-main"><h4>${dirWord(t.direction)}${timeLabel(t) ? ` · ${esc(timeLabel(t))}` : ''}</h4><p>${esc(lesson) || '&nbsp;'}</p></div>
          <div class="jv-row-meta">${iccSteps(t.iccChecklist, { compact: true })}${badge ? `<span class="jv-tag ${badge.cls}">${badge.label}</span>` : ''}</div>
          ${t.executionGrade ? `<div class="jv-grade ${gradeCls(t.executionGrade)}">${esc(t.executionGrade)}</div>` : '<div></div>'}
          <div class="jv-pnl ${tone(f.net)}"><b class="${blur()}">${money(f.net)}</b>${fmtR(f.r) ? `<small>${fmtR(f.r)}</small>` : ''}</div>
        </a>`;
      }).join('')}</div>`;
  }).join('')}</div>`;
}

/* ── Calendar day panel ──────────────────────────────────────────── */

function dayHeadline(agg, trades) {
  if (!agg?.tradeCount) return agg?.missedSetup ? 'You <em class="jv-t">passed</em> on a setup.' : 'No trades <em class="jv-p">this day.</em>';
  const clean = agg.cleanExecution === true;
  const broke = trades.some((t) => t.ruleCheck === 'no');
  if (agg.netPnl > 0) return clean ? 'A clean <em class="jv-t">green day.</em>' : 'A green <em class="jv-t">day.</em>';
  if (agg.netPnl < 0) return clean ? 'Red, but <em class="jv-t">by the plan.</em>' : broke ? 'A day to <em class="jv-p">learn from.</em>' : 'A red <em class="jv-p">day.</em>';
  return 'An even <em class="jv-g">day.</em>';
}

/**
 * @param {{date:string, aggregate:object|null, trades:object[], reflections?:object[], planNote?:string}} data
 */
export function dayPanelHtml({ date, aggregate, trades, reflections = [], planNote = '' }) {
  const agg = aggregate || { tradeCount: 0 };
  const rSum = trades.reduce((s, t) => s + (tradeFacts(t).r || 0), 0);
  const followed = trades.filter((t) => t.ruleCheck === 'yes').length;
  const rated = trades.filter((t) => t.ruleCheck).length;
  const pct = rated ? Math.round((followed / rated) * 100) : null;
  const pre = reflections.filter((r) => r.entryType === 'premarket_reflection');
  const post = reflections.filter((r) => r.entryType === 'postmarket_reflection');
  return `<span class="jv-kicker">${esc(dayLabel(date, { weekday: 'long', month: 'short', day: 'numeric' }))}</span>
    <h3 class="jv-day-h">${dayHeadline(agg, trades)}</h3>
    ${agg.tradeCount ? `<div class="jv-day-sum">${agg.tradeCount} trade${agg.tradeCount === 1 ? '' : 's'} · <span class="${blur()}">${money(agg.netPnl)}</span> net${trades.some((t) => tradeFacts(t).r != null) ? ` · ${fmtR(rSum)}` : ''}</div>` : ''}
    ${pct != null || agg.checklistCompletionPct != null ? `<div class="jv-day-plan">
      ${pct != null ? `<div class="jv-ring sm" style="--p:${pct}"><b>${pct}%</b></div>` : ''}
      <p>${pct != null ? `<b>${followed} of ${rated} trade${rated === 1 ? '' : 's'} followed your plan.</b>` : ''}${agg.checklistCompletionPct != null ? `<br>Pre-market checklist: ${agg.checklistCompletionPct}% done.` : ''}</p>
    </div>` : ''}
    ${planNote}
    ${trades.map((t) => {
      const f = tradeFacts(t);
      return `<a class="jv-mini" href="journal-entry.html?id=${encodeURIComponent(t.id)}"><div class="jv-sym ${symCls(t.instrument)}">${esc(t.instrument || '–')}</div>
        <div><h4>${dirWord(t.direction)}${timeLabel(t) ? ` · ${esc(timeLabel(t))}` : ''}</h4><p>${esc((t.lessons || []).filter(Boolean)[0] || t.entryReasoning || '')}</p></div>
        <div class="jv-pnl ${tone(f.net)}"><b class="${blur()}">${money(f.net)}</b></div></a>`;
    }).join('')}
    ${pre.length || post.length ? `<div class="jv-refl">
      ${pre.map((r) => `<div class="pre"><small>Pre-market</small>${esc(r.text)}</div>`).join('')}
      ${post.map((r) => `<div class="post"><small>Post-market</small>${esc(r.text)}</div>`).join('')}
    </div>` : ''}
    <div class="jv-day-actions">
      <a class="jv-btn" href="journal-entry.html?tradeDate=${esc(date)}">✦ Add a trade for this day</a>
      ${agg.tradeCount ? `<button type="button" class="jv-btn ghost purple" data-ask-day="${esc(date)}">Ask the Agent about this day</button>` : ''}
      ${agg.cleanExecution === true ? `<a class="jv-btn ghost" href="share-win-flow.html?fromDate=${esc(date)}">Share this day as a win</a>` : ''}
    </div>`;
}

/* ── Trade story (detail page) ───────────────────────────────────── */

function storyHeadline(entry) {
  const dir = dirWord(entry.direction);
  if (entry.ruleCheck === 'yes') return `${dir}, <em class="jv-t">by the plan.</em>`;
  if (entry.ruleCheck === 'mostly') return `${dir}, <em class="jv-g">almost by the plan.</em>`;
  if (entry.ruleCheck === 'no') return `${dir}, <em class="jv-p">off the plan.</em>`;
  return `${dir} <em class="jv-p">${esc(entry.instrument || '')}</em>`;
}

/** Stop, entry and target zones with an arrow to the exit. Only real, saved prices: no invented path. */
function ladderSvg(entry, exitPrice) {
  const entryP = Number(entry.entryPrice);
  const stop = Number(entry.stopLossPoints);
  const tgt = Number(entry.takeProfitPoints);
  if (!Number.isFinite(entryP) || !(stop > 0) || !(tgt > 0)) return '';
  const short = entry.direction === 'short';
  const tgtP = short ? entryP - tgt : entryP + tgt;
  const stopP = short ? entryP + stop : entryP - stop;
  const exitP = Number.isFinite(Number(exitPrice)) && exitPrice !== null ? Number(exitPrice) : null;
  const prices = [tgtP, stopP, entryP, exitP].filter((v) => v != null);
  const pad = (Math.max(...prices) - Math.min(...prices)) * 0.12 || 1;
  const hi = Math.max(...prices) + pad; const lo = Math.min(...prices) - pad;
  const top = 34; const bot = 196;
  const y = (p) => top + ((hi - p) / (hi - lo)) * (bot - top);
  const yT = y(tgtP); const yE = y(entryP); const yS = y(stopP);
  const rr = (tgt / stop).toFixed(2).replace(/\.?0+$/, '');
  const minutes = entry.entryTime && entry.exits?.length && entry.exits[entry.exits.length - 1].exitedAt
    ? Math.round((new Date(entry.exits[entry.exits.length - 1].exitedAt) - new Date(entry.entryTime)) / 60000) : null;
  const zone = (a, b, fill) => `<rect x="40" y="${Math.min(a, b)}" width="400" height="${Math.abs(b - a)}" fill="${fill}"/>`;
  let exitMark = '';
  if (exitP != null) {
    const yX = y(exitP);
    exitMark = `<line x1="78" y1="${yE}" x2="390" y2="${yX}" stroke="#7F77DD" stroke-width="3.5" stroke-dasharray="2 7" stroke-linecap="round"/>
      <circle cx="400" cy="${yX}" r="8" fill="#F4829A" stroke="#fff" stroke-width="3"/>
      <text x="400" y="${yX + (yX < (top + bot) / 2 ? 24 : -14)}" text-anchor="middle" fill="#2C1810">Exit ${fmtPrice(exitP)}</text>
      ${minutes != null && minutes >= 0 ? `<text x="235" y="${(yE + yX) / 2 - 10}" text-anchor="middle" fill="#7F77DD">${minutes} min in the trade</text>` : ''}`;
  }
  return `<svg viewBox="0 0 520 230" role="img" aria-label="Stop, entry and target, with the exit marked">
    <g font-family="DM Sans" font-weight="700" font-size="12">
    ${zone(yT, yE, '#E8F8F6')}${zone(yE, yS, '#FDE8ED')}
    <line x1="40" x2="440" y1="${yT}" y2="${yT}" stroke="#3E9E93" stroke-width="2" stroke-dasharray="6 5"/>
    <line x1="40" x2="440" y1="${yE}" y2="${yE}" stroke="#2C1810" stroke-width="2.4"/>
    <line x1="40" x2="440" y1="${yS}" y2="${yS}" stroke="#E0607C" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="448" y="${yT + 4}" fill="#3E9E93">Target</text><text x="448" y="${yE + 4}" fill="#2C1810">Entry</text><text x="448" y="${yS + 4}" fill="#E0607C">Stop</text>
    <text x="40" y="${yT + (yT < yE ? -8 : 18)}" fill="#3E9E93">${short ? '−' : '+'}${tgt} pts · ${rr}R</text>
    <text x="40" y="${yS + (yS > yE ? 18 : -8)}" fill="#E0607C">${short ? '+' : '−'}${stop} pts · 1R</text>
    <circle cx="70" cy="${yE}" r="7" fill="#2C1810" stroke="#fff" stroke-width="2.5"/>
    <text x="70" y="${yE + (yS > yE ? -12 : 24)}" text-anchor="start" fill="#2C1810">${fmtPrice(entryP)}</text>
    ${exitMark}</g></svg>`;
}

function chipList(tags) {
  // Older entries stored some tags as keys (entered_early); show them as words.
  const list = (tags || []).filter(Boolean).map((t) => (/_/.test(t) ? t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()) : t));
  return list.length ? `<div class="jv-chips">${list.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : '';
}

export function tradeStoryHtml(entry) {
  const f = tradeFacts(entry);
  const exec = computeExecutionScore(entry);
  const score = entry.executionScore ?? exec.score;
  const badge = planBadge(entry.ruleCheck);
  const pills = [
    badge && `<span class="jv-tag ${badge.cls}">${badge.cls === 'good' ? '✓ ' : ''}${badge.label}</span>`,
    entry.biasAccuracy === 'yes' && '<span class="jv-tag purple">✓ Bias right</span>',
    entry.targetHit === 'yes' && '<span class="jv-tag gold">✓ Target hit</span>',
  ].filter(Boolean).join('');
  const stages = [['entering', 'Before'], ['during', 'During'], ['exiting', 'After']]
    .map(([k, l]) => ({ l, words: entry.emotions?.[k] || [] })).filter((s) => s.words.length);
  const kinds = stages.map((s) => feelingKind(s.words[0]));
  const feelH = !stages.length ? '' : kinds.every((k) => k === 'good') ? 'Calm all <em class="jv-t">the way through.</em>'
    : kinds[kinds.length - 1] === 'good' ? 'Found my <em class="jv-t">calm.</em>' : 'Honest about <em class="jv-p">how it felt.</em>';
  const lessons = (entry.lessons || []).filter(Boolean);
  const ladder = ladderSvg(entry, f.exitPrice);
  const shots = entry.screenshots || [];
  const rr = f.totals.riskRewardRatio;
  const sub = [entry.instrument, entry.contracts ? `${entry.contracts} contract${entry.contracts === 1 ? '' : 's'}` : '', timeLabel(entry), entry.session, entry.setupType].filter(Boolean).map(esc).join(' · ');

  return `<div class="jv-story">
    <section class="jv-s-hero">
      <div>
        <span class="jv-eyebrow">✦ ${entry.tradeNumber ? `Trade #${entry.tradeNumber} · ` : ''}${esc(dayLabel(entry.tradeDate, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))}</span>
        <div class="jv-s-title"><div class="jv-sym lg ${symCls(entry.instrument)}">${esc(entry.instrument || '–')}</div><div><h1>${storyHeadline(entry)}</h1><div class="jv-s-sub">${sub}</div></div></div>
        <div class="jv-s-stats">
          <div class="jv-st" style="--c:${f.net >= 0 ? '#3E9E93' : '#E0607C'}"><small>Net P&amp;L</small><b class="${blur()}">${money(f.net, { cents: true })}</b></div>
          <div class="jv-st" style="--c:#7F77DD"><small>Result</small><b>${fmtR(f.r) || '–'}</b></div>
          <div class="jv-st" style="--c:#F5A857"><small>Points</small><b>${f.points != null ? `${f.points > 0 ? '+' : ''}${Number(f.points.toFixed(2))}` : '–'}</b></div>
          <div class="jv-st" style="--c:#F4829A"><small>Planned</small><b>${rr ? `1 : ${Number(rr.toFixed(2))}` : '–'}</b></div>
        </div>
      </div>
      <div class="jv-score">
        <div class="jv-ring ${score == null ? '' : score >= 85 ? '' : score >= 60 ? 'mixed' : 'hard'}" style="--p:${score ?? 0}"><div><b>${esc(entry.executionGrade || (score != null ? score : '–'))}</b>${score != null ? `<small>${score}/100</small>` : ''}</div></div>
        <div><span class="jv-kicker">Execution</span><h3>${score == null ? 'Not <em class="jv-p">graded yet.</em>' : score >= 85 ? 'Clean <em class="jv-p">execution.</em>' : score >= 60 ? 'Solid, with <em class="jv-p">room to grow.</em>' : 'A lesson in <em class="jv-p">process.</em>'}</h3>
          <p>Graded on process, not profit.</p>${pills ? `<div class="jv-pills">${pills}</div>` : ''}</div>
      </div>
    </section>

    <section class="jv-s-grid">
      ${ladder ? `<div class="jv-panel"><span class="jv-kicker">The trade</span><h3>Entry to <em class="jv-p">exit.</em></h3><div class="jv-ladder">${ladder}</div></div>` : ''}
      <div class="jv-panel"><span class="jv-kicker">Dayli ICC</span><h3>Did I wait for <em class="jv-u">all five?</em></h3>
        ${entry.iccChecklist ? iccSteps(entry.iccChecklist) : '<p class="jv-muted">The ICC steps weren’t checked for this trade.</p>'}
        ${entry.iccChecklist ? `<div class="jv-chips soft">${entry.iccChecklist.bias4hAligned ? '<span>✓ 4H bias aligned</span>' : ''}${entry.iccChecklist.structure1hAligned ? '<span>✓ 1H structure aligned</span>' : ''}</div>` : ''}
        ${shots.length ? `<div class="jv-shots">${shots.map((s) => `<div class="jv-shot" data-shot-bg-path="${esc(s.path)}"></div>`).join('')}</div>` : ''}
      </div>
    </section>

    ${entry.entryReasoning || entry.exitReasoning || entry.entryTags?.length || entry.exitTags?.length || stages.length ? `<section class="jv-s-grid">
      <div class="jv-panel"><span class="jv-kicker">In my words</span>
        <div class="jv-who">Why I entered</div>${chipList(entry.entryTags)}${entry.entryReasoning ? `<div class="jv-bubble in">${esc(entry.entryReasoning)}</div>` : ''}
        <div class="jv-who">Why I exited</div>${chipList(entry.exitTags)}${entry.exitReasoning ? `<div class="jv-bubble out">${esc(entry.exitReasoning)}</div>` : ''}
      </div>
      ${stages.length ? `<div class="jv-panel"><span class="jv-kicker">How I felt</span><h3>${feelH}</h3>
        <div class="jv-feel">${stages.map((s, i) => `${i ? '<span class="jv-feel-arrow">→</span>' : ''}<div class="jv-feel-f ${kinds[i]}">${faceSvg(kinds[i], 46)}<b>${esc(s.words[0])}</b>${s.words.length > 1 ? `<em>${esc(s.words.slice(1).join(', '))}</em>` : ''}<small>${s.l}</small></div>`).join('')}</div>
      </div>` : ''}
    </section>` : ''}

    ${entry.wentWell || entry.wouldImprove || entry.ruleViolations?.length ? `<section class="jv-notes">
      ${entry.wentWell ? `<div class="jv-note good"><small>What went well</small><p>${esc(entry.wentWell)}</p></div>` : ''}
      ${entry.wouldImprove || entry.ruleViolations?.length ? `<div class="jv-note mixed"><small>What I’d improve</small>${entry.wouldImprove ? `<p>${esc(entry.wouldImprove)}</p>` : ''}${chipList(entry.ruleViolations)}</div>` : ''}
    </section>` : ''}

    ${lessons.length ? `<section class="jv-lesson">
      <div><small>Lesson${lessons.length > 1 ? 's' : ''} logged</small>${lessons.map((l) => `<q>${esc(l)}</q>`).join('')}</div>
      <img src="assets/cast/cast-together.jpg" alt="Six friends cheering together">
    </section>` : ''}

    <div class="jv-s-actions">
      <button type="button" class="jv-btn" id="jvEdit">Edit this trade</button>
      <a class="jv-btn ghost" href="share-win-flow.html?fromJournalEntryId=${encodeURIComponent(entry.id)}">Share as a win</a>
      <button type="button" class="jv-btn ghost purple" id="jvAsk">Ask the Agent about it</button>
      <a class="jv-btn ghost plain" href="journal.html">Back to journal</a>
    </div>
  </div>`;
}

/* ── Journal History: overview and insights ─────────────────────── */

/**
 * Three illustrated cards instead of a wall of tiles: process first
 * (followed plan), then results, then habits.
 * @param {ReturnType<import('./journal-service.js').getJournalStats>} stats
 */
export function historyOverviewHtml(stats, trades) {
  const pct = (v) => (v == null ? '–' : `${v}%`);
  const followed = stats.ruleFollowRate;
  const cleanCount = trades.filter((t) => t.ruleCheck === 'yes').length;
  const words = followed == null ? 'Log a few trades with the plan check to see this.'
    : followed >= 80 ? 'You trade your plan. Keep protecting that.'
    : followed >= 50 ? 'Most trades follow your plan. Keep tightening it.'
    : 'Your plan is the work right now. One clean trade at a time.';
  return `<div class="jv-over">
    <div class="jv-over-card process">
      <div class="jv-ring ${followed == null ? '' : followed >= 80 ? '' : followed >= 50 ? 'mixed' : 'hard'}" style="--p:${followed ?? 0}"><div><b>${pct(followed)}</b><small>FOLLOWED</small></div></div>
      <div><span class="jv-kicker">Process</span><h3>Your <em class="jv-t">plan.</em></h3><p>${words}</p><small class="jv-muted">${cleanCount} of ${trades.filter((t) => t.ruleCheck).length} rated trades fully followed it.</small></div>
    </div>
    <div class="jv-over-card">
      <span class="jv-kicker">Results</span><h3>Your <em class="jv-p">numbers.</em></h3>
      <div class="jv-over-grid">
        <div><small>Win rate</small><b>${pct(stats.winRate)}</b></div>
        <div><small>Avg R</small><b>${stats.avgR != null ? fmtR(stats.avgR) : '–'}</b></div>
        <div><small>Avg winner</small><b class="good ${blur()}">${stats.avgWinner != null ? money(stats.avgWinner) : '–'}</b></div>
        <div><small>Avg loser</small><b class="hard ${blur()}">${stats.avgLoser != null ? money(stats.avgLoser) : '–'}</b></div>
      </div>
    </div>
    <div class="jv-over-card">
      <span class="jv-kicker">Habits</span><h3>Your <em class="jv-g">routine.</em></h3>
      <div class="jv-over-grid">
        <div><small>Trades logged</small><b>${stats.tradesLogged}</b></div>
        <div><small>Bias right</small><b>${pct(stats.biasAccuracyRate)}</b></div>
        <div class="wide"><small>Journal streak</small><b>${stats.journalingStreak || 0} <span>day${stats.journalingStreak === 1 ? '' : 's'}</span></b></div>
      </div>
    </div>
  </div>`;
}

const INSIGHT_ICON = {
  positive: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  neutral: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5M12 16h.01"/>',
  watch: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
};
export function insightsHtml(insights) {
  if (!insights?.length) return '';
  return `<div class="jv-insights">${insights.map((i) => `<div class="jv-insight ${esc(i.kind)}">
    <span class="jv-insight-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${INSIGHT_ICON[i.kind] || INSIGHT_ICON.neutral}</svg></span>
    <p>${esc(i.text)}</p></div>`).join('')}</div>`;
}
