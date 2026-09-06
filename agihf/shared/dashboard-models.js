/**
 * dashboard-models.js — A Girl & Her Futures™
 *
 * Typed data shapes for the Dayli Desk dashboard and its feature pages.
 * This is a vanilla-JS/no-build-step codebase (no TypeScript), so "typed
 * interface" here means JSDoc @typedef — documented shapes that editors
 * can still type-check against, without adding a build step or a new
 * dependency. No logic lives in this file, only shape documentation and
 * small shared enums used by the service layer + render layer.
 *
 * Every service in shared/*-service.js returns data matching these shapes
 * regardless of where the data actually comes from (localStorage today,
 * a future Supabase table later) — the UI layer (dayli-desk-engine.js)
 * only ever depends on these shapes, never on how a service is storing
 * data internally.
 */

/**
 * @typedef {'bullish'|'bearish'|'neutral'} Bias4h
 * @typedef {'bullish'|'bearish'|'mixed'|'unconfirmed'} Structure1h
 * @typedef {'indication'|'correction'|'continuation'|'retest'|'consolidation'|'waiting'} IccPhase
 *
 * @typedef {Object} MarketOutlookInstrument
 * @property {string} symbol            e.g. "MNQ", "GC"
 * @property {string} label             e.g. "Micro Nasdaq", "Gold"
 * @property {Bias4h} bias4h
 * @property {Structure1h} structure1h
 * @property {IccPhase} phase
 * @property {string} nearestPIL        human-readable, e.g. "20,415"
 * @property {string} checkpoint15m     human-readable status
 * @property {string} consolidationStatus
 * @property {string} lastUpdated       ISO timestamp
 * @property {boolean} isDemo           true until a real data source is wired up
 */

/**
 * @typedef {'high'|'medium'|'low'} ImpactLevel
 *
 * @typedef {Object} EconomicEvent
 * @property {string} id
 * @property {string} time              e.g. "10:00 AM ET"
 * @property {string} event             e.g. "ISM Manufacturing PMI"
 * @property {string} currency          e.g. "USD"
 * @property {ImpactLevel} impact
 * @property {number} minutesUntil      minutes from now, may be negative if already passed
 * @property {string[]} marketsAffected e.g. ["MNQ", "ES", "Gold"]
 * @property {boolean} isDemo
 */

/**
 * @typedef {'long'|'short'} TradeDirection
 * @typedef {'followed_plan'|'a_plus_setup'|'entered_early'|'against_bias'|'during_consolidation'|'news_proximity'|'overtraded'} MethodQualityTag
 *
 * LEGACY shapes below (Trade, JournalEntry, PreMarketPlanState) describe the
 * localStorage-only records written before the checklist/journal rebuild.
 * They're kept here only because journal-migration.js reads them once (see
 * that file) to carry existing member data into the new server-backed
 * tables — nothing new should be written in these shapes.
 *
 * @typedef {Object} Trade
 * @property {string} id
 * @property {string} symbol
 * @property {TradeDirection} direction
 * @property {number} [entryPrice]
 * @property {number} [exitPrice]
 * @property {string} entryTime
 * @property {string} [exitTime]
 * @property {number} [contracts]
 * @property {number} netPnl
 * @property {MethodQualityTag[]} [ruleViolations]
 * @property {string} [screenshot]
 * @property {'manual'|'csv'} importSource
 * @property {string} savedAt
 */

/**
 * @typedef {'premarket'|'trade'|'postmarket'|'lesson'|'checkin'} JournalEntryType
 *
 * @typedef {Object} JournalEntry
 * @property {string} id
 * @property {JournalEntryType} type
 * @property {string} [lessonId]
 * @property {string} [sectionId]
 * @property {string} prompt
 * @property {string} text
 * @property {'match'|'revise'} [selfMark]
 * @property {string} savedAt
 *
 * @typedef {Object} PreMarketPlanState
 * @property {string} date
 * @property {{key: string, label: string, checked: boolean}[]} items
 * @property {string} entryCondition
 * @property {number|null} maxRisk
 * @property {number|null} maxTrades
 * @property {string|null} completedAt
 */

