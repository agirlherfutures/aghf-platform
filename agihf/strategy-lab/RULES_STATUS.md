# Strategy Lab: rule status

Decided by Dayli on 2026-10-09. `SUPPLY_DEMAND_MASTER.md` is the authority for every technical rule.
Any rule below that is not **Established** shows the label **RULE REQUIRES DAYLI CONFIRMATION** wherever students see it, and nothing graded depends on it.

| # | Rule | Implementation | Status |
|---|------|----------------|--------|
| 1 | Zone boundaries | The zone-forming candle's full high-to-low range. | Working rule. Label it. |
| 2 | Zone invalidation | Price moving past the opposite boundary invalidates the setup. Wick vs candle close is **not settled**. Graded scenarios use only clear invalidations: a 5M close beyond the boundary, which is invalid under either reading. A wick-through-and-close-back-inside case may appear only as an ungraded, labelled example. | Needs confirmation |
| 3 | 15M MSS as BOS #1 | Counts only when it agrees with the higher-timeframe ICC direction. An MSS is not automatically a continuation BOS. | Proposed clarification. Label it. |
| 4 | Previous 1H swing boundaries | When price is between the previous 1H swing high and low with no meaningful directional confirmation, don't force a trade. | Established |
| 5 | Limit entry placement | Near edge: the high of a demand zone, the low of a supply zone. The master doc also documents a candle close out of the zone as an extra-confirmation entry option. | Needs confirmation. Label it. |
| 6 | Candle closes | BOS #1 needs a 15M candle close. BOS #2 and BOS #3 need qualifying 5M candle closes. | Established |
| 7 | 15M reclaim | A correction toward the original 15M break is preferred. A reclaim gives extra confirmation, but is not mandatory. | Conditional, per the master doc |
| 8 | Lower-timeframe Dayli ICC entry | Optional confluence, not required. | Per the master doc |
