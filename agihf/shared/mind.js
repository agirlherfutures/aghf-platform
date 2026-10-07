/**
 * mind.js — A Girl & Her Futures™
 *
 * Phase 7 · The Mindset Behind the Model. Trader behavior training, not a
 * therapy worksheet: every screen is a trading decision with an internal
 * state layered on top. Quieter, more intimate, still premium AGHF.
 *
 *   p7_monologue    the cinematic opener / closer: checks, a muted chart, thoughts
 *                   one by one, FREEZE, then the lines (welcomes, completions, transitions)
 *   p7_ask          a card with an optional chart + inner thought + facts, then questions
 *   p7_mirror       MindsetMirror: MARKET | MIND split, the current rule, the proposed
 *                   action. What am I feeling? What is it pushing me toward? Did the
 *                   market change? What does my rule say? WHO IS TRADING RIGHT NOW?
 *   p7_split        side-by-side contrasts (feeling vs behavior, patience vs hesitation…)
 *   p7_pause        the PAUSE button: MARKET · PLAN · MIND · ACTION
 *   p7_loop         a cycle that keeps going around (revenge loop, confidence loop)
 *   p7_map          an emotion and the behaviors it can produce
 *   p7_baseline     the baseline card vs a losing / winning streak
 *   p7_process      OUTCOME · PROCESS · STRATEGY CONCLUSION, never collapsed (+ journal)
 *   p7_tally        honest counts (missed profit stays neutral, never red)
 *   p7_temp         emotional temperature: self-observation, not a diagnosis
 *   p7_state_card   the Trader State Card (read an example, fill her own)
 *   p7_seen         “YOU’VE SEEN THIS ONE BEFORE.” (her earlier mistake TYPES or saved triggers)
 *   p7_score        the end-of-lab review: observable decisions + electric support
 *   p7_random       one variant at random (no simulator “expects” a click)
 *   p7_session      a continuous session: events in one card with a session HUD
 */

import { askQuestion } from './price-lab.js';
import { mountChart } from './structure-charts.js';
import { mountExecChart } from './icc-exec.js';
import { SLIDE_RENDERERS } from './lesson-slides-engine.js';
import { mindOn, mindOff, pauseButton, pauseHtml, reduced } from './mind-ui.js';
import * as M from './mind-core.js';
import { trackRules, startRulesSession, rulebookReview, triggerResponses } from './rules-core.js';
import { trackEnv, startEnvSession, envReview } from './env-core.js';

/* ── shared helpers (also used by rules.js and env.js) ─────────────────── */

