/**
 * agent-context-builder.js — A Girl & Her Futures™
 *
 * Decides what member data, if any, is fetched for one chat turn and
 * assembles it into a small, explicitly-labeled block — never a raw
 * history dump. Two deliberate ways this stays "minimum necessary data":
 *
 * 1. Only two things ever trigger a proactive fetch of the member's own
 *    records: (a) the member explicitly attaching a record/date-range to
 *    this message, or (b) selecting "Analyze My Data" mode with the
 *    matching consent flags on. There is no live tool-calling loop in
 *    this single-call-per-turn architecture (see agent-chat.js) — every
 *    other mode fetches nothing up front, and the "ask a follow-up
 *    question first, investigate second" behavior the product spec
 *    requires happens across HTTP turns instead: conversation history is
 *    passed back on the next call, so the model can ask a question here
 *    and reason over her answer once it arrives, without needing to
 *    fetch anything mid-turn.
 * 2. Whatever IS fetched is immediately reduced to a deterministic
 *    summary (agent-pattern-engine.js) — the model is handed metrics and
 *    detected patterns, never the raw row set, and every summary is
 *    capped so a large history can't balloon the prompt.
 */

import { computeObservedMetrics, detectPatterns } from './agent-pattern-engine.js';
import { findKnowledgeEntries } from '../../shared/psychology-knowledge-data.js';

const MAX_TRADES_PER_TURN = 25;
const MAX_MEMBER_TEXT_CHARS = 2000;

function tradeRowToShape(row) {
  return {
    id: row.id, tradeDate: row.trade_date, entryTime: row.entry_time, instrument: row.instrument,
    direction: row.direction, contracts: row.contracts, netPnl: row.net_pnl, plannedRisk: row.planned_risk,
    outcome: row.outcome, outcomeOverride: row.outcome_override, entryTags: row.entry_tags || [],
    exitTags: row.exit_tags || [], ruleViolations: row.rule_violations || [], iccChecklist: row.icc_checklist,
    checklistId: row.checklist_id, executionScore: row.execution_score, ruleCheck: row.rule_check,
    emotions: row.emotions || {}, entryReasoning: row.entry_reasoning, exitReasoning: row.exit_reasoning,
    createdAt: row.created_at,
  };
}

function checklistRowToShape(row) {
  return { id: row.id, tradingDate: row.trading_date, completionPct: row.completion_pct, marketContext: row.market_context || {} };
}

export async function fetchTradesInRange(supabase, userId, { from, to, ids, limit = MAX_TRADES_PER_TURN }) {
  let query = supabase.from('journal_entries').select('*').eq('user_id', userId).eq('entry_type', 'trade').eq('is_draft', false).eq('excluded_from_agent', false);
  if (ids?.length) query = query.in('id', ids);
  if (from) query = query.gte('trade_date', from);
  if (to) query = query.lte('trade_date', to);
  const { data, error } = await query.order('trade_date', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []).map(tradeRowToShape);
}

export async function fetchChecklistsFor(supabase, userId, checklistIds) {
  if (!checklistIds.length) return [];
  const { data, error } = await supabase.from('trade_checklists').select('*').eq('user_id', userId).eq('excluded_from_agent', false).in('id', checklistIds);
  if (error) throw error;
  return (data || []).map(checklistRowToShape);
}

function weekRange() {
  const now = new Date();
  const from = new Date(now); from.setDate(now.getDate() - 7);
  return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
}

/**
 * @param {{supabase: any, userId: string, consent: Object, personalizationEnabled: boolean, responseMode: string, attachments: Array, message: string}} opts
 */
