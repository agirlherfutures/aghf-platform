/**
 * agent-tools.js — A Girl & Her Futures™
 *
 * The AGHF Agent's write-action registry. In the single-AI-call-per-turn
 * architecture (see agent-chat.js), the model never calls a tool directly
 * mid-conversation — everything it can do is expressed as one fenced
 * block at the end of its one response (```action```/```component```/
 * ```launch```, all documented in agent-system-prompt.js and parsed in
 * agent-chat.js). This file is what's left of the tool surface that is
 * actually still reachable: the 5 write actions.
 *
 * Read-only data retrieval (trades/checklists/patterns/rule-adherence/
 * emotions/prior-sessions/playbook/academy-progress) and the interactive-
 * component/launch/Dayli-ICC-rules/knowledge-lookup capabilities that used
 * to live here as tools were superseded by agent-context-builder.js's
 * deterministic pre-fetch (<observed_data>/<member_data>/<approved_sources>
 * blocks, built before the one model call) and by agent-chat.js parsing
 * ```component```/```launch``` blocks directly — there is no longer a
 * live tool-calling loop for the model to invoke them through, so keeping
 * their old TOOL_REGISTRY entries around would just be dead, unreachable
 * code that misleads future readers (as it did until this cleanup).
 *
 * Write tools NEVER touch the database directly: `run()` only ever inserts
 * an `agent_actions` row in `preview` status and returns it for the client
 * to render as an approve/decline card — the actual INSERT/UPDATE only
 * happens from a second, independent call to PATCH /api/agent-actions
 * after the member approves (see that file).
 */

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

/** @type {Record<string, {run: Function}>} */
export const TOOL_REGISTRY = {
  create_if_then_rule: {
    run: (ctx, input) => previewWrite(ctx, 'create_if_then_rule', { category: 'if_then_rules', title: `If ${input.ifCondition}...`, content: `If ${input.ifCondition}, then I will ${input.thenAction}.` }),
  },
  add_playbook_insight: {
    run: (ctx, input) => previewWrite(ctx, 'add_playbook_insight', input),
  },
  create_practice_plan: {
    run: (ctx, input) => previewWrite(ctx, 'create_practice_plan', { category: 'practice_plan', title: input.title, content: input.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') }),
  },
  update_current_focus: {
    run: (ctx, input) => previewWrite(ctx, 'update_current_focus', input),
  },
  save_conversation_summary: {
    run: (ctx, input) => previewWrite(ctx, 'save_conversation_summary', input),
  },
};
