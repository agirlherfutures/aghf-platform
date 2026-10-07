/**
 * rules.js — A Girl & Her Futures™
 *
 * Phase 7 · Section 2 · Rules That Protect You. The Academy stops asking
 * “what should a disciplined trader do?” and asks WHAT DOES YOUR RULEBOOK SAY?
 *
 *   p7_gate           the AGHF Decision Hierarchy: STRATEGY → RISK → PERSONAL RULEBOOK → TRADE STATUS
 *                     (VALID SETUP · INVALID PARTICIPATION is a real state)
 *   p7_rule_write     weak rule → strong rule: CLEAR · TRIGGERED · ACTIONABLE · DECIDED IN ADVANCE,
 *                     loopholes flagged (“TOO MUCH = HOW MUCH? 😂”), optionally saved to her rulebook
 *   p7_rule_form      news rule / daily stop / trading window / environment rule builders
 *   p7_rulecheck      a situation checked against HER saved rulebook (never the simulator’s idea of
 *                     discipline). Undefined rules are flagged, never invented.
 *   p7_violation      the AGHF Rule Violation Review → an IF / THEN trigger-response pair
 *   p7_rulebook       the builder: Dayli ICC non-negotiables (prefilled), risk (prefilled from
 *                     Phase 6), session, behavior (ordered by her own patterns), MY FIVE
 *   p7_rulebook_view  MY AGHF RULEBOOK as an artifact: REVIEW MODE (editable) vs SESSION MODE
 *                     (read-only: “REVIEW THIS RULE AFTER THE SESSION?”)
 *   p7_rule_queue     after the session: “YOU FLAGGED THIS RULE FOR REVIEW.”
 */

import { askQuestion } from './price-lab.js';
import { continueBtn, head, principle, factsHtml, chartBlock, runAsks, processResultHtml } from './mind.js';
import { reduced } from './mind-ui.js';
import * as R from './rules-core.js';
import { topPatterns, loadProfile } from './mind-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── p7_gate ───────────────────────────────────────────────────────────── */
/**
 * { layers: [{ key, label, q, state: 'yes'|'no'|'incomplete', note }], status: 'PASS', verdict, interactive, rcat }
 */
const GATE_LABEL = { yes: '✓', no: '✕', incomplete: '…' };
export function renderGate(el, slide, satisfy, helpers = {}) {
  const L = slide.layers;
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'The AGHF Decision Hierarchy')}${factsHtml(slide.facts)}<div class="p7-chart-slot"></div>
    <div class="p7-gate">${L.map((l, i) => `<div class="p7-g" data-i="${i}"><div class="p7-g-n">${i + 1}</div><div class="p7-g-t"><b>${l.label}</b><small>${l.q}</small></div><div class="p7-g-s">${slide.interactive ? '' : `<span class="is-${l.state}">${GATE_LABEL[l.state]}</span>`}</div>${l.note ? `<div class="p7-g-note" ${slide.interactive ? 'hidden' : ''}>${l.note}</div>` : ''}</div>${i < L.length - 1 ? '<div class="p7-g-arrow">↓</div>' : ''}`).join('')}
      <div class="p7-g-arrow">↓</div><div class="p7-g p7-g-final"><div class="p7-g-t"><b>TRADE STATUS</b></div><div class="p7-g-s p7-g-status">${slide.interactive ? '?' : slide.status}</div></div></div>
    ${slide.verdict && !slide.interactive ? `<div class="p7-verdict">${slide.verdict}</div>` : '<div class="p7-verdict" hidden></div>'}<div class="tx-fb"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  if (slide.chart) chartBlock(card.querySelector('.p7-chart-slot'), slide.chart);
  const asks = card.querySelector('.pl-asks');
  const fb = card.querySelector('.tx-fb');
  const finish = () => runAsks(asks, slide.asks, helpers, () => { principle(asks, slide.punch); continueBtn(card, satisfy, slide.cta); });
  if (!slide.interactive) { finish(); return; }
  const step = (i) => {
    if (i >= L.length) {
      askQuestion(asks, { prompt: 'SO: TRADE STATUS?', rcat: slide.rcat, options: ['TAKE', 'WAIT', 'PASS', 'SESSION OVER'].map((s) => ({ label: s, correct: s === slide.status, why: slide.statusWhy, feedback: slide.statusFeedback || 'Walk down the gates again. The first ✕ decides.' })) }, helpers, () => {
        card.querySelector('.p7-g-status').textContent = slide.status;
        const v = card.querySelector('.p7-verdict'); if (slide.verdict) { v.hidden = false; v.innerHTML = slide.verdict; }
        finish();
      });
      return;
    }
    const l = L[i];
    const row = card.querySelector(`.p7-g[data-i="${i}"]`);
    row.classList.add('is-cur');
    const s = row.querySelector('.p7-g-s');
    s.innerHTML = ['yes', 'no', 'incomplete'].filter((k) => k !== 'incomplete' || l.allowIncomplete !== false).map((k) => `<button type="button" class="tx-mini" data-k="${k}">${k === 'yes' ? '✓ YES' : k === 'no' ? '✕ NO' : '… NOT YET'}</button>`).join('');
    s.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.k === l.state;
      helpers.onPick?.({ prompt: `gate:${i}` }, { label: b.textContent }, ok);
      helpers.handleStreak?.(ok);
      if (l.rcat) R.trackRules(l.rcat, ok);
      if (!ok) { b.disabled = true; fb.innerHTML = l.feedback || 'Look at that layer on its own. Each gate answers only its own question.'; fb.className = 'tx-fb bad'; return; }
      fb.innerHTML = ''; fb.className = 'tx-fb';
      s.innerHTML = `<span class="is-${l.state}">${GATE_LABEL[l.state]}</span>`;
      row.classList.remove('is-cur');
      const note = row.querySelector('.p7-g-note'); if (note) note.hidden = false;
      setTimeout(() => step(i + 1), reduced() ? 0 : 350);
    }));
  };
  step(0);
}