export function continueBtn(el, satisfy, label = 'Continue →') {
  if (!satisfy || el.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', () => { b.disabled = true; satisfy(); });
  el.appendChild(b);
}
export function head(slide, fallback = 'The Mindset Behind the Model') {
  return `${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || fallback}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}`;
}
export function principle(container, html, cls = 'icc-principle') {
  if (!html) return null;
  const p = document.createElement('div'); p.className = cls; p.innerHTML = html; container.appendChild(p); return p;
}
export const factsHtml = (facts) => (facts && facts.length ? `<div class="p7-facts">${facts.map(([k, v, tone]) => `<span class="${tone ? `is-${tone}` : ''}"><i>${k}</i> ${v}</span>`).join('')}</div>` : '');

/** A chart for any Phase 7 card: exec bars (1M) or a structure sketch. Returns the host. */
export function chartBlock(host, c) {
  if (!c) return null;
  const box = document.createElement('div');
  box.className = 'p7-chart-wrap';
  box.innerHTML = `${c.head ? `<div class="ex-chart-head"><b>${c.head.tf || '1M'}</b><span>${c.head.label || 'MNQ'}</span>${c.head.time ? `<span class="tx-clock">🕒 <b>${c.head.time}</b></span>` : ''}</div>` : ''}<div class="p7-chart"></div>`;
  host.appendChild(box);
  const el = box.querySelector('.p7-chart');
  if (c.bars) {
    const ch = mountExecChart(el, { bars: c.bars, total: c.slots || c.bars.length, pil: null, dir: c.dir || 'bullish', range: c.range });
    if (c.pil != null) ch.setPil(c.pil, c.pilAt);
    const tags = () => (c.tags || []).forEach((t) => { if (t.at < shown) ch.tag(t.at, t.text, t.tone || 'gold', t.pos || 'auto', `t${t.at}`); });
    let shown = c.play ? c.play.from : (c.show ?? c.bars.length);
    ch.draw(shown);
    if (c.lines) ch.lines(c.lines);
    tags();
    box.chart = ch;
    // c.play = { from, to, speed }: candles print one by one; box.played resolves at the end.
    box.played = new Promise((res) => {
      if (!c.play) { res(); return; }
      const to = c.play.to ?? c.bars.length;
      const step = () => {
        if (!box.isConnected) { res(); return; }
        if (shown >= to) { res(); return; }
        shown += 1; ch.draw(shown); (c.tags || []).filter((t) => t.at === shown - 1).forEach((t) => ch.tag(t.at, t.text, t.tone || 'gold', t.pos || 'auto', `t${t.at}`));
        setTimeout(step, reduced() ? 0 : (c.play.speed || 260));
      };
      setTimeout(step, reduced() ? 0 : 500);
    });
  } else { mountChart(el, c, { height: c.height || 200 }); box.played = Promise.resolve(); }
  return box;
}

/**
 * Ask a list of questions in order. Questions/options can carry Phase 7 tracking:
 *   q.rcat  rules adherence category   q.ecat  environment category   q.recog  recognition
 *   o.track mind counter(s)            o.rinc  rules counter           o.einc  env counter
 * onAsk(q) runs before each question (e.g. to shift the mirror's focus).
 */
export function runAsks(box, qs, helpers = {}, done = () => {}, { onAsk, onFirst, onSolved } = {}) {
  const list = (qs || []).filter(Boolean);
  const run = (j) => {
    if (j >= list.length) { done(); return; }
    const q = list[j];
    onAsk?.(q, j);
    const h = {
      ...helpers,
      onPick(qq, o, c, w) {
        helpers.onPick?.(qq, o, c, w);
        if (w !== 0) return;
        onFirst?.(q, o, c);
        if (q.rcat) trackRules(q.rcat, c);
        if (q.skill) helpers.report?.(q.skill, c);
        if (q.ecat) trackEnv(q.ecat, c);
        if (q.recog) { M.trackMind('recognitionTries'); if (c) M.trackMind('recognitionRight'); }
        if (o.track) M.trackAll(o.track);
        if (o.rinc) trackRules(o.rinc);
        if (o.einc) trackEnv(o.einc);
      },
    };
    askQuestion(box, q, h, (o) => { onSolved?.(q, o, j); run(j + 1); });
  };
  run(0);
}

/* ── p7_monologue ──────────────────────────────────────────────────────── */
/**
 * { checks: ['ANALYSIS ✓', …], chart, thoughts: [...], steps: [{ thought, act }], freeze: true,
 *   lines: [...], reveal: { eyebrow, title, sub, mission }, cards: [...], cta }
 */
export function renderMonologue(el, slide, satisfy) {
  let d = 0.2;
  const at = (step = 0.9) => { const v = d; d += reduced() ? 0 : step; return reduced() ? 0 : v; };
  const checks = slide.checks ? `<div class="p7-checks">${slide.checks.map((c) => `<span style="--d:${at(0.45)}s">${c}</span>`).join('')}</div>` : '';
  el.innerHTML = `<div class="lw-card p7-mono${slide.dark ? ' is-dark' : ''}">${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}${slide.title ? `<h2>${slide.title}</h2>` : ''}${checks}<div class="p7-mono-stage"></div><div class="p7-mono-after"></div></div>`;
  const card = el.querySelector('.p7-mono');
  const stage = card.querySelector('.p7-mono-stage');
  const after = card.querySelector('.p7-mono-after');
  if (slide.chart) chartBlock(stage, slide.chart);
  if (slide.thoughts) {
    const box = document.createElement('div'); box.className = 'p7-mono-thoughts';
    box.innerHTML = slide.thoughts.map((t) => `<div class="p7-bubble" style="--d:${at(slide.gap || 1.0)}s"><span>${t}</span></div>`).join('');
    stage.appendChild(box);
    if (slide.chart) stage.classList.add('p7-has-mind');
  }
  if (slide.steps) {
    const box = document.createElement('div'); box.className = 'p7-mono-steps';
    box.innerHTML = slide.steps.map((s) => `<div class="p7-mstep"><div class="p7-bubble" style="--d:${at(0.8)}s"><span>${s.thought}</span></div><div class="p7-mact" style="--d:${at(1.0)}s">${s.act}</div></div>`).join('');
    stage.appendChild(box);
  }
  if (slide.cards) {
    const box = document.createElement('div'); box.className = 'p7-mono-cards';
    box.innerHTML = slide.cards.map((c) => `<div class="p7-rcard" style="--d:${at(0.6)}s">${c}</div>`).join('');
    stage.appendChild(box);
  }
  if (slide.freeze) {
    const fz = at(0.9);
    stage.style.setProperty('--fz', `${fz}s`);
    stage.classList.add('p7-freezes');
    after.insertAdjacentHTML('beforeend', `<div class="p7-freeze" style="--d:${fz}s">${slide.freeze === true ? 'FREEZE.' : slide.freeze}</div>`);
  }
  (slide.lines || []).forEach((l) => after.insertAdjacentHTML('beforeend', `<div class="p7-line${/^<b>|^[A-Z0-9 .,’'!?:…“”]+$/.test(l) ? ' is-big' : ''}" style="--d:${at(1.1)}s">${l}</div>`));
  if (slide.reveal) {
    const r = slide.reveal;
    after.insertAdjacentHTML('beforeend', `<div class="p7-reveal" style="--d:${at(1.2)}s">${r.eyebrow ? `<small>${r.eyebrow}</small>` : ''}<b>${r.title}</b>${r.sub ? `<span>${r.sub}</span>` : ''}${r.mission ? `<em>${r.mission}</em>` : ''}</div>`);
  }
  // Play only once it's on screen (a completion page can stack two cinemas).
  card.classList.add('p7-wait');
  const play = () => {
    card.classList.add('p7-play');
    if (satisfy) setTimeout(() => { if (card.isConnected) continueBtn(card, satisfy, slide.cta || 'Continue →'); }, reduced() ? 0 : d * 1000 + 300);
  };
  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.25 });
    io.observe(card);
  } else play();
}

