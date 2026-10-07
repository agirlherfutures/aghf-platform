/**
 * risk.js — A Girl & Her Futures™
 *
 * Phase 6 · Section 17 · Protecting Your Account, plus the Phase 6 capstone.
 *
 *   size_fit        drop contract blocks into a risk cap; the one that doesn't fit, doesn't
 *   r_normalizer    different dollars, same R
 *   expectancy      win rate is not the whole edge
 *   daily_stop      −1R, −1R, then a beautiful setup… DONE. Session locked → learn mode
 *   frequency       risk per trade × number of trades
 *   drawdown        peak, current, the bracket; losing streaks at different risk sizes
 *   account_compare same chart, different account
 *   risk_profile    MY AGHF RISK FRAMEWORK → saved RiskProfile
 *   size_table      the Risk Lab boss: every size option with its consequences
 *   r_review        the Risk Control Review
 *   session_sim     the TradingSessionSimulator: pre-trade → entry → management →
 *                   account control, one whole session (Phase 6 Final)
 */

import { askQuestion } from './price-lab.js';
import { mountChart } from './structure-charts.js';
import { mountExecChart } from './icc-exec.js';
import { session, startSession } from './trigger-core.js';
import { renderTriggerSim } from './trigger.js';
import { renderManageSim } from './manage.js';
import {
  priceRisk, riskPerContract, maxContracts, rOf, expectancy, drawdown, equityPath, dailyTracker,
  PROFILE_FIELDS, loadRiskProfile, saveRiskProfile, trackRisk, riskReview,
} from './risk-core.js';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const usd = (v) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;

function continueBtn(el, satisfy, label = 'Continue →') {
  if (!satisfy || el.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', () => { b.disabled = true; satisfy(); });
  el.appendChild(b);
}
function head(slide) {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Protecting Your Account'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}`;
}
function principle(container, html) { if (!html) return; const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = html; container.appendChild(p); }
// Ask a list of questions in order, tagging each with a risk skill for the review.
function runAsks(container, qs, helpers, done) {
  const run = (j) => {
    if (j >= qs.length) { done(); return; }
    const q = qs[j];
    askQuestion(container, q, { ...helpers, onPick(qq, o, c, w) { helpers.onPick?.(qq, o, c, w); if (q.skill && w === 0) trackRisk(q.skill, c); if (q.skill && helpers.report && w === 0) helpers.report(q.cat || 'risk', c); } }, () => run(j + 1));
  };
  run(0);
}

/* ── size_fit ──────────────────────────────────────────────────────────── */
export function renderSizeFit(el, slide, satisfy, helpers = {}) {
  const steps = slide.steps; // [{ cap, stop, pv, ask }]
  let si = 0;
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="rk-fit"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const host = card.querySelector('.rk-fit');
  const asks = card.querySelector('.pl-asks');
  function show() {
    if (si >= steps.length) { principle(asks, slide.punch); continueBtn(card, satisfy); return; }
    const s = steps[si];
    const pv = s.pv || 2, one = riskPerContract(s.stop, pv), fit = maxContracts(s.cap, s.stop, pv);
    let n = 0;
    host.innerHTML = `<div class="rk-fit-head"><span><i>Risk cap</i> <b>${usd(s.cap)}</b></span><span><i>Stop</i> <b>${s.stop} pts</b></span><span><i>One ${s.inst || 'MNQ'}</i> <b>${s.stop} × $${pv} = ${usd(one)}</b></span></div>
      <div class="rk-box"><div class="rk-box-fill"></div><div class="rk-box-cap">${usd(s.cap)} MAX RISK</div><div class="rk-blocks"></div></div>
      <div class="rk-fit-ctl"><button type="button" class="tx-mini rk-add">+ Add a contract (${usd(one)})</button><span class="rk-used">0 contracts · $0</span></div><div class="tx-fb"></div>`;
    const blocks = host.querySelector('.rk-blocks'), fill = host.querySelector('.rk-box-fill'), used = host.querySelector('.rk-used'), fb = host.querySelector('.tx-fb'), add = host.querySelector('.rk-add');
    const ask = () => {
      add.disabled = true;
      askQuestion(asks, s.ask || { prompt: 'Maximum whole contracts within the cap?', options: [fit - 1, fit, fit + 1].filter((x) => x >= 0).map((x) => ({ label: String(x), correct: x === fit, why: fit ? `${fit} × ${usd(one)} = ${usd(fit * one)}. One more would be ${usd((fit + 1) * one)}: over the cap.` : 'None. The trade doesn’t fit this risk plan at this stop distance.', feedback: x > fit ? 'That’s over the cap. Floor it.' : 'More fit than that.' })) },
        { ...helpers, onPick(q, o, c, w) { helpers.onPick?.(q, o, c, w); if (w === 0) trackRisk('sizing', c); } }, () => { si += 1; setTimeout(() => { asks.innerHTML = ''; show(); }, reduced() ? 0 : 1400); });
    };
    if (fit === 0) {
      fb.innerHTML = `<b>THIS TRADE DOES NOT FIT THIS RISK PLAN AT THIS STOP DISTANCE.</b> That’s a valid result. The stop doesn’t shrink to make it fit.`;
      fb.className = 'tx-fb bad'; add.disabled = true;
      setTimeout(ask, reduced() ? 0 : 900);
      return;
    }
    add.addEventListener('click', () => {
      if ((n + 1) * one > s.cap) {
        host.querySelector('.rk-box').classList.remove('rk-over'); void host.offsetWidth; host.querySelector('.rk-box').classList.add('rk-over');
        fb.innerHTML = `<b>EXCEEDS RISK LIMIT.</b> ${n + 1} × ${usd(one)} = ${usd((n + 1) * one)}.`; fb.className = 'tx-fb bad';
        ask(); return;
      }
      n += 1;
      const b = document.createElement('i'); b.textContent = `+${usd(one)}`; blocks.appendChild(b);
      fill.style.height = `${(n * one / s.cap) * 100}%`;
      used.textContent = `${n} contract${n > 1 ? 's' : ''} · ${usd(n * one)}`;
    });
  }
  show();
}

/* ── r_normalizer ──────────────────────────────────────────────────────── */
export function renderRNormalizer(el, slide, satisfy, helpers = {}) {
  const tr = slide.traders || [{ name: 'Trader A', risk: 50, result: 100 }, { name: 'Trader B', risk: 250, result: 500 }];
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="rk-rn">${tr.map((t) => `<div class="rk-rn-c"><b>${t.name}</b><span class="rk-rn-d">Risk ${usd(t.risk)} · Result ${usd(t.result)}</span><span class="rk-rn-r">${rOf(t.result, t.risk) > 0 ? '+' : ''}${rOf(t.result, t.risk)}R</span></div>`).join('')}</div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  setTimeout(() => card.querySelector('.rk-rn')?.classList.add('is-norm'), reduced() ? 0 : 1300);
  runAsks(card.querySelector('.pl-asks'), slide.asks || [], helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy); });
}

