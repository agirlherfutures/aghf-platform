/**
 * MY TRADER DESK · core (no DOM).
 *
 * One ecosystem, no duplicate input:
 *   PracticeRep (backtest / replay / paper / live / manual) and Academy case entries
 *   → TradeJournal → PerformanceDashboard → WeeklyReview → PracticeFocus → Practice Lab
 *   MonthlyReview → RuleChangeExperiment → new BacktestStudy → new TradingPlanVersion.
 *
 * Every number comes from what the student actually recorded. Nothing here invents
 * performance, and every metric travels with its sample size.
 *
 * Storage: all reads/writes go through `store`, so moving practice data to the server
 * later is a change in one place.
 */
import { practiceJournal } from './case-core.js';

export const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } return v; },
};
const K = {
  studies: 'aghf_desk_studies', reps: 'aghf_desk_reps', shots: 'aghf_desk_shots', weekly: 'aghf_desk_weekly', monthly: 'aghf_desk_monthly',
  focus: 'aghf_desk_focus', experiments: 'aghf_desk_experiments', plan: 'aghf_trading_plan', capstone: 'aghf_capstone_attempts', alumni: 'aghf_alumni', reflections: 'aghf_capstone_reflections',
};
const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const r2 = (x) => Math.round(x * 100) / 100;

// ── MethodVersion ─────────────────────────────────────────────────────────
export const METHOD_VERSION = { id: 'dayli-icc-1.0', label: 'Dayli ICC 1.0', status: 'stable' };

export const MILESTONES = [
  { n: 10, badge: 'SCREEN TIME STARTER', emoji: '⏱️', line: 'Learning the mechanics.' },
  { n: 25, badge: 'PATTERN BUILDER', emoji: '🧩', line: 'Starting to see patterns.' },
  { n: 50, badge: 'BACKTEST BABE 😂', emoji: '📼', line: 'Building early evidence.' },
  { n: 100, badge: 'DATA OVER DRAMA', emoji: '📈', line: 'A stronger review sample.' },
];
export function milestone(n) {
  const reached = MILESTONES.filter((m) => n >= m.n);
  const next = MILESTONES.find((m) => n < m.n) || null;
  return { reached, current: reached[reached.length - 1] || null, next };
}

// ── BacktestStudy ─────────────────────────────────────────────────────────
// The rule fields that define what's being tested. Changing one mid-study makes a new version.
export const STUDY_RULE_FIELDS = ['strategyVersion', 'rulebookVersion', 'riskModel', 'managementModel', 'environmentRules', 'newsRule', 'sessionWindow', 'entryRule', 'stopRule', 'targetRule'];
export function studies() { return store.get(K.studies, []); }
export function study(id) { return studies().find((s) => s.studyId === id) || null; }
export function saveStudy(s) {
  const all = studies().filter((x) => x.studyId !== s.studyId); all.push(s); store.set(K.studies, all); return s;
}
export function newStudy(cfg = {}) {
  return saveStudy({
    studyId: uid('study'), title: cfg.title || 'My Dayli ICC study', instrument: cfg.instrument || 'MNQ', dateRange: cfg.dateRange || 'Recreated sessions · Mar–Apr',
    sessionWindow: cfg.sessionWindow || '9:30–11:00 NY', strategyVersion: cfg.strategyVersion || METHOD_VERSION.label, rulebookVersion: cfg.rulebookVersion || 'Current rulebook',
    riskModel: cfg.riskModel || '1 contract · stop beyond the correction', managementModel: cfg.managementModel || 'Hold to target, stop stays where it is',
    environmentRules: cfg.environmentRules || 'Pass messy 1H · pass between structure', newsRule: cfg.newsRule || 'No entries 5 min either side of tier-1 news',
    entryRule: cfg.entryRule || 'First valid retest after continuation', stopRule: cfg.stopRule || 'Beyond the correction extreme', targetRule: cfg.targetRule || '2R toward the 1H objective',
    hypothesis: cfg.hypothesis || '', targetRepCount: cfg.targetRepCount || 20, completedRepCount: 0, version: cfg.version || '1.0', parentStudyId: cfg.parentStudyId || null,
    startedAt: null, completedAt: null, status: 'DRAFT', kind: cfg.kind || 'STUDY', experimentId: cfg.experimentId || null,
  });
}
export function lockStudy(id) { const s = study(id); s.status = 'LOCKED'; s.startedAt = s.startedAt || Date.now(); return saveStudy(s); }
/** Changing a locked rule doesn't silently edit the study: it reports the conflict so the UI can ask. */
export function studyChange(id, patch) {
  const s = study(id);
  const changed = STUDY_RULE_FIELDS.filter((f) => patch[f] != null && patch[f] !== s[f]);
  if (s.status === 'DRAFT' || !changed.length) { Object.assign(s, patch); saveStudy(s); return { conflict: false, study: s }; }
  return { conflict: true, changed, study: s };
}
export function newStudyVersion(id, patch) {
  const s = study(id);
  const [maj, min] = String(s.version || '1.0').split('.').map(Number);
  return newStudy({ ...s, ...patch, version: `${maj}.${(min || 0) + 1}`, parentStudyId: s.studyId, title: s.title });
}

