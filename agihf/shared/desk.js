/**
 * MY TRADER DESK · the real tools.
 *
 * The same functions run inside Phase 8 Section 2 lessons (as p8_tool slides) and on
 * desk.html after graduation. Lessons teach the student her actual journal, backtesting
 * lab, dashboard and reviews; there is no demo version to throw away.
 */
import { visibleBars, clock, MARKS } from './case-core.js';
import {
  METHOD_VERSION, MILESTONES, milestone, studies, study, newStudy, lockStudy, studyChange, newStudyVersion, STUDY_RULE_FIELDS,
  reps, saveRep, rep, shots, saveShot, SHOT_TAGS, journalEntries, fromLiveJournal, VIOLATION_TAGS, TRIGGERS, metrics, qualityMatrix, violationInsights,
  FOCUS_LIBRARY, currentFocus, setFocus, recommendFocus, weeklySummary, saveWeeklyReview, weeklyReviews, monthlySummary, saveMonthlyReview, monthlyReviews,
  diagnose, VERDICT_TEXT, experiments, proposeChange, assemblePlan, planConflicts, lockPlan, currentPlan, plans, academyStatus, alumni, EARLY_SAMPLE,
} from './desk-core.js';
import { loadRiskProfile } from './risk-core.js';
import { loadRulebook, queueRuleChange, recordViolation, ruleQueue } from './rules-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const fmtP = (v) => (v == null || !Number.isFinite(+v) ? '·' : (+v).toFixed(2));
const fmtR = (v) => (v == null ? '·' : `${v > 0 ? '+' : ''}${v}R`);
const px = (v) => Math.round(v * 10) / 10;
const q4 = (x) => Math.round(x * 4) / 4;
const btn = (label, cls = '') => `<button type="button" class="p8-btn ${cls}">${label}</button>`;
const chips = (key, options, cur, multi = false) => `<div class="p8-chips ${multi ? 'is-multi' : ''}" data-key="${key}">${options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; const on = multi ? (cur || []).includes(v) : cur === v; return `<button type="button" data-v="${esc(v)}" class="${on ? 'on' : ''}">${esc(l)}</button>`; }).join('')}</div>`;
function bindChips(root, onPick) {
  root.querySelectorAll('.p8-chips').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (g.classList.contains('is-multi')) { b.classList.toggle('on'); onPick(g.dataset.key, [...g.querySelectorAll('button.on')].map((x) => x.dataset.v)); return; }
    g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); onPick(g.dataset.key, b.dataset.v);
  })));
}
const nTag = (n) => `<span class="dk-n">N = ${n}</span>`;

let SESSIONS = null;
export async function loadSessions() {
  if (SESSIONS) return SESSIONS;
  const r = await fetch('lessons-data/p8-sessions.json'); SESSIONS = (await r.json()).sessions; return SESSIONS;
}
export function sessionById(id) { return (SESSIONS || []).find((s) => s.id === id); }

/* ── a compact price chart (replay, thumbnails) ───────────────────────── */
function chartSvg(bars, o = {}) {
  const W = o.W || 900, H = o.H || 420, AX = o.axis === false ? 6 : 64, PT = 12, PB = 20;
  const slots = Math.max(o.slots || bars.length + 4, 20);
  const sw = (W - AX) / slots;
  const x = (i) => (i + 0.5) * sw;
  let hi = Math.max(...bars.map((b) => b.h)), lo = Math.min(...bars.map((b) => b.l));
  (o.levels || []).forEach((l) => { if (l.fit) { hi = Math.max(hi, l.price); lo = Math.min(lo, l.price); } });
  const pad = (hi - lo) * 0.08 || 3; hi += pad; lo -= pad;
  const y = (p) => PT + ((hi - p) / (hi - lo)) * (H - PT - PB);
  let s = `<rect width="${W}" height="${H}" fill="#100E18"/>`;
  if (o.axis !== false) for (let k = 0; k <= 4; k++) { const p = lo + ((hi - lo) * k) / 4; s += `<line x1="0" x2="${W - AX}" y1="${px(y(p))}" y2="${px(y(p))}" stroke="#221E33"/><text x="${W - AX + 6}" y="${px(y(p)) + 4}" class="p8-ax">${p.toFixed(2)}</text>`; }
  if (o.curtainAt != null) s += `<rect x="${px(x(o.curtainAt) - sw / 2)}" y="0" width="${px(W - AX - x(o.curtainAt) + sw / 2)}" height="${H}" fill="rgba(233,185,73,.04)" stroke="rgba(233,185,73,.25)" stroke-dasharray="6 6"/><text x="${px(x(o.curtainAt) + 8)}" y="${H / 2}" class="p8-curtain-t">🔒 ${esc(o.curtainLabel || 'FUTURE LOCKED')}</text>`;
  bars.forEach((b, i) => {
    const up = b.c >= b.o, cx = x(i), bw = Math.max(1.2, sw * 0.62);
    const col = up ? '#5FD3BF' : '#F07892';
    s += `<g opacity="${b.forming ? 0.55 : 1}"><line x1="${px(cx)}" x2="${px(cx)}" y1="${px(y(b.h))}" y2="${px(y(b.l))}" stroke="${col}" stroke-width="1.3"/><rect x="${px(cx - bw / 2)}" y="${px(y(Math.max(b.o, b.c)))}" width="${px(bw)}" height="${px(Math.max(1, Math.abs(y(b.o) - y(b.c))))}" fill="${col}"/></g>`;
  });
  (o.levels || []).forEach((l) => {
    const yy = y(l.price); if (yy < 0 || yy > H) return;
    s += `<line x1="${l.from != null ? px(x(l.from)) : 0}" x2="${W - AX}" y1="${px(yy)}" y2="${px(yy)}" stroke="${l.col}" stroke-width="1.5" stroke-dasharray="${l.dash || ''}"/>`;
    if (o.axis !== false) s += `<rect x="${W - AX - 8 - l.label.length * 6.6}" y="${px(yy - 9)}" width="${l.label.length * 6.6 + 8}" height="18" rx="4" fill="${l.col}"/><text x="${W - AX - 4}" y="${px(yy + 4)}" text-anchor="end" font-size="10.5" font-weight="700" fill="#1A1326">${esc(l.label)}</text>`;
  });
  (o.cmarks || []).forEach((m) => { const b = bars[m.index]; if (!b) return; const yy = y(b.l) + 18; s += `<rect x="${px(x(m.index) - m.label.length * 3.6 - 6)}" y="${px(yy - 12)}" width="${m.label.length * 7.2 + 12}" height="16" rx="8" fill="${m.col || '#F4829A'}"/><text x="${px(x(m.index))}" y="${px(yy)}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1A1326">${esc(m.label)}</text>`; });
  if (o.vline != null) s += `<line x1="${px(x(o.vline))}" x2="${px(x(o.vline))}" y1="0" y2="${H}" stroke="#E9B949" stroke-dasharray="6 5"/>`;
  return { svg: `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="p8-svg">${s}</svg>`, x, y, sw, yinv: (yy) => hi - ((yy - PT) / (H - PT - PB)) * (hi - lo) };
}

/** A screenshot is a pointer into a session (no image copy), drawn on demand. */
export function shotThumb(sh, W = 260, H = 130) {
  if (sh.dataUrl) return `<img src="${sh.dataUrl}" alt="" class="dk-thumb-img">`;
  const s = sessionById(sh.sessionId);
  if (!s) return '<div class="dk-thumb-missing">chart</div>';
  const bars = visibleBars(s, sh.tf || '1M', sh.upto ?? s.m1.length);
  const lv = [];
  if (sh.entry) lv.push({ price: sh.entry, col: '#E9E4F6', label: 'E' }, { price: sh.stop, col: '#E8657F', label: 'S' }, { price: sh.target, col: '#7ECEC4', label: 'T' });
  return chartSvg(sh.tf === '1M' ? bars : bars.slice(-50), { W, H, axis: false, levels: lv.filter((l) => l.price != null) }).svg;
}

/* ═══════════════════════════════════════════════════════════════════════
   AGHF REPLAY / BACKTESTING LAB
   ═══════════════════════════════════════════════════════════════════════ */
