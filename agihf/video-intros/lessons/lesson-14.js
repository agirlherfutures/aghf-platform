/**
 * Lesson 14 intro video — "Candle Anatomy" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 * Each line's `screen` feeds the generated script (make-script.cjs).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-14',
  eyebrow: 'Phase 1 · Section 3 · Lesson 14',
  duration: 79,
  sources: 'Everything is pulled from Lesson 14\'s existing content (`agihf/lessons-data/p1-14.json`): the hook, the full anatomy of one candle (open, close, high, low, body, wick), the "read it in order" flow, Dayli\'s "a wick shows me where price went, a close shows me where price accepted" note, and the mission question. The title-card quote is Lesson 14\'s curriculum quote.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Candle Anatomy',
      quote: 'Body, wicks, open, close. Know every part before you read a single chart.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Fourteen of A Girl & Her Futures.', screen: 'Aristella waves; title *Candle Anatomy*' },
        { at: 3.8, text: 'Today we’re taking one candle apart, piece by piece.' },
      ],
    },
    {
      type: 'anatomy', start: 8, end: 35, formAt: 13.6,
      labels: { open: 19.0, close: 21.4, range: 25.0, body: 28.4, wick: 31.0 },
      kicker: 'The full anatomy of one candle',
      headlines: [
        { at: 8.4, out: 18.8, html: 'Know every part <span class="mark">before you read a chart.</span>' },
        { at: 19.0, html: 'Open, close, high, low, <span class="mark">body, wick.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Body, wicks, open, close.', screen: 'Empty chart card' },
        { at: 10.6, text: 'Know every part before you read a single chart.' },
        { at: 13.6, text: 'Let’s build one candle.', screen: 'A candle forms live from the moving price' },
        { at: 19.0, text: 'Open is where it started. Close is where it ended, and that’s the one that matters most.', screen: '"Open" and "Close" tags' },
        { at: 25.0, text: 'High and low mark the full range.', screen: '"High" and "Low" tags' },
        { at: 28.4, text: 'The body is the distance from open to close. The wick is everywhere price reached, but didn’t close.', screen: '"Body" and "Wick" tags' },
      ],
    },
    {
      type: 'participants', start: 35, end: 54,
      kicker: 'Read it in order', title: 'Body, then wicks, then the close',
      items: [
        { at: 38.6, kind: 'body', label: 'Body', desc: ['How decisive', 'was the move?'], color: 'teal' },
        { at: 42.4, kind: 'wicks', label: 'Wicks', desc: ['Where did price', 'travel?'], color: 'purple' },
        { at: 46.4, kind: 'close', label: 'Close', desc: ['Where did price', 'accept?'], color: 'pink' },
      ],
      lines: [
        { at: 35.4, text: 'When you read a candle, go in order.', screen: '"Body, then wicks, then the close"' },
        { at: 38.6, text: 'First the body: how decisive was the move?', screen: 'Body card' },
        { at: 42.4, text: 'Then the wicks: where did price travel?', screen: 'Wicks card' },
        { at: 46.4, text: 'Then respect the close: where did price actually accept?', screen: 'Close card' },
      ],
    },
    {
      type: 'host-hook', start: 54, end: 66, pointAt: 59.6, size: 64,
      kicker: 'Remember this',
      parts: [
        { at: 55.6, text: 'A wick shows me where price went.' },
        { at: 59.6, html: 'A close shows me <span class="mark">where price accepted.</span>' },
      ],
      lines: [
        { at: 54.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 55.6, text: 'A wick shows me where price went.' },
        { at: 59.6, text: 'A close shows me where price accepted.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 66, end: 79,
      kicker: 'Your mission',
      question: { at: 68.4, text: 'Which part of a candle actually shows what price accepted: the wick, or the close?' },
      cta: { at: 74.4, text: 'Let’s find out' },
      lines: [
        { at: 66.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 68.4, text: 'Which part of a candle actually shows what price accepted: the wick, or the close?', screen: 'Mission question' },
        { at: 74.4, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
