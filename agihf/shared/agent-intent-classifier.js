/**
 * agent-intent-classifier.js — A Girl & Her Futures™
 *
 * Free, deterministic keyword matching — no AI call. This is the core of
 * the cost-redesigned AGHF Agent: most typed messages get routed into an
 * existing free guided flow (psychology-rules-engine.js's TALK_TRIGGERS)
 * or a free static knowledge lookup (psychology-knowledge-data.js) before
 * the model is ever touched. The AI is reserved for a single synthesis
 * call once real structured context exists, not for understanding intent.
 *
 * This is intentionally simple substring/keyword matching, not a model
 * call — a false "open" classification just means the member gets routed
 * to the (still-free) open-question path one turn later, never a wrong
 * or unsafe answer.
 */

import { TALK_TRIGGERS } from './psychology-rules-engine.js';
import { PSYCHOLOGY_KNOWLEDGE } from './psychology-knowledge-data.js';

const TRIGGER_KEYWORDS = {
  want_to_chase: ['chase', 'chasing', 'missed the move', 'missed it', 'catch the move'],
  afraid_to_enter: ['afraid to enter', 'scared to enter', "can't pull the trigger", 'hesitat', 'freeze', 'freezing'],
  just_lost: ['just lost', 'took a loss', 'just took a loss', 'red day', 'lost money'],
  want_another_trade: ['another trade', 'one more trade', 'take another', 'revenge'],
  panicking_in_trade: ['panick', 'panic', 'freaking out', 'in a trade and'],
  want_to_move_stop: ['move my stop', 'moving my stop', 'move stop', 'widen my stop', 'widening my stop'],
  exited_too_early: ['exited too early', 'exit early', 'cut my winner', 'cutting winners', 'closed too early', 'sold too early'],
  broke_my_rules: ['broke my rules', 'broke a rule', 'break my rules', 'ignored my plan'],
  dont_trust_strategy: ["don't trust my strategy", 'dont trust my strategy', "don't trust my setup", "can't trust", 'doubt my strategy', 'doubting my strategy'],
  feeling_overconfident: ['overconfident', 'winning streak', 'on a roll', 'feel invincible'],
};

/**
 * @param {string} text
 * @returns {{type:'talk_trigger', key:string, label:string}|{type:'concept', entry:object}|{type:'open'}}
 */
export function classifyIntent(text) {
  if (!text) return { type: 'open' };
  const t = text.toLowerCase();

  for (const trigger of TALK_TRIGGERS) {
    const keywords = TRIGGER_KEYWORDS[trigger.key] || [];
    if (keywords.some((kw) => t.includes(kw))) {
      return { type: 'talk_trigger', key: trigger.key, label: trigger.label };
    }
  }

  const conceptHit = PSYCHOLOGY_KNOWLEDGE.find((entry) =>
    entry.topicTags.some((tag) => t.includes(tag.toLowerCase())) || t.includes(entry.title.toLowerCase())
  );
  if (conceptHit) return { type: 'concept', entry: conceptHit };

  return { type: 'open' };
}
