/**
 * scene.js — A Girl & Her Futures™
 *
 * Phase 7 · the lived moment. She already knows how to read the chart; the chart
 * isn't the lesson anymore. SHE is. Every scene follows the same arc:
 *
 *   THE MOMENT → INTERNAL DIALOGUE → TEMPTATION → DECISION → CONSEQUENCE → SELF-RECOGNITION
 *
 * Decisions are never graded on the spot. She picks, watches what her choice does,
 * and can replay every other path. Nothing says "correct" or "wrong" here.
 *
 *   { type: 'p7_scene', kicker, title, beats: [
 *       { say: 'line' | ['line', …], big }           narration, second person
 *       { chart, play: { from, to, speed }, caption } exec bars (1M) or a structure sketch
 *       { thoughts: ['…'], keep }                     her inner voice over the last chart
 *       { clear: true }                               the chart comes back into focus
 *       { cards: ['…'] }                              chips, one by one
 *       { choice: { prompt, options: [{ label, track, path: { chart, play, thoughts, say, tally, stamp } }] } }
 *       { who: { title, before: { h, lines }, after: { h, lines }, verdict } }
 *       { principle: 'text' }                         the one sentence the scene earns
 *       { ask: q }                                    an optional reflective question (runAsks)
 *       { pause: { market, plan, mind, action } }     the PAUSE grid, open
 *       { tally: [[k, v, tone]], stamp }              a session result, never a red $0
 *   ] }
 */

import { continueBtn, head, chartBlock, runAsks, principle } from './mind.js';
import { mindOn, mindOff, pauseHtml, reduced } from './mind-ui.js';
import { trackAll } from './mind-core.js';

const isBig = (l) => /^<b>|^[A-Z0-9 .,’'!?:…“”😭😂🔥✓·\-+$%]+$/.test(l);

function sayHtml(lines, big) {
  return [].concat(lines).map((l, i) => `<div class="p7-line${big || isBig(l) ? ' is-big' : ''}" style="--d:${reduced() ? 0 : i * 0.75}s">${l}</div>`).join('');
}
const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));

