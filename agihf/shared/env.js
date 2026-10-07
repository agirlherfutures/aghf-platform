/**
 * env.js — A Girl & Her Futures™
 *
 * Phase 7 · Section 3 · Reading the Environment. DID ICC FORM IN AN ENVIRONMENT
 * I ACTUALLY WANT TO TRADE? Descriptive context, never a score or a signal.
 *
 *   p7_chart_sort     rapid chart classification (trend / range / unclear, clean / choppy,
 *                     lower / higher volatility). UNCLEAR is always allowed.
 *   p7_pil_click      MARK THE PIL: clean chart vs messy consolidation (every level argued
 *                     important → none of them clear enough yet)
 *   p7_explain        “Explain what matters in 3 observations.” If it takes eight caveats:
 *                     YOUR EXPLANATION IS GETTING COMPLICATED. (not auto-marked wrong)
 *   p7_timeline       time passing: a news clock, the session timeline, conditions changing
 *   p7_snapshot       the Environment Snapshot (descriptive states + one sentence)
 *   p7_participation  the AGHF Participation Check: TRADER → RULEBOOK → ENVIRONMENT → SETUP →
 *                     DECISION (TAKE / WAIT / PASS / SESSION OVER) + a short WHY
 */

import { askQuestion } from './price-lab.js';
import { mountChart } from './structure-charts.js';
import { continueBtn, head, principle, factsHtml, chartBlock, runAsks } from './mind.js';
import { reduced } from './mind-ui.js';
import * as E from './env-core.js';
import { loadRulebook, newsRuleText } from './rules-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── p7_chart_sort ─────────────────────────────────────────────────────── */
/** { buckets: [[key, label]], items: [{ chart, answer, why, tf }], ecat, then: ask } */
export function renderChartSort(el, slide, satisfy, helpers = {}) {
  const items = slide.items;
  let i = 0;
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Read the environment')}<div class="p7-cs-n"></div><div class="p7-cs-chart"></div><div class="p7-cs-btns"></div><div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const host = card.querySelector('.p7-cs-chart'), btns = card.querySelector('.p7-cs-btns'), fb = card.querySelector('.tx-fb'), num = card.querySelector('.p7-cs-n');
  const show = () => {
    if (i >= items.length) {
      host.innerHTML = ''; btns.innerHTML = ''; num.textContent = '';
      runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
      return;
    }
    const it = items[i];
    num.textContent = `${i + 1} / ${items.length}${it.tf ? ` · ${it.tf}` : ''}`;
    host.innerHTML = '';
    if (it.pair) {
      host.classList.add('is-pair');
      it.pair.forEach((c, j) => { const d = document.createElement('div'); d.className = 'p7-cs-p'; d.innerHTML = `<small>${c.label || (j ? 'B' : 'A')}</small>`; host.appendChild(d); chartBlock(d, c.chart); });
    } else { host.classList.remove('is-pair'); chartBlock(host, it.chart); }
    const bs = it.buckets || slide.buckets;
    btns.innerHTML = bs.map(([k, l]) => `<button type="button" class="tx-act" data-k="${k}">${l}</button>`).join('');
    let wrongs = 0;
    btns.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.k === it.answer || (it.accept || []).includes(b.dataset.k);
      helpers.onPick?.({ prompt: `${slide.title || 'sort'}:${i}`, concept: slide.concept }, { label: b.textContent }, ok, wrongs);
      helpers.handleStreak?.(ok);
      if (wrongs === 0 && (it.ecat || slide.ecat)) E.trackEnv(it.ecat || slide.ecat, ok);
      if (!ok) { wrongs += 1; if (it.einc?.[b.dataset.k]) E.trackEnv(it.einc[b.dataset.k]); b.disabled = true; fb.innerHTML = (it.wrong || {})[b.dataset.k] || it.feedback || 'Look again at what the swings are actually doing.'; fb.className = 'tx-fb bad'; return; }
      fb.innerHTML = it.why ? `<b>✦</b> ${it.why}` : ''; fb.className = `tx-fb ${it.why ? 'good' : ''}`;
      btns.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      i += 1;
      setTimeout(show, reduced() ? 0 : (it.why ? 1600 : 600));
    }));
  };
  show();
}

