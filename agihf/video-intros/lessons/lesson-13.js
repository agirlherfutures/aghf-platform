/**
 * Lesson 13 intro video — "Candlesticks" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-13',
  eyebrow: 'Phase 1 · Section 3 · Lesson 13',
  duration: 83,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Candlesticks',
      quote: 'Every candle is a decision. Green means buyers won. Red means sellers won.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Thirteen of A Girl & Her Futures.' },
        { at: 3.8, text: 'Section Three starts now: candles and timeframes.' },
      ],
    },
    {
      type: 'candle-forms', start: 8, end: 30, formAt: 21.0,
      kicker: 'Every candle is a decision',
      headlines: [
        { at: 8.4, out: 13.6, html: 'Green: buyers won. <span class="mark">Red: sellers won.</span>' },
        { at: 13.8, out: 20.8, html: 'One period. Open, high, low, <span class="mark">close.</span>' },
        { at: 21.0, html: 'Watch one form. <span class="mark">The close decides.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Every candle is a decision.' },
        { at: 10.4, text: 'Green means buyers won. Red means sellers won.' },
        { at: 13.8, text: 'Each candle records one period of time: where price opened, how high and low it went, and where it closed.' },
        { at: 21.0, text: 'Watch one form. Buyers push, sellers push back…' },
        { at: 25.0, text: 'and the close tells you who won.' },
      ],
    },
    {
      type: 'two-stories', start: 30, end: 50, bigAt: 32.6, fightAt: 38.0,
      kicker: 'Two candles, two stories',
      headlines: [
        { at: 30.4, out: 43.4, html: 'Color is only <span class="mark">part of the story.</span>' },
        { at: 43.6, html: 'Body size and wick length <span class="mark">both carry information.</span>' },
      ],
      lines: [
        { at: 30.4, text: 'But color is only part of the story.' },
        { at: 32.6, text: 'A big body means price traveled far in one direction. A decisive win.' },
        { at: 38.0, text: 'A small body with long wicks? A real fight, and nobody settled it.' },
        { at: 43.6, text: 'Body size and wick length both carry information.' },
      ],
    },
    {
      type: 'color-rule', start: 50, end: 60, greenAt: 52.4, redAt: 55.6,
      kicker: 'One rule to lock in',
      headlines: [
        { at: 50.4, html: 'Color = <span class="mark">close vs. open.</span>' },
      ],
      lines: [
        { at: 50.4, text: 'And here’s the one rule to lock in.' },
        { at: 52.4, text: 'If it closes above where it opened, it’s green.' },
        { at: 55.6, text: 'Close below the open? Red.' },
      ],
    },
    {
      type: 'host-hook', start: 60, end: 71, pointAt: 66.4, size: 62,
      kicker: 'Remember this',
      parts: [
        { at: 61.6, text: 'Who pushed. Who rejected.' },
        { at: 63.8, text: 'Who held. Where price accepted.' },
        { at: 66.4, html: '<span class="mark">Read the whole shape,</span> not just the color.' },
      ],
      lines: [
        { at: 60.4, text: 'Here’s what to remember.' },
        { at: 61.6, text: 'Candles show who pushed, who rejected, who held, and where price accepted.' },
        { at: 66.4, text: 'Read the whole shape, not just the color.' },
      ],
    },
    {
      type: 'host-mission', start: 71, end: 83,
      kicker: 'Your mission',
      question: { at: 73.4, text: 'Does a long lower wick automatically mean the market is about to reverse upward?' },
      cta: { at: 78.6, text: 'Let’s find out' },
      lines: [
        { at: 71.4, text: 'So here’s your mission for this lesson.' },
        { at: 73.4, text: 'Does a long lower wick automatically mean the market is about to reverse upward?' },
        { at: 78.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
