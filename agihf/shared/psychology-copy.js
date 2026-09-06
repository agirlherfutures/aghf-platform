/**
 * psychology-copy.js — A Girl & Her Futures™
 *
 * Centralized labels/copy for the Psychology Coach feature — the first
 * instance of this pattern in the codebase (per the feature spec's "if a
 * centralized copy config exists, use it; if not, note that one should
 * exist" instruction). Every page/engine file imports names from here
 * instead of inlining the feature's branding, so the name/tagline/mode
 * copy can change later without touching render logic.
 */

export const FEATURE_NAME = 'The Inner Edge';
export const NAV_LABEL = 'Psychology Coach';
export const SUPPORTING_LINE = 'Your personalized trading psychology and execution coach.';

export const POSITIONING_NOTE = 'The Inner Edge is an educational trading-performance coach — not a therapist, financial adviser, or signal generator. It helps you compare a decision against your own saved plan and rules.';

export const MODE_CARDS = [
  { key: 'talk_me_through', title: 'Talk Me Through This', desc: 'Something is happening right now and you need to think it through before you act.', icon: '💬', href: 'psychology-coach.html?mode=talk_me_through' },
  { key: 'pre_trade_check', title: 'Pre-Trade Mental Check', desc: 'A fast 30-second check before you place an order.', icon: '✓', href: 'psychology-coach.html?mode=pre_trade_check' },
  { key: 'post_loss_reset', title: 'Post-Loss Reset', desc: 'A guided reset after a trade that didn’t go your way.', icon: '↺', href: 'psychology-coach.html?mode=post_loss_reset' },
  { key: 'review_patterns', title: 'Review My Patterns', desc: 'See what your journal and checklist actually show — with evidence.', icon: '◈', href: 'psychology-history.html' },
  { key: 'practice_scenario', title: 'Practice a Scenario', desc: 'Work through a realistic trading-psychology scenario with no money at risk.', icon: '🎯', href: 'psychology-scenarios.html' },
  { key: 'build_playbook', title: 'Build My Playbook', desc: 'Your personal record of triggers, resets, and if-then rules.', icon: '❦', href: 'psychology-playbook.html' },
  { key: 'weekly_review', title: 'Weekly Psychology Review', desc: 'A private weekly look at your execution and mindset — coming soon.', icon: '◔', href: null, comingSoon: true },
  { key: 'ask_question', title: 'Ask a Psychology Question', desc: 'Talk it through in your own words — coming soon.', icon: '?', href: null, comingSoon: true },
];

export const EMPTY_STATES = {
  patternMirror: 'Your Pattern Mirror is still learning from the information you choose to share. Complete a few trade journals or psychology check-ins to begin identifying evidence-based patterns.',
  aiUnavailable: 'Your AI coach is temporarily unavailable. You can still use the Pre-Trade Check, Post-Loss Reset, Playbook, and Scenario Labs.',
  noLessonMatch: 'No exact lesson match was found. Save this as a current focus or explore the Psychology curriculum.',
  dashboardCard: 'Complete a few journal entries and psychology check-ins to begin discovering your patterns.',
};

export const COOLDOWN_END_QUESTION = 'Has the setup changed, or has only the urgency changed?';
