/**
 * sd-slides.js — A Girl & Her Futures™
 * Strategy Lab slide types (Supply & Demand, Powered by Higher-Timeframe ICC™).
 *
 *   { type: 'sd_story', kicker, headline, line, scenario, tf, start, steps: [{ until, tf?, show: [...], caption, provisional? }], check?, cta }
 *       Candles print step by step; each "Show me →" plays to `until` and adds overlays.
 *   { type: 'sd_pick', kicker, headline, line, scenario, tf, until, show, ask, target, within?, after?, cta }
 *       Tap a candle. Wrong taps get feedback naming what that candle actually is.
 *   { type: 'sd_zone', kicker, headline, line, rounds: [{ scenario, validity? }], cta }   the Zone Builder
 *   { type: 'sd_exec', kicker, headline, line, scenarios: [...], cta }                    the Execution Lab
 *
 * `until` / `start`: a 5M bar count, or a sequence point: 'start' | 'bos1' | 'c1' | 'bos2' | 'c2' |
 * 'bos3' | 'retest' | 'invalid' | 'end', optionally '+n' / '-n' (e.g. 'bos3+2').
 * `show`: overlays: 'bos1' 'c1' 'bos2' 'c2' 'zone' 'zoneCandle' 'bos3' 'retest' 'invalid' 'entry'.
 * `provisional`: keys of PROVISIONAL in sd-core.js; each shows the RULE REQUIRES DAYLI CONFIRMATION label.
 */
import { shell, nextBtn, check } from './lesson-v2.js';
import { mountSdChart } from './sd-chart.js';
import { SCENARIOS } from './sd-scenarios.js';
import { analyse, execMachine, SEQUENCE, PROVISIONAL, CONFIRM_LABEL, STRATEGY_VERSION, nearEdge, bar15Of, closesThrough, wicksThroughOnly } from './sd-core.js';
import { recordTool } from './sd-progress.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = (p) => Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function scenario(id) {
  const sc = SCENARIOS[id];
  if (!sc) throw new Error(`Unknown Strategy Lab scenario: ${id}`);
  return { sc, a: analyse(sc) };
}

/** Resolve `until` to a number of 5M bars shown. */
export function untilK(sc, a, u) {
  if (u == null) return sc.bars.length;
  if (typeof u === 'number') return u;
  const m = /^([a-z0-9]+)([+-]\d+)?$/.exec(u);
  const P = a.points;
  const base = {
    start: Math.max(6, (P.bos1?.at15 ?? 4) * 3 - 3),
    bos1: P.bos1?.at + 1,
    c1: P.c1 ? P.c1.to + 1 : undefined,
    bos2: P.bos2?.at >= 0 ? P.bos2.at + 1 : undefined,
    c2: P.c2 ? P.c2.to + 1 : undefined,
    bos3: P.bos3?.at >= 0 ? P.bos3.at + 1 : undefined,
    retest: P.retest?.at >= 0 ? P.retest.at + 1 : undefined,
    invalid: P.invalid?.at >= 0 ? P.invalid.at + 1 : undefined,
    end: sc.bars.length,
  }[m ? m[1] : u];
  return Math.max(1, Math.min(sc.bars.length, (base ?? sc.bars.length) + (m?.[2] ? +m[2] : 0)));
}

