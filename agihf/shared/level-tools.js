/**
 * level-tools.js — A Girl & Her Futures™
 *
 * The Level Toolkit for Phase 2 Section 3 (Reading Key Levels): simple
 * educational chart tools, not a TradingView clone.
 *
 * mountLevels(chart, levels) draws interactive horizontal levels on top of a
 * structure-charts chart and returns tools a price_lab step can run:
 *
 *   level = { id, y, y2?, x1?, x2?, slope?, label, labelX?, name, tone, keep, reason, hidden }
 *           y2 makes it a zone (y..y2); keep marks it as meaningful for the
 *           current structural question; reason says why (or why it's junk).
 *
 *   step.pick  = { prompt, answer, only, hint, notes, why, concept, mistakes, reveal }
 *                tap the level that answers the question (WHY DOES THIS MATTER? follows as an ask)
 *   step.keep  = { prompt, count, answer: [ids], concept, explain: { id: text } }
 *                choose N, LOCK IN MY LEVELS →, then Your chart vs Clean structural view
 *   step.clean = { prompt, concept, done }
 *                tap junk to delete it; keepers push back with their reason
 *   step.zone  = { prompt, target: [y1, y2], maxH, concept, x1, x2 }
 *                drag to mark a reaction area; judged with tolerance, not pixels
 *
 * Every decision is reported to helpers.onPick (games score with it) and
 * counted in aghf_learning (concept accuracy + mistake types).
 *
 * Also exports two slide types:
 *   level_inspect    compare candidate levels factor by factor, then judge
 *   academy_concept  the reusable ACADEMY CONCEPT / DAYLI ICC APPLICATION card
 */

import { mountChart } from './structure-charts.js';
import { askQuestion, recordLearning } from './price-lab.js';

const NS = 'http://www.w3.org/2000/svg';
const TONES = { up: '#2F8A7F', down: '#C2475F', gold: '#B86E12', purple: '#5E56B8', muted: '#8F7A6E', junk: '#A8978C' };
const FILLS = { up: '#7ECEC4', down: '#F4829A', gold: '#F5A857', purple: '#7F77DD', muted: '#C9B9AE', junk: '#C9B9AE' };
const el = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
  if (parent) parent.appendChild(n);
  return n;
};

/* ── Interactive levels on a chart ──────────────────────────────────── */