/* ── expectancy ────────────────────────────────────────────────────────── */
export function renderExpectancy(el, slide, satisfy, helpers = {}) {
  const st = { w: slide.winRate ?? 0.4, aw: slide.avgWin ?? 2, al: slide.avgLoss ?? 1 };
  el.innerHTML = `<div class="lw-card">${head(slide)}
    <div class="rk-ladders"><div class="rk-lad"><b>1:1</b><span class="rk-l-rw" style="--h:30%">+1R · 30 pts</span><span class="rk-l-rk" style="--h:30%">−1R · 30 pts</span></div>
      <div class="rk-lad"><b>1:2</b><span class="rk-l-rw" style="--h:60%">+2R · 60 pts</span><span class="rk-l-rk" style="--h:30%">−1R · 30 pts</span></div></div>
    <div class="rk-exp">
      <label>Win rate <input type="range" min="10" max="90" step="5" value="${st.w * 100}" data-k="w"><b class="rk-w"></b></label>
      <label>Average win <input type="range" min="0.5" max="4" step="0.5" value="${st.aw}" data-k="aw"><b class="rk-aw"></b></label>
      <label>Average loss <input type="range" min="0.5" max="2" step="0.5" value="${st.al}" data-k="al"><b class="rk-al"></b></label>
      <div class="rk-exp-out"></div></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const out = card.querySelector('.rk-exp-out');
  const draw = () => {
    const e = expectancy(st.w, st.aw, st.al);
    card.querySelector('.rk-w').textContent = `${Math.round(st.w * 100)}%`; card.querySelector('.rk-aw').textContent = `+${st.aw}R`; card.querySelector('.rk-al').textContent = `−${st.al}R`;
    out.innerHTML = `${st.w.toFixed(2)} × ${st.aw} − ${(1 - st.w).toFixed(2)} × ${st.al} = <b class="${e >= 0 ? 'is-pos' : 'is-neg'}">${e >= 0 ? '+' : ''}${e}R per trade</b><small>Theoretical, over a large sample, IF these assumptions actually hold, before trading costs.</small>`;
  };
  card.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => { st[i.dataset.k] = i.dataset.k === 'w' ? +i.value / 100 : +i.value; draw(); }));
  draw();
  runAsks(card.querySelector('.pl-asks'), slide.asks || [], helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy); });
}

/* ── daily_stop ────────────────────────────────────────────────────────── */
export function renderDailyStop(el, slide, satisfy, helpers = {}) {
  const limitR = slide.limitR ?? 2;
  el.innerHTML = `<div class="lw-card rk-day">${head(slide)}
    <div class="rk-day-grid"><div class="rk-trades"></div>
      <div class="rk-dcard"><div class="tx-h">Daily risk card</div><div class="mg-row"><span>Max loss</span><b>−${limitR}R</b></div><div class="mg-row"><span>Today</span><b class="rk-today">0R</b></div><div class="mg-row"><span>Remaining</span><b class="rk-rem">${limitR}R</b></div><div class="rk-lock"></div></div></div>
    <div class="rk-setup" hidden><div class="tx-h">A new setup ✨</div><div class="ex-chart"></div><div class="rk-setup-tags"><span>4H ✓</span><span>1H ✓</span><span>PIL ✓</span><span>I · C · C ✓</span><span>Perfect retest ✓</span></div>
      <div class="rk-setup-btns"><button type="button" class="tx-act rk-take" disabled>TAKE TRADE</button><a class="tx-mini" href="journal.html">Review</a><a class="tx-mini" href="journal.html">Journal</a><a class="tx-mini" href="games.html">Replay</a><a class="tx-mini" href="lessons.html">Study</a></div></div>
    <div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const trades = card.querySelector('.rk-trades');
  const asks = card.querySelector('.pl-asks');
  let r = 0;
  const addTrade = (i, v, txt) => { r += v; trades.insertAdjacentHTML('beforeend', `<div class="rk-trade ${v < 0 ? 'is-l' : 'is-w'}"><b>Trade ${i}</b>${v > 0 ? '+' : ''}${v}R <small>${txt || ''}</small></div>`); card.querySelector('.rk-today').textContent = `${r}R`; card.querySelector('.rk-rem').textContent = `${Math.max(0, limitR + r)}R`; };
  setTimeout(() => addTrade(1, -1, 'valid setup, stopped'), reduced() ? 0 : 500);
  setTimeout(() => {
    addTrade(2, -1, 'valid setup, stopped');
    card.querySelector('.rk-lock').innerHTML = '🔒 SESSION LOCKED<small>Trading is off. Review, journal, replay and study are still on.</small>';
    card.querySelector('.rk-dcard').classList.add('is-locked');
    const box = card.querySelector('.rk-setup'); box.hidden = false;
    if (slide.setup) { const ch = mountExecChart(box.querySelector('.ex-chart'), { bars: slide.setup.bars, pil: slide.setup.pil, dir: 'bullish' }); ch.setPil(slide.setup.pil, slide.setup.pilAt); ch.draw(slide.setup.showTo); (slide.setup.tags || []).forEach((t) => ch.tag(t.at, t.text, t.tone || 'ink', t.where || 'auto')); }
    runAsks(asks, [{ ...(slide.ask || { prompt: 'Daily max −2R. You’re at −2R. TAKE TRADE?', options: [
      { label: 'Yes, it’s the best setup today', feedback: 'It’s beautiful. The daily stop is still reached.' },
      { label: 'Half size, just this once', feedback: 'Smaller size is still a trade past the daily stop.' },
      { label: 'DONE. The daily stop is reached.', correct: true, why: 'A valid setup doesn’t override a reached daily stop.' }] }), skill: 'daily' }], helpers, () => {
      if (slide.setup) { const ch = mountExecChart(box.querySelector('.ex-chart'), { bars: slide.setup.bars, pil: slide.setup.pil, dir: 'bullish' }); ch.setPil(slide.setup.pil, slide.setup.pilAt); ch.draw(slide.setup.bars.length); ch.tag(slide.setup.bars.length - 1, 'WOULD HAVE WON', 'ok', 'above'); }
      asks.insertAdjacentHTML('beforeend', `<div class="mg-notice">It would have won.<small>THE RULE WAS STILL CORRECT.</small></div>`);
      if (slide.revenge !== false) revenge();
      else { principle(asks, slide.punch); continueBtn(card, satisfy); }
    });
  }, reduced() ? 0 : 1300);
  function revenge() {
    const d = document.createElement('div');
    d.className = 'rk-rev';
    d.innerHTML = `<div class="tx-h">The revenge timeline</div>${[['−1R', ''], ['“one more.”', 'q'], ['−1R', ''], ['“I need it back.”', 'q'], ['double size', 'q'], ['−2R', '']].map(([t, c], i) => `<span class="${c}" style="--d:${0.3 + i * 0.5}s">${t}</span>`).join('<i>↓</i>')}<div class="rk-rev-tot" style="--d:3.4s">Total: −4R</div><div class="rk-rev-rw" style="--d:4.4s">⟲ Rewind. At −2R: <b>STOP.</b></div>`;
    asks.appendChild(d);
    setTimeout(() => { principle(asks, slide.punch || 'YOUR DAILY STOP EXISTS BEFORE THE REVENGE-TRADING VERSION OF YOU SHOWS UP. 😂'); continueBtn(card, satisfy); }, reduced() ? 0 : 5000);
  }
}