/* ── p7_pil_click: MARK THE PIL ────────────────────────────────────────── */
/** { clean: { chart, levels: [{ y, label }] }, messy: { chart, levels: [...] }, asks } */
export function renderPilClick(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Mark the PIL')}<div class="p7-pc"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const box = card.querySelector('.p7-pc');
  const round = (spec, label, need, then) => {
    const r = document.createElement('div');
    r.className = 'p7-pc-r';
    r.innerHTML = `<div class="p7-mx-h">${label}</div><div class="p7-pc-chart"></div><div class="p7-pc-msg">Tap the level that matters.</div>`;
    box.appendChild(r);
    const c = r.querySelector('.p7-pc-chart');
    mountChart(c, { ...spec.chart, hlines: [] }, { height: 220 });
    const wrap = c.querySelector('.sc-wrap') || c;
    wrap.style.position = 'relative';
    let n = 0;
    spec.levels.forEach((lv) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'p7-lvl'; b.style.top = `${(lv.y / 320) * 100}%`;
      b.innerHTML = `<i></i><span>${lv.label || 'swing'}</span>`;
      b.addEventListener('click', () => {
        if (b.classList.contains('on')) return;
        b.classList.add('on'); n += 1;
        r.querySelector('.p7-pc-msg').innerHTML = n >= need ? (spec.after || 'Okay. Next.') : (spec.more || 'And another one that could be argued as important?');
        if (n === need) setTimeout(then, reduced() ? 0 : 900);
      });
      wrap.appendChild(b);
    });
  };
  round(slide.clean, slide.clean.label || 'CLEAN STRUCTURE', 1, () => round(slide.messy, slide.messy.label || 'MESSY CONSOLIDATION', slide.messy.need || 3, () => {
    E.trackEnv('manyPilsSeen');
    runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
  }));
}