/** The standard labels for each part of the sequence. */
export function overlay(ch, sc, a, keys = []) {
  const P = a.points, bull = sc.dir === 'bullish';
  const has = (k) => keys.includes(k);
  if (has('bos1') && P.bos1) {
    ch.level('bos1', { price: P.bos1.level, label: '15M level', tone: 'purple', at: 0 });
    ch.tag('bos1', { at: P.bos1.at, text: 'BOS #1', tone: 'purple', where: bull ? 'above' : 'below' });
  }
  if (has('c1') && P.c1) ch.band('c1', { from: P.c1.from, to: P.c1.to, label: 'Correction #1', tone: 'peach' });
  if (has('bos2') && P.bos2?.at >= 0) {
    ch.level('bos2', { price: P.bos2.level, label: 'BOS #2 level', tone: 'teal', at: P.c1.swing.at });
    ch.tag('bos2', { at: P.bos2.at, text: 'BOS #2', tone: 'teal', where: bull ? 'above' : 'below' });
  }
  if (has('c2') && P.c2) ch.band('c2', { from: P.c2.from, to: P.c2.to, label: 'Correction #2', tone: 'pink' });
  if ((has('zone') || has('bos3')) && a.zone) ch.zone({ at: a.zone.at, hi: a.zone.hi, lo: a.zone.lo, state: has('invalid') ? 'invalid' : has('bos3') ? 'active' : 'potential' });
  if (has('zoneCandle') && a.zone) ch.tag('zc', { at: a.zone.at, text: 'ZONE CANDLE', tone: 'ink', where: bull ? 'below' : 'above' });
  if (has('bos3') && P.bos3?.at >= 0) {
    ch.level('bos3', { price: P.bos3.level, label: 'BOS #3 level', tone: 'pink', at: P.c2.swing.at });
    ch.tag('bos3', { at: P.bos3.at, text: 'BOS #3', tone: 'pink', where: bull ? 'above' : 'below' });
  }
  if (has('retest') && P.retest?.at >= 0) ch.tag('retest', { at: P.retest.at, text: 'RETEST', tone: 'gold', where: bull ? 'below' : 'above' });
  if (has('invalid') && P.invalid?.at >= 0) ch.tag('invalid', { at: P.invalid.at, text: 'CLOSED BEYOND', tone: 'bad', where: bull ? 'below' : 'above' });
  if (has('entry') && a.zone) ch.level('entry', { price: nearEdge(a.zone, sc.dir), label: `Limit ${fmt(nearEdge(a.zone, sc.dir))}`, tone: 'gold', at: a.zone.at });
}

export function confirmHtml(keys = []) {
  return keys.filter((k) => PROVISIONAL[k]).map((k) => `
    <div class="sd-confirm"><b>⚠ ${CONFIRM_LABEL}</b><span>${esc(PROVISIONAL[k])}</span></div>`).join('');
}

function chartBox(extra = '') {
  return `<div class="v2-chartbox sd-box"><div class="sd-host"></div><div class="v2-chart-cap"></div><div class="sd-confirm-slot"></div>${extra}</div>`;
}

/* ── sd_story ────────────────────────────────────────────────────────── */

export function renderSdStory(el, slide, satisfy, helpers) {
  const { sc, a } = scenario(slide.scenario);
  const { act, right } = shell(el, slide, chartBox('<button type="button" class="v2-stepbtn">Show me →</button>'), slide.check ? '<div class="v2-check-slot"></div>' : '', { cls: 'v2-wide sd-wide' });
  const cap = right.querySelector('.v2-chart-cap');
  const conf = right.querySelector('.sd-confirm-slot');
  const btn = right.querySelector('.v2-stepbtn');
  const ch = mountSdChart(right.querySelector('.sd-host'), sc, { tf: slide.tf || '5M', k: untilK(sc, a, slide.start ?? 'start'), toggle: slide.toggle });
  overlay(ch, sc, a, slide.show || []);
  conf.innerHTML = confirmHtml(slide.provisional);
  const steps = slide.steps || [];
  let i = 0, shown = [...(slide.show || [])];
  const finish = () => {
    btn.remove();
    if (slide.check) check(el.querySelector('.v2-check-slot'), slide.check, helpers, () => nextBtn(act, satisfy, slide.cta || 'Next →'));
    else nextBtn(act, satisfy, slide.cta || 'Next →');
  };
  if (!steps.length) { finish(); return; }
  btn.addEventListener('click', async () => {
    const s = steps[i];
    btn.disabled = true;
    if (s.tf) ch.setTf(s.tf);
    await ch.play(untilK(sc, a, s.until ?? ch.k), s.speed || 120);
    if (s.clear) { ch.clear(); shown = []; }
    shown = [...shown, ...(s.show || [])];
    overlay(ch, sc, a, shown);
    cap.innerHTML = s.caption || '';
    conf.innerHTML = confirmHtml([...(slide.provisional || []), ...(s.provisional || [])]);
    i += 1;
    btn.disabled = false;
    if (i >= steps.length) finish();
    else btn.textContent = s.next || 'Next step →';
  });
}

/* ── sd_pick ─────────────────────────────────────────────────────────── */

const inRange = (i, r) => r && i >= r[0] && i <= r[1];

