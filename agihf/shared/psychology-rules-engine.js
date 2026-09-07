/**
 * psychology-rules-engine.js — A Girl & Her Futures™
 *
 * Deterministic (non-AI) decision logic for The Inner Edge. Every coaching
 * mode consults this file FIRST — daily-limit checks, readiness scoring,
 * valid-loss-vs-execution-mistake classification, and the Talk Me Through
 * This action recommendation are all plain rules over structured answers,
 * never an AI judgment call (per the feature spec: AI is never the sole
 * authority for limits, risk math, or that classification). Pure
 * functions only — no fetching, no DOM, mirrors consistency-service.js.
 */

/* ── Daily limits ─────────────────────────────────────────────────── */

/**
 * @param {{maxTrades?: number|null, maxRisk?: number|null, tradesTakenToday?: number, riskUsedToday?: number}} ctx
 */
export function checkDailyLimits(ctx = {}) {
  const reachedTradeLimit = ctx.maxTrades != null && (ctx.tradesTakenToday || 0) >= ctx.maxTrades;
  const reachedRiskLimit = ctx.maxRisk != null && (ctx.riskUsedToday || 0) >= ctx.maxRisk;
  return { reachedTradeLimit, reachedRiskLimit };
}

/* ── Pre-Trade Mental Check readiness ────────────────────────────── */

export const READINESS_ORDER = ['clear', 'slightly_activated', 'emotionally_influenced', 'pause_recommended', 'walk_away'];

export const READINESS_COPY = {
  clear: { label: 'Clear', message: 'Nothing here suggests you need to pause. Trade your plan.' },
  slightly_activated: { label: 'Slightly Activated', message: 'Your checklist is complete, but your urgency is elevated. Take 60 seconds, hide P&L if needed, and verify your saved entry condition before making another decision.' },
  emotionally_influenced: { label: 'Emotionally Influenced', message: 'At least one answer suggests this decision may be shaped more by how you feel than by what the setup actually shows. Slow down before acting.' },
  pause_recommended: { label: 'Pause Recommended', message: 'More than one signal here points toward pausing rather than entering right now.' },
  walk_away: { label: 'Walk-Away Condition Reached', message: 'A condition you saved for yourself ahead of time has been reached. This isn’t a judgment — it’s the plan you already made for exactly this moment.' },
};

/**
 * @param {{urgeStrength:number, state:'calm'|'activated'|'emotionally_influenced', confirmedOrAnticipating:'confirmed'|'anticipating', comfortableWithPlannedLoss:boolean, permittedByPlan:boolean, avoidingMissingMove:boolean, tryingToRecover:boolean, withinDailyLimits:boolean}} answers
 */
export function computeReadiness(answers) {
  let level = 0; // index into READINESS_ORDER
  const bump = (i) => { if (i > level) level = i; };

  if (answers.withinDailyLimits === false || answers.permittedByPlan === false) bump(4);
  if (answers.tryingToRecover === true || answers.avoidingMissingMove === true) bump(3);
  if (answers.comfortableWithPlannedLoss === false) bump(3);
  if (answers.confirmedOrAnticipating === 'anticipating') bump(2);
  if (answers.state === 'emotionally_influenced') bump(2);
  if (answers.state === 'activated' || (answers.urgeStrength || 0) >= 4) bump(1);
  if ((answers.urgeStrength || 0) >= 3 && level < 1) bump(1);

  const key = READINESS_ORDER[level];
  return { key, ...READINESS_COPY[key] };
}

/* ── Post-Loss Reset ──────────────────────────────────────────────── */

export const WHAT_HAPPENED_OPTIONS = [
  { key: 'valid_planned_loss', label: 'A valid, planned loss' },
  { key: 'entered_early', label: 'I entered early' },
  { key: 'entered_against_bias', label: 'I entered against my bias' },
  { key: 'traded_during_consolidation', label: 'I traded during consolidation' },
  { key: 'traded_near_news', label: 'I traded near high-impact news' },
  { key: 'moved_stop', label: 'I moved my stop' },
  { key: 'exited_outside_plan', label: 'I exited outside my plan' },
  { key: 'oversized', label: 'I was oversized' },
  { key: 'unplanned_setup', label: 'This wasn’t a planned setup' },
  { key: 'not_sure', label: 'I’m not sure' },
];

export const EXECUTION_ANSWER_OPTIONS = [
  { key: 'followed_plan_valid_loss', label: 'I followed my plan — this was a valid loss' },
  { key: 'broke_rules', label: 'I broke one or more of my rules' },
  { key: 'insufficient_info', label: 'I don’t have enough information to say' },
  { key: 'judging_by_pnl_only', label: 'I’m judging this only by the dollar amount' },
];

const EXECUTION_MISTAKE_LESSON = {
  entered_early: 'entry_before_continuation',
  entered_against_bias: '4h_bias',
  traded_during_consolidation: 'consolidation',
  traded_near_news: 'news_caution',
  moved_stop: 'defended_swing',
  exited_outside_plan: 'trade_management',
  oversized: 'position_sizing',
  unplanned_setup: 'pre_trade_workflow',
};

