/**
 * rules-core.js — A Girl & Her Futures™
 *
 * Phase 7 · Section 2 · Rules That Protect You. Awareness becomes an operating
 * system: MY AGHF RULEBOOK.
 *
 *   THE AGHF DECISION HIERARCHY
 *   1. Does the STRATEGY allow it?        (is the Dayli ICC setup actually valid?)
 *   2. Does my ACCOUNT allow it?          (risk fits? daily stop? size?)
 *   3. Does my PERSONAL RULEBOOK allow it? (session, news, max trades, no chase, environment)
 *   4. EXECUTE or PASS.
 *
 * SETUP VALIDITY and PARTICIPATION ELIGIBILITY are separate concepts and are never
 * combined. A valid setup can be off-limits; personal eligibility can never make
 * an invalid setup valid. This is an educational decision framework built from
 * curriculum-defined and student-defined rules. It is NOT a trading signal.
 *
 * Rules have a SOURCE:
 *   method   defined by the Dayli ICC model (not casually rewritable and still "Dayli ICC")
 *   student  defined by her (revisable during structured review, never mid-session)
 * Status labels: METHOD RULE · MY RULE · NON-NEGOTIABLE · UNDER REVIEW. Never "good"/"bad".
 *
 * Nothing here invents a student's personal rules, prescribes a universal number of
 * trades, daily loss, news blackout or consolidation rule, or hardcodes prop-firm rules.
 * The student's rulebook is private, student-owned data (this browser only).
 *
 * Stores: aghf_rulebook · aghf_rule_queue · aghf_rule_history · aghf_rule_violations ·
 *         aghf_trigger_responses · sessionStorage aghf_rulebook_mode · aghf_p7r_session
 */

const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

export const CATEGORIES = [
  { key: 'method', label: 'MY DAYLI ICC RULES', short: 'Dayli ICC' },
  { key: 'risk', label: 'MY RISK RULES', short: 'Risk' },
  { key: 'session', label: 'MY SESSION RULES', short: 'Session' },
  { key: 'environment', label: 'MY ENVIRONMENT RULES', short: 'Environment' },
  { key: 'behavior', label: 'MY BEHAVIOR RULES', short: 'Behavior' },
];
export const STATUS = { METHOD: 'METHOD RULE', MINE: 'MY RULE', NONNEG: 'NON-NEGOTIABLE', REVIEW: 'UNDER REVIEW' };

/* The Dayli ICC non-negotiables, prefilled from the method. Not recreated from memory. */
export const METHOD_RULES = [
  { id: 'm-pil', title: 'Correct PIL', ruleText: 'The PIL is the level the pullback came from. No PIL, nothing to wait for.' },
  { id: 'm-ind', title: 'Candle-close Indication', ruleText: 'Indication requires a candle CLOSE through the PIL. A wick is not an indication.' },
  { id: 'm-cor', title: 'Correction', ruleText: 'After Indication, price must close back through the PIL: the Correction.' },
  { id: 'm-con', title: 'Continuation', ruleText: 'Continuation requires a close back through the PIL after the Correction.' },
  { id: 'm-ret', title: 'Valid retest', ruleText: 'The entry is the first valid retest of the PIL after Continuation.' },
  { id: 'm-inv', title: 'No invented entry', ruleText: 'If the model doesn’t give the entry, there is no entry.' },
  { id: 'm-re', title: 'Reassess structural change', ruleText: 'When structure changes, the old setup is reassessed, not forced.' },
].map((r) => ({ ...r, category: 'method', source: 'method', isStrategyRule: true, isPersonalRule: false, isNonNegotiable: false, active: true, trigger: null, requiredResponse: null }));

export function emptyRulebook() {
  return {
    version: 1, rules: [], nonNegotiables: [],
    risk: { riskPerTrade: '', dailyMax: '', maxTrades: '', maxSize: '' },
    dailyStop: null,          // { r, dollars, losses, trades, logic: 'first' }
    newsRule: null,           // NewsRule, or null = NEWS RESPONSE NOT DEFINED
    sessionRule: null,        // { start, end }
    environmentRule: null,    // { text, blocks: ['tight-consolidation', …] }
    noChase: null,            // a rule text
    behavior: {},             // { missTrade, lose, winBig, fomo, revenge, hesitate, breakRule }
    afterViolation: '',
    savedAt: null,
  };
}
export function loadRulebook() {
  const rb = read('aghf_rulebook', null);
  return rb ? { ...emptyRulebook(), ...rb } : null;
}
export function hasRulebook() { return !!read('aghf_rulebook', null); }