/** What the candle she tapped actually is, measured against what she was asked for. */
export function explainPick(sc, a, i, target) {
  const P = a.points, b = sc.bars[i], bull = sc.dir === 'bullish';
  const opp = bull ? 'bearish' : 'bullish';
  const who = bull ? 'buyers' : 'sellers';
  if (target === 'zone') {
    if (inRange(i, P.c1 && [P.c1.from, P.c1.to])) return 'That candle is in Correction #1. Correction #1 never creates the execution zone. The zone comes from Correction #2.';
    if (inRange(i, P.c2 && [P.c2.from, P.c2.to])) {
      const isOpp = bull ? b.c < b.o : b.c > b.o;
      if (!isOpp) return `That candle is inside Correction #2, but it’s ${bull ? 'bullish' : 'bearish'}. The zone comes from the last ${opp} candle before ${who} produce BOS #3.`;
      return `Right correction, wrong candle. It’s ${opp}, but there’s a later ${opp} candle before BOS #3. Use the last one.`;
    }
    if (P.bos3?.at >= 0 && i >= P.bos3.at) return 'That candle is after BOS #3. The zone is formed inside Correction #2, before BOS #3.';
    return 'That candle is part of a directional move, not Correction #2. Find the second correction, then its last opposite-colour candle.';
  }
  if (target === 'c2') {
    if (inRange(i, P.c1 && [P.c1.from, P.c1.to])) return 'That’s Correction #1, the pullback after BOS #1. Correction #2 comes after BOS #2.';
    return 'That candle isn’t in a correction. Look for the second pullback, after BOS #2.';
  }
  if (target === 'c1') {
    if (inRange(i, P.c2 && [P.c2.from, P.c2.to])) return 'That’s Correction #2. Correction #1 is the first pullback, right after BOS #1.';
    return 'That candle isn’t in a correction. Look for the first pullback after BOS #1.';
  }
  if (['bos1', 'bos2', 'bos3'].includes(target)) {
    const pt = P[target];
    const name = { bos1: 'BOS #1', bos2: 'BOS #2', bos3: 'BOS #3' }[target];
    if (target === 'bos1') {
      const j = bar15Of(i);
      if (j < pt.at15) return `That 15M candle hasn’t closed ${bull ? 'above' : 'below'} the 15M level yet. ${name} needs a 15M candle close through it.`;
      return 'Price had already closed through the 15M level before this candle. BOS #1 is the FIRST 15M close through it.';
    }
    if (wicksThroughOnly(b, pt.level, sc.dir)) return `Wick only. That candle traded through the level but closed back ${bull ? 'below' : 'above'} it. ${name} needs a 5M candle close through the level.`;
    if (i < pt.at) return `That candle didn’t close ${bull ? 'above' : 'below'} the level. ${name} is the first 5M close through it.`;
    if (closesThrough(b, pt.level, sc.dir)) return `Price had already closed through the level before this candle. ${name} is the FIRST close through it.`;
    return `That candle is after ${name}. Look for the first 5M close through the level.`;
  }
  if (target === 'retest') {
    if (P.bos3?.at >= 0 && i <= P.bos3.at) return 'A retest only counts after BOS #3 has activated the zone.';
    if (i < P.retest.at) return 'Price hasn’t come back to the zone yet on that candle.';
    return 'Price was already back in the zone before this candle. The retest is the first return.';
  }
  return 'Not that one. Look again.';
}

function targetHits(sc, a, target, i) {
  const P = a.points;
  if (target === 'zone') return i === a.zone?.at;
  if (target === 'c1') return inRange(i, [P.c1.from, P.c1.to]);
  if (target === 'c2') return inRange(i, [P.c2.from, P.c2.to]);
  if (target === 'bos1') return bar15Of(i) === P.bos1.at15;
  if (target === 'retest') return i === P.retest.at;
  return i === P[target]?.at;
}