/* ── p7_explain: EXPLAIN THE CHART ─────────────────────────────────────── */
const CAVEATS = /\b(but|unless|maybe|or|could|might|although|though|if|possibly|kind of|sort of|depends)\b/gi;
export function renderExplain(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Explain the chart')}<div class="p7-ask-stage"></div>
    <div class="p7-exp"><div class="p7-mx-h">${slide.prompt || 'Explain what matters in 3 observations.'}</div><div class="p7-exp-list"></div>
      <button type="button" class="tx-mini p7-exp-add">+ add another observation</button></div>
    <button type="button" class="lw-continue-btn p7-exp-done" disabled>That’s my read →</button><div class="p7-exp-out"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  if (slide.chart) chartBlock(card.querySelector('.p7-ask-stage'), slide.chart);
  const list = card.querySelector('.p7-exp-list');
  const add = () => { const t = document.createElement('textarea'); t.className = 'sw-textarea'; t.rows = 1; t.placeholder = `Observation ${list.children.length + 1}`; list.appendChild(t); t.addEventListener('input', upd); return t; };
  const done = card.querySelector('.p7-exp-done');
  const upd = () => { done.disabled = [...list.querySelectorAll('textarea')].filter((t) => t.value.trim().length >= 6).length < 1; };
  for (let k = 0; k < 3; k++) add();
  card.querySelector('.p7-exp-add').addEventListener('click', () => { if (list.children.length < 8) add(); });
  done.addEventListener('click', () => {
    done.remove();
    const obs = [...list.querySelectorAll('textarea')].map((t) => t.value.trim()).filter(Boolean);
    list.querySelectorAll('textarea').forEach((t) => { t.disabled = true; });
    card.querySelector('.p7-exp-add').remove();
    const caveats = obs.join(' ').match(CAVEATS) || [];
    const pils = (obs.join(' ').match(/\bPIL\b/gi) || []).length;
    const complicated = obs.length > 3 || caveats.length >= 4 || pils >= 3;
    card.querySelector('.p7-exp-out').innerHTML = complicated
      ? `<div class="p7-seen-h">YOUR EXPLANATION IS GETTING COMPLICATED.</div><p>${obs.length} observations, ${caveats.length} caveat word${caveats.length === 1 ? '' : 's'}${pils >= 2 ? `, ${pils} PIL mentions` : ''}. Is the chart unclear… or are you trying to force clarity?</p>`
      : '<div class="p7-note">Short and specific. Can you stand behind it without forcing it?</div>';
    askQuestion(card.querySelector('.pl-asks'), { prompt: 'SO, THIS CHART IS…', stack: true, options: [
      { label: 'CLEAR ENOUGH', correct: slide.clear !== false, why: slide.clearWhy || 'Understandable, not flawless. That’s what clean means.', feedback: slide.clearNo || 'If you needed that many caveats, is it really clear enough yet?' },
      { label: 'NEEDS MORE TIME', correct: slide.clear === false || slide.acceptAll, why: 'Letting it develop is a decision too.' },
      { label: 'PASS', correct: slide.clear === false || slide.acceptAll, why: 'If you can’t explain what matters without forcing it, passing protects the day.' },
    ] }, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
  });
}

/* ── p7_timeline: time passing ─────────────────────────────────────────── */
/** { rows: [{ t, text, state, tone }], rule: 'news'|'session'|text, asks } */
export function renderTimeline(el, slide, satisfy, helpers = {}) {
  let ruleLine = '';
  if (slide.rule === 'news' || slide.rule === 'session') {
    const rb = loadRulebook();
    const mine = slide.rule === 'news' ? rb?.newsRule && newsRuleText(rb.newsRule) : rb?.sessionRule && `My trading window: ${rb.sessionRule.start}–${rb.sessionRule.end}`;
    ruleLine = `<div class="p7-rule ${mine && slide.useMine ? 'p7-rule-sharp' : ''}"><small>${mine && slide.useMine ? 'MY RULE' : 'EXAMPLE RULE'}</small><b>${mine && slide.useMine ? mine : slide.example}</b></div>`;
  } else if (slide.rule) ruleLine = `<div class="p7-rule p7-rule-sharp"><small>${slide.ruleLabel || 'MY RULE'}</small><b>${slide.rule}</b></div>`;
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Watch the clock')}<div class="p7-tl">${slide.rows.map((r, i) => `<div class="p7-tl-r is-${r.tone || 'ink'}" style="--d:${reduced() ? 0 : 0.3 + i * 0.85}s"><b>${r.t}</b><span>${r.text}</span>${r.state ? `<em>${r.state}</em>` : ''}</div>`).join('')}</div>${ruleLine}<div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  setTimeout(() => runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); }), reduced() ? 0 : 500 + slide.rows.length * 850);
}

/* ── p7_snapshot: the Environment Snapshot ─────────────────────────────── */
/** { charts: [{ label, chart }], facts, expect: { htfClarity: 'CLEAR', … }, fields: [keys], sentence: true } */
export function renderSnapshot(el, slide, satisfy, helpers = {}) {
  const fields = E.SNAPSHOT_FIELDS.filter((f) => (slide.fields || Object.keys(slide.expect)).includes(f.key));
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Environment Snapshot')}<div class="p7-snap-charts"></div>${factsHtml(slide.facts)}
    <div class="p7-snap">${fields.map((f) => `<div class="p7-sf" data-k="${f.key}"><small>${f.label}</small><div class="p7-chips">${(slide.options?.[f.key] || f.options).map((o) => `<button type="button" class="tx-chip">${o}</button>`).join('')}</div><div class="p7-sf-fb"></div></div>`).join('')}</div>
    <div class="p7-snap-sent" hidden><div class="p7-mx-h">EXPLAIN IN ONE SENTENCE</div><textarea class="sw-textarea" rows="2" placeholder="e.g. Clear 4H, ranging 1H, news in 4 minutes: context is mixed, my news rule blocks entries."></textarea><button type="button" class="lw-continue-btn" disabled>Save snapshot →</button></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  (slide.charts || []).forEach((c) => { const d = document.createElement('div'); d.className = 'p7-cs-p'; d.innerHTML = `<small>${c.label}</small>`; card.querySelector('.p7-snap-charts').appendChild(d); chartBlock(d, c.chart); });
  const got = {};
  const sent = card.querySelector('.p7-snap-sent');
  fields.forEach((f) => {
    const row = card.querySelector(`.p7-sf[data-k="${f.key}"]`);
    let tries = 0;
    row.querySelectorAll('.tx-chip').forEach((b) => b.addEventListener('click', () => {
      if (got[f.key]) return;
      const want = [].concat(slide.expect[f.key]);
      const ok = want.includes(b.textContent);
      helpers.onPick?.({ prompt: `snap:${f.key}` }, { label: b.textContent }, ok, tries);
      helpers.handleStreak?.(ok);
      if (tries === 0 && slide.ecat?.[f.key]) E.trackEnv(slide.ecat[f.key], ok);
      if (tries === 0 && slide.skill) helpers.report?.(slide.skill, ok);
      if (!ok) { tries += 1; b.disabled = true; row.querySelector('.p7-sf-fb').textContent = (slide.why || {})[f.key] || 'Read that layer again.'; return; }
      b.classList.add('on'); got[f.key] = b.textContent; row.querySelector('.p7-sf-fb').textContent = '';
      row.querySelectorAll('.tx-chip').forEach((x) => { x.disabled = true; });
      if (fields.every((x) => got[x.key])) sent.hidden = false;
    }));
  });
  const ta = sent.querySelector('textarea'), btn = sent.querySelector('button');
  ta.addEventListener('input', () => { btn.disabled = ta.value.trim().length < 15; });
  btn.addEventListener('click', () => {
    btn.disabled = true; ta.disabled = true;
    E.saveSnapshot({ ...got, studentSummary: ta.value.trim() });
    runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card.querySelector('.pl-asks'), slide.punch); continueBtn(card, satisfy, slide.cta); });
  });
}

