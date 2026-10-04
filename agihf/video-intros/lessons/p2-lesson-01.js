/**
 * Phase 2 · Section 4 · Lesson 1 intro video — "What Is Market Structure?"
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-01',
  eyebrow: 'Phase 2 · Section 4 · Lesson 1',
  duration: 77,
  sources: 'From Section 4, Lesson 1 ("What Is Market Structure?"): the 1M zoom-out, the definition of market structure, push and pullback, "candles are the words, structure is the sentence," Dayli\'s "what has price already shown me?" and the three-green-candles lock-in.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 9, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'What Is Market Structure?',
      quote: 'Candles are the words. Structure is the sentence.',
      lines: [
        { at: 0.6, text: 'Welcome to Phase Two of A Girl & Her Futures.', screen: 'Aristella waves; title *What Is Market Structure?*' },
        { at: 3.6, text: 'You learned how to read one candle. Now, we zoom out.' },
      ],
    },
    {
      type: 'zoom-chaos', start: 9, end: 31,
      beats: { chaos: 11.0, zoom: 16.6, line: 19.6, pp: 23.6 },
      kicker: 'Zoom out',
      headlines: [
        { at: 9.4, out: 16.4, html: 'Zoomed all the way in, it looks like <span class="mark">chaos.</span>' },
        { at: 16.6, out: 23.4, html: 'Now zoom out…' },
        { at: 23.6, html: 'Push → pullback → push → <span class="mark">pullback.</span>' },
      ],
      lines: [
        { at: 9.4, text: 'Start with a one-minute chart, zoomed all the way in.', screen: 'A dense 1M chart prints' },
        { at: 12.4, text: 'It looks like chaos. Every candle feels like it matters.', screen: '"?!" bubbles' },
        { at: 16.6, text: 'Now slowly zoom out.', screen: 'The chart zooms out into clean swings' },
        { at: 19.6, text: 'Connect the turns, and something appears.', screen: 'A dashed line connects the turns' },
        { at: 23.6, text: 'Push, pullback, push, pullback. Price doesn’t move in straight lines. It moves in swings.', screen: 'PUSH / PULLBACK labels pop in' },
      ],
    },
    {
      type: 'words-sentence', start: 31, end: 52,
      beats: { words: 33.6, assemble: 39.6, sentence: 44.6 },
      kicker: 'What is market structure?',
      headlines: [
        { at: 31.4, out: 39.4, html: 'Every candle on its own is just <span class="mark">a word.</span>' },
        { at: 39.6, html: 'Structure organizes price by its <span class="mark">meaningful highs and lows.</span>', size: 50 },
      ],
      lines: [
        { at: 31.4, text: 'Here’s the idea.', screen: 'Loose candle tiles float in' },
        { at: 33.6, text: 'Candles are the words.' },
        { at: 35.6, text: 'Looked at one by one, they don’t tell you much.' },
        { at: 39.6, text: 'Market structure organizes price movement by its meaningful highs and lows, and the relationship between them.', screen: 'Tiles fly into HIGH → LOW → HIGH → LOW → HIGH' },
        { at: 46.4, text: 'Structure is the sentence.', screen: '"structure = the sentence"' },
      ],
    },
    {
      type: 'host-hook', start: 52, end: 64, pointAt: 58.2, size: 66,
      kicker: 'Dayli says',
      parts: [
        { at: 53.6, text: 'Don’t start with “Where is price going?”' },
        { at: 58.2, html: 'Start with: <span class="mark">“What has price already shown me?”</span>' },
      ],
      lines: [
        { at: 52.4, text: 'Here’s the habit I want you to build.', screen: 'Aristella thinks' },
        { at: 53.6, text: 'Don’t start by asking, where is price going?' },
        { at: 58.2, text: 'Start with: what has price already shown me?', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 64, end: 77,
      kicker: 'Your mission',
      question: { at: 66.4, text: 'A trader sees three green candles and says “bullish structure.” What’s missing?' },
      cta: { at: 72.6, text: 'Let’s find out' },
      lines: [
        { at: 64.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 66.4, text: 'A trader sees three green candles and says, bullish structure. What’s missing?', screen: 'Mission question' },
        { at: 72.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