// ── PracticeRep ───────────────────────────────────────────────────────────
export const SOURCES = ['ACADEMY_CASE', 'BACKTEST', 'REPLAY', 'PAPER', 'LIVE', 'MANUAL'];
export function reps() { return store.get(K.reps, []); }
export function saveRep(rep) {
  const all = reps();
  const r = { repId: rep.repId || uid('rep'), entrySource: 'BACKTEST', methodVersionUsed: METHOD_VERSION.label, planVersion: currentPlan()?.version || null, createdAt: Date.now(), screenshots: [], violations: [], triggers: [], ...rep };
  const i = all.findIndex((x) => x.repId === r.repId);
  if (i >= 0) all[i] = r; else all.push(r);
  store.set(K.reps, all);
  if (r.studyId) { const s = study(r.studyId); if (s) { s.completedRepCount = reps().filter((x) => x.studyId === s.studyId).length; if (s.completedRepCount >= s.targetRepCount && !s.completedAt) { s.completedAt = Date.now(); s.status = 'COMPLETE'; } saveStudy(s); } }
  return r;
}
export function rep(id) { return reps().find((r) => r.repId === id) || null; }

// ── Screenshots belong to reps ────────────────────────────────────────────
export const SHOT_TAGS = ['CLEAN WINNER', 'CLEAN LOSER', 'BAD WINNER', 'BAD LOSER', 'MISSED', 'PASS', 'CHOP', 'WRONG PIL', 'EARLY ENTRY'];
export function shots() { return store.get(K.shots, []); }
export function saveShot(s) {
  const all = shots();
  const out = { shotId: s.shotId || uid('shot'), tags: [], createdAt: Date.now(), ...s };
  const i = all.findIndex((x) => x.shotId === out.shotId);
  if (i >= 0) all[i] = out; else all.push(out);
  // Uploaded images are kept small; a full library of raw screenshots would outgrow browser storage.
  store.set(K.shots, all.slice(-300));
  if (out.repId) { const r = rep(out.repId); if (r && !r.screenshots.includes(out.shotId)) { r.screenshots.push(out.shotId); saveRep(r); } }
  return out;
}

