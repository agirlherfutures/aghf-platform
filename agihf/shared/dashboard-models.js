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
 * @typedef {Object} Trade
 * @property {string} id
 * @property {string} userId
 * @property {string} [accountId]
 * @property {string} [propFirm]
 * @property {string} [platform]
 * @property {string} symbol
 * @property {TradeDirection} direction
 * @property {number} [entryPrice]
 * @property {number} [exitPrice]
 * @property {string} entryTime         ISO timestamp
 * @property {string} [exitTime]        ISO timestamp
 * @property {number} [contracts]
 * @property {number} [grossPnl]
 * @property {number} [fees]
 * @property {number} netPnl
 * @property {number} [stopLoss]
 * @property {number} [takeProfit]
 * @property {number} [plannedRisk]
 * @property {number} [actualRisk]
 * @property {Bias4h} [bias4h]
 * @property {Structure1h} [structure1h]
 * @property {string} [pil]
 * @property {IccPhase} [iccPhase]
 * @property {string} [setupQuality]
 * @property {MethodQualityTag[]} [ruleViolations]
 * @property {string} [emotionBefore]
 * @property {string} [emotionAfter]
 * @property {string} [notes]
 * @property {string} [screenshot]      data URL or hosted URL
 * @property {'manual'|'csv'|'tradovate'|'ninjatrader'|'rithmic'} importSource
 * @property {string} savedAt           ISO timestamp
 */

/**
 * @typedef {'premarket'|'trade'|'postmarket'|'lesson'|'checkin'} JournalEntryType
 *
 * @typedef {Object} JournalEntry
 * @property {string} id
 * @property {JournalEntryType} type
 * @property {string} [lessonId]        present on 'lesson' entries (existing aghf_notes writers)
 * @property {string} [sectionId]       present on 'checkin' entries (existing aghf_notes writers)
 * @property {string} prompt
 * @property {string} text
 * @property {'match'|'revise'} [selfMark]
 * @property {string} savedAt           ISO timestamp or epoch ms (existing writers use Date.now())
 */

/**
 * @typedef {Object} PreMarketChecklistItem
 * @property {string} key
 * @property {string} label
 * @property {boolean} checked
 *
 * @typedef {Object} PreMarketPlanState
 * @property {string} date              YYYY-MM-DD
 * @property {PreMarketChecklistItem[]} items
 * @property {string} entryCondition    "what price must show before entry"
 * @property {number|null} maxRisk
 * @property {number|null} maxTrades
 * @property {string|null} completedAt  ISO timestamp once every item is checked, else null
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
