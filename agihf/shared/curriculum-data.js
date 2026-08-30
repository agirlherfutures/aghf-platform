/**
 * curriculum-data.js — A Girl & Her Futures™
 *
 * Single source of truth for the K-12 grade structure. Every page
 * (dashboard, lessons, games, yearbook) reads from this instead of
 * hardcoding the grade list.
 *
 * Usage: <script type="module"> import { GRADES, PHASES, gradeByKey } from '../shared/curriculum-data.js'; </script>
 */

export const PHASES = [
  { key: 'elementary', label: 'Phase I · Elementary', grades: ['k', '1', '2', '3', '4', '5'] },
  { key: 'middle', label: 'Phase II · Middle School', grades: ['6', '7', '8'] },
  { key: 'high', label: 'Phase III · High School', grades: ['9', '10', '11', '12'] },
];

// lessonSlugs preserves the original file's descriptive slug so lesson
// content JSON files can be named consistently (agihf/lessons-data/<key>-<n>.json).
export const GRADES = [
  { key: 'k', ordinal: 0, label: 'Kindergarten', shortLabel: 'K', title: 'Welcome to Trading',
    lessons: [
      { n: 1, slug: 'what-is-trading' },
      { n: 2, slug: 'why-markets-exist' },
      { n: 3, slug: 'buyers-vs-sellers' },
      { n: 4, slug: 'contracts-instruments' },
      { n: 5, slug: 'futures-vs-stocks' },
      { n: 6, slug: 'how-traders-get-paid' },
    ] },
  { key: '1', ordinal: 1, label: '1st Grade', shortLabel: '1st', title: 'Your Trading Classroom',
    lessons: [
      { n: 1, slug: 'tradingview-basics' },
      { n: 2, slug: 'brokers-prop-firms' },
      { n: 3, slug: 'orders-how-you-enter' },
      { n: 4, slug: 'stop-loss-take-profit' },
      { n: 5, slug: 'position-sizing' },
    ] },
  { key: '2', ordinal: 2, label: '2nd Grade', shortLabel: '2nd', title: 'Reading Candlesticks',
    lessons: [
      { n: 1, slug: 'candle-psychology' },
      { n: 2, slug: 'candle-anatomy' },
      { n: 3, slug: 'candle-psychology-2' },
    ] },
  { key: '3', ordinal: 3, label: '3rd Grade', shortLabel: '3rd', title: 'Market Structure', lessons: [] },
  { key: '4', ordinal: 4, label: '4th Grade', shortLabel: '4th', title: 'Breaks, Shifts & Protected Structure', lessons: [] },
  { key: '5', ordinal: 5, label: '5th Grade', shortLabel: '5th', title: 'Key Levels & Location', lessons: [] },
  { key: '6', ordinal: 6, label: '6th Grade', shortLabel: '6th', title: 'Liquidity', lessons: [] },
  { key: '7', ordinal: 7, label: '7th Grade', shortLabel: '7th', title: 'Price Delivery & Market Concepts', lessons: [] },
  { key: '8', ordinal: 8, label: '8th Grade', shortLabel: '8th', title: 'Multi-Timeframe Thinking',
    lessons: [
      { n: 1, slug: 'timeframes-perspective' },
      { n: 2, slug: 'timeframes' },
      { n: 3, slug: 'multi-timeframes' },
    ] },
  { key: '9', ordinal: 9, label: '9th Grade', shortLabel: '9th', title: 'Higher-Timeframe ICC', lessons: [] },
  { key: '10', ordinal: 10, label: '10th Grade', shortLabel: '10th', title: 'Top-Down Analysis', lessons: [] },
  { key: '11', ordinal: 11, label: '11th Grade', shortLabel: '11th', title: 'The Dayli ICC Method', lessons: [] },
  { key: '12', ordinal: 12, label: '12th Grade', shortLabel: '12th', title: 'Execution & Trader Independence', lessons: [] },
];

export function gradeByKey(key) {
  return GRADES.find((g) => g.key === String(key));
}

export function phaseForGrade(gradeKey) {
  return PHASES.find((p) => p.grades.includes(String(gradeKey)));
}

export function nextGrade(gradeKey) {
  const idx = GRADES.findIndex((g) => g.key === String(gradeKey));
  return idx >= 0 && idx < GRADES.length - 1 ? GRADES[idx + 1] : null;
}

// Grade state relative to a set of completed lesson IDs (format "<gradeKey>-<n>", e.g. "k-1").
// A grade with zero lessons defined is always 'locked' (no content yet) unless it is the
// learner's current grade by ordinal position, in which case callers may want a "coming soon" tone
// instead of a hard lock — computed by the caller since that depends on the "you are here" logic.
export function gradeStatus(grade, completedLessonIds) {
  if (grade.lessons.length === 0) return 'locked';
  const doneCount = grade.lessons.filter((l) => completedLessonIds.has(`${grade.key}-${l.n}`)).length;
  if (doneCount === grade.lessons.length) return 'done';
  if (doneCount > 0) return 'active';
  return 'locked';
}
