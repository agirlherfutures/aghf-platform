/**
 * Lesson 17 intro video — "Timeframes" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-17',
  eyebrow: 'Phase 1 · Section 3 · Lesson 17',
  duration: 80,
  sources: 'Everything is pulled from Lesson 17\'s existing content (`agihf/lessons-data/p1-17.json`): the hook, "every timeframe shows the same market, just zoomed," the 4H / 1H / 15M / 1M detail-vs-noise idea, Dayli\'s "the market doesn\'t change when you switch the chart view" note, and the mission question. The intro doesn\'t say what to do when the 1M looks messy, so the mission stays open. The title-card quote is Lesson 17\'s curriculum quote.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Timeframes',
      quote: 'Higher timeframes tell the story. Lower timeframes let you step inside it.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Seventeen of A Girl & Her Futures.', screen: 'Aristella waves; title *Timeframes*' },
        { at: 3.8, text: 'Today: timeframes, and what they really change.' },
      ],
    },
    {
      type: 'timeframe-zoom', start: 8, end: 32, switchAt: 22.6, boxAt: 26.0,
      tfs: ['1M', '15M', '1H', '4H'], from: '4H', to: '1M', boxText: 'Same move, more detail',
      kicker: 'What is a timeframe?',
      headlines: [
        { at: 8.4, out: 13.2, html: 'Higher timeframes <span class="mark">tell the story.</span>' },
        { at: 13.4, out: 22.4, html: 'Same market, <span class="mark">different zoom.</span>' },
        { at: 22.6, html: 'More detail… <span class="mark">and more noise.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Higher timeframes tell the story.', screen: 'Chart on 4H' },
        { at: 10.6, text: 'Lower timeframes let you step inside it.' },
        { at: 13.4, text: 'Every timeframe is the same market, zoomed to a different level of detail.' },
        { at: 18.6, text: 'The higher view shows the big-picture direction, with the fewest candles.' },
        { at: 22.6, text: 'Zoom all the way in, and you see every tiny move, and a lot more noise.', screen: 'Switches to 1M; "Same move, more detail"' },
        { at: 28.0, text: 'Every wiggle starts to look urgent.' },
      ],
    },
    {
      type: 'participants', start: 32, end: 52,
      kicker: 'From big picture to detail', title: 'Four zoom levels',
      items: [
        { at: 34.4, kind: 'tf-4H', label: '4H', desc: ['Clearest', 'direction'], color: 'purple' },
        { at: 37.6, kind: 'tf-1H', label: '1H', desc: ['Smaller moves', 'inside it'], color: 'teal' },
        { at: 40.8, kind: 'tf-15M', label: '15M', desc: ['Finer', 'detail'], color: 'peach' },
        { at: 44.0, kind: 'tf-1M', label: '1M', desc: ['Most detail,', 'most noise'], color: 'pink' },
      ],
      lines: [
        { at: 32.4, text: 'Think of it as four zoom levels.', screen: 'Four timeframe cards' },
        { at: 34.4, text: 'The four-hour shows the clearest direction.', screen: '4H card' },
        { at: 37.6, text: 'The one-hour shows the smaller moves inside it.', screen: '1H card' },
        { at: 40.8, text: 'The fifteen-minute gets finer.', screen: '15M card' },
        { at: 44.0, text: 'And the one-minute? The most detail, and the most noise.', screen: '1M card' },
      ],
    },
    {
      type: 'host-hook', start: 52, end: 66, pointAt: 59.4, size: 64,
      kicker: 'Remember this',
      parts: [
        { at: 53.6, text: 'The market doesn’t change when you switch the view.' },
        { at: 59.4, html: '<span class="mark">Your perspective does.</span>' },
      ],
      lines: [
        { at: 52.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 53.6, text: 'The market doesn’t change when you switch the chart view.' },
        { at: 59.4, text: 'Your perspective does.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 66, end: 80,
      kicker: 'Your mission',
      question: { at: 68.4, text: 'If the 1M looks messy and confusing, what should you actually do first?' },
      cta: { at: 74.6, text: 'Let’s find out' },
      lines: [
        { at: 66.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 68.4, text: 'If the one-minute looks messy and confusing, what should you actually do first?', screen: 'Mission question' },
        { at: 74.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
