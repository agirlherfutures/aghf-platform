/**
 * Phase 8 · Section 2 lesson wrappers. Each one embeds the REAL desk tool and finishes
 * the slide when the student has actually used it (locked a study, logged a rep,
 * tagged a screenshot, set a focus…). Nothing here is a demo copy of a tool.
 */
import { TOOLS, renderPracticeLab, renderReplay, renderRepLog, renderStudyConfig, renderExperimentForm, renderDiagnostic, matrixHtml, insightHtml, loadSessions } from './desk.js';
import { journalEntries, milestone, MILESTONES, reps, shots, study, newStudy, lockStudy, assemblePlan, currentPlan, metrics, diagnose, VERDICT_TEXT, EARLY_SAMPLE } from './desk-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const btn = (label, cls = '') => `<button type="button" class="p8-btn ${cls}">${label}</button>`;
const lines = (ls) => (ls || []).map((l) => `<p class="p8-say">${l}</p>`).join('');
const head = (s) => `<div class="dl-head">${s.kicker ? `<div class="p8-kicker">${esc(s.kicker)}</div>` : ''}${s.title ? `<h3 class="p8-h">${s.title}</h3>` : ''}${lines(s.lines)}</div>`;
const STASH = 'aghf_p8_lesson_stash';
// Kept in localStorage so a study or draft survives leaving the lesson and coming back.
const stash = (k, v) => { try { const o = JSON.parse(localStorage.getItem(STASH) || '{}'); if (v === undefined) return o[k]; o[k] = v; localStorage.setItem(STASH, JSON.stringify(o)); } catch { /* ignore */ } return v; };

function wrap(el, s) {
  document.body.classList.add('p8-on');
  el.innerHTML = `<div class="dl">${head(s)}<div class="dl-host"></div><div class="dl-after"></div></div>`;
  return { host: el.querySelector('.dl-host'), after: el.querySelector('.dl-after') };
}
function finish(after, s, satisfy, extra = '') {
  if (after.querySelector('.dl-done')) return;
  after.innerHTML = `<div class="dl-done">${extra}${lines(s.after)}${s.principle ? `<div class="p8-principle">${s.principle}</div>` : ''}${btn(s.cta || 'Continue →', 'is-primary')}</div>`;
  after.querySelector('.p8-btn').addEventListener('click', () => satisfy?.());
}