// ── TradeJournal: one list, every source ──────────────────────────────────
/** Academy case entries are mapped into the rep shape so every tool reads one format. */
export function journalEntries({ extra = [] } = {}) {
  const fromCases = practiceJournal().map((e) => ({
    repId: e.id, entrySource: 'ACADEMY_CASE', caseId: e.caseId, date: e.date, instrument: e.instrument, decision: e.participationDecision,
    outcome: e.participationDecision === 'TAKE' ? (e.outcome === 'WIN' ? 'WIN' : e.outcome === 'LOSS' ? 'LOSS' : 'OPEN') : e.missedOpportunity ? 'MISSED' : 'NO_TRADE',
    realizedR: e.rResult, setupValidity: e.setupValidity, setupQuality: e.setupQuality, violations: (e.ruleViolations || []).map((t) => ({ tag: t, category: 'ENTRY' })),
    ruleAdherence: null, studentLesson: e.studentLesson, createdAt: Date.parse(e.createdAt) || Date.now(), pil: e.pil, methodVersionUsed: e.methodVersionUsed, academy: true,
  }));
  return [...reps(), ...fromCases, ...extra].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** Server-side live journal entries (journal-service) mapped into the same shape. */
export function fromLiveJournal(e) {
  const r = e.rMultiple != null ? +e.rMultiple : null;
  return {
    repId: `live:${e.id}`, entrySource: 'LIVE', date: e.tradeDate, instrument: e.instrument, session: e.session, direction: e.direction,
    decision: 'TAKE', outcome: e.outcome ? String(e.outcome).toUpperCase() : r == null ? 'OPEN' : r > 0.05 ? 'WIN' : r < -0.05 ? 'LOSS' : 'BE',
    realizedR: r, violations: (e.ruleViolations || []).map((t) => ({ tag: String(t).toUpperCase(), category: 'ENTRY' })), ruleAdherence: e.ruleViolations ? !e.ruleViolations.length : null,
    contracts: e.contracts, entry: e.entryPrice, createdAt: Date.parse(e.tradeDate) || 0, live: true,
  };
}

// ── violations: reuse the Phase 7 vocabulary ──────────────────────────────
export const VIOLATION_TAGS = {
  ENTRY: ['EARLY ENTRY', 'WICK AS INDICATION', 'NO CONTINUATION', 'CHASED', 'WRONG PIL'],
  RISK: ['OVERSIZED', 'DAILY LIMIT', 'EXTRA TRADE'],
  MANAGEMENT: ['MOVED STOP EARLY', 'RANDOM PARTIAL', 'FEAR EXIT'],
};
// Emotional triggers are tracked, but a feeling alone is not a rule violation.
export const TRIGGERS = ['FOMO', 'REVENGE', 'HESITATION', 'FEAR', 'OVERCONFIDENCE'];
const VIOLATION_TEXT = {
  'EARLY ENTRY': 'an entry before confirmed continuation', 'NO CONTINUATION': 'an entry before confirmed continuation', CHASED: 'a chased entry',
  'WRONG PIL': 'a trade built on the wrong PIL', OVERSIZED: 'a position larger than the risk profile', 'WICK AS INDICATION': 'a wick treated as the indication',
  'DAILY LIMIT': 'a trade past the daily limit', 'EXTRA TRADE': 'a trade past the max-trades rule', 'MOVED STOP EARLY': 'a stop moved early', 'RANDOM PARTIAL': 'an unplanned partial', 'FEAR EXIT': 'an exit out of fear',
};

// ── metrics ───────────────────────────────────────────────────────────────
const executed = (e) => e.decision === 'TAKE';
const closed = (e) => executed(e) && ['WIN', 'LOSS', 'BE'].includes(e.outcome) && e.realizedR != null;

export function metrics(entries) {
  const ex = entries.filter(executed);
  const cl = entries.filter(closed);
  const wins = cl.filter((e) => e.outcome === 'WIN').length, losses = cl.filter((e) => e.outcome === 'LOSS').length, be = cl.filter((e) => e.outcome === 'BE').length;
  const Rs = cl.map((e) => +e.realizedR);
  const totalR = r2(Rs.reduce((a, b) => a + b, 0));
  let peak = 0, eq = 0, dd = 0;
  [...cl].sort((a, b) => a.createdAt - b.createdAt).forEach((e) => { eq += +e.realizedR; peak = Math.max(peak, eq); dd = Math.min(dd, eq - peak); });
  const withRule = entries.filter((e) => e.ruleAdherence === true || e.ruleAdherence === false);
  const withValidity = entries.filter((e) => e.setupValidity);
  const viol = (tag) => entries.filter((e) => (e.violations || []).some((v) => v.tag === tag)).length;
  const execWithEval = ex.filter((e) => e.executionOk === true || e.executionOk === false);
  const riskEval = ex.filter((e) => e.riskOk === true || e.riskOk === false);
  const mgmtEval = ex.filter((e) => e.mgmtOk === true || e.mgmtOk === false);
  const pct = (a, n) => (n ? Math.round((a / n) * 100) : null);
  return {
    n: entries.length, executed: ex.length, closed: cl.length, wins, losses, be,
    winRate: { value: pct(wins, cl.length), n: cl.length },
    avgR: { value: cl.length ? r2(totalR / cl.length) : null, n: cl.length },
    totalR: { value: totalR, n: cl.length },
    maxDrawdownR: { value: r2(dd), n: cl.length },
    expectancy: { value: cl.length ? r2(totalR / cl.length) : null, n: cl.length, costs: 'BEFORE TRADING COSTS' },
    // Adherence only counts entries that actually recorded it. Missing fields are not treated as adherence.
    ruleAdherence: { value: pct(withRule.filter((e) => e.ruleAdherence).length, withRule.length), n: withRule.length, sufficient: withRule.length >= 5 },
    validSetupRate: { value: pct(withValidity.filter((e) => e.setupValidity === 'VALID').length, withValidity.length), n: withValidity.length },
    executionAccuracy: { value: pct(execWithEval.filter((e) => e.executionOk).length, execWithEval.length), n: execWithEval.length },
    riskAdherence: { value: pct(riskEval.filter((e) => e.riskOk).length, riskEval.length), n: riskEval.length },
    managementAdherence: { value: pct(mgmtEval.filter((e) => e.mgmtOk).length, mgmtEval.length), n: mgmtEval.length },
    chases: viol('CHASED'), earlyEntries: viol('EARLY ENTRY') + viol('NO CONTINUATION'),
    violations: entries.reduce((a, e) => a + (e.violations || []).length, 0),
    validPasses: entries.filter((e) => e.decision === 'PASS' && e.validPass).length, missed: entries.filter((e) => e.outcome === 'MISSED' || e.decision === 'MISSED').length,
  };
}

export const EARLY_SAMPLE = 10;
export function qualityMatrix(entries) {
  const rows = ['A', 'B', 'C', 'PASS'], cols = ['WIN', 'LOSS', 'BE', 'MISSED', 'NO_TRADE'];
  return rows.map((q) => {
    const es = entries.filter((e) => e.setupQuality === q);
    const cells = Object.fromEntries(cols.map((c) => [c, es.filter((e) => (c === 'NO_TRADE' ? !executed(e) && e.outcome !== 'MISSED' : c === 'MISSED' ? e.outcome === 'MISSED' : executed(e) && e.outcome === c)).length]));
    const cl = es.filter(closed);
    return { quality: q, n: es.length, cells, avgR: cl.length ? r2(cl.reduce((a, e) => a + +e.realizedR, 0) / cl.length) : null, closed: cl.length, early: es.length < EARLY_SAMPLE };
  });
}

/** “6 of your last 20 executed setups included an entry before confirmed continuation.” Never “you lack discipline.” */
export function violationInsights(entries, lastN = 20) {
  const ex = entries.filter(executed).slice(0, lastN);
  const count = {};
  ex.forEach((e) => new Set((e.violations || []).map((v) => (v.tag === 'NO CONTINUATION' ? 'EARLY ENTRY' : v.tag))).forEach((t) => { count[t] = (count[t] || 0) + 1; }));
  const triggers = {};
  entries.forEach((e) => (e.triggers || []).forEach((t) => { triggers[t] = (triggers[t] || 0) + 1; }));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]);
  return {
    sample: ex.length, top, triggers: Object.entries(triggers).sort((a, b) => b[1] - a[1]),
    lines: top.map(([t, n]) => `${n} of your last ${ex.length} executed setups included ${VIOLATION_TEXT[t] || t.toLowerCase()}.`),
  };
}

