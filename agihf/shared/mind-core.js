/**
 * mind-core.js — A Girl & Her Futures™
 *
 * Phase 7 · The Mindset Behind the Model. The data side of "read the trader":
 *
 *   EMOTION IS INFORMATION. BEHAVIOR IS THE DECISION.
 *   FEEL → NOTICE → NAME → CHECK THE RULE → CHOOSE THE BEHAVIOR.
 *
 * Everything here describes observable DECISIONS, never who she is. No mental
 * strength scores, no diagnosis, no fake psychological precision.
 *
 * PRIVACY: emotional reflections, self-observations and mindset notes are
 * student-owned learning data. They live in this browser (localStorage) and are
 * never published, compared, ranked or turned into community content. GP can
 * reward completion; it never rewards an emotional state.
 *
 * Stores:
 *   aghf_p7_profile      TraderBehaviorProfile (decision counters, triggers, rules at risk,
 *                        self-identified challenges) — Section 2 builds rules from it
 *   aghf_p7_session      sessionStorage: the current lab / practice session
 *   aghf_p7_journal      journal-shaped records (outcome, process, sample tag, violations,
 *                        emotional state, trigger, emotion-driven action, reflection)
 *   aghf_mindset_checkins MindsetCheckIn (before session / before trade / after trade)
 *   aghf_trader_state    the latest Trader State Card(s)
 */

const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

/* ── The Phase 7 language ──────────────────────────────────────────────── */

export const FRAMEWORK = ['FEEL', 'NOTICE', 'NAME', 'CHECK THE RULE', 'CHOOSE THE BEHAVIOR'];

export const SIGNATURE = {
  change: 'DID PRICE CHANGE… OR DID MY EMOTION CHANGE?',
  patience: 'DID MY SETUP FORM… OR DID MY PATIENCE RUN OUT?',
  previous: 'WOULD I TAKE THIS EXACT TRADE IF THE PREVIOUS TRADE NEVER HAPPENED?',
};

/** "WHO IS TRADING RIGHT NOW?" — the classifications a scenario can use. */
export const WHO = {
  process: { label: 'PROCESS', icon: '📐', tone: 'ok' },
  patience: { label: 'PATIENCE', icon: '⏳', tone: 'ok' },
  emotion: { label: 'EMOTION', icon: '💭', tone: 'mind' },
  fear: { label: 'FEAR', icon: '😰', tone: 'mind' },
  greed: { label: 'GREED', icon: '🤑', tone: 'mind' },
  fomo: { label: 'FOMO', icon: '🏃‍♀️', tone: 'mind' },
  revenge: { label: 'REVENGE', icon: '😤', tone: 'mind' },
  boredom: { label: 'BOREDOM', icon: '🥱', tone: 'mind' },
  overconfidence: { label: 'OVERCONFIDENCE', icon: '😎', tone: 'mind' },
  hesitation: { label: 'HESITATION', icon: '🫣', tone: 'mind' },
};

/** Emotional temperature: a self-observation tool, NOT a diagnostic score. */
export const TEMPERATURE = [
  { key: 'calm', dot: '🟢', label: 'CALM / NEUTRAL' },
  { key: 'elevated', dot: '🟡', label: 'ELEVATED' },
  { key: 'frustrated', dot: '🟠', label: 'FRUSTRATED / ANXIOUS' },
  { key: 'red', dot: '🔴', label: 'REVENGE / FOMO STATE' },
];
export const tempMeta = (k) => TEMPERATURE.find((t) => t.key === k) || TEMPERATURE[0];

/** Trader State Card fields (journal, pre-trade planner, simulator, rulebook later). */
export const STATE_FIELDS = [
  { key: 'emotion', label: 'CURRENT EMOTION', options: ['Calm', 'Nervous', 'Frustrated', 'Excited', 'Disappointed', 'FOMO', 'Angry', 'Bored', 'Overconfident', 'Doubtful'] },
  { key: 'intensity', label: 'INTENSITY', options: ['Low', 'Medium', 'High'] },
  { key: 'trigger', label: 'TRIGGER', options: ['Previous valid loss', 'Missed a winner', 'Big win', 'Long wait, nothing formed', 'Price moving fast', 'News coming', 'Two losses in a row'] },
  { key: 'urge', label: 'URGE', options: ['Take the next setup early', 'Chase', 'Size up', 'Close early', 'Move my stop', 'Skip a valid setup', 'Take one more trade'] },
  { key: 'ruleAtRisk', label: 'RULE AT RISK', options: ['Wait for Continuation', 'No chasing', 'Standard size', 'Daily stop', 'Maximum trades', 'Follow the management plan', 'Take valid setups that fit my rules'] },
  { key: 'plannedResponse', label: 'PLANNED RESPONSE', options: ['Pause and require the full checklist', 'Screenshot it, wait for a new valid setup', 'Keep standard size', 'Session over: review mode', 'Follow the plan, hide P&L', 'Evaluate this setup on its own'] },
];

