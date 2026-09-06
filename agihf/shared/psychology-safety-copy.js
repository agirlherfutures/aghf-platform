/**
 * psychology-safety-copy.js — A Girl & Her Futures™
 *
 * Configurable, non-AI-generated safety copy. Per the feature spec: "Do
 * not rely only on free-form AI generation for serious safety responses"
 * — these strings are shown verbatim whenever psychology-safety.js's
 * deterministic scan flags a member's free-text input, in both the
 * non-AI (Phase 2) and future AI-assisted (Phase 3) coaching flows.
 */

export const CRISIS_RESPONSE = {
  heading: 'Let’s pause here.',
  body: 'What you’ve written matters more than anything happening in the market right now. The Inner Edge isn’t able to provide the kind of support this moment calls for — but real, immediate help is available.',
  actions: [
    { label: 'If you’re in the US, call or text 988 (Suicide & Crisis Lifeline)', href: 'tel:988' },
    { label: 'If you’re outside the US, contact your local emergency number', href: null },
    { label: 'Reach out to someone you trust right now', href: null },
  ],
  footer: 'This conversation is not being continued as a trading session.',
};

export const TRADING_HARM_RESPONSE = {
  heading: 'This looks like it may have moved past a trading-psychology question.',
  body: 'Repeatedly exceeding your own limits, trying to recover losses, or being unable to stop are patterns worth taking seriously with a qualified person — not something this coach can safely help you push through in the moment.',
  actions: [
    { label: 'Consider stopping trading for today', href: null },
    { label: 'Talk to someone you trust about what’s been happening', href: null },
    { label: 'A financial counselor or therapist can help with patterns like this', href: null },
  ],
  footer: 'This coach will not suggest a way to keep trading through this.',
};

/** Configurable escalation categories — extend here, not by editing the scanner's prose. */
export const ESCALATION_CATEGORIES = {
  self_harm: 'crisis',
  crisis: 'crisis',
  gambling_loss_of_control: 'trading_harm',
  cannot_stop_trading: 'trading_harm',
};
