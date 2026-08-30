/**
 * curriculum-data.js — A Girl & Her Futures™
 *
 * Single source of truth for the curriculum: 8 Phases, 22 Sections. This
 * is the original curriculum structure (restored from the pre-rebuild
 * site) — Phase 1's 3 sections have real lesson content backing them
 * (see agihf/lessons-data/p1-*.json); Phases 2-8 are locked/"coming soon"
 * placeholders using their real section/lesson titles, ready to fill in
 * as content is built.
 *
 * Usage: <script type="module"> import { PHASES, phaseByKey, lessonId } from '../shared/curriculum-data.js'; </script>
 */

export const PHASES = [
  {
    key: 'p1', n: 1, badge: 'p', title: 'Welcome to the Market', locked: false,
    sections: [
      { key: 's1', n: 1, badge: 'p', title: 'Introduction to Trading', lessons: [
        { n: 1, title: 'What even is trading?', quote: "Candles are just storytelling — they're showing you who's winning right now.", xp: 50 },
        { n: 2, title: 'Why do markets exist?', quote: "Markets exist because buyers and sellers need each other. That's it.", xp: 50 },
        { n: 3, title: 'Buyers vs Sellers', quote: "Price moves based on who's stronger. Read it like a story, not a guess.", xp: 50 },
        { n: 4, title: 'Contracts & Instruments', quote: "MNQ. MGC. Know what you're trading before you trade it.", xp: 50 },
        { n: 5, title: 'Futures vs Stocks', quote: "Futures aren't stocks. The rules are different. Let's break it down.", xp: 50 },
        { n: 6, title: 'Points, Ticks & P&L', quote: 'MNQ = $2 per point. MGC = $10 per point. Know your numbers before you trade.', xp: 50 },
      ] },
      { key: 's2', n: 2, badge: 't', title: 'Before You Touch a Chart', lessons: [
        { n: 7, title: 'TradingView Basics', quote: 'Your chart is your workspace. Learn it before you try to read it.', xp: 60 },
        { n: 8, title: 'Brokers & Prop Firms', quote: 'Know the difference before you fund an account.', xp: 60 },
        { n: 9, title: 'Market vs Limit Orders', quote: 'Limit orders only. Know the difference before you touch a chart.', xp: 60 },
        { n: 10, title: 'Stop Loss & Take Profit', quote: 'Protect your capital first. Always know your exit before your entry.', xp: 60 },
        { n: 11, title: 'Position Sizing', quote: 'Risk only what you can afford to lose. Size your position, not your ego.', xp: 60 },
      ] },
      { key: 's3', n: 3, badge: 'c', title: 'Candles & Timeframes', lessons: [
        { n: 12, title: 'Candlesticks', quote: "Every candle is a decision. Green means buyers won. Red means sellers won.", xp: 60 },
        { n: 13, title: 'Candle Anatomy', quote: 'Body, wicks, open, close. Know every part before you read a single chart.', xp: 60 },
        { n: 14, title: 'Candle Psychology', quote: 'Going deeper. What specific candle patterns mean for your next move.', xp: 60 },
        { n: 15, title: 'Timeframes', quote: 'Higher timeframes tell the story. Lower timeframes let you step inside it.', xp: 60 },
        { n: 16, title: 'Multi-Timeframe Concept', quote: "4H for direction. 1H for levels. 1M for entry. They all have to agree.", xp: 60 },
      ], game: { title: 'Pattern Recognition Game', quote: 'Candles flash. You call it. Lock in what you learned before the gate.', xp: 75 } },
    ],
  },
  {
    key: 'p2', n: 2, badge: 't', title: 'Understanding Structure', locked: true,
    sections: [
      { key: 's4', n: 4, badge: 't', title: 'How Markets Move', lessons: [
        { title: 'Uptrend — walking up stairs', quote: 'Higher highs and higher lows. Like walking UP stairs. Simple.', xp: 65 },
        { title: 'Downtrend — walking down stairs', quote: "Lower lows and lower highs. If it's not doing this, don't trade it.", xp: 65 },
        { title: 'HH, HL, LH, LL — the four pillars', quote: 'Higher High. Higher Low. Lower High. Lower Low. This is the language of trend.', xp: 65 },
        { title: 'Swing highs & lows — heels and valleys', quote: 'A swing high is a heel. A swing low is a valley.', xp: 65 },
        { title: 'Consolidation — the no-trade zone', quote: "This is where most people lose money. They're forcing trades in dead zones.", xp: 65 },
      ] },
      { key: 's5', n: 5, badge: 'p', title: 'Breaks, Shifts & Fakeouts', lessons: [
        { title: 'Break of Structure & Market Structure Shift', quote: 'BOS = trend continuing. MSS = trend changing. Know the difference.', xp: 65 },
        { title: 'Continuation vs Reversal', quote: 'Is price continuing or reversing? That question changes everything.', xp: 65 },
        { title: 'False Breaks — the trap', quote: 'Price breaks a level then snaps back. Learn to spot it before it costs you.', xp: 65 },
        { title: 'Retracement vs Reversal', quote: 'External structure = where price should get to. Internal = how it gets there.', xp: 65 },
      ] },
      { key: 's6', n: 6, badge: 'c', title: 'Reading Key Levels', lessons: [
        { title: 'Support & Resistance', quote: "Mark levels only where there's a strong push.", xp: 65 },
        { title: 'Zones vs Lines', quote: "Price doesn't hit a line. It enters a zone.", xp: 65 },
        { title: 'Acceptance vs Rejection', quote: 'Did price accept the level or reject it? The body tells you everything.', xp: 65 },
        { title: 'Level Strength', quote: 'Not all levels are created equal.', xp: 65 },
      ] },
    ],
  },
  {
    key: 'p3', n: 3, badge: 'u', title: 'Reading Price Like a Pro', locked: true,
    sections: [
      { key: 's7', n: 7, badge: 'u', title: 'What is Liquidity?', lessons: [
        { title: 'Buy Stops & Sell Stops', quote: 'Buy stops live above highs. Sell stops live below lows.', xp: 70 },
        { title: 'Liquidity Pools', quote: 'Where does everyone have their stops? Price is drawn to it.', xp: 70 },
        { title: 'Equal Highs & Lows', quote: 'When price stacks at the same level twice — that\'s a magnet.', xp: 70 },
        { title: 'Liquidity Sweeps', quote: "Price grabs the liquidity then reverses.", xp: 70 },
        { title: 'Internal vs External Liquidity', quote: 'Internal is inside the range. External is beyond the highs and lows.', xp: 70 },
        { title: 'Why Traders Get Trapped', quote: 'Retail entries are predictable. Now you know too.', xp: 70 },
      ] },
      { key: 's8', n: 8, badge: 'p', title: 'Gaps & Imbalances', lessons: [
        { title: 'What is Imbalance?', quote: "When price moves so fast one side doesn't get filled.", xp: 70 },
        { title: 'Fair Value Gaps', quote: 'Three candle pattern. Price often returns to fill it.', xp: 70 },
        { title: 'Efficient vs Inefficient Delivery', quote: 'Efficient = clean move. Inefficient = holes it needs to come back for.', xp: 70 },
        { title: 'When FVGs Matter', quote: 'Not every FVG is worth trading. Context is everything.', xp: 70 },
      ] },
      { key: 's9', n: 9, badge: 'c', title: 'How Big Money Moves', lessons: [
        { title: 'Supply & Demand Basics', quote: 'Supply = sellers in control. Demand = buyers in control.', xp: 70 },
        { title: 'Institutional Movement', quote: "Big money doesn't buy all at once. They accumulate and distribute.", xp: 70 },
        { title: 'Order Flow Intuition', quote: "Understand who's in control and trade with them.", xp: 70 },
      ] },
    ],
  },
  {
    key: 'p4', n: 4, badge: 'd', title: 'Finding Direction', locked: true,
    sections: [
      { key: 's10', n: 10, badge: 'p', title: 'Finding Your Bias', lessons: [
        { title: 'Building Your 4H Bias', quote: 'The 4H tells you what direction the market wants to go.', xp: 70 },
        { title: '1H Structure — Reading the Map', quote: 'Once you have bias, the 1H shows you where the setups are forming.', xp: 70 },
        { title: 'External vs Internal Structure', quote: "External is where price is going. Internal is how it gets there.", xp: 70 },
        { title: 'Targeting Liquidity', quote: 'Where is price most likely heading next? Follow the liquidity.', xp: 70 },
        { title: 'Bias Invalidation', quote: 'When does your bias flip? When structure says so.', xp: 70 },
      ] },
      { key: 's11', n: 11, badge: 't', title: 'Buy Low, Sell High', lessons: [
        { title: 'Range Equilibrium', quote: 'Above the middle is premium. Below it is discount.', xp: 70 },
        { title: 'Buying Low / Selling High', quote: 'Be in premium when selling and discount when buying.', xp: 70 },
        { title: 'Positioning Within a Range', quote: "Don't buy in premium. Don't sell in discount. Wait for price to come to you.", xp: 70 },
      ] },
    ],
  },
  {
    key: 'p5', n: 5, badge: 'u', title: 'The Dayli ICC Method ✦', locked: true,
    sections: [
      { key: 's12', n: 12, badge: 'u', title: 'The ICC Framework', lessons: [
        { title: 'What is ICC?', quote: "It's not a strategy. It's a behavior pattern. The market does this every time.", xp: 75 },
        { title: 'The Pre-Indication Level', quote: 'Before price can indicate, it has to break something.', xp: 75 },
        { title: 'Indication', quote: "I don't care about wicks. I need that 1M candle to CLOSE past the level.", xp: 75 },
        { title: 'Correction', quote: "Corrections are normal. If it doesn't correct, it's not healthy.", xp: 75 },
        { title: 'Continuation', quote: 'Price closes back above the level. Buyers defended it. Your limit fills.', xp: 75 },
        { title: 'The Reclaim / Retest', quote: 'Price comes back in direction. Shows strength again.', xp: 75 },
        { title: 'Entry — Your Sniper Moment', quote: 'Wait for: Close + Pullback + Level. Then enter. Limit order only.', xp: 75 },
        { title: 'Risk Model — Your Signature', quote: 'Take 1:1 partial. Move stop to break even. Let the runner ride.', xp: 100 },
      ] },
      { key: 's13', n: 13, badge: 'p', title: 'Your Entry Model', lessons: [
        { title: 'The Full Model', quote: 'Every piece of the model together. Step by step.', xp: 80 },
        { title: 'Confirmation Rules', quote: 'What has to be true before you enter? Non-negotiable.', xp: 80 },
        { title: 'Confluence', quote: 'When multiple things align — that\'s your A+ setup.', xp: 80 },
        { title: 'Clean vs Messy Setups', quote: 'We only take clean ones.', xp: 80 },
      ] },
      { key: 's14', n: 14, badge: 't', title: 'Making All Timeframes Agree', lessons: [
        { title: '4H → 1H → 1M Flow', quote: '4H = story. 1H = levels. 1M = entry. They must align.', xp: 80 },
        { title: 'How Timeframes Connect', quote: 'What shows up on the 4H shapes what you look for on the 1H.', xp: 80 },
        { title: 'Conflict Resolution', quote: 'When timeframes disagree, the higher one wins. Always.', xp: 80 },
      ], game: { title: 'ICC Sequence Game', quote: 'A real chart. Identify Indication, Correction, Continuation in order.', xp: 100 } },
    ],
  },
  {
    key: 'p6', n: 6, badge: 't', title: 'Pulling the Trigger', locked: true,
    sections: [
      { key: 's15', n: 15, badge: 'p', title: 'How to Actually Enter', lessons: [
        { title: '1M Entries', quote: 'The 1M is where you pull the trigger.', xp: 80 },
        { title: 'Timing Your Entry', quote: 'Being right about direction is only half of it.', xp: 80 },
        { title: 'Confirmation vs Anticipation', quote: 'Anticipating gets you trapped. Confirming gets you in at the right time.', xp: 80 },
      ] },
      { key: 's16', n: 16, badge: 't', title: 'Managing the Trade', lessons: [
        { title: 'Taking Partials', quote: 'TP1 at 1:1. Take the partial. Run the rest.', xp: 80 },
        { title: 'Running Runners', quote: 'Let structure tell you when to exit — not your emotions.', xp: 80 },
        { title: 'Moving Your Stop Loss', quote: 'When to move to break even. When to trail.', xp: 80 },
        { title: 'Managing Open Trades', quote: 'Once you\'re in — stay out of your head.', xp: 80 },
      ] },
      { key: 's17', n: 17, badge: 'c', title: 'Protecting Your Account', lessons: [
        { title: 'Risk Per Trade', quote: 'Never risk more than you\'re willing to lose on a single trade.', xp: 80 },
        { title: '1:1 vs 1:2 — Knowing Your Target', quote: 'Minimum is 1:1. Aim for 1:2.', xp: 80 },
        { title: 'Stop Loss Placement', quote: 'Structure-based stops only. Not arbitrary.', xp: 80 },
        { title: 'Consistency Over Everything', quote: 'One good trade a day beats five random ones.', xp: 80 },
      ] },
    ],
  },
  {
    key: 'p7', n: 7, badge: 'p', title: 'The Mindset Behind the Model', locked: true,
    sections: [
      { key: 's18', n: 18, badge: 'p', title: 'Your Mind Is the Market', lessons: [
        { title: 'Emotional Control', quote: 'Your feelings about the market are often wrong. Learn the difference.', xp: 85 },
        { title: 'Fear & Greed', quote: 'Fear makes you exit too early. Greed makes you hold too long.', xp: 85 },
        { title: 'Overtrading', quote: 'More trades does not mean more money.', xp: 85 },
        { title: 'Patience — The Real Edge', quote: 'Waiting for the setup IS the trade.', xp: 85 },
      ] },
      { key: 's19', n: 19, badge: 't', title: 'Rules That Protect You', lessons: [
        { title: 'No News Trading', quote: 'News creates volatility. Volatility creates traps.', xp: 85 },
        { title: 'No Consolidation Trading', quote: "Chop is a trap. If it's not trending, it's not your trade.", xp: 85 },
        { title: 'No Chasing', quote: 'If you missed it, you missed it. The next setup is always coming.', xp: 85 },
        { title: 'Rule-Based Trading', quote: 'Your rules exist to protect you from yourself.', xp: 85 },
      ] },
      { key: 's20', n: 20, badge: 'c', title: 'Reading the Room', lessons: [
        { title: 'Trending vs Ranging', quote: 'Two market conditions. Two different approaches.', xp: 85 },
        { title: 'Volatility', quote: 'High volatility = bigger moves and bigger risk.', xp: 85 },
        { title: 'News Impact', quote: 'Economic events move markets. Know the calendar.', xp: 85 },
      ] },
    ],
  },
  {
    key: 'p8', n: 8, badge: 'd', title: "She's In Structure ✦", locked: true, comingSoon: true,
    sections: [
      { key: 's21', n: 21, badge: 'u', title: 'Real Trade Breakdowns', lessons: [
        { title: 'Real Trade Reviews', quote: "We walk through real trades. What worked. What didn't.", xp: 100 },
        { title: 'Good vs Bad Setups', quote: 'Side by side. Clean vs messy. Valid vs invalid.', xp: 100 },
        { title: 'Step-by-Step Execution Walkthrough', quote: 'From bias to entry to exit. Every decision documented.', xp: 100 },
      ] },
      { key: 's22', n: 22, badge: 'p', title: 'Practice Like a Pro', lessons: [
        { title: 'How to Practice', quote: 'Practice is how strategies become instincts.', xp: 100 },
        { title: 'Replay Trading', quote: 'Practice entries on historical data. Build screen time without risk.', xp: 100 },
        { title: 'Journaling System', quote: 'The most important habit you can build.', xp: 100 },
        { title: 'Performance Tracking', quote: 'Win rate. R:R average. Max drawdown. Know your numbers.', xp: 100 },
      ] },
    ],
  },
];

// GP-tier "Level" progression (separate from Phase position) — matches the
// levelNames map already used by agihf/api/get-profile.js.
export const LEVEL_NAMES = {
  1: "She's Brand New", 2: 'Before the Chart', 3: 'Reading Structure', 4: 'Finding Direction',
  5: 'The ICC Method', 6: 'Pulling the Trigger', 7: 'The Mindset', 8: "She's In Structure ✦",
};

export function phaseByKey(key) {
  return PHASES.find((p) => p.key === key);
}

export function sectionByKey(sectionKey) {
  for (const phase of PHASES) {
    const section = phase.sections.find((s) => s.key === sectionKey);
    if (section) return { phase, section };
  }
  return null;
}

export function allPhase1Lessons() {
  return PHASES[0].sections.flatMap((s) => s.lessons);
}

export function lessonId(n) {
  return `p1-${n}`;
}

export function totalLessonCount() {
  return PHASES.reduce((sum, p) => sum + p.sections.reduce((s, sec) => s + sec.lessons.length, 0), 0);
}
