/**
 * Phase 8 · Trade case core (no DOM).
 *
 * TradeCaseFile · OutcomeLock · BreakdownTimeline · TradeReportCard · ReasoningDiff ·
 * PracticeJournalEntry · RecommendedCases.
 *
 * The rule this module protects: nothing after the replay cursor reaches the screen
 * before the read is locked. Higher timeframes are never stored past the start of the
 * 1M session. Their forming candles are rebuilt here from the 1M bars the student can
 * see, so a 4H, 1H or 15M candle can't leak a future high or low either.
 */

export const TF_LIST = ['4H', '1H', '15M', '1M'];
export const TF_MIN = { '4H': 240, '1H': 60, '15M': 15, '1M': 1 };

export const STAGES = [
  { key: '4H', label: '4H ROOM', verb: 'READ THE ROOM' },
  { key: '1H', label: '1H MAP', verb: 'BUILD THE MAP' },
  { key: '15M', label: '15M OBSERVE', verb: 'OBSERVE' },
  { key: '1M', label: '1M EXECUTE', verb: 'EXECUTE' },
  { key: 'RISK', label: 'RISK', verb: 'PROTECT' },
  { key: 'MGMT', label: 'MANAGEMENT', verb: 'MANAGE' },
  { key: 'OUTCOME', label: 'OUTCOME', verb: 'REVEAL' },
];

export const CASE_TYPES = {
  VALID_WIN: 'Valid winner', VALID_LOSS: 'Valid loser', INVALID_WIN: 'Bad-process winner', INVALID_LOSS: 'Bad-process loser',
  VALID_PASS: 'Valid pass', MISSED_TRADE: 'Missed trade', WRONG_PIL: 'Wrong PIL', RIGHT_DIRECTION_WRONG_EXECUTION: 'Right read, wrong execution',
  MESSY_ENVIRONMENT: 'Messy environment', FULL_INDEPENDENT: 'Independent breakdown', INDICATOR_OFF: 'Indicator off',
};

export const ENTRY_SOURCES = ['ACADEMY_CASE', 'BACKTEST', 'REPLAY', 'PAPER', 'LIVE', 'MANUAL'];

// Educational markup, not a charting platform. kind: level (a price) or candle (a bar).
export const MARKS = {
  EXTERNAL_HIGH: { label: 'External high', short: 'EXT H', kind: 'level', tf: '4H' },
  EXTERNAL_LOW: { label: 'External low', short: 'EXT L', kind: 'level', tf: '4H' },
  // Swing highs/lows go on the 4H (Dayli ICC) or the 1H (Supply & Demand): either one.
  SWING_HIGH: { label: 'Swing high', short: 'SH', kind: 'level', tf: '1H', tfs: ['4H', '1H'] },
  SWING_LOW: { label: 'Swing low', short: 'SL', kind: 'level', tf: '1H', tfs: ['4H', '1H'] },
  MSS: { label: 'MSS', short: 'MSS', kind: 'level', tf: '1H' },
  OBJECTIVE: { label: 'Objective', short: 'OBJ', kind: 'level', tf: '1H' },
  // The PIL is marked on the 4H, the 1H, or both, and carries down to every lower timeframe.
  PIL: { label: 'PIL', short: 'PIL', kind: 'level', tf: '1M', tfs: ['4H', '1H'], carries: true },
  INDICATION: { label: 'Indication', short: 'I', kind: 'candle', tf: '1M' },
  CORRECTION: { label: 'Correction', short: 'C', kind: 'candle', tf: '1M' },
  CONTINUATION: { label: 'Continuation', short: 'C', kind: 'candle', tf: '1M' },
  RETEST: { label: 'Retest', short: 'R', kind: 'candle', tf: '1M' },
  ENTRY: { label: 'Entry', short: 'ENTRY', kind: 'level', tf: '1M' },
  STOP: { label: 'Stop', short: 'STOP', kind: 'level', tf: '1M' },
  TARGET: { label: 'Target', short: 'TP', kind: 'level', tf: '1M' },
};

