/**
 * Phase 2 · Section 5 · Lesson 15 intro video — "Wick Break vs. Candle-Close Break"
 * Scenes: s5-house-visit (a wick peeks upstairs, a close moves in), s5-photo-finish (a reach is not a finish).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-15',
  eyebrow: 'Phase 2 · Section 5 · Lesson 15',
  duration: 79,
  sources: 'From Section 5, Lesson 15 ("Wick Break vs. Candle-Close Break"): a wick through (price traded beyond the level, then the candle closed back inside) vs. a close through (the body finished beyond the level), what a wick can still show (traded beyond, rejection, a quick excursion), the AGHF convention that candle-close confirmation carries more significance, and Dayli\'s quote "A wick can visit. A close gives stronger confirmation that price finished beyond the level."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Wick Break vs. Candle-Close Break',
      quote: 'A wick can visit. A close finishes there.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Fifteen: Wick Break versus Candle-Close Break.', screen: 'Aristella waves; title *Wick Break vs. Candle-Close Break*' },
        { at: 5.0, text: 'Did price really break that level?' },
      ],
    },
    {
      type: 's5-house-visit', start: 8, end: 34, beats: { level: 9.8, wick: 13.6, wickL: 19.2, move: 24.8, home: 28.8 },
      kicker: 'Same level. Two endings.',
      headlines: [
        { at: 8.4, out: 24.6, html: 'A wick can <span class="mark">visit.</span>' },
        { at: 24.8, html: 'A close <span class="mark">finishes there.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Think of a level as the floor between two stories of a house.', screen: 'A house; the floor is "the level"' },
        { at: 13.2, text: 'Version one: the candle’s wick pokes upstairs, takes a look, and the body stays below.', screen: 'The wick periscopes upstairs; the cat jumps' },
        { at: 19.2, text: 'That’s a wick through. Price traded above the level, but closed back below.', screen: '"wick through"' },
        { at: 25.0, text: 'Version two: the whole body moves upstairs and finishes there.', screen: 'A candle climbs the ladder with a suitcase' },
        { at: 29.6, text: 'That’s a close through. Same level, different ending.', screen: '"close through"' },
      ],
    },
    {
      type: 's5-photo-finish', start: 34, end: 57, beats: { r1: 40.0, info: 42.6, r2: 47.6, conv: 50.6 },
      kicker: 'Check the photo',
      headlines: [
        { at: 34.4, out: 50.2, html: 'Where did the <span class="mark">body</span> finish?' },
        { at: 50.4, html: 'The close gives <span class="mark">stronger confirmation.</span>' },
      ],
      lines: [
        { at: 34.4, text: 'Now think of a photo finish.', screen: 'A race track and a finish line' },
        { at: 36.8, text: 'Runner one reaches a hand across the line, but her body stays behind.', screen: 'Flash; photo "WICK THROUGH"' },
        { at: 42.0, text: 'That’s a wick. It isn’t nothing: price did trade beyond the level.', screen: '"traded beyond", "rejection", "quick excursion"' },
        { at: 46.8, text: 'Runner two’s whole body crosses and finishes there.', screen: 'Flash; photo "CLOSE THROUGH ✓"' },
        { at: 50.6, text: 'In the framework we’re learning, the close carries more weight.', screen: '"the close carries more weight"' },
      ],
    },
    {
      type: 'host-hook', start: 57, end: 67, pointAt: 60.2, size: 64,
      kicker: 'Dayli says',
      parts: [
        { at: 58.4, text: 'A wick can visit.' },
        { at: 60.2, html: 'A close gives <span class="mark">stronger confirmation</span> that price finished beyond the level.' },
      ],
      lines: [
        { at: 57.4, text: 'Dayli says.', screen: 'Aristella thinks' },
        { at: 58.4, text: 'A wick can visit. A close gives stronger confirmation that price finished beyond the level.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 67, end: 79,
      kicker: 'Your mission',
      question: { at: 69.0, text: 'Price poked above the level. Did it break it?' },
      cta: { at: 75.0, text: 'Let’s find out' },
      lines: [
        { at: 67.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 69.0, text: 'Price poked above the level. Did it break it?', screen: 'Mission question' },
        { at: 75.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
