/**
 * Phase 2 · Section 4 · Lesson 8 intro video — "Consolidation"
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-08',
  eyebrow: 'Phase 2 · Section 4 · Lesson 8',
  duration: 80,
  sources: 'From Section 4, Lesson 8 ("Consolidation"): price walking around the room instead of up or down the stairs, similar highs and lows without sustained directional progress, the range high and range low, the trend-or-range sort, and the Dayli note that for now the job is simply to recognize it.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 4: How Markets Move',
      title: 'Consolidation',
      quote: 'Sometimes price isn’t walking up or down the stairs. It’s walking around the room.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Eight of How Markets Move.', screen: 'Aristella waves; title *Consolidation*' },
        { at: 3.6, text: 'Sometimes price isn’t walking up or down the stairs at all.' },
      ],
    },
    {
      type: 'pacing-box', start: 8, end: 34, beats: { box: 9.4, pace: 13.4, labels: 21.0, still: 27.4 },
      kicker: 'Walking around the room',
      headlines: [
        { at: 8.4, out: 20.8, html: 'Price is <span class="mark">moving…</span>' },
        { at: 21.0, html: '…but not making <span class="mark">progress.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Consolidation is when price trades within a relatively contained area, without clear, sustained directional progression.', screen: 'A box appears' },
        { at: 13.4, text: 'Instead of higher highs and higher lows, or lower lows and lower highs, price keeps returning to similar highs and similar lows.', screen: 'Price bounces between the edges; someone paces' },
        { at: 21.0, text: 'The top of that area is the range high. The bottom is the range low.', screen: 'RANGE HIGH / RANGE LOW' },
        { at: 27.4, text: 'Price is moving. It just isn’t making clean directional progress. It’s walking around the room.' },
      ],
    },
    {
      type: 'chart-sorter', start: 34, end: 58, beats: { cards: 35.6, every: 3.2, recog: 51.4 },
      kicker: 'Trend or range?',
      headlines: [
        { at: 34.4, out: 51.2, html: 'Up, down, or <span class="mark">around?</span>' },
        { at: 51.4, html: 'Your job right now: <span class="mark">recognize it.</span>' },
      ],
      lines: [
        { at: 34.4, text: 'So when you look at a chart, ask:', screen: 'Three bins: Bullish, Bearish, Range' },
        { at: 36.4, text: 'Is it walking up the stairs? Down the stairs? Or around the room?', screen: 'Mini charts drop into their bins' },
        { at: 43.0, text: 'Overlapping candles. Back and forth. Lots of movement, not much distance. The same areas tested again and again.' },
        { at: 51.4, text: 'Later, you’ll learn how market condition affects a setup. For now, your job is simply to recognize it.', screen: '"recognize it ✓"' },
      ],
    },
    {
      type: 'host-hook', start: 58, end: 67, pointAt: 61.0, size: 70,
      kicker: 'Dayli says',
      parts: [
        { at: 59.0, text: 'Price can be moving' },
        { at: 61.0, html: 'without <span class="mark">making progress.</span>' },
      ],
      lines: [
        { at: 58.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 59.0, text: 'Price can be moving without making progress.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 67, end: 80,
      kicker: 'Your mission',
      question: { at: 69.0, text: 'If price keeps trading between similar highs and lows, how would you describe it?' },
      cta: { at: 76.0, text: 'Let’s find out' },
      lines: [
        { at: 67.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 69.0, text: 'If price keeps trading between similar highs and lows, how would you describe it?', screen: 'Mission question' },
        { at: 76.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
