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
 * @property {number} [stopLossPoints]    points away from entry, not a price level
 * @property {number} [takeProfitPoints]  points away from entry, not a price level
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
 * @property {{entering?: string[], during?: string[], exiting?: string[]}} emotions   each stage is a multi-select list of chip labels
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

/**
 * The Inner Edge — Psychology Coach data shapes (agihf/api/psychology-*.js).
 * See supabase/migrations/0003_psychology_coach.sql for the proposed
 * column-level schema these map onto (not yet applied to any live DB).
 */

/**
 * @typedef {'gentle'|'direct'|'accountability'|'teach_me'|'reset_me'} CoachingTone
 *
 * @typedef {Object} PsychologyConsent
 * @property {boolean} tradeData
 * @property {boolean} checklistAnswers
 * @property {boolean} journalStructured
 * @property {boolean} journalFreetext
 * @property {boolean} emotions
 * @property {boolean} sessionHistory
 * @property {boolean} playbook
 * @property {boolean} academyProgress
 *
 * @typedef {Object} PsychologyProfile
 * @property {string} userId
 * @property {CoachingTone} coachingTone
 * @property {boolean} personalizationEnabled
 * @property {PsychologyConsent} consent
 * @property {string|null} currentFocus         short title, e.g. "Waiting without anticipating"
 * @property {string|null} currentFocusBody
 * @property {'rules'|'member'|null} currentFocusSource   never 'ai' until Phase 3 ships
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {'talk_me_through'|'pre_trade_check'|'post_loss_reset'|'scenario'|'weekly_review'|'ask_question'} PsychologyMode
 *
 * @typedef {Object} PsychologySession
 * @property {string} id
 * @property {string} userId
 * @property {PsychologyMode} mode
 * @property {'in_progress'|'completed'|'abandoned'} status
 * @property {'save'|'one_time'} savePreference
 * @property {string} [triggerCategory]     e.g. "I want to chase" — see URGENT_SHORTCUTS
 * @property {string} [linkedTradeId]
 * @property {string} [linkedChecklistId]
 * @property {Object} structuredResponses   the answers collected during this session, mode-specific shape
 * @property {string} [readinessResult]     Pre-Trade Check only — see READINESS_LABELS
 * @property {string[]} rulesTriggered      which deterministic rules fired (see psychology-rules-engine.js)
 * @property {string} [recommendedAction]
 * @property {string} [memberSelectedAction]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [completedAt]
 */

/**
 * @typedef {Object} PsychologyPlaybookItem
 * @property {string} id
 * @property {string} userId
 * @property {string} category          one of PLAYBOOK_CATEGORIES[].key
 * @property {string} title
 * @property {string} content
 * @property {'manual'|'session'|'pattern_mirror'} sourceType
 * @property {string} [sourceRecordId]
 * @property {boolean} pinned
 * @property {boolean} isArchived
 * @property {number} sortOrder
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PsychologyScenarioAttempt
 * @property {string} id
 * @property {string} userId
 * @property {string} scenarioId        references PSYCHOLOGY_SCENARIOS[].id (static content, not a DB row)
 * @property {string} selectedResponseId
 * @property {string} [writtenReasoning]
 * @property {number} processScore      0-100, rewards process over profitable-hypothetical-outcome
 * @property {string} completedAt
 */

export const COACHING_TONES = [
  { key: 'gentle', label: 'Gentle', desc: 'Calm, reassuring, reflective.' },
  { key: 'direct', label: 'Direct', desc: 'Clear, concise, honest, firm.' },
  { key: 'accountability', label: 'Accountability', desc: 'Challenges rationalizations, redirects to your saved rules.' },
  { key: 'teach_me', label: 'Teach Me', desc: 'Explains the psychology or behavioral principle at play.' },
  { key: 'reset_me', label: 'Reset Me', desc: 'Minimal wording, immediate step-by-step regulation.' },
];

export const URGENT_SHORTCUTS = [
  'I want to chase', "I'm afraid to enter", 'I just lost', 'I want another trade',
  "I'm panicking in a trade", 'I want to move my stop', 'I exited too early',
  'I broke my rules', "I don't trust my strategy", "I'm feeling overconfident",
];

