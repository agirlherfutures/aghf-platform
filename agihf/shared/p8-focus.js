/**
 * p8-focus.js — A Girl & Her Futures™
 * Phase 8, Lessons 2-9: one lesson, one job.
 *
 *   { type: 'p8_focus', kind, kicker, headline, line, chart?, ... }
 *
 * Each slide does one thing, on a chart of its own (shared/p8-focus-scenarios.js,
 * built and rule-checked by tools/build-p8-focus.py):
 *   chart    look at a chart (marks, trade lines, outcome hidden or shown)
 *   tick     tick every reason that applies; some options are traps
 *   pick     one question, big answer cards (retry until right; `pref` accepts any)
 *   tap      tap the candle the question asks for
 *   level    tap a price level (e.g. the 1H swing that is your PIL)
 *   buckets  sort statements into two illustrated buckets
 *   sort     sort several small charts (clean / messy)
 *   grades   grade separate parts (analysis, execution, risk…)
 *   minis    a row of small charts to compare (no answer)
 *   reveal   the result, as tiles, with Dayli's point
 *   note     2-4 illustrated cards
 * Colours follow the brand: pink = you, purple = Dayli, teal = matched / right,
 * peach = the PIL and the room.
 */
import { shell, nextBtn } from './lesson-v2.js';
import { icon } from './icons.js';
import { setIndicatorAssist } from './case-core.js';
import { P8_FOCUS } from './p8-focus-scenarios.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const C = { pink: '#F4829A', teal: '#7ECEC4', peach: '#F5A857', purple: '#7F77DD', dark: '#2C1810', muted: '#B9A79C', up: '#7ECEC4', dn: '#F4829A' };
const TONE = { you: C.pink, dayli: C.purple, match: C.teal, peach: C.peach, dark: C.dark, muted: '#D9C7BC' };
const ink = (col) => (col === C.purple || col === C.dark ? '#FFFFFF' : '#2C1810');
const TAG = { I: 'I', C: 'Corr', C2: 'Cont', R: 'Retest' };

// ── the chart ────────────────────────────────────────────────────────────
/** Resolves a candle reference: a number, an ICC key ('I', 'C', 'C2', 'R') or a scenario field ('early', 'chase'…). */
function at(sc, ref) {
  if (typeof ref === 'number') return ref;
  if (sc.icc && ref in sc.icc) return sc.icc[ref];
  if (ref === 'entry') return sc.trade?.at;
  if (sc[ref] != null) return typeof sc[ref] === 'object' ? sc[ref].at : sc[ref];
  return null;
}

/**
 * Draws a scenario. spec: { scenario, upto, marks: ['I','C','C2','R'], pil, trade, curtain, tags: [{at, text, tone, below}],
 * levels: [{price | ref, label, tone, dash}], tf, h }
 * Returns { svg, x, yinv, n } for tapping.
 */