// ── practice focus ────────────────────────────────────────────────────────
export const FOCUS_LIBRARY = {
  'WAIT FOR CONTINUATION': { measure: 'No entries before a closed continuation.', drill: 'continuation', reps: 10, category: 'EXECUTION' },
  'NO CHASE': { measure: 'Every entry within your retest zone. Missed retests are logged as MISSED.', drill: 'retest', reps: 10, category: 'EXECUTION' },
  'PIL SELECTION': { measure: 'PIL matches the 1H map on every rep.', drill: 'pil', reps: 10, category: 'PIL' },
  'RISK SIZING': { measure: 'Every position inside the saved risk profile.', drill: 'risk', reps: 10, category: 'RISK' },
  'VALID PASSES': { measure: 'Pass every setup your plan doesn’t allow, and log the pass.', drill: 'pass', reps: 10, category: 'ENVIRONMENT' },
  MANAGEMENT: { measure: 'No stop moved outside the management plan.', drill: 'manage', reps: 10, category: 'MANAGEMENT' },
  'INDICATOR INDEPENDENCE': { measure: 'Full read marked before the indicator is revealed.', drill: 'indicator', reps: 10, category: 'INDICATOR INDEPENDENCE' },
  'KEEP COLLECTING': { measure: 'Complete the planned reps with the rules unchanged.', drill: 'mixed', reps: 10, category: 'FULL BREAKDOWN' },
};
export function currentFocus() { return store.get(K.focus, []).slice(-1)[0] || null; }
export function setFocus(f) { const all = store.get(K.focus, []); const out = { ...FOCUS_LIBRARY[f.primary], ...f, setAt: Date.now() }; all.push(out); store.set(K.focus, all); return out; }