export async function buildTurnContext({ supabase, userId, consent = {}, personalizationEnabled, attachments = [], message = '' }) {
  const tradeIds = attachments.filter((a) => a.type === 'trade' && a.id).map((a) => a.id);
  const weekAttachment = attachments.find((a) => a.type === 'week');
  const rangeAttachment = attachments.find((a) => a.type === 'date_range');

  let trades = [];
  let attachmentSummaries = [];

  if (tradeIds.length) {
    trades = await fetchTradesInRange(supabase, userId, { ids: tradeIds });
    attachmentSummaries.push({ type: 'trade', count: trades.length });
  } else if (weekAttachment) {
    trades = await fetchTradesInRange(supabase, userId, weekRange());
    attachmentSummaries.push({ type: 'week', count: trades.length });
  } else if (rangeAttachment) {
    trades = await fetchTradesInRange(supabase, userId, { from: rangeAttachment.metadata?.from, to: rangeAttachment.metadata?.to });
    attachmentSummaries.push({ type: 'date_range', count: trades.length, from: rangeAttachment.metadata?.from, to: rangeAttachment.metadata?.to });
  }

  const journalAttachmentIds = attachments.filter((a) => a.type === 'journal' && a.id).map((a) => a.id);
  let journalEntries = [];
  if (journalAttachmentIds.length && (consent.journalStructured || consent.journalFreetext)) {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', userId).eq('excluded_from_agent', false).in('id', journalAttachmentIds);
    journalEntries = data || [];
    attachmentSummaries.push({ type: 'journal', count: journalEntries.length });
  }

  const checklistAttachmentIds = attachments.filter((a) => a.type === 'checklist' && a.id).map((a) => a.id);
  let checklists = [];
  if (checklistAttachmentIds.length && consent.checklistAnswers) {
    checklists = await fetchChecklistsFor(supabase, userId, checklistAttachmentIds);
    attachmentSummaries.push({ type: 'checklist', count: checklists.length });
  }
  // Backfill checklists linked to whatever trades were resolved, so
  // checklist-completion metrics can be computed without a separate attach.
  if (trades.length && consent.checklistAnswers) {
    const linkedIds = [...new Set(trades.map((t) => t.checklistId).filter(Boolean))];
    const missing = linkedIds.filter((id) => !checklists.some((c) => c.id === id));
    if (missing.length) checklists = checklists.concat(await fetchChecklistsFor(supabase, userId, missing));
  }

  const hasAnyData = trades.length > 0 || journalEntries.length > 0 || checklists.length > 0;

  // Approved-knowledge grounding is never member data — no consent gate,
  // works even when nothing else was attached/authorized this turn.
  const matchedConcepts = findKnowledgeEntries(message, 2);

  const observedMetrics = consent.tradeData && trades.length ? computeObservedMetrics(trades, checklists) : null;
  const patterns = consent.tradeData && trades.length >= 3 ? detectPatterns(trades, checklists) : [];

  const memberDataParts = [];
  if (consent.journalFreetext) {
    journalEntries.forEach((j) => {
      if (j.entry_reasoning) memberDataParts.push(`Journal (${j.trade_date}): ${j.entry_reasoning}`);
    });
    trades.forEach((t) => {
      if (t.entryReasoning) memberDataParts.push(`Trade entry reasoning (${t.tradeDate}): ${t.entryReasoning}`);
      if (t.exitReasoning) memberDataParts.push(`Trade exit reasoning (${t.tradeDate}): ${t.exitReasoning}`);
    });
  }
  let memberDataBlock = memberDataParts.join('\n').slice(0, MAX_MEMBER_TEXT_CHARS);
  if (memberDataParts.join('\n').length > MAX_MEMBER_TEXT_CHARS) memberDataBlock += '\n[additional entries omitted — ask to narrow the range]';

  return {
    hasAnyData,
    noDataAccess: !hasAnyData,
    observedMetrics,
    patterns,
    attachmentSummaries,
    tradeCount: trades.length,
    dateRange: trades.length ? { from: trades[trades.length - 1].tradeDate, to: trades[0].tradeDate } : null,
    memberDataBlock: memberDataBlock || null,
    resolvedTradeIds: trades.map((t) => t.id),
    matchedConcepts,
  };
}

/** Renders the context object into the labeled prompt blocks the system prompt references by name. */
export function renderContextBlocks(ctx) {
  const approvedSourcesBlock = ctx.matchedConcepts?.length
    ? JSON.stringify(ctx.matchedConcepts.map((c) => ({ title: c.title, content: c.content, sourceType: c.sourceType })), null, 2)
    : null;

  if (ctx.noDataAccess) return { observedDataBlock: null, memberDataBlock: null, approvedSourcesBlock };
  const observed = {
    recordsReviewed: ctx.tradeCount,
    dateRange: ctx.dateRange,
    metrics: ctx.observedMetrics || undefined,
    detectedPatterns: ctx.patterns.length ? ctx.patterns.map((p) => ({
      patternType: p.patternType, evidenceCount: p.evidenceCount, evidenceStrength: p.evidenceStrength,
      observedFacts: p.observedFacts, possibleInterpretation: p.possibleInterpretation,
    })) : undefined,
    attachments: ctx.attachmentSummaries.length ? ctx.attachmentSummaries : undefined,
  };
  return {
    observedDataBlock: JSON.stringify(observed, null, 2),
    memberDataBlock: ctx.memberDataBlock,
    approvedSourcesBlock,
  };
}
