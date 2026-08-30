/**
 * games-data.js — A Girl & Her Futures™
 *
 * Authoritative games → grade mapping, ported from the games.html design
 * mockup. `href` is null for locked/coming-soon games (nothing to link to
 * yet). Existing game files keep their real filenames (no `game-` prefix,
 * unlike the mockup's placeholder links) — see the rebuild plan for why.
 */
export const GAMES = [
  { grade: '2', title: 'Bull or Bear?', desc: 'Call the bias in 3 seconds flat.',
    icon: '🐂', iconBg: 'linear-gradient(135deg,#E8F8F6,#B2E4DF)', state: 'playable', xp: '+50 XP avg', href: '../games/bull-or-bear.html' },
  { grade: '2', title: 'Pattern Recognition', desc: 'Fast candle flashcards.',
    icon: '🔥', iconBg: 'linear-gradient(135deg,#E8F8F6,#B2E4DF)', state: 'coming-soon', href: '../games/pattern-recognition.html' },
  { grade: '3', title: 'Trend or Range?', desc: 'Spot the no-trade zones.',
    icon: '📈', iconBg: 'linear-gradient(135deg,#FEF3E4,#FAD09A)', state: 'coming-soon', href: '../games/trend-or-range.html' },
  { grade: '4', title: 'Break or Fake?', desc: 'Real MSS vs. false break.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '5', title: 'Level Strength', desc: 'Find the freshest key level.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '6', title: 'Sweep or Reversal?', desc: 'Liquidity grab vs. real turn.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '7', title: 'Spot the FVG', desc: 'Market literacy, not entries.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '8', title: 'Read the Room', desc: 'Match HTF context to the 1M read.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '9', title: 'HTF ICC Sequence', desc: 'Same mechanic, 4H/1H scale.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '10', title: 'Top-Down Speed Fill', desc: 'Fill the analysis card, timed.',
    icon: '🔒', iconBg: '#F1EDE9', state: 'locked', href: null },
  { grade: '11', title: 'ICC Sequence', desc: 'PIL → I → C → C → Retest, live.',
    icon: '💎', iconBg: 'linear-gradient(135deg,#EEEDFE,#CECBF6)', state: 'playable', xp: '+60 XP avg', href: '../games/icc-sequence.html' },
  { grade: '11', title: 'Pre-Indication Spotter', desc: 'Click the PIL.',
    icon: '🎯', iconBg: 'linear-gradient(135deg,#EEEDFE,#CECBF6)', state: 'coming-soon', href: '../games/pre-indication-spotter.html' },
  { grade: '11', title: 'Valid or Invalid?', desc: 'Real setup, or a trap?',
    icon: '⚖️', iconBg: 'linear-gradient(135deg,#EEEDFE,#CECBF6)', state: 'coming-soon', href: '../games/valid-or-invalid.html' },
  { grade: '12', title: 'Stop Loss Setter', desc: 'Protect the trade.',
    icon: '🛑', iconBg: 'linear-gradient(135deg,#FDE8ED,#F9B8C6)', state: 'coming-soon', href: '../games/stop-loss-setter.html' },
  { grade: '12', title: 'Pressure vs Precision', desc: 'Decide calm, or triggered?',
    icon: '⚡', iconBg: 'linear-gradient(135deg,#FDE8ED,#F9B8C6)', state: 'coming-soon', href: '../games/pressure-vs-precision.html' },
];
