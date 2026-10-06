/**
 * Phase 2 · Section 5 · Lesson 16 intro video — "False Breaks & Fakeouts"
 * Scenes: s5-cat-shelf (a cat gets above the shelf, then slides back off), s5-cctv (the footage only shows price).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-16',
  eyebrow: 'Phase 2 · Section 5 · Lesson 16',
  duration: 80,
  sources: 'From Section 5, Lesson 16 ("False Breaks & Fakeouts"): resistance at 20,000 with price at 19,990, then 20,005 ("breakout confirmed forever? No."), then 19,985 ("price moved above the level and failed to hold above it"), failed breakout / false break behavior, objective vs. assumption ("Big money trapped retail" vs. "Price moved above the prior high and then returned below it"), and "Observation before interpretation."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'False Breaks & Fakeouts',
      quote: 'Observation before interpretation.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Sixteen: False Breaks and Fakeouts.', screen: 'Aristella waves; title *False Breaks & Fakeouts*' },
        { at: 4.6, text: 'Let’s describe what price actually does.' },
      ],
    },
    {
      type: 's5-cat-shelf', start: 8, end: 34, beats: { jump: 14.2, forever: 18.6, slip: 24.0, fail: 27.8, fb: 31.4 },
      kicker: 'Watch it play out',
      headlines: [
        { at: 8.4, out: 23.6, html: 'Above the level. <span class="mark">Now what?</span>' },
        { at: 23.8, html: 'Moved above. <span class="mark">Failed to hold.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Resistance sits at twenty thousand. Our cat is at nineteen thousand nine ninety.', screen: 'A kitchen shelf at 20,000; price 19,990' },
        { at: 14.0, text: 'Jump! Twenty thousand and five. The candle closed above.', screen: 'The cat lands on the shelf; "20,005"' },
        { at: 18.6, text: 'Breakout confirmed forever? No. What happens next still matters.', screen: '"breakout confirmed forever?"' },
        { at: 24.0, text: 'Next candle: nineteen thousand nine eighty-five.', screen: 'The cat slides off; "19,985"' },
        { at: 27.6, text: 'Price moved above the level and failed to hold above it. That’s false break behavior.', screen: '"moved above, failed to hold", "false break behavior"' },
      ],
    },
    {
      type: 's5-cctv', start: 34, end: 58, beats: { g1: 36.8, foot: 40.0, assume: 44.2, obs: 46.8, parrot2: 52.8 },
      kicker: 'Objective vs. assumption',
      headlines: [
        { at: 34.4, out: 46.4, html: 'Can the chart show <span class="mark">who</span> did it?' },
        { at: 46.6, html: 'Describe <span class="mark">what the chart shows.</span>' },
      ],
      lines: [
        { at: 34.4, text: 'Now, how would you describe that?', screen: 'A security room; the footage shows only price' },
        { at: 36.8, text: 'One option: big money trapped retail.', screen: '"Big money trapped retail!" The parrot repeats it' },
        { at: 39.6, text: 'But look at the footage. The chart can’t show who traded, or why. That’s an assumption.', screen: '"only price on camera"; "ASSUMPTION" stamp' },
        { at: 46.8, text: 'The other option: price moved above the prior high, then returned below it.', screen: '"Above the high, then back below."' },
        { at: 52.6, text: 'That’s what the chart actually shows.', screen: '"OBSERVATION ✓"; the parrot learns a new word' },
      ],
    },
    {
      type: 'host-hook', start: 58, end: 68, pointAt: 61.0, size: 80,
      kicker: 'Dayli says',
      parts: [
        { at: 59.6, text: 'Observation' },
        { at: 61.0, html: '<span class="mark">before interpretation.</span> 🦜' },
      ],
      lines: [
        { at: 58.4, text: 'So here’s the rule.', screen: 'Aristella thinks' },
        { at: 59.6, text: 'Observation before interpretation.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 68, end: 80,
      kicker: 'Your mission',
      question: { at: 70.0, text: 'Price closed above resistance. Is the breakout confirmed?' },
      cta: { at: 76.0, text: 'Let’s find out' },
      lines: [
        { at: 68.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 70.0, text: 'Price closed above resistance. Is the breakout confirmed?', screen: 'Mission question' },
        { at: 76.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