/* ── TraderBehaviorProfile ─────────────────────────────────────────────── */

const PROFILE_KEY = 'aghf_p7_profile';
const SESSION_KEY = 'aghf_p7_session';

/** Counters of observable decisions. Every key is a behavior, never a trait. */
export const PROFILE_COUNTERS = [
  'fomoDecisionCount', 'revengeDecisionCount', 'fearDrivenManagementCount', 'greedDrivenDecisionCount',
  'hesitationCount', 'overtradeCount', 'overconfidenceCount', 'boredomCount', 'patienceSuccessCount',
  'fomoRecognized', 'revengeAvoided', 'ruleBasedResponses', 'emotionalTradesTaken',
  'processOutcomeRight', 'processOutcomeTries', 'feelingAsReason', 'recognitionRight', 'recognitionTries',
];

export function loadProfile() {
  return read(PROFILE_KEY, { commonEmotionalTriggers: {}, commonRuleAtRisk: {}, currentSelfIdentifiedChallenges: [] });
}
function saveProfile(p) { write(PROFILE_KEY, { ...p, updatedAt: Date.now() }); }

export function session() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; } }
function writeSession(v) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch { /* ignore */ } }
export function startMindSession(name) { writeSession({ name, at: Date.now() }); }

/** Count one observable decision, in the profile and the current session. */
export function trackMind(key, n = 1) {
  if (!key) return;
  const p = loadProfile();
  p[key] = (p[key] || 0) + n;
  saveProfile(p);
  const s = session();
  if (s) { s[key] = (s[key] || 0) + n; writeSession(s); }
}
/** An option can carry track: 'key' or ['a', 'b']. */
export function trackAll(keys) { (Array.isArray(keys) ? keys : [keys]).filter(Boolean).forEach((k) => trackMind(k)); }

export function noteTrigger(trigger) {
  if (!trigger) return;
  const p = loadProfile();
  p.commonEmotionalTriggers = p.commonEmotionalTriggers || {};
  p.commonEmotionalTriggers[trigger] = (p.commonEmotionalTriggers[trigger] || 0) + 1;
  saveProfile(p);
}
export function noteRuleAtRisk(rule) {
  if (!rule) return;
  const p = loadProfile();
  p.commonRuleAtRisk = p.commonRuleAtRisk || {};
  p.commonRuleAtRisk[rule] = (p.commonRuleAtRisk[rule] || 0) + 1;
  saveProfile(p);
}
export function setChallenges(list) {
  const p = loadProfile();
  p.currentSelfIdentifiedChallenges = (list || []).filter(Boolean);
  saveProfile(p);
}

/**
 * The patterns most likely to pressure her execution, from her own decisions
 * (plus anything she named herself). Returns keys of PATTERNS, strongest first.
 */
