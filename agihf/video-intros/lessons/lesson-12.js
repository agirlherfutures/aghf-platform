/**
 * Lesson 12 intro video — "Trading Sessions & Market Hours" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-12',
  eyebrow: 'Phase 1 · Section 2 · Lesson 12',
  duration: 87,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'Trading Sessions & Market Hours',
      quote: 'Asia. London. New York. The clock changes the chart.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Twelve of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: trading sessions, and why the clock matters.' },
      ],
    },
    {
      type: 'sessions', start: 8, end: 33, asia: 17.2, london: 21.0, ny: 25.6,
      kicker: 'Three sessions, three personalities',
      headlines: [
        { at: 8.4, out: 17.0, html: 'Different sessions, <span class="mark">different behavior.</span>' },
        { at: 17.2, html: 'Not “better.” <span class="mark">Just different.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Different sessions, different behavior.' },
        { at: 10.6, text: 'Know which one you’re looking at.' },
        { at: 12.8, text: 'The same chart behaves differently depending on what time it is.' },
        { at: 17.2, text: 'Asia tends to be quiet and range-bound.' },
        { at: 21.0, text: 'London often brings the first real expansion of the day.' },
        { at: 25.6, text: 'And the New York open? Usually the highest volume, and the sharpest moves.' },
      ],
    },
    {
      type: 'crowd-rooms', start: 33, end: 51, empty: 39.4, packed: 42.4,
      kicker: 'Why it matters',
      headlines: [
        { at: 35.4, out: 45.8, html: 'Volume = how many people <span class="mark">actually showed up.</span>' },
        { at: 46.0, html: 'Same pattern. <span class="mark">Very different crowd.</span>' },
      ],
      lines: [
        { at: 33.4, text: 'Now, here’s why that matters.' },
        { at: 35.4, text: 'Volume tells you how many people actually showed up.' },
        { at: 39.4, text: 'Overnight, the room can be pretty empty.' },
        { at: 42.4, text: 'At the New York open, it’s packed.' },
        { at: 46.0, text: 'Same chart pattern. Very different crowd.' },
      ],
    },
    {
      type: 'clock24', start: 51, end: 62,
      kicker: 'Know your session',
      headlines: [
        { at: 51.4, out: 55.8, html: 'Check the clock <span class="mark">before you read the chart.</span>' },
        { at: 56.0, html: 'New York = <span class="mark">US market hours and major news.</span>' },
      ],
      lines: [
        { at: 51.4, text: 'So always know your session.' },
        { at: 53.2, text: 'Check the clock before you read the chart.' },
        { at: 56.0, text: 'New York lines up with US stock market hours, and major news.' },
      ],
    },
    {
      type: 'host-hook', start: 62, end: 73, pointAt: 66.4, size: 68,
      kicker: 'Remember this',
      parts: [
        { at: 63.6, text: 'Trade whichever session you choose.' },
        { at: 66.4, html: 'Just know <span class="mark">which session you’re looking at.</span>' },
      ],
      lines: [
        { at: 62.4, text: 'Here’s what to remember.' },
        { at: 63.6, text: 'I’m not telling you to only trade one session.' },
        { at: 66.4, text: 'I’m telling you to know which session you’re looking at.' },
      ],
    },
    {
      type: 'host-mission', start: 73, end: 87,
      kicker: 'Your mission',
      question: { at: 75.4, text: 'Does a break of structure mean the same thing overnight on thin volume as it does at the New York open?' },
      cta: { at: 83.6, text: 'Let’s find out' },
      lines: [
        { at: 73.4, text: 'So here’s your mission for this lesson.' },
        { at: 75.4, text: 'Does a break of structure mean the same thing overnight on thin volume as it does at the New York open?' },
        { at: 83.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