function drawChart(host, spec, extra = {}) {
  const sc = P8_FOCUS[spec.scenario];
  const s = { ...spec, ...extra, tags: [...(spec.tags || []), ...(extra.tags || [])], levels: [...(spec.levels || []), ...(extra.levels || [])] };
  const bars = sc.bars;
  const long = sc.dir === 'long';
  const upto = s.upto == null ? bars.length : typeof s.upto === 'number' ? s.upto : at(sc, s.upto) + 1;
  const W = s.w || 860, H = s.h || 330, R = s.axis === false ? 12 : 104, T = 26, B = 22, L = 12;
  const lv = [];
  if (s.pil) lv.push({ price: sc.pil, label: typeof s.pil === 'string' ? s.pil : `${sc.tf === '1H' ? '' : '1H '}PIL`, col: C.peach });
  if (s.trade && sc.trade) {
    const t = sc.trade;
    lv.push({ price: t.entry, label: 'Entry', col: C.teal, from: t.at }, { price: t.stop, label: 'Stop', col: C.pink, from: t.at }, { price: t.target, label: 'Target', col: C.teal, from: t.at, dash: true });
  }
  s.levels.forEach((l) => lv.push({ ...l, price: l.price ?? sc[l.ref]?.price ?? sc.pil, col: TONE[l.tone] || l.col || C.peach, from: l.from != null ? at(sc, l.from) : null }));
  // With the outcome hidden, scale to what's visible, so the future can't leak through the chart's range.
  const seen = s.curtain && upto < bars.length ? bars.slice(0, upto) : bars;
  const vals = seen.flatMap((b) => [b.h, b.l]).concat(lv.filter((l) => !s.curtain || l.price != null).map((l) => l.price));
  const hi = Math.max(...vals), lo = Math.min(...vals), pad = (hi - lo) * 0.1;
  const top = hi + pad, bot = lo - pad;
  const n = bars.length;
  const x = (i) => L + (i + 0.5) * (W - L - R) / n;
  const y = (p) => T + (top - p) / (top - bot) * (H - T - B);
  const yinv = (py) => top - (py - T) / (H - T - B) * (top - bot);
  const bw = Math.max(4, Math.min(16, (W - L - R) / n * 0.6));
  let g = `<text x="${L + 2}" y="${H - 6}" font-size="11" font-weight="700" fill="${C.muted}" font-family="DM Sans,sans-serif">MNQ · ${sc.tf || '1M'}</text>`;
  // levels (pills on the right are nudged apart so they never overlap)
  const pills = lv.map((l) => ({ ...l, yy: y(l.price) })).sort((a, b) => a.yy - b.yy);
  pills.forEach((l, i) => { l.py = i && l.yy - pills[i - 1].py < 22 ? pills[i - 1].py + 22 : l.yy; });
  pills.forEach((l) => {
    const x0 = l.from != null ? x(l.from) - bw : L;
    g += `<line x1="${x0}" x2="${W - R + 4}" y1="${l.yy}" y2="${l.yy}" stroke="${l.col}" stroke-width="2" ${l.dash ? 'stroke-dasharray="7 5"' : ''}/>`;
    if (s.axis !== false) {
      const tw = Math.min(R - 8, l.label.length * 6.6 + 16);
      g += `<rect x="${W - R + 6}" y="${l.py - 10}" width="${tw}" height="20" rx="10" fill="${l.col}"/><text x="${W - R + 6 + tw / 2}" y="${l.py + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${ink(l.col)}" font-family="DM Sans,sans-serif">${esc(l.label)}</text>`;
    }
  });
  bars.slice(0, upto).forEach((b, i) => {
    const col = b.c >= b.o ? C.up : C.dn;
    g += `<g class="pf-c" data-i="${i}"><rect x="${x(i) - (W - L - R) / n / 2}" y="${T}" width="${(W - L - R) / n}" height="${H - T - B}" fill="transparent"/><line x1="${x(i)}" x2="${x(i)}" y1="${y(b.h)}" y2="${y(b.l)}" stroke="${col}" stroke-width="1.6"/><rect x="${x(i) - bw / 2}" y="${y(Math.max(b.o, b.c))}" width="${bw}" height="${Math.max(2, Math.abs(y(b.o) - y(b.c)))}" rx="2" fill="${col}"/></g>`;
  });
  if (s.curtain && upto < n) {
    const cx = x(upto) - (W - L - R) / n / 2;
    g += `<rect x="${cx}" y="${T}" width="${W - R - cx}" height="${H - T - B}" fill="#FFF6DC" opacity=".75"/><text x="${(cx + W - R) / 2}" y="${(T + H - B) / 2}" text-anchor="middle" font-size="13" font-weight="800" fill="#8a6100" font-family="DM Sans,sans-serif">🔒 ${esc(typeof s.curtain === 'string' ? s.curtain : 'Outcome hidden')}</text>`;
  }
  if (s.ring != null) {
    const i = at(sc, s.ring.at), b = bars[i];
    g += `<rect x="${x(i) - bw}" y="${y(b.h) - 6}" width="${bw * 2}" height="${y(b.l) - y(b.h) + 12}" rx="6" fill="none" stroke="${TONE[s.ring.tone] || C.teal}" stroke-width="2.5"/>`;
  }
  const tags = [...(s.marks || []).map((k) => ({ at: k, text: `Dayli · ${TAG[k]}`, tone: 'dayli', below: (k === 'C') === long })), ...s.tags];
  const stack = {};
  tags.forEach((t) => {
    const i = at(sc, t.at); if (i == null || i >= upto) return;
    const b = bars[i];
    const key = `${i}:${!!t.below}`; const k = (stack[key] = (stack[key] || 0) + 1) - 1;
    const tw = t.text.length * 6.4 + 16;
    const yy = t.below ? y(b.l) + 17 + k * 22 : y(b.h) - 15 - k * 22;
    const cx = Math.min(Math.max(x(i), L + tw / 2), W - R - tw / 2);
    const col = TONE[t.tone] || C.purple;
    g += `<rect x="${cx - tw / 2}" y="${yy - 10}" width="${tw}" height="20" rx="10" fill="${col}"/><text x="${cx}" y="${yy + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${ink(col)}" font-family="DM Sans,sans-serif">${esc(t.text)}</text>`;
  });
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sc.tf || '1M')} chart" class="pf-svg">${g}</svg>`;
  return { svg: host.querySelector('svg'), x, yinv, n, W, H, R, upto };
}

