/**
 * eval-lab-copy.js: A Girl & Her Futures™
 *
 * Every word the Evaluation Lab (Pass Your Eval™) shows. Hard rules for
 * anything added here: describe preparation and process, never a promise.
 * No "guaranteed", no "you will pass", no pass dates, nothing that
 * encourages bigger size, and no em dashes.
 */

export const LAB = {
  eyebrow: 'Pass Your Eval™',
  title: 'The Evaluation Lab',
  tagline: 'Your plan. Your discipline. Your progress.',
  mission: 'Trade the plan. Protect the account. Track the progress.',
  missionSub: 'Understand your evaluation rules, build a personal risk plan, check in with yourself, and measure your progress without rushing toward a profit target.',
  pillars: [
    { key: 'protect', label: 'Protect', text: 'Know exactly how your account can fail.' },
    { key: 'prepare', label: 'Prepare', text: 'Build your regimen before the session.' },
    { key: 'progress', label: 'Progress', text: 'Track your process, not just your P&L.' },
  ],
  disclaimer: 'Educational planning tool only. It isn’t financial advice, a trade recommendation, or a prediction that you’ll pass.',
};

export const STEPS = [
  { key: 'profile', n: 1, label: 'My Evaluation' },
  { key: 'regimen', n: 2, label: 'My Regimen' },
  { key: 'checkin', n: 3, label: 'Check In' },
  { key: 'progress', n: 4, label: 'My Progress' },
  { key: 'readiness', n: 5, label: 'Readiness' },
];

export const ACCOUNT_PRESETS = [
  { label: '$25K', size: 25000 },
  { label: '$50K', size: 50000 },
  { label: '$100K', size: 100000 },
  { label: '$150K', size: 150000 },
];

export const PROFILE_NOTE = 'These are the numbers you enter, not verified rules for any provider. Confirm the current terms of your specific evaluation, including exactly how its drawdown is calculated.';

export const DRAWDOWN_METHODS = [
  { key: 'static', label: 'Static', help: 'Your floor stays at your starting balance minus your drawdown. It never moves, no matter how much you make.' },
  { key: 'eod_trailing', label: 'End-of-day trailing', help: 'Your floor follows your highest closing balance. A good day raises the floor, and it never moves back down.' },
  { key: 'intraday_trailing', label: 'Intraday trailing', help: 'Your floor follows your highest balance at any moment, even unrealized profit in an open trade. A trade that goes your way and comes back can still raise your floor.' },
  { key: 'other', label: 'Other', help: 'Describe how your provider measures it in the note below, so the numbers here stay honest.' },
  { key: 'unknown', label: 'Not sure', help: 'Find out before you trade it. How your drawdown is measured decides how your account can fail. Until then, the Lab leaves your room-left numbers blank instead of guessing.' },
];

export const COMMITMENTS = [
  { key: 'limits', text: 'I will review my evaluation’s loss limits before trading.' },
  { key: 'setup', text: 'I will identify my setup and invalidation before entering.' },
  { key: 'risk', text: 'I will define my maximum personal risk before the session.' },
  { key: 'stop', text: 'I will stop trading when my personal stop conditions are met.' },
  { key: 'journal', text: 'I will journal my trades, including decisions and emotions.' },
];

export const NO_TRADE_CONDITIONS = [
  'I already hit my daily stop',
  'Big news is coming out in the next 30 minutes',
  'I’m outside my trading window',
  'I feel rushed or pressured to make money',
  'I’m upset about a recent loss',
  'I didn’t sleep well or I’m distracted',
  'My setup isn’t clearly there',
];

/** Phase 7 lessons the Lab points to. */
export const LESSONS = {
  afterLoss: { n: 4, title: 'After the Loss', topic: 'Revenge trading' },
  threeInARow: { n: 5, title: 'Three in a Row', topic: 'Losing streaks' },
  justOneMore: { n: 9, title: 'Just One More', topic: 'Overtrading' },
  frozen: { n: 7, title: 'Frozen', topic: 'Fear and hesitation' },
  doneMeansDone: { n: 18, title: 'Done Means Done', topic: 'Stopping for the day' },
  rulebook: { n: 22, title: 'Your Rulebook', topic: 'Writing your rules' },
};

export const MOODS = [
  {
    key: 'focused', label: 'Focused and calm', emoji: '🌿',
    response: 'Feeling focused is a useful starting point. Review your setup criteria and risk limits before deciding whether to trade.',
    lessons: [],
  },
  {
    key: 'nervous', label: 'Nervous about losing', emoji: '🫧',
    response: 'Nerves are normal when real rules are on the line. Keep the decision small: your setup, your planned risk, your stop where it belongs. If the setup isn’t there, not trading is a good session.',
    lessons: ['frozen'],
  },
  {
    key: 'pressure', label: 'Feeling pressure to pass quickly', emoji: '⏳',
    response: 'Pressure to pass fast is when traders size up and force trades. Your target has no deadline today. Trade only your setup, at your planned risk, and let the process do its job.',
    lessons: ['justOneMore', 'doneMeansDone'],
  },
  {
    key: 'frustrated', label: 'Frustrated after recent losses', emoji: '🌧️',
    response: 'Frustration after losses is when revenge trades happen. It’s okay to sit this session out, or trade only your clearest setup at your normal size. Never size up to win it back.',
    lessons: ['afterLoss', 'threeInARow'],
  },
];

export const FOLLOWED = [
  { key: 'yes', label: 'Yes, I followed it', score: 1 },
  { key: 'mostly', label: 'Mostly', score: 0.5 },
  { key: 'no', label: 'No, I broke a rule', score: 0 },
];

export const READINESS = [
  { key: 'rules', text: 'I can explain how my evaluation can fail, including how my drawdown is calculated.', gap: 'Review your evaluation rules', step: 'profile' },
  { key: 'limits', text: 'I’ve set my maximum risk per trade and my stop conditions for the day.', gap: 'Define your personal risk limits', step: 'regimen' },
  { key: 'tested', text: 'I’ve practiced or backtested my setup, and I can spot when it’s valid and when it isn’t.', gap: 'Practice your setup in Phase 8', href: 'lesson.html?phase=p8&n=1' },
  { key: 'streak', text: 'I can describe exactly what I’ll do after three losses in a row.', gap: 'Plan your response to a losing streak', lesson: 'threeInARow' },
  { key: 'journal', text: 'I journal my trades, including my decisions and emotions.', gap: 'Start journaling your trades', href: 'journal.html' },
  { key: 'pressure', text: 'I have a plan for days I feel pressure to pass quickly.', gap: 'Build a plan for pressure days', lesson: 'justOneMore' },
];

export const READINESS_NOTE = 'This review helps you spot gaps in your preparation. It isn’t a prediction that you’ll pass, and it doesn’t mean you’re ready for live trading.';

export const AGENT_PROMPTS = [
  'I’ve lost three trades in a row. Should I increase my contracts to make it back?',
  'I feel pressure to pass my evaluation quickly. Help me slow down.',
  'Help me review my evaluation rules and my personal stop conditions.',
];
