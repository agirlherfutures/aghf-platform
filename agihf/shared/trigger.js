/**
 * trigger.js — A Girl & Her Futures™
 *
 * Phase 6 · Pulling the Trigger. Decision training under pressure, built on
 * the Phase 5 execution engine (mountExecChart + evaluateDayliICC) rather than
 * beside it. Renderers:
 *
 *   trigger_sim     ExecutionDecisionPanel + ExecutionStatus + AGHFPreEntryCard +
 *                   ExecutionTimingTimeline around a live 1M chart. Candles print
 *                   one at a time; at checkpoints the chart freezes and she
 *                   decides WAIT / PREPARE / ENTER / PASS / REASSESS. ENTER is
 *                   clickable while candles form, so she can act too early (and
 *                   learn what was still missing). Modes:
 *                     decide  she makes the calls (lessons, Execution Timing Lab)
 *                     watch   the right calls play themselves (intros, completion)
 *                     review  another trader acts; she grades the process,
 *                             outcome hidden first (OutcomeBlindReview)
 *   p6_stack        the 4H → 1H → 15M → 1M hierarchy (1M sits at the END)
 *   p6_backwards    the 1M trap: start at 1M or 4H, then rewind
 *   p6_preentry     AGHFPreEntryCard: define each field, never "approve" a trade
 *   p6_ladder       the execution status ladder (CONFIRMED ≠ EXECUTABLE)
 *   p6_sort         tap-sort statements / setups into buckets
 *   p6_timing       entry timing markers: TOO EARLY / ON MODEL / TOO LATE
 *   p6_scrubber     drag through a replay: when did it first become executable?
 *   p6_matrix       the PROCESS × OUTCOME matrix
 *   p6_pause        a dramatic pause screen
 *   p6_review       the end-of-lab Execution Review (behavior, not identity)
 */

