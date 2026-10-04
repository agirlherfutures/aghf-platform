/**
 * Lesson 11 intro video — "Position Sizing" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-11',
  eyebrow: 'Phase 1 · Section 2 · Lesson 11',
  duration: 87,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'Position Sizing',
      quote: 'Risk only what you can afford to lose. Size your position, not your ego.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Eleven of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: position sizing, and why it changes everything.' },
      ],
    },
    {
      type: 'backpacks', start: 8, end: 30, light: 20.8, heavy: 25.0,
      kicker: 'The chart doesn’t know your size. You will.',
      headlines: [
        { at: 8.4, out: 16.4, html: 'Risk only what you <span class="mark">can afford to lose.</span>' },
        { at: 16.6, html: 'Too much size makes a trade <span class="mark">emotionally heavy.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Risk only what you can afford to lose.' },
        { at: 10.8, text: 'Size your position, not your ego.' },
        { at: 13.0, text: 'Your entry can be clean, and your stop can be right.' },
        { at: 16.6, text: 'But if your size is too big, the trade gets emotionally heavy.' },
        { at: 20.8, text: 'Same ten-point stop. One contract risks twenty dollars.' },
        { at: 25.0, text: 'Ten contracts? Two hundred.' },
      ],
    },
    {
      type: 'size-dial', start: 30, end: 48,
      kicker: 'Here’s a trap',
      beats: { l1: 32.0, d1: 34.0, l2: 37.4, d2: 38.4, stamp: 40.0 },
      headlines: [
        { at: 32.0, out: 39.8, html: 'Lose… then <span class="mark">double up</span> to win it back?' },
        { at: 40.0, html: 'That’s emotion talking, <span class="mark">not a risk plan.</span>' },
      ],
      lines: [
        { at: 30.4, text: 'Here’s a trap.' },
        { at: 32.0, text: 'After a loss, a trader doubles her next size, to win it back faster.' },
        { at: 37.4, text: 'Lose again? Double again.' },
        { at: 40.0, text: 'That’s not a risk plan. That’s emotion talking.' },
        { at: 44.0, text: 'Same goes for sizing up just because you feel confident.' },
      ],
    },
    {
      type: 'same-size', start: 48, end: 60, ruleAt: 55.8,
      kicker: 'Where sizing comes from',
      headlines: [
        { at: 48.4, html: 'Decided the same way, <span class="mark">every time.</span>' },
      ],
      lines: [
        { at: 48.4, text: 'Your contract size should be decided the same way, every time.' },
        { at: 52.8, text: 'Good day, bad day, confident or nervous.' },
        { at: 55.8, text: 'Same rule. Same size.' },
      ],
    },
    {
      type: 'host-hook', start: 60, end: 71, pointAt: 66.2, size: 66,
      kicker: 'Remember this',
      parts: [
        { at: 61.6, text: 'Bigger size doesn’t make a setup better.' },
        { at: 66.2, html: '<span class="mark">Size your position, not your ego.</span>' },
      ],
      lines: [
        { at: 60.4, text: 'Here’s what to remember.' },
        { at: 61.6, text: 'Bigger size doesn’t make a setup better. It just multiplies what’s already there.' },
        { at: 66.2, text: 'Size your position, not your ego.' },
      ],
    },
    {
      type: 'host-mission', start: 71, end: 87,
      kicker: 'Your mission',
      question: { at: 73.4, text: 'Two traders take the identical setup: one with 1 contract, one with 10. Is one trade objectively better structured?' },
      cta: { at: 83.0, text: 'Let’s find out' },
      lines: [
        { at: 71.4, text: 'So here’s your mission for this lesson.' },
        { at: 73.4, text: 'If two traders take the identical setup, but one uses 1 contract and the other uses 10, is one trade objectively better structured?' },
        { at: 83.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
