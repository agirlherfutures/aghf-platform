/**
 * desk-walk.js — A Girl & Her Futures™
 * One trading day, broken down one clear step at a time (the Capstone desk).
 *
 *   runDeskWalk(el, item, { feedback: 'end' | 'now', onDone(result) })
 *
 * Same idea as the Phase 5 walk-through: one instruction above the chart,
 * you mark the chart, then answer one question at a time. Every mark stays on
 * the timeframe it was made on.
 *   feedback 'end'  the Capstone: each step just locks; Dayli's read shows in the report.
 *   feedback 'now'  practice: after each step you see your marks next to Dayli's, and why.
 *
 * Dayli's marks are worked out from the candles here (dayliRead), so a mark
 * can never sit somewhere the chart doesn't support:
 *   4H  top / floor of the room = highest high / lowest low.
 *   1H  the swing price pulled back from = the extreme after the 1H swing low
 *       (high side for longs); the shift = the last 1H pivot before that low
 *       that price later closed through.
 *   1M  Indication = first close through the PIL, Correction = the next close
 *       back past the PIL, Continuation = the next close through it again,
 *       Retest = the first candle after that to touch the PIL and close on the
 *       trade's side. (The Phase 5 rules.)
 */
import { mountSdChart } from './sd-chart.js';
import { riskOf, tolerance } from './case-core.js';
import { scoreCapstone } from './desk-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const MAX_RISK = 200;

export const PARTS = [
  { key: '4H', label: '4H Room' },
  { key: '1H', label: '1H Map' },
  { key: '15M', label: '15M' },
  { key: '1M', label: '1M Entry' },
  { key: 'risk', label: 'Decide + Risk' },
  { key: 'outcome', label: 'Outcome' },
];

// ── Dayli's read, from the candles ───────────────────────────────────────
const pivHi = (b, i, k = 2) => b.every((x, j) => j === i || Math.abs(j - i) > k || b[i].h >= x.h);
const pivLo = (b, i, k = 2) => b.every((x, j) => j === i || Math.abs(j - i) > k || b[i].l <= x.l);

export function dayliRead(c) {
  const bull = c.dir !== 'short';
  const H4 = c.tf['4H'], H1 = c.tf['1H'], M = c.m1;
  const argmax = (a, f, from = 0) => { let m = from; for (let i = from; i < a.length; i++) if (f(a[i]) > f(a[m])) m = i; return m; };
  const argmin = (a, f, from = 0) => argmax(a, (x) => -f(x), from);
  const top = argmax(H4, (b) => b.h), floor = argmin(H4, (b) => b.l);

  // 1H: the swing that started the move, then the swing price pulled back from.
  const start = bull ? argmin(H1, (b) => b.l) : argmax(H1, (b) => b.h);
  const key = bull ? argmax(H1, (b) => b.h, start) : argmin(H1, (b) => b.l, start);
  let shift = null;
  for (let i = start - 1; i >= 0 && !shift; i--) {
    if (!(bull ? pivHi(H1, i) : pivLo(H1, i))) continue;
    const lvl = bull ? H1[i].h : H1[i].l;
    for (let j = start; j < H1.length; j++) if (bull ? H1[j].c > lvl : H1[j].c < lvl) { shift = { at: i, price: lvl, broke: j }; break; }
  }

  // 1M: the ICC sequence at the PIL.
  const pil = c.levels.pil;
  const thr = (b) => (bull ? b.c > pil : b.c < pil);
  const back = (b) => (bull ? b.c < pil : b.c > pil);
  const s = { I: null, C: null, C2: null, R: null };
  for (let i = (c.marks?.pilBar ?? 0) + 1; i < M.length; i++) {
    if (s.I == null) { if (thr(M[i]) && !thr(M[i - 1])) s.I = i; }
    else if (s.C == null) { if (back(M[i])) s.C = i; }
    else if (s.C2 == null) { if (thr(M[i])) s.C2 = i; }
    else if (s.R == null) { const touch = bull ? M[i].l <= pil + 1 : M[i].h >= pil - 1; if (touch && thr(M[i])) s.R = i; }
  }
  const decision = c.decisionIndex ?? c.marks?.decision ?? M.length - 1;
  // Only what had printed by the decision candle counts.
  Object.keys(s).forEach((k) => { if (s[k] != null && s[k] > decision) s[k] = null; });
  return { bull, top, floor, start, key, keyPrice: bull ? H1[key].h : H1[key].l, startPrice: bull ? H1[start].l : H1[start].h, shift, pil, icc: s, decision };
}

const ASK_TF = { thesis4h: '4H', location: '4H', map1h: '1H', obs15: '15M' };
function asksFrom(item) {
  const out = {};
  (item.steps || []).forEach((s) => (s.asks || []).forEach((a) => { if (ASK_TF[a.key]) out[a.key] = a; }));
  return out;
}