export function mountLevels(chart, levels, opts = {}) {
  const svg = chart.svg;
  const layer = el('g', { class: 'lv-layer' }, svg);
  const nodes = {};
  const viewRight = () => { const vb = svg.viewBox.baseVal; return vb && vb.width ? vb.x + vb.width : 700; };

  function draw(lv) {
    const g = el('g', { class: `lv-level lv-${lv.y2 != null ? 'zone' : 'line'}${lv.hidden ? ' lv-hide' : ''}`, 'data-id': lv.id }, layer);
    const x1 = lv.x1 ?? 20, x2 = lv.x2 ?? 690, tone = lv.tone || 'purple';
    if (lv.slope) {
      // A sloped line (e.g. a trendline): slope = [xa, ya, xb, yb].
      const [xa, ya, xb, yb] = lv.slope;
      el('line', { x1: xa, y1: ya, x2: xb, y2: yb, stroke: FILLS[tone], 'stroke-width': 2.5, 'stroke-dasharray': '9 6', class: 'lv-shape' }, g);
      el('line', { x1: xa, y1: ya, x2: xb, y2: yb, stroke: 'transparent', 'stroke-width': 22, class: 'lv-hit' }, g);
      if (lv.label) { const t = el('text', { x: xb - 4, y: yb - 8, 'text-anchor': 'end', 'font-size': lv.size || 12, 'font-weight': 800, fill: TONES[tone], 'font-family': 'DM Sans, sans-serif', class: 'sc-halo lv-label' }, g); t.textContent = lv.label; }
      nodes[lv.id] = g;
      return g;
    }
    if (lv.y2 != null) {
      el('rect', { x: x1, y: Math.min(lv.y, lv.y2), width: x2 - x1, height: Math.abs(lv.y2 - lv.y), rx: 6, fill: FILLS[tone], 'fill-opacity': 0.22, stroke: FILLS[tone], 'stroke-width': 1.5, 'stroke-dasharray': '6 5', class: 'lv-shape' }, g);
      el('rect', { x: x1, y: Math.min(lv.y, lv.y2) - 6, width: x2 - x1, height: Math.abs(lv.y2 - lv.y) + 12, fill: 'transparent', class: 'lv-hit' }, g);
    } else {
      el('line', { x1, x2, y1: lv.y, y2: lv.y, stroke: FILLS[tone], 'stroke-width': 2.5, 'stroke-dasharray': '9 6', class: 'lv-shape' }, g);
      el('rect', { x: x1, y: lv.y - 11, width: x2 - x1, height: 22, fill: 'transparent', class: 'lv-hit' }, g);
    }
    if (lv.label) {
      const ty = lv.y2 != null ? Math.min(lv.y, lv.y2) - 6 : lv.y + (lv.below ? 17 : -7);
      const t = el('text', { x: lv.labelX ?? Math.min(x2, viewRight()) - 6, y: ty, 'text-anchor': 'end', 'font-size': lv.size || 12, 'font-weight': 800, fill: TONES[tone], 'font-family': 'DM Sans, sans-serif', class: 'sc-halo lv-label' }, g);
      t.textContent = lv.label;
    }
    nodes[lv.id] = g;
    return g;
  }
  levels.forEach(draw);

  const byId = (id) => levels.find((l) => l.id === id);
  const api = {
    nodes,
    show(ids) { [].concat(ids || []).forEach((id) => nodes[id]?.classList.remove('lv-hide', 'lv-gone')); },
    hide(ids) { [].concat(ids || []).forEach((id) => nodes[id]?.classList.add('lv-hide')); },
    setState(id, state) { const n = nodes[id]; if (!n) return; n.classList.remove('is-picked', 'is-good', 'is-bad', 'is-dim'); if (state) n.classList.add(`is-${state}`); },
    visible: () => levels.filter((l) => nodes[l.id] && !nodes[l.id].classList.contains('lv-hide') && !nodes[l.id].classList.contains('lv-gone')),
    relabel(id, text, tone) {
      const lv = byId(id); if (!lv) return;
      Object.assign(lv, { label: text, tone: tone || lv.tone });
      const old = nodes[id]; const hidden = old.classList.contains('lv-hide');
      old.remove(); const g = draw(lv); if (hidden) g.classList.add('lv-hide');
      g.classList.add('lv-pop');
    },
    /** Make visible levels tappable; cb(id). Returns an off() function. */
    tappable(cb, only) {
      chart.wrap.classList.add('lv-tapping');
      const off = [];
      Object.entries(nodes).forEach(([id, g]) => {
        if (only && !only.includes(id)) return;
        g.classList.add('lv-tap');
        const h = (e) => { e.stopPropagation(); cb(id); };
        g.addEventListener('click', h);
        off.push(() => { g.removeEventListener('click', h); g.classList.remove('lv-tap'); });
      });
      return () => { off.forEach((f) => f()); chart.wrap.classList.remove('lv-tapping'); };
    },
  };

  /* ── Tools a step can run ──────────────────────────────────────────── */

  function askBox(container, prompt) {
    const box = document.createElement('div');
    box.className = 'pl-ask lv-ask';
    box.innerHTML = `<div class="pl-q">${prompt}</div><div class="lv-tool"></div><div class="pl-fb" aria-live="polite"></div>`;
    container.appendChild(box);
    return { box, tool: box.querySelector('.lv-tool'), fb: box.querySelector('.pl-fb') };
  }
  const say = (fb, html, good) => { fb.innerHTML = html; fb.className = `pl-fb show ${good ? 'good' : 'bad'}`; };

  api.pick = (t, container, helpers, done) => {
    const { fb } = askBox(container, `👆 ${t.prompt}`);
    const answers = [].concat(t.answer);
    let wrongs = 0;
    const off = api.tappable((id) => {
      const ok = answers.includes(id);
      helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: (byId(id)?.name) || byId(id)?.label || id }, ok, wrongs);
      recordLearning({ concept: t.concept, mistake: (t.mistakes || {})[id] || (byId(id)?.keep === false ? 'unclear-level' : null), correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) {
        wrongs += 1;
        api.setState(id, 'bad'); chart.flash();
        setTimeout(() => api.setState(id, null), 700);
        const note = (t.notes || {})[id] || byId(id)?.reason;
        say(fb, wrongs === 1 && t.hint ? `<strong>Try again.</strong> ${t.hint}` : (note || t.hint || 'Not that one.'), false);
        return;
      }
      off();
      api.setState(id, 'good');
      if (t.reveal) api.relabel(id, t.reveal.label, t.reveal.tone);
      say(fb, `<strong>✦</strong> ${t.why || byId(id)?.reason || 'Yes.'}`, true);
      if (t.show) api.show(t.show);
      done(id);
    }, t.only);
  };

  api.keep = (t, container, helpers, done) => {
    const count = t.count || 3;
    const { tool, fb } = askBox(container, `👆 ${t.prompt}`);
    tool.innerHTML = `<div class="lv-keep-bar"><span class="lv-keep-n">0 / ${count} kept</span><button type="button" class="lv-lock" disabled>${t.lockLabel || 'Lock in my levels →'}</button></div>`;
    const nEl = tool.querySelector('.lv-keep-n'), lock = tool.querySelector('.lv-lock');
    const picked = new Set();
    const off = api.tappable((id) => {
      if (picked.has(id)) { picked.delete(id); api.setState(id, null); }
      else if (picked.size < count) { picked.add(id); api.setState(id, 'picked'); }
      else { say(fb, `You can only keep ${count}. Tap one of your picks to swap it out.`, false); return; }
      fb.className = 'pl-fb';
      nEl.textContent = `${picked.size} / ${count} kept`;
      lock.disabled = picked.size !== count;
    }, t.only);
    lock.addEventListener('click', () => {
      off();
      lock.remove();
      const answer = new Set(t.answer);
      const hits = [...picked].filter((id) => answer.has(id));
      const perfect = hits.length === answer.size && picked.size === answer.size;
      helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: [...picked].map((id) => byId(id)?.name || byId(id)?.label || id).join(', ') }, perfect, 0);
      recordLearning({ concept: t.concept, mistake: perfect ? null : 'kept-junk', correct: perfect });
      helpers.handleStreak?.(perfect);
      const all = levels.map((l) => l.id);
      const views = [
        { key: 'mine', label: 'Your chart', ids: [...picked] },
        { key: 'clean', label: 'Clean structural view', ids: t.answer },
      ];
      tool.innerHTML = `<div class="ss-views-row lv-compare">${views.map((v) => `<button type="button" class="ss-view" data-k="${v.key}">${v.label}</button>`).join('')}</div>
        <ul class="lv-explain">${t.answer.map((id) => `<li><b>${byId(id)?.name || byId(id)?.label || id}</b>${(t.explain || {})[id] || byId(id)?.reason || ''}</li>`).join('')}</ul>`;
      const setView = (k) => {
        const v = views.find((x) => x.key === k);
        all.forEach((id) => { api.setState(id, null); nodes[id].classList.toggle('lv-gone', !v.ids.includes(id)); });
        v.ids.forEach((id) => api.setState(id, k === 'clean' || answer.has(id) ? 'good' : 'bad'));
        tool.querySelectorAll('.ss-view').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      };
      tool.querySelectorAll('.ss-view').forEach((b) => b.addEventListener('click', () => setView(b.dataset.k)));
      setView('mine');
      setTimeout(() => setView('clean'), 1600);
      say(fb, perfect
        ? `<strong>✦ Clean read.</strong> ${t.why || 'Every level you kept answers the structural question.'}`
        : `You kept <strong>${hits.length} of ${answer.size}</strong> structural levels. Compare your chart with the clean view below, and read why each one stays.`, perfect);
      done(perfect);
    });
  };

  api.clean = (t, container, helpers, done) => {
    const { tool, fb } = askBox(container, `🧹 ${t.prompt}`);
    const junk = new Set(levels.filter((l) => l.keep === false && !nodes[l.id].classList.contains('lv-hide')).map((l) => l.id));
    let left = api.visible().length;
    const trail = [left];
    tool.innerHTML = '<div class="lv-counter"></div>';
    const counter = tool.querySelector('.lv-counter');
    const paint = () => { const now = trail[trail.length - 1] === left ? trail : [...trail, left]; counter.innerHTML = now.map((n, i) => `<span class="${i === now.length - 1 ? 'on' : ''}">${n} marking${n === 1 ? '' : 's'}</span>`).join('<i>→</i>'); };
    paint();
    let wrongs = 0;
    const off = api.tappable((id) => {
      const lv = byId(id);
      if (!junk.has(id)) {
        wrongs += 1;
        helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: lv.name || lv.label || id }, false, wrongs);
        recordLearning({ concept: t.concept, mistake: 'deleted-structural-level', correct: false });
        helpers.handleStreak?.(false);
        api.setState(id, 'bad'); chart.flash();
        setTimeout(() => api.setState(id, null), 700);
        say(fb, `<strong>Keep this one.</strong> ${lv.reason || 'It has a structural job.'}`, false);
        return;
      }
      junk.delete(id);
      nodes[id].classList.add('lv-gone');
      left -= 1;
      // Milestones (e.g. 12 → 9 → 6 → 3) so the chart visibly gets cleaner.
      const removed = trail[0] - left;
      if (junk.size === 0 || removed % 3 === 0) trail.push(left);
      else if (trail.length > 1 && trail.cur) trail[trail.length - 1] = left;
      paint();
      say(fb, lv.reason ? `Deleted. ${lv.reason}` : 'Deleted.', true);
      if (junk.size) return;
      off();
      helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: 'Cleaned the chart' }, wrongs === 0, wrongs);
      recordLearning({ concept: t.concept, correct: wrongs === 0 });
      api.visible().forEach((l) => api.setState(l.id, 'good'));
      counter.innerHTML += `<span class="lv-meaningful">${left} meaningful level${left === 1 ? '' : 's'}</span>`;
      say(fb, `<strong>✨ Much better.</strong> ${t.done || 'Every line left on the chart has a reason.'}`, true);
      helpers.burst?.();
      done();
    });
    void off;
  };

  api.zone = (t, container, helpers, done) => {
    const { fb } = askBox(container, `✍️ ${t.prompt}`);
    const [ty1, ty2] = [Math.min(...t.target), Math.max(...t.target)];
    const th = ty2 - ty1, maxH = t.maxH || th * 2.4;
    const x1 = t.x1 ?? 20, x2 = t.x2 ?? 690;
    const draft = el('rect', { x: x1, width: x2 - x1, rx: 6, class: 'lv-draft', height: 0, y: 0 }, layer);
    const guide = el('rect', { x: x1, y: ty1, width: x2 - x1, height: th, rx: 6, class: 'lv-target' }, layer);
    chart.wrap.classList.add('lv-drawing');
    const toY = (e) => { const m = svg.getScreenCTM(); return new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).y; };
    let start = null, wrongs = 0, solved = false;
    const down = (e) => { if (solved) return; e.preventDefault(); start = toY(e); svg.setPointerCapture?.(e.pointerId); draft.setAttribute('y', start); draft.setAttribute('height', 0); draft.classList.add('on'); };
    const move = (e) => { if (start == null) return; const y = toY(e); draft.setAttribute('y', Math.min(start, y)); draft.setAttribute('height', Math.abs(y - start)); };
    const up = (e) => {
      if (start == null) return;
      const y = toY(e); const a = Math.min(start, y), b = Math.max(start, y); start = null;
      if (b - a < 3) { draft.setAttribute('height', 6); draft.setAttribute('y', a - 3); }
      judge(a, Math.max(b, a + 6));
    };
    function judge(a, b) {
      const h = b - a, cover = Math.max(0, Math.min(b, ty2) - Math.max(a, ty1)) / th;
      let msg = null, mistake = null;
      if (cover < 0.5) { msg = `<strong>Try again.</strong> ${t.missHint || 'Look for where price kept reacting, then drag across that area.'}`; mistake = 'zone-missed'; }
      else if (h > maxH) { msg = '<strong>Try again.</strong> Your zone is covering much more price than the reaction you’re trying to describe.'; mistake = 'zone-too-big'; }
      else if (h < th * 0.3) { msg = '<strong>Close.</strong> That’s nearly a line. Give price a little room to behave.'; mistake = 'zone-too-thin'; }
      const ok = !msg;
      helpers.onPick?.({ prompt: t.prompt, concept: t.concept }, { label: ok ? 'Captured the reaction area' : 'Zone off target' }, ok, wrongs);
      recordLearning({ concept: t.concept, mistake, correct: ok });
      helpers.handleStreak?.(ok);
      if (!ok) { wrongs += 1; draft.classList.add('bad'); setTimeout(() => draft.classList.remove('bad'), 600); say(fb, msg, false); if (wrongs >= 3) guide.classList.add('hint'); return; }
      solved = true;
      draft.classList.add('good');
      guide.classList.add('show');
      chart.wrap.classList.remove('lv-drawing');
      say(fb, `<strong>✓ You captured the reaction area.</strong> ${t.why || ''}`, true);
      done();
    }
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', () => { start = null; });
  };

  return api;
}