/* ── p7_participation: the AGHF Participation Check ────────────────────── */
/**
 * { chart, charts, facts, thought, steps: [{ key: 'trader'|'rulebook'|'environment'|'setup'|'see'|'feel', label, ask }],
 *   decision: { correct: 'PASS', options: ['TAKE','WAIT','PASS','SESSION OVER'], why, feedback: {…}, ecat },
 *   whys: ['ICC valid, HTF clear, within rules, room available', …] (one is the right reason), setupState, passReason }
 */
const LAYER_LABEL = { trader: 'TRADER', rulebook: 'RULEBOOK', environment: 'ENVIRONMENT', setup: 'SETUP', see: 'WHAT DO I SEE?', feel: 'WHAT AM I FEELING?' };
export function renderParticipation(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-part">${head(slide, 'Participation Check')}<div class="p7-snap-charts"></div>${factsHtml(slide.facts)}<div class="p7-ask-stage"></div>
    <div class="p7-layers">${slide.steps.map((s) => `<div class="p7-ly" data-k="${s.key}"><small>${s.label || LAYER_LABEL[s.key] || s.key}</small><b>·</b></div>`).join('')}<div class="p7-ly p7-ly-d"><small>DECISION</small><b>?</b></div></div>
    <div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-part');
  (slide.charts || []).forEach((c) => { const d = document.createElement('div'); d.className = 'p7-cs-p'; d.innerHTML = `<small>${c.label}</small>`; card.querySelector('.p7-snap-charts').appendChild(d); chartBlock(d, c.chart); });
  const stage = card.querySelector('.p7-ask-stage');
  if (slide.chart) chartBlock(stage, slide.chart);
  if (slide.thought) stage.insertAdjacentHTML('beforeend', `<div class="p7-mono-thoughts">${[].concat(slide.thought).map((t, i) => `<div class="p7-bubble" style="--d:${i * 0.7}s"><span>${t}</span></div>`).join('')}</div>`);
  const asks = card.querySelector('.pl-asks');
  const qs = slide.steps.map((s) => ({ ...s.ask, _key: s.key, prompt: s.ask.prompt || `${s.label || LAYER_LABEL[s.key]}?` }));
  const fillLayer = (key, label) => { const ly = card.querySelector(`.p7-ly[data-k="${key}"]`); if (ly) { ly.classList.remove('is-cur'); ly.querySelector('b').textContent = label; ly.classList.add('is-set'); } };
  runAsks(asks, qs, helpers, () => decide(), {
    onAsk: (q) => card.querySelectorAll('.p7-ly').forEach((x) => x.classList.toggle('is-cur', x.dataset.k === q._key)),
    onSolved: (q, o) => fillLayer(q._key, (q.short || {})[o.label] || o.short || o.label.replace(/\s*[:·].*$/, '')),
  });
  function decide() {
    card.querySelectorAll('.p7-ly').forEach((x) => x.classList.remove('is-cur'));
    card.querySelector('.p7-ly-d').classList.add('is-cur');
    const d = slide.decision;
    const opts = d.options || ['TAKE', 'WAIT', 'PASS', 'SESSION OVER'];
    askQuestion(asks, { prompt: d.prompt || 'WHAT DO I DO?', options: opts.map((o) => ({ label: o, correct: o === d.correct, why: d.why, feedback: (d.feedback || {})[o] || 'Go back through the layers. Which one decides it?' })) },
      { ...helpers, onPick(q, o, c, w) { helpers.onPick?.(q, o, c, w); if (w === 0 && d.ecat) E.trackEnv(d.ecat, c); if (w === 0 && d.skill) helpers.report?.(d.skill, c); if (w === 0 && !c && o.label === 'TAKE') E.trackEnv('forcedTrades'); } }, () => {
        const dl = card.querySelector('.p7-ly-d'); dl.classList.remove('is-cur'); dl.classList.add('is-set', `is-${d.correct.toLowerCase().replace(/\s+/g, '-')}`); dl.querySelector('b').textContent = d.correct;
        why();
      });
  }
  function why() {
    const box = document.createElement('div');
    box.className = 'p7-why';
    box.innerHTML = `<div class="p7-mx-h">WHY? (one short line)</div>${slide.whys ? `<div class="p7-chips">${slide.whys.map((w) => `<button type="button" class="tx-chip">${w}</button>`).join('')}</div><div class="tx-fb"></div>` : ''}<input class="p7-in p7-in-wide" type="text" placeholder="…or in your own words"><button type="button" class="tx-mini" disabled>That’s my why →</button>`;
    asks.appendChild(box);
    const inp = box.querySelector('input'), btn = box.querySelector('button.tx-mini');
    let chosen = '';
    box.querySelectorAll('.tx-chip').forEach((c, i) => c.addEventListener('click', () => {
      const ok = !slide.whyCorrect && slide.whyCorrect !== 0 ? true : i === slide.whyCorrect;
      if (!ok) { c.disabled = true; box.querySelector('.tx-fb').textContent = 'That reason doesn’t match this decision. Which layer actually decided it?'; box.querySelector('.tx-fb').className = 'tx-fb bad'; return; }
      box.querySelectorAll('.tx-chip').forEach((x) => x.classList.remove('on')); c.classList.add('on'); chosen = c.textContent; btn.disabled = false;
      box.querySelector('.tx-fb').textContent = ''; box.querySelector('.tx-fb').className = 'tx-fb';
    }));
    inp.addEventListener('input', () => { btn.disabled = !(chosen || inp.value.trim().length >= 8); });
    btn.addEventListener('click', () => {
      btn.disabled = true; inp.disabled = true;
      const w = inp.value.trim() || chosen;
      if (/PASS|SESSION OVER/.test(slide.decision.correct)) E.recordValidPass({ reason: slide.passReason || w, setupState: slide.setupState || null, studentExplanation: w, rulebookContext: slide.rulebookContext || null });
      box.insertAdjacentHTML('beforeend', `<div class="p7-rule p7-rule-sharp"><small>${slide.decision.correct}</small><b>${esc(w)}</b></div>`);
      principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
    });
  }
}

export const ENV_RENDERERS = {
  p7_chart_sort: renderChartSort,
  p7_pil_click: renderPilClick,
  p7_explain: renderExplain,
  p7_timeline: renderTimeline,
  p7_snapshot: renderSnapshot,
  p7_participation: renderParticipation,
};
Object.keys(ENV_RENDERERS).forEach((k) => {
  const r = ENV_RENDERERS[k];
  ENV_RENDERERS[k] = (el, slide, satisfy, helpers) => { if (slide.sessionStart) E.startEnvSession(slide.sessionStart); return r(el, slide, satisfy, helpers); };
});