/** Save, always keeping the method rules present and untouched. */
export function saveRulebook(rb) {
  const now = Date.now();
  const personal = (rb.rules || []).filter((r) => r.source !== 'method');
  const out = { ...emptyRulebook(), ...rb, rules: [...METHOD_RULES, ...personal], savedAt: now };
  write('aghf_rulebook', out);
  return out;
}

/** A starting draft: method rules + whatever she already saved in Phase 6 (never typed twice). */
export function draftRulebook() {
  const rb = loadRulebook() || emptyRulebook();
  const rp = read('aghf_risk_profile', null);
  if (rp) {
    const money = (v) => (v || v === 0 ? `$${v}` : '');
    rb.risk = {
      riskPerTrade: rb.risk.riskPerTrade || [money(rp.riskPerTradeLimit), rp.riskPerTradeR ? `${rp.riskPerTradeR}R` : ''].filter(Boolean).join(' · '),
      dailyMax: rb.risk.dailyMax || [money(rp.dailyLossLimitDollar), rp.dailyLossLimitR ? `${rp.dailyLossLimitR}R` : ''].filter(Boolean).join(' · '),
      maxTrades: rb.risk.maxTrades || (rp.maxTradesPerDay ? String(rp.maxTradesPerDay) : ''),
      maxSize: rb.risk.maxSize || '',
      fromProfile: true,
    };
    if (!rb.dailyStop && (rp.dailyLossLimitR || rp.dailyLossLimitDollar || rp.maxTradesPerDay)) {
      rb.dailyStop = { r: rp.dailyLossLimitR || null, dollars: rp.dailyLossLimitDollar || null, losses: null, trades: rp.maxTradesPerDay || null, logic: 'first', fromProfile: true };
    }
  }
  rb.rules = [...METHOD_RULES, ...(rb.rules || []).filter((r) => r.source !== 'method')];
  return rb;
}

/** Make a TradingRule. */
export function makeRule({ category, title, ruleText, trigger = null, requiredResponse = null, source = 'student', isNonNegotiable = false }) {
  const now = Date.now();
  return {
    id: `r-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`, category, title, ruleText, trigger, requiredResponse,
    source, isStrategyRule: source === 'method', isPersonalRule: source !== 'method', isNonNegotiable, createdAt: now, lastReviewedAt: now, active: true,
  };
}

/** Every rule she has, flattened into readable cards (for the artifact and the five). */
export function ruleCards(rb = loadRulebook() || draftRulebook()) {
  const cards = [];
  rb.rules.filter((r) => r.source === 'method').forEach((r) => cards.push({ id: r.id, category: 'method', title: r.title, text: r.ruleText, source: 'method' }));
  const rk = rb.risk || {};
  if (rk.riskPerTrade) cards.push({ id: 'risk-trade', category: 'risk', title: 'Risk per trade', text: `Maximum risk per trade: ${rk.riskPerTrade}.` });
  if (rk.dailyMax) cards.push({ id: 'risk-daily', category: 'risk', title: 'Daily max loss', text: `Daily maximum loss: ${rk.dailyMax}.` });
  if (rk.maxTrades) cards.push({ id: 'risk-trades', category: 'risk', title: 'Maximum trades', text: `Maximum ${rk.maxTrades} trade${+rk.maxTrades === 1 ? '' : 's'} per day.` });
  if (rk.maxSize) cards.push({ id: 'risk-size', category: 'risk', title: 'Maximum size', text: `Maximum size: ${rk.maxSize}.` });
  if (rb.dailyStop) cards.push({ id: 'daily-stop', category: 'risk', title: 'Daily stop', text: dailyStopText(rb.dailyStop) });
  if (rb.noChase) cards.push({ id: 'no-chase', category: 'session', title: 'No chasing', text: rb.noChase });
  if (rb.sessionRule) cards.push({ id: 'session', category: 'session', title: 'Trading window', text: `I only take new entries between ${rb.sessionRule.start} and ${rb.sessionRule.end}.` });
  if (rb.newsRule) cards.push({ id: 'news', category: 'session', title: 'News rule', text: newsRuleText(rb.newsRule) });
  if (rb.environmentRule) cards.push({ id: 'environment', category: 'environment', title: 'Environment rule', text: rb.environmentRule.text });
  Object.entries(rb.behavior || {}).forEach(([k, v]) => { if (v) cards.push({ id: `beh-${k}`, category: 'behavior', title: BEHAVIOR_PROMPTS[k] || k, text: v }); });
  if (rb.afterViolation) cards.push({ id: 'after-violation', category: 'behavior', title: 'After a violation', text: rb.afterViolation });
  rb.rules.filter((r) => r.source !== 'method').forEach((r) => cards.push({ id: r.id, category: r.category, title: r.title, text: r.ruleText }));
  const queued = new Set(read('aghf_rule_queue', []).filter((q) => !q.resolved).map((q) => q.ruleId));
  return cards.map((c) => ({ ...c, nonNeg: (rb.nonNegotiables || []).includes(c.id), review: queued.has(c.id),
    status: queued.has(c.id) ? STATUS.REVIEW : (rb.nonNegotiables || []).includes(c.id) ? STATUS.NONNEG : c.source === 'method' ? STATUS.METHOD : STATUS.MINE }));
}

