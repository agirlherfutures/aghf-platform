/**
 * Lesson 16 intro video — "Candle Psychology" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-16',
  eyebrow: 'Phase 1 · Section 3 · Lesson 16',
  duration: 76,
  sources: 'Everything is pulled from Lesson 16\'s existing content (`agihf/lessons-data/p1-16.json`): "every candle is a buyer and seller battle," the push / reject / accept / fail framing, Dayli\'s "where it reacted, where it rejected, and where it closed" note, "wait for confirmation," the remember line, and the mission question. The intro shows the battle and the reaction, but leaves the "same wick at support" comparison for the lesson itself. The title-card quote is Lesson 16\'s curriculum quote.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Candle Psychology',
      quote: 'Push. Reject. Accept. Fail. Read what actually happened inside the candle.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Sixteen of A Girl & Her Futures.', screen: 'Aristella waves; title *Candle Psychology*' },
        { at: 3.8, text: 'Today we’re going inside the candle.' },
      ],
    },
    {
      type: 'candle-arena', start: 8, end: 30,
      beats: { push: 15.4, reject: 17.2, accept: 19.0, fail: 20.6 },
      kicker: 'Every candle is a battle',
      headlines: [
        { at: 8.4, out: 14.2, html: 'Buyers push up. <span class="mark">Sellers push down.</span>' },
        { at: 14.4, out: 21.8, html: 'Push. Reject. Accept. Fail.' },
        { at: 22.0, html: 'The close shows <span class="mark">who held control.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Every candle is a battle between buyers and sellers.', screen: 'A buyer and a seller beside a giant candle' },
        { at: 11.4, text: 'Buyers push price up. Sellers push it down.' },
        { at: 14.4, text: 'Inside one candle, price can push, get rejected, find acceptance, or fail.', screen: 'Inside the candle: Push! Reject! Accept! Fail!' },
        { at: 22.0, text: 'And the close shows who held control by the end.', screen: 'The candle shape is left behind' },
      ],
    },
    {
      type: 'host-hook', start: 30, end: 44, pointAt: 37.0, size: 64,
      kicker: 'The questions to ask',
      parts: [
        { at: 31.4, text: 'Not just: green or red?' },
        { at: 34.0, text: 'Where did it react? Where did it reject?' },
        { at: 37.0, html: '<span class="mark">Where did it close?</span>' },
      ],
      lines: [
        { at: 30.4, text: 'So stop asking just one question.', screen: 'Aristella thinks' },
        { at: 31.4, text: 'I’m not just asking if the candle is green or red.' },
        { at: 34.0, text: 'I’m asking where it reacted, where it rejected,' },
        { at: 37.0, text: 'and where it closed.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'wait-close', start: 44, end: 62,
      beats: { drop: 48.6, wait: 51.0, reveal: 54.4 },
      kicker: 'Wait for confirmation',
      headlines: [
        { at: 44.4, out: 53.6, html: 'Price tests a level…' },
        { at: 54.0, html: 'The close <span class="mark">confirms</span> whether it held or broke.' },
      ],
      lines: [
        { at: 44.4, text: 'And when price tests a level, wait for confirmation.', screen: 'A support plank' },
        { at: 48.6, text: 'Watch it dip into support, and fight its way back.', screen: 'Price drops through and bounces; an hourglass runs' },
        { at: 54.0, text: 'The close is what confirms whether that level actually held, or broke.', screen: '"Closed above: held"' },
      ],
    },
    {
      type: 'host-mission', start: 62, end: 76,
      kicker: 'Your mission',
      question: { at: 64.4, text: 'If two candles wick to nearly the same low at support, does that mean they end the same way?' },
      cta: { at: 71.6, text: 'Let’s find out' },
      lines: [
        { at: 62.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 64.4, text: 'If two candles wick to nearly the same low at support, does that mean they end the same way?', screen: 'Mission question' },
        { at: 71.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
