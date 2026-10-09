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
        hook: 'Before charts and setups, you learn the language of trading and how a move turns into dollars.',
        learn: [
          { icon: 'swap', tone: 'pink', label: 'Long vs. short' },
          { icon: 'globe', tone: 'teal', label: 'Why markets move' },
          { icon: 'bars', tone: 'purple', label: 'Futures, minis and micros' },
          { icon: 'coin', tone: 'peach', label: 'Points into P&L' },
        ],
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
        hook: 'You set up your chart and your account, and you decide your exit before you ever enter.',
        learn: [
          { icon: 'layout', tone: 'purple', label: 'A clean chart setup' },
          { icon: 'doc', tone: 'teal', label: 'Market, limit and stop orders' },
          { icon: 'stop', tone: 'pink', label: 'Stops based on structure' },
          { icon: 'scale', tone: 'peach', label: 'Sizing from your risk plan' },
        ],
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
        hook: 'Every candle tells a story, and every timeframe shows a different part of it.',
        learn: [
          { icon: 'candle', tone: 'pink', label: 'Every part of a candle' },
          { icon: 'eye', tone: 'teal', label: 'Reaching vs. accepting a level' },
          { icon: 'layers', tone: 'purple', label: 'How timeframes stack' },
          { icon: 'zoom', tone: 'peach', label: 'Zoom out before you zoom in' },
        ],
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
        eyebrow: 'Phase 2 · Section 4 · How Markets Move',
        heading: 'How Markets Move',
        hook: 'You stop guessing direction and start describing what price is actually doing.',
        learn: [
          { icon: 'up', tone: 'teal', label: 'Swing highs and lows' },
          { icon: 'flag', tone: 'pink', label: 'HH, HL, LH and LL' },
          { icon: 'swap', tone: 'purple', label: 'Trending vs. ranging' },
          { icon: 'layers', tone: 'peach', label: 'Internal vs. external structure' },
        ],
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
      checkpoint: { title: 'Can You Read the Stairs?', xp: 0, firstStep: 'game', desc: 'Structure Builder + Knowledge Check + Check-In. Clear this to unlock Section 5.' } },
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
        eyebrow: 'Phase 2 \u00b7 Section 5 \u00b7 Breaks, Shifts & Fakeouts',
        heading: 'Breaks, Shifts & Fakeouts',
        hook: 'Not every broken level matters, so you learn to investigate what actually changed.',
        learn: [
          { icon: 'bolt', tone: 'pink', label: 'Break of structure (BOS)' },
          { icon: 'swap', tone: 'purple', label: 'Market structure shift (MSS)' },
          { icon: 'candle', tone: 'teal', label: 'A wick vs. a close' },
          { icon: 'eye', tone: 'peach', label: 'Spotting a fakeout' },
        ],
        paragraphs: [
          { text: 'You can see the structure. Now price starts interacting with it.' },
          { text: 'Highs break. Lows break. Wicks poke through levels. Some of those breaks change the story. Many of them don\u2019t.' },
          { cls: 'sec-welcome-big', text: 'WHAT ACTUALLY BROKE?' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cIt broke a low, so it\u2019s bearish\u201d</span> becomes <span class="sec-welcome-quote">\u201cAn internal low broke, but the relevant supporting swing is still intact.\u201d</span>' },
          { text: 'Section 4 taught you to see it. This section teaches you to interpret it.' },
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
      checkpoint: { title: 'Break or Fake? \ud83d\udc40', xp: 0, firstStep: 'game', desc: 'Break or Fake? game + Knowledge Check + Check-In. Clear this to unlock Section 6.' } },
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
        eyebrow: 'Phase 2 \u00b7 Section 6 \u00b7 Reading Key Levels',
        heading: 'Reading Key Levels',
        hook: 'You learn to mark levels with purpose instead of covering your chart in lines.',
        learn: [
          { icon: 'ruler', tone: 'purple', label: 'Lines vs. zones' },
          { icon: 'shield', tone: 'teal', label: 'Support and resistance areas' },
          { icon: 'flag', tone: 'pink', label: 'Highs and lows as landmarks' },
          { icon: 'check', tone: 'peach', label: 'A clean, purposeful chart' },
        ],
        paragraphs: [
          { text: 'You can see the structure. You can interpret what changed. Now: which parts of the chart actually deserve your attention?' },
          { text: 'Most charts aren\u2019t missing levels. They\u2019re drowning in them.' },
          { cls: 'sec-welcome-big', text: 'MARK WITH PURPOSE.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cThat\u2019s support\u201d</span> becomes <span class="sec-welcome-quote">\u201cThis is the swing low supporting the current bullish structure.\u201d</span>' },
          { text: 'Section 4 taught you to see it. Section 5 taught you to interpret it. This section teaches you to locate what matters.' },
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
    key: 'p3', n: 3, badge: 'u', title: 'Reading Price Like a Pro', locked: false, finalGate: 's9',
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
        eyebrow: 'Phase 3 \u00b7 Section 7 \u00b7 Understanding Liquidity',
        heading: 'Understanding Liquidity',
        hook: 'Liquidity is where orders may be sitting, and you learn to read it as context, not an entry rule.',
        learn: [
          { icon: 'coin', tone: 'peach', label: 'Buy-side and sell-side liquidity' },
          { icon: 'stop', tone: 'pink', label: 'Why stops cluster' },
          { icon: 'scale', tone: 'purple', label: 'Equal highs and lows' },
          { icon: 'eye', tone: 'teal', label: 'Sweeps vs. breaks' },
        ],
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
      checkpoint: { title: 'Liquidity Detective \ud83d\udca7', xp: 0, firstStep: 'game', desc: 'Liquidity Detective + Knowledge Check + Check-In. Clear this to unlock Section 8.' } },
      { key: 's8', n: 8, badge: 'p', title: 'Gaps, Imbalances & Price Delivery',
        dayliNote: 'FVGs are not required for a Dayli ICC setup. We learn them because they’re part of market literacy and can provide context. Not because they’re a mandatory entry condition.',
        lessons: [
          { n: 10, title: 'What Is Price Delivery?', quote: 'Don’t just ask where price went. Ask how it got there.', xp: 70 },
          { n: 11, title: 'Displacement', quote: 'Momentum is information. Not a complete trade plan.', xp: 70 },
          { n: 12, title: 'What Is Imbalance?', quote: 'Imbalance ≠ FVG. And price doesn’t have to return.', xp: 70 },
          { n: 13, title: 'Fair Value Gaps', quote: 'A three-candle pattern. Not another entry rule.', xp: 70 },
          { n: 14, title: 'Efficient vs Inefficient', quote: 'More balanced-looking or more imbalanced-looking. Not good or bad.', xp: 70 },
          { n: 15, title: 'Why Price May Revisit an Imbalance', quote: 'Possible revisit ≠ guaranteed destination.', xp: 70 },
          { n: 16, title: 'When FVGs Matter', quote: 'The existence of a concept is not the same as relevance.', xp: 70 },
          { n: 17, title: 'When FVGs Don’t Matter', quote: 'If the drawing makes you forget the structure, the drawing is hurting you.', xp: 70 },
          { n: 18, title: 'FVGs in the Dayli ICC Framework', quote: 'We don’t force our method to fit another concept.', xp: 70 },
        ],
      welcome: {
        eyebrow: 'Phase 3 \u00b7 Section 8 \u00b7 Gaps, Imbalances & Price Delivery',
        heading: 'Gaps, Imbalances & Price Delivery',
        hook: 'You start asking how price got somewhere, not just where it went.',
        learn: [
          { icon: 'bolt', tone: 'pink', label: 'Displacement' },
          { icon: 'candle', tone: 'purple', label: 'Building an FVG' },
          { icon: 'scale', tone: 'teal', label: 'Balanced vs. imbalanced delivery' },
          { icon: 'zoom', tone: 'peach', label: 'When a gap actually matters' },
        ],
        paragraphs: [
          { text: 'You can see where orders may be sitting. Now: how did price travel to get there?' },
          { text: 'Two moves can reach the same place in completely different ways. This section is about the trip.' },
          { cls: 'sec-welcome-big', text: 'SEE HOW PRICE TRAVELED.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cThere\u2019s an FVG, I\u2019m waiting to buy there\u201d</span> becomes <span class="sec-welcome-quote">\u201cPrice displaced and left a bullish FVG. That\u2019s context. Structure first, and the entry model hasn\u2019t formed.\u201d</span>' },
          { text: 'FVG \u2260 entry. Imbalance \u2260 entry. Displacement \u2260 entry. And an FVG fill or retest is never required.' },
        ],
        goals: [
          'Ask how price got somewhere, not just where it went.',
          'Recognize displacement, and what it does and doesn\u2019t tell you.',
          'See imbalance as one-sided delivery, and tell it apart from an FVG.',
          'Build bullish and bearish FVGs from three candles.',
          'Describe delivery as more balanced-looking or more imbalanced-looking.',
          'Explain why price may revisit an imbalance, without expecting it to.',
          'Decide when an FVG matters, and clean up the ones that don\u2019t.',
          'Keep FVGs as context, never a Dayli ICC requirement.',
        ],
        mission: 'See how price traveled. Don\u2019t turn the trip into an entry rule.',
      },
      checkpoint: { title: 'Price Delivery Lab \u26a1', xp: 0, firstStep: 'game', desc: 'Price Delivery Lab + Knowledge Check + Check-In. Clear this to unlock Section 9.' } },
      { key: 's9', n: 9, badge: 'c', title: 'Understanding Market Participation',
        lessons: [
          { n: 19, title: 'Supply & Demand Basics', quote: 'They show where strong participation appeared before. They don’t replace structure.', xp: 70 },
          { n: 20, title: 'Buying vs Selling Pressure', quote: 'Who appears more aggressive right now. Not who wins forever.', xp: 70 },
          { n: 21, title: 'Aggressive Participation', quote: 'Describe what price did before you decide who did it.', xp: 70 },
          { n: 22, title: 'Accumulation & Distribution', quote: 'A label becomes more useful after structure confirms the story.', xp: 70 },
          { n: 23, title: 'Order Flow Intuition', quote: 'You don’t need more data if you can’t read the price in front of you.', xp: 70 },
          { n: 24, title: 'What Price Can Tell You', quote: 'Ask the chart questions it can actually answer.', xp: 70 },
          { n: 25, title: 'What Price Cannot Prove', quote: 'If you can’t prove the story, don’t build your trade around it.', xp: 70 },
          { n: 26, title: 'Market Participation + Structure', quote: 'Context gets deeper. The chart doesn’t need to get messier.', xp: 70 },
          { n: 27, title: 'How This Fits Into Dayli ICC', quote: 'More knowledge should make your chart clearer. Not your rules heavier.', xp: 70 },
        ],
      welcome: {
        eyebrow: 'Phase 3 \u00b7 Section 9 \u00b7 Understanding Market Participation',
        heading: 'Understanding Market Participation',
        hook: 'You read who seems to be pushing price, and you hold that read lightly.',
        learn: [
          { icon: 'bars', tone: 'teal', label: 'Buying vs. selling pressure' },
          { icon: 'layers', tone: 'purple', label: 'Supply and demand zones' },
          { icon: 'eye', tone: 'pink', label: 'Observation vs. interpretation' },
          { icon: 'doc', tone: 'peach', label: 'Your Market Read' },
        ],
        paragraphs: [
          { text: 'You can see where orders may sit and how price delivered. Now the hardest question of Phase 3: what can I actually claim from this chart?' },
          { text: 'Evidence first. Interpretation carefully. Stories never.' },
          { cls: 'sec-welcome-big', text: 'OBSERVE FIRST. ASSUME LESS.' },
          { text: 'This is where <span class="sec-welcome-quote">\u201cThis is definitely institutional accumulation\u201d</span> becomes <span class="sec-welcome-quote">\u201cPrice is consolidating. Buyers appeared aggressive from the low. I can\u2019t prove who, and the entry model hasn\u2019t formed.\u201d</span>' },
          { text: 'Then the Phase 3 Final, and Phase 4 opens: Finding Direction.' },
        ],
        goals: [
          'Describe supply and demand zones as past participation, not promises.',
          'Read buying vs selling pressure, including \u201cmixed / unclear\u201d.',
          'Describe aggressive moves without naming who did it.',
          'Treat accumulation and distribution as hindsight labels.',
          'Build order-flow intuition from candles alone.',
          'Ask the chart questions it can answer, and sort evidence honestly.',
          'Separate observation, interpretation and unsupported claims.',
          'Hold everything in a Market Read, with execution left to the entry model.',
        ],
        mission: 'Prove your read. Then hold it lightly.',
      },
      checkpoint: { title: 'Pressure Reader \ud83d\udcca', xp: 0, firstStep: 'game', desc: 'Pressure Reader + Knowledge Check + Check-In + the Phase 3 Final. Clear this to complete Phase 3.' } },
    ],
  },
  {
    key: 'p4', n: 4, badge: 'd', title: 'Finding Direction', locked: false, finalGate: 's11',
    sections: [
      { key: 's10', n: 10, badge: 'p', title: 'Finding Your Bias',
        dayliNote: 'This section ends with a 4H → 1H thesis. Not an entry. Execution comes later, with the Dayli ICC Method.',
        lessons: [
          { n: 1, title: 'What Is Directional Bias?', quote: 'Bias isn’t a feeling. It’s a thesis you can explain and invalidate.', xp: 70 },
          { n: 2, title: 'The 4H Tells the Bigger Story', quote: 'Before you trade the furniture, figure out where the doors are. 😂', xp: 70 },
          { n: 3, title: 'Finding the 4H External Range', quote: 'Not the highest high. The high defining the current room.', xp: 70 },
          { n: 4, title: 'Previous 4H Swing Highs & Lows', quote: 'The swing is the landmark. The close tells you how price interacted with it.', xp: 70 },
          { n: 5, title: 'When a New 4H Swing Changes the Map', quote: 'Don’t stay loyal to old levels. Stay loyal to current structure.', xp: 70 },
          { n: 6, title: 'Internal Movement Inside the 4H Room', quote: 'The furniture can move. You’re still inside the room.', xp: 70 },
          { n: 7, title: 'Reading 1H Structure Inside the 4H', quote: 'The 4H asks where you are. The 1H asks how you’re moving through it.', xp: 70 },
          { n: 8, title: 'Finding Relevant 1H Swings', quote: 'The closer swing isn’t always the right swing. Structure decides.', xp: 70 },
          { n: 9, title: 'MSS as Directional Information', quote: 'MSS changes the conversation. Dayli ICC later tells you if you have an entry.', xp: 70 },
          { n: 10, title: 'External Objectives & Liquidity', quote: 'Potential objective. Never a guaranteed target.', xp: 70 },
          { n: 11, title: 'Bullish Scenario vs. Bearish Scenario', quote: 'A thesis tells you what you’d need to see. Not what you need the market to do.', xp: 70 },
          { n: 12, title: 'Bias Invalidation', quote: 'If you can’t say what would change your mind, you have an opinion.', xp: 70 },
          { n: 13, title: 'Updating Your Bias in Real Time', quote: 'Consistency in process. Not consistency in opinion.', xp: 70 },
        ],
      welcome: {
        eyebrow: 'Phase 4 · Section 10 · Finding Your Bias',
        heading: 'Finding Your Bias',
        hook: 'You build a thesis you can explain, and you define what would prove it wrong.',
        learn: [
          { icon: 'globe', tone: 'purple', label: 'Reading the 4H room' },
          { icon: 'zoom', tone: 'teal', label: 'The 1H swing that matters' },
          { icon: 'target', tone: 'pink', label: 'Naming an objective' },
          { icon: 'stop', tone: 'peach', label: 'What invalidates your thesis' },
        ],
        paragraphs: [
          { text: 'Phases 1 to 3 taught you to recognize, read and filter. Now you start building something: <strong>a market thesis.</strong>' },
          { cls: 'sec-welcome-big', text: 'WHAT IS THE MARKET TELLING ME?' },
          { text: '<strong>4H · Read the Room.</strong> What’s the larger story? <strong>1H · Build the Map.</strong> What’s happening inside it?' },
          { text: 'Bias isn’t <span class="sec-welcome-quote">“I feel bullish.”</span> It’s a conditional thesis you can explain, and invalidate.' },
        ],
        goals: [
          'Tell a bias from a prediction.',
          'Read the 4H room: find the doors.',
          'Update the map when new 4H structure forms.',
          'Read 1H movement inside the 4H room.',
          'Pick the 1H swing that actually matters.',
          'Treat MSS as information, not an entry.',
          'Name a potential objective, and how much room is left.',
          'Build a primary and an alternate scenario.',
          'Define what would invalidate your thesis.',
          'Update your bias when price changes the evidence.',
        ],
        mission: 'Build a thesis you can explain and invalidate.',
      },
      checkpoint: { title: 'Read the Room 🏠', xp: 0, firstStep: 'game', desc: 'Read the Room Lab + Knowledge Check + Check-In. Clear this to unlock Section 11.' } },
      { key: 's11', n: 11, badge: 't', title: 'Location Within the Range',
        dayliNote: 'Structure first. Location second. Execution later. Discount is not a buy signal, and premium is not a sell signal.',
        lessons: [
          { n: 14, title: 'Understanding the Trading Range', quote: 'Before you call price high or low, ask: relative to what?', xp: 70 },
          { n: 15, title: 'Range Equilibrium', quote: 'Equilibrium is a reference. Not a magic line.', xp: 70 },
          { n: 16, title: 'Premium & Discount', quote: 'Premium or discount of WHAT range?', xp: 70 },
          { n: 17, title: 'Buying Lower / Selling Higher', quote: 'Location can improve a directional idea. It doesn’t create one.', xp: 70 },
          { n: 18, title: 'Premium / Discount Is Not an Entry Signal', quote: 'Location can’t make an invalid setup valid.', xp: 70 },
          { n: 19, title: 'Room to the Target', quote: 'Right about direction doesn’t mean early enough to trade it.', xp: 70 },
          { n: 20, title: 'Location + Structure + Direction', quote: 'Direction says which side. Location says if you’re late to the party. 😂', xp: 70 },
          { n: 21, title: 'Building the Complete 4H → 1H Thesis', quote: 'Analysis tells you what you’re waiting for.', xp: 80 },
        ],
      welcome: {
        eyebrow: 'Phase 4 · Section 11 · Location Within the Range',
        heading: 'Location Within the Range',
        hook: 'Direction without location is incomplete, so you learn where price sits inside its range.',
        learn: [
          { icon: 'ruler', tone: 'purple', label: 'Finding equilibrium' },
          { icon: 'scale', tone: 'pink', label: 'Premium vs. discount' },
          { icon: 'target', tone: 'teal', label: 'Room to your objective' },
          { icon: 'check', tone: 'peach', label: 'A complete 4H to 1H thesis' },
        ],
        paragraphs: [
          { text: 'You know the doors. You know the room. You know the 1H movement inside it.' },
          { cls: 'sec-welcome-big', text: 'WHERE ARE YOU STANDING?' },
          { text: 'Being bullish near the bottom of the room isn’t the same as being bullish when you’re already standing at the top door. 😂' },
          { text: '<strong>Structure first. Location second. Execution later.</strong>' },
        ],
        goals: [
          'Pick the range that frames your analysis.',
          'Calculate and place equilibrium.',
          'Name premium and discount, and which range you mean.',
          'See how location changes positioning.',
          'Refuse the discount = buy shortcut.',
          'Measure room to the objective.',
          'Combine structure, direction and location.',
          'Build a complete 4H → 1H thesis, then wait.',
        ],
        mission: 'Direction without location is incomplete.',
      },
      checkpoint: { title: 'Where Are You in the Room? 🏠📍', xp: 0, firstStep: 'game', desc: 'Location Lab + Knowledge Check + the Phase 4 Final Quiz. Clear this to complete Phase 4.' } },
    ],
  },
  {
    key: 'p5', n: 5, badge: 'u', title: 'The Dayli ICC Method ✦', locked: false,
    sections: [
      { key: 's12', n: 12, badge: 'u', title: 'ICC Across the Market',
        dayliNote: 'This section teaches the ICC story: how price moves through Indication, Correction and Continuation. The 1-minute entry model comes next. Learn the story before you learn the trigger.',
        lessons: [
          { n: 1, title: 'What Is ICC?', quote: 'ICC is how I organize the story price is telling me.', xp: 75 },
          { n: 2, title: 'Indication', quote: 'What did price actually prove?', xp: 75 },
          { n: 3, title: 'Correction', quote: 'A correction is price moving back. A reversal is price changing the story.', xp: 75 },
          { n: 4, title: 'Continuation', quote: 'Indication starts the story. Correction tests it. Continuation supports it.', xp: 75 },
          { n: 5, title: 'The Full ICC Sequence', quote: 'The shape isn’t the method.', xp: 75 },
          { n: 6, title: 'ICC Across Different Timeframes', quote: 'Same market. Different scale.', xp: 75 },
          { n: 7, title: 'Higher-Timeframe ICC', quote: 'What chapter of the story are we in?', xp: 75 },
          { n: 8, title: 'ICC + Market Structure', quote: 'Structure asks what price is building. ICC asks where price is in the sequence.', xp: 75 },
          { n: 9, title: 'ICC + Liquidity + Location', quote: 'Context can support understanding without becoming another box to check.', xp: 75 },
          { n: 10, title: 'When ICC Is Unclear', quote: 'If you have to argue with the chart to make ICC fit, it probably isn’t clean enough yet.', xp: 75 },
        ],
      welcome: {
        eyebrow: 'Phase 5 · Section 12 · ICC Across the Market',
        heading: 'You Earned Your Way Here.',
        hook: 'You learn ICC, the story price tells in three chapters: Indication, Correction and Continuation.',
        learn: [
          { icon: 'bolt', tone: 'teal', label: 'Meaningful indication' },
          { icon: 'swap', tone: 'pink', label: 'Correction vs. reversal' },
          { icon: 'up', tone: 'purple', label: 'Waiting for continuation' },
          { icon: 'layers', tone: 'peach', label: 'ICC on any timeframe' },
        ],
        paragraphs: [
          { text: '4H: Read the Room ✓ · 1H: Build the Map ✓ · Thesis ✓' },
          { text: 'You know how to read the market. Now Dayli shows you how she <strong>organizes the story</strong> price is telling.' },
          { cls: 'sec-welcome-big', text: 'I · C · C' },
          { text: 'Indication. Correction. Continuation. A way to read price on <strong>any</strong> timeframe.' },
          { text: '<strong>Learn the story before you learn the trigger.</strong> The 1-minute entry model unlocks in Section 13.' },
        ],
        goals: [
          'Explain ICC as Indication → Correction → Continuation.',
          'Spot meaningful indication, not just big candles.',
          'Tell a correction from a reversal.',
          'Wait for continuation instead of predicting it.',
          'Read ICC on more than one timeframe.',
          'Name the 4H ICC stage and its clarity.',
          'Use structure and ICC together.',
          'Keep liquidity and location as context, never requirements.',
          'Say “I don’t know yet” when price isn’t clear.',
        ],
        mission: 'What chapter of the ICC story is price telling me right now?',
      },
      checkpoint: { title: 'ICC Story Builder 🧠', xp: 0, firstStep: 'game', desc: 'ICC Story Builder + Knowledge Check + Check-In. Clear this to unlock Section 13.' } },
      { key: 's13', n: 13, badge: 'p', title: 'The Dayli ICC 1-Minute Entry Model™',
        dayliNote: 'Stop anticipating the move. Make price prove every step. The analysis gets me interested. The 1-minute ICC earns the entry.',
        lessons: [
          { n: 11, title: 'What Is the Dayli ICC 1M Entry Model?', quote: 'The analysis gets me interested. The 1-minute ICC earns the entry.', xp: 80 },
          { n: 12, title: 'The Pre-Indication Level', quote: 'If you don’t know your PIL, you’re not ready to label indication.', xp: 80 },
          { n: 13, title: 'Choosing the Correct PIL', quote: 'Structure created the PIL. The map can update.', xp: 80 },
          { n: 14, title: 'Indication', quote: 'I don’t care that price visited the level. Prove it to me with the close.', xp: 80 },
          { n: 15, title: 'Correction', quote: 'If price never corrects, we don’t invent the correction because we want the trade.', xp: 80 },
          { n: 16, title: 'Continuation', quote: 'Continuation tells me price is trying again.', xp: 80 },
          { n: 17, title: 'The Full Candle-Close Sequence', quote: 'Rules remove the need to negotiate with the chart.', xp: 80 },
          { n: 18, title: 'The Retest', quote: 'Wait for price to come back to you.', xp: 80 },
          { n: 19, title: 'The Entry', quote: 'The entry is the execution point the model created.', xp: 80 },
          { n: 20, title: 'Missed Retest = Missed Trade', quote: 'A missed trade is not a bad trade. It’s just a trade you didn’t get.', xp: 80 },
          { n: 21, title: 'When the Sequence Resets', quote: 'Don’t wait forever for an old setup while price builds a new one in front of you.', xp: 80 },
          { n: 22, title: 'Clean vs Messy Dayli ICC', quote: 'A valid model should not require a courtroom argument. 😂', xp: 80 },
          { n: 23, title: 'What Invalidates the Setup?', quote: 'Reassess when the structure that created the setup changes.', xp: 80 },
          { n: 24, title: 'When There Is No Trade', quote: 'Has price actually earned my entry?', xp: 80 },
        ],
      welcome: {
        eyebrow: 'Phase 5 · Section 13 · The Dayli ICC 1-Minute Entry Model™',
        heading: 'Now… How Do I Actually Enter?',
        hook: 'This is the 1-minute entry model, where price has to prove every step before you act.',
        learn: [
          { icon: 'flag', tone: 'purple', label: 'Choosing your PIL' },
          { icon: 'candle', tone: 'pink', label: 'Counting closes, not wicks' },
          { icon: 'check', tone: 'teal', label: 'Indication, Correction, Continuation' },
          { icon: 'target', tone: 'peach', label: 'Entering on the first retest' },
        ],
        paragraphs: [
          { text: '4H: Read the Room ✓ · 1H: Build the Map ✓ · HTF ICC: Read the Story ✓' },
          { cls: 'sec-welcome-big', text: '1M · EXECUTE.' },
          { text: 'The 1M doesn’t create the whole trade idea. You already know the market, the structure, the direction, the location and the story. <strong>Now you wait for execution.</strong>' },
          { text: 'PIL → Indication → Correction → Continuation → Retest → Entry. <strong>Every step has to be earned.</strong>' },
        ],
        goals: [
          'Choose the structurally relevant PIL.',
          'Count candle CLOSES, never wicks.',
          'Confirm Indication, Correction and Continuation in order.',
          'Wait for the first retest, and never chase.',
          'Treat a missed retest as a missed trade, not a bad one.',
          'Reassess when a new swing changes the setup.',
          'Tell clean from messy, and pass when the model doesn’t complete.',
        ],
        mission: 'Stop anticipating the move. Make price prove every step.',
      },
      checkpoint: { title: 'ICC Execution Lab 🎯', xp: 0, firstStep: 'game', desc: 'ICC Execution Lab + Knowledge Check + Check-In. Clear this to unlock Section 14.' } },
      { key: 's14', n: 14, badge: 't', title: 'Making the Timeframes Work Together', lessons: [
        { n: 25, title: '4H: Read the Room', quote: 'Where is price within the larger structure?', xp: 80 },
        { n: 26, title: '1H: Build the Map', quote: 'What structure and swings are actually relevant?', xp: 80 },
        { n: 27, title: 'The 15M Checkpoint', quote: 'The bridge between the higher-timeframe story and execution.', xp: 80 },
        { n: 28, title: '1M: Execute Dayli ICC', quote: 'Is the entry model actually present? Then, and only then, you act.', xp: 80 },
        { n: 29, title: 'How HTF ICC and 1M ICC Work Together', quote: 'The same sequence, nested inside itself.', xp: 80 },
        { n: 30, title: 'Conflicting Information Across Timeframes', quote: 'The higher timeframe provides context, but lower-timeframe structure shows what price is doing right now. Learn which question each timeframe is answering.', xp: 80 },
      ],
      welcome: {
        eyebrow: 'Phase 5 · Section 14 · Making the Timeframes Work Together',
        heading: 'One Story, Four Timeframes',
        hook: 'This is where every timeframe you’ve learned comes together into one top-down process, from the 4H all the way to your 1M entry.',
        learn: [
          { icon: 'eye', tone: 'purple', label: '4H: Read the room' },
          { icon: 'layers', tone: 'pink', label: '1H: Build the map' },
          { icon: 'zoom', tone: 'teal', label: '15M: The checkpoint' },
          { icon: 'target', tone: 'peach', label: '1M: Execute Dayli ICC' },
        ],
        paragraphs: [
          { text: 'You know how to read the 4H. You know how to map the 1H. You know the 1M entry model. <strong>Now you learn how they talk to each other.</strong>' },
          { cls: 'sec-welcome-big', text: '4H → 1H → 15M → 1M.' },
          { text: 'Each timeframe answers a different question. The higher timeframes give you the story. The lower timeframes show you what price is doing right now. <strong>The 15M is recommended for extra confluence, but it isn’t a requirement.</strong>' },
        ],
        goals: [
          'Read where price is within the larger 4H structure.',
          'Build a 1H map with only the swings and levels that matter.',
          'Use the 15M as a checkpoint, not an entry.',
          'Execute Dayli ICC on the 1M only when the model is actually present.',
          'See how HTF ICC and 1M ICC are the same sequence, nested inside itself.',
          'Know which question each timeframe answers when they disagree.',
        ],
        mission: 'Carry one story from the 4H down to the 1M, and act only when price proves it.',
      },
      game: { title: 'ICC Sequence Game', quote: 'Level 1: spot Indication. Level 5: full HTF analysis into 1M execution.', xp: 0, href: 'section.html?phase=p5&section=s14&step=game' } },
    ],
  },
  {
    key: 'p6', n: 6, badge: 't', title: 'Pulling the Trigger', locked: false, finalGate: 's17',
    sections: [
      { key: 's15', n: 15, badge: 'p', title: 'How to Actually Enter',
        dayliNote: 'This section isn’t another strategy lesson. You already know the model. This is execution training: can you actually wait long enough to follow it? Let price earn the entry.',
        lessons: [
          { n: 1, title: 'The Job of the 1-Minute Timeframe', quote: 'Don’t use higher timeframes to justify a trade you already decided to take on 1M.', xp: 80 },
          { n: 2, title: 'Your Pre-Entry Checklist', quote: 'The card prepares you to wait. It doesn’t approve an entry.', xp: 80 },
          { n: 3, title: 'Developing Setup vs Executable Setup', quote: '“I see what it might be doing” is not “I have an entry.”', xp: 80 },
          { n: 4, title: 'Confirmation vs Anticipation', quote: 'A trade can work after you broke your rules. That does not make the rule break good execution.', xp: 80 },
          { n: 5, title: 'Timing the First Retest', quote: 'My entry comes after confirmation. Not before it.', xp: 80 },
          { n: 6, title: 'No Retest, No Chase', quote: 'Missing the move doesn’t cost your account. Chasing it can.', xp: 80 },
          { n: 7, title: 'Being Right About Direction vs Being Right About the Trade', quote: 'Don’t let a winning result teach you a losing habit.', xp: 80 },
          { n: 8, title: 'When the Best Entry Is No Entry', quote: 'Pulling the trigger is a skill. So is keeping your finger off it.', xp: 80 },
        ],
      welcome: {
        eyebrow: 'Phase 6 · Section 15 · How to Actually Enter',
        heading: 'Pulling the Trigger.',
        hook: 'Knowing where price may go is not the same as having permission to enter.',
        learn: [
          { icon: 'doc', tone: 'purple', label: 'Your pre-entry card' },
          { icon: 'eye', tone: 'teal', label: 'Developing vs. confirmed' },
          { icon: 'clock', tone: 'pink', label: 'Timing the first retest' },
          { icon: 'stop', tone: 'peach', label: 'Choosing no trade' },
        ],
        paragraphs: [
          { text: 'PIL → Indication → Correction → Continuation → Retest → Entry.' },
          { text: 'You know the model. But knowing the sequence on a screenshot and watching it form candle by candle are two different things. 😂' },
          { cls: 'sec-welcome-big', text: 'LET PRICE EARN THE ENTRY.' },
          { text: 'Phase 5 taught the method. <strong>Phase 6 is trading it without getting in your own way.</strong>' },
        ],
        goals: [
          'Keep the 1M at the end of the process, not the start.',
          'Use a short pre-entry card that prepares you to wait.',
          'Tell developing, confirmed and executable apart.',
          'Act on confirmation, never anticipation.',
          'Time the entry at the first valid retest.',
          'Let a move go when it runs without a retest.',
          'Grade process and outcome separately.',
          'Choose no trade when the model doesn’t complete.',
        ],
        mission: 'Knowing where price may go is not the same as having permission to enter.',
      },
      checkpoint: { title: 'Execution Timing Lab 🎯', xp: 0, firstStep: 'game', desc: 'Execution Timing Lab + Knowledge Check + Check-In. Clear this to unlock Section 16.' } },
      { key: 's16', n: 16, badge: 't', title: 'Managing the Trade',
        dayliNote: 'You’re in the trade. Now the challenge isn’t reading price. It’s noticing whether what price just did requires you to do anything. Usually: no. Manage the plan, not the emotion.',
        lessons: [
          { n: 9, title: 'Plan the Trade Before You’re In It', quote: 'Your calmest decisions should happen before money starts moving.', xp: 80 },
          { n: 10, title: 'Fixed Targets vs Structure-Based Targets', quote: 'More flexible does not automatically mean more advanced.', xp: 80 },
          { n: 11, title: 'Understanding the Dayli ICC Management Example', quote: 'Don’t memorize my dollar amount. Understand my risk structure.', xp: 80 },
          { n: 12, title: 'Partials & Runners', quote: 'Partials aren’t automatically safer if you take them every time you’re scared.', xp: 80 },
          { n: 13, title: 'Moving Your Stop & Break Even', quote: 'Break even can reduce risk. It can also reduce the room the trade has to move.', xp: 80 },
          { n: 14, title: 'Over-Managing the Trade', quote: 'Sometimes the best management decision is to stop touching things.', xp: 80 },
          { n: 15, title: 'Stop Watching Dollars. Read the Trade.', quote: 'P&L is an outcome display. It is not market structure.', xp: 80 },
          { n: 16, title: 'Follow the Plan, Then Grade the Trade', quote: 'Your P&L grades the outcome. Your journal grades the trader.', xp: 80 },
        ],
      welcome: {
        eyebrow: 'Phase 6 · Section 16 · Managing the Trade',
        heading: 'You’re In. Now What? 😭',
        hook: 'Once you’re in, your job is to follow the plan you wrote before you entered.',
        learn: [
          { icon: 'lock', tone: 'purple', label: 'Locking your management plan' },
          { icon: 'layers', tone: 'teal', label: 'Partials and runners' },
          { icon: 'shield', tone: 'pink', label: 'Moving a stop for a reason' },
          { icon: 'scale', tone: 'peach', label: 'Grading management fairly' },
        ],
        paragraphs: [
          { text: '+$40 · +$86 · +$124 · +$61 · +$18 · −$12' },
          { cls: 'sec-welcome-big', text: 'MANAGE THE PLAN. NOT THE EMOTION.' },
          { text: 'Section 15 trained: can you wait before entering? <strong>Section 16 trains: can you stop interfering after entering?</strong>' },
          { text: 'Plan · Lock · Observe · Follow · Intervene only if a rule allows · Grade.' },
        ],
        goals: [
          'Write and lock the management plan before entry.',
          'Compare fixed and structure-based management fairly.',
          'Read the 30/60 MNQ example as a structure, not a number.',
          'Use partials and runners only when they’re planned.',
          'Move a stop for a reason your plan defined.',
          'Stop over-managing.',
          'Read price and plan before P&L.',
          'Grade management separately from the outcome.',
        ],
        mission: 'Does what price just did require me to do anything?',
      },
      checkpoint: { title: 'Trade Management Simulator 📊', xp: 0, firstStep: 'game', desc: 'Trade Management Simulator + Knowledge Check + Check-In. Clear this to unlock Section 17.' } },
      { key: 's17', n: 17, badge: 'c', title: 'Protecting Your Account',
        dayliNote: 'A trader can have a great bias, a perfect PIL, beautiful ICC and clean execution, and still make a terrible decision if the financial risk is reckless. This section keeps one trade as one trade.',
        lessons: [
          { n: 17, title: 'What Is Risk Per Trade?', quote: 'A 30-point stop is not a $30 loss.', xp: 80 },
          { n: 18, title: 'Stop Distance vs Dollar Risk', quote: 'Points describe the chart. Dollars describe the account.', xp: 80 },
          { n: 19, title: 'Position Sizing from Risk', quote: 'Setup confidence does not override the risk ceiling.', xp: 80 },
          { n: 20, title: 'Understanding R', quote: 'R lets you compare trades without getting hypnotized by dollars.', xp: 80 },
          { n: 21, title: '1:1 vs 1:2', quote: 'Win rate is not the whole edge.', xp: 80 },
          { n: 22, title: 'The Dayli ICC Risk Example', quote: 'Copy the process before you copy the size.', xp: 80 },
          { n: 23, title: 'Daily Loss Limits', quote: 'Your daily stop exists before the revenge-trading version of you shows up. 😂', xp: 80 },
          { n: 24, title: 'Maximum Trades & Frequency Risk', quote: 'Risk per trade controls one decision. Maximum trades controls the day.', xp: 80 },
          { n: 25, title: 'Drawdown, Losing Streaks & Survival', quote: 'Your risk model needs room for your strategy to be wrong.', xp: 80 },
          { n: 26, title: 'Prop-Firm Risk vs Personal Capital', quote: 'The chart can be the same. The account decision can be different.', xp: 80 },
        ],
      welcome: {
        eyebrow: 'Phase 6 · Section 17 · Protecting Your Account 🛡️',
        heading: 'One Trade Isn’t the Game.',
        hook: 'You make sure every trade fits your account before you take it.',
        learn: [
          { icon: 'coin', tone: 'peach', label: 'Stop distance into dollars' },
          { icon: 'scale', tone: 'purple', label: 'Sizing from your risk' },
          { icon: 'ruler', tone: 'teal', label: 'Speaking in R' },
          { icon: 'stop', tone: 'pink', label: 'Respecting your daily limit' },
        ],
        paragraphs: [
          { text: 'Trade 1 · Trade 2 · Trade 3 · Trade 4 · Trade 5. Some wins. Some losses.' },
          { text: 'You know how to take a trade. <strong>But can your account survive the way you’re taking them?</strong>' },
          { cls: 'sec-welcome-big', text: 'KNOW THE LOSS BEFORE YOU CHASE THE PROFIT.' },
          { text: 'Trade risk · Daily risk · Account risk · Survival risk. Four layers, never the same number.' },
        ],
        goals: [
          'Turn a stop distance into dollar risk.',
          'Keep points and dollars apart.',
          'Size from risk, floored to whole contracts.',
          'Speak in R.',
          'Read 1:1, 1:2 and expectancy honestly.',
          'Copy the Dayli process, not the size.',
          'Stop at the daily limit.',
          'Respect frequency, drawdown and losing streaks.',
          'Size the account, not just the chart.',
        ],
        mission: 'Does this trade fit the ACCOUNT before I take it?',
      },
      checkpoint: { title: 'Risk Control Lab 🛡️ + Phase 6 Final', xp: 0, firstStep: 'game', desc: 'Risk Control Lab + Knowledge Check + the Phase 6 trading session. Clear this to complete Phase 6.' } },
    ],
  },
  {
    key: 'p7', n: 7, badge: 'p', title: 'The Mindset Behind the Model', locked: false, finalGate: 's20',
    sections: [
      { key: 's18', n: 18, badge: 'p', title: 'Your Mind Is the Market 🪞',
        dayliNote: 'You already know what a valid setup looks like. Now we watch the person clicking the button. You can feel fear, FOMO, frustration or excitement and still make the correct decision. That is the skill.',
        lessons: [
          { n: 1, title: 'The Moment Between', quote: 'You don’t have to control every feeling. You have to control what it gets to change.', xp: 85 },
          { n: 2, title: 'After the Win', quote: 'Confidence is not confirmation.', xp: 85 },
          { n: 3, title: 'On a Heater', quote: 'A streak is a result. It isn’t a new risk plan.', xp: 85 },
          { n: 4, title: 'After the Loss', quote: 'The market didn’t take anything from you.', xp: 85 },
          { n: 5, title: 'Three in a Row', quote: 'A losing streak doesn’t change the model.', xp: 85 },
          { n: 6, title: 'I Knew It', quote: 'Missed profit is not lost money.', xp: 85 },
          { n: 7, title: 'Frozen', quote: 'Caution asks for more information. Fear asks for a guarantee.', xp: 85 },
          { n: 8, title: 'The Candle You Can’t Stop Watching', quote: 'Fear wants certainty. Trading gives you probabilities and rules.', xp: 85 },
          { n: 9, title: 'Just One More', quote: '“One more” is a feeling, not a setup.', xp: 85 },
          { n: 10, title: 'Waiting Is the Work', quote: 'Did my setup form… or did my patience run out?', xp: 85 },
          { n: 11, title: 'The Trade You Need to Work', quote: 'The market doesn’t know what you need.', xp: 85 },
          { n: 12, title: 'You Are Not Your P&L', quote: 'Your P&L is information about trades. It isn’t a verdict about you.', xp: 85 },
          { n: 13, title: 'Who’s Trading Now?', quote: 'Before every click: who’s trading now?', xp: 85 },
        ],
      welcome: {
        eyebrow: 'Phase 7 · Section 1 · Your Mind Is the Market 🪞',
        heading: 'She Already Knows the Chart. Now the Lesson Is Her.',
        hook: 'You already know how to read the chart, so now you learn to read yourself while you trade.',
        learn: [
          { icon: 'heart', tone: 'pink', label: 'The moment before you act' },
          { icon: 'up', tone: 'teal', label: 'What wins and losses do to you' },
          { icon: 'clock', tone: 'purple', label: 'Waiting is the work' },
          { icon: 'user', tone: 'peach', label: 'Your worth isn’t your P&L' },
        ],
        paragraphs: [
          { text: 'ANALYSIS ✓ · ENTRY ✓ · MANAGEMENT ✓ · RISK ✓' },
          { text: 'New session. A loss. The next setup begins forming. <span class="sec-welcome-quote">“I need that back.”</span> <span class="sec-welcome-quote">“This one better work.”</span> <span class="sec-welcome-quote">“Maybe I’ll size up.”</span> <span class="sec-welcome-quote">“Just this once.”</span>' },
          { cls: 'sec-welcome-big', text: 'FEEL THE EMOTION. FOLLOW THE RULE ANYWAY.' },
          { text: 'Phases 1 to 6 taught you how to read the market. <strong>Phase 7 teaches you how to read yourself while you’re reading it.</strong>' },
        ],
        goals: [
          'Notice the moment between seeing the chart and clicking.',
          'Feel what a win, a streak and a loss do to your judgment.',
          'Let a missed move go, and catch yourself freezing.',
          'Watch price, not your P&L, inside an open trade.',
          'Know when you’re done, and treat waiting as the work.',
          'Keep money pressure out of the trade.',
          'Separate your P&L from your worth.',
        ],
        mission: 'Who’s trading now?',
      },
      checkpoint: { title: 'Mindset Mirror 🪞', xp: 0, firstStep: 'game', desc: 'Mindset Mirror + Knowledge Check + Check-In. Clear this to unlock Section 2.' } },
      { key: 's19', n: 19, badge: 't', title: 'Rules That Protect You 📕',
        dayliNote: 'Knowing you’re FOMOing doesn’t stop the click. A rule you decided while calm does. This section turns awareness into your own operating system: MY AGHF RULEBOOK.',
        lessons: [
          { n: 14, title: 'Written While Calm', quote: 'Your rules were written for the version of you who doesn’t feel disciplined.', xp: 85 },
          { n: 15, title: '“But This One Looks Good.”', quote: 'Almost meeting your rules is not meeting your rules.', xp: 85 },
          { n: 16, title: 'Moving the Stop', quote: 'A moved stop makes the price of being wrong unlimited.', xp: 85 },
          { n: 17, title: 'The Missed Trade', quote: 'Missing the entry doesn’t give you permission to invent a new one.', xp: 85 },
          { n: 18, title: 'Done Means Done', quote: 'When your trading day is over, being done is the execution.', xp: 85 },
          { n: 19, title: 'The News You Already Knew About', quote: 'A scheduled event shouldn’t surprise you just because the candle did.', xp: 85 },
          { n: 20, title: 'The Rule You Keep Negotiating', quote: 'If a rule becomes optional when you’re emotional, it isn’t protecting you.', xp: 85 },
          { n: 21, title: 'When You Break One', quote: 'Journal what you’ll do when the trigger returns.', xp: 85 },
          { n: 22, title: 'Your Rulebook', quote: 'A letter from calm-you to emotional-you.', xp: 85 },
        ],
      welcome: {
        eyebrow: 'Phase 7 · Section 2 · Rules That Protect You 📕',
        heading: 'Your Rules Weren’t Written for the Disciplined You.',
        hook: 'You write rules while you’re calm so they protect you when you’re not.',
        learn: [
          { icon: 'doc', tone: 'purple', label: 'Rules written while calm' },
          { icon: 'stop', tone: 'pink', label: 'Leaving your stop alone' },
          { icon: 'lock', tone: 'teal', label: 'No-chase rules with no loopholes' },
          { icon: 'check', tone: 'peach', label: 'Building your rulebook' },
        ],
        paragraphs: [
          { text: '<span class="sec-welcome-quote">“I’m FOMOing.”</span> Great. The cursor is still hovering over BUY. <strong>Now what?</strong>' },
          { cls: 'sec-welcome-big', text: 'THEY WERE WRITTEN FOR THE VERSION OF YOU WHO DOESN’T FEEL DISCIPLINED.' },
          { text: 'Strategy → Account → Personal Rulebook → Execute or Pass. A trade isn’t allowable just because the setup is valid.' },
        ],
        goals: [
          'See why calm-you writes rules for emotional-you.',
          'Hold your rules when a setup almost qualifies.',
          'Leave your stop where you put it.',
          'Let a missed fill go, with a no-chase rule that has no loophole.',
          'Treat done as part of executing.',
          'Decide your news response before the session.',
          'Stop negotiating with your own rules.',
          'Turn a broken rule into an IF / THEN plan.',
          'Build MY AGHF RULEBOOK.',
        ],
        mission: 'What does your rulebook say?',
      },
      checkpoint: { title: 'Your Rulebook, Live 📕', xp: 0, firstStep: 'game', desc: 'Your rulebook in a live session + Knowledge Check + Check-In. Clear this to unlock Section 3.' } },
      { key: 's20', n: 20, badge: 'c', title: 'Reading the Environment 🌡️',
        dayliNote: 'A valid model doesn’t exist in a vacuum. The same I → C → C → retest can form in a clean trend, in heavy chop, two minutes before news or after the objective is already reached. Same model. Different environment.',
        lessons: [
          { n: 23, title: 'Same Model, Different Day', quote: 'Your model tells you what. The environment tells you whether.', xp: 85 },
          { n: 24, title: 'Clean Market: Participate', quote: 'Clean means understandable. Not flawless.', xp: 85 },
          { n: 25, title: 'Chop: Protect', quote: 'In choppy conditions, protecting the account is the position.', xp: 85 },
          { n: 26, title: 'Between Structure: Wait', quote: 'Between meaningful structure, waiting is the read.', xp: 85 },
          { n: 27, title: 'Almost Right: Do Nothing', quote: 'Technical validity doesn’t force participation.', xp: 85 },
          { n: 28, title: 'The Fast Market', quote: 'Volatility tells you how fast. Not where.', xp: 85 },
          { n: 29, title: 'Outside Your Window', quote: 'The market may be open. Your window can still be closed.', xp: 85 },
          { n: 30, title: 'The Morning You Had', quote: 'Don’t trade the morning you had. Trade the market in front of you now.', xp: 85 },
          { n: 31, title: 'Nothing Is a Position', quote: 'Nothing is a position.', xp: 85 },
        ],
      welcome: {
        eyebrow: 'Phase 7 · Section 3 · Reading the Environment 🌡️',
        heading: 'Your Model Tells You What. The Environment Tells You Whether.',
        hook: 'Your model tells you what to look for, and the market tells you whether today is the day.',
        learn: [
          { icon: 'up', tone: 'teal', label: 'Clean markets: participate' },
          { icon: 'shield', tone: 'pink', label: 'Choppy markets: protect' },
          { icon: 'clock', tone: 'purple', label: 'Between structure: wait' },
          { icon: 'target', tone: 'peach', label: 'When nothing is the right call' },
        ],
        paragraphs: [
          { text: 'RULEBOOK ✓ · RISK ✓ · SESSION ✓ · EMOTIONAL STATE: NEUTRAL. A perfect-looking ICC. <span class="sec-welcome-quote">“So I take it?”</span> Zoom out: messy 1H, competing PILs, a major objective right above, news in two minutes.' },
          { cls: 'sec-welcome-big', text: 'DON’T JUST ASK “IS IT VALID?” ASK “WHAT KIND OF ENVIRONMENT IS IT FORMING IN?”' },
          { text: 'Trader · Rulebook · Environment · Setup → TAKE · WAIT · PASS · SESSION OVER.' },
        ],
        goals: [
          'See the same setup in different markets.',
          'Participate when the market is clean.',
          'Protect in chop.',
          'Wait when price is stuck between structure.',
          'Do nothing when it’s only almost right.',
          'Read speed as speed, not direction.',
          'Keep your window closed when it’s closed.',
          'Trade the market in front of you, not your morning.',
          'Count nothing as a position.',
        ],
        mission: 'What is true right now?',
      },
      checkpoint: { title: 'Market Conditions Lab 🌡️ + Phase 7 Final', xp: 0, firstStep: 'game', desc: 'Market Conditions Lab + Knowledge Check + Check-In + the Phase 7 Final Gate. Clear this to complete Phase 7.' } },
    ],
  },
  {
    key: 'p8', n: 8, badge: 'd', title: "She's In Structure ✦", mode: 'desk', finalGate: 's22',
    sections: [
      { key: 's21', n: 21, badge: 'u', title: 'Real Trade Breakdown Lab 📊',
        dayliNote: 'Seven phases of learning. Now you apply it. Every trade gets reconstructed in the same order, and the outcome stays locked until your read is done.',
        lessons: [
          { n: 1, title: 'How to Break Down a Trade', quote: 'If your review starts with “I lost…”, you started at the wrong part of the trade.', xp: 100 },
          { n: 2, title: 'A Valid Winning Trade', quote: 'A winner is useful when you can explain why it deserved to be taken before it won.', xp: 100 },
          { n: 3, title: 'A Valid Losing Trade', quote: 'The stop getting hit does not rewrite the trade that existed before it.', xp: 100 },
          { n: 4, title: 'An Invalid Winning Trade', quote: 'A winner can still be a warning.', xp: 100 },
          { n: 5, title: 'Clean vs Messy Setups', quote: 'The goal isn’t to find ICC everywhere. It’s to know which ICC you actually want.', xp: 100 },
          { n: 6, title: 'Why I Passed This Trade', quote: 'Passing can be executing the rule that says: this one isn’t mine.', xp: 100 },
          { n: 7, title: 'The Missed Trade', quote: 'Don’t change the method just because hindsight gave you perfect vision.', xp: 100 },
          { n: 8, title: 'Right Analysis. Wrong Execution.', quote: 'Being right about the market doesn’t erase being wrong about the execution.', xp: 100 },
          { n: 9, title: 'Indicator vs No Indicator', quote: 'The indicator should make your process faster, not replace your eyes.', xp: 100 },
          { n: 10, title: 'Full Top-to-Bottom Breakdown', quote: 'You go first. Dayli reviews after.', xp: 100 },
        ],
      welcome: {
        eyebrow: 'Phase 8 · Section 1 · Real Trade Breakdown Lab 📊',
        heading: 'Stop Judging the Trade by the Ending.',
        hook: 'You break down every trade in order and grade the decision before you look at the outcome.',
        learn: [
          { icon: 'doc', tone: 'purple', label: 'A full trade breakdown' },
          { icon: 'check', tone: 'teal', label: 'Valid vs. quality trades' },
          { icon: 'swap', tone: 'pink', label: 'A pass vs. a miss' },
          { icon: 'eye', tone: 'peach', label: 'Chart before indicator' },
        ],
        paragraphs: [
          { text: 'CASE FILE · CHART WORKSPACE · BUILD YOUR READ · MAKE YOUR DECISION · REVEAL OUTCOME · REVIEW WITH DAYLI' },
          { cls: 'sec-welcome-big', text: 'BREAK DOWN THE WHOLE STORY.' },
          { text: 'What did I know before the trade? What did I do with it? What happened afterward? <strong>Did the outcome actually change the quality of my decision?</strong>' },
        ],
        goals: ['Break down a trade in order, outcome last.', 'Explain a winner without using the win.', 'Keep a valid loss valid.', 'Refuse the lesson a bad winner offers.', 'Separate validity from quality.', 'Grade a pass by what was known.', 'Tell a pass from a miss.', 'Grade analysis and execution separately.', 'Read the chart before the indicator.', 'Run a full independent breakdown.'],
        mission: 'Did the outcome change the decision?',
      },
      checkpoint: { title: 'Real Trade Breakdown Lab 📊', xp: 0, firstStep: 'game', desc: 'Ten case files + Knowledge Check + Check-In. Clear this to unlock Section 2.' } },
      { key: 's22', n: 22, badge: 'p', title: 'Practice Like a Pro 📈',
        dayliNote: 'Watching breakdowns builds understanding. Your own data builds evidence. This section teaches you the real tools: the Backtesting Lab, your journal, your dashboard, your reviews and your Trading Plan.',
        lessons: [
          { n: 11, title: 'What Backtesting Actually Is', quote: 'Don’t change the test because you don’t like the results so far.', xp: 100 },
          { n: 12, title: 'TradingView Replay', quote: 'Uncertainty is what you’re practicing.', xp: 100 },
          { n: 13, title: 'What Counts as One Backtest?', quote: 'A rep only helps if you know exactly what you’re repeating.', xp: 100 },
          { n: 14, title: 'Building a Real Sample', quote: 'Don’t make a permanent rule from a temporary streak.', xp: 100 },
          { n: 15, title: 'Screenshot Journaling', quote: 'The chart keeps the receipts.', xp: 100 },
          { n: 16, title: 'The AGHF Trade Journal', quote: 'The breakdown is the journal entry.', xp: 100 },
          { n: 17, title: 'Setup Quality vs Outcome', quote: 'Data without sample context can create false confidence.', xp: 100 },
          { n: 18, title: 'Rule Violation Tracking', quote: 'A pattern you can name is a pattern you can train.', xp: 100 },
          { n: 19, title: 'Performance Tracking', quote: 'Process on top. P&L underneath.', xp: 100 },
          { n: 20, title: 'Weekly Review', quote: 'Review to find the next adjustment.', xp: 100 },
          { n: 21, title: 'Monthly Review', quote: 'Test the change before you marry the change.', xp: 100 },
          { n: 22, title: 'Strategy Problem or Trader Problem?', quote: 'Don’t change the strategy to solve a behavior problem.', xp: 100 },
        ],
      welcome: {
        eyebrow: 'Phase 8 · Section 2 · Practice Like a Pro 📈',
        heading: 'Stop Guessing About Your Trading. Build Evidence.',
        hook: 'You build real evidence about your trading through practice, journaling and honest reviews.',
        learn: [
          { icon: 'clock', tone: 'purple', label: 'Replay with the future locked' },
          { icon: 'bars', tone: 'teal', label: 'Building a real sample' },
          { icon: 'doc', tone: 'pink', label: 'Fast, honest journaling' },
          { icon: 'flask', tone: 'peach', label: 'Strategy vs. trader problems' },
        ],
        paragraphs: [
          { text: 'LESSONS COMPLETED: 100+ · CASE STUDIES: COMPLETE · BADGES: many. <span class="sec-welcome-quote">“So… am I ready?”</span>' },
          { text: 'BACKTESTS: 0 · PERSONAL REPS: 0 · SCREENSHOT LIBRARY: EMPTY · WEEKLY REVIEWS: 0 · PERSONAL DATA: NOT ENOUGH YET' },
          { cls: 'sec-welcome-big', text: 'YOU’VE BUILT KNOWLEDGE. NOW BUILD EVIDENCE.' },
        ],
        goals: ['Tell a backtest from hindsight.', 'Practice with replay, future locked.', 'Know what one rep is.', 'Build a real sample.', 'Keep screenshot receipts.', 'Journal fast, without retyping.', 'Separate quality from outcome.', 'Name violation patterns.', 'Read performance process-first.', 'Run weekly and monthly reviews.', 'Diagnose strategy vs trader.', 'Build and lock your Trading Plan.'],
        mission: 'What does my evidence say?',
      },
      checkpoint: { title: 'Practice Like a Pro Lab 📈 + Trading Plan', xp: 0, firstStep: 'game', desc: 'The practicum, Knowledge Check, Check-In and your Trading Plan. Clear this to complete the curriculum.' } },
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