/* p8_tool: the real tool, with a goal ─────────────────────────────────── */
function renderTool(el, s, satisfy) {
  const { host, after } = wrap(el, s);
  const done = (extra) => finish(after, s, satisfy, extra);
  const o = { ...(s.opts || {}) };
  if (s.until === 'view') done();
  if (s.tool === 'replay') {
    if (s.until === 'pick') { o.reviewMode = true; o.onPick = () => { host.querySelector('.dk-rp-side').innerHTML = `<div class="p8-principle">THAT WAS REVIEW. 😂</div><p class="p8-say">You could see the future, so you picked the trade that worked. That’s not a test of your rules. That’s hindsight.</p>`; done(); }; }
    if (s.until === 'rep') o.onRep = (r) => { stash('lastRep', r.repId); done(`<div class="p8-tip">Saved: ${esc(r.decision)} · ${esc(r.outcome)}${r.screenshots?.length ? ` · ${r.screenshots.length} screenshots attached to this one rep` : ''}</div>`); };
    if (s.until === 'draft') { o.noLog = true; o.onRep = (d) => { stash('draft', d); done(); }; }
    if (s.until === 'blocked') { let hit = false; o.onScrubBlocked = () => { if (!hit) { hit = true; done('<div class="p8-tip">Locked on purpose. Uncertainty is what you’re practicing.</div>'); } }; o.onRep = () => done(); }
    if (s.studyFromStash) o.study = study(stash('study')) || null;
    renderReplay(host, o);
    return;
  }
  if (s.tool === 'study') {
    if (s.useStash) o.studyId = stash('study');
    if (s.until === 'lock') o.onLocked = (st) => { stash('study', st.studyId); done(); };
    if (s.until === 'conflict') { o.onKeep = () => done('<div class="p8-tip">Kept. The study stays interpretable.</div>'); o.onNewVersion = (st) => { stash('study', st.studyId); done(`<div class="p8-tip">New version v${esc(st.version)} created. The old reps stay with the old rules.</div>`); }; }
    if (o.studyId && !study(o.studyId)) delete o.studyId;
    renderStudyConfig(host, o);
    return;
  }
  if (s.tool === 'replaylog') {
    const d = stash('draft');
    if (!d) { host.innerHTML = '<p class="p8-dim">Run a replay first.</p>'; done(); return; }
    loadSessions().then(() => renderRepLog(host, d, { onSaved: () => done() }));
    return;
  }
  if (s.tool === 'screenshots') { o.onTag = () => done(); o.onQuick = () => { if (s.until === 'filter') done(); }; if (!shots().length) done('<div class="p8-tip">No screenshots yet. Every replay rep adds three automatically.</div>'); }
  if (s.tool === 'weekly') { o.onSet = () => done(); o.onStart = () => satisfy?.(); }
  if (s.tool === 'monthly') o.onExperiment = () => done();
  if (s.tool === 'plan') o.onLocked = () => done();
  if (s.tool === 'practice') o.onDone = () => done();
  if (s.tool === 'experiment') { renderExperimentForm(host, { preset: s.preset, onCreated: () => done() }); return; }
  if (s.tool === 'diagnostic') { renderDiagnostic(host, { entries: s.dataset ? expand(s.dataset) : undefined }); if (s.until !== 'verdict') done(); else verdictAsk(after, s, satisfy, s.dataset ? expand(s.dataset) : journalEntries()); return; }
  if (s.tool === 'matrix') { host.innerHTML = `<div class="dk-review">${matrixHtml(journalEntries())}</div>`; done(); return; }
  if (s.tool === 'insights') { host.innerHTML = `<div class="dk-review">${insightHtml(journalEntries())}<a class="p8-btn" href="desk.html#practice">PRACTICE THIS →</a></div>`; done(); return; }
  Promise.resolve(TOOLS[s.tool](host, o));
}

/* Synthetic practice datasets are labeled as such and never mixed into her journal. */
function expand(ds) {
  const out = [];
  ds.rows.forEach(([n, row]) => { for (let i = 0; i < n; i++) out.push({ repId: `ds-${out.length}`, createdAt: Date.now() - out.length * 36e5, decision: 'TAKE', ...row, violations: (row.violations || []).map((t) => ({ tag: t, category: ['OVERSIZED', 'DAILY LIMIT', 'EXTRA TRADE'].includes(t) ? 'RISK' : ['MOVED STOP EARLY', 'FEAR EXIT', 'RANDOM PARTIAL'].includes(t) ? 'MANAGEMENT' : 'ENTRY' })) }); });
  return out;
}
function verdictAsk(after, s, satisfy, entries) {
  const d = diagnose(entries);
  const opts = ['EXECUTION', 'SELECTION', 'RISK', 'MANAGEMENT', 'INSUFFICIENT DATA', 'STRATEGY RESEARCH WARRANTED'];
  after.innerHTML = `<div class="p8-q">${esc(s.q || 'What does the evidence point toward most strongly?')}</div><div class="p8-opts">${opts.map((o) => `<button type="button" class="p8-opt" data-v="${o}">${o}</button>`).join('')}</div><div class="p8-fb"></div>`;
  after.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
    const ok = b.dataset.v === d.verdict;
    b.classList.add(ok ? 'is-ok' : 'is-no');
    after.querySelector('.p8-fb').innerHTML = `<div class="p8-fbi is-${ok ? 'ok' : 'warn'}">${ok ? '✓ ' : ''}${esc(VERDICT_TEXT[d.verdict])}</div>`;
    if (ok) { const host = document.createElement('div'); after.appendChild(host); finish(host, s, satisfy); }
  }));
}

