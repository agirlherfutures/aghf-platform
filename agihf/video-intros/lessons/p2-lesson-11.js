/**
 * Phase 2 · Section 5 · Lesson 11 intro video — "Break of Structure: BOS"
 * Scenes: s5-high-jump (clearing the bar at the prior high / limbo under the prior low), s5-receipt (a BOS is a receipt, not a forecast).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-11',
  eyebrow: 'Phase 2 · Section 5 · Lesson 11',
  duration: 79,
  sources: 'From Section 5, Lesson 11 ("Break of Structure: BOS"): a BOS is a close through the relevant prior swing in the direction of the existing structure, it gives continuation information, bearish BOS mirrors bullish, the "Proved ≠ Will" comparison, and Dayli\'s line "A BOS tells you what price just proved. It does not tell you what price will do next."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Break of Structure: BOS',
      quote: 'Price just proved. Not price will.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Eleven: Break of Structure, or BOS.', screen: 'Aristella waves; title *Break of Structure: BOS*' },
        { at: 4.6, text: 'Price just proved something. Let’s see what.' },
      ],
    },
    {
      type: 's5-high-jump', start: 8, end: 32, beats: { bar: 11.8, run: 14.4, jump: 16.6, limbo: 25.6 },
      kicker: 'Break of structure',
      headlines: [
        { at: 8.4, out: 25.0, html: 'Clear the prior high, <span class="mark">with the structure.</span>' },
        { at: 25.2, html: 'Bearish BOS is <span class="mark">the mirror.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Think of a BOS like a high jump.', screen: 'A track; bullish structure on the left' },
        { at: 11.6, text: 'In a bullish structure, the bar sits at the relevant prior high.', screen: '"relevant prior high"' },
        { at: 16.2, text: 'Price closes above it. Cleared! That’s a bullish break of structure.', screen: 'The athlete flips over the bar; "BOS ▲"' },
        { at: 20.8, text: 'It broke with the existing structure, so it’s continuation information.' },
        { at: 25.4, text: 'Bearish is the mirror, like limbo: a close below the relevant prior low.', screen: 'Limbo under the prior low; "BOS ▼"' },
      ],
    },
    {
      type: 's5-receipt', start: 32, end: 57, beats: { print: 39.0, stamp: 43.8, ask: 45.2, no: 49.8 },
      kicker: 'Watch your words',
      headlines: [
        { at: 32.4, out: 49.4, html: 'A BOS is a <span class="mark">receipt.</span>' },
        { at: 49.6, html: 'Proved is <span class="mark">not</span> will.' },
      ],
      lines: [
        { at: 32.4, text: 'Now, watch your words.', screen: 'A robot cashier at a shop counter' },
        { at: 34.2, text: 'A BOS is like a receipt. It records what already happened.' },
        { at: 39.0, text: 'Price progressed with the existing structure, and closed above the relevant high.', screen: 'The receipt prints; "PROVED" stamp' },
        { at: 45.2, text: 'But a receipt can’t tell you what you’ll buy tomorrow.', screen: '"So it WILL keep going?"' },
        { at: 49.8, text: 'A BOS doesn’t tell you what price will do next. Proved is not will.', screen: '"not on the receipt"' },
      ],
    },
    {
      type: 'host-hook', start: 57, end: 67, pointAt: 60.2, size: 72,
      kicker: 'Dayli says',
      parts: [
        { at: 58.4, text: 'Price just proved.' },
        { at: 60.2, html: '<span class="mark">Not price will.</span> 🧾' },
      ],
      lines: [
        { at: 57.4, text: 'So here’s the big takeaway.', screen: 'Aristella thinks' },
        { at: 58.8, text: 'A BOS tells you what price just proved. Not what price will do.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 67, end: 79,
      kicker: 'Your mission',
      question: { at: 69.0, text: 'If price closes above the relevant prior high in a bullish structure, what did it just prove?' },
      cta: { at: 75.6, text: 'Let’s find out' },
      lines: [
        { at: 67.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 69.0, text: 'If price closes above the relevant prior high in a bullish structure, what did it just prove?', screen: 'Mission question' },
        { at: 75.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