import { askQuestion } from './price-lab.js';
import { wrapGuide } from './guide.js';
import { mountExecChart, partialBar } from './icc-exec.js';
import { mountChart } from './structure-charts.js';
import { mindOn, mindOff, pauseButton } from './mind-ui.js';
import { trackAll } from './mind-core.js';
import { trackEnv } from './env-core.js';
import {
  XS, XS_META, XA, XA_META, STATUS_CHOICES, TIMING, readExecution, timingIndex,
  PRE_ENTRY_FIELDS, PE, preEntryResult, trackP6, executionReview, startSession,
} from './trigger-core.js';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function continueBtn(el, satisfy, label = 'Continue →') {
  if (!satisfy || el.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', () => { b.disabled = true; satisfy(); });
  el.appendChild(b);
}
function head(slide) {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Pulling the Trigger'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}`;
}
function statusPill(st) {
  const m = XS_META[st] || XS_META[XS.WAITING];
  return `<span class="tx-st tx-st-${m.tone}">${m.label}</span>`;
}
function gpToast(card, text) {
  const t = document.createElement('div');
  t.className = 'tx-gp';
  t.innerHTML = text;
  card.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* ── AGHFPreEntryCard (read-only view) ─────────────────────────────────── */
export function preEntryCardHtml(values = {}, { title = 'AGHF Pre-Entry Card' } = {}) {
  const r = preEntryResult(values);
  const row = (f) => {
    const v = values[f.key] || {};
    const st = v.state || v || PE.UNKNOWN;
    const mark = st === PE.DEFINED ? '✓' : st === PE.REVIEW ? '!' : '?';
    return `<div class="pe-row is-${typeof st === 'string' ? st : PE.UNKNOWN}"><span class="pe-k">${f.label}</span><span class="pe-v">${v.value || ''}</span><b>${mark}</b></div>`;
  };
  return `<div class="pe-card"><div class="tx-h">${title}</div>${PRE_ENTRY_FIELDS.map(row).join('')}
    <div class="pe-result ${r.state === 'not-ready' ? 'is-no' : 'is-wait'}">${r.state === 'not-ready'
      ? `NOT READY TO EXECUTE<small>${r.missing.join(', ')} ${r.missing.length > 1 ? 'aren’t' : 'isn’t'} defined.</small>`
      : 'READY TO WAIT FOR ICC<small>The card prepares you to wait. It doesn’t approve an entry.</small>'}</div></div>`;
}

/* ── trigger_sim ───────────────────────────────────────────────────────── */
/**
 * slide = {
 *   mode: 'decide' | 'watch' | 'review',
 *   scenario: { dir, tf, symbol, bars, start, context: [{ label, value }], preEntry, risk },
 *   setups: [{ pil, pilAt, from, missedAt, invalidAt, reassessAt, grace, label }]   (active by `from`)
 *   checkpoints: [{ at, intrabar?, kind: 'decide' | 'ask' | 'note', askStatus?, expect?, ask?, text?, after?, tempt? }]
 *   actions: ['wait', 'prepare', 'enter', 'pass', 'reassess'],
 *   trade: { side, stopPts, targetPts }   the plan once she (or a trader) enters
 *   traders: [{ name, at, intrabar, label }]           review mode: who clicked, and when
 *   grade: { ask, before: 'outcome' }                   outcome-blind grade after the entry
 *   blind: true    status / decision panel hidden until she answers
 *   timeline: false   hide the WAIT / PREPARE / EXECUTE rail
 *   ticker: { from, label }   hypothetical points moved without her (no-chase lesson)
 *   end: { text, card }
 * }
 */
export function renderTriggerSim(el0, slide, satisfy, helpers = {}) {
  const sc = slide.scenario;
  const mode = slide.mode || 'decide';
  const dir = sc.dir || 'bullish';
  const long = dir !== 'bearish';
  const total = sc.bars.length;
  const setups = (slide.setups || [{ pil: sc.pil, pilAt: sc.pilAt }]).map((s, i) => ({ dir, from: 0, label: `Setup ${i + 1}`, ...s }));
  const acts = slide.actions || [XA.WAIT, XA.PREPARE, XA.ENTER, XA.PASS, XA.REASSESS];
  const cps = (slide.checkpoints || []).map((c) => ({ kind: mode === 'review' && !c.kind ? 'ask' : 'decide', ...c }));
  const ctxLine = (sc.context || []).map((c) => `<span><i>${c.label}</i> ${c.value}</span>`).join('');

  el0.innerHTML = `<div class="lw-card tx-card txm-${mode}">
    ${head(slide)}
    ${ctxLine ? `<div class="tx-ctx">${ctxLine}${sc.risk ? `<span><i>Risk</i> ${sc.risk}</span>` : ''}</div>` : ''}
    <div class="tx-grid">
      <div class="tx-left">
        <div class="ex-chart-head"><b>${sc.tf || '1M'}</b><span>${sc.symbol || 'MNQ'}</span><span class="ex-dir ex-dir-${dir}">${long ? '↑ Bullish' : '↓ Bearish'}</span><span class="tx-ticker" hidden></span>${slide.clock ? '<span class="tx-clock">·</span>' : ''}</div>
        <div class="ex-chart"></div>
        ${slide.timeline === false ? '' : '<div class="tx-rail" aria-label="Execution timing"></div>'}
        <div class="pl-caption" aria-live="polite"></div>
      </div>
      <aside class="tx-side">
        ${sc.preEntry ? `<div class="tx-pe">${preEntryCardHtml(sc.preEntry)}</div>` : ''}
        <div class="tx-status-box"${slide.noStatus ? ' hidden' : ''}><div class="tx-h">Execution status</div><div class="tx-status"></div></div>
        <div class="tx-panel" hidden></div>
      </aside>
    </div>
    <div class="tx-decide" hidden></div>
    ${mode === 'decide' ? `<div class="tx-actions" role="group" aria-label="Actions">${acts.map((a) => `<button type="button" class="tx-act tx-act-${a}${a === XA.WAIT ? ' is-primary' : ''}" data-a="${a}">${(slide.labels || {})[a] || XA_META[a].label}</button>`).join('')}</div>` : ''}
    <div class="pl-asks"></div>
  </div>`;

  const card = el0.querySelector('.tx-card');
  const chart = mountExecChart(card.querySelector('.ex-chart'), { bars: sc.bars, total: sc.slots || total, pil: null, dir, range: sc.range });
  const cap = card.querySelector('.pl-caption');
  wrapGuide(cap);
  const asks = card.querySelector('.pl-asks');
  const railEl = card.querySelector('.tx-rail');
  const statusEl = card.querySelector('.tx-status');
  const panelEl = card.querySelector('.tx-panel');
  const decideEl = card.querySelector('.tx-decide');
  const actionsEl = card.querySelector('.tx-actions');
  const tickerEl = card.querySelector('.tx-ticker');

  let k = Math.min(sc.start ?? 6, total);
  let forming = null, timer = null, finished = false, blocked = false, keepMind = false;
  const ctx = { prepared: false, entered: false, passed: false };
  let entry = null; // { at, price }
  let statusKnown = !slide.blind;
  const fired = new Set();

  const say = (html) => { if (!html) return; cap.innerHTML = html; cap.classList.add('show'); wrapGuide(cap); };
  const setupAt = (i) => [...setups].reverse().find((s) => (s.from ?? 0) <= i) || setups[0];
  let active = setupAt(k - 1);
  const read = () => readExecution(sc.bars, active, k, ctx);

  function applySetup() {
    const s = setupAt(Math.max(0, k - 1));
    if (s !== active) {
      active = s; ctx.prepared = false; ctx.passed = false;
      chart.clearTags();
      say(`<b>${s.label}.</b> ${s.intro || 'New PIL. The sequence starts over from here.'}`);
    }
    chart.setPil(active.pil ?? null, active.pilAt);
  }

  function rail() {
    if (!railEl) return;
    const r = read();
    const on = active.pil == null ? -1 : timingIndex(r);
    railEl.innerHTML = TIMING.map((t, i) => {
      const st = i < on || (i === on && i === 4 && ctx.entered) ? 'done' : i === on ? 'current' : 'open';
      return `<span class="tx-rs is-${st}"><i></i><b>${t.label}</b><em class="tx-mode-${t.mode.toLowerCase()}">${t.mode}</em></span>`;
    }).join('');
  }
  function status() {
    const r = read();
    const st = ctx.entered ? null : r.status;
    statusEl.innerHTML = ctx.entered
      ? `<span class="tx-st tx-st-ok">IN THE TRADE</span><small>Planned entry at the PIL, after the first valid retest.</small>`
      : statusKnown ? `${statusPill(st)}<small>${XS_META[st].line}</small>` : '<span class="tx-st tx-st-off">?</span><small>What’s the status? Decide at the next pause.</small>';
  }
  function decisionPanel(r, picked, correct) {
    panelEl.hidden = false;
    panelEl.innerHTML = `<div class="tx-h">Execution decision</div>
      <div class="tx-dp"><span>Model state</span><b>${r.model}</b></div>
      <div class="tx-dp"><span>Setup status</span>${statusPill(r.status)}</div>
      <div class="tx-dp"><span>Price has confirmed</span><b>${r.confirmed.join(' · ')}</b></div>
      <div class="tx-dp"><span>Still missing</span><b>${forming ? 'The candle is still open' : (r.missing || 'Nothing. The model is complete.')}</b></div>
      <div class="tx-dp tx-dp-act ${correct ? 'is-ok' : 'is-no'}"><span>Correct trader action</span><b>${XA_META[r.expect || r.action].label}</b></div>`;
    void picked;
  }

  function refresh() {
    chart.draw(k, forming ? { bar: partialBar(sc.bars[k], forming.f), label: forming.label } : null);
    rail(); status();
    if (slide.clock) {
      const ck = card.querySelector('.tx-clock');
      const [h0, m0] = String(slide.clock.start || '9:30').split(':').map(Number);
      const mins = h0 * 60 + m0 + Math.max(0, k - (slide.clock.from ?? 0)) * (slide.clock.step || 1);
      if (ck) ck.innerHTML = `🕒 <b>${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}</b>${slide.clock.label ? ` ${slide.clock.label}` : ''}`;
    }
    if (slide.ticker && tickerEl) {
      const ref = active.pil;
      const last = forming ? partialBar(sc.bars[k], forming.f).c : sc.bars[k - 1]?.c;
      if (k - 1 >= slide.ticker.from && ref != null) {
        const pts = Math.round((long ? last - ref : ref - last) * 4) / 4;
        tickerEl.hidden = false;
        tickerEl.innerHTML = `${slide.ticker.label || 'Move without you'} <b>${pts >= 0 ? '+' : ''}${pts} pts</b>`;
      }
    }
  }

  /* playback */
  function stop() { clearTimeout(timer); timer = null; }
  function play(delay = 500) { if (finished) return; timer = 1; setTimeout(() => { if (card.isConnected && timer) next(); }, reduced() ? 0 : delay); }
  function next() {
    if (!card.isConnected) { stop(); return; }
    if (blocked || forming || finished) return;
    if (k >= total) { end(); return; }
    const dur = (reduced() ? 120 : (slide.speed || 1100));
    const t0 = performance.now();
    const cp = cps.find((c) => c.at === k && c.intrabar != null && !fired.has(c));
    const tempt = (slide.tempts || []).find((t) => t.at === k);
    forming = { f: 0, label: 'OPEN · 0:59' };
    if (tempt && actionsEl) actionsEl.querySelector('.tx-act-enter')?.classList.add('is-tempt');
    const tick = (now) => {
      if (!card.isConnected) { forming = null; stop(); return; }
      const f = Math.max(0, Math.min(1, (now - t0) / dur));
      forming.f = f;
      forming.label = `OPEN · 0:${String(Math.max(0, Math.round(59 * (1 - f)))).padStart(2, '0')}`;
      if (cp && f >= cp.intrabar) { fired.add(cp); refresh(); stop(); checkpoint(cp, () => { timer = 1; close(); }); return; }
      refresh();
      if (f < 1) requestAnimationFrame(tick); else close();
    };
    requestAnimationFrame(tick);
  }
  function close() {
    forming = null;
    if (!keepMind) mindOff(card);
    actionsEl?.querySelector('.tx-act-enter')?.classList.remove('is-tempt');
    k += 1;
    applySetup();
    refresh();
    // A trader (review mode) clicks: mark it on the candle.
    (slide.traders || []).forEach((t) => {
      if (t.at !== k - 1) return;
      chart.tag(k - 1, t.label || `${t.name} ENTERS`, t.tone || 'gold', long ? 'below' : 'above', `tr-${t.name}`);
      if (t.trade) enterTrade(k - 1, t.price ?? sc.bars[k - 1].c, false);
    });
    if (entry && !entry.result) settle();
    if (finished) return;
    const cp = cps.find((c) => c.at === k - 1 && c.intrabar == null && !fired.has(c));
    if (cp) { fired.add(cp); stop(); checkpoint(cp, () => play(450)); return; }
    if (k >= total) { end(); return; }
    if (timer) timer = setTimeout(() => next(), reduced() ? 0 : 320);
  }

  /* the trade, once entered: plan lines and the outcome */
  function enterTrade(at, price, mine = true) {
    entry = { at, price };
    const t = slide.trade || { stopPts: 30, targetPts: 60 };
    const sgn = long ? 1 : -1;
    entry.stop = price - sgn * t.stopPts; entry.target = price + sgn * t.targetPts;
    chart.lines([
      { price: entry.stop, label: `SL ${fmt(entry.stop)}`, tone: 'bad', at },
      { price: entry.target, label: `TP ${fmt(entry.target)}`, tone: 'ok', at },
    ]);
    if (mine) chart.tag(at, 'ENTRY', 'gold', long ? 'below' : 'above', 'entry');
  }
  function settle() {
    for (let i = entry.at + 1; i < k; i++) {
      const b = sc.bars[i];
      const hitStop = long ? b.l <= entry.stop : b.h >= entry.stop;
      const hitTarget = long ? b.h >= entry.target : b.l <= entry.target;
      if (hitStop || hitTarget) {
        entry.result = hitStop ? 'loss' : 'win';
        const r = slide.trade?.targetPts && slide.trade?.stopPts ? slide.trade.targetPts / slide.trade.stopPts : 2;
        const winLabel = slide.trade?.winLabel || `TARGET · +${r}R`;
        chart.tag(i, hitStop ? 'STOP · −1R' : winLabel, hitStop ? 'bad' : 'ok', 'auto', 'result');
        say(hitStop ? '<b>Stop reached.</b> −1R.' : slide.trade?.winSay || `<b>Target reached.</b> +${r}R.`);
        stop();
        if (slide.afterResult) { blocked = true; stop(); askQuestion(asks, slide.afterResult, wrapHelpers(), () => { blocked = false; end(); }); return; }
        end();
        return;
      }
    }
  }

  /* checkpoints */
  function checkpoint(cp, then) {
    if (cp.text) say(cp.text);
    // Phase 7: her inner voice over a muted chart, and the PAUSE interrupt.
    if (cp.thought) { mindOn(card, cp.thought, cp); keepMind = !!cp.thoughtStay; }
    if (cp.pause) pauseButton(asks, cp.pause, { open: cp.pauseOpen });
    if (cp.kind === 'note' || mode === 'watch') {
      const r = read();
      if (mode === 'watch') {
        statusKnown = true;
        const a = cp.expect || r.action;
        if (a === XA.PREPARE) ctx.prepared = true;
        if (a === XA.PASS) { ctx.passed = true; trackP6('validPasses'); }
        if (a === XA.ENTER) { ctx.entered = true; enterTrade(k - 1, active.pil); }
        refresh();
        if (cp.watchSay !== false) decisionPanel({ ...r, expect: a }, a, true);
      }
      blocked = true;
      setTimeout(() => { blocked = false; if (cp.after) say(cp.after); then(); }, reduced() ? 0 : (cp.hold || 2200));
      return;
    }
    if (cp.kind === 'ask') {
      blocked = true;
      // Outcome-blind: grade the process before anything after this candle is visible.
      if (cp.blind) chart.curtain(k);
      askQuestion(asks, cp.ask, wrapHelpers(cp), () => { blocked = false; if (cp.blind) chart.curtain(null); if (cp.after) say(cp.after); if (cp.goal) { end(); return; } then(); });
      return;
    }
    // decide
    blocked = true;
    const r = read();
    const expect = cp.expect || r.action;
    const doActions = () => {
      decideEl.hidden = false;
      decideEl.innerHTML = `<div class="tx-q">${cp.prompt || (forming ? 'The candle is still open. What do you do?' : 'What do you do right now?')}</div>`;
      actionsEl?.classList.add('is-live');
      pending = { cp, r, expect, then };
      if (window.__aghfTest) decideEl.dataset.expect = expect; // test harness only
      (actionsEl || decideEl).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
    };
    if (cp.askStatus) {
      statusKnown = false; status();
      decideEl.hidden = false;
      decideEl.innerHTML = `<div class="tx-q">First: what’s the execution status?</div><div class="tx-chips">${STATUS_CHOICES.map((s) => `<button type="button" class="tx-chip" data-s="${s}">${XS_META[s].label}</button>`).join('')}</div><div class="tx-fb"></div>`;
      decideEl.querySelectorAll('.tx-chip').forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.s === r.status;
        helpers.onPick?.({ prompt: `${slide.title || 'trigger'}:status` }, { label: XS_META[b.dataset.s].label }, ok);
        helpers.handleStreak?.(ok);
        if (!ok) { b.disabled = true; b.classList.add('no'); decideEl.querySelector('.tx-fb').innerHTML = `Not quite. Price has confirmed: <b>${r.confirmed.join(' · ')}</b>.`; return; }
        b.classList.add('ok'); statusKnown = true; status();
        setTimeout(doActions, 500);
      }));
    } else doActions();
  }

  let pending = null;
  function decide(a) {
    // ENTER while candles are moving (no checkpoint open): the impulse click.
    if (!pending) {
      if (a !== XA.ENTER || finished || ctx.entered) return;
      const r = read();
      if (r.status === XS.EXECUTABLE && !forming) { pending = { cp: {}, r, expect: XA.ENTER, then: () => play(450) }; stop(); blocked = true; return decide(a); }
      stop(); blocked = true;
      anticipation(r, () => { blocked = false; play(300); });
      return;
    }
    const { cp, r, expect, then } = pending;
    const ok = a === expect || (cp.accept || []).includes(a);
    helpers.onPick?.({ prompt: `${slide.title || 'trigger'}:${cp.at}` }, { label: XA_META[a].label }, ok);
    helpers.handleStreak?.(ok);
    trackP6('decisions'); if (ok) trackP6('correctDecisions');
    // Phase 7: a checkpoint can name the behavior each action represents (cp.mind = { enter: 'fomoDecisionCount', … }).
    if (cp.mind && !pending.tracked) { trackAll(cp.mind[a]); pending.tracked = true; }
    if (ok) {
      pending = null;
      actionsEl?.classList.remove('is-live');
      decideEl.hidden = true;
      decisionPanel(r, a, true);
      if (a === XA.WAIT || a === XA.PASS || a === XA.REASSESS) {
        trackP6('patienceDecisions');
        if (a === XA.PASS) trackP6(r.status === XS.MISSED ? 'missedTradeResponses' : 'validPasses');
        if (a === XA.PASS && cp.noTrade) trackP6('noTradeDecisions');
        if (a === XA.REASSESS) trackP6('reassessmentDecisions');
        gpToast(card, cp.gp || `<b>+5</b> PATIENCE GP`);
      }
      if (a === XA.PREPARE) ctx.prepared = true;
      if (a === XA.PASS) ctx.passed = true;
      if (a === XA.ENTER) { ctx.entered = true; trackP6('validEntries'); enterTrade(k - 1, active.pil); gpToast(card, '<b>ON MODEL</b> ✓'); }
      say(cp.after || XA_META[a].line);
      refresh();
      blocked = false;
      if (slide.grade && a === XA.ENTER) { gradeStep(); return; }
      if (ctx.passed && cp.endOnPass !== false && !slide.playAfterPass) { end(); return; }
      if (cp.goal) { end(); return; }
      then();
      return;
    }
    // wrong
    actionsEl?.querySelector(`[data-a="${a}"]`)?.classList.add('is-no');
    setTimeout(() => actionsEl?.querySelector(`[data-a="${a}"]`)?.classList.remove('is-no'), 700);
    if (a === XA.ENTER) { if (r.status === XS.MISSED) { trackP6('chaseAttempts'); feedbackBad('<b>THAT’S A CHASE.</b> The planned opportunity was the first retest. Price moving without you doesn’t create a new entry.'); } else anticipation(r, null); return; }
    if (a === XA.PASS && (r.status === XS.WAITING || r.status === XS.DEVELOPING || r.status === XS.CONFIRMED)) { feedbackBad('Not a pass yet. The setup is still building and nothing has invalidated it. <b>Wait</b> for what’s missing.'); return; }
    if (a === XA.WAIT && r.status === XS.EXECUTABLE) { feedbackBad('This is the moment you waited for: the <b>first valid retest</b>. Waiting now turns a valid entry into a missed one.'); return; }
    if (a === XA.PREPARE && r.status !== XS.CONFIRMED) { feedbackBad(`Prepare comes after the sequence is confirmed. Still missing: <b>${forming ? 'the close' : r.missing}</b>.`); return; }
    if (a === XA.WAIT && r.status === XS.CONFIRMED && !ctx.prepared) { feedbackBad('Waiting is right in spirit, but continuation just <b>confirmed</b>. This is where you <b>prepare</b>: plan the entry at the PIL.'); return; }
    feedbackBad(`Not this one. ${XA_META[expect].line}`);
  }
  function feedbackBad(html) {
    let fb = decideEl.querySelector('.tx-fb');
    if (!fb) { fb = document.createElement('div'); fb.className = 'tx-fb'; decideEl.appendChild(fb); }
    fb.innerHTML = html; fb.className = 'tx-fb bad';
  }
  // Acting early is not punished hard: name it, show what was missing, offer a replay.
  function anticipation(r, resume) {
    trackP6('anticipationErrors');
    chart.flash();
    const box = document.createElement('div');
    box.className = 'tx-err';
    box.innerHTML = `<div class="tx-err-h">ANTICIPATION ERROR</div>
      <p>${forming ? 'That candle was still open.' : 'Price hadn’t earned the entry.'} What was still missing?</p>
      <div class="tx-missing">${forming && r.missing ? `${r.missing} <small>(the candle hasn’t closed)</small>` : (r.missing || 'The first valid retest')}</div>
      <div class="tx-err-btns">${resume ? '<button type="button" class="tx-mini tx-back">Back to waiting ▶</button>' : ''}<button type="button" class="tx-mini tx-replay">↻ Replay this moment</button></div>`;
    asks.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    box.querySelector('.tx-back')?.addEventListener('click', () => { box.remove(); resume(); });
    box.querySelector('.tx-replay').addEventListener('click', () => { box.remove(); replay(); });
    if (!resume) feedbackBad(`Still missing: <b>${forming ? 'the close' : (r.missing || 'the retest')}</b>. Try again.`);
  }
  function replay() {
    stop(); forming = null; pending = null; blocked = false;
    actionsEl?.classList.remove('is-live'); decideEl.hidden = true;
    k = Math.max(sc.start ?? 6, k - 4);
    [...fired].forEach((c) => { if (c.at >= k - 1) fired.delete(c); });
    ctx.prepared = false;
    applySetup(); refresh();
    say('Replay. Watch the candle <b>finish</b> this time.');
    play(700);
  }

  /* outcome-blind grade (after an entry) */
  function gradeStep() {
    blocked = true; stop();
    chart.curtain(k);
    say(slide.grade.say || 'Before you see how it ends: grade the <b>execution</b>.');
    askQuestion(asks, slide.grade.ask, wrapHelpers(slide.grade), () => {
      chart.curtain(null);
      blocked = false;
      say(slide.grade.after || 'Now the outcome.');
      play(900);
    });
  }

  function end() {
    if (finished) return;
    finished = true; stop();
    helpers.onTriggerEnd?.({ entered: ctx.entered, passed: ctx.passed, result: entry?.result || null });
    actionsEl?.querySelectorAll('.tx-act').forEach((b) => { b.disabled = true; });
    const e = slide.end || {};
    if (e.text) say(e.text);
    const fin = () => {
      if (e.card) { const c = document.createElement('div'); c.className = 'icc-principle'; c.innerHTML = e.card; asks.appendChild(c); }
      continueBtn(card, satisfy, slide.cta || 'Continue →');
    };
    if (e.ask) askQuestion(asks, e.ask, wrapHelpers(e), fin); else fin();
  }

  function wrapHelpers(src = {}) {
    return { ...helpers, onPick(q, o, correct, w) {
      helpers.onPick?.(q, o, correct, w);
      if (src.track) { trackP6('decisions'); if (correct) trackP6('correctDecisions'); }
      if (o.track) { trackP6(o.track); if (!w) trackAll(o.track); }
      if (!w && q?.ecat) trackEnv(q.ecat, correct);
      if (!w && o.einc) trackEnv(o.einc);
      if (!correct && o.bias) trackP6('outcomeBiasErrors');
      if (correct && o.patience) gpToast(card, '<b>+5</b> PATIENCE GP');
    } };
  }

  actionsEl?.addEventListener('click', (e) => {
    const b = e.target.closest('.tx-act');
    if (b && !b.disabled) decide(b.dataset.a);
  });

  applySetup();
  refresh();
  if (slide.intro) say(slide.intro);
  if (slide.preAsk) {
    blocked = true;
    askQuestion(asks, slide.preAsk, wrapHelpers(slide.preAsk), () => { blocked = false; if (slide.preAsk.after) say(slide.preAsk.after); if (k < total) play(900); else end(); });
  } else if (k < total) play(mode === 'watch' ? 1200 : 1500);
  else end();
}