export const BEHAVIOR_PROMPTS = {
  missTrade: 'IF I MISS A TRADE', lose: 'IF I LOSE', winBig: 'IF I WIN BIG', fomo: 'IF I FEEL FOMO',
  revenge: 'IF I FEEL REVENGE URGENCY', hesitate: 'IF I HESITATE', breakRule: 'IF I BREAK A RULE',
};

export function dailyStopText(d) {
  if (!d) return '';
  const parts = [];
  if (d.r) parts.push(`−${String(d.r).replace(/^-/, '')}R`);
  if (d.dollars) parts.push(`−$${String(d.dollars).replace(/^-|\$/g, '')}`);
  if (d.losses) parts.push(`${d.losses} full loss${+d.losses === 1 ? '' : 'es'}`);
  if (d.trades) parts.push(`${d.trades} trade${+d.trades === 1 ? '' : 's'}`);
  return parts.length ? `Stop after ${parts.join(' OR ')}${parts.length > 1 ? ', whichever comes first' : ''}.` : '';
}

/* ── NewsRule (calendar-ready; no live calendar is invented) ───────────── */

export const NEWS_EVENT_TYPES = ['High-impact scheduled releases', 'Interest rate decisions', 'Employment reports', 'Inflation reports', 'Scheduled speeches / press conferences'];
export function newsRuleText(n) {
  if (!n) return 'NEWS RESPONSE NOT DEFINED';
  const types = (n.eventTypes || []).length ? n.eventTypes.join(', ').toLowerCase() : 'selected events';
  if (n.template === 'window') return `No new entries within ${n.minutesBefore || 0} minutes before${n.minutesAfter ? ` or ${n.minutesAfter} minutes after` : ''} ${types}.`;
  if (n.template === 'flat') return `I am flat before ${types}.${n.minutesBefore ? ` (${n.minutesBefore} minutes before)` : ''}`;
  if (n.template === 'skip') return `I do not trade during ${types}.`;
  return n.notes || 'Custom news rule.';
}
/** Does her news rule block a NEW entry with an event `minutesAway` minutes from now (negative = just released)? */
export function newsBlocks(n, minutesAway) {
  if (!n) return null; // not defined: the simulator flags it, it never invents one
  if (n.template === 'window') {
    if (minutesAway >= 0) return minutesAway <= (+n.minutesBefore || 0);
    return -minutesAway <= (+n.minutesAfter || 0);
  }
  if (n.template === 'flat') return minutesAway >= 0 && minutesAway <= Math.max(+n.minutesBefore || 0, 1);
  if (n.template === 'skip') return Math.abs(minutesAway) <= Math.max(+n.minutesBefore || 0, 2);
  return null;
}

/* ── Rule quality: CLEAR · TRIGGERED · ACTIONABLE · DECIDED IN ADVANCE ──── */

