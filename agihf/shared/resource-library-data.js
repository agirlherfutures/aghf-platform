/**
 * resource-library-data.js — A Girl & Her Futures™
 *
 * Single source of truth for the Trader Resource Library page (Free
 * Community members). Every outbound URL and every piece of reference
 * content lives here so the page itself never hardcodes a link — update
 * a link or a definition in one place and every card picks it up.
 *
 * `href: null` marks a resource that has no real destination yet. The
 * page renders those as a clearly-labeled "coming soon" state instead of
 * guessing a URL — see RESOURCES[0].items below for the two book links.
 */

// ── Resource 1: Reading List ─────────────────────────────────────────
// No book PDFs are hosted here (copyright). These are placeholders for
// real purchase/read links AGHF has the rights to send people to —
// fill in `href` once a link is chosen for each book.
export const BOOKS = [
  { title: 'Trading in the Zone', author: 'Mark Douglas', href: null },
  { title: 'Best Loser Wins', author: 'Tom Hougaard', href: null },
];

// ── Resource 2: Trading Dictionary ───────────────────────────────────
export const DICTIONARY_TERMS = [
  { term: 'Futures', def: "Contracts that let you trade the future price of something, like gold or the Nasdaq, without owning it outright." },
  { term: 'Contracts', def: 'The actual instrument you’re trading, like MNQ (Micro Nasdaq) or MGC (Micro Gold). Every contract has its own point value.' },
  { term: 'Micros', def: 'Smaller-sized futures contracts (MNQ, MGC) built for smaller accounts. Same market, smaller risk per point.' },
  { term: 'Minis', def: 'The full-sized version of a futures contract (NQ, GC). Same market as its micro, bigger point value.' },
  { term: 'Ticks', def: 'The smallest price move a contract can make.' },
  { term: 'Points', def: 'A full price-unit move. Each point is worth a set dollar amount per contract — MNQ is $2/point, MGC is $10/point.' },
  { term: 'Long', def: 'Buying with the expectation price goes up. You profit if price rises.' },
  { term: 'Short', def: 'Selling first with the expectation price goes down. You profit if price falls.' },
  { term: 'Stop Loss', def: 'The price where you automatically exit a losing trade — protects your account before a loss gets out of hand.' },
  { term: 'Take Profit', def: 'The price where you automatically exit a winning trade — locks in your gain.' },
  { term: 'Market Orders', def: 'An order that fills immediately at the current price.' },
  { term: 'Limit Orders', def: 'An order that only fills at a price you choose, or better.' },
  { term: 'Drawdown', def: 'How far your account has dropped from its highest point. Prop firms track this closely.' },
  { term: 'Prop Firms', def: 'Companies that let you trade their capital after passing an evaluation — you keep a split of the profits.' },
  { term: 'Evaluations', def: 'A test phase prop firms use to check you can trade profitably and within the rules before funding you.' },
  { term: 'Market Structure', def: 'The pattern of highs and lows that shows you who’s in control: buyers or sellers.' },
  { term: 'Liquidity', def: 'Areas where a lot of orders are resting (stop losses, pending orders). Price is often drawn toward them.' },
  { term: 'Buy-Side Liquidity', def: 'Resting orders sitting above recent highs — price often runs up to grab them before reversing.' },
  { term: 'Sell-Side Liquidity', def: 'Resting orders sitting below recent lows — price often drops to grab them before reversing.' },
  { term: 'Break of Structure', def: 'When price closes beyond a previous high or low, confirming the current trend is continuing.' },
  { term: 'Market Structure Shift', def: 'When price breaks structure in the opposite direction of the trend — a sign control may be changing hands.' },
];

// ── Resource 3: Trader FAQ ───────────────────────────────────────────
export const FAQ_ITEMS = [
  { q: 'What market does Dayli trade?', a: 'Futures — on the 1-minute timeframe, using the Dayli ICC method.' },
  { q: 'What platform do I need?', a: 'TradingView is what Dayli uses and teaches from. You’ll also want a broker or prop firm account to actually place trades.' },
  { q: 'What is TradingView?', a: 'A charting platform for watching and analyzing markets in real time. It’s free to start, and it’s where most AGHF lessons are taught from.' },
  { q: 'Do I need a prop firm?', a: 'Not to start learning. Prop firms let you trade their capital after passing an evaluation — a common next step once you’re ready to trade live without risking your own full account.' },
  { q: 'What is a futures evaluation?', a: 'A test phase where a prop firm checks that you can trade profitably and follow their rules before funding your account.' },
  { q: 'When does the market open?', a: 'Futures trade nearly 24 hours a day, Sunday evening through Friday afternoon, with a short daily maintenance break. AGHF’s lessons focus on the most active sessions.' },
  { q: 'What are micros and minis?', a: 'Micros (MNQ, MGC) are smaller-sized contracts built for smaller accounts. Minis (NQ, GC) are the full-sized version of the same markets.' },
  { q: 'Where should I start inside AGHF?', a: 'Start with University Basics in the Academy — it’s built in order for a reason. Come back to this Resource Library any time you need a quick reference.' },
];

