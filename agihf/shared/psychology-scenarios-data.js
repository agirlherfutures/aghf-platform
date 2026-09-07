/**
 * psychology-scenarios-data.js — A Girl & Her Futures™
 *
 * Static, versioned content for the Psychology Scenario Lab — matches the
 * curriculum-data.js/lessons-data/*.json convention (a small curated
 * corpus, not a DB table or vector store). Editable here without a
 * migration; a future admin tool can read/write this same shape.
 *
 * Scoring philosophy (per spec): a response is never rewarded for a
 * profitable hypothetical outcome. `isBestProcess` marks the response
 * that follows the plan / respects risk / waits for confirmation /
 * accepts uncertainty — that response always scores 100; every other
 * option's `processScore` reflects how close its reasoning is to that,
 * regardless of what price "would have done next."
 */

export const CONTENT_VERSION = 1;

export const PSYCHOLOGY_SCENARIOS = [
  {
    id: 'fomo-chasing-breakout',
    title: 'The Breakout You Almost Caught',
    category: 'FOMO / Chasing',
    difficulty: 'starter',
    situation: 'MNQ breaks a key high on a strong 1M close while you’re getting coffee. By the time you’re back at your screen, price is already 15 points past the level and still climbing.',
    iccContext: 'Continuation already confirmed and the retest window has likely passed — entering now means buying without a defended swing nearby.',
    trigger: 'Fear of missing a move that already happened.',
    options: [
      { id: 'a', label: 'Enter right now at market — it’s clearly still going', isBestProcess: false, processScore: 15, feedback: 'This enters without a defended swing or a fresh retest — the risk is undefined, even if price keeps climbing.' },
      { id: 'b', label: 'Mark it missed, note the level, and wait for a new setup', isBestProcess: true, processScore: 100, feedback: 'This is the process-respecting choice. A missed move costs nothing; a chased entry risks real money on an undefined stop.' },
      { id: 'c', label: 'Wait to see if price pulls back to the broken level for a retest', isBestProcess: false, processScore: 70, feedback: 'Reasonable instinct, but only if you’re prepared to walk away entirely if no retest comes — otherwise this quietly becomes "wait to chase."' },
    ],
    principle: 'Missing an entry costs nothing. An undefined-risk entry can cost real money.',
    reflectionPrompt: 'What would make it easier to let a missed move stay missed next time?',
  },
  {
    id: 'revenge-after-two-losses',
    title: 'Two Losses In, Still In The Chair',
    category: 'Revenge Trading',
    difficulty: 'core',
    situation: 'You’ve taken two losing trades this morning, both valid setups that just didn’t work out. You’re at your saved max-trades limit for the day, but a third setup just started forming.',
    iccContext: 'The setup itself may be perfectly valid — the question isn’t about the chart, it’s about the saved daily plan.',
    trigger: 'Wanting to end the day on a win instead of two losses.',
    options: [
      { id: 'a', label: 'Take it — the setup looks clean and I can make it back', isBestProcess: false, processScore: 10, feedback: 'The setup being clean doesn’t override a limit you set for yourself precisely to protect you from this exact moment.' },
      { id: 'b', label: 'Stick to today’s trade limit and end the session', isBestProcess: true, processScore: 100, feedback: 'This is the plan working exactly as designed — the limit exists for the day you’d most want to break it.' },
      { id: 'c', label: 'Take it, but with half the normal size', isBestProcess: false, processScore: 35, feedback: 'Smaller size doesn’t address the actual issue — the daily limit was already reached, not the risk-per-trade.' },
    ],
    principle: 'A daily limit only protects you if it holds on the day it’s hardest to keep.',
    reflectionPrompt: 'What does it feel like, physically, right before you decide to take "one more"?',
  },
  {
    id: 'overconfidence-winning-streak',
    title: 'Four Wins In A Row',
    category: 'Winning-Streak Overconfidence',
    difficulty: 'core',
    situation: 'You’ve had four winning trades this week, all following your plan closely. A new setup appears and you notice yourself thinking about sizing up "since it’s clearly working."',
    iccContext: 'Nothing about a winning streak changes what a defended swing or a confirmed continuation actually requires.',
    trigger: 'A string of wins being read as permission to take more risk.',
    options: [
      { id: 'a', label: 'Size up — the method is clearly working right now', isBestProcess: false, processScore: 20, feedback: 'A winning streak is evidence the process is working — it isn’t evidence that more risk per trade is now safe.' },
      { id: 'b', label: 'Trade the same planned size as every other day', isBestProcess: true, processScore: 100, feedback: 'This keeps the variable that actually earned the streak — consistent, planned risk — unchanged.' },
      { id: 'c', label: 'Skip the trade entirely to "protect" the winning week', isBestProcess: false, processScore: 45, feedback: 'This avoids the overconfidence trap but overcorrects — a valid setup within your plan doesn’t need to be skipped out of superstition either.' },
    ],
    principle: 'Profit is not proof a rule can be broken safely. The plan that produced the streak is the plan worth keeping.',
    reflectionPrompt: 'Where does the thought "I can afford to risk more" usually show up first — before, during, or after you see the setup?',
  },
  {
    id: 'moving-the-stop',
    title: 'The Stop Feels Too Close',
    category: 'Widening or Removing a Stop',
    difficulty: 'core',
    situation: 'You’re in a trade and price is drifting toward your stop-loss without triggering it. It hasn’t body-closed beyond your defended swing, but it’s close, and you’re tempted to give it "a little more room."',
    iccContext: 'The stop was placed at the defended swing for a reason — moving it after entry changes the risk you originally agreed to.',
    trigger: 'Hoping to avoid a loss that hasn’t happened yet.',
    options: [
      { id: 'a', label: 'Widen the stop a few points to give it room', isBestProcess: false, processScore: 10, feedback: 'This changes the risk you accepted at entry, after the fact, based on hope rather than new structural information.' },
      { id: 'b', label: 'Leave the stop exactly where it was planned', isBestProcess: true, processScore: 100, feedback: 'The stop reflects the invalidation level, not a feeling — leaving it in place respects the plan made before emotion was involved.' },
      { id: 'c', label: 'Close the trade manually now, before it can hit the stop', isBestProcess: false, processScore: 40, feedback: 'This avoids widening risk, but exiting early on drift alone gives up the trade’s actual invalidation test.' },
    ],
    principle: 'A stop that can be moved by discomfort was never really protecting the risk it claimed to.',
    reflectionPrompt: 'What is the actual invalidation condition for this trade — and has it happened yet?',
  },
  {
    id: 'trading-during-consolidation',
    title: 'The Range That Won’t Resolve',
    category: 'Trading During Consolidation',
    difficulty: 'starter',
    situation: 'Price has been chopping sideways for the last hour. A setup that would normally look clean appears, but it’s forming inside this same range.',
    iccContext: 'Consolidation is one of the explicit checklist watch-items — a setup that would be valid in a trending market carries more risk here.',
    trigger: 'Wanting a setup to be clean simply because the pieces are technically present.',
    options: [
      { id: 'a', label: 'Take it — the setup itself still checks the ICC boxes', isBestProcess: false, processScore: 30, feedback: 'Checking the mechanical boxes doesn’t cancel out the checklist’s own consolidation warning.' },
      { id: 'b', label: 'Pass and wait for the range to actually resolve first', isBestProcess: true, processScore: 100, feedback: 'This respects the checklist’s consolidation flag rather than overriding it because the setup looks tempting.' },
      { id: 'c', label: 'Take it with a smaller size "just in case"', isBestProcess: false, processScore: 55, feedback: 'Reducing size acknowledges the extra risk, but the checklist calls for waiting, not for trading it smaller.' },
    ],
    principle: 'A setup can be technically present and still be a low-quality trade because of where it’s happening.',
    reflectionPrompt: 'What would you need to see to call this range actually resolved?',
  },
  {
    id: 'cutting-a-winner-early',
    title: 'Up Nicely, Tempted to Close',
    category: 'Cutting a Winner Early',
    difficulty: 'core',
    situation: 'A trade is well into profit and still moving in your favor with no invalidation signal. Your hand is hovering over the close button "just to lock it in."',
    iccContext: 'Your saved target/plan hasn’t been hit and nothing on the chart has structurally changed.',
    trigger: 'Fear of giving back an unrealized gain.',
    options: [
      { id: 'a', label: 'Close it now to protect the gain', isBestProcess: false, processScore: 35, feedback: 'This exits based on the size of the number showing, not on anything the chart has actually done.' },
      { id: 'b', label: 'Manage it per the plan you set before entry (partial, trail, or hold to target)', isBestProcess: true, processScore: 100, feedback: 'This lets the plan you made with a clear head — not the discomfort of watching a number — decide the exit.' },
      { id: 'c', label: 'Move the stop to breakeven and let the rest run', isBestProcess: false, processScore: 75, feedback: 'A reasonable management choice if it was part of the original plan — worth noting whether this was decided in advance or improvised in the moment.' },
    ],
    principle: 'An unrealized gain isn’t a reason to abandon a plan any more than an unrealized loss is.',
    reflectionPrompt: 'Was this exit decision made before you entered, or while watching the number move?',
  },
  {
    id: 'comparing-with-another-trader',
    title: 'Someone Else’s Trade Idea',
    category: 'Comparing With Another Trader',
    difficulty: 'starter',
    situation: 'You see someone in a trading community post a trade that’s already up significantly. It doesn’t match a setup you’ve identified yourself today.',
    iccContext: 'Nothing here has been through your own checklist — this is someone else’s completed decision, not your setup.',
    trigger: 'Comparing your own (quieter) day to someone else’s visible win.',
    options: [
      { id: 'a', label: 'Look for a way into the same move, even late', isBestProcess: false, processScore: 15, feedback: 'This borrows someone else’s already-completed decision without your own checklist ever being involved.' },
      { id: 'b', label: 'Notice the comparison, and return to your own plan for today', isBestProcess: true, processScore: 100, feedback: 'This keeps the decision anchored to your own saved plan rather than someone else’s outcome.' },
      { id: 'c', label: 'Study the setup afterward to see if it’s a pattern worth learning', isBestProcess: false, processScore: 60, feedback: 'Fine as a later, unhurried review — just worth noticing if "studying" is actually a way of still chasing it right now.' },
    ],
    principle: 'Another trader’s outcome was never information about your own setup today.',
    reflectionPrompt: 'What does it feel like in your body when you see someone else’s winning trade posted?',
  },
];

export function getScenarioById(id) {
  return PSYCHOLOGY_SCENARIOS.find((s) => s.id === id) || null;
}
