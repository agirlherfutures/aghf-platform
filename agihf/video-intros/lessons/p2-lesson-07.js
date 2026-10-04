/**
 * Phase 2 · Section 4 · Lesson 7 intro video — "Internal vs. External Structure"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-07',
  eyebrow: 'Phase 2 · Section 4 · Lesson 7',
  duration: 82,
  sources: 'From Section 4, Lesson 7 ("Internal vs. External Structure"): external structure as the room and its doors, internal structure as the furniture, internal structure changing while price stays inside the external range, and Dayli\'s "one little lower low doesn\'t automatically mean the entire higher-timeframe story changed."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'Internal vs. External Structure',
      quote: 'Structure exists inside structure.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Seven of How Markets Move.', screen: 'Aristella waves; title *Internal vs. External Structure*' },
        { at: 3.6, text: 'Here’s a big one: structure exists inside structure.' },
      ],
    },
    {
      type: 'the-room', start: 8, end: 34, beats: { room: 9.6, furn: 17.0, price: 24.2, still: 30.0 },
      kicker: 'Read the room',
      headlines: [
        { at: 8.4, out: 16.8, html: 'External structure is <span class="mark">the room.</span>' },
        { at: 17.0, out: 24.0, html: 'Internal structure is <span class="mark">the furniture.</span>' },
        { at: 24.2, html: 'The furniture moved. <span class="mark">The room didn’t.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'External structure is the larger swing boundaries defining the range you’re analyzing. Think of it as the room.', screen: 'A room appears' },
        { at: 13.0, text: 'The external high and the external low are the doors.', screen: 'EXTERNAL HIGH / EXTERNAL LOW doors' },
        { at: 17.0, text: 'Internal structure is the smaller swings developing inside those boundaries. Furniture. Pictures. Mirrors. Tables.', screen: 'Furniture fills the room' },
        { at: 24.2, text: 'Things can change inside the room, while you’re still inside the room.', screen: 'Price steps lower inside: LH, LL' },
      ],
    },
    {
      type: 'room-chart', start: 34, end: 58, beats: { ext: 35.6, int: 41.8, both: 49.0 },
      kicker: 'Now on a chart',
      headlines: [
        { at: 34.4, out: 48.8, html: 'Two scales. <span class="mark">One chart.</span>' },
        { at: 49.0, html: 'Can both be true? <span class="mark">Yes.</span>' },
      ],
      lines: [
        { at: 34.4, text: 'Here’s the same idea on a chart.', screen: 'A chart builds' },
        { at: 35.6, text: 'The external structure: a higher low, then a higher high. The room is bullish.', screen: 'Purple external swings + doors' },
        { at: 41.8, text: 'Inside it, the smaller swings start making lower highs and lower lows.', screen: 'Pink internal LH / LL' },
        { at: 49.0, text: 'Internal structure is bearish, while price is still inside the larger external range. Both are true.', screen: 'EXTERNAL: BULLISH ✓ / INTERNAL: BEARISH' },
      ],
    },
    {
      type: 'host-hook', start: 58, end: 69, pointAt: 62.0, size: 62,
      kicker: 'Dayli says',
      parts: [
        { at: 59.0, text: 'One little lower low doesn’t automatically mean' },
        { at: 62.0, html: 'the <span class="mark">entire story changed.</span>' },
      ],
      lines: [
        { at: 58.4, text: 'So remember this.', screen: 'Aristella thinks' },
        { at: 59.0, text: 'One little lower low doesn’t automatically mean the entire higher-timeframe story changed.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 69, end: 82,
      kicker: 'Your mission',
      question: { at: 71.0, text: 'If smaller swings turn bearish while price stays inside a larger range, has the bigger story changed?' },
      cta: { at: 78.4, text: 'Let’s find out' },
      lines: [
        { at: 69.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 71.0, text: 'If smaller swings turn bearish while price stays inside a larger range, has the bigger story changed?', screen: 'Mission question' },
        { at: 78.4, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
