/**
 * Lesson 1 intro video — "What Even Is Trading?"
 *
 * Every time is in seconds from the start of the video. Each scene's
 * `lines` are the narration script; each line's `at` is when the
 * narrator starts reading it (the captions version shows these live).
 * Element `at` values are when that piece animates onto the screen.
 */
window.LESSON_VIDEO = {
  slug: 'lesson-01',
  eyebrow: 'Phase 1 · Section 1 · Lesson 1',
  duration: 86,
  scenes: [
    {
      type: 'title', start: 0, end: 8,
      phase: 'Phase 1: Welcome to the Market',
      title: 'What Even Is Trading?',
      quote: 'Candles are just storytelling. They’re showing you who’s winning right now.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson One of A Girl & Her Futures.' },
        { at: 3.6, text: 'Today we’re answering a big question: what even is trading?' },
      ],
    },
    {
      type: 'hook', start: 8, end: 17,
      kicker: 'First things first',
      parts: [
        { at: 10.2, text: 'Trading isn’t predicting the future.', strike: 'predicting the future' },
        { at: 12.6, text: 'You’re participating in price movement.', highlight: 'participating' },
      ],
      lines: [
        { at: 8.4, text: 'Here’s the first thing to know.' },
        { at: 10.2, text: 'Trading isn’t predicting the future.' },
        { at: 12.6, text: 'You’re participating in price movement.' },
      ],
    },
    {
      type: 'longshort', start: 17, end: 33,
      kicker: 'Pick a side',
      title: 'Every trade takes a position',
      long: { at: 19.6, label: 'Long', desc: 'You profit if price rises' },
      short: { at: 23.4, label: 'Short', desc: 'You profit if price falls' },
      footer: { at: 27.6, text: 'Futures let you do either, from your very first trade.' },
      lines: [
        { at: 17.4, text: 'When you take a trade, you’re picking a side.' },
        { at: 19.6, text: 'Go long, and you profit if price rises.' },
        { at: 23.4, text: 'Go short, and you profit if price falls.' },
        { at: 27.6, text: 'And with futures, you can do either from your very first trade.' },
      ],
    },
    {
      type: 'grid4', start: 33, end: 52,
      kicker: 'Break it down',
      title: 'Every trade has four pieces',
      items: [
        { at: 35.8, label: 'Market', desc: 'What are you trading?', color: 'purple' },
        { at: 39.4, label: 'Direction', desc: 'Long or short?', color: 'teal' },
        { at: 42.8, label: 'Risk', desc: 'Where are you wrong?', color: 'pink' },
        { at: 46.4, label: 'Outcome', desc: 'Price moves. You gain or lose.', color: 'peach' },
      ],
      lines: [
        { at: 33.4, text: 'Every trade has four pieces.' },
        { at: 35.8, text: 'The market: what are you trading?' },
        { at: 39.4, text: 'The direction: long or short?' },
        { at: 42.8, text: 'The risk: where are you wrong?' },
        { at: 46.4, text: 'And the outcome: price moves, and you gain or lose.' },
      ],
    },
    {
      type: 'compare', start: 52, end: 64,
      kicker: 'Trading vs. investing',
      left: { at: 54.4, label: 'Investing', desc: 'Owning something for years', bar: 0.92, color: 'purple' },
      right: { at: 58.0, label: 'Trading', desc: 'Profiting from price movement over a much shorter window', bar: 0.16, color: 'pink' },
      lines: [
        { at: 52.4, text: 'This is different from investing.' },
        { at: 54.4, text: 'Investing is usually about owning something for years.' },
        { at: 58.0, text: 'Trading is about profiting from price movement over a much shorter window.' },
      ],
    },
    {
      type: 'remember', start: 64, end: 74,
      kicker: 'Remember this',
      parts: [
        { at: 66.0, text: 'Trading isn’t about being certain.' },
        { at: 68.6, text: 'It’s about making structured decisions under uncertainty.', highlight: 'structured decisions' },
      ],
      lines: [
        { at: 64.4, text: 'Here’s what to remember.' },
        { at: 66.0, text: 'Trading isn’t about being certain.' },
        { at: 68.6, text: 'It’s about making structured decisions under uncertainty.' },
      ],
    },
    {
      type: 'mission', start: 74, end: 86,
      kicker: 'Your mission',
      question: { at: 76.4, text: 'Is “I think price is going up” a complete trading plan?' },
      cta: { at: 81.0, text: 'Let’s find out' },
      lines: [
        { at: 74.4, text: 'So here’s your mission for this lesson.' },
        { at: 76.4, text: 'Is “I think price is going up” a complete trading plan?' },
        { at: 81.0, text: 'Let’s find out.' },
      ],
    },
  ],
};