export async function renderReplay(el, opts = {}) {
  await loadSessions();
  const s = opts.session || sessionById(opts.sessionId) || SESSIONS[Math.floor(Math.random() * SESSIONS.length)];
  const prof = loadRiskProfile() || {};
  const st = { cursor: opts.reviewMode ? s.m1.length : 6, tf: '1M', playing: null, speed: 1, pil: null, cm: [], decision: null, pos: null, done: false, tool: null, mgmtEvents: [], decisionAt: null };
  const max = () => (opts.reviewMode ? s.m1.length : st.cursor);
  el.innerHTML = `<div class="dk-replay">
    <div class="dk-rp-top"><div class="p8-brand"><span class="p8-dot"></span>${opts.reviewMode ? 'HISTORICAL CHART · FULL VIEW' : 'AGHF REPLAY'}${opts.study ? ` · <span class="dk-study-tag">${esc(opts.study.title)} v${esc(opts.study.version)}</span>` : ''}</div>
      <div class="dk-rp-meta">${esc(s.instrument)} · ${esc(s.date)} · NY AM</div></div>
    <div class="dk-rp-grid">
      <div class="dk-rp-chartcol">
        <div class="p8-chartbar"><div class="p8-tfs">${['4H', '1H', '15M', '1M'].map((t) => `<button type="button" class="p8-tf" data-tf="${t}">${t}</button>`).join('')}</div>
          <div class="p8-tools">${opts.reviewMode ? '' : ['PIL', 'INDICATION', 'CORRECTION', 'CONTINUATION', 'RETEST'].map((t) => `<button type="button" class="p8-tool" data-t="${t}">${MARKS[t].label}</button>`).join('')}</div></div>
        <div class="dk-rp-chart"></div>
        <div class="p8-replay dk-rp-ctrl"></div>
        <div class="dk-scrub"><input type="range" min="1" max="${s.m1.length}" value="${st.cursor}"><span></span></div>
        <div class="p8-flash" hidden></div>
      </div>
      <aside class="dk-rp-side"></aside>
    </div></div>`;
  const $ = (q) => el.querySelector(q);
  const chartEl = $('.dk-rp-chart'), side = $('.dk-rp-side'), flashEl = $('.p8-flash'), scrub = $('.dk-scrub input');
  const flash = (t) => { flashEl.textContent = t; flashEl.hidden = false; clearTimeout(st.ft); st.ft = setTimeout(() => { flashEl.hidden = true; }, 2200); };
  el.querySelectorAll('.p8-tf').forEach((b) => b.addEventListener('click', () => { st.tf = b.dataset.tf; draw(); }));
  // The PIL goes on the 4H or the 1H (either, or both); the ICC candles go on the 1M.
  el.querySelectorAll('.p8-tool').forEach((b) => b.addEventListener('click', () => {
    st.tool = st.tool === b.dataset.t ? null : b.dataset.t;
    if (st.tool === 'PIL') { if (!['4H', '1H'].includes(st.tf)) st.tf = '1H'; flash('Click the PIL price on the 4H or 1H.'); }
    else if (st.tool) { st.tf = '1M'; flash(`Click the ${MARKS[st.tool].label.toLowerCase()} candle.`); }
    draw();
  }));
  scrub.addEventListener('input', () => {
    const v = +scrub.value;
    if (v > max()) { scrub.value = max(); flash(opts.backtest !== false ? 'FUTURE DATA IS LOCKED DURING A BACKTEST.' : 'FUTURE DATA IS LOCKED.'); opts.onScrubBlocked?.(); return; }
    st.view = v; draw();
  });

  function draw() {
    el.querySelectorAll('.p8-tf').forEach((b) => b.classList.toggle('on', b.dataset.tf === st.tf));
    el.querySelectorAll('.p8-tool').forEach((b) => b.classList.toggle('on', b.dataset.t === st.tool));
    const upto = Math.min(st.view ?? st.cursor, max());
    const bars = visibleBars(s, st.tf, upto);
    const shown = st.tf === '1M' ? bars : bars.slice(-70);
    const W = Math.max(320, chartEl.clientWidth || 900), H = Math.round(Math.min(520, Math.max(280, W * (W < 640 ? 0.75 : 0.5))));
    const levels = [];
    // Your PIL shows on the timeframe you marked it on and carries down to every lower one.
    const TFS = ['4H', '1H', '15M', '1M'];
    // On a lower timeframe the chart stretches to keep a nearby PIL in view (one that is far away stays off-screen).
    const lastC = bars.length ? bars[bars.length - 1].c : null;
    if (st.pil != null && TFS.indexOf(st.tf) >= TFS.indexOf(st.pilTf || '1H')) levels.push({ price: st.pil, col: '#F4829A', label: `MY ${st.pilTf || '1H'} PIL`, fit: lastC != null && Math.abs(st.pil - lastC) <= 80 });
    if (st.pos && st.tf === '1M') levels.push({ price: st.pos.entry, col: '#2C1810', label: 'ENTRY', from: st.pos.at, fit: true }, { price: st.pos.stop, col: '#E8657F', label: 'STOP', from: st.pos.at, fit: true }, { price: st.pos.target, col: '#7ECEC4', label: 'TARGET', from: st.pos.at, fit: true });
    if (opts.reviewMode && opts.showExpert) (s.expert?.marks || []).filter((m) => m.type === 'PIL').forEach((m) => levels.push({ price: m.price, col: '#E9B949', label: 'DAYLI PIL', dash: '9 6' }));
    const cm = st.tf === '1M' ? st.cm.map((m) => ({ ...m, label: MARKS[m.type].short })) : [];
    const ch = chartSvg(shown, { W, H, slots: st.tf === '1M' ? s.m1.length + 4 : 74, levels, cmarks: cm, curtainAt: st.tf === '1M' && !opts.reviewMode ? upto : null, curtainLabel: 'FUTURE LOCKED', vline: st.pos && st.tf === '1M' ? st.pos.at : null });
    chartEl.innerHTML = ch.svg;
    st.geo = { ...ch, off: bars.length - shown.length, n: bars.length };
    chartEl.querySelector('svg').addEventListener('click', onClick);
    scrub.max = s.m1.length; scrub.value = upto;
    $('.dk-scrub span').textContent = opts.reviewMode ? 'scrub the whole session' : `${clock(s, upto - 1)} · you can scrub back, not forward`;
    drawCtrl(); drawSide();
  }
  function onClick(ev) {
    if (!st.tool) return;
    if (st.tool === 'PIL' && !['4H', '1H'].includes(st.tf)) return flash('Mark the PIL on the 4H or 1H.');
    if (st.tool !== 'PIL' && st.tf !== '1M') return flash('Mark the ICC candles on the 1M.');
    const svg = chartEl.querySelector('svg'); const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (st.tool === 'PIL') { st.pil = q4(st.geo.yinv(loc.y)); st.pilTf = st.tf; }
    else { const i = Math.floor(loc.x / st.geo.sw); if (i >= max()) return flash('Mark a candle that has closed.'); st.cm = st.cm.filter((m) => m.type !== st.tool); st.cm.push({ type: st.tool, index: i }); }
    st.tool = null; draw();
  }
  function drawCtrl() {
    const ctrl = $('.dk-rp-ctrl');
    if (opts.reviewMode) { ctrl.innerHTML = ''; return; }
    ctrl.innerHTML = `<button type="button" data-a="back">◀</button><button type="button" data-a="play" class="p8-play">${st.playing ? '❚❚ Pause' : '▶ Play'}</button><button type="button" data-a="next">Next ▶|</button><button type="button" data-a="speed" class="p8-speed">${st.speed}×</button><span class="p8-rp-t">${clock(s, st.cursor - 1)}</span><span class="p8-rp-lock">🔒 Future locked</span>`;
    ctrl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => act(b.dataset.a)));
  }
  function act(a) {
    if (a === 'speed') { st.speed = st.speed === 1 ? 2 : st.speed === 2 ? 4 : 1; if (st.playing) { stop(); play(); } return draw(); }
    if (a === 'play') { if (st.playing) stop(); else play(); return draw(); }
    if (a === 'back') { st.view = Math.max(1, (st.view ?? st.cursor) - 1); return draw(); }
    if (a === 'next') { step(); }
  }
  function step() {
    if (st.view != null && st.view < st.cursor) { st.view += 1; if (st.view >= st.cursor) st.view = null; return draw(); }
    if (st.cursor >= s.m1.length) { stop(); endSession(); return; }
    st.cursor += 1; st.view = null;
    if (st.pos) checkPosition();
    draw();
  }
  function play() { st.playing = setInterval(step, 650 / st.speed); }
  function stop() { clearInterval(st.playing); st.playing = null; }
  function checkPosition() {
    const b = s.m1[st.cursor - 1]; const p = st.pos; const long = p.target > p.entry;
    const hitS = long ? b.l <= p.stop : b.h >= p.stop; const hitT = long ? b.h >= p.target : b.l <= p.target;
    if (hitS || hitT) {
      const exit = hitS ? p.stop : p.target;
      p.exit = exit; p.exitAt = st.cursor - 1; p.r = Math.round(((long ? exit - p.entry : p.entry - exit) / p.risk) * 100) / 100;
      p.outcome = Math.abs(p.r) < 0.05 ? 'BE' : p.r > 0 ? 'WIN' : 'LOSS';
      stop(); st.done = true; finish();
    }
  }
  function endSession() {
    if (st.done) return; st.done = true;
    if (st.pos && !st.pos.outcome) { const last = s.m1[s.m1.length - 1].c; const long = st.pos.target > st.pos.entry; st.pos.r = Math.round(((long ? last - st.pos.entry : st.pos.entry - last) / st.pos.risk) * 100) / 100; st.pos.outcome = st.pos.r > 0.05 ? 'WIN' : st.pos.r < -0.05 ? 'LOSS' : 'BE'; st.pos.exitAt = s.m1.length - 1; }
    if (!st.decision) st.decision = 'PASS';
    finish();
  }

  function drawSide() {
    if (st.logged) return;
    if (st.done) return;
    if (opts.reviewMode) {
      side.innerHTML = `<div class="p8-kicker">FULL HISTORY VISIBLE</div><h3 class="p8-h">${esc(opts.reviewTitle || 'Find a winner')}</h3><p class="p8-say">${opts.reviewLine || 'Everything is visible: past and future. Scroll the chart and pick the trade you’d take.'}</p>${btn(opts.reviewCta || 'I found one →', 'is-primary dk-pick')}`;
      side.querySelector('.dk-pick').addEventListener('click', () => opts.onPick?.());
      return;
    }
    if (st.pos) {
      side.innerHTML = `<div class="p8-kicker">IN A POSITION</div><h3 class="p8-h">${st.pos.dir === 'long' ? 'Long' : 'Short'} ${st.pos.contracts}× @ ${fmtP(st.pos.entry)}</h3>
        <p class="p8-dim">Stop ${fmtP(st.pos.stop)} · target ${fmtP(st.pos.target)} · management plan: ${esc(opts.study?.managementModel || 'hold to target')}</p>
        <p class="p8-say">Keep replaying. The trade resolves at the stop, the target, or the session end.</p>
        <div class="dk-mg">${btn('Move stop to breakeven', 'dk-be')}${btn('Exit now', 'dk-exit')}</div>`;
      side.querySelector('.dk-be').addEventListener('click', () => { st.mgmtEvents.push({ type: 'MOVED STOP EARLY', at: st.cursor }); st.pos.stop = st.pos.entry; flash('Stop moved to breakeven.'); draw(); });
      side.querySelector('.dk-exit').addEventListener('click', () => { st.mgmtEvents.push({ type: 'FEAR EXIT', at: st.cursor }); const last = s.m1[st.cursor - 1].c; const long = st.pos.target > st.pos.entry; st.pos.exit = last; st.pos.exitAt = st.cursor - 1; st.pos.r = Math.round(((long ? last - st.pos.entry : st.pos.entry - last) / st.pos.risk) * 100) / 100; st.pos.outcome = Math.abs(st.pos.r) < 0.05 ? 'BE' : st.pos.r > 0 ? 'WIN' : 'LOSS'; stop(); st.done = true; finish(); });
      return;
    }
    const last = s.m1[st.cursor - 1].c;
    side.innerHTML = `<div class="p8-kicker">${opts.drillLabel ? esc(opts.drillLabel) : 'YOUR DECISION'}</div><h3 class="p8-h">Read · wait · decide</h3>
      <p class="p8-dim">Read the 4H and 1H, mark your PIL on the 4H or 1H, then replay the 1M candle by candle. Decide only with what has printed.</p>
      ${opts.study ? `<div class="dk-rules"><b>Study rules (locked)</b><div>${esc(opts.study.entryRule)} · ${esc(opts.study.stopRule)} · ${esc(opts.study.targetRule)}</div></div>` : ''}
      <div class="dk-decide">${btn('TAKE', 'is-primary dk-take')}${btn('WAIT', 'dk-wait')}${btn('PASS', 'dk-pass')}</div>
      <div class="dk-takeform" hidden><div class="p8-form">
        <label>Entry<input type="number" step="0.25" data-f="entry" value="${last}"></label>
        <label>Stop<input type="number" step="0.25" data-f="stop" value=""></label>
        <label>Target<input type="number" step="0.25" data-f="target" value=""></label>
        <label>Contracts<input type="number" min="1" step="1" data-f="contracts" value="1"></label></div>
        <div class="p8-riskline"></div>${btn('Place trade', 'is-primary dk-place')}</div>`;
    side.querySelector('.dk-wait').addEventListener('click', () => { flash('Waiting. Keep replaying.'); });
    side.querySelector('.dk-pass').addEventListener('click', () => { st.decision = 'PASS'; st.decisionAt = st.cursor; stop(); st.done = true; finish(); });
    const form = side.querySelector('.dk-takeform');
    side.querySelector('.dk-take').addEventListener('click', () => { stop(); form.hidden = false; drawCtrl(); });
    const val = () => Object.fromEntries([...form.querySelectorAll('input')].map((i) => [i.dataset.f, i.value === '' ? null : +i.value]));
    const rl = form.querySelector('.p8-riskline');
    form.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => {
      const v = val(); if (v.stop == null || v.target == null) { rl.innerHTML = ''; return; }
      const risk = Math.abs(v.entry - v.stop); const ok = (v.target - v.entry) * (v.entry - v.stop) > 0;
      rl.innerHTML = ok ? `<b>${risk.toFixed(2)} pts</b> · $${Math.round(risk * 2 * (v.contracts || 1))} at ${v.contracts} MNQ · ${(Math.abs(v.target - v.entry) / risk).toFixed(2)}R${prof.riskPerTradeLimit && risk * 2 * v.contracts > +prof.riskPerTradeLimit ? ' <span class="p8-warn">over your max risk per trade</span>' : ''}` : '<span class="p8-warn">Stop and target must be on opposite sides.</span>';
    }));
    form.querySelector('.dk-place').addEventListener('click', () => {
      const v = val(); if (v.stop == null || v.target == null || (v.target - v.entry) * (v.entry - v.stop) <= 0) return flash('Set a stop and a target on opposite sides.');
      st.decision = 'TAKE'; st.decisionAt = st.cursor;
      st.pos = { ...v, at: st.cursor - 1, dir: v.target > v.entry ? 'long' : 'short', risk: Math.abs(v.entry - v.stop) };
      draw(); play(); drawCtrl();
    });
  }

  /** Detect what the Academy already knows, so she reviews instead of retyping. */
  function finish() {
    stop();
    const u = s.u || 6;
    const viol = [];
    const m = s.marks || {};
    if (st.decision === 'TAKE') {
      const at = st.pos.at;
      if (s.setupState === 'NONE' || s.setupState === 'MESSY') viol.push({ tag: s.setupState === 'NONE' ? 'WRONG PIL' : 'EARLY ENTRY', category: 'ENTRY', auto: true, why: s.setupState === 'NONE' ? 'No indication ever closed through the level.' : 'Messy session: no clean confirmed sequence.' });
      else if (m.continuation == null || at < m.continuation) viol.push({ tag: 'NO CONTINUATION', category: 'ENTRY', auto: true, why: 'Entered before continuation closed.' });
      if (s.levels?.pil != null && Math.abs(st.pos.entry - s.levels.pil) > 2.2 * u) viol.push({ tag: 'CHASED', category: 'ENTRY', auto: true, why: `Entry ${Math.abs(st.pos.entry - s.levels.pil).toFixed(1)} pts from the PIL.` });
      const cap = prof.riskPerTradeLimit ? +prof.riskPerTradeLimit : null;
      if (cap && st.pos.risk * 2 * st.pos.contracts > cap) viol.push({ tag: 'OVERSIZED', category: 'RISK', auto: true, why: 'Risk above the saved profile.' });
      st.mgmtEvents.forEach((e) => viol.push({ tag: e.type, category: 'MANAGEMENT', auto: true, why: 'Outside the study’s management model.' }));
    }
    const pilOk = st.pil != null && s.levels?.pil != null ? Math.abs(st.pil - s.levels.pil) <= ({ '4H': 6, '1H': 2.5 }[st.pilTf] || 0.8) * u : null;
    if (pilOk === false && st.decision === 'TAKE' && !viol.some((v) => v.tag === 'WRONG PIL')) viol.push({ tag: 'WRONG PIL', category: 'ENTRY', auto: true, why: 'Your PIL wasn’t the level from the 1H map.' });
    const validPass = st.decision === 'PASS' && ['NONE', 'MESSY', 'INCOMPLETE'].includes(s.setupState);
    const draft = {
      entrySource: opts.source || (opts.study ? 'BACKTEST' : 'REPLAY'), studyId: opts.study?.studyId || null, sessionId: s.id, date: s.date, instrument: s.instrument, session: 'NY AM', direction: st.pos?.dir || s.dir,
      decision: st.decision, entry: st.pos?.entry ?? null, stop: st.pos?.stop ?? null, target: st.pos?.target ?? null, contracts: st.pos?.contracts ?? null,
      outcome: st.decision === 'TAKE' ? st.pos.outcome : 'NO_TRADE', realizedR: st.decision === 'TAKE' ? st.pos.r : null, pil: st.pil, pilOk,
      environment: s.environment, setupState: s.setupState, violations: viol, validPass,
      executionOk: st.decision === 'TAKE' ? !viol.some((v) => v.category === 'ENTRY') : null, riskOk: st.decision === 'TAKE' ? !viol.some((v) => v.category === 'RISK') : null, mgmtOk: st.decision === 'TAKE' ? !viol.some((v) => v.category === 'MANAGEMENT') : null,
      iccMarks: st.cm, decisionAt: st.decisionAt, expertState: s.setupState,
    };
    // Screenshots: BEFORE (1H context), ENTRY (1M at the decision), AFTER (1M to the outcome).
    draft.__shots = [
      { stage: 'BEFORE', tf: '1H', sessionId: s.id, upto: st.decisionAt || st.cursor },
      { stage: 'ENTRY', tf: '1M', sessionId: s.id, upto: st.decisionAt || st.cursor, entry: draft.entry, stop: draft.stop, target: draft.target },
      { stage: 'AFTER', tf: '1M', sessionId: s.id, upto: Math.min(s.m1.length, (st.pos?.exitAt ?? st.cursor) + 6), entry: draft.entry, stop: draft.stop, target: draft.target },
    ];
    st.view = null; st.cursor = Math.max(st.cursor, Math.min(s.m1.length, (st.pos?.exitAt ?? st.cursor) + 6)); opts.reviewMode = true; draw();
    side.innerHTML = '';
    st.logged = true;
    if (opts.noLog) { opts.onRep?.(draft); return; }
    renderRepLog(side, draft, { onSaved: (r) => opts.onRep?.(r), study: opts.study });
  }
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => el.isConnected && draw(), 120); });
  if (window.__aghfTest) window.__dk = { st, s, step, draw };
  draw();
  if (opts.autoPlay) play();
  return { session: s, state: st };
}

