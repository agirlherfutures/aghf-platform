/**
 * Phase 8 · Section 2 lesson wrappers. Each one embeds the REAL desk tool and finishes
 * the slide when the student has actually used it (locked a study, logged a rep,
 * tagged a screenshot, set a focus…). Nothing here is a demo copy of a tool.
 *
 * Look: the light lesson card (p8-practice.css). Eyebrow, headline, one short line,
 * a yellow "do this" box, big illustrated answer cards, the main button on the right.
 */
import { TOOLS, renderPracticeLab, renderReplay, renderRepLog, renderStudyConfig, renderExperimentForm, renderDiagnostic, matrixHtml, insightHtml, loadSessions } from './desk.js';
import { journalEntries, milestone, MILESTONES, reps, shots, study, newStudy, lockStudy, assemblePlan, currentPlan, metrics, diagnose, VERDICT_TEXT, EARLY_SAMPLE } from './desk-core.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const btn = (label, cls = '') => `<button type="button" class="p8-btn pp-btn ${cls}">${label}</button>`;
const lines = (ls) => (ls || []).map((l) => `<p class="pp-lede">${l}</p>`).join('');
const STASH = 'aghf_p8_lesson_stash';
// Kept in localStorage so a study or draft survives leaving the lesson and coming back.
const stash = (k, v) => { try { const o = JSON.parse(localStorage.getItem(STASH) || '{}'); if (v === undefined) return o[k]; o[k] = v; localStorage.setItem(STASH, JSON.stringify(o)); } catch { /* ignore */ } return v; };

/* ── Little drawings ──────────────────────────────────────────────────────
   One 40×40 line-art set in the brand colours, picked by keyword so every card and
   question gets a picture without new lesson data. */