/* ── p6_stack: the hierarchy ───────────────────────────────────────────── */
const STACK = [
  ['4H', 'READ THE ROOM', 'The story and the direction.'],
  ['1H', 'BUILD THE MAP', 'The structure and the levels.'],
  ['15M', 'OBSERVE', 'Watch it approach. Don’t act.'],
  ['1M', 'EXECUTE', 'Only now. The END of the process.'],
];
export function renderStack(el, slide, satisfy) {
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="p6-stack">${STACK.map(([tf, t, l], i) => `${i ? '<div class="p6-arrow">↓</div>' : ''}<div class="p6-tier p6-tier-${i}" style="--d:${0.2 + i * 0.45}s"><b>${tf}</b><span><strong>${t}</strong><small>${l}</small></span></div>`).join('')}</div>
    ${slide.punch ? `<div class="icc-principle" style="--d:2.2s">${slide.punch}</div>` : ''}</div>`;
  continueBtn(el.querySelector('.lw-card'), satisfy);
}

/* ── p6_backwards: the 1M trap ─────────────────────────────────────────── */
export function renderBackwards(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p6-bw">${head(slide)}
    <div class="p6-bw-pick"><div class="tx-q">${slide.choose || 'You open your charts. Where do you start?'}</div>
      <div class="p6-bw-btns"><button type="button" class="tx-mini" data-s="1m">Start at 1M</button><button type="button" class="tx-mini" data-s="4h">Start at 4H</button></div></div>
    <div class="p6-bw-stage"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p6-bw');
  const stage = card.querySelector('.p6-bw-stage');
  const asks = card.querySelector('.pl-asks');
  const chartBox = (tf, title, spec) => {
    const d = document.createElement('div');
    d.className = 'p6-bw-chart';
    d.innerHTML = `<div class="ex-chart-head"><b>${tf}</b><span>${title}</span></div><div class="p6-bw-c"></div>`;
    stage.appendChild(d);
    mountChart(d.querySelector('.p6-bw-c'), spec, { height: 200 });
    return d;
  };
  const proper = () => {
    stage.innerHTML = '';
    const rows = [['4H', 'Read the room', slide.charts.h4], ['1H', 'Build the map', slide.charts.h1], ['15M', 'Observe', slide.charts.m15], ['1M', 'Execute, only now', slide.charts.m1]];
    rows.forEach(([tf, t, spec], i) => setTimeout(() => { if (card.isConnected) chartBox(tf, t, spec).classList.add('is-in'); }, reduced() ? 0 : i * 900));
    setTimeout(() => {
      if (!card.isConnected) return;
      const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle;
      asks.appendChild(p); continueBtn(card, satisfy);
    }, reduced() ? 0 : rows.length * 900 + 400);
  };
  card.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => {
    card.querySelector('.p6-bw-pick').remove();
    if (b.dataset.s === '4h') { trackP6('preEntryReadiness'); proper(); return; }
    trackP6('backwardsAnalysis');
    chartBox('1M', 'A beautiful bullish ICC…', slide.charts.m1);
    const like = document.createElement('button');
    like.type = 'button'; like.className = 'p6-like'; like.textContent = '♥ I LIKE THIS';
    stage.appendChild(like);
    like.addEventListener('click', () => {
      like.remove();
      const h4 = chartBox('4H', 'Looking for reasons…', slide.charts.h4);
      h4.insertAdjacentHTML('beforeend', `<div class="p6-bubbles">${(slide.justify || ['“See? It’s kind of bullish here…”', '“If I squint, that’s support.”', '“The 4H probably agrees.”']).map((t, i) => `<span style="--d:${0.3 + i * 0.6}s">${t}</span>`).join('')}</div>`);
      setTimeout(() => {
        if (!card.isConnected) return;
        askQuestion(asks, slide.ask, helpers, () => {
          const rw = document.createElement('button');
          rw.type = 'button'; rw.className = 'tx-mini'; rw.textContent = '⟲ Rewind: do it in order';
          asks.appendChild(rw);
          rw.addEventListener('click', () => { asks.innerHTML = ''; proper(); });
        });
      }, reduced() ? 0 : 2200);
    });
  }));
}

/* ── p6_preentry: build the card ───────────────────────────────────────── */
export function renderPreEntry(el, slide, satisfy, helpers = {}) {
  const vals = {};
  const given = slide.values || {};
  el.innerHTML = `<div class="lw-card">${head(slide)}
    ${slide.brief ? `<div class="p6-brief">${slide.brief}</div>` : ''}
    <div class="pe-build">${PRE_ENTRY_FIELDS.map((f) => `<div class="pe-brow" data-k="${f.key}"><div><b>${f.label}</b><small>${f.q}</small>${given[f.key]?.value ? `<em>${given[f.key].value}</em>` : ''}</div>
      <div class="pe-tog"><button type="button" data-v="${PE.DEFINED}">Defined ✓</button><button type="button" data-v="${PE.UNKNOWN}">Unknown ?</button></div></div>`).join('')}</div>
    <div class="pe-out"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const out = card.querySelector('.pe-out');
  const asks = card.querySelector('.pl-asks');
  let done = false;
  card.querySelectorAll('.pe-brow').forEach((row) => row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (done) return;
    const key = row.dataset.k, want = given[key]?.state || PE.DEFINED;
    if (b.dataset.v !== want) {
      b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 600);
      helpers.handleStreak?.(false);
      out.innerHTML = `<div class="tx-fb bad">${given[key]?.why || 'Look at the brief again.'}</div>`;
      return;
    }
    helpers.handleStreak?.(true);
    row.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    row.classList.add('is-set');
    vals[key] = { state: want, value: given[key]?.value };
    out.innerHTML = '';
    if (Object.keys(vals).length === PRE_ENTRY_FIELDS.length) {
      done = true;
      trackP6('preEntryReadiness');
      out.innerHTML = preEntryCardHtml(vals);
      const fin = () => continueBtn(card, satisfy);
      if (slide.ask) askQuestion(asks, slide.ask, helpers, fin); else fin();
    }
  })));
}