export function renderSdPick(el, slide, satisfy, helpers) {
  const { sc, a } = scenario(slide.scenario);
  const { act, right } = shell(el, slide, chartBox(`<div class="sd-ask">${esc(slide.ask || 'Tap the candle.')}</div><div class="lw-feedback"></div>`), '', { cls: 'v2-wide sd-wide' });
  const fb = right.querySelector('.lw-feedback');
  const ch = mountSdChart(right.querySelector('.sd-host'), sc, { tf: slide.tf || '5M', k: untilK(sc, a, slide.until), toggle: false });
  overlay(ch, sc, a, slide.show || []);
  right.querySelector('.sd-confirm-slot').innerHTML = confirmHtml(slide.provisional);
  const within = slide.within ? [untilK(sc, a, slide.within[0]), untilK(sc, a, slide.within[1]) - 1] : null;
  let solved = false;
  ch.tappable((i) => {
    if (solved) return;
    const ok = targetHits(sc, a, slide.target, i);
    helpers.onPick?.({ prompt: slide.ask, concept: `sd:${slide.target}` }, { label: `bar ${i}` }, ok);
    helpers.handleStreak?.(ok);
    if (!ok) {
      ch.mark(i, 'bad'); ch.flash();
      setTimeout(() => ch.mark(i, null), 700);
      fb.className = 'lw-feedback show bad';
      fb.innerHTML = explainPick(sc, a, i, slide.target);
      return;
    }
    solved = true;
    ch.tappable(null);
    ch.mark(i, 'good');
    fb.className = 'lw-feedback show good';
    fb.innerHTML = `<strong>✦ Yes.</strong> ${slide.why || ''}`;
    if (slide.after) {
      overlay(ch, sc, a, [...(slide.show || []), ...(slide.after.show || [])]);
      if (slide.after.until) ch.play(untilK(sc, a, slide.after.until));
      if (slide.after.caption) right.querySelector('.v2-chart-cap').innerHTML = slide.after.caption;
    }
    helpers.burst?.();
    nextBtn(act, satisfy, slide.cta || 'Next →');
  }, (i5) => !within || (i5 >= within[0] && i5 <= within[1]));
}

/* ── sd_zone: the Zone Builder ───────────────────────────────────────── */

const BOUNDS = [
  { key: 'full', label: 'The zone candle’s full high to low', ok: true },
  { key: 'body', label: 'Only the zone candle’s body', ok: false, why: 'The working model uses the candle’s full high-to-low range, wicks included, not just the body.' },
  { key: 'all', label: 'The whole of Correction #2', ok: false, why: 'Don’t mark the entire correction as the entry zone. Correction #2 creates the zone, but the zone is one candle.' },
];

