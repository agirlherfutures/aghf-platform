/**
 * Phase 8 · AGHF Trader Desk.
 *
 * p8_case: one TradeCaseFile worked through the BreakdownTimeline
 *   4H ROOM → 1H MAP → 15M OBSERVE → 1M EXECUTE → RISK → MANAGEMENT → OUTCOME.
 * p8_lab:  the Real Trade Breakdown Lab case board (RecommendedCases + practice any case).
 *
 * Layout: CASE FILE (left) · CHART WORKSPACE (center, dominant) · ANALYSIS (right).
 * On a phone the chart comes first and the analysis is a slide-up panel.
 *
 * Every chart is drawn from OutcomeLock.bars(): the outcome stays hidden until the
 * student locks her read, on every timeframe.
 */
import {
  TF_LIST, STAGES, MARKS, OutcomeLock, visibleBars, clock, compareMarks, compareChoice, reasoningDiff, reportCard,
  journalEntry, savePracticeEntry, caseRecord, saveCaseRecord, trackCase, trackP8, recommendedCases, riskOf,
  DIFF_TONE, DIFF_LABEL, CASE_TYPES, indicatorAssist, setIndicatorAssist, GRADES, VALIDITY, QUALITY, CONFIDENCE, tolerance,
} from './case-core.js';
import { loadRiskProfile } from './risk-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const f2 = (v) => (+v).toFixed(2).replace(/\.00$/, '');
const px = (v) => Math.round(v * 10) / 10;
const fmtP = (v) => (v == null || Number.isNaN(+v) ? '·' : (+v).toFixed(2));
const AX = 72, PT = 16, PB = 26;
let W = 1000, H = 470;
// Mark colours from the AGHF brand. Pink = you, purple = Dayli, teal = you matched Dayli,
// peach = the room and the PIL. Labels use dark text, except on purple.
const TONE = { mine: '#F4829A', dayli: '#7F77DD', ind: '#F5A857', trader: '#F9B8C6', pos: '#7ECEC4', match: '#7ECEC4' };
const LEVEL_TONE = { EXTERNAL_HIGH: '#F5A857', EXTERNAL_LOW: '#F5A857', SWING_HIGH: '#7ECEC4', SWING_LOW: '#7ECEC4', MSS: '#F4829A', OBJECTIVE: '#F5A857', PIL: '#F5A857', ENTRY: '#7ECEC4', STOP: '#F4829A', TARGET: '#7ECEC4' };
const INK = (col) => (col === TONE.dayli ? '#FFFFFF' : '#2C1810');
// Correction and Continuation both start with C, so the chart tags spell them out.
const TAG = { INDICATION: 'I', CORRECTION: 'Corr', CONTINUATION: 'Cont', RETEST: 'Retest' };

/** "4H · READ THE ROOM" → "4H · Read the room" (trading terms stay upper-case). */
const KEEP_UPPER = /^(\d+[HM]|ICC|PIL|MSS|AGHF|NY|AM|PM|MNQ|NQ|R|[ABC])$/;
function niceTitle(t) {
  const s = String(t || '');
  if (s !== s.toUpperCase()) return s;
  let first = true;
  return s.split(/(\s+)/).map((w) => {
    if (!w.trim()) return w;
    const bare = w.replace(/[^A-Z0-9]/g, '');
    if (KEEP_UPPER.test(bare) || !bare) return w;
    const out = first ? w[0] + w.slice(1).toLowerCase() : w.toLowerCase();
    first = false; return out;
  }).join('');
}

function stageIndex(k) { return STAGES.findIndex((s) => s.key === k); }

/* ═══════════════════════════════════════════════════════════════════════
   p8_case
   ═══════════════════════════════════════════════════════════════════════ */
