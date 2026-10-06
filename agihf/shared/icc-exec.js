/**
 * icc-exec.js — A Girl & Her Futures™
 *
 * The Dayli ICC 1-Minute Entry Model™ execution engine (Phase 5, Section 13).
 * An EDUCATIONAL state machine on a 1-minute chart, not a trading signal.
 *
 *   exec_sim       the simulator: candles print one at a time (no future
 *                  candles in the DOM), a forming candle shows its wick before
 *                  it closes, the student marks PIL → I → C → C → planned entry →
 *                  retest → entry (or passes), and can never skip a step.
 *                  Powers lessons, the ICC Execution Lab and later practice.
 *   exec_drill     flash cards: VALID INDICATION / WICK ONLY / NO INDICATION
 *   exec_builder   drag four closes around the PIL to build a valid ICC
 *   exec_tree      the no-trade decision tree, walked on a real chart
 *   exec_classify  sort setups: CLEAN / VALID BUT MESSY / INCOMPLETE / INVALID / NO TRADE
 *
 * Scenario data (price units, oldest bar first):
 *   { dir: 'bullish' | 'bearish', tf: '1M', bars: [{ o, h, l, c, path? }],
 *     start: bars visible at the start,
 *     pil: 21004.25 (given)  or  pick: { candidates: [{ id, label, at, price, valid, why }], ask },
 *     context: [{ label, value, ok }]    higher-timeframe panel (TopDown hand-off)
 *     structure: '1M structure text', goal, pauses, events, outcome rules (see renderExec) }
 */