export function renderSdZone(el, slide, satisfy, helpers) {
  const rounds = slide.rounds || [{ scenario: 'bull-valid' }, { scenario: 'bear-invalid', validity: true }];
  const { act, right } = shell(el, slide, `
    <div class="sd-builder">
      <div class="sd-round"></div>
      ${chartBox()}
      <div class="sd-stage"></div>
    </div>`, '', { cls: 'v2-wide sd-wide' });
  const roundEl = right.querySelector('.sd-round');
  const stage = right.querySelector('.sd-stage');
  const cap = right.querySelector('.v2-chart-cap');
  const conf = right.querySelector('.sd-confirm-slot');
  let r = 0, mistakes = 0;

  function ask(html, options, onRight) {
    stage.innerHTML = `<div class="sd-q">${html}</div><div class="v2-chips v2-chips-col">${options.map((o, i) => `<button type="button" class="v2-chip" data-i="${i}">${o.label}</button>`).join('')}</div><div class="lw-feedback"></div>`;
    const fb = stage.querySelector('.lw-feedback');
    stage.querySelectorAll('.v2-chip').forEach((b, i) => b.addEventListener('click', () => {
      const o = options[i];
      helpers.handleStreak?.(o.ok);
      if (!o.ok) { mistakes += 1; b.classList.add('wrong'); b.disabled = true; fb.className = 'lw-feedback show bad'; fb.innerHTML = o.why; return; }
      stage.querySelectorAll('.v2-chip').forEach((x) => { x.disabled = true; });
      b.classList.add('correct');
      fb.className = 'lw-feedback show good';
      fb.innerHTML = `<strong>✦ Yes.</strong> ${o.yes || ''}`;
      setTimeout(onRight, 900);
    }));
  }
  function tap(prompt, target, ch, sc, a, onRight) {
    stage.innerHTML = `<div class="sd-q">${prompt}</div><div class="lw-feedback"></div>`;
    const fb = stage.querySelector('.lw-feedback');
    ch.tappable((i) => {
      const ok = targetHits(sc, a, target, i);
      helpers.handleStreak?.(ok);
      if (!ok) { mistakes += 1; ch.mark(i, 'bad'); ch.flash(); setTimeout(() => ch.mark(i, null), 700); fb.className = 'lw-feedback show bad'; fb.innerHTML = explainPick(sc, a, i, target); return; }
      ch.tappable(null);
      ch.mark(i, 'good');
      fb.className = 'lw-feedback show good';
      fb.innerHTML = '<strong>✦ Yes.</strong>';
      setTimeout(() => { ch.mark(i, null); onRight(i); }, 700);
    });
  }

  function round() {
    const spec = rounds[r];
    const { sc, a } = scenario(spec.scenario);
    const bull = sc.dir === 'bullish';
    const kind = bull ? 'demand' : 'supply';
    const opp = bull ? 'bearish' : 'bullish';
    roundEl.innerHTML = `<span>Round ${r + 1} of ${rounds.length}</span><b>${bull ? 'Bullish · Demand' : 'Bearish · Supply'}</b>`;
    conf.innerHTML = '';
    cap.innerHTML = 'BOS #1 and BOS #2 are marked. Correction #2 has just ended.';
    const ch = mountSdChart(right.querySelector('.sd-host'), sc, { tf: '5M', k: untilK(sc, a, 'c2+1'), toggle: false });
    overlay(ch, sc, a, ['bos1', 'bos2']);

    // 1. Correction #1 vs Correction #2.
    tap('<b>Step 1.</b> Tap any candle in <b>Correction #2</b>.', 'c2', ch, sc, a, () => {
      overlay(ch, sc, a, ['bos1', 'c1', 'bos2', 'c2']);
      cap.innerHTML = 'Correction #1 came after BOS #1. Correction #2 came after BOS #2. <b>Correction #2 creates the zone.</b>';
      // 2. The zone-forming candle, not the whole correction.
      tap(`<b>Step 2.</b> Tap the candle that forms the ${kind} zone: the <b>last ${opp} candle</b> of Correction #2.`, 'zone', ch, sc, a, () => {
        overlay(ch, sc, a, ['bos1', 'c1', 'bos2', 'c2', 'zoneCandle']);
        // 3. Boundaries (working model, labelled).
        conf.innerHTML = confirmHtml(['zoneBounds']);
        ask('<b>Step 3.</b> Using the current working model, what are the zone’s boundaries?', BOUNDS.map((b) => ({ ...b, yes: 'The working model uses the zone candle’s full high-to-low range.' })), () => {
          overlay(ch, sc, a, ['bos1', 'c1', 'bos2', 'c2', 'zoneCandle', 'zone']);
          cap.innerHTML = `Zone: <b>${fmt(a.zone.lo)} – ${fmt(a.zone.hi)}</b>, the candle’s full range.`;
          // 4. Potential vs active.
          ask('<b>Step 4.</b> Can this zone be traded yet?', [
            { label: `No. It’s a potential ${kind} zone until BOS #3`, ok: true, yes: 'A zone is not activated just because the opposite-colour candle appeared. BOS #3 must occur.' },
            { label: 'Yes. The zone candle is there', ok: false, why: 'Not yet. A zone is not activated merely because the opposite-colour candle has appeared. BOS #3 must occur first.' },
          ], async () => {
            stage.innerHTML = '';
            await ch.play(untilK(sc, a, 'bos3'));
            overlay(ch, sc, a, ['bos1', 'c1', 'bos2', 'c2', 'zoneCandle', 'bos3']);
            cap.innerHTML = `BOS #3: a 5M candle closed ${bull ? 'above' : 'below'} the high${bull ? '' : '/low'} Correction #2 pulled back from. <b>The zone is now active.</b>`;
            if (!spec.validity) return done(ch, sc, a);
            // 5. Valid vs invalidated.
            await ch.play(untilK(sc, a, a.outcome === 'invalid' ? 'invalid' : 'retest'));
            ask('<b>Step 5.</b> Look at the latest candle. Is the zone still valid?', a.outcome === 'invalid' ? [
              { label: 'No. A 5M candle closed beyond its far edge', ok: true, yes: `Price closed ${bull ? 'below the zone’s low' : 'above the zone’s high'}, so the setup is invalid. Don’t keep treating this zone as an entry opportunity.` },
              { label: 'Yes. Price is still near the zone', ok: false, why: `Look at where that candle closed: ${bull ? 'below the zone’s low' : 'above the zone’s high'}. Price violated the opposite boundary, so the setup is invalid.` },
            ] : [
              { label: 'Yes. Price came back without closing beyond it', ok: true, yes: 'Price returned to the zone and has not closed beyond its far edge. That’s the retest.' },
              { label: 'No. Price touched the zone', ok: false, why: 'Touching the zone is the retest you were waiting for. A zone is invalidated when price violates its opposite boundary.' },
            ], () => {
              overlay(ch, sc, a, ['bos1', 'c1', 'bos2', 'c2', 'zoneCandle', 'bos3', a.outcome === 'invalid' ? 'invalid' : 'retest']);
              cap.innerHTML = a.outcome === 'invalid'
                ? `A 5M candle closed ${bull ? 'below the zone’s low' : 'above the zone’s high'}. <b>The zone is invalid.</b> If price comes back to it later, it’s still not an entry.`
                : '<b>Price returned to the active zone.</b> That’s the retest.';
              conf.innerHTML = confirmHtml(['zoneBounds', 'invalidation']);
              done(ch, sc, a);
            });
          });
        });
      });
    });
  }

  function done() {
    stage.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v2-stepbtn sd-next';
    const last = r >= rounds.length - 1;
    btn.textContent = last ? 'Finish the Zone Builder ✦' : 'Next round →';
    btn.addEventListener('click', () => {
      if (!last) { r += 1; round(); return; }
      recordTool('zone', { rounds: rounds.length, mistakes, version: STRATEGY_VERSION });
      helpers.burst?.();
      stage.innerHTML = `<div class="sd-result"><b>Zone Builder complete.</b> ${mistakes === 0 ? 'Every answer right the first time.' : `${mistakes} miss${mistakes === 1 ? '' : 'es'} along the way, each one explained.`}</div>`;
      nextBtn(act, satisfy, slide.cta || 'Next →');
    });
    stage.appendChild(btn);
  }
  round();
}