/* ── the AGHF journal flow: trade · setup · execution · mindset · review ── */
export function renderRepLog(el, draft, opts = {}) {
  const d = { review: {}, mindset: {}, triggers: [], ...draft };
  const auto = (d.violations || []).filter((v) => v.auto);
  el.innerHTML = `<div class="dk-log">
    <div class="p8-kicker">LOG THE REP · ${esc(d.entrySource)}</div><h3 class="p8-h">${d.decision === 'TAKE' ? `${d.outcome} · ${fmtR(d.realizedR)}` : d.decision === 'PASS' ? 'Pass' : d.decision === 'MISSED' ? 'Missed opportunity' : 'No trade'}</h3>
    <p class="p8-dim">Pre-filled from your replay. Review it. Don’t retype it.</p>
    <div class="dk-sec"><div class="p8-sub">1 · TRADE</div><div class="dk-kv">
      ${[['Instrument', d.instrument], ['Date', d.date], ['Session', d.session], ['Direction', d.direction], ['Contracts', d.contracts ?? '·'], ['Entry', fmtP(d.entry)], ['Stop', fmtP(d.stop)], ['Target', fmtP(d.target)], ['Outcome', d.outcome], ['R', fmtR(d.realizedR)]].map(([k, v]) => `<span>${k}</span><b>${esc(v)}</b>`).join('')}
    </div></div>
    <div class="dk-sec"><div class="p8-sub">2 · SETUP</div>
      <div class="p8-q">4H thesis</div>${chips('thesis', [['bull', 'Bullish'], ['bear', 'Bearish'], ['neutral', 'Neutral']], d.thesis)}
      <div class="p8-q">1H structure</div>${chips('structure', [['shift', 'Clean shift'], ['trend', 'Trending'], ['range', 'Overlapping / range']], d.structure)}
      <div class="p8-q">ICC validity</div>${chips('setupValidity', ['VALID', 'INVALID', 'INCOMPLETE'], d.setupValidity)}
      <div class="p8-q">Setup quality</div>${chips('setupQuality', ['A', 'B', 'C', 'PASS'], d.setupQuality)}
      <div class="p8-q">Environment</div>${chips('environment', ['CLEAN', 'MESSY', 'BETWEEN STRUCTURE', 'FAST', 'NEWS'], d.environment)}
      <div class="dk-kv"><span>PIL</span><b>${fmtP(d.pil)}${d.pilOk === true ? ' ✓' : d.pilOk === false ? ' (differs from the 1H map)' : ''}</b></div></div>
    <div class="dk-sec"><div class="p8-sub">3 · EXECUTION</div>
      ${auto.length ? `<div class="dk-auto">${auto.map((v) => `<div class="dk-auto-i">⚑ <b>${esc(v.tag)}</b> · ${esc(v.why || '')}</div>`).join('')}<div class="p8-tip">Detected from the replay. Remove one if it’s wrong.</div></div>` : d.decision === 'TAKE' ? '<div class="p8-tip">No execution violations detected.</div>' : ''}
      <div class="p8-q">Add a violation</div>${Object.entries(VIOLATION_TAGS).map(([cat, tags]) => `<div class="dk-vcat">${cat}</div>${chips(`v:${cat}`, tags, (d.violations || []).filter((v) => v.category === cat).map((v) => v.tag), true)}`).join('')}</div>
    <div class="dk-sec"><div class="p8-sub">4 · MINDSET</div>
      <div class="p8-q">Emotional state</div>${chips('state', ['Calm', 'Focused', 'Anxious', 'Frustrated', 'Excited', 'Tired'], d.mindset.state)}
      <div class="p8-q">Triggers felt (a feeling isn’t a violation)</div>${chips('triggers', TRIGGERS, d.triggers, true)}</div>
    <div class="dk-sec"><div class="p8-sub">5 · REVIEW</div>
      <input class="dk-in" data-r="worked" placeholder="What worked?"><input class="dk-in" data-r="didnt" placeholder="What didn’t?"><input class="dk-in" data-r="lesson" placeholder="One lesson"></div>
    ${btn('Save rep to my journal ✓', 'is-primary dk-save')}</div>`;
  bindChips(el, (k, v) => {
    if (k.startsWith('v:')) { const cat = k.slice(2); d.violations = [...(d.violations || []).filter((x) => x.category !== cat), ...v.map((tag) => ({ tag, category: cat, auto: (d.violations || []).some((x) => x.tag === tag && x.auto) }))]; return; }
    if (k === 'state') d.mindset.state = v; else if (k === 'triggers') d.triggers = v; else d[k] = v;
  });
  el.querySelectorAll('.dk-in').forEach((i) => i.addEventListener('input', () => { d.review[i.dataset.r] = i.value; }));
  el.querySelector('.dk-save').addEventListener('click', () => {
    d.ruleAdherence = !(d.violations || []).length;
    d.executionOk = d.decision === 'TAKE' ? !(d.violations || []).some((v) => v.category === 'ENTRY') : null;
    d.riskOk = d.decision === 'TAKE' ? !(d.violations || []).some((v) => v.category === 'RISK') : null;
    d.mgmtOk = d.decision === 'TAKE' ? !(d.violations || []).some((v) => v.category === 'MANAGEMENT') : null;
    d.studentLesson = d.review.lesson || '';
    const shotsDraft = d.__shots || []; delete d.__shots;
    const saved = saveRep(d);
    shotsDraft.forEach((sh) => saveShot({ ...sh, repId: saved.repId, studyId: d.studyId, date: d.date, instrument: d.instrument, source: 'REPLAY', tags: autoTags(saved) }));
    // Violations also land in the Phase 7 violation log: one system, not two.
    (d.violations || []).forEach((v) => recordViolation({ tradeId: saved.repId, ruleCategory: v.category, violationType: v.tag, trigger: (d.triggers || [])[0] || '', outcome: d.outcome, processQuality: 'violation', source: d.entrySource }));
    el.innerHTML = `<div class="dk-saved"><div class="p8-kicker">SAVED ✓</div><h3 class="p8-h">Rep logged</h3><p class="p8-dim">Journal entry + ${shotsDraft.length} screenshots, linked to this rep.</p></div>`;
    opts.onSaved?.(saved);
  });
}

