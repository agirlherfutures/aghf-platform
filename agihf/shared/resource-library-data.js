/**
 * resource-library-data.js — A Girl & Her Futures™
 *
 * Single source of truth for The Trader Resource Library (resources.html).
 * Every URL the page uses lives in RESOURCE_LINKS below — update a link
 * here and every card, button and panel that points at it follows.
 *
 * PLACEHOLDER convention: a link set to `null` means "no URL exists yet".
 * The UI never invents one — it either falls back to the in-page panel
 * (dictionary, FAQ, trading plan) or shows a clearly-labeled "Link coming
 * soon" state (books, copy trader basics). Search this file for
 * "PLACEHOLDER" to find every link still waiting on a real URL.
 *
 * Scope: this page is for Free Community members. It only links to
 * Phase 1 (free foundations) lessons, the free Discord join page and
 * public third-party sites — never to paid University-only content.
 *
 * Usage: import { RESOURCES, RESOURCE_LINKS, ... } from './shared/resource-library-data.js';
 */

export const RESOURCE_LINKS = {
  // Existing Academy pages / lessons (relative to the agihf/ root).
  academyHome: 'lessons.html',
  lessonContracts: 'lesson.html?phase=p1&n=4',
  lessonPointsTicks: 'lesson.html?phase=p1&n=6',
  lessonTradingView: 'lesson.html?phase=p1&n=7',
  lessonBrokersPropFirms: 'lesson.html?phase=p1&n=8',
  lessonOrderTypes: 'lesson.html?phase=p1&n=9',
  lessonStopLossTakeProfit: 'lesson.html?phase=p1&n=10',
  lessonSessions: 'lesson.html?phase=p1&n=12',
  joinDiscord: 'store.html', // Existing "Join Discord" page (has the free Discord option).

  // "Continue Learning" CTA. No page named "University Basics" exists yet,
  // so this routes to the Academy, which opens on Phase 1 (the beginner
  // foundations). PLACEHOLDER: swap for the University Basics dashboard
  // URL once that page exists.
  continueLearning: 'lessons.html',

  // Public third-party sites.
  tradingView: 'https://www.tradingview.com/',

  // PLACEHOLDER: set to a hosted dictionary URL to make "Open Dictionary"
  // link there instead of opening the built-in dictionary panel.
  dictionary: null,
  // PLACEHOLDER: no FAQ page exists in the Academy yet. Set this to its
  // URL once one does, and "View FAQs" will link there instead of opening
  // the built-in FAQ panel.
  faq: null,
  // PLACEHOLDER: no trading-plan lesson or tool exists yet (Phase 8's
  // "Building Your Personal Trading Plan" is still coming soon). Set this
  // to route "Build My Trading Plan" there instead of the built-in template.
  tradingPlan: null,
  // PLACEHOLDER: no copy trader content exists yet.
  copyTraderBasics: null,

  // PLACEHOLDER: legitimate purchase/read links for the reading list
  // (publisher, bookstore or library pages). Do NOT link to or host
  // copyrighted PDFs unless AGHF has the rights to distribute them.
  bookTradingInTheZone: null,
  bookBestLoserWins: null,
};

/**
 * The cards on the page, in display order. `panel` is the in-page
 * detail view the button opens; `linkKey` (optional) names a
 * RESOURCE_LINKS entry — when that entry is non-null the button links
 * there instead of opening the panel.
 */
