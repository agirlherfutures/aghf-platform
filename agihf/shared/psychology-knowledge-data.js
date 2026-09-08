/**
 * psychology-knowledge-data.js — A Girl & Her Futures™
 *
 * Curated AGHF/Dayli-ICC-grounded knowledge for the AGHF Agent — the
 * "smallest practical architecture" for grounding the agent per the
 * feature spec: no vector DB, no external corpus, a small static module
 * matching curriculum-data.js's own convention (versioned, rarely-changing
 * content, imported directly rather than fetched). Every entry is
 * AGHF-authored educational explanation, never attributed to a specific
 * book/study/author/quotation that hasn't actually been approved and
 * added here — nothing in this file is a fabricated citation.
 *
 * Two content families live in this one pool, distinguished by
 * `sourceType`: `aghf_curated` (trading-psychology concepts, authored here)
 * and `dayli_icc_curriculum` / `checklist_rule` / `academy_glossary`
 * (Dayli ICC method facts, always re-derived from checklist-template.js —
 * the app's one canonical rules source — never re-authored here, so the
 * method never has two disagreeing descriptions).
 *
 * `findKnowledgeEntries(topic)` does a simple keyword/tag match; there is
 * no embeddings/semantic search here by design (the corpus is small and
 * curated, not a large unstructured library) — if that changes later,
 * this file's shape (id/title/sourceType/content/topicTags/accessTier/
 * approvalStatus/version/relatedLessonId/relatedChartLabId/dates) is
 * meant to survive a swap to a real retrieval backend without the
 * calling code (agent-context-builder.js's deterministic per-turn lookup,
 * which appends a match as the system prompt's <approved_sources> block)
 * changing. `id` exists for citation/future-edit tracking, not currently
 * shown to members.
 */

import { GOLDEN_RULE, WALK_AWAY_CONDITIONS, TIMEFRAME_ROLES } from './checklist-template.js';

export const CONTENT_VERSION = 1;

function entry(id, title, tags, content, opts = {}) {
  return {
    id, title, sourceType: opts.sourceType || 'aghf_curated', content, topicTags: tags,
    accessTier: 'free', approvalStatus: 'approved', version: opts.version || CONTENT_VERSION,
    relatedLessonId: opts.relatedLessonId || null, relatedChartLabId: null,
    dateAdded: '2026-09-06', dateUpdated: '2026-09-08',
  };
}

