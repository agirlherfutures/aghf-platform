/**
 * manage.js — A Girl & Her Futures™
 *
 * Phase 6 · Section 16 · Managing the Trade. Renderers:
 *
 *   manage_sim      the Trade Management Simulator: lock the plan, then candles
 *                   move while P&L stays deliberately small. At market events the
 *                   chart freezes: FOLLOW PLAN / MOVE STOP / TAKE PARTIAL / CLOSE /
 *                   MOVE TARGET (/ ADD). Touching a locked plan asks WHAT CHANGED?
 *                   and every touch is classified planned / rule-based / unplanned.
 *                   PRICE > PLAN > P&L, on screen and in the lesson.
 *   plan_card       the Pre-Trade Management Card: fill it, then LOCK PLAN →
 *   risk_ladder     entry, −30 SL, +60 TP and a contract slider: the stop never
 *                   moves, only the dollar exposure does
 *   position_stack  ■■■■ → □□■■: partials, runners, realized vs unrealized
 *   manage_compare  the same price path managed by a FIXED plan and a STRUCTURE plan
 *   pnl_blind       no chart, only +$186: should you exit? (money view vs process view)
 *   micromanage     the over-management replay: ORIGINAL PLAN vs WHAT YOU DID
 *   m_review        the end-of-lab Management Review
 *   account_tease   one trade → the account (Section 17 teaser)
 */

import { askQuestion } from './price-lab.js';
import { wrapGuide } from './guide.js';
import { mountExecChart, partialBar } from './icc-exec.js';
import { session } from './trigger-core.js';
import { makePlan, pnlAt, rMultiple, money, MA, MA_META, MEVENT, WHY_CHANGED, classifyTouch, trackManagement, managementReview } from './manage-core.js';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (p) => Number(p).toLocaleString('en-US');