function autoTags(r) {
  const t = [];
  const viol = (r.violations || []).length > 0;
  if (r.decision === 'TAKE') {
    if (r.outcome === 'WIN') t.push(viol ? 'BAD WINNER' : 'CLEAN WINNER');
    if (r.outcome === 'LOSS') t.push(viol ? 'BAD LOSER' : 'CLEAN LOSER');
  } else if (r.decision === 'PASS') t.push('PASS');
  if (r.environment === 'MESSY') t.push('CHOP');
  if ((r.violations || []).some((v) => v.tag === 'WRONG PIL')) t.push('WRONG PIL');
  if ((r.violations || []).some((v) => ['EARLY ENTRY', 'NO CONTINUATION'].includes(v.tag))) t.push('EARLY ENTRY');
  return t;
}

/* ── study configuration: lock the rules before the first rep ─────────── */
export function renderStudyConfig(el, opts = {}) {
  const s = opts.studyId ? study(opts.studyId) : newStudy({ title: opts.title });
  const fields = [['instrument', 'Instrument'], ['dateRange', 'Date range'], ['sessionWindow', 'Session'], ['strategyVersion', 'Method version'], ['rulebookVersion', 'Rulebook version'], ['riskModel', 'Risk model'], ['managementModel', 'Management model'], ['environmentRules', 'Environment filters'], ['newsRule', 'News rule'], ['entryRule', 'Entry rule'], ['stopRule', 'Stop rule'], ['targetRule', 'Target rule'], ['targetRepCount', 'Planned reps']];
  function draw() {
    const locked = s.status !== 'DRAFT';
    el.innerHTML = `<div class="dk-study">
      <div class="p8-kicker">BACKTEST STUDY ${locked ? '· 🔒 RULES LOCKED' : '· SETUP'}</div>
      <h3 class="p8-h"><input class="dk-in dk-title" value="${esc(s.title)}" ${locked ? 'disabled' : ''}> <span class="dk-ver">v${esc(s.version)}</span></h3>
      <div class="dk-fields">${fields.map(([k, l]) => `<label class="${STUDY_RULE_FIELDS.includes(k) ? 'is-rule' : ''}"><span>${l}${STUDY_RULE_FIELDS.includes(k) ? ' <i>rule</i>' : ''}</span><input class="dk-in" data-k="${k}" value="${esc(s[k])}"></label>`).join('')}</div>
      <div class="dk-study-msg"></div>
      ${locked ? btn('Save changes', 'dk-change') : btn('🔒 LOCK STUDY RULES', 'is-primary is-lock dk-lock')}
      ${locked ? `<p class="p8-dim">Reps recorded: <b>${s.completedRepCount}</b> of ${s.targetRepCount}. Method: ${esc(s.strategyVersion)}.</p>` : '<p class="p8-dim">Once locked, every rep in this study is tested against exactly these rules.</p>'}
    </div>`;
    el.querySelector('.dk-lock')?.addEventListener('click', () => { collect(true); lockStudy(s.studyId); Object.assign(s, study(s.studyId)); draw(); opts.onLocked?.(s); });
    el.querySelector('.dk-change')?.addEventListener('click', () => {
      const patch = collect(false);
      const r = studyChange(s.studyId, patch);
      if (!r.conflict) { el.querySelector('.dk-study-msg').innerHTML = '<div class="p8-tip">Saved. No rule fields changed.</div>'; return; }
      el.querySelector('.dk-study-msg').innerHTML = `<div class="dk-conflict"><b>RULE CHANGE DETECTED</b><p>You changed: ${r.changed.map((f) => fields.find((x) => x[0] === f)?.[1] || f).join(', ')}. Changing this rule will create a new study version so the results stay interpretable.</p>
        <div class="dk-row">${btn('Keep current study', 'dk-keep')}${btn('Create new version', 'is-primary dk-newv')}</div><p class="p8-dim">Don’t change the test because you don’t like the results so far.</p></div>`;
      el.querySelector('.dk-keep').addEventListener('click', () => { draw(); opts.onKeep?.(); });
      el.querySelector('.dk-newv').addEventListener('click', () => { const nv = newStudyVersion(s.studyId, patch); lockStudy(nv.studyId); Object.assign(s, study(nv.studyId)); draw(); opts.onNewVersion?.(s); });
      opts.onConflict?.(r);
    });
  }
  function collect(apply) {
    const patch = {};
    el.querySelectorAll('.dk-fields .dk-in').forEach((i) => { patch[i.dataset.k] = i.dataset.k === 'targetRepCount' ? +i.value || 20 : i.value; });
    const t = el.querySelector('.dk-title'); if (t && !t.disabled) patch.title = t.value;
    if (apply) { Object.assign(s, patch); studyChange(s.studyId, patch); }
    return patch;
  }
  draw();
  return s;
}

/* ═══════════════════════════════════════════════════════════════════════
   JOURNAL · SCREENSHOTS · PERFORMANCE · REVIEWS
   ═══════════════════════════════════════════════════════════════════════ */
async function liveEntries() {
  try { const js = await import('./journal-service.js'); const list = await js.listEntries?.({ entryType: 'trade', limit: 200 }); return (list?.entries || []).map(fromLiveJournal); } catch { return []; }
}

