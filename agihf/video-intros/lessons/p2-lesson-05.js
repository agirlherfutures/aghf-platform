/**
 * Phase 2 · Section 4 · Lesson 5 intro video — "Bearish Structure"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-05',
  eyebrow: 'Phase 2 · Section 4 · Lesson 5',
  duration: 64,
  sources: 'From Section 4, Lesson 5 ("Bearish Structure"): LH → LL → LH → LL, push, correction, continuation, "green candles inside bearish structure do not automatically make the market bullish," Dayli\'s "stop letting candle color override structure," and the three-bullish-candles mistake.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'Bearish Structure',
      quote: 'Lower lows + lower highs show downward structural progression.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Five of How Markets Move.', screen: 'Aristella waves; title *Bearish Structure*' },
        { at: 3.6, text: 'Now the mirror image: bearish structure.' },
      ],
    },
    {
      type: 'bounce-down', start: 8, end: 40, beats: { drop: 11.0, dur: 16, green: 29.0 },
      kicker: 'Down the stairs',
      headlines: [
        { at: 8.4, out: 28.8, html: 'Lower highs. <span class="mark">Lower lows.</span>' },
        { at: 29.0, html: 'Green bounces <span class="mark">don’t flip the trend.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'In basic bearish structure, price creates lower highs and lower lows.', screen: 'A ball drops onto descending platforms' },
        { at: 13.6, text: 'Price pushes down to a lower low.', screen: 'LL at each landing' },
        { at: 17.0, text: 'It corrects upward, a bounce. But the bounce tops out lower than the last one.', screen: 'LH at each bounce peak' },
        { at: 22.6, text: 'Then it continues down. Push, correction, continuation.' },
        { at: 29.0, text: 'Those bounces are the green candles. They’re real. But they don’t automatically make the market bullish.', screen: '"bounces = green candles"' },
      ],
    },
    {
      type: 'host-hook', start: 40, end: 50, pointAt: 44.6, size: 70,
      kicker: 'Dayli says',
      parts: [
        { at: 41.4, text: 'Stop letting candle color' },
        { at: 44.6, html: '<span class="mark">override structure.</span> 🔥' },
      ],
      lines: [
        { at: 40.4, text: 'So here’s the line I want you to keep.', screen: 'Aristella thinks' },
        { at: 42.6, text: 'Stop letting candle color override structure.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 50, end: 64,
      kicker: 'Your mission',
      question: { at: 52.4, text: 'After LL, LH, LL, three bullish candles form. Is the trend bullish now?' },
      cta: { at: 59.6, text: 'Let’s find out' },
      lines: [
        { at: 50.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 52.4, text: 'Price makes a lower low, a lower high, another lower low. Then three bullish candles form. Is the trend bullish now?', screen: 'Mission question' },
        { at: 59.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