/* ── p7_ask ────────────────────────────────────────────────────────────── */
export function renderAsk(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}${factsHtml(slide.facts)}<div class="p7-ask-stage"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const stage = card.querySelector('.p7-ask-stage');
  const asks = card.querySelector('.pl-asks');
  if (slide.chart) chartBlock(stage, slide.chart);
  if (slide.thought) { if (slide.chart) mindOn(stage, slide.thought, slide); else stage.innerHTML += `<div class="p7-mono-thoughts">${[].concat(slide.thought).map((t, i) => `<div class="p7-bubble" style="--d:${i * 0.8}s"><span>${t}</span></div>`).join('')}</div>`; }
  if (slide.action) stage.insertAdjacentHTML('beforeend', `<div class="p7-action">PROPOSED ACTION <b>${slide.action}</b></div>`);
  if (slide.pause) pauseButton(asks, slide.pause, { open: slide.pauseOpen });
  runAsks(asks, slide.asks || (slide.ask ? [slide.ask] : []), helpers, () => {
    if (slide.clearMind) mindOff(stage);
    principle(asks, slide.punch);
    continueBtn(card, satisfy, slide.cta);
  }, { onAsk: (q) => { if (q.unmute) mindOff(stage); } });
}

/* ── p7_mirror: MindsetMirror ──────────────────────────────────────────── */
/**
 * { chart, market: { state, facts }, mind: { history: [...], daily }, thought, action,
 *   rule: { label, text }, asks: [{ focus: 'mind'|'market'|'rule', … }],
 *   who: { correct: 'fear', options: ['process','fear',…], why, feedback: { key: text } }, punch }
 */
