/**
 * Lesson 6 intro video — "Points, Ticks & P&L" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-06',
  eyebrow: 'Phase 1 · Section 1 · Lesson 6',
  duration: 92,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Points, Ticks & P&L',
      quote: 'MNQ = $2 per point. MGC = $10 per point. Know your numbers before you trade.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Six of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today we’re learning points, ticks, and P and L.' },
      ],
    },
    {
      type: 'ruler-zoom', start: 8, end: 31,
      kicker: 'How the numbers work',
      pointAt: 16.4, tickAt: 20.4, sumAt: 26.0,
      headlines: [
        { at: 8.4, out: 14.0, html: 'First, understand <span class="mark">how the numbers work.</span>' },
        { at: 14.2, out: 20.2, html: 'A <span class="mark">point</span> is a whole-number move.' },
        { at: 20.4, html: 'A <span class="mark">tick</span> is the smallest step inside it.' },
      ],
      lines: [
        { at: 8.4, text: 'Before you worry about making money, you need to understand how the numbers work.' },
        { at: 14.2, text: 'A point is a whole-number move. On MNQ, twenty thousand to twenty thousand and one is one point.' },
        { at: 20.4, text: 'A tick is the smallest step inside it. On MNQ, a tick is a quarter point, worth fifty cents.' },
        { at: 26.0, text: 'Four ticks make a point: two dollars per contract.' },
      ],
    },
    {
      type: 'formula', start: 31, end: 52,
      kicker: 'The P&L formula',
      beats: { parts: 34.4, result: 38.6, three: 42.6 },
      headlines: [
        { at: 31.4, out: 46.4, html: 'Points × point value × contracts' },
        { at: 46.6, html: 'Same move. <span class="mark">Different size, different P&amp;L.</span>' },
      ],
      lines: [
        { at: 31.4, text: 'Here’s the formula. Same one, every time.' },
        { at: 34.4, text: 'Points moved, times point value, times contracts.' },
        { at: 38.6, text: 'Thirty points on one MNQ contract? Sixty dollars.' },
        { at: 42.6, text: 'Same thirty points on three contracts? One hundred eighty.' },
        { at: 46.6, text: 'Same chart. Same move. Different size, different P and L.' },
      ],
    },
    {
      type: 'mirror', start: 52, end: 66,
      kicker: 'Wins and losses',
      beats: { win: 52.8, short: 55.0, loss: 57.4 },
      headlines: [
        { at: 52.4, out: 57.2, html: 'The formula doesn’t care about direction.' },
        { at: 57.4, html: 'A loss scales <span class="mark">exactly like a gain.</span>' },
      ],
      lines: [
        { at: 52.4, text: 'And the formula doesn’t care about direction.' },
        { at: 55.0, text: 'Shorts work the same way.' },
        { at: 57.4, text: 'And a loss scales exactly the same way a gain does.' },
        { at: 61.0, text: 'Thirty points against you on three contracts is minus one eighty.' },
      ],
    },
    {
      type: 'host-hook', start: 66, end: 78, pointAt: 73.4, size: 62,
      kicker: 'Remember this',
      parts: [
        { at: 67.8, text: 'Points describe movement.' },
        { at: 70.4, text: 'Point value × contracts = dollars.' },
        { at: 73.4, html: 'Never discuss risk in <span class="mark">points alone.</span>' },
      ],
      lines: [
        { at: 66.4, text: 'Here’s what to remember.' },
        { at: 67.8, text: 'Points describe price movement.' },
        { at: 70.4, text: 'Point value and contracts decide the dollars.' },
        { at: 73.4, text: 'So never discuss risk in points alone.' },
      ],
    },
    {
      type: 'host-mission', start: 78, end: 92,
      kicker: 'Your mission',
      question: { at: 80.4, text: 'If someone says they made “50 points today,” do you actually know how much money that is?' },
      cta: { at: 88.0, text: 'Let’s find out' },
      lines: [
        { at: 78.4, text: 'So here’s your mission for this lesson.' },
        { at: 80.4, text: 'If someone tells you they made fifty points today, do you actually know how much money that is?' },
        { at: 88.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