export const RESOURCES = [
  {
    id: 'books',
    icon: '📚',
    tone: 'pink',
    category: 'Reading List',
    format: 'External Resource',
    title: 'Trading Books',
    description: 'A few books we recommend for building a stronger understanding of trading psychology, discipline, risk, and decision-making.',
    button: 'View Reading List',
    panel: 'books',
  },
  {
    id: 'dictionary',
    icon: '📖',
    tone: 'teal',
    category: 'Reference Guide',
    format: 'Guide',
    title: 'AGHF Trading Dictionary',
    description: 'Trading terminology without all the unnecessary confusion. Use this guide whenever you run into a word or concept you don’t recognize.',
    button: 'Open Dictionary',
    panel: 'dictionary',
    linkKey: 'dictionary',
  },
  {
    id: 'faq',
    icon: '💬',
    tone: 'peach',
    category: 'Quick Answers',
    format: 'Guide',
    title: 'Trader FAQ',
    description: 'Quick answers to some of the questions new traders ask most while getting started.',
    button: 'View FAQs',
    panel: 'faq',
    linkKey: 'faq',
  },
  {
    id: 'setup',
    icon: '🛠️',
    tone: 'purple',
    category: 'Getting Started',
    format: 'Guide',
    title: 'Trader Setup + Tools',
    description: 'Need help getting your trading environment together? Start here for the platforms and tools commonly used throughout AGHF.',
    button: 'View Setup + Tools',
    panel: 'setup',
  },
  {
    id: 'trading-plan',
    icon: '📝',
    tone: 'pink',
    category: 'Template',
    format: 'Template',
    title: 'Build Your Trading Plan',
    description: 'Turn what you’re learning into your own set of trading rules with a simple trading plan you can actually follow.',
    button: 'Build My Trading Plan',
    panel: 'trading-plan',
    linkKey: 'tradingPlan',
  },
];

export const BOOKS = [
  {
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    why: 'The classic on trading psychology — why thinking in probabilities matters more than being right on any one trade.',
    linkKey: 'bookTradingInTheZone',
  },
  {
    title: 'Best Loser Wins',
    author: 'Tom Hougaard',
    why: 'A blunt look at why managing losses well — not avoiding them — is what separates consistent traders.',
    linkKey: 'bookBestLoserWins',
  },
];

/** Grouped so a beginner can scan by topic instead of an A–Z wall. */
export const DICTIONARY = [
  {
    group: 'The Basics',
    terms: [
      { term: 'Futures', def: 'A contract to buy or sell a market at a set price on a future date. Traders use futures to speculate on price moving up or down without owning the underlying asset.' },
      { term: 'Contract', def: 'One unit of a futures market. Your size is counted in contracts — 1 contract, 2 contracts — and every contract you add multiplies your risk.' },
      { term: 'Micros', def: 'Smaller versions of popular futures contracts, like MNQ (Micro Nasdaq-100) or MGC (Micro Gold). A micro is 1/10 the size of its mini, which makes it the usual starting point for new traders.' },
      { term: 'Minis', def: 'The full-size "E-mini" contracts, like NQ (Nasdaq-100) or ES (S&P 500). Same chart as the micro, 10× the dollar risk per point.' },
      { term: 'Tick', def: 'The smallest price move a contract can make. On MNQ one tick is 0.25 points, worth $0.50 per contract.' },
      { term: 'Point', def: 'A whole-number move in price (20,000 → 20,001). On MNQ one point is worth $2 per contract; on NQ it’s $20.' },
    ],
  },
  {
    group: 'Taking a Trade',
    terms: [
      { term: 'Long', def: 'Buying because you expect price to go up. You profit if it rises.' },
      { term: 'Short', def: 'Selling because you expect price to go down. You profit if it falls.' },
      { term: 'Market Order', def: 'Gets you in immediately at whatever price is available. Speed over price control.' },
      { term: 'Limit Order', def: 'Rests at the exact price you choose and only fills if price comes to you. Price control over speed — it may never fill.' },
      { term: 'Stop Loss', def: 'A pre-set exit that closes your trade at a loss you’ve already accepted, so one bad trade can’t turn into a disaster. Know it before you enter.' },
      { term: 'Take Profit', def: 'A pre-set exit that closes your trade once price reaches your target.' },
    ],
  },
  {
    group: 'Risk + Accounts',
    terms: [
      { term: 'Drawdown', def: 'How far your account has fallen from its high point. Prop firms set maximum drawdown limits — cross one and the account is lost.' },
      { term: 'Prop Firm', def: 'A proprietary trading firm that lets you trade its capital if you first prove you can follow its rules. Profits are usually split with the firm.' },
      { term: 'Evaluation', def: 'The test a prop firm gives before funding you — hit a profit target without breaking rules like daily loss or max drawdown. It tests discipline as much as strategy.' },
    ],
  },
  {
    group: 'Reading the Chart',
    terms: [
      { term: 'Market Structure', def: 'The pattern of highs and lows price makes. Higher highs and higher lows = uptrend; lower highs and lower lows = downtrend.' },
      { term: 'Liquidity', def: 'Areas where lots of orders are waiting to be filled — often clustered around obvious highs and lows where traders place their stops.' },
      { term: 'Buy-Side Liquidity', def: 'Orders resting above highs (like the stop losses of short sellers). Price often reaches up to take it.' },
      { term: 'Sell-Side Liquidity', def: 'Orders resting below lows (like the stop losses of buyers). Price often reaches down to take it.' },
      { term: 'Break of Structure (BOS)', def: 'Price closes beyond a key swing in the direction of the trend. The trend is continuing — structure agrees with itself.' },
      { term: 'Market Structure Shift (MSS)', def: 'Price breaks structure against the trend. A sign the trend may be changing — structure just disagreed with itself.' },
    ],
  },
];