export const GRADES = ['A', 'B', 'C', 'F'];
export const VALIDITY = ['VALID', 'INVALID', 'INCOMPLETE'];
export const QUALITY = ['A', 'B', 'C', 'PASS'];
export const DECISIONS = ['TAKE', 'WAIT', 'PASS'];
export const CONFIDENCE = ['NOT SURE', 'LEANING', 'CONFIDENT'];
export const POINT_VALUE = { MNQ: 2, NQ: 20, MES: 5, ES: 50 };

const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const q4 = (x) => Math.round(x * 4) / 4;

// ── time ──────────────────────────────────────────────────────────────────
export function clock(c, i) {
  const [h, m] = (c.sessionStart || '09:30').split(':').map(Number);
  const t = h * 60 + m + i;
  const hh = Math.floor(t / 60), mm = t % 60;
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
}

// ── timeframes ────────────────────────────────────────────────────────────
export function aggregate(bars, minutes) {
  const out = [];
  for (let i = 0; i < bars.length; i += minutes) {
    const g = bars.slice(i, i + minutes);
    out.push({ o: g[0].o, h: Math.max(...g.map((b) => b.h)), l: Math.min(...g.map((b) => b.l)), c: g[g.length - 1].c, forming: g.length < minutes, from: i });
  }
  return out;
}

/** The bars of one timeframe as they looked with `cursor` 1M bars closed. */
export function visibleBars(c, tf, cursor) {
  const m1 = c.m1.slice(0, Math.max(0, cursor));
  if (tf === '1M') return m1.map((b, i) => ({ ...b, i }));
  const hist = (c.tf?.[tf] || []).map((b) => ({ ...b }));
  return hist.concat(m1.length ? aggregate(m1, TF_MIN[tf]) : []).map((b, i) => ({ ...b, i }));
}

// ── OutcomeLock ───────────────────────────────────────────────────────────
export class OutcomeLock {
  constructor(c) {
    this.c = c;
    this.outcomeHidden = true;
    this.cursor = c.replayStart ?? Math.min(c.decisionIndex + 1, 8);
  }
  /** The furthest 1M bar the student may see: the decision bar while locked, everything after release. */
  get max() { return this.outcomeHidden ? this.c.decisionIndex + 1 : this.c.m1.length; }
  get atDecision() { return this.cursor >= this.c.decisionIndex + 1; }
  set(k) { const want = Math.round(k); this.cursor = Math.max(1, Math.min(want, this.max)); return want <= this.max; }
  step(d = 1) { return this.set(this.cursor + d); }
  bars(tf, cursor = this.cursor) { return visibleBars(this.c, tf, Math.min(cursor, this.max)); }
  release() { this.outcomeHidden = false; }
  /** Outcome facts only exist once the lock is released. */
  outcome() { return this.outcomeHidden ? null : this.c.outcome; }
}

// ── markup comparison ─────────────────────────────────────────────────────
export function tolerance(c, tf) {
  const u = c.u || 6;
  return { '4H': 6 * u, '1H': 2.5 * u, '15M': 1.2 * u, '1M': 0.7 * u }[tf];
}

/** Compare student marks with the expert's marks for the given types. */
export function compareMarks(c, student, expert, types) {
  const out = [];
  types.forEach((type) => {
    const def = MARKS[type];
    const mine = student.filter((m) => m.type === type);
    const theirs = expert.filter((m) => m.type === type);
    // A mark is judged at the precision of the chart it was drawn on.
    const tolOf = (m) => Math.max(tolerance(c, def.tf), tolerance(c, m.tf || def.tf) || 0);
    if (!theirs.length && !mine.length) return;
    if (!theirs.length) { mine.forEach((m) => out.push({ type, status: 'EXTRA', mine: m })); return; }
    theirs.forEach((e) => {
      if (!mine.length) { out.push({ type, status: 'MISSED', expert: e }); return; }
      const near = (m, ref) => (def.kind === 'level' ? Math.abs(m.price - ref.price) <= tolOf(m) : Math.abs(m.index - ref.index) <= 1);
      const hit = mine.find((m) => near(m, e));
      if (hit) { out.push({ type, status: 'MATCHED', mine: hit, expert: e }); return; }
      const alt = (e.alt || []).map((a) => ({ ...e, ...a })).find((a) => mine.some((m) => near(m, a)));
      if (alt) { out.push({ type, status: 'NEEDS REVIEW', mine: mine[0], expert: e, why: alt.why }); return; }
      out.push({ type, status: 'DIFFERED', mine: mine[0], expert: e });
    });
  });
  return out;
}

