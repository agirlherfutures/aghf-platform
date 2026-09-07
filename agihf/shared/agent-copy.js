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

export const RESPONSE_MODES = [
  { key: 'quick_answer', label: 'Quick Answer', desc: 'The clearest useful answer, no long session.' },
  { key: 'coach_me', label: 'Coach Me', desc: 'One thoughtful question at a time.' },
  { key: 'analyze_data', label: 'Analyze My Data', desc: 'Trades, checklists, journal, emotions.' },
  { key: 'challenge_me', label: 'Challenge Me', desc: 'Surface contradictions, kindly.' },
  { key: 'teach_me', label: 'Teach Me', desc: 'Explain the concept, deeply.' },
  { key: 'build_plan', label: 'Build Me a Plan', desc: 'Turn this into a practice plan or rule.' },
];

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
