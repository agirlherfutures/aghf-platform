/**
 * agent-tools.js — A Girl & Her Futures™
 *
 * The AGHF Agent's entire allowlisted tool surface. The model is only
 * ever handed the JSON schemas in TOOL_SCHEMAS — it never receives a
 * userId parameter to fill in; `executeTool()` always injects the
 * server-verified userId itself, so a tool call structurally cannot
 * address another member's records no matter what the model asks for.
 *
 * Read-only tools run immediately once the matching psychology_profiles
 * consent flag is on (or the record was explicitly attached this turn —
 * see agent-chat.js). Write tools NEVER touch the database directly:
 * `run()` only ever inserts an `agent_actions` row in `preview` status
 * and returns it for the client to render as an approve/decline card —
 * the actual INSERT/UPDATE only happens from a second, independent call
 * to PATCH /api/agent-actions after the member approves (see that file).
 */

import { fetchTradesInRange, fetchChecklistsFor } from './agent-context-builder.js';
import { computeObservedMetrics, detectPatterns } from './agent-pattern-engine.js';
import { findKnowledgeEntries } from '../../shared/psychology-knowledge-data.js';
import { CHECKLIST_PHASES, WALK_AWAY_CONDITIONS, GOLDEN_RULE } from '../../shared/checklist-template.js';
import { PHASES, totalLessonCount } from '../../shared/curriculum-data.js';

const CONSENT_DENIED = (consentKey) => ({
  forModel: { error: 'not_authorized', message: `The member has not granted access to this data category (${consentKey}). Ask her whether she'd like to enable it, or attach a specific record instead.` },
  forClient: { kind: 'consent_needed', consentKey },
});

function tradesPreview(trades) {
  return trades.slice(0, 10).map((t) => ({
    id: t.id, date: t.tradeDate, instrument: t.instrument, direction: t.direction,
    outcome: t.outcomeOverride || t.outcome, netPnl: t.netPnl, entryTags: t.entryTags, exitTags: t.exitTags,
    ruleViolations: t.ruleViolations, ruleCheck: t.ruleCheck, executionScore: t.executionScore,
  }));
}

async function findLessonByKeyword(keyword) {
  const kw = keyword.toLowerCase();
  for (const phase of PHASES) {
    for (const section of phase.sections) {
      for (const lesson of section.lessons) {
        if ((lesson.title || '').toLowerCase().includes(kw)) {
          return { type: 'lesson', id: `${phase.key}-${lesson.n}`, title: lesson.title, phase: phase.title, section: section.title };
        }
      }
    }
  }
  return null;
}