export const PATTERNS = {
  fomo: { label: 'FOMO', counter: 'fomoDecisionCount', ruleKey: 'fomo', prompt: 'IF I FEEL FOMO', line: 'You identified FOMO as one of the patterns most likely to pressure your execution.' },
  revenge: { label: 'Revenge urgency', counter: 'revengeDecisionCount', ruleKey: 'revenge', prompt: 'IF I FEEL REVENGE URGENCY', line: 'Revenge urgency showed up as a pattern most likely to pressure your execution.' },
  fear: { label: 'Fear-driven management', counter: 'fearDrivenManagementCount', ruleKey: 'lose', prompt: 'IF I LOSE', line: 'Fear changing the management plan showed up in your decisions.' },
  greed: { label: 'Greed / plan drift', counter: 'greedDrivenDecisionCount', ruleKey: 'winBig', prompt: 'IF I WIN BIG', line: 'Plan drift after a win showed up in your decisions.' },
  hesitation: { label: 'Hesitation', counter: 'hesitationCount', ruleKey: 'hesitate', prompt: 'IF I HESITATE', line: 'Hesitating after the criteria were complete showed up in your decisions.' },
  overtrading: { label: 'Overtrading', counter: 'overtradeCount', ruleKey: 'missTrade', prompt: 'IF I MISS A TRADE', line: 'Taking trades beyond your plan showed up in your decisions.' },
  overconfidence: { label: 'Overconfidence', counter: 'overconfidenceCount', ruleKey: 'winBig', prompt: 'IF I WIN BIG', line: 'Risk creeping up after wins showed up in your decisions.' },
};
const CHALLENGE_TO_PATTERN = { FOMO: 'fomo', 'Revenge trading': 'revenge', 'Frustration / revenge': 'revenge', Fear: 'fear', Greed: 'greed', 'Greed / excitement': 'greed', Hesitation: 'hesitation', Overtrading: 'overtrading', 'Boredom / overtrading': 'overtrading', 'Winning streaks': 'overconfidence', 'Overconfidence': 'overconfidence', 'Losing streaks': 'revenge' };