export function compareChoice(ask, mine) {
  if (mine == null) return 'MISSED';
  if (mine === ask.expert) return 'MATCHED';
  if ((ask.alt || []).includes(mine)) return 'NEEDS REVIEW';
  return 'DIFFERED';
}

// ── ReasoningDiff ─────────────────────────────────────────────────────────
/** Every comparison the case review shows, in breakdown order, outcome last. */
export function reasoningDiff(c, rec) {
  const ex = c.expert || {};
  const rows = [];
  (c.steps || []).forEach((st) => {
    if (st.t === 'read' || st.t === 'replay') {
      compareMarks(c, rec.marks || [], ex.marks || [], st.marks || []).forEach((r) => rows.push({ stage: st.stage || st.tf, ...r, label: MARKS[r.type].label }));
      (st.asks || []).forEach((a) => {
        const mine = rec.asks?.[a.key];
        rows.push({ stage: st.stage || st.tf, type: a.key, label: a.short || a.q, status: compareChoice(a, mine), mineLabel: optLabel(a, mine), expertLabel: optLabel(a, a.expert), why: a.why });
      });
    }
  });
  if (ex.idealDecision) {
    const mine = rec.decision?.choice;
    rows.push({ stage: 'DECISION', type: 'decision', label: 'Participation decision', status: compareChoice({ expert: ex.idealDecision, alt: ex.altDecisions }, mine), mineLabel: mine || '·', expertLabel: ex.idealDecision, why: ex.decisionWhy });
  }
  if (rec.decision?.choice === 'TAKE' && ex.risk) {
    const tol = tolerance(c, '1M');
    const okStop = Math.abs((rec.decision.stop ?? NaN) - ex.risk.stop) <= tol;
    rows.push({ stage: 'RISK', type: 'stop', label: 'Stop placement', status: okStop ? 'MATCHED' : 'DIFFERED', mineLabel: rec.decision.stop, expertLabel: ex.risk.stop, why: ex.risk.why });
  }
  if (ex.management && rec.mgmt) rows.push({ stage: 'MGMT', type: 'mgmt', label: 'Management plan', status: rec.mgmt === ex.management ? 'MATCHED' : 'NEEDS REVIEW', mineLabel: rec.mgmt, expertLabel: ex.management, why: ex.managementWhy });
  return rows;
}

function optLabel(a, v) {
  const o = (a.options || []).find((x) => (Array.isArray(x) ? x[0] : x) === v);
  return o ? (Array.isArray(o) ? o[1] : o) : (v ?? '·');
}

export const DIFF_TONE = { MATCHED: 'ok', DIFFERED: 'warn', MISSED: 'miss', EXTRA: 'extra', 'NEEDS REVIEW': 'review' };
export const DIFF_LABEL = { MATCHED: 'MATCHED', DIFFERED: 'YOUR READ DIFFERED', MISSED: 'MISSED', EXTRA: 'EXTRA ASSUMPTION', 'NEEDS REVIEW': 'NEEDS REVIEW' };

