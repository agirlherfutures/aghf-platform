/**
 * Lesson 9 intro video — "Order Types" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-09',
  eyebrow: 'Phase 1 · Section 2 · Lesson 9',
  duration: 92,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'Order Types',
      quote: 'Market. Limit. Stop. Know all three before you know which one you’ll actually use.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Nine of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: the three order types every trader needs to know.' },
      ],
    },
    {
      type: 'participants', start: 8, end: 32,
      kicker: 'Three order types, three jobs',
      title: 'Each one answers a different question',
      items: [
        { at: 14.6, kind: 'mkt', label: 'Market', desc: ['Fills now.', 'Speed first.'], color: 'peach' },
        { at: 20.8, kind: 'lmt', label: 'Limit', desc: ['Fills at your price.', 'Control first.'], color: 'teal' },
        { at: 26.0, kind: 'stp', label: 'Stop', desc: ['Waits for a trigger,', 'then goes market.'], color: 'pink' },
      ],
      lines: [
        { at: 8.4, text: 'Know the difference before you touch a chart.' },
        { at: 10.8, text: 'There are three order types, and each one has a different job.' },
        { at: 14.6, text: 'A market order fills immediately, at whatever price is available. Speed over price control.' },
        { at: 20.8, text: 'A limit order rests, and only fills at your price. Price control over speed.' },
        { at: 26.0, text: 'A stop order sits quietly until it’s triggered, then acts like a market order.' },
      ],
    },
    {
      type: 'order-demo', start: 32, end: 58,
      kicker: 'See them in action', mkt: 34.4, lmt: 40.2, stp: 46.4,
      headlines: [
        { at: 32.4, html: 'Here’s what each one <span class="mark">actually does.</span>' },
      ],
      lines: [
        { at: 32.4, text: 'Here’s what each one looks like.' },
        { at: 34.4, text: 'Market: you click, you’re in. Right now, at the best price available.' },
        { at: 40.2, text: 'Limit: your order waits at your price, until price comes to you.' },
        { at: 46.4, text: 'Stop: it sleeps below your long position. If price falls to it, it wakes up and gets you out.' },
        { at: 54.0, text: 'Like a protective exit.' },
      ],
    },
    {
      type: 'seesaw', start: 58, end: 69,
      kicker: 'Not interchangeable',
      headlines: [
        { at: 58.4, out: 61.8, html: 'Market and limit are <span class="mark">not interchangeable.</span>' },
        { at: 62.0, html: 'Every order is a trade-off: <span class="mark">speed vs. control.</span>' },
      ],
      lines: [
        { at: 58.4, text: 'So no, market and limit orders aren’t interchangeable.' },
        { at: 62.0, text: 'Every order type is a trade-off between speed and control.' },
      ],
    },
    {
      type: 'host-hook', start: 69, end: 81, pointAt: 75.4, size: 66,
      kicker: 'Remember this',
      parts: [
        { at: 70.6, text: 'Later, you’ll see which order types I lean on.' },
        { at: 75.4, html: 'But first, <span class="mark">understand all three.</span>' },
      ],
      lines: [
        { at: 69.4, text: 'Here’s what to remember.' },
        { at: 70.6, text: 'Later, I’ll show you which order types I personally lean on for entries.' },
        { at: 75.4, text: 'But first, you need to understand all three: market, limit, and stop.' },
      ],
    },
    {
      type: 'host-mission', start: 81, end: 92,
      kicker: 'Your mission',
      question: { at: 83.4, text: 'If price never reaches your limit price, does the order fill anyway?' },
      cta: { at: 88.2, text: 'Let’s find out' },
      lines: [
        { at: 81.4, text: 'So here’s your mission for this lesson.' },
        { at: 83.4, text: 'If price never reaches your limit price, does the order fill anyway?' },
        { at: 88.2, text: 'Let’s find out.' },
      ],
    },
  ],
};