/**
 * Answers are grounded in what the Phase 1 lessons already teach.
 * `links` are RESOURCE_LINKS keys rendered as "Learn more" links.
 */
export const FAQ = [
  {
    q: 'What market does Dayli trade?',
    // CONFIRM: have Dayli verify this answer reflects what she trades today.
    a: 'AGHF is built around futures. Throughout the Academy you’ll see MNQ (Micro Nasdaq-100) and MGC (Micro Gold) used as the main examples — micro contracts that keep the dollar risk per point small while you learn.',
    links: [{ key: 'lessonContracts', label: 'Lesson 4: Contracts & Instruments' }],
  },
  {
    q: 'What platform do I need?',
    a: 'For charts, AGHF uses TradingView. To actually place trades you’ll use whatever platform your broker or prop firm provides — that depends on the account you choose, so you don’t need to pick one on day one.',
    links: [{ key: 'lessonTradingView', label: 'Lesson 7: TradingView Basics' }, { key: 'lessonBrokersPropFirms', label: 'Lesson 8: Brokers, Prop Firms & Accounts' }],
  },
  {
    q: 'What is TradingView?',
    a: 'A charting platform where you read price, switch timeframes and mark levels. A free account is enough to get started. Keep your chart clean — a few tools used clearly beats a cluttered screen.',
    links: [{ key: 'tradingView', label: 'Visit TradingView', external: true }],
  },
  {
    q: 'Do I need a prop firm?',
    a: 'No. A prop firm is one option, not a requirement. You can practice in a simulated (demo) account with no real money, trade your own capital through a broker, or take a prop firm evaluation. Know which account you’re in and what it expects before you place a trade.',
    links: [{ key: 'lessonBrokersPropFirms', label: 'Lesson 8: Brokers, Prop Firms & Accounts' }],
  },
  {
    q: 'What is a futures evaluation?',
    a: 'A prop firm’s test. You trade a practice account and need to hit a profit target without breaking their rules (like a daily loss limit or max drawdown). Pass it and you trade the firm’s capital, usually splitting the profits.',
    links: [{ key: 'lessonBrokersPropFirms', label: 'Lesson 8: Brokers, Prop Firms & Accounts' }],
  },
  {
    q: 'When does the market open?',
    a: 'Index and metals futures trade almost 24 hours a day — they open Sunday at 6:00 PM ET and run through Friday afternoon, with a short daily break around 5:00–6:00 PM ET. The busiest period is the New York open at 9:30 AM ET. Holiday hours change, so always check the exchange calendar.',
    links: [{ key: 'lessonSessions', label: 'Lesson 12: Trading Sessions & Market Hours' }],
  },
  {
    q: 'What are micros and minis?',
    a: 'Two sizes of the same market. A micro (like MNQ) is 1/10 the size of its mini (NQ). Same chart, same moves — but 1 point on MNQ is $2 while 1 point on NQ is $20. Most new traders start with micros.',
    links: [{ key: 'lessonPointsTicks', label: 'Lesson 6: Points, Ticks & P&L' }],
  },
  {
    q: 'Where should I start inside AGHF?',
    a: 'Start in the Academy with Phase 1, Lesson 1. The lessons build on each other, so go in order — and come back to this library whenever you need a quick reference.',
    links: [{ key: 'academyHome', label: 'Go to the Academy' }],
  },
];

