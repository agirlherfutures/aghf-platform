/**
 * Lesson 10 intro video — "Stop Loss & Take Profit" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-10',
  eyebrow: 'Phase 1 · Section 2 · Lesson 10',
  duration: 88,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'Stop Loss & Take Profit',
      quote: 'Protect your capital first. Always know your exit before your entry.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Ten of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: stop losses, take profits, and why exits come first.' },
      ],
    },
    {
      type: 'exit-plan', start: 8, end: 29,
      kicker: 'Exits before entries',
      beats: { tp: 16.2, sl: 19.6, entry: 24.0 },
      headlines: [
        { at: 8.4, out: 15.8, html: 'Know your exit <span class="mark">before your entry.</span>' },
        { at: 16.0, html: 'Plan it first. <span class="mark">Then</span> enter.' },
      ],
      lines: [
        { at: 8.4, text: 'Protect your capital first.' },
        { at: 10.4, text: 'Always know your exit before your entry.' },
        { at: 13.2, text: 'Before you click buy, you already know two things.' },
        { at: 16.2, text: 'Where you’ll take profit if you’re right.' },
        { at: 19.6, text: 'And where you’ll get out if you’re wrong. That’s your stop loss.' },
        { at: 24.0, text: 'Then, and only then, you enter.' },
      ],
    },
    {
      type: 'fear-drag', start: 29, end: 50,
      kicker: 'Fear kicks in',
      beats: { pull: 31.6, drag: 35.6, stamp: 39.4, snap: 41.6 },
      headlines: [
        { at: 29.4, out: 39.2, html: 'Price pulls back toward your stop…' },
        { at: 39.4, out: 44.4, html: 'Moving it out of fear <span class="mark">defeats its purpose.</span>' },
        { at: 44.6, html: 'Your stop protects <span class="mark">the plan,</span> not your feelings.' },
      ],
      lines: [
        { at: 29.4, text: 'Now, here’s where fear kicks in.' },
        { at: 31.6, text: 'Price pulls back, and gets close to your stop.' },
        { at: 35.0, text: 'The temptation? Drag the stop lower, just to buy some room.' },
        { at: 39.4, text: 'But moving your stop out of fear defeats the reason it exists.' },
        { at: 44.6, text: 'Your stop protects the plan, not your feelings in the moment.' },
      ],
    },
    {
      type: 'tp-hit', start: 50, end: 62,
      kicker: 'Take profit',
      beats: { rise: 52.6, hit: 56.6 },
      headlines: [
        { at: 50.4, html: 'Planned in advance, <span class="mark">not decided in the moment.</span>' },
      ],
      lines: [
        { at: 50.4, text: 'Same with your take profit.' },
        { at: 52.6, text: 'It’s planned in advance, not decided in the moment.' },
        { at: 57.0, text: 'When price reaches it, the plan does its job.' },
      ],
    },
    {
      type: 'host-hook', start: 62, end: 73, pointAt: 68.2,
      kicker: 'Remember this',
      parts: [
        { at: 63.6, text: 'Your stop isn’t punishment.' },
        { at: 65.8, text: 'It isn’t about ego.' },
        { at: 68.2, html: 'It <span class="mark">protects your account.</span>' },
      ],
      lines: [
        { at: 62.4, text: 'Here’s what to remember.' },
        { at: 63.6, text: 'Your stop loss isn’t punishment.' },
        { at: 65.8, text: 'And it isn’t about ego.' },
        { at: 68.2, text: 'It protects your account, and your plan.' },
      ],
    },
    {
      type: 'host-mission', start: 73, end: 88,
      kicker: 'Your mission',
      question: { at: 75.4, text: 'In an uptrend, does your stop belong at a comfortable distance, or where the setup is proven wrong?' },
      cta: { at: 84.0, text: 'Let’s find out' },
      lines: [
        { at: 73.4, text: 'So here’s your mission for this lesson.' },
        { at: 75.4, text: 'In an uptrend, does your stop loss belong at a comfortable distance, or at the point that proves the setup wrong?' },
        { at: 84.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