import { askQuestion } from './price-lab.js';
import { wrapGuide } from './guide.js';
import { supportCard, iccModelHtml } from './icc.js';
import { STEPS, EXEC, METHOD, evaluateDayliICC, closeSide, gate, trackICC, mistakeCount } from './icc-core.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 700, H = 320, PAD_L = 14, PAD_R = 92;
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => { if (v != null) n.setAttribute(k, v); });
  if (parent) parent.appendChild(n);
  return n;
}
function continueBtn(host, satisfy, label = 'Continue →') {
  if (host.querySelector(':scope > .lw-continue-btn')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'lw-continue-btn'; b.textContent = label;
  b.addEventListener('click', satisfy);
  host.appendChild(b);
}

/* ── The 1-minute chart ──────────────────────────────────────────────── */

/**
 * mountExecChart(container, { bars, total, pil, dir })
 *   draw(k, forming)  show bars[0..k) closed, and bars[k] forming up to price `forming.price`
 *   setPil(price, opts) / previewPil(price) / clearPreview()
 *   markers(list)     A / B / C / D candidate pills at swing bars
 *   tag(i, text, tone) a stage tag over bar i (I, C, C, RETEST, ENTRY)
 */
export function mountExecChart(container, cfg) {
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ex-svg', role: 'img', 'aria-label': cfg.label || '1-minute chart' });
  container.innerHTML = '';
  container.appendChild(svg);
  const grid = el('g', { class: 'ex-grid' }, svg);
  const pilG = el('g', { class: 'ex-pil' }, svg);
  const candG = el('g', { class: 'ex-cands' }, svg);
  const markG = el('g', { class: 'ex-marks' }, svg);
  const tagG = el('g', { class: 'ex-tags' }, svg);
  const live = el('g', { class: 'ex-live' }, svg);
  const total = Math.max(cfg.total || cfg.bars.length, 18);
  const step = (W - PAD_L - PAD_R) / total;
  const X = (i) => PAD_L + step * (i + 0.5);
  let lo = 0, hi = 1, pil = cfg.pil ?? null, preview = null;
  let shownK = 0;
  const Y = (p) => 18 + (hi - p) / (hi - lo) * (H - 36);

  // The price scale fits what's visible (plus the PIL): it never hints at future candles.
  function fit(k, formingBar) {
    const vis = cfg.bars.slice(0, k);
    if (formingBar) vis.push(formingBar);
    const ps = vis.flatMap((b) => [b.h, b.l]);
    if (pil != null) ps.push(pil);
    if (preview != null) ps.push(preview);
    (cfg.markersList || []).forEach((m) => { if (m.at < k) ps.push(m.price); });
    if (!ps.length) ps.push(cfg.bars[0].o);
    let a = Math.min(...ps), b = Math.max(...ps);
    const pad = Math.max((b - a) * 0.18, 2);
    lo = a - pad; hi = b + pad;
  }

  function candle(g, i, b, opts = {}) {
    const up = b.c >= b.o;
    const cls = `ex-c ${up ? 'up' : 'dn'}${opts.forming ? ' forming' : ''}${opts.dim ? ' dim' : ''}`;
    const cg = el('g', { class: cls, 'data-i': i }, g);
    const w = Math.max(3, Math.min(16, step * 0.62));
    el('line', { x1: X(i), x2: X(i), y1: Y(b.h), y2: Y(b.l), class: 'ex-wick' }, cg);
    const top = Y(Math.max(b.o, b.c)), bot = Y(Math.min(b.o, b.c));
    el('rect', { x: X(i) - w / 2, y: top, width: w, height: Math.max(1.6, bot - top), rx: 1.5, class: 'ex-body' }, cg);
    return cg;
  }

  function drawPil() {
    pilG.innerHTML = '';
    const line = (p, cls, text) => {
      const y = Y(p);
      el('line', { x1: PAD_L, x2: W - PAD_R + 6, y1: y, y2: y, class: cls }, pilG);
      const g = el('g', { class: `${cls}-tag` }, pilG);
      el('rect', { x: W - PAD_R + 8, y: y - 11, width: PAD_R - 10, height: 22, rx: 11 }, g);
      const t = el('text', { x: W - PAD_R / 2 + 3, y: y + 4, 'text-anchor': 'middle' }, g);
      t.textContent = text;
    };
    if (preview != null) line(preview, 'ex-prev', `${fmt(preview)}?`);
    if (pil != null) line(pil, 'ex-pilline', `PIL ${fmt(pil)}`);
  }

  const api = {
    svg, X, Y: (p) => Y(p), step,
    get pil() { return pil; },
    draw(k, forming) {
      shownK = k;
      fit(k, forming?.bar);
      grid.innerHTML = '';
      [0.25, 0.5, 0.75].forEach((f) => el('line', { x1: PAD_L, x2: W - PAD_R, y1: 18 + f * (H - 36), y2: 18 + f * (H - 36), class: 'ex-gl' }, grid));
      candG.innerHTML = '';
      for (let i = 0; i < k; i++) candle(candG, i, cfg.bars[i], { dim: cfg.dimBefore != null && i < cfg.dimBefore });
      live.innerHTML = '';
      if (forming?.bar) {
        candle(candG, k, forming.bar, { forming: true });
        const lx = X(k);
        const g = el('g', { class: 'ex-open' }, live);
        el('rect', { x: lx - 30, y: 2, width: 60, height: 15, rx: 7.5 }, g);
        const t = el('text', { x: lx, y: 13, 'text-anchor': 'middle' }, g);
        t.textContent = forming.label || 'OPEN';
      }
      drawPil();
      api.redrawMarks();
      api.redrawTags();
    },
    setPil(p) { pil = p; preview = null; api.draw(shownK); },
    previewPil(p) { preview = p; api.draw(shownK); },
    clearPreview() { preview = null; api.draw(shownK); },
    _marks: [], _tags: [],
    markers(list, onPick) { api._marks = list; api._onPick = onPick; cfg.markersList = list; api.redrawMarks(); },
    redrawMarks() {
      markG.innerHTML = '';
      api._marks.forEach((m) => {
        if (m.at >= shownK) return;
        const b = cfg.bars[m.at];
        const isHigh = m.price >= Math.max(b.o, b.c);
        const y = Y(m.price) + (isHigh ? -16 : 16);
        const g = el('g', { class: `ex-cand${m.state ? ` is-${m.state}` : ''}`, tabindex: 0, role: 'button', 'aria-label': `Swing ${m.label}` }, markG);
        el('circle', { cx: X(m.at), cy: Y(m.price), r: 4.5, class: 'ex-cand-dot' }, g);
        el('circle', { cx: X(m.at), cy: y, r: 10 }, g);
        const t = el('text', { x: X(m.at), y: y + 4, 'text-anchor': 'middle' }, g);
        t.textContent = m.label;
        el('rect', { x: X(m.at) - 16, y: Math.min(y, Y(m.price)) - 14, width: 32, height: Math.abs(y - Y(m.price)) + 28, class: 'ex-cand-hit' }, g);
        const pick = () => api._onPick?.(m);
        g.addEventListener('click', pick);
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    },
    // key keeps Correction's C and Continuation's C apart.
    tag(i, text, tone = 'ink', where = 'auto', key = null) {
      if (i == null || !cfg.bars[i]) return;
      const k = key || `${text}:${i}`;
      api._tags = api._tags.filter((t) => t.key !== k);
      api._tags.push({ i, text, tone, where, key: k });
      api.redrawTags();
    },
    clearTags() { api._tags = []; api.redrawTags(); },
    redrawTags() {
      tagG.innerHTML = '';
      api._tags.forEach((t, n) => {
        if (t.i >= shownK + 1) return;
        const b = cfg.bars[t.i];
        if (!b) return;
        const above = t.where === 'above' || (t.where === 'auto' && (n % 2 === 0));
        const y = above ? Y(b.h) - 14 - (t.stack || 0) : Y(b.l) + 16 + (t.stack || 0);
        const g = el('g', { class: `ex-tag ex-tag-${t.tone}` }, tagG);
        const w = Math.max(18, t.text.length * 6.6 + 12);
        el('rect', { x: X(t.i) - w / 2, y: y - 9, width: w, height: 18, rx: 9 }, g);
        const tx = el('text', { x: X(t.i), y: y + 3.6, 'text-anchor': 'middle' }, g);
        tx.textContent = t.text;
      });
    },
    flash() { svg.classList.remove('ex-shake'); void svg.getBoundingClientRect(); svg.classList.add('ex-shake'); },
  };
  return api;
}

/** Intrabar price path for a forming candle: explicit `path`, or open → far extreme → near extreme → close. */
function barPath(b) {
  if (b.path) return b.path;
  return b.c >= b.o ? [b.o, b.l, b.h, b.c] : [b.o, b.h, b.l, b.c];
}
function partialBar(b, f) {
  const path = barPath(b);
  const segs = path.length - 1, pos = Math.min(segs, f * segs), k = Math.floor(pos), r = pos - k;
  const price = k >= segs ? path[segs] : path[k] + (path[k + 1] - path[k]) * r;
  const seen = path.slice(0, k + 1).concat([price]);
  return { o: b.o, c: price, h: Math.max(...seen), l: Math.min(...seen) };
}

/* ── exec_sim ────────────────────────────────────────────────────────── */

const SKILL = {
  pil: 'PIL selection', indication: 'Candle-close discipline', correction: 'Correction recognition',
  continuation: 'Continuation patience', retest: 'Retest recognition', chase: 'No-chase discipline',
  reset: 'Setup reset recognition', pass: 'No-trade discipline',
};

/**
 * slide = {
 *   scenario,                              see top of file
 *   goal: 'pil' | 'indication' | 'correction' | 'continuation' | 'entry' | 'pass' | 'decision' | 'demo'
 *   pauses: [{ at, intrabar?, text, ask, resume }]   stop when bar `at` is forming (intrabar 0..1) or closed
 *   reassess: { at, text, options }        NEW STRUCTURAL INFORMATION event
 *   chase: { from }                        show the ENTER NOW? temptation from bar `from`
 *   passOk: true | { after }               passing is the right call (optionally only after bar `after`)
 *   end: { text, ask, card }
 *   demo: true                             auto-play and auto-mark (completion replay)
 * }
 */
export function renderExec(el0, slide, satisfy, helpers = {}) {
  const sc = slide.scenario;
  const dir = sc.dir || 'bullish';
  const go = dir === 'bearish' ? 'below' : 'above';
  const total = sc.bars.length;
  el0.innerHTML = `<div class="lw-card ex-card${slide.demo ? ' ex-demo' : ''}">
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Dayli ICC · 1M execution'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}
    <div class="ex-grid-wrap">
      <div class="ex-left">
        <div class="ex-chart-head"><b>${sc.tf || '1M'}</b><span>${sc.symbol || 'MNQ'}</span><span class="ex-dir ex-dir-${dir}">${dir === 'bearish' ? '↓ Bearish evaluation' : '↑ Bullish evaluation'}</span></div>
        <div class="ex-chart"></div>
        <div class="pr-bar ex-bar">
          <button type="button" class="pr-btn ex-play" data-a="play">▶ Play</button>
          <button type="button" class="pr-btn" data-a="next">Next candle ▶|</button>
          <button type="button" class="pr-btn" data-a="reset">⟲ Reset</button>
          <button type="button" class="pr-btn ex-speed" data-a="speed">1×</button>
          <span class="pr-count" aria-live="polite"></span>
        </div>
        <div class="pl-caption" aria-live="polite"></div>
      </div>
      <aside class="ex-panel">
        ${sc.context ? `<div class="ex-sec"><div class="ex-h">HTF context</div>${sc.context.map((c) => `<div class="ex-row"><span>${c.label}</span><b class="${c.ok === false ? 'is-no' : c.ok ? 'is-ok' : ''}">${c.value}</b></div>`).join('')}</div>` : ''}
        ${sc.structure ? `<div class="ex-sec"><div class="ex-h">1M structure</div><p class="ex-struct">${sc.structure}</p></div>` : ''}
        <div class="ex-sec"><div class="ex-h">Active PIL</div><div class="ex-pilval">·</div></div>
        <div class="ex-sec"><div class="ex-h">ICC timeline</div><div class="ex-tl"></div></div>
        <div class="ex-sec"><div class="ex-h">Setup status</div><div class="ex-status"></div></div>
        <div class="ex-sec ex-actions-sec"><div class="ex-h">Actions</div><div class="ex-actions"></div><div class="ex-fb" aria-live="polite"></div></div>
      </aside>
    </div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el0.querySelector('.ex-card');
  const chart = mountExecChart(card.querySelector('.ex-chart'), { bars: sc.bars, total: sc.slots || total, pil: null, dir, dimBefore: sc.dimBefore });
  const cap = card.querySelector('.pl-caption');
  wrapGuide(cap);
  const asks = card.querySelector('.pl-asks');
  const fb = card.querySelector('.ex-fb');
  const actionsEl = card.querySelector('.ex-actions');
  const tlEl = card.querySelector('.ex-tl');
  const statusEl = card.querySelector('.ex-status');
  const pilValEl = card.querySelector('.ex-pilval');
  const countEl = card.querySelector('.pr-count');
  const playBtn = card.querySelector('.ex-play');
  const speedBtn = card.querySelector('.ex-speed');

  let k = Math.min(sc.start ?? 6, total); // closed bars visible
  let forming = null; // { f, raf }
  let timer = null, speed = 1, blocked = false, finished = false;
  let pil = sc.pick ? null : sc.pil;
  const marks = { pil: !!pil };
  const firedPauses = new Set();
  let outcome = null; // 'entry' | 'missed' | 'pass' | 'chased' | 'replaced'
  let lastStatusNote = '';
  const stats = { mistakes: [], good: [] };

  const ev = () => evaluateDayliICC(sc.bars, { pil, dir }, k);
  const say = (html) => { if (!html) return; cap.innerHTML = html; cap.classList.add('show'); wrapGuide(cap); };
  const feedback = (html, good) => { fb.innerHTML = html; fb.className = `ex-fb show ${good ? 'good' : 'bad'}`; };

  function bonus(text = 'DISCIPLINE BONUS') {
    trackICC('discipline', true, { discipline: true, gp: 25 });
    const t = document.createElement('div');
    t.className = 'ex-bonus';
    t.innerHTML = `<b>+25 GP</b> ${text}`;
    card.querySelector('.ex-panel').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  function mistake(tag, skill) {
    stats.mistakes.push(skill);
    trackICC(tag, false);
    helpers.handleStreak?.(false);
    helpers.onPick?.({ prompt: `${slide.title || 'exec'}:${skill}` }, { label: tag }, false);
    supportCard(asks, tag, supportActions);
  }
  function good(skill, tag) {
    stats.good.push(skill);
    if (tag) trackICC(tag, true);
    helpers.handleStreak?.(true);
    helpers.onPick?.({ prompt: `${slide.title || 'exec'}:${skill}` }, { label: 'ok' }, true);
  }

  /* timeline + status */
  function timeline() {
    const e = ev();
    const order = ['pil', 'indication', 'correction', 'continuation', 'retest', 'entry'];
    const cur = order.find((s) => !marks[s]);
    tlEl.innerHTML = STEPS.map((s) => {
      const st = marks[s.key] ? 'done' : s.key === cur && !outcome ? 'current' : 'open';
      return `<div class="ex-step is-${st}" title="${s.q}"><i>${st === 'done' ? '✓' : st === 'current' ? '●' : '○'}</i><span>${s.short}</span></div>`;
    }).join('');
    pilValEl.innerHTML = pil != null ? `<b>${fmt(pil)}</b><small>1M · ${dir} evaluation</small>` : '<span class="ex-none">No PIL marked</span>';
    let st;
    if (outcome === 'entry') st = ['ENTRY AVAILABLE', 'ok'];
    else if (outcome === 'missed') st = ['SETUP VALID · ENTRY MISSED', 'warn'];
    else if (outcome === 'pass') st = [slide.passLabel || 'PASS · NO TRADE', 'ok'];
    else if (outcome === 'chased') st = ['YOU CHASED', 'bad'];
    else if (outcome === 'replaced') st = ['SETUP REPLACED · REASSESS', 'warn'];
    else if (!marks.pil) st = ['NO PIL', 'off'];
    else if (!marks.indication) st = ['WAITING FOR INDICATION', 'off'];
    else if (!marks.correction) st = ['INDICATION CONFIRMED · WAITING FOR CORRECTION', 'dev'];
    else if (!marks.continuation) st = ['CORRECTION CONFIRMED · CONTINUATION NOT CONFIRMED', 'dev'];
    else if (!marks.plan) st = ['CONTINUATION CONFIRMED · PLAN THE ENTRY', 'dev'];
    else if (!marks.retest) st = ['WAITING FOR RETEST', 'dev'];
    else st = ['RETEST · ENTRY AVAILABLE', 'ok'];
    statusEl.innerHTML = `<span class="ex-st ex-st-${st[1]}">${st[0]}</span>${lastStatusNote ? `<small>${lastStatusNote}</small>` : ''}`;
    void e;
  }

  /* actions: progressive, but I / C / C are always all visible so skipping can be blocked (and taught) */
  function actions() {
    if (slide.demo) { actionsEl.innerHTML = ''; return; }
    const btns = [];
    if (outcome && outcome !== 'missed') { actionsEl.innerHTML = ''; return; }
    if (!marks.pil && sc.pick) btns.push(['pilhint', 'Mark PIL: tap a swing on the chart', 'ghost']);
    if (marks.pil && !marks.continuation) {
      btns.push(['indication', marks.indication ? '✓ Indication' : 'Confirm Indication', marks.indication ? 'done' : '']);
      btns.push(['correction', marks.correction ? '✓ Correction' : 'Confirm Correction', marks.correction ? 'done' : '']);
      btns.push(['continuation', 'Confirm Continuation', '']);
    }
    if (marks.continuation && !marks.plan) btns.push(['plan', 'Place planned entry at PIL', 'gold']);
    if (marks.plan && !marks.retest && outcome !== 'missed') btns.push(['retest', 'Mark retest', '']);
    if (marks.retest && !marks.entry) btns.push(['entry', 'Execute entry', 'gold']);
    if (slide.chase && marks.continuation && !marks.retest && k > (slide.chase.from ?? 0)) btns.push(['chase', 'ENTER NOW?', 'tempt']);
    if (slide.reassessBtn) btns.push(['reassess', 'Reassess PIL', 'ghost']);
    btns.push(['pass', slide.passText || 'Pass / no trade', 'ghost']);
    actionsEl.innerHTML = btns.map(([a, l, c]) => `<button type="button" class="ex-act ${c ? `ex-act-${c}` : ''}" data-a="${a}" ${c === 'done' || a === 'pilhint' ? 'disabled' : ''}>${l}</button>`).join('');
  }

  function act(a) {
    if (blocked && a !== 'pass') return;
    const e = ev();
    const formingNow = !!forming;
    if (['indication', 'correction', 'continuation', 'retest', 'entry'].includes(a)) {
      const g = gate(a, marks, e, { forming: formingNow && a === 'indication' });
      if (g) {
        const missingName = STEPS.find((s) => s.key === g.missing)?.name || g.missing;
        const skipped = g.missing !== a;
        const tag = a === 'indication' ? (formingNow || wickNow(e) ? 'wick-counted' : 'anticipated-indication') : a === 'correction' ? 'anticipated-correction' : a === 'continuation' ? 'anticipated-continuation' : a === 'retest' ? 'anticipated-retest' : 'early-entry';
        feedback(`<strong>${skipped ? 'PRICE HASN’T EARNED THAT STEP YET.' : formingNow && a === 'indication' ? 'CANDLE IS STILL OPEN.' : 'YOU ANTICIPATED.'}</strong> ${skipped ? `${missingName} comes first.` : g.why}`, false);
        chart.flash();
        mistake(tag, SKILL[a] || SKILL.indication);
        return;
      }
      marks[a] = true;
      const ix = a === 'retest' ? e.firstRetest : e.events[a];
      const label = { indication: 'I', correction: 'C', continuation: 'C', retest: 'RETEST', entry: 'ENTRY' }[a];
      chart.tag(a === 'entry' ? e.firstRetest : ix, label, a === 'correction' ? 'purple' : a === 'entry' ? 'gold' : 'ink', a === 'correction' || a === 'retest' ? (go === 'above' ? 'below' : 'above') : (go === 'above' ? 'above' : 'below'));
      const lines = {
        indication: `<strong>INDICATION ✓</strong> The 1M candle <b>closed</b> ${go} the PIL.`,
        correction: '<strong>CORRECTION ✓</strong> Good. Not “uh oh”. Correction is part of the model.',
        continuation: '<strong>CONTINUATION ✓</strong> Price closed back through in the original direction. Now: wait for price to come back to you.',
        retest: '<strong>FIRST RETEST ✓</strong> Price returned to the PIL.',
        entry: '<strong>ENTRY ✓</strong> The execution point the model created. Not where you hoped price would go.',
      };
      feedback(lines[a], true);
      good(SKILL[a], a === 'indication' ? 'candle-close' : a);
      if (a === 'entry') { outcome = 'entry'; done(); }
      refresh();
      checkGoal(a);
      return;
    }
    if (a === 'plan') {
      marks.plan = true;
      feedback(`<strong>PLANNED ENTRY: PIL ${fmt(pil)}</strong> ${dir} · sequence confirmed · waiting for the retest. Now you do nothing.`, true);
      good(SKILL.retest);
      refresh(); checkGoal('plan');
      return;
    }
    if (a === 'chase') {
      outcome = 'chased';
      feedback('<strong>YOU CHASED.</strong> Your plan was the retest. Price moving without you doesn’t create a new rule.', false);
      mistake('chased', SKILL.chase);
      refresh();
      setTimeout(() => { outcome = null; refresh(); }, 2600);
      return;
    }
    if (a === 'pass') {
      const ok = passOk();
      if (ok) {
        outcome = 'pass';
        feedback(slide.passWhy || '<strong>PASS ✓</strong> The model didn’t complete. Not trading is a decision too.', true);
        good(SKILL.pass, 'no-trade');
        bonus();
        refresh(); done();
      } else {
        feedback(slide.passMiss || 'Not yet. Price is still building this setup. Watch what it does next.', false);
        mistake('early-pass', SKILL.pass);
      }
      return;
    }
    if (a === 'reassess') {
      const ok = slide.reassessOk ? k > slide.reassessOk : false;
      feedback(ok ? '✓ New structure. Reassess the PIL.' : 'Nothing structural has changed yet.', ok);
    }
  }
  function wickNow(e) {
    const b = sc.bars[k - 1];
    return b && !marks.indication && pil != null && closeSide(b, pil) !== go && (go === 'above' ? b.h > pil : b.l < pil);
  }
  function passOk() {
    if (slide.passOk === true) return true;
    if (slide.passOk && slide.passOk.after != null) return k > slide.passOk.after;
    if (outcome === 'missed') return true;
    return false;
  }

  /* PIL picking */
  function setupPick() {
    const cands = sc.pick.candidates.map((c) => ({ ...c }));
    chart.markers(cands, (m) => {
      if (marks.pil && !sc.pick.allowChange) return;
      cands.forEach((c) => { c.state = c === m ? 'sel' : null; });
      chart.markers(cands, chart._onPick);
      chart.previewPil(m.price);
      feedback(`Swing <b>${m.label}</b> · ${fmt(m.price)} <span class="ex-pick-btns"><button type="button" class="ex-mini ex-ok">Confirm PIL</button><button type="button" class="ex-mini ex-no">Cancel</button></span>`, true);
      fb.querySelector('.ex-no').addEventListener('click', () => { cands.forEach((c) => { c.state = null; }); chart.markers(cands, chart._onPick); chart.clearPreview(); fb.className = 'ex-fb'; });
      fb.querySelector('.ex-ok').addEventListener('click', () => {
        if (!m.valid) {
          chart.clearPreview();
          m.state = 'bad'; chart.markers(cands, chart._onPick);
          feedback(`<strong>Not this one.</strong> ${m.why || 'Is this the level price actually needs to prove itself through?'}`, false);
          mistake(m.mistake || 'tiny-pil', SKILL.pil);
          return;
        }
        pil = m.price; marks.pil = true;
        m.state = 'ok';
        chart.markers(cands.filter((c) => c === m), chart._onPick);
        chart.setPil(pil);
        feedback(`<strong>PIL ✓</strong> ${m.why || 'Structure created the PIL.'}`, true);
        good(SKILL.pil, 'pil-selection');
        refresh();
        if (sc.pick.ask) { blocked = true; askQuestion(asks, sc.pick.ask, wrapHelpers(), () => { blocked = false; checkGoal('pil'); }); } else checkGoal('pil');
      });
    });
  }

  function wrapHelpers() {
    return { ...helpers, onPick(q, o, correct, w) { helpers.onPick?.(q, o, correct, w); if (o.mistake) { trackICC(o.mistake, correct); if (!correct) supportCard(asks, o.mistake, supportActions); } if (o.track) trackICC(o.track, correct); if (correct && o.discipline) bonus(o.discipline === true ? 'DISCIPLINE BONUS' : o.discipline); } };
  }

  const supportActions = {
    closes: () => { say('Read the <b>close</b>, not the wick: where the body finished relative to the PIL.'); card.classList.add('ex-show-closes'); },
    model: () => { const m = document.createElement('div'); m.className = 'ex-modal-model'; m.innerHTML = iccModelHtml({}); asks.appendChild(m); },
    retest: () => say('The plan is the <b>PIL retest</b>. If price never comes back, it’s a missed trade, not a new rule.'),
    structure: () => say(sc.structure || 'Look at what price is building on the 1M.'),
    clean: () => say('Clean: one obvious PIL, clear closes, ordered sequence, an identifiable retest.'),
  };

  /* playback */
  function refresh() { chart.draw(k, forming ? { bar: partialBar(sc.bars[k], forming.f), label: forming.label } : null); timeline(); actions(); countEl.textContent = `${sc.tf || '1M'} · candle ${k} / ${total}`; }
  function stopPlay() { clearTimeout(timer); timer = null; playBtn.textContent = '▶ Play'; }
  function nextCandle(auto = false) {
    // The slide was left mid-playback: stop quietly.
    if (!card.isConnected) { stopPlay(); return; }
    if (blocked || forming) return;
    if (k >= total) { endOfData(); return; }
    const dur = (reduced() ? 120 : 1200) / speed;
    const t0 = performance.now();
    const pz = (slide.pauses || []).find((p) => p.at === k && p.intrabar != null && !firedPauses.has(p));
    forming = { f: 0, label: 'OPEN · 0:59' };
    const tick = (now) => {
      if (!card.isConnected) { forming = null; stopPlay(); return; }
      const f = Math.min(1, (now - t0) / dur);
      forming.f = f;
      forming.label = `OPEN · 0:${String(Math.max(0, Math.round(59 * (1 - f)))).padStart(2, '0')}`;
      if (pz && f >= pz.intrabar) { firedPauses.add(pz); refresh(); stopPlay(); pauseAt(pz, () => finishBar(auto)); return; }
      refresh();
      if (f < 1) forming.raf = requestAnimationFrame(tick); else finishBar(auto);
    };
    forming.raf = requestAnimationFrame(tick);
  }
  function finishBar(auto) {
    forming = null;
    k += 1;
    refresh();
    afterClose();
    if (auto && timer !== null && !blocked && !finished) timer = setTimeout(() => nextCandle(true), 380 / speed);
  }
  function afterClose() {
    const e = ev();
    // A missed first retest: the setup was valid; the entry was missed.
    if (marks.continuation && !marks.retest && e.firstRetest != null && k > e.firstRetest + (slide.retestGrace ?? 1) && outcome == null && !slide.demo) {
      outcome = 'missed';
      lastStatusNote = 'A missed trade is not a bad trade. It’s just a trade you didn’t get.';
      say(slide.missedText || '<strong>The first retest came and went.</strong> SETUP VALID · ENTRY MISSED. Don’t chase.');
      trackICC('missed-trade-seen', true);
      refresh();
    }
    if (slide.demo) demoStep(e);
    const pz = (slide.pauses || []).find((p) => p.at === k - 1 && p.intrabar == null && !firedPauses.has(p));
    if (pz) { firedPauses.add(pz); stopPlay(); pauseAt(pz); return; }
    if (slide.reassess && k - 1 === slide.reassess.at && !firedPauses.has(slide.reassess)) { firedPauses.add(slide.reassess); stopPlay(); reassessEvent(); return; }
    if (k >= total) endOfData();
  }
  function pauseAt(p, then) {
    blocked = true;
    say(p.text);
    if (p.newPil != null) { pil = p.newPil; chart.setPil(pil); }
    if (!p.ask) { blocked = false; then?.(); return; }
    askQuestion(asks, p.ask, wrapHelpers(), () => {
      blocked = false;
      if (p.after) say(p.after);
      if (then) then();
      else if (p.resume) { timer = 1; playBtn.textContent = '❚❚ Pause'; setTimeout(() => nextCandle(true), 600); }
      if (p.goal) done();
    });
  }
  function reassessEvent() {
    const r = slide.reassess;
    blocked = true;
    const box = document.createElement('div');
    box.className = 'ex-event';
    box.innerHTML = `<div class="ex-event-h">◆ NEW STRUCTURAL INFORMATION</div><p>${r.text}</p>`;
    asks.appendChild(box);
    askQuestion(asks, r.ask || { prompt: 'What now?', options: [
      { label: 'Keep waiting for the old PIL', mistake: 'stale-pil', feedback: 'The chart kept building while you kept waiting.' },
      { label: 'Reassess the current structure / PIL', correct: true, why: 'Reassess. Not “a new swing always cancels”: just look again.', track: 'new-swing-reassessment' },
      { label: 'Cancel everything, every new swing kills a setup', feedback: 'Not automatically. Reassess what the new swing changed.' },
    ] }, wrapHelpers(), (o) => {
      blocked = false;
      if (r.newPil != null) { pil = r.newPil; chart.clearTags(); Object.keys(marks).forEach((m) => { marks[m] = false; }); marks.pil = true; chart.setPil(pil); lastStatusNote = 'New PIL. The sequence starts over from here.'; }
      if (r.replace) { outcome = 'replaced'; }
      refresh();
      if (r.done) { done(); return; }
      if (r.resume !== false) { timer = 1; playBtn.textContent = '❚❚ Pause'; setTimeout(() => nextCandle(true), 600); }
      void o;
    });
  }
  function endOfData() {
    stopPlay();
    if (finished) return;
    if (slide.demo) { done(); return; }
    if (slide.goal === 'pass' || slide.goal === 'decision') {
      if (!outcome) say(slide.endHint || 'That’s all the price we have. What’s your call?');
      return;
    }
    if (outcome === 'missed' && slide.goal === 'missed') { done(); return; }
    if (!goalMet()) say(slide.endHint || 'That’s all the price we have. Check your timeline: did you confirm every step price actually earned?');
  }

  /* goals */
  function goalMet() {
    const gl = slide.goal;
    if (!gl) return false;
    if (gl === 'pil') return marks.pil;
    if (gl === 'plan') return marks.plan;
    if (['indication', 'correction', 'continuation', 'retest', 'entry'].includes(gl)) return marks[gl];
    if (gl === 'missed') return outcome === 'missed';
    if (gl === 'pass') return outcome === 'pass';
    return false;
  }
  function checkGoal() { if (!finished && goalMet()) done(); }
  function done() {
    if (finished) return;
    finished = true;
    stopPlay();
    const e = slide.end || {};
    if (e.text) say(e.text);
    if (e.card) { const c = document.createElement('div'); c.className = 'icc-principle'; c.innerHTML = e.card; asks.appendChild(c); }
    const fin = () => continueBtn(card, satisfy, slide.cta || 'Continue →');
    if (e.ask) askQuestion(asks, e.ask, wrapHelpers(), fin); else fin();
  }

  /* demo: the model plays itself (completion replay) */
  function demoStep(e) {
    const order = ['indication', 'correction', 'continuation'];
    order.forEach((s) => {
      if (!marks[s] && e.events[s] != null && order.slice(0, order.indexOf(s)).every((x) => marks[x])) {
        marks[s] = true;
        chart.tag(e.events[s], s === 'indication' ? 'I' : 'C', s === 'correction' ? 'purple' : 'ink', s === 'correction' ? (go === 'above' ? 'below' : 'above') : (go === 'above' ? 'above' : 'below'));
        say({ indication: 'Candle closes through. <b>INDICATION ✓</b>', correction: 'Close back. <b>CORRECTION ✓</b>', continuation: 'Close through. <b>CONTINUATION ✓</b>' }[s]);
      }
    });
    if (marks.continuation && !marks.plan) { marks.plan = true; }
    if (marks.continuation && !marks.retest && e.firstRetest != null) {
      marks.retest = true; marks.entry = true; outcome = 'entry';
      chart.tag(e.firstRetest, 'RETEST', 'ink', go === 'above' ? 'below' : 'above');
      say('Price leaves. Returns. <b>RETEST ✓</b> · <b>ENTRY AVAILABLE.</b>');
      refresh();
      setTimeout(() => { card.classList.add('ex-freeze'); done(); }, reduced() ? 0 : 1400);
    }
  }

  /* controls */
  card.querySelector('.ex-bar').addEventListener('click', (ev0) => {
    const a = ev0.target.closest('button')?.dataset.a;
    if (a === 'play') {
      if (timer !== null) { stopPlay(); return; }
      if (k >= total) return;
      timer = 1; playBtn.textContent = '❚❚ Pause';
      nextCandle(true);
    } else if (a === 'next') { stopPlay(); nextCandle(false); }
    else if (a === 'reset') {
      stopPlay(); if (forming?.raf) cancelAnimationFrame(forming.raf);
      forming = null; k = Math.min(sc.start ?? 6, total); outcome = null; finished = false; blocked = false; lastStatusNote = '';
      Object.keys(marks).forEach((m) => { marks[m] = false; });
      pil = sc.pick ? null : sc.pil; marks.pil = !!pil;
      firedPauses.clear(); asks.innerHTML = ''; fb.className = 'ex-fb'; cap.classList.remove('show');
      card.querySelectorAll(':scope > .lw-continue-btn').forEach((b) => b.remove());
      chart.clearTags(); chart.setPil(pil ?? null);
      if (sc.pick) setupPick();
      refresh();
    } else if (a === 'speed') { speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1; speedBtn.textContent = `${speed}×`; }
  });
  actionsEl.addEventListener('click', (ev0) => { const b = ev0.target.closest('.ex-act'); if (b && !b.disabled) act(b.dataset.a); });

  if (pil != null) chart.setPil(pil);
  if (sc.pick) setupPick();
  // Start mid-setup: steps price already earned before the scenario opens.
  if (slide.preMarks && pil != null) {
    const e0 = ev();
    slide.preMarks.forEach((m) => {
      marks[m] = true;
      const ix = m === 'retest' ? e0.firstRetest : e0.events[m];
      if (ix != null) chart.tag(ix, { indication: 'I', correction: 'C', continuation: 'C', retest: 'RETEST' }[m] || m, m === 'correction' ? 'purple' : 'ink', m === 'correction' || m === 'retest' ? (go === 'above' ? 'below' : 'above') : (go === 'above' ? 'above' : 'below'));
    });
  }
  if (slide.presetOutcome) { outcome = slide.presetOutcome; if (outcome === 'missed') lastStatusNote = 'A missed trade is not a bad trade. It’s just a trade you didn’t get.'; }
  refresh();
  if (slide.intro) say(slide.intro);
  if (slide.startAsk) {
    blocked = true;
    const qs = [].concat(slide.startAsk);
    const run = (j) => { if (j >= qs.length) { blocked = false; if (slide.goal === 'asks') done(); return; } askQuestion(asks, qs[j], wrapHelpers(), () => run(j + 1)); };
    run(0);
  }
  if (slide.demo) { timer = 1; setTimeout(() => nextCandle(true), 700); }
}

/* ── exec_drill: indication or not? ─────────────────────────────────── */

export function renderDrill(el0, slide, satisfy, helpers = {}) {
  const items = slide.items || [];
  const opts = slide.options || [{ key: 'valid', label: 'Valid indication' }, { key: 'wick', label: 'Wick only' }, { key: 'none', label: 'No indication' }];
  el0.innerHTML = `<div class="lw-card ex-drill">
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Speed drill'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    <div class="ex-drill-top"><span class="ex-drill-n"></span><span class="ex-drill-acc"></span></div>
    <div class="ex-drill-chart"></div>
    <div class="ex-drill-opts">${opts.map((o) => `<button type="button" class="ex-act" data-v="${o.key}">${o.label}</button>`).join('')}</div>
    <div class="ex-fb" aria-live="polite"></div>
  </div>`;
  const card = el0.querySelector('.ex-drill');
  const fb = card.querySelector('.ex-fb');
  let i = 0, right = 0, tries = 0, t0 = 0, locked = false;
  const times = [];
  function show() {
    const it = items[i];
    card.querySelector('.ex-drill-n').textContent = `${i + 1} / ${items.length}`;
    const ch = mountExecChart(card.querySelector('.ex-drill-chart'), { bars: it.bars, total: Math.max(8, it.bars.length + 2), pil: it.pil, label: 'Drill candle' });
    ch.draw(it.bars.length);
    fb.className = 'ex-fb';
    locked = false;
    card.querySelectorAll('.ex-act').forEach((b) => { b.disabled = false; b.classList.remove('ok', 'no'); });
    t0 = performance.now();
  }
  card.querySelector('.ex-drill-opts').addEventListener('click', (e) => {
    const b = e.target.closest('.ex-act');
    if (!b || locked || b.disabled) return;
    const it = items[i];
    const ok = b.dataset.v === it.answer;
    tries += 1;
    helpers.handleStreak?.(ok);
    helpers.onPick?.({ prompt: `drill ${i}` }, { label: b.textContent }, ok);
    trackICC(it.answer === 'wick' ? 'wick-counted' : 'candle-close', ok);
    if (ok) {
      right += 1; locked = true; times.push(Math.round(performance.now() - t0));
      b.classList.add('ok');
      fb.innerHTML = `✦ ${it.why || ''}`; fb.className = 'ex-fb show good';
      card.querySelector('.ex-drill-acc').textContent = `Accuracy ${Math.round((right / tries) * 100)}%`;
      setTimeout(() => {
        i += 1;
        if (i < items.length) show();
        else {
          try { localStorage.setItem(`aghf_icc_drill:${slide.save || 'drill'}`, JSON.stringify({ accuracy: Math.round((right / tries) * 100), avgMs: Math.round(times.reduce((a, x) => a + x, 0) / times.length), at: Date.now() })); } catch { /* storage blocked */ }
          fb.innerHTML = `✦ Drill complete · ${Math.round((right / tries) * 100)}% accuracy. Accuracy first. Speed comes from reading closes, not guessing.`;
          fb.className = 'ex-fb show good';
          continueBtn(card, satisfy);
        }
      }, reduced() ? 300 : 1300);
    } else {
      b.classList.add('no'); b.disabled = true;
      fb.innerHTML = it.miss || (it.answer === 'wick' ? 'Read the CLOSE. The wick traveled; the body didn’t finish there.' : 'Where did the candle close relative to the PIL?');
      fb.className = 'ex-fb show bad';
    }
  });
  show();
}

/* ── exec_builder: build the candle-close sequence ──────────────────── */

export function renderBuilder(el0, slide, satisfy, helpers = {}) {
  const tasks = slide.tasks || [{ dir: 'bullish' }, { dir: 'bearish' }];
  const names = ['Start', 'Indication close', 'Correction close', 'Continuation close'];
  el0.innerHTML = `<div class="lw-card ex-builder">
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Candle close builder'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    <div class="ex-b-task"></div>
    <div class="ex-b-stage"><div class="ex-b-pil"><span>PIL</span></div>${names.map((n, i) => `<div class="ex-b-col" data-i="${i}"><button type="button" class="ex-b-up" aria-label="Move ${n} above the PIL">▲</button><div class="ex-b-track"><div class="ex-b-candle" data-pos="${i % 2 ? 'below' : 'above'}"></div></div><button type="button" class="ex-b-dn" aria-label="Move ${n} below the PIL">▼</button><small>${n}</small></div>`).join('')}</div>
    <div class="ex-b-seq"></div>
    <button type="button" class="ex-act ex-act-gold ex-b-check">Check my sequence</button>
    <div class="ex-fb" aria-live="polite"></div>
  </div>`;
  const card = el0.querySelector('.ex-builder');
  const fb = card.querySelector('.ex-fb');
  let t = 0;
  const cols = [...card.querySelectorAll('.ex-b-col')];
  function setTask() {
    const d = tasks[t].dir;
    card.querySelector('.ex-b-task').innerHTML = `Build a valid <b class="ex-dir-${d}">${d.toUpperCase()}</b> ICC. Move each close above or below the PIL.`;
    // Start every close on the same side so the answer is never pre-built.
    cols.forEach((c) => { c.querySelector('.ex-b-candle').dataset.pos = d === 'bullish' ? 'above' : 'below'; });
    seq();
    fb.className = 'ex-fb';
  }
  function seq() {
    card.querySelector('.ex-b-seq').innerHTML = cols.map((c) => `<span>${c.querySelector('.ex-b-candle').dataset.pos.toUpperCase()}</span>`).join('<i>→</i>');
  }
  cols.forEach((c) => {
    c.querySelector('.ex-b-up').addEventListener('click', () => { c.querySelector('.ex-b-candle').dataset.pos = 'above'; seq(); });
    c.querySelector('.ex-b-dn').addEventListener('click', () => { c.querySelector('.ex-b-candle').dataset.pos = 'below'; seq(); });
    c.querySelector('.ex-b-candle').addEventListener('click', (e) => { const n = e.currentTarget; n.dataset.pos = n.dataset.pos === 'above' ? 'below' : 'above'; seq(); });
  });
  card.querySelector('.ex-b-check').addEventListener('click', () => {
    const d = tasks[t].dir;
    const want = d === 'bullish' ? ['below', 'above', 'below', 'above'] : ['above', 'below', 'above', 'below'];
    const got = cols.map((c) => c.querySelector('.ex-b-candle').dataset.pos);
    const ok = want.every((w, i) => w === got[i]);
    helpers.handleStreak?.(ok);
    helpers.onPick?.({ prompt: `builder ${d}` }, { label: got.join('-') }, ok);
    trackICC('sequence-order', ok);
    if (ok) {
      fb.innerHTML = `✦ <strong>${want.map((w) => w.toUpperCase()).join(' → ')}</strong>. All three closes, in order. That’s a ${d} ICC.`;
      fb.className = 'ex-fb show good';
      t += 1;
      if (t < tasks.length) setTimeout(setTask, reduced() ? 300 : 1600);
      else { fb.innerHTML += '<br><b>All three or no ICC.</b> Rules remove the need to negotiate with the chart. 😂'; continueBtn(card, satisfy); }
    } else {
      const bad = got.findIndex((g, i) => g !== want[i]);
      fb.innerHTML = `Not a valid ${d} ICC. Check the <b>${names[bad].toLowerCase()}</b>: for ${d} it must be ${want[bad].toUpperCase()} the PIL. No “basically”, no “close enough”.`;
      fb.className = 'ex-fb show bad';
    }
  });
  setTask();
}

/* ── exec_tree: when there is no trade ──────────────────────────────── */

export function renderTree(el0, slide, satisfy, helpers = {}) {
  const nodes = slide.nodes || [
    { q: 'Clear PIL?', no: 'NO TRADE.' },
    { q: 'Valid indication close?', no: 'WAIT / NO TRADE.' },
    { q: 'Valid correction?', no: 'WAIT.' },
    { q: 'Valid continuation?', no: 'WAIT.' },
    { q: 'Valid retest?', no: 'WAIT / MISSED TRADE.' },
    { q: 'Setup still active?', no: 'PASS.' },
  ];
  const answers = slide.answers || nodes.map(() => 'yes');
  el0.innerHTML = `<div class="lw-card ex-tree">
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Decision tree'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}
    ${slide.scenario ? '<div class="ex-tree-chart"></div>' : ''}
    <div class="ex-tree-nodes">${nodes.map((n, i) => `<div class="ex-node" data-i="${i}"><div class="ex-node-q">${n.q}</div><div class="ex-node-btns"><button type="button" class="ex-mini" data-v="yes">Yes</button><button type="button" class="ex-mini" data-v="no">No</button></div><div class="ex-node-no">↳ ${n.no}</div></div>`).join('<div class="ex-node-arrow">↓ yes</div>')}
      <div class="ex-node ex-node-end"><b>ENTRY AVAILABLE.</b></div></div>
    <div class="ex-fb" aria-live="polite"></div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el0.querySelector('.ex-tree');
  if (slide.scenario) {
    const ch = mountExecChart(card.querySelector('.ex-tree-chart'), { bars: slide.scenario.bars, total: slide.scenario.bars.length + 2, pil: slide.scenario.pil, label: 'Scenario' });
    ch.draw(slide.scenario.bars.length);
    (slide.scenario.tags || []).forEach((t) => ch.tag(t.i, t.text, t.tone || 'ink', t.where || 'above'));
  }
  const fb = card.querySelector('.ex-fb');
  const nodeEls = [...card.querySelectorAll('.ex-node[data-i]')];
  let cur = 0;
  const activate = () => nodeEls.forEach((n, i) => n.classList.toggle('is-cur', i === cur));
  activate();
  card.querySelector('.ex-tree-nodes').addEventListener('click', (e) => {
    const b = e.target.closest('.ex-mini');
    if (!b) return;
    const n = b.closest('.ex-node');
    if (+n.dataset.i !== cur) return;
    const ok = b.dataset.v === answers[cur];
    helpers.handleStreak?.(ok);
    helpers.onPick?.({ prompt: nodes[cur].q }, { label: b.textContent }, ok);
    trackICC('no-trade', ok);
    if (!ok) { fb.innerHTML = slide.miss?.[cur] || 'Look at the chart again. What has price actually done?'; fb.className = 'ex-fb show bad'; b.classList.add('no'); return; }
    n.classList.add(b.dataset.v === 'yes' ? 'is-yes' : 'is-stop');
    fb.className = 'ex-fb';
    if (b.dataset.v === 'no') {
      card.querySelector('.ex-tree-nodes').classList.add('is-stopped');
      fb.innerHTML = `<strong>${nodes[cur].no}</strong> ${slide.stopWhy || 'Has price actually earned my entry? No. Wait.'}`;
      fb.className = 'ex-fb show good';
      if (slide.disciplineBonus) trackICC('discipline', true, { discipline: true, gp: 25 });
      finish();
      return;
    }
    cur += 1;
    if (cur >= nodes.length) { card.querySelector('.ex-node-end').classList.add('is-yes'); fb.innerHTML = '<strong>ENTRY AVAILABLE.</strong> Every step was earned.'; fb.className = 'ex-fb show good'; finish(); return; }
    activate();
  });
  function finish() {
    const asks = card.querySelector('.pl-asks');
    if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; asks.appendChild(p); }
    continueBtn(card, satisfy);
  }
}

/* ── exec_classify: clean / messy / incomplete / invalid / no trade ─── */

export function renderExecClassify(el0, slide, satisfy, helpers = {}) {
  const items = slide.items || [];
  const options = slide.options || [
    { key: 'clean', label: 'Valid + clean' }, { key: 'messy', label: 'Valid but messy' },
    { key: 'incomplete', label: 'Incomplete' }, { key: 'invalid', label: 'Invalid' }, { key: 'none', label: 'No trade' },
  ];
  el0.innerHTML = `<div class="lw-card ex-cls">
    ${slide.kicker === '' ? '' : `<div class="lw-eyebrow">${slide.kicker || 'Clean or messy?'}</div>`}
    ${slide.title ? `<h2>${slide.title}</h2>` : ''}
    ${slide.body ? `<p class="icc-body">${slide.body}</p>` : ''}
    <div class="icc-cls-grid">${items.map((it, i) => `<div class="icc-cls" data-i="${i}"><div class="icc-cls-top"><b>${it.label}</b>${it.caption ? `<small>${it.caption}</small>` : ''}</div><div class="ex-mini-chart"></div>
      <div class="icc-cls-opts">${options.map((o) => `<button type="button" class="icc-chip" data-v="${o.key}">${o.label}</button>`).join('')}</div><div class="icc-cls-fb" aria-live="polite"></div></div>`).join('')}</div>
    <div class="pl-asks"></div>
  </div>`;
  const card = el0.querySelector('.ex-cls');
  let right = 0;
  items.forEach((it, i) => {
    const box = card.querySelector(`.icc-cls[data-i="${i}"]`);
    const ch = mountExecChart(box.querySelector('.ex-mini-chart'), { bars: it.bars, total: it.bars.length + 2, pil: it.pil, label: it.label });
    ch.draw(it.bars.length);
    (it.tags || []).forEach((t) => ch.tag(t.i, t.text, t.tone || 'ink', t.where || 'above'));
    (it.pils || []).forEach(() => {});
    const fb = box.querySelector('.icc-cls-fb');
    box.querySelectorAll('.icc-chip').forEach((b) => b.addEventListener('click', () => {
      if (box.dataset.done || b.disabled) return;
      const ok = b.dataset.v === it.answer;
      helpers.handleStreak?.(ok);
      helpers.onPick?.({ prompt: it.label }, { label: b.textContent }, ok);
      trackICC(slide.track || `${it.answer}-icc`, ok);
      if (!ok && (b.dataset.v === 'clean' || b.dataset.v === 'messy') && (it.answer === 'none' || it.answer === 'invalid')) { trackICC('forced-messy', false); supportCard(card.querySelector('.pl-asks'), 'forced-messy', {}); }
      if (ok) {
        box.dataset.done = '1'; b.classList.add('ok');
        box.querySelectorAll('.icc-chip').forEach((x) => { if (x !== b) x.disabled = true; });
        fb.innerHTML = `✦ ${it.why || ''}`; fb.className = 'icc-cls-fb good';
        right += 1;
        if (right === items.length) {
          if (slide.principle) { const p = document.createElement('div'); p.className = 'icc-principle'; p.innerHTML = slide.principle; card.querySelector('.pl-asks').appendChild(p); }
          continueBtn(card, satisfy);
        }
      } else { b.classList.add('no'); b.disabled = true; fb.innerHTML = it.miss || 'Could you explain it without arguing with yourself?'; fb.className = 'icc-cls-fb bad'; }
    }));
  });
}

export { SKILL, METHOD, EXEC };

export const ICC_EXEC_RENDERERS = {
  exec_sim: renderExec,
  exec_drill: renderDrill,
  exec_builder: renderBuilder,
  exec_tree: renderTree,
  exec_classify: renderExecClassify,
};
