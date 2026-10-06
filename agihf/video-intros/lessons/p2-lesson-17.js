/**
 * Phase 2 · Section 5 · Lesson 17 intro video: "Structural Invalidation & The New Story"
 * Scenes: s5-bridge (the supporting pillar gives way; now what?), s5-map-update (a cartographer redraws the map; teaser for Section 6).
 */
window.LESSON_VIDEO = {
  slug: 'p2-lesson-17',
  eyebrow: 'Phase 2 · Section 5 · Lesson 17',
  duration: 86,
  sources: 'From Section 5, Lesson 17 ("Structural Invalidation & The New Story"): which low supports the bullish story, a close through it materially challenges the old story, "Now what?" (not short immediately, not ignore it, not move the level: watch what price builds next), "Invalidation ≠ instant opposite bias," updating the map to the swing that is now more relevant, and "Your chart updates because price updates." Closes the section and points ahead to Section 6: Reading Key Levels (Lesson 18, "Support & Resistance").',
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 5: Breaks, Shifts & Fakeouts',
      title: 'Structural Invalidation & The New Story',
      quote: 'Your chart updates because price updates.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Seventeen: Structural Invalidation and The New Story.', screen: 'Aristella waves; title *Structural Invalidation & The New Story*' },
        { at: 5.2, text: 'When the story changes, so does your chart.' },
      ],
    },
    {
      type: 's5-bridge', start: 8, end: 37, beats: { walk: 8.6, sup: 12.2, close: 16.8, now: 22.6, opts: 23.4, no: 28.0, inv: 31.6 },
      kicker: 'The story changes',
      headlines: [
        { at: 8.4, out: 22.2, html: 'Which low holds the <span class="mark">story</span> up?' },
        { at: 22.4, html: 'Now what? <span class="mark">Watch what price builds.</span>' },
      ],
      lines: [
        { at: 8.4, text: 'Your bullish story is a bridge. HH, HL, HH.', screen: 'A bridge shaped like bullish structure; a traveller walks it' },
        { at: 12.0, text: 'This pillar, the higher low, is the one holding the story up.', screen: '"supporting HL"' },
        { at: 16.6, text: 'Then price closes through it. The old bullish story is materially challenged.', screen: 'The pillar crumbles; the bridge sags' },
        { at: 22.6, text: 'So, now what? Short immediately? Ignore it? Move the level?', screen: 'Signpost options' },
        { at: 28.0, text: 'None of those. Watch what price builds next.', screen: 'Three crossed out; "Watch what builds" ✓' },
        { at: 31.6, text: 'Invalidation does not mean an instant opposite bias.', screen: '"invalidation ≠ instant opposite bias"' },
      ],
    },
    {
      type: 's5-map-update', start: 37, end: 63, beats: { pigeon: 39.4, update: 42.0, cross: 42.8, newflag: 50.2, next: 59.0 },
      kicker: 'Update the map',
      headlines: [
        { at: 37.4, out: 53.8, html: 'Price updates. <span class="mark">So does your map.</span>' },
        { at: 54.0, html: 'Levels don’t stay relevant <span class="mark">forever.</span>' },
      ],
      lines: [
        { at: 37.4, text: 'Now let’s update the map.', screen: 'A cartographer and a parchment map of the swings' },
        { at: 39.4, text: 'A pigeon brings news: price closed through the old higher low.', screen: 'The pigeon lands; the old HL flag is crossed out' },
        { at: 44.6, text: 'Then it builds new swings: a lower high, and a lower low.', screen: '"LH", "LL"' },
        { at: 50.0, text: 'That new lower high is the swing that matters more now.', screen: 'A new flag; "matters more now"' },
        { at: 54.4, text: 'A level isn’t important forever just because you marked it.' },
        { at: 59.0, text: 'Next up, Section Six: Reading Key Levels.', screen: '"Next: Section 6 · Reading Key Levels →"' },
      ],
    },
    {
      type: 'host-hook', start: 63, end: 73, pointAt: 65.8, size: 72,
      kicker: 'Dayli says',
      parts: [
        { at: 64.4, text: 'Your chart updates' },
        { at: 65.8, html: '<span class="mark">because price updates.</span> 🗺️' },
      ],
      lines: [
        { at: 63.4, text: 'So remember.', screen: 'Aristella thinks' },
        { at: 64.4, text: 'Your chart updates because price updates.', screen: 'Aristella points' },
      ],
    },
    {
      type: 'host-mission', start: 73, end: 86,
      kicker: 'Your mission',
      question: { at: 75.0, text: 'The level holding up your bullish story just broke. Now what?' },
      cta: { at: 81.6, text: 'Let’s find out' },
      lines: [
        { at: 73.4, text: 'Here’s your mission.', screen: '"Your mission"' },
        { at: 75.0, text: 'The level holding up your bullish story just broke. Now what?', screen: 'Mission question' },
        { at: 81.6, text: 'Let’s find out.', screen: 'Aristella cheers; "Let\'s find out →"' },
      ],
    },
  ],
};
