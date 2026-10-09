# AGHF Academy™ Strategy Lab: Implementation Brief (Reconstructed)

**Status:** Reconstructed specification, supplied by Dayli on 2026-10-09. It is not a verbatim copy of the original 15-part brief. The lesson titles and acceptance tests below are proposed, not recovered originals.

**Authority:** `SUPPLY_DEMAND_MASTER.md` governs every technical trading rule. `RULES_STATUS.md` records which rules are settled.

## 1. Purpose
Strategy Lab is an interactive extension of AGHF Academy. Students practise the Supply & Demand execution model powered by Higher-Timeframe ICC. The focus is chart reading, pattern recognition, decision-making and correct execution sequencing.

## 2. Academy placement
- Unlocks after Phase 5 is complete.
- Optional, with its own independent progress.
- Must not block Phase 6, Phase 7, graduation or certificates.
- Must not change existing Academy progression rules.

## 3. Structure
- Module 1: 10 lessons
- Module 2: 10 lessons
- Zone Builder: an interactive chart exercise
- Execution Lab: an interactive trade-decision simulator

## 4. Module 1: Understanding the Strategy (proposed titles)
1. Supply & Demand Through the ICC Lens
2. The 4H: Establish the Story
3. The 1H: Find the Relevant Structure
4. The 15M: First Directional Break
5. The 5M: Correction #1
6. The 5M: BOS #2
7. Correction #2: Where Zones Begin
8. Identifying the Zone-Forming Candle
9. Supply vs. Demand
10. Bringing the Full Sequence Together

## 5. Module 2: Applying the Strategy (proposed titles)
1. The Three-BOS Execution Sequence
2. Recognizing the First Correction
3. Recognizing the Second Correction
4. BOS #3: Activating the Zone
5. Waiting for the Retest
6. Executing Bullish Demand
7. Executing Bearish Supply
8. Recognizing Invalid Setups
9. Missed Trades and No-Trade Decisions
10. Full Strategy Walkthrough

## 6. Lesson design
Each lesson has:
- a short introduction
- a step-by-step chart animation
- highlighted candles and levels
- a student interaction with immediate feedback that explains why
- a final knowledge check

Never show the completed chart before students have had a chance to read the developing structure.

## 7. Charts
- Use realistic candle sequences.
- Distinguish 15M from 5M, with consistent underlying price data when switching between them.
- Labels must distinguish BOS #1, BOS #2, BOS #3, Correction #1, Correction #2, zone formation and the retest.

## 8. Zone Builder
Students select the zone-forming candle and the zone boundaries. The exercise must distinguish:
- Correction #1 from Correction #2
- the selected candle from the whole correction
- demand from supply
- a potential zone from an activated zone
- a valid zone from an invalidated zone

Boundaries use the working high-to-low definition, visibly labelled RULE REQUIRES DAYLI CONFIRMATION.

## 9. Execution Lab
A candle-by-candle decision simulator. Students:
1. read the HTF context
2. identify the 15M break
3. switch to the 5M
4. recognise Correction #1
5. identify BOS #2
6. identify Correction #2
7. mark the zone
8. wait for BOS #3
9. evaluate zone validity
10. decide whether the retest qualifies for entry

Include valid setups, incomplete setups, missed retests and no-trade outcomes.

## 10. Strategy authority
- The master document is the authority.
- No generic ICT, SMC, order-block, FVG or traditional supply-and-demand rules.
- Unsupported details are flagged, never silently invented.

## 11. Progress
- Strategy Lab has its own progress state, separate from the main curriculum.
- Lessons, the Zone Builder and the Execution Lab are each tracked.
- Progress persists when students leave and return.

## 12. Feedback
- Explain why each decision is right or wrong; never just green or red.
- When a student picks the wrong correction or enters before BOS #3, name the missing requirement.

## 13. Visual and interaction design
- Use the existing AGHF visual system, lesson navigation, progress presentation and Aristella guidance style.
- Support desktop and mobile.
- Avoid crowded labels.

## 14. Acceptance tests (proposed)

**Access and progression**
- Locked before Phase 5 is complete; unlocked after.
- Skipping it never blocks progression or graduation.
- Progress is independent.

**Curriculum**
- Both modules contain exactly 10 lessons, in the intended order.
- Each lesson can be completed and revisited.
- Progress persists.

**Chart logic**
- BOS #1 is a 15M close.
- BOS #2 and BOS #3 are 5M closes.
- Correction #1 is never the execution zone.
- Correction #2 identifies the potential zone.
- BOS #3 is required before the retest-entry model applies.
- No entry is awarded just because BOS #3 occurred.
- A missed retest is not an executed trade.

**Zone Builder**
- The correct candle can be selected.
- Wrong candles get specific feedback.
- Boundaries follow the working model.
- Unconfirmed invalidation is never shown as final.

**Execution Lab**
- No correct entry is possible before the full sequence completes.
- A valid no-trade decision is recognised.
- Wrong decisions explain the missing requirement.
- Bullish and bearish setups behave consistently.

**Regression**
- Existing lessons, graduation rules, main progress and student records are unchanged.

## 15. Build order
1. Read the master document.
2. Inspect the existing Academy structure and conventions.
3. Preserve all existing phases, lessons and progression.
4. Keep Strategy Lab optional and independently tracked.
5. Identify unconfirmed rules.
6. Implement confirmed rules first.
7. Keep provisional rules labelled.
8. Test every interactive scenario.
9. Run regression tests.
10. Report what was built, what passed, and which rules still need confirmation.
