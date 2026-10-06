/**
 * Phase 2 · Section 5 · Lesson 14 intro video — "Retracement vs. Reversal"
 * Scenes: s5-circus-net (the safety net holds vs tears), s5-train (walking backward on a forward-moving train).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-14',
  eyebrow: 'Phase 2 · Section 5 · Lesson 14',
  duration: 82,
  sources: 'From Section 5, Lesson 14 ("Retracement vs. Reversal"): Scenario A (a big move against the structure while the supporting swing holds: possible retracement), Scenario B (the supporting swing breaks and a lower high and lower low form: potential reversal / structural transition), "current move ≠ larger structure," and "Levels decide it. Not candle color."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Retracement vs. Reversal',
      quote: 'Levels decide it. Not candle color.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Fourteen: Retracement versus Reversal.', screen: 'Aristella waves; title *Retracement vs. Reversal*' },
        { at: 4.6, text: 'A big move down isn’t automatically a reversal.' },
      ],
    },
    {
      type: 's5-circus-net', start: 8, end: 36, beats: { fallA: 10.4, net: 13.6, holds: 19.6, resetB: 24.2, fallB: 25.6, rev: 32.6 },
      kicker: 'Same drop. Two endings.',
      headlines: [
        { at: 8.4, out: 23.8, html: 'Scenario A: <span class="mark">the net holds.</span>' },
        { at: 24.0, html: 'Scenario B: <span class="mark">the net tears.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Scenario A. Our acrobat takes a big drop. Lots of red candles.', screen: 'The acrobat leaps from the platform' },
        { at: 13.4, text: 'But the net, the supporting higher low, holds. Price never closes through it.', screen: '"supporting HL"' },
        { at: 19.4, text: 'She bounces back up. That reads as a possible retracement.', screen: '"net holds: retracement"' },
        { at: 24.4, text: 'Scenario B. Same drop. This time price closes through the supporting low.', screen: 'The net tears' },
        { at: 30.2, text: 'Then it builds a lower high and a lower low. A potential reversal.', screen: '"LH", "LL", "potential reversal"' },
      ],
    },
    {
      type: 's5-train', start: 36, end: 60, beats: { walk: 37.4, red: 49.4, levels: 53.6 },
      kicker: 'Keep these separate',
      headlines: [
        { at: 36.4, out: 54.8, html: 'Current move <span class="mark">≠ larger structure.</span>' },
        { at: 55.0, html: 'Levels decide it. <span class="mark">Not candle color.</span>' },
      ],
      lines: [
        { at: 36.4, text: 'Now picture walking toward the back of a moving train.', screen: 'A train; a passenger walks left inside' },
        { at: 40.4, text: 'You’re moving backward. The train is still heading forward.', screen: '"the train: larger structure", "you: current move"' },
        { at: 45.0, text: 'That’s the current move versus the larger structure.' },
        { at: 49.4, text: 'Red candles show the current move. They don’t tell you the structure changed.', screen: 'She holds a red candle' },
        { at: 55.2, text: 'Only the levels can tell you that.', screen: 'A level post rolls by: "supporting HL: intact ✓"' },
      ],
    },
    {
      type: 'host-hook', start: 60, end: 70, pointAt: 62.8, size: 72,
      kicker: 'Dayli says',
      parts: [
        { at: 61.2, text: 'Levels decide it.' },
        { at: 62.8, html: '<span class="mark">Not candle color.</span> 🎪' },
      ],
      lines: [
        { at: 60.4, text: 'So remember.', screen: 'Aristella thinks' },
        { at: 61.4, text: 'Levels decide it. Not candle color.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 70, end: 82,
      kicker: 'Your mission',
      question: { at: 72.0, text: 'Price dropped hard. Retracement or reversal?' },
      cta: { at: 77.6, text: 'Let’s find out' },
      lines: [
        { at: 70.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 72.0, text: 'Price dropped hard. Retracement or reversal?', screen: 'Mission question' },
        { at: 77.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