/** @type {Record<string, {schema: object, readOnly: boolean, consentKey: string|null, run: Function}>} */
export const TOOL_REGISTRY = {
  retrieve_trades: {
    readOnly: true,
    consentKey: 'tradeData',
    schema: {
      name: 'retrieve_trades',
      description: 'Retrieve the member\'s own logged trades in a date range, already reduced to structured fields (direction, outcome, tags, rule violations, execution score) — never free-text reasoning unless journalFreetext is also authorized.',
      input_schema: { type: 'object', properties: { from: { type: 'string', description: 'YYYY-MM-DD' }, to: { type: 'string', description: 'YYYY-MM-DD' }, limit: { type: 'number' } }, required: [] },
    },
    run: async ({ supabase, userId }, input) => {
      const trades = await fetchTradesInRange(supabase, userId, input);
      return { forModel: { tradeCount: trades.length, metrics: computeObservedMetrics(trades, []) }, forClient: { kind: 'data', dataType: 'trades', tradeCount: trades.length, preview: tradesPreview(trades) } };
    },
  },
  retrieve_checklist: {
    readOnly: true,
    consentKey: 'checklistAnswers',
    schema: {
      name: 'retrieve_checklist',
      description: 'Retrieve one or more of the member\'s saved Dayli ICC trade checklists by id.',
      input_schema: { type: 'object', properties: { checklistIds: { type: 'array', items: { type: 'string' } } }, required: ['checklistIds'] },
    },
    run: async ({ supabase, userId }, input) => {
      const checklists = await fetchChecklistsFor(supabase, userId, input.checklistIds || []);
      return { forModel: { checklists: checklists.map((c) => ({ id: c.id, date: c.tradingDate, completionPct: c.completionPct })) }, forClient: { kind: 'data', dataType: 'checklists', checklists } };
    },
  },
  compare_trades: {
    readOnly: true,
    consentKey: 'tradeData',
    schema: {
      name: 'compare_trades',
      description: 'Compare 2 or more specific trades side by side by id — useful when the member references "my last few trades" or asks to contrast a win against a loss.',
      input_schema: { type: 'object', properties: { tradeIds: { type: 'array', items: { type: 'string' }, minItems: 2 } }, required: ['tradeIds'] },
    },
    run: async ({ supabase, userId }, input) => {
      const trades = await fetchTradesInRange(supabase, userId, { ids: input.tradeIds, limit: input.tradeIds.length });
      return { forModel: { trades: tradesPreview(trades) }, forClient: { kind: 'data', dataType: 'trade_comparison', trades: tradesPreview(trades) } };
    },
  },
  calculate_behavior_patterns: {
    readOnly: true,
    consentKey: 'tradeData',
    schema: {
      name: 'calculate_behavior_patterns',
      description: 'Run the deterministic pattern engine over the member\'s recent trades/checklists to surface evidence-scored behavioral patterns (e.g. lowered standards after a loss, cutting winners early). Never call this on fewer than a handful of trades — it will simply report there is not enough evidence.',
      input_schema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: [] },
    },
    run: async ({ supabase, userId, conversationId }, input) => {
      const trades = await fetchTradesInRange(supabase, userId, { from: input.from, to: input.to, limit: 60 });
      const checklistIds = [...new Set(trades.map((t) => t.checklistId).filter(Boolean))];
      const checklists = await fetchChecklistsFor(supabase, userId, checklistIds);
      const patterns = detectPatterns(trades, checklists);
      for (const p of patterns) {
        await supabase.from('psychology_patterns').insert({
          user_id: userId, pattern_type: p.patternType, evidence_window: p.evidenceWindow || {},
          supporting_record_ids: p.supportingRecordIds, evidence_count: p.evidenceCount,
          evidence_strength: p.evidenceStrength, rules_findings: { observedFacts: p.observedFacts },
          ai_interpretation: p.possibleInterpretation, recommended_lesson_id: p.recommendedLessonId,
        }).select('id').single().then(() => {}).catch((e) => console.error('psychology_patterns insert error', e));
      }
      if (!patterns.length) {
        return { forModel: { patternsFound: 0, tradeCount: trades.length, message: trades.length < 3 ? 'Not enough trades yet to evaluate a pattern.' : 'No pattern cleared the evidence threshold on this data.' }, forClient: { kind: 'no_pattern', tradeCount: trades.length } };
      }
      return { forModel: { patternsFound: patterns.length, patterns: patterns.map((p) => ({ type: p.patternType, evidenceCount: p.evidenceCount, strength: p.evidenceStrength, observedFacts: p.observedFacts, possibleInterpretation: p.possibleInterpretation })) }, forClient: { kind: 'pattern', patterns } };
    },
  },
  review_rule_adherence: {
    readOnly: true,
    consentKey: 'checklistAnswers',
    schema: { name: 'review_rule_adherence', description: 'Compute the member\'s rule-follow rate and checklist-completion rate over her recent trades.', input_schema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: [] } },
    run: async ({ supabase, userId }, input) => {
      const trades = await fetchTradesInRange(supabase, userId, input);
      const metrics = computeObservedMetrics(trades, []);
      return { forModel: { ruleFollowRatePct: metrics.ruleFollowRatePct, checklistCompletionPct: metrics.checklistCompletionPct }, forClient: { kind: 'data', dataType: 'rule_adherence', metrics } };
    },
  },
  review_emotion_frequency: {
    readOnly: true,
    consentKey: 'emotions',
    schema: { name: 'review_emotion_frequency', description: 'Get the most frequently logged structured emotions across the member\'s recent trades.', input_schema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: [] } },
    run: async ({ supabase, userId }, input) => {
      const trades = await fetchTradesInRange(supabase, userId, input);
      const metrics = computeObservedMetrics(trades, []);
      return { forModel: { topEmotions: metrics.topEmotions }, forClient: { kind: 'data', dataType: 'emotions', topEmotions: metrics.topEmotions } };
    },
  },
  retrieve_prior_sessions: {
    readOnly: true,
    consentKey: 'sessionHistory',
    schema: { name: 'retrieve_prior_sessions', description: 'List the member\'s recent coaching-tool sessions (Pre-Trade Check, Post-Loss Reset, etc.) and prior agent conversation titles — summaries only, never full conversation text.', input_schema: { type: 'object', properties: { limit: { type: 'number' } }, required: [] } },
    run: async ({ supabase, userId }, input) => {
      const limit = input.limit || 10;
      const [{ data: sessions }, { data: convos }] = await Promise.all([
        supabase.from('psychology_sessions').select('mode, readiness_result, recommended_action, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
        supabase.from('agent_conversations').select('title, response_mode, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(limit),
      ]);
      return { forModel: { sessions: sessions || [], conversations: convos || [] }, forClient: { kind: 'data', dataType: 'prior_sessions', sessions: sessions || [], conversations: convos || [] } };
    },
  },
  retrieve_playbook: {
    readOnly: true,
    consentKey: 'playbook',
    schema: { name: 'retrieve_playbook', description: 'Retrieve the member\'s saved Trading Psychology Playbook entries.', input_schema: { type: 'object', properties: { category: { type: 'string' } }, required: [] } },
    run: async ({ supabase, userId }, input) => {
      let query = supabase.from('psychology_playbook_items').select('*').eq('user_id', userId).eq('is_archived', false);
      if (input.category) query = query.eq('category', input.category);
      const { data } = await query.order('pinned', { ascending: false });
      return { forModel: { items: (data || []).map((i) => ({ category: i.category, title: i.title, content: i.content })) }, forClient: { kind: 'data', dataType: 'playbook', items: data || [] } };
    },
  },
  retrieve_academy_progress: {
    readOnly: true,
    consentKey: 'academyProgress',
    schema: { name: 'retrieve_academy_progress', description: 'Get the member\'s Academy lesson-completion progress.', input_schema: { type: 'object', properties: {}, required: [] } },
    run: async ({ supabase, userId }) => {
      const { count } = await supabase.from('lessons_completed').select('lesson_id', { count: 'exact', head: true }).eq('user_id', userId);
      return { forModel: { lessonsCompleted: count || 0, totalLessons: totalLessonCount() }, forClient: { kind: 'data', dataType: 'academy_progress', lessonsCompleted: count || 0, totalLessons: totalLessonCount() } };
    },
  },
  retrieve_lesson_or_concept: {
    readOnly: true,
    consentKey: null,
    schema: {
      name: 'retrieve_lesson_or_concept',
      description: 'Look up an approved AGHF Academy lesson or a curated trading-psychology concept by topic keyword (e.g. "revenge trading", "4H bias", "loss aversion"). Never invent a Dayli ICC rule — if it isn\'t returned here or in the Golden Rule/checklist context, it isn\'t an approved rule.',
      input_schema: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'] },
    },
    run: async (_ctx, input) => {
      const concepts = findKnowledgeEntries(input.topic);
      const lesson = await findLessonByKeyword(input.topic);
      if (!concepts.length && !lesson) return { forModel: { found: false }, forClient: { kind: 'no_match' } };
      return {
        forModel: { concepts: concepts.map((c) => ({ title: c.title, content: c.content, sourceType: c.sourceType })), lesson },
        forClient: { kind: 'sources', concepts, lesson },
      };
    },
  },
  retrieve_dayli_icc_rules: {
    readOnly: true,
    consentKey: null,
    schema: { name: 'retrieve_dayli_icc_rules', description: 'Retrieve the approved Dayli ICC method rules (Golden Rule, walk-away conditions, checklist phases) — the ONLY source of truth for method rules. Never state a method rule that isn\'t here.', input_schema: { type: 'object', properties: {}, required: [] } },
    run: async () => ({ forModel: { goldenRule: GOLDEN_RULE, walkAwayConditions: WALK_AWAY_CONDITIONS, phases: CHECKLIST_PHASES.map((p) => ({ title: p.title, summary: p.summary })) }, forClient: { kind: 'sources', dayliIcc: true } }),
  },

  // ── Write tools — always create a preview-only agent_actions row ──
  create_if_then_rule: {
    readOnly: false,
    schema: { name: 'create_if_then_rule', description: 'Propose a personal if-then rule to save to the member\'s Playbook. This is a PREVIEW ONLY — it will not save until the member approves the card shown to her.', input_schema: { type: 'object', properties: { ifCondition: { type: 'string' }, thenAction: { type: 'string' } }, required: ['ifCondition', 'thenAction'] } },
    run: (ctx, input) => previewWrite(ctx, 'create_if_then_rule', { category: 'if_then_rules', title: `If ${input.ifCondition}...`, content: `If ${input.ifCondition}, then I will ${input.thenAction}.` }),
  },
  add_playbook_insight: {
    readOnly: false,
    schema: { name: 'add_playbook_insight', description: 'Propose saving an insight to a specific Playbook category. PREVIEW ONLY.', input_schema: { type: 'object', properties: { category: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['category', 'title', 'content'] } },
    run: (ctx, input) => previewWrite(ctx, 'add_playbook_insight', input),
  },
  create_practice_plan: {
    readOnly: false,
    schema: { name: 'create_practice_plan', description: 'Propose a short, personalized practice plan (a title and an ordered list of concrete steps) built from what was uncovered in this conversation. PREVIEW ONLY.', input_schema: { type: 'object', properties: { title: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } } }, required: ['title', 'steps'] } },
    run: (ctx, input) => previewWrite(ctx, 'create_practice_plan', { category: 'practice_plan', title: input.title, content: input.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') }),
  },
  update_current_focus: {
    readOnly: false,
    schema: { name: 'update_current_focus', description: 'Propose updating the member\'s dashboard "Current Focus" (shown on her Dayli Desk). PREVIEW ONLY.', input_schema: { type: 'object', properties: { focusTitle: { type: 'string' }, focusBody: { type: 'string' } }, required: ['focusTitle', 'focusBody'] } },
    run: (ctx, input) => previewWrite(ctx, 'update_current_focus', input),
  },
  save_conversation_summary: {
    readOnly: false,
    schema: { name: 'save_conversation_summary', description: 'Propose a short title/summary for this conversation, optionally saved as a remembered pattern. PREVIEW ONLY.', input_schema: { type: 'object', properties: { title: { type: 'string' }, memoryContent: { type: 'string' } }, required: ['title'] } },
    run: (ctx, input) => previewWrite(ctx, 'save_conversation_summary', input),
  },

  show_interactive_component: {
    readOnly: true, consentKey: null,
    schema: {
      name: 'show_interactive_component',
      description: 'Show a small interactive check inline in the conversation instead of just asking in text — use when a quick structured answer would be clearer than free text. The member\'s answer comes back to you as her next message.',
      input_schema: {
        type: 'object',
        properties: {
          component: { type: 'string', enum: ['belief_check', 'urge_check', 'execution_check', 'evidence_comparison', 'action_plan'] },
          statement: { type: 'string', description: 'For belief_check: the belief statement to rate 1-5.' },
          summary: { type: 'string', description: 'For evidence_comparison: the contradiction being surfaced.' },
          title: { type: 'string', description: 'For action_plan: the rule\'s title.' },
          steps: { type: 'array', items: { type: 'string' }, description: 'For action_plan: the ordered if-then steps.' },
        },
        required: ['component'],
      },
    },
    run: async (_ctx, input) => ({ forModel: { shown: input.component }, forClient: { kind: 'interactive_component', component: input.component, data: input } }),
  },

  // ── UI-launch tools — no DB write, just tell the client what to mount ──
  launch_scenario_lab: {
    readOnly: true, consentKey: null,
    schema: { name: 'launch_scenario_lab', description: 'Suggest practicing a specific trading-psychology scenario with no money at risk, inside the conversation.', input_schema: { type: 'object', properties: { scenarioId: { type: 'string' } }, required: [] } },
    run: async (_ctx, input) => ({ forModel: { launched: 'scenario_lab' }, forClient: { kind: 'launch', launchType: 'scenario_lab', scenarioId: input.scenarioId || null } }),
  },
  start_cooldown_timer: {
    readOnly: true, consentKey: null,
    schema: { name: 'start_cooldown_timer', description: 'Offer to start a short cooldown timer (breathing prompt + walk-away rule reminder) right in the conversation.', input_schema: { type: 'object', properties: {}, required: [] } },
    run: async () => ({ forModel: { launched: 'cooldown_timer' }, forClient: { kind: 'launch', launchType: 'cooldown_timer' } }),
  },
  create_post_loss_reset: {
    readOnly: true, consentKey: null,
    schema: { name: 'create_post_loss_reset', description: 'Offer to start the guided Post-Loss Reset flow right in the conversation.', input_schema: { type: 'object', properties: {}, required: [] } },
    run: async () => ({ forModel: { launched: 'post_loss_reset' }, forClient: { kind: 'launch', launchType: 'post_loss_reset' } }),
  },
  launch_pre_trade_check: {
    readOnly: true, consentKey: null,
    schema: { name: 'launch_pre_trade_check', description: 'Offer to start the 30-second Pre-Trade Mental Check right in the conversation.', input_schema: { type: 'object', properties: {}, required: [] } },
    run: async () => ({ forModel: { launched: 'pre_trade_check' }, forClient: { kind: 'launch', launchType: 'pre_trade_check' } }),
  },
};

async function previewWrite({ supabase, userId, conversationId }, actionType, previewPayload) {
  const { data, error } = await supabase.from('agent_actions')
    .insert({ user_id: userId, conversation_id: conversationId || null, action_type: actionType, preview_payload: previewPayload, approval_status: 'preview' })
    .select('*').single();
  if (error) return { forModel: { error: 'Could not create a preview.' }, forClient: null };
  return {
    forModel: { message: 'A preview card was shown to the member. Do not claim this was saved — it only saves if she approves it.' },
    forClient: { kind: 'write_preview', actionId: data.id, actionType, previewPayload },
  };
}

export const TOOL_SCHEMAS = Object.values(TOOL_REGISTRY).map((t) => t.schema);

/**
 * @param {{supabase: any, userId: string, conversationId: string|null, consent: Object, personalizationEnabled: boolean}} ctx
 */
export async function executeTool(ctx, toolName, rawInput = {}) {
  const tool = TOOL_REGISTRY[toolName];
  if (!tool) return { forModel: { error: `Unknown tool: ${toolName}` }, forClient: null };
  if (tool.readOnly && tool.consentKey && !(ctx.personalizationEnabled && ctx.consent?.[tool.consentKey])) {
    return CONSENT_DENIED(tool.consentKey);
  }
  try {
    return await tool.run(ctx, rawInput);
  } catch (err) {
    console.error(`Agent tool "${toolName}" error:`, err);
    return { forModel: { error: 'That lookup failed on our end.' }, forClient: { kind: 'error' } };
  }
}