export async function renderJournal(el, opts = {}) {
  await loadSessions().catch(() => {});
  const extra = opts.includeLive === false ? [] : await liveEntries();
  let filter = { source: 'ALL', kind: 'ALL' };
  function draw() {
    const all = journalEntries({ extra });
    const es = all.filter((e) => (filter.source === 'ALL' || e.entrySource === filter.source) && (filter.kind === 'ALL' || (filter.kind === 'TRADE' ? e.decision === 'TAKE' : filter.kind === 'PASS' ? e.decision === 'PASS' : e.outcome === 'MISSED' || e.decision === 'MISSED')));
    el.innerHTML = `<div class="dk-journal">
      <div class="dk-head"><div><div class="p8-kicker">AGHF TRADE JOURNAL</div><h3 class="p8-h">Every rep, every source ${nTag(all.length)}</h3></div>${btn('+ New entry', 'is-primary dk-new')}</div>
      <div class="dk-filters">${chips('source', ['ALL', 'ACADEMY_CASE', 'BACKTEST', 'REPLAY', 'PAPER', 'LIVE', 'MANUAL', 'CAPSTONE'], filter.source)}${chips('kind', [['ALL', 'All'], ['TRADE', 'Trades'], ['PASS', 'Passes'], ['MISSED', 'Missed']], filter.kind)}</div>
      <div class="dk-list">${es.length ? es.map((e) => `<div class="dk-row-e" data-id="${esc(e.repId)}">
          <span class="dk-src">${esc(e.entrySource.replace('_', ' '))}</span><span>${esc(e.date || '')}</span><b>${esc(e.decision || '·')}</b>
          <span class="dk-oc is-${(e.outcome || '').toLowerCase()}">${esc(e.outcome || '·')}${e.realizedR != null ? ` · ${fmtR(e.realizedR)}` : ''}</span>
          <span>${esc(e.setupValidity || '·')} · ${esc(e.setupQuality || '·')}</span>
          <span class="dk-vio">${(e.violations || []).map((v) => esc(v.tag)).join(', ') || (e.decision === 'TAKE' ? '✓ rules' : '')}</span></div>`).join('') : '<div class="dk-empty">No entries yet. Your first replay rep lands here automatically.</div>'}</div>
      <div class="dk-detail"></div></div>`;
    bindChips(el.querySelector('.dk-filters'), (k, v) => { filter[k] = v; draw(); });
    el.querySelector('.dk-new').addEventListener('click', () => newEntry(el.querySelector('.dk-detail')));
    el.querySelectorAll('.dk-row-e').forEach((r) => r.addEventListener('click', () => detail(el.querySelector('.dk-detail'), all.find((x) => x.repId === r.dataset.id))));
  }
  function detail(box, e) {
    const sh = shots().filter((x) => x.repId === e.repId);
    box.innerHTML = `<div class="dk-card"><div class="p8-kicker">${esc(e.entrySource)} · ${esc(e.date || '')}</div>
      <div class="dk-kv">${[['Decision', e.decision], ['Outcome', e.outcome], ['R', fmtR(e.realizedR)], ['Validity', e.setupValidity], ['Quality', e.setupQuality], ['Environment', e.environment], ['Violations', (e.violations || []).map((v) => v.tag).join(', ') || 'none'], ['Triggers', (e.triggers || []).join(', ') || '·'], ['Method', e.methodVersionUsed || METHOD_VERSION.label], ['Lesson', e.studentLesson || '·']].map(([k, v]) => `<span>${k}</span><b>${esc(v ?? '·')}</b>`).join('')}</div>
      ${sh.length ? `<div class="dk-shots">${sh.map((x) => `<figure>${shotThumb(x)}<figcaption>${esc(x.stage)}</figcaption></figure>`).join('')}</div>` : ''}</div>`;
  }
  function newEntry(box) {
    const e = { entrySource: 'PAPER', decision: 'TAKE', date: new Date().toLocaleDateString(), instrument: 'MNQ', session: 'NY AM', violations: [], triggers: [] };
    box.innerHTML = `<div class="dk-card"><div class="p8-kicker">NEW ENTRY</div>
      <div class="p8-q">Source</div>${chips('entrySource', ['PAPER', 'LIVE', 'MANUAL'], e.entrySource)}
      <div class="p8-q">Type</div>${chips('decision', [['TAKE', 'Trade'], ['PASS', 'Pass'], ['MISSED', 'Missed opportunity']], e.decision)}
      <div class="p8-form">${['entry', 'stop', 'target', 'contracts', 'realizedR'].map((f) => `<label>${f === 'realizedR' ? 'Result (R)' : f[0].toUpperCase() + f.slice(1)}<input type="number" step="0.25" data-f="${f}"></label>`).join('')}</div>
      <div class="p8-q">Outcome</div>${chips('outcome', ['WIN', 'LOSS', 'BE', 'NO_TRADE', 'MISSED'], null)}
      <div class="p8-q">Screenshots</div><input type="file" accept="image/*" multiple class="dk-file">
      <div class="dk-log-host"></div>${btn('Continue to the journal flow →', 'is-primary dk-go')}</div>`;
    bindChips(box, (k, v) => { e[k] = v; });
    const files = [];
    box.querySelector('.dk-file').addEventListener('change', async (ev) => { for (const f of ev.target.files) files.push(await shrink(f)); });
    box.querySelector('.dk-go').addEventListener('click', () => {
      box.querySelectorAll('[data-f]').forEach((i) => { if (i.value !== '') e[i.dataset.f] = +i.value; });
      if (e.decision !== 'TAKE') { e.outcome = e.decision === 'MISSED' ? 'MISSED' : 'NO_TRADE'; e.realizedR = null; }
      e.__shots = files.map((dataUrl, i) => ({ stage: i === 0 ? 'ENTRY' : 'OTHER', dataUrl, source: 'UPLOAD' }));
      renderRepLog(box.querySelector('.dk-log-host'), e, { onSaved: () => setTimeout(draw, 600) });
      box.querySelector('.dk-go').remove();
    });
  }
  draw();
}

/** Uploaded screenshots are resized before they're stored. */
function shrink(file) {
  return new Promise((res) => {
    const img = new Image(); const rd = new FileReader();
    rd.onload = () => { img.onload = () => { const s = Math.min(1, 900 / img.width); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72)); }; img.src = rd.result; };
    rd.readAsDataURL(file);
  });
}

