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
 * @property {string} [setupType]
 * @property {number} [setupQualityScore]      1-5
 * @property {number} [entryPrice]
 * @property {string} [entryTime]       ISO timestamp
 * @property {number} [stopLoss]
 * @property {number} [takeProfit]
 * @property {number} [plannedRisk]
 * @property {number} [actualRisk]
 * @property {number} [fees]
 * @property {ScaleOutExit[]} exits
 * @property {number} [grossPnl]
 * @property {number} [netPnl]
 * @property {number} [rMultiple]
 * @property {TradeOutcome|null} outcome        computed from netPnl
 * @property {TradeOutcome|null} [outcomeOverride]  stored separately from the computed value
 * @property {Bias4h} [bias4h]
 * @property {Structure1h} [structure1h]
 * @property {string} [pil]
 * @property {IccPhase} [iccPhase]
 * @property {MethodQualityTag[]} methodQualityTags
 * @property {MethodQualityTag[]} ruleViolations
 * @property {{path: string, uploadedAt: string}[]} screenshots   storage paths, never public URLs
 * @property {string} [entryReasoning]
 * @property {string} [exitReasoning]
 * @property {string} [lessons]
 * @property {{entering?: EmotionStage, during?: EmotionStage, exiting?: EmotionStage}} emotions
 * @property {number} [executionRating]  1-5 stars
 * @property {string} [structureInsight]
 * @property {string} [oneSentenceTakeaway]
 * @property {string} [finalReflection]
 * @property {boolean} isDraft
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

export const BIAS_LABELS = { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' };
export const STRUCTURE_LABELS = { bullish: 'Bullish', bearish: 'Bearish', mixed: 'Mixed', unconfirmed: 'Unconfirmed' };
export const PHASE_LABELS = {
  indication: 'Indication', correction: 'Correction', continuation: 'Continuation',
  retest: 'Retest', consolidation: 'Consolidation', waiting: 'Waiting',
};

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