const C = { pink: '#F4829A', teal: '#7ECEC4', peach: '#F5A857', purple: '#7F77DD', dark: '#2C1810', pinkP: '#FDE8ED', tealP: '#E8F8F6', peachP: '#FEF3E4', purpleP: '#EEEDFE', gold: '#FFF6DC', line: '#F1E7E1' };
const svg = (inner, cls = 'pp-ic') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true">${inner}</svg>`;
const ART = {
  chart: svg(`<rect x="3" y="3" width="34" height="34" rx="9" fill="${C.tealP}"/><line x1="12" y1="10" x2="12" y2="30" stroke="${C.pink}" stroke-width="2"/><rect x="9" y="14" width="6" height="10" rx="1.5" fill="${C.pink}"/><line x1="20" y1="8" x2="20" y2="28" stroke="${C.teal}" stroke-width="2"/><rect x="17" y="12" width="6" height="11" rx="1.5" fill="${C.teal}"/><line x1="28" y1="6" x2="28" y2="24" stroke="${C.teal}" stroke-width="2"/><rect x="25" y="8" width="6" height="10" rx="1.5" fill="${C.teal}"/>`),
  calendar: svg(`<rect x="5" y="8" width="30" height="27" rx="6" fill="#fff" stroke="${C.purple}" stroke-width="2.4"/><rect x="5" y="8" width="30" height="8" rx="4" fill="${C.purple}"/><line x1="13" y1="4" x2="13" y2="11" stroke="${C.dark}" stroke-width="2.4" stroke-linecap="round"/><line x1="27" y1="4" x2="27" y2="11" stroke="${C.dark}" stroke-width="2.4" stroke-linecap="round"/><circle cx="13" cy="22" r="2" fill="${C.pink}"/><circle cx="20" cy="22" r="2" fill="${C.line}"/><circle cx="27" cy="22" r="2" fill="${C.line}"/><circle cx="13" cy="29" r="2" fill="${C.line}"/><circle cx="20" cy="29" r="2" fill="${C.teal}"/>`),
  clock: svg(`<circle cx="20" cy="20" r="15" fill="${C.peachP}" stroke="${C.peach}" stroke-width="2.4"/><path d="M20 11v9l6 4" fill="none" stroke="${C.dark}" stroke-width="2.6" stroke-linecap="round"/>`),
  book: svg(`<path d="M6 9c5-2 10-2 14 1v23c-4-3-9-3-14-1z" fill="${C.purpleP}" stroke="${C.purple}" stroke-width="2.2" stroke-linejoin="round"/><path d="M34 9c-5-2-10-2-14 1v23c4-3 9-3 14-1z" fill="#fff" stroke="${C.purple}" stroke-width="2.2" stroke-linejoin="round"/>`),
  shield: svg(`<path d="M20 4l13 5c0 12-5 21-13 26C12 30 7 21 7 9z" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 20l4 4 8-8" fill="none" stroke="${C.dark}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  sliders: svg(`<rect x="3" y="3" width="34" height="34" rx="9" fill="${C.peachP}"/><g stroke="${C.dark}" stroke-width="2.2" stroke-linecap="round"><line x1="10" y1="13" x2="30" y2="13"/><line x1="10" y1="20" x2="30" y2="20"/><line x1="10" y1="27" x2="30" y2="27"/></g><circle cx="16" cy="13" r="3.4" fill="${C.peach}"/><circle cx="25" cy="20" r="3.4" fill="${C.pink}"/><circle cx="14" cy="27" r="3.4" fill="${C.teal}"/>`),
  filter: svg(`<path d="M6 8h28l-11 13v10l-6 3V21z" fill="${C.tealP}" stroke="${C.teal}" stroke-width="2.4" stroke-linejoin="round"/>`),
  journal: svg(`<rect x="6" y="4" width="28" height="32" rx="6" fill="#fff" stroke="${C.pink}" stroke-width="2.4"/><rect x="11" y="10" width="7" height="5" rx="2" fill="${C.purple}"/><rect x="20" y="10" width="9" height="5" rx="2" fill="${C.teal}"/><line x1="11" y1="21" x2="29" y2="21" stroke="${C.line}" stroke-width="2.4" stroke-linecap="round"/><line x1="11" y1="27" x2="24" y2="27" stroke="${C.line}" stroke-width="2.4" stroke-linecap="round"/>`),
  camera: svg(`<rect x="4" y="11" width="32" height="22" rx="6" fill="${C.purpleP}" stroke="${C.purple}" stroke-width="2.4"/><path d="M14 11l3-5h6l3 5" fill="none" stroke="${C.purple}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="20" cy="22" r="6" fill="#fff" stroke="${C.dark}" stroke-width="2.4"/>`),
  play: svg(`<circle cx="20" cy="20" r="16" fill="${C.tealP}" stroke="${C.teal}" stroke-width="2.4"/><path d="M16 13l11 7-11 7z" fill="${C.dark}"/>`),
  eye: svg(`<path d="M3 20c5-8 11-12 17-12s12 4 17 12c-5 8-11 12-17 12S8 28 3 20z" fill="${C.peachP}" stroke="${C.peach}" stroke-width="2.4"/><circle cx="20" cy="20" r="6" fill="${C.dark}"/><circle cx="22" cy="18" r="2" fill="#fff"/>`),
  check: svg(`<circle cx="20" cy="20" r="16" fill="${C.teal}"/><path d="M12 20l6 6 10-11" fill="none" stroke="${C.dark}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  cross: svg(`<circle cx="20" cy="20" r="16" fill="${C.pink}"/><path d="M14 14l12 12M26 14L14 26" stroke="${C.dark}" stroke-width="3.2" stroke-linecap="round"/>`),
  warn: svg(`<path d="M20 4l17 30H3z" fill="${C.peach}" stroke-linejoin="round"/><line x1="20" y1="15" x2="20" y2="24" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="29" r="1.9" fill="${C.dark}"/>`),
  heart: svg(`<path d="M20 34S5 25 5 15a7.5 7.5 0 0115-2 7.5 7.5 0 0115 2c0 10-15 19-15 19z" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="2.4" stroke-linejoin="round"/>`),
  star: svg(`<path d="M20 4l4.6 10 10.9 1.2-8.1 7.4 2.3 10.8L20 28l-9.7 5.4 2.3-10.8-8.1-7.4L15.4 14z" fill="${C.gold}" stroke="${C.peach}" stroke-width="2.2" stroke-linejoin="round"/>`),
  target: svg(`<circle cx="20" cy="20" r="16" fill="#fff" stroke="${C.pink}" stroke-width="2.4"/><circle cx="20" cy="20" r="10" fill="${C.pinkP}" stroke="${C.pink}" stroke-width="2.4"/><circle cx="20" cy="20" r="4" fill="${C.pink}"/>`),
  bars: svg(`<rect x="3" y="3" width="34" height="34" rx="9" fill="${C.purpleP}"/><rect x="9" y="20" width="5" height="11" rx="1.5" fill="${C.purple}"/><rect x="17.5" y="13" width="5" height="18" rx="1.5" fill="${C.teal}"/><rect x="26" y="9" width="5" height="22" rx="1.5" fill="${C.pink}"/>`),
  flask: svg(`<path d="M15 4h10M17 4v11L7 32a3 3 0 002.6 4.5h20.8A3 3 0 0033 32L23 15V4" fill="${C.tealP}" stroke="${C.teal}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M11 26h18l3 6.5H8z" fill="${C.teal}"/>`),
  lock: svg(`<rect x="8" y="17" width="24" height="18" rx="5" fill="${C.gold}" stroke="${C.peach}" stroke-width="2.4"/><path d="M13 17v-4a7 7 0 0114 0v4" fill="none" stroke="${C.dark}" stroke-width="2.4"/><circle cx="20" cy="26" r="2.4" fill="${C.dark}"/>`),
  question: svg(`<circle cx="20" cy="20" r="16" fill="${C.gold}" stroke="${C.peach}" stroke-width="2.4"/><path d="M15.5 15.5a4.5 4.5 0 119 0c0 3-4.5 3.5-4.5 7" fill="none" stroke="${C.dark}" stroke-width="2.8" stroke-linecap="round"/><circle cx="20" cy="28" r="1.9" fill="${C.dark}"/>`),
  search: svg(`<circle cx="17" cy="17" r="11" fill="${C.purpleP}" stroke="${C.purple}" stroke-width="2.6"/><line x1="25" y1="25" x2="35" y2="35" stroke="${C.dark}" stroke-width="3.4" stroke-linecap="round"/>`),
  redo: svg(`<path d="M30 14a12 12 0 10 2 10" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round"/><path d="M31 5v10H21" fill="none" stroke="${C.pink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
};
// First match wins, so the specific words sit above the general ones.
const PICK = [
  [/what do you (record|log)|journal|\blog\b|logged|record/i, 'journal'],
  [/weekly|monthly|date|week|month|calendar|period/i, 'calendar'],
  [/session|hours|time|clock/i, 'clock'],
  [/screenshot|picture|shot|before\b|after\b/i, 'camera'],
  [/replay|forward|candle at a time|tradingview|historical/i, 'play'],
  [/hindsight|review|see what happens|already seen|finished chart|ahead/i, 'eye'],
  [/mindset|fomo|feel|felt|trigger|state|fear|revenge/i, 'heart'],
  [/risk|stop|size|limit|oversized/i, 'shield'],
  [/management|partial|in the trade/i, 'sliders'],
  [/environment|filter|pass\b/i, 'filter'],
  [/method|rulebook|rule|icc|plan/i, 'book'],
  [/market|instrument|chart|4h|1h|15m|1m|structure|setup/i, 'chart'],
  [/entry|execution|execute|chase|confirmation|retest/i, 'target'],
  [/journal|log|record|trade\b|entry quality|rep\b|reps/i, 'journal'],
  [/win rate|dashboard|metric|profitable|performance|process|expectancy|insight|count/i, 'bars'],
  [/custom|your own/i, 'star'],
  [/hypothesis|test|study/i, 'flask'],
  [/investigate|diagnos|evidence|pattern/i, 'search'],
];
const artFor = (t, dflt = 'question') => { const s = String(t || '').replace(/<[^>]+>/g, ''); const hit = PICK.find(([re]) => re.test(s)); return hit ? ART[hit[1]] : (ART[dflt] || ''); };

/* Labels like "A · LOSS" or "Trigger: FOMO · violation: CHASED" are journal rows, so they're drawn as one.
   Only when every option in the set is one: a lone row-shaped answer would give itself away. */
const SPLIT = /\s+·\s+|\s+\+\s+/;
const rowish = (label) => { const p = String(label).split(SPLIT); return p.length > 1 && p.every((x) => x.length <= 26); };
function chipTone(p) {
  if (/WIN/.test(p)) return 'win';
  if (/LOSS/.test(p)) return 'loss';
  if (/no violation/i.test(p)) return 'trig';
  if (/violation|CHASED/i.test(p)) return 'vio';
  if (/trigger/i.test(p)) return 'trig';
  if (/^[ABC]$/.test(p.trim())) return 'q';
  return 'n';
}
const rowChips = (label) => `<span class="pp-row">${label.split(SPLIT).map((p) => `<span class="pp-chip is-${chipTone(p)}">${esc(p)}</span>`).join('')}</span>`;
const optInner = (label, asRow) => asRow
  ? `<span class="pp-opt-ic pp-opt-row">${ART.journal}</span><span class="pp-opt-t">${rowChips(label)}<span class="pp-sr">${esc(label)}</span></span>`
  : `<span class="pp-opt-ic pp-radio" aria-hidden="true"></span><span class="pp-opt-t">${esc(label)}</span>`;
const optsHtml = (opts, cls = '') => { const asRow = opts.every((o) => rowish(o.label)); return `<div class="pp-opts${opts.length === 2 ? ' is-2' : ''} ${cls}">${opts.map((o, k) => `<button type="button" class="pp-opt" data-k="${k}">${optInner(o.label, asRow)}<span class="pp-mark" aria-hidden="true"></span></button>`).join('')}</div>`; };
const fbHtml = (ok, say) => `<div class="pp-fb is-${ok ? 'ok' : 'warn'} pp-pop"><span class="pp-fb-ic">${ok ? '✓' : '!'}</span><div><b>${ok ? 'Right.' : 'Look again.'}</b> ${say || ''}</div></div>`;
const qHtml = (q, art) => `<div class="pp-qrow"><span class="pp-qart">${art}</span><div class="pp-q">${q}</div></div>`;
const dots = (n, at) => n > 1 ? `<div class="pp-prog"><span class="pp-dots">${Array.from({ length: n }, (_, k) => `<i class="${k < at ? 'done' : k === at ? 'on' : ''}"></i>`).join('')}</span><span class="pp-count">${at + 1} of ${n}</span></div>` : '';
/** A wrong pick stays tappable (retry); the right one locks the set. */
function markPick(b, ok) {
  b.classList.remove('is-ok', 'is-no'); void b.offsetWidth;
  b.classList.add(ok ? 'is-ok' : 'is-no');
  b.querySelector('.pp-mark').textContent = ok ? '✓' : '✕';
}

/* ── The card ─────────────────────────────────────────────────────────── */
function wrap(el, s, kind = 'q') {
  document.body.classList.add('p8-on');
  // Tool screens: the line under the headline is what to do, so it sits in the yellow box.
  const say = kind === 'tool' && s.lines?.length ? `<div class="pp-do"><span class="pp-do-ic">👉</span><div>${s.lines.join(' ')}</div></div>` : lines(s.lines);
  el.innerHTML = `<div class="dl pp pp-${kind}"><div class="pp-in">
    <div class="dl-head pp-head">${s.kicker ? `<div class="pp-eyebrow">${esc(s.kicker)}</div>` : ''}${s.title ? `<h2 class="pp-title">${s.title}</h2>` : ''}${say}</div>
    <div class="dl-host pp-host"></div><div class="dl-after pp-after"></div></div></div>`;
  return { host: el.querySelector('.dl-host'), after: el.querySelector('.dl-after') };
}
const tip = (t) => `<div class="pp-tip">${t}</div>`;
function finish(after, s, satisfy, extra = '') {
  if (after.querySelector('.dl-done')) return;
  const said = (s.after || []).map((l) => `<p class="pp-said">${l}</p>`).join('');
  after.innerHTML = `<div class="dl-done pp-done">${extra}${said}${s.principle ? `<div class="pp-rule pp-pop"><span class="pp-rule-ic">D</span><div><small>Dayli’s rule</small><p>${s.principle}</p></div></div>` : ''}<div class="pp-act">${btn(s.cta || 'Continue →', 'is-primary pp-go')}</div></div>`;
  after.querySelector('.pp-go').addEventListener('click', () => satisfy?.());
}

/* p8_tool: the real tool, with a goal ─────────────────────────────────── */
function renderTool(el, s, satisfy) {
  const { host, after } = wrap(el, s, 'tool');
  const done = (extra) => finish(after, s, satisfy, extra);
  const o = { ...(s.opts || {}) };
  if (s.until === 'view') done();
  if (s.tool === 'replay') {
    if (s.until === 'pick') { o.reviewMode = true; o.onPick = () => { host.querySelector('.dk-rp-side').innerHTML = `<div class="pp-fb is-warn pp-pop"><span class="pp-fb-ic">😂</span><div><b>That was review.</b> You could see the future, so you picked the winner. That tests hindsight, not your rules.</div></div>`; done(); }; }
    if (s.until === 'rep') o.onRep = (r) => { stash('lastRep', r.repId); done(tip(`✓ Saved: ${esc(r.decision)} · ${esc(r.outcome)}${r.screenshots?.length ? ` · ${r.screenshots.length} screenshots on this one rep` : ''}`)); };
    if (s.until === 'draft') { o.noLog = true; o.onRep = (d) => { stash('draft', d); done(); }; }
    if (s.until === 'blocked') { let hit = false; o.onScrubBlocked = () => { if (!hit) { hit = true; done(tip('🔒 Locked on purpose. Uncertainty is what you’re practicing.')); } }; o.onRep = () => done(); }
    if (s.studyFromStash) o.study = study(stash('study')) || null;
    renderReplay(host, o);
    return;
  }
  if (s.tool === 'study') {
    if (s.useStash) o.studyId = stash('study');
    if (s.until === 'lock') o.onLocked = (st) => { stash('study', st.studyId); done(); };
    if (s.until === 'conflict') { o.onKeep = () => done(tip('✓ Kept. The study stays clean.')); o.onNewVersion = (st) => { stash('study', st.studyId); done(tip(`✓ New version v${esc(st.version)}. Old reps stay with the old rules.`)); }; }
    if (o.studyId && !study(o.studyId)) delete o.studyId;
    renderStudyConfig(host, o);
    return;
  }
  if (s.tool === 'replaylog') {
    const d = stash('draft');
    if (!d) { host.innerHTML = tip('Run a replay first.'); done(); return; }
    loadSessions().then(() => renderRepLog(host, d, { onSaved: () => done() }));
    return;
  }
  if (s.tool === 'screenshots') { o.onTag = () => done(); o.onQuick = () => { if (s.until === 'filter') done(); }; if (!shots().length) done(tip('No screenshots yet. Every replay rep adds three.')); }
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

/* Synthetic practice datasets are labeled as such and never mixed into the student's journal. */
function expand(ds) {
  const out = [];
  ds.rows.forEach(([n, row]) => { for (let i = 0; i < n; i++) out.push({ repId: `ds-${out.length}`, createdAt: Date.now() - out.length * 36e5, decision: 'TAKE', ...row, violations: (row.violations || []).map((t) => ({ tag: t, category: ['OVERSIZED', 'DAILY LIMIT', 'EXTRA TRADE'].includes(t) ? 'RISK' : ['MOVED STOP EARLY', 'FEAR EXIT', 'RANDOM PARTIAL'].includes(t) ? 'MANAGEMENT' : 'ENTRY' })) }); });
  return out;
}
const VERDICT_ART = { EXECUTION: 'target', SELECTION: 'filter', RISK: 'shield', MANAGEMENT: 'sliders', 'INSUFFICIENT DATA': 'question', 'STRATEGY RESEARCH WARRANTED': 'flask' };
function verdictAsk(after, s, satisfy, entries) {
  const d = diagnose(entries);
  const opts = ['EXECUTION', 'SELECTION', 'RISK', 'MANAGEMENT', 'INSUFFICIENT DATA', 'STRATEGY RESEARCH WARRANTED'];
  after.innerHTML = `<div class="pp-ask">${qHtml(esc(s.q || 'What does the evidence point toward most strongly?'), ART.search)}
    <div class="pp-opts is-3">${opts.map((o) => `<button type="button" class="pp-opt" data-v="${o}"><span class="pp-opt-ic pp-opt-art">${ART[VERDICT_ART[o]]}</span><span class="pp-opt-t">${o.charAt(0) + o.slice(1).toLowerCase()}</span><span class="pp-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="pp-fbs"></div></div><div class="pp-fin"></div>`;
  after.querySelectorAll('.pp-opt').forEach((b) => b.addEventListener('click', () => {
    const ok = b.dataset.v === d.verdict;
    markPick(b, ok);
    after.querySelector('.pp-fbs').innerHTML = fbHtml(ok, esc(VERDICT_TEXT[d.verdict]));
    if (ok) { after.querySelectorAll('.pp-opt').forEach((x) => { x.disabled = true; }); finish(after.querySelector('.pp-fin'), s, satisfy); }
  }));
}

/* p8_note: a teaching card ─────────────────────────────────────────────── */
function renderNote(el, s, satisfy) {
  const { host, after } = wrap(el, s, 'note');
  const steps = s.steps ? `<ol class="pp-steps">${s.steps.map((x, i) => `<li class="pp-step" style="animation-delay:${i * 70}ms"><span class="pp-num">${i + 1}</span><span class="pp-step-t">${x}</span></li>`).join('')}</ol>` : '';
  const cards = s.cards ? `<div class="pp-cards${s.cards.length === 4 ? ' is-4' : ''}">${s.cards.map(([t, d], i) => `<div class="pp-card" style="animation-delay:${i * 70}ms"><span class="pp-card-art">${(artFor(t, '') || artFor(d, 'star'))}</span><b>${t}</b><span>${d}</span></div>`).join('')}</div>` : '';
  host.innerHTML = steps + cards;
  finish(after, s, satisfy);
}

/* p8_quiz: one decision, explained ─────────────────────────────────────── */
function renderQuiz(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s, 'q');
  const items = s.items || [s];
  let i = 0;
  function show() {
    const it = items[i];
    host.innerHTML = `${dots(items.length, i)}${it.scenario ? `<div class="pp-scn"><span class="pp-scn-ic">${artFor(it.scenario, 'journal')}</span><div>${it.scenario}</div></div>` : ''}
      <div class="pp-ask pp-pop">${qHtml(it.q, artFor(it.q))}${optsHtml(it.options)}<div class="pp-fbs"></div></div><div class="pp-act pp-next" hidden></div>`;
    host.querySelectorAll('.pp-opt').forEach((b) => b.addEventListener('click', () => {
      const o = it.options[+b.dataset.k];
      markPick(b, !!o.ok); h.handleStreak?.(!!o.ok);
      host.querySelector('.pp-fbs').innerHTML = fbHtml(!!o.ok, o.say || '');
      if (!o.ok) return;
      host.querySelectorAll('.pp-opt').forEach((x) => { x.disabled = true; });
      if (i < items.length - 1) {
        const n = host.querySelector('.pp-next'); n.hidden = false; n.innerHTML = btn('Next question →', 'is-primary');
        n.querySelector('.pp-btn').addEventListener('click', () => { i += 1; show(); });
      } else finish(after, s, satisfy);
    }));
  }
  show();
}

/* p8_sort: sort items into buckets ─────────────────────────────────────── */
// A bucket, drawn: the colour and the symbol say which pile it is.
const BUCKET = { rep: ['check', C.teal, C.tealP], bt: ['play', C.teal, C.tealP], not: ['cross', C.pink, C.pinkP], hs: ['eye', C.peach, C.peachP], bad: ['warn', C.pink, C.pinkP] };
const GLYPH = {
  check: `<path d="M23 35l6 6 12-13" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  cross: `<path d="M25 28l14 14M39 28L25 42" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`,
  play: `<path d="M27 27l14 8-14 8z" fill="${C.dark}"/>`,
  eye: `<path d="M18 35c4-6 9-9 14-9s10 3 14 9c-4 6-9 9-14 9s-10-3-14-9z" fill="#fff" stroke="${C.dark}" stroke-width="2.6"/><circle cx="32" cy="35" r="4.5" fill="${C.dark}"/>`,
  warn: `<line x1="32" y1="26" x2="32" y2="38" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="44" r="2.4" fill="${C.dark}"/>`,
};
const bucketSvg = (key, k) => {
  const [g, col, pale] = BUCKET[key] || [['check', 'cross', 'warn'][k % 3], [C.teal, C.pink, C.peach][k % 3], [C.tealP, C.pinkP, C.peachP][k % 3]];
  return `<svg class="pp-bucket-art" viewBox="0 0 64 60" aria-hidden="true"><path d="M8 16h48l-5.5 36a5 5 0 01-5 4.3H18.5a5 5 0 01-5-4.3z" fill="${pale}" stroke="${col}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="16" rx="24" ry="6" fill="#fff" stroke="${col}" stroke-width="3"/><path d="M14 13c4-9 32-9 36 0" fill="none" stroke="${C.dark}" stroke-width="2" stroke-linecap="round" opacity=".35"/>${GLYPH[g]}</svg>`;
};
function renderSort(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s, 'q');
  let i = 0;
  function show() {
    if (i >= s.items.length) { host.innerHTML = `<div class="pp-fb is-ok pp-pop"><span class="pp-fb-ic">✓</span><div><b>All ${s.items.length} sorted.</b></div></div>`; finish(after, s, satisfy); return; }
    const it = s.items[i];
    host.innerHTML = `${dots(s.items.length, i)}<div class="pp-sortcard pp-pop"><span class="pp-sortcard-ic">${artFor(it.text, 'journal')}</span><div>${it.text}</div></div>
      <div class="pp-do pp-do-sm"><span class="pp-do-ic">👇</span><div>Tap the pile it belongs in.</div></div>
      <div class="pp-buckets is-${s.buckets.length}">${s.buckets.map(([k, l], n) => `<button type="button" class="pp-bucket" data-k="${k}">${bucketSvg(k, n)}<span class="pp-bucket-l">${esc(l)}</span><span class="pp-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="pp-fbs"></div>`;
    host.querySelectorAll('.pp-bucket').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.k === it.answer; h.handleStreak?.(ok);
      markPick(b, ok);
      host.querySelector('.pp-fbs').innerHTML = fbHtml(ok, it.why);
      if (ok) { host.querySelectorAll('.pp-bucket').forEach((x) => { x.disabled = true; }); setTimeout(() => { i += 1; show(); }, 1300); }
    }));
  }
  show();
}