/* ── level_inspect: weigh candidate levels factor by factor ─────────── */

function renderLevelInspect(el2, slide, satisfy, helpers) {
  el2.innerHTML = `<div class="lw-card pl-card">
      <div class="lw-eyebrow">${slide.kicker || 'Compare levels'}</div>
      ${slide.title ? `<h2>${slide.title}</h2>` : ''}${slide.body ? `<p>${slide.body}</p>` : ''}
      <div class="pl-chart"></div>
      <div class="li-tabs">${slide.factors.map((f) => `<button type="button" class="li-tab" data-k="${f.key}">${f.label}</button>`).join('')}</div>
      <div class="li-panel"><div class="li-empty">Tap a factor to inspect each level.</div></div>
      <div class="pl-asks"></div>
    </div>`;
  const card = el2.querySelector('.pl-card');
  const chart = mountChart(card.querySelector('.pl-chart'), slide.chart, { label: slide.title });
  const lv = slide.levels ? mountLevels(chart, slide.levels) : null;
  const panel = card.querySelector('.li-panel');
  const asks = card.querySelector('.pl-asks');
  const names = slide.names || Object.keys(slide.factors[0].notes);
  const seen = new Set();
  let asked = false;
  card.querySelectorAll('.li-tab').forEach((b) => b.addEventListener('click', () => {
    const f = slide.factors.find((x) => x.key === b.dataset.k);
    seen.add(f.key);
    card.querySelectorAll('.li-tab').forEach((x) => { x.classList.toggle('on', x === b); if (seen.has(x.dataset.k)) x.classList.add('seen'); });
    panel.innerHTML = `<div class="li-grid">${names.map((n) => `<div class="li-cell"><b>${n}</b><span>${f.notes[n] || ''}</span></div>`).join('')}</div>`;
    if (!asked && seen.size >= (slide.minViews || 3)) {
      asked = true;
      askQuestion(asks, slide.check, helpers, () => {
        if (lv && slide.after) Object.entries(slide.after).forEach(([id, s]) => lv.setState(id, s));
        const b2 = document.createElement('button');
        b2.type = 'button'; b2.className = 'lw-continue-btn'; b2.textContent = slide.cta || 'Continue →';
        b2.addEventListener('click', satisfy);
        el2.appendChild(b2);
      });
    }
  }));
}