/* ── frequency ─────────────────────────────────────────────────────────── */
export function renderFrequency(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="rk-freq"><label>Trades today <input type="range" min="1" max="10" value="1"><b class="rk-n">1</b></label><div class="rk-stack"></div><div class="rk-freq-out"></div></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const inp = card.querySelector('input');
  const draw = () => { const n = +inp.value; card.querySelector('.rk-n').textContent = n; card.querySelector('.rk-stack').innerHTML = Array.from({ length: n }, () => '<i>1R</i>').join(''); card.querySelector('.rk-freq-out').innerHTML = `Potential planned loss if every trade stops out: <b>${n}R</b>${slide.perR ? ` ≈ <b>${usd(n * slide.perR)}</b>` : ''}`; };
  inp.addEventListener('input', draw); draw();
  runAsks(card.querySelector('.pl-asks'), slide.asks || [], helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy); });
}

/* ── drawdown ──────────────────────────────────────────────────────────── */
function curveSvg(paths, { w = 600, h = 200, labels = [] } = {}) {
  const all = paths.flatMap((p) => p.values);
  const hi = Math.max(...all), lo = Math.min(...all);
  const n = Math.max(...paths.map((p) => p.values.length)) - 1;
  const X = (i) => 20 + (i / Math.max(1, n)) * (w - 40), Y = (v) => 16 + ((hi - v) / Math.max(1, hi - lo)) * (h - 40);
  return `<svg viewBox="0 0 ${w} ${h}" class="rk-curve">${paths.map((p) => `<polyline points="${p.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}" class="rk-c-${p.tone}" pathLength="1"/><text x="${X(p.values.length - 1) - 4}" y="${Y(p.values[p.values.length - 1]) - 6}" text-anchor="end" class="rk-c-t">${p.label}</text>`).join('')}
    ${labels.map((l) => `<text x="${X(l.i)}" y="${h - 4}" text-anchor="middle" class="rk-c-x">${l.t}</text>`).join('')}</svg>`;
}
export function renderDrawdown(el, slide, satisfy, helpers = {}) {
  const mode = slide.mode || 'define';
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="rk-dd"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const box = card.querySelector('.rk-dd');
  const asks = card.querySelector('.pl-asks');
  const done = () => runAsks(asks, slide.asks || [], helpers, () => { principle(asks, slide.punch); continueBtn(card, satisfy); });
  if (mode === 'define') {
    const peak = slide.peak ?? 10000, cur = slide.current ?? 9400;
    const dd = drawdown(peak, cur);
    const vals = slide.path || [9200, 9600, 9900, peak, 9750, 9500, cur];
    box.innerHTML = curveSvg([{ values: vals, tone: 'ink', label: '' }]) + `<div class="rk-dd-read"><span><i>Peak</i> ${usd(peak)}</span><span><i>Current</i> ${usd(cur)}</span><span><i>Drawdown</i> <b>${usd(dd.dollars)} · ${dd.pct}%</b></span></div>`;
    done();
  } else if (mode === 'streak') {
    const start = slide.start ?? 10000;
    const L5 = ['L', 'L', 'L', 'L', 'L'];
    const a = equityPath(start, L5, { type: 'fixedPct', pct: 1 }), b = equityPath(start, L5, { type: 'fixedPct', pct: 10 });
    box.innerHTML = `<div class="rk-ls">${L5.map((x, i) => `<span style="--d:${0.2 + i * 0.3}s">${x}</span>`).join('')}</div>
      ${curveSvg([{ values: a, tone: 'ok', label: `A · 1%: ${drawdown(start, a[5]).pct}% down` }, { values: b, tone: 'bad', label: `B · 10%: ${drawdown(start, b[5]).pct}% down` }])}
      <div class="rk-sim"><div class="tx-h">Losing streak simulator · 5 hypothetical losses</div><div class="rk-sim-btns">${[0.5, 1, 2, 5, 10].map((p) => `<button type="button" class="tx-mini" data-p="${p}">${p}%</button>`).join('')}</div><div class="rk-sim-out"><small>Pick a risk % to compare. None of these is labeled “best”.</small></div></div>`;
    box.querySelectorAll('[data-p]').forEach((bt) => bt.addEventListener('click', () => {
      box.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('ok', x === bt));
      const v = equityPath(start, L5, { type: 'fixedPct', pct: +bt.dataset.p });
      const d = drawdown(start, v[5]);
      box.querySelector('.rk-sim-out').innerHTML = `${bt.dataset.p}% per trade → ending ${usd(v[5])} · drawdown <b>${d.pct}%</b> <small>(before costs; risk recalculated on current equity)</small>`;
    }));
    done();
  } else if (mode === 'compare') {
    const seq = slide.seq || ['L', 'L', 'W', 'L', 'L', 'L', 'W', 'W', 'L', 'W'];
    const start = slide.start ?? 10000;
    const a = equityPath(start, seq, { type: 'fixedPct', pct: 1 }), b = equityPath(start, seq, { type: 'escalate', pct: 1, step: 2 });
    box.innerHTML = `<div class="rk-ls">${seq.map((x, i) => `<span class="${x === 'W' ? 'w' : ''}" style="--d:${0.2 + i * 0.2}s">${x}</span>`).join('')}</div>
      ${curveSvg([{ values: a, tone: 'ok', label: 'Plan A · fixed' }, { values: b, tone: 'bad', label: 'Plan B · risk up after losses' }])}
      <div class="rk-dd-read"><span><i>Plan A low</i> ${usd(Math.min(...a))}</span><span><i>Plan B low</i> ${usd(Math.min(...b))}</span></div>`;
    done();
  }
}

