/**
 * Lesson 8 intro video — "Brokers, Prop Firms & Accounts" (illustrated)
 * Times are seconds from the start of the video (see lesson-01.js for the format).
 */
window.LESSON_VIDEO = {
  slug: 'lesson-08',
  eyebrow: 'Phase 1 · Section 2 · Lesson 8',
  duration: 95,
  scenes: [
    {
      type: 'host-title', start: 0, end: 8, nameTag: true,
      phase: 'Section 2: Before You Touch a Chart',
      title: 'Brokers, Prop Firms & Accounts',
      quote: 'Funded, personal, simulated, live. Know the account before you know the strategy.',
      lines: [
        { at: 0.6, text: 'Welcome to Lesson Eight of A Girl & Her Futures.' },
        { at: 3.8, text: 'Today: brokers, prop firms, and the accounts you’ll trade in.' },
      ],
    },
    {
      type: 'participants', start: 8, end: 34,
      kicker: 'Know the difference before you fund an account',
      title: 'Three kinds of accounts',
      items: [
        { at: 16.2, kind: 'broker', label: 'Broker', desc: ['Your money,', 'full risk'], color: 'teal' },
        { at: 23.2, kind: 'prop', label: 'Prop firm', desc: ['Their money,', 'their rules'], color: 'purple' },
        { at: 29.0, kind: 'sim', label: 'Simulated', desc: ['Practice money,', 'zero risk'], color: 'pink' },
      ],
      lines: [
        { at: 8.4, text: 'Know the difference before you fund an account.' },
        { at: 11.2, text: 'Every account is either your money, someone else’s money, or practice money.' },
        { at: 16.2, text: 'A broker account trades your own capital. You keep every dollar of profit, and absorb every dollar of loss.' },
        { at: 23.2, text: 'A prop firm gives you access to their capital, if you prove you can trade within their rules.' },
        { at: 29.0, text: 'And a simulated account? No real money at all. Pure practice.' },
      ],
    },
    {
      type: 'versus-rows', start: 34, end: 52,
      kicker: 'Don’t get this confused', title: 'Broker ≠ Prop firm', cols: ['Broker', 'Prop firm'],
      rows: [
        { at: 36.2, label: 'Capital', left: { icon: 'broker', text: 'Your own' }, right: { icon: 'prop', text: 'Firm’s, once funded' } },
        { at: 42.6, label: 'Profit', left: { icon: 'coins', text: 'You keep it all' }, right: { icon: 'split', text: 'Usually split' } },
        { at: 48.0, label: 'Entry', left: { icon: 'open', text: 'No evaluation' }, right: { icon: 'gate', text: 'Pass an evaluation' } },
      ],
      lines: [
        { at: 34.4, text: 'Don’t get these two confused.' },
        { at: 36.2, text: 'A broker account is your own capital, and you keep one hundred percent of the profit.' },
        { at: 42.6, text: 'A prop firm account is their capital once you’re funded, and profits are usually split.' },
        { at: 48.0, text: 'And there’s no evaluation with a broker.' },
      ],
    },
    {
      type: 'prop-path', start: 52, end: 71,
      kicker: 'The prop path',
      beats: { eval: 54.4, funded: 59.8, split: 63.2 },
      headlines: [
        { at: 54.4, out: 65.8, html: 'Prove your <span class="mark">rule-discipline</span> first.' },
        { at: 66.0, html: 'Whose money? Theirs. <span class="mark">Whose rules? Theirs.</span>' },
      ],
      lines: [
        { at: 52.4, text: 'Here’s how the prop path works.' },
        { at: 54.4, text: 'First, an evaluation. It tests your rule-discipline, not just your strategy.' },
        { at: 59.8, text: 'Pass it, and you trade the firm’s capital.' },
        { at: 63.2, text: 'And the profits are usually split.' },
        { at: 66.0, text: 'Whose money? Theirs. Whose rules? Theirs.' },
      ],
    },
    {
      type: 'host-hook', start: 71, end: 81, pointAt: 75.0, size: 68,
      kicker: 'Remember this',
      parts: [
        { at: 72.8, text: 'Before you place a single trade,' },
        { at: 75.0, html: 'know <span class="mark">which account you’re in</span> and what it expects from you.' },
      ],
      lines: [
        { at: 71.4, text: 'Here’s what to remember.' },
        { at: 72.8, text: 'Before you place a single trade,' },
        { at: 75.0, text: 'know exactly which account you’re in, and what it expects from you.' },
      ],
    },
    {
      type: 'host-mission', start: 81, end: 95,
      kicker: 'Your mission',
      question: { at: 83.4, text: 'If a trader wants to prove she’s consistent before risking real money, which account answers that?' },
      cta: { at: 91.6, text: 'Let’s find out' },
      lines: [
        { at: 81.4, text: 'So here’s your mission for this lesson.' },
        { at: 83.4, text: 'If a trader wants to prove she’s consistent before risking real money, which account type actually answers that?' },
        { at: 91.6, text: 'Let’s find out.' },
      ],
    },
  ],
};