/* ── p6_ladder: execution status ladder ────────────────────────────────── */
export function renderLadder(el, slide, satisfy) {
  const rows = slide.rows || [
    [XS.WAITING, 'PIL defined. Nothing proven.', 'WAIT'],
    [XS.DEVELOPING, 'PIL ✓ · I ✓ · C ✓ · Continuation ✗', 'WAIT'],
    [XS.CONFIRMED, 'I · C · C closed. No retest yet.', 'PREPARE'],
    [XS.EXECUTABLE, 'First valid retest. Setup still active.', 'EXECUTE'],
    [XS.INVALID, 'The model failed, or you passed.', 'STAND DOWN'],
  ];
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="p6-ladder">${rows.map(([s, l, a], i) => `<div class="p6-rung" style="--d:${0.2 + i * 0.4}s">${statusPill(s)}<span>${l}</span><b class="tx-mode-${a.toLowerCase().replace(' ', '-')}">${a}</b></div>`).join('')}</div>
    ${slide.punch ? `<div class="icc-principle">${slide.punch}</div>` : ''}</div>`;
  continueBtn(el.querySelector('.lw-card'), satisfy);
}

/* ── p6_sort: tap-sort into buckets ────────────────────────────────────── */
export function renderSort(el, slide, satisfy, helpers = {}) {
  const items = slide.items;
  const buckets = slide.buckets; // [{ key, label, tone }]
  let i = 0, wrongs = 0;
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="p6-sort-cols">${buckets.map((b) => `<div class="p6-col p6-col-${b.tone || 'ink'}" data-b="${b.key}"><div class="p6-col-h">${b.label}</div><div class="p6-col-list"></div></div>`).join('')}</div>
    <div class="p6-sort-q"></div><div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const q = card.querySelector('.p6-sort-q');
  const fb = card.querySelector('.tx-fb');
  function show() {
    if (i >= items.length) {
      q.innerHTML = '';
      if (slide.punch) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.punch; card.querySelector('.pl-asks').appendChild(p); }
      continueBtn(card, satisfy);
      return;
    }
    const it = items[i];
    q.innerHTML = `<div class="p6-item">${it.text}</div><div class="p6-sort-btns">${buckets.map((b) => `<button type="button" class="tx-mini p6-sb-${b.tone || 'ink'}" data-b="${b.key}">${b.short || b.label}</button>`).join('')}</div>`;
    q.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      const ok = btn.dataset.b === it.bucket;
      helpers.onPick?.({ prompt: `${slide.title || 'sort'}:${i}`, concept: slide.concept }, { label: btn.textContent }, ok);
      helpers.handleStreak?.(ok);
      if (slide.track) { trackP6('decisions'); if (ok) trackP6('correctDecisions'); }
      if (!ok) { wrongs += 1; btn.disabled = true; fb.innerHTML = it.why || 'Not quite. Look again.'; fb.className = 'tx-fb bad'; return; }
      fb.innerHTML = it.why ? `<b>✦</b> ${it.why}` : ''; fb.className = `tx-fb ${it.why ? 'good' : ''}`;
      const li = document.createElement('div'); li.className = 'p6-col-item'; li.innerHTML = it.short || it.text;
      card.querySelector(`.p6-col[data-b="${it.bucket}"] .p6-col-list`).appendChild(li);
      i += 1; setTimeout(show, reduced() ? 0 : 450);
    }));
  }
  show();
  void wrongs;
}

/* ── p6_timing: A / B / C entry markers ────────────────────────────────── */
export function renderTiming(el, slide, satisfy, helpers = {}) {
  const sc = slide.scenario;
  const labels = slide.labels || [['early', 'TOO EARLY'], ['on', 'ON MODEL'], ['late', 'TOO LATE / CHASE']];
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="ex-chart"></div>
    <div class="p6-tm">${slide.markers.map((m) => `<div class="p6-tm-row" data-id="${m.id}"><b>${m.id}</b><span>${m.desc}</span><div class="p6-tm-btns">${labels.map(([k2, l]) => `<button type="button" class="tx-mini" data-v="${k2}">${l}</button>`).join('')}</div><div class="tx-fb"></div></div>`).join('')}</div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const chart = mountExecChart(card.querySelector('.ex-chart'), { bars: sc.bars, pil: sc.pil, pilAt: sc.pilAt, dir: sc.dir || 'bullish' });
  chart.setPil(sc.pil, sc.pilAt);
  chart.draw(sc.bars.length);
  (sc.tags || []).forEach((t) => chart.tag(t.at, t.text, t.tone || 'ink', t.where || 'auto'));
  slide.markers.forEach((m) => chart.tag(m.at, m.id, 'gold', m.where || 'below', `m-${m.id}`));
  const left = new Set(slide.markers.map((m) => m.id));
  card.querySelectorAll('.p6-tm-row').forEach((row) => row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    const m = slide.markers.find((x) => x.id === row.dataset.id);
    const ok = b.dataset.v === m.answer;
    const fb = row.querySelector('.tx-fb');
    helpers.onPick?.({ prompt: `timing:${m.id}`, concept: 'Retest timing' }, { label: b.textContent }, ok);
    helpers.handleStreak?.(ok);
    if (!ok) { b.disabled = true; fb.innerHTML = m.hint || 'Look at what had confirmed at that moment.'; fb.className = 'tx-fb bad'; return; }
    row.querySelectorAll('button').forEach((x) => { x.disabled = true; x.classList.toggle('ok', x === b); });
    fb.innerHTML = `<b>✦</b> ${m.why}`; fb.className = 'tx-fb good';
    left.delete(m.id);
    if (!left.size) {
      if (slide.punch) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.punch; card.querySelector('.pl-asks').appendChild(p); }
      continueBtn(card, satisfy);
    }
  })));
}

/* ── p6_scrubber: when did it first become executable? ─────────────────── */
export function renderScrubber(el, slide, satisfy, helpers = {}) {
  const sc = slide.scenario;
  const setup = { pil: sc.pil, pilAt: sc.pilAt, dir: sc.dir || 'bullish' };
  const total = sc.bars.length;
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="ex-chart"></div>
    <div class="p6-scrub"><input type="range" min="${sc.start || 1}" max="${total}" value="${sc.start || 1}" aria-label="Replay position"><div class="p6-scrub-read"></div></div>
    <button type="button" class="tx-mini p6-scrub-go">It first became executable HERE</button><div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const chart = mountExecChart(card.querySelector('.ex-chart'), { bars: sc.bars, total, pil: sc.pil, pilAt: sc.pilAt, dir: setup.dir });
  chart.setPil(sc.pil, sc.pilAt);
  const range = card.querySelector('input');
  const rd = card.querySelector('.p6-scrub-read');
  const fb = card.querySelector('.tx-fb');
  const truth = readExecution(sc.bars, setup, total).ev.firstRetest;
  let solved = false;
  const draw = () => {
    const kk = +range.value;
    chart.draw(kk);
    rd.innerHTML = solved ? `${statusPill(readExecution(sc.bars, setup, kk).status)} <small>candle ${kk} / ${total}</small>` : `<small>candle ${kk} / ${total}</small>`;
  };
  range.addEventListener('input', draw);
  card.querySelector('.p6-scrub-go').addEventListener('click', () => {
    if (solved) return;
    const kk = +range.value, last = kk - 1;
    const ok = last === truth;
    helpers.onPick?.({ prompt: 'scrubber', concept: 'Retest timing' }, { label: `candle ${kk}` }, ok);
    helpers.handleStreak?.(ok);
    if (!ok) {
      const r = readExecution(sc.bars, setup, kk);
      fb.innerHTML = last < truth ? `Too early. At this candle the status is ${statusPill(r.status)}. Still missing: <b>${r.missing}</b>.` : `Later than the first moment. By here the status reads ${statusPill(r.status)}.`;
      fb.className = 'tx-fb bad';
      return;
    }
    solved = true;
    chart.tag(truth, 'FIRST RETEST', 'gold', 'below');
    fb.innerHTML = `<b>✦ Right there.</b> Indication, correction and continuation had closed, and price came back to the PIL. ${statusPill(XS.EXECUTABLE)}`;
    fb.className = 'tx-fb good';
    draw();
    if (slide.punch) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.punch; card.querySelector('.pl-asks').appendChild(p); }
    continueBtn(card, satisfy);
  });
  draw();
}

/* ── p6_matrix: process × outcome ──────────────────────────────────────── */
export const QUADS = [
  { key: 'gw', proc: 'GOOD PROCESS', out: 'WIN', line: 'Valid execution. Winning outcome.' },
  { key: 'gl', proc: 'GOOD PROCESS', out: 'LOSS', line: 'Valid execution. Losing outcome.' },
  { key: 'bw', proc: 'BAD PROCESS', out: 'WIN', line: 'Rule-breaking execution. Winning outcome.', danger: 'DANGEROUS REINFORCEMENT' },
  { key: 'bl', proc: 'BAD PROCESS', out: 'LOSS', line: 'Rule-breaking execution. Losing outcome.' },
];
export function matrixHtml(on = null, label = 'Outcome') {
  return `<div class="p6-matrix"><div class="p6-mx-axis p6-mx-x"><span>WIN</span><span>LOSS</span><i>${label}</i></div><div class="p6-mx-grid">${QUADS.map((q) => `<div class="p6-q p6-q-${q.key}${on === q.key ? ' is-on' : ''}" data-q="${q.key}"><b>${q.proc} + ${q.out}</b><small>${q.line}</small>${q.danger ? `<em>⚠ ${q.danger}</em>` : ''}</div>`).join('')}</div></div>`;
}
export function renderMatrix(el, slide, satisfy, helpers = {}) {
  const items = slide.items || [];
  let i = 0;
  el.innerHTML = `<div class="lw-card">${head(slide)}${matrixHtml(null, slide.outcomeLabel)}<div class="p6-sort-q"></div><div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const q = card.querySelector('.p6-sort-q');
  const fb = card.querySelector('.tx-fb');
  const quads = card.querySelectorAll('.p6-q');
  function show() {
    quads.forEach((x) => x.classList.remove('is-on'));
    if (i >= items.length) {
      q.innerHTML = '';
      card.querySelector('.p6-q-bw').classList.add('is-danger');
      if (slide.punch) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.punch; card.querySelector('.pl-asks').appendChild(p); }
      continueBtn(card, satisfy);
      return;
    }
    q.innerHTML = `<div class="p6-item">${items[i].text}</div><div class="tx-q">Tap the quadrant.</div>`;
  }
  quads.forEach((qq) => qq.addEventListener('click', () => {
    if (i >= items.length) return;
    const it = items[i];
    const ok = qq.dataset.q === it.quad;
    helpers.onPick?.({ prompt: `matrix:${i}`, concept: 'Process vs outcome' }, { label: qq.dataset.q }, ok);
    helpers.handleStreak?.(ok);
    trackP6('decisions');
    if (!ok) { if (it.quad === 'bw' || it.quad === 'gl') trackP6('outcomeBiasErrors'); fb.innerHTML = it.miss || 'Grade the process and the outcome separately.'; fb.className = 'tx-fb bad'; return; }
    trackP6('correctDecisions'); trackP6('processVsOutcomeAccuracy');
    qq.classList.add('is-on');
    fb.innerHTML = `<b>✦</b> ${it.why}`; fb.className = 'tx-fb good';
    i += 1; setTimeout(show, reduced() ? 0 : 1400);
  }));
  show();
}

