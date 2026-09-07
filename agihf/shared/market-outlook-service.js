/**
 * market-outlook-service.js — A Girl & Her Futures™
 *
 * Data layer for the Dayli ICC Market Outlook card. No TradingView/market-
 * data integration exists anywhere in this codebase yet, so this returns
 * typed mock data with isDemo:true on every record — never presented as
 * live. The UI layer (dayli-desk-engine.js) only depends on the
 * MarketOutlookInstrument shape from dashboard-models.js, so swapping this
 * for a real webhook/API consumer later is a change to this file only.
 */

/** @returns {Promise<import('./dashboard-models.js').MarketOutlookInstrument[]>} */
export async function getMarketOutlook() {
  const now = new Date().toISOString();
  return [
    {
      symbol: 'MNQ', label: 'Micro Nasdaq',
      bias4h: 'bullish', structure1h: 'bullish', phase: 'correction',
      nearestPIL: '20,415', checkpoint15m: 'Watching for a 15M higher low',
      consolidationStatus: 'No consolidation — trending', lastUpdated: now, isDemo: true,
    },
    {
      symbol: 'GC', label: 'Gold',
      bias4h: 'neutral', structure1h: 'mixed', phase: 'consolidation',
      nearestPIL: '2,648', checkpoint15m: 'No checkpoint yet — range-bound',
      consolidationStatus: 'Consolidating inside yesterday’s range', lastUpdated: now, isDemo: true,
    },
  ];
}

/** True until a real connection is wired up — controls the "Demo Data" labeling in the UI. */
export const MARKET_OUTLOOK_IS_LIVE = false;