/* ── p7_rule_write: make it specific ───────────────────────────────────── */
const QLABELS = [['clear', 'CLEAR', 'What exactly is prohibited / required?'], ['triggered', 'TRIGGERED', 'When does it apply?'], ['actionable', 'ACTIONABLE', 'What do I do instead?'], ['decided', 'DECIDED IN ADVANCE', 'Not invented live.']];
export function qualityHtml(text) {
  const q = R.ruleQuality(text);
  return `<div class="p7-q">${QLABELS.map(([k, l, t]) => `<span class="${q[k] ? 'is-ok' : 'is-no'}" title="${t}">${q[k] ? '✓' : '○'} ${k === 'clear' && !q.clear ? 'NEEDS CLARITY' : l}</span>`).join('')}</div>${q.loopholes.length ? `<div class="p7-loophole">BUILT-IN LOOPHOLE: ${q.loopholes.join(', ')}</div>` : ''}`;
}
/**
 * { weak, critique: [...], options: [{ text, correct, why, feedback }], allowCustom, save: 'noChase' | 'behavior.fomo' | 'afterViolation', strong }
 */
export function renderRuleWrite(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'Make it specific')}
    ${slide.weak ? `<div class="p7-weak"><small>WEAK RULE</small><b>“${slide.weak}”</b>${qualityHtml(slide.weak)}</div>` : ''}
    <div class="p7-crit">${(slide.critique || []).map((c, i) => `<div class="p7-line" style="--d:${reduced() ? 0 : 0.3 + i * 0.9}s">${c}</div>`).join('')}</div>
    <div class="pl-asks"></div><div class="p7-write" hidden></div></div>`;
  const card = el.querySelector('.p7-card');
  const asks = card.querySelector('.pl-asks');
  const done = (text) => {
    if (slide.save && text) {
      const rb = R.draftRulebook();
      if (slide.save.startsWith('behavior.')) rb.behavior = { ...(rb.behavior || {}), [slide.save.split('.')[1]]: text };
      else rb[slide.save] = text;
      R.saveRulebook(rb);
      card.insertAdjacentHTML('beforeend', '<div class="lw-reflect-saved">✓ Saved to MY AGHF RULEBOOK (you can edit it in Review Mode)</div>');
    }
    principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
  };
  const custom = () => {
    const w = card.querySelector('.p7-write');
    w.hidden = false;
    w.innerHTML = `<label class="p7-mx-h">${slide.customLabel || 'Write it your way (or keep the strong version)'}</label><textarea class="sw-textarea" rows="3">${esc(slide.prefill || '')}</textarea><div class="p7-qlive"></div>
      <button type="button" class="lw-continue-btn" disabled>${slide.save ? 'Save this rule →' : 'Use this rule →'}</button>`;
    const ta = w.querySelector('textarea'), live = w.querySelector('.p7-qlive'), btn = w.querySelector('button');
    const upd = () => { const q = R.ruleQuality(ta.value); live.innerHTML = qualityHtml(ta.value); btn.disabled = !(q.clear && q.triggered && q.actionable && q.decided); };
    ta.addEventListener('input', upd); upd();
    btn.addEventListener('click', () => { btn.disabled = true; ta.disabled = true; done(ta.value.trim()); });
    let flagged = false;
    ta.addEventListener('blur', () => { if (!flagged && R.ruleQuality(ta.value).loopholes.length) { flagged = true; R.trackRules('vagueRules'); } });
  };
  const delay = reduced() ? 0 : 400 + (slide.critique || []).length * 900;
  setTimeout(() => {
    const qs = [...(slide.asks || [])];
    if (slide.options) qs.push({ prompt: slide.prompt || 'WHICH VERSION PROTECTS YOU?', rcat: slide.rcat, stack: true, options: slide.options.map((o) => ({ label: o.text, correct: !!o.correct, why: o.why, feedback: o.feedback || 'Could live-trading-you find a loophole in this sentence? 😂', rinc: o.correct ? undefined : 'vagueRules' })) });
    runAsks(asks, qs, helpers, () => {
      const strong = (slide.options || []).find((o) => o.correct)?.text;
      if (slide.strong || strong) asks.insertAdjacentHTML('beforeend', `<div class="p7-rule p7-rule-sharp"><small>STRONG RULE</small><b>${slide.strong || strong}</b>${qualityHtml(slide.strong || strong)}</div>`);
      if (slide.allowCustom) { slide.prefill = slide.prefill || slide.strong || strong; custom(); } else done(slide.save ? (slide.strong || strong) : null);
    });
  }, delay);
}

/* ── p7_rule_form: personal rule builders ──────────────────────────────── */
/** { form: 'news' | 'dailyStop' | 'window' | 'environment', templates, intro } */
const FORM_FIELD = { news: 'newsRule', dailyStop: 'dailyStop', window: 'sessionRule', environment: 'environmentRule' };
export function renderRuleForm(el, slide, satisfy, helpers = {}) {
  const rb = R.draftRulebook();
  // In a lab: only build it if she hasn't already. Never make her define a rule twice.
  if (slide.onlyIfMissing && rb[FORM_FIELD[slide.form]]) {
    const v = rb[FORM_FIELD[slide.form]];
    const text = slide.form === 'news' ? R.newsRuleText(v) : slide.form === 'dailyStop' ? R.dailyStopText(v) : slide.form === 'window' ? `Trading window ${v.start}–${v.end}` : v.text;
    el.innerHTML = `<div class="lw-card p7-card">${head({ ...slide, title: slide.savedTitle || 'Your saved rule' }, 'Your rulebook')}<div class="p7-rule p7-rule-sharp"><small>ALREADY IN MY RULEBOOK</small><b>${text}</b></div><p class="p7-fine">Loaded from your rulebook. You don’t define it twice.</p></div>`;
    continueBtn(el.querySelector('.p7-card'), satisfy, slide.cta);
    return;
  }
  el.innerHTML = `<div class="lw-card p7-card p7-form">${head(slide, 'Build your rule')}<div class="p7-form-b"></div>
    <div class="p7-rule p7-rule-sharp p7-form-out"><small>MY RULE</small><b>·</b></div>
    <div class="p7-form-warn"></div><button type="button" class="lw-continue-btn p7-form-save" disabled>Save to my rulebook →</button><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-form');
  const b = card.querySelector('.p7-form-b');
  const out = card.querySelector('.p7-form-out b');
  const save = card.querySelector('.p7-form-save');
  const warn = card.querySelector('.p7-form-warn');
  let value = null;
  const set = (v, text) => { value = v; out.innerHTML = text || '·'; save.disabled = !v; };
  const num = (name, val, ph) => `<input class="p7-in" type="number" min="0" step="any" data-n="${name}" value="${val ?? ''}" placeholder="${ph || ''}">`;

  if (slide.form === 'news') {
    const n = rb.newsRule || {};
    b.innerHTML = `<p class="p7-fine">Scheduled events are known ahead of time. Your response should already exist. No template is “the right one”: pick what you’ll actually follow and test.</p>
      <div class="p7-sf"><small>WHICH EVENTS?</small><div class="p7-chips p7-multi">${R.NEWS_EVENT_TYPES.map((t) => `<button type="button" class="tx-chip${(n.eventTypes || []).includes(t) ? ' on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="p7-sf"><small>MY RESPONSE</small>
        <label class="p7-radio"><input type="radio" name="nt" value="window"${n.template === 'window' ? ' checked' : ''}> No new entries within ${num('before', n.minutesBefore, '5')} min before / ${num('after', n.minutesAfter, '0')} min after</label>
        <label class="p7-radio"><input type="radio" name="nt" value="flat"${n.template === 'flat' ? ' checked' : ''}> Flat before selected events (${num('flatBefore', n.template === 'flat' ? n.minutesBefore : '', '5')} min before)</label>
        <label class="p7-radio"><input type="radio" name="nt" value="skip"${n.template === 'skip' ? ' checked' : ''}> I don’t trade during selected major releases</label>
        <label class="p7-radio"><input type="radio" name="nt" value="custom"${n.template === 'custom' ? ' checked' : ''}> Custom tested rule: <input class="p7-in p7-in-wide" type="text" data-n="notes" value="${esc(n.template === 'custom' ? n.notes : '')}" placeholder="e.g. no entries 10 min before rate decisions"></label></div>`;
    const read = () => {
      const t = b.querySelector('input[name="nt"]:checked')?.value;
      const g = (k) => b.querySelector(`[data-n="${k}"]`)?.value;
      const types = [...b.querySelectorAll('.p7-multi .tx-chip.on')].map((x) => x.textContent);
      if (!t || !types.length) { set(null, t ? 'Choose at least one event type.' : '·'); return; }
      const nr = { template: t, eventTypes: types, minutesBefore: t === 'flat' ? +g('flatBefore') || 0 : +g('before') || 0, minutesAfter: t === 'window' ? +g('after') || 0 : 0, flatBefore: t === 'flat', allowExistingPosition: t !== 'flat', notes: t === 'custom' ? g('notes') : '' };
      if (t === 'window' && !nr.minutesBefore && !nr.minutesAfter) { set(null, 'Add the minutes.'); return; }
      if (t === 'custom' && (nr.notes || '').trim().length < 10) { set(null, 'Write your custom rule.'); return; }
      set({ newsRule: nr }, R.newsRuleText(nr));
    };
    b.querySelectorAll('.p7-multi .tx-chip').forEach((c) => c.addEventListener('click', () => { c.classList.toggle('on'); read(); }));
    b.querySelectorAll('input').forEach((i) => i.addEventListener('input', read));
    b.querySelectorAll('input[type=radio]').forEach((i) => i.addEventListener('change', read));
    read();
  } else if (slide.form === 'dailyStop') {
    const d = rb.dailyStop || {};
    b.innerHTML = `<p class="p7-fine">${d.fromProfile ? 'Pre-filled from the Risk Profile you saved in Phase 6. Adjust it if you need to. ' : ''}Use any combination. Whichever comes first ends the session.</p>
      <div class="p7-ds">${[['r', 'R lost', d.r, '2'], ['dollars', '$ lost', d.dollars, '240'], ['losses', 'Full losses', d.losses, '2'], ['trades', 'Trades taken', d.trades, '2']].map(([k, l, v, ph]) => `<label><small>STOP AFTER</small>${num(k, v, ph)}<span>${l}</span></label>`).join('')}</div>`;
    const read = () => {
      const g = (k) => +b.querySelector(`[data-n="${k}"]`).value || null;
      const ds = { r: g('r'), dollars: g('dollars'), losses: g('losses'), trades: g('trades'), logic: 'first' };
      const any = ds.r || ds.dollars || ds.losses || ds.trades;
      set(any ? { dailyStop: ds } : null, any ? R.dailyStopText(ds) : 'Set at least one limit.');
    };
    b.querySelectorAll('input').forEach((i) => i.addEventListener('input', read));
    read();
  } else if (slide.form === 'window') {
    const w = rb.sessionRule || {};
    b.innerHTML = `<p class="p7-fine">Your window, from your own testing. The Academy doesn’t prescribe one.</p>
      <div class="p7-ds"><label><small>FROM</small><input class="p7-in" type="time" data-n="start" value="${w.start || ''}"></label><label><small>TO</small><input class="p7-in" type="time" data-n="end" value="${w.end || ''}"></label></div>`;
    const read = () => {
      const s = b.querySelector('[data-n="start"]').value, e = b.querySelector('[data-n="end"]').value;
      const strip = (t) => t.replace(/^0/, '');
      set(s && e && s < e ? { sessionRule: { start: strip(s), end: strip(e) } } : null, s && e && s < e ? `I only take new entries between ${strip(s)} and ${strip(e)}.` : 'Choose a start and end.');
    };
    b.querySelectorAll('input').forEach((i) => i.addEventListener('input', read));
    read();
  } else if (slide.form === 'environment') {
    const er = rb.environmentRule || {};
    const blocks = [['tight-consolidation', 'Tight consolidation'], ['unclear-htf', 'Unclear HTF direction'], ['competing-pils', 'Competing PILs'], ['extreme-volatility', 'Volatility extreme for my plan'], ['objective-reached', 'Major objective already reached']];
    b.innerHTML = `<p class="p7-fine">A quality / environment rule answers “do I participate in this condition?”. It never changes whether ICC exists.</p>
      <div class="p7-sf"><small>I DO NOT TAKE DAYLI ICC SETUPS IN…</small><div class="p7-chips p7-multi">${blocks.map(([k, l]) => `<button type="button" class="tx-chip${(er.blocks || []).includes(k) ? ' on' : ''}" data-k="${k}">${l}</button>`).join('')}</div></div>
      <div class="p7-sf"><small>IN MY WORDS</small><textarea class="sw-textarea" rows="2" data-n="text">${esc(er.text || '')}</textarea><div class="p7-qlive"></div></div>`;
    const read = () => {
      const ks = [...b.querySelectorAll('.p7-multi .tx-chip.on')].map((x) => x.dataset.k);
      const text = b.querySelector('[data-n="text"]').value.trim();
      b.querySelector('.p7-qlive').innerHTML = text ? qualityHtml(text) : '';
      set(ks.length && text.length >= 15 ? { environmentRule: { blocks: ks, text } } : null, text || 'Pick the conditions, then write it in your words.');
    };
    b.querySelectorAll('.p7-multi .tx-chip').forEach((c) => c.addEventListener('click', () => { c.classList.toggle('on'); read(); }));
    b.querySelector('textarea').addEventListener('input', read);
    read();
  }
  save.addEventListener('click', () => {
    if (!value) return;
    const next = { ...R.draftRulebook(), ...value };
    const conflicts = R.ruleConflicts(next);
    R.saveRulebook(next);
    save.disabled = true; save.textContent = '✓ Saved to MY AGHF RULEBOOK';
    save.classList.remove('lw-continue-btn'); save.classList.add('p7-saved-btn');
    if (conflicts.length) warn.innerHTML = conflicts.map((c) => `<div class="p7-loophole">⚠ ${c.text}</div>`).join('');
    b.querySelectorAll('input, textarea, button').forEach((x) => { x.disabled = true; });
    runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card, slide.punch); continueBtn(card, satisfy, slide.cta); });
  });
}

/* ── p7_rulecheck: WHAT DOES YOUR RULEBOOK SAY? ────────────────────────── */
/**
 * { check: 'news'|'session'|'maxTrades'|'dailyStop'|'environment'|'noChase', situation: {...},
 *   setup: 'valid'|'invalid'|'incomplete', thought, chart, facts, rcat }
 * The correct answer comes from HER rulebook. Undefined → flag it for Review Mode.
 */
export function renderRuleCheck(el, slide, satisfy, helpers = {}) {
  let res = R.checkRulebook({ ...slide.situation, check: slide.check });
  // situation.atLimit: she is exactly at HER limit, whatever number she chose.
  if (slide.situation?.atLimit && res.defined) res = { ...res, verdict: 'blocked', rule: `${res.rule} · REACHED` };
  const setup = slide.setup || 'valid';
  let correct;
  if (setup === 'invalid') correct = 'pass';
  else if (setup === 'incomplete') correct = 'wait';
  else if (res.verdict === 'undefined') correct = 'flag';
  else if (res.verdict === 'blocked') correct = ['dailyStop', 'maxTrades'].includes(slide.check) ? 'over' : 'pass';
  else correct = 'take';
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'What does your rulebook say?')}${factsHtml(slide.facts)}<div class="p7-ask-stage"></div>
    <div class="p7-rule ${res.defined ? 'p7-rule-sharp' : 'is-undef'}"><small>${res.defined ? 'YOUR RULEBOOK' : 'YOUR RULEBOOK'}</small><b>${res.rule || 'No rulebook saved yet'}</b></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const stage = card.querySelector('.p7-ask-stage');
  if (slide.chart) chartBlock(stage, slide.chart);
  if (slide.thought) stage.insertAdjacentHTML('beforeend', `<div class="p7-mono-thoughts"><div class="p7-bubble"><span>${slide.thought}</span></div></div>`);
  const opts = [
    ['take', 'TAKE IT', 'Your rulebook allows this, and the setup is valid. Taking it is a process decision, not a guaranteed win.'],
    ['wait', 'WAIT', 'The setup isn’t complete yet. Rules can’t make an incomplete setup executable.'],
    ['pass', 'PASS', setup === 'invalid' ? 'The setup is invalid. Personal eligibility can never make an invalid strategy valid.' : 'Valid setup, blocked by your own rule. Valid setup. Invalid participation.'],
    ['over', 'SESSION OVER', 'Your rulebook ended the session. Execute mode becomes review mode.'],
    ['flag', 'FLAG IT: MY RULEBOOK DOESN’T DEFINE THIS', 'Your rulebook doesn’t define this yet. The simulator won’t invent a rule for you. Resolve it in Review Mode.'],
  ];
  const list = opts.filter(([k]) => slide.options ? slide.options.includes(k) || k === correct : (k !== 'wait' || setup === 'incomplete'));
  askQuestion(card.querySelector('.pl-asks'), {
    prompt: slide.prompt || 'WHAT DOES YOUR RULEBOOK SAY?', stack: true,
    options: list.map(([k, l, why]) => ({ label: l, correct: k === correct, why, feedback: k === 'take' ? (res.verdict === 'undefined' ? 'Your rulebook doesn’t say. Don’t invent permission in the moment.' : 'Is that what YOUR rule says, or what the setup makes you feel?') : k === 'flag' ? 'Your rulebook does define this one. Read it again.' : 'Read your rule again, exactly as written.' })),
  }, { ...helpers, onPick(q, o, c, w) { helpers.onPick?.(q, o, c, w); if (w === 0 && slide.rcat) R.trackRules(slide.rcat, c); if (w === 0 && !c && o.label === 'TAKE IT') R.trackRules('exceptions'); } }, () => {
    if (res.verdict === 'undefined') card.insertAdjacentHTML('beforeend', '<div class="p7-loophole">FLAGGED FOR REVIEW MODE: define this response before your next session.</div>');
    principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
  });
}

/* ── p7_violation: the AGHF Rule Violation Review ──────────────────────── */
/**
 * { scenario, steps: { rule: { options, correct }, before: {...}, goal: {...}, action: {...} },
 *   ifPrefill, thenPrefill, save: true }
 */
export function renderViolation(el, slide, satisfy, helpers = {}) {
  el.innerHTML = `<div class="lw-card p7-card p7-viol">${head(slide, 'Rule Violation Review')}
    ${slide.scenario ? `<div class="p7-trade"><ul>${slide.scenario.map((s) => `<li>${s}</li>`).join('')}</ul></div>` : ''}
    <p class="p7-fine">Not punishment. An investigation. No red X, no “bad trader”.</p>
    <div class="pl-asks"></div><div class="p7-ifthen" hidden></div></div>`;
  const card = el.querySelector('.p7-viol');
  const asks = card.querySelector('.pl-asks');
  const S = slide.steps;
  const step = (n, key, prompt, rcat) => S[key] && { prompt: `${n}. ${prompt}`, rcat, stack: true, options: S[key].options.map((o) => ({ label: o, correct: o === S[key].correct, why: S[key].why, feedback: S[key].feedback || 'Be specific. What actually happened?' })) };
  const picked = {};
  const qs = [step(1, 'rule', 'WHAT RULE DID I BREAK?', 'violation'), step(2, 'before', 'WHAT HAPPENED RIGHT BEFORE?', 'trigger'), step(3, 'goal', 'WHAT WAS I TRYING TO GET OR AVOID?', 'trigger'), step(4, 'action', 'WHAT SHOULD THE RULE-BASED ACTION HAVE BEEN?', 'response')].filter(Boolean);
  runAsks(asks, qs, helpers, () => {
    const box = card.querySelector('.p7-ifthen');
    box.hidden = false;
    box.innerHTML = `<div class="p7-mx-h">5. WHAT WILL I DO NEXT TIME THIS TRIGGER APPEARS?</div>
      <label class="p7-it"><b>IF</b><input class="p7-in p7-in-wide" type="text" data-n="if" value="${esc(slide.ifPrefill || S.before?.correct || '')}"></label>
      <label class="p7-it"><b>THEN I</b><textarea class="sw-textarea" rows="2" data-n="then">${esc(slide.thenPrefill || '')}</textarea></label>
      <div class="p7-qlive"></div><p class="p7-fine">Not “I’ll be more disciplined.” That’s not operational. IF trigger X happens, THEN I do Y.</p>
      <button type="button" class="lw-continue-btn" disabled>Save my trigger → response →</button>`;
    const ti = box.querySelector('[data-n="if"]'), th = box.querySelector('[data-n="then"]'), btn = box.querySelector('button'), live = box.querySelector('.p7-qlive');
    const upd = () => {
      const t = `If ${ti.value}, then I ${th.value}`;
      const q = R.ruleQuality(t);
      live.innerHTML = qualityHtml(t);
      btn.disabled = !(ti.value.trim().length > 4 && th.value.trim().length > 8 && q.actionable && !q.loopholes.length && !/\bmore disciplined\b|\bbe better\b|\btry harder\b/i.test(th.value));
    };
    ti.addEventListener('input', upd); th.addEventListener('input', upd); upd();
    btn.addEventListener('click', () => {
      btn.disabled = true; ti.disabled = true; th.disabled = true;
      R.recordViolation({ ruleTextAtTime: S.rule?.correct || '', violationType: slide.violationType || S.rule?.correct || '', trigger: ti.value.trim(), studentThought: slide.thought || '', correctResponse: S.action?.correct || '', futureImplementationRule: th.value.trim(), outcome: slide.outcome || null });
      if (slide.save !== false) R.saveTriggerResponse({ trigger: ti.value.trim(), behavior: slide.behavior || (S.rule?.correct || '').toLowerCase(), response: th.value.trim() });
      R.trackRules('response', true);
      box.insertAdjacentHTML('beforeend', `<div class="p7-rule p7-rule-sharp"><small>SAVED · TRIGGER → RESPONSE</small><b>IF ${esc(ti.value.trim())} → THEN I ${esc(th.value.trim())}</b></div>`);
      principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
    });
    void picked;
  });
}

/* ── p7_rulebook: the builder ──────────────────────────────────────────── */
/** { parts: ['intro','method','risk','session','behavior','five','when'], intro: [...] } */
export function renderRulebook(el, slide, satisfy, helpers = {}) {
  const parts = slide.parts || ['method', 'risk', 'session', 'behavior', 'five', 'when'];
  const rb = R.draftRulebook();
  el.innerHTML = `<div class="lw-card p7-card p7-rb">${head(slide, '📕 MY AGHF RULEBOOK')}<div class="p7-rb-flow"></div></div>`;
  const card = el.querySelector('.p7-rb');
  const flow = card.querySelector('.p7-rb-flow');
  const part = (title, sub) => { const p = document.createElement('div'); p.className = 'p7-rb-part'; p.innerHTML = `<div class="p7-rb-h">${title}</div>${sub ? `<p class="p7-fine">${sub}</p>` : ''}<div class="p7-rb-b"></div>`; flow.appendChild(p); p.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); return p.querySelector('.p7-rb-b'); };
  const nextBtn = (box, label, fn, enabled = true) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tx-mini p7-rb-next'; b.textContent = label; b.disabled = !enabled; b.addEventListener('click', () => { b.remove(); fn(); }); box.appendChild(b); return b; };
  let pi = 0;
  const go = () => {
    if (pi >= parts.length) { finish(); return; }
    const p = parts[pi++];
    ({ intro, method, risk, session, behavior, five, when })[p]();
  };
  function intro() {
    const b = part('YOU EARNED THIS DOCUMENT');
    b.innerHTML = `<div class="p7-earned">${(slide.intro || []).map((l, i) => `<span style="--d:${reduced() ? 0 : i * 0.35}s">${l}</span>`).join('')}</div><div class="p7-line is-big" style="--d:${reduced() ? 0 : (slide.intro || []).length * 0.35 + 0.4}s">NOW WRITE DOWN HOW YOU ACTUALLY OPERATE.</div>`;
    setTimeout(() => nextBtn(b, 'Open 📕 MY AGHF RULEBOOK →', go), reduced() ? 0 : (slide.intro || []).length * 350 + 900);
  }
  function method() {
    const b = part('PART 1 · DAYLI ICC NON-NEGOTIABLES', 'Prefilled from the method. These answer “does the setup exist?”. You don’t rewrite them and still call it Dayli ICC.');
    b.innerHTML = `<div class="p7-cards">${R.METHOD_RULES.map((r) => `<div class="p7-rcard is-method"><small>METHOD RULE</small><b>${r.title}</b><span>${r.ruleText}</span></div>`).join('')}</div>`;
    nextBtn(b, 'Next: my risk rules →', go);
  }
  function risk() {
    const rk = rb.risk || {};
    const b = part('PART 2 · MY RISK RULES', rk.fromProfile ? 'Pre-filled from the Risk Profile you saved in Phase 6. You don’t type anything twice.' : 'No Phase 6 Risk Profile found on this device. Fill these in from your plan.');
    b.innerHTML = `<div class="p7-ds">${[['riskPerTrade', 'Risk per trade'], ['dailyMax', 'Daily max'], ['maxTrades', 'Maximum trades'], ['maxSize', 'Maximum size']].map(([k, l]) => `<label><small>${l.toUpperCase()}</small><input class="p7-in p7-in-wide" type="text" data-k="${k}" value="${esc(rk[k] || '')}" placeholder="${k === 'maxTrades' ? 'e.g. 2' : k === 'maxSize' ? 'e.g. 2 MNQ' : 'e.g. 1R · $120'}"></label>`).join('')}</div>`;
    const ins = [...b.querySelectorAll('input')];
    const btn = nextBtn(b, 'Next: my session rules →', () => { rb.risk = { ...rk }; ins.forEach((i) => { rb.risk[i.dataset.k] = i.value.trim(); }); go(); }, ins.every((i) => i.value.trim()));
    ins.forEach((i) => i.addEventListener('input', () => { btn.disabled = !ins.every((x) => x.value.trim()); }));
  }
  function session() {
    const b = part('PART 3 · MY SESSION RULES', 'Your trading window, news rule, consolidation rule and when you stop. Anything you built in this section is already here.');
    const row = (k, l, v, ph) => `<label class="p7-srow"><small>${l}</small><input class="p7-in p7-in-wide" type="text" data-k="${k}" value="${esc(v || '')}" placeholder="${ph}"></label>`;
    b.innerHTML = row('window', 'TRADING WINDOW', rb.sessionRule ? `${rb.sessionRule.start}–${rb.sessionRule.end}` : '', 'e.g. 9:45–11:00')
      + `<div class="p7-srow"><small>NEWS RULE</small><b>${rb.newsRule ? R.newsRuleText(rb.newsRule) : 'NEWS RESPONSE NOT DEFINED · build it in Lesson 14'}</b></div>`
      + row('env', 'CONSOLIDATION / ENVIRONMENT RULE', rb.environmentRule?.text, 'e.g. I pass Dayli ICC inside tight consolidation when the PIL is unclear')
      + row('noChase', 'NO-CHASE RULE', rb.noChase, 'If my retest entry is missed and price moves away, I don’t market-enter late.')
      + row('stop', 'WHEN I STOP TRADING', rb.dailyStop ? R.dailyStopText(rb.dailyStop) : '', 'e.g. after −2R or 2 full losses, whichever comes first');
    const ins = [...b.querySelectorAll('input')];
    const btn = nextBtn(b, 'Next: my behavior rules →', () => {
      const v = Object.fromEntries(ins.map((i) => [i.dataset.k, i.value.trim()]));
      const m = v.window.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
      if (m) rb.sessionRule = { start: m[1], end: m[2] };
      if (v.env) rb.environmentRule = { ...(rb.environmentRule || { blocks: ['tight-consolidation'] }), text: v.env };
      if (v.noChase) rb.noChase = v.noChase;
      if (v.stop && !rb.dailyStop) rb.dailyStopNote = v.stop;
      go();
    }, ins.every((i) => i.value.trim()));
    ins.forEach((i) => i.addEventListener('input', () => { btn.disabled = !ins.every((x) => x.value.trim()); }));
  }
  function behavior() {
    const tops = topPatterns(loadProfile());
    const order = [...new Set([...tops.map((t) => t.ruleKey), 'missTrade', 'lose', 'winBig', 'fomo', 'revenge', 'hesitate', 'breakRule'])];
    const lead = tops[0];
    const b = part('PART 4 · MY BEHAVIOR RULES', lead ? `<b>${lead.line}</b> Let’s build that rule first. 🔥` : 'IF this happens, THEN I do that. Decided now, while you’re calm.');
    const ph = { missTrade: 'screenshot it, mark MISSED ACCORDING TO PLAN, wait for a new valid setup', lose: 'log it, then judge the next setup on its own', winBig: 'keep standard size and my max trades', fomo: 'no market entries; wait for a new valid setup', revenge: 'stand up, 10-minute reset, full checklist before anything', hesitate: 'if the full checklist passes and rules allow, I execute my planned size', breakRule: 'stop, do the violation review, then decide if the session continues by my rules' };
    b.innerHTML = order.map((k) => `<label class="p7-srow"><small>${R.BEHAVIOR_PROMPTS[k]} →</small><input class="p7-in p7-in-wide" type="text" data-k="${k}" value="${esc(rb.behavior?.[k] || '')}" placeholder="${ph[k]}"></label>`).join('') + '<div class="p7-qlive"></div>';
    const ins = [...b.querySelectorAll('input')];
    const live = b.querySelector('.p7-qlive');
    const upd = () => {
      const filled = ins.filter((i) => i.value.trim());
      const loose = filled.filter((i) => R.ruleQuality(i.value).loopholes.length);
      live.innerHTML = loose.length ? `<div class="p7-loophole">Could live-trading-you find a loophole here? ${loose.map((i) => `“${esc(i.value)}”`).join(' · ')}</div>` : '';
      btn.disabled = filled.length < 4 || loose.length > 0;
    };
    const btn = nextBtn(b, 'Next: MY FIVE →', () => { rb.behavior = Object.fromEntries(ins.filter((i) => i.value.trim()).map((i) => [i.dataset.k, i.value.trim()])); go(); }, false);
    ins.forEach((i) => i.addEventListener('input', upd)); upd();
    b.insertAdjacentHTML('beforeend', '<p class="p7-fine">At least four. Specific enough that live-trading-you can’t argue with them.</p>');
  }
  function five() {
    const b = part('PART 5 · MY FIVE NON-NEGOTIABLES', 'The rules you do not negotiate during a live session. Choose five. Deliberately.');
    const cards = R.ruleCards({ ...rb, rules: rb.rules });
    const chosen = new Set(rb.nonNegotiables || []);
    b.innerHTML = `<div class="p7-five"><div class="p7-mx-h">MY FIVE <span class="p7-five-n">${chosen.size}/5</span></div><div class="p7-five-slots"></div></div><div class="p7-cards p7-pick">${cards.map((c) => `<button type="button" class="p7-rcard${chosen.has(c.id) ? ' is-on' : ''}" data-id="${c.id}"><small>${c.source === 'method' ? 'METHOD RULE' : 'MY RULE'}</small><b>${c.title}</b><span>${c.text}</span><em>${chosen.has(c.id) ? '🔒 NON-NEGOTIABLE' : 'MAKE NON-NEGOTIABLE'}</em></button>`).join('')}</div>`;
    const slots = b.querySelector('.p7-five-slots');
    const draw = () => {
      b.querySelector('.p7-five-n').textContent = `${chosen.size}/5`;
      slots.innerHTML = [...chosen].map((id) => { const c = cards.find((x) => x.id === id); return c ? `<div class="p7-slot">🔒 ${c.title}</div>` : ''; }).join('') + Array.from({ length: Math.max(0, 5 - chosen.size) }, () => '<div class="p7-slot is-empty">·</div>').join('');
      btn.disabled = chosen.size !== 5;
    };
    b.querySelectorAll('.p7-pick .p7-rcard').forEach((c) => c.addEventListener('click', () => {
      const id = c.dataset.id;
      if (chosen.has(id)) chosen.delete(id); else if (chosen.size < 5) chosen.add(id); else return;
      c.classList.toggle('is-on', chosen.has(id));
      c.querySelector('em').textContent = chosen.has(id) ? '🔒 NON-NEGOTIABLE' : 'MAKE NON-NEGOTIABLE';
      draw();
    }));
    const btn = nextBtn(b, 'Lock MY FIVE →', () => { rb.nonNegotiables = [...chosen]; go(); }, false);
    draw();
  }
  function when() {
    const b = part('WHEN CAN THESE CHANGE?');
    askQuestion(b, { prompt: 'Your five non-negotiables can change…', stack: true, options: [
      { label: 'When I’m losing', feedback: 'That’s exactly when they protect you. 😭' },
      { label: 'When I miss a winner', feedback: 'That’s FOMO asking for a rewrite.' },
      { label: 'Mid-trade', feedback: 'Mid-trade is the least calm moment you’ll have all day.' },
      { label: 'When the setup looks amazing', feedback: '“…unless” is not a rule.' },
      { label: 'During structured review, with evidence', correct: true, why: 'Rules change in Review Mode, with evidence. Never while staring at the next trade.' },
    ] }, helpers, go);
  }
  function finish() {
    const conflicts = R.ruleConflicts(rb);
    const b = part('SAVE MY RULEBOOK');
    if (conflicts.length) {
      b.innerHTML = `${conflicts.map((c) => `<div class="p7-loophole">⚠ ${c.text}</div>`).join('')}<p class="p7-fine">Resolve it: the Academy won’t silently decide which rule wins.${conflicts.some((c) => c.hard) ? ' Hard account limits always outrank personal behavior rules.' : ''}</p>
        <div class="p7-chips">${conflicts.map((c, i) => `<button type="button" class="tx-chip" data-i="${i}">Fix: ${c.kind === 'daily' || c.kind === 'risk' ? 'my daily stop / risk limit wins' : c.kind === 'trades' ? 'use one maximum' : 'make it specific'}</button>`).join('')}</div>`;
      const left = new Set(conflicts.map((_, i) => i));
      b.querySelectorAll('.tx-chip').forEach((c) => c.addEventListener('click', () => {
        const cf = conflicts[+c.dataset.i];
        if (cf.kind === 'daily' || cf.kind === 'risk') Object.keys(rb.behavior || {}).forEach((k) => { if (/(one more|another) trade|keep trading|take (one|another)|size up|double|bigger size|add contracts?/i.test(rb.behavior[k])) rb.behavior[k] = 'session over: my daily stop and risk limits win'; });
        if (cf.kind === 'trades') rb.dailyStop = { ...rb.dailyStop, trades: +rb.risk.maxTrades };
        if (cf.kind === 'loophole') rb.noChase = 'If my valid Dayli ICC retest entry is missed and price moves away, I do not market-enter late. I wait for a new valid setup.';
        c.disabled = true; c.textContent = '✓ Resolved'; left.delete(+c.dataset.i);
        if (!left.size) save(b);
      }));
      return;
    }
    save(b);
  }
  function save(b) {
    const saved = R.saveRulebook(rb);
    b.insertAdjacentHTML('beforeend', `<div class="lw-reflect-saved">✓ MY AGHF RULEBOOK saved. Private to you. Editable only in Review Mode.</div>`);
    void saved;
    principle(card, slide.punch); continueBtn(card, satisfy, slide.cta);
  }
  go();
}

/* ── p7_rulebook_view: the artifact (REVIEW MODE vs SESSION MODE) ──────── */
export function rulebookHtml(rb = R.loadRulebook() || R.draftRulebook()) {
  const cards = R.ruleCards(rb);
  const five = cards.filter((c) => c.nonNeg);
  const sec = (key, label) => { const cs = cards.filter((c) => c.category === key); return cs.length ? `<section><h4>${label}</h4>${cs.map((c) => `<div class="p7-rbv-r" data-id="${c.id}"><div><b>${c.title}</b><span>${c.text}</span></div><em class="is-${c.status === R.STATUS.METHOD ? 'method' : c.status === R.STATUS.NONNEG ? 'nonneg' : c.status === R.STATUS.REVIEW ? 'review' : 'mine'}">${c.status}</em>${c.source === 'method' ? '' : '<button type="button" class="p7-edit">EDIT</button>'}</div>`).join('')}</section>` : ''; };
  return `<div class="p7-rbv">
    <div class="p7-rbv-top"><b>📕 MY AGHF RULEBOOK</b><small>${rb.savedAt ? `Last saved ${new Date(rb.savedAt).toLocaleDateString()}` : 'Draft'}</small></div>
    ${five.length ? `<section class="p7-rbv-five"><h4>MY FIVE NON-NEGOTIABLES</h4>${five.map((c) => `<div class="p7-slot">🔒 ${c.text}</div>`).join('')}</section>` : ''}
    ${R.CATEGORIES.map((c) => sec(c.key, c.label)).join('')}
    ${rb.afterViolation ? '' : `<section><h4>WHAT I DO AFTER A VIOLATION</h4><div class="p7-rbv-r"><div><b>Rule Violation Review</b><span>What rule? What happened right before? What was I trying to get or avoid? What was the rule-based action? IF trigger → THEN response.</span></div></div></section>`}
  </div>`;
}
export function renderRulebookView(el, slide, satisfy, helpers = {}) {
  const mode = slide.mode || R.getMode();
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'MY AGHF RULEBOOK')}
    <div class="p7-modebar"><span class="${mode === 'review' ? 'on' : ''}">REVIEW MODE · editable</span><span class="${mode === 'session' ? 'on' : ''}">SESSION MODE · read-only</span></div>
    <div class="p7-rbv-host">${rulebookHtml()}</div><div class="p7-modal" hidden></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const modal = card.querySelector('.p7-modal');
  card.querySelectorAll('.p7-edit').forEach((b) => b.addEventListener('click', () => {
    const row = b.closest('.p7-rbv-r');
    if (mode === 'session') {
      modal.hidden = false;
      modal.innerHTML = `<b>REVIEW THIS RULE AFTER THE SESSION?</b><p>Rules are read-only in Session Mode. Changes happen in review, with evidence.</p><input class="p7-in p7-in-wide" type="text" placeholder="Why do you want to change it? (optional)"><div class="p7-chips"><button type="button" class="tx-chip p7-q-yes">SAVE FOR REVIEW</button><button type="button" class="tx-chip p7-q-no">Keep trading by the rule</button></div>`;
      modal.querySelector('.p7-q-yes').addEventListener('click', () => { R.queueRuleChange({ ruleId: row.dataset.id, reason: modal.querySelector('input').value, sessionContext: slide.sessionContext || 'practice session' }); modal.innerHTML = '✓ Saved for review. You’ll see it after the session.'; card.querySelector('.p7-rbv-host').innerHTML = rulebookHtml(); });
      modal.querySelector('.p7-q-no').addEventListener('click', () => { modal.hidden = true; });
      return;
    }
    const span = row.querySelector('span');
    const old = span.textContent;
    span.innerHTML = `<textarea class="sw-textarea" rows="2">${esc(old)}</textarea><button type="button" class="tx-mini">Save change</button>`;
    span.querySelector('button').addEventListener('click', () => {
      const nv = span.querySelector('textarea').value.trim();
      if (nv && nv !== old) applyRuleText(row.dataset.id, nv, old, slide.reason || 'Review Mode edit');
      card.querySelector('.p7-rbv-host').innerHTML = rulebookHtml();
    });
  }));
  runAsks(card.querySelector('.pl-asks'), slide.asks, helpers, () => { principle(card, slide.punch); continueBtn(card, satisfy, slide.cta); });
}
function applyRuleText(id, text, old, reason) {
  const rb = R.draftRulebook();
  if (id === 'no-chase') rb.noChase = text;
  else if (id === 'environment') rb.environmentRule = { ...(rb.environmentRule || {}), text };
  else if (id === 'after-violation') rb.afterViolation = text;
  else if (id.startsWith('beh-')) rb.behavior = { ...(rb.behavior || {}), [id.slice(4)]: text };
  else if (id === 'risk-trades') { const n = text.match(/\d+/); if (n) rb.risk = { ...rb.risk, maxTrades: n[0] }; }
  else rb.rules = rb.rules.map((r) => (r.id === id ? { ...r, ruleText: text, lastReviewedAt: Date.now() } : r));
  R.saveRulebook(rb);
  R.resolveQueued(id, { changed: true, oldRule: old, newRule: text, reason, evidence: '' });
}

/* ── p7_rule_queue: after the session ──────────────────────────────────── */
export function renderRuleQueue(el, slide, satisfy, helpers = {}) {
  const q = R.ruleQueue();
  const cards = R.ruleCards();
  el.innerHTML = `<div class="lw-card p7-card">${head(slide, 'After the session')}<div class="p7-rq"></div><div class="pl-asks"></div></div>`;
  const card = el.querySelector('.p7-card');
  const box = card.querySelector('.p7-rq');
  if (!q.length) {
    box.innerHTML = '<p>No rules flagged for review this session. Nothing to change.</p>';
    principle(card, slide.punch); continueBtn(card, satisfy, slide.cta); return;
  }
  const show = (i) => {
    if (i >= q.length) { principle(card, slide.punch); continueBtn(card, satisfy, slide.cta); return; }
    const it = q[i];
    const c = cards.find((x) => x.id === it.ruleId) || { title: it.ruleId, text: '' };
    const row = document.createElement('div');
    row.className = 'p7-rq-item';
    row.innerHTML = `<div class="p7-seen-h">YOU FLAGGED THIS RULE FOR REVIEW.</div><div class="p7-rule"><small>${c.title}</small><b>${c.text}</b></div>
      <p class="p7-fine">Flagged ${it.tradeNumber ? `at trade ${it.tradeNumber} ` : ''}during ${it.sessionContext || 'a session'}${it.reason ? `: “${esc(it.reason)}”` : ''}.</p>
      <b>Now that the session is over, do you still want to change it?</b>
      <div class="p7-chips"><button type="button" class="tx-chip" data-a="keep">Keep it as it is</button><button type="button" class="tx-chip" data-a="change">Change it, with evidence</button></div><div class="p7-rq-edit"></div>`;
    box.appendChild(row);
    row.querySelectorAll('.tx-chip').forEach((b) => b.addEventListener('click', () => {
      row.querySelectorAll('.tx-chip').forEach((x) => { x.disabled = true; });
      if (b.dataset.a === 'keep') { R.resolveQueued(it.ruleId, { changed: false }); row.insertAdjacentHTML('beforeend', '<div class="lw-reflect-saved">✓ Kept. The calm version of you agreed with the rule.</div>'); show(i + 1); return; }
      const ed = row.querySelector('.p7-rq-edit');
      ed.innerHTML = `<textarea class="sw-textarea" rows="2" placeholder="New rule">${esc(c.text)}</textarea><input class="p7-in p7-in-wide" type="text" placeholder="Evidence (from your journal / sample)"><button type="button" class="tx-mini" disabled>Save change to history</button>`;
      const ta = ed.querySelector('textarea'), ev = ed.querySelector('input'), sb = ed.querySelector('button');
      const upd = () => { sb.disabled = ev.value.trim().length < 6 || ta.value.trim() === c.text; };
      ta.addEventListener('input', upd); ev.addEventListener('input', upd);
      sb.addEventListener('click', () => { applyRuleText(it.ruleId, ta.value.trim(), c.text, it.reason); const h = JSON.parse(localStorage.getItem('aghf_rule_history') || '[]'); if (h.length) { h[h.length - 1].evidence = ev.value.trim(); localStorage.setItem('aghf_rule_history', JSON.stringify(h)); } sb.disabled = true; ed.insertAdjacentHTML('beforeend', '<div class="lw-reflect-saved">✓ Changed in review, with evidence. Logged in your rule history.</div>'); show(i + 1); });
    }));
  };
  show(0);
}

export const RULES_RENDERERS = {
  p7_gate: renderGate,
  p7_rule_write: renderRuleWrite,
  p7_rule_form: renderRuleForm,
  p7_rulecheck: renderRuleCheck,
  p7_violation: renderViolation,
  p7_rulebook: renderRulebook,
  p7_rulebook_view: renderRulebookView,
  p7_rule_queue: renderRuleQueue,
};
Object.keys(RULES_RENDERERS).forEach((k) => {
  const r = RULES_RENDERERS[k];
  RULES_RENDERERS[k] = (el, slide, satisfy, helpers) => { if (slide.sessionStart) R.startRulesSession(slide.sessionStart); if (slide.mode) R.setMode(slide.mode); return r(el, slide, satisfy, helpers); };
});
void processResultHtml;
