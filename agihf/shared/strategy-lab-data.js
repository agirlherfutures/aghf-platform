/**
 * strategy-lab-data.js — A Girl & Her Futures™
 * AGHF Strategy Lab: Supply & Demand, Powered by Higher-Timeframe ICC™.
 * Optional. Unlocks after Phase 5. Not part of the 8 phases or 22 sections,
 * and never counts toward graduation.
 *
 * Lesson titles are the proposed titles from strategy-lab/BRIEF.md (the
 * original titles were not recovered). Each lesson's data lives in
 * lessons-data/sl-<id>.json.
 */
export const STRATEGY_LAB = {
  title: 'AGHF Strategy Lab',
  subtitle: 'Supply & Demand, Powered by Higher-Timeframe ICC™',
  modules: [
    { key: 'm1', n: 1, title: 'Understanding the Strategy', lessons: [
      { id: 'm1-1', title: 'Supply & Demand Through the ICC Lens' },
      { id: 'm1-2', title: 'The 4H: Establish the Story' },
      { id: 'm1-3', title: 'The 1H: Find the Relevant Structure' },
      { id: 'm1-4', title: 'The 15M: First Directional Break' },
      { id: 'm1-5', title: 'The 5M: Correction #1' },
      { id: 'm1-6', title: 'The 5M: BOS #2' },
      { id: 'm1-7', title: 'Correction #2: Where Zones Begin' },
      { id: 'm1-8', title: 'Identifying the Zone-Forming Candle' },
      { id: 'm1-9', title: 'Supply vs. Demand' },
      { id: 'm1-10', title: 'Bringing the Full Sequence Together' },
    ] },
    { key: 'm2', n: 2, title: 'Applying the Strategy', lessons: [
      { id: 'm2-1', title: 'The Three-BOS Execution Sequence' },
      { id: 'm2-2', title: 'Recognizing the First Correction' },
      { id: 'm2-3', title: 'Recognizing the Second Correction' },
      { id: 'm2-4', title: 'BOS #3: Activating the Zone' },
      { id: 'm2-5', title: 'Waiting for the Retest' },
      { id: 'm2-6', title: 'Executing Bullish Demand' },
      { id: 'm2-7', title: 'Executing Bearish Supply' },
      { id: 'm2-8', title: 'Recognizing Invalid Setups' },
      { id: 'm2-9', title: 'Missed Trades and No-Trade Decisions' },
      { id: 'm2-10', title: 'Full Strategy Walkthrough' },
    ] },
  ],
  tools: [
    { key: 'zone', id: 'zone-builder', title: 'Zone Builder', line: 'Find the zone-forming candle, set its boundaries, and decide whether the zone is potential, active or invalid.' },
    { key: 'exec', id: 'execution-lab', title: 'Execution Lab', line: 'Candle by candle, from the higher-timeframe context to the entry or no-trade decision.' },
  ],
};

export const allLabLessons = () => STRATEGY_LAB.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })));
