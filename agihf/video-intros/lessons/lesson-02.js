/**
 * Lesson 2 intro video — "Why Do Markets Exist?"
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-02',
  eyebrow: 'Phase 1 · Section 1 · Lesson 2',
  duration: 89,
  scenes: [
    {
      type: 'title', start: 0, end: 8,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Why Do Markets Exist?',
      quote: 'Markets exist because buyers and sellers need each other. That’s it.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Two of A Girl & Her Futures.' },
        { at: 3.6, text: 'Today’s question: why do markets even exist?' },
      ],
    },
    {
      type: 'hook', start: 8, end: 16,
      kicker: 'First things first',
      parts: [
        { at: 8.8, text: 'Before you try to beat the market,' },
        { at: 11.6, text: 'understand what the market is doing.', highlight: 'understand' },
      ],
      lines: [
        { at: 8.8, text: 'Before you try to beat the market,' },
        { at: 11.6, text: 'understand what the market is actually doing.' },
      ],
    },
    {
      type: 'grid4', start: 16, end: 35,
      kicker: 'Same market, different objective',
      title: 'People trade for different reasons',
      items: [
        { at: 20.4, label: 'Hedger', desc: 'Managing exposure to price changes.', color: 'purple' },
        { at: 24.6, label: 'Speculator', desc: 'Expects price to change.', color: 'teal' },
        { at: 29.0, label: 'Investor', desc: 'Managing a longer-term portfolio.', color: 'peach' },
      ],
      lines: [
        { at: 16.4, text: 'Markets exist because people come to them for different reasons.' },
        { at: 20.4, text: 'A hedger is managing exposure to price changes.' },
        { at: 24.6, text: 'A speculator expects price to move, and wants to profit from it.' },
        { at: 29.0, text: 'And an investor is managing a longer-term portfolio.' },
      ],
    },
    {
      type: 'duo', start: 35, end: 55,
      kicker: 'Watch a transaction form',
      title: 'Same price. Two different opinions.',
      left: { at: 38.4, icon: 'B', label: 'Buyer', quote: 'That’s attractive. I want in here.', color: 'teal' },
      middle: { at: 46.2, text: 'Same price' },
      right: { at: 42.4, icon: 'S', label: 'Seller', quote: 'I’m willing to sell here.', color: 'pink' },
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
      type: 'hook', start: 55, end: 66,
      kicker: 'Here’s the key',
      parts: [
        { at: 57.2, text: 'If everyone agreed, no one would trade.' },
        { at: 60.6, text: 'Disagreement is what creates the transaction.', highlight: 'creates the transaction' },
      ],
      lines: [
        { at: 55.4, text: 'And here’s the key.' },
        { at: 57.2, text: 'If everyone agreed, no one would trade.' },
        { at: 60.6, text: 'Disagreement is what creates the transaction.' },
      ],
    },
    {
      type: 'remember', start: 66, end: 75,
      kicker: 'Remember this',
      parts: [
        { at: 67.6, text: 'The chart is just the visual record' },
        { at: 69.8, text: 'of buyers and sellers disagreeing.', highlight: 'disagreeing' },
      ],
      lines: [
        { at: 66.4, text: 'Here’s what to remember.' },
        { at: 67.6, text: 'The chart is just the visual record of buyers and sellers disagreeing.' },
      ],
    },
    {
      type: 'mission', start: 75, end: 89,
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