/** Recommend from observable data, with thresholds. One mistake is not a pattern. */
export function recommendFocus(entries) {
  const ex = entries.filter(executed).slice(0, 20);
  const c = (tags) => ex.filter((e) => (e.violations || []).some((v) => tags.includes(v.tag))).length;
  const pilRight = entries.filter((e) => e.pilOk === true).length, pilAll = entries.filter((e) => e.pilOk != null).length;
  const cand = [
    ['WAIT FOR CONTINUATION', c(['EARLY ENTRY', 'NO CONTINUATION']), 'early continuation entries'],
    ['NO CHASE', c(['CHASED']), 'chased entries'],
    ['PIL SELECTION', c(['WRONG PIL']), 'wrong-PIL trades'],
    ['RISK SIZING', c(['OVERSIZED']), 'oversized positions'],
    ['MANAGEMENT', c(['MOVED STOP EARLY', 'FEAR EXIT', 'RANDOM PARTIAL']), 'unplanned management actions'],
  ].sort((a, b) => b[1] - a[1]);
  if (ex.length < 5) return { focus: 'KEEP COLLECTING', evidence: `${ex.length} executed reps so far.`, reason: 'Not enough recorded reps to call a pattern yet.', strong: [] };
  const [name, n, label] = cand[0];
  const strong = [];
  if (pilAll >= 5 && pilRight / pilAll >= 0.85) strong.push(`PIL selection (${pilRight}/${pilAll})`);
  if (n >= 3) return { focus: name, evidence: `${n} ${label} in your last ${ex.length} executed reps.`, reason: strong.length ? `Your read is holding up: ${strong.join(', ')}. Your current leak is ${label.replace(/s$/, '')}.` : `Most frequent error in this sample: ${label}.`, strong };
  return { focus: 'KEEP COLLECTING', evidence: `No error shows up 3+ times in your last ${ex.length} executed reps.`, reason: 'Your process data doesn’t currently show a clear execution breakdown. Keep collecting evidence before making a major rule change.', strong };
}