export function topPatterns(p = loadProfile()) {
  // What she named herself in the Section 18 check-in counts too ("Which emotion changes your behavior most easily?").
  const lp = read('aghf_learning_profile', {});
  const self = [...(p.currentSelfIdentifiedChallenges || []), lp['p7-s18']?.p7emotion, lp['p7-s18']?.p7review].filter(Boolean);
  const named = new Set(self.map((c) => CHALLENGE_TO_PATTERN[c]).filter(Boolean));
  return Object.entries(PATTERNS)
    .map(([k, m]) => ({ key: k, ...m, count: (p[m.counter] || 0) + (named.has(k) ? 2 : 0) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

/* ── "YOU'VE SEEN THIS ONE BEFORE": mistake TYPES from earlier phases ────── */

/**
 * Phase 6 (and earlier) behavior, read back as patterns Phase 7 can practice
 * against. Never shaming, never a diagnosis: a mistake type and a question.
 */
export function priorPatterns() {
  const s6 = read('aghf_p6_stats', {});
  const learning = read('aghf_learning', { mistakes: {} });
  const m = (k) => (learning.mistakes?.[k]?.count || 0);
  const n = (k) => s6[k] || 0;
  const risk = (skill) => Math.max(0, n(`risk:${skill}:tries`) - n(`risk:${skill}:right`));
  const out = [
    { key: 'anticipation', count: n('anticipationErrors') + m('anticipated-continuation') + m('anticipated-indication'), rule: 'Wait for the close', emotionHint: 'fomo',
      line: 'You’ve had a pattern of acting before Continuation when price starts moving quickly.' },
    { key: 'chase', count: n('chaseAttempts') + m('chase'), rule: 'No retest, no chase', emotionHint: 'fomo',
      line: 'You’ve entered after the planned retest was already gone before.' },
    { key: 'stop', count: n('unplannedStopMoves') + n('emotionalExits'), rule: 'Follow the management plan', emotionHint: 'fear',
      line: 'You’ve moved a stop or closed early without a management rule before.' },
    { key: 'target', count: n('unplannedTargetChanges'), rule: 'Honor the planned exit', emotionHint: 'greed',
      line: 'You’ve moved a target farther than the plan said before.' },
    { key: 'daily', count: risk('daily') + n('revengeSizingErrors'), rule: 'Daily stop / standard size', emotionHint: 'revenge',
      line: 'You’ve wanted to keep trading, or size up, after the day said stop before.' },
    { key: 'frequency', count: risk('frequency'), rule: 'Maximum trades', emotionHint: 'overtrading',
      line: 'You’ve taken a trade beyond the day’s plan before.' },
  ];
  return out.filter((x) => x.count > 0).sort((a, b) => b.count - a.count);
}

/* ── Journal architecture (Section 1 starts storing it) ────────────────── */

const JOURNAL_KEY = 'aghf_p7_journal';
/**
 * tradeOutcome: 'win' | 'loss' | 'be' | 'missed' | 'no-trade'
 * processQuality: 'followed' | 'violation'
 * strategySampleTag: e.g. 'not-enough-info' | 'not-useful-evidence'
 * WIN never means GOOD TRADE. LOSS never means BAD TRADE.
 */
export function recordJournal(entry) {
  const all = read(JOURNAL_KEY, []);
  all.push({
    tradeOutcome: null, processQuality: null, strategySampleTag: null, ruleViolations: [],
    emotionalState: null, emotionalTrigger: null, emotionDrivenAction: null, reflection: '',
    ...entry, savedAt: Date.now(),
  });
  write(JOURNAL_KEY, all.slice(-200));
}
export const journal = () => read(JOURNAL_KEY, []);

/* ── MindsetCheckIn + Trader State Card ────────────────────────────────── */

const CHECKIN_KEY = 'aghf_mindset_checkins';
/** when: 'beforeSession' | 'beforeTrade' | 'afterTrade'. Contextual, never required before every trade. */
export function saveMindsetCheckIn(when, data) {
  const all = read(CHECKIN_KEY, []);
  all.push({ when, emotion: null, trigger: null, urge: null, ruleAtRisk: null, behaviorChosen: null, ruleFollowed: null, reflection: '', ...data, savedAt: Date.now() });
  write(CHECKIN_KEY, all.slice(-200));
  noteTrigger(data.trigger);
  noteRuleAtRisk(data.ruleAtRisk);
}
const STATE_KEY = 'aghf_trader_state';
export function saveStateCard(card) {
  const all = read(STATE_KEY, []);
  all.push({ ...card, savedAt: Date.now() });
  write(STATE_KEY, all.slice(-50));
  saveMindsetCheckIn('beforeTrade', { emotion: card.emotion, trigger: card.trigger, urge: card.urge, ruleAtRisk: card.ruleAtRisk, behaviorChosen: card.plannedResponse });
}
export const lastStateCard = () => { const a = read(STATE_KEY, []); return a[a.length - 1] || null; };

/* ── The Mindset Score: observable decisions, never "mental strength 87%" ── */

export function mindsetScore(s = session() || {}) {
  const n = (k) => s[k] || 0;
  const rows = [
    ['FOMO recognized', n('fomoRecognized')],
    ['Revenge decisions avoided', n('revengeAvoided')],
    ['Fear-driven actions', n('fearDrivenManagementCount')],
    ['Greed-driven actions', n('greedDrivenDecisionCount')],
    ['Rule-based responses', n('ruleBasedResponses')],
    ['Emotional trades taken', n('emotionalTradesTaken')],
    ['Patience decisions', n('patienceSuccessCount')],
    ['Hesitation errors', n('hesitationCount')],
    ['Process / outcome classification', n('processOutcomeTries') ? `${n('processOutcomeRight')} / ${n('processOutcomeTries')}` : '·'],
  ];
  return { rows, support: adaptiveSupport(s) };
}

/** Electric support: specific, from her own decisions, with somewhere to go. */
export function adaptiveSupport(s = session() || {}) {
  const n = (k) => s[k] || 0;
  const out = [];
  if (n('fearDrivenManagementCount') >= 1) out.push({ line: 'You know the management rule. Fear seems to be changing the exit.', cta: 'Replay without P&L →', href: 'lesson.html?phase=p6&n=15' });
  if (n('fomoDecisionCount') >= 1) out.push({ line: 'You recognized the setup. The challenge is accepting when the entry opportunity is already gone.', cta: 'No retest drill →', href: 'lesson.html?phase=p6&n=6' });
  if (n('revengeDecisionCount') >= 1) out.push({ line: 'The next setup keeps getting judged through the previous loss.', cta: 'Reset previous outcome →', href: 'lesson.html?phase=p7&n=5' });
  if (n('hesitationCount') >= 1) out.push({ line: 'You’re waiting after the criteria are complete. That’s different from waiting FOR the criteria.', cta: 'Patience vs hesitation →', href: 'lesson.html?phase=p7&n=7' });
  if (n('overconfidenceCount') >= 1) out.push({ line: 'Your confidence changed. Did your risk plan?', cta: 'Baseline risk →', href: 'lesson.html?phase=p7&n=8' });
  if (n('feelingAsReason') >= 1) out.push({ line: 'Feeling something doesn’t automatically make the setup invalid.', cta: 'Feeling vs behavior →', href: 'lesson.html?phase=p7&n=1' });
  return out.slice(0, 3);
}