// ── TradeReportCard ───────────────────────────────────────────────────────
export function reportCard(c, rec) {
  const ex = c.expert || {};
  const g = rec.grades || {};
  const dims = ['analysis', 'execution', 'risk', 'management'];
  return {
    caseId: c.id,
    dims: dims.map((d) => ({ key: d, label: d[0].toUpperCase() + d.slice(1), mine: g[d] || null, expert: ex.grades?.[d] || null, reasons: ex.reasons?.[d] || '' })),
    setupValidity: { mine: g.validity || null, expert: ex.setupValidity },
    setupQuality: { mine: g.quality || null, expert: ex.setupQuality },
    ruleAdherence: ex.ruleAdherence,
    participationDecision: rec.decision?.choice || null,
    outcome: c.outcome?.type, rResult: c.outcome?.r,
    lesson: rec.lesson || '', expertLesson: ex.lesson,
  };
}

// ── PracticeJournalEntry: the breakdown IS the journal entry ──────────────
export function journalEntry(c, rec, source = 'ACADEMY_CASE') {
  const ex = c.expert || {};
  const mark = (t) => (rec.marks || []).find((m) => m.type === t);
  const icc = ['INDICATION', 'CORRECTION', 'CONTINUATION', 'RETEST'].map((t) => (mark(t) ? `${MARKS[t].label} @ ${clock(c, mark(t).index)}` : null)).filter(Boolean);
  const diffs = reasoningDiff(c, rec).filter((r) => r.status !== 'MATCHED').map((r) => `${r.stage}: ${r.label} (${DIFF_LABEL[r.status]})`);
  return {
    id: `${source}:${c.id}:${rec.lockedAt || Date.now()}`,
    entrySource: source, caseId: c.id, caseType: c.caseType, date: c.historicalDate, instrument: c.instrument || 'MNQ',
    methodVersionUsed: c.methodVersion || 'Dayli ICC 1.0',
    read4h: rec.asks?.thesis4h ?? rec.asks?.location ?? null, read1h: rec.asks?.map1h ?? null, observation15m: rec.asks?.obs15 ?? null,
    pil: mark('PIL')?.price ?? null, iccSequence: icc,
    participationDecision: rec.decision?.choice || null,
    risk: rec.decision?.choice === 'TAKE' ? { entry: rec.decision.entry, stop: rec.decision.stop, target: rec.decision.target, contracts: rec.decision.contracts } : null,
    management: rec.mgmt || null,
    setupValidity: rec.grades?.validity || null, setupQuality: rec.grades?.quality || null,
    analysisGrade: rec.grades?.analysis || null, executionGrade: rec.grades?.execution || null, riskGrade: rec.grades?.risk || null, managementGrade: rec.grades?.management || null,
    outcome: c.outcome?.type || null, rResult: rec.decision?.choice === 'TAKE' ? c.outcome?.r ?? null : null,
    ruleViolations: ex.violations || [], missedOpportunity: c.caseType === 'MISSED_TRADE', validPass: rec.decision?.choice === 'PASS' && ex.idealDecision === 'PASS',
    confidence: rec.confidence || null, studentLesson: rec.lesson || '', expertDifferences: diffs, reassess: rec.reassess || [],
    screenshotRefs: [`case:${c.id}:decision`, `case:${c.id}:outcome`],
    createdAt: new Date().toISOString(),
  };
}

export function practiceJournal() { return read('aghf_practice_journal', []); }
export function savePracticeEntry(e) {
  const all = practiceJournal().filter((x) => x.id !== e.id && !(x.entrySource === e.entrySource && x.caseId === e.caseId && e.entrySource === 'ACADEMY_CASE'));
  all.push(e); write('aghf_practice_journal', all); return e;
}

// ── case records: the original read is never overwritten ─────────────────
export function caseRecords() { return read('aghf_p8_cases', {}); }
export function caseRecord(id) { return caseRecords()[id] || null; }
export function saveCaseRecord(id, rec) {
  const all = caseRecords();
  const prev = all[id];
  // TEST 13: once locked, the original read is preserved. Later edits go to reflection.
  if (prev?.original && rec.original && prev.lockedAt === rec.lockedAt) rec = { ...rec, original: prev.original };
  all[id] = { ...rec, savedAt: Date.now() };
  write('aghf_p8_cases', all);
  return all[id];
}