/* p8_sample: the evidence meter, from the student's real rep count ──────── */
const lossCandles = `<svg class="pp-ic" viewBox="0 0 40 40" aria-hidden="true">${[0, 1, 2].map((k) => `<line x1="${9 + k * 11}" y1="${6 + k * 6}" x2="${9 + k * 11}" y2="${22 + k * 6}" stroke="${C.pink}" stroke-width="2"/><rect x="${5.5 + k * 11}" y="${9 + k * 6}" width="7" height="10" rx="1.6" fill="${C.pink}"/>`).join('')}</svg>`;
function renderSample(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s, 'q');
  const n = journalEntries().filter((e) => ['BACKTEST', 'REPLAY'].includes(e.entrySource)).length;
  const ms = milestone(n);
  const pct = Math.min(100, (n / 100) * 100);
  const opts = [['CHANGE NOW', false, 'Three reps can’t separate a strategy problem from normal variance.', 'redo'], ['KEEP TESTING', true, 'Keep the rules fixed and keep collecting.', 'play'], ['CREATE HYPOTHESIS', true, 'Also right, if you really suspect something: write it down and test it in a separate study.', 'flask']];
  host.innerHTML = `<div class="pp-meter">
      <div class="pp-meter-top"><div class="pp-meter-n"><b>${n}</b><span>recorded reps</span></div><div class="pp-meter-next">${ms.next ? `<b>${ms.next.n - n}</b> to ${ms.next.emoji} ${esc(ms.next.badge)}` : 'Every milestone reached ✦'}</div></div>
      <div class="pp-track" role="img" aria-label="${n} of 100 reps"><i style="width:${pct}%"></i>${MILESTONES.map((m) => `<span class="pp-tick${n >= m.n ? ' on' : ''}" style="left:${m.n}%"></span>`).join('')}</div>
      <div class="pp-miles">${MILESTONES.map((m) => `<div class="pp-mile${n >= m.n ? ' on' : ms.next && ms.next.n === m.n ? ' next' : ''}"><span class="pp-mile-e">${m.emoji}</span><b>${m.n} reps</b><em>${esc(m.badge)}</em><small>${esc(m.line)}</small></div>`).join('')}</div>
      <p class="pp-note">Practice milestones, not proof. 100 reps doesn’t prove an edge. It gives you a stronger review sample.</p></div>
    <div class="pp-scn"><span class="pp-scn-ic">${lossCandles}</span><div><b>3 recorded reps. 3 losses in a row.</b> You want to change the strategy.</div></div>
    <div class="pp-ask">${qHtml('3 reps is enough to learn from. Is it enough for a major conclusion?', ART.question)}
    <div class="pp-opts is-3">${opts.map(([l, ok, say, art], k) => `<button type="button" class="pp-opt" data-k="${k}" data-ok="${ok ? 1 : ''}" data-say="${esc(say)}"><span class="pp-opt-ic pp-opt-art">${ART[art]}</span><span class="pp-opt-t">${l.charAt(0) + l.slice(1).toLowerCase()}</span><span class="pp-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="pp-fbs"></div></div>`;
  host.querySelectorAll('.pp-opt').forEach((b) => b.addEventListener('click', () => {
    const ok = !!b.dataset.ok; markPick(b, ok); h.handleStreak?.(ok);
    host.querySelector('.pp-fbs').innerHTML = fbHtml(ok, esc(b.dataset.say));
    if (ok) finish(after, s, satisfy);
  }));
}