// ── Resource 4: Trader Setup & Tools ─────────────────────────────────
// This content already exists as Phase 1, Section 2 ("Before You Touch a
// Chart") — TradingView, brokers/prop firms, order types, stop loss/take
// profit, position sizing, trading sessions. Routes there instead of
// duplicating it.
export const SETUP_TOOLS_HREF = 'lessons.html';

// ── Resource 5: Build Your Trading Plan ──────────────────────────────
// No dedicated trading-plan tool exists elsewhere in the app yet, so this
// renders as a simple fill-in template saved to this browser only
// (localStorage) — nothing is sent anywhere.
export const TRADING_PLAN_FIELDS = [
  { key: 'instrument', label: 'What I trade', placeholder: 'e.g. MNQ, MGC' },
  { key: 'session', label: 'Trading session / time', placeholder: 'e.g. 9:30–11:00am EST, New York open' },
  { key: 'setup', label: 'My setup', placeholder: 'The pattern or conditions I look for before I even consider a trade' },
  { key: 'entry', label: 'Entry confirmation', placeholder: 'What has to happen before I click the button' },
  { key: 'risk', label: 'Risk per trade', placeholder: 'e.g. 1% of account, or a fixed dollar amount' },
  { key: 'maxTrades', label: 'Maximum trades per day', placeholder: 'e.g. 2' },
  { key: 'stopConditions', label: 'Stop conditions', placeholder: 'When I walk away for the day, win or lose' },
  { key: 'rules', label: 'Rules I will follow', placeholder: 'Anything else you’re committing to — one per line', multiline: true },
];
export const TRADING_PLAN_STORAGE_KEY = 'aghf_trading_plan_v1';

// ── The resource grid itself ─────────────────────────────────────────
// `action.type`: 'modal' opens the shared in-page modal (see
// trader-resource-library.html) with the matching `modalId`; 'link'
// navigates straight to an existing page — never a new, duplicate one.
export const RESOURCES = [
  {
    id: 'books',
    icon: '📚',
    thumbClass: 'gt-p',
    category: 'READING LIST',
    formatLabel: 'GUIDE',
    title: 'Trading Books',
    description: 'A few books we recommend for building a stronger understanding of trading psychology, discipline, risk, and decision-making.',
    actionLabel: 'View Reading List',
    action: { type: 'modal', modalId: 'books' },
  },
  {
    id: 'dictionary',
    icon: '📖',
    thumbClass: 'gt-t',
    category: 'REFERENCE GUIDE',
    formatLabel: 'REFERENCE',
    title: 'AGHF Trading Dictionary',
    description: 'Trading terminology without all the unnecessary confusion. Use this guide whenever you run into a word or concept you don’t recognize.',
    actionLabel: 'Open Dictionary',
    action: { type: 'modal', modalId: 'dictionary' },
  },
  {
    id: 'faq',
    icon: '💬',
    thumbClass: 'gt-c',
    category: 'QUICK ANSWERS',
    formatLabel: 'FAQ',
    title: 'Trader FAQ',
    description: 'Quick answers to some of the questions new traders ask most while getting started.',
    actionLabel: 'View FAQs',
    action: { type: 'modal', modalId: 'faq' },
  },
  {
    id: 'setup-tools',
    icon: '🧰',
    thumbClass: 'gt-u',
    category: 'GETTING STARTED',
    formatLabel: 'GUIDE',
    title: 'Trader Setup + Tools',
    description: 'Need help getting your trading environment together? Start here for the platforms and tools commonly used throughout AGHF.',
    actionLabel: 'View Setup + Tools',
    action: { type: 'link', href: SETUP_TOOLS_HREF },
  },
  {
    id: 'trading-plan',
    icon: '📝',
    thumbClass: 'gt-p',
    category: 'TEMPLATE',
    formatLabel: 'TEMPLATE',
    title: 'Build Your Trading Plan',
    description: 'Turn what you’re learning into your own set of trading rules with a simple trading plan you can actually follow.',
    actionLabel: 'Build My Trading Plan',
    action: { type: 'modal', modalId: 'plan' },
  },
];
