/**
 * Lesson 1 intro video — "What Even Is Trading?" (illustrated version)
 *
 * Every time is in seconds from the start of the video. Each scene's
 * `lines` are the narration script; each line's `at` is when the
 * narrator starts reading it (the captions version shows these live).
 * Illustrated scene types live in scenes-illustrated.js; artwork in illustrations.js.
 */
window.LESSON_VIDEO = {
  slug: 'lesson-01',
  eyebrow: 'Phase 1 · Section 1 · Lesson 1',
  duration: 90,
  scenes: [
    {
      type: 'host-title', start: 0, end: 10, nameTag: true, nameTagAt: 3.6,
      phase: 'Phase 1: Welcome to the Market',
      title: 'What Even Is Trading?',
      quote: 'Candles are just storytelling. They’re showing you who’s winning right now.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson One of A Girl & Her Futures.' },
        { at: 3.6, text: 'Meet Aristella. She’ll be your guide through every lesson.' },
        { at: 7.0, text: 'Today’s question: what even is trading?' },
      ],
    },
    {
      type: 'crystal-surf', start: 10, end: 20,
      kicker: 'First things first', lineA: 12.4, strikeAt: 13.4, surfAt: 15.0,
      lines: [
        { at: 10.4, text: 'Here’s the first thing to know.' },
        { at: 12.4, text: 'Trading isn’t predicting the future.' },
        { at: 15.0, text: 'You’re participating in price movement.' },
      ],
    },
    {
      type: 'sides', start: 20, end: 36,
      kicker: 'Pick a side',
      title: 'Every trade takes a position',
      long: { at: 22.6, label: 'Long', desc: 'You profit if price rises' },
      short: { at: 26.4, label: 'Short', desc: 'You profit if price falls' },
      footer: { at: 30.6, text: 'Futures let you do either, from your very first trade.' },
      lines: [
        { at: 20.4, text: 'When you take a trade, you’re picking a side.' },
        { at: 22.6, text: 'Go long, and you profit if price rises.' },
        { at: 26.4, text: 'Go short, and you profit if price falls.' },
        { at: 30.6, text: 'And with futures, you can do either from your very first trade.' },
      ],
    },
    {
      type: 'participants', start: 36, end: 55,
      kicker: 'Break it down',
      title: 'Every trade has four pieces',
      items: [
        { at: 38.8, kind: 'market', label: 'Market', desc: ['What are you', 'trading?'], color: 'purple' },
        { at: 42.4, kind: 'direction', label: 'Direction', desc: ['Long or', 'short?'], color: 'teal' },
        { at: 45.8, kind: 'risk', label: 'Risk', desc: ['Where are', 'you wrong?'], color: 'pink' },
        { at: 49.4, kind: 'outcome', label: 'Outcome', desc: ['Price moves.', 'You gain or lose.'], color: 'peach' },
      ],
      lines: [
        { at: 36.4, text: 'Every trade has four pieces.' },
        { at: 38.8, text: 'The market: what are you trading?' },
        { at: 42.4, text: 'The direction: long or short?' },
        { at: 45.8, text: 'The risk: where are you wrong?' },
        { at: 49.4, text: 'And the outcome: price moves, and you gain or lose.' },
      ],
    },
    {
      type: 'time-compare', start: 55, end: 67,
      kicker: 'Trading vs. investing',
      title: 'Same markets, different clocks',
      left: { at: 57.4, label: 'Investing', desc: 'Owning something for years' },
      right: { at: 61.0, label: 'Trading', desc: 'Price movement, shorter window' },
      lines: [
        { at: 55.4, text: 'This is different from investing.' },
        { at: 57.4, text: 'Investing is usually about owning something for years.' },
        { at: 61.0, text: 'Trading is about profiting from price movement over a much shorter window.' },
      ],
    },
    {
      type: 'checklist', start: 67, end: 77,
      kicker: 'Remember this', boardAt: 68.4,
      parts: [
        { at: 69.0, text: 'Trading isn’t about being certain.' },
        { at: 71.6, html: 'It’s about <span class="mark">structured decisions</span> under uncertainty.' },
      ],
      items: [
        { at: 72.2, label: 'Market' }, { at: 72.9, label: 'Direction' },
        { at: 73.6, label: 'Risk' }, { at: 74.3, label: 'Outcome' },
      ],
      lines: [
        { at: 67.4, text: 'Here’s what to remember.' },
        { at: 69.0, text: 'Trading isn’t about being certain.' },
        { at: 71.6, text: 'It’s about making structured decisions under uncertainty.' },
      ],
    },
    {
      type: 'host-mission', start: 77, end: 90,
      kicker: 'Your mission',
      question: { at: 79.4, text: 'Is “I think price is going up” a complete trading plan?' },
      cta: { at: 84.0, text: 'Let’s find out' },
      lines: [
        { at: 77.4, text: 'So here’s your mission for this lesson.' },
        { at: 79.4, text: 'Is “I think price is going up” a complete trading plan?' },
        { at: 84.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
