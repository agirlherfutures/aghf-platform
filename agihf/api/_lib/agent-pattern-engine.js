/**
 * agent-pattern-engine.js — A Girl & Her Futures™
 *
 * Deterministic, non-AI calculations over a member's own trades/
 * checklists — the "calculate objective information in application code
 * before sending it to the AI" layer the AGHF Agent is required to use.
 * Extends journal-insights.js's proven style (pure functions, gated on a
 * minimum sample size, never fabricate a pattern below threshold) rather
 * than duplicating it — computeObservedMetrics() feeds the per-turn
 * <observed_data> context block, detectPatterns() feeds psychology_patterns
 * rows / evidence cards. The AI is only ever handed these outputs to
 * explain or explore, never the raw row data itself.
 */

export const MIN_SAMPLE = 3;

export const STRENGTH_THRESHOLDS = [
  ['strong', 12],
  ['repeating', 8],
  ['emerging', 5],
  ['early_signal', MIN_SAMPLE],
];

export function evidenceStrengthForCount(n) {
  for (const [label, min] of STRENGTH_THRESHOLDS) if (n >= min) return label;
  return 'not_enough_data';
}

function dayKey(entry) {
  return entry.tradeDate || (entry.entryTime || '').slice(0, 10);
}

function isLoss(entry) {
  return (entry.outcomeOverride || entry.outcome) === 'loss';
}
function isWin(entry) {
  return (entry.outcomeOverride || entry.outcome) === 'win';
}

/**
 * The deterministic aggregate handed to the AI as ground truth. Every
 * field is either a plain count/percentage or omitted — never an
 * AI-authored sentence. `trades` is JournalEntryRecord[] (entryType
 * 'trade' only), already scoped/filtered by the caller's consent+
 * attachment rules; `checklists` is ChecklistState[].
 */
export function computeObservedMetrics(trades = [], checklists = []) {
  if (!trades.length) return { tradeCount: 0 };

  const wins = trades.filter(isWin).length;
  const losses = trades.filter(isLoss).length;
  const rTrades = trades.filter((t) => t.plannedRisk > 0 && t.netPnl != null);
  const avgR = rTrades.length
    ? Number((rTrades.reduce((s, t) => s + t.netPnl / t.plannedRisk, 0) / rTrades.length).toFixed(2))
    : null;

  const ruleViolationCounts = {};
  trades.forEach((t) => (t.ruleViolations || []).forEach((v) => { ruleViolationCounts[v] = (ruleViolationCounts[v] || 0) + 1; }));

  const emotionCounts = {};
  trades.forEach((t) => Object.values(t.emotions || {}).flat().forEach((e) => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; }));

  const checklistedTrades = trades.filter((t) => t.checklistId);
  const linkedChecklists = new Map(checklists.map((c) => [c.id, c]));
  const checklistCompletionPct = checklistedTrades.length
    ? Math.round(checklistedTrades.reduce((sum, t) => sum + (linkedChecklists.get(t.checklistId)?.completionPct || 0), 0) / checklistedTrades.length)
    : null;

  const ruleFollowRate = (() => {
    const answered = trades.filter((t) => t.ruleCheck);
    if (!answered.length) return null;
    return Math.round((answered.filter((t) => t.ruleCheck === 'yes').length / answered.length) * 100);
  })();

  return {
    tradeCount: trades.length,
    winCount: wins,
    lossCount: losses,
    winRatePct: trades.length ? Math.round((wins / trades.length) * 100) : null,
    avgR,
    checklistCompletionPct,
    ruleFollowRatePct: ruleFollowRate,
    topRuleViolations: Object.entries(ruleViolationCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tag, count]) => ({ tag, count })),
    topEmotions: Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([emotion, count]) => ({ emotion, count })),
  };
}

/** Groups trades by trading day, sorted chronologically within each day. */
function groupByDay(trades) {
  const byDay = new Map();
  trades.forEach((t) => {
    const k = dayKey(t);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(t);
  });
  byDay.forEach((list) => list.sort((a, b) => new Date(a.entryTime || a.createdAt) - new Date(b.entryTime || b.createdAt)));
  return byDay;
}

function dateRangeOf(trades) {
  const dates = trades.map(dayKey).filter(Boolean).sort();
  return dates.length ? { from: dates[0], to: dates[dates.length - 1] } : null;
}

/**
 * Pattern: after a losing trade, the same day's next trade shows signs of
 * a lowered entry standard (tagged "entered early"/"chased price", or
 * lacking a completed ICC mini-checklist). Mirrors the exact example in
 * the product spec: "Loss -> discomfort -> need to repair the day ->
 * lower entry standard."
 */