/* ── account_compare ───────────────────────────────────────────────────── */
export function accountCardHtml(a, title) {
  const row = (k, v) => (v == null ? '' : `<div class="mg-row"><span>${k}</span><b>${v}</b></div>`);
  return `<div class="rk-acct"><div class="tx-h">${title || a.accountType}</div>${row('Account type', a.accountType)}${row('Displayed balance', a.displayedBalance != null ? usd(a.displayedBalance) : null)}
    ${row('Risk capacity', a.riskCapacity)}${row('Remaining allowable drawdown', a.remainingDrawdown != null ? usd(a.remainingDrawdown) : null)}${row('Daily loss limit', a.dailyLossLimit != null ? usd(a.dailyLossLimit) : null)}
    ${row('Contract limit', a.contractLimit)}${row('Personal risk rule', a.personalRiskRule)}</div>`;
}
export function renderAccountCompare(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card">${head(slide)}${slide.setupLine ? `<div class="p6-brief">${slide.setupLine}</div>` : ''}<div class="rk-acmp">${slide.accounts.map((a, i) => accountCardHtml(a, a.title || `Account ${'AB'[i]}`)).join('')}</div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  runAsks(card.querySelector('.pl-asks'), slide.asks || [], helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy); });
}

/* ── risk_profile: MY AGHF RISK FRAMEWORK ──────────────────────────────── */
export function renderRiskProfile(el, slide, satisfy) {
  const prev = loadRiskProfile() || {};
  el.innerHTML = `<div class="lw-card">${head(slide)}<div class="rk-prof">${PROFILE_FIELDS.map((f) => `<label class="rk-pf"><span>${f.label}</span>${f.type === 'choice'
    ? `<select data-k="${f.key}">${['', ...f.options].map((o) => `<option ${prev[f.key] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`
    : f.type === 'text' ? `<textarea data-k="${f.key}" rows="2">${prev[f.key] || ''}</textarea>` : `<input type="number" min="0" step="any" data-k="${f.key}" value="${prev[f.key] ?? ''}" placeholder="${f.placeholder || ''}">`}</label>`).join('')}
    <div class="rk-pf rk-pf-fixed"><span>Contract size</span><b>DETERMINED FROM RISK ✓</b></div></div>
    <p class="mg-note">Your numbers, from your circumstances and account rules. The Academy teaches the calculation; it doesn’t tell you what to risk. Saved to your Academy profile for your trading plan, journal and planner.</p>
    <button type="button" class="lw-continue-btn rk-save" disabled>Save my risk framework →</button></div>`;
  const card = el.querySelector('.lw-card');
  const save = card.querySelector('.rk-save');
  const vals = () => Object.fromEntries([...card.querySelectorAll('[data-k]')].map((i) => [i.dataset.k, i.type === 'number' ? (i.value === '' ? null : +i.value) : i.value]));
  const check = () => { const v = vals(); save.disabled = !(v.accountType && v.riskPerTradeLimit && v.dailyLossLimitDollar && v.maxTradesPerDay && (v.stopTradingWhen || '').trim().length > 3); };
  card.addEventListener('input', check); card.addEventListener('change', check); check();
  save.addEventListener('click', () => { saveRiskProfile(vals()); save.textContent = '✓ Saved to your Academy profile'; save.disabled = true; save.classList.remove('lw-continue-btn'); save.classList.add('rk-saved'); continueBtn(card, satisfy); });
}

/* ── size_table: every option and its consequences ─────────────────────── */
export function renderSizeTable(el, slide, satisfy, helpers = {}) {
  const a = slide.account; // { remainingDrawdown, dailyLoss, stop, pv, options: [2, 4, 6, 8] }
  const pv = a.pv || 2;
  const metrics = (n) => {
    const risk = priceRisk(a.stop, pv, n);
    return { risk, pctDaily: Math.round((risk / a.dailyLoss) * 100), remDaily: a.dailyLoss - risk, remDD: a.remainingDrawdown - risk, losses: Math.floor(a.dailyLoss / risk) };
  };
  el.innerHTML = `<div class="lw-card">${head(slide)}${accountCardHtml({ accountType: a.accountType, displayedBalance: a.balance, remainingDrawdown: a.remainingDrawdown, dailyLossLimit: a.dailyLoss, personalRiskRule: `MNQ · ${a.stop}-pt stop` }, 'Account & rules')}
    <div class="rk-opts">${a.options.map((n) => `<button type="button" class="rk-opt" data-n="${n}"><b>${n} MNQ</b><small>${usd(priceRisk(a.stop, pv, n))} risk</small></button>`).join('')}</div>
    <div class="rk-met"><small>Tap a size to see what it does to your day and your account.</small></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.lw-card');
  const met = card.querySelector('.rk-met');
  const asks = card.querySelector('.pl-asks');
  let chosen = null, started = false;
  card.querySelectorAll('.rk-opt').forEach((b) => b.addEventListener('click', () => {
    chosen = +b.dataset.n;
    card.querySelectorAll('.rk-opt').forEach((x) => x.classList.toggle('on', x === b));
    const m = metrics(chosen);
    met.innerHTML = `<div class="mg-row"><span>Trade risk</span><b>${usd(m.risk)}</b></div><div class="mg-row"><span>% of personal daily loss limit used</span><b>${m.pctDaily}%</b></div>
      <div class="mg-row"><span>Remaining personal daily capacity after a full loss</span><b>${usd(m.remDaily)}</b></div><div class="mg-row"><span>Remaining firm drawdown after a full loss</span><b>${usd(m.remDD)}</b></div>
      <div class="mg-row"><span>Full losses before the personal daily stop</span><b>${m.losses}</b></div>`;
    if (!started) { started = true; explain(); }
  }));
  function explain() {
    const box = document.createElement('div');
    box.className = 'rk-explain';
    box.innerHTML = `<div class="tx-q">EXPLAIN YOUR DECISION.</div><textarea class="sw-textarea" rows="3" placeholder="Which size, and why, using the numbers above…"></textarea><button type="button" class="lw-continue-btn" disabled>Lock my size →</button>`;
    asks.appendChild(box);
    const ta = box.querySelector('textarea'), go = box.querySelector('button');
    ta.addEventListener('input', () => { go.disabled = ta.value.trim().length < 20 || !chosen; });
    go.addEventListener('click', () => {
      ta.disabled = true; go.remove(); card.querySelectorAll('.rk-opt').forEach((x) => { x.disabled = true; });
      const m = metrics(chosen);
      const fits = m.risk <= a.dailyLoss && m.risk < a.remainingDrawdown;
      trackRisk('account', fits && chosen <= (a.reasonableMax || 4));
      box.insertAdjacentHTML('beforeend', `<div class="tx-fb ${fits ? 'good' : 'bad'}">${fits ? '' : '<b>That size doesn’t fit your constraints.</b> '}${a.note || ''}</div>`);
      simulate(m);
    });
  }
  function simulate(m) {
    const d = document.createElement('div');
    d.className = 'rk-simday';
    const remDaily = a.dailyLoss - m.risk, remDD = a.remainingDrawdown - m.risk;
    d.innerHTML = `<div class="tx-h">Trade 1 · LOSS</div><div class="mg-row"><span>Daily P&amp;L</span><b>${usd(-m.risk)}</b></div><div class="mg-row"><span>Remaining personal daily capacity</span><b>${usd(remDaily)}</b></div><div class="mg-row"><span>Remaining allowable drawdown</span><b>${usd(remDD)}</b></div>`;
    asks.appendChild(d);
    const can = remDaily >= m.risk && remDD > m.risk;
    runAsks(asks, [{ prompt: 'A second VALID setup appears. Same size. CAN YOU TAKE IT?', skill: 'daily', options: [
      { label: 'Yes, the setup is valid', correct: can, why: can ? 'The setup is valid AND the risk still fits both the daily rule and the account.' : undefined, feedback: can ? undefined : `Valid isn’t enough. ${usd(m.risk)} doesn’t fit what’s left: ${usd(remDaily)} daily, ${usd(remDD)} drawdown.` },
      { label: `No: it doesn’t fit what’s left of my risk`, correct: !can, why: !can ? 'You compared trade risk, the daily rule and the account. That’s the system.' : undefined, feedback: can ? `It does fit: ${usd(m.risk)} against ${usd(remDaily)} daily and ${usd(remDD)} drawdown.` : undefined },
    ] }], helpers, () => { principle(asks, slide.punch || 'RISK IS A SYSTEM, NOT TRIVIA.'); continueBtn(card, satisfy); });
  }
}