// ── reviews ───────────────────────────────────────────────────────────────
export function within(entries, from, to) { return entries.filter((e) => (e.createdAt || 0) >= from && (e.createdAt || 0) < to); }
export function weekBounds(t = Date.now()) { const d = new Date(t); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; const from = d.getTime() - day * 864e5; return { from, to: from + 7 * 864e5 }; }
export function weeklySummary(entries, t = Date.now()) {
  const { from, to } = weekBounds(t);
  const es = within(entries, from, to);
  const m = metrics(es);
  const setups = Object.fromEntries(['A', 'B', 'C', 'PASS'].map((q) => [q, es.filter((e) => e.setupQuality === q).length]));
  const vi = violationInsights(es, 50);
  return { from, to, entries: es, m, setups, passes: es.filter((e) => e.decision === 'PASS').length, topViolation: vi.top[0] || null, topTrigger: vi.triggers[0] || null, extraTrades: es.filter((e) => (e.violations || []).some((v) => v.tag === 'EXTRA TRADE')).length };
}
export function weeklyReviews() { return store.get(K.weekly, []); }
export function saveWeeklyReview(w) { const all = weeklyReviews(); all.push({ ...w, savedAt: Date.now() }); store.set(K.weekly, all); return w; }
export function monthlyReviews() { return store.get(K.monthly, []); }
export function saveMonthlyReview(m) { const all = monthlyReviews(); all.push({ ...m, savedAt: Date.now() }); store.set(K.monthly, all); return m; }
export function monthlySummary(entries, t = Date.now()) {
  const d = new Date(t); const from = new Date(d.getFullYear(), d.getMonth(), 1).getTime(); const to = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
  const es = within(entries, from, to);
  const by = (key) => { const g = {}; es.forEach((e) => { const k = e[key] || 'unknown'; (g[k] = g[k] || []).push(e); }); return Object.entries(g).map(([k, v]) => ({ key: k, ...metrics(v) })); };
  const days = {}; es.filter(closed).forEach((e) => { const k = new Date(e.createdAt).toDateString(); days[k] = (days[k] || 0) + +e.realizedR; });
  const worst = Object.entries(days).sort((a, b) => a[1] - b[1])[0] || null;
  const sizes = es.filter(executed).map((e) => +e.contracts || 1);
  return { from, to, entries: es, m: metrics(es), byEnv: by('environment'), byQuality: by('setupQuality'), byDir: by('direction'), bySession: by('session'), worstDay: worst, sizeConsistency: sizes.length ? { min: Math.min(...sizes), max: Math.max(...sizes), n: sizes.length } : null, violations: violationInsights(es, 100) };
}

// ── strategy problem or trader problem? ───────────────────────────────────
export function diagnose(entries) {
  const ex = entries.filter(executed);
  const n = ex.length;
  const share = (pred) => (n ? ex.filter(pred).length / n : 0);
  const has = (e, tags) => (e.violations || []).some((v) => tags.includes(v.tag));
  const steps = [
    { q: 'Did you follow the method?', look: 'PIL · I-C-C · retest · entry', bad: share((e) => has(e, ['EARLY ENTRY', 'NO CONTINUATION', 'CHASED', 'WRONG PIL', 'WICK AS INDICATION'])), area: 'EXECUTION' },
    { q: 'Did you take the setups your plan actually allows?', look: 'quality · environment · session · news · rulebook', bad: share((e) => e.setupQuality === 'C' || e.setupQuality === 'PASS' || has(e, ['DAILY LIMIT', 'EXTRA TRADE'])), area: 'SELECTION' },
    { q: 'Was risk consistent?', look: 'size · stop distance · daily exposure', bad: share((e) => has(e, ['OVERSIZED'])), area: 'RISK' },
    { q: 'Was management consistent?', look: 'stops · partials · exits', bad: share((e) => has(e, ['MOVED STOP EARLY', 'RANDOM PARTIAL', 'FEAR EXIT'])), area: 'MANAGEMENT' },
  ];
  const clean = ex.filter((e) => !(e.violations || []).length && ['A', 'B'].includes(e.setupQuality));
  const cm = metrics(clean);
  const flagged = steps.find((s) => s.bad >= 0.2);
  let verdict;
  if (n < 10) verdict = 'INSUFFICIENT DATA';
  else if (flagged) verdict = flagged.area;
  else if (clean.length >= 20 && (cm.avgR.value ?? 0) <= 0) verdict = 'STRATEGY RESEARCH WARRANTED';
  else if (clean.length < 20) verdict = 'INSUFFICIENT DATA';
  else verdict = 'NO CLEAR PROBLEM';
  return { n, steps: steps.map((s) => ({ ...s, pct: Math.round(s.bad * 100), flagged: s.bad >= 0.2 })), clean: { n: clean.length, avgR: cm.avgR.value }, verdict };
}
export const VERDICT_TEXT = {
  EXECUTION: 'Current evidence points most strongly toward EXECUTION. Look at entries before changing the strategy.',
  SELECTION: 'Current evidence points most strongly toward SELECTION: setups your plan doesn’t allow.',
  RISK: 'Current evidence points most strongly toward RISK: size and exposure weren’t consistent.',
  MANAGEMENT: 'Current evidence points most strongly toward MANAGEMENT.',
  'INSUFFICIENT DATA': 'Not enough recorded, rule-following reps to draw a conclusion. Keep collecting.',
  'STRATEGY RESEARCH WARRANTED': 'You followed your rules across a meaningful sample and the concern remains. Strategy research may be warranted.',
  'NO CLEAR PROBLEM': 'Your process data doesn’t show a clear breakdown. Continue collecting evidence before a major change.',
};

