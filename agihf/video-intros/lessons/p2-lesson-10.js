/**
 * Phase 2 · Section 5 · Lesson 10 intro video: "What Does It Mean to Break Structure?"
 * Scenes: s5-fences (a puppy hops fences of different heights), s5-detective (which high actually broke?).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-10',
  eyebrow: 'Phase 2 · Section 5 · Lesson 10',
  duration: 80,
  sources: 'From Section 5, Lesson 10 ("What Does It Mean to Break Structure?"): a candle high/low, a minor internal swing, a relevant swing and an external swing can all "break," they are not automatically the same structural event, the investigation loop (what broke, which swing, how did it break), and "Before you label a break, identify the level."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'What Does It Mean to Break Structure?',
      quote: 'Before you label a break, identify the level.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Ten: What Does It Mean to Break Structure?', screen: 'Aristella waves; title *What Does It Mean to Break Structure?*' },
        { at: 4.8, text: 'Before you label a break, identify the level.' },
      ],
    },
    {
      type: 's5-fences', start: 8, end: 33, beats: { run: 9.4, j1: 13.4, j2: 17.4, j3: 21.6, wall: 26.4, ask: 29.6 },
      kicker: 'Not every break is the same',
      headlines: [
        { at: 8.4, out: 29.2, html: 'Something broke. <span class="mark">Which fence?</span>' },
        { at: 29.4, html: 'Every hop is a break. <span class="mark">Not the same event.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Picture a puppy running across a field full of fences.', screen: 'A puppy, four fences of different heights' },
        { at: 12.2, text: 'It hops a tiny edge. That’s like breaking one candle’s high.', screen: '"candle high"' },
        { at: 16.6, text: 'Then a little picket fence: a minor internal swing.', screen: '"minor internal"' },
        { at: 20.6, text: 'Then the big gate: a relevant swing. That one means a lot more.', screen: '"relevant swing"' },
        { at: 25.8, text: 'But the stone wall, the external swing, is still standing.', screen: 'The puppy sits at the wall; "external swing"' },
        { at: 29.6, text: 'Every hop was a break. They’re not the same event.', screen: '"Which fence?"' },
      ],
    },
    {
      type: 's5-detective', start: 33, end: 58, beats: { build: 33.6, levels: 36.4, a: 38.6, b: 44.4, c: 49.8 },
      kicker: 'What actually broke?',
      headlines: [
        { at: 33.4, out: 53.8, html: 'Price broke a high. <span class="mark">Which one?</span>' },
        { at: 54.0, html: 'Before you label a break, <span class="mark">identify the level.</span>', size: 52 },
      ],
      lines: [
        { at: 33.4, text: 'Now let’s investigate like a detective. Three highs sit above price.', screen: 'Candles build; levels A, B and C' },
        { at: 38.2, text: 'Price closes above A. Clue one: what actually broke? A tiny internal high.', screen: 'Magnifier on A; "A · tiny internal high"' },
        { at: 44.0, text: 'Then it closes above B, the relevant swing high. A much bigger clue.', screen: '"B · relevant swing high"' },
        { at: 49.4, text: 'At C, the external high, price only wicks above it, then closes back below.', screen: '"C · wick only"' },
        { at: 54.6, text: 'Same word, break. Very different meaning.' },
      ],
    },
    {
      type: 'host-hook', start: 58, end: 68, pointAt: 61.4, size: 72,
      kicker: 'Dayli says',
      parts: [
        { at: 59.4, text: 'Before you label a break,' },
        { at: 61.4, html: '<span class="mark">identify the level.</span> 🔍' },
      ],
      lines: [
        { at: 58.4, text: 'Here’s the takeaway.', screen: 'Aristella thinks' },
        { at: 60.0, text: 'Before you label a break, identify the level.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 68, end: 80,
      kicker: 'Your mission',
      question: { at: 70.0, text: 'If price breaks a high, did the structure break?' },
      cta: { at: 76.0, text: 'Let’s find out' },
      lines: [
        { at: 68.4, text: 'Here’s your mission.', screen: '"Your mission"' },
        { at: 70.0, text: 'If price breaks a high, did the structure break?', screen: 'Mission question' },
        { at: 76.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
