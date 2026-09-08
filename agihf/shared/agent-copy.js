/**
 * agent-copy.js — A Girl & Her Futures™
 *
 * Centralized labels/copy for the AGHF Agent, replacing psychology-copy.js's
 * old FEATURE_NAME/NAV_LABEL role for the primary experience. "The Inner
 * Edge" is retired as the primary feature name per this redesign — it
 * does not resurface anywhere in this file.
 */

export const NAV_LABEL = 'AGHF Agent';
export const MAIN_TITLE = 'Meet the AGHF Agent';
export const DESCRIPTION = 'Your intelligent trading psychology and execution coach.';
export const MAIN_PROMPT = 'What’s happening with your trading right now?';
export const SUPPORTING_COPY = 'Ask a question, unpack a trading pattern, analyze your execution, or build a plan for what to do differently next time.';

/**
 * Contextual action chips — what used to be 6 always-visible response-mode
 * buttons is now 2-4 chips the AGHF Agent suggests per turn (its own
 * `routing.suggestedActions`, validated server-side in agent-chat.js
 * against this exact same key set). Each entry is one of:
 *   - 'attach'    → opens the existing attach popover, optionally
 *                   pre-selecting `attachType` (matches ATTACHMENT_ACTIONS
 *                   below).
 *   - 'launch'    → opens an existing inline tool panel directly,
 *                   client-side, no round trip to the model — `launchType`
 *                   matches the launch block's launchType values.
 *   - 'synthetic' → sends `prompt` as a normal chat message.
 *   - 'save'      → invokes an existing per-message action (Save an
 *                   Insight) directly on the last assistant reply.
 *   - 'link'      → navigates to another page.
 */
export const CONTEXTUAL_ACTIONS = {
  review_trade: { label: 'Review the Trade', behavior: 'attach', attachType: 'trade' },
  attach_trade: { label: 'Attach a Trade', behavior: 'attach', attachType: 'trade' },
  compare_recent_trades: { label: 'Compare Recent Trades', behavior: 'attach', attachType: 'trade' },
  review_this_week: { label: 'Review This Week', behavior: 'attach', attachType: 'week' },
  attach_checklist: { label: 'Attach My Checklist', behavior: 'attach', attachType: 'checklist' },
  attach_journal: { label: 'Attach My Journal', behavior: 'attach', attachType: 'journal' },
  find_the_trigger: { label: 'Find the Trigger', behavior: 'synthetic', prompt: 'Help me find the trigger behind this.' },
  explain_concept: { label: 'Explain This Concept', behavior: 'synthetic', prompt: 'Can you explain that concept in a bit more depth?' },
  show_example: { label: 'Show Me an Example', behavior: 'synthetic', prompt: 'Can you show me a concrete trading example of that?' },
  challenge_belief: { label: 'Challenge This Belief', behavior: 'synthetic', prompt: 'I want you to challenge my thinking on this.' },
  build_rule: { label: 'Build a Rule for Next Time', behavior: 'synthetic', prompt: 'Help me build a rule for next time this comes up.' },
  create_practice_plan: { label: 'Create a Practice Plan', behavior: 'synthetic', prompt: 'Can you build me a short practice plan for this?' },
  start_post_loss_reset: { label: 'Start a Post-Loss Reset', behavior: 'launch', launchType: 'post_loss_reset' },
  start_cooldown: { label: 'Start a Cooldown', behavior: 'launch', launchType: 'cooldown_timer' },
  practice_scenario: { label: 'Practice This Scenario', behavior: 'launch', launchType: 'scenario_lab' },
  save_insight: { label: 'Save This Insight', behavior: 'save' },
  add_to_playbook: { label: 'Add to My Playbook', behavior: 'synthetic', prompt: 'Add that to my Playbook.' },
  make_weekly_focus: { label: 'Make This My Weekly Focus', behavior: 'synthetic', prompt: 'Make this my weekly focus.' },
  open_recommended_lesson: { label: 'Open the Recommended Lesson', behavior: 'link', href: 'lessons.html' },
  continue_without_data: { label: 'Continue Without My Data', behavior: 'synthetic', prompt: 'Continue without attaching anything.' },
  go_deeper: { label: 'Go Deeper', behavior: 'synthetic', prompt: 'Can you go deeper on that?' },
};

export const SUGGESTED_PROMPTS = [
  'Why do I keep moving my stop even though I know better?',
  'I’ve lost four trades this week and now I don’t trust my strategy.',
  'Is this fear, or was my setup genuinely unclear?',
  'Why do I make money and then give it all back?',
  'I missed the entry. Talk me out of chasing.',
  'Help me stop cutting my winning trades early.',
  'Create a plan for rebuilding confidence after drawdown.',
  'Teach me about outcome bias.',
  'Analyze my journal entries from this week.',
];

export const ATTACHMENT_ACTIONS = [
  { key: 'trade', label: 'Add a Trade', icon: '📊' },
  { key: 'journal', label: 'Add Journal Entry', icon: '✎' },
  { key: 'checklist', label: 'Add Checklist', icon: '▤' },
  { key: 'screenshot', label: 'Add Screenshot', icon: '🖼' },
  { key: 'week', label: 'Select This Week', icon: '📅' },
  { key: 'date_range', label: 'Select Date Range', icon: '🗓' },
];

export const EMPTY_STATES = {
  aiUnavailable: 'The AGHF Agent is temporarily unavailable. Your saved conversations, Playbook, resets, and Scenario Labs are still available.',
  noDataAccess: 'You can ask any general trading-psychology question. Attach a trade or enable selected data access when you want a personalized analysis.',
  insufficientEvidence: 'I don’t have enough evidence to call this a repeating pattern yet. We can explore the current situation or compare more trades.',
};

export const DASHBOARD_CARD = {
  title: 'Ask the AGHF Agent',
  body: 'Unpack a trading decision, review a pattern, or ask anything about trading psychology.',
  buttonLabel: 'Open AGHF Agent',
};

export const IMAGE_CAVEAT = 'Image reads can be imperfect — I’ll treat anything I see as tentative, never a trade signal.';
export const VOICE_DISCLOSURE = 'Voice input uses your browser’s built-in speech recognition, which may send audio to your browser vendor for transcription.';
