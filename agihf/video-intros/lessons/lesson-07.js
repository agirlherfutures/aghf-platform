/**
 * Lesson 7 intro video — "TradingView Basics" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-07',
  eyebrow: 'Phase 1 · Section 2 · Lesson 7',
  duration: 86,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'TradingView Basics',
      quote: 'Your chart is your workspace. Learn it before you try to read it.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Seven of A Girl & Her Futures.' },
        { at: 3.8, text: 'Section Two starts now: let’s set up your chart workspace.' },
      ],
    },
    {
      type: 'declutter', start: 8, end: 30,
      kicker: 'Your workspace', messAt: 12.8, sweepAt: 20.6, levelsAt: 22.6,
      headlines: [
        { at: 8.4, out: 17.4, html: 'Learn your workspace <span class="mark">before you read it.</span>' },
        { at: 17.6, out: 22.4, html: 'More stuff ≠ more clarity.' },
        { at: 22.6, html: 'A few clean levels. <span class="mark">Now you can see the story.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Your chart is your workspace.' },
        { at: 10.4, text: 'Learn it before you try to read it.' },
        { at: 12.8, text: 'A lot of beginners start here: every tool, every indicator, every line.' },
        { at: 17.6, text: 'But more stuff on the chart doesn’t mean more clarity.' },
        { at: 20.6, text: 'So let’s clean it up.' },
        { at: 22.6, text: 'A couple of horizontal levels where price reacted before. That’s it. Now you can actually see the story.' },
      ],
    },
    {
      type: 'timeframe-zoom', start: 30, end: 47, switchAt: 34.4, boxAt: 38.4,
      kicker: 'Timeframes',
      headlines: [
        { at: 30.4, out: 40.8, html: 'Switching timeframes changes <span class="mark">your view.</span>' },
        { at: 41.0, html: 'Perspective, <span class="mark">not a different market.</span>' },
      ],
      lines: [
        { at: 30.4, text: 'Next, timeframes.' },
        { at: 32.2, text: 'Switching from the one-hour to the five-minute changes what you’re looking at.' },
        { at: 37.6, text: 'Not what’s actually happening in the market.' },
        { at: 41.0, text: 'It’s perspective, not a different market.' },
      ],
    },
    {
      type: 'participants', start: 47, end: 66,
      kicker: 'The workspace mindset',
      title: 'Keep it clean',
      items: [
        { at: 49.4, kind: 'read', label: 'Read', desc: ['Show what price', 'is doing'], color: 'teal' },
        { at: 53.4, kind: 'zoom', label: 'Zoom', desc: ['Change your', 'perspective'], color: 'purple' },
        { at: 56.8, kind: 'mark', label: 'Mark', desc: ['A few clean', 'levels'], color: 'pink' },
        { at: 60.6, kind: 'simplify', label: 'Simplify', desc: ['Not helping?', 'Take it off.'], color: 'peach' },
      ],
      lines: [
        { at: 47.4, text: 'Here’s the workspace mindset.' },
        { at: 49.4, text: 'Read: your chart’s job is showing you what price is doing.' },
        { at: 53.4, text: 'Zoom: timeframes change your perspective.' },
        { at: 56.8, text: 'Mark: a few clean levels beat ten drawing tools.' },
        { at: 60.6, text: 'Simplify: if it doesn’t help you read price, take it off.' },
      ],
    },
    {
      type: 'host-hook', start: 66, end: 75, pointAt: 70.0,
      kicker: 'Remember this',
      parts: [
        { at: 67.6, text: 'You don’t need every feature.' },
        { at: 70.0, html: 'A few tools used clearly <span class="mark">beats a messy chart.</span>' },
      ],
      lines: [
        { at: 66.4, text: 'Here’s what to remember.' },
        { at: 67.6, text: 'You don’t need every feature.' },
        { at: 70.0, text: 'A few tools used clearly beats a messy chart.' },
      ],
    },
    {
      type: 'host-mission', start: 75, end: 86,
      kicker: 'Your mission',
      question: { at: 77.4, text: 'Does adding more drawing tools to a chart make it easier to read, or harder?' },
      cta: { at: 82.6, text: 'Let’s find out' },
      lines: [
        { at: 75.4, text: 'So here’s your mission for this lesson.' },
        { at: 77.4, text: 'Does adding more drawing tools to a chart make it easier to read, or harder?' },
        { at: 82.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