export function renderMirror(el, slide, satisfy, helpers = {}) {
  const mk = slide.market || {};
  const mind = slide.mind || {};
  el.innerHTML = `<div class="lw-card p7-card p7-mirror">${head(slide, 'Mindset Mirror 🪞')}
    <div class="p7-mx">
      <div class="p7-mx-pane p7-mx-market"><div class="p7-mx-h">MARKET</div><div class="p7-mx-chart"></div>
        ${mk.state ? `<div class="p7-mx-state"><i>Market state</i> <b>${mk.state}</b></div>` : ''}${factsHtml(mk.facts)}</div>
      <div class="p7-mx-pane p7-mx-mind"><div class="p7-mx-h">MIND</div>
        ${(mind.history || []).length ? `<div class="p7-mx-hist">${mind.history.map((h) => `<span>${h}</span>`).join('')}</div>` : ''}
        ${mind.daily ? `<div class="p7-mx-state"><i>Today</i> <b>${mind.daily}</b></div>` : ''}
        <div class="p7-mx-thought">${[].concat(slide.thought || []).map((t, i) => `<div class="p7-bubble is-big" style="--d:${0.3 + i * 0.9}s"><span>${t}</span></div>`).join('')}</div>
        ${slide.action ? `<div class="p7-action">PROPOSED ACTION <b>${slide.action}</b></div>` : ''}</div>
    </div>
    ${slide.rule ? `<div class="p7-rule"><small>${slide.rule.label || 'CURRENT RULE'}</small><b>${slide.rule.text}</b></div>` : ''}
    <div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-mirror');
  if (slide.chart) chartBlock(card.querySelector('.p7-mx-chart'), slide.chart);
  const asks = card.querySelector('.pl-asks');
  const focus = (f) => { card.classList.remove('focus-mind', 'focus-market', 'focus-rule'); if (f) card.classList.add(`focus-${f}`); };
  const qs = [...(slide.asks || [])];
  if (slide.who) {
    const w = slide.who;
    qs.push({ prompt: w.prompt || 'WHO IS TRADING RIGHT NOW?', recog: true, focus: 'mind', chips: true,
      options: (w.options || ['process', 'fear', 'greed', 'fomo', 'revenge']).map((k) => ({
        label: `${M.WHO[k]?.icon || ''} ${M.WHO[k]?.label || k}`, correct: k === w.correct,
        why: k === w.correct ? w.why : undefined, feedback: (w.feedback || {})[k] || w.wrong || 'Look at what the market did, then at what the thought is asking for.',
        track: k === w.correct ? w.track : undefined,
      })) });
  }
  runAsks(asks, qs, helpers, () => { focus('rule'); principle(asks, slide.punch); continueBtn(card, satisfy, slide.cta); }, { onAsk: (q) => focus(q.focus) });
}

/* ── p7_split ──────────────────────────────────────────────────────────── */
export function renderSplit(el, slide, satisfy, helpers = {}) {
  const side = (s, cls, base) => `<div class="p7-split-col ${cls} is-${s.tone || 'ink'}"><div class="p7-split-h">${s.h}</div>
    ${s.sub ? `<div class="p7-split-sub">${s.sub}</div>` : ''}
    ${(s.lines || []).map((l, i) => `<div class="p7-split-l" style="--d:${reduced() ? 0 : base + i * 0.9}s">${l}</div>`).join('')}
    ${s.counter ? `<div class="p7-counter" style="--d:${reduced() ? 0 : base + (s.lines || []).length * 0.9}s"><small>${s.counter.label}</small><b data-n="${s.counter.value}">0</b></div>` : ''}</div>`;
  const nL = (slide.left.lines || []).length;
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}<div class="p7-split">${side(slide.left, 'is-left', 0.3)}${side(slide.right, 'is-right', slide.together ? 0.3 : 0.3 + nL * 0.9)}</div>
    ${slide.verdict ? `<div class="p7-verdict" style="--d:${reduced() ? 0 : 0.6 + (nL + (slide.right.lines || []).length) * 0.9}s">${slide.verdict}</div>` : ''}<div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  card.querySelectorAll('.p7-counter b').forEach((b) => {
    const n = +b.dataset.n; const delay = parseFloat(getComputedStyle(b.parentElement).getPropertyValue('--d')) || 0;
    setTimeout(() => { let i = 0; const t = setInterval(() => { if (!b.isConnected) { clearInterval(t); return; } i += 1; b.textContent = i; if (i >= n) clearInterval(t); }, reduced() ? 0 : 90); }, reduced() ? 0 : delay * 1000);
  });
  const total = reduced() ? 0 : (1 + (nL + (slide.right.lines || []).length) * 0.9) * 1000;
  setTimeout(() => {
    if (!card.isConnected) return;
    runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
  }, total);
}

/* ── p7_pause: the PAUSE button ────────────────────────────────────────── */
export function renderPause(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-pausecard">${head(slide)}${factsHtml(slide.facts)}<div class="p7-ask-stage"></div>
    <button type="button" class="p7-pause-big">⏸ PAUSE</button><div class="p7-pause-out"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-pausecard');
  const stage = card.querySelector('.p7-ask-stage');
  if (slide.chart) chartBlock(stage, slide.chart);
  if (slide.thought) { if (slide.chart) mindOn(stage, slide.thought); else stage.innerHTML += `<div class="p7-mono-thoughts"><div class="p7-bubble"><span>${slide.thought}</span></div></div>`; }
  if (slide.action) stage.insertAdjacentHTML('beforeend', `<div class="p7-action">THE URGE <b>${slide.action}</b></div>`);
  const btn = card.querySelector('.p7-pause-big');
  btn.addEventListener('click', () => {
    btn.disabled = true; btn.classList.add('is-on'); btn.textContent = '⏸ PAUSED';
    card.querySelector('.p7-pause-out').innerHTML = pauseHtml(slide.pause);
    setTimeout(() => runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); }), reduced() ? 0 : 2200);
  });
}

/* ── p7_loop ───────────────────────────────────────────────────────────── */
export function renderLoop(el, slide, satisfy, helpers = {}) {
  const n = slide.nodes.length;
  const step = slide.step || 0.75;
  const nodes = slide.nodes.map((t, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + 40 * Math.cos(a), y = 50 + 39 * Math.sin(a);
    return `<div class="p7-node${i === slide.breakAt ? ' is-break' : ''}" style="left:${x}%;top:${y}%;--d:${reduced() ? 0 : i * step}s;--d2:${reduced() ? 0 : (n + i) * step}s">${t}</div>`;
  }).join('');
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}<div class="p7-loop" style="--loop:${n * step}s">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><circle cx="50" cy="50" r="39" class="p7-loop-ring"/><circle cx="50" cy="50" r="39" pathLength="100" class="p7-loop-run"/></svg>
      ${nodes}${slide.center ? `<div class="p7-loop-c">${slide.center}</div>` : ''}</div>
    <ol class="p7-loop-list">${slide.nodes.map((t) => `<li>${t}</li>`).join('')}</ol><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  setTimeout(() => {
    if (!card.isConnected) return;
    runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
  }, reduced() ? 0 : n * step * 1000 + 600);
}

/* ── p7_map ────────────────────────────────────────────────────────────── */
export function renderMap(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}<div class="p7-map">
      <div class="p7-map-c"><span>${slide.icon || ''}</span><b>${slide.emotion}</b><small>may produce</small></div>
      <div class="p7-map-list">${slide.behaviors.map((b, i) => `<span style="--d:${reduced() ? 0 : 0.4 + i * 0.35}s">${b}</span>`).join('')}</div></div>
      ${slide.note ? `<div class="p7-note">${slide.note}</div>` : ''}<div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  setTimeout(() => runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); }), reduced() ? 0 : 600 + slide.behaviors.length * 350);
}

/* ── p7_baseline ───────────────────────────────────────────────────────── */
export function renderBaseline(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}<div class="p7-base">
      <div class="p7-base-card"><div class="p7-mx-h">BASELINE</div>${slide.baseline.map(([k, v]) => `<div class="p7-base-row"><span>${k}</span><b>${v}</b></div>`).join('')}<div class="p7-base-stamp" hidden>UNCHANGED ✓</div></div>
      <div class="p7-base-runs"></div></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const runsEl = card.querySelector('.p7-base-runs');
  const asks = card.querySelector('.pl-asks');
  const runs = slide.runs || [];
  const go = (i) => {
    if (i >= runs.length) { card.querySelector('.p7-base-stamp').hidden = false; principle(asks, slide.punch); continueBtn(card, satisfy, slide.cta); return; }
    const r = runs[i];
    const row = document.createElement('div');
    row.className = 'p7-streak';
    row.innerHTML = `<small>${r.label}</small><div class="p7-streak-seq">${r.seq.split('').map((c, j) => `<i class="is-${c === 'W' ? 'w' : 'l'}" style="--d:${reduced() ? 0 : j * 0.35}s">${c === 'W' ? '+1R' : '−1R'}</i>`).join('')}</div>${r.thoughts ? `<div class="p7-mono-thoughts">${r.thoughts.map((t, j) => `<div class="p7-bubble" style="--d:${reduced() ? 0 : 1.6 + j * 0.7}s"><span>${t}</span></div>`).join('')}</div>` : ''}`;
    runsEl.appendChild(row);
    setTimeout(() => runAsks(asks, r.asks || (r.ask ? [r.ask] : []), helpers, () => go(i + 1)), reduced() ? 0 : 1800 + (r.thoughts || []).length * 700);
  };
  go(0);
}

/* ── p7_process: OUTCOME · PROCESS · STRATEGY ──────────────────────────── */
export const OUTCOME_OPTS = ['WIN', 'LOSS', 'BREAKEVEN', 'MISSED', 'NO TRADE'];
export function processResultHtml(result, process, extra = '') {
  const viol = /VIOL/.test(process);
  return `<div class="p7-pr"><div><small>RESULT</small><b>${result}</b></div><div class="${viol ? 'is-no' : 'is-ok'}"><small>PROCESS</small><b>${process}</b></div>${extra}</div>`;
}
/**
 * trades: [{ name, facts: [...], chart?, result: '+2R WIN', answers: { outcome: 'WIN', process: 'VIOLATION', strategy: 'NOT USEFUL' }, why }]
 */
export function renderProcess(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide)}<div class="p7-proc"></div></div>`;
  const card = el.querySelector('.p7-card');
  const box = card.querySelector('.p7-proc');
  const STRAT = slide.strategyOptions || ['NOT ENOUGH INFORMATION', 'NOT USEFUL EVIDENCE OF PROPER EXECUTION', 'THE STRATEGY WORKS', 'THE STRATEGY IS BROKEN'];
  const go = (i) => {
    const trades = slide.trades;
    if (i >= trades.length) { principle(box, slide.punch); continueBtn(card, satisfy, slide.cta); return; }
    const t = trades[i];
    const tc = document.createElement('div');
    tc.className = 'p7-trade';
    tc.innerHTML = `<div class="p7-trade-h">${t.name}</div><ul>${t.facts.map((f) => `<li>${f}</li>`).join('')}</ul><div class="p7-trade-c"></div><div class="pl-asks"></div>`;
    box.appendChild(tc);
    if (t.chart) chartBlock(tc.querySelector('.p7-trade-c'), t.chart);
    const a = t.answers;
    const qs = [];
    if (a.outcome) qs.push({ prompt: 'OUTCOME?', options: OUTCOME_OPTS.filter((o) => ['WIN', 'LOSS'].includes(o) || o === a.outcome).map((o) => ({ label: o, correct: o === a.outcome, feedback: 'The outcome is just what happened to the money. Read it straight.' })) });
    if (a.process) qs.push({ prompt: 'PROCESS?', rcat: slide.rcat, options: [
      { label: 'FOLLOWED: valid process', correct: a.process === 'FOLLOWED', rinc: a.process === 'VIOLATION' ? 'excusedWinningViolation' : undefined, feedback: a.process === 'VIOLATION' ? 'The trade paid. Did the process? Look at the entry again.' : '' },
      { label: 'RULE VIOLATION', correct: a.process === 'VIOLATION', rinc: a.process === 'FOLLOWED' ? 'validLossAsViolation' : undefined, feedback: a.process === 'FOLLOWED' ? 'Every rule was followed. A loss isn’t automatically a mistake.' : '' },
    ] });
    if (a.strategy) qs.push({ prompt: 'STRATEGY CONCLUSION?', options: STRAT.map((o) => ({ label: o, correct: o.startsWith(a.strategy), feedback: 'One trade is one observation. Judge the strategy slowly, over a meaningful sample.' })) });
    let right = 0, tries = 0;
    runAsks(tc.querySelector('.pl-asks'), qs, helpers, () => {
      M.trackMind('processOutcomeTries', tries); M.trackMind('processOutcomeRight', right);
      M.recordJournal({ source: 'p7-practice', tradeOutcome: (a.outcome || '').toLowerCase(), processQuality: a.process === 'VIOLATION' ? 'violation' : 'followed', strategySampleTag: a.strategy || null, ruleViolations: t.violations || [] });
      tc.insertAdjacentHTML('beforeend', processResultHtml(t.result || a.outcome, a.process === 'VIOLATION' ? 'RULE VIOLATION' : 'FOLLOWED ✓', a.strategy ? `<div><small>STRATEGY</small><b>${a.strategy === 'NOT ENOUGH' ? 'NOT ENOUGH INFORMATION' : a.strategy}</b></div>` : ''));
      if (t.why) principle(tc, t.why, 'p7-note');
      setTimeout(() => go(i + 1), reduced() ? 0 : 500);
    }, { onFirst: (q, o, c) => { tries += 1; if (c) right += 1; } });
  };
  go(0);
}