/* p8_pattern: find the pattern in a (labeled) practice dataset ─────────── */
// Every rep is one bar: up for a win, down for a loss. A pink dot above means a rule break;
// the strip under it is the environment.
function patternSvg(rows) {
  const n = rows.length, gap = 24, W = Math.max(300, n * gap + 24), H = 190, base = 92, maxR = Math.max(1, ...rows.map((r) => Math.abs(+r.realizedR || 0)));
  const k = 58 / maxR, x = (i) => 18 + i * gap;
  let g = `<line x1="8" x2="${W - 8}" y1="${base}" y2="${base}" stroke="${C.line}" stroke-width="2"/>`;
  rows.forEach((r, i) => {
    const R = +r.realizedR || 0, hgt = Math.max(3, Math.abs(R) * k), win = R > 0;
    const vio = (r.violations || []).length;
    g += `<rect x="${x(i)}" y="${win ? base - hgt : base}" width="15" height="${hgt}" rx="3" fill="${win ? C.teal : R < 0 ? C.pink : C.line}"/>`;
    g += vio ? `<circle cx="${x(i) + 7.5}" cy="14" r="6.5" fill="${C.pink}"/><text x="${x(i) + 7.5}" y="18" text-anchor="middle" font-size="10" font-weight="900" fill="${C.dark}" font-family="DM Sans,sans-serif">!</text>` : `<circle cx="${x(i) + 7.5}" cy="14" r="3" fill="${C.line}"/>`;
    g += `<text x="${x(i) + 7.5}" y="${H - 22}" text-anchor="middle" font-size="11" font-weight="800" fill="#7A5C50" font-family="DM Sans,sans-serif">${esc(r.setupQuality || '·')}</text>`;
    g += `<rect x="${x(i)}" y="${H - 12}" width="15" height="7" rx="3.5" fill="${r.environment === 'MESSY' ? C.peach : C.tealP}" stroke="${r.environment === 'MESSY' ? C.peach : C.teal}" stroke-width="1"/>`;
    if (r.direction === 'short') g += `<text x="${x(i) + 7.5}" y="${win ? base + 13 : base - 5}" text-anchor="middle" font-size="9" font-weight="800" fill="#7A5C50" font-family="DM Sans,sans-serif">S</text>`;
  });
  return `<svg class="pp-pchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${n} practice reps as bars">${g}</svg>`;
}
function renderPattern(el, s, satisfy, h = {}) {
  const { host, after } = wrap(el, s, 'q');
  const rows = expand(s.dataset);
  const m = metrics(rows);
  const shorts = rows.some((r) => r.direction === 'short');
  host.innerHTML = `<div class="pp-data">
      <div class="pp-data-head"><span class="pp-tag">${ART.lock} Practice dataset · not your data</span><span class="pp-data-n">N = ${rows.length}</span></div>
      <div class="pp-pchart-box">${patternSvg(rows)}</div>
      <div class="pp-legend"><span><i style="background:${C.teal}"></i>Win</span><span><i style="background:${C.pink}"></i>Loss</span><span><i class="is-dot" style="background:${C.pink}"></i>Rule break</span><span><i style="background:${C.tealP};border:1px solid ${C.teal}"></i>Clean</span><span><i style="background:${C.peach}"></i>Messy</span><span><b>A B C</b> Quality</span>${shorts ? '<span><b>S</b> Short</span>' : ''}</div>
      <div class="pp-stats"><div><small>Win rate</small><b>${m.winRate.value}%</b><em>N = ${m.closed}</em></div><div><small>Total R</small><b>${m.totalR.value}R</b></div><div><small>Rule breaks</small><b>${m.violations}</b></div></div>
      <details class="pp-rows"><summary>See every entry</summary><div class="dk-list dl-ds">${rows.map((r, i) => `<div class="dk-row-e"><span>#${i + 1}</span><b>${esc(r.setupQuality || '·')}</b><span>${esc(r.environment || '')}</span><span class="dk-oc is-${(r.outcome || '').toLowerCase()}">${esc(r.outcome)} ${r.realizedR != null ? `${r.realizedR > 0 ? '+' : ''}${r.realizedR}R` : ''}</span><span class="dk-vio">${(r.violations || []).map((v) => v.tag).join(', ') || '✓'}</span></div>`).join('')}</div></details>
    </div>
    <div class="pp-ask">${qHtml(s.q, ART.search)}${optsHtml(s.options, 'is-col')}<div class="pp-fbs"></div></div>`;
  host.querySelectorAll('.pp-opt').forEach((b) => b.addEventListener('click', () => {
    const o = s.options[+b.dataset.k]; markPick(b, !!o.ok); h.handleStreak?.(!!o.ok);
    host.querySelector('.pp-fbs').innerHTML = fbHtml(!!o.ok, o.say);
    if (o.ok) { host.querySelectorAll('.pp-opt').forEach((x) => { x.disabled = true; }); finish(after, s, satisfy); }
  }));
}

/* p8_finalboss: a 20-rep mini study in the real Backtesting Lab ─────────── */
function renderFinalBoss(el, s, satisfy) {
  const { host, after } = wrap(el, s, 'tool');
  const saved = stash('bossStudy');
  const st = saved && study(saved) ? study(saved) : (() => { const x = newStudy({ title: 'Final boss · 20-rep mini study', targetRepCount: s.reps || 20, kind: 'STUDY' }); lockStudy(x.studyId); stash('bossStudy', x.studyId); return study(x.studyId); })();
  const have = reps().filter((r) => r.studyId === st.studyId).length;
  const pct = Math.round((have / st.targetRepCount) * 100);
  host.innerHTML = `<div class="pp-boss">
      <div class="pp-boss-top"><span class="pp-tag">${ART.lock} Mini study · rules locked</span><span class="pp-data-n">${have} / ${st.targetRepCount} reps</span></div>
      <div class="pp-track pp-track-sm"><i style="width:${pct}%"></i></div>
      <div class="pp-kv"><div><small>Instrument</small><b>${esc(st.instrument)}</b></div><div><small>Period</small><b>${esc(st.dateRange)}</b></div><div><small>Strategy</small><b>${esc(st.strategyVersion)}</b></div><div><small>Risk</small><b>${esc(st.riskModel)}</b></div></div>
      <ol class="pp-loop">${['Read', 'Wait', 'Decide', 'Take or pass', 'Reveal', 'Log'].map((t, i) => `<li><span class="pp-num">${i + 1}</span>${t}</li>`).join('')}</ol>
      <p class="pp-note">The future stays hidden. Your report comes from what you actually do.</p>
      <div class="pp-act">${btn(have ? 'Continue the study →' : 'Start rep 1 →', 'is-primary dl-go')}</div></div>`;
  host.querySelector('.dl-go').addEventListener('click', () => {
    renderPracticeLab(host, { study: st, reps: Math.max(1, st.targetRepCount - have), title: 'FINAL BOSS · BUILD YOUR OWN EVIDENCE', seed: 2026, onDone: () => {
      const all = reps().filter((r) => r.studyId === st.studyId);
      finish(after, s, satisfy, tip(`✓ Report built from your ${all.length} reps in this study.`));
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
  const names = ['You’re Brand New', 'Before the Chart', 'Reading Structure', 'Finding Direction', 'The ICC Method', 'Pulling the Trigger', 'The Mindset', 'You’re In Structure ✦'];
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
