/**
 * journal-insights.js — A Girl & Her Futures™
 *
 * Basic, rule-based pattern insights over a member's already-fetched trade
 * journal entries — no AI/ML, per the product spec's own instruction that
 * simple calculations are enough for now. This module is deliberately
 * structured as a small, independent function per insight so it's the
 * reusable data layer future AI coaching can build on, not a ceiling.
 *
 * Every function takes the same `entries` array (JournalEntryRecord[],
 * entry_type: 'trade' only, already fetched by the caller — this module
 * never fetches anything itself) and returns a single `PatternInsight` or
 * `null` when the sample is too small to say anything meaningful — a
 * suppressed card is always preferred over a fabricated or misleading one.
 */

const MIN_SAMPLE = 3;
const MIN_ICC_SAMPLE = 5;

function pct(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 100) : null;
}

/** "You follow your rules on 86% of your trades." */
function ruleFollowRateInsight(entries) {
  const answered = entries.filter((e) => e.ruleCheck);
  if (answered.length < MIN_SAMPLE) return null;
  const rate = pct(answered.filter((e) => e.ruleCheck === 'yes').length, answered.length);
  return {
    id: 'rule-follow-rate',
    icon: '📏',
    text: `You follow your rules on ${rate}% of your trades.`,
    kind: rate >= 80 ? 'positive' : rate >= 50 ? 'neutral' : 'watch',
  };
}

/** "Your best-performing setup is Dayli ICC Setup (72% over 5 trades)." */
function bestSetupInsight(entries) {
  const groups = {};
  for (const e of entries) {
    for (const tag of e.entryTags || []) {
      if (tag === 'Other') continue;
      (groups[tag] ??= []).push(e);
    }
  }
  let best = null;
  for (const [tag, group] of Object.entries(groups)) {
    if (group.length < MIN_SAMPLE) continue;
    const wins = group.filter((e) => e.outcome === 'win').length;
    const winRate = pct(wins, group.length);
    if (!best || winRate > best.winRate) best = { tag, winRate, n: group.length };
  }
  if (!best) return null;
  return {
    id: 'best-setup',
    icon: '🎯',
    text: `Your best-performing setup is ${best.tag} (${best.winRate}% over ${best.n} trades).`,
    kind: 'positive',
  };
}

/** "You exit early most often when you mark yourself as Anxious." */
function earlyExitEmotionInsight(entries) {
  const earlyExits = entries.filter((e) => (e.exitTags || []).includes('Took Profit Early') && e.emotions?.during?.primary);
  if (earlyExits.length < MIN_SAMPLE) return null;
  const counts = {};
  for (const e of earlyExits) counts[e.emotions.during.primary] = (counts[e.emotions.during.primary] || 0) + 1;
  const [emotion] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return {
    id: 'early-exit-emotion',
    icon: '👀',
    text: `You exit early most often when you mark yourself as ${emotion}.`,
    kind: 'watch',
  };
}

/** "Your directional bias was correct on 64% of trades where you recorded it." */
function biasAccuracyInsight(entries) {
  const answered = entries.filter((e) => e.biasAccuracy && e.biasAccuracy !== 'unsure');
  if (answered.length < MIN_SAMPLE) return null;
  const rate = pct(answered.filter((e) => e.biasAccuracy === 'yes').length, answered.length);
  return {
    id: 'bias-accuracy',
    icon: '🧭',
    text: `Your directional bias was correct on ${rate}% of trades where you recorded it.`,
    kind: rate >= 70 ? 'positive' : rate >= 40 ? 'neutral' : 'watch',
  };
}

/**
 * Compares avg net P&L between trades where every ICC box was checked vs.
 * trades that skipped at least one — phrased in whichever direction the
 * data actually supports, never a fixed narrative.
 */
function iccCompletionInsight(entries) {
  const tagged = entries.filter((e) => (e.entryTags || []).includes('Dayli ICC Setup') && e.iccChecklist);
  if (tagged.length < MIN_ICC_SAMPLE) return null;
  const complete = tagged.filter((e) => Object.values(e.iccChecklist).every(Boolean));
  const incomplete = tagged.filter((e) => !Object.values(e.iccChecklist).every(Boolean));
  if (!complete.length || !incomplete.length) return null;
  const avg = (list) => list.reduce((sum, e) => sum + (e.netPnl || 0), 0) / list.length;
  const completeAvg = avg(complete);
  const incompleteAvg = avg(incomplete);
  const better = completeAvg >= incompleteAvg;
  return {
    id: 'icc-completion',
    icon: '✦',
    text: better
      ? 'Trades where you followed all ICC criteria perform better than trades where you skipped a step.'
      : 'Your ICC-complete and incomplete trades are performing about the same — worth a closer look at what else drives your results.',
    kind: better ? 'positive' : 'neutral',
  };
}

/**
 * @param {import('./dashboard-models.js').JournalEntryRecord[]} entries
 * @returns {import('./dashboard-models.js').PatternInsight[]}
 */
export function computeInsights(entries) {
  return [
    ruleFollowRateInsight(entries),
    bestSetupInsight(entries),
    earlyExitEmotionInsight(entries),
    biasAccuracyInsight(entries),
    iccCompletionInsight(entries),
  ].filter(Boolean);
}
