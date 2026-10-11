// api/_lib/market-structure.js — A Girl & Her Futures™
//
// Pure functions that turn hourly candles into the picture the Dayli Desk
// draws: swing points, the 4H/1H structure, and the PIL for each.
// No network, no clock, so it is easy to test with fixed candles.
//
// The rules, in the Academy's own words:
//   - A swing high is a candle whose high beats the candles on each side
//     of it; a swing low is the mirror. Swings alternate high, low, high.
//   - Higher highs and higher lows = uptrend. Lower highs and lower lows =
//     downtrend. Anything else = range.
//   - The PIL is the swing price must prove itself through. In an uptrend
//     that is the latest swing high, in a downtrend the latest swing low,
//     and in a range whichever edge price is closer to.
// This is a drawing aid for members' own top-down, never a signal.

/** Wall-clock parts in New York time for a unix-seconds timestamp. */
function nyParts(ts) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(ts * 1000));
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

/**
 * Groups 1H candles into the 4H candles TradingView shows for CME futures:
 * the session opens at 6 PM New York time, so the blocks are 6-10 PM,
 * 10 PM-2 AM, 2-6 AM, 6-10 AM, 10 AM-2 PM and 2-5 PM.
 */
export function toFourHour(bars) {
  const out = [];
  let key = null;
  for (const b of bars) {
    const { date, hour } = nyParts(b.t);
    // Hours from 6 PM belong to the next day's session.
    const shifted = (hour + 6) % 24;
    const sessionDate = hour >= 18 ? new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10) : date;
    const k = `${sessionDate}:${Math.floor(shifted / 4)}`;
    if (k !== key) {
      out.push({ t: b.t, o: b.o, h: b.h, l: b.l, c: b.c });
      key = k;
    } else {
      const last = out[out.length - 1];
      last.h = Math.max(last.h, b.h);
      last.l = Math.min(last.l, b.l);
      last.c = b.c;
    }
  }
  return out;
}

/** Alternating swing highs and lows, oldest first. */
export function findSwings(bars, k = 3) {
  const raw = [];
  for (let i = k; i < bars.length - k; i++) {
    const left = bars.slice(i - k, i);
    const right = bars.slice(i + 1, i + k + 1);
    const isHigh = left.every((b) => b.h < bars[i].h) && right.every((b) => b.h <= bars[i].h);
    const isLow = left.every((b) => b.l > bars[i].l) && right.every((b) => b.l >= bars[i].l);
    if (isHigh) raw.push({ type: 'high', price: bars[i].h, i, t: bars[i].t });
    if (isLow) raw.push({ type: 'low', price: bars[i].l, i, t: bars[i].t });
  }
  // Two highs (or two lows) in a row: keep the more extreme one.
  const swings = [];
  for (const s of raw) {
    const prev = swings[swings.length - 1];
    if (prev && prev.type === s.type) {
      const better = s.type === 'high' ? s.price >= prev.price : s.price <= prev.price;
      if (better) swings[swings.length - 1] = s;
    } else swings.push(s);
  }
  return swings;
}

/** Labels each swing against the previous swing of the same kind. */
function label(swings) {
  let lastHigh = null;
  let lastLow = null;
  return swings.map((s) => {
    let tag = '';
    if (s.type === 'high') {
      if (lastHigh) tag = s.price > lastHigh.price ? 'HH' : s.price < lastHigh.price ? 'LH' : 'EQH';
      lastHigh = s;
    } else {
      if (lastLow) tag = s.price > lastLow.price ? 'HL' : s.price < lastLow.price ? 'LL' : 'EQL';
      lastLow = s;
    }
    return { ...s, tag };
  });
}

/**
 * The structure of one timeframe.
 * @returns {{trend: 'up'|'down'|'range', state: string, price: number, swings: Array, pil: {price: number, from: 'high'|'low', status: 'above'|'below'} | null}}
 */
export function readStructure(bars, k = 3) {
  if (!bars.length) return null;
  const price = bars[bars.length - 1].c;
  const swings = label(findSwings(bars, k));
  const highs = swings.filter((s) => s.type === 'high');
  const lows = swings.filter((s) => s.type === 'low');
  if (highs.length < 2 || lows.length < 2) return { trend: 'range', state: 'forming', price, swings: swings.slice(-7), pil: null };

  const [h1, h2] = highs.slice(-2);
  const [l1, l2] = lows.slice(-2);
  const trend = h2.price > h1.price && l2.price > l1.price ? 'up'
    : h2.price < h1.price && l2.price < l1.price ? 'down' : 'range';
  const lastSwing = swings[swings.length - 1];

  let state;
  if (trend === 'up') {
    state = price > h2.price ? 'breaking highs'
      : price < l2.price ? 'testing the low'
      : lastSwing.type === 'high' ? 'pulling back' : 'pushing up';
  } else if (trend === 'down') {
    state = price < l2.price ? 'breaking lows'
      : price > h2.price ? 'testing the high'
      : lastSwing.type === 'low' ? 'pulling back' : 'pushing down';
  } else {
    state = price > h2.price ? 'testing the top' : price < l2.price ? 'testing the bottom' : 'inside the range';
  }

  const pilSwing = trend === 'up' ? h2
    : trend === 'down' ? l2
    : Math.abs(price - h2.price) <= Math.abs(price - l2.price) ? h2 : l2;

  return {
    trend,
    state,
    price,
    swings: swings.slice(-7).map(({ type, price: p, tag, t }) => ({ type, price: p, tag, t })),
    pil: { price: pilSwing.price, from: pilSwing.type, status: price >= pilSwing.price ? 'above' : 'below' },
  };
}

/** Both timeframes plus the PIL closest to price, from 1H candles. */
export function buildOutlook(hourBars) {
  const clean = hourBars.filter((b) => [b.o, b.h, b.l, b.c].every(Number.isFinite));
  const h1 = readStructure(clean.slice(-160), 3);
  const h4 = readStructure(toFourHour(clean).slice(-90), 2);
  if (!h1 || !h4) return null;
  const options = [
    h1.pil && { ...h1.pil, tf: '1H' },
    h4.pil && { ...h4.pil, tf: '4H' },
  ].filter(Boolean);
  const price = h1.price;
  const nearest = options.sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price))[0] || null;
  return { price, h4, h1, nearestPil: nearest, asOf: clean[clean.length - 1].t };
}