/* ── r_review ──────────────────────────────────────────────────────────── */
export function renderRReview(el, slide, satisfy) {
  const r = riskReview(session() || {});
  el.innerHTML = `<div class="lw-card p6-review">${head({ kicker: 'Your risk control review', title: slide.title || 'How you protected the account' })}
    <div class="p6-rv-rows">${r.rows.map(([l, v]) => `<div class="p6-rv"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    <p class="p6-rv-note">Behavior in this practice. Not a verdict on you, and not a profitability score.</p>
    ${r.review.length ? `<div class="sg-review-box"><div class="lw-eyebrow">What to review</div>${r.review.map((x) => `<p>${x.line}</p><a class="sg-review" href="${x.href}">${x.cta}</a>`).join('')}</div>` : '<div class="icc-principle">You sized from risk, respected the daily stop and sized the account, not the chart.</div>'}</div>`;
  continueBtn(el.querySelector('.p6-review'), satisfy);
}

/* ── session_sim: the TradingSessionSimulator (Phase 6 capstone) ───────── */
/**
 * slide.variants: [{ name, account, rules: { riskPerTrade, dailyLoss, maxTrades, stop }, context: { h4, h1, m15 },
 *   pre: [asks],  setups: [{ title, trigger, manage, afterAsks, lockedAsk }] }]
 * One variant is picked at random: sometimes no entry, sometimes a valid loss, a run without
 * retest, a management temptation, a reached daily limit, or a smaller size. The session is
 * the test, not the number of trades. Category results are reported per decision
 * (analysis / execution / management / risk).
 */
export function renderSessionSim(el, slide, satisfy, helpers = {}) {
  const variants = slide.variants;
  const v = slide.variant != null ? variants[slide.variant] : variants[Math.floor(Math.random() * variants.length)];
  startSession(`session-${v.name}`);
  const cats = { analysis: [0, 0], execution: [0, 0], management: [0, 0], risk: [0, 0] };
  const report = (cat, ok) => { cats[cat][1] += 1; if (ok) cats[cat][0] += 1; helpers.report?.(cat, ok); };
  const tracker = dailyTracker({ dailyLossLimitDollar: v.rules.dailyLoss, maxTradesPerDay: v.rules.maxTrades });
  let size = v.rules.size || 1, ddLeft = v.account.remainingDrawdown;
  el.innerHTML = `<div class="lw-card rk-sess">${head(slide)}
    <div class="rk-sess-top"><span class="tx-st tx-st-conf">TRADING SESSION</span><span class="rk-ss-day"></span></div>
    <div class="rk-sess-ctx"><div class="rk-sess-charts"></div>${accountCardHtml(v.account, 'Account')}</div>
    <div class="rk-sess-flow"></div></div>`;
  const card = el.querySelector('.rk-sess');
  const flow = card.querySelector('.rk-sess-flow');
  const dayEl = card.querySelector('.rk-ss-day');
  const day = () => { dayEl.innerHTML = `Trades ${tracker.state.tradesTakenToday}/${v.rules.maxTrades} · Daily P&amp;L ${usd(tracker.state.currentDailyPnL)} · Daily capacity left ${usd(tracker.remainingDollar())} · Drawdown left ${usd(ddLeft)}`; };
  day();
  [['4H', 'Read the room', v.context.h4], ['1H', 'Build the map', v.context.h1]].forEach(([tf, t, spec]) => {
    if (!spec) return;
    const d = document.createElement('div'); d.className = 'p6-bw-chart'; d.innerHTML = `<div class="ex-chart-head"><b>${tf}</b><span>${t}</span></div><div class="p6-bw-c"></div>`;
    card.querySelector('.rk-sess-charts').appendChild(d); mountChart(d.querySelector('.p6-bw-c'), spec, { height: 150 });
  });
  if (v.context.m15) card.querySelector('.rk-sess-charts').insertAdjacentHTML('beforeend', `<div class="p6-brief"><b>15M</b> ${v.context.m15}</div>`);

  const stage = (title) => { const s = document.createElement('div'); s.className = 'rk-stage'; s.innerHTML = `<div class="rk-stage-h">${title}</div><div class="rk-stage-b"></div>`; flow.appendChild(s); s.scrollIntoView({ behavior: 'smooth', block: 'start' }); return s.querySelector('.rk-stage-b'); };
  const asksIn = (box, qs, then) => {
    const run = (j) => { if (j >= qs.length) { then(); return; } const q = qs[j]; askQuestion(box, q, { ...helpers, onPick(qq, o, c, w) { if (w === 0) report(q.cat || 'risk', c); if (q.cat === 'risk' && w === 0 && q.skill) trackRisk(q.skill, c); } }, (o) => { if (q.setsSize) size = +o.value || size; run(j + 1); }); };
    run(0);
  };
  const subHelpers = (cat) => ({ ...helpers, onPick(q, o, c) { report(cat, c); }, handleStreak: () => {} });

  // PRE-TRADE
  asksIn(stage('PRE-TRADE · context, PIL, risk, size, daily capacity'), v.pre, () => setupLoop(0));

  function setupLoop(i) {
    if (i >= v.setups.length) { finish(); return; }
    const su = v.setups[i];
    if (tracker.locked() || su.lockedAsk) {
      const b = stage(`${su.title || `Setup ${i + 1}`} · ACCOUNT CONTROL`);
      asksIn(b, [su.lockedAsk || { cat: 'risk', skill: 'daily', prompt: 'Your daily stop is reached. A beautiful setup appears. Now what?', options: [
        { label: 'Take it, it’s A+', feedback: 'A valid setup doesn’t override a reached daily stop.' },
        { label: 'DONE FOR DAY', correct: true, why: 'Done means done. Review, journal, study.' }] }], () => setupLoop(i + 1));
      return;
    }
    const b = stage(`${su.title || `Setup ${i + 1}`} · ENTRY`);
    const host = document.createElement('div'); b.appendChild(host);
    let entered = false;
    renderTriggerSim(host, { ...su.trigger, kicker: '', cta: 'Continue the session →' }, () => {
      host.querySelectorAll('.lw-continue-btn').forEach((x) => x.remove());
      if (entered && su.manage) manage(su, i); else after(su, i, null);
    }, { ...subHelpers('execution'), onTriggerEnd(s) { entered = s.entered; } });
  }
  function manage(su, i) {
    const b = stage(`${su.title || 'Trade'} · MANAGEMENT (plan locked at ${size} MNQ)`);
    const host = document.createElement('div'); b.appendChild(host);
    let res = null;
    renderManageSim(host, { ...su.manage, plan: { ...su.manage.plan, contractCount: size }, kicker: '', cta: 'Continue the session →' }, () => {
      host.querySelectorAll('.lw-continue-btn').forEach((x) => x.remove());
      after(su, i, res);
    }, { ...subHelpers('management'), onManageResult(r) { res = r; } });
  }
  function after(su, i, res) {
    if (res) {
      tracker.record(res.pnl || 0, res.r || 0);
      if (res.pnl < 0) ddLeft += res.pnl;
      day();
    }
    const b = stage(`ACCOUNT CONTROL · after ${su.title || `setup ${i + 1}`}`);
    b.innerHTML = `<div class="rk-acc-up">${res ? `<span><i>Result</i> ${res.r > 0 ? '+' : ''}${res.r}R · ${usd(res.pnl)}</span>` : '<span><i>Result</i> No trade</span>'}
      <span><i>Daily P&amp;L</i> ${usd(tracker.state.currentDailyPnL)} · ${tracker.state.currentDailyR}R</span><span><i>Daily capacity left</i> ${usd(tracker.remainingDollar())}</span><span><i>Drawdown left</i> ${usd(ddLeft)}</span></div>`;
    asksIn(b, su.afterAsks || [], () => setupLoop(i + 1));
  }
  function finish() {
    const b = stage('SESSION REVIEW');
    const pct = ([r, t]) => (t ? Math.round((r / t) * 100) : null);
    const rows = Object.entries(cats).map(([k, val]) => [k.toUpperCase().replace('RISK', 'RISK CONTROL'), pct(val)]);
    b.innerHTML = `<div class="p6-rv-rows">${rows.map(([l, p]) => `<div class="p6-rv"><span>${l}</span><b>${p == null ? '·' : `${p}%`}</b></div>`).join('')}</div>
      <p class="p6-rv-note">Trades taken: ${tracker.state.tradesTakenToday}. ${tracker.state.tradesTakenToday === 0 ? 'Zero trades can be a perfect session.' : 'The session is the test, not the number of trades.'}</p>`;
    continueBtn(card, satisfy, slide.cta || 'Continue →');
  }
}

export const RISK_RENDERERS = {
  size_fit: renderSizeFit,
  r_normalizer: renderRNormalizer,
  expectancy: renderExpectancy,
  daily_stop: renderDailyStop,
  frequency: renderFrequency,
  drawdown: renderDrawdown,
  account_compare: renderAccountCompare,
  risk_profile: renderRiskProfile,
  size_table: renderSizeTable,
  r_review: renderRReview,
  session_sim: renderSessionSim,
};
Object.keys(RISK_RENDERERS).forEach((key) => {
  const r = RISK_RENDERERS[key];
  RISK_RENDERERS[key] = (el, slide, satisfy, helpers) => { if (slide.sessionStart) startSession(slide.sessionStart); return r(el, slide, satisfy, helpers); };
});
