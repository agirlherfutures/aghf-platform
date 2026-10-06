/**
 * Phase 2 · Section 5 · Lesson 12 intro video — "Market Structure Shift: MSS"
 * Scenes: s5-block-tower (wobbles vs pulling the supporting block), s5-traffic (amber light: change information, not an entry).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-12',
  eyebrow: 'Phase 2 · Section 5 · Lesson 12',
  duration: 82,
  sources: 'From Section 5, Lesson 12 ("Market Structure Shift: MSS"): price moving down is not structure changing, breaking a tiny internal low is not necessarily a shift, a close through the relevant supporting swing against the prior progression is a potential MSS, MSS is change information ("the word may matters"), and Dayli\'s quote "MSS tells you the old structure may no longer be behaving the same way. It does NOT mean: ENTER IMMEDIATELY."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Market Structure Shift: MSS',
      quote: 'MSS is change information, not an entry signal.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Twelve: Market Structure Shift, or MSS.', screen: 'Aristella waves; title *Market Structure Shift: MSS*' },
        { at: 4.6, text: 'Price moving down is not the same as structure changing.' },
      ],
    },
    {
      type: 's5-block-tower', start: 8, end: 35, beats: { sup: 11.6, wob: 16.6, int: 23.0, key: 29.0 },
      kicker: 'What actually holds it up?',
      headlines: [
        { at: 8.4, out: 28.6, html: 'Moving lower <span class="mark">isn’t</span> a shift.' },
        { at: 28.8, html: 'The supporting low gives way: <span class="mark">potential MSS.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Think of bullish structure as a block tower.', screen: 'A block tower and a matching chart' },
        { at: 11.4, text: 'This block is the supporting low. It’s holding the whole thing up.', screen: '"supporting low"' },
        { at: 16.4, text: 'Price starts moving lower. The tower wobbles. Is that a shift? Not yet.', screen: '"wobble ≠ shift"' },
        { at: 22.6, text: 'Now a tiny internal low breaks. Still standing. The supporting low is intact.', screen: 'A small block slides out; "still standing ✓"' },
        { at: 28.8, text: 'Then price closes through the supporting low. That’s a potential MSS.', screen: 'The teal block is pulled; the tower leans; "potential MSS"' },
      ],
    },
    {
      type: 's5-traffic', start: 35, end: 59, beats: { amber: 38.0, may: 42.2, notrev: 46.6, rev: 49.0, guard: 50.6 },
      kicker: 'What an MSS tells you',
      headlines: [
        { at: 35.4, out: 48.6, html: 'MSS is <span class="mark">change information.</span>' },
        { at: 48.8, html: 'Not an <span class="mark">entry signal.</span>' },
      ],
      lines: [
        { at: 35.4, text: 'So what is an MSS, really? Think of a traffic light turning amber.', screen: 'A street; the light turns amber' },
        { at: 41.0, text: 'It tells you something may be changing. That’s change information.', screen: '"MSS = change information", "may be transitioning"' },
        { at: 46.4, text: 'It’s not a confirmed reversal.', screen: '"≠ confirmed reversal"' },
        { at: 49.0, text: 'And it’s definitely not an instruction to hit the gas and enter.', screen: 'The car revs; a crossing guard holds up WAIT' },
        { at: 54.4, text: 'The word may matters.' },
      ],
    },
    {
      type: 'host-hook', start: 59, end: 70, pointAt: 64.6, size: 54,
      kicker: 'Dayli says',
      parts: [
        { at: 60.6, text: 'MSS tells you the old structure may no longer be behaving the same way.' },
        { at: 64.6, html: 'It does <span class="mark">not</span> mean enter immediately. 🚫' },
      ],
      lines: [
        { at: 59.4, text: 'Dayli says it best.', screen: 'Aristella thinks' },
        { at: 60.6, text: 'MSS tells you the old structure may no longer be behaving the same way. It does not mean enter immediately.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 70, end: 82,
      kicker: 'Your mission',
      question: { at: 72.0, text: 'If bullish structure starts moving lower and breaks a small low, has the market structure shifted?' },
      cta: { at: 78.6, text: 'Let’s find out' },
      lines: [
        { at: 70.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 72.0, text: 'If bullish structure starts moving lower and breaks a small low, has the market structure shifted?', screen: 'Mission question' },
        { at: 78.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
