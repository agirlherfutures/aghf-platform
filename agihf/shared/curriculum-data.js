/**
 * curriculum-data.js — A Girl & Her Futures™
 *
 * Single source of truth for the curriculum: 8 Phases, 22 Sections. Same
 * AGHF phase names, gates, GP system and locked progression as always —
 * this file carries the deepened lesson-by-lesson structure and the
 * Dayli ICC pedagogical rules (Dayli ICC = the 1-minute execution model
 * only; higher-timeframe analysis always comes first; FVGs/liquidity/
 * supply-demand are market literacy, not required entry criteria).
 *
 * Phase 1's 3 sections have real lesson content backing them (see
 * agihf/lessons-data/p1-*.json, 18 lessons). Phases 2-8 are locked/
 * "coming soon" placeholders carrying the new section/lesson titles,
 * ready to fill in as content is built.
 *
 * Optional fields:
 *   - section.intro     — a disclaimer/framing note shown above a section
 *                          (used once, on Phase 3's first section).
 *   - section.dayliNote — a short Dayli Note callout shown under a
 *                          section header (used once, on Section 8).
 *
 * Usage: <script type="module"> import { PHASES, phaseByKey, lessonId } from '../shared/curriculum-data.js'; </script>
 */

export const PHASES = [
  {
    key: 'p1', n: 1, badge: 'p', title: 'Welcome to the Market', locked: false,
    sections: [
      { key: 's1', n: 1, badge: 'p', title: 'Introduction to Trading', lessons: [
        { n: 1, title: 'What Even Is Trading?', quote: "Candles are just storytelling — they're showing you who's winning right now.", xp: 50 },
        { n: 2, title: 'Why Do Markets Exist?', quote: "Markets exist because buyers and sellers need each other. That's it.", xp: 50 },
        { n: 3, title: 'Buyers vs Sellers', quote: "Price moves based on who's stronger. Read it like a story, not a guess.", xp: 50 },
        { n: 4, title: 'Contracts & Instruments', quote: "MNQ. MGC. Know what you're trading before you trade it.", xp: 50 },
        { n: 5, title: 'Futures vs Stocks', quote: "Futures aren't stocks. The rules are different. Let's break it down.", xp: 50 },
        { n: 6, title: 'Points, Ticks & P&L', quote: 'MNQ = $2 per point. MGC = $10 per point. Know your numbers before you trade.', xp: 50 },
      ] },
      { key: 's2', n: 2, badge: 't', title: 'Before You Touch a Chart', lessons: [
        { n: 7, title: 'TradingView Basics', quote: 'Your chart is your workspace. Learn it before you try to read it.', xp: 60 },
        { n: 8, title: 'Brokers, Prop Firms & Accounts', quote: 'Funded, personal, simulated, live — know the account before you know the strategy.', xp: 60 },
        { n: 9, title: 'Order Types', quote: 'Market. Limit. Stop. Know all three before you know which one you’ll actually use.', xp: 60 },
        { n: 10, title: 'Stop Loss & Take Profit', quote: 'Protect your capital first. Always know your exit before your entry.', xp: 60 },
        { n: 11, title: 'Position Sizing', quote: 'Risk only what you can afford to lose. Size your position, not your ego.', xp: 60 },
        { n: 12, title: 'Trading Sessions & Market Hours', quote: 'Asia. London. New York. The clock changes the chart.', xp: 60 },
      ] },
      { key: 's3', n: 3, badge: 'c', title: 'Candles & Timeframes', lessons: [
        { n: 13, title: 'Candlesticks', quote: "Every candle is a decision. Green means buyers won. Red means sellers won.", xp: 60 },
        { n: 14, title: 'Candle Anatomy', quote: 'Body, wicks, open, close. Know every part before you read a single chart.', xp: 60 },
        { n: 15, title: 'Wicks, Bodies & Closes', quote: "I don't care about the wick. I need the candle to close through the level.", xp: 60 },
        { n: 16, title: 'Candle Psychology', quote: 'Push. Reject. Accept. Fail. Read what actually happened inside the candle.', xp: 60 },
        { n: 17, title: 'Timeframes', quote: 'Higher timeframes tell the story. Lower timeframes let you step inside it.', xp: 60 },
        { n: 18, title: 'Multi-Timeframe Thinking', quote: "Higher timeframes give you context. Lower timeframes give you detail. You'll learn how AGHF assigns each one a job.", xp: 60 },
      ], game: { title: 'Pattern Recognition Game', quote: 'Rejection. Acceptance. Strong close. Weak close. Wick with no close. Call it before the gate.', xp: 75 } },
    ],
  },
  {
    key: 'p2', n: 2, badge: 't', title: 'Understanding Structure', locked: true,
    sections: [
      { key: 's4', n: 4, badge: 't', title: 'How Markets Move', lessons: [
        { title: 'Trending vs Ranging', quote: 'Two environments. Two totally different games.', xp: 65 },
        { title: 'Uptrends', quote: 'Higher highs and higher lows. Like walking UP stairs.', xp: 65 },
        { title: 'Downtrends', quote: "Lower lows and lower highs. If it's not doing this, don't trade it.", xp: 65 },
        { title: 'HH, HL, LH & LL', quote: 'The four labels that describe everything price does.', xp: 65 },
        { title: 'Swing Highs & Swing Lows', quote: 'Every swing is a decision point. Later, they become everything.', xp: 65 },
        { title: 'Valid vs Invalid Swings', quote: 'Not every wiggle on the chart counts. Learn which ones do.', xp: 65 },
        { title: 'Internal vs External Structure', quote: 'External is where price is going. Internal is how it gets there.', xp: 65 },
        { title: 'Consolidation', quote: "This is where most people lose money. They're forcing trades in dead zones.", xp: 65 },
        { title: 'Expansion', quote: 'Expansion, correction, expansion. That’s the whole rhythm.', xp: 65 },
      ] },
      { key: 's5', n: 5, badge: 'p', title: 'Breaks, Shifts & Fakeouts', lessons: [
        { title: 'Break of Structure', quote: 'Trend continuing. Structure agrees with itself.', xp: 65 },
        { title: 'Market Structure Shift', quote: 'Trend changing. Structure just disagreed with itself.', xp: 65 },
        { title: 'Continuation vs Reversal', quote: 'Is price continuing or reversing? That question changes everything.', xp: 65 },
        { title: 'Retracement vs Reversal', quote: "A pullback and a reversal look the same, until they don't.", xp: 65 },
        { title: 'Wick Break vs Candle-Close Break', quote: "A wick through a level isn't a break. A close through it is.", xp: 65 },
        { title: 'False Breaks', quote: 'Price breaks a level then snaps back. Learn to spot the trap.', xp: 65 },
        { title: 'Structure Invalidation', quote: "Don't just say 'it broke.' Say what specifically became invalid.", xp: 65 },
        { title: 'When a New Swing Becomes Relevant', quote: 'As price moves, the swings that matter change too.', xp: 65 },
      ] },
      { key: 's6', n: 6, badge: 'c', title: 'Reading Key Levels', lessons: [
        { title: 'Support & Resistance', quote: "Mark levels only where there's a strong push.", xp: 65 },
        { title: 'Zones vs Lines', quote: "Price doesn't hit a line. It enters a zone.", xp: 65 },
        { title: 'Acceptance vs Rejection', quote: 'Did price accept the level or reject it? The body tells you everything.', xp: 65 },
        { title: 'Level Strength', quote: 'Not all levels are created equal.', xp: 65 },
        { title: 'Previous Highs & Lows', quote: "The market remembers where it's been.", xp: 65 },
        { title: 'Structure-Based Levels', quote: 'The best levels come from structure, not guesswork.', xp: 65 },
        { title: 'Why a Level Matters More Than Its Name', quote: "S/R, FVG, supply zone, order block — the name doesn't matter. What price does there does.", xp: 65 },
      ], game: { title: 'Structure Lab', quote: 'Mark HH, HL, LH, LL, valid and invalidated swings, internal and external structure, MSS — on a real chart.', xp: 75 } },
    ],
  },
  {
    key: 'p3', n: 3, badge: 'u', title: 'Reading Price Like a Pro', locked: true,
    sections: [
      { key: 's7', n: 7, badge: 'u', title: 'Understanding Liquidity',
        intro: "During this phase, you'll learn concepts commonly used throughout price-action education. Understanding them makes you a more informed trader — but that doesn't mean every concept becomes part of the Dayli ICC Method. You're learning to recognize the language, not collect reasons to enter.",
        lessons: [
          { title: 'What Is Liquidity?', quote: 'Liquidity is where orders are waiting to be filled.', xp: 70 },
          { title: 'Buy-Side & Sell-Side Liquidity', quote: 'Buy stops live above highs. Sell stops live below lows.', xp: 70 },
          { title: 'Stops & Liquidity Pools', quote: "Where does everyone have their stops? That's a magnet, not a coincidence.", xp: 70 },
          { title: 'Equal Highs & Equal Lows', quote: 'When price stacks at the same level twice, that’s a pool waiting to be swept.', xp: 70 },
          { title: 'Internal vs External Liquidity', quote: 'Internal is inside the range. External is beyond the highs and lows.', xp: 70 },
          { title: 'Liquidity Sweeps', quote: 'Price grabs the liquidity, then decides what it actually wants to do.', xp: 70 },
          { title: 'Sweep vs Structural Break', quote: "A sweep and a break can look identical in the moment. They aren't the same thing.", xp: 70 },
          { title: 'Liquidity + Market Structure', quote: 'Liquidity tells you where. Structure tells you what happens next.', xp: 70 },
          { title: 'Why Traders Get Trapped', quote: 'Retail entries are predictable. Now you know why.', xp: 70 },
        ] },
      { key: 's8', n: 8, badge: 'p', title: 'Gaps, Imbalances & Price Delivery',
        dayliNote: 'FVGs are not required for a Dayli ICC setup. We learn them because they’re part of market literacy and can provide context — not because they’re a mandatory entry condition.',
        lessons: [
          { title: 'What Is Imbalance?', quote: "When price moves so fast, one side doesn't get filled.", xp: 70 },
          { title: 'Fair Value Gaps', quote: 'A three-candle pattern that marks an inefficient move.', xp: 70 },
          { title: 'Displacement', quote: 'A strong, fast move that leaves imbalance behind it.', xp: 70 },
          { title: 'Efficient vs Inefficient Price Delivery', quote: 'Efficient is a clean move. Inefficient leaves holes behind.', xp: 70 },
          { title: 'Why Price Sometimes Revisits Imbalances', quote: "Price can return to fill a gap. It doesn't have to.", xp: 70 },
          { title: 'When FVGs Matter', quote: "Context decides whether a gap is worth your attention.", xp: 70 },
          { title: "When FVGs Don't Matter", quote: 'Most gaps are just noise. Learn to tell the difference.', xp: 70 },
        ] },
      { key: 's9', n: 9, badge: 'c', title: 'Understanding Market Participation', lessons: [
        { title: 'Supply & Demand', quote: 'Supply is sellers in control. Demand is buyers in control.', xp: 70 },
        { title: 'Aggressive Buying & Selling', quote: 'Aggression shows up in how price moves, not just where.', xp: 70 },
        { title: 'Accumulation & Distribution Concepts', quote: "Price doesn't move all at once. It builds, then it releases.", xp: 70 },
        { title: 'Order Flow Intuition', quote: "Understand who's in control right now, and trade with them.", xp: 70 },
        { title: "What Price Can Tell You — And What It Can't", quote: "You're reading behavior, not reading minds. Know the difference.", xp: 70 },
      ] },
    ],
  },
  {
    key: 'p4', n: 4, badge: 'd', title: 'Finding Direction', locked: true,
    sections: [
      { key: 's10', n: 10, badge: 'p', title: 'Finding Your Bias', lessons: [
        { title: 'What Is Directional Bias?', quote: "Your best current read on where price wants to go.", xp: 70 },
        { title: 'Bias vs Prediction', quote: 'A bias updates. A prediction gets defended. Only one of those makes you money.', xp: 70 },
        { title: 'Reading the 4H Story', quote: "This is where you start reading the room.", xp: 70 },
        { title: '4H External Swing High & Swing Low', quote: "The two edges of the room you're standing in.", xp: 70 },
        { title: 'The Two Doors', quote: 'Every range has two ways out. Know both before price picks one.', xp: 70 },
        { title: '4H Internal Structure', quote: "How price moves inside the room, before it reaches a door.", xp: 70 },
        { title: 'Reading 1H Structure Inside the 4H', quote: "The 1H shows you the room's furniture.", xp: 70 },
        { title: 'Market Structure Shift as Directional Information', quote: "An MSS isn't just an event. It's information about what's next.", xp: 70 },
        { title: 'Identifying Relevant 1H Swings', quote: 'Not every swing matters. Learn which ones do.', xp: 70 },
        { title: 'Targeting External Structure / Liquidity', quote: 'Where is price most likely heading next? Follow the structure.', xp: 70 },
        { title: 'Bullish Scenario vs Bearish Scenario', quote: 'Hold both possibilities until price tells you which one is real.', xp: 70 },
        { title: 'Bias Invalidation', quote: 'When does your bias flip? When structure says so, not when you feel like it.', xp: 70 },
        { title: 'Updating Your Levels as Price Creates New Structure', quote: "Your map isn't static. Redraw it as price moves.", xp: 70 },
      ] },
      { key: 's11', n: 11, badge: 't', title: 'Location Within the Range', lessons: [
        { title: 'Understanding the Trading Range', quote: 'Every range has a top, a bottom, and a middle that matters.', xp: 70 },
        { title: 'Range Equilibrium', quote: 'Above the middle is premium. Below it is discount.', xp: 70 },
        { title: 'Premium & Discount', quote: 'Be in premium when selling. Be in discount when buying.', xp: 70 },
        { title: 'Positioning Within the Range', quote: "Don't buy in premium. Don't sell in discount. Let price come to you.", xp: 70 },
        { title: 'Premium/Discount Is Context, Not Permission', quote: "Discount doesn't mean buy. Premium doesn't mean sell.", xp: 70 },
        { title: 'Location + Structure + Direction', quote: 'Put all three together, and the chart finally makes sense.', xp: 70 },
      ], game: { title: 'Read the Room Challenge', quote: "A naked 4H/1H chart. What's the room? Where are the doors? What would make your thesis wrong?", xp: 80 } },
    ],
  },
  {
    key: 'p5', n: 5, badge: 'u', title: 'The Dayli ICC Method ✦', locked: true,
    sections: [
      { key: 's12', n: 12, badge: 'u', title: 'ICC Across the Market', lessons: [
        { title: 'What Is ICC?', quote: 'A framework for how price indicates direction, corrects, and attempts continuation.', xp: 75 },
        { title: 'Indication', quote: 'The first sign price is willing to commit to a direction.', xp: 75 },
        { title: 'Correction', quote: "A healthy pause. If it doesn't correct, that's information too.", xp: 75 },
        { title: 'Continuation', quote: 'Price picks back up in the direction it indicated.', xp: 75 },
        { title: 'ICC Across Different Timeframes', quote: 'The same behavior, playing out at every zoom level.', xp: 75 },
        { title: 'Higher-Timeframe ICC', quote: 'Before the 1-minute model, the same sequence happens above it.', xp: 75 },
        { title: '4H ICC', quote: 'The biggest version of the same story.', xp: 75 },
        { title: '1H ICC', quote: 'The version that sits between the story and the entry.', xp: 75 },
        { title: 'Identifying Where Price Is in the HTF Sequence', quote: 'Are you watching indication, correction, or continuation right now?', xp: 75 },
        { title: 'HTF ICC + Market Structure', quote: "ICC isn't separate from structure. It's structure, described in motion.", xp: 75 },
      ] },
      { key: 's13', n: 13, badge: 'p', title: 'The Dayli ICC 1-Minute Entry Model', lessons: [
        { title: 'What Is the Dayli ICC Method™?', quote: 'Your top-down analysis tells you what and where. Dayli ICC tells you how.', xp: 80 },
        { title: 'The Pre-Indication Level', quote: 'Before price can indicate, it has to break something first.', xp: 80 },
        { title: 'Choosing the Correct PIL', quote: 'Not every level is a PIL. Learn which one actually qualifies.', xp: 80 },
        { title: 'Indication', quote: "I don't care about wicks. I need that 1M candle to CLOSE past the level.", xp: 80 },
        { title: 'Candle-Close Confirmation', quote: 'The close is the only vote that counts.', xp: 80 },
        { title: 'Correction', quote: "Corrections are normal. If it doesn't correct, it's not healthy.", xp: 80 },
        { title: 'Continuation', quote: 'Price closes back in your direction. The level got defended.', xp: 80 },
        { title: 'The Reclaim / Retest', quote: 'Price comes back to prove itself again.', xp: 80 },
        { title: 'The Entry', quote: 'Close. Pullback. Level. Then, and only then, you enter.', xp: 80 },
        { title: 'The Complete ICC Sequence', quote: 'PIL → Indication → Correction → Continuation → Retest → Entry.', xp: 80 },
        { title: 'Bullish ICC', quote: 'The sequence, from the long side.', xp: 80 },
        { title: 'Bearish ICC', quote: 'The same sequence, mirrored to the short side.', xp: 80 },
        { title: 'Clean vs Messy ICC', quote: 'We only take the clean ones.', xp: 80 },
        { title: 'No Retest / Missed Entry', quote: "Not every setup gives you a second chance, and that's okay.", xp: 80 },
        { title: 'When the ICC Sequence Resets', quote: 'Sometimes the story restarts. Know when to let it.', xp: 80 },
        { title: 'When a New Swing Changes the Setup', quote: 'A new swing can quietly invalidate the setup you were watching.', xp: 80 },
        { title: 'When There Is No Trade', quote: 'No trade is a decision too, and just as important as entry.', xp: 80 },
      ] },
      { key: 's14', n: 14, badge: 't', title: 'Making the Timeframes Work Together', lessons: [
        { title: '4H: Read the Room', quote: 'Where is price within the larger structure?', xp: 80 },
        { title: '1H: Build the Map', quote: 'What structure and swings are actually relevant?', xp: 80 },
        { title: 'The 15M Checkpoint', quote: 'The bridge between the higher-timeframe story and execution.', xp: 80 },
        { title: '1M: Execute Dayli ICC', quote: 'Is the entry model actually present? Then, and only then, you act.', xp: 80 },
        { title: 'How HTF ICC and 1M ICC Work Together', quote: 'The same sequence, nested inside itself.', xp: 80 },
        { title: 'Conflicting Information Across Timeframes', quote: 'The higher timeframe provides context, but lower-timeframe structure shows what price is doing right now. Learn which question each timeframe is answering.', xp: 80 },
      ], game: { title: 'ICC Sequence Game', quote: 'Level 1: spot Indication. Level 5: full HTF analysis into 1M execution.', xp: 100 } },
    ],
  },
  {
    key: 'p6', n: 6, badge: 't', title: 'Pulling the Trigger', locked: true,
    sections: [
      { key: 's15', n: 15, badge: 'p', title: 'How to Actually Enter', lessons: [
        { title: '1M Entries', quote: 'The 1M is where you pull the trigger.', xp: 80 },
        { title: 'Timing Your Entry', quote: 'Being right about direction is only half of it.', xp: 80 },
        { title: 'Confirmation vs Anticipation', quote: 'Anticipating gets you trapped. Confirming gets you in at the right time.', xp: 80 },
        { title: 'Limit Orders & Retests', quote: 'Set it. Let the retest come to you.', xp: 80 },
        { title: 'What to Do When Price Runs Without You', quote: "If you missed it, you missed it. There's always another setup.", xp: 80 },
        { title: 'When NOT to Enter', quote: 'Knowing when to sit on your hands is its own skill.', xp: 80 },
      ] },
      { key: 's16', n: 16, badge: 't', title: 'Managing the Trade', lessons: [
        { title: 'Planning the Trade Before Entry', quote: "Decide how you'll manage it before you're emotionally in it.", xp: 80 },
        { title: 'Take-Profit Frameworks', quote: 'Know your targets before price gets there.', xp: 80 },
        { title: 'Partials', quote: "Take the partial. Protect what you've already earned.", xp: 80 },
        { title: 'Runners', quote: 'Let structure tell you when to exit, not your emotions.', xp: 80 },
        { title: 'Moving to Break Even', quote: 'When you protect the trade without choking it.', xp: 80 },
        { title: 'Structure-Based Management', quote: 'Manage the trade the way you found it, with structure.', xp: 80 },
        { title: 'Over-Managing Trades', quote: 'Sometimes the best management is leaving it alone.', xp: 80 },
        { title: 'Following the Plan', quote: "Once you're in, stay out of your head.", xp: 80 },
      ] },
      { key: 's17', n: 17, badge: 'c', title: 'Protecting Your Account', lessons: [
        { title: 'Risk Per Trade', quote: "Never risk more than you're willing to lose on one trade.", xp: 80 },
        { title: 'Risk-to-Reward', quote: 'Minimum 1:1. Aim higher.', xp: 80 },
        { title: 'Stop-Loss Placement', quote: 'Structure-based stops only. Not arbitrary.', xp: 80 },
        { title: 'Contract Sizing', quote: 'Size the position, not your ego.', xp: 80 },
        { title: 'Daily Risk', quote: "One bad day shouldn't undo a good week.", xp: 80 },
        { title: 'Maximum Trades', quote: 'More trades does not mean more money.', xp: 80 },
        { title: 'Drawdown', quote: "Know your number before you're in it.", xp: 80 },
        { title: 'Prop-Firm Risk vs Personal Capital', quote: "The rules change depending on whose money it is.", xp: 80 },
        { title: 'Consistency Over Frequency', quote: 'One good trade a day beats five random ones.', xp: 80 },
      ] },
    ],
  },
  {
    key: 'p7', n: 7, badge: 'p', title: 'The Mindset Behind the Model', locked: true,
    sections: [
      { key: 's18', n: 18, badge: 'p', title: 'Your Mind Is the Market', lessons: [
        { title: 'Emotional Control', quote: 'Your feelings about the market are often wrong. Learn the difference.', xp: 85 },
        { title: 'Fear', quote: 'Fear makes you exit too early.', xp: 85 },
        { title: 'Greed', quote: 'Greed makes you hold too long.', xp: 85 },
        { title: 'FOMO', quote: 'The setup you missed is not the only setup that will ever exist.', xp: 85 },
        { title: 'Hesitation', quote: "A valid setup you don't take still counts as a mistake.", xp: 85 },
        { title: 'Revenge Trading', quote: "The market doesn't know it took your money. Trade the chart, not the grudge.", xp: 85 },
        { title: 'Overtrading', quote: 'More trades does not mean more money.', xp: 85 },
        { title: 'Losing Streaks', quote: 'A losing streak tests your rules, not your worth.', xp: 85 },
        { title: 'Winning Streaks', quote: 'Confidence is useful. Overconfidence is expensive.', xp: 85 },
        { title: 'Patience — The Real Edge', quote: 'Waiting for the setup IS the trade.', xp: 85 },
      ] },
      { key: 's19', n: 19, badge: 't', title: 'Rules That Protect You', lessons: [
        { title: 'Why Trading Rules Exist', quote: 'Rules exist to protect you from yourself.', xp: 85 },
        { title: 'No Chasing', quote: 'If you missed it, you missed it. The next setup is always coming.', xp: 85 },
        { title: 'Trading Through Consolidation', quote: "Chop is a trap. If it's not trending, it's not your trade.", xp: 85 },
        { title: 'Trading Around News', quote: 'News creates volatility. Volatility creates traps.', xp: 85 },
        { title: 'Maximum Trades', quote: 'A hard stop protects you from your own momentum.', xp: 85 },
        { title: 'Breaking Your Own Rules', quote: 'The moment you break a rule once, it stops being a rule.', xp: 85 },
        { title: 'Building Your Personal Rulebook', quote: 'Dayli ICC has rules. Your trading plan needs its own, too.', xp: 85 },
      ] },
      { key: 's20', n: 20, badge: 'c', title: 'Reading Market Conditions', lessons: [
        { title: 'Trending Markets', quote: 'Structure that keeps making the same kind of move.', xp: 85 },
        { title: 'Ranging Markets', quote: 'Structure that keeps returning to the same place.', xp: 85 },
        { title: 'Consolidation', quote: 'The no-trade zone. Most people lose money forcing entries here.', xp: 85 },
        { title: 'Low Volatility', quote: 'Smaller moves, smaller room for error.', xp: 85 },
        { title: 'High Volatility', quote: 'Bigger moves, bigger risk on the same setup.', xp: 85 },
        { title: 'News Conditions', quote: "Know the calendar before you're in a trade during it.", xp: 85 },
        { title: 'Session Behavior', quote: 'The same setup behaves differently depending on the clock.', xp: 85 },
        { title: 'When Your Setup Is Technically Valid but Conditions Are Poor', quote: "Valid doesn't always mean worth taking.", xp: 85 },
        { title: 'Knowing When Not to Trade', quote: 'The best trade is sometimes no trade at all.', xp: 85 },
      ] },
    ],
  },
  {
    key: 'p8', n: 8, badge: 'd', title: "She's In Structure ✦", locked: true, comingSoon: true,
    sections: [
      { key: 's21', n: 21, badge: 'u', title: 'Real Trade Breakdown Lab', lessons: [
        { title: 'Real Trade Reviews', quote: "We walk through real trades. What worked. What didn't.", xp: 100 },
        { title: 'Winning Trades', quote: "A win doesn't automatically mean it was a good trade.", xp: 100 },
        { title: 'Losing Trades', quote: "A loss doesn't automatically mean it was a bad trade.", xp: 100 },
        { title: 'Valid Trade / Losing Outcome', quote: "Good process, bad result. It happens, and it's still a good trade.", xp: 100 },
        { title: 'Invalid Trade / Winning Outcome', quote: "Bad process, good result. Don't let the win teach you the wrong lesson.", xp: 100 },
        { title: 'Clean vs Messy Setups', quote: 'Side by side. Learn to see the difference instantly.', xp: 100 },
        { title: 'Why I Passed This Trade', quote: "Sometimes the best decision is the one you didn't take.", xp: 100 },
        { title: 'Full Top-Down Walkthrough', quote: 'From 4H bias to 1M execution, every decision documented.', xp: 100 },
        { title: 'Chart Without vs With the Indicator', quote: 'Read it naked first. Then check your work.', xp: 100 },
      ] },
      { key: 's22', n: 22, badge: 'p', title: 'Practice Like a Pro', lessons: [
        { title: 'How to Backtest', quote: 'Practice is how strategies become instincts.', xp: 100 },
        { title: 'TradingView Replay', quote: 'Build screen time on historical data, without risking anything.', xp: 100 },
        { title: 'What Counts as a Backtest', quote: 'Not every replay session is a real backtest. Know the difference.', xp: 100 },
        { title: 'How to Build a Sample Size', quote: 'One good trade proves nothing. A hundred trades start to.', xp: 100 },
        { title: 'Screenshot Journaling', quote: "If you didn't screenshot it, it's easy to lie to yourself about it.", xp: 100 },
        { title: 'Trading Journal', quote: 'The most important habit you can build.', xp: 100 },
        { title: 'Performance Metrics', quote: 'Win rate. R:R average. Max drawdown. Know your numbers.', xp: 100 },
        { title: 'Rule-Violation Tracking', quote: 'Track when you broke your own rules, not just when you won or lost.', xp: 100 },
        { title: 'Setup Quality Tracking', quote: 'Grade the setup, not just the outcome.', xp: 100 },
        { title: 'Weekly Review', quote: 'A short, honest look back, every single week.', xp: 100 },
        { title: 'Monthly Review', quote: "Zoom out. Patterns show up over a month that don't show up in a day.", xp: 100 },
        { title: 'Knowing Whether the Strategy Failed or You Failed to Follow It', quote: 'Two very different problems. Two very different fixes.', xp: 100 },
        { title: 'Building Your Personal Trading Plan', quote: "Everything you've learned, written down as rules only you have to follow.", xp: 100 },
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
