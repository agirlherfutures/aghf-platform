/**
 * Lesson 15 intro video — "Wicks, Bodies & Closes" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-15',
  eyebrow: 'Phase 1 · Section 3 · Lesson 15',
  duration: 73,
  sources: 'Everything is pulled from Lesson 15\'s existing content (`agihf/lessons-data/p1-15.json`): the hook, "reached ≠ accepted," the Wick ≠ Close comparison, the note that a later entry model is built on the close, Dayli\'s "say that back to yourself" note, and the mission question. The title-card quote is Lesson 15\'s curriculum quote.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Wicks, Bodies & Closes',
      quote: 'I don’t care about the wick. I need the candle to close through the level.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Fifteen of A Girl & Her Futures.', screen: 'Aristella waves; title *Wicks, Bodies & Closes*' },
        { at: 3.8, text: 'Today: the difference between a wick and a close.' },
      ],
    },
    {
      type: 'level-candles', start: 8, end: 32, levelAt: 13.4, levelLabel: 'Key high',
      candles: [
        { x: 700, at: 15.0, path: 'pokeReject', verdict: 'Reached…', good: false, below: true },
        { x: 1220, at: 22.6, path: 'breakHold', verdict: '…and accepted', good: true, below: true },
      ],
      kicker: 'Reached ≠ accepted',
      headlines: [
        { at: 8.4, out: 19.4, html: 'I don’t care about the wick. <span class="mark">I need the close.</span>' },
        { at: 19.6, out: 26.8, html: 'A wick shows price <span class="mark">reached</span> an area.' },
        { at: 27.0, html: 'A close shows price <span class="mark">accepted</span> it.' },
      ],
      lines: [
        { at: 8.4, text: 'I don’t care about the wick.', screen: 'Empty chart' },
        { at: 10.4, text: 'I need the candle to close through the level.' },
        { at: 13.4, text: 'Here’s a key high.', screen: '"Key high" line draws' },
        { at: 15.0, text: 'Watch this candle: price pushes above it…', screen: 'Candle wicks above, closes back below: "Reached…"' },
        { at: 19.6, text: 'A wick shows price reached the area.' },
        { at: 22.6, text: 'But a close shows price actually accepted it.', screen: 'Candle closes above: "…and accepted"' },
        { at: 27.0, text: 'Reached isn’t the same as accepted.' },
      ],
    },
    {
      type: 'versus-rows', start: 32, end: 48,
      kicker: 'Don’t get this confused', title: 'Wick ≠ Close', cols: ['Wick', 'Close'],
      rows: [
        { at: 34.0, label: 'Shows', left: { icon: 'wicks', text: 'Price reached an area' }, right: { icon: 'close', text: 'Price accepted it' } },
        { at: 39.6, label: 'It’s a', left: { icon: 'wicks', text: 'Visit' }, right: { icon: 'close', text: 'Decision' } },
        { at: 43.0, label: 'Later', left: { icon: 'wicks', text: 'Can mislead alone' }, right: { icon: 'close', text: 'Entries are built on it' } },
      ],
      lines: [
        { at: 32.4, text: 'Don’t get these confused.', screen: '"Wick ≠ Close" table' },
        { at: 34.0, text: 'A wick shows price reached an area. A close shows it actually accepted.', screen: 'Row: Shows' },
        { at: 39.6, text: 'A wick is a visit. A close is a decision.', screen: 'Row: Visit vs Decision' },
        { at: 43.0, text: 'And later in the Academy, a whole entry model is built on the close.', screen: 'Row: Later' },
      ],
    },
    {
      type: 'host-hook', start: 48, end: 59, pointAt: 53.0, size: 66,
      kicker: 'Remember this',
      parts: [
        { at: 49.6, text: 'Tempted to react to a wick? Say it back:' },
        { at: 53.0, html: 'I don’t care about the wick. <span class="mark">I need the close.</span>' },
      ],
      lines: [
        { at: 48.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 49.6, text: 'Every time you’re tempted to react to a wick, say it back:' },
        { at: 53.0, text: 'I don’t care about the wick. I need the close.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 59, end: 73,
      kicker: 'Your mission',
      question: { at: 61.4, text: 'If price wicks above a key high but closes back below it, has bullish structure been confirmed?' },
      cta: { at: 69.0, text: 'Let’s find out' },
      lines: [
        { at: 59.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 61.4, text: 'If price wicks above a key high but closes back below it, has bullish structure actually been confirmed?', screen: 'Mission question' },
        { at: 69.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
