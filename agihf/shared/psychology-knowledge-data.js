/**
 * psychology-knowledge-data.js — A Girl & Her Futures™
 *
 * Curated trading-performance-psychology knowledge for the AGHF Agent —
 * the "smallest practical architecture" for grounding the agent per the
 * feature spec: no vector DB, no external corpus, a small static module
 * matching curriculum-data.js's own convention (versioned, rarely-changing
 * content, imported directly rather than fetched). Every entry is
 * AGHF-authored educational explanation, never attributed to a specific
 * book/study/author/quotation that hasn't actually been approved and
 * added here — nothing in this file is a fabricated citation.
 *
 * `findKnowledgeEntries(topic)` does a simple keyword/tag match; there is
 * no embeddings/semantic search here by design (the corpus is small and
 * curated, not a large unstructured library) — if that changes later,
 * this file's shape (title/sourceType/content/topicTags/accessTier/
 * approvalStatus/version/relatedLessonId/relatedChartLabId/dates) is
 * meant to survive a swap to a real retrieval backend without the
 * calling code (agent-tools.js's retrieve_lesson_or_concept) changing.
 */

export const CONTENT_VERSION = 1;

function entry(title, tags, content) {
  return {
    title, sourceType: 'aghf_curated', content, topicTags: tags,
    accessTier: 'free', approvalStatus: 'approved', version: CONTENT_VERSION,
    relatedLessonId: null, relatedChartLabId: null,
    dateAdded: '2026-09-06', dateUpdated: '2026-09-06',
  };
}

