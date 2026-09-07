/**
 * games-data.js — A Girl & Her Futures™
 *
 * The original games hub's 8 games — all playable, gated informationally
 * by GP-tier Level (not locked), restored from the pre-rebuild site.
 */
export const GAMES = [
  { href: 'games/pattern-recognition.html', icon: '🕯️', thumbClass: 'gt-p', title: 'Pattern Recognition',
    desc: 'Candles flash. You call it. Speed round. The faster your eye learns, the more GP you earn.',
    xp: '+50 GP per round', level: 1, btnClass: 'gb-p' },
  { href: 'games/bull-or-bear.html', icon: '🐂', thumbClass: 'gt-t', title: 'Bull or Bear?',
    desc: 'Price action plays for 3 seconds. Call the bias. Simple. Fast. Builds instinct before your brain overthinks it.',
    xp: '+50 GP per round', level: 1, btnClass: 'gb-t' },
  { href: 'games/trend-or-range.html', icon: '📈', thumbClass: 'gt-c', title: 'Trend or Range?',
    desc: 'A chart loads. Is price trending or consolidating? Know the no-trade zones before you waste a dollar.',
    xp: '+65 GP per round', level: 1, btnClass: 'gb-p' },
  { href: 'games/pressure-vs-precision.html', icon: '⚡', thumbClass: 'gt-t', title: 'Pressure vs Precision',
    desc: 'Five real ICC scenarios. Pressure rising. Can you trade like you… when it counts?',
    xp: '+75 GP per round', level: 2, btnClass: 'gb-t' },
  { href: 'games/pre-indication-spotter.html', icon: '🎯', thumbClass: 'gt-t', title: 'Pre-Indication Level Spotter',
    desc: 'A chart loads. Click where the pre-indication level is. Miss it and it shows you exactly why.',
    xp: '+60 GP per round', level: 2, btnClass: 'gb-t' },
  { href: 'games/stop-loss-setter.html', icon: '🛑', thumbClass: 'gt-p', title: 'Stop Loss Setter',
    desc: 'An ICC setup with the entry marked. Click where your stop loss goes. Protect the trade.',
    xp: '+70 GP per round', level: 2, btnClass: 'gb-p' },
  { href: 'games/icc-sequence.html', icon: '💎', thumbClass: 'gt-u', title: 'ICC Sequence',
    desc: 'A real chart. Identify Indication, Correction, Continuation in order. All three or no GP.',
    xp: '+100 GP per round', level: 3, btnClass: 'gb-p' },
  { href: 'games/valid-or-invalid.html', icon: '⚖️', thumbClass: 'gt-u', title: 'Valid or Invalid?',
    desc: 'An ICC-like setup appears. Judge it. Some are real, some are traps. Can you tell the difference?',
    xp: '+80 GP per round', level: 3, btnClass: 'gb-p' },
];