/* p8_note: a teaching card ─────────────────────────────────────────────── */
function renderNote(el, s, satisfy) {
  const { host, after } = wrap(el, s);
  host.innerHTML = `${s.steps ? `<ol class="dl-steps">${s.steps.map((x) => `<li>${x}</li>`).join('')}</ol>` : ''}${s.cards ? `<div class="dl-cards">${s.cards.map(([t, d]) => `<div class="dl-card"><b>${t}</b><span>${d}</span></div>`).join('')}</div>` : ''}`;
  finish(after, s, satisfy);
}

/* p8_quiz: one decision, explained ─────────────────────────────────────── */
function renderQuiz(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s);
  const items = s.items || [s];
  let i = 0;
  function show() {
    const it = items[i];
    host.innerHTML = `${it.scenario ? `<div class="dl-scn">${it.scenario}</div>` : ''}<div class="p8-q">${it.q}</div><div class="p8-opts">${it.options.map((o, k) => `<button type="button" class="p8-opt" data-k="${k}">${esc(o.label)}</button>`).join('')}</div><div class="p8-fb"></div>`;
    host.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
      const o = it.options[+b.dataset.k];
      b.classList.add(o.ok ? 'is-ok' : 'is-no'); h.handleStreak?.(!!o.ok);
      host.querySelector('.p8-fb').innerHTML = `<div class="p8-fbi is-${o.ok ? 'ok' : 'warn'}">${o.say || (o.ok ? '✓' : 'Look again.')}</div>`;
      if (!o.ok) return;
      host.querySelectorAll('.p8-opt').forEach((x) => { x.disabled = true; });
      if (i < items.length - 1) { const n = document.createElement('div'); n.innerHTML = btn('Next →', 'is-primary'); host.appendChild(n); n.querySelector('.p8-btn').addEventListener('click', () => { i += 1; show(); }); } else finish(after, s, satisfy);
    }));
  }
  show();
}

/* p8_sort: sort items into buckets ─────────────────────────────────────── */
function renderSort(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s);
  let i = 0;
  function show() {
    if (i >= s.items.length) { host.innerHTML = '<div class="dk-saved">✓ All sorted.</div>'; finish(after, s, satisfy); return; }
    const it = s.items[i];
    host.innerHTML = `<div class="dl-sortn">${i + 1} / ${s.items.length}</div><div class="dl-scn">${it.text}</div><div class="dl-buckets">${s.buckets.map(([k, l]) => `<button type="button" class="p8-opt" data-k="${k}">${esc(l)}</button>`).join('')}</div><div class="p8-fb"></div>`;
    host.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.k === it.answer; h.handleStreak?.(ok);
      b.classList.add(ok ? 'is-ok' : 'is-no');
      host.querySelector('.p8-fb').innerHTML = `<div class="p8-fbi is-${ok ? 'ok' : 'warn'}">${ok ? '✓ ' : ''}${it.why}</div>`;
      if (ok) { host.querySelectorAll('.p8-opt').forEach((x) => { x.disabled = true; }); setTimeout(() => { i += 1; show(); }, 1300); }
    }));
  }
  show();
}