export const PSYCHOLOGY_KNOWLEDGE = [
  entry('fomo', 'FOMO (Fear of Missing Out)', ['fomo', 'chasing', 'missed entry'],
    'Shows up as chasing a move that already happened — entering after confirmation has passed, sizing up mid-move, or abandoning a plan the moment price runs without you. The urgency comes from comparing your current position to an imagined one, not from anything the chart is currently offering.'),
  entry('revenge-trading', 'Revenge Trading', ['revenge trading', 'after a loss', 'repair the day'],
    'Taking a trade — often lower-quality, oversized, or outside the plan — specifically to "get back" a loss or restore a feeling of control. It is driven by the discomfort of an unfinished day more than by an actual new setup.'),
  entry('fear-of-entering', 'Fear of Entering', ['fear of entering', 'hesitation'],
    'Hesitating on a setup that has actually met every saved criterion. Often it is not fear of the setup itself but fear of being wrong again, of a prior loss repeating, or of not fully trusting a strategy that is statistically valid but has recently underperformed.'),
  entry('fear-of-losing', 'Fear of Losing', ['fear of losing'],
    'A generalized aversion to the outcome of a loss that can distort otherwise sound decisions — cutting winners early to "lock something in," widening stops to avoid a loss registering, or avoiding valid setups altogether.'),
  entry('hesitation', 'Hesitation', ['hesitation', 'freezing'],
    'Freezing at the exact moment a plan calls for action. Distinguish two very different causes: the setup is genuinely unclear (a technical-knowledge gap), or the setup is clear and something emotional is in the way — these require completely different responses.'),
  entry('overtrading', 'Overtrading', ['overtrading', 'too many trades'],
    'Taking more trades than a saved daily limit allows, often rationalized setup-by-setup even though the pattern only appears across the full session. Usually driven by boredom, a need to "make something happen," or an unprocessed prior loss or win.'),
  entry('overconfidence', 'Overconfidence', ['overconfidence', 'winning streak'],
    'A string of wins gets read as evidence that more risk is now safe, when the win itself doesn’t change what a sound position size or entry standard actually is. Shows up as skipped checklist steps, larger size, or trading setups just outside the normal criteria.'),
  entry('recency-bias', 'Recency Bias', ['recency bias'],
    'Overweighting the most recent trade or two when judging whether the current setup or strategy is "working," rather than evaluating the strategy over its actual sample size.'),
  entry('outcome-bias', 'Outcome Bias', ['outcome bias', 'profitable mistake', 'well-executed loss'],
    'Judging a decision by whether it made money rather than by whether it followed a sound process. This produces two mirror-image errors: treating a profitable rule violation as good execution, and treating a well-executed, rule-following loss as a mistake.'),
  entry('confirmation-bias', 'Confirmation Bias', ['confirmation bias'],
    'Noticing and weighting evidence that supports a bias already held (e.g. "I think it’s bullish") while discounting structure that contradicts it — often shows up as forcing a bullish read onto a genuinely mixed chart.',
    { relatedLessonId: 'p1-3' }),
  entry('loss-aversion', 'Loss Aversion', ['loss aversion'],
    'The psychological weight of a loss is felt more heavily than the pleasure of an equivalent gain, which can drive holding losers too long (avoiding realizing the loss) and cutting winners too early (avoiding the risk of the gain reversing).'),
  entry('sunk-cost-thinking', 'Sunk-Cost Thinking', ['sunk cost'],
    'Staying in a trade or holding onto a losing thesis longer because of how much has already been risked or how much time has already been spent, rather than what the current chart evidence actually supports.'),
  entry('gamblers-fallacy', 'Gambler’s Fallacy', ['gambler\'s fallacy', 'due for a win'],
    'The belief that a loss makes a win "due" next, or that several wins increase the odds the next trade will also win — each trade’s outcome is independent of the ones before it.'),
  entry('risk-desensitization', 'Risk Desensitization', ['risk desensitization'],
    'Repeated exposure to risk without consequence gradually eroding the discomfort that used to enforce discipline — a stop that once felt significant starts to feel routine, making it easier to widen or ignore.'),
  entry('strategy-hopping', 'Strategy Hopping', ['strategy hopping', 'switching strategies'],
    'Abandoning a statistically valid approach after a short losing stretch in favor of a new one, restarting the sample size before the original strategy’s edge had a fair chance to show up.'),
  entry('performance-anxiety', 'Performance Anxiety', ['performance anxiety'],
    'Pressure tied to being watched, evaluated, or measured (a prop-firm evaluation, a P&L target) that changes decision-making under otherwise identical setups — often producing either hesitation or forced trades to "prove" something.'),
  entry('perfectionism', 'Perfectionism', ['perfectionism'],
    'Holding execution to an unrealistic, all-or-nothing standard, where anything short of a flawless trade is treated as a failure — this can quietly discourage consistency by making "good enough and repeatable" feel unacceptable.'),
  entry('self-sabotaging-behavior', 'Self-Sabotaging Behavior', ['self-sabotage'],
    'Patterns that undermine a member’s own stated goals despite knowing better — e.g. consistently entering right before a known invalidation point, or increasing size right when a account is closest to a personal-best.'),
  entry('dopamine-boredom-trading', 'Dopamine-Seeking / Boredom Trading', ['dopamine', 'boredom trading'],
    'Trading for the stimulation of having a position on, independent of setup quality — often shows up during quiet, low-opportunity market conditions where a "real" setup isn’t present.'),
  entry('scarcity-thinking', 'Scarcity Thinking', ['scarcity thinking'],
    'Treating a single trade or session as the only chance to make money, rather than one instance in a long series — this pressure tends to lower entry standards and shrink patience.'),
  entry('prop-firm-evaluation-pressure', 'Prop-Firm Evaluation Pressure', ['prop firm', 'evaluation pressure'],
    'A funded-account evaluation’s drawdown/profit-target rules can turn genuinely sound setups into "must-work" trades, since a loss now has a consequence beyond the dollar amount — this often produces both hesitation (fear of the eval ending) and overtrading (racing the clock).'),
  entry('comparison-with-other-traders', 'Comparison With Other Traders', ['comparing with other traders'],
    'Reacting to someone else’s visible win by trying to enter the same move late, or judging your own quieter day against someone else’s highlight — another trader’s outcome is not information about your own setup.'),
  entry('cutting-winners-early', 'Cutting Winners Early', ['cutting winners'],
    'Exiting a profitable trade before the plan calls for it, usually to protect the unrealized gain from reversing — discomfort with an open profit driving the exit rather than any actual change in the chart.'),
  entry('holding-losers', 'Holding Losers', ['holding losers'],
    'Staying in a losing trade past its planned invalidation point, often while waiting/hoping for it to "come back" rather than acting on what the stop was originally meant to protect against.'),
  entry('moving-stops', 'Moving Stops', ['moving stops'],
    'Widening or removing a stop after entry, which quietly changes the risk that was accepted at the start of the trade — worth separating a genuinely new structural signal from simple discomfort with the position.',
    { relatedLessonId: 'p1-10' }),
  entry('increasing-size-emotionally', 'Increasing Size Emotionally', ['emotional sizing', 'increasing size'],
    'Changing position size in response to a feeling (confidence after a win, urgency after a loss) rather than a pre-decided plan — the size itself becomes a symptom of the emotional state, not a risk decision.',
    { relatedLessonId: 'p1-11' }),
  entry('need-to-be-right', 'Need to Be Right', ['need to be right'],
    'Treating a trade’s outcome as a referendum on personal competence, which can make it hard to exit a losing idea, admit a setup was actually unclear, or accept a valid loss without it feeling like a personal failure.'),
  entry('difficulty-accepting-uncertainty', 'Difficulty Accepting Uncertainty', ['uncertainty'],
    'Trading is probabilistic by nature — a good process still loses sometimes. Difficulty tolerating that uncertainty can show up as needing extra confirmation beyond what the plan calls for, or needing every loss to have a clear "reason" beyond normal variance.'),
  entry('distrusting-valid-strategy', 'Distrusting a Statistically Valid Strategy', ['distrusting strategy'],
    'After a short losing stretch, doubting a strategy that has a real, larger-sample edge — the doubt is proportional to recent emotion, not to the actual evidence about the strategy’s performance.'),
  entry('emotional-risk-tolerance', 'Emotional Risk Tolerance', ['emotional risk tolerance', 'position size fit'],
    'The size a trader can hold without her decision-making changing — distinct from the size her account could technically support. A position that is "psychologically incompatible" with a trader will distort her behavior around it even if the math says it’s a reasonable risk.',
    { relatedLessonId: 'p1-11' }),
  entry('process-based-confidence', 'Process-Based Confidence', ['process confidence'],
    'Confidence built from trusting a repeatable process rather than from a recent string of outcomes — this kind of confidence survives a losing trade because the trade following the process was still "correct" regardless of result.'),
  entry('discipline-through-systems', 'Building Discipline Through Systems', ['discipline', 'systems'],
    'Discipline that depends on willpower in the moment tends to fail exactly when it’s needed most. Discipline built into a system (a saved checklist, a daily trade limit, a written if-then rule) removes the decision from the emotional moment entirely.'),
  entry('recovering-after-drawdown', 'Recovering After Drawdown', ['drawdown recovery'],
    'The instinct after a drawdown is often to "trade it back" quickly — but recovery is more reliably driven by returning to smaller size and stricter rule adherence than by increasing risk to catch up faster.'),
  entry('accepting-a-valid-loss', 'Accepting a Valid Loss', ['valid loss', 'accepting losses'],
    'A loss that followed every saved rule is not evidence of a mistake — it is the expected cost of a probabilistic strategy. Confusing "I lost" with "I executed badly" is one of the most common sources of unnecessary rule-breaking afterward.'),
  entry('execution-vs-outcome', 'Separating Execution From Outcome', ['execution vs outcome'],
    'Execution quality (did the plan get followed) and outcome (did the trade make money) are two different questions. A trade can be well-executed and losing, or poorly executed and profitable — grading only by outcome trains the wrong lesson.'),
  entry('technical-uncertainty-vs-fear', 'Technical Uncertainty Disguised as Fear', ['technical uncertainty', 'fear vs setup clarity'],
    'What feels like "fear of entering" is sometimes actually an incompletely understood setup — the hesitation is appropriate caution, not a psychology problem. Worth explicitly checking whether the confirmation sequence was actually complete before assuming the issue is emotional.',
    { relatedLessonId: 'p1-15' }),
  entry('consistency-without-perfectionism', 'Building Consistency Without Perfectionism', ['consistency', 'perfectionism'],
    'Consistency is built from a repeatable, good-enough process applied trade after trade — not from every individual trade being flawless. Chasing a flawless trade often produces more inconsistency, not less, because the standard keeps shifting.'),

  // ── Dayli ICC method knowledge — content re-derived from
  // checklist-template.js (the app's one canonical rules source), never
  // re-authored here, so the method never has two disagreeing versions.
  entry('icc-flow-overview', 'The Indication → Correction → Continuation Flow', ['icc', 'dayli icc method', 'indication', 'correction', 'continuation'],
    `${GOLDEN_RULE.intro} ${GOLDEN_RULE.phaseRules.map((r) => `${r.phase}: ${r.text}`).join(' ')} ${GOLDEN_RULE.bottomLine}`,
    { sourceType: 'dayli_icc_curriculum' }),
  entry('candle-close-confirmation', 'Why Only a Candle-Body Close Counts', ['candle close', 'wick', 'confirmation'],
    `${GOLDEN_RULE.intro} ${GOLDEN_RULE.bottomLine} A wick through a level is a tease, not confirmation — it is never treated as Indication or Continuation.`,
    { sourceType: 'checklist_rule' }),
  entry('timeframe-roles', 'What Each Timeframe Is For', ['timeframes', '4h', '1h', '15m', '1m'],
    `${TIMEFRAME_ROLES.map((r) => `${r.timeframe}: ${r.role}`).join(' ')}`,
    { sourceType: 'dayli_icc_curriculum' }),
  entry('walk-away-conditions', 'Walk-Away Conditions', ['walk away', 'no trade', 'invalidation'],
    `Conditions under which there is no trade, regardless of how the chart otherwise looks: ${WALK_AWAY_CONDITIONS.map((c) => `${c.title} — ${c.text}`).join('; ')}.`,
    { sourceType: 'checklist_rule' }),
  entry('pre-indication-level', 'Pre-Indication Level (PIL)', ['pil', 'pre-indication level'],
    'The active swing level price has not yet broken or retested. Once a 1M candle body-closes through it, the PIL becomes the Defended Swing for that setup — the reference point the Continuation entry and stop-loss are built around.',
    { sourceType: 'academy_glossary' }),
  entry('defended-swing', 'Defended Swing', ['defended swing'],
    'Once a 1M candle body-closes through the active Pre-Indication Level, that level becomes the Defended Swing for the setup — invalidated if price later body-closes back beyond it in the opposite direction.',
    { sourceType: 'academy_glossary' }),
  entry('daily-trade-limits', 'Daily Risk and Trade Limits', ['max risk', 'max trades', 'daily limit'],
    'Deciding maximum risk and maximum number of trades before the session starts — not during a trade — is part of the saved plan, not an afterthought. Reaching either limit means the session is done, not a decision to re-negotiate in the moment.',
    { sourceType: 'checklist_rule' }),
  entry('missed-entry-no-chase', 'A Missed Entry Is Not a Signal to Chase', ['missed trade', 'chasing', 'limit not filled'],
    `If a limit order at the defended swing level didn't fill and price moved away, that's a missed trade — not a reason to chase with a market order. ${WALK_AWAY_CONDITIONS.find((c) => c.title === 'Limit wasn’t filled')?.text || 'No market orders after a missed fill.'}`,
    { sourceType: 'checklist_rule' }),
];

/**
 * Simple keyword/tag scoring, plus a conflict flag: if the top matches for
 * a query span more than one distinct content `version`, every returned
 * entry is marked `versionConflict: true` so the caller can tell the model
 * to flag the discrepancy to the member rather than silently pick one
 * (the spec's explicit "flag conflicting method versions" requirement).
 * There's only ever one version today (CONTENT_VERSION = 1 for every
 * entry), so this never fires yet — it's the mechanism, ready for the day
 * a method update actually creates two versions of the same topic.
 */
export function findKnowledgeEntries(query, limit = 3) {
  if (!query) return [];
  const q = query.toLowerCase();
  const scored = PSYCHOLOGY_KNOWLEDGE.map((e) => {
    let score = 0;
    if (e.title.toLowerCase().includes(q)) score += 3;
    e.topicTags.forEach((tag) => { if (q.includes(tag) || tag.includes(q)) score += 2; });
    if (e.content.toLowerCase().includes(q)) score += 1;
    return { entry: e, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).map((s) => s.entry);
  const versions = new Set(top.map((e) => e.version));
  return versions.size > 1 ? top.map((e) => ({ ...e, versionConflict: true })) : top;
}