export async function renderScreenshots(el, opts = {}) {
  await loadSessions().catch(() => {});
  let f = { tag: opts.tag || 'ALL', stage: 'ALL', quality: 'ALL', outcome: 'ALL', env: 'ALL', dir: 'ALL' };
  function draw() {
    const repsById = Object.fromEntries(journalEntries().map((r) => [r.repId, r]));
    const all = shots();
    const list = all.filter((s) => {
      const r = repsById[s.repId] || {};
      return (f.tag === 'ALL' || (s.tags || []).includes(f.tag)) && (f.stage === 'ALL' || s.stage === f.stage) && (f.quality === 'ALL' || r.setupQuality === f.quality) && (f.outcome === 'ALL' || r.outcome === f.outcome) && (f.env === 'ALL' || r.environment === f.env) && (f.dir === 'ALL' || r.direction === f.dir);
    });
    el.innerHTML = `<div class="dk-lib">
      <div class="dk-head"><div><div class="p8-kicker">MY SCREENSHOT LIBRARY</div><h3 class="p8-h">The chart keeps the receipts ${nTag(all.length)}</h3></div></div>
      <div class="dk-quick">${[['CLEAN LOSER', 'Show me all my clean losers'], ['EARLY ENTRY', 'Every early entry'], ['BAD WINNER', 'Bad winners'], ['PASS', 'My passes']].map(([t, l]) => `<button type="button" data-q="${t}" class="${f.tag === t ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="dk-filters">${chips('tag', ['ALL', ...SHOT_TAGS], f.tag)}${chips('stage', ['ALL', 'BEFORE', 'ENTRY', 'AFTER', 'OTHER'], f.stage)}${chips('quality', ['ALL', 'A', 'B', 'C', 'PASS'], f.quality)}${chips('outcome', ['ALL', 'WIN', 'LOSS', 'BE', 'NO_TRADE'], f.outcome)}${chips('dir', ['ALL', 'long', 'short'], f.dir)}</div>
      <div class="dk-grid">${list.length ? list.map((s) => `<figure class="dk-shot" data-id="${s.shotId}">${shotThumb(s)}<figcaption><b>${esc(s.stage)}</b> · ${esc(s.date || '')}<br>${(s.tags || []).map((t) => `<i>${esc(t)}</i>`).join(' ')}</figcaption></figure>`).join('') : '<div class="dk-empty">No screenshots match. Replay reps add BEFORE / ENTRY / AFTER automatically.</div>'}</div>
      <div class="dk-detail"></div></div>`;
    bindChips(el, (k, v) => { f[k] = v; draw(); });
    el.querySelectorAll('.dk-quick button').forEach((b) => b.addEventListener('click', () => { f = { tag: b.dataset.q, stage: 'ALL', quality: 'ALL', outcome: 'ALL', env: 'ALL', dir: 'ALL' }; draw(); opts.onQuick?.(b.dataset.q); }));
    el.querySelectorAll('.dk-shot').forEach((x) => x.addEventListener('click', () => tagEditor(el.querySelector('.dk-detail'), all.find((s) => s.shotId === x.dataset.id))));
  }
  function tagEditor(box, s) {
    box.innerHTML = `<div class="dk-card"><div class="dk-big">${shotThumb(s, 700, 320)}</div><div class="p8-q">Tags (more than one is fine)</div>${chips('tags', [...SHOT_TAGS, 'CUSTOM'], s.tags || [], true)}<input class="dk-in" placeholder="Custom tag" value=""></div>`;
    bindChips(box, (k, v) => { s.tags = v; saveShot(s); opts.onTag?.(s); });
    box.querySelector('.dk-in').addEventListener('change', (e) => { if (e.target.value.trim()) { s.tags = [...new Set([...(s.tags || []), e.target.value.trim().toUpperCase()])]; saveShot(s); draw(); } });
  }
  draw();
}

const metricCard = (label, m, suffix = '%', note = '') => `<div class="dk-m"><span>${label}</span><b>${m.value == null ? '—' : `${m.value}${suffix}`}</b>${nTag(m.n)}${m.n && m.n < EARLY_SAMPLE ? '<em>EARLY SAMPLE</em>' : ''}${note ? `<small>${note}</small>` : ''}</div>`;

export async function renderPerformance(el, opts = {}) {
  const extra = opts.includeLive === false ? [] : await liveEntries();
  let f = { source: 'ALL', quality: 'ALL', env: 'ALL', dir: 'ALL', days: 'ALL', study: 'ALL' };
  function draw() {
    const now = Date.now();
    const all = journalEntries({ extra }).filter((e) => (f.source === 'ALL' || e.entrySource === f.source) && (f.quality === 'ALL' || e.setupQuality === f.quality) && (f.env === 'ALL' || e.environment === f.env) && (f.dir === 'ALL' || e.direction === f.dir) && (f.study === 'ALL' || e.studyId === f.study) && (f.days === 'ALL' || (e.createdAt || 0) > now - +f.days * 864e5));
    const m = metrics(all);
    el.innerHTML = `<div class="dk-perf">
      <div class="dk-head"><div><div class="p8-kicker">MY PERFORMANCE</div><h3 class="p8-h">Process first. Then results. ${nTag(m.n)}</h3></div></div>
      <div class="dk-filters">${chips('days', [['ALL', 'All time'], ['7', '7 days'], ['30', '30 days'], ['90', '90 days']], f.days)}${chips('source', ['ALL', 'BACKTEST', 'REPLAY', 'PAPER', 'LIVE', 'ACADEMY_CASE'], f.source)}${chips('quality', ['ALL', 'A', 'B', 'C', 'PASS'], f.quality)}${chips('env', ['ALL', 'CLEAN', 'MESSY'], f.env)}${chips('dir', ['ALL', 'long', 'short'], f.dir)}
        <select class="dk-sel"><option value="ALL">All studies</option>${studies().map((s) => `<option value="${s.studyId}" ${f.study === s.studyId ? 'selected' : ''}>${esc(s.title)} v${esc(s.version)}</option>`).join('')}</select></div>
      <div class="dk-tier"><div class="dk-tier-h">PROCESS <i>what you control</i></div><div class="dk-ms">
        ${metricCard('Rule adherence', m.ruleAdherence, '%', m.ruleAdherence.sufficient ? '' : 'needs 5+ entries that record it')}${metricCard('Valid setup rate', m.validSetupRate)}${metricCard('Execution accuracy', m.executionAccuracy)}${metricCard('Risk adherence', m.riskAdherence)}${metricCard('Management adherence', m.managementAdherence)}</div></div>
      <div class="dk-tier"><div class="dk-tier-h">PERFORMANCE <i>what the sample produced</i></div><div class="dk-ms">
        <div class="dk-m"><span>Closed trades</span><b>${m.closed}</b></div>${metricCard('Win rate', m.winRate, '%', 'wins ÷ closed trades')}${metricCard('Average R', m.avgR, 'R')}${metricCard('Total R', m.totalR, 'R')}${metricCard('Max drawdown', m.maxDrawdownR, 'R', 'peak to trough on your R curve')}${metricCard('Expectancy', m.expectancy, 'R / trade', m.expectancy.costs)}</div>
        <p class="p8-dim">Win rate alone can’t define profitability. Over enough observations: what does the average trade produce in R?</p></div>
      <div class="dk-tier"><div class="dk-tier-h">BEHAVIOR</div><div class="dk-ms">
        <div class="dk-m"><span>Chases</span><b>${m.chases}</b></div><div class="dk-m"><span>Early entries</span><b>${m.earlyEntries}</b></div><div class="dk-m"><span>Rule violations</span><b>${m.violations}</b></div><div class="dk-m"><span>Valid passes</span><b>${m.validPasses}</b></div><div class="dk-m"><span>Missed trades</span><b>${m.missed}</b></div></div></div>
      <div class="dk-tier"><div class="dk-tier-h">SETUP QUALITY × OUTCOME</div>${matrixHtml(all)}</div>
      <div class="dk-tier"><div class="dk-tier-h">PATTERNS YOU CAN NAME</div>${insightHtml(all)}</div></div>`;
    bindChips(el, (k, v) => { f[k] = v; draw(); });
    el.querySelector('.dk-sel').addEventListener('change', (e) => { f.study = e.target.value; draw(); });
  }
  draw();
}

export function matrixHtml(entries) {
  const mx = qualityMatrix(entries);
  return `<div class="dk-matrix"><div class="dk-mx-r is-head"><span></span><span>WIN</span><span>LOSS</span><span>BE</span><span>MISSED</span><span>NO TRADE</span><span>AVG R</span></div>
    ${mx.map((r) => `<div class="dk-mx-r"><span><b>${r.quality}</b> ${nTag(r.n)}${r.n && r.early ? '<em>EARLY SAMPLE</em>' : ''}</span>${['WIN', 'LOSS', 'BE', 'MISSED', 'NO_TRADE'].map((c) => `<span>${r.cells[c]}</span>`).join('')}<span>${r.avgR == null ? '—' : fmtR(r.avgR)}</span></div>`).join('')}</div>
    <p class="p8-dim">Quality, validity and outcome are stored separately. Conclusions wait for your own sample.</p>`;
}
export function insightHtml(entries) {
  const vi = violationInsights(entries);
  if (!vi.lines.length) return `<p class="p8-dim">No repeated violation in your last ${vi.sample} executed setups.</p>`;
  return `${vi.lines.slice(0, 3).map((l) => `<div class="dk-insight">${esc(l)}</div>`).join('')}${vi.triggers.length ? `<p class="p8-dim">Most frequent trigger: <b>${esc(vi.triggers[0][0])}</b> (${vi.triggers[0][1]}×). A trigger is context, not a violation.</p>` : ''}`;
}

export function renderWeekly(el, opts = {}) {
  const all = journalEntries();
  const w = weeklySummary(all, opts.at);
  const rec = recommendFocus(all);
  const options = Object.keys(FOCUS_LIBRARY);
  let primary = opts.preselect || null, secondary = null;
  el.innerHTML = `<div class="dk-review">
    <div class="p8-kicker">WEEKLY REVIEW · ${new Date(w.from).toLocaleDateString()} – ${new Date(w.to - 1).toLocaleDateString()}</div>
    <h3 class="p8-h">Find the next adjustment ${nTag(w.entries.length)}</h3>
    <div class="dk-ms">${[['Trades', w.m.executed], ['Wins', w.m.wins], ['Losses', w.m.losses], ['BE', w.m.be], ['Total R', fmtR(w.m.totalR.value)], ['Rule adherence', w.m.ruleAdherence.value == null ? '—' : `${w.m.ruleAdherence.value}%`]].map(([k, v]) => `<div class="dk-m"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <div class="p8-sub">SETUPS</div><div class="dk-ms">${['A', 'B', 'C', 'PASS'].map((q) => `<div class="dk-m"><span>${q}</span><b>${w.setups[q]}</b></div>`).join('')}<div class="dk-m"><span>Passes</span><b>${w.passes}</b></div></div>
    <div class="p8-sub">BEHAVIOR</div><div class="dk-ms"><div class="dk-m"><span>Top violation</span><b>${w.topViolation ? esc(w.topViolation[0]) : 'none'}</b></div><div class="dk-m"><span>Top trigger</span><b>${w.topTrigger ? esc(w.topTrigger[0]) : '·'}</b></div><div class="dk-m"><span>Chases</span><b>${w.m.chases}</b></div><div class="dk-m"><span>Early entries</span><b>${w.m.earlyEntries}</b></div><div class="dk-m"><span>Extra trades</span><b>${w.extraTrades}</b></div></div>
    <div class="dk-rec"><b>From your data:</b> ${esc(rec.evidence)} ${esc(rec.reason)}</div>
    <div class="p8-q">What is the ONE thing you’re training next week?</div>${chips('primary', options, primary)}
    <div class="p8-q">Optional: one secondary</div>${chips('secondary', ['None', ...options], 'None')}
    <div class="dk-plan"></div>
    ${btn('Set my focus', 'is-primary dk-set')}</div>`;
  const setB = el.querySelector('.dk-set'); setB.disabled = !primary;
  const plan = el.querySelector('.dk-plan');
  const showPlan = () => { const fl = FOCUS_LIBRARY[primary]; plan.innerHTML = primary ? `<div class="dk-focus"><div class="p8-sub">NEXT WEEK’S FOCUS</div><b>${esc(primary)}</b><div>Success measure: ${esc(fl.measure)}</div><div>Practice prescription: ${fl.reps} replay reps</div></div>` : ''; };
  bindChips(el, (k, v) => { if (k === 'primary') { primary = v; setB.disabled = false; showPlan(); } else secondary = v === 'None' ? null : v; });
  showPlan();
  setB.addEventListener('click', () => {
    const f = setFocus({ primary, secondary, weekOf: w.from, evidence: rec.evidence });
    saveWeeklyReview({ weekOf: w.from, n: w.entries.length, metrics: { trades: w.m.executed, totalR: w.m.totalR.value, adherence: w.m.ruleAdherence.value }, focus: primary, secondary });
    setB.remove();
    el.querySelector('.dk-review').insertAdjacentHTML('beforeend', `<div class="dk-saved"><div class="p8-principle is-sm">REVIEW TO FIND THE NEXT ADJUSTMENT. NOT TO ATTACK YOURSELF FOR THE ENTIRE WEEK.</div>${btn('START PRACTICE →', 'is-primary dk-start')}</div>`);
    el.querySelector('.dk-start').addEventListener('click', () => (opts.onStart ? opts.onStart(f) : (location.href = 'desk.html#practice')));
    opts.onSet?.(f);
  });
}

export function renderMonthly(el, opts = {}) {
  const all = journalEntries();
  const m = monthlySummary(all, opts.at);
  const row = (g) => g.filter((x) => x.n).map((x) => `<div class="dk-mx-r"><span><b>${esc(x.key)}</b> ${nTag(x.n)}</span><span>${x.closed} closed</span><span>${x.winRate.value ?? '—'}%</span><span>${x.avgR.value == null ? '—' : fmtR(x.avgR.value)}</span></div>`).join('') || '<p class="p8-dim">No entries yet.</p>';
  el.innerHTML = `<div class="dk-review">
    <div class="p8-kicker">MONTHLY REVIEW · ${new Date(m.from).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
    <h3 class="p8-h">Zoom out ${nTag(m.entries.length)}</h3>
    <div class="p8-sub">STRATEGY PATTERNS · environment</div><div class="dk-matrix">${row(m.byEnv)}</div>
    <div class="p8-sub">STRATEGY PATTERNS · setup quality</div><div class="dk-matrix">${row(m.byQuality)}</div>
    <div class="p8-sub">STRATEGY PATTERNS · direction</div><div class="dk-matrix">${row(m.byDir)}</div>
    <div class="p8-sub">BEHAVIOR PATTERNS</div>${insightHtml(m.entries)}
    <div class="p8-sub">RISK PATTERNS</div><div class="dk-ms"><div class="dk-m"><span>Max drawdown</span><b>${fmtR(m.m.maxDrawdownR.value)}</b></div><div class="dk-m"><span>Worst day</span><b>${m.worstDay ? fmtR(Math.round(m.worstDay[1] * 100) / 100) : '—'}</b></div><div class="dk-m"><span>Size range</span><b>${m.sizeConsistency ? `${m.sizeConsistency.min}–${m.sizeConsistency.max}` : '—'}</b></div></div>
    <div class="p8-sub">RULE CHANGE REQUEST</div><p class="p8-dim">Want to change a rule? Don’t edit the plan. Propose a change and test it.</p>${btn('PROPOSE A CHANGE', 'dk-propose')}<div class="dk-exp"></div></div>`;
  el.querySelector('.dk-propose').addEventListener('click', () => renderExperimentForm(el.querySelector('.dk-exp'), { entries: m.entries, onCreated: opts.onExperiment }));
  saveMonthlyReview({ month: m.from, n: m.entries.length });
}

export function renderExperimentForm(el, opts = {}) {
  const x = { field: 'stopRule', currentRule: '', proposedRule: '', reason: '', hypothesis: '', sampleSize: 30, ...opts.preset };
  el.innerHTML = `<div class="dk-card"><div class="p8-kicker">RULE CHANGE EXPERIMENT</div>
    <div class="p8-q">Which rule?</div>${chips('field', [['entryRule', 'Entry'], ['stopRule', 'Stop'], ['targetRule', 'Target'], ['managementModel', 'Management'], ['environmentRules', 'Environment filter'], ['riskModel', 'Risk']], x.field)}
    ${[['currentRule', 'Current rule'], ['proposedRule', 'Proposed rule'], ['reason', 'Why'], ['hypothesis', 'Hypothesis (“this stop may be too tight when…”)']].map(([k, l]) => `<label class="p8-lbl">${l}</label><input class="dk-in" data-k="${k}" value="${esc(x[k])}">`).join('')}
    <label class="p8-lbl">Sample size per arm</label><input class="dk-in" type="number" data-k="sampleSize" value="${x.sampleSize}">
    <p class="p8-dim">Supporting data: ${opts.entries ? `${opts.entries.length} entries this month` : 'your journal'}. Your live Trading Plan does not change until the test is reviewed.</p>
    ${btn('TEST THE CHANGE →', 'is-primary dk-test')}</div>`;
  bindChips(el, (k, v) => { x[k] = v; });
  el.querySelectorAll('.dk-in').forEach((i) => i.addEventListener('input', () => { x[i.dataset.k] = i.dataset.k === 'sampleSize' ? +i.value : i.value; }));
  el.querySelector('.dk-test').addEventListener('click', () => {
    if (!x.proposedRule.trim() || !x.hypothesis.trim()) { el.querySelector('.p8-dim').textContent = 'Add the proposed rule and a hypothesis.'; return; }
    const exp = proposeChange({ ...x, supportingData: opts.entries ? `${opts.entries.length} entries` : '' });
    queueRuleChange({ ruleId: x.field, reason: `Experiment ${exp.expId}: ${x.proposedRule}`, sessionContext: 'monthly review' });
    el.innerHTML = `<div class="dk-saved"><div class="p8-kicker">RESEARCH STUDY CREATED ✓</div><p class="p8-say">Two studies now exist: <b>control</b> (current rule) and <b>test</b> (proposed rule), ${x.sampleSize} reps each. Your live plan stays as it is.</p><div class="p8-principle is-sm">TEST THE CHANGE BEFORE YOU MARRY THE CHANGE.</div></div>`;
    opts.onCreated?.(exp);
  });
}

export function renderDiagnostic(el, opts = {}) {
  const entries = opts.entries || journalEntries();
  const d = diagnose(entries);
  el.innerHTML = `<div class="dk-review"><div class="p8-kicker">DIAGNOSTIC · ${nTag(d.n)} executed</div><h3 class="p8-h">Strategy problem or trader problem?</h3>
    ${d.steps.map((s, i) => `<div class="dk-diag ${s.flagged ? 'is-flag' : ''}"><b>${i + 1}. ${esc(s.q)}</b><span>Look at: ${esc(s.look)}</span><em>${s.pct}% of executed reps ${s.flagged ? `· ${s.area} ISSUE MAY BE PRESENT` : ''}</em></div>`).join('')}
    <div class="dk-diag"><b>5. What does the larger valid sample show?</b><span>Rule-following A/B reps: ${d.clean.n}${d.clean.avgR != null ? ` · avg ${fmtR(d.clean.avgR)}` : ''}</span></div>
    <div class="dk-verdict"><div class="p8-sub">CURRENT EVIDENCE POINTS MOST STRONGLY TOWARD</div><b>${esc(d.verdict)}</b><p>${esc(VERDICT_TEXT[d.verdict])}</p></div></div>`;
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════
   TRADING PLAN: assembled, conflict-checked, versioned
   ═══════════════════════════════════════════════════════════════════════ */
export function renderPlan(el, opts = {}) {
  const cur = currentPlan();
  const plan = opts.edit || !cur ? assemblePlan({ rulebook: loadRulebook(), risk: loadRiskProfile(), entries: journalEntries() }) : cur.plan;
  const locked = cur && !opts.edit;
  const ro = (v) => `<div class="dk-ro">${esc(v || '— not set —')}</div>`;
  const inp = (path, v, ph = '') => (locked ? ro(v) : `<input class="dk-in" data-p="${path}" value="${esc(v)}" placeholder="${esc(ph)}">`);
  const sec = (n, title, body) => `<div class="dk-psec"><div class="dk-pn">${n}</div><div><div class="dk-pt">${title}</div>${body}</div></div>`;
  el.innerHTML = `<div class="dk-tplan">
    <div class="dk-head"><div><div class="p8-kicker">${locked ? `CURRENT PLAN · v${esc(cur.version)} · locked ${new Date(cur.lockedAt).toLocaleDateString()}` : 'ASSEMBLED FROM EVERYTHING YOU BUILT'}</div><h3 class="p8-h">My AGHF Trading Plan 📕</h3></div>
      ${locked ? btn('Propose a change', 'dk-propose') : ''}</div>
    ${sec(1, 'MARKET', `<div class="dk-kv2"><span>Instrument(s)</span>${inp('market.instruments', plan.market.instruments)}<span>Session</span>${inp('market.session', plan.market.session, '9:30–11:00')}</div>`)}
    ${sec(2, 'TOP-DOWN FRAMEWORK · method-defined', `${plan.topDown.method.map(([tf, v, d]) => `<div class="dk-meth"><b>${tf}</b><span>${v}</span><em>${d}</em></div>`).join('')}<label class="p8-lbl">My notes</label>${inp('topDown.notes', plan.topDown.notes)}`)}
    ${sec(3, 'DAYLI ICC RULES · official method', `${plan.icc.method.map(([k, d]) => `<div class="dk-meth is-2"><b>${k}</b><em>${d}</em></div>`).join('')}<label class="p8-lbl">My notes</label>${inp('icc.notes', plan.icc.notes)}`)}
    ${sec(4, 'RISK', `<div class="dk-kv2"><span>Risk per trade</span>${inp('risk.riskPerTrade', plan.risk.riskPerTrade)}<span>Sizing</span>${ro(plan.risk.sizing)}<span>Daily max loss</span>${inp('risk.dailyMax', plan.risk.dailyMax)}<span>Max trades / day</span>${inp('risk.maxTrades', plan.risk.maxTrades)}<span>Target model</span>${inp('risk.targetModel', plan.risk.targetModel)}</div>`)}
    ${sec(5, 'ENVIRONMENT', `<div class="dk-kv2"><span>News</span>${inp('environment.news', plan.environment.news)}<span>Consolidation</span>${inp('environment.consolidation', plan.environment.consolidation)}<span>Window</span>${inp('environment.window', plan.environment.window)}<span>Pass conditions</span>${inp('environment.passConditions', plan.environment.passConditions, 'messy 1H, between structure, chase required…')}</div>`)}
    ${sec(6, 'FIVE NON-NEGOTIABLES', plan.nonNegotiables.map((x, i) => inp(`nonNegotiables.${i}`, x, `Non-negotiable ${i + 1}`)).join(''))}
    ${sec(7, 'MANAGEMENT', `<div class="dk-kv2"><span>Stop management</span>${inp('management.stop', plan.management.stop, 'Stop stays where it is unless…')}<span>Profit-taking</span>${inp('management.profit', plan.management.profit, 'Partials / full target…')}<span>Breakeven rule</span>${inp('management.breakeven', plan.management.breakeven, 'When, if ever…')}</div>`)}
    ${sec(8, 'REVIEW', `<div class="dk-kv2"><span>Journal fields</span>${ro(plan.review.journalFields)}<span>Weekly review</span>${inp('review.weekly', plan.review.weekly)}<span>Monthly review</span>${inp('review.monthly', plan.review.monthly)}<span>Evidence before a rule change</span>${ro(plan.review.evidence)}</div>`)}
    ${sec(9, 'PRACTICE STANDARD', `<div class="dk-kv2"><span>Minimum routine</span>${inp('practice.routine', plan.practice.routine)}<span>Current sample size</span>${ro(`${plan.practice.sampleSize} recorded reps`)}<span>Current focus</span>${ro(plan.practice.focus || 'set in your weekly review')}<span>How rules change</span>${ro(plan.practice.ruleChanges)}</div>`)}
    <div class="dk-conflicts"></div>
    ${locked ? `<div class="dk-hist"><div class="p8-sub">PLAN HISTORY</div>${plans().map((p) => `<div>v${esc(p.version)} · ${new Date(p.lockedAt).toLocaleDateString()} · ${esc(p.reason)}</div>`).join('')}${ruleQueue().length ? `<div class="p8-sub">IN YOUR REVIEW QUEUE</div>${ruleQueue().map((x) => `<div>· ${esc(x.reason || x.ruleId)}</div>`).join('')}` : ''}</div>` : `${btn('CHECK FOR CONFLICTS', 'dk-check')}${btn('LOCK MY TRADING PLAN ✦', 'is-primary is-lock dk-lockp')}<p class="p8-dim">Locking doesn’t make it permanent. It means: this is the version you’re testing now.</p>`}
  </div>`;
  const read = () => {
    el.querySelectorAll('[data-p]').forEach((i) => {
      const [a, b] = i.dataset.p.split('.');
      if (a === 'nonNegotiables') plan.nonNegotiables[+b] = i.value; else plan[a][b] = i.value;
    });
    return plan;
  };
  const showConflicts = () => {
    const c = planConflicts(read());
    el.querySelector('.dk-conflicts').innerHTML = c.length ? `<div class="dk-conflict"><b>CHECK THESE BEFORE YOU LOCK</b>${c.map((x) => `<div>⚑ ${esc(x)}</div>`).join('')}</div>` : '<div class="dk-saved">✓ No conflicts found.</div>';
    return c;
  };
  el.querySelector('.dk-check')?.addEventListener('click', showConflicts);
  el.querySelector('.dk-lockp')?.addEventListener('click', () => {
    const c = showConflicts();
    if (c.length && !el.querySelector('.dk-lockp').dataset.confirm) { el.querySelector('.dk-lockp').dataset.confirm = '1'; el.querySelector('.dk-lockp').textContent = 'Lock anyway, with these noted'; return; }
    const v = lockPlan(read(), cur ? 'Structured review' : 'First locked plan');
    opts.onLocked?.(v);
    renderPlan(el, { ...opts, edit: false });
  });
  el.querySelector('.dk-propose')?.addEventListener('click', () => {
    const host = document.createElement('div'); el.querySelector('.dk-tplan').appendChild(host);
    host.innerHTML = `<div class="dk-card"><p class="p8-say">Mid-session? Add it to your review queue. The plan changes only through a structured review.</p><input class="dk-in" placeholder="What do you want to change, and why?">${btn('ADD TO REVIEW QUEUE', 'is-primary')}</div>`;
    host.querySelector('.p8-btn').addEventListener('click', () => { queueRuleChange({ ruleId: 'trading-plan', reason: host.querySelector('.dk-in').value }); host.innerHTML = '<div class="dk-saved">✓ Added to your review queue.</div>'; });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   PRACTICE LAB · drills and the practice report
   ═══════════════════════════════════════════════════════════════════════ */
export async function renderPracticeLab(el, opts = {}) {
  await loadSessions();
  const focus = opts.focus || currentFocus();
  const n = opts.reps || focus?.reps || 10;
  const pool = pickSessions(focus?.drill, n, opts.seed);
  const done = [];
  let st = opts.study || null;
  if (!st && opts.studyTitle) { st = newStudy({ title: opts.studyTitle, targetRepCount: n }); lockStudy(st.studyId); }
  function next() {
    if (done.length >= n) return report();
    const s = pool[done.length];
    el.innerHTML = `<div class="dk-pl-head"><div class="p8-brand"><span class="p8-dot"></span>${esc(opts.title || 'PRACTICE SESSION')}</div><div class="dk-pl-n">REP ${done.length + 1} OF ${n}${focus ? ` · FOCUS: ${esc(focus.primary)}` : ''}</div></div><div class="dk-pl-host"></div>`;
    renderReplay(el.querySelector('.dk-pl-host'), { session: s, study: st, drillLabel: focus ? `FOCUS · ${focus.primary}` : null, onRep: (r) => { done.push(r); const b = document.createElement('button'); b.className = 'p8-btn is-primary'; b.textContent = done.length >= n ? 'See my practice report →' : 'Next rep →'; b.addEventListener('click', next); el.querySelector('.dk-rp-side').appendChild(b); opts.onRep?.(r, done.length); } });
  }
  function report() { renderPracticeReport(el, done, { onDrill: (f) => { renderPracticeLab(el, { focus: f, reps: 10, title: `${f.primary} DRILL` }); }, ...opts }); opts.onDone?.(done); }
  next();
}
function pickSessions(drill, n, seed) {
  const pool = [...SESSIONS];
  const prefer = { continuation: ['early', 'valid'], retest: ['run', 'valid'], pil: ['valid', 'none'], pass: ['messy', 'none', 'run'], manage: ['valid'], risk: ['valid'], indicator: ['valid'] }[drill];
  let rng = seed || Date.now();
  const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
  pool.sort(() => rand() - 0.5);
  if (prefer) pool.sort((a, b) => (prefer.includes(b.kind) ? 1 : 0) - (prefer.includes(a.kind) ? 1 : 0) + (rand() - 0.5) * 0.6);
  return pool.slice(0, n);
}

/** Built from the reps she actually logged. Example numbers from the curriculum are never used. */
export function renderPracticeReport(el, list, opts = {}) {
  const m = metrics(list);
  const valid = list.filter((r) => r.setupValidity === 'VALID').length, invalid = list.filter((r) => r.setupValidity === 'INVALID').length;
  const q = Object.fromEntries(['A', 'B', 'C', 'PASS'].map((k) => [k, list.filter((r) => r.setupQuality === k).length]));
  const vi = violationInsights(list, list.length);
  const rec = recommendFocus(list);
  const env = ['CLEAN', 'MESSY'].map((e) => { const es = list.filter((r) => r.environment === e); const em = metrics(es); return `<div class="dk-mx-r"><span><b>${e}</b> ${nTag(es.length)}</span><span>${em.closed} closed</span><span>${em.winRate.value ?? '—'}%</span><span>${em.avgR.value == null ? '—' : fmtR(em.avgR.value)}</span></div>`; }).join('');
  const passRight = list.filter((r) => r.decision === 'PASS' && r.validPass).length;
  const strongest = rec.strong?.[0] || (passRight >= 3 ? `valid passes (${passRight})` : m.executionAccuracy.value >= 80 && m.executionAccuracy.n >= 5 ? `execution accuracy (${m.executionAccuracy.value}%)` : 'not enough data yet');
  el.innerHTML = `<div class="dk-report">
    <div class="p8-brand"><span class="p8-dot"></span>YOUR PRACTICE REPORT</div>
    <h3 class="p8-h">${list.length} reps reviewed</h3>
    <div class="dk-ms">${[['Valid setups', valid], ['Invalid setups', invalid], ['A / B / C', `${q.A} / ${q.B} / ${q.C}`], ['Passes', list.filter((r) => r.decision === 'PASS').length], ['Wins', m.wins], ['Losses', m.losses], ['BE', m.be], ['Average R', m.avgR.value == null ? '—' : fmtR(m.avgR.value)], ['Total R', fmtR(m.totalR.value)], ['Rule adherence', m.ruleAdherence.value == null ? '—' : `${m.ruleAdherence.value}%`]].map(([k, v]) => `<div class="dk-m"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <div class="dk-kv2"><span>Top violation</span><div class="dk-ro">${vi.top[0] ? `${esc(vi.top[0][0])} (${vi.top[0][1]}×)` : 'none'}</div><span>Strongest observed skill</span><div class="dk-ro">${esc(strongest)}</div><span>Most frequent error in this study</span><div class="dk-ro">${vi.top[0] ? esc(vi.top[0][0]) : 'none repeated'}</div></div>
    <div class="p8-sub">ENVIRONMENT BREAKDOWN</div><div class="dk-matrix">${env}</div>
    <div class="dk-focus"><div class="p8-sub">YOUR NEXT PRACTICE FOCUS</div><b>${esc(rec.focus)}</b><div>${esc(rec.evidence)}</div><div>${esc(rec.reason)}</div></div>
    ${btn(`START 10-REP DRILL →`, 'is-primary dk-drill')}
    <p class="p8-dim">Every number above comes from the reps in this session${list.length < EARLY_SAMPLE ? ', which is still an early sample' : ''}. It describes your practice, not future results.</p></div>`;
  el.querySelector('.dk-drill').addEventListener('click', () => { const f = setFocus({ primary: rec.focus, evidence: rec.evidence }); opts.onDrill ? opts.onDrill(f) : (location.href = 'desk.html#practice'); });
}

/* ═══════════════════════════════════════════════════════════════════════
   THE DESK HOME (pre- and post-graduation)
   ═══════════════════════════════════════════════════════════════════════ */
export function renderDeskHome(el, opts = {}) {
  const all = journalEntries();
  const weekFrom = Date.now() - 7 * 864e5;
  const repsWeek = all.filter((e) => (e.createdAt || 0) > weekFrom && ['BACKTEST', 'REPLAY'].includes(e.entrySource)).length;
  const practiceN = all.filter((e) => ['BACKTEST', 'REPLAY'].includes(e.entrySource)).length;
  const ms = milestone(practiceN);
  const f = currentFocus();
  const plan = currentPlan();
  const m = metrics(all.slice(0, 30));
  const status = academyStatus();
  const a = alumni();
  const lastW = weeklyReviews().slice(-1)[0];
  const nextReview = lastW ? new Date(lastW.weekOf + 7 * 864e5).toLocaleDateString() : 'This weekend';
  const hour = new Date().getHours();
  el.innerHTML = `<div class="dk-home">
    <div class="dk-hello"><div class="p8-kicker">${status === 'GRADUATED' ? 'AGHF ACADEMY ALUMNI ✦' : status === 'CAPSTONE READY' ? 'CURRICULUM COMPLETE · CAPSTONE READY' : 'MY TRADER DESK'}</div>
      <h2>${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}${opts.name ? `, ${esc(opts.name)}` : ''}.</h2></div>
    <div class="dk-hgrid">
      <div class="dk-hc is-focus"><span>CURRENT PRACTICE FOCUS</span><b>${esc(f?.primary || 'Set one in your weekly review')}</b>${f ? `<em>${esc(f.measure || '')}</em>` : ''}</div>
      <div class="dk-hc"><span>REPS THIS WEEK</span><b>${repsWeek}</b><em>${practiceN} total</em></div>
      <div class="dk-hc"><span>NEXT REVIEW</span><b>${esc(nextReview)}</b></div>
      <div class="dk-hc"><span>TRADING PLAN</span><b>${plan ? `v${esc(plan.version)}` : 'Not locked yet'}</b></div>
      <div class="dk-hc"><span>RULE ADHERENCE</span><b>${m.ruleAdherence.value == null ? '—' : `${m.ruleAdherence.value}%`}</b>${nTag(m.ruleAdherence.n)}</div>
      <div class="dk-hc"><span>PRACTICE MILESTONE</span><b>${ms.current ? `${ms.current.emoji} ${esc(ms.current.badge)}` : 'First 10 reps'}</b><em>${ms.next ? `${practiceN} / ${ms.next.n}` : 'All milestones reached'}</em></div>
    </div>
    <a class="p8-btn is-primary dk-cta" href="desk.html#practice">START PRACTICE SESSION →</a>
    <div class="dk-recent"><div class="p8-sub">RECENT JOURNAL</div>${all.slice(0, 5).map((e) => `<div class="dk-row-e"><span class="dk-src">${esc(e.entrySource.replace('_', ' '))}</span><span>${esc(e.date || '')}</span><b>${esc(e.decision || '·')}</b><span>${esc(e.outcome || '·')}${e.realizedR != null ? ` · ${fmtR(e.realizedR)}` : ''}</span></div>`).join('') || '<div class="dk-empty">Nothing logged yet.</div>'}</div>
    ${status === 'CAPSTONE READY' ? '<a class="p8-btn is-lock dk-cta" href="capstone.html">🎓 BEGIN CAPSTONE →</a>' : ''}
    ${a ? `<div class="dk-alum"><div class="p8-sub">ALUMNI PROFILE</div><div class="dk-kv2"><span>Graduated</span><div class="dk-ro">${new Date(a.graduatedAt).toLocaleDateString()}</div><span>Badges</span><div class="dk-ro">${(a.badges || []).length}</div><span>Capstone</span><div class="dk-ro">PASSED</div><span>Plan</span><div class="dk-ro">${plan ? `v${esc(plan.version)}` : '·'}</div></div><a href="certificate.html" class="dk-link">View my certificate →</a></div>` : ''}
    <div class="dk-grad"><b>AGHF GRAD SCHOOL 💎</b> <span>Advanced research, new Dayli ICC studies, Supply &amp; Demand integration. Coming later.</span></div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   Lesson wrappers
   ═══════════════════════════════════════════════════════════════════════ */
const TOOLS = {
  replay: renderReplay, study: renderStudyConfig, journal: renderJournal, screenshots: renderScreenshots, performance: renderPerformance,
  weekly: renderWeekly, monthly: renderMonthly, diagnostic: renderDiagnostic, plan: renderPlan, practice: renderPracticeLab, home: renderDeskHome,
};
export { TOOLS };