function detectPostLossLowerStandards(trades) {
  const byDay = groupByDay(trades);
  const flagged = [];
  let sessionsWithSecondTrade = 0;
  byDay.forEach((dayTrades) => {
    if (dayTrades.length < 2) return;
    for (let i = 0; i < dayTrades.length - 1; i++) {
      if (!isLoss(dayTrades[i])) continue;
      sessionsWithSecondTrade += 1;
      const next = dayTrades[i + 1];
      const rushed = (next.ruleViolations || []).some((v) => ['Entered early', 'Chased price'].includes(v))
        || (next.entryTags || []).includes('Other');
      const checklistIncomplete = next.iccChecklist ? Object.values(next.iccChecklist).some((v) => v === false) : null;
      if (rushed || checklistIncomplete) flagged.push(next);
      break; // only the first loss-of-the-day → next-trade pair counts per day
    }
  });
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'post_loss_lower_standards',
    evidenceCount: flagged.length,
    supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `In ${flagged.length} of ${sessionsWithSecondTrade} sessions that included a trade after an initial loss, the following entry showed signs of a lowered standard (early/chased entry, or an incomplete ICC checklist).`,
    possibleInterpretation: 'The discomfort of the first loss may be lowering the confirmation standard used for the next decision — a pattern of loss → discomfort → need to repair the day → lower entry standard, not simply "overtrading."',
    evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: null,
    recommendedPromptKey: 'post_loss_standard',
  };
}

/** Pattern: trades marked "Took Profit Early" that were also winners — cutting winners short. */
function detectCuttingWinnersEarly(trades) {
  const flagged = trades.filter((t) => (t.exitTags || []).includes('Took Profit Early') && isWin(t));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'cutting_winners_early',
    evidenceCount: flagged.length,
    supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} winning trades were tagged "Took Profit Early" rather than exiting per the original plan.`,
    possibleInterpretation: 'Discomfort with an open profit may be driving the exit decision more than the trade’s actual invalidation condition.',
    evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: null,
    recommendedPromptKey: 'cutting_winners',
  };
}

/** Pattern: stop moved mid-trade. */
function detectMovingStops(trades) {
  const flagged = trades.filter((t) => (t.ruleViolations || []).includes('Moved stop'));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'moving_stops',
    evidenceCount: flagged.length,
    supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades recorded "Moved stop" as a rule violation.`,
    possibleInterpretation: 'The stop placed before entry may not be holding once the trade is live — worth separating a genuinely new invalidation signal from discomfort with the open position.',
    evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: 'p1-10',
    recommendedPromptKey: 'moving_stops',
  };
}

/** Pattern: position size increases the trade immediately following a win. */
function detectOversizingAfterWins(trades) {
  const sorted = [...trades].sort((a, b) => new Date(a.entryTime || a.createdAt) - new Date(b.entryTime || b.createdAt));
  const flagged = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (!isWin(sorted[i])) continue;
    const cur = sorted[i].contracts, next = sorted[i + 1].contracts;
    if (cur && next && next > cur) flagged.push(sorted[i + 1]);
  }
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'oversizing_after_wins',
    evidenceCount: flagged.length,
    supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades increased position size immediately after a winning trade.`,
    possibleInterpretation: 'A recent win may be read as permission to take more risk, even though the win itself doesn’t change what a safe position size actually is.',
    evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: 'p1-11',
    recommendedPromptKey: 'oversizing_after_wins',
  };
}

/** Shared factory for detectors gated on a single self-tagged methodQualityTags value. */
function detectMethodQualityTag(trades, tag, patternType, promptKey, recommendedLessonId, interpretation) {
  const flagged = trades.filter((t) => (t.methodQualityTags || []).includes(tag));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType, evidenceCount: flagged.length, supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades were self-tagged "${tag.replace(/_/g, ' ')}".`,
    possibleInterpretation: interpretation, evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: recommendedLessonId || null, recommendedPromptKey: promptKey,
  };
}

/** Pattern: entering against the saved 4H/1H bias. */
function detectEntriesAgainstSavedBias(trades) {
  return detectMethodQualityTag(trades, 'against_bias', 'entries_against_saved_bias', 'against_bias', 'p1-3',
    'Entering against the saved 4H/1H bias may reflect a genuinely mixed chart being forced into a directional read — worth separating a real structure shift from a bias that was never confirmed in the first place.');
}

/** Pattern: entering while the market was self-tagged as consolidating. */
function detectEntriesDuringConsolidation(trades) {
  return detectMethodQualityTag(trades, 'during_consolidation', 'entries_during_consolidation', 'during_consolidation', null,
    'Consolidation changes how much a setup can be trusted — entering during it repeatedly may be a sign of forcing a trade when the saved plan actually calls for waiting.');
}