/* p8_sample: the evidence meter, from her real rep count ───────────────── */
function renderSample(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s);
  const n = journalEntries().filter((e) => ['BACKTEST', 'REPLAY'].includes(e.entrySource)).length;
  const ms = milestone(n);
  const pct = Math.min(100, (n / 100) * 100);
  host.innerHTML = `<div class="dl-meter"><div class="dl-meter-bar"><i style="width:${pct}%"></i>${MILESTONES.map((m) => `<span style="left:${m.n}%" class="${n >= m.n ? 'on' : ''}"><b>${m.n}</b><em>${m.emoji} ${esc(m.badge)}</em><small>${esc(m.line)}</small></span>`).join('')}</div>
    <div class="dl-meter-n">${n} recorded reps · ${ms.next ? `${ms.next.n - n} to ${esc(ms.next.badge)}` : 'every milestone reached'}</div>
    <p class="p8-dim">These are practice milestones, not statistical thresholds. 100 reps doesn’t prove an edge. It gives you a stronger review sample.</p></div>
    <div class="dl-scn"><b>3 recorded reps.</b> Three losses in a row. You want to change the strategy.</div>
    <div class="p8-q">You currently have 3 recorded reps. That’s enough to learn from. Is it enough to make a major conclusion?</div>
    <div class="p8-opts">${[['CHANGE NOW', false, 'Three reps can’t separate a strategy problem from normal variance.'], ['KEEP TESTING', true, 'Yes. Keep the rules fixed and keep collecting.'], ['CREATE HYPOTHESIS', true, 'Also right, if you genuinely suspect something: write it down and test it in a separate study.']].map(([l, ok, say], k) => `<button type="button" class="p8-opt" data-k="${k}" data-ok="${ok ? 1 : ''}" data-say="${esc(say)}">${l}</button>`).join('')}</div><div class="p8-fb"></div>`;
  host.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
    const ok = !!b.dataset.ok; b.classList.add(ok ? 'is-ok' : 'is-no'); h.handleStreak?.(ok);
    host.querySelector('.p8-fb').innerHTML = `<div class="p8-fbi is-${ok ? 'ok' : 'warn'}">${b.dataset.say}</div>`;
    if (ok) finish(after, s, satisfy);
  }));
}

