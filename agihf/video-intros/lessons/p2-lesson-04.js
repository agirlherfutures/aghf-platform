/**
 * Phase 2 · Section 4 · Lesson 4 intro video — "Bullish Structure"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-04',
  eyebrow: 'Phase 2 · Section 4 · Lesson 4',
  duration: 67,
  sources: 'From Section 4, Lesson 4 ("Bullish Structure"): HL → HH → HL → HH, "bullish structure doesn\'t mean every candle is bullish," push + pullback, Dayli\'s red-candles note, and the lock-in question.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'Bullish Structure',
      quote: 'Higher highs + higher lows show upward structural progression.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Four of How Markets Move.', screen: 'Aristella waves; title *Bullish Structure*' },
        { at: 3.6, text: 'Today we put the labels together: bullish structure.' },
      ],
    },
    {
      type: 'ridge-hike', start: 8, end: 40, beats: { hike: 11.0, dur: 20 },
      kicker: 'The climb',
      headlines: [
        { at: 8.4, out: 22.4, html: 'Higher highs. <span class="mark">Higher lows.</span>' },
        { at: 22.6, html: 'Red candles on the way up? <span class="mark">Part of the climb.</span>', size: 52 },
      ],
      lines: [
        { at: 8.4, text: 'In basic bullish structure, price generally creates higher highs and higher lows.', screen: 'A hiker starts up a ridge' },
        { at: 13.6, text: 'Push up to a new high. Plant a flag.', screen: 'HH flags at each peak' },
        { at: 16.8, text: 'Pull back a little. Rest. Then climb to the next high.', screen: 'HL ☕ rest stops' },
        { at: 22.6, text: 'But bullish structure doesn’t mean every candle is bullish.', screen: 'Red candles on the downhill bits' },
        { at: 27.0, text: 'There will be red candles. There will be pullbacks. There will be corrections.' },
        { at: 32.6, text: 'That’s how price moves. Push, pullback, next push.', screen: 'The hiker reaches the top' },
      ],
    },
    {
      type: 'host-hook', start: 40, end: 53, pointAt: 46.8, size: 62,
      kicker: 'Dayli says',
      parts: [
        { at: 41.6, text: 'Red candles inside bullish structure aren’t automatically bearish.' },
        { at: 46.8, html: 'Ask what the pullback is doing <span class="mark">inside the larger structure.</span>' },
      ],
      lines: [
        { at: 40.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 41.6, text: 'Red candles inside bullish structure aren’t automatically bearish.' },
        { at: 46.8, text: 'Ask what the pullback is doing inside the larger structure.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 53, end: 67,
      kicker: 'Your mission',
      question: { at: 55.4, text: 'Price makes HH, HL, HH, then starts moving lower. Has bullish structure automatically reversed?' },
      cta: { at: 62.8, text: 'Let’s find out' },
      lines: [
        { at: 53.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 55.4, text: 'Price makes a higher high, a higher low, another higher high, then starts moving lower. Has bullish structure automatically reversed?', screen: 'Mission question' },
        { at: 62.8, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
