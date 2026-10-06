/**
 * Phase 2 · Section 5 · Lesson 13 intro video — "Continuation vs. Reversal"
 * Scenes: s5-game-show (three honest reads on a quiz stage), s5-owl-court (an owl judge waits for evidence).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-13',
  eyebrow: 'Phase 2 · Section 5 · Lesson 13',
  duration: 80,
  sources: 'From Section 5, Lesson 13 ("Continuation vs. Reversal"): not every pullback is a reversal, the three honest reads (continuation, potential shift, not enough information), a close through the prior high gives continuation information and a close through the supporting swing gives change information, and "I don\'t know yet is sometimes the most technically correct answer."',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Continuation vs. Reversal',
      quote: 'I don’t know yet is sometimes the most technically correct answer.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Thirteen: Continuation versus Reversal.', screen: 'Aristella waves; title *Continuation vs. Reversal*' },
        { at: 4.6, text: 'Not every pullback is a reversal.' },
      ],
    },
    {
      type: 's5-game-show', start: 8, end: 35, beats: { pull: 11.6, guess: 14.6, buzz: 16.0, nei: 20.6, cont: 24.6, shift: 30.0 },
      kicker: 'Three honest reads',
      headlines: [
        { at: 8.4, out: 24.2, html: 'A pullback alone is <span class="mark">not a reversal.</span>' },
        { at: 24.4, html: 'Let the <span class="mark">levels</span> pick the answer.' },
      ],
      lines: [
        { at: 8.4, text: 'Welcome to the game show of honest reads.', screen: 'A quiz stage, three podiums, a chart on the big screen' },
        { at: 11.4, text: 'Price pulls back in a bullish structure. Is it a reversal?', screen: 'The contestant shouts "Reversal!"' },
        { at: 15.8, text: 'Buzz! Not so fast. Neither key level has broken.', screen: '"BZZT!"' },
        { at: 20.4, text: 'The honest answer: not enough information yet.', screen: '"Not enough info" lights up' },
        { at: 24.4, text: 'Then price closes above the prior high. Now that’s continuation information.', screen: '"Continuation" lights up' },
        { at: 29.8, text: 'A close through the supporting low instead would be a potential shift.', screen: 'A dashed "or…" path; "Potential shift"' },
      ],
    },
    {
      type: 's5-owl-court', start: 35, end: 58, beats: { shout: 38.8, notev: 43.0, rules: 46.8, verdict: 51.0 },
      kicker: 'Be the judge',
      headlines: [
        { at: 35.4, out: 50.6, html: 'Where’s the <span class="mark">evidence?</span>' },
        { at: 50.8, html: 'An honest verdict: <span class="mark">I don’t know yet.</span>' },
      ],
      lines: [
        { at: 35.4, text: 'Think of yourself as the judge, not the lawyer.', screen: 'An owl judge in a courtroom' },
        { at: 38.8, text: 'The lawyer shouts: it pulled back, so it’s a reversal!', screen: '"It pulled back! Reversal!"' },
        { at: 43.0, text: 'But a pullback alone isn’t evidence of a reversal.', screen: 'Gavel; "a pullback ≠ evidence"' },
        { at: 46.8, text: 'The evidence is which level price actually closes through.', screen: 'Rules appear on the evidence chart' },
        { at: 51.0, text: 'Until then, the honest verdict is: I don’t know yet.', screen: 'Verdict scroll: "I don’t know yet"' },
      ],
    },
    {
      type: 'host-hook', start: 58, end: 68, pointAt: 61.4, size: 64,
      kicker: 'Dayli says',
      parts: [
        { at: 59.6, text: '“I don’t know yet” is sometimes' },
        { at: 61.4, html: 'the most <span class="mark">technically correct</span> answer. 🦉' },
      ],
      lines: [
        { at: 58.4, text: 'Here’s the big takeaway.', screen: 'Aristella thinks' },
        { at: 59.6, text: 'I don’t know yet is sometimes the most technically correct answer.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 68, end: 80,
      kicker: 'Your mission',
      question: { at: 70.0, text: 'Price is pulling back in a bullish structure. Is it a reversal?' },
      cta: { at: 76.0, text: 'Let’s find out' },
      lines: [
        { at: 68.4, text: 'So here’s your mission for this lesson.', screen: '"Your mission"' },
        { at: 70.0, text: 'Price is pulling back in a bullish structure. Is it a reversal?', screen: 'Mission question' },
        { at: 76.0, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
