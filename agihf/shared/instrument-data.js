/**
 * instrument-data.js — A Girl & Her Futures™
 *
 * Centralized point/tick value reference for supported futures
 * instruments. Point value is what a trade's P&L math multiplies against
 * (points captured × pointValue × contracts) — never a hidden per-form
 * default. Matches the static-module convention already used by
 * curriculum-data.js for reference data that rarely changes.
 *
 * A member can still type an instrument this list doesn't cover; the UI
 * falls back to a manual point-value entry and labels it as an override
 * (see journal-engine.js) rather than silently guessing a wrong value.
 */

export const INSTRUMENTS = {
  MNQ: { label: 'Micro Nasdaq-100', pointValue: 2, tickValue: 0.5, tickSize: 0.25 },
  NQ: { label: 'Nasdaq-100', pointValue: 20, tickValue: 5, tickSize: 0.25 },
  MES: { label: 'Micro S&P 500', pointValue: 5, tickValue: 1.25, tickSize: 0.25 },
  ES: { label: 'S&P 500', pointValue: 50, tickValue: 12.5, tickSize: 0.25 },
  M2K: { label: 'Micro Russell 2000', pointValue: 5, tickValue: 0.5, tickSize: 0.1 },
  RTY: { label: 'Russell 2000', pointValue: 50, tickValue: 5, tickSize: 0.1 },
  MYM: { label: 'Micro Dow', pointValue: 0.5, tickValue: 0.5, tickSize: 1 },
  YM: { label: 'Dow', pointValue: 5, tickValue: 5, tickSize: 1 },
  MGC: { label: 'Micro Gold', pointValue: 10, tickValue: 1, tickSize: 0.1 },
  GC: { label: 'Gold', pointValue: 100, tickValue: 10, tickSize: 0.1 },
};

export const INSTRUMENT_SYMBOLS = Object.keys(INSTRUMENTS);

/** @returns {{label: string, pointValue: number, tickValue: number, tickSize: number} | null} */
export function getInstrument(symbol) {
  return INSTRUMENTS[(symbol || '').toUpperCase()] || null;
}