function continueBtn(el, satisfy, label = 'Continue →') {
  if (!satisfy || el.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', () => { b.disabled = true; satisfy(); });
  el.appendChild(b);
}
function head(slide) {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Managing the Trade'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}`;
}
function principle(container, html) {
  if (!html) return;
  const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = html; container.appendChild(p);
}
function toast(card, html) {
  const t = document.createElement('div'); t.className = 'tx-gp'; t.innerHTML = html; card.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/** The locked management plan, read-only. */
export function planCardHtml(plan, { locked = true, title = 'Management plan' } = {}) {
  const rows = [
    ['Entry', fmt0(plan.entryPrice)], ['Stop', `${fmt0(plan.stopPrice)} <small>(${plan.stopDistancePoints} pts)</small>`],
    ['Target', `${fmt0(plan.targetPrice)} <small>(${plan.targetDistancePoints} pts)</small>`], ['Contracts', `${plan.contractCount} ${plan.instrument}`],
    ['Management', plan.managementModel === 'fixed' ? 'Fixed target' : plan.managementModel === 'structure' ? 'Structure-based' : 'Partial + runner'],
    ['Partials', plan.partialRules], ['Runner', plan.runnerRules], ['Break-even', plan.breakEvenRules],
    ['Structural', plan.structuralRules], ['Early intervention', plan.earlyInterventionRules],
  ];
  return `<div class="mg-plan${locked ? ' is-locked' : ''}"><div class="tx-h">${locked ? '🔒 ' : ''}${title}</div>
    ${rows.map(([k, v]) => `<div class="mg-row"><span>${k}</span><b>${v}</b></div>`).join('')}
    <div class="mg-row mg-risk"><span>Planned risk / reward</span><b>${money(-plan.plannedDollarRisk).replace('+', '')} / ${money(plan.plannedDollarReward)} <small>1:${plan.riskRewardRatio}</small></b></div></div>`;
}
function stackHtml(open, closed) {
  return `<div class="mg-stack" aria-label="${open} open, ${closed} closed">${'<i class="is-closed"></i>'.repeat(closed)}${'<i></i>'.repeat(open)}<small>${open} open${closed ? ` · ${closed} closed` : ''}</small></div>`;
}

/* ── manage_sim ────────────────────────────────────────────────────────── */
export function renderManageSim(el0, slide, satisfy, helpers = {}) {
  const runs = slide.sequence || [slide];
  let runIdx = 0;
  el0.innerHTML = `<div class="lw-card mg-card">${head(slide)}<div class="mg-host"></div><div class="pl-asks mg-out"></div></div>`;
  const card = el0.querySelector('.mg-card');
  const host = card.querySelector('.mg-host');
  const outEl = card.querySelector('.mg-out');
  const results = [];
  const startRun = () => runOne(runs[runIdx], (res) => {
    results.push(res);
    runIdx += 1;
    if (runIdx < runs.length) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tx-mini mg-again'; b.textContent = slide.againLabel || '↻ Run the same plan again';
      outEl.appendChild(b);
      const go = () => { b.remove(); startRun(); };
      if (slide.mode === 'watch') setTimeout(go, reduced() ? 0 : 1800); else b.addEventListener('click', go);
      return;
    }
    finish();
  });
  function finish() {
    const e = slide.end || {};
    const fin = () => { principle(outEl, e.card); continueBtn(card, satisfy, slide.cta || 'Continue →'); };
    if (e.ask) askQuestion(outEl, e.ask, helpers, fin); else fin();
  }

  function runOne(run, onDone) {
    const sc = { ...slide, ...run };
    const plan = makePlan(sc.plan);
    plan.locked = !sc.lock;
    const bars = sc.bars;
    const total = bars.length;
    const acts = sc.actions || [MA.FOLLOW, MA.MOVE_STOP, MA.PARTIAL, MA.CLOSE, MA.MOVE_TARGET];
    const long = plan.side === 'long';
    let hidePnl = !!sc.hidePnl;
    host.innerHTML = `<div class="mg-top">
        <span class="mg-side mg-${plan.side}">${long ? 'LONG' : 'SHORT'}</span>
        <span><i>Entry</i> ${fmt0(plan.entryPrice)}</span><span><i>Price</i> <b class="mg-px">·</b></span>
        <span><i>SL</i> <b class="mg-sl">${fmt0(plan.stopPrice)}</b></span><span><i>TP</i> <b class="mg-tp">${fmt0(plan.targetPrice)}</b></span>
        <span><i>Size</i> <b class="mg-size">${plan.contractCount} ${plan.instrument}</b></span>
        <span class="mg-pnl"><i>P&amp;L</i> <b>·</b></span>
        ${sc.pnlToggle ? '<label class="mg-hide"><input type="checkbox"> Hide P&amp;L</label>' : ''}
      </div>
      <div class="mg-grid">
        <div class="mg-left"><div class="ex-chart${sc.chartHidden ? ' mg-hidden-chart' : ''}"></div><div class="pl-caption" aria-live="polite"></div></div>
        <aside class="mg-side-col"><div class="mg-plan-host">${planCardHtml(plan, { locked: plan.locked })}</div><div class="mg-stack-host"></div></aside>
      </div>
      <div class="tx-decide" hidden></div>
      ${sc.mode === 'watch' ? '' : `<div class="tx-actions mg-actions">${acts.map((a) => `<button type="button" class="tx-act mg-act-${a}${a === MA.FOLLOW ? ' is-primary' : ''}" data-a="${a}">${(sc.labels || {})[a] || MA_META[a].label}</button>`).join('')}</div>`}
      <div class="pl-asks mg-asks"></div>`;
    const chartEl = host.querySelector('.ex-chart');
    const chart = mountExecChart(chartEl, { bars, total: sc.slots || total, pil: null, dir: long ? 'bullish' : 'bearish' });
    const cap = host.querySelector('.pl-caption'); wrapGuide(cap);
    const say = (h) => { if (!h) return; cap.innerHTML = h; cap.classList.add('show'); wrapGuide(cap); };
    const asks = host.querySelector('.mg-asks');
    const decideEl = host.querySelector('.tx-decide');
    const actionsEl = host.querySelector('.mg-actions');
    const pxEl = host.querySelector('.mg-px'), pnlEl = host.querySelector('.mg-pnl b'), slEl = host.querySelector('.mg-sl'), tpEl = host.querySelector('.mg-tp');
    const stackEl = host.querySelector('.mg-stack-host');
    const hideBox = host.querySelector('.mg-hide input');
    if (hideBox) { hideBox.checked = hidePnl; hideBox.addEventListener('change', () => { hidePnl = hideBox.checked; refresh(); }); }

    const entryAt = sc.entryAt ?? 0;
    let k = Math.min(entryAt + 1, total);
    let forming = null, timer = null, blocked = false, done = false;
    let open = plan.contractCount, closed = 0, realized = 0;
    let stop = plan.stopPrice, target = plan.targetPrice;
    const touches = { stopChanges: 0, targetChanges: 0, partials: 0, sizeChanges: 0, manualExit: false, unplanned: 0, ruleBased: 0, violations: [] };
    const fired = new Set();
    let pending = null;
    let exited = null, origHit = false;

    function lines() {
      chart.lines([
        { price: plan.entryPrice, label: `ENTRY ${fmt0(plan.entryPrice)}`, tone: 'ink', at: entryAt },
        { price: stop, label: `SL ${fmt0(stop)}`, tone: 'bad', at: entryAt },
        { price: target, label: `TP ${fmt0(target)}`, tone: 'ok', at: entryAt },
      ]);
    }
    function price() { return forming ? partialBar(bars[k], forming.f).c : bars[k - 1].c; }
    function refresh() {
      chart.draw(k, forming ? { bar: partialBar(bars[k], forming.f), label: forming.label } : null);
      const px = price();
      pxEl.textContent = fmt(px);
      const unreal = pnlAt(plan, px, open);
      pnlEl.textContent = hidePnl ? 'hidden' : money(realized + unreal);
      pnlEl.className = hidePnl ? 'is-hidden' : (realized + unreal >= 0 ? 'is-pos' : 'is-neg');
      slEl.textContent = fmt0(stop); tpEl.textContent = fmt0(target);
      host.querySelector('.mg-size').textContent = `${open} ${plan.instrument}`;
      stackEl.innerHTML = stackHtml(open, closed) + (closed ? `<div class="mg-rz"><span>Realized</span><b>${hidePnl ? '·' : money(realized)}</b><span>Unrealized</span><b>${hidePnl ? '·' : money(unreal)}</b></div>` : '');
    }

    function lockStep() {
      const box = document.createElement('div');
      box.className = 'mg-lockbox';
      box.innerHTML = `<div class="tx-q">${sc.lock.prompt || 'Check the numbers, then lock the plan.'}</div>`;
      asks.appendChild(box);
      const qs = sc.lock.asks || [];
      const lockBtn = () => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'lw-continue-btn mg-lock-btn'; b.textContent = 'LOCK PLAN 🔒';
        box.appendChild(b);
        b.addEventListener('click', () => {
          plan.locked = true; box.remove();
          host.querySelector('.mg-plan-host').innerHTML = planCardHtml(plan, { locked: true });
          host.querySelector('.mg-plan').classList.add('just-locked');
          say(sc.lock.after || '<b>Plan locked.</b> Now price moves. Your job: notice whether anything in the plan actually triggered.');
          play(900);
        });
      };
      const run = (j) => { if (j >= qs.length) { lockBtn(); return; } askQuestion(box, qs[j], helpers, () => run(j + 1)); };
      run(0);
    }

    function stopPlay() { clearTimeout(timer); timer = null; }
    function play(delay = 500) { if (done) return; timer = 1; setTimeout(() => { if (host.isConnected && timer && !done) next(); }, reduced() ? 0 : delay); }
    function next() {
      if (!card.isConnected) { stopPlay(); return; }
      if (blocked || forming || done) return;
      if (k >= total) { finishRun(null); return; }
      const dur = reduced() ? 100 : (sc.speed || 1000);
      const t0 = performance.now();
      const cp = (sc.checkpoints || []).find((c) => c.at === k && c.intrabar != null && !fired.has(c));
      forming = { f: 0, label: 'OPEN' };
      const tick = (now) => {
        if (!card.isConnected) { forming = null; stopPlay(); return; }
        forming.f = Math.max(0, Math.min(1, (now - t0) / dur));
        if (cp && forming.f >= cp.intrabar) { fired.add(cp); refresh(); stopPlay(); checkpoint(cp, () => { timer = 1; close(); }); return; }
        refresh();
        if (forming.f < 1) requestAnimationFrame(tick); else close();
      };
      requestAnimationFrame(tick);
    }
    function close() {
      forming = null; k += 1; refresh();
      const b = bars[k - 1];
      const hitStop = long ? b.l <= stop : b.h >= stop;
      const hitTarget = long ? b.h >= target : b.l <= target;
      if (open && (hitStop || hitTarget)) { exitAll(hitStop ? stop : target, hitStop ? MEVENT.STOP_REACHED : MEVENT.TARGET_REACHED); if (!exited) return; }
      // After an exit, keep printing (playAfterExit) to show what the ORIGINAL plan would have met.
      if (exited) {
        if (!origHit && (long ? b.h >= plan.targetPrice : b.l <= plan.targetPrice)) { origHit = true; chart.tag(k - 1, 'ORIGINAL TP', 'ok', 'above', 'orig-tp'); say(sc.origTpSay || 'Price reached the <b>original target</b>, without her.'); }
        if (k >= total || origHit) { finishRun(exited); return; }
        timer = setTimeout(next, reduced() ? 0 : 260); return;
      }
      const cp = (sc.checkpoints || []).find((c) => c.at === k - 1 && c.intrabar == null && !fired.has(c));
      if (cp) { fired.add(cp); stopPlay(); checkpoint(cp, () => play(450)); return; }
      if (k >= total) { finishRun(null); return; }
      if (timer) timer = setTimeout(next, reduced() ? 0 : 300);
    }

    function exitAll(px, ev) {
      realized += pnlAt(plan, px, open);
      closed += open; open = 0;
      refresh();
      const r = rMultiple(plan, realized);
      chart.tag(k - 1, ev === MEVENT.TARGET_REACHED ? 'TARGET' : ev === MEVENT.STOP_REACHED ? (stop === plan.stopPrice ? 'STOP' : 'STOPPED AT NEW SL') : 'CLOSED', ev === MEVENT.STOP_REACHED ? 'bad' : 'ok', 'auto', 'exit');
      if (sc.playAfterExit && k < total) { exited = { ev, r, pnl: realized }; actionsEl?.querySelectorAll('.tx-act').forEach((x) => { x.disabled = true; }); timer = 1; setTimeout(next, reduced() ? 0 : 500); return; }
      finishRun({ ev, r, pnl: realized });
    }
    function finishRun(res) {
      if (done) return;
      done = true; stopPlay();
      actionsEl?.querySelectorAll('.tx-act').forEach((b) => { b.disabled = true; });
      const adherence = touches.unplanned ? Math.max(0, Math.round(100 - touches.unplanned * (100 / Math.max(3, (sc.checkpoints || []).length)))) : 100;
      const box = document.createElement('div');
      box.className = 'mg-result';
      const evLine = !res ? 'Session over. Position still open.' : res.ev === MEVENT.TARGET_REACHED ? 'TARGET REACHED' : res.ev === MEVENT.STOP_REACHED ? 'STOP REACHED' : 'POSITION CLOSED';
      box.innerHTML = `<div class="mg-res-row ${touches.unplanned ? 'is-no' : 'is-ok'}"><span>Management</span><b>${touches.unplanned ? `PLAN CHANGED · ${touches.unplanned} unplanned touch${touches.unplanned > 1 ? 'es' : ''}` : 'PLAN FOLLOWED ✓'}</b></div>
        <div class="mg-res-row"><span>Outcome</span><b>${evLine}${res ? ` · ${res.r > 0 ? '+' : ''}${res.r}R` : ''}</b></div>
        <div class="mg-res-row"><span>Management score</span><b>${adherence}%</b></div>`;
      asks.appendChild(box);
      const fin = () => onDone({ ...res, adherence, touches });
      if (sc.afterResult) askQuestion(asks, sc.afterResult, wrapH(), fin); else fin();
    }

    function checkpoint(cp, then) {
      if (cp.text) say(cp.text);
      if (sc.mode === 'watch') {
        if (cp.unplanned) { touches.unplanned += 1; touches.violations.push(MA_META[cp.expect]?.label); }
        if (cp.expect && cp.expect !== MA.FOLLOW) applyAction(cp.expect, cp);
        blocked = true;
        setTimeout(() => { blocked = false; then(); }, reduced() ? 0 : (cp.hold || 1500));
        return;
      }
      if (cp.kind === 'ask') {
        blocked = true;
        if (cp.hideChart) chartEl.classList.add('mg-hidden-chart');
        askQuestion(asks, cp.ask, wrapH(), () => { blocked = false; chartEl.classList.remove('mg-hidden-chart'); if (cp.after) say(cp.after); then(); });
        return;
      }
      blocked = true;
      decideEl.hidden = false;
      decideEl.innerHTML = `<div class="tx-q">${cp.prompt || 'Does what price just did require you to do anything?'}</div>${cp.event && cp.event !== MEVENT.NO_ACTION_REQUIRED ? `<div class="mg-event">◆ ${cp.eventText || 'A condition in your plan just triggered.'}</div>` : ''}`;
      actionsEl?.classList.add('is-live');
      if (cp.tempt) actionsEl?.querySelector(`[data-a="${cp.tempt.action || cp.tempt}"]`)?.classList.add('is-tempt');
      if (cp.temptLabel) { const b = actionsEl?.querySelector(`[data-a="${cp.tempt?.action || cp.tempt}"]`); if (b) { b.dataset.orig = b.textContent; b.textContent = cp.temptLabel; } }
      (actionsEl || decideEl).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
      pending = { cp, then };
    }
    function clearTempt() {
      actionsEl?.querySelectorAll('.tx-act').forEach((b) => { b.classList.remove('is-tempt'); if (b.dataset.orig) { b.textContent = b.dataset.orig; delete b.dataset.orig; } });
    }
    function applyAction(a, cp) {
      if (a === MA.MOVE_STOP) { stop = cp.stopTo ?? plan.entryPrice; touches.stopChanges += 1; lines(); chart.tag(k - 1, 'SL MOVED', 'muted', long ? 'below' : 'above', `sl-${k}`); }
      if (a === MA.MOVE_TARGET) { target = cp.targetTo ?? target + (long ? 20 : -20); touches.targetChanges += 1; lines(); }
      if (a === MA.PARTIAL) { const q = Math.min(open, cp.qty || Math.floor(open / 2)); realized += pnlAt(plan, price(), q); open -= q; closed += q; touches.partials += 1; }
      if (a === MA.ADD) { open += 1; touches.sizeChanges += 1; }
      if (a === MA.CLOSE) { touches.manualExit = true; refresh(); exitAll(price(), MEVENT.TRADE_CLOSED); return; }
      refresh();
    }
    function decide(a) {
      if (!pending) return;
      const { cp, then } = pending;
      const expect = cp.expect || MA.FOLLOW;
      const ok = a === expect;
      const cls = classifyTouch(a, ok ? cp.event : MEVENT.NO_ACTION_REQUIRED);
      helpers.onPick?.({ prompt: `${slide.title || 'manage'}:${cp.at}` }, { label: MA_META[a].label }, ok);
      helpers.handleStreak?.(ok);
      if (ok) {
        trackManagement(a, a === MA.FOLLOW ? 'none' : 'rule-based');
        pending = null; clearTempt();
        actionsEl?.classList.remove('is-live'); decideEl.hidden = true;
        if (a === MA.FOLLOW) toast(card, cp.gp || '<b>+5</b> DISCIPLINE GP'); else { touches.ruleBased += 1; toast(card, '<b>RULE-BASED</b> ✓'); }
        say(cp.after || (a === MA.FOLLOW ? 'Nothing in the plan triggered. Nothing to do.' : 'The plan said so. Rule-based management.'));
        blocked = false;
        if (a !== MA.FOLLOW) applyAction(a, cp);
        if (done) return;
        if (cp.goal) { finishRun(null); return; }
        then();
        return;
      }
      // touching the locked plan without a trigger: WHAT CHANGED?
      actionsEl?.querySelectorAll('.tx-act').forEach((b) => { b.disabled = true; });
      const q = {
        prompt: `You’re about to ${MA_META[a].label.toLowerCase()}. WHAT CHANGED?`,
        options: WHY_CHANGED.map((w) => ({
          label: w.label, correct: true,
          why: w.key === 'emotion' ? '<b>Honest.</b> That would be an UNPLANNED change, driven by P&amp;L. Back to the plan.'
            : (w.key === 'predefined' || w.key === 'structure') && cp.event === MEVENT.NO_ACTION_REQUIRED ? `Look at the plan card: nothing in it triggered here. ${cp.whyNot || 'The market moved; the plan didn’t change.'}`
              : expect !== MA.FOLLOW ? `Close. The plan says: <b>${MA_META[expect].label}</b>.` : 'If it isn’t in the plan, it’s unplanned. Back to the plan.',
        })),
      };
      askQuestion(asks, q, { ...helpers, onPick(qq, o, c, w) { const key = WHY_CHANGED.find((x) => x.label === o.label)?.key; trackManagement(a, 'unplanned', key); touches.unplanned += 1; touches.violations.push(MA_META[a].label); helpers.onPick?.(qq, o, c, w); } }, () => {
        setTimeout(() => { asks.querySelectorAll('.pl-ask').forEach((x) => x.remove()); actionsEl?.querySelectorAll('.tx-act').forEach((b) => { b.disabled = false; }); }, reduced() ? 0 : 1600);
      });
      void cls;
    }
    function wrapH() {
      return { ...helpers, onPick(q, o, c, w) { helpers.onPick?.(q, o, c, w); if (!c && o.bias) import('./trigger-core.js').then((m) => m.trackP6('outcomeBiasErrors')); } };
    }
    actionsEl?.addEventListener('click', (e) => { const b = e.target.closest('.tx-act'); if (b && !b.disabled) decide(b.dataset.a); });

    lines(); refresh();
    if (sc.intro) say(sc.intro);
    if (sc.lock) lockStep(); else play(sc.mode === 'watch' ? 1000 : 1300);
  }
  startRun();
}