/* ── academy_concept: market literacy vs. Dayli ICC application ─────── */

const CONCEPT_COPY = {
  literacy: { tag: 'Academy Concept', icon: '📚', body: 'This concept helps you understand market behavior. You are not being instructed to add it to your entry model.' },
  icc: { tag: 'Dayli ICC Application', icon: '✦', body: 'This is part of the Dayli ICC Method.' },
};

function renderAcademyConcept(el2, slide, satisfy) {
  const c = CONCEPT_COPY[slide.variant || 'literacy'];
  el2.innerHTML = `<div class="lw-card ac-card ac-${slide.variant || 'literacy'}">
      <div class="ac-tag"><span>${c.icon}</span>${slide.tag || c.tag}</div>
      ${slide.title ? `<h2>${slide.title}</h2>` : ''}
      ${slide.versus ? `<div class="ac-versus"><div>${slide.versus[0]}</div><b>≠</b><div>${slide.versus[1]}</div></div>` : ''}
      <p class="ac-body">${slide.body || c.body}</p>
      ${slide.points ? `<div class="ac-chips">${slide.points.map((p) => `<span>${p}</span>`).join('')}</div>` : ''}
      ${slide.footer ? `<p class="ac-foot">${slide.footer}</p>` : ''}
    </div>
    <button type="button" class="lw-continue-btn">${slide.cta || 'Got it →'}</button>`;
  el2.querySelector('.lw-continue-btn').addEventListener('click', satisfy);
}

export const LEVEL_RENDERERS = { level_inspect: renderLevelInspect, academy_concept: renderAcademyConcept };