/* p8_pattern: find the pattern in a (labeled) practice dataset ─────────── */
function renderPattern(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s);
  const rows = expand(s.dataset);
  const m = metrics(rows);
  host.innerHTML = `<div class="dl-ds-tag">PRACTICE DATASET · not your data</div>
    <div class="dk-list dl-ds">${rows.map((r, i) => `<div class="dk-row-e"><span>#${i + 1}</span><b>${esc(r.setupQuality || '·')}</b><span>${esc(r.environment || '')}</span><span class="dk-oc is-${(r.outcome || '').toLowerCase()}">${esc(r.outcome)} ${r.realizedR != null ? `${r.realizedR > 0 ? '+' : ''}${r.realizedR}R` : ''}</span><span class="dk-vio">${(r.violations || []).map((v) => v.tag).join(', ') || '✓'}</span></div>`).join('')}</div>
    <div class="dk-ms"><div class="dk-m"><span>Win rate</span><b>${m.winRate.value}%</b><span class="dk-n">N = ${m.closed}</span></div><div class="dk-m"><span>Total R</span><b>${m.totalR.value}R</b></div><div class="dk-m"><span>Violations</span><b>${m.violations}</b></div></div>
    <div class="p8-q">${s.q}</div><div class="p8-opts">${s.options.map((o, k) => `<button type="button" class="p8-opt" data-k="${k}">${esc(o.label)}</button>`).join('')}</div><div class="p8-fb"></div>`;
  host.querySelectorAll('.p8-opt').forEach((b) => b.addEventListener('click', () => {
    const o = s.options[+b.dataset.k]; b.classList.add(o.ok ? 'is-ok' : 'is-no'); h.handleStreak?.(!!o.ok);
    host.querySelector('.p8-fb').innerHTML = `<div class="p8-fbi is-${o.ok ? 'ok' : 'warn'}">${o.say}</div>`;
    if (o.ok) finish(after, s, satisfy);
  }));
}

/* p8_finalboss: a 20-rep mini study in the real Backtesting Lab ─────────── */
function renderFinalBoss(el, s, satisfy) {
  const { host, after } = wrap(el, s);
  const saved = stash('bossStudy');
  const st = saved && study(saved) ? study(saved) : (() => { const x = newStudy({ title: 'Final boss · 20-rep mini study', targetRepCount: s.reps || 20, kind: 'STUDY' }); lockStudy(x.studyId); stash('bossStudy', x.studyId); return study(x.studyId); })();
  const have = reps().filter((r) => r.studyId === st.studyId).length;
  host.innerHTML = `<div class="dk-card"><div class="p8-kicker">MINI STUDY · RULES LOCKED</div><div class="dk-kv2"><span>Instrument</span><div class="dk-ro">${esc(st.instrument)}</div><span>Period</span><div class="dk-ro">${esc(st.dateRange)}</div><span>Strategy</span><div class="dk-ro">${esc(st.strategyVersion)}</div><span>Risk</span><div class="dk-ro">${esc(st.riskModel)}</div><span>Progress</span><div class="dk-ro">${have} / ${st.targetRepCount} reps</div></div>
    <p class="p8-dim">Each rep: read · wait · decide · execute or pass · reveal · log. Future hidden. Your report is calculated from whatever you actually do.</p>${btn(have ? 'Continue the study →' : 'Start rep 1 →', 'is-primary dl-go')}</div>`;
  host.querySelector('.dl-go').addEventListener('click', () => {
    renderPracticeLab(host, { study: st, reps: Math.max(1, st.targetRepCount - have), title: 'FINAL BOSS · BUILD YOUR OWN EVIDENCE', seed: 2026, onDone: () => {
      const all = reps().filter((r) => r.studyId === st.studyId);
      finish(after, s, satisfy, `<div class="p8-tip">Report built from your ${all.length} reps in this study.</div>`);
    } });
  });
}

/* p8_project: assemble, check and lock the Trading Plan ─────────────────── */
function renderProject(el, s, satisfy) {
  const { host, after } = wrap(el, s);
  const cur = currentPlan();
  if (cur) { TOOLS.plan(host, {}); finish(after, s, satisfy, `<div class="p8-tip">Plan v${esc(cur.version)} is locked.</div>`); return; }
  const p = assemblePlan({});
  host.innerHTML = `<div class="dl-look">${['RiskProfile', 'AGHF Rulebook', 'News rule', 'Environment rule', 'Session rule', 'Behavior rules', 'Dayli ICC method', 'Your practice data'].map((x, i) => `<span style="animation-delay:${i * 0.25}s">✓ ${x}</span>`).join('')}</div><div class="p8-principle">LOOK WHAT YOU’VE BUILT.</div><div class="dl-plan"></div>`;
  TOOLS.plan(host.querySelector('.dl-plan'), { onLocked: () => finish(after, s, satisfy) });
  return p;
}

/* p8_eight: all eight phase icons illuminate ───────────────────────────── */
function renderEight(el, s) {
  const names = ['She’s Brand New', 'Before the Chart', 'Reading Structure', 'Finding Direction', 'The ICC Method', 'Pulling the Trigger', 'The Mindset', 'She’s In Structure ✦'];
  el.innerHTML = `<div class="p8-eight">${names.map((n, i) => `<div class="p8-e" style="animation-delay:${0.4 + i * 0.45}s"><b>${i + 1}</b><span>PHASE ${i + 1} ✓</span><em>${n}</em></div>`).join('')}
    <div class="p8-eight-t" style="animation-delay:${0.4 + 8 * 0.45}s">${esc(s.line || '✦ ALL 8 PHASES COMPLETE.')}</div></div>`;
}

export const DESK_RENDERERS = {
  p8_tool: (el, s, sat) => renderTool(el, s, sat),
  p8_note: (el, s, sat) => renderNote(el, s, sat),
  p8_quiz: (el, s, sat, h) => renderQuiz(el, s, sat, h),
  p8_sort: (el, s, sat, h) => renderSort(el, s, sat, h),
  p8_sample: (el, s, sat, h) => renderSample(el, s, sat, h),
  p8_pattern: (el, s, sat, h) => renderPattern(el, s, sat, h),
  p8_finalboss: (el, s, sat) => renderFinalBoss(el, s, sat),
  p8_project: (el, s, sat) => renderProject(el, s, sat),
  p8_eight: (el, s) => renderEight(el, s),
};