/* ── plan_card: fill it, then lock it ──────────────────────────────────── */
export function renderPlanCard(el, slide, satisfy, helpers = {}) {
  const plan = makePlan(slide.plan);
  const choices = slide.choices || [];
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="mg-pc"><div class="mg-pc-l"></div><div class="mg-pc-r"></div></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const left = card.querySelector('.mg-pc-l'), right = card.querySelector('.mg-pc-r');
  const asks = card.querySelector('.pl-asks');
  const render = (locked) => { right.innerHTML = planCardHtml(plan, { locked, title: locked ? 'Locked plan' : 'Pre-trade management card' }); };
  render(false);
  let i = 0;
  const nextChoice = () => {
    if (i >= choices.length) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'lw-continue-btn mg-lock-btn'; b.textContent = 'LOCK PLAN 🔒';
      left.appendChild(b);
      b.addEventListener('click', () => {
        b.remove(); render(true); right.querySelector('.mg-plan').classList.add('just-locked');
        principle(asks, slide.punch || 'YOUR CALMEST DECISIONS SHOULD HAPPEN BEFORE MONEY STARTS MOVING.');
        const fin = () => continueBtn(card, satisfy);
        if (slide.ask) askQuestion(asks, slide.ask, helpers, fin); else fin();
      });
      return;
    }
    const c = choices[i];
    askQuestion(left, { prompt: c.prompt, options: c.options, stack: true }, helpers, (o) => {
      plan[c.field] = o.value || o.label; render(false); i += 1; nextChoice();
    });
  };
  nextChoice();
}