/**
 * CURRENT server-backed shapes (agihf/api/journal-entries.js, checklists.js).
 *
 * @typedef {'trade'|'premarket_reflection'|'postmarket_reflection'} JournalEntryRecordType
 * @typedef {'win'|'loss'|'breakeven'} TradeOutcome
 *
 * @typedef {Object} ScaleOutExit
 * @property {number} contracts
 * @property {number} exitPrice
 * @property {string} [exitedAt]        ISO timestamp
 *
 * @typedef {Object} EmotionStage
 * @property {string} [primary]
 * @property {string[]} [secondary]
 *
 * @typedef {'yes'|'no'|'still_running'|'not_sure'} TargetHitStatus
 * @typedef {'yes'|'no'|'unsure'} AgreementAnswer
 * @typedef {'yes'|'no'|'mixed'|'unsure'} BiasAccuracyAnswer
 * @typedef {'yes'|'mostly'|'no'} RuleCheckAnswer
 * @typedef {'A+'|'A'|'A-'|'B'|'C'|'D'} ExecutionGrade
 *
 * @typedef {Object} IccMiniChecklistState
 * A 7-item self-report shown only when "Dayli ICC Setup" is tagged in Step 3
 * (Why I Entered). Deliberately a separate, simpler vocabulary from
 * ChecklistItemState/the 21-item Dayli ICC Trade Checklist tool below — it's
 * a quick in-journal self-assessment, not the same tree, just inspired by
 * the same phase language. Never auto-derived from a linked checklist_id.
 * @property {boolean} validPil
 * @property {boolean} indication
 * @property {boolean} correction
 * @property {boolean} continuation
 * @property {boolean} firstRetest
 * @property {boolean} bias4hAligned
 * @property {boolean} structure1hAligned
 *
 * @typedef {'positive'|'neutral'|'watch'} PatternInsightKind
 * @typedef {Object} PatternInsight
 * @property {string} id
 * @property {string} icon
 * @property {string} text
 * @property {PatternInsightKind} kind
 *
 * @typedef {Object} JournalEntryRecord
 * @property {string} id
 * @property {string} userId
 * @property {string} [checklistId]     links back to a TradeChecklist, if this trade came from one
 * @property {JournalEntryRecordType} entryType
 * @property {string} [prompt]          the rotating prompt shown for reflection-type entries
 * @property {string} [accountId]
 * @property {number} [tradeNumber]     assigned server-side on first save
 * @property {string} tradeDate         YYYY-MM-DD
 * @property {string} [session]
 * @property {string} [instrument]      symbol key into instrument-data.js
 * @property {TradeDirection|null} direction   null until the member actually picks one — never defaults
 * @property {number} [contracts]
 * @property {string} [executionTimeframe]     fixed '1m' per the Dayli ICC method
 * @property {string} [setupType]       doubles as the "Trade Setup / Trade Style" free-text field
 * @property {number} [entryPrice]
 * @property {string} [entryTime]       ISO timestamp
 * @property {number} [stopLoss]
 * @property {number} [takeProfit]
 * @property {number} [plannedRisk]
 * @property {number} [plannedReward]
 * @property {number} [riskRewardRatio]
 * @property {TargetHitStatus} [targetHit]   tracked separately from win/loss outcome
 * @property {number} [fees]
 * @property {ScaleOutExit[]} exits
 * @property {number} [grossPnl]
 * @property {number} [netPnl]
 * @property {number} [rMultiple]
 * @property {TradeOutcome|null} outcome        computed from netPnl
 * @property {TradeOutcome|null} [outcomeOverride]  stored separately from the computed value
 * @property {Bias4h} [bias4h]          checklist-linkage context only, not a journal input field
 * @property {Structure1h} [structure1h]        checklist-linkage context only, not a journal input field
 * @property {string} [pil]             checklist-linkage context only, not a journal input field
 * @property {IccPhase} [iccPhase]
 * @property {string[]} entryTags       "what did you see" chips — see JOURNAL_ENTRY_TAGS
 * @property {IccMiniChecklistState|null} [iccChecklist]   null = not shown this trade (see typedef above)
 * @property {string[]} exitTags        "why did you exit" chips — see EXIT_TAGS
 * @property {AgreementAnswer} [agreeWithEarlyExit]   only meaningful when exitTags includes 'Took Profit Early'
 * @property {MethodQualityTag[]} methodQualityTags
 * @property {string[]} ruleViolations  "what rule did you break" chips — see RULE_BREAK_TAGS; only meaningful when ruleCheck is 'mostly'|'no'
 * @property {{path: string, uploadedAt: string}[]} screenshots   storage paths, never public URLs
 * @property {string} [entryReasoning]  short (not essay) reasoning
 * @property {string} [exitReasoning]   short (not essay) reasoning
 * @property {string[]} lessons         bullet list ("Lesson Logged," never called "Notes")
 * @property {{entering?: EmotionStage, during?: EmotionStage, exiting?: EmotionStage}} emotions   .secondary on EmotionStage is documented but unused/unwired this pass
 * @property {BiasAccuracyAnswer} [biasAccuracy]
 * @property {RuleCheckAnswer} [ruleCheck]
 * @property {ExecutionGrade} [executionGrade]      grades execution quality, never P&L
 * @property {number} [executionScore]  0-100 composite, independent of P&L — see computeExecutionScore() in journal-engine.js
 * @property {string} [wentWell]
 * @property {string} [wouldImprove]
 * @property {boolean} isDraft
 * @property {string} [gpAwardedAt]     ISO timestamp; set once, on first non-draft save — the GP/streak dedupe guard
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ChecklistItemState
 * @property {string} key
 * @property {string} phase
 * @property {string} label
 * @property {boolean} checked
 *
 * @typedef {Object} ChecklistMarketContext
 * @property {Bias4h} [bias4h]
 * @property {Structure1h} [structure1h]
 * @property {string} [swing4h]
 * @property {string} [structureLevels1h]
 * @property {string} [pil]
 * @property {string} [targetDol]
 * @property {boolean} [newsReviewed]
 * @property {boolean} [consolidating]
 * @property {number|null} [maxRisk]
 * @property {number|null} [maxTrades]
 *
 * @typedef {Object} ChecklistState
 * @property {string} id
 * @property {string} userId
 * @property {string} [accountId]
 * @property {string} tradingDate       YYYY-MM-DD
 * @property {string} [session]
 * @property {string} instrument
 * @property {number} templateVersion
 * @property {ChecklistMarketContext} marketContext
 * @property {ChecklistItemState[]} items
 * @property {string} currentPhase      one of CHECKLIST_PHASES[].key from checklist-template.js
 * @property {number} completionPct
 * @property {string} readinessStatus
 * @property {'clean'|'wait'|'pass'|null} finalDecision
 * @property {string|null} linkedJournalEntryId
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} completedAt
 */

