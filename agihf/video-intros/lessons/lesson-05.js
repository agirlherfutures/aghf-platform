/**
 * Lesson 5 intro video — "Futures vs Stocks" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-05',
  eyebrow: 'Phase 1 · Section 1 · Lesson 5',
  duration: 89,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Futures vs Stocks',
      quote: 'Futures aren’t stocks. The rules are different. Let’s break it down.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Five of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: futures versus stocks, and why the difference matters.' },
      ],
    },
    {
      type: 'lift-reveal', start: 8, end: 26,
      kicker: 'Look underneath',
      left: { at: 15.0 }, right: { at: 19.0 },
      headlines: [
        { at: 8.4, out: 14.8, html: 'Same-looking chart. <span class="mark">Different thing underneath.</span>' },
        { at: 15.0, out: 18.8, html: 'A stock is <span class="mark">ownership.</span>' },
        { at: 19.0, html: 'A futures contract is <span class="mark">an agreement on price.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'A futures chart might look like every other chart.' },
        { at: 11.6, text: 'But what you’re trading underneath it isn’t the same.' },
        { at: 15.0, text: 'A stock is a piece of ownership in a company.' },
        { at: 19.0, text: 'A futures contract owns nothing. It’s an agreement based on price movement.' },
      ],
    },
    {
      type: 'versus-rows', start: 26, end: 44,
      kicker: 'Don’t get this confused', title: 'Stocks ≠ Futures',
      rows: [
        { at: 28.6, label: 'You trade', left: { icon: 'pie', text: 'Shares' }, right: { icon: 'doc', text: 'Standard contracts' } },
        { at: 32.6, label: 'Expires?', left: { icon: 'inf', text: 'Never' }, right: { icon: 'cal', text: 'Yes, then roll over' } },
        { at: 37.6, label: 'Hours', left: { icon: 'sun', text: 'Regular + extended' }, right: { icon: 'moon', text: 'Nearly 24h weekdays' } },
      ],
      lines: [
        { at: 26.4, text: 'Here’s what’s structurally different.' },
        { at: 28.6, text: 'Stocks are shares. Futures are standardized contracts.' },
        { at: 32.6, text: 'Stocks don’t expire. Futures contracts do, and you roll into the next one.' },
        { at: 37.6, text: 'And many futures trade nearly 24 hours on weekdays.' },
      ],
    },
    {
      type: 'maya', start: 44, end: 67,
      kicker: 'What’s wrong with Maya’s reasoning?',
      beats: { say: 49.0, neq: 53.6, shares: 57.6, mnq: 60.8 },
      headlines: [
        { at: 53.6, html: 'A share and a contract are <span class="mark">not the same unit of risk.</span>' },
      ],
      lines: [
        { at: 44.4, text: 'Meet Maya.' },
        { at: 45.8, text: 'She normally trades 10 shares of a stock.' },
        { at: 49.0, text: 'So she figures ten MNQ contracts must be her normal size, too.' },
        { at: 53.6, text: 'But a share and a contract aren’t the same unit of risk.' },
        { at: 57.6, text: 'Ten shares on a one-dollar move is ten dollars.' },
        { at: 60.8, text: 'Ten MNQ contracts on a ten-point move is two hundred.' },
      ],
    },
    {
      type: 'host-hook', start: 67, end: 77, pointAt: 70.4,
      kicker: 'Remember this',
      parts: [
        { at: 68.6, text: 'Before you size up,' },
        { at: 70.4, html: 'know what <span class="mark">one unit</span> is actually worth.' },
      ],
      lines: [
        { at: 67.4, text: 'Here’s what to remember.' },
        { at: 68.6, text: 'Before you size up, know what one unit of your instrument is actually worth.' },
      ],
    },
    {
      type: 'host-mission', start: 77, end: 89,
      kicker: 'Your mission',
      question: { at: 79.4, text: 'Can you treat 10 shares of a stock and 10 futures contracts as the same size?' },
      cta: { at: 85.0, text: 'Let’s find out' },
      lines: [
        { at: 77.4, text: 'So here’s your mission for this lesson.' },
        { at: 79.4, text: 'Can you treat 10 shares of a stock and 10 futures contracts as the same size?' },
        { at: 85.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