// ── RuleChangeExperiment ──────────────────────────────────────────────────
export function experiments() { return store.get(K.experiments, []); }
export function proposeChange(x) {
  const all = experiments();
  const exp = { expId: uid('exp'), status: 'PROPOSED', result: null, decision: null, createdAt: Date.now(), ...x };
  const cur = newStudy({ title: `Control · ${x.currentRule}`, hypothesis: x.hypothesis, kind: 'RESEARCH', experimentId: exp.expId, targetRepCount: x.sampleSize || 30 });
  const alt = newStudy({ title: `Test · ${x.proposedRule}`, hypothesis: x.hypothesis, kind: 'RESEARCH', experimentId: exp.expId, targetRepCount: x.sampleSize || 30, [x.field || 'stopRule']: x.proposedRule });
  lockStudy(cur.studyId); lockStudy(alt.studyId);
  exp.controlStudyId = cur.studyId; exp.newStudyId = alt.studyId; exp.status = 'TESTING';
  all.push(exp); store.set(K.experiments, all); return exp;
}

// ── TradingPlan + versions ────────────────────────────────────────────────
export const METHOD_DEFINITIONS = {
  topDown: [['4H', 'READ THE ROOM', 'External range, structure, location, HTF ICC.'], ['1H', 'BUILD THE MAP', 'Relevant swings, MSS, the level that gives the PIL its context.'], ['15M', 'OBSERVE', 'Correcting, sweeping, consolidating, continuing or changing.'], ['1M', 'EXECUTE', 'PIL, indication, correction, continuation, retest, entry.']],
  icc: [['PIL', 'The level the pullback came from. No PIL, nothing to wait for.'], ['Indication', 'A candle CLOSE through the PIL. A wick is not an indication.'], ['Correction', 'After indication, price pulls back toward the PIL.'], ['Continuation', 'A close beyond the indication’s extreme confirms the move.'], ['Retest', 'The first valid retest of the PIL after continuation.'], ['Entry', 'On the retest. If the model doesn’t give the entry, there is no entry.'], ['Reset', 'If the sequence breaks, start over at the PIL. No invented entries.']],
};
export function plans() { return store.get(K.plan, []); }
export function currentPlan() { return plans().slice(-1)[0] || null; }