/**
 * @param {string} whatHappened one of WHAT_HAPPENED_OPTIONS keys
 * @param {string} executionAnswer one of EXECUTION_ANSWER_OPTIONS keys
 */
export function classifyPostLoss(whatHappened, executionAnswer) {
  if (executionAnswer === 'judging_by_pnl_only') {
    return {
      classification: 'reframe_needed',
      message: 'The monetary loss is not the complete pattern. Let’s look at the decision point before the entry rather than the dollar amount alone.',
      recommendedLesson: EXECUTION_MISTAKE_LESSON[whatHappened] || null,
    };
  }
  if (whatHappened === 'not_sure' || executionAnswer === 'insufficient_info') {
    return { classification: 'insufficient_info', message: 'There isn’t quite enough here yet to classify this cleanly — that’s alright. Journal what you remember and revisit this once the chart is clearer in your head.', recommendedLesson: null };
  }
  if (whatHappened === 'valid_planned_loss' && executionAnswer === 'followed_plan_valid_loss') {
    return { classification: 'valid_loss', message: 'You followed every saved rule. This appears to be a valid loss, not failed execution.', recommendedLesson: null };
  }
  if (EXECUTION_MISTAKE_LESSON[whatHappened]) {
    return { classification: 'execution_mistake', message: 'This looks like an execution pattern worth reviewing, separate from the outcome itself.', recommendedLesson: EXECUTION_MISTAKE_LESSON[whatHappened] };
  }
  return { classification: executionAnswer === 'broke_rules' ? 'execution_mistake' : 'valid_loss', message: executionAnswer === 'broke_rules' ? 'This points to a rule that wasn’t followed, not just an unlucky outcome.' : 'This reads as a valid loss rather than a failed execution.', recommendedLesson: null };
}

export const POST_LOSS_URGE_OPTIONS = [
  { key: 'another_trade_now', label: 'Take another trade immediately' },
  { key: 'increase_size', label: 'Increase my size' },
  { key: 'recover_loss', label: 'Recover the loss' },
  { key: 'change_strategy', label: 'Change my strategy' },
  { key: 'walk_away', label: 'Walk away entirely' },
  { key: 'review_chart', label: 'Review the chart' },
  { key: 'journal_calmly', label: 'Journal calmly' },
  { key: 'no_strong_urge', label: 'No strong urge' },
];

const RISKY_URGES = ['another_trade_now', 'increase_size', 'recover_loss'];

/**
 * @param {string} urge one of POST_LOSS_URGE_OPTIONS keys
 * @param {{reachedTradeLimit:boolean, reachedRiskLimit:boolean}} limits
 */
export function recommendPostLossAction(urge, limits) {
  if (limits.reachedTradeLimit || limits.reachedRiskLimit) {
    return { action: 'end_session', message: 'Today’s saved limit has already been reached. This is the plan you made for this exact moment.' };
  }
  if (RISKY_URGES.includes(urge)) {
    return { action: 'begin_cooldown', message: 'That urge is common right after a loss — it’s not a signal to act on immediately. A short cooldown first.' };
  }
  if (urge === 'walk_away') return { action: 'end_session', message: 'Walking away here is a legitimate, plan-respecting choice.' };
  if (urge === 'review_chart') return { action: 'review_lesson', message: 'Reviewing is a good next step — do it away from an open order.' };
  return { action: 'journal_decision', message: 'Journaling this now, while it’s fresh, will make it easier to spot the pattern later.' };
}

/* ── Talk Me Through This ────────────────────────────────────────── */

export const TALK_ACTIONS = {
  return_to_checklist: 'Return to Checklist',
  wait_for_confirmation: 'Wait for Confirmation',
  follow_saved_plan: 'Follow Saved Plan',
  reset_60s: 'Take a 60-Second Reset',
  begin_cooldown: 'Begin Cooling-Off Period',
  mark_missed_no_chase: 'Mark as Missed Without Chasing',
  end_session: 'End Trading Session',
  journal_decision: 'Journal the Decision',
  review_lesson: 'Review the Relevant Lesson',
  contact_support: 'Contact Appropriate Human Support',
};

export const TALK_TRIGGERS = [
  { key: 'want_to_chase', label: 'I want to chase price', questions: ['setup_in_plan', 'confirmed_or_anticipating', 'comfortable_full_loss'] },
  { key: 'afraid_to_enter', label: "I'm afraid to enter", questions: ['setup_in_plan', 'icc_complete', 'checklist_says'] },
  { key: 'just_lost', label: 'I just lost', questions: ['within_max_risk', 'comfortable_full_loss'] },
  { key: 'want_another_trade', label: 'I want another trade', questions: ['reached_max_trades', 'new_setup_or_urge', 'within_max_risk'] },
  { key: 'panicking_in_trade', label: "I'm panicking in a trade", questions: ['in_trade', 'comfortable_full_loss'] },
  { key: 'want_to_move_stop', label: 'I want to move my stop', questions: ['in_trade', 'comfortable_full_loss'] },
  { key: 'exited_too_early', label: 'I exited too early', questions: ['checklist_says'] },
  { key: 'broke_my_rules', label: 'I broke my rules', questions: ['checklist_says'] },
  { key: 'dont_trust_strategy', label: "I don't trust my strategy", questions: ['icc_complete', 'checklist_says'] },
  { key: 'feeling_overconfident', label: "I'm feeling overconfident", questions: ['reached_max_trades', 'comfortable_full_loss'] },
];