/**
 * @typedef {Object} ConsistencyRule
 * @property {string} key
 * @property {string} label
 * @property {boolean} passed
 * @property {boolean} applicable       false when the rule had nothing to evaluate today (e.g. no trades logged)
 *
 * @typedef {Object} ConsistencyScoreResult
 * @property {string} date
 * @property {number} scorePct          0-100, computed only over applicable rules
 * @property {ConsistencyRule[]} rules
 * @property {number} rulesPassed
 * @property {number} rulesApplicable
 */

export const METHOD_QUALITY_LABELS = {
  followed_plan: 'Followed Plan',
  a_plus_setup: 'A+ Setup',
  entered_early: 'Entered Early',
  against_bias: 'Against Bias',
  during_consolidation: 'During Consolidation',
  news_proximity: 'News Proximity',
  overtraded: 'Overtraded',
};

export const JOURNAL_ENTRY_TAGS = [
  'Higher High', 'Higher Low', 'Lower High', 'Lower Low', 'Consolidation',
  'Support / Resistance', 'Liquidity', 'Sweep', 'Market Structure Shift',
  'Breakout', 'Retest', 'Indication', 'Correction', 'Continuation',
  'Dayli ICC Setup', 'Other',
];

export const EXIT_TAGS = [
  'Take Profit Hit', 'Stop Loss Hit', 'Structure Changed', 'Took Profit Early',
  'Protected Account / Buffer', 'Trailing Stop', 'Rule-Based Exit',
  'Emotional Exit', 'Manual Close', 'Trade Invalidated', 'Other',
];

export const RULE_BREAK_TAGS = [
  'Entered early', 'Entered late', 'Chased price', 'Ignored bias', 'Ignored structure',
  'Moved stop', 'Oversized', 'Took an unnecessary extra trade', 'Revenge traded',
  'Exited emotionally', 'Broke daily loss rule', 'Other',
];

/** Larger, spec-specific option sets per mindset stage — distinct from the smaller set used before this rebuild. */
export const EMOTION_OPTIONS_V2 = {
  entering: ['Calm', 'Prepared', 'Confident', 'Aligned', 'Nervous', 'Excited', 'Impatient', 'FOMO', 'Unsure'],
  during: ['Focused', 'Calm', 'At Ease', 'Anxious', 'Watching Every Tick', 'Second Guessing', 'Tempted to Exit', 'Tempted to Move Stop', 'Overconfident'],
  exiting: ['Proud', 'Grateful', 'Calm', 'Protective', 'Relieved', 'Frustrated', 'Nervous', 'Regretful', 'Disappointed', 'Neutral'],
};

export const ICC_MINI_CHECKLIST_ITEMS = [
  ['validPil', 'Valid PIL'], ['indication', 'Indication'], ['correction', 'Correction'],
  ['continuation', 'Continuation'], ['firstRetest', 'First Retest'],
  ['bias4hAligned', '4H Bias Aligned'], ['structure1hAligned', '1H Structure Aligned'],
];

export const BIAS_LABELS = { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' };
export const STRUCTURE_LABELS = { bullish: 'Bullish', bearish: 'Bearish', mixed: 'Mixed', unconfirmed: 'Unconfirmed' };
export const PHASE_LABELS = {
  indication: 'Indication', correction: 'Correction', continuation: 'Continuation',
  retest: 'Retest', consolidation: 'Consolidation', waiting: 'Waiting',
};

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