// ── observed academy data, never invented ─────────────────────────────────
export function p8Stats() { return read('aghf_p8_stats', {}); }
export function trackP8(key, n = 1) { const s = p8Stats(); s[key] = (s[key] || 0) + n; write('aghf_p8_stats', s); }

/** Score the record against the expert and log the patterns the case queue uses. */
export function trackCase(c, rec) {
  const diff = reasoningDiff(c, rec);
  const row = (t) => diff.find((r) => r.type === t);
  if (row('PIL')) trackP8(row('PIL').status === 'MATCHED' || row('PIL').status === 'NEEDS REVIEW' ? 'pilRight' : 'pilWrong');
  ['INDICATION', 'CORRECTION', 'CONTINUATION', 'RETEST'].forEach((t) => { if (row(t)) trackP8(row(t).status === 'MATCHED' ? 'iccRight' : 'iccWrong'); });
  const d = row('decision');
  if (d) {
    trackP8(d.status === 'MATCHED' || d.status === 'NEEDS REVIEW' ? 'decisionRight' : 'decisionWrong');
    if (c.expert?.idealDecision === 'PASS') trackP8(rec.decision?.choice === 'PASS' ? 'validPassRight' : 'validPassMissed');
    if (c.expert?.idealDecision !== 'TAKE' && rec.decision?.choice === 'TAKE') trackP8('tookInvalid');
    if (rec.confidence === 'CONFIDENT' && d.status === 'DIFFERED') trackP8('highConfWrong');
    if (rec.confidence === 'NOT SURE' && d.status === 'MATCHED') trackP8('lowConfRight');
  }
  return diff;
}

export const CATEGORIES = ['STRUCTURE', 'PIL', 'ICC SEQUENCE', 'EXECUTION', 'RISK', 'MANAGEMENT', 'ENVIRONMENT', 'MINDSET', 'INDICATOR INDEPENDENCE', 'FULL BREAKDOWN'];

/** Order cases by what her own Academy history says she needs. Every case stays open. */
export function recommendedCases(cases) {
  const s = p8Stats(); const recs = caseRecords();
  const weight = {
    PIL: (s.pilWrong || 0) * 3, STRUCTURE: (s.pilWrong || 0) * 2, 'ICC SEQUENCE': (s.iccWrong || 0),
    EXECUTION: (s.tookInvalid || 0) * 3 + (s.chase || 0) * 3, MINDSET: (s.lossGradedBad || 0) * 3 + (s.badWinnerExcused || 0) * 3,
    ENVIRONMENT: (s.validPassMissed || 0) * 2, 'INDICATOR INDEPENDENCE': (s.indicatorDependence || 0) * 3,
  };
  return cases.map((cs, i) => {
    const done = !!recs[cs.id]?.completedAt;
    const w = (cs.categories || []).reduce((a, k) => a + (weight[k] || 0), 0);
    const why = (cs.categories || []).filter((k) => weight[k]).map((k) => k.toLowerCase());
    return { ...cs, done, score: (done ? -100 : 0) + w - i * 0.01, why };
  }).sort((a, b) => b.score - a.score);
}

export function indicatorAssist() { return read('aghf_p8_settings', {}).indicatorAssist || 'AFTER'; }
export function setIndicatorAssist(v) { const s = read('aghf_p8_settings', {}); s.indicatorAssist = v; write('aghf_p8_settings', s); }

// ── risk math for the decision form ───────────────────────────────────────
export function riskOf(c, d) {
  const pv = POINT_VALUE[c.instrument || 'MNQ'] || 2;
  const long = c.dir !== 'short';
  const pts = Math.abs(d.entry - d.stop);
  const reward = Math.abs(d.target - d.entry);
  const sane = long ? d.stop < d.entry && d.target > d.entry : d.stop > d.entry && d.target < d.entry;
  return { pts: q4(pts), dollars: Math.round(pts * pv * (d.contracts || 1)), rr: pts ? Math.round((reward / pts) * 100) / 100 : 0, sane };
}
