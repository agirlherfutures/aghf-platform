/**
 * Phase 2 · Section 4 · Lesson 2 intro video — "Swing Highs & Swing Lows"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-02',
  eyebrow: 'Phase 2 · Section 4 · Lesson 2',
  duration: 75,
  sources: 'From Section 4, Lesson 2 ("Swing Highs & Swing Lows"): the swing high and swing low definitions, the heel and valley memory device, "not every tiny wiggle deserves equal structural importance," Dayli\'s "your job is to learn how to see them," and the lock-in question.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'Swing Highs & Swing Lows',
      quote: 'Before you can read structure, you need to find the turns.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Two of How Markets Move.', screen: 'Aristella waves; title *Swing Highs & Swing Lows*' },
        { at: 3.6, text: 'Before you can read structure, you need to find the turns.' },
      ],
    },
    {
      type: 'heel-valley', start: 8, end: 30,
      beats: { heel: 13.0, valley: 19.6 },
      kicker: 'Find the turns',
      headlines: [
        { at: 8.4, out: 19.4, html: '👠 Swing high = <span class="mark">the heel.</span>' },
        { at: 19.6, html: '🫧 Swing low = <span class="mark">the valley.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'A swing high is where price pushes upward, forms a local turning point, and then moves lower.', screen: 'A swing high prints' },
        { at: 15.0, text: 'Think of it as the heel. Price walks up, reaches a high point, then turns.', screen: '👠 the heel; "SWING HIGH"' },
        { at: 19.6, text: 'A swing low is the opposite. Price pushes down, forms a local turning point, then moves higher.', screen: 'A swing low prints in a valley' },
        { at: 25.6, text: 'That’s the valley. Just a memory trick, not the technical definition.', screen: '"SWING LOW 🫧"' },
      ],
    },
    {
      type: 'turn-finder', start: 30, end: 51,
      beats: { scan: 33.0, big: 41.6 },
      kicker: 'Not every wiggle is equal',
      headlines: [
        { at: 30.4, out: 41.4, html: 'On a 1M chart, there are turns <span class="mark">everywhere.</span>' },
        { at: 41.6, html: 'They’re all real. They don’t all carry <span class="mark">the same weight.</span>', size: 52 },
      ],
      lines: [
        { at: 30.4, text: 'Now, here’s the thing.', screen: 'A noisy chart prints' },
        { at: 33.0, text: 'On a one-minute chart, there can be lots of little highs and lows inside one larger move.', screen: 'A spotlight scans; a dot at every turn' },
        { at: 41.6, text: 'Every one of them is real. But not every tiny wiggle deserves equal structural importance.', screen: '"the big turn" circled' },
        { at: 47.4, text: 'This will matter later.' },
      ],
    },
    {
      type: 'host-hook', start: 51, end: 62, pointAt: 56.6, size: 64,
      kicker: 'Dayli says',
      parts: [
        { at: 52.6, text: 'Your job isn’t to trade swings yet.' },
        { at: 56.6, html: 'Your job is to <span class="mark">learn how to see them.</span>' },
      ],
      lines: [
        { at: 51.4, text: 'Swings are going to become very important later.', screen: 'Aristella thinks' },
        { at: 54.0, text: 'For now, your job isn’t to trade them.' },
        { at: 56.6, text: 'Your job is to learn how to see them.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 62, end: 75,
      kicker: 'Your mission',
      question: { at: 64.4, text: 'Should every tiny high and low on a 1M chart be treated as equally important structure?' },
      cta: { at: 71.0, text: 'Let’s find out' },
      lines: [
        { at: 62.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 64.4, text: 'Should every tiny high and low on a one-minute chart be treated as equally important structure?', screen: 'Mission question' },
        { at: 71.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
