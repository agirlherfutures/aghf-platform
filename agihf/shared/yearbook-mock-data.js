/**
 * yearbook-mock-data.js — A Girl & Her Futures™
 *
 * Placeholder yearbook entries so the full Yearbook UI can be built and
 * demoed now, per the rebuild plan's decision to defer real persistence
 * (reflections/ratings aren't saved anywhere yet — this is mock data).
 */
export const ENTRY_DATA = {
  k: { grade: 'k', label: 'Kindergarten', title: 'Welcome to Trading', stars: 4, status: 'done',
    answer: "I didn't realize how much I didn't know — I thought trading was just guessing." },
  '1': { grade: '1', label: '1st Grade', title: 'Your Trading Classroom', stars: 4, status: 'done',
    answer: 'Setting up my charts and watchlist properly made everything feel more real.' },
  '2': { grade: '2', label: '2nd Grade', title: 'Reading Candlesticks', stars: 5, status: 'done',
    answer: 'Context over individual candles finally clicked today.' },
  '3': { grade: '3', label: '3rd Grade', title: 'Market Structure', stars: 3, status: 'done',
    answer: "Marking HH/HL on a blank chart was harder than I expected, but it's sinking in." },
  '4': { grade: '4', label: '4th Grade', title: 'Breaks, Shifts & Protected Structure', stars: 4, status: 'done',
    answer: 'Learning the difference between a wick break and a candle-close break changed how I read charts.' },
  '5': { grade: '5', label: '5th Grade', title: 'Key Levels & Location', stars: 4, status: 'done',
    answer: 'Premium and discount finally gave me a way to describe where price actually is.' },
  '6': { grade: '6', label: '6th Grade', title: 'Liquidity', stars: 4, status: 'done',
    answer: "I finally understand why price sweeps a level before actually reversing. It's not random — it's traders getting trapped." },
  '7': { grade: '7', label: '7th Grade', title: 'Price Delivery & Market Concepts', stars: 3, status: 'current',
    answer: "FVGs make sense now, but I like that they're not required for my entries." },
  '8': { grade: '8', label: '8th Grade', title: 'Multi-Timeframe Thinking', status: 'locked' },
  '9': { grade: '9', label: '9th Grade', title: 'Higher-Timeframe ICC', status: 'locked' },
  '10': { grade: '10', label: '10th Grade', title: 'Top-Down Analysis', status: 'locked' },
  '11': { grade: '11', label: '11th Grade', title: "The Dayli ICC Method™", status: 'locked' },
  '12': { grade: '12', label: '12th Grade', title: 'Execution & Trader Independence', status: 'locked' },
};

export const PORTFOLIO_ITEMS = [
  { grade: '3rd Grade — Chart Lab', desc: 'Marked HH→HL→HH→HL and LL→LH→LL→LH on a blank chart' },
  { grade: '5th Grade — Elementary Exam', desc: 'Identified trend, structure, swings, trading range, key levels, location' },
  { grade: '8th Grade — Middle School Final', desc: 'Read a naked 4H/1H chart: where we are, where we came from, invalidation' },
  { grade: '10th Grade — Top-Down Analysis Card', desc: '4H story, 1H structure, HTF ICC, relevant swing, PIL, liquidity context' },
  { grade: '11th Grade — Dayli ICC Drills', desc: 'Identified PIL, Indication, Correction, Continuation and Retest across live sequences' },
];
