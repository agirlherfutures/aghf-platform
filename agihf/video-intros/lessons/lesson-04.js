/**
 * Lesson 4 intro video — "Contracts & Instruments" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-04',
  eyebrow: 'Phase 1 · Section 1 · Lesson 4',
  duration: 87,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Phase 1: Welcome to the Market',
      title: 'Contracts & Instruments',
      quote: 'MNQ. MGC. Know what you’re trading before you trade it.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Four of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today we’re getting clear on contracts and instruments.' },
      ],
    },
    {
      type: 'garage', start: 8, end: 21.5,
      kicker: 'Know what you’re trading',
      headlines: [
        { at: 8.4, out: 12.6, html: 'MNQ isn’t just a ticker on your screen.' },
        { at: 12.8, html: 'The instrument is <span class="mark">the vehicle.</span>' },
      ],
      items: [
        { at: 13.4, kind: 'car', plate: 'MNQ', name: 'Micro Nasdaq', x: 300 },
        { at: 15.0, kind: 'truck', plate: 'NQ', name: 'Nasdaq', x: 740 },
        { at: 16.6, kind: 'gold', plate: 'MGC', name: 'Micro Gold', x: 1180 },
        { at: 18.2, kind: 'bus', plate: 'ES', name: 'E-mini S&P 500', x: 1610 },
      ],
      lines: [
        { at: 8.4, text: 'MNQ isn’t just a ticker on your screen.' },
        { at: 10.6, text: 'Know what you’re actually trading.' },
        { at: 12.8, text: 'Think of it like this: the instrument is the vehicle.' },
        { at: 16.4, text: 'MNQ, NQ, MGC, ES: each one tells you which market you’re in.' },
      ],
    },
    {
      type: 'convoy', start: 21.5, end: 32.5, oneAt: 22.0, threeAt: 25.6,
      kicker: 'Your size',
      headlines: [
        { at: 22.0, out: 27.0, html: 'Contract count is <span class="mark">how many</span> you’re driving.' },
        { at: 27.2, html: 'Same market. <span class="mark">Bigger size.</span>' },
      ],
      lines: [
        { at: 21.9, text: 'And your contract count?' },
        { at: 23.4, text: 'That’s how many of that vehicle you’re driving.' },
        { at: 26.4, text: 'Three MNQ contracts is still MNQ.' },
        { at: 29.0, text: 'What changed is your size.' },
      ],
    },
    {
      type: 'point-value', start: 32.5, end: 53.5,
      kicker: 'Where the dollars attach',
      moveAt: 34.6, mnqAt: 37.0, nqAt: 40.4, timesAt: 44.8,
      headlines: [
        { at: 33.0, out: 44.6, html: 'The same 10-point move…' },
        { at: 44.8, html: 'Same chart. <span class="mark">Ten times the weight.</span>' },
      ],
      lines: [
        { at: 32.9, text: 'Here’s where it gets real.' },
        { at: 34.6, text: 'Say price moves 10 points.' },
        { at: 37.0, text: 'On one MNQ contract, that’s twenty dollars.' },
        { at: 40.4, text: 'On one NQ contract, that same move is two hundred dollars.' },
        { at: 44.8, text: 'Same chart. Ten times the weight.' },
        { at: 47.8, text: 'That’s why size and instrument matter just as much as the setup.' },
      ],
    },
    {
      type: 'lift', start: 53.5, end: 64, heavyAt: 54.2, lightAt: 58.6,
      kicker: 'Dayli says',
      headlines: [
        { at: 54.0, out: 58.4, html: 'Not a strategy problem. A <span class="mark">size problem.</span>' },
        { at: 58.6, html: 'Micros keep you <span class="mark">teachable.</span>' },
      ],
      lines: [
        { at: 53.9, text: 'A lot of traders don’t have a strategy problem first.' },
        { at: 56.6, text: 'They have a size problem.' },
        { at: 58.6, text: 'Micros keep you teachable while you’re still learning.' },
      ],
    },
    {
      type: 'participants', start: 64, end: 74,
      kicker: 'Remember this',
      title: 'Know all three',
      items: [
        { at: 66.0, kind: 'market', label: 'Instrument', desc: ['What market', 'am I in?'], color: 'purple' },
        { at: 67.8, kind: 'outcome', label: 'Value', desc: ['What is one', 'point worth?'], color: 'peach' },
        { at: 69.6, kind: 'risk', label: 'Risk', desc: ['What can this', 'cost me?'], color: 'pink' },
      ],
      lines: [
        { at: 64.4, text: 'Here’s what to remember.' },
        { at: 66.0, text: 'Know the instrument.' },
        { at: 67.8, text: 'Know its value.' },
        { at: 69.6, text: 'Know your risk.' },
      ],
    },
    {
      type: 'host-mission', start: 74, end: 87,
      kicker: 'Your mission',
      question: { at: 76.4, text: 'If someone switches from 1 MNQ contract to 1 NQ contract, does their risk stay the same?' },
      cta: { at: 82.6, text: 'Let’s find out' },
      lines: [
        { at: 74.4, text: 'So here’s your mission for this lesson.' },
        { at: 76.4, text: 'If someone switches from 1 MNQ contract to 1 NQ contract, does their risk stay the same?' },
        { at: 82.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