const LOOPHOLES = [
  [/\bunless\b/i, '“unless”'], [/too much/i, '“too much”'], [/\btry\b|\btrying\b/i, '“try”'], [/\bmaybe\b/i, '“maybe”'],
  [/\bprobably\b/i, '“probably”'], [/\breally\b/i, '“really”'], [/looks? (really |so )?(good|clean|amazing|perfect)/i, '“if it looks good”'],
  [/a little/i, '“a little”'], [/\bmight\b/i, '“might”'], [/\bdepends\b/i, '“depends”'], [/\bfeel(s)? (right|like)\b/i, '“feels right”'],
  [/\bmostly\b|\busually\b/i, '“mostly”'], [/\bshould be (ok|fine)/i, '“should be fine”'], [/one more/i, '“one more”'], [/just this once/i, '“just this once”'],
];
const TRIGGER_WORDS = /\b(if|when|after|before|within|once|whenever|during|outside|reach|reached|hit)\b/i;
const ACTION_WORDS = /\b(do not|don't|dont|no new|stop|wait|pass|close|screenshot|journal|flat|exit|skip|keep|take|mark|review|end|walk away|sit out|reduce|standard size|session over|log)\b/i;

export function ruleQuality(text) {
  const t = String(text || '').trim();
  const loopholes = LOOPHOLES.filter(([re]) => re.test(t)).map(([, l]) => l);
  return {
    clear: t.length >= 18 && !loopholes.length,
    triggered: TRIGGER_WORDS.test(t),
    actionable: ACTION_WORDS.test(t),
    decided: !/\b(in the moment|see how|figure it out|decide later|play it by ear)\b/i.test(t),
    loopholes,
  };
}

/* ── Conflicts: never silently decide which rule wins ──────────────────── */

export function ruleConflicts(rb) {
  const out = [];
  const behaviorText = Object.values(rb.behavior || {}).join(' ').toLowerCase() + ' ' + (rb.afterViolation || '').toLowerCase();
  const stopDefined = rb.dailyStop || rb.risk?.dailyMax;
  if (stopDefined && /(one more|another) trade|keep trading|take (one|another)/.test(behaviorText)) {
    out.push({ kind: 'daily', text: 'Your daily stop says stop. A behavior rule says you can take another trade. THESE RULES CONFLICT.' });
  }
  if (/size up|double (my )?size|bigger size|add contracts?/.test(behaviorText)) {
    out.push({ kind: 'risk', hard: true, text: 'A behavior rule changes size. Your risk limits are hard limits: a personal rule can’t override account safety.' });
  }
  if (rb.risk?.maxTrades && rb.dailyStop?.trades && +rb.risk.maxTrades !== +rb.dailyStop.trades) {
    out.push({ kind: 'trades', text: `Maximum trades says ${rb.risk.maxTrades}, your daily stop says ${rb.dailyStop.trades}. THESE RULES CONFLICT.` });
  }
  if (rb.noChase && ruleQuality(rb.noChase).loopholes.length) {
    out.push({ kind: 'loophole', text: `Your no-chase rule has a built-in loophole (${ruleQuality(rb.noChase).loopholes.join(', ')}). Could live-trading-you find a way around this sentence? 😂` });
  }
  return out;
}

/* ── ParticipationEligibility ──────────────────────────────────────────── */

/**
 * setupValidity: 'valid' | 'invalid' | 'incomplete' | 'missed'
 * riskEligibility / sessionEligibility / rulebookEligibility: 'allowed' | 'blocked'
 * environmentEligibility: 'allowed' | 'blocked' | 'unclear'
 * sessionOver: true when the daily stop / max trades ended the day
 * → finalParticipationStatus: TAKE | WAIT | PASS | SESSION_OVER (a framework answer, not a signal)
 */
export const PSTATUS = { TAKE: 'TAKE', WAIT: 'WAIT', PASS: 'PASS', OVER: 'SESSION_OVER', REASSESS: 'REASSESS' };
export function participation(e) {
  if (e.sessionOver) return PSTATUS.OVER;
  if (e.setupValidity === 'incomplete') return PSTATUS.WAIT;
  if (e.setupValidity === 'invalid' || e.setupValidity === 'missed') return PSTATUS.PASS;
  if ([e.riskEligibility, e.sessionEligibility, e.rulebookEligibility, e.environmentEligibility].includes('blocked')) return PSTATUS.PASS;
  return PSTATUS.TAKE;
}

/**
 * Check one situation against HER rulebook. Returns { verdict, rule, defined }:
 * verdict 'allowed' | 'blocked' | 'undefined' (her rulebook doesn't define this yet).
 * situation: { check, minutesToEvent, time, tradesTaken, dailyR, losses, env, missedRetest }
 */
export function checkRulebook(sit, rb = loadRulebook()) {
  const none = { verdict: 'undefined', rule: null, defined: false };
  if (!rb) return none;
  const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
  switch (sit.check) {
    case 'news': {
      const b = newsBlocks(rb.newsRule, sit.minutesToEvent);
      return b == null ? { ...none, rule: 'NEWS RESPONSE NOT DEFINED' } : { verdict: b ? 'blocked' : 'allowed', rule: newsRuleText(rb.newsRule), defined: true };
    }
    case 'session': {
      if (!rb.sessionRule) return { ...none, rule: 'TRADING WINDOW NOT DEFINED' };
      const t = toMin(sit.time), a = toMin(rb.sessionRule.start), z = toMin(rb.sessionRule.end);
      return { verdict: t >= a && t <= z ? 'allowed' : 'blocked', rule: `Trading window ${rb.sessionRule.start}–${rb.sessionRule.end}`, defined: true };
    }
    case 'maxTrades': {
      const max = +(rb.risk?.maxTrades || rb.dailyStop?.trades || 0);
      if (!max) return { ...none, rule: 'MAXIMUM TRADES NOT DEFINED' };
      return { verdict: sit.tradesTaken >= max ? 'blocked' : 'allowed', rule: `Maximum ${max} trade${max === 1 ? '' : 's'} per day`, defined: true };
    }
    case 'dailyStop': {
      const d = rb.dailyStop;
      if (!d) return { ...none, rule: 'DAILY STOP NOT DEFINED' };
      const hit = (d.r && Math.abs(sit.dailyR) >= Math.abs(+d.r) && sit.dailyR < 0) || (d.losses && sit.losses >= +d.losses) || (d.trades && sit.tradesTaken >= +d.trades);
      return { verdict: hit ? 'blocked' : 'allowed', rule: dailyStopText(d), defined: true };
    }
    case 'environment': {
      const er = rb.environmentRule;
      if (!er) return { ...none, rule: 'ENVIRONMENT RULE NOT DEFINED' };
      return { verdict: (er.blocks || []).includes(sit.env) ? 'blocked' : 'allowed', rule: er.text, defined: true };
    }
    case 'noChase': {
      if (!rb.noChase) return { ...none, rule: 'NO-CHASE RULE NOT DEFINED' };
      return { verdict: sit.missedRetest ? 'blocked' : 'allowed', rule: rb.noChase, defined: true };
    }
    default: return none;
  }
}

/* ── Review mode vs Session mode, the change queue and history ─────────── */

export function setMode(m) { try { sessionStorage.setItem('aghf_rulebook_mode', m); } catch { /* ignore */ } }
export function getMode() { try { return sessionStorage.getItem('aghf_rulebook_mode') || 'review'; } catch { return 'review'; } }

export function queueRuleChange({ ruleId, reason = '', sessionContext = '', tradeNumber = null, currentEmotion = null }) {
  const q = read('aghf_rule_queue', []);
  q.push({ ruleId, reason, sessionContext, tradeNumber, currentEmotion, timestamp: Date.now(), resolved: false });
  write('aghf_rule_queue', q);
  trackRules('queuedForReview');
}
export const ruleQueue = () => read('aghf_rule_queue', []).filter((q) => !q.resolved);
export function resolveQueued(ruleId, { changed, oldRule, newRule, reason, evidence }) {
  const q = read('aghf_rule_queue', []).map((x) => (x.ruleId === ruleId && !x.resolved ? { ...x, resolved: true, changed, resolvedAt: Date.now() } : x));
  write('aghf_rule_queue', q);
  if (changed) {
    const h = read('aghf_rule_history', []);
    h.push({ ruleId, oldRule, newRule, reason, evidence, date: Date.now() });
    write('aghf_rule_history', h);
  }
}
export const ruleHistory = () => read('aghf_rule_history', []);

/* ── RuleViolation + trigger-response pairs ────────────────────────────── */

export const VIOLATION_TYPES = [
  'Early entry', 'Wick counted as indication', 'Chase', 'Max trades exceeded', 'Daily loss exceeded',
  'Unauthorized size', 'News rule broken', 'Stop moved outside plan', 'Prohibited environment', 'Outside session',
];
export function recordViolation(v) {
  const all = read('aghf_rule_violations', []);
  all.push({ tradeId: null, ruleId: null, ruleCategory: null, ruleTextAtTime: '', violationType: '', trigger: '', studentThought: '', correctResponse: '', futureImplementationRule: '', outcome: null, processQuality: 'violation', ...v, timestamp: Date.now() });
  write('aghf_rule_violations', all.slice(-200));
}
export function saveTriggerResponse(pair) {
  const all = read('aghf_trigger_responses', []);
  all.push({ ...pair, savedAt: Date.now() });
  write('aghf_trigger_responses', all.slice(-50));
}
export const triggerResponses = () => read('aghf_trigger_responses', []);

/* ── Rule adherence (decisions followed, never "discipline 96%") ───────── */

const SESSION_KEY = 'aghf_p7r_session';
export function startRulesSession(name) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name, at: Date.now() })); } catch { /* ignore */ } }
export function rulesSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; } }
export function trackRules(key, ok = null) {
  try {
    const s = rulesSession();
    if (ok === null) s[key] = (s[key] || 0) + 1;
    else { s[`${key}:tries`] = (s[`${key}:tries`] || 0) + 1; if (ok) s[`${key}:right`] = (s[`${key}:right`] || 0) + 1; }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    const all = read('aghf_p7r_stats', {});
    if (ok === null) all[key] = (all[key] || 0) + 1; else { all[`${key}:tries`] = (all[`${key}:tries`] || 0) + 1; if (ok) all[`${key}:right`] = (all[`${key}:right`] || 0) + 1; }
    write('aghf_p7r_stats', all);
  } catch { /* ignore */ }
}
export const RULE_CATS = {
  strategy: 'Strategy rule recognition', risk: 'Risk rule adherence', noChase: 'No-chase rule', daily: 'Daily stop', maxTrades: 'Maximum trades',
  news: 'News rule', environment: 'Environment rule', violation: 'Rule violations recognized', trigger: 'Trigger identification', response: 'Response planning',
};
export function rulebookReview(s = rulesSession()) {
  let right = 0, tries = 0;
  const rows = Object.entries(RULE_CATS).map(([k, label]) => {
    const t = s[`${k}:tries`] || 0, r = s[`${k}:right`] || 0;
    right += r; tries += t;
    return [label, t ? `${r} / ${t}` : '·'];
  });
  rows.push(['Real-time exceptions created', s.exceptions || 0]);
  const review = [];
  if ((s.exceptions || 0) >= 2) review.push({ line: `You’ve rewritten a rule ${s.exceptions} times after the scenario became emotionally uncomfortable. WHAT WAS THE RULE BEFORE PRICE STARTED MOVING?`, cta: 'Rules that hold →', href: 'lesson.html?phase=p7&n=17' });
  const miss = (k) => (s[`${k}:tries`] || 0) - (s[`${k}:right`] || 0);
  if ((s['strategy:right'] || 0) >= 1 && miss('maxTrades') + miss('daily') + miss('news') + miss('noChase') >= 2) review.push({ line: 'Your Dayli ICC recognition is strong. The breakdown is happening AFTER setup validation.', cta: 'Personal rules practice →', href: 'lesson.html?phase=p7&n=12' });
  if ((s.validLossAsViolation || 0) >= 1) review.push({ line: 'You’re grading the rule by the outcome again.', cta: 'Outcome vs process →', href: 'lesson.html?phase=p7&n=18' });
  if ((s.excusedWinningViolation || 0) >= 1) review.push({ line: 'The trade paid you. But did the process?', cta: 'Review winning violation →', href: 'lesson.html?phase=p7&n=18' });
  if ((s.vagueRules || 0) >= 1) review.push({ line: 'Could live-trading-you find a loophole in this sentence? 😂', cta: 'Make it specific →', href: 'lesson.html?phase=p7&n=13' });
  return { followed: right, decisions: tries, rows, review: review.slice(0, 3) };
}
