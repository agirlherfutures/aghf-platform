/**
 * Phase 2 · Section 4 · Lesson 3 intro video — "HH, HL, LH & LL"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-03',
  eyebrow: 'Phase 2 · Section 4 · Lesson 3',
  duration: 88,
  sources: 'From Section 4, Lesson 3 ("HH, HL, LH & LL"): the four label definitions, bullish and bearish progression, the walk-the-stairs analogy, and the 20,000 / 20,030 catch-the-mistake example.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'HH, HL, LH & LL',
      quote: 'The four labels that turn movement into readable structure.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Three of How Markets Move.', screen: 'Aristella waves; title *HH, HL, LH & LL*' },
        { at: 3.6, text: 'Four labels. They turn movement into readable structure.' },
      ],
    },
    {
      type: 'label-board', start: 8, end: 36, items: [12.6, 17.8, 23.2, 28.4],
      kicker: 'The four labels',
      headlines: [
        { at: 8.4, html: 'Compare each swing to the <span class="mark">previous relevant swing.</span>', size: 52 },
      ],
      lines: [
        { at: 8.4, text: 'Every swing gets compared to the previous relevant swing of the same kind.', screen: 'Four face-down cards' },
        { at: 12.6, text: 'A higher high forms above the previous relevant swing high.', screen: 'HH card flips' },
        { at: 17.8, text: 'A higher low forms above the previous relevant swing low.', screen: 'HL card flips' },
        { at: 23.2, text: 'A lower high forms below the previous relevant swing high.', screen: 'LH card flips' },
        { at: 28.4, text: 'And a lower low forms below the previous relevant swing low.', screen: 'LL card flips' },
      ],
    },
    {
      type: 'stairs-duo', start: 36, end: 64, beats: { up: 38.4, down: 49.4 },
      kicker: 'Walk the stairs',
      headlines: [
        { at: 36.4, out: 49.2, html: 'HL → HH → HL → HH: <span class="mark">up the stairs.</span>' },
        { at: 49.4, html: 'LH → LL → LH → LL: <span class="mark">down the stairs.</span>' },
      ],
      lines: [
        { at: 36.4, text: 'Now put them together.', screen: 'Up-the-stairs chart prints' },
        { at: 41.2, text: 'Higher low, higher high, higher low, higher high. Price is generally walking up the stairs.', screen: 'HL / HH labels drop in' },
        { at: 49.4, text: 'Flip it around.', screen: 'Down-the-stairs chart prints' },
        { at: 52.2, text: 'Lower high, lower low, lower high, lower low. Price is walking down the stairs.', screen: 'LH / LL labels drop in' },
      ],
    },
    {
      type: 'host-hook', start: 64, end: 75, pointAt: 69.6, size: 62,
      kicker: 'Catch the mistake',
      parts: [
        { at: 65.4, text: 'Previous high: 20,000. New high: 20,030.' },
        { at: 69.6, html: 'Above the previous high? <span class="mark">That’s an HH.</span>' },
      ],
      lines: [
        { at: 64.4, text: 'Quick one.', screen: 'Aristella thinks' },
        { at: 65.4, text: 'Previous high: twenty thousand. New high: twenty thousand thirty.' },
        { at: 69.6, text: 'It formed above the previous high, so it’s a higher high.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 75, end: 88,
      kicker: 'Your mission',
      question: { at: 77.4, text: 'If a new swing low forms above the previous relevant swing low, what do you call it?' },
      cta: { at: 83.6, text: 'Let’s find out' },
      lines: [
        { at: 75.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 77.4, text: 'If a new swing low forms above the previous relevant swing low, what do you call it?', screen: 'Mission question' },
        { at: 83.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
