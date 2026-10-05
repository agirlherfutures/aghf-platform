/**
 * Phase 2 · Section 2 · Lesson 10 intro video — "What Does It Mean to Break Structure?"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-10',
  eyebrow: 'Phase 2 · Section 2 · Lesson 10',
  duration: 80,
  sources: 'From Section 2, Lesson 10 ("What Does It Mean to Break Structure?"): a candle high/low, a minor internal swing, a relevant swing and an external swing can all "break," they are not automatically the same structural event, and "Before you label a break, identify the level."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Breaks, Shifts & Fakeouts',
      title: 'What Does It Mean to Break Structure?',
      quote: 'Before you label a break, identify the level.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Ten, the first lesson of Breaks, Shifts and Fakeouts.', screen: 'Aristella waves; title *What Does It Mean to Break Structure?*' },
        { at: 4.6, text: 'Before you label a break, identify the level.' },
      ],
    },
    {
      type: 'break-chart', start: 8, end: 41, seed: 10,
      kicker: 'What actually broke?',
      swings: [[0, 0.1], [0.16, 0.86], [0.27, 0.56], [0.38, 0.73], [0.55, 0.16], [0.64, 0.42], [0.7, 0.3], [0.78, 0.5], [0.87, 0.77], [0.94, 0.8]],
      per: [5, 3, 3, 5, 3, 2, 2, 2, 2],
      play: [{ to: 6, at: 8.6, dur: 3.4 }, { to: 7, at: 15.0, dur: 1.0 }, { to: 8, at: 22.0, dur: 1.0 }, { to: 9, at: 28.0, dur: 0.6 }],
      extra: [{ u: 0.99, o: 0.8, c: 0.79, hi: 0.93, lo: 0.77, at: 28.8 }],
      levels: [
        { v: 0.86, from: 0.16, label: 'C · external high', tone: 'purple', at: 12.2 },
        { v: 0.73, from: 0.38, label: 'B · relevant swing high', tone: 'gold', at: 12.9 },
        { v: 0.42, from: 0.64, label: 'A · tiny internal high', tone: 'muted', at: 13.6, below: true },
      ],
      pills: [
        { u: 0.78, v: 0.6, text: 'A broke · tiny', tone: 'muted', at: 16.4, out: 21.6, fs: 26 },
        { u: 0.62, v: 0.93, text: 'B broke · relevant', tone: 'gold', at: 23.4, out: 33, fs: 26 },
        { u: 0.99, v: 1.02, text: 'C · wick only', tone: 'purple', at: 30.0, fs: 26 },
      ],
      headlines: [
        { at: 8.4, out: 33.2, html: 'Price broke a high. <span class="mark">Which one?</span>' },
        { at: 33.4, html: 'Not every break is the <span class="mark">same event.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Here’s a bullish chart, with three highs marked above price.', screen: 'Candles build; levels A, B and C appear' },
        { at: 15.0, text: 'Price closes above A. Something broke. But what?', screen: '"A broke · tiny"' },
        { at: 18.6, text: 'A was just a tiny internal high.' },
        { at: 22.0, text: 'Now price closes above B, the relevant swing high. That carries a lot more meaning.', screen: '"B broke · relevant"' },
        { at: 28.0, text: 'And at C, the external high, price only wicks above it, then closes back below.', screen: '"C · wick only"' },
        { at: 33.4, text: 'Three highs “broke.” They’re not the same structural event.' },
      ],
    },
    {
      type: 'cards', start: 41, end: 59,
      kicker: 'Four things that can break',
      items: [
        { title: 'Candle high/low', desc: ['Just the last', 'candle’s extreme'], tone: 'muted', icon: 'bar', at: 42.6 },
        { title: 'Minor internal', desc: ['A tiny turn inside', 'the move'], tone: 'muted', icon: 'dot', at: 44.8 },
        { title: 'Relevant swing', desc: ['The swing defining', 'the move you read'], tone: 'gold', icon: 'diamond', at: 47.0 },
        { title: 'External swing', desc: ['The edge of the', 'larger range'], tone: 'purple', icon: 'square', at: 49.2 },
      ],
      headlines: [{ at: 52.4, html: 'Same word, “break.” <span class="mark">Different meaning.</span>' }],
      lines: [
        { at: 41.4, text: 'Four things can break.', screen: 'Four cards pop in' },
        { at: 42.6, text: 'A candle’s high or low.', screen: 'Candle high/low' },
        { at: 44.8, text: 'A minor internal swing.', screen: 'Minor internal' },
        { at: 47.0, text: 'A relevant swing.', screen: 'Relevant swing' },
        { at: 49.2, text: 'Or an external swing.', screen: 'External swing' },
        { at: 52.4, text: 'Same word, break. Very different meaning.' },
      ],
    },
    {
      type: 'host-hook', start: 59, end: 68, pointAt: 61.6, size: 72,
      kicker: 'Dayli says',
      parts: [
        { at: 60.0, text: 'Before you label a break,' },
        { at: 61.6, html: '<span class="mark">identify the level.</span> 👀' },
      ],
      lines: [
        { at: 59.4, text: 'So here’s the big takeaway.', screen: 'Aristella thinks' },
        { at: 60.6, text: 'Before you label a break, identify the level.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 68, end: 80,
      kicker: 'Your mission',
      question: { at: 70.0, text: 'If price breaks a high, did the structure break?' },
      cta: { at: 76.0, text: 'Let’s find out' },
      lines: [
        { at: 68.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 70.0, text: 'If price breaks a high, did the structure break?', screen: 'Mission question' },
        { at: 76.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