// ── The walk ─────────────────────────────────────────────────────────────
export function runDeskWalk(el, item, { feedback = 'end', onDone } = {}) {
  const c = item.case;
  const D = dayliRead(c);
  const bull = D.bull;
  const W = bull ? { hl: 'high', lh: 'low', above: 'above', below: 'below', side: 'long' } : { hl: 'low', lh: 'high', above: 'below', below: 'above', side: 'short' };
  const ASK = asksFrom(item);
  const ex = c.expert || {};
  const now = feedback === 'now';
  const rec = { marks: {}, asks: {}, decision: null, mgmt: null, pregrade: null, changeGrade: null, locked: {} };

  const facts = [c.instrument || 'MNQ', c.session, c.historicalDate].filter(Boolean);
  el.innerHTML = `<div class="dw">
    <div class="dw-track">${PARTS.map((p, i) => `<span class="dw-st" data-p="${p.key}"><b>${i + 1}</b>${p.label}</span>`).join('')}</div>
    <div class="dw-facts">${facts.map((f) => `<span>${esc(f)}</span>`).join('')}<span class="is-lock">🔒 Outcome hidden</span>${now ? '<span class="is-practice">Practice: Dayli’s read after each step</span>' : ''}</div>
    <div class="dw-eyebrow"></div>
    <h2 class="dw-title"></h2>
    <div class="dw-ins"><small>Do this</small><p></p></div>
    <div class="dw-tabs" role="tablist"></div>
    <div class="dw-charts">${['4H', '1H', '15M', '1M'].map((t) => `<div class="dw-chart" data-tf="${t}" hidden></div>`).join('')}</div>
    <div class="dw-play" hidden><button type="button" class="dw-next">Next candle ▸</button><span class="dw-count"></span></div>
    <div class="dw-body"></div>
    <div class="dw-fb" hidden></div>
    <div class="dw-act"><button type="button" class="dw-undo" hidden>↶ Undo last mark</button><span class="dw-hint"></span><button type="button" class="dw-btn" disabled>Next →</button></div>
  </div>`;
  const $ = (s) => el.querySelector(s);
  const btn = $('.dw-btn'), hint = $('.dw-hint'), body = $('.dw-body'), fb = $('.dw-fb'), undo = $('.dw-undo');
  const charts = {};
  const open = new Set();
  let onBtn = null, onUndo = null;

  function chart(tf) {
    if (charts[tf]) return charts[tf];
    const box = el.querySelector(`.dw-chart[data-tf="${tf}"]`);
    box.hidden = false;
    const bars = tf === '1M' ? c.m1 : c.tf[tf];
    const k = tf === '1M' ? (c.replayStart ?? 8) : bars.length;
    charts[tf] = mountSdChart(box, { bars, dir: bull ? 'bullish' : 'bearish' }, { tf, k, toggle: false, minSlots: bars.length, maxBody: tf === '1M' ? 9 : 11, symbol: c.instrument || 'MNQ' });
    box.hidden = true;
    return charts[tf];
  }
  function showTf(tf) {
    open.add(tf);
    chart(tf);
    el.querySelectorAll('.dw-chart').forEach((b) => { b.hidden = b.dataset.tf !== tf; });
    $('.dw-tabs').innerHTML = [...open].map((t) => `<button type="button" class="dw-tab${t === tf ? ' on' : ''}" data-tf="${t}">${t}</button>`).join('');
    $('.dw-tabs').querySelectorAll('.dw-tab').forEach((b) => b.addEventListener('click', () => showTf(b.dataset.tf)));
  }
  function frame(part, eyebrow, title, ins) {
    el.querySelectorAll('.dw-st').forEach((s) => {
      const i = PARTS.findIndex((p) => p.key === s.dataset.p), at = PARTS.findIndex((p) => p.key === part);
      s.classList.toggle('now', i === at); s.classList.toggle('done', i < at);
      s.querySelector('b').textContent = i < at ? '✓' : i + 1;
    });
    $('.dw-eyebrow').textContent = eyebrow;
    $('.dw-title').textContent = title;
    instruct(ins);
  }
  const instruct = (html) => { $('.dw-ins p').innerHTML = html; };
  function action(label, cb, enabled = true, hintText = '') { btn.textContent = label; btn.disabled = !enabled; onBtn = cb; hint.textContent = hintText; }
  btn.addEventListener('click', () => onBtn?.());
  undo.addEventListener('click', () => onUndo?.());
  const top = () => el.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

  // A question with big answer cards. Resolves with the chosen value.
  function ask(a, { multi = false } = {}) {
    return new Promise((res) => {
      body.innerHTML = `<p class="dw-q">${esc(a.q)}</p><div class="dw-opts">${a.options.map(([v, label]) => {
        const [head, ...rest] = String(label).split(': ');
        return `<button type="button" class="dw-opt" data-v="${esc(v)}"><strong>${esc(head)}</strong>${rest.length ? esc(rest.join(': ')) : ''}</button>`;
      }).join('')}</div>`;
      const picked = new Set();
      body.querySelectorAll('.dw-opt').forEach((o) => o.addEventListener('click', () => {
        if (!multi) picked.clear();
        if (picked.has(o.dataset.v)) picked.delete(o.dataset.v); else picked.add(o.dataset.v);
        body.querySelectorAll('.dw-opt').forEach((x) => x.classList.toggle('sel', picked.has(x.dataset.v)));
        btn.disabled = !picked.size;
      }));
      const label = a.cta || 'Next →';
      action(label, () => res(multi ? [...picked] : [...picked][0]), false, a.hint || '');
    });
  }

  // Tap one candle on a chart. Resolves with its index.
  function tapCandle(tf, filter) {
    return new Promise((res) => {
      const ch = chart(tf);
      ch.tappable((i) => { ch.tappable(null); res(i); }, filter);
    });
  }

  // ── feedback after a step (practice) or a quiet lock (Capstone) ──
  function verdict(rows) {
    const bad = rows.filter((r) => !r.ok);
    const head = bad.length ? `<b>Dayli read ${bad.length === 1 ? 'one thing' : `${bad.length} things`} differently.</b>` : '<b>Same read as Dayli.</b>';
    return `<div class="dw-verdict ${bad.length ? 'is-diff' : 'is-good'}"><span class="dw-ic">${bad.length ? '!' : '✓'}</span><div>${head}
      <ul>${rows.map((r) => `<li class="${r.ok ? 'ok' : 'no'}">${r.ok ? '✓' : '○'} <b>${esc(r.label)}:</b> you ${esc(r.you)}${r.ok ? '' : `. Dayli: ${esc(r.dayli)}`}${r.why ? `<em>${esc(r.why)}</em>` : ''}</li>`).join('')}</ul></div></div>`;
  }
  function lockStep(part, rows, drawDayli, nextLabel) {
    return new Promise((res) => {
      rec.locked[part] = rows;
      body.innerHTML = '';
      undo.hidden = true;
      if (now) {
        drawDayli();
        fb.hidden = false;
        fb.innerHTML = `${verdict(rows)}<p class="dw-legend"><i class="match"></i>✓ Same as Dayli <i class="you"></i>Your mark <i class="dayli"></i>Dayli’s mark</p>`;
        instruct('Here’s your read next to Dayli’s. Switch timeframe tabs to see every mark where you made it.');
      } else {
        fb.hidden = false;
        fb.innerHTML = '<div class="dw-locked">🔒 Locked. Dayli’s read stays hidden until your report at the end.</div>';
        instruct(`Your ${part} read is locked.`);
      }
      action(nextLabel, () => { fb.hidden = true; fb.innerHTML = ''; res(); top(); });
    });
  }
  // A mark that matches Dayli's becomes one teal ✓ line; a miss keeps yours and adds Dayli's in gold.
  function same(ch, youKey, ok, dKey, spec, label) {
    if (ok) { ch.level(youKey, null); ch.level(dKey, { ...spec, label: `✓ ${label}`, tone: 'teal' }); }
    else ch.level(dKey, { ...spec, label: `Dayli · ${label}`, tone: 'gold' });
  }
  const askRow = (key, label) => {
    const a = ASK[key]; const v = rec.asks[key];
    const lab = (val) => String(a.options.find(([x]) => x === val)?.[1] || val || 'no answer').split(': ')[0];
    const ok = v === a.expert || (a.alt || []).includes(v);
    return { label, ok, you: `chose “${lab(v)}”`, dayli: lab(a.expert), why: ok ? '' : a.why };
  };

  // ── Step 1 · 4H ──
  async function step4H() {
    const H4 = c.tf['4H'];
    frame('4H', 'Step 1 of 6 · 4H', 'Read the room', `Tap the candle with the <b>highest high</b> on the 4H. That’s the <b>top of the room</b>.`);
    showTf('4H');
    const ch = chart('4H');
    const tapTop = async () => {
      instruct(`Tap the candle with the <b>highest high</b> on the 4H. That’s the <b>top of the room</b>.`);
      const i = await tapCandle('4H');
      rec.marks.top = i; ch.mark(i, 'pick'); ch.level('youTop', { price: H4[i].h, label: 'You · top', tone: 'pink', at: i });
    };
    const tapFloor = async () => {
      instruct(`Now tap the candle with the <b>lowest low</b>. That’s the <b>floor</b>.`);
      const i = await tapCandle('4H');
      rec.marks.floor = i; ch.mark(i, 'pick'); ch.level('youFloor', { price: H4[i].l, label: 'You · floor', tone: 'pink', at: i });
    };
    await tapTop();
    undo.hidden = false;
    onUndo = async () => { ch.tappable(null); ['top', 'floor'].forEach((k) => { if (rec.marks[k] != null) ch.mark(rec.marks[k], null); delete rec.marks[k]; }); ch.level('youTop', null); ch.level('youFloor', null); body.innerHTML = ''; await tapTop(); await tapFloor(); afterMarks(); };
    await tapFloor();
    await afterMarks();
    async function afterMarks() {
      instruct('Now read it. Answer one question at a time.');
      rec.asks.thesis4h = await ask({ ...ASK.thesis4h, q: 'Which way is the 4H leaning?', cta: 'Next question →' });
      instruct('Where is price sitting inside the room you just marked?');
      rec.asks.location = await ask({ ...ASK.location, cta: 'Lock my 4H read →' });
      const tol = tolerance(c, '4H');
      const rows = [
        { label: 'Top of the room', ok: Math.abs(H4[rec.marks.top].h - H4[D.top].h) <= tol, you: `marked ${fmt(H4[rec.marks.top].h)}`, dayli: fmt(H4[D.top].h), why: 'The highest high on this 4H window.' },
        { label: 'Floor', ok: Math.abs(H4[rec.marks.floor].l - H4[D.floor].l) <= tol, you: `marked ${fmt(H4[rec.marks.floor].l)}`, dayli: fmt(H4[D.floor].l), why: 'The lowest low on this 4H window.' },
        askRow('thesis4h', 'Lean'), askRow('location', 'Location'),
      ];
      await lockStep('4H', rows, () => {
        same(ch, 'youTop', rows[0].ok, 'dTop', { price: H4[D.top].h, at: D.top }, 'top');
        same(ch, 'youFloor', rows[1].ok, 'dFloor', { price: H4[D.floor].l, at: D.floor }, 'floor');
      }, 'Next: the 1H →');
      step1H();
    }
  }

  // ── Step 2 · 1H ──
  async function step1H() {
    const H1 = c.tf['1H'];
    frame('1H', 'Step 2 of 6 · 1H', 'Find the level the session will test', `Tap the 1H swing <b>${W.hl}</b> price just pulled back from. That level becomes your <b>PIL</b> on the 1M.`);
    showTf('1H');
    const ch = chart('1H');
    const put = (i) => {
      if (rec.marks.level != null) ch.mark(rec.marks.level, null);
      rec.marks.level = i; ch.mark(i, 'pick');
      ch.level('youLevel', { price: bull ? H1[i].h : H1[i].l, label: 'You · level', tone: 'pink', at: i });
    };
    put(await tapCandle('1H'));
    // Tapping another candle moves the mark, right up until you lock.
    const retap = () => ch.tappable((i) => { put(i); retap(); });
    retap();
    hint.textContent = '';
    instruct('What did the 1H just do? (Tap a different candle any time to move your level.)');
    rec.asks.map1h = await ask({ ...ASK.map1h, q: 'What did the 1H just do?', cta: 'Lock my 1H read →' });
    ch.tappable(null);
    const tol = tolerance(c, '1H');
    const yp = bull ? H1[rec.marks.level].h : H1[rec.marks.level].l;
    const rows = [
      { label: 'The level', ok: Math.abs(yp - D.keyPrice) <= tol && rec.marks.level >= D.start, you: `marked ${fmt(yp)}`, dayli: fmt(D.keyPrice), why: `The swing ${W.hl} price pulled back from after the 1H turned. The session tests this level.` },
      askRow('map1h', 'The 1H map'),
    ];
    await lockStep('1H', rows, () => {
      if (D.shift) {
        ch.level('dShift', { price: D.shift.price, label: 'Dayli · shift', tone: 'purple', at: D.shift.at });
        ch.tag('dBroke', { at: D.shift.broke, text: `closed ${W.above}`, tone: 'purple', where: bull ? 'above' : 'below' });
      }
      same(ch, 'youLevel', rows[0].ok, 'dLevel', { price: D.keyPrice, at: D.key }, 'level');
    }, 'Next: the 15M →');
    step15M();
  }

  // ── Step 3 · 15M ──
  async function step15M() {
    frame('15M', 'Step 3 of 6 · 15M', 'Watch how price comes into the open', 'Nothing to mark here. Look at the last few hours of 15M candles, then answer.');
    showTf('15M');
    undo.hidden = true;
    rec.asks.obs15 = await ask({ ...ASK.obs15, q: 'What is the 15M doing into the session?', cta: 'Lock my 15M read →' });
    await lockStep('15M', [askRow('obs15', '15M behavior')], () => {}, 'Next: the 1M →');
    step1M();
  }

  // ── Step 4 · 1M ──
  async function step1M() {
    const M = c.m1;
    const ch = chart('1M');
    frame('1M', 'Step 4 of 6 · 1M', 'Play the open, candle by candle', '');
    showTf('1M');
    ch.level('pil', { price: D.pil, label: `PIL ${fmt(D.pil)}`, tone: 'ink' });
    const ctx = (c.context || []).filter((x) => x.tone === 'stop');
    const play = $('.dw-play'), nx = $('.dw-next'), count = $('.dw-count');
    const last = D.decision + 1;
    const say = () => { count.textContent = `${c.session ? `${c.session.split('·')[0].trim()} · ` : ''}1M candle ${ch.k} of ${last}`; nx.disabled = ch.k >= last; };
    play.hidden = false; say();
    nx.onclick = () => {
      ch.show(ch.k + 1); say();
      if (ch.k >= last) {
        // The decision candle has printed: finish any last mark, then lock.
        instruct(`This is the latest candle${t < TASKS.length ? `. ${TASKS[t][2]}` : ''} When you’re done marking, lock your 1M read.`);
        btn.hidden = false; action('Lock my 1M read →', done);
      }
    };
    const TASKS = [
      ['I', 'Indication', `When a candle <b>closes ${W.above}</b> the PIL, tap it. That’s the <b>Indication</b>.`],
      ['C', 'Correction', `When a candle <b>closes back ${W.below}</b> the PIL, tap it. That’s the <b>Correction</b>.`],
      ['C2', 'Continuation', `When a candle <b>closes ${W.above}</b> the PIL again, tap it. That’s the <b>Continuation</b>.`],
      ['R', 'Retest', `If price comes back to the PIL and holds, tap that candle. That’s the <b>Retest</b>.`],
    ];
    const TAGS = { I: 'I', C: 'C', C2: 'C', R: 'RETEST' };
    let t = 0;
    const intro = `The PIL is the 1H level, carried down to the 1M. Press <b>Next candle</b>. `;
    const prompt = () => { if (ch.k >= last) { instruct(t < TASKS.length ? `This is the latest candle. ${TASKS[t][2]} When you’re done marking, lock your 1M read.` : 'All marked. Lock your 1M read.'); return; } instruct(t < TASKS.length ? intro + TASKS[t][2] : 'Sequence marked. Keep pressing <b>Next candle</b> until you’re at the decision.'); };
    prompt();
    if (ctx.length) body.innerHTML = `<div class="dw-ctx">${ctx.map((x) => `⚠️ ${esc(x.text)}`).join('<br>')}</div>`;
    let finished = false;
    const arm = () => {
      if (t >= TASKS.length) { ch.tappable(null); return; }
      ch.tappable((i) => {
        const [key] = TASKS[t];
        rec.marks[key] = i;
        ch.tag(`you${key}`, { at: i, text: TAGS[key], tone: 'pink', where: key === 'C' ? (bull ? 'below' : 'above') : (bull ? 'above' : 'below') });
        t += 1; prompt(); arm();
        undo.hidden = false;
      }, (i) => i > (c.marks?.pilBar ?? 0));
    };
    onUndo = () => { if (!t) return; t -= 1; const [key] = TASKS[t]; delete rec.marks[key]; ch.tag(`you${key}`, null); undo.hidden = t === 0; prompt(); arm(); };
    arm();
    action('Next candle ▸', () => nx.click(), true, '');
    btn.hidden = true;
    function done() {
      if (finished) return; finished = true;
      ch.tappable(null);
      play.hidden = true; undo.hidden = true;
      const rows = TASKS.map(([key, label]) => {
        const y = rec.marks[key], d = D.icc[key];
        const ok = y === d || (y == null && d == null);
        const where = (i) => (i == null ? 'didn’t mark one' : `marked candle ${i + 1}`);
        return { label, ok, you: where(y), dayli: d == null ? 'there isn’t one yet' : `candle ${d + 1}`, why: ok ? '' : {
          I: `The first candle to close ${W.above} the PIL. A wick through doesn’t count.`,
          C: `The first candle after the Indication to close back ${W.below} the PIL.`,
          C2: `The first candle after the Correction to close ${W.above} the PIL again.`,
          R: 'The first candle after the Continuation to come back to the PIL and hold it.',
        }[key] };
      });
      lockStep('1M', rows, () => {
        Object.entries(D.icc).forEach(([key, at]) => {
          if (at == null) return;
          const where = key === 'C' ? (bull ? 'below' : 'above') : (bull ? 'above' : 'below');
          if (rec.marks[key] === at) { ch.tag(`you${key}`, { at, text: `✓ ${TAGS[key]}`, tone: 'teal', where }); return; }
          ch.tag(`d${key}`, { at, text: `Dayli · ${TAGS[key]}`, tone: 'gold', where });
        });
      }, 'Decide →').then(stepDecide);
    }
  }

  // ── Step 5 · Decide + risk ──
  async function stepDecide() {
    const M = c.m1, ch = chart('1M');
    frame('risk', 'Step 5 of 6 · Decide', 'Take it, wait, or pass?', 'Decide with what has printed. Your Trading Plan and Rulebook are allowed.');
    showTf('1M');
    const ctx = (c.context || []).map((x) => `<span class="${x.tone === 'stop' ? 'is-stop' : ''}">${esc(x.text)}</span>`).join('');
    const choice = await (async () => {
      const p = ask({ q: 'What do you do here?', options: [['TAKE', `Take it: the setup is complete and my rules allow it`], ['WAIT', 'Wait: something isn’t confirmed yet'], ['PASS', 'Pass: my rules say no trade']], cta: 'Lock my decision →' });
      body.insertAdjacentHTML('afterbegin', `<div class="dw-ctxrow">${ctx}</div>`);
      return p;
    })();
    const d = { choice, reasons: [] };
    if (choice !== 'TAKE') {
      const reasons = (item.steps.find((s) => s.t === 'decision')?.reasons) || [];
      instruct('Name the rule that keeps you out. Pick every one that applies.');
      d.reasons = await ask({ q: 'Why not now?', options: reasons.map((r) => [r, r]), cta: 'Lock my decision →' }, { multi: true });
    } else {
      const bar = M[D.decision];
      instruct(`Set your risk. The account allows <b>$${MAX_RISK}</b> per trade. MNQ is $2 per point.`);
      Object.assign(d, await riskForm(bar.c));
      instruct('Before you enter: how will you manage it?');
      const mg = item.steps.find((s) => s.t === 'mgmt')?.options || ['Hold to target, stop stays where it is'];
      rec.mgmt = await ask({ q: 'Your management plan, set before the trade', options: mg.map((m) => [m, m]), cta: 'Lock my plan →' });
    }
    rec.decision = d;
    instruct('Last thing before the result: grade your process.');
    rec.pregrade = await ask({ q: 'How would you grade the process so far?', options: [['A', 'A: every step in order, inside my rules'], ['B', 'B: valid, with one thing I’d tighten'], ['C', 'C: I bent a rule or guessed']], cta: 'Show me what happened →' });
    stepOutcome();
  }

  function riskForm(entry0) {
    return new Promise((res) => {
      const ch = chart('1M');
      const dir = bull ? 1 : -1;
      body.innerHTML = `<div class="dw-risk">
        <label>Entry<input type="number" step="0.25" id="dwEntry" value="${entry0}"></label>
        <label>Stop<input type="number" step="0.25" id="dwStop" placeholder="${bull ? 'below' : 'above'} entry"></label>
        <label>Target<input type="number" step="0.25" id="dwTarget" placeholder="${bull ? 'above' : 'below'} entry"></label>
        <label>Contracts<input type="number" step="1" min="1" id="dwQty" value="1"></label>
      </div><div class="dw-riskline" aria-live="polite">Fill in your stop and target.</div>`;
      const v = (id) => parseFloat(body.querySelector(id).value);
      const update = () => {
        const d = { entry: v('#dwEntry'), stop: v('#dwStop'), target: v('#dwTarget'), contracts: Math.max(1, Math.round(v('#dwQty') || 1)) };
        const ok = [d.entry, d.stop, d.target].every(Number.isFinite);
        ['entry', 'stop', 'target'].forEach((k) => ch.level(`r${k}`, Number.isFinite(d[k]) ? { price: d[k], label: `${k[0].toUpperCase() + k.slice(1)} ${fmt(d[k])}`, tone: k === 'stop' ? 'pink' : k === 'target' ? 'teal' : 'purple', at: D.decision } : null));
        const line = body.querySelector('.dw-riskline');
        if (!ok) { line.textContent = 'Fill in your stop and target.'; btn.disabled = true; return; }
        const r = riskOf(c, d);
        const side = (d.stop - d.entry) * dir < 0 && (d.target - d.entry) * dir > 0;
        line.innerHTML = side ? `Risk: ${r.pts} pts × $2 × ${d.contracts} = <b class="${r.dollars > MAX_RISK ? 'over' : ''}">$${r.dollars}</b> of $${MAX_RISK} · Reward ${r.rr}R` : `<b class="over">Your stop goes ${bull ? 'below' : 'above'} the entry, and your target ${bull ? 'above' : 'below'} it.</b>`;
        btn.disabled = !side;
        cur = d;
      };
      let cur = null;
      body.querySelectorAll('input').forEach((i) => i.addEventListener('input', update));
      action('Lock my risk →', () => res(cur), false, '');
      update();
    });
  }

  // ── Step 6 · Outcome ──
  async function stepOutcome() {
    const ch = chart('1M');
    frame('outcome', 'Step 6 of 6 · Outcome', 'Now play it forward', 'Watch what price did after your decision.');
    showTf('1M');
    body.innerHTML = '';
    action('Playing…', () => {}, false);
    await ch.play(c.m1.length, 90);
    const o = c.outcome || {};
    const took = rec.decision.choice === 'TAKE';
    const LINE = { WIN: 'Target hit', LOSS: 'Stop hit', WOULD_HAVE_WON: 'It would have hit the target', WOULD_HAVE_LOST: 'It would have stopped out', CHOP: 'Price chopped around' };
    body.innerHTML = `<div class="dw-outcome"><span>OUTCOME · informational only</span><b>${esc(LINE[o.type] || o.type || '·')}${took && o.r != null ? ` · ${o.r > 0 ? '+' : ''}${o.r}R` : ''}</b><em>${took ? 'You took it.' : `You ${rec.decision.choice === 'WAIT' ? 'waited' : 'passed'}.`} The result doesn’t grade the process.</em></div>`;
    instruct('One question. Be honest.');
    const a = await new Promise((res) => {
      const holder = document.createElement('div'); body.appendChild(holder);
      const keep = body.innerHTML;
      ask({ q: 'Now that you’ve seen the outcome, would you change your process grade?', options: [['No', 'No: the outcome doesn’t change what was true before it'], ['Yes', 'Yes: the result changes how I see it']], cta: 'See my report →' }).then(res);
      body.insertAdjacentHTML('afterbegin', keep);
    });
    rec.changeGrade = a;
    onDone?.(score(), c, rec, D);
  }

  // ── Scoring: process, not profit ──
  function score() {
    const scores = {}, notes = {}, critical = [];
    const rows = Object.values(rec.locked).flat();
    const marks = rows.filter((r) => !['Retest'].includes(r.label) || D.icc.R != null);
    const ok = marks.filter((r) => r.ok).length, ratio = marks.length ? ok / marks.length : 1;
    scores.analysis = ratio >= 0.75 ? 'STRONG' : ratio >= 0.5 ? 'SOLID' : 'REVIEW';
    notes.analysis = `${ok} of ${marks.length} reads matched Dayli’s.`;
    const d = rec.decision, took = d.choice === 'TAKE', ideal = ex.idealDecision;
    if (took && ideal !== 'TAKE') { scores.execution = 'REVIEW'; critical.push(`Entered when the plan said ${ideal}. ${ex.decisionWhy || ''}`.trim()); notes.execution = `You took it. Dayli: ${ideal}.`; }
    else if (d.choice === ideal) { scores.execution = 'STRONG'; notes.execution = `${d.choice}: the same call Dayli made.`; }
    else if (!took && ideal !== 'TAKE') { scores.execution = 'SOLID'; notes.execution = `${d.choice} keeps you out, like Dayli’s ${ideal}. ${ex.decisionWhy || ''}`.trim(); }
    else { scores.execution = 'REVIEW'; notes.execution = `${d.choice} on a complete setup. ${ex.decisionWhy || ''}`.trim(); }
    if (took) {
      const r = riskOf(c, d), tol = tolerance(c, '1M'), ref = ex.risk?.stop;
      if (!r.sane) { scores.risk = 'REVIEW'; critical.push('Stop or target on the wrong side of the entry.'); notes.risk = 'The stop has to sit on the losing side of the entry.'; }
      else if (r.dollars > MAX_RISK) { scores.risk = 'REVIEW'; critical.push(`Risked $${r.dollars}. The account allows $${MAX_RISK} per trade.`); notes.risk = `$${r.dollars} at ${d.contracts} contract${d.contracts === 1 ? '' : 's'}: over the limit.`; }
      else if (ref != null && (bull ? d.stop > ref + tol : d.stop < ref - tol)) { scores.risk = 'SOLID'; notes.risk = `$${r.dollars} is inside the limit, but the stop sits inside the correction. Dayli’s stop: ${fmt(ref)}.`; }
      else if (r.rr < 1) { scores.risk = 'SOLID'; notes.risk = `$${r.dollars} inside the limit. The target is under 1R.`; }
      else { scores.risk = 'STRONG'; notes.risk = `$${r.dollars} at ${d.contracts} contract${d.contracts === 1 ? '' : 's'}, ${r.rr}R target. Inside the $${MAX_RISK} limit.`; }
      scores.management = rec.mgmt ? 'STRONG' : 'SOLID'; notes.management = rec.mgmt ? `Plan set before entry: ${rec.mgmt}.` : 'No management plan set.';
    } else { scores.risk = 'STRONG'; notes.risk = 'No position. Capital protected.'; scores.management = 'STRONG'; notes.management = 'Nothing to manage.'; }
    scores.ruleAdherence = critical.length ? 'REVIEW' : (!took && !d.reasons.length ? 'SOLID' : 'STRONG');
    notes.ruleAdherence = critical.length ? 'A hard rule was broken.' : took ? 'Every rule held.' : d.reasons.length ? `You named why: ${d.reasons.join(', ')}.` : 'You stood aside, but didn’t name the rule.';
    scores.review = rec.changeGrade === 'Yes' ? 'REVIEW' : 'STRONG';
    notes.review = rec.changeGrade === 'Yes' ? 'You let the outcome change your grade.' : 'The outcome didn’t rewrite your grade.';
    return { scores, notes, critical, ...scoreCapstone({ scores, critical }), outcome: c.outcome?.type, rResult: c.outcome?.r, rows: rec.locked };
  }

  step4H();
}