/* ── risk_ladder: the stop never moves, the dollars do ─────────────────── */
export function renderRiskLadder(el, slide, satisfy, helpers = {}) {
  const base = slide.plan || { entryPrice: 20000, stopPrice: 19970, targetPrice: 20060, contractCount: 4 };
  let n = base.contractCount || 4;
  const max = slide.max || 8;
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="mg-ladder">
      <div class="mg-lad-vis">
        <div class="mg-lad-row tp"><b>TP</b><span>+${Math.abs(base.targetPrice - base.entryPrice)} pts</span><em class="mg-lad-rw"></em></div>
        <div class="mg-lad-row en"><b>ENTRY</b><span>${fmt0(base.entryPrice)}</span><em></em></div>
        <div class="mg-lad-row sl"><b>SL</b><span>−${Math.abs(base.entryPrice - base.stopPrice)} pts</span><em class="mg-lad-rk"></em></div>
      </div>
      <div class="mg-lad-ctl"><div class="tx-h">Contracts (MNQ · $2 / point)</div>
        <div class="mg-lad-btns">${Array.from({ length: max }, (_, i) => `<button type="button" class="tx-mini" data-n="${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="mg-lad-sum"></div></div>
    </div>
    ${slide.note ? `<p class="mg-note">${slide.note}</p>` : ''}<div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const set = (v) => {
    n = v;
    const plan = makePlan({ ...base, contractCount: n });
    card.querySelectorAll('[data-n]').forEach((b) => b.classList.toggle('ok', +b.dataset.n === n));
    card.querySelector('.mg-lad-rk').textContent = `−$${plan.plannedDollarRisk} · −1R`;
    card.querySelector('.mg-lad-rw').textContent = `+$${plan.plannedDollarReward} · +${plan.riskRewardRatio}R`;
    card.querySelector('.mg-lad-sum').innerHTML = `${plan.stopDistancePoints} pts × $2 × ${n} = <b>$${plan.plannedDollarRisk}</b> planned price risk<br>${plan.targetDistancePoints} pts × $2 × ${n} = <b>$${plan.plannedDollarReward}</b> planned gross reward<small>Before fees and slippage.</small>`;
    card.querySelector('.mg-lad-vis').classList.remove('pulse'); void card.offsetWidth; card.querySelector('.mg-lad-vis').classList.add('pulse');
  };
  card.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => set(+b.dataset.n)));
  set(n);
  const asks = card.querySelector('.pl-asks');
  const qs = slide.asks || [];
  const run = (j) => {
    if (j >= qs.length) { principle(asks, slide.punch); continueBtn(card, satisfy); return; }
    if (qs[j].setContracts) set(qs[j].setContracts);
    askQuestion(asks, qs[j], helpers, () => { if (qs[j].thenContracts) set(qs[j].thenContracts); run(j + 1); });
  };
  run(0);
}

/* ── position_stack: partials and runners ──────────────────────────────── */
export function renderPositionStack(el, slide, satisfy, helpers = {}) {
  const ppt = 2;
  const total = slide.contracts || 4;
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="mg-ps"><div class="mg-ps-stack"></div><div class="mg-rz"></div></div>
    <div class="mg-ps-plans">${(slide.plans || []).map((p, i) => `<div class="mg-ps-plan" data-i="${i}"><b>${p.name}</b><small>${p.line}</small><div class="mg-ps-math"></div></div>`).join('')}</div>
    <div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const st = card.querySelector('.mg-ps-stack');
  const rz = card.querySelector('.mg-rz');
  st.innerHTML = stackHtml(total, 0);
  rz.innerHTML = '<span>Realized</span><b>$0</b><span>Unrealized (at +25 pts)</span><b>+$200</b>';
  setTimeout(() => {
    if (!card.isConnected) return;
    st.innerHTML = stackHtml(total / 2, total / 2);
    rz.innerHTML = `<span>Realized (2 closed at +25)</span><b>+$${25 * ppt * 2}</b><span>Unrealized (2 still open)</span><b>moves with price</b>`;
  }, reduced() ? 0 : 1600);
  (slide.plans || []).forEach((p, i) => {
    card.querySelector(`.mg-ps-plan[data-i="${i}"] .mg-ps-math`).innerHTML = p.legs.map((l) => `${l.n} × ${l.pts} pts × $2 = <b>${money(l.n * l.pts * ppt)}</b>`).join('<br>') + `<div class="mg-ps-tot">Total: <b>${money(p.legs.reduce((a, l) => a + l.n * l.pts * ppt, 0))}</b></div>`;
  });
  const asks = card.querySelector('.pl-asks');
  const qs = slide.asks || [];
  const run = (j) => { if (j >= qs.length) { principle(asks, slide.punch); continueBtn(card, satisfy); return; } askQuestion(asks, qs[j], helpers, () => run(j + 1)); };
  setTimeout(() => run(0), reduced() ? 0 : 1800);
}

/* ── manage_compare: same trade, two plans ─────────────────────────────── */
export function renderManageCompare(el, slide, satisfy, helpers = {}) {
  const tabs = slide.tabs; // [{ name, plan, events: [{ at, text }], result }]
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="mg-tabs" role="tablist">${tabs.map((t, i) => `<button type="button" class="mg-tab${i ? '' : ' on'}" data-i="${i}">${t.name}</button>`).join('')}</div>
    <div class="mg-cmp"><div class="ex-chart"></div><aside class="mg-cmp-side"></aside></div>
    <div class="mg-cmp-log"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const chart = mountExecChart(card.querySelector('.ex-chart'), { bars: slide.bars, pil: null, dir: 'bullish' });
  const seen = new Set();
  const show = (i) => {
    const t = tabs[i];
    const plan = makePlan(t.plan);
    card.querySelectorAll('.mg-tab').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
    card.querySelector('.mg-cmp-side').innerHTML = planCardHtml(plan, { title: t.name });
    chart.clearTags();
    chart.lines([{ price: plan.entryPrice, label: 'ENTRY', tone: 'ink', at: slide.entryAt }, ...(t.stops || [plan.stopPrice]).map((s, j) => ({ price: s, label: j ? `SL → ${fmt0(s)}` : `SL ${fmt0(s)}`, tone: 'bad', at: j ? t.events[j - 1]?.at : slide.entryAt })), { price: plan.targetPrice, label: 'TP', tone: 'ok', at: slide.entryAt }]);
    chart.draw(slide.bars.length);
    t.events.forEach((e) => chart.tag(e.at, e.tag || '◆', 'gold', 'below', `e${e.at}`));
    card.querySelector('.mg-cmp-log').innerHTML = t.events.map((e) => `<div class="mg-log"><b>${e.tag || '◆'}</b>${e.text}</div>`).join('') + `<div class="mg-log mg-log-res"><b>=</b>${t.result}</div>`;
    seen.add(i);
    if (seen.size === tabs.length && !card.querySelector('.pl-asks .pl-ask')) {
      askQuestion(card.querySelector('.pl-asks'), slide.ask, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy); });
    }
  };
  card.querySelectorAll('.mg-tab').forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
  show(0);
}

/* ── pnl_blind: only the number ────────────────────────────────────────── */
export function renderPnlBlind(el, slide, satisfy, helpers = {}) {
  const shots = slide.shots || ['+$186', '−$80'];
  el.innerHTML = `<div class="lw-card mg-blind"><div class="mg-blind-n"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.mg-blind');
  const n = card.querySelector('.mg-blind-n');
  const asks = card.querySelector('.pl-asks');
  const q = () => ({ prompt: 'SHOULD YOU EXIT?', options: [
    { label: 'Yes', feedback: 'From a number? You can’t see price, structure, the plan or the target.' },
    { label: 'No', feedback: 'Also a guess. You can’t see anything that would justify either.' },
    { label: 'Not enough information', correct: true, nei: true, why: 'P&L is a financial result at this moment. It isn’t structure, target, invalidation or your rules.' },
  ] });
  const step = (i) => {
    if (i >= shots.length) { reveal(); return; }
    n.textContent = shots[i]; n.className = `mg-blind-n ${shots[i].startsWith('−') ? 'is-neg' : 'is-pos'}`;
    askQuestion(asks, q(), helpers, () => setTimeout(() => { asks.innerHTML = ''; step(i + 1); }, reduced() ? 0 : 1100));
  };
  const reveal = () => {
    card.classList.add('is-open');
    n.innerHTML = '<div class="mg-bub"><b>+$100</b><span>“DON’T LOSE IT!”</span></div><div class="mg-bub neg"><b>−$100</b><span>“IT’LL COME BACK!”</span></div>';
    asks.innerHTML = `<div class="mg-notice">NOTICE SOMETHING? 😂<small>She wants green to stop moving and red to keep moving.</small></div>
      <div class="mg-views"><div class="mg-view mg-view-money"><div class="tx-h">View A · Money view</div><div class="mg-vm-n">+$184</div><div class="mg-vm-c"></div><small>Chart tiny. Plan hidden.</small></div>
      <div class="mg-view mg-view-process"><div class="tx-h">View B · Process view</div><div class="mg-vp-c"></div><div class="mg-vp-plan">SL 19,970 · TP 20,060 · fixed · no partials</div><small>P&amp;L +$184</small></div></div>`;
    askQuestion(asks, slide.ask || { prompt: 'WHICH INTERFACE BETTER SUPPORTS RULE-BASED MANAGEMENT?', options: [
      { label: 'View A: money view', feedback: 'The number is the loudest thing on screen. That’s what you’ll manage.' },
      { label: 'View B: process view', correct: true, why: 'Price > plan > P&L. That order is the lesson.' }] }, helpers, () => {
      principle(asks, slide.punch || 'P&L IS AN OUTCOME DISPLAY. IT IS NOT MARKET STRUCTURE.');
      continueBtn(card, satisfy);
    });
  };
  step(0);
}

/* ── micromanage: original plan vs what you did ────────────────────────── */
export function renderMicromanage(el, slide, satisfy, helpers = {}) {
  const steps = slide.steps; // [{ pnl, prompt, button }]
  const did = { 'Stop moves': 0, 'Target moves': 0, Partials: 0, 'Contracts added': 0, 'Manual closes': 0 };
  const map = { 'MOVE STOP!': 'Stop moves', 'MOVE TARGET?': 'Target moves', 'TAKE PARTIAL?': 'Partials', 'ADD CONTRACT?': 'Contracts added', 'CLOSE?': 'Manual closes' };
  let i = 0;
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="mg-mm"><div class="mg-mm-pnl"></div><div class="mg-mm-q"></div></div><div class="mg-mm-out"></div></div>`;
  const card = el.querySelector('.lw-card');
  const pnl = card.querySelector('.mg-mm-pnl'), qEl = card.querySelector('.mg-mm-q'), out = card.querySelector('.mg-mm-out');
  const show = () => {
    if (i >= steps.length) { compare(); return; }
    const s = steps[i];
    pnl.textContent = s.pnl; pnl.className = `mg-mm-pnl ${s.pnl.startsWith('−') || s.pnl.startsWith('-') ? 'is-neg' : 'is-pos'}`;
    qEl.innerHTML = `<div class="tx-q">${s.prompt || 'Price moved.'}</div><div class="tx-err-btns"><button type="button" class="tx-act is-tempt" data-x="touch">${s.button}</button><button type="button" class="tx-act" data-x="leave">Leave it</button></div>`;
    qEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.x === 'touch') did[map[s.button] || 'Stop moves'] += 1;
      helpers.handleStreak?.(b.dataset.x === 'leave');
      i += 1; show();
    }));
  };
  const compare = () => {
    const mine = Object.values(did).reduce((a, b) => a + b, 0);
    const actual = mine >= 2 ? did : slide.scripted;
    qEl.innerHTML = '';
    out.innerHTML = `${mine >= 2 ? '' : `<p class="mg-note">You barely touched it. 👏 Here’s what a micromanaging trader did with the same plan:</p>`}
      <div class="mg-cmp2"><div><div class="tx-h">Original plan</div><div class="mg-row"><span>SL</span><b>−30</b></div><div class="mg-row"><span>TP</span><b>+60</b></div><div class="mg-row"><span>Size</span><b>4 MNQ</b></div><div class="mg-row"><span>Management</span><b>Fixed</b></div></div>
      <div><div class="tx-h">What ${mine >= 2 ? 'you' : 'she'} actually did</div>${Object.entries(actual).map(([k, v]) => `<div class="mg-row ${v ? 'is-no' : ''}"><span>${k}</span><b>${v}</b></div>`).join('')}</div></div>
      <div class="mg-girl">GIRL. WHAT PLAN ARE WE TRADING NOW? 😭</div>`;
    principle(out, slide.punch || 'ACTIVITY IS NOT THE SAME AS MANAGEMENT.');
    continueBtn(card, satisfy);
  };
  show();
}

/* ── m_review ──────────────────────────────────────────────────────────── */
export function renderMReview(el, slide, satisfy) {
  const r = managementReview(session() || {});
  el.innerHTML = `<div class="lw-card p6-review">${head({ kicker: 'Your management review', title: slide.title || 'How you managed' })}
    <div class="p6-rv-rows">${r.rows.map(([l, v]) => `<div class="p6-rv"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    <div class="mg-pass ${r.passed ? 'is-ok' : 'is-no'}">${r.passed ? 'MANAGEMENT PASSED ✓' : 'REVIEW YOUR MANAGEMENT TOUCHES'}</div>
    <p class="p6-rv-note">Graded on the plan, never on P&amp;L. A losing trade can score 100%.</p>
    ${r.review.length ? `<div class="sg-review-box"><div class="lw-eyebrow">What to review</div>${r.review.map((x) => `<p>${x.line}</p><a class="sg-review" href="${x.href}">${x.cta}</a>`).join('')}</div>` : ''}</div>`;
  continueBtn(el.querySelector('.p6-review'), satisfy);
}

/* ── account_tease: one trade → the account ────────────────────────────── */
export function renderAccountTease(el, slide, satisfy) {
  const trades = slide.trades || [['W', '+$480'], ['L', '−$240'], ['L', '−$240'], ['W', '+$480'], ['L', '−$240']];
  el.innerHTML = `<div class="lw-card p6-pnl"><div class="tx-h" style="color:#CDB9A8">Account</div>
    <div class="mg-acct">${trades.map(([w, v], i) => `<span class="mg-tr ${w === 'W' ? 'is-w' : 'is-l'}" style="--d:${0.3 + i * 0.45}s"><b>Trade ${i + 1}</b>${v}</span>`).join('')}</div>
    <div class="p6-pl" style="--d:${0.6 + trades.length * 0.45}s">ONE TRADE ISN’T THE GAME.</div>
    <div class="p6-pl" style="--d:${1.5 + trades.length * 0.45}s"><small>HOW MUCH ARE YOU ACTUALLY ALLOWED TO LOSE?</small></div></div>`;
  if (satisfy) setTimeout(() => continueBtn(el.querySelector('.p6-pnl'), satisfy), reduced() ? 0 : 2400 + trades.length * 450);
}

export const MANAGE_RENDERERS = {
  manage_sim: renderManageSim,
  plan_card: renderPlanCard,
  risk_ladder: renderRiskLadder,
  position_stack: renderPositionStack,
  manage_compare: renderManageCompare,
  pnl_blind: renderPnlBlind,
  micromanage: renderMicromanage,
  m_review: renderMReview,
  account_tease: renderAccountTease,
};

// A lab can open a fresh review session on its first level (sessionStart: 'name').
import { startSession } from './trigger-core.js';
Object.keys(MANAGE_RENDERERS).forEach((key) => {
  const r = MANAGE_RENDERERS[key];
  MANAGE_RENDERERS[key] = (el, slide, satisfy, helpers) => { if (slide.sessionStart) startSession(slide.sessionStart); return r(el, slide, satisfy, helpers); };
});