/* ── p7_tally ──────────────────────────────────────────────────────────── */
export function renderTally(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-tally-card${slide.complete ? ' is-complete' : ''}">${head(slide)}
    ${slide.stamp ? `<div class="p7-stamp">${slide.stamp}</div>` : ''}
    <div class="p7-tally">${slide.rows.map(([k, v, tone], i) => `<div class="p7-tr is-${tone || 'ink'}" style="--d:${reduced() ? 0 : 0.3 + i * 0.5}s"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    ${slide.note ? `<div class="p7-note" style="--d:${reduced() ? 0 : 0.5 + slide.rows.length * 0.5}s">${slide.note}</div>` : ''}<div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  setTimeout(() => runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); }), reduced() ? 0 : 700 + slide.rows.length * 500);
}

/* ── p7_temp: emotional temperature ────────────────────────────────────── */
export function renderTemp(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Emotional temperature')}
    <div class="p7-temp">${M.TEMPERATURE.map((t) => `<div class="p7-temp-band is-${t.key}" data-k="${t.key}"><span>${t.dot}</span><b>${t.label}</b><div class="p7-temp-in"></div></div>`).join('')}</div>
    <p class="p7-fine">A self-observation tool. Not a diagnosis, not a score, and never a trade signal on its own.</p>
    <div class="p7-temp-q"></div><div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const q = card.querySelector('.p7-temp-q');
  const fb = card.querySelector('.tx-fb');
  const items = slide.items || [];
  const after = () => { q.innerHTML = ''; runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); }); };
  const show = (i) => {
    if (i >= items.length) { after(); return; }
    const it = items[i];
    q.innerHTML = `<div class="p7-bubble is-static"><span>${it.thought}</span></div><div class="p6-sort-btns">${M.TEMPERATURE.map((t) => `<button type="button" class="tx-mini" data-k="${t.key}">${t.dot} ${t.label}</button>`).join('')}</div>`;
    q.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.k === it.state;
      helpers.onPick?.({ prompt: `temp:${i}` }, { label: b.textContent }, ok);
      helpers.handleStreak?.(ok);
      if (!ok) { b.disabled = true; fb.innerHTML = it.why || `Could be. Most traders would read “${it.thought}” as ${M.tempMeta(it.state).label}.`; fb.className = 'tx-fb bad'; return; }
      fb.innerHTML = it.why ? `<b>✦</b> ${it.why}` : ''; fb.className = `tx-fb ${it.why ? 'good' : ''}`;
      card.querySelector(`.p7-temp-band[data-k="${it.state}"] .p7-temp-in`).insertAdjacentHTML('beforeend', `<span>“${it.thought}”</span>`);
      setTimeout(() => show(i + 1), reduced() ? 0 : 450);
    }));
  };
  show(0);
}

/* ── p7_state_card: the Trader State Card ──────────────────────────────── */
export function stateCardHtml(c, title = 'TRADER STATE CARD') {
  return `<div class="p7-state"><div class="p7-mx-h">${title}</div>${M.STATE_FIELDS.map((f) => `<div class="p7-state-row"><span>${f.label}</span><b>${c[f.key] || '·'}</b></div>`).join('')}</div>`;
}
export function renderStateCard(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Trader State Card')}
    ${slide.example ? `<div class="p7-state-ex">${stateCardHtml(slide.example, 'EXAMPLE')}</div>` : ''}
    <div class="pl-asks"></div><div class="p7-state-own" hidden></div></div>`;
  const card = el.querySelector('.p7-card');
  const own = card.querySelector('.p7-state-own');
  const startOwn = () => {
    if (!slide.own) { principle(card, slide.punch); continueBtn(card, satisfy, slide.cta); return; }
    own.hidden = false;
    const vals = {};
    own.innerHTML = `<div class="p7-mx-h">${slide.ownTitle || 'YOUR CARD · the state that pressures you most'}</div>${M.STATE_FIELDS.map((f) => `<div class="p7-sf" data-k="${f.key}"><small>${f.label}</small><div class="p7-chips">${f.options.map((o) => `<button type="button" class="tx-chip">${o}</button>`).join('')}</div></div>`).join('')}
      <button type="button" class="lw-continue-btn" disabled>Save my card →</button><div class="lw-reflect-saved" hidden>✓ Saved to your private Academy notes</div>`;
    const save = own.querySelector('.lw-continue-btn');
    own.querySelectorAll('.p7-sf').forEach((row) => row.querySelectorAll('.tx-chip').forEach((b) => b.addEventListener('click', () => {
      row.querySelectorAll('.tx-chip').forEach((x) => x.classList.remove('on')); b.classList.add('on');
      vals[row.dataset.k] = b.textContent;
      save.disabled = M.STATE_FIELDS.some((f) => !vals[f.key]);
    })));
    save.addEventListener('click', () => {
      M.saveStateCard(vals);
      save.disabled = true; own.querySelector('.lw-reflect-saved').hidden = false;
      principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
    });
  };
  runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, startOwn);
}

/* ── p7_seen: “YOU’VE SEEN THIS ONE BEFORE.” ───────────────────────────── */
const EMO_OPTS = [['fomo', 'FOMO'], ['fear', 'Fear'], ['greed', 'Greed / excitement'], ['revenge', 'Revenge / frustration'], ['overtrading', 'Boredom / urgency'], ['none', 'Nothing: it’s just the chart']];
export function renderSeen(el, slide, satisfy, helpers = {}) {
  let pat = null, theirs = false, pair = null;
  if (slide.source === 'trigger') {
    const all = triggerResponses();
    pair = all[all.length - 1] || null;
  } else {
    pat = M.priorPatterns()[0] || null;
    theirs = !!pat;
    if (!pat) pat = slide.fallback || { key: 'anticipation', rule: 'Wait for the close', emotionHint: 'fomo', line: 'A very common pattern: acting before Continuation when price starts moving quickly.' };
  }
  el.innerHTML = `<div class="lw-card p7-card p7-seen">${head(slide, 'Your practice history')}
    ${slide.source === 'trigger'
      ? (pair ? `<div class="p7-seen-h">YOU’VE SEEN THIS TRIGGER BEFORE.</div><p>Last time, <b>${pair.trigger}</b> created an urge to <b>${pair.behavior}</b>.</p><div class="p7-rule"><small>YOUR RULE SAYS</small><b>${pair.response}</b></div>`
        : `<div class="p7-seen-h">A TRIGGER WORTH PLANNING FOR</div><p>${slide.fallbackLine || 'A missed winner often creates an urge to chase the next one.'}</p>`)
      : `<div class="p7-seen-h">${theirs ? 'YOU’VE SEEN THIS ONE BEFORE.' : 'A PATTERN WORTH WATCHING'}</div><p>${pat.line}</p>${theirs ? '<p class="p7-fine">From your own Phase 6 practice. A mistake type, not a verdict.</p>' : '<p class="p7-fine">Not from your history yet. A pattern most traders meet.</p>'}
        <div class="p7-rule"><small>RULE AT RISK</small><b>${pat.rule}</b></div>`}
    <div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-seen');
  let qs = slide.asks;
  if (!qs && pat) qs = [{ prompt: 'WHAT EMOTION MIGHT BE PRESSURING THAT RULE?', recog: true, options: EMO_OPTS.map(([k, l]) => ({ label: l, correct: k === pat.emotionHint || (pat.emotionHint === 'overtrading' && k === 'overtrading'), feedback: k === 'none' ? 'The chart didn’t ask you to break the rule. Something else did.' : 'Possible. Which emotion pushes toward exactly that behavior?' })) }];
  if (!qs && pair) qs = [{ prompt: 'IT’S HAPPENING AGAIN. WHAT DOES YOUR RULE SAY?', rcat: 'response', options: [{ label: pair.response, correct: true, why: 'You decided this before the trigger came back. That’s the point.' }, { label: 'Make an exception this time', feedback: 'That’s the trigger talking.' }, { label: 'Decide in the moment', feedback: 'You already decided. Calmly. Use it.' }] }];
  runAsks(card.querySelector('.pl-asks'), qs || [], helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
}

/* ── p7_score: the end-of-lab review ───────────────────────────────────── */
export function renderScore(el, slide, satisfy) {
  const kind = slide.kind || 'mind';
  let rows, support, top = '';
  if (kind === 'rules') { const r = rulebookReview(); rows = r.rows; support = r.review; top = `<div class="p7-big-n"><b>${r.followed} / ${r.decisions}</b><small>RULE ADHERENCE · DECISIONS FOLLOWED</small></div>`; }
  else if (kind === 'env') { const r = envReview(); rows = r.rows; support = r.review; }
  else { const r = M.mindsetScore(); rows = r.rows; support = r.support; }
  el.innerHTML = `<div class="lw-card p6-review p7-score">${head({ kicker: slide.kicker || 'Your review', title: slide.title || 'What you actually did' })}
    ${top}<div class="p6-rv-rows">${rows.map(([l, v]) => `<div class="p6-rv"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    <p class="p6-rv-note">Observable decisions in this practice. Not a verdict on you, not a mindset score, and private to you.</p>
    ${support.length ? `<div class="sg-review-box"><div class="lw-eyebrow">What to practice next</div>${support.map((x) => `<p>${x.line}</p><a class="sg-review" href="${x.href}">${x.cta}</a>`).join('')}</div>`
      : `<div class="icc-principle">${slide.clean || 'Your feelings showed up. None of them got to rewrite the model.'}</div>`}</div>`;
  continueBtn(el.querySelector('.p7-score'), satisfy, slide.cta);
}

/* ── p7_transition: the Phase 8 hand-off ──────────────────────────────── */
/**
 * { old: ['LESSON', …], learned: ['concepts', …], pause: 'TRAINING COMPLETE.', prove: 'NOW PROVE YOU CAN USE IT.',
 *   flow: ['CASE FILE', …], reveal: { eyebrow, title, sub, mission }, close: [lines] }
 * The lesson structure fades out, the chart workspace expands, the capstone flow takes its place.
 */
export function renderTransition(el, slide, satisfy) {
  let d = 0.3;
  const at = (step = 0.6) => { const v = d; d += reduced() ? 0 : step; return reduced() ? 0 : v; };
  const old = (slide.old || []).map((o) => `<span style="--d:${at(0.35)}s">${o}</span>`).join('<i>→</i>');
  const fade = at(1.2);
  const learned = (slide.learned || []).map((l) => `<span style="--d:${at(0.28)}s">You’ve learned ${l}. ✓</span>`).join('');
  const lines = [slide.pause, slide.prove].filter(Boolean).map((l, i) => `<div class="p7-line is-big" style="--d:${at(i ? 1.0 : 1.4)}s">${l}</div>`).join('');
  const ws = at(0.8);
  const flow = (slide.flow || []).map((f) => `<span style="--d:${at(0.32)}s">${f}</span>`).join('<i>→</i>');
  const close = (slide.close || []).map((l) => `<div class="p7-line${/^<b>|^[A-Z0-9 .,’'!?:…“”🔥]+$/.test(l) ? ' is-big' : ''}" style="--d:${at(1.0)}s">${l}</div>`).join('');
  const r = slide.reveal || {};
  el.innerHTML = `<div class="lw-card p7-mono is-dark p7-trans">${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
    <div class="p7-tr-old" style="--f:${fade}s">${old}</div>
    <div class="p7-tr-learned">${learned}</div>
    ${lines}
    <div class="p7-tr-ws" style="--d:${ws}s"><div class="p7-tr-grid"></div><div class="p7-tr-flow">${flow}</div></div>
    ${close}
    <div class="p7-reveal" style="--d:${at(1.2)}s">${r.eyebrow ? `<small>${r.eyebrow}</small>` : ''}<b>${r.title || ''}</b>${r.sub ? `<span>${r.sub}</span>` : ''}${r.mission ? `<em>${r.mission}</em>` : ''}</div></div>`;
  const card = el.querySelector('.p7-trans');
  card.classList.add('p7-wait');
  const play = () => {
    card.classList.add('p7-play');
    if (satisfy) setTimeout(() => { if (card.isConnected) continueBtn(card, satisfy, slide.cta || 'Continue →'); }, reduced() ? 0 : d * 1000 + 300);
  };
  if ('IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.25 });
    io.observe(card);
  } else play();
}

/* ── p7_random ─────────────────────────────────────────────────────────── */
export function renderRandom(el, slide, satisfy, helpers = {}) {
  const vs = slide.variants;
  const pick = slide.variant ?? (typeof window !== 'undefined' && window.__p7Variant != null ? window.__p7Variant % vs.length : Math.floor(Math.random() * vs.length));
  const v = vs[pick];
  const r = SLIDE_RENDERERS[v.type];
  if (!r) { satisfy?.(); return; }
  r(el, { ...v, kicker: v.kicker ?? slide.kicker, title: v.title ?? slide.title, cta: slide.cta || v.cta }, satisfy, helpers);
}

/* ── p7_session: a continuous session ──────────────────────────────────── */
/**
 * { start: { kind: 'mind'|'rules'|'env', name }, hud: { trades, maxTrades, dailyR, temp, status },
 *   events: [{ title, skill, hud: {...}, slide }], review: 'mind'|'rules'|'env', endCard }
 */
export function renderSession(el, slide, satisfy, helpers = {}) {
  if (slide.start) {
    const { kind, name } = slide.start;
    if (kind === 'rules') startRulesSession(name); else if (kind === 'env') startEnvSession(name); else M.startMindSession(name);
  }
  const hud = { ...(slide.hud || {}) };
  el.innerHTML = `<div class="lw-card p7-card p7-sess">${head(slide, 'Trading session')}<div class="p7-hud"></div><div class="p7-sess-flow"></div></div>`;
  const card = el.querySelector('.p7-sess');
  const hudEl = card.querySelector('.p7-hud');
  const flow = card.querySelector('.p7-sess-flow');
  const drawHud = () => {
    const t = hud.temp ? M.tempMeta(hud.temp) : null;
    hudEl.innerHTML = [
      hud.time ? `<span>🕒 <b>${hud.time}</b></span>` : '',
      hud.maxTrades != null ? `<span><i>Trades</i> <b>${hud.trades || 0} / ${hud.maxTrades}</b></span>` : '',
      hud.dailyR != null ? `<span><i>Day</i> <b>${hud.dailyR > 0 ? '+' : ''}${hud.dailyR}R</b>${hud.dailyStop ? ` <small>stop ${hud.dailyStop}</small>` : ''}</span>` : '',
      t ? `<span><i>State</i> <b>${t.dot} ${t.label}</b></span>` : '',
      hud.status ? `<span class="p7-hud-st is-${hud.statusTone || 'ink'}"><b>${hud.status}</b></span>` : '',
    ].join('');
  };
  drawHud();
  const go = (i) => {
    const evs = slide.events;
    if (i >= evs.length) { end(); return; }
    const ev = evs[i];
    Object.assign(hud, ev.hud || {});
    drawHud();
    const st = document.createElement('div');
    st.className = 'p7-stage';
    st.innerHTML = `<div class="p7-stage-h">${ev.title || `Event ${i + 1}`}</div><div class="p7-stage-b"></div>`;
    flow.appendChild(st);
    st.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    const body = st.querySelector('.p7-stage-b');
    const r = SLIDE_RENDERERS[ev.slide.type];
    let first = null;
    const sub = { ...helpers, onPick(q, o, c, w) { helpers.onPick?.(q, o, c, w); if (first === null && (w === 0 || w === undefined)) first = c; }, handleStreak: helpers.handleStreak || (() => {}) };
    r(body, { ...ev.slide, kicker: ev.slide.kicker ?? '', cta: ev.slide.cta || 'Continue the session →' }, () => {
      body.querySelectorAll('.lw-continue-btn').forEach((b) => b.remove());
      if (ev.skill && first !== null) helpers.report?.(ev.skill, first);
      Object.assign(hud, ev.after || {});
      drawHud();
      go(i + 1);
    }, sub);
  };
  const end = () => {
    if (slide.endCard) principle(flow, slide.endCard);
    if (slide.review) {
      const box = document.createElement('div'); flow.appendChild(box);
      renderScore(box, { kind: slide.review, kicker: slide.reviewKicker, title: slide.reviewTitle, clean: slide.reviewClean }, null);
    }
    continueBtn(card, satisfy, slide.cta);
  };
  go(0);
}

export const MIND_RENDERERS = {
  p7_monologue: renderMonologue,
  p7_ask: renderAsk,
  p7_mirror: renderMirror,
  p7_split: renderSplit,
  p7_pause: renderPause,
  p7_loop: renderLoop,
  p7_map: renderMap,
  p7_baseline: renderBaseline,
  p7_process: renderProcess,
  p7_tally: renderTally,
  p7_temp: renderTemp,
  p7_state_card: renderStateCard,
  p7_seen: renderSeen,
  p7_score: renderScore,
  p7_random: renderRandom,
  p7_transition: renderTransition,
  p7_session: renderSession,
};
// A lab can open a fresh practice session on its first level (sessionStart + sessionKind).
Object.keys(MIND_RENDERERS).forEach((k) => {
  const r = MIND_RENDERERS[k];
  MIND_RENDERERS[k] = (el, slide, satisfy, helpers) => {
    if (slide.sessionStart) { const kind = slide.sessionKind || 'mind'; if (kind === 'rules') startRulesSession(slide.sessionStart); else if (kind === 'env') startEnvSession(slide.sessionStart); else M.startMindSession(slide.sessionStart); }
    return r(el, slide, satisfy, helpers);
  };
});