export const QUESTION_BANK = {
  in_trade: { prompt: 'Are you currently in a trade?', type: 'yesno' },
  setup_in_plan: { prompt: 'Was this setup part of the plan you saved this morning?', type: 'yesno' },
  icc_complete: { prompt: 'Has the full Dayli ICC sequence completed on this setup?', type: 'yesno' },
  confirmed_or_anticipating: { prompt: 'Has price actually confirmed, or are you anticipating it will?', type: 'choice', options: [{ key: 'confirmed', label: 'It confirmed' }, { key: 'anticipating', label: 'I’m anticipating it' }] },
  new_setup_or_urge: { prompt: 'Is this a completely new valid setup, or an urge after the last trade’s outcome?', type: 'choice', options: [{ key: 'new_setup', label: 'A new valid setup' }, { key: 'urge_after_outcome', label: 'An urge after what just happened' }] },
  reached_max_trades: { prompt: 'Have you reached the maximum number of trades in your saved plan?', type: 'yesno' },
  within_max_risk: { prompt: 'Are you still within your saved maximum daily risk?', type: 'yesno' },
  comfortable_full_loss: { prompt: 'Are you comfortable accepting the full planned loss if this doesn’t work?', type: 'yesno' },
  checklist_says: { prompt: 'What does your checklist say right now?', type: 'choice', options: [{ key: 'clean', label: 'Clean' }, { key: 'wait', label: 'Wait' }, { key: 'pass', label: 'Pass' }] },
};

/**
 * First-match-wins ordered rules, evaluated over whatever answers the
 * member actually gave (a trigger only asks a subset of QUESTION_BANK,
 * so most checks below are naturally skipped for a given trigger).
 * @param {Record<string, any>} answers keyed by QUESTION_BANK id
 * @returns {{action: string, actionLabel: string, message: string, rulesTriggered: string[]}}
 */
export function resolveTalkMeThrough(answers = {}) {
  const rulesTriggered = [];
  const result = (rule, action, message) => {
    rulesTriggered.push(rule);
    return { action, actionLabel: TALK_ACTIONS[action], message, rulesTriggered };
  };

  if (answers.reached_max_trades === true) {
    return result('daily_trade_limit_reached', 'end_session', 'You’ve reached the number of trades in your saved plan. This recommends ending today’s session — not another trade.');
  }
  if (answers.within_max_risk === false) {
    return result('daily_risk_limit_reached', 'end_session', 'You’re outside your saved maximum daily risk. This recommends ending today’s session.');
  }
  if (answers.setup_in_plan === false) {
    return result('not_in_saved_plan', 'follow_saved_plan', 'This wasn’t part of the plan you saved this morning — that’s worth pausing on before anything else.');
  }
  if (answers.confirmed_or_anticipating === 'anticipating') {
    return result('anticipating_not_confirmed', 'wait_for_confirmation', 'This is anticipation, not confirmation. The plan calls for a close, not a guess.');
  }
  if (answers.new_setup_or_urge === 'urge_after_outcome') {
    return result('urge_after_outcome', 'journal_decision', 'This reads more like an urge following the last outcome than a new valid setup. Worth naming that directly.');
  }
  if (answers.comfortable_full_loss === false) {
    return result('not_comfortable_with_loss', 'begin_cooldown', 'If you’re not comfortable accepting the full planned loss, the size or the setup isn’t right yet.');
  }
  if (answers.icc_complete === false) {
    return result('icc_incomplete', 'return_to_checklist', 'The Dayli ICC sequence hasn’t completed yet — the checklist is the next step, not the trade.');
  }
  if (answers.checklist_says === 'pass') {
    return result('checklist_says_pass', 'mark_missed_no_chase', 'Your own checklist already says pass. Marking this as missed protects you from chasing it.');
  }
  if (answers.checklist_says === 'wait') {
    return result('checklist_says_wait', 'wait_for_confirmation', 'Your checklist says wait — that’s the answer, even when it doesn’t feel like it in the moment.');
  }
  if (answers.checklist_says === 'clean' && answers.in_trade !== true) {
    return result('checklist_says_clean', 'follow_saved_plan', 'Everything checked here points to following the plan you already built.');
  }
  if (answers.in_trade === true) {
    return result('already_in_trade', 'reset_60s', 'You’re already in this trade. A 60-second reset before touching anything else.');
  }
  return result('default_reflect', 'journal_decision', 'Nothing here points clearly one way — journaling this moment now will make the pattern easier to see later.');
}