export const PLAYBOOK_CATEGORIES = [
  { key: 'common_triggers', label: 'My Common Triggers' },
  { key: 'fomo_feels_like', label: 'What FOMO Feels Like for Me' },
  { key: 'post_loss_pattern', label: 'My Post-Loss Pattern' },
  { key: 'overconfidence_signals', label: 'My Overconfidence Signals' },
  { key: 'fear_signals', label: 'My Fear Signals' },
  { key: 'walk_away_conditions', label: 'My Walk-Away Conditions' },
  { key: 'reset_routine', label: 'My Reset Routine' },
  { key: 'best_trading_state', label: 'My Best Trading State' },
  { key: 'trust_my_process', label: 'What Helps Me Trust My Process' },
  { key: 'evidence_i_follow_rules', label: 'Evidence That I Can Follow My Rules' },
  { key: 'if_then_rules', label: 'My Personal If-Then Rules' },
  { key: 'behaviors_to_repeat', label: 'Behaviors I Want to Repeat' },
  { key: 'behaviors_replacing', label: 'Behaviors I Am Replacing' },
  { key: 'weekly_focus', label: 'Current Weekly Focus' },
  { key: 'psychology_wins', label: 'Completed Psychology Wins' },
  { key: 'practice_plan', label: 'My Practice Plans' },
];

export const READINESS_LABELS = ['Clear', 'Slightly Activated', 'Emotionally Influenced', 'Pause Recommended', 'Walk-Away Condition Reached'];

/**
 * The AGHF Agent — conversational-AI data shapes (agihf/api/agent-*.js).
 * See supabase/migrations/0004_aghf_agent.sql for the proposed column-level
 * schema these map onto (not yet applied to any live DB). The 6
 * psychology_* tables/typedefs above are unchanged and back the agent's
 * contextually-launched tools (Pre-Trade Check, Post-Loss Reset, Cooldown
 * Timer, Scenario Lab, Playbook) — this is an addition, not a replacement.
 */

/**
 * @typedef {'quick_answer'|'coach_me'|'analyze_data'|'challenge_me'|'teach_me'|'build_plan'} AgentResponseMode
 *
 * @typedef {Object} AgentConversation
 * @property {string} id
 * @property {string} userId
 * @property {string|null} title
 * @property {AgentResponseMode} responseMode
 * @property {'saved'|'one_time'} saveStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [archivedAt]
 */

/**
 * @typedef {'user'|'assistant'|'system'} AgentMessageRole
 * @typedef {Object} AgentAttachedRecordRef
 * @property {'trade'|'journal'|'checklist'|'screenshot'|'week'|'date_range'} type
 * @property {string} [id]
 *
 * @typedef {Object} AgentMessage
 * @property {string} id
 * @property {string} conversationId
 * @property {string} userId
 * @property {AgentMessageRole} role
 * @property {string} content
 * @property {Object} [structuredComponentData]   belief_check/urge_check/etc. payload + the member's saved answer
 * @property {AgentAttachedRecordRef[]} attachedRecordRefs
 * @property {Object[]} toolCalls
 * @property {Object[]} toolResults
 * @property {{type:string, id:string, title:string}[]} sources
 * @property {'up'|'down'} [feedback]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AgentAttachment
 * @property {string} id
 * @property {string} userId
 * @property {string} [conversationId]
 * @property {string} [messageId]
 * @property {'trade'|'journal'|'checklist'|'screenshot'|'week'|'date_range'} type
 * @property {string} [tradeId]
 * @property {string} [journalId]
 * @property {string} [checklistId]
 * @property {string} [secureFileRef]   storage path (screenshot only) — never a public URL
 * @property {Object} metadata
 * @property {string} createdAt
 */

/**
 * @typedef {'coaching_style'|'current_focus'|'confirmed_trigger'|'walk_away_rule'|'if_then_rule'|'reset_routine'|'playbook_reference'|'confirmed_pattern'|'goal'} AgentMemoryCategory
 * @typedef {Object} AgentMemory
 * @property {string} id
 * @property {string} userId
 * @property {AgentMemoryCategory} category
 * @property {string} content
 * @property {string} [sourceConversationId]
 * @property {boolean} memberApproved
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {'create_if_then_rule'|'add_playbook_insight'|'update_current_focus'|'create_practice_plan'|'save_conversation_summary'} AgentActionType
 * @typedef {Object} AgentAction
 * @property {string} id
 * @property {string} userId
 * @property {string} [conversationId]
 * @property {AgentActionType} actionType
 * @property {Object} previewPayload
 * @property {'preview'|'approved'|'declined'|'executed'|'expired'} approvalStatus
 * @property {Object} [executionResult]
 * @property {string} createdAt
 * @property {string} [executedAt]
 */

export const COOLDOWN_DURATIONS = [
  { key: '60s', label: '60 seconds', seconds: 60 },
  { key: '2min', label: '2 minutes', seconds: 120 },
  { key: '5min', label: '5 minutes', seconds: 300 },
  { key: '15min', label: '15 minutes', seconds: 900 },
  { key: 'session', label: 'End of session', seconds: null },
];