/* ── p6_pause: dramatic pause ──────────────────────────────────────────── */
export function renderPause(el, slide, satisfy) {
  el.innerHTML = `<div class="lw-card p6-pause">${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}${(slide.lines || []).map((l, i) => `<div class="p6-pl" style="--d:${0.4 + i * 1.1}s">${l}</div>`).join('')}</div>`;
  const card = el.querySelector('.p6-pause');
  setTimeout(() => continueBtn(card, satisfy), reduced() ? 0 : 600 + (slide.lines || []).length * 1100);
}

/* ── p6_review: the end-of-lab Execution Review ────────────────────────── */
export function renderReview(el, slide, satisfy) {
  const r = executionReview();
  el.innerHTML = `<div class="lw-card p6-review">${head({ kicker: slide.kicker || 'Your execution review', title: slide.title || 'What you actually did' })}
    <div class="p6-rv-rows">${r.rows.map(([l, v]) => `<div class="p6-rv"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    <p class="p6-rv-note">Behavior in this practice, not a verdict on you. Nothing here is a profitability score.</p>
    ${r.review.length ? `<div class="sg-review-box"><div class="lw-eyebrow">What to review</div>${r.review.map((x) => `<p>${x.line}</p><a class="sg-review" href="${x.href}">${x.cta}</a>`).join('')}</div>`
      : '<div class="icc-principle">Your decisions followed the model. Waiting was your best skill today.</div>'}</div>`;
  continueBtn(el.querySelector('.p6-review'), satisfy);
}

/* ── p6_pnl_tease: the moment the entry executes (Section 16 teaser) ──── */
export function renderPnlTease(el, slide, satisfy) {
  const seq = slide.seq || ['+$5', '−$3', '+$12', '+$2', '−$8', '+$14'];
  el.innerHTML = `<div class="lw-card p6-pnl">
    <div class="p6-pnl-top"><span class="tx-st tx-st-ok">ENTRY EXECUTED ✓</span><span class="p6-pnl-live">LIVE P&amp;L <b>$0</b></span></div>
    <div class="p6-pnl-btns" aria-hidden="true"><span>MOVE STOP</span><span>TAKE PROFIT</span><span>CLOSE TRADE</span><i class="p6-cursor"></i></div>
    <div class="p6-pl" style="--d:${0.5 + seq.length * 0.6}s">${slide.line || 'GETTING INTO THE TRADE WAS ONLY THE BEGINNING. 😭'}</div>
    <div class="p6-pl" style="--d:${1.4 + seq.length * 0.6}s"><small>${slide.sub || 'NOW WHAT DO YOU DO WHILE MONEY IS MOVING?'}</small></div></div>`;
  const live = el.querySelector('.p6-pnl-live b');
  seq.forEach((v, i) => setTimeout(() => { if (live.isConnected) { live.textContent = v; live.className = v.startsWith('−') ? 'is-neg' : 'is-pos'; } }, reduced() ? 0 : 400 + i * 600));
  if (satisfy) setTimeout(() => continueBtn(el.querySelector('.p6-pnl'), satisfy), reduced() ? 0 : 1800 + seq.length * 600);
}

export const TRIGGER_RENDERERS = {
  p6_pnl_tease: renderPnlTease,
  trigger_sim: renderTriggerSim,
  p6_stack: renderStack,
  p6_backwards: renderBackwards,
  p6_preentry: renderPreEntry,
  p6_ladder: renderLadder,
  p6_sort: renderSort,
  p6_timing: renderTiming,
  p6_scrubber: renderScrubber,
  p6_matrix: renderMatrix,
  p6_pause: renderPause,
  p6_review: renderReview,
};

// A lab can open a fresh review session on its first level (sessionStart: 'name').
Object.keys(TRIGGER_RENDERERS).forEach((k) => {
  const r = TRIGGER_RENDERERS[k];
  TRIGGER_RENDERERS[k] = (el, slide, satisfy, helpers) => { if (slide.sessionStart) startSession(slide.sessionStart); return r(el, slide, satisfy, helpers); };
});