/* ── sd_exec: the Execution Lab ──────────────────────────────────────── */

export function renderSdExec(el, slide, satisfy, helpers) {
  const ids = slide.scenarios || ['bull-valid', 'bear-missed', 'bull-invalid', 'bear-no-bos2', 'bear-valid', 'bull-no-bos3'];
  const { act, right } = shell(el, slide, `
    <div class="sd-lab">
      <div class="sd-round"></div>
      <div class="sd-ctx"></div>
      ${chartBox()}
      <div class="sd-controls">
        <div class="sd-steps">${SEQUENCE.map((s) => `<button type="button" class="sd-stepchip" data-k="${s.key}">${s.short}</button>`).join('')}</div>
        <div class="sd-play">
          <button type="button" class="sd-btn sd-nextc">Next candle ▸</button>
          <button type="button" class="sd-btn sd-switch" hidden>Switch to 5M →</button>
          <span class="sd-spacer"></span>
          <button type="button" class="sd-btn sd-enter">Enter trade</button>
          <button type="button" class="sd-btn sd-pass">No trade</button>
        </div>
      </div>
      <div class="lw-feedback"></div>
    </div>`, '', { cls: 'v2-wide sd-wide' });
  const $ = (s) => right.querySelector(s);
  const fb = $('.lw-feedback');
  const results = [];
  let r = 0;

  function say(html, tone) { fb.className = `lw-feedback show ${tone || ''}`; fb.innerHTML = html; }

  function round() {
    const { sc } = scenario(ids[r]);
    const m = execMachine(sc);
    const a = m.analysis;
    const bull = sc.dir === 'bullish';
    let mistakes = 0, decided = false, zonePick = false;
    $('.sd-round').innerHTML = `<span>Scenario ${r + 1} of ${ids.length}</span><b>${STRATEGY_VERSION}</b>`;
    $('.v2-chart-cap').innerHTML = '';
    $('.sd-confirm-slot').innerHTML = confirmHtml(['limitEntry']);
    fb.className = 'lw-feedback'; fb.innerHTML = '';
    right.querySelectorAll('.sd-stepchip').forEach((b) => { b.className = 'sd-stepchip'; b.disabled = true; });
    ['.sd-nextc', '.sd-enter', '.sd-pass'].forEach((s) => { $(s).disabled = true; });
    const ch = mountSdChart($('.sd-host'), sc, { tf: '15M', k: untilK(sc, a, 'start'), toggle: false });

    // 1. Read the higher-timeframe context.
    $('.sd-ctx').innerHTML = `
      <div class="sd-ctx-row"><span>4H</span>${esc(sc.ctx.h4)}</div>
      <div class="sd-ctx-row"><span>1H</span>${esc(sc.ctx.h1)}</div>
      <div class="sd-ctx-row"><span>HTF</span>${esc(sc.ctx.htf)}</div>
      <div class="sd-ctx-q"><b>Step 1.</b> Which direction does this context support?
        <div class="v2-chips"><button type="button" class="v2-chip" data-d="bullish">Bullish · look for demand</button><button type="button" class="v2-chip" data-d="bearish">Bearish · look for supply</button></div>
      </div>`;
    $('.sd-ctx').querySelectorAll('.v2-chip').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.d !== sc.dir) { mistakes += 1; b.classList.add('wrong'); b.disabled = true; say('Read the context again. The 4H, the 1H and the HTF ICC all point the other way.', 'bad'); return; }
      b.classList.add('correct');
      $('.sd-ctx').querySelectorAll('.v2-chip').forEach((x) => { x.disabled = true; });
      say(`Higher-timeframe ICC supplies the direction. On the 15M you’re waiting for a ${bull ? 'bullish' : 'bearish'} BOS #1. Mark each step as it happens.`, 'good');
      start();
    }));

    function chips() {
      right.querySelectorAll('.sd-stepchip').forEach((b) => {
        const k = b.dataset.k;
        b.classList.toggle('is-done', m.done.includes(k));
        b.disabled = decided || m.done.includes(k);
      });
    }
    function labels() {
      overlay(ch, sc, a, m.done.filter((k) => k !== 'zone').concat(m.done.includes('zone') ? ['zone', 'zoneCandle'] : []));
    }
    function atDecision() {
      if (ch.k >= m.decisionK) {
        $('.sd-nextc').disabled = true;
        $('.v2-chart-cap').innerHTML = '<b>Decision point.</b> Enter the trade, or pass?';
      }
    }

    function start() {
      ['.sd-nextc', '.sd-enter', '.sd-pass'].forEach((s) => { $(s).disabled = false; });
      chips();
      $('.v2-chart-cap').innerHTML = '15M chart. Watch for BOS #1: a 15M candle close through the 15M level.';
      ch.level('lvl15', { price: sc.bos1.level, label: '15M level', tone: 'purple', at: 0 });
    }

    $('.sd-nextc').onclick = () => {
      const stepN = ch.tf === '15M' ? 3 - (ch.k % 3 || 0) || 3 : 1;
      ch.show(Math.min(m.decisionK, ch.k + stepN));
      atDecision();
    };
    $('.sd-switch').onclick = () => {
      ch.setTf('5M');
      $('.sd-switch').hidden = true;
      $('.sd-nextc').disabled = false;
      $('.v2-chart-cap').innerHTML = '5M chart. Now watch for Correction #1, then BOS #2.';
    };
    right.querySelectorAll('.sd-stepchip').forEach((b) => { b.onclick = () => {
      if (decided) return;
      const key = b.dataset.k;
      if (key === 'zone') {
        // Marking the zone means tapping the candle that forms it.
        const res = m.occurredBy('zone', ch.k) && m.next()?.key === 'zone';
        if (!res) { const out = m.mark('zone', ch.k); mistakes += 1; say(out.why, 'bad'); return; }
        zonePick = true;
        say(`Tap the candle that forms the ${bull ? 'demand' : 'supply'} zone: the last ${bull ? 'bearish' : 'bullish'} candle of Correction #2.`, '');
        ch.tappable((i) => {
          if (i !== a.zone.at) { mistakes += 1; ch.mark(i, 'bad'); setTimeout(() => ch.mark(i, null), 700); say(explainPick(sc, a, i, 'zone'), 'bad'); return; }
          ch.tappable(null); zonePick = false;
          m.mark('zone', ch.k);
          labels(); chips();
          $('.sd-confirm-slot').innerHTML = confirmHtml(['zoneBounds', 'limitEntry']);
          say(`Zone marked: ${fmt(a.zone.lo)} – ${fmt(a.zone.hi)}. It’s a <b>potential</b> zone until BOS #3.`, 'good');
        });
        return;
      }
      if (zonePick) return;
      const out = m.mark(key, ch.k);
      if (!out.ok) { mistakes += 1; helpers.handleStreak?.(false); say(out.why, 'bad'); return; }
      helpers.handleStreak?.(true);
      labels(); chips();
      say(`<b>${out.step.label}.</b> ✓`, 'good');
      if (key === 'bos1') {
        ch.level('lvl15', null);
        labels();
        $('.sd-nextc').disabled = true;
        $('.sd-switch').hidden = false;
        $('.v2-chart-cap').innerHTML = 'BOS #1 is confirmed on the 15M. The rest of the sequence develops on the 5M.';
      }
      if (key === 'bos3') { overlay(ch, sc, a, [...m.done, 'zone', 'zoneCandle', 'bos3', 'entry']); $('.v2-chart-cap').innerHTML = 'BOS #3 activated the zone. Now wait for price to return to it. Don’t chase.'; }
    }; });

    function decide(choice) {
      if (decided || zonePick) return;
      if (ch.tf === '15M' && choice === 'enter') { mistakes += 1; say('No entry on the 15M. BOS #1 is only the start of the sequence.', 'bad'); return; }
      const out = m.decide(choice, ch.k);
      if (out.early) { say(out.why, ''); return; }
      helpers.handleStreak?.(out.ok);
      if (!out.ok) { mistakes += 1; say(out.why, 'bad'); return; }
      decided = true;
      chips();
      ['.sd-nextc', '.sd-enter', '.sd-pass'].forEach((s) => { $(s).disabled = true; });
      ch.setTf('5M');
      ch.show(Math.max(ch.k, m.decisionK));
      const all = ['bos1', 'c1', 'bos2', 'c2', 'zone', 'zoneCandle', 'bos3'];
      overlay(ch, sc, a, [...all, a.outcome === 'invalid' ? 'invalid' : 'retest', ...(a.outcome === 'valid' ? ['entry'] : [])]);
      results.push({ id: sc.id, outcome: a.outcome, clean: mistakes === 0, mistakes });
      say(`<strong>✦ ${choice === 'enter' ? 'Entry' : 'No trade'}.</strong> ${out.why}${mistakes ? ` <span class="sd-miss">${mistakes} miss${mistakes === 1 ? '' : 'es'} this scenario.</span>` : ''}`, 'good');
      const last = r >= ids.length - 1;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'v2-stepbtn sd-next';
      btn.textContent = last ? 'See your results ✦' : 'Next scenario →';
      btn.onclick = () => { btn.remove(); if (!last) { r += 1; round(); } else finish(); };
      fb.appendChild(btn);
    }
    $('.sd-enter').onclick = () => decide('enter');
    $('.sd-pass').onclick = () => decide('pass');
  }

  function finish() {
    const clean = results.filter((x) => x.clean).length;
    recordTool('exec', { results, clean, total: results.length, version: STRATEGY_VERSION });
    helpers.burst?.();
    $('.sd-controls').hidden = true;
    $('.sd-ctx').innerHTML = '';
    say(`<strong>Execution Lab complete.</strong> ${clean} of ${results.length} scenarios with no misses.<ul class="sd-res">${results.map((x) => `<li><b>${x.id.replace(/-/g, ' ')}</b> · ${x.outcome === 'valid' ? 'valid entry' : x.outcome === 'missed' ? 'missed retest, no trade' : x.outcome === 'invalid' ? 'invalidated zone, no trade' : 'incomplete, no trade'}${x.clean ? ' ✓' : ` · ${x.mistakes} miss${x.mistakes === 1 ? '' : 'es'}`}</li>`).join('')}</ul>`, 'good');
    nextBtn(act, satisfy, slide.cta || 'Next →');
  }
  round();
}

export const SD_RENDERERS = { sd_story: renderSdStory, sd_pick: renderSdPick, sd_zone: renderSdZone, sd_exec: renderSdExec };