/** Pattern: a trade broke a saved rule but still made money — the outcome-bias mirror case (a rule-following loss is not automatically a mistake; a rule-breaking win is not automatically good execution). */
function detectProfitableRuleViolations(trades) {
  const flagged = trades.filter((t) => (t.ruleViolations || []).length && isWin(t));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'profitable_rule_violation', evidenceCount: flagged.length, supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades recorded a rule violation and still closed as a win.`,
    possibleInterpretation: 'A profitable outcome doesn’t mean the rule violation was good execution — outcome and process are two different questions, and this is exactly the case where it’s easy to mistake one for the other.',
    evidenceStrength: evidenceStrengthForCount(flagged.length), recommendedLessonId: null, recommendedPromptKey: 'profitable_rule_violation',
  };
}

/**
 * Pattern: the daily-loss-limit rule specifically was broken more than once
 * — this is how "repeatedly bypassing trading limits" (a spec safety
 * category) surfaces without a new pre-AI regex category: a behavioral
 * frequency pattern can't be read from one message's text, but this
 * detector's output reaches the model via <observed_data>.detectedPatterns
 * exactly like every other pattern, and the routing block's existing
 * intent enum (risk_management_issue / safety_escalation) already covers
 * how the model should treat it.
 */
function detectRepeatedLimitBypass(trades) {
  const flagged = trades.filter((t) => (t.ruleViolations || []).includes('Broke daily loss rule'));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'repeated_limit_bypass', evidenceCount: flagged.length, supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades recorded "Broke daily loss rule" as a rule violation.`,
    possibleInterpretation: 'A saved daily loss limit exists specifically to remove a decision from the moment it’s hardest to make well — repeatedly bypassing it is worth naming directly rather than treating as a one-off.',
    evidenceStrength: evidenceStrengthForCount(flagged.length), recommendedLessonId: null, recommendedPromptKey: 'repeated_limit_bypass',
  };
}

/** Pattern: execution quality differs meaningfully between checklist-complete and checklist-incomplete trades. */
function detectChecklistCompletionEffect(trades, checklists) {
  const linked = new Map(checklists.map((c) => [c.id, c]));
  const withScore = trades.filter((t) => t.checklistId && t.executionScore != null);
  const complete = withScore.filter((t) => (linked.get(t.checklistId)?.completionPct || 0) === 100);
  const incomplete = withScore.filter((t) => (linked.get(t.checklistId)?.completionPct || 0) < 100);
  if (complete.length < MIN_SAMPLE || incomplete.length < MIN_SAMPLE) return null;
  const avg = (list) => list.reduce((s, t) => s + t.executionScore, 0) / list.length;
  const completeAvg = avg(complete), incompleteAvg = avg(incomplete);
  if (Math.abs(completeAvg - incompleteAvg) < 8) return null; // not a meaningful gap
  return {
    patternType: 'checklist_completion_effect',
    evidenceCount: complete.length + incomplete.length,
    supportingRecordIds: [...complete, ...incomplete].map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `Average execution score was ${Math.round(completeAvg)} on trades with a fully completed checklist, versus ${Math.round(incompleteAvg)} on trades without one (${complete.length} vs ${incomplete.length} trades).`,
    possibleInterpretation: completeAvg > incompleteAvg
      ? 'Completing the checklist before entry may be functioning as a real discipline mechanism, not just a formality.'
      : 'A completed checklist alone doesn’t appear to be enough on its own to lift execution quality here — worth exploring what else differs between these trades.',
    evidenceStrength: evidenceStrengthForCount(Math.min(complete.length, incomplete.length)),
    recommendedLessonId: null,
    recommendedPromptKey: 'checklist_effect',
  };
}

/**
 * Pattern: walking away from — or exiting per-rule out of — a setup rather
 * than forcing it. This is a genuine discipline win, not a risk to flag;
 * it's the one detector this file feeds to Share My Win (via
 * agent-tools.js's propose_win_share action) rather than to a coaching
 * concern. Same MIN_SAMPLE gate as every other detector — never proposed
 * below real evidence.
 */
function detectWalkedAwayStreak(trades) {
  const flagged = trades.filter((t) =>
    (t.exitTags || []).includes('Trade Invalidated')
    || (t.exitTags || []).includes('Rule-Based Exit')
    || (t.ruleCheck === 'yes' && isLoss(t)));
  if (flagged.length < MIN_SAMPLE) return null;
  return {
    patternType: 'walked_away_discipline_streak',
    evidenceCount: flagged.length,
    supportingRecordIds: flagged.map((t) => t.id),
    evidenceWindow: dateRangeOf(trades),
    observedFacts: `${flagged.length} trades showed a rule-based or invalidation-driven exit rather than forcing the outcome.`,
    possibleInterpretation: 'This looks like a real discipline pattern worth naming — sticking to the plan even when it meant walking away.',
    evidenceStrength: evidenceStrengthForCount(flagged.length),
    recommendedLessonId: null,
    recommendedPromptKey: 'walked_away_win',
  };
}

const DETECTORS = [
  detectPostLossLowerStandards, detectCuttingWinnersEarly, detectMovingStops, detectOversizingAfterWins,
  detectEntriesAgainstSavedBias, detectEntriesDuringConsolidation, detectProfitableRuleViolations, detectRepeatedLimitBypass,
  detectWalkedAwayStreak,
];

/**
 * Runs every detector and returns only the patterns that cleared their
 * minimum evidence bar — never a fabricated pattern below threshold.
 * `checklists` is optional; detectors that need it degrade gracefully
 * without it.
 */
export function detectPatterns(trades = [], checklists = []) {
  const results = DETECTORS.map((fn) => fn(trades)).filter(Boolean);
  const checklistPattern = detectChecklistCompletionEffect(trades, checklists);
  if (checklistPattern) results.push(checklistPattern);
  return results;
}