export const PSYCHOLOGY_KNOWLEDGE = [
  entry('FOMO (Fear of Missing Out)', ['fomo', 'chasing', 'missed entry'],
    'Shows up as chasing a move that already happened — entering after confirmation has passed, sizing up mid-move, or abandoning a plan the moment price runs without you. The urgency comes from comparing your current position to an imagined one, not from anything the chart is currently offering.'),
  entry('Revenge Trading', ['revenge trading', 'after a loss', 'repair the day'],
    'Taking a trade — often lower-quality, oversized, or outside the plan — specifically to "get back" a loss or restore a feeling of control. It is driven by the discomfort of an unfinished day more than by an actual new setup.'),
  entry('Fear of Entering', ['fear of entering', 'hesitation'],
    'Hesitating on a setup that has actually met every saved criterion. Often it is not fear of the setup itself but fear of being wrong again, of a prior loss repeating, or of not fully trusting a strategy that is statistically valid but has recently underperformed.'),
  entry('Fear of Losing', ['fear of losing'],
    'A generalized aversion to the outcome of a loss that can distort otherwise sound decisions — cutting winners early to "lock something in," widening stops to avoid a loss registering, or avoiding valid setups altogether.'),
  entry('Hesitation', ['hesitation', 'freezing'],
    'Freezing at the exact moment a plan calls for action. Distinguish two very different causes: the setup is genuinely unclear (a technical-knowledge gap), or the setup is clear and something emotional is in the way — these require completely different responses.'),
  entry('Overtrading', ['overtrading', 'too many trades'],
    'Taking more trades than a saved daily limit allows, often rationalized setup-by-setup even though the pattern only appears across the full session. Usually driven by boredom, a need to "make something happen," or an unprocessed prior loss or win.'),
  entry('Overconfidence', ['overconfidence', 'winning streak'],
    'A string of wins gets read as evidence that more risk is now safe, when the win itself doesn’t change what a sound position size or entry standard actually is. Shows up as skipped checklist steps, larger size, or trading setups just outside the normal criteria.'),
  entry('Recency Bias', ['recency bias'],
    'Overweighting the most recent trade or two when judging whether the current setup or strategy is "working," rather than evaluating the strategy over its actual sample size.'),
  entry('Outcome Bias', ['outcome bias', 'profitable mistake', 'well-executed loss'],
    'Judging a decision by whether it made money rather than by whether it followed a sound process. This produces two mirror-image errors: treating a profitable rule violation as good execution, and treating a well-executed, rule-following loss as a mistake.'),
  entry('Confirmation Bias', ['confirmation bias'],
    'Noticing and weighting evidence that supports a bias already held (e.g. "I think it’s bullish") while discounting structure that contradicts it — often shows up as forcing a bullish read onto a genuinely mixed chart.'),
  entry('Loss Aversion', ['loss aversion'],
    'The psychological weight of a loss is felt more heavily than the pleasure of an equivalent gain, which can drive holding losers too long (avoiding realizing the loss) and cutting winners too early (avoiding the risk of the gain reversing).'),
  entry('Sunk-Cost Thinking', ['sunk cost'],
    'Staying in a trade or holding onto a losing thesis longer because of how much has already been risked or how much time has already been spent, rather than what the current chart evidence actually supports.'),
  entry('Gambler’s Fallacy', ['gambler\'s fallacy', 'due for a win'],
    'The belief that a loss makes a win "due" next, or that several wins increase the odds the next trade will also win — each trade’s outcome is independent of the ones before it.'),
  entry('Risk Desensitization', ['risk desensitization'],
    'Repeated exposure to risk without consequence gradually eroding the discomfort that used to enforce discipline — a stop that once felt significant starts to feel routine, making it easier to widen or ignore.'),
  entry('Strategy Hopping', ['strategy hopping', 'switching strategies'],
    'Abandoning a statistically valid approach after a short losing stretch in favor of a new one, restarting the sample size before the original strategy’s edge had a fair chance to show up.'),
  entry('Performance Anxiety', ['performance anxiety'],
    'Pressure tied to being watched, evaluated, or measured (a prop-firm evaluation, a P&L target) that changes decision-making under otherwise identical setups — often producing either hesitation or forced trades to "prove" something.'),
  entry('Perfectionism', ['perfectionism'],
    'Holding execution to an unrealistic, all-or-nothing standard, where anything short of a flawless trade is treated as a failure — this can quietly discourage consistency by making "good enough and repeatable" feel unacceptable.'),
  entry('Self-Sabotaging Behavior', ['self-sabotage'],
    'Patterns that undermine a member’s own stated goals despite knowing better — e.g. consistently entering right before a known invalidation point, or increasing size right when a account is closest to a personal-best.'),
  entry('Dopamine-Seeking / Boredom Trading', ['dopamine', 'boredom trading'],
    'Trading for the stimulation of having a position on, independent of setup quality — often shows up during quiet, low-opportunity market conditions where a "real" setup isn’t present.'),
  entry('Scarcity Thinking', ['scarcity thinking'],
    'Treating a single trade or session as the only chance to make money, rather than one instance in a long series — this pressure tends to lower entry standards and shrink patience.'),
  entry('Prop-Firm Evaluation Pressure', ['prop firm', 'evaluation pressure'],
    'A funded-account evaluation’s drawdown/profit-target rules can turn genuinely sound setups into "must-work" trades, since a loss now has a consequence beyond the dollar amount — this often produces both hesitation (fear of the eval ending) and overtrading (racing the clock).'),
  entry('Comparison With Other Traders', ['comparing with other traders'],
    'Reacting to someone else’s visible win by trying to enter the same move late, or judging your own quieter day against someone else’s highlight — another trader’s outcome is not information about your own setup.'),
  entry('Cutting Winners Early', ['cutting winners'],
    'Exiting a profitable trade before the plan calls for it, usually to protect the unrealized gain from reversing — discomfort with an open profit driving the exit rather than any actual change in the chart.'),
  entry('Holding Losers', ['holding losers'],
    'Staying in a losing trade past its planned invalidation point, often while waiting/hoping for it to "come back" rather than acting on what the stop was originally meant to protect against.'),
  entry('Moving Stops', ['moving stops'],
    'Widening or removing a stop after entry, which quietly changes the risk that was accepted at the start of the trade — worth separating a genuinely new structural signal from simple discomfort with the position.'),
  entry('Increasing Size Emotionally', ['emotional sizing', 'increasing size'],
    'Changing position size in response to a feeling (confidence after a win, urgency after a loss) rather than a pre-decided plan — the size itself becomes a symptom of the emotional state, not a risk decision.'),
  entry('Need to Be Right', ['need to be right'],
    'Treating a trade’s outcome as a referendum on personal competence, which can make it hard to exit a losing idea, admit a setup was actually unclear, or accept a valid loss without it feeling like a personal failure.'),
  entry('Difficulty Accepting Uncertainty', ['uncertainty'],
    'Trading is probabilistic by nature — a good process still loses sometimes. Difficulty tolerating that uncertainty can show up as needing extra confirmation beyond what the plan calls for, or needing every loss to have a clear "reason" beyond normal variance.'),
  entry('Distrusting a Statistically Valid Strategy', ['distrusting strategy'],
    'After a short losing stretch, doubting a strategy that has a real, larger-sample edge — the doubt is proportional to recent emotion, not to the actual evidence about the strategy’s performance.'),
  entry('Emotional Risk Tolerance', ['emotional risk tolerance', 'position size fit'],
    'The size a trader can hold without her decision-making changing — distinct from the size her account could technically support. A position that is "psychologically incompatible" with a trader will distort her behavior around it even if the math says it’s a reasonable risk.'),
  entry('Process-Based Confidence', ['process confidence'],
    'Confidence built from trusting a repeatable process rather than from a recent string of outcomes — this kind of confidence survives a losing trade because the trade following the process was still "correct" regardless of result.'),
  entry('Building Discipline Through Systems', ['discipline', 'systems'],
    'Discipline that depends on willpower in the moment tends to fail exactly when it’s needed most. Discipline built into a system (a saved checklist, a daily trade limit, a written if-then rule) removes the decision from the emotional moment entirely.'),
  entry('Recovering After Drawdown', ['drawdown recovery'],
    'The instinct after a drawdown is often to "trade it back" quickly — but recovery is more reliably driven by returning to smaller size and stricter rule adherence than by increasing risk to catch up faster.'),
  entry('Accepting a Valid Loss', ['valid loss', 'accepting losses'],
    'A loss that followed every saved rule is not evidence of a mistake — it is the expected cost of a probabilistic strategy. Confusing "I lost" with "I executed badly" is one of the most common sources of unnecessary rule-breaking afterward.'),
  entry('Separating Execution From Outcome', ['execution vs outcome'],
    'Execution quality (did the plan get followed) and outcome (did the trade make money) are two different questions. A trade can be well-executed and losing, or poorly executed and profitable — grading only by outcome trains the wrong lesson.'),
  entry('Technical Uncertainty Disguised as Fear', ['technical uncertainty', 'fear vs setup clarity'],
    'What feels like "fear of entering" is sometimes actually an incompletely understood setup — the hesitation is appropriate caution, not a psychology problem. Worth explicitly checking whether the confirmation sequence was actually complete before assuming the issue is emotional.'),
  entry('Building Consistency Without Perfectionism', ['consistency', 'perfectionism'],
    'Consistency is built from a repeatable, good-enough process applied trade after trade — not from every individual trade being flawless. Chasing a flawless trade often produces more inconsistency, not less, because the standard keeps shifting.'),
];

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
  return scored.slice(0, limit).map((s) => s.entry);
}