/** Routes to existing Academy content rather than duplicating it. */
export const SETUP_TOOLS = [
  { icon: '📈', title: 'TradingView', desc: 'The charting platform used throughout AGHF.', links: [{ key: 'lessonTradingView', label: 'Lesson 7: TradingView Basics' }, { key: 'tradingView', label: 'Visit TradingView', external: true }] },
  { icon: '💬', title: 'Discord', desc: 'Where the AGHF community chats, shares and learns together.', links: [{ key: 'joinDiscord', label: 'Join the free Discord' }] },
  { icon: '🏦', title: 'Prop Firms', desc: 'What an evaluation is and how funded accounts work.', links: [{ key: 'lessonBrokersPropFirms', label: 'Lesson 8: Brokers, Prop Firms & Accounts' }] },
  { icon: '🖥️', title: 'Trading Platforms', desc: 'Broker vs prop firm vs simulated accounts, and the order types every platform uses.', links: [{ key: 'lessonBrokersPropFirms', label: 'Lesson 8: Accounts' }, { key: 'lessonOrderTypes', label: 'Lesson 9: Order Types' }] },
  { icon: '🔁', title: 'Copy Trader Basics', desc: 'How copy trading works across multiple accounts.', links: [{ key: 'copyTraderBasics', label: 'Copy Trader Basics' }] },
  { icon: '🕯️', title: 'Basic Chart Setup', desc: 'A clean, readable chart — a few tools used clearly.', links: [{ key: 'lessonTradingView', label: 'Lesson 7: TradingView Basics' }] },
];

/** Fields for the built-in trading plan template, in order. */
export const TRADING_PLAN_FIELDS = [
  { key: 'market', label: 'What I trade', hint: 'Which market and contract size? e.g. MNQ, 1 micro contract', rows: 1 },
  { key: 'session', label: 'When I trade', hint: 'Your session and time window, e.g. New York open, 9:30–11:00 AM ET', rows: 1 },
  { key: 'setup', label: 'My setup', hint: 'The one setup you’re allowed to take, in plain words.', rows: 2 },
  { key: 'entry', label: 'My entry confirmation', hint: 'What has to happen before you click buy or sell?', rows: 2 },
  { key: 'risk', label: 'Risk per trade', hint: 'A fixed dollar amount or % of your account — and where your stop loss goes.', rows: 1 },
  { key: 'maxTrades', label: 'Maximum trades per day', hint: 'e.g. 2 trades, then I’m done.', rows: 1 },
  { key: 'stop', label: 'When I stop for the day', hint: 'e.g. after 2 losses, after hitting my daily goal, or if I feel emotional.', rows: 2 },
  { key: 'rules', label: 'Rules I will follow', hint: 'Your non-negotiables. e.g. No trading during red-folder news. No moving my stop.', rows: 3 },
];

export const PAGE_COPY = {
  eyebrow: 'AGHF Free Resources',
  title: 'The Trader Resource Library',
  subtitle: 'Everything doesn’t need to be another lesson. This is your go-to spot for helpful tools, references, and resources you can come back to throughout your trading journey.',
  badge: 'Included with Free Community',
  ctaTitle: 'Ready to keep learning?',
  ctaCopy: 'The Resource Library is here when you need a quick reference. When you’re ready to actually learn the foundations step by step, continue through University Basics.',
  ctaButton: 'Continue Learning',
};
