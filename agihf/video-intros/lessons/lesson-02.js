/**
 * Lesson 2 intro video — "Why Do Markets Exist?" (illustrated version)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 * Illustrated scene types live in scenes-illustrated.js; artwork in illustrations.js.
 */
window.LESSON_VIDEO = {
  slug: 'lesson-02',
  eyebrow: 'Phase 1 · Section 1 · Lesson 2',
  duration: 89,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Why Do Markets Exist?',
      quote: 'Markets exist because buyers and sellers need each other. That’s it.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Two of A Girl & Her Futures.' },
        { at: 3.6, text: 'Today’s question: why do markets even exist?' },
      ],
    },
    {
      type: 'host-hook', start: 8, end: 16, pointAt: 11.6,
      kicker: 'First things first',
      parts: [
        { at: 8.8, text: 'Before you try to beat the market,' },
        { at: 11.6, html: '<span class="mark">understand</span> what the market is doing.' },
      ],
      lines: [
        { at: 8.8, text: 'Before you try to beat the market,' },
        { at: 11.6, text: 'understand what the market is actually doing.' },
      ],
    },
    {
      type: 'participants', start: 16, end: 35,
      kicker: 'Same market, different objective',
      title: 'People trade for different reasons',
      items: [
        { at: 20.4, kind: 'hedger', label: 'Hedger', desc: ['Managing exposure', 'to price changes'], color: 'purple' },
        { at: 24.6, kind: 'speculator', label: 'Speculator', desc: ['Expects price', 'to change'], color: 'teal' },
        { at: 29.0, kind: 'investor', label: 'Investor', desc: ['Managing a longer-', 'term portfolio'], color: 'peach' },
      ],
      lines: [
        { at: 16.4, text: 'Markets exist because people come to them for different reasons.' },
        { at: 20.4, text: 'A hedger is managing exposure to price changes.' },
        { at: 24.6, text: 'A speculator expects price to move, and wants to profit from it.' },
        { at: 29.0, text: 'And an investor is managing a longer-term portfolio.' },
      ],
    },
    {
      type: 'exchange', start: 35, end: 55,
      kicker: 'Watch a transaction form',
      titleAt: 46.2, title: 'Same price. Two different opinions.',
      buyerQuote: 'That’s attractive. I want in!',
      sellerQuote: 'I’m willing to sell here.',
      beats: { buyerIn: 35.6, buyerSay: 38.4, sellerIn: 39.6, sellerSay: 42.4, price: 46.2, swap: 49.0, meet: 50.8 },
      footer: { at: 49.6, text: 'Neither is wrong. They just want different things.' },
      lines: [
        { at: 35.4, text: 'Now watch a transaction form.' },
        { at: 38.4, text: 'A buyer shows up and says: that price looks attractive, I want in.' },
        { at: 42.4, text: 'A seller shows up and says: I’m willing to sell right here.' },
        { at: 46.2, text: 'Same price. Two different opinions.' },
        { at: 49.6, text: 'Neither one is wrong. They just want different things.' },
      ],
    },
    {
      type: 'crowd', start: 55, end: 66,
      kicker: 'Here’s the key',
      beats: { agree: 57.2, flip: 60.6, trade: 61.6 },
      headlines: [
        { at: 57.2, out: 60.4, text: 'If everyone agreed, no one would trade.' },
        { at: 60.8, html: 'Disagreement <span class="mark">creates the transaction.</span>' },
      ],
      lines: [
        { at: 55.4, text: 'And here’s the key.' },
        { at: 57.2, text: 'If everyone agreed, no one would trade.' },
        { at: 60.6, text: 'Disagreement is what creates the transaction.' },
      ],
    },
    {
      type: 'chart-tug', start: 66, end: 75,
      kicker: 'Remember this', textAt: 67.6, chartStart: 67.0, chartEnd: 74.2,
      html: 'The chart is just the visual record of buyers and sellers <span class="mark">disagreeing.</span>',
      lines: [
        { at: 66.4, text: 'Here’s what to remember.' },
        { at: 67.6, text: 'The chart is just the visual record of buyers and sellers disagreeing.' },
      ],
    },
    {
      type: 'host-mission', start: 75, end: 89,
      kicker: 'Your mission',
      question: { at: 77.4, text: 'If two traders disagree about where price is headed, can they still both trade at the same price?' },
      cta: { at: 85.0, text: 'Let’s find out' },
      lines: [
        { at: 75.4, text: 'So here’s your mission for this lesson.' },
        { at: 77.4, text: 'If two traders disagree about where price is headed, can they still both trade at the same price?' },
        { at: 85.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