/** Assemble the plan from what she already built. Personal fields stay editable; method fields don't. */
export function assemblePlan({ rulebook, risk, entries = [] } = {}) {
  const rb = rulebook || {}; const rp = risk || {};
  const focus = currentFocus();
  const nn = (rb.nonNegotiables || []).map((x) => (typeof x === 'string' ? x : x.text || x.title)).filter(Boolean);
  return {
    market: { instruments: rp.instrument || 'MNQ', session: rb.sessionRule ? `${rb.sessionRule.start}–${rb.sessionRule.end}` : '', notes: '' },
    topDown: { method: METHOD_DEFINITIONS.topDown, notes: '' },
    icc: { method: METHOD_DEFINITIONS.icc, notes: '' },
    risk: { riskPerTrade: rb.risk?.riskPerTrade || (rp.riskPerTradeLimit ? `$${rp.riskPerTradeLimit}` : ''), sizing: 'Contracts come from the stop distance and the risk per trade.', dailyMax: rb.risk?.dailyMax || (rp.dailyLossLimitDollar ? `$${rp.dailyLossLimitDollar}` : ''), maxTrades: rb.risk?.maxTrades || rp.maxTradesPerDay || '', targetModel: rp.targetModelPoints ? `${rp.targetModelPoints} pts` : '2R toward the 1H objective' },
    environment: { news: rb.newsRule ? (rb.newsRule.text || `${rb.newsRule.before || ''} min before / ${rb.newsRule.after || ''} min after`) : '', consolidation: rb.environmentRule?.text || '', window: rb.sessionRule ? `${rb.sessionRule.start}–${rb.sessionRule.end}` : '', passConditions: '' },
    nonNegotiables: nn.length ? nn.slice(0, 5) : ['', '', '', '', ''],
    management: { stop: '', profit: '', breakeven: '' },
    review: { journalFields: 'Trade · setup · execution · mindset · review', weekly: 'Every weekend: numbers, setups, behavior, ONE focus', monthly: 'First weekend of the month: patterns, rule-change requests', evidence: 'A rule changes only after a tested hypothesis.' },
    practice: { routine: '10 replay reps per week minimum', sampleSize: entries.filter((e) => e.entrySource === 'BACKTEST' || e.entrySource === 'REPLAY').length, focus: focus?.primary || '', ruleChanges: 'Proposed in review → research study → new plan version' },
    behavior: rb.behavior || {},
  };
}
export function planConflicts(plan) {
  const out = [];
  const mt = parseInt(plan.risk?.maxTrades, 10);
  const beh = Object.values(plan.behavior || {}).join(' ').toLowerCase() + ' ' + (plan.nonNegotiables || []).join(' ').toLowerCase();
  if (mt && /third|3rd|another trade|one more|keep trading/.test(beh)) out.push(`MAX TRADES is ${mt}, but a behavior rule allows another trade. These conflict.`);
  if (plan.environment?.news && plan.environment?.window && /all session|no news rule/.test(plan.environment.news.toLowerCase())) out.push('Your news rule and your session window disagree.');
  if (!plan.risk?.riskPerTrade) out.push('Risk per trade is not defined.');
  if (!plan.risk?.dailyMax) out.push('Daily max loss is not defined.');
  if ((plan.nonNegotiables || []).filter((x) => String(x).trim()).length < 5) out.push('Fewer than five non-negotiables.');
  if (!plan.management?.stop) out.push('Stop management is not defined.');
  return out;
}
export function lockPlan(plan, reason = 'First locked plan') {
  const all = plans();
  const last = all[all.length - 1];
  const version = !last ? '1.0' : reason.startsWith('MAJOR') ? `${parseInt(last.version, 10) + 1}.0` : `${parseInt(last.version, 10)}.${(+last.version.split('.')[1] || 0) + 1}`;
  const v = { version, lockedAt: Date.now(), reason, plan, methodVersion: METHOD_VERSION.label };
  all.push(v); store.set(K.plan, all); return v;
}

// ── curriculum, capstone, alumni ──────────────────────────────────────────
export function curriculumComplete() { try { return localStorage.getItem('aghf_section_clear:p8-s22') === 'true'; } catch { return false; } }
export function capstoneAttempts() { return store.get(K.capstone, []); }
export function saveCapstoneAttempt(a) { const all = capstoneAttempts(); all.push({ attemptId: uid('cap'), at: Date.now(), ...a }); store.set(K.capstone, all); return all[all.length - 1]; }
export function graduated() { return !!store.get(K.alumni, null); }
export function alumni() { return store.get(K.alumni, null); }
export function graduate(profile) { return store.set(K.alumni, { graduatedAt: Date.now(), ...profile }); }
export function academyStatus() { return graduated() ? 'GRADUATED' : curriculumComplete() ? 'CAPSTONE READY' : 'IN PROGRESS'; }
export function saveReflections(r) { return store.set(K.reflections, { ...r, savedAt: Date.now() }); }
export function reflections() { return store.get(K.reflections, null); }

/** Capstone pass standard: no critical method violations, risk inside constraints, process-based review. Profit is informational. */
export function scoreCapstone(a) {
  const parts = ['analysis', 'execution', 'risk', 'management', 'ruleAdherence', 'review'];
  const crit = a.critical || [];
  const weak = parts.filter((p) => a.scores?.[p] === 'REVIEW');
  const pass = !crit.length && !weak.some((p) => ['execution', 'risk', 'ruleAdherence'].includes(p)) && weak.length <= 1;
  const strong = parts.filter((p) => a.scores?.[p] === 'STRONG');
  return { pass, crit, weak, strong };
}
