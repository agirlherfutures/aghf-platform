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
 *   - section.intro      — a disclaimer/framing note shown above a section
 *                           (used once, on Phase 3's first section).
 *   - section.dayliNote  — a short Dayli Note callout shown under a
 *                           section header (used once, on Section 8).
 *   - section.checkpoint — a section-level completion flow (Challenge +
 *                           Knowledge Check + Check-In, see section.html/
 *                           shared/section-engine.js). Once a section with
 *                           a checkpoint is fully cleared, isSectionCleared()
 *                           below reports true and the next section unlocks
 *                           (used today on Section 1 only).
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
      ],
      welcome: {
        eyebrow: 'Phase 1 \u00b7 Section 1 \u00b7 Introduction to Trading',
        heading: 'Welcome to the Market',
        paragraphs: [
          { text: 'Before charts. Before setups. Before Dayli ICC. You need to understand the world you\u2019re stepping into.' },
          { text: 'What you\u2019re actually buying and selling. Why price moves at all. What a futures contract is. And how a move on your chart turns into real dollars.' },
          { cls: 'sec-welcome-big', text: 'FIRST, THE LANGUAGE.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cI think it\u2019s going up\u201d</span> becomes <span class="sec-welcome-quote">\u201cI\u2019m long 1 MNQ, my stop is 20 points away, so I\u2019m risking $40.\u201d</span>' },
          { text: 'One is a guess. The other is a trader talking.' },
        ],
        goals: [
          'Explain what a trade is: market, direction, risk and outcome.',
          'Explain going long vs. going short.',
          'Explain why markets exist, and why disagreement creates a trade.',
          'Describe buyer and seller aggression without over-reading one candle.',
          'Name common futures instruments and the difference between minis and micros.',
          'Explain how futures differ from stocks.',
          'Calculate P&L from points, point value and contract count.',
        ],
        mission: 'Don\u2019t memorize trading terms. Understand what they mean.',
      },
      checkpoint: { title: "Know What You're Trading", xp: 30, firstStep: 'challenge', desc: 'Section Challenge + Knowledge Check + Check-In. Clear this to unlock Section 2.' } },
      { key: 's2', n: 2, badge: 't', title: 'Before You Touch a Chart', lessons: [
        { n: 7, title: 'TradingView Basics', quote: 'Your chart is your workspace. Learn it before you try to read it.', xp: 60 },
        { n: 8, title: 'Brokers, Prop Firms & Accounts', quote: 'Funded, personal, simulated, live — know the account before you know the strategy.', xp: 60 },
        { n: 9, title: 'Order Types', quote: 'Market. Limit. Stop. Know all three before you know which one you’ll actually use.', xp: 60 },
        { n: 10, title: 'Stop Loss & Take Profit', quote: 'Protect your capital first. Always know your exit before your entry.', xp: 60 },
        { n: 11, title: 'Position Sizing', quote: 'Risk only what you can afford to lose. Size your position, not your ego.', xp: 60 },
        { n: 12, title: 'Trading Sessions & Market Hours', quote: 'Asia. London. New York. The clock changes the chart.', xp: 60 },
      ],
      welcome: {
        eyebrow: 'Phase 1 \u00b7 Section 2 \u00b7 Before You Touch a Chart',
        heading: 'Before You Touch a Chart',
        paragraphs: [
          { text: 'Most new traders start with the setup. We start with everything that keeps you in the game.' },
          { text: 'A clean workspace. Knowing which account you\u2019re in. Knowing how your orders actually fill. Knowing your exit before your entry, your size before your click, and what time it is in the market.' },
          { cls: 'sec-welcome-big', text: 'PREPARATION IS PROTECTION.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cI\u2019ll figure out my stop once I\u2019m in\u201d</span> becomes <span class="sec-welcome-quote">\u201cMy stop goes where my idea is proven wrong, and my size comes from my plan.\u201d</span>' },
        ],
        goals: [
          'Set up a clean, readable TradingView chart.',
          'Explain what a broker account, a prop evaluation and a simulated account each test.',
          'Choose between market, limit and stop orders.',
          'Place a stop loss based on structure, not comfort, and plan your take profit in advance.',
          'Size a position from your risk plan, not your mood.',
          'Read a move differently depending on the session it formed in.',
        ],
        mission: 'Know your exit before your entry.',
      },
      checkpoint: { title: 'Ready Before You Trade', xp: 30, firstStep: 'challenge', desc: 'Section Challenge + Knowledge Check + Check-In. Clear this to unlock Section 3.' } },
      { key: 's3', n: 3, badge: 'c', title: 'Candles & Timeframes', lessons: [
        { n: 13, title: 'Candlesticks', quote: "Every candle is a decision. Green means buyers won. Red means sellers won.", xp: 60 },
        { n: 14, title: 'Candle Anatomy', quote: 'Body, wicks, open, close. Know every part before you read a single chart.', xp: 60 },
        { n: 15, title: 'Wicks, Bodies & Closes', quote: "I don't care about the wick. I need the candle to close through the level.", xp: 60 },
        { n: 16, title: 'Candle Psychology', quote: 'Push. Reject. Accept. Fail. Read what actually happened inside the candle.', xp: 60 },
        { n: 17, title: 'Timeframes', quote: 'Higher timeframes tell the story. Lower timeframes let you step inside it.', xp: 60 },
        { n: 18, title: 'Multi-Timeframe Thinking', quote: "Higher timeframes give you context. Lower timeframes give you detail. You'll learn how AGHF assigns each one a job.", xp: 60 },
      ],
      welcome: {
        eyebrow: 'Phase 1 \u00b7 Section 3 \u00b7 Candles & Timeframes',
        heading: 'Candles & Timeframes',
        paragraphs: [
          { text: 'Every candle is a tiny record of a fight between buyers and sellers. Most people only read its color.' },
          { text: 'You\u2019re going to read the whole thing: the body, the wicks, and most of all, the close. Then you\u2019ll learn to zoom out before you zoom in.' },
          { cls: 'sec-welcome-big', text: 'REACHED \u2260 ACCEPTED.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cIt wicked above the high, it broke out!\u201d</span> becomes <span class="sec-welcome-quote">\u201cIt reached the high, but it didn\u2019t close through it.\u201d</span>' },
        ],
        goals: [
          'Read what a candle\u2019s shape represents, not just its color.',
          'Name every part of a candle: open, close, high, low, body and wicks.',
          'Tell the difference between price reaching a level and accepting it.',
          'Explain why two similar candles can tell opposite stories.',
          'Explain what changes when you switch timeframes, and what doesn\u2019t.',
          'Use higher timeframes for context and lower timeframes for detail.',
        ],
        mission: 'Read the whole candle. Zoom out before you zoom in.',
      },
      checkpoint: { title: 'Pattern Recognition Game', xp: 75, firstStep: 'game', desc: 'Rejection. Acceptance. Strong close. Weak close. Call it before the gate, then Knowledge Check + Check-In to finish Phase 1.' } },
    ],
  },
  {
    key: 'p2', n: 2, badge: 't', title: 'Understanding Structure', locked: false, finalGate: 's6',
    sections: [
      { key: 's4', n: 4, badge: 't', title: 'How Markets Move', lessons: [
        { n: 1, title: 'What Is Market Structure?', quote: 'Candles are the words. Structure is the sentence.', xp: 65 },
        { n: 2, title: 'Swing Highs & Swing Lows', quote: 'Before you can read structure, you need to find the turns.', xp: 65 },
        { n: 3, title: 'HH, HL, LH & LL', quote: 'The four labels that turn movement into readable structure.', xp: 65 },
        { n: 4, title: 'Bullish Structure', quote: 'Higher highs + higher lows show upward structural progression.', xp: 65 },
        { n: 5, title: 'Bearish Structure', quote: 'Lower lows + lower highs show downward structural progression.', xp: 65 },
        { n: 6, title: 'Valid vs. Minor Swings', quote: 'Every turn exists. Not every turn carries the same structural weight.', xp: 65 },
        { n: 7, title: 'Internal vs. External Structure', quote: 'Structure exists inside structure.', xp: 65 },
        { n: 8, title: 'Consolidation', quote: "Sometimes price isn't walking up or down the stairs. It's walking around the room.", xp: 65 },
        { n: 9, title: 'Expansion, Pullbacks & Progression', quote: 'Price pushes. Price pauses. Price pulls back. Then we see what it does next.', xp: 65 },
      ],
      welcome: {
        eyebrow: 'Phase 2 · Section 1 · How Markets Move',
        heading: 'How Markets Move',
        paragraphs: [
          { text: 'You learned how to read one candle. Now zoom out. Because the market isn\u2019t one candle.' },
          { text: 'Candles move together. They create pushes and pullbacks. Those pushes and pullbacks create swings. And those swings begin forming something much bigger:' },
          { cls: 'sec-welcome-big', text: 'MARKET STRUCTURE.' },
          { text: 'This is where you\u2019re going to stop saying <span class="sec-welcome-quote">\u201cIt looks like it\u2019s going up.\u201d</span> And start saying <span class="sec-welcome-quote">\u201cPrice is forming higher highs and higher lows, so the current structure is bullish.\u201d</span>' },
          { text: 'One is a feeling. The other is an observation.' },
        ],
        goals: [
          'Identify swing highs and swing lows.',
          'Label HH, HL, LH, and LL correctly.',
          'Recognize basic bullish and bearish structure.',
          'Distinguish trending from ranging price.',
          'Understand internal vs. external structure at an introductory level.',
          'Recognize consolidation and expansion.',
          'Understand that a pullback does not automatically mean a reversal.',
          'Begin identifying which swings are structurally meaningful.',
          'Describe market structure objectively rather than simply saying \u201cbullish\u201d or \u201cbearish.\u201d',
        ],
        mission: 'Stop guessing direction. Learn to describe structure.',
      },
      checkpoint: { title: 'Can You Read the Stairs?', xp: 0, firstStep: 'game', desc: 'Structure Builder + Knowledge Check + Check-In. Clear this to unlock Section 2.' } },
      { key: 's5', n: 5, badge: 'p', title: 'Breaks, Shifts & Fakeouts', lessons: [
        { n: 10, title: 'What Does It Mean to Break Structure?', quote: 'Before you label a break, identify the level.', xp: 65 },
        { n: 11, title: 'Break of Structure: BOS', quote: 'Price just proved it progressed with the existing structure.', xp: 65 },
        { n: 12, title: 'Market Structure Shift: MSS', quote: 'MSS is change information, not an entry signal.', xp: 65 },
        { n: 13, title: 'Continuation vs. Reversal', quote: 'Sometimes the most correct answer is: I don\u2019t know yet.', xp: 65 },
        { n: 14, title: 'Retracement vs. Reversal', quote: 'The direction of the current move isn\u2019t the direction of the larger structure.', xp: 65 },
        { n: 15, title: 'Wick Break vs. Candle-Close Break', quote: 'A wick can visit. A close gives stronger confirmation.', xp: 65 },
        { n: 16, title: 'False Breaks & Fakeouts', quote: 'Observation before interpretation.', xp: 65 },
        { n: 17, title: 'Structural Invalidation & The New Story', quote: 'Your chart updates because price updates.', xp: 65 },
      ],
      welcome: {
        eyebrow: 'Phase 2 \u00b7 Section 2 \u00b7 Breaks, Shifts & Fakeouts',
        heading: 'Breaks, Shifts & Fakeouts',
        paragraphs: [
          { text: 'You can see the structure. Now price starts interacting with it.' },
          { text: 'Highs break. Lows break. Wicks poke through levels. Some of those breaks change the story. Many of them don\u2019t.' },
          { cls: 'sec-welcome-big', text: 'WHAT ACTUALLY BROKE?' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cIt broke a low, so it\u2019s bearish\u201d</span> becomes <span class="sec-welcome-quote">\u201cAn internal low broke, but the relevant supporting swing is still intact.\u201d</span>' },
          { text: 'Section 1 taught you to see it. This section teaches you to interpret it.' },
        ],
        goals: [
          'Understand that not every broken high or low has the same structural significance.',
          'Identify basic BOS continuation behavior.',
          'Identify potential MSS / change information, and know MSS is not an entry signal.',
          'Tell the current move apart from the larger structure.',
          'Tell a retracement apart from stronger reversal evidence.',
          'Use the AGHF distinction between a wick through and a candle close through.',
          'Describe a failed breakout objectively.',
          'Know that invalidation doesn\u2019t automatically create an opposite trade.',
          'Update which swing matters as structure develops.',
          'Be comfortable answering \u201cnot enough information.\u201d',
        ],
        mission: 'Stop reacting to every break. Investigate what changed.',
      },
      checkpoint: { title: 'Break or Fake? \ud83d\udc40', xp: 0, firstStep: 'game', desc: 'Break or Fake? game + Knowledge Check + Check-In. Clear this to unlock Section 3.' } },
      { key: 's6', n: 6, badge: 'c', title: 'Reading Key Levels', lessons: [
        { n: 18, title: 'Support & Resistance', quote: 'A level is information. Not permission to enter.', xp: 65 },
        { n: 19, title: 'Zones vs. Lines', quote: 'Give price room to behave. Don\u2019t build a giant mystery box.', xp: 65 },
        { n: 20, title: 'Acceptance vs. Rejection', quote: 'Did price interact and move away, or start holding beyond?', xp: 65 },
        { n: 21, title: 'What Makes a Level Stronger?', quote: 'Weigh the context. There\u2019s no strength score.', xp: 65 },
        { n: 22, title: 'Previous Highs & Lows', quote: 'Landmarks tell you where something happened. Not what must happen next.', xp: 65 },
        { n: 23, title: 'Structure-Based Levels', quote: 'Every line on your chart should have a reason.', xp: 65 },
        { n: 24, title: 'Why the Level\u2019s Name Matters Less Than Its Context', quote: 'Context > label.', xp: 65 },
      ],
      welcome: {
        eyebrow: 'Phase 2 \u00b7 Section 3 \u00b7 Reading Key Levels',
        heading: 'Reading Key Levels',
        paragraphs: [
          { text: 'You can see the structure. You can interpret what changed. Now: which parts of the chart actually deserve your attention?' },
          { text: 'Most charts aren\u2019t missing levels. They\u2019re drowning in them.' },
          { cls: 'sec-welcome-big', text: 'MARK WITH PURPOSE.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cThat\u2019s support\u201d</span> becomes <span class="sec-welcome-quote">\u201cThis is the swing low supporting the current bullish structure.\u201d</span>' },
          { text: 'Section 1 taught you to see it. Section 2 taught you to interpret it. This section teaches you to locate what matters.' },
        ],
        goals: [
          'Treat support and resistance as areas of interest, not guaranteed bounces.',
          'Choose between a line and a zone, and draw a zone that fits the reaction.',
          'Observe acceptance-like and rejection-like behavior without one-candle formulas.',
          'Weigh what makes a level deserve more attention, without fake strength scores.',
          'Use previous highs and lows as landmarks, not predictions.',
          'Give every level a structural job.',
          'Clean a crowded chart down to the levels that answer the structural question.',
          'Separate market literacy from entry criteria.',
        ],
        mission: 'Stop marking everything. Mark with purpose.',
      },
      checkpoint: { title: 'Level Detective \ud83d\udd0e', xp: 0, firstStep: 'game', desc: 'Level Detective + Knowledge Check + Check-In + the Phase 2 Final. Clear this to complete Phase 2.' } },
    ],
  },
  {
    key: 'p3', n: 3, badge: 'u', title: 'Reading Price Like a Pro', locked: false,
    sections: [
      { key: 's7', n: 7, badge: 'u', title: 'Understanding Liquidity',
        intro: "During this phase, you'll learn concepts commonly used throughout price-action education. Understanding them makes you a more informed trader, but that doesn't mean every concept becomes part of the Dayli ICC Method. You're learning to recognize the language, not collect reasons to enter.",
        lessons: [
          { n: 1, title: 'What Is Liquidity?', quote: 'Liquidity isn\u2019t a secret trap.', xp: 70 },
          { n: 2, title: 'Buy-Side & Sell-Side', quote: 'Above highs: buy-side. Below lows: sell-side. Not a destination.', xp: 70 },
          { n: 3, title: 'Why Stops Cluster', quote: 'Predictable structure can create predictable order placement.', xp: 70 },
          { n: 4, title: 'Liquidity Pools', quote: 'Same level. Different lens.', xp: 70 },
          { n: 5, title: 'Equal Highs & Equal Lows', quote: 'A magnet \u2260 a guaranteed destination.', xp: 70 },
          { n: 6, title: 'Internal vs External Liquidity', quote: 'Define the range first. Then ask: which liquidity?', xp: 70 },
          { n: 7, title: 'Liquidity Sweeps', quote: 'Sweep = context. Not entry.', xp: 70 },
          { n: 8, title: 'Sweep vs Structural Break', quote: 'Liquidity tells you where something may happen. Structure tells you what price actually did.', xp: 70 },
          { n: 9, title: 'Liquidity in the Dayli ICC Framework', quote: 'Learn more so you can understand more. Not so you can require more.', xp: 70 },
        ],
      welcome: {
        eyebrow: 'Phase 3 \u00b7 Section 1 \u00b7 Understanding Liquidity',
        heading: 'Understanding Liquidity',
        paragraphs: [
          { text: 'You can read structure. Now we\u2019re going to investigate the chart: where might orders be concentrated, and what did price actually do there?' },
          { text: 'Phase 3 is market literacy. You\u2019ll learn the language traders use everywhere, without turning every new word into an entry rule.' },
          { cls: 'sec-welcome-big', text: 'INVESTIGATE IT.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cThey swept the highs, I\u2019m shorting\u201d</span> becomes <span class="sec-welcome-quote">\u201cPrice traded above the previous high and failed to hold. That\u2019s context. The entry model isn\u2019t present yet.\u201d</span>' },
          { text: 'Learn more so you can understand more. Not so you can require more.' },
        ],
        goals: [
          'Describe liquidity as available orders, not a secret trap.',
          'Locate buy-side and sell-side liquidity with less and less help.',
          'Explain why stops cluster, without taking a stop-out personally.',
          'Identify liquidity pools, equal highs and equal lows.',
          'Tell internal liquidity from external liquidity.',
          'Describe sweep-like behavior objectively.',
          'Separate a liquidity sweep from a structural break.',
          'Keep liquidity as context, not a Dayli ICC entry condition.',
        ],
        mission: 'Investigate where orders may be sitting. Don\u2019t turn it into an entry rule.',
      },
      checkpoint: { title: 'Liquidity Detective \ud83d\udca7', xp: 0, firstStep: 'game', desc: 'Liquidity Detective + Knowledge Check + Check-In. Clear this to unlock Section 2.' } },
      { key: 's8', n: 8, badge: 'p', title: 'Gaps, Imbalances & Price Delivery',
        dayliNote: 'FVGs are not required for a Dayli ICC setup. We learn them because they’re part of market literacy and can provide context. Not because they’re a mandatory entry condition.',
        lessons: [
          { title: 'What Is Price Delivery?', quote: 'Don’t just ask where price went. Ask how it got there.', xp: 70 },
          { title: 'Displacement', quote: 'Momentum is information. Not a complete trade plan.', xp: 70 },
          { title: 'What Is Imbalance?', quote: 'Imbalance ≠ FVG. And price doesn’t have to return.', xp: 70 },
          { title: 'Fair Value Gaps', quote: 'A three-candle pattern. Not another entry rule.', xp: 70 },
          { title: 'Efficient vs Inefficient', quote: 'More balanced-looking or more imbalanced-looking. Not good or bad.', xp: 70 },
          { title: 'Why Price May Revisit an Imbalance', quote: 'Possible revisit ≠ guaranteed destination.', xp: 70 },
          { title: 'When FVGs Matter', quote: 'The existence of a concept is not the same as relevance.', xp: 70 },
          { title: 'When FVGs Don’t Matter', quote: 'If the drawing makes you forget the structure, the drawing is hurting you.', xp: 70 },
          { title: 'FVGs in the Dayli ICC Framework', quote: 'We don’t force our method to fit another concept.', xp: 70 },
        ] },
      { key: 's9', n: 9, badge: 'c', title: 'Understanding Market Participation', lessons: [
          { title: 'Supply & Demand Basics', quote: 'They show where strong participation appeared before. They don’t replace structure.', xp: 70 },
          { title: 'Buying vs Selling Pressure', quote: 'Who appears more aggressive right now. Not who wins forever.', xp: 70 },
          { title: 'Aggressive Participation', quote: 'Describe what price did before you decide who did it.', xp: 70 },
          { title: 'Accumulation & Distribution', quote: 'A label becomes more useful after structure confirms the story.', xp: 70 },
          { title: 'Order Flow Intuition', quote: 'You don’t need more data if you can’t read the price in front of you.', xp: 70 },
          { title: 'What Price Can Tell You', quote: 'Ask the chart questions it can actually answer.', xp: 70 },
          { title: 'What Price Cannot Prove', quote: 'If you can’t prove the story, don’t build your trade around it.', xp: 70 },
          { title: 'Market Participation + Structure', quote: 'Context gets deeper. The chart doesn’t need to get messier.', xp: 70 },
          { title: 'How This Fits Into Dayli ICC', quote: 'More knowledge should make your chart clearer. Not your rules heavier.', xp: 70 },
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

/**
 * Has this section's checkpoint (Challenge + Knowledge Check + Check-In)
 * been cleared? A section with no `checkpoint` field is always considered
 * cleared — the hard gate only applies where a checkpoint exists.
 */
export function isSectionCleared(phaseKey, sectionKey, completedIds) {
  const found = sectionByKey(sectionKey);
  if (!found || found.phase.key !== phaseKey || !found.section.checkpoint) return true;
  try {
    if (localStorage.getItem(`aghf_section_clear:${phaseKey}-${sectionKey}`) === 'true') return true;
  } catch (err) { /* storage blocked */ }
  // The clear flag lives in this browser only. A member who has already
  // completed lessons in the next section got past this gate (on another
  // device, or before the checkpoint existed), so don't lock her out.
  if (completedIds) {
    const next = found.phase.sections[found.phase.sections.indexOf(found.section) + 1];
    if (next && next.lessons.some((l) => l.n && completedIds.has(`${phaseKey}-${l.n}`))) return true;
  }
  return false;
}
