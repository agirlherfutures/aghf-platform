/**
 * agent-memory-safety.js — A Girl & Her Futures™
 *
 * A narrow content filter blocking a fixed set of negative trait labels
 * from ever being persisted as agent memory or a saved Playbook/action
 * write — the spec is explicit that observable, member-approved language
 * is fine ("moved my stop three times this week") but a fixed trait label
 * ("undisciplined," "reckless," "addicted," "emotional trader," "bad
 * trader") is not, regardless of who proposed it or whether it was
 * approved. Deliberately exact/near-exact phrase matching only — no
 * sentiment analysis, no broad word list — so it never false-positives on
 * normal coaching language ("felt anxious," "moved too fast").
 */

const DENIED_TRAIT_PATTERNS = [
  /\bundisciplined\b/i,
  /\breckless\b/i,
  /\baddict(?:ed|ion)?\b/i,
  /\bemotional trader\b/i,
  /\bbad trader\b/i,
];

export function containsDeniedTraitLabel(text) {
  if (!text || typeof text !== 'string') return false;
  return DENIED_TRAIT_PATTERNS.some((re) => re.test(text));
}

export const DENIED_TRAIT_MESSAGE = 'Try rephrasing that in terms of what happened, not a fixed trait — the AGHF Agent can’t save a fixed negative label like that.';
