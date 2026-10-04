/**
 * Lesson 3 intro video — "Buyers vs Sellers" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-03',
  eyebrow: 'Phase 1 · Section 1 · Lesson 3',
  duration: 84,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Buyers vs Sellers',
      quote: 'Price moves based on who’s stronger. Read it like a story, not a guess.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Three of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today it’s buyers versus sellers: who’s really moving price?' },
      ],
    },
    {
      type: 'push-candle', start: 8, end: 19,
      kicker: 'Get this the right way around', lineA: 11.2, rewindAt: 14.4,
      lines: [
        { at: 8.4, text: 'Here’s something most new traders get backwards.' },
        { at: 11.2, text: 'Price isn’t moving because your candle turned green.' },
        { at: 14.4, text: 'The candle turned green because price moved.' },
      ],
    },
    {
      type: 'stairs', start: 19, end: 40,
      kicker: 'Who’s pushing?',
      buyer: { at: 21.6, end: 28.0 },
      seller: { at: 29.4, end: 35.8 },
      headlines: [
        { at: 21.6, out: 29.0, html: 'Aggressive buyers pay <span class="mark">higher and higher</span> prices.' },
        { at: 29.4, html: 'Aggressive sellers accept <span class="mark">lower and lower</span> prices.' },
      ],
      lines: [
        { at: 19.4, text: 'So what actually moves price?' },
        { at: 21.6, text: 'When buyers get aggressive, they’re willing to pay higher and higher prices.' },
        { at: 26.8, text: 'That’s what pushes price up.' },
        { at: 29.4, text: 'When sellers get aggressive, they’ll accept lower and lower prices.' },
        { at: 34.4, text: 'And that’s what pushes price down.' },
      ],
    },
    {
      type: 'pullback', start: 40, end: 59,
      kicker: 'The one-candle trap',
      beats: { red: 42.4, ask: 45.6, resume: 48.8, brk: 53.4 },
      headlines: [
        { at: 42.4, out: 48.6, html: 'One red candle after a string of greens…' },
        { at: 48.8, out: 53.2, html: 'A pullback inside an uptrend is <span class="mark">still an uptrend.</span>' },
        { at: 53.4, html: 'A real shift <span class="mark">breaks the pattern.</span>' },
      ],
      lines: [
        { at: 40.4, text: 'Now, here’s the trap.' },
        { at: 42.4, text: 'One red candle after a string of green ones.' },
        { at: 45.6, text: 'Does that mean sellers are suddenly in control?' },
        { at: 48.8, text: 'Not necessarily. A small pullback inside an uptrend is still an uptrend.' },
        { at: 53.4, text: 'A real shift is when price actually breaks the pattern.' },
      ],
    },
    {
      type: 'host-hook', start: 59, end: 70, pointAt: 64.0,
      kicker: 'Remember this',
      parts: [
        { at: 61.0, text: 'Don’t ask what one candle means by itself.' },
        { at: 64.0, html: 'Ask what it’s doing <span class="mark">within structure.</span>' },
      ],
      lines: [
        { at: 59.4, text: 'Here’s what to remember.' },
        { at: 61.0, text: 'Don’t ask what one candle means by itself.' },
        { at: 64.0, text: 'Later, you’ll learn to ask what it’s doing within structure.' },
      ],
    },
    {
      type: 'host-mission', start: 70, end: 84,
      kicker: 'Your mission',
      question: { at: 72.4, text: 'Does one red candle after a string of green candles mean sellers are in control?' },
      cta: { at: 79.6, text: 'Let’s find out' },
      lines: [
        { at: 70.4, text: 'So here’s your mission for this lesson.' },
        { at: 72.4, text: 'Does one red candle after a string of green candles automatically mean sellers are in control?' },
        { at: 79.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