// ── The report: your marks next to Dayli's, on every timeframe ──────────
export function renderDeskReport(host, c, rec, D) {
  const bull = D.bull;
  const boxes = ['4H', '1H', '1M'].map((tf) => `<figure class="dw-rep-chart"><figcaption>${tf} · your marks vs Dayli’s</figcaption><div data-tf="${tf}"></div></figure>`).join('');
  host.innerHTML = `<p class="dw-legend"><i class="match"></i>✓ Same as Dayli <i class="you"></i>Your mark <i class="dayli"></i>Dayli’s mark</p><div class="dw-rep-charts">${boxes}</div>`;
  const mk = (tf) => {
    const bars = tf === '1M' ? c.m1 : c.tf[tf];
    return mountSdChart(host.querySelector(`[data-tf="${tf}"]`), { bars, dir: bull ? 'bullish' : 'bearish' }, { tf, k: bars.length, toggle: false, minSlots: bars.length, maxBody: tf === '1M' ? 9 : 11, symbol: c.instrument || 'MNQ' });
  };
  // A mark you got right shows once, in teal with a ✓. A miss shows yours (pink) and Dayli's (gold).
  const pair = (ch, key, you, dayli, label, tol) => {
    if (you && Math.abs(you.price - dayli.price) <= tol) { ch.level(key, { ...dayli, label: `✓ ${label}`, tone: 'teal' }); return; }
    if (you) ch.level(`y${key}`, { ...you, label: `You · ${label}`, tone: 'pink' });
    ch.level(`d${key}`, { ...dayli, label: `Dayli · ${label}`, tone: 'gold' });
  };
  const h4 = mk('4H'), H4 = c.tf['4H'], t4 = tolerance(c, '4H');
  pair(h4, 'top', rec.marks.top != null && { price: H4[rec.marks.top].h, at: rec.marks.top }, { price: H4[D.top].h, at: D.top }, 'top', t4);
  pair(h4, 'floor', rec.marks.floor != null && { price: H4[rec.marks.floor].l, at: rec.marks.floor }, { price: H4[D.floor].l, at: D.floor }, 'floor', t4);
  const h1 = mk('1H'), H1 = c.tf['1H'];
  pair(h1, 'level', rec.marks.level != null && { price: bull ? H1[rec.marks.level].h : H1[rec.marks.level].l, at: rec.marks.level }, { price: D.keyPrice, at: D.key }, 'level', tolerance(c, '1H'));
  if (D.shift) h1.level('ds', { price: D.shift.price, label: 'Dayli · shift', tone: 'purple', at: D.shift.at });
  const m1 = mk('1M');
  m1.level('pil', { price: D.pil, label: `PIL ${fmt(D.pil)}`, tone: 'ink' });
  const TAGS = { I: 'I', C: 'C', C2: 'C', R: 'RETEST' };
  const where = (k) => (k === 'C' ? (bull ? 'below' : 'above') : (bull ? 'above' : 'below'));
  Object.keys(TAGS).forEach((k) => {
    const y = rec.marks[k], d = D.icc[k];
    if (y != null && y === d) { m1.tag(`m${k}`, { at: d, text: `✓ ${TAGS[k]}`, tone: 'teal', where: where(k) }); return; }
    if (y != null) m1.tag(`y${k}`, { at: y, text: `You · ${TAGS[k]}`, tone: 'pink', where: where(k) });
    if (d != null) m1.tag(`d${k}`, { at: d, text: `Dayli · ${TAGS[k]}`, tone: 'gold', where: where(k) });
  });
  if (rec.decision?.choice === 'TAKE') {
    ['entry', 'stop', 'target'].forEach((k) => m1.level(`r${k}`, { price: rec.decision[k], label: `Your ${k}`, tone: k === 'stop' ? 'pink' : k === 'target' ? 'teal' : 'purple', at: D.decision }));
  }
}