// ── pieces ──────────────────────────────────────────────────────────────
const chips = (list) => (list?.length ? `<div class="pf-chips">${list.map((c) => `<span class="${typeof c === 'object' && c.tone ? `is-${c.tone}` : ''}">${esc(typeof c === 'object' ? c.text : c)}</span>`).join('')}</div>` : '');
const ins = (t) => (t ? `<div class="pf-ins">${t}</div>` : '');
const dayli = (t) => (t ? `<div class="pf-dayli"><span>D</span><div><b>Dayli’s point</b><p>${t}</p></div></div>` : '');
const say = (box, html, tone) => { box.hidden = false; box.className = `pf-fb is-${tone}`; box.innerHTML = `<span class="ic">${tone === 'good' ? '✓' : '!'}</span><div>${html}</div>`; };
const optIcon = (o) => (o.icon ? `<span class="pf-oi">${icon(o.icon, o.tone || 'pink', 22)}</span>` : '');

function frame(el, slide, inner, cls = '') {
  const { act, right } = shell(el, slide, `<div class="pf ${cls}">${chips(slide.chips)}${inner}</div>`, '', { cls: 'v2-wide pf-wide' });
  return { act, box: right.querySelector('.pf') };
}

// ── kinds ───────────────────────────────────────────────────────────────
const KINDS = {
  chart(el, s, satisfy) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-chart"></div>${s.legend ? legend() : ''}${dayli(s.dayli)}`);
    drawChart(box.querySelector('.pf-chart'), s.chart);
    nextBtn(act, satisfy, s.cta || 'Next →');
  },

  tick(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}${s.chart ? '<div class="pf-chart pf-chart-sm"></div>' : ''}<div class="pf-ticks">${s.options.map((o, i) => `<button type="button" class="pf-tick" data-i="${i}"><span class="box">✓</span>${optIcon(o)}<span class="t"><b>${o.label}</b><small>${o.ok ? esc(o.sub || '') : '&nbsp;'}</small></span></button>`).join('')}</div><div class="pf-fb" hidden></div><div class="pf-row"><button type="button" class="pf-btn" disabled>Check my answers</button></div>`);
    if (s.chart) drawChart(box.querySelector('.pf-chart'), s.chart);
    const ticks = [...box.querySelectorAll('.pf-tick')], go = box.querySelector('.pf-btn');
    let done = false;
    ticks.forEach((t) => t.addEventListener('click', () => { if (done) return; t.classList.toggle('on'); go.disabled = !ticks.some((x) => x.classList.contains('on')); }));
    go.addEventListener('click', () => {
      done = true; go.parentElement.remove();
      let right = 0, traps = 0, missed = 0;
      ticks.forEach((t) => {
        const o = s.options[+t.dataset.i], on = t.classList.contains('on');
        t.classList.remove('on'); t.disabled = true;
        if (on && o.ok) { t.classList.add('good'); right++; } else if (on && !o.ok) { t.classList.add('bad'); traps++; t.querySelector('small').textContent = o.why || ''; } else if (o.ok) { t.classList.add('missed'); missed++; t.querySelector('small').textContent = `You missed this one. ${o.sub || ''}`; }
      });
      h?.handleStreak?.(!traps && !missed);
      say(box.querySelector('.pf-fb'), traps ? `<b>${s.trapSay || 'You ticked a result as a reason.'}</b>` : missed ? `<b>${right} right. You missed ${missed}.</b> ${s.missSay || ''}` : `<b>${s.goodSay || 'All of them, and no traps.'}</b>`, traps ? 'work' : 'good');
      nextBtn(act, satisfy, s.cta || 'Next →');
    });
  },

  pick(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}${s.chart ? '<div class="pf-chart"></div>' : ''}${s.q ? `<p class="pf-q">${s.q}</p>` : ''}<div class="pf-opts${s.options.length === 2 ? ' is-two' : ''}">${s.options.map((o, i) => `<button type="button" class="pf-opt" data-i="${i}">${optIcon(o)}<span class="t"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</span></button>`).join('')}</div><div class="pf-fb" hidden></div>${dayli('')}`);
    if (s.chart) drawChart(box.querySelector('.pf-chart'), s.chart);
    const opts = [...box.querySelectorAll('.pf-opt')], fb = box.querySelector('.pf-fb');
    let solved = false, first = true;
    opts.forEach((b) => b.addEventListener('click', () => {
      if (solved) return;
      const o = s.options[+b.dataset.i];
      const ok = s.pref ? true : !!o.ok;
      if (first) { h?.handleStreak?.(ok); first = false; }
      if (!ok) { b.classList.add('bad'); say(fb, o.say || 'Look again.', 'work'); return; }
      solved = true;
      opts.forEach((x) => { x.disabled = true; x.classList.remove('bad'); });
      b.classList.add('good');
      if (s.pref === 'indicatorAssist' && o.value) setIndicatorAssist(o.value);
      say(fb, `${o.say || 'Right.'}`, 'good');
      if (s.dayli) fb.insertAdjacentHTML('afterend', dayli(s.dayli));
      nextBtn(act, satisfy, s.cta || 'Next →');
    }));
  },

  tap(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-chart pf-tap"></div><div class="pf-fb" hidden></div>`);
    const sc = P8_FOCUS[s.chart.scenario], want = at(sc, s.answer);
    const host = box.querySelector('.pf-chart'), fb = box.querySelector('.pf-fb');
    let solved = false, first = true;
    const wire = (extra) => {
      const g = drawChart(host, s.chart, extra);
      g.svg.querySelectorAll('.pf-c').forEach((c) => c.addEventListener('click', () => {
        if (solved) return;
        const i = +c.dataset.i;
        if (first) { h?.handleStreak?.(i === want); first = false; }
        if (i !== want) { wire({ ring: { at: i, tone: 'you' } }); say(fb, s.wrong || 'Not that one. Look again.', 'work'); return; }
        solved = true;
        drawChart(host, s.chart, { ring: { at: i, tone: 'match' }, tags: s.then || [] });
        say(fb, s.right || 'That’s it.', 'good');
        nextBtn(act, satisfy, s.cta || 'Next →');
      }));
    };
    wire();
  },

  level(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-chart pf-tap"></div><div class="pf-fb" hidden></div>`);
    const sc = P8_FOCUS[s.chart.scenario], target = sc[s.answer].price, tol = s.tolerance || 15;
    const host = box.querySelector('.pf-chart'), fb = box.querySelector('.pf-fb');
    let solved = false, first = true;
    const wire = (extra) => {
      const g = drawChart(host, s.chart, extra);
      g.svg.addEventListener('click', (e) => {
        if (solved) return;
        const pt = g.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const p = Math.round(g.yinv(pt.matrixTransform(g.svg.getScreenCTM().inverse()).y) * 4) / 4;
        const ok = Math.abs(p - target) <= tol;
        if (first) { h?.handleStreak?.(ok); first = false; }
        if (!ok) { wire({ levels: [{ price: p, label: 'You', tone: 'you' }] }); say(fb, s.wrong || 'Not quite. Look for the swing price pulled back from.', 'work'); return; }
        solved = true;
        drawChart(host, s.chart, { levels: [{ price: target, label: '✓ PIL', tone: 'match' }] });
        say(fb, s.right || `Yes: ${fmt(target)}.`, 'good');
        nextBtn(act, satisfy, s.cta || 'Next →');
      });
    };
    wire();
  },

  buckets(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-stack"><div class="pf-card-q"></div><div class="pf-bk">${s.buckets.map(([k, l, ic, tone]) => `<button type="button" class="pf-bucket" data-k="${k}">${ic ? icon(ic, tone || 'pink', 30) : ''}<b>${esc(l)}</b></button>`).join('')}</div><div class="pf-count"></div></div><div class="pf-fb" hidden></div>`);
    const q = box.querySelector('.pf-card-q'), count = box.querySelector('.pf-count'), fb = box.querySelector('.pf-fb');
    let i = 0, first = true;
    const show = () => { q.innerHTML = `<span>${i + 1} / ${s.items.length}</span>${s.items[i].text}`; count.innerHTML = s.items.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join(''); first = true; };
    show();
    box.querySelectorAll('.pf-bucket').forEach((b) => b.addEventListener('click', () => {
      if (i >= s.items.length) return;
      const it = s.items[i], ok = b.dataset.k === it.answer;
      if (first) { h?.handleStreak?.(ok); first = false; }
      if (!ok) { say(fb, it.why || 'Look again.', 'work'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
      say(fb, `✓ ${it.why || ''}`, 'good');
      i += 1;
      if (i < s.items.length) { setTimeout(show, 700); return; }
      q.innerHTML = '<span>Done</span>All sorted.'; count.innerHTML = s.items.map(() => '<i class="done"></i>').join('');
      box.querySelectorAll('.pf-bucket').forEach((x) => { x.disabled = true; });
      if (s.dayli) fb.insertAdjacentHTML('afterend', dayli(s.dayli));
      nextBtn(act, satisfy, s.cta || 'Next →');
    }));
  },

  sort(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-minis">${s.minis.map((m, k) => `<div class="pf-mini" data-k="${k}"><h4>${esc(m.title)}</h4>${m.ctx ? `<span class="ctx">${esc(m.ctx)}</span>` : ''}<div class="pf-mchart"></div><div class="pf-sortbtns">${s.buckets.map(([v, l]) => `<button type="button" data-v="${v}">${esc(l)}</button>`).join('')}</div><div class="why" hidden></div></div>`).join('')}</div><div class="pf-row"><span class="pf-hint">Sort all ${s.minis.length}, then check.</span><button type="button" class="pf-btn" disabled>Check my sort</button></div>`);
    const cards = [...box.querySelectorAll('.pf-mini')], go = box.querySelector('.pf-btn');
    let done = false;
    cards.forEach((card) => {
      const m = s.minis[+card.dataset.k];
      drawChart(card.querySelector('.pf-mchart'), { scenario: m.scenario, pil: 'PIL', w: 440, h: 190 });
      card.querySelectorAll('.pf-sortbtns button').forEach((b) => b.addEventListener('click', () => {
        if (done) return;
        card.querySelectorAll('.pf-sortbtns button').forEach((x) => x.classList.toggle('on', x === b));
        card.dataset.pick = b.dataset.v;
        go.disabled = cards.some((c) => !c.dataset.pick);
      }));
    });
    go.addEventListener('click', () => {
      done = true; let right = 0;
      cards.forEach((card) => {
        const m = s.minis[+card.dataset.k], ok = card.dataset.pick === m.answer;
        if (ok) right++;
        card.classList.add(ok ? 'good' : 'work');
        const w = card.querySelector('.why'); w.hidden = false;
        w.innerHTML = `<b>${ok ? '✓' : '○'} ${esc(s.buckets.find(([v]) => v === m.answer)[1].replace(/[✓✕]/g, '').trim())}.</b> ${m.why}`;
      });
      h?.handleStreak?.(right === cards.length);
      go.parentElement.innerHTML = `<span class="pf-hint">${right} of ${cards.length} sorted right.</span>`;
      nextBtn(act, satisfy, s.cta || 'Next →');
    });
  },

  grades(el, s, satisfy, h) {
    const { act, box } = frame(el, s, `${ins(s.do)}${s.chart ? '<div class="pf-chart pf-chart-sm"></div>' : ''}<div class="pf-grades">${s.rows.map((r, k) => `<div class="pf-grade" data-k="${k}">${r.icon ? `<span class="pf-oi">${icon(r.icon, r.tone || 'peach', 22)}</span>` : ''}<b>${esc(r.label)}</b><div class="pf-gopts">${r.options.map((o) => `<button type="button" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div><small hidden></small></div>`).join('')}</div><div class="pf-fb" hidden></div><div class="pf-row"><button type="button" class="pf-btn" disabled>Check my grades</button></div>`);
    if (s.chart) drawChart(box.querySelector('.pf-chart'), s.chart);
    const rows = [...box.querySelectorAll('.pf-grade')], go = box.querySelector('.pf-btn');
    let done = false;
    rows.forEach((r) => r.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      if (done) return;
      r.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); r.dataset.pick = b.dataset.v;
      go.disabled = rows.some((x) => !x.dataset.pick);
    })));
    go.addEventListener('click', () => {
      done = true; let right = 0;
      rows.forEach((r) => {
        const row = s.rows[+r.dataset.k], ok = r.dataset.pick === row.answer;
        if (ok) right++;
        r.classList.add(ok ? 'good' : 'work');
        const sm = r.querySelector('small'); sm.hidden = false; sm.textContent = `${ok ? '✓' : `○ It’s ${row.answer}.`} ${row.why || ''}`;
      });
      h?.handleStreak?.(right === rows.length);
      go.parentElement.remove();
      say(box.querySelector('.pf-fb'), `<b>${right} of ${rows.length} right.</b> ${s.after || ''}`, right === rows.length ? 'good' : 'work');
      if (s.dayli) box.querySelector('.pf-fb').insertAdjacentHTML('afterend', dayli(s.dayli));
      nextBtn(act, satisfy, s.cta || 'Next →');
    });
  },

  minis(el, s, satisfy) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-minis is-${s.minis.length}">${s.minis.map((m) => `<div class="pf-mini ${m.tone ? `is-${m.tone}` : ''}"><h4>${esc(m.title)}</h4>${m.ctx ? `<span class="ctx">${esc(m.ctx)}</span>` : ''}<div class="pf-mchart"></div>${m.note ? `<div class="why">${m.note}</div>` : ''}</div>`).join('')}</div>${dayli(s.dayli)}`);
    box.querySelectorAll('.pf-mchart').forEach((c, k) => drawChart(c, { pil: 'PIL', w: 440, h: 200, ...s.minis[k].chart }));
    nextBtn(act, satisfy, s.cta || 'Next →');
  },

  reveal(el, s, satisfy) {
    const { act, box } = frame(el, s, `${s.chart ? '<div class="pf-chart"></div>' : ''}<div class="pf-tiles">${(s.tiles || []).map((t) => `<div class="pf-tile ${t.tone ? `is-${t.tone}` : ''}"><small>${esc(t.label)}</small><b>${esc(t.value)}</b></div>`).join('')}</div>${dayli(s.dayli)}`);
    if (s.chart) drawChart(box.querySelector('.pf-chart'), s.chart);
    nextBtn(act, satisfy, s.cta || 'Next →');
  },

  note(el, s, satisfy) {
    const { act, box } = frame(el, s, `${ins(s.do)}<div class="pf-cards">${s.cards.map((c, i) => `<div class="pf-ncard">${c.icon ? icon(c.icon, c.tone || 'pink', 28) : `<span class="n">${i + 1}</span>`}<b>${c.title}</b>${c.text ? `<p>${c.text}</p>` : ''}</div>`).join('')}</div>${dayli(s.dayli)}`);
    nextBtn(act, satisfy, s.cta || 'Next →');
  },
};

function legend() {
  return `<div class="pf-legend"><span><i style="background:${C.peach}"></i>PIL</span><span><i style="background:${C.purple}"></i>Dayli’s marks</span><span><i style="background:${C.teal}"></i>Entry · target</span><span><i style="background:${C.pink}"></i>Stop</span></div>`;
}

export function renderP8Focus(el, slide, satisfy, helpers) {
  const k = KINDS[slide.kind];
  if (!k) { el.innerHTML = `<p>Unknown slide: ${esc(slide.kind)}</p>`; satisfy?.(); return; }
  k(el, slide, satisfy, helpers);
}

export const P8_FOCUS_RENDERERS = { p8_focus: renderP8Focus };