export function renderScene(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-scene">${slide.title || slide.kicker ? head(slide, '') : ''}<div class="p7-scene-flow"></div></div>`;
  const card = el.querySelector('.p7-scene');
  const flow = card.querySelector('.p7-scene-flow');
  let lastChart = null;

  const tap = (label = 'Next') => new Promise((res) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'p7-tap'; b.innerHTML = `${label} <span>▸</span>`;
    b.addEventListener('click', () => { b.remove(); res(); });
    flow.appendChild(b);
    if (!reduced()) b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  const block = (cls, html) => { const d = document.createElement('div'); d.className = `p7-beat ${cls}`; if (html != null) d.innerHTML = html; flow.appendChild(d); return d; };

  async function playPath(host, path) {
    if (path.chart) {
      if (lastChart) mindOff(lastChart);
      const box = chartBlock(host, path.chart);
      lastChart = box;
      await box.played;
    }
    if (path.thoughts && lastChart) { mindOn(lastChart, path.thoughts, { gap: 0.7 }); await wait(700 * path.thoughts.length + 600); }
    if (path.say) { host.insertAdjacentHTML('beforeend', `<div class="p7-path-say">${sayHtml(path.say)}</div>`); await wait(750 * [].concat(path.say).length + 300); }
    if (path.tally) {
      host.insertAdjacentHTML('beforeend', `${path.stamp ? `<div class="p7-stamp">${path.stamp}</div>` : ''}<div class="p7-tally">${path.tally.map(([k, v, tone], i) => `<div class="p7-tr is-${tone || 'ink'}" style="--d:${reduced() ? 0 : 0.2 + i * 0.4}s"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`);
      await wait(400 * path.tally.length + 400);
    }
  }

  async function choice(c) {
    const box = block('p7-choice', `<div class="p7-choice-q">${c.prompt || 'What do you do?'}</div><div class="p7-choice-opts">${c.options.map((o, i) => `<button type="button" class="p7-opt" data-i="${i}">${o.label}</button>`).join('')}</div><div class="p7-paths"></div>`);
    const paths = box.querySelector('.p7-paths');
    const seen = new Set();
    const first = await new Promise((res) => box.querySelectorAll('.p7-opt').forEach((b) => b.addEventListener('click', () => res(+b.dataset.i), { once: true })));
    box.querySelectorAll('.p7-opt').forEach((b) => { b.disabled = true; b.classList.toggle('is-on', +b.dataset.i === first); });
    const o0 = c.options[first];
    if (o0.track) trackAll(o0.track);
    helpers.onPick?.({ prompt: c.prompt, concept: slide.concept }, { label: o0.label }, true, 0);
    const show = async (i) => {
      seen.add(i);
      if (lastChart) mindOff(lastChart);
      const p = document.createElement('div');
      p.className = `p7-path${i === first ? ' is-mine' : ''}`;
      p.innerHTML = `<div class="p7-path-h">${i === first ? 'YOU CHOSE' : 'IF YOU’D CHOSEN'} · <b>${c.options[i].label}</b></div>`;
      paths.appendChild(p);
      if (!reduced()) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      await playPath(p, c.options[i].path || {});
    };
    await show(first);
    // Replay the other paths, or move on. Either way, no grade.
    for (;;) {
      const rest = c.options.map((o, i) => i).filter((i) => !seen.has(i));
      const row = document.createElement('div');
      row.className = 'p7-path-more';
      row.innerHTML = rest.map((i) => `<button type="button" class="p7-alt" data-i="${i}">What if you chose “${c.options[i].label}”? ↺</button>`).join('');
      paths.appendChild(row);
      const next = await new Promise((res) => {
        row.querySelectorAll('.p7-alt').forEach((b) => b.addEventListener('click', () => res(+b.dataset.i)));
        const t = document.createElement('button');
        t.type = 'button'; t.className = 'p7-tap'; t.innerHTML = `${rest.length ? 'Keep going' : 'Next'} <span>▸</span>`;
        t.addEventListener('click', () => res(-1));
        row.appendChild(t);
      });
      row.remove();
      if (next < 0) break;
      await show(next);
    }
  }

  async function run() {
    const beats = slide.beats || [];
    for (let i = 0; i < beats.length; i++) {
      const b = beats[i];
      const last = i === beats.length - 1;
      if (b.say) { block('p7-say', sayHtml(b.say, b.big)); await wait(750 * [].concat(b.say).length); }
      else if (b.chart) {
        if (lastChart) mindOff(lastChart);
        const host = block('p7-scene-chart');
        lastChart = chartBlock(host, b.chart);
        if (b.caption) host.insertAdjacentHTML('beforeend', `<div class="p7-caption">${b.caption}</div>`);
        await lastChart.played;
      } else if (b.thoughts) {
        if (lastChart) mindOn(lastChart, b.thoughts, { gap: b.gap || 0.9 });
        else block('p7-mono-thoughts', b.thoughts.map((t, j) => `<div class="p7-bubble" style="--d:${j * 0.9}s"><span>${t}</span></div>`).join(''));
        await wait(900 * b.thoughts.length + 400);
      } else if (b.clear) { if (lastChart) mindOff(lastChart); continue; }
      else if (b.cards) { block('p7-mono-cards', b.cards.map((c, j) => `<div class="p7-rcard" style="--d:${reduced() ? 0 : j * 0.5}s">${c}</div>`).join('')); await wait(500 * b.cards.length + 300); }
      else if (b.choice) { await choice(b.choice); continue; }
      else if (b.who) {
        const w = b.who;
        block('p7-who', `<div class="p7-who-t">${w.title || 'WHO’S TRADING NOW?'}</div><div class="p7-split">
          <div class="p7-split-col is-ok"><div class="p7-split-h">${w.before.h}</div>${w.before.lines.map((l, j) => `<div class="p7-split-l" style="--d:${reduced() ? 0 : 0.4 + j * 0.6}s">${l}</div>`).join('')}</div>
          <div class="p7-split-col is-mind"><div class="p7-split-h">${w.after.h}</div>${w.after.lines.map((l, j) => `<div class="p7-split-l" style="--d:${reduced() ? 0 : 0.4 + (w.before.lines.length + j) * 0.6}s">${l}</div>`).join('')}</div></div>
          ${w.verdict ? `<div class="p7-verdict" style="--d:${reduced() ? 0 : 0.8 + (w.before.lines.length + w.after.lines.length) * 0.6}s">${w.verdict}</div>` : ''}`);
        await wait(600 * (w.before.lines.length + w.after.lines.length) + 900);
      } else if (b.principle) { principle(flow, b.principle); await wait(500); }
      else if (b.pause) { block('p7-pausebeat', `<div class="p7-pause-btn is-on">⏸ PAUSE</div>${pauseHtml(b.pause)}`); await wait(2400); }
      else if (b.tally) {
        block('p7-tally-card is-complete', `${b.stamp ? `<div class="p7-stamp">${b.stamp}</div>` : ''}<div class="p7-tally">${b.tally.map(([k, v, tone], j) => `<div class="p7-tr is-${tone || 'ink'}" style="--d:${reduced() ? 0 : 0.2 + j * 0.45}s"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`);
        await wait(450 * b.tally.length + 500);
      } else if (b.ask) {
        const host = block('pl-asks');
        await new Promise((res) => runAsks(host, [b.ask], helpers, res));
        continue;
      }
      if (!last && !b.flow) await tap(b.tap);
    }
    continueBtn(card, satisfy, slide.cta || 'Continue →');
  }
  run();
}


/* ── Stage mode: one chart, one line, nothing piles up ────────────────── */
export function renderStage(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-stg">${slide.kicker ? `<div class="lw-eyebrow">${slide.kicker}</div>` : ''}
    <div class="p7-stg-view"></div><div class="p7-stg-cap" aria-live="polite"></div><div class="p7-stg-ctl"></div></div>`;
  const card = el.querySelector('.p7-stg');
  const view = card.querySelector('.p7-stg-view');
  const cap = card.querySelector('.p7-stg-cap');
  const ctl = card.querySelector('.p7-stg-ctl');
  let chartBox = null;
  const setCap = (t, big) => { cap.innerHTML = t ? `<span class="${big ? 'is-big' : ''}">${t}</span>` : ''; cap.classList.remove('go'); void cap.offsetWidth; cap.classList.add('go'); };
  const showChart = async (c) => { view.innerHTML = ''; chartBox = chartBlock(view, c); await chartBox.played; };
  const panel = (html) => { view.innerHTML = `<div class="p7-stg-panel">${html}</div>`; chartBox = null; };
  const tap = (label = 'Next') => new Promise((res) => {
    ctl.innerHTML = `<button type="button" class="p7-tap">${label} <span>▸</span></button>`;
    ctl.querySelector('button').addEventListener('click', () => { ctl.innerHTML = ''; res(); });
  });
  async function path(o) {
    const p = o.path || {};
    if (chartBox) mindOff(chartBox);
    setCap('');
    if (p.chart) await showChart(p.chart);
    else if (p.tally) panel(`${p.stamp ? `<div class="p7-stamp">${p.stamp}</div>` : ''}<div class="p7-tally">${p.tally.map(([k, v, tone]) => `<div class="p7-tr is-${tone || 'ink'}" style="--d:0s"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`);
    setCap([].concat(p.say || [])[0] || '', true);
  }
  async function choice(c) {
    ctl.innerHTML = `<div class="p7-stg-q">${c.prompt || 'What do you do?'}</div><div class="p7-stg-opts">${c.options.map((o, i) => `<button type="button" class="p7-opt" data-i="${i}">${o.label}</button>`).join('')}</div>`;
    const first = await new Promise((res) => ctl.querySelectorAll('.p7-opt').forEach((b) => b.addEventListener('click', () => res(+b.dataset.i), { once: true })));
    const o0 = c.options[first];
    if (o0.track) trackAll(o0.track);
    helpers.onPick?.({ prompt: c.prompt, concept: slide.concept }, { label: o0.label }, true, 0);
    const seen = new Set([first]);
    ctl.innerHTML = '';
    await path(o0);
    for (;;) {
      const rest = c.options.map((o, i) => i).filter((i) => !seen.has(i));
      ctl.innerHTML = `${rest.map((i) => `<button type="button" class="p7-alt" data-i="${i}">↺ ${c.options[i].label}</button>`).join('')}<button type="button" class="p7-tap">Next <span>▸</span></button>`;
      const n = await new Promise((res) => { ctl.querySelectorAll('.p7-alt').forEach((b) => b.addEventListener('click', () => res(+b.dataset.i))); ctl.querySelector('.p7-tap').addEventListener('click', () => res(-1)); });
      ctl.innerHTML = '';
      if (n < 0) break;
      seen.add(n);
      await path(c.options[n]);
    }
  }
  async function run() {
    const beats = slide.beats || [];
    for (let i = 0; i < beats.length; i++) {
      const b = beats[i];
      if (b.chart) { if (chartBox) mindOff(chartBox); setCap(b.caption || ''); await showChart(b.chart); }
      else if (b.say) { setCap([].concat(b.say).join(' '), true); }
      else if (b.thoughts) { if (chartBox) { mindOn(chartBox, b.thoughts, { gap: 0.7 }); await wait(700 * b.thoughts.length + 300); } }
      else if (b.choice) { await choice(b.choice); continue; }
      else if (b.who) {
        setCap('');
        panel(`<div class="p7-who-t">${b.who.title || 'WHO’S TRADING NOW?'}</div><div class="p7-stg-who"><div class="is-ok"><small>${b.who.beforeLabel || 'BEFORE'}</small><b>${b.who.before.h}</b></div><div class="is-mind"><small>${b.who.afterLabel || 'AFTER'}</small><b>${b.who.after.h}</b></div></div>`);
      } else if (b.principle) { setCap(''); panel(`<div class="p7-stg-pr">${b.principle}</div>`); }
      else if (b.tally) { setCap(''); panel(`${b.stamp ? `<div class="p7-stamp">${b.stamp}</div>` : ''}<div class="p7-tally">${b.tally.map(([k, v, tone]) => `<div class="p7-tr is-${tone || 'ink'}" style="--d:0s"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`); }
      if (i < beats.length - 1) await tap();
    }
    ctl.innerHTML = '';
    continueBtn(card, satisfy, slide.cta || 'Continue →');
  }
  run();
}

export const SCENE_RENDERERS = { p7_scene: (el, s, sat, h) => (s.stage ? renderStage : renderScene)(el, s, sat, h) };
