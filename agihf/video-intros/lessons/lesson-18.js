/**
 * Lesson 18 intro video — "Multi-Timeframe Thinking" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-18',
  eyebrow: 'Phase 1 · Section 3 · Lesson 18',
  duration: 82,
  sources: 'Everything is pulled from Lesson 18\'s existing content (`agihf/lessons-data/p1-18.json`): the hook, "every timeframe has a job," the 4H → 1H → 15M → 1M zoom order, "bigger picture, then structure, then detail," the remember line, Dayli\'s "different parts of the same story" note, and the mission question. The title-card quote is Lesson 18\'s curriculum quote.',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 3: Candles & Timeframes',
      title: 'Multi-Timeframe Thinking',
      quote: 'Higher timeframes give you context. Lower timeframes give you detail.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Eighteen of A Girl & Her Futures.', screen: 'Aristella waves; title *Multi-Timeframe Thinking*' },
        { at: 3.8, text: 'Today: how timeframes work together.' },
      ],
    },
    {
      type: 'participants', start: 8, end: 34,
      kicker: 'Every timeframe has a job', title: 'Biggest picture first, detail last',
      items: [
        { at: 17.2, kind: 'tf-4H', label: '4H', desc: ['Biggest', 'picture'], color: 'purple' },
        { at: 20.4, kind: 'tf-1H', label: '1H', desc: ['Narrower', 'structure'], color: 'teal' },
        { at: 23.6, kind: 'tf-15M', label: '15M', desc: ['Finer', 'detail'], color: 'peach' },
        { at: 26.8, kind: 'tf-1M', label: '1M', desc: ['Most', 'zoomed in'], color: 'pink' },
      ],
      lines: [
        { at: 8.4, text: 'Higher timeframes give you context. Lower timeframes reveal detail.', screen: '"Biggest picture first, detail last"' },
        { at: 13.0, text: 'Here’s the general order to check them in.' },
        { at: 17.2, text: 'The four-hour: the biggest picture.', screen: '4H card' },
        { at: 20.4, text: 'The one-hour: narrower structure.', screen: '1H card' },
        { at: 23.6, text: 'The fifteen-minute: finer detail.', screen: '15M card' },
        { at: 26.8, text: 'And the one-minute: the most zoomed in.', screen: '1M card' },
      ],
    },
    {
      type: 'timeframe-zoom', start: 34, end: 52, switchAt: 40.4, boxAt: 43.6,
      tfs: ['1M', '15M', '1H', '4H'], from: '4H', to: '1M', boxText: 'Inside the bigger picture',
      kicker: 'Different parts of the same story',
      headlines: [
        { at: 34.4, out: 46.8, html: 'Zooming in changes <span class="mark">what you can see.</span>' },
        { at: 47.0, html: 'Not <span class="mark">what’s actually happening.</span>' },
      ],
      lines: [
        { at: 34.4, text: 'Each one tells a different part of the same story.', screen: 'Chart on 4H' },
        { at: 37.6, text: 'Bigger picture, then structure, then detail. In that order.' },
        { at: 40.4, text: 'When you zoom in, you see the smaller moves inside the bigger one.', screen: 'Switches to 1M; "Inside the bigger picture"' },
        { at: 47.0, text: 'Zooming in changes what you can see, not what’s actually happening.' },
      ],
    },
    {
      type: 'host-hook', start: 52, end: 67, pointAt: 60.0, size: 62,
      kicker: 'Remember this',
      parts: [
        { at: 53.6, text: 'You’ll learn the exact job of each timeframe later.' },
        { at: 57.4, text: 'For now:' },
        { at: 60.0, html: 'Different timeframes, <span class="mark">different parts of the same story.</span>' },
      ],
      lines: [
        { at: 52.4, text: 'Here’s what to remember.', screen: 'Aristella thinks' },
        { at: 53.6, text: 'Later in the Academy, you’ll learn exactly how AGHF gives each timeframe a job.' },
        { at: 57.4, text: 'For now, just notice this:' },
        { at: 60.0, text: 'Different timeframes, different parts of the same story.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 67, end: 82,
      kicker: 'Your mission',
      question: { at: 69.4, text: 'What’s the risk in forming your entire directional bias off the 1-minute chart alone?' },
      cta: { at: 76.2, text: 'Let’s find out' },
      lines: [
        { at: 67.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 69.4, text: 'What’s the risk in forming your entire directional bias off the one-minute chart alone?', screen: 'Mission question' },
        { at: 76.2, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