export function renderCase(el, slide, satisfy, helpers = {}, opts = {}) {
  document.body.classList.add('p8-on');
  const c = slide.case;
  // Some cases can end more than one way. The ending is picked when the case opens and
  // only appended after the decision bar, so every variant looks identical until the reveal.
  if (slide.variants?.length && !c.__variant) {
    const v = slide.variants[Math.floor(Math.random() * slide.variants.length)];
    c.m1 = c.m1.slice(0, c.decisionIndex + 1).concat(v.future);
    c.outcome = v.outcome; c.__variant = v.label;
  }
  const steps = slide.steps || c.steps || [];
  c.steps = steps;
  const prior = caseRecord(c.id);
  const S = {
    c, steps, k: 0, lock: new OutcomeLock(c), tf: '4H', tool: null, allowed: [], playing: null, speed: 1,
    rec: { caseId: c.id, marks: [], asks: {}, timeline: {}, notes: {}, reassess: [], startedAt: Date.now() },
    view: { show: 'mine', indicator: false, hindsight: false, scrub: null, dayliUpTo: null, trader: false },
    demo: new Set(), status: 'OPEN', msg: '',
  };

  el.innerHTML = `
    <div class="p8-desk">
      <div class="p8-topbar">
        <div class="p8-brand"><span class="p8-dot"></span><span class="p8-case-no">${esc(c.caseNo || 'CASE')}</span></div>
        <div class="p8-timeline">${STAGES.map((s) => `<div class="p8-tl" data-st="${s.key}"><i></i><span>${s.label}</span></div>`).join('<b class="p8-tl-arrow">→</b>')}</div>
      </div>
      <div class="p8-grid">
        <aside class="p8-file"></aside>
        <section class="p8-chartcol">
          <div class="p8-chartbar">
            <div class="p8-tfs">${TF_LIST.map((t) => `<button type="button" class="p8-tf" data-tf="${t}">${t}</button>`).join('')}</div>
            <div class="p8-tools"></div>
          </div>
          <div class="p8-chart"></div>
          <div class="p8-replay"></div>
          <div class="p8-review"></div>
          <div class="p8-flash" hidden></div>
        </section>
        <aside class="p8-panel"><div class="p8-handle"><span></span>ANALYSIS</div><div class="p8-panel-body"></div></aside>
      </div>
    </div>`;
  const $ = (s) => el.querySelector(s);
  const fileEl = $('.p8-file'), chartEl = $('.p8-chart'), toolsEl = $('.p8-tools'), replayEl = $('.p8-replay'), reviewEl = $('.p8-review'), flashEl = $('.p8-flash');
  const panel = $('.p8-panel-body');
  $('.p8-handle').addEventListener('click', () => $('.p8-panel').classList.toggle('is-open'));
  el.querySelectorAll('.p8-tf').forEach((b) => b.addEventListener('click', () => { S.tf = b.dataset.tf; draw(); }));

  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (el.isConnected) drawChart(); }, 120); });

  // ── case file ──────────────────────────────────────────────────────────
  // The case file is a short row of chips: what you need, nothing you don't.
  function drawFile() {
    const ctx = c.context || [];
    const chip = (t, cls = '') => `<span class="p8-chip ${cls}">${t}</span>`;
    fileEl.innerHTML = `<div class="p8-chiprow">
      ${chip(esc(c.instrument || 'MNQ'))}${chip(esc(c.session || 'NY AM'))}
      ${S.lock.outcomeHidden ? chip('🔒 Outcome hidden', 'is-lock') : chip(`Outcome: <b>${esc(outcomeLabel(c))}</b>`, 'is-out')}
      ${ctx.map((x) => chip(esc(x.text), x.tone ? `is-${x.tone}` : '')).join('')}
    </div>`;
  }

  function drawTimeline() {
    const st = S.steps[S.k] || {};
    const cur = st.stage ? stageIndex(st.stage) : -1;
    el.querySelectorAll('.p8-tl').forEach((n) => {
      const i = stageIndex(n.dataset.st);
      n.classList.toggle('is-done', !!S.rec.timeline[n.dataset.st] || (n.dataset.st === 'OUTCOME' && !S.lock.outcomeHidden));
      n.classList.toggle('is-cur', i === cur);
    });
  }

  // ── chart ──────────────────────────────────────────────────────────────
  function marksFor(source) {
    if (source === 'mine') return S.rec.marks;
    if (source === 'dayli') {
      const all = c.expert?.marks || [];
      if (S.view.show === 'dayli' || S.view.show === 'both') return all;
      return all.filter((m) => S.demo.has(m.type) && (m.index == null || S.view.dayliUpTo == null || m.index < S.view.dayliUpTo));
    }
    if (source === 'ind') return S.view.indicator ? c.indicator?.marks || [] : [];
    if (source === 'trader') return S.view.trader ? c.trader?.marks || [] : [];
    return [];
  }

  function draw() {
    drawFile(); drawTimeline(); drawChart(); drawTools(); drawReplay();
    el.querySelectorAll('.p8-tf').forEach((b) => b.classList.toggle('on', b.dataset.tf === S.tf));
  }

  function drawChart() {
    const tf = S.tf;
    W = Math.max(340, Math.round(chartEl.clientWidth || 900));
    H = Math.round(Math.min(440, Math.max(300, W * (W < 640 ? 0.78 : 0.42))));
    let cursor = S.lock.cursor;
    if (!S.lock.outcomeHidden) cursor = S.view.scrub != null ? S.view.scrub : S.view.hindsight ? c.m1.length : Math.max(S.lock.cursor, c.decisionIndex + 1);
    const bars = visibleBars(c, tf, Math.min(cursor, S.lock.max));
    const all = tf === '1M' ? bars : bars.slice(-72);
    const off = bars.length - all.length;
    const slots = tf === '1M' ? Math.max(c.m1.length + 4, 60) : Math.max(all.length + 6, 40);
    const sw = (W - AX) / slots;
    const x = (i) => (i - off + 0.5) * sw;
    let hi = Math.max(...all.map((b) => b.h)), lo = Math.min(...all.map((b) => b.l));
    const showSrc = [];
    if (S.view.show === 'mine' || S.view.show === 'both') showSrc.push('mine');
    showSrc.push('dayli', 'ind', 'trader');
    const levels = [], cmarks = [];
    showSrc.forEach((src) => marksFor(src).forEach((m) => {
      const def = MARKS[m.type]; if (!def) return;
      if (def.kind === 'level') {
        const ownTf = def.tf === tf || (tf === '1M' && ['ENTRY', 'STOP', 'TARGET'].includes(m.type));
        // A level only shows on the timeframe it was marked on.
        if (!ownTf) return;
        hi = Math.max(hi, m.price); lo = Math.min(lo, m.price);
        levels.push({ ...m, src, own: true });
      } else if (tf === '1M') cmarks.push({ ...m, src });
    }));
    const pos = S.rec.decision?.choice === 'TAKE' && tf === '1M' ? S.rec.decision : null;
    if (pos) [pos.entry, pos.stop, pos.target].forEach((v) => { if (v != null && Number.isFinite(+v) && Math.abs(v - all[all.length - 1].c) < 400) { hi = Math.max(hi, +v); lo = Math.min(lo, +v); } });
    const pad = (hi - lo) * 0.08 || 4; hi += pad; lo -= pad;
    const y = (p) => PT + ((hi - p) / (hi - lo)) * (H - PT - PB);
    const yinv = (yy) => hi - ((yy - PT) / (H - PT - PB)) * (hi - lo);
    S.geo = { x, y, yinv, sw, off, n: bars.length, tf };
    const ticks = 5; let grid = '';
    for (let k = 0; k <= ticks; k++) { const p = lo + ((hi - lo) * k) / ticks; grid += `<line x1="0" x2="${W - AX}" y1="${px(y(p))}" y2="${px(y(p))}" class="p8-grid-l"/><text x="${W - AX + 6}" y="${px(y(p)) + 4}" class="p8-ax">${p.toFixed(2)}</text>`; }
    // the decision line and the hidden-future curtain
    let curtain = '';
    if (tf === '1M') {
      const dx = x(c.decisionIndex + 0.5);
      if (S.lock.outcomeHidden) {
        const lx = x(Math.min(S.lock.cursor, c.decisionIndex + 1) - 0.5);
        curtain = `<rect x="${px(lx)}" y="0" width="${px(W - AX - lx)}" height="${H}" class="p8-curtain"/><text x="${px(lx + 14)}" y="${H / 2}" class="p8-curtain-t">🔒 ${S.lock.atDecision ? 'OUTCOME LOCKED' : 'FUTURE HIDDEN'}</text>`;
      } else {
        curtain = `<line x1="${px(dx)}" x2="${px(dx)}" y1="0" y2="${H}" class="p8-decline"/><text x="${px(dx + 6)}" y="14" class="p8-dec-t">DECISION ${clock(c, c.decisionIndex)}</text>`;
        if (S.view.scrub != null) curtain += `<text x="8" y="16" class="p8-known">WHAT WAS KNOWN AT ${clock(c, Math.max(0, S.view.scrub - 1))}</text>`;
      }
    }
    let candles = '';
    all.forEach((b, j) => {
      const i = j + off; const up = b.c >= b.o; const cx = x(i); const bw = Math.max(1.2, sw * 0.62);
      const top = y(Math.max(b.o, b.c)), bot = y(Math.min(b.o, b.c));
      const fut = tf === '1M' && !S.lock.outcomeHidden && i > c.decisionIndex;
      candles += `<g class="p8-c ${up ? 'up' : 'dn'}${b.forming ? ' forming' : ''}${fut ? ' fut' : ''}"><line x1="${px(cx)}" x2="${px(cx)}" y1="${px(y(b.h))}" y2="${px(y(b.l))}"/><rect x="${px(cx - bw / 2)}" y="${px(top)}" width="${px(bw)}" height="${px(Math.max(1, bot - top))}"/></g>`;
    });
    // Where your mark and Dayli's are the same, draw one teal ✓ instead of two.
    const tol = tolerance(c, tf);
    levels.filter((m) => m.src === 'mine').forEach((m) => {
      const d = levels.find((x2) => x2.src === 'dayli' && x2.type === m.type && !x2.skip && Math.abs(x2.price - m.price) <= tol);
      if (d) { m.match = true; d.skip = true; }
    });
    cmarks.filter((m) => m.src === 'mine').forEach((m) => {
      const d = cmarks.find((x2) => x2.src === 'dayli' && x2.type === m.type && x2.index === m.index && !x2.skip);
      if (d) { m.match = true; d.skip = true; }
    });
    let lv = '';
    levels.forEach((m) => {
      if (m.skip) return;
      const yy = y(m.price); if (yy < 0 || yy > H) return;
      const col = m.match ? TONE.match : m.src === 'mine' ? LEVEL_TONE[m.type] || TONE.mine : TONE[m.src];
      const dash = m.match ? '' : m.src === 'dayli' ? '9 6' : m.src === 'ind' ? '2 5' : m.src === 'trader' ? '4 3' : '';
      const tag = m.match ? `✓ ${MARKS[m.type].short}` : `${m.src === 'dayli' ? 'Dayli · ' : m.src === 'ind' ? 'IND · ' : m.src === 'trader' ? 'TRADER · ' : ''}${MARKS[m.type].short}`;
      const from = m.from != null && tf === '1M' ? x(m.from) : 0;
      lv += `<g class="p8-lv src-${m.src}"><line x1="${px(from)}" x2="${W - AX}" y1="${px(yy)}" y2="${px(yy)}" stroke="${col}" stroke-dasharray="${dash}"/><rect x="${W - AX - 8 - tag.length * 6.6}" y="${px(yy - 9)}" width="${tag.length * 6.6 + 8}" height="18" rx="9" fill="${col}"/><text x="${W - AX - 4}" y="${px(yy + 4)}" text-anchor="end" style="fill:${INK(col)}">${esc(tag)}</text></g>`;
    });
    if (pos) {
      const from = x(c.decisionIndex);
      [['ENTRY', pos.entry, '#2C1810'], ['STOP', pos.stop, '#E0607A'], ['TARGET', pos.target, '#2E9C8F']].forEach(([lab, p, col]) => {
        if (p == null || !Number.isFinite(+p) || y(+p) < -20 || y(+p) > H + 20) return;
        lv += `<g class="p8-pos"><line x1="${px(from)}" x2="${W - AX}" y1="${px(y(p))}" y2="${px(y(p))}" stroke="${col}"/><text x="${px(from + 4)}" y="${px(y(p) - 5)}" fill="${col}">MY ${lab} ${fmtP(p)}</text></g>`;
      });
    }
    let cm = '';
    const stack = {};
    cmarks.forEach((m) => {
      if (m.skip) return;
      if (m.index >= off + all.length || m.index < off) return;
      const b = bars[m.index]; if (!b) return;
      const below = m.src === 'mine' || m.src === 'trader';
      const key = `${m.index}:${below}`;
      const k = (stack[key] = (stack[key] || 0) + 1);
      const yy = below ? y(b.l) + 18 + (k - 1) * 18 : y(b.h) - 8 - (k - 1) * 18;
      const col = m.match ? TONE.match : m.src === 'mine' ? TONE.mine : TONE[m.src];
      const short = m.label || TAG[m.type] || MARKS[m.type].short;
      const lab = m.match ? `✓ ${short}` : (m.src === 'dayli' ? 'Dayli · ' : m.src === 'mine' ? 'You · ' : m.src === 'ind' ? 'IND · ' : '') + short;
      cm += `<g class="p8-cm"><rect x="${px(x(m.index) - (lab.length * 3.4 + 7))}" y="${px(yy - 12)}" width="${lab.length * 6.8 + 14}" height="17" rx="8.5" fill="${col}"/><text x="${px(x(m.index))}" y="${px(yy)}" text-anchor="middle" style="fill:${INK(col)}">${esc(lab)}</text></g>`;
    });
    chartEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="p8-svg ${S.tool ? 'is-tool' : ''}">
      <rect width="${W}" height="${H}" class="p8-bg"/>${grid}${candles}${curtain}${lv}${cm}
      <text x="10" y="${H - 8}" class="p8-wm">${esc(c.instrument || 'MNQ')} · ${tf}${tf === '1M' ? ` · ${clock(c, Math.max(0, Math.min(cursor, S.lock.max) - 1))}` : ''}</text>
      <rect width="${W - AX}" height="${H}" fill="transparent" class="p8-hit"/></svg>`;
    chartEl.querySelector('.p8-hit').addEventListener('click', onChartClick);
  }

  function onChartClick(ev) {
    if (!S.tool) return;
    const svg = chartEl.querySelector('svg');
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    const def = MARKS[S.tool];
    if (def.tf !== S.tf && !(S.tf === '1M' && ['ENTRY', 'STOP', 'TARGET'].includes(S.tool)) && !(def.kind === 'level' && S.tf === '1M' && S.tool === 'PIL')) {
      return flash(`${def.label} goes on the ${def.tf} chart.`);
    }
    if (def.kind === 'level') {
      const price = Math.round(S.geo.yinv(loc.y) * 4) / 4;
      placeMark({ type: S.tool, price, tf: S.tf });
    } else {
      const idx = Math.floor(loc.x / S.geo.sw) + S.geo.off;
      if (idx < 0 || idx >= S.geo.n) return flash('Mark a candle that has printed.');
      placeMark({ type: S.tool, index: idx, tf: '1M' });
    }
  }

  function placeMark(m) {
    const multi = ['SWING_HIGH', 'SWING_LOW'].includes(m.type);
    if (!multi) S.rec.marks = S.rec.marks.filter((x) => x.type !== m.type);
    else if (S.rec.marks.filter((x) => x.type === m.type).length >= 3) S.rec.marks.splice(S.rec.marks.findIndex((x) => x.type === m.type), 1);
    m.at = S.lock.cursor;
    S.rec.marks.push(m);
    if (S.decisionForm && ['ENTRY', 'STOP', 'TARGET'].includes(m.type)) S.decisionForm(m);
    if (!multi) { S.tool = null; $('.p8-panel').classList.add('is-open'); }
    drawChart(); drawTools(); S.onMarks?.();
  }

  function drawTools() {
    if (!S.allowed.length) { toolsEl.innerHTML = ''; return; }
    toolsEl.innerHTML = `<span class="p8-tools-l">✎ Mark on the chart</span>${S.allowed.map((t) => {
      const has = S.rec.marks.some((m) => m.type === t);
      return `<button type="button" class="p8-tool ${S.tool === t ? 'on' : ''} ${has ? 'has' : ''}" data-t="${t}" title="${esc(MARKS[t].label)}">${has ? '✓ ' : S.tool === t ? '' : '+ '}${esc(MARKS[t].label)}</button>`;
    }).join('')}${S.rec.marks.some((m) => S.allowed.includes(m.type)) ? '<button type="button" class="p8-tool p8-undo">↶ Undo</button>' : ''}`;
    toolsEl.querySelectorAll('.p8-tool[data-t]').forEach((b) => b.addEventListener('click', () => {
      S.tool = S.tool === b.dataset.t ? null : b.dataset.t;
      if (S.tool) $('.p8-panel').classList.remove('is-open');
      const def = MARKS[S.tool];
      if (def && def.tf !== S.tf && !(S.tool === 'PIL' && S.tf === '1M')) S.tf = def.kind === 'candle' ? '1M' : def.tf;
      draw();
      if (S.tool) flash(MARKS[S.tool].kind === 'level' ? `Click the chart at the ${MARKS[S.tool].label.toLowerCase()} price.` : `Click the ${MARKS[S.tool].label.toLowerCase()} candle.`, 1600);
    }));
    toolsEl.querySelector('.p8-undo')?.addEventListener('click', () => {
      const i = [...S.rec.marks].reverse().findIndex((m) => S.allowed.includes(m.type));
      if (i >= 0) S.rec.marks.splice(S.rec.marks.length - 1 - i, 1);
      draw(); S.onMarks?.();
    });
  }

  function flash(t, ms = 2200) {
    flashEl.textContent = t; flashEl.hidden = false;
    clearTimeout(S.flashT); S.flashT = setTimeout(() => { flashEl.hidden = true; }, ms);
  }

  // ── replay ─────────────────────────────────────────────────────────────
  function drawReplay() {
    if (S.tf !== '1M' || S.noReplay) { replayEl.innerHTML = ''; return; }
    const locked = S.lock.outcomeHidden;
    replayEl.innerHTML = `
      <button type="button" data-a="reset" title="Reset">⟲</button>
      <button type="button" data-a="back" title="Previous candle">◀</button>
      <button type="button" data-a="play" class="p8-play">${S.playing ? '❚❚ Pause' : '▶ Play'}</button>
      <button type="button" data-a="next" title="Next candle">Next ▶|</button>
      <button type="button" data-a="speed" class="p8-speed">${S.speed}×</button>
      <span class="p8-rp-t">${clock(c, Math.max(0, S.lock.cursor - 1))}</span>
      <span class="p8-rp-lock">${locked ? (S.lock.atDecision ? '🔒 Decision point reached' : '🔒 Future hidden') : 'Replay unlocked'}</span>`;
    replayEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => replayAct(b.dataset.a)));
  }

  function replayAct(a) {
    $('.p8-panel').classList.remove('is-open');
    if (a === 'speed') { S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 4 : 1; if (S.playing) { stopPlay(); play(); } drawReplay(); return; }
    if (a === 'play') { if (S.playing) stopPlay(); else play(); drawReplay(); return; }
    if (a === 'reset') { stopPlay(); S.lock.set(c.replayStart ?? 8); }
    if (a === 'back') { stopPlay(); S.lock.step(-1); }
    if (a === 'next') { if (!S.lock.step(1)) lockedMsg(); }
    afterCursor();
  }
  function lockedMsg() { flash(S.lockMsg || 'FUTURE DATA IS LOCKED UNTIL YOU LOCK YOUR READ.'); }
  function play() {
    S.playing = setInterval(() => {
      if (!S.lock.step(1)) { stopPlay(); lockedMsg(); drawReplay(); }
      afterCursor();
    }, 700 / S.speed);
  }
  function stopPlay() { clearInterval(S.playing); S.playing = null; }
  function afterCursor() {
    S.view.dayliUpTo = S.lock.cursor;
    drawChart(); drawReplay(); S.onCursor?.();
  }

  // ── review toolbar (after the reveal) ──────────────────────────────────
  function drawReview(on) {
    if (!on) { reviewEl.innerHTML = ''; return; }
    reviewEl.innerHTML = `
      <div class="p8-rv-g"><span>MARKUP</span>${[['mine', 'My markup'], ['dayli', 'Dayli markup'], ['both', 'Overlay both']].map(([k, l]) => `<button type="button" data-show="${k}" class="${S.view.show === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="p8-rv-g"><span>VIEW</span><button type="button" data-hs="0" class="${!S.view.hindsight && S.view.scrub == null ? 'on' : ''}">Decision view</button><button type="button" data-hs="1" class="${S.view.hindsight && S.view.scrub == null ? 'on' : ''}">Hindsight view</button></div>
      <div class="p8-rv-g p8-scrub"><span>TIME-TRAVEL</span><input type="range" min="1" max="${c.m1.length}" value="${S.view.scrub ?? c.m1.length}"><em>${S.view.scrub != null ? `known at ${clock(c, S.view.scrub - 1)}` : 'drag to scrub'}</em></div>
      ${c.indicator ? `<div class="p8-rv-g"><span>INDICATOR</span><button type="button" data-ind class="${S.view.indicator ? 'on' : ''}">${S.view.indicator ? 'On' : 'Off'}</button></div>` : ''}
      <div class="p8-rv-note">Don’t grade the decision view using the hindsight view.</div>`;
    reviewEl.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => { S.view.show = b.dataset.show; S.tf = '1M'; drawReview(true); draw(); }));
    reviewEl.querySelectorAll('[data-hs]').forEach((b) => b.addEventListener('click', () => { S.view.hindsight = b.dataset.hs === '1'; S.view.scrub = null; drawReview(true); draw(); }));
    reviewEl.querySelector('[data-ind]')?.addEventListener('click', () => { S.view.indicator = !S.view.indicator; drawReview(true); draw(); });
    const r = reviewEl.querySelector('input[type=range]');
    r.addEventListener('input', () => { S.view.scrub = +r.value; S.tf = '1M'; reviewEl.querySelector('.p8-scrub em').textContent = `known at ${clock(c, S.view.scrub - 1)}`; draw(); });
  }

  // ── steps ──────────────────────────────────────────────────────────────
  function go(k) {
    stopPlay();
    S.k = k; S.allowed = []; S.tool = null; S.onMarks = null; S.onCursor = null; S.decisionForm = null; S.noReplay = false;
    const st = S.steps[k];
    if (!st) return finish();
    panel.innerHTML = '';
    panel.scrollTop = 0;
    $('.p8-panel').classList.add('is-open');
    const box = document.createElement('div'); box.className = `p8-step p8-step-${st.t}`;
    panel.appendChild(box);
    const prog = S.steps.length > 1 ? `<div class="p8-prog"><span style="width:${Math.round((k / S.steps.length) * 100)}%"></span></div>` : '';
    box.insertAdjacentHTML('beforebegin', prog);
    (STEP[st.t] || STEP.brief)(box, st, () => go(k + 1));
    draw();
  }

  function finish() {
    S.status = 'REVIEWED';
    S.rec.completedAt = Date.now();
    trackCase(c, S.rec);
    saveCaseRecord(c.id, { ...S.rec });
    const entry = journalEntry(c, S.rec, opts.source || 'ACADEMY_CASE');
    savePracticeEntry(entry);
    draw();
    if (opts.onDone) opts.onDone(S.rec, entry);
    else satisfy?.();
  }

  const btn = (label, cls = '') => `<button type="button" class="p8-btn ${cls}">${label}</button>`;
  const head = (st, fallback = '') => `${st.kicker ? `<div class="p8-kicker">${esc(st.kicker)}</div>` : ''}<h3 class="p8-h">${st.title || fallback}</h3>`;
  const dayliLines = (lines) => (lines || []).map((l) => `<p class="p8-say">${l}</p>`).join('');
  const chips = (key, options, cur) => `<div class="p8-chips" data-key="${key}">${options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<button type="button" data-v="${esc(v)}" class="${cur === v ? 'on' : ''}">${esc(l)}</button>`; }).join('')}</div>`;
  function bindChips(box, onPick) {
    box.querySelectorAll('.p8-chips').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      onPick(g.dataset.key, b.dataset.v);
    })));
  }
  function diffRows(rows) {
    if (!rows.length) return '';
    return `<div class="p8-diff">${rows.map((r) => `
      <div class="p8-dr is-${DIFF_TONE[r.status]}">
        <div class="p8-dr-h"><span class="p8-badge">${DIFF_LABEL[r.status]}</span><b>${esc(r.label || MARKS[r.type]?.label || r.type)}</b></div>
        <div class="p8-dr-c"><span>You: ${esc(r.mineLabel ?? markText(r.mine))}</span><span>Dayli: ${esc(r.expertLabel ?? markText(r.expert))}</span></div>
        ${r.why || r.expert?.why ? `<div class="p8-dr-w">${r.why || r.expert.why}</div>` : ''}
      </div>`).join('')}</div>`;
  }
  function markText(m) { if (!m) return '·'; return m.price != null ? fmtP(m.price) : m.index != null ? clock(c, m.index) : '·'; }

  const STEP = {
    brief(box, st, next) {
      box.innerHTML = `${head(st, c.title)}${st.dayli !== false ? '<div class="p8-dayli">DAYLI</div>' : ''}${dayliLines(st.lines)}${btn(st.cta || 'Open the case →', 'is-primary')}`;
      S.tf = st.tf || S.tf; S.noReplay = !!st.tf && st.tf !== '1M';
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    principle(box, st, next) {
      box.innerHTML = `<div class="p8-principle">${st.text}</div>${dayliLines(st.lines)}${btn(st.cta || 'Continue →', 'is-primary')}`;
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    read(box, st, next) {
      S.tf = st.tf; S.allowed = st.marks || [];
      if (st.tf !== '1M') S.lock.set(Math.min(S.lock.cursor, c.decisionIndex + 1));
      const asks = st.asks || [];
      const demo = !!st.demo;
      const stg = STAGES.find((s) => s.key === (st.stage || st.tf));
      box.innerHTML = `
        <div class="p8-kicker">STEP ${stageIndex(stg.key) + 1} · ${stg.key}</div>
        <h3 class="p8-h">${esc(niceTitle(st.title || `${stg.key} · ${stg.verb}`))}</h3>
        ${demo ? `<div class="p8-demo"><div class="p8-dayli">DAYLI MARKS IT</div><div class="p8-demo-lines"></div>${btn('Watch Dayli mark it ▶', 'p8-demo-go')}</div>` : ''}
        ${S.allowed.length && !demo ? `<div class="p8-need"></div>` : ''}
        <div class="p8-asks">${asks.map((a, i) => `<div class="p8-ask${i && S.rec.asks[asks[i - 1].key] == null ? ' is-later' : ''}" data-k="${a.key}"><div class="p8-q">${a.q}</div>${chips(a.key, a.options, S.rec.asks[a.key])}<div class="p8-fb"></div></div>`).join('')}</div>
        ${st.note ? `<label class="p8-lbl">${esc(st.note)}</label><textarea class="p8-ta" rows="2" placeholder="${esc(st.notePh || 'In your own words…')}"></textarea>` : ''}
        ${st.confidence ? `<div class="p8-q">How confident are you in this read?</div>${chips('confidence', CONFIDENCE, null)}` : ''}
        <div class="p8-after"></div>
        ${btn(st.lockLabel || `Lock my ${stg.key} read`, 'is-primary p8-lockstage')}`;
      const lockBtn = box.querySelector('.p8-lockstage');
      const need = box.querySelector('.p8-need');
      const ta = box.querySelector('.p8-ta');
      if (ta) { ta.value = S.rec.notes[stg.key] || ''; ta.addEventListener('input', () => { S.rec.notes[stg.key] = ta.value; refresh(); }); }
      let demoDone = !demo;
      if (demo) {
        const dl = box.querySelector('.p8-demo-lines');
        box.querySelector('.p8-demo-go').addEventListener('click', (e) => {
          e.target.remove();
          const order = st.demoOrder || S.allowed;
          let i = 0;
          const tick = () => {
            if (i >= order.length) { demoDone = true; (st.demoLines || []).slice(order.length).forEach((l) => dl.insertAdjacentHTML('beforeend', `<p class="p8-say">${l}</p>`)); refresh(); return; }
            S.demo.add(order[i]);
            if (st.demoLines?.[i]) dl.insertAdjacentHTML('beforeend', `<p class="p8-say">${st.demoLines[i]}</p>`);
            drawChart(); i += 1; setTimeout(tick, 1100);
          };
          tick();
        });
      }
      const picks = {};
      bindChips(box, (k, v) => {
        if (k === 'confidence') { S.rec.confidence = v; return refresh(); }
        picks[k] = v; S.rec.asks[k] = v;
        // One question at a time: answering one shows the next.
        box.querySelector('.p8-ask.is-later')?.classList.remove('is-later');
        const a = asks.find((x) => x.key === k);
        if ((demo || st.feedback === 'instant') && a.expert != null) {
          const s = compareChoice(a, v);
          box.querySelector(`.p8-ask[data-k="${k}"] .p8-fb`).innerHTML = `<div class="p8-fbi is-${DIFF_TONE[s]}">${s === 'MATCHED' ? '✓ ' : s === 'NEEDS REVIEW' ? '≈ ' : ''}${s === 'MATCHED' ? (a.yes || a.why || 'Same read as Dayli.') : (a.why || '')}</div>`;
        }
        refresh();
      });
      S.onMarks = refresh;
      function refresh() {
        if (need) need.innerHTML = `<div class="p8-need-h">MARK ON THE ${st.tf} CHART</div>${S.allowed.map((t) => `<div class="p8-need-i ${S.rec.marks.some((m) => m.type === t) ? 'ok' : ''}">${S.rec.marks.some((m) => m.type === t) ? '✓' : '○'} ${esc(MARKS[t].label)}${(st.optional || []).includes(t) ? ' <em>(if you see one)</em>' : ''}</div>`).join('')}`;
        const marksOk = demo || S.allowed.every((t) => (st.optional || []).includes(t) || S.rec.marks.some((m) => m.type === t));
        const asksOk = asks.every((a) => S.rec.asks[a.key] != null);
        const noteOk = !st.noteRequired || (ta && ta.value.trim().length >= 4);
        lockBtn.disabled = !(marksOk && asksOk && noteOk && demoDone);
      }
      refresh();
      lockBtn.addEventListener('click', () => {
        const rows = [
          ...compareMarks(c, S.rec.marks, c.expert?.marks || [], demo ? [] : S.allowed),
          ...asks.filter((a) => a.expert != null).map((a) => ({ type: a.key, label: a.short || a.q, status: compareChoice(a, S.rec.asks[a.key]), mineLabel: S.rec.asks[a.key], expertLabel: a.expert, why: a.why })),
        ];
        S.rec.timeline[stg.key] = { studentRead: { marks: S.rec.marks.filter((m) => S.allowed.includes(m.type)), asks: Object.fromEntries(asks.map((a) => [a.key, S.rec.asks[a.key]])), note: S.rec.notes[stg.key] || '' }, confidence: S.rec.confidence || null, difference: rows.map((r) => ({ type: r.type, status: r.status })), at: Date.now() };
        lockBtn.remove();
        box.querySelectorAll('.p8-chips button').forEach((b) => { b.disabled = true; });
        S.allowed = []; drawTools(); drawTimeline();
        const after = box.querySelector('.p8-after');
        if (st.feedback === 'now' && !demo) {
          S.demo = new Set([...S.demo, ...(st.marks || [])]); drawChart();
          after.innerHTML = `<div class="p8-sub">YOUR READ · DAYLI’S READ</div>${diffRows(rows)}${dayliLines(st.after)}`;
        } else if (st.after) after.innerHTML = dayliLines(st.after);
        after.insertAdjacentHTML('beforeend', btn(st.cta || 'Next stage →', 'is-primary'));
        after.querySelector('.p8-btn').addEventListener('click', next);
      });
    },

    replay(box, st, next) {
      S.tf = '1M'; S.allowed = st.marks || [];
      if (st.from != null) S.lock.set(st.from);
      S.lockMsg = st.lockMsg;
      const demo = !!st.demo;
      if (demo) S.demo = new Set([...S.demo, ...(st.marks || [])]);
      S.view.dayliUpTo = S.lock.cursor;
      const pauses = [...(st.pauses || [])];
      box.innerHTML = `
        <div class="p8-kicker">STEP 4 · 1M</div><h3 class="p8-h">${esc(niceTitle(st.title || '1M · EXECUTE'))}</h3>
        <div class="p8-replay-hint">${demo ? 'Press <b>Play</b>. Dayli labels each event as it closes.' : 'Press <b>Play</b> or <b>Next</b> to advance. Mark each event once its candle has <b>closed</b>.'}</div>
        <div class="p8-pausebox"></div>
        ${demo ? '' : '<div class="p8-need"></div>'}
        <div class="p8-after"></div>
        ${btn(st.lockLabel || 'Lock my 1M read', 'is-primary p8-lockstage')}`;
      const need = box.querySelector('.p8-need');
      const lockBtn = box.querySelector('.p8-lockstage');
      const pbox = box.querySelector('.p8-pausebox');
      S.onCursor = () => {
        const p = pauses[0];
        if (p && S.lock.cursor >= p.at + 1) { pauses.shift(); stopPlay(); drawReplay(); pbox.innerHTML = `<div class="p8-pause">${p.text}</div>`; }
        refresh();
      };
      S.onMarks = refresh;
      function refresh() {
        if (need) need.innerHTML = `<div class="p8-need-h">MARK ON THE 1M</div>${S.allowed.map((t) => `<div class="p8-need-i ${S.rec.marks.some((m) => m.type === t) ? 'ok' : ''}">${S.rec.marks.some((m) => m.type === t) ? '✓' : '○'} ${esc(MARKS[t].label)}${(st.optional || []).includes(t) ? ' <em>(if it forms)</em>' : ''}</div>`).join('')}`;
        const marksOk = demo || S.allowed.every((t) => (st.optional || []).includes(t) || S.rec.marks.some((m) => m.type === t));
        lockBtn.disabled = !(S.lock.atDecision && marksOk);
        lockBtn.textContent = !S.lock.atDecision ? 'Replay to the decision point first' : (st.lockLabel || 'Lock my 1M read');
      }
      refresh();
      lockBtn.addEventListener('click', () => {
        const rows = compareMarks(c, S.rec.marks, c.expert?.marks || [], demo ? [] : S.allowed);
        S.rec.timeline['1M'] = { studentRead: { marks: S.rec.marks.filter((m) => S.allowed.includes(m.type)) }, difference: rows.map((r) => ({ type: r.type, status: r.status })), at: Date.now() };
        lockBtn.remove(); S.allowed = []; drawTools(); drawTimeline();
        const after = box.querySelector('.p8-after');
        if (st.feedback === 'now' && !demo) { S.demo = new Set([...S.demo, ...(st.marks || [])]); drawChart(); after.innerHTML = `<div class="p8-sub">YOUR READ · DAYLI’S READ</div>${diffRows(rows)}`; }
        after.insertAdjacentHTML('beforeend', `${dayliLines(st.after)}${btn(st.cta || 'Next →', 'is-primary')}`);
        after.querySelector('.p8-btn').addEventListener('click', next);
      });
    },

    trader(box, st, next) {
      S.tf = '1M'; S.view.trader = true; S.lock.set(c.decisionIndex + 1);
      box.innerHTML = `${head(st, 'What the trader did')}${dayliLines(st.lines)}${btn(st.cta || 'Continue →', 'is-primary')}`;
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    decision(box, st, next) {
      S.tf = '1M';
      const last = c.m1[c.decisionIndex].c;
      const prof = loadRiskProfile();
      const d = S.rec.decision || { choice: null, entry: last, stop: null, target: null, contracts: 1, reasons: [] };
      S.rec.decision = d;
      const reasons = st.reasons || [];
      box.innerHTML = `
        <div class="p8-kicker">${esc(st.kicker || 'DECISION')}</div><h3 class="p8-h">${esc(st.title || 'Would you take it?')}</h3>
        ${dayliLines(st.lines)}
        ${chips('choice', st.options || ['TAKE', 'WAIT', 'PASS'], d.choice)}
        <div class="p8-takeform" hidden>
          <div class="p8-sub">DEFINE ENTRY AND RISK</div>
          <div class="p8-form">
            <label>Entry<input type="number" step="0.25" data-f="entry" value="${d.entry ?? ''}"></label>
            <label>Stop<input type="number" step="0.25" data-f="stop" value="${d.stop ?? ''}"></label>
            <label>Target<input type="number" step="0.25" data-f="target" value="${d.target ?? ''}"></label>
            <label>Contracts<input type="number" step="1" min="1" data-f="contracts" value="${d.contracts ?? 1}"></label>
          </div>
          <div class="p8-tip">Tip: pick ENTRY, STOP or TARGET above the chart and click a price.</div>
          <div class="p8-riskline"></div>
        </div>
        ${reasons.length ? `<div class="p8-reasons" hidden><div class="p8-sub">WHY?</div><div class="p8-multi">${reasons.map((r) => `<button type="button" data-r="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>` : ''}
        <div class="p8-after"></div>
        ${btn('Record my decision', 'is-primary p8-rec')}`;
      const form = box.querySelector('.p8-takeform');
      const rs = box.querySelector('.p8-reasons');
      const recBtn = box.querySelector('.p8-rec');
      const riskLine = box.querySelector('.p8-riskline');
      S.allowed = [];
      const sync = () => {
        form.hidden = d.choice !== 'TAKE';
        if (rs) rs.hidden = !d.choice || d.choice === 'TAKE';
        S.allowed = d.choice === 'TAKE' ? ['ENTRY', 'STOP', 'TARGET'] : [];
        drawTools();
        let ok = !!d.choice;
        if (d.choice === 'TAKE') {
          const r = riskOf(c, d);
          const cap = prof?.riskPerTradeLimit ? +prof.riskPerTradeLimit : null;
          ok = r.sane && d.contracts >= 1;
          riskLine.innerHTML = d.stop == null || d.target == null ? '<span class="p8-dim">Set a stop and a target.</span>'
            : !r.sane ? '<span class="p8-warn">Stop and target need to sit on opposite sides of the entry.</span>'
            : `<b>${f2(r.pts)} pts</b> risk · <b>$${r.dollars}</b> at ${d.contracts} ${c.instrument || 'MNQ'} · target <b>${f2(r.rr)}R</b>${cap ? ` · your max per trade: $${cap}${r.dollars > cap ? ' <span class="p8-warn">over your limit</span>' : ' ✓'}` : ''}`;
        }
        recBtn.disabled = !ok;
        drawChart();
      };
      S.decisionForm = (m) => { d[m.type.toLowerCase()] = m.price; form.querySelector(`[data-f="${m.type.toLowerCase()}"]`).value = m.price; S.rec.marks = S.rec.marks.filter((x) => x.type !== m.type); sync(); };
      form.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => { const v = inp.value === '' ? null : +inp.value; d[inp.dataset.f] = v; sync(); }));
      bindChips(box, (k, v) => { d.choice = v; sync(); });
      rs?.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('on'); d.reasons = [...rs.querySelectorAll('button.on')].map((x) => x.dataset.r); }));
      sync();
      recBtn.addEventListener('click', () => {
        d.at = Date.now();
        box.querySelectorAll('.p8-chips button, input, .p8-multi button').forEach((x) => { x.disabled = true; });
        recBtn.remove(); S.allowed = []; drawTools();
        if (d.choice === 'TAKE') S.rec.timeline.RISK = { studentRead: { ...d }, at: Date.now() };
        else S.rec.timeline.RISK = { studentRead: { choice: d.choice, reasons: d.reasons }, at: Date.now() };
        const after = box.querySelector('.p8-after');
        if (st.feedback === 'now' && c.expert?.idealDecision) {
          const s = compareChoice({ expert: c.expert.idealDecision, alt: c.expert.altDecisions }, d.choice);
          after.innerHTML = `<div class="p8-fbi is-${DIFF_TONE[s]}">${s === 'MATCHED' ? '✓ Same decision as Dayli. ' : `Dayli’s decision: <b>${c.expert.idealDecision}</b>. `}${c.expert.decisionWhy || ''}</div>`;
        }
        after.insertAdjacentHTML('beforeend', btn(st.cta || 'Next →', 'is-primary'));
        after.querySelector('.p8-btn').addEventListener('click', next);
        drawChart();
      });
    },

    mgmt(box, st, next) {
      const prof = loadRiskProfile();
      box.innerHTML = `<div class="p8-kicker">STEP 6 · MANAGEMENT</div><h3 class="p8-h">${esc(st.title || 'Your management plan')}</h3>
        ${dayliLines(st.lines)}
        ${S.rec.decision?.choice !== 'TAKE' ? '<p class="p8-dim">No position, so there’s nothing to manage. Your plan still matters if this setup comes back.</p>' : ''}
        ${chips('mgmt', st.options || ['Hold to target, stop stays where it is', 'Partial at 1R, rest to target', 'Stop to breakeven at 1R'], S.rec.mgmt)}
        ${prof ? `<div class="p8-tip">From your saved plan: target model ${esc(prof.targetModelPoints || '·')} pts · stop model ${esc(prof.stopModelPoints || '·')} pts.</div>` : ''}
        ${btn('Set management', 'is-primary p8-rec')}`;
      const b = box.querySelector('.p8-rec'); b.disabled = !S.rec.mgmt;
      bindChips(box, (k, v) => { S.rec.mgmt = v; b.disabled = false; });
      b.addEventListener('click', () => { S.rec.timeline.MGMT = { studentRead: S.rec.mgmt, at: Date.now() }; next(); });
    },

    confidence(box, st, next) {
      box.innerHTML = `${head(st, 'How confident are you in this read?')}<p class="p8-dim">This isn’t scored. Later it shows you where confident reads were wrong, and where unsure ones were right.</p>${chips('confidence', CONFIDENCE, S.rec.confidence)}${btn('Continue →', 'is-primary p8-rec')}`;
      const b = box.querySelector('.p8-rec'); b.disabled = !S.rec.confidence;
      bindChips(box, (k, v) => { S.rec.confidence = v; b.disabled = false; });
      b.addEventListener('click', next);
    },

    lock(box, st, next) {
      const d = S.rec.decision || {};
      const tl = STAGES.filter((s) => S.rec.timeline[s.key]).map((s) => `<div class="p8-sum-i">✓ ${s.label}</div>`).join('');
      box.innerHTML = `<div class="p8-kicker">LOCK THE TRADE</div><h3 class="p8-h">${esc(st.title || 'Lock your analysis')}</h3>
        <div class="p8-sum">${tl}<div class="p8-sum-i">Decision: <b>${esc(d.choice || '·')}</b>${d.choice === 'TAKE' ? ` · ${fmtP(d.entry)} / stop ${fmtP(d.stop)} / target ${fmtP(d.target)} · ${d.contracts}×` : ''}</div></div>
        <p class="p8-dim">Once locked, your read can’t be silently rewritten. After the reveal you can add a reflection, and you can flag <b>I WOULD REASSESS HERE</b> during the replay.</p>
        ${btn('🔒 LOCK ANALYSIS', 'is-primary is-lock')}`;
      box.querySelector('.p8-btn').addEventListener('click', () => {
        S.rec.lockedAt = Date.now();
        S.rec.original = JSON.parse(JSON.stringify({ marks: S.rec.marks, asks: S.rec.asks, decision: S.rec.decision, mgmt: S.rec.mgmt, confidence: S.rec.confidence, timeline: S.rec.timeline }));
        S.status = 'READ LOCKED';
        saveCaseRecord(c.id, { ...S.rec });
        next();
      });
    },

    reveal(box, st, next) {
      S.tf = '1M';
      const rv = c.reveal || {};
      box.innerHTML = `<div class="p8-kicker">STEP 7 · OUTCOME</div><h3 class="p8-h">${esc(st.title || 'Reveal the outcome')}</h3>
        ${dayliLines(st.lines)}
        ${btn('PLAY FORWARD ▶', 'is-primary p8-pf')}
        <div class="p8-reassess" hidden>${btn('⚑ I WOULD REASSESS HERE', 'p8-flag')}<div class="p8-flags"></div></div>
        <div class="p8-outcome"></div>`;
      const pf = box.querySelector('.p8-pf');
      pf.addEventListener('click', () => {
        pf.remove();
        S.lock.release(); S.status = 'OUTCOME REVEALED'; S.lock.set(c.decisionIndex + 1);
        drawFile();
        box.querySelector('.p8-reassess').hidden = !!st.noReassess;
        box.querySelector('.p8-flag')?.addEventListener('click', () => {
          stopPlay();
          const note = window.prompt('What new information changes your thesis here? (optional)') || '';
          S.rec.reassess.push({ index: S.lock.cursor - 1, time: clock(c, S.lock.cursor - 1), note, at: Date.now() });
          box.querySelector('.p8-flags').innerHTML = S.rec.reassess.map((r) => `<div class="p8-tip">⚑ ${r.time}${r.note ? ` · ${esc(r.note)}` : ''}</div>`).join('');
          play();
        });
        const tempt = st.tempt && S.rec.decision?.choice === 'TAKE' ? { ...st.tempt, at: c.decisionIndex + 1 + (st.tempt.after || 3) } : null;
        S.onCursor = () => {
          if (tempt && !tempt.done && S.lock.cursor >= tempt.at) {
            tempt.done = true; stopPlay(); drawReplay();
            const tb = document.createElement('div'); tb.className = 'p8-tempt';
            tb.innerHTML = `<div class="p8-pause">${tempt.text}</div><div class="p8-opts">${tempt.options.map((o, i) => `<button type="button" class="p8-opt" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>`;
            box.querySelector('.p8-outcome').before(tb);
            tb.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
              const o = tempt.options[+b.dataset.i];
              S.rec.temptation = { choice: o.label, followedPlan: !!o.plan, at: S.lock.cursor - 1 };
              tb.innerHTML = `<div class="p8-tip">Noted: ${esc(o.label)}. Replay continues.</div>`;
              play();
            }));
            return;
          }
          if (S.lock.cursor >= c.m1.length) { stopPlay(); drawReplay(); showOutcome(); }
        };
        S.speed = 2; play(); drawReplay();
      });
      function showOutcome() {
        S.onCursor = null;
        box.querySelector('.p8-reassess').hidden = true;
        S.rec.timeline.OUTCOME = { at: Date.now() };
        drawTimeline(); drawReview(true);
        const out = box.querySelector('.p8-outcome');
        const rows = (rv.rows || []).map(([k, v, tone]) => `<div class="p8-oc-r ${tone ? `is-${tone}` : ''}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
        out.innerHTML = `<div class="p8-oc is-${rv.tone || 'plain'}">${rv.headline ? `<div class="p8-oc-h">${rv.headline}</div>` : ''}${rows}</div>${rv.note ? `<p class="p8-say">${rv.note}</p>` : ''}${btn(st.cta || 'Review the case →', 'is-primary')}`;
        if (rv.tone === 'light') { helpers.handleStreak?.(true); }
        out.querySelector('.p8-btn').addEventListener('click', next);
      }
    },

    ask(box, st, next) {
      box.innerHTML = `${head(st, '')}${dayliLines(st.lines)}<div class="p8-q">${st.q}</div>
        <div class="p8-opts">${st.options.map((o, i) => `<button type="button" class="p8-opt" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>
        <div class="p8-fb"></div><div class="p8-after"></div>`;
      const fb = box.querySelector('.p8-fb');
      const picked = new Set();
      let first = null;
      box.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
        const o = st.options[+b.dataset.i];
        if (first == null) { first = o; S.rec.asks[st.key || `ask${S.k}`] = o.label; if (o.track) trackP8(o.track); }
        if (st.multi) {
          b.classList.toggle('on'); if (b.classList.contains('on')) picked.add(+b.dataset.i); else picked.delete(+b.dataset.i);
          const okAll = st.options.every((x, i) => !!x.ok === picked.has(i));
          fb.innerHTML = o.say ? `<div class="p8-fbi is-${o.ok ? 'ok' : 'warn'}">${o.say}</div>` : '';
          if (okAll) done();
          return;
        }
        box.querySelectorAll('.p8-opt').forEach((x) => x.classList.toggle('on', x === b));
        b.classList.add(o.ok ? 'is-ok' : 'is-no');
        fb.innerHTML = `<div class="p8-fbi is-${o.ok ? 'ok' : 'warn'}">${o.say || (o.ok ? '✓' : 'Look again.')}</div>`;
        helpers.handleStreak?.(!!o.ok);
        if (o.ok || st.need === 'any') done();
      }));
      function done() {
        if (box.querySelector('.p8-after .p8-btn')) return;
        box.querySelectorAll('.p8-opt').forEach((x) => { x.disabled = true; });
        box.querySelector('.p8-after').innerHTML = `${dayliLines(st.after)}${btn(st.cta || 'Continue →', 'is-primary')}`;
        box.querySelector('.p8-after .p8-btn').addEventListener('click', next);
      }
    },

    grade(box, st, next) {
      drawReview(true);
      const g = S.rec.grades || (S.rec.grades = {});
      const na = st.na || [];
      const dim = (k, label, opts) => `<div class="p8-gr"><div class="p8-gr-l">${label}</div>${chips(k, [...opts, ...(na.includes(k) ? ['N/A'] : [])], g[k])}</div>`;
      box.innerHTML = `<div class="p8-kicker">${esc(st.kicker || 'STUDENT REVIEWS FIRST')}</div><h3 class="p8-h">${esc(st.title || 'Grade your own process')}</h3>
        ${dayliLines(st.lines)}
        ${dim('validity', 'Setup validity', VALIDITY)}${dim('quality', 'Setup quality', QUALITY)}
        ${dim('analysis', 'Analysis', GRADES)}${dim('execution', 'Execution', GRADES)}${dim('risk', 'Risk', GRADES)}${dim('management', 'Management', GRADES)}
        <div class="p8-gr is-last"><div class="p8-gr-l">Outcome</div><div class="p8-oc-pill">${esc(outcomeLabel(c))}</div></div>
        <label class="p8-lbl">One lesson from this case</label><textarea class="p8-ta" rows="2" placeholder="Not “it won” or “it lost.” What did the process teach you?">${esc(S.rec.lesson || '')}</textarea>
        ${btn('Compare with Dayli →', 'is-primary p8-rec')}<div class="p8-after"></div>`;
      const b = box.querySelector('.p8-rec');
      const ta = box.querySelector('.p8-ta');
      const keys = ['validity', 'quality', 'analysis', 'execution', 'risk', 'management'];
      const sync = () => { b.disabled = !(keys.every((k) => g[k]) && ta.value.trim().length >= 6); };
      bindChips(box, (k, v) => { g[k] = v; sync(); });
      ta.addEventListener('input', () => { S.rec.lesson = ta.value; sync(); });
      sync();
      b.addEventListener('click', () => {
        b.remove(); box.querySelectorAll('.p8-chips button').forEach((x) => { x.disabled = true; }); ta.disabled = true;
        (st.track || []).forEach(([k, v, ev]) => { if (g[k] === v) trackP8(ev); });
        const rc = reportCard(c, S.rec);
        const cell = (m, e) => `<span class="${m && e && m === e ? 'is-same' : m && e ? 'is-diff' : ''}">${esc(m || '·')}</span>`;
        box.querySelector('.p8-after').innerHTML = `
          <div class="p8-rc">
            <div class="p8-rc-h">TRADE REPORT CARD</div>
            <div class="p8-rc-row is-head"><span></span><span>YOU</span><span>DAYLI</span></div>
            <div class="p8-rc-row"><span>Setup validity</span>${cell(rc.setupValidity.mine, rc.setupValidity.expert)}${cell(rc.setupValidity.expert, rc.setupValidity.expert)}</div>
            <div class="p8-rc-row"><span>Setup quality</span>${cell(rc.setupQuality.mine, rc.setupQuality.expert)}${cell(rc.setupQuality.expert, rc.setupQuality.expert)}</div>
            ${rc.dims.map((x) => `<div class="p8-rc-row"><span>${x.label}</span>${cell(x.mine, x.expert)}${cell(x.expert, x.expert)}</div>${x.reasons ? `<div class="p8-rc-why">${x.reasons}</div>` : ''}`).join('')}
            ${rc.ruleAdherence ? `<div class="p8-rc-row"><span>Rule adherence</span><span></span><span>${esc(rc.ruleAdherence)}</span></div>` : ''}
            <div class="p8-rc-row is-outcome"><span>Outcome</span><span></span><span>${esc(outcomeLabel(c))}</span></div>
          </div>
          ${st.foot ? `<div class="p8-principle is-sm">${st.foot}</div>` : ''}
          ${c.expert?.lesson ? `<p class="p8-say"><b>Dayli’s lesson:</b> ${c.expert.lesson}</p>` : ''}
          ${btn(st.cta || 'Continue →', 'is-primary')}`;
        box.querySelector('.p8-after .p8-btn').addEventListener('click', next);
      });
    },

    diff(box, st, next) {
      drawReview(true);
      S.view.show = 'both'; drawReview(true); drawChart();
      const rows = reasoningDiff(c, S.rec);
      const byStage = {};
      rows.forEach((r) => { (byStage[r.stage] = byStage[r.stage] || []).push(r); });
      const n = (s) => rows.filter((r) => r.status === s).length;
      box.innerHTML = `<div class="p8-kicker">REVIEW WITH DAYLI</div><h3 class="p8-h">${esc(st.title || 'Your read · Dayli’s read')}</h3>
        ${dayliLines(st.lines)}
        <div class="p8-tally"><span class="is-ok">${n('MATCHED')} matched</span><span class="is-warn">${n('DIFFERED')} differed</span><span class="is-review">${n('NEEDS REVIEW')} defensible</span><span class="is-miss">${n('MISSED')} missed</span><span class="is-extra">${n('EXTRA')} extra</span></div>
        ${Object.entries(byStage).map(([k, rs]) => `<div class="p8-sub">${esc(k)}</div>${diffRows(rs)}`).join('')}
        ${(c.expert?.acceptableAlternateReads || []).length ? `<div class="p8-sub">DEFENSIBLE ALTERNATE READS</div>${c.expert.acceptableAlternateReads.map((a) => `<p class="p8-say">≈ ${a}</p>`).join('')}` : ''}
        ${S.rec.reassess.length ? `<div class="p8-sub">WHERE YOU FLAGGED A REASSESS</div>${S.rec.reassess.map((r) => `<div class="p8-tip">⚑ ${r.time}${r.note ? ` · ${esc(r.note)}` : ''}</div>`).join('')}` : ''}
        <label class="p8-lbl">Post-trade reflection (your original read stays as it was)</label><textarea class="p8-ta" rows="2">${esc(S.rec.reflection || '')}</textarea>
        ${btn(st.cta || 'Finish review →', 'is-primary')}`;
      box.querySelector('.p8-ta').addEventListener('input', (e) => { S.rec.reflection = e.target.value; });
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    card(box, st, next) {
      const fillV = (v) => String(v).replace('{outcome}', outcomeLabel(c));
      box.innerHTML = `<div class="p8-card ${st.tone ? `is-${st.tone}` : ''}"><div class="p8-card-h">${esc(st.title)}</div>${(st.rows || []).map(([k, v, tone]) => `<div class="p8-oc-r ${tone ? `is-${tone}` : ''}"><span>${esc(k)}</span><b>${esc(fillV(v))}</b></div>`).join('')}${st.foot ? `<div class="p8-card-f">${st.foot}</div>` : ''}</div>${dayliLines(st.lines)}${btn(st.cta || 'Continue →', 'is-primary')}`;
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    compare(box, st, next) {
      box.innerHTML = `${head(st, 'Side by side')}
        <div class="p8-cmp">${st.columns.map((col) => `<div class="p8-cmp-c"><div class="p8-cmp-h">${esc(col.title)}</div>${col.bars ? miniChart(col.bars, col.decision) : ''}${col.rows.map(([k, v, tone]) => `<div class="p8-oc-r ${tone ? `is-${tone}` : ''}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`).join('')}</div>
        ${(st.qa || []).map(([q, a]) => `<div class="p8-qa"><div class="p8-q">${esc(q)}</div><button type="button" class="p8-reveal-a">Reveal</button><div class="p8-a" hidden>${a}</div></div>`).join('')}
        ${btn(st.cta || 'Continue →', 'is-primary')}`;
      box.querySelectorAll('.p8-reveal-a').forEach((b) => b.addEventListener('click', () => { b.nextElementSibling.hidden = false; b.remove(); }));
      box.querySelector('.p8-btn').addEventListener('click', next);
    },

    indicator(box, st, next) {
      S.tf = '1M'; S.view.indicator = true; S.view.show = st.show || 'mine';
      const types = ['PIL', 'INDICATION', 'CORRECTION', 'CONTINUATION', 'RETEST'];
      const ind = c.indicator?.marks || [];
      const mine = compareMarks(c, S.rec.marks, ind, types);
      const n = mine.filter((r) => r.status === 'MATCHED').length;
      const verdict = n === types.length ? 'MATCH' : n >= 3 ? 'PARTIAL DIFFERENCE' : 'MAJOR DIFFERENCE';
      box.innerHTML = `<div class="p8-kicker">ROUND 2 · INDICATOR ON</div><h3 class="p8-h">${esc(st.title || 'Your eyes vs. the indicator')}</h3>
        <div class="p8-verdict is-${verdict === 'MATCH' ? 'ok' : verdict === 'PARTIAL DIFFERENCE' ? 'review' : 'warn'}">${verdict}</div>
        <div class="p8-3w"><div class="p8-3w-r is-head"><span></span><span>YOUR EYES</span><span>INDICATOR</span><span>DAYLI</span></div>
        ${types.map((t) => { const me = S.rec.marks.find((m) => m.type === t); const i = ind.find((m) => m.type === t); const e = (c.expert?.marks || []).find((m) => m.type === t); return `<div class="p8-3w-r"><span>${MARKS[t].label}</span><span>${markText(me)}</span><span>${markText(i)}</span><span class="p8-dayli-col" hidden>${markText(e)}</span></div>`; }).join('')}</div>
        ${verdict === 'MATCH' ? dayliLines(st.match) : `<div class="p8-q">${esc(st.q || 'Before Dayli weighs in: why do you think your read and the indicator differ?')}</div>${chips('indWhy', st.why || ['The indicator chose a different swing as the PIL', 'I labeled a wick as an event', 'I marked an event before its candle closed', 'I’m not sure yet'], null)}`}
        <div class="p8-after"></div>`;
      const reveal = () => {
        if (box.querySelector('.p8-after .p8-btn')) return;
        box.querySelectorAll('.p8-dayli-col').forEach((x) => { x.hidden = false; });
        S.view.show = 'both'; drawChart();
        box.querySelector('.p8-after').innerHTML = `${dayliLines(st.after)}${btn(st.cta || 'Continue →', 'is-primary')}`;
        box.querySelector('.p8-after .p8-btn').addEventListener('click', next);
      };
      if (verdict === 'MATCH') reveal();
      bindChips(box, (k, v) => { S.rec.asks.indWhy = v; reveal(); });
    },

    classify(box, st, next) {
      const g = S.rec.grades || (S.rec.grades = {});
      const keys = [['validity', 'Setup validity', VALIDITY], ['quality', 'Quality review', QUALITY], ['decision', 'Decision', ['TAKE', 'WAIT', 'PASS']]];
      box.innerHTML = `<div class="p8-kicker">THREE SEPARATE LABELS</div><h3 class="p8-h">${esc(st.title || 'Classify this setup')}</h3>
        <p class="p8-dim">Validity is method compliance. Quality is your contextual review. The decision is what you do. They don’t have to match.</p>
        ${keys.map(([k, l, o]) => `<div class="p8-gr"><div class="p8-gr-l">${l}</div>${chips(k, o, g[k])}</div>`).join('')}
        ${btn('Lock my labels', 'is-primary p8-rec')}<div class="p8-after"></div>`;
      const b = box.querySelector('.p8-rec');
      const sync = () => { b.disabled = !keys.every(([k]) => g[k]); };
      bindChips(box, (k, v) => { g[k] = v; if (k === 'decision') S.rec.decision = { choice: v }; sync(); });
      sync();
      b.addEventListener('click', () => {
        b.remove(); box.querySelectorAll('.p8-chips button').forEach((x) => { x.disabled = true; });
        const [ev, eq, ed] = st.expect;
        const alt = c.expert?.altDecisions || [];
        const cell = (mine, exp, ok) => `<span class="${ok ? 'is-same' : 'is-diff'}">${esc(mine)}</span><span>${esc(exp)}</span>`;
        box.querySelector('.p8-after').innerHTML = `<div class="p8-rc"><div class="p8-rc-row is-head"><span></span><span>YOU</span><span>DAYLI</span></div>
          <div class="p8-rc-row"><span>Validity</span>${cell(g.validity, ev, g.validity === ev)}</div>
          <div class="p8-rc-row"><span>Quality</span>${cell(g.quality, eq, g.quality === eq)}</div>
          <div class="p8-rc-row"><span>Decision</span>${cell(g.decision, ed, g.decision === ed || alt.includes(g.decision))}</div></div>
          <p class="p8-say">${st.why}</p>
          <p class="p8-dim">A / B / C are review labels, never automatic signals.</p>${btn('Next setup →', 'is-primary')}`;
        box.querySelector('.p8-after .p8-btn').addEventListener('click', next);
      });
    },

    pregrade(box, st, next) {
      const g = S.rec.pregrade || (S.rec.pregrade = {});
      box.innerHTML = `<div class="p8-kicker">BEFORE THE OUTCOME</div><h3 class="p8-h">${esc(st.title || 'Grade the setup now')}</h3>
        <p class="p8-dim">This is your original grade. It gets compared with how you review the trade after the outcome.</p>
        <div class="p8-gr"><div class="p8-gr-l">Setup validity</div>${chips('validity', VALIDITY, g.validity)}</div>
        <div class="p8-gr"><div class="p8-gr-l">Setup quality</div>${chips('quality', QUALITY, g.quality)}</div>${btn('Record my grade', 'is-primary p8-rec')}`;
      const b = box.querySelector('.p8-rec'); b.disabled = true;
      bindChips(box, (k, v) => { g[k] = v; b.disabled = !(g.validity && g.quality); });
      b.addEventListener('click', next);
    },

    assist(box, st, next) {
      const cur = indicatorAssist();
      box.innerHTML = `<div class="p8-kicker">INDICATOR ASSIST MODE</div><h3 class="p8-h">How should the indicator help you practice?</h3>
        <p class="p8-dim">You can change this any time. In Phase 8 the default is <b>Reveal after analysis</b>: you read first, then check.</p>
        ${chips('assist', [['OFF', 'Off'], ['AFTER', 'Reveal after analysis'], ['ON', 'On']], cur)}${btn('Save setting', 'is-primary')}`;
      let v = cur;
      bindChips(box, (k, val) => { v = val; });
      box.querySelector('.p8-btn').addEventListener('click', () => { setIndicatorAssist(v); if (v === 'ON') trackP8('indicatorOnPref'); next(); });
    },

    journal(box, st, next) {
      const e = journalEntry(c, S.rec, opts.source || 'ACADEMY_CASE');
      box.innerHTML = `${head(st, 'Saved to your practice journal')}
        <p class="p8-dim">You didn’t type any of this twice. The breakdown <b>is</b> the journal entry.</p>
        <div class="p8-je">
          ${[['Source', e.entrySource], ['Case', `${c.caseNo || ''} · ${CASE_TYPES[c.caseType] || c.caseType}`], ['Instrument', e.instrument], ['PIL', e.pil != null ? fmtP(e.pil) : '·'], ['ICC', e.iccSequence.join(' → ') || '·'], ['Decision', e.participationDecision || '·'], ['Validity / quality', `${e.setupValidity || '·'} · ${e.setupQuality || '·'}`], ['Grades A/E/R/M', [e.analysisGrade, e.executionGrade, e.riskGrade, e.managementGrade].map((x) => x || '·').join(' · ')], ['Outcome', `${outcomeLabel(c)}`], ['Lesson', e.studentLesson || '·']].map(([k, v]) => `<div class="p8-je-r"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
        </div>${btn(st.cta || 'Close the case ✓', 'is-primary')}`;
      box.querySelector('.p8-btn').addEventListener('click', next);
    },
  };

  // Reopening a finished case starts a fresh attempt but keeps the old record visible.
  if (prior?.completedAt && !opts.fresh) {
    S.status = 'OPEN';
  }
  if (window.__aghfTest) window.__p8 = { S, c, placeMark, go, draw };
  draw();
  go(0);
}

function outcomeLabel(c) {
  const o = c.outcome || {};
  const r = o.r != null ? ` · ${o.r > 0 ? '+' : ''}${o.r}R` : '';
  return {
    WIN: `TARGET HIT${r}`, LOSS: `STOP HIT${r}`, BE: 'BREAKEVEN', NO_POSITION: 'NO POSITION', WOULD_HAVE_WON: 'Would have hit target', WOULD_HAVE_LOST: 'Would have hit stop',
    RAN_WITHOUT_ENTRY: 'Ran without an entry', CHOP: 'Chopped sideways', NO_RESOLUTION: 'No resolution',
  }[o.type] || o.type || '·';
}

function miniChart(bars, decision) {
  const w = 300, h = 120; const hi = Math.max(...bars.map((b) => b.h)), lo = Math.min(...bars.map((b) => b.l));
  const y = (p) => 6 + ((hi - p) / (hi - lo || 1)) * (h - 12); const sw = w / bars.length;
  return `<svg viewBox="0 0 ${w} ${h}" class="p8-mini">${decision != null ? `<rect x="${px((decision + 1) * sw)}" y="0" width="${px(w - (decision + 1) * sw)}" height="${h}" fill="rgba(255,255,255,.05)"/><line x1="${px((decision + 1) * sw)}" x2="${px((decision + 1) * sw)}" y1="0" y2="${h}" stroke="#E9B949" stroke-dasharray="4 3"/>` : ''}${bars.map((b, i) => { const up = b.c >= b.o; const cx = (i + 0.5) * sw; return `<line x1="${px(cx)}" x2="${px(cx)}" y1="${px(y(b.h))}" y2="${px(y(b.l))}" stroke="${up ? '#5FD3BF' : '#F07892'}"/><rect x="${px(cx - sw * 0.3)}" y="${px(y(Math.max(b.o, b.c)))}" width="${px(sw * 0.6)}" height="${px(Math.max(1, Math.abs(y(b.o) - y(b.c))))}" fill="${up ? '#5FD3BF' : '#F07892'}"/>`; }).join('')}</svg>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   p8_lab: the Real Trade Breakdown Lab case board
   ═══════════════════════════════════════════════════════════════════════ */
export function renderLab(el, slide, satisfy, helpers = {}) {
  document.body.classList.add('p8-on');
  const cases = slide.cases || [];
  const recordDone = (id) => !!caseRecord(id)?.completedAt;

  function board() {
    const recs = recommendedCases(cases.map((cs) => ({ id: cs.case.id, categories: cs.categories || [], cs })));
    const next = recs.find((r) => !r.done);
    const allDone = cases.every((cs) => recordDone(cs.case.id));
    el.innerHTML = `
      <div class="p8-lab">
        <div class="p8-lab-h"><div class="p8-brand"><span class="p8-dot"></span>REAL TRADE BREAKDOWN LAB 📊</div><div class="p8-lab-sub">Case studies, not mini-games. Outcomes stay locked until you’ve committed to a read.</div></div>
        ${next ? `<div class="p8-rec-box"><div class="p8-sub">RECOMMENDED NEXT</div><div class="p8-rec-l"><b>${esc(next.cs.case.caseNo)}</b> · ${esc(next.cs.focus || (next.categories || []).join(' · '))}${next.why.length ? `<em> · picked from your Academy history: ${esc(next.why.join(', '))}</em>` : ''}</div>${'<button type="button" class="p8-btn is-primary p8-open-rec">OPEN CASE →</button>'}</div>` : ''}
        <div class="p8-board">${cases.map((cs, i) => {
          const done = recordDone(cs.case.id); const c = cs.case;
          return `<div class="p8-cf ${done ? 'is-done' : ''}">
            <div class="p8-cf-no">${esc(c.caseNo)}</div>
            <div class="p8-cf-t">${done ? esc(cs.label || c.title) : `🔒 ${esc(cs.focus || 'Classified until reviewed')}`}</div>
            <dl><dt>Instrument</dt><dd>${esc(c.instrument || 'MNQ')}</dd><dt>Outcome</dt><dd>${done ? esc(outcomeLabel(c)) : '🔒 HIDDEN'}</dd><dt>Indicator</dt><dd>${c.indicatorInitiallyEnabled ? 'ON' : 'OFF'}</dd><dt>Difficulty</dt><dd>${esc(c.difficulty)}</dd></dl>
            <button type="button" class="p8-btn ${done ? '' : 'is-primary'}" data-i="${i}">${done ? 'Review again' : 'OPEN CASE →'}</button>
          </div>`;
        }).join('')}</div>
        ${allDone ? '<button type="button" class="p8-btn is-primary p8-lab-finish">See my analyst review →</button>' : `<div class="p8-dim p8-lab-count">${cases.filter((cs) => recordDone(cs.case.id)).length} of ${cases.length} cases reviewed</div>`}
      </div>`;
    el.querySelectorAll('.p8-cf .p8-btn').forEach((b) => b.addEventListener('click', () => open(+b.dataset.i)));
    el.querySelector('.p8-open-rec')?.addEventListener('click', () => open(cases.indexOf(next.cs)));
    el.querySelector('.p8-lab-finish')?.addEventListener('click', review);
  }

  function open(i) {
    const cs = cases[i];
    el.innerHTML = '';
    const host = document.createElement('div'); el.appendChild(host);
    renderCase(host, { case: JSON.parse(JSON.stringify(cs.case)), steps: cs.steps || cs.case.steps }, null, helpers, { onDone: () => { board(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, fresh: true });
    const back = document.createElement('button'); back.type = 'button'; back.className = 'p8-back'; back.textContent = '← Case board';
    back.addEventListener('click', board); el.prepend(back);
  }

  function review() {
    el.innerHTML = `<div class="p8-lab p8-analyst">
      <div class="p8-brand"><span class="p8-dot"></span>ANALYST REVIEW</div>
      <div class="p8-ar-list">${cases.map((cs) => `<div class="p8-ar-i"><span>${esc(cs.label || cs.case.title)}</span><b>✓</b></div>`).join('')}</div>
      <div class="p8-principle">YOU’VE NOW REVIEWED MORE THAN RESULTS.<br>YOU’VE REVIEWED <em>DECISIONS.</em></div>
      <button type="button" class="p8-btn is-primary">Continue →</button></div>`;
    el.querySelector('.p8-btn').addEventListener('click', () => satisfy?.());
  }

  board();
}

/* ═══════════════════════════════════════════════════════════════════════
   p8_evidence: the Section 1 → Section 2 turn. Her own data is empty, and that's the point.
   ═══════════════════════════════════════════════════════════════════════ */
export function renderEvidence(el, s, satisfy) {
  if (s.badge) {
    try {
      const all = JSON.parse(localStorage.getItem('aghf_badges') || '[]');
      if (!all.some((b) => b.id === s.badge.id)) { all.push({ ...s.badge, at: Date.now() }); localStorage.setItem('aghf_badges', JSON.stringify(all)); }
    } catch { /* storage blocked */ }
  }
  const reviewed = Object.values(caseRecordsSafe()).filter((r) => r.completedAt).length;
  el.innerHTML = `<div class="p8-ev">
    <div class="p8-ev-l">${esc(s.line1 || 'YOU’VE STUDIED MY EXAMPLES.')}</div>
    <div class="p8-ev-l p8-ev-2">${esc(s.line2 || 'NOW YOU NEED YOUR OWN.')}</div>
    <div class="p8-ev-grid">
      <div><b>${reviewed}</b><span>Academy cases reviewed</span></div>
      ${(s.empty || [['0', 'Backtests'], ['0', 'Personal screenshots'], ['0', 'Weekly reviews'], ['EMPTY', 'Your journal']]).map(([n, l]) => `<div class="is-empty"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}
    </div>
    <div class="p8-ev-l p8-ev-3">WATCHING BREAKDOWNS BUILDS UNDERSTANDING.<br><em>YOUR OWN DATA BUILDS EVIDENCE.</em></div>
  </div>`;
  if (satisfy) { const b = document.createElement('button'); b.className = 'p8-btn is-primary'; b.textContent = 'Continue →'; b.addEventListener('click', satisfy); el.appendChild(b); }
}
function caseRecordsSafe() { try { return JSON.parse(localStorage.getItem('aghf_p8_cases') || '{}'); } catch { return {}; } }

export const CASEFILE_RENDERERS = {
  p8_evidence: (el, s, sat) => renderEvidence(el, s, sat),
  p8_case: (el, s, sat, h) => renderCase(el, s, sat, h),
  p8_lab: (el, s, sat, h) => renderLab(el, s, sat, h),
};
